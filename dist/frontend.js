export function setup(ctx) {
  ctx.dom.addStyle(`
    .omni-wrap { display: flex; flex-direction: column; height: 100%; padding: 8px; gap: 8px; box-sizing: border-box; font-size: 0.85rem; }
    .omni-row { display: flex; gap: 4px; align-items: center; }
    .omni-tabs { display: flex; gap: 4px; }
    .omni-tab { flex: 1; padding: 7px 4px; font-size: 0.8rem; border: 1px solid var(--lumiverse-border, #444); background: var(--lumiverse-fill-subtle, #1a1a1a); color: var(--lumiverse-text, #fff); border-radius: var(--lumiverse-radius, 6px); cursor: pointer; text-align: center; }
    .omni-tab.active { background: var(--lumiverse-primary, #6366f1); color: #fff; font-weight: bold; border-color: transparent; }
    
    .omni-sort-btn { padding: 4px 8px; font-size: 0.72rem; border: 1px solid var(--lumiverse-border, #444); background: transparent; color: var(--lumiverse-text-subtle, #aaa); border-radius: 12px; cursor: pointer; }
    .omni-sort-btn.active { background: var(--lumiverse-fill, #333); color: var(--lumiverse-text, #fff); border-color: var(--lumiverse-primary, #6366f1); }
    
    .omni-tags-bar { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
    .omni-tag-pill { white-space: nowrap; padding: 2px 8px; font-size: 0.7rem; border-radius: 10px; background: var(--lumiverse-fill-subtle, #222); border: 1px solid var(--lumiverse-border, #444); color: var(--lumiverse-text-subtle, #bbb); cursor: pointer; }
    .omni-tag-pill.active { background: var(--lumiverse-primary, #6366f1); color: #fff; }

    .omni-bar input { flex: 1; min-width: 0; padding: 6px 8px; border: 1px solid var(--lumiverse-border, #444); background: var(--lumiverse-fill, #111); color: var(--lumiverse-text, #fff); border-radius: var(--lumiverse-radius, 6px); }
    .omni-btn { padding: 6px 12px; background: var(--lumiverse-primary, #6366f1); color: white; border: none; border-radius: var(--lumiverse-radius, 6px); cursor: pointer; font-weight: bold; }
    .omni-btn:disabled { opacity: 0.5; }

    .omni-grid { flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .omni-card { border: 1px solid var(--lumiverse-border, #444); border-radius: 8px; background: var(--lumiverse-fill-subtle, #1a1a1a); display: flex; flex-direction: column; overflow: hidden; }
    .omni-card img { width: 100%; height: 110px; object-fit: cover; background: #222; }
    .omni-info { padding: 6px; display: flex; flex-direction: column; flex: 1; justify-content: space-between; gap: 4px; }
    .omni-name { font-weight: bold; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--lumiverse-text, #fff); }
    .omni-author { font-size: 0.7rem; color: var(--lumiverse-text-subtle, #aaa); }
    
    .omni-card-tags { display: flex; gap: 3px; flex-wrap: wrap; margin-top: 2px; }
    .omni-badge { font-size: 0.62rem; padding: 1px 4px; background: rgba(255,255,255,0.08); border-radius: 4px; color: var(--lumiverse-text-subtle, #ccc); }
    .omni-stats { font-size: 0.65rem; color: var(--lumiverse-text-subtle, #888); }
    .omni-import { width: 100%; padding: 4px; font-size: 0.75rem; margin-top: 4px; }
  `);

  let currentSource = 'chub';
  let currentSort = 'download_count';
  let selectedTag = '';
  let currentPage = 1;
  let currentSearch = '';
  let includeNsfw = false;

  function callBackend(action, payload) {
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).slice(2);
      const handler = (msg) => {
        if (msg.requestId !== requestId) return;
        ctx.offBackendMessage(handler);
        if (msg.type === 'ERROR') reject(new Error(msg.error));
        else resolve(msg);
      };
      ctx.onBackendMessage(handler);
      ctx.sendToBackend({ action, provider: currentSource, payload, requestId });
    });
  }

  const tab = ctx.ui.registerDrawerTab({
    id: 'omni_hub',
    title: 'Character Hubs',
    shortName: 'Hubs',
    description: 'Browse Chub, JannyAI, and Datacat',
    headerTitle: 'Hub Browser',
    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>'
  });

  const container = tab.root;
  container.innerHTML = `
    <div class="omni-wrap">
      <!-- 1. Platform Tabs -->
      <div class="omni-tabs">
        <button class="omni-tab active" data-src="chub">Chub.ai</button>
        <button class="omni-tab" data-src="janny">JannyAI</button>
        <button class="omni-tab" data-src="datacat">Datacat</button>
      </div>

      <!-- 2. Sort / Main Page Selector -->
      <div class="omni-row" style="justify-content: space-between;">
        <div class="omni-row" id="omni-sort-group">
          <button class="omni-sort-btn active" data-sort="download_count">🔥 Popular</button>
          <button class="omni-sort-btn" data-sort="last_activity_at">✨ New</button>
          <button class="omni-sort-btn" data-sort="star_count">⭐ Trending</button>
        </div>
        <label style="font-size:0.75rem;"><input type="checkbox" id="omni-nsfw" /> NSFW</label>
      </div>

      <!-- 3. Search Bar -->
      <div class="omni-row omni-bar">
        <input type="text" id="omni-query" placeholder="Search keywords or paste link..." />
        <button class="omni-btn" id="omni-go">Search</button>
      </div>

      <!-- 4. Quick Tag Filter Bar -->
      <div class="omni-tags-bar" id="omni-tag-bar">
        <span class="omni-tag-pill active" data-tag="">All</span>
        <span class="omni-tag-pill" data-tag="Anime">Anime</span>
        <span class="omni-tag-pill" data-tag="Female">Female</span>
        <span class="omni-tag-pill" data-tag="Male">Male</span>
        <span class="omni-tag-pill" data-tag="RPG">RPG</span>
        <span class="omni-tag-pill" data-tag="Romance">Romance</span>
        <span class="omni-tag-pill" data-tag="Dominant">Dominant</span>
        <span class="omni-tag-pill" data-tag="Smut">Smut</span>
        <span class="omni-tag-pill" data-tag="Furry">Furry</span>
      </div>

      <!-- 5. Character Grid -->
      <div class="omni-grid" id="omni-results">
        <div style="grid-column:1/-1; text-align:center; padding:20px;">Loading main page...</div>
      </div>

      <!-- 6. Pagination -->
      <div class="omni-row" style="justify-content:center; gap:12px; margin-top:4px;">
        <button class="omni-btn" id="omni-prev" style="padding:4px 10px;">&lt; Prev</button>
        <span id="omni-page" style="font-weight:bold;">1</span>
        <button class="omni-btn" id="omni-next" style="padding:4px 10px;">Next &gt;</button>
      </div>
    </div>
  `;

  const grid = container.querySelector('#omni-results');
  const input = container.querySelector('#omni-query');
  const goBtn = container.querySelector('#omni-go');
  const nsfwBox = container.querySelector('#omni-nsfw');
  const pageTxt = container.querySelector('#omni-page');

  async function loadCatalog() {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:20px;">Loading characters...</div>';
    goBtn.disabled = true;

    try {
      // Direct Link Import
      if (input.value.startsWith('http')) {
        const res = await callBackend('IMPORT', { id: input.value.trim() });
        alert(`Successfully imported "${res.characterName}"!`);
        input.value = '';
        loadCatalog();
        return;
      }

      const res = await callBackend('SEARCH', {
        query: currentSearch,
        sort: currentSort,
        tag: selectedTag,
        page: currentPage,
        nsfw: includeNsfw
      });

      const chars = res.results.characters || [];
      if (!chars.length) {
        grid.innerHTML = `
          <div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--lumiverse-text-subtle,#888);">
            No characters found.<br><small>Tip: You can also paste any character URL directly into the search bar.</small>
          </div>`;
        return;
      }

      grid.innerHTML = chars.map(c => `
        <div class="omni-card" data-id="${c.id}">
          <img src="${c.avatarUrl}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/></svg>'"/>
          <div class="omni-info">
            <div>
              <div class="omni-name" title="${c.name}">${c.name}</div>
              <div class="omni-author">by ${c.creator}</div>
              <div class="omni-card-tags">
                ${(c.tags || []).map(t => `<span class="omni-badge">${t}</span>`).join('')}
              </div>
            </div>
            <div>
              <div class="omni-stats">⬇️ ${c.downloads || 0}  ⭐ ${c.stars || 0}</div>
              <button class="omni-btn omni-import">Import</button>
            </div>
          </div>
        </div>
      `).join('');

      // Attach Import Click
      grid.querySelectorAll('.omni-import').forEach(btn => {
        btn.onclick = async (e) => {
          const card = e.target.closest('.omni-card');
          const id = card.getAttribute('data-id');
          btn.disabled = true;
          btn.innerText = 'Importing...';

          try {
            const res = await callBackend('IMPORT', { id });
            btn.innerText = '✓ Done';
            alert(`Imported "${res.characterName}" to your characters!`);
          } catch (err) {
            alert(`Import failed: ${err.message}`);
            btn.innerText = 'Retry';
            btn.disabled = false;
          }
        };
      });
    } catch (err) {
      grid.innerHTML = `<div style="grid-column:1/-1; color:red; text-align:center; padding:20px;">${err.message}</div>`;
    } finally {
      goBtn.disabled = false;
    }
  }

  // 1. Platform Switcher (Chub, JannyAI, Datacat)
  container.querySelectorAll('.omni-tab').forEach(tabBtn => {
    tabBtn.onclick = (e) => {
      container.querySelectorAll('.omni-tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      currentSource = e.target.getAttribute('data-src');
      currentPage = 1;
      pageTxt.innerText = '1';
      loadCatalog();
    };
  });

  // 2. Sort Buttons (Popular, New, Trending)
  container.querySelectorAll('.omni-sort-btn').forEach(btn => {
    btn.onclick = (e) => {
      container.querySelectorAll('.omni-sort-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentSort = e.target.getAttribute('data-sort');
      currentPage = 1;
      pageTxt.innerText = '1';
      loadCatalog();
    };
  });

  // 3. Quick Tag Click
  container.querySelectorAll('.omni-tag-pill').forEach(pill => {
    pill.onclick = (e) => {
      container.querySelectorAll('.omni-tag-pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      selectedTag = e.target.getAttribute('data-tag');
      currentPage = 1;
      pageTxt.innerText = '1';
      loadCatalog();
    };
  });

  // 4. Search & Controls
  goBtn.onclick = () => {
    currentSearch = input.value.trim();
    currentPage = 1;
    pageTxt.innerText = '1';
    loadCatalog();
  };

  nsfwBox.onchange = (e) => {
    includeNsfw = e.target.checked;
    loadCatalog();
  };

  container.querySelector('#omni-prev').onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      pageTxt.innerText = String(currentPage);
      loadCatalog();
    }
  };

  container.querySelector('#omni-next').onclick = () => {
    currentPage++;
    pageTxt.innerText = String(currentPage);
    loadCatalog();
  };

  // Auto-load main page on startup
  loadCatalog();
}
