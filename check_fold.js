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
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { applyPrettyLabels, makeDecorations, collectPairs, isPairFolded, meosViewportFoldFactAt, meosMembraneNameEditFor, membraneNameRangeForRenameOnLine, meosCaretEscapeLineForFolds, meosPairBadgeAt, desiredMstatForFoldState, meosArrowHitAt, meosArrowPressBlocked, membraneArrowHoverMessage, meosMembraneGlyph, setRefNoRaw, meosStampSegments, meosApplyNameStampDecorations, meosVisStampSegments, meosRangesExcludingStamps, meosRawLineRoles, meosReadableInkFor, membraneCssColorForCode };\n', 'utf8');
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
        if (typeof b === 'string' && /[▼▲]/.test(b)) ed.__labels.push({ line: r.range.start.line, ch: r.range.start.character, text: b });
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
  // ★v4.1.1102(俊克「このときコメント内の ▼ を ▼▲ にして下さい」): 印は**印の在る所**に出す。
  ok(g === '▲', '\u2605\u2605\u2605生データのままで、コメントの中の ▼ の隣に ▲ を足す(= ▼▲ と読める)', g);
  ok(ed.__labels.filter(l => l.line === OPEN_LINE).every(l => l.ch === lines[OPEN_LINE].indexOf('▼') + 1), '\u2605\u2605行の頭でなく ▼ のすぐ隣に出す(同じ物を2つ立てない)', ed.__labels.filter(l => l.line === OPEN_LINE).map(l => l.ch));
  const a = afterAt(ed, OPEN_LINE);
  // v4.1.104: 写しは廃止= バッジ行は畳みの外なので、畳んでいても膜の直下に本物が見えている。
  ok(a === '(無し)', '★★★行末に写しを出さない(同じ物を2か所に描かない)', a);
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
console.log('⑨ 復元で畳む前に、カーソルを逃がす先(v4.0.353)');
{
  const outer = { start: 10, end: 100 };   // 外側の膜
  const inner = { start: 40, end: 60 };    // その中の膜
  const F = T.meosCaretEscapeLineForFolds;
  ok(F(50, [outer, inner]) === 10, '★入れ子の中に居たら**一番外側**の開始行へ逃がす(内側だと親を畳んだ時にまた隠れる)', F(50, [outer, inner]));
  ok(F(45, [inner, outer]) === 10, '渡す順番が違っても答えは同じ', F(45, [inner, outer]));
  ok(F(10, [outer]) === -1, '開始行に居るなら逃がさない(畳んでも見える行)', F(10, [outer]));
  ok(F(100, [outer]) === 10, '閉じ行に居たら逃がす(閉じ行は畳むと隠れる)', F(100, [outer]));
  ok(F(101, [outer]) === -1, '膜の外に居るなら逃がさない', F(101, [outer]));
  ok(F(5, [outer]) === -1, '膜より前に居るなら逃がさない', F(5, [outer]));
  ok(F(-1, [outer]) === -1, 'カーソルが無い時も落ちない', F(-1, [outer]));
  ok(F(50, []) === -1, '畳む膜が無ければ何もしない', F(50, []));
}
console.log('⑩ 再起動の朝= 記憶が空・画面も無い。⊖ と書いてあるなら畳んである(v4.0.354)');
{
  const FC = CLOSE_LINE + 1;
  const wasFc = lines[FC];
  lines[FC] = '<!-- Mew!FC mCN (📊⊖4+0D-2Y) -->';          // 俊克の実データ= 畳んである指定
  const ed = makeEditor([]);                                // 起動直後= 画面から何も分らない
  const pair = T.collectPairs(doc, { excludeIndex: false }).find(p => p.start === OPEN_LINE);
  ok(!!pair, '膜の対が見つかる', pair);
  ok(T.meosViewportFoldFactAt(ed, OPEN_LINE) === null, '画面からは分らない(だからバッジに訊く)', T.meosViewportFoldFactAt(ed, OPEN_LINE));
  ok(T.isPairFolded(ed, pair) === true, '★★⊖ を読んで「畳んである」と答える(開始行にバッジが無くても)', T.isPairFolded(ed, pair));
  ok(T.isPairFolded(ed, pair, { ignoreViewport: true }) === true, '★★バッジを書く道でも同じ答え = ⊖ を ⊕ に書き戻さない', T.isPairFolded(ed, pair, { ignoreViewport: true }));

  const at = T.meosPairBadgeAt(doc, pair);
  ok(!!at && at.fc === true && at.line === FC, 'バッジの居場所は ▲ の次の FC 行', at && at.line);
  const desired = T.desiredMstatForFoldState(at.text, T.isPairFolded(ed, pair, { ignoreViewport: true }));
  ok(desired === null, '★★書き換える必要なし = 再起動で ⊖ が ⊕ に化けない', desired && desired.formatted);

  lines[FC] = '<!-- Mew!FC mCN (📊⊕4+0D-2Y) -->';          // 開いている指定なら
  ok(T.isPairFolded(ed, pair) === false, '⊕ なら「開いている」と答える', T.isPairFolded(ed, pair));
  lines[FC] = wasFc;
}
console.log('⑪ ▼ を押したら畳める当たり判定(v4.0.359・俊克の実測クリックそのもの)');
{
  // 実測ログ: [arrow] line=105602 idStart=13 caretCh=9/11/12/15/16/20/43 hit=false
  // 生データ `<!-- {* ▼mCN=名前 // comment1 *} -->` = ▼は桁8・膜名は桁13から。
  const H = (ch) => !!T.meosArrowHitAt(doc, OPEN_LINE, ch);
  ok(H(8),  '★▼ の字そのもの(生データを見せている時の桁)', H(8));
  ok(H(9),  '★俊克が実際に押した桁 9 (▼のすぐ右)', H(9));
  ok(H(11), '★俊克が実際に押した桁 11', H(11));
  ok(H(12), '★俊克が実際に押した桁 12', H(12));
  ok(H(13), '★飾りの時の桁(装飾の▼はここに落ちる)', H(13));
  ok(!H(20), '膜名の中は当たりにしない(ジャンプの領域)', H(20));
  ok(!H(43), 'コメントの上も当たりにしない', H(43));
  const C = (ch) => !!T.meosArrowHitAt(doc, CLOSE_LINE, ch);
  ok(C(8) && C(13), '閉じ膜(▲)でも同じ当たり', [C(8), C(13)]);
  ok(!T.meosArrowHitAt(doc, OPEN_LINE + 1, 8), '膜でない行は当たらない', T.meosArrowHitAt(doc, OPEN_LINE + 1, 8));
}
console.log('⑫ tip は「どれを押すのか」を名指しする(v4.0.360)');
{
  const ed = makeEditor([R(0, 10)]);
  const P = (line, ch) => T.membraneArrowHoverMessage(ed, new stub.Position(line, ch));
  ok(P(OPEN_LINE, 13) === 'Toggle ▼-Button!', '★開始膜の印の上= ▼ボタンを名指しする(tip自身は押せない)', P(OPEN_LINE, 13));
  ok(P(CLOSE_LINE, 13) === 'Toggle ▲-Button!', '★閉じ膜では ▲ と言う(見ている印と言葉を合わせる)', P(CLOSE_LINE, 13));

  // v4.0.361(俊克「折り畳んだ膜は、`Toggle ▼▲-Button!`だよ」)
  const edF = makeEditor([R(0, OPEN_LINE), R(8, 10)]);   // 畳んである画面
  const PF = (line, ch) => T.membraneArrowHoverMessage(edF, new stub.Position(line, ch));
  ok(PF(OPEN_LINE, 13) === 'Toggle ▼▲-Button!', '★★畳んであれば ▼▲ と言う(印が変われば言葉も変わる)', PF(OPEN_LINE, 13));
  ok(T.meosMembraneGlyph('open', false, false) === '▼' && T.meosMembraneGlyph('open', true, false) === '▼▲'
     && T.meosMembraneGlyph('close', false, false) === '▲', '字を決める場所は1つ(描画もtipもここから引く)',
     [T.meosMembraneGlyph('open', false, false), T.meosMembraneGlyph('open', true, false), T.meosMembraneGlyph('close', false, false)]);
  ok(openGlyphAt(edF, OPEN_LINE) === T.meosMembraneGlyph('open', true, false), '★描画の印と tip の字が同じ物から出ている', openGlyphAt(edF, OPEN_LINE));
  ok(P(OPEN_LINE, 30) === null, '膜名の上では出さない(そこはジャンプの領域)', P(OPEN_LINE, 30));
  ok(P(OPEN_LINE + 1, 0) === null, '膜でない行では出さない', P(OPEN_LINE + 1, 0));
}
console.log('⑬ ▼ を押した後も、続けて押せる(v4.0.362)');
{
  // 押した結果が、次に押す物を消してはいけない= ▼ を押すとカーソルがその行に乗るが、
  // それは「編集しに来た」のでなく「ボタンを押した」だけなので、生データにしない。
  const ed = makeEditor([R(0, OPEN_LINE), R(8, 10)], OPEN_LINE);   // 畳んだ直後= カーソルは開始行
  T.setRefNoRaw(doc, OPEN_LINE);                                    // ▼クリックが張る抑止
  const g = openGlyphAt(ed, OPEN_LINE);
  ok(g === '▼▲', '★★印は出たまま(生データに化けない)= もう一度押せる', g);
  ok(afterAt(ed, OPEN_LINE) === '(無し)', 'FCの写しも出ない(飾りのままなので写しは要らない)', afterAt(ed, OPEN_LINE));

  // 抑止は「その行に居る間」だけ= 離れて戻れば、いつもどおり生データが出る
  T.setRefNoRaw(doc, OPEN_LINE);
  const edAway = makeEditor([R(0, OPEN_LINE), R(8, 10)], 9);        // 一度離れる
  openGlyphAt(edAway, OPEN_LINE);                                   // ここで抑止が解ける
  const edBack = makeEditor([R(0, OPEN_LINE), R(8, 10)], OPEN_LINE);// 戻ってくる
  const g2 = openGlyphAt(edBack, OPEN_LINE);
  ok(g2 === '▲' && afterAt(edBack, OPEN_LINE) === '(無し)', '\u2605離れて戻れば生データ+ ▼ の隣の ▲ だけ(写しは廃止)', [g2, afterAt(edBack, OPEN_LINE)]);
}
console.log('⑭ 膜名タイムスタンプのモザイク色分け(v4.0.363)');
{
  const S = T.meosStampSegments;
  const seg = S('テスト膜_20260822s174435JST');
  ok(!!seg && seg.length === 8, '★年/月/日/曜/時/分/秒/TZ の8区画に割れる', seg && seg.length);
  const name = 'テスト膜_20260822s174435JST';
  ok(seg && seg.map(([a,l]) => name.substr(a,l)).join('|') === '2026|08|22|s|17|44|35|JST',
     '★割れ目が意味の区切りと一致する', seg && seg.map(([a,l]) => name.substr(a,l)).join('|'));
  ok(seg && name[seg[0][0]-1] === '_', '先頭の `_` は塗らない(区切りとして素のまま)', seg && name[seg[0][0]-1]);

  const short = S('Kt_19580126S08JST');   // 可変精度= 時だけ・分秒なし(俊克の日記ファイル名と同じ形)
  ok(!!short && short.map(([a,l]) => 'Kt_19580126S08JST'.substr(a,l)).join('|') === '1958|01|26|S|08|JST',
     '★分秒が無くても割れる(可変精度)', short && short.map(([a,l]) => 'Kt_19580126S08JST'.substr(a,l)).join('|'));

  ok(S('table_143052') === null, '曜日字が無い物はTSと見なさない(1430年52月と読める誤爆よけ)', S('table_143052'));
  ok(S('name') === null && S('') === null, 'TSが無ければ何もしない', [S('name'), S('')]);

  // 3色を巡回= 隣り合う区画が必ず違う色に入る
  const groups = seg.map((_, i) => i % 3);
  ok(groups.every((g, i) => i === 0 || g !== groups[i-1]), '★隣り合う区画が必ず違う色(=モザイク)', groups.join(''));
}
console.log('⑮ 見出し/FCの可視TSもモザイク(v4.0.366)');
{
  const t = '<!-- Mew!FC H2_2026.08.22(s)pm07:07.59JST (白/green)//[]tip= -->';
  const all = T.meosVisStampSegments(t);
  ok(all.length === 1, '1行に1つ見つける', all.length);
  const parts = all[0].map(([a,l]) => t.substr(a,l));
  ok(parts.join('|') === '2026|08|22|s|pm|07|07|59|JST', '★区切り字は塗らず、読む単位だけ塗る', parts.join('|'));
  const g = all[0].map((_, i) => i % 3);
  ok(g.every((x, i) => i === 0 || x !== g[i-1]), '★隣り合う区画が必ず違う色', g.join(''));
  ok(T.meosVisStampSegments('ただの文 2026年8月22日').length === 0, '形が違う日付は塗らない', T.meosVisStampSegments('ただの文 2026年8月22日').length);
  ok(T.meosVisStampSegments('').length === 0, '空行で落ちない', 0);
}
console.log('⑯ 橙はTSを避けて塗る= 同じ字を2つで奪い合わない(v4.0.367)');
{
  const rs = T.meosRangesExcludingStamps(doc, OPEN_LINE);
  const t = lines[OPEN_LINE];
  const covered = new Set();
  for (const r of rs) for (let c = r.start.character; c < r.end.character; c++) covered.add(c);
  const seg = T.meosStampSegments(t.match(/mCN=([^ ]+)/)[1]);
  const info = { idStart: t.indexOf('テスト膜') };
  let stampChars = 0, overlap = 0;
  for (const [rel, len] of seg) for (let k = 0; k < len; k++) { stampChars++; if (covered.has(info.idStart + rel + k)) overlap++; }
  ok(stampChars > 0, 'TSの字が在る', stampChars);
  ok(overlap === 0, '★★橙の範囲にTSの字が1つも入らない(取り合いが起きない)', overlap);
  ok(covered.has(0) && covered.has(t.length - 1), '★TS以外はちゃんと橙に入る(行頭と行末)', [covered.has(0), covered.has(t.length-1)]);
  const plainLine = lines.findIndex(x => x === 'なかみ');
  const plain = T.meosRangesExcludingStamps(doc, plainLine);
  ok(plain.length === 1 && plain[0].start.character === 0 && plain[0].end.character === lines[plainLine].length,
     'TSが無い行は行まるごと1つの範囲', plain.length);
  ok(T.meosRangesExcludingStamps(doc, OPEN_LINE + 1).length === 0, '空行は塗る所が無い(長さ0の範囲を作らない)', T.meosRangesExcludingStamps(doc, OPEN_LINE + 1).length);
}
console.log('⑰ 1行を役割で割る= 触れる所と触るなの所(v4.0.368)');
{
  const t = lines[OPEN_LINE];
  const r = T.meosRawLineRoles(doc, OPEN_LINE);
  const pick = (segs) => segs.map(([a,b]) => t.slice(a,b)).join('|');
  ok(pick(r.name) === 'テスト膜', '★膜名(TSを除いた人が付けた所)= 変えてよい', pick(r.name));
  ok(pick(r.comment) === 'comment1', '★コメント本体= 変えてよい', pick(r.comment));
  ok(/^<!-- \{\* ▼mCN=$/.test(t.slice(r.shell[0][0], r.shell[0][1])), '★先頭の殻= 記法(触るな)', t.slice(r.shell[0][0], r.shell[0][1]));
  ok(r.shell.some(([a,b]) => t.slice(a,b).indexOf('*} -->') >= 0), '★末尾の殻も記法', r.shell.map(([a,b])=>t.slice(a,b)).join('/'));
  ok(r.shell.some(([a,b]) => t.slice(a,b).indexOf('//') >= 0), '`//` は記法だから殻の側', true);
  // 4つの役割は重ならない= 同じ字を2つが塗らない
  const seen = new Set(); let dup = 0;
  for (const k of ['stamps','name','comment','shell','badge']) for (const seg of r[k]) for (let c=seg[0];c<seg[1];c++){ if(seen.has(c))dup++; seen.add(c); }
  ok(dup === 0, '★★役割は重ならない(同じ字を2つが塗らない)', dup);
  ok(seen.size === t.length, '★★行の字を1つ残らず割り当てている', seen.size + '/' + t.length);
}
console.log('⑱ バッジの中身も「変えてよい」側(v4.0.370)');
{
  const FC = CLOSE_LINE + 1;
  const t = lines[FC];                                  // <!-- Mew!FC mCN (📊⊕1+0D-2Y) -->
  const r = T.meosRawLineRoles(doc, FC);
  const inside = r.badge.map(([a,b]) => t.slice(a,b)).join('|');
  ok(inside === '⊕1+0|D-2|Y', '★★中身は3つに割れる= 状態+回数 / 深度 / 色指定(v4.0.371)', inside);
  ok(r.badge.length === 3 && r.badge[2][2] === 'Y', '★色指定の区画は「どの色か」を持って出る(その色で描く)', r.badge.map(x=>x[2]).join(','));
  const shell = r.shell.map(([a,b]) => t.slice(a,b)).join('');
  ok(shell.indexOf('📊') >= 0 && shell.indexOf('(') >= 0 && shell.indexOf(')') >= 0, '★括弧と📊は記法だから殻の側', shell);
  ok(shell.indexOf('Mew!FC') >= 0, 'FCの名乗りも記法', true);
  let seen = new Set(), dup = 0;
  for (const k of ['stamps','name','comment','shell','badge']) for (const seg of r[k]) for (let c=seg[0];c<seg[1];c++){ if(seen.has(c))dup++; seen.add(c); }
  ok(dup === 0 && seen.size === t.length, '★★ここでも役割は重ならず、字を1つ残らず割り当てている', dup + '/' + seen.size + '/' + t.length);
}
console.log('⑲ 色指定は色チップ= どの色でも同じ強さで読める(v4.0.372)');
{
  const I = T.meosReadableInkFor;
  ok(I('rgba(180, 150, 0, 1)') === '#111', '★黄(明るい地)には黒い字', I('rgba(180, 150, 0, 1)'));
  ok(I('rgba(210, 40, 40, 1)') === '#fff', '★赤(暗い地)には白い字', I('rgba(210, 40, 40, 1)'));
  ok(I('rgba(0, 0, 128, 1)') === '#fff', '★紺にも白い字(沈まない)', I('rgba(0, 0, 128, 1)'));
  ok(I('rgba(245, 245, 245, 1)') === '#111', '★白い地には黒い字', I('rgba(245, 245, 245, 1)'));
  ok(I('') === '#000' && I(null) === '#000', '読めない指定でも落ちない', [I(''), I(null)]);
  const y = T.membraneCssColorForCode('Y'), r = T.membraneCssColorForCode('R');
  ok(!!y && !!r && y !== r, '色コードは既存の色マップから引く(値は1つ)', [y, r]);
}
console.log('⑳ FCの色指定も、その色で見せる(v4.0.375)');
{
  const FC2 = lines.length;
  lines.push('<!-- Mew!FC **not （白/黄） -->');           // 俊克の実データ(全角括弧)
  doc.lineCount = lines.length;
  const t = lines[FC2];
  const r = T.meosRawLineRoles(doc, FC2);
  ok(r.colorFg.length === 1 && t.slice(r.colorFg[0][0], r.colorFg[0][1]) === '白', '★文字色の指定を拾う', r.colorFg.map(x=>t.slice(x[0],x[1])).join(','));
  ok(r.colorBg.length === 1 && t.slice(r.colorBg[0][0], r.colorBg[0][1]) === '黄', '★背景色の指定を拾う', r.colorBg.map(x=>t.slice(x[0],x[1])).join(','));
  ok(!!r.colorFg[0][2] && !!r.colorBg[0][2] && r.colorFg[0][2] !== r.colorBg[0][2], '★それぞれの色を持って出る(字はその色/地はその色)', [r.colorFg[0][2], r.colorBg[0][2]]);

  lines[FC2] = '<!-- Mew!FC **not (白/黄) -->';            // 半角括弧でも同じ
  ok(T.meosRawLineRoles(doc, FC2).colorFg.length === 1, '半角の括弧でも拾う', T.meosRawLineRoles(doc, FC2).colorFg.length);

  lines[FC2] = 'ただの文 (これ/あれ) です';                  // FCの名乗りが無い行は見ない
  ok(T.meosRawLineRoles(doc, FC2).colorFg.length === 0, '★FCの名乗りが無い行の括弧は色と読まない', T.meosRawLineRoles(doc, FC2).colorFg.length);

  lines[FC2] = '<!-- Mew!FC **not (ほげ/ふが) -->';         // 色名でない物は塗らない(黄に丸めない)
  ok(T.meosRawLineRoles(doc, FC2).colorFg.length === 0, '★色名でない語を黄に丸めない', T.meosRawLineRoles(doc, FC2).colorFg.length);

  lines.pop(); doc.lineCount = lines.length;
}
// ★★★v4.1.109(俊克 9/4 am10:27 質問1「コメントの中に、起動できるボタンというのは、
//   普通はないよね…コメントは、編集する対象であって、起動ボタンではない」):
//   飾りの時＝印(押す) / 生データの時＝字(直す)。同じ場所に2つの意味を重ねない。
console.log('\u246f コメント化した膜の ▼ はボタンではない');
{
  const away = makeEditor([R(0, 10)], 9);          // カーソルは膜の外 = 飾り
  const on   = makeEditor([R(0, 10)], OPEN_LINE);  // カーソルがその行 = 生データ
  const idStart = lines[OPEN_LINE].indexOf('テスト膜');
  const glyph = lines[OPEN_LINE].indexOf('▼');
  // \u2605v4.1.110: クリックそのものがその行を生にするので、訊くのは**押す直前に生だったか**。
  //   prevLine = そのクリックの前にカーソルが居た行。
  ok(!!T.meosArrowHitAt(doc, OPEN_LINE, idStart), '\u2605桁の当たりは ▼ 〜膜名の直前(v4.0.359の広い当たり)', !!T.meosArrowHitAt(doc, OPEN_LINE, idStart));
  ok(!!T.meosArrowHitAt(doc, OPEN_LINE, glyph), '\u2605 ▼ の字の上も当たり', !!T.meosArrowHitAt(doc, OPEN_LINE, glyph));
  ok(T.meosArrowPressBlocked(on, OPEN_LINE, 9) === false, '\u2605\u2605\u2605外からの1回目のクリックは押せる(飾りの上に落ちた)', T.meosArrowPressBlocked(on, OPEN_LINE, 9));
  ok(T.meosArrowPressBlocked(on, OPEN_LINE, OPEN_LINE) === true, '\u2605\u2605\u2605既にその行に居た2回目は押せない(字を直しに来た)', T.meosArrowPressBlocked(on, OPEN_LINE, OPEN_LINE));
  ok(T.membraneArrowHoverMessage(on, new stub.Position(OPEN_LINE, glyph)) === null, '\u2605\u2605生データの行に tip を出さない(押せない物に「押せ」と言わない)', T.membraneArrowHoverMessage(on, new stub.Position(OPEN_LINE, glyph)));
  ok(!!T.membraneArrowHoverMessage(away, new stub.Position(OPEN_LINE, idStart)), '\u2605飾りの行には tip を出す', !!T.membraneArrowHoverMessage(away, new stub.Position(OPEN_LINE, idStart)));
  // \u2605\u2605\u2605v4.1.1101: 生を見せる行はカーソル行だけではない― ▼・▲・バッジは3つで1つ(v4.0.332)。
  //   ▲やバッジに居る間も ▼ の行は生を見せているので、そこへのクリックはボタンではない。
  ok(T.meosArrowPressBlocked(makeEditor([R(0,10)], CLOSE_LINE), OPEN_LINE, CLOSE_LINE) === true, '\u2605\u2605\u2605▲に居たまま ▼ を押してもボタンにならない(3つで1つ)', T.meosArrowPressBlocked(makeEditor([R(0,10)], CLOSE_LINE), OPEN_LINE, CLOSE_LINE));
  ok(T.meosArrowPressBlocked(makeEditor([R(0,10)], 7), OPEN_LINE, 7) === true, '\u2605\u2605バッジ行に居たままでも同じ', T.meosArrowPressBlocked(makeEditor([R(0,10)], 7), OPEN_LINE, 7));
  T.setRefNoRaw(doc, OPEN_LINE);                   // \u25bc を押した直後の拑止(v4.0.362)
  ok(T.meosArrowPressBlocked(on, OPEN_LINE, OPEN_LINE) === false, '\u2605\u2605押した直後は飾りのまま＝ 連続で押せる道は塞がらない', T.meosArrowPressBlocked(on, OPEN_LINE, OPEN_LINE));
}


console.log(ng ? ('NG ' + ng + ' 件') : '全部 ok');
process.exit(ng ? 1 : 0);
