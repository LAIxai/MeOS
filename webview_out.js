
const vscode=acquireVsCodeApi();let currentMode="0";let currentValue="0";let draftName=currentValue||'';let draftDirty=false;let currentLine="0";let markerOn="0";let historyState={canBack:false,canForward:false};let currentColor='';let draftColor='';let flipMinusColor='';let flipPlusColor='';let meScope='me';
const closeButton=document.querySelector('.close'),standardsToggle=document.getElementById('standards-toggle'),title=document.getElementById('inline-title'),editModeSelect=document.getElementById('edit-mode-select'),zoomScopeIndicator=document.getElementById('zoom-scope-indicator'),zoomMePanel=document.getElementById('zoom-me-panel'),topButtons=document.getElementById('top-buttons'),colorRow=document.getElementById('color-row'),nameWrap=document.getElementById('me-name-wrap'),input=document.getElementById('me-name-input'),lineBtn=document.getElementById('line-btn'),lineMeter=document.getElementById('time-machine-trigger'),timeMachineTrigger=document.getElementById('time-machine-trigger'),timeMachinePanel=document.getElementById('time-machine-panel'),timeMachineSliderReal=document.getElementById('time-machine-slider-real'),timeMachineSliderReinc=document.getElementById('time-machine-slider-reinc'),tmWorldReal=document.getElementById('tm-world-real'),tmWorldReinc=document.getElementById('tm-world-reinc'),timeMachineIndex=document.getElementById('time-machine-index'),timeMachineTotal=document.getElementById('time-machine-total'),timeMachineMarksReal=document.getElementById('tm-insertion-marks-real'),timeMachineMarksReinc=document.getElementById('tm-insertion-marks-reinc'),timeMachinePre=document.getElementById('time-machine-pre'),timeMachineClear=document.getElementById('time-machine-clear'),histBack=document.getElementById('hist-back'),histForward=document.getElementById('hist-forward'),lineInput=document.getElementById('line-input'),refreshBtn=document.getElementById('refresh-btn'),resetBtn=document.getElementById('reset-btn'),setBtn=document.getElementById('set-btn'),fixedToc=document.getElementById('fixed-toc'),fixedTocName=document.getElementById('fixed-toc-name'),fixedTocBody=document.getElementById('fixed-toc-body'),tocPinBar=document.getElementById('toc-pin-bar'),tocTabRow=document.getElementById('toc-tab-row'),tocTabConfirm=document.getElementById('toc-tab-confirm'),tocTabConfirmMsg=document.getElementById('toc-tab-confirm-msg'),tocTabConfirmYes=document.getElementById('toc-tab-confirm-yes'),tocTabConfirmNo=document.getElementById('toc-tab-confirm-no'),toggleEditorToc=document.getElementById('toggle-editor-toc'),tocMoveUp=document.getElementById('toc-move-up'),tocMoveDown=document.getElementById('toc-move-down'),tocAdd=document.getElementById('toc-add'),tocDelItem=document.getElementById('toc-del-item'),tocOnsite=document.getElementById('toc-onsite'),tocTooltip=document.getElementById('toc-tooltip'),navToc=document.getElementById('nav-toc'),navMeWord=document.getElementById('nav-me-word'),navCurrentWord=document.getElementById('nav-current-word'),navCreateToc=document.getElementById('nav-create-toc'),navMeWarp=document.getElementById('nav-me-warp'),navMeSubmarine=document.getElementById('nav-me-submarine'),navMeDepth=document.getElementById('nav-me-depth'),navMeMinus=document.getElementById('nav-me-minus'),navMePlus=document.getElementById('nav-me-plus'),navEof=document.getElementById('nav-eof'),navHeadPrev=document.getElementById('nav-head-prev'),navHeadNext=document.getElementById('nav-head-next'),navHeadLabel=document.getElementById('nav-head-label'),navMarkPrev=document.getElementById('nav-mark-prev'),navMarkNext=document.getElementById('nav-mark-next'),navMarkLabel=document.getElementById('nav-mark-label'),navAnchor=document.getElementById('nav-anchor'),navAnchorLabel=document.getElementById('nav-anchor-label'),navBidi=document.getElementById('nav-bidi'),colorBtn=document.getElementById('color-btn'),colorPop=document.getElementById('color-pop'),meTitleWord=document.getElementById('me-title-word'),membranePanel=document.getElementById('membrane-panel'),membraneVisual=document.getElementById('membrane-visual'),meChoice=document.getElementById('me-choice'),meScopeSelect=document.getElementById('me-scope-select'),contentsBox=document.getElementById('contents-box'),meCheck=document.getElementById('me-check'),contentsCheck=document.getElementById('contents-check'),opAddToc=document.getElementById('op-add-toc'),opToggle=document.getElementById('op-toggle'),opRemove=document.getElementById('op-remove'),opCopy=document.getElementById('op-copy'),opSelect=document.getElementById('op-select'),opDuplicate=document.getElementById('op-duplicate');
const colorChoices=[['R','🟥','Red'],['O','🟧','Orange'],['Y','🟨','Yellow'],['G','🟩','Green'],['B','🟦','Blue'],['P','🟪','Purple'],['N','🟫','Brown'],['W','⬜','White']];
function colorHex(code){const c=(code||'G').toUpperCase();return ({R:'#dc2626',O:'#f97316',Y:'#d97706',G:'#16a34a',B:'#2563eb',P:'#a855f7',N:'#8b5e3c',W:'#9ca3af'}[c]||'#16a34a');}
function colorEmoji(code){const c=(code||'G').toUpperCase();const hit=colorChoices.find(x=>x[0]===c);return hit?hit[1]:'🟩';}
function colorLabel(code){const c=(code||'G').toUpperCase();return colorEmoji(c)+'('+c+')';}
function submarineColor(depth){const d=Math.max(0,Math.min(12,Number(depth)||0));const palette=['#8fe9ff','#7de3fb','#6bdcf7','#58d4f2','#46cbed','#34c2e8','#22b8e0','#149fd0','#0d86bd','#0a6fa8','#075985','#0b4168','#102a43'];return palette[d];}
function submarineTextColor(depth){return (Number(depth)||0)>=7?'#ffffff':'#082f49';}
let navMeMode='warp';let navMeDepthValue=0;
function renderMeNavMode(){if(navMeWarp){navMeWarp.classList.toggle('on',navMeMode==='warp');navMeWarp.classList.toggle('off',navMeMode!=='warp');}if(navMeSubmarine){navMeSubmarine.classList.toggle('on',navMeMode==='submarine');navMeSubmarine.classList.toggle('off',navMeMode!=='submarine');navMeSubmarine.style.setProperty('--submarine-bg',submarineColor(navMeDepthValue));if(navMeMode==='submarine')navMeSubmarine.style.color=submarineTextColor(navMeDepthValue);else navMeSubmarine.style.color='';}if(navMeDepth)navMeDepth.textContent='-'+String(navMeDepthValue);}
function revealTimeMachineFromNavMode(){
  if(timeMachinePanel) timeMachinePanel.classList.add('on');
}
function renderColorButton(){const meAccent=colorHex(draftColor||currentColor||'G');/* v0.9.820 me-face: 右目=光沢ボール+「(R)」(括弧は黒・文字は膜色)。旧textContent書込はボール/文字spanを壊すため分離。 */if(colorBtn){const code=(draftColor||currentColor||'G');const ball=document.getElementById('color-ball'),letter=document.getElementById('color-letter');if(ball&&letter){ball.style.background='radial-gradient(circle at 35% 28%, rgba(255,255,255,.95) 0 13%, rgba(255,255,255,0) 34%), '+colorHex(code);letter.innerHTML='<i>(</i>'+code+'<i>)</i>';letter.style.color=colorHex(code);}else{colorBtn.textContent=colorLabel(code);}}if(navMeWord)navMeWord.style.color=meAccent;if(navCurrentWord)navCurrentWord.style.color=meAccent;if(navMeMinus)navMeMinus.style.color=colorHex(flipMinusColor||draftColor||currentColor||'G');if(navMePlus)navMePlus.style.color=colorHex(flipPlusColor||draftColor||currentColor||'G');renderMeNavMode();if(membraneVisual){membraneVisual.style.color=meAccent;}if(meTitleWord){const r=currentMode==='rename';meTitleWord.classList.toggle('pending',!r);meTitleWord.style.color=r?colorHex(draftColor||currentColor||'G'):'';}if(colorPop){colorPop.innerHTML=colorChoices.map(([code,emoji,name])=>'<button class="swatch" data-code="'+code+'" title="'+name+'"><span class="swatch-wrap"><span class="swatch-label">'+emoji+'</span></span></button>').join('');colorPop.querySelectorAll('.swatch').forEach(btn=>{btn.classList.toggle('active',btn.getAttribute('data-code')===(draftColor||currentColor||'G'));});}}
function renderAnchorButton(anchor){anchor=anchor||{};const has=!!anchor.has;if(navAnchorLabel)navAnchorLabel.textContent='Me';if(navAnchor){navAnchor.classList.toggle('inactive',!has);const tip=has?'S-click: jump open ⇔ close of active 🟢 pair':'No active 🟢 pair (select a membrane name in body to arm)';navAnchor.title=anchor.title||tip;}}
function renderBidiButton(bidi){bidi=bidi||{};const has=!!bidi.has;if(navBidi){navBidi.classList.toggle('inactive',!has);const tip=has?'S-click: jump source ⇔ target of active 🔴 pair':'No active 🔴 pair (select citation text or click an H-TOC entry to arm)';navBidi.title=bidi.title||tip;}}
function renderMembraneTargetPanel(){const code=(draftColor||currentColor||'G');const c=colorHex(code);meScope=(meScopeSelect&&['all','shadow'].includes(meScopeSelect.value))?meScopeSelect.value:'me';if(meChoice)meChoice.style.color=c;if(nameWrap)nameWrap.classList.toggle('hidden',meScope==='all'||meScope==='shadow');if(input)input.disabled=(meScope==='all'||meScope==='shadow');if(resetBtn)resetBtn.parentElement&&resetBtn.parentElement.classList.toggle('hidden',meScope==='all'||meScope==='shadow');if(contentsBox){contentsBox.style.color='var(--vscode-editor-foreground)';contentsBox.style.borderColor=c;}const me=!!(meCheck&&meCheck.checked),contents=!!(contentsCheck&&contentsCheck.checked);if(!me&&!contents&&meCheck){meCheck.checked=true;}const me2=!!(meCheck&&meCheck.checked),contents2=!!(contentsCheck&&contentsCheck.checked);const show=(el,on)=>{if(el)el.classList.toggle('hidden',!on);};show(opAddToc,me2&&!contents2&&meScope==='me');show(opToggle,me2&&!contents2);show(opRemove,me2&&!contents2);show(opCopy,contents2);show(opSelect,!me2&&contents2);show(opDuplicate,me2&&contents2);if(opToggle)opToggle.textContent='Toggle';if(opRemove){opRemove.textContent='Shed Me';opRemove.title='Shed the membrane shell — contents stay intact (脱皮: 殻だけ外し、中身は残る)';}if(typeof renderEditPanelMode==='function')renderEditPanelMode();}

let editPanelMode='edit';
/* v0.9.822: バグ修正(俊克 pm10:29) — チェックボックス操作でキャラ(膜パネル)毎消える件。
   change → renderMembraneTargetPanel → renderEditPanelMode が !r (renameでない)だけで
   パネルを隠し、v801の「膜の中なら表示」(inMembrane)を知らなかった。本文クリックで復活
   していたのはmodeメッセージ再送時の補正行のおかげ。修正=inMembraneStateを webview 側で
   保持し、applyMode/renderEditPanelMode の両方が (!r && !inMembraneState) で判定=再描画
   経路によらず膜の中ではパネルが消えない。 */
let inMembraneState=false;
function renderEditPanelMode(){
  const zooming=editPanelMode==='zoom';
  if(editModeSelect)editModeSelect.value=zooming?'zoom':'edit';
  if(zoomMePanel)zoomMePanel.classList.toggle('hidden',!zooming);
  if(nameWrap)nameWrap.classList.toggle('hidden',zooming || meScope==='all'||meScope==='shadow');
  if(input)input.disabled=zooming || (meScope==='all'||meScope==='shadow');
  if(topButtons)topButtons.classList.toggle('hidden',zooming || meScope==='all'||meScope==='shadow');
  const r=currentMode==='rename';
  if(membranePanel)membranePanel.classList.toggle('hidden',zooming || (!r&&!inMembraneState));
  if(colorRow)colorRow.classList.toggle('hidden',zooming || (!r&&!inMembraneState));
}
// v0.9.664: 膜操作(Copy/Select/Duplicate)の結果を画面下部に一時トースト表示。
let meDockToastTimer=null;
function showMeDockToast(text){
  let el=document.getElementById('meos-op-toast');
  if(!el){el=document.createElement('div');el.id='meos-op-toast';el.style.cssText='position:fixed;left:50%;bottom:14px;transform:translateX(-50%);background:rgba(40,40,40,0.92);color:#fff;padding:6px 14px;border-radius:6px;font-size:12px;z-index:9999;pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,0.3);transition:opacity .2s;';document.body.appendChild(el);}
  el.textContent='✅ '+text;el.style.opacity='1';
  if(meDockToastTimer)clearTimeout(meDockToastTimer);
  meDockToastTimer=setTimeout(()=>{if(el)el.style.opacity='0';},2000);
}
function zoomScopeLabel(label){return 'Zoom : '+(label||'1〜EOF');}
function renderZoomScopeIndicator(label){
  if(!zoomScopeIndicator)return;
  const raw=label||'1〜EOF';
  const text=zoomScopeLabel(raw);
  zoomScopeIndicator.title=text;
  // v0.9.503: per-token colouring. User v0.9.502_0759 refinement: not just
  // the prefix but also fixed keywords (TOC, Me, Line) and separators (+,
  // 〜, spaces) stay orange — ONLY variable values (numbers, names like
  // name_025623.514, EOF) flip to editor-fg (black in light theme). Token-
  // ize the value into alphanumeric chunks vs everything else, then keyword-
  // filter the alphanumerics: keywords → orange, other alphanumerics →
  // black, non-alphanumerics → orange.
  const ZOOM_KEYWORDS=/^(TOC|Me|Line)$/;
  const tokens=String(raw).match(/[A-Za-z0-9_.]+|[^A-Za-z0-9_.]+/g)||[];
  const body=tokens.map(tok=>{
    if(/^[A-Za-z0-9_.]+$/.test(tok)){
      if(ZOOM_KEYWORDS.test(tok)){
        return '<span class="zoom-scope-label">'+escText(tok)+'</span>';
      }
      return '<span class="zoom-scope-value">'+escText(tok)+'</span>';
    }
    return '<span class="zoom-scope-label">'+escText(tok)+'</span>';
  }).join('');
  zoomScopeIndicator.innerHTML='<span class="zoom-scope-label">Zoom : </span>'+body;
}


