// 開発用ツール(vsix除外): コードブロック(```)の板を実物で確かめる。
//
// v4.2.256(俊克「インラインコードと同様に、コードブロックも奇麗にしようか?」)
// ★写経しない= extension.js の meosFenceBlocks / meosApplyCodeFenceDecorations をそのまま呼ぶ。
// 使い方:  node src/check_fence.js
const fs=require('fs'),path=require('path'),Module=require('module');
const SRC='/Volumes/T7_SSD2TB/Claude Code/MeOS/src';
const H=fs.readFileSync(path.join(SRC,'check_fcpair.js'),'utf8');
const stubSrc=H.slice(H.indexOf('const stub = {'), H.indexOf('const origLoad'));
const stub=eval('('+stubSrc.replace(/^const stub = /,'').trim().replace(/;$/,'')+')');
const o=Module._load; Module._load=function(r){if(r==='vscode')return stub;return o.apply(this,arguments);};
const T='/tmp/mf_'+process.pid+'.js';
fs.writeFileSync(T, fs.readFileSync(path.join(SRC,'extension.js'),'utf8')
 +'\nmodule.exports.__t={displayColumns,meosFenceBlocks,meosFenceLines,meosApplyCodeFenceDecorations,meosApplyCodeSpanDecorations,collectMembraneStructure};\n');
let X; try{X=require(T).__t;}finally{try{fs.unlinkSync(T);}catch(_){}}
const displayCols=(t)=>X.displayColumns(t);
let ng=0; const ok=(c,l,g)=>{console.log((c?'  ok  ':' NG   ')+l+(c?'':'   <- '+JSON.stringify(g)));if(!c)ng++;};

const L=[ '# t', 'まえがき `x.md` を見よ', '```js', 'const a = 1;', 'console.log(a);', '```', 'あとがき' ];
const doc={uri:{toString:()=>'file:///f.md',fsPath:'/f.md',scheme:'file'},languageId:'markdown',lineCount:L.length,
 lineAt:n=>({text:L[n],range:new stub.Range(n,0,n,L[n].length)}),getText:()=>L.join('\n'),eol:1,fileName:'/f.md',isClosed:false,version:1};
const seen=new Map();
const mkEd=(caret)=>({document:doc,visibleRanges:[new stub.Range(0,0,L.length-1,0)],
 selection:{active:{line:caret,character:0},anchor:{line:caret,character:0},isEmpty:true},
 selections:[{active:{line:caret,character:0},anchor:{line:caret,character:0},isEmpty:true}],
 setDecorations:(t,items)=>seen.set(t,items)});
