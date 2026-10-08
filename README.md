# Tesseract CAD Tools

A mobile-first web app from **Tesseract Studio** for opening, measuring and lightly editing AutoCAD drawings on a phone.

Suggestions or questions: [tools@tesseractstudio.co](mailto:tools@tesseractstudio.co)

**Open the app:** https://surya-vallala.github.io/tesseract-cad/

In Chrome on Android, use the ⋮ menu and choose **Add to Home screen** (or **Install app**) to get an app icon. After the first visit the app works offline.

## What it does

- Opens **.dwg** (including AutoCAD 2018 format) and **.dxf** files: Model space and all Layouts
- Shows object and layer **transparency**, true colours, and only the current **visibility state** of dynamic blocks
- Layers: turn on and off, show all, hide all, invert. **Layer** tools: Layer list, New layer (name and colour), Make current (tap an object), Layer off (tap objects), Off others (keep only the layers of what you tap), All on, and Previous (undo the last layer change)
- **Live measurements:** distances show drawing-style dimensions on the drawing (extension lines, ticks, the value on the line), areas show every side, the area and the perimeter, angles show the arc and degrees, coordinates show a label. Every measured point has a handle: press it and drag (the magnifier shows the point, snapping works) and the numbers update as you move
- **Dimensions** (Dimension tools): Linear (horizontal or vertical, depending on where you place the line), Aligned, Angular (a corner and two points, or two lines), Radius, Diameter, Arc length, and Continue (each tap adds the next dimension of a chain). Pick the points, then tap where the dimension line, arc or text goes; holding shows a live preview. Each dimension is one object on the current layer with architectural ticks and its value; it can be selected, moved, deleted and undone, and it prints in PDFs and goes out in DXF (as a block)
- Lengths show in metres with a decimal point (2.13 m) for metric drawings and feet-inches for imperial ones (menu → Units shown: Auto, mm, m, ft-in); numbers never use comma separators
- **Markup** (red, on its own layer "TS - Markup" inside the drawing, so it goes out in DXF and PDF and can be hidden): Pen, Arrow, Text note, Cloud, Line, Rectangle, Ellipse, Leader and Number tag (1, 2, 3… counting up; type a number to start from another), plus Hide / Show markups. Drag with one finger or tap the points; two fingers move and zoom
- **Measure** tools: Distance (two points; the next tap starts a new one), Continuous (a chain with a running total), Area, Angle, Coords, Arc length (tap an arc), Object (tap anything for its length, area, perimeter or radius), Total of many (tap or box-select objects; total length and area), Wall area (trace a wall run, type the height, take off openings typed as width x height), Set scale (tell the app the real length of a line, for unscaled drawings), Results and Totals (every measurement of the drawing; tap one to show it again; Save CSV for Excel) and Decimals (0 to 4 places)
- Measuring snaps to endpoints, midpoints, centres, geometric centres, quadrants, intersections, perpendicular and tangent (from the last point), insertion points, nodes and nearest points. Menu → Snap points switches each one on or off. **Polar tracking** (Menu → Polar tracking): from the last point, lines lock onto every 90° (or any step you choose, e.g. 45°, 22.5° or 18°) and onto extra angles you add; a dotted green line shows the angle, and the ray also snaps where it crosses a wall or circle. **Object snap tracking** (Menu → Object snap tracking): while holding, pause on a snap point to pick it up (a green +); the pointer then lines up horizontally and vertically (or along the polar angles) with it, and locks onto the crossing of two such lines. Pause time 0.3, 0.5 or 0.8 s
- In layouts, snapping works on the model seen through viewports, and measurements inside a viewport are in real (model) size
- **Press and hold** on the drawing to place an exact point: a pointer appears just above your finger, so the point is never hidden, and a 2.5× magnifier box in the top corner shows the detail with the snap name and length. Drag to the spot and lift to place it. Moving a measured point works the same way
- Edit: move, copy, rotate, mirror, scale, align, delete, undo and redo
- Properties: select objects and tap ✎ to change layer, colour (for blocks, optionally the block's contents too), linetype, linetype scale and transparency, plus rotation, scale and position (blocks), contents, height and rotation (text), and radius (circles, arcs)
- Draw order: follows the drawing's own order (AutoCAD SORTENTSTABLE); Edit → Order brings objects to front/back, above/under another object, or sends all hatches to back
- Undo/redo in the top bar; closing or opening another drawing with unsaved edits asks Save / Discard / Cancel (Save keeps an edited copy on the phone under Recent)
- **Back button:** closes whatever is on top (a panel, a dialog, the current tool), then the drawing, and returns to the home screen instead of closing the app; with unsaved edits it asks Save / Discard / Cancel first. With several tabs open it closes one drawing at a time
- **Tabs:** always shown. Home (open a drawing, Recent, the sample, **Start a new drawing** in mm, cm, m, inch or feet) and one tab per drawing with × to close; up to 5 drawings, each with its own view, layers, selection and undo history. The drawing's name is on its tab, so the top bar is one line
- Select similar: with something selected, pick every object of the same type on the same layer (blocks by name, hatches by pattern)
- Box select: tap two opposite corners (or drag). Left to right picks objects fully inside; right to left also picks objects crossing the box
- Draw: line, polyline, rectangle, circle, arc, ellipse (two ends of one axis, then the other axis), spline, **point** (tap or type x,y; each point has its own position, layer and colour; the style and size are shared by all points, AutoCAD's 20 styles, relative to the screen or in drawing units, × in a circle by default), text, leader (arrow, landing and text), Sketch (freehand with one finger), Revcloud (drag around an area, or tap two corners) and Divide (points at N equal parts; Node snap finds them), with typed input (`1200`, `@1200,0`, `@1500<90`)
- **Share** (menu → Share drawing): PDF, the original DWG, DXF (with your edits) or a PNG of the screen. PDF options: what to print (view, extents, layout sheet or a window you tap), paper size A4–A0, orientation, scale (fit or 1:1 to 1:1000), colour / grey / black lines, lineweights, hatch transparency on/off, and quality (vector, 150 or 300 dpi). **Preview** shows the page exactly as it will print before you create it. PDFs go straight to Android's share sheet; DWG and DXF are saved to the phone first, because Android lets web apps share only PDFs and pictures
- **Current colour, thickness and line type:** while a Draw tool runs, three round buttons above Extents set them for new objects (ByLayer to start; standard metric DASHED, HIDDEN, CENTER, DASHDOT and PHANTOM are added when used). **Show lineweights** (menu, on by default) draws thicker lines thicker on screen
- **Line types:** the drawing's annotation scale is used in Model, and layouts size dashes on the paper (as AutoCAD with PSLTSCALE); Menu → Linetype scale makes dashes bigger or smaller for the drawing (screen and PDF; DXF keeps the original). Properties says when dashes are too small to see at the zoom
- **Copy and paste between drawings:** select, More → Copy to clipboard (tap a base point, or ✓ for the bottom-left corner); in another tab Edit → Paste (tap where the base point goes, or ✓ for the same coordinates). Blocks, layers and line types come along; mm ↔ m are scaled. Ctrl+C / Ctrl+V with a keyboard
- **Select box by holding:** with no tool running, press and hold still, then drag: left to right selects what is inside, right to left also what it touches. A quick drag pans
- **Toolbar:** one row (60 px) of categories: Markup · Draw · Edit · Layer · Measure · Dimension. Tapping a category opens a grid of all its tools with their names; while a tool runs, its category button shows that tool. With no tool running, tapping the drawing selects. When something is selected, the bar turns blue with Move, Copy, Rotate, Mirror, Delete, Properties and More (Scale, Align, Order, Similar, Total, Make current, Layer off, Off others, Clear)
- The × on the instruction bar (or Esc) ends the tool and clears the selection
- Full screen hides the app's bars only (no browser full-screen message)
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
