# MeOS — Membrane OS

<p align="center">
  <!-- 新ロゴ(MeW)とM↓⊕を1枚に(GitHubは<table>に必ず枠線を付けるので合成にした)。2つで1つを表わす分身。 -->
  <img src="https://raw.githubusercontent.com/LAIxai/MeOS/main/media/logo/mew-header-3.png" alt="MeW - Membrane Warpspace / Markdown(+)" width="776">
</p>

<p align="center">
  <!-- 記念碑: v2.0(2026.07.20 Open VSX v2.0.63公開)時点の記録。DL数=1014 と release=v2.0 の**2つとも**意図的に固定。
       実数や最新版と合わなくても更新しないこと(v4.0.108で一度間違えて release を v4.0 にしてしまった)。 -->
  <a href="https://open-vsx.org/extension/lai/lai-membrane"><img src="https://img.shields.io/badge/downloads-1014-4caf50" alt="Downloads on Open VSX (1014 at the v2.0 release)"></a>
  <a href="https://github.com/LAIxai/MeOS/releases/latest"><img src="https://img.shields.io/badge/release-v2.0-2196f3" alt="Latest Release (v2.0)"></a>
</p>

### **Markdown⊕** — *Markdown, plus.*

MeOS speaks **Markdown⊕**: plain Markdown, extended with **membranes** (the ⊕). A membrane is just a comment — so a Markdown⊕ document stays 100% valid Markdown, and the very same notation works in code. Markdown gave you *formatting*; **Markdown⊕ adds structure, navigation, and bookmarks that bring you back** — without touching your data.

> **A new world — where comments become commands.**
>
> **It never stains your code or your manuscript — not by a millimeter.**
>
> **The lightest OS. Warp anywhere and jump both ways with the Hyper TOC.**
>
> **Your code undergoes cleavage (卵割) and becomes a single living organism.**
>
> **The ultimate environment for creation!!!**
>
> **And the future is in view: every membrane on Earth, connected.**
>
> ## **I, My, MeOS 🐣**
>
> ## **Ai, Mai, MeOS 🐥**
>
> ## **You(AI) & I(LAI) 🐔**

### NEW in v4.0 — your data is plain Markdown; the instructions live in comments

v4.0 finishes the idea. **Every mark you write is real Markdown** — headings, lists, bold, highlight,
strikethrough, links. Everything MeOS needs sits in an HTML comment at the **end of the line**, where it
never comes between your words.

```md
## Morning  2026.08.09<!-- Mew! H2 (white/green)//[]tip= -->
1. first item<!-- Mew! -1.(white/green)//[]tip= -->
1. second item<!-- Mew! -1.(white/green)//[]tip= -->
Warp to [the design note]() from any word.<!-- Mew! [](design_20260809s101533JST) -->
```

Open that file anywhere else and you get an H2, an ordered list, and a link label. Nothing is broken,
nothing is proprietary. Open it in MeOS and the comments disappear: you read prose, and the words are live.

- **Warp anywhere** — `[label]()` plus one comment jumps to a membrane **by name**, or opens a URL.
  The destination never sits inside your sentence, so the text after a link stays on the same line.
