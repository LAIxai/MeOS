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
module.exports.__t = { meosVaultBtnSpot, MeosVaultFs, meosEncryptText, meosDecryptText, _vaultKeys, _vaultSeen, _vaultPairs, _MEOS_ENC_PREFIX, _MEOS_SHIELD, _vaultShield, meosPassStrongEnough, meosEncLineShield, meosVeilMs, meosVeilPaint, meosVeilSet, getVeil: () => _meosVeilOn, _vaultParked, meosVaultRawSync, _meosViewMem, meosVaultUnlockedCount, meosVaultLock, bumpMode: () => { _meosModeEpoch++; }, meosVeilMonkeyHit, meosVeilRepaintIfMoved, setBare: (b) => { _meosVeilBare = b; }, getBare: () => _meosVeilBare, meosVeilBtnSpot, _vaultWriteKeys };
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
    const cover = all.find(r => r.length && r[0] instanceof Range) || [], mk = all.find(r => r.length && r[0].renderOptions && r[0].renderOptions.before.contentText === '🙈') || [];
    const bd = all.find(r => r.length && r[0].renderOptions && r[0].renderOptions.before.contentText === '') || [];
    ok(T.getVeil() && cover.length === 3 && cover[0].start.line === 2 && cover[2].start.line === 4, '🙈: 中身の3行だけを覆う(開始/閉じの行は覆わない)');
    ok(mk.length === 1 && mk[0].range.start.line === 3 && mk[0].renderOptions.before.contentText === '🙈', '🙈: 真ん中の行に1つ');
    ok(bd.length === 3 && bd.every(b => /width: 15ch; height: 100%/.test(b.renderOptions.before.textDecoration) && b.renderOptions.before.backgroundColor === '#ffffff'), '🙈: 白い板= 中身の行ごとに1枚・幅は一番長い行(13桁)+2');
    { const td = mk[0] ? mk[0].renderOptions.before.textDecoration : ''; const K = Number((/font-size: ([\d.]+)em/.exec(td) || [])[1]), L = Number((/left: ([\d.]+)ch/.exec(td) || [])[1]);
      ok(K > 0 && Math.abs(L * K - 7.5) < 0.01 && /top: 0\.75em|top: [\d.]+em/.test(td), '🙈: 横は板の真ん中(左から7.5桁= 字の大きさで割り戻す)'); }
    T.meosVeilSet(false);
    { const all2 = Array.from(got.values()); const c2 = all2.find(r => r.length && r[0] instanceof Range) || [];
      ok(!T.getVeil() && c2.length === 3, 'v5.1.171: 🙈を外しても、カーソルが膜の外なら中身は覆ったまま(解錠中は常に目隠し)'); }
    // v5.1.171: カーソルの行だけ板を外し、膜の中にカーソルが居る間は見猿を出さない
    got.clear(); ed.selections = [{ active: new Position(3, 0) }, { active: new Position(3, 4) }];
    T.meosVeilPaint(ed);
    { const all3 = Array.from(got.values()); const c3 = all3.find(r => r.length && r[0] instanceof Range) || [];
      const b3 = all3.find(r => r.length && r[0].renderOptions && r[0].renderOptions.before.contentText === '') || [];
      const m3 = all3.filter(r => r.length && r[0].renderOptions && r[0].renderOptions.before.contentText === '🙈');
      ok(c3.length === 2 && c3.every(r => r.start.line !== 3) && b3.length === 2 && b3.every(r => r.range.start.line !== 3), 'v5.1.171: カーソルの行(3)だけ覆わない・他の2行は覆う');
      ok(!m3.length, 'v5.1.171: カーソルが膜の中なら見猿は出さない'); }
    got.clear(); ed.selections = [{ active: new Position(2, 0) }, { active: new Position(4, 0) }];
    T.meosVeilPaint(ed);
    { const c4 = Array.from(got.values()).find(r => r.length && r[0] instanceof Range) || [];
      ok(c4.length === 1 && c4[0].start.line === 3, 'v5.1.171: マルチカーソル= 各カーソルの行だけ見せる'); }
    T.meosVeilSet(true);
    { const c5 = Array.from(got.values()).find(r => r.length && r[0] instanceof Range) || [];
      ok(c5.length === 3, 'v5.1.171: 無操作の🙈はカーソルの行も覆う'); }
    T.meosVeilSet(false);
    // v5.1.173: 見猿= 指のポインタで押せる。駒の行の0桁にマウスで落ちたら見猿を押した= その膜を全部見せ、行が替わったら1行だけへ
    stub.TextEditorSelectionChangeKind = stub.TextEditorSelectionChangeKind || { Keyboard: 1, Mouse: 2, Command: 3 };
    { got.clear(); ed.selections = [{ active: new Position(0, 0) }]; ed.selection = { active: new Position(0, 0), isEmpty: true };
      T.meosVeilPaint(ed);
      const mk6 = Array.from(got.values()).find(r => r.length && r[0].renderOptions && r[0].renderOptions.before.contentText === '🙈') || [];
      ok(mk6.length === 1 && /pointer-events: auto; cursor: /.test(mk6[0].renderOptions.before.textDecoration), 'v5.1.173: 見猿は指のポインタで押せる(pointer-events: auto)');
      const at = mk6[0].range.start.line;
      const bd6 = Array.from(got.values()).find(r => r.length && r[0].renderOptions && r[0].renderOptions.before.contentText === '' && r[0].renderOptions.before.backgroundColor) || [];
      ok(bd6.length === 3 && bd6.every(b => /pointer-events: auto; cursor: /.test(b.renderOptions.before.textDecoration)), 'v5.1.174: 見猿が出ている間は白い板も押せる(指のポインタ)');
      ed.selection = { active: new Position(2, 7), isEmpty: true };
      ok((T.meosVeilMonkeyHit({ textEditor: ed, kind: 2 }) || {}).line === 2, 'v5.1.174: 実測の形(駒の1行上・行末)に落ちても見猿を押した');
      ed.selection = { active: new Position(5, 0), isEmpty: true };
      ok(!T.meosVeilMonkeyHit({ textEditor: ed, kind: 2 }), 'v5.1.174: 閉じの行は見猿ではない(▲のボタンと取り合わない)');
      ed.selection = { active: new Position(at, 0), isEmpty: true };
      ok(!T.meosVeilMonkeyHit({ textEditor: ed, kind: 1 }), 'v5.1.173: キーで0桁に来ても見猿ではない');
      const h = T.meosVeilMonkeyHit({ textEditor: ed, kind: 2 });
      ok(h && h.id === 'V_open', 'v5.1.173: マウスで駒の行の0桁= 見猿を押した');
      ok(h && h.from === 2, 'v5.1.175: 見猿・板を押した= 1行目(中身の最初の行)へ');
      { const vb = T.meosVeilBtnSpot(doc, 1); const t1 = L[1]; ok(vb && vb.id === 'V_open' && t1.slice(vb.col - 3, vb.col) === ' //', 'v5.1.175: 小さい🙈の札は開始行の // の直後'); }
      ok(!T.meosVeilBtnSpot(doc, 2) && !T.meosVeilBtnSpot(doc, 5), 'v5.1.175: 小さい🙈は開始行だけ');
      T.setBare({ uri: VU3.toString(), id: h.id, line: at }); ed.selections = [{ active: new Position(at, 0) }];
      { got.clear(); T.meosVeilPaint(ed); const bd7 = Array.from(got.values()).find(r => r.length && r[0].renderOptions && r[0].renderOptions.before.backgroundColor) || [];
        ok(!bd7.length, 'v5.1.174: 全部見せている間は板が無い'); }
      ed.selections = [{ active: new Position(0, 0) }]; T.setBare(null); got.clear(); T.meosVeilPaint(ed); ed.selections = [{ active: new Position(4, 0) }]; got.clear(); T.meosVeilPaint(ed);
      { const bd9 = Array.from(got.values()).find(r => r.length && r[0].renderOptions && r[0].renderOptions.before.backgroundColor) || [];
        ok(bd9.length === 2 && bd9.every(b => /pointer-events: none/.test(b.renderOptions.before.textDecoration)), 'v5.1.174: カーソルが膜の中(見猿なし)なら板はふつう(押せる物ではない)'); }
      T.setBare({ uri: VU3.toString(), id: h.id, line: at }); ed.selections = [{ active: new Position(at, 0) }];
      got.clear(); T.meosVeilPaint(ed);
      const c7 = Array.from(got.values()).find(r => r.length && r[0] instanceof Range) || [];
      ok(!c7.length, 'v5.1.173: 押した膜は全部見せる');
      ed.selection = { active: new Position(0, 0), isEmpty: true }; ed.selections = [{ active: new Position(0, 0) }];
      got.clear(); T.meosVeilRepaintIfMoved(ed, 3);
      { const c10 = Array.from(got.values()).find(r => r.length && r[0] instanceof Range) || []; ok(T.getBare() && !c10.length, 'v5.1.176: 拡張の移動(種類=Command・押した後にカーソルを戻す)では全部見せるのを解かない'); }
      ed.selection = { active: new Position(at + 1, 0), isEmpty: true }; ed.selections = [{ active: new Position(at + 1, 0) }];
      got.clear(); T.meosVeilRepaintIfMoved(ed, 2);
      const c8 = Array.from(got.values()).find(r => r.length && r[0] instanceof Range) || [];
      ok(!T.getBare() && c8.length === 2 && c8.every(r => r.start.line !== at + 1), 'v5.1.173: 行が替わったら、その行だけ見せて他は覆う'); }
    delete ed.selections; delete ed.selection;
    T._vaultKeys.delete(K3);
    T.meosVeilPaint(ed);
    ok(Array.from(got.values()).every(r => r.length === 0), '施錠すると(鍵が無い)覆いも見猿も消える');
    const keep = new Map(T._vaultKeys); T._vaultKeys.clear();
    T.meosVeilSet(true);
    for (const [k, v] of keep) T._vaultKeys.set(k, v);
    ok(!T.getVeil(), '🙈: 解錠中の膜が無ければ覆わない');
    stub.window.visibleTextEditors = [];
  }
  // v5.1.172/177: Rawの解錠中の膜= エディターの中身を暗号文の1行へ替え、鍵は控えへ/Rawを出たら平文へ戻す/施錠で控えも捨てる
  {
    const P4 = '/raw.md', VU4 = { path: P4, scheme: 'meos-vault', toString: () => 'meos-vault:' + P4 }, K4 = 'file://' + P4;
    let L = ['# t', '// {▼mCN=R_open // c}', 'secret', 'line2', '// {▲mCN=R_open //}'];
    let ver = 1;
    const doc = { get version() { return ver; }, uri: VU4, languageId: 'markdown', get lineCount() { return L.length; }, lineAt: (i) => ({ text: L[i] }), eol: 1, isDirty: false, save: async () => true };
    stub.WorkspaceEdit = class { constructor() { this.ops = []; } replace(u, r, t) { this.ops.push({ r, t }); } };
    stub.workspace.applyEdit = async (we) => {
      for (const o of we.ops.slice().sort((a, b) => b.r.start.line - a.r.start.line)) {
        const a = L.slice(0, o.r.start.line), b = L.slice(o.r.end.line + 1);
        const head = L[o.r.start.line].slice(0, o.r.start.character), tail = L[o.r.end.line].slice(o.r.end.character);
        L = a.concat((head + o.t + tail).split('\n'), b);
      }
      ver++; return true;
    };
    T._vaultKeys.set(K4, new Map([['R_open', 'pw']]));
    T._meosViewMem.set(VU4.toString(), { R_open: 'raw' }); T.bumpMode();
    await T.meosVaultRawSync(doc);
    ok(L.length === 4 && L[2].indexOf(T._MEOS_ENC_PREFIX) === 0 && !L.join('\n').includes('secret'), 'v5.1.177: Rawになった解錠中の膜は、エディターの中身が暗号文の1行に(読み直さない)');
    ok(!T._vaultKeys.has(K4) && T._vaultParked.get(K4) && T._vaultParked.get(K4).get('R_open') === 'pw', 'v5.1.172: 鍵は控えへ');
    ok(T.meosVaultUnlockedCount().n >= 1, 'v5.1.172: 控えた鍵も「開いている」に数える');
    // Rawの間に膜の中へ行を足した= 暗号文の行は開けてから一緒に包む(二重に包まない)
    L.splice(3, 0, 'added'); ver++;
    await T.meosVaultRawSync(doc);
    ok(L.length === 4 && L[2].indexOf(T._MEOS_ENC_PREFIX) === 0 && T.meosDecryptText(L[2].slice(T._MEOS_ENC_PREFIX.length).trim(), 'pw') === 'secret\nline2\nadded', 'v5.1.177: Rawの間に足した行は、中の暗号文を開けてから一緒に1行へ包む');
    T._meosViewMem.set(VU4.toString(), {}); T.bumpMode();
    await T.meosVaultRawSync(doc);
    ok(L.join('\n') === '# t\n// {▼mCN=R_open // c}\nsecret\nline2\nadded\n// {▲mCN=R_open //}', 'v5.1.177: Rawを出たら、合言葉なしで平文へ戻す');
    ok(T._vaultKeys.get(K4) && T._vaultKeys.get(K4).get('R_open') === 'pw' && !T._vaultParked.has(K4), 'v5.1.172: 鍵も戻す');
    await T.meosVaultRawSync(doc);
    ok(L.length === 6, 'v5.1.177: 望む姿と同じなら何もしない');
    T._meosViewMem.set(VU4.toString(), { '': 'raw' }); T.bumpMode();
    await T.meosVaultRawSync(doc);
    ok(T._vaultParked.has(K4) && L.length === 4, 'v5.1.172: ファイルの地がRawでも暗号文へ');
    ok(T._vaultWriteKeys(K4) && T._vaultWriteKeys(K4).get('R_open') === 'pw', 'v5.1.177: 書く口は控えた鍵でも暗号化する(取り消しで平文が戻っても書ける)');
    const r = await T.meosVaultLock(K4);
    ok(r && !T._vaultParked.has(K4) && !T._vaultKeys.has(K4), 'v5.1.172: 施錠すると控えた鍵も捨てる');
    T._meosViewMem.delete(VU4.toString()); T.bumpMode();
  }
  console.log(fail ? ('\n' + fail + ' 項目 NG') : '\n全項目 PASS');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
