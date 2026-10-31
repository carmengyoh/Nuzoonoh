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