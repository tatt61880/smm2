# SMM2 Tool

Turn Super Mario Maker 2 course and maker codes in a post, a list, or a viewer URL
into links to multiple viewers.

- Website: https://tatt61880.github.io/smm2/
- Viewer reference: https://knflrpn.com/mm2/index.html

## Usage

1. Paste text containing one or more course or maker codes.
2. Choose the viewers you want. Links update immediately.
3. Open a viewer link, copy an individual code, or use **Copy codes** / **Copy URLs**
   to copy the deduplicated results, one per line.

**Show only URLs** keeps the results convenient for selecting and copying.
Viewer selections and this display option are remembered in the current browser
when local storage is available. Pasted text is not saved.

### Supported viewers

| Viewer | Courses | Makers |
| --- | --- | --- |
| [Wizulus](https://smm2.wizul.us/) | Course viewer | Maker profile |
| [SMM2 Viewer](https://www.smm2-viewer.com/) | Course viewer | Maker profile |
| [Cyzon](https://mm2list.cyzon.us/cached-view) | Cached course viewer, when available | Uncleared courses by that maker |
| [Course thumbnail](https://tgrcode.com/) | Full-course image | Not supported |

Wizulus, SMM2 Viewer, and Cyzon are selected by default. Course thumbnail is
optional and is never offered for a maker code. Unsupported selections are
explained in the results rather than generating an incorrect URL.

### Accepted input

- Standard codes: `7WC-8BR-XBG`, `XL2-72J-7GF`
- Lowercase or no hyphens: `7wc8brxbg`
- Full-width letters and digits: `７ＷＣ－８ＢＲ－ＸＢＧ`
- Common Unicode dashes: `7WC‑8BR‑XBG`, `7WC–8BR–XBG`
- Spaces or tabs between the three groups: `7WC 8BR XBG`
- Codes inside Japanese text, English text, or viewer URLs

Repeated codes are combined in first-appearance order. The result summary shows
course, maker, link, and duplicate counts separately. Separate lines are never
joined to invent a code.

The tool recognizes code-shaped text and decodes the course/maker flag. As in
the original tool, it does not validate the code checksum or confirm that the
course or maker exists. Availability is determined by the linked service.

## Privacy and external services

Text processing and link generation run entirely in your browser. No viewer
request is made until you open a link; thumbnails are links, not automatically
loaded images. Preferences are the only data this tool stores locally. Input is
rendered as text rather than HTML.

Open links one at a time to avoid unnecessary requests to the external services.
Their availability, cached data, and URL formats are outside this project's control.

## Run locally

Open `index.html` in a modern browser. There is no application build step and
there are no runtime dependencies. You can also serve the directory with any
static HTTP server.

Clipboard copying uses the browser Clipboard API, with a fallback for local
files and restricted contexts. If both are blocked, the tool reports that the
copy failed so you can select and copy the results manually.

## Development

Use Node.js 24 (matching the GitHub Pages workflow).

```sh
npm ci
npm test
npm run lint
```

`npm test` uses the built-in Node.js test runner and needs no test dependency.
It covers input normalization, code boundaries, deduplication, known course/maker
codes, viewer URLs, and unsupported viewer/type combinations. The existing lint
commands apply automatic ESLint and Stylelint fixes.

### Files and deployment

- `src/core.js`: code extraction, type decoding, and viewer definitions; also
  exports the same functions for Node.js tests.
- `src/main.js`: DOM rendering, settings, and clipboard interaction.
- `index.html` / `css/main.css`: accessible, responsive English interface.
- `tests/core.test.cjs`: behavior regression tests.

Both scripts are loaded directly from HTML using `defer`, in dependency order.
This preserves compatibility with `.github/scripts/hashfilenames.mjs`, which
rewrites HTML asset references when deploying to GitHub Pages. Do not replace
these script tags with relative JavaScript imports unless the hashing script is
also updated to rewrite those imports.

## References

Viewer routes were checked on 2026-10-25 against the services themselves:

- [KNfLrPn's viewer links](https://knflrpn.com/mm2/js/script.js?5)
- [SMM2 Viewer course and maker links](https://www.smm2-viewer.com/)
- [Cyzon cached course and maker search links](https://mm2list.cyzon.us/cached-view/7WC8BRXBG)
- [SMM2 code format](https://github.com/kinnay/NintendoClients/wiki/Data-Store-Codes#super-mario-maker-2)

The viewer implementations and assets are not bundled; this tool generates links
to those independent services.
