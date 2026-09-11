'use strict';

(() => {
  const content = window.LVGL_ENTRANCE_CONTENT;
  if (!content) throw new Error('入口文案配置加载失败');

  const setText = (id, value) => {
    document.getElementById(id).textContent = value;
  };

  setText('entranceTitle', content.title);
  setText('entranceEyebrow', content.eyebrow);
  setText('entranceStatement', content.statement);
  setText('entranceAttribution', content.attribution);
  setText('entranceFooter', content.footer);

  const links = document.getElementById('entranceLinks');
  const status = document.getElementById('entranceStatus');

  content.links.forEach((item, index) => {
    const link = document.createElement('a');
    link.href = item.href;
    link.textContent = item.label;
    link.style.setProperty('--link-order', index);
    link.addEventListener('click', () => {
      status.textContent = `正在进入：${item.label}`;
      document.body.classList.add('is-leaving');
    });
    links.appendChild(link);
  });

  requestAnimationFrame(() => document.body.classList.add('is-ready'));
})();
