/**
 * WESTON & KARLI WEDDING RSVP BACKEND
 *
 * SETUP:
 * 1. Create a private Google Sheet.
 * 2. Open Extensions > Apps Script.
 * 3. Paste this file into Code.gs.
 * 4. Replace SPREADSHEET_ID below.
 * 5. Run setupSheets() once and approve permissions.
 * 6. Add households to the "Guest List" tab.
 * 7. Deploy as a Web App that executes as you.
 * 8. Paste the deployment URL into js/wedding-config.js.
 */

const SETTINGS = {
  SPREADSHEET_ID: "PASTE_GOOGLE_SHEET_ID_HERE",
  RESPONSES_SHEET: "RSVP Responses",
  GUESTS_SHEET: "Guest List",
  TIME_ZONE: "America/New_York",
  RSVP_DEADLINE: "2027-04-01",
  ENABLE_GUEST_CODE_VALIDATION: true,
  DEFAULT_MAX_GUESTS: 2
};

const RESPONSE_HEADERS = [
  "Submitted At",
  "Updated At",
  "Invitation Code",
  "Household Name",
  "Primary Guest",
  "Email",
  "Attending",
  "Guest Count",
  "Additional Guests",
  "Meal Choice",
  "Dietary Restrictions",
  "Song Request",
  "Notes",
  "Status"
];

const GUEST_HEADERS = [
  "Invitation Code",
  "Household Name",
  "Maximum Guests",
  "Plus One Allowed",
  "Notes"
];

function doGet() {
  return jsonResponse_({
    ok: true,
    message: "Wedding RSVP service is running."
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(20000);

    const payload = parsePayload_(e);

    // Honeypot: normal guests never see or fill this field.
    if (clean_(payload.website)) {
      return jsonResponse_({ ok: true, message: "Response received." });
    }

    const validation = validatePayload_(payload);
    if (!validation.ok) {
      return jsonResponse_(validation);
    }

    const spreadsheet = openSpreadsheet_();
    const responseSheet = getOrCreateSheet_(
      spreadsheet,
      SETTINGS.RESPONSES_SHEET,
      RESPONSE_HEADERS
    );
    const guestSheet = getOrCreateSheet_(
      spreadsheet,
      SETTINGS.GUESTS_SHEET,
      GUEST_HEADERS
    );

    const invitationCode = normalizeCode_(payload.invitationCode);
    const guestRecord = findGuestRecord_(guestSheet, invitationCode);

    if (SETTINGS.ENABLE_GUEST_CODE_VALIDATION && !guestRecord) {
      return jsonResponse_({
        ok: false,
        message: "We could not find that invitation code. Please check the code and try again."
      });
    }

    const maxGuests = guestRecord
      ? Number(guestRecord.maximumGuests || SETTINGS.DEFAULT_MAX_GUESTS)
      : SETTINGS.DEFAULT_MAX_GUESTS;

    const attending = clean_(payload.attending);
    const guestCount = attending === "Yes" ? Number(payload.guestCount || 1) : 0;

    if (!Number.isInteger(guestCount) || guestCount < 0 || guestCount > maxGuests) {
      return jsonResponse_({
        ok: false,
        message:
          "The selected guest count is greater than the number reserved for this invitation. " +
          "Please correct the count or contact the couple."
      });
    }

    const now = new Date();
    const timestamp = Utilities.formatDate(
      now,
      SETTINGS.TIME_ZONE,
      "yyyy-MM-dd HH:mm:ss"
    );

    const rowValues = [
      timestamp,
      timestamp,
      invitationCode,
      guestRecord ? guestRecord.householdName : "",
      clean_(payload.primaryGuest),
      clean_(payload.email).toLowerCase(),
      attending,
      guestCount,
      attending === "Yes" ? clean_(payload.additionalGuests) : "",
      attending === "Yes" ? clean_(payload.mealChoice) : "",
      attending === "Yes" ? clean_(payload.dietaryRestrictions) : "",
      clean_(payload.songRequest),
      clean_(payload.notes),
      "Current"
    ];

    const existingRow = findExistingResponseRow_(responseSheet, invitationCode);

    if (existingRow) {
      // Preserve original submission time, but update all other response fields.
      const originalSubmittedAt = responseSheet.getRange(existingRow, 1).getValue();
      rowValues[0] = originalSubmittedAt || timestamp;
      responseSheet
        .getRange(existingRow, 1, 1, rowValues.length)
        .setValues([rowValues]);

      return jsonResponse_({
        ok: true,
        message: "Your existing RSVP has been updated."
      });
    }

    responseSheet.appendRow(rowValues);

    return jsonResponse_({
      ok: true,
      message: attending === "Yes"
        ? "Your RSVP has been received. We cannot wait to celebrate with you!"
        : "Your response has been received. We will miss you and appreciate your reply."
    });
  } catch (error) {
    console.error(error);
    return jsonResponse_({
      ok: false,
      message: "A server error occurred while saving the RSVP. Please try again."
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (_) {
      // Lock may not have been acquired if setup failed.
    }
  }
}

/**
 * Run this function once from the Apps Script editor.
 * It creates the two tabs and their headers.
 */
function setupSheets() {
  const spreadsheet = openSpreadsheet_();

  const responses = getOrCreateSheet_(
    spreadsheet,
    SETTINGS.RESPONSES_SHEET,
    RESPONSE_HEADERS
  );
  const guests = getOrCreateSheet_(
    spreadsheet,
    SETTINGS.GUESTS_SHEET,
    GUEST_HEADERS
  );

  styleHeader_(responses, RESPONSE_HEADERS.length);
  styleHeader_(guests, GUEST_HEADERS.length);

  if (guests.getLastRow() === 1) {
    guests.appendRow([
      "EXAMPLE123",
      "Example Household",
      2,
      "Yes",
      "Delete this example before launch"
    ]);
  }

  responses.setFrozenRows(1);
  guests.setFrozenRows(1);

  responses.autoResizeColumns(1, RESPONSE_HEADERS.length);
  guests.autoResizeColumns(1, GUEST_HEADERS.length);
}

/**
 * Optional test from the Apps Script editor.
 */
function testSubmission() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        invitationCode: "EXAMPLE123",
        primaryGuest: "Example Guest",
        email: "guest@example.com",
        attending: "Yes",
        guestCount: "2",
        additionalGuests: "Second Guest",
        mealChoice: "Chicken",
        dietaryRestrictions: "",
        songRequest: "Example Song",
        notes: "Testing"
      })
    }
  };

  Logger.log(doPost(mockEvent).getContent());
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("No submission body was received.");
  }

  try {
    return JSON.parse(e.postData.contents);
  } catch (error) {
    // Also support normal HTML form submissions.
    return e.parameter || {};
  }
}

