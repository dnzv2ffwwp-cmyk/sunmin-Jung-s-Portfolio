(() => {
  function enableAutoplay(root, advance, delay = 4500){
    let timer = 0;
    let hovering = false;
    let focused = false;
    let pressed = false;

    function stop(){
      window.clearInterval(timer);
      timer = 0;
    }

    function start(){
      stop();
      if(!document.hidden && !hovering && !focused && !pressed){
        timer = window.setInterval(advance, delay);
      }
    }

    root.addEventListener('mouseenter', () => { hovering = true; stop(); });
    root.addEventListener('mouseleave', () => { hovering = false; start(); });
    root.addEventListener('focusin', () => { focused = true; stop(); });
    root.addEventListener('focusout', event => {
      if(!root.contains(event.relatedTarget)){
        focused = false;
        start();
      }
    });
    root.addEventListener('pointerdown', () => { pressed = true; stop(); });
    root.addEventListener('pointerup', () => { pressed = false; start(); });
    root.addEventListener('pointercancel', () => { pressed = false; start(); });
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
    start();
  }

  const carousel = document.querySelector('[data-banner-carousel]');
  if(carousel){
    const track = carousel.querySelector('[data-banner-track]');
    const slides = [...track.querySelectorAll('figure')];
    const count = document.querySelector('[data-banner-count]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;

    function updateCurrent(){
      current = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
      count.textContent = `${String(current + 1).padStart(2, '0')} — ${String(slides.length).padStart(2, '0')}`;
    }

    function showSlide(index){
      const next = (index + slides.length) % slides.length;
      track.scrollTo({
        left: slides[next].offsetLeft - slides[0].offsetLeft,
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
      current = next;
      count.textContent = `${String(next + 1).padStart(2, '0')} — ${String(slides.length).padStart(2, '0')}`;
    }

    carousel.querySelector('[data-banner-prev]').addEventListener('click', () => showSlide(current - 1));
    carousel.querySelector('[data-banner-next]').addEventListener('click', () => showSlide(current + 1));
    track.addEventListener('scroll', updateCurrent, {passive: true});
    track.addEventListener('keydown', event => {
      if(event.key === 'ArrowLeft' || event.key === 'ArrowRight'){
        event.preventDefault();
        showSlide(current + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });
    window.addEventListener('resize', () => showSlide(current), {passive: true});
    enableAutoplay(carousel, () => showSlide(current + 1));
  }

  document.querySelectorAll('[data-work-carousel], [data-detail-carousel]').forEach(carousel => {
    const track = carousel.querySelector('[data-work-track], [data-detail-track]');
    const slides = [...track.children];
    const previous = carousel.querySelector('[data-work-prev], [data-detail-prev]');
    const next = carousel.querySelector('[data-work-next], [data-detail-next]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = 0;
    let scrollTimer = 0;

    const before = document.createDocumentFragment();
    const after = document.createDocumentFragment();
    slides.forEach(slide => {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      if(clone.matches('a')) clone.tabIndex = -1;
      before.appendChild(clone);
    });
    slides.forEach(slide => {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      if(clone.matches('a')) clone.tabIndex = -1;
      after.appendChild(clone);
    });
    track.insertBefore(before, track.firstChild);
    track.appendChild(after);

    const items = [...track.children];
    const origin = slides.length;

    function itemLeft(index){
      return items[index].offsetLeft - items[0].offsetLeft;
    }

    function showOriginal(index, instant = false){
      track.scrollTo({
        left: itemLeft(origin + index),
        behavior: instant || reducedMotion.matches ? 'auto' : 'smooth'
      });
    }

    function move(direction){
      const target = origin + current + direction;
      current = (current + direction + slides.length) % slides.length;
      track.scrollTo({
        left: itemLeft(target),
        behavior: reducedMotion.matches ? 'auto' : 'smooth'
      });
    }

    function normalizePosition(){
      const step = items[1] ? items[1].offsetLeft - items[0].offsetLeft : track.clientWidth;
      const rawIndex = Math.round(track.scrollLeft / step);
      current = ((rawIndex - origin) % slides.length + slides.length) % slides.length;
      if(rawIndex < origin || rawIndex >= origin + slides.length) showOriginal(current, true);
    }

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(normalizePosition, 140);
    }, {passive: true});
    track.addEventListener('keydown', event => {
      if(event.key === 'ArrowLeft' || event.key === 'ArrowRight'){
        event.preventDefault();
        move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    window.addEventListener('resize', () => showOriginal(current, true), {passive: true});
    requestAnimationFrame(() => showOriginal(0, true));
    enableAutoplay(carousel, () => move(1));
  });

  if (window.location.hash === '#detail-page-title') {
    const detailSection = document.getElementById('detail-page-title');
    const alignDetailSection = () => {
      if (!detailSection) return;
      requestAnimationFrame(() => {
        const offset = window.matchMedia('(max-width: 760px)').matches ? 76 : 100;
        window.scrollTo({
          top: detailSection.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'instant'
        });
      });
    };
    window.addEventListener('load', alignDetailSection, { once: true });
    window.addEventListener('pageshow', alignDetailSection);
  }

})();
