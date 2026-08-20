# MeOS — Changelog (Original Notes)

_Detailed per-version development notes. Moved here from README to keep the README compact._

## v4.0 era — highlights (2026-08 →)

### v4.0.316 (2026-08-21)
- **`✅` is display only, everywhere** — it is drawn in the hover and written nowhere. That was already true of the
  v4.0 form, but the legacy shell path still stamped a literal `✅` into the raw text on save (and removed it again
  when unchecked), quietly editing lines written long ago. v4.0 never writes shells, so the only files it could touch
  were old ones — the worst thing to change silently. Both paths now record the time and nothing else. A `✅`
  already written stays where it is.

### v4.0.315 (2026-08-21)
- **Checking a box records the time again** — write anything into `//[…]tip=` and saving injects the timestamp, so the
  hover reads `✅ Checked: 2026-08-21 00:34`, matching H-TOC's Checked. Nothing about this feature had changed: it
  looks inside the old shells (`##[…]##`, `=={…}==`, `~~{…}~~`), and when v4.0 dropped the shells, headings written
  the new way stopped matching any of them. The reading half never broke — only the writing half was left behind.
- On the v4.0 form only the timestamp is injected. The `✅` that used to be prepended to the body stays out of it:
  the body is plain Markdown and gets nothing added, so the whole record lives in the comment.

### v4.0.314 (2026-08-21)
- **The heading timestamp is Created, and Created is written once** — it is the day the writer made this heading, the
  same thing H-TOC calls Created, and Bird-EV ToDo needs it. Pressing the heading button again now keeps the original
  time instead of stamping today's.
- **One line-level instruction per line** — pressing again used to leave the old directive in place and append a new
  one, so a single heading ended up carrying `H2_2020…` and `H3_2026…` side by side. The new one replaces the old, and
  the old one's Created is carried across first, so replacing loses nothing.
- v4.0.313 called the timestamp "just a label for grep". That was wrong. Being forgiving about its *shape* is still
  right — a bad stamp must not kill a heading — but its *content* is data and is never rewritten on its own.

### v4.0.313 (2026-08-21)
- **A malformed timestamp no longer kills the heading** — v4.0.312 matched it against an exact pattern, so deleting one
  bracket from the weekday left the whole instruction unreadable and the heading lost its colour. But the timestamp is
  not something MeOS reads: it is a label for `grep`. Anything up to the next space (or `//`) is accepted now, and only
  a trailing `not` is handed back to the parser. Same question as the unclosed code fence in v4.0.106 — can it stay
  standing on broken input?
- The strict pattern stays where it belongs: stripping an old timestamp out of body text, where matching only the real
  thing is the point. The same value can deserve different strictness when read and when deleted.

### v4.0.312 (2026-08-20)
- **A heading's timestamp moves into the instruction** — `## Heading` stays plain Markdown and the time is written as
  `H2_2026.08.20(t)pm11:29.35JST` in the FC line. It was put in the body back when there was no FC line and a comment
  really would have hidden it; now the comment opens under the cursor, so the reason is gone — and "not a millimetre"
  should mean it. One word, so `grep H2_2026.08.20` finds it. It is not placed after `//`, where the tip runs to the
  end of the line and the date would surface as a tooltip.
- The stamp's shape is defined once and used by both the parser and the stripper. Written generically first, it broke
  on the `(t)` in the weekday — the directive stopped at the bracket and the remainder was read as a colour. Measured,
  then fixed at the source.

### v4.0.311 (2026-08-20)
- **Selecting text no longer gets yanked away** — folding an FC group takes real time on a 140k-line file, and if you
  began selecting during that wait, MeOS put the cursor back where it had been, assuming the fold had moved it. It
  cannot tell the two apart by watching the cursor, but it can by looking at what is there: **a selection is always
  something a person made** — folding only collapses to a point, it never creates one. So a selection is now left
  alone, the fold/unfold bails out the moment one appears, and the bulk folder honours the same rule.
- The pinned row's `●` was drawn larger because it was a different element: buttons do not inherit fonts, so the same
  14px produced a different glyph. Both are the same component now, the pinned one simply disabled.

