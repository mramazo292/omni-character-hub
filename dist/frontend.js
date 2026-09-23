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
        { id: 'download_count', name: '🔥 Most Popular' },
        { id: 'star_count', name: '⭐ Top Rated' },
        { id: 'last_activity_at', name: '✨ Recently Active' },
        { id: 'created_at', name: '📅 Newly Added' }
      ],
      tags: ['Anime', 'RPG', 'Female', 'Male', 'Romance', 'Fantasy', 'Dominant', 'Submissive', 'Yandere', 'Monster Girl', 'Sci-Fi', 'Horror', 'Smut', 'Slice of Life', 'Comedy', 'Mystery', 'Superhero', 'Villain']
    },
    janny: {
      name: 'Janny AI',
      sorts: [
        { id: 'trending', name: '🔥 Trending Now' },
        { id: 'popular', name: '👑 All-Time Popular' },
        { id: 'recent', name: '✨ Newly Added' }
      ],
      tags: ['AnyPOV', 'MalePOV', 'FemPOV', 'Enemies to Lovers', 'Dead Dove', 'Slow Burn', 'Angst', 'Fluff', 'Smut', 'Monster', 'Royalty', 'Mafia', 'Supernatural', 'College', 'Vampire', 'Step-sibling']
    },
    datacat: {
      name: 'Datacat',
      sorts: [
        { id: 'recent', name: '🌱 Fresh Catalog' },
        { id: 'popular', name: '🔥 Top Kudos' }
      ],
      tags: ['Janitor', 'Saucepan', 'OC', 'RPG', 'NSFW', 'Fluff', 'Angst', 'Romance', 'Fantasy', 'Modern', 'Sci-Fi']
    }
  };

  // Modern Clean Dark Theme
  ctx.dom.addStyle(`
    .omni-root, .omni-root * {
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif !important;
      box-sizing: border-box;
    }
    .omni-root {
      display: flex; flex-direction: column; height: 100%; padding: 8px; gap: 8px;
      background: #090a0f; color: #f1f5f9; position: relative; overflow: hidden;
    }
    .omni-topbar-pinned {
      display: inline-flex; align-items: center; justify-content: center;
      background: transparent; border: none; cursor: pointer; padding: 6px 10px;
      color: inherit; transition: opacity 0.2s;
    }
    .omni-topbar-pinned:hover { opacity: 0.8; }
    .omni-nav-tabs {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;
      background: #12141c; padding: 3px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .omni-tab-btn {
      padding: 6px 2px; font-size: 0.75rem; font-weight: 600; border: none;
      background: transparent; color: #94a3b8; border-radius: 6px; cursor: pointer;
      transition: all 0.15s ease; text-align: center;
    }
    .omni-tab-btn.active {
      background: #e11d48; color: #fff; box-shadow: 0 2px 8px rgba(225, 29, 72, 0.35);
    }
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
    .omni-strip {
      display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem;
    }
    .omni-select {
      background: #12141c; border: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1; padding: 4px 8px; border-radius: 6px; font-size: 0.72rem; outline: none;
    }
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
    .omni-skeleton {
      background: #12141c; border-radius: 8px; aspect-ratio: 1 / 1.4; overflow: hidden; position: relative;
    }
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
    .omni-pager {
      display: flex; justify-content: space-between; align-items: center;
      padding: 4px 2px 0 2px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0;
    }
    .omni-pager-btn {
      padding: 4px 8px; font-size: 0.7rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.08);
      background: #12141c; color: #fff; cursor: pointer;
    }
  `);

  let currentSource = 'chub';
  let currentSort = 'download_count';
  let selectedTag = '';
  let currentPage = 1;
  let currentSearch = '';
  let includeNsfw = true; // TOGGLED ON BY DEFAULT

  // 1. PRIMARY DRAWER TAB (In the scroller)
  const tab = ctx.ui.registerDrawerTab({
    id: 'omni_rose_hub',
    title: 'Character Hub',
    shortName: 'Hub',
    description: 'Browse Chub, JannyAI, and Datacat',
    headerTitle: 'Character Hub',
    iconSvg: roseSvg
  });

  // 2. PINNED SHORTCUT BUTTON (Right next to the Settings gear)
  function installPinnedRose() {
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

  installPinnedRose();
  setInterval(installPinnedRose, 1000);
}
