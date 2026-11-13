// {* ▼mCN=hT_helper // H-TOC for AI — source index for meos-helper.js (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
// ⇄ 0100_BOOT // Mac の命令の読み込み / run の入口 / 置き場 dir / hlog / メニューバーの item
// ⇄ 0200_STYLED_TEXT // 札の字の飾り(⚓の傾き・縁・drawStyled)
// ⇄ 0300_OPEN_WARP // エディターを起こす / 膜へワープ / 持ち主の生死 / 開けないワープの持ち越し
// ⇄ 0400_WAKE // 🌅 pmset の読み書き / 起動の予定 / 見本 presets
// ⇄ 0500_WAKE_ROWS // 🌅 メニューの行(曜日の□・押した時)
// ⇄ 0600_MENU_CLICK // メニュー項目を押した時(pick:) / 最後の予定 / optWarp
// ⇄ 0650_MENU_OPEN // メニューが開く時(menuWillOpen)= 札のどこを押したかの振り分け(ロゴ・ピース・Opt)
// ⇄ 0700_MENU_PARTS // 付箋の絵 / 🔴▶ / ⭐️ / 見出しの部品
// ⇄ 0800_HEAD_CYCLE // 見出しの畳み / ↻ の4姿 / 待ちの姿 / 🏷️の見出し
// ⇄ 0900_POINTER // ポインター(手・白い45°↖・手の平/握り)の切り替え= menuHandStep / ↻のホーバー / ポインターを運ぶ
// ⇄ 1000_MENU_BUILD // メニューを組み立てる(付箋・TAG・⏰の群・build) / 残り時間の書き方
// ⇄ 1100_BELL_SOUNDS // 鐘の音(GROWL・神獣・ミャウ・ロケット) playBell
// ⇄ 1200_TAG_COLORS // 札の色
// ⇄ 1250_TAG_SEATS // 札の🪑の席の絵
// ⇄ 1300_TAG_PIECES // 札のパズルのピース / ⌘Q・名札 / 当たり pieceHit / 絵 drawPiece
// ⇄ 1400_MGATE_TILES // ぶら下がりのmGATE= 寸法 DO_* / dockOut の状態 / タイルの絵 / 押した時 dockOutFire(♡も) / edLaunch
// ⇄ 1410_MGATE_HIT // mGATE の当たり= dockOutAt / ロゴの台形 / 札と点 / 掴む所 dockOutOnGrip / dockOutHandAt
// ⇄ 1420_MGATE_SEATS // mGATE の4つの席 / ドラッグ / 吸い付き / クリックの見張り dockOutFast
// ⇄ 1430_MGATE_WINDOW // mGATE の窓を作る・描く・出す・閉じる・Shift クリック / tip dockOutTipStep / dockOutTick / 札のロゴの Cmd
// ⇄ 1500_SHOW // 札を描く show()
// ⇄ 1600_CLOCK_STEP // ⏰の帯 / 鳴らす判定 / 1回分の見張り step()
// ⇄ 1700_TICKERS // タイマー / puzzle-last の読み取り / 構え armTick / ポインターを運ぶ warpPtr / 修飾キー
// {* ▲mCN=hT_helper // end [cGJF=h] *}
// {* ▼mCN=0100_BOOT // Mac の命令の読み込み / run の入口 / 置き場 dir / hlog / メニューバーの item (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
// MeOS menu-bar helper (v5.1.255) — runs as a LaunchAgent via `osascript -l JavaScript`, so it lives on
// when VSCodium is closed.
// ★★★v4.2.310(俊克 2026.09.23 pm01:58「最大の修正を忘れていた。メニューバーの常駐化だよ。VSCmを起動してなくても、
//   タイマー機能を動かして、タイムアップしたら、VSCmを起動し、膜にワープする。いわゆる、よくあるHelper機能だね」):
//   ★時計の住まいは本文の膜。ここに在るのは拡張が書いた**写し**(state.json の alarms)だけ。
//     VSCodium が起きると拡張が本文から数え直して写しを上書きする= 本文と写しは突き合わせで揃う。
//   ★拡張が生きている間(owner の pid が在る)= 今までのメニューバー係と同じ= 拡張の text/menu をそのまま出す。
//   ★拡張が居ない間= 自分で数える。時刻が来たら鐘を鳴らし、vscodium://lai.lai-membrane/warp を開く
//     (閉じていれば VSCodium が起き、拡張が膜へ飛んで鐘を引き継ぐ)。拡張が起きたらこちらの鐘は止める。
//   ★メニューバーの持ち主はこれ1つ= VSCodium が開いていても⏰は2つ並ばない。
ObjC.import('Cocoa');
ObjC.import('CoreGraphics');
ObjC.import('stdlib');   // v5.1.335: $.exit(起こし直す)   // v5.1.237: ポインターを運ぶ(CGWarpMouseCursorPosition)
ObjC.bindFunction('kill', ['int', ['int', 'int']]);
try { ObjC.bindFunction('_CGSDefaultConnection', ['int', []]); ObjC.bindFunction('CGSSetConnectionProperty', ['int', ['int', 'int', 'id', 'id']]); const c = $._CGSDefaultConnection(); $.CGSSetConnectionProperty(c, c, $('SetsCursorInBackground'), $.NSNumber.numberWithBool(true)); } catch (e) {}   // v5.1.516: 裏にいてもポインターの形を変えられる(Apple の非公開の命令・効かなくなっても矢印のままで害はない)
ObjC.bindFunction('CGEventSourceSecondsSinceLastEventType', ['double', ['int', 'unsigned int']]);   // v5.1.366: Mac 全体の無操作の秒数
ObjC.bindFunction('CGEventSourceFlagsState', ['unsigned long long', ['int']]);   // v4.2.742: 左右の区別まで入った修飾キーの状態(機械の状態= 1)
ObjC.bindFunction('CGEventSourceCounterForEventType', ['unsigned int', ['int', 'unsigned int']]);   // v5.1.414: マウスを押した/放した回数(Mac が数える)= 見張りが遅れても取りこぼさない
function run(argv) {
  const dir = argv[0];
  const statePath = dir + '/state.json', clickPath = dir + '/click.json';
  // v4.2.372: アプリごとの係= 置き場所の最後の名前(vscode / vscodium)が自分の名前。止める知らせは1つ上の共有の置き場所
  const myScheme = dir.split('/').filter(Boolean).pop() || '';
  const sharedDir = dir.replace(/\/[^\/]+\/?$/, '');
  const myLabel = 'com.laixai.meos.helper' + (/^(vscode|vscodium|[A-Za-z0-9_-]+)$/.test(myScheme) && sharedDir !== dir ? '.' + myScheme : '');
  const bornAt = Date.now();
  // ★v4.2.510(俊克 バグ1「メニューバー表示がオフになってしまう。V-helper ボタンは橙のまま」): 降りた理由を自分の置き場所に残す(events.log・最後の40行)
  const hlog = (msg) => { try { const f = dir + '/events.log'; let t = ''; try { const x = $.NSString.stringWithContentsOfFileEncodingError(f, $.NSUTF8StringEncoding, null); if (x && !x.isNil()) t = ObjC.unwrap(x); } catch (e) {}
    const lines = (t ? t.split('\n').filter(Boolean) : []).concat([new Date().toISOString() + ' ' + msg]).slice(-200);   // v5.1.334: 40→200行(メニューの測る口で頭が切れた)
    $(lines.join('\n') + '\n').writeToFileAtomicallyEncodingError(f, true, $.NSUTF8StringEncoding, null); } catch (e) {} };
  const app = $.NSApplication.sharedApplication;
  app.setActivationPolicy($.NSApplicationActivationPolicyAccessory);
  const bar = $.NSStatusBar.systemStatusBar;
  // ★v5.1.334(俊克 10.30 pm00:26「本家の V-helper を止めても駄目・VSCm の🛟オフ→オンで復旧」): 壊れるのはメニューでなく札(ステータス項目)そのもの
  //   (作り直したメニューも開き直しも、すぐ閉じた・起こし直すと直る)。→ 札を作る口を1つにして、壊れたら札ごと作り直す
  const newItem = () => { const it = bar.statusItemWithLength($.NSVariableStatusItemLength);
    try { if (!$.NSFileManager.defaultManager.fileExistsAtPath($(dir + '/nopark'))) it.autosaveName = $('meos.clock.' + (myScheme || 'vscodium')); } catch (e) {}
    return it; };
  let item = newItem();
// {* ▲mCN=0100_BOOT // end [cGJF=h] *}
// {* ▼mCN=0200_STYLED_TEXT // 札の字の飾り(⚓の傾き・縁・drawStyled) (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // ★v5.1.163(俊克 pm11:09「🛟をオフ→オンすると、メニューバーが混んでいると << が出るだけで気づき難い」): 名前の無い項目は作るたびに左端(先に隠れる所)へ置かれる。
  //   名前を付けて macOS に置き場所を覚えさせる= Cmd+ドラッグで右へ動かせば、入れ直しても起き直してもそこへ戻る。拡張側の係(MEOS_MENUBAR_JXA)も同じ名前
  //   ★v5.1.164(俊克 pm11:21「名前を与える、与えないを切り替えるボタンを…こういう仕組みがあることをユーザに教育する」): Me Dock の🅿️が切なら nopark の印= 名前を付けない(毎回左端)
  // ★v4.2.317(俊克 改良1「灰色の絵文字は目立たないので、文字の⚓にして…文字サイズを大きく」): ⚓だけ字の形(FE0E)
  // ★v4.2.319(俊克 改良2「縁0.4・下げ5で確定」「⚓を右5°くらい傾けようか?」): 赤の塗り＋黒の縁(字の大きさの1.6%)・20pt・下げ5・右へ5°
  const ANCHOR_TILT = 10;   // v4.2.321(俊克「傾き10°にしてみよう」)
  const styled = (t, font, hideA) => {
    const s = $.NSMutableAttributedString.alloc.init;
    const big = $.NSFont.boldSystemFontOfSize(20);   // v4.2.320: 太字(26ptは札からはみ出した・実測)
    let secDone = false;   // ★v5.1.486(俊克 11.04 am10:57「メニューバーの秒を赤文字に・.18 の . も含めて・⚓と同じく黒の縁」): 最初の時刻の .SS だけ
    for (const p of String(t).split(/(\u2693\ufe0f?)/)) {
      if (!p) continue;
      const isA = p.charAt(0) === '\u2693';
      const x = $.NSMutableAttributedString.alloc.init; x.mutableString.setString($(isA ? '\u2693\ufe0e' : p));
      const r = $.NSMakeRange(0, x.length);
      x.addAttributeValueRange($.NSFontAttributeName, isA ? big : font, r);
      x.addAttributeValueRange($.NSForegroundColorAttributeName, isA ? (hideA ? $.NSColor.clearColor : $.NSColor.systemRedColor) : $.NSColor.whiteColor, r);
      if (!isA && !secDone) { const sm = /\d(?::\d{2})?(\.\d{2})(?!\d)/.exec(p); if (sm) { secDone = true; const rs = $.NSMakeRange(sm.index + sm[0].length - 3, 3); x.addAttributeValueRange($.NSForegroundColorAttributeName, $.NSColor.colorWithSRGBRedGreenBlueAlpha(1, 0.3, 0.26, 1), rs); x.addAttributeValueRange($.NSStrokeWidthAttributeName, $(-1.5), rs);   /* v5.1.487(俊克「少しどす黒く見える」= 縁3%が小さい字の赤を食っていた→1.5%・明るい赤) */ x.addAttributeValueRange($.NSStrokeColorAttributeName, $.NSColor.blackColor, rs); } }   // v5.1.486: 秒= 赤＋黒の縁
      if (isA) {
        x.addAttributeValueRange($.NSBaselineOffsetAttributeName, $(-2), r);   // v4.2.322(俊克「メニューバーだけ下げを3に戻して」)→ v4.2.323「下げ2に」
        if (!hideA) { x.addAttributeValueRange($.NSStrokeWidthAttributeName, $(-1.6), r); x.addAttributeValueRange($.NSStrokeColorAttributeName, $.NSColor.blackColor, r); }
      }
      s.appendAttributedString(x);
    }
    return s;
  };
  // 字を描く= 全体は⚓を透明にして並べ、⚓だけを同じ場所へ傾けて描き直す(並びも背丈も全体と同じ物差し)
  const drawStyled = (t, font, x, y) => {
    styled(t, font, true).drawAtPoint($.NSMakePoint(x, y));
    const m = /\u2693\ufe0f?/.exec(String(t)); if (!m) return;
    const pre = String(t).slice(0, m.index);
    const pw = pre ? styled(pre, font, false).size.width : 0;
    const one = styled(pre + m[0], font, false);   // 前の字と同じ行の高さで⚓を測る
    const aw = one.size.width - pw, ah = one.size.height;
    const ctx = $.NSGraphicsContext.currentContext; ctx.saveGraphicsState;
    const tr = $.NSAffineTransform.transform;
    tr.translateXByYBy(x + pw + aw / 2, y + ah / 2); tr.rotateByDegrees(-ANCHOR_TILT); tr.translateXByYBy(-(x + pw + aw / 2), -(y + ah / 2)); tr.concat;
    styled(m[0], font, false).drawAtPoint($.NSMakePoint(x + pw, y + (ah - styled(m[0], font, false).size.height)));
    ctx.restoreGraphicsState;
  };
// {* ▲mCN=0200_STYLED_TEXT // end [cGJF=h] *}
// {* ▼mCN=0300_OPEN_WARP // エディターを起こす / 膜へワープ / 持ち主の生死 / 開けないワープの持ち越し (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  let appPath = '', appName = 'VSCodium', scheme = 'vscodium', ext = 'lai.lai-membrane';
  // ★拡張が居ない時の口(ここで決める物)= 'h:' で始まる
  let alarms = [], fired = {}, ringing = null, ringNext = 0, sound = { file: '', vol: 2, every: 1 };
  let adv = {};   // v4.2.332: 周期の時計をここで進めた分(id → {at, si})。state.json は拡張が居ない間は変わらないので、上に重ねて持つ
  const openApp = () => { try { if (appPath) $.NSWorkspace.sharedWorkspace.openURL($.NSURL.fileURLWithPath(appPath)); } catch (e) {} };
  const warpUrl = (a, bell, from) => scheme + '://' + ext + '/warp?uri=' + encodeURIComponent(a.uri || '') + '&key=' + encodeURIComponent(a.key || '')
    + '&name=' + encodeURIComponent(a.name || '') + (bell ? '&bell=1' : '') + (from ? '&from=' + from : '');   // v5.1.479: from= c(⏰の行)/t(TAG の行)= 拡張が⭐️を覚える
  const openUrl = (u) => { try { $.NSWorkspace.sharedWorkspace.openURL($.NSURL.URLWithString($(u))); } catch (e) {} };
  let bellTimer = null;
  const stopBell = () => { ringing = null; ringNext = 0; if (bellTimer) { bellTimer.invalidate; bellTimer = null; } };
  const ownerAlive = (pid) => pid > 0 && $.kill(pid, 0) === 0;
  let owner = 0;
  // ★v5.1.62(俊克 バグ1「VSCmが閉じているときに…ワープすると…さっき書き込んでいたものがない。Reopen Folderで…最後に書き込んでいた通りの状態」):
  //   URL で VSCodium を起こすと、いつものフォルダの窓を戻さず空の窓で開く= 日記はディスクの版で開き、書きかけの控え(Hot Exit)が戻らない。
  //   → 閉じている時は、まずアプリをふつうに起こし(フォルダの窓と控えが戻る)、MeOS が生きたのを見て2.5秒後に warp を送る。90秒起きなければ URL で送る。
  let pendingWarp = null;   // { url, at, seen }
  // ★v5.1.63(俊克「それでも、Reopen folderボタンが点滅しているのはなぜ?」): アプリをふつうに起こしても、VSCodium は「最後に使った窓」を戻す。
  //   一度 URL でフォルダなしの窓が開くと、それが最後の窓として残り(storage.json の lastActiveWindow に folder が無い)、以後も空の窓が戻っていた。
  //   → 行き先のファイルを含むフォルダ(拡張が覚えた meosLastFolders)を VSCodium で開く= どの窓が記録されていても、フォルダの窓と控えが戻る。
  let folders = [];
  const folderFor = (u) => { try { const m = /[?&]uri=([^&]*)/.exec(u); if (!m) return ''; let p = decodeURIComponent(m[1]); p = p.replace(/^[a-z-]+:(\/\/)?/, ''); p = decodeURIComponent(p);
    if (p.charAt(0) !== '/') p = '/' + p; return folders.find(d => d && (p + '').indexOf(d.replace(/\/+$/, '') + '/') === 0) || ''; } catch (e) { return ''; } };
  const openFolder = (d) => { try { if (appPath && d) return !!$.NSWorkspace.sharedWorkspace.openFileWithApplication($(d), $(appPath)); } catch (e) {} return false; };
  const openWarp = (u) => { if (ownerAlive(owner)) { openUrl(u); return; } pendingWarp = { url: u, at: Date.now(), seen: 0 };
    try { $(JSON.stringify({ url: u, t: Date.now() })).writeToFileAtomicallyEncodingError(dir + '/warp-pending.json', true, $.NSUTF8StringEncoding, null); } catch (e) {}   // v5.1.352: 拡張に「起動の位置戻しをするな・行き先が来る」と知らせる(拡張が受け取って消す)
    const d = folderFor(u); try { hlog('warp: ' + (d ? 'フォルダごと起こす ' + d : 'アプリを先に起こす')); } catch (e) {}
    if (!(d && openFolder(d))) openApp(); };
  const pendingWarpStep = (now) => { if (!pendingWarp) return;
    if (ownerAlive(owner)) { if (!pendingWarp.seen) pendingWarp.seen = now; if (now - pendingWarp.seen >= 2500) { const u = pendingWarp.url; pendingWarp = null; openUrl(u); } }
    else if (now - pendingWarp.at > 90000) { const u = pendingWarp.url; pendingWarp = null; openUrl(u); } };
// {* ▲mCN=0300_OPEN_WARP // end [cGJF=h] *}
// {* ▼mCN=0400_WAKE // 🌅 pmset の読み書き / 起動の予定 / 見本 presets (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // ★v5.0.0-47(俊克 2026.10.14 pm01:55「システムの自動起動タイマーを組み込もう。何世代前から設定できなくなった。今は毎朝手で電源ボタンを押している」
  //   → pm02:09 iMac M3 で `pmset schedule wakeorpoweron` によりシステム終了から自動起動できた(実測)):
  //   ★🌅 Wake = Mac の毎日の起動(または起こす)時刻。住まいは macOS(pmset)= ここは覚えず、毎回 `pmset -g sched` を読んで出す(突き合わせ)。
  //   ★読むのはパスワード不要。決める/外す時だけ macOS 本物の管理者パスワード欄(do shell script … with administrator privileges)= MeOS はパスワードに触れない。
  //   ★起動だけ(切る/眠らせるは出さない= 保存していない作業ごと切れるため。要る人が出たら pmset repeat の2つ目の枠として足す)
  // ★v5.0.0-49(俊克 -48テスト バグ1「メニューバーをクリックすると直ぐにメニューが閉じる」バグ2「1回目が開かない」):
  //   -47/48 は読む(do shell script)も書く(管理者のパスワード欄)も V-helper の中で待っていた＋パスワード欄のために V-helper を前へ出していた
  //   → クリックとぶつかるとメニューを取りこぼす。読むのも書くのも別の仕事(NSTask)に任せ、V-helper は待たない・前へ出ない。
  const WAKE_DAYS = { MTWRFSU: 'every day', MTWRF: 'weekdays', SU: 'weekends' };   // v5.0.0-48(俊克「Weekdayがあるなら、Weekendがあって当然」): pmset の S=土 U=日
  const WAKE_TIMES = ['05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00'];
  let wakeSeen = false;   // v5.1.552: pmset を1度でも読めた= wake の null は本当に「予定なし」
  let wake = null, wakeReadAt = 0;   // {days:'MTWRFSU'|'MTWRF'|'SU'|'', hm:'06:30'|'', raw:'…'} / null= 予定なし
  let wakeRead = null, wakeJob = null;   // 走っている読む仕事 / 書く・訊く仕事 {t, p, kind, days}
  const task = (args) => { const t = $.NSTask.alloc.init; t.launchPath = $('/usr/bin/' + args[0]); t.arguments = $(args.slice(1));
    const p = $.NSPipe.pipe; t.standardOutput = p; t.standardError = $.NSFileHandle.fileHandleWithNullDevice; t.launch; return { t, p }; };
  const taskOut = (j) => { try { const d = j.p.fileHandleForReading.readDataToEndOfFile; return ObjC.unwrap($.NSString.alloc.initWithDataEncoding(d, $.NSUTF8StringEncoding)) || ''; } catch (e) { return ''; } };
  const parseWake = (txt) => {
    let inRep = false, w = null;
    for (const ln of String(txt).split(/[\r\n]+/)) {
      if (/^Repeating power events/i.test(ln)) { inRep = true; continue; }
      if (/power events/i.test(ln)) { inRep = false; continue; }
      if (!inRep || !/(wake|poweron)/i.test(ln)) continue;
      const raw = ln.trim(), m = /at\s+(\d{1,2}):(\d{2})\s*([AP]M)?/i.exec(raw);
      let hm = '';
      if (m) { let h = parseInt(m[1], 10); if (m[3]) { h = h % 12; if (/p/i.test(m[3])) h += 12; } hm = (h < 10 ? '0' : '') + h + ':' + m[2]; }
      let days = /every day/i.test(raw) ? 'MTWRFSU' : (/weekdays/i.test(raw) ? 'MTWRF' : (/weekends/i.test(raw) ? 'SU' : ''));
      if (!days) {   // v5.0.0-51: 曜日を選んだ予定(月水金など)= 曜日の名前か MTWRFSU の字で書かれている所を拾う(書き方は実測待ち)
        const tail = raw.replace(/^.*?\bat\s+\d{1,2}:\d{2}\s*([AP]M)?/i, ''), N = { mon: 'M', tue: 'T', wed: 'W', thu: 'R', fri: 'F', sat: 'S', sun: 'U' };
        let got = ''; (tail.match(/\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*/gi) || []).forEach(x => { got += N[x.slice(0, 3).toLowerCase()]; });
        if (!got) { const m2 = /\b([MTWRFSU]{1,7})\b/.exec(tail); if (m2) got = m2[1]; }
        days = 'MTWRFSU'.split('').filter(c => got.indexOf(c) >= 0).join('');
      }
      w = { days, hm, raw }; break;
    }
    // ★v5.1.501(俊克 11.05 am10:05「エディター上は後5分なのに、mGATE上は月曜のam7:54を指している。なぜ?」):
    //   読んでいたのは繰り返し(組の保険)だけ。⛓️ の組の本当の次は「MeOS の名の1回の予定」= その中で一番早い未来を出す。
    let next = 0;
    for (const ln of String(txt).split(/[\r\n]+/)) {
      if (ln.indexOf("'MeOS'") < 0) continue;
      const m = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2})/.exec(ln); if (!m) continue;
      let y = +m[3]; if (y < 100) y += 2000;
      const t = new Date(y, +m[1] - 1, +m[2], +m[4], +m[5], 0, 0).getTime();
      if (t > Date.now() && (!next || t < next)) next = t;
    }
    if (next) { w = w || { days: '', hm: '', raw: '' }; w.next = next; }
    return w;
  };
  const readWake = () => { if (wakeRead) return; wakeReadAt = Date.now(); try { loadPresets(); } catch (e) {} try { wakeRead = task(['pmset', '-g', 'sched']); } catch (e) { wakeRead = null; } };
  // ★v5.0.0-51(俊克「平日の設定のオプションとして、チェックボックスで月曜～金曜を選択できるように。これで昔のmacOS並になる」):
  //   「Weekdays」の席は曜日の組(presets.wd・月〜金の中から1つ以上)を持つ。種類(kind)は3つのまま= 毎日 MTWRFSU / 平日の席 MTWRF / 週末 SU
  const DAY_NAME = { M: 'Mon', T: 'Tue', W: 'Wed', R: 'Thu', F: 'Fri', S: 'Sat', U: 'Sun' };
  const kindOf = (d) => !d ? '' : (d === 'MTWRFSU' ? 'MTWRFSU' : (/^[SU]+$/.test(d) ? 'SU' : (/^[MTWRF]+$/.test(d) ? 'MTWRF' : '')));   // v5.0.0-55: 週末の席も土/日の片方を持てる
  const dayLabel = (d) => WAKE_DAYS[d] || d.split('').map(c => DAY_NAME[c]).join(' ');
  const wakeLabel = () => { if (!wake) return 'off';
    if (wake.next) { const d = new Date(wake.next), p = (x) => (x < 10 ? '0' : '') + x; return p(d.getHours()) + ':' + p(d.getMinutes()) + ' ' + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] + ' (chaining)'; }   // v5.1.501
    return (wake.hm || '?') + ' ' + (wake.days ? dayLabel(wake.days) : wake.raw); };
  const asq = (x) => String(x).replace(/["\\]/g, '');   // AppleScript の "…" に入れる字(決まった字しか来ないが念のため)
  const setWake = (kind, hm) => {
    const days = kind === 'MTWRF' ? presets.wd : (kind === 'SU' ? presets.we : kind);   // v5.0.0-51: 平日の席は選んだ曜日 / v5.0.0-55: 週末の席も
    if (wakeJob || !WAKE_DAYS[kind] || !/^[MTWRFSU]+$/.test(days) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hm)) return;   // 決まった字だけを命令に入れる
    wakeJob = Object.assign(task(['osascript', '-e', 'do shell script "/usr/bin/pmset repeat wakeorpoweron ' + days + ' ' + hm + ':00" with administrator privileges with prompt "'
      + asq('MeOS wGATE will start up (or wake) your Mac at ' + hm + ' ' + dayLabel(days) + '.') + '"']), { kind: 'set', days, hm });
  };
  const offWake = () => { if (wakeJob) return;
    wakeJob = Object.assign(task(['osascript', '-e', 'do shell script "/usr/bin/pmset repeat cancel" with administrator privileges with prompt "MeOS wGATE will turn off the daily start-up of your Mac."']), { kind: 'off' }); };
  const askWakeTime = (days) => { if (wakeJob || !WAKE_DAYS[days]) return;   // v5.0.0-50: 既定値はその種類の覚えた時刻
    wakeJob = Object.assign(task(['osascript', '-e', 'text returned of (display dialog "Start-up time, ' + WAKE_DAYS[days] + ' (24-hour, HH:MM)" default answer "' + asq(presets[days] || '06:30')
      + '" buttons {"Cancel", "Set"} default button "Set" with title "MeOS - Wake")']), { kind: 'ask', days }); };
  // 0.5秒の見回りで、終わった仕事を片付ける(待たない)
  const wakePoll = () => {
    if (wakeRead && !wakeRead.t.isRunning) { const rcW = wakeRead.t.terminationStatus, o = taskOut(wakeRead); wakeRead = null; const w = parseWake(o); if (rcW === 0) wakeSeen = true;
      // ★v5.0.0-53(実測 2026.10.14 pm04:04: 月水木金を入れると `wakepoweron at 6:30AM Some days`= どの曜日かは言わない): 時刻が合えば、入れた時に覚えた曜日を使う
      if (w && !w.days && /some days/i.test(w.raw) && presets.applied && presets.applied.hm === w.hm) w.days = presets.applied.days;
      if (JSON.stringify(w) !== JSON.stringify(wake)) { wake = w; lastMenu = null; }
      const wk = w ? kindOf(w.days) : '';   // v5.0.0-51: 平日の席は曜日の組も macOS の答えに合わせる
      if (wk && w.hm && presets[wk] !== w.hm) { presets[wk] = w.hm; savePresets(); lastMenu = null; } }   // v5.0.0-54(俊克 バグ1「火曜にチェックを入れてパスワードを入れたのに変わらない」): □の曜日は「次に入れる下書き」= macOS に合わせて上書きしない(30秒ごとに月水木金へ戻していた)   // v5.0.0-50: 効いている物は macOS が正
    if (wakeJob && !wakeJob.t.isRunning) { const j = wakeJob; wakeJob = null; const rc = j.t.terminationStatus, o = taskOut(j);
      if (j.kind === 'ask') { const t = String(o).trim().replace(/^(\d):/, '0$1:'); if (rc === 0 && /^([01]\d|2[0-3]):[0-5]\d$/.test(t)) presetTime(j.days, t); else if (rc === 0) hlog('wake: 時刻の形が違う ' + t); }
      else { hlog('wake: ' + j.kind + (j.days ? ' ' + j.days + ' ' + j.hm : '') + (rc === 0 ? ' ok' : ' 取りやめ/失敗 rc=' + rc));
        if (rc === 0) { presets.applied = j.kind === 'set' ? { days: j.days, hm: j.hm } : null; savePresets(); for (const k in rowTouched) delete rowTouched[k]; }   // v5.0.0-56: 入れたら↵は消える   // v5.0.0-53: 曜日を選んだ予定は macOS が「Some days」としか答えない→ 入れた曜日は自分で覚える
        readWake(); } }
    if (!wakeRead && (!wakeReadAt || Date.now() - wakeReadAt > 30000)) readWake();
  };
  // ★v5.0.0-50(俊克 -49テスト 改良1「切り替える時、一々時刻を選び直すのが面倒。設定値を3つ予め設定しておき、どれかに切り替えた時にpasswordを要求」):
  //   3つの時刻(毎日/平日/週末)は V-helper が覚える(wake-presets.json・VSCodium と本家の2人で共有)。macOS に入るのは選んだ1つだけ。
  //   ★時刻を変えるだけならパスワード不要(覚え直すだけ)。今効いている物の時刻を変えた時と、切り替えた時だけ macOS へ入れる(パスワード)。
  //   ★今効いている物の時刻は macOS の答えが正= 読むたびに覚えの方を合わせる(突き合わせ)。
  const presetPath = sharedDir + '/wake-presets.json';
  let presets = { MTWRFSU: '06:30', MTWRF: '06:30', SU: '08:00', wd: 'MTWRF', we: 'SU' };
  const loadPresets = () => { try { const x = $.NSString.stringWithContentsOfFileEncodingError(presetPath, $.NSUTF8StringEncoding, null);
    if (x && !x.isNil()) { const o = JSON.parse(ObjC.unwrap(x)); for (const k in WAKE_DAYS) if (/^([01]\d|2[0-3]):[0-5]\d$/.test(o[k] || '') && presets[k] !== o[k]) { presets[k] = o[k]; try { lastMenu = null; } catch (e2) {} }
      if (/^[MTWRF]+$/.test(o.wd || '') && presets.wd !== o.wd) { presets.wd = o.wd; try { lastMenu = null; } catch (e2) {} }
      if (/^[SU]+$/.test(o.we || '') && presets.we !== o.we) { presets.we = o.we; try { lastMenu = null; } catch (e2) {} }
      if (o.applied && /^[MTWRFSU]+$/.test(o.applied.days || '') && /^([01]\d|2[0-3]):[0-5]\d$/.test(o.applied.hm || '')) presets.applied = { days: o.applied.days, hm: o.applied.hm }; } } catch (e) {} };   // 起動の最初は lastMenu がまだ無い(let の手前)
  loadPresets();   // 30秒ごとの読み直しでも呼ぶ= もう1人(VSCodium/本家)が覚え直した時刻も揃う
  const savePresets = () => { try { $(JSON.stringify(presets)).writeToFileAtomicallyEncodingError(presetPath, true, $.NSUTF8StringEncoding, null); } catch (e) {} };
  const presetTime = (days, hm) => {   // 時刻を覚え直す。今効いている物なら macOS にも入れる
    if (!WAKE_DAYS[days] || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hm)) return;
    presets[days] = hm; savePresets(); lastMenu = null;
    if (wake && kindOf(wake.days) === days && wake.hm !== hm) setWake(days, hm);
  };
