// 開発用ツール(vsix除外): v5.1.588 P1〜P6 の膜(▼P1/▲P1)= 組・範囲・罫線の停止・Cmd+↑↓・包む・一括削除・色。
// 元の見出し: FC化した膜(バッジが閉じ膜の次のFC行にある形)を「膜の中」と認めるか。
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
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meosMembraneRuleTarget, meosMemEdgeAt, meosFofPair, meosFofRange, meosFofReconcile, meosFofWrap, meosRuleStopAt, meosPuzzleTagsOf, meosPuzzleFSet, meosPuzzleSweep, parseOpenLine, parseCloseLine, meosPuzzleColor, setCtx: (c) => { extensionContext = c; } };\n', 'utf8');
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
function mkEd(d, sel) {
  const ed = { document: d, selection: sel || { start: { line: 0, character: 0 }, end: { line: 0, character: 0 }, active: { line: 0, character: 0 }, isEmpty: true }, visibleRanges: [{ start: { line: 0 }, end: { line: 99999 } }], selections: [] };
  ed.edit = async (fn) => { const ops = []; fn({ insert: (p, t) => ops.push([off(d, p), off(d, p), t]), replace: (r, t) => ops.push([off(d, r.start), off(d, r.end), t]), delete: (r) => ops.push([off(d, r.start), off(d, r.end), '']) });
    let s = d.L.join('\n'); ops.sort((a, b) => b[0] - a[0]); for (const [a, b, t] of ops) s = s.slice(0, a) + t + s.slice(b); d.L = s.split('\n'); d.version++; return true; };
  return ed;
}
// 実物の行の形(♥膜 v5.1.587 と同じ書式)
const R = '<!-- Mew!UFC --- -->';
const P1O = '<!-- {* ▼▶◀mP1=M_20261108S100001JST //  *} -->', P1C = '<!-- {* ▲▶◀mP1=M_20261108S100002JST //  *} -->';
const P1a = '<!-- {* ▶◀mP1=M_20261101S090000JST // 古い印 *} -->', P1b = '<!-- {* ▶◀mP1=M_20261102S090000JST //  *} -->';
const H1 = '<!-- {* ♥️▼▶◀mP7=f_20261108S005813JST //  *} -->', H2 = '<!-- {* ♥️▲▶◀mP7=f_20261108S005814JST //  *} -->';
const S = (sel) => sel;
(async () => {
  // 1. 膜の解析(mCN)は P の印を膜と読まない
  ok(!T.parseOpenLine(P1O) && !T.parseCloseLine(P1C), 'P1の印は mCN 膜の行と読まない', [T.parseOpenLine(P1O), T.parseCloseLine(P1C)]);
  ok(T.meosMemEdgeAt(P1O, false) === 1 && T.meosMemEdgeAt(P1C, false) === -1 && T.meosMemEdgeAt(P1a, false) === 0, '▼P1=開始・▲P1=閉じ・中継点は膜の行でない', [T.meosMemEdgeAt(P1O), T.meosMemEdgeAt(P1C), T.meosMemEdgeAt(P1a)]);
  // 2. 組と範囲・Cmd+↑↓・一時停止
  const d1 = mkDoc(['外0', P1a, P1O, R, '中1', P1b, '中2', '', R, P1C, '外9', H1, R, 'h中', '', R, H2, '終']);
  T.meosPuzzleFSet(d1, 1, 'M_20261108S100001JST'); T.meosPuzzleFSet(d1, 7, 'f_20261108S005813JST');
  const pr = T.meosFofPair(d1, 1); ok(pr && pr.f.line === 2 && pr.m && pr.m.line === 9, 'P1の組= ▼P1(2)と▲P1(9)', pr && [pr.f.line, pr.m && pr.m.line]);
  const rg = T.meosFofRange(d1, 1); ok(rg && rg.start === 2 && rg.end === 9, 'P1膜の範囲', rg);
  const rh = T.meosFofRange(d1, 7); ok(rh && rh.start === 11 && rh.end === 16, '♥膜の範囲は今まで通り', rh);
  ok(T.meosMembraneRuleTarget(d1, 4, true) === 7 && T.meosMembraneRuleTarget(d1, 6, false) === 4, 'P1膜の中の Cmd+↓/↑ は罫線の手前', [T.meosMembraneRuleTarget(d1, 4, true), T.meosMembraneRuleTarget(d1, 6, false)]);
  const e1 = mkEd(d1);
  ok(T.meosRuleStopAt(e1, 0, true) === false && T.meosRuleStopAt(e1, 1, true) === true, '外から↓= ▼P1の行に入る手前で止まる', [T.meosRuleStopAt(e1, 0, true), T.meosRuleStopAt(e1, 1, true)]);
  ok(T.meosRuleStopAt(e1, 10, false) === true, '外から↑= ▲P1の行に入る手前で止まる', T.meosRuleStopAt(e1, 10, false));
  ok(T.meosRuleStopAt(e1, 7, true) === true, '中から↓= 閉じ罫線の手前で止まる', T.meosRuleStopAt(e1, 7, true));
  // 3. 今ある1点だけの印は組へ引き込まない(俊克③)
  const d2 = mkDoc(['a', P1a, 'b', P1b, 'c']); T.meosPuzzleFSet(d2, 1, 'M_20261101S090000JST');
  const p2 = T.meosFofPair(d2, 1); ok(p2 && p2.m === null, '古いP1が2本= 組にしない', p2 && p2.m);
  await T.meosFofReconcile(mkEd(d2), 1); ok(d2.L[1] === P1a && d2.L[3] === P1b, '古いP1は書き換えない', d2.L);
  ok(T.meosFofRange(d2, 1) === null, '古いP1に範囲なし', T.meosFofRange(d2, 1));
  // ♥は今まで通り2本目が相方になる
  const d3 = mkDoc(['a', '<!-- {* ♥️▶◀mP7=f_1 //  *} -->', 'b', '<!-- {* ♥️▶◀mP7=f_2 //  *} -->']); T.meosPuzzleFSet(d3, 7, 'f_1');
  await T.meosFofReconcile(mkEd(d3), 7); ok(/♥️▼▶◀mP7=f_1/.test(d3.L[1]) && /♥️▲▶◀mP7=f_2/.test(d3.L[3]), '♥の組は従来通り', d3.L);
  // 4. 選択を包む(P3=D)
  const d4 = mkDoc(['x', P1a, '本文1', '本文2', 'y']);
  const e4 = mkEd(d4, { start: { line: 2, character: 0 }, end: { line: 3, character: 3 }, active: { line: 3, character: 3 }, isEmpty: false });
  await T.meosFofWrap(e4, 'D', 3);
  ok(/^<!-- \{\* ▼▶◀mP3=D_\d{8}\w\d{6}JST \/\/  \*\} -->$/.test(d4.L[2]) && d4.L[3] === R && d4.L[4] === '本文1' && d4.L[5] === '本文2' && d4.L[6] === '' && d4.L[7] === R && /▲▶◀mP3=D_/.test(d4.L[8]) && d4.L[9] === 'y', 'P3で包む= ▼P3・罫線・中身・空行・罫線・▲P3', d4.L);
  ok(d4.L[1] === P1a, '包んでも他の字の印は触らない', d4.L[1]);
  const p4 = T.meosFofPair(d4, 3); ok(p4 && p4.m && p4.f.line === 2 && p4.m.line === 8, 'P3の組', p4 && [p4.f.line, p4.m && p4.m.line]);
  ok(e4.selection.active.line === 5, '包んだ後のカーソル= 中身の最後の行', e4.selection.active);
  // 5. もう一度包むと前の組は中継点へ
  const e5 = mkEd(d4, { start: { line: 4, character: 0 }, end: { line: 4, character: 3 }, active: { line: 4, character: 3 }, isEmpty: false });
  await new Promise(r => setTimeout(r, 1100));
  await T.meosFofWrap(e5, 'D', 3);
  const tg = T.meosPuzzleTagsOf(d4, 3), two = tg.filter(h => /[▼▲]▶/.test(d4.L[h.line]));
  ok(tg.length === 4 && two.length === 2, '新しい組だけ ▼▲・前の組は中継点', d4.L);
  // 6. 一括削除は中継点→相方→F の3段。膜の隣の中継点を消しても膜の罫線は残す
  const d6 = mkDoc(['a', P1O, R, '中', P1a, '', R, P1C, 'z']); T.meosPuzzleFSet(d6, 1, 'M_20261108S100001JST');
  await T.meosPuzzleSweep(mkEd(d6), 1, 'M'); ok(d6.L.join('|') === ['a', P1O, R, '中', '', R, P1C, 'z'].join('|'), '1段目= 中継点だけ', d6.L);
  const d7 = mkDoc(['a', P1O, R, P1a, '中', '', R, P1C, 'z']); T.meosPuzzleFSet(d7, 1, 'M_20261108S100001JST');
  await T.meosPuzzleSweep(mkEd(d7), 1, 'M'); ok(d7.L.join('|') === ['a', P1O, R, '中', '', R, P1C, 'z'].join('|'), '開始罫線の直下の中継点= 罫線は残す', d7.L);
  await T.meosPuzzleSweep(mkEd(d7), 1, 'M'); ok(d7.L.join('|') === ['a', P1O, R, '中', '', 'z'].join('|'), '2段目= 相方と罫線', d7.L);
  // 7. 色
  ok(T.meosPuzzleColor('M', 0.95) === 'rgba(229, 57, 53, 0.95)' && T.meosPuzzleColor('k', 0.14) === 'rgba(194, 24, 91, 0.14)', '札の色= Me Dock の字の色', [T.meosPuzzleColor('M', 0.95), T.meosPuzzleColor('k', 0.14)]);
  console.log(ng ? ('NG ' + ng) : '全項目 PASS');
  process.exit(0);
})();
