'use strict';

// 内嵌手册的适配层；保留原始手册数据，修正 iframe 中的导航与输入行为。
(() => {
  let toastTimer;
  const toast = message => {
    const node = document.getElementById('toast');
    node.textContent = message; node.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('show'), 1800);
  };
  async function copy(value) {
    let copied = false;
    try { await navigator.clipboard.writeText(value); copied = true; } catch {
      const previous = document.activeElement;
      const area = document.createElement('textarea');
      area.value = value; area.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(area); area.select();
      try { copied = document.execCommand('copy'); } catch { copied = false; }
      area.remove(); previous?.focus({ preventScroll: true });
    }
    toast(copied ? '已复制' : '复制失败，请检查浏览器剪贴板权限');
  }
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (anchor) {
      const id = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        event.preventDefault(); event.stopImmediatePropagation();
        target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
        target.tabIndex = -1; target.focus({ preventScroll: true });
      }
      return;
    }
    const button = event.target.closest('.copy-code, #copyNotes');
    const code = event.target.closest('code');
    if (button || code) {
      event.preventDefault(); event.stopImmediatePropagation();
      let value;
      if (button?.id === 'copyNotes') value = document.querySelector('#personalNotes, #notes').value || '暂无笔记';
      else if (button) { const pre = button.closest('pre'); const clone = pre.cloneNode(true); clone.querySelectorAll('button').forEach(node => node.remove()); value = pre.querySelector('code')?.textContent || clone.textContent; }
      else value = code.textContent;
      copy(value);
    }
  }, true);
  document.querySelectorAll('code').forEach(code => { code.tabIndex = 0; code.setAttribute('role', 'button'); code.setAttribute('aria-label', '复制代码：' + code.textContent.slice(0, 60)); });
  document.addEventListener('keydown', event => {
    const editable = event.target.closest('input, textarea, select, [contenteditable="true"]');
    // 手册的全局 / 快捷键不能抢走笔记中的斜杠。
    if (editable && (event.key === '/' || event.key === 'Escape')) { event.stopImmediatePropagation(); if (event.key === 'Escape' && event.target.id === 'search') { event.target.value = ''; document.getElementById('sectionFilter').value = ''; event.target.dispatchEvent(new Event('input', { bubbles: true })); event.target.blur(); } return; }
    const code = event.target.closest('code');
    if (code && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); event.stopImmediatePropagation(); copy(code.textContent); }
  }, true);
  const top = document.getElementById('backTop');
  top?.setAttribute('aria-label', '返回顶部');
  const search = document.getElementById('search');
  search?.setAttribute('aria-label', '搜索当前手册');
  document.getElementById('sectionFilter')?.setAttribute('aria-label', '按章节筛选');
  const updateEmpty = () => {
    const empty = document.getElementById('empty');
    const headings = [...document.querySelectorAll('main h2')];
    // 原 LVGL 手册把无表格章节误计为零匹配，按实际可见章节校正。
    if (headings.some(heading => !heading.classList.contains('hidden') && !heading.closest('section.hidden'))) empty.style.display = 'none';
  };
  search?.addEventListener('input', updateEmpty);
  document.getElementById('sectionFilter')?.addEventListener('change', updateEmpty);
  document.querySelectorAll('[data-mode], [data-query]').forEach(button => button.addEventListener('click', updateEmpty));
  // 固定工具栏高度随手机换行而变，目录目标需要动态避让。
  const toolbar = document.querySelector('.toolbar');
  if (toolbar && 'ResizeObserver' in window) new ResizeObserver(() => document.documentElement.style.setProperty('--manual-toolbar-height', `${toolbar.getBoundingClientRect().height + 16}px`)).observe(toolbar);
  updateEmpty();
})();
