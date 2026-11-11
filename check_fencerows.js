// 開発用ツール(vsix除外): v5.1.654 コードブロックの紙の段の数= Monaco の折り返しで数える(3段目が紙の外へ出ていた)。
// 使い方:  node src/check_fencerows.js
const fs = require('fs'); const path = require('path'); const Module = require('module');
const stub = {
  Position: class { constructor(l, c) { this.line = l; this.character = c; } },
  Range: class { constructor(a, b, c, d) { if (typeof a === 'object') { this.start = a; this.end = b; } else { this.start = { line: a, character: b }; this.end = { line: c, character: d }; } } },
  Selection: class { constructor(a, b) { this.anchor = a; this.active = b; this.start = a; this.end = b; this.isEmpty = true; } },
  MarkdownString: class { constructor(v) { this.value = v; } }, ThemeColor: class { }, Diagnostic: class { },
  EventEmitter: class { constructor() { this.event = () => ({ dispose() { } }); } fire() { } dispose() { } },
  DecorationRangeBehavior: { ClosedClosed: 1, OpenOpen: 0, ClosedOpen: 2, OpenClosed: 3 },
  OverviewRulerLane: { Left: 1 }, EndOfLine: { LF: 1, CRLF: 2 }, DocumentLink: class { constructor(r) { this.range = r; } },
  DiagnosticSeverity: { Hint: 3 }, CodeActionKind: { QuickFix: 'quickfix' },
  Uri: { file: (p) => ({ toString: () => 'file://' + p, fsPath: p }), parse: (s) => ({ toString: () => s }) },
  window: {
    createTextEditorDecorationType: (o) => ({ __opts: o, dispose() { } }), activeTextEditor: null, visibleTextEditors: [],
    showInformationMessage() { }, showWarningMessage() { }, setStatusBarMessage() { },
    createStatusBarItem: () => ({ show() { }, hide() { }, dispose() { } }),
    onDidChangeActiveTextEditor: () => ({ dispose() { } }), onDidChangeTextEditorSelection: () => ({ dispose() { } }),
    onDidChangeTextEditorVisibleRanges: () => ({ dispose() { } }), registerWebviewViewProvider: () => ({ dispose() { } }),
  },
  workspace: {
    getConfiguration: () => ({ get: (k, d) => d, update() { } }), textDocuments: [], workspaceFolders: [],
    onDidChangeTextDocument: () => ({ dispose() { } }), onDidSaveTextDocument: () => ({ dispose() { } }),
    onWillSaveTextDocument: () => ({ dispose() { } }),   // v4.1.61: 変わっていない保存で更新日を動かさない口
    onDidOpenTextDocument: () => ({ dispose() { } }), onDidChangeConfiguration: () => ({ dispose() { } }),
  },
  languages: {
    createDiagnosticCollection: () => ({ set() { }, clear() { }, delete() { }, dispose() { } }),
    registerDocumentLinkProvider: () => ({ dispose() { } }), registerCodeActionsProvider: () => ({ dispose() { } }),
    registerHoverProvider: () => ({ dispose() { } }),
  },
  commands: { registerCommand: () => ({ dispose() { } }), executeCommand: () => Promise.resolve() },
  env: { clipboard: { writeText: () => Promise.resolve() } },
  ExtensionMode: { Test: 3 }, TextEditorRevealType: { InCenter: 2, InCenterIfOutsideViewport: 2, AtTop: 3 }, TextEditorSelectionChangeKind: { Mouse: 2 },
  StatusBarAlignment: { Left: 1, Right: 2 }, ViewColumn: { One: 1 },
};
const origLoad = Module._load;
Module._load = function (r) { if (r === 'vscode') return stub; return origLoad.apply(this, arguments); };
const SRC = path.join(__dirname, 'extension.js');
const TMP = path.join(require('os').tmpdir(), 'meos_check_pzm_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meosTcwRowsOf, meosRenderCols, meosMemRecentlyFolded, _meosMemJustFolded, MEOS_RULE_LINE_RE, MEOS_RULE_OFF_RE, MEOS_STOP_OFF_URL, MEOS_STOP_SIGN_URL, meosIsRuleAny, meosStopOffText, meosStopNextLines, meosStopSignal, MEOS_STOP_YELLOW_URL, MEOS_STOP_YELLOW_OFF_URL, MEOS_STOP_NONE_URL, meosStopBtnSpots, meosStopToggleSelf, meosStopCycleNext, meosStopKindOf, meosMembraneRuleTarget, meosStopLineNear, makeDecorations, meosApplyTimerLineDecorations, setCtx: (c) => { extensionContext = c; } };\n', 'utf8');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }
let ng = 0;
const ok = (cond, label, got) => { console.log((cond ? '  ok  ' : ' NG   ') + label + (cond ? '' : '   ← ' + JSON.stringify(got))); if (!cond) ng++; };
const gs = new Map(); T.setCtx({ globalState: { get: (k, d) => gs.has(k) ? gs.get(k) : d, update: (k, v) => { gs.set(k, v); return Promise.resolve(); } }, globalStorageUri: { fsPath: '/tmp/x/y' } });
let uid = 0;
function mkDoc(lines) {
  const u = 'file:///pzm' + (++uid) + '.md';
  const d = { L: lines.slice(), version: 1, uri: { toString: () => u, fsPath: u, scheme: 'file' }, languageId: 'markdown', fileName: u, isClosed: false, eol: 1 };
  Object.defineProperty(d, 'lineCount', { get: () => d.L.length });
  d.lineAt = n => ({ text: d.L[n] }); d.getText = () => d.L.join('\n');
  return d;
}
function off(d, p) { let o = 0; for (let i = 0; i < p.line; i++) o += d.L[i].length + 1; return o + p.character; }
const docs = new Map();
class WE { constructor() { this.ops = []; } insert(u, p, t) { this.ops.push([u, p, p, t]); } replace(u, r, t) { this.ops.push([u, r.start, r.end, t]); } delete(u, r) { this.ops.push([u, r.start, r.end, '']); } }
stub.WorkspaceEdit = WE;
stub.workspace.applyEdit = async (w) => { for (const u of new Set(w.ops.map(o => o[0].toString()))) { const d = docs.get(u), ops = w.ops.filter(o => o[0].toString() === u).map(o => [off(d, o[1]), off(d, o[2]), o[3]]); let s = d.L.join('\n'); ops.sort((a, b) => b[0] - a[0]); for (const [a, b, t] of ops) s = s.slice(0, a) + t + s.slice(b); d.L = s.split('\n'); d.version++; } return true; };
function doc(lines) { const d = mkDoc(lines); d.lineAt = n => ({ text: d.L[n], range: { start: { line: n, character: 0 }, end: { line: n, character: d.L[n].length } } }); docs.set(d.uri.toString(), d); stub.workspace.textDocuments.push(d); return d; }
function mkEd(d, sel) {
  const ed = { document: d, selection: sel || { start: { line: 0, character: 0 }, end: { line: 0, character: 0 }, active: { line: 0, character: 0 }, isEmpty: true }, visibleRanges: [{ start: { line: 0 }, end: { line: 99999 } }], selections: [] };
  ed.edit = async (fn) => { const ops = []; fn({ insert: (p, t) => ops.push([off(d, p), off(d, p), t]), replace: (r, t) => ops.push([off(d, r.start), off(d, r.end), t]), delete: (r) => ops.push([off(d, r.start), off(d, r.end), '']) });
    let s = d.L.join('\n'); ops.sort((a, b) => b[0] - a[0]); for (const [a, b, t] of ops) s = s.slice(0, a) + t + s.slice(b); d.L = s.split('\n'); d.version++; return true; };
  return ed;
}
const sel = (a, b) => ({ start: { line: a, character: 0 }, end: { line: b, character: 2 }, active: { line: b, character: 2 }, isEmpty: false });
const H1 = '<!-- {* ♥️▼mP7=f_20261108S005813JST //  *} -->', H2 = '<!-- {* ♥️▲mP7=f_20261108S005814JST //  *} -->';
const R = '<!-- Mew!UFC --- -->', RO = '<!-- Mew!UFC --- 🚫 -->', W = '<!-- Mew!UFC 〜〜〜 -->';
(async () => {
  // 俊克 11.11 am02:48 のスクショ(tmp/v5.1.651_0252)の4行= 実際は 3,2,3,3 段(折り返し50)
  const L = ['02:33:57.170 [arrowToggle] fold by=close …                 ← 1回目の▲で畳んだ(すぐには開いていない)',
    '02:34:03.778 [foldWho] meosAutoFoldSpecLines lines=[▲の行]  ← 6秒後、一括の道が▲の行を畳みに行った',
    '02:34:08.465 [arrowToggle] fold by=close …                 ← 俊克がもう一度▲を押した(=この間に開いていた)',
    '02:34:10.930 [fcOne] 開ける ▲の行                           ← 2.5秒後、また▲の行を開けた'];
  const got = L.map(t => T.meosTcwRowsOf(t, 50));
  ok(JSON.stringify(got) === '[3,2,3,3]', '実物の4行= 3,2,3,3 段(空白の後で折れる分も数える)', got);
  ok(L.some(t => Math.ceil(T.meosRenderCols(t) / 50) < T.meosTcwRowsOf(t, 50)), '旧の見積もり(幅÷折り返し幅)では足りない行がある', 0);
  const SRC = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  ok(/const _rows = _wrapCol \? Math\.max\(1, Math\.min\(20, meosTcwRowsOf\(t, _wrapCol\)\)\) : 1;/.test(SRC) && /const _rows = _wrapCol \? Math\.max\(1, Math\.min\(20, meosTcwRowsOf\(ct, _wrapCol\)\)\) : 1;/.test(SRC) && !/Math\.ceil\(meosRenderCols\((?:t|ct)\) \/ _wrapCol\)/.test(SRC), '紙の段の数は中身の行も説明の行も meosTcwRowsOf で数える', 0);
  console.log(ng ? ('NG ' + ng + '件') : 'ALL PASS'); process.exit(ng ? 1 : 0);
})();
