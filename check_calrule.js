// 開発用ツール(vsix除外): ⏰の暦の規則 `↺t1,3`(第1・第3木曜)を実物で確かめる。v4.2.343
// 使い方:  node src/check_calrule.js
const fs=require('fs'),path=require('path'),Module=require('module');
const SRC='/Volumes/T7_SSD2TB/Claude Code/MeOS/src';
const H=fs.readFileSync(path.join(SRC,'check_fcpair.js'),'utf8');
const stubSrc=H.slice(H.indexOf('const stub = {'), H.indexOf('const origLoad'));
const stub=eval('('+stubSrc.replace(/^const stub = /,'').trim().replace(/;$/,'')+')');
const o=Module._load; Module._load=function(r){if(r==='vscode')return stub;return o.apply(this,arguments);};
const T='/tmp/mp_'+process.pid+'.js';
fs.writeFileSync(T, fs.readFileSync(path.join(SRC,'extension.js'),'utf8')+'\nmodule.exports.__t={meosClockFcParse,meosCycleSeriesNext,meosParseCycleInput,meosCycleMs,meosParseCycleExpr,meosCycleLastAt,meosClockLastLabel};\n');
let X; try{X=require(T).__t;}finally{try{fs.unlinkSync(T);}catch(_){}}
let ng=0; const ok=(c,l,g)=>{console.log((c?'  ok  ':' NG   ')+l+(c?'':'   <- '+JSON.stringify(g)));if(!c)ng++;};
const D=(s)=>new Date(s).getTime(), F=(t)=>{const d=new Date(t);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+'('+'SMTWtFs'[d.getDay()]+') '+d.getHours()+':'+String(d.getMinutes()).padStart(2,'0');};

console.log('① 読み');
let c=X.meosClockFcParse('<!-- Mew!UFC ⏰ 2026-10-01 10:00 ↺t1,3 // 定例会 -->');
ok(c && c.cycle && c.cycle.join('|')==='t1,3' && c.title==='定例会' && c.when==='2026-10-01 10:00', '↺t1,3 を1つの規則として読む', c&&{cycle:c.cycle,when:c.when,title:c.title});
c=X.meosClockFcParse('<!-- Mew!UFC ⏰ 2026-10-01 10:00 ↺t1,3×6 -->');
ok(c && c.cycle.join('|')==='t1,3' && c.rounds===6, '×6 は回数', c&&{cycle:c.cycle,rounds:c.rounds});
c=X.meosClockFcParse('<!-- Mew!UFC ⏰ 2026-10-01 10:00 ↺MWF -->');
ok(c && c.cycle.join('|')==='MWF', '↺MWF', c&&c.cycle);
c=X.meosClockFcParse('<!-- Mew!UFC ⏰ 09:00 ↺30s -->');
ok(c && c.cycle.join('|')==='30s', '↺30s は今までどおり30秒', c&&c.cycle);
c=X.meosClockFcParse('<!-- Mew!UFC ⏰ ↺↻(8h (5m)×2) // 目薬 1. 本目 -->');
ok(c && c.cycle.join('|')==='8h|5m|5m', '入れ子は今までどおり', c&&c.cycle);
ok(X.meosCycleMs('t1,3')===0, '規則は長さを持たない(間隔の口へ流さない)');

