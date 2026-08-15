// 開発用ツール(vsix除外): MeTeX(上付き/下付き)の読み取りを、実データで一覧にする検証器。
//
// v4.0.221(俊克 8/15「この上付き/下付きのテストデータも作って下さい。いろんな式を書いて、何か抜けが無いか?」)
// ★写経しない= extension.js の `meosMeTexTokens` を**そのまま**呼ぶ。矢印の数と成立した数を並べるので、
//   「書いたのに効いていない」行が一目で分かる(⚠️)。効かないのが**正しい**行(宣言が要る/コードスパン/空白)も
//   同じ印で出るので、一覧を読んで判断する。数えるだけで、良し悪しは決めない。
//
// 使い方:  node src/check_metex.js MeOS/metex-test.md
//          node src/check_metex.js "…/Kt_19580126S08JST.md"   ← 日記の実データを数える
const fs = require('fs');
const path = require('path');
const Module = require('module');

// ---- vscode スタブ(この検証器that触るのは純関数だけso最小で足りる) ----
const stub = {
  Position: class { constructor(l, c) { this.line = l; this.character = c; } },
  Range: class { constructor(a, b, c, d) { if (typeof a === 'object') { this.start = a; this.end = b; } else { this.start = { line: a, character: b }; this.end = { line: c, character: d }; } } },
  MarkdownString: class { constructor(v) { this.value = v; } },
  ThemeColor: class { }, Diagnostic: class { },
  EventEmitter: class { constructor() { this.event = () => ({ dispose() { } }); } fire() { } dispose() { } },
  DecorationRangeBehavior: { ClosedClosed: 1, OpenOpen: 0, ClosedOpen: 2, OpenClosed: 3 },
  OverviewRulerLane: { Left: 1 }, EndOfLine: { LF: 1, CRLF: 2 },
  DiagnosticSeverity: { Hint: 3 }, CodeActionKind: { QuickFix: 'quickfix' },
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
Module._load = function (r) { if (r === 'vscode') return stub; return origLoad.apply(this, arguments); };

const SRC = path.join(__dirname, 'extension.js');
const TMP = path.join(require('os').tmpdir(), 'meos_check_metex_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meosMeTexTokens };\n', 'utf8');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }

const file = process.argv[2];
if (!file) { console.log('使い方: node src/check_metex.js <mdファイル>'); process.exit(2); }
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);

let tot = 0, arrowsAll = 0, gaps = 0, mixed = 0;
const rows = [];
for (let i = 0; i < lines.length; i++) {
  const t = lines[i];
  const arrows = (t.match(/[↑↓]/g) || []).length;
  if (!arrows) continue;
  const toks = T.meosMeTexTokens(t, null);
  arrowsAll += arrows; tot += toks.length;
  for (const k of toks) { const op = t.slice(k.opStart, k.opEnd); if (/[0-9]/.test(op) && /[A-Za-z]/.test(op) && t.charAt(k.opStart - 1) !== '(') mixed++; }
  const desc = toks.map(k => (k.kind === 'sup' ? '↑' : '↓') + '[' + t.slice(k.opStart, k.opEnd) + ']' + (k.depth > 1 ? ('深' + k.depth) : '') + '←' + JSON.stringify(k.base)).join(' ');
  if (toks.length !== arrows) gaps++;
  rows.push({ ln: i + 1, ok: toks.length === arrows, arrows, n: toks.length, text: t.trim().slice(0, 46), desc });
}
console.log('metex: ' + file);
console.log('  矢印 ' + arrowsAll + ' 本 / 成立 ' + tot + ' 個 / 一部でも効いていない行 ' + gaps + ' 行 / 素の肩腰に数字と英字that混ざったもの ' + mixed + ' 個');
for (const r of rows) console.log((r.ok ? '   ' : ' ⚠ ') + 'L' + String(r.ln).padEnd(6) + r.text.padEnd(48) + ' ' + r.arrows + '/' + r.n + '  ' + r.desc);
