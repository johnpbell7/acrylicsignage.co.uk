# Acrylic Signage — landing page

A static, dependency-free landing page for **acrylicsignage.co.uk**. Pure HTML/CSS/JS, ready to push to Git and deploy to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

Design is a warm, editorial reskin in the spirit of oaklystore.com — natural paper tones, Fraunces display serif, a single terracotta accent, generous whitespace, and slow scroll reveals. Tuned for a sign studio rather than furniture.

## Structure

```
index.html              The whole page
assets/css/styles.css   Design system + all section styles
assets/js/main.js       Nav, scroll reveals, app tabs, form handler
assets/icons/icons.js     Small UI line-icons (acrylic, dibond, corex, ticks, arrows)
assets/icons/scenes.js    Larger signage scene icons for the "What we make" block
```

No build step. Open `index.html` or serve the folder:

```bash
npx serve .          # or: python3 -m http.server
```

## Connecting the form to GoHighLevel

The enquiry form (`#enquiryForm`) is built to wire straight into GHL. Pick one:

**Option A — Inbound webhook (recommended for this coded site)**
1. In GHL, create a workflow with an **Inbound Webhook** trigger.
2. Copy its URL.
3. Paste it into `GHL_WEBHOOK_URL` near the top of the form section in `assets/js/main.js`.

The form POSTs this JSON:
```json
{ "name", "email", "phone", "sign_type", "details", "source", "submitted_at" }
```
Map those fields to contact fields / a pipeline opportunity inside the workflow.

**Option B — GHL native form embed**
Replace the entire `<form id="enquiryForm">…</form>` block in `index.html` with the iframe GHL gives you. You can then delete the form handler in `main.js`.

**Demo mode:** with `GHL_WEBHOOK_URL` left blank, the form validates and shows the success state without sending — handy for previewing before you go live.

## Order flow → Tubbyprint

This page only captures the lead/enquiry. The production order (artwork upload, proofing, fulfilment) is handled in your existing **tubbyprint.co.uk** admin. Suggested handoff: the GHL workflow notifies you of a new enquiry, you reply with options + price, and on acceptance the job is raised in the Tubbyprint admin. The two systems stay decoupled — GHL owns the lead/automation, Tubbyprint owns the order.

## Editing content

- **Copy / sections:** all in `index.html`, plain text.
- **Colours / type / spacing:** CSS variables at the top of `styles.css` (`--paper`, `--ink`, `--accent`, fonts, spacing rhythm).
- **Icons:** add or tweak SVGs in `icons.js`, then reference with `data-icon="name"` on any element.
- **Materials:** the Dibond / Corex / Foamex cards are in the `#materials` section if you want to add or reorder material types.

## Notes / before launch

- Replace the `https://picsum.photos/...` placeholder images (hero visual is CSS-drawn; the statement section uses 3 photos) with real product/workshop shots. Update the `og:image` meta tag too.
- Wire the footer `#privacy` / `#terms` links to real pages.
- `hello@acrylicsignage.co.uk` is used as the fallback contact throughout — change if needed.
