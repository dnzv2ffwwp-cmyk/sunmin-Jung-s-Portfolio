(() => {
  const topLink = document.querySelector('.detail-presentation__floating-top');
  if (!topLink) return;
  const update = () => topLink.classList.toggle('is-visible', window.scrollY > 500);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
