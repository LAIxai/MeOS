// 開発用ツール(vsix除外): 3つの見え方は**膜の性質**か? を実物で確かめる。
//
// v4.0.444(俊克 8/27 pm00:03「Rawとほぼ WYSIWYG 設定は、膜毎にその設定を保持するようにする。
//   つまり、基本は、通常モードである。…このようにしないと、テスト用紙膜だけ『ほぼWYSIWYG』で
//   タイマーをかけることもできないよ」)
// ★写経しない= extension.js の meosModeAtLine / meosModeScope / meosRawLines / meosFcWantsOpen を
//   **そのまま呼ぶ**。試すのは MeOS/viewmode-test_v4.0.442.md(本物のファイル)。
// 使い方:  node src/check_viewmode.js
const fs = require('fs'), path = require('path'), Module = require('module');
const SRCDIR = '/Volumes/T7_SSD2TB/Claude Code/MeOS/src';
const H = fs.readFileSync(path.join(SRCDIR, 'check_fcpair.js'), 'utf8');
const stubSrc = H.slice(H.indexOf('const stub = {'), H.indexOf('const origLoad'));
const stub = eval('(' + stubSrc.replace(/^const stub = /, '').trim().replace(/;$/, '') + ')');
const origLoad = Module._load;
Module._load = function (r) { if (r === 'vscode') return stub; return origLoad.apply(this, arguments); };
const TMP = '/tmp/meos_vm444_' + process.pid + '.js';
fs.writeFileSync(TMP, fs.readFileSync(path.join(SRCDIR, 'extension.js'), 'utf8')
  + '\nmodule.exports.__t={_meosViewMem,meosViewMeta,meosModeAtLine,meosModeScope,meosScopeMode,meosInheritedMode,meosScopeHasOwn,meosRawLines,meosFcWantsOpen,meosDefBlocks,collectPairs,bump:()=>{_meosModeEpoch++;}};\n');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }

const lines = fs.readFileSync('/Volumes/T7_SSD2TB/Claude Code/MeOS/viewmode-test_v4.0.442.md', 'utf8').split('\n');
const doc = {
  uri: { toString: () => 'file:///v.md', fsPath: '/v.md', scheme: 'file' }, languageId: 'markdown',
  lineCount: lines.length, lineAt: n => ({ text: lines[n], range: new stub.Range(n, 0, n, lines[n].length) }),
  getText: () => lines.join('\n'), eol: 1, fileName: '/v.md', isClosed: false, version: 1
};
const ed = (l) => { const p = new stub.Position(l, 0); return { document: doc, selection: { active: p, anchor: p, start: p, end: p, isEmpty: true }, selections: [], visibleRanges: [new stub.Range(0, 0, lines.length - 1, 0)] }; };
// 設定の入れ物は mMETA 随伴の per-file オブジェクト(v4.0.445)。ここではその中身を直に置いて確かめる。
const set = (name, mode) => { T.meosViewMeta(doc)[name] = mode; T.bump(); };
const clr = () => { T._meosViewMem.clear(); T.bump(); };
const OUT = '修飾の見本_20260827t103815JST', IN = '入れ子の膜_20260827t103820JST', Q = '小テスト_20260827t103830JST';
let ng = 0;
const ok = (c, label, got) => { console.log((c ? '  ok  ' : ' NG   ') + label + (c ? '' : '   <- ' + JSON.stringify(got))); if (!c) ng++; };
const modes = (lns) => lns.map(l => T.meosModeAtLine(doc, l - 1)).join(',');

console.log('(1) 何も設定していなければ、全部 normal');
clr();
ok(modes([5, 36, 95, 112, 137]) === 'normal,normal,normal,normal,normal', '既定は通常', modes([5, 36, 95, 112, 137]));
ok(T.meosModeAtLine(doc, 36) === 'normal', '地図をそもそも作らない(fast path)', true);
ok(T.meosScopeMode(T.meosModeScope(ed(35))) === 'normal', 'スコープの既定も通常', true);