### v4.0.310 (2026-08-20)
- **A pinned file has no close button** — pinning says "keep this one", so a `×` sitting next to it contradicts the
  gesture. Only the unsaved `●` remains, and on a pinned row it is a plain marker: it does not turn into a `×` and
  cannot be clicked.
- **The startup jump says so** — the status bar reports the line for three seconds, because landing on the line you
  were already looking at is indistinguishable from not moving at all. Still no popup: startup should not startle.

### v4.0.309 (2026-08-20)
- **Returning to your last line actually works now** — the recorder was running before the restorer and overwriting
  the very number it was meant to preserve: a cursor event fires as the editor opens, MeOS wrote down line 0, and two
  seconds later the restore read a 0 and quietly did nothing. When one value is both remembered and restored, order
  matters: nothing is recorded until the restore has had its turn (with a 20-second backstop).
- **Pin one file in the ▾ menu** — 📌 keeps it at the top and out of reach of the five-file cutoff. One pin only, so
  there is nothing to choose: pinning another moves it, pinning the same one releases it.

### v4.0.308 (2026-08-20)
- **The last exception is gone: tables and lists write in one edit too** — they used to put the instruction at the end
  of the line and move it afterwards, because that is how the mover learned what had just been added: it read it back
  out of the document. It is now handed the line instead, so body and FC group are written together and the halfway
  form never reaches the file. Every format button now measures one edit in the fake editor.
- The fake editor had a bug of its own: every document it made was called `rig.md` at version 1, so the line cache
  handed back the *previous* test's document. Each one gets its own name now — and its cases are serialised, because
  the "one click, one action" guard is measured in milliseconds and a rig fires faster than a person can.

### v4.0.307 (2026-08-20)
- **The heading button no longer flashes a line-end comment** — v4.0.210 abolished writing the instruction at the end
  of the line and moving it afterwards, and v4.0.235 rebuilt the other buttons around a single edit, but the heading
  and bullet paths were never converted. They are now: the finished line is assembled in memory and body plus FC line
  are written together, so the document never holds the halfway form. Verified in the fake editor — one edit, and the
  only snapshot is the final shape.

### v4.0.306 (2026-08-20)
- **The file name is a control, and looks like one** — it sits in a rounded box with the ▾, the whole box opens the
  menu, and the box hides itself when there is no file. The name stays small because the header has no room to spare.
- **The menu itself is set larger** — a list you read deserves readable type, and it has room to be generous where
  the header does not.

### v4.0.305 (2026-08-20)
- **Picking a file from ▾ goes back to where that file already lives** — MeOS looks up its tab and reuses that
  editor group instead of opening a second copy somewhere else. Tab groups are consulted rather than visible editors,
  so a file sitting behind another tab is still found.
- **No more tooltips over the menu** — the native `title` popups sat right on top of the list they were describing.
  Gone; the rows say what they are, and the ▾ uses MeOS's own tip, which is dismissed when the menu opens.
- **Startup returns you to the line you were last on** — instead of pressing Ⓣ for you. It works in any file, needs no
  date parsing, and opens whatever membrane that line is inside, which is what the Ⓣ trick was really for. One line
  number per file, written out only once the cursor has been still. The Ⓣ button itself is unchanged.

### v4.0.304 (2026-08-20)
- **The recent-files menu behaves like tabs** — an open file carries a `×` to close it, and an unsaved one shows `●`
  instead, turning back into `×` when you point at it. Files that are not open carry no glyph, because there is
  nothing to close. The file you are in is the bold one.
- Open/unsaved state is counted **when the ▾ is opened**, not tracked continuously — the menu asks for a fresh answer
  on each open, so nothing extra runs on the paths that fire while you type.

### v4.0.303 (2026-08-20)
- **The file name lives in Me Dock, next to the version** — editor tabs get buried under every other tool's panes,
  so the one thing you need to know (which file am I in?) now sits somewhere permanently visible. A ▾ beside it lists
  the last five files you worked in; pick one to open it.
- **Orange bars mean "you are in the FC line"** — sitting on a body row tints its text but leaves the `|` alone, so
  the two cases are told apart at a glance. And the bar tint actually renders now: `color` only accepts a colour, and
  the `!important` glued onto it made the whole decoration type silently do nothing.

