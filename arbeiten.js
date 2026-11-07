/* ============================================================
   BYTEWERK STUDIO — arbeiten.js
   ------------------------------------------------------------
   Werkverzeichnis: filter, keyboard navigation and the
   cursor-following preview card. No dependencies.

   The list works without this file: every row is a normal
   link, every product page is reachable. The script only
   adds filtering, arrow-key movement and the desktop preview.
   ============================================================ */

(function () {
  'use strict';

  var list = document.querySelector('.wk-index');
  if (!list) return;

  var rows = Array.prototype.slice.call(list.querySelectorAll('.wk-row'));
  var links = rows.map(function (row) { return row.querySelector('.wk-link'); });
  var filters = Array.prototype.slice.call(document.querySelectorAll('.wk-filter'));
  var visibleCount = document.querySelector('[data-wk-visible]');
  var emptyNote = document.querySelector('.wk-empty');
  var preview = document.querySelector('.wk-preview');
  var previewMedia = preview ? preview.querySelector('.wk-preview-media') : null;
  var previewName = preview ? preview.querySelector('.wk-preview-name') : null;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  var HASH = { app: '#apps', game: '#games' };
  var FROM_HASH = { '#apps': 'app', '#games': 'game' };

  /* ---------- filter ---------- */

  function applyFilter(value, remember) {
    var shown = 0;

    rows.forEach(function (row) {
      var keep = value === 'all' || row.getAttribute('data-kind') === value;
      row.hidden = !keep;
      if (keep) shown += 1;
    });

    filters.forEach(function (btn) {
      var active = btn.getAttribute('data-filter') === value;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (visibleCount) visibleCount.textContent = String(shown);
    if (emptyNote) emptyNote.hidden = shown !== 0;

    if (remember && window.history && window.history.replaceState) {
      var hash = value === 'all' ? '' : HASH[value];
      window.history.replaceState(null, '', window.location.pathname + window.location.search + (hash || ''));
    }

    hidePreview();
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyFilter(btn.getAttribute('data-filter'), true);
    });
  });

  var initial = FROM_HASH[window.location.hash] || 'all';
  var known = filters.some(function (b) { return b.getAttribute('data-filter') === initial; });
  applyFilter(known ? initial : 'all', false);

  /* ---------- keyboard: arrow keys move between visible rows ---------- */

  function visibleLinks() {
    return links.filter(function (link) {
      var row = link.parentNode;
      return row && !row.hidden;
    });
  }

  list.addEventListener('keydown', function (event) {
    var key = event.key;
    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;

    var open = visibleLinks();
    var current = open.indexOf(document.activeElement);
    if (current === -1) return;

    var next = current;
    if (key === 'ArrowDown') next = Math.min(open.length - 1, current + 1);
    if (key === 'ArrowUp') next = Math.max(0, current - 1);
    if (key === 'Home') next = 0;
    if (key === 'End') next = open.length - 1;

    if (next !== current) {
      event.preventDefault();
      open[next].focus();
    }
  });

  /* ---------- preview card ---------- */

  var previewIndex = -1;

  function hidePreview() {
    if (!preview) return;
    preview.classList.remove('is-on');
    previewIndex = -1;
  }

  function buildPreview(link) {
    var src = link.getAttribute('data-preview-img') || link.getAttribute('data-preview-mark');
    if (!src) return false;

    var isMark = !link.getAttribute('data-preview-img');
    var img = document.createElement('img');
    var srcset = link.getAttribute('data-preview-srcset');
    if (srcset) {
      img.setAttribute('srcset', srcset);
      img.setAttribute('sizes', '306px');
    }
    img.src = src;
    img.alt = '';
    img.decoding = 'async';
    if (isMark) img.className = 'is-mark';

    previewMedia.textContent = '';
    previewMedia.appendChild(img);
    preview.setAttribute('data-tone', link.getAttribute('data-preview-tone') || 'paper');

    var title = link.querySelector('.wk-title');
    if (previewName && title) previewName.textContent = title.textContent;
    return true;
  }

  function placePreview(x, y) {
    var pad = 14;
    var rect = preview.getBoundingClientRect();
    var left = x + 26;
    var top = y - rect.height / 2;

    if (left + rect.width > window.innerWidth - pad) left = x - rect.width - 22;
    left = Math.max(pad, Math.min(left, window.innerWidth - rect.width - pad));
    top = Math.max(pad, Math.min(top, window.innerHeight - rect.height - pad));

    preview.style.transform = 'translate3d(' + Math.round(left) + 'px,' + Math.round(top) + 'px,0)';
  }

  if (preview && previewMedia && finePointer.matches) {
    list.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'touch') return;

      var link = event.target.closest ? event.target.closest('.wk-link') : null;
      if (!link) { hidePreview(); return; }

      var index = links.indexOf(link);
      if (index === -1) return;

      if (index !== previewIndex) {
        if (!buildPreview(link)) { hidePreview(); return; }
        previewIndex = index;
      }

      preview.style.transform = preview.style.transform || 'translate3d(0,0,0)';
      if (!preview.classList.contains('is-on')) {
        /* measure once while hidden, then place and reveal */
        placePreview(event.clientX, event.clientY);
        preview.classList.add('is-on');
      } else {
        placePreview(event.clientX, event.clientY);
      }
    }, { passive: true });

    list.addEventListener('pointerleave', hidePreview);

    window.addEventListener('scroll', hidePreview, { passive: true });
  } else if (preview) {
    preview.parentNode && preview.parentNode.removeChild(preview);
  }
})();