function historySnapshotForLife(life){
  const worlds=(historyState&&historyState.worlds)||{};
  return worlds[life]||{index:0,total:0,insertions:[]};
}
function renderMarksFor(el, snap){
  if(!el)return;
  const total=snap&&typeof snap.total==='number'?snap.total:0;
  const marks=snap&&Array.isArray(snap.insertions)?snap.insertions:[];
  if(total<=1||!marks.length){el.innerHTML='';return;}
  el.innerHTML=marks.map(p=>{
    const n=Math.max(1,Math.min(total,Number(p)||1));
    const left=total<=1?0:((n-1)/(total-1))*100;
    return '<span class="tm-insertion-mark" style="left:'+left.toFixed(3)+'%" title="Insertion point '+n+'">ﾚ</span>';
  }).join('');
}
function applySliderSnapshot(slider, snap, active){
  if(!slider)return;
  const n=snap&&typeof snap.index==='number'?snap.index:0;
  const total=snap&&typeof snap.total==='number'?snap.total:0;
  slider.max=String(Math.max(total,1));
  slider.value=String(Math.max(n,1));
  // v0.9.405: keep inactive/one-point sliders clickable so a click can switch world lines.
  slider.disabled=false;
  slider.classList.toggle('active',!!active);
  slider.classList.toggle('empty',total<=1);
}
function renderTimeMachineWorldLines(){
  const life=(historyState&&historyState.life)==='reinc'?'reinc':'real';
  const real=historySnapshotForLife('real');
  const reinc=historySnapshotForLife('reinc');
  if(tmWorldReal)tmWorldReal.classList.toggle('active',life==='real');
  if(tmWorldReinc)tmWorldReinc.classList.toggle('active',life==='reinc');
  applySliderSnapshot(timeMachineSliderReal,real,life==='real');
  applySliderSnapshot(timeMachineSliderReinc,reinc,life==='reinc');
  renderMarksFor(timeMachineMarksReal,real);
  renderMarksFor(timeMachineMarksReinc,reinc);
}
function renderTimeMachineInsertionMarks(){renderTimeMachineWorldLines();}
function applyMode(mode,value,force,line,nextMarkerOn,nextHistory,nextColor,nextFlipMinusColor,nextFlipPlusColor,nextNavDepth,nextAnchor){const nextMode=mode||'new';const nextValue=value||'';const modeChanged=nextMode!==currentMode;currentMode=nextMode;currentValue=nextValue;currentLine=line||'';if(typeof nextMarkerOn==='boolean')markerOn=nextMarkerOn;if(nextHistory)historyState=nextHistory;if(force||modeChanged||!draftDirty){currentColor=(nextColor||'');draftColor=currentColor;}flipMinusColor=nextFlipMinusColor||'';flipPlusColor=nextFlipPlusColor||'';if(typeof nextNavDepth==='number'&&Number.isFinite(nextNavDepth)){navMeDepthValue=Math.max(0,Math.min(99,Math.trunc(nextNavDepth)));}renderColorButton();renderAnchorButton(nextAnchor);const r=currentMode==='rename';if(meTitleWord){meTitleWord.classList.toggle('pending',!r);meTitleWord.style.color=r?colorHex(draftColor||currentColor||'G'):'';}if(membranePanel)membranePanel.classList.toggle('hidden',!r&&!inMembraneState);if(colorRow)colorRow.classList.toggle('hidden',!r&&!inMembraneState);renderMembraneTargetPanel();if(setBtn)setBtn.textContent=r?'Set':'Create';lineBtn.classList.toggle('on',markerOn);const n=historyState&&typeof historyState.index==='number'?historyState.index:0;const total=historyState&&typeof historyState.total==='number'?historyState.total:0;if(lineMeter){lineMeter.textContent='('+n+'/'+total+')';lineMeter.title='Time Machine Me: Line history '+n+' / '+total;}renderTimeMachineWorldLines();if(timeMachineIndex){timeMachineIndex.max=String(Math.max(total,1));timeMachineIndex.value=String(Math.max(n,1));timeMachineIndex.disabled=total<=0;}if(timeMachineTotal){timeMachineTotal.textContent='/ '+total;}if(timeMachineClear){timeMachineClear.disabled=total<=0;timeMachineClear.classList.toggle('disabled',timeMachineClear.disabled);}const _ht=((historyState&&historyState.total)||0);if(histBack){histBack.disabled=_ht<2;histBack.classList.toggle('wrap-edge',_ht>=2&&!(historyState&&historyState.canBack));}if(histForward){histForward.disabled=_ht<2;histForward.classList.toggle('wrap-edge',_ht>=2&&!(historyState&&historyState.canForward));}if(force||modeChanged||!draftDirty){draftName=currentValue||'';draftDirty=false;if(document.activeElement!==input||force||modeChanged)input.value=draftName;}else if(document.activeElement!==input){input.value=draftName;}if(force||document.activeElement!==lineInput)lineInput.value=currentLine||'';if(typeof renderEditPanelMode==='function')renderEditPanelMode();}
function escText(s){return String(s||'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));}
function tocKeyFromInputValue(v){let s=String(v||'').trim();let m=s.match(/^\{[^}]*\}\s*⇒\s*\{([^}]*)\}\s*$/);if(!m)m=s.match(/^⇒\s*\{([^}]*)\}\s*$/);if(!m)m=s.match(/^⇄\s*\{([^}]*)\}\s*$/);if(!m)m=s.match(/^\{[^}]*\}\s*⇒\s*Me\s*⇒\s*\{([^}]*)\}\s*$/);if(!m)m=s.match(/^Me\s*⇒\s*\{([^}]*)\}\s*$/);if(m){s=m[1].trim();}else{s=s.replace(/^⇄\s*/,'').trim();}const i=s.indexOf('//');if(i>=0)s=s.slice(0,i).trim();return s;}
let selectedTocLine0=null;
let tocLastSelectLine0=null;
let tocLastSelectAt=0;
let tocAllowCommentAutoselect=false;
let tocImeComposing=false;
let _tabNameComposing=false;
function ensureSelectedTocVisible(){const sel=document.querySelector('.fixed-toc-item.selected');if(sel&&typeof sel.scrollIntoView==='function'){sel.scrollIntoView({block:'nearest',inline:'nearest'});}}
function selectTocItem(item){if(!item)return;selectedTocLine0=Number(item.getAttribute('data-line0'));tocLastSelectLine0=selectedTocLine0;tocLastSelectAt=Date.now();document.querySelectorAll('.fixed-toc-item.selected').forEach(el=>el.classList.remove('selected'));item.classList.add('selected');ensureSelectedTocVisible();/* v0.9.766: このタブの選択をkeyで永続(globalState)。タブを切り替えて戻っても選択が残る。 */vscode.postMessage({type:'setTocSelection',key:item.getAttribute('data-key')||''});}function moveSelectedToc(delta){if(selectedTocLine0===null)return;const current=document.querySelector('.fixed-toc-item.selected');if(!current)return;const next=delta<0?current.previousElementSibling:current.nextElementSibling;if(!(next&&next.classList&&next.classList.contains('fixed-toc-item'))){return;}const fromLine0=Number(current.getAttribute('data-line0'));const toLine0=Number(next.getAttribute('data-line0'));selectedTocLine0=toLine0;tocLastSelectLine0=selectedTocLine0;tocLastSelectAt=Date.now();document.querySelectorAll('.fixed-toc-item.selected').forEach(el=>el.classList.remove('selected'));next.classList.add('selected');ensureSelectedTocVisible();vscode.postMessage({type:'moveTocItem',line0:fromLine0,delta});}
function renderNavTocState(hasToc){if(navToc){navToc.textContent='TOP';navToc.title='TOP — jump to top of file';navToc.classList.remove('toc-mode');navToc.classList.add('top-mode');navToc.disabled=false;navToc.classList.remove('disabled');}if(navCreateToc){navCreateToc.classList.toggle('hidden',!!hasToc);navCreateToc.disabled=!!hasToc;}}
function renderHyperTocTabs(toc){
  if(!tocTabRow)return;
  const tabs=(toc&&Array.isArray(toc.tabs))?toc.tabs:[];
  if(!tabs.length){tocTabRow.innerHTML='';return;}
  const tabsHtml=tabs.map(t=>{
    const active=t.active?' active':'';
    const name=escText(t.name||'Hyper TOC');
    const count=Number(t.itemCount||0);
    return '<div class="toc-tab'+active+'" draggable="true" data-tab-idx="'+String(t.idx)+'" data-tip="'+name+' ('+count+' items) — drag to reorder">'+name+'</div>';
  }).join('');
  const opsHtml='<div class="toc-tab-ops"><button class="toc-tab-btn" id="toc-tab-add" data-tip="Duplicate this tab">＋</button><button class="toc-tab-btn" id="toc-tab-del" data-tip="Delete this tab">−</button></div>';
  tocTabRow.innerHTML=tabsHtml+opsHtml;
}
function pinRowHtml(toc){const cm=toc&&toc.currentMembrane;if(!cm)return '';const nm=escText(cm.name||'(無名)');const b=cm.delta?('[Δ'+(cm.delta>0?'+':'')+cm.delta+']'):'';const titleTip=escText('Shows the membrane the cursor is in now. Click here to jump among 3 points: open membrane, close membrane, cursor position.');const toggleTip=escText('Toggle fold/unfold this membrane (▼⇄▼▲). Works even when the cursor is inside the membrane.');
  // v0.9.757: "From Out To 🟢" checkbox+glyph removed (俊克 am07:04) — the 🟢 jump system is
  // retired in favour of the bookmark (栞) and the ▼⇄▼▲ toggle. Pin keeps title/name/Ln + toggle.
  return '<div class="toc-pin"><span class="toc-pin-emoji">📍</span><span class="toc-pin-title" data-tip="'+titleTip+'">Current Me</span> <span class="toc-pin-name" data-tip="'+titleTip+'">'+nm+'</span> <span class="toc-pin-ln" data-tip="'+titleTip+'">(Ln '+cm.start+'-'+cm.end+'='+cm.total+b+')</span><span class="toc-pin-access" data-tip="この膜へのアクセス回数(膜に入る度+1・ソース不変。将来バッジへ統合)">\uD83D\uDCCAN='+(cm.accessText||'0')+'</span><button class="toc-pin-toggle" style="color:'+(cm.color||'#888')+'" data-line="'+cm.start+'" data-tip="'+toggleTip+'">▼⇄▼▲</button></div>'+meCharRowHtml(cm);}
/* v0.9.807: ★課題3 — char counter row at the BOTTOM edge of the Current Me Pin.
   No target → plain count + ΔChar. Target set → progress bar (0-70% blue → blends to green
   approaching 100% → orange when over = wrote past the target) + ΔChar at the right end.
   ΔChar color: + orange / − green (cutting words can be the goal too — 俊克 am11:06). */
