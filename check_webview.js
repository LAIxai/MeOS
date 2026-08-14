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
// v4.0.197: ここで exit せず**次の検査へ進む**(構文の後ろに、宣言that消えた識別子の検査that続く)。
try { new Function(js); console.log('webview script: SYNTAX OK (' + Math.round(js.length / 1024) + 'KB)'); }
catch (e) { console.log('webview script: SYNTAX ERROR -> ' + e.message + '  (詳細: node --check ' + out + ')'); process.exit(1); }

// ===== v4.0.197(俊克 8/14 pm01:16 の後): **宣言だけ消して、使っている所を残す**事故を捕まえる検査 =========
// ★v4.0.192の全壊がこれだった= `const fcWriteT=…` を消したのに `if(fcWriteT)fcWriteT.addEventListener(…)` を
//   残した。未宣言の識別子を `if(x)` で読むと **ReferenceError** so、Me Dockの初期化thatそこで死に、
//   **以降の配線(TOC/Hyper IDX/膜パネル/参照グループ/GitHubの状態)that丸ごと動かなくなる**。
//   `node --check` も構文しか見ないso素通りした。
// ★★満点の静的解析は要らない= **前の版と突き合わせる**だけで、この形は必ず捕まる。
//   同じ(不完全な)読み取りを両側に掛けるso、取りこぼしthat両側で同じになり誤検出that出ない。
// 使い方: node check_webview.js [比較先のgit ref] (既定=HEAD)
{
  const { execSync } = require('child_process');
  const ref = process.argv[2] || 'HEAD';
  const scriptOf = (t) => { const c = t.indexOf('</script></body>'); const d = t.lastIndexOf('<script>', c); return (c < 0 || d < 0) ? '' : t.slice(d, c); };
  const strip = (t) => t
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''");
  const namesOf = (t) => {
    const decl = new Set(), used = new Set();
    let m;
    const reD = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)|\bfunction\s*\*?\s*([A-Za-z_$][\w$]*)|,\s*([A-Za-z_$][\w$]*)\s*=/g;
    while ((m = reD.exec(t)) !== null) decl.add(m[1] || m[2] || m[3]);
    const reU = /(?<![.\w$])([A-Za-z_$][\w$]*)\s*(?=\.|\()/g;
    while ((m = reU.exec(t)) !== null) used.add(m[1]);
    return { decl, used };
  };
  let base = null;
  try { base = execSync('git show ' + ref + ':./extension.js', { cwd: __dirname, maxBuffer: 64 * 1024 * 1024 }).toString('utf8'); } catch (e) { base = null; }
  if (!base) {
    console.log('webview refs: SKIP (比較先 ' + ref + ' を読めませんでした)');
  } else {
    const A = namesOf(strip(scriptOf(base))), B = namesOf(strip(scriptOf(src)));
    const lost = [...B.used].filter(n => A.decl.has(n) && !B.decl.has(n));
    if (lost.length) {
      console.log('webview refs: DANGLING ERROR -> 宣言that消えたのに、まだ使っている識別子: ' + lost.join(', '));
      console.log('  (' + ref + ' には宣言that在りました。消すなら、使っている行も一緒に消してください)');
      process.exitCode = 1;
    } else {
      console.log('webview refs: OK (宣言that消えて使用thatが残っている識別子は無し / 比較先=' + ref + ')');
    }
  }
}

// ===== v4.0.198: **開きと閉じの釣り合いthat前の版からズレていないか** ===================================
// ★v4.0.197の事故thatこれ= メニューを消した時に、その後ろに在った `</div>`(row format-tools を閉じる方)を
//   **1つ巻き込んで**消していた。結果、Format行thatが枠を失い、Rawボタンthat外側の右端まで飛んだ。
// ★★「開き=閉じ」を絶対値で見る検査は使えない(191の時点で span thatが1つ釣り合っていない)so、
//   **前の版との差**を見る= 消したいものを消せば開きも閉じも同じだけ減る。片方だけ減ったら、それthat巻き込み。
{
  const { execSync } = require('child_process');
  const ref2 = process.argv[2] || 'HEAD';
  const htmlOf = (t) => {
    const c = t.indexOf('</script></body>'); if (c < 0) return '';
    const o = t.lastIndexOf('<!DOCTYPE html>', c); const b = t.indexOf('</style>', o); const d = t.lastIndexOf('<script>', c);
    return (b < 0 || d < 0) ? '' : t.slice(b + 8, d).replace(/<!--[\s\S]*?-->/g, '');
  };
  const balance = (h) => {
    const out = {};
    for (const t of ['div', 'span', 'button', 'section', 'main', 'header', 'label', 'select', 'ul', 'li', 'table']) {
      const o = (h.match(new RegExp('<' + t + '\\b', 'g')) || []).length;
      const c = (h.match(new RegExp('</' + t + '>', 'g')) || []).length;
      out[t] = o - c;
    }
    return out;
  };
  let base2 = null;
  try { base2 = execSync('git show ' + ref2 + ':./extension.js', { cwd: __dirname, maxBuffer: 64 * 1024 * 1024 }).toString('utf8'); } catch (e) { base2 = null; }
  if (!base2) { console.log('webview tags: SKIP (比較先 ' + ref2 + ' を読めませんでした)'); }
  else {
    const A2 = balance(htmlOf(base2)), B2 = balance(htmlOf(src));
    const bad = Object.keys(B2).filter(t => A2[t] !== B2[t]);
    if (bad.length) {
      console.log('webview tags: BALANCE ERROR -> 開き/閉じの釣り合いthat前の版とずれたタグ: ' + bad.map(t => t + '(' + A2[t] + '→' + B2[t] + ')').join(', '));
      console.log('  (閉じタグを巻き込んで消した/開きだけ足した可能性thatあります)');
      process.exitCode = 1;
    } else {
      console.log('webview tags: OK (開き/閉じの釣り合いthat前の版と同じ / 比較先=' + ref2 + ')');
    }
  }
}
