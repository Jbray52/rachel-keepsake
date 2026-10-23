# A little keepsake for Rachel

A mobile-first romantic keepsake site, designed for iPhone and installable from Safari. It includes a daily shuffled memory, relationship day count, monthly and milestone popups, countdown, daily reasons, open-when notes, dark mode, and an optional archive guide.

## No-subscription GitHub setup

1. Create a **public** GitHub repository for the site. GitHub Pages on GitHub Free requires a public repository, and the published site is public even when a paid plan allows a private repository.
2. Upload the contents of this folder to the repository root.
3. In repository **Settings > Pages**, publish from the `main` branch and `/ (root)` folder.
4. Add photo files to the repository root and memory entries in `memories.js`. Each commit is published automatically.
5. Put the published HTTPS address on the NFC tag.

The archive page (`admin.html`) explains how to add memories from GitHub's website. It does not require installing developer tools or using a backend service.

## Privacy

The passcode is a friendly screen, not secure access control. GitHub Pages sites are public on the internet; anyone with the website URL can retrieve the published files and photos. `noindex` asks search engines not to list the site but does not restrict access. Only post photos and details you are comfortable making public.

## Customize

Edit `memories.js` to add photo paths, captions, dates, tags, daily reasons, and notes. Put image files in the repository root. Keep each memory object comma-separated, as in this example:

```js
{ image: "first-date.jpg", caption: "Our first date", date: "October 26, 2024", tag: "the beginning" },
```

