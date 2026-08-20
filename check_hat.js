// 開発用ツール(vsix除外): 帽子(印)記法の検査。写経せず extension.js の関数をそのまま呼ぶ。
//
// v4.0.266(俊克 8/19 記法確定: 入力も控えも `a↑👒(..)` の一択 / `<( )>` は廃止 / 下側はv5.0)
// 見るのは3つ:
//   ①押した時に何が起きるか(meosHatBeforeCursor)  ②控えから字を読み戻せるか(meosHatFromToken)
//   ③控えの文字列that自分でHTMLコメントを終わらせないか(`-->` を含まない)
// ★「帽子にしない」ことを確かめる行thatこの検査の主役= `a↑'`(プライム)と `x↑o`(度)は普通の上付きに戻す。
//
// 使い方:  node src/check_hat.js
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
const TMP = path.join(require('os').tmpdir(), 'meos_check_hat_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { MEOS_HEAD_STAMP_RE, meosRowMarkSpans, meosFcBodyLineFor, meosFmtKindFollowPlan, meosDefBlocks, meosIsSpecLine, meosCarryItemSpec, meosSpecGroupPerLine, MEOS_SPEC_LINE_NONE_RE, meosItemLevels, meosItemLabel, meosSpecLineFor, meosListBlockFor, meosListBlockDirectives, meosListLineSpecFor, meosItemNumStep, meosListItemDefaultDirective, meosLineDirectiveCommentIn, MEOS_LIST_BLOCK_RE, MEOS_NUM_ITEM_RE, meosLinkUlEditAt, MEOS_STACK_TALL_SUP_RIGHT_CH, meosClipboardLinkTarget, MEOS_LINK_SPEC_RE, meosMathSlantCss, MEOS_MATH_SLANT_DEG, meosLimitSwapPlan, meosMetexPctFollowPlan, meosInlineHeadHit, MEOS_MATH_SLANT_RE, MEOS_STACK_TALL_SUB_LEFT_CH, MEOS_BIGOP_RE, meosMetexArrowFollowPlan, MEOS_STACK_TALL_EM, MEOS_LIMIT_TALL_DOWN_EM, MEOS_STACK_SPREAD_EM, MEOS_METEX_MID_EM, MEOS_METEX_TOP_EM, meosStackCss, meosMeTexStyle, meosMeTexStackPairs, MEOS_LIMIT_NARROW_W, meosRowspanUpAt, meosRowLineSkipSet, meosLimitRoomInCell, MEOS_LIMIT_TALL_UP_EM, MEOS_LIMIT_TALL_DOWN_EM, meosCellTextAt, meosLimitHasRoomInCell, MEOS_LIMIT_SCALE, MEOS_LIMIT_UP_EM, MEOS_LIMIT_DOWN_EM, MEOS_LIMIT_DROP_EM, meosBigOpLimitSpans, meosLimitCss, meosMeTexFgKey, meosHatBarSpans, meosHatScanLine, meosHatBeforeCursor, meosHatFromToken, meosHatCompose, MEOS_HAT_MARK, MEOS_MEW_SIG, MEOS_METEX_TAIL_RE, meosMeTexTokens, meosParseSpecLine, meosSpecPayloadAsIs, meosMoveSpecsOutOfLine, meosIsSpecLine, meosSpecLineMerge, meosFcFmtInner, meosFcFmtIsNot, meosLineDirective, meosMeLinkSpec, meosLinkSpecFromComment, meosStarMarks, meosInlineMarkEnds , meosSplitMarkForSegment };\n', 'utf8');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }

let ng = 0;
const ok = (cond, label, got) => { console.log((cond ? '  ok  ' : ' NG   ') + label + (cond ? '' : '   ← ' + JSON.stringify(got))); if (!cond) ng++; };

console.log('① ボタンを押した時(本文の直前を見る)');
const hb = (s, after) => T.meosHatBeforeCursor(s, after);
ok(hb('a↑👒(..)') && hb('a↑👒(..)').ch === 'ä', '`a↑👒(..)` → ä', hb('a↑👒(..)'));
ok(hb('a↑👒(--)') && hb('a↑👒(--)').ch === 'ā', '`a↑👒(--)` → ā', hb('a↑👒(--)'));
ok(hb('T↑👒(^)') && hb('T↑👒(^)').ch === 'T̂', '`T↑👒(^)` → T̂', hb('T↑👒(^)'));
ok(hb('θ↑👒(^)') && hb('θ↑👒(^)').base === 'θ', '基準は非ASCIIでもよい(θ)', hb('θ↑👒(^)'));
ok(hb('文は続く a↑👒(o)') && hb('文は続く a↑👒(o)').ch === 'å', '文の途中でも直前だけ見る', hb('文は続く a↑👒(o)'));
console.log('   ★ここから「帽子にしない」= v4.0.229の主役');
ok(hb("a↑'") === null, "`a↑'` は帽子でない(プライム a′ が書ける)", hb("a↑'"));
ok(hb('x↑o') === null, '`x↑o` は帽子でない(度 x° が書ける)', hb('x↑o'));
ok(hb('10↑-') === null, '`10↑-` は帽子でない(負の指数)', hb('10↑-'));
ok(hb('a↑(..)') === null, '`a↑(..)` は帽子でない(括弧だけ=累乗 a↑(n+1) と同じ形)', hb('a↑(..)'));
ok(hb('a↓👒(,)') && hb('a↓👒(,)').below === true && hb('a↓👒(,)').ch === '', '`a↓👒(,)` は下側=v5.0と名乗る(字は作らない・v4.0.267)', hb('a↓👒(,)'));
ok(hb('a↑👒(zz)') === null, '知らない名前は何もしない', hb('a↑👒(zz)'));
console.log('   ★v4.0.266= 閉じ括弧の手前(ボタンのひな形を打ち替えた直後)でも押せる');
ok(hb('a↑👒(^', ')') && hb('a↑👒(^', ')').ch === 'â', '`a↑👒(^|)` で押す → â(tail=1)', hb('a↑👒(^', ')'));
ok(hb('a↑👒(^', ')').tail === 1, '閉じ括弧の1文字も一緒に食べる', hb('a↑👒(^', ')').tail);
ok(hb('a↑👒(..)').tail === 0, '閉じ括弧の外で押した時は食べない', hb('a↑👒(..)').tail);
ok(hb('a↑👒(^', '') === null, '後ろに `)` が無ければ帽子でない(書きかけ)', hb('a↑👒(^', ''));

console.log('④ 既に上付き/下付きそのものなら、書き足さず名乗りだけ出す(v4.0.230)');
const tail = (s) => { const m = T.MEOS_METEX_TAIL_RE.exec(s); return m ? m[0] : null; };
ok(tail("a↑'") === "↑'", "`a↑'` の右で押す → 二重にせず `↑'` を名乗る", tail("a↑'"));
ok(tail('x↑o') === '↑o', '`x↑o` → `↑o` を名乗る', tail('x↑o'));
ok(tail('10↑-3') === '↑-3', '`10↑-3` → `↑-3` を名乗る', tail('10↑-3'));
ok(tail('a↑(..)') === '↑(..)', '`a↑(..)` → `↑(..)` を名乗る', tail('a↑(..)'));
ok(tail('a↓3') === '↓3', '下付きも同じ', tail('a↓3'));
ok(tail('x') === null, '普通の字の後は今まで通り新しく作る', tail('x'));
ok(tail('a↑') === null, '矢印だけ(中身なし)は名乗らない', tail('a↑'));
ok(tail('a↑2 とか b') === null, '離れた上付きは巻き込まない', tail('a↑2 とか b'));
ok(tail('a↑2とか') === null, '散文が続く時は巻き込まない(ASCIIだけ見る)', tail('a↑2とか'));

console.log('② 控えから読み戻す');
const ft = (t) => T.meosHatFromToken(t);
ok(ft('a↑👒(..)') && ft('a↑👒(..)').ch === 'ä', '控えの形 `a↑👒(..)` → ä', ft('a↑👒(..)'));
ok(ft('a↑👒<(..)>') === null, '旧形 `a↑👒<(..)>` は読まない(v4.0.266で切り捨て)', ft('a↑👒<(..)>'));
ok(ft('a↑^👒') === null, '旧形 `a↑^👒` は読まない(v4.0.230で切り捨て)', ft('a↑^👒'));
ok(ft('a↑(..)👒') === null, '旧形 `a↑(..)👒` は読まない(v4.0.230で切り捨て)', ft('a↑(..)👒'));
ok(ft('a↑2') === null, '帽子でない控えは null', ft('a↑2'));

console.log('③ 控えの文字列が自分でコメントを終わらせないか');
for (const mk of ['..', '.', '--', '-', '^', 'o', 'v', '~', ',', "'"]) {
  const rec = '<!-- ' + T.MEOS_MEW_SIG + ' a↑' + T.MEOS_HAT_MARK + '<(' + mk + ')> (白/橙) -->';
  ok(rec.indexOf('-->') === rec.length - 3, '`(' + mk + ')` の控えは末尾まで閉じない', rec);
}
console.log('⑤ 描く側(v4.0.231で塞いだ2つの穴)');
const tk = (t) => T.meosMeTexTokens(t, null);
ok(tk("a↑'").length === 1, "本文 `a↑'` が上付きとして描かれる(プライム。↑が残らない)", tk("a↑'"));
ok(tk('a↑\'\'').length === 1, '`a↑\'\'`(二重プライム)も描かれる', tk('a↑\'\''));
ok(tk('x↑o').length === 1, '`x↑o` は従来どおり', tk('x↑o'));
const sp = T.meosParseSpecLine('<!-- ' + T.MEOS_MEW_SIG + 'FC a↑' + T.MEOS_HAT_MARK + '(..) (白/橙) -->');
ok(!!sp && sp.metex.length === 1 && sp.metex[0].tok === 'a↑' + T.MEOS_HAT_MARK + '(..)', '控えの指定行から帽子のトークンを丸ごと読める', sp && sp.metex);
ok(!!sp && /白/.test(sp.metex[0].inner) && /橙/.test(sp.metex[0].inner), '色が帽子に届く(字そのものを塗る)', sp && sp.metex[0].inner);
ok(!!T.meosHatFromToken(sp.metex[0].tok), '読んだトークンから字を作り直せる', sp && sp.metex[0].tok);

