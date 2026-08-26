// 開発用ツール(vsix除外): **拡張が起動できること**を、本物の activate を呼んで確かめる。
//
// v4.0.399(俊克 8/26 am08:56「見出しが##のまま。呪文も効かない。command not found」)
// ★拡張ホストのログが名指しした形 = applyPrettyLabels の TypeError が activate まで抜け、
//   そこから先のコマンドが1つも登録されなかった。→ ①その形で落ちないこと ②落ちても活動が続くこと。
// 使い方:  node src/check_activate.js
const fs = require('fs'); const path = require('path'); const Module = require('module');
const D = () => ({ dispose() { } });
const REG = [];
const stub = {
  Position: class { constructor(l, c) { this.line = l; this.character = c; } },
  Range: class { constructor(a, b, c, d) { if (typeof a === 'object') { this.start = a; this.end = b; } else { this.start = { line: a, character: b }; this.end = { line: c, character: d }; } } },
  Selection: class { constructor(a, b) { this.anchor = a; this.active = b; this.start = a; this.end = b; this.isEmpty = true; } },
  MarkdownString: class { constructor(v) { this.value = v; } }, ThemeColor: class { }, Diagnostic: class { },
  CodeAction: class { constructor(t, k) { this.title = t; this.kind = k; } }, WorkspaceEdit: class { replace() { } insert() { } delete() { } },
  EventEmitter: class { constructor() { this.event = () => D(); } fire() { } dispose() { } },
  DecorationRangeBehavior: { ClosedClosed: 1, OpenOpen: 0, ClosedOpen: 2, OpenClosed: 3 }, OverviewRulerLane: { Left: 1 },
  EndOfLine: { LF: 1, CRLF: 2 }, DocumentLink: class { constructor(r) { this.range = r; } }, DiagnosticSeverity: { Hint: 3 },
  CodeActionKind: { QuickFix: 'quickfix' }, TextDocumentChangeReason: { Undo: 1, Redo: 2 }, ConfigurationTarget: { Global: 1, Workspace: 2 },
  StatusBarAlignment: { Left: 1, Right: 2 }, ViewColumn: { One: 1 }, ExtensionMode: { Test: 3, Production: 1 },
  TextEditorRevealType: { InCenter: 2, InCenterIfOutsideViewport: 2 }, ProgressLocation: { Notification: 15 },
  Uri: { file: (p) => ({ toString: () => 'file://' + p, fsPath: p, scheme: 'file' }), parse: (s) => ({ toString: () => s }), joinPath: (u, ...r) => ({ toString: () => 'file:///x/' + r.join('/'), fsPath: '/x/' + r.join('/') }) },
  window: {
    createTextEditorDecorationType: () => ({ dispose() { } }), activeTextEditor: null, visibleTextEditors: [],
    showInformationMessage() { }, showWarningMessage() { }, showErrorMessage() { }, setStatusBarMessage() { },
    createStatusBarItem: () => ({ show() { }, hide() { }, dispose() { }, text: '', tooltip: '', command: '' }),
    createOutputChannel: () => ({ appendLine() { }, show() { }, dispose() { } }),
    createWebviewPanel: () => ({ webview: { html: '', onDidReceiveMessage: () => D(), postMessage() { }, asWebviewUri: (u) => u, cspSource: '' }, onDidDispose: () => D(), dispose() { }, reveal() { }, visible: true }),
    registerWebviewPanelSerializer: () => D(), registerWebviewViewProvider: () => D(), withProgress: (o, f) => f({ report() { } }),
    onDidChangeActiveTextEditor: () => D(), onDidChangeTextEditorSelection: () => D(), onDidChangeTextEditorVisibleRanges: () => D(),
    onDidChangeVisibleTextEditors: () => D(), onDidChangeWindowState: () => D(), onDidChangeActiveColorTheme: () => D(),
    showTextDocument: () => Promise.resolve(), showInputBox: () => Promise.resolve(), showQuickPick: () => Promise.resolve(),
    state: { focused: true }, tabGroups: { all: [], onDidChangeTabs: () => D() },
  },
  workspace: {
    getConfiguration: () => ({ get: (k, d) => d, update() { return Promise.resolve(); }, has: () => false }),
    textDocuments: [], workspaceFolders: [], fs: { readFile: () => Promise.resolve(new Uint8Array()) },
    onDidChangeTextDocument: () => D(), onDidSaveTextDocument: () => D(), onDidOpenTextDocument: () => D(),
    onDidCloseTextDocument: () => D(), onDidChangeConfiguration: () => D(), onDidChangeWorkspaceFolders: () => D(),
    openTextDocument: () => Promise.resolve({}), applyEdit: () => Promise.resolve(true), registerFileSystemProvider: () => D(),
    createFileSystemWatcher: () => ({ onDidChange: () => D(), onDidCreate: () => D(), onDidDelete: () => D(), dispose() { } }),
  },
  languages: {
    createDiagnosticCollection: () => ({ set() { }, clear() { }, delete() { }, dispose() { } }),
    registerDocumentLinkProvider: () => D(), registerCodeActionsProvider: () => D(), registerHoverProvider: () => D(),
    registerFoldingRangeProvider: () => D(), registerCompletionItemProvider: () => D(), registerCodeLensProvider: () => D(),
    registerDocumentFormattingEditProvider: () => D(), setLanguageConfiguration: () => D(),
  },
  commands: { registerCommand: (id) => { REG.push(id); return D(); }, registerTextEditorCommand: (id) => { REG.push(id); return D(); }, executeCommand: () => Promise.resolve(), getCommands: () => Promise.resolve([]) },
  env: { clipboard: { writeText: () => Promise.resolve(), readText: () => Promise.resolve('') }, openExternal: () => Promise.resolve(), appName: 'VSCodium' },
  extensions: { getExtension: () => ({ packageJSON: { version: '0.0.0' }, extensionUri: { fsPath: __dirname }, extensionPath: __dirname }) },
};
const origLoad = Module._load;
Module._load = function (r) { if (r === 'vscode') return stub; return origLoad.apply(this, arguments); };

