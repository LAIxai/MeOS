// 開発用ツール(vsix除外): ⏰ の予定thatメタ膜(mMETA)に残り、開き直しても生きているかを実物で確かめる。
//
// v4.0.460(俊克 改良1「VSCmを再起動すると、⏰thatが止まる。やはり、メタデータに保存してないから?」)
// ★開き直した時、過ぎていた予定の扱い= 5分以内なら普通に鳴らす / それより古ければ鳴らさずに「過ぎています」。
// ★写経しない= extension.js の meosLoadClocksFor をそのまま呼ぶ。
// 使い方:  node src/check_clock.js
const fs=require('fs'),path=require('path'),Module=require('module');
const SRC='/Volumes/T7_SSD2TB/Claude Code/MeOS/src';
const H=fs.readFileSync(path.join(SRC,'check_fcpair.js'),'utf8');
const stubSrc=H.slice(H.indexOf('const stub = {'), H.indexOf('const origLoad'));
const stub=eval('('+stubSrc.replace(/^const stub = /,'').trim().replace(/;$/,'')+')');
let INFO=[]; stub.window.showInformationMessage=(m)=>{INFO.push(m);return Promise.resolve(undefined);};
const o=Module._load; Module._load=function(r){if(r==='vscode')return stub;return o.apply(this,arguments);};
const T='/tmp/mc_'+process.pid+'.js';
fs.writeFileSync(T, fs.readFileSync(path.join(SRC,'extension.js'),'utf8')
 +'\nmodule.exports.__t={_meosClockMem,_meosPseudoUntil,_meosPseudoScopes,_meosClockLoaded,meosClockMeta,meosLoadClocksFor,meosParseWhen,meosClockList,meosClockFcParse,meosClockFcScan,meosArmClockFcFor,meosClockFcStamp,meosMmSs,meosPairBlockEnd,collectPairs,foldRangeEnd,meosDefBlocks,meosBlockEndForCarry,meosIsUnfoldingSpecLine,meosIsSpecLine,meosCycleMs,meosCycleRotate,meosNextTickDelay,meosClockRollToNextDay,meosParseStampLoose,meosClockForget,_meosClockDropped,_meosClockLoaded,meosNoteClockHistory,_meosClockHistory,meosClockFcStamp2:meosClockFcStamp};\n');
let X; try{X=require(T).__t;}finally{try{fs.unlinkSync(T);}catch(_){}}
let ng=0; const ok=(c,l,g)=>{console.log((c?'  ok  ':' NG   ')+l+(c?'':'   <- '+JSON.stringify(g)));if(!c)ng++;};
const lines=['# t','<!-- {* ▼mCN=A_1 // c *} -->','x','<!-- {* ▲mCN=A_1 // c *} -->'];
const mk=(uri)=>({uri:{toString:()=>uri,fsPath:'/x.md',scheme:'file'},languageId:'markdown',lineCount:lines.length,
 lineAt:n=>({text:lines[n],range:new stub.Range(n,0,n,lines[n].length)}),getText:()=>lines.join('\n'),eol:1,fileName:'/x.md',isClosed:false,version:1});

console.log('① 未来の予定 = 仕掛け直す');
let doc=mk('file:///a.md');
X._meosClockMem.set('file:///a.md',{ 'A_1': { at: Date.now()+3600e3, hold:true } });
X.meosLoadClocksFor(doc);
ok(X._meosPseudoUntil.has('file:///a.md A_1'), '★★再起動しても時計that生きている', [...X._meosPseudoUntil.keys()]);
ok(X._meosPseudoScopes.get('file:///a.md A_1').hold===true, '押さえていたことも覚えている', true);

console.log('② 二度読まない');
const before=X._meosPseudoUntil.size; X.meosLoadClocksFor(doc);
ok(X._meosPseudoUntil.size===before, '★同じファイルを何度開いても二重に仕掛からない', [before,X._meosPseudoUntil.size]);

console.log('③ 5分以内に過ぎた = 普通に鳴らす(仕掛ける)');
let doc2=mk('file:///b.md');
X._meosClockMem.set('file:///b.md',{ 'A_1': { at: Date.now()-60e3, hold:false } });
X.meosLoadClocksFor(doc2);
ok(X._meosPseudoUntil.has('file:///b.md A_1'), '★1分前に過ぎた= 鳴らしに行く', true);

