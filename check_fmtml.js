// 開発用ツール(vsix除外): 取消線/ハイライトを複数行に押した時、行ごとに包むか(v4.2.383 俊克「取消線ボタンが複数行に対応しなくなっている」)。
// 使い方: node src/check_fmtml.js
const fs=require('fs'),path=require('path'),Module=require('module');
const SRC='/Volumes/T7_SSD2TB/Claude Code/MeOS/src';
const H=fs.readFileSync(path.join(SRC,'check_fcpair.js'),'utf8');
const stub=eval('('+H.slice(H.indexOf('const stub = {'), H.indexOf('const origLoad')).replace(/^const stub = /,'').trim().replace(/;$/,'')+')');
stub.Selection=class{constructor(a,b,c,d){if(typeof a==='object'){this.anchor=a;this.active=b;}else{this.anchor=new stub.Position(a,b);this.active=new stub.Position(c,d);}const s=(this.anchor.line<this.active.line||(this.anchor.line===this.active.line&&this.anchor.character<=this.active.character));this.start=s?this.anchor:this.active;this.end=s?this.active:this.anchor;this.isEmpty=this.start.line===this.end.line&&this.start.character===this.end.character;}};
stub.window.showTextDocument=async(d)=>ED; stub.window.visibleTextEditors=[];
const o=Module._load; Module._load=function(r){if(r==='vscode')return stub;return o.apply(this,arguments);};
const T='/tmp/ml_'+process.pid+'.js';
fs.writeFileSync(T, fs.readFileSync(path.join(SRC,'extension.js'),'utf8')+'\nmodule.exports.__t={insertFormatTemplate};\n');
const X=require(T).__t; fs.unlinkSync(T);
let ver=1;
function mk(lines,sl,sc,el,ec){const cur=lines.slice();const doc={uri:{toString:()=>'file:///ml'+Math.random()+'.md',fsPath:'/ml.md',scheme:'file'},languageId:'markdown',get lineCount(){return cur.length},get version(){return ver},
 lineAt:(n)=>({text:cur[n],range:new stub.Range(n,0,n,cur[n].length)}),getText:()=>cur.join('\n'),eol:1,fileName:'/ml.md',isClosed:false,
 offsetAt:(p)=>{let o=0;for(let i=0;i<p.line;i++)o+=cur[i].length+1;return o+p.character;},positionAt:(off)=>{let l=0;while(l<cur.length&&off>cur[l].length){off-=cur[l].length+1;l++;}return new stub.Position(l,off);}};
 const ed={document:doc,viewColumn:1,selection:new stub.Selection(sl,sc,el,ec),selections:[],revealRange(){},
  edit:(fn)=>{const edits=[];fn({insert:(p,t)=>edits.push({s:p,e:p,t}),delete:(r)=>edits.push({s:r.start,e:r.end,t:''}),replace:(r,t)=>edits.push({s:r.start,e:r.end,t})});
   edits.sort((a,b)=>(b.s.line-a.s.line)||(b.s.character-a.s.character));for(const e of edits){const m=cur[e.s.line].slice(0,e.s.character)+e.t+(cur[e.e.line]||'').slice(e.e.character);cur.splice(e.s.line,e.e.line-e.s.line+1,...m.split('\n'));}ver++;return Promise.resolve(true);},__lines:cur};
 return ed;}
let ED;
(async()=>{
 const L=['v4.2.381 で、札の地を明るい灰にしました。','','- 地が明るくなると、字も明るく。','- 枠はオレンジを少し濃く。','','明るさが足りなければ言ってください。'];
 ED=mk(L,0,0,5,L[5].length);
 try{ await X.insertFormatTemplate('strike',ED,'赤','',0,{}); }catch(e){console.log('ERR',e.stack.split('\n').slice(0,4).join('\n'));}
 const want=['~~v4.2.381 で、札の地を明るい灰にしました。~~','<!-- Mew!FC ~~ (赤/) -->','','- ~~地が明るくなると、字も明るく。~~','<!-- Mew!FC ~~ (赤/) -->','- ~~枠はオレンジを少し濃く。~~','<!-- Mew!FC ~~ (赤/) -->','','~~明るさが足りなければ言ってください。~~','<!-- Mew!FC ~~ (赤/) -->'];
 const ok=ED.__lines.join('\n')===want.join('\n'); console.log((ok?'  ok  ':' NG   ')+'取消線を複数行(段落・空行・箇条書き)に押すと行ごとに包む(v4.2.383)'); if(!ok){console.log(ED.__lines.join('\n'));process.exit(1);}
})();
