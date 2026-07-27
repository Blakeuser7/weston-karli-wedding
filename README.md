# Weston & Karli Wedding Website

A responsive, minimal wedding website designed for GitHub Pages. RSVP buttons now open a public Google Form, so no Google Apps Script or custom RSVP backend is required.

## Current design

- Ivory, navy, peach, blue, and greenery color palette
- Transparent watercolor bouquet PNG
- Mobile-responsive navigation
- Wedding countdown
- Our Story
- Wedding details
- Travel
- Things to do
- Photo gallery
- Registry
- FAQ
- Google Forms RSVP link

The Wedding Party tab and section have been removed.

## Add your Google Form RSVP link

Create or open your RSVP form in Google Forms.

1. Click **Send** in the upper-right corner.
2. Select the **link** icon.
3. Optionally select **Shorten URL**.
4. Click **Copy**.
5. Open:

```text
js/wedding-config.js
```

6. Find:

```javascript
formUrl: "PASTE_GOOGLE_FORM_LINK_HERE"
```

7. Replace it with the complete link:

```javascript
formUrl: "https://forms.gle/YOUR_FORM_LINK"
```

All RSVP buttons update automatically and open the form in a new tab.

## Edit wedding information

Open:

```text
js/wedding-config.js
```

This file controls the couple names, wedding date, city, venue, event times, RSVP deadline, Google Form URL, map, hotel, registry, FAQ, and contact email.

When the website is ready for guests, change:

```javascript
setupMode: true
```

to:

```javascript
setupMode: false
```

## Bouquet image

The site now uses the transparent PNG:

```text
assets/images/bouquet-watercolor.png
```

The old SVG bouquet has been removed. To replace it later, upload another transparent PNG using the same filename.

## Upload the updated version to GitHub

Upload the extracted contents to the top level of the repository. The root should contain:

```text
index.html
404.html
README.md
css/
js/
assets/
```

The custom RSVP files are no longer included:

```text
rsvp.html
js/rsvp.js
google-apps-script/
```

Commit the files to `main`; GitHub Pages will rebuild automatically.

## Test before sharing

Confirm that:

- The PNG bouquet appears.
- Wedding Party is absent from the menu and page.
- Each RSVP button opens the Google Form.
- The Google Form accepts a test response.
- The website works on mobile.
