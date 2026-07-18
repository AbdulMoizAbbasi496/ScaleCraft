# ScaleCraft

ScaleCraft is an educational System Design Mentor. Upload source files or a ZIP archive, then get focused suggestions about how the architecture could scale better.

## What is included

- Express API on port `3000`
- Lightweight structural code parser that keeps raw source code out of the Gemini prompt
- Gemini integration using `gemini-1.5-flash`
- Next.js + Tailwind dashboard on port `3001`
- Drag-and-drop source-file and ZIP upload
- Interactive file tree and side-by-side code guidance

## Before your first run

1. Install Node.js 18.17 or later.
2. Create a Google AI Studio API key with access to Gemini.
3. Copy `.env.example` to `.env`, then replace `your_gemini_api_key_here` with your real key.
4. In a second terminal, copy `frontend/.env.local.example` to `frontend/.env.local`. The default API URL is already correct for local use.

## Run the app

Install the API packages from the project root:

```powershell
npm install
```

Install the dashboard packages:

```powershell
cd frontend
npm install
```

Start the API from the project root:

```powershell
npm run dev:api
```

Start the dashboard from another terminal, also from the project root:

```powershell
npm run dev:web
```

Open `http://localhost:3001` in your browser.

## How to use it

1. Drop code files or a ZIP file into the left panel.
2. Wait for the structural review to finish.
3. Select orange-marked files to read an explanation and compare the current code with a suggested direction.

## Configuration notes

- `GEMINI_API_KEY` is required. Never commit `.env` or `.env.local`.
- `CORS_ORIGIN` defaults to `http://localhost:3001`. Change it before hosting the dashboard elsewhere.
- `NEXT_PUBLIC_API_URL` defaults to `http://localhost:3000`. Change it to your hosted API address for deployment.
- The API accepts up to 100 text files and rejects any single file larger than 500 KB. Binary files inside ZIPs are ignored.

## Verification

```powershell
npm test
cd frontend
npm run build
```
