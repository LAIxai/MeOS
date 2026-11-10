// 開発用ツール(vsix除外): 記号だけの行で Enter を押すと一時停止線の形式になるか(v5.1.639 Enter で変換・8種類)。
// v5.1.634(俊克 11.10)  ★写経しない= extension.js の meosMaybeRuleTyped をそのまま呼ぶ。
// 使い方:  node src/check_ruletype.js
const fs=require('fs'),path=require('path'),Module=require('module');
const SRC=__dirname, H=fs.readFileSync(path.join(SRC,'check_fcpair.js'),'utf8');
const stubSrc=H.slice(H.indexOf('const stub = {'), H.indexOf('const origLoad'));
const stub=eval('('+stubSrc.replace(/^const stub = /,'').trim().replace(/;$/,'')+')');
const o=Module._load; Module._load=function(r){if(r==='vscode')return stub;return o.apply(this,arguments);};
const T='/tmp/mrt_'+process.pid+'.js';
fs.writeFileSync(T, fs.readFileSync(path.join(SRC,'extension.js'),'utf8')+'\nmodule.exports.__t={meosMaybeRuleTyped,MEOS_RULE_LINE_RE,meosStopKindOf,meosStopLineCss};');
let X; try{X=require(T).__t;}finally{try{fs.unlinkSync(T);}catch(_){}}
let ng=0; const ok=(c,l,g)=>{console.log((c?'  ok  ':' NG   ')+l+(c?'':'   <- '+JSON.stringify(g)));if(!c)ng++;};
const tick=()=>new Promise(r=>setTimeout(r,0));
let _n=0;
function mk(L,lang){const _id=++_n;const doc={uri:{toString:()=>'file:///f'+_id+'.md',fsPath:'/f'+_id+'.md',scheme:'file'},languageId:lang||'markdown',get lineCount(){return L.length;},
  lineAt:n=>({text:L[n],range:new stub.Range(n,0,n,L[n].length)}),getText:()=>L.join('\n'),eol:1,fileName:'/f.md',isClosed:false,version:_id};
 const ed={document:doc,selection:null,selections:[{}],edit:async f=>{f({replace:(r,t)=>{const a=r.start.line,b=r.end.line;L.splice(a,b-a+1,L[a].slice(0,r.start.character)+t+L[b].slice(r.end.character));}});return true;}};
 stub.window.activeTextEditor=ed;return {doc,ed,L};}
