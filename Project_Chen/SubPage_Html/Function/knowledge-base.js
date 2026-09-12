'use strict';

(() => {
      const MODULES = window.KNOWLEDGE_BASE_MODULES;
      if (!Array.isArray(MODULES)) throw new Error('知识库模块数据加载失败');
      const lvglModule = MODULES.find(module => module.id === 'designer-api');
      if (lvglModule) lvglModule.shortTitle = 'LVGL';
      const decoder = new TextDecoder('utf-8');
      const entries = document.getElementById('entries');
      const search = document.getElementById('search');
      const results = document.getElementById('results');
      const viewer = document.getElementById('viewer');
      const toast = document.getElementById('toast');
      let current = MODULES[0];
      const htmlCache = new Map();
      let returnFocus = null;
      const remember = (key, value) => { try { localStorage.setItem(key, value); } catch { /* 浏览器禁用存储时仍允许阅读。 */ } };
      const recalled = key => { try { return localStorage.getItem(key); } catch { return null; } };

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
        doc.querySelectorAll('script, style').forEach(node => node.remove());
        return [module.title, module.shortTitle, module.summary, module.group, (module.tags || []).join(' '), doc.body?.textContent || ''].join(' ');
      }

      function framedHtml(module) {
        const themeUrl = new URL('./SubPage_Html/Interface/manual-frame-theme.css', document.baseURI).href;
        const themeLink = '<link rel="stylesheet" href="' + themeUrl + '">';
        const behaviorUrl = new URL('./SubPage_Html/Function/manual-frame-behavior.js', document.baseURI).href;
        const behaviorScript = '<script src="' + behaviorUrl + '"></script>';
        return getHtml(module).replace('</head>', themeLink + '</head>').replace('</body>', behaviorScript + '</body>');
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
          return '<article class="entry" style="--accent:' + module.accent + '" data-id="' + module.id + '" tabindex="0" role="button" aria-label="打开 ' + module.shortTitle + '">' +
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
        entries.querySelectorAll('.entry').forEach(card => {
          card.addEventListener('click', () => openModule(card.dataset.id));
          card.addEventListener('keydown', event => {
            if (event.target === card && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openModule(card.dataset.id); }
          });
        });
      }

      function openModule(id, updateUrl = true) {
        const module = MODULES.find(item => item.id === id) || MODULES[0];
        current = module;
        remember('lvgl_kb_current', module.id);
        returnFocus = document.activeElement;
        viewer.title = module.title;
        viewer.srcdoc = framedHtml(module);
        document.body.classList.add('reading');
        if (updateUrl) {
          const url = new URL(location.href);
          url.searchParams.set('module', module.id);
          history.pushState(null, '', url.href);
        }
        document.getElementById('backBtn').focus({ preventScroll: true });
      }

      function goHome() {
        document.body.classList.remove('reading');
        const url = new URL(location.href);
        url.searchParams.delete('module');
        url.hash = '';
        history.replaceState(null, '', url.href);
        if (returnFocus?.isConnected && returnFocus !== document.body) returnFocus.focus({ preventScroll: true });
      }

      function goEntrance() {
        window.location.href = new URL('./LVGL_个人知识库_完整融合版_可独立使用.html', document.baseURI).href;
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
          (hits.length ? hits.map(module => '<article class="result-card" data-id="' + module.id + '" tabindex="0" role="button" aria-label="打开 ' + module.shortTitle + '"><h3>' + module.shortTitle + '</h3><p>' + module.summary + '</p></article>').join('') : '<article class="result-card"><h3>没有找到</h3><p>换一个更短的关键词试试。</p></article>');
        results.querySelectorAll('[data-id]').forEach(card => card.addEventListener('click', () => openModule(card.dataset.id)));
        results.querySelectorAll('[data-id]').forEach(card => card.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openModule(card.dataset.id); }
        }));
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
          const copied = document.execCommand('copy');
          area.remove();
          if (!copied) { showToast('复制失败，请检查浏览器剪贴板权限'); return; }
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
      document.getElementById('homeBtn').addEventListener('click', goEntrance);
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
      const saved = recalled('lvgl_kb_current');
      if (saved && MODULES.some(module => module.id === saved)) current = MODULES.find(module => module.id === saved);
      const requested = new URLSearchParams(location.search).get('module');
      if (requested && MODULES.some(module => module.id === requested)) openModule(requested, false);
      window.addEventListener('popstate', () => {
        const id = new URLSearchParams(location.search).get('module');
        if (MODULES.some(module => module.id === id)) openModule(id, false);
        else document.body.classList.remove('reading');
      });
    })();
