// 開発用ツール(vsix除外): 見出し/箇条書きを🚫で外した時、真下のFC行の命令も一緒に落ちるか。
//
// v4.0.265(俊克 8/19 バグ1「見出しを🚫ボタンで解除したとき、FC膜が削除されない」)
// ★写経しない= extension.js の formatSpanAtCursor / meosDeleteLineSpecForMark を**そのまま呼ぶ**。
//   WorkspaceEdit だけ手元の記録係に差し替えて、編集の結果を文字列で見る。
// 使い方:  node src/check_headfc.js
const fs = require('fs'); const path = require('path'); const Module = require('module');
const stub = {
  Position: class { constructor(l, c) { this.line = l; this.character = c; } },
  Range: class { constructor(a, b, c, d) { if (typeof a === 'object') { this.start = a; this.end = b; } else { this.start = { line: a, character: b }; this.end = { line: c, character: d }; } } },
  MarkdownString: class { constructor(v) { this.value = v; } }, ThemeColor: class { }, Diagnostic: class { },
  EventEmitter: class { constructor() { this.event = () => ({ dispose() { } }); } fire() { } dispose() { } },
  DecorationRangeBehavior: { ClosedClosed: 1, OpenOpen: 0, ClosedOpen: 2, OpenClosed: 3 },
  OverviewRulerLane: { Left: 1 }, EndOfLine: { LF: 1, CRLF: 2 }, DocumentLink: class { constructor(r) { this.range = r; } },
  DiagnosticSeverity: { Hint: 3 }, CodeActionKind: { QuickFix: 'quickfix' },
  Uri: { file: (p) => ({ toString: () => 'file://' + p, fsPath: p }), parse: (s) => ({ toString: () => s }) },
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
const TMP = path.join(require('os').tmpdir(), 'meos_check_headfc_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { formatSpanAtCursor, meosFindLineSpecBelow, meosDeleteLineSpecForMark, meosIsSpecLine, meosRadicalSpans };\n', 'utf8');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }

let ng = 0;
const ok = (cond, label, got) => { console.log((cond ? '  ok  ' : ' NG   ') + label + (cond ? '' : '   ← ' + JSON.stringify(got))); if (!cond) ng++; };

// 手元の記録係(WorkspaceEdit のふり)。範囲を後ろから当てて、行の配列を実際に書き換える。
function makeDoc(lines) {
  return {
    uri: { toString: () => 'file:///t.md' }, languageId: 'markdown', lineCount: lines.length,
    lineAt: (n) => ({ text: lines[n], range: new stub.Range(n, 0, n, lines[n].length) }),
    getText: () => lines.join('\n'), eol: 1, fileName: '/t.md',
  };
}
function run(lines, curLine, curCh) {
  const doc = makeDoc(lines);
  const ed = { document: doc, selection: { active: new stub.Position(curLine, curCh), anchor: new stub.Position(curLine, curCh), isEmpty: true }, selections: [] };
  ed.selection.start = ed.selection.active; ed.selection.end = ed.selection.active;
  const span = T.formatSpanAtCursor(ed, 'heading');
  if (!span) return { span: null, out: lines.slice() };
  const edits = [];
  const we = { replace: (u, r, t) => edits.push({ r, t }), delete: (u, r) => edits.push({ r, t: '' }) };
  we.replace(doc.uri, span.range, span.body);
  T.meosDeleteLineSpecForMark(we, ed, span.range.start.line, span.drop || 'head');
  // 後ろから当てる(位置がずれない)。行をまたぐ削除は結合する。
  const out = lines.slice();
  edits.sort((a, b) => (b.r.start.line - a.r.start.line) || (b.r.start.character - a.r.start.character));
  for (const e of edits) {
    const s = e.r.start, t2 = e.r.end;
    if (s.line === t2.line) out[s.line] = out[s.line].slice(0, s.character) + e.t + out[s.line].slice(t2.character);
    else {
      const merged = out[s.line].slice(0, s.character) + e.t + out[t2.line].slice(t2.character);
      out.splice(s.line, t2.line - s.line + 1, merged);
      if (merged === '' && t2.character === 0) out.splice(s.line, 1);
    }
  }
  return { span, out };
}

console.log('① 見出し(FC形)を🚫 — 本文の `##` とFC行の `H2` が両方消える');
{
  const r = run(['## テストの見出し', '<!-- Mew!FC H2 (白/赤)//[]tip= -->', ''], 0, 5);
  ok(!!r.span, '見出しとして掴める', r.span);
  ok(r.out[0] === 'テストの見出し', '本文から `## ` が落ちる', r.out[0]);
  ok(!T.meosIsSpecLine(r.out[1] || ''), 'FC行は残っていない', r.out);
}
console.log('② 最後の行が見出しでも落ちる(真下のFC行が最終行)');
{
  const r = run(['## 最後の見出し', '<!-- Mew!FC H2 (白/赤) -->'], 0, 3);
  ok(r.out.length === 1 && r.out[0] === '最後の見出し', 'FC行ごと消える', r.out);
}
console.log('③ 箇条書きと同居(`-1.H2`) — 見出しだけ外し、箇条書きの命令は残す');
{
  const r = run(['1. ## 見出し付きの項目', '<!-- Mew!FC -1.H2 (白/緑)//tip -->'], 0, 8);
  ok(r.out[0] === '1. 見出し付きの項目', '`- `/`1. ` は残る', r.out[0]);
  ok(/-1\./.test(r.out[1] || '') && !/H2/.test(r.out[1] || ''), 'FC行は箇条書きの命令だけ残る', r.out[1]);
}
console.log('④ FC行に他の指定が並んでいる — 見出しの1つだけ落とす');
{
  const r = run(['## 見出しの中の**太字**です', '<!-- Mew!FC H2 (白/赤) --><!-- Mew!FC ** (白/青) -->'], 0, 4);
  ok(!/H2/.test(r.out[1] || ''), '見出しの指定は消える', r.out[1]);
  ok(/\*\* \(白\/青\)/.test(r.out[1] || ''), '太字の指定は残る', r.out[1]);
}
console.log('⑤ 巻き添えが無いこと — FC行が無い普通の見出しは今まで通り');
{
  const r = run(['## FCの無い見出し', 'ただの次の行'], 0, 4);
  ok(r.out[0] === 'FCの無い見出し' && r.out[1] === 'ただの次の行', '次の行に手を出さない', r.out);
}
console.log('⑥ 箇条書きだけ(`-1.`)を🚫 — FC行も一緒に落ちる');
{
  const r = run(['1. ただの項目', '<!-- Mew!FC -1. (白/緑) -->'], 0, 5);
  ok(r.out[0] === 'ただの項目', 'マーカーが落ちる', r.out[0]);
  ok(!T.meosIsSpecLine(r.out[1] || ''), 'FC行も落ちる', r.out);
}
console.log('⑦ √の横棒(バグ2の相手) — 見出しの中でも範囲を出す');
{
  const a = T.meosRadicalSpans('## √3 の見出し');
  ok(a.length === 1 && a[0].barStart === 4 && a[0].barEnd === 5, '`## √3` の 3 に棒を引く', a);
  const b = T.meosRadicalSpans('## √(x+1) の見出し');
  ok(b.length === 1 && b[0].hides.length === 2, '括弧形も見出しの中で成立', b);
}

console.log(ng ? ('NG ' + ng + ' 件') : '全部 ok');
process.exit(ng ? 1 : 0);