// {* ▲mCN=0400_WAKE // end [cGJF=h] *}
// {* ▼mCN=0500_WAKE_ROWS // 🌅 メニューの行(曜日の□・押した時) (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // ★v5.0.0-55(俊克 -54テスト 改良1「週末も2つから選択できるようにしようか?」): □の行を平日/週末の2つに一般化。
  //   席ごとに: 曜日の字(pmset)・見せる字(MeOS の S-M-T-W-t-F-s= 土は s・日は S)・覚え場所(presets.wd / presets.we)
  const ROWS = { MTWRF: { name: 'Weekdays', letters: 'MTWRF', shown: 'MTWtF', key: 'wd' }, SU: { name: 'Weekends', letters: 'SU', shown: 'sS', key: 'we' } };
  const ROW_KINDS = ['MTWRF', 'SU'];
  const toggleDay = (kind, c) => {   // v5.0.0-51: 席の曜日を入れ外し(最後の1つは外さない)。覚えるだけ= macOS へは席の札を押した時(パスワード)
    const R = ROWS[kind]; if (!R || R.letters.indexOf(c) < 0) return;
    let d = presets[R.key].indexOf(c) >= 0 ? presets[R.key].replace(c, '') : presets[R.key] + c;
    d = R.letters.split('').filter(x => d.indexOf(x) >= 0).join('');
    if (!d) return;
    if (rowTouched[kind] === undefined) rowTouched[kind] = presets[R.key];   // 触る前の姿を控える
    presets[R.key] = d; savePresets(); lastMenu = null;
  };
  // ★v5.0.0-52: 1行に部品を並べる= メニュー項目に自前の板(NSView)。□は押してもメニューが閉じない(続けて選べる)。札を押すと閉じて macOS へ入れる。
  // ★v5.0.0-53: □は SF Symbols の四角＋チェックに V-helper の色(VSCodium=橙/VS Code=紫)。字の左端は上下の行に揃える(実測: チェックの列が無い時 15.5pt / 有る時 30.5pt)
  // ★v5.0.0-54: □と字を1組に詰め組の間を空ける(札 150pt・組 42pt おき・台で描いて確認)。□が macOS と違う間は札を V-helper の色＋↵
  const rowActive = (kind) => !!(wake && kindOf(wake.days) === kind);
  // v5.0.0-56(俊克 -55テスト 改良1「週末の✓を変えたのに、ここをクリックしろという表示が出ない。二回目以降は出る。1回目が出ないので戸惑う」):
  //   効いていない席は「□を触ったか」で出す(入れたら消える)。効いている席は macOS と違うか。
  // v5.0.0-57(俊克 -56テスト バグ1「週末は✓を入れて外すと橙が消える。平日ではそうならない」): 効いていない席も「触る前の姿と違うか」で判断(元に戻せば消える)。
  //   rowTouched= 席ごとの触る前の曜日(初めて触った時に控え、macOS へ入れたら捨てる)
  const rowTouched = {};
  const rowPending = (kind) => rowActive(kind) ? wake.days !== presets[ROWS[kind].key] : (rowTouched[kind] !== undefined && rowTouched[kind] !== presets[ROWS[kind].key]);
  const rowTitle = (kind) => ROWS[kind].name + '   ' + presets[kind] + (rowPending(kind) ? '  ↵' : '');
  const rowParts = {};   // kind → { lab, boxes }
  const rowColor = () => myScheme === 'vscode' ? $.NSColor.colorWithSRGBRedGreenBlueAlpha(0x7c / 255, 0x3a / 255, 0xed / 255, 1) : $.NSColor.colorWithSRGBRedGreenBlueAlpha(0xe0 / 255, 0x80 / 255, 0x3a / 255, 1);
  const atext = (t, font, col) => { const a = $.NSMutableAttributedString.alloc.init; a.mutableString.setString($(t)); const r = $.NSMakeRange(0, a.length);
    a.addAttributeValueRange($.NSFontAttributeName, font, r); a.addAttributeValueRange($.NSForegroundColorAttributeName, col, r); return a; };
  const paintBox = (b, on) => { try { b.image = $.NSImage.imageWithSystemSymbolNameAccessibilityDescription($(on ? 'checkmark.square.fill' : 'square'), $(''));
    b.contentTintColor = on ? rowColor() : $.NSColor.secondaryLabelColor; } catch (e) {} };
  const repaintRow = (kind) => { const P = rowParts[kind], R = ROWS[kind]; if (!P) return;
    P.boxes.forEach((x, i) => paintBox(x, presets[R.key].indexOf(R.letters.charAt(i)) >= 0));
    P.lab.attributedTitle = atext(rowTitle(kind), $.NSFont.menuFontOfSize(0), rowPending(kind) ? rowColor() : $.NSColor.labelColor); };
  // tag = 席の番号×10 + □の番号(札は □の番号 9)
  ObjC.registerSubclass({ name: 'MeOSDayRowT', methods: {
    'day:': { types: ['void', ['id']], implementation: function (b) { try { const t = Number(b.tag), kind = ROW_KINDS[Math.floor(t / 10)];
      toggleDay(kind, ROWS[kind].letters.charAt(t % 10)); repaintRow(kind); } catch (e) {} } },
    'use:': { types: ['void', ['id']], implementation: function (b) { try { item.menu.cancelTracking; } catch (e) {}
      try { const kind = ROW_KINDS[Math.floor(Number(b.tag) / 10)]; setWake(kind, presets[kind]); lastMenu = null; } catch (e) {} } } } });
  const wdRowT = $.MeOSDayRowT.alloc.init;   // 強く持つ
  const makeDayRow = (kind) => {
    const R = ROWS[kind], ki = ROW_KINDS.indexOf(kind);
    const font = $.NSFont.menuFontOfSize(0), H = 22, LW = 150, STEP = 42, v = $.NSView.alloc.initWithFrame($.NSMakeRect(0, 0, 0, H));
    const col = !!(wake && kindOf(wake.days) === 'MTWRFSU');   // 普通の行(Every day)に✓が付いている= チェックの列が有る
    const TX = col ? 30.5 : 15.5;
    if (rowActive(kind)) { const ck = $.NSTextField.labelWithString($('✓')); ck.font = font; ck.textColor = $.NSColor.labelColor; ck.frame = $.NSMakeRect(0, 2, 14, H - 4); v.addSubview(ck); }
    const lab = $.NSButton.alloc.initWithFrame($.NSMakeRect(TX - 1, 0, LW, H)); lab.tag = ki * 10 + 9;
    lab.bordered = false; lab.alignment = 0; lab.target = wdRowT; lab.action = 'use:'; v.addSubview(lab);
    const boxes = [];
    R.shown.split('').forEach((c, i) => { const cb = $.NSButton.alloc.initWithFrame($.NSMakeRect(TX + LW + 4 + i * STEP, 0, STEP - 4, H));
      cb.bordered = false; cb.imagePosition = 2; cb.alignment = 0; cb.attributedTitle = atext(' ' + c, font, $.NSColor.labelColor); cb.tag = ki * 10 + i;
      cb.target = wdRowT; cb.action = 'day:'; v.addSubview(cb); boxes.push(cb); });
    rowParts[kind] = { lab, boxes }; repaintRow(kind);
    v.setFrameSize($.NSMakeSize(TX + LW + 4 + 5 * STEP + 16, H));   // 右に余白 16pt(週末も平日と同じ幅= 札の位置が揃う)
    return v;
  };
// {* ▲mCN=0500_WAKE_ROWS // end [cGJF=h] *}
// {* ▼mCN=0600_MENU_CLICK // メニュー項目を押した時(pick:) / 最後の予定 / optWarp (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // ★v5.0.0-58(俊克 pm07:23〜08:00「これもテキストデータにしよう… 膜名 🌅LaunchD_TS」): 起動の予定を決めるのは本文の 🌅LaunchD の膜(▶️で入る)。
  //   メニューは今の姿を見せるだけ(ここでも決められると、本文と macOS の2つの道が食い違う)。-50〜57 の □/時刻の仕掛けは使わない。
  const wakeEntries = () => [{ id: 'launchd', title: '\ud83c\udf05 Wake   ' + wakeLabel() }, { sep: true }];   // v5.0.0-59: 押すと 🌅LaunchD の膜へ(他の時計の行と同じ)
  let menuUp = false, lastHoldN = -1;   // ★v5.1.619(俊克 am11:29 バグ1「メニューリストを表示したままにしてあると、やはり、まだゴミが残るよ。なぜ?」): 実測= 開いている間に events.log に「作り直す n=40 前=41」。wGATE は runUntilDate で回るので tracking() は開いていても偽= 作り替えが走り、画面の古いメニューは誰も更新しなくなっていた(614 の隠す口にも入らなかった)。開いているかは delegate の開閉で知る
  let menuOpenAt = 0, menuPickedAt = 0, menuOptAt = 0, reopenAt = 0, reopenTries = 0, renewItem = false, noRestartUntil = 0;   // v5.1.333〜335
  ObjC.registerSubclass({ name: 'MeOSHelperTarget', methods: { 'pick:': { types: ['void', ['id']], implementation: function (s) { menuPickedAt = Date.now();
    let id = ''; try { id = ObjC.unwrap(s.representedObject) || ''; } catch (e) {}
    if (id.indexOf('h:') === 0) {                         // 拡張が居ない時のメニュー= ここで片付ける
      if (id === 'h:stop') { stopBell(); return; }
      if (id.indexOf('h:wk:') === 0) { const u = /^h:wk:use:([A-Z]+)$/.exec(id), q = /^h:wk:t:([A-Z]+):(.+)$/.exec(id) || [];   // v5.0.0-50: use= 切り替え / t= 時刻を覚える   // v5.0.0-47: 🌅 Wake / v5.0.0-48(俊克 バグ「7:00をクリックしても変更できない」): ':' で切ると 07:00 の中の ':' でも切れて時刻が「07」になっていた→ 曜日の後ろは丸ごと時刻
        if (id === 'h:wk:off') offWake(); else if (u) setWake(u[1], presets[u[1]]); else if (q[2] === 'ask') askWakeTime(q[1]); else if (q[1] && q[2]) presetTime(q[1], q[2]); lastMenu = null; return; }
      if (id === 'h:open') { openApp(); return; }
      // ★v4.2.363(俊克「helperは常駐なので、アプリの終了、起動を行える。Dockの代わりにする」): 閉じている間に降ろす口。
      //   印(off-by-user)を置いて降りる= 次にアプリを開いた時、拡張がそれを見て設定を切る。ログイン時に起きないよう LaunchAgent の plist も外す。
      if (id === 'h:quithelper') {
        try { $('1').writeToFileAtomicallyEncodingError(dir + '/off-by-user', true, $.NSUTF8StringEncoding, null); } catch (e) {}
        try { $(JSON.stringify({ t: Date.now(), pid: 0, app: 'V-helper' })).writeToFileAtomicallyEncodingError(sharedDir + '/vhelper-off.json', true, $.NSUTF8StringEncoding, null); } catch (e) {}   // v4.2.371/372: 両方のアプリと、もう1人の係へ
        try { $.NSFileManager.defaultManager.removeItemAtPathError($(ObjC.unwrap($.NSHomeDirectory()) + '/Library/LaunchAgents/' + myLabel + '.plist'), null); } catch (e) {}
        hlog('quit: メニューの Quit V-helper'); stopBell(); quitNow = true; return;
      }
      // ★v4.2.459(俊克「アプリを閉じている時でも、パスすることで次の予定に移れるように」): 鳴った時と同じ「次へ進める」を音なしで。
      //   記録は passed.json= 次にアプリを開いた時、拡張が床として引き継ぐ。戻すのは飛ばした回がまだ先の時だけ。
      if (id === 'h:pass') { const now = Date.now(); const nx = alarms.filter(a => !fired[a.id + '@' + a.at] && a.at > now).sort((x, y) => x.at - y.at)[0]; if (!nx) return;
        const prev = adv[nx.id] ? Object.assign({}, adv[nx.id]) : null;
        fired[nx.id + '@' + nx.at] = 1;
        if (Array.isArray(nx.chain) && nx.chain.length) { const n2 = chainNext(nx, nx.at); if (n2) adv[nx.id] = n2; }
        else if (Array.isArray(nx.steps) && nx.steps.length) { const si = nx.si || 0; adv[nx.id] = { at: nx.at + nx.steps[si % nx.steps.length], si: si + 1 }; }
        lastPass = { id: nx.id, at: nx.at, prev, name: nx.name || nx.key || '' };
        try { $(JSON.stringify({ uri: nx.uri || '', key: nx.key || '', at: nx.at, name: lastPass.name, t: now })).writeToFileAtomicallyEncodingError(dir + '/passed.json', true, $.NSUTF8StringEncoding, null); } catch (e) {}
        return; }
      if (id === 'h:unpass') { if (!lastPass || lastPass.at <= Date.now()) { lastPass = null; return; }
        delete fired[lastPass.id + '@' + lastPass.at];
        if (lastPass.prev) adv[lastPass.id] = lastPass.prev; else delete adv[lastPass.id];
        try { $.NSFileManager.defaultManager.removeItemAtPathError($(dir + '/passed.json'), null); } catch (e) {}
        lastPass = null; return; }
      if (id.indexOf('h:f') === 0) { const it = fusenRows[parseInt(id.slice(3), 10)]; if (it) openWarp(scheme + '://' + ext + '/fusen?uri=' + encodeURIComponent(it.uri || '') + '&k=' + encodeURIComponent(it.k || 'c') + '&line=' + (it.line || 0) + '&ch=' + (it.ch || 0)); return; }   // v5.1.348: 付箋の行= 起こしてその付箋へ
      if (id.indexOf('h:t') === 0) { const it = tagRows[parseInt(id.slice(3), 10)]; if (it) openWarp(warpUrl(it, false, 't')); return; }   // v4.2.342: Tag&Go の行   // v5.1.62: 閉じていればアプリを先に
      const a = alarms[parseInt(id.slice(2), 10)]; if (a) { stopBell(); openWarp(warpUrl(a, false, 'c')); }
      return;
    }
    try { $(JSON.stringify({ id: id, t: Date.now() })).writeToFileAtomicallyEncodingError(clickPath, true, $.NSUTF8StringEncoding, null); } catch (e) {}
    if (id !== 'quitapp' && id !== 'quithelper' && id !== 'pass' && id !== 'unpass') openApp();   // v4.2.363: 終了を押したのに起こし直さない / v4.2.459: pass は前へ出さない
  } } } });
  let lastPass = null;   // v4.2.459: 閉じている間に最後に pass した1本 {id, at, prev, name}
  let optTarget = null, tagRows = [], fusenRows = [];   // v5.1.348: fusenRows= 閉じている時の付箋の行   // v4.2.337: 札に出ている時計(拡張が居ない時)
  const optWarp = () => {
    if (ownerAlive(owner)) { try { $(JSON.stringify({ id: 'optwarp', t: Date.now() })).writeToFileAtomicallyEncodingError(clickPath, true, $.NSUTF8StringEncoding, null); } catch (e) {} openApp(); return; }
    if (optTarget) { stopBell(); openWarp(warpUrl(optTarget, false)); } else openApp();
  };
// {* ▲mCN=0600_MENU_CLICK // end [cGJF=h] *}
// {* ▼mCN=0650_MENU_OPEN // メニューが開く時(menuWillOpen)= 札のどこを押したかの振り分け(ロゴ・ピース・Opt) (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // ★v4.2.337(俊克「Optクリックでメニューバーをクリックすると、VSCmを起動する。あるいは、今表示している膜にワープする」):
  //   メニューが開く直前に Opt を見て、押されていればメニューを畳み、札に出ている膜へワープする。
  // ★v5.1.330(俊克 10.30 am11:23 バグ1「スクショを macOS のプレビューの『削除』で捨てた後、メニューバーが開かなくなった・前の版も同じ所で」): 測る口= 開く/閉じる/Optで取り消した/作り直した を events.log へ([menu])
  ObjC.registerSubclass({ name: 'MeOSMenuDelH', protocols: ['NSMenuDelegate'], methods: { 'menuWillOpen:': { types: ['void', ['id']], implementation: function (m) {
    let fl = 0; try { fl = Number($.NSEvent.modifierFlags); } catch (e) {}
    menuOpenAt = Date.now(); menuUp = true;   // v5.1.619
    cycRevLoad();   // v5.1.364
    dashFit(m);   // ★v5.1.405(俊克 11.02 am11:31「一点鎖線の長さを変えているのは意図的か?」= 意図ではない): 線の絵の幅は作った時の幅のまま、後でメニューが広がっても伸びなかった(全部同じ所で止まり、区切り線より短い)＋淡い灰で背景に溶けて長さが違って見えた→ 開く直前に今のメニューの幅へ伸ばす・絵はテンプレート(明暗に合わせて黒/白)×0.45= 区切り線と同じ調子
    try { hlog('[menu] open flags=0x' + fl.toString(16) + ' items=' + m.numberOfItems + (m.isEqual(item.menu) ? '' : ' (古いメニュー)')); } catch (e) {}
    try { const _q = pieceHit(); if (_q === '\u0000logo') { m.cancelTracking; const _cm = (fl & 0x100000) !== 0, _sh = (fl & 0x20000) !== 0;
        if (_cm) { hlog('[menu] 札のロゴを Cmd クリック→ エディターを終える'); edQuit(); } else if (_sh) { dockOutToggle('札のロゴを Shift クリック'); } else { hlog('[menu] 札のロゴをクリック→ 最前面/起動'); edLaunch(); } return; }   // ★v5.1.468(俊克 am02:43「Barman が出ていなくても、メニューバーだけで終了・Shiftクリックで Barman のオン/オフ」): 467 を戻し Shift= 出す/閉じる   // v5.1.463
      if (_q === '\u0000quit') { hlog('[menu] 札の終了ボタンを押した→ 閉じてエディターを終える(Barman はそのまま)'); m.cancelTracking; edQuit(); return; }
      if (_q === '\u0000launch') { hlog('[menu] 札の自分のアイコンを押した→ 何もしない(名札)'); m.cancelTracking; return; }   // ★v5.1.446(俊克「VSCm/VSCodeロゴは自分自身が何者かだけを示す(何も起動しない)」)
      if (_q === '\u0000launch2') { hlog('[menu] 札のもう一方のエディターを押した→ 起こす'); m.cancelTracking; launchBid(otherBundle()); return; } } catch (e) {}   // v5.1.439   // v5.1.437
    // ★v5.1.438(俊克 pm00:50 改良1「2つのパズルボタンを押すと、mGATEが一瞬消えてから再描画される。mGATEをクリックした時は自然に切り替る。同じように」): ピースを押した時は Barman を閉じない(Barman のタイルと同じ= 出しっぱなしの時だけワープで消す)
    let _hc0 = ''; try { _hc0 = pzl.ch ? pieceHit() : ''; } catch (e) {} if (_hc0) pieceClickAt = Date.now();
    if (!_hc0 && !dockOut.pin) { try { dockOutHide(); } catch (e) {} }   // v5.1.446: 出しっぱなしはメニューを開いても消さない   // v5.1.412: メニューを開いたら出張所は閉じる
    try { const hc = _hc0; if (hc && hc.charAt(0) !== '\u0000') { hlog('[menu] 札の右端のピース ' + hc + (hc === pzl.ch ? '(最後)' : '(1つ前)') + ' を押した→ 閉じてワープ'); m.cancelTracking;
      if (hc !== pzl.ch) { pzl = { ch: hc, lv: pzl.lv, prev: pzl.ch, ord: pzl.ord, dots: pzl.dots }; try { step(); } catch (x) {} }   // v5.1.407: 1つ前を押した= 拡張の返事を待たずに入れ替えて描く(続けて押せる)
      try { if (!dockOut.shown) dockOutShow(); if (!dockOut.pin) dockOut.pin = 'piece'; dockOutPaint(); hlog('[dockOut] ピースで出しっぱなし'); } catch (x) {}   // v5.1.441: 札のピースでは(構えで出した時も)消さない   // v5.1.438 / ★v5.1.440(俊克 pm01:04「マウスをエディターのほうに移動すると、mGATEが閉じてしまう」→「出しっぱなしにして」): ピースを押したら出しっぱなし(pin='piece')= ワープでも字が変わっても消さない・消すのはメニューバーの地とメニュー
      openWarp(scheme + '://' + ext + '/puzzle?ch=' + encodeURIComponent(hc)); return; } } catch (e) {}   // v5.1.402
    try { if ((fl & 0x80000) === 0) return; hlog('[menu] Opt が押されている→ 閉じて膜へ'); menuOptAt = Date.now(); m.cancelTracking; optWarp(); } catch (e) {}
  } }, 'menuDidClose:': { types: ['void', ['id']], implementation: function (m) { menuUp = false; const now = Date.now(), quick = now - menuOpenAt < 150 && menuPickedAt < menuOpenAt && menuOptAt < menuOpenAt;
    try { hlog('[menu] close' + (quick ? ' (' + (now - menuOpenAt) + 'ms= 指を放した所で閉じた)' : '')); } catch (e) {} freshMenu = true;
    if (quick && now > noRestartUntil) { renewItem = true; reopenAt = now + 60; } } } } });   // v5.1.334〜335: すぐ閉じた= V-helper ごと起こし直す(起こし直した直後30秒はしない= 回り続けない)
// {* ▲mCN=0650_MENU_OPEN // end [cGJF=h] *}
// {* ▼mCN=0700_MENU_PARTS // 付箋の絵 / 🔴▶ / ⭐️ / 見出しの部品 (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // ★v5.1.333(俊克 pm00:05 v5.1.332「改善なし」): 実測= 作り直しても、V-helper を起こし直しても、開いて約0.04秒(= クリックの指を放すまで)で閉じる。MeOS は閉じていない(Opt も押されていない)。
  //   macOS の中の事なので、手当て= 指を放した所で閉じたら(150ms 未満・何も選んでいない)、指が離れた後に V-helper が自分でもう一度開く(2回まで)
  // ★v5.1.332(俊克 10.30 am11:50「VSCm の V-helper を何度か押した後に本家を押すと、本家は1回だけ出て直ぐ閉じる・その後は開く」): 実測の筋=
  //   スクショの小窓のメニューで削除した後、押されたメニューは開いて0.05秒で閉じる(MeOS は閉じていない)。古い版はその後で開く= 毎秒メニューを作り直して差し替えていた(閉じている間)。
  //   v5.1.328 で「並びが同じなら差し替えない」にしたので、壊れたメニューを持ち続けて二度と開かなくなった。→ 閉じるたびに1回だけ作り直して差し替える(毎秒ではない)
  let freshMenu = false;
  ObjC.registerSubclass({ name: 'MeOSReopenH', methods: { 'go:': { types: ['void', ['id']], implementation: function (t) { try { hlog('[menu] もう一度開く(' + reopenTries + '回目)'); item.button.performClick($()); } catch (e) {} } } } });
  const reopener = $.MeOSReopenH.alloc.init;   // v5.1.333: 強く持つ
  const mdel = $.MeOSMenuDelH.alloc.init;   // 強く持つ
  const tgt = $.MeOSHelperTarget.alloc.init;   // 強く持つ(弱い参照だと消されてクリックが届かない= v4.2.205の穴)
  // ★v5.1.310(俊克 10.29 pm08:19 v5.1.309 バグ1「付箋がまったく表示されない・Tagのリストがズラッと出る」): v5.1.308 で拡張の JXA にだけ FUSEN の群を教え、
  //   V-helper(こちら)の build に教えていなかった= 題の無い群の項目で $(undefined) が投げてメニューごと作れず、拡張が居ない時の並びに落ちていた。
  //   → 同じ作りをこちらにも。群= 見出し＋常駐1＋5枠＋▲▼(メニューの中のボタン= 押しても閉じない)。
  const pagers = [];
  const fusenOff = {};   // v5.1.347(俊克 改良1「スライダーで3/3を表示したとき、その移動を記憶…閉じて再度開くと1/3になる」): 群の名前→送った位置(閉じて作り直しても覚えている)
  const fusenFold = { '\u0000all': true, '\u0000ovCB': true, '\u0000ovIC': true };   // v5.1.312(俊克 改良2「CB FUSEN、IC FUSEN という部分をクリックすることで折り畳めるように」): 群の名前→畳んだか(作り直しても覚えている)
  // ★v5.1.314(俊克 改良1「CB/IC FUSEN の文字を濃く。未登録なら薄くても良い」・改良2「付箋らしい絵を作ってみる?」):
  //   見出しの字= 付箋が在れば濃い(labelColor)・無ければ薄い。絵= 日本の付箋(細長い紙の端だけ色)を描く。CB は橙の端・IC は青の端。
  const rgb = (r, g, b) => $.NSColor.colorWithSRGBRedGreenBlueAlpha(r / 255, g / 255, b / 255, 1);
  const fusenIcon = (tab) => { try {
    const W = 20, H = 12, img = $.NSImage.alloc.initWithSize($.NSMakeSize(W, H)); img.lockFocus;
    const r = $.NSMakeRect(0.5, 2.5, W - 1, H - 5);
    rgb(0xf3, 0xe6, 0xc4).setFill; $.NSBezierPath.fillRect(r);
    tab.setFill; $.NSBezierPath.fillRect($.NSMakeRect(0.5, 2.5, 7, H - 5));
    rgb(0x9a, 0x84, 0x55).setStroke; const bp = $.NSBezierPath.bezierPathWithRect(r); bp.lineWidth = 1; bp.stroke;
    img.unlockFocus; return img; } catch (e) { return null; } };
  // ★v5.1.399(俊克 11.02 am09:24 改良3「メニューバーの中のCB FUSENをこの四角形の大きな付箋の絵に統一しよう」): CB= Me Dock の付箋ボタン(```)の拡大中の絵と同じ四角の付箋(白い紙＋上の色の帯＋右下の折れ)。IC は横長のまま(` の絵と同じ)。v5.1.401(俊克 am10:02 改良1「細長いほうが大きいのでバランスが悪い→四角形の幅を細長い付箋と同じ幅に」): 紙の幅を横長と同じ19pt(1.9倍・高さ16)・線は0.55(画面で約1pt)
  const fusenIconSq = (tab) => { try { const W = 20, H = 16, img = $.NSImage.alloc.initWithSize($.NSMakeSize(W, H)); img.lockFocus; const tf = $.NSAffineTransform.transform; tf.translateXByYBy(-1.4, H + 1.5); tf.scaleXByYBy(1.9, -1.9); tf.concat; const pg = $.NSBezierPath.bezierPath; pg.moveToPoint($.NSMakePoint(1, 1)); pg.lineToPoint($.NSMakePoint(11, 1)); pg.lineToPoint($.NSMakePoint(11, 6.5)); pg.lineToPoint($.NSMakePoint(7.5, 9)); pg.lineToPoint($.NSMakePoint(1, 9)); pg.closePath; rgb(0xff, 0xfd, 0xf7).setFill; pg.fill; tab.setFill; $.NSBezierPath.fillRect($.NSMakeRect(1.4, 1.4, 9.2, 2.4)); rgb(0x6b, 0x5a, 0x3a).setStroke; pg.lineWidth = 0.55; pg.stroke; const fo = $.NSBezierPath.bezierPath; fo.moveToPoint($.NSMakePoint(7.5, 9)); fo.lineToPoint($.NSMakePoint(7.5, 6.5)); fo.lineToPoint($.NSMakePoint(11, 6.5)); fo.lineWidth = 0.55; fo.stroke; img.unlockFocus; return img; } catch (e) { return null; } };
  const fusenIcons = {};
  // ★v5.1.326(俊克 10.30 am10:26 改良2「畳んでいる時の▶を緑・開いている時の▼を水色に。赤は⏰があるから」): 見出しの三角だけ色を付ける(TAG・FUSEN・群の見出しの全部)
  // v5.1.327(俊克 改良3「パステル調でなく原色の濃い色(青と緑)に」): system の緑/水色 → sRGB の濃い緑(0,135,0 ← v5.1.336 俊克「濃過ぎて緑らしさがない」 0,115,0 ← v5.1.329 俊克「もう少し暗め・濃い緑に」 0,153,0)と青(0,64,255)
  // v5.1.337(俊克 pm01:26「▼/▶の大きさを2倍に」): 三角だけ字の2倍・下げて字の真ん中にそろえる(▸ -3pt / ▾ -2pt= 絵に描いて合わせた)
  // ★v5.1.359(俊克 am10:46 改良1「緑(全て折り畳まれている)⇄赤(⏰の色)⇄青(付箋)⇄紫(タグ)…▼の色もそれに合わせる」): 開いた▾の色を群ごとに(o)。畳んだ▸は緑のまま
  const TRI_RED = [0.85, 0.1, 0.1], TRI_PURPLE = [0.55, 0.2, 0.85];
  const triCol = (a, f, o, at) => { try { const r0 = $.NSMakeRange(at || 0, 1);   /* v5.1.478: at= 三角の位置(前に⭐️が付くと 0 でない) */ a.addAttributeValueRange($.NSForegroundColorAttributeName, f ? $.NSColor.colorWithSRGBRedGreenBlueAlpha(0, 0.53, 0, 1) : (o ? $.NSColor.colorWithSRGBRedGreenBlueAlpha(o[0], o[1], o[2], 1) : $.NSColor.colorWithSRGBRedGreenBlueAlpha(0, 0.25, 1, 1)), r0);
    a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.systemFontOfSize($.NSFont.systemFontSize * 2), r0); a.addAttributeValueRange($.NSBaselineOffsetAttributeName, $(f ? -3 : -2), r0); } catch (e) {} };
  // ★v5.1.478(俊克 am08:57 バグ1「メニューバーで⭐️の大きさと位置がおかしい」= triCol が「先頭の1字」を三角とみなして2倍にしていた→⭐️が2倍に・三角は素の字に)
  //   改良1「最終的なところがやや大きめ、親やその親の⭐️はもう少し小さく」= 見出しの⭐️は字の0.8倍・少し持ち上げる。三角は⭐️の後ろの位置で triCol。
  const STAR = '\u2b50\ufe0f ';
  const starSm = (a, on) => { try { if (!on) return; const r = $.NSMakeRange(0, 2); a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.systemFontOfSize($.NSFont.systemFontSize * 0.8), r); a.addAttributeValueRange($.NSBaselineOffsetAttributeName, $(1), r); } catch (e) {} };
  // ★v5.1.483(俊克 am10:06 改良1「⭐️が入ると▶のインデント位置が他とズレて読み難い→文字列とは別に、左端に⭐️を」):
  //   行= 題から⭐️を外し、✓の欄(onStateImage・state=1)に⭐️の絵(題の字の位置は他の行と同じ)。見出し(付箋の群・#札)= 見出しの絵の左の余白(x=0〜14)に小さい⭐️の字。
  const starImgs = {};
  const starImg = (pt) => { if (starImgs[pt]) return starImgs[pt]; try { const S = Math.ceil(pt * 1.3), img = $.NSImage.alloc.initWithSize($.NSMakeSize(S, S)); img.lockFocus;
    const a = $.NSMutableAttributedString.alloc.init; a.mutableString.setString($('\u2b50\ufe0f')); a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.systemFontOfSize(pt), $.NSMakeRange(0, a.length));
    const sz = a.size; a.drawAtPoint($.NSMakePoint((S - sz.width) / 2, (S - sz.height) / 2)); img.unlockFocus; starImgs[pt] = img; return img; } catch (e) { return null; } };
  const starStrip = (t) => { t = String(t || ''); return t.indexOf(STAR) === 0 ? t.slice(STAR.length) : t; };
  const starRow = (mi, t, reset) => { try { const on = String(t || '').indexOf(STAR) === 0; mi.title = $(starStrip(t)); if (on) { const im = starImg(12); if (im) mi.onStateImage = im; mi.state = 1; } else if (reset) mi.state = 0; } catch (e) {} };
  const starLbl = (o, view, on) => { try { if (!o.sl) { const l = $.NSTextField.labelWithString($('\u2b50\ufe0f')); l.font = $.NSFont.systemFontOfSize(9); l.frame = $.NSMakeRect(1, 3, 14, 14); view.addSubview(l); o.sl = l; } o.sl.hidden = !on; } catch (e) {} };
  const pgTitle = (p, f) => { try { grpPaint(); kindPaint();
    const a = $.NSMutableAttributedString.alloc.init; a.mutableString.setString($((f ? '\u25b8 ' : '\u25be ') + p.name)); starLbl(p, p.hb.superview, p.star);   /* v5.1.483: ⭐️は題の外(左の余白) */   /* v5.1.477 */ const r = $.NSMakeRange(0, a.length);
    a.addAttributeValueRange($.NSFontAttributeName, $.NSFontManager.sharedFontManager.convertFontToHaveTrait($.NSFont.menuFontOfSize(0), 3), r);   // v5.1.338(俊克 pm01:41「CB FUSEN・Yellow などの見出しも太字＋イタリックに。項目名と区別しやすいように」): 3= 太字|斜体
    a.addAttributeValueRange($.NSForegroundColorAttributeName, p.its.length ? $.NSColor.labelColor : $.NSColor.tertiaryLabelColor, r); triCol(a, f);
    p.hb.attributedTitle = a; hbFit(p.hb); } catch (e) {} };
  // ★v5.1.321(俊克 am02:47 改良1「FUSEN という全体ラベルを ⏰0y… の下に入れ、間に罫線。FUSEN をクリックすると付箋すべてを折り畳める」):
  //   全体の見出し= 群と同じ「メニューの中のボタン」(押しても閉じない)。畳むと群の見出しも中身も、CB と IC の間の区切りも隠す。群ごとの畳みは覚えたまま
  const fusenAll = { hb: null, seps: [] };
  // ★v5.1.510(俊克 11.05 pm05:13「▼ FUSEN を ▼ [四角い付箋(黄)]&[細長い付箋(赤)] に・一番上の▼ ⏰ と絵文字として対照的に」): 字の FUSEN をやめ、群の見出しと同じ絵(CB=四角・Yellow / IC=細長い・Red)を字の中に置く。絵が出せない時は最初のボタンの字 FUSEN のまま
  const fusenHead = (a) => { const fh = $.NSFont.boldSystemFontOfSize($.NSFont.systemFontSize), put = (k, mk, w, h) => { const im = fusenIcons[k] || (fusenIcons[k] = mk()), t = $.NSTextAttachment.alloc.init; t.image = im; t.bounds = $.NSMakeRect(0, Math.round((fh.capHeight - h) / 2), w, h); a.appendAttributedString($.NSAttributedString.attributedStringWithAttachment(t)); };
    put('hdY', () => fusenIconSq(rgb(0xe0, 0xb1, 0x3a)), 20, 16); a.mutableString.appendString($(' & ')); put('hdR', () => fusenIcon(rgb(0xe0, 0x78, 0x9a)), 20, 12); };
  // ★v5.1.512(俊克 11.05 pm05:21 改良1「全部畳んだ状態のとき、もっと高さを縮めて、できるだけコンパクトに」): 折り畳んだ見出しの下の区切りを隠して詰める。v5.1.514(pm05:42「1つ、あるいは2つ展開してあっても、折り畳んだ項目の下の区切り線を隠す」): ⏰・付箋・🏷️それぞれが自分の下の線を持つ(開いている項目の下の線は残る)
  const headSeps = [];
  const headPaint = () => { try { const ok = !!clockAll.hb && !!fusenAll.hb && !!tagAll.hb, fold = { c: clockFold, f: !!fusenFold['\u0000all'], t: !!tagAll.fold }; for (const [sp, k] of headSeps) sp.hidden = ok && fold[k]; } catch (e) {} };
  const allTitle = () => { try { grpPaint(); headPaint(); if (!fusenAll.hb) return; const f = !!fusenFold['\u0000all'];
    const a = $.NSMutableAttributedString.alloc.init; a.mutableString.setString($((fusenAll.star ? STAR : '') + (f ? '\u25b8 ' : '\u25be ')));   /* v5.1.477: ⭐️= 最後に着地した付箋を含む */ fusenHead(a); const r = $.NSMakeRange(0, a.length);
    a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.boldSystemFontOfSize($.NSFont.systemFontSize), r);
    a.addAttributeValueRange($.NSForegroundColorAttributeName, pagers.some(p => p.its.length) ? $.NSColor.labelColor : $.NSColor.tertiaryLabelColor, r); triCol(a, f, null, fusenAll.star ? STAR.length : 0); starSm(a, fusenAll.star);
    fusenAll.hb.attributedTitle = a; hbFit(fusenAll.hb); } catch (e) {} };
