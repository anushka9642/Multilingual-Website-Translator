# Anchorpoint Registry Services — demo frontend

A 5-page demo React site (Vite + React Router), styled after the layout
pattern of a KYC/registry-services corporate site: sticky header with a
services mega-menu, hero with a stat row, a service register grid, a
group-links strip, and a policy-heavy footer.

**Content note:** this is a fictional company. Page copy was written
specifically for this demo, not copied from any live website — some
factual scaffolding (nav structure, the 11 service categories, the shape
of the About/Management pages) was inspired by a real KYC-registry
company's site, but sentences were rewritten from scratch, the company
name and staff are invented, and the disclaimer in the footer says so
too.

## Pages

- `/` — Home (hero + service grid preview)
- `/about` — About ARS (company background)
- `/services` — Services (all 11, full descriptions, deep-linkable via `#slug`)
- `/management` — Management (fictional leadership team)
- `/contact` — Contact (details + a demo-only form)

## Structure

```
frontend/
  index.html
  package.json
  vite.config.js
  src/
    main.jsx          entry point, router + global CSS
    App.jsx            layout shell + route table
    components/
      Header.jsx        utility bar, nav, services dropdown, mobile menu
      Footer.jsx         group links, contact, policy links
      ServiceIcon.jsx    icon-name -> lucide-react component lookup
    pages/
      Home.jsx
      About.jsx
      Services.jsx
      Management.jsx
      Contact.jsx
    data/
      services.js        the 11 services (single source of truth)
      site.js             nav config, footer links, management roster
    styles/
      global.css          full design system (tokens, layout, components)
```

## Run it

```bash
npm install
npm run dev       # local dev server
npm run build      # production build to dist/
```

## Notes

- Theme (light/dark) and font-scale are held in `App.jsx` state and
  passed down to `Header` — no browser storage is used.
- Service data lives in one file (`src/data/services.js`) so Home's
  preview grid and the full Services page never drift out of sync.
- Swap the placeholder office address / phone / email in `Footer.jsx`
  and `Contact.jsx` before using this for anything real.
