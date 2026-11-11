// 開発用ツール(vsix除外): v5.1.645 一時停止線の🛑でオン/オフ(--- 🚫)・開始膜の線の右の🛑で中を一括。
// 使い方:  node src/check_stopoff.js
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
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meosMemRecentlyFolded, _meosMemJustFolded, MEOS_RULE_LINE_RE, MEOS_RULE_OFF_RE, MEOS_STOP_OFF_URL, MEOS_STOP_SIGN_URL, meosIsRuleAny, meosStopOffText, meosStopNextLines, meosStopSignal, MEOS_STOP_YELLOW_URL, MEOS_STOP_YELLOW_OFF_URL, MEOS_STOP_NONE_URL, meosStopBtnSpots, meosStopToggleSelf, meosStopCycleNext, meosStopKindOf, meosMembraneRuleTarget, meosStopLineNear, makeDecorations, meosApplyTimerLineDecorations, setCtx: (c) => { extensionContext = c; } };\n', 'utf8');
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
  // 1. 記法
  ok(T.MEOS_RULE_OFF_RE.source !== T.MEOS_RULE_LINE_RE.source && T.MEOS_RULE_OFF_RE.test(RO) && !T.MEOS_RULE_OFF_RE.test(R) && !T.MEOS_RULE_LINE_RE.test(RO), 'オフの記法 --- 🚫 はオンと別の式で読む', T.MEOS_RULE_OFF_RE.source);
  ok(['<!-- Mew!UFC - - 🚫 -->', '<!-- Mew!UFC ... 🚫 -->', '<!-- Mew!UFC ≈≈≈ 🚫 -->', '<!-- Mew!UFC -..- 🚫 -->'].every(t => T.MEOS_RULE_OFF_RE.test(t) && T.meosIsRuleAny(t)), '8種どれでもオフにできる', 0);
  ok(T.meosStopKindOf('<!-- Mew!UFC --- 🚫 -->') === 0 && T.meosStopKindOf('<!-- Mew!UFC - - 🚫 -->') === 4 && T.meosStopKindOf('<!-- Mew!UFC ... 🚫 -->') === 5 && T.meosStopKindOf('<!-- Mew!UFC === 🚫 -->') === 1, '🚫は種類に数えない', [T.meosStopKindOf(RO)]);
  ok(T.meosStopOffText(R, true) === RO && T.meosStopOffText(RO, false) === R && T.meosStopOffText(W, true) === '<!-- Mew!UFC 〜〜〜 🚫 -->', 'オン⇄オフの書き換え', T.meosStopOffText(R, true));
  // 2. オフの線では止まらない
  const d1 = doc(['a0', RO, 'a2', R, 'a4']); ok(T.meosMembraneRuleTarget(d1, 0, true) === 2, 'オフの線は Cmd+↓ で素通り(次のオンの線で止まる)', T.meosMembraneRuleTarget(d1, 0, true));
  const d2 = doc(['top', H1, RO, 'in3', R, 'in5', R, H2, 'end']); ok(T.meosMembraneRuleTarget(d2, 0, true) === 3, '開始膜の線をオフ= 外から↓で膜の中へ入れる(一方通行)', T.meosMembraneRuleTarget(d2, 0, true));
  // 3. 次の線とその先(v5.1.652)= 包む膜の閉じ膜の線の手前まで・囲いの中は数えない
  const d3 = doc(['top', H1, R, 'a3', R, 'a5', RO, 'a7', '```', R, '```', R, H2, 'x13', R, 'end']);
  const J = (a) => a ? JSON.stringify(a.map(x => [x.line, x.off])) : String(a);
  ok(J(T.meosStopNextLines(d3, 2)) === '[[4,false],[6,true]]', '開始膜の線= 膜の中(閉じ膜の線と囲いの中は数えない)', J(T.meosStopNextLines(d3, 2)));
  ok(J(T.meosStopNextLines(d3, 4)) === '[[6,true]]', '中の線= 自分の下から閉じ膜の線の手前まで', J(T.meosStopNextLines(d3, 4)));
  ok(J(T.meosStopNextLines(d3, 11)) === '[[14,false]]', '閉じ膜の線= 膜の外(下)', J(T.meosStopNextLines(d3, 11)));
  { const dn = doc(['top', H1, R, 'a', H1.replace('テスト', 'x').replace('mP7', 'mP6'), R, 'b', R, H2.replace('mP7', 'mP6'), R, 'c', R, H2, 'end']);
    ok(J(T.meosStopNextLines(dn, 7)) === '[[9,false]]', '入れ子の閉じ膜の線= 外側の膜の閉じ膜の線の手前まで', J(T.meosStopNextLines(dn, 7))); }
  ok(T.meosStopNextLines(d3, 3) === null && J(T.meosStopNextLines(d3, 14)) === '[]', '線でなければ null・下に線が無ければ空', 0);
  ok(T.meosStopSignal([]) === 'none' && T.meosStopSignal([{ off: false }, { off: false }]) === 'red' && T.meosStopSignal([{ off: false }, { off: true }]) === 'yellow' && T.meosStopSignal([{ off: true }, { off: true }]) === 'blue' && T.meosStopSignal([{ off: true }, { off: false }]) === 'yellowOff' && T.meosStopSignal([{ off: true }]) === 'blue' && T.meosStopSignal([{ off: false }]) === 'red' && T.meosStopSignal([{ off: true }, { off: false }, { off: true }]) === 'yellowOff', 'v5.1.653 信号= 字は次の線(STOP/OFF)・色はその先(同じなら赤/青・違う物が混じれば黄)', 0);
  // 4. 札の桁= どの線も 左1・右(オン3/オフ2)。次が無い線は右の札なし
  const s2 = T.meosStopBtnSpots(d3, 2, null), s4 = T.meosStopBtnSpots(d3, 4, null), s14 = T.meosStopBtnSpots(d3, 14, null), s9 = T.meosStopBtnSpots(d3, 9, null), s6 = T.meosStopBtnSpots(d3, 6, null);
  ok(s2 && s2.self === 1 && s2.pad === 2 && s2.bulk === 3 && s2.sig === 'yellow' && s4 && s4.bulk === 3 && s4.sig === 'blue' && s14 && s14.bulk === -1 && s14.sig === 'none' && s6 && s6.bulk === -1 && s6.sig === 'none' && s9 === null, '札= 左は桁1・右はオン3/オフ2・中の線も押せる・次が無い線は札なし・囲いの中は無し', [s2, s4 && s4.sig, s14 && s14.bulk, s6 && s6.bulk, s9]);
  { const d4 = doc(['top', H1, RO, 'a3', R, 'a5', R, H2]); const s42 = T.meosStopBtnSpots(d4, 2, null); ok(s42 && !s42.on && s42.bulk === 2 && s42.pad === -1 && s42.sig === 'red', 'オフの線= 右の札は左の隣(桁2)', s42); }
  // 5. 押す= 赤→青→黄STOP→黄OFF→赤
  const d5 = doc(['top', H1, R, 'a3', R, 'a5', R, 'a7', R, 'a9', R, H2, 'x', R, 'end']); const e5 = mkEd(d5);
  await T.meosStopToggleSelf(e5, 4); ok(d5.L[4] === RO, '左の🛑= 自分をオフ', d5.L[4]); await T.meosStopToggleSelf(e5, 4); ok(d5.L[4] === R, 'もう1回でオン', d5.L[4]);
  const st = (ln) => T.meosStopSignal(T.meosStopNextLines(d5, ln));
  ok(st(2) === 'red', '開始膜の線= 中がすべてオンなら赤', st(2));
  await T.meosStopCycleNext(e5, 2); ok(d5.L[4] === RO && d5.L[6] === RO && d5.L[8] === RO && d5.L[2] === R && d5.L[10] === R && st(2) === 'blue', '赤→青= 次以降すべてオフ(自分と閉じ膜の線はそのまま)', d5.L);
  await T.meosStopCycleNext(e5, 2); ok(d5.L[4] === R && d5.L[6] === RO && d5.L[8] === RO && st(2) === 'yellow', '青→黄= 次だけオン・その先はオフ', d5.L);
  await T.meosStopCycleNext(e5, 2); ok(d5.L[4] === RO && d5.L[6] === R && d5.L[8] === R && st(2) === 'yellowOff', 'v5.1.653 黄STOP→黄OFF= 次だけオフ・その先はオン', d5.L);
  await T.meosStopCycleNext(e5, 2); ok(d5.L[4] === R && d5.L[6] === R && d5.L[8] === R && st(2) === 'red', '黄OFF→赤= 次以降すべてオン', d5.L);
  await T.meosStopCycleNext(e5, 4); ok(d5.L[4] === R && d5.L[6] === RO && d5.L[8] === RO && st(4) === 'blue', '中の線の右= 自分の下だけを回す', d5.L);
  await T.meosStopCycleNext(e5, 10); ok(d5.L[13] === RO && d5.L[10] === R, '閉じ膜の線の右= 膜の外(下)の線を回す', d5.L);
  d5.L[6] = R; d5.L[8] = RO; d5.version++; ok(st(4) === 'yellow', '手で次だけオンにしても黄', st(4));
  d5.L[6] = RO; d5.L[8] = R; d5.version++; ok(st(4) === 'yellowOff', 'v5.1.653 手で次だけオフにすると黄OFF', st(4));
  ok(await T.meosStopCycleNext(e5, 13) === false, '次が無い線(黒NONE)は押しても何もしない', 0);
  ok(T.meosStopLineNear(doc(['x', RO, 'y']), 0) === 1, 'Format Me の🛑/🚫 はオフの線も見つける(消せる)', 0);
  // 6. 描く= オフは線を消して左に OFF・開始膜のオフは2つ・隠す範囲は札の桁で割る
  T.makeDecorations(); const d6 = doc(['top', H1, RO, 'a3', RO, 'a5', R, H2, 'x8', R, 'end']), calls = [], e6 = mkEd(d6, { start: { line: 0, character: 0 }, end: { line: 0, character: 0 }, active: { line: 0, character: 0 }, isEmpty: true });
  e6.selections = [e6.selection]; e6.setDecorations = (deco, items) => calls.push({ deco, items: items || [] }); stub.window.activeTextEditor = e6; stub.window.visibleTextEditors = [e6];
  T.meosApplyTimerLineDecorations(e6);
  const bg = (ln) => calls.flatMap(c => c.items).filter(x => x && x.range && x.range.start.line === ln && x.renderOptions && x.renderOptions.before && /background:/.test(x.renderOptions.before.textDecoration || '')).map(x => x.renderOptions.before.textDecoration)[0] || '';
  const nOff = (t) => t.split(T.MEOS_STOP_OFF_URL).length - 1, nStop = (t) => t.split(T.MEOS_STOP_SIGN_URL).length - 1;
  const nY = (t) => t.split(T.MEOS_STOP_YELLOW_URL).length - 1, nN = (t) => t.split(T.MEOS_STOP_NONE_URL).length - 1;
  ok(nOff(bg(2)) === 2 && nStop(bg(2)) === 0, '開始膜の線オフ・次もオフ= 青OFF が2つ並ぶ', [nOff(bg(2)), nStop(bg(2))]);
  ok(nOff(bg(4)) === 1 && nN(bg(4)) === 1 && nStop(bg(4)) === 0 && !/gradient/.test(bg(4)), '中の線オフ・次が無い= 左に青OFF・隣に黒NONE・線は描かない', [nOff(bg(4)), nN(bg(4))]);
  ok(nStop(bg(6)) === 2 && nOff(bg(6)) === 0 && /gradient/.test(bg(6)), 'v5.1.652 閉じ膜の線オン・外の線がすべてオン= 左右とも赤STOP と線', [nStop(bg(6)), nOff(bg(6))]);
  ok(nStop(bg(9)) === 1 && nN(bg(9)) === 1, '次が無い線= 右は黒NONE', [nStop(bg(9)), nN(bg(9))]);
  ok(/position: absolute/.test(bg(4)) && /position: relative/.test(bg(9)), 'オフの線は箱を浮かせる・オンの線は札の間に置く', [bg(4).slice(0, 40), bg(9).slice(0, 40)]);
  { const d7 = doc(['top', H1, R, 'a3', R, 'a5', R, H2]), c7 = [], e7 = mkEd(d7, { start: { line: 0, character: 0 }, end: { line: 0, character: 0 }, active: { line: 0, character: 0 }, isEmpty: true });
    e7.selections = [e7.selection]; e7.setDecorations = (deco, items) => c7.push({ deco, items: items || [] }); stub.window.activeTextEditor = e7; stub.window.visibleTextEditors = [e7]; T.meosApplyTimerLineDecorations(e7);
    const bx = c7.flatMap(c => c.items).filter(x => x && x.range && x.range.start.line === 2 && x.renderOptions && x.renderOptions.before && /background:/.test(x.renderOptions.before.textDecoration || ''));
    ok(bx.length === 1 && bx[0].range.start.character === 2 && /margin-left: -2ch; margin-right: -2ch/.test(bx[0].renderOptions.before.textDecoration) && !/absolute/.test(bx[0].renderOptions.before.textDecoration), 'v5.1.646 開始膜の線(オン)の箱は札の間(桁2)に置き負の余白= 右の札が右端の標識に重なる(詰め物の見積もりなし)', bx.map(x => [x.range.start.character, x.renderOptions.before.textDecoration.slice(0, 90)])); }
  { // v5.1.648: ▲で畳んだ膜を FC の道が開け直さない
    const SRC = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
    T._meosMemJustFolded.set(5, Date.now()); ok(T.meosMemRecentlyFolded(5) && !T.meosMemRecentlyFolded(6), 'v5.1.648 畳んだ膜を覚える(2秒)', 0);
    T._meosMemJustFolded.set(7, Date.now() - 2500); ok(!T.meosMemRecentlyFolded(7), '2秒過ぎたら忘れる(その頃には visibleRanges が新しい)', 0);
    ok(/if \(folded\) _meosMemJustFolded\.set\(pair\.start/.test(SRC) && /_toOpen47 = [^\n]*!\(it\.b\.open != null && meosMemRecentlyFolded\(it\.b\.open\)\)/.test(SRC), '畳む口で覚え・FC の開ける相手から今しがた畳んだ膜の塊を外す', 0);
    ok(/_open46 = _shape46\.filter\([^\n]*!\(it\.b\.open != null && meosMemRecentlyFolded\(it\.b\.open\)\)/.test(SRC), 'v5.1.650 一括の道(fcOpen)も今しがた畳んだ膜のFCは開けない', 0); }
  { const SRC = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8'), i = SRC.indexOf("[noRaw] マウスで同じ行を押し直した"), seg = SRC.slice(i, i + 1500);
    ok(i > 0 && /_refNoRawPrevLine = _refNoRawLine;[^\n]*\n\s*_refNoRawLine = -1/.test(seg), 'v5.1.649 押し直しで抑止を解く時も控えを残す(▲で開いた直後の▲が捨てられない)', 0); }
  { const SRC = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
    ok(/meosParkCaretAfterPress\(editor, matched\.pair\.start\);[^\n]*\n(?:\s*\/\/[^\n]*\n)*\s*try \{ if \(!_wasFolded && _meosParkBack[^\n]*_bl > matched\.pair\.start && _bl <= meosPairBlockEnd\(editor\.document, matched\.pair\)\) _meosParkBack\.back = null/.test(SRC), 'v5.1.651 ▲で畳んだ時、カーソルを畳んだ膜の中(押す前の▲の行)へ戻さない(戻すと VS Code が膜を開く)', 0); }
  { const SRC = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
    ok(/if \(capturedAt && _meosViewPlacedAt >= capturedAt\) return;/.test(SRC) && (SRC.match(/meosRestoreView\(editor, _topBefore, null, false, _topAt56\)/g) || []).length === 3 && (SRC.match(/_meosViewPlacedAt = Date\.now\(\);/g) || []).length === 2, 'v5.1.656 FC の道は▲/▼が画面を置いた後なら、控えた古い上端へ戻さない(3か所とも)', 0); }
  const hid = (ln) => calls.flatMap(c => c.items.map(x => [c.deco, x])).map(p => [p[0], p[1] && p[1].range ? p[1].range : p[1]]).filter(p => p[1] && p[1].start && p[1].start.line === ln && p[0].__opts && /opacity: 0; font-size: 0;'?$/.test(p[0].__opts.textDecoration || '') && !/letter-spacing/.test(p[0].__opts.textDecoration)).map(p => [p[1].start.character, p[1].end.character, p[0]]).sort((a, b) => a[0] - b[0]);
  const h2 = hid(2); ok(h2.length === 3 && h2[0][1] === 1 && h2[1][1] === 2 && h2[0][2] !== h2[1][2] && h2[0][2] === h2[2][2], '開始膜の線(オフ)の字は札の桁1・2で割って2つの型で交互に隠す', h2.map(x => [x[0], x[1]]));
  const h9 = hid(9); ok(h9.length === 3 && h9[0][1] === 1 && h9[1][1] === 2 && h9[0][2] !== h9[1][2], 'オンの線は桁1・2で割る(札が幅0にならない)', h9.map(x => [x[0], x[1]]));
  console.log(ng ? 'NG ' + ng + '件' : 'ALL OK'); process.exit(ng ? 1 : 0);
})();