console.log('② 数え(2026年10月: 第1木=10/1, 第3木=10/15 / 11月: 11/5, 11/19)');
const org=D('2026-10-01T10:00:00');
let n=X.meosCycleSeriesNext(org,['t1,3'],D('2026-09-24T12:00:00'));
ok(n && F(n.at)==='2026-10-1(t) 10:00' && n.round===0, '起点より前= 起点の日(第1木)・0周目', n&&[F(n.at),n.round]);
n=X.meosCycleSeriesNext(org,['t1,3'],D('2026-10-01T10:00:00'));
ok(n && F(n.at)==='2026-10-15(t) 10:00' && n.round===1 && n.step===14*86400000, '鳴った直後= 第3木・1周目・長さ14日', n&&[F(n.at),n.round,n.step/86400000]);
n=X.meosCycleSeriesNext(org,['t1,3'],D('2026-10-16T00:00:00'));
ok(n && F(n.at)==='2026-11-5(t) 10:00' && n.round===2, '次の月の第1木', n&&[F(n.at),n.round]);
n=X.meosCycleSeriesNext(org,['t1,3'],D('2026-11-05T10:00:01'));
ok(n && F(n.at)==='2026-11-19(t) 10:00', '11月の第3木', n&&F(n.at));
n=X.meosCycleSeriesNext(D('2026-09-24T10:00:00'),['t1,3'],D('2026-09-24T12:00:00'));
ok(n && F(n.at)==='2026-10-1(t) 10:00', '起点が規則に当たらない日= 次の当たり日から', n&&F(n.at));
n=X.meosCycleSeriesNext(org,['t'],D('2026-10-01T11:00:00'));
ok(n && F(n.at)==='2026-10-8(t) 10:00', '↺t = 毎木曜', n&&F(n.at));
n=X.meosCycleSeriesNext(org,['t1,3','M'],D('2026-10-01T11:00:00'));
ok(n && F(n.at)==='2026-10-5(M) 10:00', '↺t1,3 M = 和(次は月曜)', n&&F(n.at));
n=X.meosCycleSeriesNext(D('2026-10-01T10:00:00'),['F5'],D('2026-10-01T11:00:00'));
ok(n && F(n.at)==='2026-10-30(F) 10:00', '第5金曜(無い月は飛ばす)', n&&F(n.at));
n=X.meosCycleSeriesNext(D('2020-01-02T10:00:00'),['t1,3'],D('2026-09-24T12:00:00'));
ok(n && F(n.at)==='2026-10-1(t) 10:00', '6年前の起点でも答えが出る', n&&F(n.at));
n=X.meosCycleSeriesNext(D('2026-03-05T10:00:00'),['t1,3'],D('2026-03-10T00:00:00'));
ok(n && F(n.at)==='2026-3-19(t) 10:00', '夏時間(米3/8)を跨いでも時刻が動かない', n&&F(n.at));

console.log('③ 面の箱');
ok(X.meosParseCycleInput('t1,3').join('|')==='t1,3', '箱に t1,3', X.meosParseCycleInput('t1,3'));
ok(X.meosParseCycleInput('10m,3h 00 5m').join('|')==='10m|3h', '箱の , 区切りと 00 は今までどおり', X.meosParseCycleInput('10m,3h 00 5m'));
const ex=X.meosParseCycleExpr('t1,3',0);
ok(ex.steps.length===1 && ex.steps[0].tok==='t1,3' && ex.steps[0].to===4, '式として読んでも1つ・桁は0〜4', ex.steps);

console.log('④ 最終日(v4.2.344 ×N の答え)');
const L=(o,c,n)=>{const t=X.meosCycleLastAt(D(o),c,n);return t?X.meosClockLastLabel(t):'';};
let g=L('2026-09-24T10:00:00',['8h'],111); ok(g==='2026-10-31(s) 10:00','↺8h ×111 → 10/31 10:00',g);
g=L('2026-10-01T10:00:00',['t1,3'],11); ok(g==='2027-03-18(t) 10:00','↺t1,3 ×11 → 3/18(開催12回)',g);
g=L('2026-10-01T10:00:00',['t1,3'],12); ok(g==='2027-04-01(t) 10:00','×12 だと1回多い(4/1)が見える',g);
g=L('2026-09-24T10:00:00',['5m','5m'],1); ok(g==='2026-09-24(t) 10:10','入れ子を平らにした並び(5m 5m)×1 → 10分後',g);
ok(X.meosCycleLastAt(D('2026-09-24T10:00:00'),['8h'],0)===0,'×N が無ければ出さない');
// armClock と同じ数え方か= 最終日の直前は round<=N、直後は round>N
const o2=D('2026-10-01T10:00:00'), last=X.meosCycleLastAt(o2,['t1,3'],11);
ok(X.meosCycleSeriesNext(o2,['t1,3'],last-1).round<=11 && X.meosCycleSeriesNext(o2,['t1,3'],last).round>11,'最終日で済みになる(armClockの round>rounds と一致)');
const o3=D('2026-09-24T10:00:00'), l3=X.meosCycleLastAt(o3,['8h'],111);
ok(X.meosCycleSeriesNext(o3,['8h'],l3-1).round<=111 && X.meosCycleSeriesNext(o3,['8h'],l3).round>111,'間隔でも一致');
console.log(ng?('\nNG '+ng+'件'):'\n全部 ok');
process.exit(ng?1:0);
