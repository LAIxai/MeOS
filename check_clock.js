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
 +'\nmodule.exports.__t={_meosClockMem,_meosPseudoUntil,_meosPseudoScopes,_meosClockLoaded,meosClockMeta,meosLoadClocksFor,meosParseWhen,meosClockList,meosClockFcParse,meosClockFcScan,meosArmClockFcFor,meosClockFcStamp,meosMmSs,meosPairBlockEnd,meosClockBadgeRow,meosClockBadgeRowForLine,collectPairs,foldRangeEnd,meosFcFoldShape,meosClockFaceForLine,meosClockFcStamp,meosCycleElemSpan,meosClockArrowAt,meosFcWantsOpen,meosDefBlocks,meosBlockEndForCarry,meosIsUnfoldingSpecLine,meosIsSpecLine,meosCycleMs,meosCycleSeriesNext,meosParseTagInput,meosMembraneTags,meosMembraneTagsLine,meosParseCycleInput,meosNextTickDelay,meosClockRollToNextDay,meosParseStampLoose,meosClockForget,_meosClockDropped,_meosClockLoaded,meosNoteClockHistory,_meosClockHistory,meosClockFaceMs,meosNextClockScope,meosApplyTimerLineDecorations,meosClockFcStamp2:meosClockFcStamp};\n');
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
// ★★★v4.1.105(俊克 9/4 am09:02「膜の外にカーソルが出ている状態では、バッジFCは折り畳むのがルール」):
//   形はカーソルで変わる。外= 膜がバッジ行まで畳む(入れ子) / 中= 畳みは▲で止まり塊の頭がバッジ行へずれる(離れる)。
//   どちらの瞬間も交差しないことを、両方見張る。
/* ★★★v4.1.147(俊克 9/5 pm11:49「バッジの部分を折り畳まずに、その2行を使って見せかけで2行に分割」):
   生きた⏰that在る膜では、バッジ行は動く数字の置き場so、カーソルthat外でも畳まない(形は「中」と同じ▲止め)。
   ★交差の見張りは実際に渡す範囲(hasRange)で見る= b.end は生の塊の終わりso、畳むかどうかを語らない。 */
ok(mEnd===3, '★★★カーソルthat外でも、生きた⏰の膜はバッジ行を畳まない(数字の置き場)', mEnd);
ok(X.meosFcFoldShape(d4,-1).filter(it=>it.hasRange).every(it=>it.head>mEnd),
   '★★★カーソルthat外でも交差しない(渡す範囲は膜の外だけ)', X.meosFcFoldShape(d4,-1).map(it=>[it.head,it.end,it.hasRange]));
ok(X.meosClockBadgeRow(d4,pr4)===4, '★数字の置き場はバッジ行', X.meosClockBadgeRow(d4,pr4));
{
 const L3b=L3.slice(0,5);   /* ⏰行を外した同じ膜= 時計thatが無ければ今までどおり畳む */
 const d4b={uri:{toString:()=>'file:///h.md',fsPath:'/h.md',scheme:'file'},languageId:'markdown',lineCount:L3b.length,
  lineAt:n=>({text:L3b[n],range:new stub.Range(n,0,n,L3b[n].length)}),getText:()=>L3b.join('\n'),eol:1,fileName:'/h.md',isClosed:false,version:1};
 const pr4b=X.collectPairs(d4b,{excludeIndex:false})[0];
 ok(X.foldRangeEnd(d4b,pr4b)===4, '★★時計thatが無ければ、今までどおりバッジ行まで畳む', X.foldRangeEnd(d4b,pr4b));
 ok(X.meosClockBadgeRow(d4b,pr4b)===-1, '  判定も「置き場は無い」と答える(1つの判定から引く)', X.meosClockBadgeRow(d4b,pr4b));
}
ok(X.foldRangeEnd(d4,pr4,true)===3, '\u2605\u2605\u2605カーソルが中= 畳むのは▲まで(バッジ行は膜の直下に見える)', X.foldRangeEnd(d4,pr4,true));
ok(X.meosFcFoldShape(d4,1).filter(it=>it.hasRange).every(it=>it.head>X.foldRangeEnd(d4,pr4,true)), '\u2605\u2605\u2605カーソルが中でも交差しない(塊の頭は膜の外)', X.meosFcFoldShape(d4,1).map(it=>[it.head,it.end,it.hasRange]));
ok(X.meosFcFoldShape(d4,1).filter(it=>it.hasRange).length===0, '\u2605バッジ行だけなら範囲を渡さない(畳む中身が無い)', X.meosFcFoldShape(d4,1).length);
ok(X.meosBlockEndForCarry(d4,pr4)===5, '\u2605\u2605でも運ぶ時は一緒に行く(コピー/複製に⏰が入る)', X.meosBlockEndForCarry(d4,pr4));

// ★★★v4.1.142(俊克 9/5 pm06:46 改良1「回数が同じオレンジ色では目立たない」改良2「常に同時起動にして
//   『□ Repeat ↺↻』の1つボタンに。史上初のデフォルトで同時表示タイマーってね」
//   改良3「Set⏰は右端。未設定では押せなくして、何かを設定したら押せるように」):
console.log('\u247e 既定で ↺↻ / Set は指定してから押せる');
{
  const S11=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  ok(!/id="clk-dir"/.test(S11), '\u2605\u2605\u2605向きの駒は面から消えた(選ばせない)', true);
  ok(/dual:true,cycle:/.test(S11), '\u2605\u2605\u2605面は常に \u21ba\u21bb を頼む', true);
  ok(/dual: _dl0, rounds: _rd0 \}\)/.test(S11), '\u2605面が言った同時が、書く所まで届く', true);
  ok(/\.clk-set\{margin-left:auto/.test(S11), '\u2605Set は右端(折り返しても)', true);
  ok(/pointer-events:none/.test(S11) && /\.clk-set\.on\{/.test(S11),
     '\u2605\u2605\u2605未設定では押せない・指定したら押せる(薄い/濃い)', true);
  ok(/function clkTouch\(\)/.test(S11) && /clkDirty=false;clkPaintSet\(\)/.test(S11),
     '\u2605\u2605開いた時は未設定から始まる', true);
  ok(/color: new vscode\.ThemeColor\('editor\.foreground'\), fontWeight: '800' \} \} \}\);/.test(S11),
     '\u2605\u2605周回数は地(橙)でも顔(緑/水色)でもない色', true);
}

// ★★★v4.1.138(俊克 9/5 pm05:27「SW/CD同時記法を `↺↻3m/1m` にしようよ。こうすれば、
//   さっきの私の入力ミスは起きない」): 1行にすれば、2本がずれる余地が消える。
console.log('\u247d ↺↻ = 1行に顔が2つ');
{
  const P=(t)=>X.meosClockFcParse('<!-- Mew!UFC ' + t + ' -->');
  const d=P('\u23f0 2026-09-05 17:30 \u21ba\u21bb3m/1m');
  ok(d && d.dual===true && d.cycle.join('/')==='3m/1m', '\u2605\u2605\u2605\u21ba\u21bb を読む(周期はそのまま)', d && [d.dual, d.cycle]);
  ok(d && d.when==='2026-09-05 17:30', '\u2605\u2605起点は1つ= ずれようが無い', d && d.when);
  const r=P('\u23f0 2026-09-05 17:30 \u21bb\u21ba3m/1m');
  ok(r && r.dual===true, '\u2605並びが逆でも読む(\u21bb\u21ba)', r && r.dual);
  const one=P('\u23f0 2026-09-05 17:30 \u21bb3m/1m');
  ok(one && one.dual===false && one.up===true, '\u2605片方だけは今までどおり', one && [one.dual, one.up]);
  const S10=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  ok(/spec\.dual \? '\\u21ba\\u21bb'/.test(S10), '\u2605\u2605書く時も \u21ba\u21bb で戻す(書き換えで片方に化けない)', true);
  ok(!/cycle: c\.cycle, up: c\.up, tags:/.test(S10) && !/cycle: hit\.cycle, up: hit\.up, tags:/.test(S10),
     '\u2605\u2605\u2605読んだ物をそのまま返す口は全部 dual を持つ', true);
  ok(/dual: c\.dual, rounds: c\.rounds, tags: _tags, ufc: c\.ufc/.test(S10),
     '\u2605\u2605\u2605拾い読み(scan)も dual を運ぶ(ここが抜けると hit.dual が空になる)', true);
}

// ★★★v4.1.136(俊克 9/5 pm04:43「ストップウォッチは、タイマを起動した時からの経過時間だよ。
//   スタート時点からどれだけ経過したかを知るためだよ。それだけ」):
console.log('\u247c ゴング前 — 逆算は残り / ストップウォッチは掛けてからの経過');
{
  const now=Date.now(), origin=now+600000;          /* 起点は10分後 */
  const cd={when:X.meosClockFcStamp(origin),up:false,cycle:['3m','1m']};
  const sw={when:X.meosClockFcStamp(origin),up:true, cycle:['3m','1m']};
  const sc={when:cd.when, step:180000, armedAt: now-90000};   /* 1分30秒前に掛けた */
  const a=X.meosClockFaceForLine(origin,cd,sc,now);
  const b=X.meosClockFaceForLine(origin,sw,sc,now);
  ok(Math.round(a/1000)===600, '\u2605\u2605逆算はゴングまでの残り(10分)', Math.round(a/1000)+'s');
  ok(Math.round(b/1000)===90, '\u2605\u2605\u2605ストップウォッチは掛けてからの経過(1分30秒)= 0.00で止まらない', Math.round(b/1000)+'s');
  /* ゴングを過ぎたら、今までどおり回の中の話に戻る */
  const past=now-600000;
  const cd2={when:X.meosClockFcStamp(past),up:false,cycle:['3m','1m']};
  const sw2={when:X.meosClockFcStamp(past),up:true, cycle:['3m','1m']};
  const sc2={when:cd2.when, step:180000, armedAt: now-90000};
  const u2=now+150400;
  const a2=X.meosMmSs(X.meosClockFaceForLine(u2,cd2,sc2,now)), b2=X.meosMmSs(X.meosClockFaceForLine(u2,sw2,sc2,now));
  const sec=(t)=>{const m=/^(?:(\d+):)?(\d+)\.(\d+)$/.exec(t); return m?((+(m[1]||0))*3600+(+m[2])*60+(+m[3])):-1;};
  ok(sec(a2)+sec(b2)===180, '\u2605\u2605\u2605ゴングの後は A + B = 1回分の長さ(今までどおり)', a2+' + '+b2);
}

// ★★v4.1.133(俊克 9/5 pm02:56 改良3「copy ⏰ ボタン」＋ pm03:12「既存の膜の直下にペーストするのが
//   目的so、膜の同時生成は不要」):
console.log('\u247b copy \u23f0 は ⏰行だけを写す');
{
  const S9=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  const K9=S9.slice(S9.indexOf("message.type === 'clockCopy'"), S9.indexOf("message.type === 'clockCopy'")+1400);
  ok(/meosClockFcScan\(_sc\.doc\)\.filter\(c => c\.key === _sc\.key\)/.test(K9),
     '\u2605\u2605\u2605写すのはその膜の ⏰行だけ(バッジは連れて行かない)', true);
  ok(/_sc\.doc\.lineAt\(r\.line\)\.text/.test(K9) && /join\('\\n'\)/.test(K9),
     '\u2605行はそのままの字で写す(貼れば貼り先の膜の時計になる)', true);
  ok(/vscode\.env\.clipboard\.writeText\(_txt\)/.test(K9), '\u2605クリップボードへ置くだけ(貼る先も時も人の物)', true);
  ok(!/meosNewMembrane|buildMembraneOpenLine/.test(K9), '\u2605\u2605膜は作らない(俊克 pm03:12)', true);
  ok(/id="clk-copy"/.test(S9) && /_id==='clk-copy'/.test(S9), '\u2605面にボタンが在り、押すと node へ届く', true);
  /* ★★★v4.1.134(俊克 質問1「copy ⏰ ボタンは表示されるけど、動作はしてないよね?」):
     枝を足しても、**扉の名簿に入れなければ通らない**(closest の選択子)。 */
  ok(/closest\('#clk-lock,#clk-unlock,#clk-rep,#clk-dir,#clk-cyc,#clk-tagin,#clk-copy,#clk-set'\)/.test(S9),
     '\u2605\u2605\u2605押した物をたどる名簿に copy が入っている(枝だけ足しても通らない)', true);
}

