import { asyncToSync } from "async-to-sync";
import { ResizeToFitOptions, resizeToFit } from "./resize-to-fit.js";



export function autoResizeToFit({ containerElement, textElement, ...rest }: ResizeToFitOptions) {
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
