export function setup(ctx) {
  // Only remove the specific pinned button if it was left behind
  document.getElementById('omni-topbar-rose-btn')?.remove();

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
        { id: 'created_at', name: '📅 Newly Added', asc: false }
      ],
      tags: ['Anime', 'RPG', 'Female', 'Male', 'Romance', 'Fantasy', 'Dominant', 'Submissive', 'Yandere', 'Monster Girl', 'Sci-Fi', 'Horror', 'Smut', 'Slice of Life', 'Comedy', 'Mystery', 'Superhero', 'Villain']
    },
    janny: {
      name: 'JanitorAI / Janny',
      sorts: [
        { id: 'trending', name: '🔥 Trending Now', asc: false },
        { id: 'popular', name: '👑 All-Time Popular', asc: false },
        { id: 'recent', name: '✨ Newly Added', asc: false }
      ],
      tags: ['AnyPOV', 'MalePOV', 'FemPOV', 'Enemies to Lovers', 'Dead Dove', 'Slow Burn', 'Angst', 'Fluff', 'Smut', 'Monster', 'Royalty', 'Mafia', 'Supernatural', 'College', 'Vampire', 'Step-sibling']
    },
    datacat: {
      name: 'Datacat',
      sorts: [
        { id: 'fresh', name: '🌱 Fresh Catalog', asc: false },
        { id: 'popular', name: '🔥 Top Kudos', asc: false }
      ],
      tags: ['Janitor', 'Saucepan', 'OC', 'RPG', 'NSFW', 'Fluff', 'Angst', 'Romance', 'Fantasy', 'Modern', 'Sci-Fi']
    }
  };

  // Modern Clean Dark Theme (Enforces crisp sans-serif typography)
  ctx.dom.addStyle(`
    .omni-root, .omni-root * {
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif !important;
      box-sizing: border-box;
    }
    .omni-root {
      display: flex; flex-direction: column; height: 100%; padding: 8px; gap: 8px;
      background: #090a0f; color: #f1f5f9; position: relative; overflow: hidden;
    }

    /* Segmented Platform Nav */
    .omni-nav-tabs {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;
      background: #12141c; padding: 4px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .omni-tab-btn {
      padding: 6px 2px; font-size: 0.75rem; font-weight: 600; border: none;
      background: transparent; color: #94a3b8; border-radius: 6px; cursor: pointer;
      transition: all 0.15s ease; text-align: center;
    }
    .omni-tab-btn.active {
      background: #e11d48; color: #fff; box-shadow: 0 2px 8px rgba(225, 29, 72, 0.35);
    }

    /* Compact Search & Action Bar */
    .omni-bar-row { display: flex; gap: 6px; align-items: center; }
    .omni-input-box {
      flex: 1; display: flex; align-items: center; background: #12141c;
      border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 0 8px;
    }
    .omni-input-box input {
      width: 100%; padding: 7px 0; font-size: 0.78rem; border: none;
      background: transparent; color: #fff; outline: none;
    }
    .omni-btn {
      padding: 7px 12px; font-size: 0.75rem; font-weight: 600; border-radius: 8px;
      border: none; background: #e11d48; color: #fff; cursor: pointer; white-space: nowrap;
    }
    .omni-btn-secondary {
      padding: 7px 10px; font-size: 0.75rem; font-weight: 600; border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08); background: #12141c; color: #94a3b8; cursor: pointer;
      display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;
    }
    .omni-btn-secondary.active { border-color: #e11d48; color: #fda4af; background: rgba(225, 29, 72, 0.15); }

    /* Compact Control Strip */
    .omni-strip {
      display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem;
    }
    .omni-select {
      background: #12141c; border: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1; padding: 4px 8px; border-radius: 6px; font-size: 0.72rem; outline: none;
    }

    /* Dedicated Tag Search Modal */
    .omni-tag-modal {
      position: absolute; inset: 0; background: #090a0f; z-index: 60; display: none;
      flex-direction: column; padding: 12px; gap: 10px; box-sizing: border-box;
    }
    .omni-tag-modal.open { display: flex; }
    .omni-tag-grid {
      flex: 1; overflow-y: auto; display: flex; flex-wrap: wrap; gap: 6px; align-content: flex-start;
    }
    .omni-modal-chip {
      padding: 6px 12px; font-size: 0.75rem; border-radius: 20px;
      background: #12141c; color: #94a3b8; border: 1px solid rgba(255,255,255,0.06); cursor: pointer;
    }
    .omni-modal-chip.active { background: #e11d48; color: #fff; border-color: #e11d48; }

    /* 2-Column Responsive Card Grid (1:1.3 ratio) */
    .omni-grid {
      flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 8px; padding-right: 2px;
    }
    .omni-card {
      background: #12141c; border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; cursor: pointer;
      transition: transform 0.12s ease, border-color 0.12s ease;
    }
    .omni-card:hover { border-color: rgba(225, 29, 72, 0.4); transform: translateY(-2px); }
    .omni-thumb-wrap { position: relative; width: 100%; aspect-ratio: 1 / 1.25; background: #0b0d13; }
    .omni-thumb-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .omni-card-source {
      position: absolute; top: 4px; left: 4px; padding: 2px 5px; font-size: 0.55rem;
      font-weight: 700; text-transform: uppercase; border-radius: 4px; background: rgba(0,0,0,0.75);
    }
    .omni-card-body { padding: 6px; display: flex; flex-direction: column; flex: 1; justify-content: space-between; gap: 2px; }
    .omni-card-title { font-size: 0.78rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .omni-card-author { font-size: 0.65rem; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .omni-card-meta { display: flex; justify-content: space-between; font-size: 0.62rem; color: #94a3b8; margin-top: 2px; }

    /* Shimmer Skeleton */
    .omni-skeleton {
      background: #12141c; border-radius: 8px; aspect-ratio: 1 / 1.4; overflow: hidden; position: relative;
    }
    .omni-skeleton::after {
      content: ""; position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
      animation: omniShimmer 1.2s infinite;
    }
    @keyframes omniShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

    /* Contained Character Inspector */
    .omni-inspector {
      position: absolute; inset: 0; background: #090a0f; z-index: 50; display: flex;
      flex-direction: column; transform: translateX(100%); transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }
    .omni-inspector.open { transform: translateX(0); }
    .omni-inspector-top {
      padding: 8px 10px; display: flex; gap: 8px; align-items: center;
      background: #12141c; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
    }
    .omni-inspector-thumb {
      width: 42px; height: 42px; border-radius: 6px; object-fit: cover;
      cursor: pointer; border: 1px solid rgba(225, 29, 72, 0.4); flex-shrink: 0;
    }
    .omni-inspector-subtabs {
      display: flex; gap: 4px; padding: 6px 10px; background: #0b0d13;
      border-bottom: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; overflow-x: auto; scrollbar-width: none;
    }
    .omni-subtab {
      padding: 5px 8px; font-size: 0.7rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);
      background: #12141c; color: #94a3b8; cursor: pointer; white-space: nowrap;
    }
    .omni-subtab.active { background: #e11d48; color: #fff; border-color: #e11d48; font-weight: 600; }
    .omni-inspector-body {
      flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px;
    }
    .omni-block {
      background: #12141c; border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 8px 10px; border-radius: 6px; font-size: 0.75rem; line-height: 1.45; color: #cbd5e1;
      white-space: pre-wrap; word-break: break-word;
    }

    /* Centered Image Viewer */
    .omni-img-modal {
      position: absolute; inset: 0; background: rgba(0, 0, 0, 0.95); z-index: 100; display: none;
      align-items: center; justify-content: center; flex-direction: column; padding: 12px; box-sizing: border-box;
    }
    .omni-img-modal.open { display: flex; }
    .omni-img-modal img { max-width: 95%; max-height: 80%; object-fit: contain; border-radius: 8px; }

    /* Footer Pagination */
    .omni-pager {
      display: flex; justify-content: space-between; align-items: center;
      padding: 4px 2px 0 2px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
    }
    .omni-pager-btn {
      padding: 4px 8px; font-size: 0.7rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);
      background: #12141c; color: #fff; cursor: pointer;
    }
    .omni-pager-btn:disabled { opacity: 0.3; cursor: not-allowed; }
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

  // 2. Register Native Drawer Tab (Placed directly in the top scroller)
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
      <div class="omni-img-preview" id="omni-preview-modal">
        <button class="omni-btn" id="omni-preview-close" style="position:absolute; top:12px; right:12px; padding:6px 12px;">&times; Close</button>
        <img id="omni-preview-img" />
        <span style="color:#64748b; font-size:0.75rem; margin-top:8px;">Tap anywhere to close</span>
      </div>

      <!-- DEDICATED TAGS MODAL -->
      <div class="omni-tag-modal" id="omni-tag-modal">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:700; font-size:0.85rem;">Select Filter Tag</span>
          <button class="omni-btn" id="omni-tag-modal-close" style="padding:4px 8px;">&times; Close</button>
        </div>
        <div class="omni-input-box" style="margin:4px 0;">
          <input type="text" id="omni-tag-search-input" placeholder="Type tag name to filter..." />
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button id="omni-clear-tag" style="background:none; border:none; color:#f43f5e; font-size:0.75rem; cursor:pointer;">Clear Selected Tag</button>
          <span id="omni-active-tag-label" style="font-size:0.72rem; color:#94a3b8;">Active: None</span>
        </div>
        <div class="omni-tag-grid" id="omni-tag-grid"></div>
      </div>

      <!-- CHARACTER DETAIL INSPECTOR -->
      <div class="omni-inspector" id="omni-inspector">
        <div class="omni-inspector-top">
          <button class="omni-pager-btn" id="omni-detail-back">&larr; Back</button>
          <img class="omni-inspector-thumb" id="omni-detail-thumb" title="Tap to preview image" />
          <div style="flex:1; min-width:0;">
            <div id="omni-detail-name" style="font-size:0.85rem; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"></div>
            <div id="omni-detail-author" style="font-size:0.68rem; color:#94a3b8;"></div>
          </div>
          <button class="omni-btn" id="omni-detail-import" style="padding:6px 10px;">📥 Import</button>
        </div>

        <div class="omni-inspector-subtabs">
          <button class="omni-subtab active" data-tab="greetings">💬 Greetings (<span id="omni-greet-count">1</span>)</button>
          <button class="omni-subtab" data-tab="definition">🎭 Definition</button>
          <button class="omni-subtab" data-tab="summary">📖 Summary & Notes</button>
          <button class="omni-subtab" data-tab="stats">📊 Specs</button>
        </div>

        <div class="omni-inspector-body" id="omni-detail-body"></div>
      </div>

      <!-- PLATFORM SEGMENTED NAV -->
      <div class="omni-nav-tabs">
        <button class="omni-tab-btn active" data-src="chub">Chub.ai</button>
        <button class="omni-tab-btn" data-src="janny">Janitor / Janny</button>
        <button class="omni-tab-btn" data-src="datacat">Datacat</button>
      </div>

      <!-- SEARCH BAR & TAG BUTTON -->
      <div class="omni-bar-row">
        <div class="omni-input-box">
          <input type="text" id="omni-query" placeholder="Search characters or paste link..." />
        </div>
        <button class="omni-btn-secondary" id="omni-tag-btn">🏷️ Tags</button>
        <button class="omni-btn" id="omni-go">Search</button>
      </div>

      <!-- COMPACT SORT STRIP -->
      <div class="omni-strip">
        <div style="display:flex; align-items:center; gap:6px;">
          <span>Sort:</span>
          <select class="omni-select" id="omni-sort-select"></select>
        </div>
        <label style="display:flex; align-items:center; gap:4px; cursor:pointer;">
          <input type="checkbox" id="omni-nsfw" /> NSFW
        </label>
      </div>

      <!-- 2-COLUMN CARDS GRID -->
      <div class="omni-grid" id="omni-grid"></div>

      <!-- PAGINATION -->
      <div class="omni-pager">
        <button class="omni-pager-btn" id="omni-prev" disabled>&lt; Prev</button>
        <span id="omni-page-display" style="font-size:0.72rem; font-weight:700; color:#94a3b8;">Page 1</span>
        <button class="omni-pager-btn" id="omni-next">Next &gt;</button>
      </div>
    </div>
  `;

  // UI Bindings
  const grid = container.querySelector('#omni-grid');
  const input = container.querySelector('#omni-query');
  const goBtn = container.querySelector('#omni-go');
  const nsfwBox = container.querySelector('#omni-nsfw');
  const pageDisplay = container.querySelector('#omni-page-display');
  const prevBtn = container.querySelector('#omni-prev');
  const nextBtn = container.querySelector('#omni-next');
  const sortSelect = container.querySelector('#omni-sort-select');
  const tagBtn = container.querySelector('#omni-tag-btn');

  // Tag Modal Bindings
  const tagModal = container.querySelector('#omni-tag-modal');
  const tagModalClose = container.querySelector('#omni-tag-modal-close');
  const tagSearchInput = container.querySelector('#omni-tag-search-input');
  const tagGrid = container.querySelector('#omni-tag-grid');
  const clearTagBtn = container.querySelector('#omni-clear-tag');
  const activeTagLabel = container.querySelector('#omni-active-tag-label');

  // Image Modal Bindings
  const imgModal = container.querySelector('#omni-preview-modal');
  const previewImg = container.querySelector('#omni-preview-img');
  const imgModalClose = container.querySelector('#omni-preview-close');

  // Inspector Bindings
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

  // Modal Handlers
  detailThumb.onclick = () => {
    if (!activeCharData?.avatarUrl) return;
    previewImg.src = activeCharData.avatarUrl;
    imgModal.classList.add('open');
  };
  imgModalClose.onclick = () => imgModal.classList.remove('open');
  imgModal.onclick = (e) => { if (e.target !== previewImg) imgModal.classList.remove('open'); };
  detailBack.onclick = () => inspector.classList.remove('open');

  // Tag Modal Open/Close
  tagBtn.onclick = () => {
    tagModal.classList.add('open');
    tagSearchInput.value = '';
    renderTagChips('');
  };
  tagModalClose.onclick = () => tagModal.classList.remove('open');

  function renderTagChips(filterTerm) {
    const list = PLATFORMS[currentSource].tags;
    const filtered = filterTerm
      ? list.filter(t => t.toLowerCase().includes(filterTerm.toLowerCase()))
      : list;

    tagGrid.innerHTML = filtered.map(t => `
      <span class="omni-modal-chip ${selectedTag.toLowerCase() === t.toLowerCase() ? 'active' : ''}" data-val="${t}">${t}</span>
    `).join('');

    tagGrid.querySelectorAll('.omni-modal-chip').forEach(chip => {
      chip
