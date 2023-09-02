import { Nullable } from "preact-prop-helpers";
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
    /**
     * Must be >= 1; this is the widest the text is allowed to stretch to fill the available space
     * @default 1
     */
    maxStretchInline?: Nullable<number>;
    /**
     * Must be >= 0 and <= 1; this is the narrowest the text is allowed to squish to fill the available space
     * @default 0
     */
    minSquishInline?: Nullable<number>;
    /**
     * Must be >= 1; this is the tallest the text is allowed to stretch to fill the available space
     * @default 10
     */
    maxStretchBlock?: Nullable<number>;
    /**
     * Must be >= 0 and <= 1; this is the shortest the text is allowed to squish to fill the available space
     * @default 0
     */
    minSquishBlock?: Nullable<number>;
    /**
     * Measured in pixels (as in `getClientBoundingRect`).
     *
     * Any measurement smaller than this is treated as 0.
     *
     * Set to `Infinity` to disable horizontal resizing.
     *
     * @default 0.01
     */
    toleranceInline?: Nullable<number>;
    /**
     * Measured in pixels (as in `getClientBoundingRect`).
     *
     * Any measurement smaller than this is treated as 0.
     *
     * Set to `Infinity` to disable vertical resizing, which is a significant performance benefit.
     *
     * @default 0.01
     */
    toleranceBlock?: Nullable<number>;
    /**
     * Failsafe if a value within `tolerance` is never reached
     *
     * @default 20
     */
    maxIterations?: Nullable<number>;
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
    onRanOutOfIterations?: Nullable<(which: "block" | "inline") => void>;
}
/**
 * Applies some CSS properties to an Element in a way that ensures it fits its parent element without overflowing.
 *
 *
 * @param param0 @see ResizeToFitOptions
 */
export declare function resizeToFit({ applyScale, containerElement, maxIterations: iterationMax, toleranceInline, toleranceBlock, maxStretchInline, maxStretchBlock, minSquishInline, minSquishBlock, textElement, onRanOutOfIterations }: ResizeToFitOptions): Promise<void>;
//# sourceMappingURL=resize-to-fit.d.ts.map