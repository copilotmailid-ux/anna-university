/**
 * Anna University - Pre-Examination Monitoring System
 * Complete Interactive Logic:
 * - Dynamic Captchas (Staff & Student) with canvas rendering
 * - Web Speech API & Web Audio Captcha narration
 * - Authentication & View State Transition (Login -> Student Portal)
 * - Student Portal Tab Navigation (Profile, Exam Results, Timetable, etc.)
 * - All Subjects PASS Results Presentation (Images 1 & 2 faithful recreation)
 * - Print handling, Logout, Ticker pause/resume, and Modal management
 */

// Captcha state store
const captchaState = {
  staff: "zEmEzk",    // Default matching screenshot
  student: "cSS5qg"   // Default matching screenshot
};

// Generate alphanumeric string
function getRandomCaptchaText(length = 6) {
  const chars = "23456789abcdefghkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Render Captcha on Canvas
 */
function drawCaptcha(type, text) {
  const canvas = document.getElementById(`${type}CaptchaCanvas`);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  if (type === "staff") {
    // 1. Dark Black Background
    ctx.fillStyle = "#0c0e11";
    ctx.fillRect(0, 0, width, height);

    // 2. Dense Golden / Yellow Noise Speckles
    const goldPalette = ["#ffe066", "#fab005", "#ffd43b", "#fcc419", "#fff3bf", "#e9ecef"];
    for (let i = 0; i < 480; i++) {
      ctx.fillStyle = goldPalette[Math.floor(Math.random() * goldPalette.length)];
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Subtle curved lines
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = "rgba(255, 230, 100, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 20, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        width - Math.random() * 20, Math.random() * height
      );
      ctx.stroke();
    }

    // 4. Characters
    const charSpacing = width / (text.length + 1);
    ctx.textBaseline = "middle";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      ctx.save();
      const x = charSpacing * (i + 0.8) + (Math.random() * 4 - 2);
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 20 - 10) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.shadowColor = "#000000";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.font = `bold ${Math.floor(22 + Math.random() * 4)}px 'Courier New', monospace`;
      ctx.fillStyle = (i % 2 === 0) ? "#f8f9fa" : "#ffe066";
      ctx.fillText(char, 0, 0);

      ctx.restore();
    }

  } else {
    // Student Captcha: White/Pink Speckled Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255, 235, 240, 0.6)";
    ctx.fillRect(0, 0, width, height);

    // Dense Magenta / Pink / Red Noise Speckles
    const pinkPalette = ["#f783ac", "#e64980", "#d6336c", "#ff8787", "#c2255c", "#e03131"];
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = pinkPalette[Math.floor(Math.random() * pinkPalette.length)];
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle wavy lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = "rgba(214, 51, 108, 0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 20, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        width - Math.random() * 20, Math.random() * height
      );
      ctx.stroke();
    }

    // Characters
    const charSpacing = width / (text.length + 1);
    ctx.textBaseline = "middle";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      ctx.save();
      const x = charSpacing * (i + 0.8) + (Math.random() * 4 - 2);
      const y = height / 2 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 22 - 11) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = 2;

      ctx.font = `bold ${Math.floor(23 + Math.random() * 4)}px 'Trebuchet MS', Arial, sans-serif`;
      ctx.fillStyle = (i % 2 === 0) ? "#c2255c" : "#a61e4d";
      ctx.fillText(char, 0, 0);

      ctx.restore();
    }
  }
}

// Refresh Captcha Code
function refreshCaptcha(type) {
  captchaState[type] = getRandomCaptchaText(6);
  drawCaptcha(type, captchaState[type]);
  const inputEl = document.getElementById(`${type}CaptchaInput`);
  if (inputEl) {
    inputEl.value = "";
    inputEl.focus();
  }
}

/**
 * Audio Narration of Captcha
 */
function playAudioCaptcha(type) {
  const text = captchaState[type];
  if (!text) return;

  // Gentle audio chime with Web Audio API
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    // Audio context not critical
  }

  // Speech Synthesis
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const spokenList = text.split("").map((ch) => {
      if (ch >= "A" && ch <= "Z") return `capital ${ch}`;
      if (ch >= "0" && ch <= "9") return `number ${ch}`;
      return `small ${ch}`;
    });

    const phrase = "Captcha is: " + spokenList.join(", ") + ".";
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.rate = 0.85;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Audio Captcha: " + text);
  }
}

/**
 * Handle Student Login:
 * Strictly verifies credentials:
 * Register Number: 621820114003
 * Date of Birth: 01-08-2002
 * Captcha: matching characters
 * Only if valid, moves to the Student Portal Results view!
 */
