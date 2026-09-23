
"use strict";

/* =====================================================
   PASPA GO - DIARY CALENDAR
===================================================== */

const diaryState = {
  view: "month",
  selectedDate: new Date(),
  records: [],
  loading: false
};


/* =====================================================
   ELEMENT
===================================================== */

const diaryCalendar =
  document.getElementById("diariCalendar");

const diaryPeriodTitle =
  document.getElementById("diariPeriodTitle");

const diaryEntryList =
  document.getElementById("diariEntryList");

const diarySelectedTitle =
  document.getElementById("diariSelectedTitle");

const diaryFormSection =
  document.getElementById("diariFormSection");

const diaryForm =
  document.getElementById("diariForm");

const diaryMessage =
  document.getElementById("diariMessage");


/* =====================================================
   SESSION
===================================================== */

function diarySessionEmail() {

  try {

    const session = JSON.parse(
      localStorage.getItem("paspaGoSession")
    );

    if (
      !session ||
      session.isLoggedIn !== true
    ) {
      return "";
    }

    return String(
      session.googleEmail ||
      session.email ||
      ""
    ).trim().toLowerCase();

  } catch (error) {

    return "";

  }

}


/* =====================================================
   DATE HELPERS
===================================================== */

function diaryDateKey(date) {

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return year + "-" + month + "-" + day;

}


function diaryDateLabel(date) {

  return date.toLocaleDateString(
    "ms-MY",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );

}


function diaryLongDate(date) {

  return date.toLocaleDateString(
    "ms-MY",
    {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  );

}


function diaryAddDays(date, days) {

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days,
    12
  );

}


function diaryStartOfWeek(date) {

  const mondayOffset =
    (date.getDay() + 6) % 7;

  return diaryAddDays(
    date,
    -mondayOffset
  );

}


/* =====================================================
   SAFE TEXT
===================================================== */

function diaryEscape(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

}


/* =====================================================
   MESEJ
===================================================== */

function showDiaryMessage(text, success) {

  diaryMessage.textContent = text;

  diaryMessage.className =
    success
      ? "diari-message success"
      : "diari-message";

  diaryMessage.hidden = false;

}


function hideDiaryMessage() {

  diaryMessage.hidden = true;

}


/* =====================================================
   BMI
===================================================== */

function diaryBmiStatus(value) {

  const bmi = Number(value);

  if (!Number.isFinite(bmi) || bmi <= 0) {
    return "Tiada rekod";
  }

  if (bmi < 18.5) {
    return "Kurang berat badan";
  }

  if (bmi < 25) {
    return "Normal";
  }

  if (bmi < 30) {
    return "Berat badan berlebihan";
  }

  return "Obesiti";

}


function renderDiaryBmi(fitness) {

  fitness = fitness || {};

  const weight = Number(
    fitness.beratKg
  );

  const height = Number(
    fitness.tinggiCm
  );

  const bmi = Number(
    fitness.bmi
  );

  document.getElementById(
    "bmiWeight"
  ).textContent =
    weight > 0 ? weight : "—";

  document.getElementById(
    "bmiHeight"
  ).textContent =
    height > 0 ? height : "—";

  document.getElementById(
    "bmiValue"
  ).textContent =
    bmi > 0 ? bmi.toFixed(1) : "—";

  document.getElementById(
    "bmiStatus"
  ).textContent =
    diaryBmiStatus(bmi);

  let dateText = "—";

  if (fitness.tarikh) {

    const date = new Date(
      fitness.tarikh
    );

    if (!isNaN(date.getTime())) {
      dateText = diaryDateLabel(date);
    }

  }

  document.getElementById(
    "bmiDate"
  ).textContent =
    "Tarikh rekod: " + dateText;

}


/* =====================================================
   DATA
===================================================== */

