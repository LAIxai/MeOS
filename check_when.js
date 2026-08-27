// 開発用ツール(vsix除外): ⏰ の「いつ」の読み取り(時刻 / 月日 / 年月日)を実物で確かめる。
//
// v4.0.458(俊克「⏰は、年月日も指定できるようにしよう。基本は毎日の時刻指定」)
// ★指定の細かさthatが、その予定の周期を言っている= 時刻だけ→今日か明日 / 月日→今年 / 年つき→その1日。
// ★写経しない= extension.js の meosParseWhen をそのまま呼ぶ。
// 使い方:  node src/check_when.js
const fs=require('fs'),path=require('path'),Module=require('module');
const SRC='/Volumes/T7_SSD2TB/Claude Code/MeOS/src';
const H=fs.readFileSync(path.join(SRC,'check_fcpair.js'),'utf8');
const stubSrc=H.slice(H.indexOf('const stub = {'), H.indexOf('const origLoad'));
const stub=eval('('+stubSrc.replace(/^const stub = /,'').trim().replace(/;$/,'')+')');
const o=Module._load; Module._load=function(r){if(r==='vscode')return stub;return o.apply(this,arguments);};
const T='/tmp/mp_'+process.pid+'.js';
fs.writeFileSync(T, fs.readFileSync(path.join(SRC,'extension.js'),'utf8')+'\nmodule.exports.__t={meosParseWhen,meosFormatStamp};\n');
let X; try{X=require(T).__t;}finally{try{fs.unlinkSync(T);}catch(_){}}
let ng=0; const ok=(c,l,g)=>{console.log((c?'  ok  ':' NG   ')+l+(c?'':'   <- '+JSON.stringify(g)));if(!c)ng++;};
const now=new Date();
const P=(s)=>X.meosParseWhen(s);
const fmt=(w)=>w?X.meosFormatStamp(w.at):null;

console.log('① 時刻だけ = 今日、過ぎていれば明日(基本の使い方)');
const soon=new Date(now.getTime()+3600e3), past=new Date(now.getTime()-3600e3);
const p2=(n)=>String(n).padStart(2,'0');
let w=P(p2(soon.getHours())+':'+p2(soon.getMinutes()));
ok(w && w.at.getDate()===soon.getDate() && w.ms>0, '1時間後の時刻 -> 今日', fmt(w));
w=P(p2(past.getHours())+':'+p2(past.getMinutes()));
ok(w && w.ms>0 && w.ms<25*3600e3, '1時間前の時刻 -> 明日(送られる)', fmt(w));
ok(P('1830') && P('18:30') && P('1830').at.getHours()===18, 'コロン無しでも読む', fmt(P('1830')));

console.log('② 月日 = 今年、過ぎていれば来年');
const y=now.getFullYear();
w=P('12/31 23:59');
ok(w && (w.at.getFullYear()===y || w.at.getFullYear()===y+1) && w.at.getMonth()===11 && w.at.getDate()===31, '12/31 23:59', fmt(w));
w=P('1/1 09:00');
ok(w && w.ms>0, '1/1 -> 来年へ送られている(今日より前なので)', fmt(w));
ok(P('9-1 1830') && P('9-1 1830').at.getHours()===18, 'ハイフン区切りも読む', fmt(P('9-1 1830')));

console.log('③ 年つき = その1日。過ぎた指定は誤り');
w=P((y+1)+'-09-01 18:30');
ok(w && w.at.getFullYear()===y+1 && w.at.getMonth()===8 && w.at.getDate()===1 && w.at.getHours()===18, '来年の日付', fmt(w));
ok(P('2020-01-01 09:00')===null, '★過ぎた年月日は誤り(黙って来年にしない)', P('2020-01-01 09:00'));
ok(P((y+1)+'0901 1830') && P((y+1)+'0901 1830').at.getDate()===1, '20260901 1830 の詰め形も読む', fmt(P((y+1)+'0901 1830')));

console.log('④ 時刻を省いた日付 = その日の00:00');
w=P((y+1)+'-09-01');
ok(w && w.at.getHours()===0 && w.at.getMinutes()===0, '日付だけ -> 00:00', fmt(w));

console.log('⑤ 誤りは誤りと言う');
ok(P('25:00')===null, '25時は無い', P('25:00'));
ok(P('18:70')===null, '70分は無い', P('18:70'));
ok(P((y+1)+'-02-30')===null, '★2/30 は無い(月が繰り上がったのを見抜く)', P((y+1)+'-02-30'));
ok(P((y+1)+'-13-01')===null, '13月は無い', P((y+1)+'-13-01'));
ok(P('')===null && P('abc')===null && P(null)===null, '空・字は誤り', true);
console.log(ng?('NG '+ng+'件'):'全項目 PASS');
process.exit(ng?1:0);
