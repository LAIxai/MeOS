// ★v4.2.89: 長さの無い一度きりで起点が過去= その時刻から数え続けるストップウォッチ(鐘なし)。本物をロードして確かめる。
const fs=require('fs'),path=require('path'),Module=require('module');
const SRC='/Volumes/T7_SSD2TB/Claude Code/MeOS/src';
const H=fs.readFileSync(path.join(SRC,'check_fcpair.js'),'utf8');
const stub=eval('('+H.slice(H.indexOf('const stub = {'), H.indexOf('const origLoad')).replace(/^const stub = /,'').trim().replace(/;$/,'')+')');
let A=[]; let ver=1;
class WE{constructor(){this.ops=[];} replace(u,r,t){this.ops.push(['r',r,t]);} insert(u,p,t){this.ops.push(['i',p,t]);} delete(u,r){this.ops.push(['d',r]);}}
stub.WorkspaceEdit=WE;
stub.workspace.applyEdit=async(ed)=>{for(const o of ed.ops){ if(o[0]==='r'){A[o[1].start.line]=o[2];} else if(o[0]==='i'){A.splice(o[1].line,0,o[2].replace(/\n$/,''));} else throw new Error('op '+o[0]);} ver++; return true;};
const o=Module._load; Module._load=function(r){if(r==='vscode')return stub;return o.apply(this,arguments);};
const T='/tmp/ps2_'+process.pid+'.js';
fs.writeFileSync(T, fs.readFileSync(path.join(SRC,'extension.js'),'utf8')+'\nmodule.exports.__t={meosArmClockFcFor,_meosPseudoScopes,_meosPseudoUntil,_meosClockUnreadable,meosClockFaceForLine,meosClockFaceMs,meosMmSs};\n');
const X=require(T).__t; fs.unlinkSync(T);
const doc={uri:{toString:()=>'file:///p.md',fsPath:'/p.md',scheme:'file'},languageId:'markdown',get lineCount(){return A.length},get version(){return ver},
  lineAt:(i)=>({text:A[i],range:{start:{line:i,character:0},end:{line:i,character:A[i].length}}}),getText:()=>A.join('\n'),positionAt:()=>({line:0,character:0}),offsetAt:()=>0};
(async()=>{
 const R=[];
 const past=new Date(Date.now()-90*60e3); const p2=(x)=>(x<10?'0':'')+x;
 const st=past.getFullYear()+'-'+p2(past.getMonth()+1)+'-'+p2(past.getDate())+' '+p2(past.getHours())+':'+p2(past.getMinutes());
 for (const L of ['<!-- Mew!UFC ⏰ '+st+'p ↻ -->','<!-- Mew!UFC ⏰ '+st+' ↺↻ -->','<!-- Mew!UFC ⏰ '+st+' ↺ -->']) {
  A=['# t','<!-- {* ▼mCN=Q_1 // c *} -->','x','<!-- {* ▲mCN=Q_1 // c *} -->',L]; ver++;
  X._meosPseudoScopes.clear(); X._meosPseudoUntil.clear();
  X.meosArmClockFcFor(doc); await new Promise(r=>setTimeout(r,40));
  const sc=X._meosPseudoScopes.get('file:///p.md Q_1'); const u=X._meosPseudoUntil.get('file:///p.md Q_1');
  R.push({L, armed:!!sc, ms: sc? X.meosClockFaceMs(u,sc):-1, line:A[4], unread:[...(X._meosClockUnreadable.get('file:///p.md')||[])].length});
 }
 let ng=0; const ok=(c,l,g)=>{console.log((c?'  ok  ':' NG   ')+l+(c?'':'   <- '+JSON.stringify(g)));if(!c)ng++;};
 ok(R[0].armed && Math.abs(R[0].ms-90*60e3)<61e3 && R[0].unread===0, '★★★過去の起点 ↻(長さなし)= 起点から数え続ける(⚠️にしない)', R[0]);
 ok(R[1].armed && Math.abs(R[1].ms-90*60e3)<61e3 && /p ↺↻/.test(R[1].line), '★★ ↺↻ でも数え続ける・起点に p が付く', R[1]);
 ok(!R[2].armed && R[2].unread===1, '  ↺ だけ(過去へ向かう逆算)は今までどおり ⚠️', R[2]);
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/const _past89 = !w && !\(_opts\.cycle && _opts\.cycle\.length\) && _loose89 && _loose89\.getTime\(\) <= Date\.now\(\);/.test(S) && /if \(_past89\) \{ _opts\.up = true; _opts\.dual = false; \}/.test(S),
    '★★パネルの一度きりも過去を受け、↻ だけで書く', true);
 console.log(ng?('NG '+ng):'ALL PASS'); process.exit(0);
})();
