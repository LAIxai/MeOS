// 開発用ツール(vsix除外): v5.1.94 ⏰の鎖の印(⛓️⤵️N / ⛓️⤴️N)×M)を実物の関数で確かめる。
// 俊克 10.20「⛓️⤵️2 = ここを含めて2つのタイマーが連動」「⛓️⤴️2)×3 = 2つ前に戻って、それを3回繰り返す」「印の無い行は独立」
// 使い方:  node src/check_chain.js
const fs=require('fs'),path=require('path'),Module=require('module');
const SRC='/Volumes/T7_SSD2TB/Claude Code/MeOS/src';
const H=fs.readFileSync(path.join(SRC,'check_fcpair.js'),'utf8');
const stubSrc=H.slice(H.indexOf('const stub = {'), H.indexOf('const origLoad'));
const stub=eval('('+stubSrc.replace(/^const stub = /,'').trim().replace(/;$/,'')+')');
const o=Module._load; Module._load=function(r){if(r==='vscode')return stub;return o.apply(this,arguments);};
const T='/tmp/mch_'+process.pid+'.js';
fs.writeFileSync(T, fs.readFileSync(path.join(SRC,'extension.js'),'utf8')
 +'\nmodule.exports.__t={meosClockFcParse,meosClockFcScan,meosChainNextRow,meosChainLinks,meosChainTokenSplit,meosChainTokenText,meosChainResetLoops,_meosChainLoops,meosPanelCycleOpts,meosClockFcSet};\n');
let X; try{X=require(T).__t;}finally{try{fs.unlinkSync(T);}catch(_){}}
let ng=0; const ok=(c,l,g)=>{console.log((c?'  ok  ':' NG   ')+l+(c?'':'   <- '+JSON.stringify(g)));if(!c)ng++;};
const mk=(uri,lines)=>({uri:{toString:()=>uri,fsPath:'/x.md',scheme:'file'},languageId:'markdown',lineCount:lines.length,
 lineAt:n=>({text:lines[n],range:new stub.Range(n,0,n,lines[n].length)}),getText:()=>lines.join('\n'),eol:1,fileName:'/x.md',isClosed:false,version:1});

console.log('① 読む');
let c=X.meosClockFcParse('<!-- Mew!UFC ⏰ 🔔/🔔 ↺↻(20s)×1 ⛓️⤵️2 // work -->');
ok(c && c.chainDir==='down' && c.chainN===2 && c.chainReps===0, '⛓️⤵️2 = 下へ2本', c&&[c.chainDir,c.chainN,c.chainReps]);
ok(c && c.rounds===1 && c.cycleSrc==='(20s)×1', '★周期は鎖の印に汚されない', c&&[c.rounds,c.cycleSrc]);
ok(c && c.title==='work', 'タイトルもそのまま', c&&c.title);
c=X.meosClockFcParse('<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(10s)×1 ⛓️⤴️2)×3 // rest -->');
ok(c && c.chainDir==='up' && c.chainN===2 && c.chainReps===3, '⛓️⤴️2)×3 = 2本戻って3回', c&&[c.chainDir,c.chainN,c.chainReps]);
ok(c && c.rounds===1, '★`)×3` を周期の回数と読まない', c&&c.rounds);
c=X.meosClockFcParse('<!-- Mew!UFC ⏰ 🔔/🔔 ↺↻(10m)×1 // ☕Break ⛓⤴2 -->');
ok(c && c.chainDir==='up' && c.chainReps===0 && c.title==='☕Break', 'タイトルの後ろ・素の字でも読む(×M 無し= 戻り続ける)', c&&[c.chainDir,c.chainReps,c.title]);
ok(c && c.chainSrc==='⛓️⤴️2', '書く形は1つ(異体字セレクタ付き)', c&&c.chainSrc);
c=X.meosClockFcParse('<!-- Mew!UFC ⏰ 🔔/🔔 ↺↻0y0d0h3m ×1 // 3 minutes -->');
ok(c && !c.chainSrc, '印の無い行は鎖を持たない', c&&c.chainSrc);
const po=X.meosPanelCycleOpts(true,'(25m 5m)×4 ⛓️⤵️2');
ok(po.chainSrc==='⛓️⤵️2' && po.rounds===4 && po.cycleSrc==='(25m 5m)×4', 'パネルの箱からも鎖を分けて読む', po);

