// 開発用ツール(vsix除外): 🔐暗号の仮想化(v5.1.0)の往復を確かめる。
//   extension.js を**そのまま**読み込み、本物の入口(MeosVaultFs)を、メモリ上のディスクに向けて動かす。
//   ★見る所= ディスクに平文が一度も書かれないこと／書いて読み直すと同じ中身に戻ること／守り①②③が書かずに止めること。
// 使い方:  node src/check_vault.js
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
const TMP = path.join(require('os').tmpdir(), 'meos_check_vault_' + process.pid + '.js');
fs.writeFileSync(TMP, fs.readFileSync(SRC, 'utf8') + `
module.exports.__t = { MeosVaultFs, meosEncryptText, meosDecryptText, _vaultKeys, _vaultSeen, _vaultPairs, _MEOS_ENC_PREFIX };
`);
let T; try { T = require(TMP).__t; } finally { try { fs.unlinkSync(TMP); } catch (_) { } }

let fail = 0;
const ok = (c, m) => { console.log((c ? '  ok  ' : '  NG  ') + m); if (!c) fail++; };
const P = '/diary.md', VU = { path: P, scheme: 'meos-vault', toString: () => 'meos-vault:' + P }, KEY = 'file://' + P;
const vfs = new T.MeosVaultFs();
const disk = () => DISK.get(P).toString('utf8');
const SECRET_A = 'PIN 4321 銀行🏦', SECRET_B = '2FA seed JBSWY3DPEHPK3PXP';
(async () => {
  // 外の膜Aの中に、別の合言葉で暗号化した膜B(入れ子=二重膜)
  const bBody = SECRET_B;
  const aBody = ['a1 ' + SECRET_A, '// {▼mCN=B_secret // inner}', T._MEOS_ENC_PREFIX + T.meosEncryptText(bBody, 'passB'), '// {▲mCN=B_secret //}', 'a2 end'].join('\n');
  const head = '# diary\n// {▼mCN=A_vault // outer}\n';
  const tail = '\n// {▲mCN=A_vault //}\nafter\n';
  DISK.set(P, Buffer.from(head + T._MEOS_ENC_PREFIX + T.meosEncryptText(aBody, 'passA') + tail));
  ok(T._vaultPairs(disk().split('\n')).length === 1, '膜Aを数える口が見つける(施錠中=3行)');

  // 鍵なし: そのまま
  ok((await vfs.readFile(VU)).toString() === disk(), '鍵なしで読む= ディスクのまま(暗号文)');
  // Aを解錠
  T._vaultKeys.set(KEY, new Map([['A_vault', 'passA']])); T._vaultSeen.set(KEY, new Set(['A_vault']));
  let view = (await vfs.readFile(VU)).toString();
  ok(view.includes(SECRET_A) && !view.includes(SECRET_B) && view.includes('B_secret'), 'Aだけ解錠= Aの平文が見え、Bは暗号文のまま');
  // 編集して書く
  view = view.replace('a2 end', 'a2 edited ✍️');
  await vfs.writeFile(VU, Buffer.from(view));
  ok(!disk().includes(SECRET_A) && !disk().includes('edited') && !disk().includes(SECRET_B), '書いた後のディスクに平文が無い');
  ok((await vfs.readFile(VU)).toString() === view, '読み直すと編集した平文に戻る');
  // Bも解錠
  T._vaultKeys.get(KEY).set('B_secret', 'passB'); T._vaultSeen.get(KEY).add('B_secret');
  view = (await vfs.readFile(VU)).toString();
  ok(view.includes(SECRET_B), 'Bも解錠= 入れ子の中も開く');
  view = view.replace(SECRET_B, SECRET_B + ' v2');
  await vfs.writeFile(VU, Buffer.from(view));
  ok(!disk().includes(SECRET_B) && !disk().includes(SECRET_A), '入れ子を書いてもディスクは暗号文');
  // Aの暗号の中身に、Bが暗号文のまま入っている(内側から暗号化)
  const blobA = disk().split('\n').find(l => l.startsWith(T._MEOS_ENC_PREFIX)).slice(T._MEOS_ENC_PREFIX.length);
  const innerA = T.meosDecryptText(blobA, 'passA');
  ok(innerA.includes('B_secret') && !innerA.includes(SECRET_B) && innerA.includes(T._MEOS_ENC_PREFIX), '外の暗号の中で、Bは自分の合言葉で暗号化されたまま');
  ok((await vfs.readFile(VU)).toString() === view, '二重でも往復で同じ中身');
  // 守り②: 名前を変えた
  const before = disk();
  let threw = false; try { await vfs.writeFile(VU, Buffer.from(view.split('A_vault').join('A_renamed'))); } catch (_) { threw = true; }
  ok(threw && disk() === before, '守り② 解錠中の膜の名前を変えたら書かない(ディスクは前のまま)');
  // 施錠(鍵を捨てる)→ エディターに平文が残ったまま書こうとした(Undo等)
  T._vaultKeys.delete(KEY);
  ok(!(await vfs.readFile(VU)).toString().includes(SECRET_A), '施錠後に読む= 暗号文の姿');
  threw = false; try { await vfs.writeFile(VU, Buffer.from(view)); } catch (_) { threw = true; }
  ok(threw && disk() === before, '守り① 施錠後に平文が書かれそうになったら書かない');
  // 鍵なし・平文の膜なし= そのまま書ける(普通の編集)
  const plainEdit = disk().replace('after', 'after (edited while locked)');
  await vfs.writeFile(VU, Buffer.from(plainEdit));
  ok(disk() === plainEdit, '施錠中でも暗号の外は普通に書ける');
  // CRLF
  T._vaultKeys.set(KEY, new Map([['A_vault', 'passA']]));
  DISK.set(P, Buffer.from(disk().split('\n').join('\r\n')));
  view = (await vfs.readFile(VU)).toString();
  ok(view.includes('\r\n') && !/[^\r]\n/.test(view), 'CRLFのファイルはCRLFのまま見せる');
  await vfs.writeFile(VU, Buffer.from(view));
  ok(!/[^\r]\n/.test(disk()) && !disk().includes(SECRET_A), 'CRLFのまま暗号化して書く');
  ok((await vfs.readFile(VU)).toString() === view, 'CRLFでも往復で同じ');
  console.log(fail ? ('\n' + fail + ' 項目 NG') : '\n全項目 PASS');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