- **Numbers that never rot** — ordered lists are written `1.` every time (Markdown's own escape hatch).
  MeOS counts them on screen, so inserting a line in the middle never renumbers your file.
- **Mew! 🐱** — every MeOS comment starts with `Mew!`, so `grep Mew!` finds all of them.
  Still have the old notation? Press **↻** to see where it is for five seconds, press **🐱** to convert
  what is on your screen. One click, one undo — your 100k-line past is never rewritten in one go.
- **Your token, watched** — the GitHub push row shows how many days your access token has left, at the right
  edge where you can see it **even with the panel folded**. When it expires, the disconnect button turns into
  a one-press fix.

<p align="center">
  <img src="https://raw.githubusercontent.com/LAIxai/MeOS/main/media/hero/v3.1-table-calc.png" alt="Spreadsheet totals with no cell addresses — the formula is one HTML comment, the result is plain text" width="58%"><br>
  <sub><b>NEW in v3.1 — spreadsheet totals without cell addresses.</b> Sum and product by <b>direction</b>, not coordinates: <code>&lt;!--Σ↑--&gt;</code> sums the column above, <code>&lt;!--Π←2--&gt;</code> multiplies the two cells to the left. No <code>SUM</code>, no <code>B2:B4</code>. The formula hides in a comment; the result stays plain text in the cell, so it reads on GitHub and with grep — all in the <b>main editor</b>, not a preview.</sub>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/LAIxai/MeOS/main/media/hero/v3.1-recalc-highlight.png" alt="Changed cells flash green — totals update live on screen, the file is baked only on save" width="58%"><br>
  <sub><b>Auto mode — totals move as you type, the file stays clean.</b> Edit a quantity and the row's amount and the grand total update live on screen; the <code>.md</code> is untouched until you save (Cmd+S), which bakes the results in and <b>flashes the changed cells green</b>. Manual mode (recompute on ▦, Excel-style) is one option away.</sub>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/LAIxai/MeOS/main/media/hero/v3-table-merge.png" alt="Cell merge — the raw data stays valid GFM, MeOS shows the merge in the main editor" width="72%"><br>
  <sub><b>NEW in v3.0 — tables that never touch your data.</b> GFM has no colspan / rowspan; MeOS adds them with one HTML comment (<code>&lt;!--🤝→2--&gt;</code>). The cell count never changes, so the file stays valid GFM and the marker is invisible on GitHub. The merge shows in the <b>main editor</b> — not a preview pane; put the cursor on the row and the raw marker returns for inline editing.</sub>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/LAIxai/MeOS/main/media/hero/v2-lifelong-diary.png" alt="Lifelong diary — the Ⓣday base-point button and its day list" width="92%"><br>
  <sub><b>In v2.0 — your whole life's diary, from one button.</b> The right <b>Ⓣday</b> is a polymorphic base point: type a <b>date</b> to warp there, a <b>word</b> to search by meaning, or <b>T</b> for today — then ↻ threads a day across Week / Month / Year (a 10-year diary). All structure lives in comments, so it never touches your prose.</sub>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/LAIxai/MeOS/main/media/hero/hero-image-00TOP.png" alt="The whole window" width="92%"><br>
  <sub><b>The whole picture.</b> Editor = strata of membranes · right = the Me Dock cockpit.</sub>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/LAIxai/MeOS/main/media/hero/hero-image-01.png" alt="13,956 lines in one membrane" width="92%"><br>
  <sub><b>Line 4 &rarr; 13,957.</b> 13,956 lines inside a single membrane — generated by AI, in one file.</sub>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/LAIxai/MeOS/main/media/hero/hero-image-02.png" alt="Me Dock cockpit" width="92%"><br>
  <sub><b>The cockpit.</b> Hyper TOC · Current Me · bookmarks · 📊 access counter.</sub>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/LAIxai/MeOS/main/media/hero/hero-image-05.png" alt="Soft delete by strikethrough" width="92%"><br>
  <sub><b>Soft delete.</b> Struck-through text is excluded from the count — see what you cut before you cut it.</sub>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/LAIxai/MeOS/main/media/hero/hero-image-06.png" alt="A lifelong diary in one file" width="92%"><br>
  <sub><b>One file, a whole life.</b> From line 1 to line 46,997 — all inside one membrane.</sub>
</p>

---

## MeOS for VSCm — Fold Membrane, Warp Anywhere

> Part of **MeOS™ for anywhere** — the universal membrane notation.  
> Abbreviated as **μOS** (read: mu-OS / mi-OS / me-OS).  
> *"micro-OS" on the surface — **membraneOS** at the root.*

> **VSCm** = **VSCodium folded.** The middle `odiu` is collapsed (just as MeOS folds membrane content), leaving the final **m** — the same **m** that begins **m**embrane. The host editor renamed by its own guest notation: self-referential, compact, and symbolic.

*The VSCm implementation of MeOS. MeOS notation itself is editor-independent; future implementations may target Joplin, Cursor, Obsidian, or any editor that supports comments.*


## The Crux of Membrane Notation

**A membrane is a comment — so it leaves your original data as it is.**  
**That is the crux of Membrane notation.**  
**More than a boundary, a membrane has its own functions — comments (semantic metadata) create structure, like a cell membrane.**

## VSCodium meets Me.  
## It becomes MeOS — the Brain Editor.

### Beyond Hyperlink — Navigate by Name, Return by Bookmark

**Membrane names are proper nouns.** Type a name in a TOC or a checklist — or search your whole workspace for it — and jump straight to that membrane.

**🔖 Bookmarks bring you home.** Drop up to three "place" bookmarks; one click flies you to your **Front Anchor** — the very line you're writing now. With two bookmarks, it becomes a **bidirectional jump**: leap there, and back, again and again.

Me (Membrane) transforms VSCodium into a Brain Editor for writers, developers, researchers, and AI.

Membrane structure introduces named, foldable, navigable thought architecture into code and text:

- Fold beyond headings
- Jump instantly by membrane name — from TOCs, checklists, or workspace search
- Return anywhere with bookmarks — three place markers and a one-click Front Anchor
- Use membrane names as proper nouns for workspace-wide discovery
- Build AI-readable and human-readable structured memory
- Transform notes, code, and knowledge into MeOS

This extension itself was co-created with AI trained to use membrane notation.

Once experienced, VSCodium can evolve from a code editor into a note system, thought system, and Brain Editor.

MeOS imagines a future where editors, note apps, and even operating systems become membrane-native.

---

## Core Formula

```text
MeOS := VSCodiuM = VSCodium + Membrane
```

```text
Hyperlink connected pages.
Membranes connect meaning — by name, from anywhere.
```

```text
MeOS for anywhere  ← the universal notation (parent brand)
MeOS for VSCodium  := μVSCodium      (this implementation, folded form)
MeOS for Mac       := μMac           (future)
MeOS for Phone     := μPhone         (future)
MeOS for Pad       := μPad           (future)
MeOS for OS        := μOS            (the OS layer, where the abbreviation folds into itself)
```

**MeOS** is the legal/registered name. **μOS** is the abbreviation /
stylized form, used for logos, titles, and folded forms (μVSCodium,
μMac, μPhone). Both refer to the same notation; the choice is visual.

Read the prefix **μ** as "μ" (mu), "mi", or "me" — your call.
The Greek letter is the *folded* form (written, compact).
The spoken word is the *unfolded* form (mePhone, miPhone, μPhone).
The meaning is **「私の」** — *mine*, *one with me*.

**μ is simply the Greek letter that corresponds to English m.**
Both descend from Phoenician *mem* (𐤌, "water" — the sound of waves).
The shift m → μ is not a substitution to a foreign symbol; it is the same
letter, traced back to its foundational form. Latin **m**, Greek **μ**,
Cyrillic **м** — all carry the same sound across scripts.

Apple's **i** prefix marked devices *for* the individual.
The **μ** prefix marks devices *structurally aligned with* the self.
Where **i** pointed outward at "the individual customer",
**μ** points inward at "the self that has folded into the device".

μ is also the SI symbol for *micro* — the smallest meaningful unit,
the most compact carrier of meaning. A perfect membrane.

And μ is the first letter of Greek **μέμβρανα** (*membrana*, "membrane")
itself. The glyph **structurally encodes its own meaning** — μOS reads
as "micro-OS" on the surface, but unfolds to **membraneOS** at its root.

---

## License & Trademark

### Notation — Public Domain

The **MeOS notation specification** (membrane syntax, cross-reference `⇄`,
Me notation `⇒`, badge format, depth markers, etc.) is dedicated to
**the public domain**. The notation is intended to become a universal
technical convention, in the spirit of open scientific terms like
**iPS**, **DNA**, **JSON**, and **YAML**.

Anyone may implement, document, teach, fork, or extend the MeOS
notation in any editor, language, framework, or system **without
permission, attribution, or fee**. Derivative notations are welcome.

### Software — MIT License

This VSCodium extension's source code is released under the **MIT
License**. See `LICENSE` in the repository root. The extension is
freely available for use, study, modification, and redistribution.

### Trademark — Common-Law ™ (Unregistered)

**MeOS™** and **μOS™** are **unregistered common-law trademarks**
asserted by **川嶋俊克 (Toshikatsu Kawashima)** as of **2026.05.16**,
with prior art established via this repository's GitHub commit history.

The following **name variants are also asserted as part of the MeOS™
family**, primarily as defensive prior-art declarations against
squatting in first-to-file jurisdictions (notably China):

| Script | Variants |
|--------|----------|
| Latin / Greek | **MeOS™**, **μOS™** |
| Chinese (semantic) | **微OS™** (micro-OS), **膜OS™** (membrane-OS) |
| Chinese (phonetic) | **美OS™**, **妙OS™**, **米OS™** (≈ "mee-OS" sounds) |
| Japanese | **ミーオス™**, **ミューオス™**, **メオス™** |
| Korean | **미OS™** (mi-OS) |

Implementation naming pattern: **MeOS for [target]** (e.g., *MeOS for
VSCodium*, *MeOS for Mac*, *MeOS for Phone*).

No formal trademark registration is currently pursued. The intent
mirrors the iPS / JSON / Markdown model: the **term is open, the
implementation is free, the brand is identifiable**.

You are explicitly permitted to:

- Use the names **MeOS** and **μOS** to refer to the notation and
  its compatible implementations (e.g., *"MeOS for Vim"*, *"a μOS
  extension"*, *"MeOS notation"*).
- Build, distribute, and sell compatible implementations under
  derived names such as *"MeOS for [your target]"*.
- Teach, write about, demonstrate, and discuss the notation freely.

You are asked **not** to:

- Apply the name **MeOS** or **μOS** to products that are
  **incompatible** with the published notation specification —
  use a different name in that case.
- Imply official endorsement or affiliation when none exists.

Formal trademark registration may be pursued in the future **only
for defensive purposes** (preventing third-party squatting, e.g.,
in first-to-file jurisdictions). Such registration, if it happens,
will not restrict legitimate free use described above.

### Acknowledgments — Conceptual Lineage

MeOS stands on the shoulders of:

- **Gheorghe Păun** (1998) — *Membrane Computing / P systems*. The
  first formal use of "membrane" as a computational primitive.
  MeOS approaches the same word from a different direction: not as
  a model of computation, but as a model of *human and AI thought
  structure*.
- **Shinya Yamanaka** (2006) — *iPSC*. The lowercase **i**,
  consciously inspired by Apple's naming, became a universal
  scientific term without trademark restriction. MeOS adopts the
  same open-term model.
- **Steve Jobs / Apple** (1998) — the **i** prefix. The precedent
  for a single-letter folded brand carrier that becomes its own
  era. MeOS's **μ** continues this lineage, traced back through
  Latin **m** to Phoenician **mem** (𐤌, "water").

---

## Features

- **Plain Markdown, always (v4.0)** — headings, lists, bold, highlight, strikethrough and links are written as
  real Markdown; MeOS reads its own settings from a comment at the end of the line. Your file renders correctly
  on GitHub, in any editor, and in any Markdown tool — with or without MeOS installed.
- **Warp anywhere (v4.0)** — turn any word into a jump to a membrane by name, or to a URL, without putting the
  destination in the middle of your sentence.
- **Mew! 🐱 (v4.0)** — one signature makes every MeOS comment grep-able, and the cat converts old notation
  screen by screen, at your pace. Marks are off by default; ↻ shows them for five seconds.
- **Membranes** — comment-based structure that leaves your source untouched (decoration-only). **Fold** a huge file into a clean skeleton in one keystroke.
- **Hyper TOC (H-TOC)** — jump anywhere from an outline panel. *One structure: read by AI (in-source, grep-able) and navigated by you (the panel).*
- **Current Me** — always know which membrane the cursor is in; 3-point jump (open ⇔ close ⇔ cursor).
- **Zoom Me!** — focus into a sub-region, then return.
- **Writer formatting** — highlight / strikethrough / headings with text & background colors and `//comments` (editor⇄author notes), via one-tap buttons.
- **🔖 Bookmarks — leap there, and back** — up to 3 "place" bookmarks with a one-click **Front Anchor** (the line you're writing right now). Two bookmarks make a **bidirectional jump**: there, and back, again and again. A safety net so you never lose your home.
- **▶◀ Reference marks (point membranes)** — named, grouped, grep-able in-text bookmarks that live in your text and travel with Git. Create a group via **Edit▾ → Reference** (pick a canonical symbol: ※ † ‡ * §), issue marks with the **💤 button** (one click parks a "do it later" point; the new mark becomes **F**), and cycle a group with the **※ button** (one click jumps to F, click again to walk the group). Footnotes (†n) are simply the most classic use of reference marks — the mark sits in the text, the explanation lives with the mark.
- **Raw view (👁 button or type `kakaka`)** — toggle all rendering off to read the plain markup, or for a distraction-free editor. Cast the spell again to restore MeOS. *(CJK input is already smooth — decorations live in the gutter — so you rarely need this.)*

> ⚙️ **Recommended setting:** `"editor.wrappingIndent": "none"`
> Keeps wrapped lines flush, so they sit cleanly next to the gutter membrane lanes.

> 📌 **Membrane lanes & wrapped lines — a quirk with an upside.**
> Membrane lanes are drawn in the **gutter** (glyph margin), which keeps the text area completely untouched — most importantly, **CJK / IME input stays perfectly smooth** (no caret wedging). One side effect: the current editor API renders a gutter decoration **only on the first visual row** of a wrapped line, so the lane shows a small break wherever a line wraps.
> **Many find this useful rather than annoying:** the break quietly marks two things at a glance — the **start of each membrane**, and any **unusually long paragraph** (the rare line that wraps). In prose, most lines fit on one row, so a break stands out exactly where the text is dense. Like the rest of MeOS, *the shape stays constant; only the signal changes.*
> Prefer a perfectly continuous lane? Set `"laiMembrane.gutterLanes": false` to draw it inside the text instead — at the cost of some IME friction (so the gutter is the default).
> **A note for VSCodium / VS Code maintainers:** an API to let glyph-margin / gutter decorations span all visual rows of a wrapped line (as breakpoints and folding controls already do internally) would let MeOS offer both a perfectly continuous lane *and* clean IME input. We'd love to see it. 🙏

## Markdown⊕ — Welcome to the New World

**Markdown⊕** — the lightness of Markdown, with usability that leaves WYSIWYG far behind.

Your notes stop scattering. **One file: a one-month diary, or a ten-year one.** Goodbye to the sea of endlessly fragmented files. **At last, a file becomes truly your own.**

Wherever your data lives, warp to it in an instant through one entrance — the **Hyper TOC**. With **three "anywhere bookmarks,"** flip between three jobs at full speed. Stride through gigantic data, stress-free.

The tool that always seemed like it should exist — yet never did. Step in once, and no one goes back to the old world. The old friction vanishes as if it had never existed — a comfortable lifelog life awaits.

And this is a fact: **one AI wrote this membrane-structured code, and another AI took over and carried on without ever getting lost.**… Put that structure to work as AI training data, and it could raise AI performance dramatically — that possibility, too, is here.

— One last thing. **This extension — a single file of over 10,000 lines — was generated almost entirely by AI.**… With no spec and no design document, **I produced it in just one month.**

**— A collaboration between You(AI) & I(LAI).**

---

### Markdown⊕ ― 新世界へようこそ（日本語）

**Markdown⊕** ― Markdown の軽快さはそのままに、WYSIWYG をはるかに凌ぐ快適さを。

ノートは、もう散らばらない。**1ファイルで、1ヶ月日記も、10年日記も。** 無数に分割されたファイルの海に、グッバイ。**やっと、ファイルが"自分の所有物"になる。**

データがどこにあっても、**Hyper TOC** という入口から一瞬でワープ。**3つの「どこでも栞」**で、3つの作業を高速に行き来する。巨大なデータの中を、ノーストレスで闊歩する。

ありそうで、手に入らなかったツール。一度足を踏み入れたら、もう旧世界には戻れない。あの不自由が、まるで嘘のように――快適なライフログ生活を。

そして、**1つのAIが膜構造で書いたコードを別のAIが迷うことなく引き継ぐことができた。これは事実です。**…この構造を AI の学習データに活かせば、AIの性能を飛躍的に引き上げることができる――そんな可能性も秘めている。

― 最後にひとつ。**1ファイル1万行を超えるこの拡張機能は、ほぼすべて AI が生成した。**…私は仕様も設計書も書かずに、**わずか1ヶ月でプロデュースした成果**です。

**― AIと私(LAI)の共作。**

### 🥷 魔法の呪文『かかか』(kakaka)

**`かかか`**（`kakaka` でも可）と打つ。それだけで Raw モード ―― **素のエディタ**に切り替わる。打った文字は自ら消える。

**生のマークアップを覗きたいとき**、あるいは**装飾を消して集中したいとき**に。**呪文をもう一度**唱えれば、MeOS の全機能が戻ってくる。

そして ―― **かな漢字変換は、Raw モードにするまでもなく快適だ。** 装飾はすべてガター（行番号の脇）に描かれ、本文に指一本触れない。**東アジア圏（CJK）の積年の悩み**は、もう終わっている。

ボタンも、メニューも、ショートカットもいらない。**ストレスフリー！**

*Type `kakaka` for a plain editor — to read the raw markup, or to focus with all decorations off. Cast it again to bring MeOS back. (CJK input is already smooth without it: decorations live in the gutter, never touching your text.)*

## Changelog

Full version history: see **[CHANGELOG.md](./CHANGELOG.md)**.
