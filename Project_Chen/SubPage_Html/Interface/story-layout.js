'use strict';

document.getElementById('entranceRoot').insertAdjacentHTML('beforeend', String.raw`
  <canvas class="space-transition" id="spaceTransition" aria-hidden="true" hidden></canvas>

  <section class="story-scene" id="storyScene" aria-label="Pro-X 创办的初心" hidden>
    <div class="story-art-stack" aria-hidden="true"><div class="story-art is-visible" id="storyArtA"></div><div class="story-art" id="storyArtB"></div><div class="story-depth-grid"></div><div class="story-vignette"></div><div class="story-grain"></div></div>
    <header class="story-header">
      <button class="story-brand" id="storyHome" type="button" aria-label="退出故事，返回 Pro-X 入口">Pro-X<span id="storySeries"></span></button>
      <div class="story-header-actions"><button class="story-utility" id="storyFullscreen" type="button" aria-pressed="false"><span aria-hidden="true">⛶</span><span class="story-utility-label" id="storyFullscreenLabel">全屏</span></button><button class="story-utility" id="storyExit" type="button"><span aria-hidden="true">↖</span><span class="story-utility-label">退出故事</span></button></div>
    </header>

    <main class="story-stage" id="storyStage">
      <article class="story-page" id="storyPage" aria-labelledby="storyHeading">
        <p class="story-kicker"><span id="storyChapter"></span><i aria-hidden="true"></i><span id="storyEnglish"></span></p>
        <h2 id="storyHeading" tabindex="-1"></h2>
        <p class="story-continue" id="storyContinue">点击画面、滚轮或按 → 继续</p>
      </article>
    </main>

    <footer class="story-footer">
      <button class="story-nav-button story-previous" id="storyPrevious" type="button" aria-label="上一幕"><span aria-hidden="true">←</span><span>上一幕</span></button>
      <div class="story-progress-wrap"><div class="story-progress-meta"><span id="storyProgressLabel"></span><span id="storyChapterLabel"></span></div><div class="story-progress" role="progressbar" aria-label="故事进度" aria-valuemin="1" id="storyProgressBar"><span id="storyProgress"></span></div></div>
      <button class="story-nav-button story-next" id="storyNext" type="button"><span id="storyNextLabel">下一幕</span><span aria-hidden="true">→</span></button>
      <a class="story-nav-button story-next" id="storyLibrary" hidden><span>进入知识库</span><span aria-hidden="true">↗</span></a>
    </footer>
    <p class="story-sr-only" id="storyAnnouncement" role="status" aria-live="polite" aria-atomic="true"></p>
  </section>
`);