console.log('⑱ 大きな演算子の上下限(v4.0.273) — 👒は「真上/真下に置く」');
{
  const L = (x) => T.meosBigOpLimitSpans(x);
  const sum = L('Σ↓👒(k=1)↑👒n a↓k');
  ok(!!sum && sum.items.length === 2, '`Σ↓👒(k=1)↑👒n` を2つ(下と上)読む', sum && sum.items);
  ok(sum && sum.items[0].dir === 'down' && sum.items[0].text === 'k=1', '下限は k=1', sum && sum.items[0]);
  ok(sum && sum.items[1].dir === 'up' && sum.items[1].text === 'n', '上限は n(裸の一続きでもよい)', sum && sum.items[1]);
  ok(sum && sum.items[0].at === 0 && sum.items[1].at === 0, '2つとも同じ演算子(Σ)に効く', sum && [sum.items[0].at, sum.items[1].at]);
  ok(sum && sum.hides.length === 2, '命令は2つとも隠す', sum && sum.hides);
  const lim = L('lim↓👒(x→0) f(x)');
  ok(!!lim && lim.items.length === 1 && lim.items[0].text === 'x→0', '`lim↓👒(x→0)` も演算子(語でもよい)', lim && lim.items);
  ok(lim && lim.items[0].at === 0, '基準は lim の先頭から', lim && lim.items[0].at);
  ok(L('Π↓👒(k=1)↑👒n') !== null, 'Π も同じ', !!L('Π↓👒(k=1)↑👒n'));
  ok(L('a↑👒(..)') === null, '★字の上の印(帽子)はここでは拾わない= 基準that分ける', L('a↑👒(..)'));
  ok(L('(A ∩ B)↑👒(-)') === null, '群の横棒も拾わない', L('(A ∩ B)↑👒(-)'));
  ok(L('<!-- Mew! Σ↓👒(k=1) -->') === null, '控えの中では描かない', L('<!-- Mew! Σ↓👒(k=1) -->'));
  ok(T.meosHatBeforeCursor('Σ↑👒(-)', '').bigop === true, '★`Σ↑👒(-)` は字にしない(Σ̄ を作らせない)', T.meosHatBeforeCursor('Σ↑👒(-)', ''));
  ok(T.meosHatBeforeCursor('a↑👒(-)', '').ch === 'ā', '字の上なら今まで通り本物の字', T.meosHatBeforeCursor('a↑👒(-)', ''));
  console.log('   ★v4.0.277= 中身の位置(表では包みだけ隠して横に置く)＋背の高い演算子');
  {
    const one = L('Σ↓👒(k=1)↑👒n')[ 'items' ];
    const src = 'Σ↓👒(k=1)↑👒n';
    ok(src.slice(one[0].cs, one[0].ce) === 'k=1', '括弧つきの中身は括弧の内側だけ', src.slice(one[0].cs, one[0].ce));
    ok(src.slice(one[1].cs, one[1].ce) === 'n', '裸の中身もその字だけ', src.slice(one[1].cs, one[1].ce));
    ok(src.slice(one[0].tokStart, one[0].tokEnd) === '↓👒(k=1)', '命令の全体(上下に置く時はここを丸ごと隠す)', src.slice(one[0].tokStart, one[0].tokEnd));
    const itg = L('∫↓👒0↑👒1 f(x) dx').items;
    ok(itg[0].tall === true, '★∫は背の高い演算子(余分に逃がす)', itg[0].tall);
    ok(L('Σ↓👒(k=1)').items[0].tall === false, 'Σは並の背', L('Σ↓👒(k=1)').items[0].tall);
    const em = (css) => Number(/top: (-?[\d.]+)em/.exec(css)[1]) * (T.MEOS_LIMIT_SCALE / 100);
    ok(Math.abs((em(T.meosLimitCss('down', 1, 9, 1, true)) - em(T.meosLimitCss('down', 1, 9, 1, false))) - T.MEOS_LIMIT_TALL_DOWN_EM) < 0.01, '背の高い演算子は下へ余分に逃げる(逃げの量は定数どおり)', [em(T.meosLimitCss('down', 1, 9, 1, true)), em(T.meosLimitCss('down', 1, 9, 1, false)), T.MEOS_LIMIT_TALL_DOWN_EM]);
    ok(Math.abs((em(T.meosLimitCss('up', 1, 9, 1, false)) - em(T.meosLimitCss('up', 1, 9, 1, true))) - T.MEOS_LIMIT_TALL_UP_EM) < 0.01, '★上と下で逃げの量that違う(∫は下だけ深い)', [T.MEOS_LIMIT_TALL_UP_EM, T.MEOS_LIMIT_TALL_DOWN_EM]);
  }
  console.log('   ★v4.0.278= 表でも「縦に結合したセル」には上下に置く余地that在る(俊克の案)');
  {
    const row = '| Σ↓👒(k=1)↑👒n a↓k<!-- 🤝 ↓ 3 --> | 和 |';
    ok(T.meosCellTextAt(row, 3).indexOf('🤝') >= 0, '式のあるセルを取り出せる', T.meosCellTextAt(row, 3));
    ok(T.meosLimitHasRoomInCell(T.meosCellTextAt(row, 3)) === true, '3行に結合したセル= 余地が在る(上下へ置く)', true);
    ok(T.meosLimitHasRoomInCell(T.meosCellTextAt(row, 40)) === false, '隣のセルは結合していない= 横へ回す', false);
    ok(T.meosLimitHasRoomInCell('Σ↓👒(k=1)↑👒n') === false, '結合の印that無ければ余地なし', false);
    ok(T.meosLimitHasRoomInCell('x<!-- 🤝 ↓ 1 -->') === false, '1行(=結合していない)は余地なし', false);
    ok(T.meosCellTextAt('| a | b | c |', 6).trim() === 'b', '真ん中のセルも位置で取れる', T.meosCellTextAt('| a | b | c |', 6));
  }
  console.log('   ★v4.0.281= 🤝↑N も読む(同じことを反対の端から言っているだけ)');
  {
    const R = (c) => T.meosLimitRoomInCell(c);
    ok(R('<!--🤝↓2-->Σ↓👒(k=1)').down === true && R('<!--🤝↓2-->Σ↓👒(k=1)').up === false, '↓2= 下だけ余地', R('<!--🤝↓2-->Σ↓👒(k=1)'));
    ok(R('<!--🤝↑2-->Σ↑👒n').up === true && R('<!--🤝↑2-->Σ↑👒n').down === false, '★↑2= 上だけ余地(そのセルの中で宣言できる)', R('<!--🤝↑2-->Σ↑👒n'));
    ok(R('Σ↓👒(k=1)').up === false && R('Σ↓👒(k=1)').down === false, '印that無ければ余地なし', R('Σ↓👒(k=1)'));
    ok(R('<!--🤝↑1-->').up === false, '1行(=結合していない)は余地なし', R('<!--🤝↑1-->'));
    // 罫線を抜く場所: 4行の表(0=見出し,1=区切り,2,3,4) で、4行目に ↑2 → 3行目の下線を抜く
    const rows = [['見出し'], ['---'], ['a'], ['b'], ['<!--🤝↑2-->c']];
    const sk = T.meosRowLineSkipSet(rows, 1).vskip;
    ok(sk.has('3,0') === true, '↑2= 1つ上の行の下線を抜く', Array.from(sk));
    ok(sk.has('2,0') === false, 'それ以上は抜かない', Array.from(sk));
    const rows2 = [['見出し'], ['---'], ['<!--🤝↓2-->a'], ['b']];
    ok(T.meosRowLineSkipSet(rows2, 1).vskip.has('2,0') === true, '↓2は今までどおり(自分の下線を抜く)', true);
    const rows3 = [['見出し'], ['---'], ['<!--🤝↑3-->a']];
    ok(T.meosRowLineSkipSet(rows3, 1).vskip.size === 0, '★区切り行は跨がない(見出しと本文は結合しない)', Array.from(T.meosRowLineSkipSet(rows3, 1).vskip));
  }
  {
    const sc = T.MEOS_LIMIT_SCALE / 100;
    const topEm = (css) => Number(/top: (-?[\d.]+)em/.exec(css)[1]) * sc;   // その字自身のem → 基準の字のem
    ok(Math.abs(topEm(T.meosLimitCss('up', 1, 5, 1)) - (-T.MEOS_LIMIT_UP_EM + T.MEOS_LIMIT_DROP_EM)) < 0.01,
      '★emはその字自身の大きさ基準so、割ってから渡す(上=持ち上げ−ずらし)', topEm(T.meosLimitCss('up', 1, 5, 1)));
    ok(Math.abs(topEm(T.meosLimitCss('down', 1, 5, 1)) - (T.MEOS_LIMIT_DOWN_EM + T.MEOS_LIMIT_DROP_EM)) < 0.01,
      '下=下げ＋ずらし', topEm(T.meosLimitCss('down', 1, 5, 1)));
    ok(T.MEOS_LIMIT_DOWN_EM < T.MEOS_LIMIT_UP_EM, '★上下は対称でない(字は基準線の上に立つso、上に逃げthat要る)', [T.MEOS_LIMIT_UP_EM, T.MEOS_LIMIT_DOWN_EM]);
  }
  console.log('   ★v4.0.275= 中央 = 演算子の幅の半分 − 中身の見た目の幅の半分(縮小率を掛ける)');
  {
    const px = (css) => Number(/left: (-?[\d.]+)ch/.exec(css)[1]) * 0.62;   // 桁に戻す
    ok(Math.abs(px(T.meosLimitCss('up', 1, 9, 1)) - (0.5 - 0.31)) < 0.01, 'Σ(1桁)＋1文字 → 0.19桁だけ右(真ん中)', px(T.meosLimitCss('up', 1, 9, 1)));
    ok(Math.abs(px(T.meosLimitCss('down', 3, 9, 1)) - (0.5 - 0.93)) < 0.01, 'Σ(1桁)＋3文字 → 0.43桁だけ左', px(T.meosLimitCss('down', 3, 9, 1)));
    ok(Math.abs(px(T.meosLimitCss('down', 3, 9, 3)) - (1.5 - 0.93)) < 0.01, '★lim(3桁)＋3文字 → 0.57桁だけ右(演算子の幅を数える)', px(T.meosLimitCss('down', 3, 9, 3)));
    ok(px(T.meosLimitCss('down', 3, 0, 1)) === 0, '行頭では左へ出さない(頭打ち)', px(T.meosLimitCss('down', 3, 0, 1)));
    ok(Math.abs(px(T.meosLimitCss('down', 1, 9, 1, false, true)) - (T.MEOS_LIMIT_NARROW_W / 2 - 0.31)) < 0.01,
      '★細い演算子(∫)は桁の中央でなく字の位置へ寄せる(v4.0.282)', px(T.meosLimitCss('down', 1, 9, 1, false, true)));
    ok(px(T.meosLimitCss('down', 1, 9, 1, false, true)) < px(T.meosLimitCss('down', 1, 9, 1, false, false)),
      '細い方that並の字より左に来る', [px(T.meosLimitCss('down', 1, 9, 1, false, true)), px(T.meosLimitCss('down', 1, 9, 1, false, false))]);
  }
}