const lineSet=(t)=>new Set((seen.get(t)||[]).map(x=>(x.range||x).start.line));
// ★v4.2.274: 型は幅ごとに作るso、並び順でなく**中身の指定**で見分ける(角丸と縁の幅で役that分かる)
const D=()=>{const a=[...seen.keys()], o=(k)=>(k.__opts||{});
  const pap=a.filter(k=>o(k).before && /ch$/.test(String(o(k).before.width||'')) && o(k).before.backgroundColor);
  return { head: pap.find(k=>o(k).before.borderRadius==='8px 8px 0 0'), foot: pap.find(k=>o(k).before.borderRadius==='0 0 8px 8px'),
           body: pap.find(k=>o(k).before.borderRadius==='0'),
           ink: a.find(k=>/color: #3b3020/.test(String((o(k).dark||{}).textDecoration||''))),
           tick: a.find(k=>/transparent !important/.test(String(o(k).textDecoration||''))),
           lang: a.find(k=>o(k).before && o(k).before.color==='#6b5a3a'),
           cap: (kind)=>{const r=(kind==='head')?'6px 6px 0 0':((kind==='foot')?'0 0 6px 6px':'0');
             return a.find(k=>o(k).before && /ch$/.test(String(o(k).before.width||'')) && o(k).before.borderRadius===r);} };};

console.log('① 囲みを1つの口で数える(板の口と、行番号の口that同じ走査から)');
const B=X.meosFenceBlocks(doc);
ok(B.length===1 && B[0].open===2 && B[0].close===5 && B[0].lang==='js', '★開き/閉じ/言語名を1つの塊として持つ', B);
const F=X.meosFenceLines(doc);
ok([2,3,4,5].every(n=>F.has(n)) && !F.has(1) && !F.has(6), '★行番号の口も同じ答え(インラインthatが中を触らない為)', [...F]);

console.log('② 板を描く(カーソルは囲みの外)');
X.meosApplyCodeFenceDecorations(mkEd(0));
const d=D();
ok([...lineSet(d.head)].join()==='2' && [...lineSet(d.foot)].join()==='4', '★開きの行=帯の頭・**最後の中身の行**=帯の足(閉じの ``` には紙を敷かない・v4.2.298)', [[...lineSet(d.head)],[...lineSet(d.foot)]]);
ok([...lineSet(d.body)].join()==='3', '★中身の行は角丸なしの板(足の行を除く)', [...lineSet(d.body)]);
ok([...lineSet(d.ink)].join()==='3,4' && (seen.get(d.ink)||[]).every(r=>r.end.character===L[r.start.line].length), '★濃い茶の字は中身の行だけ・行の端まで', [...lineSet(d.ink)]);
ok([...lineSet(d.tick)].join()==='2,5', '★``` の字は開き/閉じの両方とも透明に', [...lineSet(d.tick)]);
ok((seen.get(d.lang)||[]).length===1 && seen.get(d.lang)[0].renderOptions.before.contentText==='js', '★言語名は開きの行に1つだけ', seen.get(d.lang));

console.log('③ カーソルの居る行は生のまま(板は切らない)');
X.meosApplyCodeFenceDecorations(mkEd(2));
const d2=D();
ok([...lineSet(d2.head)].join()==='2', '★★板は残る= 紙に穴を開けない', [...lineSet(d2.head)]);
ok(!lineSet(d2.tick).has(2) && (seen.get(d2.lang)||[]).length===0, '★その行の ``` は見えたまま・言語名も出さない', [[...lineSet(d2.tick)],(seen.get(d2.lang)||[]).length]);
X.meosApplyCodeFenceDecorations(mkEd(3));
const d3=D();
ok(!lineSet(d3.ink).has(3) && lineSet(d3.ink).has(4) && lineSet(d3.body).has(3), '★中身も同じ約束(字は生・板は残す)', [[...lineSet(d3.ink)],[...lineSet(d3.body)]]);

console.log('④ 散文でないファイルには何も描かない');
const jsDoc=Object.assign({},doc,{languageId:'javascript',uri:{toString:()=>'file:///f.js',fsPath:'/f.js',scheme:'file'}});
X.meosApplyCodeFenceDecorations({document:jsDoc,visibleRanges:[new stub.Range(0,0,L.length-1,0)],
 selection:{active:{line:0,character:0},anchor:{line:0,character:0},isEmpty:true},
 selections:[{active:{line:0,character:0},anchor:{line:0,character:0},isEmpty:true}],
 setDecorations:(t,items)=>seen.set(t,items)});
const d4=D();
ok([d4.head,d4.foot,d4.body,d4.ink,d4.tick,d4.lang].every(t=>(seen.get(t)||[]).length===0), '  .js のファイルは素のまま(口は必ず空で閉じる)', true);

console.log('⑤ 閉じの ``` は「同じ字・同じ数以上・後ろに何も無い」時だけ(実測で出た穴)');
{
 const M=['# t','````md','`板` は1個の ` で囲む。','```js は3個。この囲みは4個。','````','あと書き','~~~python','print(1)','~~~','',"```js",'const unclosed = 1;'];
 const md={uri:{toString:()=>'file:///g.md',fsPath:'/g.md',scheme:'file'},languageId:'markdown',lineCount:M.length,
  lineAt:n=>({text:M[n],range:new stub.Range(n,0,n,M[n].length)}),getText:()=>M.join('\n'),eol:1,fileName:'/g.md',isClosed:false,version:1};
 const b=X.meosFenceBlocks(md);
 ok(b.length===2, '★囲みは2つ(4個で包んだ物・~~~の物)= 閉じていない物は囲いに数えない', b.map(x=>[x.open,x.close,x.lang]));
 ok(b[0] && b[0].open===1 && b[0].close===4, '★★4個で包んだ中の ```js は文字= 板は途中で切れない', b[0]);
 ok(b[1] && b[1].open===6 && b[1].close===8 && b[1].lang==='python', '★~~~ も同じ扱い(字が違えば閉じない)', b[1]);
 ok(!b.some(x=>x.open===10), '★★★閉じthat無い ``` は囲いではない(迷子1本で以後that沈まない・v4.2.258)', b);
 {
  const long=['# t','```js'].concat(Array.from({length:400},(_,i)=>'x'+i)).concat(['```']);
  const ld={uri:{toString:()=>'file:///h.md',fsPath:'/h.md',scheme:'file'},languageId:'markdown',lineCount:long.length,
   lineAt:n=>({text:long[n],range:new stub.Range(n,0,n,long[n].length)}),getText:()=>long.join('\n'),eol:1,fileName:'/h.md',isClosed:false,version:1};
  ok(X.meosFenceBlocks(ld).length===0, '★★長すぎる囲い(300行超)も数えない= 迷子の ``` that2本たまたま合っただけ', X.meosFenceBlocks(ld));
 }
}
console.log('⑥ 囲いの中は、ぜんぶ文字(俊克 バグ1/2 — 数える口は1つ)');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 const Q=['# t','```','<!-- {* ▼mCN=これは膜ではない_20260920S105400JST // c *} -->','<!-- {* ▲mCN=これは膜ではない_20260920S105400JST // c *} -->','```','<!-- {* ▼mCN=本物_20260920S105401JST // c *} -->','本文','<!-- {* ▲mCN=本物_20260920S105401JST // c *} -->'];
 const qd={uri:{toString:()=>'file:///q.md',fsPath:'/q.md',scheme:'file'},languageId:'markdown',lineCount:Q.length,
  lineAt:n=>({text:Q[n],range:new stub.Range(n,0,n,Q[n].length)}),getText:()=>Q.join('\n'),eol:1,fileName:'/q.md',isClosed:false,version:1};
 const st=X.collectMembraneStructure(qd,{excludeIndex:false});
 ok(st.pairs.length===1 && st.pairs[0].start===5, '★★★囲いの中の ▼▲ は対に数えない= 本物は下の1つだけ(俊克 バグ1)', st.pairs.map(p=>[p.start,p.end]));
 ok(st.unclosedOpens.length===0 && st.orphanCloses.length===0, '★★片割れの警告(⚠️)も出さない= 引用は片割れですらない', [st.unclosedOpens,st.orphanCloses]);
 ok(/_fenceSkip && _fenceSkip\.has\(i\)/.test(S), '  膜の対を数える口も、同じ1つの答え(meosFenceLines)を引く', true);
 ok(/if \(meosIsProseDoc\(document\) && meosFenceLines\(document\)\.has\(line\)\) return null;/.test(S),
    '★★★囲いの中の行は**膜行ではない**= 顔(殻を隠して▼を出す)も出さない(v4.2.275 紙だけthat長く見えた真因)', true);
 ok(/_inFence = !!\(_plFence && _plFence\.has\(line\)\);/.test(S) && !/_inFence = !_inFence/.test(S),
    '★★★見出し/箇条書きの口も自前で数えない(俊克 バグ2= ⑤から下の印that全部消えていた)', true);
 ok(/_fcFence && _fcFence\.has\(i\)/.test(S), '  ⏰の走査も同じ口', true);
}
console.log('⑦⑧ 紙は字の側の駒1枚(v4.2.280 — 予備の板は撤去・段をまたぐ)');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/height: \(kind === 'foot'\) \? \(\(rows \* 100\) \+ '%'\) : \('calc\(' \+ \(rows \* 100\) \+ '% \+ 1px\)'\)/.test(S)
    && /position: absolute; left: 0; top: 0; z-index: -1; border-radius: ' \+ radius \+ ' !important;/.test(S),
    '★★★駒は字の側(ch=字の1桁)・段の数だけ高い(継ぎ目は1点重ねる)・字の下(z-index:-1)・角丸は2つの口で言う', true);
 ok(/const MEOS_FENCE_RADIUS = '8px';/.test(S), '★角丸は8点(6点では見えなかった)', true);
 ok(!/_fencePaperTypes/.test(S) && !/meosFenceColPx/.test(S) && !/MEOS_FENCE_COL_RATIO/.test(S),
    '★★予備の板(点で見積もる方)は撤去= 段をまたぐ所で狭い板thatはみ出して「凹」に見えていた', true);
 ok(/const _rows = _wrapCol \? Math\.max\(1, Math\.min\(20, Math\.ceil\(meosRenderCols\(t\) \/ _wrapCol\)\)\) : 1;/.test(S),
    '★段の数= その行の桁 ÷ 折り返し幅(折り返さない設定なら1段)', true);
 ok(/function meosFenceWrapColumn\(doc\)/.test(S)
    && /getConfiguration\('editor', doc \? \{ uri: doc\.uri, languageId: doc\.languageId \} : undefined\)/.test(S),
    '★★設定は**その文書のつもり**で読む= [markdown]の61that効く(素で読むと全体の45で16桁食み出す)', true);
 ok(/z-index: 2; font-size: 0\.82em/.test(S), '  札は駒の上(z-index)', true);
 // ★v4.2.281: 字下げ(俊克 改良1「1文字分くらいのインデント」)
 ok(/const MEOS_FENCE_INDENT_COLS = 1;/.test(S)
    && /before: \{ contentText: ' ', width: MEOS_FENCE_INDENT_COLS \+ 'ch' \}/.test(S)
    && /return MEOS_FENCE_INDENT_COLS \+ c \+ MEOS_FENCE_PAD_COLS;/.test(S),
    '★★字下げ= 幅だけ持つ駒を行の頭に置く(本文は1字も変えない)・紙も其の分だけ広い', true);
 ok(/position: absolute; left: ' \+ MEOS_FENCE_INDENT_COLS \+ 'ch; z-index: 2;/.test(S),
    '  札も字下げに揃える(左から1桁)', true);
 X.meosApplyCodeFenceDecorations(mkEd(0));
 {const a=[...seen.keys()], o=(k)=>(k.__opts||{}), at=(x)=>(x.range||x).start.line;
  const caps=a.filter(k=>o(k).before && /ch$/.test(String(o(k).before.width||'')) && o(k).before.backgroundColor);
  ok(caps.length===3, '  頭・中・足の3つの型(幅と段が同じなら使い回す)', caps.map(k=>[o(k).before.width,o(k).before.borderRadius]));
  const head=caps.find(k=>o(k).before.borderRadius==='8px 8px 0 0');
  ok(head && head.__opts.before.width==='18ch' && (seen.get(head)||[]).map(at).join()==='2',
     '★★頭の駒= 1(字下げ)+15(一番長い行)+2(右の余白)=18桁・上の2つの角that丸い', head&&[head.__opts.before.width,(seen.get(head)||[]).map(at)]);
  const foot=caps.find(k=>o(k).before.borderRadius==='0 0 8px 8px');
  ok(foot && (seen.get(foot)||[]).map(at).join()==='4', '  足の駒= 下の2つの角that丸い(最後の中身の行)', foot&&(seen.get(foot)||[]).map(at));}
}
console.log(ng ? ('NG ' + ng + '件') : '全項目 PASS');