// ★★v4.1.132(俊克 9/5 pm02:56 改良1「残り時間の数字も緑色にし、ストップウォッチの数字を水色に」
//   改良2「繰り返した回数も表示しようよ。ボクシングタイマーのとき、何ラウンドかが分るからね」):
console.log('\u247a 数字は矢印と同じ色 / 何周目かを数える');
{
  const base=new Date(2026,8,5,14,20).getTime();
  const R=(ms)=>X.meosCycleSeriesNext(base,['3m','1m'],base+ms).round;
  /* ★v4.1.137: 待ちは0周目(ゴングで1周目が始まる)。 */
  {const base2=new Date(2026,8,5,14,20).getTime();
   ok(X.meosCycleSeriesNext(base2,['3m','1m'],base2-60000).round===0, '\u2605\u2605\u2605ゴング前は0周目(まだ始まっていない)', X.meosCycleSeriesNext(base2,['3m','1m'],base2-60000).round);}
  ok(R(1)===1, '\u2605起点直後は1周目', R(1));
  ok(R(210000)===1, '\u26053.5分後(1mの回)もまだ1周目', R(210000));
  ok(R(240001)===2, '\u2605\u2605\u26054分を過ぎたら2周目(3m+1mで一周)', R(240001));
  ok(R(480001)===3, '\u2605\u26058分を過ぎたら3周目', R(480001));
  const S8=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  ok(/before: \{ contentText: '\\u23f0 ' \+ _face\(false\) \+ ' ', color: MEOS_CLOCK_DIR_DOWN/.test(S8)
     && /after: \{ contentText: _face\(true\) \+ ' ', color: MEOS_CLOCK_DIR_UP/.test(S8),
     '\u2605\u2605\u2605数字は矢印と同じ色(\u21ba=緑 / \u21bb=水色)= 色を増やさない', true);
  /* ★v4.1.140: 周回数は顔と役が違うので、色も場所も分ける(行の右端・橙)。 */
  /* ★★v4.1.141: 時計はコメントの中に立つ(v4.1.20)。顔は `-->` の1つ手前、周回数は `-->` の直前。 */
  ok(/rounds\.push\(\{ range: new vscode\.Range\(_fl, _fat2, _fl, _fat2\)/.test(S8) && /color: '#e0803a'/.test(S8),
     '\u2605\u2605\u00d7N は別の駒・別の色で、コメントの**中**に立つ', true);
  ok(/let _fl = i, _at1 = \(_at2 > 0\) \? \(_at2 - 1\) : _at2, _fat2 = _at2, _rndAfter = false;/.test(S8) && /range: new vscode\.Range\(_fl, _at1, _fl, _at1\)/.test(S8),
     '\u2605\u2605\u2605場所を1つずらして順番を決める(同じ所に2つ置かない)', true);
  /* \u2605\u2605\u2605v4.1.147: 数字はすぐ上のバッジ行へ出す(生データは1文字も動かさない= UFC1行のコピペthat時計になる)。 */
  /* ★★★v4.1.148(俊克 9/6 am00:07「**行頭からタイマ数値that見えることthat目的**だよ」):
     右端では窓を狭めた瞬間に切れる= 幅に負けないためには行頭でなければ意味thatない。 */
  ok(/const _bgRaw = meosClockBadgeRowForLine\(doc, i\);/.test(S8) && /_at1 = 0;\s+\/\/ 顔は\*\*行頭\*\*/.test(S8)
     && /_fat2 = _blen; _rndAfter = true;/.test(S8) && /renderOptions: _rndAfter/.test(S8),
     '\u2605\u2605\u2605動く数字はバッジ行の**行頭**へ／\u00d7N は行末の外側(隠した範囲の内側に置くと一緒に畳まれる)', true);
  ok(/badgeHide\.push\(new vscode\.Range\(_bg2, 0, _bg2, _blen\)\)/.test(S8) && /opacity: 0; font-size: 0;/.test(S8),
     '\u2605\u2605バッジ行は**中身を消して場所だけ借りる**(数字thatが行頭に立つ)', true);
  /* \u2605\u2605\u2605v4.1.151(俊克 バグ1/2): 生を見せている行thatあるなら、その膜では**借りない**=
     消さないだけでなく**置かない**。数字は⏰行のコメントの内側へ戻る(昨日と同じ轍を踏まない)。 */
  ok(/\(_bgRaw >= 0 && !meosShowsRawLine\(editor, _bgRaw\) && !meosShowsRawLine\(editor, i\)\) \? _bgRaw : -1/.test(S8),
     '\u2605\u2605\u2605生を見せている行thatあれば借りない(消さないだけでなく置かない)', true);
  ok(/if \(_blen\) badgeHide\.push/.test(S8),
     '  借りると決めた行は必ず消す(判定は1か所で済ませる)', true);
  ok(/\(typeof _nx\.round === 'number'\) \? _nx\.round : 1/.test(S8) && !/_nx\.round \|\| 1/.test(S8),
     '\u2605\u2605\u2605`\|\| 1` は 0 を 1 に化けさせる(\u00d70 that出なかった正体)', true);
  ok(/renderOptions: c\.dual/.test(S8) && !/for \(let _fi = 0/.test(S8),
     '\u2605\u2605\u26051つの駒に2つの顔(before\u2192after)= 描く順が決まる(交互に入れ替わらない)', true);
  ok(/_rnd0\(_sc7\)\)\s*\?\s*\('\\u00d7' \+ _sc7\.round \+ \(c\.rounds > 0 \? \('\/' \+ c\.rounds\) : ''\)\)/.test(S8),
     '\u2605\u2605繰返しの時だけ \u00d7N(N周目)を数字の後ろへ', true);
}

// ★★★v4.1.130(俊克 9/5 pm02:10 バグ1「UFCだけ入れても1つ前の行の文字を含めてオレンジ色になる」
//   バグ2「同時起点の2つのタイマ値がまだ一致しない」バグ3「×で未来の予定も削除されてしまう」):
console.log('\u2479 持ち主の無い⏰は対にしない / 「今」は一回に1つ / × は走っている1本');
{
  const S7=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  const P7=S7.slice(S7.indexOf('function meosFcPairAt'), S7.indexOf('function meosFcPairAt')+2500);
  ok(/_orphanClock/.test(P7) && /!meosClockLineIsLive\(doc, i\)/.test(P7),
     '\u2605\u2605\u2605持ち主の無い⏰は橙の対応に入れない(関係の無い行が対だと名乗らない)', true);
  const D7=S7.slice(S7.indexOf('function meosApplyTimerLineDecorations'), S7.indexOf('function meosApplyTimerLineDecorations')+14000);
  ok(/const _nowAll = Date\.now\(\);/.test(D7) && /meosClockFaceForLine\(until, \{ when: c\.when, up: u, cycle: c\.cycle \}, _sc7, _nowAll\)/.test(D7),
     '\u2605\u2605\u2605一回の描画の「今」は1つ(2つの顔が秒の境目でずれない)', true);
  ok(/const _now = \(typeof now === 'number'\) \? now : Date\.now\(\);/.test(S7),
     '\u2605渡されなければ今までどおり自分で見る', true);
}

// ★★★v4.1.1120(俊克 9/5 pm02:02 疑問点1「直前に閉じ膜がなければ、無視するべきだよね」
//   バグ1「同時起点の2つが、1秒ズレている」):
console.log('\u2478 持ち主は閉じ膜だけ / A + B = 1回分の長さ');
{
  const S6=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  const C6=S6.slice(S6.indexOf('function meosClockFcScan'), S6.indexOf('function meosClockFcScan')+9000);
  ok(/const owner = pairs\.find\(p => p\.end === j\) \|\| null;/.test(C6) && /if \(!owner\) continue;/.test(C6),
     '\u2605\u2605\u2605直前の閉じ膜が無ければ読まない(予備の道を外した)', true);
  ok(!/if \(!owner\) for \(const p of pairs\)/.test(C6),
     '\u2605\u2605膜の中のどこに在っても持ち主を作る道は無い', true);
  const F6=S6.slice(S6.indexOf('function meosClockFaceForLine'), S6.indexOf('function meosClockFaceForLine')+2000);
  /* ★★★v4.1.131: 形でなく**数**で確かめる= 2つの顔を同じ「今」で出して、足して長さになるか。 */
  {
    const step=180000, until=Date.now()+150400;   /* 3分の回・残り2:30.4 */
    const now=Date.now();
    const cd={when:'2026-09-05 14:20',up:false,cycle:['3m','1m']};
    const sw={when:'2026-09-05 14:20',up:true, cycle:['3m','1m']};
    const sc={when:'2026-09-05 14:20',step:step};
    const a=X.meosMmSs(X.meosClockFaceForLine(until,cd,sc,now));
    const b=X.meosMmSs(X.meosClockFaceForLine(until,sw,sc,now));
    const sec=(t)=>{const m=/^(?:(\d+):)?(\d+)\.(\d+)$/.exec(t); return m?((+(m[1]||0))*3600+(+m[2])*60+(+m[3])):-1;};
    ok(sec(a)+sec(b)===step/1000, '\u2605\u2605\u2605A + B = 1回分の長さ(画面に出る数で確かめる)', a+' + '+b+' = '+(sec(a)+sec(b))+'s');
    ok(sec(a)>0&&sec(b)>0, '\u2605両方とも動いている数that出る', [a,b]);
  }
}

// ★★★v4.1.1118(俊克 9/5 pm01:05 バグ1「反対の逆算タイマーを追加したら、2つとも逆算で
//   起動してしまった。完了したら、↻だったのに、↺✓に変わってしまった」):
console.log('\u2477 書き戻しは向きを落とさない / 同じ時刻の2本を行で見分ける');
{
  const S5=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  const E5=S5.slice(S5.indexOf('async function meosEndPseudoTimer'), S5.indexOf('async function meosEndPseudoTimer')+4000);
  ok(/done: true \}, h\.line\)/.test(E5) && /cycle: h\.cycle, up: h\.up/.test(E5),
     '\u2605\u2605\u2605済みにする時も向きと周期をそのまま返す(\u21bb が \u21ba に化けない)', true);
  ok(/typeof scope\.line === 'number' \? _hits2\.find\(c => c\.line === scope\.line\)/.test(E5),
     '\u2605\u2605鳴った1本は**行**で名指しする(時刻は控え)', true);
  /* \u2605v4.1.1119: 同じ起点の行は同じ時計so、済みも一緒。繰返しは付けない。 */
  ok(/const _same = _hits2\.filter\(h => String\(h\.when\) === String\(_hit\.when\) && !\(Array\.isArray\(h\.cycle\)/.test(E5),
     '\u2605\u2605\u2605同じ起点の行は一緒に済みになる(繰返しは除く)', true);
  const A5=S5.slice(S5.indexOf('function meosArmClockFcFor'), S5.indexOf('function meosArmClockFcFor')+14000);
  ok(/line: c\.line,/.test(A5) && /_s\.line = c\.line;/.test(A5),
     '\u2605\u2605控えは行も持ち、毎回読み直す', true);
  /* \u2605\u2605\u2605v4.1.1119(俊克 pm01:10): 鳴る時刻が同じ行は「同じ1つの時計の別の顔」so、並べて出す。 */
  ok(/if \(_sc9 && _sc9\.when && String\(c\.when\) !== String\(_sc9\.when\)\) continue;/.test(S5),
     '\u2605\u2605\u2605同じ起点なら何本でも出す / 違えば出さない', true);
  ok(/function meosClockFaceForLine\(until, c, sc, now\)/.test(S5) && /if \(!c \|\| !c\.up\) return left;/.test(S5),
     '\u2605\u2605\u2605顔は**その行**の向きで出す(片方が\u21ba、片方が\u21bb)', true);
}

// ★★★v4.1.1117(俊克 9/5 pm00:22 バグ1「⏸を削除して再開したが、2つが同時に動いている
//   …2番目の単発タイマが終了したのに、FC化しない」):
//   控えを作るのは armClock ただ 1 つ。膜に掛ける物は手で作らない。
console.log('\u2476 控えを作る口は 1 つ');
{
  const S4=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  const T4=S4.slice(S4.indexOf('async function meosStartPseudoTimer'), S4.indexOf('async function meosStartPseudoTimer')+9000);
  ok(/if \(scope\.key\) \{[^]{0,600}meosArmClockFcFor\(scope\.doc\)/.test(T4),
     '\u2605\u2605\u2605膜に掛ける物は本文へ書いて armClock に任せる', true);
  ok(/_meosPseudoScopes\.set\(lk, \{ doc: scope\.doc[^]{0,200}fc: !!scope\.key \}\)/.test(T4),
     '\u2605膜の外(mMETA)だけは今までどおり自前', true);
  const E4=S4.slice(S4.indexOf('async function meosEndPseudoTimer'), S4.indexOf('async function meosEndPseudoTimer')+3000);
  ok(/scope\.when \? _hits2\.find\(c => String\(c\.when\) === String\(scope\.when\)\)/.test(E4),
     '\u2605\u2605\u2605鳴ったのはどの行かを控えの when で名指しする', true);
}

// ★★★v4.1.1115(俊克 9/5 am11:38 バグ1「⏰▼パネルで設定すると、UFCコメントが
//   上書きされてしまう。今表示しているUFC群の次の行に追加する形にしようよ」):
console.log('\u2475 新しい予定は足す、名指しされた1本は直す');
{
  const S3=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  const F=S3.slice(S3.indexOf('async function meosClockFcSet'), S3.indexOf('async function meosClockFcSet')+9000);
  ok(/async function meosClockFcSet\(doc, key, spec, atLine\)/.test(F), '\u2605どの行の話かを言える', true);
  ok(/const _named = \(typeof atLine === 'number'/.test(F), '\u2605\u2605名指しされた1本を探す', true);
  ok(/\} else if \(hit && spec\) \{[^]{0,900}ed\.insert\(doc\.uri/.test(F),
     '\u2605\u2605\u2605名指しが無ければ**群の次の行に足す**(走っている物を消さない)', true);
  /* \u2605v4.1.1116: 足し方は**下の枝と同じ形**((行,0) へ line+改行)= 家の中の同じ役の部品を真似る。 */
  ok(/const _ln2 = Math\.min\(_last\.line \+ 1, doc\.lineCount\)/.test(F), '\u2605足すのは群の**最後**の行の下', true);
  ok(/if \(_ln2 < doc\.lineCount\) ed\.insert\(doc\.uri, new vscode\.Position\(_ln2, 0\), line \+ '\\n'\)/.test(F),
     '\u2605\u2605実績のある書き方と揃える((行,0) へ line+改行)', true);
  ok(/const _applied = await vscode\.workspace\.applyEdit\(ed\)/.test(F) && /書けなかった/.test(F),
     '\u2605\u2605\u2605書けなかった時は名乗る(黙って false を返さない)', true);
  /* 「その1本」を意味する呼び手は行番号を渡している */
  ok(/done: true \}, c\.line\)/.test(S3) && /off: true \}, c\.line\)/.test(S3) && /done: false \}, c\.line\)/.test(S3),
     '\u2605\u2605済み/休み/名前戻しは行を名指しする', true);
  ok(/off: true \}, hit\.line\)/.test(S3) && /off: false \}, hit\.line\)/.test(S3),
     '\u2605一覧の休み/戻しも行を名指しする', true);
}

// ★★★v4.1.1114(俊克 9/5 am10:54 バグ2「1mに切り替わったあと、2.00から始まってしまう」
//   改良1「⏸が表示する部分に✓を書き込むと、それを⏸に書き直してくれる」):
console.log('\u2474 今の回の長さ / 顔の \u2713 は休み');
{
  const S2=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  const A2=S2.slice(S2.indexOf('function meosArmClockFcFor'), S2.indexOf('function meosArmClockFcFor')+14000);
  ok(!/_s\.step = meosCycleMs\(c\.cycle\[0\]\); _s\.cyc/.test(A2),
     '\u2605\u2605\u2605並びの先頭を入れ続けない(1mの回でstep=3mなら 3-1=2.00 から始まる)', true);
  ok(/meosCycleSeriesNext\(_b\.getTime\(\), c\.cycle, _u - 1\)/.test(A2),
     '\u2605\u2605until で終わる回を訊いて、今の長さと番号を控える', true);
  /* 顔の \u2713 = 休み */
  const P2=(t)=>X.meosClockFcParse(t);
  const a2=P2('<!-- Mew!UFC \u23f0\u2713 2026-09-05 10:16 \u21bb3m/1m -->');
  ok(a2 && a2.off===true && a2.done===false && a2.when==='2026-09-05 10:16',
     '\u2605\u2605\u2605顔の \u2713 は「休み」(時刻はそのまま読める)', a2 && [a2.off, a2.done, a2.when]);
  const b2=P2('<!-- Mew!FC \u23f0 2026-09-05 10:16 \u21bb3m/1m\u2713 -->');
  ok(b2 && b2.done===true && b2.off===false, '\u2605末尾の \u2713 は今までどおり「済み」', b2 && [b2.off, b2.done]);
  const c2=P2('<!-- Mew!UFC \u23f0\u23f8 2026-09-05 10:16 -->');
  ok(c2 && c2.off===true, '\u2605\u23f8 も今までどおり休み', c2 && c2.off);
}

// ★★v4.1.1111(俊克 9/5 改良1「↻3m/1m のようなケースで、3m側が動作している時は、3mを白色にしよう」):
console.log('\u2473 並びのどれが今なのかを、並びそのものが言う');
{
  const T='<!-- Mew!UFC \u23f0 2026-09-05 09:15 \u21bb3m/1m -->';
  const a=X.meosClockArrowAt(T);
  const s0=X.meosCycleElemSpan(T,a,0), s1=X.meosCycleElemSpan(T,a,1);
  ok(T.slice(s0[0],s0[1])==='3m', '\u2605\u26050番目は 3m', T.slice(s0[0],s0[1]));
  ok(T.slice(s1[0],s1[1])==='1m', '\u2605\u26051番目は 1m', T.slice(s1[0],s1[1]));
  ok(X.meosCycleElemSpan(T,a,2)===null, '\u2605無い番号は null(描かない)', X.meosCycleElemSpan(T,a,2));
  const base=new Date(2026,8,5,9,15).getTime();
  const n0=X.meosCycleSeriesNext(base,['3m','1m'],base+1000);
  const n1=X.meosCycleSeriesNext(base,['3m','1m'],base+3.5*60000);   /* 3分〜4分の間= 1m の回の中 */
  const n2=X.meosCycleSeriesNext(base,['3m','1m'],base+4*60000);     /* ちょうど4分= 2周目の 3m に入った所 */
  ok(n0.idx===0, '\u2605\u2605\u2605起点直後は 3m を走っている', n0.idx);
  ok(n1.idx===1, '\u2605\u2605\u26053.5分後は 1m を走っている', n1.idx);
  ok(n2.idx===0, '\u2605\u2605一周したら 3m へ戻る(並びthat状態を持つ)', n2.idx);
  /* \u2605\u2605\u2605v4.1.1113: **宣言より前で読まない**(TDZ= try/catch that黙って握り潰す)。
     v4.1.1111はこれで一度も走っていなかった= 俊克の目that捕まえるまで、誰も気づけなかった。 */
  const S1=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  const D=S1.slice(S1.indexOf('function meosApplyTimerLineDecorations'), S1.indexOf('function meosApplyTimerLineDecorations')+14000);
  ok(D.indexOf('let owner = _pairs()') >= 0 && D.indexOf('cycNow.push') > D.indexOf('let owner = _pairs()'),
     '\u2605\u2605\u2605owner の宣言より**後ろ**で使う(TDZ を作らない)', [D.indexOf('let owner = _pairs()'), D.indexOf('cycNow.push')]);
}

