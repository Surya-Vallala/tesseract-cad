# Tesseract CAD Tools

A mobile-first web app from **Tesseract Studio** for opening, measuring and lightly editing AutoCAD drawings on a phone.

Suggestions or questions: [tools@tesseractstudio.co](mailto:tools@tesseractstudio.co)

**Open the app:** https://surya-vallala.github.io/tesseract-cad/

In Chrome on Android, use the ⋮ menu and choose **Add to Home screen** (or **Install app**) to get an app icon. After the first visit the app works offline.

## What it does

- Opens **.dwg** (including AutoCAD 2018 format) and **.dxf** files: Model space and all Layouts
- Shows object and layer **transparency**, true colours, and only the current **visibility state** of dynamic blocks
- Layers: turn on and off, show all, hide all, invert
- Measure: length, area, angle and coordinates, with snapping to endpoints, midpoints, centres, geometric centres, quadrants, intersections, perpendicular and tangent (from the last point), insertion points, nodes and nearest points. Menu → Snap points switches each one on or off
- In layouts, snapping works on the model seen through viewports, and measurements inside a viewport are in real (model) size
- **Press and hold** on the drawing to place an exact point: a pointer appears just above your finger inside a round 2× magnifier, so the point is never hidden. Drag to it and lift to place it. While you hold, the line or shape you are drawing follows the pointer and the snap name and length show above the magnifier
- Edit: move, copy, rotate, mirror, scale, align, delete, undo and redo
- Properties: select objects and tap ✎ to change layer, colour (for blocks, optionally the block's contents too), linetype, linetype scale and transparency, plus rotation, scale and position (blocks), contents, height and rotation (text), and radius (circles, arcs)
- Draw order: follows the drawing's own order (AutoCAD SORTENTSTABLE); Edit → Order brings objects to front/back, above/under another object, or sends all hatches to back
- Undo/redo in the top bar; closing or opening another drawing with unsaved edits asks Save / Discard / Cancel (Save keeps an edited copy on the phone under Recent)
- **Back button:** closes whatever is on top (a panel, a dialog, the current tool), then the drawing, and returns to the home screen instead of closing the app; with unsaved edits it asks Save / Discard / Cancel first. With several tabs open it closes one drawing at a time
- **Tabs:** open up to 5 drawings at once; each keeps its own view, layers, selection and undo history
- Select similar: with something selected, pick every object of the same type on the same layer (blocks by name, hatches by pattern)
- Box select: tap two opposite corners (or drag). Left to right picks objects fully inside; right to left also picks objects crossing the box
- Draw: line, polyline, rectangle, circle, arc, spline and text, with typed input (`1200`, `@1200,0`, `@1500<90`)
- **Share** (menu → Share drawing): PDF, the original DWG, DXF (with your edits) or a PNG of the screen. PDF options: what to print (view, extents, layout sheet or a window you tap), paper size A4–A0, orientation, scale (fit or 1:1 to 1:1000), colour / grey / black lines, lineweights, hatch transparency on/off, and quality (vector, 150 or 300 dpi). **Preview** shows the page exactly as it will print before you create it. PDFs go straight to Android's share sheet; DWG and DXF are saved to the phone first, because Android lets web apps share only PDFs and pictures
- **Toolbar:** two slim rows, the View · Measure · Edit · Draw tabs and that tab's tools. With no tool running, tapping the drawing selects. When something is selected, the tab row becomes a selection row (Clear ✕) and the tools become Move, Copy, Rotate, Mirror, Scale, Delete, Properties, Similar, Order and Align
- The × on the instruction bar (or Esc) ends the tool and clears the selection, and keeps you on the same tab
- Keep recent files on the device
- Themes: Studio Dark (default), Studio Light, Black & White (menu → Theme)

Drawings are read **on the phone itself**. Files are never uploaded anywhere.

## How it's built

- One HTML page (`index.html`) with a Canvas 2D renderer; the layout gives the drawing almost the whole screen (full-screen button hides the rest)
- `cad-worker.js` parses files in a background thread. It uses
  [LibreDWG](https://www.gnu.org/software/libredwg/) compiled to WebAssembly
  (`libredwg-web.wasm`, from [@mlightcad/libredwg-web](https://github.com/mlightcad/libredwg-web) 0.7.15),
  with the initial memory reduced to 256 MB for phones
- `sw.js` adds offline caching

Source for everything is in [`source/`](source/): the app sources in `source/src/part*.{html,js}`, the worker in `worker-src.js`, the DXF reader in `dxf-parser.js`, and the build scripts in `build.sh` and `build-pages.sh`.

## Licence

LibreDWG is licensed under GPL-3.0, and this app includes it, so the app is distributed under the **GNU General Public License v3.0** (see [LICENSE](LICENSE)). LibreDWG's source is at https://git.savannah.gnu.org/cgit/libredwg.git, and the WebAssembly build's source is at https://github.com/mlightcad/libredwg-web.
