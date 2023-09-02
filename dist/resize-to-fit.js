/**
 * Applies some CSS properties to an Element in a way that ensures it fits its parent element without overflowing.
 *
 *
 * @param param0 @see ResizeToFitOptions
 */
export async function resizeToFit({ applyScale, containerElement, maxIterations: iterationMax, toleranceInline, toleranceBlock, maxStretchInline, maxStretchBlock, minSquishInline, minSquishBlock, textElement, onRanOutOfIterations }) {
    const writingMode = window.getComputedStyle(containerElement).writingMode;
    let writingDirection = writingMode.startsWith("horizontal-") ? "horizontal" :
        writingMode.startsWith("vertical-") ? "vertical" :
            writingMode.startsWith("sideways-") ? "vertical" :
                "vertical";
    if (onRanOutOfIterations === undefined)
        onRanOutOfIterations = (which) => { debugger; console.log(`Exceeded ${iterationMax} attempts to resize the element in the ${which} direction.`); };
    applyScale ??= async (textElement, scaleInline, scaleBlock) => {
        textElement.style.setProperty("--text-adjust-scale-inline", `${scaleInline.toFixed(5)}`);
        textElement.style.setProperty("--text-adjust-scale-block", `${scaleBlock.toFixed(5)}`);
    };
    const containerSize = containerElement.getBoundingClientRect();
    const containerSizeInline = (writingDirection == "horizontal" ? containerSize.width : containerSize.height);
    const containerSizeBlock = (writingDirection == "horizontal" ? containerSize.height : containerSize.width);
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
        let clientRect = textElement.getBoundingClientRect();
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
function forceReflow(e) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzaXplLXRvLWZpdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXNpemUtdG8tZml0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUEwRkE7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsS0FBSyxVQUFVLFdBQVcsQ0FBQyxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUUsZUFBZSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsV0FBVyxFQUFFLG9CQUFvQixFQUFzQjtJQUV2UCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxXQUFXLENBQUM7SUFDMUUsSUFBSSxnQkFBZ0IsR0FBOEIsV0FBVyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDcEcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDOUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQzlDLFVBQVUsQ0FBQTtJQUV0QixJQUFJLG9CQUFvQixLQUFLLFNBQVM7UUFDbEMsb0JBQW9CLEdBQUcsQ0FBQyxLQUF5QixFQUFFLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksWUFBWSwwQ0FBMEMsS0FBSyxhQUFhLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQTtJQUV6SyxVQUFVLEtBQUssS0FBSyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLEVBQUU7UUFDMUQsV0FBVyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMs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