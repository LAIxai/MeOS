// 開発用ツール(vsix除外): ★**2つの物差しを突き合わせる検証器**
//
// v4.0.215(俊克 8/15「①表の整形が凸凹に見える」): 表の整形は「画面に見えている幅」でセルを詰める(v4.0.74)。
// so **描く側(装飾)と幅を測る側(整形)that同じ形を見ていない**と、隠れる字の数が食い違い、`|` thatセルごとに
// 前後して**凸凹**に見える。ここは、その2つを実データで突き合わせて食い違いを出す。
//
// ★やり方= **写経しない**。VS Codeのスタブを噛ませて extension.js を**そのまま読み込み**、
//   ①装飾の関数を実際に呼んで「画面で隠れる範囲」を受け取る ②整形that使う meosStrWidth と比べる。
//   → 正規表現をテスト側に書き写すと「本体と食い違っても気づけない」= [[reference_headless_vscode_stub_harness]]
//
// 使い方:  node src/check_rulers.js <測るmdファイル>            (既定=同梱のサンプル行)
//   食い違いthat在れば一覧を出して exit 1。
//
// ★注意= ここthat見るのは**幅**だけ。実際の見た目(色/太さ/折り返し)は実機で見ること。
const fs = require('fs');
const path = require('path');
const Module = require('module');

// ---- vscode スタブ(装飾の型と範囲thatあれば足りる) ---------------------------------------------
class Position { constructor(line, character) { this.line = line; this.character = character; } }
class Range {
  constructor(a, b, c, d) {
    if (a instanceof Position) { this.start = a; this.end = b; } else { this.start = new Position(a, b); this.end = new Position(c, d); }
  }
}
const stub = {
  Position, Range,
  MarkdownString: class { constructor(v) { this.value = v; } },
  ThemeColor: class { constructor(id) { this.id = id; } },
  Diagnostic: class { constructor(r, m, s) { this.range = r; this.message = m; this.severity = s; } },
  EventEmitter: class { constructor() { this.event = () => ({ dispose() { } }); } fire() { } dispose() { } },
  DecorationRangeBehavior: { ClosedClosed: 1, OpenOpen: 0, ClosedOpen: 2, OpenClosed: 3 },
  OverviewRulerLane: { Left: 1, Center: 2, Right: 4, Full: 7 },
  EndOfLine: { LF: 1, CRLF: 2 },
  DiagnosticSeverity: { Hint: 3, Information: 2, Warning: 1, Error: 0 },
  CodeActionKind: { QuickFix: 'quickfix' },
  Uri: { file: (p) => ({ toString: () => 'file://' + p, fsPath: p }) },
  window: {
    createTextEditorDecorationType: (o) => ({ __opts: o, dispose() { } }), activeTextEditor: null,
    showInformationMessage() { }, showWarningMessage() { }, setStatusBarMessage() { },
    createStatusBarItem: () => ({ show() { }, hide() { }, dispose() { } }),
    onDidChangeActiveTextEditor: () => ({ dispose() { } }), onDidChangeTextEditorSelection: () => ({ dispose() { } }),
    onDidChangeTextEditorVisibleRanges: () => ({ dispose() { } }), registerWebviewViewProvider: () => ({ dispose() { } }),
  },
  workspace: {
    getConfiguration: () => ({ get: (k, d) => d, update() { } }), textDocuments: [], workspaceFolders: [],
    onDidChangeTextDocument: () => ({ dispose() { } }), onDidSaveTextDocument: () => ({ dispose() { } }),
    onDidOpenTextDocument: () => ({ dispose() { } }), onDidChangeConfiguration: () => ({ dispose() { } }),
  },
  languages: {
    createDiagnosticCollection: () => ({ set() { }, clear() { }, delete() { }, dispose() { } }),
    registerDocumentLinkProvider: () => ({ dispose() { } }), registerCodeActionsProvider: () => ({ dispose() { } }),
    registerHoverProvider: () => ({ dispose() { } }),
  },
  commands: { registerCommand: () => ({ dispose() { } }), executeCommand: () => Promise.resolve() },
  env: { clipboard: { writeText: () => Promise.resolve() } },
  ExtensionMode: { Test: 3 }, TextEditorRevealType: { InCenter: 2 },
  StatusBarAlignment: { Left: 1, Right: 2 }, ViewColumn: { One: 1 },
};
const origLoad = Module._load;
Module._load = function (request) { if (request === 'vscode') return stub; return origLoad.apply(this, arguments); };

