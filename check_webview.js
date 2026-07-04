// 開発用ツール(vsix除外): webview <script> をテンプレートリテラル評価後の姿に変換してsyntax checkする検証器
// (v99978の教訓: ソースの \' はテンプレートリテラル出力で ' になり、node --checkでは検出できない)
// 実スクリプト=</body>直前の<script>ブロック(変更履歴コメント中の'<script>'文字列に惑わされない)
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
// 閉じ側(</script></body>)の位置から逆算して直近の<script>を実スクリプトの開始とする
const closeM = src.match(/<\/script>\s*<\/body>/);
if (!closeM) { console.log('NO </script></body> found'); process.exit(1); }
const closeIdx = src.indexOf(closeM[0]);
const openIdx = src.lastIndexOf('<script>', closeIdx);
if (openIdx < 0) { console.log('NO <script> before close found'); process.exit(1); }
const raw = src.slice(openIdx + '<script>'.length, closeIdx);
const SENTINEL = ''; // 私用領域文字(ソースに現れない)
let js = raw
  .split('\\\\').join(SENTINEL)
  .split('\\`').join('`')
  .split('\\$').join('$')
  .split("\\'").join("'")
  .split(SENTINEL).join('\\\\');
js = js.replace(/\$\{[^}]*\}/g, '"0"');
const out = path.join(__dirname, 'webview_out.js');
fs.writeFileSync(out, js);
try { new Function(js); console.log('webview script: SYNTAX OK (' + Math.round(js.length / 1024) + 'KB)'); process.exit(0); }
catch (e) { console.log('webview script: SYNTAX ERROR -> ' + e.message + '  (詳細: node --check ' + out + ')'); process.exit(1); }
