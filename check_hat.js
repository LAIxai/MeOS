// 開発用ツール(vsix除外): 帽子(印)記法の検査。写経せず extension.js の関数をそのまま呼ぶ。
//
// v4.0.229(俊克 8/16 記法確定: `a↑<(..)>` / 控え `a↑👒<(..)>` / 下側はv5.0)
// 見るのは3つ:
//   ①押した時に何が起きるか(meosHatBeforeCursor)  ②控えから字を読み戻せるか(meosHatFromToken)
//   ③控えの文字列that自分でHTMLコメントを終わらせないか(`-->` を含まない)
// ★「帽子にしない」ことを確かめる行thatこの検査の主役= `a↑'`(プライム)と `x↑o`(度)は普通の上付きに戻す。
//
// 使い方:  node src/check_hat.js
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
const TMP = path.join(require('os').tmpdir(), 'meos_check_hat_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + '\nmodule.exports.__t = { meosHatBeforeCursor, meosHatFromToken, meosHatCompose, MEOS_HAT_MARK, MEOS_MEW_SIG, MEOS_METEX_TAIL_RE };\n', 'utf8');
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }

let ng = 0;
const ok = (cond, label, got) => { console.log((cond ? '  ok  ' : ' NG   ') + label + (cond ? '' : '   ← ' + JSON.stringify(got))); if (!cond) ng++; };

console.log('① ボタンを押した時(本文の直前を見る)');
const hb = (s) => T.meosHatBeforeCursor(s);
ok(hb('a↑<(..)>') && hb('a↑<(..)>').ch === 'ä', '`a↑<(..)>` → ä', hb('a↑<(..)>'));
ok(hb('a↑<(--)>') && hb('a↑<(--)>').ch === 'ā', '`a↑<(--)>` → ā', hb('a↑<(--)>'));
ok(hb('T↑<(^)>') && hb('T↑<(^)>').ch === 'T̂', '`T↑<(^)>` → T̂', hb('T↑<(^)>'));
ok(hb('θ↑<(^)>') && hb('θ↑<(^)>').base === 'θ', '基準は非ASCIIでもよい(θ)', hb('θ↑<(^)>'));
ok(hb('文は続く a↑<(o)>') && hb('文は続く a↑<(o)>').ch === 'å', '文の途中でも直前だけ見る', hb('文は続く a↑<(o)>'));
console.log('   ★ここから「帽子にしない」= v4.0.229の主役');
ok(hb("a↑'") === null, "`a↑'` は帽子でない(プライム a′ が書ける)", hb("a↑'"));
ok(hb('x↑o') === null, '`x↑o` は帽子でない(度 x° が書ける)', hb('x↑o'));
ok(hb('10↑-') === null, '`10↑-` は帽子でない(負の指数)', hb('10↑-'));
ok(hb('a↑(..)') === null, '`a↑(..)` は帽子でない(括弧だけ=累乗 a↑(n+1) と同じ形)', hb('a↑(..)'));
ok(hb('a↓<(,)>') === null, '`a↓<(,)>` は v4.0 では帽子でない(下側はv5.0)', hb('a↓<(,)>'));
ok(hb('a↑<(zz)>') === null, '知らない名前は何もしない', hb('a↑<(zz)>'));

console.log('④ 既に上付き/下付きそのものなら、書き足さず名乗りだけ出す(v4.0.230)');
const tail = (s) => { const m = T.MEOS_METEX_TAIL_RE.exec(s); return m ? m[0] : null; };
ok(tail("a↑'") === "↑'", "`a↑'` の右で押す → 二重にせず `↑'` を名乗る", tail("a↑'"));
ok(tail('x↑o') === '↑o', '`x↑o` → `↑o` を名乗る', tail('x↑o'));
ok(tail('10↑-3') === '↑-3', '`10↑-3` → `↑-3` を名乗る', tail('10↑-3'));
ok(tail('a↑(..)') === '↑(..)', '`a↑(..)` → `↑(..)` を名乗る', tail('a↑(..)'));
ok(tail('a↓3') === '↓3', '下付きも同じ', tail('a↓3'));
ok(tail('x') === null, '普通の字の後は今まで通り新しく作る', tail('x'));
ok(tail('a↑') === null, '矢印だけ(中身なし)は名乗らない', tail('a↑'));
ok(tail('a↑2 とか b') === null, '離れた上付きは巻き込まない', tail('a↑2 とか b'));
ok(tail('a↑2とか') === null, '散文が続く時は巻き込まない(ASCIIだけ見る)', tail('a↑2とか'));

console.log('② 控えから読み戻す');
const ft = (t) => T.meosHatFromToken(t);
ok(ft('a↑👒<(..)>') && ft('a↑👒<(..)>').ch === 'ä', '新形 `a↑👒<(..)>` → ä', ft('a↑👒<(..)>'));
ok(ft('a↑^👒') === null, '旧形 `a↑^👒` は読まない(v4.0.230で切り捨て)', ft('a↑^👒'));
ok(ft('a↑(..)👒') === null, '旧形 `a↑(..)👒` は読まない(v4.0.230で切り捨て)', ft('a↑(..)👒'));
ok(ft('a↑2') === null, '帽子でない控えは null', ft('a↑2'));

console.log('③ 控えの文字列が自分でコメントを終わらせないか');
for (const mk of ['..', '.', '--', '-', '^', 'o', 'v', '~', ',', "'"]) {
  const rec = '<!-- ' + T.MEOS_MEW_SIG + ' a↑' + T.MEOS_HAT_MARK + '<(' + mk + ')> (白/橙) -->';
  ok(rec.indexOf('-->') === rec.length - 3, '`<(' + mk + ')>` の控えは末尾まで閉じない', rec);
}
console.log(ng ? ('NG ' + ng + ' 件') : 'すべて通った');
process.exit(ng ? 1 : 0);
