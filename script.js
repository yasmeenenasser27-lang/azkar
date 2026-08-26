// --- ضفنا هذا القسم الجديد للتحكم في حجم الخط ---
const fontDecreaseBtn = document.getElementById("font-decrease");
const fontIncreaseBtn = document.getElementById("font-increase");
const rootElement = document.documentElement; // عنصر html
let currentFontSize =
  parseFloat(
    getComputedStyle(rootElement).getPropertyValue("--base-font-size"),
  ) || 16;
const fontStep = 1;
const minFontSize = 12;
const maxFontSize = 24;

// استرجاع الحجم المحفوظ
if (localStorage.getItem("fontSize")) {
  currentFontSize = parseFloat(localStorage.getItem("fontSize"));
  rootElement.style.setProperty("--base-font-size", currentFontSize + "px");
}

fontDecreaseBtn.addEventListener("click", () => {
  if (currentFontSize > minFontSize) {
    currentFontSize -= fontStep;
    updateFontSize();
  }
});

fontIncreaseBtn.addEventListener("click", () => {
  if (currentFontSize < maxFontSize) {
    currentFontSize += fontStep;
    updateFontSize();
  }
});

function updateFontSize() {
  rootElement.style.setProperty("--base-font-size", currentFontSize + "px");
  localStorage.setItem("fontSize", currentFontSize + "px"); // حفظ الحجم
}
// --- نهاية القسم الجديد ---

// --- 1. إدارة التبويبات (Tabs) ---
function openTab(tabId) {
  // إخفاء كل المحتوى
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });
  // إزالة التفعيل من الأزرار
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // تفعيل التبويب المختار
  document.getElementById(tabId).classList.add("active");
  event.currentTarget.classList.add("active");
}

// --- 2. الوضع الليلي (Dark Mode) ---
const themeBtn = document.getElementById("theme-toggle");
const body = document.body;

// التحقق من الإعدادات المحفوظة
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark-mode");
  themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
}

themeBtn.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
    themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    localStorage.setItem("theme", "light");
    themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
  }
});

// --- 3. نظام التسبيح التفاعلي ---
// استرجاع البيانات عند الفتح
window.onload = () => {
  for (let i = 1; i <= 16; i++) {
    let id = "c" + i;
    let savedVal = localStorage.getItem(id);
    const card = document.getElementById(id);
    if (!card) continue; // تجاوز أي رقم غير موجود في الصفحة
    if (savedVal) {
      card.innerText = savedVal;
      // كل عدادات التسبيح هدفها 1000 (يطابق الـ onclick في HTML)
      updateProgress(id, savedVal, 1000);
      if (parseInt(savedVal) >= 1000) {
        card.closest(".counter-card").style.borderColor = "var(--accent-color)";
      }
    }
  }
  updateStreakDisplay();
  renderStatsPanel();
};

function incrementCounter(id, maxLimit, cardElement) {
  const span = document.getElementById(id);
  let val = parseInt(span.innerText);

  // اهتزاز الموبايل عند الضغط (يعمل على الجوالات الداعمة)
  if (navigator.vibrate) navigator.vibrate(40);

  if (val < maxLimit) {
    val++;
    span.innerText = val;
    localStorage.setItem(id, val);
    updateProgress(id, val, maxLimit);

    // تسجيل النشاط لليوم + الستريك + الإحصائيات
    const dhikrName = cardElement.querySelector("h3").innerText.trim();
    recordActivity(dhikrName, 1);

    // إذا اكتمل العداد
    if (val === maxLimit) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // اهتزاز مميز
      cardElement.style.borderColor = "var(--accent-color)";
    }
  }
}

// تحديث الدائرة حول العداد
function updateProgress(id, currentVal, maxVal) {
  const circle = document.getElementById("prog-" + id);
  const percentage = (currentVal / maxVal) * 1000;
  circle.style.background = `conic-gradient(var(--primary-color) ${percentage}%, var(--circle-bg) ${percentage}%)`;
}