let __meCharCur={chars:0,target:null};
function meCharRowHtml(cm){if(!cm||cm.chars===undefined||cm.chars===null)return '';const chars=Number(cm.chars)||0;const target=(cm.charTarget===null||cm.charTarget===undefined)?null:Number(cm.charTarget);__meCharCur={chars,target};const d=Number(cm.charDelta)||0;const dCls=d>0?'plus':(d<0?'minus':'zero');const dTxt='ΔChar '+(d>0?'+':'')+d.toLocaleString('en-US');const rowTip=escText('Chars in this membrane (strikethrough excluded, newlines included). ΔChar = change since the baseline. Click to set a target / reset the baseline.');let left;if(target&&target>0){const pRaw=chars/target*100;const p=Math.min(100,pRaw);let col;if(pRaw>100)col='#f59e0b';else if(pRaw<70)col='#3794ff';else col='color-mix(in srgb,#16a34a '+Math.round((pRaw-70)/30*100)+'%,#3794ff)';left='<div class="me-char-bar'+(pRaw>100?' over':'')+'" data-tip="'+rowTip+'"><div class="me-char-fill" style="width:'+p.toFixed(1)+'%;background:'+col+'"></div><span class="me-char-bar-label">'+(pRaw>100?'<span class="me-char-num-over">'+chars.toLocaleString('en-US')+'</span>':'<span class="me-char-pill" style="color:'+col+'">'+chars.toLocaleString('en-US')+'</span>')+' / '+target.toLocaleString('en-US')+'<span class="me-char-pct"><span class="pct-paren">(</span><span'+(pRaw>100?' class="me-char-pct-over"':' class="me-char-pill" style="color:'+col+'"')+'>'+Math.round(pRaw)+'</span><span class="pct-paren">%)</span></span></span></div>';}else{left='<span class="me-char-count" data-tip="'+rowTip+'">'+chars.toLocaleString('en-US')+' chars</span>';}return '<div class="toc-pin-chars" id="toc-pin-chars" data-tip="'+rowTip+'">'+left+'<span class="me-char-delta '+dCls+'">'+dTxt+'</span></div>';}
function bidiJumpBarHtml(toc){const greenActive=!!(toc&&toc.greenActive);const redActive=!!(toc&&toc.redActive);const gCls='bidi-btn bidi-green'+(greenActive?'':' inactive');const rCls='bidi-btn bidi-red'+(redActive?'':' inactive');const gTip=greenActive?'S-click: jump open ⇔ close of active 🟢 pair':'No active 🟢 pair (select a membrane name in body to arm)';const rTip=redActive?'S-click: jump source ⇔ target of active 🔴 pair':'No active 🔴 pair (select citation text or click an H-TOC entry to arm)';return '<div class="bidi-jump-bar"><span class="bidi-label">Bi-direction Jump:</span><span class="'+gCls+'" data-tip="'+escText(gTip)+'">🟢</span><span class="bidi-sep">/</span><span class="'+rCls+'" data-tip="'+escText(rTip)+'">🔴</span><span class="bidi-btn bidi-clear" data-tip="このファイルの 🟢/🔴 ジャンプフラグを全消去（初期化／デバッグ用・Cmd+Zで復元）">Clear</span><span class="bidi-jumponly">(Jump only / S-click)</span></div>';}
function renderFixedToc(toc){if(!fixedToc)return;renderNavTocState(!!(toc&&toc.hasToc));fixedToc.classList.toggle('on',!!(toc&&toc.enabled));if(!toc||!toc.enabled)return;renderHyperTocTabs(toc);if(fixedTocName&&document.activeElement!==fixedTocName)fixedTocName.value=toc.tocName||'';const items=(toc.items||[]);if(tocPinBar)tocPinBar.innerHTML=pinRowHtml(toc);/* v0.9.766: このタブの保存済み選択(selKey)をkeyで照合して復元。タブ切替時もそのタブの選択が戻る。 */if(toc.selKey){const _f=items.find(it=>String(it.key)===String(toc.selKey));selectedTocLine0=_f?Number(_f.line0):null;}else{selectedTocLine0=null;}if(!items.length){fixedTocBody.innerHTML='<div class="fixed-toc-empty">Hyper TOC is empty. Press ＋ to add one.</div>';selectedTocLine0=null;return;}fixedTocBody.innerHTML=items.map(it=>{const checked=it.checkedAt?' checked':'';const parts=[];if(it.createdAt)parts.push('Created: '+escText(it.createdAt));if(Array.isArray(it.checkLog)&&it.checkLog.length){it.checkLog.forEach(e=>{if(e&&e.at)parts.push((e.label||(e.checked?'Checked':'Unchecked'))+': '+escText(e.at));});}else if(it.checkedAt){parts.push('Checked: '+escText(it.checkedAt));}if(it.citeN!==null&&it.citeN!==undefined)parts.push('Cite #'+escText(String(it.citeN)));const tip=parts.length?parts.join(' | '):('Line '+it.line);const val=escText(it.value||it.label||it.key||'');const _dn=escText(it.key||'');const _fv=String(it.value||it.key||'');const _ci=_fv.indexOf('//');const _dc=_ci>=0?escText(_fv.slice(_ci+2).trim()):'';const _dispHtml=_dc?(_dn+'<span class="toc-sep"> // </span><span class="toc-comment">'+_dc+'</span>'):_dn;const sel=(selectedTocLine0!==null&&Number(it.line0)===selectedTocLine0)?' selected':'';const citeAttr=(it.citeN!==null&&it.citeN!==undefined)?(' data-cite-n="'+escText(String(it.citeN))+'"'):'';return '<div class="fixed-toc-item'+sel+'" data-key="'+escText(it.key||'')+'" data-state-key="'+escText(it.stateKey||it.key||'')+'" data-line0="'+String(it.line0)+'"'+citeAttr+' data-tip="'+tip+'"><input class="toc-check" type="checkbox"'+checked+' data-tip="CheckTimeBox(CTB)"/><span class="toc-field"><input class="toc-value" value="'+val+'" data-tip="'+tip+'"/><span class="toc-disp" aria-hidden="true">'+_dispHtml+'</span></span></div>'}).join('');setTimeout(ensureSelectedTocVisible,0);}
let standardsOn=true;
function renderStandardsToggle(){if(!standardsToggle)return;standardsToggle.classList.toggle('on',standardsOn);standardsToggle.classList.toggle('off',!standardsOn);const lab=standardsToggle.querySelector('.standards-label');if(lab)lab.textContent='Standards > v';standardsToggle.title=standardsOn?'Standards ON (default): native > / v folding controls are visible. Recommended OFF for cleaner MeOS membrane control.':'Standards OFF: native > / v folding controls are hidden. MeOS membrane controls are prioritized.';}
if(standardsToggle)standardsToggle.addEventListener('click',()=>{standardsOn=!standardsOn;renderStandardsToggle();vscode.postMessage({type:'toggleStandards',enabled:standardsOn});});
if(timeMachineTrigger)timeMachineTrigger.addEventListener('click',()=>{if(timeMachinePanel)timeMachinePanel.classList.toggle('on');});
let timeMachineJumpTimer=null;
function jumpTimeMachineIndex(value){const n=parseInt(String(value||''),10);if(!Number.isFinite(n))return;clearTimeout(timeMachineJumpTimer);timeMachineJumpTimer=setTimeout(()=>vscode.postMessage({type:'lineHistoryJumpIndex',index:n}),120);}
function activeTmLife(){return (historyState&&historyState.life)==='reinc'?'reinc':'real';}
function switchTmLife(life){vscode.postMessage({type:'timeMachineLifeSwitch',life:life==='reinc'?'reinc':'real'});}
function handleWorldSliderInput(life,slider){if(activeTmLife()!==life){switchTmLife(life);return;}if(timeMachineIndex)timeMachineIndex.value=slider.value;jumpTimeMachineIndex(slider.value);}
function primeTmLifeSwitch(life,ev){
  if(activeTmLife()===life)return false;
  if(ev){ev.preventDefault();ev.stopPropagation();}
  switchTmLife(life);
  return true;
}
if(timeMachineSliderReal)timeMachineSliderReal.addEventListener('pointerdown',ev=>primeTmLifeSwitch('real',ev),true);
if(timeMachineSliderReinc)timeMachineSliderReinc.addEventListener('pointerdown',ev=>primeTmLifeSwitch('reinc',ev),true);
if(timeMachineSliderReal)timeMachineSliderReal.addEventListener('input',()=>handleWorldSliderInput('real',timeMachineSliderReal));
if(timeMachineSliderReinc)timeMachineSliderReinc.addEventListener('input',()=>handleWorldSliderInput('reinc',timeMachineSliderReinc));
if(tmWorldReal)tmWorldReal.addEventListener('pointerdown',ev=>primeTmLifeSwitch('real',ev),true);
if(tmWorldReinc)tmWorldReinc.addEventListener('pointerdown',ev=>primeTmLifeSwitch('reinc',ev),true);
if(tmWorldReal)tmWorldReal.addEventListener('click',ev=>{if(activeTmLife()!=='real'){ev.preventDefault();switchTmLife('real');}});
if(tmWorldReinc)tmWorldReinc.addEventListener('click',ev=>{if(activeTmLife()!=='reinc'){ev.preventDefault();switchTmLife('reinc');}});
if(timeMachineIndex)timeMachineIndex.addEventListener('change',()=>jumpTimeMachineIndex(timeMachineIndex.value));
if(timeMachineIndex)timeMachineIndex.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();jumpTimeMachineIndex(timeMachineIndex.value);}});
if(timeMachineClear)timeMachineClear.addEventListener('click',()=>{if(timeMachineClear.disabled)return;vscode.postMessage({type:'lineHistoryClear'});});
if(navToc)navToc.addEventListener('click',()=>{if(navToc.disabled)return;vscode.postMessage({type:'navCenterTocOrTop'});});
if(navCreateToc)navCreateToc.addEventListener('click',()=>{if(navCreateToc.disabled)return;vscode.postMessage({type:'navCenterCreateToc'});});
if(navMeWarp)navMeWarp.addEventListener('click',()=>{navMeMode='warp';navMeDepthValue=0;renderMeNavMode();revealTimeMachineFromNavMode();vscode.postMessage({type:'navMeWorldChanged',mode:navMeMode,depth:navMeDepthValue});});
if(navMeSubmarine)navMeSubmarine.addEventListener('click',()=>{navMeMode='submarine';navMeDepthValue=Math.min(9,navMeDepthValue+1);renderMeNavMode();revealTimeMachineFromNavMode();vscode.postMessage({type:'navMeWorldChanged',mode:navMeMode,depth:navMeDepthValue});});
if(navMeMinus)navMeMinus.addEventListener('click',()=>vscode.postMessage({type:'navMeFlipMinus',mode:navMeMode,depth:navMeDepthValue}));
if(navMePlus)navMePlus.addEventListener('click',()=>vscode.postMessage({type:'navMeFlipPlus',mode:navMeMode,depth:navMeDepthValue}));
function meCockpitKeyCruise(ev){const t=ev&&ev.target;if(!t)return;const cockpit=t.closest&&t.closest('#me-nav-switch,.me-flip-row');if(!cockpit)return;if(ev.key==='ArrowUp'){ev.preventDefault();if(navMeMinus)navMeMinus.click();}else if(ev.key==='ArrowDown'){ev.preventDefault();if(navMePlus)navMePlus.click();}}
document.addEventListener('keydown',meCockpitKeyCruise,true);
if(navEof)navEof.addEventListener('click',()=>vscode.postMessage({type:'navCenterEof'}));
if(navHeadPrev)navHeadPrev.addEventListener('click',()=>{window.__navOnly='head';vscode.postMessage({type:'navHeadJump',dir:-1});});
if(navHeadNext)navHeadNext.addEventListener('click',()=>{window.__navOnly='head';vscode.postMessage({type:'navHeadJump',dir:1});});
const MEOS_KNOB_PAL={red:'rgba(200,40,40,1)',orange:'rgba(210,120,20,1)',yellow:'rgba(180,150,0,1)',green:'rgba(40,150,60,1)',blue:'rgba(40,110,210,1)',purple:'rgba(150,70,210,1)',pink:'rgba(210,60,150,1)',navy:'rgba(20,30,120,1)',aqua:'rgba(0,160,210,1)',maroon:'rgba(150,20,20,1)',white:'#ffffff',black:'#222222'};
function applyKnobColor(k,fg,bg){if(!k)return;const o=(bg&&MEOS_KNOB_PAL[bg])||'';const i=(fg&&MEOS_KNOB_PAL[fg])||'';if(o)k.style.setProperty('--knob-o',o);else k.style.removeProperty('--knob-o');if(i)k.style.setProperty('--knob-i',i);else k.style.removeProperty('--knob-i');}
/* v0.9.99930: スクロールバーに全ターゲットのtick(外=bg色/中=fg色の3本線)。差分時のみ再描画。 */
function renderTicks(id,ticks){const el=document.getElementById(id);if(!el)return;const arr=ticks||[];const sig=arr.map(function(t){return Math.round(t.p*1000)+':'+(t.f||'')+':'+(t.b||'');}).join(',');if(el.__sig===sig)return;el.__sig=sig;let h='';for(var i=0;i<arr.length;i++){var t=arr[i];var top=(8+t.p*84);var o=(t.b&&MEOS_KNOB_PAL[t.b])||'transparent';var ii=(t.f&&MEOS_KNOB_PAL[t.f])||(t.b?'#ffffff':'rgba(150,150,150,.9)');h+='<span class="tk" style="top:'+top+'%;--tk-o:'+o+';--tk-i:'+ii+'"></span>';}el.innerHTML=h;}
function renderHeadNav(st){if(!navHeadPrev||!navHeadNext)return;const c=(st&&st.count)||0,idx=(st&&st.index)||0,off=c<1;/* v0.9.926: 見出し1つでも有効化(俊克 6/17) */navHeadPrev.disabled=off;navHeadNext.disabled=off;navHeadPrev.classList.toggle('wrap-edge',!!(st&&st.minusWraps));navHeadNext.classList.toggle('wrap-edge',!!(st&&st.plusWraps));/* v0.9.99924: 縦位置ゲージ(二重丸ノブ)＝何番目を視覚化・数字はtip */if(navHeadLabel)navHeadLabel.textContent='#';window.__navHeadCount=c;renderTicks('nav-ticks-head',st&&st.ticks);/* v0.9.99930: 全見出しtick＋灰ノブ */const m=document.getElementById('nav-scroll-head');if(m){if(c<1){m.classList.add('empty');m.removeAttribute('data-pct');}else{m.classList.remove('empty');const lp=(st&&typeof st.linePct==='number')?st.linePct:0;const repos=(window.__navOnly==='head')||!m.hasAttribute('data-pct');if(repos&&!window.__dragNav){m.style.top=(8+lp*84)+'%';m.setAttribute('data-pct',String(lp));m.setAttribute('data-tip','# 見出し '+(idx||0)+' / '+c);}m.title=m.getAttribute('data-tip')||('# 見出し '+(idx||0)+' / '+c);}}const grp=navHeadPrev.closest?navHeadPrev.closest('.nav-head-group'):null;if(grp)grp.title=(c>0?('見出し '+(idx||0)+'＃'+c+'  —  '):'')+'Jump between ##[…]## headings within the current membrane.';}
if(navMarkPrev)navMarkPrev.addEventListener('click',()=>{window.__navOnly='mark';vscode.postMessage({type:'navMarkJump',dir:-1});});
if(navMarkNext)navMarkNext.addEventListener('click',()=>{window.__navOnly='mark';vscode.postMessage({type:'navMarkJump',dir:1});});
function renderMarkNav(st){if(!navMarkPrev||!navMarkNext)return;const c=(st&&st.count)||0,idx=(st&&st.index)||0,tot=(st&&st.total)||0,off=c<1;/* v0.9.929: 💬も1つで有効化 */navMarkPrev.disabled=off;navMarkNext.disabled=off;navMarkPrev.classList.toggle('wrap-edge',!!(st&&st.minusWraps));navMarkNext.classList.toggle('wrap-edge',!!(st&&st.plusWraps));/* v0.9.99924: 縦位置ゲージ(二重丸ノブ)＝未チェックの何番目を視覚化・数字はtip */if(navMarkLabel)navMarkLabel.textContent='💬';window.__navMarkCount=c;renderTicks('nav-ticks-mark',st&&st.ticks);/* v0.9.99930: 全未チェック注釈tick＋灰ノブ */const m=document.getElementById('nav-scroll-mark');if(m){if(c<1){m.classList.add('empty');m.removeAttribute('data-pct');}else{m.classList.remove('empty');const lp=(st&&typeof st.linePct==='number')?st.linePct:0;const repos=(window.__navOnly==='mark')||!m.hasAttribute('data-pct');if(repos&&!window.__dragNav){m.style.top=(8+lp*84)+'%';m.setAttribute('data-pct',String(lp));m.setAttribute('data-tip','💬 注釈 '+(idx||0)+' / '+c);}m.title=m.getAttribute('data-tip')||('💬 注釈 '+(idx||0)+' / '+c);}}const grp=navMarkPrev.closest?navMarkPrev.closest('.mark-nav'):null;if(grp)grp.title=(c>0?('未チェック '+(idx||0)+'＃'+c+(tot>c?('（全'+tot+'）'):'')+'  —  '):'')+'Jump between review notes (highlights / strikethroughs) in the current membrane.';}
/* v0.9.99927: 統一スクロールバーのドラッグ→N番目へジャンプ(俊克 6/27 pm06:48) */
(function(){const track=document.getElementById('nav-scroll');if(!track)return;const headM=document.getElementById('nav-scroll-head'),markM=document.getElementById('nav-scroll-mark');function frac(ev){const r=track.getBoundingClientRect();return Math.max(0,Math.min(1,(ev.clientY-r.top)/Math.max(1,r.height)));}function nOf(f,cnt){return cnt<=1?1:Math.round(f*(cnt-1))+1;}let drag=null;function down(which){return function(ev){const cnt=which==='head'?(window.__navHeadCount||0):(window.__navMarkCount||0);if(cnt<1)return;ev.preventDefault();ev.stopPropagation();drag=which;window.__dragNav=true;try{ev.target.setPointerCapture&&ev.target.setPointerCapture(ev.pointerId);}catch(_){}};}if(headM)headM.addEventListener('pointerdown',down('head'));if(markM)markM.addEventListener('pointerdown',down('mark'));document.addEventListener('pointermove',function(ev){if(!drag)return;const el=drag==='head'?headM:markM;if(el)el.style.top=(8+frac(ev)*84)+'%';});document.addEventListener('pointerup',function(ev){if(!drag)return;const cnt=drag==='head'?(window.__navHeadCount||0):(window.__navMarkCount||0);const f=frac(ev);if(cnt>0){window.__navOnly=drag;vscode.postMessage({type:drag==='head'?'navHeadJumpTo':'navMarkJumpTo',frac:f});}drag=null;window.__dragNav=false;});track.addEventListener('pointerdown',function(ev){if(ev.target!==track)return;const f=frac(ev);const hc=window.__navHeadCount||0;if(hc>0){window.__navOnly='head';vscode.postMessage({type:'navHeadJumpTo',frac:f});}else{const mc=window.__navMarkCount||0;if(mc>0){window.__navOnly='mark';vscode.postMessage({type:'navMarkJumpTo',frac:f});}}});})();
if(navAnchor){
  // v0.9.584: unified S-click=JUMP / W-click=RAW. S-click → navCenterMeDouble
  // (open ⇔ close jump). W-click → navCenterMeSingle (mSkeletonMode toggle).
  // Timer disambiguates click vs dblclick. v0.9.586: navAnchor is now a span
  // with .inactive class (was a <button> with .disabled). Check the class
  // instead of the disabled property.
  let navAnchorClickTimer=0;
  navAnchor.addEventListener('click',()=>{
    if(navAnchor.classList.contains('inactive'))return;
    clearTimeout(navAnchorClickTimer);
    navAnchorClickTimer=setTimeout(()=>vscode.postMessage({type:'navCenterMeDouble'}),220);
  });
  navAnchor.addEventListener('dblclick',ev=>{
    if(navAnchor.classList.contains('inactive'))return;
    ev.preventDefault();
    clearTimeout(navAnchorClickTimer);
    vscode.postMessage({type:'navCenterMeSingle'});
  });
}