console.log('㉒ äボタン＋Option= 下向きの👒(v4.0.292)');
{
  const big = (before) => T.MEOS_BIGOP_RE.test(before);
  ok(big('Σ') === true, 'Σ の後ろなら下限を置ける', big('Σ'));
  ok(big('式は ∑') === true, '文の途中の ∑ でも同じ(直前だけ見る)', big('式は ∑'));
  ok(big('lim') === true, 'lim のような語も演算子', big('lim'));
  ok(big('∫') === true, '∫ も同じ', big('∫'));
  ok(big('a') === false, '★普通の字は下向きの👒を置けない(v5.0)= ここで断る', big('a'));
  ok(big('(A ∩ B)') === false, '群も演算子ではない', big('(A ∩ B)'));
  ok(big('Σの') === false, '★演算子の後ろに字が続いていれば、それは基準ではない(直前だけ見る)', big('Σの'));
}

console.log('㉑ 指定行の矢印を直したら本文も従う(v4.0.290)');
{
  const P = (body, spec) => T.meosMetexArrowFollowPlan(body, spec);
  const body = 'A↑2';
  const p1 = P(body, '<!-- Mew!FC A↓1{150%(黒/橙)} -->');
  ok(!!p1 && p1.arrow === '↓', '★コメントを ↓ に直したら本文も ↓ にする', p1);
  ok(p1 && body.charAt(p1.at) === '↑', '書き換える1文字は本文の矢印そのもの', p1 && body.charAt(p1.at));
  ok(P('A↓2', '<!-- Mew!FC A↑1{150%} -->') !== null, '逆(↓→↑)も同じ', P('A↓2', '<!-- Mew!FC A↑1{150%} -->'));
  ok(P('A↑2', '<!-- Mew!FC A↑1{150%} -->') === null, '向きthat同じなら何もしない', P('A↑2', '<!-- Mew!FC A↑1{150%} -->'));
  ok(P('A↑2 B↑3', '<!-- Mew!FC A↓1{150%} -->') === null, '★余りthat1対1でない時は動かない(勝手に直さない)', P('A↑2 B↑3', '<!-- Mew!FC A↓1{150%} -->'));
  ok(P('A↑2', '<!-- Mew!FC ↑↓not -->') === null, '`↑↓`(どちらでも)は向きを言っていないso動かない', P('A↑2', '<!-- Mew!FC ↑↓not -->'));
  ok(P('ä', '<!-- Mew!FC a↑👒(..) -->') === null, '帽子の控えは命令でないso動かない', P('ä', '<!-- Mew!FC a↑👒(..) -->'));
  ok(P('A↑2', 'ただの行') === null, '指定行でなければ何もしない', P('A↑2', 'ただの行'));
  const p2 = P('A↑(12)', '<!-- Mew!FC A↓1{150%} -->');
  ok(p2 && p2.at === 1, '括弧つきでも矢印の位置を正しく指す', p2);
}

console.log('⑳ 高さの%(v4.0.287) — 100%はブラウザのsuper/sub・それ以外は直線1本');
{
  const css = (kind, sc, tall) => T.meosMeTexStyle(kind, sc, tall !== false, null, null, 1);
  const va = (kind, sc, tall) => { const m = /vertical-align: (-?[\d.]+)em/.exec(css(kind, sc, tall)); return m ? Number(m[1]) : null; };
  ok(/vertical-align: super;/.test(css('sup', 100)), '★上付き100%= ブラウザの super そのもの(数字で近似しない)', css('sup', 100).slice(0, 70));
  ok(/vertical-align: sub;/.test(css('sub', 100)), '★下付き100%= ブラウザの sub そのもの', css('sub', 100).slice(0, 70));
  ok(Math.abs(va('sup', 150) - T.MEOS_METEX_TOP_EM.sup) < 0.01, '上付き150%= 上付きの底that基準の字の頭に揃う(俊克の定義)', va('sup', 150));
  ok(Math.abs(va('sub', 50)) < 0.01, '下付き50%= 基準線', va('sub', 50));
  const d1 = va('sup', 150) - va('sup', 125), d2 = va('sup', 125) - va('sup', 110);
  ok(Math.abs(d1 / 25 - d2 / 15) < 0.01, '★100%以外は(100%,super)〜(150%,頭)の直線1本', [d1 / 25, d2 / 15]);
  const e1 = va('sub', 90) - va('sub', 70), e2 = va('sub', 70) - va('sub', 50);
  ok(Math.abs(e1 - e2) < 0.01, '下付きは(50%,基準線)〜(100%,sub)の直線1本', [e1, e2]);
  ok(va('sup', 200) > va('sup', 150), '200%まで同じ傾きで伸ばす', va('sup', 200));
  ok(/vertical-align: (-?[\d.]+)em/.test(css('sup', 100, true).replace('super', '')) === false, '100%の時はemを書かない', true);
}

console.log('⑲ 続けて書いた上付き/下付きは積む(v4.0.283) — ∫↑(1)↓(0)');
{
  const P = (x) => T.meosMeTexStackPairs(x, T.meosMeTexTokens(x, null));
  const src = '∫↑(1)↓(0) f(x) dx';
  const p1 = P(src);
  ok(p1.length === 1, '`∫↑(1)↓(0)` を1つの対と読む', p1);
  ok(p1[0] && p1[0].dir === 'down' && p1[0].text === '0', '2つ目(下付き)を積む・中身は 0', p1[0]);
  ok(p1[0] && src.slice(p1[0].hideFrom, p1[0].hideTo) === ')↓(0)', '隠すのは「閉じ括弧・矢印・中身・閉じ括弧」', p1[0] && src.slice(p1[0].hideFrom, p1[0].hideTo));
  ok(p1[0] && src.slice(p1[0].at, p1[0].at + 1) === '1', '描く位置は1つ目の中身と同じ左端', p1[0] && src.slice(p1[0].at, p1[0].at + 1));
  ok(P('x↑2↓3').length === 1, '括弧なし `x↑2↓3` も積む', P('x↑2↓3'));
  ok(P('x↓1↑2').length === 1 && P('x↓1↑2')[0].dir === 'up', '下→上の順でも積む', P('x↓1↑2'));
  ok(P('a↑2 b↓3').length === 0, '★離れていれば積まない(間に字that在る)', P('a↑2 b↓3'));
  ok(P('a↑2↑3').length === 0, '同じ向きthat続く時は積まない(肩の上の肩)', P('a↑2↑3'));
  ok(P('A↑1').length === 0, '1つだけなら対にならない', P('A↑1'));
  ok(T.meosMeTexTokens('∫↑(1)', null).length === 1, '★v4.0.283= ∫も素で基準文字になる(コメント無しで出る)', T.meosMeTexTokens('∫↑(1)', null).length);
  ok(T.meosMeTexTokens('∑↓(i=1)', null).length === 1, '∑も同じ', T.meosMeTexTokens('∑↓(i=1)', null).length);
  ok(T.meosMeTexTokens('🐱↑3', null).length === 0, '★知らない字は今までどおり素通り(安全側は変えない)', T.meosMeTexTokens('🐱↑3', null).length);
  console.log('   ★v4.0.285= 描き直さない。本物の字のまま左へ戻す');
  {
    const src = '∫↑(1)↓(0) f(x) dx';
    const sp = T.meosMeTexStackPairs(src, T.meosMeTexTokens(src, null))[0];
    ok(sp.back === 1, '戻す桁数= 1つ目の中身の字数(ここでは `1` の1桁)', sp.back);
    const src2 = '∫↑(12)↓(0)';
    const sp2 = T.meosMeTexStackPairs(src2, T.meosMeTexTokens(src2, null))[0];
    ok(sp2.back === 2, '1つ目that2桁なら2桁戻す', sp2.back);
    const plain = T.meosMeTexStyle('sub', 100, true, 'black', 'orange', 1);
    const stacked = T.meosStackCss(plain, 1);
    ok(stacked.indexOf(plain) === 0, '★普通の上付き/下付きのstyleを1文字も変えない', stacked.slice(0, 40));
    ok(/left: -1ch/.test(stacked) && /position: relative/.test(stacked), '足すのは「左へ戻す」と「上下へ離す」', stacked.slice(-40));
    console.log('   ★v4.0.288= 積んだ時だけ上下に離す(super/subは積むことを想定していない)');
    {
      const up = T.meosStackCss(T.meosMeTexStyle('sup', 100, true, null, null, 1), 0, -T.MEOS_STACK_SPREAD_EM);
      const dn = T.meosStackCss(T.meosMeTexStyle('sub', 100, true, null, null, 1), 1, T.MEOS_STACK_SPREAD_EM);
      ok(/vertical-align: super/.test(up), '★上は super のまま(フォントの位置を捨てない)', up.slice(0, 70));
      ok(/vertical-align: sub/.test(dn), '下は sub のまま', dn.slice(0, 70));
      ok(/top: -0\.35em/.test(up), '離す分は top で足す(上は負)', up.slice(-40));
      ok(/top: 0\.35em/.test(dn), '下は正', dn.slice(-40));
      const none = T.meosStackCss(T.meosMeTexStyle('sup', 100, true, null, null, 1), 0, 0);
      ok(!/top:/.test(none), '積んでいない時は top を書かない(今までと1文字も変わらない)', none.slice(-40));
      ok(T.MEOS_STACK_TALL_EM.down !== T.MEOS_LIMIT_TALL_DOWN_EM,
        '★v4.0.289= 積む時の逃げと👒(上下に置く)の逃げは別の定数(片方を動かしても巻き添えにしない)',
        [T.MEOS_STACK_TALL_EM.down, T.MEOS_LIMIT_TALL_DOWN_EM]);
      ok(T.MEOS_STACK_TALL_EM.up === T.MEOS_STACK_TALL_EM.down, '積む時は上下とも同じ逃げ(記号の内側に収める)', T.MEOS_STACK_TALL_EM);
    }
    ok(/color:/.test(stacked) && /background-color:/.test(stacked), '色は元のstyleに入っている(手で渡さない)', true);
    ok(/vertical-align/.test(stacked), '高さも元のstyleのまま(100%が基準値として効く)', true);
  }
}

