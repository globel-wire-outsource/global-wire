/* ================================================================
   GLOBAL WIRE — script.js
   Upgrade: Word Reveals · Parallax · Swipe Dots · Pinned Call Bar
   ================================================================ */

const EMAILJS_PUBLIC  = "bn3bUFzlIJWgCV6Be";
const EMAILJS_SERVICE = "service_hpyva7lt";
const EMAILJS_TMPL    = "template_z2hqgtj";
const WA_NUMBER       = "27754320577";
const OWNER_EMAIL     = "globelwireoutsource@gmail.com";

// ── EMAILJS — safe init, called once SDK is confirmed ready ──
function initEmailJS() {
  if (typeof emailjs !== "undefined") {
    try { emailjs.init({ publicKey: EMAILJS_PUBLIC }); }
    catch (e) { console.warn("EmailJS init:", e); }
  }
}

// ── LOADER ───────────────────────────────────────────────────
const loaderEl = document.getElementById("loader");

window.addEventListener("load", () => {
  initEmailJS(); // init here — SDK is guaranteed loaded at this point
  setTimeout(() => {
    loaderEl.classList.add("gone");
    initWordReveal();
    revealPage("home");
    animateStats();
    setTimeout(initPopia, 900);
    setTimeout(initChatAutoOpen, 9000);
  }, 1900);
});

// ── WORD REVEAL ───────────────────────────────────────────────
// Splits hero title into individual .word spans and staggers them in
function initWordReveal() {
  const title = document.getElementById("heroTitle");
  if (!title) return;

  // Walk text nodes and element nodes to preserve <br> and <em>
  function splitNode(node, baseDelay, delayStep) {
    let delay = baseDelay;
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      words.forEach(part => {
        if (!part.trim()) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement("span");
          span.className = "word";
          span.textContent = part;
          span.style.transitionDelay = delay + "ms";
          delay += delayStep;
          frag.appendChild(span);
        }
      });
      node.parentNode.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE &&
               node.tagName !== "BR") {
      // Clone to iterate, since we'll be modifying childNodes
      const children = Array.from(node.childNodes);
      children.forEach(child => {
        delay = splitNode(child, delay, delayStep);
      });
    }
    return delay;
  }

  // Use 100ms base delay (after kicker), 120ms between words
  splitNode(title, 160, 120);
}

// Trigger word reveals for the hero heading
function triggerWordReveal() {
  const words = document.querySelectorAll("#heroTitle .word");
  words.forEach(w => w.classList.add("vis"));
}

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

// ── ANIMATED COUNTERS ─────────────────────────────────────────
function animateStats() {
  const nums = document.querySelectorAll(".stat-num[data-target]");
  nums.forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || "";
    const dur    = 1800, step = 16;
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

// ── PARALLAX ──────────────────────────────────────────────────
const parallaxBg   = document.getElementById("parallaxBg");
const decoLeft     = document.getElementById("decoLeft");
const decoRight    = document.getElementById("decoRight");
const heroPage     = document.getElementById("page-home");

function handleParallax() {
  if (!heroPage || currentTab !== "home") return;
  const scrollY = heroPage.scrollTop;

  // Subtle grid moves slower than content
  if (parallaxBg) {
    parallaxBg.style.transform = `translateY(${scrollY * 0.25}px)`;
  }
  // Deco lines move at different speed for depth
  if (decoLeft)  decoLeft.style.transform  = `translateY(${scrollY * 0.15}px)`;
  if (decoRight) decoRight.style.transform = `translateY(${scrollY * 0.1}px)`;
}

if (heroPage) {
  heroPage.addEventListener("scroll", handleParallax, { passive: true });
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
  const goRight = TAB_ORDER.indexOf(tabName) > TAB_ORDER.indexOf(currentTab);

  // Exit
  outPage.style.cssText = `opacity:0; transform:translateX(${goRight ? "-28px" : "28px"}); transition:opacity 0.38s ease, transform 0.38s ease; pointer-events:none;`;

  setTimeout(() => {
    outPage.classList.remove("active");
    outPage.style.cssText = "";

    inPage.style.cssText = `opacity:0; transform:translateX(${goRight ? "28px" : "-28px"}); pointer-events:all;`;
    inPage.classList.add("active");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inPage.style.cssText = `opacity:1; transform:translateX(0); transition:opacity 0.55s cubic-bezier(0,0,0.2,1), transform 0.55s cubic-bezier(0,0,0.2,1); pointer-events:all;`;

        setTimeout(() => {
          inPage.style.cssText = "";
          isTransitioning = false;
          currentTab      = tabName;
          inPage.scrollTop = 0;
          revealPage(tabName);

          if (tabName === "home") {
            animateStats();
            triggerWordReveal();
          }

          if (prefillService && tabName === "booking") {
            const sel = document.getElementById("fservice");
            if (sel) for (const opt of sel.options) {
              if (opt.value === prefillService) { sel.value = prefillService; break; }
            }
          }
        }, 570);
      });
    });
  }, 300);

  // Nav indicators
  document.querySelectorAll(".nt").forEach(b  => b.classList.toggle("active",  b.dataset.tab === tabName));
  document.querySelectorAll(".mnt").forEach(b => b.classList.toggle("active", b.dataset.tab === tabName));

  closeDrawer();
}

