(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.querySelector('.nav');
  const PHONE = '+12088009150';

  // nav: solid after scroll, mobile menu
  const onScroll = () => nav && nav.classList.toggle('solid', scrollY > 40);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
  const burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
    });
    nav.querySelectorAll('ul a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  // scroll-linked parallax on photo backgrounds (reverses when scrolling up)
  const layers = [...document.querySelectorAll('[data-parallax]')];
  const heroInner = document.querySelector('.hero-inner');
  if (!reduce && (layers.length || heroInner)) {
    let ticking = false;
    const update = () => {
      layers.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = `translate3d(0,${(p * -parseFloat(el.dataset.parallax || 60)).toFixed(1)}px,0)`;
      });
      if (heroInner) {
        const y = Math.min(scrollY, innerHeight);
        heroInner.style.transform = `translate3d(0,${y * 0.35}px,0)`;
        heroInner.style.opacity = 1 - y / (innerHeight * 0.8);
      }
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  }

  // reveal on scroll, both directions
  const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('in', e.isIntersecting)), { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // scroll spy: underline the menu tab for the section on screen
  const links = [...document.querySelectorAll('.nav ul a[href^="#"]')];
  const ids = links.map(a => a.getAttribute('href').slice(1));
  const spy = () => {
    const y = scrollY + innerHeight * 0.35;
    let cur = ids[0];
    ids.forEach(id => { const s = document.getElementById(id); if (s && s.offsetTop <= y) cur = id; });
    links.forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + cur));
  };
  addEventListener('scroll', spy, { passive: true });
  spy();

  // gallery lightbox
  const gal = document.querySelector('.gallery');
  if (gal) {
    const imgs = [...gal.querySelectorAll('img')];
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<img alt=""><button class="lb-close" aria-label="Close">&times;</button><button class="lb-prev" aria-label="Previous">&#8249;</button><button class="lb-next" aria-label="Next">&#8250;</button>';
    document.body.append(lb);
    const big = lb.querySelector('img');
    let i = 0;
    const show = n => { i = (n + imgs.length) % imgs.length; big.src = imgs[i].src; big.alt = imgs[i].alt; lb.classList.add('on'); };
    const close = () => lb.classList.remove('on');
    imgs.forEach((im, n) => im.parentElement.addEventListener('click', () => show(n)));
    lb.querySelector('.lb-close').onclick = close;
    lb.querySelector('.lb-prev').onclick = e => { e.stopPropagation(); show(i - 1); };
    lb.querySelector('.lb-next').onclick = e => { e.stopPropagation(); show(i + 1); };
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(i - 1);
      if (e.key === 'ArrowRight') show(i + 1);
    });
  }

  // quote form: builds a text message to the office
  const form = document.querySelector('#quote-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const d = new FormData(form);
      const body = `Free quote request from ${d.get('name')}\nPhone: ${d.get('phone')}\nAddress: ${d.get('address')}\nService: ${d.get('service')}\n${d.get('details') || ''}`.trim();
      const sep = /iPhone|iPad|Mac/.test(navigator.userAgent) ? '&' : '?';
      location.href = `sms:${PHONE}${sep}body=${encodeURIComponent(body)}`;
      form.querySelector('.form-note').textContent = 'Your text app should open with the request filled in. Just hit send. Nothing opened? Call (208) 800-9150.';
    });
  }

  const yr = document.querySelector('#yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
