// 開発用ツール(vsix除外): v5.1.609 ♥膜の1dタイマー= 書く3つの道・持ち主・消す(本文は残す)・閉じている間に過ぎた分。
// 使い方:  node src/check_fofclock.js
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
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meosClockZone, meosClockFar, meosClockDdTitle, meosClockWtOf, meosFofPair, meosFofRange, meosFofReconcile, meosFofWrap, meosPuzzleTagsOf, meosPuzzleFSet, meosPuzzleFGet, meosPuzzleSweep, meosPuzzleTag, meosClockFcScan, meosFofClockWrite, meosFofClockExpire, meosArmClockFcFor, meosPshPath, meosFuseSamples, fuse: _meosFofFuse, fusePlan: meosFofFusePlan, clear: meosClearPseudoTimer, meosScopeRangeNow, makeDecorations, meosApplyTimerLineDecorations, meosPseudoTimeUp, until: _meosPseudoUntil, scopes: _meosPseudoScopes, say: meosClockSayName, setCtx: (c) => { extensionContext = c; } };\n', 'utf8');
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
const R = '<!-- Mew!UFC --- -->', isBadge = (t) => /Mew!U?FC mCN \(📊⊕0\+0\)/.test(t), badges = (d) => d.L.filter(isBadge), isClock = (t) => /^<!-- Mew!UFC ⏰ 🔕\/🔕 ↺↻\(0y1d0h0m0s\)×1 v2\d{3}-\d\d-\d\d \d\d:\d\d[.:]\d\d \/\/ ♥️Timer dd -->$/.test(t), settle = () => new Promise(r => setTimeout(r, 40)), clocks = (d) => d.L.filter(t => t.indexOf('⏰') >= 0);
const past = '<!-- Mew!UFC ⏰ 🔕/🔕 ↺ 2026-01-01 09:00 -->', far = '<!-- Mew!UFC ⏰ 🔕/🔕 ↺ 2099-01-01 09:00 -->', paused = '<!-- Mew!UFC ⏰⏸ 🔕/🔕 ↺ 2026-01-01 09:00 -->';
const H1 = '<!-- {* ♥️▼▶◀mP7=f_20261108S005813JST //  *} -->', H2 = '<!-- {* ♥️▲▶◀mP7=f_20261108S005814JST //  *} -->', Hm = '<!-- {* ♥️▶◀mP7=f_20261108S005900JST //  *} -->', Fn = 'f_20261108S005813JST';
(async () => {
  // 1. 選択を包む(本物の meosFofWrap の出力)
  const d1 = doc(['x', '本文1', '本文2', 'y']); const e1 = mkEd(d1, sel(1, 2)); await T.meosFofWrap(e1, 'f', 7);
  await settle(); const r1 = T.meosFofRange(d1, 7); ok(r1 && isBadge(d1.L[r1.end + 1]) && isClock(d1.L[r1.end + 2]), '閉じ♥の直下にバッジ行・その下に一度きりの⏰', d1.L);
  const s1 = T.meosClockFcScan(d1); ok(s1.length === 1 && s1[0].key === r1.key && s1[0].line === r1.end + 2 && s1[0].ufc && s1[0].cycle.length === 1 && s1[0].rounds === 1 && s1[0].bellMainOn === false, '⏰を♥膜の時計として読む(UFC・1d×1・先鐘🔕)', s1);
  ok(s1[0] && s1[0].name === '♥️', '名前は♥️', s1[0] && s1[0].name);
  const lk1 = d1.uri.toString() + ' ' + r1.key, sc1 = T.scopes.get(lk1); ok(T.until.has(lk1) && sc1, '書いた瞬間に走り出す(自動起動)', [...T.until.keys()]);
  const ex = new Date(s1[0].vAt + 24 * 3600e3), h = ex.getHours(), face = (ex.getMonth() + 1) + '/' + ex.getDate() + '(' + 'SMTWtFs'[ex.getDay()] + ')' + (h >= 12 ? 'pm' : 'am') + String(h > 12 ? h - 12 : h).padStart(2, '0') + ':' + String(ex.getMinutes()).padStart(2, '0');
  ok(sc1 && T.say(sc1) === '♥️Timer ' + face, '一覧の字= ♥️Timer+消滅日時', sc1 && T.say(sc1));
  ok(Math.abs(s1[0].vAt - Date.now()) < 5000, '起点は今', s1[0].vAt);
  const rg = T.meosScopeRangeNow(d1, r1.key); ok(rg && rg.from === r1.start && rg.to === r1.end, '一覧からのワープ先の範囲', rg);
  ok(d1.L.includes('本文1') && d1.L.includes('本文2'), '本文はそのまま', d1.L);
  // 2. 最初の3行
  const d2 = doc(['a', '']); const e2 = mkEd(d2, { start: { line: 1, character: 0 }, end: { line: 1, character: 0 }, active: { line: 1, character: 0 }, isEmpty: true }); stub.window.activeTextEditor = e2; await T.meosPuzzleTag('f', {}); await settle();
  ok(clocks(d2).length === 1 && T.meosClockFcScan(d2).length === 1, '最初の3行にも⏰が1本', d2.L);
  // 3. コピペで組ができる(今ある1点の♥×2)→ 1本だけ。もう一度読んでも増えない
  const d3 = doc(['a', '<!-- {* ♥️▶◀mP7=f_1 //  *} -->', 'b', '<!-- {* ♥️▶◀mP7=f_2 //  *} -->', 'c']); T.meosPuzzleFSet(d3, 7, 'f_1'); const e3 = mkEd(d3); await T.meosFofReconcile(e3, 7); await settle();
  ok(clocks(d3).length === 1, '組が今できた= ⏰が1本', d3.L); await T.meosFofReconcile(e3, 7); await T.meosFofClockWrite(d3); ok(clocks(d3).length === 1, '読み直しても増えない', d3.L);
  // 4. 俊克が⏰を消す→ 戻らない
  d3.L = d3.L.filter(t => t.indexOf('⏰') < 0); d3.version++; await T.meosFofReconcile(e3, 7); ok(clocks(d3).length === 0, '消した⏰は復活しない', d3.L);
  // 5. もう一度包む= 前の閉じ♥は中継点・前の⏰は消える
  const y = d1.L.indexOf('y'); await T.meosFofWrap(mkEd(d1, sel(y, y)), 'f', 7); await settle(); ok(clocks(d1).length === 1 && badges(d1).length === 1 && T.meosClockFcScan(d1).length === 1, '包み直すと⏰とバッジは新しい組の1本だけ', d1.L);
  // 6. 時間切れ= 開始♥だけ残る(実物の並び・中間♥あり・本文あり)
  const d6 = doc(['前', H1, R, '本文', Hm, '本文2', '', R, H2, far, '後']); T.meosPuzzleFSet(d6, 7, Fn); const c6 = T.meosClockFcScan(d6)[0]; ok(!!c6, '実物の行を時計と読む', d6.L);
  const x6 = await T.meosFofClockExpire(d6, c6, false); ok(x6 && JSON.stringify(d6.L) === JSON.stringify(['前', H1, '本文', '本文2', '', '後']), '時間切れ= 開始♥と本文だけ残る', d6.L); ok(T.meosPuzzleFGet(d6, 7) === Fn, 'Fは開始♥', T.meosPuzzleFGet(d6, 7));
  // Fが閉じ♥の時も開始♥が残る
  const d6b = doc([H1, R, '本文', '', R, H2, far]); T.meosPuzzleFSet(d6b, 7, 'f_20261108S005814JST'); await T.meosFofClockExpire(d6b, T.meosClockFcScan(d6b)[0], false); ok(JSON.stringify(d6b.L) === JSON.stringify([H1, '本文', '']), 'Fが閉じ♥でも開始♥が残る', d6b.L);
  // 残った♥をコピペすれば組と 1d が戻る
  // 7. Cmd+クリックで閉じ♥を消す= ⏰も一緒
  const d7 = doc([H1, R, '本文', '', R, H2, far, '後']); T.meosPuzzleFSet(d7, 7, Fn); await T.meosPuzzleSweep(mkEd(d7), 7, 'f'); ok(clocks(d7).length === 0 && d7.L[0] === H1 && d7.L.includes('本文') && d7.L.includes('後'), '閉じ♥を消すと⏰も消える', d7.L);
  // 8. P1〜P6 は対象外
  const d8 = doc(['本文', 'z']); await T.meosFofWrap(mkEd(d8, sel(0, 0)), 'M', 1); ok(clocks(d8).length === 0 && T.meosFofRange(d8, 1), 'P1の膜には⏰を書かない', d8.L);
  // 9. 閉じていた間に過ぎた分= 開いた時に片付く(音なし)/まだ先・⏸は触らない
  const d9 = doc([H1, R, '本文', '', R, H2, past]); T.meosPuzzleFSet(d9, 7, Fn); T.meosArmClockFcFor(d9); await new Promise(r => setTimeout(r, 30)); ok(JSON.stringify(d9.L) === JSON.stringify([H1, '本文', '']), '過ぎていれば開いた時に片付く', d9.L);
  const d10 = doc([H1, R, '本文', '', R, H2, paused]); T.meosPuzzleFSet(d10, 7, Fn); T.meosArmClockFcFor(d10); await new Promise(r => setTimeout(r, 30)); ok(d10.L.includes(H2), '⏸の⏰は片付けない', d10.L);
  const d11 = doc([H1, R, '本文', '', R, H2, far]); T.meosPuzzleFSet(d11, 7, Fn); T.meosArmClockFcFor(d11); await new Promise(r => setTimeout(r, 30)); ok(d11.L.includes(H2), 'まだ先なら触らない', d11.L);
  const v3 = (m) => '<!-- Mew!UFC ⏰ 🔕/🔕 ↺↻(0y0d0h' + m + 'm0s)×1 v2026-01-01 09:00.00 // ♥️Timer dd -->';
  const d13 = doc([H1, R, '本文', '', R, H2, v3(3)]); T.meosPuzzleFSet(d13, 7, Fn); T.meosArmClockFcFor(d13); await settle(); ok(JSON.stringify(d13.L) === JSON.stringify([H1, '本文', '']), '0y0d0h3m0s に直して過ぎていれば消える', d13.L);
  const fresh = '<!-- Mew!UFC ⏰ 🔕/🔕 ↺↻(0y0d0h3m0s)×1 // ♥️Timer dd -->', d14 = doc([H1, R, '本文', '', R, H2, fresh]); T.meosPuzzleFSet(d14, 7, Fn); T.meosArmClockFcFor(d14); await settle();
  const k14 = d14.uri.toString() + ' ♥' + Fn; ok(T.until.has(k14) && /\/\/ ♥️Timer dd -->$/.test(d14.L[6]) && / v2\d{3}-/.test(d14.L[6]), '3分でも自動起動・本文の dd はそのまま', d14.L[6]);
  await T.meosPseudoTimeUp(k14); await settle(); ok(JSON.stringify(d14.L) === JSON.stringify([H1, '本文', '']) && !T.until.has(k14), '時間切れの口で開始♥と本文だけ残る', d14.L);
  // 9c. 走っている♥の⏰の描画(実物と同じ= ♥膜が大きな膜の中)= ⏸ と残り時間(11.09 am10:06 実機で ▶️・数字なし)
  const big = ['<!-- {* ▼mCN=日記_1 // c *} -->', H1, R, '本文', '', R, H2, '<!-- Mew!UFC ⏰ 🔕/🔕 ↺↻(0y1d0h0m0s)×1 // ♥️Timer dd -->', '後', '<!-- {* ▲mCN=日記_1 // c *} -->'], d15 = doc(big); T.meosPuzzleFSet(d15, 7, Fn); T.meosArmClockFcFor(d15); await settle();
  const k15 = d15.uri.toString() + ' ♥' + Fn; ok(T.until.has(k15) && d15.L[7].indexOf(' v2') > 0, '大きな膜の中でも走り出す', d15.L[7]);
  T.makeDecorations(); const calls = [], e15 = mkEd(d15, { start: { line: 8, character: 0 }, end: { line: 8, character: 0 }, active: { line: 8, character: 0 }, isEmpty: true }); e15.selections = [e15.selection]; e15.setDecorations = (deco, items) => calls.push({ deco, items: items || [] }); stub.window.activeTextEditor = e15; stub.window.visibleTextEditors = [e15];
  T.meosApplyTimerLineDecorations(e15); const on7 = calls.flatMap(c => c.items).filter(x => x && x.range && x.range.start.line === 7), texts = on7.map(x => { const r = x.renderOptions || {}; return (r.before && r.before.contentText) || (r.after && r.after.contentText) || ''; });
  ok(texts.some(s => s.indexOf('⏸') >= 0) && !texts.some(s => s.indexOf('▶') >= 0), '走っている♥の⏰は ⏸ を描く(▶️でない)', texts);
  ok(texts.some(s => /\d+:\d\d|\d+h|\d+d/.test(s) && s.indexOf('⏸') < 0), '残り時間を⏰の行に描く', texts);
  // 9d. バッジ行= 残り時間の置き場・消える時は一緒
  const B = '<!-- Mew!UFC mCN (📊⊕0+0) -->', big2 = ['<!-- {* ▼mCN=日記_1 // c *} -->', H1, R, '本文', '', R, H2, B, '<!-- Mew!UFC ⏰ 🔕/🔕 ↺↻(0y1d0h0m0s)×1 // ♥️Timer dd -->', '後', '<!-- {* ▲mCN=日記_1 // c *} -->'], d16 = doc(big2); T.meosPuzzleFSet(d16, 7, Fn); T.meosArmClockFcFor(d16); await settle();
  const calls2 = [], e16 = mkEd(d16, { start: { line: 9, character: 0 }, end: { line: 9, character: 0 }, active: { line: 9, character: 0 }, isEmpty: true }); e16.selections = [e16.selection]; e16.setDecorations = (deco, items) => calls2.push({ deco, items: items || [] }); stub.window.activeTextEditor = e16; stub.window.visibleTextEditors = [e16];
  T.meosApplyTimerLineDecorations(e16); const onB = calls2.flatMap(c => c.items).filter(x => x && x.range && x.range.start.line === 7).map(x => { const r = x.renderOptions || {}; return (r.before && r.before.contentText) || (r.after && r.after.contentText) || ''; });
  ok(onB.some(s => /\d+:\d\d/.test(s)), '残り時間がバッジ行に出る', onB);
  ok(onB.some(s => s.indexOf('♥️Timer') >= 0 && /\d+\/\d+\([SMTWtFs]\)[ap]m\d\d:\d\d/.test(s)) && !onB.some(s => /Timer dd/.test(s)), 'バッジの札の dd が消滅日時になる', onB);
  const c16 = T.meosClockFcScan(d16)[0]; await T.meosFofClockExpire(d16, c16, false); ok(!d16.L.includes(B) && clocks(d16).length === 0 && d16.L.includes(H1) && d16.L.includes('本文') && d16.L.includes('後'), '時間切れでバッジ行も消える', d16.L);
  const d17 = doc([H1, R, '本文', '', R, H2, B, far, '後']); T.meosPuzzleFSet(d17, 7, Fn); await T.meosPuzzleSweep(mkEd(d17), 7, 'f'); ok(badges(d17).length === 0 && clocks(d17).length === 0 && d17.L.includes('後'), 'Cmd+クリックで閉じ♥と一緒にバッジも', d17.L);
  // 9e. 開いたメニューから行が減る(V-helper の本物の部品を切り出して試す)
  const hs = fs.readFileSync(path.join(__dirname, 'helper', 'meos-helper.js'), 'utf8'), hm = /const menuShrink = (\(o, n, ek\) => \{.*?\});\n/.exec(hs), shr = eval(hm[1]), ek = (e) => e.clk ? 'C' + (e.far ? 'f' : '') : (e.sep ? '-' : e.id);
  const rows = (...a) => a.map(id => ({ clk: 1, id, title: id })), hd = [{ id: 'pass', title: 'p' }, { sep: 1 }], tl = [{ sep: 1 }, { id: 'db', title: 'd' }];
  ok(JSON.stringify(shr([...hd, ...rows('h:0', 'h:1', 'h:2'), ...tl], [...hd, ...rows('h:0', 'h:1'), ...tl], ek)) === JSON.stringify([0, 1, 2, 3, -1, 4, 5]), '⏰が1本減る= 最後の行を隠して字は詰める', 0);
  { const kk = eval(/const shrinkKey = (\(e, sk\) => .*?);\n/.exec(hs)[1]), sk = (a) => a.map(e => e.fusen ? 'F' + JSON.stringify([e.fusen, e.color, e.star, e.items]) : e.sep ? '-' : e.id).join('|'), fu = (l) => ({ fusen: 'CB', color: '#e', star: false, items: [{ id: 'fusen:c1@' + l, title: '付箋' }] }), key = (e) => kk(e, sk);
    ok(JSON.stringify(shr([...hd, ...rows('h:0', 'h:1'), fu(178269), ...tl], [...hd, ...rows('h:0'), fu(178263), ...tl], key)) === JSON.stringify([0, 1, 2, -1, 3, 4, 5]), '⏰が消えて付箋の行番号が同時に変わっても隠せる(11:57 の実物)', 0);
    ok(JSON.stringify(shr([...hd, ...rows('h:0'), fu(178269), ...tl], [...hd, ...rows('h:0'), fu(178263), ...tl], key)) === JSON.stringify([0, 1, 2, 3, 4, 5]), '行番号だけ変わった時は行を隠さず止めない', 0);
    ok(shr([...hd, ...rows('h:0'), { fusen: 'CB', color: '#e', star: false, items: [{ id: 'x', title: '別' }] }, ...tl], [...hd, ...rows('h:0'), { fusen: 'CB', color: '#e', star: false, items: [{ id: 'x', title: '違う' }] }, ...tl], key) === null, '付箋の題が変わったら作り替えを待つ', 0); }
  ok(shr([...hd, ...rows('h:0', 'h:1'), ...tl], [...rows('h:0'), ...tl], ek) === null, '⏰と区切り以外が消えたら作り替えを待つ', 0);
  // 9f. 5秒前のシューーー+プシュッ
  const fp = T.meosFuseSamples(), rms = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += fp.out[i] * fp.out[i]; return Math.sqrt(s / (b - a)); }, at = (x) => Math.floor(x * fp.rate);
  let pk = 0; for (const v of fp.out) pk = Math.max(pk, Math.abs(v)); ok(pk <= 1 && pk > 0.8, '音が割れない', pk);
  { let hp = 0; for (let i = at(0.5); i < at(4.9); i++) hp = Math.max(hp, Math.abs(fp.out[i])); ok(hp <= 0.0635 && hp > 0.04, 'シューの音量は元の15%', hp); }
  ok(rms(at(1), at(4.9)) > 0.005 && rms(at(5), at(5.1)) > rms(at(1), at(4.9)) * 1.3 && rms(at(5.33), at(5.39)) < 0.05, 'シューが5秒続きプシュッで強くなり静かに切れる', [rms(at(1), at(4.9)), rms(at(5), at(5.1)), rms(at(5.33), at(5.39))]);
  { const win = at(0.03); let lo = 9, hi = 0; for (let i = at(0.5); i + win < at(4.9); i += win) { const r = rms(i, i + win) / (0.62 + 0.38 * i / at(5)); lo = Math.min(lo, r); hi = Math.max(hi, r); } ok(hi / lo < 1.25, 'シューは切れ目なくつながる(30msごとの強さの揺れ)', [lo, hi, hi / lo]); }
  const d18 = doc([H1, R, '本文', '', R, H2, B, '<!-- Mew!UFC ⏰ 🔕/🔕 ↺↻(0y0d0h0m9s)×1 // ♥️Timer dd -->']); T.meosPuzzleFSet(d18, 7, Fn); T.meosArmClockFcFor(d18); await settle();
  const k18 = d18.uri.toString() + ' ♥' + Fn; const f0 = T.fuse.get(k18); ok(f0 && !f0.played, '時間切れの5.3秒前に予約される', !!f0); T.fusePlan(k18, 5340); const f1 = T.fuse.get(k18); await new Promise(r => setTimeout(r, 90)); ok(f1 && f1.played, '時刻が来ると鳴り始める', f1 && f1.played);
  await T.meosPseudoTimeUp(k18); await settle(); ok(!T.fuse.has(k18) && d18.L.includes(H1) && !d18.L.includes(H2), '時間切れの後は片付いている', d18.L);
  const d19 = doc([H1, R, '本文', '', R, H2, B, '<!-- Mew!UFC ⏰ 🔕/🔕 ↺↻(0y0d0h0m9s)×1 // ♥️Timer dd -->']); T.meosPuzzleFSet(d19, 7, Fn); T.meosArmClockFcFor(d19); await settle(); const k19 = d19.uri.toString() + ' ♥' + Fn; T.clear(k19); ok(!T.fuse.has(k19), '止めたら導火線も消える', T.fuse.has(k19)); await settle();
  const d20 = doc(['<!-- {* ▼mCN=a_2 // c *} -->', 'x', '<!-- {* ▲mCN=a_2 // c *} -->', '<!-- Mew!UFC ⏰ 🔕/🔕 ↺↻(0y0d0h0m9s)×1 // t -->']); T.meosArmClockFcFor(d20); await settle(); ok(![...T.fuse.keys()].some(k => k.indexOf(d20.uri.toString()) === 0), 'ふつうの膜には導火線なし', [...T.fuse.keys()]); T.clear(d20.uri.toString() + ' a_2');
  { const flagOpen = /menuOpenAt = Date\.now\(\); menuUp = true;/.test(hs), flagClose = /menuDidClose:'[^\n]*menuUp = false;/.test(hs), hide = /else if \(menuUp && menuShrink\(/.test(hs), hold = /else if \(menuUp\) \{ if \(lastHoldN/.test(hs), iHide = hs.indexOf('else if (menuUp && menuShrink('), iRe = hs.indexOf("[menu] 作り直す"); ok(flagOpen && flagClose && hide && hold && iHide > 0 && iHide < iRe, '開いているかは delegate で知り、作り替えより先に隠す口を見る(tracking は開いていても偽)', [flagOpen, flagClose, hide, hold]); }
  { const pm = eval(/const dockOutPressMine = (\(ever, gotAt, downT\) => [^;]*);/.exec(hs)[1]); ok(pm(false, 0, 1000) === true && pm(true, 1010, 1000) === true && pm(true, 950, 1000) === true && pm(true, 500, 1000) === false, 'mGATE= 届いた押しだけ受ける・一度も届いていない間は今まで通り', 0); }
  // 10. ふつうの膜の⏰は今まで通り
  const d12 = doc(['<!-- {* ▼mCN=a_1 *} -->', 'x', '<!-- {* ▲mCN=a_1 *} -->', far]); const s12 = T.meosClockFcScan(d12); ok(s12.length <= 1 && (!s12[0] || s12[0].key.charAt(0) !== '♥'), 'ふつうの膜の鍵は変わらない', s12);
  // 10b. v5.1.623 dd はふつうの⏰でも予定時刻(実物の書き方)
  { const dd = (ln) => { const d = doc(['<!-- {* ▼mCN=a_1 *} -->', 'x', '<!-- {* ▲mCN=a_1 *} -->', ln]); const c = T.meosClockFcScan(d)[0]; return c ? c.title : '(読めない)'; };
    ok(dd('<!-- Mew!UFC ⏰ 🔕/🔕 ↺↻(0y0d0h3m0s)×1 v2026-01-05 18:00.00 // Tea dd -->') === 'Tea 1/5(M)pm06:03', 'dd: 1回切り= 起点+長さ', dd('<!-- Mew!UFC ⏰ 🔕/🔕 ↺↻(0y0d0h3m0s)×1 v2026-01-05 18:00.00 // Tea dd -->'));
    ok(dd('<!-- Mew!UFC ⏰ 2027-01-05 08:30 // Meet dd -->') === 'Meet 1/5(T)am08:30', 'dd: 日時だけ= その日時', dd('<!-- Mew!UFC ⏰ 2027-01-05 08:30 // Meet dd -->'));
    ok(dd('<!-- Mew!UFC ⏰ 2027-01-05 08:00 ↺8h // dd -->') === '1/5(T)am08:00', 'dd: 回数なしの繰り返し= 次の鐘', dd('<!-- Mew!UFC ⏰ 2027-01-05 08:00 ↺8h // dd -->'));
    { const P = (x) => String(x).padStart(2, '0'), vs = (t) => { const d = new Date(t); return 'v' + d.getFullYear() + '-' + P(d.getMonth() + 1) + '-' + P(d.getDate()) + ' ' + P(d.getHours()) + ':' + P(d.getMinutes()) + '.' + P(d.getSeconds()); }, face = (t) => { const d = new Date(t), h = d.getHours(); return (d.getMonth() + 1) + '/' + d.getDate() + '(' + 'SMTWtFs'[d.getDay()] + ')' + (h >= 12 ? 'pm' : 'am') + P(h > 12 ? h - 12 : h) + ':' + P(d.getMinutes()); }, H = 3600000, base = Math.floor(Date.now() / 1000) * 1000, ln = (o) => '<!-- Mew!UFC ⏰ 🔕/🔕 ↺↻(0y0d1h0m0s)×2 ' + vs(o) + ' // Up dd -->';
      for (const [back, plus, name] of [[H / 6, H, 'dd: ×2の1回目= 1回目の鐘'], [H * 1.5, 2 * H, 'dd: ×2の2回目= 2回目の鐘'], [H * 5, 2 * H, 'dd: 鳴り終えた後= 最後の鐘']]) { const o = base - back, g = dd(ln(o)); ok(g === 'Up ' + face(o + plus), name, g); } }
    ok(dd('<!-- Mew!UFC ⏰ 2027-01-05 10:00 ↺↻(25m 5m)×4 // 🍅 dd -->') === '🍅 1/5(T)am10:00', 'dd: 起点が未来= 最初の鐘', dd('<!-- Mew!UFC ⏰ 2027-01-05 10:00 ↺↻(25m 5m)×4 // 🍅 dd -->'));
    ok(dd('<!-- Mew!UFC ⏰ 2027-01-07 10:00 ↺t1,3 ×2 // Meet dd -->') === 'Meet 1/7(t)am10:00', 'dd: 暦の規則= 次の当たり日', dd('<!-- Mew!UFC ⏰ 2027-01-07 10:00 ↺t1,3 ×2 // Meet dd -->'));
    ok(dd('<!-- Mew!UFC ⏰ ↺↻(3m)×1 // Tea dd -->') === 'Tea dd', 'dd: 起点がまだ無ければ dd のまま', dd('<!-- Mew!UFC ⏰ ↺↻(3m)×1 // Tea dd -->'));
    ok(dd('<!-- Mew!UFC ⏰ 2027-01-05 08:30 // add odd -->') === 'add odd', 'dd: 語の一部は変えない', dd('<!-- Mew!UFC ⏰ 2027-01-05 08:30 // add odd -->'));
    ok(dd('<!-- Mew!UFC ⏰ 2027-01-05 08:30 // WT dd -->') === 'am08:30 1/5(T)am08:30', 'dd: WT と併用', dd('<!-- Mew!UFC ⏰ 2027-01-05 08:30 // WT dd -->'));
    ok(T.meosClockWtOf({ title: undefined, when: '2027-01-05 08:30', cycle: [] }) === undefined, 'dd: 題なしで undefined の字を作らない');
    const dr = doc(['<!-- {* ▼mCN=a_1 *} -->', 'x', '<!-- {* ▲mCN=a_1 *} -->', '<!-- Mew!UFC ⏰ 2027-01-05 08:30 // Meet dd -->']), cr = T.meosClockFcScan(dr)[0]; ok(cr && cr.titleRaw === 'Meet dd', 'dd: 本文の字は titleRaw に残す(焼き付けない)', cr); }
  // 10c. v5.1.625 畳みの中の一時停止線には絵を掛けない
  { const sr = fs.readFileSync(SRC, 'utf8'); ok(/!meosShowsRawLineStable\(editor, i\) && !meosRuleHidden\(editor, i\)\) \{\n\s*badgeHide\.push/.test(sr), '畳みの中の線は描かない');
    ok(/title:'Time up at dd # 1\.'/.test(sr), '①の名前は長さを言わない'); }
  // 10d. v5.1.631 今日/明日の境(拡張とヘルパーで同じ答え)
  { const clockDayEnds = eval('(' + /const clockDayEnds = (\(now\) => \{[^\n]*?\});/.exec(hs)[1] + ')'), hz = eval('(' + /const clockZone = (\(t, now\) => \{[^\n]*?return t < y\.getTime\(\) \? 4 : 5; \});/.exec(hs)[1] + ')'), hf = eval('(' + /const clockFar = (\(t, now\) => [^;]*);/.exec(hs)[1] + ')'), at = (m, d, h, mi) => new Date(2026, m - 1, d, h, mi || 0).getTime(), H = 36e5, am = at(11, 9, 9), pm = at(11, 9, 21, 13);
    for (const [zn, now, t, want] of [['昼: 23h59は今日', am, am + 23.98 * H, 0], ['昼: ちょうど24hは今日', am, am + 24 * H, 0], ['昼: 24h1分は明日', am, am + 24.02 * H, 1], ['昼: 48h1分は1週間', am, am + 48.02 * H, 2], ['pm5:59はまだ24h', at(11, 9, 17, 59), at(11, 10, 18), 1], ['pm6から明日の24:00まで今日', at(11, 9, 18), at(11, 10, 23, 59), 0], ['夜: 明晩pm10:39は今日(夜を切らない)', pm, at(11, 10, 22, 39), 0], ['夜: 明後日0:01は明日', pm, at(11, 11, 0, 1), 1], ['夜: 明後日23:59は明日', pm, at(11, 11, 23, 59), 1], ['夜: 3日後0:01は1週間', pm, at(11, 12, 0, 1), 2], ['夜: 6d先は1週間', pm, at(11, 16, 16, 10), 2], ['am1は24h', at(11, 10, 1), at(11, 11, 1, 1), 1]]) ok(T.meosClockZone(t, now) === want && hz(t, now) === want, '帯: ' + zn, [T.meosClockZone(t, now), hz(t, now)]);
    for (const [zn, now, t, want] of [['昼: 47hは明日まで', am, am + 47 * H, false], ['昼: 48h1分は先', am, am + 48.02 * H, true], ['夜: 明後日23:59は明日まで', pm, at(11, 11, 23, 59), false], ['夜: 3日後0:01は先', pm, at(11, 12, 0, 1), true]]) ok(T.meosClockFar(t, now) === want && hf(t, now) === want, '先: ' + zn, [T.meosClockFar(t, now), hf(t, now)]); }
  // 11. 音
  const f = T.meosPshPath(), b = fs.readFileSync(f); ok(b.slice(0, 4).toString() === 'RIFF' && b.length === 44 + Math.floor(22050 * 0.75) * 2, 'プシューのWAV', b.length); try { fs.unlinkSync(f); } catch (_) { }
  console.log(ng ? 'NG ' + ng + '件' : 'PASS'); process.exit(ng ? 1 : 0);
})().catch(e => { console.log(' NG   例外 ' + (e && e.stack)); process.exit(1); });
