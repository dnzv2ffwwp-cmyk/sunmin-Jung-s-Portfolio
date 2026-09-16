const scene = document.querySelector('.sticky-scene');
const stage = document.querySelector('.stage');
const experience = document.querySelector('.experience');
const graphicWork = document.querySelector('.graphic-work');
const resumeFolder = document.querySelector('.folder--resume');
const resumeSheet = document.querySelector('.resume-scroll-sheet');
const scrollCircle = document.querySelector('.scroll-circle');
const aboutKicker = document.querySelector('.about-kicker');
const profileIntro = document.querySelector('.profile-intro');
const otherFolders = document.querySelectorAll('.folder:not(.folder--resume)');
const folders = document.querySelector('.folders');
const quickMenu = document.querySelector('.quick-menu');
const quickMenuToggle = document.querySelector('.quick-menu__toggle');

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (from, to, value) => {
  const t = clamp((value - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
};
let hoverAmount = 0;
let hoverStart = 0;
let hoverFrom = 0;
let hoverTarget = 0;
let hoverFrame = 0;
const hoverDuration = 500;
let dragX = 0;
let dragStartX = 0;
let dragStartOffset = 0;
let draggingFolders = false;
let lastScrollY = window.scrollY;

function animateResumeHover(now){
  const progress = clamp((now - hoverStart) / hoverDuration, 0, 1);
  hoverAmount = lerp(hoverFrom, hoverTarget, smoothstep(0, 1, progress));
  updateScene();
  if(progress < 1) hoverFrame = requestAnimationFrame(animateResumeHover);
  else hoverFrame = 0;
}

function updateResumeHover(){
  const target = resumeFolder.matches(':hover,:focus') ? 1 : 0;
  if(target === hoverTarget) return;
  hoverFrom = hoverAmount;
  hoverTarget = target;
  hoverStart = performance.now();
  if(hoverFrame) cancelAnimationFrame(hoverFrame);
  hoverFrame = requestAnimationFrame(animateResumeHover);
}

function resizeStage(){
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const scale = vw <= 760
    ? vw / 402
    : vw < 1200
      ? vw / 1024
      : Math.max(vw / 1920, vh / 1000);
  stage.style.setProperty('--stage-scale', scale);
}

function updateScene(){
  const rect = experience.getBoundingClientRect();
  const max = Math.max(1, experience.offsetHeight - window.innerHeight);
  const distance = clamp(-rect.top, 0, max);
  const p = distance / max;
  const vw = window.innerWidth;
  const mobile = vw <= 760;
  const tablet = vw > 760 && vw < 1200;

  const grow = smoothstep(0.05, 0.65, p);
  const folderExit = smoothstep(0.68, 0.9, p);
  const profileEntrance = smoothstep(0.38, 0.52, p);
  const detailsReveal = smoothstep(0.76, 0.92, p);
  const titleMove = smoothstep(0, 0.45, p);

  // The resume rises out of the same red folder as it grows into the preview position.
  stage.style.setProperty('--resume-folder-x', `${lerp(0, mobile ? 26 : tablet ? 50 : 310, grow)}px`);
  stage.style.setProperty('--resume-folder-y', `${lerp(0, mobile ? 60 : tablet ? -160 : -180, grow)}px`);
  stage.style.setProperty('--resume-folder-scale', lerp(1, mobile ? 1.3 : tablet ? 1.45 : 2.25, grow));
  stage.style.setProperty('--resume-folder-opacity', 1 - folderExit);
  resumeFolder.tabIndex = folderExit >= 0.98 ? -1 : 0;
  resumeFolder.style.pointerEvents = folderExit >= 0.98 ? 'none' : 'auto';

  stage.style.setProperty('--title-x', `${lerp(0, mobile ? -25 : tablet ? -145 : -510, titleMove)}px`);
  stage.style.setProperty('--title-scale', lerp(1, mobile ? 0.7 : 0.51, titleMove));
  stage.style.setProperty('--title-opacity', 1 - smoothstep(0.36, 0.5, p));
  stage.style.setProperty('--other-folders-opacity', 1 - smoothstep(0.18, 0.5, p));
  otherFolders.forEach(folder => {
    folder.tabIndex = p >= 0.5 ? -1 : 0;
    folder.style.pointerEvents = p >= 0.5 ? 'none' : 'auto';
  });
  stage.style.setProperty('--decor-opacity', 1 - smoothstep(0.12, 0.44, p));
  const graphicApproach = window.innerHeight - graphicWork.getBoundingClientRect().top;
  const profileExit = smoothstep(0, window.innerHeight * 0.7, graphicApproach);
  profileIntro.style.setProperty('--profile-opacity', profileEntrance * (1 - profileExit));
  profileIntro.style.setProperty('--profile-y', `${lerp(30, 0, profileEntrance)}px`);
  profileIntro.style.setProperty('--tagline-opacity', profileEntrance * (1 - detailsReveal));
  profileIntro.style.setProperty('--tagline-y', `${lerp(0, -18, detailsReveal)}px`);
  profileIntro.style.setProperty('--details-opacity', detailsReveal * (1 - profileExit));
  profileIntro.style.setProperty('--details-y', `${lerp(24, 0, detailsReveal)}px`);
  scene.style.setProperty('--intro-opacity', 1 - smoothstep(0.5, 0.72, p));

  const scrollOpacity = 1 - smoothstep(0, 0.13, p);
  scrollCircle.style.setProperty('--scroll-opacity', scrollOpacity);
  scrollCircle.style.setProperty('--scroll-y', `${lerp(0, 48, smoothstep(0, 0.13, p))}px`);

  // One resume sheet stays on screen after the folder fades and then scrolls past Skills.
  const folderBox = resumeFolder.getBoundingClientRect();
  const beyondIntro = Math.max(0, window.innerHeight - rect.bottom);
  const sheetWidth = folderBox.width * 0.68;
  const sheetHeight = sheetWidth * 1.5;
  const hoverRise = hoverAmount * 0.28 * (1 - grow);
  const rise = 0.58 * smoothstep(0.12, 0.64, p) + hoverRise;
  const scrollSpeed = mobile ? 0.35 : tablet ? 0.4 : 0.45;
  const sheetLeft = folderBox.left + folderBox.width * 0.16;
  const sheetTop = folderBox.top + beyondIntro + folderBox.height * 0.17
    - sheetHeight * rise - beyondIntro * scrollSpeed;
  const folderLip = folderBox.top + beyondIntro + folderBox.height * (112 / 416);
  const clippedBottom = Math.max(0, sheetHeight - Math.max(0, folderLip - sheetTop)) * (1 - folderExit);

  resumeSheet.style.left = `${sheetLeft}px`;
  resumeSheet.style.top = `${sheetTop}px`;
  resumeSheet.style.width = `${sheetWidth}px`;
  resumeSheet.style.clipPath = `inset(0 0 ${clippedBottom}px 0)`;
  const graphicScroll = -graphicWork.getBoundingClientRect().top;
  resumeSheet.style.opacity = `${1 - smoothstep(0, window.innerHeight * 0.5, graphicScroll)}`;
  aboutKicker.style.setProperty('--about-kicker-opacity',
    profileEntrance * (1 - smoothstep(0, window.innerHeight * 0.7, graphicApproach))
  );
}

function update(){
  resizeStage();
  const dragBounds = getDragBounds();
  dragX = clamp(dragX, dragBounds.min, dragBounds.max);
  folders.style.setProperty('--folders-drag-x', `${dragX}px`);
  updateScene();
}

function setMenuOpen(open){
  quickMenu.classList.toggle('is-open', open);
  quickMenuToggle.setAttribute('aria-expanded', String(open));
  quickMenuToggle.querySelector('.sr-only').textContent = open ? '메뉴 닫기' : '메뉴 열기';
}

function updateQuickMenu(){
  const currentY = Math.max(0, window.scrollY);
  const delta = currentY - lastScrollY;
  const movingUp = delta < 0;
  const nearTop = currentY < 16;
  quickMenu.classList.toggle('is-visible', nearTop || movingUp);
  lastScrollY = currentY;
}

function getDragBounds(){
  const scale = parseFloat(getComputedStyle(stage).getPropertyValue('--stage-scale')) || 1;
  const folderWidth = folders.scrollWidth * scale;
  const viewportWidth = window.innerWidth;
  const baseLeft = folders.getBoundingClientRect().left - dragX * scale;
  return {
    min: Math.min(0, (viewportWidth - baseLeft - folderWidth - 24) / scale),
    max: Math.max(0, (24 - baseLeft) / scale)
  };
}

folders.addEventListener('pointerdown', event => {
  if(event.button !== 0) return;
  draggingFolders = true;
  dragStartX = event.clientX;
  dragStartOffset = dragX;
  folders.classList.add('is-dragging');
  folders.setPointerCapture(event.pointerId);
});
folders.addEventListener('pointermove', event => {
  if(!draggingFolders) return;
  const bounds = getDragBounds();
  const scale = parseFloat(getComputedStyle(stage).getPropertyValue('--stage-scale')) || 1;
  dragX = clamp(dragStartOffset + (event.clientX - dragStartX) / scale, bounds.min, bounds.max);
  folders.style.setProperty('--folders-drag-x', `${dragX}px`);
});
const stopFolderDrag = event => {
  if(!draggingFolders) return;
  draggingFolders = false;
  folders.classList.remove('is-dragging');
  if(folders.hasPointerCapture(event.pointerId)) folders.releasePointerCapture(event.pointerId);
};
folders.addEventListener('pointerup', stopFolderDrag);
folders.addEventListener('pointercancel', stopFolderDrag);

quickMenuToggle.addEventListener('click', () => setMenuOpen(!quickMenu.classList.contains('is-open')));
quickMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenuOpen(false)));

window.addEventListener('resize', update, {passive:true});
window.addEventListener('scroll', () => {
  updateScene();
  updateQuickMenu();
}, {passive:true});
['pointerenter','pointerleave','focus','blur'].forEach(type => {
  resumeFolder.addEventListener(type, updateResumeHover);
});
window.addEventListener('load', () => {
  update();
  updateQuickMenu();
  // Used only to render the provided end-state preview when opening ?state=end.
  if(new URLSearchParams(location.search).get('state') === 'end'){
    requestAnimationFrame(() => {
      window.scrollTo(0, experience.offsetHeight - window.innerHeight);
      requestAnimationFrame(updateScene);
    });
  }
});
