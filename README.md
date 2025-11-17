# UnkleAyo — Minimal Svelte site inspired by nav.al

This is a small Svelte + Vite + Tailwind scaffold reproducing the simple, scroll-snap layout similar to nav.al, rebranded as "UnkleAyo". It's intentionally minimal and easy to maintain.

Quick start (PowerShell):

```powershell
cd 'c:/Users/User/Desktop/UncleAyo'
npm install
npm run dev
```

What you'll find:

- `index.html` — app mount point
- `src/App.svelte` — main layout with header and panels
- `src/styles.css` — Tailwind + custom CSS (scroll-snap, backdrop blur)
- `tailwind.config.cjs` / `postcss.config.cjs` — Tailwind setup

Notes:

- This implementation uses simple system fonts and CSS scroll-snap for vertical paging.
- Content is placeholder/structure only; replace the arrays in `App.svelte` with your real links and copy.
