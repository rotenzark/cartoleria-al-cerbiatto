/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'cartoleria-al-cerbiatto',    // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    /* Scheda Google, tabella aperta a schermo il 24/9/2026: lun–ven 8:30–12:30 e 15:30–19, sab 9–12:30 e 16–19, domenica chiuso. */
    hours: {
      0: [],
      1: [['08:30', '12:30'], ['15:30', '19:00']],
      2: [['08:30', '12:30'], ['15:30', '19:00']],
      3: [['08:30', '12:30'], ['15:30', '19:00']],
      4: [['08:30', '12:30'], ['15:30', '19:00']],
      5: [['08:30', '12:30'], ['15:30', '19:00']],
      6: [['09:00', '12:30'], ['16:00', '19:00']],
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 2400,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "intro.k": "photocopy in progress · via Emilio De Martino 1",
      "intro.f": "Cartoleria Al Cerbiatto · Niguarda, Milan",
      "intro.skip": "skip",
      "t.bn": "B/W and colour.",
      "t.col": "B/W and <i class=\"c\">c</i><i class=\"m\">o</i><i class=\"y\">l</i><i class=\"k\">o</i><i class=\"c\">u</i><i class=\"m\">r</i>.",
      "nav.home": "Cartoleria Al Cerbiatto, back to top",
      "nav.apri": "Open the menu",
      "marchio.s": "via Emilio De Martino 1 · Niguarda",
      "nav.cartoleria": "The shop",
      "nav.colori": "Toys and colours",
      "nav.servizi": "Services",
      "nav.recensioni": "Reviews",
      "nav.orari": "Hours and where",
      "nav.domande": "Questions",
      "cta.chiama": "Call",
      "cta.chiama2": "Call +39 02 6610 0548",
      "cnt": "copy",
      "h.k": "Stationery · toys · b/w and colour photocopies · stamps · fax · laminating · prints from file",
      "h.p": "On the sign, at the corner of via De Martino, it says <b>Cartoleria</b>. And underneath, in small letters: black-and-white and colour photocopies. It is true of the photocopies and true of the shop: an old-style stationer's, with father and son behind the counter, that over the years has added the services, the toys and the colours.",
      "h.cta1": "Call +39 02 6610 0548",
      "h.cta2": "The services",
      "h.cta3": "Send a file",
      "h.badge": "4.5 on Google with 60 reviews · «kind» and «you find everything» are what customers write most often",
      "h.alt": "The corner of via De Martino with the sign: Cartoleria, toys, b/w and colour photocopies, stamps, fax, laminating, prints from file",
      "h.cap": "the sign, at the corner of via Emilio De Martino 1 (photo from the Google listing)",
      "c.k": "in black and white",
      "c.h": "The stationer's it has always been.",
      "c.p1": "A neighbourhood stationer's at the corner of via De Martino: exercise books, pens, pencils, binders, card, everything for school and for the office. «A historic stationer's that has managed to renew itself over time», one customer writes. The historic part is this: the black and white.",
      "c.p2": "Behind the counter are <b>father and son</b>. The reviews say so, in Italian and in English, and so does a customer who moved away and keeps coming back. It is not something you can write on a sign: you can only tell it.",
      "c.p3": "If you are looking for something specific, ask: it is usually there, and if it is not, an alternative turns up.",
      "c.n1": "reviews mention kindness and courtesy",
      "c.n2": "say you find everything",
      "c.n3": "mention competence and reliability",
      "c.n4": "mention the services: photocopies, PDFs, fax, scans",
      "c.nota": "counted on the 25 Google reviews with a text, September 2026",
      "c.q": "<b>In the neighbourhood.</b> In January 2026 the Maria Immacolata school thanked the shop for the voucher it put up as a prize in the Don Bosco tombola, the school party.",
      "c.zoom": "Enlarge the photo of the shelves",
      "c.alt": "The shelves inside the shop: coloured binders and exercise books, the counter with the pens",
      "c.cap": "the shelves, inside (photo from the Google listing)",
      "g.k": "in colour",
      "g.h": "Toys, card, pens in every colour.",
      "g.p": "«Giocattoli», toys, is the first word after «Cartoleria» on the sign. The department is real, and customers notice it: board games, plush toys, the present for a classmate's birthday. Then the coloured card, the felt-tips, the coloured pencils: the colour part of the shop.",
      "g.zoom1": "Enlarge the photo of the toy department",
      "g.alt1": "The toy department: shelves of boxed games and plush toys",
      "t1.h": "Toys",
      "t1.p": "Board games, plush toys, small presents: the department customers mention in their reviews.",
      "t2.h": "For school",
      "t2.p": "Exercise books, diaries, pencil cases, binders, pens: school supplies, from September to June.",
      "g.zoom2": "Enlarge the photo of the coloured card",
      "g.alt2": "A fan of coloured card with a white pencil",
      "t3.h": "Card and colours",
      "t3.p": "Card in every colour, pencils, felt-tips, paper for drawing and for wrapping.",
      "g.alt3": "The tips of a row of coloured pencils",
      "s.k": "services",
      "s.h": "Photocopies in black and white and in colour. And the rest of the sign.",
      "s.p": "Seven things done at the counter, in the order they are written on the sign and on the Facebook page.",
      "s1.h": "B/W and colour photocopies",
      "s1.p": "Single, double-sided, enlarged or reduced. We make them, at the counter.",
      "s1.t": "b/w · colour",
      "s2.h": "Prints from file",
      "s2.p": "Bring the file on a USB stick or send it by email: we print it in black and white or in colour.",
      "s2.t": "b/w · colour",
      "s3.h": "Scans and PDFs",
      "s3.p": "A paper document becomes a PDF, and we send it to you by email, on your phone or computer.",
      "s3.t": "→ pdf",
      "s4.h": "Fax",
      "s4.p": "Sending and receiving. Yes, still today: for the offices and public bodies that ask for it.",
      "s4.t": "b/w",
      "s5.h": "Spiral binding",
      "s5.p": "Theses, lecture notes, reports, recipe books: spiral-bound.",
      "s5.t": "spiral",
      "s6.h": "Laminating",
      "s6.p": "Cards, signs, menus, drawings to keep: laminated at the counter.",
      "s6.t": "plastic",
      "s7.h": "Stamps",
      "s7.p": "Custom rubber stamps, made to order: ask at the counter.",
      "s7.t": "to order",
      "s.mail": "The file to print can be sent to <a href=\"mailto:cartoleriaalcerbiatto@gmail.com\">cartoleriaalcerbiatto@gmail.com</a>, or brought on a USB stick.",
      "r.k": "reviews",
      "r.h": "What people write.",
      "r.p": "Five Google reviews, as they were written.",
      "r.voto": "out of 5 · 60 Google reviews",
      "r1.c": "Martina S. · 3 years ago · 5 stars",
      "r2.c": "Ruggero C. · 7 years ago · 5 stars",
      "r3.c": "Andrea V. · 7 years ago · 5 stars",
      "r4.c": "Giulio F. · 1 month ago · 5 stars",
      "r5.c": "diego b. · 7 years ago · 5 stars",
      "o.k": "hours and where",
      "o.h": "At the corner of via De Martino, morning and afternoon.",
      "o.p": "Split hours: mornings from 8:30, afternoons from 15:30 until 19:00. On Saturday we open at 9 and reopen at 16. Closed on Sunday.",
      "o.cap": "Opening hours",
      "g.lun": "Monday",
      "g.mar": "Tuesday",
      "g.mer": "Wednesday",
      "g.gio": "Thursday",
      "g.ven": "Friday",
      "g.sab": "Saturday",
      "g.dom": "Sunday",
      "g.chiuso": "closed",
      "o.nota": "For holidays and for the summer, better to call first.",
      "k.ind": "address",
      "k.tel": "phone",
      "k.mail": "email",
      "o.strada": "Get directions",
      "o.zoom": "Enlarge the photo of the entrance",
      "o.alt": "The corner door of the shop, with the red carpet and the window",
      "o.cap2": "the entrance, at the corner (photo from the Google listing)",
      "o.mappa": "Map: Cartoleria Al Cerbiatto, Via Emilio De Martino 1, Milan",
      "o.mnota": "the map is in black and white: hover over it and it goes to colour",
      "d.k": "questions",
      "d.h": "The questions we get asked.",
      "qa.1": "Cartoleria or Al Cerbiatto?",
      "ra.1": "Both: the sign says Cartoleria, on Facebook and in our email we are cartoleria Al Cerbiatto. Same shop, at the corner of via Emilio De Martino 1.",
      "qa.2": "Can I send a file to print?",
      "ra.2": "Yes: by email to cartoleriaalcerbiatto@gmail.com, or bring it on a USB stick. Prints in black and white and in colour.",
      "qa.3": "Do you make colour photocopies?",
      "ra.3": "Yes, in black and white and in colour: it says so on the sign. Double-sided, enlarged or reduced too.",
      "qa.4": "Do you still have a fax?",
      "ra.4": "Yes, sending and receiving. And for paper documents we scan them and send the PDF by email.",
      "qa.5": "Binding, laminating, stamps?",
      "ra.5": "Yes: spiral binding and laminating at the counter. Stamps are made to order.",
      "qa.6": "What time do you open?",
      "ra.6": "Monday to Friday at 8:30, with a break from 12:30 to 15:30, then until 19:00. On Saturday from 9 to 12:30 and from 16 to 19. Closed on Sunday.",
      "qa.7": "Do you have school supplies?",
      "ra.7": "Yes: exercise books, diaries, pencil cases, binders, pens, card and everything else. And the toy department for presents.",
      "piede.s": "stationery · toys · b/w and colour photocopies · stamps · fax · laminating · prints from file",
      "piede.b": "Demo site by <a href=\"https://bespokestud.io\" target=\"_blank\" rel=\"noopener\">Bespoke Studio</a> · texts, hours and services from the shop sign, the business's Google listing and Facebook page and from the public Google reviews (September 2026); photographs from the business's Google listing.",
      "b.chiama": "Call",
      "b.servizi": "Services",
      "b.orari": "Hours",
      "b.mappa": "Map",
      "lb.chiudi": "Close",
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  /* ═══ FIRMA · Cartoleria Al Cerbiatto — «B/N e colori.»: la barra dello scanner ═══
     [data-copia] = due strati con la stessa immagine (o lo stesso testo): .copia__bn in bianco e nero sotto,
     .copia__col a colori sopra, ritagliato con clip-path. Stato finale nel CSS = a colori (inset 0): senza JS e in
     reduced-motion il sito è a colori. Con GSAP: all'avvio lo strato a colori va a inset(0 0 100% 0)
     (data-stato=bn); poi la barra ciano scende e lascia il colore dietro di sé (scansione → colori).
     L'intro parte subito, l'hero dopo l'intro (bespokeHeroEntrance), le copie di sezione quando entrano in vista. */
  var copieVive = hasGsap && hasST && !reducedMotion;
  var colora = function (el, subito) {
    var col = el.querySelector('.copia__col'), bar = el.querySelector('.copia__barra');
    if (!col) { el.setAttribute('data-stato', 'colori'); return; }
    if (subito || !hasGsap) {
      col.style.clipPath = ''; if (bar) bar.style.opacity = '';
      el.setAttribute('data-stato', 'colori'); return;
    }
    if (el.getAttribute('data-stato') !== 'bn') return;
    el.setAttribute('data-stato', 'scansione');
    var st = { p: 0 };
    var tl = gsap.timeline({ onComplete: function () { col.style.clipPath = ''; el.setAttribute('data-stato', 'colori'); } });
    if (bar) tl.set(bar, { opacity: 1, top: '0%' }, 0);
    tl.to(st, { p: 100, duration: 1.25, ease: 'power1.inOut', onUpdate: function () {
      col.style.clipPath = 'inset(0% 0% ' + (100 - st.p) + '% 0%)';
      if (bar) bar.style.top = st.p + '%';
    } }, 0);
    if (bar) tl.to(bar, { opacity: 0, duration: .3 }, '-=.05');
  };
  var ingrigisci = function (el) {
    var col = el.querySelector('.copia__col'), bar = el.querySelector('.copia__barra');
    if (!col) return;
    col.style.clipPath = 'inset(0% 0% 100% 0%)';
    if (bar) { bar.style.opacity = '0'; bar.style.top = '0%'; }
    el.setAttribute('data-stato', 'bn');
  };
  var copie = Array.prototype.slice.call(document.querySelectorAll('[data-copia]'));
  if (copieVive) {
    copie.forEach(ingrigisci);
    var introC = document.getElementById('introCopia');
    if (introC) {
      setTimeout(function () { colora(introC); }, 250);
      setTimeout(function () { var f = document.getElementById('introFine'); if (f) f.classList.add('is-on'); }, 1500);
    }
    copie.filter(function (c) { return !c.hasAttribute('data-copia-manuale'); }).forEach(function (c) {
      ScrollTrigger.create({ trigger: c, start: 'top 82%', once: true, onEnter: function () { colora(c); } });
    });
    // rete di sicurezza: dopo 7 s ciò che è in vista e ancora in bianco e nero si colora
    setTimeout(function () {
      copie.forEach(function (c) {
        if (c.getAttribute('data-stato') !== 'bn') return;
        var r = c.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) colora(c, true);
      });
    }, 7000);
  } else {
    var f0 = document.getElementById('introFine'); if (f0) f0.classList.add('is-on');
  }

  window.bespokeHeroEntrance = function () {
    var titolo = document.getElementById('heroTitolo'), foto = document.getElementById('heroCopia');
    if (!copieVive) { if (titolo) colora(titolo, true); if (foto) colora(foto, true); return; }
    if (titolo) colora(titolo);
    if (foto) setTimeout(function () { colora(foto); }, 500);
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(['.apertura__k', '.apertura__p', '.apertura__stato', '.apertura__azioni', '.apertura__badge'], { opacity: 0, y: 16, duration: .6, stagger: .08 }, 0.2);
  };

})();
