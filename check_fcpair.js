// 開発用ツール(vsix除外): FC化した膜(バッジが閉じ膜の次のFC行にある形)を「膜の中」と認めるか。
//
// v4.0.381(俊克 8/23「従来は、開始膜、あるいは閉じ膜の中だった。FC化した膜の場合は、
//   FCコメントの中も当然含まれる」/「Edit Meの再設定がFCタイプを認識しない」)
// ★写経しない= extension.js の meDockModeForEditor / isCursorOnMembraneLine /
//   currentMembranePairForRename / foldRangeEnd を**そのまま呼ぶ**。
// 使い方:  node src/check_fcpair.js
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
    onDidOpenTextDocument: () => ({ dispose() { } }), onDidChangeConfiguration: () => ({ dispose() { } }),
  },
  languages: {
    createDiagnosticCollection: () => ({ set() { }, clear() { }, delete() { }, dispose() { } }),
    registerDocumentLinkProvider: () => ({ dispose() { } }), registerCodeActionsProvider: () => ({ dispose() { } }),
    registerHoverProvider: () => ({ dispose() { } }),
  },
  commands: { registerCommand: () => ({ dispose() { } }), executeCommand: () => Promise.resolve() },
  env: { clipboard: { writeText: () => Promise.resolve() } },
  ExtensionMode: { Test: 3 }, TextEditorRevealType: { InCenter: 2, InCenterIfOutsideViewport: 2 },
  StatusBarAlignment: { Left: 1, Right: 2 }, ViewColumn: { One: 1 },
};
const origLoad = Module._load;
Module._load = function (r) { if (r === 'vscode') return stub; return origLoad.apply(this, arguments); };
const SRC = path.join(__dirname, 'extension.js');
const TMP = path.join(require('os').tmpdir(), 'meos_check_fcpair_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meDockModeForEditor, isCursorOnMembraneLine, currentMembranePairForRename, meosPairForBadgeLine, meosPairBlockEnd, foldRangeEnd, collectPairs, meosIsPairBadgeSpec, copyMe, duplicateMe, shedCurrentMembrane, copyMyContents };\n', 'utf8');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }

let ng = 0;
const ok = (cond, label, got) => { console.log((cond ? '  ok  ' : ' NG   ') + label + (cond ? '' : '   ← ' + JSON.stringify(got))); if (!cond) ng++; };
function makeDoc(lines, lang) {
  return {
    uri: { toString: () => 'file:///t.md', fsPath: '/t.md', scheme: 'file' }, languageId: lang || 'markdown', lineCount: lines.length,
    lineAt: (n) => ({ text: lines[n], range: new stub.Range(n, 0, n, lines[n].length) }),
    getText: () => lines.join('\n'), eol: 1, fileName: '/t.md', isClosed: false, version: 1,
  };
}
function mkEd(lines, l, c) {
  const doc = makeDoc(lines);
  const p = new stub.Position(l, c || 0);
  return { document: doc, selection: { active: p, anchor: p, start: p, end: p, isEmpty: true }, selections: [] };
}
const NAME = 'テスト膜2_20260823S093551JST';
const FC = [
  '<!-- {* ▼mCN=' + NAME + ' // comment1 *} -->',
  '',
  '<!-- {* ▲mCN=' + NAME + ' // comment2 *} -->',
  '<!-- Mew!FC mCN (📊⊕0+0D-2Y) -->',
];

