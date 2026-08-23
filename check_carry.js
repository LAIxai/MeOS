// 開発用ツール(vsix除外): 打鍵で膜の構造を数え直さない仕掛け(v4.0.394)が、
// 素で数え直した結果と**1文字も違わない**ことを、乱数の編集で突き合わせる。
//
// v4.0.394(俊克 8/23「なぜbs押下で全ファイルをスキャンするの?」「膜のコメントや膜名を
//   編集する時のbsキー押下は、通常の段落と違いはないはずだよね?」)
// ★写経しない= extension.js の meosPatchDocLines / collectMembraneStructure を**そのまま呼ぶ**。
// ★正しさの物差しは「別のdocumentで素から数えた結果」= 持ち越しもキャッシュも通らない道。
// 使い方:  node src/check_carry.js
const fs = require('fs'); const path = require('path'); const Module = require('module');
const stub = {
  Position: class { constructor(l, c) { this.line = l; this.character = c; } },
  Range: class { constructor(a, b, c, d) { if (typeof a === 'object') { this.start = a; this.end = b; } else { this.start = { line: a, character: b }; this.end = { line: c, character: d }; } } },
  Selection: class { constructor(a, b) { this.anchor = a; this.active = b; this.start = a; this.end = b; this.isEmpty = true; } },
  MarkdownString: class { constructor(v) { this.value = v; } }, ThemeColor: class { }, Diagnostic: class { },
  EventEmitter: class { constructor() { this.event = () => ({ dispose() { } }); } fire() { } dispose() { } },
  DecorationRangeBehavior: { ClosedClosed: 1, OpenOpen: 0, ClosedOpen: 2, OpenClosed: 3 },
  OverviewRulerLane: { Left: 1 }, EndOfLine: { LF: 1, CRLF: 2 }, DocumentLink: class { constructor(r) { this.range = r; } },
  DiagnosticSeverity: { Hint: 3 }, CodeActionKind: { QuickFix: 'quickfix' }, TextDocumentChangeReason: { Undo: 1, Redo: 2 },
  Uri: { file: (p) => ({ toString: () => 'file://' + p, fsPath: p }), parse: (s) => ({ toString: () => s }) },
  window: { createTextEditorDecorationType: (o) => ({ __opts: o, dispose() { } }), activeTextEditor: null, visibleTextEditors: [],
    showInformationMessage() { }, showWarningMessage() { }, setStatusBarMessage() { }, createStatusBarItem: () => ({ show() { }, hide() { }, dispose() { } }),
    onDidChangeActiveTextEditor: () => ({ dispose() { } }), onDidChangeTextEditorSelection: () => ({ dispose() { } }),
    onDidChangeTextEditorVisibleRanges: () => ({ dispose() { } }), registerWebviewViewProvider: () => ({ dispose() { } }) },
  workspace: { getConfiguration: () => ({ get: (k, d) => d, update() { } }), textDocuments: [], workspaceFolders: [],
    onDidChangeTextDocument: () => ({ dispose() { } }), onDidSaveTextDocument: () => ({ dispose() { } }),
    onDidOpenTextDocument: () => ({ dispose() { } }), onDidChangeConfiguration: () => ({ dispose() { } }) },
  languages: { createDiagnosticCollection: () => ({ set() { }, clear() { }, delete() { }, dispose() { } }),
    registerDocumentLinkProvider: () => ({ dispose() { } }), registerCodeActionsProvider: () => ({ dispose() { } }), registerHoverProvider: () => ({ dispose() { } }) },
  commands: { registerCommand: () => ({ dispose() { } }), executeCommand: () => Promise.resolve() },
  env: { clipboard: { writeText: () => Promise.resolve() } }, ExtensionMode: { Test: 3 },
  TextEditorRevealType: { InCenter: 2, InCenterIfOutsideViewport: 2 }, StatusBarAlignment: { Left: 1, Right: 2 }, ViewColumn: { One: 1 },
};
const origLoad = Module._load;
Module._load = function (r) { if (r === 'vscode') return stub; return origLoad.apply(this, arguments); };
const TMP = path.join(require('os').tmpdir(), 'meos_check_carry_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8') + '\nmodule.exports.__t = { collectMembraneStructure, meosPatchDocLines, meosMembraneSig, meosDocLines };\n', 'utf8');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }

let ng = 0;
const ok = (cond, label, got) => { console.log((cond ? '  ok  ' : ' NG   ') + label + (cond ? '' : '   ← ' + JSON.stringify(got))); if (!cond) ng++; };

// 膜が入れ子で並ぶ、それらしい文書を作る(2万行)
let lines = [];
for (let s = 0; s < 500; s++) {
  lines.push('<!-- {* ▼mCN=章' + s + '_20260823S1000' + (s % 60 + 10) + 'JST // 章のコメント *} -->');
  for (let k = 0; k < 8; k++) lines.push('本文 ' + s + '-' + k + ' これは普通の段落の行です。');
  lines.push('<!-- {* ▼mCN=節' + s + '_20260823S1100' + (s % 60 + 10) + 'JST // 節のコメント *} -->');
  for (let k = 0; k < 8; k++) lines.push('中の本文 ' + s + '-' + k + ' 段落のつづき。');
  lines.push('<!-- {* ▲mCN=節' + s + '_20260823S1100' + (s % 60 + 10) + 'JST // end *} -->');
  lines.push('<!-- {* ▲mCN=章' + s + '_20260823S1000' + (s % 60 + 10) + 'JST // end *} -->');
  lines.push('');
}
console.log('作った文書 = ' + lines.length + ' 行 / 膜 1000 対');
let VER = 1;
const mkDoc = (arr, uri) => ({ uri: { toString: () => uri, fsPath: uri, scheme: 'file' }, languageId: 'markdown',
  get lineCount() { return arr.length; }, get version() { return uri === 'file:///t.md' ? VER : 1; },
  lineAt: (n) => ({ text: arr[n], range: new stub.Range(n, 0, n, arr[n].length) }),
  getText: () => arr.join('\n'), eol: 1, fileName: '/t.md', isClosed: false });
