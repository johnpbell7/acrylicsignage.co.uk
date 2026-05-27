/* ============================================================
   Acrylic Signage — GSAP animation layer
   Quiet, considered motion. Scroll-triggered reveals,
   parallax for depth, perpetual float on the makes tiles,
   magnetic CTAs, counter-up stats, footer drift.
   Respects prefers-reduced-motion via gsap.matchMedia.
   ============================================================ */
(function () {
  'use strict';

  var revealEls = document.querySelectorAll('[data-reveal]');

  // Fallback: if GSAP didn't load, reveal everything so the page isn't blank.
  if (typeof window.gsap === 'undefined') {
    revealEls.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- manual char split (no SplitText dependency) ---- */
  function splitChars(line) {
    var text = line.textContent;
    line.textContent = '';
    var frag = document.createDocumentFragment();
    var chars = [];
    for (var i = 0; i < text.length; i++) {
      var c = text.charAt(i);
      var span = document.createElement('span');
      span.className = 'char';
      span.textContent = c === ' ' ? ' ' : c;
      frag.appendChild(span);
      chars.push(span);
    }
    line.appendChild(frag);
    return chars;
  }

  /* ============================================================
     HERO — char-rise timeline
     ============================================================ */
  var heroLines = document.querySelectorAll('.hero__head .hh-line');
  if (heroLines.length) {
    var allChars = [];
    heroLines.forEach(function (line) {
      Array.prototype.push.apply(allChars, splitChars(line));
    });

    if (reduce) {
      gsap.set(allChars, { yPercent: 0, opacity: 1 });
      gsap.set('.hero__lede, .hero__actions, .hero__visual', { opacity: 1, y: 0 });
    } else {
      // park everything off-screen / invisible until the intro completes
      gsap.set(allChars, { yPercent: 110, opacity: 0 });
      gsap.set('.hero__lede, .hero__actions, .hero__visual', { opacity: 0 });

      function playHero() {
        var heroTL = gsap.timeline({ defaults: { ease: 'power2.out' } });
        heroTL
          .to(allChars, {
            yPercent: 0,
            opacity: 1,
            duration: 0.6,
            stagger: { each: 0.012, from: 'start' }
          })
          .fromTo('.hero__lede',
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45 },
            '-=0.35')
          .fromTo('.hero__actions > *',
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, stagger: 0.05 },
            '-=0.3')
          .to('.hero__actions', { opacity: 1, duration: 0.01 }, '<')
          .fromTo('.hero__visual',
            { y: 18, scale: 0.99, opacity: 0 },
            { y: 0, scale: 1, opacity: 1, duration: 0.6 },
            '-=0.55');
      }

      // wait for the intro overlay to finish (or fire immediately if it's gone)
      if (document.getElementById('intro')) {
        window.addEventListener('intro:done', playHero, { once: true });
      } else {
        playHero();
      }
    }
  }

  /* ============================================================
     GENERIC [data-reveal] — batched scroll reveals
     ============================================================ */
  if (revealEls.length) {
    if (reduce) {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
      gsap.set(revealEls, { autoAlpha: 0, y: 14 });
      ScrollTrigger.batch(revealEls, {
        start: 'top bottom-=40',
        onEnter: function (els) {
          els.forEach(function (el) {
            var d = parseInt(el.getAttribute('data-delay') || '0', 10);
            gsap.to(el, {
              autoAlpha: 1, y: 0,
              duration: 0.35,
              ease: 'power2.out',
              delay: d * 0.035,
              onStart: function () { el.classList.add('in'); }
            });
          });
        },
        once: true
      });
    }
  }

  /* ============================================================
     MAKES — bento stagger, perpetual float, scroll parallax,
     cursor-tracked spotlight via CSS custom props
     ============================================================ */
  var makes = gsap.utils.toArray('.make');
  if (makes.length) {
    if (!reduce) {
      gsap.set(makes, { y: 20, autoAlpha: 0 });
      ScrollTrigger.batch(makes, {
        start: 'top bottom-=20',
        onEnter: function (els) {
          gsap.to(els, {
            y: 0,
            autoAlpha: 1,
            duration: 0.4,
            ease: 'power2.out',
            stagger: { each: 0.03, from: 'start' }
          });
        },
        once: true
      });

      makes.forEach(function (card, i) {
        var img = card.querySelector('.make__art img');
        if (!img) return;

        // perpetual float — slow, low amplitude, offset per card
        gsap.to(img, {
          y: '+=10',
          duration: 3 + (i % 4) * 0.55,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.13
        });

        // scroll parallax — modest, per-card
        gsap.fromTo(img,
          { yPercent: 4 },
          {
            yPercent: -6,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          }
        );
      });
    }

    // Cursor-tracked spotlight (works regardless of reduce-motion;
    // it's a CSS variable, not a transform animation)
    if (canHover) {
      makes.forEach(function (card) {
        var art = card.querySelector('.make__art');
        if (!art) return;
        art.addEventListener('mousemove', function (e) {
          var r = art.getBoundingClientRect();
          var x = ((e.clientX - r.left) / r.width) * 100;
          var y = ((e.clientY - r.top) / r.height) * 100;
          art.style.setProperty('--mx', x + '%');
          art.style.setProperty('--my', y + '%');
        });
        art.addEventListener('mouseleave', function () {
          art.style.setProperty('--mx', '50%');
          art.style.setProperty('--my', '50%');
        });
      });
    }
  }

  /* ============================================================
     STATEMENT — image parallax
     ============================================================ */
  if (!reduce) {
    gsap.utils.toArray('.statement__imgs figure').forEach(function (fig, i) {
      var img = fig.querySelector('img');
      if (!img) return;
      gsap.fromTo(img,
        { yPercent: 8 },
        {
          yPercent: -10 - (i * 3),
          ease: 'none',
          scrollTrigger: {
            trigger: fig.closest('.statement'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    });
  }

  /* ============================================================
     MATERIALS — stagger reveal
     ============================================================ */
  var mats = gsap.utils.toArray('.mat');
  if (mats.length && !reduce) {
    gsap.set(mats, { y: 18, autoAlpha: 0 });
    ScrollTrigger.batch(mats, {
      start: 'top bottom-=20',
      onEnter: function (els) {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out', stagger: 0.035 });
      },
      once: true
    });
  }

  /* ============================================================
     PROCESS — illustration slides in from one side, text from the
     other, then scroll parallax + perpetual float on the illustration
     ============================================================ */
  var steps = gsap.utils.toArray('.step');
  if (steps.length) {
    steps.forEach(function (step, i) {
      var alt = step.classList.contains('step--alt');
      var illust = step.querySelector('.step__illust');
      var body = step.querySelector('.step__body');
      var img = step.querySelector('.step__illust img');

      if (!reduce) {
        gsap.set(illust, { x: alt ? 22 : -22, autoAlpha: 0 });
        gsap.set(body,   { x: alt ? -16 : 16, autoAlpha: 0 });
        gsap.timeline({
          scrollTrigger: { trigger: step, start: 'top bottom-=40', once: true },
          defaults: { ease: 'power2.out', duration: 0.4 }
        })
          .to(illust, { x: 0, autoAlpha: 1 })
          .to(body,   { x: 0, autoAlpha: 1 }, '-=0.3');

        // perpetual float — different cadence per step
        if (img) {
          gsap.to(img, {
            y: '+=12',
            duration: 3.4 + (i % 3) * 0.4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.18
          });

          // scroll parallax inside the illustration tile
          gsap.fromTo(img,
            { yPercent: 6 },
            {
              yPercent: -6,
              ease: 'none',
              scrollTrigger: {
                trigger: step,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
              }
            }
          );
        }
      }
    });
  }

  /* ============================================================
     WORLD — image parallax
     ============================================================ */
  if (!reduce) {
    gsap.utils.toArray('.world__img').forEach(function (fig, i) {
      var img = fig.querySelector('img');
      if (!img) return;
      gsap.fromTo(img,
        { yPercent: 6 },
        {
          yPercent: -8 - (i * 2),
          ease: 'none',
          scrollTrigger: {
            trigger: fig,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    });
  }

  /* ============================================================
     COUNTER-UPS — hero strip + world stats
     ============================================================ */
  function counterUp(node) {
    var raw = (node.textContent || '').trim();
    var match = raw.match(/^([\d.,]+)(.*)$/);
    if (!match) return;
    var numStr = match[1].replace(/,/g, '');
    var num = parseFloat(numStr);
    if (!isFinite(num) || num === 0) return;
    var suffix = match[2];
    var hasDecimal = numStr.indexOf('.') !== -1;

    var counter = { v: 0 };
    gsap.to(counter, {
      v: num,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: node, start: 'top 90%', once: true },
      onUpdate: function () {
        var v = counter.v;
        var display;
        if (hasDecimal) display = v.toFixed(1);
        else if (num >= 1000) display = Math.round(v).toLocaleString();
        else display = Math.round(v);
        node.textContent = display + suffix;
      }
    });
  }
  if (!reduce) {
    gsap.utils.toArray('.world__stats li b').forEach(counterUp);
  }

  /* ============================================================
     FOOTER big "Acrylic." — slow horizontal drift on scroll
     ============================================================ */
  var fbig = document.querySelector('.footer__big');
  if (fbig && !reduce) {
    gsap.fromTo(fbig,
      { xPercent: -4 },
      {
        xPercent: 4,
        ease: 'none',
        scrollTrigger: {
          trigger: fbig,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  }

  /* ============================================================
     MAGNETIC CTAs — primary buttons pull toward the cursor
     ============================================================ */
  if (canHover && !reduce) {
    var magnets = document.querySelectorAll('.btn--primary, .nav__cta, .form__submit');
    magnets.forEach(function (btn) {
      var setX = gsap.quickTo(btn, 'x', { duration: 0.45, ease: 'power3.out' });
      var setY = gsap.quickTo(btn, 'y', { duration: 0.45, ease: 'power3.out' });
      var strength = btn.classList.contains('form__submit') ? 0.12 : 0.22;

      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        setX((e.clientX - cx) * strength);
        setY((e.clientY - cy) * strength);
      });
      btn.addEventListener('mouseleave', function () { setX(0); setY(0); });
    });
  }

  /* ============================================================
     Refresh after fonts & late images load — keeps ScrollTrigger
     boundaries accurate.
     ============================================================ */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
