'use strict';

document.getElementById('entranceRoot').innerHTML = String.raw`
  <div class="entrance-backdrop" aria-hidden="true">
    <video class="entrance-video" autoplay muted loop playsinline preload="metadata" tabindex="-1">
      <source src="./MP4/14512643_1920_1080_24fps.mp4" type="video/mp4">
    </video>
    <span class="entrance-stars"></span>
    <span class="entrance-scrim"></span>
  </div>

  <main class="entrance-shell" aria-labelledby="entranceTitle">
    <section class="entrance-content">
      <p class="entrance-eyebrow entrance-reveal" id="entranceEyebrow"></p>
      <h1 class="entrance-title entrance-reveal"><button class="pro-x-trigger" id="entranceTitle" type="button" aria-haspopup="dialog" aria-controls="journeyMenu" aria-expanded="false" aria-describedby="journeyHint"></button></h1>
      <p class="journey-hint" id="journeyHint">点击 Pro-X · 探索故事 <span aria-hidden="true">↗</span></p>

      <div class="entrance-glass entrance-reveal">
        <span class="entrance-rule entrance-rule-start" aria-hidden="true"></span>
        <span class="entrance-quote-mark entrance-quote-mark-start" aria-hidden="true">“</span>
        <p class="entrance-statement" id="entranceStatement"></p>
        <p class="entrance-attribution" id="entranceAttribution"></p>
        <span class="entrance-quote-mark entrance-quote-mark-end" aria-hidden="true">”</span>
        <span class="entrance-rule entrance-rule-end" aria-hidden="true"></span>
      </div>

      <nav class="entrance-links entrance-reveal" id="entranceLinks" aria-label="知识库入口"></nav>

      <div class="entrance-footer entrance-reveal">
        <span class="entrance-orbit" aria-hidden="true"><i></i></span>
        <span id="entranceFooter"></span>
      </div>
      <p class="entrance-status" id="entranceStatus" role="status" aria-live="polite"></p>
    </section>
  </main>
`;
