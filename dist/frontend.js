export function setup(ctx) {
  // Sleek, Glassmorphic Modern Dark Theme
  ctx.dom.addStyle(`
    .omni-root {
      display: flex; flex-direction: column; height: 100%; box-sizing: border-box;
      padding: 10px; gap: 10px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--lumiverse-bg, #0f1117); color: var(--lumiverse-text, #f1f5f9);
    }

    /* Platform Tabs */
    .omni-platform-tabs {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
      background: rgba(255, 255, 255, 0.04); padding: 4px; border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .omni-tab-btn {
      padding: 8px 4px; font-size: 0.8rem; font-weight: 600; border: none;
      background: transparent; color: #94a3b8; border-radius: 8px; cursor: pointer;
      transition: all 0.2s ease; text-align: center;
    }
    .omni-tab-btn.active {
      background: var(--lumiverse-primary, #6366f1); color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }

    /* Search & Direct Link Input */
    .omni-search-box {
      display: flex; gap: 6px; position: relative; align-items: center;
    }
    .omni-search-box input {
      flex: 1; padding: 10px 14px; font-size: 0.82rem; border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.05);
      color: #fff; outline: none; transition: border-color 0.2s ease;
    }
    .omni-search-box input:focus {
      border-color: var(--lumiverse-primary, #6366f1);
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    .omni-action-btn {
      padding: 10px 16px; font-size: 0.82rem; font-weight: 600; border-radius: 10px;
      border: none; background: var(--lumiverse-primary, #6366f1); color: #fff;
      cursor: pointer; transition: transform 0.1s ease, opacity 0.2s;
    }
    .omni-action-btn:active { transform: scale(0.97); }
    .omni-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    /* Filters & Sort Controls */
    .omni-control-row {
      display: flex; justify-content: space-between; align-items: center; gap: 8px;
    }
    .omni-sort-chips {
      display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none;
    }
    .omni-chip {
      padding: 4px 10px; font-size: 0.72rem; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.04); color: #94a3b8; cursor: pointer; white-space: nowrap;
      transition: all 0.2s ease;
    }
    .omni-chip.active {
      background: rgba(99, 102, 241, 0.2); border-color: #6366f1; color: #a5b4fc; font-weight: 600;
    }
    .omni-nsfw-toggle {
      font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; gap: 4px; cursor: pointer;
    }

    /* Tag Quick Bar */
    .omni-tag-bar {
      display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none;
    }
    .omni-tag-pill {
      font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;
      background: rgba(255, 255, 255, 0.03); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.06);
      cursor: pointer; white-space: nowrap;
    }
    .omni-tag-pill.active {
      background: #6366f1; color: #fff; border-color: #6366f1;
    }

    /* Cards Grid */
    .omni-grid {
      flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 10px; padding-right: 2px;
    }
    .omni-card {
      background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .omni-card:hover {
      border-color: rgba(99, 102, 241, 0.4); transform: translateY(-2px);
    }
    .omni-thumb-wrap {
      position: relative; width: 100%; aspect-ratio: 1 / 1; background: #161822; overflow: hidden;
    }
    .omni-thumb-wrap img {
      width: 100%; height: 100%; object-fit: cover;
    }
    .omni-source-badge {
      position: absolute; top: 6px; left: 6px; padding: 2px 6px; font-size: 0.6rem;
      font-weight: 700; text-transform: uppercase; border-radius: 4px;
      background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); color: #e2e8f0;
    }
    .omni-card-body {
      padding: 8px; display: flex; flex-direction: column; flex: 1; justify-content: space-between; gap: 6px;
    }
    .omni-card-title {
      font-size: 0.8rem; font-weight: 700; color: #f8fafc;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .omni-card-author {
      font-size: 0.68rem; color: #64748b; margin-top: 1px;
    }
    .omni-badge-container {
      display: flex; gap: 3px; flex-wrap: wrap; margin-top: 3px;
    }
    .omni-tag-badge {
      font-size: 0.6rem; padding: 1px 5px; border-radius: 4px;
      background: rgba(99, 102, 241, 0.12); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.2);
    }
    .omni-import-btn {
      width: 100%; padding: 6px 0; font-size: 0.75rem; font-weight: 600;
      border-radius: 8px; border: none; background: #6366f1; color: white; cursor: pointer;
      transition: background 0.2s ease;
    }
    .omni-import-btn.success {
      background: #10b981;
    }

    /* States */
    .omni-status-box {
      grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 40px 10px; color: #94a3b8; text-align: center; gap: 8px;
    }
    .omni-spinner {
      width: 24px; height: 24px; border: 3px solid rgba(99, 102, 241, 0.2);
      border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `);

  let currentSource = 'chub';
  let currentSort = 'download_count';
  let selectedTag = '';
  let currentPage = 1;
  let currentSearch = '';
  let includeNsfw = false;

  // Robust Message Bridge with 15s Timeout
  function callBackend(action, payload) {
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).slice(2);
      const timer = setTimeout(() => {
        ctx.offBackendMessage?.(handler);
        reject(new Error("Request timed out. Please check your internet connection."));
      }, 15000);

      const handler = (msg) => {
        if (msg?.requestId !== requestId) return;
        clearTimeout(timer);
        ctx.offBackendMessage?.(handler);
        if (msg.type === 'ERROR') reject(new Error(msg.error || 'Server error'));
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
    headerTitle: 'Character Browser',
    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>'
  });

  const container = tab.root;
  container.innerHTML = `
    <div class="omni-root">
      <!-- 1. Source Switcher -->
      <div class="omni-platform-tabs">
        <button class="omni-tab-btn active" data-src="chub">Chub.ai</button>
        <button class="omni-tab-btn" data-src="janny">JannyAI</button>
        <button class="omni-tab-btn" data-src="datacat">Datacat</button>
      </div>

      <!-- 2. Search & Direct Link -->
      <div class="omni-search-box">
        <input type="text" id="omni-query" placeholder="Search characters or paste direct URL..." />
        <button class="omni-action-btn" id="omni-go">Search</button>
      </div>

      <!-- 3. Sort & NSFW Controls -->
      <div class="omni-control-row">
        <div class="omni-sort-chips">
          <button class="omni-chip active" data-sort="download_count">🔥 Popular</button>
          <button class="omni-chip" data-sort="last_activity_at">✨ Newest</button>
          <button class="omni-chip" data-sort="star_count">⭐ Trending</button>
        </div>
        <label class="omni-nsfw-toggle">
          <input type="checkbox" id="omni-nsfw" /> NSFW
        </label>
      </div>

      <!-- 4. Quick Tag Bar -->
      <div class="omni-tag-bar">
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
      <div class="omni-grid" id="omni-results"></div>

      <!-- 6. Footer Navigation -->
      <div class="omni-control-row" style="justify-content:center; gap:16px;">
        <button class="omni-chip" id="omni-prev">&lt; Prev</button>
        <span id="omni-page" style="font-weight:700; font-size:0.8rem; color:#94a3b8;">1</span>
        <button class="omni-chip" id="omni-next">Next &gt;</button>
      </div>
    </div>
  `;

  const grid = container.querySelector('#omni-results');
  const input = container.querySelector('#omni-query');
  const goBtn = container.querySelector('#omni-go');
  const nsfwBox = container.querySelector('#omni-nsfw');
  const pageTxt = container.querySelector('#omni-page');

  async function loadCatalog() {
    grid.innerHTML = `
      <div class="omni-status-box">
        <div class="omni-spinner"></div>
        <span>Fetching characters...</span>
      </div>`;
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
          <div class="omni-status-box">
            <span>No characters found.</span>
            <small style="color:#64748b;">You can paste any character page link directly into the search bar.</small>
          </div>`;
        return;
      }

      grid.innerHTML = chars.map(c => `
        <div class="omni-card" data-id="${c.id}">
          <div class="omni-thumb-wrap">
            <img src="${c.avatarUrl}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%231e293b%22/></svg>'"/>
            <span class="omni-source-badge">${c.source}</span>
          </div>
          <div class="omni-card-body">
            <div>
              <div class="omni-card-title" title="${c.name}">${c.name}</div>
              <div class="omni-card-author">by ${c.creator}</div>
              <div class="omni-badge-container">
                ${(c.tags || []).map(t => `<span class="omni-tag-badge">${t}</span>`).join('')}
              </div>
            </div>
            <button class="omni-import-btn">Import</button>
          </div>
        </div>
      `).join('');

      // Wire Import Buttons
      grid.querySelectorAll('.omni-import-btn').forEach(btn => {
        btn.onclick = async (e) => {
          const card = e.target.closest('.omni-card');
          const id = card.getAttribute('data-id');
          btn.disabled = true;
          btn.innerText = 'Importing...';

          try {
            const res = await callBackend('IMPORT', { id });
            btn.classList.add('success');
            btn.innerText = '✓ In Library';
          } catch (err) {
            btn.innerText = 'Failed';
            alert(`Import failed: ${err.message}`);
            btn.disabled = false;
          }
        };
      });
    } catch (err) {
      grid.innerHTML = `
        <div class="omni-status-box" style="color:#f87171;">
          <span>${err.message}</span>
          <button class="omni-chip" id="omni-retry-btn" style="margin-top:6px;">Tap to Retry</button>
        </div>`;
      container.querySelector('#omni-retry-btn')?.addEventListener('click', loadCatalog);
    } finally {
      goBtn.disabled = false;
    }
  }

  // 1. Source Tabs
  container.querySelectorAll('.omni-tab-btn').forEach(btn => {
    btn.onclick = (e) => {
      container.querySelectorAll('.omni-tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentSource = e.target.getAttribute('data-src');
      currentPage = 1;
      pageTxt.innerText = '1';
      loadCatalog();
    };
  });

  // 2. Sort Chips
  container.querySelectorAll('.omni-chip[data-sort]').forEach(btn => {
    btn.onclick = (e) => {
      container.querySelectorAll('.omni-chip[data-sort]').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentSort = e.target.getAttribute('data-sort');
      currentPage = 1;
      pageTxt.innerText = '1';
      loadCatalog();
    };
  });

  // 3. Tag Filter Pills
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

  // 4. Search & Pagination Controls
  goBtn.onclick = () => {
    currentSearch = input.value.trim();
    currentPage = 1;
    pageTxt.innerText = '1';
    loadCatalog();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') goBtn.click();
  });

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

  // Initial Load
  loadCatalog();
}
