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
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meosFofPair, meosFofRange, meosFofReconcile, meosFofWrap, meosPuzzleTagsOf, meosPuzzleFSet, meosPuzzleFGet, meosPuzzleSweep, meosPuzzleTag, meosClockFcScan, meosFofClockWrite, meosFofClockExpire, meosArmClockFcFor, meosPshPath, meosScopeRangeNow, setCtx: (c) => { extensionContext = c; } };\n', 'utf8');
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
const R = '<!-- Mew!UFC --- -->', isClock = (t) => /^<!-- Mew!UFC ⏰ 🔕\/🔕 ↺ ?2\d{3}/.test(t), clocks = (d) => d.L.filter(t => t.indexOf('⏰') >= 0);
const past = '<!-- Mew!UFC ⏰ 🔕/🔕 ↺ 2026-01-01 09:00 -->', far = '<!-- Mew!UFC ⏰ 🔕/🔕 ↺ 2099-01-01 09:00 -->', paused = '<!-- Mew!UFC ⏰⏸ 🔕/🔕 ↺ 2026-01-01 09:00 -->';
const H1 = '<!-- {* ♥️▼▶◀mP7=f_20261108S005813JST //  *} -->', H2 = '<!-- {* ♥️▲▶◀mP7=f_20261108S005814JST //  *} -->', Hm = '<!-- {* ♥️▶◀mP7=f_20261108S005900JST //  *} -->', Fn = 'f_20261108S005813JST';
(async () => {
  // 1. 選択を包む(本物の meosFofWrap の出力)
  const d1 = doc(['x', '本文1', '本文2', 'y']); const e1 = mkEd(d1, sel(1, 2)); await T.meosFofWrap(e1, 'f', 7);
  const r1 = T.meosFofRange(d1, 7); ok(r1 && isClock(d1.L[r1.end + 1]), '包むと閉じ♥の直下に一度きりの⏰', d1.L);
  const s1 = T.meosClockFcScan(d1); ok(s1.length === 1 && s1[0].key === r1.key && s1[0].line === r1.end + 1 && s1[0].ufc && !(s1[0].cycle || []).length && s1[0].bellMainOn === false, '⏰を♥膜の時計として読む(UFC・周期なし・先鐘🔕)', s1);
  ok(s1[0] && s1[0].name === '♥️', '一覧の名前は♥️', s1[0] && s1[0].name);
  const whn = s1[0] && Date.parse(String(s1[0].when).replace(/\//g, '-').replace(' ', 'T').replace(/\.(\d\d)$/, ':$1')); ok(Math.abs(whn - Date.now() - 24 * 3600e3) < 120e3, '時刻はちょうど1日後', s1[0] && s1[0].when);
  const rg = T.meosScopeRangeNow(d1, r1.key); ok(rg && rg.from === r1.start && rg.to === r1.end, '一覧からのワープ先の範囲', rg);
  ok(d1.L.includes('本文1') && d1.L.includes('本文2'), '本文はそのまま', d1.L);
  // 2. 最初の3行
  const d2 = doc(['a', '']); const e2 = mkEd(d2, { start: { line: 1, character: 0 }, end: { line: 1, character: 0 }, active: { line: 1, character: 0 }, isEmpty: true }); stub.window.activeTextEditor = e2; await T.meosPuzzleTag('f', {});
  ok(clocks(d2).length === 1 && T.meosClockFcScan(d2).length === 1, '最初の3行にも⏰が1本', d2.L);
  // 3. コピペで組ができる(今ある1点の♥×2)→ 1本だけ。もう一度読んでも増えない
  const d3 = doc(['a', '<!-- {* ♥️▶◀mP7=f_1 //  *} -->', 'b', '<!-- {* ♥️▶◀mP7=f_2 //  *} -->', 'c']); T.meosPuzzleFSet(d3, 7, 'f_1'); const e3 = mkEd(d3); await T.meosFofReconcile(e3, 7);
  ok(clocks(d3).length === 1, '組が今できた= ⏰が1本', d3.L); await T.meosFofReconcile(e3, 7); await T.meosFofClockWrite(d3); ok(clocks(d3).length === 1, '読み直しても増えない', d3.L);
  // 4. 俊克が⏰を消す→ 戻らない
  d3.L = d3.L.filter(t => t.indexOf('⏰') < 0); d3.version++; await T.meosFofReconcile(e3, 7); ok(clocks(d3).length === 0, '消した⏰は復活しない', d3.L);
  // 5. もう一度包む= 前の閉じ♥は中継点・前の⏰は消える
  const y = d1.L.indexOf('y'); await T.meosFofWrap(mkEd(d1, sel(y, y)), 'f', 7); ok(clocks(d1).length === 1 && T.meosClockFcScan(d1).length === 1, '包み直すと⏰は新しい組の1本だけ', d1.L);
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
  // 10. ふつうの膜の⏰は今まで通り
  const d12 = doc(['<!-- {* ▼mCN=a_1 *} -->', 'x', '<!-- {* ▲mCN=a_1 *} -->', far]); const s12 = T.meosClockFcScan(d12); ok(s12.length <= 1 && (!s12[0] || s12[0].key.charAt(0) !== '♥'), 'ふつうの膜の鍵は変わらない', s12);
  // 11. 音
  const f = T.meosPshPath(), b = fs.readFileSync(f); ok(b.slice(0, 4).toString() === 'RIFF' && b.length === 44 + Math.floor(22050 * 0.75) * 2, 'プシューのWAV', b.length); try { fs.unlinkSync(f); } catch (_) { }
  console.log(ng ? 'NG ' + ng + '件' : 'PASS'); process.exit(ng ? 1 : 0);
})().catch(e => { console.log(' NG   例外 ' + (e && e.stack)); process.exit(1); });