async function loadDiaryCalendar() {

  const email = diarySessionEmail();

  if (!email) {

    window.location.href =
      "../index.html";

    return;

  }

  if (diaryState.loading) {
    return;
  }

  diaryState.loading = true;

  try {

    const result = await apiPost({

      action: "diary_calendar_list",

      email: email

    });

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Diari tidak dapat dimuatkan."
      );

    }

    diaryState.records =
      Array.isArray(result.diary)
        ? result.diary
        : [];

    renderDiaryBmi(
      result.fitness
    );

    renderDiaryCalendar();

  } catch (error) {

    console.error(
      "LOAD DIARY ERROR:",
      error
    );

    showDiaryMessage(
      error.message ||
      "Ralat memuatkan diari.",
      false
    );

  } finally {

    diaryState.loading = false;

  }

}


/* =====================================================
   KIRA CATATAN TARIKH
===================================================== */

function diaryRecordsForDate(date) {

  const key = diaryDateKey(date);

  return diaryState.records.filter(
    function (record) {

      return record.tarikh === key;

    }
  );

}


/* =====================================================
   PILIH TARIKH
===================================================== */

function selectDiaryDate(date) {

  diaryState.selectedDate =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12
    );

  renderDiaryCalendar();

  renderDiaryEntries();

  openDiaryForm();

}


/* =====================================================
   TAJUK KALENDAR
===================================================== */

function renderDiaryPeriodTitle() {

  const date =
    diaryState.selectedDate;

  if (diaryState.view === "month") {

    diaryPeriodTitle.textContent =
      date.toLocaleDateString(
        "ms-MY",
        {
          month: "long",
          year: "numeric"
        }
      );

    return;

  }

  if (diaryState.view === "week") {

    const start =
      diaryStartOfWeek(date);

    const end =
      diaryAddDays(start, 6);

    diaryPeriodTitle.textContent =
      diaryDateLabel(start) +
      " – " +
      diaryDateLabel(end);

    return;

  }

  diaryPeriodTitle.textContent =
    diaryLongDate(date);

}


/* =====================================================
   BULANAN
===================================================== */

function renderDiaryMonth() {

  const selected =
    diaryState.selectedDate;

  const firstDay = new Date(
    selected.getFullYear(),
    selected.getMonth(),
    1,
    12
  );

  const start =
    diaryStartOfWeek(firstDay);

  const monthEnd = new Date(
    selected.getFullYear(),
    selected.getMonth() + 1,
    0,
    12
  );

  const endOffset =
    (7 - monthEnd.getDay()) % 7;

  const end =
    diaryAddDays(
      monthEnd,
      endOffset
    );

  const totalDays =
    Math.round(
      (end - start) / 86400000
    ) + 1;

  const weekdays = [
    "Isn",
    "Sel",
    "Rab",
    "Kha",
    "Jum",
    "Sab",
    "Aha"
  ];

  const grid =
    document.createElement("div");

  grid.className =
    "diari-month-grid";

  weekdays.forEach(
    function (day) {

      const heading =
        document.createElement("div");

      heading.className =
        "diari-weekday";

      heading.textContent = day;

      grid.appendChild(
        heading
      );

    }
  );

  const todayKey =
    diaryDateKey(new Date());

  const selectedKey =
    diaryDateKey(selected);

  for (
    let index = 0;
    index < totalDays;
    index++
  ) {

    const date =
      diaryAddDays(
        start,
        index
      );

    const key =
      diaryDateKey(date);

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "diari-day";

    if (
      date.getMonth() !==
      selected.getMonth()
    ) {

      button.classList.add(
        "outside"
      );

    }

    if (key === todayKey) {

      button.classList.add(
        "today"
      );

    }

    if (key === selectedKey) {

      button.classList.add(
        "selected"
      );

    }

    const number =
      document.createElement("span");

    number.className =
      "diari-day-number";

    number.textContent =
      date.getDate();

    button.appendChild(
      number
    );

    if (
      diaryRecordsForDate(date).length
    ) {

      const dot =
        document.createElement("span");

      dot.className =
        "diari-dot";

      button.appendChild(
        dot
      );

    }

    button.addEventListener(
      "click",
      function () {

        selectDiaryDate(date);

      }
    );

    grid.appendChild(
      button
    );

  }

  diaryCalendar.appendChild(
    grid
  );

}


