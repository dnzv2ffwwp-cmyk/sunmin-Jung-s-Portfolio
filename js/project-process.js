document.querySelectorAll('[data-preview]').forEach(preview => {
  const stage = preview.querySelector('[data-preview-stage]');
  const canvas = preview.querySelector('[data-preview-canvas]');
  const frame = preview.querySelector('[data-preview-frame]');
  const buttons = [...preview.querySelectorAll('[data-width]')];
  let selected = buttons.find(button => button.getAttribute('aria-pressed') === 'true') || buttons[0];
  if (window.innerWidth <= 600) {
    selected = buttons.find(button => button.dataset.width === '390') || selected;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button === selected)));
  }

  function updatePreview() {
    const width = Number(selected.dataset.width);
    const height = Number(selected.dataset.height);
    const availableWidth = stage.clientWidth - parseFloat(getComputedStyle(stage).paddingLeft) * 2;
    const scale = Math.min(1, availableWidth / width);
    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;
    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
    frame.style.transform = `scale(${scale})`;
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      selected = button;
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      updatePreview();
    });
  });

  if ('ResizeObserver' in window) new ResizeObserver(updatePreview).observe(stage);
  else window.addEventListener('resize', updatePreview, { passive: true });
  updatePreview();
});
