# Nuzo Onoh Portfolio

Homepage and small Node.js backend. Edit `data/portfolio.json` to update the author details, books, upcoming releases, news, recognition, and newsletter copy.

## Run

Requires Node.js 18 or newer. Start the server with:

```sh
npm start
```

The site runs at `http://localhost:3000` by default. Set `PORT` to use a different port.

## Endpoints

- `GET /api/health` returns the server status.
- `GET /api/content` returns all editable homepage content from the JSON file.

Book-cover and news-image areas are intentionally placeholders for assets to be supplied later. The homepage navigation currently links to sections on the homepage.
## Automatic Latest News

The Pages workflow refreshes the exact-name Google News RSS search for `"Nuzo Onoh"` before building, including a scheduled run every six hours. It displays original headlines, publication names, dates and outbound links, without AI summaries or article text. Twelve deduplicated results are stored in the build; the homepage initially shows three. The lead story always uses a provided image, currently the Sally-Mae cover as a fallback.

Run `node scripts/update-news.js` to refresh the local saved data. A failed refresh preserves the checked-in articles. Scheduled builds do not commit their refreshed snapshot back into the repository. Feed availability and coverage are best-effort. GitHub can delay scheduled runs, and disables public-repository schedules after 60 days without repository activity; re-enable the workflow in Actions if that happens.