// ── REVEAL ITEMS ──────────────────────────────────────────────
function revealPage(tabName) {
  const page  = document.getElementById("page-" + tabName);
  const items = page.querySelectorAll(".ri:not(.vis)");
  items.forEach((el, i) => {
    const base  = parseInt(el.dataset.d || 0);
    const delay = base + i * 50;
    setTimeout(() => el.classList.add("vis"), delay);
  });
  // Trigger word reveal when returning to home
  if (tabName === "home") {
    setTimeout(triggerWordReveal, 200);
  }
}

// ── NAV TABS ──────────────────────────────────────────────────
document.querySelectorAll(".nt").forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// ── DELEGATE [data-goto] ──────────────────────────────────────
document.addEventListener("click", e => {
  const el = e.target.closest("[data-goto]");
  if (!el) return;
  switchTab(el.dataset.goto, el.dataset.service || null);
});

// ── DRAWER ────────────────────────────────────────────────────
const navHam      = document.getElementById("navHam");
const drawer      = document.getElementById("drawer");
const drawerVeil  = document.getElementById("drawerVeil");
const drawerClose = document.getElementById("drawerClose");

function openDrawer()  { drawer.classList.add("open"); drawerVeil.classList.add("open"); navHam.setAttribute("aria-expanded","true"); }
function closeDrawer() { drawer.classList.remove("open"); drawerVeil.classList.remove("open"); navHam.setAttribute("aria-expanded","false"); }

navHam.addEventListener("click",       openDrawer);
drawerClose.addEventListener("click",  closeDrawer);
drawerVeil.addEventListener("click",   closeDrawer);
document.querySelectorAll(".mnt").forEach(btn => {
  btn.addEventListener("click", () => { switchTab(btn.dataset.tab); closeDrawer(); });
});

// ── SWIPEABLE CARDS — DOT INDICATORS ─────────────────────────
const swipeTrack = document.getElementById("svcSwipeTrack");
const swipeDots  = document.querySelectorAll(".sdot");

function updateSwipeDots() {
  if (!swipeTrack) return;
  const cards = swipeTrack.querySelectorAll(".svc-card-m");
  const scrollLeft = swipeTrack.scrollLeft;
  const cardWidth  = cards[0]?.offsetWidth + 16 || 1; // width + gap
  const activeIdx  = Math.round(scrollLeft / cardWidth);

  swipeDots.forEach((dot, i) => {
    dot.classList.toggle("active", i === activeIdx);
  });
}