/* =====================================================
   MINGGUAN / HARIAN
===================================================== */

function renderDiaryPeriodDays() {

  const selected =
    diaryState.selectedDate;

  const isWeek =
    diaryState.view === "week";

  const start =
    isWeek
      ? diaryStartOfWeek(selected)
      : selected;

  const total =
    isWeek ? 7 : 1;

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "diari-period-list";

  for (
    let index = 0;
    index < total;
    index++
  ) {

    const date =
      diaryAddDays(
        start,
        index
      );

    const records =
      diaryRecordsForDate(date);

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "diari-period-day";

    if (
      diaryDateKey(date) ===
      diaryDateKey(selected)
    ) {

      button.classList.add(
        "selected"
      );

    }

    const heading =
      document.createElement("strong");

    heading.textContent =
      diaryLongDate(date);

    const count =
      document.createElement("span");

    count.textContent =
      records.length +
      " catatan";

    button.appendChild(
      heading
    );

    button.appendChild(
      count
    );

    button.addEventListener(
      "click",
      function () {

        selectDiaryDate(date);

      }
    );

    wrapper.appendChild(
      button
    );

  }

  diaryCalendar.appendChild(
    wrapper
  );

}


/* =====================================================
   RENDER KALENDAR
===================================================== */

function renderDiaryCalendar() {

  diaryCalendar.innerHTML = "";

  renderDiaryPeriodTitle();

  if (
    diaryState.view === "month"
  ) {

    renderDiaryMonth();

  } else {

    renderDiaryPeriodDays();

  }

  renderDiaryEntries();

}


/* =====================================================
   CATATAN TARIKH DIPILIH
===================================================== */

function renderDiaryEntries() {

  const date =
    diaryState.selectedDate;

  diarySelectedTitle.textContent =
    "Catatan " +
    diaryDateLabel(date);

  const records =
    diaryRecordsForDate(date);

  diaryEntryList.innerHTML = "";

  if (!records.length) {

    diaryEntryList.innerHTML =
      '<p class="diari-empty">' +
      'Tiada catatan pada tarikh ini.' +
      '</p>';

    return;

  }

  records.forEach(
    function (record) {

      const item =
        document.createElement("div");

      item.className =
        "diari-entry-item";

      item.innerHTML =
        "<h3>" +
          diaryEscape(
            record.perkara
          ) +
        "</h3>" +

        "<p><strong>Jenis:</strong> " +
          diaryEscape(
            record.jenis
          ) +
        "</p>" +

        "<p><strong>Masa:</strong> " +
          diaryEscape(
            record.masa
          ) +
        "</p>" +

        "<p><strong>Catatan:</strong> " +
          diaryEscape(
            record.catatan || "—"
          ) +
        "</p>";

      diaryEntryList.appendChild(
        item
      );

    }
  );

}


/* =====================================================
   BUKA BORANG
===================================================== */

