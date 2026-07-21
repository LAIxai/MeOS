# MeOS — Changelog (Original Notes)

_Detailed per-version development notes. Moved here from README to keep the README compact._

## v2.0 era — highlights (2026-07 →)

_Curated, user-facing highlights. Exhaustive per-version notes live in the source header._

### v2.0.73 — The diary title rule, made visible
- **Say how your entries are named, and watch the rule work.** The Ⓝ panel takes a template — `W` a weekday letter (S-M-T-W-t-F-s), `MM` / `DD` exactly two zero-padded digits, `M` / `D` one or two, and a trailing **`?`** to make *just the element before it* optional (`✴️?` the mark may be missing, `W?` the weekday may be missing).
- **Brackets are literal.** `(W)` means a weekday *in brackets*, as in `7/20(M)` — the way dates are actually written, and the way MeOS writes its own heading timestamps.
- **The panel counts what your rule really finds** — this month (exactly what Ⓣday will list) and in the whole file — *before* you save it. Tighten a rule and watch the number: the drop is how many entries break your own convention, which makes it the fastest way to find your own typos.

### v2.0.60–63 — One button, one job
- **🔓 rides on 🔐's shoulder** — the unlock badge lights blue only on an encrypted membrane.
- **EOF folded into TOP** as a circled **E** on its hip: the circle is the O of EOF, E is for End, and it sits low because that is where the end of a file is.

### v2.0.46 — Pasted folds stay folded
- Copy a folded membrane, paste it, and it stays folded — the fold state travels in the text (the `⊖` in the badge), not in the editor.

### v2.0 — Lifelong Diary · the [Ⓣ|Ⓣday] gate (Hyper IDX)
- **One button drives a whole-life diary kept in a single Markdown file.** Left **Ⓣ** jumps straight back to today's entry — landing on the exact line you were last writing. Right **Ⓣday** is the dial: **↻** cycles the scope **Day → Week → Month → Year**, and each scope's sub-menu lists the matching entries, so you pick a date by scrolling alone without moving the pointer.
- **Double-click Ⓣday for one polymorphic input**: type `6/4` to make that date the base point, type words to search membrane names and comments (space-separated AND), or `T` to return to today. Zero matches simply reopens the field with a hint — never a dead end.
- **Year scope is the ten-year diary, without its straitjacket.** Entries are found by **name**, not by position, so the membrane structure stays entirely yours — nested, flat, or scattered, with years left blank if you like. Structure lives in comments, so the prose itself is never touched.