if (swipeTrack) {
  swipeTrack.addEventListener("scroll", updateSwipeDots, { passive: true });

  // Dot clicks scroll to that card
  swipeDots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      const cards   = swipeTrack.querySelectorAll(".svc-card-m");
      const target  = cards[i];
      if (target) {
        swipeTrack.scrollTo({
          left: target.offsetLeft - 20,
          behavior: "smooth"
        });
      }
    });
  });
}

// ── REMOVAL → WHATSAPP ────────────────────────────────────────
function openRemovalWA() {
  const msg = encodeURIComponent(
    "Hello Global Wire,\n\n" +
    "I would like to enquire about your *Removal Services*.\n\n" +
    "Could you please provide a quote and confirm available dates?\n\nThank you."
  );
  window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
}

const removalBtnD = document.getElementById("removalBtnDesktop");
const removalBtnM = document.getElementById("removalBtnMobile");
if (removalBtnD) removalBtnD.addEventListener("click", openRemovalWA);
if (removalBtnM) removalBtnM.addEventListener("click", openRemovalWA);

// ── MULTI-STEP BOOKING ────────────────────────────────────────
let currentStep = 1;
const stepFill   = document.getElementById("stepFill");
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

  const pcts = { 1: 16.6, 2: 50, 3: 100 };
  stepFill.style.width = pcts[currentStep] + "%";

  stepLabels.forEach(s => {
    const sn = parseInt(s.dataset.s);
    s.classList.toggle("active", sn === currentStep);
    s.classList.toggle("done",   sn < currentStep);
  });

  // Smooth scroll to top of form on mobile
  const form = document.getElementById("bookingForm");
  if (form && window.innerWidth < 680) {
    setTimeout(() => form.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }
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
  }, 2600);
}

function buildReview() {
  const g = id => document.getElementById(id)?.value?.trim() || "—";
  const fields = [
    { lbl: "Full Name",      val: g("fname"),    gold: false },
    { lbl: "Email",          val: g("femail"),   gold: false },
    { lbl: "Phone",          val: g("fphone") || "—",  gold: false },
    { lbl: "Address",        val: g("faddress") || "—", gold: false },
    { lbl: "Service",        val: document.getElementById("fservice").value, gold: true },
    { lbl: "Date",           val: g("fdate") || "Flexible", gold: false },
    { lbl: "Time",           val: document.getElementById("ftime")?.value || "Flexible", gold: false },
    { lbl: "Notes",          val: g("fmsg") || "None", gold: false },
  ];
  document.getElementById("reviewGrid").innerHTML = fields.map(f =>
    `<div class="review-row">
       <span class="rlbl">${f.lbl}</span>
       <span class="rval${f.gold ? " gold" : ""}">${f.val}</span>
     </div>`
  ).join("");
}

["toStep2","toStep3","toStep1","toStep2b"].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  const target = { toStep2:2, toStep3:3, toStep1:1, toStep2b:2 }[id];
  el.addEventListener("click", () => goToStep(target));
});