### v4.0.302 (2026-08-20)
- **Change the symbol in the FC line and the text follows** — turn a `==` box into `**` and `==apple==` becomes
  `**apple**` in the row above. Instructions live in the comment, so the comment is what you edit. It finds the change
  without knowing what it used to be: line up the row's marks against that FC line's boxes and act only when exactly
  one pair disagrees. Half-typed states simply do not match, so nothing happens until the symbol is whole.
- **The pair is always orange together** — sit on a row and both that row and its FC line are tinted; sit on the FC
  line and it stays tinted while the row it belongs to gets its `|` bars tinted instead. The row keeps its own
  colours: the cursor line is raw text and safe to paint, a decorated row is not, so it is marked without being
  overwritten.

### v4.0.301 (2026-08-20)
- **Any line of the block opens the group** — the FC group belongs to the whole table or list, so put the cursor on
  any row and it opens, with only that row showing its raw text. Previously only the last row triggered it, which was
  the one line nobody thinks to click. The *folding* range is unchanged, so the table itself is never folded away.
- **The matching FC line is coloured** — sit on the *n*-th row and the *n*-th line below is tinted, so "they line up"
  is something you see rather than something you count.
- **A spec line is never a body line** — with multi-line FC groups each FC line suddenly had another FC line beneath
  it, so the "read the spec below" path picked up its own neighbour and drew a list number on the comment. One guard
  fixes it. (What looked like "the last comment is missing its `1.`" was the other three wrongly having one.)
- **Enter inside a block-formed list adds the item inside the block** — the new item lands right under the current
  one and a matching FC line is inserted at its position in the group, instead of both being appended after the whole
  group. Ending the list on an empty item drops just that item and its one line.

### v4.0.300 (2026-08-20)
- **The FC group mirrors the shape of the block** — one FC line per table row, one per list item, so the *n*-th line
  below matches the *n*-th line above. You do not count boxes any more; you line the two up and read. Lines with
  nothing to say get a spacer, `<!-- Mew!FC not -->` — the same `not` already used by `H2not`, `***not` and `↑not`,
  raised one level to mean "nothing to declare about this line". No new word was added to the notation.
- Reading needed no change at all: FC lines have been read "as far as they continue" since v4.0.147, and matching has
  always been by document order, so the multi-line form already resolved correctly — measured before writing any code.
  The single-line form keeps working and is only rewritten when you touch that block.
- The table writer keeps every bit of its ordering machinery (v4.0.205–208); the new layout is a final, pure step that
  splits the finished single line into per-row lines. Making it and splitting it stay separate jobs.

### v4.0.299 (2026-08-20)
- **A list is one block, like a table** — put a single FC line under the whole list and its instructions are dealt
  out to the items in order, so `-1.` / `-1.1` / `-1a` finally produce `1.` / `1.1` / `1a` instead of a column of
  `1.`s. One comment below the list also keeps the list *one list* in external renderers, which a comment between
  items does not. Writing follows the same rule: a line-level instruction lands in the block's FC line at the item's
  position, padding the others with the form they already have.
- Instructions are dealt out **only when the number of boxes equals the number of items**. Anything else is left
  alone, so documents written the old way (an FC line under each item — which now counts correctly too) keep working
  byte for byte, and the writer can open the FC line and simply count.
- The block is measured **once**, not once per item: walking up and down for every item cost 41ms on a 140k-line
  document with 5-item lists and 1.2s with 500-item ones — on the pass that visits every line. It is flat now.

### v4.0.298 (2026-08-20)
- **The underline remembers what you chose** — ⌥Option+Click now writes the last underline style you actually
  decided on. It learns from two places, because both are the same act: correcting the `(N)` by hand in an FC line,
  and setting it in ▾ on a preset that declares `□ Link`. One value, one store, and the button face previews it, so
  what you see before pressing is what gets written. A preset that declares the link still wins for its own clicks —
  the rule from v4.0.297 is unchanged, only the fallback got a memory.

