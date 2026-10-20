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
 +'\nmodule.exports.__t={meosClockFcParse,meosClockFcScan,meosChainNextRow,meosChainLinks,meosChainTokenSplit,meosChainTokenText,meosChainResetLoops,_meosChainLoops,meosPanelCycleOpts,meosClockFcSet,meosTimerDbMovePlan,meosClockChainMarkAt,meosTimerDbText,MEOS_TIMER_DB_CHAIN_EX,meosClockAtLine,meosIsTimerDbKey,meosClockNudgeHitAt,meosClockChainHitAt};\n');
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


console.log('⑦ ⏰のデータベース膜を mMETA の手前へ(v5.1.95)');
{
 const DB=['<!-- {* ▼mCN=⏰0y0d0h3m_20261020T082405JST // c *} -->','Timer database','<!-- {* ▲mCN=⏰0y0d0h3m_20261020T082405JST // c *} -->','<!-- Mew!FC mCN (📊⊕0+0D0W) -->','<!-- Mew!FC ⏰ 🔔/🔔 ↺↻0y0d0h3m ×1 // 3 minutes -->','<!-- Mew!FC ⏰ 🔔/🔔 ↺↻0y0d0h25m ×1 // 25 minutes -->'];
 const META=['<!-- {* ▼mCN=mMETA // MeOS metadata — do not edit (📊⊖f0+0D0W) *} -->','<!-- mHTOC1 x -->','<!-- {* ▲mCN=mMETA // end *} -->'];
 const L7=['# t','本文に引用 ▼mCN=mMETA の字',''].concat(DB,['','続きの日記','']).concat(META);
 const d7=mk('file:///m.md',L7); const mv=X.meosTimerDbMovePlan(d7,3);
 ok(mv && mv.from===3 && mv.blockEnd===9 && mv.to===10 && mv.mmLine===12, '★途中に居る膜= 開始膜〜⏰の行(+後ろの空行)を本物の mMETA の前へ', mv);
 const L8=['# t','続きの日記',''].concat(DB,['']).concat(META);
 ok(X.meosTimerDbMovePlan(mk('file:///m2.md',L8),3)===null, '既に手前(間は空行だけ)なら動かさない', 0);
}

console.log('⑧ 切れた鎖 ⛓️‍💥 (v5.1.96)');
{
 const t1='<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(10s)×1 ⛓️‍💥⤴️2)×8 // rest -->';
 const c8=X.meosClockFcParse(t1);
 ok(c8 && c8.chainOff===true && c8.chainReps===8 && c8.rounds===1 && c8.chainSrc==='⛓️‍💥⤴️2)×8', '★⛓️‍💥 も読む・周期に混ぜない・書く形も切れたまま', c8&&[c8.chainOff,c8.chainReps,c8.rounds,c8.chainSrc]);
 const L9=head.concat(['<!-- Mew!UFC ⏰ 🔔/🔔 ↺↻(20s)×1 ⛓️⤵️2 // work -->', t1]);
 const d9=mk('file:///x9.md',L9); X.meosChainResetLoops(d9,'H_1');
 const n9=X.meosChainNextRow(d9,'H_1',4,true);
 ok(n9===null, '★切れた ⤴️ は戻らない(work→rest で止まる)', n9&&n9.line);
 const L10=head.concat(['<!-- Mew!UFC ⏰ 🔔/🔔 ↺↻(20s)×1 ⛓️‍💥⤵️2 // work -->','<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(10s)×1 // rest -->']);
 ok(X.meosChainNextRow(mk('file:///x10.md',L10),'H_1',3,true)===null, '★切れた ⤵️ は次へ渡さない', 0);
 const tA='<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(20s)×1 ⛓️⤵️2 // work -->', mA=X.meosClockChainMarkAt(tA);
 ok(mA && tA.slice(mA.a,mA.b)==='⛓️' && !mA.off, '押す所= ⛓️ の字そのもの', mA);
 const mB=X.meosClockChainMarkAt(t1);
 ok(mB && t1.slice(mB.a,mB.b)==='⛓️‍💥' && mB.off, '切れている時は ⛓️‍💥 の字全部', mB);
 ok(X.meosClockChainMarkAt('<!-- Mew!FC ⏰ ↺↻3m // x -->')===null, '鎖の無い行は押す所が無い', 0);
}
console.log('⑨ ⏰のデータベースに連動の例');
{
 const db=X.meosTimerDbText('\n').text;
 ok(X.MEOS_TIMER_DB_CHAIN_EX.every(r=>db.indexOf(r)>=0), '★新しく作る膜に例が入る', 0);
 const ex=X.MEOS_TIMER_DB_CHAIN_EX.map(r=>X.meosClockFcParse(r));
 ok(ex[0].chainDir==='down' && ex[1].chainReps===8 && ex[3].chainReps===4 && ex.every(e=>e.rounds===1), '例はどれも読める(Tabata ×8 / Pomodoro ×4)', ex.map(e=>[e.chainSrc,e.rounds]));
 const L11=head.concat(['<!-- Mew!FC ⏰ 🔔/🔔 ↺↻0y0d0h3m ×1 // 3 minutes -->'].concat(X.MEOS_TIMER_DB_CHAIN_EX));
 const d11=mk('file:///x11.md',L11); X.meosChainResetLoops(d11,'H_1'); const s11=[]; let a11=4;
 for(let k=0;k<20;k++){ s11.push(a11-3); const n=X.meosChainNextRow(d11,'H_1',a11,true); if(!n) break; a11=n.line; }
 ok(s11.length===16 && s11[15]===2 && X.meosChainNextRow(d11,'H_1',3,false)===null, '★Tabata は work/rest を8回で止まり、上の3分とはつながらない', s11);
}