// ── FORM SUBMIT ───────────────────────────────────────────────
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

    // Collect all field values
    const nameVal    = document.getElementById("fname").value.trim();
    const emailVal   = document.getElementById("femail").value.trim();
    const phoneVal   = document.getElementById("fphone").value.trim()   || "Not provided";
    const serviceVal = document.getElementById("fservice").value;
    const addrVal    = document.getElementById("faddress").value.trim() || "Not provided";
    const dateVal    = document.getElementById("fdate").value           || "Flexible";
    const timeVal    = document.getElementById("ftime")?.value          || "Flexible";
    const msgVal     = document.getElementById("fmsg").value.trim()     || "None";

    // All possible template variable names so it works regardless of template setup
    const params = {
      // Primary variables (matching the EmailJS template)
      from_name:      nameVal,
      from_email:     emailVal,
      reply_to:       emailVal,
      to_name:        "Global Wire",
      // Common aliases
      name:           nameVal,
      email:          emailVal,
      phone:          phoneVal,
      service:        serviceVal,
      address:        addrVal,
      preferred_date: dateVal,
      preferred_time: timeVal,
      message:        msgVal,
      // Extra
      subject:        "New Booking: " + serviceVal,
      time:           dateVal + " at " + timeVal,
    };

    // ── ATTEMPT 1: EmailJS ────────────────────────────────────
    let emailJSSent = false;

    if (typeof emailjs !== "undefined") {
      try {
        const result = await emailjs.send(EMAILJS_SERVICE, EMAILJS_TMPL, params);
        console.log("EmailJS OK:", result.status, result.text);
        emailJSSent = true;
      } catch (err) {
        console.error("EmailJS failed:", JSON.stringify(err));
        emailJSSent = false;
      }
    }

    setLoading(false);

    if (emailJSSent) {
      // ── SUCCESS ──────────────────────────────────────────────
      showStatus("ok",
        "Your booking has been submitted successfully. We will contact you shortly to confirm."
      );
      bookingForm.reset();
      goToStep(1);

    } else {
      // ── FALLBACK: open their email app pre-filled ─────────────
      // Build a clean mailto body with all booking details
      const mailBody = [
        "BOOKING REQUEST — GLOBAL WIRE",
        "================================",
        "",
        "Full Name:      " + nameVal,
        "Email:          " + emailVal,
        "Phone:          " + phoneVal,
        "Service:        " + serviceVal,
        "Address:        " + addrVal,
        "Preferred Date: " + dateVal,
        "Preferred Time: " + timeVal,
        "Notes:          " + msgVal,
        "",
        "================================",
        "Sent from the Global Wire website.",
      ].join("
");

      const mailSubject = encodeURIComponent("Booking Request: " + serviceVal + " — " + nameVal);
      const mailBodyEnc = encodeURIComponent(mailBody);
      const mailtoLink  = "mailto:" + OWNER_EMAIL + "?subject=" + mailSubject + "&body=" + mailBodyEnc;

      // Open their email client with everything pre-filled
      window.location.href = mailtoLink;

      showStatus("ok",
        "Your email app is opening with your booking details pre-filled. Simply press Send to confirm your booking."
      );
    }
  });
}

function showStatus(type, msg) { formStatus.className = "f-status " + type; formStatus.textContent = msg; }
function clearStatus()         { formStatus.className = "f-status"; formStatus.textContent = ""; }
function setLoading(on) {
  submitBtn.disabled    = on;
  btnText.style.display = on ? "none" : "";
  btnSpin.style.display = on ? "inline-block" : "none";
}

// ── LIVE CHAT ─────────────────────────────────────────────────
const chatToggle = document.getElementById("chatToggle");
const chatPanel  = document.getElementById("chatPanel");
const chatBadge  = document.getElementById("chatBadge");
const iconOpen   = chatToggle.querySelector(".chat-icon-open");
const iconClose  = chatToggle.querySelector(".chat-icon-close");
let chatOpen     = false;

function setChatOpen(open) {
  chatOpen = open;
  chatPanel.classList.toggle("open", open);
  iconOpen.style.display  = open ? "none" : "flex";
  iconClose.style.display = open ? "flex" : "none";
  chatToggle.setAttribute("aria-expanded", open.toString());
  if (open && chatBadge) chatBadge.style.display = "none";
}

chatToggle.addEventListener("click", () => setChatOpen(!chatOpen));

document.querySelectorAll(".chat-prompt").forEach(btn => {
  btn.addEventListener("click", () => {
    const msg = encodeURIComponent(btn.dataset.msg + "\n\nThank you.");
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");
  });
});

function initChatAutoOpen() {
  if (!chatOpen && !sessionStorage.getItem("gw_chat_v2")) {
    setChatOpen(true);
    sessionStorage.setItem("gw_chat_v2", "1");
  }
}

// ── KEYBOARD ACCESSIBILITY ────────────────────────────────────
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeDrawer();
    if (chatOpen) setChatOpen(false);
  }
});
