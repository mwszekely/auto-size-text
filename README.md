# Auto Size Text

Extremely simple library that changes an element's CSS properties to ensure its text fits within the bounds of its parent (and/or expanding it to fit).

To resize a single line of text (the kind that's forced with `white-space: nowrap`), set `toleranceBlock` to `Infinity` so that no vertical resizing is performed (as it is much slower than horizontal resizing).

To resize a paragraph of multi-line text, leave `toleranceBlock` as a number or null, and the text will adjust its `font-size` to match the height of the container without overflowing it, followed by adjusting the horizontal size of the text to fill any remaining space if requested.

The method used is compatible with both multi-line text and single-line `white-space: nowrap` text:
1. The `font-size` is adjusted until an appropriate height is found that fits the container.
2. A horizontal `transform` (or `font-stretch`, `letter-spacing`, etc.) is applied to ensure the result fits.

It is recommended to only resize a single horizontal line if you can help it &mdash; it's a good 10 times faster than resizing a paragraph of multi-line text with all the additional reflows the latter incurs.  To skip the first step, set `toleranceBlock` to `Infinity` (or `NaN`).

Note that step 1 is can and should be skipped if you're trying to force a single line of text; it is only required when resizing multi-line paragraphs into a confined space. Step 1 is extremely expensive, but step 2 is practically free.

Moderate optimizations have been performed but resize-to-fit is not a performant operation; it involves a lot of reflowing and DOM measurement. A desktop might get away with animating one of them at 60fps but certainly not on mobile. Use this with caution, if at all.

See `dist/index.html` for a few examples to play around with things in realtime, and as an example for the kind of CSS needed to achieve the effect.

This library is unlicensed into the public domain because it's probably been done plenty of times already.

## How to use

```typescript
// Resize the element's text, and watch for changes to keep resizing it.
const cleanupFunc = autoResizeToFit(options);

// When you want to unmount the element that's being auto-resized, or stop auto-resizing:
cleanupFunc();
```

Where `options` are:

|Name|Type|Description|
|-|-|-|
|`textElement`|`HTMLElement`|The element to measure and resize.|
|`containerElement`|`HTMLElement`|The parent of `textElement`, whose size the `textElement` is compared against.|
|`maxStretchInline`?|`number`|Must be >= 1; this is the widest the text is allowed to stretch to fill the available space|
|`minSquishInline`?|`number`|Must be > 0 and <= 1; this is the narrowest the text is allowed to squish to fill the available space|
|`maxStretchBlock`?|`number`|Must be >= 1; this is the tallest the text is allowed to stretch to fill the available space|
|`minSquishBlock`?|`number`|Must be > 0 and <= 1; this is the shortest the text is allowed to squish to fill the available space|
|`toleranceInline`?|`number`|The smallest difference in scale allowable between the container's width and the text's width. The closer to 0 this is, the more accurate the result, but conversely the higher this is, the faster the algorithm finishes. The default is 0.01. Set to `Infinity` to disable horizontal resizing|
|`toleranceBlock`?|`number`|Same as `toleranceInline`, but for `scrollHeight`. Set to `Infinity` to disable vertical resizing, which is a significant performance benefit.|
|`maxIterations`?|`number`|Failsafe if a value within `toleranceX` or `toleranceY` is never reached|
|`applyScale`?|`(textElement: HTMLElement, scaleInline: number, scaleBlock: number) => (void \| Promise<void>)`|The resize algorithm will call this when it's time to change the size of the element (either to measure it or to set it to its final value). By default, two CSS properties, `--text-adjust-scale-inline` and `--text-adjust-scale-block`, are directly modified on the element. If you need to do something else (e.g. if you cannot directly modify elements because you're using a UI library), override that here. This is allowed to be `async`, in which case execution is debounced while the `Promise` from the last call to `applyScale` is still unfulfilled.|
|`onRanOutOfIterations`?|`(which: "inline" \| "block") => void`|If `iterationMax` is reached, this function is called. Useful mostly for debugging if something is wrong; running out of iterations generally shouldn't happen. By default logs to the console; pass exactly `null` to disable this.|





This is the default CSS included that is required to achieve the effect:

```scss
.auto-size-text-container {
    display: grid;              /* Must be grid, flex, inline-grid, inline-flex, block flex, etc. */
    justify-content: center;    /* Matches the default transform-origin: center, if you use transform (instead of font-stretch). */
    align-items: start;         /* Must not be stretch, the default. Center could also work but doesn't look very good for multiline text */
    width: 100%;                /* The container must be the maximum size the text is allowed to be, so generally width and height are 100% */
    height: 100%;               /* ^^^ and also because if there's no width/height, we'll often just shrink down to the size of the child we're trying to measure against, which is unhelpful */
    padding: 0em;               /* Though padding and margin can make width and height 100% act weird, so adjust to each case. */
    margin: 0em;
    contain: strict;            /* Recommended both for performance reasons, and because it's usually correct -- the parent's size must not depend on the children's size for this to work. */
}

.auto-size-text-adjust {
    // These custom properties control how changes in the scale
    // affect the text.

    // --text-adjust-scale-x must affect the text's width in some way;
    // transform is good because it doesn't cause reflow, but
    // font-stretch looks nicer for fonts that support it.
    transform: scaleX(calc(var(--text-adjust-scale-x, 1) * 100%));

    // --text-adjust-scale-y must affect the text in a way that
    // causes a potential reflow, as scrollHeight is the
    // standard for measure.
    //
    // If writing-mode is set to something vertical, this should be scaleY instead.
    font-size: calc(var(--text-adjust-scale-y, 1) * 1em);

    padding: 0.25em;      /* Padding is fine */
    margin: 0em;          /* Margin is not */
}
```