console.log('(2) 外側の膜だけ Raw = その膜だけ。他の膜と膜の外は通常');
clr(); set(OUT, 'raw');
ok(modes([5, 36, 95, 112, 137]) === 'normal,raw,raw,normal,normal', '膜Aと入れ子だけ raw', modes([5, 36, 95, 112, 137]));

console.log('(3) 入れ子だけ Raw = 内側だけ。外側は通常のまま');
clr(); set(IN, 'raw');
ok(modes([36, 95, 112]) === 'normal,raw,normal', '入れ子だけ raw', modes([36, 95, 112]));

console.log('(4) 外=Raw / 内=Pseudo → 内側が勝つ(レキシカルスコープ)');
clr(); set(OUT, 'raw'); set(IN, 'pseudo');
ok(modes([36, 95, 112]) === 'raw,pseudo,normal', '内側が勝つ', modes([36, 95, 112]));

console.log('(5) 俊克の目的: テスト膜だけ Pseudo・他は普通に書ける');
clr(); set(Q, 'pseudo');
ok(modes([36, 95, 112, 137]) === 'normal,normal,pseudo,normal', '小テストだけ pseudo', modes([36, 95, 112, 137]));
const rl = T.meosRawLines(ed(35));   // カーソルは膜Aの中(通常)
ok(rl.has(35) && !rl.has(111), '通常の膜ではカーソル行が生 / Pseudoの膜は1行も生でない', [rl.has(35), rl.has(111)]);
const rl2 = T.meosRawLines(ed(111)); // カーソルはPseudoの膜の中
ok(!rl2.has(111), 'Pseudoの膜の中ではカーソル行も生にしない', rl2.has(111));

console.log('(6) Rawの膜は、カーソルが別の膜に居ても生のまま(スクロールしても変わらない)');
clr(); set(OUT, 'raw');
const rl3 = T.meosRawLines(ed(111));  // カーソルは小テスト(通常)
ok(rl3.has(35) && rl3.has(111) && !rl3.has(5), 'Raw膜は生 / カーソル行も生 / 膜の外は通常', [rl3.has(35), rl3.has(111), rl3.has(5)]);
ok(rl3.touches(29, 40) && !rl3.touches(0, 20), 'touches も帯を見る', [rl3.touches(29, 40), rl3.touches(0, 20)]);

console.log('(7) 膜の外を Raw = 地がRaw。設定を持つ膜だけ別扱い');
clr(); set('', 'raw'); set(Q, 'pseudo');
ok(modes([5, 36, 95, 112, 137]) === 'raw,raw,raw,pseudo,raw', '地がraw・小テストだけpseudo', modes([5, 36, 95, 112, 137]));

console.log('(8) FCの塊: 開くべき物は膜ごとに決まる');
clr(); set(OUT, 'raw'); set(Q, 'pseudo');
const fcb = T.meosDefBlocks(doc).filter(b => b.fc);
const openIn = (caret) => fcb.filter(b => T.meosFcWantsOpen(doc, b, caret)).map(b => b.start + 1);
const a = openIn(35), b = openIn(111), c = openIn(5);
ok(a.every(x => x >= 29 && x <= 102), 'Raw膜の塊だけ開く(カーソルも同じ膜)', a);
ok(JSON.stringify(b.filter(x => x >= 104)) === '[]', 'Pseudo膜の塊は1つも開かない(カーソルが中でも)', b.filter(x => x >= 104));
ok(b.length === a.length, 'カーソルが余所に居てもRaw膜は開いたまま', [a.length, b.length]);
ok(c.filter(x => x < 29).length === 0, '膜の外(通常)でカーソル行の塊が無ければ増えない', c.filter(x => x < 29));

console.log('(9) スコープ = カーソルを包む一番内側の膜');
clr();
ok(T.meosModeScope(ed(94)).name === IN, '入れ子の中 -> 入れ子', T.meosModeScope(ed(94)).name);
ok(T.meosModeScope(ed(35)).name === OUT, '膜Aの中 -> 膜A', T.meosModeScope(ed(35)).name);
ok(T.meosModeScope(ed(5)).name === '', '膜の外 -> 地', T.meosModeScope(ed(5)).name);
ok(T.meosModeScope(ed(35)).key === OUT, 'キーは膜名そのもの(mMETAにそのまま書ける形)', T.meosModeScope(ed(35)).key);

