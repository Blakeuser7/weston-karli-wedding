(() => {
  "use strict";

  const form = document.querySelector("#rsvp-form");
  if (!form) return;

  const config = window.WEDDING_CONFIG || {};
  const endpoint = config?.rsvp?.endpoint || "";
  const attendingDetails = document.querySelector("#attending-details");
  const guestCount = document.querySelector("#guest-count");
  const statusBox = document.querySelector("#form-status");
  const successCard = document.querySelector("#success-card");
  const successMessage = document.querySelector("#success-message");
  const submitButton = form.querySelector(".submit-button");

  function setStatus(message = "", type = "") {
    statusBox.textContent = message;
    statusBox.className = "form-status";
    if (type) statusBox.classList.add(`is-${type}`);
  }

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.classList.toggle("is-loading", isLoading);
    submitButton.querySelector(".submit-label").textContent =
      isLoading ? "Submitting" : "Submit RSVP";
  }

  function updateAttendanceFields() {
    const attendance = form.elements.attending.value;
    const isDeclining = attendance === "No";

    attendingDetails.classList.toggle("is-disabled", isDeclining);
    attendingDetails.querySelectorAll("input, textarea, select").forEach((field) => {
      field.disabled = isDeclining;
    });

    if (isDeclining) {
      guestCount.value = "1";
    }
  }

  form.querySelectorAll('input[name="attending"]').forEach((radio) => {
    radio.addEventListener("change", updateAttendanceFields);
  });

  function validateForm() {
    setStatus();

    form.querySelectorAll("[aria-invalid='true']").forEach((field) => {
      field.removeAttribute("aria-invalid");
    });

    const requiredFields = form.querySelectorAll("[required]:not(:disabled)");
    let firstInvalid = null;

    requiredFields.forEach((field) => {
      let valid = true;

      if (field.type === "radio") {
        valid = Boolean(form.querySelector(`input[name="${field.name}"]:checked`));
      } else {
        valid = field.checkValidity() && field.value.trim() !== "";
      }

      if (!valid) {
        field.setAttribute("aria-invalid", "true");
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (firstInvalid) {
      setStatus("Please complete the required fields before submitting.", "error");
      firstInvalid.focus();
      return false;
    }

    const emailField = form.elements.email;
    if (!emailField.checkValidity()) {
      emailField.setAttribute("aria-invalid", "true");
      setStatus("Please enter a valid email address.", "error");
      emailField.focus();
      return false;
    }

    return true;
  }

  async function parseResponse(response) {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      if (response.ok) {
        return { ok: true, message: "Your response has been received." };
      }
      throw new Error("The server returned an unreadable response.");
    }
  }

  async function submitRsvp(payload) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload),
      redirect: "follow"
    });

    return parseResponse(response);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    if (
      !endpoint ||
      endpoint.includes("PASTE_GOOGLE_APPS_SCRIPT") ||
      !endpoint.startsWith("https://script.google.com/")
    ) {
      setStatus(
        "The RSVP form is still in setup mode. Add the deployed Apps Script URL in js/wedding-config.js.",
        "info"
      );
      return;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    payload.submittedFrom = window.location.href;
    payload.clientTimestamp = new Date().toISOString();

    if (payload.attending === "No") {
      payload.guestCount = "0";
      payload.additionalGuests = "";
      payload.mealChoice = "";
      payload.dietaryRestrictions = "";
    }

    setLoading(true);
    setStatus("Sending your response…", "info");

    try {
      const result = await submitRsvp(payload);

      if (!result.ok) {
        throw new Error(result.message || "The RSVP could not be saved.");
      }

      form.hidden = true;
      successCard.hidden = false;
      successMessage.textContent =
        result.message || "We are so grateful you took the time to reply.";
      successCard.focus();
      window.scrollTo({ top: successCard.offsetTop - 90, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setStatus(
        error.message ||
          "We could not submit the RSVP. Please check your connection and try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  });
})();
