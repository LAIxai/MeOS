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
module.exports.__t = { meosVaultBtnSpot, MeosVaultFs, meosEncryptText, meosDecryptText, _vaultKeys, _vaultSeen, _vaultPairs, _MEOS_ENC_PREFIX, _MEOS_SHIELD, _vaultShield, meosPassStrongEnough, meosEncLineShield, meosVeilMs, meosVeilPaint, meosVeilSet, getVeil: () => _meosVeilOn };
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
  // ★v5.1.84 守り②: 名前を変えた(開始と閉じの両方)= 鍵が新しい名前へ移り、暗号文で書く
  let threw = false;
  await vfs.writeFile(VU, Buffer.from(view.split('A_vault').join('A_renamed')));
  ok(!disk().includes(SECRET_A) && disk().includes('A_renamed') && T._vaultKeys.get(KEY).has('A_renamed') && !T._vaultKeys.get(KEY).has('A_vault'), 'v5.1.84 守り② 名前を変えたら鍵が移り、新しい名前で暗号化して書く(平文は出ない)');
  await vfs.writeFile(VU, Buffer.from(view));
  ok(!disk().includes(SECRET_A) && T._vaultKeys.get(KEY).has('A_vault'), '  名前を戻すと鍵も戻る');
  // 名前替えの途中(開始だけ変えた)= 中身が地の文になる= 書かない
  let before = disk();
  threw = false; try { await vfs.writeFile(VU, Buffer.from(view.replace('A_vault', 'A_half'))); } catch (_) { threw = true; }
  ok(threw && disk() === before, 'v5.1.84 名前替えの途中(開始と閉じが合わない)は書かない(ディスクは前のまま)');
  // 開始と閉じを別々の名前に(古い名前は残っていない)= 中身が地の文で残る= 書かない
  threw = false; try { await vfs.writeFile(VU, Buffer.from(view.replace('A_vault', 'A_x').replace('A_vault', 'A_y'))); } catch (_) { threw = true; }
  ok(threw && disk() === before, 'v5.1.84 開始と閉じが別の名前= 膜が壊れて中身が地の文= 書かない');
  // 消した(開始から閉じまで)= 鍵を持ったまま書ける・貼り戻すとその鍵で暗号化
  { const vl = view.split('\n'); const a = vl.findIndex(l => l.includes('▼mCN=A_vault')), b = vl.findIndex(l => l.includes('▲mCN=A_vault'));
    const del = vl.slice(0, a).concat(vl.slice(b + 1)).join('\n');
    threw = false; try { await vfs.writeFile(VU, Buffer.from(del)); } catch (_) { threw = true; }
    ok(!threw && !disk().includes('A_vault') && !disk().includes(SECRET_A) && T._vaultKeys.get(KEY).has('A_vault'), 'v5.1.84 解錠中の膜を消した= 問わずに書く・鍵はメモリに残す');
    await vfs.writeFile(VU, Buffer.from(view));
    ok(disk().includes('A_vault') && !disk().includes(SECRET_A), '  Undo/貼り戻し= 残した鍵で暗号化して書く'); }
  before = disk();
  // 施錠(鍵を捨てる)→ エディターに平文が残ったまま書こうとした(Undo等)
  T._vaultKeys.delete(KEY);
  ok(!(await vfs.readFile(VU)).toString().includes(SECRET_A), '施錠後に読む= 暗号文の姿');
  threw = false; try { await vfs.writeFile(VU, Buffer.from(view)); } catch (_) { threw = true; }
  ok(threw && disk() === before, '守り① 施錠後に平文が書かれそうになったら書かない');
  // v5.1.34 守り④: MeOS が入れ替わった(鍵も控えも消えた)のに、画面に平文が残っている
  T._vaultSeen.delete(KEY);
  threw = false; try { await vfs.writeFile(VU, Buffer.from(view)); } catch (_) { threw = true; }
  ok(threw && disk() === before, '守り④ 入れ替わりで鍵も控えも無いのに平文を書こうとしたら書かない(ディスクを見て決める)');
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
  // v5.1.1: 本文のボタンの場所(俊克の書き方= HTMLコメント包みの膜)
  const L = ['<!-- {* ▼mCN=暗号テスト_20261017s105901JST // comment1 *} -->', T._MEOS_ENC_PREFIX + 'xxxx', '<!-- {* ▲mCN=暗号テスト_20261017s105901JST // comment2 *} -->'];
  const fd = (scheme) => ({ uri: { scheme, path: P, toString: () => scheme + ':' + P }, lineCount: L.length, lineAt: (i) => ({ text: L[i] }) });
  let b = T.meosVaultBtnSpot(fd('file'), 1);
  ok(b && b.kind === 'unlock' && b.marker && b.typeCol === 0 && b.col === 2, 'v5.1.74 施錠中= マーカー行の頭(0)は種類の絵、🔒の後(2)を押すと開く(file: でも出る)');
  { const L2 = [L[0], T._MEOS_SHIELD + L[1], L[2]]; const b2 = T.meosVaultBtnSpot({ uri: { scheme: 'file', path: P, toString: () => 'file:' + P }, lineCount: 3, lineAt: (i) => ({ text: L2[i] }) }, 1);
    ok(b2 && b2.typeCol === T._MEOS_SHIELD.length && b2.col === T._MEOS_SHIELD.length + 2, 'v5.1.74 🛡️の行も同じ並び(種類の絵は🛡️の後・開くのは🔒の後)'); }
  b = T.meosVaultBtnSpot(fd('file'), 0);
  ok(b && b.kind === 'unlock' && b.head && L[0].slice(b.col, b.col + 3) === ' //', 'v5.1.5 施錠中の開始行にも🔓(外から分かる・file: でも)');
  T._vaultKeys.set(KEY, new Map([['暗号テスト_20261017s105901JST', 'p']]));
  L[1] = 'plain text now';
  b = T.meosVaultBtnSpot(fd('meos-vault'), 0);
  ok(b && b.kind === 'lock' && L[0].slice(b.col, b.col + 3) === ' //', '解錠中= 開始行の名前の直後(\' //\' の手前)に🔐(押すと閉じる)');
  // ★v5.1.72 🛡️完全防衛: 印は暗号文の行の頭。解錠中はメモリが覚え、書く口が行の頭へ戻す
  {
    const P2 = '/shield.md', VU2 = { path: P2, scheme: 'meos-vault', toString: () => 'meos-vault:' + P2 }, K2 = 'file://' + P2;
    const SEC = 'only-me 遺言 9876', PASS = 'kosu-mira-tefu-nobe-raki';
    DISK.set(P2, Buffer.from('# s\n// {▼mCN=S_shield // x}\n' + T._MEOS_SHIELD + T._MEOS_ENC_PREFIX + T.meosEncryptText(SEC, PASS) + '\n// {▲mCN=S_shield //}\n'));
    const d2 = () => DISK.get(P2).toString('utf8');
    ok(T._vaultPairs(d2().split('\n')).length === 1, '🛡️付きでも膜を数える口が見つける(施錠中=3行)');
    ok((await vfs.readFile(VU2)).toString() === d2(), '🛡️: 鍵なしで読む= ディスクのまま(🛡️も見える)');
    T._vaultKeys.set(K2, new Map([['S_shield', PASS]])); T._vaultSeen.set(K2, new Set(['S_shield']));
    let v2 = (await vfs.readFile(VU2)).toString();
    ok(v2.includes(SEC) && !v2.includes(T._MEOS_SHIELD), '🛡️: 解錠すると平文(🛡️の行は平文に替わる)');
    ok(!!(T._vaultShield.get(K2) && T._vaultShield.get(K2).has('S_shield')), '🛡️: 解錠中はメモリが🛡️を覚える');
    await vfs.writeFile(VU2, Buffer.from(v2.replace(SEC, SEC + ' 追記')));
    const ln = d2().split('\n').find(l => l.indexOf(T._MEOS_ENC_PREFIX) >= 0) || '';
    ok(ln.indexOf(T._MEOS_SHIELD + T._MEOS_ENC_PREFIX) === 0 && !d2().includes('遺言'), '🛡️: 書くと行の頭に🛡️が戻り、ディスクに平文が無い');
    ok(T.meosEncLineShield(ln) && !T.meosEncLineShield(T._MEOS_ENC_PREFIX + 'abc'), '🛡️の行かどうかを見分ける');
    ok(T.meosDecryptText(ln.slice(ln.indexOf(T._MEOS_ENC_PREFIX) + T._MEOS_ENC_PREFIX.length).trim(), PASS).includes('追記'), '🛡️: 暗号は🔐と同じ(同じ合言葉で開く)');
    ok(!T.meosPassStrongEnough('abc') && !T.meosPassStrongEnough('pass-word-ok') && T.meosPassStrongEnough(PASS) && T.meosPassStrongEnough('a'.repeat(20)) && T.meosPassStrongEnough('あいう-かきく-さしす-たちつ-なに'), '🛡️の合言葉の長さ(20字以上/言葉4つ以上で16字以上)');
    T._vaultKeys.delete(K2);
  }
  // v5.1.128: 🙈目隠し= 🪑の1/10・最低1分。解錠中の膜の中身だけを覆い、🙈を見えている所の真ん中に
  {
    ok(T.meosVeilMs() === 90 * 1000, '🙈: 既定の席(🛋️15分)なら1分30秒');
    const P3 = '/veil.md', VU3 = { path: P3, scheme: 'meos-vault', toString: () => 'meos-vault:' + P3 }, K3 = 'file://' + P3;
    const L = ['# t', '// {▼mCN=V_open // c}', 'secret line 1', 'secret line 2', 'secret line 3', '// {▲mCN=V_open //}', 'after'];
    const doc = { version: 1, uri: VU3, languageId: 'markdown', lineCount: L.length, lineAt: (i) => ({ text: L[i] }) };
    const got = new Map(); let ti = 0;
    const ed = { document: doc, visibleRanges: [new Range(0, 0, 6, 0)], setDecorations: (t, r) => { got.set(t, r); } };
    stub.window.createTextEditorDecorationType = () => ({ id: ti++, dispose() { } });
    stub.window.visibleTextEditors = [ed];
    T._vaultKeys.set(K3, new Map([['V_open', 'pw']]));
    T.meosVeilSet(true);
    const all = Array.from(got.values());
    const cover = all.find(r => r.length && r[0] instanceof Range) || [], mk = all.find(r => r.length && r[0].renderOptions) || [];
    ok(T.getVeil() && cover.length === 3 && cover[0].start.line === 2 && cover[2].start.line === 4, '🙈: 中身の3行だけを覆う(開始/閉じの行は覆わない)');
    ok(mk.length === 1 && mk[0].range.start.line === 3 && /font-size: \d+px/.test(mk[0].renderOptions.before.textDecoration) && mk[0].renderOptions.before.contentText === '🙈', '🙈: 真ん中の行に1つ');
    T.meosVeilSet(false);
    ok(!T.getVeil() && Array.from(got.values()).every(r => r.length === 0), '🙈: 外すと覆いも🙈も消える');
    T._vaultKeys.delete(K3);
    const keep = new Map(T._vaultKeys); T._vaultKeys.clear();
    T.meosVeilSet(true);
    for (const [k, v] of keep) T._vaultKeys.set(k, v);
    ok(!T.getVeil(), '🙈: 解錠中の膜が無ければ覆わない');
    stub.window.visibleTextEditors = [];
  }
  console.log(fail ? ('\n' + fail + ' 項目 NG') : '\n全項目 PASS');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