// ---- extension.js を「そのまま」読み込む(末尾に取り出し口を足した写しを作るだけ) -----------------
const SRC = path.join(__dirname, 'extension.js');
const TMP = path.join(require('os').tmpdir(), 'meos_check_rulers_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + `
module.exports.__t = { meosStrWidth, meosCharWidth, meosSplitTableRow, meosIsTableSeparator, meosIsTableLine,
  makeDecorations, applyPrettyLabels, meosApplyBoldDecorations, meosApplyMeLinkDecorations, meosApplyMeTexDecorations,
  meosApplyTableMergeDecorations, meosApplyTableCalcDecorations, meosApplyFuncDecorations };
`, 'utf8');
let T;
try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }

// ---- 偽エディタ(範囲を無視しない=v4.0.214の教訓「試験装置that嘘をつく」) -------------------------
let seq = 0;
function makeEditor(lines) {
  const id = ++seq; // 版ごとに別のURI=本体のキャッシュを跨がせない(同じURIだと2つ目以降thatキャッシュで素通りする)
  const doc = {
    languageId: 'markdown', lineCount: lines.length, version: 1, eol: 1,
    uri: { toString: () => 'file:///check' + id + '.md', fsPath: '/check' + id + '.md', scheme: 'file' }, fileName: '/check' + id + '.md',
    lineAt: (i) => { const n = (typeof i === 'number') ? i : i.line; const text = lines[n] == null ? '' : lines[n];
      return { text, lineNumber: n, range: new Range(n, 0, n, text.length), rangeIncludingLineBreak: new Range(n, 0, n, text.length),
        firstNonWhitespaceCharacterIndex: text.length - text.replace(/^\s+/, '').length, isEmptyOrWhitespace: text.trim() === '' }; },
    getText: (r) => { if (!r) return lines.join('\n'); const a = r.start, b = r.end;
      if (a.line === b.line) return (lines[a.line] || '').slice(a.character, b.character);
      const out = [(lines[a.line] || '').slice(a.character)];
      for (let i = a.line + 1; i < b.line; i++) out.push(lines[i] || '');
      out.push((lines[b.line] || '').slice(0, b.character)); return out.join('\n'); },
    offsetAt: (p) => { let o = 0; for (let i = 0; i < p.line; i++) o += (lines[i] || '').length + 1; return o + p.character; },
    positionAt: (off) => { let o = 0; for (let i = 0; i < lines.length; i++) { const L = (lines[i] || '').length + 1; if (off < o + L) return new Position(i, off - o); o += L; } return new Position(Math.max(0, lines.length - 1), 0); },
    validateRange: (r) => r, validatePosition: (p) => p, save: () => Promise.resolve(true),
  };
  const last = Math.max(0, lines.length - 1), pos = new Position(last, 0);
  const sel = { active: pos, anchor: pos, start: pos, end: pos, isEmpty: true }; // カーソルは測る表の外に置く(カーソル行は生表示)
  const calls = [];
  return { document: doc, selection: sel, selections: [sel], visibleRanges: [new Range(0, 0, last, 0)], options: {},
    setDecorations: (deco, items) => calls.push({ deco, items: items || [] }), __calls: calls };
}
// 「隠す」装飾かどうかは**本体that渡した option**で決める(検証器that勝手に決めない)
// ★`font-size: 0.68em`(上付/下付)を「隠す」と読まないこと= **0で始まるだけの値**に引っ掛かる(最初の版thatこれで嘘をついた)。
const isHide = (d) => { const td = String(((d && d.__opts) || {}).textDecoration || ''); return /font-size:\s*0(?:px)?\s*(?:!important)?\s*;/.test(td) || /opacity:\s*0(?!\.)/.test(td) || /display:\s*none/.test(td); };
// v4.0.273: **幅0の付け足しは、画面の桁を1つも使わない**(`width: 0` ＋ position:relative で真上/真下に描く物)。
//   ★ここを知らないと、Σの上下限を「セルの中に並んだ字」と数えて、整形側と食い違う(実際に食い違った)。
//   長さを持つラベル(参照符の番号など)は今まで通り数える。
const _zeroW = (a) => !!a && typeof a.textDecoration === 'string' && /width:\s*0(?!\d)/.test(a.textDecoration);
const added = (o) => { let s = ''; for (const k of ['before', 'after']) if (o && o[k] && typeof o[k].contentText === 'string' && !_zeroW(o[k])) s += o[k].contentText; return s; };

function screenOf(lines) {
  const ed = makeEditor(lines); T.makeDecorations();
  for (const p of ['applyPrettyLabels', 'meosApplyBoldDecorations', 'meosApplyMeLinkDecorations', 'meosApplyMeTexDecorations',
    'meosApplyTableMergeDecorations', 'meosApplyTableCalcDecorations', 'meosApplyFuncDecorations']) { try { T[p](ed); } catch (_) { } }
  const hide = new Map(), add = new Map();
  for (const c of ed.__calls) {
    const h = isHide(c.deco), ex = added(c.deco && c.deco.__opts);
    for (const it of c.items) {
      const r = it && it.range ? it.range : it; if (!r || !r.start) continue;
      if (h) { if (!hide.has(r.start.line)) hide.set(r.start.line, []); hide.get(r.start.line).push([r.start.character, r.end.character]); }
      const e2 = ex || ((it && it.renderOptions) ? added(it.renderOptions) : '');
      if (e2) { if (!add.has(r.start.line)) add.set(r.start.line, []); add.get(r.start.line).push([r.start.character, e2]); }
    }
  }
  return { hide, add };
}
function visibleWidth(text, from, to, hideL, addL) {
  const hid = new Array(text.length).fill(false);
  for (const [s, e] of (hideL || [])) for (let i = Math.max(0, s); i < Math.min(text.length, e); i++) hid[i] = true;
  let w = 0;
  for (let i = from; i < to && i < text.length; i++) { if (hid[i]) continue; const cp = text.codePointAt(i); if (cp > 0xFFFF) { w += T.meosCharWidth(cp); i++; } else w += T.meosCharWidth(cp); }
  for (const [ch, s] of (addL || [])) if (ch >= from && ch <= to) for (const c of s) w += T.meosCharWidth(c.codePointAt(0)); // afterはセル末尾に来る
  return w;
}
const cellRanges = (line) => { const out = []; let st = null;
  for (let i = 0; i < line.length; i++) if (line.charAt(i) === '|' && (i === 0 || line.charAt(i - 1) !== '\\')) { if (st !== null) out.push([st, i]); st = i + 1; }
  return out; };

// ---- 測る --------------------------------------------------------------------------------------
// ★同梱サンプル= 直した5つの穴を1枚に(太字/斜体/語中の`_`/ハイライト/取消線/上付下付/コードスパン/リンク印)。
// ★リンクの印 `[表示]()` は**指定と対**(指定that無ければ画面は生表示)so、指定行を必ず添える=v4.0.212の教訓。
const SAMPLE = [
  '| 記法          | 見え方                | 備考                    |',
  '| ------------- | -------------------- | ----------------------- |',
  '| **太字**      | *斜体*               | MEMORY_LOG_ARCHIVE.md   |',
  '| ==強調==      | ~~取消~~             | M↓W                     |',
  '| `**as-is**`   | ***太字斜体***       | [表示]()                |',
  '<!-- Mew!FC [](https://example.com) -->',
  '',
];
const file = process.argv[2];
const src2 = file ? fs.readFileSync(file, 'utf8').split(/\r?\n/) : SAMPLE;

const blocks = [];
for (let i = 0; i < src2.length;) {
  if (!T.meosIsTableLine(src2[i])) { i++; continue; }
  let j = i; while (j + 1 < src2.length && T.meosIsTableLine(src2[j + 1])) j++;
  let sep = false;
  for (let k = i; k <= j; k++) if (T.meosIsTableSeparator(T.meosSplitTableRow(src2[k]))) { sep = true; break; }
  if (sep && j > i) blocks.push([i, j]);
  i = j + 1;
}
let cells = 0; const bad = [];
for (const [a, b] of blocks) {
  const from = Math.max(0, a - 2), to = Math.min(src2.length - 1, b + 2); // 真下のFC指定行も読ませる
  const lines = src2.slice(from, to + 1);
  let sp; try { sp = screenOf(lines); } catch (_) { continue; }
  for (let ln = a; ln <= b; ln++) {
    const text = src2[ln];
    if (T.meosIsTableSeparator(T.meosSplitTableRow(text))) continue;
    const hide = sp.hide.get(ln - from) || [], add = sp.add.get(ln - from) || [];
    for (const [s, e] of cellRanges(text)) {
      const raw = text.slice(s, e); if (!raw.trim()) continue;
      cells++;
      const lead = raw.length - raw.replace(/^\s+/, '').length, trail = raw.length - raw.replace(/\s+$/, '').length;
      const A = T.meosStrWidth(raw.trim()), B = visibleWidth(text, s + lead, e - trail, hide, add);
      if (Math.abs(A - B) > 1e-9) bad.push({ line: ln + 1, A, B, raw: raw.trim() });
    }
  }
}
console.log('rulers: 表' + blocks.length + 'ブロック / ' + cells + 'セル を測った (' + (file || '同梱サンプル') + ')');
if (!bad.length) { console.log('rulers: OK (整形that使う幅 = 画面で見えている幅)'); process.exit(0); }
console.log('rulers: MISMATCH ' + bad.length + ' セル -> 整形と画面that違う幅を見ています(表that凸凹になります)');
for (const x of bad.slice(0, 20)) console.log('   L' + x.line + ' 整形=' + Math.round(x.A * 100) / 100 + ' 画面=' + Math.round(x.B * 100) / 100 + '  ' + JSON.stringify(x.raw).slice(0, 120));
process.exit(1);
