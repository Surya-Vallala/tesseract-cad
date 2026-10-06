# Tesseract CAD Tools

A mobile-first web app from **Tesseract Studio** for opening, measuring and lightly editing AutoCAD drawings on a phone.

**Open the app:** https://surya-vallala.github.io/tesseract-cad/

In Chrome on Android, use the ⋮ menu and choose **Add to Home screen** (or **Install app**) to get an app icon. After the first visit the app works offline.

## What it does

- Opens **.dwg** (including AutoCAD 2018 format) and **.dxf** files: Model space and all Layouts
- Layers: turn on and off, show all, hide all, invert
- Measure: length, area, angle and coordinates, with snapping to endpoints, midpoints, centres, intersections and nearest points
- Edit: move, copy, rotate, mirror, scale, align, delete, undo and redo
- Draw: line, polyline, rectangle, circle, arc, spline and text, with typed input (`1200`, `@1200,0`, `@1500<90`)
- Export DXF and PNG; keep recent files on the device

Drawings are read **on the phone itself**. Files are never uploaded anywhere.

## How it's built

- One HTML page (`index.html`) with a Canvas 2D renderer
- `cad-worker.js` parses files in a background thread. It uses
  [LibreDWG](https://www.gnu.org/software/libredwg/) compiled to WebAssembly
  (`libredwg-web.wasm`, from [@mlightcad/libredwg-web](https://github.com/mlightcad/libredwg-web) 0.7.15),
  with the initial memory reduced to 256 MB for phones
- `sw.js` adds offline caching

Source for everything is in [`source/`](source/): the app sources in `source/src/part*.{html,js}`, the worker in `worker-src.js`, the DXF reader in `dxf-parser.js`, and the build scripts in `build.sh` and `build-pages.sh`.

## Licence

LibreDWG is licensed under GPL-3.0, and this app includes it, so the app is distributed under the **GNU General Public License v3.0** (see [LICENSE](LICENSE)). LibreDWG's source is at https://git.savannah.gnu.org/cgit/libredwg.git, and the WebAssembly build's source is at https://github.com/mlightcad/libredwg-web.
