// 開発用ツール(vsix除外): webview <script> をテンプレートリテラル評価後の姿に変換してsyntax checkする検証器
// (v99978の教訓: ソースの \' はテンプレートリテラル出力で ' になり、node --checkでは検出できない)
// 実スクリプト=</body>直前の<script>ブロック(変更履歴コメント中の'<script>'文字列に惑わされない)
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'extension.js'), 'utf8');
// ★v4.0.50(俊克 8/7「Me Dockが文字列になっちゃったよ」): **テンプレートリテラル内の裸のbacktick検出**。
// Me Dock の HTML は1つの巨大なテンプレートリテラル(`...`)。その中にコメントであっても ` を書くと、
// そこでリテラルが終わり、以降がJS式として評価されてパネルが「文字列」として表示される(v4.0.47の全壊)。
// ★syntax checkでは捕まらない: 途中で終わっても残りが偶然valid JSになりうる(実際 `-` `*` `+` は演算子として通り NaN が出た)。
// so「HTML領域に裸のbacktickが1つでもあれば即NG」という別の目で見る。
{
  const cI = src.indexOf('</script></body>');
  const oI = src.lastIndexOf('<!DOCTYPE html>', cI);
  if (oI >= 0 && cI > oI) {
    const region = src.slice(oI, cI);
    const hits = [];
    for (let i = 0; i < region.length; i++) if (region[i] === '`' && region[i - 1] !== '\\') hits.push(oI + i);
    if (hits.length) {
      console.log('webview template: BACKTICK ERROR -> テンプレートリテラル内に裸の ` が ' + hits.length + ' 個あります(Me Dockが文字列化します)');
      for (const h of hits.slice(0, 5)) console.log('   …' + src.slice(h - 70, h + 50).replace(/\n/g, ' ') + '…');
      process.exit(1);
    }
  }
}
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
  // v2.0.32(俊克): ★v2.0.31全壊(webview全壊)の再発防止。テンプレートリテラルは残る全ての \X を X へ落とす(\/→/, \d→d 等)。この一般de-escapeが無く、正規表現の \/ が実行時に / に化けて<script>が壊れる件を見逃していた。ここで実行時と同じ姿にしてsyntax checkする。
  .replace(/\\[\s\S]/g, function (m) { return m[1]; })
  .split(SENTINEL).join('\\\\');
js = js.replace(/\$\{[^}]*\}/g, '"0"');
const out = path.join(__dirname, 'webview_out.js');
fs.writeFileSync(out, js);
try { new Function(js); console.log('webview script: SYNTAX OK (' + Math.round(js.length / 1024) + 'KB)'); process.exit(0); }
catch (e) { console.log('webview script: SYNTAX ERROR -> ' + e.message + '  (詳細: node --check ' + out + ')'); process.exit(1); }