// {* ▲mCN=0700_MENU_PARTS // end [cGJF=h] *}
// {* ▼mCN=0800_HEAD_CYCLE // 見出しの畳み / ↻ の4姿 / 待ちの姿 / 🏷️の見出し (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // ★v5.1.356(俊克 10.31 am10:03 改良1「メニューバーを1クリックで全て折り畳んだ状態にするボタン…通常の⏰も折り畳めるように」・タイトル「▼ ⏰」/
  //   am10:08「⊟を押す度に、全部折り畳む、⏰だけ開く、付箋だけ開く、タグだけ開くの4つを巡回…全て展開はあえて入れない」):
  //   ⏰の見出し= FUSEN/TAG と同じ「メニューの中のボタン」(押しても閉じない)。右端の⊟で4つの姿を巡る。畳んだ姿は作り直しても覚えている
  // ★v5.1.515(俊克 11.05 pm05:45 改良1「デフォルトでは、すべて折り畳んだ状態で。ただし⏰だけは例外でデフォルトで展開」): 起動時の姿= ⏰だけ開く(↻も⏰だけの姿・赤)。付箋= 全体と CB-ALL/IC-ALL の蓋を閉じ、群も畳む。🏷️= 全体も札も畳む。押して変えた姿は動いている間は覚えている
  let clockFold = false, foldMode = 1;
  // ★v5.1.554(俊克 11.07 am11:18 改良1「今日と明日の⏰だけ出すモード…明後日以降は閉じるボタン…ポスターのため…今日と明日の予定に集中できる」): ⏰の見出しの ▾ALL / ▸ALL(FUSEN の ▾ALL と同じ作り)。
  //   ▸ALL= 明後日以降の行と、その前の区切りを隠す。far= 明後日の0時から先の印(行と区切りに拡張とヘルパーが付ける)。押して変えた姿は動いている間は覚えている
  // ★v5.1.555(俊克 11.07 am11:30「パーペキ…この状態をデフォルトにしようよ」): 起動時の姿= ▸ALL(今日と明日だけ)
  let clockNear = true;
  // ★v5.1.557(俊克 11.07 am11:51 バグ1「ボタン以外のところで、↖ポインターが正しく出ていない」): 見出しのボタンは字の幅だけ= 右の空き地は押せず指も出ない
  const hbFit = (b) => { try { const f = b.frame; b.autoresizingMask = 0; b.frame = $.NSMakeRect(f.origin.x, f.origin.y, Math.ceil(b.cell.titleRectForBounds(b.bounds).origin.x + b.attributedTitle.size.width), f.size.height); } catch (e) {} };   // v5.1.558(俊克 pm00:02 改良1「メニューバーのほうは、境界が少しズレている」): intrinsic+4 は字より8pt広かった(⏰ 42pt・字34pt)→ 字の右端ちょうどまで(絵の分は titleRect の x に入っている)
  const clockAll = { hb: null, cyc: null, nb: null, rows: [], seps: [], far: [] };
  const clockTitle = () => { try { headPaint(); if (!clockAll.hb) return; const f = clockFold;
    const a = $.NSMutableAttributedString.alloc.init; a.mutableString.setString($((clockAll.star ? STAR : '') + (f ? '\u25b8 ' : '\u25be ') + '\u23f0')); const r = $.NSMakeRange(0, a.length);
    a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.boldSystemFontOfSize($.NSFont.systemFontSize), r);
    a.addAttributeValueRange($.NSForegroundColorAttributeName, $.NSColor.labelColor, r); triCol(a, f, TRI_RED, clockAll.star ? STAR.length : 0); starSm(a, clockAll.star);   /* v5.1.479 */
    clockAll.hb.attributedTitle = a; hbFit(clockAll.hb); } catch (e) {} };
  // ★v5.1.357(俊克 am10:19 改良1「⊟の代わりに、↻を45°ずつ回転…↻を赤色に…Me Dockのボタンのように円で囲む。角度ごとに色を変えても」):
  //   押すたびに45°ずつ回る↻を円で囲んだ絵。色は姿ごと= はじめ/全部畳む=赤・⏰だけ=橙・付箋だけ=緑・タグだけ=青
  let cycN = 0, cycRev = false, cycHover = false;   // v5.1.373: cycHover= ↻をポイント中(拡大して描く)
    // v5.1.361(俊克 am11:13「逆回転のときは、↺にしよう」): 最後に Shift で回したら ↺ を描く
  const CYC_COL = [[0, 0.53, 0], [0, 0.53, 0], TRI_RED, [0, 0.25, 1], TRI_PURPLE];   // [はじめ, 全部畳む, ⏰, 付箋, タグ]  v5.1.359: 緑⇄赤⇄青⇄紫(▾/▸の色と同じ)
  const cycImg = () => { try { const S = cycHover ? 30 : 22, c = CYC_COL[foldMode + 1] || CYC_COL[0], col = $.NSColor.colorWithSRGBRedGreenBlueAlpha(c[0], c[1], c[2], 1);
    const img = $.NSImage.alloc.initWithSize($.NSMakeSize(S, S)); img.lockFocus;
    col.setFill; $.NSBezierPath.bezierPathWithOvalInRect($.NSMakeRect(1, 1, S - 2, S - 2)).fill;   // v5.1.358(俊克 am10:37 改良1「Me Dockのボタンのように、円の地の色を変えて、その上に白い↻」)
    const t = $.NSAffineTransform.transform; t.translateXByYBy(S / 2, S / 2); t.rotateByDegrees(-Math.max(0, foldMode) * 90); t.translateXByYBy(-S / 2, -S / 2); t.concat;   // v5.1.358(改良2「一周で元の位置に」): 4つの姿で1周= 90°ずつ(全部畳む=0°)
    const a = $.NSMutableAttributedString.alloc.init; a.mutableString.setString($(cycRev ? '\u21ba' : '\u21bb')); const r = $.NSMakeRange(0, a.length);
    a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.boldSystemFontOfSize(cycHover ? 19 : 14), r); a.addAttributeValueRange($.NSForegroundColorAttributeName, $.NSColor.whiteColor, r);
    const sz = a.size; a.drawAtPoint($.NSMakePoint((S - sz.width) / 2, (S - sz.height) / 2));
    img.unlockFocus; return img; } catch (e) { return null; } };
  // ★v5.1.364(俊克 pm01:51「メニューバーの↺ボタンもMe Dockの↺ボタンと同期しようよ」): 向きはファイル cyc-rev(在る=↺)を Me Dock と共有。置き場は state の cyc(無ければ state の隣)
  const cycRevPath = () => { try { const s = $.NSString.stringWithContentsOfFileEncodingError(statePath, $.NSUTF8StringEncoding, null); const j = JSON.parse(ObjC.unwrap(s)); if (j && j.cyc) return String(j.cyc); } catch (e) {} return String(statePath).replace(/[^\/]*$/, '') + 'cyc-rev'; };
  const cycRevLoad = () => { try { const rv = !!$.NSFileManager.defaultManager.fileExistsAtPath($(cycRevPath())); if (rv !== cycRev) { cycRev = rv; cycPaint(); } } catch (e) {} };
  // ★v5.1.366(俊克 pm05:20 改良1「↺ボタンに変わったあと、無操作が10秒続いたら、↻に戻す…ボタンを見なくても、通常は時計回り↻になっていると分かる。これこそが真のaccessibility」):
  //   Mac 全体で10秒なにも触らなければ cyc-rev を消す= メニューバーも Me Dock も ↻ へ戻る(Me Dock はファイルを見張っている)
  let cycIdleDone = false;
  const cycIdle = () => { let idle = 0; try { idle = Number($.CGEventSourceSecondsSinceLastEventType(1, 0xFFFFFFFF)); } catch (e) { return; }
    // ★v5.1.376(俊克 11.01 pm02:58 改良1「シフトを押している長さで、戻る時間をカスタマイズ」): cyc-rev の中身= 戻るまでの秒(v5.1.378 俊克 pm03:36「最長10秒」= 押した長さそのまま・3〜10秒)。中身が古い '1' なら3秒
    let wait = 3; try { const fp = $(cycRevPath()); if ($.NSFileManager.defaultManager.fileExistsAtPath(fp)) { const n = Number(ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(fp, $.NSUTF8StringEncoding, null))); if (n > 0) wait = Math.max(3, Math.min(10, n)); } } catch (e) {}
    if (!(idle >= wait) || (Number($.NSEvent.modifierFlags) & 0x20000)) { cycIdleDone = false; return; }   // Shift を押し続けている間は数えない(押しっぱなしは無操作に見える)   // v5.1.375(俊克 11.01 改良1「10秒は少し長い。3秒くらい」): 10→3秒
    if (cycIdleDone) return; cycIdleDone = true;
    try { const fp = $(cycRevPath()); if ($.NSFileManager.defaultManager.fileExistsAtPath(fp)) { $.NSFileManager.defaultManager.removeItemAtPathError(fp, null); hlog('[menu] ' + wait + '秒の無操作で ↺→↻'); } } catch (e) {}
    if (cycRev) { cycRev = false; cycPaint(); } };
  // ★v5.1.367(俊克 pm06:35「MW-GATEロゴが完成した」→ pm06:40「とりあえず入れてみよう」): 札の左、メニューバーの地の上にロゴ。v5.1.368(俊克 pm06:47「mGATEver1.pngの方がいい」): 門の中が白く塗られた絵= ライトもダークも同じ絵のまま(l/d は同じ物)
  //   絵は拡張が置き場(cyc-rev と同じ所)へ写した mgate-l.png / mgate-d.png。見た目が変わったら描き直す
  let gateImg = null, lastDark = null;
  const gateLoad = () => { if (gateImg) return gateImg; try { const d = String(cycRevPath()).replace(/[^\/]*$/, ''); const l = $.NSImage.alloc.initWithContentsOfFile($(d + 'mgate-l.png')), k = $.NSImage.alloc.initWithContentsOfFile($(d + 'mgate-d.png')); if (l && !l.isNil() && k && !k.isNil()) gateImg = { l: l, d: k }; } catch (e) {} return gateImg; };
  const gateDark = () => { try { return /Dark/.test(ObjC.unwrap(item.button.effectiveAppearance.name)); } catch (e) { return false; } };
  const cycPaint = () => { try { if (!clockAll.cyc) return; const im = cycImg(); if (im) { clockAll.cyc.image = im; clockAll.cyc.title = $(''); clockAll.cyc.imagePosition = 1; } } catch (e) {} };
  const nearPaint = () => { try { const b = clockAll.nb; if (!b) return; const a = $.NSMutableAttributedString.alloc.init; a.mutableString.setString($((clockNear ? '\u25b8' : '\u25be') + 'ALL')); const r = $.NSMakeRange(0, a.length); a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.boldSystemFontOfSize($.NSFont.systemFontSize), r); a.addAttributeValueRange($.NSForegroundColorAttributeName, $.NSColor.labelColor, r); triCol(a, clockNear); b.attributedTitle = a; b.toolTip = $(clockNear ? 'Show every \u23f0' : 'Today and tomorrow only'); b.hidden = clockFold || !clockAll.far.length; } catch (e) {} };
  const clockPaint = () => { try { for (const mi of clockAll.rows) mi.hidden = clockFold; for (const sp of clockAll.seps) sp.hidden = clockFold; if (clockNear) for (const x of clockAll.far) x.hidden = true; nearPaint(); clockTitle(); } catch (e) {} };
  // ★v5.1.325〜326(俊克 10.30 改良「Tag の一覧に TAG の見出し・VSCm が起動している間も出す・最初は畳んだ状態で」): 見出し= FUSEN の全体見出しと同じ「メニューの中のボタン」(押しても閉じない)・太字
  const tagAll = { hb: null, rows: [], fold: true, slots: [], list: [], off: 0, up: null, dn: null, lab: null, pi: null };
  const tagTitle = () => { try { headPaint(); if (!tagAll.hb) return;
    const a = $.NSMutableAttributedString.alloc.init; a.mutableString.setString($((tagAll.star ? STAR : '') + (tagAll.fold ? '\u25b8 ' : '\u25be ') + '\ud83c\udff7\ufe0f')); const r = $.NSMakeRange(0, a.length);
    a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.boldSystemFontOfSize($.NSFont.systemFontSize), r);
    a.addAttributeValueRange($.NSForegroundColorAttributeName, (tagAll.list.length || tagAll.rows.length) ? $.NSColor.labelColor : $.NSColor.tertiaryLabelColor, r); triCol(a, tagAll.fold, TRI_PURPLE, tagAll.star ? STAR.length : 0); starSm(a, tagAll.star);   /* v5.1.479 */
    tagAll.hb.attributedTitle = a; hbFit(tagAll.hb); } catch (e) {} };
  // ★v5.1.327(俊克 10.30 am10:40 改良4「TAG の … 14 more も、FUSEN の ▲ ▼ 1/2 のようにスライドできるように」): 札の見出しと膜の行を1本の並びにして TAG_PAGE 行ずつ・▲▼で送る(FUSEN の群と同じ、押しても閉じない)
  const TAG_PAGE = 10;
  // ★v5.1.343(俊克 pm02:25「スライドボタンを連続で押せるように、ポインター位置を移動しよう」): 送るとページの行数が変わり▲▼が上下にずれる→ 描き直した後(0.05秒・メニューの中でも鳴る)、押したボタンの真ん中へポインターを運ぶ(TAG と FUSEN の群)
  let ptrDiag = 0;   // ★v5.1.372(俊克 pm10:14 改良1「中心にいると↻の回転が見えない…ボタンを拡大し、右下45°方向の位置にポイント」): 0以外= 真ん中から右下45°へ d pt ずらす(1回きり)
// {* ▲mCN=0800_HEAD_CYCLE // end [cGJF=h] *}
// {* ▼mCN=0900_POINTER // ポインター(手・白い45°↖・手の平/握り)の切り替え= menuHandStep / ↻のホーバー / ポインターを運ぶ (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // ★v5.1.374(俊克 pm10:27 バグ1「拡大しない。なぜ?」): 373 の NSTrackingArea はメニューの中では mouseEntered が届かなかった(events.log に兆し無し)。
  //   → メニューを開いている間も回る 0.05秒の見張りで、ポインター(NSEvent.mouseLocation)が↻の枠の中か を見て描き替える。閉じている間は窓が見えないので素通り
  let cycHovTimer = null;
  // ★v5.1.516(俊克 11.05 pm06:06「↻ボタンの上とか、クリックできるところで、ミッキーの選択指にする。ドラッグは無いしね」): メニューの中で押せる物(ボタン・選べる行)の上だけ OS の指差しに。0.05秒の見張りの中で判定する
  let handOn = false;
  const handFile = () => String(cycRevPath()).replace(/[^\/]*$/, '');
  const handRead = () => { try { const t = $.NSString.stringWithContentsOfFileEncodingError($(handFile() + 'hand-name'), $.NSUTF8StringEncoding, null); handCur.n = t && !t.isNil() ? ObjC.unwrap(t).trim() : 'btron'; } catch (e) { handCur.n = 'btron'; } };   // ★v5.1.520(俊克 pm06:41「Me Dockでのポインターの設定通りに、メニューバーの手を変えよう」): 拡張が置く hand-name(btron / macos22 / system)を、手に変わる瞬間に読む
  const handCur = () => { const n = handCur.n || 'btron'; if (n === 'system') return $.NSCursor.pointingHandCursor; const mac = n === 'macos22', k = mac ? 'c22' : 'cB'; if (handCur[k]) return handCur[k]; try { const im = $.NSImage.alloc.initWithContentsOfFile($(handFile() + (mac ? 'mgate-hand22.png' : 'mgate-hand.png'))); if (im && !im.isNil()) { im.size = mac ? $.NSMakeSize(21, 25) : $.NSMakeSize(24, 26); handCur[k] = mac ? $.NSCursor.alloc.initWithImageHotSpot(im, $.NSMakePoint(3, 3)) : $.NSCursor.alloc.initWithImageHotSpot(im, $.NSMakePoint(0, 5)); return handCur[k]; } } catch (e) {} return $.NSCursor.pointingHandCursor; };   // v5.1.519: 絵が読めない時は OS の手。当たり= BTRON 0,5 / 22.5° 3,3(Me Dock と同じ)
  // ★v5.1.529(俊克 11.06 am01:29 改良1「メニューバーにぶら下がっているmGATEの中で、↖ポインターを白色の45°↖ポインターを表示させる。BTRONポインターの指定のケースで」): Me Dock の中と同じ絵(MEOS_ARROW_CURSOR_BTRON の 4.8 倍= 当たり 1,5)。22.5° と OS は従来の↖
  let arrOn = false;
  const arrow45 = () => { if (arrow45.c) return arrow45.c; try { const im = $.NSImage.alloc.initWithContentsOfFile($(handFile() + 'mgate-arrow45.png')); if (im && !im.isNil()) { im.size = $.NSMakeSize(100 / 4.8, 104 / 4.8); arrow45.c = $.NSCursor.alloc.initWithImageHotSpot(im, $.NSMakePoint(1, 5)); return arrow45.c; } } catch (e) {} return null; };
  // ★v5.1.533(俊克 11.06 am09:51 改良1「掴めるところで、ポインターの形を移動手に変えよう」): mGATE の地= 手の平・掴んでいる間= 握り(Me Dock の --meos-palm / --meos-grip と同じ絵)。大きさと当たりは隣の指に揃える= 指⇔手の平で絵が飛ばない。OS 指定の時は OS の手
  let moveOn = false;
  const moveCur = (k) => { const n = handCur.n || 'btron', grip = k === 'grip'; if (n === 'system') return grip ? $.NSCursor.closedHandCursor : $.NSCursor.openHandCursor; const mac = n === 'macos22', q = k + (mac ? '22' : ''); if (moveCur[q]) return moveCur[q]; try { const im = $.NSImage.alloc.initWithContentsOfFile($(handFile() + 'mgate-' + q + '.png')); if (im && !im.isNil()) { im.size = mac ? $.NSMakeSize(21, 25) : $.NSMakeSize(24, 26); moveCur[q] = $.NSCursor.alloc.initWithImageHotSpot(im, mac ? $.NSMakePoint(3, grip ? 9 : 3) : $.NSMakePoint(0, 5)); return moveCur[q]; } } catch (e) {} return grip ? $.NSCursor.closedHandCursor : $.NSCursor.openHandCursor; };
  const dockOutInPanel = () => { try { const f = dockOut.win.frame, p = $.NSEvent.mouseLocation, x = p.x - f.origin.x, y = p.y - f.origin.y, W = f.size.width, H = f.size.height, R = 10; if (x < 0 || y < 0 || x > W || y > H) return false; return Math.hypot(Math.max(R - x, x - (W - R), 0), Math.max(R - y, y - (H - R), 0)) <= R; } catch (e) { return false; } };   // 角は丸い(半径10)
  const menuHandStep = () => { try { const b = clockAll.cyc, w = b ? b.window : null, s = item.button.window, mp = $.NSEvent.mouseLocation; let on = false, tagIn = false, menuIn = false;
    if (s && !s.isNil() && s.isVisible) { const f = s.frame; on = mp.x >= f.origin.x && mp.x <= f.origin.x + f.size.width && mp.y >= f.origin.y && mp.y <= f.origin.y + f.size.height; tagIn = on; if (on) { const ph = pieceHit(); on = typeof ph === 'string' && !!ph && (ph === '\u0000logo' || ph.charAt(0) !== '\u0000'); } }   /* v5.1.522(俊克 pm06:59 改良1「MeOS はロゴで終了でき、パズル2つで操作できるので手を出す必然がある。⏰と離席タイマーは他のアプリと同様の操作対象なので↖」): 札の中で指はロゴとパズルの2枚だけ */   // v5.1.517(俊克 pm06:13 改良2「メニューバーの中のクリックできるところでも」): メニューバーの札の上は、メニューを開いていても閉じていても指
    if (!on && w && !w.isNil() && w.isVisible) { const v = w.contentView, h = v.hitTest(v.superview.convertPointFromView(w.convertPointFromScreen(mp), $())); on = !!h && !h.isNil() && h.isKindOfClass($.NSButton) && h.isEnabled; if (!on) { const hi = b.superview.enclosingMenuItem.menu.highlightedItem; on = !!hi && !hi.isNil() && (!hi.view || hi.view.isNil()); } }   // v5.1.517(改良1「ボタンの範囲外の所では↖に」): ボタンを載せた見出しの行(絵の部品の行)も選ばれた扱いになるので除く
    if (w && !w.isNil() && w.isVisible) { const f = w.frame; menuIn = mp.x >= f.origin.x && mp.x <= f.origin.x + f.size.width && mp.y >= f.origin.y && mp.y <= f.origin.y + f.size.height; }   // v5.1.557: メニューの中の押せない所も札と同じ白い45°↖
    if (!on && dockOut.shown && dockOutFront()) on = dockOutOnTile() || dockOutOnLogo();   // v5.1.518(俊克 pm06:27「mGATEのパズルとMW-GATEロゴでも選択指を出そうね」)
    const gr = !!dockOut.drag, pm = !gr && !on && dockOut.shown && dockOutOnGrip(); if (gr || pm) { if (!moveOn) handRead(); moveCur(gr ? 'grip' : 'palm').set; moveOn = true; handOn = false; arrOn = false; return; }   // v5.1.533: 掴んでいる間は窓の外へ出ても握りのまま
    let arr = false; if (!on && (tagIn || menuIn || (dockOut.shown && dockOutInPanel() && dockOutFront()))) {   // v5.1.530(俊克 am01:33「メニューバーの⏰と離席タイマーのところでも同様に」): 札の中で指が出ない所も
      if (!arrOn) handRead(); arr = (handCur.n || 'btron') === 'btron' && !!arrow45(); }
    if (on) { if (!handOn) handRead(); handCur().set; handOn = true; arrOn = false; moveOn = false; } else if (arr) { arrow45().set; arrOn = true; handOn = false; moveOn = false; } else if (handOn || arrOn || moveOn) { handOn = false; arrOn = false; moveOn = false; $.NSCursor.arrowCursor.set; } } catch (e) {} };
  const cycHoverStep = () => { try { const b = clockAll.cyc; if (!b) return; const w = b.window; let on = false;
    if (w && !w.isNil() && w.isVisible) { const r = w.convertRectToScreen(b.convertRectToView(b.bounds, $())), p = $.NSEvent.mouseLocation; on = p.x >= r.origin.x && p.x <= r.origin.x + r.size.width && p.y >= r.origin.y && p.y <= r.origin.y + r.size.height; }
    if (on !== cycHover) { cycHover = on; cycPaint(); }
    if (w && !w.isNil() && w.isVisible) cycShiftStep(); } catch (e) {} };
  // ★v5.1.375(俊克 11.01 バグ1「メニューバーを表示している時、Shift長押しで↻ボタンが裏返らない」): 開いている間は向きを menuWillOpen でしか読んでいなかった＋
  //   メニューに焦点が移ると VSCodium の Shift 長押しが届かない事がある。→ 開いている間(0.05秒の見張り)に、①cyc-rev を読み直して描き替える
  //   ②Shift だけを0.7秒押し続けて、それでも向きが変わっていなければ(拡張が0.4秒で裏返していない)ここで裏返す= 二重に裏返さない
  let cycShAt = 0, cycShRev = false, cycShDone = false;
  const cycShiftStep = () => { try { const fm = $.NSFileManager.defaultManager, fp = $(cycRevPath()); cycRevLoad();
    const f = Number($.NSEvent.modifierFlags) || 0, sOnly = (f & 0x20000) && !(f & 0x1C0000);
    if (!sOnly) { if (cycShAt && cycShDone && fm.fileExistsAtPath(fp)) { const sec = Math.max(3, Math.min(10, Math.round((Date.now() - cycShAt) / 100) / 10)); $(String(sec)).writeToFileAtomicallyEncodingError(fp, true, $.NSUTF8StringEncoding, null); } cycShAt = 0; return; }   // v5.1.376: 離した時に押した長さ×5秒を中身へ
    if (!cycShAt) { cycShAt = Date.now(); cycShRev = !!fm.fileExistsAtPath(fp); cycShDone = false; return; }
    if (cycShDone || Date.now() - cycShAt < 700) return; cycShDone = true;
    if (!!fm.fileExistsAtPath(fp) !== cycShRev) return;   // 拡張がもう裏返した
    cycRev = !cycShRev; if (cycRev) $('1').writeToFileAtomicallyEncodingError(fp, true, $.NSUTF8StringEncoding, null); else fm.removeItemAtPathError(fp, null);
    cycPaint(); hlog('[menu] 開いている間の Shift 長押しで ' + (cycRev ? '↻→↺' : '↺→↻')); } catch (e) {} };
  const ptrTo = (b) => { try { const t = $.NSTimer.timerWithTimeIntervalTargetSelectorUserInfoRepeats(0.05, pgt, 'ptr:', b, false); $.NSRunLoop.currentRunLoop.addTimerForMode(t, $.NSRunLoopCommonModes); } catch (e) {} };
