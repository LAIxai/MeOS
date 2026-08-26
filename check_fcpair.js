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
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meDockModeForEditor, isCursorOnMembraneLine, currentMembranePairForRename, meosPairBlockEnd, foldRangeEnd, collectPairs, meosIsPairBadgeSpec, meosRestampMembraneBlock, findCurrentPair, findNewMembraneOpenerLineAfterInsert, meosRestampNameForCreate, meosMembraneStamp, meosFcMarkPairRanges, meosFcMate, meosSpecPayloadKind, meosRowMarksInOrder, parseColorSpec, DARK_BG_KEYS, HIGHLIGHT_COLORS, meosTableBlockFor, meosSpecGroupPerLine, meosInsertIntoSpecLine, meosSpecLineGridOrder, MEOS_SPEC_LINE_ONE_RE, MEOS_SPEC_LINE_NONE_RE, meosMeTexTokens, meosConvertLegacyLine, meosLegacyHits, meosFcSplitForLine, meosInlineHeadHit, wrapInsertedMembraneBlock, membraneCommentTemplateForLanguage, meosLegacyPairBadgeHit, meosLegacyPairBadgeFix, refreshTrailingTimestamp, MEOS_NAME_TS_RE, copyMe, duplicateMe, shedCurrentMembrane, copyMyContents };\n', 'utf8');
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
  ok(at(0, P[0].indexOf('食べて') + 1) === null, '修飾のない所では細かくしない(行ぜんぶの橙に戻る)', true);
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
  ok(!!T.HIGHLIGHT_COLORS.yellowDeep, '少し暗い黄が在る', T.HIGHLIGHT_COLORS.yellowDeep);
  ok(T.parseColorSpec('(白/黄深)', 'bg').bgKey !== 'yellowDeep', '★名前が無いので生データには書けない', T.parseColorSpec('(白/黄深)', 'bg').bgKey);
  ok(/highlightBodyRangesByColor\.yellow = _keep/.test(src), '移すのは配る直前の1か所(押し込む口11か所は触らない)', true);
}

console.log(ng ? ('NG ' + ng + '件') : '全項目 PASS');
process.exit(ng ? 1 : 0);
