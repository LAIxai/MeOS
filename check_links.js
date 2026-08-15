// 開発用ツール(vsix除外): リンクの行先を「膜へ飛ぶ / ファイル・他スキーム(VS Codeに任せる) / URL」に
// 分けた結果を、実データで数える検証器。
//
// v4.0.228(俊克 8/16 am08:44 バグ1「古い記法の膜名に飛べない」)
// ★写経しない= extension.js の `meosLinkTargetIsFile` を**そのまま**呼ぶ。
//   旧判定(名前の見た目だけで決めていた式)だけは、差分を出すためにここに置く=この1行が
//   「今回何が変わったか」の全て。旧=ファイル扱い かつ 新=膜 の行が、飛べなかったリンク。
//   逆に 旧=膜 かつ 新=ファイル の行が1つでも出たら、それは後退なので止める。
//
// 使い方:  node src/check_links.js "…/Kt_19580126S08JST.md"
const fs = require('fs');
const path = require('path');
const Module = require('module');

// ---- vscode スタブ(触るのは純関数と文書の読み取りだけなので最小で足りる) ----
const stub = {
  Position: class { constructor(l, c) { this.line = l; this.character = c; } },
  Range: class { constructor(a, b, c, d) { if (typeof a === 'object') { this.start = a; this.end = b; } else { this.start = { line: a, character: b }; this.end = { line: c, character: d }; } } },
  MarkdownString: class { constructor(v) { this.value = v; } },
  ThemeColor: class { }, Diagnostic: class { },
  EventEmitter: class { constructor() { this.event = () => ({ dispose() { } }); } fire() { } dispose() { } },
  DecorationRangeBehavior: { ClosedClosed: 1, OpenOpen: 0, ClosedOpen: 2, OpenClosed: 3 },
  OverviewRulerLane: { Left: 1 }, EndOfLine: { LF: 1, CRLF: 2 },
  DiagnosticSeverity: { Hint: 3 }, CodeActionKind: { QuickFix: 'quickfix' },
  Uri: { file: (p) => ({ toString: () => 'file://' + p, fsPath: p }), parse: (s) => ({ toString: () => s }) },
  DocumentLink: class { constructor(r) { this.range = r; } },
  window: {
    createTextEditorDecorationType: (o) => ({ __opts: o, dispose() { } }), activeTextEditor: null,
    showInformationMessage() { }, showWarningMessage() { }, setStatusBarMessage() { },
    createStatusBarItem: () => ({ show() { }, hide() { }, dispose() { } }),
    onDidChangeActiveTextEditor: () => ({ dispose() { } }), onDidChangeTextEditorSelection: () => ({ dispose() { } }),
    onDidChangeTextEditorVisibleRanges: () => ({ dispose() { } }), registerWebviewViewProvider: () => ({ dispose() { } }),
  },
  workspace: {
    getConfiguration: () => ({ get: (k, d) => d, update() { } }), textDocuments: [], workspaceFolders: [],
    onDidChangeTextDocument: () => ({ dispose() { } }), onDidSaveTextDocument: () => ({ dispose() { } }),
    onDidOpenTextDocument: () => ({ dispose() { } }), onDidChangeConfiguration: () => ({ dispose() { } }),
  },
  languages: {
    createDiagnosticCollection: () => ({ set() { }, clear() { }, delete() { }, dispose() { } }),
    registerDocumentLinkProvider: () => ({ dispose() { } }), registerCodeActionsProvider: () => ({ dispose() { } }),
    registerHoverProvider: () => ({ dispose() { } }),
  },
  commands: { registerCommand: () => ({ dispose() { } }), executeCommand: () => Promise.resolve() },
  env: { clipboard: { writeText: () => Promise.resolve() } },
  ExtensionMode: { Test: 3 }, TextEditorRevealType: { InCenter: 2 },
  StatusBarAlignment: { Left: 1, Right: 2 }, ViewColumn: { One: 1 },
};
const origLoad = Module._load;
Module._load = function (r) { if (r === 'vscode') return stub; return origLoad.apply(this, arguments); };