console.log('⑩ データベース膜の行から膜の名前を引く(v5.1.98 コメントを添える判定)');
{
 const DBH=['<!-- {* ▼mCN=⏰0y0d0h3m_20261020T082405JST // c *} -->','x','<!-- {* ▲mCN=⏰0y0d0h3m_20261020T082405JST // c *} -->'];
 const d12=mk('file:///x12.md',DBH.concat(X.MEOS_TIMER_DB_CHAIN_EX));
 const row=X.meosClockAtLine(d12,null,3);
 ok(row && X.meosIsTimerDbKey(row.key) && row.title==='💪Tabata work', '★行→膜の名前→データベース膜と分かる・タイトルも在る', row&&[row.key,row.title]);
 ok(!X.meosIsTimerDbKey(X.meosClockFcParse(X.MEOS_TIMER_DB_CHAIN_EX[0]).key), '(5.1.97 の穴) 行を読んだだけの物は key を持たない', 0);
}

console.log('⑪ 見えない [−1s] を押さない(v5.1.99)');
{
 const tW='<!-- Mew!FC ⏰ 2026-10-20 10:00 ↺t1,3 // 1st & 3rd Thursday 10:00 -->', tU=tW.replace('Mew!FC','Mew!UFC');
 const k=tW.indexOf('↺')-1;
 ok(X.meosClockNudgeHitAt(mk('file:///n1.md',[tW]),0,k)===null, '★待ちの行(FC)の ↺ の手前を押しても起点は動かない(ボタンは描かれていない)', k);
 const h=X.meosClockNudgeHitAt(mk('file:///n2.md',[tU]),0,tU.indexOf('↺')-1);
 ok(h && h.dir===-1, '走っている行(UFC)では今までどおり [−1s]', h);
}

console.log('⑫ ⛓️ を押した桁(v5.1.100)');
{
 const t='<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(20s)×1 ⛓️⤵️2 // 💪Tabata work -->', d=mk('file:///c1.md',[t]), a=t.indexOf('⛓');
 ok(a===30 && !!X.meosClockChainHitAt(d,0,31), '★実機の桁 31(⛓ と FE0F の間)= 当たり', a);
 ok(!!X.meosClockChainHitAt(d,0,32), '札の桁 32 も当たり', 0);
 ok(!X.meosClockChainHitAt(d,0,30) && !X.meosClockChainHitAt(d,0,33), '隠す範囲の左端 30 と ⤵️ の中 33 は外れ', 0);
 const t2=t.replace('⛓️','⛓️‍💥'), d2=mk('file:///c2.md',[t2]);
 ok([31,32,33,35].every(k=>!!X.meosClockChainHitAt(d2,0,k)) && !X.meosClockChainHitAt(d2,0,36), '⛓️‍💥 の時は隠した5字の中が全部当たり', 0);
}

console.log('⑬ ⤴️ は戻るだけ・前へつなぐのは ⤵️ だけ(v5.1.101)');
{
 const L13=head.concat(['<!-- Mew!UFC ⏰ 🔔/🔔 ↺↻(20s)×1 ⛓️‍💥⤵️2 // work -->','<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(10s)×1 ⛓️⤴️2)×8 // rest -->']);
 const d13=mk('file:///x13.md',L13); X.meosChainResetLoops(d13,'H_1');
 ok(X.meosChainNextRow(d13,'H_1',3,true)===null, '★work の ⤵️ を切ったら rest へ進まない(実機で繰り返した形)', 0);
 const n13=X.meosChainNextRow(d13,'H_1',4,true);
 ok(n13 && n13.line===3, 'rest から始めれば ⤴️ で work へ戻る(戻るのは ⤴️ の仕事)', n13&&n13.line);
 X.meosChainResetLoops(d13,'H_1');
 const L14=head.concat(['<!-- Mew!UFC ⏰ 🔔/🔔 ↺↻(20s)×1 // work -->','<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(10s)×1 ⛓️⤴️2)×3 // rest -->']);
 ok(X.meosChainNextRow(mk('file:///x14.md',L14),'H_1',3,true)===null, '印の無い行は ⤴️ の範囲に居ても独立', 0);
}

console.log('⑭ 行頭に字が入った⏰の行も塊ごと運ぶ(v5.1.103)');
{
 const DB=['<!-- {* ▼mCN=⏰0y0d0h3m_20261020T082405JST // c *} -->','x','<!-- {* ▲mCN=⏰0y0d0h3m_20261020T082405JST // c *} -->','<!-- Mew!FC mCN (📊⊕0+0D0W) -->','<!-- Mew!FC ⏰ 🔔/🔔 ↺↻0y0d0h3m ×1 // 3 minutes -->',
  '9<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(20s)×1 ⛓️‍💥⤵️2 // 💪Tabata work -->','<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(10s)×1 ⛓️⤴️2)×8 // 😮‍💨Tabata rest -->'];
 const META=['<!-- {* ▼mCN=mMETA // MeOS metadata — do not edit (📊⊖f0+0D0W) *} -->','<!-- mHTOC1 x -->','<!-- {* ▲mCN=mMETA // end *} -->'];
 const d=mk('file:///m3.md',['# t'].concat(DB,['']).concat(META));
 ok(X.meosTimerDbMovePlan(d,1)===null, '★壊れた行(9<!--)の下の行も塊の内= 既に手前と分かり、動かさない(4行を置き去りにしない)', X.meosTimerDbMovePlan(d,1));
 const d2=mk('file:///m4.md',['# t'].concat(DB,['','日記','']).concat(META));
 const mv=X.meosTimerDbMovePlan(d2,1);
 ok(mv && mv.blockEnd===8, '動かす時も壊れた行と下の行まで一緒', mv);
}

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
