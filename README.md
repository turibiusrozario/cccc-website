# Cross Campus Climate Coalition (CCCC) website

Static site for GitHub Pages. No build step, no libraries.

## Preview on your computer
```
python3 -m http.server 8000
```
Open http://localhost:8000

## Edit content (no coding)

Events, projects, opportunities and resource links live in one table.
Until the Google Sheet is connected, the table is `data/content.csv` (opens in any spreadsheet app).

| Column | What to put |
|---|---|
| `type` | `event`, `project`, `action` (petition, fellowship...) or `resource` |
| `title` | Short name (required) |
| `start_date`, `end_date` | `YYYY-MM-DD`. Events: end is optional. Projects: blank end = ongoing. Actions: end = deadline, blank = open now |
| `time` | Free text, e.g. `2 PM to 4 PM` |
| `place` | Free text |
| `summary` | Description. If filled, the item expands on click |
| `link` | Web address. No summary + link = clicking opens the link in a new tab |
| `category` | Resources only: heading to group under |
| `publish` | Type `no` to hide a row (draft). Blank = show |

Rules the site applies on its own (midnight, Eastern Time):
- An item moves to **Past work** the day after its end date (events with no end date: the day after the start date).
- Front page shows 3 per list. Happening-now items come first (soonest end first), then future items by start date. Extra items sit under "Show more".
- Row order is the tie-breaker.

## Connect the Google Sheet
1. Make a Google Sheet with the header row above (first row, same names) and paste in `data/content.csv`.
2. Format the date columns as plain text or `yyyy-mm-dd`.
3. File > Share > Publish to web > choose the tab, format **Comma-separated values (.csv)** > Publish. Copy the link.
4. Paste it in `js/config.js` as `SHEET_CSV_URL`, commit, push.
5. Google refreshes published sheets about every 5 minutes. Open pages check every 5 minutes and show a "New content is available" bar.

If the sheet cannot be reached, the site falls back to `data/content.csv`.

## Other edits
- About text, weekly meeting time, buttons: `index.html` (search for the words you want to change).
- Colors: top of `css/style.css`.
- Logo: `assets/logo.svg` (3 colors: #0F4C3A, #F5B700, white). Favicon: `assets/favicon.svg`.
- Access notes: `accessibility.html`.
