import { createElement, forwardRef, useImperativeProps, useLayoutEffect, useMergedProps, usePropsOnChildren, useRefElement, useStableCallback } from "preact-prop-helpers";
import { autoResizeToFit } from "./auto-resize-to-fit.js";
export const AutoResize = forwardRef(function AutoResize({ children, maxIterations, maxStretchBlock, maxStretchInline, minSquishBlock, minSquishInline, onRanOutOfIterations, toleranceBlock, toleranceInline, TagContainer, TagText, cssPropBlock, cssPropInline, ...propsContainer }, ref) {
    const { propsStable: propsRefElementContainer, refElementReturn: { getElement: getContainerElement } } = useRefElement({ refElementParameters: {} });
    const { propsStable: propsRefElementText, refElementReturn: { getElement: getTextElement } } = useRefElement({ refElementParameters: {} });
    const { props: propsImperativeHandle, imperativePropsReturn } = useImperativeProps({
        refElementReturn: { getElement: getContainerElement }
    });
    const applyScale = useStableCallback((element, scaleInline, scaleBlock) => {
        imperativePropsReturn.setStyle((cssPropInline || "--text-adjust-scale-inline"), scaleInline);
        imperativePropsReturn.setStyle((cssPropBlock || "--text-adjust-scale-block"), scaleBlock);
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
    return createElement((TagContainer || "span"), useMergedProps(propsRefElementContainer, {
        ...propsContainer,
        children: usePropsOnChildren(children, useMergedProps(propsRefElementText, propsImperativeHandle), ref, TagText || "span")
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbXBvbmVudC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUF1QyxhQUFhLEVBQUUsVUFBVSxFQUFFLGtCQUFrQixFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDaE4sT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRzFELE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsU0FBUyxVQUFVLENBQUMsRUFDckQsUUFBUSxFQUNSLGFBQWEsRUFDYixlQUFlLEVBQ2YsZ0JBQWdCLEVBQ2hCLGNBQWMsRUFDZCxlQUFlLEVBQ2Ysb0JBQW9CLEVBQ3BCLGNBQWMsRUFDZCxlQUFlLEVBQ2YsWUFBWSxFQUNaLE9BQU8sRUFDUCxZQUFZLEVBQ1osYUFBYSxFQUNiLEdBQUcsY0FBYyxFQUNrUSxFQUFFLEdBQWE7SUFDbFMsTUFBTSxFQUFFLFdBQVcsRUFBRSx3QkFBd0IsRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxFQUFFLEdBQUcsYUFBYSxDQUFNLEVBQUUsb0JBQW9CLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMxSixNQUFNLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFFLGdCQUFnQixFQUFFLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxFQUFFLEdBQUcsYUFBYSxDQUFNLEVBQUUsb0JBQW9CLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUMvSSxNQUFNLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLEdBQUcsa0JBQWtCLENBQUM7UUFDL0UsZ0JBQWdCLEVBQUUsRUFBRSxVQUFVLEVBQUUsbUJBQW1CLEVBQUU7S0FDeEQsQ0FBQyxDQUFDO0lBRUgsTUFBTSxVQUFVLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxPQUFvQixFQUFFLFdBQW1CLEVBQUUsVUFBa0IsRUFBRSxFQUFFO1FBQ25HLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDLGFBQWEsSUFBSSw0QkFBNEIsQ0FBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3RHLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDLFlBQVksSUFBSSwyQkFBMkIsQ0FBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3ZHLENBQUMsQ0FBQyxDQUFDO0lBRUgsZUFBZSxDQUFDLEdBQUcsRUFBRTtRQUNqQixNQUFNLE9BQU8sR0FBRyxlQUFlLENBQUM7WUFDNUIsVUFBVTtZQUNWLGdCQUFnQixFQUFFLG1CQUFtQixFQUFFO1lBQ3ZDLFdBQVcsRUFBRSxjQUFjLEVBQUU7WUFDN0IsYUFBYTtZQUNiLGVBQWU7WUFDZixnQkFBZ0I7WUFDaEIsY0FBYztZQUNkLGVBQWU7WUFDZixvQkFBb0I7WUFDcEIsY0FBYztZQUNkLGVBQWU7U0FDbEIsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRVAsT0FBTyxhQUFhLENBQUMsQ0FBQyxZQUFZLElBQUksTUFBTSxDQUFVLEVBQUUsY0FBYyxDQUNsRSx3QkFBd0IsRUFDeEI7UUFDSSxHQUFHLGNBQWM7UUFDakIsUUFBUSxFQUFFLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsRUFBRSxHQUFHLEVBQUUsT0FBTyxJQUFJLE1BQU0sQ0FBQztLQUM3SCxDQUFDLENBQUMsQ0FBQztBQUNaLENBQUMsQ0FBQyxDQUFBIn0=