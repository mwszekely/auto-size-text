import { asyncToSync } from "async-to-sync";
export function autoResizeToFit({ containerElement, textElement, ...rest }) {
    containerElement ??= textElement.parentElement || document.body;
    const { syncOutput: handler } = asyncToSync({
        asyncInput: async () => {
            const { width, height } = containerElement.getBoundingClientRect();
            await resizeToFit({ containerWidth: width, containerHeight: containerElement.offsetHeight, textElement, ...rest });
        }
    });
    let resizeObserver = new ResizeObserver(handler);
    let mutationObserver = new MutationObserver(handler);
    resizeObserver.observe(containerElement, { box: "device-pixel-content-box" });
    mutationObserver.observe(containerElement, { attributes: true, childList: true });
    // We don't need to wait for this to complete
    const { width, height } = containerElement.getBoundingClientRect();
    resizeToFit({ containerWidth: width, containerHeight: containerElement.offsetHeight, textElement, ...rest });
    return () => { resizeObserver.disconnect(); mutationObserver.disconnect(); };
}
/**
 * Applies some CSS properties to an Element in a way that ensures it fits its parent element without overflowing.
 *
 *
 * @param param0 @see ResizeToFitOptions
 */
export async function resizeToFit({ applyScale, containerWidth, containerHeight, maxIterations: iterationMax, tolerance, maxStretchX, maxStretchY, minSquishX, minSquishY, textElement, onRanOutOfIterations }) {
    applyScale ??= async (textElement, scaleX, scaleY) => {
        textElement.style.setProperty("--text-adjust-scale-x", `${scaleX.toFixed(5)}`);
        textElement.style.setProperty("--text-adjust-scale-y", `${scaleY.toFixed(5)}`);
    };
    tolerance ??= 0.001;
    let seenX = new Set();
    let seenY = new Set();
    iterationMax ??= 100;
    let iterationsLeft = iterationMax;
    minSquishX ??= 0;
    maxStretchX ??= 1;
    minSquishY ??= 0;
    maxStretchY ??= 100;
    let foundX = false;
    let foundY = false;
    let currentScaleX = 1;
    let currentScaleY = 1;
    // If we run out of iterations, and the last currentScale we measured was too big,
    // then currentScale wouldn't be an appropriate return value. So until we find
    // a currentScale that's within the tolerance, we keep track of the last one
    // we found that's within the bounds of the container, and return that
    // (again, only if we run out of iterations before reaching tolerance)
    let fallbackScaleX = null;
    let fallbackScaleY = null;
    // An old transform might still be applied, so before we start measuring, make sure we reset to 1.
    await applyScale(textElement, currentScaleX, currentScaleY);
    forceReflow(textElement);
    while (iterationsLeft >= 0 && !foundY) {
        if (seenY.has(currentScaleY)) {
            // We're stuck in an infinite loop
            // so we'll just cut this short right here and now.
            // (TODO: Optimize the set checks)
            iterationsLeft = 0;
            break;
        }
        seenY.add(currentScaleY);
        let textHeight = textElement.scrollHeight || 0;
        let differenceY = textHeight / containerHeight;
        if (differenceY > 1) {
            maxStretchY = currentScaleY;
            currentScaleY = (maxStretchY + minSquishY) / 2;
        }
        else {
            // The text is narrower than the container.
            // If we're within the tolerance, then we're done!
            if (Math.abs(differenceY - 1) <= tolerance) {
                fallbackScaleY = null;
                foundY = true;
            }
            else {
                // The text is too narrow.
                // We know that currentScale is too small, and we never need to try it again
                // (well, we'll fall back to it if we run out of iterations before reaching our tolerance or another closer and still-too-narrow value)
                fallbackScaleY = minSquishY = currentScaleY;
                currentScaleY = (maxStretchY + minSquishY) / 2;
            }
        }
        await applyScale(textElement, currentScaleX, currentScaleY);
        forceReflow(textElement);
        --iterationsLeft;
    }
    if (iterationsLeft && onRanOutOfIterations) {
        onRanOutOfIterations("y");
    }
    iterationsLeft = iterationMax;
    while (iterationsLeft >= 0 && !foundX) {
        if (seenX.has(currentScaleX)) {
            // We're stuck in an infinite loop
            // so we'll just cut this short right here and now.
            // (TODO: Optimize the set checks)
            iterationsLeft = 0;
            break;
        }
        seenX.add(currentScaleX);
        let textWidth = textElement.getBoundingClientRect().width || 0;
        let differenceX = textWidth / containerWidth;
        if (differenceX > 1) {
            // The text is too wide.
            // We know that currentScale is too large, and we never need to try it again
            maxStretchX = currentScaleX;
            currentScaleX = (maxStretchX + minSquishX) / 2;
        }
        else {
            // The text is narrower than the container.
            // If we're within the tolerance, then we're done!
            if (Math.abs(differenceX - 1) <= tolerance) {
                fallbackScaleX = null;
                foundX = true;
            }
            else {
                // The text is too narrow.
                // We know that currentScale is too small, and we never need to try it again
                // (well, we'll fall back to it if we run out of iterations before reaching our tolerance or another closer and still-too-narrow value)
                fallbackScaleX = minSquishX = currentScaleX;
                currentScaleX = (maxStretchX + minSquishX) / 2;
            }
        }
        await applyScale(textElement, currentScaleX, currentScaleY);
        forceReflow(textElement);
        --iterationsLeft;
    }
    if (iterationsLeft && onRanOutOfIterations) {
        onRanOutOfIterations("x");
    }
    if (fallbackScaleX != null || fallbackScaleY != null) {
        await applyScale(textElement, fallbackScaleX || currentScaleX, fallbackScaleY || currentScaleY);
        forceReflow(textElement);
    }
}
function forceReflow(e) {
    // return;
    // Try really hard to make sure this isn't optimized out by anything.
    // We need it for its document reflow side effect.
    const p = globalThis._dummy;
    globalThis._dummy = e.getBoundingClientRect();
    globalThis._dummy = e.style.opacity;
    globalThis._dummy = e.style.transform;
    globalThis._dummy = p;
    return e;
}
//# sourceMappingURL=index.js.map