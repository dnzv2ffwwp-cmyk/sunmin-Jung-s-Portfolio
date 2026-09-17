(() => {
  const quickMenu = document.querySelector('.quick-menu');
  if(!quickMenu) return;
  const quickMenuToggle = quickMenu.querySelector('.quick-menu__toggle');
  const aboutSection = document.querySelector('.about');
  let lastScrollY = window.scrollY;

  function setMenuOpen(open){
    quickMenu.classList.toggle('is-open', open);
    quickMenuToggle.setAttribute('aria-expanded', String(open));
    quickMenuToggle.querySelector('.sr-only').textContent = open ? '메뉴 닫기' : '메뉴 열기';
  }

  function updateQuickMenu(){
    const currentY = Math.max(0, window.scrollY);
    const movingUp = currentY < lastScrollY;
    quickMenu.classList.toggle('is-visible', currentY < 16 || movingUp);
    lastScrollY = currentY;
  }

  quickMenuToggle.addEventListener('click', () => setMenuOpen(!quickMenu.classList.contains('is-open')));
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
