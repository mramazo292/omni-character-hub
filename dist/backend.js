const EXT = 'omni_character_hub';

async function httpFetch(url, options = {}) {
  const headers = { Accept: 'application/json, text/plain, */*', ...(options.headers || {}) };
  if (typeof spindle !== 'undefined' && typeof spindle.cors === 'function') {
    try {
      const r = await spindle.cors(url, { ...options, headers });
      if (r?.body) {
        if (typeof r.body === 'string') { try { return JSON.parse(r.body); } catch { return r.body; } }
        return r.body;
      }
    } catch (e) { spindle.log?.warn?.(`Omni ${url}: ${e.message}`); }
  }
  const r = await fetch(url, { ...options, headers });
  const t = await r.text();
  try { return JSON.parse(t); } catch { return t; }
}

const tokenEstimate = s => s ? Math.round(String(s).length / 3.8) : 0;

const Chub = {
  id: 'chub', name: 'Chub.ai',
  sorts: ['download_count','star_count','last_activity_at','created_at'],
  async search({query='',page=1,sort='download_count',tag=''}) {
    const p = new URLSearchParams({search:query,first:'24',page:String(page),sort,venus:'false',asc:'false'});
    if (tag) p.set('topics', tag);
    const d = await httpFetch(`https://api.chub.ai/search?${p}`);
    const nodes = d?.data?.nodes || d?.nodes || [];
    return nodes.map(c => ({source:'chub', id:c.fullPath, name:c.name||'Unnamed', creator:c.fullPath?.split('/')[0]||'Unknown', avatarUrl:`https://avatars.charhub.io/avatars/${c.fullPath}/avatar.webp`, tagline:c.tagline||c.description?.slice(0,120)||'', tags:c.topics||[], stats:{downloads:c.download_count||0,stars:c.star_count||0,tokens:c.token_count||0}}));
  },
  async details(id) {
    const nodeRes = await httpFetch(`https://api.chub.ai/api/characters/${id}?full=true`);
    const node = nodeRes?.node || nodeRes || {};
    let card = {};
    try { const r = await httpFetch('https://api.chub.ai/api/characters/download',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fullPath:id,format:'tavern'})}); card = r?.data || r || {}; } catch {}
    return {source:'chub', id, name:card.name||node.name||'Unnamed', creator:id.split('/')[0]||'Unknown', avatarUrl:`https://avatars.charhub.io/avatars/${id}/avatar.webp`, summary:node.description||node.tagline||'', tags:node.topics||card.tags||[], first_mes:card.first_mes||node.first_mes||'', alternate_greetings:card.alternate_greetings||[], description:card.description||'', personality:card.personality||node.personality||'', scenario:card.scenario||node.scenario||'', mes_example:card.mes_example||'', creator_notes:card.creator_notes||card.extensions?.creator_notes||'', system_prompt:card.system_prompt||'', stats:{downloads:node.download_count||0,stars:node.star_count||0,tokens:node.token_count||tokenEstimate((card.description||'')+(card.personality||''))}};
  },
  async import(id) { return httpFetch('https://api.chub.ai/api/characters/download',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fullPath:id,format:'tavern'})}); }
};

const JannyAI = {
  id:'janny', name:'Janny AI',
  sorts:['trending','popular','recent'],
  extractId(v){ const m=String(v).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i); return m?.[0]||String(v).trim(); },
  async search({query='',page=1,sort='trending',tag=''}) {
    const p = new URLSearchParams({page:String(page),sort,search:query}); if(tag)p.set('tags',tag);
    const d = await httpFetch(`https://janitorai.com/hampter/characters?${p}`);
    const items = Array.isArray(d?.data)?d.data:Array.isArray(d)?d:[];
    return items.map(c=>({source:'janny',id:c.id,name:c.name||'Unnamed',creator:c.creator_name||c.author||'Janny AI Creator',avatarUrl:c.avatar?.startsWith('http')?c.avatar:`https://ella.janitorai.com/bot-avatars/${c.avatar}`,tagline:c.description||c.personality?.slice(0,120)||'',tags:Array.isArray(c.tags)?c.tags:[],stats:{chats:c.stats?.chat||c.chat_count||0,favorites:c.stats?.favorite||0,tokens:c.tokens||0}}));
  },
  async details(id) {
    const uuid=this.extractId(id), d=await httpFetch(`https://janitorai.com/hampter/characters/${uuid}`), c=d?.character||d||{};
    return {source:'janny',id:uuid,name:c.name||'Unnamed',creator:c.creator_name||c.author||'Janny AI Creator',avatarUrl:c.avatar?.startsWith('http')?c.avatar:`https://ella.janitorai.com/bot-avatars/${c.avatar}`,summary:c.description||'',tags:Array.isArray(c.tags)?c.tags:[],first_mes:c.first_message||'',alternate_greetings:Array.isArray(c.first_messages)?c.first_messages:[],description:c.description||'',personality:c.personality||'',scenario:c.scenario||'',mes_example:c.example_dialogs||'',creator_notes:c.creator_notes||'',system_prompt:'',stats:{chats:c.stats?.chat||0,favorites:c.stats?.favorite||0,tokens:c.tokens||tokenEstimate((c.personality||'')+(c.first_message||''))}};
  },
  async import(id){ const uuid=this.extractId(id); const d=await httpFetch('https://api.jannyai.com/api/v1/download',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({characterId:uuid})}); if(!d?.downloadUrl)throw new Error('Janny AI did not return a character-card download.'); const r=await fetch(d.downloadUrl); return {rawPngBuffer:await r.arrayBuffer()}; }
};

