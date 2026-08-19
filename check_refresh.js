// 開発用ツール(vsix除外): refresh の重い区間を**実データで測る**。
//
// v4.0.271(俊克 8/19 バグ3「bsキーの遅延が復活している」の実測)
// ★推測で削らない= 拡張ホストのログ(refresh-prof.log)で 265ms と出た内訳を、
//   ここで**関数ごとに**測り直す。可視範囲を渡す前/後の比較もここで見る。
// 使い方:  node src/check_refresh.js [mdファイル] [可視行数] [先頭行]
// ★範囲の数が0のままでは「速くなった」と言えない= **膜が在る所に窓を置いて、数が出ることも確かめる**。
const fs = require('fs'); const path = require('path'); const Module = require('module');
const stub = {
  Position: class { constructor(l, c) { this.line = l; this.character = c; } },
  Range: class { constructor(a, b, c, d) { if (typeof a === 'object') { this.start = a; this.end = b; } else { this.start = { line: a, character: b }; this.end = { line: c, character: d }; } } },
  MarkdownString: class { constructor(v) { this.value = v || ''; this.isTrusted = false; this.supportHtml = false; }
    appendMarkdown(x) { this.value += x; return this; } appendText(x) { this.value += x; return this; } appendCodeblock(x) { this.value += x; return this; } }, ThemeColor: class { }, Diagnostic: class { },
  EventEmitter: class { constructor() { this.event = () => ({ dispose() { } }); } fire() { } dispose() { } },
  DecorationRangeBehavior: { ClosedClosed: 1, OpenOpen: 0, ClosedOpen: 2, OpenClosed: 3 },
  OverviewRulerLane: { Left: 1 }, EndOfLine: { LF: 1, CRLF: 2 }, DocumentLink: class { constructor(r) { this.range = r; } },
  DiagnosticSeverity: { Hint: 3 }, CodeActionKind: { QuickFix: 'quickfix' },
  Uri: { file: (p) => ({ toString: () => 'file://' + p, fsPath: p }), parse: (s) => ({ toString: () => s }) },
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
const TMP = path.join(require('os').tmpdir(), 'meos_prof_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { mstatBadgeIconDoorRanges, computeMembraneBadgeColorRanges, workingTocHighlightRanges, fixedTocHiddenRanges, membraneRightEdgeVirtualSpaceRanges, membraneNameRightVirtualSpaceRanges, renderedMembraneRightEdgeSpaceRanges, markdownWrapperHideRanges, sourceRjfHideRanges, hyperTocStorageHideRanges, computeWarningArrowDecorations, collectPairs, parseMstatBadgeFromText, applyPrettyLabels, applyStealthDecorations, collectRefPoints, computeLineDecorations, makeDecorations };\n', 'utf8');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }

const file = process.argv[2] || '/Volumes/T7_SSD2TB/MeOS-docs/1file-monthly dialy/Kt_19580126S08JST.md';
const vis = Math.max(10, parseInt(process.argv[3] || '60', 10));
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
console.log('測る: ' + file + '  (' + lines.length.toLocaleString() + '行 / 可視 ' + vis + '行)');

const uri = { toString: () => 'file://' + file, fsPath: file, scheme: 'file' };
const doc = {
  uri, languageId: 'markdown', version: 1, lineCount: lines.length, eol: 1, fileName: file, isUntitled: false,
  lineAt: (n) => { const i = (typeof n === 'number') ? n : n.line; return { text: lines[i], lineNumber: i, range: new stub.Range(i, 0, i, lines[i].length) }; },
  getText: (r) => r ? lines.slice(r.start.line, r.end.line + 1).join('\n') : lines.join('\n'),
  positionAt: () => new stub.Position(0, 0), offsetAt: () => 0,
};
const mid = (process.argv[4] !== undefined) ? Math.max(0, parseInt(process.argv[4], 10)) : Math.floor(lines.length / 2);
const editor = {
  document: doc, selection: { active: new stub.Position(mid, 0), anchor: new stub.Position(mid, 0), isEmpty: true, start: new stub.Position(mid, 0), end: new stub.Position(mid, 0) },
  selections: [], visibleRanges: [new stub.Range(mid, 0, mid + vis, 0)], setDecorations() { }, options: {},
};
editor.selections = [editor.selection];

try { T.makeDecorations(); } catch (e) { console.log('(makeDecorations 不可: ' + String(e.message).slice(0,60) + ')'); }
const names = ['mstatBadgeIconDoorRanges', 'computeMembraneBadgeColorRanges', 'workingTocHighlightRanges', 'fixedTocHiddenRanges',
  'membraneRightEdgeVirtualSpaceRanges', 'membraneNameRightVirtualSpaceRanges', 'renderedMembraneRightEdgeSpaceRanges',
  'markdownWrapperHideRanges', 'sourceRjfHideRanges', 'hyperTocStorageHideRanges',
  'applyPrettyLabels', 'applyStealthDecorations', 'computeWarningArrowDecorations'];
const rows = [];
for (const n of names) {
  const f = T[n]; if (typeof f !== 'function') { rows.push([n, '—', '(無い)']); continue; }
  let out = null, err = '';
  const t0 = process.hrtime.bigint();
  try { out = f(editor); } catch (e) { err = String(e && e.message || e).slice(0, 40); }
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const cnt = Array.isArray(out) ? out.length : (out && out.lineRanges ? (out.lineRanges.length + out.itemRanges.length) : (out && out.size !== undefined ? out.size : '?'));
  rows.push([n, ms.toFixed(1), err ? ('✗ ' + err) : ('範囲 ' + cnt)]);
}
{ // collectPairs 単体(多くの関数がこれを呼ぶ)
  const t0 = process.hrtime.bigint();
  const pairs = T.collectPairs(doc, { excludeIndex: false });
  rows.unshift(['collectPairs(全文)', (Number(process.hrtime.bigint() - t0) / 1e6).toFixed(1), '対 ' + pairs.length]);
}
{ // 全行 parseMstatBadge (mstatBadgeIconDoorRanges の中身)
  const t0 = process.hrtime.bigint();
  let n = 0; for (let i = 0; i < lines.length; i++) if (T.parseMstatBadgeFromText(lines[i])) n++;
  rows.push(['(参考) 全行 parseMstatBadge', (Number(process.hrtime.bigint() - t0) / 1e6).toFixed(1), 'バッジ ' + n]);
}
console.log('');
for (const r of rows) console.log('  ' + String(r[1]).padStart(8) + ' ms  ' + r[0].padEnd(38) + ' ' + r[2]);
