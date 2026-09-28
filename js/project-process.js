document.querySelectorAll('[data-preview]').forEach(preview => {
  const stage = preview.querySelector('[data-preview-stage]');
  const canvas = preview.querySelector('[data-preview-canvas]');
  const frame = preview.querySelector('[data-preview-frame]');
  const buttons = [...preview.querySelectorAll('[data-width]')];
  const canObserveStage = 'ResizeObserver' in window;
  let selected = buttons.find(button => button.getAttribute('aria-pressed') === 'true') || buttons[0];
  let viewportDevice = '';

  function getViewportDevice() {
    if (window.innerWidth <= 600) return 'mobile';
    if (window.innerWidth <= 900) return 'tablet';
    return 'pc';
  }

  function updatePreview() {
    const width = Number(selected.dataset.width);
    const height = Number(selected.dataset.height);
    const device = selected.dataset.device;
    const availableWidth = stage.clientWidth - parseFloat(getComputedStyle(stage).paddingLeft) * 2;
    const scale = Math.min(1, availableWidth / width);
    preview.dataset.device = device;
    stage.setAttribute('aria-label', `${selected.textContent.trim()} ${width}×${height} 화면 미리보기`);
    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;
    frame.style.width = `${width}px`;
    frame.style.height = `${height}px`;
    frame.style.transform = `scale(${scale})`;
    requestAnimationFrame(() => {
      try {
        frame.contentWindow?.dispatchEvent(new Event('resize'));
      } catch (_) {
        // The iframe still responds through its changed viewport size when direct events are restricted.
      }
    });
  }

  function selectPreview(button) {
    if (!button) return;
    selected = button;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === selected)));
    updatePreview();
  }

  function syncPreviewToViewport(force = false) {
    const nextDevice = getViewportDevice();
    if (!force && nextDevice === viewportDevice) {
      if (!canObserveStage) updatePreview();
      return;
    }
    viewportDevice = nextDevice;
    selectPreview(buttons.find(button => button.dataset.device === nextDevice) || selected);
  }

  buttons.forEach(button => {
    button.addEventListener('click', () => selectPreview(button));
  });

  if (canObserveStage) new ResizeObserver(updatePreview).observe(stage);
  window.addEventListener('resize', () => syncPreviewToViewport(), { passive: true });
  syncPreviewToViewport(true);
});
