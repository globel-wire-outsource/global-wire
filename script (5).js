/* ================================================================
   GLOBAL WIRE — script.js  (Enhanced)
   Scroll Progress · Smoother Tabs · EmailJS · Multi-Step Booking
   ================================================================ */

const EMAILJS_PUBLIC  = "_yAz4PMpNoZOAzlbu";
const EMAILJS_SERVICE = "service_9ouz7yj";
const EMAILJS_TMPL    = "template_n1sh6jm";
const WA_NUMBER       = "27671178955";

// ── EMAILJS ──────────────────────────────────────────────────
emailjs.init({ publicKey: EMAILJS_PUBLIC });

// ── LOADER ───────────────────────────────────────────────────
const loaderEl = document.getElementById("loader");
window.addEventListener("load", () => {
  setTimeout(() => {
    loaderEl.classList.add("gone");
    revealPage("home");
    animateStats();
    setTimeout(initPopia, 900);
    setTimeout(initChatAutoOpen, 9000);
  }, 1900);
});

// ── POPIA ────────────────────────────────────────────────────
const popiaBar = document.getElementById("popiaBar");
function initPopia() {
  if (!localStorage.getItem("gw_popia_v3")) popiaBar.classList.add("up");
}
function dismissPopia() {
  popiaBar.classList.remove("up");
  localStorage.setItem("gw_popia_v3", "1");
}
document.getElementById("popiaOk").addEventListener("click", dismissPopia);
document.getElementById("popiaX").addEventListener("click",  dismissPopia);

// ── SCROLL PROGRESS ──────────────────────────────────────────
const scrollFill = document.getElementById("scrollFill");
const nav = document.getElementById("nav");

function updateScrollProgress(page) {
  if (!scrollFill || !page) return;
  const el = document.getElementById("page-" + page);
  if (!el) return;
  el.addEventListener("scroll", () => {
    const max = el.scrollHeight - el.clientHeight;
    const pct = max > 0 ? (el.scrollTop / max) * 100 : 0;
    scrollFill.style.width = pct + "%";
    // Nav glass effect on scroll
    if (el.scrollTop > 20) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }, { passive: true });
}

// ── ANIMATED COUNTERS ─────────────────────────────────────────
function animateStats() {
  const nums = document.querySelectorAll(".stat-num[data-target]");
  nums.forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    const dur    = 1800;
    const step   = 16;
    const steps  = Math.round(dur / step);
    let current  = 0;
    const inc    = target / steps;
    const timer  = setInterval(() => {
      current += inc;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current) + suffix;
    }, step);
  });
}

// ── TABS ─────────────────────────────────────────────────────
const TAB_ORDER = ["home", "services", "booking", "contact"];
let currentTab  = "home";
let isTransitioning = false;

function switchTab(tabName, prefillService = null) {
  if (tabName === currentTab || isTransitioning) return;
  isTransitioning = true;

  const outPage = document.getElementById("page-" + currentTab);
  const inPage  = document.getElementById("page-" + tabName);

  // Smoother crossfade — no transform-based shift
  outPage.style.cssText = `opacity:0; transition:opacity 0.3s ease; pointer-events:none;`;

  setTimeout(() => {
    outPage.classList.remove("active");
    outPage.style.cssText = "";

    // Reset scroll fill for new page
    if (scrollFill) scrollFill.style.width = "0%";
    if (nav) nav.classList.remove("scrolled");

    inPage.style.cssText = `opacity:0; pointer-events:all;`;
    inPage.classList.add("active");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inPage.style.cssText = `opacity:1; transition:opacity 0.4s cubic-bezier(0.25,0.46,0.45,0.94); pointer-events:all;`;

        setTimeout(() => {
          inPage.style.cssText = "";
          isTransitioning = false;
          currentTab      = tabName;
          inPage.scrollTop = 0;
          revealPage(tabName);
          updateScrollProgress(tabName);

          if (tabName === "home") animateStats();

          if (prefillService && tabName === "booking") {
            const sel = document.getElementById("fservice");
            if (sel) {
              for (const opt of sel.options) {
                if (opt.value === prefillService) { sel.value = prefillService; break; }
              }
            }
          }
        }, 420);
      });
    });
  }, 220);

  // Update nav indicators immediately
  document.querySelectorAll(".nt").forEach(b => b.classList.toggle("active",  b.dataset.tab === tabName));
  document.querySelectorAll(".mnt").forEach(b => b.classList.toggle("active", b.dataset.tab === tabName));

  closeDrawer();
}

// ── REVEAL ANIMATIONS ─────────────────────────────────────────
function revealPage(tabName) {
  const page  = document.getElementById("page-" + tabName);
  const items = page.querySelectorAll(".ri:not(.vis)");
  items.forEach((el, i) => {
    const base  = parseInt(el.dataset.d || 0);
    const delay = base + i * 40;
    setTimeout(() => el.classList.add("vis"), delay);
  });
}

