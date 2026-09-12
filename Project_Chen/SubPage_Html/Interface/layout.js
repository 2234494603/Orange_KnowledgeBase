'use strict';

document.getElementById('knowledgeBaseRoot').innerHTML = String.raw`
<div class="water-bg" aria-hidden="true">
    <video class="ambient-video" autoplay muted loop playsinline preload="metadata" tabindex="-1">
      <source src="./MP4/14512643_1920_1080_24fps.mp4" type="video/mp4">
    </video>
    <span class="video-scrim"></span>
  </div>
  <div class="app">
    <header class="topbar">
      <div class="top-inner">
        <div class="brand">
          <span class="mark" aria-hidden="true"></span>
          <div>
            <strong>LVGL 个人知识库</strong>
            <span>模块化知识库，支持相对路径部署</span>
          </div>
        </div>
        <div class="top-actions">
          <button class="btn soft" id="homeBtn" type="button">入口首页</button>
          <button class="btn soft" id="copyIndexBtn" type="button">复制目录</button>
          <button class="btn soft" id="downloadBtn" type="button">导出当前模块</button>
        </div>
      </div>
    </header>

    <div class="home-area">
      <section class="hero">
        <div class="hero-card">
          <span class="eyebrow">青春活力 · 纸浆米白 · 模块化知识库</span>
          <h1>把 LVGL 学习资料装进一个清爽入口</h1>
          <p class="lead">入口页只负责导航：查 Designer、学 FreeRTOS、搜索关键词。布局、视觉效果、功能函数与知识模块数据已经分离，后续可以按目录单独维护。</p>
        </div>
      </section>

      <section class="search-panel">
        <div class="search-box">
          <input id="search" type="search" autocomplete="off" aria-label="搜索知识库" placeholder="搜索：事件、页面跳转、队列、SD卡、LV_EVENT_CLICKED……">
          <button class="btn primary" id="searchBtn" type="button">搜索知识库</button>
        </div>
      </section>

      <div class="quick">
        <button class="chip" type="button" data-query="事件">事件</button>
        <button class="chip" type="button" data-query="页面跳转">页面跳转</button>
        <button class="chip" type="button" data-query="控件">控件</button>
        <button class="chip" type="button" data-query="队列">队列</button>
        <button class="chip" type="button" data-query="FreeRTOS">FreeRTOS</button>
        <button class="chip" type="button" data-query="STM32F103">STM32F103</button>
        <button class="chip" type="button" data-query="SD卡">SD卡</button>
      </div>

      <section class="home">
        <div class="section-title">
          <h2>入口选项</h2>
          <span id="summaryText">2 个知识模块</span>
        </div>
        <div class="entry-grid" id="entries"></div>
        <div class="cards">
          <div class="info-card"><strong>模块化保存</strong><p>入口、界面、功能与知识数据分目录维护，整体复制即可部署。</p></div>
          <div class="info-card"><strong>以后继续加</strong><p>新增模块只需要追加一条模块记录，适合慢慢长成个人知识库。</p></div>
          <div class="info-card"><strong>学习顺序</strong><p>先查 Designer 术语，再跑 LVGL 事件，最后用 FreeRTOS 接硬件。</p></div>
        </div>
      </section>

      <section class="results" id="results"></section>
    </div>

    <section class="reader" id="reader">
      <div class="reader-head">
        <div class="reader-actions">
          <button class="btn soft" id="backBtn" type="button">返回知识库</button>
        </div>
      </div>
      <div class="frame-wrap">
        <iframe class="module-viewer" id="viewer" title="知识库模块"></iframe>
      </div>
    </section>
  </div>
  <div class="toast" id="toast">完成</div>
`;
