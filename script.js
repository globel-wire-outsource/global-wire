/* ================================================================
   GLOBAL WIRE — script.js
   Premium Luxury · Tab SPA · Multi-Step Form · Live Chat · EmailJS
   ================================================================ */

const EMAILJS_PUBLIC  = "bn3bUFzlIJWgCV6Be";
const EMAILJS_SERVICE = "service_hpyva7lt";
const EMAILJS_TMPL    = "template_z2hqgtj";
const WA_NUMBER       = "27660251763";

// ── EMAILJS ──────────────────────────────────────────────────
emailjs.init(EMAILJS_PUBLIC);

// ── LOADER ───────────────────────────────────────────────────
const loaderEl = document.getElementById("loader");

window.addEventListener("load", () => {
  setTimeout(() => {
    loaderEl.classList.add("gone");
    revealPage("home");
    setTimeout(() => initPopia(), 800);
  }, 1900);
});

// ── POPIA ────────────────────────────────────────────────────
const popiaBar = document.getElementById("popiaBar");
const popiaOk  = document.getElementById("popiaOk");
const popiaX   = document.getElementById("popiaX");

function initPopia() {
  if (localStorage.getItem("gw_popia_v2")) return;
  popiaBar.classList.add("up");
}

function dismissPopia() {
  popiaBar.classList.remove("up");
  localStorage.setItem("gw_popia_v2", "1");
}

popiaOk.addEventListener("click", dismissPopia);
popiaX.addEventListener("click",  dismissPopia);

// ── TABS ─────────────────────────────────────────────────────
let currentTab = "home";
let transitioning = false;

const tabOrder = ["home", "services", "booking", "contact"];

function switchTab(tabName, prefillService = null) {
  if (tabName === currentTab || transitioning) return;
  transitioning = true;

  const outPage = document.getElementById("page-" + currentTab);
  const inPage  = document.getElementById("page-" + tabName);

  // Slide direction
  const outIdx = tabOrder.indexOf(currentTab);
  const inIdx  = tabOrder.indexOf(tabName);
  const right  = inIdx > outIdx;

  // Exit
  outPage.style.opacity   = "0";
  outPage.style.transform = right ? "translateX(-30px)" : "translateX(30px)";
  outPage.style.pointerEvents = "none";

  setTimeout(() => {
    outPage.classList.remove("active");
    outPage.style.cssText = "";

    // Enter
    inPage.style.opacity   = "0";
    inPage.style.transform = right ? "translateX(30px)" : "translateX(-30px)";
    inPage.classList.add("active");
    inPage.style.pointerEvents = "all";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inPage.style.transition = "opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)";
        inPage.style.opacity    = "1";
        inPage.style.transform  = "translateX(0)";

        setTimeout(() => {
          inPage.style.cssText = "";
          transitioning        = false;
          currentTab           = tabName;
          revealPage(tabName);
          inPage.scrollTop     = 0;

          if (prefillService && tabName === "booking") {
            const sel = document.getElementById("fservice");
            if (sel) {
              for (const opt of sel.options) {
                if (opt.value === prefillService) { sel.value = prefillService; break; }
              }
            }
          }
        }, 520);
      });
    });
  }, 280);

  // Update nav tabs
  document.querySelectorAll(".nt").forEach(b => b.classList.toggle("active", b.dataset.tab === tabName));
  document.querySelectorAll(".mnt").forEach(b => b.classList.toggle("active", b.dataset.tab === tabName));
}

// ── NAV TAB CLICKS ───────────────────────────────────────────
document.querySelectorAll(".nt").forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// ── DELEGATE data-goto ───────────────────────────────────────
document.addEventListener("click", e => {
  const el = e.target.closest("[data-goto]");
  if (!el) return;
  switchTab(el.dataset.goto, el.dataset.service || null);
});

// ── REVEAL ANIMATIONS ─────────────────────────────────────── 
function revealPage(tabName) {
  const page  = document.getElementById("page-" + tabName);
  const items = page.querySelectorAll(".ri");
  items.forEach((el, i) => {
    const base  = parseInt(el.dataset.d || 0);
    const delay = base + i * 55;
    setTimeout(() => el.classList.add("vis"), delay);
  });
}

// ── MOBILE DRAWER ────────────────────────────────────────────
const navHam       = document.getElementById("navHam");
const mdrawer      = document.getElementById("mdrawer");
const mdrawerVeil  = document.getElementById("mdrawerVeil");
const mdrawerClose = document.getElementById("mdrawerClose");

function openDrawer()  { mdrawer.classList.add("open"); mdrawerVeil.classList.add("open"); }
function closeDrawer() { mdrawer.classList.remove("open"); mdrawerVeil.classList.remove("open"); }

navHam.addEventListener("click",      openDrawer);
mdrawerClose.addEventListener("click", closeDrawer);
mdrawerVeil.addEventListener("click",  closeDrawer);

document.querySelectorAll(".mnt").forEach(btn => {
  btn.addEventListener("click", () => { switchTab(btn.dataset.tab); closeDrawer(); });
});

