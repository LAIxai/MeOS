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
 +'\nmodule.exports.__t={_meosClockMem,_meosPseudoUntil,_meosPseudoScopes,_meosClockLoaded,meosClockMeta,meosLoadClocksFor,meosParseWhen,meosClockList,meosClockFcParse,meosClockFcScan,meosArmClockFcFor,meosClockFcStamp,meosMmSs,meosPairBlockEnd,collectPairs,foldRangeEnd,meosDefBlocks};\n');
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
ok(X.meosMmSs(34*1000)==='0:34', '1分未満= 0:34', X.meosMmSs(34*1000));
ok(X.meosMmSs((59*60+30)*1000)==='59:30', '1時間未満= 分:秒', X.meosMmSs((59*60+30)*1000));
ok(X.meosMmSs((3600+20*60+55)*1000)==='1:20.55', '\u2605\u26051時間以上= 時:分.秒', X.meosMmSs((3600+20*60+55)*1000));
ok(X.meosMmSs(450*60*1000)==='7:30.00', '\u2605450分は 7:30.00(450:34では読めない)', X.meosMmSs(450*60*1000));

// v4.1.15(俊克 質問1「⏰を設定した膜が、カーソルを外に出すと勝手に折り畳まれる。なぜ?」):
//   ★真因= 畳み範囲の交差。膜 1..4 に対して FCの塊 3..5 がはみ出していた。
//   入れ子(膜 ⊇ FCの塊)に戻っているかを、ここで見張る。
console.log('\u246a 畳み範囲は入れ子に収まる(交差させない)');
const L3=['# t','<!-- {* \u25bcmCN=D_1 // c *} -->','x','<!-- {* \u25b2mCN=D_1 // c *} -->',
 '<!-- Mew!FC mCN (\ud83d\udcca\u22950+0D-2Y) -->','<!-- Mew!FC \u23f0 2026-12-31 23:00 -->'];
const mk4=(uri)=>({uri:{toString:()=>uri,fsPath:'/f.md',scheme:'file'},languageId:'markdown',lineCount:L3.length,
 lineAt:n=>({text:L3[n],range:new stub.Range(n,0,n,L3[n].length)}),getText:()=>L3.join('\n'),eol:1,fileName:'/f.md',isClosed:false,version:1});
const d4=mk4('file:///g.md'), pr4=X.collectPairs(d4,{excludeIndex:false})[0];
const mEnd=X.foldRangeEnd(d4,pr4), fcEnd=Math.max(...X.meosDefBlocks(d4).map(b=>b.end));
ok(mEnd===5, '\u2605\u2605\u23f0行も膜の塊に入る(コピーにも畳みにも入る)', mEnd);
ok(fcEnd<=mEnd, '\u2605\u2605\u2605FCの塊が膜からはみ出さない(はみ出すと外側が畳まれる)', [fcEnd,mEnd]);

console.log(ng?('NG '+ng+'件'):'全項目 PASS'); process.exit(ng?1:0);
},50);
