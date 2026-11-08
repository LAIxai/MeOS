// 開発用ツール(vsix除外): FC化した膜(バッジが閉じ膜の次のFC行にある形)を「膜の中」と認めるか。
//
// v4.0.381(俊克 8/23「従来は、開始膜、あるいは閉じ膜の中だった。FC化した膜の場合は、
//   FCコメントの中も当然含まれる」/「Edit Meの再設定がFCタイプを認識しない」)
// ★写経しない= extension.js の meDockModeForEditor / isCursorOnMembraneLine /
//   currentMembranePairForRename / foldRangeEnd を**そのまま呼ぶ**。
// 使い方:  node src/check_fcpair.js
const fs = require('fs'); const path = require('path'); const Module = require('module');
const stub = {
  Position: class { constructor(l, c) { this.line = l; this.character = c; } },
  Range: class { constructor(a, b, c, d) { if (typeof a === 'object') { this.start = a; this.end = b; } else { this.start = { line: a, character: b }; this.end = { line: c, character: d }; } } },
  Selection: class { constructor(a, b) { this.anchor = a; this.active = b; this.start = a; this.end = b; this.isEmpty = true; } },
  MarkdownString: class { constructor(v) { this.value = v; } }, ThemeColor: class { }, Diagnostic: class { },
  EventEmitter: class { constructor() { this.event = () => ({ dispose() { } }); } fire() { } dispose() { } },
  DecorationRangeBehavior: { ClosedClosed: 1, OpenOpen: 0, ClosedOpen: 2, OpenClosed: 3 },
  OverviewRulerLane: { Left: 1 }, EndOfLine: { LF: 1, CRLF: 2 }, DocumentLink: class { constructor(r) { this.range = r; } },
  DiagnosticSeverity: { Hint: 3 }, CodeActionKind: { QuickFix: 'quickfix' },
  Uri: { file: (p) => ({ toString: () => 'file://' + p, fsPath: p }), parse: (s) => ({ toString: () => s }) },
  window: {
    createTextEditorDecorationType: (o) => ({ __opts: o, dispose() { } }), activeTextEditor: null, visibleTextEditors: [],
    showInformationMessage() { }, showWarningMessage() { }, setStatusBarMessage() { },
    createStatusBarItem: () => ({ show() { }, hide() { }, dispose() { } }),
    onDidChangeActiveTextEditor: () => ({ dispose() { } }), onDidChangeTextEditorSelection: () => ({ dispose() { } }),
    onDidChangeTextEditorVisibleRanges: () => ({ dispose() { } }), registerWebviewViewProvider: () => ({ dispose() { } }),
  },
  workspace: {
    getConfiguration: () => ({ get: (k, d) => d, update() { } }), textDocuments: [], workspaceFolders: [],
    onDidChangeTextDocument: () => ({ dispose() { } }), onDidSaveTextDocument: () => ({ dispose() { } }),
    onWillSaveTextDocument: () => ({ dispose() { } }),   // v4.1.61: 変わっていない保存で更新日を動かさない口
    onDidOpenTextDocument: () => ({ dispose() { } }), onDidChangeConfiguration: () => ({ dispose() { } }),
  },
  languages: {
    createDiagnosticCollection: () => ({ set() { }, clear() { }, delete() { }, dispose() { } }),
    registerDocumentLinkProvider: () => ({ dispose() { } }), registerCodeActionsProvider: () => ({ dispose() { } }),
    registerHoverProvider: () => ({ dispose() { } }),
  },
  commands: { registerCommand: () => ({ dispose() { } }), executeCommand: () => Promise.resolve() },
  env: { clipboard: { writeText: () => Promise.resolve() } },
  ExtensionMode: { Test: 3 }, TextEditorRevealType: { InCenter: 2, InCenterIfOutsideViewport: 2 },
  StatusBarAlignment: { Left: 1, Right: 2 }, ViewColumn: { One: 1 },
};
const origLoad = Module._load;
Module._load = function (r) { if (r === 'vscode') return stub; return origLoad.apply(this, arguments); };
const SRC = path.join(__dirname, 'extension.js');
const TMP = path.join(require('os').tmpdir(), 'meos_check_edge_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meosMembraneRuleTarget, meosMemEdgeAt, meosMemJumpTarget };\n', 'utf8');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }

let ng = 0;
const ok = (cond, label, got) => { console.log((cond ? '  ok  ' : ' NG   ') + label + (cond ? '' : '   ← ' + JSON.stringify(got))); if (!cond) ng++; };
// ★v4.2.258: 台どうしthat `uri@version` を共有しているso、本体の行の覚え(_meosTextCache)は
//   **最初に読んだ台の行**を返し続ける。表の台のように「この台の行」を読む物だけ、別のファイル名を渡す
//   (第3引数)= 台の作り全部を変えると、覚えに相乗りしていた他の項目that落ちる(実測)。