function openDiaryForm() {

  diaryForm.reset();

  document.getElementById(
    "diariTarikh"
  ).value =
    diaryDateKey(
      diaryState.selectedDate
    );

  document.getElementById(
    "diariOtherWrap"
  ).hidden = true;

  diaryFormSection.hidden = false;

  diaryFormSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/* =====================================================
   TUTUP BORANG
===================================================== */

function closeDiaryForm() {

  diaryFormSection.hidden = true;

  diaryForm.reset();

}


/* =====================================================
   SIMPAN CATATAN
===================================================== */

async function saveDiaryEntry(event) {

  event.preventDefault();

  const email =
    diarySessionEmail();

  if (!email) {

    window.location.href =
      "../index.html";

    return;

  }

  const jenisSelect =
    document.getElementById(
      "diariJenis"
    ).value;

  const jenis =
    jenisSelect === "Lain-lain"
      ? document.getElementById(
          "diariOther"
        ).value.trim()
      : jenisSelect;

  const data = {

    tarikh:
      document.getElementById(
        "diariTarikh"
      ).value,

    perkara:
      document.getElementById(
        "diariPerkara"
      ).value.trim(),

    jenis: jenis,

    masa:
      document.getElementById(
        "diariMasa"
      ).value,

    catatan:
      document.getElementById(
        "diariCatatan"
      ).value.trim()

  };

  if (!jenis) {

    showDiaryMessage(
      "Sila lengkapkan jenis aktiviti.",
      false
    );

    return;

  }

  const saveButton =
    document.getElementById(
      "diariSave"
    );

  saveButton.disabled = true;

  saveButton.textContent =
    "MENYIMPAN...";

  hideDiaryMessage();

  try {

    const result =
      await apiPost({

        action:
          "diary_calendar_create",

        email: email,

        data: data

      });

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Catatan gagal disimpan."
      );

    }

    closeDiaryForm();

    const parts =
      data.tarikh.split("-");

    diaryState.selectedDate =
      new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2]),
        12
      );

    await loadDiaryCalendar();

    showDiaryMessage(
      "Catatan berjaya disimpan.",
      true
    );

  } catch (error) {

    console.error(
      "SAVE DIARY ERROR:",
      error
    );

    showDiaryMessage(
      error.message ||
      "Ralat menyimpan catatan.",
      false
    );

  } finally {

    saveButton.disabled = false;

    saveButton.textContent =
      "SIMPAN";

  }

}


/* =====================================================
   NAVIGASI KALENDAR
===================================================== */

function moveDiaryPeriod(direction) {

  const date =
    diaryState.selectedDate;

  if (
    diaryState.view === "month"
  ) {

    const target = new Date(
      date.getFullYear(),
      date.getMonth() + direction,
      1,
      12
    );

    const lastDay = new Date(
      target.getFullYear(),
      target.getMonth() + 1,
      0
    ).getDate();

    diaryState.selectedDate =
      new Date(
        target.getFullYear(),
        target.getMonth(),
        Math.min(
          date.getDate(),
          lastDay
        ),
        12
      );

  } else {

    diaryState.selectedDate =
      diaryAddDays(
        date,
        direction *
        (
          diaryState.view === "week"
            ? 7
            : 1
        )
      );

  }

  renderDiaryCalendar();

}


/* =====================================================
   EVENTS
===================================================== */

document.getElementById(
  "diariBack"
).addEventListener(
  "click",
  function () {

    window.location.href =
      "dashboard.html";

  }
);


document.getElementById(
  "diariHome"
).addEventListener(
  "click",
  function () {

    window.location.href =
      "dashboard.html";

  }
);


document.getElementById(
  "diariToday"
).addEventListener(
  "click",
  function () {

    diaryState.selectedDate =
      new Date();

    renderDiaryCalendar();

  }
);


document.getElementById(
  "diariPrevious"
).addEventListener(
  "click",
  function () {

    moveDiaryPeriod(-1);

  }
);


document.getElementById(
  "diariNext"
).addEventListener(
  "click",
  function () {

    moveDiaryPeriod(1);

  }
);


document.querySelectorAll(
  "[data-view]"
).forEach(
  function (button) {

    button.addEventListener(
      "click",
      function () {

        diaryState.view =
          button.dataset.view;

        document.querySelectorAll(
          "[data-view]"
        ).forEach(
          function (item) {

            item.classList.toggle(
              "active",
              item === button
            );

          }
        );

        renderDiaryCalendar();

      }
    );

  }
);


document.getElementById(
  "diariAddButton"
).addEventListener(
  "click",
  openDiaryForm
);


document.getElementById(
  "diariCancel"
).addEventListener(
  "click",
  closeDiaryForm
);


document.getElementById(
  "diariJenis"
).addEventListener(
  "change",
  function () {

    const other =
      this.value === "Lain-lain";

    document.getElementById(
      "diariOtherWrap"
    ).hidden = !other;

    document.getElementById(
      "diariOther"
    ).required = other;

  }
);


diaryForm.addEventListener(
  "submit",
  saveDiaryEntry
);


/* =====================================================
   START
===================================================== */

loadDiaryCalendar();