function validatePayload_(payload) {
  const invitationCode = normalizeCode_(payload.invitationCode);
  const primaryGuest = clean_(payload.primaryGuest);
  const email = clean_(payload.email);
  const attending = clean_(payload.attending);

  if (!invitationCode) {
    return { ok: false, message: "Please enter the invitation code." };
  }

  if (!primaryGuest) {
    return { ok: false, message: "Please enter the primary guest's name." };
  }

  if (!isValidEmail_(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  if (!["Yes", "No"].includes(attending)) {
    return { ok: false, message: "Please select whether you will attend." };
  }

  if (SETTINGS.RSVP_DEADLINE) {
    const endOfDeadline = new Date(`${SETTINGS.RSVP_DEADLINE}T23:59:59`);
    if (!Number.isNaN(endOfDeadline.getTime()) && new Date() > endOfDeadline) {
      return {
        ok: false,
        message: "Online RSVPs are closed. Please contact the couple directly."
      };
    }
  }

  return { ok: true };
}

function openSpreadsheet_() {
  if (
    !SETTINGS.SPREADSHEET_ID ||
    SETTINGS.SPREADSHEET_ID.includes("PASTE_GOOGLE")
  ) {
    throw new Error("Add the Google Sheet ID to SETTINGS.SPREADSHEET_ID.");
  }

  return SpreadsheetApp.openById(SETTINGS.SPREADSHEET_ID);
}

function getOrCreateSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    styleHeader_(sheet, headers.length);
  }

  return sheet;
}

function styleHeader_(sheet, columnCount) {
  sheet
    .getRange(1, 1, 1, columnCount)
    .setFontWeight("bold")
    .setBackground("#173755")
    .setFontColor("#ffffff");
}

function findGuestRecord_(sheet, invitationCode) {
  if (sheet.getLastRow() < 2) return null;

  const values = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, GUEST_HEADERS.length)
    .getDisplayValues();

  for (let index = 0; index < values.length; index += 1) {
    const row = values[index];
    if (normalizeCode_(row[0]) === invitationCode) {
      return {
        rowNumber: index + 2,
        invitationCode: normalizeCode_(row[0]),
        householdName: clean_(row[1]),
        maximumGuests: Number(row[2] || SETTINGS.DEFAULT_MAX_GUESTS),
        plusOneAllowed: clean_(row[3]),
        notes: clean_(row[4])
      };
    }
  }

  return null;
}

function findExistingResponseRow_(sheet, invitationCode) {
  if (sheet.getLastRow() < 2) return null;

  // Invitation Code is column 3.
  const codes = sheet
    .getRange(2, 3, sheet.getLastRow() - 1, 1)
    .getDisplayValues();

  for (let index = 0; index < codes.length; index += 1) {
    if (normalizeCode_(codes[index][0]) === invitationCode) {
      return index + 2;
    }
  }

  return null;
}

function normalizeCode_(value) {
  return clean_(value).replace(/\s+/g, "").toUpperCase();
}

function clean_(value) {
  return String(value === undefined || value === null ? "" : value)
    .trim()
    .slice(0, 2000);
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