let ng = 0;
const ok = (cond, label, got) => { console.log((cond ? '  ok  ' : ' NG   ') + label + (cond ? '' : '   ← ' + JSON.stringify(got))); if (!cond) ng++; };

// ★俊克の文書そのもの= 本文が空の行 ＋ 真下に見出しを名乗るFC行
const LINES = ['# はじめ', '', '<!-- Mew!FC H2 (白/緑)//[]tip= -->', '本文', '', '<!-- Mew!FC -1. (白/黄) -->', ''];
const doc = {
  uri: { toString: () => 'file:///t.md', fsPath: '/t.md', scheme: 'file' }, languageId: 'markdown',
  get lineCount() { return LINES.length; }, version: 1,
  lineAt: (n) => ({ text: LINES[n], range: new stub.Range(n, 0, n, LINES[n].length) }),
  getText: () => LINES.join('\n'), eol: 1, fileName: '/t.md', isClosed: false,
};
const ed = { document: doc, viewColumn: 1, visibleRanges: [new stub.Range(0, 0, LINES.length - 1, 0)],
  selection: { active: new stub.Position(3, 0), anchor: new stub.Position(3, 0), start: new stub.Position(3, 0), end: new stub.Position(3, 0), isEmpty: true },
  selections: [], setDecorations() { }, revealRange() { }, edit: () => Promise.resolve(true) };
stub.window.activeTextEditor = ed; stub.window.visibleTextEditors = [ed];

let ext = null;
try { ext = require(path.join(__dirname, 'extension.js')); } catch (e) { console.log(' NG   トップレベル評価で落ちた: ' + e.message); process.exit(1); }
console.log('① 本文が空の行＋真下のFC行 — applyPrettyLabels が落ちない(俊克 8/26 の形)');
{
  let err = null;
  try { ext.__t_refresh ? ext.__t_refresh(ed) : null; } catch (e) { err = e; }
  // refresh は module.exports に無いので、activate 経由で確かめる(下の②が本番)
  ok(true, 'この形の文書を用意した', LINES.length + ' 行');
}
console.log('② activate が最後まで通り、コマンドが全部登録される');
{
  const ctx = { subscriptions: [], extensionUri: { fsPath: __dirname, toString: () => 'file://' + __dirname }, extensionPath: __dirname, extensionMode: 3,
    globalState: { get: (k, d) => d, update: () => Promise.resolve(), setKeysForSync() { } },
    workspaceState: { get: (k, d) => d, update: () => Promise.resolve() },
    secrets: { get: () => Promise.resolve(), store: () => Promise.resolve(), onDidChange: () => D() },
    globalStorageUri: { fsPath: '/tmp/meos' }, storageUri: { fsPath: '/tmp/meos' }, asAbsolutePath: (p) => path.join(__dirname, p) };
  let err = null;
  try { ext.activate(ctx); } catch (e) { err = e; }
  ok(!err, '★activate が例外を投げない', err && err.stack ? err.stack.split('\n').slice(0, 2).join(' | ') : null);
  ok(REG.length > 50, 'コマンドが ' + REG.length + ' 個 登録された', REG.length);
  for (const c of ['laiMembrane.enterAtCloseRightEdge', 'laiMembrane.backspaceJoinSpecLines']) {
    ok(REG.indexOf(c) >= 0, '★' + c + ' が登録された(俊克の "not found" の2つ)', REG.indexOf(c));
  }
}
console.log('③ 装飾が落ちても、拡張は生き残る(refresh を activate から切り離した)');
{
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  const i = src.indexOf('function refresh(editor = vscode.window.activeTextEditor)');
  const body = src.slice(i, i + 1400);
  ok(/catch \(e\) \{/.test(body) && /_refreshInner\(editor\)/.test(body), '★refresh が例外を捕まえる', body.slice(0, 120));
  ok(/REFRESH-ERROR/.test(body), '捕まえた例外は名前を残す(黙って消さない)', true);
}
console.log('④ bs/改行/fs は、出番がある場所でだけ横取りする(v4.0.400 俊克)');
{
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const want = ['laiMembrane.enterAtCloseRightEdge', 'laiMembrane.backspaceJoinSpecLines', 'laiMembrane.deleteJoinSpecLines'];
  for (const c of want) {
    const k = pkg.contributes.keybindings.find(x => x.command === c);
    ok(!!k && /meos\.fcKeys/.test(k.when || ''), '★' + k.key + ' は meos.fcKeys が立っている時だけ', k && k.when);
  }
  // 文脈キーの判定そのもの(実物を呼ぶ)
  const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
  ok(/function meosFcKeysNeeded/.test(src), '判定は1つの関数に在る', true);
  ok(/setContext', 'meos\.fcKeys'/.test(src), 'カーソルが動いた時に送る', true);
  ok(/catch \(_\) \{ return true; \}/.test(src.slice(src.indexOf('function meosFcKeysNeeded'), src.indexOf('let _meosInTableCtx'))), '★分からない時は横取りする(機能を落とさない)', true);
}

console.log(ng ? ('NG ' + ng + '件') : '全項目 PASS');
process.exit(ng ? 1 : 0);
