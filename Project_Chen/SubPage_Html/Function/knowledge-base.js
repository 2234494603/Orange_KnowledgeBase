'use strict';

(() => {
      const MODULES = window.KNOWLEDGE_BASE_MODULES;
      if (!Array.isArray(MODULES)) throw new Error('知识库模块数据加载失败');
      const decoder = new TextDecoder('utf-8');
      const entries = document.getElementById('entries');
      const search = document.getElementById('search');
      const results = document.getElementById('results');
      const contentView = document.getElementById('contentView');
      const readerTitle = document.getElementById('readerTitle');
      const readerMeta = document.getElementById('readerMeta');
      const toast = document.getElementById('toast');
      let current = MODULES[0];
      const htmlCache = new Map();

      function bytesFromBase64(value) {
        const bin = atob(value);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
      }

      function getHtml(module) {
        if (!htmlCache.has(module.id)) {
          htmlCache.set(module.id, decoder.decode(bytesFromBase64(module.base64)));
        }
        return htmlCache.get(module.id);
      }

      function blobUrl(module) {
        if (!module.blobUrl) {
          module.blobUrl = URL.createObjectURL(new Blob([bytesFromBase64(module.base64)], { type: 'text/html;charset=utf-8' }));
        }
        return module.blobUrl;
      }

      function textOf(module) {
        const doc = new DOMParser().parseFromString(getHtml(module), 'text/html');
        return [module.title, module.shortTitle, module.summary, module.group, (module.tags || []).join(' '), doc.body?.innerText || ''].join(' ');
      }

      function contentOf(module) {
        const doc = new DOMParser().parseFromString(getHtml(module), 'text/html');
        const main = doc.querySelector('main#content') || doc.querySelector('main') || doc.body;
        const clone = main.cloneNode(true);
        clone.querySelectorAll('script, style, link, meta, title, .toolbar, nav, .toast, .back-top, .progress, .progress-track').forEach(node => node.remove());
        clone.querySelectorAll('[id]').forEach(node => {
          node.id = 'module-' + module.id + '-' + node.id;
        });
        return clone.innerHTML;
      }

      function sizeLabel(bytes) {
        return (bytes / 1024).toFixed(1) + ' KB';
      }

      function showToast(text) {
        toast.textContent = text;
        toast.classList.add('show');
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove('show'), 1300);
      }

      function renderEntries() {
        entries.innerHTML = MODULES.map((module, index) => {
          const tags = (module.tags || []).map(tag => '<span class="tag">' + tag + '</span>').join('');
          return '<article class="entry" style="--accent:' + module.accent + '" data-id="' + module.id + '">' +
            '<div class="entry-kicker"><span>' + module.group + '</span><span>' + sizeLabel(module.size) + '</span></div>' +
            '<h3>' + module.shortTitle + '</h3>' +
            '<p>' + module.summary + '</p>' +
            '<div class="tags">' + tags + '</div>' +
            '<div class="entry-actions"><button class="btn primary" type="button" data-open="' + module.id + '">进入学习</button></div>' +
            '</article>';
        }).join('');
        document.getElementById('summaryText').textContent = MODULES.length + ' 个模块 · 原文完整嵌入';
        entries.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', event => {
          event.stopPropagation();
          openModule(btn.dataset.open);
        }));
        entries.querySelectorAll('.entry').forEach(card => card.addEventListener('click', () => openModule(card.dataset.id)));
      }

      function openModule(id) {
        const module = MODULES.find(item => item.id === id) || MODULES[0];
        current = module;
        localStorage.setItem('lvgl_kb_current', module.id);
        readerTitle.textContent = module.title;
        readerMeta.textContent = module.group + ' · ' + module.fileName + ' · SHA256 ' + module.sha256.slice(0, 12);
        contentView.innerHTML = contentOf(module);
        enhanceArticle();
        document.body.classList.add('reading');
      }

      function goHome() {
        document.body.classList.remove('reading');
        results.classList.remove('show');
      }

      function enhanceArticle() {
        contentView.querySelectorAll('code').forEach(code => {
          code.title = '点击复制';
          code.addEventListener('click', () => copyText(code.textContent));
        });
        contentView.querySelectorAll('pre').forEach(pre => {
          if (pre.querySelector('.copy-code')) return;
          const button = document.createElement('button');
          button.className = 'copy-code';
          button.type = 'button';
          button.textContent = '复制代码';
          button.addEventListener('click', event => {
            event.stopPropagation();
            copyText(pre.querySelector('code')?.textContent || pre.textContent);
          });
          pre.appendChild(button);
        });
      }

      function doSearch() {
        const raw = search.value.trim().toLocaleLowerCase('zh-CN');
        if (!raw) {
          results.classList.remove('show');
          results.innerHTML = '';
          return;
        }
        const terms = raw.split(/\s+/).filter(Boolean);
        const hits = MODULES.filter(module => {
          const lower = textOf(module).toLocaleLowerCase('zh-CN');
          return terms.every(term => lower.includes(term));
        });
        results.classList.add('show');
        results.innerHTML = '<div class="section-title"><h2>搜索结果</h2><span>' + hits.length + ' 个模块匹配</span></div>' +
          (hits.length ? hits.map(module => '<article class="result-card" data-id="' + module.id + '"><h3>' + module.shortTitle + '</h3><p>' + module.summary + '</p></article>').join('') : '<article class="result-card"><h3>没有找到</h3><p>换一个更短的关键词试试。</p></article>');
        results.querySelectorAll('[data-id]').forEach(card => card.addEventListener('click', () => openModule(card.dataset.id)));
        results.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      async function copyText(text) {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const area = document.createElement('textarea');
          area.value = text;
          area.style.position = 'fixed';
          area.style.opacity = '0';
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          area.remove();
        }
        showToast('已复制');
      }

      function downloadCurrent() {
        const link = document.createElement('a');
        link.href = blobUrl(current);
        link.download = current.fileName;
        link.click();
      }

      renderEntries();
      document.getElementById('searchBtn').addEventListener('click', doSearch);
      search.addEventListener('keydown', event => {
        if (event.key === 'Enter') doSearch();
        if (event.key === 'Escape') {
          search.value = '';
          results.classList.remove('show');
        }
      });
      document.querySelectorAll('[data-query]').forEach(btn => btn.addEventListener('click', () => {
        search.value = btn.dataset.query;
        doSearch();
      }));
      document.getElementById('homeBtn').addEventListener('click', goHome);
      document.getElementById('backBtn').addEventListener('click', goHome);
      document.getElementById('downloadBtn').addEventListener('click', downloadCurrent);
      document.getElementById('copyIndexBtn').addEventListener('click', () => {
        copyText(MODULES.map((module, i) => (i + 1) + '. ' + module.title + '\n   ' + module.fileName + '\n   SHA256: ' + module.sha256).join('\n\n'));
      });
      document.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          goHome();
          search.focus();
          search.select();
        }
      });
      const saved = localStorage.getItem('lvgl_kb_current');
      if (saved && MODULES.some(module => module.id === saved)) current = MODULES.find(module => module.id === saved);
    })();