// v0.9.584: same swap on Me Dock 🔴 (navBidi). S-click → navCenterBidiDouble
// (source ⇔ target jump). W-click → navCenterBidi (raw toggle).
// v0.9.586: span+class form, same as navAnchor.
if(navBidi){let navBidiClickTimer=0;navBidi.addEventListener('click',()=>{if(navBidi.classList.contains('inactive'))return;clearTimeout(navBidiClickTimer);navBidiClickTimer=setTimeout(()=>vscode.postMessage({type:'navCenterBidiDouble'}),220);});navBidi.addEventListener('dblclick',ev=>{ev.preventDefault();if(navBidi.classList.contains('inactive'))return;clearTimeout(navBidiClickTimer);vscode.postMessage({type:'navCenterBidi'});});}
// v0.9.631: [Clear] — wipe all 🟢/🔴 jump flags in the active file (reset/debug).
const navClear=document.getElementById('nav-clear');
if(navClear){navClear.addEventListener('click',()=>{vscode.postMessage({type:'clearAllJumps'});});}
renderStandardsToggle();
const zoomMeLoad=document.getElementById('zoom-me-load'),zoomMeStatus=document.getElementById('zoom-me-status'),zoomMeModeBtn=document.getElementById('zoom-me-mode');
let zoomMeMode='"0"';
let zoomLineStartValue='"0"',zoomLineEndValue='"0"',zoomMembraneNameValue='"0"',zoomMembraneCountValue='"0"';
function saveZoomMeCurrentValues(){const zs=document.getElementById('zoom-me-start'),ze=document.getElementById('zoom-me-end');if(!zs||!ze)return;if(zoomMeMode==='me'){zoomMembraneNameValue=zs.value;zoomMembraneCountValue=ze.value;}else{zoomLineStartValue=zs.value;zoomLineEndValue=ze.value;}}
function renderZoomMeLoaded(label){if(zoomMeStatus)zoomMeStatus.innerHTML='';renderZoomScopeIndicator(label||'1〜EOF');}
function applyZoomMeMode(mode,keepValues){if(!keepValues)saveZoomMeCurrentValues();zoomMeMode=mode==='me'?'me':'line';const zs=document.getElementById('zoom-me-start'),ze=document.getElementById('zoom-me-end'),sep=document.getElementById('zoom-me-sep');if(zoomMeModeBtn)zoomMeModeBtn.textContent=zoomMeMode==='me'?'Me':'Line';if(zs){zs.classList.toggle('me-mode-name',zoomMeMode==='me');zs.inputMode=zoomMeMode==='me'?'text':'numeric';zs.value=zoomMeMode==='me'?zoomMembraneNameValue:zoomLineStartValue;}if(ze){ze.classList.toggle('me-mode-count',zoomMeMode==='me');ze.inputMode='numeric';ze.value=zoomMeMode==='me'?zoomMembraneCountValue:zoomLineEndValue;}if(sep)sep.textContent=zoomMeMode==='me'?'+':'〜';}
applyZoomMeMode(zoomMeMode,true);renderZoomScopeIndicator('"0"');renderEditPanelMode();
if(editModeSelect)editModeSelect.addEventListener('change',()=>{if(editModeSelect.value==='reference'){/* v0.9.99968: Reference Me=作成フローはnode側QuickPickで実行し、選択は元のモードへ即戻す(パネル大改造を避ける=v918教訓) */vscode.postMessage({type:'referenceMeCreate'});editModeSelect.value=(editPanelMode==='zoom')?'zoom':'edit';return;}editPanelMode=editModeSelect.value==='zoom'?'zoom':'edit';renderEditPanelMode();});
if(zoomMeModeBtn)zoomMeModeBtn.addEventListener('click',()=>{applyZoomMeMode(zoomMeMode==='me'?'line':'me',false);});
['zoom-me-start','zoom-me-end'].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener('input',saveZoomMeCurrentValues);});
if(zoomMeLoad)zoomMeLoad.addEventListener('click',()=>{saveZoomMeCurrentValues();vscode.postMessage({type:'zoomMeLoad',mode:zoomMeMode,start:document.getElementById('zoom-me-start')?document.getElementById('zoom-me-start').value:'1',end:document.getElementById('zoom-me-end')?document.getElementById('zoom-me-end').value:'EOF'});});
if(closeButton)closeButton.addEventListener('click',()=>vscode.postMessage({type:'close'}));
/* v0.9.707: 書式ボタン(== ハイライト / ~~ 取消線 / ## 見出し)。選択を記法で包む。 */
const fmtHighlight=document.getElementById('fmt-highlight'),fmtStrike=document.getElementById('fmt-strike'),fmtHeading=document.getElementById('fmt-heading');
// v0.9.879: 各Formatボタン右の「V」→(文字色/背景色)2スロット→各スロットでパレット(ミーピー左目と同方式)。
/* v0.9.99936/99939: 見出しはH1/H2/H3・==/~~は3スロット色を↻で切替(俊克 6/28) */
const fmtHeadingColors={1:{fg:'白',bg:'緑'},2:{fg:'白',bg:'緑'},3:{fg:'白',bg:'緑'}};let fmtHeadingLevel=2;
const fmtHlSlots=[{fg:'赤',bg:'黄'},{fg:'赤',bg:'黄'},{fg:'赤',bg:'黄'}];let fmtHlIdx=0;
const fmtStSlots=[{fg:'赤',bg:''},{fg:'赤',bg:''},{fg:'赤',bg:''}];let fmtStIdx=0;
const fmtSpec={highlight:fmtHlSlots[0],strike:fmtStSlots[0],heading:fmtHeadingColors[2]};
/* v0.9.99938: Format色設定をmMETAへ随伴保存(変更のたびにnodeへ送る) */function pushFmt(){try{vscode.postMessage({type:'saveFmt',fmt:{highlight:fmtHlSlots,hlIdx:fmtHlIdx,strike:fmtStSlots,stIdx:fmtStIdx,heading:fmtHeadingColors,level:fmtHeadingLevel}});}catch(_){}}
const FMT_FG=[['赤','#d22828'],['橙','#d77814'],['黄','#b49600'],['緑','#28963c'],['青','#286ed2'],['紫','#9646d2'],['桃','#d23c96'],['黒','#222222'],['白','#f5f5f5'],['灰','#828282'],['紺','#000080'],['水','#00bfff'],['ワイン','#800000']];
const FMT_BG=[['なし',''],['赤','#e13737'],['橙','#ffa028'],['黄','#ffe600'],['緑','#37a546'],['青','#3c7deb'],['紫','#be82f5'],['桃','#ff82c8'],['紺','#192387'],['水','#2dbef0'],['ワイン','#96232d']];
const FMT_EN={'赤':'red','橙':'orange','黄':'yellow','緑':'green','青':'blue','紫':'purple','桃':'pink','黒':'black','白':'white','灰':'gray','紺':'navy','水':'aqua','ワイン':'maroon','なし':'none'}; /* v0.9.934: tip英語名は小文字(入力しやすい正準形・大文字も通る) */
const fmtHexFg=w=>{const e=FMT_FG.find(x=>x[0]===w);return e?e[1]:'#888';};
const fmtHexBg=w=>{if(!w)return'transparent';const e=FMT_BG.find(x=>x[0]===w);return e?e[1]:'transparent';};
const fmtPop=document.getElementById('fmt-pop');
// v0.9.881: パレットは下端固定で上に伸ばす(ミーピー方式)・対象ボタンの真上に中央表示。(🟢/🔴)スロットは
// 常時下に表示=隠れない・非選択側は半透明。tipは英日併記で要素の真上に近接表示。fmtPopCh=null/'fg'/'bg'。
let fmtPopKind='highlight',fmtPopCh=null,fmtPopBottom=0,fmtPopCenterX=0;
const fmtChLabel=(kind,ch)=>ch==='fg'?(kind==='strike'?'Line color':'Text color'):'Background color';
function placeFmtPop(){if(!fmtPop||!fmtPop.classList.contains('on'))return;requestAnimationFrame(()=>{const h=fmtPop.offsetHeight||70,w=fmtPop.offsetWidth||130;const left=Math.min(Math.max(6,fmtPopCenterX-w/2),window.innerWidth-w-6);fmtPop.style.left=left+'px';fmtPop.style.top=Math.max(6,fmtPopBottom-h)+'px';});}
function renderFmtPop(){if(!fmtPop)return;const spec=fmtSpec[fmtPopKind];let html='';if(fmtPopCh){const ch=fmtPopCh,list=ch==='fg'?FMT_FG:FMT_BG,cur=spec[ch];html+='<div class="fmt-pop-head">'+fmtChLabel(fmtPopKind,ch)+'</div><div class="fmt-grid">'+list.map(([w,hex])=>{const active=(w==='なし')?!cur:(w===cur);return '<button class="fmt-swatch'+(active?' active':'')+'" data-color="'+w+'" title="'+(FMT_EN[w]||w)+', '+w+'"><span class="fmt-ball'+(hex?'':' none')+'" style="background:'+(hex||'transparent')+'"></span></button>';}).join('')+'</div>';}const fgD=(fmtPopCh&&fmtPopCh!=='fg')?' dim':'',bgD=(fmtPopCh&&fmtPopCh!=='bg')?' dim':'';html+='<div class="fmt-slots"><button class="fmt-slot'+(fmtPopCh==='fg'?' active':'')+fgD+'" data-ch="fg" title="'+fmtChLabel(fmtPopKind,'fg')+(spec.fg?' — '+(FMT_EN[spec.fg]||spec.fg)+', '+spec.fg:'')+'"><span class="fmt-ball" style="background:'+fmtHexFg(spec.fg)+'"></span></button><span class="fmt-slot-sep">/</span><button class="fmt-slot'+(fmtPopCh==='bg'?' active':'')+bgD+'" data-ch="bg" title="Background color'+(spec.bg?' — '+(FMT_EN[spec.bg]||spec.bg)+', '+spec.bg:' — none, なし')+'"><span class="fmt-ball'+(spec.bg?'':' none')+'" style="background:'+fmtHexBg(spec.bg)+'"></span></button></div>';fmtPop.innerHTML=html;placeFmtPop();}
function openFmtPop(kind,anchor){fmtPopKind=kind;fmtPopCh=null;const r=anchor.getBoundingClientRect();fmtPopCenterX=r.left+r.width/2;fmtPopBottom=r.top-6;fmtPop.classList.add('on');renderFmtPop();}
function closeFmtPop(){if(fmtPop)fmtPop.classList.remove('on');}
document.querySelectorAll('.fmt-caret').forEach(c=>c.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();const k=c.getAttribute('data-kind');if(fmtPop.classList.contains('on')&&fmtPopKind===k){closeFmtPop();return;}const btn=(c.parentElement&&c.parentElement.querySelector('.fmt-btn'))||c;openFmtPop(k,btn);}));
if(fmtPop)fmtPop.addEventListener('click',ev=>{ev.stopPropagation();const slot=ev.target.closest?ev.target.closest('.fmt-slot'):null;const sw=ev.target.closest?ev.target.closest('.fmt-swatch'):null;if(slot){fmtPopCh=slot.getAttribute('data-ch');renderFmtPop();return;}if(sw){const w=sw.getAttribute('data-color');fmtSpec[fmtPopKind][fmtPopCh]=(w==='なし')?'':w;renderFmtPop();renderFmtBtnColors();pushFmt();return;}});
document.addEventListener('click',ev=>{if(!fmtPop||!fmtPop.classList.contains('on'))return;if(ev.target.closest&&(ev.target.closest('#fmt-pop')||ev.target.closest('.fmt-caret')))return;closeFmtPop();});
if(fmtHighlight)fmtHighlight.addEventListener('click',()=>vscode.postMessage({type:'insertFormat',kind:'highlight',fg:fmtSpec.highlight.fg,bg:fmtSpec.highlight.bg}));
if(fmtStrike)fmtStrike.addEventListener('click',()=>vscode.postMessage({type:'insertFormat',kind:'strike',fg:fmtSpec.strike.fg,bg:fmtSpec.strike.bg}));
if(fmtHeading)fmtHeading.addEventListener('click',()=>vscode.postMessage({type:'insertFormat',kind:'heading',fg:fmtSpec.heading.fg,bg:fmtSpec.heading.bg,level:fmtHeadingLevel}));
/* v0.9.99936: ↻で挿入レベルを ## → # → ### 循環＋各レベルの記憶色をロード */
const fmtHeadCycle=document.getElementById('fmt-head-cycle');if(fmtHeadCycle)fmtHeadCycle.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();fmtHeadingLevel=(fmtHeadingLevel===2)?1:(fmtHeadingLevel===1)?3:2;fmtSpec.heading=fmtHeadingColors[fmtHeadingLevel];const hh='#'.repeat(fmtHeadingLevel);if(fmtHeading){fmtHeading.textContent=hh;fmtHeading.setAttribute('data-tip','Heading (H'+fmtHeadingLevel+') | '+hh+'[ text (text/bg)//tip ]'+hh+' — ▾ picks color · ↻ cycles ## → # → ###');}renderFmtBtnColors();pushFmt();if(fmtPop&&fmtPop.classList.contains('on')&&fmtPopKind==='heading')renderFmtPop();});
/* v0.9.99939: ==・~~ も↻で3スロット色を循環 */
const fmtHlCycle=document.getElementById('fmt-hl-cycle');if(fmtHlCycle)fmtHlCycle.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();fmtHlIdx=(fmtHlIdx+1)%3;fmtSpec.highlight=fmtHlSlots[fmtHlIdx];if(fmtHighlight)fmtHighlight.textContent='='.repeat([2,1,3][fmtHlIdx]);renderFmtBtnColors();pushFmt();if(fmtPop&&fmtPop.classList.contains('on')&&fmtPopKind==='highlight')renderFmtPop();});
const fmtStCycle=document.getElementById('fmt-st-cycle');if(fmtStCycle)fmtStCycle.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();fmtStIdx=(fmtStIdx+1)%3;fmtSpec.strike=fmtStSlots[fmtStIdx];if(fmtStrike)fmtStrike.textContent='~'.repeat([2,1,3][fmtStIdx]);renderFmtBtnColors();pushFmt();if(fmtPop&&fmtPop.classList.contains('on')&&fmtPopKind==='strike')renderFmtPop();});
/* v0.9.911: Formatボタンを設定色のプレビューに(俊克 6/17 am03:21)。背景=背景色・文字=文字色。 */function renderFmtBtnColors(){const ap=(btn,k)=>{if(!btn)return;const sp=fmtSpec[k];btn.style.color=fmtHexFg(sp.fg);const bg=sp.bg?fmtHexBg(sp.bg):'';btn.style.background=bg;btn.style.borderColor=bg||'';};ap(fmtHighlight,'highlight');ap(fmtStrike,'strike');ap(fmtHeading,'heading');}renderFmtBtnColors();
const rawToggle=document.getElementById('raw-toggle');if(rawToggle)rawToggle.addEventListener('click',()=>vscode.postMessage({type:'toggleRaw'}));
/* v0.9.99914: 合言葉入力を暗号3兄弟の下(enc-pass-row)に表示。🔐/🔓で出し、Enter/Goで送信、Esc/✕で閉じ、👁で表示切替。 */
const encPassRow=document.getElementById('enc-pass-row'),encPassInput=document.getElementById('enc-pass-input'),encPassLabel=document.getElementById('enc-pass-label'),encPassEye=document.getElementById('enc-pass-eye'),encPassGo=document.getElementById('enc-pass-go'),encPassX=document.getElementById('enc-pass-x');
let _encPendingOp='';
function showEncPass(op){_encPendingOp=op;if(encPassLabel)encPassLabel.textContent=(op==='encrypt')?'🔐':'🔓';if(encPassInput){encPassInput.type='password';encPassInput.value='';encPassInput.placeholder=(op==='encrypt')?'new passphrase — Enter to lock':'passphrase — Enter to unlock';}if(encPassRow)encPassRow.style.display='flex';setTimeout(()=>{try{encPassInput&&encPassInput.focus();}catch(_){}},0);}
function hideEncPass(){if(encPassRow)encPassRow.style.display='none';if(encPassInput){encPassInput.value='';encPassInput.type='password';}_encPendingOp='';}
function submitEncPass(){const v=encPassInput?encPassInput.value:'';if(!v){hideEncPass();return;}vscode.postMessage({type:'encOp',op:_encPendingOp,pass:v});hideEncPass();}
const encLock=document.getElementById('enc-lock');if(encLock)encLock.addEventListener('click',()=>{if(encLock.classList.contains('enc-active'))showEncPass('encrypt');}); /* v0.9.99915: アクティブ(平文膜の上)の時だけ入力枠を出す */
const encUnlock=document.getElementById('enc-unlock');if(encUnlock)encUnlock.addEventListener('click',()=>{if(encUnlock.classList.contains('enc-active'))showEncPass('unlock');}); /* v0.9.99915: アクティブ(暗号膜の上)の時だけ */
if(encPassGo)encPassGo.addEventListener('click',submitEncPass);
if(encPassX)encPassX.addEventListener('click',hideEncPass);
if(encPassEye)encPassEye.addEventListener('click',()=>{if(encPassInput){encPassInput.type=(encPassInput.type==='password')?'text':'password';encPassInput.focus();}});
if(encPassInput)encPassInput.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();submitEncPass();}else if(ev.key==='Escape'){ev.preventDefault();hideEncPass();}});
const encCopy=document.getElementById('enc-copy');if(encCopy)encCopy.addEventListener('click',()=>vscode.postMessage({type:'copySecretAutoWipe'})); /* v0.9.99910: 📋 Copy & auto-clear */
window.addEventListener('message',ev=>{const m=ev.data;if(m&&m.type==='encState'){const L=document.getElementById('enc-lock'),U=document.getElementById('enc-unlock');if(L)L.classList.toggle('enc-active',!!m.onMembrane&&!m.encrypted);if(U)U.classList.toggle('enc-active',!!m.onMembrane&&!!m.encrypted);if(!m.onMembrane&&typeof hideEncPass==='function')hideEncPass();}}); /* v0.9.9994: 膜の上で平文=🔐橙/暗号=🔓白/それ以外=灰。v0.9.99915: 膜外へカーソルが出たら入力枠を消す */
const ghWizard=document.getElementById('gh-wizard'),ghWizardHead=document.getElementById('gh-wizard-head'),ghWizardToggle=document.getElementById('gh-wizard-toggle'),ghWizardStatus=document.getElementById('gh-wizard-status'),ghProfileUrl=document.getElementById('gh-profile-url'),ghPatInput=document.getElementById('gh-pat-input'),ghPatLink=document.getElementById('gh-pat-link'),ghConnectBtn=document.getElementById('gh-connect-btn'),ghFolderName2=document.getElementById('gh-folder-name2'),ghMsg=document.getElementById('gh-msg'),ghSetupForm=document.getElementById('gh-setup-form'),ghConnectedBar=document.getElementById('gh-connected-bar'),ghConnFolder=document.getElementById('gh-conn-folder'),ghConnRepo=document.getElementById('gh-conn-repo'),ghDisconnectBtn=document.getElementById('gh-disconnect-btn');
function toggleGhWizard(){if(!ghWizard)return;const willCollapse=!ghWizard.classList.contains('collapsed');ghWizard.classList.toggle('collapsed',willCollapse);vscode.postMessage({type:'githubSetCollapsed',collapsed:willCollapse});}
if(ghWizardHead)ghWizardHead.addEventListener('click',ev=>{if(ev.target&&ev.target.tagName==='INPUT')return;toggleGhWizard();});
function renderGhWizard(m){
  if(ghWizard&&m.collapsed!==undefined)ghWizard.classList.toggle('collapsed',!!m.collapsed);
  const connected=m.state==='connected'||(m.state==='sync'&&m.username&&m.repoUrl);
  if(ghWizardStatus)ghWizardStatus.textContent=connected?('✅ '+(m.username||'')+'/'+(m.repoName||'')):'(not connected)';
  if(ghSetupForm)ghSetupForm.style.display=connected?'none':'flex';
  if(ghConnectedBar)ghConnectedBar.style.display=connected?'flex':'none';
  if(connected){if(ghConnFolder)ghConnFolder.textContent=m.folderName||'';if(ghConnRepo){ghConnRepo.textContent=(m.username||'')+'/'+(m.repoName||'');ghConnRepo.title=m.repoUrl||'';}return;}
  // 未接続フォーム
  ghNoFolder=!m.folderName;
  ghHasPat=!!m.hasPat; // v0.9.985: 保存済みPATがあればPAT欄は任意(空欄で再利用)
  if(ghFolderName2){if(m.folderName){ghFolderName2.textContent=m.folderName;ghFolderName2.title=m.folderPath||'';ghFolderName2.classList.remove('none');}else{ghFolderName2.textContent='Open a folder first (File → Open Folder)';ghFolderName2.classList.add('none');}}
  // v0.9.985: URLを前回値でプリフィル(空欄かつ未フォーカス時のみ)・PATが保存済みならプレースホルダで案内
  if(ghProfileUrl&&!ghProfileUrl.value&&m.savedUrl&&document.activeElement!==ghProfileUrl)ghProfileUrl.value=m.savedUrl;
  if(ghPatInput)ghPatInput.placeholder=ghHasPat?'PAT saved ✓ — leave blank to reuse':'PAT (ghp_...)';
  if(ghMsg){if(m.state==='progress'){ghMsg.textContent=m.msg||'…';ghMsg.classList.remove('err');}else if(m.state==='error'){ghMsg.textContent='⚠ '+(m.msg||'failed');ghMsg.classList.add('err');if(ghConnectBtn)ghConnectBtn.textContent='Connect & Create Repo';}else{ghMsg.textContent='';ghMsg.classList.remove('err');}}
  updateGhFormState();
}
// v0.9.979: 入力状態でボタンの有効/無効を制御。① URL未入力→Get PAT薄く ② PAT未入力(かつ保存無し) or フォルダ無し→Connect薄く
let ghNoFolder=true,ghHasPat=false;
function updateGhFormState(){
  const url=(ghProfileUrl&&ghProfileUrl.value.trim())||'';
  const pat=(ghPatInput&&ghPatInput.value.trim())||'';
  if(ghPatLink)ghPatLink.disabled=!url; // Get PAT: URL入力後に有効化
  if(ghConnectBtn&&ghConnectBtn.textContent!=='Connecting…')ghConnectBtn.disabled=ghNoFolder||!url||(!pat&&!ghHasPat);
}
if(ghProfileUrl)ghProfileUrl.addEventListener('input',updateGhFormState);
if(ghPatInput)ghPatInput.addEventListener('input',updateGhFormState);
if(ghPatLink)ghPatLink.addEventListener('click',()=>{if(ghPatLink.disabled)return;vscode.postMessage({type:'openGithubPat'});});
const ghChangeFolder=document.getElementById('gh-change-folder');if(ghChangeFolder)ghChangeFolder.addEventListener('click',()=>vscode.postMessage({type:'githubChooseFolder'}));
if(ghConnectBtn)ghConnectBtn.addEventListener('click',()=>{const profileUrl=(ghProfileUrl&&ghProfileUrl.value.trim())||'';const pat=(ghPatInput&&ghPatInput.value.trim())||'';if(!profileUrl){if(ghMsg){ghMsg.textContent='⚠ ① Enter your GitHub URL';ghMsg.classList.add('err');}if(ghProfileUrl)ghProfileUrl.focus();return;}if(!pat&&!ghHasPat){if(ghMsg){ghMsg.textContent='⚠ ② Enter your PAT';ghMsg.classList.add('err');}if(ghPatInput)ghPatInput.focus();return;}ghConnectBtn.disabled=true;ghConnectBtn.textContent='Connecting…';vscode.postMessage({type:'githubConnect',profileUrl,pat,isPrivate:ghPrivate?ghPrivate.checked:true});});
const ghPrivate=document.getElementById('gh-private'),ghPrivText=document.getElementById('gh-priv-text');
if(ghPrivate)ghPrivate.addEventListener('change',()=>{if(ghPrivText)ghPrivText.textContent=ghPrivate.checked?'🔒 Private (only you)':'🌐 Public (anyone)';});
if(ghDisconnectBtn)ghDisconnectBtn.addEventListener('click',()=>vscode.postMessage({type:'githubDisconnect'}));
const ghPush=document.getElementById('gh-push');if(ghPush)ghPush.addEventListener('click',()=>vscode.postMessage({type:'toggleGithubAutoSync'}));
const ghOpen=document.getElementById('gh-open');if(ghOpen)ghOpen.addEventListener('click',()=>vscode.postMessage({type:'openGithubPage'}));
const newMdBtn=document.getElementById('new-md-btn');if(newMdBtn)newMdBtn.addEventListener('click',()=>vscode.postMessage({type:'createNewMdFile'})); /* v0.9.991: 作家向け新規mdファイル作成 */
window.addEventListener('message',ev=>{const msg=ev.data;if(!msg)return;if(msg.type==='githubSyncState'){if(ghPush){ghPush.classList.toggle('gh-on',!!msg.on);var gitInfo=(msg.gitInstalled===false)?' | ⚠ git not installed (tap for help)':(msg.gitVersion?(' | git ✓ '+msg.gitVersion):'');var baseTip=msg.on?'Octopush armed 🐙 — your next Cmd+S pushes once, then turns OFF. (Click to cancel.)':'Octopush (one-shot): OFF — Cmd+S is normal save. Tap 🐙, then Cmd+S → pushes once, then turns OFF.';ghPush.setAttribute('data-tip',baseTip+gitInfo);}}if(msg.type==='githubPushDone'){if(ghPush){const was=ghPush.textContent;ghPush.textContent='✅';setTimeout(()=>{ghPush.textContent=was;},1200);}}if(msg.type==='githubWizardState'){renderGhWizard(msg);if(msg.syncOn!==undefined&&ghPush){ghPush.classList.toggle('gh-on',!!msg.syncOn);}}});
/* v0.9.715: 🔖 ブックマーク [🔖▾] 分割ボタン。左=巡回ジャンプ／右▾=insert/removeメニュー。 */
const bmCycle=document.getElementById('bm-cycle'),bmMenuBtn=document.getElementById('bm-menu-btn'),bmPop=document.getElementById('bm-pop'),bmRemove=document.getElementById('bm-remove'),bmFront=document.getElementById('bm-front'),bmClear=document.getElementById('bm-clear'),bmPendingBtn=document.getElementById('bm-pending-btn'),bmPendingMenuBtn=document.getElementById('bm-pending-menu-btn'),bmPendingPop=document.getElementById('bm-pending-pop'),refGroupList=document.getElementById('ref-group-list'),refModeToggleBtn=document.getElementById('ref-mode-toggle'),refSwitchFrontBtn=document.getElementById('ref-switch-front'),homeBtn=document.getElementById('home-btn'),homeMenuBtn=document.getElementById('home-menu-btn'),homePop=document.getElementById('home-pop'),homeSwitchBtn=document.getElementById('home-switch');
if(bmPendingBtn)bmPendingBtn.addEventListener('click',()=>{vscode.postMessage({type:'referenceCycle'});if(typeof hideTocTip==='function')hideTocTip();}); /* v0.9.99972(改良2 俊克): 統合参照ボタン=作業グループの巡回(読む)。表示記号はreferenceStateが更新・発行/選択は▾メニュー */
function closeBmPop(){if(bmPop)bmPop.classList.remove('on');}
if(bmCycle)bmCycle.addEventListener('click',()=>{vscode.postMessage({type:'bookmarkCycle'});}); /* v0.9.849: 旧.zeroガードを撤去=栞未設定でもクリックを通し、バックエンドのbookmarkCycleが空時にF栞を貼る(俊克バグ報告) */
if(bmMenuBtn)bmMenuBtn.addEventListener('click',ev=>{ev.preventDefault();const willOpen=!bmPop.classList.contains('on');bmPop.classList.toggle('on',willOpen);if(!willOpen)return;const r=bmMenuBtn.getBoundingClientRect();requestAnimationFrame(()=>{const h=bmPop.offsetHeight||60,w=bmPop.offsetWidth||140;let left=Math.min(r.right-w,window.innerWidth-w-6);if(left<6)left=6;bmPop.style.left=left+'px';bmPop.style.top=Math.max(6,r.top-h-6)+'px';});});
if(bmRemove)bmRemove.addEventListener('click',()=>{vscode.postMessage({type:'bookmarkRemove'});closeBmPop();});
if(bmFront)bmFront.addEventListener('click',()=>{vscode.postMessage({type:'bookmarkSetFront'});closeBmPop();});
if(bmClear)bmClear.addEventListener('click',()=>{vscode.postMessage({type:'bookmarkClearAll'});closeBmPop();});
/* v0.9.99972(改良2 俊克): ▾メニュー=参照グループ選択(💤保留は別枠)+発行+Switch Front。行クリック=作業グループを切替。 */
const refSubmenu=document.getElementById('ref-submenu');function closeRefSubmenu(){if(refSubmenu)refSubmenu.classList.remove('on');}function openRefSubmenu(catName,trigEl){if(!refSubmenu)return;const arr=(window.__refGroups||[]).filter(g=>catName==='doc'?g.hasMembrane:!g.hasMembrane);const row=g=>'<button class="bm-pop-item ref-sub-row" data-name="'+escText(g.name)+'" data-tip="'+(g.hasMembrane?'参照膜有り — 選ぶとボタンがこの記号に':'参照膜なし — 選ぶとボタンがこの記号に')+'">'+(g.active?'<span class="ref-chk">✓</span> ':'　')+escText(g.sym)+' '+escText(g.label||g.name)+' ('+g.count+')</button>';refSubmenu.innerHTML=arr.length?arr.map(row).join(''):'<div class="bm-pop-item" style="cursor:default;opacity:.6">(なし)</div>';refSubmenu.classList.add('on');const pop=document.getElementById('bm-pending-pop');const pr=pop.getBoundingClientRect();const tr=trigEl.getBoundingClientRect();requestAnimationFrame(()=>{const w=refSubmenu.offsetWidth||180,h=refSubmenu.offsetHeight||40;let left=pr.left-w-2;if(left<4)left=4;refSubmenu.style.left=left+'px';let top=tr.top;if(top+h>window.innerHeight-2)top=window.innerHeight-h-2;if(top<2)top=2;refSubmenu.style.top=top+'px';});}if(refGroupList)refGroupList.addEventListener('click',ev=>{const catEl=ev.target&&ev.target.closest?ev.target.closest('.ref-cat'):null;if(catEl){openRefSubmenu(catEl.getAttribute('data-cat'),catEl);return;}});if(refSubmenu)refSubmenu.addEventListener('click',ev=>{const row=ev.target&&ev.target.closest?ev.target.closest('.ref-sub-row'):null;if(!row||!row.hasAttribute('data-name'))return;vscode.postMessage({type:'referenceSelectGroup',name:row.getAttribute('data-name'),pending:false});closeRefSubmenu();closeBmPendingPop();});
if(refModeToggleBtn)refModeToggleBtn.addEventListener('click',()=>{vscode.postMessage({type:'referenceToggleMode'});closeBmPendingPop();}); /* v0.9.99974: 💤⇄通常参照の切替(発行はSwitch Frontへ吸収=Issue廃止) */
if(refSwitchFrontBtn)refSwitchFrontBtn.addEventListener('click',()=>{vscode.postMessage({type:'referenceSwitchFront'});closeBmPendingPop();});
const refDelGroupBtn=document.getElementById('ref-delete-group'),refDelAllBtn=document.getElementById('ref-delete-all');/* v0.9.99973: グループ削除(俊克: プロジェクト用/今日の予定用と使い分けるなら片付け導線が要る) */
if(refDelGroupBtn)refDelGroupBtn.addEventListener('click',()=>{vscode.postMessage({type:'referenceDeleteGroup'});closeBmPendingPop();});
if(refDelAllBtn)refDelAllBtn.addEventListener('click',()=>{vscode.postMessage({type:'referenceDeleteAll'});closeBmPendingPop();});
const refNewGroupBtn=document.getElementById('ref-new-group'),refToggleDisabledBtn=document.getElementById('ref-toggle-disabled');/* v0.9.99981: 新規作成(疑問1)+無効化/有効化(改良3) */
if(refNewGroupBtn)refNewGroupBtn.addEventListener('click',()=>{vscode.postMessage({type:'referenceMeCreateNew'});closeBmPendingPop();});
if(refToggleDisabledBtn)refToggleDisabledBtn.addEventListener('click',()=>{vscode.postMessage({type:'referenceToggleDisabled'});closeBmPendingPop();});
document.addEventListener('click',ev=>{if(bmPop&&bmPop.classList.contains('on')&&!bmPop.contains(ev.target)&&ev.target!==bmMenuBtn)closeBmPop();},true);
/* v0.9.897: 💤保留栞のプルアップメニュー(通常栞の🔖▾と同じ仕組み)。 */
function closeBmPendingPop(){if(bmPendingPop)bmPendingPop.classList.remove('on');if(typeof closeRefSubmenu==='function')closeRefSubmenu();}
if(bmPendingMenuBtn)bmPendingMenuBtn.addEventListener('click',ev=>{ev.preventDefault();const willOpen=!bmPendingPop.classList.contains('on');bmPendingPop.classList.toggle('on',willOpen);if(!willOpen)return;const r=bmPendingMenuBtn.getBoundingClientRect();requestAnimationFrame(()=>{const h=bmPendingPop.offsetHeight||60,w=bmPendingPop.offsetWidth||150;let left=Math.min(r.right-w,window.innerWidth-w-6);if(left<6)left=6;bmPendingPop.style.left=left+'px';bmPendingPop.style.top=Math.max(6,r.top-h-6)+'px';});});
/* v0.9.99972: 旧bm-pending(仮想保留)のメニュー配線を撤去=保留は参照符(生データ)に統合完了 */
document.addEventListener('click',ev=>{const sub=document.getElementById('ref-submenu');if(bmPendingPop&&bmPendingPop.classList.contains('on')&&!bmPendingPop.contains(ev.target)&&ev.target!==bmPendingMenuBtn&&!(sub&&sub.contains(ev.target)))closeBmPendingPop();},true);
/* v0.9.99975: Home栞 — Hボタン=Homeへ直行(未設定ならその場に設定)。▾=Switch Homeのみ(シンプル至上・機動力が命)。 */
if(homeBtn)homeBtn.addEventListener('click',()=>{vscode.postMessage({type:'homeJump'});if(typeof hideTocTip==='function')hideTocTip();});
function closeHomePop(){if(homePop)homePop.classList.remove('on');}
if(homeMenuBtn)homeMenuBtn.addEventListener('click',ev=>{ev.preventDefault();const willOpen=!homePop.classList.contains('on');homePop.classList.toggle('on',willOpen);if(!willOpen)return;const r=homeMenuBtn.getBoundingClientRect();requestAnimationFrame(()=>{const h=homePop.offsetHeight||40,w=homePop.offsetWidth||140;let left=Math.min(r.right-w,window.innerWidth-w-6);if(left<6)left=6;homePop.style.left=left+'px';homePop.style.top=Math.max(6,r.top-h-6)+'px';});});
if(homeSwitchBtn)homeSwitchBtn.addEventListener('click',()=>{vscode.postMessage({type:'homeSwitch'});closeHomePop();});
document.addEventListener('click',ev=>{if(homePop&&homePop.classList.contains('on')&&!homePop.contains(ev.target)&&ev.target!==homeMenuBtn)closeHomePop();},true);
function renderBookmarkState(count,full,pending,pendingFull,marksInfo,home){if(homeBtn){const hl=home&&typeof home.line==='number'?home.line:-1;homeBtn.classList.toggle('zero',hl<0);homeBtn.setAttribute('data-tip',hl>=0?('🏠 Home — Ln '+(hl+1)+(home.at?' · '+home.at:'')+' | One click returns here, like the ribbon bookmark sewn into a book. ▾ to move Home to the cursor.'):"Home | The ribbon bookmark of this file — no Home yet. Click to set it at the cursor line: the one place you most want to come back to.");}if(bmCycle)bmCycle.classList.toggle('zero',!count);if(bmMenuBtn)bmMenuBtn.classList.toggle('zero',!count);if(bmCycle){/* v0.9.848: 🔖ボタンtipに各栞の行番号+作成日時(🚩=F栞印)を表示。未設定はクリックでF栞を貼る案内。 */const mi=Array.isArray(marksInfo)?marksInfo:[];bmCycle.setAttribute('data-tip',mi.length?("🔖 Bookmark | One click → 🚩 Front Anchor, click again to cycle. | "+mi.map(m=>(m.front?'🚩':'🔖')+' Ln '+(m.line+1)+(m.at?' · '+m.at:'')).join(' | ')):"🔖 Bookmark | Click to drop a 🚩 Front Anchor at the cursor line.");}/* v0.9.99972: 参照ボタンの記号/tip/バッジは renderReferenceState が担当(旧bm-pendingバッジ撤去) */if(bmCycle){const c=bmCycle.querySelector('.bm-cnt');if(count){if(c)c.textContent=count;else bmCycle.insertAdjacentHTML('beforeend','<span class="bm-cnt">'+count+'</span>');}else if(c)c.remove();}
}
/* v0.9.99972(改良2 俊克): 統合参照ボタンの状態描画。ボタン=作業グループの記号(💤=保留・別枠)+件数バッジ。▾メニュー=グループ一覧(保留を先頭の別枠に)。 */
function renderReferenceState(m){const pendActive=!!(m.pending&&m.pending.active);if(bmPendingBtn){const sym=m.activeSym||'💤';const cnt=Number(m.count)||0;bmPendingBtn.textContent=sym;if(cnt>0)bmPendingBtn.insertAdjacentHTML('beforeend','<span class="bm-pending-cnt">'+cnt+'</span>');bmPendingBtn.classList.toggle('has',cnt>0);/* v0.9.99981(改良2): 作業カテゴリで背景色=膜なし薄水色/膜有り濃青/保留は従来 */const _md=m.mode||'pending';bmPendingBtn.classList.toggle('ref-plain',_md==='plain');bmPendingBtn.classList.toggle('ref-doc',_md==='doc');const act=(m.groups||[]).find(g=>g.active);bmPendingBtn.setAttribute('data-tip','Reference '+sym+(pendActive?(' — 保留 ('+cnt+' marks)'):(act?(' — '+act.name+' ('+cnt+' marks)'):''))+' | One click jumps to the F mark; click again to cycle the working reference. Pick it from ▾.');}
if(refGroupList){const norm=Array.isArray(m.groups)?m.groups:[];window.__refGroups=norm;/* v0.9.99983(俊克バグ1): 参照膜有り/なしを孫メニュー(フライアウト)に=クリックで横にリストを開く */const docs=norm.filter(g=>g.hasMembrane),plains=norm.filter(g=>!g.hasMembrane);const cat=(c,label,arr)=>'<button class="bm-pending-row ref-cat" data-cat="'+c+'" data-tip="クリックで「'+label+'」のグループ一覧を左に開く">'+(arr.some(g=>g.active)?'<span class="ref-chk">✓</span> ':'　')+label+'<span class="ref-arrow">('+arr.length+') &gt;</span></button>';refGroupList.innerHTML=norm.length?((docs.length?cat('doc','参照膜有り',docs):'')+(plains.length?cat('plain','参照膜なし',plains):'')):'<div class="bm-pending-row" style="cursor:default">参照グループなし — Edit▾ → Reference で作成</div>';if(typeof closeRefSubmenu==='function')closeRefSubmenu();}
if(refModeToggleBtn){const pc=(m.pending&&m.pending.count)||0;const mk=(on,t)=>(on?'<span class="ref-chk">✓</span>':'')+t;const mode=m.mode||'pending';refModeToggleBtn.innerHTML=mk(mode==='pending','💤保留('+pc+')')+' / '+mk(mode==='plain','膜なし')+' / '+mk(mode==='doc','膜有り');refModeToggleBtn.classList.toggle('active',mode==='pending');refModeToggleBtn.setAttribute('data-tip','Tap to move the ✓ (working reference): 💤 pending (special no-membrane group) → plain groups (marks only) → documented groups (with a reference membrane). Cycles in this order.');}}
if(opAddToc)opAddToc.addEventListener('click',()=>vscode.postMessage({type:'addToWorkingToc'}));
if(opToggle)opToggle.addEventListener('click',()=>{if(meScope==='me')vscode.postMessage({type:'toggleMeOne',line:lineInput?lineInput.value:''});else vscode.postMessage({type:'noop',name:'toggleMeShadowSkeleton'});});
if(opRemove)opRemove.addEventListener('click',()=>{if(meScope==='me'){vscode.postMessage({type:'shedMe'});}else{vscode.postMessage({type:'noop',name:(meScope==='shadow'?'removeMeShadowSkeleton':'removeMeAllSkeleton')});}});
if(opCopy)opCopy.addEventListener('click',()=>{const me=!!(meCheck&&meCheck.checked),contents=!!(contentsCheck&&contentsCheck.checked);vscode.postMessage({type:(me&&contents)?'copyMe':'copyMyContents'});});
if(opSelect)opSelect.addEventListener('click',()=>vscode.postMessage({type:'selectMyContents'}));
if(opDuplicate)opDuplicate.addEventListener('click',()=>vscode.postMessage({type:'duplicateMe'}));
if(meScopeSelect)meScopeSelect.addEventListener('change',renderMembraneTargetPanel);
if(meCheck)meCheck.addEventListener('change',renderMembraneTargetPanel);
if(contentsCheck)contentsCheck.addEventListener('change',renderMembraneTargetPanel);
if(fixedTocBody)fixedTocBody.addEventListener('mousedown',ev=>{const item=ev.target&&ev.target.closest?ev.target.closest('.fixed-toc-item'):null;tocAllowCommentAutoselect=false;if(!item)return;const line0=Number(item.getAttribute('data-line0'));const isValue=ev.target&&ev.target.classList&&ev.target.classList.contains('toc-value');const alreadySelected=(selectedTocLine0!==null&&line0===selectedTocLine0);const enoughPause=(Date.now()-tocLastSelectAt)>450;if(isValue&&alreadySelected&&enoughPause){tocAllowCommentAutoselect=true;return;}if(isValue){ev.preventDefault();}},true);
if(fixedTocBody)fixedTocBody.addEventListener('compositionstart',ev=>{if(ev.target&&ev.target.classList&&ev.target.classList.contains('toc-value'))tocImeComposing=true;},true);
if(fixedTocBody)fixedTocBody.addEventListener('compositionend',ev=>{if(ev.target&&ev.target.classList&&ev.target.classList.contains('toc-value'))setTimeout(()=>{tocImeComposing=false;},0);},true);
if(fixedTocBody)fixedTocBody.addEventListener('click',ev=>{if(ev.metaKey||ev.ctrlKey){const it=ev.target&&ev.target.closest?ev.target.closest('.fixed-toc-item'):null;if(it){ev.preventDefault();selectTocItem(it);const inEl=it.querySelector('.toc-value');const k=tocKeyFromInputValue(inEl?inEl.value:it.getAttribute('data-key'));const cnA=it.getAttribute('data-cite-n');const cn=cnA!==null&&cnA!==''?Number(cnA):null;if(k)vscode.postMessage({type:'jumpToTocItem',key:k,citeN:cn});return;}}const bidiGreen=ev.target&&ev.target.closest?ev.target.closest('.bidi-jump-bar .bidi-green'):null;if(bidiGreen){if(!bidiGreen.classList.contains('inactive'))vscode.postMessage({type:'jumpBiGreen'});return;}const bidiRed=ev.target&&ev.target.closest?ev.target.closest('.bidi-jump-bar .bidi-red'):null;if(bidiRed){if(!bidiRed.classList.contains('inactive'))vscode.postMessage({type:'jumpBiRed'});return;}const bidiClear=ev.target&&ev.target.closest?ev.target.closest('.bidi-jump-bar .bidi-clear'):null;if(bidiClear){vscode.postMessage({type:'clearAllJumps'});return;}const pin=ev.target&&ev.target.closest?ev.target.closest('.toc-pin'):null;if(pin){if(ev.target&&ev.target.classList&&ev.target.classList.contains('toc-pin-check')){vscode.postMessage({type:'pinJumpMode',toSelected:!!ev.target.checked});return;}if(ev.target&&ev.target.classList&&ev.target.classList.contains('toc-pin-toggle')){vscode.postMessage({type:'toggleMeOne',line:ev.target.getAttribute('data-line')});return;}if(ev.target&&ev.target.closest&&ev.target.closest('.toc-pin-mode')){return;}vscode.postMessage({type:'pinCycle'});return;}const item=ev.target&&ev.target.closest?ev.target.closest('.fixed-toc-item'):null;if(!item)return;selectTocItem(item);const cls=ev.target&&ev.target.classList;if(cls&&cls.contains('toc-check')){const checked=!!ev.target.checked;const tip=checked?('Checked: '+new Date().toLocaleString('ja-JP')):('Line '+((Number(item.getAttribute('data-line0'))||0)+1));item.setAttribute('data-tip',tip);ev.target.setAttribute('data-tip',tip);const valueEl=item.querySelector('.toc-value');if(valueEl)valueEl.setAttribute('data-tip',tip);showTocTip(ev);vscode.postMessage({type:'toggleTocCheck',key:item.getAttribute('data-state-key')||item.getAttribute('data-key'),checked});return;}if(cls&&cls.contains('toc-value'))return;const key=item.getAttribute('data-key');const citeNAttr=item.getAttribute('data-cite-n');const citeN=citeNAttr!==null&&citeNAttr!==''?Number(citeNAttr):null;if(key)vscode.postMessage({type:'jumpToTocItem',key,citeN});});
if(tocPinBar)tocPinBar.addEventListener('click',ev=>{if(ev.target&&ev.target.classList&&ev.target.classList.contains('toc-pin-toggle')){vscode.postMessage({type:'toggleMeOne',line:ev.target.getAttribute('data-line')});return;}const chars=ev.target&&ev.target.closest?ev.target.closest('.toc-pin-chars'):null;if(chars){openMeCharPop(chars);return;}const pin=ev.target&&ev.target.closest?ev.target.closest('.toc-pin'):null;if(pin){vscode.postMessage({type:'pinCycle'});return;}});
/* v0.9.807: char-target pop — opens above the char row (same fixed-pop pattern as bm-pop). */
const meCharPop=document.getElementById('me-char-pop'),meCharPopHead=document.getElementById('me-char-pop-head'),meCharRecalc=document.getElementById('me-char-recalc'),meCharTargetInput=document.getElementById('me-char-target-input'),meCharTargetSet=document.getElementById('me-char-target-set'),meCharTargetClear=document.getElementById('me-char-target-clear');
function closeMeCharPop(){if(meCharPop)meCharPop.classList.remove('on');}
function openMeCharPop(anchorEl){if(!meCharPop)return;hideTocTip();if(meCharPopHead)meCharPopHead.textContent=__meCharCur.chars.toLocaleString('en-US')+' chars'+(__meCharCur.target?(' / target '+__meCharCur.target.toLocaleString('en-US')):'');if(meCharTargetInput)meCharTargetInput.value=__meCharCur.target||__meCharCur.chars||'';/* v0.9.893: 目標未設定なら現在の文字数を初期値に(そこから増減を打ち込める・俊克 6/16 am07:14) */meCharPop.classList.add('on');const r=anchorEl.getBoundingClientRect();requestAnimationFrame(()=>{const h=meCharPop.offsetHeight||80,w=meCharPop.offsetWidth||180;let left=Math.min(r.right-w,window.innerWidth-w-6);if(left<6)left=6;meCharPop.style.left=left+'px';meCharPop.style.top=Math.max(6,r.top-h-6)+'px';});}
if(meCharRecalc)meCharRecalc.addEventListener('click',()=>{vscode.postMessage({type:'resetMeCharBase'});closeMeCharPop();});
function sendMeCharTarget(){const v=meCharTargetInput?Number(meCharTargetInput.value):NaN;vscode.postMessage({type:'setMeCharTarget',target:(isFinite(v)&&v>0)?Math.floor(v):null});closeMeCharPop();}
if(meCharTargetSet)meCharTargetSet.addEventListener('click',sendMeCharTarget);
if(meCharTargetInput)meCharTargetInput.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();sendMeCharTarget();}});
if(meCharTargetClear)meCharTargetClear.addEventListener('click',()=>{vscode.postMessage({type:'setMeCharTarget',target:null});closeMeCharPop();});
document.addEventListener('click',ev=>{if(meCharPop&&meCharPop.classList.contains('on')&&!meCharPop.contains(ev.target)&&!(ev.target.closest&&ev.target.closest('.toc-pin-chars')))closeMeCharPop();},true);
if(fixedTocBody)fixedTocBody.addEventListener('dblclick',ev=>{const item=ev.target&&ev.target.closest?ev.target.closest('.fixed-toc-item'):null;if(!item)return;selectTocItem(item);const inputEl=item.querySelector('.toc-value');const key=tocKeyFromInputValue(inputEl?inputEl.value:item.getAttribute('data-key'));const citeNAttr=item.getAttribute('data-cite-n');const citeN=citeNAttr!==null&&citeNAttr!==''?Number(citeNAttr):null;if(key)vscode.postMessage({type:'jumpToTocItem',key,citeN});});
function tocTextWidth(el,text){
  try{
    const cs=getComputedStyle(el);
    const canvas=tocTextWidth._c||(tocTextWidth._c=document.createElement('canvas'));
    const ctx=canvas.getContext('2d');
    ctx.font=[cs.fontStyle,cs.fontVariant,cs.fontWeight,cs.fontSize,cs.fontFamily].join(' ');
    return Math.max(0, Math.ceil(ctx.measureText(text).width)+2);
  }catch(_){return Math.max(0,String(text||'').length*7+5);}
}
function clearTocEditingComment(){
  document.querySelectorAll('.fixed-toc-item.editing-comment').forEach(el=>{el.classList.remove('editing-comment');el.style.removeProperty('--toc-prefix-w');});
}
function selectTocCommentPart(el){
  if(tocImeComposing||!tocAllowCommentAutoselect)return;
  tocAllowCommentAutoselect=false;
  if(!el||!el.classList||!el.classList.contains('toc-value'))return;
  const item=el.closest('.fixed-toc-item');
  if(item){item.classList.add('editing-comment');}
  const v=String(el.value||'');
  const idx=v.indexOf('//');
  if(idx<0){if(item)item.style.setProperty('--toc-prefix-w','0px');return;}
  // v0.9.320: keep the highlight boundary and comment-selection boundary separate.
  // prefixEnd: dark-orange prefix highlight ends at the two slashes: //
  // commentStart: editable comment selection starts after the required single space: //␠
  const prefixEnd=idx+2;
  const commentStart=(v.charAt(prefixEnd)===' ')?idx+3:idx+2;
  const prefix=v.slice(0,prefixEnd);
  if(item)item.style.setProperty('--toc-prefix-w',tocTextWidth(el,prefix)+'px');
  try{el.setSelectionRange(commentStart,v.length);}catch(_){ }
}
if(fixedTocBody)fixedTocBody.addEventListener('focusin',ev=>{if(ev.target&&ev.target.classList&&ev.target.classList.contains('toc-value')){hideTocTip();/* v0.9.806: 編集開始時に、ホバーで既に出ていたtipを即消す(showTocTipのガードはmousemove時のみ=打鍵中は発火せず古いtipが残っていた)。 */clearTocEditingComment();setTimeout(()=>selectTocCommentPart(ev.target),0);}});
if(fixedTocBody)fixedTocBody.addEventListener('keydown',ev=>{if(ev.target&&ev.target.classList&&ev.target.classList.contains('toc-value')&&ev.key==='Enter'){if(tocImeComposing)return;ev.preventDefault();const item=ev.target.closest('.fixed-toc-item');vscode.postMessage({type:'updateTocItem',line0:Number(item.getAttribute('data-line0')),value:ev.target.value});ev.target.blur();}});
if(fixedTocBody)fixedTocBody.addEventListener('focusout',ev=>{if(ev.target&&ev.target.classList&&ev.target.classList.contains('toc-value')){const item=ev.target.closest('.fixed-toc-item');if(!tocImeComposing)vscode.postMessage({type:'updateTocItem',line0:Number(item.getAttribute('data-line0')),value:ev.target.value});setTimeout(clearTocEditingComment,0);}});
/* v0.9.711: 全tip共通。tipの右端をカーソルの約6文字左に置く間隔(px)。俊克 am09:53「ポインターより6文字くらい離す・見えないとストレス」。 */
const TIP_GAP_PX=44;
function showTocTip(ev){if(!tocTooltip)return;if(window.__headWrapUntil&&Date.now()<window.__headWrapUntil){hideTocTip();return;}/* v0.9.805: H-TOC項目のコメント編集中(toc-valueにフォーカス)はtip非表示=編集の邪魔をしない。 */{const ae=document.activeElement;if(ae&&ae.classList&&ae.classList.contains('toc-value')){hideTocTip();return;}}const el=(ev.target&&ev.target.closest)?ev.target.closest('[data-tip],[title]'):null;/* v0.9.712: native title を data-tip に遅延移行(ネイティブtipを抑止し共通の左伸ばしtipに一本化)。JSが.titleを再設定しても次のhoverで反映。 */if(el&&el.hasAttribute('title')){const tt=el.getAttribute('title');if(tt)el.setAttribute('data-tip',tt);el.removeAttribute('title');}const t=el?el.getAttribute('data-tip'):'';if(!t){hideTocTip();return;}/* v0.9.691: split the " | " separated parts (Created/Checked/Cite) onto separate lines for readability (俊克 am11:38). 改行は String.fromCharCode(10) で安全に(テンプレートリテラル回避)。CSSは white-space:pre-line。 */tocTooltip.textContent=String(t).split(' | ').join(String.fromCharCode(10));/* v0.9.686: grow the tip LEFT from the cursor (Me Dock sits at the screen's right edge, so a right-growing tip clips); wrap to 2+ lines. Anchor the tip's RIGHT edge ~12px left of the cursor. */tocTooltip.style.display='block';/* v0.9.99981(改良1 俊克): 開いているプルダウン(.bm-pop.on)内の項目tipは、マウスX追従をやめて ポップアップ左端に接した固定位置に出す(メニューを隠さない)。縦は項目に合わせる。 */{const _popEl=el.closest&&el.closest('.bm-pop');if(_popEl&&_popEl.classList.contains('on')){const pr=_popEl.getBoundingClientRect();const tw=tocTooltip.offsetWidth||160,h=tocTooltip.offsetHeight||20;const leftEdge=pr.left-1-tw;if(leftEdge>=4){/* 左に余地あり: ポップアップ左端の左に接し上端揃え */tocTooltip.style.left='auto';tocTooltip.style.right=(window.innerWidth-pr.left+1)+'px';let top=pr.top;if(top+h>window.innerHeight-2)top=window.innerHeight-h-2;if(top<2)top=2;tocTooltip.style.top=top+'px';}else{/* v0.9.99985(改良1 俊克): 左に余地なし(孫メニュー等)→ポップアップ上端の上に接して表示(tip下端=ポップアップ上端) */tocTooltip.style.right='auto';let left=pr.left;if(left+tw>window.innerWidth-2)left=window.innerWidth-tw-2;if(left<2)left=2;tocTooltip.style.left=left+'px';let top=pr.top-h-1;if(top<2)top=pr.bottom+1;tocTooltip.style.top=top+'px';}return;}}/* v0.9.769: タブのtipは常に"上空"に出す(ドラッグ中にドロップ位置を隠さないため)。タブ左に揃え、上に余地が無ければ下。 */const _tabEl=el.closest&&el.closest('.toc-tab');if(_tabEl){const r=_tabEl.getBoundingClientRect();const tw=tocTooltip.offsetWidth||120,h=tocTooltip.offsetHeight||20;tocTooltip.style.right='auto';let left=r.left;if(left+tw>window.innerWidth-2)left=window.innerWidth-tw-2;if(left<2)left=2;tocTooltip.style.left=left+'px';let top=r.top-h-6;if(top<2)top=r.bottom+6;tocTooltip.style.top=top+'px';return;}/* v0.9.829: Mepyの挨拶tipは必ず顔の外に(俊克 am03:43)。顔(membrane-visual)の上に中央寄せ・上に余地が無ければ下。 *//* v0.9.881: Format色ピッカー(スウォッチ/スロット)のtipは要素の真上に近接表示(離れすぎ対策・俊克 6/15 pm00:24)。 */const _fmtEl=el.closest&&el.closest('#fmt-pop');if(_fmtEl){const r=el.getBoundingClientRect();const tw=tocTooltip.offsetWidth||80,h=tocTooltip.offsetHeight||18;tocTooltip.style.right='auto';let left=r.left+(r.width-tw)/2;if(left+tw>window.innerWidth-2)left=window.innerWidth-tw-2;if(left<2)left=2;tocTooltip.style.left=left+'px';let top=r.top-h-5;if(top<2)top=r.bottom+5;tocTooltip.style.top=top+'px';return;}const _mepyEl=el.closest&&el.closest('.mepy-hello');if(_mepyEl){const face=document.getElementById('membrane-visual');const fr=(face||_mepyEl).getBoundingClientRect();const tw=tocTooltip.offsetWidth||120,h=tocTooltip.offsetHeight||20;tocTooltip.style.right='auto';let left=fr.left+(fr.width-tw)/2;if(left+tw>window.innerWidth-2)left=window.innerWidth-tw-2;if(left<2)left=2;tocTooltip.style.left=left+'px';let top=fr.top-h-8;if(top<2)top=fr.bottom+8;tocTooltip.style.top=top+'px';return;}const rowEl=(el.closest&&el.closest('.fixed-toc-item,.toc-pin'))||el;const rect=(rowEl&&rowEl.getBoundingClientRect)?rowEl.getBoundingClientRect():null;const tw=tocTooltip.offsetWidth||120;const h=tocTooltip.offsetHeight||20;if(ev.clientX-TIP_GAP_PX-tw<4){/* v0.9.713: 左伸ばしだと左端で見切れる(左端の細いボタン)→上に逃がして右方向に伸ばす(俊克 am10:48)。 */tocTooltip.style.right='auto';let left=(rect?rect.left:ev.clientX);if(left+tw>window.innerWidth-2)left=window.innerWidth-tw-2;if(left<2)left=2;tocTooltip.style.left=left+'px';let top=(rect?rect.top:ev.clientY)-h-4;if(top<2)top=(rect?rect.bottom:ev.clientY)+4;if(top+h>window.innerHeight-2)top=window.innerHeight-h-2;tocTooltip.style.top=top+'px';}else{/* 通常: カーソル6文字左から左伸ばし・行の上端に合わせる(プルダウン風)。 */tocTooltip.style.left='auto';tocTooltip.style.right=(window.innerWidth-ev.clientX+TIP_GAP_PX)+'px';let top=(rect?rect.top:ev.clientY)+1;if(top<2)top=2;if(top+h>window.innerHeight-2)top=window.innerHeight-h-2;tocTooltip.style.top=top+'px';}}
function hideTocTip(){if(tocTooltip)tocTooltip.style.display='none';}
/* v0.9.712: 全tip統一。webview全体で mousemove を拾い、data-tip / native title を持つ最近接要素に
   共通の左伸ばしtipを出す(showTocTip内で title→data-tip 遅延移行)。個別リスナ(fixedTocBody/format-tools)は廃止し1本化。 */
