'use strict';

// 暂用介绍文案：正式文案到位后，只需替换本配置，不必调整动效与布局。
window.PROX_STORY_CONTENT = Object.freeze({
  menuTitle: '选择一段旅程',
  menuIntro: '走进 Pro-X，或从一条知识开始。',
  storyLabel: '故事介绍',
  storyDescription: '关于起点、构建，与还未抵达的地方',
  libraryLabel: '进入知识库',
  libraryDescription: 'LVGL · FreeRTOS · 工程实践',
  libraryHref: './SubPage_Html/KnowledgeBase/index.html',
  title: 'Pro-X 的故事',
  chapters: [
    {
      label: '起点', english: 'THE BEGINNING', motif: '01',
      title: '每一个界面，\n都始于一个想法。',
      paragraphs: [
        '一个控件，一次点击，一块被点亮的屏幕。看似微小的起点，连接着从想法到实现的整个过程。',
        'Pro-X 从这里开始：把学习中的问题、调试中的发现和实践中的经验，一点点留下来。'
      ],
      keywords: ['好奇', '尝试', '记录'],
      caption: '从第一行代码，到第一个回应。'
    },
    {
      label: '构建', english: 'BUILDING CONNECTIONS', motif: '02',
      title: '让零散的经验，\n有迹可循。',
      paragraphs: [
        '从 LVGL 的控件、样式与事件，到 FreeRTOS 的任务与协作，知识在具体的问题里产生，也在不断的实践中连接。',
        '这里收录术语、API 与学习手册，让每一次查找都能成为下一步实践的起点。'
      ],
      keywords: ['LVGL', 'FreeRTOS', '实践'],
      caption: '理解一个问题，也打开另一种可能。'
    },
    {
      label: '延伸', english: 'BEYOND THE KNOWN', motif: '03',
      title: '把下一步，\n留给探索。',
      paragraphs: [
        '知识库会随着新的问题与新的尝试慢慢生长。经验被重新发现，也会长出新的用法。',
        '这段介绍只是开篇。接下来，选一个感兴趣的主题，继续把想法变成能够运行的作品。'
      ],
      keywords: ['探索', '积累', '继续'],
      caption: '故事继续，下一页由实践写下。'
    }
  ]
});
