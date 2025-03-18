This is a forked version of [EmailBuilder.js](https://github.com/usewaypoint/email-builder-js).

It adapts the email-builder to our needs.

Relevant code changes are in `packages/editor-sample`.
To build a dist package, run `npm run build:editor`. This will call `npm run build` in the `packages/editor-sample` directory.

To develop run `npm run dev`.

Use `standalone.html` to test your changes with the bundled editor. For that either open it directly in a browser or run the devserver and visit `/standalone.html`

# TLDR

```bash
git clone git@github.com:tixity/email-builder-js.git
cd email-builder-js
git checkout tixity-changes
cd packages/editor-sample
npm i
npm run build
```