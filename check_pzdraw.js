// 開発用ツール(vsix除外): v5.1.588 P1〜P6 の膜の描画(▼▲・札の色・幅)を本物の applyPrettyLabels で確かめる。元の台= check_rulers.js
//
// v4.0.215(俊克 8/15「①表の整形が凸凹に見える」): 表の整形は「画面に見えている幅」でセルを詰める(v4.0.74)。
// so **描く側(装飾)と幅を測る側(整形)that同じ形を見ていない**と、隠れる字の数が食い違い、`|` thatセルごとに
// 前後して**凸凹**に見える。ここは、その2つを実データで突き合わせて食い違いを出す。
//
// ★やり方= **写経しない**。VS Codeのスタブを噛ませて extension.js を**そのまま読み込み**、
//   ①装飾の関数を実際に呼んで「画面で隠れる範囲」を受け取る ②整形that使う meosStrWidth と比べる。
//   → 正規表現をテスト側に書き写すと「本体と食い違っても気づけない」= [[reference_headless_vscode_stub_harness]]
//
// 使い方:  node src/check_rulers.js <測るmdファイル>            (既定=同梱のサンプル行)
//   食い違いthat在れば一覧を出して exit 1。
//
// ★注意= ここthat見るのは**幅**だけ。実際の見た目(色/太さ/折り返し)は実機で見ること。
const fs = require('fs');
const path = require('path');
const Module = require('module');

// ---- vscode スタブ(装飾の型と範囲thatあれば足りる) ---------------------------------------------
class Position { constructor(line, character) { this.line = line; this.character = character; } }
class Range {
  constructor(a, b, c, d) {
    if (a instanceof Position) { this.start = a; this.end = b; } else { this.start = new Position(a, b); this.end = new Position(c, d); }
  }
}
const stub = {
  Position, Range,
  MarkdownString: class { constructor(v) { this.value = v; } },
  ThemeColor: class { constructor(id) { this.id = id; } },
  Diagnostic: class { constructor(r, m, s) { this.range = r; this.message = m; this.severity = s; } },
  EventEmitter: class { constructor() { this.event = () => ({ dispose() { } }); } fire() { } dispose() { } },
  DecorationRangeBehavior: { ClosedClosed: 1, OpenOpen: 0, ClosedOpen: 2, OpenClosed: 3 },
  OverviewRulerLane: { Left: 1, Center: 2, Right: 4, Full: 7 },
  EndOfLine: { LF: 1, CRLF: 2 },
  DiagnosticSeverity: { Hint: 3, Information: 2, Warning: 1, Error: 0 },
  CodeActionKind: { QuickFix: 'quickfix' },
  Uri: { file: (p) => ({ toString: () => 'file://' + p, fsPath: p }) },
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
Module._load = function (request) { if (request === 'vscode') return stub; return origLoad.apply(this, arguments); };

const SRC = path.join(__dirname, 'extension.js');
const TMP = path.join(require('os').tmpdir(), 'meos_check_pzdraw_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { makeDecorations, applyPrettyLabels, meosPuzzleFSet, setCtx: (c) => { extensionContext = c; } };\n', 'utf8');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }
const gs = new Map(); T.setCtx({ globalState: { get: (k, d) => gs.has(k) ? gs.get(k) : d, update: (k, v) => { gs.set(k, v); return Promise.resolve(); } }, globalStorageUri: { fsPath: '/tmp/x/y' } });
// ---- 偽エディタ(範囲を無視しない=v4.0.214の教訓「試験装置that嘘をつく」) -------------------------
let seq = 0;
function makeEditor(lines) {
  const id = ++seq; // 版ごとに別のURI=本体のキャッシュを跨がせない(同じURIだと2つ目以降thatキャッシュで素通りする)
  const doc = {
    languageId: 'markdown', lineCount: lines.length, version: 1, eol: 1,
    uri: { toString: () => 'file:///check' + id + '.md', fsPath: '/check' + id + '.md', scheme: 'file' }, fileName: '/check' + id + '.md',
    lineAt: (i) => { const n = (typeof i === 'number') ? i : i.line; const text = lines[n] == null ? '' : lines[n];
      return { text, lineNumber: n, range: new Range(n, 0, n, text.length), rangeIncludingLineBreak: new Range(n, 0, n, text.length),
        firstNonWhitespaceCharacterIndex: text.length - text.replace(/^\s+/, '').length, isEmptyOrWhitespace: text.trim() === '' }; },
    getText: (r) => { if (!r) return lines.join('\n'); const a = r.start, b = r.end;
      if (a.line === b.line) return (lines[a.line] || '').slice(a.character, b.character);
      const out = [(lines[a.line] || '').slice(a.character)];
      for (let i = a.line + 1; i < b.line; i++) out.push(lines[i] || '');
      out.push((lines[b.line] || '').slice(0, b.character)); return out.join('\n'); },
    offsetAt: (p) => { let o = 0; for (let i = 0; i < p.line; i++) o += (lines[i] || '').length + 1; return o + p.character; },
    positionAt: (off) => { let o = 0; for (let i = 0; i < lines.length; i++) { const L = (lines[i] || '').length + 1; if (off < o + L) return new Position(i, off - o); o += L; } return new Position(Math.max(0, lines.length - 1), 0); },
    validateRange: (r) => r, validatePosition: (p) => p, save: () => Promise.resolve(true),
  };
  const last = Math.max(0, lines.length - 1), pos = new Position(last, 0);
  const sel = { active: pos, anchor: pos, start: pos, end: pos, isEmpty: true }; // カーソルは測る表の外に置く(カーソル行は生表示)
  const calls = [];
  return { document: doc, selection: sel, selections: [sel], visibleRanges: [new Range(0, 0, last, 0)], options: {},
    setDecorations: (deco, items) => calls.push({ deco, items: items || [] }), __calls: calls };
}

