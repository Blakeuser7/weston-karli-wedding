# Weston & Karli Wedding Website

A responsive wedding website designed for free GitHub Pages hosting, with a private Google Sheets RSVP system powered by Google Apps Script.

## What is included

- Minimal ivory and navy visual design
- Watercolor bouquet SVG
- Responsive desktop and mobile navigation
- Home, story, details, travel, things to do, photos, wedding party, registry, FAQ, and RSVP sections
- Replaceable image placeholders
- Wedding countdown
- Household invitation-code validation
- Maximum guest-count enforcement
- Duplicate RSVP updates
- Google Sheets storage
- Honeypot spam protection
- Mobile-friendly RSVP form

## 1. Preview the site locally

Open `index.html` in a browser.

The RSVP form will remain in setup mode until you add the deployed Apps Script URL.

For the most accurate preview, use a small local server:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## 2. Edit wedding details

Open:

```text
js/wedding-config.js
```

This file controls:

- Couple names
- Wedding date
- City
- Venue
- Ceremony and reception times
- RSVP deadline
- Map link
- Hotel information
- Registry links
- FAQ details
- Contact email
- Google Apps Script endpoint

When the content is ready for guests, set:

```javascript
setupMode: false
```

That hides the small photo-replacement labels.

## 3. Replace photos

The easiest method is to keep the existing filenames.

Replace each SVG placeholder in `assets/images/` with a JPG, PNG, WebP, or SVG image using the same filename reference, or update the filename in `index.html`.

### Recommended dimensions

| Current placeholder | Recommended replacement |
|---|---:|
| `hero-placeholder.svg` | 1800 × 1200 px |
| `story-placeholder-1.svg` | 1200 × 1500 px |
| `story-placeholder-2.svg` | 1200 × 1500 px |
| `venue-placeholder.svg` | 1400 × 1700 px |
| `gallery-01.svg` through `gallery-06.svg` | At least 1200 px on the long edge |
| `party-placeholder-1.svg` through `party-placeholder-4.svg` | 1000 × 1250 px |

Example:

1. Rename your engagement photo `hero-photo.jpg`.
2. Place it in `assets/images/`.
3. Change this line in `index.html`:

```html
<img src="assets/images/hero-placeholder.svg" ...>
```

to:

```html
<img src="assets/images/hero-photo.jpg" ...>
```

The CSS uses `object-fit: cover`, so images will crop cleanly within the existing layout.

## 4. Create the private RSVP spreadsheet

Create a blank Google Sheet named something like:

```text
Weston and Karli Wedding RSVPs
```

Keep the spreadsheet private.

Copy the spreadsheet ID from its URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

Only copy the section between `/d/` and `/edit`.

## 5. Install the Apps Script backend

Inside the Google Sheet:

1. Open **Extensions → Apps Script**.
2. Replace the example code with `google-apps-script/Code.gs`.
3. Replace:

```javascript
SPREADSHEET_ID: "PASTE_GOOGLE_SHEET_ID_HERE"
```

with the ID from your Sheet.
4. Confirm the RSVP deadline and time zone in `SETTINGS`.
5. Save.
6. Select `setupSheets` from the function menu.
7. Select **Run** and approve the requested Google permissions.

This creates:

- `Guest List`
- `RSVP Responses`

## 6. Add invitation codes

In the `Guest List` tab, add one row per household.

| Invitation Code | Household Name | Maximum Guests | Plus One Allowed | Notes |
|---|---|---:|---|---|
| BLAKE104 | Blake Household | 2 | No | |
| SMITH228 | Smith Household | 4 | Yes | Two children invited |

Use codes that are not obvious or sequential.

The guest list remains inside your private Sheet and is never downloaded by the public website.

## 7. Deploy the Apps Script

In Apps Script:

1. Select **Deploy → New deployment**.
2. Select the gear icon and choose **Web app**.
3. Set **Execute as** to yourself.
4. Set access so invited guests can reach the web app without signing into your Google account.
5. Deploy and approve permissions.
6. Copy the Web App URL.

Paste the URL into:

```text
js/wedding-config.js
```

Example:

```javascript
endpoint: "https://script.google.com/macros/s/DEPLOYMENT_ID/exec"
```

Use the `/exec` deployment URL, not the testing `/dev` URL.

### Updating the script later

When changing `Code.gs`, create or update the deployment version in Apps Script. Editing the code alone may not update the live web app.

## 8. Test the RSVP workflow

Before sharing the website, test:

- Valid attending response
- Valid decline
- Incorrect invitation code
- Guest count above the household limit
- Duplicate submission using the same code
- Missing required field
- Invalid email
- Mobile browser submission
- A response after the deadline, using a temporary past deadline
- Whether the correct row is added or updated in the Sheet

Delete test responses before launch.

## 9. Upload to GitHub

Create a public repository named:

```text
weston-karli-wedding
```

Upload the contents of this folder, not the ZIP file itself.

The repository root should contain:

```text
index.html
rsvp.html
css/
js/
assets/
google-apps-script/
README.md
```

## 10. Enable GitHub Pages

In the repository:

1. Open **Settings**.
2. Open **Pages**.
3. Select **Deploy from a branch**.
4. Select the `main` branch.
5. Select the `/root` folder.
6. Save.

Your temporary address will follow this pattern:

```text
https://YOUR-USERNAME.github.io/weston-karli-wedding/
```

## Privacy notes

- Do not place guest addresses, phone numbers, or the guest list in the GitHub repository.
- Do not publish the Google Sheet.
- Do not place Google passwords, account credentials, or private keys in the repository.
- The Apps Script URL is an endpoint, not a password, but the backend must still validate each invitation code.
- Only collect RSVP information you actually need.

## Files most likely to be edited

```text
js/wedding-config.js
index.html
rsvp.html
assets/images/
google-apps-script/Code.gs
```