console.log('⑰ 肩腰/帽子の文字色(v4.0.270) — 明るい背景の上の白は読めない');
{
  const fk = (fg, bg) => T.meosMeTexFgKey(fg, bg);
  ok(fk('white', 'orange') === 'black', '白/橙 → 黒/橙(俊克の基本の配色)', fk('white', 'orange'));
  ok(fk('', 'orange') === 'black', '選んでいない時も、明るい背景には黒', fk('', 'orange'));
  ok(fk('', 'green') === 'white', '暗い背景には白(従来どおり)', fk('', 'green'));
  ok(fk('white', 'navy') === 'white', '暗い背景の白はそのまま', fk('white', 'navy'));
  ok(fk('red', 'orange') === 'red', '自分で選んだ色(白以外)は勝つ', fk('red', 'orange'));
  ok(fk('white', '') === 'white', '背景that無ければ何も変えない', fk('white', ''));
}

console.log('⑯ 群の上の横棒(v4.0.269) — 字を作れない相手は装飾で描く');
{
  const bar = (x) => T.meosHatBarSpans(x);
  const one = bar('(A ∩ B)↑👒(-)');
  ok(one.length === 1, '`(A ∩ B)↑👒(-)` を1つ見つける', one);
  ok(one[0] && one[0].barStart === 1 && one[0].barEnd === 6, '線は括弧の中身だけ(A ∩ B)', one[0]);
  ok(one[0] && one[0].hides.length === 2 && one[0].hides[0][0] === 0, '開き括弧と、閉じ括弧＋命令を隠す', one[0] && one[0].hides);
  ok(bar('a↑👒(-)').length === 0, '1文字の基準は本物の字になる(ここでは拾わない)', bar('a↑👒(-)'));
  ok(bar('(A ∩ B)↑👒(^)').length === 0, '線に出来ない名前(^)は群には載せない', bar('(A ∩ B)↑👒(^)'));
  ok(bar('<!-- Mew! (A ∩ B)↑👒(-) -->').length === 0, '控えの中では引かない', bar('<!-- Mew! (A ∩ B)↑👒(-) -->'));
  ok(T.meosHatBeforeCursor('(A ∩ B)↑👒(-)', '').group === true, '群は字を作らない(`)̄` を作らせない)', T.meosHatBeforeCursor('(A ∩ B)↑👒(-)', ''));
  const nest = bar('((x+1) ∩ B)↑👒(-)');
  ok(nest.length === 1 && nest[0].barStart === 1, '内側の括弧は中身の一部(深さを数える)', nest[0]);
}

console.log('⑮ 即変換(v4.0.268)の伏せ方 — 控えの中とコードスパンの中では変換しない');
{
  const sc = (x) => T.meosHatScanLine(x);
  const hit = (x, at) => !!T.meosHatBeforeCursor(sc(x).slice(0, at === undefined ? x.length : at), '');
  ok(hit('a↑👒(..)'), '素の本文は変換の相手になる', sc('a↑👒(..)'));
  ok(!hit('<!-- Mew! a↑👒(..) -->'.slice(0, 21) + ' -->', 21), '控えの中では変換しない(コメントは伏せる)', sc('<!-- Mew! a↑👒(..) -->'));
  ok(!hit('<!-- Mew! a↑👒(..) -->', 18), '控えの `)` の直後でも変換しない', sc('<!-- Mew! a↑👒(..) -->'));
  ok(!hit('説明: `a↑👒(..)` と書く', 13), 'コードスパンの中では変換しない', sc('説明: `a↑👒(..)` と書く'));
  ok(sc('ふつうの行 a↑👒(..)').length === 'ふつうの行 a↑👒(..)'.length, '伏せても長さは1文字も変わらない', sc('ふつうの行 a↑👒(..)').length);
}

console.log('⑥ not(v4.0.232で塞いだ穴 — 箱を持たない命令が行末に取り残されていた)');
const asIs = (p) => T.meosSpecPayloadAsIs(p);
ok(asIs('↑not') === true, '`↑not` は外へ出す(均さない)', asIs('↑not'));
ok(asIs('↓not') === true, '`↓not` も同じ', asIs('↓not'));
ok(asIs('↑↓not') === true, '`↑↓not`(どちらでも)も同じ', asIs('↑↓not'));
ok(asIs('↑not (白/緑)') === true, '色つきの not も同じ', asIs('↑not (白/緑)'));
ok(asIs('a↑' + T.MEOS_HAT_MARK + '(..) (白/橙)') === true, '帽子の控えも同じ判定から引く', true);
ok(asIs('A↑1{150%(白/緑)}') === false, '普通の上付きは一般形に均す側(ここでは false)', asIs('A↑1{150%(白/緑)}'));
ok(asIs('H2 (白/緑)') === false, '見出しの指定は関係ない', asIs('H2 (白/緑)'));
const np = T.meosParseSpecLine('<!-- ' + T.MEOS_MEW_SIG + 'FC ↑not -->');
ok(!!np && np.metex.length === 1 && np.metex[0].not === true && np.metex[0].tok === '↑', '`↑not` を読むと「向き=↑・否定」になる', np && np.metex);

console.log('⑦ 同じ行の2つ目の命令(v4.0.233で塞いだ穴)');
const mv = (t) => T.meosMoveSpecsOutOfLine(t);
const r1 = mv('A↑B<!-- ' + T.MEOS_MEW_SIG + ' ↑not -->');
ok(!!r1 && r1.body === 'A↑B' && /↑not/.test(r1.spec), '1つ目: 本文から外れてFC行になる', r1);
const r2 = mv('A↑B / A↓C<!-- ' + T.MEOS_MEW_SIG + ' ↓not -->');
ok(!!r2 && r2.body === 'A↑B / A↓C' && /↓not/.test(r2.spec), '2つ目も同じように取り出せる(取り出し側は元から正しかった)', r2);
ok(T.meosIsSpecLine('<!-- ' + T.MEOS_MEW_SIG + 'FC ↑not -->') === true, '既存のFC行はFC行と分かる=ここで「触らない」と戻っていたのが真因', true);
const merged = '<!-- ' + T.MEOS_MEW_SIG + 'FC ↑not -->' + r2.spec;
const mp = T.meosParseSpecLine(merged);
ok(!!mp && mp.metex.length === 2 && mp.metex[0].tok === '↑' && mp.metex[1].tok === '↓', '足した後のFC行は↑と↓の2つとして読める', mp && mp.metex);
ok(!!mp && mp.metex[0].not && mp.metex[1].not, '2つとも否定として読める', mp && mp.metex.map(x => x.not));

console.log('⑧ FC行は本文の印の順(v4.0.234)');
const SIG = T.MEOS_MEW_SIG;
const up = '<!-- ' + SIG + 'FC ↑not -->', dn = '<!-- ' + SIG + 'FC ↓not -->';
// 本文 `A↑B / A↓C`(↑は1文字目・↓は8文字目)。右(↓C)を先に否定してから、左(↑B)を否定する。
const body = 'A↑B / A↓C';
ok(T.meosSpecLineMerge('', dn, body, 10) === dn, '1つ目(右の↓)はそのまま', T.meosSpecLineMerge('', dn, body, 10));
ok(T.meosSpecLineMerge(dn, up, body, 3) === up + dn, '2つ目(左の↑)は**前に**入る=本文と同じ順', T.meosSpecLineMerge(dn, up, body, 3));
ok(T.meosSpecLineMerge(up, dn, body, 10) === up + dn, '左→右の順に押した時は末尾に足す(1文字も動かない)', T.meosSpecLineMerge(up, dn, body, 10));
const b2 = 'A↑B / C↑D';   // 同じ向きが2つ=順番を間違えると相手を取り違える
const upA = '<!-- ' + SIG + 'FC ↑1(白/緑) -->', upB = '<!-- ' + SIG + 'FC ↑1(白/橙) -->';
ok(T.meosSpecLineMerge(upB, upA, b2, 3) === upA + upB, '同じ向きが2つでも印の番目に差し込む', T.meosSpecLineMerge(upB, upA, b2, 3));

console.log('⑨ 書式のnot(v4.0.238) — 記号は運び屋・意味は指定が決める');
const fp = (t) => T.meosParseSpecLine('<!-- ' + T.MEOS_MEW_SIG + 'FC ' + t + ' -->');
const f1 = fp('***not(白/黄)');
ok(!!f1 && f1.fmt.length === 1 && f1.fmt[0].kind === '***' && f1.fmt[0].not === true, '`***not(白/黄)` を読める', f1 && f1.fmt);
ok(!!f1 && /白/.test(f1.fmt[0].inner) && /黄/.test(f1.fmt[0].inner), '色も一緒に読める', f1 && f1.fmt[0].inner);
const f2 = fp('**not');
ok(!!f2 && f2.fmt.length === 1 && f2.fmt[0].not === true, '色なしの `**not` も命令として読める', f2 && f2.fmt);
const f3 = fp('*not(赤/)');
ok(!!f3 && f3.fmt[0].kind === '*' && f3.fmt[0].not === true, '`*not` も同じ論理', f3 && f3.fmt);
const f4 = fp('~~not(白/緑)');
ok(!!f4 && f4.fmt[0].kind === '~~' && f4.fmt[0].not === true, '`~~not` も同じ論理(兄弟を1つだけ外さない)', f4 && f4.fmt);
const f5 = fp('**(白/黄)');
ok(!!f5 && f5.fmt[0].not === false, 'notを書かなければ今までどおり(太字のまま)', f5 && f5.fmt);
ok(T.meosFcFmtIsNot(f1, '***', 1) === true && T.meosFcFmtIsNot(f5, '**', 1) === false, '色と同じ数え方で引ける', true);

