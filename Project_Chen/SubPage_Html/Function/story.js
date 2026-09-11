'use strict';

(() => {
  const content = window.PROX_STORY_CONTENT;
  const byId = id => document.getElementById(id);
  const trigger = byId('entranceTitle');
  const menu = byId('journeyMenu');
  const shell = document.querySelector('.entrance-shell');
  const scene = byId('storyScene');
  const space = byId('storySpace');
  const article = byId('storyArticle');
  const frame = byId('storyFrame');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const fx = window.PROX_SPACE.create(byId('spaceTransition'));
  const animations = new Set();
  let view = 'home';
  let chapter = 0;
  let switching = false;
  let revision = 0;

  const text = (id, value) => { byId(id).textContent = value; };
  const setView = value => { view = value; document.body.dataset.journey = value; };
  const animate = async (element, frames, duration) => {
    if (motion.matches) frames = frames.map(key => ({ opacity: key.opacity ?? 1 }));
    const animation = element.animate(frames, { duration: motion.matches ? 100 : duration, easing: 'cubic-bezier(.22,.8,.25,1)', fill: 'both' });
    animations.add(animation);
    try { await animation.finished; } catch (error) { if (error.name !== 'AbortError') throw error; }
    return animation;
  };
  const clearAnimations = () => { animations.forEach(animation => animation.cancel()); animations.clear(); };

  for (const [id, key] of Object.entries({ journeyMenuTitle: 'menuTitle', journeyMenuIntro: 'menuIntro', journeyStoryLabel: 'storyLabel', journeyStoryDescription: 'storyDescription', journeyLibraryLabel: 'libraryLabel', journeyLibraryDescription: 'libraryDescription', storySeries: 'title' })) text(id, content[key]);
  byId('journeyLibrary').href = content.libraryHref;
  byId('storyLibrary').href = content.libraryHref;
  const chapterButtons = content.chapters.map((item, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'story-chapter';
    const number = document.createElement('span'); number.textContent = String(index + 1).padStart(2, '0'); number.setAttribute('aria-hidden', 'true');
    button.append(number, document.createTextNode(item.label));
    button.addEventListener('click', () => changeChapter(index));
    byId('storyChapters').appendChild(button);
    return button;
  });

  function renderChapter(index) {
    chapter = index;
    const item = content.chapters[index];
    text('storyHeading', item.title); text('storyChapterEnglish', item.english);
    text('storyCount', `${String(index + 1).padStart(2, '0')} / ${String(content.chapters.length).padStart(2, '0')}`);
    text('storyCaption', item.caption);
    for (const [id, values, tag] of [['storyProse', item.paragraphs, 'p'], ['storyKeywords', item.keywords, 'span']]) {
      byId(id).replaceChildren(...values.map(value => { const node = document.createElement(tag); node.textContent = value; return node; }));
    }
    chapterButtons.forEach((button, n) => { if (n === index) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current'); });
    byId('storyPrevious').disabled = index === 0;
    byId('storyNext').hidden = index === content.chapters.length - 1;
    byId('storyLibrary').hidden = index !== content.chapters.length - 1;
    byId('storyProgress').style.width = `${(index + 1) / content.chapters.length * 100}%`;
    text('storyProgressLabel', `${String(index + 1).padStart(2, '0')} — ${String(content.chapters.length).padStart(2, '0')}`);
  }

  function openMenu() {
    if (view !== 'home') return;
    setView('menu'); trigger.setAttribute('aria-expanded', 'true');
    menu.showModal(); byId('journeyStart').focus();
  }
  function closeMenu() {
    menu.close(); trigger.setAttribute('aria-expanded', 'false');
    if (view === 'menu') setView('home');
  }

  async function enterStory() {
    if (view !== 'menu') return;
    const token = ++revision;
    const initialTransform = getComputedStyle(shell).transform;
    closeMenu(); setView('entering'); shell.inert = true;
    const burst = fx.play();
    await animate(shell, [
      { transform: initialTransform, filter: 'blur(0px)', opacity: .7 },
      { transform: 'perspective(1200px) translateZ(-400px) rotateX(28deg) scale(.09,.035)', filter: 'blur(3px)', opacity: 0 }
    ], 520);
    if (token !== revision) return;
    shell.hidden = true; scene.hidden = false; scene.inert = true;
    renderChapter(0); window.scrollTo(0, 0);
    await animate(space, [
      { transform: 'perspective(1400px) translateZ(-720px) rotateX(12deg) scale(.72)', opacity: 0 },
      { transform: 'perspective(1400px) translateZ(0) rotateX(0deg) scale(1)', opacity: 1 }
    ], 900);
    await burst;
    if (token !== revision) return;
    clearAnimations(); scene.inert = false; setView('story');
    byId('storyHeading').focus({ preventScroll: true });
    text('storyAnnouncement', '故事介绍，第一章：' + content.chapters[0].label);
  }

  function resetHome() {
    revision++; fx.stop(); clearAnimations(); switching = false;
    if (menu.open) menu.close();
    trigger.setAttribute('aria-expanded', 'false');
    scene.hidden = true; scene.inert = false; shell.hidden = false; shell.inert = false;
    frame.style.removeProperty('--tilt-x'); frame.style.removeProperty('--tilt-y');
    article.removeAttribute('aria-busy'); setView('home');
    window.scrollTo(0, 0); trigger.focus({ preventScroll: true });
  }

  async function leaveStory() {
    if (view === 'entering') { resetHome(); return; }
    if (view !== 'story') return;
    const token = ++revision;
    clearAnimations(); switching = false; fx.stop(); setView('leaving'); scene.inert = true;
    await animate(space, [{ opacity: 1, transform: 'perspective(1400px) translateZ(0)' }, { opacity: 0, transform: 'perspective(1400px) translateZ(-350px) rotateX(-7deg)' }], 320);
    if (token !== revision) return;
    resetHome();
  }

  async function changeChapter(index) {
    if (view !== 'story' || switching || index === chapter || index < 0 || index >= content.chapters.length) return;
    switching = true; article.setAttribute('aria-busy', 'true');
    const token = ++revision;
    const direction = index > chapter ? 1 : -1;
    await animate(article, [{ opacity: 1, transform: 'translateZ(0) rotateY(0deg)' }, { opacity: 0, transform: `translateZ(-100px) translateX(${-direction * 30}px) rotateY(${direction * 8}deg)` }], 230);
    if (token !== revision) return;
    renderChapter(index);
    await animate(article, [{ opacity: 0, transform: `translateZ(-100px) translateX(${direction * 30}px) rotateY(${-direction * 8}deg)` }, { opacity: 1, transform: 'translateZ(0) rotateY(0deg)' }], 380);
    if (token !== revision) return;
    clearAnimations(); switching = false; article.removeAttribute('aria-busy');
    byId('storyHeading').focus({ preventScroll: true });
    text('storyAnnouncement', `第 ${index + 1} 章：${content.chapters[index].label}`);
  }

  trigger.addEventListener('click', openMenu);
  byId('journeyMenuClose').addEventListener('click', closeMenu);
  menu.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
  // 只在按下与释放都发生于遮罩时关闭，避免拖选文案误触。
  let backdropDown = false;
  const outside = event => { const rect = menu.getBoundingClientRect(); return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom; };
  menu.addEventListener('pointerdown', event => { backdropDown = outside(event); });
  menu.addEventListener('click', event => { if (backdropDown && outside(event)) closeMenu(); backdropDown = false; });
  byId('journeyStart').addEventListener('click', enterStory);
  byId('storyExit').addEventListener('click', leaveStory);
  byId('storyHome').addEventListener('click', leaveStory);
  byId('storyPrevious').addEventListener('click', () => changeChapter(chapter - 1));
  byId('storyNext').addEventListener('click', () => changeChapter(chapter + 1));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && ['story', 'entering'].includes(view)) { event.preventDefault(); leaveStory(); return; }
    if (view !== 'story' || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); changeChapter(chapter + (event.key === 'ArrowRight' ? 1 : -1)); }
  });
  let touchStart = null;
  article.addEventListener('touchstart', event => { touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }, { passive: true });
  article.addEventListener('touchcancel', () => { touchStart = null; });
  article.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.7 && !window.getSelection()?.toString()) changeChapter(chapter + (dx < 0 ? 1 : -1));
  }, { passive: true });
  frame.addEventListener('pointermove', event => {
    if (view !== 'story' || motion.matches || !pointer.matches || event.pointerType === 'touch') return;
    const rect = frame.getBoundingClientRect();
    frame.style.setProperty('--tilt-x', `${-(event.clientY - rect.top - rect.height / 2) / rect.height * 3}deg`);
    frame.style.setProperty('--tilt-y', `${(event.clientX - rect.left - rect.width / 2) / rect.width * 4}deg`);
  });
  frame.addEventListener('pointerleave', () => { frame.style.removeProperty('--tilt-x'); frame.style.removeProperty('--tilt-y'); });
  motion.addEventListener('change', () => { fx.stop(); if (motion.matches) animations.forEach(animation => animation.finish()); });
  window.addEventListener('pagehide', () => { fx.stop(); });
  window.addEventListener('pageshow', event => { if (event.persisted) resetHome(); });
  renderChapter(0); setView('home');
})();