### v2.0.0 — Hyper TOC sub-menu (phased release · Phase 2)
- **Right-click any Hyper TOC item to fly out its child membranes** — one level down (e.g. a lifelong diary's month → its days). The list opens centered on your cursor; move with **↑ / ↓**, confirm with **Enter**, dismiss with **Esc**, or click to jump.
- Second of the weekly phased-release unlocks: everything ships in one build, and each week opens one more feature at the door.

## v1.0 era — highlights (2026-06 → 2026-07)

_Curated, user-facing highlights. Exhaustive per-version notes live in the source header._

### v1.0.20–1.0.30 — Action badges on the three bookmarks
- **F / H shoulder badges** on the Bookmark / Reference / Home buttons: one click makes the cursor line the Front (**F**) — or, for Home, the single ribbon (**H**). No menu needed.
- Every "return spot" now shows its **jump destination as a one-line, colored tooltip**: Reference in blue with the mark's position (e.g. `¶6`), Bookmark in red, Home in green.
- Fix: highlights could occasionally stop rendering until a restart (the refresh gate could get stuck); it now self-heals.

### v1.0.0 — Reference Groups (phased release)
- **Reference groups**: named, grep-able in-text anchors. One click warps to the group's Front mark; click again to cycle every mark. Each group remembers its own Front, so switching groups returns you to that draft's last spot.
- **Marks / Annotated / Pending.** Annotated marks carry a footnote; ⌘/Ctrl-click jumps to the note (Annotated) or straight to the Front (Marks / Pending).
- Marks are stored as **HTML comments** — invisible in GitHub and Markdown preview, so your text stays clean.
- Pick from 7 preset symbols (`※ † ‡ ∗ § ‖ ¶`) plus 2 custom.

### v0.9.999 — Markdown tables
- **Format Table** (CJK & emoji width aware), **cell navigation** (Tab / Cmd+arrows), **cell merge** (stored as invisible comments so the GFM table stays valid), and **row / column duplicate & delete**.

### v0.9.999147 — Format ring
- ↻ toggles and cycles highlight / strikethrough / heading presets with just the cursor inside the decoration.

### v0.9.999123 — Reference Membranes, the Three Bookmark Treasures & the Aiming Menu
- 🏠 Home (one ribbon per file), 🔖 Bookmarks (up to 3), and reference marks — each with a Front you can jump to.

### v0.9.99957 — Done-checkbox
- Any heading / highlight / list item can become a searchable checklist item.

### v0.9.99940 — Format three-brothers
- ↻ color palette for highlight / strike / heading, with per-file color memory.

### v0.9.99935 — Navigate Me minimap scrollbar

### v0.9.99922 — ⌘/Ctrl-click to warp in the Hyper TOC

### v0.9.99921 — 🔐 Encrypt Me
- Encrypt a membrane's contents in place.

### v0.9.986–0.9.988 — 🐙 Octopush
- One-shot, git-aware GitHub backup / sync.

### v0.9.971 — Membrane OS · Markdown⊕
- Rebrand to **MeOS** (Membrane OS).

## Original Notes

# VSCodiuM - Fold Membrane v0.9.312

- mSTATS ver0 sync retained from v0.9.99.
- Added editor title/context command: Fold Membrane: Add Membrane.
- Open/close/Enter handling fixes retained from v0.9.225.
- Membrane logo ver12 integrated: yellow ▼/▲ marker alignment with the yellow code-core layer.

## v0.9.228 Menu Cleanup

The editor context menu is now consolidated under **MeOS - Membrane**.

Top MeOS actions:

1. Control Me!
2. New Me / Rename Me
3. Delete Me (excluding Contents)
4. Copy Me
5. Copy My contents


## v0.9.229 Me Dock Prototype

Added **Me Dock On/Off** to the **MeOS - Membrane** context submenu.

The first prototype opens a shape-only **Me Dock** panel:

- A ∨
- New Me ∨
- Add to Hyper TOC
- Toggle Me ∨


## v0.9.230 Open Me Dock Menu

Renamed the context menu item to **Open Me Dock >** so it reads as a dock/panel opener rather than a simple toggle command.


## v0.9.231 Open Me Dock Submenu

Changed **Open Me Dock** into a real submenu so VSCodium renders the arrow at the right edge.

- Open Me Dock >
  - Show / Hide Me Dock


## v0.9.232 Open Me Dock…

Changed **Open Me Dock >** back to a direct command named **Open Me Dock…**.

The ellipsis indicates that a separate Me Dock panel opens.


## v0.9.233 Me Dock New Me Dropdown

Implemented the first active Me Dock split button:

- **New Me ∨**
- Select **Rename Me** from ∨ to change the parent label
- Left side runs the currently selected action

`New Me` is wired to the existing Add Membrane routine. `Rename Me` is a UI-ready placeholder for the next implementation step.


## v0.9.235 Rename Me Fix

Rebased on the working v0.9.233 Me Dock implementation and safely added **Rename Me**.

- `Open Me Dock…` works again.
- `Rename Me` updates start/end membrane names together.
- Rename range detection supports `mCN=`, `CN=`, `H1=`, `H2=`, `H3=` without changing the core parser.


## v0.9.236 New Me Guard

Fixed a New Me insertion bug.

- If the cursor is inside an existing membrane name, **New Me** is blocked.
- A warning appears: use **Rename Me** instead.
- This protects membrane names as structural IDs.


## v0.9.237 New / Rename Me One Button

Changed Me Dock from the selector-style **New Me ∨ / Rename Me ∨** to one safer button:

- **New / Rename Me…**

Behavior:

- Cursor inside a membrane name → **Rename Me**
- Cursor elsewhere → **New Me**

The InputBox title confirms whether the operation is New or Rename before execution.


## v0.9.238 New / Rename Color Cue

Added visual color cues in Me Dock:

- **New** = red
- **Rename** = blue

Note: native VSCode/VSCodium context menu labels cannot be partially colored by extension API, so the color cue is applied inside Me Dock.


## v0.9.239 Crux Statement Update

Inserted the finalized Membrane notation core statement into the extension description and README.

## v0.9.240 Crux Structure Update

Updated the crux statement to include the core idea: **comments create structure**.

## v0.9.241 Semantic Metadata Crux Update

Updated the crux statement to: **comments (semantic metadata) create structure**.

## v0.9.242 Inline New/Rename Me Panel

Me Dock now switches **New Me… / Rename Me…** by cursor position and opens the input directly under the button.

## v0.9.243 Inline New/Rename Fix

Fixed inline Me Dock New/Rename:

- `Open Me Dock…` works when the cursor is outside membranes.
- `Set` keeps the target editor and applies Rename/New even after Webview focus moves.


## v0.9.244 IME-safe Set

Inline New/Rename Me input is now IME-safe:

- Enter no longer triggers Set.
- Set is click-only to avoid accidental execution during Japanese kana-kanji conversion.
- Escape still closes the inline input panel.

## v0.9.245 Always-visible New/Rename Input

Me Dock now always shows the New/Rename input box.

- Removed the extra New/Rename Me button.
- The title automatically switches between **New Me** and **Rename Me** by cursor position.
- Set remains click-only for IME safety.
- Reset restores the context-derived name.

## v0.9.246 Input Border and Timestamp Refresh

Me Dock improvements:

- Input border remains visible while editing the document.
- Added **↻** timestamp refresh button for **New Me**.
- The refresh button is hidden in **Rename Me** mode.

## v0.9.247 Rename Timestamp Refresh

The **↻** button is now available in Rename Me mode too.

- New Me: refreshes the whole default membrane name.
- Rename Me: preserves the name body and replaces/appends the trailing timestamp.

## v0.9.248 Refresh Button Fix

Fixed the **↻** timestamp refresh button.

- Refresh now updates the input even while the input is focused.
- New Me refreshes the whole default membrane name.
- Rename Me preserves the body and refreshes/appends the trailing timestamp.

## v0.9.249 Timestamp Replace Fix

Fixed Rename Me timestamp refresh duplication.

- Existing trailing timestamp forms are removed before adding the new timestamp.
- Supports `_HHMMSS.MDD` and `_HHMMSS_MDD` style suffixes.

## v0.9.250 Tooltip Polish

- Updated ↻ button hover text to: `Time Stamp`

## v0.9.251 Rename Whole Membrane Line

Me Dock now treats the whole membrane line as a Rename target.

- Cursor on the left side of ▼/▲ → Rename Me
- Cursor inside membrane name → Rename Me
- Cursor outside membrane lines → New Me

## v0.9.252 Precise Membrane Line Rename

Fixed over-relaxed Rename detection.

- Cursor on a physical line containing a real ▼/▲ membrane marker → Rename Me
- Cursor on the left side of ▼/▲ on that same line → Rename Me
- Cursor on non-membrane lines → New Me

## v0.9.253 Me Dock Current Line Marker

When Me Dock is open, the target editor line is highlighted so the left-pane context remains visible while operating right-pane controls.

## v0.9.254 Visible Current Line Marker

Made the Me Dock target line marker visibly stronger.

- Gold whole-line background
- Gold line border
- Left-side `▶` marker
- Right overview-ruler mark

## v0.9.255 Line Button Marker Toggle

Me Dock layout now puts the membrane name first and line number second.

- `Line` button toggles the right-side `⇦` marker.
- Removed full-line gold highlight/border.
- Line number is displayed in a separate input field.
- Set/Reset returns focus to the target editor.

## v0.9.256 Right Marker and Line Jump

- Moved marker from left-side `➡` to right-side `⇦` to avoid shifting membrane lines.
- Enter in the Line box jumps to the specified line.
- Set also honors the Line box before running New/Rename.

## v0.9.257 Live Line Jump

- Line input now live-jumps when its value changes.
- Enter in Line jumps but keeps focus in Me Dock for continuous navigation.
- Only Set returns focus to the editor.
- Reset restores panel values without stealing focus.

## v0.9.258 Set Same-Line Stability

- Set no longer re-jumps when the Line box already points to the current line.
- Set returns focus to the intended target line after New/Rename.
- Live Line edits no longer warn while the input is temporarily empty.

## v0.9.259 Jump Select Full Name

- Start/end membrane jump no longer depends on double-click word selection.
- The membrane name is parsed from the whole line.
- Jump operations select the full membrane name, making copy easier.

## v0.9.260 Actual W-click Jump Fix

- Patched the actual W-click jump route: `tryActivateSelectedNameJump`.
- Jump now parses the whole membrane line instead of relying on selected word text.
- W-click on any part of a membrane line selects the full membrane name and jumps to the paired membrane.

## v0.9.261 Per-file Line History

- Added per-file Line history for Me Dock.
- Added `←` and `→` buttons beside Line.
- Line jumps and W-click membrane jumps are stored by document URI.
- Switching files preserves each file's navigation stack during the session.

## v0.9.262 Cmd+G Line History

- Added `Cmd+G` = Line History Forward (Mac)
- Added `Shift+Cmd+G` = Line History Back (Mac)
- Works directly from the editor pane using Me Dock history instead of default Go to Line.

## v0.9.263 Right Pane Cmd+G

- Added `Cmd+G` / `Shift+Cmd+G` inside Me Dock (right pane)
- Right pane now controls Line History directly without search panel conflicts
- Works while typing in Me Dock inputs

## v0.9.264 Right Pane Cmd+G Blur

- `Cmd+G` / `Shift+Cmd+G` inside Me Dock now exits input mode first
- Line input value updates correctly after history navigation
- Navigation takes priority over editing when the shortcut is pressed

## v0.9.265 Insert-style Line History

Changed Me Dock Line History from browser-style truncation to insertion-style history.

Example:

```text
A → B → C
Back to B
Jump to D
Result: A → B → D → C
```

Forward history is preserved instead of being destroyed.
