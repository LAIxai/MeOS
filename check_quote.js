// 開発用ツール(vsix除外): 引用(>)の飾りを実物で確かめる。
// v4.2.283(俊克「引用文記法も対応しようよ」): 本の作法= 字下げ・大きな引用符・出典の右寄せ。
// 使い方:  node src/check_quote.js
const fs=require('fs'),path=require('path'),Module=require('module');
const SRC='/Volumes/T7_SSD2TB/Claude Code/MeOS/src';
const H=fs.readFileSync(path.join(SRC,'check_fcpair.js'),'utf8');
const stub=eval('('+H.slice(H.indexOf('const stub = {'), H.indexOf('const origLoad')).replace(/^const stub = /,'').trim().replace(/;$/,'')+')');
const o=Module._load; Module._load=function(r){if(r==='vscode')return stub;return o.apply(this,arguments);};
const T='/tmp/mq_'+process.pid+'.js';
fs.writeFileSync(T, fs.readFileSync(path.join(SRC,'extension.js'),'utf8')
 +'\nmodule.exports.__t={meosQuoteLineParts,meosApplyQuoteDecorations,displayColumns,meosRenderCols};\n');
let X; try{X=require(T).__t;}finally{try{fs.unlinkSync(T);}catch(_){}}
let ng=0; const ok=(c,l,g)=>{console.log((c?'  ok  ':' NG   ')+l+(c?'':'   <- '+JSON.stringify(g)));if(!c)ng++;};

const L=['# t','ふつうの行',
 '> ミトコンドリアが無ければ、複雑な生命は無かった。','>',
 '> Markdownに、爆発的進化をもたらす。','> それがMeOS。','>','> ―― Spy Lai','',
 'ふつうの行'];
const doc={uri:{toString:()=>'file:///q.md',fsPath:'/q.md',scheme:'file'},languageId:'markdown',lineCount:L.length,
 lineAt:n=>({text:L[n],range:new stub.Range(n,0,n,L[n].length)}),getText:()=>L.join('\n'),eol:1,fileName:'/q.md',isClosed:false,version:1};
const seen=new Map();
const mkEd=(caret)=>({document:doc,visibleRanges:[new stub.Range(0,0,L.length-1,0)],
 selection:{active:{line:caret,character:0},anchor:{line:caret,character:0},isEmpty:true},
 selections:[{active:{line:caret,character:0},anchor:{line:caret,character:0},isEmpty:true}],
 setDecorations:(t,items)=>seen.set(t,items)});
const at=(x)=>(x.range||x).start.line;
const o2=(k)=>(k.__opts||{});

console.log('① 行を読む(> の数・中身・印の長さ)');
const q=X.meosQuoteLineParts('> それがMeOS。');
ok(!!q && q.level===1 && q.mark===2 && q.body==='それがMeOS。', '★`>`の数=階層 / 印の桁 / 中身を分けて読む', q);
ok(X.meosQuoteLineParts('>> 二重')?.level===2, '  >> は2階層', X.meosQuoteLineParts('>> 二重'));
ok(X.meosQuoteLineParts('ふつう')===null, '  引用でない行は null', true);

console.log('② 本の顔(字下げ・引用符・出典の右寄せ)');
X.meosApplyQuoteDecorations(mkEd(0));
const keys=[...seen.keys()];
const hide=keys.find(k=>/font-size: 0px !important/.test(String(o2(k).textDecoration||'')));   // v4.2.292: `>` は畳む
const mark=keys.find(k=>o2(k).before && o2(k).before.contentText==='“');
const pads=keys.filter(k=>o2(k).before && /ch$/.test(String(o2(k).before.width||'')));
ok((seen.get(hide)||[]).length===6, '★`>` の印は**畳む**(6行ぜんぶ・幅ごと消すso数と見た目that合う)', (seen.get(hide)||[]).map(at));
ok((seen.get(mark)||[]).length===0, '★★★3行以上の引用には引用符を付けない(塊= 字下げthat引用符の代わり・v4.2.287)', (seen.get(mark)||[]).map(at));
ok(pads.length>=2, '  字下げの駒は幅ごとに1つ', pads.map(k=>o2(k).before.width));
{
 const used=pads.filter(k=>(seen.get(k)||[]).length).map(k=>[o2(k).before.width,(seen.get(k)||[]).map(at)]);
 const two=used.find(u=>u[0]==='4ch');
 ok(!!two && two[1].join()==='2,3,4,5,6', '★ふつうの引用行は4桁の字下げ(全角2字)', used);
 const attr=used.find(u=>u[0]!=='4ch');
 const wide=Math.max(...[2,4,5,7].map(i=>4+X.meosRenderCols(L[i].replace(/^> ?/,''))));
 ok(!!attr && attr[1].join()==='7' && attr[0]===(4+(wide-4-X.meosRenderCols('―― Spy Lai')-8))+'ch',
    '★★★出典(―― Spy Lai)は右寄せ・右端より8桁内側で止める(v4.2.285 俊克「離れ過ぎ」)', [attr, wide]);
}
{const S=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
 ok(!/meosQuoteRuleType/.test(S) && !/_quoteRuleTypes/.test(S),
    '★★★縦線(罫)は引かない= MeOSでは縦線は**膜の物**so、引用に使うとどちらの線か分からない(v4.2.290 俊克)', true);
 ok(/before: \{ contentText: ' ', width: cols \+ 'ch' \}/.test(S),
    '  字下げの駒は**幅だけ**(流れの中so高さを持たせない= 折り返した段that潰れる)', true);
 ok(/const MEOS_QUOTE_RULE_DARK = '#cbb98c', MEOS_QUOTE_RULE_LIGHT = '#a8905a';/.test(S),
    '  引用符の色は家の色(テーマの引用色は暗い地に沈む)', true);
 ok(/function meosCfgLangValue\(cfg, key, dflt\)/.test(S)
    && /ins\.workspaceFolderLanguageValue/.test(S) && /ins\.globalLanguageValue/.test(S)
    && /meosCfgLangValue\(cfg, 'wordWrapColumn', 80\)/.test(S) && /meosCfgLangValue\(cfg, 'wordWrap', 'off'\)/.test(S),
    '★★★折り返し幅は**言語ごとの値を名指しで**読む(inspect の *LanguageValue)= get() では全体の45that返り、箱that字より短かった(v4.2.293)', true);}

