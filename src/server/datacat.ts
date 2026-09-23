let cachedSessionToken: string | null = null;
let tokenExpiresAt = 0;

export async function getDatacatSessionToken(): Promise<string> {
  const now = Date.now();
  if (cachedSessionToken && now < tokenExpiresAt) {
    return cachedSessionToken;
  }

  try {
    const res = await fetch('https://datacat.run/api/liberator/identify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'OmniCharacterHub/2.0',
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      throw new Error(`Failed to identify with Datacat: ${res.statusText}`);
    }

    const data = await res.json();
    if (data.sessionToken) {
      cachedSessionToken = data.sessionToken;
      // Expire in 6 hours
      tokenExpiresAt = now + 6 * 60 * 60 * 1000;
      return cachedSessionToken!;
    }
  } catch (err) {
    console.warn('[Datacat] Session token acquisition error:', err);
  }

  return cachedSessionToken || '';
}

export async function searchDatacatCharacters(params: {
  search?: string;
  limit?: number;
  offset?: number;
  tagIds?: string;
  sort?: string;
}) {
  const token = await getDatacatSessionToken();
  const limit = params.limit || 30;
  const offset = params.offset || 0;
  const search = params.search ? encodeURIComponent(params.search) : '';
  const tagIds = params.tagIds ? encodeURIComponent(params.tagIds) : '';

  let url = `https://datacat.run/api/characters/recent-public?limit=${limit}&offset=${offset}&summary=1&skipCount=1`;
  if (search) url += `&search=${search}`;
  if (tagIds) url += `&tagIds=${tagIds}`;
  if (params.sort) url += `&sort=${encodeURIComponent(params.sort)}`;

  const res = await fetch(url, {
    headers: {
      'X-Session-Token': token,
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!res.ok) {
    throw new Error(`Datacat search failed: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

export async function getDatacatCharacter(id: string) {
  const token = await getDatacatSessionToken();
  const res = await fetch(`https://datacat.run/api/characters/${encodeURIComponent(id)}`, {
    headers: {
      'X-Session-Token': token,
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!res.ok) {
    throw new Error(`Datacat character retrieval failed: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}

export async function getDatacatTaxonomy() {
  const token = await getDatacatSessionToken();
  try {
    const [facetsRes, tagsRes] = await Promise.all([
      fetch('https://datacat.run/api/tag-taxonomy/facets', {
        headers: { 'X-Session-Token': token },
      }),
      fetch('https://datacat.run/api/tag-taxonomy/tags', {
        headers: { 'X-Session-Token': token },
      }),
    ]);

    const facets = facetsRes.ok ? await facetsRes.json() : null;
    const tags = tagsRes.ok ? await tagsRes.json() : null;

    return { facets, tags };
  } catch (err) {
    console.warn('[Datacat] Failed to load taxonomy:', err);
    return null;
  }
}
