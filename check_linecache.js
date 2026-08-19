// 開発用ツール(vsix除外): 行の配列を「刻み直さずに直す」道が、本当に実物と一致するか。
//
// v4.0.272(俊克 8/19 バグ1「bsだけでなく、改行も1、2拍遅れる」の直しの検証)
// ★見るのは2つ= ①直した配列that実物と1行も違わないか ②本当に刻み直していないか(getTextを数える)。
//   ②が無いと「直ったつもりで毎回刻み直している」ことに気づけない。
// 使い方:  node src/check_linecache.js
const fs = require('fs'); const path = require('path'); const Module = require('module');
const stub = {
  Position: class { constructor(l, c) { this.line = l; this.character = c; } },
  Range: class { constructor(a, b, c, d) { if (typeof a === 'object') { this.start = a; this.end = b; } else { this.start = { line: a, character: b }; this.end = { line: c, character: d }; } } },
  MarkdownString: class { constructor(v) { this.value = v; } }, ThemeColor: class { }, Diagnostic: class { },
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
const TMP = path.join(require('os').tmpdir(), 'meos_lc_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meosPatchDocLines, meosDocLines };\n', 'utf8');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }

let ng = 0;
const ok = (cond, label, got) => { console.log((cond ? '  ok  ' : ' NG   ') + label + (cond ? '' : '   ← ' + JSON.stringify(got))); if (!cond) ng++; };

// 実物のふり= 行の配列＋版。getText が呼ばれた回数を数える。
function makeModel(initial) {
  const m = { lines: initial.slice(), version: 1, getTextCalls: 0 };
  m.doc = {
    uri: { toString: () => 'file:///lc.md' }, languageId: 'markdown', eol: 1,
    get lineCount() { return m.lines.length; },
    get version() { return m.version; },
    lineAt: (n) => ({ text: m.lines[typeof n === 'number' ? n : n.line] }),
    getText: () => { m.getTextCalls++; return m.lines.join('\n'); },
  };
  return m;
}
// 変更を実物に当てて、イベントを作る。changes = [{sl,sc,el,ec,text}]
function applyEdit(m, changes) {
  const sorted = changes.slice().sort((a, b) => (b.sl - a.sl) || (b.sc - a.sc));
  for (const c of sorted) {
    const head = m.lines[c.sl].slice(0, c.sc), tail = m.lines[c.el].slice(c.ec);
    m.lines.splice(c.sl, c.el - c.sl + 1, ...((head + c.text + tail).split('\n')));
  }
  m.version++;
  return {
    document: m.doc,
    contentChanges: changes.map(c => ({
      range: { start: new stub.Position(c.sl, c.sc), end: new stub.Position(c.el, c.ec) }, text: c.text,
    })),
  };
}
const base = ['一行目 abc', '二行目 def', '三行目 ghi', '四行目 jkl', '五行目 mno'];

function scene(label, changes, opts) {
  const m = makeModel(base);
  T.meosDocLines(m.doc);                       // 冷: ここで1回刻む
  const before = m.getTextCalls;
  const e = applyEdit(m, changes);
  const patched = T.meosPatchDocLines(e);
  const got = T.meosDocLines(m.doc);
  const same = JSON.stringify(got) === JSON.stringify(m.lines);
  const noResplit = (m.getTextCalls === before);
  if (opts && opts.giveUp) {
    ok(!patched, label + ' — 諦めてキャッシュを捨てる', patched);
    ok(same, label + ' — 捨てた後も、刻み直せば実物と一致', got.slice(0, 3));
  } else {
    ok(patched, label + ' — 直せた', patched);
    ok(same, label + ' — 実物と1行も違わない', { got: got.slice(0, 6), real: m.lines.slice(0, 6) });
    ok(noResplit, label + ' — ★刻み直していない(getText 0回)', m.getTextCalls - before);
  }
}

console.log('① 打鍵(1文字挿入)');
scene('`X` を挿す', [{ sl: 1, sc: 3, el: 1, ec: 3, text: 'X' }]);
console.log('② 改行(俊克の「1、2拍遅れる」相手)');
scene('行の途中でEnter', [{ sl: 1, sc: 3, el: 1, ec: 3, text: '\n' }]);
console.log('③ BS(行頭で押して前の行と繋ぐ)');
scene('行頭のBS', [{ sl: 1, sc: 0, el: 2, ec: 0, text: '' }]);
console.log('④ 範囲削除(複数行をまたぐ)');
scene('2行目の途中〜4行目の途中を消す', [{ sl: 1, sc: 2, el: 3, ec: 2, text: '' }]);
console.log('⑤ 貼り付け(改行を3本含む)');
scene('3行ぶん貼る', [{ sl: 2, sc: 0, el: 2, ec: 0, text: 'あ\nい\nう\n' }]);
console.log('⑥ マルチカーソル(2か所同時)');
scene('2か所に同時挿入', [{ sl: 0, sc: 1, el: 0, ec: 1, text: '＊' }, { sl: 3, sc: 1, el: 3, ec: 1, text: '＊' }]);
console.log('⑦ 大きな貼り付け(2001行)= 刻み直す方が安いので諦める');
scene('2001行貼る', [{ sl: 1, sc: 0, el: 1, ec: 0, text: new Array(2001).fill('x').join('\n') }], { giveUp: true });
console.log('⑧ 版that飛んでいる時(直前の版でない)= 触らない');
{
  const m = makeModel(base);
  T.meosDocLines(m.doc);
  m.version += 5;                              // 誰かthat間で編集した(私は見ていない)
  const e = { document: m.doc, contentChanges: [{ range: { start: new stub.Position(0, 0), end: new stub.Position(0, 0) }, text: 'z' }] };
  ok(T.meosPatchDocLines(e) === false, '直前の版でなければ手を出さない', true);
}
console.log('⑨ 安全弁(実物と食い違ったら捨てる)');
{
  const m = makeModel(base);
  T.meosDocLines(m.doc);
  const e = applyEdit(m, [{ sl: 1, sc: 3, el: 1, ec: 3, text: 'X' }]);
  m.lines[1] = '実物だけこっそり変えた';        // 私の知らない所で中身that変わった体
  const patched = T.meosPatchDocLines(e);
  ok(patched === false, '見た行that合わなければ捨てる(食い違ったまま走らない)', patched);
  ok(JSON.stringify(T.meosDocLines(m.doc)) === JSON.stringify(m.lines), '捨てた後は刻み直して一致', true);
}

console.log(ng ? ('NG ' + ng + ' 件') : '全部 ok');
process.exit(ng ? 1 : 0);