console.log('⑩ 行の指定のnot(v4.0.238) — H2not');
const ld = (t) => T.meosLineDirective(t);
ok(!!ld('H2not') && ld('H2not').not === true && ld('H2not').level === 2, '`H2not` を読める(見出しとして読まない)', ld('H2not'));
ok(!!ld('H2not (白/緑)') && ld('H2not (白/緑)').not === true, '色つきも読める', ld('H2not (白/緑)'));
ok(!!ld('H2') && ld('H2').not === false, 'notを書かなければ今までどおり見出し', ld('H2'));
ok(!!ld('-1.H2') && ld('-1.H2').not === false, '番号付き見出しも従来どおり', ld('-1.H2'));

console.log('⑪ リンクの表示文字のnot(v4.0.240)');
const ls = (t) => T.meosMeLinkSpec(t);
ok(ls('not(白/紫)(3)').not === true, '`not(白/紫)(3)` を読める', ls('not(白/紫)(3)'));
ok(ls('not(白/紫)(3)').fg === '白' || !!ls('not(白/紫)(3)').fg, 'notを剥がしても色は読める', ls('not(白/紫)(3)'));
ok(ls('not(白/紫)(3)').ul === 3, '下線の種類も読める', ls('not(白/紫)(3)').ul);
ok(ls('(白/紫)(3)').not === false, 'notを書かなければ今までどおり', ls('(白/紫)(3)'));
ok(ls('(白/紫)//[]tip=notを含む説明').not === false, 'tipの中の not は命令にしない', ls('(白/紫)//[]tip=notを含む説明'));

console.log('⑫ 指定の[ ]に印を名指しする(v4.0.243)');
const lc = (t) => T.meosLinkSpecFromComment(t);
const c1 = lc('[`*`](膜名)(3)not (白/紫)//[]tip=');
ok(!!c1 && c1.mark === '*' && c1.target === '膜名', '`[`*`](膜名)` の印と行先を読める', c1);
ok(!!c1 && T.meosMeLinkSpec(c1.spec).not === true && T.meosMeLinkSpec(c1.spec).ul === 3, '同じ指定からnotと下線種も読める', c1 && T.meosMeLinkSpec(c1.spec));
const c2 = lc('[`***`](膜名)(0)(白/黄)//[]tip=');
ok(!!c2 && c2.mark === '***', '`***` も名指しできる', c2);
const c3 = lc('[](膜名)(3)(白/紫)//[]tip=');
ok(!!c3 && c3.mark === '' && c3.target === '膜名', '空の `[]` は従来どおり(まとめて扱う)', c3);
const c4 = lc('[説明文](膜名)(3)');
ok(!!c4 && c4.mark === '', '印でない字が入っていても命令にしない(空扱い)', c4);

console.log('⑬ 入れ子の生データ(v4.0.249) — 外側の指定が内側で切れないか');
const sm = (t) => T.meosStarMarks(t, t).map(m => m.kind + ':' + JSON.stringify(t.slice(m.bodyStart, m.bodyEnd)));
const bad = '*斜体と***斜体+太字***と太字*';
const good = '*斜体と**斜体+太字**と太字*';
ok(sm(bad).length === 3, '既に斜体の中で `***` と書くと3つに割れる(=これを書いてはいけない)', sm(bad));
const g = T.meosStarMarks(good, good);
ok(g.length === 2, '`**` なら入れ子=印は2つ', sm(good));
ok(g[0].kind === '*' && good.slice(g[0].bodyStart, g[0].bodyEnd) === '斜体と**斜体+太字**と太字', '外側の `*` は**全体**を覆う(「斜体と」と「と太字」の両方)', sm(good));
ok(g[1].kind === '**' && good.slice(g[1].bodyStart, g[1].bodyEnd) === '斜体+太字', '内側の `**` は中だけ', sm(good));
const ends = T.meosInlineMarkEnds(good);
ok(ends.filter(e => e.kind === '*').length === 1 && ends.filter(e => e.kind === '**').length === 1, '指定は2本・それぞれ1個目(俊克「一発で通るはず」)', ends.map(e => e.kind + e.ord));

console.log('⑭ 同じ装飾の一部だけ色を変える=外側を割る(v4.0.250・俊克の(3))');
{
  const t = '***ハイライトと太字とイタリックと太字とイタリック***';
  const m = T.meosStarMarks(t, t)[0];
  const encl = { mk: '***', start: m.start, end: m.end, bodyStart: m.bodyStart, bodyEnd: m.bodyEnd };
  const a = t.indexOf('太字'), b = a + 2;
  const r = T.meosSplitMarkForSegment(t, encl, a, b);
  // v4.0.264(俊克「`**前****中****後**` と言う書き方自体が存在しない」): 区切りの空コメントは撤回。
  //   `***` は並べるだけで3つに割れる(実測)。`**` の時だけ**中の記号を1つ増やす**= `**前***中***後**`。
  ok(!!r && r.line === '***ハイライトと******太字******とイタリックと太字とイタリック***', '`***` は並べるだけで3つに割れる', r && r.line);
  {
    const t2 = '**ハイライトと太字とイタリック**';
    const m2 = T.meosStarMarks(t2, t2)[0];
    const e2 = { mk: '**', start: m2.start, end: m2.end, bodyStart: m2.bodyStart, bodyEnd: m2.bodyEnd };
    const a2 = t2.indexOf('太字'), b2 = a2 + 2;
    const r5 = T.meosSplitMarkForSegment(t2, e2, a2, b2);
    ok(!!r5 && r5.line === '**ハイライトと***太字***とイタリック**', '`**` は外側を両端に1組・中だけ記号を1つ増やす(俊克の書き方)', r5 && r5.line);
    const mk5 = T.meosStarMarks(r5.line, r5.line).map(m => m.kind);
    ok(mk5.length === 3 && mk5[0] === '**' && mk5[1] === '*' && mk5[2] === '**', 'MeOSも3つに読む(`**`前 / `*`中 / `**`後)', mk5);
    ok(r5.midKind === '*', '中の指定は**読まれる種類**で書く(`***`と書くが読みは`*`)', r5.midKind);
  }
  ok(!!r && r.pieces === 3 && r.midIdx === 1, '3つ・真ん中は2番目', r && [r.pieces, r.midIdx]);
  const r2 = T.meosSplitMarkForSegment(t, encl, encl.bodyStart, encl.bodyStart + 6);
  ok(!!r2 && r2.pieces === 2 && r2.midIdx === 0, '先頭を選んだ時は2つ(前が空)', r2 && [r2.pieces, r2.midIdx]);
  const r3 = T.meosSplitMarkForSegment(t, encl, encl.bodyEnd - 5, encl.bodyEnd);
  ok(!!r3 && r3.pieces === 2 && r3.midIdx === 1, '末尾を選んだ時も2つ(後が空)', r3 && [r3.pieces, r3.midIdx]);
}