// Enter= 行末に改行が入った後の文書で、改行の変更が届く
const enter=(d,line,extra,col)=>{const c=col==null?d.L[line].length:col;return X.meosMaybeRuleTyped(Object.assign({document:d.doc,contentChanges:[{text:'\n',range:new stub.Range(line,c,line,c)}]},extra||{}));};
const type=(d,line,ch)=>{const col=d.L[line].length-ch.length;return X.meosMaybeRuleTyped({document:d.doc,contentChanges:[{text:ch,range:new stub.Range(line,col,line,col)}]});};
(async()=>{
 for(const [t,k,n] of [['---','---','実線'],['===','===','二重線'],['-.-','-.-','一点鎖線'],['-..-','-..-','二点鎖線'],['- -','- -','破線'],['...','...','点線'],['〜〜〜','〜〜〜','波線'],['～～～','〜〜〜','波線(全角チルダ)'],['≈≈≈','≈≈≈','二重波線']]){
  const d=mk(['本文',t,'','次']);const f=enter(d,1);await tick();
  ok(f&&d.L[1]==='<!-- Mew!UFC '+k+' -->'&&X.MEOS_RULE_LINE_RE.test(d.L[1])&&d.L[2]==='次'&&d.L.length===3,'★'+t+' + Enter → '+n+'・改行は残さない',d.L);
  ok(d.ed.selection&&d.ed.selection.active.line===2&&d.ed.selection.active.character===1,'★カーソルは線の次の行の行末(🛑ボタンと同じ)',d.ed.selection&&d.ed.selection.active);}
 {const d=mk(['本文','---','']);enter(d,1);await tick();ok(d.L.join('|')==='本文|<!-- Mew!UFC --- -->'&&d.ed.selection.active.line===1,'★最後の行で Enter= 線だけ・カーソルは線の行',d.L);}
 {const d=mk(['本文','---','  ']);X.meosMaybeRuleTyped({document:d.doc,contentChanges:[{text:'\n  ',range:new stub.Range(1,3,1,3)}]});await tick();ok(d.L.join('|')==='本文|<!-- Mew!UFC --- -->','自動の字下げが入った改行も取り消す',d.L);}
 let d;
 d=mk(['本文','..']);type(d,1,'.');await tick();ok(d.L[1]==='..'&&!type(mk(['本文','...']),1,'.'),'★... を打っただけでは変換しない(...そしての打ち始め)',d.L);
 d=mk(['本文','- - 項目','']);enter(d,1);await tick();ok(d.L[1]==='- - 項目','★箇条書きの入れ子 - - 項目 + Enter は変換しない',d.L);
 d=mk(['本文','---abc','']);enter(d,1);await tick();ok(d.L[1]==='---abc','後ろに字がある行は変換しない',d.L);
 d=mk(['本文','---','x']);enter(d,1,null,1);await tick();ok(d.L[1]==='---','行の途中の Enter は変換しない',d.L);
 d=mk(['本文','----','']);enter(d,1);await tick();ok(d.L[1]==='----','4字の --- は変換しない',d.L);
 d=mk(['本文','  ---','']);enter(d,1);await tick();ok(d.L[1]==='  ---','字下げは行頭でない',d.L);
 d=mk(['本文','---','']);X.meosMaybeRuleTyped({document:d.doc,contentChanges:[{text:'\na\nb',range:new stub.Range(1,3,1,3)}]});await tick();ok(d.L[1]==='---','改行を含む貼り付けは変換しない',d.L);
 d=mk(['本文','---','']);enter(d,1,{reason:1});await tick();ok(d.L[1]==='---','Undoでは変換しない',d.L);
 d=mk(['```','---','','```']);enter(d,1);await tick();ok(d.L[1]==='---','コードブロックの中は文字のまま',d.L);
 d=mk(['---','']);enter(d,0);await tick();ok(d.L[0]==='---','1行目の---はYAMLの頭',d.L);
 d=mk(['---','title: x','---','']);enter(d,2);await tick();ok(d.L[2]==='---','YAMLの閉じも文字のまま',d.L);
 d=mk(['---','title: x','---','本文','---','']);enter(d,4);await tick();ok(d.L[4]==='<!-- Mew!UFC --- -->','YAMLの後は変換する',d.L);
 d=mk(['本文','---',''],'plaintext');enter(d,1);await tick();ok(d.L[1]==='---','Markdown以外は変換しない',d.L);
 ['---','===','-.-','-..-','- -','...','〜〜〜','≈≈≈'].forEach((k,i)=>ok(X.meosStopKindOf('<!-- Mew!UFC '+k+' -->')===i,'★種類 '+k+' = '+i,X.meosStopKindOf('<!-- Mew!UFC '+k+' -->')));
 ok(X.meosStopKindOf('<!-- Mew!UFC ～～～ -->')===6,'全角チルダの波線も 6');
 ok(!X.MEOS_RULE_LINE_RE.test('<!-- Mew!UFC -...- -->')&&!X.MEOS_RULE_LINE_RE.test('<!-- Mew!UFC .. -->')&&!X.MEOS_RULE_LINE_RE.test('<!-- Mew!UFC 〜〜 -->'),'-...- / .. / 〜〜 は線ではない');
 ok(X.MEOS_RULE_LINE_RE.test('<!-- Mew!UFC - - - -->'),'- - - も破線の行');
 ok((X.meosStopLineCss(3,1,0).match(/rgba|#e0803a/g)||[]).length===3,'二点鎖線= 長い線+点2つ',X.meosStopLineCss(3,1,0));
 const w1=X.meosStopLineCss(6,1,0),w2=X.meosStopLineCss(7,1,0),dec=(u)=>Buffer.from((/base64,([^)]+)\)/.exec(u)||[])[1]||'','base64').toString();
 ok(/<pattern/.test(dec(w1))&&(dec(w1).match(/<path/g)||[]).length===1&&/ 6px no-repeat$/.test(w1),'★波線= SVGの模様・波1本・高さ6px',w1.slice(-40));
 ok((dec(w2).match(/<path/g)||[]).length===2&&/ 10px no-repeat$/.test(w2),'★二重波線= 波2本・高さ10px',w2.slice(-40));
 ok(/rgba\(22, 163, 74/.test(dec(X.meosStopLineCss(6,1,1))),'膜の境の波線は緑');
 console.log(ng?('NG '+ng):'ALL OK');process.exit(ng?1:0);
})();