// تصفير جميع العدادات
function resetCounters() {
  for (let i = 1; i <= 16; i++) {
    let id = "c" + i;
    document.getElementById(id).innerText = "0";
    localStorage.removeItem(id);
    updateProgress(id, 0, 100);
    document.getElementById("prog-" + id).parentElement.style.borderColor =
      "var(--border-color)";
  }
}
function decrementAzkar(btn, maxCount) {
  // جلب العنصر الذي يعرض العداد
  const badge = btn.previousElementSibling;

  // جلب الرقم الحالي، أو استخدام الرقم الأقصى إذا كانت هذه أول ضغطة
  let currentCount = parseInt(badge.getAttribute("data-count")) || maxCount;

  if (currentCount > 0) {
    currentCount--; // إنقاص العداد بمقدار 1
    badge.setAttribute("data-count", currentCount); // تحديث الرقم المخزن

    if (currentCount === 0) {
      // 1. تحديث العداد (البادج)
      badge.innerHTML = "0";
      badge.style.backgroundColor = " #484f51";
      badge.style.color = "#fff";

      // 2. التعديل المطلوب: تغيير نص زر "سبّح" إلى "اكتمل"
      btn.innerHTML = '<i class="fas fa-check"></i> اكتمل';
      btn.style.backgroundColor = "#484f51"; // تغيير لون الزر للأخضر
      btn.style.color = "#fff";
      btn.style.border = "none";

      // 3. تعطيل الزر
      btn.disabled = true;
      btn.style.cursor = "not-allowed";

      // 4. إخفات لون الكارت بالكامل لتمييز الأذكار المنتهية
      const azkarItem = btn.closest(".azkar-item, .azkar-sitem");
      if (azkarItem) {
        azkarItem.style.opacity = "0.5";
        azkarItem.style.transition = "opacity 0.3s ease";
      }
    } else {
      // إذا لم يصل لصفر بعد: اكتب "باقي كذا"
      badge.innerHTML = `باقي ${currentCount}`;
    }
  }
}

// --- 4ب. الستريك والإحصائيات الأسبوعية ---
function todayKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

function recordActivity(dhikrName, amount) {
  // إجمالي اليوم
  let daily = JSON.parse(localStorage.getItem("dailyStats") || "{}");
  const today = todayKey();
  daily[today] = (daily[today] || 0) + amount;
  localStorage.setItem("dailyStats", JSON.stringify(daily));

  // أكثر ذكر تكراراً (على مستوى الأسبوع الحالي)
  let weekDhikr = JSON.parse(localStorage.getItem("weekDhikrStats") || "{}");
  if (weekDhikr._weekStart !== getWeekStartKey()) {
    weekDhikr = { _weekStart: getWeekStartKey() };
  }
  weekDhikr[dhikrName] = (weekDhikr[dhikrName] || 0) + amount;
  localStorage.setItem("weekDhikrStats", JSON.stringify(weekDhikr));

  updateStreakDisplay(true);
  renderStatsPanel();
}