const SRC = path.join(__dirname, 'extension.js');
const TMP = path.join(require('os').tmpdir(), 'meos_check_links_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meosLinkTargetIsFile, meosMembraneNameSet, meosLineEndLinks, _fcLinksFor, MEOS_MD_LINK_RE, MEOS_MELINK_RE };\n', 'utf8');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }

const file = process.argv[2];
if (!file) { console.log('使い方: node src/check_links.js <mdファイル>'); process.exit(2); }
const text = fs.readFileSync(file, 'utf8');
const lines = text.split(/\r?\n/);
// 最小の文書スタブ(collectMembraneStructure が使うのは lineCount / lineAt / uri / version だけ)
const doc = {
  uri: stub.Uri.file(file), version: 1, lineCount: lines.length,
  lineAt: (i) => ({ text: lines[i] }), getText: () => text,
};

// ★旧判定=「名前の見た目」だけで決めていた式(v4.0.227まで・4箇所に写経されていた)。
const OLD_IS_FILE = (t) => /^[a-z][a-z0-9+.-]*:/i.test(t) || t.indexOf('/') >= 0 || /\.[A-Za-z0-9]{1,8}$/.test(t);

// 行先を集める(行末一括コメント方式 `]()` と、素のMarkdownリンク `[表示](行先)` の両方)
const found = []; // {ln, kind, label, target}
for (let i = 0; i < lines.length; i++) {
  const t = lines[i];
  if (t.indexOf(']()') >= 0) {
    // 行先が真下のFC行に在る形(v4.0.190)も本番と同じ口で拾う
    let fc = null; try { fc = T._fcLinksFor(doc, i); } catch (_) { }
    try { for (const b of T.meosLineEndLinks(t, fc)) if (b.target && b.label) found.push({ ln: i + 1, kind: 'FC', label: b.label, target: b.target }); } catch (_) { }
  }
  if (t.indexOf('](') >= 0) {
    let m; T.MEOS_MD_LINK_RE.lastIndex = 0;
    while ((m = T.MEOS_MD_LINK_RE.exec(t)) !== null) {
      const label = m[1] || '', target = String(m[2] != null ? m[2] : (m[3] || '')).trim();
      if (target && label) found.push({ ln: i + 1, kind: 'MD', label, target });
    }
  }
}

const names = T.meosMembraneNameSet(doc);
let url = 0, sameFile = 0, sameJump = 0;
const fixed = [], broke = [];
for (const f of found) {
  if (/^https?:\/\//i.test(f.target)) { url++; continue; }
  const oldF = OLD_IS_FILE(f.target), newF = T.meosLinkTargetIsFile(doc, f.target);
  if (oldF && !newF) fixed.push(f);           // 飛べなかったものが飛べるようになった
  else if (!oldF && newF) broke.push(f);      // 後退(0でなければ止める)
  else if (newF) sameFile++; else sameJump++;
}
console.log('links: ' + file);
console.log('  膜の名前 ' + names.size + ' 個 / リンクの行先 ' + found.length + ' 個');
console.log('  URL ' + url + ' / 変化なし(膜へ飛ぶ) ' + sameJump + ' / 変化なし(ファイル扱い) ' + sameFile);
console.log('  ★飛べるようになった ' + fixed.length + ' 個 / ⚠後退 ' + broke.length + ' 個');
for (const f of fixed.slice(0, 40)) console.log('   ★L' + String(f.ln).padEnd(7) + '[' + f.kind + '] ' + f.label.slice(0, 24).padEnd(26) + '→ ' + f.target);
for (const f of broke) console.log('   ⚠L' + String(f.ln).padEnd(7) + '[' + f.kind + '] ' + f.label.slice(0, 24).padEnd(26) + '→ ' + f.target);
process.exit(broke.length ? 1 : 0);
