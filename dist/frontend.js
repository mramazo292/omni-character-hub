export function setup(ctx) {
  const roseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
    <path d="M12 2C9.5 2 7 3.5 7 6.5C7 9.5 10 11.5 12 13C14 11.5 17 9.5 17 6.5C17 3.5 14.5 2 12 2Z" fill="#f43f5e" stroke="#e11d48" stroke-width="1.5"/>
    <path d="M10 5C11 4 13 4 14 5C15 6.5 14.5 8 13.5 9C12.5 10 11.5 10 10.5 9C9.5 8 9 6.5 10 5Z" fill="#be123c"/>
    <path d="M12 13V22" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 17C10 15 7 16 6 18C7.5 18.5 9.5 18 12 17Z" fill="#059669"/>
    <path d="M12 15C14 13.5 17 14 18 16C16.5 16.5 14.5 16 12 15Z" fill="#059669"/>
  </svg>`;

  // Platform-Specific Taxonomies and Sort Modes
  const PLATFORMS = {
    chub: {
      name: 'Chub.ai',
      sorts: [
        { id: 'download_count', name: '🔥 Most Downloaded', asc: false },
        { id: 'star_count', name: '⭐ Highest Rated', asc: false },
        { id: 'last_activity_at', name: '✨ Recently Active', asc: false },
        { id: 'created_at', name: '📅 Newly Uploaded', asc: false },
        { id: 'token_count', name: '📊 Tokens: High → Low', asc: false },
        { id: 'token_count', name: '⚡ Tokens: Low → High', asc: true }
      ],
      hasTokenFilter: true,
      tags: ['Anime', 'RPG', 'Female', 'Male', 'Romance', 'Fantasy', 'Dominant', 'Submissive', 'Yandere', 'Monster Girl', 'Sci-Fi', 'Horror', 'Smut', 'Furry']
    },
    janny: {
      name: 'JannyAI / Janitor',
      sorts: [
        { id: 'trending', name: '🔥 Trending Now', asc: false },
        { id: 'popular', name: '👑 All-Time Popular', asc: false },
        { id: 'recent', name: '✨ Newly Added', asc: false },
        { id: 'favorites', name: '💖 Most Favorited', asc: false }
      ],
      hasTokenFilter: false,
      tags: ['AnyPOV', 'MalePOV', 'FemPOV', 'Enemies to Lovers', 'Dead Dove', 'Slow Burn', 'Angst', 'Fluff', 'Smut', 'Multiple', 'Monster', 'Royalty']
    },
    datacat: {
      name: 'Datacat Archive',
      sorts: [
        { id: 'fresh', name: '🌱 Fresh Archive', asc: false },
        { id: 'recent', name: '🕒 Recently Updated', asc: false },
        { id: 'popular', name: '🔥 Top Kudos', asc: false }
      ],
      hasTokenFilter: false,
      tags: ['Janitor', 'Saucepan', 'OC', 'RPG', 'NSFW', 'Fluff', 'Angst', 'Romance', 'Fantasy', 'Horror']
    }
  };

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

    /* Search & Filter Bar */
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

    /* Collapsible Filter Shelf */
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

    /* Tag Quick Bar */
    .omni-tag-bar { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
    .omni-tag-pill {
      font-size: 0.68rem; padding: 3px 9px; border-radius: 6px;
      background: rgba(255, 255, 255, 0.03); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.06);
      cursor: pointer; white-space: nowrap; transition: all 0.15s ease;
    }
    .omni-tag-pill.active { background: #e11d48; color: #fff; border-color: #e11d48; }

    /* Character Cards Grid (1:1.3 Portrait Ratio) */
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
    .omni-thumb-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1.25; background: #13151f; }
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

    /* Skeleton Loading Cards */
    .omni-skeleton-card {
      background: #141722; border: 1px solid rgba(255,255,255,0.04); border-radius: 12px;
      aspect-ratio: 1 / 1.5; overflow: hidden; position: relative;
    }
    .omni-skeleton-card::after {
      content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
      animation: omniShimmer 1.2s infinite;
    }
    @keyframes omniShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

    /* ADVANCED CHARACTER INSPECTOR MODAL */
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
      padding: 5px 10px; font-size: 0.72rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.03); color: #94a3b8; cursor: pointer; white-space: nowrap;
    }
    .omni-subtab.active { background: #e11d48; color: #fff; border-color: #e11d48; font-weight: 600; }

    .omni-detail-header-card {
      display: flex; gap: 12px; padding: 10px; border-radius: 12px;
      background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); align-items: center;
    }
    .omni-detail-avatar-wrap {
      position: relative; width: 75px; height: 75px; border-radius: 10px; overflow: hidden;
      cursor: zoom-in; flex-shrink: 0; border: 1px solid rgba(244, 63, 94, 0.3);
    }
    .omni-detail-avatar-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .omni-avatar-zoom-hint {
      position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7);
      font-size: 0.55rem; text-align: center; color: #fff; padding: 1px 0;
    }

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

    /* FULLSCREEN IMAGE LIGHTBOX */
    .omni-lightbox {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.92); z-index: 100; display: none;
      align-items: center; justify-content: center; flex-direction: column; padding: 12px; box-sizing: border-box;
    }
    .omni-lightbox.open { display: flex; animation: omniFade 0.2s ease; }
    .omni-lightbox img {
      max-width: 100%; max-height: 85%; object-fit: contain; border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.8);
    }
    .omni-lightbox-close {
      position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.15);
      border: none; color: #fff; border-radius: 50%; width: 36px; height: 36px;
      font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }

    /* Pagination */
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

  // 2. PINNED NAVBAR BUTTON (Beside Settings & Cat)
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
      <!-- FULLSCREEN IMAGE LIGHTBOX -->
      <div class="omni-lightbox" id="omni-lightbox">
        <button class="omni-lightbox-close" id="omni-lightbox-close">&times;</button>
        <img id="omni-lightbox-img" />
        <div id="omni-lightbox-title" style="color:#fff; font-size:0.85rem; font-weight:700; margin-top:10px;"></div>
      </div>

      <!-- FULL ADVANCED INSPECTION MODAL -->
      <div class="omni-detail-panel" id="omni-details">
        <div class="omni-detail-nav">
          <button class="omni-page-btn" id="omni-detail-back">&larr; Back to Catalog</button>
          <button class="omni-action-btn" id="omni-det-import" style="padding:6px 12px;">📥 Import Card</button>
        </div>

        <div class="omni-detail-header-card">
          <div class="omni-detail-avatar-wrap" id="omni-avatar-click">
            <img id="omni-det-img" />
            <div class="omni-avatar-zoom-hint">🔍 Tap Zoom</div>
          </div>
          <div style="flex:1; overflow:hidden;">
            <div id="omni-det-name" style="font-weight:700; font-size:0.95rem; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></div>
            <div id="omni-det-creator" style="font-size:0.75rem; color:#94a3b8;"></div>
            <div id="omni-det-badges" style="display:flex; gap:4px; margin-top:4px; flex-wrap:wrap;"></div>
          </div>
        </div>

        <!-- Detail Subtabs -->
        <div class="omni-detail-subtabs">
          <button class="omni-subtab active" data-view="web_summary">📖 Web Summary</button>
          <button class="omni-subtab" data-view="definition">🎭 Character Prompt</button>
          <button class="omni-subtab" data-view="greetings">💬 Greetings (<span id="omni-greetings-count">1</span>)</button>
          <button class="omni-subtab" data-view="technical">⚙️ Specs & Tokens</button>
        </div>

        <div class="omni-inspector-content" id="omni-det-content"></div>
      </div>

      <!-- PLATFORM SELECTOR -->
      <div class="omni-platform-tabs">
        <button class="omni-tab-btn active" data-src="chub">Chub.ai</button>
        <button class="omni-tab-btn" data-src="janny">Janny / Janitor</button>
        <button class="omni-tab-btn" data-src="datacat">Datacat</button>
      </div>

      <!-- SEARCH BAR & FILTER BUTTON -->
      <div class="omni-search-box">
        <input type="text" id="omni-query" placeholder="Search keywords or paste character link..." />
        <button class="omni-filter-toggle-btn" id="omni-filter-toggle">⚙️ Filters</button>
        <button class="omni-action-btn" id="omni-go">Search</button>
      </div>

      <!-- PLATFORM-TAILORED FILTER SHELF -->
      <div class="omni-filter-shelf" id="omni-filter-shelf">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;" id="omni-sort-container">
          <div class="omni-shelf-row">
            <span class="omni-shelf-label">Sort Characters By</span>
            <select class="omni-select" id="omni-sort-select"></select>
          </div>
          <div class="omni-shelf-row" id="omni-token-shelf-box">
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
            <input type="text" id="omni-custom-tag" placeholder="Type custom tag..." style="flex:1; padding:6px 10px; border-radius:6px; background:#181a24; border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:0.75rem;" />
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

      <!-- DYNAMIC TAG QUICK BAR -->
      <div class="omni-tag-bar" id="omni-tag-bar"></div>

      <!-- CHARACTER CARDS GRID -->
      <div class="omni-grid" id="omni-results"></div>

      <!-- INTERACTIVE PAGINATION -->
      <div class="omni-pagination">
        <div style="display:flex; gap:6px;">
          <button class="omni-page-btn" id="omni-first">⏮ 1</button>
          <button class="omni-page-btn" id="omni-prev" disabled>&lt; Prev</button>
        </div>
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
  const firstBtn = container.querySelector('#omni-first');
  const prevBtn = container.querySelector('#omni-prev');
  const nextBtn = container.querySelector('#omni-next');
  const filterToggleBtn = container.querySelector('#omni-filter-toggle');
  const filterShelf = container.querySelector('#omni-filter-shelf');
  const sortSelect = container.querySelector('#omni-sort-select');
  const tokenSelect = container.querySelector('#omni-token-select');
  const tokenShelfBox = container.querySelector('#omni-token-shelf-box');
  const customTagInput = container.querySelector('#omni-custom-tag');
  const applyTagBtn = container.querySelector('#omni-apply-tag');
  const resetFiltersBtn = container.querySelector('#omni-reset-filters');
  const tagBar = container.querySelector('#omni-tag-bar');

  // Lightbox Elements
  const lightbox = container.querySelector('#omni-lightbox');
  const lightboxImg = container.querySelector('#omni-lightbox-img');
  const lightboxTitle = container.querySelector('#omni-lightbox-title');
  const lightboxClose = container.querySelector('#omni-lightbox-close');
  const avatarZoomTrigger = container.querySelector('#omni-avatar-click');

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
  let activeDetailTab = 'web_summary';

  // Lightbox Event Handlers
  avatarZoomTrigger.onclick = () => {
    if (!activeDetailData?.avatarUrl) return;
    lightboxImg.src = activeDetailData.avatarUrl;
    lightboxTitle.innerText = activeDetailData.name;
    lightbox.classList.add('open');
  };
  lightboxClose.onclick = () => lightbox.classList.remove('open');
  lightbox.onclick = (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); };

  backBtn.onclick = () => detailPanel.classList.remove('open');

  filterToggleBtn.onclick = () => {
    filterShelf.classList.toggle('open');
    filterToggleBtn.classList.toggle('active');
  };

  // Update Dynamic Controls When Switching Platforms
  function updatePlatformControls() {
    const cfg = PLATFORMS[currentSource];
    
    // 1. Rebuild Sort Options
    sortSelect.innerHTML = cfg.sorts.map(s => `
      <option value="${s.id}" data-asc="${s.asc}">${s.name}</option>
    `).join('');
    currentSort = cfg.sorts[0].id;
    currentAsc = cfg.sorts[0].asc;

    // 2. Hide/Show Token Range Filter
    tokenShelfBox.style.display = cfg.hasTokenFilter ? 'flex' : 'none';

    // 3. Rebuild Tag Pills
    tagBar.innerHTML = `<span class="omni-tag-pill active" data-tag="">All</span>` +
      cfg.tags.map(t => `<span class="omni-tag-pill" data-tag="${t}">${t}</span>`).join('');

    tagBar.querySelectorAll('.omni-tag-pill').forEach(pill => {
      pill.onclick = (e) => {
        tagBar.querySelectorAll('.omni-tag-pill').forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        selectedTag = e.target.getAttribute('data-tag');
        customTagInput.value = selectedTag;
        currentPage = 1;
        loadCatalog();
      };
    });
  }

  function renderSkeletons() {
    grid.innerHTML = Array(6).fill(0).map(() => `<div class="omni-skeleton-card"></div>`).join('');
  }

  // Render Full Inspector Modal Content
  function renderInspectorTab(tabKey) {
    if (!activeDetailData) return;
    const d = activeDetailData;

    if (tabKey === 'web_summary') {
      detContent.innerHTML = `
        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase;">Web Page Summary (Catalog Listing)</div>
        <div class="omni-text-block">${d.webSummary || 'No summary provided by creator.'}</div>

        ${d.creator_notes ? `
          <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Author Notes & Lore Commentary</div>
          <div class="omni-text-block">${d.creator_notes}</div>
        ` : ''}

        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Tags & Genres</div>
        <div style="display:flex; gap:4px; flex-wrap:wrap; margin-top:2px;">
          ${(d.tags || []).map(t => `<span class="omni-tag-badge" style="font-size:0.65rem; padding:2px 6px;">${t}</span>`).join('')}
        </div>
      `;
    } else if (tabKey === 'definition') {
      detContent.innerHTML = `
        <div style="font-size:0.75rem; font-weight:700; color:#10b981; text-transform:uppercase;">Character Prompt ({{char}} Definition)</div>
        <div class="omni-text-block" style="border-color:rgba(16,185,129,0.3);">${d.charDescription || 'No prompt definition visible.'}</div>

        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Personality Traits</div>
        <div class="omni-text-block">${d.personality || 'No personality definition visible.'}</div>

        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Scenario & Setting</div>
        <div class="omni-text-block">${d.scenario || 'No specific scenario.'}</div>

        ${d.system_prompt ? `
          <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">System Prompt & Directives</div>
          <div class="omni-text-block">${d.system_prompt}</div>
        ` : ''}
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

        ${d.mes_example ? `
          <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:8px;">Example Dialogue</div>
          <div class="omni-text-block">${d.mes_example}</div>
        ` : ''}
      `;
    } else if (tabKey === 'technical') {
      detContent.innerHTML = `
        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase;">Token Distribution</div>
        <div class="omni-text-block">
          • Total Estimated Tokens: <b>${d.totalTokens ? d.totalTokens.toLocaleString() : 'N/A'}</b><br>
          • Definition Prompt Tokens: <b>${d.descTokens ? d.descTokens.toLocaleString() : 'N/A'}</b><br>
          • Primary Greeting Tokens: <b>${d.greetingTokens ? d.greetingTokens.toLocaleString() : 'N/A'}</b>
        </div>

        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Assets & Features</div>
        <div class="omni-text-block">
          • Expression Pack: <b>${d.hasExpressions ? `✓ Present (${d.expressionCount || 'Multiple'} emotion sprites)` : 'Standard Static Avatar'}</b><br>
          • Embedded Lorebook: <b>${d.hasLorebook ? '✓ Attached' : 'None'}</b><br>
          • Alternate Intros: <b>${d.alternate_greetings ? d.alternate_greetings.length : 0} options</b>
        </div>

        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Card Metadata</div>
        <div class="omni-text-block">
          Specification: Character Card Spec V2 (CCv2)<br>
          Origin: ${d.source.toUpperCase()}<br>
          Upload / Catalog Date: ${d.createdAt}
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
    detName.innerText = 'Loading Full Card...';
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
        <span class="omni-tag-badge" style="background:#1e293b; color:#94a3b8;">${d.totalTokens ? d.totalTokens.toLocaleString() + ' tok' : 'Card'}</span>
        ${d.hasExpressions ? '<span class="omni-tag-badge" style="background:rgba(16,185,129,0.2); color:#34d399;">🎭 Sprites</span>' : ''}
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
    firstBtn.disabled = currentPage <= 1;

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
                <span>⬇️ ${c.downloads ? c.downloads.toLocaleString() : '0'}</span>
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
      firstBtn.disabled = currentPage <= 1;
    }
  }

  // --- CONTROLS LISTENERS ---
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
    updatePlatformControls();
    tokenSelect.value = '';
    currentTokenRange = '';
    customTagInput.value = '';
    selectedTag = '';
    currentPage = 1;
    loadCatalog();
  };

  // Platform Switcher
  container.querySelectorAll('.omni-tab-btn').forEach(btn => {
    btn.onclick = (e) => {
      container.querySelectorAll('.omni-tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentSource = e.target.getAttribute('data-src');
      currentPage = 1;
      selectedTag = '';
      customTagInput.value = '';
      updatePlatformControls();
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
  firstBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage = 1;
      loadCatalog();
    }
  };

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

  // Initial Setup
  updatePlatformControls();
  loadCatalog();
}
