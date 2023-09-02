import { JSX, Nullable, Ref, RenderableProps } from "preact-prop-helpers";
import { ResizeToFitOptions } from "./resize-to-fit.js";
export declare const AutoResize: import("preact").FunctionalComponent<Omit<Omit<ResizeToFitOptions, "applyScale" | "containerElement" | "textElement"> & {
    cssPropInline?: string;
    cssPropBlock?: string;
    TagContainer?: Nullable<keyof JSX.IntrinsicElements>;
    TagText?: Nullable<keyof JSX.IntrinsicElements>;
    children?: RenderableProps<any>["children"];
}, "ref"> & {
    ref?: Ref<any>;
}>;
//# sourceMappingURL=component.d.ts.map