### v4.0.297 (2026-08-20)
- **The underline belongs to the preset that asked for it** — a preset with `□ Link` unchecked is not in the link
  business, so the underline value still sitting in it is just an old setting. ⌥Option+Click now writes `(0)`, a plain
  underline, and you change the digit inline if you want another. Want a fixed style instead? Tick `□ Link` and pick
  it in ▾ — that path already existed, so the rule stays single: *the preset's value when it declares the link,
  otherwise the default.* The button face previews the underline that will actually be written.
- **The limits follow the lean** — now that `∫` is slanted, the stacked upper limit sits ~1.5px further right and the
  lower one ~2.5px further left, matching where the head and the foot of the sign have moved. Measured in the
  script's own `ch`, not pixels, so it holds at any zoom.

### v4.0.296 (2026-08-20)
- **The target comes from the clipboard** — copy a URL, select the words, ⌥Option+Click, done. MeOS writes the
  target into the FC line for you and tells you what it wrote in the status bar. It only does this when the
  clipboard content is *verifiable*: an http(s) URL, or a membrane name that actually exists in this document
  (checked against the same name set the renderer uses). Anything else — prose, multiple lines, unbalanced
  brackets — is left alone and you get the empty `()` with the cursor waiting in it, exactly as before. Writing an
  unverified target would leave a dead link the writer never noticed, which is the worst way for this to break.

### v4.0.295 (2026-08-20)
- **Option is the button's other face — now a rule, not a one-off** — ⌥Option+Click on the highlight button adds a
  link this once, flipping the preset's `□ Link` without changing the preset. Beginners tick `□ Link` in the ▾ panel;
  once it is muscle memory, leave all three presets link-free and reach for Option instead. The button shows the
  underline *before* you press, so you always know which one you are getting.
- The Option watcher is now **one** shared piece (`fmtAltWatch`) used by both the highlight and the super/subscript
  buttons; each button only remembers whether the pointer is over it. Two watchers would eventually disagree about
  what the face is promising.

### v4.0.294 (2026-08-20)
- **Integrals lean — for real this time** — `font-style: italic` never moved the `∫`, and measuring said why:
  Menlo-Italic's integral is the *same glyph* as Menlo-Regular's (symbols are not slanted in an italic face), while
  `f` and `A` genuinely differ. Asking the font was the wrong move, so MeOS now slants it itself with `skewX(-12°)`
  about the glyph's centre — head to the right, foot to the left, matching where the two limits sit. `transform`
  changes no layout at all, so widths, columns and hit-testing are untouched.

### v4.0.293 (2026-08-20)
- **Integrals lean** — an `∫` that carries limits (either `∫↑(5)↓(0)` or the `👒` form) is now rendered
  slanted, the way maths is set. A bare `∫` in prose is untouched: the base character declares whether it is a
  formula. The stacked lower limit also shifts slightly left, since a slanted sign puts its foot to the left of its head.
- **The height follows the direction** — flip `↑` to `↓` in an FC line and the `{N%}` is rewritten to that
  direction's configured default. 150% ("top of the base character") and 50% ("on the baseline") are one-way words;
  carrying one across the flip always looked wrong.
- **Swap the limits with one arrow** — a big operator's two limits must point opposite ways. Make them match and the
  other one moves to the free slot, so fixing an upside-down `Σ` is a single-character edit.
- **🐱 finds headings that are not FC** — a heading whose spec still sits at the end of the line wraps, and a
  wrapped line breaks the membrane's vertical rule. The cat now marks those lines and moves the spec down to a folded
  FC line, leaving plain Markdown on the heading itself.

### v4.0.239 (2026-08-16)
- **Accents, with the recipe** — `a↑<(..)>` + superscript button → the real letter `ä`. Names draw the shape
  (`<(..)>` `<(.)>` `<(--)>` `<(^)>` `<(o)>` `<(v)>` `<(~)>` `<(')>`), and the recipe stays in the comment
  so you can redo it later. Prime `a↑'`, degree `x↑o`, negative exponents `10↑-3` remain ordinary superscripts.
