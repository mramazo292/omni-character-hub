export function setup(ctx) {
  // Vector Rose Icon SVG
  const roseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
    <path d="M12 2C9.5 2 7 3.5 7 6.5C7 9.5 10 11.5 12 13C14 11.5 17 9.5 17 6.5C17 3.5 14.5 2 12 2Z" fill="#f43f5e" stroke="#e11d48" stroke-width="1.5"/>
    <path d="M10 5C11 4 13 4 14 5C15 6.5 14.5 8 13.5 9C12.5 10 11.5 10 10.5 9C9.5 8 9 6.5 10 5Z" fill="#be123c"/>
    <path d="M12 13V22" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 17C10 15 7 16 6 18C7.5 18.5 9.5 18 12 17Z" fill="#059669"/>
    <path d="M12 15C14 13.5 17 14 18 16C16.5 16.5 14.5 16 12 15Z" fill="#059669"/>
  </svg>`;

  // Modern Theme & Detail Modal Styles
  ctx.dom.addStyle(`
    .omni-root {
      display: flex; flex-direction: column; height: 100%; box-sizing: border-box;
      padding: 10px; gap: 10px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--lumiverse-bg, #0f1117); color: var(--lumiverse-text, #f1f5f9);
      position: relative; overflow: hidden;
    }

    /* Top Platform Selector */
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
      background: #e11d48; color: #ffffff;
      box-shadow: 0 4px 12px rgba(225, 29, 72, 0.35);
    }

    /* Search Bar */
    .omni-search-box { display: flex; gap: 6px; align-items: center; }
    .omni-search-box input {
      flex: 1; padding: 10px 14px; font-size: 0.82rem; border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.05);
      color: #fff; outline: none;
    }
    .omni-search-box input:focus { border-color: #f43f5e; }
    .omni-action-btn {
      padding: 10px 16px; font-size: 0.82rem; font-weight: 600; border-radius: 10px;
      border: none; background: #e11d48; color: #fff; cursor: pointer;
    }

    /* Sort & Tag Filters */
    .omni-control-row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .omni-sort-chips { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; }
    .omni-chip {
      padding: 4px 10px; font-size: 0.72rem; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.04); color: #94a3b8; cursor: pointer; white-space: nowrap;
    }
    .omni-chip.active { background: rgba(244, 63, 94, 0.2); border-color: #f43f5e; color: #fda4af; font-weight: 600; }
    
    .omni-tag-bar { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
    .omni-tag-pill {
      font-size: 0.68rem; padding: 2px 8px; border-radius: 6px;
      background: rgba(255, 255, 255, 0.03); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.06);
      cursor: pointer; white-space: nowrap;
    }
    .omni-tag-pill.active { background: #e11d48; color: #fff; }

    /* Cards */
    .omni-grid {
      flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 10px; padding-right: 2px;
    }
    .omni-card {
      background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer;
      transition: transform 0.15s ease, border-color 0.15s ease;
    }
    .omni-card:hover { border-color: rgba(244, 63, 94, 0.4); transform: translateY(-2px); }
    .omni-thumb-wrap { position: relative; width: 100%; aspect-ratio: 1/1; background: #181924; }
    .omni-thumb-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .omni-badge {
      position: absolute; top: 6px; left: 6px; padding: 2px 6px; font-size: 0.6rem;
      font-weight: 700; text-transform: uppercase; border-radius: 4px; background: rgba(0,0,0,0.7);
    }
    .omni-card-body { padding: 8px; display: flex; flex-direction: column; flex: 1; justify-content: space-between; gap: 4px; }
    .omni-card-title { font-size: 0.8rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .omni-card-author { font-size: 0.68rem; color: #64748b; }
    .omni-pill-box { display: flex; gap: 3px; flex-wrap: wrap; margin-top: 2px; }
    .omni-tag-badge { font-size: 0.58rem; padding: 1px 4px; border-radius: 4px; background: rgba(244, 63, 94, 0.15); color: #fda4af; }

    /* DETAIL MODAL (Overlay) */
    .omni-detail-panel {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: #0f1117; z-index: 50; display: flex; flex-direction: column;
      transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box; padding: 12px; gap: 10px; overflow-y: auto;
    }
    .omni-detail-panel.open { transform: translateX(0); }
    .omni-detail-header { display: flex; gap: 12px; align-items: center; }
    .omni-detail-avatar { width: 70px; height: 70px; border-radius: 12px; object-fit: cover; background: #222; }
    .omni-back-btn {
      background: rgba(255, 255, 255, 0.08); border: none; color: #fff;
      padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 600;
    }
    .omni-section-title { font-size: 0.75rem; font-weight: 700; color: #f43f5e; text-transform: uppercase; margin-top: 6px; }
    .omni-section-body {
      background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 10px; border-radius: 8px; font-size: 0.78rem; line-height: 1.4; color: #cbd5e1;
      max-height: 160px; overflow-y: auto; white-space: pre-wrap;
    }

    .omni-spinner {
      width: 24px; height: 24px; border: 3px solid rgba(244, 63, 94, 0.2);
      border-top-color: #f43f5e; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 40px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
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
      const timer = setTimeout(() => {
        ctx.offBackendMessage?.(handler);
        reject(new Error("Request timed out. Please try again."));
      }, 15000);

      const handler = (msg) => {
        if (msg?.requestId !== requestId) return;
        clearTimeout(timer);
        ctx.offBackendMessage?.(handler);
        if (msg.type === 'ERROR') reject(new Error(msg.error || 'Operation failed'));
        else resolve(msg);
      };

      ctx.onBackendMessage(handler);
      ctx.sendToBackend({ action, provider: currentSource, payload, requestId });
    });
  }

  // 1. Native Drawer Tab
  const tab = ctx.ui.registerDrawerTab({
    id: 'omni_rose_hub',
    title: 'Character Hub',
    shortName: 'Hub',
    description: 'Browse Chub, JannyAI, and Datacat',
    headerTitle: 'Character Hub',
    iconSvg: roseSvg
  });

  // 2. Chat Input Bar Action
  ctx.ui.registerInputBarAction({
    id: 'omni_open_rose',
    label: 'Character Hub',
    iconSvg: roseSvg,
    onClick: () => {
      tab.activate();
    }
  });

  const container = tab.root;
  container.innerHTML = `
    <div class="omni-root">
      <!-- Detail Inspector Modal -->
      <div class="omni-detail-panel" id="omni-details">
        <button class="omni-back-btn" id="omni-detail-back">&larr; Back to Browse</button>
        <div class="omni-detail-header">
          <img class="omni-detail-avatar" id="omni-det-img" />
          <div style="flex:1; overflow:hidden;">
            <div id="omni-det-name" style="font-weight:700; font-size:1rem; color:#fff;"></div>
            <div id="omni-det-creator" style="font-size:0.75rem; color:#94a3b8;"></div>
            <button class="omni-action-btn" id="omni-det-import" style="width:100%; margin-top:6px; padding:6px 0;">Import Character</button>
          </div>
        </div>

        <div class="omni-section-title">First Message (Greeting)</div>
        <div class="omni-section-body" id="omni-det-greeting"></div>

        <div class="omni-section-title">Description</div>
        <div class="omni-section-body" id="omni-det-desc"></div>

        <div class="omni-section-title">Personality & Traits</div>
        <div class="omni-section-body" id="omni-det-pers"></div>
      </div>

      <!-- Platform Tabs -->
      <div class="omni-platform-tabs">
        <button class="omni-tab-btn active" data-src="chub">Chub.ai</button>
        <button class="omni-tab-btn" data-src="janny">JannyAI</button>
        <button class="omni-tab-btn" data-src="datacat">Datacat</button>
      </div>

      <!-- Search Input -->
      <div class="omni-search-box">
        <input type="text" id="omni-query" placeholder="Search keywords or paste link..." />
        <button class="omni-action-btn" id="omni-go">Search</button>
      </div>

      <!-- Sort & NSFW -->
      <div class="omni-control-row">
        <div class="omni-sort-chips">
          <button class="omni-chip active" data-sort="download_count">🔥 Popular</button>
          <button class="omni-chip" data-sort="last_activity_at">✨ Newest</button>
          <button class="omni-chip" data-sort="star_count">⭐ Trending</button>
        </div>
        <label style="font-size:0.75rem; color:#94a3b8; display:flex; align-items:center; gap:4px;">
          <input type="checkbox" id="omni-nsfw" /> NSFW
        </label>
      </div>

      <!-- Tag Bar -->
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

      <!-- Character Grid -->
      <div class="omni-grid" id="omni-results"></div>

      <!-- Pagination -->
      <div class="omni-control-row" style="justify-content:center; gap:16px;">
        <button class="omni-chip" id="omni-prev">&lt; Prev</button>
        <span id="omni-page" style="font-weight:700; font-size:0.8rem;">1</span>
        <button class="omni-chip" id="omni-next">Next &gt;</button>
      </div>
    </div>
  `;

  const grid = container.querySelector('#omni-results');
  const input = container.querySelector('#omni-query');
  const goBtn = container.querySelector('#omni-go');
  const nsfwBox = container.querySelector('#omni-nsfw');
  const pageTxt = container.querySelector('#omni-page');

  // Inspector Elements
  const detailPanel = container.querySelector('#omni-details');
  const backBtn = container.querySelector('#omni-detail-back');
  const detImg = container.querySelector('#omni-det-img');
  const detName = container.querySelector('#omni-det-name');
  const detCreator = container.querySelector('#omni-det-creator');
  const detGreeting = container.querySelector('#omni-det-greeting');
  const detDesc = container.querySelector('#omni-det-desc');
  const detPers = container.querySelector('#omni-det-pers');
  const detImport = container.querySelector('#omni-det-import');

  let activeDetailId = null;

  backBtn.onclick = () => detailPanel.classList.remove('open');

  async function openCharacterDetails(charId) {
    activeDetailId = charId;
    detailPanel.classList.add('open');
    detName.innerText = 'Loading...';
    detCreator.innerText = '';
    detGreeting.innerText = 'Loading definition...';
    detDesc.innerText = '...';
    detPers.innerText = '...';

    try {
      const res = await callBackend('GET_DETAILS', { id: charId });
      const d = res.details;
      detImg.src = d.avatarUrl;
      detName.innerText = d.name;
      detCreator.innerText = `by ${d.creator} • ${d.source.toUpperCase()}`;
      detGreeting.innerText = d.first_mes || 'No greeting defined.';
      detDesc.innerText = d.description || 'No description.';
      detPers.innerText = d.personality || 'No personality definition visible.';
    } catch (e) {
      detDesc.innerText = `Error loading details: ${e.message}`;
    }
  }

  detImport.onclick = async () => {
    if (!activeDetailId) return;
    detImport.disabled = true;
    detImport.innerText = 'Importing...';
    try {
      const res = await callBackend('IMPORT', { id: activeDetailId });
      detImport.innerText = '✓ In Library';
      alert(`Imported "${res.characterName}" successfully!`);
    } catch (e) {
      alert(`Import failed: ${e.message}`);
      detImport.innerText = 'Retry Import';
      detImport.disabled = false;
    }
  };

  async function loadCatalog() {
    grid.innerHTML = '<div class="omni-spinner"></div>';
    goBtn.disabled = true;

    try {
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
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:30px; color:#64748b;">No characters found.</div>';
        return;
      }

      grid.innerHTML = chars.map(c => `
        <div class="omni-card" data-id="${c.id}">
          <div class="omni-thumb-wrap">
            <img src="${c.avatarUrl}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23181924%22/></svg>'"/>
            <span class="omni-badge">${c.source}</span>
          </div>
          <div class="omni-card-body">
            <div>
              <div class="omni-card-title">${c.name}</div>
              <div class="omni-card-author">by ${c.creator}</div>
              <div class="omni-pill-box">
                ${(c.tags || []).map(t => `<span class="omni-tag-badge">${t}</span>`).join('')}
              </div>
            </div>
            <button class="omni-action-btn" style="width:100%; padding:4px 0; font-size:0.7rem; margin-top:4px;">View & Import</button>
          </div>
        </div>
      `).join('');

      grid.querySelectorAll('.omni-card').forEach(card => {
        card.onclick = () => {
          const id = card.getAttribute('data-id');
          openCharacterDetails(id);
        };
      });
    } catch (err) {
      grid.innerHTML = `<div style="grid-column:1/-1; color:#f43f5e; text-align:center; padding:20px;">${err.message}</div>`;
    } finally {
      goBtn.disabled = false;
    }
  }

  // Event Listeners
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

  loadCatalog();
}