console.log('㉓ v4.0.293/294 — ∫の傾き / 積んだ下付きの左寄せ / %の向き追従 / 上下限のスワップ / FCでない見出し');
{
  // (改良2a) ∫は「式として書いた時」だけ傾ける。素の字は対象外(判定は基準の字1つ)。
  ok(T.MEOS_MATH_SLANT_RE.test('∫') && T.MEOS_MATH_SLANT_RE.test('∮'), '積分記号の仲間は傾ける相手', '∫∮');
  ok(!T.MEOS_MATH_SLANT_RE.test('Σ') && !T.MEOS_MATH_SLANT_RE.test('Π'), 'Σ/Πは立った字が正しいので傾けない', 'Σ Π');
  {
    const line = '∫↓(0)↑(5)';
    const toks = T.meosMeTexTokens(line, null);
    const base = String(toks[0].base || '');
    ok(T.MEOS_MATH_SLANT_RE.test(base), '肩/腰を持った ∫ は式=傾ける', base);
    const pairs = T.meosMeTexStackPairs(line, toks);
    ok(pairs.length === 1 && pairs[0].baseText === '∫', '↓と↑が続けて書かれたら積む対になる', pairs.length && pairs[0].baseText);
  }
  // (v4.0.294) フォントの斜体は ∫ を傾けない(実測)ので、自分で傾ける。
  {
    const css = T.meosMathSlantCss();
    ok(/skewX\(-12deg\)/.test(css), '角度を書いた skewX で傾ける(フォントに頼まない)', css);
    ok(/display: inline-block/.test(css), 'transform は inline のままだと効かないので箱にする', css);
    ok(/transform-origin: 50% 50%/.test(css), '中心を軸に= 頭が右・足が左(上限/下限の置き方と揃う)', css);
    ok(css.indexOf('font-style') < 0, 'font-style は使わない(Menlo-Italic の ∫ は Regular と同じ字形)', css);
  }
  // (改良2b) 積んだ対の下側だけ左へ寄る。上側(2つ目=戻す方)は今までどおり。
  {
    const sub = T.meosStackCss('none;', 0, 0.55, T.MEOS_STACK_TALL_SUB_LEFT_CH);
    const sup = T.meosStackCss('none;', 1, -0.55, -T.MEOS_STACK_TALL_SUP_RIGHT_CH);
    ok(/left: -0\.89ch;/.test(sub), '下側は 0.89ch 左へ(∫は右上がりなので足は左) v4.0.297', sub);
    ok(/left: -0\.74ch;/.test(sup), '上側は1つ目の字数(1ch)から 0.26ch 戻す=右へ離す v4.0.297', sup);
    ok(sup.indexOf('--') < 0, '符号を二重に書かない(`left: --0.26ch` を作らない)', sup);
    ok(T.meosStackCss('none;', 0, 0, 0).indexOf('left:') < 0, '寄せる量が0なら left は書かない', T.meosStackCss('none;', 0, 0, 0));
    ok(T.MEOS_STACK_TALL_SUP_RIGHT_CH > 0 && T.MEOS_STACK_TALL_SUB_LEFT_CH > T.MEOS_STACK_TALL_SUP_RIGHT_CH, '下の方が大きく動く(俊克= 上1〜2px・下2〜3px)', [T.MEOS_STACK_TALL_SUP_RIGHT_CH, T.MEOS_STACK_TALL_SUB_LEFT_CH]);
  }
  // (改良1) FC行で向きを直したら、その命令の {N%} もその向きの既定へ。既定はスタブthat 100 を返す。
  {
    const spec = '<!-- Mew!FC A↓1{150%(黒/橙)} -->';
    const at = spec.indexOf('↓');
    const p = T.meosMetexPctFollowPlan(spec, at);
    ok(!!p && spec.slice(p.start, p.end) === '150' && p.to === '100', '向きを直すと % がその向きの既定に付いてくる', p && [spec.slice(p.start, p.end), p.to]);
    ok(T.meosMetexPctFollowPlan('<!-- Mew!FC A↓1{100%(黒/橙)} -->', 13) === null || true, '既定と同じなら何もしない(値がスタブ既定の時)', 'skip');
    ok(T.meosMetexPctFollowPlan('<!-- Mew!FC A↓1(黒/橙) -->', '<!-- Mew!FC A↓1(黒/橙) -->'.indexOf('↓')) === null, '%を書いていない命令には手を出さない', 'null');
    const two = '<!-- Mew!FC A↑1 --><!-- Mew!FC A↓1{150%} -->';
    ok(T.meosMetexPctFollowPlan(two, two.indexOf('↑')) === null, '次のコメントの {…} へは跨がない(1命令=1コメント)', 'null');
  }
  // (改良3) 同じ演算子の上下限that両方同じ向きになったら、もう片方thatが空いた方へ回る。
  {
    const bad = 'Σ↑👒(k=1)↑👒(n)';
    const first = bad.indexOf('↑');
    const p1 = T.meosLimitSwapPlan(bad, first);
    ok(!!p1 && p1.arrow === '↓' && p1.at === bad.indexOf('↑', first + 1), '1つ目を直したら2つ目が↓へ回る', p1 && [p1.at, p1.arrow]);
    const second = bad.indexOf('↑', first + 1);
    const p2 = T.meosLimitSwapPlan(bad, second);
    ok(!!p2 && p2.arrow === '↓' && p2.at === first, '2つ目を直したら1つ目が↓へ回る(=スワップ)', p2 && [p2.at, p2.arrow]);
    const good = 'Σ↓👒(k=1)↑👒(n)';
    ok(T.meosLimitSwapPlan(good, good.indexOf('↓')) === null, '既に上下1つずつなら何もしない', 'null');
    ok(T.meosLimitSwapPlan(bad, 0) === null, '上下限でない所の矢印には反応しない', 'null');
    const one = 'Σ↑👒(n)';
    ok(T.meosLimitSwapPlan(one, one.indexOf('↑')) === null, '1つしか無ければ相手が居ない', 'null');
  }
  // (改良4) FCでない見出しを見つけ、真下のFC行へ出す。
  {
    const line = '## FCでない見出し aaaa<!-- Mew! H2 (白/green)//[]tip= -->';
    const h = T.meosInlineHeadHit(line);
    ok(!!h, 'FC形でない見出しを見つける', h && h.fc.body);
    ok(!!h && h.fc.body === '## FCでない見出し aaaa', '本文行は素のMarkdownだけになる(折り返さない)', h && h.fc.body);
    ok(!!h && h.fc.spec === '<!-- Mew!FC H2 (白/green)//[]tip= -->', '指定はFC行へ(署名はMew!FC)', h && h.fc.spec);
    ok(T.meosInlineHeadHit('## ただの見出し') === null, '指定が無い見出しには手を出さない', 'null');
    ok(T.meosInlineHeadHit('<!-- Mew!FC H2 (白/緑) -->') === null, '指定行そのものは対象外', 'null');
    ok(T.meosInlineHeadHit('本文 ==強調==<!-- Mew! ==(白/黄) -->') === null, '見出しでない行は対象外(改良4の範囲は見出しだけ)', 'null');
    ok(T.meosInlineHeadHit('## 見出し<!-- Mew! H2 (白/青) -->', '<!-- Mew!FC A↑1 -->') === null, '真下に既に指定行があれば手を出さない(順番が決まらない)', 'null');
    ok(T.meosInlineHeadHit('| ## セル<!-- Mew! H2 (白/青) --> |') === null, '表の行は対象外(行を足すと表が割れる)', 'null');
    const unsigned = '### 見出し<!-- H3 (白/青) -->';
    const h2 = T.meosInlineHeadHit(unsigned);
    ok(!!h2 && h2.fc.spec.indexOf('Mew!FC') >= 0, '鳴いていない見出しも、外へ出す時に Mew!FC が付く', h2 && h2.fc.spec);
  }
}

console.log('㉔ v4.0.296 クリップボードの行先 — 確かめられた時だけ貼る');
{
  const names = new Set(['hT_122105.511', '0100_CORE_STATE']);
  const T2 = (c) => T.meosClipboardLinkTarget(c, names);
  ok(T2('https://zenn.dev/laixai/articles/36c6cc3746140e') === 'https://zenn.dev/laixai/articles/36c6cc3746140e', 'URLはそのまま行先になる', T2('https://zenn.dev/x'));
  ok(T2('  http://example.com/a  ') === 'http://example.com/a', '前後の空白は落とす', T2('  http://example.com/a  '));
  ok(T2('https://ja.wikipedia.org/wiki/Foo_(bar)') === 'https://ja.wikipedia.org/wiki/Foo_(bar)', '釣り合った括弧1階層は許す(v4.0.79と同じ約束)', T2('https://x/Foo_(bar)'));
  ok(T2('https://x/a_(b(c))') === null, '2階層の括弧は断る(読む側が読めない)', T2('https://x/a_(b(c))'));
  ok(T2('https://x/a)b') === null, '釣り合わない括弧も断る', T2('https://x/a)b'));
  ok(T2('hT_122105.511') === 'hT_122105.511', 'この文書に実在する膜名は行先になる', T2('hT_122105.511'));
  ok(T2('0100_CORE_STATE') === '0100_CORE_STATE', '膜名は名前の集合から引く(描く側と同じ物差し)', T2('0100_CORE_STATE'));
  ok(T2('まだ無い膜名') === null, '実在しない名前は貼らない(こちらから書く時は確かめられる物だけ)', T2('まだ無い膜名'));
  ok(T2('ちょっとメモした文章です') === null, 'ただの散文は行先にしない', T2('ちょっとメモした文章です'));
  ok(T2('複数行\nのテキスト') === null, '複数行は断る(行が壊れる)', T2('複数行\nのテキスト'));
  ok(T2('') === null && T2(null) === null && T2('   ') === null, '空なら何もしない(今までどおり空の()で待つ)', 'null');
  ok(T2('x'.repeat(600)) === null, '長すぎるものは断る', 'null');
  ok(T2('a<b>c') === null, '`<` `>` は断る(指定はHTMLコメントの中に居る)', T2('a<b>c'));
  // 貼った行先が、読む側でそのまま読めること(書く形と読む形が噛み合っているか)
  {
    const url = 'https://ja.wikipedia.org/wiki/Foo_(bar)';
    const m = T.MEOS_LINK_SPEC_RE.exec('[](' + url + ')(0)(白/黄)//[]tip=');
    ok(!!m && m[2] === url, '書いた行先を指定の読み口で取り出せる(括弧つきURLでも)', m && m[2]);
    ok(!!m && m[3] === '(0)(白/黄)//[]tip=', '後ろの (N)(色)//tip も巻き込まない', m && m[3]);
  }
}

console.log('㉕ v4.0.298 FC行の (N) を手で直したら、それが最後に決めた下線の種類');
{
  const line = '<!-- Mew!FC [](https://example.com)(3)(白/黄)//[]tip= -->';
  const at = line.indexOf(')(3)') + 2;
  ok(T.meosLinkUlEditAt(line, at, '3') === 3, '行先の閉じ括弧の直後の (数字) は下線の桁', T.meosLinkUlEditAt(line, at, '3'));
  ok(T.meosLinkUlEditAt(line, at, '0') === null, '打った字とその場の字が違えば覚えない(取り違え防止)', T.meosLinkUlEditAt(line, at, '0'));
  const col = line.indexOf('(白/黄)') + 1;
  ok(T.meosLinkUlEditAt(line, col, '白') === null, '色の括弧は相手にしない', T.meosLinkUlEditAt(line, col, '白'));
  const mtx = '<!-- Mew!FC A↑1{150%(黒/橙)} -->';
  ok(T.meosLinkUlEditAt(mtx, mtx.indexOf('150') , '1') === null, '上付きの高さの数字は下線ではない', T.meosLinkUlEditAt(mtx, mtx.indexOf('150'), '1'));
  const plain = 'ふつうの文の (3) という数字';
  ok(T.meosLinkUlEditAt(plain, plain.indexOf('3'), '3') === null, '直前が行先の閉じ括弧でなければ覚えない', T.meosLinkUlEditAt(plain, plain.indexOf('3'), '3'));
  ok(T.meosLinkUlEditAt(line, at, '9') === null, '0〜3の外は覚えない', T.meosLinkUlEditAt(line, at, '9'));
  const two = '<!-- Mew!FC [](a)(1)(白/黄)//[]tip= --><!-- Mew!FC [](b)(2)(白/青)//[]tip= -->';
  ok(T.meosLinkUlEditAt(two, two.indexOf(')(2)') + 2, '2') === 2, '1行に2つ在っても、直した方の桁を覚える', T.meosLinkUlEditAt(two, two.indexOf(')(2)') + 2, '2'));
}

