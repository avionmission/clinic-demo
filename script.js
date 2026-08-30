/* ==========================================================
   FetalMed — interaction & form logic
   ========================================================== */
(function () {
  "use strict";

  /* ---------- Navbar ---------- */
  var navbar = document.getElementById("navbar");
  var navInner = document.querySelector(".nav-inner");
  var hamburger = document.getElementById("hamburger");

  function onScroll() {
    if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll);
  onScroll();

  if (hamburger && navInner) {
    hamburger.addEventListener("click", function () {
      var open = navInner.classList.toggle("open");
      hamburger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  document.querySelectorAll(".nav-right a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (navInner) navInner.classList.remove("open");
      if (hamburger) hamburger.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Appointment form ---------- */
  var form = document.getElementById("appointment-form");
  if (form) setupForm();

  function setupForm() {
    var dateInput = document.getElementById("date");

    /* Default + minimum date = today */
    var today = new Date();
    var iso = today.toISOString().split("T")[0];
    if (dateInput) {
      dateInput.min = iso;
      dateInput.value = iso;
    }

    /* ---------- Captcha ---------- */
    var captchaBox = document.getElementById("captcha-code");
    var refreshBtn = document.getElementById("captcha-refresh");
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    function generateCaptcha() {
      var code = "";
      for (var i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (captchaBox) captchaBox.textContent = code;
      return code;
    }
    var currentCaptcha = generateCaptcha();
    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        currentCaptcha = generateCaptcha();
        clearFieldError(document.getElementById("captcha"));
      });
    }

    /* ---------- Validation helpers ---------- */
    function showError(input, message) {
      var field = input.closest(".field");
      var msg = field ? field.querySelector(".error-msg") : null;
      input.classList.add("invalid");
      if (msg) msg.textContent = message;
      return false;
    }

    function clearFieldError(input) {
      if (!input) return;
      input.classList.remove("invalid");
      var field = input.closest(".field");
      var msg = field ? field.querySelector(".error-msg") : null;
      if (msg) msg.textContent = "";
    }

    function clearAllErrors() {
      form.querySelectorAll(".invalid").forEach(function (el) {
        el.classList.remove("invalid");
      });
      [].forEach.call(form.querySelectorAll(".error-msg"), function (msg) {
        msg.textContent = "";
      });
    }

    /* ---------- Real-time cleanup ---------- */
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", function () { clearFieldError(el); });
      el.addEventListener("change", function () { clearFieldError(el); });
    });

    /* ---------- Submit ---------- */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearAllErrors();

      var firstInvalid = null;
      function check(input, valid, message) {
        if (valid) return;
        if (!firstInvalid) firstInvalid = input;
        showError(input, message);
      }

      var consultation = document.getElementById("consultation");
      var doctor = document.getElementById("doctor");
      var date = document.getElementById("date");
      var name = document.getElementById("name");
      var phone = document.getElementById("phone");
      var email = document.getElementById("email");
      var captchaInput = document.getElementById("captcha");

      check(consultation, consultation.value !== "", "Please choose a consultation type.");
      check(doctor, doctor.value !== "", "Please choose your specialist.");
      check(date, !!(date.value && date.value >= date.min),
        date.value && date.value < date.min ? "Please pick a date from today onwards." : "Please choose a preferred date.");

      check(name, name.value.trim().length >= 2, "Please enter your full name.");
      check(name, /^[a-zA-Z][a-zA-Z\s.'-]{1,49}$/.test(name.value.trim()),
        "Name should contain only letters.");

      check(phone, /^[+]?[\d\s-]{8,15}$/.test(phone.value.trim()),
        "Please enter a valid phone number (8-15 digits).");

      check(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()),
        "Please enter a valid email address.");

      check(captchaInput, captchaInput.value.trim().toUpperCase() === currentCaptcha,
        "Incorrect code. Please type the code shown.");

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      showSuccess();
    });

    function showSuccess() {
      var name = document.getElementById("name").value.trim();
      var type = document.getElementById("consultation").value;
      var doc = document.getElementById("doctor").value;
      var date = document.getElementById("date").value;

      var fmtDate = new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
        weekday: "short", day: "numeric", month: "short", year: "numeric"
      });

      var nameEl = document.getElementById("successName");
      var typeEl = document.getElementById("successType");
      var docEl = document.getElementById("successDoc");
      var dateEl = document.getElementById("successDate");
      if (nameEl) nameEl.textContent = name;
      if (typeEl) typeEl.textContent = type;
      if (docEl) docEl.textContent = doc.split("(")[0].trim();
      if (dateEl) dateEl.textContent = fmtDate;

      /* Reset only the data fields, keep generated captcha fresh */
      form.reset();
      ["consultation", "doctor", "name", "phone", "email", "address", "message"].forEach(function (id) {
        clearFieldError(document.getElementById(id));
      });
      if (dateInput) dateInput.value = dateInput.min;

      form.classList.add("hidden");
      var box = document.getElementById("successBox");
      if (box) box.hidden = false;

      form.closest(".form-card").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    var bookAgain = document.getElementById("bookAnother");
    if (bookAgain) {
      bookAgain.addEventListener("click", function () {
        form.classList.remove("hidden");
        form.reset();
        if (dateInput) dateInput.value = dateInput.min;
        currentCaptcha = generateCaptcha();
        var box = document.getElementById("successBox");
        if (box) box.hidden = true;
      });
    }
  }
})();