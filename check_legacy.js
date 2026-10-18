// 開発用ツール(vsix除外): 🏛 デジタル遺産膜(v5.1.37)を確かめる。
//   extension.js を**そのまま**読み込み、包む/開ける・偽の遺伝子・ネット時刻の多数決・表示する行・顔の字を見る。
// 使い方:  node src/check_legacy.js
const fs = require('fs'); const path = require('path'); const Module = require('module');
class Position { constructor(l, c) { this.line = l; this.character = c; } }
class Range { constructor(a, b, c, d) { if (a instanceof Position) { this.start = a; this.end = b; } else { this.start = new Position(a, b); this.end = new Position(c, d); } } }
const D = () => ({ dispose() { } });
const DISK = new Map(); // path -> Buffer
const stub = {
  Position, Range, MarkdownString: class { constructor(v) { this.value = v; } }, ThemeColor: class { },
  Diagnostic: class { }, EventEmitter: class { constructor() { this.event = () => D(); } fire() { } dispose() { } },
  DecorationRangeBehavior: { ClosedClosed: 1, OpenOpen: 0, ClosedOpen: 2, OpenClosed: 3 }, OverviewRulerLane: { Left: 1, Center: 2, Right: 4, Full: 7 },
  EndOfLine: { LF: 1, CRLF: 2 }, DiagnosticSeverity: { Hint: 3 }, CodeActionKind: { QuickFix: 'quickfix' },
  FileChangeType: { Changed: 1 }, FileSystemError: { NoPermissions: (m) => new Error(m) },
  Uri: { file: (p) => ({ toString: () => 'file://' + p, fsPath: p, path: p, scheme: 'file' }), from: (o) => ({ toString: () => o.scheme + ':' + o.path, path: o.path, scheme: o.scheme }) },
  window: {
    createTextEditorDecorationType: () => ({ dispose() { } }), activeTextEditor: null, visibleTextEditors: [],
    showInformationMessage() { }, showWarningMessage() { }, showErrorMessage() { }, setStatusBarMessage() { },
    createStatusBarItem: () => ({ show() { }, hide() { }, dispose() { } }),
    onDidChangeActiveTextEditor: () => D(), onDidChangeTextEditorSelection: () => D(), onDidChangeTextEditorVisibleRanges: () => D(), registerWebviewViewProvider: () => D(),
  },
  workspace: {
    getConfiguration: () => ({ get: (k, d) => d, update() { } }), textDocuments: [], workspaceFolders: [],
    onDidChangeTextDocument: () => D(), onDidSaveTextDocument: () => D(), onDidOpenTextDocument: () => D(), onDidChangeConfiguration: () => D(),
    fs: {
      readFile: async (u) => { if (!DISK.has(u.path)) throw new Error('ENOENT'); return new Uint8Array(DISK.get(u.path)); },
      writeFile: async (u, b) => { DISK.set(u.path, Buffer.from(b)); },
      stat: async (u) => ({ type: 1, ctime: 0, mtime: 100, size: (DISK.get(u.path) || []).length }),
    },
  },
  languages: { createDiagnosticCollection: () => ({ set() { }, clear() { }, delete() { }, dispose() { } }), registerDocumentLinkProvider: () => D(), registerCodeActionsProvider: () => D(), registerHoverProvider: () => D() },
  commands: { registerCommand: () => D(), executeCommand: () => Promise.resolve() }, env: { clipboard: { writeText: () => Promise.resolve() } },
  ExtensionMode: { Test: 3 }, TextEditorRevealType: { InCenter: 2 }, StatusBarAlignment: { Left: 1, Right: 2 }, ViewColumn: { One: 1 },
};
const origLoad = Module._load;
Module._load = function (r) { if (r === 'vscode') return stub; return origLoad.apply(this, arguments); };
const SRC = path.join(__dirname, 'extension.js');
const TMP = path.join(require('os').tmpdir(), 'meos_check_legacy_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + `
module.exports.__t = { meosLegacySeal, meosLegacyUnseal, meosLegacyGenes, meosLegacyRead, meosLegacyNetAgree, meosLegacyRows, meosLegacyBadgeRowFor, meosClockBadgeRow, meosLegacyFace, meosLegacyLeft, encodeHyperTocLine, meosEncryptText, _MEOS_ENC_PREFIX, _meosLegacyNetDue };
`);
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }
let fail = 0;
const ok = (c, m) => { console.log((c ? '  ok  ' : '  NG  ') + m); if (!c) fail++; };
const crypto = require('crypto');
const K = crypto.randomBytes(32), K2 = crypto.randomBytes(32);
const NAME = '1年タイマー:鍵を表示_20261018S092103JST';
const now = Date.now();
const obj = { v: 1, n: NAME, k: '合言葉🔑abc', d: now + 3 * 86400000, t: 365 * 86400000, s: now };
// ① 包む/開ける
const g1 = T.meosLegacySeal(K, obj);
ok(/^[0-9a-f]+$/.test(g1), '遺伝子は16進');
ok((T.meosLegacyUnseal(K, g1) || {}).k === obj.k, '同じ鍵で開ける');
ok(T.meosLegacyUnseal(K2, g1) === null, '別の機械の鍵では開かない');
const bad = g1.slice(0, -2) + (g1.slice(-2) === '00' ? '01' : '00');
ok(T.meosLegacyUnseal(K, bad) === null, '1字でも書き換えたら開かない(期限の早送り不可)');
// ② 偽の遺伝子
const genes = T.meosLegacyGenes(K, obj);
ok(genes.length === 11, '本物1つ＋偽物10個');
ok(new Set(genes.map(x => x.length)).size === 1, '全部同じ長さ(見分けが付かない)');
ok((T.meosLegacyRead(K, genes, NAME) || {}).k === obj.k, '並びの中から本物を見つける');
ok(T.meosLegacyRead(K, genes, '別の膜') === null, '別の膜の名前では開かない');
ok(T.meosLegacyRead(K2, genes, NAME) === null, '別の鍵では、どれも開かない');
// ③ ネット時刻の多数決
const t0 = 1800000000000;
ok(T.meosLegacyNetAgree([t0, t0 + 1000, null], 300000) !== null, '2か所が揃えば信じる');
ok(T.meosLegacyNetAgree([t0, null, null], 300000) === null, '1か所だけなら信じない');
ok(T.meosLegacyNetAgree([t0, t0 + 3600000, null], 300000) === null, '2か所が1時間違えば信じない');
const ag = T.meosLegacyNetAgree([t0, t0 + 2000, t0 + 86400000 * 400], 300000);
ok(ag !== null && Math.abs(ag - t0) < 5000, '1か所だけ狂っていても、揃った2か所を採る');
// ④ 表示する行(俊克の見本そのまま)
const meta = { tabs: [{ id: 't', name: 'Hyper TOC', items: [] }], activeIdx: 0, legacy: { [NAME]: genes } };
const lines = [
  '# test',
  '<!-- {* ▼mCN=A銀行のデジタル遺産_20261018S092008JST // comment1 *} -->',
  '',
  '<!-- {* ▼mCN=' + NAME + ' // この膜を暗号化する *} -->',
  T._MEOS_ENC_PREFIX + T.meosEncryptText('A銀行のIDとパスワード', obj.k),
  '<!-- {* ▲mCN=' + NAME + ' // comment2 *} -->',
  '<!-- Mew!UFC mCN (📊⊕0+0D-3Y) -->',
  '',
  '<!-- {* ▲mCN=A銀行のデジタル遺産_20261018S092008JST // comment2 *} -->',
  '<!-- Mew!FC mCN (📊⊕0+0D-2Y) -->',
  '↑この上のバッジに残り時間と鍵を表示する｡',
  '<!-- {* ▼mCN=mMETA // MeOS metadata — do not edit (📊⊖f0+0D0W) *} -->',
  null,
  '<!-- {* ▲mCN=mMETA // end *} -->',
];
lines[12] = T.encodeHyperTocLine(meta, { languageId: 'markdown' });
const doc = { version: 1, uri: { toString: () => 'file:///legacy.md', scheme: 'file', path: '/legacy.md' }, languageId: 'markdown', lineCount: lines.length, lineAt: (i) => ({ text: lines[i] }), getText: () => lines.join('\n') };
const lr = T.meosLegacyRows(doc);
ok(lr.rows.size === 1 && lr.rows.has(9), '表示は親膜のバッジ行(10行目)');
ok(T.meosLegacyBadgeRowFor(doc, 8) === 9, '親膜の閉じ膜(9行目)から、そのバッジ行を引ける');
ok(T.meosClockBadgeRow(doc, { end: 8 }) === 9, '⏰と同じ判定で「畳まない」になる');
ok(T.meosClockBadgeRow(doc, { end: 5 }) === -1, '子のバッジ行は今までどおり(⏰が無ければ畳む)');
// ⑤ 顔の字
const f1 = T.meosLegacyFace(doc, NAME, genes, K);
ok(/Key shows in 3 days/.test(f1.text) && !f1.key, '期限前= あと何日(' + f1.text + ')');
ok(f1.text.indexOf(obj.k) < 0, '期限前は合言葉を出さない');
const f0 = T.meosLegacyFace(doc, NAME, genes, null);
ok(/does not hold its key/.test(f0.text), 'MeOSの鍵が無い機械では、その旨だけ');
const past = Object.assign({}, obj, { d: now - 1000 });
const gp = T.meosLegacyGenes(K, past);
T._meosLegacyNetDue.add('file:///legacy.md ' + NAME + ' ' + past.d);
const f2 = T.meosLegacyFace(doc, NAME, gp, K);
ok(f2.key && f2.text.indexOf(obj.k) >= 0, '期限が来てネットでも確かめた= 合言葉を出す(' + f2.text + ')');
ok(T.meosLegacyLeft(90 * 1000) === '2 min' && T.meosLegacyLeft(400 * 86400000) === '400 days', '残りの書き方');
console.log(fail ? ('\nNG ' + fail) : '\nALL PASS');
process.exit(fail ? 1 : 0);
