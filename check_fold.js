// 開発用ツール(vsix除外): 「畳んである膜の頭が ▼▲ になるか」を、画面(visibleRanges)の形から測る。
//
// v4.0.349(俊克 8/22 改良1「頭に開始膜と同じ▼のみなので、▼▲にしてください」)
// ★推測で直さない = ガターで畳んだ時に何が起きるかを、実物の applyPrettyLabels に描かせて見る。
//   visibleRanges に切れ目を作る = VSCode が折り畳んだ時に起きる事そのもの。
// 使い方:  node src/check_fold.js
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
const TMP = path.join(require('os').tmpdir(), 'meos_fold_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { applyPrettyLabels, makeDecorations, collectPairs, isPairFolded, meosViewportFoldFactAt, meosMembraneNameEditFor, membraneNameRangeForRenameOnLine };\n', 'utf8');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }
try { T.makeDecorations(); } catch (_) { }

// 俊克の実データ(v4.0.348 のスクショと同じ形)= バッジは ▲ の次の FC 行に居る。
const lines = [
  '# 見出し',
  '',
  '<!-- {* ▼mCN=テスト膜_20260822s105259JST // comment1 *} -->',
  '',
  'なかみ',
  '',
  '<!-- {* ▲mCN=テスト膜_20260822s105259JST // comment2 *} -->',
  '<!-- Mew!FC mCN (📊⊕1+0D-2Y) -->',
  '',
  'あとの本文',
  '',
];
const OPEN_LINE = 2, CLOSE_LINE = 6;
const file = '/tmp/meos_fold_test.md';
const uri = { toString: () => 'file://' + file, fsPath: file, scheme: 'file' };
const doc = {
  uri, languageId: 'markdown', version: 1, lineCount: lines.length, eol: 1, fileName: file, isUntitled: false, isClosed: false,
  lineAt: (n) => { const i = (typeof n === 'number') ? n : n.line; return { text: lines[i], lineNumber: i, range: new stub.Range(i, 0, i, lines[i].length) }; },
  getText: (r) => r ? lines.slice(r.start.line, r.end.line + 1).join('\n') : lines.join('\n'),
  positionAt: () => new stub.Position(0, 0), offsetAt: () => 0,
};
function makeEditor(visibleRanges, curLine) {
  const cur = new stub.Position(typeof curLine === 'number' ? curLine : 9, 0); // 既定はカーソルを膜の行から離す(v4.0.345: 居る行は生データ)
  const ed = {
    document: doc, options: {},
    selection: { active: cur, anchor: cur, isEmpty: true, start: cur, end: cur },
    selections: [], visibleRanges,
    __labels: [], __after: [],
    setDecorations(type, ranges) {
      if (!Array.isArray(ranges)) return;
      for (const r of ranges) {
        const ro = r && r.renderOptions;
        const b = ro && ro.before && ro.before.contentText;
        if (typeof b === 'string' && /[▼▲]/.test(b)) ed.__labels.push({ line: r.range.start.line, text: b });
        const a = ro && ro.after && ro.after.contentText;
        if (typeof a === 'string' && a.trim()) ed.__after.push({ line: r.range.start.line, text: a.trim() });
      }
    },
  };
  ed.selections = [ed.selection];
  return ed;
}
function openGlyphAt(ed, line) {
  ed.__labels.length = 0; ed.__after.length = 0;
  T.applyPrettyLabels(ed);
  const hit = ed.__labels.filter(l => l.line === line).map(l => l.text);
  return hit.length ? hit.join('|') : '(無し)';
}
function afterAt(ed, line) {
  const hit = ed.__after.filter(l => l.line === line).map(l => l.text);
  return hit.length ? hit.join('|') : '(無し)';
}
let ng = 0;
function ok(cond, msg, got) { console.log((cond ? '  ok  ' : '  NG  ') + msg + (cond ? '' : '   → 実際: ' + got)); if (!cond) ng++; }

const R = (a, b) => new stub.Range(a, 0, b, 0);