// {* ▲mCN=0900_POINTER // end [cGJF=h] *}
// {* ▼mCN=1000_MENU_BUILD // メニューを組み立てる(付箋・TAG・⏰の群・build) / 残り時間の書き方 (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // ★v5.1.341(俊克 pm02:07「#テスト2 なども折畳みボタンにすればいい」→ pm02:08「仰せのままに」): 札の見出し= 付箋の群と同じ「メニューの中のボタン」(濃い字・▸緑/▾青・押しても閉じない)。
  //   押すとその札の膜を並びから抜き、ページを数え直す。畳んだかは札の名前ごとに覚える(作り直しても保つ)・最初は開いた姿。枠は送るたびに中身が替わるので、見出しが来た枠だけボタンにする
  const tagFold = {};
  const starSeen = {};   // ★v5.1.482(俊克 am10:01「基本的に、⭐️の付いたところを開くことにしようか」): ⭐️が新しく付いた群/札は開き、⭐️の頁へ送る(1度だけ= 後は手で畳める・送れる)
  const tagHead = (t, f, st) => { const a = $.NSMutableAttributedString.alloc.init; a.mutableString.setString($((f ? '\u25b8 ' : '\u25be ') + t));   /* v5.1.483: ⭐️は題の外(tagAll.hv[k] の左の余白) */ const r = $.NSMakeRange(0, a.length);
    a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.boldSystemFontOfSize($.NSFont.menuFontOfSize(0).pointSize), r); a.addAttributeValueRange($.NSObliquenessAttributeName, $(0.2), r);   // v5.1.340: 太字＋傾き(日本語にも効く)
    a.addAttributeValueRange($.NSForegroundColorAttributeName, $.NSColor.labelColor, r); triCol(a, f, TRI_PURPLE); try { a.addAttributeValueRange($.NSObliquenessAttributeName, $(0), $.NSMakeRange(0, 1)); } catch (e) {} return a; };
  const tagPaint = () => { try { const F = tagAll.fold, V = []; let cur = '';
    for (const it of tagAll.list) { if (it.off) { if (!(it.title in tagFold)) tagFold[it.title] = true; cur = it.title; V.push(it); } else if (!tagFold[cur]) V.push(it); }
    // ★v5.1.342(俊克 pm02:12 改良1「1/4 頁の一番下に ▾#テストHIIT の見出しだけが出て、送ると見出し無しで始まる」): ページを先に組む=
    //   開いた見出しはページの最後の行に置かない(次のページへ送る)・膜の行で始まるページは、その札の見出しを頭にもう一度置く
    const P = []; let pg = [], head = null;
    for (const it of V) {
      if (it.off) { head = it; if (pg.length >= TAG_PAGE - 1 && !tagFold[it.title]) { P.push(pg); pg = []; } else if (pg.length >= TAG_PAGE) { P.push(pg); pg = []; } pg.push(it); continue; }
      if (pg.length >= TAG_PAGE) { P.push(pg); pg = head ? [head] : []; }
      pg.push(it); }
    if (pg.length) P.push(pg);
    tagAll.pages = P; if (tagAll.off >= P.length) tagAll.off = Math.max(0, P.length - 1);
    if (tagAll.pendStar) { tagAll.pendStar = false; const s0 = P.findIndex(pg => pg.some(it => it && !it.off && String(it.title || '').indexOf(STAR) === 0)); if (s0 >= 0) tagAll.off = s0; }   // v5.1.482: ⭐️の頁へ   // off= ページの番号(v5.1.342〜)
    const W = P[tagAll.off] || [];
    for (const mi of tagAll.rows) mi.hidden = F;
    if (!tagAll.hv) tagAll.hv = [];
    for (let k = 0; k < tagAll.slots.length; k++) { const it = W[k], mi = tagAll.slots[k];
      if (it && it.off) {
        if (!tagAll.hv[k]) { const hv = $.NSView.alloc.initWithFrame($.NSMakeRect(0, 0, 240, 22)); const b = $.NSButton.buttonWithTitleTargetAction($(''), pgt, 'pgTagFold:'); b.bordered = false; b.alignment = 0; b.frame = $.NSMakeRect(14, 1, 220, 20); b.tag = k; hv.addSubview(b); tagAll.hv[k] = { v: hv, b: b }; }
        tagAll.hv[k].b.attributedTitle = tagHead(it.title, !!tagFold[it.title]); hbFit(tagAll.hv[k].b); starLbl(tagAll.hv[k], tagAll.hv[k].v, !!it.star); mi.state = 0; mi.view = tagAll.hv[k].v;
      } else if (it) { mi.view = $(); mi.attributedTitle = $(); starRow(mi, it.title, true); mi.representedObject = $(it.id || ''); mi.enabled = true; mi.indentationLevel = it.indent || 0; }
      mi.hidden = F || !it; }
    if (tagAll.pi) { tagAll.pi.hidden = F || P.length <= 1;
      tagAll.up.enabled = tagAll.off > 0; tagAll.dn.enabled = tagAll.off + 1 < P.length; const sp = P.findIndex(pg => pg.some(it => it && (it.star || String(it.title || '').indexOf(STAR) === 0)));   // ★v5.1.481(俊克 am09:49 改良2「スライドボタンの右側に(⭐️2/5)のように」): ⭐️の膜が居る頁
      tagAll.lab.stringValue = $((tagAll.off + 1) + ' / ' + Math.max(1, P.length) + (sp >= 0 ? '   (\u2b50\ufe0f' + (sp + 1) + '/' + Math.max(1, P.length) + ')' : '')); } } catch (e) {} };
  const pgPaint = (p) => {
    const A = !!fusenFold['\u0000all'];
    try { p.hd.hidden = A; } catch (e) {}
    const f = A || !!fusenFold[p.name] || pgCover(p), rest = p.its.slice(1);
    if (p.off > 0 && p.off >= rest.length) p.off = Math.max(0, Math.floor((rest.length - 1) / 5) * 5);   // v5.1.347: 付箋が減って覚えた頁が無くなったら最後の頁へ
    fusenOff[p.name] = p.off;
    pgTitle(p, !!fusenFold[p.name] || pgCover(p));
    p.pin.hidden = f || !p.its[0];
    for (let k = 0; k < p.slots.length; k++) { const it = rest[p.off + k], mi = p.slots[k];
      if (it) { starRow(mi, it.title, true); mi.representedObject = $(it.id); } mi.hidden = f || !it; }
    p.pi.hidden = f || !p.its.length;   // v5.1.314: 1枚も無い群は見出しだけ
    const pages = Math.max(1, Math.ceil(rest.length / 5)), cur = Math.floor(p.off / 5) + 1;
    try { p.up.enabled = p.off > 0; p.dn.enabled = p.off + 5 < rest.length; p.lab.stringValue = $(cur + ' / ' + pages); } catch (e) {}
  };
  ObjC.registerSubclass({ name: 'MeOSPagerH', methods: {
    'pgUp:': { types: ['void', ['id']], implementation: function (s) { try { const p = pagers[s.tag]; if (p && p.off > 0) { p.off -= 5; pgPaint(p); ptrTo(s); } } catch (e) {} } },
    'pgDn:': { types: ['void', ['id']], implementation: function (s) { try { const p = pagers[s.tag]; if (p && p.off + 5 < p.its.length - 1) { p.off += 5; pgPaint(p); ptrTo(s); } } catch (e) {} } },
    'pgFold:': { types: ['void', ['id']], implementation: function (s) { try { const p = pagers[s.tag]; if (!p) return; if (pgCover(p)) { delete fusenFold[pgCovK('All')]; delete fusenFold[pgCovK(String(p.name).slice(0, 2))]; fusenFold[p.name] = false; for (const q of pagers) pgPaint(q); grpPaint(); kindPaint(); return; } fusenFold[p.name] = !fusenFold[p.name]; pgPaint(p); } catch (e) {} } },
    'pgTag:': { types: ['void', ['id']], implementation: function (s) { try { tagAll.fold = !tagAll.fold; tagTitle(); tagPaint(); } catch (e) {} } },   // v5.1.325
    'ptr:': { types: ['void', ['id']], implementation: function (t) { try { const b = t.userInfo, w = b.window; if (!w || w.isNil()) return; const r = w.convertRectToScreen(b.convertRectToView(b.bounds, $())), H = $.NSScreen.screens.objectAtIndex(0).frame.size.height, d = ptrDiag; ptrDiag = 0; $.CGWarpMouseCursorPosition({ x: r.origin.x + r.size.width / 2 + d, y: H - (r.origin.y + r.size.height / 2) + d }); $.CGAssociateMouseAndMouseCursorPosition(true); } catch (e) {} } },   // v5.1.343
    'pgTagUp:': { types: ['void', ['id']], implementation: function (s) { try { if (tagAll.off > 0) { tagAll.off -= 1; tagPaint(); ptrTo(s); } } catch (e) {} } },   // v5.1.327
    'pgTagDn:': { types: ['void', ['id']], implementation: function (s) { try { if (tagAll.off + 1 < (tagAll.pages || []).length) { tagAll.off += 1; tagPaint(); ptrTo(s); } } catch (e) {} } },   // v5.1.327
    'pgTagFold:': { types: ['void', ['id']], implementation: function (s) { try { const it = ((tagAll.pages || [])[tagAll.off] || [])[Number(s.tag)]; if (it && it.off) { tagFold[it.title] = !tagFold[it.title]; tagPaint(); } } catch (e) {} } },   // v5.1.341: 札の見出しで畳む
    'pgClk:': { types: ['void', ['id']], implementation: function (s) { try { clockFold = !clockFold; clockPaint(); } catch (e) {} } },   // v5.1.356: ⏰の見出しで畳む
    'pgNear:': { types: ['void', ['id']], implementation: function (s) { try { clockNear = !clockNear; clockPaint(); hlog('[menu] \u23f0 ' + (clockNear ? '今日と明日だけ' : '全部') + ' 隠す物=' + clockAll.far.length); } catch (e) {} } },   // v5.1.554
    'pgCyc:': { types: ['void', ['id']], implementation: function (s) { try { let sh = false; try { sh = !!($.NSEvent.modifierFlags & (1 << 17)); } catch (x) {}   // ★v5.1.360(俊克 am11:10 改良1「↻ボタンは、シフトクリックで、逆回転に」)
      if (sh) { cycRev = !cycRev; try { const fp = $(cycRevPath()); if (cycRev) $('1').writeToFileAtomicallyEncodingError(fp, true, $.NSUTF8StringEncoding, null); else $.NSFileManager.defaultManager.removeItemAtPathError(fp, null); } catch (e) {} }   // v5.1.364: Me Dock へも渡す   // ★v5.1.362(俊克 am11:18「一旦↺になったら、シフトを押さなくてもクリックだけで反時計回りに…shiftクリックは方向を反転するためのもの」): Shift= 向きを裏返して1つ進む・ふつう= 今の向きに1つ進む
      foldMode = cycRev ? (foldMode + 3) % 4 : (foldMode + 1) % 4; if (foldMode < 0) foldMode = 3; cycN++; cycPaint();   // v5.1.356: ⊟= 全部畳む→⏰だけ→付箋だけ→タグだけ(全部開くは無し)
      clockFold = foldMode !== 1; fusenFold['\u0000all'] = foldMode !== 2; tagAll.fold = foldMode !== 3;
      clockPaint(); allTitle(); for (const p of pagers) pgPaint(p); for (const sp of fusenAll.seps) sp.hidden = !!fusenFold['\u0000all']; tagTitle(); tagPaint(); ptrDiag = 8; ptrTo(s);   /* v5.1.374(改良1「ポインターの先が円のギリギリ外…少しだけ円の中に」): 10→8(半径14の内側 11.3) */   // ★v5.1.371(俊克 pm10:08「↻を連続して押せるように…ポインターを追従」): 畳み替えで↻が動く→▲▼と同じく↻の真ん中へ運ぶ
      hlog('[menu] \u21bb 姿=' + ['全部畳む', '\u23f0だけ', 'FUSENだけ', 'TAGだけ'][foldMode] + ' \u23f0行=' + clockAll.rows.length + (clockFold ? '畳' : '開') + ' FUSEN=' + (fusenFold['\u0000all'] ? '畳' : '開') + ' TAG=' + (tagAll.fold ? '畳' : '開')); } catch (e) { hlog('[menu] \u21bb 例外 ' + e); } } },
    'cycHov:': { types: ['void', ['id']], implementation: function (t) { cycHoverStep(); menuHandStep(); } },   // ★v5.1.374: ↻のポイント見張り(0.05秒ごと)
    'pgKind:': { types: ['void', ['id']], implementation: function (s) { try { const p0 = pagers[Number(s.tag)]; if (!p0) return; const kd = String(p0.name).slice(0, 2), g = pagers.filter(q => String(q.name).slice(0, 2) === kd), k = pgCovK(kd); fusenFold[k] = !fusenFold[k]; if (!fusenFold[k]) lidOpen(g); for (const p of g) pgPaint(p); grpPaint(); kindPaint(); } catch (e) {} } },
    'pgGrp:': { types: ['void', ['id']], implementation: function (s) { try { const k = pgCovK('All'); fusenFold[k] = !fusenFold[k]; if (!fusenFold[k]) lidOpen(pagers.filter(q => !pgCover(q))); for (const p of pagers) pgPaint(p); grpPaint(); kindPaint(); } catch (e) {} } },
    'pgAll:': { types: ['void', ['id']], implementation: function (s) { try { fusenFold['\u0000all'] = !fusenFold['\u0000all']; allTitle(); for (const p of pagers) pgPaint(p); for (const sp of fusenAll.seps) sp.hidden = !!fusenFold['\u0000all']; } catch (e) {} } } } });
  const pgt = $.MeOSPagerH.alloc.init;
  // 群= 見出し(押すと畳む/開く・メニューの中のボタン= 閉じない)＋常駐1＋5枠＋▲▼
  function buildFusen(m, e) {
    if (!(e.fusen in fusenFold)) fusenFold[e.fusen] = true; const its = e.items || [], p = { name: e.fusen, star: !!e.star, its: its, slots: [], off: fusenOff[e.fusen] || 0 };
    { const sti = its.findIndex(x => x && String(x.title || '').indexOf(STAR) === 0); if (e.star && sti >= 0) { const sg = its[sti].title + '|' + (its[sti].id || ''); if (starSeen['f:' + e.fusen] !== sg) { starSeen['f:' + e.fusen] = sg; if (!pgCover(p)) fusenFold[e.fusen] = false; if (sti > 0) fusenOff[e.fusen] = Math.floor((sti - 1) / 5) * 5; p.off = fusenOff[e.fusen] || 0; } } }   // v5.1.482
    const hv = $.NSView.alloc.initWithFrame($.NSMakeRect(0, 0, 240, 22));
    p.hb = $.NSButton.buttonWithTitleTargetAction($(e.fusen), pgt, 'pgFold:'); p.hb.bordered = false; p.hb.alignment = 0; p.hb.font = $.NSFont.menuFontOfSize(0);
    try { const k0 = e.color || (/^IC/.test(e.fusen) ? '#2f6fb3' : '#e0803a'), cb = /^CB/.test(e.fusen), k = k0 + (cb ? 'S' : ''); if (!(k in fusenIcons)) { const h = parseInt(k0.slice(1), 16), tc = rgb((h >> 16) & 255, (h >> 8) & 255, h & 255); fusenIcons[k] = cb ? fusenIconSq(tc) : fusenIcon(tc); } if (fusenIcons[k]) { p.hb.image = fusenIcons[k]; p.hb.imagePosition = 2; } } catch (x) {}   // v5.1.315: 絵の端= その群の付箋の色(e.color)
    p.hb.frame = $.NSMakeRect(14, 1, 220, 20); p.hb.tag = pagers.length; hv.addSubview(p.hb); if (/^(CB|IC)/.test(e.fusen) && !pagers.some(q => String(q.name).slice(0, 2) === String(e.fusen).slice(0, 2))) { p.hb.frame = $.NSMakeRect(14, 1, 140, 20); p.hb.autoresizingMask = 2; p.kb = $.NSButton.buttonWithTitleTargetAction($(''), pgt, 'pgKind:'); p.kb.bordered = false; p.kb.alignment = 1; p.kb.frame = $.NSMakeRect(150, 1, 84, 20); p.kb.autoresizingMask = 1; p.kb.tag = pagers.length; hv.addSubview(p.kb); hv.autoresizingMask = 2; }
    const hd = $.NSMenuItem.alloc.init; hd.view = hv; m.addItem(hd); p.hd = hd;
    const add = (it) => { const mi = m.addItemWithTitleActionKeyEquivalent($(it ? starStrip(it.title) : ' '), 'pick:', $('')); if (it) starRow(mi, it.title); mi.target = tgt; if (it) mi.representedObject = $(it.id); mi.indentationLevel = 1; return mi; };
    p.pin = add(its[0]);
    for (let k = 0; k < 5; k++) p.slots.push(add(its[1 + k]));
    const v = $.NSView.alloc.initWithFrame($.NSMakeRect(0, 0, 220, 26));
    p.up = $.NSButton.buttonWithTitleTargetAction($('▲'), pgt, 'pgUp:'); p.up.frame = $.NSMakeRect(36, 2, 40, 22); p.up.tag = pagers.length; v.addSubview(p.up);
    p.dn = $.NSButton.buttonWithTitleTargetAction($('▼'), pgt, 'pgDn:'); p.dn.frame = $.NSMakeRect(80, 2, 40, 22); p.dn.tag = pagers.length; v.addSubview(p.dn);
    p.lab = $.NSTextField.labelWithString($('')); p.lab.frame = $.NSMakeRect(128, 5, 80, 16); v.addSubview(p.lab);
    p.pi = $.NSMenuItem.alloc.init; p.pi.view = v; m.addItem(p.pi);
    pagers.push(p); pgPaint(p); allTitle();
    return hd;
  }
  function buildTagPager(m, e) {   // v5.1.327: TAG の一覧= TAG_PAGE 枠＋▲▼
    tagAll.list = e.rows || [];
    { const sr = tagAll.list.find(r => r && !r.off && String(r.title || '').indexOf(STAR) === 0), sg = sr ? sr.title : ''; if (starSeen.tag === undefined) starSeen.tag = sg; else if (sg && starSeen.tag !== sg) { starSeen.tag = sg; for (const r of tagAll.list) if (r && r.off && r.star) tagFold[r.title] = false; tagAll.pendStar = true; } }   // v5.1.482
    for (let k = 0; k < TAG_PAGE; k++) { const mi = m.addItemWithTitleActionKeyEquivalent($(' '), 'pick:', $('')); mi.target = tgt; tagAll.slots.push(mi); }
    const v = $.NSView.alloc.initWithFrame($.NSMakeRect(0, 0, 290, 26));
    tagAll.up = $.NSButton.buttonWithTitleTargetAction($('\u25b2'), pgt, 'pgTagUp:'); tagAll.up.frame = $.NSMakeRect(36, 2, 40, 22); v.addSubview(tagAll.up);
    tagAll.dn = $.NSButton.buttonWithTitleTargetAction($('\u25bc'), pgt, 'pgTagDn:'); tagAll.dn.frame = $.NSMakeRect(80, 2, 40, 22); v.addSubview(tagAll.dn);
    tagAll.lab = $.NSTextField.labelWithString($('')); tagAll.lab.frame = $.NSMakeRect(128, 5, 150, 16);   /* v5.1.481: (⭐️N/M) の分だけ広く */ v.addSubview(tagAll.lab);
    tagAll.pi = $.NSMenuItem.alloc.init; tagAll.pi.view = v; m.addItem(tagAll.pi);
    tagPaint(); tagTitle();
  }
  function buildTagAll(m) {   // v5.1.325: Tag&Go の見出し TAG
    const hv = $.NSView.alloc.initWithFrame($.NSMakeRect(0, 0, 240, 22));
    tagAll.hb = $.NSButton.buttonWithTitleTargetAction($('TAG'), pgt, 'pgTag:'); tagAll.hb.bordered = false; tagAll.hb.alignment = 0;
    tagAll.hb.frame = $.NSMakeRect(14, 1, 220, 20); hv.addSubview(tagAll.hb);
    const hd = $.NSMenuItem.alloc.init; hd.view = hv; m.addItem(hd); tagTitle();
    return hd;
  }
  function buildClockAll(m) {   // v5.1.356: ⏰の見出し＋右端の⊟
    const hv = $.NSView.alloc.initWithFrame($.NSMakeRect(0, 0, 240, 30)); hv.autoresizingMask = 2;   // v5.1.372: ↻を 22→28 に拡大したので見出しの高さも 22→30
    clockAll.hb = $.NSButton.buttonWithTitleTargetAction($('\u23f0'), pgt, 'pgClk:'); clockAll.hb.bordered = false; clockAll.hb.alignment = 0;
    clockAll.hb.frame = $.NSMakeRect(14, 5, 120, 20); hv.addSubview(clockAll.hb);
    clockAll.nb = $.NSButton.buttonWithTitleTargetAction($(''), pgt, 'pgNear:'); clockAll.nb.bordered = false; clockAll.nb.alignment = 1; clockAll.nb.frame = $.NSMakeRect(138, 5, 60, 20); clockAll.nb.autoresizingMask = 1; hv.addSubview(clockAll.nb);   // v5.1.554
    clockAll.cyc = $.NSButton.buttonWithTitleTargetAction($('\u21bb'), pgt, 'pgCyc:'); clockAll.cyc.bordered = false;
    clockAll.cyc.frame = $.NSMakeRect(202, 0, 30, 30); clockAll.cyc.autoresizingMask = 1; clockAll.cyc.toolTip = $('Fold: all \u2192 \u23f0 only \u2192 FUSEN only \u2192 TAG only   (Shift: turn the other way)'); hv.addSubview(clockAll.cyc); cycHover = false; cycPaint();
    try { if (!cycHovTimer) { cycHovTimer = $.NSTimer.timerWithTimeIntervalTargetSelectorUserInfoRepeats(0.05, pgt, 'cycHov:', $(), true); $.NSRunLoop.currentRunLoop.addTimerForMode(cycHovTimer, $.NSRunLoopCommonModes); } } catch (e) {}
    const hd = $.NSMenuItem.alloc.init; hd.view = hv; m.addItem(hd); clockTitle();
    return hd;
  }
  // ★v5.1.401(俊克 11.02 am10:02 改良3「メニューバーのFUSENのなかの6つの項目を全て折り畳めるように。▼ FUSENの右端にそのためのボタン・▼という同じマークは紛らわしい」): 右端に ⊟(群を全部畳む)/⊞(全部畳まれていれば全部開く)。色は FUSEN の▾と同じ青。FUSEN 全体を畳んでいる間は隠す→ v5.1.402(俊克 am10:27 改良3「緑色の▶で「▶ALL」、押すとすべてが展開し、青色の「▼ALL」に変える」): 全部開いていれば青の▾ALL(押すと全部畳む)・1つでも畳んでいれば緑の▸ALL(押すと全部開く)。三角は見出しと同じ triCol(2倍・色)
  // ★v5.1.410(俊克 11.02 pm01:02 改良1「ALLは、子や孫まですべてを畳むのではなく、再度開き直しても、閉じていたものは閉じたまま、開いたままのものは開いたままに。外枠だけを畳む」): ALL / CB-ALL / IC-ALL= 群の開閉の覚え(fusenFold[群名])には触らない「外枠の蓋」(fusenFold[\0ovAll]/[\0ovCB]/[\0ovIC])。蓋が在る間は群の中身を隠し、外すと各群が覚えた姿に戻る。蓋の中の群を押したら= その蓋を外してその群を開く
  const lidOpen = (g) => { if (g.length && g.every(q => fusenFold[q.name])) for (const q of g) fusenFold[q.name] = false; };   // v5.1.515: 群が全部畳まれたまま蓋を開けると何も出ないので、その時は群も開く
  const pgCovK = (kd) => String.fromCharCode(0) + 'ov' + kd; const pgCover = (p) => !!fusenFold[pgCovK('All')] || !!fusenFold[pgCovK(String(p.name).slice(0, 2))];
  const grpPaint = () => { try { const b = fusenAll.grp; if (!b) return; const allO = !fusenFold[pgCovK('All')]; const a = $.NSMutableAttributedString.alloc.init; a.mutableString.setString($((allO ? '\u25be' : '\u25b8') + 'ALL')); const r = $.NSMakeRange(0, a.length); a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.boldSystemFontOfSize($.NSFont.systemFontSize), r); a.addAttributeValueRange($.NSForegroundColorAttributeName, $.NSColor.labelColor, r); triCol(a, !allO); b.attributedTitle = a; b.toolTip = $(allO ? 'Fold all the FUSEN groups' : 'Open all the FUSEN groups'); b.hidden = !!fusenFold['\u0000all'] || !pagers.length; } catch (e) {} };
  // ★v5.1.409(俊克 11.02 pm00:46 改良1「CB FUSEN・Yellowの右端に▼CB-ALL/▶CB-ALLボタンを付けよう。ICのほうにもね」): 種類(CB/IC)の最初の群の見出しの右端に、その種類の群だけを全部開く/畳む(▾ALL と同じ作り・同じ色の決まり)。v5.1.411: 見出しの字が「CB FUSEN · Y…」と切れた(140ptに縮めたまま)→ 見出しもメニューの幅に合わせて伸ばす(autoresizingMask 2)
  const kindPaint = () => { try { for (const p of pagers) { const b = p.kb; if (!b) continue; const kd = String(p.name).slice(0, 2), allO = !fusenFold[pgCovK(kd)]; const a = $.NSMutableAttributedString.alloc.init; a.mutableString.setString($((allO ? '\u25be' : '\u25b8') + kd + '-ALL')); const r = $.NSMakeRange(0, a.length); a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.boldSystemFontOfSize($.NSFont.systemFontSize), r); a.addAttributeValueRange($.NSForegroundColorAttributeName, $.NSColor.labelColor, r); triCol(a, !allO); b.attributedTitle = a; b.toolTip = $((allO ? 'Fold all the ' : 'Open all the ') + kd + ' FUSEN groups'); } } catch (e) {} };
  function buildFusenAll(m) {   // v5.1.321: 全体の見出し
    const hv = $.NSView.alloc.initWithFrame($.NSMakeRect(0, 0, 240, 22));
    fusenAll.hb = $.NSButton.buttonWithTitleTargetAction($('FUSEN'), pgt, 'pgAll:'); fusenAll.hb.bordered = false; fusenAll.hb.alignment = 0;
    fusenAll.hb.frame = $.NSMakeRect(14, 1, 160, 20); hv.addSubview(fusenAll.hb); fusenAll.grp = $.NSButton.buttonWithTitleTargetAction($(''), pgt, 'pgGrp:'); fusenAll.grp.bordered = false; fusenAll.grp.alignment = 1; fusenAll.grp.frame = $.NSMakeRect(170, 1, 64, 20); fusenAll.grp.autoresizingMask = 1; hv.addSubview(fusenAll.grp); hv.autoresizingMask = 2;
    const hd = $.NSMenuItem.alloc.init; hd.view = hv; m.addItem(hd); allTitle();
    return hd;
  }
  // ★v4.2.499(俊克「メニューバーからプルダウンした中に表示されるタイマーたちもリアルタイムに残時間を表示するように」):
  //   メニューを開いている間は作り替えない(v4.2.333)ので、中の行は開いた瞬間の値で止まっていた。
  //   → 並び(区切り・id・子メニュー)が同じなら、開いたままで**行の字だけ差し替える**。字の飾り(☐/⚓/赤い札)は styleItem 1つで付ける。
  let lastItems = [], lastEntries = [];
  // ★v5.1.331(俊克 10.30 am11:47「他のメニューは開く・本家 VS Code の古い MeOS(10.25 の V-helper)のメニューバーも開く」): 古い版との違いは、メニューの中のボタン(FUSEN/TAG の見出しと▲▼= MeOSPagerH)だけ。
  //   切り分けのスイッチ= 置き場所に noviews が在れば、それらを作らない(在るかは毎回見て、変わったら作り直す)
  const noViews = () => { try { return $.NSFileManager.defaultManager.fileExistsAtPath(dir + '/noviews'); } catch (e) { return false; } };
  // ★v5.1.398(俊克 11.02 am09:12 改良3「今日の分の⏰と明日以降の間に一点鎖線を引こう。1週間以内、1ヶ月以内、1年未満にも」): dd= 一点鎖線の区切り(線8・間3・点1.5・間3)= 絵の項目。畳むと⏰の行と一緒に隠す。v5.1.405: 開く直前に幅をメニューに合わせる(dashFit)・テンプレートの絵×0.45。★v5.1.406(俊克 am11:38 改良1「今日と1週間の境界だけ、一点鎖線を太くしよう。これで、近々やるべきことがはっきり分かる」): dd:2= 今日の境だけ線2pt・点2pt(他は1pt)→ am11:39「最初の2本を太く」= 1週間|1ヶ月の境も
  const dashImg = (th) => { const k = th ? 'b' : 'a'; dashImg.c = dashImg.c || {}; if (dashImg.c[k]) return dashImg.c[k]; const W = 900, H = 7, lw = th ? 2 : 1, y = th ? 2.5 : 3, im = $.NSImage.alloc.initWithSize($.NSMakeSize(W, H)); im.lockFocus; $.NSColor.blackColor.setFill; for (let x = 0; x < W; x += 15) { $.NSBezierPath.fillRect($.NSMakeRect(x, y, 8, lw)); $.NSBezierPath.fillRect($.NSMakeRect(x + 11, y, th ? 2 : 1.5, lw)); } im.unlockFocus; im.template = true; return dashImg.c[k] = im; }; const dashViews = []; const dashFit = (m) => { try { const w = Number(m.size.width); for (let i = dashViews.length - 1; i >= 0; i--) { const v = dashViews[i], mi = v.enclosingMenuItem; if (!mi || mi.isNil() || !mi.menu || mi.menu.isNil() || !mi.menu.isEqual(m)) { dashViews.splice(i, 1); continue; } if (w > 0) v.setFrameSize($.NSMakeSize(w, 9)); } } catch (e) {} }; const dashItem = (th) => { const mi = $.NSMenuItem.alloc.init; const box = $.NSView.alloc.initWithFrame($.NSMakeRect(0, 0, 100, 9)); box.autoresizingMask = 2; const iv = $.NSImageView.alloc.initWithFrame($.NSMakeRect(14, 1, 72, 7)); iv.image = dashImg(th); iv.imageScaling = 2; iv.imageAlignment = 4; iv.autoresizingMask = 2; iv.alphaValue = 0.45; box.addSubview(iv); box.clipsToBounds = true; iv.clipsToBounds = true; dashViews.push(box); mi.view = box; mi.enabled = false; return mi; };
  let lastNoViews = false;
  function build(entries, top) {
    const m = $.NSMenu.alloc.init; m.autoenablesItems = false;
    const its = [];
    const nv = lastNoViews = noViews();
    let headPrev = null;
    for (let e of entries) { if (headPrev) { const k = e.fusenAll ? 'c' : e.tagAll ? 'f' : e.title === 'Spells' ? 't' : ''; if (k) { headSeps.push([headPrev, k]); headPaint(); } } headPrev = null;   // v5.1.483: let= ⭐️を外した写しに差し替える
      if (nv && (e.clockAll || e.fusenAll || e.fusen || e.tagAll || e.tagPager)) { its.push(null); continue; }   // v5.1.331: 切り分け
      if (e.sep && e.dd && !nv) { try { const di = dashItem(e.dd === 2); m.addItem(di); clockAll.seps.push(di); di.hidden = (clockFold || (clockNear && !!e.far)) && !!clockAll.hb; if (e.far) clockAll.far.push(di); } catch (x) {} its.push(null); continue; }   // v5.1.398
      if (e.sep) { const sp = $.NSMenuItem.separatorItem; m.addItem(sp); headPrev = sp; if (e.cz) { clockAll.seps.push(sp); sp.hidden = (clockFold || (clockNear && !!e.far)) && !!clockAll.hb; if (e.far) clockAll.far.push(sp); } if (e.fz) { fusenAll.seps.push(sp); sp.hidden = !!fusenFold['\u0000all']; } its.push(null); continue; }   // v5.1.321: fz= 付箋の群の間の区切り(全体を畳むと隠す)
      if (e.fusenAll) { fusenAll.star = !!e.star; try { its.push(buildFusenAll(m)); } catch (x) { its.push(null); } continue; }   // v5.1.321
      if (e.clockAll) { clockAll.star = !!e.star; try { its.push(buildClockAll(m)); } catch (x) { its.push(null); } continue; }   // v5.1.356
      if (e.tagAll) { tagAll.star = !!e.star; try { its.push(buildTagAll(m)); } catch (x) { its.push(null); } continue; }   // v5.1.325
      if (e.tagPager) { try { buildTagPager(m, e); } catch (x) {} its.push(null); continue; }   // v5.1.327
      if (e.fusen) { try { its.push(buildFusen(m, e)); } catch (x) { its.push(null); } continue; }   // v5.1.310
      if (e.title == null) { its.push(null); continue; }   // v5.1.310: 知らない形の項目でメニューごと落とさない
      const _st = !e.sub && String(e.title).indexOf(STAR) === 0; if (_st) e = Object.assign({}, e, { title: starStrip(e.title) });   // v5.1.483: ⭐️は✓の欄へ
      const mi = m.addItemWithTitleActionKeyEquivalent($(e.title), e.sub ? null : 'pick:', $(''));
      if (_st) { try { const im = starImg(12); if (im) mi.onStateImage = im; mi.state = 1; } catch (x) {} }
      if (e.sub) mi.submenu = build(e.sub); else { mi.target = tgt; mi.representedObject = $(e.id || ''); }
      if (e.indent) mi.indentationLevel = e.indent;
      if (e.off) mi.enabled = false;
      if (e.check) mi.state = 1;   // v4.2.311: ✓
      if (e.tg) { tagAll.rows.push(mi); mi.hidden = tagAll.fold; }
      if (e.clk) { clockAll.rows.push(mi); mi.hidden = (clockFold || (clockNear && !!e.far)) && !!clockAll.hb; if (e.far) clockAll.far.push(mi); }   // v5.1.356: ⏰の見出しで畳む行(見出しが無い時は隠さない)   // v5.1.325: TAG の見出しで畳む行
      if (e.dayRow) { try { mi.view = makeDayRow(e.dayRow); } catch (x) {} its.push(mi); continue; }   // v5.0.0-52
      styleItem(mi, e);
      its.push(mi);
    }
    if (top) { lastItems = its; lastEntries = entries; nearPaint(); }   // v5.1.554: 明後日以降の行が在るかは組み終えて分かる
    return m;
  }
  function styleItem(mi, e) {
      // v4.2.331(俊克「常駐メニューは、□ を表示して、設定できることを分かり易くしようよ。□は大きめにね」): 箱付きの項目= ☐/☑ を大きく前に置く(✓は付いた時しか見えない)
      if (e.box !== undefined) { try { const mf = $.NSFont.menuFontOfSize(0); const a = $.NSMutableAttributedString.alloc.init;
        const b = $.NSMutableAttributedString.alloc.init; b.mutableString.setString($(e.box ? '\u2611' : '\u2610')); const rb = $.NSMakeRange(0, b.length);
        b.addAttributeValueRange($.NSFontAttributeName, $.NSFont.systemFontOfSize(24), rb); b.addAttributeValueRange($.NSBaselineOffsetAttributeName, $(-3), rb); a.appendAttributedString(b);
        const x = $.NSMutableAttributedString.alloc.init; x.mutableString.setString($('  ' + e.title)); x.addAttributeValueRange($.NSFontAttributeName, mf, $.NSMakeRange(0, x.length)); a.appendAttributedString(x);
        mi.attributedTitle = a; } catch (x) {} }
      // v4.2.330(俊克 改良1「メニューバーの中の⚓が絵文字のままだよ」): 一覧の⚓も札と同じ字の形・赤＋黒の縁
      if (!e.pill && !e.sub && /\u2693/.test(e.title || '')) { try { const mf = $.NSFont.menuFontOfSize(0); const a = $.NSMutableAttributedString.alloc.init;
        for (const q of String(e.title).split(/(\u2693\ufe0f?)/)) { if (!q) continue; const isA = q.charAt(0) === '\u2693'; const x = $.NSMutableAttributedString.alloc.init; x.mutableString.setString($(isA ? '\u2693\ufe0e' : q)); const r = $.NSMakeRange(0, x.length);
          x.addAttributeValueRange($.NSFontAttributeName, isA ? $.NSFont.boldSystemFontOfSize(24) : mf, r);   // v4.2.333(俊克「もう少し大きく」「係留中なので、垂直になっていると考えればいい」): 24pt・傾けない
          if (isA) { x.addAttributeValueRange($.NSForegroundColorAttributeName, $.NSColor.systemRedColor, r); x.addAttributeValueRange($.NSStrokeWidthAttributeName, $(-1.6), r); x.addAttributeValueRange($.NSStrokeColorAttributeName, $.NSColor.blackColor, r); x.addAttributeValueRange($.NSBaselineOffsetAttributeName, $(-4), r); }
          a.appendAttributedString(x); }
        mi.attributedTitle = a; } catch (x) {} }
      if (e.pill) {
        try {
          const font = $.NSFont.menuFontOfSize(0);
          const plain = (t) => { const x = $.NSMutableAttributedString.alloc.init; x.mutableString.setString($(t)); x.addAttributeValueRange($.NSFontAttributeName, font, $.NSMakeRange(0, x.length)); return x; };
          const at = $.NSMutableDictionary.alloc.init;
          at.setObjectForKey(font, $.NSFontAttributeName); at.setObjectForKey($.NSColor.whiteColor, $.NSForegroundColorAttributeName);
          const ns = $(e.pill), sz = ns.sizeWithAttributes(at);
          const PX = 5, H = Math.ceil(sz.height) + 2, W = Math.ceil(sz.width) + PX * 2;
          const img = $.NSImage.alloc.initWithSize($.NSMakeSize(W, H));
          img.lockFocus; $.NSColor.systemRedColor.setFill;
          $.NSBezierPath.bezierPathWithRoundedRectXRadiusYRadius($.NSMakeRect(0, 0, W, H), 5, 5).fill;
          ns.drawAtPointWithAttributes($.NSMakePoint(PX, (H - sz.height) / 2), at); img.unlockFocus;
          const att = $.NSTextAttachment.alloc.init; att.image = img;
          att.bounds = $.NSMakeRect(0, Math.round((font.capHeight - H) / 2), W, H);
          const all = plain(e.pre || '');
          all.appendAttributedString($.NSAttributedString.attributedStringWithAttachment(att));
          all.appendAttributedString(plain(e.post || ''));
          mi.attributedTitle = all;
        } catch (x) {}
      }
      // ★v4.2.557(俊克 改良1「秒の部分だけ色を付けようか? スクショを見ても違いがよく分る」): 秒まで動くのは次の1本だけ(v4.2.556)= その .SS を橙に。
      //   「:58」でなく「.58」のカワシマ式だから、分までの行と並べても桁が崩れず、色の付いた所だけが動く
      if (!e.pill && !e.sub && e.title && /^(\u23f0|\ud83c\udf05)/.test(e.title)) { try {   // v5.0.0-62: 🌅 の行も秒を赤く
        let a;
        if (/\u2693/.test(e.title) && mi.attributedTitle && mi.attributedTitle.length > 0) a = mi.attributedTitle.mutableCopy;   /* v4.2.690(俊克 バグ1「⚓指定のものが秒が赤くならない」): initWithAttributedString は JXA で使えず毎回エラー(握りつぶし)= ⚓ の行だけ色が付かなかった→ mutableCopy */
        else { a = $.NSMutableAttributedString.alloc.init; a.mutableString.setString($(e.title)); a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.menuFontOfSize(0), $.NSMakeRange(0, a.length)); }
        const i = ObjC.unwrap(a.string).search(/\.\d{2}(?=\s{3})/);
        if (i >= 0) { const rs = $.NSMakeRange(i, 3); a.addAttributeValueRange($.NSForegroundColorAttributeName, $.NSColor.systemRedColor, rs);   /* v4.2.561(俊克「橙は文字色としては少し色が飛んでいる。赤色に」): ⚓ と同じ赤 */
          // v4.2.558(俊克「少し見難いので、黒いアウトラインを1～2ピクセル」): 字の縁= 負の値で「塗り＋縁」。大きさは字の大きさに対する%(メニューの14pt で -5 ≈ 0.7pt = 網膜で約1.5px)
          a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.boldSystemFontOfSize($.NSFont.menuFontOfSize(0).pointSize), rs); a.addAttributeValueRange($.NSStrokeWidthAttributeName, $(-3.5), rs);   /* v4.2.560(俊克「これならアウトラインをもう少し太く」): -2→-3.5(-5 は細字の時に橙を食った) */   /* v4.2.559(俊克「橙がほとんど見えなくなった。太字に」): 太字にして縁は -5→-2(縁が字の内側の半分を食っていた) */ a.addAttributeValueRange($.NSStrokeColorAttributeName, $.NSColor.blackColor, rs);
          mi.attributedTitle = a; }
      } catch (x) {} }
  }
  // 残り時間の書き方= 拡張と同じ H:MM.SS(1日を越えたら Nd を前に)
  const face = (ms) => {
    let s = Math.max(0, Math.round(ms / 1000)); const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    const p = (n) => (n < 10 ? '0' : '') + n;
    return (d ? d + 'd ' + p(h) : String(h)) + ':' + p(m) + '.' + p(ss);
  };