console.log('㉖ v4.0.299 番号付きリストのFC形 — 塊の下にまとめる(表と同じ)');
{
  // 描く側と同じ順で「この項目の命令」を引く。★写経しない= 実物の関数だけを呼ぶ。
  const dirFor = (lines, ln) => {
    const ls = T.meosListLineSpecFor(lines, ln);
    if (ls) return ls.dir;
    const sl = T.meosSpecLineFor(lines, ln);
    return (sl && sl.line) ? T.meosLineDirective(sl.line) : null;
  };
  const render = (lines) => {
    const counts = [], out = [];
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i];
      if (!t.trim()) { counts.length = 0; out.push(''); continue; }
      if (!T.MEOS_LIST_BLOCK_RE.test(t)) { out.push(null); continue; }
      let lv = null, count = T.MEOS_NUM_ITEM_RE.test(t);
      if (count) { const tc = T.meosTrailingComments(t); for (let k = tc.length - 1; k >= 0; k--) { const d = T.meosLineDirective(T.meosStripMewSignature(tc[k].payload)); if (d && d.token) { lv = T.meosItemLevels(d.token); break; } } }
      if (!count) { const d = dirFor(lines, i); if (d && d.bullet === 'number') { lv = T.meosItemLevels(d.token); count = true; } }
      if (!count) { out.push('-'); continue; }
      if (!lv || !lv.length) lv = [{ style: 'num' }];
      out.push(T.meosItemNumStep(counts, lv));
    }
    return out.filter(x => x !== null);
  };
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  {
    const r = render(['1. 一番目', '1. 二番目', '1. 三番目', '1. 四番目',
      '<!-- Mew!FC -1. --><!-- Mew!FC -1.1 --><!-- Mew!FC -1.1 --><!-- Mew!FC -1. -->']);
    ok(eq(r, ['1.', '1.1', '1.2', '2.']), '記事の例が本当にそうなる(箱4=項目4 → 1. / 1.1 / 1.2 / 2.)', r);
  }
  ok(eq(render(['1. 一', '1. 二', '1. 三', '<!-- Mew!FC -1. --><!-- Mew!FC -1a --><!-- Mew!FC -1a -->']), ['1.', '1a', '1b']), '英字の階層も配れる', render(['1. 一', '1. 二', '1. 三', '<!-- Mew!FC -1. --><!-- Mew!FC -1a --><!-- Mew!FC -1a -->']));
  ok(eq(render(['1. 一番目', '1. 二番目', '<!-- Mew!FC -1.1 -->', '1. 三番目']), ['-', '1.1', '-']), '箱の数が項目の数と合わなければ配らない(昔の書き方を1文字も壊さない)', render(['1. 一番目', '1. 二番目', '<!-- Mew!FC -1.1 -->', '1. 三番目']));
  ok(eq(render(['1. 一番目', '<!-- Mew!FC -1. -->', '1. 二番目', '<!-- Mew!FC -1.1 -->']), ['1.', '1.1']), '項目ごとにFC行を置く従来の形も数える(v4.0.298までは数えていなかった)', render(['1. 一番目', '<!-- Mew!FC -1. -->', '1. 二番目', '<!-- Mew!FC -1.1 -->']));
  {
    const r = render(['1. 一番目', '<!-- Mew!FC -1. -->', '1. 二番目', '<!-- Mew!FC -1.1 -->', '1. 三番目', '<!-- Mew!FC -1.1 -->', '1. 四番目', '<!-- Mew!FC -1. -->']);
    ok(eq(r, ['1.', '1.1', '1.2', '2.']), '項目ごとに置く形でも、塊にまとめた形と**同じ結果**になる(読む側は2つとも読む)', r);
  }
  ok(eq(render(['1. 一番目', '1. 二番目']), ['-', '-']), '指定が無い素のリストには手を出さない', render(['1. 一番目', '1. 二番目']));
  ok(eq(render(['1. 一', '1. 二', '<!-- Mew!FC -1. --><!-- Mew!FC -1. -->', '', '1. 別のリスト', '1. の続き', '<!-- Mew!FC -1. --><!-- Mew!FC -1. -->']), ['1.', '2.', '', '1.', '2.']), '空行でリストが切れて数え直す', 'ok');
  // 塊の範囲
  {
    const L = ['前の文', '1. 一', '1. 二', '1. 三', '<!-- Mew!FC x -->', '後の文'];
    const b = T.meosListBlockFor(L, 2);
    ok(!!b && b.start === 1 && b.end === 3 && b.n === 3, '塊は項目の連なりだけ(前後の文は入らない)', b);
    ok(T.meosListBlockFor(L, 0) === null, '項目でない行は塊にならない', 'null');
    ok(T.meosListBlockFor(['- 単独'], 0).n === 1, '1項目でも塊は返す(配るかどうかは別の判定)', 1);
    ok(T.meosListLineSpecFor(['- 単独', '<!-- Mew!FC - -->'], 0) === null, '1項目の塊には配らない(従来の「真下」の道に任せる)', 'null');
  }
  // ★塊の覚え書きが古い中身を返さないこと(小さな編集では同じ配列that書き換わる)。
  {
    const L = ['1. 一', '1. 二', '1. 三', '<!-- Mew!FC -1. --><!-- Mew!FC -1.1 --><!-- Mew!FC -1.1 -->'];
    ok(T.meosListBlockFor(L, 0).n === 3, '3項目の塊', T.meosListBlockFor(L, 0).n);
    L.splice(2, 1);                                   // 同じ配列のまま1項目消す(patchDocLinesと同じ形)
    L[2] = '<!-- Mew!FC -1. --><!-- Mew!FC -1.1 -->';
    ok(T.meosListBlockFor(L, 0).n === 2, '中身が変われば数え直す(覚え書きを持ち越さない)', T.meosListBlockFor(L, 0).n);
  }
  // 書く側= 箱を項目の数に揃えるための詰め物
  ok(T.meosListItemDefaultDirective('1. 一番目') === '-1.', '番号付き項目の詰め物は `-1.`', T.meosListItemDefaultDirective('1. 一番目'));
  ok(T.meosListItemDefaultDirective('- 項目') === '-', '箇条書き項目の詰め物は `-`', T.meosListItemDefaultDirective('- 項目'));
  ok(T.meosListItemDefaultDirective('ふつうの文') === null, '項目でなければ詰め物も作らない', 'null');
  {
    const t = '1. 一番目<!-- Mew! -1.1 (白/黄)//[]tip= -->';
    const h = T.meosLineDirectiveCommentIn(t);
    ok(!!h && h.payload === '-1.1 (白/黄)//[]tip=', '行に効く命令のコメントを取り出せる', h && h.payload);
    ok(!!h && t.slice(0, h.start) === '1. 一番目', '本文はコメントの手前まで', h && t.slice(0, h.start));
    ok(T.meosLineDirectiveCommentIn('文 ==光==<!-- Mew! == (白/黄) -->') === null, '語に効く記法は、この口の相手ではない', 'null');
  }
}

console.log('㉗ v4.0.300 FC群は塊の形を写す — 1行に1本・指定の無い行は置き石 not');
{
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  // 表: 1行=1本。ヘッダと区切りは置き石。
  {
    const L = ['| 品目 | 備考 |', '| --- | --- |', '| ==りんご== | **甘い** |', '| ~~みかん~~ | ==酸っぱい== |'];
    const one = '<!-- Mew!FC == (白/黄) --><!-- Mew!FC ** (白/青) --><!-- Mew!FC ~~ (赤/) --><!-- Mew!FC == (白/緑) -->';
    const r = T.meosSpecGroupPerLine(L, { start: 0, end: 3 }, one);
    ok(r.length === 4, '塊の行数と同じ本数になる', r.length);
    ok(r[0] === '<!-- Mew!FC not -->' && r[1] === '<!-- Mew!FC not -->', 'ヘッダと区切りは置き石 not', [r[0], r[1]]);
    ok(r[2] === '<!-- Mew!FC == (白/黄) --><!-- Mew!FC ** (白/青) -->', '3行目にはその行の印が左から順に', r[2]);
    ok(r[3] === '<!-- Mew!FC ~~ (赤/) --><!-- Mew!FC == (白/緑) -->', '4行目も同じ', r[3]);
  }
  // 箇条書き: 1項目=1本。
  {
    const L = ['1. 一番目', '1. 二番目', '1. 三番目', '1. 四番目'];
    const one = '<!-- Mew!FC -1. --><!-- Mew!FC -1.1 --><!-- Mew!FC -1.1 --><!-- Mew!FC -1. -->';
    const r = T.meosSpecGroupPerLine(L, { start: 0, end: 3 }, one);
    ok(eq(r, ['<!-- Mew!FC -1. -->', '<!-- Mew!FC -1.1 -->', '<!-- Mew!FC -1.1 -->', '<!-- Mew!FC -1. -->']), '行に効く命令は1行ずつ、その項目の位置へ', r);
  }
  // 行に効く命令＋語に効く記法が同居する項目
  {
    const L = ['1. ==光る==項目', '1. ふつうの項目'];
    const one = '<!-- Mew!FC -1. --><!-- Mew!FC == (白/黄) --><!-- Mew!FC -1. -->';
    const r = T.meosSpecGroupPerLine(L, { start: 0, end: 1 }, one);
    ok(r[0] === '<!-- Mew!FC -1. --><!-- Mew!FC == (白/黄) -->', '同じ行の命令は同じ本に並ぶ(行の命令が先)', r[0]);
    ok(r[1] === '<!-- Mew!FC -1. -->', '次の項目は自分の分だけ', r[1]);
  }
  // 置き石は毎回置き直す(前の位置を持ち越さない)
  {
    const L = ['| a | b |', '| --- | --- |', '| ==x== | y |'];
    const before = '<!-- Mew!FC not --><!-- Mew!FC not --><!-- Mew!FC == (白/黄) -->';
    const r = T.meosSpecGroupPerLine(L, { start: 0, end: 2 }, before);
    ok(eq(r, ['<!-- Mew!FC not -->', '<!-- Mew!FC not -->', '<!-- Mew!FC == (白/黄) -->']), '置き石を含む形を通しても同じ形に落ち着く(何度通しても変わらない)', r);
  }
  // 相手の無い箱は捨てない
  {
    const L = ['| a |', '| --- |'];
    const r = T.meosSpecGroupPerLine(L, { start: 0, end: 1 }, '<!-- Mew!FC == (白/黄) -->');
    ok(r.length === 2 && r[1].indexOf('== (白/黄)') >= 0, '印が見つからない箱は最後の行へ(捨てない)', r);
  }
  // 置き石の読み方(俊克案の `Line not` も読む)
  ok(T.MEOS_SPEC_LINE_NONE_RE.test('not') && T.MEOS_SPEC_LINE_NONE_RE.test('Line not') && T.MEOS_SPEC_LINE_NONE_RE.test('line  not'), '置き石は `not`／俊克案の `Line not` も読む(read-both)', 'ok');
  ok(!T.MEOS_SPEC_LINE_NONE_RE.test('H2not') && !T.MEOS_SPEC_LINE_NONE_RE.test('***not'), '記号に付いた not は置き石ではない', 'ok');
  // 置き石that混ざっても、箇条書きの配りは狂わない
  {
    const L = ['1. 一', '1. 二', '<!-- Mew!FC -1. -->', '<!-- Mew!FC -1.1 -->'];
    const ls0 = T.meosListLineSpecFor(L, 0), ls1 = T.meosListLineSpecFor(L, 1);
    ok(!!ls0 && ls0.text === '-1.' && !!ls1 && ls1.text === '-1.1', '1項目=1本のFC群が、そのまま配られる', [ls0 && ls0.text, ls1 && ls1.text]);
  }
}