function getWeekStartKey() {
  const d = new Date();
  const day = d.getDay(); // 0 = الأحد
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

// يحدّث/يحسب سلسلة الأيام المتتالية بناءً على آخر يوم فيه نشاط
function updateStreakDisplay(justDidActivity = false) {
  const today = todayKey();
  const yesterday = todayKey(1);
  let lastActive = localStorage.getItem("lastActiveDate");
  let streak = parseInt(localStorage.getItem("streakCount") || "0");

  if (justDidActivity) {
    if (lastActive === today) {
      // النشاط اليوم محسوب بالفعل
    } else if (lastActive === yesterday) {
      streak += 1;
      localStorage.setItem("streakCount", streak);
      localStorage.setItem("lastActiveDate", today);
    } else {
      streak = 1;
      localStorage.setItem("streakCount", streak);
      localStorage.setItem("lastActiveDate", today);
    }
  } else {
    // مجرد فتح الصفحة: لو مرّ أكتر من يوم من غير نشاط، الستريك ينكسر بصرياً
    if (lastActive && lastActive !== today && lastActive !== yesterday) {
      streak = 0;
    }
  }

  document.querySelectorAll(".streak-count").forEach((el) => {
    el.innerText = streak;
  });
}

// يرسم لوحة الإحصائيات الأسبوعية (آخر 7 أيام) وأكثر ذكر تكراراً
function renderStatsPanel() {
  const container = document.getElementById("weekly-stats-bars");
  if (!container) return;

  const daily = JSON.parse(localStorage.getItem("dailyStats") || "{}");
  const dayLabels = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
  let bars = "";
  let maxVal = 1;
  const values = [];
  for (let i = 6; i >= 0; i--) {
    const key = todayKey(i);
    const val = daily[key] || 0;
    values.push({ key, val });
    if (val > maxVal) maxVal = val;
  }
  values.forEach(({ key, val }) => {
    const dayIndex = new Date(key).getDay();
    const heightPct = Math.max((val / maxVal) * 100, val > 0 ? 8 : 2);
    bars += `
      <div class="stat-bar-col">
        <div class="stat-bar-track">
          <div class="stat-bar-fill" style="height:${heightPct}%"></div>
        </div>
        <span class="stat-bar-val">${val}</span>
        <span class="stat-bar-label">${dayLabels[dayIndex]}</span>
      </div>`;
  });
  container.innerHTML = bars;

  // أكثر ذكر تكراراً هذا الأسبوع
  const weekDhikr = JSON.parse(localStorage.getItem("weekDhikrStats") || "{}");
  const topEl = document.getElementById("top-dhikr-name");
  if (topEl) {
    let topName = "—";
    let topCount = 0;
    Object.entries(weekDhikr).forEach(([name, count]) => {
      if (name === "_weekStart") return;
      if (count > topCount) {
        topCount = count;
        topName = name;
      }
    });
    topEl.innerText =
      topCount > 0 ? `${topName} (${topCount} مرة)` : "لا يوجد بعد";
  }

  const totalWeekEl = document.getElementById("week-total-count");
  if (totalWeekEl) {
    const total = values.reduce((sum, v) => sum + v.val, 0);
    totalWeekEl.innerText = total;
  }
}

// --- 5. نسخ الأدعية (Copy to Clipboard) ---
function copyText(elementId) {
  const text = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast();
  });
}

function showToast() {
  const toast = document.getElementById("toast");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// --- 6. مشغل الصوت (Audio Player) ---
let currentPlayingId = null;

function togglePlay(audioId, btn) {
  const audio = document.getElementById(audioId);
  const icon = btn.querySelector("i");

  // إذا كان هناك صوت آخر يعمل، قم بإيقافه
  if (currentPlayingId && currentPlayingId !== audioId) {
    document.getElementById(currentPlayingId).pause();
    let oldBtn = document.querySelector(
      `[onclick="togglePlay('${currentPlayingId}', this)"] i`,
    );
    if (oldBtn) {
      oldBtn.className = "fas fa-play";
    }
  }

  if (audio.paused) {
    audio.play();
    icon.className = "fas fa-pause";
    currentPlayingId = audioId;
  } else {
    audio.pause();
    icon.className = "fas fa-play";
    currentPlayingId = null;
  }

  // إرجاع الأيقونة عند انتهاء المقطع
  audio.onended = () => {
    icon.className = "fas fa-play";
    currentPlayingId = null;
  };
}
// دوال المشاركة لكل منصة
function getShareText() {
  return encodeURIComponent(
    "صدقة جارية - نسألكم الدعاء والمشاركة: " + window.location.href,
  );
}

function shareWhatsApp() {
  window.open(`https://api.whatsapp.com/send?text=${getShareText()}`, "_blank");
}

function shareFacebook() {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    "_blank",
  );
}

function shareTwitter() {
  window.open(
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
    "_blank",
  );
}

function shareTelegram() {
  window.open(
    `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}`,
    "_blank",
  );
}

function shareMessenger() {
  window.open(
    `fb-messenger://share?link=${encodeURIComponent(window.location.href)}`,
    "_blank",
  );
}

// دالة المشاركة العامة من الموبايل
function nativeShare() {
  if (navigator.share) {
    navigator.share({
      title: "صدقة جارية",
      url: window.location.href,
    });
  } else {
    copyShareLink();
  }
}
function copyShareLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    alert("تم نسخ الرابط بنجاح!");
  });
}
