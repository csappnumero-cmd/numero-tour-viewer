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
})();