- **Highlight rides on `***`** — the button now writes `***text***` + `***not (white/yellow)`. Inside MeOS a
  highlight, outside bold+italic. `==` is still read but no longer written; it was the last mark that leaked
  out of MeOS, because CommonMark and GFM have no highlight.
- **`not` across the family** — `*not` `**not` `***not` (and `↑not` as before): *do not let this mark claim its
  usual meaning*. Turns bold into plain without touching the text.
- Old-notation membrane names are Cmd+Click targets again (a trailing `.608` was mistaken for a file extension).
- Superscript instructions are written in **one edit** — the line-end comment never appears in the document,
  and one undo takes it back.
- 🚫 removes **only the instruction**; the characters you typed stay.

- **斜体は `*` で書く（v4.0.169）.** Markdownの `_斜体_` は**語中で閉じられない** —— CommonMarkの規則で、
  閉じの `_` の後ろが文字だと斜体にならない。日本語は助詞が続くので `_イタリック_の後に…` は
  **MeOSの外で `_` が字のまま見えていた**。`*` にその制限は無いので、これからは `*斜体*` と書く ——
  **MeOSの中でも外でも本物の斜体**。`_斜体_` はこれまでどおり読み続ける（**すでに書かれたものは救わない／そのまま描く**）。
  指定行では `<!-- Mew!FC * (白/黄) -->` と名乗る。
- **長いものは行の外へ出し、外へ出したものは畳む.** 行末のコメントは隠れていても**桁は食う**ので、
  指定を書くほど自分の文が次の画面行へ追い出される。so指定は**真下の行**へ出す —
  `<!-- Mew!FC … -->`。**FC = Folding Comment** で、MeOSは既定でその行を畳む。
  **カーソルを置けば開き、Rawなら全部開く。** 行番号が飛ぶのは、行が消えたからではなく畳まれているから —
  **飛んだ番号は、ファイルが手つかずである証拠**。
- **同期させるものが無い.** 命令が名乗るのは**種類**であって実物ではない —
  `A↑1(白/緑)` は「上付きが1つ」という意味で、`-1.` が「番号付きの項目」を意味するのと同じ。
  同じ種類が並んだら**出現順**で結ぶ。so**本文を書き換えても命令は壊れない**し、
  ファイルは**腐りうるラベルも番号も持たない**。2つめを指したい時だけ `A↑1#2(…)` と書く。
  どちらの形で書くかは **Me Dock の「Format ▼」→ `□ Folding Comment(FC) below`** の1つのチェックで決まる。
  チェックが決めるのは**これから書くもの**だけで、**すでに書かれたものはそのまま**。
  過去を救うのは🐱(旧記法→新記法の移行)の役目so、**移行の道は1本しか作らない**(v4.0.164)。
  指定行は**ただのテキスト**so、並べ替えや一部削除は**その行で直接**できる。
  指定行は**その行が持つもの全部**を受けられる —— 見出しも、上付きも、そして**文の途中にいる**
  ハイライトや取消線も。**1つの命令につき1つのコメント**なので、
  **箱の数がそのまま命令の数**になる —— `<!-- Mew!FC ~~(赤/) --><!-- Mew!FC ==(白/黄) -->`。
  **文の途中のものほど値打ちがある**。行末と違って、そこから後ろの文字が全部ずれるからだ。
  行き来はパレットの2つで自由 —— **外へ出す**／**行末に戻す**。並べ替えや一部削除をしたい時は
  一旦戻して、済んだらまた外へ出せばいい。**戻す方は自己検証つき**で、
  戻した結果をもう一度FC化して元と一致しなければ**実行しない**（行が壊れない）。
- **上付きが散文に不意打ちしない.** `x↑2` や `(a+b)↑2` は上付きになるが、`、↑2` や `🐱↑3` は**ただの字**のまま。
  上付きは「載る相手」があってのものだから。それでも上付きにしたければ、真下の行で名乗る —
  `<!-- Mew!FC A↑1(白/緑) -->`。
  逆に、本物の上付きの隣に**素の矢印**を置きたい時は **`not`** と言う —
  `<!-- Mew!FC A↑1(白/緑) ↑↓not -->` で「1つめは緑、2つめは素のまま」。順番に効くので番号は要らない。
  MeOSの他と同じ規則（**素はただの字・命令はコメントに書く**）なので、**エスケープ文字は要らない**。

