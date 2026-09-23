export function setup(ctx) {
  // Inject theme-matched styles
  ctx.dom.addStyle(`
    .omni-wrap { display: flex; flex-direction: column; height: 100%; padding: 10px; gap: 8px; box-sizing: border-box; }
    .omni-tabs { display: flex; gap: 4px; }
    .omni-tab { flex: 1; padding: 6px 2px; font-size: 0.78rem; border: 1px solid var(--lumiverse-border, #444); background: var(--lumiverse-fill-subtle, #1a1a1a); color: var(--lumiverse-text, #fff); border-radius: var(--lumiverse-radius, 6px); cursor: pointer; text-align: center; }
    .omni-tab.active { background: var(--lumiverse-primary, #6366f1); color: #fff; font-weight: bold; border-color: transparent; }
    .omni-bar { display: flex; gap: 4px; }
    .omni-bar input { flex: 1; min-width: 0; padding: 6px 8px; border: 1px solid var(--lumiverse-border, #444); background: var(--lumiverse-fill, #111); color: var(--lumiverse-text, #fff); border-radius: var(--lumiverse-radius, 6px); }
    .omni-btn { padding: 6px 12px; background: var(--lumiverse-primary, #6366f1); color: white; border: none; border-radius: var(--lumiverse-radius, 6px); cursor: pointer; font-weight: bold; }
    .omni-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .omni-nav { display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: var(--lumiverse-text-subtle, #aaa); }
    .omni-grid { flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 4px; }
    .omni-card { border: 1px solid var(--lumiverse-border, #444); border-radius: var(--lumiverse-radius, 6px); background: var(--lumiverse-fill-subtle, #1a1a1a); display: flex; flex-direction: column; overflow: hidden; }
    .omni-card img { width: 100%; height: 110px; object-fit: cover; background: #222; }
    .omni-info { padding: 6px; display: flex; flex-direction: column; flex: 1; justify-content: space-between; gap: 4px; }
    .omni-name { font-weight: bold; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--lumiverse-text, #fff); }
    .omni-author { font-size: 0.7rem; color: var(--lumiverse-text-subtle, #aaa); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .omni-import { width: 100%; padding: 4px; font-size: 0.75rem; }
  `);

  let currentSource = 'chub';
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

  // Register Native Lumiverse Drawer Tab
  const tab = ctx.ui.registerDrawerTab({
    id: 'omni_hub',
    title: 'Character Hubs',
    shortName: 'Hubs',
    description: 'Browse Chub, Janitor, and Datacat',
    headerTitle: 'Hub Browser',
    iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>'
  });

  const container = tab.root;
  container.innerHTML = `
    <div class="omni-wrap">
      <div class="omni-tabs">
        <button class="omni-tab active" data-src="chub">Chub.ai</button>
        <button class="omni-tab" data-src="janny">Janitor</button>
        <button class="omni-tab" data-src="datacat">Datacat</button>
      </div>

      <div class="omni-bar">
        <input type="text" id="omni-query" placeholder="Search or paste link..." />
        <button class="omni-btn" id="omni-go">Go</button>
      </div>

      <div class="omni-nav">
        <label><input type="checkbox" id="omni-nsfw" /> NSFW</label>
        <div>
          <button class="omni-btn" id="omni-prev" style="padding:2px 8px;">&lt;</button>
          <span id="omni-page">1</span>
          <button class="omni-btn" id="omni-next" style="padding:2px 8px;">&gt;</button>
        </div>
      </div>

      <div class="omni-grid" id="omni-results">
        <div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--lumiverse-text-subtle, #888);">
          Tap "Go" to browse characters
        </div>
      </div>
    </div>
  `;

  const grid = container.querySelector('#omni-results');
  const input = container.querySelector('#omni-query');
  const goBtn = container.querySelector('#omni-go');
  const nsfwBox = container.querySelector('#omni-nsfw');
  const pageTxt = container.querySelector('#omni-page');

  async function runSearch() {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center;">Loading...</div>';
    goBtn.disabled = true;

    try {
      if (input.value.startsWith('http')) {
        const res = await callBackend('IMPORT', { id: input.value.trim() });
        alert(`Imported: ${res.characterName}!`);
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center;">Import complete!</div>';
        return;
      }

      const res = await callBackend('SEARCH', {
        query: currentSearch,
        page: currentPage,
        nsfw: includeNsfw
      });

      const chars = res.results.characters || [];
      if (!chars.length) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center;">No characters found.</div>';
        return;
      }

      grid.innerHTML = chars.map(c => `
        <div class="omni-card" data-id="${c.id}">
          <img src="${c.avatarUrl}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/></svg>'"/>
          <div class="omni-info">
            <div>
              <div class="omni-name" title="${c.name}">${c.name}</div>
              <div class="omni-author">by ${c.creator}</div>
            </div>
            <button class="omni-btn omni-import">Import</button>
          </div>
        </div>
      `).join('');

      grid.querySelectorAll('.omni-import').forEach(btn => {
        btn.onclick = async (e) => {
          const card = e.target.closest('.omni-card');
          const id = card.getAttribute('data-id');
          btn.disabled = true;
          btn.innerText = 'Importing...';
          try {
            const res = await callBackend('IMPORT', { id });
            btn.innerText = 'Done!';
            alert(`Successfully imported "${res.characterName}"!`);
          } catch (err) {
            alert(`Failed: ${err.message}`);
            btn.innerText = 'Retry';
            btn.disabled = false;
          }
        };
      });
    } catch (err) {
      grid.innerHTML = `<div style="grid-column:1/-1; color:red; text-align:center;">${err.message}</div>`;
    } finally {
      goBtn.disabled = false;
    }
  }

  container.querySelectorAll('.omni-tab').forEach(tabBtn => {
    tabBtn.onclick = (e) => {
      container.querySelectorAll('.omni-tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      currentSource = e.target.getAttribute('data-src');
      currentPage = 1;
      pageTxt.innerText = '1';
      runSearch();
    };
  });

  goBtn.onclick = () => {
    currentSearch = input.value.trim();
    currentPage = 1;
    pageTxt.innerText = '1';
    runSearch();
  };

  nsfwBox.onchange = (e) => {
    includeNsfw = e.target.checked;
    runSearch();
  };

  container.querySelector('#omni-prev').onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      pageTxt.innerText = String(currentPage);
      runSearch();
    }
  };

  container.querySelector('#omni-next').onclick = () => {
    currentPage++;
    pageTxt.innerText = String(currentPage);
    runSearch();
  };
}
