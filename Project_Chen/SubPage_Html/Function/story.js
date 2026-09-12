'use strict';

(() => {
  const content = window.PROX_STORY_CONTENT;
  if (!content || !Array.isArray(content.scenes) || !content.scenes.length) throw new Error('故事数据加载失败');

  const byId = id => document.getElementById(id);
  const trigger = byId('entranceTitle');
  const shell = document.querySelector('.entrance-shell');
  const scene = byId('storyScene');
  const stage = byId('storyStage');
  const page = byId('storyPage');
  const heading = byId('storyHeading');
  const arts = [byId('storyArtA'), byId('storyArtB')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fx = window.PROX_SPACE.create(byId('spaceTransition'));
  const assetRoot = './SubPage_Html/Assets/Story/';
  const imageCache = new Map();
  let view = 'home';
  let index = 0;
  let activeArt = 0;
  let switching = false;
  let transitionRevision = 0;
  let suppressStageClickUntil = 0;
  let wheelTotal = 0;
  let wheelReset;

  const text = (id, value) => { byId(id).textContent = value; };
  const setView = value => { view = value; document.body.dataset.journey = value; };
  const imageUrl = item => new URL(assetRoot + item.image, document.baseURI).href;
  const animate = async (element, frames, duration, easing = 'cubic-bezier(.22,.8,.25,1)') => {
    const safeFrames = motion.matches ? frames.map(frame => ({ opacity: frame.opacity ?? 1 })) : frames;
    const animation = element.animate(safeFrames, { duration: motion.matches ? 80 : duration, easing, fill: 'both' });
    try { await animation.finished; } catch (error) { if (error.name !== 'AbortError') throw error; }
    return animation;
  };

  function preload(item) {
    const url = imageUrl(item);
    if (!imageCache.has(url)) {
      imageCache.set(url, new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = url;
      }));
    }
    return imageCache.get(url);
  }

  text('storySeries', content.title);
  byId('storyLibrary').href = content.libraryHref;

  function paintBackground(item, immediate = false) {
    const nextArt = immediate ? arts[activeArt] : arts[1 - activeArt];
    nextArt.style.backgroundImage = `url("${imageUrl(item)}")`;
    nextArt.style.backgroundPosition = item.position || 'center center';
    nextArt.style.setProperty('--pan-x', item.align === 'right' ? '-1.2%' : item.align === 'left' ? '1.2%' : '0');
    nextArt.style.setProperty('--pan-y', index % 2 ? '-.7%' : '.7%');
    if (immediate) {
      arts.forEach((art, artIndex) => art.classList.toggle('is-visible', artIndex === activeArt));
      return;
    }
    nextArt.classList.add('is-visible');
    arts[activeArt].classList.remove('is-visible');
    activeArt = 1 - activeArt;
  }

  function renderScene(nextIndex, immediate = false) {
    index = nextIndex;
    const item = content.scenes[index];
    text('storyChapter', item.chapter);
    text('storyEnglish', item.english);
    text('storyHeading', item.text);
    text('storyProgressLabel', `${String(index + 1).padStart(2, '0')} / ${String(content.scenes.length).padStart(2, '0')}`);
    text('storyChapterLabel', item.chapter);
    page.dataset.align = item.align || 'left';
    page.dataset.emphasis = item.emphasis ? 'true' : 'false';
    scene.dataset.align = item.align || 'left';
    byId('storyPrevious').disabled = index === 0;
    const isLast = index === content.scenes.length - 1;
    byId('storyNext').hidden = isLast;
    byId('storyLibrary').hidden = !isLast;
    byId('storyContinue').textContent = isLast ? '故事未完，征程刚刚开始。' : '点击画面、滚轮或按 → 继续';
    const progress = (index + 1) / content.scenes.length * 100;
    byId('storyProgress').style.width = `${progress}%`;
    const progressBar = byId('storyProgressBar');
    progressBar.setAttribute('aria-valuemax', String(content.scenes.length));
    progressBar.setAttribute('aria-valuenow', String(index + 1));
    progressBar.setAttribute('aria-valuetext', `第 ${index + 1} 幕，共 ${content.scenes.length} 幕`);
    paintBackground(item, immediate);
    preload(content.scenes[index + 1] || item);
    preload(content.scenes[index - 1] || item);
  }

  async function enterStory() {
    if (view !== 'home') return;
    const token = ++transitionRevision;
    setView('entering');
    shell.inert = true;
    const loading = preload(content.scenes[0]);
    const burst = fx.play();
    const shellExit = animate(shell, [
      { transform: 'perspective(1200px) translateZ(-180px) rotateX(7deg)', filter: 'blur(4px)', opacity: .36 },
      { transform: 'perspective(1200px) translateZ(-430px) rotateX(28deg) scale(.08,.025)', filter: 'blur(5px)', opacity: 0 }
    ], 540, 'cubic-bezier(.5,0,.8,.35)');
    await Promise.all([shellExit, loading]);
    if (token !== transitionRevision) return;
    shell.hidden = true;
    scene.hidden = false;
    scene.inert = true;
    renderScene(0, true);
    await animate(stage, [
      { transform: 'perspective(1500px) translateZ(-760px) rotateX(13deg) scale(.72)', filter: 'blur(8px)', opacity: 0 },
      { transform: 'perspective(1500px) translateZ(0) rotateX(0) scale(1)', filter: 'blur(0)', opacity: 1 }
    ], 900);
    await burst;
    if (token !== transitionRevision) return;
    stage.getAnimations().forEach(animation => animation.cancel());
    scene.inert = false;
    setView('story');
    heading.focus({ preventScroll: true });
    text('storyAnnouncement', `创办的初心，第 1 幕：${content.scenes[0].text}`);
  }

  async function changeScene(nextIndex) {
    if (view !== 'story' || switching || nextIndex === index || nextIndex < 0 || nextIndex >= content.scenes.length) return;
    switching = true;
    const token = ++transitionRevision;
    const direction = nextIndex > index ? 1 : -1;
    page.setAttribute('aria-busy', 'true');
    const loading = preload(content.scenes[nextIndex]);
    await animate(page, [
      { opacity: 1, transform: 'translateZ(0) translateX(0) rotateY(0)', filter: 'blur(0)' },
      { opacity: 0, transform: `translateZ(-180px) translateX(${-direction * 4}vw) rotateY(${direction * 5}deg)`, filter: 'blur(5px)' }
    ], 280);
    await loading;
    if (token !== transitionRevision) return;
    renderScene(nextIndex);
    await animate(page, [
      { opacity: 0, transform: `translateZ(-180px) translateX(${direction * 4}vw) rotateY(${-direction * 5}deg)`, filter: 'blur(5px)' },
      { opacity: 1, transform: 'translateZ(0) translateX(0) rotateY(0)', filter: 'blur(0)' }
    ], 520);
    if (token !== transitionRevision) return;
    page.getAnimations().forEach(animation => animation.cancel());
    page.removeAttribute('aria-busy');
    switching = false;
    heading.focus({ preventScroll: true });
    text('storyAnnouncement', `第 ${index + 1} 幕：${content.scenes[index].text}`);
  }

  function resetHome() {
    transitionRevision++;
    switching = false;
    fx.stop();
    shell.getAnimations().forEach(animation => animation.cancel());
    stage.getAnimations().forEach(animation => animation.cancel());
    page.getAnimations().forEach(animation => animation.cancel());
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    scene.hidden = true;
    scene.inert = false;
    shell.hidden = false;
    shell.inert = false;
    page.removeAttribute('aria-busy');
    setView('home');
    window.scrollTo(0, 0);
    trigger.focus({ preventScroll: true });
  }

  async function leaveStory() {
    if (view === 'entering') { resetHome(); return; }
    if (view !== 'story') return;
    const token = ++transitionRevision;
    switching = false;
    fx.stop();
    scene.inert = true;
    setView('leaving');
    await animate(stage, [
      { opacity: 1, transform: 'perspective(1400px) translateZ(0)' },
      { opacity: 0, transform: 'perspective(1400px) translateZ(-380px) rotateX(-8deg)', filter: 'blur(7px)' }
    ], 340);
    if (token === transitionRevision) resetHome();
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await scene.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      text('storyAnnouncement', '浏览器未允许进入全屏模式。');
    }
  }

  function updateFullscreenControl() {
    const active = document.fullscreenElement === scene;
    byId('storyFullscreen').setAttribute('aria-pressed', active ? 'true' : 'false');
    text('storyFullscreenLabel', active ? '退出全屏' : '全屏');
  }

  trigger.addEventListener('click', enterStory);
  byId('storyExit').addEventListener('click', leaveStory);
  byId('storyHome').addEventListener('click', leaveStory);
  byId('storyPrevious').addEventListener('click', () => changeScene(index - 1));
  byId('storyNext').addEventListener('click', () => changeScene(index + 1));
  byId('storyFullscreen').addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', updateFullscreenControl);
  if (!scene.requestFullscreen) byId('storyFullscreen').hidden = true;

  stage.addEventListener('click', event => {
    if (performance.now() < suppressStageClickUntil || window.getSelection()?.toString() || event.target.closest('button, a')) return;
    changeScene(index + 1);
  });
  scene.addEventListener('wheel', event => {
    if (view !== 'story' || switching) return;
    event.preventDefault();
    wheelTotal += event.deltaY;
    clearTimeout(wheelReset);
    wheelReset = setTimeout(() => { wheelTotal = 0; }, 180);
    if (Math.abs(wheelTotal) >= 55) {
      const direction = wheelTotal > 0 ? 1 : -1;
      wheelTotal = 0;
      changeScene(index + direction);
    }
  }, { passive: false });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && view === 'entering') { event.preventDefault(); resetHome(); return; }
    if (view !== 'story' || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest('button, a, input, textarea, select, [contenteditable="true"]')) return;
    const forward = ['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'];
    const backward = ['ArrowLeft', 'ArrowUp', 'PageUp'];
    if (forward.includes(event.key)) { event.preventDefault(); changeScene(index + 1); }
    else if (backward.includes(event.key)) { event.preventDefault(); changeScene(index - 1); }
    else if (event.key === 'Home') { event.preventDefault(); changeScene(0); }
    else if (event.key === 'End') { event.preventDefault(); changeScene(content.scenes.length - 1); }
  });

  let touchStart = null;
  stage.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  stage.addEventListener('touchcancel', () => { touchStart = null; });
  stage.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && !window.getSelection()?.toString()) {
      suppressStageClickUntil = performance.now() + 500;
      changeScene(index + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  motion.addEventListener('change', () => { if (motion.matches) fx.stop(); });
  window.addEventListener('pagehide', () => fx.stop());
  window.addEventListener('pageshow', event => { if (event.persisted) resetHome(); });
  preload(content.scenes[0]);
  setView('home');
})();