// {* ▲mCN=1000_MENU_BUILD // end [cGJF=h] *}
// {* ▼mCN=1100_BELL_SOUNDS // 鐘の音(GROWL・神獣・ミャウ・ロケット) playBell (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // v4.2.628: 🍙GROWL は 1秒の音＋1/f ゆらぎの間(0.5〜1.5秒)= 一回ごとに次の時刻を決め直す(繰り返しのタイマーを使わない)
  let gapRows = [0.5, 0.5, 0.5, 0.5], gapN = 0;
  const growlGap = () => { gapN++; let k = 0, n = gapN; while (k < 3 && !(n & 1)) { n >>= 1; k++; } gapRows[k] = Math.random(); return 0.5 + gapRows.reduce((a, b) => a + b, 0) / gapRows.length; };
  // v4.2.629: 音の長さも 1/f ゆらぎ(0.5〜1.0秒・0.1秒刻み= growl-v6-500〜1000.wav から選ぶ)
  let lenRows = [0.5, 0.5, 0.5, 0.5], lenN = 0, growlLast = 1.0;
  const growlLen = () => { lenN++; let k = 0, n = lenN; while (k < 3 && !(n & 1)) { n >>= 1; k++; } lenRows[k] = Math.random(); const x = lenRows.reduce((a, b) => a + b, 0) / lenRows.length; return Math.round((0.5 + 0.5 * Math.min(1, Math.max(0, (x - 0.5) * 2.4 + 0.5))) * 10) / 10; };
  const growlFile = () => { const f = String(sound.file || ''); if (!/growl-v6-\d+\.wav$/i.test(f)) { growlLast = 1.0; return f; } const L = growlLen(), g = f.replace(/growl-v6-\d+\.wav$/i, 'growl-v6-' + Math.round(L * 1000) + '.wav'); try { if ($.NSFileManager.defaultManager.fileExistsAtPath(g)) { growlLast = L; return g; } } catch (e) {} growlLast = 1.0; return f; };
  const isGrowl = () => /growl/i.test(String(sound.file || ''));
  // v4.2.776-23(俊克「⚜️は3つのパターンをアットランダムに鳴らす」): gk3-full/gao/kakiin を等しい確率で選び、選んだ長さの85%で次へ(長さはファイルの大きさから)
  const isGk = () => /gk3-full\.wav$/i.test(String(sound.file || ''));
  let gkLast = 0;
  const gkFile = () => { const f = String(sound.file || ''); const k = ['full', 'gao', 'kakiin'][Math.floor(Math.random() * 3)], g = f.replace(/gk3-full\.wav$/i, 'gk3-' + k + '.wav');
    try { const fm = $.NSFileManager.defaultManager; if (fm.fileExistsAtPath(g)) { const a = fm.attributesOfItemAtPathError(g, $()); gkLast = (Number(ObjC.unwrap(a.objectForKey('NSFileSize'))) - 44) / 88200; return g; } } catch (e) {} gkLast = 3.3; return f; };
  const armGk = () => { try { if (bellTimer) bellTimer.invalidate; bellTimer = $.NSTimer.timerWithTimeIntervalTargetSelectorUserInfoRepeats(Math.max(0.5, (gkLast || 3.3) * 0.85), ticker, 'bell:', $(), false); $.NSRunLoop.currentRunLoop.addTimerForMode(bellTimer, $.NSRunLoopCommonModes); } catch (e) {} };
  const isPurrF = () => /purr-v\d+\.wav$/i.test(String(sound.file || ''));   // v4.2.630: 😸PURR も🍙方式(1.12秒の音＋1/f の間)
  const armGrowl = () => { try { if (bellTimer) bellTimer.invalidate; bellTimer = $.NSTimer.timerWithTimeIntervalTargetSelectorUserInfoRepeats((isPurrF() ? 1.12 : growlLast) + growlGap(), ticker, 'bell:', $(), false); $.NSRunLoop.currentRunLoop.addTimerForMode(bellTimer, $.NSRunLoopCommonModes); } catch (e) {} };
  // v4.2.408: Mew の鳴き続けは一鳴き毎に大きさを1/fゆらぎ(拡張の meosMewGain と同じ作り・0.55〜1.15倍)
  let mewRows = [0.5, 0.5, 0.5, 0.5], mewN = 0;
  const mewGain = () => {
    mewN++; let k = 0, n = mewN; while (k < 3 && !(n & 1)) { n >>= 1; k++; }
    mewRows[k] = Math.random();
    return 0.55 + 0.6 * (mewRows.reduce((a, b) => a + b, 0) / mewRows.length);
  };
  // v4.2.676: 🚀ROCKET はいつもフェード版(rocket-v2-fade.wav)
  const rocketFile = () => { const f = String(sound.file || ''); if (!/rocket-v2\.wav$/i.test(f)) return f; const g = f.replace(/rocket-v2\.wav$/i, 'rocket-v2-fade.wav'); try { if ($.NSFileManager.defaultManager.fileExistsAtPath(g)) return g; } catch (e) {} return f; };
  const playBell = () => {
    try {
      if (!sound.file) return;
      const g = sound.fluct ? mewGain() : 1;
      $.NSTask.launchedTaskWithLaunchPathArguments('/usr/bin/afplay', $(['-v', String(Math.round((sound.vol || 2) * g * 100) / 100), isGrowl() ? growlFile() : (isGk() ? gkFile() : rocketFile())]));
    } catch (e) {}
  };
// {* ▲mCN=1100_BELL_SOUNDS // end [cGJF=h] *}
// {* ▼mCN=1200_TAG_COLORS // 札の色 (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  let lastMenu = null, lastText = null;
  const orange = $.NSColor.colorWithSRGBRedGreenBlueAlpha(0xe0 / 255, 0x80 / 255, 0x3a / 255, 1);
  const blue = $.NSColor.colorWithSRGBRedGreenBlueAlpha(0x2f / 255, 0x80 / 255, 0xb8 / 255, 1);   // v4.2.316: ⚓停泊中
  // ★v4.2.373(俊克「VSCm用helperは今まで通りオレンジ色、本家VSC用のhelperを別の色に」): 本家は紫(青は⚓の色なので使わない)
  const purple = $.NSColor.colorWithSRGBRedGreenBlueAlpha(0x7c / 255, 0x3a / 255, 0xed / 255, 1);
  let lastAnchor = null, lastIdle = null, lastPk = null;
  // ★v4.2.363: 常駐の係は、⏰が無い時も消えない= 灰色の ⏰ で居る(そこからアプリの起動/終了ができる)。
  const gray = $.NSColor.colorWithSRGBRedGreenBlueAlpha(0x6b / 255, 0x72 / 255, 0x80 / 255, 1);
// {* ▲mCN=1200_TAG_COLORS // end [cGJF=h] *}
// {* ▼mCN=1250_TAG_SEATS // 札の🪑の席の絵 (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // v5.1.60(俊克「⚓の青い札の時は、椅子の部分との境目に細い白い線を」)→ v5.1.61(「一律で白い境界線を入れよう」): 境目には札の色によらず1ptの白
  // v5.1.57(俊克「メニューバーの背景色を椅子の部分だけ色を変えよう」): 末尾の離席の残り(🪑3m / 🪑0:42)だけ席の色の地に(Me Dock の↻の丸と同じ色)
  const SEATS = [[String.fromCodePoint(0x1FA91), 0x2f, 0x9c, 0xcc], [String.fromCodePoint(0x1F6CB) + String.fromCharCode(0xFE0F), 0xc2, 0x4a, 0x3e], [String.fromCodePoint(0x1F4BA), 0xc4, 0x95, 0x1a]];
  const seatPart = (t) => { t = String(t); for (const s of SEATS) { const i = t.lastIndexOf(s[0]); if (i < 0) continue; const tail = t.slice(i + s[0].length); if (/^([0-9]+m|<1m|0:[0-9][0-9])$/.test(tail)) return { at: i, rgb: s }; } return null; };
  const fillSeat = (t, font, PX, W, H) => { try { const sp = seatPart(t); if (!sp) return; const pre = String(t).slice(0, sp.at); const x0 = pre.replace(/ +$/, '') ? Math.max(0, PX + styled(pre, font, true).size.width - 4) : 0;
    $.NSColor.colorWithSRGBRedGreenBlueAlpha(sp.rgb[1] / 255, sp.rgb[2] / 255, sp.rgb[3] / 255, 1).setFill; $.NSBezierPath.bezierPathWithRoundedRectXRadiusYRadius($.NSMakeRect(x0, 0, W - x0, H), 5, 5).fill; if (x0 > 0) $.NSBezierPath.fillRect($.NSMakeRect(x0, 0, 6, H)); if (x0 > 0) { $.NSColor.whiteColor.setFill; $.NSBezierPath.fillRect($.NSMakeRect(x0, 0, 1, H)); } } catch (e) {} };   // v5.1.58(俊克「色の境界線をラウンドではなく、直線に」): 境目は直線・右の端だけ札と同じ丸み
// {* ▲mCN=1250_TAG_SEATS // end [cGJF=h] *}
// {* ▼mCN=1300_TAG_PIECES // 札のパズルのピース / ⌘Q・名札 / 当たり pieceHit / 絵 drawPiece (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // ★v5.1.401(俊克 11.02 am10:02 改良2「Me Dockが表示/非表示にかかわらず、🔴マークが付いたパズルのピース、例えば[c]をメニューバーの離席表示の右側に」):
  //   Me Dock の .md-tile と同じ= 白い角丸の地に字の色(M赤 e橙 D緑 o青 c紫 k紅)・Ⓣは緑の地に白。下に🔴= 段1は真ん中4px・段2は左端6px・段3は右端8px(下端は揃え、上へ育ってピースに被る)
  const PZ_COL = { M: [0xe5, 0x39, 0x35], e: [0xf5, 0x7c, 0x00], D: [0x2e, 0x9d, 0x3a], o: [0x1e, 0x7f, 0xd6], c: [0x8e, 0x24, 0xaa], k: [0xc2, 0x18, 0x5b] };
  const pzRgb = (a) => $.NSColor.colorWithSRGBRedGreenBlueAlpha(a[0] / 255, a[1] / 255, a[2] / 255, 1);
  // ★v5.1.407(俊克 pm00:00「1つ前のも追加…[Ⓣ][c]…[Ⓣ]をクリックすれば[c][Ⓣ]のように入れ替る」): [1つ前(白い点)][最後(🔴)]の2枚。左を押すとその字へ飛び、2枚が入れ替わる(拡張の meosPuzzleLastSet が1つ前を送る)
  // ★v5.1.402(俊克 11.02 am10:27 改良1「[c]にワープしたあとに、他の場所にタイマーなどで飛んだ時、このメニューバーの[c]をクリックすると、戻れるように」):
  //   札は押すとメニューが開く→ 開く直前(menuWillOpen)にポインターが札の右端のピースの上なら、閉じて /puzzle で拡張へ(Opt+クリックと同じ作り)。ピースの場所= 札の枠の中で絵は真ん中寄せ→ 右端から余白と幅で
  let pieceImgW = 0, imgAllW = 0, logoW = 0;   // v5.1.463: 札の絵の全幅と左端ロゴの幅(ロゴの当たり)
  // ★v5.1.437(俊克 pm00:23 改良2「メニューバーにも、⏻ボタンを付けよう。ここをクリックしても、mGATEは消えないようにする」): 札の右端= 終了ボタン(⌘Q)。押すとエディターだけ終える(メニューは開かず Barman も消さない)
  const QUIT_W = 19, LAUNCH_W = 19;   // v5.1.442: どちらも 隙間3＋16   // 隙間3＋ボタン20 / v5.1.439: 起動ボタン= 隙間3＋アイコン16
  let edRunAt = 0, edRun = false;
  const edBundle = () => myScheme === 'vscode' ? 'com.microsoft.VSCode' : 'com.vscodium';
  const edRunning = () => { const now = Date.now(); if (now - edRunAt > 1500) { edRunAt = now; try { edRun = Number($.NSRunningApplication.runningApplicationsWithBundleIdentifier(edBundle()).count) > 0; } catch (e) { edRun = false; } } return edRun; };
  const edQuit = () => { try { const a = $.NSRunningApplication.runningApplicationsWithBundleIdentifier(edBundle()); for (let i = 0; i < a.count; i++) a.objectAtIndex(i).terminate; hlog('[quit] ' + edBundle() + ' に終了を頼んだ'); } catch (e) { hlog('[quit] 失敗 ' + e); } edRunAt = 0; };
  // ★v5.1.442(俊克 pm01:34 改良1「[VSCmマーク][⌘Q] の順…終了の方が端っこ」改良2「⌘Qの地の色を赤に。押すと危険、という感じ。VSCmアイコンと同じ大きさに」): 16×16 の赤い角丸・右端
  const drawQuit = (x0, H) => { const TW = 13, TH = 13, ty = 2.5; x0 += 1.5; pzRgb([0xd9, 0x3a, 0x3a]).setFill; $.NSBezierPath.bezierPathWithRoundedRectXRadiusYRadius($.NSMakeRect(x0, ty, TW, TH), 3, 3).fill;   // アイコンの絵は16の枠の中で約13(余白込みの絵)= 見える大きさを揃える
    const a = $.NSMutableAttributedString.alloc.init; a.mutableString.setString($('\u2318Q')); const rg = $.NSMakeRange(0, a.length); a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.systemFontOfSizeWeight(6.6, 0.6), rg); a.addAttributeValueRange($.NSForegroundColorAttributeName, $.NSColor.whiteColor, rg);
    const sz = a.size; a.drawAtPoint($.NSMakePoint(x0 + (TW - sz.width) / 2, ty + (TH - sz.height) / 2)); };
  let quitShown = false, pieceClickAt = 0, ctlW = 0, menuIcon = null, ctlItems = [], iconCache = {};
  // ★v5.1.443(俊克 pm01:52「VSCmが起動中は、[VSCmマーク]を消そう…ついでに、[VSCodeマーク]もVSCodeが起動してない場合は一緒に出そう。すべてをここからコントロールできる」):
  //   札の右端= [もう一方のエディター(入っていて動いていない時)][自分のエディター: 動いていれば ⌘Q / いなければアイコン]
  const otherBundle = () => myScheme === 'vscode' ? 'com.vscodium' : 'com.microsoft.VSCode';
  const runOf = {}; const isRunning = (bid) => { const now = Date.now(), c = runOf[bid]; if (c && now - c.at < 1500) return c.v; let v = false; try { v = Number($.NSRunningApplication.runningApplicationsWithBundleIdentifier(bid).count) > 0; } catch (e) {} runOf[bid] = { at: now, v: v }; return v; };
  const urlOf = (bid) => { try { const u = $.NSWorkspace.sharedWorkspace.URLForApplicationWithBundleIdentifier(bid); return (u && !u.isNil()) ? u : null; } catch (e) { return null; } };
  const iconOf = (bid) => { if (iconCache[bid] !== undefined) return iconCache[bid]; const u = urlOf(bid); let ic = null; try { if (u) ic = $.NSWorkspace.sharedWorkspace.iconForFile(u.path); } catch (e) {} iconCache[bid] = ic; return ic; };
  const launchBid = (bid) => { try { const u = urlOf(bid); if (u) { $.NSWorkspace.sharedWorkspace.openURL(u); hlog('[launch] ' + bid + ' を起こした'); } } catch (e) { hlog('[launch] 失敗 ' + e); } runOf[bid] = null; };
  // ★v5.1.445(俊克 pm05:36 改良1「どっちがVSCmかが分からない…自分自身のロゴを表示…起動中は明るい色、閉じている時は暗い色…自分のことだけをする」): もう一方のエディターの起動(launch2)はやめ、
  //   いつも[自分のアイコン][⌘Q]= アイコンは動いていれば明るく(押す=前へ出す)・閉じていれば暗く(押す=起こす)。⌘Q は動いている時だけ
  // ★v5.1.447(俊克 pm06:31「⌘Qボタンを廃止、mGATEをcmdクリックで終了にしよう」): 札は[自分のアイコン]だけ
  const ctlBuild = () => { const a = []; if (urlOf(edBundle())) a.push('launch'); return a; };
  const pieceHit = () => { try { const b = item.button, w = b.window; if (!w || w.isNil() || !imgAllW) return false; const r = w.convertRectToScreen(b.convertRectToView(b.bounds, $())), p = $.NSEvent.mouseLocation;
    if (logoW && p.y >= r.origin.y && p.y <= r.origin.y + r.size.height) { const xl = r.origin.x + Math.max(0, (r.size.width - imgAllW) / 2); if (p.x >= r.origin.x && p.x <= xl + logoW) return '\u0000logo'; }   // ★v5.1.463(俊克 am02:10「VSCodeを閉じて、mGATEも消した時、VSCodeを起動できない」): 札の左端の小さいロゴ= Barman のロゴと同じ(クリック=最前面/起動・Cmd=終了・Shift=Barmanを閉じる)
    if (!pieceImgW) return false;
    const pad = Math.max(0, (r.size.width - pieceImgW) / 2), xr = r.origin.x + r.size.width - pad; if (!(p.y >= r.origin.y && p.y <= r.origin.y + r.size.height)) return '';
    for (let j = 0; j < ctlItems.length; j++) { const rx = xr - j * 19; if (p.x >= rx - 16 - 1 && p.x <= rx + (j === 0 ? pad : 1)) return '\u0000' + ctlItems[ctlItems.length - 1 - j]; }   // v5.1.443: 右から ⌘Q/起動・もう一方   // v5.1.442: 右端= ⌘Q・その左= 起動
    if (!pzl.ch) return '';
    const x1 = xr - ctlW, x0 = x1 - 17;
    if (p.x >= x0 - 1 && p.x <= x1 + (ctlW ? 1 : pad)) return pzl.ch; if (pzl.prev && p.x >= x0 - 18 && p.x < x0 - 1) return pzl.prev; return ''; } catch (e) { return ''; } };   // v5.1.407: 押した字(右=最後・左=1つ前)を返す
  // ★v5.1.403(俊克 11.02 am11:03「🔴の配置は直してよ」= Me Dock と大きく違う): 401 は🔴(4/6/8pt)がピース(13pt)の下端に食い込んでいた。Me Dock= ピースの下に隙間を空けて小さな点(ピースの高さの約1/5)。
  //   → ピースを 14×11.5 に縮めて上へ寄せ(下に6pt空ける)、🔴は 3/4.5/6pt(Me Dock の 4/6/8 と同じ 2:3:4)・下端は札の下0.5ptで揃える= 段1は2.5ptの隙間・段3だけ上へ育ってピースに少し被る(Me Dock と同じ)
  // ★v5.1.404(俊克 am11:06 改良1「メニューバーは小さいので、🔴はさっきの大きさの方が見やすい・今回は明らかに小さい」「🔴の表示位置が微妙に異なる」): 🔴は 4/6/8pt に戻す。
  //   位置は Me Dock の .md-tile.md-dot::after と同じ数= 🔴の下端はピースの下端の6pt下(bottom:-6px)・段1は真ん中・段2は左端・段3は右端 → 段1は2ptの隙間・段2は接する・段3は2pt被る(Me Dock と同じ)。ピースは14×12・下端を札の下から6pt
  const drawPiece = (x0, H, chArg, white) => { const ch = chArg || pzl.ch, isT = ch === 'T', isF = ch === '\u2661', TW = 14, TH = 12, ty = 6;
    (isT ? pzRgb([0x2e, 0x9d, 0x3a]) : $.NSColor.whiteColor).setFill; $.NSBezierPath.bezierPathWithRoundedRectXRadiusYRadius($.NSMakeRect(x0, ty, TW, TH), 3.5, 3.5).fill;
    const a = $.NSMutableAttributedString.alloc.init; a.mutableString.setString($(isT ? '\u24c9' : isF ? (typeof pzl.dots === 'string' && pzl.dots.indexOf('f') >= 0 ? '\u2665\ufe0e' : '\u2661\ufe0e') : ch)); const r = $.NSMakeRange(0, a.length);   // v5.1.407: Ⓣは Me Dock と同じ丸囲みの字
    a.addAttributeValueRange($.NSFontAttributeName, $.NSFont.systemFontOfSizeWeight(isT || isF ? 11 : 10, 0.56), r); a.addAttributeValueRange($.NSForegroundColorAttributeName, isT ? $.NSColor.whiteColor : isF ? pzRgb([0xe5, 0x39, 0x35]) : pzRgb(PZ_COL[ch] || [0x33, 0x33, 0x33]), r);
    const sz = a.size; a.drawAtPoint($.NSMakePoint(x0 + (TW - sz.width) / 2, ty + (TH - sz.height) / 2));
    if (isF) return; if (typeof pzl.dots === 'string' && pzl.dots.indexOf(ch) < 0 && (white || isT)) return;   // v5.1.428: Ⓣ も dots に在る時(日記帳)だけ点(白も赤も)   // ★v5.1.421(俊克 11.03 am04:06 バグ1「MW-GATEに表示されるMeDockⓉが、Me Dockの白い点と赤い点の通りに表示されない」): 白い点= 印の在る字だけ(Me Dock の md-dot と同じ letters)・Ⓣは常に
    const lv = white ? 1 : pzl.lv, d = lv === 3 ? 8 : lv === 2 ? 6 : 4, dx = lv === 3 ? x0 + TW - d : lv === 2 ? x0 : x0 + (TW - d) / 2;
    (white ? $.NSColor.whiteColor : pzRgb([0xe5, 0x39, 0x35])).setFill; $.NSBezierPath.bezierPathWithOvalInRect($.NSMakeRect(dx, ty - 6, d, d)).fill;
    $.NSColor.colorWithWhiteAlpha(0, 0.5).setStroke; const ov = $.NSBezierPath.bezierPathWithOvalInRect($.NSMakeRect(dx, ty - 6, d, d)); ov.lineWidth = 0.5; ov.stroke; };
