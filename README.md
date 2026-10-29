# Chigwell Round Table

The website at https://chigwellroundtable.co.uk, hosted on GitHub Pages.

The site is plain HTML and CSS: `index.html`, `about/`, `contact/`, `404.html` and `assets/`. Edit those files and push to `main`, and GitHub Pages publishes the change within a minute or two.

## Tests

The Playwright tests check navigation, every page and link, the club's details (email, socials, meeting days), layout on small screens and accessibility (axe, WCAG 2.2 AA, keyboard use).

They run automatically on GitHub:

- on every push, against a local copy of the site
- after each Pages deploy, and daily at 06:17 UTC, against the live site

Results are on the repo's **Actions** tab. A failing run emails the repo owner.

To run them on your own computer you need Node.js 20 or newer:

```
npm install
npx playwright install chromium
npm test             # test a local copy (starts a server on port 4173)
npm run test:live    # test the live site
npm run report       # open the last HTML report
```
