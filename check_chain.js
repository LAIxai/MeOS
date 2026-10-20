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
 +'\nmodule.exports.__t={meosClockFcParse,meosClockFcScan,meosChainNextRow,meosChainLinks,meosChainTokenSplit,meosChainTokenText,meosChainResetLoops,_meosChainLoops,meosPanelCycleOpts,meosClockFcSet,meosTimerDbMovePlan,meosClockChainMarkAt,meosTimerDbText,MEOS_TIMER_DB_CHAIN_EX,meosClockAtLine,meosIsTimerDbKey,meosClockNudgeHitAt,meosClockChainHitAt,meosParkCaretAfterPress,meosLineDiffHunks,meosVaultRevertGently,meosVaultKeepOutsideAndSave,meosVaultInnerHunks,meosClockBadgeRowForLine,__setPrev:(v)=>{_meosPrevCaretPos=v;}};\n');
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

console.log('⑯ 数字の無い鎖は周期に混ぜず、つながず、⚠️の元を持つ(v5.1.105)');
{
 const t='<!-- Mew!FC ⏰ 🔔/🔔 1. ↺↻(1m)×1 ⛓️⤴️ // 💧目薬 1.本目 -->', c=X.meosClockFcParse(t);
 ok(c.chainBad===true && c.chainSrc==='⛓️⤴️' && c.cycleSrc==='(1m)×1' && c.rounds===1 && !c.chainDir, '★俊克の目薬の2行目= 周期は (1m)×1 のまま・鎖は「数字なし」と分かる', [c.chainBad,c.chainSrc,c.cycleSrc]);
 const c2=X.meosClockFcParse('<!-- Mew!FC ⏰ ↺↻(10s)×1 ⛓️⤴️)×8 // r -->');
 ok(c2.chainBad && c2.cycleSrc==='(10s)×1' && c2.rounds===1, '`)×8` だけ残っても周期の回数と読まない', [c2.cycleSrc,c2.rounds]);
 const c3=X.meosClockFcParse('<!-- Mew!FC ⏰ ↺↻(10s)×1 ⛓️⤴️ 2 // r -->');
 ok(!c3.chainBad && c3.chainN===2, '空白を挟んだ数字は正しく読む', [c3.chainBad,c3.chainN]);
 const L=head.concat(['<!-- Mew!UFC ⏰ 🔔/🔔 1. ↺↻8h 2026-09-28 16:59:58p ⛓️⤵️2 // 💧目薬の時間です -->', t]);
 const d=mk('file:///eye.md',L); X.meosChainResetLoops(d,'H_1');
 ok(X.meosChainNextRow(d,'H_1',4,true)===null, '数字の無い ⤴️ は戻らない(だから ⚠️ で知らせる)', 0);
 ok(X.meosChainNextRow(d,'H_1',3,true).line===4, '1行目の ⤵️2 は 8h → 1分 へつなぐ', 0);
 const L2=head.concat(['<!-- Mew!UFC ⏰ 🔔/🔔 1. ↺↻8h 2026-09-28 16:59:58p ⛓️⤵️2 // 💧目薬の時間です -->', t.replace('⛓️⤴️','⛓️⤴️2')]);
 const d2=mk('file:///eye2.md',L2); X.meosChainResetLoops(d2,'H_1');
 ok(X.meosChainNextRow(d2,'H_1',4,true).line===3, '★⛓️⤴️2 に直せば 1分 → 8h へ戻る(×M 無し= 戻り続ける)', 0);
}

