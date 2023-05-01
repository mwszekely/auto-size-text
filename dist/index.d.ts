export interface ResizeToFitOptions {
    /** The width of the container, as measured by `element.getBoundingClientRect().width` */
    containerWidth: number;
    /** The height of the container, as measured by element.scrollHeight */
    containerHeight: number;
    /** The element to resize */
    textElement: HTMLElement;
    maxStretchX?: number;
    minSquishX?: number;
    maxStretchY?: number;
    minSquishY?: number;
    /** Measured in pixels (as in `getClientBoundingRect`) */
    tolerance?: number;
    /** Failsafe if a value within `tolerance` is never reached */
    maxIterations?: number;
    /**
     * By default, two CSS properties, `--text-adjust-scale-x` and `--text-adjust-scale-y`, are directly modified on the element.
     *
     * If you need to do something else, override that here.
     */
    applyScale?: (textElement: HTMLElement, scaleX: number, scaleY: number) => (void | Promise<void>);
    /**
     * If `iterationMax` is reached, this function is called.
     *
     * Useful mostly for debugging if something is wrong.
     */
    onRanOutOfIterations?: (which: "x" | "y") => void;
}
export declare function autoResizeToFit({ containerElement, textElement, ...rest }: Omit<ResizeToFitOptions, "containerWidth" | "containerHeight"> & {
    containerElement?: HTMLElement;
}): () => void;
/**
 * Applies some CSS properties to an Element in a way that ensures it fits its parent element without overflowing.
 *
 *
 * @param param0 @see ResizeToFitOptions
 */
export declare function resizeToFit({ applyScale, containerWidth, containerHeight, maxIterations: iterationMax, tolerance, maxStretchX, maxStretchY, minSquishX, minSquishY, textElement, onRanOutOfIterations }: ResizeToFitOptions): Promise<void>;
//# sourceMappingURL=index.d.ts.map