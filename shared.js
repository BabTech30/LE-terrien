/* ============================================================
   LE TERRIER â€” Shared JavaScript
   v2.0 â€” Audit perf/a11y/UX (fÃ©v. 2026)
   Lightweight, vanilla, performant
   ============================================================ */

(function () {
  'use strict';

  /* --- REDUCED MOTION CHECK --- */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- ANNOUNCEMENT BANNER --- */
  var announce = document.querySelector('.announce');
  if (announce) {
    if (sessionStorage.getItem('lt-announce-closed')) {
      announce.classList.add('hidden');
      document.body.classList.remove('has-announce');
    } else {
      document.body.classList.add('has-announce');
      var closeBtn = announce.querySelector('.announce__close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          announce.classList.add('hidden');
          document.body.classList.remove('has-announce');
          sessionStorage.setItem('lt-announce-closed', '1');
        });
      }
    }
  }

  /* --- BURGER MENU (with aria-expanded) --- */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      burger.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.classList.remove('open');
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* --- FLOATING CTA --- */
  var floatCta = document.querySelector('.float-cta');

  /* --- CONSOLIDATED SCROLL HANDLER (perf: 1 listener instead of 3) --- */
  var header = document.querySelector('.header');
  var menuNav = document.querySelector('.menu-nav');
  var menuSections = [];

  if (menuNav) {
    var menuLinks = menuNav.querySelectorAll('.menu-nav__link');
    menuLinks.forEach(function (link) {
      var id = link.getAttribute('href');
      if (id && id.startsWith('#')) {
        var section = document.querySelector(id);
        if (section) menuSections.push({ link: link, section: section });
      }
    });
  }

  function onScroll() {
    var y = window.scrollY;

    // Sticky header
    if (header) {
      header.classList.toggle('scrolled', y > 40);
    }

    // Floating CTA
    if (floatCta) {
      floatCta.classList.toggle('visible', y > 400);
    }

    // Menu nav highlight (carte page only)
    if (menuSections.length) {
      var scrollY = y + 120;
      var current = menuSections[0];
      for (var i = 0; i < menuSections.length; i++) {
        if (menuSections[i].section.offsetTop <= scrollY) {
          current = menuSections[i];
        }
      }
      menuLinks.forEach(function (l) { l.classList.remove('active'); });
      if (current) current.link.classList.add('active');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- SCROLL REVEAL --- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  /* --- FAQ ACCORDION (with aria-expanded) --- */
  document.querySelectorAll('.faq__q').forEach(function (btn) {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq__item');
      var wasOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq__item.open').forEach(function (el) {
        el.classList.remove('open');
        var b = el.querySelector('.faq__q');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      // Toggle current
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* --- LIGHTBOX (gallery) --- */
  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('.lightbox__img');
    var lbCap = lightbox.querySelector('.lightbox__cap');
    var lbClose = lightbox.querySelector('.lightbox__close');

    document.querySelectorAll('.gallery-item[data-src]').forEach(function (item) {
      item.addEventListener('click', function () {
        var src = item.getAttribute('data-src');
        var cap = item.getAttribute('data-caption') || '';
        if (lbImg) lbImg.src = src;
        if (lbImg) lbImg.alt = cap || 'Photo Le Terrier';
        if (lbCap) lbCap.textContent = cap;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (lbClose) lbClose.focus();
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lbImg) lbImg.src = '';
    }
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }

  /* --- CONTACT FORM (demo) --- */
  var form = document.querySelector('.form[data-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.style.display = 'none';
      var success = document.querySelector('.form__success');
      if (success) success.classList.add('visible');
    });
  }

  /* --- SMOOTH ANCHOR SCROLL (skip href="#" placeholders) --- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      // Skip bare "#" links (placeholder URLs)
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var offset = document.querySelector('.menu-nav') ? 120 : 70;
        window.scrollTo({
          top: target.offsetTop - offset,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      }
    });
  });

  /* --- COOKIE CONSENT --- */
  var cookieBanner = document.getElementById('cookie-banner');
  if (cookieBanner) {
    var consent = localStorage.getItem('lt-cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(function () {
        cookieBanner.classList.add('visible');
      }, 1500);
    } else {
      cookieBanner.classList.add('hidden');
    }

    var acceptBtn = document.getElementById('cookie-accept');
    var refuseBtn = document.getElementById('cookie-refuse');

    function closeCookieBanner(choice) {
      localStorage.setItem('lt-cookie-consent', choice);
      cookieBanner.classList.remove('visible');
      setTimeout(function () {
        cookieBanner.classList.add('hidden');
      }, 400);
      // If accepted, load analytics (when configured)
      if (choice === 'accepted') {
        // Placeholder: load Google Analytics or other tracking here
        // e.g. loadGoogleAnalytics();
      }
    }

    if (acceptBtn) acceptBtn.addEventListener('click', function () { closeCookieBanner('accepted'); });
    if (refuseBtn) refuseBtn.addEventListener('click', function () { closeCookieBanner('refused'); });
  }

  /* --- FORM SECURITY (basic XSS/injection prevention) --- */
  document.querySelectorAll('.form__input, .form__textarea').forEach(function (input) {
    input.addEventListener('input', function () {
      // Strip potential script injection
      var val = input.value;
      if (val.indexOf('<') !== -1 || val.indexOf('>') !== -1) {
        input.value = val.replace(/[<>]/g, '');
      }
    });
  });

  /* --- ATMOSPHERE CANVAS (subtle golden particles) --- */
  var canvas = document.getElementById('atmosphere');
  if (canvas && !prefersReducedMotion) {
    var ctx = canvas.getContext('2d');
    var w, h;
    var particles = [];
    var COUNT = 25;
    var resizeTimer;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    // Debounced resize
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    for (var i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * (w || 1000),
        y: Math.random() * (h || 800),
        r: Math.random() * 1.2 + 0.3,
        dx: (Math.random() - 0.5) * 0.15,
        dy: (Math.random() - 0.5) * 0.1,
        a: Math.random() * 0.3 + 0.05,
        phase: Math.random() * Math.PI * 2
      });
    }

    var raf;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      var t = Date.now() * 0.001;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        if (p.y < -5) p.y = h + 5;
        if (p.y > h + 5) p.y = -5;
        var alpha = p.a * (0.6 + 0.4 * Math.sin(t + p.phase));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200,164,92,' + alpha + ')';
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    // Pause when tab hidden
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        draw();
      }
    });
  }

})();