function handleStudentLogin(event) {
  event.preventDefault();
  const regNumber = document.getElementById("regNumber").value.trim();
  const dob = document.getElementById("dob").value.trim();
  const captchaEntered = document.getElementById("studentCaptchaInput").value.trim();

  // Validate Captcha (case-insensitive)
  if (captchaEntered.toLowerCase() !== captchaState.student.toLowerCase()) {
    alert("Invalid Captcha code! Please enter the exact characters displayed in the image.");
    refreshCaptcha("student");
    return;
  }

  // Strictly validate required student credentials
  if (regNumber !== "621820114003" || dob !== "01-08-2002") {
    alert("Invalid Register Number or Date of Birth!");
    return;
  }

  // Show loading overlay
  const loader = document.getElementById("loadingOverlay");
  if (loader) loader.style.display = "flex";

  // Simulate loading animation for 1.2 seconds before displaying results
  setTimeout(() => {
    if (loader) loader.style.display = "none";

    // Transition to Student Portal View
    document.getElementById("loginView").style.display = "none";
    document.getElementById("studentPortalView").style.display = "block";

    // Switch to EXAM RESULTS tab with all subjects PASS
    switchStudentTab("results");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 1200);
}

/**
 * Handle Staff / Institution Login Submission
 */
function handleStaffLogin(event) {
  event.preventDefault();
  const staffCode = document.getElementById("staffCode").value.trim();
  const password = document.getElementById("staffPassword").value.trim();
  const captchaEntered = document.getElementById("staffCaptchaInput").value.trim();

  if (!staffCode || !password) {
    alert("Please enter Institution / Staff Code and Password.");
    return;
  }

  if (captchaEntered.toLowerCase() !== captchaState.staff.toLowerCase()) {
    alert("Invalid Captcha! Please verify the letters shown.");
    refreshCaptcha("staff");
    return;
  }

  const loader = document.getElementById("loadingOverlay");
  if (loader) loader.style.display = "flex";

  setTimeout(() => {
    if (loader) loader.style.display = "none";
    document.getElementById("dashStaffCode").textContent = staffCode;
    openModal("staffDashboardModal");
    refreshCaptcha("staff");
  }, 1000);
}

/**
 * Switch Tabs inside Student Portal View
 */
function switchStudentTab(tabName) {
  // Update Tab Buttons
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  const activeBtn = document.getElementById(`tabBtn-${tabName}`);
  if (activeBtn) activeBtn.classList.add("active");

  // Update Tab Panels
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.style.display = "none";
  });
  const activePanel = document.getElementById(`tabContent-${tabName}`);
  if (activePanel) {
    activePanel.style.display = "block";
  }
}

/**
 * Handle Logout: Return to Login Screen and clear inputs
 */
function handleLogout() {
  document.getElementById("studentPortalView").style.display = "none";
  document.getElementById("loginView").style.display = "block";
  const regEl = document.getElementById("regNumber");
  const dobEl = document.getElementById("dob");
  const capEl = document.getElementById("studentCaptchaInput");
  if (regEl) regEl.value = "";
  if (dobEl) dobEl.value = "";
  if (capEl) capEl.value = "";
  refreshCaptcha("student");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Handle Forgot Password Submission
 */
function handleForgotSubmit(event) {
  event.preventDefault();
  const code = document.getElementById("recoveryInstCode").value.trim();
  const email = document.getElementById("recoveryEmail").value.trim();

  alert(`Password reset instructions and verification OTP have been dispatched to ${email} for Institution Code ${code}.`);
  closeModal("forgotModal");
}

/**
 * Auto-format Date of Birth (DD-MM-YYYY)
 */
function setupDateAutoFormat() {
  const dobInput = document.getElementById("dob");
  if (!dobInput) return;

  dobInput.addEventListener("input", function (e) {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.substring(0, 8);

    let formatted = "";
    if (val.length > 0) formatted += val.substring(0, 2);
    if (val.length >= 3) formatted += "-" + val.substring(2, 4);
    if (val.length >= 5) formatted += "-" + val.substring(4, 8);

    e.target.value = formatted;
  });
}

/**
 * Continuous Announcements Ticker Setup
 */
function setupAnnouncementsTicker() {
  const ticker = document.getElementById("tickerContent");
  if (!ticker) return;
  const items = ticker.innerHTML;
  ticker.innerHTML = items + items;
}

function pauseTicker() {
  const ticker = document.getElementById("tickerContent");
  if (ticker) ticker.classList.add("paused");
}

function resumeTicker() {
  const ticker = document.getElementById("tickerContent");
  if (ticker) ticker.classList.remove("paused");
}

/**
 * Modal Utilities
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function handleBackdropClick(event, modalId) {
  if (event.target.id === modalId) {
    closeModal(modalId);
  }
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-backdrop.active").forEach((m) => {
      m.classList.remove("active");
    });
    document.body.style.overflow = "";
  }
});

// Initialization
window.addEventListener("DOMContentLoaded", () => {
  drawCaptcha("staff", captchaState.staff);
  drawCaptcha("student", captchaState.student);
  setupDateAutoFormat();
  setupAnnouncementsTicker();

  // Ensure login fields are not prefilled
  const regEl = document.getElementById("regNumber");
  const dobEl = document.getElementById("dob");
  const capEl = document.getElementById("studentCaptchaInput");
  if (regEl) regEl.value = "";
  if (dobEl) dobEl.value = "";
  if (capEl) capEl.value = "";

  // Check URL hash for quick preview (#results, #profile, etc.)
  const hash = window.location.hash.toLowerCase();
  if (hash === "#results" || hash === "#exam-results") {
    document.getElementById("loginView").style.display = "none";
    document.getElementById("studentPortalView").style.display = "block";
    switchStudentTab("results");
  } else if (hash === "#profile") {
    document.getElementById("loginView").style.display = "none";
    document.getElementById("studentPortalView").style.display = "block";
    switchStudentTab("profile");
  }
});
