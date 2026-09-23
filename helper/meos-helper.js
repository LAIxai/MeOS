// MeOS menu-bar helper (v4.2.310) — runs as a LaunchAgent via `osascript -l JavaScript`, so it lives on
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
  let appPath = '', scheme = 'vscodium', ext = 'lai.lai-membrane';
  // ★拡張が居ない時の口(ここで決める物)= 'h:' で始まる
  let alarms = [], fired = {}, ringing = null, ringNext = 0, sound = { file: '', vol: 2, every: 1 };
  const openApp = () => { try { if (appPath) $.NSWorkspace.sharedWorkspace.openURL($.NSURL.fileURLWithPath(appPath)); } catch (e) {} };
  const warpUrl = (a, bell) => scheme + '://' + ext + '/warp?uri=' + encodeURIComponent(a.uri || '') + '&key=' + encodeURIComponent(a.key || '')
    + '&name=' + encodeURIComponent(a.name || '') + (bell ? '&bell=1' : '');
  const openUrl = (u) => { try { $.NSWorkspace.sharedWorkspace.openURL($.NSURL.URLWithString($(u))); } catch (e) {} };
  const stopBell = () => { ringing = null; ringNext = 0; };
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
  const tgt = $.MeOSHelperTarget.alloc.init;   // 強く持つ(弱い参照だと消されてクリックが届かない= v4.2.205の穴)
  function build(entries) {
    const m = $.NSMenu.alloc.init; m.autoenablesItems = false;
    for (const e of entries) {
      if (e.sep) { m.addItem($.NSMenuItem.separatorItem); continue; }
      const mi = m.addItemWithTitleActionKeyEquivalent($(e.title), e.sub ? null : 'pick:', $(''));
      if (e.sub) mi.submenu = build(e.sub); else { mi.target = tgt; mi.representedObject = $(e.id || ''); }
      if (e.indent) mi.indentationLevel = e.indent;
      if (e.off) mi.enabled = false;
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
  function show(text, menu) {
    const on = !!text;
    item.visible = on;
    if (!on) return;
    const mj = JSON.stringify(menu || []);
    if (mj !== lastMenu) { lastMenu = mj; item.menu = build(menu || []); }
    if (text !== lastText) {
      lastText = text;
      const t = String(text).length > 40 ? String(text).slice(0, 39) + '…' : String(text);   // ノッチの裏に隠れないよう短く
      const font = $.NSFont.menuBarFontOfSize(11);
      const attrs = $.NSMutableDictionary.alloc.init;
      attrs.setObjectForKey(font, $.NSFontAttributeName);
      attrs.setObjectForKey($.NSColor.whiteColor, $.NSForegroundColorAttributeName);
      const ns = $(t), sz = ns.sizeWithAttributes(attrs);
      const H = 18, PX = 7, W = Math.ceil(sz.width) + PX * 2;
      const img = $.NSImage.alloc.initWithSize($.NSMakeSize(W, H));
      img.lockFocus;
      orange.setFill;
      $.NSBezierPath.bezierPathWithRoundedRectXRadiusYRadius($.NSMakeRect(0, 0, W, H), 5, 5).fill;
      ns.drawAtPointWithAttributes($.NSMakePoint(PX, (H - sz.height) / 2), attrs);
      img.unlockFocus;
      img.template = false;
      item.button.image = img; item.button.title = '';
    }
  }
  const MISSED_MS = 10 * 60000;   // 眠っていた間に過ぎた物は、10分以内なら鳴らす(それより古い朝の目覚ましは鳴らさない)
  for (;;) {
    let st = null;
    try { const s = $.NSString.stringWithContentsOfFileEncodingError(statePath, $.NSUTF8StringEncoding, null); if (s && !s.isNil()) st = JSON.parse(ObjC.unwrap(s)); } catch (e) {}
    if (st && st.quit) break;                            // 設定で止めた= 自分から降りる(LaunchAgent も外される)
    if (st) {
      if (st.app) appPath = st.app;
      if (st.scheme) scheme = st.scheme;
      if (st.sound) sound = st.sound;
      if (Array.isArray(st.alarms)) alarms = st.alarms;
      owner = st.owner || 0;
    }
    const now = Date.now();
    if (ownerAlive(owner)) {
      // 拡張が居る= 数えるのも鳴らすのも拡張。こちらは写しを受け取り、出すだけ。
      if (ringing) stopBell();                           // 起こした VSCodium が鐘を引き継いだ
      for (const a of alarms) if (a.at <= now) fired[a.id] = 1;   // 拡張が鳴らした物を、後で鳴らし直さない
      show(st && st.text, st && st.menu);
    } else {
      for (const a of alarms) {
        if (fired[a.id] || a.at > now) continue;
        fired[a.id] = 1;
        if (now - a.at > MISSED_MS) continue;
        ringing = { name: a.name || '', until: now + 5 * 60000 };   // 上限5分= 拡張と同じ
        ringNext = 0;
        openUrl(warpUrl(a, true));                       // VSCodium を起こして膜へ(鐘は拡張が引き継ぐ)
      }
      if (ringing && now >= ringing.until) stopBell();
      if (ringing && now >= ringNext) { playBell(); ringNext = sound.every > 0 ? now + sound.every * 1000 : Infinity; }
      const next = alarms.filter(a => !fired[a.id] && a.at > now).sort((x, y) => x.at - y.at);
      const menu = [];
      if (ringing) menu.push({ id: 'h:stop', title: 'Stop the bell' }, { sep: true });
      next.forEach((a) => { menu.push({ id: 'h:' + alarms.indexOf(a), title: '⏰ ' + face(a.at - now) + '   ' + (a.name || a.key || '') }); });
      if (next.length) menu.push({ sep: true });
      menu.push({ id: 'h:open', title: 'Open VSCodium' });
      const text = ringing ? ('⏰ ' + (ringing.name || 'time is up')) : (next.length ? ('⏰ ' + face(next[0].at - now) + (next[0].name ? ' ' + next[0].name : '') + (next.length > 1 ? ' +' + (next.length - 1) : '')) : null);
      show(text, menu);
    }
    $.NSRunLoop.currentRunLoop.runUntilDate($.NSDate.dateWithTimeIntervalSinceNow(0.5));
  }
  bar.removeStatusItem(item);
  return 'bye';
}
