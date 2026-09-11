'use strict';

document.getElementById('entranceRoot').insertAdjacentHTML('beforeend', String.raw`
  <dialog class="journey-menu" id="journeyMenu" aria-labelledby="journeyMenuTitle" aria-describedby="journeyMenuIntro">
    <div class="journey-menu-top"><span class="story-overline">PRO-X / EXPLORE</span><button class="story-icon-button" id="journeyMenuClose" type="button" aria-label="关闭菜单">×</button></div>
    <h2 id="journeyMenuTitle"></h2>
    <p id="journeyMenuIntro"></p>
    <div class="journey-options">
      <button class="journey-option" id="journeyStart" type="button"><span class="journey-option-number" aria-hidden="true">01</span><span><strong id="journeyStoryLabel"></strong><small id="journeyStoryDescription"></small></span><span class="journey-option-arrow" aria-hidden="true">↗</span></button>
      <a class="journey-option" id="journeyLibrary"><span class="journey-option-number" aria-hidden="true">02</span><span><strong id="journeyLibraryLabel"></strong><small id="journeyLibraryDescription"></small></span><span class="journey-option-arrow" aria-hidden="true">↗</span></a>
    </div>
    <p class="journey-menu-foot">跟随好奇，走近一点。<span aria-hidden="true">✦</span></p>
  </dialog>

  <canvas class="space-transition" id="spaceTransition" aria-hidden="true" hidden></canvas>

  <section class="story-scene" id="storyScene" aria-label="Pro-X 故事介绍" hidden>
    <div class="story-room" aria-hidden="true"><div class="story-room-grid"></div><div class="story-room-halo"></div><i></i><i></i><i></i><span class="story-room-word">PRO-X</span></div>
    <header class="story-header">
      <button class="story-brand" id="storyHome" type="button" aria-label="返回 Pro-X 入口">Pro-X<span>THE STORY</span></button>
      <button class="story-back" id="storyExit" type="button"><span aria-hidden="true">↖</span> 返回入口</button>
    </header>
    <div class="story-space" id="storySpace">
      <div class="story-section-heading"><span class="story-overline" id="storySeries"></span><span class="story-overline">A WORK IN PROGRESS</span></div>
      <div class="story-frame" id="storyFrame">
        <aside class="story-index">
          <p class="story-overline">CONTENTS / 目录</p>
          <nav class="story-chapters" id="storyChapters" aria-label="故事章节"></nav>
          <div class="story-sculpture" aria-hidden="true"><i></i><i></i><i></i><span>X</span><b></b></div>
          <p class="story-index-foot">IDEAS BECOME REALITY</p>
        </aside>
        <div class="story-reading">
          <article class="story-article" id="storyArticle" aria-labelledby="storyHeading">
            <div class="story-article-top"><span class="story-overline" id="storyChapterEnglish"></span><span class="story-chapter-count" id="storyCount"></span></div>
            <h2 id="storyHeading" tabindex="-1"></h2>
            <div class="story-prose" id="storyProse"></div>
            <div class="story-keywords" id="storyKeywords"></div>
          </article>
          <div class="story-controls"><button class="story-step" id="storyPrevious" type="button" aria-label="上一章">←</button><p id="storyCaption"></p><button class="story-next" id="storyNext" type="button"><span id="storyNextLabel">下一章</span><span aria-hidden="true">→</span></button><a class="story-next" id="storyLibrary" hidden>进入知识库 <span aria-hidden="true">↗</span></a></div>
        </div>
      </div>
      <footer class="story-bottom"><p><span class="story-navigation-hint">← → 切换章节</span><span class="story-touch-hint">左右轻扫 · 切换章节</span></p><div class="story-progress" aria-hidden="true"><span id="storyProgress"></span></div><p id="storyProgressLabel"></p></footer>
    </div>
    <p class="story-sr-only" id="storyAnnouncement" role="status" aria-live="polite" aria-atomic="true"></p>
  </section>
`);