// {* ▲mCN=1300_TAG_PIECES // end [cGJF=h] *}
// {* ▼mCN=1400_MGATE_TILES // ぶら下がりのmGATE= 寸法 DO_* / dockOut の状態 / タイルの絵 / 押した時 dockOutFire / edLaunch (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // ★v5.1.412(俊克 11.02 pm01:41「小さいのはそのまま操作できるようにして、その上で、MeDockⓉすべてをメニューバーの直ぐ下に並べる。これで、Me Dockを非表示にしてあっても、Me Dockの出張所が開設した感じに」):
  //   札の右端のピースに乗ったら、メニューバーの直ぐ下(ピースの右端に揃える)に、Me Dock のタイル7枚(M e D o c k Ⓣ・Me Dock と同じ並び ord・点は白・最後だけ🔴の段)を2倍で並べた小窓。
  //   小窓は前に出ない窓(押してもアプリが前へ出ない・焦点を取らない)。小窓の上に居る間は保ち、ピースからも小窓からも離れて0.5秒で閉じる(斜めに移る間の猶予)。メニューを開いたら閉じる。
  //   押す= どのタイルかを数え、/puzzle?ch= で拡張へ(ピースと同じ口)。押した字は返事を待たずに最後へ・前の最後は1つ前へ= 札の2枚もすぐ入れ替わる
  const DO_S = 2, DO_TW = 16 * DO_S, DO_TH = 18 * DO_S, DO_GAP = 4, DO_PAD = 8;
  // ★v5.1.415(俊克 pm03:53「このツールボタンの左端にwGATEのロゴマークをでかでかと付けて、高らかに、The GATEを布告しよう」): 左端に MW-GATE ロゴ(札の左と同じ絵)を 44pt で。タイルはその右から
  const DO_LG = 44, DO_LX = 6, DO_X0 = DO_LX + DO_LG + 8;
  const dockOut = { win: null, ivs: [], shown: false, pin: false, leaveAt: 0, ft: null, dnN: 0, upN: 0, downAt: -1, seat: '', drag: null, glide: null, tips: {} };
  const FOF = '\u2661';   // ★v5.1.537(俊克 11.06 pm03:05 改良1「♥️ボタンは、他のパズルと基本は同じに」): mGATE の右端の札= 字 f(本文の印 mP7)。押す= 無ければ書く・在れば飛ぶ(/fof)。空の♡= 今のファイルに印が無い・塗った♥= 在る(dots の f)。🔴は動かさない
  const dockOutTile = (ch) => { const im = $.NSImage.alloc.initWithSize($.NSMakeSize(DO_TW, DO_TH)); im.lockFocus;
    const tf = $.NSAffineTransform.transform; tf.scaleXByYBy(DO_S, DO_S); tf.concat; drawPiece(1, 18, ch, ch !== pzl.ch); im.unlockFocus; return im; };
  // ★v5.1.413(俊克 pm01:47「表示したよ。でも、クリックしてもワープはしない」): 実測= events.log に「開いた」は在るが「押した」が1つも無い= 押した事が wGATE に届いていない。
  //   wGATE は NSApplication を回さず(runUntilDate だけ)、札とメニューのクリックは macOS が代わりに扱う→ 自分の小窓へのクリックは誰も読まない。412 の受け皿(mouseDown)は呼ばれなかった。
  //   → 全体の受け渡しは変えない(メニューを壊さない)。小窓が開いている間だけ0.02秒ごとにマウスのボタンを見て、同じタイルの上で押して放したら押したとみなす
  // ★v5.1.429(俊克 am05:54「日記でないファイルでは、Ⓣを非表示に」): 並べる字= 並び(ord)から、日記帳でない時(dots に T が無い)は T を抜く。窓の幅も枚数に合わせる
  const doOrd = () => { const o = String(pzl.ord || ''); return ((typeof pzl.dots === 'string' && pzl.dots.indexOf('T') < 0) ? o.replace('T', '') : o) + FOF; };
  const doW = (n) => DO_X0 + DO_PAD + n * DO_TW + (n - 1) * DO_GAP;   // v5.1.439: 起動ボタンは札へ移した
  // ★v5.1.438(俊克 pm00:50 改良2「⌘Qの下に、VSCm起動ボタンを付けよう。これで、オン/オフもすべて、メニューバーから制御できる」): Barman の右端(札の ⌘Q の真下)= エディターのアイコン。
  //   動いていなければ起こす・動いていれば前へ出す
  const edAppUrl = () => { try { const u = $.NSWorkspace.sharedWorkspace.URLForApplicationWithBundleIdentifier(edBundle()); return (u && !u.isNil()) ? u : null; } catch (e) { return null; } };
  const edLaunch = () => { try { const a = $.NSRunningApplication.runningApplicationsWithBundleIdentifier(edBundle()); if (Number(a.count) > 0) { a.objectAtIndex(0).activateWithOptions(2); hlog('[launch] 前へ出した'); }
    else { const u = edAppUrl(); if (u) { $.NSWorkspace.sharedWorkspace.openURL(u); hlog('[launch] 起こした'); } } } catch (e) { hlog('[launch] 失敗 ' + e); } edRunAt = 0; };
  const dockOutFire = (i) => { const ch = doOrd().charAt(i); if (!ch || i < 0) return;
    let alt = ''; try { if ((Number($.NSEvent.modifierFlags) & 0x80000) !== 0) alt = 'alt=1'; } catch (e) {}   // ★v5.1.541: Opt+クリック= 印を巡る
    let cmd = false; try { cmd = (Number($.NSEvent.modifierFlags) & 0x100000) !== 0; } catch (e) {}   // ★v5.1.546: Cmd+クリック= 一括で消す(🔴は動かさない)
    if (cmd && ch !== 'T') { hlog('[dockOut] ' + ch + ' を Cmd クリック→ 一括で消す'); openWarp(scheme + '://' + ext + (ch === FOF ? '/fof?sweep=1' : '/puzzle?sweep=1&ch=' + encodeURIComponent(ch))); return; }
    if (ch === FOF) { hlog('[dockOut] ♡ を押した'); openWarp(scheme + '://' + ext + '/fof' + (alt ? '?' + alt : '')); return; }
    hlog('[dockOut] ' + ch + ' を押した→ ワープ');
    if (ch !== pzl.ch) { pzl = { ch: ch, lv: pzl.lv, prev: pzl.ch, ord: pzl.ord, dots: pzl.dots }; try { step(); } catch (x) {} dockOutPaint(); }
    openWarp(scheme + '://' + ext + '/puzzle?' + (alt ? alt + '&' : '') + 'ch=' + encodeURIComponent(ch)); };   // ★v5.1.446(俊克 pm06:27「mGATEのパズルをクリックしてワープしても、mGATEは閉じない…Me Dockと同じように」): 閉じるのはロゴの Shift クリックだけ   // ★v5.1.441(俊克 pm01:24「消したいと思うmGATEを操作すると消えるので、このほうが自然」): Barman のタイルでワープしたら、どの出し方でも消す
// {* ▲mCN=1400_MGATE_TILES // end [cGJF=h] *}
// {* ▼mCN=1410_MGATE_HIT // mGATE の当たり= dockOutAt / ロゴの台形 / 札と点 / 掴む所 dockOutOnGrip / dockOutHandAt (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  const dockOutAt = () => { try { if (!dockOut.win) return -1; const f = dockOut.win.frame, p = $.NSEvent.mouseLocation, x = p.x - f.origin.x, y = p.y - f.origin.y;
    if (y < DO_PAD - 2 || y > DO_PAD + DO_TH + 2) return -1; const i = Math.floor((x - DO_X0 + DO_GAP / 2) / (DO_TW + DO_GAP)); return i >= 0 && i < doOrd().length ? i : -1; } catch (e) { return -1; } };
  // ★v5.1.414(俊克 pm01:56「押すタイミングで、認識したりしなかったりする」): 413 は「今押されているか」を0.02秒ごとに見た→ 札の描き直しやファイル読みで見張りが0.1秒以上遅れると、素早いクリック(押して放すまで0.1秒未満)は丸ごと間に落ちた。
  //   → Mac が数えている「押した回数・放した回数」(CGEventSourceCounterForEventType)を見る= 見張りが遅れても「前に見た時から1回放された」が分かる。放された時の位置がタイルの外なら、押された時に見たタイル
  const dockOutCnt = (t) => { try { return Number($.CGEventSourceCounterForEventType(0, t)) || 0; } catch (e) { return 0; } };
  // ★v5.1.416(俊克 pm04:50 バグ1「しばらくすると、ぶら下がりツールにホーバーすると、レインボー風車が回る」): wGATE は NSApplication を回さない→ 自分の小窓へ来た出来事(マウスが入った・動いた等)が読まれずに溜まり、数秒で macOS が「応答なし」と見なして小窓の上だけ風車にする(実測: CPU 8%で回ってはいない= 無限ループでない)
  //   → 小窓が出ている間は溜まった出来事を汲み出して渡す(sendEvent)。押した判定は従来どおり Mac の回数で
  const dockOutDrain = () => { try { const app = $.NSApplication.sharedApplication, past = $.NSDate.distantPast; for (let k = 0; k < 64; k++) { const ev = app.nextEventMatchingMaskUntilDateInModeDequeue(0xFFFFFFFF, past, $.NSDefaultRunLoopMode, true); if (!ev || ev.isNil()) break; if (Number(ev.type) === 1 && dockOut.win && Number(ev.windowNumber) === Number(dockOut.win.windowNumber)) { dockOut.gotAt = Date.now(); if (!dockOut.ever) { dockOut.ever = true; hlog('[dockOut] 窓に押しが届いた(以後は届いた押しだけ受ける)'); } } app.sendEvent(ev); } } catch (e) {} };
  // ★v5.1.621(俊克 11.09 pm00:18「Maccyのプレビューのクリックがすり抜けて、mGATEがハックしてしまう」→ pm00:24「Maccyのやり方を使えば」→ pm00:28 試作): 押した回数と座標だけでは、手前に別のアプリの窓があっても押されたと読む。
  //   macOS が手前の窓にだけ届ける mouseDown を、汲み出し(v5.1.416)の中で見る。一度も届いていない間は今まで通り= 届かない Mac で mGATE が死なない
  const dockOutPressMine = (ever, gotAt, downT) => !ever || gotAt >= downT - 200;
  // ★v5.1.622(俊克 11.09 pm02:02 改良1「mGATEのパズルボタンのtipが表示されてしまう」): ホバーには届く出来事が無いので、ポインターの下で一番手前の窓の番号を macOS に訊く(windowNumberAtPoint= 実測で0.1ms・ignoresMouseEvents の窓は数えない= クリックが届く先と同じ)。tip/指/掌/↖/×の印/掴みはこの1つで止める。答えが取れない時は今まで通り
  const dockOutFront = () => { try { if (!dockOut.win) return true; const p = $.NSEvent.mouseLocation, n = Number($.NSWindow.windowNumberAtPointBelowWindowWithWindowNumber($.NSMakePoint(p.x, p.y), 0)); return !(n > 0) || n === Number(dockOut.win.windowNumber); } catch (e) { return true; } };
  // ★v5.1.417(俊克 pm06:03 改良1「shift長押しのときに、このぶら下がりツールも出すようにしよう…出しっぱなしで、メニューバーの背景をclickすれば消す…あるいは、ワープしたあとには消す」):
  //   構え(arm)が点いた時に出し、離れても消さない(pin)。消すのは= メニューバーの地を押した/タイルでワープした/最後の字が変わった(キーでワープした)/メニューを開いた
  const dockOutOnBar = () => { try { const p = $.NSEvent.mouseLocation; try { const b = item.button, bw = b.window; if (bw && !bw.isNil()) { const r = bw.convertRectToScreen(b.convertRectToView(b.bounds, $())); if (p.x >= r.origin.x && p.x <= r.origin.x + r.size.width && p.y >= r.origin.y - 1 && p.y <= r.origin.y + r.size.height + 1) return false; } } catch (e) {}   // v5.1.437: 自分の札は地でない(札の終了ボタンで Barman を消さない)
    const sc = $.NSScreen.screens; for (let k = 0; k < sc.count; k++) { const f = sc.objectAtIndex(k).frame, v = sc.objectAtIndex(k).visibleFrame; if (p.x < f.origin.x || p.x > f.origin.x + f.size.width) continue; const top = f.origin.y + f.size.height, bar = Math.max(22, top - (v.origin.y + v.size.height)); return p.y >= top - bar - 1 && p.y <= top + 1; } } catch (e) {} return false; };
  // ★v5.1.445(俊克 pm05:36 改良2「mGATEのパズル以外の背景をクリックすると…閉じずに、ウィンドウを最前面に出す…macのDockをクリックする代わりに、ここですべてをコントロールしたい」): 自分の Barman の中でタイルの外を押したら edLaunch(動いていれば前へ・閉じていれば起こす)
  // ★v5.1.446(俊克 pm06:27「mGATEロゴを起動ボタンにする…Shiftクリックで閉じる(Shift長押しで出るので Shift キー連合)」): ロゴ= 押す→ edLaunch・Shift+押す→ 閉じる。タイルの外の地は何もしない
  // ★v5.1.531(俊克 11.06 am08:35 バグ1「純白の↖なのに、ワープ/最前面に出てしまう」= ポインターの形を動作条件に・改良1「mGATEの範囲をロゴの形により厳密に、斜めの境界に」): ロゴの絵(mgate-big.png)の外形は上辺 49〜127/176・下辺 全幅の台形(実測)。指も押す判定もこの1つ
  const DO_LOGO_TOP = 49 / 176;
  const dockOutOnLogo = () => { try { if (!dockOut.win) return false; const f = dockOut.win.frame, p = $.NSEvent.mouseLocation, u = (p.x - f.origin.x - DO_LX) / DO_LG, v = (p.y - f.origin.y - (f.size.height - DO_LG) / 2) / DO_LG; if (v < 0 || v > 1) return false; const e = DO_LOGO_TOP * v; return u >= e && u <= 1 - e; } catch (e) { return false; } };
  const dockOutOnWin = () => { try { if (!dockOut.win) return false; const f = dockOut.win.frame, p = $.NSEvent.mouseLocation; return p.x >= f.origin.x && p.x <= f.origin.x + f.size.width && p.y >= f.origin.y && p.y <= f.origin.y + f.size.height; } catch (e) { return false; } };
  const dockOutDot = (i) => { const ch = doOrd().charAt(i), white = ch !== pzl.ch; if (ch === FOF) return null; if (typeof pzl.dots === 'string' && pzl.dots.indexOf(ch) < 0 && (white || ch === 'T')) return null; const lv = white ? 1 : pzl.lv, d = lv === 3 ? 8 : lv === 2 ? 6 : 4, dx = lv === 3 ? 15 - d : lv === 2 ? 1 : 1 + (14 - d) / 2; return { x: (dx + d / 2) * DO_S, y: DO_PAD + d / 2 * DO_S, r: d / 2 * DO_S }; };   // v5.1.531: drawPiece と同じ計算= 🔴は段で左/右へ動き大きくなる(521 は真ん中の白い点の位置に決め打ちで、🔴の上に指が出ない所があった)
  const dockOutOnTile = () => { try { const i = dockOutAt(); if (i < 0) return false; const mp = $.NSEvent.mouseLocation, f = dockOut.win.frame, x = mp.x - f.origin.x, y = mp.y - f.origin.y, t0 = DO_X0 + i * (DO_TW + DO_GAP); if (x >= t0 + 2 && x <= t0 + 30 && y >= 19 && y <= 44) return true; const c = dockOutDot(i); return !!c && Math.hypot(x - (t0 + c.x), y - c.y) <= c.r + 1.5; } catch (e) { return false; } };   /* v5.1.521(俊克 pm06:45 改良1「🔴ボタンの横では↖」): 指は白い札と丸い点の上だけ(スクショの実寸・窓の下からの座標) */   // v5.1.519: dockOutAt は「どの字の列か」だけ。指も押す判定もこの dockOutOnTile(v5.1.531)
  const dockOutOnGrip = () => { try { return dockOutInPanel() && dockOutFront() && $.NSEvent.mouseLocation.x - dockOut.win.frame.origin.x < DO_LX + DO_LG / 2 && !dockOutOnLogo(); } catch (e) { return false; } };   // ★v5.1.534(俊克 am10:04「掴めるのは、mGATEロゴの左側の隙間だけに限定しよう。🔴と白マークの間で移動手が現れたら、うざいでしょ?」): 窓の左端〜ロゴの斜めの線まで。他の地は従来の↖= 何も起きない
  const dockOutHandAt = () => dockOutOnTile() ? dockOutAt() : dockOutOnLogo() ? -2 : -1;   // ★v5.1.531: 指が出る所だけ押せる(字の番号 / -2= ロゴ / -1= ↖の所= 何も起きない)。押した時に↖なら放す位置に関係なく何もしない
// {* ▲mCN=1410_MGATE_HIT // end [cGJF=h] *}
// {* ▼mCN=1420_MGATE_SEATS // mGATE の4つの席 / ドラッグ / 吸い付き / クリックの見張り dockOutFast (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // ★v5.1.532(俊克 11.06 am09:42「メニューバーの左端と右端にも移動できるようにしよう。Picture-in-picture のようにね…左右の端、自分のメニューバーの真下(現状)、画面の中央、この4種類」/ am09:47「ウィンドウを左上目一杯広げて使っていることを想定して、ウィンドウ左上の3つのボタンを避ける位置まで」):
  //   席は4つ= tag(札の真下・従来) / left / center / right。↖の地を横へドラッグし、放すと近い席へ吸い付く。高さはメニューバーの真下のまま。tag 以外の席は出しっぱなし(閉じるのはロゴの Shift クリック)
  const DO_RIGHT_SAFE = 376;   // ★v5.1.579(俊克 pm08:37 改良1「mGATEを右端に移動すると、いろんな通知が被るので、それを避ける位置に」): macOS の通知(幅344+余白)を避ける
  const DO_LEFT_SAFE = 84;   // 左端の席= 画面の左から窓の3つのボタンの分だけ空ける
  const dockOutSeat = () => { if (dockOut.seat) return dockOut.seat; let t = ''; try { const n = $.NSString.stringWithContentsOfFileEncodingError($(dir + '/dockout-seat'), $.NSUTF8StringEncoding, null); if (n && !n.isNil()) t = ObjC.unwrap(n).trim(); } catch (e) {} dockOut.seat = /^(left|center|right)$/.test(t) ? t : 'tag'; return dockOut.seat; };
  const dockOutSeatX = (seat, w) => { const b = item.button, bw = b.window, r = bw.convertRectToScreen(b.convertRectToView(b.bounds, $())), sc = bw.screen, sf = sc.visibleFrame, lo = sf.origin.x + 4, hi = sf.origin.x + sf.size.width - w - 4; const cl = (x) => Math.max(lo, Math.min(x, hi));
    if (seat === 'left') return cl(sf.origin.x + DO_LEFT_SAFE); if (seat === 'right') return cl(hi - DO_RIGHT_SAFE); if (seat === 'center') return cl(sc.frame.origin.x + (sc.frame.size.width - w) / 2);
    return cl(r.origin.x + r.size.width - Math.max(0, (r.size.width - pieceImgW) / 2) - w); };
  const dockOutDragMove = () => { const g = dockOut.drag, f = dockOut.win.frame, sf = item.button.window.screen.visibleFrame, dx = $.NSEvent.mouseLocation.x - g.mx; if (Math.abs(dx) > 3) g.moved = true; if (!g.moved) return; dockOut.win.setFrameOrigin($.NSMakePoint(Math.max(sf.origin.x + 4, Math.min(g.ox + dx, sf.origin.x + sf.size.width - f.size.width - 4)), f.origin.y)); };
  const dockOutDragEnd = () => { const g = dockOut.drag; dockOut.drag = null; if (!g.moved) return; const f = dockOut.win.frame; let best = 'tag', bd = Infinity; for (const k of ['tag', 'left', 'center', 'right']) { const d = Math.abs(dockOutSeatX(k, f.size.width) - f.origin.x); if (d < bd) { bd = d; best = k; } }
    dockOut.seat = best; try { $(best).writeToFileAtomicallyEncodingError(dir + '/dockout-seat', true, $.NSUTF8StringEncoding, null); } catch (e) {} hlog('[dockOut] 席= ' + best); dockOut.glide = { from: f.origin.x, to: dockOutSeatX(best, f.size.width), at: Date.now() }; };
  const dockOutGlideStep = () => { const g = dockOut.glide, t = Math.min(1, (Date.now() - g.at) / 160), e = 1 - (1 - t) * (1 - t), f = dockOut.win.frame; dockOut.win.setFrameOrigin($.NSMakePoint(g.from + (g.to - g.from) * e, f.origin.y)); if (t >= 1) dockOut.glide = null; };
  // ★v5.1.684(俊克 11.13 am08:16「自動更新が走って立ち上がった時に、ver表示も点滅するということだけで良い」): 版が変わってから最初に mGATE が出た時、変わった所を橙で点滅(v5.1.686から 15pt を右下に被せる・3回)。
  // ★v5.1.685(俊克 am09:06「seen を別枠で作らなくても meos-version を見ればいい・none なら 5. を除いた部分を点滅」): 合図は meos-version の2行目(拡張が版を書き換えた時に前の版を添える)。
  //   前の版と頭から比べて違う字から後ろ / none(初めて・v5.0 から)は最初の . の後ろ(5. を除く)。点滅を始めたら2行目を消す= 1つの版につき1回
  const dockOutVerBlink = () => { const now = Date.now();
    if (!dockOut.vb && now - (dockOut.vAt || 0) > 2000) { dockOut.vAt = now; try { const vf = dir + '/meos-version', raw = String(ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(vf, $.NSUTF8StringEncoding, null)) || ''), ls = raw.split('\n'), cur = String(ls[0] || '').trim(), prev = String(ls[1] || '').trim();
        if (cur && prev) { $(cur).writeToFileAtomicallyEncodingError(vf, true, $.NSUTF8StringEncoding, null); const v = 'v' + cur; let i;
          if (prev === 'none') i = v.indexOf('.') + 1; else { const p = 'v' + prev; i = 0; while (i < v.length && v[i] === p[i]) i++; }
          if (i > 0 && i < v.length) { dockOut.vb = { from: i, t0: now, ph: -1 }; hlog('[dockOut] 版が変わった ' + prev + '→' + cur + ' 点滅'); } } } catch (e) {} }
    // v5.1.686(俊克 am09:11「拡大0.5秒→元に0.2秒を3回・2回目3回目はもう少し素早く・減り張り」): 大 500 / 元 200 / 大 350 / 元 150 / 大 250 で終わり(偶数の相が大)
    const vb = dockOut.vb; if (!vb) return; const DUR = [1000, 200, 350, 150, 250];   /* v5.1.687(俊克 am09:24「最初を1秒にしよう」) */ let el = now - vb.t0, ph = 0; while (ph < DUR.length && el >= DUR[ph]) { el -= DUR[ph]; ph++; } if (ph === vb.ph) return; if (ph >= DUR.length) dockOut.vb = null; else vb.ph = ph; dockOutPaint(); };
  const dockOutFast = () => { if (!dockOut.shown) return; try { dockOutVerBlink(); } catch (e) {} dockOutDrain(); const dn = dockOutCnt(1), up = dockOutCnt(2); dockOutTipStep(); dockOutXStep();
    if (dn !== dockOut.dnN) { dockOut.dnN = dn; dockOut.downT = Date.now(); dockOut.downAt = dockOutHandAt(); if (dockOut.downAt === -1 && dockOutOnGrip()) { dockOut.glide = null; if (!dockOut.pin) dockOut.pin = 'seat'; dockOut.drag = { mx: $.NSEvent.mouseLocation.x, ox: dockOut.win.frame.origin.x, moved: false }; } }
    if (dockOut.drag) { dockOutDragMove(); if (up !== dockOut.upN) { dockOut.upN = up; dockOutDragEnd(); } return; } if (dockOut.glide) dockOutGlideStep();
    if (up !== dockOut.upN) { dockOut.upN = up; const d = dockOut.downAt; dockOut.downAt = -1; if (d === -1) return; if (!dockOutPressMine(dockOut.ever, dockOut.gotAt || 0, dockOut.downT || 0)) { hlog('[dockOut] 窓に届いていない押し(手前は別のアプリ)→ 受けない'); return; } let i = dockOutHandAt(); if (i === -1) i = d; if (i >= 0) { try { dockOutFire(i); } catch (e) { hlog('[dockOut] 例外 ' + e); } } else { let sh = false; try { sh = (Number($.NSEvent.modifierFlags) & 0x20000) !== 0; } catch (e) {} let cm = false; try { cm = (Number($.NSEvent.modifierFlags) & 0x100000) !== 0; } catch (e) {}   // v5.1.447: ⌘クリック= 終了
      if (cm) { hlog('[dockOut] ロゴを ⌘ クリック→ エディターを終える(mGATE はそのまま)'); edQuit(); } else if (sh) { hlog('[dockOut] ロゴを Shift クリック→ 閉じる'); dockOutHide(); } else { hlog('[dockOut] ロゴを押した→ エディターを前へ/起こす'); edLaunch(); } } } };   // v5.1.446: メニューバーの地を押しても消さない