### v4.0.110 → 4.0.123 — 階層番号・表の収まり・速度

- **番号付きリストの階層.** `-1.` = 第1階層、`-1.1` = 第2階層（数字）、`-1a` = 第2階層（英字＝「図1a・図1b」の形）。
  同じ階層の行には**常に同じ命令**を書く。数えるのは MeOS なので、番号はファイルのどこにも書かれず、腐らない。
  インデントも MeOS が描くので、生データは平らな `1. ` のまま。区切りは**空行だけ**（間に文が挟まってもリストは続く）。
- **命令に行頭マーカーを追従させる（v5.0へ見送り）.** コメントの `-1.` を `-` に書き換えたら行頭の `1. ` も直す、という自動書き換えは作ったが封印した。**編集イベントを受けて自分で編集する**仕掛けは、条件次第で編集のループになりうる（8/10の固着バグを追う過程で危険が見えた）。v5.0で真因から作り直す。
- **広い表をペインに収める（v5.0へ見送り）.** 収まらない表を列ごとに小さく描く機能は作ったが、**スクロールしただけで字が縮む**のは「整形はボタンを押した時だけ」という MeOS の約束に反するので封印した。
  そもそも縮めても折り返しは止められない（折り返しはモデルの桁数で決まり、装飾は描画にしか効かない）。v5.0で、テーブルボタンを押した時に効く形として作り直す。
- **速度（14万行の日記で計測）.** 膜の縦線を描く処理が全行×全膜の総当たりになっていたのを掃引に変え、
  可視範囲の外は作らないようにした（**747ms → 9ms**、生成する装飾 149,696個 → 301個）。
  あわせて 11MB の全文を1描画で何度も作り直していたのをやめ、文書の版ごとに1回だけに（GC が秒単位で止める原因）。
- **🐱 の取りこぼし修正.** Me Dock のボタンは押した瞬間フォーカスが webview に移るため、
  対象エディタを取り違えて何も起きないことがあった（変換・数え直し・印の消去）。
- **コードスパンを飲み込まない.** `- ` の直後にコードスパンがある箇条書きで、行頭マーカーの判定が
  コードスパンまで巻き込んで隠していたのを修正。

### v4.0 — Plain Markdown, plus a comment (記法の大転換)
- **Everything you write is real Markdown.** Headings, ordered/unordered lists, bold, italic, highlight,
  strikethrough and links are plain Markdown; MeOS keeps its colours, tips and instructions in an HTML
  comment at the **end of the line**. A MeOS document renders correctly with or without MeOS.
- **Warp anywhere.** `[label]()` plus `<!-- Mew! [](target) -->` turns any word into a jump — to a membrane
  by name, or to a URL. The destination never sits between your words, so the sentence keeps flowing.
  Markdown reference links (`[label][ref]`) are supported too, for long URLs.
- **Mew! 🐱 — a signature, and a way home.** Every MeOS comment starts with `Mew!`, so one `grep` finds them all.
  Old notation is marked with a cat in the gutter; **↻** shows the marks for five seconds, **🐱** converts what is
  on screen — one click, one undo. Nothing is ever converted behind your back.
- **Numbers that never rot.** Ordered lists are stored as `1.` on every line; MeOS numbers them on screen.
  Insert a line anywhere and the file does not change.
- **Membrane timestamps in full.** New membranes are named `name_YYYYMMDD<weekday>HHMMSS<TZ>` — sortable,
  grep-able, and honest about where you were when you wrote it.
- **GitHub token, watched.** The days left on your access token sit at the right edge of the GitHub push row —
  visible **even when the panel is folded**. MeOS warns before it runs out, and turns the disconnect button
  into a one-press fix when it expires.

## v3.1 era — highlights (2026-08 →)