console.log('① FCバッジ行の上でも Edit Me は「再設定(rename)」＋その膜名を出す');
{
  const ed = mkEd(FC, 3, 10);
  const st = T.meDockModeForEditor(ed);
  ok(T.isCursorOnMembraneLine(ed), 'FC行は膜の行と認める', T.isCursorOnMembraneLine(ed));
  ok(st.mode === 'rename', 'mode=rename', st.mode);
  ok(st.value === NAME, '膜名が出る', st.value);
  ok((T.currentMembranePairForRename(ed) || {}).id === NAME, '対も同じ膜を指す', T.currentMembranePairForRename(ed));
}
console.log('② ▼/▲の上は今まで通り(退行なし)');
{
  for (const ln of [0, 2]) {
    const st = T.meDockModeForEditor(mkEd(FC, ln, 20));
    ok(st.mode === 'rename' && st.value === NAME, 'line' + ln + ' = rename ' + NAME, st);
  }
}
console.log('③ 膜の中の本文行は今まで通り New Me(入れ子の新規作成が生きる)');
{
  const st = T.meDockModeForEditor(mkEd(FC, 1, 0));
  ok(st.mode === 'new', 'line1 = new', st.mode);
}
console.log('④ 畳む範囲と「膜の中か」の物差しが同じ1つ');
{
  const doc = makeDoc(FC);
  const pair = T.collectPairs(doc, { excludeIndex: false })[0];
  ok(T.foldRangeEnd(doc, pair) === 3, '畳みはFC行まで', T.foldRangeEnd(doc, pair));
  ok(T.meosPairBlockEnd(doc, pair) === 3, '塊の最後もFC行', T.meosPairBlockEnd(doc, pair));
  ok((T.meosPairForBadgeLine(doc, 3) || {}).id === NAME, 'FC行→膜が引ける', T.meosPairForBadgeLine(doc, 3));
}
console.log('⑤ 巻き添えが無いこと — 膜のバッジでないFC行は膜と認めない');
{
  const L = ['## 見出し', '<!-- Mew!FC H2 (白/赤)//[]tip= -->', '本文'];
  const ed = mkEd(L, 1, 10);
  ok(!T.isCursorOnMembraneLine(ed), '見出しのFC行は膜の行でない', true);
  ok(T.meDockModeForEditor(ed).mode === 'new', 'mode=new のまま', T.meDockModeForEditor(ed).mode);
  const L2 = ['ただの段落', '<!-- Mew!FC mCN (📊⊕0+0D0W) -->'];
  ok(T.meosPairForBadgeLine(makeDoc(L2), 1) === null, '真上が閉じ膜でなければ引かない', T.meosPairForBadgeLine(makeDoc(L2), 1));
}
console.log('⑥ 旧形(▼行にバッジ)は1行も変わらない');
{
  const OLD = [
    '<!-- {* ▼mCN=' + NAME + ' // comment1 (📊⊕0+0D-2Y) *} -->', '', '<!-- {* ▲mCN=' + NAME + ' // comment2 *} -->',
  ];
  const doc = makeDoc(OLD);
  const pair = T.collectPairs(doc, { excludeIndex: false })[0];
  ok(T.foldRangeEnd(doc, pair) === 2, '畳みは▲まで', T.foldRangeEnd(doc, pair));
  ok(T.meDockModeForEditor(mkEd(OLD, 0, 20)).value === NAME, '▼で膜名', T.meDockModeForEditor(mkEd(OLD, 0, 20)).value);
  ok(T.meDockModeForEditor(mkEd(OLD, 1, 0)).mode === 'new', '中は new', true);
}
console.log('⑦ FC行が2本続いても、下の1本から膜を引ける');
{
  const L = FC.slice(0, 4).concat(['<!-- Mew!FC mCN (📊⊕0+0D-2Y) -->']);
  ok((T.meosPairForBadgeLine(makeDoc(L), 4) || {}).id === NAME, '2本目のFC行→同じ膜', T.meosPairForBadgeLine(makeDoc(L), 4));
  ok(T.meosPairBlockEnd(makeDoc(L), T.collectPairs(makeDoc(L), { excludeIndex: false })[0]) === 4, '塊は2本目まで', true);
}

// ここから先は、実際に編集を当てて結果を文字列で見る(Copy/Duplicate/Shed)。
let CLIP = '';
stub.env.clipboard.writeText = (t) => { CLIP = String(t); return Promise.resolve(); };
function mkEdEdit(lines, l, c) {
  const cur = lines.slice();
  const doc = makeDoc(cur);
  doc.lineCount = cur.length;
  const p = new stub.Position(l, c || 0);
  const ed = {
    document: doc, viewColumn: 1,
    selection: { active: p, anchor: p, start: p, end: p, isEmpty: true }, selections: [],
    revealRange() { },
    edit: (fn) => {
      const edits = [];
      fn({
        insert: (pos, text) => edits.push({ s: pos, e: pos, t: text }),
        delete: (r) => edits.push({ s: r.start, e: r.end, t: '' }),
        replace: (r, t) => edits.push({ s: r.start, e: r.end, t }),
      });
      edits.sort((a, b) => (b.s.line - a.s.line) || (b.s.character - a.s.character));
      for (const e of edits) {
        const merged = cur[e.s.line].slice(0, e.s.character) + e.t + (cur[e.e.line] || '').slice(e.e.character);
        cur.splice(e.s.line, e.e.line - e.s.line + 1, ...merged.split('\n'));
      }
      doc.lineCount = cur.length;
      return Promise.resolve(true);
    },
    __lines: cur,
  };
  return ed;
}
const BODY = [
  '<!-- {* ▼mCN=' + NAME + ' // comment1 *} -->',
  '本文A',
  '本文B',
  '<!-- {* ▲mCN=' + NAME + ' // comment2 *} -->',
  '<!-- Mew!FC mCN (📊⊕0+0D-2Y) -->',
  '膜の外の行',
];