console.log('⑲ ⏰のデータベース膜の下の方の⏰もバッジ行を見つける(v5.1.108)');
{
 const L=X.meosTimerDbText('\n').text.split('\n'); L.unshift('# t');   // 型の閉じ膜の後に、もともとバッジ行が入っている
 const d={lineCount:L.length,lineAt:n=>({text:L[n]})}; const B=L.findIndex(l=>/Mew!FC mCN/.test(l));
 const rows=L.map((t,i)=>i).filter(i=>/Mew!FC ⏰/.test(L[i]));
 ok(rows.length===10 && rows.every(i=>X.meosClockBadgeRowForLine(d,i)===B), '★10行目(☕Pomodoro break)までバッジ行に届く', rows.map(i=>X.meosClockBadgeRowForLine(d,i)));
 const L2=['<!-- Mew!FC mCN (📊⊕0+0D0W) -->','本文の行','<!-- Mew!FC ⏰ ↺↻3m ×1 // x -->'];
 ok(X.meosClockBadgeRowForLine({lineCount:3,lineAt:n=>({text:L2[n]})},2)===-1, '指定行の並びが切れたら探さない(今までどおり)', 0);
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

 W.length=0;
 const L7=head.concat(['<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(1m)×1 ⛓️⤴️ // eye -->']); const d7=mk('file:///w7.md',L7); const r7=X.meosClockFcScan(d7);
 await X.meosClockFcSet(d7,'H_1',{ when:'', cycle:r7[0].cycle, rounds:r7[0].rounds, cycleSrc:r7[0].cycleSrc, up:false, dual:true, done:true },r7[0].line);
 ok(W[0] && W[0].indexOf('(1m)×1✓ ⛓️⤴️ // eye')>0, '数字の無い鎖も書き直しで消えずに残る(直すのは人)', W[0]);
 })().then(()=>{

console.log('⑮ ボタンを押した後、行頭に残ったカーソルを押す前の所へ戻す(v5.1.104)');
(async()=>{
 const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
 stub.Selection=class{constructor(a,b,c,d){if(typeof a==='number'){this.anchor={line:a,character:b};this.active={line:c,character:d};}else{this.anchor=a;this.active=b;}this.isEmpty=(this.anchor.line===this.active.line&&this.anchor.character===this.active.character);}};
 const lines=['a','<!-- Mew!FC ⏰ 🔔/🔔 ↺↻(20s)×1 ⛓️⤵️2 // w -->','日記の本文です'];
 const mkEd=()=>{const ed={document:mk('file:///p1.md',lines),selection:new stub.Selection(1,32,1,32)};return ed;};
 const e1=mkEd(); X.__setPrev({line:2,character:3});
 X.meosParkCaretAfterPress(e1,1);
 ok(e1.selection.active.line===1 && e1.selection.active.character===0, '押した直後は行頭(札が「…」に化けない)', e1.selection.active);
 X.meosParkCaretAfterPress(e1,1); X.__setPrev({line:1,character:32});   // 2度目の呼び出し・その後の選択の変化で控えが上書きされても
 await sleep(1300);
 ok(e1.selection.active.line===2 && e1.selection.active.character===3, '★1.2秒後、押す前の所(2:3)へ戻る= 隠れた行頭に打鍵が入らない', e1.selection.active);
 const e2=mkEd(); X.__setPrev({line:2,character:3});
 X.meosParkCaretAfterPress(e2,1); e2.selection=new stub.Selection(0,1,0,1);
 await sleep(1300);
 ok(e2.selection.active.line===0, 'その間に人がカーソルを動かしたら戻さない', e2.selection.active);
 const e3=mkEd(); X.__setPrev({line:1,character:5});
 X.meosParkCaretAfterPress(e3,1); await sleep(1300);
 ok(e3.selection.active.line===1 && e3.selection.active.character===0, '押す前も同じ行に居た時は今までどおり行頭', e3.selection.active);

console.log('⑰ Discard の前に違う所だけ小さく直す(v5.1.106・32万行で固まった)');
 await (async()=>{
  const mkDoc=(text)=>{const L=text.split('\n');return {uri:{toString:()=>'meos-vault:/x.md',fsPath:'/x.md',scheme:'meos-vault'},lineCount:L.length,eol:1,getText:()=>L.join('\n'),
    lineAt:n=>({text:L[n],range:{end:{line:n,character:L[n].length}}})};};
  const offOf=(L,pos)=>{let o=0;for(let i=0;i<pos.line;i++)o+=L[i].length+1;return o+pos.character;};
  const run=async(aT,bT)=>{
    const d=mkDoc(aT), L=aT.split('\n'); const E=[];
    stub.WorkspaceEdit=class{replace(u,r,t){E.push({s:r.start,e:r.end,t});}};
    stub.Range=class{constructor(a,b,c,d){if(typeof a==='number'){this.start={line:a,character:b};this.end={line:c,character:d};}else{this.start=a;this.end=b;}}};
    stub.Position=class{constructor(l,c){this.line=l;this.character=c;}};
    stub.workspace.fs={readFile:async()=>Buffer.from(bT,'utf8')}; stub.workspace.applyEdit=async()=>true;
    stub.window.showTextDocument=async()=>{}; stub.commands.executeCommand=async()=>{};
    await X.meosVaultRevertGently(d);
    let out=aT; E.map(x=>({s:offOf(L,x.s),e:offOf(L,x.e),t:x.t})).sort((p,q)=>q.s-p.s).forEach(x=>{out=out.slice(0,x.s)+x.t+out.slice(x.e);});
    return {out,n:E.length};
  };
  const big=[];for(let i=0;i<30000;i++)big.push('line '+i+' 本文');
  const A=big.join('\n'); const B2=big.slice(); B2.splice(15000,2,'書きかけ'); B2[29990]='⏰ v 18:10.45'; const B=B2.join('\n');
  let r=await run(A,B); ok(r.out===B && r.n===2, '★真ん中の書きかけと末尾の⏰の2か所だけを直す(16万行の塊にしない)', [r.n]);
  const B3=big.slice(); B3.push('末尾に足した行'); r=await run(A,B3.join('\n')); ok(r.out===B3.join('\n'), '最後の行の後ろに足した違いも正しく直す', r.n);
  const B4=big.slice(0,29995); r=await run(A,B4.join('\n')); ok(r.out===B4.join('\n'), '末尾の行を消した違いも正しく直す', r.n);
  const B5=big.slice(); B5[29999]='最後の行を書き換え'; r=await run(A,B5.join('\n')); ok(r.out===B5.join('\n'), '最後の行の書き換えも正しく直す', r.n);
 })();

console.log('⑱ 起き直した時: 膜の外の書きかけは残して保存・暗号の膜の中だけ捨てる(v5.1.107)');
 await (async()=>{
  const offOf=(L,pos)=>{let o=0;for(let i=0;i<pos.line;i++)o+=L[i].length+1;return o+pos.character;};
  const run=async(aT,bT)=>{
    const L=aT.split('\n'); let saved=false; const E=[];
    const d={uri:{toString:()=>'meos-vault:/x.md',fsPath:'/x.md',scheme:'meos-vault',path:'/x.md'},lineCount:L.length,eol:1,getText:()=>L.join('\n'),
      lineAt:n=>({text:L[n],range:{end:{line:n,character:L[n].length}}}),save:async()=>{saved=true;return true;}};
    stub.WorkspaceEdit=class{replace(u,r,t){E.push({s:r.start,e:r.end,t});}};
    stub.workspace.fs={readFile:async()=>Buffer.from(bT,'utf8')}; stub.workspace.applyEdit=async()=>true;
    const r=await X.meosVaultKeepOutsideAndSave(d);
    let out=aT; E.map(x=>({s:offOf(L,x.s),e:offOf(L,x.e),t:x.t})).sort((p,q)=>q.s-p.s).forEach(x=>{out=out.slice(0,x.s)+x.t+out.slice(x.e);});
    return {r,out,saved};
  };
  const base=[];for(let i=0;i<3000;i++)base.push('日記 '+i);
  const OPEN='<!-- {* ▼mCN=🔐テスト_1 // c *} -->', CLOSE='<!-- {* ▲mCN=🔐テスト_1 // c *} -->', ENC='🔒MeOS-enc:v1 QUJDREVG';
  const diskL=base.slice(); diskL.splice(2000,0,OPEN,ENC,CLOSE);
  const bufL=base.slice(); bufL[500]='日記 500 ← 保存し忘れた書きかけA'; bufL.splice(1200,0,'足した行B');
  const memb=[OPEN,'秘密1','秘密2(書き換えた)','秘密3(足した)',CLOSE]; bufL.splice(2001,0,...memb);   // bufL は1行足したので 2001
  bufL[2900]='日記 2899 ← 書きかけC';
  const want=bufL.slice(); want.splice(2002,3,ENC);
  const {r,out,saved}=await run(bufL.join('\n'), diskL.join('\n'));
  ok(r && saved && out===want.join('\n'), '★膜の外の書きかけA・B・Cは残り、膜の中は暗号文に戻って保存される', r);
  ok(r && r.names.length===1 && r.names[0]==='🔐テスト_1', '知らせに戻した膜の名前が出る', r&&r.names);
  ok(out.indexOf('秘密')<0, '★平文の秘密は1字も残らない', 0);
  const bufL2=base.slice(); bufL2.splice(2000,0,OPEN.replace('🔐テスト_1','🔐テスト_改名'),'秘密1',CLOSE.replace('🔐テスト_1','🔐テスト_改名'));
  const r2=await run(bufL2.join('\n'), diskL.join('\n'));
  ok(r2.out===diskL.join('\n') && r2.out.indexOf('秘密')<0, '膜の名前を書き換えていた時も、秘密を守る側(ディスクの姿)に倒す', 0);
  const bufL3=base.slice(); bufL3[10]='外だけの書きかけ'; bufL3.splice(2000,0,OPEN,ENC,CLOSE);
  const r3=await run(bufL3.join('\n'), diskL.join('\n'));
  ok(r3.r && r3.r.names.length===0 && r3.out===bufL3.join('\n'), '暗号の膜に触れていなければ、全部そのまま保存', r3.r);
 })();
 console.log(ng?('NG '+ng):'ALL PASS'); process.exit(ng?1:0);
})();
});