console.log('③ カーソルの行は生のまま / 囲いの中は触らない');
X.meosApplyQuoteDecorations(mkEd(4));
{const h=(seen.get(hide)||[]).map(at); ok(!h.includes(4) && h.includes(2), '★その行だけ `>` を見せる', h);}
{
 const F=['# t','```','> 囲いの中の引用','```'];
 const fd={uri:{toString:()=>'file:///qf.md',fsPath:'/qf.md',scheme:'file'},languageId:'markdown',lineCount:F.length,
  lineAt:n=>({text:F[n],range:new stub.Range(n,0,n,F[n].length)}),getText:()=>F.join('\n'),eol:1,fileName:'/qf.md',isClosed:false,version:1};
 X.meosApplyQuoteDecorations({document:fd,visibleRanges:[new stub.Range(0,0,F.length-1,0)],
  selection:{active:{line:0,character:0},anchor:{line:0,character:0},isEmpty:true},
  selections:[{active:{line:0,character:0},anchor:{line:0,character:0},isEmpty:true}],
  setDecorations:(t,items)=>seen.set(t,items)});
 ok((seen.get(hide)||[]).length===0, '★★囲いの中の `>` は引用にしない(引用は文字)', (seen.get(hide)||[]).map(at));
}
console.log('④ 2行までは引用符・3行以上は塊(v4.2.287 俊克の暗黙のルール)');
{
 const S2=['# t','> ミトコンドリアが無ければ、複雑な生命は無かった。','> それがMeOS。','> ―― Spy Lai','x'];
 const d2={uri:{toString:()=>'file:///q2.md',fsPath:'/q2.md',scheme:'file'},languageId:'markdown',lineCount:S2.length,
  lineAt:n=>({text:S2[n],range:new stub.Range(n,0,n,S2[n].length)}),getText:()=>S2.join('\n'),eol:1,fileName:'/q2.md',isClosed:false,version:1};
 X.meosApplyQuoteDecorations({document:d2,visibleRanges:[new stub.Range(0,0,S2.length-1,0)],
  selection:{active:{line:0,character:0},anchor:{line:0,character:0},isEmpty:true},
  selections:[{active:{line:0,character:0},anchor:{line:0,character:0},isEmpty:true}],
  setDecorations:(t,items)=>seen.set(t,items)});
 const K=[...seen.keys()], o3=(k)=>(k.__opts||{});
 const mk=K.find(k=>o3(k).before && o3(k).before.contentText==='\u201c');
 const mkEnd=K.find(k=>o3(k).after && o3(k).after.contentText==='\u201d');
 ok((seen.get(mk)||[]).map(at).join()==='1', '★中身が2行= 開きの引用符を塊の頭に', (seen.get(mk)||[]).map(at));
 ok((seen.get(mkEnd)||[]).map(at).join()==='2', '★★閉じの引用符は**最後の中身の行の末尾**(出典の行には付けない)', (seen.get(mkEnd)||[]).map(at));
 ok(/const MEOS_QUOTE_MARK_MAX_LINES = 2;/.test(fs.readFileSync(path.join(SRC,'extension.js'),'utf8')),
    '  境目は定数(2行)', true);
}
console.log('⑤ GitHub Alerts(> [!TIP] 等)= Git準拠(v4.2.288)');
{
 const A=['# t','> [!TIP]','> ピンチで字だけ拡大できる。','','> [!WARNING]','> 迷子の ``` に気をつけて。','x'];   // 別の塊= 空行で分ける(GitHubも1塊に1つ)
 const da={uri:{toString:()=>'file:///a.md',fsPath:'/a.md',scheme:'file'},languageId:'markdown',lineCount:A.length,
  lineAt:n=>({text:A[n],range:new stub.Range(n,0,n,A[n].length)}),getText:()=>A.join('\n'),eol:1,fileName:'/a.md',isClosed:false,version:1};
 X.meosApplyQuoteDecorations({document:da,visibleRanges:[new stub.Range(0,0,A.length-1,0)],
  selection:{active:{line:0,character:0},anchor:{line:0,character:0},isEmpty:true},
  selections:[{active:{line:0,character:0},anchor:{line:0,character:0},isEmpty:true}],
  setDecorations:(t,items)=>seen.set(t,items)});
 const K=[...seen.keys()], o4=(k)=>(k.__opts||{});
 const tip=K.find(k=>o4(k).after && /Tip$/.test(String(o4(k).after.contentText||'')));
 const warn=K.find(k=>o4(k).after && /Warning$/.test(String(o4(k).after.contentText||'')));
 const fold=K.find(k=>/font-size: 0px !important/.test(String(o4(k).textDecoration||'')));
 ok(!!tip && (seen.get(tip)||[]).map(at).join()==='1', '★★★`[!TIP]` の行に「💡 Tip」を出す', tip&&[o4(tip).after.contentText,(seen.get(tip)||[]).map(at)]);
 ok(!!fold && (seen.get(fold)||[]).map(at).filter((v,i,a)=>a.indexOf(v)===i).join()==='1,2,4,5', '★`[!TIP]`/`[!WARNING]` の字も `>` も畳む(幅ごと消す)', (seen.get(fold)||[]).map(at));
 ok(!!warn && o4(warn).after.color==='#c69026', '  種類ごとに色(WARNINGは黄)', warn&&o4(warn).after.color);
 ok(!K.some(k=>o4(k).before && o4(k).before.width==='3px'), '★★Alertでも縦線は引かない(色は印と見出しthat持つ)', true);
 // ★v4.2.291: Alertは箱で囲む(引用は囲まない)
 {const S5=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  ok(/const MEOS_ALERT_BG = '1f';/.test(S5) && /backgroundColor: color \+ MEOS_ALERT_BG/.test(S5),
     '★★★Alertは種類の色を薄く敷いた箱(角丸・字の下)= 本の作法では引用は囲まず、注記は囲む', true);
  const panels=K.filter(k=>o4(k).before && /ch$/.test(String(o4(k).before.width||'')) && String(o4(k).before.backgroundColor||'').endsWith('1f'));
  const at2=(x)=>((x.range||x).start.line);
  ok(panels.length>=2, '  箱は頭・中・足で角丸thatが違う(型は幅と役と段で使い回す)', panels.map(k=>[o4(k).before.width,o4(k).before.borderRadius]));
  {const S7=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
   ok(/const _pw = _quoteWrap \? \(MEOS_QUOTE_INDENT \+ _quoteWrap\) : wide;/.test(S7),
      '★★★Alertの箱は**折り返し点で揃える**(中身の長さに依らず一定)= 注記thatが縦に並ぶ(v4.2.297 俊克 改良2)', true);}
  ok(panels.some(k=>(seen.get(k)||[]).map(at2).includes(1)) && panels.some(k=>(seen.get(k)||[]).map(at2).includes(2)),
     '  Alertの全部の行に箱that続く', panels.map(k=>(seen.get(k)||[]).map(at2)));
  ok(panels.every(k=>String(o4(k).before.backgroundColor).startsWith('#')), '  色は種類の色', panels.map(k=>o4(k).before.backgroundColor));
  const S6=fs.readFileSync(path.join(SRC,'extension.js'),'utf8');
  ok(!/rows \+ _tail/.test(S6) && /'body'\), rows, MEOS_ALERTS/.test(S6),
     '★★箱は**その塊の行だけ**= 空の行を飲まない(v4.2.294の「下の余白」は読み違いso外した)', true);
  ok(/affectsConfiguration\('editor\.wordWrapColumn'\)/.test(S6) && /for \(const ed of vscode\.window\.visibleTextEditors\) refresh\(ed\)/.test(S6),
     '★★★設定that変わったら描き直す= 触った回数で見え方that変わる穴を塞ぐ(俊克 バグ1)', true);
  ok(/function meosRenderCols\(text\)/.test(S6) && /_meosTableCjkW : 1;/.test(S6)
     && !/displayColumns\(q\.body\)/.test(S6),
     '★★★桁は**画面での幅**で数える= 全角は font の実比(laiMembrane.tableCjkWidth・既定1.67)。2桁と数えると箱that7桁長くなる(v4.2.295)', true);
  ok(X.meosRenderCols('覚えておくと良いこと。引用符は付かない。')===33 && X.displayColumns('覚えておくと良いこと。引用符は付かない。')===40,
     '  20字の注記= 私の旧い数え方40桁 / 画面は33桁(箱は46→39へ)', [X.meosRenderCols('覚えておくと良いこと。引用符は付かない。'), X.displayColumns('覚えておくと良いこと。引用符は付かない。')]);}
 const mk2=K.find(k=>o4(k).before && o4(k).before.contentText==='\u201c');
 ok((seen.get(mk2)||[]).length===0, '★Alertには引用符を付けない(GitHubと同じ)', (seen.get(mk2)||[]).map(at));
}
console.log(ng ? ('NG ' + ng + '件') : '全項目 PASS');
