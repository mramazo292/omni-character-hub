# Omni Character Hub — 2.0 rebuild

This rebuild focuses on the problems in the original extension:

- **No cross-source contamination:** source identity is stored on every imported character and library query. A source never falls back to another catalog.
- **Persistent preferences:** theme, density, view mode, page size, tag matching, favorite ordering, and display options are stored per user.
- **Real facets:** tags are derived from the current character library instead of a hard-coded global list. Filters support AND/OR matching.
- **Reliable deduplication:** each library item is keyed by its Lumiverse character ID; source provenance is kept in the extension namespace.
- **Source spaces:** every imported source label gets its own library space, filterable independently.
- **Better detail page:** dedicated inspector with description, personality, scenario, greetings, examples, notes, tags, favorite, and delete actions.
- **Better search UI:** keyboard-friendly search, tag chips, responsive grid/list mode, progressive loading, skeletons, and empty/error states.
- **Safer import flow:** imports standard character-card files through Lumiverse's character API and records provenance.
- **SFW-only core:** this version intentionally does not provide mature-content discovery, filters, or site-specific adapters for adult catalogs.

## Important architecture change

The old backend bundled provider logic together and, when a provider API failed, silently queried a different catalog. That is why a source tab could show characters from another website.

The 2.0 core instead treats source identity as data:

```text
sourceId
sourceName
imported_at
original_file
```

and stores those values in:

```text
character.extensions["omni_character_hub"]
```

That namespace follows Lumiverse's extension-data guidance and survives normal character reads/updates.

## Install

Lumiverse can install an extension directly from a GitHub repository. The manifest points to:

- `dist/backend.js`
- `dist/frontend.js`

The current version requires Lumiverse 1.0+.

## Local card import

Open **Omni → Import**, choose a `.json`, `.png`, or `.charx` character-card file, and enter a source label such as `My Archive`. The imported card remains a normal Lumiverse character; Omni only adds its own provenance metadata.

The backend uses the documented `spindle.characters.create()`, `get()`, `list()`, `update()`, `delete()`, and `importFile()` surfaces.

## Connector boundary

A network/source adapter should be implemented as an isolated adapter that returns Omni's canonical shape:

```js
{
  id,
  sourceId,
  sourceName,
  name,
  creator,
  description,
  tags,
  updatedAt,
  createdAt
}
```

The UI must never infer a source from an ID format or silently substitute another adapter on failure.

Any future connector should preserve this rule:

1. Search only its own upstream.
2. Normalize into the canonical shape.
3. Keep the connector's source ID.
4. Never fall back to another website.
5. Preserve original tags/categories as source-specific metadata.
6. Reject an upstream error instead of displaying unrelated data.

## Validation

The shipped `dist/` files are plain JavaScript ES modules with no runtime dependency bundle.

This repository intentionally does not promise that every external website can be imported automatically: each site has its own API, terms, card format, and availability. Adding a connector requires verifying that site's current public interface and handling its own failure modes independently.
