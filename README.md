Extremely simple library that changes an element's CSS properties to ensure its text fits within the bounds of its parent (and/or expanding it to fit).

The method used is compatible with both multi-line text and single-line `white-space: nowrap` text. First, the `font-size` (or `font-stretch`, `letter-spacing`, etc.) is adjusted until an appropriate height is found, then a horizontal `transform` is applied to ensure the result fits.

Not much optimization has been performed -- this is intended to help markup static images with specific text requirements.

See `demo.html` for a few examples to play around with things in realtime, and as an example for the kind of CSS needed to achieve the effect.

This library is unlicensed into the public domain because it's probably been done plenty of times already.