console.log('④ 古く過ぎた = 鳴らさずに片付けて、過ぎたと言う');
INFO=[]; let doc3=mk('file:///c.md');
stub.workspace.textDocuments=[doc,doc2,doc3];   // 鳴る時にファイルが開いている(普通の姿)
X._meosClockMem.set('file:///c.md',{ 'A_1': { at: Date.now()-3600e3, hold:true } });
X.meosLoadClocksFor(doc3);
setTimeout(()=>{
ok(!X._meosPseudoUntil.has('file:///c.md A_1'), '★★何時間も前の「今すぐ来い」で人を連れ回さない', true);
ok(INFO.some(m=>/already passed/.test(m)), '★★でも「過ぎています」とは言う(黙って消さない)', INFO);

// v4.1.6(俊克 疑問点1「インストール直後に⏰履歴が空に見える。動いている膜に行くと復活している」):
//   ★復活の正体は「ファイルが覚えていたから」。so**鳴り終わった時計もファイルに残す**。
//   ここが戻ると、拡張を入れ替えても、開いた分だけ履歴が戻る。
console.log('⑤ 鳴り終わっても、ファイルが覚えている');
const m3=X.meosClockMeta(doc3);
ok(!!(m3&&m3['A_1']&&m3['A_1'].past===true), '★★済んだ時計を消さない(past印を付けて残す)', m3);
X._meosClockLoaded.delete('file:///c.md');            // 入れ直した後のように、もう一度開く
X.meosLoadClocksFor(doc3);
ok(!X._meosPseudoUntil.has('file:///c.md A_1'), '★過ぎた物を仕掛け直さない', true);
ok(X.meosClockList(5).some(r=>r.uri==='file:///c.md'&&r.key==='A_1'&&!r.running), '★★開き直すと履歴に戻る', X.meosClockList(5));

// v4.1.12(俊克「設定をFCコメントで書くようにすればいい」): ⏰の住所を本文へ。
//   ★スマホの素のエディタで1行書いて、PCで開けば仕掛かる= Me Dockが無くても予定を置ける。
console.log('\u2465 本文に書いた \u23f0 を読む');
const P=X.meosClockFcParse;
ok(!!P('<!-- Mew!FC \u23f0 23:00 -->'), '\u2605FC行を読める', P('<!-- Mew!FC \u23f0 23:00 -->'));
ok(P('<!-- Mew!FC \u23f0 23:00 -->').when==='23:00', '  時刻を取り出す', P('<!-- Mew!FC \u23f0 23:00 -->'));
ok(P('<!-- Mew!FC \u23f0\ud83d\udd12 20:00 -->').lock===true, '  \ud83d\udd12=錠を読む', P('<!-- Mew!FC \u23f0\ud83d\udd12 20:00 -->'));
ok(P('<!-- Mew!FC \u23f0 23:00\u2713 -->').done===true, '  \u2713=済んだ物と分かる', P('<!-- Mew!FC \u23f0 23:00\u2713 -->'));
ok(P('<!-- Mew!FC == (white/yellow) -->')===null, '  \u23f0でないFCは拾わない', true);

const L=['# t','<!-- {* \u25bcmCN=B_1 // c *} -->','x','<!-- {* \u25b2mCN=B_1 // c *} -->','<!-- Mew!FC \u23f0 23:59 -->'];
const mk2=(uri)=>({uri:{toString:()=>uri,fsPath:'/y.md',scheme:'file'},languageId:'markdown',lineCount:L.length,
 lineAt:n=>({text:L[n],range:new stub.Range(n,0,n,L[n].length)}),getText:()=>L.join('\n'),eol:1,fileName:'/y.md',isClosed:false,version:1});
const doc4=mk2('file:///d.md');
const scan=X.meosClockFcScan(doc4);
ok(scan.length===1&&scan[0].key==='B_1', '\u2605\u2605**閉じ膜の次の行**なら、その膜の予定になる', scan);
X.meosArmClockFcFor(doc4);
ok(X._meosPseudoUntil.has('file:///d.md B_1'), '\u2605\u2605書いてある \u23f0 を仕掛ける(Me Dock不要)', [...X._meosPseudoUntil.keys()]);

// v4.1.13(俊克 バグ1の実物): 閉じ膜と ⏰ の間には、バッジなど他のFC行が積まれる。
//   ★「直前の行が閉じ膜」だけを見ていると、その膜の予定にならずファイル全体の予定になっていた。
console.log('\u2466 指定行を飛び越えて、上の閉じ膜を持ち主にする');
const L2=['# t','<!-- {* \u25bcmCN=C_1 // c *} -->','x','<!-- {* \u25b2mCN=C_1 // c *} -->',
 '<!-- Mew!FC mCN (\ud83d\udcca\u22950+0D-2Y) -->','<!-- Mew!FC \u23f0 23:59 -->'];
const mk3=(uri)=>({uri:{toString:()=>uri,fsPath:'/z.md',scheme:'file'},languageId:'markdown',lineCount:L2.length,
 lineAt:n=>({text:L2[n],range:new stub.Range(n,0,n,L2[n].length)}),getText:()=>L2.join('\n'),eol:1,fileName:'/z.md',isClosed:false,version:1});
const sc2=X.meosClockFcScan(mk3('file:///e.md'));
ok(sc2.length===1&&sc2[0].key==='C_1', '\u2605\u2605バッジFC行が間に在っても、その膜の予定になる', sc2);

console.log('\u2467 ボタンが書く形= 絶対時刻(腐らない)');
const st=X.meosClockFcStamp(new Date(2026,8,1,20,5));
ok(st==='2026-09-01 20:05', '\u2605YYYY-MM-DD HH:MM で書く', st);
ok(!!X.meosParseWhen(st)===false||!!X.meosParseWhen('2099-01-01 20:05'), '  書いた形を自分で読み直せる', X.meosParseWhen('2099-01-01 20:05'));

// v4.1.14(俊克 改良3「60分以上なら、1:20.55のように、時分秒にしようよ。450.34では、イメージが付かない」)
console.log('\u2469 残り時間の読める形');
// v4.1.37(俊克「MM:SSと書いた時、時分のように見えてしまう。so私はHH:MM.SSと表示する」)
// ★「:」は**時と分の間だけ**。分と秒は必ず「.」。
ok(X.meosMmSs(34*1000)==='0.34', '\u26051分未満= 0.34(0:34と書くと時分に見える)', X.meosMmSs(34*1000));
ok(X.meosMmSs((59*60+30)*1000)==='59.30', '\u2605\u26051時間未満= 分.秒(「:」を使わない)', X.meosMmSs((59*60+30)*1000));
ok(X.meosMmSs((18*60+7)*1000)==='18.07', '\u2605\u2605\u260518分07秒= 18.07(18:26.07のような中の桁that出ない)', X.meosMmSs((18*60+7)*1000));
ok(X.meosMmSs((18*3600+26*60+7)*1000)==='18:26.07', '  18時間26分07秒= 18:26.07(「:」thatが在れば左は時)', X.meosMmSs((18*3600+26*60+7)*1000));
ok(X.meosMmSs((3600+20*60+55)*1000)==='1:20.55', '\u2605\u26051時間以上= 時:分.秒', X.meosMmSs((3600+20*60+55)*1000));
ok(X.meosMmSs(450*60*1000)==='7:30.00', '\u2605450分は 7:30.00(450:34では読めない)', X.meosMmSs(450*60*1000));

// v4.1.15(俊克 質問1「⏰を設定した膜が、カーソルを外に出すと勝手に折り畳まれる。なぜ?」):
//   ★真因= 畳み範囲の交差。膜 1..4 に対して FCの塊 3..5 がはみ出していた。
//   入れ子(膜 ⊇ FCの塊)に戻っているかを、ここで見張る。
console.log('\u246a 畳み範囲は入れ子に収まる(交差させない)');   // v4.1.18: これから鳴る物はUFC
const L3=['# t','<!-- {* \u25bcmCN=D_1 // c *} -->','x','<!-- {* \u25b2mCN=D_1 // c *} -->',
 '<!-- Mew!FC mCN (\ud83d\udcca\u22950+0D-2Y) -->','<!-- Mew!UFC \u23f0 2026-12-31 23:00 -->'];
const mk4=(uri)=>({uri:{toString:()=>uri,fsPath:'/f.md',scheme:'file'},languageId:'markdown',lineCount:L3.length,
 lineAt:n=>({text:L3[n],range:new stub.Range(n,0,n,L3[n].length)}),getText:()=>L3.join('\n'),eol:1,fileName:'/f.md',isClosed:false,version:1});
const d4=mk4('file:///g.md'), pr4=X.collectPairs(d4,{excludeIndex:false})[0];
const mEnd=X.foldRangeEnd(d4,pr4), fcEnd=Math.max(...X.meosDefBlocks(d4).map(b=>b.end));
ok(fcEnd<=mEnd, '\u2605\u2605\u2605FCの塊が膜からはみ出さない(はみ出すと外側が畳まれる)', [fcEnd,mEnd]);
ok(mEnd===4, '\u2605\u23f0行は畳みの範囲に入らない(畳んでも見える=予定は見えていることが仕事)', mEnd);
ok(X.meosBlockEndForCarry(d4,pr4)===5, '\u2605\u2605でも運ぶ時は一緒に行く(コピー/複製に⏰が入る)', X.meosBlockEndForCarry(d4,pr4));

// v4.1.17(俊克 改良1「畳まないので、UFCというコメントを新設しよう」)
console.log('\u246b UFC= 畳まない指定行');
const U='<!-- Mew!UFC \u23f0 2026-12-31 23:00 -->';
ok(X.meosIsSpecLine(U), 'UFCも指定行として読む(Mew!の一族)', true);
ok(X.meosIsUnfoldingSpecLine(U), '\u2605UFCと名乗れば畳まない', true);
ok(!X.meosIsUnfoldingSpecLine('<!-- Mew!FC == (white/yellow) -->'), '  FCは今までどおり畳む', true);
ok(!!X.meosClockFcParse(U), '\u2605\u23f0はUFCでもFCでも読める(旧い版が書いた物を置いていかない)', X.meosClockFcParse(U));
const L4=['# t','<!-- {* \u25bcmCN=E_1 *} -->','x','<!-- {* \u25b2mCN=E_1 *} -->','<!-- Mew!FC mCN (\ud83d\udcca\u22950+0D-2Y) -->',U];
const mk5=(uri)=>({uri:{toString:()=>uri,fsPath:'/u.md',scheme:'file'},languageId:'markdown',lineCount:L4.length,
 lineAt:n=>({text:L4[n],range:new stub.Range(n,0,n,L4[n].length)}),getText:()=>L4.join('\n'),eol:1,fileName:'/u.md',isClosed:false,version:1});
const d5=mk5('file:///h.md'), pr5=X.collectPairs(d5,{excludeIndex:false})[0];
ok(Math.max(...X.meosDefBlocks(d5).map(b=>b.end))<=X.foldRangeEnd(d5,pr5), '\u2605\u2605UFCでも交差しない', true);
ok(X.meosBlockEndForCarry(d5,pr5)===5, '\u2605UFCも膜と一緒に運ばれる', X.meosBlockEndForCarry(d5,pr5));

// v4.1.19(俊克 バグ2「FCに切り替えたのに、折り畳まれない」): 済んだ⏰(FC)は膜の塊に入り、
//   これから鳴る⏰(UFC)は外に残る。どちらでもFCの塊が膜からはみ出さない=交差しない。
console.log('\u246c 済んだ⏰は畳まれる仲間に戻る');
const mkL=(last,uri)=>{const L=['# t','<!-- {* \u25bcmCN=F_1 *} -->','x','<!-- {* \u25b2mCN=F_1 *} -->',
 '<!-- Mew!FC mCN (\ud83d\udcca\u22950+0D-2Y) -->',last];
 return {uri:{toString:()=>uri,fsPath:'/v.md',scheme:'file'},languageId:'markdown',lineCount:L.length,
 lineAt:n=>({text:L[n],range:new stub.Range(n,0,n,L[n].length)}),getText:()=>L.join('\n'),eol:1,fileName:'/v.md',isClosed:false,version:1};};
const dDone=mkL('<!-- Mew!FC \u23f0 2026-08-30 00:04\u2713 -->','file:///i.md');
const prD=X.collectPairs(dDone,{excludeIndex:false})[0];
ok(X.foldRangeEnd(dDone,prD)===5, '\u2605\u2605済んだ\u23f0(FC)は膜の塊に入る=畳まれる', X.foldRangeEnd(dDone,prD));
ok(Math.max(...X.meosDefBlocks(dDone).map(b=>b.end))<=X.foldRangeEnd(dDone,prD), '\u2605\u2605\u2605それでも交差しない', true);
const dLive=mkL('<!-- Mew!UFC \u23f0 2026-12-31 23:00 -->','file:///j.md');
const prL=X.collectPairs(dLive,{excludeIndex:false})[0];
ok(X.foldRangeEnd(dLive,prL)===4, '\u2605これから鳴る\u23f0(UFC)は膜の塊の外=畳まれない', X.foldRangeEnd(dLive,prL));

// v4.1.21(俊克「開始膜か閉じ膜をクリックしてもFC群が折り畳まれたまま。標準の折畳みボタンでしか戻らない」):
//   ★真因= 一括の道が畳んでも _meosFcOpenSet(開けている物の覚え)から外していなかった。
//   壊れ方から逆算した検査= **畳む道は、必ず覚えからも外す**。
console.log('\u246d 畳んだら、覚えからも外す(開き直せる)');
const SRC2=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
const _bulk=SRC2.slice(SRC2.indexOf('function meosAutoFoldSpecLines'), SRC2.indexOf('function meosAutoFoldSpecLines')+6000);
ok(/_meosFcOpenSet\.delete/.test(_bulk), '\u2605\u2605一括の道が覚えから外している', /_meosFcOpenSet\.delete/.test(_bulk));
const _one=SRC2.slice(SRC2.indexOf('function meosSyncFcFoldForCursor'), SRC2.indexOf('function meosSyncFcFoldForCursor')+6000);
ok(/_meosFcOpenSet\.delete/.test(_one), '  個別の道も外している(対の両側)', true);

// v4.1.23(俊克「目薬を5分置きにつけるときに、05/00という設定にすること」＋アーチェリーの秒読み)
console.log('\u246e 繰返し(\u21bb)と秒');
const P2=X.meosClockFcParse;
const r1=P2('<!-- Mew!UFC \u23f0 2026-08-30 01:40 \u21bb05 -->');
ok(!!r1 && r1.when==='2026-08-30 01:40', '時刻と輪を切り分けて読む', r1);
ok(!!r1 && String(r1.cycle)==='05', '\u2605\u21bb05= 5分ごと', r1 && r1.cycle);
const r2=P2('<!-- Mew!UFC \u23f0 12:00 \u21bb50/10 -->');
ok(!!r2 && String(r2.cycle)==='50,10', '\u2605\u2605並びで交互(50\u219210\u219250...)', r2 && r2.cycle);
ok(X.meosCycleMs('05')===300000, '既定は分', X.meosCycleMs('05'));
ok(X.meosCycleMs('30s')===30000, '\u2605s=秒(15秒前の合図が書ける)', X.meosCycleMs('30s'));
ok(X.meosCycleMs('2h')===7200000, 'h=時', X.meosCycleMs('2h'));
ok(String(X.meosCycleRotate(['50','10','30']))==='10,30,50', '\u2605\u2605鳴ったら先頭を末尾へ回す(覚えを持たない)', X.meosCycleRotate(['50','10','30']));
const w1=X.meosParseWhen('2099-01-01 09:30:15');
ok(!!w1 && w1.at.getSeconds()===15, '\u2605秒まで読む', w1 && w1.at.toString());
ok(X.meosClockFcStamp2(new Date(2026,7,30,1,40,0))==='2026-08-30 01:40', '秒が0なら今までと同じ姿', X.meosClockFcStamp2(new Date(2026,7,30,1,40,0)));
ok(X.meosClockFcStamp2(new Date(2026,7,30,1,40,15))==='2026-08-30 01:40:15', '秒が在る時だけ足す', X.meosClockFcStamp2(new Date(2026,7,30,1,40,15)));

// v4.1.24(俊克「⏰のリストの左端に、選択用のチェックボックスを付けて、どのタイマーを使用できるかを選べるように」)
console.log('\u246f \u23f8 休み(\u2611/\u2610)');
const P3=X.meosClockFcParse;
const f1=P3('<!-- Mew!UFC \u23f0\u23f8 2099-01-01 09:30 -->');
ok(!!f1 && f1.off===true, '\u2605\u23f8 を休みとして読む', f1);
ok(!!f1 && f1.when==='2099-01-01 09:30', '  時刻は今までどおり読める(印は顔の側)', f1 && f1.when);
const f2=P3('<!-- Mew!UFC \u23f0 2099-01-01 09:30 -->');
ok(!!f2 && f2.off===false, '  \u23f8 が無ければ休みではない', f2 && f2.off);
const f3=P3('<!-- Mew!UFC \u23f0\ud83d\udd12\u23f8 2099-01-01 09:30 \u21bb05 -->');
ok(!!f3 && f3.off===true && f3.lock===true && String(f3.cycle)==='05', '\u2605\u2605錠\u30fb輪と混ぜても全部読める', f3);

// 休みは**仕掛けない**。ただし一覧には出す。
const OFFDOC=(()=>{const L=['# t','<!-- {* \u25bcmCN=Z_1 // c *} -->','x','<!-- {* \u25b2mCN=Z_1 // c *} -->','<!-- Mew!UFC \u23f0\u23f8 2099-01-01 09:30 -->'];
 return {uri:{toString:()=>'file:///off.md',fsPath:'/off.md',scheme:'file'},languageId:'markdown',lineCount:L.length,
  lineAt:n=>({text:L[n],range:new stub.Range(n,0,n,L[n].length)}),getText:()=>L.join('\n'),eol:1,fileName:'/off.md',isClosed:false,version:1};})();
const scanned=X.meosClockFcScan(OFFDOC);
ok(scanned.length===1 && scanned[0].off===true, '  scan も休みを持ち上げる', scanned);
X.meosArmClockFcFor(OFFDOC);
ok(!X._meosPseudoUntil.has('file:///off.md Z_1'), '\u2605\u2605\u2605休みは仕掛からない(\u2610 のまま)', [...X._meosPseudoUntil.keys()]);
ok(X.meosClockList(9).some(r=>r.uri==='file:///off.md'&&r.key==='Z_1'&&!r.running), '\u2605\u2605休んでいても一覧には出る(見えないと戻せない)', X.meosClockList(9));

// v4.1.25(俊克 バグ1「\u2610をクリックすると…\u23f0リストから消えてしまう。膜の方は、タイマーが起動しない」)
console.log('\u2470 \u2611 を入れ直した時(過ぎた時刻)');

// ① 過ぎた時刻は「同じ時刻のまま、次に来る日」へ送られる
const R=X.meosClockRollToNextDay('2026-08-29 23:00');
ok(typeof R==='string' && /23:00$/.test(R), '\u2605\u2605時刻はそのまま(23:00 のまま)', R);
ok(!!R && X.meosParseStampLoose(R).getTime()>Date.now(), '\u2605\u2605\u2605送り先は必ず未来', R);
ok(X.meosClockRollToNextDay('2099-01-01 09:30')==='2099-01-01 09:30', '  まだ来ていない物は動かさない', X.meosClockRollToNextDay('2099-01-01 09:30'));
ok(X.meosClockRollToNextDay('ぐにゃ')===null, '  読めない物は送らない(本文を汚さない)', X.meosClockRollToNextDay('ぐにゃ'));

// ② 掛かっていなくても一覧に残る(バグ1の本体)
const PASTDOC=(()=>{const L=['# t','<!-- {* \u25bcmCN=P_1 // c *} -->','x','<!-- {* \u25b2mCN=P_1 // c *} -->','<!-- Mew!UFC \u23f0 2026-08-29 23:00 -->'];
 return {uri:{toString:()=>'file:///past.md',fsPath:'/past.md',scheme:'file'},languageId:'markdown',lineCount:L.length,
  lineAt:n=>({text:L[n],range:new stub.Range(n,0,n,L[n].length)}),getText:()=>L.join('\n'),eol:1,fileName:'/past.md',isClosed:false,version:1};})();
X.meosArmClockFcFor(PASTDOC);
ok(!X._meosPseudoUntil.has('file:///past.md P_1'), '  過ぎた一度きりの予定は掛からない(今までどおり)', true);
const inList=X.meosClockList(99).some(r=>r.uri==='file:///past.md'&&r.key==='P_1');
ok(inList, '\u2605\u2605\u2605掛かっていなくても一覧に残る(v4.1.24は消えた)', X.meosClockList(99).map(r=>r.key));

// ③ 次に鳴る1つだけに印(前の節that仕掛けた物は片付けてから測る)
X._meosPseudoUntil.clear(); X._meosPseudoScopes.clear();
X._meosPseudoUntil.set('file:///n1.md N_1', Date.now()+9e6);
X._meosPseudoScopes.set('file:///n1.md N_1',{uri:'file:///n1.md',key:'N_1',name:'N_1'});
X._meosPseudoUntil.set('file:///n2.md N_2', Date.now()+3e6);
X._meosPseudoScopes.set('file:///n2.md N_2',{uri:'file:///n2.md',key:'N_2',name:'N_2'});
// v4.1.30(俊克 質問1「×で削除しても、何かの切っ掛けでリストの先頭に復活してしまう」)
{
 const U='file:///old.md';
 X._meosClockMem.set(U,{ 'DL_1': { at: Date.now()-3600e3, hold:false, past:true } });
 X._meosClockLoaded.delete(U);
 const L=['# t','<!-- {* \u25bcmCN=DL_1 // c *} -->','x','<!-- {* \u25b2mCN=DL_1 // c *} -->'];
 const D={uri:{toString:()=>U,fsPath:'/old.md',scheme:'file'},languageId:'markdown',lineCount:L.length,
  lineAt:n=>({text:L[n],range:new stub.Range(n,0,n,L[n].length)}),getText:()=>L.join('\n'),eol:1,fileName:'/old.md',isClosed:false,version:1};
 X.meosClockForget(U,'DL_1');                       /* ×= 覚えから外し、消したことを窓が覚える */
 X._meosClockLoaded.delete(U);
 X.meosLoadClocksFor(D);                            /* 読み直し= 旧タイプはここで戻ってきていた */
 const back=X.meosClockList(99).some(r=>r.uri===U&&r.key==='DL_1');
 ok(!back, '\u2605\u2605\u2605\u00d7した旧タイプ(mMETA)の予定は、読み直しても戻らない', X.meosClockList(99).map(r=>r.key));
 ok(!(X._meosClockMem.get(U)||{})['DL_1'], '  mMETAの記録も落ちている', X._meosClockMem.get(U));
}

const _L25=X.meosClockList(99), nx=_L25.filter(r=>r.next);
ok(nx.length===1, '\u2605印が付くのは1つだけ', nx.map(r=>r.key));
ok(nx.length===1 && nx[0].key==='N_2', '\u2605\u2605\u2605印が付くのは**次に鳴る物**(一番近い)', nx.map(r=>[r.key,r.at]));
ok(_L25.filter(r=>r.running).length>=2 && _L25.find(r=>r.running).next===true, '  走っている物の先頭that次に鳴る物', true);

// v4.1.27(俊克 バグ1「タイマーが再起動する。しかし\u23f0リストが更新されない」)
console.log('\u2471 描き直しの見張りthat時計を見ているか');
const SRC3=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
const _sig=SRC3.slice(SRC3.indexOf("if(m&&m.type==='viewMode')"), SRC3.indexOf("if(m&&m.type==='viewMode')")+2200);
ok(/_sg=.*\+'\|'\+_cs/.test(_sig), '\u2605\u2605\u2605合図に一覧thatが入っている(描く物を、描くかどうかの判断に入れる)', /_cs/.test(_sig));
ok(/_cc\.at/.test(_sig)&&/_cc\.running/.test(_sig)&&/_cc\.next/.test(_sig), '  時刻\u30fb走っているか\u30fb次かthat全部合図に効く', true);
ok(/_cc\.key/.test(_sig), '  どの膜かも合図に効く(入れ替わりを見逃さない)', true);
const _arm=SRC3.slice(SRC3.indexOf('function meosArmClockFcFor'), SRC3.indexOf('function meosArmClockFcFor')+4200);
ok(/if \(n \|\| _seen\)/.test(_arm), '\u2605掛かった数that0でも、\u23f0を見つけたら知らせる', /_seen/.test(_arm));

// v4.1.39(俊克「あんたがせっせと仕込んでいたんだよ。貴方の説明をコピーして、それを私がペーストする」)
console.log('\u2472 引用した\u23f0は、本物にならない');
{
 const L=['# t','<!-- {* \u25bcmCN=Q_1 // c *} -->','見本を書く:','```','<!-- Mew!UFC \u23f0 2099-01-01 09:30 -->','```',
          '行の中の `<!-- Mew!UFC \u23f0 2099-02-02 10:00 -->` も文字。','<!-- {* \u25b2mCN=Q_1 // c *} -->',
          '<!-- Mew!UFC \u23f0 2099-03-03 11:00 -->'];
 const D={uri:{toString:()=>'file:///quote.md',fsPath:'/q.md',scheme:'file'},languageId:'markdown',lineCount:L.length,
  lineAt:n=>({text:L[n],range:new stub.Range(n,0,n,L[n].length)}),getText:()=>L.join('\n'),eol:1,fileName:'/q.md',isClosed:false,version:1};
 const got=X.meosClockFcScan(D);
 ok(got.length===1, '\u2605\u2605\u2605拾うのは本物の1本だけ(見本2本は数えない)', got.map(c=>[c.line+1,c.when]));
 ok(got.length===1 && got[0].when==='2099-03-03 11:00', '  拾ったのthat閉じ膜の下の本物', got.map(c=>c.when));
 ok(!got.some(c=>c.when==='2099-01-01 09:30'), '\u2605``` の中は文字そのもの', true);
 ok(!got.some(c=>c.when==='2099-02-02 10:00'), '\u2605行中の ` … ` も文字そのもの', true);
}

// v4.1.40(俊克「×ボタンを押すと…VSCmを再起動すると、そのリストが復活してしまう」)
console.log('\u2473 \u00d7 は走っていなくても行を消す');
{
 const SRC4=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 const _drop=SRC4.slice(SRC4.indexOf('async function meosClockDrop'), SRC4.indexOf('async function meosClockDrop')+3000);
 const _ifBody=_drop.slice(_drop.indexOf('if (lk) {'), _drop.indexOf('}', _drop.indexOf('await meosEndPseudoTimer')));
 ok(!/meosClockFcSet\([^)]*null\)/.test(_ifBody), '\u2605\u2605\u2605行を消す処理that「走っている時」の中に無い', _ifBody.length);
 ok(/meosClockFcSet\(d, key, null\)/.test(_drop), '  \u00d7 は本文の行を消す(常に通る道に在る)', true);
 const _after=_drop.slice(_drop.indexOf('if (lk) {'));
 const _i1=_after.indexOf('meosEndPseudoTimer'), _i2=_after.indexOf('meosClockFcSet(d, key, null)');
 ok(_i1>=0&&_i2>=0&&_i2>_i1, '  止めてから消す(順番)', [_i1,_i2]);
}

// v4.1.42(俊克「実行中の⏰膜を離れると、⏰ボタンの残時間が止まる」)
console.log('\u3251 面の拍も「次に鳴る物」で回る');
{
 const SRC5=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 const _rr=SRC5.slice(SRC5.indexOf('window.__renderRaw=function'), SRC5.indexOf('window.__renderRaw=function')+9000);
 const _arm=_rr.slice(_rr.indexOf('if(vmTick){clearTimeout'), _rr.indexOf('if(vmTick){clearTimeout')+260);
 ok(/if\(_nl>0\)/.test(_arm), '\u2605\u2605\u2605拍を始める判定that「次に鳴る物」(_nl)', _arm.slice(0,90));
 ok(/vmNextUntil/.test(_arm), '  変わり目の計算も「次に鳴る物」から引く', true);
 ok(!/if\(left>0&&!vmTick\)/.test(_rr), '  「今居る膜」で拍を回す古い道that残っていない', true);
 ok(!/vmLeft\(\)<=0/.test(_arm), '  止める判定にも「今居る膜」thatが混ざっていない', true);
}

// v4.1.43(俊克「完全に同期はしてない。1秒差。これを完全同期できるの?」)
console.log('\u3252 拍は「秒の変わり目」に置く');
{
 const at=Date.now()+12345;   // 残り12.345秒
 const d=X.meosNextTickDelay(at);
 ok(d>=8&&d<=1008, '\u2605次の変わり目までの時間を返す(0〜1秒＋余裕)', d);
 ok(Math.abs(d-(345+8))<3, '\u2605\u2605\u2605余り345msなら 353ms 後(1000msではない)', d);
 const at2=Date.now()+12000;  // ちょうど変わり目
 ok(X.meosNextTickDelay(at2)<=1008, '  ちょうどの時も1秒以内に次that来る', X.meosNextTickDelay(at2));
 // 2つの表示that同じ at から出せば、同じ瞬間に書き換わる
 ok(X.meosNextTickDelay(at)===X.meosNextTickDelay(at), '\u2605\u2605同じ at からは同じ答え= 行と面that揃う', true);
 const SRC6=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(!/_meosTimerTick = setInterval/.test(SRC6), '\u2605node側に「1秒ごと」の古い拍that残っていない', true);
 ok(!/vmTick=setInterval/.test(SRC6), '\u2605webview側にも残っていない', true);
}

// v4.1.44(俊克「アラームが鳴ってワープした瞬間に、文字変換していて、ワープ先に文字が入ってしまった」)
console.log('\u3253 秒読みは3段(アーチェリー式)');
{
 const SRC7=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/MEOS_BELL_MARKS = \[\[60000, 3000\], \[30000, 5000\], \[10000, 0\]\]/.test(SRC7),
    '\u2605\u2605\u26051分前=3秒 / 30秒前=5秒 / 10秒前=鳴り続ける(0)', true);
 const _mf=SRC7.slice(SRC7.indexOf('function meosBellMarksFor'), SRC7.indexOf('function meosBellMarksFor')+220);
 ok(/m\[0\] < cycleStep/.test(_mf), '\u2605繰返しの間隔より遠い印は出さない(1分周期に「1分前」は無い)', true);
 const _rf=SRC7.slice(SRC7.indexOf('function meosRingFor'), SRC7.indexOf('function meosRingFor')+320);
 ok(/meosStartRinging\(name\)/.test(_rf)&&/meosStopRinging/.test(_rf), '  N秒だけ鳴らして止める口that在る', true);
 const _arm=SRC7.slice(SRC7.indexOf('function meosArmPseudoTimer'), SRC7.indexOf('function meosArmPseudoTimer')+1200);
 ok(/ms - marks\[i\]\[0\]/.test(_arm), '\u2605\u2605次の印の時刻で起きる(1秒ごとに数えない)', true);
 ok(!/meosJumpToScope/.test(_arm), '  印の枝に移動thatが混ざっていない', true);
 const _up=SRC7.slice(SRC7.indexOf('async function meosPseudoTimeUp'), SRC7.indexOf('async function meosPseudoTimeUp')+1600);
 ok(/meosStopRinging\(\); meosPlayWhistle\(\);/.test(_up), '\u2605\u2605\u26050秒= 秒読みを止め、3秒の高音を1つ(黙るのではない)', true);
 const SRC13=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 const _w=SRC13.slice(SRC13.indexOf('function meosWhistlePath'), SRC13.indexOf('function meosWhistlePath')+1200);
 ok(/meosWhistlePath\(1760, 3\)/.test(SRC13), '\u2605\u26051760Hz(A6)を3秒= OSの音には無い「続く音」so自分で作る', true);
 ok(/Math\.min\(1, t \* 25, \(secs - t\) \* 25\)/.test(_w), '\u2605端を丸める(矩形に切るとプツッと言う)', true);
 ok(/if \(!name\) return;/.test(SRC13.slice(SRC13.indexOf('function meosPlayWhistle'), SRC13.indexOf('function meosPlayWhistle')+800)),
    '  音を空にしている人には鳴らさない', true);
 const SRC12=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 const _rv=SRC12.slice(SRC12.indexOf('function meosRevealAgainAfterBell'), SRC12.indexOf('function meosRevealAgainAfterBell')+1400);
 ok(/setTimeout\(\(\) => again\('t\+300'\), 300\)/.test(_rv)&&/again\('t\+900'\), 900\)/.test(_rv), '\u2605飛んだ後、落ち着いてから2度見せ直す', true);
 ok(/if \(vr && ln >= vr\.start\.line && ln <= vr\.end\.line\) return;/.test(_rv), '\u2605\u2605見えていれば触らない(戻された時だけ引き戻す)', true);
 ok(/view=/.test(_rv), '  その時の**見えている範囲**も記録する(戻されたかthat数字で残る)', true);
 ok(/meosJumpToScope\(scope, true\)/.test(_up), '  移動thatは時刻ちょうどの方に在る', true);
}