const doc = mkDoc(lines, 'file:///t.md');
const snap = (v) => JSON.stringify({ p: v.pairs.map(p => [p.id, p.start, p.end, p.depth || 0, !!p.isMnt, !!p.isEnvelope]),
  u: v.unclosedOpens.map(o => [o.id, o.start]), o: v.orphanCloses.map(o => [o.id, o.line]) });
// 物差し= 別のdocument(別のキャッシュ欄)で素から数える
const fullScan = () => snap(T.collectMembraneStructure(mkDoc(lines.slice(), 'file:///cmp' + (VER) + '.md'), { excludeIndex: false }));

let rnd = 20260823; const rand = (n) => { rnd = (rnd * 1103515245 + 12345) & 0x7fffffff; return rnd % n; };
const MEM = []; for (let i = 0; i < lines.length; i++) if (/[▼▲]/.test(lines[i])) MEM.push(i);
T.meosDocLines(doc);                                        // 行配列の控えを作る(実機では開いた時に出来ている)
T.collectMembraneStructure(doc, { excludeIndex: false });   // 土台を1回作る
let same = 0, diff = 0, carried = 0, rescan = 0, cms = 0, rms = 0;
for (let n = 0; n < 300; n++) {
  let L;
  if (n % 2 === 0) { do { L = rand(lines.length); } while (/[▼▲]/.test(lines[L]) || lines[L].length < 8); }
  else { L = MEM[rand(MEM.length)]; }                       // ★膜の行(コメント)も打つ= 俊克の指摘
  const kind = rand(3); VER++;
  let e;
  if (kind === 0) { const t = lines[L]; const at = Math.max(1, Math.min(t.length - 1, rand(t.length)));
    lines[L] = t.slice(0, at) + t.slice(at + 1);
    e = { document: doc, contentChanges: [{ range: new stub.Range(L, at, L, at + 1), text: '' }] };
  } else if (kind === 1) { const t = lines[L]; const at = Math.max(1, Math.min(t.length - 1, rand(t.length)));
    lines.splice(L, 1, t.slice(0, at), t.slice(at));
    e = { document: doc, contentChanges: [{ range: new stub.Range(L, at, L, at), text: '\n' }] };
  } else { if (L < 1) continue; const prev = lines[L - 1]; lines.splice(L - 1, 2, prev + lines[L]);
    e = { document: doc, contentChanges: [{ range: new stub.Range(L - 1, prev.length, L, 0), text: '' }] };
  }
  T.meosPatchDocLines(e);
  const t0 = process.hrtime.bigint();
  const got = snap(T.collectMembraneStructure(doc, { excludeIndex: false }));
  const dt = Number(process.hrtime.bigint() - t0) / 1e6;
  if (dt < 3) { carried++; cms += dt; } else { rescan++; rms += dt; }
  if (got === fullScan()) same++; else diff++;
}
console.log('① 持ち越した構造は、素で数え直した結果と完全に一致する');
ok(diff === 0, '300回の乱数編集で食い違い 0', { same, diff });
console.log('② 打鍵で数え直さない(膜の行を打った時も)');
ok(carried > 200, '持ち越せた回数 = ' + carried + ' / 300', carried);
ok((cms / Math.max(1, carried)) < 1, '持ち越しの平均 = ' + (cms / Math.max(1, carried)).toFixed(3) + ' ms (1ms未満)', cms / Math.max(1, carried));
console.log('   (参考) 数え直した ' + rescan + ' 回 平均 ' + (rms / Math.max(1, rescan)).toFixed(1) + ' ms');
console.log('③ 名乗りの判定 — 膜の行だけを見分ける');
ok(T.meosMembraneSig('本文です。') === '', '普通の行は空', T.meosMembraneSig('本文です。'));
ok(T.meosMembraneSig('<!-- {* ▼mCN=X_1 // c *} -->') === 'O:X_1', '開始膜', T.meosMembraneSig('<!-- {* ▼mCN=X_1 // c *} -->'));
ok(T.meosMembraneSig('<!-- {* ▲mCN=X_1 // c *} -->') === 'C:X_1', '閉じ膜', T.meosMembraneSig('<!-- {* ▲mCN=X_1 // c *} -->'));
ok(T.meosMembraneSig('<!-- {* ▼mCN=X_1 // コメントを直した *} -->') === 'O:X_1', '★コメントを直しても名乗りは同じ(俊克の指摘)', true);
ok(T.meosMembraneSig('<!-- {* ▼mCN=X_2 // c *} -->') !== 'O:X_1', '名前を直せば名乗りが変わる', true);
console.log(ng ? ('NG ' + ng + '件') : '全項目 PASS');
process.exit(ng ? 1 : 0);
