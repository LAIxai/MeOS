// 開発用ツール(vsix除外): 🌅LaunchD(v5.0.0-58)= ⏰の1行 → Mac の起動の予定(pmset)への読み替えを確かめる
// 使い方:  node src/check_launchd.js
const fs=require('fs'),path=require('path'),Module=require('module');
const SRC='/Volumes/T7_SSD2TB/Claude Code/MeOS/src';
const H=fs.readFileSync(path.join(SRC,'check_fcpair.js'),'utf8');
const stubSrc=H.slice(H.indexOf('const stub = {'), H.indexOf('const origLoad'));
const stub=eval('('+stubSrc.replace(/^const stub = /,'').trim().replace(/;$/,'')+')');
const o=Module._load; Module._load=function(r){if(r==='vscode')return stub;return o.apply(this,arguments);};
const T='/tmp/ld_'+process.pid+'.js';
fs.writeFileSync(T, fs.readFileSync(path.join(SRC,'extension.js'),'utf8')+'\nmodule.exports.__t={meosClockFcParse,meosLaunchDSpec,meosIsLaunchDKey,meosLaunchDTs,meosCycleSeriesNext,meosLaunchDMarkText};');
let X; try{X=require(T).__t;}finally{try{fs.unlinkSync(T);}catch(_){}}
let ng=0; const ok=(c,l,g)=>{console.log((c?'  ok  ':' NG   ')+l+(c?'':'   <- '+JSON.stringify(g)));if(!c)ng++;};
const sp=(line)=>{const c=X.meosClockFcParse(line); return c && X.meosLaunchDSpec(c);};
console.log('① 見本の3行');
let c=X.meosClockFcParse('<!-- Mew!UFC ⏰⏸ ↺MTWtF 06:30 // weekdays -->');
ok(c && c.cycle && c.cycle.join('|')==='MTWtF' && c.off && c.title==='weekdays', '平日の行を⏰として読む(⏸=止まっている)', c&&{cycle:c.cycle,when:c.when,off:c.off,title:c.title});
let s=sp('<!-- Mew!UFC ⏰⏸ ↺MTWtF 06:30 // weekdays -->'); ok(s && s.days==='MTWRF' && s.hm==='06:30', '平日 → MTWRF 06:30', s);
s=sp('<!-- Mew!UFC ⏰ ↺sS 08:00 // weekends -->'); ok(s && s.days==='SU' && s.hm==='08:00', '週末(s=土 S=日) → SU 08:00', s);
s=sp('<!-- Mew!UFC ⏰ ↺SMTWtFs 07:00 // every day -->'); ok(s && s.days==='MTWRFSU' && s.hm==='07:00', '毎日 → MTWRFSU 07:00', s);
s=sp('<!-- Mew!UFC ⏰ ↺MWtF 6:30 -->'); ok(s && s.days==='MWRF' && s.hm==='06:30', '月水木金・1桁の時 → MWRF 06:30', s);
s=sp('<!-- Mew!UFC ⏰ ↺↻24h 2026-10-14(W) 07:00p -->'); ok(s && s.days==='MTWRFSU' && s.hm==='07:00', 'Me Dock で付けた ↺↻24h(起点 07:00p) → 毎日 07:00', s);
console.log('② 書けない物は断る');
s=sp('<!-- Mew!UFC ⏰ ↺t1,3 06:30 -->'); ok(s && s.err, '第1第3木曜は macOS に入らない', s);
s=sp('<!-- Mew!UFC ⏰ ↺8h 06:30 -->'); ok(s && s.err, '間隔は macOS に入らない', s);
console.log('③ 膜名');
ok(X.meosIsLaunchDKey('🌅LaunchD_20261014W195043JST') && !X.meosIsLaunchDKey('LaunchD_x') && !X.meosIsLaunchDKey('🌅LaunchDX'), '🌅LaunchD_ だけ');
ok(X.meosLaunchDTs('🌅LaunchD_20261014W195043JST')===20261014195043, 'TS を数に');
console.log('④ 🍎の付け外し(時計の行の // の末尾)');
const MK=X.meosLaunchDMarkText;
ok(MK('<!-- Mew!UFC ⏰ ↺↻24h 2026-10-14(W) 21:15p -->',true)==='<!-- Mew!UFC ⏰ ↺↻24h 2026-10-14(W) 21:15p // 🍎 -->', 'タイトル無し→ // 🍎 を足す', MK('<!-- Mew!UFC ⏰ ↺↻24h 2026-10-14(W) 21:15p -->',true));
ok(MK('<!-- Mew!UFC ⏰ ↺MTWtF 06:30 // weekdays -->',true)==='<!-- Mew!UFC ⏰ ↺MTWtF 06:30 // weekdays 🍎 -->', 'タイトル有り→末尾に 🍎');
ok(MK('<!-- Mew!UFC ⏰ ↺MTWtF 06:30 // weekdays 🍎 -->',true)==='<!-- Mew!UFC ⏰ ↺MTWtF 06:30 // weekdays 🍎 -->', '付いていれば同じ(2つにしない)');
ok(MK('<!-- Mew!UFC ⏰ ↺MTWtF 06:30 // weekdays 🍎 -->',false)==='<!-- Mew!UFC ⏰ ↺MTWtF 06:30 // weekdays -->', '外す→タイトルは残す');
ok(MK('<!-- Mew!UFC ⏰ ↺↻24h 2026-10-14(W) 21:15p // 🍎 -->',false)==='<!-- Mew!UFC ⏰ ↺↻24h 2026-10-14(W) 21:15p -->', '🍎だけのタイトル→ // ごと外す');
let c2=X.meosClockFcParse('<!-- Mew!UFC ⏰ ↺MTWtF 06:30 // weekdays 🍎 -->'); ok(c2 && c2.cycle.join('|')==='MTWtF' && X.meosLaunchDSpec(c2).hm==='06:30', '🍎付きでも時計の読みは変わらない', c2&&{cycle:c2.cycle,title:c2.title});
console.log(ng?('NG '+ng):'全項目 PASS'); process.exit(ng?1:0);
