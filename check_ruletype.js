// 開発用ツール(vsix除外): 行頭の --- / - - / === を打つと罫線ボタンの形式になるか。
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
 const ed={document:doc,selection:null,selections:[{}],edit:async f=>{f({replace:(r,t)=>{L[r.start.line]=t;}});return true;}};
 stub.window.activeTextEditor=ed;return {doc,ed,L};}
const type=(d,line,ch,extra)=>{const col=d.L[line].length-ch.length;return X.meosMaybeRuleTyped(Object.assign({document:d.doc,contentChanges:[{text:ch,range:new stub.Range(line,col,line,col)}]},extra||{}));};
(async()=>{
 for(const [t,k,n] of [['---','---','実線'],['-.-','-.-','一点鎖線'],['-..-','-..-','二点鎖線'],['===','===','二重実線']]){
  const d=mk(['本文',t,'','次']);const f=type(d,1,t[t.length-1]);await tick();
  ok(f&&d.L[1]==='<!-- Mew!UFC '+k+' -->'&&X.MEOS_RULE_LINE_RE.test(d.L[1]),'★行頭の '+t+' → '+n,d.L);
  ok(d.ed.selection&&d.ed.selection.active.line===2,'★カーソルは罫線の次の行(ボタンと同じ)',d.ed.selection);}
 let d;
 d=mk(['本文','abc---']);type(d,1,'-');await tick();ok(d.L[1]==='abc---','行の途中は変換しない',d.L);
 d=mk(['本文','---abc']);ok(!X.meosMaybeRuleTyped({document:d.doc,contentChanges:[{text:'-',range:new stub.Range(1,2,1,2)}]}),'後ろに字がある行は変換しない');
 d=mk(['本文','----']);type(d,1,'-');await tick();ok(d.L[1]==='----','4字は変換しない',d.L);
 d=mk(['本文','  ---']);type(d,1,'-');await tick();ok(d.L[1]==='  ---','字下げは行頭でない',d.L);
 d=mk(['本文','--']);type(d,1,'-');await tick();ok(d.L[1]==='--','2字はまだ',d.L);
 d=mk(['本文','---']);X.meosMaybeRuleTyped({document:d.doc,contentChanges:[{text:'---',range:new stub.Range(1,0,1,0)}]});await tick();ok(d.L[1]==='---','貼り付けは変換しない',d.L);
 d=mk(['本文','---']);type(d,1,'-',{reason:1});await tick();ok(d.L[1]==='---','Undoでは変換しない',d.L);
 d=mk(['```','---','```']);type(d,1,'-');await tick();ok(d.L[1]==='---','コードブロックの中は文字のまま',d.L);
 d=mk(['---']);type(d,0,'-');await tick();ok(d.L[0]==='---','1行目の---はYAMLの頭',d.L);
 d=mk(['---','title: x','---']);type(d,2,'-');await tick();ok(d.L[2]==='---','YAMLの閉じも文字のまま',d.L);
 d=mk(['---','title: x','---','本文','---']);type(d,4,'-');await tick();ok(d.L[4]==='<!-- Mew!UFC --- -->','YAMLの後は変換する',d.L);
 d=mk(['本文','---'],'plaintext');type(d,1,'-');await tick();ok(d.L[1]==='---','Markdown以外は変換しない',d.L);
 d=mk(['本文','- -']);type(d,1,'-');await tick();ok(d.L[1]==='- -','★- - は箇条書きの入れ子なので変換しない',d.L);
 d=mk(['本文','-..']);type(d,1,'.');await tick();ok(d.L[1]==='-..','-.. はまだ',d.L);
 ['<!-- Mew!UFC --- -->','<!-- Mew!UFC === -->','<!-- Mew!UFC -.- -->','<!-- Mew!UFC -..- -->'].forEach((l,i)=>ok(X.meosStopKindOf(l)===i,'★種類 '+l+' = '+i,X.meosStopKindOf(l)));
 ok(X.MEOS_RULE_LINE_RE.test('<!-- Mew!UFC -..- -->'),'★-..- も一時停止線の行');
 ok(!X.MEOS_RULE_LINE_RE.test('<!-- Mew!UFC -...- -->'),'-...- は線ではない');
 ok((X.meosStopLineCss(3,1,0).match(/rgba|#e0803a/g)||[]).length===3,'★二点鎖線= 長い線+点2つ',X.meosStopLineCss(3,1,0));
 console.log(ng?('NG '+ng):'ALL OK');process.exit(ng?1:0);
})();