console.log('⑧ Copy Me(□Me＋□contents) はFCバッジ行まで運ぶ');
{
  const ed = mkEdEdit(BODY, 0, 20);
  CLIP = '';
  T.copyMe(ed);
  ok(CLIP.split('\n').length === 5, '5行(▼〜FC行)', CLIP.split('\n').length);
  ok(/Mew!FC mCN/.test(CLIP), 'バッジ行が入っている', CLIP);
  ok(!/膜の外の行/.test(CLIP), '膜の外は巻き込まない', CLIP);
}
console.log('⑨ Copy My contents(□contentsだけ) は中身のまま(バッジは殻なので入らない)');
{
  const ed = mkEdEdit(BODY, 1, 0);
  CLIP = '';
  T.copyMyContents(ed);
  ok(CLIP === '本文A\n本文B', '中身だけ', CLIP);
}
console.log('⑩ Duplicate Me はFCバッジ行ごと複製し、塊の直後へ置く');
{
  const ed = mkEdEdit(BODY, 0, 20);
  T.duplicateMe(ed);
  const out = ed.__lines;
  ok(out.length === 11, '5行が増える', out.length);
  ok(T.meosIsPairBadgeSpec(out[4]) && T.meosIsPairBadgeSpec(out[9]), 'バッジ行が2本になる', [out[4], out[9]]);
  ok(out[5].indexOf('▼mCN=') >= 0, '複製はバッジ行の次から始まる', out[5]);
  ok(out[10] === '膜の外の行', '膜の外の行はそのまま最後に', out[10]);
}
console.log('⑪ Shed Me は殻(▼/▲/FCバッジ行)だけ落とし、中身は1行も触らない');
{
  const ed = mkEdEdit(BODY, 1, 0);
  T.shedCurrentMembrane(ed);
  ok(ed.__lines.join('\n') === '本文A\n本文B\n膜の外の行', '中身と外だけが残る', ed.__lines);
}
console.log('⑫ 旧形のShed Meは今まで通り(落とすのは▼と▲の2行だけ)');
{
  const OLDB = [
    '<!-- {* ▼mCN=' + NAME + ' // c1 (📊⊕0+0D-2Y) *} -->', '本文A', '<!-- {* ▲mCN=' + NAME + ' // c2 *} -->', '膜の外の行',
  ];
  const ed = mkEdEdit(OLDB, 1, 0);
  T.shedCurrentMembrane(ed);
  ok(ed.__lines.join('\n') === '本文A\n膜の外の行', '2行だけ落ちる', ed.__lines);
}

console.log('⑬ FCバッジ行がファイルの最終行でも、Shed Me が壊れない');
{
  const L = ['<!-- {* ▼mCN=' + NAME + ' // c1 *} -->', '本文A', '<!-- {* ▲mCN=' + NAME + ' // c2 *} -->', '<!-- Mew!FC mCN (📊⊕0+0D0W) -->'];
  const ed = mkEdEdit(L, 1, 0);
  T.shedCurrentMembrane(ed);
  ok(ed.__lines.join('\n') === '本文A', '本文だけが残る(空行を残さない)', ed.__lines);
}
console.log('⑭ FCバッジ行がファイルの最終行でも、Duplicate Me が壊れない');
{
  const L = ['<!-- {* ▼mCN=' + NAME + ' // c1 *} -->', '本文A', '<!-- {* ▲mCN=' + NAME + ' // c2 *} -->', '<!-- Mew!FC mCN (📊⊕0+0D0W) -->'];
  const ed = mkEdEdit(L, 0, 20);
  T.duplicateMe(ed);
  ok(ed.__lines.length === 8 && T.meosIsPairBadgeSpec(ed.__lines[7]), '4行が増え、最後はバッジ行', ed.__lines);
}

console.log(ng ? ('NG ' + ng + '件') : '全項目 PASS');
process.exit(ng ? 1 : 0);
