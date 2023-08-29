import { asyncToSync } from "async-to-sync";

export interface ResizeToFitOptions {

    /**
     * The element the resized text must fit within.
     * 
     * This element should be styled in such a way that it **does not change** relative to the contents of its children,
     * only relative to its parents. Generally this means `width: 100%`, and don't forget `white-space: nowrap` as
     * appropriate.
     */
    containerElement: HTMLElement;

    /** 
     * The element to resize. It will be measured and compared to the container element. 
     */
    textElement: HTMLElement;

    /** Must be >= 1; this is the widest the text is allowed to stretch to fill the available space */
    maxStretchInline?: number;
    /** Must be > 0 and <= 1; this is the narrowest the text is allowed to squish to fill the available space */
    minSquishInline?: number;
    /** Must be >= 1; this is the tallest the text is allowed to stretch to fill the available space */
    maxStretchBlock?: number;
    /** Must be > 0 and <= 1; this is the shortest the text is allowed to squish to fill the available space */
    minSquishBlock?: number;
    /** 
     * Measured in pixels (as in `getClientBoundingRect`).
     * 
     * Any measurement smaller than this is treated as 0.
     * 
     * Set to `Infinity` to disable horizontal resizing.
     */
    toleranceInline?: number;

    /**
     * Measured in pixels (as in `getClientBoundingRect`).
     * 
     * Any measurement smaller than this is treated as 0.
     * 
     * Set to `Infinity` to disable vertical resizing, which is a significant performance benefit.
     */
    toleranceBlock?: number;

    /** Failsafe if a value within `tolerance` is never reached */
    maxIterations?: number;

    /** 
     * The resize algorithm will call this when it's time to change the size of the element (either to measure it or to set it to its final value).
     * 
     * By default, two CSS properties, `--text-adjust-scale-inline` and `--text-adjust-scale-block`, are directly modified on the element.
     *
     * If you need to do something else (e.g. if you cannot directly modify elements because you're using a UI library), override that here.
     * 
     * This is allowed to be `async`, in which case execution is debounced while the `Promise` from the last call to `applyScale` is still unfulfilled.
     */
    applyScale: (textElement: HTMLElement, scaleInline: number, scaleBlock: number) => (void | Promise<void>) | null | undefined;

    /** 
     * If `iterationMax` is reached, this function is called.
     * 
     * Useful mostly for debugging if something is wrong; running out of iterations generally shouldn't happen.
     * 
     * By default logs to the console; pass `null` to disable this.
     */
    onRanOutOfIterations?: (which: "block" | "inline") => void;
}

export function autoResizeToFit({ containerElement, textElement, ...rest }: ResizeToFitOptions) {
    containerElement ??= textElement.parentElement || document.body;

    const { syncOutput: handler } = asyncToSync({
        asyncInput: async () => {
            await resizeToFit({ containerElement, textElement, ...rest })
        }
    });
    let resizeObserver = new ResizeObserver(handler);
    let mutationObserver = new MutationObserver(handler);

    resizeObserver.observe(containerElement, { box: "content-box" });
    mutationObserver.observe(containerElement, { attributes: true, childList: true })

    // We don't need to wait for this to complete
    const { width, height } = containerElement.getBoundingClientRect();
    resizeToFit({ containerElement, textElement, ...rest });

    return () => { resizeObserver.disconnect(); mutationObserver.disconnect(); }
}

/**
 * Applies some CSS properties to an Element in a way that ensures it fits its parent element without overflowing.
 * 
 * 
 * @param param0 @see ResizeToFitOptions
 */
