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
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meDockModeForEditor, isCursorOnMembraneLine, currentMembranePairForRename, meosPairForBadgeLine, meosPairBlockEnd, foldRangeEnd, collectPairs, meosIsPairBadgeSpec, meosRestampMembraneBlock, meosLegacyPairBadgeHit, meosLegacyPairBadgeFix, refreshTrailingTimestamp, MEOS_NAME_TS_RE, copyMe, duplicateMe, shedCurrentMembrane, copyMyContents };\n', 'utf8');
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
  ok((T.meosPairForBadgeLine(doc, 3) || {}).id === NAME, 'FC行→膜が引ける', T.meosPairForBadgeLine(doc, 3));
}
console.log('⑤ 巻き添えが無いこと — 膜のバッジでないFC行は膜と認めない');
{
  const L = ['## 見出し', '<!-- Mew!FC H2 (白/赤)//[]tip= -->', '本文'];
  const ed = mkEd(L, 1, 10);
  ok(!T.isCursorOnMembraneLine(ed), '見出しのFC行は膜の行でない', true);
  ok(T.meDockModeForEditor(ed).mode === 'new', 'mode=new のまま', T.meDockModeForEditor(ed).mode);
  const L2 = ['ただの段落', '<!-- Mew!FC mCN (📊⊕0+0D0W) -->'];
  ok(T.meosPairForBadgeLine(makeDoc(L2), 1) === null, '真上が閉じ膜でなければ引かない', T.meosPairForBadgeLine(makeDoc(L2), 1));
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
  ok((T.meosPairForBadgeLine(makeDoc(L), 4) || {}).id === NAME, '2本目のFC行→同じ膜', T.meosPairForBadgeLine(makeDoc(L), 4));
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
  ok((T.meosPairForBadgeLine(doc2, 3) || {}).id === NAME, 'FC行から膜が引ける', T.meosPairForBadgeLine(doc2, 3));
  ok(T.meosLegacyPairBadgeHit(doc2, 0) === null, '🐱はもう鳴かない', true);
}

console.log(ng ? ('NG ' + ng + '件') : '全項目 PASS');
process.exit(ng ? 1 : 0);
