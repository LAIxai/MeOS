// 開発用ツール(vsix除外): 引用(>)の飾りを実物で確かめる。
// v4.2.283(俊克「引用文記法も対応しようよ」): 本の作法= 字下げ・大きな引用符・出典の右寄せ。
// 使い方:  node src/check_quote.js
const fs=require('fs'),path=require('path'),Module=require('module');
const SRC='/Volumes/T7_SSD2TB/Claude Code/MeOS/src';
const H=fs.readFileSync(path.join(SRC,'check_fcpair.js'),'utf8');
const stub=eval('('+H.slice(H.indexOf('const stub = {'), H.indexOf('const origLoad')).replace(/^const stub = /,'').trim().replace(/;$/,'')+')');
const o=Module._load; Module._load=function(r){if(r==='vscode')return stub;return o.apply(this,arguments);};
const T='/tmp/mq_'+process.pid+'.js';
fs.writeFileSync(T, fs.readFileSync(path.join(SRC,'extension.js'),'utf8')
 +'\nmodule.exports.__t={meosQuoteLineParts,meosApplyQuoteDecorations,displayColumns};\n');
let X; try{X=require(T).__t;}finally{try{fs.unlinkSync(T);}catch(_){}}
let ng=0; const ok=(c,l,g)=>{console.log((c?'  ok  ':' NG   ')+l+(c?'':'   <- '+JSON.stringify(g)));if(!c)ng++;};

const L=['# t','ふつうの行',
 '> ミトコンドリアが無ければ、複雑な生命は無かった。','>',
 '> Markdownに、爆発的進化をもたらす。','> それがMeOS。','>','> ―― Spy Lai','',
 'ふつうの行'];
const doc={uri:{toString:()=>'file:///q.md',fsPath:'/q.md',scheme:'file'},languageId:'markdown',lineCount:L.length,
 lineAt:n=>({text:L[n],range:new stub.Range(n,0,n,L[n].length)}),getText:()=>L.join('\n'),eol:1,fileName:'/q.md',isClosed:false,version:1};
const seen=new Map();
const mkEd=(caret)=>({document:doc,visibleRanges:[new stub.Range(0,0,L.length-1,0)],
 selection:{active:{line:caret,character:0},anchor:{line:caret,character:0},isEmpty:true},
 selections:[{active:{line:caret,character:0},anchor:{line:caret,character:0},isEmpty:true}],
 setDecorations:(t,items)=>seen.set(t,items)});
const at=(x)=>(x.range||x).start.line;
const o2=(k)=>(k.__opts||{});

console.log('① 行を読む(> の数・中身・印の長さ)');
const q=X.meosQuoteLineParts('> それがMeOS。');
ok(!!q && q.level===1 && q.mark===2 && q.body==='それがMeOS。', '★`>`の数=階層 / 印の桁 / 中身を分けて読む', q);
ok(X.meosQuoteLineParts('>> 二重')?.level===2, '  >> は2階層', X.meosQuoteLineParts('>> 二重'));
ok(X.meosQuoteLineParts('ふつう')===null, '  引用でない行は null', true);

console.log('② 本の顔(字下げ・引用符・出典の右寄せ)');
X.meosApplyQuoteDecorations(mkEd(0));
const keys=[...seen.keys()];
const hide=keys.find(k=>/transparent !important/.test(String(o2(k).textDecoration||'')));
const mark=keys.find(k=>o2(k).before && o2(k).before.contentText==='“');
const pads=keys.filter(k=>o2(k).before && /ch$/.test(String(o2(k).before.width||'')));
ok((seen.get(hide)||[]).length===6, '★`>` の印は隠す(6行ぜんぶ)', (seen.get(hide)||[]).map(at));
ok((seen.get(mark)||[]).map(at).join()==='2', '★★大きな引用符は塊の頭に1つだけ(空の > には出さない)', (seen.get(mark)||[]).map(at));
ok(pads.length>=2, '  字下げの駒は幅ごとに1つ', pads.map(k=>o2(k).before.width));
{
 const used=pads.filter(k=>(seen.get(k)||[]).length).map(k=>[o2(k).before.width,(seen.get(k)||[]).map(at)]);
 const two=used.find(u=>u[0]==='2ch');
 ok(!!two && two[1].join()==='2,3,4,5,6', '★ふつうの引用行は2桁の字下げ', used);
 const attr=used.find(u=>u[0]!=='2ch');
 const wide=Math.max(...[2,4,5,7].map(i=>2+X.displayColumns(L[i].replace(/^> ?/,''))));
 ok(!!attr && attr[1].join()==='7' && attr[0]===(2+(wide-2-X.displayColumns('―― Spy Lai')-6))+'ch',
    '★★★出典(―― Spy Lai)は右寄せ・右端より6桁内側で止める(v4.2.285 俊克「離れ過ぎ」)', [attr, wide]);
}
{const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/borderWidth: '0 0 0 3px'/.test(S)
    && /const MEOS_QUOTE_RULE_DARK = '#cbb98c', MEOS_QUOTE_RULE_LIGHT = '#a8905a';/.test(S)
    && !/borderColor: new vscode\.ThemeColor\('textBlockQuote/.test(S),
    '★★罫と引用符は**家の色**(紙と同じクリームの縁)= テーマの引用色は暗い地に沈む(Monokai)', true);
 ok(/light: \{ before: bar\(MEOS_QUOTE_RULE_LIGHT\) \}, dark: \{ before: bar\(MEOS_QUOTE_RULE_DARK\) \}/.test(S)
    && /light: \{ before: qmark\(MEOS_QUOTE_RULE_LIGHT\) \}, dark: \{ before: qmark\(MEOS_QUOTE_RULE_DARK\) \}/.test(S),
    '  明るい地では濃い方に切り替える', true);}

console.log('③ カーソルの行は生のまま / 囲いの中は触らない');
X.meosApplyQuoteDecorations(mkEd(4));
{const h=(seen.get(hide)||[]).map(at); ok(!h.includes(4) && h.includes(2), '★その行だけ `>` を見せる', h);}
{
 const F=['# t','```','> 囲いの中の引用','```'];
 const fd={uri:{toString:()=>'file:///qf.md',fsPath:'/qf.md',scheme:'file'},languageId:'markdown',lineCount:F.length,
  lineAt:n=>({text:F[n],range:new stub.Range(n,0,n,F[n].length)}),getText:()=>F.join('\n'),eol:1,fileName:'/qf.md',isClosed:false,version:1};
 X.meosApplyQuoteDecorations({document:fd,visibleRanges:[new stub.Range(0,0,F.length-1,0)],
  selection:{active:{line:0,character:0},anchor:{line:0,character:0},isEmpty:true},
  selections:[{active:{line:0,character:0},anchor:{line:0,character:0},isEmpty:true}],
  setDecorations:(t,items)=>seen.set(t,items)});
 ok((seen.get(hide)||[]).length===0, '★★囲いの中の `>` は引用にしない(引用は文字)', (seen.get(hide)||[]).map(at));
}
console.log(ng ? ('NG ' + ng + '件') : '全項目 PASS');
