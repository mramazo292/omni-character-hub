export function setup(ctx) {
  const roseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
    <path d="M12 2C9.5 2 7 3.5 7 6.5C7 9.5 10 11.5 12 13C14 11.5 17 9.5 17 6.5C17 3.5 14.5 2 12 2Z" fill="#f43f5e" stroke="#e11d48" stroke-width="1.5"/>
    <path d="M10 5C11 4 13 4 14 5C15 6.5 14.5 8 13.5 9C12.5 10 11.5 10 10.5 9C9.5 8 9 6.5 10 5Z" fill="#be123c"/>
    <path d="M12 13V22" stroke="#10b981" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 17C10 15 7 16 6 18C7.5 18.5 9.5 18 12 17Z" fill="#059669"/>
    <path d="M12 15C14 13.5 17 14 18 16C16.5 16.5 14.5 16 12 15Z" fill="#059669"/>
  </svg>`;

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
      name: 'Janny / Janitor',
      sorts: [
        { id: 'trending', name: '🔥 Trending Now', asc: false },
        { id: 'popular', name: '👑 All-Time Popular', asc: false },
        { id: 'recent', name: '✨ Newly Added', asc: false },
        { id: 'active', name: '🕒 Recently Active', asc: false }
      ],
      hasTokenFilter: false,
      tags: ['AnyPOV', 'MalePOV', 'FemPOV', 'Enemies to Lovers', 'Dead Dove', 'Slow Burn', 'Angst', 'Fluff', 'Smut', 'Multiple', 'Monster', 'Royalty']
    },
    datacat: {
      name: 'Datacat',
      sorts: [
        { id: 'fresh', name: '🌱 Fresh Archive', asc: false },
        { id: 'recent', name: '🕒 Recently Updated', asc: false },
        { id: 'popular', name: '🔥 Top Kudos', asc: false }
      ],
      hasTokenFilter: false,
      tags: ['Janitor', 'Saucepan', 'OC', 'RPG', 'NSFW', 'Fluff', 'Angst', 'Romance', 'Fantasy']
    }
  };

  ctx.dom.addStyle(`
    .omni-root {
      display: flex; flex-direction: column; height: 100%; box-sizing: border-box;
      padding: 10px; gap: 8px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--lumiverse-bg, #0d0f15); color: var(--lumiverse-text, #f1f5f9);
      position: relative; overflow: hidden;
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
      border-radius: 10px;
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
    .omni-thumb-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1.25; background: #13151f; }
    .omni-thumb-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .omni-badge-top-left {
      position: absolute; top: 6px; left: 6px; padding: 2px 6px; font-size: 0.58rem;
      font-weight: 700; text-transform: uppercase; border-radius: 4px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
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
      aspect-ratio: 1 / 1.4; overflow: hidden; position: relative;
    }
    .omni-skeleton-card::after {
      content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
      animation: omniShimmer 1.2s infinite;
    }
    @keyframes omniShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

    /* REWORKED CHARACTER INSPECTION SHEET */
    .omni-detail-panel {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: #0d0f15; z-index: 50; display: flex; flex-direction: column;
      transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box; overflow: hidden;
    }
    .omni-detail-panel.open { transform: translateX(0); }

    /* Sticky Inspector Header */
    .omni-inspector-header {
      padding: 10px; display: flex; gap: 10px; align-items: center;
      background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
    }
    .omni-inspector-avatar {
      width: 52px; height: 52px; border-radius: 8px; object-fit: cover;
      cursor: pointer; border: 1px solid rgba(244, 63, 94, 0.3); flex-shrink: 0;
    }
    .omni-inspector-title-area { flex: 1; min-width: 0; }
    .omni-inspector-name { font-size: 0.9rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .omni-inspector-sub { font-size: 0.7rem; color: #94a3b8; }

    /* Segmented Inspector Subtabs */
    .omni-inspector-subtabs {
      display: flex; gap: 4px; padding: 6px 10px; background: #12141d;
      border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; overflow-x: auto; scrollbar-width: none;
    }
    .omni-subtab {
      padding: 6px 10px; font-size: 0.72rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.02); color: #94a3b8; cursor: pointer; white-space: nowrap;
    }
    .omni-subtab.active { background: #e11d48; color: #fff; border-color: #e11d48; font-weight: 600; }

    /* Strictly Contained Content Area */
    .omni-inspector-body {
      flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px;
    }
    .omni-text-card {
      background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 10px; border-radius: 8px; font-size: 0.78rem; line-height: 1.45; color: #cbd5e1;
      white-space: pre-wrap; word-break: break-word;
    }
    .omni-greeting-bubble {
      background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px; padding: 10px; margin-bottom: 8px;
    }

    /* FULLSCREEN IMAGE MODAL */
    .omni-image-modal {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.94); z-index: 100; display: none;
      align-items: center; justify-content: center; flex-direction: column; padding: 12px; box-sizing: border-box;
    }
    .omni-image-modal.open { display: flex; }
    .omni-image-modal img {
      max-width: 95%; max-height: 80%; object-fit: contain; border-radius: 8px;
    }
    .omni-image-close-btn {
      position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.2);
      border: none; color: #fff; border-radius: 50%; width: 34px; height: 34px;
      font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }

    /* Pagination */
    .omni-pagination {
      display: flex; justify-content: space-between; align-items: center;
      padding: 6px 4px 0 4px; border-top: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;
    }
    .omni-page-btn {
      padding: 6px 12px; font-size: 0.75rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03); color: #fff; cursor: pointer;
    }
    .omni-page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

    /* Datacat Embedded Browser Container */
    .omni-datacat-frame {
      width: 100%; height: 100%; border: none; border-radius: 8px; flex: 1;
    }
  `);

  let currentSource = 'chub';
  let currentSort = 'download_count';
  let currentAsc = false;
  let currentTokenRange = '';
  let selectedTag = '';
  let currentPage = 1;
  let currentSearch = '';
  let includeNsfw = false;
  let datacatMode = 'grid'; // 'grid' | 'browser'

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

  const container = tab.root;
  container.innerHTML = `
    <div class="omni-root">
      <!-- FULL IMAGE PREVIEW MODAL -->
      <div class="omni-image-modal" id="omni-img-modal">
        <button class="omni-image-close-btn" id="omni-img-modal-close">&times;</button>
        <img id="omni-modal-img" />
        <span style="color:#94a3b8; font-size:0.75rem; margin-top:10px;">Tap anywhere to close</span>
      </div>

      <!-- REWORKED CHARACTER INSPECTION SHEET -->
      <div class="omni-detail-panel" id="omni-details">
        <div class="omni-inspector-header">
          <button class="omni-page-btn" id="omni-detail-back" style="padding:6px 10px;">&larr; Back</button>
          <img class="omni-inspector-avatar" id="omni-det-img" title="Tap to preview image" />
          <div class="omni-inspector-title-area">
            <div class="omni-inspector-name" id="omni-det-name"></div>
            <div class="omni-inspector-sub" id="omni-det-creator"></div>
          </div>
          <button class="omni-action-btn" id="omni-det-import" style="padding:8px 12px;">📥 Import</button>
        </div>

        <div class="omni-inspector-subtabs">
          <button class="omni-subtab active" data-view="greetings">💬 Greetings (<span id="omni-greetings-count">1</span>)</button>
          <button class="omni-subtab" data-view="definition">🎭 AI Definition</button>
          <button class="omni-subtab" data-view="web_summary">📖 Web Summary</button>
          <button class="omni-subtab" data-view="technical">📊 Token Stats</button>
        </div>

        <div class="omni-inspector-body" id="omni-det-content"></div>
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
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
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
        <div class="omni-shelf-row" id="omni-datacat-mode-row" style="display:none;">
          <span class="omni-shelf-label">Datacat Display Mode</span>
          <div style="display:flex; gap:6px;">
            <button class="omni-page-btn" id="omni-dc-grid-btn" style="flex:1;">Card Grid</button>
            <button class="omni-page-btn" id="omni-dc-web-btn" style="flex:1;">Official Web Browser</button>
          </div>
        </div>
        <div class="omni-shelf-row">
          <span class="omni-shelf-label">Custom Tag</span>
          <div style="display:flex; gap:6px;">
            <input type="text" id="omni-custom-tag" placeholder="Type tag..." style="flex:1; padding:6px 10px; border-radius:6px; background:#181a24; border:1px solid rgba(255,255,255,0.1); color:#fff; font-size:0.75rem;" />
            <button class="omni-action-btn" id="omni-apply-tag" style="padding:4px 10px; font-size:0.75rem;">Apply Tag</button>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
          <label style="font-size:0.75rem; color:#94a3b8; display:flex; align-items:center; gap:6px;">
            <input type="checkbox" id="omni-nsfw" /> Allow NSFW / Mature Content
          </label>
          <button id="omni-reset-filters" style="background:none; border:none; color:#f43f5e; font-size:0.72rem; cursor:pointer;">Reset</button>
        </div>
      </div>

      <!-- DYNAMIC TAG QUICK BAR -->
      <div class="omni-tag-bar" id="omni-tag-bar"></div>

      <!-- CHARACTER CARDS GRID -->
      <div class="omni-grid" id="omni-results"></div>

      <!-- DATACAT EMBEDDED IFRAME (Only active in Datacat Web Mode) -->
      <iframe class="omni-datacat-frame" id="omni-datacat-frame" style="display:none;" src="https://datacat.run"></iframe>

      <!-- PAGINATION -->
      <div class="omni-pagination" id="omni-pagination-bar">
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
  const datacatFrame = container.querySelector('#omni-datacat-frame');
  const paginationBar = container.querySelector('#omni-pagination-bar');
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
  const datacatModeRow = container.querySelector('#omni-datacat-mode-row');
  const dcGridBtn = container.querySelector('#omni-dc-grid-btn');
  const dcWebBtn = container.querySelector('#omni-dc-web-btn');
  const customTagInput = container.querySelector('#omni-custom-tag');
  const applyTagBtn = container.querySelector('#omni-apply-tag');
  const resetFiltersBtn = container.querySelector('#omni-reset-filters');
  const tagBar = container.querySelector('#omni-tag-bar');

  // Image Modal Elements
  const imgModal = container.querySelector('#omni-img-modal');
  const modalImg = container.querySelector('#omni-modal-img');
  const imgModalClose = container.querySelector('#omni-img-modal-close');

  // Inspector Elements
  const detailPanel = container.querySelector('#omni-details');
  const backBtn = container.querySelector('#omni-detail-back');
  const detImg = container.querySelector('#omni-det-img');
  const detName = container.querySelector('#omni-det-name');
  const detCreator = container.querySelector('#omni-det-creator');
  const detContent = container.querySelector('#omni-det-content');
  const detImport = container.querySelector('#omni-det-import');
  const greetingsCountTxt = container.querySelector('#omni-greetings-count');

  let activeDetailId = null;
  let activeDetailData = null;
  let activeDetailTab = 'greetings';

  // Image Modal Handlers
  detImg.onclick = () => {
    if (!activeDetailData?.avatarUrl) return;
    modalImg.src = activeDetailData.avatarUrl;
    imgModal.classList.add('open');
  };
  imgModalClose.onclick = () => imgModal.classList.remove('open');
  imgModal.onclick = (e) => { if (e.target !== modalImg) imgModal.classList.remove('open'); };

  backBtn.onclick = () => detailPanel.classList.remove('open');

  filterToggleBtn.onclick = () => {
    filterShelf.classList.toggle('open');
    filterToggleBtn.classList.toggle('active');
  };

  // Update Dynamic Controls When Switching Platforms
  function updatePlatformControls() {
    const cfg = PLATFORMS[currentSource];
    
    // Sort Select
    sortSelect.innerHTML = cfg.sorts.map(s => `
      <option value="${s.id}" data-asc="${s.asc}">${s.name}</option>
    `).join('');
    currentSort = cfg.sorts[0].id;
    currentAsc = cfg.sorts[0].asc;

    // Filters display
    tokenShelfBox.style.display = cfg.hasTokenFilter ? 'flex' : 'none';
    datacatModeRow.style.display = currentSource === 'datacat' ? 'flex' : 'none';

    // Tags
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

    if (tabKey === 'greetings') {
      const altList = d.alternate_greetings || [];
      detContent.innerHTML = `
        <div style="font-size:0.75rem; font-weight:700; color:#10b981; text-transform:uppercase;">Primary First Message (Greeting #1)</div>
        <div class="omni-greeting-bubble">${d.first_mes || 'No primary greeting defined.'}</div>

        ${altList.length > 0 ? `
          <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:8px;">Alternate Greetings (${altList.length})</div>
          ${altList.map((g, idx) => `
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(244,63,94,0.25); border-radius:8px; padding:10px; margin-bottom:6px;">
              <div style="font-size:0.7rem; font-weight:700; color:#fda4af; margin-bottom:4px;">Greeting #${idx + 2}</div>
              <div style="font-size:0.78rem; line-height:1.45; color:#cbd5e1; white-space:pre-wrap;">${g}</div>
            </div>
          `).join('')}
        ` : '<div style="font-size:0.75rem; color:#64748b; margin-top:6px;">This character has no alternate greetings.</div>'}

        ${d.mes_example ? `
          <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:8px;">Example Dialogue</div>
          <div class="omni-text-card">${d.mes_example}</div>
        ` : ''}
      `;
    } else if (tabKey === 'definition') {
      detContent.innerHTML = `
        <div style="font-size:0.75rem; font-weight:700; color:#10b981; text-transform:uppercase;">Character Prompt ({{char}} Definition)</div>
        <div class="omni-text-card" style="border-color:rgba(16,185,129,0.3);">${d.charDescription || 'No prompt definition visible.'}</div>

        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Personality Traits</div>
        <div class="omni-text-card">${d.personality || 'No personality definition visible.'}</div>

        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Scenario & Setting</div>
        <div class="omni-text-card">${d.scenario || 'No specific scenario.'}</div>

        ${d.system_prompt ? `
          <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">System Prompt & Directives</div>
          <div class="omni-text-card">${d.system_prompt}</div>
        ` : ''}
      `;
    } else if (tabKey === 'web_summary') {
      detContent.innerHTML = `
        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase;">Web Page Summary (Catalog Listing)</div>
        <div class="omni-text-card">${d.webSummary || 'No summary provided by creator.'}</div>

        ${d.creator_notes ? `
          <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Author Notes & Lore Commentary</div>
          <div class="omni-text-card">${d.creator_notes}</div>
        ` : ''}

        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Tags & Genres</div>
        <div style="display:flex; gap:4px; flex-wrap:wrap; margin-top:2px;">
          ${(d.tags || []).map(t => `<span class="omni-tag-badge" style="font-size:0.65rem; padding:2px 6px;">${t}</span>`).join('')}
        </div>
      `;
    } else if (tabKey === 'technical') {
      detContent.innerHTML = `
        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase;">Token Distribution</div>
        <div class="omni-text-card">
          • Total Estimated Tokens: <b>${d.totalTokens ? d.totalTokens.toLocaleString() : 'N/A'}</b><br>
          • Definition Prompt Tokens: <b>${d.descTokens ? d.descTokens.toLocaleString() : 'N/A'}</b><br>
          • Primary Greeting Tokens: <b>${d.greetingTokens ? d.greetingTokens.toLocaleString() : 'N/A'}</b>
        </div>

        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Assets & Features</div>
        <div class="omni-text-card">
          • Expression Pack: <b>${d.hasExpressions ? `✓ Present (${d.expressionCount || 'Multiple'} emotion sprites)` : 'Standard Static Avatar'}</b><br>
          • Embedded Lorebook: <b>${d.hasLorebook ? '✓ Attached' : 'None'}</b><br>
          • Alternate Intros: <b>${d.alternate_greetings ? d.alternate_greetings.length : 0} options</b>
        </div>

        <div style="font-size:0.75rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:4px;">Card Metadata</div>
        <div class="omni-text-card">
          Specification: Character Card Spec V2 (CCv2)<br>
          Origin: ${d.source.toUpperCase()}<br>
          Upload Date: ${d.createdAt}
        </div>
      `;
    }
  }

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
    detContent.innerHTML = '<div style="text-align:center; padding:30px; color:#94a3b8;">Decoding character card...</div>';

    try {
      const res = await callBackend('GET_DETAILS', { id: charId });
      activeDetailData = res.details;
      const d = activeDetailData;

      detImg.src = d.avatarUrl;
      detName.innerText = d.name;
      detCreator.innerText = `by ${d.creator} • ${d.source.toUpperCase()}`;
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
    if (currentSource === 'datacat' && datacatMode === 'browser') {
      grid.style.display = 'none';
      paginationBar.style.display = 'none';
      datacatFrame.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    paginationBar.style.display = 'flex';
    datacatFrame.style.display = 'none';

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

  // Datacat Mode Toggles
  dcGridBtn.onclick = () => {
    datacatMode = 'grid';
    loadCatalog();
  };
  dcWebBtn.onclick = () => {
    datacatMode = 'browser';
    loadCatalog();
  };

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
    updatePlatformControls();
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

  updatePlatformControls();
  loadCatalog();
}
