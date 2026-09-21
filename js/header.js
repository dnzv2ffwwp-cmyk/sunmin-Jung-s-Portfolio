(() => {
  const quickMenu = document.querySelector('.quick-menu');
  if(!quickMenu) return;
  const quickMenuToggle = quickMenu.querySelector('.quick-menu__toggle');
  const aboutSection = document.querySelector('.about');
  let lastScrollY = window.scrollY;
  let hideTimer = 0;
  let pointerInside = false;

  function isMenuInUse(){
    return quickMenu.classList.contains('is-open') || pointerInside ||
      (quickMenu.contains(document.activeElement) && document.activeElement.matches(':focus-visible'));
  }

  function clearHideTimer(){
    window.clearTimeout(hideTimer);
    hideTimer = 0;
  }

  function scheduleHide(){
    clearHideTimer();
    if(window.scrollY < 16 || isMenuInUse()) return;
    hideTimer = window.setTimeout(() => {
      if(!isMenuInUse()) quickMenu.classList.remove('is-visible');
    }, 2200);
  }

  function setMenuOpen(open){
    quickMenu.classList.toggle('is-open', open);
    quickMenuToggle.setAttribute('aria-expanded', String(open));
    quickMenuToggle.querySelector('.sr-only').textContent = open ? '메뉴 닫기' : '메뉴 열기';
    if(open){
      clearHideTimer();
      quickMenu.classList.add('is-visible');
    }else scheduleHide();
  }

  function updateQuickMenu(){
    const currentY = Math.max(0, window.scrollY);
    const movingUp = currentY < lastScrollY;
    if(currentY < 16){
      clearHideTimer();
      quickMenu.classList.add('is-visible');
    }else if(movingUp){
      quickMenu.classList.add('is-visible');
      scheduleHide();
    }else if(currentY > lastScrollY && !quickMenu.classList.contains('is-open')){
      clearHideTimer();
      quickMenu.classList.remove('is-visible');
    }
    lastScrollY = currentY;
  }

  quickMenuToggle.addEventListener('click', () => setMenuOpen(!quickMenu.classList.contains('is-open')));
  quickMenu.addEventListener('pointerenter', event => {
    if(event.pointerType === 'mouse' || event.pointerType === 'pen'){
      pointerInside = true;
      clearHideTimer();
    }
  });
  quickMenu.addEventListener('pointerleave', () => {
    pointerInside = false;
    scheduleHide();
  });
  quickMenu.addEventListener('focusin', clearHideTimer);
  quickMenu.addEventListener('focusout', () => requestAnimationFrame(scheduleHide));
  quickMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
  document.addEventListener('pointerdown', event => {
    if(quickMenu.classList.contains('is-open') && !quickMenu.contains(event.target)) setMenuOpen(false);
  });
  document.addEventListener('keydown', event => {
    if(event.key === 'Escape' && quickMenu.classList.contains('is-open')){
      setMenuOpen(false);
      quickMenuToggle.focus();
    }
  });

  if(aboutSection){
    function scrollToAbout(behavior){
      const resumeStart = aboutSection.getBoundingClientRect().top + window.scrollY;
      const desktopLead = window.innerWidth >= 1600 ? Math.min(110, window.innerHeight * 0.11) : 0;
      window.scrollTo({top: Math.max(0, resumeStart - desktopLead), behavior});
    }

    document.querySelectorAll('a[href="#about"]').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        setMenuOpen(false);
        scrollToAbout(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
      });
    });
    if(window.location.hash === '#about'){
      window.addEventListener('load', () => requestAnimationFrame(() => scrollToAbout('auto')), {once:true});
    }
  }

  window.addEventListener('scroll', updateQuickMenu, {passive:true});
  window.addEventListener('load', updateQuickMenu);
  updateQuickMenu();
})();
