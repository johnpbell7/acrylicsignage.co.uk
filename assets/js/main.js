/* ============================================================
   Acrylic Signage — interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---- always land at the top on (re)load, regardless of browser memory ---- */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  // belt-and-braces: catch any late layout shifts that bump the position
  window.addEventListener('load', function () { window.scrollTo(0, 0); });

  /* ---- intro overlay: short welcome — plays every page load ---- */
  (function () {
    var intro = document.getElementById('intro');
    if (!intro) return;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function finish() {
      document.body.classList.remove('intro-active');
      intro.remove();
      window.dispatchEvent(new Event('intro:done'));
    }

    if (reduce || !window.gsap) {
      requestAnimationFrame(finish);
      return;
    }

    document.body.classList.add('intro-active');
    var signs = intro.querySelectorAll('.intro__sign');
    var word  = intro.querySelector('.intro__word');
    var sub   = intro.querySelector('.intro__sub');
    var inner = intro.querySelector('.intro__inner');

    // each sign gets a small base rotation so the row feels hand-pinned, not a line of stamps
    var rots = [-7, 4, -3, 6];
    signs.forEach(function (el, i) {
      gsap.set(el, { autoAlpha: 0, y: 30, scale: 0.7, rotation: rots[i % rots.length] });
    });
    gsap.set([word, sub], { autoAlpha: 0, y: 14 });

    var tl = gsap.timeline({ onComplete: finish });
    tl.to(signs, {
        autoAlpha: 1, y: 0, scale: 1,
        duration: 0.55,
        ease: 'back.out(1.5)',
        stagger: { each: 0.08, from: 'start' }
      })
      .to(word, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2')
      .to(sub,  { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' }, '-=0.3')
      .to(inner, { y: -14, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, '+=0.55')
      .to(intro, { autoAlpha: 0, duration: 0.4, ease: 'power2.inOut' }, '-=0.15');
  })();

  /* ---- inject custom icons everywhere [data-icon] ---- */
  document.querySelectorAll('[data-icon]').forEach(function (el) {
    var name = el.getAttribute('data-icon');
    if (window.AS_ICONS && window.AS_ICONS[name]) {
      el.innerHTML = window.AS_ICONS[name];
    }
  });

  /* ---- expose the live nav height as a CSS var so the mobile menu sits flush ---- */
  (function () {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    function setNavH() {
      var h = nav.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--nav-h', h + 'px');
    }
    setNavH();
    window.addEventListener('resize', setNavH);
    window.addEventListener('orientationchange', setNavH);
    window.addEventListener('load', setNavH);
  })();

  /* ---- ticker: duplicate items once for seamless mobile marquee ---- */
  var tickerTrack = document.querySelector('.ticker__track');
  if (tickerTrack && !tickerTrack.dataset.cloned) {
    tickerTrack.innerHTML = tickerTrack.innerHTML + tickerTrack.innerHTML;
    tickerTrack.dataset.cloned = '1';
  }

  /* ---- hero carousel: 4 slides, auto-rotate, dots, pause on hover ---- */
  (function () {
    var carousel = document.querySelector('.hero__carousel');
    var dotsWrap = document.querySelector('.hero__dots');
    if (!carousel || !dotsWrap) return;

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero__slide'));
    var dots   = Array.prototype.slice.call(dotsWrap.querySelectorAll('.hero__dot'));
    if (!slides.length) return;

    var current = 0;
    // per-slide dwell time: slide 0 has the video — let it breathe.
    // anything else stays on the standard 5s rotation
    var DWELL_DEFAULT = 5000;
    var DWELL_BY_INDEX = { 0: 8500 };
    function dwellFor(i) { return DWELL_BY_INDEX[i] || DWELL_DEFAULT; }
    var timer = null;
    var paused = false;

    // state targets per offset — values match the CSS state classes but driven
    // by GSAP so we get a single smooth, eased tween between any two states
    function targetFor(offset, n) {
      if (offset === 0)       return { translateX: '-50%', scale: 1.00, rotation:  0, opacity: 1.00, zIndex: 3 };
      if (offset === 1)       return { translateX: '-20%', scale: 0.80, rotation:  6, opacity: 0.55, zIndex: 2 };
      if (offset === n - 1)   return { translateX: '-80%', scale: 0.80, rotation: -6, opacity: 0.55, zIndex: 2 };
      return                       { translateX:  '30%', scale: 0.74, rotation:  9, opacity: 0.00, zIndex: 1 };
    }

    // give each slide its own GSAP "lane" so concurrent tweens overwrite cleanly
    var slideTweens = slides.map(function () { return null; });

    function apply() {
      var n = slides.length;
      slides.forEach(function (s, idx) {
        var offset = ((idx - current) % n + n) % n;
        s.classList.remove('is-active', 'is-prev', 'is-next', 'is-far');
        if (offset === 0)            { s.classList.add('is-active'); s.setAttribute('aria-hidden', 'false'); }
        else if (offset === 1)       { s.classList.add('is-next');   s.setAttribute('aria-hidden', 'true');  }
        else if (offset === n - 1)   { s.classList.add('is-prev');   s.setAttribute('aria-hidden', 'true');  }
        else                         { s.classList.add('is-far');    s.setAttribute('aria-hidden', 'true');  }

        if (window.gsap) {
          var t = targetFor(offset, n);
          if (slideTweens[idx]) slideTweens[idx].kill();
          slideTweens[idx] = gsap.to(s, {
            x: 0, y: 0,
            xPercent: parseFloat(t.translateX),
            scale: t.scale,
            rotation: t.rotation,
            autoAlpha: t.opacity,
            zIndex: t.zIndex,
            duration: 0.85,
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }
      });
      dots.forEach(function (d, i) {
        var on = i === current;
        d.classList.toggle('is-active', on);
        d.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }
    function show(i) {
      i = (i + slides.length) % slides.length;
      if (i === current) return;
      current = i;
      apply();
    }
    apply(); // initial state
    function next() { show(current + 1); start(); }
    function start() {
      stop();
      if (paused) return;
      // setTimeout chain so each slide's dwell can differ (slide 0 holds the video longer)
      timer = setTimeout(next, dwellFor(current));
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start(); // reset timer when user picks one
      });
    });

    // pause on hover / focus, resume on leave
    var host = carousel.parentElement; // .hero__visual
    host.addEventListener('mouseenter', function () { paused = true; stop(); });
    host.addEventListener('mouseleave', function () { paused = false; start(); });
    host.addEventListener('focusin',    function () { paused = true; stop(); });
    host.addEventListener('focusout',   function () { paused = false; start(); });

    /* swipe / drag — thumb-friendly on mobile, mouse-drag on desktop */
    var dragStartX = 0, dragStartY = 0, dragDX = 0, dragging = false, swiped = false;
    var SWIPE_THRESHOLD = 40; // px

    function dragStart(x, y) {
      dragStartX = x; dragStartY = y; dragDX = 0;
      dragging = true; swiped = false;
      paused = true; stop();
      carousel.classList.add('is-dragging');
    }
    function dragMove(x, y) {
      if (!dragging) return;
      dragDX = x - dragStartX;
      var dy = y - dragStartY;
      // if movement is mostly horizontal and big enough, decide which way to go
      if (!swiped && Math.abs(dragDX) > SWIPE_THRESHOLD && Math.abs(dragDX) > Math.abs(dy)) {
        if (dragDX < 0) show(current + 1);
        else show(current - 1);
        swiped = true;
      }
    }
    function dragEnd() {
      if (!dragging) return;
      dragging = false;
      carousel.classList.remove('is-dragging');
      paused = false;
      start();
    }

    // touch (mobile)
    carousel.addEventListener('touchstart', function (e) {
      dragStart(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    carousel.addEventListener('touchmove', function (e) {
      dragMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    carousel.addEventListener('touchend',    dragEnd);
    carousel.addEventListener('touchcancel', dragEnd);

    // pointer (desktop mouse + stylus). Skip if it's a touch pointer (already handled).
    carousel.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      dragStart(e.clientX, e.clientY);
      try { carousel.setPointerCapture(e.pointerId); } catch (_) {}
    });
    carousel.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      dragMove(e.clientX, e.clientY);
    });
    carousel.addEventListener('pointerup',     function (e) { if (e.pointerType !== 'touch') dragEnd(); });
    carousel.addEventListener('pointercancel', function (e) { if (e.pointerType !== 'touch') dragEnd(); });

    // honour reduced-motion: still show dots, but no auto-rotate
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) start();

    // pause when the tab is hidden, resume when back
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else if (!paused && !reduce) start();
    });
  })();

  /* ---- nav: shadow on scroll + mobile toggle ---- */
  var nav = document.querySelector('.nav');
  var burger = document.querySelector('.nav__burger');
  function onScroll() {
    if (window.scrollY > 8) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (burger) {
    burger.addEventListener('click', function () {
      document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', document.body.classList.contains('menu-open'));
    });
  }
  document.querySelectorAll('.nav__links a').forEach(function (a) {
    a.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
  });

  /* scroll reveal is handled in animations.js (GSAP ScrollTrigger.batch).
     If GSAP fails to load, animations.js falls back to revealing everything. */

  /* ---- applications tabs (business / home) ---- */
  var tabs = document.querySelectorAll('.apps__tab');
  var grids = document.querySelectorAll('.apps-grid');
  var pics  = document.querySelectorAll('.apps__pic');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-tab');

      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      // swap the contextual image with a crossfade
      pics.forEach(function (p) {
        var on = p.getAttribute('data-pic') === target;
        p.classList.toggle('is-active', on);
        if (window.gsap) {
          window.gsap.to(p, {
            autoAlpha: on ? 1 : 0,
            scale: on ? 1 : 0.97,
            duration: 0.45,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        }
      });

      // swap the grid
      grids.forEach(function (g) {
        var match = g.getAttribute('data-grid') === target;
        g.hidden = !match;
        if (match) {
          var items = g.querySelectorAll('.app');
          if (window.gsap) {
            window.gsap.fromTo(items,
              { y: 16, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.out', stagger: 0.035, overwrite: 'auto' }
            );
          }
        }
      });
    });
  });

  /* ============================================================
     FORM — GoHighLevel ready
     ------------------------------------------------------------
     Wiring options (pick ONE on the back end):

     A) GHL native form embed:  replace the whole <form> with the
        iframe GHL gives you. Skip this JS entirely.

     B) Inbound webhook (recommended for a coded site):
        set GHL_WEBHOOK_URL below to your GHL workflow's
        "Inbound Webhook" trigger URL. This posts the lead JSON.

     C) Form POST to GHL form action URL: set FORM_ENDPOINT.

     Until an endpoint is set, the form runs in DEMO mode and just
     shows the success state without sending anything.
     ============================================================ */
  var GHL_WEBHOOK_URL = ''; // <-- paste your GHL inbound webhook URL here
  var form = document.getElementById('enquiryForm');
  if (!form) return;

  // assigned by the calculator block; clears the quote basket after a send
  var resetCalcBasket = function () {};

  /* ============================================================
     FORM TAB TOGGLE  +  3D LETTERS CALCULATOR
     ------------------------------------------------------------
     - Two form panes ("general" + "calc") with a tab switcher
     - Calculator computes a live price using a transparent formula
       that mimics MDP Supplies' flat-cut letter pricing
     - 30% mark-up is applied silently in the price function — the
       user only ever sees the marked-up total
     - "Add to enquiry" copies the quote into the general form
       and shows a summary card; submitting the general form sends
       contact info + the attached quote together
     ============================================================ */
  var formTabs  = document.querySelectorAll('.form-tab');
  var formPanes = document.querySelectorAll('.form-pane');
  function showPane(name) {
    formTabs.forEach(function (t) {
      var on = t.getAttribute('data-tab') === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    formPanes.forEach(function (p) {
      var on = p.getAttribute('data-pane') === name;
      p.hidden = !on;
      p.classList.toggle('is-active', on);
    });
  }
  formTabs.forEach(function (t) {
    t.addEventListener('click', function () { showPane(t.getAttribute('data-tab')); });
  });

  /* ---- 3D letters pricing engine (area-based, mirrors MDP's input flow) ---- */
  // hidden base cost rates — user only sees the marked-up total.
  // Material rate per cm² of cut area (3mm thickness across the board, as MDP).
  var MAT_PER_CM2 = {
    foamboard: 0.011,   // 3mm foamboard, cheap internal
    acm:       0.022,   // 3mm aluminium composite
    acrylic:   0.028    // 3mm acrylic
  };
  var MAT_LABEL = {
    foamboard: '3mm Foamboard',
    acm:       '3mm Aluminium composite',
    acrylic:   '3mm Acrylic'
  };
  // finish surcharge per cm² of cut area (brushed costs more in stock + waste)
  var FIN_PER_CM2  = { matt: 0,      gloss: 0.003,  brushed: 0.010 };
  var FINISH_LABEL = { matt: 'Matt', gloss: 'Gloss', brushed: 'Brushed' };
  // per-piece cutting handling — each separate letter / logo piece has a fixed cost
  var PIECE_COST = 1.40;
  // fixings — per piece
  var FIX_RATE  = { none: 0, vhb_tape: 0.40, sign_locators: 3.50, sign_locators_clad: 4.50, vhb_vinyl: 0.80 };
  var FIX_LABEL = {
    none: 'No fixings',
    vhb_tape: 'VHB tape + cardboard template',
    sign_locators: 'Sign locators + template',
    sign_locators_clad: 'Sign locators + cladding template',
    vhb_vinyl: 'VHB tape + vinyl template'
  };
  var SETUP_FEE = 25;
  var MINIMUM   = 55;
  var MARKUP    = 1.30;  // 30% mark-up, hidden from user

  // material → allowed finishes (matches MDP: foamboard matt only, acrylic gloss only, ACM all three)
  var FINISH_OPTIONS = {
    foamboard: ['matt'],
    acm:       ['matt', 'gloss', 'brushed'],
    acrylic:   ['gloss']
  };

  function calcSpec() {
    return {
      width:  parseInt(document.getElementById('c-width').value, 10)  || 0,
      height: parseInt(document.getElementById('c-height').value, 10) || 0,
      text: (document.getElementById('c-text').value || '').trim(),
      qty: parseInt(document.getElementById('c-qty').value, 10) || 1,
      material: document.getElementById('c-material').value,
      finish: document.getElementById('c-finish').value,
      fixings: document.getElementById('c-fixings').value
    };
  }
  function pieceCount(text) {
    // strip whitespace + non-printable, count remaining as pieces
    var clean = (text || '').replace(/\s+/g, '');
    return clean.length;
  }
  function calcPrice(s) {
    if (!s.width || !s.height) return 0;
    var pieces = pieceCount(s.text);
    if (pieces === 0) return 0;

    var areaCm2  = (s.width / 10) * (s.height / 10);          // bounding-box area
    var matCost  = areaCm2 * (MAT_PER_CM2[s.material] || MAT_PER_CM2.acm);
    var finCost  = areaCm2 * (FIN_PER_CM2[s.finish]   || 0);
    var pieceCst = pieces  * PIECE_COST;
    var fixCost  = pieces  * (FIX_RATE[s.fixings] || 0);

    var subtotal = matCost + finCost + pieceCst + fixCost + SETUP_FEE;
    subtotal *= (s.qty || 1);
    var withMin = Math.max(MINIMUM, subtotal);
    return Math.round(withMin * MARKUP);  // markup applied silently
  }
  function fmtGBP(n) {
    if (!n) return '£—';
    return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  var calcForm = document.getElementById('calcForm');
  if (calcForm) {
    var totalEl = document.getElementById('calcTotal');
    var textEl  = document.getElementById('c-text');
    var hintEl  = document.getElementById('c-text-hint');
    var matEl   = document.getElementById('c-material');
    var finEl   = document.getElementById('c-finish');
    var prevText  = document.getElementById('calcPreviewText');
    var prevStage = prevText && prevText.closest('.calc__preview-stage');

    // restrict finish options based on selected material
    function syncFinish() {
      var allowed = FINISH_OPTIONS[matEl.value] || ['gloss'];
      Array.from(finEl.options).forEach(function (opt) {
        opt.disabled = allowed.indexOf(opt.value) === -1;
      });
      if (allowed.indexOf(finEl.value) === -1) finEl.value = allowed[0];
    }

    function updateTotal() {
      var s = calcSpec();
      totalEl.textContent = fmtGBP(calcPrice(s));
      if (hintEl) {
        var n = pieceCount(s.text);
        hintEl.textContent = n + ' piece' + (n === 1 ? '' : 's');
      }
      // live lettering preview — text + material/finish tint
      if (prevText) {
        var hasText = !!s.text;
        prevText.textContent = hasText ? s.text : 'Your text here';
        prevText.classList.toggle('is-empty', !hasText);
      }
      if (prevStage) {
        prevStage.setAttribute('data-material', s.material);
        prevStage.setAttribute('data-finish', s.finish);
      }
    }
    calcForm.addEventListener('input', updateTotal);
    calcForm.addEventListener('change', function () { syncFinish(); updateTotal(); });
    syncFinish();
    updateTotal();

    /* ---- Collapsible steps: each section folds into a summary once filled ----
       Steps reveal one at a time. Completing a step (Continue / Done) collapses
       it to a one-line summary and opens the next unfinished step. The header of
       a completed step acts as an Edit toggle that reopens it. When every step is
       complete the whole form is collapsed and only the quote total remains. */
    var stepEls   = Array.prototype.slice.call(calcForm.querySelectorAll('.calc__step'));
    var completed = stepEls.map(function () { return false; });

    function stepSummary(idx) {
      var s = calcSpec();
      switch (idx) {
        case 0:
          var n = pieceCount(s.text);
          return '“' + (s.text || '—') + '” · Qty ' + (s.qty || 1)
               + ' · ' + n + ' piece' + (n === 1 ? '' : 's');
        case 1:
          return s.width + ' × ' + s.height + ' mm';
        case 2:
          return MAT_LABEL[s.material] + ' · ' + FINISH_LABEL[s.finish];
        case 3:
          return FIX_LABEL[s.fixings];
      }
      return '';
    }

    function markInvalid(id) {
      var el = document.getElementById(id);
      if (el) el.closest('.field').classList.add('invalid');
    }
    function validateStep(idx) {
      stepEls[idx].querySelectorAll('.field.invalid').forEach(function (f) {
        f.classList.remove('invalid');
      });
      var s = calcSpec();
      var ok = true;
      if (idx === 0) {
        if (!s.text) { markInvalid('c-text'); ok = false; }
      } else if (idx === 1) {
        if (!s.width  || s.width  < 20) { markInvalid('c-width');  ok = false; }
        if (!s.height || s.height < 20) { markInvalid('c-height'); ok = false; }
      }
      return ok;
    }

    function paintSteps(openIdx) {
      stepEls.forEach(function (step, i) {
        var isOpen = i === openIdx;
        step.classList.toggle('is-open', isOpen);
        step.classList.toggle('is-done', completed[i] && !isOpen);
        step.classList.toggle('is-pending', !completed[i] && !isOpen);
        var toggle  = step.querySelector('.calc__step-toggle');
        var summary = step.querySelector('.calc__step-summary');
        if (toggle)  toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (summary) summary.textContent = completed[i] ? stepSummary(i) : '';
      });
    }

    function openStep(idx, focus) {
      paintSteps(idx);
      if (focus && idx >= 0) {
        var f = stepEls[idx].querySelector('input, select');
        if (f) setTimeout(function () { f.focus(); }, 60);
      }
    }

    function advance(idx) {
      if (!validateStep(idx)) {
        var bad = stepEls[idx].querySelector('.field.invalid input, .field.invalid select');
        if (bad) bad.focus();
        return;
      }
      completed[idx] = true;
      updateTotal();
      // find the next unfinished step (search forward, then from the start)
      var next = -1;
      for (var i = idx + 1; i < stepEls.length; i++) { if (!completed[i]) { next = i; break; } }
      if (next === -1) {
        for (var j = 0; j < stepEls.length; j++) { if (!completed[j]) { next = j; break; } }
      }
      if (next === -1) {
        openStep(-1, false);  // everything done — fully collapsed, quote on show
      } else {
        openStep(next, true);
      }
    }

    stepEls.forEach(function (step, i) {
      var toggle = step.querySelector('.calc__step-toggle');
      if (toggle) toggle.addEventListener('click', function () {
        // header only acts as an Edit toggle for completed (collapsed) steps
        if (!step.classList.contains('is-open') && completed[i]) openStep(i, true);
      });
      var next = step.querySelector('.calc__step-next');
      if (next) next.addEventListener('click', function () { advance(i); });
    });

    openStep(0, false);

    /* ---- Add to enquiry + multi-item quote basket ----
       Adding a configured sign drops it into a basket on the general form.
       "Add another sign" sends you back to a fresh calculator, so a single
       enquiry can carry several quotes. Each basket item can be edited (loads
       it back into the calculator) or removed. */
    var addBtn      = document.getElementById('calcAdd');
    var addBtnLabel = addBtn.querySelector('.label');
    var basketEl    = document.getElementById('basket');
    var basketList  = document.getElementById('basketList');
    var basketCount = document.getElementById('basketCount');
    var basketTotal = document.getElementById('basketTotal');
    var basketAdd   = document.getElementById('basketAdd');
    var quotesData  = document.getElementById('quotesData');
    var typeSel     = document.getElementById('f-type');
    var detailsEl   = document.getElementById('f-details');

    var basket      = [];    // [{ spec, price }]
    var editIndex   = null;  // basket index being re-edited, or null for a new add
    var autoDetails = '';    // last details string we auto-wrote (don't clobber user edits)

    function esc(str) {
      return String(str).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    function specLine(s) {
      var n = pieceCount(s.text);
      return s.width + ' × ' + s.height + ' mm · ' + MAT_LABEL[s.material]
           + ' · ' + FINISH_LABEL[s.finish] + ' · ' + FIX_LABEL[s.fixings]
           + ' · ' + n + ' piece' + (n === 1 ? '' : 's');
    }
    function basketTotalValue() {
      return basket.reduce(function (t, q) { return t + (q.price || 0); }, 0);
    }
    function basketSummaryText() {
      if (!basket.length) return '';
      var lines = basket.map(function (q, i) {
        var s = q.spec;
        return (i + 1) + '. "' + s.text + '" — ' + s.width + '×' + s.height + 'mm, '
             + MAT_LABEL[s.material] + ' (' + FINISH_LABEL[s.finish] + '), '
             + FIX_LABEL[s.fixings] + ', ×' + s.qty + ' — ' + fmtGBP(q.price);
      });
      var head = basket.length === 1 ? '3D letters quote:' : '3D letters quotes (' + basket.length + '):';
      return head + '\n' + lines.join('\n') + '\nEstimated total ' + fmtGBP(basketTotalValue()) + '.';
    }

    function renderBasket() {
      basketEl.hidden = basket.length === 0;
      basketCount.textContent = basket.length ? '(' + basket.length + ')' : '';
      basketTotal.textContent = fmtGBP(basketTotalValue());
      basketList.innerHTML = basket.map(function (q, i) {
        var s = q.spec;
        return '<li class="basket__item">'
          +   '<div class="basket__item-main">'
          +     '<span class="basket__item-title">“' + esc(s.text) + '” · ×' + s.qty + '</span>'
          +     '<span class="basket__item-spec">' + esc(specLine(s)) + '</span>'
          +   '</div>'
          +   '<div class="basket__item-side">'
          +     '<span class="basket__item-price">' + fmtGBP(q.price) + '</span>'
          +     '<div class="basket__item-actions">'
          +       '<button type="button" data-basket-edit="' + i + '">Edit</button>'
          +       '<button type="button" data-basket-remove="' + i + '">Remove</button>'
          +     '</div>'
          +   '</div>'
          + '</li>';
      }).join('');

      // keep the hidden field, sign-type and details textarea in sync
      quotesData.value = basket.length ? JSON.stringify(basket) : '';
      if (basket.length && typeSel) {
        for (var i = 0; i < typeSel.options.length; i++) {
          if (/3d letters/i.test(typeSel.options[i].value)) { typeSel.selectedIndex = i; break; }
        }
      }
      if (detailsEl && (detailsEl.value.trim() === '' || detailsEl.value === autoDetails)) {
        autoDetails = basketSummaryText();
        detailsEl.value = autoDetails;
      }
    }

    // load a saved spec back into the calculator inputs
    function loadSpec(s) {
      textEl.value = s.text;
      document.getElementById('c-qty').value = s.qty;
      document.getElementById('c-width').value = s.width;
      document.getElementById('c-height').value = s.height;
      matEl.value = s.material;
      syncFinish();
      finEl.value = s.finish;
      document.getElementById('c-fixings').value = s.fixings;
      updateTotal();
    }
    // reset the calculator to defaults for a brand-new sign
    function resetCalc() {
      textEl.value = '';
      document.getElementById('c-qty').value = 1;
      document.getElementById('c-width').value = 1000;
      document.getElementById('c-height').value = 500;
      matEl.value = 'acm';
      syncFinish();
      finEl.value = 'gloss';
      document.getElementById('c-fixings').value = 'none';
      for (var i = 0; i < completed.length; i++) completed[i] = false;
      openStep(0, false);
      updateTotal();
    }
    function setAddMode() {
      if (addBtnLabel) addBtnLabel.textContent = (editIndex === null) ? 'Add to enquiry' : 'Update quote';
    }

    addBtn.addEventListener('click', function () {
      var s = calcSpec();
      var bad = false;
      [['c-width', s.width], ['c-height', s.height]].forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        if (!pair[1] || pair[1] < 20) { el.closest('.field').classList.add('invalid'); bad = true; }
      });
      if (!s.text) { textEl.closest('.field').classList.add('invalid'); bad = true; }
      if (bad) {
        var firstBad = calcForm.querySelector('.field.invalid input');
        if (firstBad) firstBad.focus();
        return;
      }
      var price = calcPrice(s);
      if (editIndex !== null) { basket[editIndex] = { spec: s, price: price }; editIndex = null; }
      else { basket.push({ spec: s, price: price }); }
      setAddMode();
      renderBasket();
      showPane('general');
      setTimeout(function () { basketEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 80);
    });

    // "Add another sign" — back to a fresh calculator
    basketAdd.addEventListener('click', function () {
      editIndex = null;
      setAddMode();
      resetCalc();
      showPane('calc');
      setTimeout(function () { textEl.focus(); }, 80);
    });

    // edit / remove a basket item (event delegation)
    basketList.addEventListener('click', function (e) {
      var editBtn = e.target.closest('[data-basket-edit]');
      var rmBtn   = e.target.closest('[data-basket-remove]');
      if (editBtn) {
        editIndex = +editBtn.getAttribute('data-basket-edit');
        setAddMode();
        loadSpec(basket[editIndex].spec);
        for (var i = 0; i < completed.length; i++) completed[i] = true;
        openStep(-1, false);  // show every step as a summary; tweak then Update
        showPane('calc');
        setTimeout(function () { calcForm.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
      } else if (rmBtn) {
        basket.splice(+rmBtn.getAttribute('data-basket-remove'), 1);
        if (editIndex !== null) { editIndex = null; setAddMode(); }
        renderBasket();
      }
    });

    // expose a reset so the basket + calculator clear after a successful enquiry
    resetCalcBasket = function () {
      basket = [];
      editIndex = null;
      autoDetails = '';
      setAddMode();
      renderBasket();
      resetCalc();  // calculator back to defaults, step 1 open
    };
  }

  var statusBox = form.querySelector('.form__status');
  var submitBtn = form.querySelector('.form__submit');

  function setStatus(type, msg) {
    statusBox.className = 'form__status show ' + type;
    statusBox.textContent = msg;
  }
  function clearStatus() { statusBox.className = 'form__status'; statusBox.textContent = ''; }

  /* ---- "Enquiry sent" success modal ---- */
  var sentModal = document.getElementById('sentModal');
  var sentMsgEl = sentModal && sentModal.querySelector('#sentMsg');
  var sentDone  = sentModal && sentModal.querySelector('.sent__done');
  var lastFocus = null;

  function openSent(name) {
    if (!sentModal) return;
    if (sentMsgEl) {
      var first = (name || '').trim().split(/\s+/)[0];
      sentMsgEl.textContent = (first ? 'Thanks, ' + first + ' — ' : 'Thanks — ')
        + 'your enquiry has landed with the studio. We’ll reply with options and a price, usually the same day.';
    }
    lastFocus = document.activeElement;
    sentModal.hidden = false;
    document.body.classList.add('sent-open');
    if (sentDone) setTimeout(function () { sentDone.focus(); }, 60);
  }
  function closeSent() {
    if (!sentModal || sentModal.hidden) return;
    sentModal.hidden = true;
    document.body.classList.remove('sent-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (sentModal) {
    sentModal.querySelectorAll('[data-sent-close]').forEach(function (el) {
      el.addEventListener('click', closeSent);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !sentModal.hidden) closeSent();
    });
  }

  function validate() {
    var ok = true;
    form.querySelectorAll('[required]').forEach(function (input) {
      var field = input.closest('.field');
      var val = (input.value || '').trim();
      var bad = !val;
      if (input.type === 'email' && val) {
        bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      }
      field.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    return ok;
  }

  // live-clear errors as the user types
  form.querySelectorAll('[required]').forEach(function (input) {
    input.addEventListener('input', function () {
      input.closest('.field').classList.remove('invalid');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearStatus();

    if (!validate()) {
      setStatus('err', 'Please check the highlighted fields and try again.');
      return;
    }

    var data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone ? form.phone.value.trim() : '',
      sign_type: form.sign_type.value,
      details: form.details.value.trim(),
      source: 'acrylicsignage.co.uk',
      submitted_at: new Date().toISOString()
    };
    // if any 3D letters quotes are in the basket, bolt them on
    var qd = (form.quotes_data && form.quotes_data.value) || '';
    if (qd) {
      try {
        var quotes = JSON.parse(qd);
        if (Array.isArray(quotes) && quotes.length) {
          data.quotes = quotes;
          data.quotes_total_gbp = quotes.reduce(function (t, q) {
            return t + (Number(q.price) || 0);
          }, 0);
        }
      } catch (_) { /* ignore bad JSON */ }
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // DEMO mode — no endpoint set
    if (!GHL_WEBHOOK_URL) {
      setTimeout(function () {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        openSent(data.name);
        form.reset();
        resetCalcBasket();
        clearStatus();
      }, 900);
      return;
    }

    fetch(GHL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed: ' + res.status);
        return res;
      })
      .then(function () {
        openSent(data.name);
        form.reset();
        resetCalcBasket();
        clearStatus();
      })
      .catch(function () {
        setStatus('err', 'Connection failed. Please try again, or email hello@acrylicsignage.co.uk directly.');
      })
      .finally(function () {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      });
  });

  /* ---- sticky mobile "Get a quote" button ----
     Appears once the hero has scrolled away, hides while the enquiry section
     is on screen so it never overlaps the form. */
  var fab = document.getElementById('quoteFab');
  var enquirySec = document.getElementById('enquiry');
  if (fab && enquirySec && 'IntersectionObserver' in window) {
    var heroSec = document.querySelector('.hero');
    var pastHero = false, enquiryVisible = false;
    function updateFab() {
      fab.classList.toggle('is-visible', pastHero && !enquiryVisible);
    }
    if (heroSec) {
      new IntersectionObserver(function (entries) {
        pastHero = !entries[0].isIntersecting;
        updateFab();
      }, { threshold: 0 }).observe(heroSec);
    } else {
      pastHero = true;
    }
    new IntersectionObserver(function (entries) {
      enquiryVisible = entries[0].isIntersecting;
      updateFab();
    }, { threshold: 0.01 }).observe(enquirySec);
  }

  /* ---- year in footer ---- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
