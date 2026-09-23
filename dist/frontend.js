export function setup(ctx) {
  const roseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
    <path d="M12 2C9.5 2 7 3.5 7 6.5C7 9.5 10 11.5 12 13C14 11.5 17 9.5 17 6.5C17 3.5 14.5 2 12 2Z" fill="#f43f5e" stroke="#e11d48" stroke-width="1.5"/>
    <path d="M10 5C11 4 13 4 14 5C15 6.5 14.5 8 13.5 9C12.5 10 11.5 10 10.5 9C9.5 8 9 6.5 10 5Z" fill="#be123c"/>
    <path d="M12 13V22" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 17C10 15 7 16 6 18C7.5 18.5 9.5 18 12 17Z" fill="#059669"/>
    <path d="M12 15C14 13.5 17 14 18 16C16.5 16.5 14.5 16 12 15Z" fill="#059669"/>
  </svg>`;

  ctx.dom.addStyle(`
    .omni-root {
      display: flex; flex-direction: column; height: 100%; box-sizing: border-box;
      padding: 10px; gap: 8px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--lumiverse-bg, #0d0f15); color: var(--lumiverse-text, #f1f5f9);
      position: relative; overflow: hidden;
    }

    .omni-topbar-pinned {
      display: inline-flex; align-items: center; justify-content: center;
      background: transparent; border: none; cursor: pointer; padding: 6px 10px;
      color: inherit; transition: opacity 0.2s;
    }
    .omni-topbar-pinned:hover { opacity: 0.8; }

    /* Platform Bar */
    .omni-platform-tabs {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
      background: rgba(255, 255, 255, 0.03); padding: 4px; border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .omni-tab-btn {
      padding: 8px 4px; font-size: 0.8rem; font-weight: 600; border: none;
      background: transparent; color: #94a3b8; border-radius: 8px; cursor: pointer;
      transition: all 0.2s ease; text-align: center;
    }
    .omni-tab-btn.active {
      background: #e11d48; color: #fff;
      box-shadow: 0 4px 12px rgba(225, 29, 72, 0.35);
    }

    /* Search Bar with Filter Toggle */
    .omni-search-box { display: flex; gap: 6px; align-items: center; }
    .omni-search-box input {
      flex: 1; padding: 10px 14px; font-size: 0.82rem; border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.05);
      color: #fff; outline: none; transition: border-color 0.2s;
    }
    .omni-search-box input:focus { border-color: #f43f5e; }
    .omni-action-btn {
      padding: 10px 14px; font-size: 0.82rem; font-weight: 600; border-radius: 10px;
      border: none; background: #e11d48; color: #fff; cursor: pointer;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .omni-filter-toggle-btn {
      padding: 10px; font-size: 0.82rem; font-weight: 600; border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(255, 255, 255, 0.04);
      color: #94a3b8; cursor: pointer;
    }
    .omni-filter-toggle-btn.active { background: rgba(244, 63, 94, 0.15); border-color: #f43f5e; color: #fda4af; }

    /* Collapsible Advanced Filter Shelf */
    .omni-filter-shelf {
      display: none; flex-direction: column; gap: 8px; padding: 10px;
      background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px; animation: omniFade 0.2s ease;
    }
    .omni-filter-shelf.open { display: flex; }
    .omni-shelf-row { display: flex; flex-direction: column; gap: 4px; }
    .omni-shelf-label { font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
    .omni-select {
      background: #181a24; border: 1px solid rgba(255, 255, 255, 0.1); color: #fff;
      padding: 6px 10px; border-radius: 8px; font-size: 0.75rem; outline: none;
    }

    /* Category Quick Shelf */
    .omni-tag-bar { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
    .omni-tag-pill {
      font-size: 0.68rem; padding: 3px 9px; border-radius: 6px;
      background: rgba(255, 255, 255, 0.03); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.06);
      cursor: pointer; white-space: nowrap; transition: all 0.15s ease;
    }
    .omni-tag-pill.active { background: #e11d48; color: #fff; border-color: #e11d48; }

    /* Character Cards Grid */
    .omni-grid {
      flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 10px; padding-right: 2px;
    }
    .omni-card {
      background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer;
      transition: transform 0.15s ease, border-color 0.15s ease;
    }
    .omni-card:hover { border-color: rgba(244, 63, 94, 0.4); transform: translateY(-2px); }
    .omni-thumb-wrap { position: relative; width: 100%; aspect-ratio: 1/1; background: #13151f; }
    .omni-thumb-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .omni-badge-top-left {
      position: absolute; top: 6px; left: 6px; padding: 2px 6px; font-size: 0.58rem;
      font-weight: 700; text-transform: uppercase; border-radius: 4px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    }
    .omni-badge-top-right {
      position: absolute; top: 6px; right: 6px; padding: 2px 6px; font-size: 0.58rem;
      font-weight: 700; border-radius: 4px; background: rgba(16, 185, 129, 0.85); color: #fff;
    }
    .omni-card-body { padding: 8px; display: flex; flex-direction: column; flex: 1; justify-content: space-between; gap: 4px; }
    .omni-card-title { font-size: 0.82rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .omni-card-author { font-size: 0.68rem; color: #64748b; }
    .omni-card-meta { display: flex; justify-content: space-between; font-size: 0.65rem; color: #94a3b8; margin-top: 2px; }
    .omni-pill-box { display: flex; gap: 3px; flex-wrap: wrap; margin-top: 2px; }
    .omni-tag-badge { font-size: 0.58rem; padding: 1px 4px; border-radius: 4px; background: rgba(244, 63, 94, 0.12); color: #fda4af; }

    /* Shimmer Skeleton Cards */
    .omni-skeleton-card {
      background: #141722; border: 1px solid rgba(255,255,255,0.04); border-radius: 12px;
      height: 220px; overflow: hidden; position: relative;
    }
    .omni-skeleton-card::after {
      content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
      animation: omniShimmer 1.2s infinite;
    }
    @keyframes omniShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

    /* FULL CHARACTER INSPECTION MODAL */
    .omni-detail-panel {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: #0d0f15; z-index: 50; display: flex; flex-direction: column;
      transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box; padding: 12px; gap: 8px; overflow: hidden;
    }
    .omni-detail-panel.open { transform: translateX(0); }
    .omni-detail-nav { display: flex; align-items: center; justify-content: space-between; }
    .omni-detail-subtabs { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
    .omni-subtab {
      padding: 4px 10px; font-size: 0.72rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.03); color: #94a3b8; cursor: pointer; white-space: nowrap;
    }
    .omni-subtab.active { background: #e11d48; color: #fff; border-color: #e11d48; font-weight: 600; }
    
    .omni-detail-header-card {
      display: flex; gap: 12px; padding: 10px; border-radius: 12px;
      background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
    }
    .omni-detail-avatar { width: 75px; height: 75px; border-radius: 10px; object-fit: cover; background: #222; }
    .omni-tag-pill-container { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px; }
    
    .omni-inspector-content { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; }
    .omni-text-block {
      background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 10px; border-radius: 8px; font-size: 0.78rem; line-height: 1.45; color: #cbd5e1;
      white-space: pre-wrap; word-break: break-word;
    }
    .omni-alt-greeting-card {
      background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(244, 63, 94, 0.2);
      border-radius: 8px; padding: 10px; margin-bottom: 6px;
    }

    /* Fixed Pagination */
    .omni-pagination {
      display: flex; justify-content: space-between; align-items: center;
      padding: 6px 4px 0 4px; border-top: 1px solid rgba(255,255,255,0.05);
    }
    .omni-page-btn {
      padding: 6px 12px; font-size: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03); color: #fff; cursor: pointer;
    }
    .omni-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    @keyframes omniFade { from { opacity: 0; } to { opacity: 1; } }
  `);

  let currentSource = 'chub';
  let currentSort = 'download_count';
  let currentAsc = false;
  let currentTokenRange = '';
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

  // 1. Drawer Tab
  const tab = ctx.ui.registerDrawerTab({
    id: 'omni_rose_hub',
    title: 'Character Hub',
    shortName: 'Hub',
    description: 'Browse Chub, JannyAI, and Datacat',
    headerTitle: 'Character Hub',
    iconSvg: roseSvg
  });

  // 2. PINNED NAVBAR BUTTON (Directly beside Settings & Cat)
  function pinRoseToNavbar() {
    if (document.getElementById('omni-topbar-rose-btn')) return;

    const rightButtons = Array.from(document.querySelectorAll('button'));
    const targetAnchor = rightButtons.find(b => 
      b.innerHTML.includes('#f59e0b') || 
      b.innerHTML.includes('#eab308') || 
      b.getAttribute('data-action') === 'datacat' || 
      b.getAttribute('title')?.toLowerCase().includes('setting') ||
      b.getAttribute('aria-label')?.toLowerCase().includes('setting') ||
      b.querySelector('svg path[d*="M19.14"]')
    );

    if (targetAnchor && targetAnchor.parentElement) {
      const roseBtn = document.createElement('button');
      roseBtn.id = 'omni-topbar-rose-btn';
      roseBtn.className = targetAnchor.className;
      roseBtn.classList.add('omni-topbar-pinned');
      roseBtn.setAttribute('title', 'Character Hub');
      roseBtn.innerHTML = roseSvg;
      roseBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        tab.activate();
      };
      targetAnchor.parentElement.insertBefore(roseBtn, targetAnchor);
    }
  }

  pinRoseToNavbar();
  setInterval(pinRoseToNavbar, 1000);

  const container = tab.root;
  container.innerHTML = `
    <div class="omni-root">
      <!-- FULL INSPECTION MODAL -->
      <div class="omni-detail-panel" id="omni-details">
        <div class="omni-detail-nav">
          <button class="omni-page-btn" id="omni-detail-back">&larr; Back to Catalog</button>
          <button class="omni-action-btn" id="omni-det-import" style="padding:6px 12px;">📥 Import Card</button>
        </div>

        <div class="omni-detail-header-card">
          <img class="omni-detail-avatar" id="omni-det-img" />
          <div style="flex:1; overflow:hidden;">
            <div id="omni-det-name" style="font-weight:700; font-size:0.95rem; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></div>
            <div id="omni-det-creator" style="font-size:0.75rem; color:#94a3b8;"></div>
            <div id="omni-det-badges" style="display:flex; gap:4px; margin-top:4px; flex-wrap:wrap;"></div>
          </div>
        </div>

        <!-- Detail Subtabs -->
        <div class="omni-detail-subtabs">
          <button class="omni-subtab active" data-view="bio">📋 Bio & Details</button>
          <button class="omni-subtab" data-view="greetings">💬 Greetings (<span id="omni-greetings-count">1</span>)</button>
          <button class="omni-subtab" data-view="personality">🧠 Personality & System</button>
          <button class="omni-subtab" data-view="assets">🎭 Sprites & Extras</button>
        </div>

        <div class="omni-inspector-content" id="omni-det-content"></div>
      </div>

      <!-- PLATFORM SELECTOR -->
      <div class="omni-platform-tabs">
        <button class="omni-tab-btn active" data-src="chub">Chub.ai</button>
        <button class="omni-tab-btn" data-src="janny">JannyAI</button>
        <button class="omni-tab-btn" data-src="datacat">Datacat</button>
      </div>

      <!-- SEARCH BAR & FILTER BUTTON -->
      <div class="omni-search-box">
        <input type="text" id="omni-query" placeholder="Search keywords, paste character link..." />
        <button class="omni-filter-toggle-btn" id="omni-filter-toggle">⚙️ Filters</button>
        <button class="omni-action-btn" id="omni-go">Search</button>
      </div>

      <!-- ADVANCED FILTER SHELF -->
      <div class="omni-filter-shelf" id="omni-filter-shelf">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
          <div class="omni-shelf-row">
            <span class="omni-shelf-label">Sort Characters By</span>
            <select class="omni-select" id="omni-sort-select">
              <option value="download_count" data-asc="false">🔥 Most Downloaded</option>
              <option value="last_activity_at" data-asc="false">✨ Newest Uploads</option>
              <option value="star_count" data-asc="false">⭐ Highest Rated</option>
              <option value="token_count" data-asc="false">📊 Tokens: High to Low</option>
              <option value="token_count" data-asc="true">⚡ Tokens: Low to High</option>
            </select>
          </div>
          <div class="omni-shelf-row">
            <span class="omni-shelf-label">Token Range</span>
            <select class="omni-select" id="omni-token-select">
              <option value="">Any Length</option>
              <option value="short">Short (&lt;1,000 tokens)</option>
              <option value="medium">Medium (1,000 - 3,000)</option>
              <option value="long">Long (&gt;3,000 tokens)</option>
            </select>
          </div>
        </div>
        <div class="omni-shelf-row">
          <span class="omni-shelf-label">Custom Tag Filter</span>
          <div style="display:flex; gap:6px;">
            <input type="text" id="omni-custom-tag" placeholder="e.g. yandere, goth, elf, vampire" style="flex:1; padding:6px 10px; border-radius:6px; background:#181a24; border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:0.75rem;" />
            <button class="omni-action-btn" id="omni-apply-tag" style="padding:4px 10px; font-size:0.75rem;">Apply Tag</button>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
          <label style="font-size:0.75rem; color:#94a3b8; display:flex; align-items:center; gap:6px;">
            <input type="checkbox" id="omni-nsfw" /> Allow NSFW / Mature Content
          </label>
          <button id="omni-reset-filters" style="background:none; border:none; color:#f43f5e; font-size:0.72rem; cursor:pointer;">Reset Filters</button>
        </div>
      </div>

      <!-- CURATED CATEGORY CHIPS -->
      <div class="omni-tag-bar">
        <span class="omni-tag-pill active" data-tag="">All</span>
        <span class="omni-tag-pill" data-tag="Anime">Anime</span>
        <span class="omni-tag-pill" data-tag="Female">Female</span>
        <span class="omni-tag-pill" data-tag="Male">Male</span>
        <span class="omni-tag-pill" data-tag="RPG">RPG</span>
        <span class="omni-tag-pill" data-tag="Romance">Romance</span>
        <span class="omni-tag-pill" data-tag="Dominant">Dominant</span>
        <span class="omni-tag-pill" data-tag="Submissive">Submissive</span>
        <span class="omni-tag-pill" data-tag="Fantasy">Fantasy</span>
        <span class="omni-tag-pill" data-tag="Yandere">Yandere</span>
        <span class="omni-tag-pill" data-tag="Tsundere">Tsundere</span>
        <span class="omni-tag-pill" data-tag="Monster Girl">Monster Girl</span>
        <span class="omni-tag-pill" data-tag="Horror">Horror</span>
        <span class="omni-tag-pill" data-tag="Smut">Smut</span>
      </div>

      <!-- CARDS GRID -->
      <div class="omni-grid" id="omni-results"></div>

      <!-- PAGINATION BAR -->
      <div class="omni-pagination">
        <button class="omni-page-btn" id="omni-prev" disabled>&lt; Prev</button>
        <span id="omni-page-display" style="font-weight:700; font-size:0.75rem; color:#94a3b8;">Page 1</span>
        <button class="omni-page-btn" id="omni-next">Next &gt;</button>
      </div>
    </div>
  `;

  // UI Element Bindings
  const grid = container.querySelector('#omni-results');
  const input = container.querySelector('#omni-query');
  const goBtn = container.querySelector('#omni-go');
  const nsfwBox = container.querySelector('#omni-nsfw');
  const pageDisplay = container.querySelector('#omni-page-display');
  const prevBtn = container.querySelector('#omni-prev');
  const nextBtn = container.querySelector('#omni-next');
  const filterToggleBtn = container.querySelector('#omni-filter-toggle');
  const filterShelf = container.querySelector('#omni-filter-shelf');
  const sortSelect = container.querySelector('#omni-sort-select');
  const tokenSelect = container.querySelector('#omni-token-select');
  const customTagInput = container.querySelector('#omni-custom-tag');
  const applyTagBtn = container.querySelector('#omni-apply-tag');
  const resetFiltersBtn = container.querySelector('#omni-reset-filters');

  // Inspector Elements
  const detailPanel = container.querySelector('#omni-details');
  const backBtn = container.querySelector('#omni-detail-back');
  const detImg = container.querySelector('#omni-det-img');
  const detName = container.querySelector('#omni-det-name');
  const detCreator = container.querySelector('#omni-det-creator');
  const detBadges = container.querySelector('#omni-det-badges');
  const detContent = container.querySelector('#omni-det-content');
  const detImport = container.querySelector('#omni-det-import');
  const greetingsCountTxt = container.querySelector('#omni-greetings-count');

  let activeDetailId = null;
  let activeDetailData = null;
  let activeDetailTab = 'bio';

  backBtn.onclick = () => detailPanel.classList.remove('open');

  filterToggleBtn.onclick = () => {
    filterShelf.classList.toggle('open');
    filterToggleBtn.classList.toggle('active');
  };

  // Render Skeleton Shimmers
  function renderSkeletons() {
    grid.innerHTML = Array(6).fill(0).map(() => `<div class="omni-skeleton-card"></div>`).join('');
  }

  // Render Full Inspector Modal Content
  function renderInspectorTab(tabKey) {
    if (!activeDetailData) return;
    const d = activeDetailData;

    if (tabKey === 'bio') {
      detContent.innerHTML = `
        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase;">Character Description</div>
        <div class="omni-text-block">${d.description || 'No description provided.'}</div>
        
        ${d.creator_notes ? `
          <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Author Notes</div>
          <div class="omni-text-block">${d.creator_notes}</div>
        ` : ''}

        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Scenario & Setting</div>
        <div class="omni-text-block">${d.scenario || 'No specific scenario.'}</div>

        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Tags</div>
        <div class="omni-tag-pill-container">
          ${(d.tags || []).map(t => `<span class="omni-tag-badge" style="font-size:0.65rem; padding:2px 6px;">${t}</span>`).join('')}
        </div>
      `;
    } else if (tabKey === 'greetings') {
      const altList = d.alternate_greetings || [];
      detContent.innerHTML = `
        <div style="font-size:0.75rem; font-weight:700; color:#10b981; text-transform:uppercase;">Primary First Message (Greeting #1)</div>
        <div class="omni-text-block" style="border-color:rgba(16,185,129,0.3);">${d.first_mes || 'No primary greeting defined.'}</div>

        ${altList.length > 0 ? `
          <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:8px;">Alternate Greetings (${altList.length})</div>
          ${altList.map((g, idx) => `
            <div class="omni-alt-greeting-card">
              <div style="font-size:0.7rem; font-weight:700; color:#fda4af; margin-bottom:4px;">Greeting #${idx + 2}</div>
              <div style="font-size:0.78rem; line-height:1.4; color:#cbd5e1; white-space:pre-wrap;">${g}</div>
            </div>
          `).join('')}
        ` : '<div style="font-size:0.75rem; color:#64748b; margin-top:10px;">This character has no alternate greetings.</div>'}
      `;
    } else if (tabKey === 'personality') {
      detContent.innerHTML = `
        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase;">Personality Breakdown</div>
        <div class="omni-text-block">${d.personality || 'No personality definition visible.'}</div>

        ${d.system_prompt ? `
          <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">System Prompt / Directives</div>
          <div class="omni-text-block">${d.system_prompt}</div>
        ` : ''}

        ${d.mes_example ? `
          <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Dialogue Examples</div>
          <div class="omni-text-block">${d.mes_example}</div>
        ` : ''}
      `;
    } else if (tabKey === 'assets') {
      detContent.innerHTML = `
        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase;">Expression / Sprite Pack</div>
        <div class="omni-text-block">
          ${d.hasExpressions ? `
            <span style="color:#10b981; font-weight:700;">✓ Expressions Pack Available</span><br>
            This character contains multiple emotion sprites (e.g. Joy, Anger, Sadness, Blush) that change dynamically during chat.
          ` : `
            <span style="color:#94a3b8;">Standard Static Avatar</span><br>
            This character uses a single main profile avatar.
          `}
        </div>

        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Embedded Lorebook</div>
        <div class="omni-text-block">
          ${d.hasLorebook ? '<span style="color:#10b981; font-weight:700;">✓ Lorebook / World Info Included</span>' : '<span style="color:#94a3b8;">No Embedded Lorebook</span>'}
        </div>

        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Technical Specifications</div>
        <div class="omni-text-block">
          Format: Character Card Spec V2 (CCv2)<br>
          Token Count: ${d.tokens ? d.tokens.toLocaleString() + ' tokens' : 'Unknown'}<br>
          Platform Origin: ${d.source.toUpperCase()}
        </div>
      `;
    }
  }

  // Subtab switching in Inspector
  container.querySelectorAll('.omni-subtab').forEach(btn => {
    btn.onclick = (e) => {
      container.querySelectorAll('.omni-subtab').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeDetailTab = e.target.getAttribute('data-view');
      renderInspectorTab(activeDetailTab);
    };
  });

  async function openCharacterDetails(charId) {
    activeDetailId = charId;
    detailPanel.classList.add('open');
    detName.innerText = 'Loading Full Definition...';
    detCreator.innerText = '';
    detBadges.innerHTML = '';
    detContent.innerHTML = '<div style="text-align:center; padding:30px; color:#94a3b8;">Decoding character card...</div>';

    try {
      const res = await callBackend('GET_DETAILS', { id: charId });
      activeDetailData = res.details;
      const d = activeDetailData;

      detImg.src = d.avatarUrl;
      detName.innerText = d.name;
      detCreator.innerText = `by ${d.creator} • ${d.source.toUpperCase()}`;

      detBadges.innerHTML = `
        <span class="omni-tag-badge" style="background:#1e293b; color:#94a3b8;">${d.tokens ? d.tokens.toLocaleString() + ' tokens' : 'Standard'}</span>
        ${d.hasExpressions ? '<span class="omni-tag-badge" style="background:rgba(16,185,129,0.2); color:#34d399;">🎭 Expression Pack</span>' : ''}
        ${d.hasLorebook ? '<span class="omni-tag-badge" style="background:rgba(99,102,241,0.2); color:#a5b4fc;">📖 Lorebook</span>' : ''}
      `;

      greetingsCountTxt.innerText = String(1 + (d.alternate_greetings ? d.alternate_greetings.length : 0));
      renderInspectorTab(activeDetailTab);
    } catch (e) {
      detContent.innerHTML = `<div style="color:#f87171; padding:20px; text-align:center;">Failed to load definition: ${e.message}</div>`;
    }
  }

  detImport.onclick = async () => {
    if (!activeDetailId) return;
    detImport.disabled = true;
    detImport.innerText = 'Importing...';
    try {
      const res = await callBackend('IMPORT', { id: activeDetailId });
      detImport.innerText = '✓ In Library';
      alert(`Successfully imported "${res.characterName}" to your characters!`);
    } catch (e) {
      alert(`Import failed: ${e.message}`);
      detImport.innerText = 'Retry Import';
      detImport.disabled = false;
    }
  };

  async function loadCatalog() {
    renderSkeletons();
    goBtn.disabled = true;
    prevBtn.disabled = currentPage <= 1;

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
        asc: currentAsc,
        tag: selectedTag,
        tokenRange: currentTokenRange,
        page: currentPage,
        nsfw: includeNsfw
      });

      const chars = res.results.characters || [];
      pageDisplay.innerText = `Page ${currentPage}`;

      if (!chars.length) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#64748b;">No characters found matching your filters.</div>';
        return;
      }

      grid.innerHTML = chars.map(c => `
        <div class="omni-card" data-id="${c.id}">
          <div class="omni-thumb-wrap">
            <img src="${c.avatarUrl}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%2313151f%22/></svg>'"/>
            <span class="omni-badge-top-left">${c.source}</span>
            ${c.hasExpressions ? '<span class="omni-badge-top-right">🎭 Pack</span>' : ''}
          </div>
          <div class="omni-card-body">
            <div>
              <div class="omni-card-title">${c.name}</div>
              <div class="omni-card-author">by ${c.creator}</div>
              <div class="omni-card-meta">
                <span>⬇️ ${c.downloads.toLocaleString()}</span>
                <span>${c.tokens ? c.tokens.toLocaleString() + ' tok' : ''}</span>
              </div>
              <div class="omni-pill-box">
                ${(c.tags || []).slice(0, 3).map(t => `<span class="omni-tag-badge">${t}</span>`).join('')}
              </div>
            </div>
            <button class="omni-action-btn" style="width:100%; padding:5px 0; font-size:0.72rem; margin-top:4px; justify-content:center;">View Details</button>
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
      prevBtn.disabled = currentPage <= 1;
    }
  }

  // --- FILTERS & CONTROLS LISTENERS ---
  sortSelect.onchange = (e) => {
    currentSort = e.target.value;
    const opt = e.target.selectedOptions[0];
    currentAsc = opt?.getAttribute('data-asc') === 'true';
    currentPage = 1;
    loadCatalog();
  };

  tokenSelect.onchange = (e) => {
    currentTokenRange = e.target.value;
    currentPage = 1;
    loadCatalog();
  };

  applyTagBtn.onclick = () => {
    selectedTag = customTagInput.value.trim();
    currentPage = 1;
    loadCatalog();
  };

  resetFiltersBtn.onclick = () => {
    sortSelect.value = 'download_count';
    currentSort = 'download_count';
    currentAsc = false;
    tokenSelect.value = '';
    currentTokenRange = '';
    customTagInput.value = '';
    selectedTag = '';
    currentPage = 1;
    loadCatalog();
  };

  // Platform Tabs
  container.querySelectorAll('.omni-tab-btn').forEach(btn => {
    btn.onclick = (e) => {
      container.querySelectorAll('.omni-tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentSource = e.target.getAttribute('data-src');
      currentPage = 1;
      loadCatalog();
    };
  });

  // Curated Tag Pills
  container.querySelectorAll('.omni-tag-pill').forEach(pill => {
    pill.onclick = (e) => {
      container.querySelectorAll('.omni-tag-pill').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      selectedTag = e.target.getAttribute('data-tag');
      customTagInput.value = selectedTag;
      currentPage = 1;
      loadCatalog();
    };
  });

  goBtn.onclick = () => {
    currentSearch = input.value.trim();
    currentPage = 1;
    loadCatalog();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') goBtn.click();
  });

  nsfwBox.onchange = (e) => {
    includeNsfw = e.target.checked;
    loadCatalog();
  };

  // Pagination Controls
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      loadCatalog();
    }
  };

  nextBtn.onclick = () => {
    currentPage++;
    loadCatalog();
  };

  loadCatalog();
}
