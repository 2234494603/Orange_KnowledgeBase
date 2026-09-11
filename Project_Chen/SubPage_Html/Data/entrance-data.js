'use strict';

window.LVGL_ENTRANCE_CONTENT = Object.freeze({
  title: 'Pro-X',
  eyebrow: 'PERSONAL KNOWLEDGE BASE',
  statement: '把零散经验，沉淀为可检索、可复用的工程知识。',
  attribution: '嵌入式 GUI · 学习与实践',
  links: Object.freeze([
    Object.freeze({ label: '进入知识库', href: './SubPage_Html/KnowledgeBase/index.html' }),
    Object.freeze({ label: 'LVGL', href: './SubPage_Html/KnowledgeBase/index.html?module=designer-api' }),
    Object.freeze({ label: 'FreeRTOS', href: './SubPage_Html/KnowledgeBase/index.html?module=freertos-f103' })
  ]),
  footer: 'LVGL · Embedded GUI'
});
