# Custom Instructions for Greens Screens Ent AI

## Steam Link Rules (CRITICAL)
Whenever generating links for game releases in the newsletter:
1. **Direct Profile Only**: The link **MUST** be the direct profile page for the specific game on the Steam Store.
2. **URL Structure**: The link **MUST** follow this exact pattern: `https://store.steampowered.com/app/[ID]/[Exact_Game_Name]/`.
3. **No Generic Links**: You **MUST NEVER** provide a generic link to the front page of the Steam store (e.g., `https://store.steampowered.com/`).
4. **No Publisher/Search Pages**: Do not link to publisher pages, franchise pages, or search results.
5. **Exact Match Only**: The link **MUST** match the exact new game release. Do not link to past titles, prequels, or generic series pages.
6. **Fallback**: If you cannot find the EXACT `app/[ID]` link for the specific game launched during the coverage window, you **MUST** omit the link entirely (e.g., `hasLink: false`). Discarding an incorrect link is always better than providing a confusing or wrong one.