console.log('② HIIT(20秒/10秒 ×3)');
const head=['<!-- {* ▼mCN=H_1 // c *} -->','x','<!-- {* ▲mCN=H_1 // c *} -->'];
let L=head.concat(['<!-- Mew!UFC ⏰ 🔔/🔔 ↺↻(20s)×1 ⛓️⤵️2 // work -->','<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(10s)×1 ⛓️⤴️2)×3 // rest -->','<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(5m)×1 // cool down -->']);
let d=mk('file:///h.md',L);
const rows=X.meosClockFcScan(d).filter(r=>r.key==='H_1');
ok(rows.length===3, '3本拾う', rows.length);
const seq=[]; let at=rows[0].line;
for(let k=0;k<8;k++){ seq.push(at); const n=X.meosChainNextRow(d,'H_1',at,true); if(!n) break; at=n.line; }
const nm=seq.map(l=>l-3);   // 0=work 1=rest 2=cool
ok(JSON.stringify(nm)===JSON.stringify([0,1,0,1,0,1]), '★work→rest を3回で止まる(下の cool down は鎖の外= 独立)', nm);
ok(X._meosChainLoops.size===0, '回数の覚えは終わったら消える', X._meosChainLoops.size);
ok(X.meosChainNextRow(d,'H_1',rows[0].line,false).line===rows[1].line, '覗くだけなら数えない', 0);

console.log('③ ⤵️3 なら cool down まで');
L[3]=L[3].replace('⛓️⤵️2','⛓️⤵️3'); d=mk('file:///h2.md',L); X.meosChainResetLoops(d,'H_1');
const s2=[]; at=X.meosClockFcScan(d)[0].line;
for(let k=0;k<10;k++){ s2.push(at-3); const n=X.meosChainNextRow(d,'H_1',at,true); if(!n) break; at=n.line; }
ok(JSON.stringify(s2)===JSON.stringify([0,1,0,1,0,1,2]), '★3回のあと cool down へ進んで止まる', s2);

console.log('④ 印の無い膜(⏰のデータベース)は連動しない');
const L4=head.concat(['<!-- Mew!UFC ⏰ 🔔/🔔 ↺↻0y0d0h3m ×1 // 3 minutes -->','<!-- Mew!FC ⏰ 🔔/🔔 ↺↻0y0d0h25m ×1 // 25 minutes -->','<!-- Mew!FC ⏰ 🔔/🔔 ↺↻0y0d1h0m ×1 // 1 hour -->']);
const d4=mk('file:///db.md',L4);
ok(X.meosChainNextRow(d4,'H_1',3,true)===null, '★3分の次は無い(25分も1時間も勝手に走らない)', 0);

console.log('⑤ ポモドーロ(×M 無し= 戻り続ける)');
const L5=head.concat(['<!-- Mew!UFC ⏰ 🔔/🔔 ↺↻(25m 5m)×4 ⛓️⤵️2 // 🍅Pomodoro 1. -->','<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(10m)×1 ⛓️⤴️2 // ☕Break -->']);
const d5=mk('file:///p.md',L5); const s5=[]; at=3;
for(let k=0;k<6;k++){ s5.push(at-3); const n=X.meosChainNextRow(d5,'H_1',at,true); if(!n) break; at=n.line; }
ok(JSON.stringify(s5)===JSON.stringify([0,1,0,1,0,1]), '★🍅→☕→🍅… と回り続ける', s5);


console.log('⑥ 書き直しても鎖の印は残る(書く口)');
(async()=>{
 const W=[]; stub.WorkspaceEdit=class{replace(u,r,t){W.push(t);} insert(u,p,t){W.push(t);} delete(){}}; stub.workspace.applyEdit=()=>Promise.resolve(true);
 const L6=head.concat(['<!-- Mew!UFC ⏰ 🔔/🔔 ↺↻(20s)×1 ⛓️⤵️2 // work -->','<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(10s)×1 ⛓️⤴️2)×3 // rest -->']);
 const d6=mk('file:///w.md',L6); const r6=X.meosClockFcScan(d6);
 await X.meosClockFcSet(d6,'H_1',{ when:'', cycle:r6[1].cycle, rounds:r6[1].rounds, cycleSrc:r6[1].cycleSrc, up:false, dual:true, done:false },r6[1].line);
 ok(W.length===1 && W[0].indexOf('⛓️⤴️2)×3')>0 && W[0].indexOf('// rest')>0, '★呼び手が鎖を知らなくても、名指しの行の印を運ぶ', W);
 ok(W[0] && X.meosClockFcParse(W[0]).rounds===1 && X.meosClockFcParse(W[0]).chainReps===3, '書いた行を読み直しても同じ', W[0]);
 W.length=0;
 await X.meosClockFcSet(d6,'H_1',{ when:'', cycle:r6[1].cycle, rounds:1, cycleSrc:'(10s)×1', up:false, dual:true, done:false, chainSrc:'' },r6[1].line);
 ok(W[0] && W[0].indexOf('⛓')<0, 'パネルの箱で消した印は消える(chainSrc:\'\')', W[0]);
 console.log(ng?('NG '+ng):'ALL PASS'); process.exit(ng?1:0);
})();