// ── NAV CLICKS ───────────────────────────────────────────────
document.querySelectorAll(".nt").forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// ── DELEGATE [data-goto] ─────────────────────────────────────
document.addEventListener("click", e => {
  const el = e.target.closest("[data-goto]");
  if (!el) return;
  switchTab(el.dataset.goto, el.dataset.service || null);
});

// ── DRAWER ───────────────────────────────────────────────────
const navHam      = document.getElementById("navHam");
const drawer      = document.getElementById("drawer");
const drawerVeil  = document.getElementById("drawerVeil");
const drawerClose = document.getElementById("drawerClose");

function openDrawer() {
  drawer.classList.add("open");
  drawerVeil.classList.add("open");
  navHam.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}
function closeDrawer() {
  drawer.classList.remove("open");
  drawerVeil.classList.remove("open");
  navHam.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

navHam.addEventListener("click",      openDrawer);
drawerClose.addEventListener("click", closeDrawer);
drawerVeil.addEventListener("click",  closeDrawer);
document.querySelectorAll(".mnt").forEach(btn => {
  btn.addEventListener("click", () => { switchTab(btn.dataset.tab); closeDrawer(); });
});

// ── REMOVAL → WHATSAPP ───────────────────────────────────────
const removalBtn = document.getElementById("removalBtn");
if (removalBtn) {
  removalBtn.addEventListener("click", () => {
    const msg = encodeURIComponent(
      "Hello Global Wire,\n\n" +
      "I would like to enquire about your *Removal Services*.\n\n" +
      "Could you please provide a quote and confirm available dates?\n\nThank you."
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
  });
}

// ── MULTI-STEP BOOKING ────────────────────────────────────────
let currentStep = 1;
const stepFillEl   = document.getElementById("stepFill");
const stepLabels = document.querySelectorAll(".slabel");

function goToStep(n) {
  if (n > currentStep) {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
  }
  if (n === 3) buildReview();

  document.getElementById("step" + currentStep).classList.remove("active");
  currentStep = n;
  document.getElementById("step" + currentStep).classList.add("active");

  // Progress bar
  const pcts = { 1: 16.6, 2: 50, 3: 100 };
  if (stepFillEl) stepFillEl.style.width = pcts[currentStep] + "%";

  // Step labels
  stepLabels.forEach(s => {
    const sn = parseInt(s.dataset.s);
    s.classList.toggle("active", sn === currentStep);
    s.classList.toggle("done",   sn < currentStep);
  });

  // Scroll to form top on mobile
  const form = document.getElementById("bookingForm");
  if (form) form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function validateStep1() {
  const name  = document.getElementById("fname").value.trim();
  const email = document.getElementById("femail").value.trim();
  if (!name)  { flashField("fname",  "Please enter your full name."); return false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    flashField("femail", "Please enter a valid email address."); return false;
  }
  return true;
}

function validateStep2() {
  const svc = document.getElementById("fservice").value;
  if (!svc) { flashField("fservice", "Please select a service."); return false; }
  return true;
}

function flashField(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = "var(--danger)";
  el.style.boxShadow   = "0 0 0 3px rgba(192,57,43,0.1)";
  el.focus();
  let err = el.parentElement.querySelector(".ferr");
  if (!err) {
    err = document.createElement("p");
    err.className = "ferr";
    err.style.cssText = "font-size:11px;color:var(--danger);margin-top:4px;font-family:var(--f-mono);letter-spacing:1px;";
    el.parentElement.appendChild(err);
  }
  err.textContent = msg;
  setTimeout(() => {
    el.style.borderColor = "";
    el.style.boxShadow   = "";
    if (err.parentElement) err.remove();
  }, 2800);
}

function buildReview() {
  const g = (id) => document.getElementById(id)?.value?.trim() || "—";
  const fields = [
    { lbl: "Full Name",      val: g("fname") },
    { lbl: "Email",          val: g("femail") },
    { lbl: "Phone",          val: g("fphone") || "—" },
    { lbl: "Address",        val: g("faddress") || "—" },
    { lbl: "Service",        val: document.getElementById("fservice").value, gold: true },
    { lbl: "Preferred Date", val: g("fdate") || "Flexible" },
    { lbl: "Preferred Time", val: document.getElementById("ftime")?.value || "Flexible" },
    { lbl: "Notes",          val: g("fmsg") || "None" },
  ];
  document.getElementById("reviewGrid").innerHTML = fields.map(f =>
    `<div class="review-row">
      <span class="rlbl">${f.lbl}</span>
      <span class="rval${f.gold ? " gold" : ""}">${f.val}</span>
    </div>`
  ).join("");
}

// Wire step buttons
["toStep2","toStep3","toStep1","toStep2b"].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  const target = { toStep2:2, toStep3:3, toStep1:1, toStep2b:2 }[id];
  el.addEventListener("click", () => goToStep(target));
});

// ── FORM SUBMIT ──────────────────────────────────────────────
const bookingForm = document.getElementById("bookingForm");
const formStatus  = document.getElementById("formStatus");
const submitBtn   = document.getElementById("submitBtn");
const btnText     = document.getElementById("btnText");
const btnSpin     = document.getElementById("btnSpin");

if (bookingForm) {
  bookingForm.addEventListener("submit", async e => {
    e.preventDefault();
    setLoading(true);
    clearStatus();

    const nameVal    = document.getElementById("fname").value.trim();
    const emailVal   = document.getElementById("femail").value.trim();
    const phoneVal   = document.getElementById("fphone").value.trim()    || "Not provided";
    const serviceVal = document.getElementById("fservice").value;
    const addrVal    = document.getElementById("faddress").value.trim()  || "Not provided";
    const dateVal    = document.getElementById("fdate").value            || "Flexible";
    const timeVal    = document.getElementById("ftime")?.value           || "Flexible";
    const msgVal     = document.getElementById("fmsg").value.trim()      || "None";

    const params = {
      from_name:      nameVal,
      from_email:     emailVal,
      reply_to:       emailVal,
      to_name:        "Global Wire",
      name:           nameVal,
      email:          emailVal,
      phone:          phoneVal,
      service:        serviceVal,
      address:        addrVal,
      preferred_date: dateVal,
      preferred_time: timeVal,
      message:        msgVal,
      subject:        `New Booking Request – ${serviceVal}`,
      time:           dateVal + " · " + timeVal,
    };

    try {
      const result = await emailjs.send(EMAILJS_SERVICE, EMAILJS_TMPL, params);
      console.log("EmailJS success:", result.status, result.text);
      setLoading(false);
      showStatus("ok", "✓ Booking request sent — we will be in touch shortly.");
      bookingForm.reset();
      goToStep(1);
    } catch (err) {
      console.error("EmailJS error:", JSON.stringify(err));
      setLoading(false);
      showStatus("err", `Unable to send — please WhatsApp us on +27 67 117 8955 or email globelwireoutsource@gmail.com`);
    }
  });
}

function showStatus(type, msg) {
  formStatus.className   = "f-status " + type;
  formStatus.textContent = msg;
}
function clearStatus() {
  formStatus.className   = "f-status";
  formStatus.textContent = "";
}
function setLoading(on) {
  submitBtn.disabled    = on;
  btnText.style.display = on ? "none" : "";
  btnSpin.style.display = on ? "inline-block" : "none";
}

// ── LIVE CHAT WIDGET ─────────────────────────────────────────
const chatToggle  = document.getElementById("chatToggle");
const chatPanel   = document.getElementById("chatPanel");
const chatBadge   = document.getElementById("chatBadge");
const iconOpen    = chatToggle.querySelector(".chat-icon-open");
const iconClose   = chatToggle.querySelector(".chat-icon-close");
let chatOpen      = false;

function setChatOpen(open) {
  chatOpen = open;
  chatPanel.classList.toggle("open", open);
  iconOpen.style.display  = open ? "none" : "flex";
  iconClose.style.display = open ? "flex" : "none";
  chatToggle.setAttribute("aria-expanded", open.toString());
  if (open && chatBadge) chatBadge.style.display = "none";
}

chatToggle.addEventListener("click", () => setChatOpen(!chatOpen));

// Chat prompts → WhatsApp
document.querySelectorAll(".chat-prompt").forEach(btn => {
  btn.addEventListener("click", () => {
    const msg = encodeURIComponent(btn.dataset.msg + "\n\nThank you.");
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
  });
});

// Auto-open once per session
function initChatAutoOpen() {
  if (!chatOpen && !sessionStorage.getItem("gw_chat_v2")) {
    setChatOpen(true);
    sessionStorage.setItem("gw_chat_v2", "1");
  }
}

// ── INIT SCROLL PROGRESS FOR HOME ────────────────────────────
updateScrollProgress("home");

// ── KEYBOARD ACCESSIBILITY ────────────────────────────────────
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeDrawer();
    if (chatOpen) setChatOpen(false);
  }
});

// ── TOUCH: Prevent body scroll when drawer is open ───────────
document.addEventListener("touchmove", e => {
  if (drawer.classList.contains("open")) {
    if (!drawer.contains(e.target)) e.preventDefault();
  }
}, { passive: false });