console.log('(10) 覚えた物は mMETA の形(膜名 -> モード)で残る = ファイルと一緒に旅する');
clr(); set(OUT, 'raw'); set(Q, 'pseudo');
const meta = T.meosViewMeta(doc);
ok(meta[OUT] === 'raw' && meta[Q] === 'pseudo' && Object.keys(meta).length === 2,
   '通常の膜は1つも書かれていない(既定は書かない)', JSON.stringify(meta));

console.log('(11) 中に含まれるすべてに適用される = レキシカルスコープ(v4.0.452 俊克 改良1)');
clr(); set(OUT, 'raw');
ok(T.meosScopeMode(T.meosModeScope(ed(94))) === 'raw',
   '★★★子膜は自分の設定を持たなくても、外側の言い分を受け継ぐ(面もそう言う)', T.meosScopeMode(T.meosModeScope(ed(94))));
ok(T.meosScopeHasOwn(T.meosModeScope(ed(94))) === false,
   '★受け継ぎだと分かる(面のtipが「外から来た」と言える)', true);
ok(T.meosInheritedMode(doc, IN) === 'raw', '外側の言い分は raw', T.meosInheritedMode(doc, IN));
clr(); set('', 'raw');
ok(modes([5, 36, 95, 112, 137]) === 'raw,raw,raw,raw,raw',
   '★★地を設定すれば、従来の「ファイル全体」と同じ形になる(俊克)', modes([5, 36, 95, 112, 137]));
ok(T.meosInheritedMode(doc, '') === 'normal', '地より外は無い', T.meosInheritedMode(doc, ''));

console.log('(12) 外がRawでも、子膜だけ通常にできる = 書くのは外側と違う時だけ');
clr(); set(OUT, 'raw'); set(IN, 'normal');
ok(T.meosModeAtLine(doc, 94) === 'normal' && T.meosModeAtLine(doc, 35) === 'raw',
   '★★★外=Raw の中で、子膜だけ通常(明示した normal that受け継ぎに勝つ)', modes([36, 95]));
ok(T.meosInheritedMode(doc, IN) === 'raw' && T.meosScopeMode(T.meosModeScope(ed(94))) === 'normal',
   '★受け継ぎは raw のまま・効いている値は normal', true);

// v4.1.154(俊克 9/6 am10:48 バグ1「⏰膜from文字カーソルthat出たのに開始膜と閉じ膜thatコメントのまま。
//   他の⏰膜は正常なのに、そこだけthatおかしい」= Rawを入れた膜thatが取り残されていた):
console.log('⑨ Raw は押した1つの物so、効く先も1つに揃える');
{
 const S=fs.readFileSync(path.join(SRCDIR,'extension.js'),'utf8');
 ok(/async function meosClearRawEverywhere\(doc\)/.test(S),
    '★残った raw を全部消す道that在る', true);
 ok(/const keys = Object\.keys\(view\)\.filter\(k => view\[k\] === 'raw'\);/.test(S),
    '★★消すのは「今 raw の膜」全部(カーソルの居る膜だけではない)', true);
 ok(/if \(ed && ed\.document && await meosClearRawEverywhere\(ed\.document\)\) return 'normal';/.test(S),
    '★★★raw thatどこかに残っていれば、押した意味は「消す」(入れる所と切る所を別にしない)', true);
 const _F=S.slice(S.indexOf('async function meosClearRawEverywhere'), S.indexOf('async function toggleRawMode'));
 ok(/meosHoldMstatSync\(20000\);/.test(_F) && /meosReleaseMstatSync\(\);/.test(_F),
    '★消している間はバッジを書かない(畳み直しthat自分の教科書を書き換えない= v4.1.1106)', true);
 ok(/for \(const k of keys\) \{ try \{ if \(ed\) await meosApplyFoldForMode\(ed, k, 'normal', 'raw'\); \}/.test(S),
    '  畳みも膜ごとに戻す(消した数だけ)', true);
}

console.log(ng ? ('NG ' + ng + '件') : '全項目 PASS');
process.exit(ng ? 1 : 0);
