export function setup(ctx) {
  // Purge any leftover pinned buttons from previous sessions
  document.getElementById('omni-topbar-rose-btn')?.remove();
  document.querySelectorAll('.omni-topbar-pinned').forEach(el => el.remove());

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
        { id: 'download_count', name: '🔥 Most Popular', asc: false },
        { id: 'star_count', name: '⭐ Top Rated', asc: false },
        { id: 'last_activity_at', name: '✨ Recently Active', asc: false },
        { id: 'created_at', name: '📅 Newly Added', asc: false },
        { id: 'token_count', name: '📊 Tokens: High → Low', asc: false },
        { id: 'token_count', name: '⚡ Tokens: Low → High', asc: true }
      ],
      hasTokenFilter: true,
      tags: ['Anime', 'RPG', 'Female', 'Male', 'Romance', 'Fantasy', 'Dominant', 'Submissive', 'Yandere', 'Monster Girl', 'Sci-Fi', 'Horror', 'Smut']
    },
    janny: {
      name: 'JannyAI / Janitor',
      sorts: [
        { id: 'download_count', name: '👑 All-Time Popular', asc: false },
        { id: 'star_count', name: '🔥 Trending Now', asc: false },
        { id: 'last_activity_at', name: '🕒 Recently Active', asc: false },
        { id: 'created_at', name: '✨ Newly Added', asc: false }
      ],
      hasTokenFilter: false,
      tags: ['AnyPOV', 'MalePOV', 'FemPOV', 'Enemies to Lovers', 'Dead Dove', 'Slow Burn', 'Angst', 'Fluff', 'Smut', 'Monster', 'Royalty']
    },
    datacat: {
      name: 'Datacat',
      sorts: [
        { id: 'fresh', name: '🌱 Fresh Archive', asc: false },
        { id: 'download_count', name: '🔥 Most Downloaded', asc: false }
      ],
      hasTokenFilter: false,
      tags: ['Janitor', 'Saucepan', 'OC', 'RPG', 'NSFW', 'Fluff', 'Angst', 'Romance', 'Fantasy']
    }
  };

  // Modern, Polished Dark Theme (Forces clean sans-serif system fonts)
  ctx.dom.addStyle(`
    .omni-root {
      display: flex; flex-direction: column; height: 100%; box-sizing: border-box;
      padding: 10px; gap: 8px; font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif !important;
      background: #090a0f; color: #f1f5f9; position: relative; overflow: hidden;
    }

    /* Platform Segmented Tabs */
    .omni-nav-tabs {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;
      background: #131620; padding: 4px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .omni-tab-btn {
      padding: 7px 4px; font-size: 0.78rem; font-weight: 600; border: none;
      background: transparent; color: #94a3b8; border-radius: 8px; cursor: pointer;
      transition: all 0.2s ease; text-align: center;
    }
    .omni-tab-btn.active {
      background: #e11d48; color: #ffffff; box-shadow: 0 2px 10px rgba(225, 29, 72, 0.35);
    }

    /* Search Bar with Filter Toggle */
    .omni-search-bar { display: flex; gap: 6px; align-items: center; }
    .omni-input-wrap {
      flex: 1; display: flex; align-items: center; background: #131620;
      border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 0 10px;
    }
    .omni-input-wrap input {
      width: 100%; padding: 8px 0; font-size: 0.8rem; border: none;
      background: transparent; color: #fff; outline: none;
    }
    .omni-btn {
      padding: 8px 12px; font-size: 0.78rem; font-weight: 600; border-radius: 8px;
      border: none; background: #e11d48; color: #fff; cursor: pointer; transition: opacity 0.2s;
    }
    .omni-btn:hover { opacity: 0.9; }
    .omni-filter-btn {
      padding: 8px 10px; font-size: 0.78rem; border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08); background: #131620; color: #94a3b8; cursor: pointer;
    }
    .omni-filter-btn.active { border-color: #e11d48; color: #fda4af; background: rgba(225, 29, 72, 0.1); }

    /* Compact Filter Shelf */
    .omni-filters {
      display: none; flex-direction: column; gap: 6px; padding: 8px 10px;
      background: #131620; border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px;
    }
    .omni-filters.open { display: flex; }
    .omni-filter-row { display: flex; gap: 6px; align-items: center; }
    .omni-select {
      flex: 1; background: #1a1e2b; border: 1px solid rgba(255, 255, 255, 0.08);
      color: #fff; padding: 6px 8px; border-radius: 6px; font-size: 0.75rem; outline: none;
    }

    /* Tag Bar */
    .omni-tag-bar { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
    .omni-tag-chip {
      font-size: 0.68rem; padding: 3px 8px; border-radius: 6px;
      background: #131620; color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.06);
      cursor: pointer; white-space: nowrap; transition: all 0.15s ease;
    }
    .omni-tag-chip.active { background: #e11d48; color: #fff; border-color: #e11d48; }

    /* 2-Column Responsive Card Grid (1:1.3 ratio) */
    .omni-grid {
      flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 8px; padding-right: 2px;
    }
    .omni-card {
      background: #131620; border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer;
      transition: transform 0.15s ease, border-color 0.15s ease;
    }
    .omni-card:hover { border-color: rgba(225, 29, 72, 0.5); transform: translateY(-2px); }
    .omni-thumb-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1.25; background: #0c0e14; }
    .omni-thumb-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .omni-card-source {
      position: absolute; top: 6px; left: 6px; padding: 2px 6px; font-size: 0.58rem;
      font-weight: 700; text-transform: uppercase; border-radius: 4px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    }
    .omni-card-body { padding: 6px 8px; display: flex; flex-direction: column; flex: 1; justify-content: space-between; gap: 4px; }
    .omni-card-title { font-size: 0.8rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .omni-card-author { font-size: 0.68rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .omni-card-footer { display: flex; justify-content: space-between; font-size: 0.65rem; color: #94a3b8; align-items: center; margin-top: 2px; }

    /* Shimmer Skeleton */
    .omni-skeleton {
      background: #131620; border-radius: 10px; aspect-ratio: 1 / 1.4; overflow: hidden; position: relative;
    }
    .omni-skeleton::after {
      content: ""; position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
      animation: omniShimmer 1.2s infinite;
    }
    @keyframes omniShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

    /* Bounded Character Inspector Sheet */
    .omni-inspector {
      position: absolute; inset: 0; background: #090a0f; z-index: 50; display: flex;
      flex-direction: column; transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box; overflow: hidden;
    }
    .omni-inspector.open { transform: translateX(0); }
    .omni-inspector-top {
      padding: 8px 10px; display: flex; gap: 8px; align-items: center;
      background: #131620; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
    }
    .omni-inspector-thumb {
      width: 44px; height: 44px; border-radius: 6px; object-fit: cover;
      cursor: pointer; border: 1px solid rgba(225, 29, 72, 0.4); flex-shrink: 0;
    }
    .omni-inspector-subtabs {
      display: flex; gap: 4px; padding: 6px 10px; background: #0c0e14;
      border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; overflow-x: auto; scrollbar-width: none;
    }
    .omni-subtab {
      padding: 5px 9px; font-size: 0.72rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);
      background: #131620; color: #94a3b8; cursor: pointer; white-space: nowrap;
    }
    .omni-subtab.active { background: #e11d48; color: #fff; border-color: #e11d48; font-weight: 600; }
    .omni-inspector-body {
      flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px;
    }
    .omni-block {
      background: #131620; border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 10px; border-radius: 8px; font-size: 0.78rem; line-height: 1.45; color: #cbd5e1;
      white-space: pre-wrap; word-break: break-word;
    }

    /* Image Preview Modal */
    .omni-img-preview {
      position: absolute; inset: 0; background: rgba(0, 0, 0, 0.95); z-index: 100; display: none;
      align-items: center; justify-content: center; flex-direction: column; padding: 12px; box-sizing: border-box;
    }
    .omni-img-preview.open { display: flex; }
    .omni-img-preview img { max-width: 95%; max-height: 80%; object-fit: contain; border-radius: 8px; }

    /* Pagination */
    .omni-pager {
      display: flex; justify-content: space-between; align-items: center;
      padding: 6px 2px 0 2px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
    }
    .omni-pager-btn {
      padding: 5px 10px; font-size: 0.72rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);
      background: #131620; color: #fff; cursor: pointer;
    }
    .omni-pager-btn:disabled { opacity: 0.3; cursor: not-allowed; }
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

  // Register Native Drawer Tab
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
      <!-- IMAGE PREVIEW MODAL -->
      <div class="omni-img-preview" id="omni-preview-modal">
        <button class="omni-btn" id="omni-preview-close" style="position:absolute; top:12px; right:12px; padding:6px 12px;">&times; Close</button>
        <img id="omni-preview-img" />
        <span style="color:#64748b; font-size:0.75rem; margin-top:8px;">Tap anywhere to close</span>
      </div>

      <!-- CHARACTER DETAIL INSPECTOR -->
      <div class="omni-inspector" id="omni-inspector">
        <div class="omni-inspector-top">
          <button class="omni-pager-btn" id="omni-detail-back">&larr; Back</button>
          <img class="omni-inspector-thumb" id="omni-detail-thumb" title="Tap to preview image" />
          <div style="flex:1; min-width:0;">
            <div id="omni-detail-name" style="font-size:0.85rem; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></div>
            <div id="omni-detail-author" style="font-size:0.7rem; color:#94a3b8;"></div>
          </div>
          <button class="omni-btn" id="omni-detail-import" style="padding:6px 10px;">📥 Import</button>
        </div>

        <div class="omni-inspector-subtabs">
          <button class="omni-subtab active" data-tab="greetings">💬 Greetings (<span id="omni-greet-count">1</span>)</button>
          <button class="omni-subtab" data-tab="definition">🎭 Prompt Definition</button>
          <button class="omni-subtab" data-tab="summary">📖 Summary & Notes</button>
          <button class="omni-subtab" data-tab="stats">📊 Token Stats</button>
        </div>

        <div class="omni-inspector-body" id="omni-detail-body"></div>
      </div>

      <!-- PLATFORM SEGMENTED NAV -->
      <div class="omni-nav-tabs">
        <button class="omni-tab-btn active" data-src="chub">Chub.ai</button>
        <button class="omni-tab-btn" data-src="janny">Janny / Janitor</button>
        <button class="omni-tab-btn" data-src="datacat">Datacat</button>
      </div>

      <!-- SEARCH & FILTER TOGGLE -->
      <div class="omni-search-bar">
        <div class="omni-input-wrap">
          <input type="text" id="omni-query" placeholder="Search characters or paste link..." />
        </div>
        <button class="omni-filter-btn" id="omni-toggle-filters">⚙️</button>
        <button class="omni-btn" id="omni-go">Search</button>
      </div>

      <!-- COMPACT FILTER SHELF -->
      <div class="omni-filters" id="omni-filter-shelf">
        <div class="omni-filter-row">
          <select class="omni-select" id="omni-sort-select"></select>
          <select class="omni-select" id="omni-token-select" style="max-width:110px;">
            <option value="">Any Length</option>
            <option value="short">&lt;1k tokens</option>
            <option value="medium">1k-3k tokens</option>
            <option value="long">&gt;3k tokens</option>
          </select>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <label style="font-size:0.72rem; color:#94a3b8; display:flex; align-items:center; gap:4px; cursor:pointer;">
            <input type="checkbox" id="omni-nsfw" /> NSFW Content
          </label>
          <button id="omni-reset" style="background:none; border:none; color:#f43f5e; font-size:0.72rem; cursor:pointer;">Reset</button>
        </div>
      </div>

      <!-- DYNAMIC TAG QUICK BAR -->
      <div class="omni-tag-bar" id="omni-tag-bar"></div>

      <!-- 2-COLUMN CARDS GRID -->
      <div class="omni-grid" id="omni-grid"></div>

      <!-- PAGINATION -->
      <div class="omni-pager">
        <button class="omni-pager-btn" id="omni-prev" disabled>&lt; Prev</button>
        <span id="omni-page-display" style="font-size:0.75rem; font-weight:700; color:#94a3b8;">Page 1</span>
        <button class="omni-pager-btn" id="omni-next">Next &gt;</button>
      </div>
    </div>
  `;

  // UI Element Bindings
  const grid = container.querySelector('#omni-grid');
  const input = container.querySelector('#omni-query');
  const goBtn = container.querySelector('#omni-go');
  const nsfwBox = container.querySelector('#omni-nsfw');
  const pageDisplay = container.querySelector('#omni-page-display');
  const prevBtn = container.querySelector('#omni-prev');
  const nextBtn = container.querySelector('#omni-next');
  const toggleFiltersBtn = container.querySelector('#omni-toggle-filters');
  const filterShelf = container.querySelector('#omni-filter-shelf');
  const sortSelect = container.querySelector('#omni-sort-select');
  const tokenSelect = container.querySelector('#omni-token-select');
  const resetBtn = container.querySelector('#omni-reset');
  const tagBar = container.querySelector('#omni-tag-bar');

  // Preview Modal Elements
  const previewModal = container.querySelector('#omni-preview-modal');
  const previewImg = container.querySelector('#omni-preview-img');
  const previewClose = container.querySelector('#omni-preview-close');

  // Inspector Elements
  const inspector = container.querySelector('#omni-inspector');
  const detailBack = container.querySelector('#omni-detail-back');
  const detailThumb = container.querySelector('#omni-detail-thumb');
  const detailName = container.querySelector('#omni-detail-name');
  const detailAuthor = container.querySelector('#omni-detail-author');
  const detailImport = container.querySelector('#omni-detail-import');
  const detailBody = container.querySelector('#omni-detail-body');
  const greetCountTxt = container.querySelector('#omni-greet-count');

  let activeCharId = null;
  let activeCharData = null;
  let activeTab = 'greetings';

  // Preview Handlers
  detailThumb.onclick = () => {
    if (!activeCharData?.avatarUrl) return;
    previewImg.src = activeCharData.avatarUrl;
    previewModal.classList.add('open');
  };
  previewClose.onclick = () => previewModal.classList.remove('open');
  previewModal.onclick = (e) => { if (e.target !== previewImg) previewModal.classList.remove('open'); };

  detailBack.onclick = () => inspector.classList.remove('open');

  toggleFiltersBtn.onclick = () => {
    filterShelf.classList.toggle('open');
    toggleFiltersBtn.classList.toggle('active');
  };

  function updatePlatformControls() {
    const cfg = PLATFORMS[currentSource];
    sortSelect.innerHTML = cfg.sorts.map(s => `<option value="${s.id}" data-asc="${s.asc}">${s.name}</option>`).join('');
    currentSort = cfg.sorts[0].id;
    currentAsc = cfg.sorts[0].asc;

    tokenSelect.style.display = cfg.hasTokenFilter ? 'block' : 'none';

    tagBar.innerHTML = `<span class="omni-tag-chip active" data-tag="">All</span>` +
      cfg.tags.map(t => `<span class="omni-tag-chip" data-tag="${t}">${t}</span>`).join('');

    tagBar.querySelectorAll('.omni-tag-chip').forEach(chip => {
      chip.onclick = (e) => {
        tagBar.querySelectorAll('.omni-tag-chip').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        selectedTag = e.target.getAttribute('data-tag');
        currentPage = 1;
        loadCatalog();
      };
    });
  }

  function renderSkeletons() {
    grid.innerHTML = Array(6).fill(0).map(() => `<div class="omni-skeleton"></div>`).join('');
  }

  function renderInspectorTab(tabKey) {
    if (!activeCharData) return;
    const d = activeCharData;

    if (tabKey === 'greetings') {
      const altList = d.alternate_greetings || [];
      detailBody.innerHTML = `
        <div style="font-size:0.72rem; font-weight:700; color:#10b981; text-transform:uppercase;">Primary First Message</div>
        <div class="omni-block" style="border-color:rgba(16,185,129,0.3);">${d.first_mes || 'No greeting defined.'}</div>

        ${altList.length > 0 ? `
          <div style="font-size:0.72rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:6px;">Alternate Greetings (${altList.length})</div>
          ${altList.map((g, idx) => `
            <div class="omni-block" style="border-color:rgba(244,63,94,0.2);">
              <div style="font-size:0.68rem; font-weight:700; color:#fda4af; margin-bottom:4px;">Greeting #${idx + 2}</div>
              ${g}
            </div>
          `).join('')}
        ` : ''}

        ${d.mes_example ? `
          <div style="font-size:0.72rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:6px;">Example Dialogue</div>
          <div class="omni-block">${d.mes_example}</div>
        ` : ''}
      `;
    } else if (tabKey === 'definition') {
      detailBody.innerHTML = `
        <div style="font-size:0.72rem; font-weight:700; color:#10b981; text-transform:uppercase;">Character Prompt ({{char}} Definition)</div>
        <div class="omni-block">${d.charDescription || 'No prompt definition visible.'}</div>

        <div style="font-size:0.72rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:6px;">Personality</div>
        <div class="omni-block">${d.personality || 'No personality definition visible.'}</div>

        <div style="font-size:0.72rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:6px;">Scenario</div>
        <div class="omni-block">${d.scenario || 'No specific scenario.'}</div>

        ${d.system_prompt ? `
          <div style="font-size:0.72rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:6px;">System Directives</div>
          <div class="omni-block">${d.system_prompt}</div>
        ` : ''}
      `;
    } else if (tabKey === 'summary') {
      detailBody.innerHTML = `
        <div style="font-size:0.72rem; font-weight:700; color:#f43f5e; text-transform:uppercase;">Catalog Summary</div>
        <div class="omni-block">${d.webSummary || 'No summary provided.'}</div>

        ${d.creator_notes ? `
          <div style="font-size:0.72rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:6px;">Author Notes</div>
          <div class="omni-block">${d.creator_notes}</div>
        ` : ''}

        <div style="font-size:0.72rem; font-weight:700; color:#f43f5e; text-transform:uppercase; margin-top:6px;">Tags</div>
        <div style="display:flex; gap:4px; flex-wrap:wrap;">
          ${(d.tags || []).map(t => `<span class="omni-tag-chip" style="font-size:0.65rem;">${t}</span>`).join('')}
        </div>
      `;
    } else if (tabKey === 'stats') {
      detailBody.innerHTML = `
        <div style="font-size:0.72rem; font-weight:700; color:#f43f5e; text-transform:uppercase;">Technical Information</div>
        <div class="omni-block">
          • Estimated Total Tokens: <b>${d.totalTokens ? d.totalTokens.toLocaleString() : 'N/A'}</b><br>
          • Platform Source: <b>${d.source.toUpperCase()}</b><br>
          • Format: <b>Character Card V2 (CCv2)</b>
        </div>
      `;
    }
  }

  container.querySelectorAll('.omni-subtab').forEach(btn => {
    btn.onclick = (e) => {
      container.querySelectorAll('.omni-subtab').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeTab = e.target.getAttribute('data-tab');
      renderInspectorTab(activeTab);
    };
  });

  async function openCharacterDetails(charId) {
    activeCharId = charId;
    inspector.classList.add('open');
    detailName.innerText = 'Loading card definition...';
    detailAuthor.innerText = '';
    detailBody.innerHTML = '<div style="text-align:center; padding:30px; color:#64748b;">Decoding character card...</div>';

    try {
      const res = await callBackend('GET_DETAILS', { id: charId });
      activeCharData = res.details;
      detailThumb.src = activeCharData.avatarUrl;
      detailName.innerText = activeCharData.name;
      detailAuthor.innerText = `by ${activeCharData.creator} • ${activeCharData.source.toUpperCase()}`;
      greetCountTxt.innerText = String(1 + (activeCharData.alternate_greetings ? activeCharData.alternate_greetings.length : 0));
      renderInspectorTab(activeTab);
    } catch (e) {
      detailBody.innerHTML = `<div style="color:#f87171; padding:20px; text-align:center;">Failed to load definition: ${e.message}</div>`;
    }
  }

  detailImport.onclick = async () => {
    if (!activeCharId) return;
    detailImport.disabled = true;
    detailImport.innerText = 'Importing...';
    try {
      const res = await callBackend('IMPORT', { id: activeCharId });
      detailImport.innerText = '✓ In Library';
      alert(`Imported "${res.characterName}" successfully!`);
    } catch (e) {
      alert(`Import failed: ${e.message}`);
      detailImport.innerText = 'Retry';
      detailImport.disabled = false;
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
            <img src="${c.avatarUrl}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 fill=%22%23131620%22/></svg>'"/>
            <span class="omni-card-source">${c.source}</span>
          </div>
          <div class="omni-card-body">
            <div>
              <div class="omni-card-title">${c.name}</div>
              <div class="omni-card-author">by ${c.creator}</div>
            </div>
            <div class="omni-card-footer">
              <span>⬇️ ${c.downloads ? c.downloads.toLocaleString() : '0'}</span>
              <span>${c.tokens ? c.tokens.toLocaleString() + ' tok' : ''}</span>
            </div>
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

  // Event Listeners
  sortSelect.onchange = (e) => {
    currentSort = e.target.value;
    currentAsc = e.target.selectedOptions[0]?.getAttribute('data-asc') === 'true';
    currentPage = 1;
    loadCatalog();
  };

  tokenSelect.onchange = (e) => {
    currentTokenRange = e.target.value;
    currentPage = 1;
    loadCatalog();
  };

  resetBtn.onclick = () => {
    updatePlatformControls();
    tokenSelect.value = '';
    currentTokenRange = '';
    selectedTag = '';
    currentPage = 1;
    loadCatalog();
  };

  container.querySelectorAll('.omni-tab-btn').forEach(btn => {
    btn.onclick = (e) => {
      container.querySelectorAll('.omni-tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentSource = e.target.getAttribute('data-src');
      currentPage = 1;
      selectedTag = '';
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
