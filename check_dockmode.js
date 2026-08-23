// 開発用ツール(vsix除外): Me Dock の名前欄/行番号欄が、カーソルに追いつくかを見る。
//
// v4.0.386(俊克 8/23 バグ1「Createボタンを押すと、別の開始膜に入ってもその膜名を表示しない」)
// ★写経しない= extension.js の webview <script> を**実行時と同じ姿に直してから**、
//   meDockIsTyping をその場で評価して確かめる。加えて applyMode の中に古い物差し
//   (document.activeElement !== input)が残っていないことを、実ソースの文字列で見る。
// 使い方:  node src/check_dockmode.js
const fs = require('fs'); const path = require('path'); const vm = require('vm');
const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
const closeM = src.match(/<\/script>\s*<\/body>/);
if (!closeM) { console.log('NO </script></body> found'); process.exit(1); }
const closeIdx = src.indexOf(closeM[0]);
const openIdx = src.lastIndexOf('<script>', closeIdx);
const raw = src.slice(openIdx + '<script>'.length, closeIdx);
const SENTINEL = '';
const js = raw
  .split('\\\\').join(SENTINEL).split('\\`').join('`').split('\\$').join('$').split("\\'").join("'")
  .replace(/\\[\s\S]/g, (m) => m[1])
  .split(SENTINEL).join('\\');

let ng = 0;
const ok = (cond, label, got) => { console.log((cond ? '  ok  ' : ' NG   ') + label + (cond ? '' : '   ← ' + JSON.stringify(got))); if (!cond) ng++; };

console.log('① 「今この人が打っているか」の物差し = 焦点がこの文書に在る＋その中で入力欄に居る');
{
  const m = /function meDockIsTyping\([\s\S]*?\n/.exec(js);
  ok(!!m, '関数が実ソースに在る', m && m[0]);
  const INPUT = { tag: 'input' }, OTHER = { tag: 'button' };
  const ctx = { document: { activeElement: null, hasFocus: () => false } };
  vm.createContext(ctx);
  vm.runInContext(m[0], ctx);
  const call = (active, hasFocus, el) => { ctx.document.activeElement = active; ctx.document.hasFocus = () => hasFocus; return vm.runInContext('meDockIsTyping(__el)', Object.assign(ctx, { __el: el })); };
  ok(call(INPUT, true, INPUT) === true, '入力欄に居て、この文書に焦点が在る = 打っている', true);
  ok(call(INPUT, false, INPUT) === false, '★入力欄を指したままでも、焦点が外に在れば「打っていない」(今回のバグ)', false);
  ok(call(OTHER, true, INPUT) === false, '別の要素に居る = 打っていない', false);
  ok(call(OTHER, false, INPUT) === false, '焦点も要素も外 = 打っていない', false);
  // hasFocus が使えない環境でも落ちない(catchで activeElement だけを見る)
  ctx.document.hasFocus = () => { throw new Error('no hasFocus'); };
  ctx.__el = INPUT; ctx.document.activeElement = INPUT;
  ok(vm.runInContext('meDockIsTyping(__el)', ctx) === true, 'hasFocusが無い環境でも落ちない', true);
}

console.log('② applyMode に古い物差しが残っていない(名前欄・行番号欄とも1つの関数から引く)');
{
  const a = js.indexOf('function applyMode(');
  const b = js.indexOf('function escText(', a);
  const body = js.slice(a, b > a ? b : a + 4000);
  ok(!/document\.activeElement\s*!==\s*input/.test(body), '名前欄に古い判定が無い', body.match(/document\.activeElement[^;]{0,40}/g));
  ok(!/document\.activeElement\s*!==\s*lineInput/.test(body), '行番号欄も古い判定が無い', body.match(/document\.activeElement[^;]{0,40}/g));
  ok((body.match(/meDockIsTyping\(/g) || []).length === 3, '新しい物差しを3か所で使う', (body.match(/meDockIsTyping\(/g) || []).length);
  ok(/draftDirty/.test(body), '打った字を守る draftDirty は残っている', true);
}
console.log('③ 枠の中の字(写し)は、値を書いた所で必ず塗り直す(v4.0.388 俊克 バグ1/2/3)');
{
  const a = js.indexOf('function applyMode(');
  const b = js.indexOf('function escText(', a);
  const body = js.slice(a, b > a ? b : a + 4000);
  ok(!/input\.value\s*=/.test(body), 'applyMode が input.value を直に書かない', body.match(/input\.value[^;]{0,30}/g));
  ok((body.match(/meDockSetNameValue\(/g) || []).length === 2, '値を書く口は meDockSetNameValue の2か所', (body.match(/meDockSetNameValue\(/g) || []).length);
  const setter = /function meDockSetNameValue\([\s\S]*?\n[\s\S]*?\n/.exec(js);
  ok(!!setter && /__meosAskNameTint/.test(setter[0]), '★その口の中で必ず写しを塗り直す', setter && setter[0]);
  // Reset も同じ口から(2つの書き方を残さない)
  const reset = /resetBtn\.addEventListener\([\s\S]{0,260}/.exec(js);
  ok(!!reset && /meDockSetNameValue\(/.test(reset[0]), 'Reset も同じ口から', reset && reset[0].slice(0, 160));
  // 遅れて届いた写しで今の値を塗らない
  ok(/m\.text!=null&&input&&String\(m\.text\)!==input\.value/.test(js), '古い写しは捨てる(値と合う時だけ塗る)', true);
}

console.log(ng ? ('NG ' + ng + '件') : '全項目 PASS');
process.exit(ng ? 1 : 0);
