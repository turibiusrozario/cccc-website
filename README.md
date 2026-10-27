# Cross Campus Climate Coalition (CCCC) website

Static site for GitHub Pages. No build step, no libraries.

## Preview on your computer
```
python3 -m http.server 8000
```
Open http://localhost:8000

## Edit content (no coding)

Events, projects, opportunities and resource links live in one Google Sheet:
https://docs.google.com/spreadsheets/d/1v0f15oX2hMHvlGN_7jc7v0zP8URpUCiP5l84xwDBo0k/edit
Add a row and the site shows it within about 5 minutes. Hover the red corner on each header cell for a hint.

| Column | What to put |
|---|---|
| `type` | `event`, `project`, `action` (petition, fellowship...) or `resource` (pick from the list) |
| `title` | Short name (required) |
| `start_date`, `end_date` | Real dates. Events: blank end = one day. Projects: blank end = ongoing. Actions: end = deadline, blank = open now |
| `time`, `place` | Free text |
| `summary` | Description. If filled, the card opens on click. New paragraph: Alt+Enter. Links: `[words to click](https://address)` |
| `link` | Web address. No summary + link = clicking opens the link in a new tab |
| `category` | Resources only: heading to group under |
| `publish` | Pick `no` to hide a row (draft). Blank = show |
| `last_day`, `shows_as` | Automatic. `shows_as` says where the row appears (Home, Past work, Resources, Hidden) |

Rules the site applies on its own (midnight, Eastern Time):
- An item moves to **Past work** the day after its end date (events with no end date: the day after the start date).
- Front page shows 3 per list. Happening-now items come first (soonest end first), then future items by start date. Extra items sit under "Show more".
- Row order is the tie-breaker.

## How the Sheet connects
Sheet > File > Share > Publish to web > Sheet1 as **CSV**. That link is `SHEET_CSV_URL` in `js/config.js`.
Google refreshes a published sheet about every 5 minutes. Open pages check every 5 minutes and show a "New content is available" bar.
If the Sheet cannot be reached, the site falls back to `data/content.csv` (a copy; update it occasionally via File > Download > CSV).

## Other edits
- About text, weekly meeting time, buttons: `index.html` (search for the words you want to change).
- Colors: top of `css/style.css`.
- Logo: `assets/logo.svg` (3 colors: #0F4C3A, #F5B700, white). Favicon: `assets/favicon.svg`.
- Display settings (text size, theme, spacing): `js/settings.js`. Saved per visitor, in their browser.
- Wording on the Home and Resources pages is copied from the 2026-09-03 one-pager. Edit it in `index.html` / `resources.html`.
