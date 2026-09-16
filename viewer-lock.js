(function(){
  'use strict';
  window.NUMERO_VIEWER_MODE = true;
  try { document.documentElement.setAttribute('data-numero-viewer','1'); } catch(e) {}

  var blockedSelector = [
    '[data-system-index]',
    '.quality-node',
    '.review-ribbon-tab',
    '.operation-row',
    '.system-card',
    '#managementSystemDetails',
    '#managementSystemLink',
    '#managementSystemModalLink',
    '#trackingToolLink',
    '#trackingDevLink',
    '#clickupToolLink',
    '#clickupDevLink',
    '#openBtn',
    '#expandBtn',
    '#modalLink',
    '#detailLink',
    '#traineeDetailsBtn',
    '#traineeOpenBtn',
    '.modal-link',
    '.detail-link',
    '.management-system-action',
    '.management-system-modal-link',
    '.management-tool-link',
    '.trainee-system-btn',
    '.exam-open',
    'a[target="_blank"]'
  ].join(',');

  function blockedTarget(target){
    if(!target || !target.closest) return null;
    return target.closest(blockedSelector);
  }

  function stopViewerInteraction(event){
    if(!blockedTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
  }

  ['pointerdown','mousedown','touchstart','click','dblclick','auxclick'].forEach(function(type){
    document.addEventListener(type, stopViewerInteraction, true);
  });
  document.addEventListener('keydown', function(event){
    if((event.key === 'Enter' || event.key === ' ') && blockedTarget(event.target)) {
      stopViewerInteraction(event);
    }
  }, true);

  /* Viewer build never opens external systems. Tour page-to-page navigation uses location, not window.open. */
  try {
    window.open = function(){ return null; };
  } catch(e) {}

  function sanitize(root){
    var scope = (root && root.querySelectorAll) ? root : document;
    try {
      scope.querySelectorAll('[data-system-index],.quality-node,.review-ribbon-tab,.operation-row,.system-card').forEach(function(el){
        el.setAttribute('aria-disabled','true');
        el.setAttribute('tabindex','-1');
        el.style.cursor = 'default';
      });
    } catch(e) {}
    try {
      scope.querySelectorAll('a[target="_blank"],#managementSystemLink,#managementSystemModalLink,#trackingToolLink,#trackingDevLink,#clickupToolLink,#clickupDevLink,#modalLink,#detailLink').forEach(function(a){
        a.removeAttribute('href');
      });
    } catch(e) {}
  }

  function ready(){
    sanitize(document);
    try {
      var observer = new MutationObserver(function(records){
        records.forEach(function(record){
          record.addedNodes.forEach(function(node){
            if(node && node.nodeType === 1) sanitize(node);
          });
        });
      });
      observer.observe(document.body, {childList:true, subtree:true});
    } catch(e) {}
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, {once:true});
  else ready();


  /* Viewer-only control safety -------------------------------------------------
     1) Arabic captions must obey the AR toggle on every page.
     2) Muting narration must NOT pause the presentation.  We mark the voice
        toggle click so tour-audio.js can mute the currently-playing MP3
        without cancelling it; letting it reach "ended" preserves the normal
        page timeline/callbacks. */
  var viewerControlStyle = document.createElement('style');
  viewerControlStyle.id = 'numero-viewer-control-safety';
  viewerControlStyle.textContent = [
    'html[data-numero-viewer-ar="0"] .tour-ar-subtitle,',
    'html[data-numero-viewer-ar="0"] .tour-ar-extra,',
    'html[data-numero-viewer-ar="0"] .dialogue-ar,',
    'html[data-numero-viewer-ar="0"] #dialogueAr,',
    'html[data-numero-viewer-ar="0"] #photoDialogueAr,',
    'html[data-numero-viewer-ar="0"] #systemDialogueAr,',
    'html[data-numero-viewer-ar="0"] .bridge-dialogue-ar,',
    'html[data-numero-viewer-ar="0"] #bridgeDialogueArabic {',
    '  display:none !important; opacity:0 !important; visibility:hidden !important;',
    '}',
    'html[data-numero-viewer-ar="1"] .tour-ar-subtitle,',
    'html[data-numero-viewer-ar="1"] .tour-ar-extra {',
    '  visibility:visible !important;',
    '}'
  ].join('\\n');
  try { (document.head || document.documentElement).appendChild(viewerControlStyle); } catch(e) {}

  function readArabicPreference(){
    try { return localStorage.getItem('support_center_ar') !== '0'; }
    catch(e) { return true; }
  }
  function syncViewerArabic(){
    try { document.documentElement.setAttribute('data-numero-viewer-ar', readArabicPreference() ? '1' : '0'); }
    catch(e) {}
  }
  syncViewerArabic();

  var AR_IDS = { arBtn:1, arabicToggle:1, tourArabicToggle:1 };
  var VOICE_IDS = { voiceBtn:1, voiceToggle:1, tourVoiceToggle:1 };

  document.addEventListener('click', function(event){
    var target = event.target && event.target.closest ? event.target.closest('button,[role="button"]') : event.target;
    var id = target ? String(target.id || '') : '';

    if (AR_IDS[id]) {
      /* Run after the page's own click handler stores the new state. */
      window.setTimeout(syncViewerArabic, 0);
      window.setTimeout(syncViewerArabic, 80);
    }

    if (VOICE_IDS[id]) {
      /* Capture flag is consumed by tour-audio.js only for this click. */
      window.__numeroViewerVoiceToggleClick = true;
      window.setTimeout(function(){
        window.__numeroViewerVoiceToggleClick = false;
        try {
          var on = localStorage.getItem('support_center_voice') !== '0';
          var a = window.__numeroTourSharedAudio;
          if (a) a.muted = !on;
        } catch(e) {}
      }, 120);
    }
  }, true);

  window.addEventListener('storage', function(event){
    if (!event || event.key === 'support_center_ar') syncViewerArabic();
  });

})();