document.addEventListener('mousemove',showTocTip);
document.addEventListener('mouseleave',hideTocTip);
/* v0.9.774: H-TOCスクロール中はtipを隠す(タブD&Dと同じ発想・俊克 am04:20)。スクロール後にマウスを動かせば再表示。 */
if(fixedTocBody)fixedTocBody.addEventListener('scroll',hideTocTip,{passive:true});

if(toggleEditorToc)toggleEditorToc.addEventListener('click',()=>vscode.postMessage({type:'toggleEditorToc'}));
if(tocMoveUp)tocMoveUp.addEventListener('click',()=>moveSelectedToc(-1));
if(tocMoveDown)tocMoveDown.addEventListener('click',()=>moveSelectedToc(1));
if(tocAdd)tocAdd.addEventListener('click',()=>vscode.postMessage({type:'duplicateTocItem',line0:selectedTocLine0}));
// v0.9.565: delete-selected-item button. User v0.9.564_0338 request:
// 「選択した目次項目を削除する[-]ボタンを追加して下さい」.
if(tocDelItem)tocDelItem.addEventListener('click',()=>{
  if(selectedTocLine0===null||selectedTocLine0===undefined){return;}
  vscode.postMessage({type:'deleteTocItem',line0:selectedTocLine0});
});
// v0.9.549 Phase C-1: Hyper TOC tab bar interactions (delegated via tocTabRow because
// inner content is re-rendered every snapshot).
if(tocTabRow){
  tocTabRow.addEventListener('click',ev=>{
    const target=ev.target;
    if(!target)return;
    if(target.id==='toc-tab-add'){vscode.postMessage({type:'duplicateHyperTocTab'});return;}
    if(target.id==='toc-tab-del'){
      // Show confirm panel; the actual delete fires on yes click.
      if(tocTabConfirm){tocTabConfirm.classList.add('on');if(tocTabConfirmMsg){const activeTab=tocTabRow.querySelector('.toc-tab.active');tocTabConfirmMsg.textContent='Delete tab "'+((activeTab?activeTab.textContent:'')||'Hyper TOC')+'"?';}}
      return;
    }
    const tab=target.closest&&target.closest('.toc-tab');
    if(tab){const idx=Number(tab.getAttribute('data-tab-idx'));if(!isNaN(idx))vscode.postMessage({type:'switchHyperTocTab',idx});}
  });
  // v0.9.768: タブのドラッグ並べ替え(HTML5 DnD・イベント委譲。innerHTML再生成されてもtocTabRowは残る)。
  let _dragTabIdx=null;
  let _pendingTo=null;       /* v0.9.772: dragoverで「今表示している挿入線」の対象idx。 */
  let _dropHandled=false;    /* v0.9.773: dropが発火したか。 */
  function _clearDropMarks(){tocTabRow.querySelectorAll('.toc-tab.dragging,.toc-tab.drop-left,.toc-tab.drop-right').forEach(el=>el.classList.remove('dragging','drop-left','drop-right'));}
  /* v0.9.773: 「見えている挿入線(_pendingTo)」に入れる。dropはパネル外で離すと発火しないので、必ず発火するdragendでも確定する(=どこで離しても線が出ていれば移動)。 */
  function _commitTabReorder(){if(_dragTabIdx!==null&&_pendingTo!==null&&!isNaN(_dragTabIdx)&&!isNaN(_pendingTo)&&_dragTabIdx!==_pendingTo){vscode.postMessage({type:'reorderHyperTocTab',from:_dragTabIdx,to:_pendingTo});}}
  /* v0.9.770: ポインタが直接タブ上に無くてもX座標で最寄りのタブを解決(右端を越えたら最後のタブ=末尾へ移動可能に)。 */
  function _resolveDropTab(ev){const direct=ev.target&&ev.target.closest&&ev.target.closest('.toc-tab');if(direct)return direct;const tabs=tocTabRow.querySelectorAll('.toc-tab');if(!tabs.length)return null;const x=ev.clientX,first=tabs[0],last=tabs[tabs.length-1];if(x>=last.getBoundingClientRect().right)return last;if(x<=first.getBoundingClientRect().left)return first;let best=first;for(const t of tabs){if(x>=t.getBoundingClientRect().left)best=t;}return best;}
  tocTabRow.addEventListener('dragstart',ev=>{const tab=ev.target&&ev.target.closest&&ev.target.closest('.toc-tab');if(!tab){return;}_dragTabIdx=Number(tab.getAttribute('data-tab-idx'));_pendingTo=null;_dropHandled=false;if(ev.dataTransfer){ev.dataTransfer.effectAllowed='move';try{ev.dataTransfer.setData('text/plain',String(_dragTabIdx));}catch(_){}}tab.classList.add('dragging');if(typeof hideTocTip==='function')hideTocTip();/* v0.9.769: ドラッグ中はtipを隠してドロップ位置を見えるように。 */});
  /* v0.9.770: dragover/drop は H-TOCパネル全体(fixedToc)で受ける。右はopsボタンが行き過ぎを拾うが左はタブ左に
     要素が無く tocTabRow の外に出て発火しなかった非対称を解消。_resolveDropTab がX座標で先頭/末尾/最寄りに解決。 */
  const _dropZone=(typeof fixedToc!=='undefined'&&fixedToc)?fixedToc:tocTabRow;
  _dropZone.addEventListener('dragover',ev=>{if(_dragTabIdx===null)return;const tab=_resolveDropTab(ev);if(!tab)return;ev.preventDefault();if(ev.dataTransfer)ev.dataTransfer.dropEffect='move';tocTabRow.querySelectorAll('.toc-tab.drop-left,.toc-tab.drop-right').forEach(el=>el.classList.remove('drop-left','drop-right'));const overIdx=Number(tab.getAttribute('data-tab-idx'));/* v0.9.769: 右へ移動なら対象の右側、左へ移動なら左側に太線(実際の挿入位置と一致)。 */if(overIdx!==_dragTabIdx){tab.classList.add(overIdx>_dragTabIdx?'drop-right':'drop-left');_pendingTo=overIdx;}else{_pendingTo=null;}});
  _dropZone.addEventListener('drop',ev=>{if(_dragTabIdx===null)return;ev.preventDefault();_dropHandled=true;_commitTabReorder();_dragTabIdx=null;_pendingTo=null;_clearDropMarks();});
  /* v0.9.773: dropがパネル外で発火しなくても、必ず発火するdragendで「見えていた線」に確定する。 */
  tocTabRow.addEventListener('dragend',()=>{if(!_dropHandled)_commitTabReorder();_dragTabIdx=null;_pendingTo=null;_dropHandled=false;_clearDropMarks();});
}
if(tocTabConfirmYes)tocTabConfirmYes.addEventListener('click',()=>{vscode.postMessage({type:'deleteHyperTocTab'});if(tocTabConfirm)tocTabConfirm.classList.remove('on');});
if(tocTabConfirmNo)tocTabConfirmNo.addEventListener('click',()=>{if(tocTabConfirm)tocTabConfirm.classList.remove('on');});
if(tocOnsite)tocOnsite.addEventListener('click',()=>{tocOnsite.classList.toggle('on');vscode.postMessage({type:'toggleOnsiteToc'});});
// v0.9.550: IME-safe Enter for the tab-name input. See history comment in mCN=0000.
let _tabNameRenameViaEnter=false;
if(fixedTocName){
  fixedTocName.addEventListener('compositionstart',()=>{_tabNameComposing=true;});
  fixedTocName.addEventListener('compositionend',()=>{setTimeout(()=>{_tabNameComposing=false;},0);});
  fixedTocName.addEventListener('keydown',ev=>{
    if(ev.key!=='Enter')return;
    if(ev.isComposing||ev.keyCode===229||_tabNameComposing)return;
    ev.preventDefault();
    _tabNameRenameViaEnter=true;
    vscode.postMessage({type:'renameWorkingToc',value:fixedTocName.value});
    fixedTocName.blur();
  });
  fixedTocName.addEventListener('blur',()=>{
    if(_tabNameRenameViaEnter){_tabNameRenameViaEnter=false;return;}
    vscode.postMessage({type:'renameWorkingToc',value:fixedTocName.value});
  });
}
if(colorBtn)colorBtn.addEventListener('click',ev=>{ev.preventDefault();renderColorButton();const willOpen=!colorPop.classList.contains('on');colorPop.classList.toggle('on',willOpen);if(!willOpen)return;const r=colorBtn.getBoundingClientRect();requestAnimationFrame(()=>{const h=colorPop.offsetHeight||220;const w=colorPop.offsetWidth||38;const left=Math.min(Math.max(6,r.left),window.innerWidth-w-6);colorPop.style.left=left+'px';colorPop.style.top=Math.max(6,r.top-h-6)+'px';});});
if(colorPop)colorPop.addEventListener('click',ev=>{const b=ev.target&&ev.target.closest?ev.target.closest('.swatch'):null;if(!b)return;draftColor=b.getAttribute('data-code')||'G';draftDirty=true;colorPop.classList.remove('on');renderColorButton();renderMembraneTargetPanel();vscode.postMessage({type:'applyColorNow',color:draftColor,mode:currentMode,value:input.value,line:lineInput.value});input.focus();});
document.addEventListener('click',ev=>{if(colorPop&&colorBtn&&colorPop.classList.contains('on')&&!colorPop.contains(ev.target)&&ev.target!==colorBtn)colorPop.classList.remove('on');},true);
histBack.addEventListener('click',()=>vscode.postMessage({type:'lineHistoryBack'}));
histForward.addEventListener('click',()=>vscode.postMessage({type:'lineHistoryForward'}));
lineBtn.addEventListener('click',()=>vscode.postMessage({type:'toggleLineMarker'}));
refreshBtn.addEventListener('click',()=>{vscode.postMessage({type:'refreshTimestamp',mode:currentMode,value:input.value});input.focus();input.select()});
resetBtn.addEventListener('click',()=>{draftName=currentValue||'';draftDirty=false;draftColor=currentColor||'';input.value=draftName;lineInput.value=currentLine||'';renderColorButton();vscode.postMessage({type:'resetPanel'});});
function focusNameInput(selectText=true){
  setTimeout(()=>{
    if(!input)return;
    input.focus();
    if(selectText && typeof input.select==='function')input.select();
  },30);
}
function newRenameTabTargets(){
  const zoomStart=document.getElementById('zoom-me-start');
  const zoomEnd=document.getElementById('zoom-me-end');
  const zoomMode=document.getElementById('zoom-me-mode');
  const zoomLoad=document.getElementById('zoom-me-load');
  const zoomVisible=zoomMePanel && !zoomMePanel.classList.contains('hidden');
  if(zoomVisible){
    return [editModeSelect,zoomStart,zoomEnd,zoomMode,zoomLoad,histBack,histForward,lineBtn,lineInput,colorBtn,meCheck,meScopeSelect,contentsCheck,opAddToc,opToggle,opRemove,opCopy,opSelect,opDuplicate,refreshBtn,resetBtn,setBtn].filter(el=>el && !el.disabled && el.offsetParent!==null);
  }
  return [editModeSelect,input,histBack,histForward,lineBtn,lineInput,colorBtn,meCheck,meScopeSelect,contentsCheck,opAddToc,opToggle,opRemove,opCopy,opSelect,opDuplicate,refreshBtn,resetBtn,setBtn].filter(el=>el && !el.disabled && el.offsetParent!==null);
}
function cycleNewRenameFocus(ev){
  if(ev.key!=='Tab')return;
  const panel=document.getElementById('new-rename-panel');
  if(!panel || !panel.contains(document.activeElement))return;
  const targets=newRenameTabTargets();
  if(!targets.length)return;
  ev.preventDefault();
  const current=document.activeElement;
  const zoomStart=document.getElementById('zoom-me-start');
  const zoomVisible=zoomMePanel && !zoomMePanel.classList.contains('hidden');
  let next=null;
  // v0.9.445: keep the proven v0.9.442 order, but close the loop:
  // Navigate Line input -> Zoom Me start.  Shift+Tab from Zoom Me start -> Navigate Line input.
  if(zoomVisible && !ev.shiftKey && current===lineInput && zoomStart && !zoomStart.disabled && zoomStart.offsetParent!==null){
    next=zoomStart;
  }else if(zoomVisible && ev.shiftKey && current===zoomStart && lineInput && !lineInput.disabled && lineInput.offsetParent!==null){
    next=lineInput;
  }else{
    let idx=targets.indexOf(current);
    if(idx<0)idx=ev.shiftKey?0:-1;
    next=targets[(idx+(ev.shiftKey?-1:1)+targets.length)%targets.length];
  }
  if(!next)return;
  next.focus();
  if(next===input || next===lineInput || next===zoomStart){try{next.select();}catch(_){}}
}
document.getElementById('new-rename-panel').addEventListener('keydown',cycleNewRenameFocus,true);
setBtn.addEventListener('click',()=>{draftName=input.value;draftDirty=false;vscode.postMessage({type:'runInlineNewRename',mode:currentMode,value:draftName,line:lineInput.value,color:draftColor||currentColor||''});});
input.addEventListener('input',()=>{draftName=input.value;draftDirty=true;});
input.addEventListener('focus',()=>vscode.postMessage({type:'requestMode'}));
lineInput.addEventListener('focus',()=>vscode.postMessage({type:'requestMode'}));
function handleMeDockHistoryHotkeys(ev){
if((ev.metaKey||ev.ctrlKey)&&ev.key&&ev.key.toLowerCase()==='g'){
ev.preventDefault();
if(document.activeElement&&typeof document.activeElement.blur==='function')document.activeElement.blur();
if(ev.shiftKey){vscode.postMessage({type:'lineHistoryBack'});}
else{vscode.postMessage({type:'lineHistoryForward'});}
setTimeout(()=>vscode.postMessage({type:'requestMode'}),60);
}}
document.addEventListener('keydown',handleMeDockHistoryHotkeys,true);
histBack.disabled=true;histForward.disabled=true;applyMode(currentMode,currentValue,true,currentLine,markerOn,historyState,currentColor,flipMinusColor,flipPlusColor);
input.addEventListener('keydown',ev=>{if(ev.key==='Escape'){input.value=currentValue||'';input.blur()}});
let lineJumpTimer=0;
function scheduleLineJump(){clearTimeout(lineJumpTimer);lineJumpTimer=setTimeout(()=>{vscode.postMessage({type:'jumpLine',line:lineInput.value})},180)}
lineInput.addEventListener('input',()=>scheduleLineJump());
lineInput.addEventListener('keydown',ev=>{
  if(ev.key==='ArrowUp'||ev.key==='ArrowDown'){
    ev.preventDefault();
    clearTimeout(lineJumpTimer);
    let n=parseInt(String(lineInput.value||'1').trim(),10);
    if(!Number.isFinite(n)||Number.isNaN(n))n=1;
    n+=ev.key==='ArrowUp'?-1:1;
    if(n<1)n=1;
    lineInput.value=String(n);
    vscode.postMessage({type:'jumpLine',line:lineInput.value});
    try{lineInput.select();}catch(_){}
    return;
  }
  if(ev.key==='Enter'){ev.preventDefault();clearTimeout(lineJumpTimer);vscode.postMessage({type:'jumpLine',line:lineInput.value});return;}
  if(ev.key==='Escape'){lineInput.value=currentLine||'';lineInput.blur();return;}
});
window.addEventListener('message',event=>{const m=event.data;if(m&&m.type==='opResult'){showMeDockToast(m.text);return;}if(m&&m.type==='headWrap'){/* v0.9.780: 端→端の巡回時、Navigate Me!枠内に回転矢印を約2秒+その間tipを抑止。 */const ov=document.getElementById('head-wrap-overlay');if(ov){ov.classList.add('show');window.__headWrapUntil=Date.now()+300;if(typeof hideTocTip==='function')hideTocTip();clearTimeout(window.__headWrapT);window.__headWrapT=setTimeout(()=>{ov.classList.remove('show');window.__headWrapUntil=0;},300);}return;}if(m&&m.type==='bookmarkState'){renderBookmarkState(m.count||0,!!m.full,m.pending||[],!!m.pendingFull,m.marksInfo||[],m.home||null);return;}if(m&&m.type==='referenceState'){renderReferenceState(m);return;}if(m&&m.type==='rawState'){if(rawToggle)rawToggle.classList.toggle('on',!!m.on);return;}if(m&&m.type==='anchorState'){renderAnchorButton(m.anchor);if(m.bidi)renderBidiButton(m.bidi);return;}if(m&&m.type==='bidiState'){renderBidiButton(m.bidi);return;}if(m&&m.type==='mode'){/* v0.9.822: inMembraneをwebview状態として保持(applyMode/renderEditPanelModeが共通参照)。旧v801/802の事後remove('hidden')行は撤去=どの再描画経路でも消えない。 */inMembraneState=!!m.inMembrane;applyMode(m.mode,m.value,!!m.force,m.line,m.markerOn,m.history,m.color,m.flipMinusColor,m.flipPlusColor,m.navDepth,m.anchor);if(typeof m.standardsOn==='boolean'&&m.standardsOn!==standardsOn){standardsOn=m.standardsOn;renderStandardsToggle();}if(m.headNav)renderHeadNav(m.headNav);if(m.markNav)renderMarkNav(m.markNav);window.__navOnly=null;}if(m&&m.type==='setLineValue'&&lineInput){lineInput.value=String(m.value||'');currentLine=lineInput.value;}if(m&&m.type==='fixedToc')renderFixedToc(m.toc);if(m&&m.type==='loadFmt'){const f=m.fmt;if(f){const restoreSlots=(slots,idxVal,src)=>{if(Array.isArray(src)){for(let i=0;i<3;i++){if(src[i])Object.assign(slots[i],src[i]);}return Math.max(0,Math.min(2,Number(idxVal)||0));}if(src&&typeof src==='object'){Object.assign(slots[0],src);return 0;}return null;};const hi=restoreSlots(fmtHlSlots,f.hlIdx,f.highlight);if(hi!==null)fmtHlIdx=hi;const si=restoreSlots(fmtStSlots,f.stIdx,f.strike);if(si!==null)fmtStIdx=si;if(f.heading){[1,2,3].forEach(L=>{const hc=f.heading[L]||f.heading[String(L)];if(hc)Object.assign(fmtHeadingColors[L],hc);});}if(f.level)fmtHeadingLevel=Math.max(1,Math.min(3,Number(f.level)||2));fmtSpec.highlight=fmtHlSlots[fmtHlIdx];fmtSpec.strike=fmtStSlots[fmtStIdx];fmtSpec.heading=fmtHeadingColors[fmtHeadingLevel];if(fmtHeading)fmtHeading.textContent='#'.repeat(fmtHeadingLevel);if(fmtHighlight)fmtHighlight.textContent='='.repeat([2,1,3][fmtHlIdx]);if(fmtStrike)fmtStrike.textContent='~'.repeat([2,1,3][fmtStIdx]);if(typeof renderFmtBtnColors==='function')renderFmtBtnColors();if(fmtPop&&fmtPop.classList.contains('on'))renderFmtPop();}return;}if(m&&m.type==='zoomMeLoaded'){renderZoomMeLoaded(m.label||'');if(m.mode==='me'){zoomMembraneNameValue=m.start!==undefined?String(m.start):zoomMembraneNameValue;zoomMembraneCountValue=m.end!==undefined?String(m.end):zoomMembraneCountValue;}else{zoomLineStartValue=m.start!==undefined?String(m.start):zoomLineStartValue;zoomLineEndValue=m.end!==undefined?String(m.end):zoomLineEndValue;}if(m.mode){applyZoomMeMode(m.mode,true);}}if(m&&m.type==='focusName')focusNameInput(m.select!==false);});
