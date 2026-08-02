# Third-Party Notices

SplitApp bundles or references the third-party assets below. Their licences
permit commercial use and redistribution, but several require that the
copyright notice travel with the distribution — which is what this file is for.

Runtime npm dependencies (React, React Router, Supabase JS) are not restated
here; their licences ship inside `node_modules` and are reproduced by any
standard licence-collection tool.

---

## Icon: `public/dumbbell.svg` (and the icons derived from it)

**Derived from the `dumbbell` glyph in [Lucide](https://lucide.dev), which is
itself a fork of [Feather](https://feathericons.com).**

The SVG path data matches Lucide's `dumbbell` glyph. Only the stroke width
(2.2 rather than 2) and a hardcoded brand colour differ.

These files are affected:

- `public/dumbbell.svg` — favicon (`index.html`) and the in-app wordmark
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/icon-maskable-512.png`
- `public/icons/apple-touch-icon.png`

Lucide is distributed under the **ISC License**:

```
ISC License

Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part
of Feather (MIT). All other copyright (c) for Lucide are held by Lucide
Contributors 2022.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
```

> **Note for anyone acquiring this project.** The ISC licence permits
> commercial use and resale, but it does **not** grant exclusivity: this mark
> is freely available to anyone, including competitors. If an exclusive brand
> identity matters, commission an original logo and regenerate
> `public/dumbbell.svg`, the `public/icons/*` set, and the wordmark references
> in `index.html` and `src/pages/Login.jsx`.

---

## Fonts

Loaded at runtime from Google Fonts (see the `<link>` tags in `index.html`);
no font binaries are committed to this repository.

| Family | Licence |
| --- | --- |
| Anton | SIL Open Font License 1.1 |
| Barlow | SIL Open Font License 1.1 |
| Barlow Condensed | SIL Open Font License 1.1 |
| JetBrains Mono | SIL Open Font License 1.1 |

The SIL OFL 1.1 permits commercial use, embedding and redistribution. It does
not permit selling the fonts on their own, which this project does not do.

---

## Exercise and split content

The exercise names, descriptions, muscle-group groupings and split programmes
in `src/data/exercises.js` and `src/data/splits.js` are original prose written
for this project. Exercise *names* themselves (bench press, deadlift) are
generic terms and are not subject to copyright.