// ★★★v4.1.1110(俊克 9/5 am08:49「直下のUFCタイマーのみを動かす」):
//   同じ膜に⏰が2本在る時、動くのは直下(一番上)の生きた1本だけ。
//   済んだ物(done)は席を取らない＝ 一度きりが終われば次の1本が自動で直下になる。
console.log('\u2471 動くのは直下の1本だけ');
{
  const S0=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  const A=S0.slice(S0.indexOf('function meosArmClockFcFor'), S0.indexOf('function meosArmClockFcFor')+14000);
  ok(/const _liveTaken = new Set\(\)/.test(A), '\u2605生きている1本を覚える席が在る', true);
  /* \u2605v4.1.1112: 席を譲るのは「済み」だけ。「休み」(⏸)は席を保つ。 */
  ok(/if \(!c\.done\) \{ if \(_liveTaken\.has\(c\.key\)\) continue; _liveTaken\.add\(c\.key\); \}/.test(A),
     '\u2605\u2605\u2605二本目以降は仕掛けない(済んだ物だけが席を譲る)', true);
  ok(!/if \(!c\.done && !c\.off\) \{ if \(_liveTaken/.test(A), '\u2605\u2605休み(\u23f8)は席を保つ(一時停止は順番を譲らない)', true);
  ok(/if \(c\.ufc\) \{ try \{ meosClockFcSet\(doc, c\.key, \{[^}]*done: true/.test(A),
     '\u2605\u2605手で \u2713 を書いたらFC化する(名前は状態の写し)', true);
  ok(A.indexOf('_liveTaken') < A.indexOf('_meosPseudoUntil.has(lk)'),
     '\u2605\u2605門番は「既に掛かっているか」より**先**(後の1本が控えを上書きしない)', true);
  ok(/when: String\(c\.when \|\| ''\)/.test(A), '\u2605掛かっているのはどの行かを控える', true);
  ok(/_sc9 && _sc9\.when && String\(c\.when\) !== String\(_sc9\.when\)/.test(S0),
     '\u2605\u2605待機中の行(違う時刻)には数字を出さない', true);
}

// ★★★v4.1.1108(俊克 9/4 pm11:24「一度きりの逆算も↺を入れようよ。
//   **数字が無いのは周期が無い＝単発**ということだからね。**↺は方向だけを示している**」):
//   矢印＝向き / 数字＝周期。役が2つに分かれ、行が自分で名乗る。
console.log('\u2470 矢印＝向き / 数字＝周期');
{
  const P = (t) => X.meosClockFcParse('<!-- Mew!UFC ' + t + ' -->');
  const a = P('\u23f0 2026-09-04 23:59 \u21bb');
  ok(a && a.up === true && a.cycle === null, '\u2605\u2605\u2605一度きりのストップウォッチが書ける(\u21bbだけ)', a && [a.up, a.cycle]);
  const b = P('\u23f0 2026-09-04 23:59 \u21ba');
  ok(b && b.up === false && b.cycle === null, '\u2605\u2605一度きりの逆算も向きを名乗る(\u21baだけ)', b && [b.up, b.cycle]);
  const c = P('\u23f0 2026-09-04 23:59');
  ok(c && c.up === false && c.cycle === null, '\u2605矢印の無い古い行は今までどおり逆算(read-both)', c && [c.up, c.cycle]);
  const d = P('\u23f0 2026-09-04 23:59 \u21ba15m');
  ok(d && d.up === false && Array.isArray(d.cycle) && d.cycle[0] === '15m', '\u2605繰返しの逆算は今までどおり', d && [d.up, d.cycle]);
  const e = P('\u23f0 2026-09-04 23:59 \u21bb50/10');
  ok(e && e.up === true && e.cycle.join('/') === '50/10', '\u2605繰返しのストップウォッチも今までどおり', e && [e.up, e.cycle]);
  const f = P('\u23f0 2026-09-04 23:59 \u21ba #健康');
  ok(f && f.cycle === null && f.tags.join() === '健康', '\u2605札とも並べられる', f && [f.cycle, f.tags]);
  ok(P('\u23f0 2026-09-04 23:59 \u21bb').when === '2026-09-04 23:59', '\u2605\u2605矢印を時刻の一部と読まない', P('\u23f0 2026-09-04 23:59 \u21bb').when);
}

// ★★★v4.1.107(俊克 9/4 am10:01「1回だけ、開いていた⏰膜で、膜が閉じてしまった」):
//   なぜ膜の塊だけ「終わりの行」へ打つのかを、形で確かめる。
//   元の形(カーソルが外)では ▲..バッジ が範囲＝ バッジ行はその中。
//   ずれた形(カーソルが中)では膜は▲で止まり＝ バッジ行は**どの範囲にも入らない**＝ 打っても何も起きない。
console.log('\u246e 膜の塊を畳む相手は終わりの行(膜に当てない)');
{
  const _sOut=X.meosFcFoldShape(d4,-1)[0], _sIn=X.meosFcFoldShape(d4,1)[0];
  ok(!_sOut.hasRange, '\u2605\u2605\u2605生きた\u23f0の膜= カーソルthat外でもバッジ行はどの範囲にも入らない(旧: \u2605カーソルが外= ▲..バッジが範囲(バッジ行は中に居る)', [_sOut.head,_sOut.end]);
  ok(!_sIn.hasRange, '\u2605\u2605\u2605ずれた形ではバッジ行はどの範囲にも入らない(打っても膜に当たらない)', _sIn.hasRange);
  ok(X.foldRangeEnd(d4,pr4,true)===3&&X.foldRangeEnd(d4,pr4)===3, '\u2605\u2605どちらの形でも畳みは\u25b2で止まる', [X.foldRangeEnd(d4,pr4,true),X.foldRangeEnd(d4,pr4)]);
  {
   const L3c=L3.slice(0,5);   /* 時計の無い膜= 今までどおり \u25b2..バッジ that範囲 */
   const d4c={uri:{toString:()=>'file:///k.md',fsPath:'/k.md',scheme:'file'},languageId:'markdown',lineCount:L3c.length,
    lineAt:n=>({text:L3c[n],range:new stub.Range(n,0,n,L3c[n].length)}),getText:()=>L3c.join('\n'),eol:1,fileName:'/k.md',isClosed:false,version:1};
   const _sc=X.meosFcFoldShape(d4c,-1)[0];
   ok(_sc.head===3&&_sc.end===4&&_sc.hasRange, '\u2605時計の無い膜= カーソルthat外なら \u25b2..バッジ that範囲(v4.1.105のまま)', [_sc.head,_sc.end]);
   ok(!X.meosFcFoldShape(d4c,1)[0].hasRange, '\u2605\u2605ずれた形ではバッジ行はどの範囲にも入らない(打っても膜に当たらない)', true);
  }
}

// ★★★v4.1.106(俊克 9/4 am09:45 バグ2「折り畳まれた膜の⏰UFCの行をクリックした時も、
//   本来それは膜の行をクリックした時のように、バッジFCを表示するべき」):
//   膜の持ち物は4つ(▼/▲/バッジ/⏰)。開く合図の範囲(openEnd)だけを伸ばし、畳む範囲(end)は伸ばさない。
console.log('\u246d 膜の持ち物は4つ(▼/▲/バッジ/⏰)');
const bU=X.meosDefBlocks(d4)[0];
ok(bU.end===4&&bU.openEnd===5, '\u2605開く合図は⏰行まで/畳む範囲はバッジ行まで(⏰を畳むな)', [bU.end,bU.openEnd]);
ok(X.meosFcWantsOpen(d4,bU,5)===true, '\u2605\u2605\u2605⏰(UFC)の行を押してもバッジFCは開いている', X.meosFcWantsOpen(d4,bU,5));
ok(X.meosFcWantsOpen(d4,bU,1)===true, '\u2605開始膜でも開く', X.meosFcWantsOpen(d4,bU,1));
ok(X.meosFcWantsOpen(d4,bU,3)===true, '\u2605閉じ膜でも開く', X.meosFcWantsOpen(d4,bU,3));
ok(X.meosFcWantsOpen(d4,bU,2)===false, '\u2605膜の中の本文では開かない(v4.0.332の約束)', X.meosFcWantsOpen(d4,bU,2));
ok(X.meosFcFoldShape(d4,5).some(it=>it.shift), '\u2605\u2605⏰の行に居る間も形はずれる(バッジ行は膜の直下に見える)', true);

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
ok(X.meosFcFoldShape(d5,-1).filter(it=>it.hasRange).every(it=>it.head>X.foldRangeEnd(d5,pr5)), '\u2605\u2605UFCでも交差しない(カーソルthat外= 渡す範囲は膜の外)', X.meosFcFoldShape(d5,-1).map(it=>[it.head,it.end,it.hasRange]));
ok(X.meosFcFoldShape(d5,1).filter(it=>it.hasRange).every(it=>it.head>X.foldRangeEnd(d5,pr5,true)), '\u2605\u2605UFCでも交差しない(カーソルが中= 離れている)', true);
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
const bD=X.meosDefBlocks(dDone), shD=X.meosFcFoldShape(dDone,1).filter(it=>it.hasRange);
ok(X.foldRangeEnd(dDone,prD)===5, '\u2605\u2605済んだ⏰(FC)はカーソルが外なら膜と一緒に畳まれる', X.foldRangeEnd(dDone,prD));
ok(Math.max(...bD.map(b=>b.end))<=X.foldRangeEnd(dDone,prD), '\u2605\u2605\u2605カーソルが外= 入れ子で収まる', true);
ok(shD.length===1&&shD[0].head===4&&shD[0].end===5, '\u2605\u2605カーソルが中= 塊の頭はバッジ行(頭は隠れない)', shD.map(it=>[it.head,it.end]));
ok(shD.every(it=>it.head>X.foldRangeEnd(dDone,prD,true)), '\u2605\u2605\u2605カーソルが中でも交差しない(離れている)', true);
const dLive=mkL('<!-- Mew!UFC \u23f0 2026-12-31 23:00 -->','file:///j.md');
const prL=X.collectPairs(dLive,{excludeIndex:false})[0];
ok(X.foldRangeEnd(dLive,prL)===3&&X.foldRangeEnd(dLive,prL,true)===3, '\u2605これから鳴る\u23f0(UFC)はどちらの形でも膜の畳みの外', [X.foldRangeEnd(dLive,prL),X.foldRangeEnd(dLive,prL,true)]);
ok(X.meosFcFoldShape(dLive,1).filter(it=>it.hasRange).length===0, '\u2605カーソルが中= バッジ行だけなら範囲を渡さない', X.meosFcFoldShape(dLive,1).length);

// v4.1.21(俊克「開始膜か閉じ膜をクリックしてもFC群が折り畳まれたまま。標準の折畳みボタンでしか戻らない」):
//   ★真因= 一括の道が畳んでも _meosFcOpenSet(開けている物の覚え)から外していなかった。
//   壊れ方から逆算した検査= **畳む道は、必ず覚えからも外す**。
console.log('\u246d 畳んだら、覚えからも外す(開き直せる)');
const SRC2=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
const _bulk=SRC2.slice(SRC2.indexOf('function meosAutoFoldSpecLines'), SRC2.indexOf('function meosAutoFoldSpecLines')+6000);
ok(/_meosFcOpenSet\.delete/.test(_bulk), '\u2605\u2605一括の道が覚えから外している', /_meosFcOpenSet\.delete/.test(_bulk));
const _one=SRC2.slice(SRC2.indexOf('function meosSyncFcFoldForCursor'), SRC2.indexOf('function meosSyncFcFoldForCursor')+9000);
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
ok(String(X.meosCycleSeriesNext(Date.parse('2026-09-02T09:00:00'),['50','10'],Date.parse('2026-09-02T09:55:00')).at)===String(Date.parse('2026-09-02T10:00:00')), '\u2605\u2605交互(50/10)は**並びの順のまま**起点から数える(回転を書かない)', new Date(X.meosCycleSeriesNext(Date.parse('2026-09-02T09:00:00'),['50','10'],Date.parse('2026-09-02T09:55:00')).at).toString());
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
const _arm=SRC3.slice(SRC3.indexOf('function meosArmClockFcFor'), SRC3.indexOf('function meosArmClockFcFor')+14000);
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
 ok(/meosClockFcSet\(d, key, null, _dropLine\)/.test(_drop), '  \u00d7 は本文の行を消す(走っている1本を名指し)', true);
 const _after=_drop.slice(_drop.indexOf('if (lk) {'));
 const _i1=_after.indexOf('meosEndPseudoTimer'), _i2=_after.indexOf('meosClockFcSet(d, key, null, _dropLine)');
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
 const _e=SRC9.slice(SRC9.indexOf('function clkEcho()'), SRC9.indexOf('function clkEcho()')+760);
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
 ok(M(730*86400*S)==='\u22482y 00:00.00', '\u2605\u26052\u5e74\u5f8c\u3082\u79d2\u307e\u3067\u51fa\u308b(v4.1.82: \u65e5\u306f\u4e38\u3081\u308b)', M(730*86400*S));
 ok(M(((365+12)*86400+3*3600+45*60+12)*S)==='\u22481y 03:45.12', '\u2605\u2605\u2605\u3069\u306e\u6bb5\u3067\u3082 HH:MM.SS that\u4ed8\u304f', M(((365+12)*86400+3*3600+45*60+12)*S));
 ok(/\.\d\d$/.test(M(730*86400*S)), '\u2605\u2605\u2605秒thatは「動いている」を言う桁so、どこでも落とさない', M(730*86400*S));
}

// v4.1.52(俊克 改良1「繰返し指定を試したけど、1分を設定しても、10分になってしまう」)
console.log('\u3257 掛け直しても \u21bb thatが消えない');
{
 const M=X.meosCycleMs, P=X.meosClockFcParse;
 ok(M('01')===60000&&M('1')===60000, '  \u21bb01 も \u21bb1 も 1分(パーサは元から正しい)', [M('01'),M('1')]);
 ok((P('<!-- Mew!UFC \u23f0 2026-08-31 19:00 \u21bb01 -->')||{}).cycle[0]==='01', '  行からも 01 と読める', true);
 const SRC10=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 const _i0=SRC10.indexOf('  let _cy0 = null, _up0 = false, _tg0 = null, _dl0 = false');
 const _set=SRC10.slice(_i0, _i0+2200);
 ok(/cycle: _cy0, up: _up0, dual: _dl0/.test(_set), '\u2605\u2605\u2605Set thatが書く時に繰返しと向きを渡している', true);
 ok(/meosClockFcScan\(scope\.doc\)/.test(_set), '  在れば本文から読んで持ち越す', true);
 ok(/if \(opts && opts\.hasCycle\)/.test(_set), '  箱に書いた時だけ触る(空なら今の指定that残る)', true);
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
 ok(/spec\.up \? '\\u21bb' : '\\u21ba'/.test(SRC14), '\u2605\u2605書く時は \u21ba、ストップウォッチだけ \u21bb', true);
 ok(/_nl>0&&_nl<=60000/.test(SRC14), '\u2605\u2605\u2605残り1分以内は、鳴っていなくてもStopを出す', true);
 ok(/_s1\.textContent=\(_undoLeft>0\)\?'Undo':'Stop'/.test(SRC14), '\u2605\u2605\u2605止めた直後の1分は Undo(押し間違いthat取り返せる)', true);
 ok(/if \(await meosClockUndoStop\(\)\)/.test(SRC14), '\u2605\u2605もう一度押せば戻る= Stop \u21c4 Undo that行き来する', true);
 ok(/until: best\.u \}/.test(SRC14), '  Undo \u306e\u7a93\u306f**\u5143\u306e\u6642\u523b\u307e\u3067**', true);
 ok(/if\(!\(ev&&ev\.altKey\)&&\(vmRing\|\|window\.__clkStopMode\)\)/.test(SRC14), '\u2605\u2605出している間は、押せば止まる(Opt を添えた時だけ一覧へ)', true);
 const _cs=SRC14.slice(SRC14.indexOf("message.type === 'clockStop'"), SRC14.indexOf("message.type === 'clockStop'")+1600);
 ok(/meosClockSetEnabled\(sc\.uri, sc\.key, false\)/.test(_cs), '\u2605\u2605\u2605Stop \u306f**\u4e00\u6642\u505c\u6b62**= \u23f8 \u3092\u66f8\u3044\u3066\u639b\u304b\u308a\u3092\u89e3\u304f\u3060\u3051', true);
 ok(/<= 90000/.test(_cs), '  遠い時計を巻き込まない(90秒以内だけ)', true);
}

// v4.1.60(俊克 2026.09.02「15分間隔のストップウォッチとは何か? それは逆算タイマーの逆バージョンだよ。
//   15分間、ストップウォッチ時間は進んでいく。そして15分後に、0に戻って測り直す」
//   ＋(確認1の答え)「逆算タイマーは、止めるまで続ける方がいいかな。実際、腕時計は、延々、
//   ストップウォッチが止まらないからね」)
console.log('\u325a \u21bb(\u30b9\u30c8\u30c3\u30d7\u30a6\u30a9\u30c3\u30c1)= \u9006\u7b97\u306e\u9006\u30d0\u30fc\u30b8\u30e7\u30f3');
{
 const P=X.meosClockFcParse, F=X.meosClockFaceMs;
 const a=P('<!-- Mew!UFC \u23f0 2026-09-02 09:00 \u21bb15 -->');
 const b=P('<!-- Mew!UFC \u23f0 2026-09-02 09:00 \u21ba15 -->');
 ok(!!a && a.up===true && String(a.cycle)==='15', '\u2605\u2605\u2605\u21bb15= 15\u5206\u306e\u30b9\u30c8\u30c3\u30d7\u30a6\u30a9\u30c3\u30c1(\u5897\u3048\u308b)', a && [a.up,a.cycle]);
 ok(!!b && b.up===false && String(b.cycle)==='15', '\u2605\u21ba15= 15\u5206\u306e\u9006\u7b97\u30bf\u30a4\u30de\u30fc(\u6e1b\u308b)', b && [b.up,b.cycle]);
 ok((P('<!-- Mew!UFC \u23f0 2026-09-02 09:00 -->')||{}).up===false, '  \u8f2a\u304c\u7121\u3051\u308c\u3070\u5411\u304d\u3082\u7121\u3044(\u4e00\u5ea6\u304d\u308a)', true);
 ok(String((P('<!-- Mew!UFC \u23f0 12:00 \u21bb50/10 -->')||{}).cycle)==='50,10', '  \u21bb\u3067\u3082\u4e26\u3073\u306f\u540c\u3058\u3088\u3046\u306b\u8aad\u3080', true);
 const now=Date.now(), step=15*60000;
 ok(F(now+step,{up:true,step})<=50, '\u2605\u2605\u2605\u9418\u306e\u76f4\u5f8c= 0(\u6e2c\u308a\u76f4\u3057\u306e\u5f62)', F(now+step,{up:true,step}));
 ok(Math.round(F(now+step-4*60000,{up:true,step})/60000)===4, '\u2605\u2605\u7d4c\u904e4\u5206= \u6b8b\u308a11\u5206\u306e\u88cf\u8fd4\u3057', F(now+step-4*60000,{up:true,step}));
 ok(Math.round(F(now+step-4*60000,{up:false,step})/60000)===11, '\u2605\u9006\u7b97\u306f\u4eca\u307e\u3067\u3069\u304a\u308a\u6b8b\u308a\u3092\u51fa\u3059', F(now+step-4*60000,{up:false,step}));
 ok(F(now+step,{up:true,step:0})>0, '  \u9593\u9694\u304c\u7121\u3044\u7269\u306f\u6b8b\u308a\u306e\u307e\u307e(\u5d29\u308c\u306a\u3044)', true);
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 /* \u2605v4.1.1109: 向きは周期と別(一度きりでも名乗る)。控えるという意図はそのまま。 */
 ok(/up: !!c\.up,/.test(S), '\u2605\u2605\u5411\u304d\u306f\u639b\u3051\u305f\u6642\u306b\u63a7\u3048\u308b(\u9762\u306e\u6bce\u79d2\u306b14\u4e07\u884c\u3092\u306a\u305e\u3089\u306a\u3044)', true);
 ok(!/up: !!\(c\.up && Array/.test(S), '\u2605\u2605\u2605\u5411\u304d\u3092\u5468\u671f\u306b\u7e1b\u3089\u306a\u3044(\u4e00\u5ea6\u304d\u308a\u306e\u30b9\u30c8\u30c3\u30d7\u30a6\u30a9\u30c3\u30c1\u304c\u6d88\u3048\u306a\u3044)', true);
 ok(/nextUp: \(\(\) => \{ const s = meosNextClockScope\(\)/.test(S), '\u2605\u9762\u306e\u6570\u5b57\u3068\u5411\u304d\u306f\u540c\u3058\u300c\u6b21\u306b\u9cf4\u308b\u7269\u300d\u304b\u3089\u5f15\u304f', true);
 ok(/var _fv=\(vmNextUp&&vmNextStep>0\)/.test(S), '\u2605\u9762\u3082\u540c\u3058\u5f0f\u3067\u88cf\u8fd4\u3059(node\u3068\u4e8c\u91cd\u306b\u6301\u305f\u306a\u3044)', true);
 ok(!/MEOS_STOPWATCH_MAX|MEOS_CYCLE_MAX/.test(S), '\u2605\u2605\u7d42\u7aef\u3092\u7f6e\u304b\u306a\u3044= \u6b62\u3081\u308b\u307e\u3067\u7d9a\u304f(\u8155\u6642\u8a08\u306e\u30b9\u30c8\u30c3\u30d7\u30a6\u30a9\u30c3\u30c1\u306f\u6b62\u307e\u3089\u306a\u3044)', true);
}

// v4.1.61(俊克 改良1「⏸の文字色を白に。ただし、その膜を離れた時は、⏸を赤文字にする」
//   改良2「Stop表示の時に、リストを表示できないので、Optを押すとStop表示を止めてリストを表示できる」
//   バグ1「Cmd+Sで保存した時、内容が変わらないのに、Me Dockの更新日が変化するのは駄目だね」)
console.log('\u325b \u23f8\u306e\u8272 / Opt \u3067\u4e00\u89a7 / \u5909\u308f\u3089\u306a\u3044\u4fdd\u5b58\u306f\u65e5\u4ed8\u3092\u52d5\u304b\u3055\u306a\u3044');
{
 const L=['# t','<!-- {* \u25bcmCN=P_1 // c *} -->','x','<!-- {* \u25b2mCN=P_1 // c *} -->',
          '<!-- Mew!UFC \u23f0\u23f8 2099-01-01 09:30 \u21ba05 -->'];
 const d={uri:{toString:()=>'file:///p.md',fsPath:'/p.md',scheme:'file'},languageId:'markdown',lineCount:L.length,
  lineAt:n=>({text:L[n],range:new stub.Range(n,0,n,L[n].length)}),getText:()=>L.join('\n'),eol:1,fileName:'/p.md',isClosed:false,version:1};
 /* v4.1.62: 分かれ目は「膜の中に居るか」でなく「その行が今橙に染まっているか」。 */
 const paint=(orange)=>{const got=[];
  const e={document:d,selection:{active:new stub.Position(2,0)},
   visibleRanges:[new stub.Range(0,0,L.length-1,0)],setDecorations:(t,r)=>{if(r&&r.length)got.push([t&&t.__opts&&t.__opts.textDecoration||'',r.length]);}};
  X.meosApplyTimerLineDecorations(e,orange); return got;};
 const inHere=paint(new Set([4])), outside=paint(new Set());
 /* v4.1.64: 見せかけの \ud83d\udd13 は色を持たない項目so、数える前に外す(見るのは \u23f8 の色だけ)。 */
 /* v4.1.66: 同じ行に輪の印の色(緑)と見せかけの\ud83d\udd13 も乗るso、\u23f8 の色だけを見る。 */
 const col=(g)=>g.filter(x=>/#ffffff|#ff4d4d/.test(x[0]||'')).map(x=>/#ffffff/.test(x[0])?'white':'red').join(',');
 ok(col(inHere)==='red'&&col(outside)==='red', '\u2605\u2605\u2605v4.1.67: \u23f8 \u306f**\u3044\u3064\u3082\u8d64**(\u540c\u3058\u610f\u5473\u306e\u7269that\u5834\u6240\u3067\u8272\u3092\u5909\u3048\u306a\u3044)', [col(inHere),col(outside)]);
 ok(col(outside)==='red', '\u2605\u2605\u2605\u6a59\u3067\u306a\u3051\u308c\u3070 \u23f8 \u306f\u8d64(\u819c\u304c\u901a\u5e38\u306e\u72b6\u614b)', col(outside));
 ok(col(inHere).split(',').length===1&&col(outside).split(',').length===1, '  \u5857\u308b\u306e\u306f1\u6587\u5b57\u3060\u3051(\u884c\u5168\u4f53\u306f\u6a59\u306e\u307e\u307e)', [inHere.length,outside.length]);
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/var _stopMode=\(!vmAlt\)&&/.test(S), '\u2605\u2605Opt \u3092\u62bc\u3057\u3066\u3044\u308b\u9593\u306f Stop \u3092\u9000\u3051\u308b', true);
 ok(/document\.addEventListener\('mousemove',function\(e\)\{vmSetAlt/.test(S), '\u2605\u9375\u76e4\u306e\u7126\u70b9\u304c\u7121\u3044\u6642\u3067\u3082\u5206\u304b\u308b(\u30de\u30a6\u30b9\u304c altKey \u3092\u9023\u308c\u3066\u6765\u308b)', true);
 ok(/window\.addEventListener\('blur',function\(\)\{vmSetAlt\(false\)/.test(S), '  \u9762\u3092\u96e2\u308c\u305f\u3089\u5fd8\u308c\u308b(\u62bc\u3057\u3063\u653e\u3057\u306b\u3057\u306a\u3044)', true);
 ok(/onWillSaveTextDocument\(\(e\) => \{/.test(S), '\u2605\u2605\u2605\u4fdd\u5b58\u306e**\u524d**\u306b\u3001\u6c5a\u308c\u3066\u3044\u306a\u3044\u304b\u3092\u898b\u308b', true);
 ok(/if \(d\.isDirty\) \{ __cleanSaveStat\.delete\(k\); return; \}/.test(S), '\u2605\u2605\u5224\u5b9a\u306f\u6c5a\u308c\u3066\u3044\u308b\u304b1\u3064(140k\u884c\u3092\u6bd4\u3079\u76f4\u3055\u306a\u3044)', true);
 ok(/utimesSync\(doc\.uri\.fsPath, _st\.atime, _st\.mtime\)/.test(S), '\u2605\u2605\u2605\u5909\u308f\u3089\u306a\u3044\u4fdd\u5b58\u306a\u3089\u3001\u66f4\u65b0\u65e5\u3092\u5143\u3078\u623b\u3059', true);
 ok(S.indexOf('utimesSync')<S.indexOf('postDockFileUD(_e, true); }, 60)'), '\u2605UD \u3092\u8aad\u3080\u524d\u306b\u623b\u3059(\u9806\u756a\u304c\u9006\u306a\u3089\u53e4\u3044\u65e5\u4ed8\u304c\u898b\u3048\u306a\u3044)', true);
}

// v4.1.62(俊克 v4.1.61テスト CN=v4.1.61_0226)
//   バグ1〜3「Stopを押すとUFCは値0になって中断する。なぜ0なのか?途中で止まった値のままでいい」
//   バグ4「リストの✓を押して止めた後で、リストから無くなってしまう。これは残しておくべきだよ」
//   バグ5〜7「⏸が橙になったり白になったり」「膜の内部では赤にすべき(膜が通常の状態だからね)」
console.log('\u325c Stop=\u4e00\u6642\u505c\u6b62 / \u4f11\u307f\u306f\u4e88\u5b9a\u306e\u6bb5 / \u23f8 \u306f\u53d6\u308a\u5408\u3044\u3092\u3057\u306a\u3044');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/return await meosClockSetEnabled\(r\.uri, r\.key, true\)/.test(S), '\u2605\u2605\u2605Undo \u306f \u2611 \u306b\u623b\u3059\u3060\u3051(\u904e\u304e\u3066\u3044\u308c\u3070\u6b21\u306e\u56de\u3078= \u518d\u8a08\u7b97)', true);
 ok(!/await meosEndPseudoTimer\(best\.k\)/.test(S), '\u2605\u2605Stop \u304b\u3089\u300c\u7d42\u308f\u3089\u305b\u308b\u9053\u300d\u304c\u6d88\u3048\u3066\u3044\u308b(\u8f2a\u3092\u56de\u3055\u306a\u3044)', true);
 ok(/const _paused = sc \? await meosClockSetEnabled/.test(S), '  \ud83d\udd12 \u306a\u3089\u4f11\u307e\u305b\u306a\u3044(\u4e00\u89a7\u306e \u2610 \u3068\u540c\u3058\u8fd4\u4e8b)', true);
 /* \u2605v4.1.1114: 抜く物は[始まり,終わり]の対(`3m`のような広い桁も抜ける)。 */
 ok(/const _cut = \[\];/.test(S)&&/_cut\.push\(\[a, a \+ 1\]\)/.test(S)&&/_cut\.push\(_sp\)/.test(S),
    '\u2605\u2605\u2605\u6a59\u306e\u7bc4\u56f2\u304b\u3089 \u2713/\u23f8/\u8f2a\u306e\u5370 \u3092\u629c\u304f(v4.1.19\u306e\u300c\u5916\u5074\u3092\u5272\u308b\u300d)', true);
 ok(/clocks: meosClockList\(12\)/.test(S), '  \u4e00\u89a7\u306e\u7a93\u3092\u5e83\u3052\u308b(CSS \u304c\u9ad8\u3055\u3092\u6b62\u3081\u3066\u5dfb\u304f)', true);
 // 休んでいる物は、鳴り終わった物より先に出る(押し出されない)
 X._meosClockHistory.length=0;
 X._meosClockHistory.push({uri:'file:///z.md',key:'OLD1',name:'OLD1',at:1,hold:false});
 X._meosClockHistory.push({uri:'file:///z.md',key:'OLD2',name:'OLD2',at:2,hold:false});
 X._meosClockHistory.push({uri:'file:///z.md',key:'REST',name:'REST',at:3,hold:false,off:true});
 const order=X.meosClockList(12).map(r=>r.key).join(',');
 ok(order.indexOf('REST')<order.indexOf('OLD1'), '\u2605\u2605\u2605\u4f11\u3093\u3067\u3044\u308b\u7269\u306f**\u4e88\u5b9a**so\u3001\u5c65\u6b74\u306b\u62bc\u3057\u51fa\u3055\u308c\u306a\u3044', order);
 ok((X.meosClockList(12).find(r=>r.key==='REST')||{}).off===true, '  \u4f11\u307f\u3067\u3042\u308b\u3053\u3068\u3082\u9762\u3078\u6e21\u308b', true);
}

// v4.1.63(俊克 バグ1「UFCに記録している年月日時分秒は開始点のまま固定という仕様に決めたはずだが、
//   最初の目標時刻を過ぎると…14:49に変わってしまう。これでは、いつから始めたかという記録が失われてしまう」)
console.log('\u325d \u672c\u6587\u306e\u6642\u523b\u306f**\u8d77\u70b9**= \u9418\u306f\u305d\u3053\u304b\u3089\u6570\u3048\u308b(\u66f8\u304d\u66ff\u3048\u306a\u3044)');
{
 const N=X.meosCycleSeriesNext, T=(h)=>Date.parse('2026-09-02T'+h);
 ok(N(T('14:47:00'),['02'],T('14:47:30')).at===T('14:49:00'), '\u2605\u2605\u260514:47\u306e\u8d77\u70b9\u306f\u52d5\u304b\u305a\u3001\u6b21\u306e\u9418\u3060\u3051\u304c14:49\u3078\u9032\u3080', new Date(N(T('14:47:00'),['02'],T('14:47:30')).at).toString());
 ok(N(T('14:47:00'),['02'],T('15:00:10')).at===T('15:01:00'), '\u2605\u2605\u4f55\u5468\u56de\u3063\u3066\u3082\u3001\u6570\u3048\u308b\u306e\u306f\u540c\u3058\u8d77\u70b9\u304b\u3089', new Date(N(T('14:47:00'),['02'],T('15:00:10')).at).toString());
 ok(N(T('15:00:00'),['05'],T('14:00:00')).at===T('15:00:00'), '\u2605\u8d77\u70b9\u304c\u307e\u3060\u5148\u306a\u3089\u3001\u305d\u308c\u304c\u6700\u521d\u306e\u9418', true);
 ok(N(T('14:47:00'),['02'],T('14:47:30')).step===120000, '  \u4eca\u306e\u56de\u306e\u9577\u3055\u3082\u6570\u3048\u305f\u6642\u306b\u5206\u304b\u308b(\u7d4c\u904e\u8868\u793a\u3068\u79d2\u8aad\u307f\u304c\u4f7f\u3046)', N(T('14:47:00'),['02'],T('14:47:30')).step);
 // 1年前に始めた5分ごとでも、輪を10万回は回さない(O(1))
 const t0=Date.now(), far=N(Date.now()-365*86400000,['05'],Date.now());
 ok(far && far.at>Date.now() && far.at-Date.now()<=300000, '\u2605\u2605\u26051\u5e74\u524d\u306e\u8d77\u70b9\u3067\u3082\u6b63\u3057\u304f\u3001\u305d\u3057\u3066\u901f\u3044', (Date.now()-t0)+'ms');
 ok(Date.now()-t0<50, '  \u6570\u3048\u308b\u306e\u306b\u6642\u9593\u3092\u639b\u3051\u306a\u3044(1\u5468\u3076\u3093\u305a\u3064\u98db\u3070\u3059)', (Date.now()-t0)+'ms');
 ok(N(0,[],Date.now())===null&&N(NaN,['05'],Date.now())===null, '  \u8aad\u3081\u306a\u3044\u7269\u306f null(\u672c\u6587\u3092\u6c5a\u3055\u306a\u3044)', true);
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 const _ep=S.slice(S.indexOf('async function meosEndPseudoTimer'), S.indexOf('async function meosEndPseudoTimer')+2600);
 ok(!/meosClockFcSet\(doc, scope\.key, \{ when: meosClockFcStamp/.test(_ep), '\u2605\u2605\u2605\u9cf4\u3063\u3066\u3082\u672c\u6587\u306e\u6642\u523b\u3092\u66f8\u304d\u66ff\u3048\u306a\u3044(\u8d77\u70b9\u304c\u6b8b\u308b)', true);
 ok(!/meosCycleRotate/.test(S), '\u2605\u4e26\u3073\u306e\u56de\u8ee2\u3082\u66f8\u304b\u306a\u3044= \u72b6\u614b\u3092\u6301\u3064\u7269\u304c1\u3064\u6e1b\u3063\u305f', true);
 ok(/if \(sc\.step > 0\) return sc\.step;/.test(S), '  \u79d2\u8aad\u307f\u306e\u9593\u9694\u3082\u63a7\u3048\u305f\u7269\u304b\u3089(\u6bce\u56de14\u4e07\u884c\u3092\u8aad\u307e\u306a\u3044)', true);
}

// v4.1.64(俊克 CN=v4.1.63_0422 改良1〜4= ⏰の▾設定パネル)
//   改良1 ☐↺countdown ⇄ ☑↻stopwatch(既定は逆算) / 改良2 設定するのは起点(未来でもいい)
//   改良3 🔐🔓はEncrypt Meと同じ姿・UFCの🔓は見せかけの表示 / 改良4 繰返しは入力箱(00が終端)
console.log('\u325e \u25be\u8a2d\u5b9a\u30d1\u30cd\u30eb= \u5411\u304d\u30fb\u8d77\u70b9\u30fb\u9320\u30fb\u7e70\u8fd4\u3057');
{
 const C=X.meosParseCycleInput;
 ok(String(C('10m 3h 00 90m 1d'))==='10m,3h', '\u2605\u2605\u260500 \u3067\u7d42\u308f\u308a= \u305d\u306e\u5148\u306f\u6b8b\u3057\u3066\u304a\u3051\u308b(\u4e0b\u66f8\u304d)', C('10m 3h 00 90m 1d'));
 ok(String(C('10m 3h 5m 90m 00'))==='10m,3h,5m,90m', '\u2605\u26054\u3064\u306e\u7e70\u8fd4\u3057', C('10m 3h 5m 90m 00'));
 ok(C('00 10m').length===0, '\u2605\u5148\u982d\u304c 00 \u306a\u3089\u7e70\u8fd4\u3057\u7121\u3057(\u6d88\u3059\u53e3\u3082\u540c\u3058\u7bb1)', C('00 10m'));
 ok(String(C('50/10'))==='50,10', '  \u65e7\u3044\u66f8\u304d\u65b9(50/10)\u3082\u305d\u306e\u307e\u307e\u8aad\u3080', C('50/10'));
 ok(String(C('15'))==='15'&&X.meosCycleMs('15')===900000, '  \u88f8\u306e\u6570\u5b57\u306f\u5206', C('15'));
 ok(C('abc x').length===0, '  \u8aad\u3081\u306a\u3044\u5b57\u306f\u9ed9\u3063\u3066\u843d\u3068\u3059(\u672c\u6587\u3092\u6c5a\u3055\u306a\u3044)', C('abc x'));
 const P=X.meosClockFcParse;
 ok((P('<!-- Mew!UFC \u23f0\ud83d\udd10 2099-01-01 09:00 -->')||{}).lock===true, '\u2605\u2605\u2605\ud83d\udd10(\u9375\u4ed8\u304d)\u3092\u9320\u3068\u3057\u3066\u8aad\u3080= Encrypt Me \u3068\u540c\u3058\u5b57', true);
 ok((P('<!-- Mew!UFC \u23f0\ud83d\udd12 2099-01-01 09:00 -->')||{}).lock===true, '\u2605\u65e7\u3044 \ud83d\udd12 \u3082\u8aad\u307f\u7d9a\u3051\u308b(\u65e2\u306b\u66f8\u304b\u308c\u305f\u7269\u3092\u58ca\u3055\u306a\u3044)', true);
 ok((P('<!-- Mew!UFC \u23f0\ud83d\udd13 2099-01-01 09:00 -->')||{}).lock===false, '  \u624b\u3067\u66f8\u3044\u305f \ud83d\udd13 \u306f\u300c\u639b\u3051\u3066\u3044\u306a\u3044\u300d(\u7121\u5370\u3068\u540c\u3058)', true);
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/\(spec\.lock \? '\\ud83d\\udd10' : ''\)/.test(S), '\u2605\u66f8\u304f\u306e\u306f\u639b\u304b\u3063\u3066\u3044\u308b\u6642\u3060\u3051(\ud83d\udd13 \u306f\u5b57\u306b\u3057\u306a\u3044)', true);
 ok(/if \(!c\.done && !c\.lock\) \{/.test(S)&&/contentText: '\\ud83d\\udd13', opacity/.test(S),
    '\u2605\u2605\u2605\u639b\u304b\u3063\u3066\u3044\u306a\u3044\u6642\u306e \ud83d\udd13 \u306f**\u63cf\u304f\u3060\u3051**(\u898b\u305b\u304b\u3051\u306e\u8868\u793a)', true);
 ok(/clkBox\(b,clkDir,clkDir\?'\\u21bb stopwatch':'\\u21ba countdown'\)/.test(S), '\u2605\u2605\u2610\u21ba \u21c4 \u2611\u21bb \u306e\u5207\u66ff', true);
 ok(/clkDir=false;clkRep=false;/.test(S), '\u2605\u65e2\u5b9a\u306f\u9006\u7b97\u30bf\u30a4\u30de\u30fc\u30fb\u7e70\u8fd4\u3057\u7121\u3057(\u958b\u304f\u5ea6\u306b\u623b\u308b)', true);
 ok(/if\(_id==='clk-lock'\|\|_id==='clk-unlock'\)\{clkLock=\(_id==='clk-lock'\)/.test(S), '\u2605\u660e\u308b\u3044\u65b9\u3092\u62bc\u3059= \ud83d\udd10\u3067\u639b\u304b\u308a\u3001\u80a9\u306e\ud83d\udd13\u3067\u5916\u308c\u308b', true);
 ok(!/data-m=/.test(S), '  \u5206\u306e\u30d7\u30ea\u30bb\u30c3\u30c8(10 25 50 90)\u306f\u7e70\u8fd4\u3057\u306e\u7bb1\u3078\u5165\u308c\u66ff\u308f\u3063\u305f', true);
 ok(/const _org = w \? w\.at : \(\(_opts\.cycle && _opts\.cycle\.length\)/.test(S),
    '\u2605\u2605\u2605\u7e70\u8fd4\u3057\u304c\u5728\u308b\u306a\u3089\u8d77\u70b9\u306f\u904e\u53bb\u3067\u3082\u3088\u3044(\u4e00\u5ea6\u304d\u308a\u306e\u4e88\u5b9a\u3060\u3051\u672a\u6765\u9650\u5b9a)', true);
}

// v4.1.65(俊克 CN=v4.1.64_0516)
//   改良1「リピート無しの設定がなかったね」＋「☐↺countdownの字が小さ過ぎるので1.3倍に」
//   改良2「↻と↺が見た目で気づき難いので色を変えよう(逆算↺=緑・ストップウォッチ↻=水色)」
//   改良2'「🔐を押した時に🔓の色が薄い」 質問1「ロックをかけた予定のロックの外し方が分らない」
console.log('\u325f Repeat\u306e\u2610 / \u5411\u304d\u306e\u8272 / \u9320\u306e\u660e\u6697 / \u9320\u306e\u5916\u3057\u65b9');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 /* ★★★v4.1.142(俊克 改良2「常に同時起動にして『□ Repeat ↺↻』の1つボタンに」): 向きの駒は外した。 */
 ok(/id="clk-rep"/.test(S)&&/clkBox\(b,clkRep,'Repeat \\u21ba\\u21bb'\)/.test(S),
    '\u2605\u2605\u2605\u2610 Repeat that**\u7e70\u8fd4\u3057\u7121\u3057**\u306e\u59ff(\u5916\u3059\u53e3\u304c\u9762\u306b\u51fa\u305f)', true);
 ok(/cycle: _rep \? meosParseCycleInput\(message\.cycle\) : \[\]/.test(S)&&/hasCycle: true/.test(S),
    '\u2605\u2605\u2610 \u306e\u307e\u307e Set \u3059\u308c\u3070**\u7e70\u8fd4\u3057\u304c\u5916\u308c\u308b**(\u7a7a\u6b04=\u89e6\u3089\u306a\u3044\u3001\u306f\u7121\u304f\u306a\u3063\u305f)', true);
 ok(/type: 'clockCurrent', cycle: _cyc, up: _up/.test(S)&&/postMessage\(\{type:'clockAskCurrent'\}\)/.test(S),
    '\u2605\u2605\u2605\u9762\u306f**\u4eca\u306e\u819c\u306e\u59ff\u3092\u898b\u305b\u3066\u304b\u3089**\u76f4\u3055\u305b\u308b(\u898b\u3048\u3066\u3044\u308b\u7269\u3092\u5909\u3048\u308b)', true);
 ok(/if \(message && message\.type === 'clockAskCurrent'\)/.test(S)&&!/clocks: meosClockList\(12\)[^]{0,400}clockAskCurrent/.test(S),
    '  \u8a0a\u304b\u308c\u305f\u6642\u3060\u3051\u8d70\u308b(\u30ab\u30fc\u30bd\u30eb\u6bce\u306b14\u4e07\u884c\u3092\u8aad\u307e\u306a\u3044)', true);
 ok(/\.clk-dir,\.clk-rep\{font-size:13px/.test(S), '\u2605\u5b57\u306f 10px \u2192 13px(1.3\u500d)', true);
 ok(/\.clk-dir\{color:#3fb950\}/.test(S)&&/\.clk-dir\.on\{color:#56d4dd\}/.test(S),
    '\u2605\u2605\u21ba\u9006\u7b97=\u7dd1 / \u21bb\u30b9\u30c8\u30c3\u30d7\u30a6\u30a9\u30c3\u30c1=\u6c34\u8272', true);
 ok(/\.clk-item \.ci-up\{color:#56d4dd/.test(S), '  \u4e00\u89a7\u306e \u21bb \u3082\u540c\u3058\u6c34\u8272(\u540c\u3058\u7269\u306f\u540c\u3058\u8272)', true);
 ok(/\.clk-lockunit\.on \.clk-lockbadge\{filter:none;background:#2f80b8/.test(S),
    '\u2605\u2605\u2605\u639b\u3051\u305f\u5f8c\u306e \ud83d\udd13 \u306f\u30d6\u30eb\u30fc\u3067\u70b9\u706f= \u65bd\u9320\u30aa\u30ec\u30f3\u30b8 \u21c4 \u89e3\u9320\u30d6\u30eb\u30fc(Encrypt Me \u3068\u540c\u3058)', true);
 ok(/\.clk-lockmain\{[^}]*background:#d2691e/.test(S), '  \u639b\u3051\u308b\u524d\u306e \ud83d\udd10 \u306f\u30aa\u30ec\u30f3\u30b8\u3067\u660e\u308b\u3044', true);
 ok(/if\(isLk\)\{if\(c&&ev\.altKey\)vscode\.postMessage\(\{type:'clockUnlock'/.test(S),
    '\u2605\u2605\u2605\u9320\u306e\u5916\u3057\u65b9\u306f**\u9320that\u898b\u3048\u3066\u3044\u308b\u5834\u6240**\u306b(\u4e00\u89a7\u306e\ud83d\udd10\u3092 \u2325 \u30af\u30ea\u30c3\u30af)', true);
 ok(/Option-click to take the lock off/.test(S), '\u2605tip that\u305d\u306e\u5834\u3067\u5916\u3057\u65b9\u3092\u8a00\u3046(\u63a2\u3055\u305b\u306a\u3044)', true);
 ok(/type === 'clockUnlock'/.test(S)&&/lock: false, cycle: hit\.cycle/.test(S),
    '  \u5916\u3059\u306e\u306f \ud83d\udd10 \u4e00\u6587\u5b57\u3060\u3051(\u6642\u523b\u3082\u8f2a\u3082\u4f11\u307f\u3082\u305d\u306e\u307e\u307e)', true);
}

// v4.1.66(俊克 CN=v4.1.65_0614)
//   問題1「貴方の説明の中に書いたものが、ロックされた予定として出てしまった」= v4.1.39の穴が再び
//   改良1「☐ countdown の時に角丸四角で囲われないのが分かりにくい」
//   改良2「チェックボックスの□が小さ過ぎるので約1.4倍に」
//   改良3「私が本当に色を付けたかったのは、UFC内の繰返し文字の↻と↺なんだよ」
console.log('\u3260 \u56f2\u3044\u306e\u4e2d\u306f\u6587\u5b57 / \u672c\u6587that\u8a00\u308f\u306a\u304f\u306a\u3063\u305f\u7269\u306f\u843d\u3068\u3059 / \u8f2a\u306e\u5370\u306e\u8272');
{
 const CLK='<!-- Mew!UFC \u23f0\ud83d\udd10 2099-01-01 09:00 \u21bb10m/1m -->';
 const mkDoc=(L,uri)=>({uri:{toString:()=>uri,fsPath:'/f.md',scheme:'file'},languageId:'markdown',lineCount:L.length,
  lineAt:n=>({text:L[n],range:new stub.Range(n,0,n,L[n].length)}),getText:()=>L.join('\n'),eol:1,fileName:'/f.md',isClosed:false,version:1});
 const M=['# t','<!-- {* \u25bcmCN=F_1 // c *} -->','x','<!-- {* \u25b2mCN=F_1 // c *} -->'];
 const bare=mkDoc(M.concat([CLK]),'file:///bare.md');
 const fenced=mkDoc(M.concat(['```',CLK,'```']),'file:///fenced.md');
 const nested=mkDoc(M.concat(['```','~~~',CLK,'```']),'file:///nested.md');
 ok(X.meosClockFcScan(bare).length===1, '  \u56f2\u3044\u304c\u7121\u3051\u308c\u3070\u666e\u901a\u306b\u62fe\u3046', X.meosClockFcScan(bare).length);
 ok(X.meosClockFcScan(fenced).length===0, '\u2605\u2605\u2605``` \u306e\u4e2d\u306e\u898b\u672c\u306f**\u4e88\u5b9a\u306b\u306a\u3089\u306a\u3044**', X.meosClockFcScan(fenced).length);
 ok(X.meosClockFcScan(nested).length===0, '\u2605\u2605\u2605``` \u306e\u4e2d\u306e ~~~ \u306f\u305f\u3060\u306e\u6587\u5b57= \u6570\u3048\u306a\u3044(\u5411\u304d\u304cが\u88cf\u8fd4\u3089\u306a\u3044)', X.meosClockFcScan(nested).length);
 // 一度掛かった物も、本文that言わなくなれば落ちる
 const lk='file:///fenced.md F_1';
 X._meosPseudoScopes.set(lk,{uri:'file:///fenced.md',key:'F_1',name:'F_1',fc:true,hold:false,lock:false,step:0});
 X._meosPseudoUntil.set(lk, Date.now()+3600e3);
 X.meosArmClockFcFor(fenced);
 ok(!X._meosPseudoUntil.has(lk)&&!X._meosPseudoScopes.has(lk),
    '\u2605\u2605\u2605\u8cab\u3063\u3066\u3044\u305f\u7269\u3082\u3001\u672c\u6587that\u8a00\u308f\u306a\u304f\u306a\u308c\u3070\u843d\u3061\u308b(\u30be\u30f3\u30d3\u306e\u6839\u3092\u65ad\u3064)', [...X._meosPseudoUntil.keys()]);
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/if \(_ch === fence\.ch && _len >= fence\.len\)/.test(S), '\u2605\u5370\u306e\u7a2e\u985e\u3068\u9577\u3055\u3067\u5bfe\u3092\u5408\u308f\u305b\u308b(CommonMark\u306e\u898f\u5247)', true);
 ok(/if \(!meosClockLineIsLive\(doc, i\)\) continue;/.test(S), '\u2605\u56f2\u3044\u306e\u4e2d\u306e\u884c\u306b\u306f\u5370\u3082\u51fa\u3055\u306a\u3044(\u63cf\u304f\u5074\u3082\u540c\u30581\u3064\u304b\u3089)', true);
 // 改良3: 輪の印の色
 ok(/MEOS_CLOCK_DIR_DOWN = '#3fb950', MEOS_CLOCK_DIR_UP = '#56d4dd'/.test(S),
    '\u2605\u2605\u2605UFC\u306e \u21ba \u306f\u7dd1\u30fb\u21bb \u306f\u6c34\u8272(\u8272\u3092\u4ed8\u3051\u305f\u304b\u3063\u305f\u306e\u306f\u3053\u3053)', true);
 /* ★v4.1.139: 色は「字そのもの」から決める(↻↺ の順でも正しい)。 */
 ok(/\(_c1 === '\\u21bb' \? dirUp : dirDown\)\.push/.test(S), '  \u5411\u304d\u3067\u5857\u308a\u5206\u3051\u308b(\u5b57\u305d\u306e\u3082\u306e\u3092\u898b\u308b)', true);
 // 改良1/2
 ok(/\.clk-dir,\.clk-rep\{[^}]*border:1px solid rgba\(224,128,58,\.55\)/.test(S),
    '\u2605\u62bc\u3057\u3066\u3044\u306a\u3044\u6642\u3082\u89d2\u4e38\u306e\u7bb1that\u898b\u3048\u308b(\u7bb1\u306f\u300c\u62bc\u305b\u308b\u300d\u3092\u8a00\u3046)', true);
 ok(/\.clk-ck\{font-size:18px/.test(S), '\u2605\u2610 \u306f 13px \u00d7 1.4 \u2248 18px', true);
 ok(/function clkBox\(b,on,label\)/.test(S), '  \u7bb1\u3068\u5b57\u3092\u5225\u306e\u5b50\u306b\u3059\u308b(\u5927\u304d\u3055\u3092\u5225\u3005\u306b\u6c7a\u3081\u3089\u308c\u308b)', true);
}

// v4.1.67(俊克 CN=v4.1.66_0649)
//   改良1「⏸は赤で統一した方が分かりやすい。統一感が無いね」
//   (なぜ?)「リストでは水色の↻、本体では緑色の↺になっているのはなぜだろう?」
//   改良2「Repeatは□の部分をクリックしても反応しない」 改良3「時分は現在時刻を既定に」
console.log('\u3261 \u23f8\u306f\u3044\u3064\u3082\u8d64 / \u4e00\u89a7\u306e\u5199\u3057\u3092\u65b0\u3057\u304f\u3059\u308b / \u2610\u3092\u62bc\u3057\u3066\u3082\u52b9\u304f');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/pausesOut\.push\(new vscode\.Range\(i, at, i, at \+ len\)\);/.test(S)&&!/orange\.has\(i\) \? pausesIn/.test(S),
    '\u2605\u2605\u2605\u23f8 \u306f\u5834\u6240\u3067\u8272\u3092\u5909\u3048\u306a\u3044(\u610f\u5473that\u540c\u3058\u306a\u3089\u8272\u3082\u540c\u3058)', true);
 /* \u2605v4.1.1110: 向きは周期と別(v4.1.1109/1110)。控えを毎回新しくする、という意図はそのまま。 */
 ok(/_s\.up = !!c\.up;/.test(S) && /_s\.tags = c\.tags/.test(S),
    '\u2605\u2605\u2605\u639b\u304b\u3063\u3066\u3044\u308b\u7269\u306e**\u898b\u305f\u76ee\u306e\u63a7\u3048**\u3092\u6bce\u56de\u65b0\u3057\u304f\u3059\u308b(\u4e00\u89a7\u3068\u884c\u304cが\u98df\u3044\u9055\u308f\u306a\u3044)', true);
 const _arm2=S.slice(S.indexOf('function meosArmClockFcFor'), S.indexOf('function meosArmClockFcFor')+14000);
 ok(!/_s\.step = meosCycleMs\(c\.cycle\[0\]\)[^]{0,200}_meosPseudoUntil\.set/.test(_arm2),
    '  \u63a7\u3048\u3092\u65b0\u3057\u304f\u3057\u3066\u3082**\u9cf4\u308b\u6642\u523b\u306f\u89e6\u3089\u306a\u3044**', true);
 ok(/setTimeout\(\(\) => \{[^]{0,600}meosArmClockFcFor\(e\.document\)/.test(S),
    '\u2605\u2605\u6253\u9375that\u843d\u3061\u7740\u3044\u305f\u3089 \u23f0 \u3082\u8aad\u307f\u76f4\u3059= \u56f2\u3044\u3078\u5165\u308c\u305f\u898b\u672c\u304c\u4fdd\u5b58\u3092\u5f85\u305f\u305a\u306b\u843d\u3061\u308b', true);
 ok(/var _hit=\(ev\.target&&ev\.target\.closest\)\?ev\.target\.closest\('#clk-lock,#clk-unlock,#clk-rep,#clk-dir,#clk-cyc,#clk-tagin,#clk-copy,#clk-set'\)/.test(S),
    '\u2605\u2605\u2605\u898b\u3048\u3066\u3044\u308b\u7bb1\u306e\u4e2d\u306f\u3069\u3053\u3067\u3082\u5f53\u305f\u308a(\u2610 \u3092\u62bc\u3057\u3066\u3082\u52b9\u304f)', true);
 ok(/var n2=new Date\(\);/.test(S)&&!/var n2=new Date\(Date\.now\(\)\+30\*60000\)/.test(S),
    '\u2605\u6642\u5206\u306e\u65e2\u5b9a\u306f**\u4eca**(30\u5206\u5f8c\u306f\u79c1\u306e\u63d0\u6848\u3067\u3057\u304b\u306a\u304b\u3063\u305f)', true);
}

// v4.1.68(俊克 CN=v4.1.67_0736 改良1「リストの✓を外そうとすると、ウィンドウ下端に警告が出るが、
//   直ぐに消えてしまう。赤色tipで、警告した方が良いよ」)
console.log('\u3262 \u65ad\u308a\u306f\u62bc\u3057\u305f\u5834\u6240\u306e\u96a3\u3067\u3001\u8d64\u304f\u3001\u5916\u3057\u65b9\u307e\u3067');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/id="clk-warn"/.test(S)&&/\.clk-warn\{[^}]*border:1px solid #d13438/.test(S),
    '\u2605\u2605\u2605\u65ad\u308a\u306f**\u4e00\u89a7\u306e\u96a3**\u306b\u8d64\u304f\u51fa\u308b(\u753b\u9762\u306e\u4e0b\u7aef\u306f\u6307\u304b\u3089\u9060\u3044)', true);
 ok(/Option-click the \\ud83d\\udd10 to take the lock off/.test(S),
    '\u2605\u2605\u65ad\u308b\u3060\u3051\u3067\u306a\u304f**\u5916\u3057\u65b9\u3082\u540c\u3058\u672d\u306b\u66f8\u304f**', true);
 ok(/postMessage\(\{ type: 'clockRefused', key: sc\.key, text: _msg \}\)/.test(S),
    '  \u65ad\u3063\u305f\u5074that\u3001\u3069\u306e\u884c\u304b\u3092\u540d\u6307\u3057\u3057\u3066\u77e5\u3089\u305b\u308b', true);
 ok(/\.clk-item\.refused\{box-shadow/.test(S), '  \u62bc\u3057\u305f\u884c\u306b\u8d64\u3044\u7e01(\u3069\u308c\u306e\u8a71\u304b\u304c\u5206\u304b\u308b)', true);
 ok(/clkWarnT=setTimeout\(function\(\)\{clkWarnT=null;clkWarnOff\(\);\},9000\)/.test(S),
    '  \u3059\u3050\u306b\u306f\u6d88\u3048\u306a\u3044(9\u79d2)\u30fb\u6b21\u3092\u62bc\u305b\u3070\u4e0b\u308a\u308b', true);
 ok(/closest\('#clk-warn'\)\)\{clkWarnOff\(\);return;\}/.test(S)&&/\.clk-warn\{[^}]*cursor:pointer/.test(S),
    '\u2605\u2605v4.1.68b: \u672d\u3092\u62bc\u305b\u3070\u305d\u306e\u5834\u3067\u4e0b\u308a\u308b(\u8aad\u307f\u7d42\u308f\u3063\u305f\u4eba\u304c\u305d\u3046\u8a00\u3048\u308b)', true);
 ok(/w\.title='Click to dismiss'/.test(S), '  \u62bc\u305b\u308b\u3053\u3068\u3092\u672d\u81ea\u8eab\u304c\u8a00\u3046', true);
 ok(/var c=_lst\[Number\(it\.getAttribute\('data-i'\)\)\];\n   clkWarnOff\(\);/.test(S),
    '  \u6b21\u306e\u884c\u3092\u62bc\u3057\u305f\u3089\u524d\u306e\u65ad\u308a\u306f\u4e0b\u308a\u308b', true);
}

// v4.1.70(俊克 CN=v4.1.69_0803「(残る課題)⏰リスト最下段にタグ用の入口を作ることだね」)
console.log('\u3263 \u672d(#tag)= \u672c\u6587\u306b\u4f4f\u307f\u3001\u4e00\u89a7\u306e\u6700\u4e0b\u6bb5\u3067\u7d5e\u308b');
{
 const P=X.meosClockFcParse, T=X.meosParseTagInput;
 const a=P('<!-- Mew!UFC \u23f0 2026-09-03 19:22 #\u76ee\u85ac \u21ba05 -->');
 ok(!!a && String(a.tags)==='\u76ee\u85ac' && a.when==='2026-09-03 19:22',
    '\u2605\u2605\u2605\u672d\u3092\u5207\u308a\u5206\u3051\u3066\u8aad\u3080(\u6642\u523b\u306b\u6df7\u3056\u3089\u306a\u3044)', a && [a.tags, a.when]);
 const b=P('<!-- Mew!UFC \u23f0 2026-09-03 19:22 #\u76ee\u85ac #\u671d \u21bb15 -->');
 ok(!!b && String(b.tags)==='\u76ee\u85ac,\u671d' && String(b.cycle)==='15' && b.up===true,
    '\u2605\u2605\u4f55\u679a\u3067\u3082\u8cbc\u308c\u308b\u30fb\u8f2a\u3068\u3082\u4e26\u3079\u3089\u308c\u308b', b && [b.tags, b.cycle, b.up]);
 ok(String((P('<!-- Mew!UFC \u23f0 2026-09-03 19:22 -->')||{}).tags)==='', '  \u7121\u3051\u308c\u3070\u7a7a', true);
 ok(String(T('#\u76ee\u85ac \u671d'))==='\u76ee\u85ac,\u671d'&&String(T('  '))==='',
    '\u2605# \u306f\u5728\u3063\u3066\u3082\u7121\u304f\u3066\u3082\u826f\u3044(\u4eba that\u6253\u3064\u7269so\u53b3\u3057\u304f\u3057\u306a\u3044)', T('#\u76ee\u85ac \u671d'));
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/async function meosSetMembraneTags\(doc, line, tags\)/.test(S)&&/function meosMembraneTags\(doc, line\)/.test(S),
    '\u2605\u2605\u2605\u672d\u306e\u4f4f\u6240\u306f**\u958b\u59cb\u819c\u306e // \u306e\u5f8c\u308d**(\u4eba that\u666e\u6bb5\u66f8\u3044\u3066\u3044\u308b\u6240)', true);
 ok(/id="clk-tags"/.test(S)&&/function clkRenderTags\(\)/.test(S),
    '\u2605\u2605\u2605\u672d\u306e\u6bb5\u306f**\u4e00\u89a7\u306e\u6700\u4e0b\u6bb5**(\u584a\u306e\u6b21\u306e\u884c)', true);
 ok(/if\(clkTagSel&&\(c\.tags\|\|\[\]\)\.indexOf\(clkTagSel\)<0\)continue;/.test(S),
    '\u2605\u9078\u3093\u3060\u672d\u306e\u7269\u3060\u3051\u51fa\u3059', true);
 ok(/clkTagSel=\(clkTagSel===_tv\)\?'':_tv;/.test(S),
    '\u2605\u540c\u3058\u672d\u3092\u3082\u3046\u4e00\u5ea6\u62bc\u305b\u3070 all \u3078\u623b\u308b(\u30e2\u30fc\u30c9\u3092\u899a\u3048\u306a\u3044)', true);
 ok(/if\(clkTagSel&&seen\.indexOf\(clkTagSel\)<0\)clkTagSel='';/.test(S),
    '  \u6d88\u3048\u305f\u672d\u3092\u9078\u3073\u7d9a\u3051\u306a\u3044(\u7a7a\u306e\u4e00\u89a7\u3092\u898b\u305b\u306a\u3044)', true);
 ok(/id="clk-tagin"/.test(S)&&/tags:tg\?tg\.value:''/.test(S),
    '  \u25be\u304b\u3089\u3082\u4ed8\u3051\u3089\u308c\u308b(\u958b\u3051\u3070\u4eca\u306e\u672d that\u5165\u3063\u3066\u3044\u308b)', true);
 ok(/\.clk-item \.ci-tag\{/.test(S), '  \u884c\u306b\u3082\u672d\u3092\u5c0f\u3055\u304f\u51fa\u3059', true);
}

// v4.1.71(俊克 バグ1「基本は、開始膜の // の後ろのコメント書き込み部分に #タグを入れればいいんだよね?
//   でも、⏰リストには何も出ないよ」)
console.log('\u3264 \u672d\u306f**\u819c\u306e\u6301\u3061\u7269**= \u958b\u59cb\u819c\u306e // \u306e\u5f8c\u308d\u306b\u4f4f\u3080');
{
 const L=['# t',
  '<!-- {\u25bcmCN=\u76ee\u85ac_1 // #\u75c5\u6c17 * } -->',
  'x',
  '<!-- {\u25b2mCN=\u76ee\u85ac_1 // c *} -->',
  '<!-- Mew!UFC \u23f0 2099-01-01 09:00 \u21ba05 -->'];
 const d={uri:{toString:()=>'file:///tg.md',fsPath:'/tg.md',scheme:'file'},languageId:'markdown',lineCount:L.length,
  lineAt:n=>({text:L[n],range:new stub.Range(n,0,n,L[n].length)}),getText:()=>L.join('\n'),eol:1,fileName:'/tg.md',isClosed:false,version:1};
 ok(String(X.meosMembraneTags(d,1))==='\u75c5\u6c17', '\u2605\u2605\u2605\u958b\u59cb\u819c\u306e // \u306e\u5f8c\u308d\u304b\u3089\u672d\u3092\u8aad\u3080', X.meosMembraneTags(d,1));
 const got=X.meosClockFcScan(d);
 ok(got.length===1&&String(got[0].tags)==='\u75c5\u6c17', '\u2605\u2605\u2605\u23f0\u306e\u884c\u306b\u66f8\u304b\u306a\u304f\u3066\u3082\u3001\u819c\u306e\u672d that\u4e00\u89a7\u3078\u5c4a\u304f', got[0]&&got[0].tags);
 ok(String(X.meosMembraneTags(d,3))==='', '  \u9589\u3058\u819c\u306e\u5074\u306f\u898b\u306a\u3044(\u6301\u3061\u4e3b\u306f\u958b\u59cb\u819c)', X.meosMembraneTags(d,3));
 const L2=['<!-- {\u25bcmCN=a_1 // comment1 #\u671d #\u76ee\u85ac * } -->'];
 const d2={uri:{toString:()=>'file:///t2.md',fsPath:'/t2.md',scheme:'file'},lineCount:1,
  lineAt:n=>({text:L2[n],range:new stub.Range(n,0,n,L2[n].length)}),getText:()=>L2[0],version:1};
 ok(String(X.meosMembraneTags(d2,0))==='\u671d,\u76ee\u85ac', '\u2605\u4f55\u679a\u3067\u3082\u30fb\u666e\u901a\u306e\u30b3\u30e1\u30f3\u30c8\u3068\u4e26\u3079\u3089\u308c\u308b', X.meosMembraneTags(d2,0));
 const S2=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(!/spec\.tags\.map\(x => '#' \+ x\)/.test(S2), '\u2605\u2605\u66f8\u304f\u5148\u306f1\u3064\u3060\u3051= \u23f0\u884c\u306b\u306f\u3082\u3046\u66f8\u304b\u306a\u3044(2\u3064\u6301\u3066\u3070\u98df\u3044\u9055\u3046)', true);
 ok(/mid = mid\.replace\(\/\(\^\|\\s\)#\[\^\\s#<>\*\}\]\+\/g, ''\)/.test(S2),
    '\u2605\u89e6\u308b\u306e\u306f\u30b3\u30e1\u30f3\u30c8\u306e\u4e2d\u3060\u3051(\u819c\u306e\u540d\u524d\u3082\u9589\u3058\u306e\u5370\u3082\u52d5\u304b\u3055\u306a\u3044)', true);
}

// v4.1.72(俊克 CN=v4.1.71_0910)
//   改良1「任意のタグを入力できるように。既定のタグとして #tag0 ボタンを置いて、押すと現在カーソルが
//         入っている膜にそのタグが入るようにする。これで初心者でもこのタグでまとめられる」
//   改良2「5個までが直近のスケジュール。6番目の入口を叩くと別リストが出て、そこにタグでリストを作る。
//         つまり、普段は見せない」
console.log('\u3265 \u666e\u6bb5\u306f\u76f4\u8fd15\u3064 / 6\u756a\u76ee\u306e\u5165\u53e3\u306e\u5411\u3053\u3046\u306b\u672d\u306e\u90e8\u5c4b');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/else if\(_shown>=5\)break;/.test(S),
    '\u2605\u2605\u2605\u666e\u6bb5\u306e\u4e00\u89a7\u306f**\u76f4\u8fd15\u3064**(\u77ed\u304f\u306a\u3051\u308c\u3070\u6bce\u65e5\u306f\u8aad\u307e\u308c\u306a\u3044)', true);
 ok(/if\(!clkTagMode\)\{clkTagSel='';return;\}/.test(S),
    '\u2605\u2605\u672d\u306e\u6bb5\u306f**\u666e\u6bb5\u898b\u305b\u306a\u3044**', true);
 ok(/dr\.className='clk-door';dr\.id='clk-door'/.test(S)&&/clkTagMode=true;clkTagSel='';/.test(S),
    '\u2605\u2605\u2605\u5165\u53e3\u306f**6\u756a\u76ee\u306e\u884c**= 5\u3064\u306e\u7d9a\u304d\u306b\u7acb\u3064', true);
 ok(/back\.id='clk-tagback'/.test(S)&&/closest\('#clk-tagback'\)\)\{clkTagMode=false/.test(S),
    '  \u623b\u308b\u53e3\u3082\u540c\u3058\u6bb5\u306b(\u5165\u3063\u305f\u9053\u3092\u623b\u308b)', true);
 ok(/if\(mode==='hist'\)\{clkTagMode=false;clkTagSel='';/.test(S),
    '  \u23f0 \u3092\u62bc\u3057\u305f\u6642\u306f\u5fc5\u305a\u76f4\u8fd15\u3064\u306e\u9854(\u30e2\u30fc\u30c9\u3092\u899a\u3048\u306a\u3044)', true);
 ok(/id="clk-tag0"/.test(S)&&/postMessage\(\{type:'clockTagAdd',tag:'tag0'\}\)/.test(S),
    '\u2605\u2605#tag0 \u306e\u4e00\u62bc\u3057\u3067\u3001\u30ab\u30fc\u30bd\u30eb\u306e\u819c\u306b\u672d that\u4ed8\u304f', true);
 ok(/id="clk-tagnew"/.test(S)&&/closest\('#clk-tagadd'\)\)\{/.test(S), '\u2605\u4efb\u610f\u306e\u672d\u3082\u6253\u3066\u308b(v4.1.80\u3067 \uff0b \u30dc\u30bf\u30f3\u3078)', true);
 ok(/const _i = _next\.indexOf\(_t\); if \(_i >= 0\) \{ _next\.splice\(_i, 1\)/.test(S),
    '\u2605\u2605\u540c\u3058\u30dc\u30bf\u30f3that\u4ed8\u3051\u308b\u3068\u5916\u3059\u306e\u4e21\u65b9\u3092\u3059\u308b(\u9593\u9055\u3048\u3066\u3082\u540c\u3058\u624b\u3067\u623b\u305b\u308b)', true);
 ok(/put the cursor inside a membrane first/.test(S),
    '  \u819c\u306e\u5916\u306a\u3089\u3001\u4f55\u3082\u305b\u305a\u306b\u305d\u3046\u8a00\u3046(\u672d\u306f\u819c\u306e\u6301\u3061\u7269)', true);
 ok(/if \(_ok\) \{[^]{0,120}meosArmClockFcFor\(_sc\.doc\)/.test(S),
    '  \u4ed8\u3051\u305f\u3089\u305d\u306e\u5834\u3067\u4e00\u89a7that\u65b0\u3057\u304f\u306a\u308b', true);
}

// v4.1.73(俊克 2026.09.03 am00:26「タグ検索する。その中には、⏰設定しているものと、してないものがある。
//   どっちにしろ、そこからワープできる。つまり、タグ検索&ワープ機能だよ。…決して、タイマーが主ではない。
//   ただし、見た目は、タイマーの方が分りやすい。だから、⏰という仮面を被った Tag&Go なんだよ」)
console.log('\u3266 Tag&Go= \u63a2\u3059\u306e\u306f\u819c\u30fb\u76ee\u7684\u306f\u30ef\u30fc\u30d7\u304b\u8d77\u52d5');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/message\.type === 'clockTagList'/.test(S)&&/collectPairs\(_d, \{ excludeIndex: false \}\)/.test(S),
    '\u2605\u2605\u2605\u63a2\u3059\u76f8\u624b\u306f**\u819c**\u3067\u3042\u3063\u3066\u6642\u8a08\u3067\u306f\u306a\u3044(\u23f0\u306e\u7121\u3044\u819c\u3082\u51fa\u3059)', true);
 ok(/has: !!_c/.test(S)&&/tags: _tg/.test(S), '  \u23f0 that\u5728\u308b\u304b\u3069\u3046\u304b\u3082\u4e00\u7dd2\u306b\u6e21\u3059', true);
 ok(/var _src=clkTagMode\?vmTagItems:vmClocks/.test(S),
    '\u2605\u2605\u90e8\u5c4b\u306e\u4e2d\u3068\u666e\u6bb5\u306f**\u5225\u306e\u6e90**\u304b\u3089\u63cf\u304f', true);
 ok(/else if\(_shown>=5\)break;/.test(S)&&!/pin/i.test(S.slice(S.indexOf('function clkRenderList'), S.indexOf('function clkRenderList')+2000)),
    '\u2605\u2605\u2605\u4e00\u89a7\u306f**\u624b\u3067\u8db3\u3059\u9053\u3092\u4f5c\u3089\u306a\u3044**= \u898f\u5247\u306f\u300c\u6642\u523b\u306e\u8fd1\u3044\u9806\u300d1\u3064\u306e\u307e\u307e', true);
 ok(/ck\.textContent=\(clkTagMode&&!c\.has\)\?'\\u00b7'/.test(S),
    '\u2605\u23f0\u306e\u7121\u3044\u819c\u306b\u306f\u8d77\u3053\u3059\u5370\u3092\u7f6e\u304b\u306a\u3044', true);
 ok(/No clock is written on this membrane yet/.test(S),
    '\u2605\u62bc\u3055\u308c\u305f\u3089\u3001\u4f55\u3092\u3059\u308c\u3070\u3088\u3044\u304b\u3092\u305d\u306e\u5834\u3067\u8a00\u3046(\u30ef\u30fc\u30d7\u3057\u3066\u25be\u3067\u639b\u3051\u308b)', true);
 ok(/clockGoto/.test(S), '\u2605\u2605\u884c\u3092\u62bc\u305b\u3070\u30ef\u30fc\u30d7(\u23f0\u306e\u6709\u7121\u306b\u62d8\u3089\u306a\u3044)', true);
 ok(/if\(clkTagMode\)\{\/\* \u63a2\u3057\u7269\u306e\u6bb5\u3067\u306f \u00d7 \u3092\u51fa\u3055\u306a\u3044/.test(S),
    '  \u63a2\u3059\u6240\u3067\u306f\u7247\u4ed8\u3051\u306a\u3044(\u00d7 \u3092\u51fa\u3055\u306a\u3044)', true);
 ok(/postMessage\(\{type:'clockTagList'\}\)/.test(S)&&/\u53e9\u304b\u308c\u305f\u6642\u3060\u3051\u63a2\u3057\u306b\u884c\u304f/.test(S),
    '  \u53e9\u304b\u308c\u305f\u6642\u3060\u3051\u5168\u3066\u306e\u819c\u3092\u8aad\u3080', true);
 ok(/Tag & Go/.test(S), '  \u5165\u53e3\u306e\u540d\u524d\u3082\u305d\u3046\u8a00\u3046', true);
}

// v4.1.74(俊克 CN=v4.1.73_0045 バグ1「1番目の膜名がまったく間違っている」
//   「1番目のリストをクリックすると…飛んでしまうんだよ。なぜ?」)
console.log('\u3267 \u63cf\u3044\u305f\u6e90\u3068\u3001\u62bc\u3057\u305f\u6642\u306b\u5f15\u304f\u6e90\u306f\u540c\u30581\u3064');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/var _lst=clkTagMode\?vmTagItems:vmClocks;var c=_lst\[Number\(it\.getAttribute\('data-i'\)\)\]/.test(S),
    '\u2605\u2605\u2605\u62bc\u3057\u305f\u884c\u306f**\u63cf\u3044\u305f\u540c\u3058\u4e26\u3073**\u304b\u3089\u5f15\u304f(Tag&Go \u3067\u3082)', true);
 ok(!/var c=vmClocks\[Number\(it\.getAttribute/.test(S),
    '\u2605\u53e4\u3044\u5f15\u304d\u65b9(\u5e38\u306b vmClocks)\u306f\u6b8b\u3063\u3066\u3044\u306a\u3044', true);
 ok(/if\(clkTagSel&&_tg\[_k\]===clkTagSel\)continue;/.test(S),
    '\u2605\u9078\u3093\u3067\u3044\u308b\u672d\u306f\u884c\u306b\u51fa\u3055\u306a\u3044(\u540c\u3058\u4e8b\u30922\u5ea6\u8a00\u308f\u306a\u3044\u30fb\u540d\u524d\u306b\u5e45that\u623b\u308b)', true);
 ok(/\.clk-item \.ci-tag\{flex:0 1 auto/.test(S),
    '\u2605\u672d\u306f\u540d\u524d\u3088\u308a\u5148\u306b\u7e2e\u3080(\u8aad\u307f\u305f\u3044\u306e\u306f\u819c\u306e\u540d\u524d)', true);
}

// v4.1.76(俊克 CN=v4.1.75_0125)
//   バグ1「タグリストの□をクリックしてもチェックが付かない。しかし、動いている」
//   バグ2「メインリストでの膜名の表示がまだおかしい。タグリストでは正しいのに、なぜ?」
console.log('\u3268 \u90e8\u5c4b\u306e\u6e90\u3082\u9001\u308a\u76f4\u3059 / \u540d\u524d\u306e\u5e8a\u306f\u4e21\u65b9\u306b\u6577\u304f');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/function meosPostTagList\(\)/.test(S),
    '\u2605\u2605\u90e8\u5c4b\u306e\u5206\u3092\u9001\u308b\u53e3\u3092**1\u3064\u306e\u95a2\u6570**\u306b(\u9001\u308a\u5fd8\u308c\u3092\u4f5c\u3089\u306a\u3044)', true);
 ok(/clockEnable'\) \{ await meosClockSetEnabled\(message\.uri, message\.key, !!message\.on\); meosPostTagList\(\);/.test(S),
    '\u2605\u2605\u2605\u2611\u2610 \u306e\u5f8c\u3067**\u90e8\u5c4b\u3082\u65b0\u3057\u304f\u306a\u308b**(\u52d5\u3044\u3066\u3044\u308b\u306e\u306b\u5370that\u5909\u308f\u3089\u306a\u3044\u3001\u304c\u7121\u304f\u306a\u308b)', true);
 ok(/meosPostViewMode\(\); meosPostTagList\(\); try \{ updateMeDockMode/.test(S),
    '  \u9320\u5916\u3057\u30fb\u672d\u306e\u4ed8\u3051\u5916\u3057\u306e\u5f8c\u3082\u540c\u3058', true);
 ok(/\.clk-item \.ci-nh\{flex:0 9999 auto;min-width:4\.4em/.test(S)&&/\.clk-item \.ci-nt\{flex:0 1 auto;min-width:4\.6em/.test(S),
    '\u2605\u2605\u2605\u540d\u524d\u306e\u5e8a\u306f**\u4e00\u89a7\u306b\u3082**\u6577\u304f(\u540c\u3058\u540d\u524d\u3092\u51fa\u3059\u6240\u3067\u8aad\u307f\u65b9that\u5909\u308f\u3089\u306a\u3044)', true);
 ok(/\.clk-item \.ci-n\{flex:1;min-width:0;[^}]*overflow:hidden/.test(S),
    '  \u306f\u307f\u51fa\u3057\u306f\u540d\u524d\u306e\u7bb1\u306e\u4e2d\u3067\u5207\u308c\u308b(\u00d7 \u306f\u62bc\u3057\u51fa\u3055\u308c\u306a\u3044)', true);
}

// v4.1.77(俊克 2026.08.29「曜日は大事。スケジュールにとってね」= ⏰の残り仕事③)
console.log('\u3269 \u66dc\u65e5\u306f**\u5e74\u6708\u65e5\u304b\u3089\u51fa\u308b**so\u3001\u66f8\u304b\u306a\u3044\u30fb\u51fa\u3059\u3060\u3051');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/function clkW\(d\)\{return \['S','M','T','W','t','F','s'\]\[d\.getDay\(\)\];\}/.test(S),
    '\u2605\u5b57\u306f S-M-T-W-t-F-s(\u5bb6\u306b\u65e2\u306b\u5728\u308b\u7db4\u308a)', true);
 ok(/p\(d\.getDate\(\)\)\+'\('\+clkW\(d\)\+'\) '\+hm/.test(S),
    '\u2605\u2605\u2605\u4e00\u89a7\u306e\u5e74\u6708\u65e5\u306b\u66dc\u65e5(\u4e88\u5b9a\u8868\u306a\u306e\u3060\u304b\u3089)', true);
 ok(/_ds=_ds\+'\('\+clkW\(new Date/.test(S), '\u2605\u8d77\u70b9\u3092\u6c7a\u3081\u308b\u9762\u306b\u3082\u66dc\u65e5(\u6c7a\u3081\u308b\u524d\u306b\u898b\u3048\u308b)', true);
 ok(/contentText: '\(' \+ MNT_WEEKDAY_CHARS\[_dd\.getDay\(\)\] \+ '\)'/.test(S),
    '\u2605\u2605\u2605\u23f0\u884c\u306e\u65e5\u4ed8\u306e\u53f3\u306b**\u63cf\u304f**(\u672c\u6587\u306b\u306f1\u6587\u5b57\u3082\u5897\u3084\u3055\u306a\u3044)', true);
 ok(/txt\.charAt\(_dm\.index \+ _dm\[0\]\.length\) !== '\('/.test(S),
    '  \u624b\u3067\u66f8\u3044\u3066\u3042\u308b\u306a\u3089\u91cd\u306d\u306a\u3044', true);
 // 手で書いた曜日を読める(見ないで捨てる)
 const P=X.meosParseStampLoose, W=X.meosParseWhen;
 ok(!!P('2099-01-03(s) 09:00')&&P('2099-01-03(s) 09:00').getDate()===3,
    '\u2605\u2605\u624b\u3067 (t) \u3068\u66f8\u3044\u3066\u3082\u8aad\u3080', true);
 ok(!!W('2099-01-03(s) 09:00'), '  \u639b\u3051\u308b\u53e3\u3082\u540c\u3058', true);
 ok(!!P('2099-01-03 09:00'), '  \u4eca\u307e\u3067\u306e\u5f62\u3082\u305d\u306e\u307e\u307e', true);
 ok(!/meosClockFcStamp[^]{0,300}WEEKDAY/.test(S),
    '\u2605\u2605\u2605**\u66f8\u304f\u5074\u306b\u306f\u5165\u308c\u306a\u3044**= 2\u3064\u6301\u3066\u3070\u3044\u3064\u304b\u98df\u3044\u9055\u3046', true);
}

// v4.1.78(俊克 2026.09.03 am10:50「⏰リストが予定時刻で汚れ、名前がタイムスタンプが2重になって汚れている。
//   (1)⏰リストの基本は膜名。tipは予定日時、あるいは繰返し指定。
//   (2)タイマーが動作している時、残りタイマー、あるいはストップウォッチの値を表示する」)
console.log('\u326a \u4e00\u89a7\u306e\u57fa\u672c\u306f**\u819c\u540d** / \u52d5\u3044\u3066\u3044\u308b\u7269\u306f\u6570\u5b57that\u5148');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/else if\(clkTagMode&&!c\.has\)t\.textContent='';[^]{0,60}else t\.textContent='';/.test(S),
    '\u2605\u2605\u2605\u6b62\u307e\u3063\u3066\u3044\u308b\u7269\u306f**\u540d\u524d\u3060\u3051**(\u4e88\u5b9a\u306f tip \u3078)= \u540d\u524d\u306b\u5168\u5e45that\u6e21\u308b', true);
 ok(/if\(c\.running\)\{t\.classList\.add\('ci-live'\)/.test(S)&&/t\.textContent=clkLiveVal\(c\)/.test(S),
    '\u2605\u2605\u2605\u52d5\u3044\u3066\u3044\u308b\u7269\u306f**\u751f\u304d\u305f\u6570\u5b57**(\u23f0\u30dc\u30bf\u30f3\u306e\u5024\u3068\u5bfe\u5fdc that\u53d6\u308c\u308b)', true);
 ok(/function clkLiveVal\(c\)\{var left=Math\.max\(0,\(c\.at\|\|0\)-Date\.now\(\)\);/.test(S)&&/c\.up&&c\.step>0/.test(S),
    '\u2605\u21bb \u306f\u7d4c\u904e\u30fb\u21ba \u306f\u6b8b\u308a= \u9762\u3068\u540c\u3058\u5f0f(\u4e8c\u91cd\u306b\u6301\u305f\u306a\u3044)', true);
 ok(/function clkTickRows\(\)/.test(S)&&/clkPop\.classList\.contains\('on'\)\)clkTickRows\(\)/.test(S),
    '\u2605\u2605\u6bce\u79d2**\u4e2d\u8eab\u3060\u3051**\u66f8\u304d\u66ff\u3048\u308b(\u884c\u3092\u7d44\u307f\u76f4\u3055\u306a\u3044so\u3001\u62bc\u305d\u3046\u3068\u3057\u305f\u7269that\u9003\u3052\u306a\u3044)', true);
 ok(/row\.setAttribute\('data-full',_tip\);/.test(S)&&/if\(c\.cyc\)_tip\+=/.test(S),
    '\u2605\u2605tip \u306f\u305d\u306e\u884c\u306e**\u5168\u90e8**(\u5168\u540d\u30fb\u4e88\u5b9a\u65e5\u6642\u30fb\u7e70\u8fd4\u3057)', true);
 ok(/cyc: \(Array\.isArray\(c\.cycle\) && c\.cycle\.length\)/.test(S),
    '  \u7e70\u8fd4\u3057\u306e\u66f8\u304d\u65b9\u3082\u884c\u3078\u6e21\u308b(\u3069\u3093\u306a\u30bf\u30a4\u30de\u30fc\u304b that\u5206\u304b\u308b)', true);
 ok(/\.clk-item \.ci-t\.ci-live\{color:#e0803a\}/.test(S)&&/\.clk-item \.ci-t:empty\{display:none\}/.test(S),
    '  \u6570\u5b57\u306f\u23f0\u306e\u8272\u30fb\u7a7a\u306e\u679d\u306f\u5834\u6240\u3092\u53d6\u3089\u306a\u3044', true);
}

// v4.1.79(俊克 CN=v4.1.78_1109 改良1「メインリストで、2番目以降のtipが出ない。
//   タグリストも一番上の項目しか、tipが出ない。なぜ?」)
console.log('\u326b tip \u306e\u7e26\u306f**\u89e6\u3063\u3066\u3044\u308b\u884c**\u306b\u4ed8\u3044\u3066\u884c\u304f');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/const _ir=\(el&&el\.getBoundingClientRect\)\?el\.getBoundingClientRect\(\):pr;/.test(S)&&/let top=_ir\.top;/.test(S),
    '\u2605\u2605\u2605\u7e26\u306f**\u89e6\u3063\u3066\u3044\u308b\u7269**\u304b\u3089\u53d6\u308b(\u30dd\u30c3\u30d7\u30a2\u30c3\u30d7\u306e\u4e0a\u7aef\u3067\u306f\u306a\u304f)', true);
 ok(!/tocTooltip\.style\.right=\(window\.innerWidth-pr\.left\+1\)\+'px';let top=pr\.top;/.test(S),
    '\u2605\u53e4\u3044\u53d6\u308a\u65b9(\u3069\u306e\u884c\u3067\u3082\u540c\u3058\u5834\u6240)\u306f\u6b8b\u3063\u3066\u3044\u306a\u3044', true);
 ok(/tocTooltip\.style\.right=\(window\.innerWidth-pr\.left\+1\)\+'px'/.test(S),
    '  \u6a2a\u306f\u4eca\u307e\u3067\u3069\u304a\u308a\u30dd\u30c3\u30d7\u30a2\u30c3\u30d7\u306e\u5de6\u7aef\u306b\u63a5\u3059\u308b(\u30e1\u30cb\u30e5\u30fc\u3092\u96a0\u3055\u306a\u3044)', true);
}

// v4.1.80(俊克 CN=v4.1.79_1123)
//   改良1a「tipがなかなか出ない。⏰リストのタイマー値は、リストを表示した最初の数秒だけ動かす」
//   改良1b「任意のタグで検索できるようにする」
console.log('\u326c \u6570\u5b57\u306f\u6700\u521d\u306e\u6570\u79d2\u3060\u3051 / \u4efb\u610f\u306e\u672d\u3067\u7d5e\u308b');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/const CLK_LIVE_MS=5000;/.test(S)&&/function clkLiveStart\(\)\{clkLiveUntil=Date\.now\(\)\+CLK_LIVE_MS;\}/.test(S),
    '\u2605\u2605\u2605\u6570\u5b57that\u52d5\u304f\u306e\u306f**\u958b\u3044\u305f\u76f4\u5f8c\u306e\u6570\u79d2\u3060\u3051**(\u5f79\u76ee\u306f\u5bfe\u5fdc\u3092\u6559\u3048\u308b\u3053\u3068)', true);
 ok(/if\(!on&&e\.getAttribute\('data-next'\)!=='1'\)\{if\(e\.textContent\)e\.textContent='';continue;\}/.test(S),
    '\u2605\u2605\u2605\u6b62\u3081\u308b\u6642\u306f**\u51cd\u3089\u305b\u305a\u3001\u6d88\u3059**(\u9762\u306b\u51fa\u3066\u3044\u308b1\u3064\u3092\u9664\u3044\u3066)', true);
 ok(/clkLiveStart\(\);\s*\/\* v4\.1\.80/.test(S),
    '  \u63cf\u304d\u76f4\u3059\u5ea6\u306b\u6570\u79d2\u3060\u3051\u52d5\u304f(\u4e2d\u3067\u4f55\u304b\u3057\u305f\u76f4\u5f8c\u3082\u5206\u304b\u308b)', true);
 ok(/if\(clkTagFilter\)\{var _f=clkTagFilter\.toLowerCase\(\)/.test(S),
    '\u2605\u2605\u2605\u4efb\u610f\u306e\u672d\u3067\u7d5e\u308b(\u4e26\u3093\u3067\u3044\u306a\u3044\u672d\u3067\u3082\u72d9\u3048\u308b)', true);
 ok(/clkTagNew\.addEventListener\('input',function\(\)\{clkTagFilter=/.test(S),
    '  \u6253\u3064\u7aef\u304b\u3089\u7d5e\u308b(Enter \u3092\u5f85\u305f\u306a\u3044)', true);
 ok(/id="clk-tagadd"/.test(S)&&/closest\('#clk-tagadd'\)\)\{/.test(S),
    '  \uff0b \u3067\u3001\u6253\u3063\u305f\u672d\u3092\u819c\u306b\u4ed8\u3051\u308b(\u7d5e\u308b\u3068\u4ed8\u3051\u308b\u3092\u5225\u306e\u53e3\u306b)', true);
 ok(/\.clk-pop\.hist-only \.clk-tagadd \.clk-in\{display:block\}/.test(S),
    '\u2605\u2605\u2605**\u7bb1that\u898b\u3048\u3066\u3044\u306a\u304b\u3063\u305f**(hist-only that .clk-in \u3092\u5168\u90e8\u96a0\u3057\u3066\u3044\u305f\u30fbv4.1.72\u304b\u3089)', true);
}

// v4.1.81(俊克「現在⏰ボタンにタイム値をしている項目だけ、タグリスト上で、止めたタイマー表示を残す。
//   これが最終的に、知りたいことなんだよ。一目瞭然にね」)
console.log('\u326d \u9762\u306b\u51fa\u3066\u3044\u308b\u6570\u5b57\u306f**\u3069\u308c\u306e\u7269\u304b**\u3001\u305d\u308c\u3060\u3051that\u6b8b\u308b');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/if\(vmNextUntil&&c\.at===vmNextUntil\)\{t\.setAttribute\('data-next','1'\);t\.classList\.add\('ci-onface'\);\}/.test(S),
    '\u2605\u2605\u2605\u898b\u5206\u3051\u306f vmNextUntil= **\u9762\u306e\u6570\u5b57\u3092\u4f5c\u3063\u3066\u3044\u308b\u306e\u3068\u540c\u30581\u3064\u306e\u6e90**', true);
 ok(/if\(!on&&e\.getAttribute\('data-next'\)!=='1'\)/.test(S),
    '\u2605\u2605\u6570\u79d2\u3092\u904e\u304e\u3066\u3082\u3001\u9762\u306b\u51fa\u3066\u3044\u308b1\u3064\u3060\u3051\u306f\u52d5\u304d\u7d9a\u3051\u308b', true);
 ok(/\.clk-item \.ci-t\.ci-onface\{background:rgba\(224,128,58,\.20\)/.test(S),
    '\u2605\u8584\u3044\u6a59\u306e\u5ea7\u5e03\u56e3\u3067\u300c\u3053\u308cthat\u305d\u308c\u300d\u3068\u8a00\u3046(\u4e00\u76ee\u77ad\u7136)', true);
 ok(/\u52d5\u304f\u306e\u306f1\u3064\u3060\u3051so\u3001tip\u306e\u90aa\u9b54\u306b\u3082\u306a\u3089\u306a\u3044/.test(S),
    '  \u6bce\u79d2\u66f8\u304d\u66ff\u3048\u308b\u306e\u306f1\u3064\u3060\u3051(tip \u306e\u90aa\u9b54\u3092\u3057\u306a\u3044)', true);
}

// v4.1.82(俊克 CN=v4.1.81_0034)
//   バグ1「4年後なのに 3y 0d と出る」＋「≈4y 23:55.17 のように表示しよう。約4年ってことだよ」
console.log('\u326e \u9060\u3044\u4e88\u5b9a\u306f\u300c\u7d04N\u5e74\u300d\u3068\u79d2 / \u66f8\u304d\u66ff\u3048\u305f\u6642\u523b\u306b\u639b\u304b\u308a that\u4ed8\u3044\u3066\u884c\u304f');
{
 const M=X.meosMmSs, S=1000, D=86400;
 ok(M((1461*D-240)*S)==='\u22484y 23:56.00', '\u2605\u2605\u26054\u5e74\u5f8c= \u22484y(\u65e5\u6570\u306f\u843d\u3068\u3059)', M((1461*D-240)*S));
 ok(M((3.42*365*D)*S).indexOf('\u22483y')===0, '\u2605\u26053\u5e745\u30f6\u6708= \u22483y(\u56db\u6368\u4e94\u5165)', M((3.42*365*D)*S));
 ok(M((3.60*365*D)*S).indexOf('\u22484y')===0, '\u2605\u26053\u5e747\u30f6\u6708= \u22484y', M((3.60*365*D)*S));
 ok(M(200*D*S)==='200d 00:00.00', '\u26051\u5e74\u3092\u5207\u308c\u3070\u65e5\u6570\u306b\u623b\u308b(\u305d\u3053\u304b\u3089\u65e5 that\u610f\u5473\u3092\u6301\u3064)', M(200*D*S));
 const S2=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/const _sig = String\(c\.when\) \+ '\|' \+ \(Array\.isArray\(c\.cycle\)/.test(S2)&&/_sc0\.sig !== _sig/.test(S2),
    '\u2605\u2605\u2605\u672c\u6587\u306e\u5b57 that\u5909\u308f\u3063\u305f\u6642\u3060\u3051\u639b\u3051\u76f4\u3059(\u624b\u3067\u76f4\u3057\u305f\u6642\u523b\u306b\u4ed8\u3044\u3066\u884c\u304f)', true);
 ok(/\u898b\u5206\u3051\u306f\*\*\u66f8\u3044\u3066\u3042\u308b\u5b57\u305d\u306e\u3082\u306e\*\*/.test(S2),
    '  \u898b\u5206\u3051\u306f\u5b57\u305d\u306e\u3082\u306e(\u8a08\u7b97\u3057\u76f4\u3059\u3068 `23:00` that\u63fa\u308c\u3066\u6b62\u307e\u3089\u306a\u304f\u306a\u308b)', true);
 ok(/sig: String\(c\.when\)/.test(S2), '  \u639b\u3051\u305f\u6642\u306e\u5b57\u3092\u63a7\u3048\u3066\u304a\u304f', true);
 ok(/if\(e\.altKey&&el\.id==='clk-y'\)\{/.test(S2)&&/if\(_b1!==_b0\)clkFill\(el,_b1,_b1\+9,false\)/.test(S2),
    '\u2605\u2605\u2605Opt \u3067\u5e74\u4ee3\u3092\u307e\u305f\u3050(\u7a93\u306f**\u305d\u306e\u5e74\u4ee3\u306e10\u5e74**)', true);
 ok(/_altAcc\+=e\.deltaY;if\(Math\.abs\(_altAcc\)<CLK_ALT_STEP\)return;/.test(S2)&&/const CLK_ALT_STEP=45;/.test(S2),
    '\u2605\u2605\u3086\u3063\u304f\u308a= \u5408\u56f3\u3092\u8caf\u3081\u3066\u3001\u8caf\u307e\u3063\u305f\u5206\u3060\u30511\u5e74(macOS\u306e\u52a0\u901f\u306b\u6d41\u3055\u308c\u306a\u3044)', true);
}

// v4.1.83(俊克 CN=v4.1.82_0049)
//   改良1「Optの時の動きが速過ぎる。ゆっくりと。2030にしたあとは、Optを離すと2030年台の10年間の中を
//         ぐるぐる回転する」／改良2「回転ドラムの大きな橙色の部分をWクリックすると直接値を入力できる」
console.log('\u326f \u5e74\u306e\u7a93\u306f**\u5e74\u4ee3** / \u30c9\u30e9\u30e0\u3092W\u30af\u30ea\u30c3\u30af\u3067\u76f4\u63a5\u6253\u3064');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/var _yb=Math\.floor\(now\.getFullYear\(\)\/10\)\*10;/.test(S)&&/clkFill\(document\.getElementById\('clk-y'\),_yb,_yb\+9,false\)/.test(S),
    '\u2605\u2605\u2605\u5e74\u306e\u7a93\u306f**\u305d\u306e\u5e74\u4ee3\u306e10\u5e74**(\u96e2\u305b\u3070\u3053\u306e\u4e2d\u3092\u56de\u308b)', true);
 ok(/function clkTypeIn\(col\)/.test(S)&&/addEventListener\('dblclick'/.test(S),
    '\u2605\u2605\u2605W\u30af\u30ea\u30c3\u30af\u3067\u3001\u305d\u306e\u6bb5\u306b\u7bb1that\u51fa\u3066\u76f4\u63a5\u6253\u3066\u308b', true);
 ok(/'clk-y':\[1,9999\],'clk-mo':\[1,12\],'clk-d':\[1,31\],'clk-h':\[0,23\],'clk-mi':\[0,59\]/.test(S),
    '\u2605\u306f\u307f\u51fa\u3057\u305f\u5024\u306f\u7aef\u3067\u6b62\u3081\u308b(\u5618\u306e\u5024\u3092\u4f5c\u3089\u306a\u3044)', true);
 ok(/if\(id==='clk-y'\)\{var _b=Math\.floor\(v\/10\)\*10;clkFill\(col,_b,_b\+9,false\);/.test(S),
    '\u2605\u2605\u6253\u3063\u305f\u5f8c\u3082**\u305d\u306e\u5e74\u4ee3\u306e\u4e2d**\u3092\u56de\u308b(Opt \u3068\u540c\u3058\u7740\u5730)', true);
 ok(/\.clk-colin\{position:absolute;left:2px;right:2px;top:23px;height:22px/.test(S),
    '  \u7bb1\u306f\u771f\u3093\u4e2d\u306e\u6bb5\u306b\u3074\u305f\u308a\u91cd\u306a\u308b(\u4f4d\u7f6e\u306f\u8a08\u7b97\u3067\u306a\u304f\u5b9a\u7fa9)', true);
 ok(/\.clk-colin\{[^}]*color:#ffffff/.test(S)&&/\.clk-colin::selection\{background:rgba\(224,128,58,\.75\);color:#ffffff\}/.test(S),
    '\u2605v4.1.84: \u9078\u3070\u308c\u3066\u3044\u308b\u5b57\u306f**\u767d**(\u6a59\u306e\u4e0a\u306b\u6a59\u3067\u306f\u8aad\u3081\u306a\u3044)', true);
 ok(/if\(e\.key==='Escape'\)\{e\.preventDefault\(\);done\(false\);\}/.test(S),
    '  Enter \u3067\u6c7a\u3081\u3001Esc \u3067\u3084\u3081\u308b(\u5916\u3078\u51fa\u3066\u3082\u6c7a\u307e\u308b)', true);
}

// v4.1.86(俊克 CN=v4.1.85_0153 改良1「未来を設定したあと、再度開き直すと、さっきの未来値(特に年)が
//   そのままになっている。…連続して未来の設定をすることも確かにあるので、1分以上経ったら、
//   現在の時刻に戻す。これで、両立できる」)
console.log('\u3270 \u958b\u3051\u76f4\u305b\u3070\u4eca\u3078\u623b\u308b / \u305f\u3060\u30571\u5206\u4ee5\u5185\u306f\u7d9a\u304d');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/var _yb=Math\.floor\(t\.getFullYear\(\)\/10\)\*10;\nclkFill\(document\.getElementById\('clk-y'\),_yb,_yb\+9,false\);/.test(S),
    '\u2605\u2605\u2605\u4eca\u65e5\u3078\u623b\u3059\u6642\u306f**\u7a93\u3054\u3068\u4eca\u65e5\u306e\u5e74\u4ee3\u3078**(\u9078\u3076\u524d\u306b\u3001\u5c45\u5834\u6240\u3092\u4f5c\u308b)', true);
 ok(/var _keep=\(Date\.now\(\)-clkLastSet<60000\);/.test(S)&&/if\(!_keep\)\{/.test(S),
    '\u2605\u2605\u2605\u7d9a\u3051\u3066\u3044\u308b\u306e\u304b\u3001\u51fa\u76f4\u3057\u305f\u306e\u304b\u3092**\u9593\u3067\u898b\u5206\u3051\u308b**(1\u5206)', true);
 ok(/clkLastSet=Date\.now\(\);/.test(S), '  Set \u3057\u305f\u6642\u306b\u899a\u3048\u308b(\u958b\u3044\u305f\u3060\u3051\u3067\u306f\u899a\u3048\u306a\u3044)', true);
 ok(/if\(!_keep\)\{var n2=new Date\(\);/.test(S), '  \u6642\u5206\u3082\u540c\u3058\u898f\u5247\u3067\u623b\u308b', true);
}

// v4.1.87(俊克 CN=v4.1.86_0220)
//   バグ1「Tagの書き込み位置を間違えているため、膜が壊れたと見なされる。しかもFCが追加されない」
//   改良1「かな漢字変換で確定のリターンを押すとSetボタンが反応してしまう」
console.log('\u3271 \u672d\u306f**\u30b3\u30e1\u30f3\u30c8\u306e\u4e2d**\u3078(\u9589\u3058\u306e\u5370\u306e\u4e26\u3073\u3054\u3068\u5c3e\u3092\u53d6\u308b)');
{
 const L=X.meosMembraneTagsLine;
 const a='<!-- {* \u25bcmCN=\u30c6\u30b9\u30c8\u819c_20260903t140222JST // comment1 *} -->';
 ok(L(a,['\u30c6\u30b9\u30c8'])==='<!-- {* \u25bcmCN=\u30c6\u30b9\u30c8\u819c_20260903t140222JST // comment1 #\u30c6\u30b9\u30c8 *} -->',
    '\u2605\u2605\u2605`*}` \u3068 `-->` \u306f**2\u3064\u30671\u7d44**= \u672d\u306f\u305d\u306e\u5185\u5074\u3078', L(a,['\u30c6\u30b9\u30c8']));
 ok(L(a,[])===a, '  \u672d\u3092\u5916\u3057\u305f\u3089\u5143\u306e\u884c\u306b\u623b\u308b(\u4f59\u5206\u306a\u5b57\u3092\u6b8b\u3055\u306a\u3044)', L(a,[]));
 const b='<!-- {* \u25bcmCN=a_1 // c *} -->';
 ok(L(L(b,['x']),['y'])==='<!-- {* \u25bcmCN=a_1 // c #y *} -->', '\u2605\u66f8\u304d\u63db\u3048\u3066\u3082\u5f62that\u5d29\u308c\u306a\u3044(\u4f55\u5ea6\u3067\u3082)', L(L(b,['x']),['y']));
 const c='// {* \u25bcmCN=a_1 // c *}';
 ok(L(c,['z'])==='// {* \u25bcmCN=a_1 #z *}'||L(c,['z']).indexOf('*}')>0, '  `-->` \u306e\u7121\u3044\u5f62\u3067\u3082\u9589\u3058\u306e\u5185\u5074\u3078', L(c,['z']));
 ok(L('\u25bc\u76ee\u85ac_1  // #\u75c5\u6c17',['\u75c5\u6c17','\u671d'])==='\u25bc\u76ee\u85ac_1  // #\u75c5\u6c17 #\u671d',
    '  \u9589\u3058\u306e\u5370that\u7121\u3044\u884c\u306f\u672b\u5c3e\u3078', L('\u25bc\u76ee\u85ac_1  // #\u75c5\u6c17',['\u75c5\u6c17','\u671d']));
 ok(L('no slashes here',['x'])===null, '  `//` \u306e\u7121\u3044\u5f62\u306b\u306f\u66f8\u304b\u306a\u3044(\u5f62\u3092\u4f5c\u308a\u66ff\u3048\u306a\u3044)', true);
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/function clkComposing\(e\)\{return !!\(e\.isComposing\|\|e\.keyCode===229\);\}/.test(S),
    '\u2605\u2605\u5909\u63db\u4e2d\u306e Enter \u306f\u7121\u8996\u3059\u308b(\u6839\u306e\u65b9\u3082\u585e\u3050)', true);
 ok(/if\(clkTagEl\)clkTagEl\.addEventListener\('keydown',function\(e\)\{\n  if\(e\.key==='Escape'\)/.test(S),
    '\u2605\u2605\u2605Tag \u306e\u7bb1\u3067\u306f Enter \u3067\u639b\u3051\u306a\u3044(\u639b\u3051\u308b\u306e\u306f Set \u3092\u62bc\u3057\u305f\u6642\u3060\u3051)', true);
}

// v4.1.88(俊克 2026.09.03 pm02:56)
//   改良1「tipで膜名をフルで見せた方がいい。パネルの上端ギリギリの位置に。邪魔にならなく、固定位置で」
//   改良2「タグが無数に増えた時のことを考えて、最近使った10個を限度に。あとは入力して検索」
console.log('\u3272 tip \u306f\u30d1\u30cd\u30eb\u306e\u5916\u5074\u30fb\u4e0a\u7aef\u306b\u56fa\u5b9a / \u672d\u306e\u6bb5\u306f10\u679a\u307e\u3067');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/function clkTipShow\(txt\)/.test(S)&&/clkPop\.addEventListener\('mousemove'/.test(S),
    '\u2605\u2605\u2605\u3053\u306e\u9762\u306e tip \u306f**\u81ea\u5206\u3067\u63cf\u304f**(\u5171\u6709\u306etip\u6a5f\u69cb\u306b\u983c\u3089\u306a\u3044)', true);
 ok(/\.clk-tip\{position:absolute;left:0;right:0;bottom:calc\(100% \+ 5px\)/.test(S),
    '\u2605\u2605**\u30d1\u30cd\u30eb\u306e\u771f\u4e0a**\u306b\u8cab\u308a\u4ed8\u304f(\u4f4d\u7f6e\u306f\u8a08\u7b97\u3067\u306a\u304fCSS\u3067\u5b9a\u7fa9)', true);
 ok(/pointer-events:none/.test(S)&&/\.clk-tip\.on\{display:block\}/.test(S),
    '  \u4f55\u3082\u899a\u308f\u306a\u3044\u30fb\u4f55\u3082\u8986\u308f\u306a\u3044(\u5e2f\u306f\u62bc\u305b\u306a\u3044)', true);
 ok(/if\(seen\.length>10\)\{var _keep=seen\.slice\(0,10\);/.test(S),
    '\u2605\u2605\u2605\u672d\u306e\u6bb5\u306f**10\u679a\u307e\u3067**(\u305d\u306e\u5148\u306f\u7bb1\u3067\u547c\u3076)', true);
 ok(/if\(clkTagSel&&_keep\.indexOf\(clkTagSel\)<0\)\{_keep\.pop\(\);_keep\.push\(clkTagSel\);\}/.test(S),
    '\u2605\u4eca\u9078\u3093\u3067\u3044\u308b\u672d\u306f\u5fc5\u305a\u6b8b\u3059(\u62bc\u3057\u305f\u7269that\u6d88\u3048\u308b\u306e\u306f\u5618)', true);
 ok(/if\(_mi>=0\)clkTagMRU\.splice\(_mi,1\);clkTagMRU\.unshift\(_tv\);/.test(S),
    '  \u300c\u6700\u8fd1\u4f7f\u3063\u305f\u300d\u306f**\u62bc\u3057\u305f\u9806**(\u3053\u306e\u9762\u306e\u4e2d\u3060\u3051\u30fb\u672c\u6587\u306b\u306f\u66f8\u304b\u306a\u3044)', true);
}

// v4.1.90(俊克「以前、tipが邪魔だから出ないようにと言って加えた処理がどこかにあるはずだよ」= v4.0.463)
console.log('\u3273 \u2b50\u898b\u3064\u304b\u3063\u305f= v4.0.463 that\u3053\u306e\u9762\u306e tip \u3092\u5168\u90e8\u6b62\u3081\u3066\u3044\u305f');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/\{var _ckp=document\.getElementById\('clk-pop'\);if\(_ckp&&_ckp\.classList\.contains\('on'\)\)\{hideTocTip\(\);return;\}\}/.test(S),
    '\u2605\u2605\u2605v4.0.463 \u306f**\u6b8b\u3059**(\u5171\u6709\u306etip\u306f\u3053\u306e\u9762\u3092\u8986\u3046\u5f62so\u3001\u51fa\u3055\u306a\u3044\u306e that\u6b63\u3057\u3044)', true);
 ok(/\u79c1\u306f2\u5ea6\u3001\u901a\u3089\u306a\u3044\u30b3\u30fc\u30c9\u3092\u76f4\u3057\u3066\u3044\u305f/.test(S),
    '\u2605\u306a\u305c2\u5ea6\u5916\u3057\u305f\u304b\u3092\u3001\u305d\u306e\u5834\u306b\u66f8\u304d\u6b8b\u3059', true);
 ok(/closest\('\[data-full\],\[data-tip\],\[title\]'\)/.test(S),
    '\u2605\u2605\u5e2f\u306f**\u3053\u306e\u9762\u306e\u8aad\u3080\u7269\u3092\u5168\u90e8**\u5f15\u304d\u53d7\u3051\u308b(\u884c\u3082\u30fb\u99d2\u3082\u30fb\u7bb1\u3082)', true);
 ok(/if\(_t0\)e0\.setAttribute\('data-full',_t0\);e0\.removeAttribute\('title'\);/.test(S),
    '\u2605\u2605\u7d20\u306e title \u306f\u5e2f\u3078\u79fb\u3057\u3066\u5916\u3059(OS\u6a19\u6e96\u306etip\u3068\u306e\u4e8c\u91cd\u51fa\u3057\u3092\u65ad\u3064)', true);
}

// v4.1.91/92(俊克「『Tag & Go · +7』の+7って何?」「ファイルを切り替えたら、⏰も切り替わるべきだよね?」)
console.log('㉴ ⏰の一覧は**今のファイルの物** / 扉の数字は**扉の向こう**を数える');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/if \(_cur && r\.uri !== _cur\) return;/.test(S),
    '★★★一覧に並ぶのは今開いているファイルの時計だけ', true);
 ok(/const push = \(r, running\) => \{[\s\S]{0,40}if \(_cur/.test(S),
    '★見張りは push の中1つ(走っている物も履歴も同じ規則)', true);
 ok(/function clkDoorLabel\(\)\{return '#  Tag & Go'\+\(\(vmTagItems&&vmTagItems\.length\)/.test(S),
    '★★★扉の数字は**その扉that開ける物**を数える(+Nではない)', true);
 ok(/dr\.textContent=clkDoorLabel\(\);/.test(S)&&/if\(_dr\)_dr\.textContent=clkDoorLabel\(\);/.test(S),
    '  名札の出どころは1つ(描き直しと書き直しで別の式を持たない)', true);
 ok(/_em\.textContent=clkTagMode\?'no tagged membrane in this file':'no clock in this file';/.test(S),
    '★時計that無くても**扉は立てる**(Tag&Go は時計の有無に依らない)', true);
 ok(/if \(!meDockPanel\) return;\s+\/\/ v4\.1\.92/.test(S),
    '  面that閉じている間は膜を数えに行かない', true);
}

// ★★★v4.1.146(俊克 9/5 am02:55 で確定・pm08:00「周期の掛け算記法は、どうしようか?」で着手):
//   **矢印＝向き / 数字＝1回分の長さ / (…)×N＝回数**(省略＝無限)。
//   ★これthat無いと**一度きりのストップウォッチthat書けない**= SWは「長さ − 残り」で出すso長さthat要る。
console.log('⑩ (…)×N 回数の記法');
{
 const P=X.meosClockFcParse, N=X.meosCycleSeriesNext, CI=X.meosParseCycleInput;
 const L=(sp)=>'<!-- Mew!UFC ⏰ 2026-09-05 20:00 '+sp+' -->';
 /* ① 読む= 括弧有り・無し・x の3通り(read-both) */
 ok((P(L('(↻3m/1m)×3'))||{}).rounds===3, '★★括弧つき `(↻3m/1m)×3` を読む', (P(L('(↻3m/1m)×3'))||{}).rounds);
 ok((P(L('↻3m/1m×3'))||{}).rounds===3, '  括弧無し `↻3m/1m×3` も読む', true);
 ok((P(L('↻3m/1mx3'))||{}).rounds===3, '  `x` でも読む(× を打ちにくい日ある)', true);
 ok((P(L('↺↻3m/1m'))||{}).rounds===null, '★回数が無ければ無限(null)', (P(L('↺↻3m/1m'))||{}).rounds);
 /* ② 長さと向きを壊していない= ×N を足しても今までの読みthat変わらない */
 {const c=P(L('(↺↻3m/1m)×3'))||{};
  ok(c.dual===true&&Array.isArray(c.cycle)&&c.cycle.join('/')==='3m/1m',
     '★★★回数を足しても、向きと長さはそのまま', [c.dual, c.cycle&&c.cycle.join('/')]);}
 /* ③ 長さthat無ければ回数は意味を持たない= 「何を3回?」に答えられない */
 ok((P(L('↺×3'))||{}).rounds===null, '★★長さの無い `↺×3` は回数を持たない', (P(L('↺×3'))||{}).rounds);
 /* ④ 数える= N周を終えたら round が N を超える(終わりを判定できる) */
 {const org=new Date(2026,8,5,20,0,0).getTime(), step=4*60000;   // 3m+1m = 1周4分
  const r1=N(org,['3m','1m'],org+30000), r3=N(org,['3m','1m'],org+step*2+30000), r4=N(org,['3m','1m'],org+step*3+30000);
  ok(r1.round===1, '  1周目は 1', r1.round);
  ok(r3.round===3, '  3周目は 3', r3.round);
  ok(r4.round===4&&r4.round>3, '★★★3周で終わる時計は、4周目に入った瞬間「済み」と判る', r4.round);
  ok(N(org,['3m','1m'],org-1000).round===0, '★ゴング前は 0 周目(×0)', true);}
 /* ⑤ 面の箱にも同じ記法を打てる= 長さと回数を取り違えない */
 ok(CI('3m/1m×3').join('/')==='3m/1m', '★★面の箱の `×3` は長さに混ざらない', CI('3m/1m×3'));
 ok(CI('(3m/1m)×3').join('/')==='3m/1m', '  括弧も長さに混ざらない', CI('(3m/1m)×3'));
 /* ⑥ 書く形は括弧の1つに絞る(read-both / write-one) */
 {const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  ok(/_rn \? \('\(' \+ _ar \+ _cy \+ '\)\\u00d7' \+ _rn\)/.test(S),
     '★★★書く時は必ず括弧 `(↺↻3m/1m)×3`(読む形は3通り、書く形は1つ)', true);
  ok(/const _rn = \(spec\.rounds > 0 && _cy\) \? Math\.floor\(spec\.rounds\) : 0;/.test(S),
     '★長さの無い時は回数を書かない(読みと揃える)', true);
  const A=S.slice(S.indexOf('function meosArmClockFcFor'), S.indexOf('function meosArmClockFcFor')+14000);
  ok(/_rn\.round > c\.rounds/.test(A), '★★★数え直しは meosCycleSeriesNext 1本(新しい数えを作らない)', true);
  ok(/rounds done key=/.test(A), '  終わったことをログへ残す', true);
  ok(A.indexOf('_rn.round > c.rounds') < A.indexOf('if (_meosPseudoUntil.has(lk))'),
     '★★★回数の終わりは「掛かっているか」を見る前に見る(掛かったままの物もここで終れる)', true);}
}

// v4.1.147(俊克 9/5 pm11:41 改良2「一時停止しても回数を表示しよう。**何回経過したかは重要な結果であり
//   情報**だからね。コメント内部に書き込んでおけばいい」＋ pm11:49「UFCのデータとしては今まで通り1行に」):
console.log('\u246b \u23f82= 休んだ時に何周終えていたか');
{
 const P=X.meosClockFcParse;
 const L=(face,sp)=>'<!-- Mew!UFC \u23f0'+face+' 2026-09-05 20:05 '+sp+' -->';
 ok((P(L('\u23f82','(\u21ba\u21bb3m/1m)\u00d73'))||{}).pausedRound===2, '\u2605\u2605\u23f82 を「2周終えた」と読む', (P(L('\u23f82','(\u21ba\u21bb3m/1m)\u00d73'))||{}).pausedRound);
 {const c=P(L('\u23f82','(\u21ba\u21bb3m/1m)\u00d73'))||{};
  ok(c.when==='2026-09-05 20:05', '\u2605\u2605\u2605数字を印に許しても、起点は食われない(2026 を印と読まない)', c.when);
  ok(c.rounds===3, '\u2605\u2605\u2605**住所that違う**= 頭の \u23f82(結果) と 尾の \u00d73(上限) thatぶつからない', [c.pausedRound,c.rounds]);
  ok(c.off===true&&Array.isArray(c.cycle)&&c.cycle.join('/')==='3m/1m', '  休みも長さもそのまま読める', true);}
 ok((P(L('\u23f8','\u21ba3m'))||{}).pausedRound===0, '  数字の無い \u23f8 は 0(今までの行thatそのまま読める)', true);
 ok((P(L('','\u21ba3m'))||{}).pausedRound===0, '  休んでいない行は 0', true);
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/spec\.off \? \('\\u23f8' \+ \(spec\.pausedRound > 0 \? Math\.floor\(spec\.pausedRound\) : ''\)\) : ''/.test(S),
    '\u2605\u2605書く時も \u23f8N で書き戻す', true);
 ok(/const _pr9 = \(sc && typeof sc\.round === 'number' && sc\.round > 0\) \? sc\.round/.test(S),
    '\u2605\u2605\u2605止める**その時**の周回数を控えから読む(消える前に)', true);
 ok(/if \(c\.pausedRound > 0\) \{/.test(S) && /_bg3r = meosClockBadgeRowForLine/.test(S) && /_bg3r >= 0 && !meosShowsRawLine\(editor, _bg3r\)/.test(S),
    '\u2605休んでいても \u00d7N を出す(場所は走っている時と同じバッジ行)', true);
 ok(!/meosClockTailParse/.test(S) && /const line = spec/.test(S) && !/const _blk = spec/.test(S),
    '\u2605\u2605\u2605生データは1行のまま(2行に割らない= UFC1行のコピペthatそのまま時計になる)', true);
}

// v4.1.149(俊克 9/6 am00:12「2行目も『⏰🔒 2026-09-05(s) 20:05 ↺↻3m/1m』だけを見せかけ表示しよう。
//   文字カーソルthat入った時に生データthat見えればいい。これですべてthatすっきりする」):
console.log('\u246c \u23f0行も包みを消す(飾りの行は予定だけ)');
{
 const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(/badgeHide\.push\(new vscode\.Range\(i, 0, i, _p0\)\)/.test(S),
    '\u2605\u2605頭の包み(<!-- Mew!UFC )を消す', true);
 ok(/badgeHide\.push\(new vscode\.Range\(i, _k9, i, txt\.length\)\)/.test(S),
    '\u2605\u2605尾の包み( -->)を消す', true);
 ok(/if \(!meosShowsRawLine\(editor, i\)\) \{\s*\n\s*const _p0/.test(S),
    '\u2605\u2605\u2605カーソルthat入った行では1文字も消さない(そこは直すための窓)', true);
 ok(/textDecoration: 'none; opacity: 0; font-size: 0;'/.test(S),
    '\u2605\u2605消し方は幅ごと畳む(文字は並びに残るso、色も数字も同じ桁に当たる)', true);
 ok(/let _at2 = \(_cl > 0\) \? _cl : txt\.length;\s*\n\s*while \(_at2 > 0 && txt\.charAt\(_at2 - 1\) === ' '\) _at2--;/.test(S),
    '\u2605数字は消える手前へ置く(隠した所に物を置かない)', true);
}

console.log(ng?('NG '+ng+'件'):'全項目 PASS'); process.exit(ng?1:0);
},50);