export async function resizeToFit({ applyScale, containerElement, maxIterations: iterationMax, toleranceInline, toleranceBlock, maxStretchInline, maxStretchBlock, minSquishInline, minSquishBlock, textElement, onRanOutOfIterations }: ResizeToFitOptions) {

    const writingMode = window.getComputedStyle(containerElement).writingMode;
    let writingDirection: "horizontal" | "vertical" = writingMode.startsWith("horizontal-") ? "horizontal" :
        writingMode.startsWith("vertical-") ? "vertical" :
            writingMode.startsWith("sideways-") ? "vertical" :
                "vertical"

    if (onRanOutOfIterations === undefined)
        onRanOutOfIterations = (which: "block" | "inline") => { debugger; console.log(`Exceeded ${iterationMax} attempts to resize the element in the ${which} direction.`) }

    applyScale ??= async (textElement, scaleInline, scaleBlock) => {
        textElement.style.setProperty("--text-adjust-scale-inline", `${scaleInline.toFixed(5)}`);
        textElement.style.setProperty("--text-adjust-scale-block", `${scaleBlock.toFixed(5)}`);
    };

    const containerSize = containerElement.getBoundingClientRect();
    const containerSizeInline = (writingDirection == "horizontal"? containerSize.width : containerSize.height);
    const containerSizeBlock = (writingDirection == "horizontal"? containerSize.height : containerSize.width);

    toleranceInline ??= 0.01;
    toleranceBlock ??= 0.01;

    iterationMax ??= 20;
    let iterationsLeft = iterationMax;
    minSquishInline ??= 0;
    maxStretchInline ??= 1;
    minSquishBlock ??= 0;
    maxStretchBlock ??= 10;

    let foundInline = false;
    let foundBlock = false;

    let currentScaleInline = 1;
    let currentScaleBlock = 1;

    let prevScaleInline = Infinity;
    let prevScaleBlock = Infinity;
    // If we run out of iterations, and the last currentScale we measured was too big,
    // then currentScale wouldn't be an appropriate return value. So until we find
    // a currentScale that's within the tolerance, we keep track of the last one
    // we found that's within the bounds of the container, and return that
    // (again, only if we run out of iterations before reaching tolerance)
    let fallbackScaleInline = minSquishInline || 0;
    let fallbackScaleBlock = minSquishBlock || 0;

    while (iterationsLeft >= 0 && !foundBlock) {
        if (!isFinite(toleranceBlock)) {
            fallbackScaleBlock = 1; // Infinity means "do not adjust"; bail out immediately
            break;
        }

        if (Math.abs(prevScaleBlock - currentScaleBlock) < toleranceBlock) {
            // We've converged on a value (generally when we hit the highest/lowest possible point).
            // Quit now, because otherwise we'll just keep repeating this value.
            break;
        }

        // This doesn't happen at the end of the loop because we need to start the loop with a reflow anyway; there might be old transforms still applied.
        await applyScale(textElement, currentScaleInline, currentScaleBlock);
        forceReflow(textElement);
        --iterationsLeft;

        prevScaleBlock = currentScaleBlock;
        let textSizeBlock = (writingDirection == "horizontal" ? textElement.scrollHeight : textElement.scrollWidth) || 0;
        let differenceBlock = textSizeBlock / containerSizeBlock;
        if (differenceBlock > 1) {
            // The text is taller than the container.
            // This is never an acceptable value to stop on, we must shrink it.
            // Set the maximum value we're allowed to scale to to be this value,
            // and try again with a new guess based on that..
            maxStretchBlock = currentScaleBlock;
            currentScaleBlock = (maxStretchBlock + minSquishBlock) / 2;
        }
        else {
            // The text is shorter than the container.
            // This might be a valid value, save it for later
            fallbackScaleBlock = Math.max(fallbackScaleBlock || 0, currentScaleBlock);

            // But back to the text being too short.
            // We know that anything smaller than currentScale would be too small,
            // so set that as the minimum we're allowed to guess and guess again.
            fallbackScaleBlock = minSquishBlock = currentScaleBlock;
            currentScaleBlock = (maxStretchBlock + minSquishBlock) / 2;
        }
    }


    if (iterationsLeft <= 0 && onRanOutOfIterations) {
        onRanOutOfIterations("block");
    }
    iterationsLeft = iterationMax;
    while (iterationsLeft >= 0 && !foundInline) {
        if (!isFinite(toleranceInline)) {
            fallbackScaleInline = 1; // Infinity means "do not adjust"; bail out immediately
            break;
        }

        if (Math.abs(prevScaleInline - currentScaleInline) < toleranceInline) {
            // We've converged on a value (generally when we hit the highest/lowest possible point).
            // Quit now, because otherwise we'll just keep repeating this value.
            break;
        }

        // This doesn't happen at the end of the loop because we need to start the loop with a reflow anyway; there might be old transforms still applied.
        await applyScale(textElement, currentScaleInline, currentScaleBlock);
        forceReflow(textElement);
        --iterationsLeft;

        prevScaleInline = currentScaleInline;
        let clientRect = textElement.getBoundingClientRect()
        let textSizeInline = (writingDirection == "horizontal" ? clientRect.width : clientRect.height) || 0;
        let differenceInline = textSizeInline / containerSizeInline;
        if (differenceInline > 1) {
            // The text is wider than the container.
            // This is never an acceptable value to stop on, we must shrink it.
            // Set the maximum value we're allowed to scale to to be this value,
            // and try again with a new guess based on that..
            maxStretchInline = currentScaleInline;
            currentScaleInline = (maxStretchInline + minSquishInline) / 2;
        }
        else {
            // The text is narrower than the container.
            // This might be a valid value, save it for later
            fallbackScaleInline = Math.max(fallbackScaleInline || 0, currentScaleInline);

            // But back to the text being too narrow.
            // We know that anything smaller than currentScale would be too small,
            // so set that as the minimum we're allowed to guess and guess again.
            fallbackScaleInline = minSquishInline = currentScaleInline;
            currentScaleInline = (maxStretchInline + minSquishInline) / 2;
        }
    }

    if (iterationsLeft <= 0 && onRanOutOfIterations) {
        onRanOutOfIterations("inline");
    }

    await applyScale(textElement, fallbackScaleInline, fallbackScaleBlock);
    forceReflow(textElement);

}


function forceReflow<E extends HTMLElement>(e: E) {
    // This actually doesn't seem to be needed?
    // It seems the times that we do our measuring properly reflow for us at the times we need,
    // so this is redundant
    return;

    // Try really hard to make sure this isn't optimized out by anything.
    // We need it for its document reflow side effect.
    /*const p = (globalThis as any)._dummy;
    (globalThis as any)._dummy = e.getBoundingClientRect();
    (globalThis as any)._dummy = e.style.opacity;
    (globalThis as any)._dummy = e.style.transform;
    (globalThis as any)._dummy = p;
    return e;*/
}