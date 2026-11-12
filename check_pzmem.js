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
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meosFofChipClick, meosMembraneRuleTarget, meosMemEdgeAt, meosFofPair, meosFofRange, meosFofReconcile, meosFofWrap, meosRuleStopAt, meosPuzzleTagsOf, meosPuzzleFSet, meosPuzzleSweep, parseOpenLine, parseCloseLine, meosPuzzleColor, meosPuzzleDupFollow, meosPuzzleLand, meosStopLineNear, meosStopLineToggle, meosStopKindOf, meosRuleStep, meosStopEdgeOf, setCtx: (c) => { extensionContext = c; } };\n', 'utf8');
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
const P1O = '<!-- {* ▼mP1=M_20261108S100001JST //  *} -->', P1C = '<!-- {* ▲mP1=M_20261108S100002JST //  *} -->';
const P1a = '<!-- {* ▶◀mP1=M_20261101S090000JST // 古い印 *} -->', P1b = '<!-- {* ▶◀mP1=M_20261102S090000JST //  *} -->';
const H1 = '<!-- {* ♥️▼mP7=f_20261108S005813JST //  *} -->', H2 = '<!-- {* ♥️▲mP7=f_20261108S005814JST //  *} -->';
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
  await T.meosFofReconcile(mkEd(d3), 7); ok(/♥️▼mP7=f_1/.test(d3.L[1]) && d3.L[2] === R && d3.L[3] === 'b' && d3.L[4] === '' && d3.L[5] === R && /♥️▲mP7=f_2/.test(d3.L[6]), '♥の組は従来通り+罫線(591)', d3.L);
  // 4. 選択を包む(P3=D)
  const d4 = mkDoc(['x', P1a, '本文1', '本文2', 'y']);
  const e4 = mkEd(d4, { start: { line: 2, character: 0 }, end: { line: 3, character: 3 }, active: { line: 3, character: 3 }, isEmpty: false });
  await T.meosFofWrap(e4, 'D', 3);
  ok(/^<!-- \{\* ▼mP3=D_\d{8}\w\d{6}JST \/\/  \*\} -->$/.test(d4.L[2]) && d4.L[3] === R && d4.L[4] === '本文1' && d4.L[5] === '本文2' && d4.L[6] === '' && d4.L[7] === R && /▲mP3=D_/.test(d4.L[8]) && d4.L[9] === 'y', 'P3で包む= ▼P3・罫線・中身・空行・罫線・▲P3', d4.L);
  ok(d4.L[1] === P1a, '包んでも他の字の印は触らない', d4.L[1]);
  const p4 = T.meosFofPair(d4, 3); ok(p4 && p4.m && p4.f.line === 2 && p4.m.line === 8, 'P3の組', p4 && [p4.f.line, p4.m && p4.m.line]);
  ok(e4.selection.active.line === 5, '包んだ後のカーソル= 中身の最後の行', e4.selection.active);
  // 5. もう一度包むと前の組は中継点へ
  const e5 = mkEd(d4, { start: { line: 4, character: 0 }, end: { line: 4, character: 3 }, active: { line: 4, character: 3 }, isEmpty: false });
  await new Promise(r => setTimeout(r, 1100));
  await T.meosFofWrap(e5, 'D', 3);
  const tg = T.meosPuzzleTagsOf(d4, 3), two = tg.filter(h => /[▼▲]mP/.test(d4.L[h.line]));
  ok(tg.length === 4 && two.length === 2, '新しい組だけ ▼▲・前の組は中継点', d4.L);
  // 6. 一括削除は中継点→相方→F の3段。膜の隣の中継点を消しても膜の罫線は残す
  const d6 = mkDoc(['a', P1O, R, '中', P1a, '', R, P1C, 'z']); T.meosPuzzleFSet(d6, 1, 'M_20261108S100001JST');
  await T.meosPuzzleSweep(mkEd(d6), 1, 'M'); ok(d6.L.join('|') === ['a', P1O, R, '中', '', R, P1C, 'z'].join('|'), '1段目= 中継点だけ', d6.L);
  const d7 = mkDoc(['a', P1O, R, P1a, '中', '', R, P1C, 'z']); T.meosPuzzleFSet(d7, 1, 'M_20261108S100001JST');
  await T.meosPuzzleSweep(mkEd(d7), 1, 'M'); ok(d7.L.join('|') === ['a', P1O, R, '中', '', R, P1C, 'z'].join('|'), '開始罫線の直下の中継点= 罫線は残す', d7.L);
  await T.meosPuzzleSweep(mkEd(d7), 1, 'M'); ok(d7.L.join('|') === ['a', P1O, R, '中', '', 'z'].join('|'), '2段目= 相方と罫線', d7.L);
  // 8. v5.1.589 コピペ: 膜が無い字= 複製が相方(▲)/膜が在る字= 中継点
  const paste = async (d, at, text) => { const ed = mkEd(d); stub.window.visibleTextEditors = [ed]; d.L.splice(at, 0, text); d.version++;
    T.meosPuzzleDupFollow({ document: d, contentChanges: [{ text: text + '\n', range: { start: { line: at, character: 0 } } }] }); await new Promise(r => setTimeout(r, 50)); };
  const d8 = mkDoc(['a', P1a, 'b', 'c']); T.meosPuzzleFSet(d8, 1, 'M_20261101S090000JST');
  await paste(d8, 3, P1a);
  ok(/\{\* ▼mP1=M_20261101S090000JST/.test(d8.L[1]) && d8.L[2] === R && d8.L[3] === 'b' && d8.L[4] === '' && d8.L[5] === R && /\{\* ▲mP1=M_2026\d{4}\w\d{6}JST/.test(d8.L[6]) && !/090000/.test(d8.L[6]) && d8.L[7] === 'c', '古いP1を下へコピペ= 元が▼・複製が▲・罫線と空行', d8.L);
  const d9 = mkDoc(['a', 'b', P1a, 'c']); T.meosPuzzleFSet(d9, 1, 'M_20261101S090000JST');
  await paste(d9, 0, P1a);
  ok(/\{\* ▼mP1=/.test(d9.L[0]) && d9.L[1] === R && d9.L[4] === '' && d9.L[5] === R && /\{\* ▲mP1=M_20261101S090000JST/.test(d9.L[6]), '上へコピペ= 複製が▼・元が▲・罫線', d9.L);
  await paste(d9, 2, P1a.replace('▶◀', '▶◀'));
  ok(/\{\* 🚥mP1=/.test(d9.L[2]) && /▼mP/.test(d9.L[0]) && /▲mP/.test(d9.L[7]) && d9.filter === undefined && d9.L.filter(l => l === R).length === 2, '膜が在る時のコピペ= 中継点・罫線は増えない', d9.L);
  const d10 = mkDoc(['a', P1O, R, '中', '', R, P1C, 'z']); T.meosPuzzleFSet(d10, 1, 'M_20261108S100001JST');
  await paste(d10, 4, P1O);
  ok(/\{\* 🚥mP1=/.test(d10.L[4]) && /▼mP/.test(d10.L[1]) && /▲mP/.test(d10.L[7]), '▼P1のコピペ= ▼を外して中継点', d10.L);
  // 9. v5.1.590 実機の形= 1本だけの字は F の控えが無い・元の行のすぐ上に貼る
  const d11 = mkDoc(['a', P1a, 'b']);
  await paste(d11, 1, P1a);
  ok(/▼mP1=/.test(d11.L[1]) && d11.L[2] === R && d11.L[3] === '' && d11.L[4] === '' && d11.L[5] === R && /▲mP1=M_20261101S090000JST/.test(d11.L[6]) && d11.L[7] === 'b', 'Fの控え無し・元のすぐ上に貼る= 複製▼・元▲・新規と同じ形', d11.L);
  const d12 = mkDoc(['a', P1a, 'b']);
  await paste(d12, 2, P1a);
  ok(/▼mP1=M_20261101S090000JST/.test(d12.L[1]) && d12.L[2] === R && d12.L[5] === R && /▲mP1=/.test(d12.L[6]), 'Fの控え無し・すぐ下に貼る= 元▼・複製▲・罫線', d12.L);
  // 10. v5.1.590 膜を消したら🔴を1つ前の字へ
  gs.set('meosPuzzleLast', 'c'); gs.set('meosPuzzlePrev', 'D');
  const P5O = P1O.replace(/mP1=M_/, 'mP5=c_'), P5C = P1C.replace(/mP1=M_/, 'mP5=c_');
  const d13 = mkDoc(['a', P5O, R, '中', '', R, P5C, 'z']); T.meosPuzzleFSet(d13, 5, 'c_20261108S100001JST');
  await T.meosPuzzleSweep(mkEd(d13), 5, 'c');
  ok(gs.get('meosPuzzleLast') === 'c', '閉じ膜を消す2段目= 🔴のまま(592)', gs.get('meosPuzzleLast'));
  await T.meosPuzzleSweep(mkEd(d13), 5, 'c');
  ok(gs.get('meosPuzzleLast') === 'D' && gs.get('meosPuzzlePrev') === '', '開始膜まで消す= 🔴は1つ前の D へ', [gs.get('meosPuzzleLast'), gs.get('meosPuzzlePrev')]);
  gs.set('meosPuzzleLast', 'c'); gs.set('meosPuzzlePrev', 'D');
  const d14 = mkDoc(['a', P5O, R, P1a.replace(/mP1=M_/, 'mP5=c_'), '', R, P5C, 'z']); T.meosPuzzleFSet(d14, 5, 'c_20261108S100001JST');
  await T.meosPuzzleSweep(mkEd(d14), 5, 'c');
  ok(gs.get('meosPuzzleLast') === 'c', '中継点だけ消す1段目= 🔴は動かない', gs.get('meosPuzzleLast'));
  const d15 = mkDoc(['a', P1a, R, '中', '', R, 'z']); T.meosPuzzleFSet(d15, 1, 'M_20261101S090000JST');
  await paste(d15, 6, P1a);
  ok(d15.L.filter(l => l === R).length === 2 && /▼mP/.test(d15.L[1]) && /▲mP/.test(d15.L[6]), '罫線が既に在れば足さない', d15.L);
  // 11. v5.1.591 画面が遅れて動く(34万行の実機)= AtTop が効いてから見えるかを確かめる
  { const d = mkDoc(Array.from({ length: 400 }, (_, i) => 'l' + i)); const log = [];
    const sh = mkEd(d); sh.visibleRanges = [{ start: { line: 180 }, end: { line: 220 } }];   // 古い画面= カーソル(200)を中央に見せた姿
    sh.revealRange = (r, t) => { log.push([r.start.line, t]); if (t === 3) setTimeout(() => { sh.visibleRanges = [{ start: { line: r.start.line }, end: { line: r.start.line + 40 } }]; }, 300); if (t === 2) setTimeout(() => { sh.visibleRanges = [{ start: { line: r.start.line - 20 }, end: { line: r.start.line + 20 } }]; }, 50); };
    stub.window.showTextDocument = async (doc, o) => { sh.selection = o.selection; return sh; };
    await T.meosPuzzleLand(mkEd(d), 100, true, new stub.Position(200, 3)); await new Promise(r => setTimeout(r, 400));
    ok(log.some(x => x[0] === 200 && x[1] === 2), '遅れて AtTop が効いても最後の場所(200)を見せ直す', log); }
  // 12. v5.1.595 一時停止線ボタン
  { const at = (L, ln) => { const d = mkDoc(L), e = mkEd(d, { start: { line: ln, character: 0 }, end: { line: ln, character: 0 }, active: { line: ln, character: L[ln].length }, isEmpty: true }); return [d, e]; };
    let [d, e] = at(['本文1', '本文2', '後'], 0); await T.meosStopLineToggle(e, false);
    ok(d.L.join('|') === ['本文1', R, '本文2', '後'].join('|') && e.selection.active.line === 2, '本文の行= すぐ下に線だけ・カーソルは線の下', [d.L, e.selection.active]);
    [d, e] = at(['本文1', '', '後'], 1); await T.meosStopLineToggle(e, false);
    ok(d.L.join('|') === ['本文1', R, '後'].join('|'), '空の行= その行を線に', d.L);
    [d, e] = at(['', '', ''], 1); await T.meosStopLineToggle(e, false);
    ok(d.L.join('|') === ['', R, ''].join('|'), '上下が空行= 線だけ', d.L);
    [d, e] = at(['本文1', '', R, '', '後'], 3); ok(T.meosStopLineNear(d, 3) === 2 && T.meosStopLineNear(d, 1) === 2 && T.meosStopLineNear(d, 2) === 2 && T.meosStopLineNear(d, 0) === -1 && T.meosStopLineNear(d, 4) === -1, '🚫になるのは線の上と前後の行だけ', [0, 1, 2, 3, 4].map(l => T.meosStopLineNear(d, l)));
    await T.meosStopLineToggle(e, true); ok(d.L.join('|') === ['本文1', '', '後'].join('|'), '外す= 線と空行1つ(入れた時の形へ戻る)', d.L);
    [d, e] = at(['', R, '', R, ''], 2); await T.meosStopLineToggle(e, true);
    ok(d.L.join('|') === ['', R, ''].join('|'), '2本の間で🚫= 上の線と、その向こうの空行を消す(カーソルの行と下の線は隣のまま)', d.L);
    [d, e] = at(['上', '', '<!-- Mew!UFC === -->', '中', '<!-- Mew!UFC -.- -->', '', '下'], 3); await T.meosStopLineToggle(e, true);
    ok(d.L.join('|') === ['上', '', '中', '<!-- Mew!UFC -.- -->', '', '下'].join('|'), '本文の行で上下とも線= 上の線を消す', d.L);
    ok(T.meosStopKindOf(R) === 0 && T.meosStopKindOf('<!-- Mew!UFC === -->') === 1 && T.meosStopKindOf('<!-- Mew!UFC -.- -->') === 2 && T.meosStopLineNear(mkDoc(['<!-- Mew!UFC ===== -->']), 0) === 0 && T.meosStopLineNear(mkDoc(['<!-- Mew!UFC -.-.- -->']), 0) === 0, '線の種類= --- / === / -.-(長くても可)', 0);
    gs.set('fmtStopKind', 1); [d, e] = at(['本文'], 0); await T.meosStopLineToggle(e, false); gs.set('fmtStopKind', 0);
    ok(d.L[1] === '<!-- Mew!UFC === -->', '↻で二重線を選ぶと === を書く', d.L);
    [d, e] = at(['```', R, '```', 'x'], 3); ok(T.meosStopLineNear(d, 2) === -1, '囲いの中の線は数えない', T.meosStopLineNear(d, 2)); }
  // 13. v5.1.663(俊克 11.12): 離した後に運ぶ(599)はやめた= 離した所のまま
  { const mk = () => { const L = []; for (let i = 0; i < 60; i++) L.push('行' + i); L[40] = R; return mkDoc(L); };
    const run = async (d, from, presses) => { const ed = mkEd(d, { start: { line: from, character: 1 }, end: { line: from, character: 1 }, active: { line: from, character: 1 }, isEmpty: true }); ed.selections = [ed.selection];
      stub.window.activeTextEditor = ed; stub.commands.executeCommand = async (c) => { const a = ed.selection.active, l = Math.max(0, Math.min(d.lineCount - 1, a.line + (c === 'cursorDown' ? 1 : c === 'cursorUp' ? -1 : 0))); const p = new stub.Position(l, a.character); ed.selection = { start: p, end: p, active: p, anchor: p, isEmpty: true }; ed.selections = [ed.selection]; };
      for (let i = 0; i < presses; i++) { T.meosRuleStep(true); await new Promise(r => setTimeout(r, 30)); } await new Promise(r => setTimeout(r, 400)); return ed.selection.active.line; };
    let l = await run(mk(), 15, 8); ok(l === 23, 'v5.1.663 押しっぱなし(8回)で離す= 運ばない(離した所のまま)', l);
    l = await run(mk(), 5, 8); ok(l === 13, '止まる点が20行より先= 運ばない(離した所のまま)', l);
    l = await run(mk(), 30, 1); ok(l === 31, '1回押しただけ= 運ばない', l);
    { const L2 = []; for (let i = 0; i < 60; i++) L2.push('行' + i + 'のながい文'); L2[40] = R; const dd = mkDoc(L2);
      const ln = await run(dd, 30, 14); const a = stub.window.activeTextEditor.selection.active; ok(ln === 39 && a.character === L2[39].length, 'v5.1.664 押しっぱなしの↓は停止線の手前の行の末尾で止まる(Cmd+↓と同じ所)', [ln, a.character]); } }
  // 14. v5.1.600 膜の境の一時停止線= 開始膜の下(1)・閉じ膜の上(-1)・中(0)
  { const d = mkDoc([P1O, R, '中', R, '中2', '', R, P1C, H1, R, 'x', '', R, H2, '<!-- {* ▼mCN=親_1 // c *} -->', R, 'y', R, '<!-- {* ▲mCN=親_1 // c *} -->']);
    const g = [1, 3, 6, 9, 12, 15, 17].map(i => T.meosStopEdgeOf(d, i));
    ok(g.join(',') === '1,0,-1,1,-1,1,-1', '膜の境= P1・♥・mCN 膜とも開始の下=1/閉じの上=-1・中の線=0', g); }
  // 15. v5.1.636 🚥中継点を押す= 同じ字の次の印(中継点か ▼/▲)・最後は先頭へ
  { const P1t = '<!-- {* 🚥mP1=M_20261109S090000JST //  *} -->', P1u = '<!-- {* 🚥mP1=M_20261109S090001JST //  *} -->';
    const d = mkDoc([P1O, R, P1a, '中', P1t, '', R, P1C, 'z', P1u]); T.meosPuzzleFSet(d, 1, 'M_20261108S100001JST');
    const ed = mkEd(d); let shownAt = -1; ed.revealRange = (r) => { shownAt = r.start.line; }; stub.window.activeTextEditor = ed; stub.window.visibleTextEditors = [ed];
    stub.window.showTextDocument = async (doc, o) => { ed.selection = o.selection; return ed; };
    const click = async (ln, col) => { T.meosFofChipClick({ kind: 2, textEditor: ed, selections: [{ active: { line: 8, character: 0 }, isEmpty: true }] });   // 先に別の行に居た
      const p = { line: ln, character: col || 0 }; ed.selection = { start: p, end: p, active: p, anchor: p, isEmpty: true };
      T.meosFofChipClick({ kind: 2, textEditor: ed, selections: [{ active: p, isEmpty: true }] }); await new Promise(r => setTimeout(r, 600)); return shownAt; };
    let l = await click(2); ok(l === 4, '★🚥: 古い▶◀の中継点(2)→ 次の中継点(4)', l);
    l = await click(4); ok(l === 9, '★🚥: 中継点(4)→ 膜の外の中継点(9)・▲には寄らない', l);
    l = await click(9); ok(l === 2, '★🚥: 最後の中継点(9)→ 最初の中継点(2)', l);
    shownAt = -1; l = await click(9, 1); ok(l === 0, '★札P1: 膜の外の中継点(9)→ 開始膜(0)', l); }
  // 16. v5.1.637 ♥の中間も 🚥= 押すと次の中継点か ▼/▲・組の間へ写した古い ♥️▶◀ は ♥️🚥 に
  { const M1 = '<!-- {* ♥️▶◀mP7=f_20261109S000001JST //  *} -->', M2 = '<!-- {* ♥️🚥mP7=f_20261109S000002JST //  *} -->';
    const d = mkDoc([H1, R, M1, 'x', M2, '', R, H2, 'z']); T.meosPuzzleFSet(d, 7, 'f_20261108S005813JST');
    const ed = mkEd(d); let shownAt = -1; ed.revealRange = (r) => { shownAt = r.start.line; }; stub.window.activeTextEditor = ed; stub.window.visibleTextEditors = [ed];
    stub.window.showTextDocument = async (doc, o) => { ed.selection = o.selection; return ed; };
    const click = async (ln, col) => { T.meosFofChipClick({ kind: 2, textEditor: ed, selections: [{ active: { line: 8, character: 0 }, isEmpty: true }] });
      const p = { line: ln, character: col || 0 }; ed.selection = { start: p, end: p, active: p, anchor: p, isEmpty: true };
      T.meosFofChipClick({ kind: 2, textEditor: ed, selections: [{ active: p, isEmpty: true }] }); await new Promise(r => setTimeout(r, 600)); return shownAt; };
    let l = await click(2); ok(l === 4, '★🚥: 古い♥️▶◀の中間(2)→ 次の中間(4)', l);
    l = await click(4); ok(l === 2, '★🚥: 最後の中間(4)→ 最初の中間(2)', l);
    shownAt = -1; l = await click(4, 1); ok(l === 0, '★♥: 中間(4)→ 開始♥(0)', l);
    const d2 = mkDoc([H1, R, M1, 'x', '', R, H2]); T.meosPuzzleFSet(d2, 7, 'f_20261108S005813JST');
    const pe = mkEd(d2); stub.window.visibleTextEditors = [pe]; d2.L.splice(4, 0, M1); d2.version++;
    T.meosPuzzleDupFollow({ document: d2, contentChanges: [{ text: M1 + '\n', range: { start: { line: 4, character: 0 } } }] }); await new Promise(r => setTimeout(r, 80));
    ok(/\{\* ♥️🚥mP7=f_2026\d{4}\w\d{6}JST/.test(d2.L[4]) && d2.L[2] === M1 && /♥️▼mP7/.test(d2.L[0]) && /♥️▲mP7/.test(d2.L[7]), '★組の間へ写した古い♥️▶◀= ♥️🚥・組はそのまま', d2.L); }
  // 7. 色
  ok(T.meosPuzzleColor('M', 0.95) === 'rgba(229, 57, 53, 0.95)' && T.meosPuzzleColor('k', 0.14) === 'rgba(194, 24, 91, 0.14)', '札の色= Me Dock の字の色', [T.meosPuzzleColor('M', 0.95), T.meosPuzzleColor('k', 0.14)]);
  console.log(ng ? ('NG ' + ng) : '全項目 PASS');
  process.exit(0);
})();
