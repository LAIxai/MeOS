// ★v4.2.77: 仮想の起点 `v…` を本文に書く/止めると経過/再起動で戻す/済み・待ち・席替えで消す、を本物で動かす。
const fs=require('fs'),path=require('path'),Module=require('module');
const SRC='/Volumes/T7_SSD2TB/Claude Code/MeOS/src';
const H=fs.readFileSync(path.join(SRC,'check_fcpair.js'),'utf8');
const stub=eval('('+H.slice(H.indexOf('const stub = {'), H.indexOf('const origLoad')).replace(/^const stub = /,'').trim().replace(/;$/,'')+')');
let A=[];
class WE{constructor(){this.ops=[];} replace(u,r,t){this.ops.push(['r',r,t]);} insert(u,p,t){this.ops.push(['i',p,t]);} delete(u,r){this.ops.push(['d',r]);}}
stub.WorkspaceEdit=WE;
let ver=1;
stub.workspace.applyEdit=async(ed)=>{for(const o of ed.ops){ if(o[0]==='r'){A[o[1].start.line]=o[2];} else throw new Error('op '+o[0]);} ver++; return true;};
const o=Module._load; Module._load=function(r){if(r==='vscode')return stub;return o.apply(this,arguments);};
const T='/tmp/simv_'+process.pid+'.js';
fs.writeFileSync(T, fs.readFileSync(path.join(SRC,'extension.js'),'utf8')+'\nmodule.exports.__t={meosClockFcParse,meosClockFcScan,meosArmClockFcFor,meosClockStopHere,meosChainStartHere,meosClockFcSet,_meosChainStart,_meosPseudoScopes,_meosPseudoUntil,_meosPauseFreeze,meosChainAdvance,meosClockAdjustV,meosClockFmtElapsed};\n');
let X; try{X=require(T).__t;}finally{fs.unlinkSync(T);}
let ng=0; const ok=(c,l,g)=>{console.log((c?'  ok  ':' NG   ')+l+(c?'':'   <- '+JSON.stringify(g)));if(!c)ng++;};
const doc={uri:{toString:()=>'file:///v.md',fsPath:'/v.md',scheme:'file'},languageId:'markdown',get lineCount(){return A.length},get version(){return ver},
  lineAt:(i)=>({text:A[i],range:{start:{line:i,character:0},end:{line:i,character:A[i].length}}}),getText:()=>A.join('\n'),positionAt:()=>({line:0,character:0}),offsetAt:()=>0,isDirty:false};