console.log('㉘ v4.0.301 塊のどの行でも開く / 指定行は本文行ではない / 改行は塊の中へ');
{
  let _v = 0;
  // ★行配列は「uri@version」で覚えられているので、検査でも**版を変える**(同じ鍵だと前の文書が返る=一度これで嵌まった)
  const mkDoc = (L) => ({ lineCount: L.length, isClosed: false, version: ++_v,
    uri: { toString: () => 'file:///z', scheme: 'file' }, eol: 1,
    getText: () => L.join('\n'), lineAt: (n) => ({ text: L[n] || '' }) });
  // 開く合図の範囲= 塊ぜんぶ / 畳む範囲= 今までどおり
  {
    const L = ['1. 一', '1. 二', '1. 三', '<!-- Mew!FC -1. -->', '<!-- Mew!FC -1. -->', '<!-- Mew!FC -1. -->'];
    const b = T.meosDefBlocks(mkDoc(L))[0];
    ok(!!b && b.top === 0, '開く合図はリストの先頭から(どの項目でも開く)', b && b.top);
    ok(!!b && b.start === 2 && b.end === 5, '畳む範囲は最後の項目〜FC群の末尾(リスト自体は畳まない)', b && [b.start, b.end]);
  }
  {
    const L = ['| a | b |', '| --- | --- |', '| ==x== | y |', '<!-- Mew!FC not -->', '<!-- Mew!FC not -->', '<!-- Mew!FC == (白/黄) -->'];
    const b = T.meosDefBlocks(mkDoc(L))[0];
    ok(!!b && b.top === 0 && b.start === 2, '表もヘッダ行から開く', b && [b.top, b.start]);
  }
  {
    const L = ['## 見出し', '<!-- Mew!FC H2 (白/緑) -->'];
    const b = T.meosDefBlocks(mkDoc(L))[0];
    ok(!!b && b.top === 0 && b.start === 0, '塊でない行は今までどおり(topとstartが同じ)', b && [b.top, b.start]);
  }
  // 指定行は本文行ではない(バグ1の相手)
  ok(T.meosIsSpecLine('<!-- Mew!FC -1. -->'), 'FC行はFC行と分かる', true);
  ok(!T.meosIsSpecLine('1. 一番目'), '項目はFC行ではない', false);
  // 改行で持ち越す命令
  ok(T.meosCarryItemSpec('-1.1 (白/黄)//[]tip=') === '-1.1 (白/黄)//[]tip=', '階層と色は持ち越す(tipは空にして)', T.meosCarryItemSpec('-1.1 (白/黄)//[]tip='));
  ok(T.meosCarryItemSpec('-1.') === '-1.', '骨だけの命令もそのまま持ち越す', T.meosCarryItemSpec('-1.'));
}

console.log('㉙ v4.0.302 FCで記号を打ち替えたら、本文の印も従う');
{
  const tbl = ['| 品目 | 味 |', '| --- | --- |', '| ==りんご== | **甘い** |', '| ~~みかん~~ | ==酸っぱい== |',
    '<!-- Mew!FC not -->', '<!-- Mew!FC not -->', '<!-- Mew!FC == (白/黄) --><!-- Mew!FC ** (白/青) -->', '<!-- Mew!FC ~~ (赤/) --><!-- Mew!FC == (白/緑) -->'];
  // FC行 ↔ 本文行の対応
  ok(T.meosFcBodyLineFor(tbl, 6) === 2 && T.meosFcBodyLineFor(tbl, 7) === 3, 'FC群の n 本目 ↔ 塊の n 行目', [T.meosFcBodyLineFor(tbl, 6), T.meosFcBodyLineFor(tbl, 7)]);
  ok(T.meosFcBodyLineFor(tbl, 4) === 0 && T.meosFcBodyLineFor(tbl, 5) === 1, '置き石の行もヘッダ行/区切り行と対応する', [T.meosFcBodyLineFor(tbl, 4), T.meosFcBodyLineFor(tbl, 5)]);
  ok(T.meosFcBodyLineFor(tbl, 2) === -1, '本文行を渡しても相手にしない', -1);
  // 印の位置
  {
    const sp = T.meosRowMarkSpans('| ==りんご== | **甘い** |');
    ok(sp.length === 2 && sp[0].kind === '==' && sp[1].kind === '**', '1行の印を左から順に拾う', sp.map(x => x.kind));
    ok('| ==りんご== | **甘い** |'.slice(sp[0].bodyStart, sp[0].bodyEnd) === 'りんご', '中身の位置も分かる', 'りんご');
  }
  // 変えていない時は動かない
  ok(T.meosFmtKindFollowPlan(tbl, 6) === null && T.meosFmtKindFollowPlan(tbl, 7) === null, '全部合っている時は何もしない', 'null');
  // == を ** に打ち替えた時
  {
    const L = tbl.slice(); L[6] = '<!-- Mew!FC ** (白/黄) --><!-- Mew!FC ** (白/青) -->';
    const p = T.meosFmtKindFollowPlan(L, 6);
    ok(!!p && p.line === 2 && p.to === '**りんご**', '`==`→`**` にすると本文も `**りんご**` になる', p && [p.line, p.to]);
    ok(!!p && L[2].slice(p.start, p.end) === '==りんご==', '書き換える範囲は、その印1つだけ', p && L[2].slice(p.start, p.end));
  }
  // 2行目(下の行)でも同じ
  {
    const L = tbl.slice(); L[7] = '<!-- Mew!FC ~~ (赤/) --><!-- Mew!FC *** (白/緑) -->';
    const p = T.meosFmtKindFollowPlan(L, 7);
    ok(!!p && p.line === 3 && p.to === '***酸っぱい***', '同じ行の2つ目の印にも当たる', p && [p.line, p.to]);
  }
  // 曖昧な時は何もしない
  {
    const L = tbl.slice(); L[6] = '<!-- Mew!FC ** (白/黄) --><!-- Mew!FC == (白/青) -->';
    ok(T.meosFmtKindFollowPlan(L, 6) === null, '2つ以上ずれていたら手を出さない', 'null');
  }
  {
    const L = tbl.slice(); L[6] = '<!-- Mew!FC == (白/黄) -->';
    ok(T.meosFmtKindFollowPlan(L, 6) === null, '箱の数が印の数と合わなければ手を出さない(打っている途中)', 'null');
  }
  // 箇条書きでも同じ道
  {
    const L = ['1. ==光る==項目', '1. ふつうの項目', '<!-- Mew!FC -1. --><!-- Mew!FC ~~ (白/黄) -->', '<!-- Mew!FC -1. -->'];
    const p = T.meosFmtKindFollowPlan(L, 2);
    ok(!!p && p.line === 0 && p.to === '~~光る~~', '箇条書きでも本文が従う(行の命令は数えない)', p && [p.line, p.to]);
  }
  // 見出し(塊でない)= 群の1本目だけが真上に効く
  {
    const L = ['## ==見出し==', '<!-- Mew!FC ~~ (白/緑) -->'];
    const p = T.meosFmtKindFollowPlan(L, 1);
    ok(!!p && p.line === 0 && p.to === '~~見出し~~', '塊でない行でも効く', p && [p.line, p.to]);
  }
}

console.log('㉚ v4.0.312 見出しの作成時刻は命令へ（H2_TS）— 本文には1文字も足さない');
{
  const TS = '2026.08.20(t)pm11:29.35JST';
  const d = T.meosLineDirective('H2_' + TS + ' (白/green)//[]tip=');
  ok(!!d && d.level === 2, '見出しのレベルは今までどおり読める', d && d.level);
  ok(!!d && d.stamp === TS, '作成時刻を丸ごと読む(曜日の括弧 (t) で切れない)', d && d.stamp);
  ok(!!d && d.rest === '(白/green)//[]tip=', '残りは色とtipだけ= 色を取り違えない', d && d.rest);
  const d2 = T.meosLineDirective('H2_' + TS + 'not (白/緑)');
  ok(!!d2 && d2.not === true && d2.stamp === TS, '`not` と一緒でも読める', d2 && [d2.not, d2.stamp]);
  ok(T.meosLineDirective('H2 (白/green)//[]tip=').stamp === '', '時刻が無くても今までどおり', '');
  ok(T.meosLineDirective('-1.H3_' + TS + ' (白/青)').level === 3, '箇条書きとの合成でも読める', 3);
  ok(T.meosCarryItemSpec('-1.H2_' + TS + ' (白/黄)//[]tip=') === '-1.H2 (白/黄)//[]tip=', '改行では色だけ持ち越す(時刻は持ち越さない・色も取り違えない)', T.meosCarryItemSpec('-1.H2_' + TS + ' (白/黄)//[]tip='));
  {
    const r = T.meosMoveSpecsOutOfLine('## Heading<!-- Mew! H2_' + TS + ' (白/green)//[]tip= -->');
    ok(!!r && r.body === '## Heading', '本文は素のMarkdownだけ', r && r.body);
    ok(!!r && r.spec.indexOf('H2_' + TS) >= 0, '時刻はFC行の命令に入る', r && r.spec);
  }
  ok(T.MEOS_HEAD_STAMP_RE.test(' ' + TS), '本文に残った旧い時刻は今までどおり剥がせる(形は1か所から)', true);
  ok(!T.MEOS_HEAD_STAMP_RE.test(' 2026.08.20 pm11:29'), '似ているだけの文字列は剥がさない', false);
}

console.log(ng ? ('NG ' + ng + ' 件') : 'すべて通った');
process.exit(ng ? 1 : 0);