// {* ▲mCN=1420_MGATE_SEATS // end [cGJF=h] *}
// {* ▼mCN=1430_MGATE_WINDOW // mGATE の窓を作る・描く・出す・閉じる・Shift クリック / dockOutTick / 札のロゴの Cmd (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  ObjC.registerSubclass({ name: 'MeOSDockOutT', methods: { 'fast:': { types: ['void', ['id']], implementation: function (t) { try { dockOutFast(); } catch (e) {} } } } });
  const dockOutTgt = $.MeOSDockOutT.alloc.init;
  // ★v5.1.472(俊克 am03:23 バグ1「メニューバーの小さいmGATEロゴだけ、cmdクリックの終了が動作しない」): 実測= Cmd を押して札を押すと macOS は札を動かす操作にし、メニューが開かない(menuWillOpen に来ない)。
  //   → 押した数(CGEventSourceCounter)を見張り、増えた時に Cmd が押されていて当たりが札のロゴなら終える(Barman の有無に関係なく常に・Cmd が無ければ数を控えるだけ)
  const logoCmd = { dn: dockOutCnt(1) };
  ObjC.registerSubclass({ name: 'MeOSLogoCmdT', methods: { 'tick:': { types: ['void', ['id']], implementation: function (t) { try { const dn = dockOutCnt(1); if (dn === logoCmd.dn) return; logoCmd.dn = dn;
    if ((Number($.NSEvent.modifierFlags) & 0x100000) === 0) return; if (pieceHit() !== '\u0000logo') return; hlog('[menu] 札のロゴを Cmd クリック→ エディターを終える'); edQuit(); } catch (e) {} } } } });
  try { logoCmd.tg = $.MeOSLogoCmdT.alloc.init; logoCmd.t = $.NSTimer.timerWithTimeIntervalTargetSelectorUserInfoRepeats(0.03, logoCmd.tg, 'tick:', $(), true); $.NSRunLoop.currentRunLoop.addTimerForMode(logoCmd.t, $.NSRunLoopCommonModes); } catch (e) {}
  const dockOutBuild = () => { if (dockOut.win) return dockOut.win; const n = 8, W = DO_X0 + DO_PAD + n * DO_TW + (n - 1) * DO_GAP, H = DO_TH + DO_PAD * 2, rc = $.NSMakeRect(0, 0, W, H);
    const w = $.NSPanel.alloc.initWithContentRectStyleMaskBackingDefer(rc, 128, 2, false);   // 128= 前に出ない窓(枠なし)
    w.level = 101; w.opaque = false; w.backgroundColor = $.NSColor.clearColor; w.hasShadow = true; w.hidesOnDeactivate = false; w.becomesKeyOnlyIfNeeded = true; w.floatingPanel = true; w.collectionBehavior = 1 | 16 | 256;
    const ve = $.NSVisualEffectView.alloc.initWithFrame(rc); ve.material = 5; ve.state = 1; ve.blendingMode = 0; ve.wantsLayer = true; ve.layer.cornerRadius = 10; ve.layer.masksToBounds = true; ve.autoresizingMask = 18; w.contentView = ve;
    dockOut.lg = $.NSImageView.alloc.initWithFrame($.NSMakeRect(DO_LX, (H - DO_LG) / 2, DO_LG, DO_LG)); dockOut.lg.imageScaling = 3; ve.addSubview(dockOut.lg);   // v5.1.415: ロゴ
    dockOut.ivs = []; for (let i = 0; i < n; i++) { const iv = $.NSImageView.alloc.initWithFrame($.NSMakeRect(DO_X0 + i * (DO_TW + DO_GAP), DO_PAD, DO_TW, DO_TH)); iv.imageScaling = 2; ve.addSubview(iv); dockOut.ivs.push(iv); }
    // ★v5.1.674(俊克 11.12 pm09:53「mGATEの♥️の下にもMeOSのバージョンを表示しよう。MeOSが閉じているときでも分るように。できるだけ間を詰めてコンパクトに」): ♥の下の余白(DO_PAD)に 7pt の字。/ v5.1.675(俊克 pm10:00 改良1「もう少し大きな字でも良いから、間を詰めよう。もう少し上に」): 9pt・他のタイルの点の段(下から4〜15)へ上げる・右の角の丸みを避けて3pt左へ。版は拡張が dir/meos-version に書く
    try { const vl = $.NSTextField.labelWithString($('')); vl.font = $.NSFont.monospacedDigitSystemFontOfSizeWeight(9, 0.23); vl.textColor = $.NSColor.secondaryLabelColor; vl.alignment = 2; vl.frame = $.NSMakeRect(0, 2, 40, 15); ve.addSubview(vl); dockOut.ver = vl; const vz = $.NSTextField.labelWithString($('')); vz.alignment = 2; vz.hidden = true; vz.frame = $.NSMakeRect(0, 1, 20, 19); ve.addSubview(vz); dockOut.verZ = vz; } catch (e) {}   // v5.1.686: 点滅の大きい字(右下を起点に被せる)
    dockOut.win = w; return w; };
  // ★v5.1.676(俊克 pm10:06 改良1「大きさはこれで良いので、間を詰めよう。特に、ドットの両脇をギリギリまで」): 数字をふつうの幅(等幅をやめる)に・字の間 -0.2・. の両脇 -1.2(台で4通り描いて選んだ)= 幅 41→32pt で♥の真下に収まる
  const dockOutVerAttr = (t, hi) => { if (hi == null) hi = -1; const m = $.NSMutableAttributedString.alloc.init; m.mutableString.setString($(t)); if (!t) return m; const R = $.NSMakeRange(0, t.length);
    m.addAttributeValueRange($.NSFontAttributeName, $.NSFont.systemFontOfSizeWeight(10, 0.23), R); m.addAttributeValueRange($.NSForegroundColorAttributeName, $.NSColor.secondaryLabelColor, R);
    { const mm = /^v(\d+)\.(\d+)\./.exec(t), red = $.NSColor.colorWithSRGBRedGreenBlueAlpha(1, 0.3, 0.26, 1); if (mm) { const big = $.NSFont.systemFontOfSizeWeight(12, 0.23); for (const r of [$.NSMakeRange(1, mm[1].length), $.NSMakeRange(2 + mm[1].length, mm[2].length)]) { m.addAttributeValueRange($.NSForegroundColorAttributeName, red, r); m.addAttributeValueRange($.NSFontAttributeName, big, r); } } for (let i = 0; i < t.length; i++) if (t[i] === '.') m.addAttributeValueRange($.NSForegroundColorAttributeName, $.NSColor.blackColor, $.NSMakeRange(i, 1)); }   // ★v5.1.677(俊克 pm10:13 改良1「10ptにして、5と1の色を変えよう」): 10pt・版の大きい2つ(5 と 1)をメニューバーの秒と同じ赤に / pm10:19「ドットを黒にしよう」: . は黒 / v5.1.678(pm10:21「5と1を12ptにしよう。間を1pt広げよう」): 5 と 1 は 12pt・. の両脇を -1.2→-0.2
    if (hi >= 0 && hi < t.length) m.addAttributeValueRange($.NSForegroundColorAttributeName, $.NSColor.clearColor, $.NSMakeRange(hi, t.length - hi));   // v5.1.686: 点滅の大きい相= 変わった所から後ろは透明(幅は残す)・上に大きい字(verZ)を被せる
    for (let i = 0; i < t.length; i++) m.addAttributeValueRange($.NSKernAttributeName, $((t[i] === '.' || t[i + 1] === '.') ? -0.2 : -0.2), $.NSMakeRange(i, 1)); return m; };
  const dockOutVer = () => { try { const t = ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(dir + '/meos-version', $.NSUTF8StringEncoding, null)); return t ? 'v' + String(t).split('\n')[0].trim() : ''; } catch (e) { return ''; } };   // v5.1.674 / v5.1.685: 1行目だけが今の版(2行目は前の版= 点滅の合図)
  // v5.1.416(俊克「44ピクセルにすると、ロゴの絵が汚くなる」): 54px の札用を44ptへ引き伸ばしていた→ ver2 の原寸から作った 176px(mgate-big.png)
  // v5.1.674: dockOutPaint で♥の真下に版(dockOut.ver)を置く
  const dockOutPaint = () => { try { if (!dockOut.win) return; try { if (!dockOut.big) { const d = String(cycRevPath()).replace(/[^\/]*$/, ''), b = $.NSImage.alloc.initWithContentsOfFile($(d + 'mgate-big.png')); if (b && !b.isNil()) dockOut.big = b; } const gi = gateLoad(), im = dockOut.big || (gi && (gateDark() ? gi.d : gi.l)); if (im && dockOut.lg) dockOut.lg.image = im; } catch (e) {} const o = doOrd(); for (let i = 0; i < dockOut.ivs.length; i++) { const ch = o.charAt(i); dockOut.ivs[i].image = ch ? dockOutTile(ch) : $(); } try { if (dockOut.ver) { const k = o.indexOf(FOF), cx = DO_X0 + k * (DO_TW + DO_GAP) + DO_TW / 2; const vb = dockOut.vb, as = dockOutVerAttr(k >= 0 ? dockOutVer() : '', vb && vb.ph >= 0 && vb.ph % 2 === 0 ? vb.from : -1), vw = Math.ceil(Number(as.size.width)) + 4; dockOut.ver.attributedStringValue = as; const vx = Math.round(Math.min(cx - vw / 2, cx + DO_TW / 2 + 4 - vw)) + 2; dockOut.ver.frame = $.NSMakeRect(vx, 2, vw, 15); if (dockOut.verZ) { const big = vb && vb.ph >= 0 && vb.ph % 2 === 0, vt = big ? dockOutVer() : ''; if (big && vt) { const z = $.NSMutableAttributedString.alloc.init, zs = vt.slice(vb.from); z.mutableString.setString($(zs)); const zr = $.NSMakeRange(0, zs.length); z.addAttributeValueRange($.NSFontAttributeName, $.NSFont.systemFontOfSizeWeight(15, 0.5), zr); z.addAttributeValueRange($.NSForegroundColorAttributeName, $.NSColor.colorWithSRGBRedGreenBlueAlpha(1, 0.62, 0.04, 1), zr); z.addAttributeValueRange($.NSKernAttributeName, $(-0.2), zr); const bw = Math.ceil(Number(z.size.width)) + 4; dockOut.verZ.attributedStringValue = z; dockOut.verZ.frame = $.NSMakeRect(vx + vw - bw, 1, bw, 19); dockOut.verZ.hidden = false; } else dockOut.verZ.hidden = true; }   /* v5.1.686(俊克 am09:11 改良1「橙は5.1より一廻り大きく・右下角を起点に拡大・被っても構わない」): 15pt の橙を、版の右下に揃えて被せる */   /* v5.1.678: 右端は♥の右+4まで(右下の角の丸み) / v5.1.679(俊克 pm10:34「右方向に2pt寄せよう」): +2 */ } } catch (e) {} try { const f = dockOut.win.frame, w = doW(o.length); if (Math.abs(f.size.width - w) > 0.5) { const r = f.origin.x + f.size.width; dockOut.win.setFrameDisplay($.NSMakeRect(dockOut.shown ? (dockOutSeat() === 'tag' ? r - w : dockOutSeatX(dockOutSeat(), w)) : f.origin.x, f.origin.y, w, f.size.height), true); } } catch (e) {} } catch (e) {} };   // 右端(ピースの側)は動かさず幅だけ
  const dockOutToggle = (why) => { try { if (dockOut.shown) { hlog('[dockOut] ' + why + '→ 閉じる'); dockOutHide(); } else if (pzl.ch && String(pzl.ord || '').length === 7) { dockOutShow(); dockOut.pin = 'arm'; hlog('[dockOut] ' + why + '→ 出す(出しっぱなし)'); } } catch (e) {} };   // v5.1.468: Shift クリック= Barman のオン/オフ
  // ★v5.1.537(俊克 11.06 pm03:05 改良2「Me Dockのパズルと同様に､メニューバーにぶら下がっている方のパズルもtipを出そうよ」): 札の上に指が乗ったら tip= 中身は印の // の後ろ(Me Dock と同じ物)・Ⓣは Today。
  //   色は Me Dock の .toc-tooltip と同じ(地が文字色寄り)。小窓は押せない
  // ★v5.1.538(俊克 11.06 pm03:14 改良1「tipの位置がポインターに追従せずに高さが固定になっているのはなぜ? 被って読み難い」): 537 は札に入った瞬間に1度置くだけで、札の中で動いても付いてこなかった。さらに「ポインターの12下」は手が 24×26 の時の数で、俊克の OS はポインターを2.02倍にしている→ 手が字に被った。
  //   → 動いたら付いてくる(0.02秒ごと)・寸法は OS のポインターの倍率を掛ける。手は右下へ伸びるので tip は左へ伸ばす= 右端 x+8倍・上端 y+13倍(袖が右上角に少し被るだけ・project_tip_at_the_pointer)。左に入らなければ右へ伸ばし、手の下(y+20倍)へ
  const doTip = { win: null, bg: null, tf: null, ch: '', t: '', w: 0, h: 0, x: 0, y: 0, s: 1 };
  const doCurS = () => { try { const d = $.NSUserDefaults.standardUserDefaults.persistentDomainForName($('com.apple.universalaccess')), v = d.objectForKey($('mouseDriverCursorSize')), n = Number(v.doubleValue); return n >= 1 ? n : 1; } catch (e) { return 1; } };
  const dockOutTipPlace = () => { const p = $.NSEvent.mouseLocation; if (p.x === doTip.x && p.y === doTip.y) return; doTip.x = p.x; doTip.y = p.y; const sf = dockOut.win.screen.visibleFrame, S = doTip.s, L = sf.origin.x + 4, R = sf.origin.x + sf.size.width - 4; let x = p.x + 8 * S - doTip.w, top = p.y - 13 * S; if (x < L) { x = Math.max(L, Math.min(p.x, R - doTip.w)); top = p.y - 20 * S; } else x = Math.min(x, R - doTip.w); doTip.win.setFrameOrigin($.NSMakePoint(x, top - doTip.h)); };
  const dockOutTipBuild = () => { if (doTip.win) return; const rc = $.NSMakeRect(0, 0, 80, 22), w = $.NSPanel.alloc.initWithContentRectStyleMaskBackingDefer(rc, 128, 2, false);
    w.level = 102; w.opaque = false; w.backgroundColor = $.NSColor.clearColor; w.hasShadow = true; w.ignoresMouseEvents = true; w.hidesOnDeactivate = false; w.collectionBehavior = 1 | 16 | 256;
    const bg = $.NSBox.alloc.initWithFrame(rc); bg.boxType = 4; bg.titlePosition = 0; bg.borderWidth = 0; bg.cornerRadius = 3; bg.contentViewMargins = $.NSMakeSize(0, 0); bg.autoresizingMask = 18; w.contentView = bg; doTip.bg = bg;   // 色は NSBox で塗る(JXA で layer.backgroundColor へ CGColor を入れると osascript ごと落ちる・実測)
    const tf = $.NSTextField.wrappingLabelWithString($('')); tf.font = $.NSFont.systemFontOfSize(12); tf.frame = $.NSMakeRect(7, 4, 66, 14); tf.autoresizingMask = 18; bg.contentView.addSubview(tf); doTip.win = w; doTip.tf = tf; };
  const dockOutTipHide = () => { doTip.ch = ''; doTip.t = ''; try { if (doTip.win) doTip.win.orderOut($()); } catch (e) {} };
  const dockOutTipShow = (t) => { dockOutTipBuild(); const dk = gateDark(), tf = doTip.tf; tf.stringValue = $(t); tf.textColor = dk ? $.NSColor.blackColor : $.NSColor.whiteColor; doTip.bg.fillColor = dk ? $.NSColor.colorWithWhiteAlpha(0.84, 1) : $.NSColor.colorWithWhiteAlpha(0.27, 1);
    const sz = tf.cell.cellSizeForBounds($.NSMakeRect(0, 0, 320, 2000)); doTip.w = Math.ceil(sz.width) + 16; doTip.h = Math.ceil(sz.height) + 8; doTip.s = doCurS(); doTip.x = doTip.y = NaN; const f0 = doTip.win.frame; doTip.win.setFrameDisplay($.NSMakeRect(f0.origin.x, f0.origin.y, doTip.w, doTip.h), true); dockOutTipPlace(); doTip.win.orderFrontRegardless; };
  const dockOutTipStep = () => { try { const i = !dockOut.drag && !dockOut.glide && dockOutFront() && dockOutOnTile() ? dockOutAt() : -1, ch = i >= 0 ? doOrd().charAt(i) : '', t = !ch ? '' : ch === 'T' ? 'Today' : String(dockOut.tips[ch === FOF ? 'f' : ch] || ''); if (ch === doTip.ch && t === doTip.t) { if (t) dockOutTipPlace(); return; } if (!t) { dockOutTipHide(); doTip.ch = ch; return; } doTip.ch = ch; doTip.t = t; dockOutTipShow(t); } catch (e) { hlog('[dockOut] tip 例外 ' + e); } };
  // ★v5.1.547(俊克 11.06 pm07:28 バグ1「mGATEの♥の上でcmdを押しても黄色い×が出ない」): Me Dock の×は webview の中の絵なので mGATE には無かった→ 札の上で効くキーの間、同じ×(Cmd=黄・Opt=緑)をポインターの先に小窓で出す。Ⓣには効かないので無印
  const doX = { win: null, iv: null, k: '', img: {} };
  const dockOutXImg = (k) => { if (doX.img[k]) return doX.img[k]; const im = $.NSImage.alloc.initWithSize($.NSMakeSize(20, 20)); im.lockFocus;
    const tf = $.NSAffineTransform.transform; tf.translateXByYBy(10, 10); tf.rotateByDegrees(45); tf.concat;
    const e = k === 'c' ? 1 : 0.5, col = k === 'c' ? $.NSColor.colorWithSRGBRedGreenBlueAlpha(1, 0.824, 0.122, 1) : $.NSColor.colorWithSRGBRedGreenBlueAlpha(0.094, 0.788, 0.29, 1);
    const rr = (x, y, w, h, c) => { c.set; $.NSBezierPath.bezierPathWithRoundedRectXRadiusYRadius($.NSMakeRect(x, y, w, h), 1, 1).fill; };
    rr(-1.25 - e, -7 - e, 2.5 + 2 * e, 14 + 2 * e, $.NSColor.blackColor); rr(-7 - e, -1.25 - e, 14 + 2 * e, 2.5 + 2 * e, $.NSColor.blackColor); rr(-1.25, -7, 2.5, 14, col); rr(-7, -1.25, 14, 2.5, col);
    im.unlockFocus; doX.img[k] = im; return im; };
  const dockOutXBuild = () => { if (doX.win) return; const rc = $.NSMakeRect(0, 0, 20, 20), w = $.NSPanel.alloc.initWithContentRectStyleMaskBackingDefer(rc, 128, 2, false); w.setOpaque(false); w.backgroundColor = $.NSColor.clearColor; w.hasShadow = false; w.ignoresMouseEvents = true; w.level = 103; try { w.collectionBehavior = 1 | 16 | 256; } catch (e) {} const iv = $.NSImageView.alloc.initWithFrame(rc); w.contentView = iv; doX.win = w; doX.iv = iv; };
  const dockOutXHide = () => { doX.k = ''; try { if (doX.win) doX.win.orderOut($()); } catch (e) {} };
  // ★v5.1.548(俊克 pm07:56 バグ1「MW-GATEロゴはCmdクリックで終了なので、ここも黄色×を。メニューバーの小さいロゴでも」): 2つのロゴも Cmd だけ黄。札のロゴは mGATE が閉じている間も見るので modsTick(0.1秒)からも呼ぶ
  const dockOutXStep = () => { try { const f = Number($.NSEvent.modifierFlags) || 0, cm = (f & 0x100000) !== 0, op = (f & 0x80000) !== 0; let k = '';
    if (cm || op) { const on = dockOut.shown && !dockOut.drag && !dockOut.glide && dockOutFront(), i = on && dockOutOnTile() ? dockOutAt() : -1, ch = i >= 0 ? doOrd().charAt(i) : ''; if (ch && ch !== 'T') k = cm ? 'c' : 'o'; else if (cm && !ch && ((on && dockOutOnLogo()) || pieceHit() === '\u0000logo')) k = 'c'; }
    if (!k) { if (doX.k) dockOutXHide(); return; } dockOutXBuild(); if (k !== doX.k) { doX.k = k; doX.iv.image = dockOutXImg(k); doX.win.orderFrontRegardless; } const p = $.NSEvent.mouseLocation; doX.win.setFrameOrigin($.NSMakePoint(p.x - 10, p.y - 10)); } catch (e) { hlog('[dockOut] × 例外 ' + e); } };
  const dockOutHide = () => { dockOutTipHide(); dockOutXHide(); try { if (dockOut.shown && dockOut.win) dockOut.win.orderOut($()); } catch (e) {} try { if (dockOut.ft) { dockOut.ft.invalidate; dockOut.ft = null; } } catch (e) {} dockOut.shown = false; dockOut.pin = false; dockOut.leaveAt = 0; dockOut.downAt = -1; dockOut.drag = null; dockOut.glide = null; };
  const dockOutShow = () => { try { const b = item.button, bw = b.window; if (!bw || bw.isNil()) return; const r = bw.convertRectToScreen(b.convertRectToView(b.bounds, $()));
    const w = dockOutBuild(); try { w.setContentSize($.NSMakeSize(doW(doOrd().length), DO_TH + DO_PAD * 2)); } catch (e) {} const f = w.frame, seat = dockOutSeat(); if (seat !== 'tag' && !dockOut.pin) dockOut.pin = 'seat';
    let x = r.origin.x; try { x = dockOutSeatX(seat, f.size.width); } catch (e) {}
    w.setFrameOrigin($.NSMakePoint(x, r.origin.y - f.size.height - 2)); dockOutPaint(); w.orderFrontRegardless; if (!dockOut.ft) { dockOut.dnN = dockOutCnt(1); dockOut.upN = dockOutCnt(2); dockOut.downAt = -1; dockOut.ft = $.NSTimer.timerWithTimeIntervalTargetSelectorUserInfoRepeats(0.02, dockOutTgt, 'fast:', $(), true); $.NSRunLoop.currentRunLoop.addTimerForMode(dockOut.ft, $.NSRunLoopCommonModes); } if (!dockOut.shown) hlog('[dockOut] 開いた'); dockOut.shown = true; dockOut.leaveAt = 0; } catch (e) { hlog('[dockOut] 開けない ' + e); } };
  const dockOutTick = () => { if (!pzl.ch || String(pzl.ord || '').length !== 7) { dockOutHide(); return; } let tr = false; try { tr = tracking(); } catch (e) {} if (tr && !dockOut.pin && Date.now() - pieceClickAt > 600) { if (dockOut.shown) hlog('[dockOut] メニューが開いている→ 消す'); dockOutHide(); return; }   // v5.1.438: ピースを押した直後の一瞬の「メニューが開いた」では閉じない
    const _ph = pieceHit(), onPiece = typeof _ph === 'string' && !!_ph && _ph.charAt(0) !== '\u0000'; let onWin = false;   // v5.1.437: 終了ボタンの上では出さない
    if (dockOut.shown && dockOut.win) { try { const f = dockOut.win.frame, p = $.NSEvent.mouseLocation; onWin = p.x >= f.origin.x && p.x <= f.origin.x + f.size.width && p.y >= f.origin.y && p.y <= f.origin.y + f.size.height + 4; } catch (e) {} }
    if (onPiece) { if (!dockOut.shown) dockOutShow(); dockOut.leaveAt = 0; return; }
    if (!dockOut.shown) return; if (onWin || dockOut.pin) { dockOut.leaveAt = 0; return; }
    const now = Date.now(); if (!dockOut.leaveAt) dockOut.leaveAt = now; else if (now - dockOut.leaveAt > 500) { hlog('[dockOut] 離れて0.5秒→ 消す'); dockOutHide(); } };
// {* ▲mCN=1430_MGATE_WINDOW // end [cGJF=h] *}
// {* ▼mCN=1500_SHOW // 札を描く show() (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  function show(text, menu, anchor) {
    // ★v5.1.552(俊克 11.07 am09:55「昨夜確認した時に、そう出てないとおかしい」): 🌅の時計の行は本文の⏰の残り= macOS の予定を見ていない。am03:39 に予定が消えた後も「🌅 Wake (chaining)」と出続け、一番下の「Wake off」は🌅の行が居ると隠していた= 嘘の表示。
    //   → 札とメニューの🌅は pmset の答えに従う= macOS に予定が無ければ ⚠️ Wake off(読み直しは5秒ごと= ▶️の直後の待ちを短く)
    try { const isSun = (s) => /^(?:\u2b50\ufe0f )?\ud83c\udf05 /.test(s || '');
      if (wakeSeen && !wake && ((text && isSun(text)) || (menu || []).some(e => e && !e.sep && isSun(e.title)))) {
        if (!wakeRead && Date.now() - wakeReadAt > 5000) readWake();
        if (text && isSun(text)) text = text.replace(/^(\ud83c\udf05) \S+ Wake/, '$1 \u26a0\ufe0f Wake off');
        menu = (menu || []).map(e => (e && !e.sep && isSun(e.title)) ? Object.assign({}, e, { title: e.title.replace(/\ud83c\udf05 .*$/, '\ud83c\udf05 \u26a0\ufe0f Wake off   not set on this Mac') }) : e); } } catch (e) {}
    const idle = !text;
    // v5.0.0-47: 🌅 Wake を「アプリの起動/終了」の段の上へ(拡張が居る時の並びにも、居ない時の並びにも同じ所へ)
    try { menu = (menu || []).slice(); if (menu.some(e => e && !e.sep && /^(?:\u2b50\ufe0f )?\ud83c\udf05 /.test(e.title || ''))) throw 0;   /* v5.1.503(俊克「一番下にも重複して表示されて紛らわしい」): 真因= v5.1.479 の⭐️が頭に付くと🌅の時計と読めなかった */   // v5.0.0-62: 🌅 の時計が一覧に居れば、別の行は出さない
      let qi = menu.findIndex(e => e && (e.id === 'quitapp' || e.id === 'h:open')); if (qi < 0) qi = menu.length; else if (qi > 0 && menu[qi - 1] && menu[qi - 1].sep) qi--; menu.splice(qi, 0, ...(qi > 0 ? [{ sep: true }] : []), ...wakeEntries().slice(0, 1)); } catch (e) {}
    if (idle) text = '\u23f0';
    if (armOn) text = '\ud83e\udde9 ' + text;   // ★v5.1.398(俊克 11.02 am09:12 改良2「Me Dockを呪文で消してあっても、shift長押しのあとのccなどのワープができる…このときに、メニューバーにパズルのピースを表示すると分かりやすい」): 拡張が arm を置いている間(Me Dock が見えない時の構え)だけ札の頭に🧩
    item.visible = true;
    const mj = JSON.stringify(menu || []);
    // ★v5.1.328(俊克 10.30 am11:06 バグ1「メニューバーが開いて直ぐ閉じる・今もまだ」): 実測(sample)= 本体の時間の55%が「メニューを丸ごと作り直して item.menu を差し替える」に使われていた。
    //   ⏰の秒が変わるたびに JSON が変わり、閉じている間は毎回作り直していた。macOS 27 の札は別の係(MenuBarAgent)が開くので、開きかけた所で差し替えると開きかけのメニューが捨てられて閉じる。
    //   v5.1.327 の TAG の▲▼で作り直しが重くなり、重なる率が上がった。→ 並び(区切り・id・群の中身・TAG の並び)が同じなら、開いていても閉じていても字だけ差し替える。並びが変わった時だけ、閉じている間に作り直す
    const nw = menu || [], sk = (a) => a.map(e => e.sep ? '-' + (e.fz ? 'z' : '') + (e.cz ? 'c' : '') + (e.dd ? 'd' + e.dd : '') + (e.far ? 'f' : '') : e.clockAll ? 'CA' + (e.star ? '*' : '') : e.fusenAll ? 'FA' + (e.star ? '*' : '') : e.tagAll ? 'TA' + (e.star ? '*' : '') : e.fusen ? 'F' + JSON.stringify([e.fusen, e.color, e.star, e.items]) : e.tagPager ? 'T' + JSON.stringify(e.rows) : e.dayRow ? 'D' + JSON.stringify(e.dayRow) : ((e.id || '') + (e.sub ? '>' + JSON.stringify(e.sub) : '') + (e.check ? '\u2713' : '') + (e.off ? '~' : '') + (e.indent || '') + (e.clk ? '\u23f0' : '') + (e.far ? 'f' : ''))).join('|');
    if (noViews() !== lastNoViews) { lastMenu = null; lastEntries = []; hlog('[menu] noviews=' + noViews()); }
    if (freshMenu && !tracking()) { freshMenu = false; lastMenu = null; lastEntries = []; }   // v5.1.332: 閉じた後は新しいメニューに差し替える
    if (renewItem && !tracking()) { renewItem = false;   // ★v5.1.335(俊克 pm00:30「札が一瞬消えて出るのは見えたが改善しない・手で🛟をオフオンすると復旧・0.5〜1秒完全に消えてから」):
      //   実測= 札を作り直して自分で開いても(指は使っていない)約0.045秒で閉じた= 壊れているのは札でなく V-helper のプロセス。→ 札を外して0.8秒置き、エラーで終わる
      //   = launchd(KeepAlive: SuccessfulExit=false)がすぐ起こし直す。新しい V-helper はメニューを開き直す(reopen-menu)。鳴らした覚えは引き継ぐ(fired-carry)
      try { hlog('[menu] V-helper を起こし直す(0.8秒消えてから)'); } catch (e) {}
      try { $(JSON.stringify({ t: Date.now() })).writeToFileAtomicallyEncodingError(dir + '/reopen-menu', true, $.NSUTF8StringEncoding, null); } catch (e) {}
      try { $(JSON.stringify({ t: Date.now(), fired: fired, preDone: preDone })).writeToFileAtomicallyEncodingError(dir + '/fired-carry.json', true, $.NSUTF8StringEncoding, null); } catch (e) {}
      try { bar.removeStatusItem(item); } catch (e) {}
      try { $.NSRunLoop.currentRunLoop.runUntilDate($.NSDate.dateWithTimeIntervalSinceNow(0.8)); } catch (e) {}
      $.exit(3);
    }
    let reopenNow = false; if (reopenAt && Date.now() >= reopenAt && !tracking()) { reopenAt = 0; reopenNow = true; }   // v5.1.333: 作り直した後で開く   // v5.1.331: スイッチが変わったら作り直す
    if (mj !== lastMenu) {
      if (lastEntries.length && nw.length === lastEntries.length && sk(nw) === sk(lastEntries)) {   // v4.2.499: 並びが同じ= 字だけ差し替える
        for (let i = 0; i < nw.length; i++) { const e = nw[i], o = lastEntries[i], mi = lastItems[i];
          if (!mi || e.sep || e.sub || (e.title === o.title && e.pill === o.pill && e.box === o.box)) continue;
          try { const _s = String(e.title || '').indexOf(STAR) === 0; starRow(mi, e.title, !e.check); styleItem(mi, _s ? Object.assign({}, e, { title: starStrip(e.title) }) : e); } catch (x) {} }
        lastEntries = nw; lastMenu = mj;
      } else if (menuUp && menuShrink(lastEntries, nw, (e) => shrinkKey(e, sk))) {
        const map = menuShrink(lastEntries, nw, (e) => shrinkKey(e, sk)), keep = [], pull = (arr, x) => { const k = arr.indexOf(x); if (k >= 0) arr.splice(k, 1); };
        for (let i = 0; i < lastEntries.length; i++) { const mi = lastItems[i], o = lastEntries[i], k = map[i];
          if (k < 0) { try { if (mi) { mi.hidden = true; pull(clockAll.rows, mi); pull(clockAll.seps, mi); pull(clockAll.far, mi); } } catch (x) {} continue; }
          keep.push(mi); const e = nw[k]; if (!mi || e.sep || e.sub) continue;
          try { if (e.id && e.id !== o.id) mi.representedObject = $(e.id); if (e.title !== o.title || e.pill !== o.pill || e.box !== o.box) { const _s = String(e.title || '').indexOf(STAR) === 0; starRow(mi, e.title, !e.check); styleItem(mi, _s ? Object.assign({}, e, { title: starStrip(e.title) }) : e); } } catch (x) {} }
        lastItems = keep; lastEntries = nw; lastMenu = mj; try { hlog('[menu] 開いたまま行を隠した n=' + nw.length); } catch (e) {}
      } else if (menuUp) { if (lastHoldN !== nw.length) { lastHoldN = nw.length; try { hlog('[menu] 開いている間は作り替えない n=' + nw.length + ' 前=' + lastEntries.length); } catch (e) {} }
      } else if (!tracking()) { lastHoldN = -1; lastMenu = mj; pagers.length = 0; clockAll.hb = null; clockAll.cyc = null; clockAll.nb = null; clockAll.rows.length = 0; clockAll.seps.length = 0; clockAll.far.length = 0; fusenAll.hb = null; fusenAll.seps.length = 0; headSeps.length = 0; tagAll.hb = null; tagAll.rows.length = 0; tagAll.slots.length = 0; tagAll.list = []; tagAll.pi = null; tagAll.hv = []; tagAll.vis = []; try { hlog('[menu] 作り直す n=' + nw.length + ' 前=' + lastEntries.length); } catch (e) {} const mm = build(nw, true); mm.delegate = mdel; item.menu = mm; tagTitle(); }
    }   // v4.2.333: 開いているメニューは作り替えない(札の数字だけ動かす)
    if (reopenNow) { try { $.NSTimer.scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(0.02, reopener, 'go:', $(), false); } catch (e) {} }   // v5.1.333: tick の外で開く(開いている間は tick がまた回るので、中で開かない)
    const pk = pzl.ch + pzl.lv + pzl.prev + (edRunning() ? 'Q' : '');   // v5.1.445: もう一方は見ない
    if (text !== lastText || !!anchor !== lastAnchor || idle !== lastIdle || gateDark() !== lastDark || pk !== lastPk) {
      lastPk = pk;
      lastIdle = idle;
      lastText = text; lastAnchor = !!anchor;
      const t = String(text).length > 40 ? String(text).slice(0, 39) + '…' : String(text);   // ノッチの裏に隠れないよう短く
      const font = $.NSFont.menuBarFontOfSize(11);
      const attrs = $.NSMutableDictionary.alloc.init;
      attrs.setObjectForKey(font, $.NSFontAttributeName);
      attrs.setObjectForKey($.NSColor.whiteColor, $.NSForegroundColorAttributeName);
      const sz = styled(t, font, true).size;
      const H = 18, PX = 7, W = Math.ceil(sz.width) + PX * 2;
      const gi = gateLoad(), GW = gi ? H + 3 : 0; lastDark = gateDark();   // v5.1.367: ロゴの分だけ広げる
      quitShown = edRunning(); ctlItems = ctlBuild(); const QW = ctlItems.length * 19; ctlW = QW;   // v5.1.443   // v5.1.437: 終了ボタン(エディターが動いている時だけ)・v5.1.439: 右端に起動ボタン(いつも)
      const PW = (pzl.ch ? (pzl.prev ? 34 : 17) : 0) + QW;   // v5.1.407: 1つ前が在れば2枚   // v5.1.401: 右端のピースの分(隙間3＋ピース14 ← v5.1.403 15)
      const img = $.NSImage.alloc.initWithSize($.NSMakeSize(W + GW + PW, H));
      pieceImgW = PW ? W + GW + PW : 0;   // v5.1.402
      imgAllW = W + GW + PW; logoW = gi ? H + 1 : 0;   // v5.1.463
      img.lockFocus;
      if (gi) { try { (lastDark ? gi.d : gi.l).drawInRectFromRectOperationFraction($.NSMakeRect(0, 0, H, H), $.NSZeroRect, 2, 1); const tf = $.NSAffineTransform.transform; tf.translateXByYBy(GW, 0); tf.concat; } catch (e) {} }
      (idle ? gray : (anchor ? blue : (myScheme === 'vscode' ? purple : orange))).setFill;
      $.NSBezierPath.bezierPathWithRoundedRectXRadiusYRadius($.NSMakeRect(0, 0, W, H), 5, 5).fill;
      if (!idle) fillSeat(t, font, PX, W, H);   // v5.1.57
      drawStyled(t, font, PX, (H - sz.height) / 2);
      if (pzl.ch) { try { if (pzl.prev) { drawPiece(W + 3, H, pzl.prev, true); drawPiece(W + 20, H); } else drawPiece(W + 3, H); } catch (e) {} }   // v5.1.407: [1つ前][最後]
      ctlItems.forEach((k, idx) => { const x = W + PW - 16 - (ctlItems.length - 1 - idx) * 19; try { if (k === 'quit') drawQuit(x, H); else { const ic = iconOf(edBundle()); if (ic) ic.drawInRectFromRectOperationFraction($.NSMakeRect(x, 1, 16, 16), $.NSZeroRect, 2, edRunning() ? 1 : 0.35); } } catch (e) {} });   // v5.1.443
      // v5.1.439〜442 の起動ボタンは ctlItems へ
      img.unlockFocus;
      img.template = false;
      item.button.image = img; item.button.title = '';
    }
  }
