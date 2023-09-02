import { JSX, Nullable, Ref, RenderableProps, createElement, forwardRef, useImperativeProps, useLayoutEffect, useMergedProps, usePropsOnChildren, useRefElement, useStableCallback } from "preact-prop-helpers";
import { autoResizeToFit } from "./auto-resize-to-fit.js";
import { ResizeToFitOptions } from "./resize-to-fit.js";

export const AutoResize = forwardRef(function AutoResize({
    children,
    maxIterations,
    maxStretchBlock,
    maxStretchInline,
    minSquishBlock,
    minSquishInline,
    onRanOutOfIterations,
    toleranceBlock,
    toleranceInline,
    TagContainer,
    TagText,
    cssPropBlock,
    cssPropInline,
    ...propsContainer
}: Omit<ResizeToFitOptions, "applyScale" | "containerElement" | "textElement"> & { cssPropInline?: string, cssPropBlock?: string, TagContainer?: Nullable<keyof JSX.IntrinsicElements>, TagText?: Nullable<keyof JSX.IntrinsicElements>, children?: RenderableProps<any>["children"]; }, ref: Ref<any>) {
    const { propsStable: propsRefElementContainer, refElementReturn: { getElement: getContainerElement } } = useRefElement<any>({ refElementParameters: {} });
    const { propsStable: propsRefElementText, refElementReturn: { getElement: getTextElement } } = useRefElement<any>({ refElementParameters: {} })
    const { props: propsImperativeHandle, imperativePropsReturn } = useImperativeProps({
        refElementReturn: { getElement: getContainerElement }
    });

    const applyScale = useStableCallback((element: HTMLElement, scaleInline: number, scaleBlock: number) => {
        imperativePropsReturn.setStyle((cssPropInline || "--text-adjust-scale-inline") as never, scaleInline);
        imperativePropsReturn.setStyle((cssPropBlock || "--text-adjust-scale-block") as never, scaleBlock);
    });

    useLayoutEffect(() => {
        const cleanup = autoResizeToFit({
            applyScale,
            containerElement: getContainerElement(),
            textElement: getTextElement(),
            maxIterations,
            maxStretchBlock,
            maxStretchInline,
            minSquishBlock,
            minSquishInline,
            onRanOutOfIterations,
            toleranceBlock,
            toleranceInline
        });
        return cleanup;
    }, []);

    return createElement((TagContainer || "span") as never, useMergedProps(
        propsRefElementContainer,
        {
            ...propsContainer,
            children: usePropsOnChildren(children, useMergedProps(propsRefElementText, propsImperativeHandle), ref, TagText || "span")
        }));
})