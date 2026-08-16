// 開発用ツール(vsix除外): **書式ボタンを、偽エディタで実際に押す**。
//
// v4.0.254(俊克 8/17 am00:31「早くやってよ」): 今日ずっと「測ってから直す」と言いながら、書式ボタンだけは
// 一度も実物を走らせていなかった。→ 文書を1本の文字列で持ち、editor.edit を本当に反映する偽エディタを作って
// `insertBoldItalic` / `insertFormatTemplate` を呼ぶ。押した後の**本文とFC行を、そのまま印字する**。
//
// 使い方:  node src/rig_fmt.js
const fs = require('fs'); const path = require('path'); const Module = require('module');

class P { constructor(l, c) { this.line = l; this.character = c; } translate(dl, dc) { return new P(this.line + (dl || 0), this.character + (dc || 0)); } }
class R {
  constructor(a, b, c, d) {
    if (typeof a === 'object') { this.start = a; this.end = b; }
    else { this.start = new P(a, b); this.end = new P(c, d); }
  }
  get isEmpty() { return this.start.line === this.end.line && this.start.character === this.end.character; }
}
class S extends R {
  constructor(a, b, c, d) { super(a, b, c, d); this.active = this.end; this.anchor = this.start; }
}
class Doc {
  constructor(text) { this.text = text; this.version = 1; this.languageId = 'markdown'; this.eol = 1; this.uri = { toString: () => 'file:///rig.md', fsPath: '/rig.md', scheme: 'file' }; this.isUntitled = false; this.fileName = '/rig.md'; }
  get _l() { return this.text.split('\n'); }
  get lineCount() { return this._l.length; }
  lineAt(i) { const t = this._l[i] == null ? '' : this._l[i]; return { text: t, lineNumber: i, range: new R(i, 0, i, t.length), isEmptyOrWhitespace: !t.trim() }; }
  offsetAt(p) { const ls = this._l; let o = 0; for (let i = 0; i < p.line; i++) o += ls[i].length + 1; return o + p.character; }
  positionAt(o) { const ls = this._l; let n = 0; for (let i = 0; i < ls.length; i++) { if (o <= n + ls[i].length) return new P(i, o - n); n += ls[i].length + 1; } return new P(ls.length - 1, 0); }
  getText(r) { return r ? this.text.slice(this.offsetAt(r.start), this.offsetAt(r.end)) : this.text; }
  save() { return Promise.resolve(true); }
}
function mkEditor(text, selStart, selEnd) {
  const doc = new Doc(text);
  const ed = {
    document: doc,
    selection: new S(selStart, selEnd),
    get selections() { return [this.selection]; },
    set selections(v) { this.selection = v[0]; },
    visibleRanges: [new R(0, 0, doc.lineCount - 1, 0)],
    options: {}, viewColumn: 1,
    revealRange() { }, setDecorations() { },
    edit(cb) {
      const ops = [];
      cb({
        replace: (r, t) => ops.push({ s: doc.offsetAt(r.start), e: doc.offsetAt(r.end), t }),
        insert: (p, t) => ops.push({ s: doc.offsetAt(p), e: doc.offsetAt(p), t }),
        delete: (r) => ops.push({ s: doc.offsetAt(r.start), e: doc.offsetAt(r.end), t: '' }),
      });
      ops.sort((a, b) => b.s - a.s);
      for (const o of ops) doc.text = doc.text.slice(0, o.s) + o.t + doc.text.slice(o.e);
      doc.version++;
      return Promise.resolve(true);
    },
  };
  return ed;
}
let CUR = null;
const stub = {
  Position: P, Range: R, Selection: S,
  MarkdownString: class { constructor(v) { this.value = v; } }, ThemeColor: class { }, Diagnostic: class { },
  WorkspaceEdit: class { constructor() { this._o = []; } replace(u, r, t) { this._o.push({ r, t }); } delete(u, r) { this._o.push({ r, t: '' }); } insert(u, p, t) { this._o.push({ r: new R(p, p), t }); } },
  EventEmitter: class { constructor() { this.event = () => ({ dispose() { } }); } fire() { } dispose() { } },
  DecorationRangeBehavior: { ClosedClosed: 1, OpenOpen: 0, ClosedOpen: 2, OpenClosed: 3 },
  OverviewRulerLane: { Left: 1 }, EndOfLine: { LF: 1, CRLF: 2 }, DocumentLink: class { constructor(r) { this.range = r; } },
  DiagnosticSeverity: { Hint: 3 }, CodeActionKind: { QuickFix: 'quickfix' }, TextDocumentChangeReason: { Undo: 1, Redo: 2 },
  Uri: { file: (p) => ({ toString: () => 'file://' + p, fsPath: p }), parse: (s) => ({ toString: () => s }) },
  window: {
    get activeTextEditor() { return CUR; },
    createTextEditorDecorationType: (o) => ({ __opts: o, dispose() { } }),
    showInformationMessage() { }, showWarningMessage() { }, showErrorMessage() { }, setStatusBarMessage() { },
    showTextDocument: (d, o) => Promise.resolve(CUR),
    createStatusBarItem: () => ({ show() { }, hide() { }, dispose() { } }),
    createOutputChannel: () => ({ appendLine() { }, dispose() { } }),
    onDidChangeActiveTextEditor: () => ({ dispose() { } }), onDidChangeTextEditorSelection: () => ({ dispose() { } }),
    onDidChangeTextEditorVisibleRanges: () => ({ dispose() { } }), registerWebviewViewProvider: () => ({ dispose() { } }),
  },
  workspace: {
    getConfiguration: () => ({ get: (k, d) => d, update() { } }), textDocuments: [], workspaceFolders: [],
    applyEdit: (we) => { const ed = CUR; return ed.edit(eb => { for (const o of we._o) eb.replace(o.r, o.t); }); },
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
const TMP = path.join(require('os').tmpdir(), 'meos_rig_fmt_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { insertBoldItalic, insertFormatTemplate, meosStarMarks, meosSplitMarkForSegment };\n', 'utf8');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }

(async () => {
  // (1) の状態= 全体が *** で包まれ、真下にFC行が1本
  const body = '***ハイライトと太字とイタリックと太字とイタリック***';
  const fc = process.env.FC || '<!-- Mew!FC ***not (白/黄) -->';
  const text = body + '\n' + fc + '\n';
  const a = body.indexOf('太字'), b = a + 2;                    // 「太字」を選ぶ
  CUR = mkEditor(text, new P(0, a), new P(0, b));
  console.log('押す前  本文: ' + body);
  console.log('        FC  : ' + fc);
  console.log('        選択: ' + JSON.stringify(body.slice(a, b)));
  const want = '***ハイライトと******太字******とイタリックと太字とイタリック***';
  await T.insertBoldItalic(CUR, true, true, '白', '青');        // ☑太字 ☑イタリック で押す
  let out = CUR.document.text.split('\n');
  console.log('【太字/斜体の道】本文: ' + out[0]);
  console.log('                 FC  : ' + out[1]);
  console.log(out[0] === want ? '  ★ 期待どおり(3分割)' : '  ⚠ 期待と違う');

  // ★俊克の(1)は「□太字 □イタリック」=両方オフ= **ハイライトの道**を通る
  CUR = mkEditor(text, new P(0, a), new P(0, b));
  await T.insertFormatTemplate('highlight', CUR, '白', '青');
  out = CUR.document.text.split('\n');
  console.log('【ハイライトの道】本文: ' + out[0]);
  console.log('                 FC  : ' + out[1]);
  console.log(out[0] === want ? '  ★ 期待どおり(3分割)' : '  ⚠ 期待と違う');
})();
