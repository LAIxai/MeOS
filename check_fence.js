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
const D=()=>{const a=[...seen.keys()];return {head:a[1],foot:a[2],body:a[0],ink:a[3],tick:a[4],lang:a[5]};};

console.log('① 囲みを1つの口で数える(板の口と、行番号の口that同じ走査から)');
const B=X.meosFenceBlocks(doc);
ok(B.length===1 && B[0].open===2 && B[0].close===5 && B[0].lang==='js', '★開き/閉じ/言語名を1つの塊として持つ', B);
const F=X.meosFenceLines(doc);
ok([2,3,4,5].every(n=>F.has(n)) && !F.has(1) && !F.has(6), '★行番号の口も同じ答え(インラインthatが中を触らない為)', [...F]);

console.log('② 板を描く(カーソルは囲みの外)');
X.meosApplyCodeFenceDecorations(mkEd(0));
const d=D();
ok([...lineSet(d.head)].join()==='2' && [...lineSet(d.foot)].join()==='5', '★開きの行=帯の頭・閉じの行=帯の足(角丸はここだけ)', [[...lineSet(d.head)],[...lineSet(d.foot)]]);
ok([...lineSet(d.body)].join()==='3,4', '★中身の行は角丸なしの板', [...lineSet(d.body)]);
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
 ok(/_inFence = !!\(_plFence && _plFence\.has\(line\)\);/.test(S) && !/_inFence = !_inFence/.test(S),
    '★★★見出し/箇条書きの口も自前で数えない(俊克 バグ2= ⑤から下の印that全部消えていた)', true);
 ok(/_fcFence && _fcFence\.has\(i\)/.test(S), '  ⏰の走査も同じ口', true);
}
console.log('⑦ 紙は窓いっぱい(v4.2.262 — 埋め草の道は捨てた)');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/isWholeLine: true, backgroundColor: CREAM, borderStyle: 'solid'/.test(S),
    '★★紙は行いっぱい= VS Codeで窓の端まで敷ける唯一の道', true);
 ok(!/_slabItem/.test(S) && !/meosWrapColumn/.test(S) && !/contentText: ' '\.repeat\(pad\)/.test(S),
    '★★埋め草(空白で幅を作る道)は残骸ごと捨てた= font と行の高さに振り回される道は選ばない', true);
 X.meosApplyCodeFenceDecorations(mkEd(0));
 const d=D();
 ok((seen.get(d.body)||[]).every(x=>!x.renderOptions) && (seen.get(d.head)||[]).every(x=>!x.renderOptions),
    '  1行に1つの駒だけ(字の無い箱を継がない)', true);
 ok(/position: absolute; font-size: 0\.82em/.test(S), '★札は幅を取らない(隠した ``` の上に浮かせる)', true);
 ok(/const MEOS_FENCE_RIGHT_GAP = 44;/.test(S)
    && /MEOS_FENCE_RIGHT_GAP \+ 'px '/.test(S) && /' ' \+ CUT \+ ' '/.test(S),
    '★★★右端は「引く」でなく「隠す」= 地の色の太い縁(窓の幅を知らなくても短くなる・v4.2.265)', true);
 ok(!/width: calc\(100% - /.test(S), '  効かなかった道(中身の幅から引く)は残骸を置かない', true);
 ok(/const slab = \(radius, top, bottom\)/.test(S) && /\(top \? '1px ' : '0 '\)/.test(S) && /\(bottom \? '1px ' : '0 '\)/.test(S)
    && !/0 3px/.test(S.slice(S.indexOf('const slab = (radius, top, bottom)'), S.indexOf('fenceSlabDeco ='))),
    '★★左の縁はインラインと同じ1px・頭に上の縁・足に下の縁= 3辺を細い縁that囲う(俊克 改良2「左端の色thatズレている」)', true);
 ok(/const CUT = 'var\(--vscode-editor-background\)';/.test(S),
    '  右だけは縁でなく幕(地の色)= 切っている所so縁を引かない', true);
}
console.log(ng ? ('NG ' + ng + '件') : '全項目 PASS');
