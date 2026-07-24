# MeOS — Changelog (Phase 5 pending: images & attachments)

_この節は **フェーズ5(画像/ファイル添付)** 解禁までの退避先です。v3.0.7(2026.07.24)で CHANGELOG.md から切り出しました。_
_理由: CHANGELOG.md は vsix に同梱されストアの Changes タブに描画されるため、未公開(ゲート中)の機能を宣伝してしまう。_
_フェーズ5解禁時 = `MEOS_RELEASE_PHASE = 5` にし、この節を CHANGELOG.md の先頭へ戻す。_

_★版番号について(2026.07.24 追記): MeOS は **メジャー版＝フェーズ番号**(Phase1→v1.0 / Phase2→v2.0 / Phase3→v3.0)。画像/添付は開発時に v3.1〜3.6 を名乗ったが、これは**フェーズ3の最中に作っていたための便宜的な番号**。解禁は **Phase 5 ＝ v5.0 era** として出すこと(下の各項の v3.x は開発版番号なので、公開時に v5.0.x へ振り直す)。**空いた v3.1 は、テーブル系の次の機能(Σ 合計など)が使う。**_

## v5.0 era — images & attachments (opens with Phase 5 · entries below carry dev version numbers)

### v3.6.0 — Hover shows the first attachment, Quick Look for files
- **Hovering a membrane header shows its first attachment in order** — an image, or, for a PDF or other file, a **Quick Look preview** (macOS). No more showing a later image when a file sits at the top.

### v3.5.0 — Drop any file, it moves into the note
- **Drop or paste a file and MeOS moves it beside your note** — images into `img/`, everything else (PDF, zip, docx…) into `files/` — and rewrites the link to point there. Not a copy: the original is relocated, so your note becomes the one place its attachments live. (`.md` links are left untouched.)

### v3.4.0 — A little framed thumbnail on the membrane header
- **A membrane that holds an image shows a tiny framed thumbnail at the start of its opening line** — so even folded, you can tell at a glance that a picture lives inside. Hover / Me Dock are for *seeing it big*; this is for *knowing it's there*. Standard, no marker needed.

### v3.2.0–3.2.4 — Image membrane viewer in Me Dock
- **Put the cursor in an image membrane and Me Dock overlays a full viewer** — the picture at full panel width, with ⇦ ⇨ to walk multiple images and × to drop back to the normal dock.
- **A magnifier that zooms into the spot you click** (Shift+click to zoom out; Ctrl/Cmd+wheel too), well past panel width, so you can inspect a detail.
- **Rename the membrane right there** — the same ↻ / Reset / Set controls as a normal membrane, so an image gets a unique, warp-to name (handy for a manual's figure list).
- **Drag the Me Dock panel wider and the image grows with it** — the resize a hover could never give you.
- **Paste or drop an image and it files itself.** MeOS copies the image into an `img/` folder beside the document, rewrites the link to point there, and moves the original to Trash — effectively a *move*, no more shuffling files by hand. The 🖼 button in the viewer does the same on demand for links pasted earlier. Configurable via `laiMembrane.imageAutoImport` / `imageAutoImportTrash` (default: move to Trash).

### v3.1.0–3.1.2 — Image membranes (the forbidden fruit of Markdown)
- **Tuck an image link inside a membrane, fold it, and your plain text stays plain.** The membrane shows just its name; hover the folded header and the real picture pops up right there.
- Loads local files (relative to the document, or absolute) and `data:` URIs — png / jpg / gif / webp / bmp / svg / ico. Large images render fine (they load by path, not by inlining megabytes of data).
- A visible `![](…)` **file** link still gets Markdown's own image hover; MeOS steps in for `data:` links, which the built-in hover can't render.
- Set `laiMembrane.imageHoverHeight` (default 320px) to size the preview.
- A big picture no longer pollutes the text world — you see it, sharp, only when you want to. That both-worlds trick is what a membrane makes possible.