const H1='<!-- {* ♥️▼▶◀mP7=f_20261108S005813JST //  *} -->',H2='<!-- {* ♥️▲▶◀mP7=f_20261108S005814JST //  *} -->',R='<!-- Mew!UFC --- -->';
const O='<!-- {* ▼mCN=ハイライトと文字色_20260818T191336JST // comment2 *} -->',C='<!-- {* ▲mCN=ハイライトと文字色_20260818T191336JST // comment2 *} -->';
const O2='<!-- {* ▼mCN=子_1 // c *} -->',C2='<!-- {* ▲mCN=子_1 // c *} -->',Q='`<!-- {* ♥️▼▶◀mP7=f_quoted // *} -->` の説明';
const L=['out0',H1,R,'中1','中2',Q,'',R,H2,'out9', O,R,'a',O2,R,'子中','',R,C2,'b','',R,C,'out23', '```',H2,'```',O,'無し罫線',C,'end'];
const doc={uri:{toString:()=>'file:///e.md',fsPath:'/e.md',scheme:'file'},languageId:'markdown',lineCount:L.length,lineAt:n=>({text:L[n]}),getText:()=>L.join('\n'),eol:1,fileName:'/e.md',isClosed:false,version:1};
const t=(cur,down)=>T.meosMembraneRuleTarget(doc,cur,down);
ok(t(3,true)===6,'♥膜の中 ↓=閉じ罫線の1行上',t(3,true));
ok(t(4,false)===3,'♥膜の中 ↑=開始罫線の次の行',t(4,false));
ok(t(6,true)===9,'もう下端=次の膜の手前(v5.1.602)',t(6,true));
ok(t(3,false)===-1,'もう上端=本来の先頭へ',t(3,false));
ok(t(0,true)===6,'開始膜の手前から ↓=膜の中の閉じ罫線の上(v5.1.602)',t(0,true));
ok(t(9,false)===3,'閉じ膜の直下から ↑=膜の中の開始罫線の下(v5.1.602)',t(9,false));
ok(t(12,true)===16,'親の中 ↓=開いた子の中の線でも止まる(v5.1.602)',t(12,true));
ok(t(19,false)===15,'親の中 ↑=開いた子の中の線でも止まる(v5.1.602)',t(19,false));
ok(t(15,true)===16,'子の中 ↓',t(15,true));
ok(t(15,false)===12,'子の中 ↑ もう上端=子の膜を出て親の開始罫線の下(v5.1.602)',t(15,false));
ok(t(16,false)===15,'子の中 ↑',t(16,false));
ok(t(28,true)===-1,'罫線の無い膜=本来の動き',t(28,true));
ok(t(23,true)===-1,'囲いの中の♥を数えない',t(23,true));
ok(t(2,true)===6,'開始罫線の上から ↓',t(2,true));
// ★v5.1.601: 任意の一時停止線でも止まる(同じ深さだけ・もう手前なら越えて次へ)
{ { const N=['top',R,'x2','x3',R,'x5','x6',H1.replace('mP7=f','mP7=meta'),'meta8','meta9'];   // v5.1.602: 末尾が閉じの無い膜の中(生涯日記の mMETA)
  const dn={...doc,uri:{toString:()=>'file:///n.md',fsPath:'/n.md',scheme:'file'},fileName:'/n.md',lineCount:N.length,lineAt:n=>({text:N[n]}),getText:()=>N.join('\n')};
  const v=(c,d)=>T.meosMembraneRuleTarget(dn,c,d);
  ok(v(9,false)===5&&v(5,false)===2&&v(2,false)===-1,'末尾の閉じの無い膜から ↑= 膜を出て線を順に遡る',[v(9,false),v(5,false),v(2,false)]); }
const S='<!-- Mew!UFC === -->', M=['top',S,'x2',H1,R,'a5','a6',S,'a8','a9',R,H2,'y12','',S,'y15','```',S,'```','end'];
  const dm={...doc,uri:{toString:()=>'file:///s.md',fsPath:'/s.md',scheme:'file'},fileName:'/s.md',lineCount:M.length,lineAt:n=>({text:M[n]}),getText:()=>M.join('\n')};
  const u=(c,d)=>T.meosMembraneRuleTarget(dm,c,d);
  ok(u(5,true)===6,'膜の中の任意の線 ↓=線の1行上',u(5,true));
  ok(u(6,true)===9,'線の手前でもう1回 ↓=越えて閉じ罫線の上',u(6,true));
  ok(u(9,false)===8,'膜の中の任意の線 ↑=線の1行下',u(9,false));
  ok(u(8,false)===5,'線の直下でもう1回 ↑=越えて開始罫線の下',u(8,false));
  ok(u(12,true)===13,'膜の外の線 ↓',u(12,true));
  ok(u(13,true)===-1,'囲いの中の線は数えない=本来の末尾',u(13,true));
  ok(u(15,false)===12,'膜の外 ↑=閉じ膜の直下で止まる(膜の行に着地しない)',u(15,false));
  ok(u(2,false)===-1&&u(0,true)===2,'線のすぐ隣: 越えた先に線が無ければ本来/膜を飛ばして次の線',[u(2,false),u(0,true)]);
}
// ★v5.1.603: Opt+↑/↓(Jump to M-🛑)= 膜の端へ・膜の行なら相方・もう一度で外側・子は飛ばす・囲いは数えない
{ const j=(c,d)=>T.meosMemJumpTarget(doc,c,d);
  ok(j(3,true)===8&&j(3,false)===1,'♥膜の中 Opt+↓=閉じ膜/Opt+↑=開始膜',[j(3,true),j(3,false)]);
  ok(j(1,true)===8&&j(8,false)===1,'膜の行で押す=相方へ',[j(1,true),j(8,false)]);
  ok(j(12,true)===22&&j(19,false)===10,'親の中=子を飛ばして親の端',[j(12,true),j(19,false)]);
  ok(j(15,true)===18&&j(18,true)===22&&j(13,false)===10,'子の中→子の端→もう一度で親の端',[j(15,true),j(18,true),j(13,false)]);
  ok(j(23,true)===-1&&j(0,true)===-1,'膜の外=動かない(囲いの中の♥も数えない)',[j(23,true),j(0,true)]); }
ok(T.meosMemEdgeAt(Q,false)===0,'`…` の中の♥は膜の行でない',T.meosMemEdgeAt(Q,false));
console.log(ng?('NG '+ng):'全項目 PASS');
