export function setup(ctx) {
  const EXTENSION_ID = 'omni_character_hub';

  const icon = (name, size=18) => {
    const paths = {
      grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
      search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>',
      sliders: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="11" cy="18" r="2"/>',
      heart: '<path d="M20.8 8.7c0 5.1-8.8 10.3-8.8 10.3S3.2 13.8 3.2 8.7A5 5 0 0 1 12 6a5 5 0 0 1 8.8 2.7Z"/>',
      import: '<path d="M12 3v11"/><path d="m7 9 5 5 5-5"/><path d="M4 20h16"/>',
      tag: '<path d="M20 13 13 20l-9-9V4h7l9 9Z"/><circle cx="8" cy="8" r="1.4"/>',
      settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="m19.4 15 .1.1-1.8 3.1-.2-.1-2-.8a7.5 7.5 0 0 1-1.5.9L13.8 20h-3.6l-.3-1.8a7.5 7.5 0 0 1-1.5-.9l-2 .8-.2.1-1.8-3.1.1-.1 1.5-1.4a7.2 7.2 0 0 1 0-1.8l-1.5-1.4-.1-.1 1.8-3.1.2.1 2 .8a7.5 7.5 0 0 1 1.5-.9L10.2 4h3.6l.3 1.8a7.5 7.5 0 0 1 1.5.9l2-.8.2-.1 1.8 3.1-.1.1-1.5 1.4a7.2 7.2 0 0 1 0 1.8l1.5 1.4Z"/>',
      x: '<path d="m5 5 14 14M19 5 5 19"/>',
      chevron: '<path d="m9 18 6-6-6-6"/>',
      star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 18.3 6.4 21l1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
      back: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>'
    };
    return `<svg class="omni-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`;
  };

  const style = ctx.dom.addStyle(`
    .omni-v2, .omni-v2 * { box-sizing:border-box; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .omni-v2 { --bg:#0a0b10; --panel:#10121a; --panel2:#151824; --line:rgba(255,255,255,.08); --muted:#8d96aa; --text:#f7f8fb; --accent:#7c5cff; --accent2:#9c8aff; width:100%; height:100%; color:var(--text); background:radial-gradient(1200px 600px at 0% -20%,rgba(124,92,255,.15),transparent 45%),radial-gradient(1000px 500px at 100% 0%,rgba(44,211,153,.08),transparent 40%),var(--bg); }
    .omni-shell { display:grid; grid-template-rows:auto auto 1fr; height:100%; min-height:0; }
    .omni-top { padding:14px 16px 10px; border-bottom:1px solid var(--line); background:rgba(8,9,13,.7); backdrop-filter:blur(14px); position:sticky; top:0; z-index:5; }
    .omni-brand { display:flex; align-items:center; gap:11px; }
    .omni-logo { width:34px; height:34px; border-radius:12px; display:grid; place-items:center; background:linear-gradient(135deg,#7c5cff,#c6baff); color:#fff; box-shadow:0 8px 24px rgba(124,92,255,.28); }
    .omni-title { font-size:16px; font-weight:800; letter-spacing:-.02em; }
    .omni-sub { font-size:11px; color:var(--muted); margin-top:2px; }
    .omni-top-actions { margin-left:auto; display:flex; gap:6px; }
    .omni-btn-icon { width:34px; height:34px; border-radius:10px; border:1px solid var(--line); background:rgba(255,255,255,.03); color:var(--muted); display:grid; place-items:center; cursor:pointer; }
    .omni-btn-icon:hover { color:var(--text); border-color:rgba(124,92,255,.4); background:rgba(124,92,255,.08); }
    .omni-toolbar { padding:10px 16px; border-bottom:1px solid var(--line); display:flex; gap:8px; flex-wrap:wrap; background:rgba(10,11,16,.85); }
    .omni-search { flex:1 1 280px; min-width:180px; display:flex; align-items:center; gap:8px; padding:0 11px; border:1px solid var(--line); border-radius:12px; background:var(--panel); }
    .omni-search:focus-within { border-color:rgba(124,92,255,.65); box-shadow:0 0 0 3px rgba(124,92,255,.12); }
    .omni-search input { width:100%; height:38px; background:transparent; color:var(--text); border:0; outline:none; font-size:13px; }
    .omni-control { height:38px; padding:0 11px; border:1px solid var(--line); border-radius:11px; background:var(--panel); color:var(--text); cursor:pointer; display:inline-flex; gap:7px; align-items:center; font-size:12px; }
    .omni-control:hover { border-color:rgba(124,92,255,.45); }
    .omni-control.primary { background:linear-gradient(135deg,#7c5cff,#6d4bf0); border-color:transparent; color:#fff; font-weight:700; }
    .omni-main { min-height:0; display:grid; grid-template-columns:1fr; }
    .omni-library { min-height:0; overflow:auto; padding:14px 16px 18px; }
    .omni-meta-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
    .omni-pill { padding:5px 8px; border-radius:99px; border:1px solid var(--line); color:var(--muted); background:rgba(255,255,255,.02); font-size:10px; }
    .omni-spacer { flex:1; }
    .omni-segment { display:inline-flex; padding:2px; border:1px solid var(--line); background:var(--panel); border-radius:10px; }
    .omni-segment button { border:0; background:transparent; color:var(--muted); padding:6px 9px; font-size:10px; border-radius:7px; cursor:pointer; }
    .omni-segment button.active { background:rgba(124,92,255,.18); color:#fff; }
    .omni-grid { display:grid; gap:12px; grid-template-columns:repeat(3,minmax(0,1fr)); }
    .omni-grid.list { grid-template-columns:1fr; }
    .omni-card { overflow:hidden; border:1px solid var(--line); background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.012)); border-radius:16px; cursor:pointer; transition:.16s transform,.16s border-color,.16s box-shadow; }
    .omni-card:hover { transform:translateY(-2px); border-color:rgba(124,92,255,.35); box-shadow:0 14px 40px rgba(0,0,0,.25); }
    .omni-card-cover { aspect-ratio:4/5; background:linear-gradient(135deg,#161922,#0c0d12); position:relative; overflow:hidden; }
    .omni-card-cover img { width:100%; height:100%; object-fit:cover; display:block; }
    .omni-source { position:absolute; top:8px; left:8px; padding:5px 8px; background:rgba(6,7,10,.78); border:1px solid rgba(255,255,255,.08); border-radius:99px; font-size:9px; color:#e6e8ef; backdrop-filter:blur(8px); }
    .omni-fav { position:absolute; top:7px; right:7px; width:29px; height:29px; border-radius:9px; border:1px solid rgba(255,255,255,.08); background:rgba(6,7,10,.72); color:#b1b7c5; display:grid; place-items:center; cursor:pointer; }
    .omni-fav.active { color:#ffd36b; }
    .omni-body { padding:10px; }
    .omni-name { font-size:13px; font-weight:800; line-height:1.2; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .omni-creator { color:var(--muted); font-size:10px; margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .omni-tags { display:flex; gap:5px; flex-wrap:wrap; margin-top:8px; }
    .omni-tag { padding:4px 6px; font-size:9px; color:#c7cce0; border:1px solid var(--line); border-radius:7px; background:rgba(255,255,255,.025); cursor:pointer; }
    .omni-tag:hover { border-color:rgba(124,92,255,.45); color:#fff; }
    .omni-stats { display:flex; gap:10px; margin-top:9px; color:#778096; font-size:9px; }
    .omni-empty { border:1px dashed var(--line); border-radius:16px; padding:40px 20px; text-align:center; color:var(--muted); }
    .omni-empty strong { display:block; color:#fff; font-size:14px; margin-bottom:6px; }
    .omni-loadmore { display:flex; justify-content:center; padding:16px 0 4px; }
    .omni-drawer { position:fixed; inset:0; background:rgba(4,5,8,.68); backdrop-filter:blur(10px); z-index:30; display:none; }
    .omni-drawer.open { display:block; }
    .omni-panel { position:absolute; right:0; top:0; height:100%; width:min(520px,96vw); background:#0d0f16; border-left:1px solid var(--line); display:flex; flex-direction:column; }
    .omni-panel-header { padding:14px 16px; border-bottom:1px solid var(--line); display:flex; gap:10px; align-items:center; }
    .omni-panel-body { padding:16px; overflow:auto; }
    .omni-detail-hero { display:grid; grid-template-columns:92px 1fr; gap:12px; align-items:start; }
    .omni-detail-avatar { width:92px; height:116px; border-radius:14px; object-fit:cover; border:1px solid var(--line); background:#12141a; }
    .omni-detail-name { font-size:20px; font-weight:900; line-height:1.05; }
    .omni-detail-creator { color:var(--muted); font-size:11px; margin-top:5px; }
    .omni-detail-actions { display:flex; gap:7px; margin-top:12px; flex-wrap:wrap; }
    .omni-section { margin-top:18px; }
    .omni-section h3 { margin:0 0 8px; font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:#99a1b4; }
    .omni-block { border:1px solid var(--line); background:rgba(255,255,255,.025); border-radius:12px; padding:12px; white-space:pre-wrap; word-break:break-word; line-height:1.55; font-size:11px; color:#dde1eb; }
    .omni-modal { position:fixed; inset:0; background:rgba(4,5,8,.66); backdrop-filter:blur(10px); z-index:50; display:none; align-items:center; justify-content:center; padding:14px; }
    .omni-modal.open { display:flex; }
    .omni-modal-card { width:min(650px,96vw); max-height:90vh; overflow:auto; background:#0e1017; border:1px solid var(--line); border-radius:18px; box-shadow:0 30px 80px rgba(0,0,0,.45); }
    .omni-modal-card header { padding:14px 16px; border-bottom:1px solid var(--line); display:flex; align-items:center; gap:10px; }
    .omni-modal-card .content { padding:16px; }
    .omni-field { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
    .omni-field label { font-size:10px; color:#aeb5c5; text-transform:uppercase; letter-spacing:.06em; }
    .omni-field input, .omni-field select { height:38px; padding:0 10px; background:#11131b; color:#fff; border:1px solid var(--line); border-radius:10px; outline:none; }
    .omni-field input:focus, .omni-field select:focus { border-color:rgba(124,92,255,.6); box-shadow:0 0 0 3px rgba(124,92,255,.1); }
    .omni-checks { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
    .omni-check { display:flex; align-items:center; gap:8px; padding:9px 10px; border:1px solid var(--line); background:rgba(255,255,255,.025); border-radius:10px; font-size:11px; }
    .omni-settings-source { border:1px solid var(--line); border-radius:12px; padding:11px; display:flex; gap:8px; align-items:center; margin-bottom:8px; }
    .omni-color { width:30px; height:30px; border-radius:9px; border:1px solid var(--line); }
    @media (max-width:760px) { .omni-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
    @media (max-width:520px) { .omni-grid { grid-template-columns:1fr 1fr; gap:8px; } .omni-library{padding:10px;} .omni-top,.omni-toolbar{padding-left:10px;padding-right:10px;} .omni-detail-hero{grid-template-columns:76px 1fr;} .omni-detail-avatar{width:76px;height:96px;} }
    .omni-skeleton { border:1px solid var(--line); border-radius:16px; overflow:hidden; background:#11131a; }
    .omni-skeleton::before { content:""; display:block; aspect-ratio:4/5; background:linear-gradient(90deg,#11131a,#1a1d27,#11131a); animation:omniShimmer 1.15s infinite; }
    .omni-skeleton::after { content:""; display:block; height:56px; background:linear-gradient(90deg,#11131a,#191c25,#11131a); animation:omniShimmer 1.15s infinite; }
    @keyframes omniShimmer { from{background-position:-240px 0} to{background-position:240px 0} }
    body.omni-light .omni-v2 { --bg:#f4f5fb; --panel:#fff; --panel2:#f0f1f7; --line:rgba(20,24,36,.11); --muted:#6e7689; --text:#151821; background:#f4f5fb; }
  `);

  const tab = ctx.ui.registerDrawerTab({
    id:'omni_2',
    title:'Omni Hub',
    shortName:'Omni',
    description:'Beautiful character-card library and importer',
    headerTitle:'Omni Character Hub',
    iconSvg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3l1.8 4.4L18 9l-4.2 1.7L12 15l-1.8-4.3L6 9l4.2-1.6L12 3Z"/><path d="M19 14l.9 2.2L22 17l-2.1.8L19 20l-.9-2.2L16 17l2.1-.8L19 14Z"/></svg>`
  });

  const root = tab.root;
  root.innerHTML = `
    <div class="omni-v2">
      <div class="omni-shell">
        <header class="omni-top">
          <div class="omni-brand">
            <div class="omni-logo">${icon('grid',17)}</div>
            <div>
              <div class="omni-title">Omni Character Hub</div>
              <div class="omni-sub">One clean library for your imported character cards</div>
            </div>
            <div class="omni-spacer"></div>
            <div class="omni-top-actions">
              <button class="omni-btn-icon" id="omni-settings">${icon('settings',17)}</button>
            </div>
          </div>
        </header>

        <div class="omni-toolbar">
          <div class="omni-search">${icon('search',16)}<input id="omni-q" placeholder="Search names, creators, descriptions, or tags…" /></div>
          <button class="omni-control" id="omni-tags">${icon('tag',15)} Tags</button>
          <button class="omni-control" id="omni-import">${icon('import',15)} Import</button>
        </div>
        <div id="omni-sources-bar" style="padding:8px 16px;display:flex;gap:6px;overflow:auto;border-bottom:1px solid var(--line);background:rgba(10,11,16,.72);"></div>

        <main class="omni-main">
          <section class="omni-library">
            <div class="omni-meta-row">
              <span class="omni-pill" id="omni-count">0 characters</span>
              <div class="omni-segment" id="omni-view-segment">
                <button data-view="grid" class="active">${icon('grid',13)}</button>
                <button data-view="list">${icon('sliders',13)}</button>
              </div>
              <select class="omni-control" id="omni-sort" style="height:30px;padding:0 9px;">
                <option value="updated">Recently updated</option>
                <option value="created">Recently added</option>
                <option value="name">Name A–Z</option>
                <option value="creator">Creator A–Z</option>
              </select>
              <div class="omni-spacer"></div>
              <span class="omni-pill" id="omni-filter-pill">All tags</span>
            </div>
            <div class="omni-grid" id="omni-grid"></div>
            <div class="omni-loadmore"><button class="omni-control" id="omni-more" style="display:none;">Load more</button></div>
          </section>
        </main>
      </div>

      <div class="omni-drawer" id="omni-detail-overlay">
        <aside class="omni-panel">
          <div class="omni-panel-header">
            <button class="omni-btn-icon" id="omni-detail-close">${icon('back',16)}</button>
            <strong id="omni-detail-heading">Character</strong>
            <div class="omni-spacer"></div>
          </div>
          <div class="omni-panel-body" id="omni-detail-body"></div>
        </aside>
      </div>

      <div class="omni-modal" id="omni-tags-modal">
        <div class="omni-modal-card">
          <header><strong>Tag filters</strong><div class="omni-spacer"></div><button class="omni-btn-icon" id="omni-tags-close">${icon('x',16)}</button></header>
          <div class="content">
            <div class="omni-field"><label>Match mode</label><select id="omni-tag-mode"><option value="AND">Match all selected tags</option><option value="OR">Match any selected tag</option></select></div>
            <div id="omni-tag-facets" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
          </div>
        </div>
      </div>

      <div class="omni-modal" id="omni-import-modal">
        <div class="omni-modal-card">
          <header><strong>Import character card</strong><div class="omni-spacer"></div><button class="omni-btn-icon" id="omni-import-close">${icon('x',16)}</button></header>
          <div class="content">
            <div class="omni-field"><label>Source label</label><input id="omni-source-label" value="Local Cards" placeholder="e.g. My Archive" /></div>
            <div class="omni-field"><label>Character card file</label><input id="omni-file" type="file" accept=".json,.png,.charx,.charcard,application/json,image/png,application/zip" /></div>
            <div style="font-size:10px;color:#8d96aa;line-height:1.5;margin-bottom:12px;">The importer preserves the card fields Lumiverse supports and stores the source label in Omni metadata. Cards that explicitly declare mature/adult metadata are not imported.</div>
            <div style="display:flex;justify-content:flex-end;gap:7px;"><button class="omni-control" id="omni-import-cancel">Cancel</button><button class="omni-control primary" id="omni-import-submit">${icon('import',14)} Import card</button></div>
          </div>
        </div>
      </div>

      <div class="omni-modal" id="omni-settings-modal">
        <div class="omni-modal-card">
          <header><strong>Omni settings</strong><div class="omni-spacer"></div><button class="omni-btn-icon" id="omni-settings-close">${icon('x',16)}</button></header>
          <div class="content">
            <div class="omni-field"><label>Theme</label><select id="omni-setting-theme"><option value="auto">Follow Lumiverse</option><option value="dark">Dark</option><option value="light">Light</option></select></div>
            <div class="omni-field"><label>Density</label><select id="omni-setting-density"><option value="comfortable">Comfortable</option><option value="compact">Compact</option></select></div>
            <div class="omni-field"><label>Characters per page</label><select id="omni-setting-page"><option>20</option><option>30</option><option>50</option><option>80</option></select></div>
            <div class="omni-checks">
              <label class="omni-check"><input type="checkbox" id="omni-setting-tags" /> Show tag chips</label>
              <label class="omni-check"><input type="checkbox" id="omni-setting-stats" /> Show stats</label>
              <label class="omni-check"><input type="checkbox" id="omni-setting-fav" /> Favorites first</label>
            </div>
            <div style="margin-top:18px;font-size:11px;color:#9da5b5;">Sources</div>
            <div id="omni-sources" style="margin-top:8px;"></div>
            <div style="margin-top:10px;font-size:10px;color:#737b8f;">Source connectors are deliberately isolated. Each connector keeps its own identity, metadata, categories, tags and import provenance instead of falling back to another catalog.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  const q = root.querySelector('#omni-q');
  const grid = root.querySelector('#omni-grid');
  const count = root.querySelector('#omni-count');
  const more = root.querySelector('#omni-more');
  const sort = root.querySelector('#omni-sort');
  const tagsModal = root.querySelector('#omni-tags-modal');
  const importModal = root.querySelector('#omni-import-modal');
  const settingsModal = root.querySelector('#omni-settings-modal');
  const detailOverlay = root.querySelector('#omni-detail-overlay');

  let settings = { pageSize:30, sort:'updated', view:'grid', tagMode:'AND', showTags:true, showStats:true, favoriteFirst:false, theme:'auto', density:'comfortable' };
  let sources = [];
  let activeTags = [];
  let activeSourceId = '';
  let page = 1;
  let busy = false;
  let latestItems = [];

  function request(action, payload={}) {
    return new Promise((resolve,reject) => {
      const requestId = Math.random().toString(36).slice(2);
      const timeout = setTimeout(() => {
        ctx.offBackendMessage?.(handler);
        reject(new Error('The extension did not respond in time.'));
      }, 15000);
      const handler = (msg) => {
        if (msg?.requestId !== requestId) return;
        clearTimeout(timeout);
        ctx.offBackendMessage?.(handler);
        if (msg.type === 'ERROR') reject(new Error(msg.error || 'Operation failed'));
        else resolve(msg.result);
      };
      ctx.onBackendMessage(handler);
      ctx.sendToBackend({ action, payload, requestId });
    });
  }

  function applyTheme() {
    document.body.classList.toggle('omni-light', settings.theme === 'light');
  }

  function applyLayout() {
    grid.classList.toggle('list', settings.view === 'list');
    root.querySelector('#omni-view-segment').querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.view === settings.view));
  }

  function renderSourcesBar(){
    const bar = root.querySelector('#omni-sources-bar');
    const list = [{id:'',name:'All sources'}, ...(sources||[]).filter(s=>s.enabled)];
    bar.innerHTML = list.map(s => `<button class="omni-control ${activeSourceId===s.id?'primary':''}" data-source="${escapeAttr(s.id)}" style="height:30px;white-space:nowrap;">${escapeHtml(s.name)}</button>`).join('');
    bar.querySelectorAll('[data-source]').forEach(btn => btn.onclick = () => {
      activeSourceId = btn.dataset.source;
      page = 1;
      renderSourcesBar();
      load(false);
    });
  }

  function renderFacets(facets=[]) {
    const box = root.querySelector('#omni-tag-facets');
    const chosen = new Set(activeTags.map(t => t.toLowerCase()));
    box.innerHTML = facets.map(({tag,count}) => {
      const active = chosen.has(tag.toLowerCase());
      return `<button class="omni-tag ${active ? 'active' : ''}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)} · ${count}</button>`;
    }).join('') || '<div style="font-size:10px;color:#777f90;">No tags in the current library.</div>';
    box.querySelectorAll('[data-tag]').forEach(btn => btn.onclick = () => {
      const tag = btn.dataset.tag;
      const idx = activeTags.findIndex(t => t.toLowerCase() === tag.toLowerCase());
      if (idx >= 0) activeTags.splice(idx,1); else activeTags.push(tag);
      root.querySelector('#omni-filter-pill').textContent = activeTags.length ? `${activeTags.length} tag${activeTags.length>1?'s':''}` : 'All tags';
      page = 1;
      load(false);
      renderFacets(latestItems.facets || []);
    });
  }

  function escapeHtml(text) {
    return String(text ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function escapeAttr(text) { return escapeHtml(text).replace(/`/g,'&#96;'); }

  function skeletons() {
    grid.innerHTML = Array.from({length:Math.max(4, Number(settings.columns || 3) * 2)}, () => '<div class="omni-skeleton"></div>').join('');
  }

  function renderItems(data, append=false) {
    latestItems = data;
    if (!append) grid.innerHTML = '';
    const rows = data.items || [];
    if (!rows.length && !append) {
      grid.innerHTML = `<div class="omni-empty" style="grid-column:1/-1;"><strong>No characters found</strong>Try another search or clear a tag filter.</div>`;
    } else {
      grid.insertAdjacentHTML('beforeend', rows.map(item => {
        const tags = settings.showTags ? (item.tags || []).slice(0, 5).map(t => `<button class="omni-tag" data-card-tag="${escapeAttr(t)}">${escapeHtml(t)}</button>`).join('') : '';
        return `
          <article class="omni-card" data-id="${escapeAttr(item.id)}">
            <div class="omni-card-cover">
              <div class="omni-source">${escapeHtml(item.sourceName || 'Local Cards')}</div>
              <button class="omni-fav ${item._favorite ? 'active' : ''}" data-fav="${escapeAttr(item.id)}">${icon('star',14)}</button>
              <div style="width:100%;height:100%;display:grid;place-items:center;color:#555e73;font-size:11px;">No preview</div>
            </div>
            <div class="omni-body">
              <div class="omni-name">${escapeHtml(item.name)}</div>
              <div class="omni-creator">by ${escapeHtml(item.creator)}</div>
              <div class="omni-tags">${tags}</div>
              ${settings.showStats ? `<div class="omni-stats"><span>${item.alternateGreetings || 0} greetings</span><span>${new Date(Number(item.updatedAt||0)*1000).toLocaleDateString()}</span></div>` : ''}
            </div>
          </article>
        `;
      }).join(''));
    }

    count.textContent = `${Number(data.total||0).toLocaleString()} character${Number(data.total||0)===1?'':'s'}`;
    more.style.display = data.hasNext ? 'inline-flex' : 'none';
    grid.querySelectorAll('.omni-card').forEach(card => card.onclick = (e) => {
      if (e.target.closest('[data-fav]') || e.target.closest('[data-card-tag]')) return;
      openDetails(card.dataset.id);
    });
    grid.querySelectorAll('[data-fav]').forEach(btn => btn.onclick = async (e) => {
      e.stopPropagation();
      const active = !btn.classList.contains('active');
      await request('SET_FAVORITE',{id:btn.dataset.fav,favorite:active});
      load(false);
    });
    grid.querySelectorAll('[data-card-tag]').forEach(btn => btn.onclick = (e) => {
      e.stopPropagation();
      const tag = btn.dataset.cardTag;
      if (!activeTags.some(t=>t.toLowerCase()===tag.toLowerCase())) activeTags.push(tag);
      root.querySelector('#omni-filter-pill').textContent = `${activeTags.length} tag${activeTags.length>1?'s':''}`;
      page = 1; load(false);
    });
  }

  async function load(append=false) {
    if (busy) return;
    busy = true;
    if (!append) skeletons();
    try {
      const data = await request('LIST_LIBRARY',{
        query:q.value.trim(),
        sourceId:activeSourceId,
        tags:activeTags,
        tagMode:settings.tagMode,
        page: append ? page + 1 : 1,
        pageSize:Number(settings.pageSize||30),
        sort:sort.value,
        favoriteFirst:Boolean(settings.favoriteFirst)
      });
      if (append) page += 1;
      else page = 1;
      renderItems(data, append);
      renderFacets(data.facets || []);
    } catch (e) {
      grid.innerHTML = `<div class="omni-empty" style="grid-column:1/-1;"><strong>Could not load library</strong>${escapeHtml(e.message)}</div>`;
    } finally { busy = false; }
  }

  async function openDetails(id) {
    detailOverlay.classList.add('open');
    root.querySelector('#omni-detail-body').innerHTML = '<div class="omni-empty">Loading character…</div>';
    try {
      const { character:c } = await request('GET_CHARACTER',{id});
      const fav = (await request('LIST_LIBRARY',{query:c.name,page:1,pageSize:1})).items?.some(i=>i.id===id && i._favorite);
      root.querySelector('#omni-detail-heading').textContent = c.name || 'Character';
      root.querySelector('#omni-detail-body').innerHTML = `
        <div class="omni-detail-hero">
          <div class="omni-detail-avatar"></div>
          <div>
            <div class="omni-detail-name">${escapeHtml(c.name)}</div>
            <div class="omni-detail-creator">by ${escapeHtml(c.creator || 'Community')}</div>
            <div class="omni-pill" style="display:inline-block;margin-top:8px;">${escapeHtml(c.sourceInfo?.imported_source || 'Local Cards')}</div>
            <div class="omni-detail-actions">
              <button class="omni-control" id="omni-detail-fav">${icon('star',14)} ${fav?'Unfavorite':'Favorite'}</button>
              <button class="omni-control" id="omni-detail-delete">${icon('x',14)} Delete</button>
            </div>
          </div>
        </div>
        <div class="omni-section"><h3>Tags</h3><div class="omni-tags">${(c.tags||[]).map(t=>`<span class="omni-tag">${escapeHtml(t)}</span>`).join('') || '<span style="font-size:10px;color:#777f90;">No tags</span>'}</div></div>
        <div class="omni-section"><h3>Description</h3><div class="omni-block">${escapeHtml(c.description || 'No description.')}</div></div>
        <div class="omni-section"><h3>Personality</h3><div class="omni-block">${escapeHtml(c.personality || 'No personality data.')}</div></div>
        <div class="omni-section"><h3>Scenario</h3><div class="omni-block">${escapeHtml(c.scenario || 'No scenario.')}</div></div>
        <div class="omni-section"><h3>First message</h3><div class="omni-block">${escapeHtml(c.first_mes || 'No first message.')}</div></div>
        ${(c.alternate_greetings||[]).length ? `<div class="omni-section"><h3>Alternate greetings (${c.alternate_greetings.length})</h3>${c.alternate_greetings.map((g,i)=>`<div class="omni-block" style="margin-bottom:8px;"><b>Greeting ${i+2}</b><br>${escapeHtml(g)}</div>`).join('')}</div>` : ''}
        <div class="omni-section"><h3>Example dialogue</h3><div class="omni-block">${escapeHtml(c.mes_example || 'No example dialogue.')}</div></div>
        <div class="omni-section"><h3>Creator notes</h3><div class="omni-block">${escapeHtml(c.creator_notes || 'No creator notes.')}</div></div>
      `;
      root.querySelector('#omni-detail-fav').onclick = async () => {
        await request('SET_FAVORITE',{id,favorite:!fav});
        openDetails(id); load(false);
      };
      root.querySelector('#omni-detail-delete').onclick = async () => {
        if (!confirm(`Delete "${c.name}" from your Lumiverse library?`)) return;
        await request('DELETE_CHARACTER',{id});
        detailOverlay.classList.remove('open');
        load(false);
      };
    } catch (e) {
      root.querySelector('#omni-detail-body').innerHTML = `<div class="omni-empty"><strong>Could not open character</strong>${escapeHtml(e.message)}</div>`;
    }
  }

  function open(el){el.classList.add('open');}
  function close(el){el.classList.remove('open');}

  root.querySelector('#omni-detail-close').onclick = ()=>close(detailOverlay);
  detailOverlay.onclick = e => { if(e.target===detailOverlay) close(detailOverlay); };
  root.querySelector('#omni-tags').onclick = ()=>open(tagsModal);
  root.querySelector('#omni-tags-close').onclick = ()=>close(tagsModal);
  tagsModal.onclick = e => { if(e.target===tagsModal) close(tagsModal); };
  root.querySelector('#omni-import').onclick = ()=>open(importModal);
  root.querySelector('#omni-import-close').onclick = ()=>close(importModal);
  root.querySelector('#omni-import-cancel').onclick = ()=>close(importModal);
  importModal.onclick = e => { if(e.target===importModal) close(importModal); };
  root.querySelector('#omni-settings').onclick = ()=>{
    root.querySelector('#omni-setting-theme').value = settings.theme;
    root.querySelector('#omni-setting-density').value = settings.density;
    root.querySelector('#omni-setting-page').value = String(settings.pageSize);
    root.querySelector('#omni-setting-tags').checked = !!settings.showTags;
    root.querySelector('#omni-setting-stats').checked = !!settings.showStats;
    root.querySelector('#omni-setting-fav').checked = !!settings.favoriteFirst;
    renderSources();
    open(settingsModal);
  };
  root.querySelector('#omni-settings-close').onclick = ()=>close(settingsModal);
  settingsModal.onclick = e => { if(e.target===settingsModal) close(settingsModal); };

  root.querySelector('#omni-tag-mode').onchange = async e => {
    settings.tagMode = e.target.value;
    await request('SAVE_SETTINGS',settings);
    page=1; load(false);
  };

  root.querySelector('#omni-view-segment').querySelectorAll('button').forEach(btn=>btn.onclick=async()=>{
    settings.view=btn.dataset.view; applyLayout(); await request('SAVE_SETTINGS',{view:settings.view});
  });

  root.querySelector('#omni-setting-theme').onchange=async e=>{settings.theme=e.target.value;applyTheme();await request('SAVE_SETTINGS',{theme:settings.theme});};
  root.querySelector('#omni-setting-density').onchange=async e=>{settings.density=e.target.value;await request('SAVE_SETTINGS',{density:settings.density});};
  root.querySelector('#omni-setting-page').onchange=async e=>{settings.pageSize=Number(e.target.value);await request('SAVE_SETTINGS',{pageSize:settings.pageSize});page=1;load(false);};
  root.querySelector('#omni-setting-tags').onchange=async e=>{settings.showTags=e.target.checked;await request('SAVE_SETTINGS',{showTags:settings.showTags});load(false);};
  root.querySelector('#omni-setting-stats').onchange=async e=>{settings.showStats=e.target.checked;await request('SAVE_SETTINGS',{showStats:settings.showStats});load(false);};
  root.querySelector('#omni-setting-fav').onchange=async e=>{settings.favoriteFirst=e.target.checked;await request('SAVE_SETTINGS',{favoriteFirst:settings.favoriteFirst});load(false);};

  function renderSources(){
    const box=root.querySelector('#omni-sources');
    box.innerHTML=(sources||[]).map(s=>`
      <div class="omni-settings-source">
        <div class="omni-color" style="background:${escapeAttr(s.accent||'#7c5cff')}"></div>
        <div style="min-width:0;flex:1;"><div style="font-size:11px;font-weight:800;">${escapeHtml(s.name)}</div><div style="font-size:9px;color:#7b8497;">${escapeHtml(s.description||'Independent source')}</div></div>
        <span class="omni-pill">${s.kind==='local'?'Built-in':'Connector'}</span>
      </div>
    `).join('');
  }

  sort.onchange=()=>load(false);
  q.addEventListener('input',()=>load(false));
  q.addEventListener('keydown',e=>{if(e.key==='Enter')load(false);});
  more.onclick=()=>load(true);

  root.querySelector('#omni-import-submit').onclick = async () => {
    const file = root.querySelector('#omni-file').files?.[0];
    const sourceName = root.querySelector('#omni-source-label').value.trim() || 'Local Cards';
    if (!file) { alert('Choose a character-card file first.'); return; }
    const button = root.querySelector('#omni-import-submit');
    button.disabled=true; button.textContent='Importing…';
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary='';
      const chunk=0x8000;
      for(let i=0;i<bytes.length;i+=chunk) binary += String.fromCharCode(...bytes.subarray(i,Math.min(i+chunk,bytes.length)));
      await request('IMPORT_FILE_BASE64',{base64:btoa(binary),fileName:file.name,sourceName,sourceId:'local'});
      close(importModal);
      root.querySelector('#omni-file').value='';
      // Refresh source spaces because the import may have created a new source label.
      const booted = await request('BOOT');
      sources = booted.sources || sources;
      renderSourcesBar();
      alert(`Imported "${file.name}" successfully.`);
      load(false);
    } catch(e) {
      alert(`Import failed: ${e.message}`);
    } finally {
      button.disabled=false; button.innerHTML=`${icon('import',14)} Import card`;
    }
  };

  (async function boot(){
    try {
      const booted=await request('BOOT');
      settings={...settings,...booted.settings};
      sources=booted.sources||[];
      renderSourcesBar();
      applyTheme();
      applyLayout();
      root.querySelector('#omni-tag-mode').value=settings.tagMode||'AND';
      await load(false);
    } catch(e) {
      grid.innerHTML=`<div class="omni-empty"><strong>Omni could not start</strong>${escapeHtml(e.message)}</div>`;
    }
  })();

  return () => {
    style?.();
    ctx.dom.cleanup?.();
  };
}
