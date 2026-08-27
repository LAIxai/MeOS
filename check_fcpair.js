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
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meDockModeForEditor, isCursorOnMembraneLine, currentMembranePairForRename, meosPairBlockEnd, foldRangeEnd, collectPairs, meosIsPairBadgeSpec, meosRestampMembraneBlock, findCurrentPair, findNewMembraneOpenerLineAfterInsert, meosRestampNameForCreate, meosMembraneStamp, meosFcMarkPairRanges, meosFcMate, meosSpecPayloadKind, meosRowMarksInOrder, parseColorSpec, DARK_BG_KEYS, HIGHLIGHT_COLORS, meosTableBlockFor, meosSpecGroupPerLine, meosInsertIntoSpecLine, meosSpecLineGridOrder, MEOS_SPEC_LINE_ONE_RE, MEOS_SPEC_LINE_NONE_RE, meosMeTexTokens, meosConvertLegacyLine, meosLegacyHits, meosFcSplitForLine, meosInlineHeadHit, wrapInsertedMembraneBlock, membraneCommentTemplateForLanguage, meosLegacyPairBadgeHit, meosLegacyPairBadgeFix, refreshTrailingTimestamp, MEOS_NAME_TS_RE, copyMe, duplicateMe, shedCurrentMembrane, copyMyContents, meosParseSpecLine, meosFcFmtIsGhost, meosFcFmtIsNot, meosFcFmtInner, meosMoveSpecsOutOfLine, warningHoverMessage, selectDisplayedWarnings, meosWarningEnds };\n', 'utf8');
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
  ok((T.findCurrentPair(mkEd(FC, 3, 5)) || {}).id === NAME, 'FC行に居れば、その膜が「今の膜」', T.findCurrentPair(mkEd(FC, 3, 5)));
}
console.log('⑤ 巻き添えが無いこと — 膜のバッジでないFC行は膜と認めない');
{
  const L = ['## 見出し', '<!-- Mew!FC H2 (白/赤)//[]tip= -->', '本文'];
  const ed = mkEd(L, 1, 10);
  ok(!T.isCursorOnMembraneLine(ed), '見出しのFC行は膜の行でない', true);
  ok(T.meDockModeForEditor(ed).mode === 'new', 'mode=new のまま', T.meDockModeForEditor(ed).mode);
  const L2 = ['ただの段落', '<!-- Mew!FC mCN (📊⊕0+0D0W) -->'];
  ok(T.findCurrentPair(mkEd(L2, 1, 5)) === null, '膜が無ければ「今の膜」も無い(名前は空)', T.findCurrentPair(mkEd(L2, 1, 5)));
  ok(T.meDockModeForEditor(mkEd(L2, 1, 5)).value === '', '持ち主の居ないバッジ行では名前を出さない', T.meDockModeForEditor(mkEd(L2, 1, 5)).value);
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
  ok((T.findCurrentPair(mkEd(L, 4, 5)) || {}).id === NAME, '2本目のFC行でも同じ膜', T.findCurrentPair(mkEd(L, 4, 5)));
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

console.log('⑮ Copy は膜名のTSだけを今の時刻に打ち直す(人が付けた部分は不変・対は揃う)');
{
  const ed = mkEdEdit(BODY, 0, 20);
  CLIP = '';
  T.copyMe(ed);
  const out = CLIP.split('\n');
  const openId = /▼mCN=([^ ]+) /.exec(out[0])[1];
  const closeId = /▲mCN=([^ ]+) /.exec(out[3])[1];
  ok(openId !== NAME, '元と同じ名前ではない', openId);
  ok(openId.indexOf('テスト膜2_') === 0, '人が付けた部分は不変', openId);
  ok(openId === closeId, '開き膜と閉じ膜が同じ新しい名前', [openId, closeId]);
  ok(T.MEOS_NAME_TS_RE.test(openId), '末尾は正しいTS', openId);
  ok(ed.__lines.join('\n') === BODY.join('\n'), '元の文書は1文字も変わらない', ed.__lines);
}
console.log('⑯ Duplicate も同じ(元は不変・複製だけ新しい名前)');
{
  const ed = mkEdEdit(BODY, 0, 20);
  T.duplicateMe(ed);
  const out = ed.__lines;
  ok(/▼mCN=テスト膜2_20260823S093551JST /.test(out[0]), '元の膜はそのまま', out[0]);
  const dupOpen = /▼mCN=([^ ]+) /.exec(out[5])[1];
  const dupClose = /▲mCN=([^ ]+) /.exec(out[8])[1];
  ok(dupOpen !== NAME && dupOpen === dupClose, '複製は別の名前で対が揃う', [dupOpen, dupClose]);
}
console.log('⑰ 入れ子の膜も全部打ち直し、同じ名前どうしは別のTSになる');
{
  const IN = [
    '<!-- {* ▼mCN=親_20260823S090000JST // p *} -->',
    '<!-- {* ▼mCN=子_20260823S090100JST // a *} -->',
    '<!-- {* ▲mCN=子_20260823S090100JST // a *} -->',
    '<!-- {* ▼mCN=子_20260823S090200JST // b *} -->',
    '<!-- {* ▲mCN=子_20260823S090200JST // b *} -->',
    '<!-- {* ▲mCN=親_20260823S090000JST // p *} -->',
  ];
  const out = T.meosRestampMembraneBlock(IN);
  const ids = out.map(t => (/[▼▲]mCN=([^ ]+) /.exec(t) || [])[1]);
  ok(ids[0] === ids[5] && ids[1] === ids[2] && ids[3] === ids[4], '3つの対が全部揃う', ids);
  ok(new Set([ids[0], ids[1], ids[3]]).size === 3, '3つとも別の名前', [ids[0], ids[1], ids[3]]);
  ok(ids[1] !== ids[3], '同名の子2つが衝突しない(1秒ずらす)', [ids[1], ids[3]]);
  ok(IN[0].indexOf('090000') > 0, '入力側の配列は壊さない', IN[0]);
}
console.log('⑱ TSが無い名前・不完全なTSには、フルスペックのTSを付ける(v4.0.384 俊克)');
{
  const L = ['<!-- {* ▼mCN=0866_INLINE_NEW_RENAME // x *} -->', '本文', '<!-- {* ▲mCN=0866_INLINE_NEW_RENAME // end *} -->'];
  const out = T.meosRestampMembraneBlock(L);
  const o = /▼mCN=([^ ]+) /.exec(out[0])[1], c = /▲mCN=([^ ]+) /.exec(out[2])[1];
  ok(o.indexOf('0866_INLINE_NEW_RENAME_') === 0, '人が付けた名前はそのまま残る', o);
  ok(T.MEOS_NAME_TS_RE.test(o), 'フルスペックのTSが付く', o);
  ok(o === c, '対は揃う', [o, c]);
  ok(L[0].indexOf('0866_INLINE_NEW_RENAME //') > 0, '入力側は壊さない(元の膜は不変)', L[0]);
}
console.log('⑱b 不完全なTS(年が無い旧形)はフルスペックへ入れ替わる');
{
  const L = ['<!-- {* ▼mCN=表_143052.J07 // x *} -->', '<!-- {* ▲mCN=表_143052.J07 // end *} -->'];
  const out = T.meosRestampMembraneBlock(L);
  const o = /▼mCN=([^ ]+) /.exec(out[0])[1];
  ok(o.indexOf('表_') === 0 && !/143052/.test(o), '旧形のTSは残らない', o);
  ok(T.MEOS_NAME_TS_RE.test(o) && /\d{8}[SMTWtFs]\d{6}/.test(o), '年月日+曜日+時刻の完全形', o);
}
console.log('⑱c 日付だけの不完全な完全形も、時刻まで入る');
{
  const L = ['<!-- {* ▼mCN=日記_20260623T // x *} -->', '<!-- {* ▲mCN=日記_20260623T // end *} -->'];
  const o = /▼mCN=([^ ]+) /.exec(T.meosRestampMembraneBlock(L)[0])[1];
  ok(/^日記_\d{8}[SMTWtFs]\d{6}[A-Z]{0,5}$/.test(o), '時刻とTZまで揃う', o);
}
console.log('⑲ 膜が1つも無いテキストはそのまま返す');
{
  const L = ['本文A', '<!-- Mew!FC H2 (白/赤) -->', '本文B'];
  ok(T.meosRestampMembraneBlock(L).join('\n') === L.join('\n'), '素通り', T.meosRestampMembraneBlock(L));
}

console.log('⑳ 🐱が旧形の膜(▼行にバッジ)を捕まえ、閉じ膜の下のFC行へ出す(v4.0.385 俊克)');
{
  const L = [
    '<!-- {* ▼mCN=' + NAME + ' // comment1 (📊⊕0+0D-2Y) *} -->',
    '本文A',
    '<!-- {* ▲mCN=' + NAME + ' // comment2 *} -->',
    '外の行',
  ];
  const doc = makeDoc(L);
  const hit = T.meosLegacyPairBadgeHit(doc, 0);
  ok(!!hit, '旧形の膜を捕まえる', hit);
  ok(T.meosLegacyPairBadgeHit(doc, 1) === null && T.meosLegacyPairBadgeHit(doc, 2) === null, '本文と閉じ膜は捕まえない', true);
  const fix = T.meosLegacyPairBadgeFix(doc, hit);
  ok(fix.openNext === '<!-- {* ▼mCN=' + NAME + ' // comment1 *} -->', '▼行からバッジだけ落ちる', fix.openNext);
  ok(fix.closeLn === 2, '置き場所は閉じ膜の行の下', fix.closeLn);
  ok(fix.fcLine === '<!-- Mew!FC mCN (📊⊕0+0D-2Y) -->', '膜を作る時と同じ形のFC行', fix.fcLine);
}
console.log('㉑ 直した後の膜は、新形として最初から読める(捕まえ直さない)');
{
  const AFTER = [
    '<!-- {* ▼mCN=' + NAME + ' // comment1 *} -->',
    '本文A',
    '<!-- {* ▲mCN=' + NAME + ' // comment2 *} -->',
    '<!-- Mew!FC mCN (📊⊕0+0D-2Y) -->',
  ];
  const doc = makeDoc(AFTER);
  ok(T.meosLegacyPairBadgeHit(doc, 0) === null, '2度目は捕まえない(🐱が消える)', T.meosLegacyPairBadgeHit(doc, 0));
  const pair = T.collectPairs(doc, { excludeIndex: false })[0];
  ok(T.meosPairBlockEnd(doc, pair) === 3, '塊はFC行まで', T.meosPairBlockEnd(doc, pair));
}
console.log('㉒ 手を出さない所 — ▼行にバッジが在っても、既にFC行を持つ膜は触らない');
{
  const L = [
    '<!-- {* ▼mCN=' + NAME + ' // c1 (📊⊕0+0D0W) *} -->', '本文', '<!-- {* ▲mCN=' + NAME + ' // c2 *} -->',
    '<!-- Mew!FC mCN (📊⊕0+0D0W) -->',
  ];
  ok(T.meosLegacyPairBadgeHit(makeDoc(L), 0) === null, '2本目を足さない', T.meosLegacyPairBadgeHit(makeDoc(L), 0));
}
console.log('㉓ 手を出さない所 — mTC/mNT と、対になっていない膜行');
{
  const TC = ['<!-- {* ▼mTC=目次_20260823S090000JST // t (📊⊕0+0D0W) *} -->', '<!-- {* ▲mTC=目次_20260823S090000JST // t *} -->'];
  ok(T.meosLegacyPairBadgeHit(makeDoc(TC), 0) === null, 'mTCは対象外', T.meosLegacyPairBadgeHit(makeDoc(TC), 0));
  const OR = ['<!-- {* ▼mCN=' + NAME + ' // c1 (📊⊕0+0D0W) *} -->', '本文だけで閉じ膜が無い'];
  ok(T.meosLegacyPairBadgeHit(makeDoc(OR), 0) === null, '対になっていなければ触らない', T.meosLegacyPairBadgeHit(makeDoc(OR), 0));
  const PLAIN = ['ただの行 (📊⊕0+0D0W) と書いただけ'];
  ok(T.meosLegacyPairBadgeHit(makeDoc(PLAIN), 0) === null, '膜行でなければ触らない', T.meosLegacyPairBadgeHit(makeDoc(PLAIN), 0));
}
console.log('㉔ コメントが無い膜でも、余分な空白を残さない');
{
  const L = ['<!-- {* ▼mCN=' + NAME + ' (📊⊕0+0D0W) *} -->', '本文', '<!-- {* ▲mCN=' + NAME + ' *} -->'];
  const doc = makeDoc(L);
  const fix = T.meosLegacyPairBadgeFix(doc, T.meosLegacyPairBadgeHit(doc, 0));
  ok(fix.openNext === '<!-- {* ▼mCN=' + NAME + ' *} -->', '二重空白にならない', fix.openNext);
}

console.log('㉕ 2つの編集を実際に当てると、膜を作った時と同じ姿になる');
{
  const L = [
    '<!-- {* ▼mCN=' + NAME + ' // comment1 (📊⊕0+0D-2Y) *} -->', '本文A', '<!-- {* ▲mCN=' + NAME + ' // comment2 *} -->', '外の行',
  ];
  const ed = mkEdEdit(L, 0, 0);
  const fix = T.meosLegacyPairBadgeFix(ed.document, T.meosLegacyPairBadgeHit(ed.document, 0));
  ed.edit((eb) => {
    eb.replace(new stub.Range(fix.openLn, 0, fix.openLn, fix.openText.length), fix.openNext);
    eb.insert(new stub.Position(fix.closeLn, fix.closeText.length), '\n' + fix.fcLine);
  });
  const want = [
    '<!-- {* ▼mCN=' + NAME + ' // comment1 *} -->', '本文A', '<!-- {* ▲mCN=' + NAME + ' // comment2 *} -->',
    '<!-- Mew!FC mCN (📊⊕0+0D-2Y) -->', '外の行',
  ];
  ok(ed.__lines.join('\n') === want.join('\n'), '新形の膜になる', ed.__lines);
  const doc2 = makeDoc(ed.__lines);
  ok((T.findCurrentPair(mkEd(ed.__lines, 3, 5)) || {}).id === NAME, 'FC行に居れば、その膜が「今の膜」', T.findCurrentPair(mkEd(ed.__lines, 3, 5)));
  ok(T.meosLegacyPairBadgeHit(doc2, 0) === null, '🐱はもう鳴かない', true);
}

console.log('㉖ Create の後、カーソルが乗るのは開始膜の行(v4.0.388 俊克 バグ1)');
{
  // 実物と同じ道具で「Createが書く物」を組み立て、書いた後の文書から開始膜の行を探す。
  const ID = 'テスト膜#1_20260823S114440JST';
  const tpl = T.membraneCommentTemplateForLanguage('markdown', ID, '', 'W', 0);
  const mk = (before) => {
    const doc0 = makeDoc(before.slice());
    const startLine = before.length - 1;                       // 末尾の空行にカーソルが居る
    const block = tpl.open + '\n\n' + '' + '\n\n' + tpl.close;
    const wrapped = T.wrapInsertedMembraneBlock(doc0, startLine, startLine, block);
    const out = before.slice(0, startLine).concat(wrapped.split('\n'), before.slice(startLine + 1));
    return { out, startLine };
  };
  // (a) 1つ上が空行= 前に空行を足さない → 開始膜は startLine のまま(俊克の実機と同じ形)
  {
    const r = mk(['本文', '', '']);
    const at = T.findNewMembraneOpenerLineAfterInsert(makeDoc(r.out), ID, r.startLine);
    ok(r.out[at].indexOf('▼mCN=' + ID) > 0, '探して当てる= 開始膜の行', [at, r.out[at]]);
    ok(at === r.startLine, '★この形では +1 ではない(旧コードのずれ)', [at, r.startLine]);
    ok(T.meDockModeForEditor(mkEd(r.out, at, 20)).value === ID, 'その行で Edit Me は膜名を出す', T.meDockModeForEditor(mkEd(r.out, at, 20)).value);
    ok(T.meDockModeForEditor(mkEd(r.out, r.startLine + 1, 0)).mode === 'new', '1行下は New Me(俊克の見た画面)', true);
  }
  // (b) 1つ上が本文= 前に空行を1本足す → 開始膜は startLine+1(こちらは +1 が正しい)
  {
    const r = mk(['本文', '']);
    const at = T.findNewMembraneOpenerLineAfterInsert(makeDoc(r.out), ID, r.startLine);
    ok(r.out[at].indexOf('▼mCN=' + ID) > 0, '空行を足した時も、探して当てる', [at, r.out[at]]);
    ok(T.meDockModeForEditor(mkEd(r.out, at, 20)).value === ID, 'その行で Edit Me は膜名を出す', true);
  }
  ok(T.findNewMembraneOpenerLineAfterInsert(makeDoc(['本文', 'ただの行']), ID, 0) === 0, '見つからない時は近い行を返す(落ちない)', true);
}

console.log('㉗ Create を押した瞬間の時刻で刻む(v4.0.389 俊克 バグ1)');
{
  const old = 'name_20260823S090000JST';                     // しばらく前に入力欄に出た値
  const now = T.meosRestampNameForCreate(old);
  ok(now !== old, '古い時刻のままにしない', now);
  ok(/^name_\d{8}[SMTWtFs]\d{6}[A-Z]{0,5}$/.test(now), '完全形のTSが付く', now);
  ok(now.slice(0, 5) === 'name_', '人が付けた部分は不変', now);
  const mine = T.meosRestampNameForCreate('テスト膜#1_20260823S090000JST');
  ok(mine.indexOf('テスト膜#1_') === 0 && !/090000/.test(mine), '自分で付けた名前でもTSだけ入れ替わる', mine);
  ok(T.meosRestampNameForCreate('0866_INLINE_NEW_RENAME') === '0866_INLINE_NEW_RENAME', '★TSが無い名前には生やさない(付けるのはコピーの時だけ)', T.meosRestampNameForCreate('0866_INLINE_NEW_RENAME'));
  ok(T.meosRestampNameForCreate('') === '', '空はそのまま(既定名の生成に任せる)', true);
}

console.log('㉘ 旧記法は🐱1回でFC形まで行く(v4.0.390 俊克 バグ1)');
{
  // 🐱ボタンと同じ順で1行を処理する(旧記法→新形→外へ出せるならFC行へ)。
  const press = (line, next) => {
    if (!T.meosLegacyHits(line).length) return null;
    const nt = T.meosConvertLegacyLine(line);
    if (nt == null || nt === line) return null;
    const fc = T.meosFcSplitForLine(nt, next == null ? null : next);
    return fc ? { body: fc.body, spec: fc.spec } : { body: nt, spec: null };
  };
  const hi = press('これは =={旧ハイライト (白/黄)//tip}== を含む行です。', '');
  ok(hi && hi.spec !== null, '★ハイライトもFC形になる(見出しだけではない)', hi);
  ok(hi.body === 'これは ==旧ハイライト== を含む行です。', '本文は素のMarkdownだけ', hi.body);
  ok(hi.spec === '<!-- Mew!FC == (白/黄)//tip -->', '指定はFC行へ', hi.spec);
  const bo = press('これは **{旧太字 (白/緑)}** を含む行です。', '');
  ok(bo && bo.spec === '<!-- Mew!FC ** (白/緑) -->', '★太字もFC形になる', bo);
  const hd = press('##[ 旧見出し (白/赤)//tip ]##', '');
  ok(hd && hd.body === '## 旧見出し' && hd.spec === '<!-- Mew!FC H2 (白/赤)//tip -->', '見出しは今まで通り', hd);
  // 1回で終わっている= 直した後の行に、もう🐱の仕事が残っていない
  for (const r of [hi, bo, hd]) {
    ok(!T.meosLegacyHits(r.body).length && !T.meosInlineHeadHit(r.body, r.spec), '★2回目に残る仕事が無い', r.body);
  }
}
console.log('㉙ 外へ出せない行は、今までどおり行末に残す(v4.0.192「置ける行はFC・表の途中は行末」)');
{
  ok(T.meosFcSplitForLine('| **セル** |<!-- Mew! ** (白/黄) -->', '') === null, '表の行には足さない', T.meosFcSplitForLine('| **セル** |<!-- Mew! ** (白/黄) -->', ''));
  ok(T.meosFcSplitForLine('本文<!-- Mew! ** (白/黄) -->', '<!-- Mew!FC == (白/黄) -->') === null, '真下に既に指定行がある行は触らない', true);
  ok(T.meosFcSplitForLine('<!-- Mew!FC H2 (白/赤) -->', '') === null, '指定行そのものは対象外', true);
  ok(T.meosFcSplitForLine('ただの本文', '') === null, '出す指定が無ければ何もしない', true);
}

console.log('㉚ 上付きの土台 — 数えるのをやめて形で決める(v4.0.391 俊克「一般的な^に制限はない」)');
{
  const sup = (t) => (T.meosMeTexTokens(t, false) || []).length > 0;
  ok(sup('🐱↑3'), '★絵文字も土台になる(俊克の困りごと)', sup('🐱↑3'));
  ok(sup('🐱↓3'), '★下付きも同じ', sup('🐱↓3'));
  ok(sup('x↑2') && sup('A↑B') && sup('(a+b)↑2'), '今までの土台はそのまま', [sup('x↑2'), sup('A↑B'), sup('(a+b)↑2')]);
  ok(sup('∫↑2'), '大きな演算子もそのまま(v4.0.283)', sup('∫↑2'));
  ok(sup('あ↑2'), '日本語の字も土台になる', sup('あ↑2'));
  // 実データで測った「本当に困る29件」の形＝土台が無い所に書いた矢印
  ok(!sup('- ↑OKならコミット'), '★空白の後の矢印は上付きにしない', sup('- ↑OKならコミット'));
  ok(!sup('↑(minus) → 前の開始膜'), '★行頭の矢印は上付きにしない', sup('↑(minus) → 前の開始膜'));
  // ★v4.0.392(俊克「1つ制限があると、何が制限があるのかを覚えないと行けない」): 句読点・開き括弧は
  //   私が数え上げた例外so撤去。止めたい時は not で名乗る(H2not/***not/↑not と同じ言葉)。
  ok(sup('、↑3割の伸び'), '句読点も土台になる(例外の列挙をやめた)', sup('、↑3割の伸び'));
  ok(sup('「↑2」と書く'), '開き括弧も同じ', sup('「↑2」と書く'));
  ok(!sup('気温↑ です'), '土台が在っても、後ろに何も無ければ何も起きない', sup('気温↑ です'));
  ok(!sup('`🐱↑3`'), 'コードスパンの中は今までどおり触らない(v4.0.58)', sup('`🐱↑3`'));
}

console.log('㉛ 表に修飾を付けると、FC群が折り返しの数だけ並ぶ(v4.0.398 俊克)');
{
  // meosWriteMarkAndSpec と同じ手順を、実物の道具で組み立てる。
  const strip = (t) => { let o = ''; T.MEOS_SPEC_LINE_ONE_RE.lastIndex = 0; let m;
    while ((m = T.MEOS_SPEC_LINE_ONE_RE.exec(String(t || ''))) !== null) { const p = (m[2] || '').trim(); if (p && !T.MEOS_SPEC_LINE_NONE_RE.test(p)) o += m[0]; } return o; };
  const put = (body, cur, payload, idx) => { const b = T.meosTableBlockFor(body, 2);
    return T.meosSpecGroupPerLine(body, b, T.meosSpecLineGridOrder(body, b, T.meosInsertIntoSpecLine(strip(cur), payload, idx))); };
  // 素の表 →「りんご」(折り返し3)にハイライト
  const P1 = ['| 品目   | 備考  |', '| ----- | ----- |', '| **りんご** | みかん |', '| ぶどう | もも   |'];
  const r1 = put(P1, '', '**not (白/黄)', 0);
  ok(r1.length === 4, '★折り返しの数だけFC行が並ぶ(1本にならない)', r1.length);
  ok(/not -->$/.test(r1[0]) && /not -->$/.test(r1[1]), '★折り返し1と2に置き石が入る(俊克の指摘)', [r1[0], r1[1]]);
  ok(/\*\*not \(白\/黄\)/.test(r1[2]), '3本目が「りんご」の指定', r1[2]);
  // 続けて「ぶどう」(折り返し4)にも
  const P2 = ['| 品目   | 備考  |', '| ----- | ----- |', '| **りんご** | みかん |', '| **ぶどう** | もも   |'];
  const r2 = put(P2, r1.join(''), '** (白/青)', 1);
  ok(/\*\*not \(白\/黄\)/.test(r2[2]) && /\*\* \(白\/青\)/.test(r2[3]), '★2つ目を足しても入れ替わらない(置き石を数えない)', [r2[2], r2[3]]);
  ok(r2.length === 4 && /not -->$/.test(r2[0]) && /not -->$/.test(r2[1]), '置き石は残る', r2);
  // 折り返し1に入れた時も同じ(ここだけで確かめると誤解する=俊克の指摘)
  const P3 = ['| **品目**   | 備考  |', '| ----- | ----- |', '| りんご | みかん |', '| ぶどう | もも   |'];
  const r3 = put(P3, '', '**not (白/黄)', 0);
  ok(/\*\*not/.test(r3[0]) && r3.length === 4, '折り返し1でも4本(偶然合っていた道も同じ形に)', r3);
}

console.log('㉜ 段落は「印1つ ⇄ FC1個」で橙(v4.0.401 俊克)');
{
  const P = ['**りんご**を食べて、~~みかん~~も食べなかった。--------[***ぶどう***]()とももも',
    '<!-- Mew!FC **not (白/黄) -->', '<!-- Mew!FC ~~ (赤/紺) -->', '<!-- Mew!FC [***]()(3)(白/紫)//[]tip= -->'];
  const d = makeDoc(P);
  const seg = (r, i) => P[r[i].start.line].slice(r[i].start.character, r[i].end.character);
  const at = (ln, ch) => T.meosFcMarkPairRanges(d, ln, ch);
  const hi = at(0, 2);
  ok(!!hi && seg(hi, 0) === '**りんご**' && /\*\*not/.test(seg(hi, 1)), '★ハイライト ⇄ 1本目', hi && [seg(hi, 0), seg(hi, 1)]);
  const st = at(0, P[0].indexOf('みかん') + 1);
  ok(!!st && seg(st, 0) === '~~みかん~~' && /~~ \(赤/.test(seg(st, 1)), '★取消線 ⇄ 2本目', st && [seg(st, 0), seg(st, 1)]);
  const lk = at(0, P[0].indexOf('ぶどう') + 1);
  ok(!!lk && seg(lk, 0) === '[***ぶどう***]()' && /\[\*\*\*\]\(\)/.test(seg(lk, 1)), '★リンク ⇄ 3本目', lk && [seg(lk, 0), seg(lk, 1)]);
  const back = at(3, 10);
  ok(!!back && seg(back, 0) === '[***ぶどう***]()', '★FC側から本文へも同じ対応(逆向き)', back && seg(back, 0));
  // ★v4.0.411(俊克)= 修飾の外では**何も橙にしない**(行ぜんぶを橙にするのは「表全部をオレンジ」と同じ論理矛盾)
  const _out = at(0, P[0].indexOf('食べて') + 1);
  ok(Array.isArray(_out) && _out.length === 0, '★修飾の外では何も橙にしない(v4.0.411)', _out);
  // 表は今までどおり「横一列どうし」= 細かくしない
  const TB = ['| 品目 | 備考 |', '| --- | --- |', '| **りんご** | みかん |', '<!-- Mew!FC not -->', '<!-- Mew!FC not -->', '<!-- Mew!FC **not (白/黄) -->'];
  ok(T.meosFcMarkPairRanges(makeDoc(TB), 2, 4) === null, '★表は横一列どうしのまま(俊克「表としては良い」)', true);
}

console.log('㉝ 段落のFC群は「1つの修飾＝1行」(v4.0.402 俊克)');
{
  const P = ['しううし**とんしう**といんしと~~とうかい~~てしんうとかい'];
  const blk = { start: 0, end: 0 };
  const spec = T.meosSpecLineGridOrder(P, blk, T.meosInsertIntoSpecLine('<!-- Mew!FC **not (白/黄) -->', '~~ (赤/紺)', 1));
  const r = T.meosSpecGroupPerLine(P, blk, spec);
  ok(r.length === 2, '★印2つ → FC行2本(1行にまとめない)', r);
  ok(/\*\*not/.test(r[0]) && /~~ \(赤/.test(r[1]), '順番は本文の印の順', r);
  ok((r[0].match(/<!--/g) || []).length === 1 && (r[1].match(/<!--/g) || []).length === 1, '1行に箱は1個', r);
  // 表は今までどおり(横一列に複数の印は1行のまま)
  const TB = ['| 品目 | 備考 |', '| --- | --- |', '| **りんご** | ~~みかん~~ |'];
  const rt = T.meosSpecGroupPerLine(TB, T.meosTableBlockFor(TB, 2), '<!-- Mew!FC **not (白/黄) --><!-- Mew!FC ~~ (赤/紺) -->');
  ok(rt.length === 3 && (rt[2].match(/<!--/g) || []).length === 2, '★表は横一列どうしのまま(俊克「表としては良い」)', rt);
  // 割っても 1:1 の橙は同じ相手を指す
  const P2 = P.concat(['<!-- Mew!FC **not (白/黄) -->', '<!-- Mew!FC ~~ (赤/紺) -->']);
  const d2 = makeDoc(P2);
  const g = T.meosFcMarkPairRanges(d2, 0, 6);
  ok(!!g && g[1].start.line === 1, '★1本目に割れていても、ハイライトは1本目を指す', g && g[1].start.line);
  const g2 = T.meosFcMarkPairRanges(d2, 0, P2[0].indexOf('とうかい') + 1);
  ok(!!g2 && g2[1].start.line === 2, '取消線は2本目', g2 && g2[1].start.line);
}
console.log('㉞ 橙はカーソルが動いた所で塗る(v4.0.402 改良2)');
{
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  const i = src.indexOf('meosUpdateInTableContext(e.textEditor);');
  const body = src.slice(Math.max(0, i - 400), i + 300);
  ok(/onDidChangeTextEditorSelection/.test(body) && /meosApplyFcRowDecorations\(e\.textEditor\)/.test(body), '★選択が変わった所で橙を塗り直す', body.slice(-220));
  ok(/meosApplyFcRowDecorations\(editor\)/.test(src), 'refresh からも今までどおり塗る(両方の口が在る)', true);
}

console.log('㉟ 段落では、本文1行とFC群ぜんぶが1つの組(v4.0.403 バグ1)');
{
  const P = ['見出し', 'しううし**とんしう**といんし~~とうかい~~てしん', '<!-- Mew!FC **not (白/黄) -->', '<!-- Mew!FC ~~ (赤/紺) -->', ''];
  const d = makeDoc(P);
  for (const [ln, lbl] of [[1, '本文'], [2, 'FC1本目'], [3, 'FC2本目']]) {
    const m = T.meosFcMate(d, ln);
    ok(!!m && JSON.stringify(m.lines) === '[1,2,3]', '★' + lbl + 'に居ても、橙は本文＋FC群ぜんぶ', m && m.lines);
  }
  // 表は今までどおり「i行目 ⇄ i本目」
  const TB = ['| a | b |', '| --- | --- |', '| **x** | y |', '<!-- Mew!FC not -->', '<!-- Mew!FC not -->', '<!-- Mew!FC **not (白/黄) -->'];
  const mt = T.meosFcMate(makeDoc(TB), 2);
  ok(!!mt && JSON.stringify(mt.lines) === '[2,5]', '★表は3行目 ⇄ FC3本目のまま', mt && mt.lines);
}
console.log('㊱ 橙は !important で塗る — 印自身の色に負けない(v4.0.403 バグ2)');
{
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  const i = src.indexOf('meosFcRowDeco = vscode.window.createTextEditorDecorationType');
  const body = src.slice(i, i + 240);
  ok(/!important/.test(body), '★橙に !important が付いている(v4.0.137の教訓・5度目)', body.slice(0, 160));
  ok(/textDecoration/.test(body), 'CSSを注ぐ口は textDecoration(MeOSの作法)', true);
}

console.log('㊲ プレーンのハイライトは「太字かつ斜体」の全否定(v4.0.404 俊克)');
{
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  const hits = src.match(/\(kind === 'highlight'\) \? '\*+'/g) || [];
  ok(hits.length === 2 && hits.every(h => /'\*\*\*'/.test(h)), '★書く場所は2つとも `***`(v4.0.246の教訓)', hits);
  const dirs = src.match(/\(kind === 'highlight'\) \? '\*+not'/g) || [];
  ok(dirs.length === 2 && dirs.every(h => /'\*\*\*not'/.test(h)), '★指定も2つとも `***not`(全否定)', dirs);
  // ★効き=ハイライト/太字/取消線が別の種類になり、待ち行列を取り合わない
  const kinds = T.meosRowMarksInOrder('あ***ハイライト***い**太字**う~~取消~~え').map(m => m.kind);
  ok(JSON.stringify(kinds) === '["***","**","~~"]', '★3つとも別の種類(前は ** を取り合っていた)', kinds);
  ok(T.meosSpecPayloadKind('***not (白/黄)') === '***' && T.meosSpecPayloadKind('** (白/青)') === '**', '指定の種類も分かれる', true);
  // 1:1 が正しく当たる
  const P = ['あ***ハイライト***い**太字**う~~取消~~え', '<!-- Mew!FC ***not (白/黄) -->', '<!-- Mew!FC ** (白/青) -->', '<!-- Mew!FC ~~ (赤/紺) -->', ''];
  const d = makeDoc(P);
  const seg = (r) => P[r[0].start.line].slice(r[0].start.character, r[0].end.character);
  ok(seg(T.meosFcMarkPairRanges(d, 0, 4)) === '***ハイライト***', 'ハイライト ⇄ 1本目', true);
  ok(T.meosFcMarkPairRanges(d, 0, P[0].indexOf('太字') + 1)[1].start.line === 2, '太字 ⇄ 2本目', true);
  ok(T.meosFcMarkPairRanges(d, 0, P[0].indexOf('取消') + 1)[1].start.line === 3, '取消線 ⇄ 3本目', true);
  // 過去の `**not` も読める(read-both)
  const O = ['あ**旧ハイライト**い', '<!-- Mew!FC **not (白/黄) -->', ''];
  ok(T.meosFcMarkPairRanges(makeDoc(O), 0, 4) !== null, '★過去の `**not` も今までどおり対応が取れる', true);
}

console.log('㊳ 素の ==…== は (黒/黄)・白い字が乗る黄は少し暗い黄(v4.0.406 俊克)');
{
  // 読む側の規則をそのまま当てる(素/指定あり の両方)
  const resolve = (spec) => { const hi = T.parseColorSpec(spec, 'bg'); let bg = hi.bgKey, fg = hi.fgKey;
    if (!bg && !fg) bg = 'yellow'; if (bg && !fg) fg = T.DARK_BG_KEYS.has(bg) ? 'white' : 'black'; return fg + '/' + bg; };
  ok(resolve('') === 'black/yellow', '★素の ==…== は 黒/黄', resolve(''));
  ok(resolve('(白/黄)') === 'white/yellow', '(白/黄)と書けばそのまま', resolve('(白/黄)'));
  ok(!T.DARK_BG_KEYS.has('yellow'), '黄は「暗い背景」ではない', true);
  // ★規則が if/else の外に1本だけ在ること(3つ目の道で抜けていたのが今回のバグ)
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  const i = src.indexOf('let bgKey, fgKey, hiComment, bodyLen;');
  const blk = src.slice(i, src.indexOf('const bodyEnd = innerStart + bodyLen;', i));
  const n = (blk.match(/DARK_BG_KEYS\.has\(bgKey\) \? 'white' : 'black'/g) || []).length;
  ok(n === 1, '★自動コントラストは if/else の外に1本だけ', n);
  ok(blk.lastIndexOf('} else {') < blk.lastIndexOf("DARK_BG_KEYS.has(bgKey)"), '★その1本は else の後(どの道も必ず通る)', true);
  // ★暗い黄= 名前を持たない(人が書けない)
  // ★v4.0.407: 2つの黄が**目で見分けられる**こと(v4.0.406では色が近すぎて移しても分からなかった)
  const rgba = (t) => (String(t).match(/[\d.]+/g) || []).map(Number);
  const over = (c) => { const [r, g, b, a] = c; return [r, g, b].map(v => Math.round(a * v + (1 - a) * 30)); };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const cr = (a2, b2) => { const L = [lum(a2), lum(b2)].sort((x, y) => y - x); return (L[0] + 0.05) / (L[1] + 0.05); };
  ok(!!T.HIGHLIGHT_COLORS.yellowDeep, '少し暗い黄が在る', T.HIGHLIGHT_COLORS.yellowDeep);
  const Y = over(rgba(T.HIGHLIGHT_COLORS.yellow)), YD = over(rgba(T.HIGHLIGHT_COLORS.yellowDeep));
  ok(cr(Y, [0, 0, 0]) > 12, '★明るい黄 × 黒字 = 蛍光ペンの読みやすさ(' + cr(Y, [0, 0, 0]).toFixed(1) + ':1)', Y);
  // ★v4.0.409(俊克 バグ1「暗めの黄色は、今までの色と違うよ。今回のはより黄土色みたいだね」):
  //   俊克が選んだのは**従来の姿 (176,160,10)**。赤みが強いと黄土に寄るので、R/G比で見張る。
  ok(YD[0] === 176 && YD[1] === 160 && YD[2] === 10, '★落とした黄は従来の姿そのもの(176,160,10)', YD);
  ok(YD[0] / YD[1] < 1.15, '★黄土に寄っていない(R/G ' + (YD[0] / YD[1]).toFixed(2) + ' < 1.15)', YD);
  ok(lum(Y) / lum(YD) > 1.8, '★2つの黄は目で見分けられる(明るさ ' + (lum(Y) / lum(YD)).toFixed(1) + ' 倍)', [Y, YD]);
  ok(T.parseColorSpec('(白/黄深)', 'bg').bgKey !== 'yellowDeep', '★名前が無いので生データには書けない', T.parseColorSpec('(白/黄深)', 'bg').bgKey);
  // ★v4.0.408: 濃さは**色を決めている所**で決める(重なりで探すのは当たらなかった)。判定は1つの関数。
  ok(/function meosHiBgKey/.test(src), '★濃さの判定は1つの関数(meosHiBgKey)', true);
  ok((src.match(/= meosHiBgKey\(bgKey, fgKey\)/g) || []).length === 2, '★塗る口2つ(==の層 と pushStyle)の両方から引く', (src.match(/= meosHiBgKey\(bgKey, fgKey\)/g) || []).length);
  ok(!/highlightBodyRangesByColor\.yellow = _keep/.test(src), '重なりで探す仕掛けは撤去した(当たらなかった)', true);
}

console.log('㊴ 印と印の間の字を、素に戻す(v4.0.409 俊克 バグ2)');
{
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  ok(/_starSpans\.push\(\[mk\.start, mk\.end\]\)/.test(src), '印の位置を控える', true);
  ok(/for \(let i = 1; i < _starSpans\.length; i\+\+\)/.test(src), '★間(印と印のあいだ)を回す', true);
  ok(/pushStyle\(ln, gs, ge, false, false, null, null, '', true\)/.test(src), '★間は太字/斜体/色を素に戻す(plain)', true);
  // plain は色も戻す。ただしMeOSが色を言っている時は言った色が勝つ。
  const i = src.indexOf('if (plain && !bold && !italic)');
  const body = src.slice(i, i + 900);
  ok(/ThemeColor\('editor\.foreground'\)/.test(body), '★素に戻す時は色も戻す(テーマの青を消す)', body.slice(0, 260));
  ok(/if \(!fgKey\)/.test(body), '★MeOSが色を言っている時は、その色が勝つ', true);
  ok(!/color:[^;]*!important/.test(body), '★色には !important を付けない(橙=対の印を勝たせる)', body.slice(0, 260));
  // ★生データの行でも間を素に戻す(v4.0.410)
  // ★v4.0.412: 2本目の道は撤去し、生表示の行も同じ走査が回る(隠す物だけ捨てる)
  ok(!/if \(!cursorLines\.has\(ln\)\) continue;/.test(src), '★2本目の道(生データ専用)は撤去した', true);
  ok(/const _raw = cursorLines\.has\(ln\);/.test(src) && /const hideR = _raw \? \[\] : hideRAll;/.test(src),
     '★生表示で違うのは記号を隠さないことだけ(色は同じ道)', true);
  // ★v4.0.413: 隠さない以上、記号も塗らないと**テーマの塗り分け**が出る
  // ★v4.0.415: 生表示には色も背景も付けない(地の色で塗るだけ)
  ok(/pushStyle\(ln, a, b, bold, italic, null, null, '', plain, true\)/.test(src),
     '★生表示は色も背景も渡さない(地の色だけ)', true);
  ok(/if \(rawFg && !fgKey\) \{ try \{ opt\.color = new vscode\.ThemeColor\('editor\.foreground'\)/.test(src),
     '★地の色= editor.foreground(テーマの塗り分けを消す)', true);
  ok(!/!important/.test((src.match(/if \(rawFg && !fgKey\)[^\n]*/) || [''])[0]),
     '★地の色にも !important は付けない(橙を勝たせる)', true);
  ok((src.match(/_rawWhole\(/g) || []).length >= 5, '★旧形(**{…}** / *{…}* / _…_)も同じ筋', (src.match(/_rawWhole\(/g) || []).length);
}

console.log('㊵ 段落: 修飾の外は橙にしない/境界は閉じ記号の手前(v4.0.411 俊克)');
{
  const B = '==一般的なハイライト(プレーン)==と***ハイライト***、そして***ハイライト***と';
  const P = [B, '<!-- Mew!FC ***not (白/黄) -->', '<!-- Mew!FC ***not (黒/黄) -->', ''];
  const d = makeDoc(P);
  const at = (ch) => { const r = T.meosFcMarkPairRanges(d, 0, ch); return r === null ? 'null' : (r.length === 0 ? 'none' : B.slice(r[0].start.character, r[0].end.character) + '#' + r[1].start.line); };
  const mk = T.meosRowMarksInOrder(B);
  ok(mk[1].bodyStart === 23 && mk[1].bodyEnd === 28, '★印は中身の範囲も持つ(入れ直しで落とさない)', JSON.stringify(mk[1]));
  ok(at(20) === 'none', '★開き記号の頭=外(v4.0.412 俊克「て」の右はまだ外)', at(20));
  ok(at(21) === '***ハイライト***#1', '★開き記号の内側=中', at(21));
  ok(at(30) === '***ハイライト***#1', '★閉じ記号の内側=中', at(30));
  ok(at(35) === 'none', '★★次の印の開き記号の頭=外(スクショ3枚目)', at(35));
  ok(at(31) === 'none', '★印の右端=外(俊克「そこは外側だよね」)', at(31));
  ok(at(33) === 'none', '★★修飾の外(、そして)は何も橙にしない', at(33));
  ok(at(46) === 'none', '★最後の「と」も外', at(46));
  ok(at(38) === '***ハイライト***#2', '★2つ目の中身は2つ目のFCと対', at(38));
  ok(at(5) === 'none', '★相手のFCが無い印も外(対にならない)', at(5));
}

console.log('㊶ 👻 コメント化=完全に見えなくする(v4.0.416 俊克「取消線を使っていて、ひらめいた」)');
{
  const g = T.meosParseSpecLine('<!-- Mew!FC ~~👻 -->');
  ok(g && g.fmt.length === 1 && g.fmt[0].ghost === true && g.fmt[0].not === false,
     '★`~~👻` は 👻 の命令として読める(中身が無くても命令)', g && g.fmt);
  ok(T.meosFcFmtIsGhost(g, '~~', 1) === true && T.meosFcFmtIsNot(g, '~~', 1) === false,
     '★👻 と not は別物(取り違えない)', true);
  const n = T.meosParseSpecLine('<!-- Mew!FC ~~not (赤/) -->');
  ok(n.fmt[0].not === true && n.fmt[0].ghost === false && T.meosFcFmtInner(n, '~~', 1) === '(赤/)',
     '★`~~not` は今までどおり(色も引ける)', n.fmt[0]);
  const h = T.meosParseSpecLine('<!-- Mew!FC ***not (白/黄) -->');
  ok(T.meosFcFmtIsNot(h, '***', 1) === true && T.meosFcFmtInner(h, '***', 1) === '(白/黄)',
     '★ハイライト(***not)は1文字も変わらない', true);
  const two = T.meosParseSpecLine('<!-- Mew!FC ~~ (赤/) --><!-- Mew!FC ~~👻 -->');
  ok(T.meosFcFmtIsGhost(two, '~~', 1) === false && T.meosFcFmtIsGhost(two, '~~', 2) === true,
     '★同じ行に2つあれば、2つ目だけが 👻', true);
  const nth = T.meosParseSpecLine('<!-- Mew!FC ~~#3👻 -->');
  ok(T.meosFcFmtIsGhost(nth, '~~', 3) === true && T.meosFcFmtIsGhost(nth, '~~', 1) === false,
     '★番号指定(`~~#3👻`)も効く', true);
  // 書く側と描く側
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  ok(/const _ghost = !!\(opt && opt\.ghost\) && kind === 'strike';/.test(src) && /_ghost \? '~~👻'/.test(src),
     '★Opt押しの取消ボタンは `~~👻` を書く', true);
  // ★v4.0.434(俊克): 👻にも色を付ける= 👻の2文字を消すだけで普通の取消線に戻る
  ok(/await meosWriteMarkAndSpec\(editor, sel, _mark, mk, _dir \+ ' ' \+ spec\);/.test(src),
     '★★👻にも色を付ける(戻る道を1手にする)', true);
  const g2 = T.meosParseSpecLine('<!-- Mew!FC ~~👻 (赤/紺)//[]tip= -->');
  ok(T.meosFcFmtIsGhost(g2, '~~', 1) === true && /^\(赤\/紺\)/.test(T.meosFcFmtInner(g2, '~~', 1) || ''),
     '★色つきでも 👻 は読める', T.meosFcFmtInner(g2, '~~', 1));
  const g3 = T.meosParseSpecLine('<!-- Mew!FC ~~ (赤/紺)//[]tip= -->');
  ok(T.meosFcFmtIsGhost(g3, '~~', 1) === false && T.meosFcFmtInner(g3, '~~', 1) === T.meosFcFmtInner(g2, '~~', 1),
     '★★👻を消すと、色はそのまま普通の取消線になる', true);
  ok(/if \(_fcGhost \|\| \(_pseudoLine\(line\) && !_fcNot\)\) \{ strikeMarkerRanges\.push\(/.test(src),
     '★★描く側は印ごと丸ごと消す(本文だけでなく `~~` も)', true);
  ok(/bg:fmtSpec\.strike\.bg,ghost:fmtStGhostOn\(\)\}\)/.test(src),
     '★★どちらを書くかは1つの判定(fmtStGhostOn)が決める(v4.0.432)', true);
  ok(/function fmtStTildeOn\(\)\{var sp=fmtStSlots\[fmtStIdx\]\|\|\{\};return stAltOn\(\)\?!sp\.tilde:!!sp\.tilde;\}/.test(src),
     '★★既定は👻・□~~で従来方式・Optは今の逆(🔗と同じ形)', true);
  ok(/_tb\('tilde','~~',!!spec\.tilde\)/.test(src), '★▾に □ ~~ が在る(初めての人の入口)', true);
  // ★v4.0.433: 説明はtipへ／👻は1.3倍
  ok(/data-tip="'\+_tt\+'"/.test(src), '★★説明は □ ~~ 自身のtipに(常に見える説明は本文になる)', true);
  // ★v4.0.436: ▾の中の項目もCSSのtipの家へ(共有のJS製に落ちると出るまで間が空く)
  ok(/\.fmt-bi\[data-tip\]::after,\.warn-btn\[data-tip\]::after/.test(src), '★★▾の項目もCSSのtipの家に居る', true);
  ok(!/\.fmt-bi\[data-tip\]::after\{bottom:auto/.test(src), '★tipは上へ(下だとパネルを覆う・v4.0.437)', true);
  ok(/style="cursor:pointer;padding:2px 11px;margin:0 4px;border-radius:5px">'\+'<span style="'\+\(on\?'':'opacity:\.55'\)/.test(src),
     '★★薄くするのは中身だけ(外側の opacity を ::after が受け継いで半透明になっていた)', true);
  ok(/,\.fmt-bi\{position:relative\}/.test(src), '★::afterの基準は項目自身', true);
  ok(!/text-align:center;padding:0 6px 7px;font-size:11px;opacity:\.75/.test(src), '★パネルの常設の説明は撤去した', true);
  ok(/btn\.classList\.add\('ghost-face'\)/.test(src) && /\.fmt-btn\.ghost-face\{font-size:17px/.test(src),
     '★👻は1.3倍(13→17px・🚫と同じ手)', true);
  ok(/if\(kind==='strike'\)btn\.classList\.remove\('ghost-face'\);/.test(src), '★👻でない時は素の大きさへ戻す', true);
  // ★v4.0.435: 👻の面も設定の色を着る(2つの口が同じ値を塗る)
  ok(/var _ss=fmtSpec\.strike\|\|\{\};var _sbg=_ss\.bg\?fmtHexBg\(_ss\.bg\):'';btn\.style\.color=fmtHexFg\(_ss\.fg\);btn\.style\.backgroundColor=_sbg/.test(src),
     '★★👻の面も設定の色を塗る(renderFmtBtnColorsと同じ値なので、どちらが後でも同じ)', true);
  ok(!/btn\.textContent='👻';btn\.classList\.add\('ghost-face'\);[\s\S]{0,700}btn\.style\.backgroundColor='';/.test(src),
     '★もう色を消さない(出たり出なかったりの真因)', true);
  ok(/if \(it\.not \|\| it\.ghost\) return null;/.test(src), '★👻 は行末形式へ戻さない(notと同じ)', true);
  // ★v4.0.417: 押す前の面と押した結果は同じ物を指す(Option=裏の顔)
  ok(/stAltW=fmtAltWatch\(fmtStrike,/.test(src), '★取消線ボタンもOptionの見張りに名乗る', true);
  ok(/if\(kind==='strike'&&!window\.__fmtActionable\.strike&&fmtStGhostOn\(\)\)\{btn\.textContent='👻';/.test(src),
     '★★面は「これから書く物」を見せる(既定=👻・🚫の時はリングに任せる)', true);
  ok(!/fmtAltDown=[^;]*;[\s\S]{0,80}var fmtAltDown/.test(src), '★見張りは1つのまま(2つ目を作らない)', true);
  // ★v4.0.419: 見出しの裏の顔=箇条書き(既に在る軸のもう一方)
  ok(/hdAltW=fmtAltWatch\(fmtHeading,/.test(src), '★見出しボタンもOptionの見張りに名乗る', true);
  ok(/function hdAltBlt\(\)\{return \(fmtHeadingLevel===1\)\?'-':\(fmtHeadingLevel===2\)\?'1\.':null;\}/.test(src),
     '★★H1は - / H2は 1. / H3は予約(nullで変身しない)', true);
  ok(/if\(kind==='heading'&&hdAltOn\(\)&&hdAltMode\(\)\)\{/.test(src),
     '★★押す前の面が、押した結果を見せる', true);
  ok(/ev\.altKey&&hdAltMode\(\)\)\{[\s\S]{0,600}head:!_on,bullet:_on/.test(src),
     '★Optは付ける/外す/足すのどれかを書く', true);
  ok(!/ev\.altKey&&hdAltMode\(\)\)\{[\s\S]{0,300}_hs\.bullet=/.test(src),
     '★Optはプリセットを変えない(1回きりの裏の顔)', true);
  // ★v4.0.420: `-` だけでは箇条書きではない= 印の一部の空白は落とさない
  const mv = (x) => { const r = T.meosMoveSpecsOutOfLine(x); return r && r.body; };
  ok(mv('- <!-- Mew! - (白/purple)//[]tip= -->') === '- ', '★★印だけが残る時は空白を落とさない(- )', mv('- <!-- Mew! - (白/purple)//[]tip= -->'));
  ok(mv('1. <!-- Mew! -1. (白/green)//[]tip= -->') === '1. ', '★数字付きも同じ(1. )', mv('1. <!-- Mew! -1. (白/green)//[]tip= -->'));
  ok(mv('- りんご <!-- Mew! - (白/purple)//[]tip= -->') === '- りんご', '★本文があれば今までどおり落とす', mv('- りんご <!-- Mew! - (白/purple)//[]tip= -->'));
  ok(mv('ふつうの文 <!-- Mew! ~~ (赤/) -->') === 'ふつうの文', '★箇条書き以外は1文字も変わらない', mv('ふつうの文 <!-- Mew! ~~ (赤/) -->'));
  ok((src.match(/if \(\/\^\[ \\t\]\*\(\?:\[-\*\+\]\|\\d\+\[\.\)\]\)\$\/\.test\(body\)\) body \+= ' ';/g) || []).length === 2,
     '★同じ判断が在る2か所(切り出しと引っ越し)の両方に入れた', (src.match(/body \+= ' ';/g) || []).length);
  ok(/btn\.innerHTML=hdAltBlt\(\)\+' <span style="color:'\+fmtHexFg\(_hc\.fg\)/.test(src),
     '★面は - A(Aにプリセットの色)= 押した結果がそのまま見える', true);
  // ★v4.0.421: tipは面の一部/戻ったら色も戻る
  ok(/btn\.setAttribute\('data-tip',fmtHeadAltTip\(\)\);return;\}/.test(src) && /if\(kind==='heading'\)btn\.setAttribute\('data-tip',fmtHeadTip\(\)\);/.test(src),
     '★★見出し: 変身でtipも変わり、戻ればtipも戻る', true);
  ok(/if\(kind==='strike'&&stBaseTip\)btn\.setAttribute\('data-tip',stBaseTip\+String\.fromCharCode\(10\)/.test(src),
     '★取消線も同じ(素のtipを控えて戻す＋Optの案内を足す)', true);
  ok((src.match(/if\(!hdAltOn\(\)&&typeof renderFmtBtnColors==='function'\)renderFmtBtnColors\(\);/g) || []).length === 1
     && (src.match(/if\(!stAltOn\(\)&&typeof renderFmtBtnColors==='function'\)renderFmtBtnColors\(\);/g) || []).length === 1,
     '★★戻ったら色を塗り直すまでが1組(2つのボタンとも)', true);
  ok((src.match(/setAttribute\('data-tip','Heading \(H'/g) || []).length === 0,
     '★tipを作る所は1つ(fmtHeadTip)', true);
  // ★v4.0.424: tipの1行目は、その面が今なんであるかを言う
  ok(/var head1=\(_h\.head===false\)\?\('Bullet list \('/.test(src) && /_h\.bullet\?\(' with a bullet \('/.test(src),
     '★★tipの1行目も面と同じ3通り(見出し/見出し+箇条書き/箇条書きだけ)', true);
  // ★v4.0.422: Optは「今の逆」。逆の答えが無い時は変身しない
  ok(/if\(h\.head===false\)return h\.bullet\?'h2':null;[\s\S]{0,120}if\(h\.bullet\)return 'off';[\s\S]{0,120}return hdAltBlt\(\)\?'on':null;/.test(src),
     '★★Optは今の逆: 箇条書きが無ければ付ける・在れば外す・箇条書きだけなら見出し(H2)を足す', true);
  ok(/if\(_m==='h2'\)\{vscode\.postMessage\(\{type:'insertFormat',kind:'heading',[^}]*level:2,head:true,bullet:true/.test(src),
     '★★H2で書く(選べないなら一番使う物を出し、後からFCで直せる)', true);
  ok(/else if\(hdAltMode\(\)==='h2'\)\{[\s\S]{0,160}\+' ##';\}/.test(src),
     '★面は「- ##」= 足した姿がそのまま見える', true);
  ok(/head:!_on,bullet:_on,blt:_on\?hdAltBlt\(\):\(_h\.blt\|\|'-'\)/.test(src),
     '★外す時は見出しだけを書く(head:true,bullet:false)', true);
  ok(/if\(hdAltMode\(\)==='off'\)\{[\s\S]{0,120}btn\.textContent='#'\.repeat\(fmtHeadingLevel\);\}/.test(src),
     '★外す時の面は「#だけ」= 押した結果がそのまま見える', true);
  ok(!/if\(hdAltMode\(\)==='off'\)\{[\s\S]{0,120}btn\.style\.backgroundColor=''/.test(src),
     '★外す時はボタンの色を消さない(色は変わらないから)', true);
  ok(/if\(kind==='heading'&&hdAltOn\(\)&&hdAltMode\(\)\)/.test(src) && !/hdAltOn\(\)&&hdAltBlt\(\)\)/.test(src),
     '★変身するかの判定は1つ(hdAltMode)', true);
}

console.log('㊷ 赤い警告線にホーバー= 行番号とワープの口(v4.0.425 俊克)');
{
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  const w = T.selectDisplayedWarnings({ unclosedOpens: [{ id: 'A_2026', start: 1548, depth: 0 }], orphanCloses: [{ id: 'B_2026', line: 9001, depth: 0 }] });
  ok(w.length === 2 && w[0].warningKind === 'unclosed' && w[1].warningKind === 'orphan', '★2種類の警告が並ぶ', w.map(x => x.warningKind));
  const md = T.warningHoverMessage(w);
  const v = md && md.value;
  ok(/Ln 1549/.test(v), '★★開始膜の行番号を名指しする(1から数える)', v && v.slice(0, 120));
  ok(/Ln 9002/.test(v), '★★閉じ膜の行番号も名指しする', true);
  ok(/command:laiMembrane\.jumpToLine\?%5B1548%5D/.test(v), '★★そこへ飛べる(ワープの口)', true);
  ok(/command:laiMembrane\.jumpToLine\?%5B9001%5D/.test(v), '★もう一方へも飛べる', true);
  ok(md.isTrusted === true, '★ワープの口を効かせる(isTrusted)', md.isTrusted);
  ok(/▲ 閉じ膜 — \*\*無い\*\*/.test(v) && /▼ 開始膜 — \*\*無い\*\*/.test(v), '★無い方は「無い」と言い切る(探させない)', true);
  ok(!T.warningHoverMessage([]), '★壊れていなければ何も出さない', true);
  // 口と物差し
  ok(/const _wm = warningHoverMessage\(meosWarningsAtLine\(document, position\.line\)\);/.test(src),
     '★★赤い線が出ている行なら、どこを指しても出る', true);
  ok(/if \(w\.warningKind === 'unclosed'\) return w\.start <= line;[\s\S]{0,200}return line <= \(w\.endLine/.test(src),
     '★ホーバーの範囲は線と同じ物差し', true);
  ok(/registerCommand\('laiMembrane\.jumpToLine'/.test(src), '★行へ飛ぶ口が在る', true);
  ok(/meosWarnCache = \{ key: document\.uri\.toString\(\) \+ '@' \+ document\.version/.test(src),
     '★ホーバーのたびに全文を数え直さない(版で古くなる控え)', true);
  ok(/const pick = await vscode\.window\.showWarningMessage\(\n    'MeOS: ' \+ bad\.length/.test(src),
     '★深さの知らせは自分で消えない(警告にした)', true);
}

console.log('㊸ ⚠️ボタン= 壊れた膜の両端を交互に行く(v4.0.426 俊克)');
{
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  // ★描いた物とボタンが言う物を同じ1つから引く(v4.0.425の穴)
  ok((src.match(/meosWarnCache = \{ key: document\.uri\.toString\(\) \+ '@' \+ document\.version/g) || []).length === 2,
     '★★描く道が2つあるので、控えも両方に置く(v4.0.425は片方だけで空だった)', (src.match(/meosWarnCache = \{/g) || []).length);
  ok(/function meosWarningEnds\(document\)/.test(src), '★両端を出す口が在る', true);
  ok(/out\.push\(\{ id: w\.id, kind: 'unclosed', a: w\.start, b: last, aReal: true, bReal: false \}\)/.test(src),
     '★★閉じ膜が無い= 端は「開始膜」と「EOF」(片側だけでも両端を見せる)', true);
  ok(/kind: 'orphan', a: 0, b: l, aReal: false, bReal: true/.test(src),
     '★★開始膜が無い= 端は「Line0」と「閉じ膜」', true);
  ok(/warn: \(editor \? meosWarningEnds\(editor\.document\) : \[\]\)/.test(src), '★Me Dockへ状態を送る', true);
  ok(/id="warn-btn" disabled/.test(src), '★既定は押せない(壊れていなければ黙っている)', true);
  // ★v4.0.427: 置き場所=行き先を決める道具の並び(Navigate Me! の Warp の右)
  ok(/id="nav-me-plus"[^<]*>↓<\/button><\/span><button class="warn-btn" id="warn-btn"/.test(src),
     '★★⚠️はWarpの隣に居る(どこへ行くかの道具なので、動く所に置く)', true);
  ok(!/id="me-title-word">Me<\/span><button class="warn-btn"/.test(src), '★Edit Meの側には置かない', true);
  // ★v4.0.428: 件数は上付き・ガターにも印・枠は横長
  ok(/id="warn-n"/.test(src) && /\.warn-btn \.warn-n\{font-size:10px;font-weight:900/.test(src),
     '★★件数は🐱と同じ流儀(上付きの数字)', true);
  ok(/if\(_wn\)_wn\.textContent=\(n>1\?String\(n\):''\)/.test(src), '★1個の時は数字を出さない(2個以上だけ)', true);
  ok(/function meosWarnGutterLines\(document\)/.test(src) && /out\.add\(w\.aReal \? w\.a : w\.b\)/.test(src),
     '★★ガターの印は「実在する端」に出す(直す場所に合図)', true);
  ok(/if \(_warnLines && _warnLines\.has\(line\)\) continue;/.test(src),
     '★★その行は膜線が場所を譲る(グリフマージンは1行1アイコン)', true);
  ok(/editor\.setDecorations\(meosWarnGutterDecoration, _wl\);/.test(src), '★膜線と同じ1回の走査で置く', true);
  ok(/'warn\.svg'/.test(src), '★栞・🐱と同じ gutterIconPath 方式', true);
  ok(/\.warn-btn\{margin-left:8px;padding:1px 9px;border[^}]*border-radius:9px/.test(src),
     '★枠は横長(隣の駒と同じ丸み)', true);
  ok(/\.warn-btn\{[^}]*font-size:14px;line-height:15px/.test(src), '★⚠️は1.3倍・背丈は据え置き(v4.0.431)', true);
  // ★v4.0.429: tipは隣の駒と同じ家(CSS ::after)・件数は白・ガターはボタンと同じ黄
  ok(/\.warn-btn\[data-tip\]::after,\.nav-center-btn\[data-tip\]::after/.test(src),
     '★★tipは隣の駒と同じCSSの家に居る(座標を計算しない=v3.1.34の汎用解)', true);
  ok(/\.warn-btn\[data-tip\]:hover::after,/.test(src), '★出す条件も同じ家から', true);
  ok(/,\.warn-btn,\.fmt-bi\{position:relative\}/.test(src), '★::afterの基準もボタン自身', true);
  ok(/vertical-align:super;color:#fff\}/.test(src), '★件数は白', true);
  ok(/overviewRulerColor: 'rgba\(240, 190, 20, 0\.95\)'/.test(src), '★★ガターの印はボタンと同じ黄(範囲=赤／印=黄)', true);
  const warn = fs.readFileSync(path.join(__dirname, 'warn.svg'), 'utf8');
  ok(/fill="#f0be14"/.test(warn), '★warn.svg も黄(絵文字の⚠️に合わせる)', warn.slice(0, 90));
  ok(!/#e03a3a/.test(warn), '★赤は残っていない', true);
  // ★v4.0.430: tipが2つ出るのは口が2つ在るから。一覧でなく規則1本で塞ぐ
  ok(/getComputedStyle\(_ct,'::after'\)\.content/.test(src),
     '★★CSSが同じ字を出しているならJSは出さない(その場で見る)', true);
  ok(/_n\(_cc\)===_n\(_tt\)/.test(src), '★出ている字とdata-tipが一致するかで決める', true);
  ok(!/closest\('\.title-file-ud'\):null;if\(_udt\)/.test(src), '★★名前の一覧は撤去した(足し忘れが再発しない)', true);
  ok(/closest\('\[data-tip\]'\)/.test(src), '★対象はdata-tipを持つ物すべて(次に足すボタンでも効く)', true);
  ok(/warnAt=\(warnAt\+1\)%\(warnEnds\.length\*2\);/.test(src), '★★押す毎に両端を交互に行く', true);
  ok(/vscode\.postMessage\(\{type:'warnGoto',line:\(\(warnAt%2\)===0\?w\.a:w\.b\)\}\);/.test(src), '★偶数=片方・奇数=もう片方', true);
  ok(/message\.type === 'warnGoto'/.test(src) && /executeCommand\('laiMembrane\.jumpToLine'/.test(src),
     '★飛ぶのは既に在る口を使う(道を2つ作らない)', true);
  ok(/window\.__renderWarn\(m\.warn\)/.test(src), '★状態が変わるたびに面を描き直す', true);
}

console.log('㊹ 3つの見え方は膜の性質(v4.0.444 俊克)  ※振る舞いの実測は check_viewmode.js');
{
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  // (1) 「今どのモードか」を言う口は1つ = 膜ごとの地図
  ok(!/\blet meosRawMode\b|\blet meosReadMode\b/.test(src),
     '★★★セッションが1つ持っていた meosRawMode / meosReadMode が撤去されている(口を2つ作らない)', true);
  // (0) 覚える場所は mMETA = ファイルと一緒に旅する(v4.0.445 俊克)
  ok(/const _meosViewMem = new Map\(\);/.test(src) && /function meosViewMeta\(doc\)/.test(src),
     '★★★設定はメタ膜(mMETA)に随伴= Format色/参照符と同じ道(新しい入れ物を作らない)', true);
  ok(/const data = await ensureHyperTocData\(doc\);\n      if \(data\) \{ data\.view = v; await writeHyperTocToSource\(doc, data\); \}/.test(src),
     '★書くのは人that設定を変えた時だけ(連打は1回にまとめる)', true);
  ok(/const vw = _meosViewMem\.get\(document\.uri\.toString\(\)\); if \(vw\) data\.view = vw;/.test(src),
     '★★他の書き手that view を落とさない(mMETAを触る道は1本に合流している)', true);
  ok(/if \(isMetaMembraneId\(p\.id\)\) continue;/.test(src),
     '★mMETAは設定の入れ物so、設定の相手にはしない', true);
  ok(/function meosLockKey\(scope\)/.test(src),
     '★錠のキーはファイルを含む(別のファイルの同名の膜と混ざらない)', true);
  ok(/function meosModeAtLine\(doc, line\) \{[\s\S]{0,240}for \(const r of m\.ranges\) if \(line >= r\.from && line <= r\.to\) return r\.mode;[\s\S]{0,60}return m\.fileMode;/.test(src),
     '★★規則は3行= その膜の設定に従う / 無ければ外側の膜 / 最後は通常(レキシカルスコープ)', true);
  ok(/ranges\.sort\(\(a, b\) => \(a\.to - a\.from\) - \(b\.to - b\.from\)\);/.test(src),
     '★内側(狭い膜)から先に並べるので、最初に当たった物that答え= 入れ子は自動的に正しくなる', true);
  ok(/if \(!view \|\| !Object\.keys\(view\)\.length\) \{ _meosModeMapCache = \{ key, value: null \}; return null; \}/.test(src),
     '★既定しか無いファイルでは地図をそもそも作らない(今までと1mmも変わらない)', true);
  ok(/const key = uri \+ '::' \+ doc\.version \+ '::' \+ _meosModeEpoch;/.test(src),
     '★地図は版と設定の世代で覚える(打鍵ごとに数え直さない)', true);
  // (2) ボタンthat効く相手 = カーソルを包む一番内側の膜
  ok(/function meosModeScope\(editor\)/.test(src) && /return meosApplyModeToScope\(scope\.doc, scope\.key, next, scope\.name\);/.test(src),
     '★★ボタンの意味は1行= 今カーソルの居る膜の設定を変える', true);
  ok(/if \(next === inh\) delete view\[key\]; else view\[key\] = next;/.test(src),
     '★★★書くのは、外側と違う時だけ(同じ値を選んだら消す= 受け継ぎに戻る / v4.0.452)', true);
  ok(/function meosInheritedMode\(doc, key\)/.test(src) && /if \(r\.id === key\) continue;/.test(src),
     '★★「自分の設定thatが無かったら何になるか」を言う口(自分は数えない)', true);
  ok(/const own = meosViewMeta\(scope\.doc\)\[scope\.key\];\n    return own \|\| meosInheritedMode\(scope\.doc, scope\.key\);/.test(src),
     '★★★面は**効いている値**を出す(受け継いでRawに見えている膜で「通常」と名乗らない)', true);
  ok(/own: \(sc \? meosScopeHasOwn\(sc\) : true\)/.test(src) && /vmOwn=\(m\.own!==false\)/.test(src),
     '★受け継ぎかどうかも渡す= tipthat「外から来た」と言える', true);
  ok(/meosScheduleViewMetaWrite\(doc\);/.test(src),
     '★★人that入れた物は人that出す= 覚えたら、次に開いた時も同じ姿(俊克「いつ戻すのかが分かりにくくなる」)', true);
  // v4.0.447: 設定を当てる所は1つ= ボタンからも、タイマーの終わりの知らせからも、同じ関数を通る
  ok((src.match(/meosApplyModeToScope\(/g) || []).length >= 3,
     '★★★設定を当てる口は1つ(ボタンと、時間切れの知らせthat同じ道を通る)', (src.match(/meosApplyModeToScope\(/g) || []).length);
  // (3) 描く側は行ごとに訊く
  ok(/has\(ln\) \{ if \(this\.doc && meosModeAtLine\(this\.doc, ln\) === 'raw'\) return true;/.test(src),
     '★★帯(1本の範囲)ではなく行ごとに訊く= 入れ子で穴that空くため', true);
  ok(/const _pseudoLine = \(ln\) => meosModeAtLine\(editor\.document, ln\) === 'pseudo';/.test(src),
     '★★Pseudoも行ごとの性質(取消線を消すのは、その膜の中だけ)', true);
  ok(/if \(_pseudoLine\(line\)\) \{ strikeMarkerRanges\.push/.test(src) && /_fcGhost \|\| \(_pseudoLine\(line\) && !_fcNot\)/.test(src),
     '★取消線の2つの枝that両方とも行ごとの判定を通る', true);
  ok(/if \(meosModeAtLine\(editor\.document, editor\.selection\.active\.line\) !== 'normal'\) return out;/.test(src),
     '★★カーソル行を生で見せる特例thatが要るのは、通常の膜の中に居る時だけ', true);
  // (4) 畳みの2本の道that同じ物に訊く
  ok(/function meosFcWantsOpen\(doc, block, caretLine\)/.test(src),
     '★★★「その塊は開いているべきか」を言う口は1つ', true);
  const wants = (src.match(/meosFcWantsOpen\(/g) || []).length;
  ok(wants >= 3, '★個別の道・一括の道の両方that引いている', wants);
  ok(/const _mine = \(b\) => meosFcWantsOpen\(editor\.document, b, _cur\);/.test(src),
     '★★一括の道は自前で数えない(v4.0.443の穴を、判定ごと差し替えた)', true);
  ok(/for \(const st of Array\.from\(_meosFcOpenSet\)\) if \(!want\.has\(st\)\) \{ await foldIfVisible\(st\); _meosFcOpenSet\.delete\(st\); \}/.test(src),
     '★★★望む姿を毎回ぜんぶ言って、今の姿との差だけを当てる(場合分けthatゼロ)', true);
  ok(!/_meosFcOpen\b(?!Set)/.test(src),
     '★番兵(行番号 / ALL / RAW:…)の1変数that消えている= 場合thatが増えるたびに穴the開く作りをやめた', true);
  ok(!/await fold\(blocks\.map\(b => b\.start\)\)/.test(src),
     '★★裸の fold(全部) that1つも残っていない= 畳まれた塊を畳むと膜に化ける(v4.0.188)', true);
  // (5) 錠も膜ごと = 俊克の目的
  ok(/const _meosPseudoUntil = new Map\(\);/.test(src) && /function meosPseudoLeftFor\(key\)/.test(src),
     '★★★テスト用紙の膜だけ50分ロック、他の膜は普通に書ける(俊克の目的)', true);
  ok(/meosPseudoLeftFor\(lk\) > 0 && next !== 'pseudo'\)/.test(src),
     '★閉めるのは、その膜の出口だけ', true);
  // (6) 面は「今カーソルの居る膜」を出す
  ok(/try \{ meosPostViewMode\(\); \} catch \(_\) \{ \}\n  const editor = getMeDockTargetEditor\(\);/.test(src),
     '★★カーソルthat別の膜へ移れば面も変わる(毎selection走る既存の道に相乗り= 合図を足さない)', true);
  ok(/if\(_sg!==vmSig\)\{vmSig=_sg;/.test(src),
     '★同じなら描き直さない(毎selection来るため)', true);
  ok(/function vmWho\(\)\{return vmScope\?/.test(src),
     '★tipthatどの膜の話かを名指しする', true);
  // (7) 改良1: 行き先を両方とも名指しする(俊克 v4.0.445)
  ok(/var fwd=VM_ORDER\[\(i\+1\)%3\],back=VM_ORDER\[\(i\+2\)%3\];/.test(src),
     '★★クリック=次へ / ⌥Opt=1つ戻る= Rawから1回で通常へ戻れる(俊克 改良1)', true);
  ok(src.indexOf("+VM_NAME[fwd]+String.fromCharCode(10)+") >= 0 && src.indexOf("Opt-click ") >= 0 && src.indexOf("+VM_NAME[back]") >= 0,
     '★★★tipは行き先を**両方とも名指しする**(「the other way」では何になるか読めない)', true);
}

console.log('㊺ ●/× は門より前(v4.0.446 俊克 改良1)');
{
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  const h = src.indexOf('vscode.workspace.onDidChangeTextDocument(e => {');
  const ud = src.indexOf('postDockFileUD(_dockEd)', h);
  const gate = src.indexOf('if (deferRefreshCount > 0) {', h);
  ok(h >= 0 && ud > h && gate > ud,
     '★★★保存済みかどうかは「事実」so、描き直しを止める門より**前**に置く', [ud - h, gate - h]);
  ok((src.match(/postDockFileUD\(activeEditor\)/g) || []).length === 0,
     '★2つ目の口を残さない(門の後ろの古い呼び出しthat消えている)', true);
  ok(/_dockEd\.document === e\.document/.test(src),
     '★Me Dockthat見ている当のファイルの時だけ出す(裏のファイルの状態で上書きしない)', true);
  ok(/_dot\.textContent=m\.dirty\?'\\u25cf':'\\u00d7';/.test(src),
     '★●=未保存(橙) / ×=保存済(緑) の向きは v4.0.365 のまま', true);
}

console.log('㊻ Rawは何も描かない／時間切れの知らせに出口を付ける(v4.0.447 俊克)');
{
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  ok(/if \(meosModeAtLine\(document, line\) === 'raw'\) continue;/.test(src),
     '★★Rawの膜では膜線も引かない(生データを見せている所に飾りを足さない)', true);
  const lane = src.indexOf('if (bmLines && bmLines.has(line)) continue;');
  const rawSkip = src.indexOf("if (meosModeAtLine(document, line) === 'raw') continue;", lane);
  const cur = src.indexOf('if (line === curLine) continue;', lane);
  ok(lane >= 0 && rawSkip > lane && cur > rawSkip,
     '★カーソル行が線を譲るのと同じ場所・同じ理由で譲る', [rawSkip - lane, cur - lane]);
  ok(/async function meosEndPseudoTimer\(key\)/.test(src) && /if \(doc && scope\.hold\) await meosApplyModeToScope\(doc, scope\.key, 'normal', scope\.name\);/.test(src),
     '★★★押さえていた時だけ通常へ返る= 鐘that鳴る→答えthat出る / ただの呼び鈴は見え方に触れない', true);
  ok(!/_meosPseudoPrev/.test(src),
     '★★「掛ける前の姿へ返す」は捨てた= ⏰thatPseudoでしか出ない以上、返す先は必ずPseudoになってしまう', true);
  ok(!/'Show the answers'/.test(src),
     '★知らせに押す物that無い= 押し忘れも無い', true);
  ok((src.match(/meosEndPseudoTimer\(/g) || []).length >= 3,
     '★終わり方の口は1つ(時間切れも、人that止めた時も、同じ道)', (src.match(/meosEndPseudoTimer\(/g) || []).length);
  ok(/const doc = vscode\.workspace\.textDocuments\.find\(d => d\.uri\.toString\(\) === scope\.uri\);/.test(src),
     '★50分後でも引き直せるようスコープはuriを持つ(古いdocを掴んだままにしない)', true);
  ok(/_meosPseudoScopes\.set\(lk, \{ doc: scope\.doc, uri: scope\.uri, key: scope\.key, name: scope\.name, hold \}\);/.test(src),
     '★終わりの知らせは、掛けた時のスコープ(と役)をそのまま持って行く', true);
  ok(/function meosUpdateTimerBar\(\)/.test(src) && /_meosTimerBar\.text = /.test(src),
     '★★残り時間はステータスバーにも出す= どこに居ても、動いている物that見える(俊克 改良2)', true);
  ok(/if \(_meosTimerTick\) \{ clearInterval\(_meosTimerTick\); _meosTimerTick = null; \}/.test(src),
     '★動いている物that無くなったら、時計も止める', true);
  ok(src.indexOf('⏱') < 0 && src.indexOf('⏳') < 0, '★⏱ も ⏳ も残っていない(俊克 改良1: ⏰ に)', true);
  ok(/id="raw-timer"[^>]*>&#9200;</.test(src), '★⏰(U+23F0) を使う= 俊克thatが名指しした字(v4.0.448)', true);
  ok(/\.warn-btn\.raw-timer\{opacity:\.45/.test(src),
     '★★v4.0.456で白地の円をやめ、⚠️と同じ駒の作りへ(円のままでは目立たない)', true);
  // ★★★v4.0.448: 面の色thatCSSのidに負けていた(v4.0.440から一度も出ていなかった)
  ok(!/#raw-toggle\{background:/.test(src),
     '★★★id の色指定that消えている= 面の色は class 1本で決まる(CSSは「後」でなく「強さ」)', true);
  ok(/\.fmt-btn\.raw-toggle\.on\{background:#cd8a5c/.test(src),
     '★Raw= 俊克thatRawとして見慣れた茶', true);
  ok(!/\\\\U0001F47B/.test(src),
     '★JSに \\\\U エスケープは無い(字thatそのまま出てしまう)', true);
}

console.log('㊼ 残り時間は膜ごと／⏰はPseudoの持ち物／⋯の後をその場で畳む(v4.0.449 俊克)');
{
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  // 改良1: 置き場所that意味を決める= 閉じ膜の行
  ok(/function meosApplyTimerLineDecorations\(editor\)/.test(src),
     '★★★残り時間は**その膜の閉じ膜の行**に出す(膜の物は膜に置く)', true);
  ok(/const ln = pr\.end, text = doc\.lineAt\(ln\)\.text \|\| '';/.test(src),
     '★行は名前から引き直す(掛けた時の行番号は、書いている内にずれる)', true);
  ok(/if \(m\) \{ at = parts\.idEnd \+ m\[1\]\.length; pre = ''; \}/.test(src),
     '★★★出るのは **// の右= コメント欄の先頭**(俊克 v4.0.451「あくまでも、コメント入力領域を利用するので」)', true);
  ok(src.indexOf(String.raw`^(\s*\/\/[ \t]?)`) >= 0,
     '★`//` とその後ろの空白1つまでを飛ばす= コメントthat有っても無くても同じ桁', true);
  ok(/const parts = membraneLineParts\(text, 'close'\);/.test(src),
     '★閉じ膜の並びは1か所(membraneLineParts)から引く= 殻の書き方that違っても崩れない', true);
  ok(/try \{ meosApplyTimerLineDecorations\(editor\); \} catch \(_\) \{\}/.test(src),
     '★描き直しの列に並べる(別の道を作らない)', true);
  ok(/function meosTickTimerLines\(\)/.test(src) && /meosTickTimerLines\(\);\n    if \(!_meosTimerTick\)/.test(src),
     '★1秒ごとに、見えているエディタぜんぶへ', true);
  ok(/\(n > 1 \? \('  \+' \+ \(n - 1\)\) : ''\)/.test(src),
     '★ステータスバーは「一番早く終わる物 ＋ 残り何本」(1つとは限らない)', true);
  // 改良2: ⏰ は Pseudo の持ち物
  ok(!/_rt\.style\.display=/.test(src),
     '★★★⏰はどこでも押せる(v4.0.453: 時計that「錠」だけでなく「呼び鈴」になったため)', true);
  ok(/const hold = \(meosScopeMode\(scope\) === 'pseudo'\);/.test(src),
     '★★掛けた時のモードthat時計の役を決める= Pseudoなら押さえる / それ以外なら呼ぶだけ', true);
  // 改良4: 『⋯』の後を、待たずに畳み直す
  ok(/async function meosFoldPseudoOpened\(editor\)/.test(src),
     '★★Pseudoの膜で開いてしまった塊を、その場で畳み直す', true);
  ok(/try \{ meosFoldPseudoOpened\(e\.textEditor\); \} catch \(_\) \{ \}\n    _meosFcScrollTimer = setTimeout\(/.test(src),
     '★320msを待たない(待たせているのはこちら側だった)', true);
  ok(/const hits = blocks\.filter\(b => meosModeAtLine\(doc, b\.start\) === 'pseudo' && _vis\(b\.start\) && _vis\(b\.end\)\)/.test(src),
     '★畳むのは見えていて、かつ開いている物だけ(畳まれた塊を畳むと膜に化ける= v4.0.188)', true);
  ok(/if \(!meosDocModes\(editor\.document\)\) return;/.test(src),
     '★設定that1つも無いファイルでは何もしない(今までと1mmも変わらない)', true);
}

console.log('㊽ 時計は呼び鈴でもある — 鳴ったらその膜へ／時刻でも掛かる(v4.0.453 俊克 進化1)');
{
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  ok(/async function meosJumpToScope\(scope\)/.test(src),
     '★★★鳴ったら**その膜thatが呼ぶ**(予定も、その場所に居る)', true);
  ok(/const scope = await meosEndPseudoTimer\(key\);\n  if \(!scope\) return;\n  await meosJumpToScope\(scope\);/.test(src),
     '★終わってから飛ぶ(押さえを解いてから呼ぶ= 順番that1つ)', true);
  ok(/pushMeDockLineHistory\(ed, ed\.selection\.active\.line\)/.test(src),
     '★★飛ぶ前に今の行を積む= ◀ で元居た所へ戻れる(呼ばれた人を迷子にしない)', true);
  ok(/function meosMsUntilClock\(txt\)/.test(src) && /if \(t\.getTime\(\) <= now\.getTime\(\)\) t\.setDate\(t\.getDate\(\) \+ 1\);/.test(src),
     '★★時刻でも掛かる(過ぎていれば明日の同じ時刻)= 俊克「1時限目の終りの時刻」', true);
  ok(/\{ label: 'At a time…', m: -1/.test(src),
     '★メニューに「時刻で」that在る', true);
  ok(/const ms = untilMs \? Math\.max\(1000, untilMs\) :/.test(src),
     '★分でも時刻でも、中では同じ1つの物(ms)になる', true);
  ok(/const _held = _meosPseudoScopes\.get\(lk\);\n  if \(cur === 'pseudo' && _held && _held\.hold/.test(src),
     '★出口を閉めるのは、押さえた時計だけ(呼び鈴は閉めない)', true);
  ok(!/await meosSetViewMode\('pseudo'\);\n  meosUpdateTimerBar/.test(src),
     '★呼び鈴は掛けても見え方を変えない(Pseudoへ勝手に入れない)', true);
}

console.log('㊾ 連れ出したのはMeOSso、帰り道もMeOSthat出す(v4.0.454 俊克)');
{
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  ok(/let _meosReturnMark = null;/.test(src) && /function meosNoteReturnMark\(editor, name\)/.test(src),
     '★★連れ出す前に、居た所を控える', true);
  ok(src.indexOf(String.raw`_meosTimerBar.text = '\u21a9 Back'`) >= 0,
     '★★★帰り道は**時計thatが立っていたのと同じ枡**に出す(鐘の直前まで目thatそこに在った)', true);
  ok(/_meosTimerBar\.command = 'lai-membrane\.alarmReturn';/.test(src) && /registerCommand\('lai-membrane\.alarmReturn'/.test(src),
     '★押せる= 1手で戻れる', true);
  ok(/const mk = _meosReturnMark;\n  _meosReturnMark = null;/.test(src),
     '★戻ったら控えは消す(帰り道は1回きり)', true);
  ok(/function meosMembraneNameAtLine\(doc, line\)/.test(src),
     '★名札は膜の名前= 人は行番号でなく名前で場所を思い出す', true);
  ok(/\|\| await vscode\.workspace\.openTextDocument\(vscode\.Uri\.parse\(mk\.uri\)\)/.test(src),
     '★タブを閉じていても開き直して戻れる', true);
}

console.log('㊿ モードの駒と⏰は ⚠️ の右・2つに分ける(v4.0.455/456 俊克)');
{
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  const warn = src.indexOf('id="warn-n"></span></button></span><button class="fmt-btn raw-toggle" id="raw-toggle"');
  ok(warn >= 0, '★★★⚠️ の**すぐ右**に立つ(今この膜はどうなっているか、を言う列)', true);
  const fmtRow = src.indexOf('id="mew-cycle"');
  const fmtEnd = src.indexOf('mCN=dock_format', fmtRow);
  ok(fmtRow >= 0 && fmtEnd > fmtRow && src.slice(fmtRow, fmtEnd).indexOf('raw-toggle') < 0,
     '★Format Me の中には残っていない(そこだけ1文字も書かない駒thatだった)', true);
  ok(/id="raw-toggle"/.test(src) && /id="raw-timer"/.test(src),
     '★idは変えない= webview側の配線(getElementById)はそのまま生きる', true);
  // ★v4.0.456: ⏰ を独り立ちさせる
  ok(/<button class="warn-btn raw-timer" id="raw-timer"/.test(src),
     '★★★⏰は独り立ちした駒(右肩の15pxのバッジでは、どう塗っても目立たない)', true);
  ok(!/fmt-lvl raw-timer/.test(src),
     '★バッジの名残thatが無い', true);
  ok(/\.warn-btn\.raw-timer\{opacity:\.45/.test(src) && /\.warn-btn\.raw-timer\.running\{opacity:1/.test(src),
     '★★隣の ⚠️ と同じ作り(家の中の同じ役の部品を真似る)・走れば点く', true);
  ok(/rawToggle\.textContent=VM_FACE\[viewMode\];/.test(src),
     '★★★面はモードだけを言う= **1つの駒は1つのことを言う**(残り時間は⏰の持ち物)', true);
  ok(/if\(_rn\)_rn\.textContent=\(left>0\)\?vmMmSs\(left\):'';/.test(src),
     '★残り時間は⏰の中に出る(走っていなければ何も出さない)', true);
  ok(/\.fmt-btn\.raw-toggle\{margin-left:8px\}/.test(src),
     '★分けたので、モードの駒は自分で左の間合いを持つ', true);
  ok((src.match(/id="raw-timer"/g) || []).length === 1,
     '★駒は1つだけ(移したつもりで置き去りthat無い)', (src.match(/id="raw-timer"/g) || []).length);
}

console.log(ng ? ('NG ' + ng + '件') : '全項目 PASS');
process.exit(ng ? 1 : 0);