const Datacat = {
  id:'datacat',name:'Datacat',sorts:['fresh','popular'],
  async search({query='',page=1,sort='fresh',tag=''}) {
    const term=[query,tag].filter(Boolean).join(' ');
    const endpoint=term?`https://datacat.run/api/client/v1/characters?search=${encodeURIComponent(term)}&page=${page}`:`https://datacat.run/api/client/v1/fresh?page=${page}`;
    const d=await httpFetch(endpoint,{headers:{'X-Datacat-Client-Id':'datacat_client_v1'}});
    const items=Array.isArray(d)?d:(d?.characters||d?.items||d?.nodes||d?.data||[]);
    return Array.isArray(items)?items.map(c=>({source:'datacat',id:c.id,name:c.name||'Unnamed',creator:c.creator?.name||c.creator||'Datacat Creator',avatarUrl:`https://datacat.run/api/client/v1/characters/${c.id}/avatar`,tagline:c.summary||c.tagline||c.description?.slice(0,120)||'',tags:Array.isArray(c.tags)?c.tags:[],stats:{kudos:c.kudos||c.downloads||0,tokens:c.token_count||0}})):[];
  },
  async details(id){ const d=await httpFetch(`https://datacat.run/api/client/v1/characters/${id}/card`,{headers:{'X-Datacat-Client-Id':'datacat_client_v1'}}); const c=d?.data||d||{}; return {source:'datacat',id,name:c.name||'Unnamed',creator:c.creator||'Datacat Creator',avatarUrl:`https://datacat.run/api/client/v1/characters/${id}/avatar`,summary:c.creator_notes||c.description?.slice(0,240)||'',tags:c.tags||[],first_mes:c.first_mes||'',alternate_greetings:c.alternate_greetings||[],description:c.description||'',personality:c.personality||'',scenario:c.scenario||'',mes_example:c.mes_example||'',creator_notes:c.creator_notes||'',system_prompt:c.system_prompt||'',stats:{kudos:c.kudos||0,tokens:tokenEstimate((c.description||'')+(c.personality||'')+(c.first_mes||''))}}; },
  async import(id){ return httpFetch(`https://datacat.run/api/client/v1/characters/${id}/card`,{headers:{'X-Datacat-Client-Id':'datacat_client_v1'}}); }
};

const providers={chub:Chub,janny:JannyAI,datacat:Datacat};
const normalize=(raw,source)=>raw?.data||raw||{};

spindle.onFrontendMessage(async(msg,userId)=>{
  const {action,provider='chub',payload={},requestId}=msg||{};
  try{
    const p=providers[provider]; if(!p)throw new Error(`Unknown provider: ${provider}`);
    if(action==='SEARCH'){ const results=await p.search(payload); return spindle.sendToFrontend({type:'SEARCH_RESULT',requestId,results:{characters:results,source:provider}},userId); }
    if(action==='GET_DETAILS'){ const details=await p.details(payload.id); return spindle.sendToFrontend({type:'DETAILS_RESULT',requestId,details},userId); }
    if(action==='IMPORT'){ const raw=await p.import(payload.id); let name='Character'; if(raw?.rawPngBuffer){const x=await spindle.characters.importFile(raw.rawPngBuffer);name=x?.name||name;} else {const d=normalize(raw,provider); const x=await spindle.characters.create({name:d.name||'Imported Character',description:d.description||'',personality:d.personality||'',scenario:d.scenario||'',first_mes:d.first_mes||'',mes_example:d.mes_example||'',creator_notes:d.creator_notes||'',system_prompt:d.system_prompt||'',post_history_instructions:d.post_history_instructions||'',tags:Array.isArray(d.tags)?d.tags:[],alternate_greetings:Array.isArray(d.alternate_greetings)?d.alternate_greetings:[],creator:d.creator||p.name,extensions:{[EXT]:{source:provider,sourceId:payload.id,sourceName:p.name,sourceUrl:payload.url||''}}}); name=x?.name||d.name||name;} return spindle.sendToFrontend({type:'IMPORT_SUCCESS',requestId,characterName:name,source:provider},userId); }
    throw new Error('Unknown action');
  }catch(e){ spindle.sendToFrontend({type:'ERROR',requestId,error:e?.message||'Operation failed'},userId); }
});
