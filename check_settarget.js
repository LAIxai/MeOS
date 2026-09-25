// 開発用ツール(vsix除外): ⏰パネルの Set の書き先(v4.2.392 足せる場所を閉じ膜と⏰FC群の下の空行に限る)。使い方: node src/check_settarget.js
const fs=require('fs'),path=require('path'),Module=require('module');
const SRC='/Volumes/T7_SSD2TB/Claude Code/MeOS/src';
const H=fs.readFileSync(path.join(SRC,'check_fcpair.js'),'utf8');
const stub=eval('('+H.slice(H.indexOf('const stub = {'), H.indexOf('const origLoad')).replace(/^const stub = /,'').trim().replace(/;$/,'')+')');
const o=Module._load; Module._load=function(r){if(r==='vscode')return stub;return o.apply(this,arguments);};
const T='/tmp/st_'+process.pid+'.js';
fs.writeFileSync(T, fs.readFileSync(path.join(SRC,'extension.js'),'utf8')+'\nmodule.exports.__t={meosClockSetTarget};\n');
const X=require(T).__t; fs.unlinkSync(T);
const N='目薬_20260925t100000JST';
const L=['<!-- {* ▼mCN='+N+' // c1 *} -->','本文1','本文2','<!-- {* ▲mCN='+N+' // c2 *} -->','<!-- Mew!FC mCN (📊⊕0+0D0W) -->','<!-- Mew!UFC ⏰ 2026-09-25 10:00 ↺8h // 目薬 -->','<!-- Mew!UFC ⏰ 2. ↺(5m)×2 // 目薬 1. -->','','外の本文'];
let n=0;
for (let ln=0; ln<L.length; ln++) {
  const doc={uri:{toString:()=>'file:///st'+(n++)+'.md',fsPath:'/st.md',scheme:'file'},languageId:'markdown',lineCount:L.length,version:1,lineAt:(i)=>({text:L[i],range:new stub.Range(i,0,i,L[i].length)}),getText:()=>L.join('\n'),eol:1,fileName:'/st.md'};
  const p=new stub.Position(ln,0); const ed={document:doc,selection:{active:p,anchor:p,start:p,end:p,isEmpty:true},selections:[],viewColumn:1};
  stub.window.activeTextEditor=ed; stub.window.visibleTextEditors=[ed];
  const r=X.meosClockSetTarget();
  console.log(String(ln).padStart(2), (r&&r.refused?'断る':JSON.stringify(r)).slice(0,70).padEnd(72), L[ln].slice(0,40));
}
