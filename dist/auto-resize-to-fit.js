import { asyncToSync } from "async-to-sync";
import { resizeToFit } from "./resize-to-fit.js";
export function autoResizeToFit({ containerElement, textElement, ...rest }) {
    containerElement ??= textElement.parentElement || document.body;
    const { syncOutput: handler } = asyncToSync({
        asyncInput: async () => {
            await resizeToFit({ containerElement, textElement, ...rest });
        }
    });
    let resizeObserver = new ResizeObserver(handler);
    let mutationObserver = new MutationObserver(handler);
    resizeObserver.observe(containerElement, { box: "content-box" });
    mutationObserver.observe(containerElement, { attributes: true, childList: true });
    // We don't need to wait for this to complete
    const { width, height } = containerElement.getBoundingClientRect();
    resizeToFit({ containerElement, textElement, ...rest });
    return () => { resizeObserver.disconnect(); mutationObserver.disconnect(); };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1yZXNpemUtdG8tZml0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2F1dG8tcmVzaXplLXRvLWZpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBc0IsV0FBVyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFJckUsTUFBTSxVQUFVLGVBQWUsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksRUFBc0I7SUFDMUYsZ0JBQWdCLEtBQUssV0FBVyxDQUFDLGFBQWEsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDO0lBRWhFLE1BQU0sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLEdBQUcsV0FBVyxDQUFDO1FBQ3hDLFVBQVUsRUFBRSxLQUFLLElBQUksRUFBRTtZQUNuQixNQUFNLFdBQVcsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbEUsQ0FBQztLQUNKLENBQUMsQ0FBQztJQUNILElBQUksY0FBYyxHQUFHLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2pELElBQUksZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVyRCxjQUFjLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUM7SUFDakUsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUVsRiw2Q0FBNkM7SUFDN0MsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0lBQ25FLFdBQVcsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksRUFBRSxDQUFDLENBQUM7SUFFeEQsT0FBTyxHQUFHLEVBQUUsR0FBRyxjQUFjLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRixDQUFDIn0=