// {* ▲mCN=1500_SHOW // end [cGJF=h] *}
// {* ▼mCN=1600_CLOCK_STEP // ⏰の帯 / 鳴らす判定 / 1回分の見張り step() (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // ★v4.2.340: 連動の次の1歩(鳴った a から、次に鳴る行・回・時刻)。過ぎた分は同じ規則で飛ばす(眠っていた間など)
  // ★v4.2.341(俊克 バグ1「VSCmを閉じていると、目薬2本目のときに、メニューバーは、1本目と誤表示される」):
  //   名前の器(タイトルの `1.`)に回数を入れるのは拡張(meosChainFillSlot)だけだった→ 同じ規則をここにも1つ
  // v5.1.398: ⏰の時刻の帯= 0今日 / 1明日 / 2 1週間以内 / 3 1ヶ月以内 / 4 1年未満 / 5 それより先(拡張の meosClockZone と同じ)
  const clockDayEnds = (now) => { const d = new Date(now), e0 = d.getHours() >= 18 ? new Date(d.getFullYear(), d.getMonth(), d.getDate() + 2).getTime() : now + 24 * 36e5, x = new Date(e0); return [e0, new Date(x.getFullYear(), x.getMonth(), x.getDate() + 1).getTime()]; };   // v5.1.631: pm6 を過ぎたら 今日= 明日の24:00まで / v5.1.632: 明日= 今日の終わりの次の午前0時まで(拡張の meosClockDayEnds と同じ)
  const clockZone = (t, now) => { const _e = clockDayEnds(now); if (t <= _e[0]) return 0; if (t <= _e[1]) return 1;   /* v5.1.629: 今日= 今から24時間以内 / v5.1.630: 明日= 48時間以内(拡張の meosClockZone と同じ) */ if (t - now <= 7 * 864e5) return 2; const m = new Date(now); m.setMonth(m.getMonth() + 1); if (t <= m.getTime()) return 3; const y = new Date(now); y.setFullYear(y.getFullYear() + 1); return t < y.getTime() ? 4 : 5; };
  const clockFar = (t, now) => t > clockDayEnds(now)[1];   // v5.1.629/631: 明日の終わりより先(拡張の meosClockFar と同じ)
  const fillSlot = (text, round) => { let s = String(text || '').replace(/^\s*\d{1,3}[.)]\s*/, ''); if (round > 0) s = s.replace(/\d{1,3}[.)]/, String(round)); return s.trim(); };
  const chainNext = (a, now) => {
    const ch = a.chain, n = ch.length; const stepOf = (r, k) => ((r.steps && r.steps.length) ? r.steps[k % r.steps.length] : 0);
    const nextB = (r, from) => { const tot = (r.steps || []).reduce((x, y) => x + y, 0); if (!(tot > 0)) return 0; let t = r.origin; if (t > from) return t;
      t += Math.floor((from - t) / tot) * tot; let k = 0, g = 0; while (t <= from && g++ < 1000) { t += stepOf(r, k); k++; } return t; };
    let idx = a.idx || 0, done = (a.done || 0) + 1, at = a.at, g = 0;
    for (;;) {
      const row = ch[idx] || {}; let nextAt = 0;
      if (row.rounds > 0 && done < row.rounds) nextAt = at + stepOf(row, done);
      else if (n === 1) { if (!(row.rounds > 0)) nextAt = at + stepOf(row, done); else return null; }   // 1行だけで回数を終えた= おしまい
      else { idx = (idx + 1) % n; done = 0; const r2 = ch[idx]; nextAt = r2.origin > 0 ? nextB(r2, at) : at + stepOf(r2, 0); }
      if (!(nextAt > at)) return null;
      if (nextAt > now || g++ > 500) return { at: nextAt, idx, done, name: (ch[idx].title ? fillSlot(ch[idx].title, done + 1) : ch[idx].name) || a.name, anchor: !!ch[idx].anchor };
      at = nextAt; done = done + 1;   // 眠っていた間に過ぎた1歩= 数えて先へ
      if (ch[idx].rounds > 0 && done >= ch[idx].rounds && n > 1) { /* 次の周で行を回す */ }
    }
  };
  const BELL_MARKS = [[60000, 3000], [30000, 5000], [10000, 0]];   // v4.2.333: 拡張の MEOS_BELL_MARKS と同じ
  let preDone = {};
  // v5.1.335: 自分で起こし直した時(30秒以内)だけ、鳴らした覚えを引き継ぐ(直前に鳴った⏰をもう一度鳴らさない)
  try { const cp = dir + '/fired-carry.json', fm = $.NSFileManager.defaultManager; if (fm.fileExistsAtPath(cp)) { const c = JSON.parse(ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(cp, $.NSUTF8StringEncoding, null)));
    fm.removeItemAtPathError(cp, null); if (Date.now() - Number(c.t) < 30000) { Object.assign(fired, c.fired || {}); Object.assign(preDone, c.preDone || {}); hlog('[menu] 鳴らした覚えを引き継いだ'); } } } catch (e) {}
  const MISSED_MS = 10 * 60000;   // 眠っていた間に過ぎた物は、10分以内なら鳴らす(それより古い朝の目覚ましは鳴らさない)
  let quitNow = false;
  // ★v5.1.614(俊克 11.09 am10:47 改良1「メニューバーのリストを表示したままにしてあったが…消滅後もゴミが残っているね。表示し直したら消滅した」): 開いている間は作り替えない(v4.2.333)ので、行が減ると一覧全体が止まっていた。
  //   行が減っただけ(⏰の行・区切り)なら、閉じずに隠して残りの字と行き先を差し替える。古い行 i → 新しい行の番号(隠すのは -1)。減っただけでなければ null= 今まで通り閉じるまで待つ
  const menuShrink = (o, n, ek) => { const map = []; let j = 0; for (let i = 0; i < o.length; i++) { if (j < n.length && ek(o[i]) === ek(n[j])) map[i] = j++; else { if (!o[i].clk && !o[i].sep) return null; map[i] = -1; } } return j === n.length ? map : null; };
  // ★v5.1.620(俊克 11.09 am11:57 バグ1「2回追加テストしたら、2回ともスクショのように駄目だった」): 実測= 成功した1回は「隠した」の1秒後に「作り替えない n=40 前=40」、失敗は最初から「作り替えない n=40 前=41」。付箋の行き先は fusen:印@行番号 なので、♥の行が消えて本文が詰まると付箋の群まで違って見え、隠す口に入れなかった(⏰の消滅と行番号の知らせが同じ回に届くと失敗)。→ 付箋の群は題で比べる。行番号は押す時の手がかりで、並びの違いではない
  const shrinkKey = (e, sk) => e.clk ? 'C' + (e.far ? 'f' : '') : e.fusen ? 'F' + JSON.stringify([e.fusen, e.color, e.star, (e.items || []).map(x => x.title)]) : sk([e]);
  const tracking = () => { try { return ObjC.unwrap($.NSRunLoop.currentRunLoop.currentMode) === 'NSEventTrackingRunLoopMode'; } catch (e) { return false; } };
  function step() {
    try { wakePoll(); } catch (e) {}   // v5.0.0-49
    let st = null;
    try { const s = $.NSString.stringWithContentsOfFileEncodingError(statePath, $.NSUTF8StringEncoding, null); if (s && !s.isNil()) st = JSON.parse(ObjC.unwrap(s)); } catch (e) {}
    if (st && st.quit) { hlog('quit: state.json に quit'); quitNow = true; return; }
    // v4.2.372: もう1人(か、どちらかのアプリ)が「両方止める」を押した= 自分が生まれた後の知らせなら、自分も降りる
    try { const sg = $.NSString.stringWithContentsOfFileEncodingError(sharedDir + '/vhelper-off.json', $.NSUTF8StringEncoding, null);
      if (sg && !sg.isNil()) { const m = JSON.parse(ObjC.unwrap(sg)); if ((Number(m.t) || 0) > bornAt) {
        try { $('1').writeToFileAtomicallyEncodingError(dir + '/off-by-user', true, $.NSUTF8StringEncoding, null); } catch (e) {}
        try { $.NSFileManager.defaultManager.removeItemAtPathError($(ObjC.unwrap($.NSHomeDirectory()) + '/Library/LaunchAgents/' + myLabel + '.plist'), null); } catch (e) {}
        hlog('quit: vhelper-off.json (' + (m.app || '?') + ')'); stopBell(); quitNow = true; return; } } } catch (e) {}                            // 設定で止めた= 自分から降りる(LaunchAgent も外される)
    if (st) {
      if (st.app) appPath = st.app;
      if (st.appName) appName = st.appName;   // v4.2.363
      if (st.scheme) scheme = st.scheme;
      if (st.sound) sound = st.sound;
      if (Array.isArray(st.alarms)) alarms = st.alarms.map(a => (adv[a.id] ? Object.assign({}, a, adv[a.id]) : a));
      owner = st.owner || 0;
      if (Array.isArray(st.folders)) folders = st.folders;   // v5.1.63
    }
    const now = Date.now();
    try { pendingWarpStep(now); } catch (e) {}   // v5.1.62
    if (ownerAlive(owner)) {
      // 拡張が居る= 数えるのも鳴らすのも拡張。こちらは写しを受け取り、出すだけ。
      if (ringing) stopBell();                           // 起こした VSCodium が鐘を引き継いだ
      adv = {};   // 拡張が居る= 数え直した写しが正
      for (const a of alarms) if (a.at <= now) fired[a.id + '@' + a.at] = 1;   // 拡張が鳴らした物を、後で鳴らし直さない
      show(st && st.text, st && st.menu, st && st.anchor);
    } else {
      // ★v4.2.333(俊克 バグ1「⚓タイマーは…3回鳴るだけというのは今一。通常通り、1分前、30秒前、10秒以内の鳴動はしようよ」):
      //   拡張と同じ先鐘= 1分前に3秒・30秒前に5秒・10秒前から時刻まで鳴り続ける。周期より遠い印は出さない(1分周期に1分前は無い)。
      for (const a of alarms) {
        if (fired[a.id + '@' + a.at] || a.at <= now) continue;
        if (a.mute || a.quiet) continue;   // v5.0.0-58: 🌅LaunchD= 鳴らさない(Mac が起きるだけ) / v5.1.609: ♥膜の⏰も
        const n = (Array.isArray(a.steps) && a.steps.length) ? a.steps.length : 0;
        let cyc = n ? a.steps[Math.max(0, (a.si || 0) - 1) % n] : 0;
        if (Array.isArray(a.chain) && a.chain[a.idx || 0]) { const r0 = a.chain[a.idx || 0]; cyc = (r0.steps && r0.steps.length) ? r0.steps[(a.done || 0) % r0.steps.length] : 0; }   // v4.2.340
        const marks = cyc > 0 ? BELL_MARKS.filter(m => m[0] < cyc) : BELL_MARKS;
        const key = a.id + '@' + a.at; let i = preDone[key] || 0, hit = -1;
        while (i < marks.length && a.at - now <= marks[i][0]) { hit = i; i++; }
        if (hit >= 0) { preDone[key] = i; ringing = { name: a.name || '', until: marks[hit][1] > 0 ? now + marks[hit][1] : a.at, anchor: !!a.anchor }; ringNext = 0; }
      }
      for (const a of alarms) {
        if (fired[a.id + '@' + a.at] || a.at > now) continue;
        fired[a.id + '@' + a.at] = 1;
        // ★v4.2.340: 連動の⏰= 拡張と同じ規則で席を回す(回数を終えたら/限り無しは1回で次の行へ。次の行に起点が有ればその区切り、無ければそこから数える)
        if (Array.isArray(a.chain) && a.chain.length) { const nx = chainNext(a, now); if (nx) adv[a.id] = nx; }
        // v4.2.332: 周期の時計は、並びに沿って次の時刻へ進める(過ぎた分は飛ばして、今より先の最初の区切りへ)
        else if (Array.isArray(a.steps) && a.steps.length) { let at2 = a.at, si = a.si || 0; do { at2 += a.steps[si % a.steps.length]; si++; } while (at2 <= now); adv[a.id] = { at: at2, si }; }
        if (now - a.at > MISSED_MS) continue;
        if (a.mute || a.quiet) continue;   // v5.0.0-58: 🌅LaunchD= 鳴らさない・飛ばない / v5.1.609: ♥膜の⏰は次に開いた時に片付く
        const cyc0 = (Array.isArray(a.chain) && a.chain.length) || (Array.isArray(a.steps) && a.steps.length);   // v4.2.340: 連動も周期と同じく笛
        // ★v4.2.342(俊克「二本目がタイムアップした直後に「⏰⚓♬目薬2本目」が数秒表示された後、次に切り替わった。VSCmが起動している時は無い」):
        //   拡張は時刻ちょうどに鐘を止めて笛を1回鳴らすだけ(鳴っている扱いにしない)。こちらは笛の3秒を「鳴っている」にしていた→ 同じく鳴らすだけ
        if (cyc0) { stopBell(); try { const f = sound.whistle || sound.file; if (f) $.NSTask.launchedTaskWithLaunchPathArguments('/usr/bin/afplay', $(['-v', String(sound.vol || 2), f])); } catch (e) {} }
        else ringing = { name: a.name || '', until: now + 5 * 60000, anchor: !!a.anchor };   // v4.2.336: 周期の時刻ちょうどは笛(ピーーー)   // v4.2.332: 周期は3秒の合図だけ(拡張の笛と同じ長さ)   // 上限5分= 拡張と同じ / v4.2.325: ⚓の鐘も青
        ringNext = 0;
        if (!a.anchor) openWarp(warpUrl(a, true));        // VSCodium を起こして膜へ(鐘は拡張が引き継ぐ)。⚓停泊中は鳴らすだけ(v4.2.312)
      }
      if (ringing && now >= ringing.until) stopBell();
      // ★v4.2.335(俊克「VSCmを閉じている時に、鳴動がゆっくりだったのはなぜか?」): 見回り(0.5秒)のついでに鳴らしていたので、
      //   0.6秒の設定が次の見回りの1.0秒へ間延びしていた。→ 鐘は専用のタイマーで、設定どおりの間隔で鳴らす。
      if (ringing && ringing.whistle && !ringing.blown) {   // v4.2.336: 拡張の meosPlayWhistle と同じ= 秒読みを止めて、3秒の笛を1回
        if (bellTimer) { bellTimer.invalidate; bellTimer = null; }
        ringing.blown = true;
        try { const f = sound.whistle || sound.file; if (f) $.NSTask.launchedTaskWithLaunchPathArguments('/usr/bin/afplay', $(['-v', String(sound.vol || 2), f])); } catch (e) {}
      }
      if (ringing && !ringing.whistle && !bellTimer) {
        mewRows = mewRows.map(() => Math.random()); mewN = 0;   // v4.2.408: 鳴り始めは振り出しから
        playBell();
        if (sound.every > 0) { if (isGk()) armGk(); else if (isGrowl() || isPurrF()) armGrowl(); else { bellTimer = $.NSTimer.timerWithTimeIntervalTargetSelectorUserInfoRepeats(Math.max(0.3, sound.every), ticker, 'bell:', $(), true); $.NSRunLoop.currentRunLoop.addTimerForMode(bellTimer, $.NSRunLoopCommonModes); } }
      }
      if ((!ringing || ringing.whistle) && bellTimer) { bellTimer.invalidate; bellTimer = null; }
      alarms = alarms.map(a => (adv[a.id] ? Object.assign({}, a, adv[a.id]) : a));
      const next = alarms.filter(a => !fired[a.id + '@' + a.at] && a.at > now).sort((x, y) => x.at - y.at);
      const menu = [];
      if (ringing) menu.push({ id: 'h:stop', title: 'Stop the bell' }, { sep: true });
      const _p2 = (d) => (d < 10 ? '0' : '') + d, _lab = (t) => { const d = new Date(t); return _p2(d.getMonth() + 1) + '-' + _p2(d.getDate()) + '(' + 'SMTWtFs'[d.getDay()] + ') ' + _p2(d.getHours()) + ':' + _p2(d.getMinutes()); };   // 拡張の meosClockLastLabel と同じ形(年は省く)
      if (next.length) menu.push({ id: 'h:pass', title: '\u23ed\ufe0f Pass the next   ' + (next[0].name || next[0].key || '') + '   ' + _lab(next[0].at) }, { sep: true });   // v4.2.459
      const LS = (st && st.listStar) || {}, lsIs = (k, a) => !!(LS[k] && LS[k].key && a && LS[k].uri === String(a.uri || '') && LS[k].key === String(a.key || ''));   // v5.1.479: ⭐️
      if (next.length) menu.push({ clockAll: true });   // v5.1.480: 一番上の親には⭐️なし   // v5.1.356: 閉じている時も ⏰の見出し(畳む・⊟)
      next.forEach((a, i) => { if (i && clockZone(a.at, now) !== clockZone(next[i - 1].at, now)) menu.push(Object.assign({ sep: true, cz: 1, dd: clockZone(next[i - 1].at, now) <= 2 ? 2 : 1 }, clockFar(a.at, now) ? { far: 1 } : {}));   // v5.1.406: 最初の2本(今日|1週間・1週間|1ヶ月)は太い(2)   // v5.1.398: 今日/1週間/1ヶ月/1年の境に一点鎖線
        menu.push({ clk: 1, far: clockFar(a.at, now) ? 1 : 0, id: 'h:' + alarms.indexOf(a), title: (lsIs('clk', a) ? STAR : '') + (a.mute ? '\ud83c\udf05' : '⏰' + (a.anchor ? '⚓️' : '')) + ' ' + (i ? face(a.at - now).replace(/\.\d{2}$/, '') : face(a.at - now)) + '   ' + (a.name || a.key || '') }); });   // v4.2.556: 秒は次の1本だけ
      if (next.length) menu.push({ sep: true });
      // ★v4.2.342(俊克「VSCmが閉じている時は、その時のリストをメニューバーのメニューのTag&Goの下に表示する」):
      //   最後に見ていた部屋の姿(選んだ札・打った字・札の並び)で、札ごとに並べる(v4.2.309の形)。押せば VSCodium を起こして膜へ
      // ★v5.1.348(俊克 10.31 am00:06「VSCmを閉じたあとも、付箋をV-helperに残す」): 拡張が最後に書いた付箋の群(state.json の fusen)を、開いている時と同じ姿で出す
      fusenRows = [];
      try {
        const gs = Array.isArray(st && st.fusen) ? st.fusen : [];
        if (gs.length) { menu.push({ fusenAll: true });
          for (const g of gs) { if (g.ic1) menu.push({ sep: true, fz: 1 });
            menu.push({ fusen: g.name, color: g.color, star: !!g.star, items: (g.items || []).map(it => { fusenRows.push(it); return { id: 'h:f' + (fusenRows.length - 1), title: it.title }; }) }); }
          menu.push({ sep: true }); }
      } catch (e) {}
      tagRows = [];
      try {
        const tg = (st && st.tagGo) || {}, v = tg.view || {}, items = Array.isArray(tg.items) ? tg.items : [];
        const f = String(v.filter || '').toLowerCase(), pass = it => !f || (it.tags || []).some(x => String(x).toLowerCase().indexOf(f) >= 0);
        let tags = [];
        if (v.sel) tags = [v.sel];
        else { for (const it of items) for (const x of (it.tags || [])) if (tags.indexOf(x) < 0) tags.push(x);
          const ord = Array.isArray(v.order) ? v.order : []; tags.sort((p, q) => { let a1 = ord.indexOf(p), b1 = ord.indexOf(q); if (a1 < 0) a1 = 9999; if (b1 < 0) b1 = 9999; return a1 - b1; }); }
        const tl = [];   // v5.1.327: 15行で切らず、全部を ▲▼ で送る並びに
        for (const x of tags) {
          const mem = items.filter(it => (it.tags || []).indexOf(x) >= 0 && pass(it)); if (!mem.length) continue;
          const hs = mem.some(it => lsIs('tag', it)); tl.push(hs ? { title: '#' + x, off: true, star: true } : { title: '#' + x, off: true });   // v5.1.479
          for (const it of mem) { tl.push({ id: 'h:t' + tagRows.length, title: (lsIs('tag', it) ? STAR : '') + (it.name || it.key), indent: 1 }); tagRows.push(it); }
        }
        if (tl.length) { menu.push({ tagAll: true }, { tagPager: true, rows: tl }); menu.push({ sep: true }); }
      } catch (e) {}
      if (lastPass && lastPass.at > now) menu.push({ id: 'h:unpass', title: '\u21a9\ufe0e ' + lastPass.name + '   ' + _lab(lastPass.at) + '   \u2014 last passed' }, { sep: true });   // v4.2.459
      menu.push({ id: 'h:open', title: 'Start ' + appName });   // v4.2.363: Dock の代わり
      menu.push({ id: 'h:quithelper', title: 'Quit wGATE for VSCs' });   // v5.1.408: 表示の名前= wGATE(俊克 11.02「V-helper改め wGATE」)   // v4.2.371: 両方   // v4.2.364
      // ★v4.2.334(俊克 改良1「VSCmを閉じている時の⚓タイマーで、鳴っている間に残タイマーが表示されなくなった」):
      //   拡張の最下段(v4.2.328)と同じく、鳴っている時計がまだ数えていれば残り時間を添える。♪/♬も拡張と同じ拍(0.8秒)で入れ替える。
      const ra = ringing ? next.find(a => (a.name || '') === ringing.name) : null;
      optTarget = ra || (next.length ? next[0] : null);   // v4.2.337: 札に出ている時計
      const note = (Math.floor(now / 800) % 2) ? '\u266c' : '\u266a';
      const text = ringing ? ('⏰' + (ringing.anchor ? '⚓️' : '') + ' ' + note + ' ' + (ra ? face(ra.at - now) + ' ' : '') + (ringing.name || 'time is up')) : (next.length ? ((next[0].mute ? '\ud83c\udf05' : '⏰' + (next[0].anchor ? '⚓️' : '')) + ' ' + face(next[0].at - now) + (next[0].name ? ' ' + next[0].name : '') + (next.length > 1 ? ' +' + (next.length - 1) : '')) : null);
      show(text, menu, ringing ? !!ringing.anchor : (next.length > 0 && !!next[0].anchor));
    }
  }
// {* ▲mCN=1600_CLOCK_STEP // end [cGJF=h] *}
// {* ▼mCN=1700_TICKERS // タイマー / puzzle-last の読み取り / 構え armTick / ポインターを運ぶ warpPtr / 修飾キー (📊⊕0+0D0W) [oGJF=h] [tRJF=h] *}
  // ★v4.2.333(俊克 改良2「メニューを出しているとき、メニューバーの残時間が止まってしまう」): メニューを開いている間は macOS が
  //   runUntilDate を返さない(メニューの追跡の間は別の走り方)。→ 描く仕事を『どの走り方でも鳴る』タイマー(CommonModes)に載せる。
  ObjC.registerSubclass({ name: 'MeOSTickH', methods: { 'tick:': { types: ['void', ['id']], implementation: function (t) { try { step(); } catch (e) {} try { cycIdle(); } catch (e) {} } },
    'mods:': { types: ['void', ['id']], implementation: function (t) { try { modsTick(); } catch (e) {} } },
    'bell:': { types: ['void', ['id']], implementation: function (t) { try { if (ringing && Date.now() < ringing.until) { playBell(); if (isGk()) armGk(); else if (isGrowl() || isPurrF()) armGrowl(); } } catch (e) {} } } } });
  const ticker = $.MeOSTickH.alloc.init;
  // ★v4.2.738(俊克「ポインターを動かさなくても、Shift などを押した瞬間に Me Dock の×の色を変えたい」= ②):
  //   焦点が編集画面に在ると、キーは Me Dock に届かない。→ 拡張が mods-want を置いている間(ポインターが Me Dock の上)だけ、
  //   0.1秒ごとに Mac の修飾キーの状態を見て、変わった時だけ mods.json に書く(拡張がそれを Me Dock へ渡す)。
  let modsLast = -1;
  // v5.1.398: 構えの🧩= arm の中身は置いた時刻。古い物(25秒= 長押し10秒＋待ち10秒より長い)は拡張が消し損ねたとみなす。変わった時だけ札を描き直す
  let armOn = false;
  // v5.1.401: 札の右端のピース= 拡張が置く puzzle-last({ch,lv})。0.5秒に1回読み、変わったら描き直す
  let pzl = { ch: '', lv: 1, prev: '', ord: '' }, pzlN = 0;
  const pzlTick = () => { if (pzlN++ % 5) return; let o = null; try { const f = dir + '/puzzle-last'; if ($.NSFileManager.defaultManager.fileExistsAtPath(f)) o = JSON.parse(ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(f, $.NSUTF8StringEncoding, null))); } catch (e) {}
    dockOut.tips = (o && o.tips) || {};   // v5.1.537: 字ごとの tip(Me Dock と同じ= 印の // の後ろ)
    const n = { ch: o && o.ch ? String(o.ch).slice(0, 1) : '', lv: (o && Number(o.lv)) || 1, prev: o && o.prev ? String(o.prev).slice(0, 1) : '', ord: o && o.ord ? String(o.ord).slice(0, 7) : '', dots: o && typeof o.dots === 'string' ? o.dots : undefined }; if (n.prev === n.ch) n.prev = ''; if (n.ch === pzl.ch && n.lv === pzl.lv && n.prev === pzl.prev && n.ord === pzl.ord && n.dots === pzl.dots) return; const chg = n.ch !== pzl.ch; pzl = n; try { step(); } catch (e) {} try { dockOutPaint(); } catch (e) {} /* v5.1.441: Me Dock やキーでワープしても(字が変わっても)消さない */ };
  // ★v5.1.418(俊克 pm06:12 バグ1「shift長押しで、ぶら下がりツールが出てこない」): 拡張は Me Dock が出ている間 arm を書いていなかった(🧩専用だった)→ 常に書き、Me Dock が出ていれば末尾に ' d'。🧩は ' d' 無しの時だけ・出張所は構えなら常に
  let armAny = false;
  const armTick = () => { let on = false, dk = false; try { const ap = dir + '/arm'; if ($.NSFileManager.defaultManager.fileExistsAtPath(ap)) { const t = String(ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(ap, $.NSUTF8StringEncoding, null))); on = Date.now() - parseFloat(t) < 25000; dk = / d/.test(t); } } catch (e) {}
    if (on !== armAny) { armAny = on; if (on && pzl.ch && String(pzl.ord || '').length === 7) { try { dockOutShow(); dockOut.pin = 'arm'; hlog('[dockOut] 構えで出す(出しっぱなし)'); } catch (e) {} } }   // v5.1.417
    try { const sp = dir + '/dockout-show', fm = $.NSFileManager.defaultManager; if (fm.fileExistsAtPath(sp)) { let age = 0; try { const at = fm.attributesOfItemAtPathError(sp, null).fileModificationDate; age = -Number(at.timeIntervalSinceNow); } catch (e) {}   // ★v5.1.473: 起動直後に Barman を出す(ピースの並びが届くまで待つ・60秒で諦める)
        if (dockOut.shown) fm.removeItemAtPathError(sp, null); else if (pzl.ch && String(pzl.ord || '').length === 7) { fm.removeItemAtPathError(sp, null); try { dockOutShow(); dockOut.pin = 'arm'; hlog('[dockOut] 起動直後に出す(出しっぱなし)'); } catch (e) {} } else if (age > 60) fm.removeItemAtPathError(sp, null); } } catch (e) {}
    try { const hp = dir + '/dockout-hide'; if ($.NSFileManager.defaultManager.fileExistsAtPath(hp)) { $.NSFileManager.defaultManager.removeItemAtPathError(hp, null); dockOutToggle('Me Dock の mGATE を Shift クリック'); } } catch (e) {}   // v5.1.468: 閉じるだけ→ オン/オフ   // v5.1.448
    const bd = on && !dk; if (bd === armOn) return; armOn = bd; try { step(); } catch (e) {} };
  // ★v5.1.237(俊克 pm01:05「macユーザーに最大のメリットを。V-helperから操作できるというのを試してみる価値がある」):
  //   Me Dock の🔰に乗るとロゴごと右下へ2.2倍に膨らむ= ポインターの下の図形が逃げる。拡張が warp-ptr.json(実の画素での片道)を置いたら、
  //   今のポインターをその分だけ運ぶ(画素→ポイントは、ポインターが居る画面の倍率で割る)。Web ページの中からはポインターを動かせない
  const warpPtr = () => {
    const wp = dir + '/warp-ptr.json', fm = $.NSFileManager.defaultManager;
    if (!fm.fileExistsAtPath(wp)) return;
    let o = null; try { o = JSON.parse(ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(wp, $.NSUTF8StringEncoding, null))); } catch (e) {}
    try { fm.removeItemAtPathError(wp, null); } catch (e) {}
    if (!o || !(Date.now() - Number(o.t) < 1500)) return;   // 古い頼みは捨てる(遅れて運ぶと、もう別の所に居る)
    const p = $.NSEvent.mouseLocation, scr = $.NSScreen.screens; let bs = 2;
    for (let i = 0; i < scr.count; i++) { const f = scr.objectAtIndex(i).frame; if (p.x >= f.origin.x && p.x < f.origin.x + f.size.width && p.y >= f.origin.y && p.y < f.origin.y + f.size.height) { bs = Number(scr.objectAtIndex(i).backingScaleFactor) || 2; break; } }
    // ★v5.1.239(俊克 pm01:31「10回くらいに1回、弾かれる。条件がよく分からない」): 実測= 頼まれてから運ぶまでの間(0.05〜0.1秒)にポインターが動き続けていると、
    //   その動いた先から片道を足していた(04:33:04 乗った所より62ポイント下から運んだ)= 速く入るほど行き過ぎる。
    //   → 乗った点の画面の位置(sx,sy)から片道を足す= 今どこに居ても、膨らんだ図形の同じ点へ置く。物差しが合わない時(今の位置と200ポイント以上違う)は今まで通り
    const h = scr.objectAtIndex(0).frame.size.height, cx = p.x, cy = h - p.y;
    // ★v5.1.569(俊克 pm06:29 改良2): ♥の1段目の位置= 押した所を控え(set)、mGATE や別の♥からそこへ運ぶ(go)
    if (o.home === 'set') { $.NSString.stringWithString(JSON.stringify({ x: cx, y: cy })).writeToFileAtomicallyEncodingError(dir + '/heart-home.json', true, $.NSUTF8StringEncoding, null); hlog('heartHome set ' + cx.toFixed(1) + ',' + cy.toFixed(1)); return; }
    if (o.home === 'go') { let hh = null; try { hh = JSON.parse(ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(dir + '/heart-home.json', $.NSUTF8StringEncoding, null))); } catch (e) {} if (!hh || !isFinite(hh.x) || !isFinite(hh.y)) return; try { $.CGWarpMouseCursorPosition({ x: hh.x, y: hh.y }); $.CGAssociateMouseAndMouseCursorPosition(true); } catch (e) {} hlog('heartHome go ' + hh.x + ',' + hh.y); return; }
    const pk = o.pt ? 1 : bs; let x = cx + Number(o.dx) / pk, y = cy + Number(o.dy) / pk, how = 'rel';   // v5.1.566: pt= もう Mac のポイント(♥のワープ)
    if (!isFinite(x) || !isFinite(y)) return;
    const ex = Number(o.sx), ey = Number(o.sy);   // v5.1.240: 乗った点はもう Mac のポイント(screenX)
    // ★v5.1.243(俊克 pm01:57 バグ1「右上から近づくと、右上にズレる」): 実測= 右上から入ると、頼みから運ぶまでの間に左下へ動き続けている(04:58:25 で 9pt)。
    //   v5.1.239 の abs はその動きを捨てていた(×0)・それ以前の rel は等倍で足していた(×1)。図形は2.2倍に膨らむので、その間の動きも2.2倍して足すのが正しい
    //   = 着地= 乗った点＋片道＋(今−乗った点)×2.2(= 今の点を、膨らんだ図形の同じ点へ)
    // ★v5.1.244(俊克 pm02:23 バグ1「真上から真下へ動かすと、深く入り込んだ所へ移動する」): ×2.2 は手の動きまで膨らませた(05:26:04 下へ6pt→14pt押し込んだ)。
    //   手の動きは画面の上の動き= 図形が膨らんでも手は等倍で動いている→ 等倍で足す(= 今の位置＋片道)。×0(abs)も×2.2も外れ= 等倍(rel)に落ち着く。乗った点は記録だけ
    how = (isFinite(ex) && isFinite(ey)) ? 'rel(moved ' + (cx - ex).toFixed(1) + ',' + (cy - ey).toFixed(1) + ')' : 'rel';
    // ★v5.1.255(俊克「🔰の中央に常に出す」): 行き先が図形の中央の時は、乗った点から片道(手のその後の動きは足さない= いつも中央)
    if (o.center && isFinite(ex) && isFinite(ey) && Math.abs(ex - cx) < 200 && Math.abs(ey - cy) < 200) { x = ex + Number(o.dx) / bs; y = ey + Number(o.dy) / bs; how = 'center'; }
    try { $.CGWarpMouseCursorPosition({ x: x, y: y }); $.CGAssociateMouseAndMouseCursorPosition(true); } catch (e) {}
    hlog('warpPtr ' + how + ' dx=' + Number(o.dx).toFixed(1) + ' dy=' + Number(o.dy).toFixed(1) + ' bs=' + bs + ' entry=' + (isFinite(ex) ? ex.toFixed(1) + ',' + ey.toFixed(1) : '?') + ' now=' + cx.toFixed(1) + ',' + cy.toFixed(1) + ' to=' + x.toFixed(1) + ',' + y.toFixed(1));
  };
  const modsTick = () => {
    try { warpPtr(); } catch (e) {}
    try { armTick(); } catch (e) {}
    try { pzlTick(); } catch (e) {}
    try { dockOutTick(); } catch (e) {}
    try { dockOutXStep(); } catch (e) {}   // ★v5.1.548: 札のロゴの×
    if (!$.NSFileManager.defaultManager.fileExistsAtPath(dir + '/mods-want')) { modsLast = -1; return; }
    let f = 0; try { f = Number($.CGEventSourceFlagsState(1)) || 0; } catch (e) {} if (!f) f = Number($.NSEvent.modifierFlags) || 0;   // v4.2.742(俊克「エディタから入ると左右どちらも濃紺」): NSEvent は左右を返さない→ CG の機械の状態を先に
    const k = (f & 0x20000 ? 1 : 0) | (f & 0x40000 ? 2 : 0) | (f & 0x80000 ? 4 : 0) | (f & 0x100000 ? 8 : 0) | (f & 0x2 ? 16 : 0) | (f & 0x4 ? 32 : 0);   // v4.2.741: 左右の Shift(機械の左=0x2・右=0x4)
    if (k === modsLast) return; modsLast = k;
    try { $(JSON.stringify({ s: !!(k & 1), c: !!(k & 2), o: !!(k & 4), m: !!(k & 8), sl: !!(k & 16), sr: !!(k & 32), raw: f.toString(16), t: Date.now() })).writeToFileAtomicallyEncodingError(dir + '/mods.json', true, $.NSUTF8StringEncoding, null); } catch (e) {}
  };
  const modsTimer = $.NSTimer.timerWithTimeIntervalTargetSelectorUserInfoRepeats(0.1, ticker, 'mods:', $(), true);
  $.NSRunLoop.currentRunLoop.addTimerForMode(modsTimer, $.NSRunLoopCommonModes);
  const timer = $.NSTimer.timerWithTimeIntervalTargetSelectorUserInfoRepeats(0.5, ticker, 'tick:', $(), true);
  $.NSRunLoop.currentRunLoop.addTimerForMode(timer, $.NSRunLoopCommonModes);
  hlog('born pid=' + $.NSProcessInfo.processInfo.processIdentifier);
  try { step(); } catch (e) {}
  // v5.1.335: 自分で起こし直した直後(10秒以内)= 押されたメニューを開き直す
  try { const rp = dir + '/reopen-menu', fm = $.NSFileManager.defaultManager; if (fm.fileExistsAtPath(rp)) { const o = JSON.parse(ObjC.unwrap($.NSString.stringWithContentsOfFileEncodingError(rp, $.NSUTF8StringEncoding, null)));
    fm.removeItemAtPathError(rp, null); if (Date.now() - Number(o.t) < 10000) { reopenTries = 1; noRestartUntil = Date.now() + 30000; $.NSTimer.scheduledTimerWithTimeIntervalTargetSelectorUserInfoRepeats(0.3, reopener, 'go:', $(), false); } } } catch (e) {}
  while (!quitNow) $.NSRunLoop.currentRunLoop.runUntilDate($.NSDate.dateWithTimeIntervalSinceNow(0.5));
  timer.invalidate; modsTimer.invalidate;
  bar.removeStatusItem(item);
  return 'bye';
}
// {* ▲mCN=1700_TICKERS // end [cGJF=h] *}