let ng = 0; const ok = (c, l, g) => { console.log((c ? '  ok  ' : ' NG   ') + l + (c ? '' : '   ← ' + JSON.stringify(g))); if (!c) ng++; };
const R = '<!-- Mew!UFC --- -->';
const P1O = '<!-- {* ▼mP1=M_20261108S100001JST //  *} -->', P1C = '<!-- {* ▲mP1=M_20261108S100002JST //  *} -->';
const P1a = '<!-- {* ▶◀mP1=M_20261101S090000JST // 古い印 *} -->', P6a = '<!-- {* ▶◀mP6=k_20261101S090000JST //  *} -->';
const H1 = '<!-- {* ♥️▼mP7=f_20261108S005813JST //  *} -->', H2 = '<!-- {* ♥️▲mP7=f_20261108S005814JST //  *} -->';
const P1t = '<!-- {* 🚥mP1=M_20261109S090000JST //  *} -->';   // v5.1.636: 新しい中継点
const lines = ['外0', P1O, R, P1t, P1a, '', R, P1C, P6a, H1, R, '<!-- {* ♥️🚥mP7=f_20261109S000001JST //  *} -->', '', R, H2, '終'];   // v5.1.637: 11= ♥の中間
const ed = makeEditor(lines); T.makeDecorations();
T.meosPuzzleFSet(ed.document, 1, 'M_20261108S100001JST'); T.meosPuzzleFSet(ed.document, 7, 'f_20261108S005813JST');
T.applyPrettyLabels(ed);
const at = (ln) => { const out = []; for (const c of ed.__calls) for (const it of c.items) { const r = it && it.range; if (r && r.start && r.start.line === ln && it.renderOptions && it.renderOptions.before && it.renderOptions.before.contentText) out.push({ col: r.start.character, ...it.renderOptions.before }); } return out; };
const show = (ln) => at(ln).map(o => o.col + ':' + o.contentText + ' ' + (o.color || '') + ' / ' + (o.backgroundColor || '') + ' / ' + String(o.textDecoration || '').slice(0, 110)).join('\n      ');
for (const ln of [1, 4, 7, 8, 9, 14]) console.log('  [' + ln + '] ' + show(ln));
const o1 = at(1), c1 = at(7), r4 = at(4), k8 = at(8), h9 = at(9), t3 = at(3), m11 = at(11);
ok(m11.some(o => o.contentText === '🚥♥' && /cursor: image-set/.test(o.textDecoration)) && !m11.some(o => o.contentText === '▼' || o.contentText === '▲'), '★♥️🚥mP7= 🚥♥の札・手(v5.1.637)', m11);
ok(o1.some(o => o.contentText === '▼' && o.col === 0) && o1.some(o => o.contentText === 'P1' && o.col === 1 && /rgba\(229, 57, 53/.test(o.color) && /width: 1\.68em; margin-left: 1\.68em/.test(o.textDecoration)), '開始 P1= 緑▼(桁0)＋赤い札(桁1・♥と同じ幅)', o1);
ok(c1.some(o => o.contentText === '▲') && c1.some(o => o.contentText === 'P1' && o.col === 1), '閉じ P1= 青▲＋札', c1);
ok(!r4.some(o => o.contentText === '▼' || o.contentText === '▲') && r4.some(o => o.contentText === '🚥P1' && o.col === 0 && /rgba\(229, 57, 53/.test(o.color)), '★古い▶◀の中継点 P1= ▼▲なし・🚥P1の赤い札(v5.1.636)', r4);
ok(!t3.some(o => o.contentText === '▼' || o.contentText === '▲') && t3.some(o => o.contentText === '🚥P1' && o.col === 0 && /cursor: image-set/.test(o.textDecoration)), '★🚥mP1= 🚥P1の札・手(押せる)', t3);
ok(k8.some(o => o.contentText === 'P6' && /rgba\(194, 24, 91/.test(o.color)) && !k8.some(o => o.contentText === '▼'), '古いP6(1本)= 桃の札・▼なし', k8);
ok(h9.some(o => o.contentText === '▼') && h9.some(o => o.contentText === '♥' && /clip-path/.test(o.textDecoration)), '♥膜は今まで通り', h9);
const gG = o1.find(o => o.contentText === '▼').color, gB = c1.find(o => o.contentText === '▲').color, hG = h9.find(o => o.contentText === '▼').color;
ok(gG === hG && gB && gB !== gG, '▼▲の色は♥と同じ緑と青', [gG, gB, hG]);
console.log(ng ? 'NG ' + ng : '全項目 PASS'); process.exit(0);