console.log('① 畳んである(開始行の次が隠れている = visibleRanges に切れ目)');
{
  const ed = makeEditor([R(0, OPEN_LINE), R(8, 10)]);   // 3〜7行目が隠れている
  ok(T.meosViewportFoldFactAt(ed, OPEN_LINE) === true, '事実 = 畳んである', T.meosViewportFoldFactAt(ed, OPEN_LINE));
  const pair = T.collectPairs(doc, { excludeIndex: false }).find(p => p.start === OPEN_LINE);
  ok(!!pair, '膜の対が見つかる', pair);
  ok(T.isPairFolded(ed, pair) === true, 'isPairFolded = true', T.isPairFolded(ed, pair));
  ok(T.isPairFolded(ed, pair, { ignoreViewport: true }) === false, 'バッジを書く道(ignoreViewport)は従来どおり開いている扱い = 生データを書き換えない', T.isPairFolded(ed, pair, { ignoreViewport: true }));
  const g = openGlyphAt(ed, OPEN_LINE);
  ok(g === '▼▲', '★頭が ▼▲ になる', g);
}
console.log('② 開いている(次の行が見えている)');
{
  const ed = makeEditor([R(0, 10)]);
  ok(T.meosViewportFoldFactAt(ed, OPEN_LINE) === false, '事実 = 開いている', T.meosViewportFoldFactAt(ed, OPEN_LINE));
  const g = openGlyphAt(ed, OPEN_LINE);
  ok(g === '▼', '頭は ▼ のまま', g);
  const gc = openGlyphAt(ed, CLOSE_LINE);
  ok(gc === '▲', '閉じ膜は ▲', gc);
}
console.log('③ 分らない(可視範囲の一番最後の行 = 画面の下端かもしれない)');
{
  const ed = makeEditor([R(0, OPEN_LINE)]);
  ok(T.meosViewportFoldFactAt(ed, OPEN_LINE) === null, '事実 = null(決めつけない)', T.meosViewportFoldFactAt(ed, OPEN_LINE));
  const g = openGlyphAt(ed, OPEN_LINE);
  ok(g === '▼', '従来どおり ▼(画面外を畳んである事にしない = v0.9.216)', g);
}
console.log('④ 画面が無い(visibleRanges 空)');
{
  const ed = makeEditor([]);
  ok(T.meosViewportFoldFactAt(ed, OPEN_LINE) === null, '事実 = null', T.meosViewportFoldFactAt(ed, OPEN_LINE));
  const g = openGlyphAt(ed, OPEN_LINE);
  ok(g === '▼', '落ちずに ▼', g);
}
console.log('⑤ 畳んである膜の開始行にカーソルが入った(= 生データを見せる行)');
{
  const ed = makeEditor([R(0, OPEN_LINE), R(8, 10)], OPEN_LINE);
  const g = openGlyphAt(ed, OPEN_LINE);
  ok(g === '▼▲', '★生データのままで、頭に ▼▲ が付く(開始膜に見えない)', g);
  const a = afterAt(ed, OPEN_LINE);
  ok(/Mew!FC/.test(a) && /📊⊕1\+0D-2Y/.test(a), '★畳んだ中に居る FC コメント(バッジごと)が行末に見える', a);
}
console.log('⑥ 開いている膜の開始行にカーソルが入った = 何も足さない(生データそのまま)');
{
  const ed = makeEditor([R(0, 10)], OPEN_LINE);
  const g = openGlyphAt(ed, OPEN_LINE);
  ok(g === '(無し)', '印を足さない(FC 行は下に本物が見えている)', g);
  const a = afterAt(ed, OPEN_LINE);
  ok(a === '(無し)', 'FC の写しも足さない', a);
}
console.log('⑦ 膜名を直に打ち替えた = 閉じ膜へ届ける1つの書き換えが出る(v4.0.351)');
{
  const before = lines[OPEN_LINE];
  const w = { uri: uri.toString(), openLine: OPEN_LINE, closeLine: CLOSE_LINE, oldName: 'テスト膜_20260822s105259JST' };
  ok(T.meosMembraneNameEditFor(doc, w) === null, '名前を変えていない間は何も出ない(打つたびに書き換えない)', JSON.stringify(T.meosMembraneNameEditFor(doc, w)));

  lines[OPEN_LINE] = before.replace('テスト膜_20260822s105259JST', '新しい名前_20260822s110000JST');   // 開始行だけ直に打ち替えた
  const one = T.meosMembraneNameEditFor(doc, w);
  ok(!!one, '★閉じ膜への書き換えが1つ出る', JSON.stringify(one));
  ok(one && one.text === '新しい名前_20260822s110000JST', '★新しい名前が入る', one && one.text);
  ok(one && one.range.start.line === CLOSE_LINE, '★書き換える先は閉じ行だけ', one && one.range.start.line);

  const cl = T.membraneNameRangeForRenameOnLine(doc, CLOSE_LINE, 'close');
  const applied = lines[CLOSE_LINE].slice(0, cl.range.start.character) + one.text + lines[CLOSE_LINE].slice(cl.range.end.character);
  ok(/▲mCN=新しい名前_20260822s110000JST \/\/ comment2/.test(applied), '★当てると閉じ膜が揃う(コメントは残る)', applied);

  lines[CLOSE_LINE] = applied;
  ok(T.meosMembraneNameEditFor(doc, w) === null, '揃った後はもう何も出ない(繰り返し書かない)', JSON.stringify(T.meosMembraneNameEditFor(doc, w)));
  lines[OPEN_LINE] = before; lines[CLOSE_LINE] = lines[CLOSE_LINE].replace('新しい名前_20260822s110000JST', 'テスト膜_20260822s105259JST');
}
console.log('⑧ 閉じ行が控えた名前でない = 触らない(誰かが先に直した後)');
{
  const w = { uri: uri.toString(), openLine: OPEN_LINE, closeLine: CLOSE_LINE, oldName: '別の名前_20260101s000000JST' };
  ok(T.meosMembraneNameEditFor(doc, w) === null, '控えと違う閉じ行には書かない', JSON.stringify(T.meosMembraneNameEditFor(doc, w)));
}
console.log(ng ? ('NG ' + ng + ' 件') : '全部 ok');
process.exit(ng ? 1 : 0);
