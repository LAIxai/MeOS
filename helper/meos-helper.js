// MeOS menu-bar helper (v4.2.337) — runs as a LaunchAgent via `osascript -l JavaScript`, so it lives on
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
ObjC.bindFunction('kill', ['int', ['int', 'int']]);
function run(argv) {
  const dir = argv[0];
  const statePath = dir + '/state.json', clickPath = dir + '/click.json';
  const app = $.NSApplication.sharedApplication;
  app.setActivationPolicy($.NSApplicationActivationPolicyAccessory);
  const bar = $.NSStatusBar.systemStatusBar;
  const item = bar.statusItemWithLength($.NSVariableStatusItemLength);
  // ★v4.2.317(俊克 改良1「灰色の絵文字は目立たないので、文字の⚓にして…文字サイズを大きく」): ⚓だけ字の形(FE0E)
  // ★v4.2.319(俊克 改良2「縁0.4・下げ5で確定」「⚓を右5°くらい傾けようか?」): 赤の塗り＋黒の縁(字の大きさの1.6%)・20pt・下げ5・右へ5°
  const ANCHOR_TILT = 10;   // v4.2.321(俊克「傾き10°にしてみよう」)
  const styled = (t, font, hideA) => {
    const s = $.NSMutableAttributedString.alloc.init;
    const big = $.NSFont.boldSystemFontOfSize(20);   // v4.2.320: 太字(26ptは札からはみ出した・実測)
    for (const p of String(t).split(/(\u2693\ufe0f?)/)) {
      if (!p) continue;
      const isA = p.charAt(0) === '\u2693';
      const x = $.NSMutableAttributedString.alloc.init; x.mutableString.setString($(isA ? '\u2693\ufe0e' : p));
      const r = $.NSMakeRange(0, x.length);
      x.addAttributeValueRange($.NSFontAttributeName, isA ? big : font, r);
      x.addAttributeValueRange($.NSForegroundColorAttributeName, isA ? (hideA ? $.NSColor.clearColor : $.NSColor.systemRedColor) : $.NSColor.whiteColor, r);
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
  let appPath = '', scheme = 'vscodium', ext = 'lai.lai-membrane';
  // ★拡張が居ない時の口(ここで決める物)= 'h:' で始まる
  let alarms = [], fired = {}, ringing = null, ringNext = 0, sound = { file: '', vol: 2, every: 1 };
  let adv = {};   // v4.2.332: 周期の時計をここで進めた分(id → {at, si})。state.json は拡張が居ない間は変わらないので、上に重ねて持つ
  const openApp = () => { try { if (appPath) $.NSWorkspace.sharedWorkspace.openURL($.NSURL.fileURLWithPath(appPath)); } catch (e) {} };
  const warpUrl = (a, bell) => scheme + '://' + ext + '/warp?uri=' + encodeURIComponent(a.uri || '') + '&key=' + encodeURIComponent(a.key || '')
    + '&name=' + encodeURIComponent(a.name || '') + (bell ? '&bell=1' : '');
  const openUrl = (u) => { try { $.NSWorkspace.sharedWorkspace.openURL($.NSURL.URLWithString($(u))); } catch (e) {} };
  let bellTimer = null;
  const stopBell = () => { ringing = null; ringNext = 0; if (bellTimer) { bellTimer.invalidate; bellTimer = null; } };
  const ownerAlive = (pid) => pid > 0 && $.kill(pid, 0) === 0;
  let owner = 0;
  ObjC.registerSubclass({ name: 'MeOSHelperTarget', methods: { 'pick:': { types: ['void', ['id']], implementation: function (s) {
    let id = ''; try { id = ObjC.unwrap(s.representedObject) || ''; } catch (e) {}
    if (id.indexOf('h:') === 0) {                         // 拡張が居ない時のメニュー= ここで片付ける
      if (id === 'h:stop') { stopBell(); return; }
      if (id === 'h:open') { openApp(); return; }
      const a = alarms[parseInt(id.slice(2), 10)]; if (a) { stopBell(); openUrl(warpUrl(a, false)); }
      return;
    }
    try { $(JSON.stringify({ id: id, t: Date.now() })).writeToFileAtomicallyEncodingError(clickPath, true, $.NSUTF8StringEncoding, null); } catch (e) {}
    openApp();
  } } } });
  let optTarget = null;   // v4.2.337: 札に出ている時計(拡張が居ない時)
  const optWarp = () => {
    if (ownerAlive(owner)) { try { $(JSON.stringify({ id: 'optwarp', t: Date.now() })).writeToFileAtomicallyEncodingError(clickPath, true, $.NSUTF8StringEncoding, null); } catch (e) {} openApp(); return; }
    if (optTarget) { stopBell(); openUrl(warpUrl(optTarget, false)); } else openApp();
  };
  // ★v4.2.337(俊克「Optクリックでメニューバーをクリックすると、VSCmを起動する。あるいは、今表示している膜にワープする」):
  //   メニューが開く直前に Opt を見て、押されていればメニューを畳み、札に出ている膜へワープする。
  ObjC.registerSubclass({ name: 'MeOSMenuDelH', protocols: ['NSMenuDelegate'], methods: { 'menuWillOpen:': { types: ['void', ['id']], implementation: function (m) {
    try { if (($.NSEvent.modifierFlags & 0x80000) === 0) return; m.cancelTracking; optWarp(); } catch (e) {}
  } } } });
  const mdel = $.MeOSMenuDelH.alloc.init;   // 強く持つ
  const tgt = $.MeOSHelperTarget.alloc.init;   // 強く持つ(弱い参照だと消されてクリックが届かない= v4.2.205の穴)
  function build(entries) {
    const m = $.NSMenu.alloc.init; m.autoenablesItems = false;
    for (const e of entries) {
      if (e.sep) { m.addItem($.NSMenuItem.separatorItem); continue; }
      const mi = m.addItemWithTitleActionKeyEquivalent($(e.title), e.sub ? null : 'pick:', $(''));
      if (e.sub) mi.submenu = build(e.sub); else { mi.target = tgt; mi.representedObject = $(e.id || ''); }
      if (e.indent) mi.indentationLevel = e.indent;
      if (e.off) mi.enabled = false;
      if (e.check) mi.state = 1;   // v4.2.311: ✓
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
    }
    return m;
  }
  // 残り時間の書き方= 拡張と同じ H:MM.SS(1日を越えたら Nd を前に)
  const face = (ms) => {
    let s = Math.max(0, Math.round(ms / 1000)); const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    const p = (n) => (n < 10 ? '0' : '') + n;
    return (d ? d + 'd ' + p(h) : String(h)) + ':' + p(m) + '.' + p(ss);
  };
  const playBell = () => {
    try {
      if (!sound.file) return;
      $.NSTask.launchedTaskWithLaunchPathArguments('/usr/bin/afplay', $(['-v', String(sound.vol || 2), sound.file]));
    } catch (e) {}
  };
  let lastMenu = null, lastText = null;
  const orange = $.NSColor.colorWithSRGBRedGreenBlueAlpha(0xe0 / 255, 0x80 / 255, 0x3a / 255, 1);
  const blue = $.NSColor.colorWithSRGBRedGreenBlueAlpha(0x2f / 255, 0x80 / 255, 0xb8 / 255, 1);   // v4.2.316: ⚓停泊中
  let lastAnchor = null;
  function show(text, menu, anchor) {
    const on = !!text;
    item.visible = on;
    if (!on) return;
    const mj = JSON.stringify(menu || []);
    if (mj !== lastMenu && !tracking()) { lastMenu = mj; const mm = build(menu || []); mm.delegate = mdel; item.menu = mm; }   // v4.2.333: 開いているメニューは作り替えない(札の数字だけ動かす)
    if (text !== lastText || !!anchor !== lastAnchor) {
      lastText = text; lastAnchor = !!anchor;
      const t = String(text).length > 40 ? String(text).slice(0, 39) + '…' : String(text);   // ノッチの裏に隠れないよう短く
      const font = $.NSFont.menuBarFontOfSize(11);
      const attrs = $.NSMutableDictionary.alloc.init;
      attrs.setObjectForKey(font, $.NSFontAttributeName);
      attrs.setObjectForKey($.NSColor.whiteColor, $.NSForegroundColorAttributeName);
      const sz = styled(t, font, true).size;
      const H = 18, PX = 7, W = Math.ceil(sz.width) + PX * 2;
      const img = $.NSImage.alloc.initWithSize($.NSMakeSize(W, H));
      img.lockFocus;
      (anchor ? blue : orange).setFill;
      $.NSBezierPath.bezierPathWithRoundedRectXRadiusYRadius($.NSMakeRect(0, 0, W, H), 5, 5).fill;
      drawStyled(t, font, PX, (H - sz.height) / 2);
      img.unlockFocus;
      img.template = false;
      item.button.image = img; item.button.title = '';
    }
  }
  const BELL_MARKS = [[60000, 3000], [30000, 5000], [10000, 0]];   // v4.2.333: 拡張の MEOS_BELL_MARKS と同じ
  let preDone = {};
  const MISSED_MS = 10 * 60000;   // 眠っていた間に過ぎた物は、10分以内なら鳴らす(それより古い朝の目覚ましは鳴らさない)
  let quitNow = false;
  const tracking = () => { try { return ObjC.unwrap($.NSRunLoop.currentRunLoop.currentMode) === 'NSEventTrackingRunLoopMode'; } catch (e) { return false; } };
  function step() {
    let st = null;
    try { const s = $.NSString.stringWithContentsOfFileEncodingError(statePath, $.NSUTF8StringEncoding, null); if (s && !s.isNil()) st = JSON.parse(ObjC.unwrap(s)); } catch (e) {}
    if (st && st.quit) { quitNow = true; return; }                            // 設定で止めた= 自分から降りる(LaunchAgent も外される)
    if (st) {
      if (st.app) appPath = st.app;
      if (st.scheme) scheme = st.scheme;
      if (st.sound) sound = st.sound;
      if (Array.isArray(st.alarms)) alarms = st.alarms.map(a => (adv[a.id] ? Object.assign({}, a, adv[a.id]) : a));
      owner = st.owner || 0;
    }
    const now = Date.now();
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
        const n = (Array.isArray(a.steps) && a.steps.length) ? a.steps.length : 0;
        const cyc = n ? a.steps[Math.max(0, (a.si || 0) - 1) % n] : 0;
        const marks = cyc > 0 ? BELL_MARKS.filter(m => m[0] < cyc) : BELL_MARKS;
        const key = a.id + '@' + a.at; let i = preDone[key] || 0, hit = -1;
        while (i < marks.length && a.at - now <= marks[i][0]) { hit = i; i++; }
        if (hit >= 0) { preDone[key] = i; ringing = { name: a.name || '', until: marks[hit][1] > 0 ? now + marks[hit][1] : a.at, anchor: !!a.anchor }; ringNext = 0; }
      }
      for (const a of alarms) {
        if (fired[a.id + '@' + a.at] || a.at > now) continue;
        fired[a.id + '@' + a.at] = 1;
        // v4.2.332: 周期の時計は、並びに沿って次の時刻へ進める(過ぎた分は飛ばして、今より先の最初の区切りへ)
        if (Array.isArray(a.steps) && a.steps.length) { let at2 = a.at, si = a.si || 0; do { at2 += a.steps[si % a.steps.length]; si++; } while (at2 <= now); adv[a.id] = { at: at2, si }; }
        if (now - a.at > MISSED_MS) continue;
        ringing = { name: a.name || '', until: now + ((Array.isArray(a.steps) && a.steps.length) ? 3000 : 5 * 60000), anchor: !!a.anchor, whistle: !!(Array.isArray(a.steps) && a.steps.length) };   // v4.2.336: 周期の時刻ちょうどは笛(ピーーー)   // v4.2.332: 周期は3秒の合図だけ(拡張の笛と同じ長さ)   // 上限5分= 拡張と同じ / v4.2.325: ⚓の鐘も青
        ringNext = 0;
        if (!a.anchor) openUrl(warpUrl(a, true));        // VSCodium を起こして膜へ(鐘は拡張が引き継ぐ)。⚓停泊中は鳴らすだけ(v4.2.312)
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
        playBell();
        if (sound.every > 0) { bellTimer = $.NSTimer.timerWithTimeIntervalTargetSelectorUserInfoRepeats(Math.max(0.3, sound.every), ticker, 'bell:', $(), true); $.NSRunLoop.currentRunLoop.addTimerForMode(bellTimer, $.NSRunLoopCommonModes); }
      }
      if ((!ringing || ringing.whistle) && bellTimer) { bellTimer.invalidate; bellTimer = null; }
      alarms = alarms.map(a => (adv[a.id] ? Object.assign({}, a, adv[a.id]) : a));
      const next = alarms.filter(a => !fired[a.id + '@' + a.at] && a.at > now).sort((x, y) => x.at - y.at);
      const menu = [];
      if (ringing) menu.push({ id: 'h:stop', title: 'Stop the bell' }, { sep: true });
      next.forEach((a) => { menu.push({ id: 'h:' + alarms.indexOf(a), title: '⏰' + (a.anchor ? '⚓️' : '') + ' ' + face(a.at - now) + '   ' + (a.name || a.key || '') }); });
      if (next.length) menu.push({ sep: true });
      menu.push({ id: 'h:open', title: 'Open VSCodium' });
      // ★v4.2.334(俊克 改良1「VSCmを閉じている時の⚓タイマーで、鳴っている間に残タイマーが表示されなくなった」):
      //   拡張の最下段(v4.2.328)と同じく、鳴っている時計がまだ数えていれば残り時間を添える。♪/♬も拡張と同じ拍(0.8秒)で入れ替える。
      const ra = ringing ? next.find(a => (a.name || '') === ringing.name) : null;
      optTarget = ra || (next.length ? next[0] : null);   // v4.2.337: 札に出ている時計
      const note = (Math.floor(now / 800) % 2) ? '\u266c' : '\u266a';
      const text = ringing ? ('⏰' + (ringing.anchor ? '⚓️' : '') + ' ' + note + ' ' + (ra ? face(ra.at - now) + ' ' : '') + (ringing.name || 'time is up')) : (next.length ? ('⏰' + (next[0].anchor ? '⚓️' : '') + ' ' + face(next[0].at - now) + (next[0].name ? ' ' + next[0].name : '') + (next.length > 1 ? ' +' + (next.length - 1) : '')) : null);
      show(text, menu, ringing ? !!ringing.anchor : (next.length > 0 && !!next[0].anchor));
    }
  }
  // ★v4.2.333(俊克 改良2「メニューを出しているとき、メニューバーの残時間が止まってしまう」): メニューを開いている間は macOS が
  //   runUntilDate を返さない(メニューの追跡の間は別の走り方)。→ 描く仕事を『どの走り方でも鳴る』タイマー(CommonModes)に載せる。
  ObjC.registerSubclass({ name: 'MeOSTickH', methods: { 'tick:': { types: ['void', ['id']], implementation: function (t) { try { step(); } catch (e) {} } },
    'bell:': { types: ['void', ['id']], implementation: function (t) { try { if (ringing && Date.now() < ringing.until) playBell(); } catch (e) {} } } } });
  const ticker = $.MeOSTickH.alloc.init;
  const timer = $.NSTimer.timerWithTimeIntervalTargetSelectorUserInfoRepeats(0.5, ticker, 'tick:', $(), true);
  $.NSRunLoop.currentRunLoop.addTimerForMode(timer, $.NSRunLoopCommonModes);
  try { step(); } catch (e) {}
  while (!quitNow) $.NSRunLoop.currentRunLoop.runUntilDate($.NSDate.dateWithTimeIntervalSinceNow(0.5));
  timer.invalidate;
  bar.removeStatusItem(item);
  return 'bye';
}
