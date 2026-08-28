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
 +'\nmodule.exports.__t={_meosClockMem,_meosPseudoUntil,_meosPseudoScopes,_meosClockLoaded,meosClockMeta,meosLoadClocksFor,meosParseWhen,meosClockList};\n');
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

console.log(ng?('NG '+ng+'件'):'全項目 PASS'); process.exit(ng?1:0);
},50);