### v3.1 — Spreadsheet totals without cell addresses (座標からの解放)
- **Table math with no cell addresses.** Sum and product by direction, not coordinates: `<!--Σ↑-->` sums the column above, `<!--Π←2-->` multiplies the two cells to the left. No `SUM`, no `B2:B4`. Insert a column and nothing breaks — the markers follow.
- **Calc membrane `Σ→…Σ←`.** Sum across a row by wrapping it between an opening wall and a result; the wall auto-excludes the row-number cell.
- **Function membrane / calculator.** Define `name(a,b) = expr` once in a membrane, then call it anywhere — in a table or in prose — as `<!--f(←1,←2)_TS-->`, with arrows for arguments instead of addresses. Your formulas become a personal library, in plain Markdown.
- **Auto / Manual calc modes.** Auto (default): totals update live on screen as you type, and are baked into the file on save (Cmd+S). Manual: totals show the last baked value and recompute on ▦ (Excel manual calc + F9). Either way, **changed cells flash green**, and **Re-calculate all** bakes every table in a membrane at once.
- **Numbers stay plain text.** The formula hides in an HTML comment; the result is plain text in the cell — readable on GitHub, in any Markdown preview, with `grep`. The cell count never changes: still valid GFM.
- **Vertical-merge row rules.** A thin row rule under every cell, dropped under merged cells, so a value spanning two rows reads as one — matching how `Σ` counts it once.
- **Merge membrane `→…←` / `↓…↑`.** Merge by wrapping the range between start/end markers — no count to write; it grows and shrinks as you insert rows or columns.
- Plus **MeTeX** superscript / subscript, **Me Dock zoom**, and a hardened **Octopush (🐙)** GitHub backup (loud, actionable errors when a token expires, and a token check the moment you arm it).

## v3.0 era — highlights (2026-07 →)

### v3.0 — Tables that never touch your data (Phase 3)
- **Cell merge, without touching the file.** GFM has no `colspan` / `rowspan`; MeOS adds them with one HTML comment — `<!--🤝→2-->` (merge right) / `<!--🤝↓2-->` (merge down). The cell count never changes, so the file stays valid GFM and the marker is **invisible on GitHub and every Markdown preview**. MeOS shows the merge in the **main editor** — not a preview pane. Put the cursor on the row and the raw marker reappears for inline editing.
- **Format Table, CJK & emoji aware.** One press of the ▦ button aligns the columns. MeOS knows the editor's default font draws a full-width character at ~1.67× the ASCII width (not 2×) and pads with a carry method, so Japanese tables actually line up; `laiMembrane.tableCjkWidth = 2` gives a pixel-perfect grid on a duospaced font.
- **Cell navigation** (Tab / ⌘→ / ⌘← / ↑ ↓), **duplicate & delete row / column** (merge-aware), and a **table membrane** to wrap a long table so Current Me can jump to its tail.

### v3.0.3–3.0.4 — Wrapping a table is your call now
- **A table never wraps itself in a membrane.** The old rule ("tables of 8+ rows wrap automatically on format") is gone — no more membrane comments appearing around a table you only wanted aligned.
- **One checkable menu item instead of two.** The ▾ menu shows **✓ Membrane this table**: a green check when the table the cursor is in is wrapped, empty when it isn't. Click to toggle wrap ⇄ unwrap.
- Opening the ▾ menu no longer leaves a tooltip covering it.

### v3.0.1–3.0.2 — Sharper column alignment
- **CJK columns line up tighter.** Padding is computed from each row's running position instead of rounding every cell on its own, so the drift that used to build up toward the right edge is gone. Set `laiMembrane.tableCjkWidth = 2` for a perfectly even grid in a fixed-width font.
- **A merged cell's overflow is shared across the columns it spans**, so no single column balloons while its neighbours stay narrow.

### v3.0.0 — Tables (phased release · Phase 3)
- **Markdown tables you can actually work in.** The grid button in Me Dock formats the table under your cursor; **Tab / Shift+Tab** and **↑ / ↓** walk cell to cell instead of dropping you into raw pipes.
- **Merged cells that survive as plain Markdown.** A merge is recorded in a comment, so the file stays valid GFM everywhere else — the merge is drawn in the editor, never baked into the text.
- **Duplicate or delete a whole row or column** in one command, merges included.
- Third of the weekly phased-release unlocks: everything ships in one build, and each week opens one more feature at the door.

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