const q=(w)=>X.meosClockFcParse('<!-- Mew!UFC ⏰ '+w+' -->')||{};
{const a=q('v2026-09-13 09:40:12 ↻1m ×1'), b=q('1. v2m25s ↻1m ×1'), c=q('2026-09-13 09:40:12 ↻1m ×1'), d=q('v45s ↺3m');
 ok(a.when===''&&a.vAt===new Date(2026,8,13,9,40,12).getTime(),'v起点= when は空・vAt',[a.when,a.vAt]);
 ok(b.when===''&&b.listNo==='1.'&&b.vElapsed===145000&&b.cycle.join()==='1m','v経過= 番号も周期も',[b.when,b.listNo,b.vElapsed]);
 ok(c.when==='2026-09-13 09:40:12'&&!c.vAt&&c.vElapsed===-1,'起点ありは v を持たない',[c.when,c.vAt]);
 ok(d.vElapsed===45000,'秒だけ',d.vElapsed);
 ok(X.meosClockFmtElapsed(145400)==='2m25s'&&X.meosClockFmtElapsed(3600e3+5e3)==='1h5s'&&X.meosClockFmtElapsed(0)==='0s','経過の字',[X.meosClockFmtElapsed(145400),X.meosClockFmtElapsed(3605e3)]);}
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 A=['# t','<!-- {* ▼mCN=V_1 // c *} -->','x','<!-- {* ▲mCN=V_1 // c *} -->','<!-- Mew!UFC ⏰ ↻10m ×1 -->'];
 X.meosArmClockFcFor(doc); await sleep(20);
 ok(/⏰ v\d{4}-\d\d-\d\d \d\d:\d\d/.test(A[4]),'★走り出すと v起点 を書く',A[4]);
 const w1=A[4]; ver++; X.meosArmClockFcFor(doc); await sleep(20);
 ok(A[4]===w1,'★値が同じなら書かない(輪が止まる)',A[4]);
 const lk='file:///v.md V_1';
 // 3分前に始めたことにする
 X._meosChainStart.set(lk, Date.now()-180e3); X.meosArmClockFcFor(doc); await sleep(20);
 ok(A[4]!==w1 && /v\d{4}/.test(A[4]),'覚えが動けば書き直す',A[4]);
 // 止める
 const sc=X._meosPseudoScopes.get(lk);
 ok(!!sc,'掛かっている',!!sc);
 await X.meosClockStopHere(doc,'V_1',4); await sleep(20);
 ok(/⏰⏸1? v3m ↻10m/.test(A[4]),'★止めると v経過 になる',A[4]);
 const p1=A[4]; ver++; X.meosArmClockFcFor(doc); await sleep(20);
 ok(A[4]===p1,'休んでいる間は書き換えない',A[4]);
 // 再起動= 覚えを全部消す
 X._meosChainStart.clear(); X._meosPseudoScopes.clear(); X._meosPauseFreeze.clear(); X._meosPseudoUntil.clear();
 await X.meosChainStartHere(doc,'V_1',4); await sleep(20);
 const b=X._meosChainStart.get(lk);
 ok(b && Math.abs((Date.now()-b)-180e3)<2000,'★再起動の後の再開は 止めた値(3m)から',b&&(Date.now()-b));
 ok(/⏰ v\d{4}-/.test(A[4]),'  本文は v起点 に戻る',A[4]);
 // 再起動= 走っている時
 const w2=A[4]; X._meosChainStart.clear(); X._meosPseudoScopes.clear(); X._meosPseudoUntil.clear(); ver++;
 X.meosArmClockFcFor(doc); await sleep(20);
 const b2=X._meosChainStart.get(lk);
 ok(b2 && Math.abs((Date.now()-b2)-180e3)<2000 && A[4]===w2,'★走っている時に再起動しても 0 に戻らない',[b2&&(Date.now()-b2),A[4]]);
 // 済み
 const c=X.meosClockFcScan(doc).find(x=>x.line===4);
 await X.meosClockFcSet(doc,'V_1',{when:'2026-01-01 00:00',cycle:c.cycle,up:c.up,rounds:c.rounds,cycleSrc:c.cycleSrc,whenSrc:c.whenSrc,done:true},4);
 ok(A[4]==='<!-- Mew!FC ⏰ ↻10m ×1✓ -->','★済みで v を消す(起点の字も書かない)',A[4]);
 // 連なり
 A=['# t','<!-- {* ▼mCN=W_1 // c *} -->','x','<!-- {* ▲mCN=W_1 // c *} -->','<!-- Mew!UFC ⏰ 1. 2026-09-13 09:00 ↻1m ×1 -->','<!-- Mew!FC ⏰ 2. v2026-09-13 09:10 ↻1m ×1 -->']; ver++;
 await X.meosChainAdvance(doc,'W_1'); await sleep(20);
 ok(A[4].indexOf(' v')<0 && /Mew!UFC ⏰ 2\. v/.test(A[5]) && A[5].indexOf('09:10')<0,'★席が回って来た1本は、残っていた v を使わず今から数える',[A[4],A[5]]);
 A[4]='<!-- Mew!UFC ⏰ 1. 2026-09-13 09:00 ↻1m ×1 -->'; A[5]='<!-- Mew!UFC ⏰ 2. v2026-09-13 09:10 ↻1m ×1 -->'; ver++;
 await X.meosClockFcSet(doc,'W_1',{when:'',cycle:['1m'],up:true,rounds:1,cycleSrc:'1m ×1',whenSrc:'2. v2026-09-13 09:10',wait:true},5);
 ok(/Mew!FC ⏰ 2\. ↻/.test(A[5]),'★待ちへ回る時も v を消す',A[5]);
 console.log(ng?('NG '+ng):'ALL PASS'); process.exit(0);
})();