// ── REMOVAL WHATSAPP ─────────────────────────────────────────
const removalBtn = document.getElementById("removalBtn");
if (removalBtn) {
  removalBtn.addEventListener("click", () => {
    const msg = encodeURIComponent(
      "Hi Global Wire 👋\n\n" +
      "I'd like to enquire about your *Removal Services*.\n\n" +
      "Could you please provide a quote and confirm available dates?\n\nThank you!"
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
  });
}

// ── MULTI-STEP BOOKING FORM ───────────────────────────────────
let currentStep = 1;

const stepFill = document.getElementById("stepFill");
const stepDots = document.querySelectorAll(".step");

function goToStep(n) {
  // Validate before advancing
  if (n > currentStep) {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
  }

  // If going to step 3, populate review
  if (n === 3) buildReview();

  // Hide current step
  const outStep = document.getElementById("step" + currentStep);
  if (outStep) outStep.classList.remove("active");

  currentStep = n;

  // Show new step
  const inStep = document.getElementById("step" + currentStep);
  if (inStep) inStep.classList.add("active");

  // Update progress bar
  const pct = currentStep === 1 ? 16.6 : currentStep === 2 ? 50 : 100;
  stepFill.style.width = pct + "%";

  // Update step indicators
  stepDots.forEach(s => {
    const sn = parseInt(s.dataset.s);
    s.classList.toggle("active", sn === currentStep);
    s.classList.toggle("done",   sn < currentStep);
  });
}

function validateStep1() {
  const name  = document.getElementById("fname").value.trim();
  const email = document.getElementById("femail").value.trim();
  if (!name) { flashField("fname", "Please enter your full name."); return false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { flashField("femail", "Please enter a valid email address."); return false; }
  return true;
}

function validateStep2() {
  const service = document.getElementById("fservice").value;
  if (!service) { flashField("fservice", "Please select a service."); return false; }
  return true;
}

function flashField(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = "var(--danger)";
  el.style.boxShadow   = "0 0 0 3px rgba(192,57,43,0.1)";
  el.focus();
  setTimeout(() => { el.style.borderColor = ""; el.style.boxShadow = ""; }, 2000);
  // Show small error below
  let err = el.parentElement.querySelector(".field-err");
  if (!err) {
    err = document.createElement("p");
    err.className = "field-err";
    err.style.cssText = "font-size:11px;color:var(--danger);margin-top:4px;font-family:var(--f-mono);letter-spacing:1px;";
    el.parentElement.appendChild(err);
  }
  err.textContent = msg;
  setTimeout(() => err.remove(), 2500);
}

function buildReview() {
  const fields = [
    { lbl: "Full Name",       val: document.getElementById("fname").value.trim()    },
    { lbl: "Email",           val: document.getElementById("femail").value.trim()   },
    { lbl: "Phone",           val: document.getElementById("fphone").value.trim() || "—" },
    { lbl: "Address",         val: document.getElementById("faddress").value.trim() || "—" },
    { lbl: "Service",         val: document.getElementById("fservice").value,   gold: true },
    { lbl: "Preferred Date",  val: document.getElementById("fdate").value || "Flexible" },
    { lbl: "Notes",           val: document.getElementById("fmsg").value.trim() || "None" },
  ];

  const grid = document.getElementById("reviewGrid");
  grid.innerHTML = fields.map(f => `
    <div class="review-row">
      <span class="review-lbl">${f.lbl}</span>
      <span class="review-val${f.gold ? " gold" : ""}">${f.val}</span>
    </div>
  `).join("");
}

// Wire step navigation buttons
document.getElementById("toStep2")  && document.getElementById("toStep2").addEventListener("click",  () => goToStep(2));
document.getElementById("toStep1")  && document.getElementById("toStep1").addEventListener("click",  () => goToStep(1));
document.getElementById("toStep3")  && document.getElementById("toStep3").addEventListener("click",  () => goToStep(3));
document.getElementById("toStep2b") && document.getElementById("toStep2b").addEventListener("click", () => goToStep(2));

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

    const params = {
      from_name:      document.getElementById("fname").value.trim(),
      from_email:     document.getElementById("femail").value.trim(),
      phone:          document.getElementById("fphone").value.trim()   || "Not provided",
      service:        document.getElementById("fservice").value,
      address:        document.getElementById("faddress").value.trim() || "Not provided",
      preferred_date: document.getElementById("fdate").value           || "Flexible",
      message:        document.getElementById("fmsg").value.trim()     || "None",
      to_name:        "Global Wire",
    };

    try {
      await emailjs.send(EMAILJS_SERVICE, EMAILJS_TMPL, params);
      setLoading(false);
      showStatus("ok", "✅ Booking confirmed! We'll be in touch with you shortly.");
      bookingForm.reset();
      goToStep(1);
    } catch (err) {
      console.error("EmailJS error:", err);
      setLoading(false);
      showStatus("err", "❌ Submission failed. Please WhatsApp or email us directly.");
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
const chatToggle = document.getElementById("chatToggle");
const chatPanel  = document.getElementById("chatPanel");
const chatBadge  = document.querySelector(".chat-badge");
const iconOpen   = chatToggle.querySelector(".chat-icon.open");
const iconClose  = chatToggle.querySelector(".chat-icon.close");

let chatOpen = false;

chatToggle.addEventListener("click", () => {
  chatOpen = !chatOpen;
  chatPanel.classList.toggle("open", chatOpen);
  iconOpen.style.display  = chatOpen ? "none"  : "flex";
  iconClose.style.display = chatOpen ? "flex"  : "none";
  if (chatOpen && chatBadge) { chatBadge.style.display = "none"; }
});

// Chat prompts → open WhatsApp with pre-typed message
document.querySelectorAll(".chat-prompt").forEach(btn => {
  btn.addEventListener("click", () => {
    const msg = encodeURIComponent(btn.dataset.msg + "\n\nThank you!");
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
  });
});

// Auto-open chat after 8s if not dismissed
setTimeout(() => {
  if (!chatOpen && !sessionStorage.getItem("gw_chat_shown")) {
    chatOpen = true;
    chatPanel.classList.add("open");
    iconOpen.style.display  = "none";
    iconClose.style.display = "flex";
    sessionStorage.setItem("gw_chat_shown", "1");
  }
}, 8000);