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

  /* ---- 3D letters pricing engine ---- */
  // hidden cost rates (per character at 100mm height) — the user only sees
  // the final marked-up total
  var MAT_RATE = {
    foamboard_3: 1.10,
    acm_3:       2.20,
    acrylic_3:   2.40,
    acrylic_5:   3.60,
    acrylic_10:  6.00
  };
  var MAT_LABEL = {
    foamboard_3: '3mm Foamboard',
    acm_3:       '3mm Aluminium composite',
    acrylic_3:   '3mm Acrylic',
    acrylic_5:   '5mm Acrylic',
    acrylic_10:  '10mm Acrylic'
  };
  var FINISH_RATE  = { matt: 0,    gloss: 0.20, brushed: 0.55 };
  var FINISH_LABEL = { matt: 'Matt', gloss: 'Gloss', brushed: 'Brushed' };
  var FIX_RATE     = { none: 0, vhb_tape: 0.40, sign_locators: 3.50, sign_locators_clad: 4.50, vhb_vinyl: 0.80 };
  var FIX_LABEL    = {
    none: 'No fixings',
    vhb_tape: 'VHB tape + cardboard template',
    sign_locators: 'Sign locators + template',
    sign_locators_clad: 'Sign locators + cladding template',
    vhb_vinyl: 'VHB tape + vinyl template'
  };
  var SETUP_FEE = 35;
  var MINIMUM   = 60;
  var MARKUP    = 1.30;  // 30% mark-up, hidden from user

  // material → allowed finishes
  var FINISH_OPTIONS = {
    foamboard_3: ['matt'],
    acm_3:       ['matt', 'gloss', 'brushed'],
    acrylic_3:   ['gloss'],
    acrylic_5:   ['gloss'],
    acrylic_10:  ['gloss']
  };

  function calcSpec() {
    return {
      text: (document.getElementById('c-text').value || '').trim(),
      height: parseInt(document.getElementById('c-height').value, 10) || 100,
      qty: parseInt(document.getElementById('c-qty').value, 10) || 1,
      material: document.getElementById('c-material').value,
      finish: document.getElementById('c-finish').value,
      fixings: document.getElementById('c-fixings').value
    };
  }
  function calcPrice(s) {
    var chars = (s.text || '').replace(/\s/g, '').length;
    if (chars === 0) return 0;
    var hFactor = (s.height || 100) / 100;
    var rate = (MAT_RATE[s.material] || MAT_RATE.acm_3) * hFactor
             + (FINISH_RATE[s.finish] || 0)
             + (FIX_RATE[s.fixings] || 0);
    var subtotal = (rate * chars) + SETUP_FEE;
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
        var n = (s.text || '').replace(/\s/g, '').length;
        hintEl.textContent = n + ' character' + (n === 1 ? '' : 's');
      }
    }
    calcForm.addEventListener('input', updateTotal);
    calcForm.addEventListener('change', function () { syncFinish(); updateTotal(); });
    syncFinish();
    updateTotal();

    /* ---- Add to enquiry: copy spec + price into general form, switch tab ---- */
    var addBtn       = document.getElementById('calcAdd');
    var quoteAtt     = document.getElementById('quoteAttached');
    var quoteSpecEl  = document.getElementById('quoteSpec');
    var quotePriceEl = document.getElementById('quoteAttachedPrice');
    var quoteData    = document.getElementById('quoteData');
    var quotePrice   = document.getElementById('quotePrice');
    var quoteEdit    = document.getElementById('quoteEdit');
    var quoteRemove  = document.getElementById('quoteRemove');
    var typeSel      = document.getElementById('f-type');

    function renderQuoteSummary(s, price) {
      var rows = [
        ['Text',     '"' + s.text + '"'],
        ['Height',   s.height + 'mm'],
        ['Quantity', s.qty + ' set' + (s.qty === 1 ? '' : 's')],
        ['Material', MAT_LABEL[s.material]],
        ['Finish',   FINISH_LABEL[s.finish]],
        ['Fixings',  FIX_LABEL[s.fixings]]
      ];
      quoteSpecEl.innerHTML = rows.map(function (r) {
        return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>';
      }).join('');
      quotePriceEl.textContent = fmtGBP(price);
    }

    addBtn.addEventListener('click', function () {
      var s = calcSpec();
      if (!s.text) {
        textEl.closest('.field').classList.add('invalid');
        textEl.focus();
        return;
      }
      var price = calcPrice(s);
      // attach to general form
      quoteData.value  = JSON.stringify(s);
      quotePrice.value = price;
      renderQuoteSummary(s, price);
      quoteAtt.hidden = false;
      // helpful default — switch sign_type to "3D letters"
      if (typeSel) {
        for (var i = 0; i < typeSel.options.length; i++) {
          if (/3d letters/i.test(typeSel.options[i].value)) { typeSel.selectedIndex = i; break; }
        }
      }
      // pre-fill the details textarea with a friendly summary if it's empty
      var details = document.getElementById('f-details');
      if (details && !details.value.trim()) {
        details.value = '3D letters quote: "' + s.text + '" at ' + s.height + 'mm, '
                      + MAT_LABEL[s.material] + ' (' + FINISH_LABEL[s.finish] + '), '
                      + FIX_LABEL[s.fixings] + ', ×' + s.qty + '. Estimated ' + fmtGBP(price) + '.';
      }
      showPane('general');
      // scroll to the attached quote so the user sees it landed
      setTimeout(function () {
        quoteAtt.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    });

    quoteEdit && quoteEdit.addEventListener('click', function () { showPane('calc'); });
    quoteRemove && quoteRemove.addEventListener('click', function () {
      quoteAtt.hidden = true;
      quoteData.value = '';
      quotePrice.value = '';
    });
  }

  var statusBox = form.querySelector('.form__status');
  var submitBtn = form.querySelector('.form__submit');

  function setStatus(type, msg) {
    statusBox.className = 'form__status show ' + type;
    statusBox.textContent = msg;
  }
  function clearStatus() { statusBox.className = 'form__status'; statusBox.textContent = ''; }

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
    // if a 3D letters quote is attached, bolt it on
    var qd = (form.quote_data && form.quote_data.value) || '';
    var qp = (form.quote_price && form.quote_price.value) || '';
    if (qd) {
      try {
        data.quote = JSON.parse(qd);
        data.quote_price_gbp = Number(qp) || null;
      } catch (_) { /* ignore bad JSON */ }
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // DEMO mode — no endpoint set
    if (!GHL_WEBHOOK_URL) {
      setTimeout(function () {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        form.reset();
        setStatus('ok', 'Thanks — your enquiry is in. We\u2019ll reply with options and a price, usually the same day. (Demo mode: connect your GHL webhook to go live.)');
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
        form.reset();
        setStatus('ok', 'Thanks — your enquiry is in. We\u2019ll reply with options and a price, usually the same day.');
      })
      .catch(function () {
        setStatus('err', 'Connection failed. Please try again, or email hello@acrylicsignage.co.uk directly.');
      })
      .finally(function () {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      });
  });

  /* ---- year in footer ---- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