// v4.1.45(俊克 改良2「初期値、およびClearボタンを押した時は、今日の年月日を表示すべき」)
console.log('\u3254 日付の輪は今日から始まる');
{
 const SRC8=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 const _de=SRC8.slice(SRC8.indexOf('function clkDateEmpty()'), SRC8.indexOf('function clkDateEmpty()')+420);
 ok(/clkFixD=false/.test(_de), '\u2605指定した印(clkFixD)は false のまま= 下の行は白', true);
 ok(/clkSel\(document\.getElementById\('clk-y'\)/.test(_de), '\u2605\u2605\u2605輪には今日を置く(空にしない)', true);
 ok(/getMonth\(\)\+1\)/.test(_de)&&!/clkPad\(/.test(_de), '\u2605\u2605data-v は素の数値so 0詰めしない(01では当たらない)', !/clkPad\(/.test(_de));
 ok(/clkFitDays\(\)/.test(_de), '  日を選ぶ前に、その月の日数へ詰め直す(2月に31日を置かない)', true);
 const _fill=SRC8.slice(SRC8.indexOf('function clkFill('), SRC8.indexOf('function clkFill(')+200);
 ok(/data-v="'\+i\+'"/.test(_fill), '  clkFill thatが書く data-v は素の数値(突き合わせの根拠)', true);
}

// v4.1.46(俊克「確定値の年月日が白色なら、上の年月日スクロールの部分も白色にしないとね」)
console.log('\u3255 色の意味は1つ(指定した=橙)');
{
 const SRC9=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/\.clk-pop:not\(\.dfix\) \.clk-col\.dcol div\.sel\{color:var\(--vscode-editor-foreground\)\}/.test(SRC9),
    '\u2605\u2605\u2605指定していない間は日付の輪も白', true);
 ok(/class="clk-col dcol" id="clk-y"/.test(SRC9)&&/class="clk-col dcol" id="clk-mo"/.test(SRC9)&&/class="clk-col dcol" id="clk-d"/.test(SRC9),
    '  白くするのは**日付の3列だけ**(時刻は常に橙)', true);
 ok(!/class="clk-col dcol" id="clk-h"/.test(SRC9)&&!/class="clk-col dcol" id="clk-mi"/.test(SRC9),
    '  時分の列には印を付けない(指定しない状態that無い)', true);
 const _e=SRC9.slice(SRC9.indexOf('function clkEcho()'), SRC9.indexOf('function clkEcho()')+420);
 ok(/clkPop\.classList\.toggle\('dfix',clkFixD\)/.test(_e), '\u2605\u2605下の行と輪that**同じ旗**から色を決める', true);
}

// v4.1.47(俊克「24時間以上のときは DD HH:MM.SS に。3ヶ月後、2年後のときは、それなりに」)
console.log('\u3256 残り時間の段');
{
 const M=X.meosMmSs, S=1000;
 ok(M((18*60+7)*S)==='18.07', '  1時間未満= 18.07', M((18*60+7)*S));
 ok(M((7*3600+6*60+1)*S)==='7:06.01', '  1日未満= 7:06.01', M((7*3600+6*60+1)*S));
 ok(M(30*86400*S)==='30d 00:00.00', '\u2605\u2605\u260530日= 30d 00:00.00(720:00.00ではない)', M(30*86400*S));
 ok(M((27*86400+3*3600+45*60+12)*S)==='27d 03:45.12', '\u2605\u2605DD HH:MM.SS', M((27*86400+3*3600+45*60+12)*S));
 ok(M(91*86400*S)==='91d 00:00.00', '  3ヶ月後= 91d …', M(91*86400*S));
 ok(M(730*86400*S)==='2y 0d 00:00.00', '\u2605\u26052年後も秒まで出る', M(730*86400*S));
 ok(M(((365+12)*86400+3*3600+45*60+12)*S)==='1y 12d 03:45.12', '\u2605\u2605\u2605どの段でも HH:MM.SS thatが付く', M(((365+12)*86400+3*3600+45*60+12)*S));
 ok(/\.\d\d$/.test(M(730*86400*S)), '\u2605\u2605\u2605秒thatは「動いている」を言う桁so、どこでも落とさない', M(730*86400*S));
}

// v4.1.52(俊克 改良1「繰返し指定を試したけど、1分を設定しても、10分になってしまう」)
console.log('\u3257 掛け直しても \u21bb thatが消えない');
{
 const M=X.meosCycleMs, P=X.meosClockFcParse;
 ok(M('01')===60000&&M('1')===60000, '  \u21bb01 も \u21bb1 も 1分(パーサは元から正しい)', [M('01'),M('1')]);
 ok((P('<!-- Mew!UFC \u23f0 2026-08-31 19:00 \u21bb01 -->')||{}).cycle[0]==='01', '  行からも 01 と読める', true);
 const SRC10=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 const _set=SRC10.slice(SRC10.indexOf('if (scope.key) {\n    try {\n      let _cy'), SRC10.indexOf('if (scope.key) {\n    try {\n      let _cy')+700);
 ok(/cycle: _cy/.test(_set), '\u2605\u2605\u2605Set thatが書く時に繰返しを渡している', /_cy/.test(_set));
 ok(/meosClockFcScan\(scope\.doc\)/.test(_set), '  在れば本文から読んで持ち越す', true);
 ok(!/meosClockFcSet\(scope\.doc, scope\.key, \{ when: meosClockFcStamp\(_at\), hold, lock \}\)/.test(SRC10),
    '\u2605\u21bb を渡さない古い書き方that残っていない', true);
}

// v4.1.58(俊克「(1)\u21bb指定を\u21ba指定に / (2)単位に d w y / (3)Stopという表示が嘘を付いている」)
console.log('\u3259 \u21ba(逆算) と d/w/y と、嘘をつかないStop');
{
 const P=X.meosClockFcParse, C=X.meosCycleMs;
 const cyc=(l)=>{const c=P('<!-- Mew!UFC \u23f0 2099-01-01 09:00 '+l+' -->');return c&&c.cycle;};
 ok(String(cyc('\u21ba8h'))==='8h', '\u2605\u2605\u2605\u21ba(反時計回り)= 逆算タイマー', cyc('\u21ba8h'));
 ok(String(cyc('\u21bb8h'))==='8h', '\u2605\u21bb も読み続ける(既に書かれた物を壊さない)', cyc('\u21bb8h'));
 ok(C('30d')===30*86400000, '\u2605d(日)', C('30d'));
 ok(C('2w')===2*604800000, '\u2605w(週)', C('2w'));
 ok(C('1y')===365*86400000, '\u2605y(年)= 365日', C('1y'));
 ok(C('1M')===60000, '  M は単位にしない(mと同じ分として読む= 月ではない)', C('1M'));
 const SRC14=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/' \\u21ba' \+ spec\.cycle\.join/.test(SRC14)||/\u21ba' \+ spec\.cycle\.join/.test(SRC14), '\u2605\u2605書く時は \u21ba', true);
 ok(/var _stopMode=\(vmRing\|\|\(_nl>0&&_nl<=60000\)\)/.test(SRC14), '\u2605\u2605\u2605残り1分以内は、鳴っていなくてもStopを出す', true);
 ok(/if\(vmRing\|\|window\.__clkStopMode\)/.test(SRC14), '\u2605\u2605出している間は、押せば止まる(表示that約束を守る)', true);
 const _cs=SRC14.slice(SRC14.indexOf("message.type === 'clockStop'"), SRC14.indexOf("message.type === 'clockStop'")+700);
 ok(/meosEndPseudoTimer\(best\.k\)/.test(_cs), '\u2605\u2605\u2605Stopは音を黙らせるだけでなく、この回を終わらせる', true);
 ok(/<= 90000/.test(_cs), '  遠い時計を巻き込まない(90秒以内だけ)', true);
}

console.log(ng?('NG '+ng+'件'):'全項目 PASS'); process.exit(ng?1:0);
},50);
