
"use strict";

/* =====================================================
   PASPA GO - DIARY CALENDAR
===================================================== */

const diaryState = {
  view: "month",
  selectedDate: new Date(),
  records: [],
  loading: false,
  editingDiaryId: null
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

/* =====================================================
   CATATAN BAGI SETIAP TARIKH DALAM JULAT
===================================================== */

function diaryRecordsForDate(date) {

  const key = diaryDateKey(date);

  return diaryState.records.filter(
    function (record) {

      const mula = String(
        record.tarikh || ""
      ).trim();

      const tamat = String(
        record.tarikhTamat ||
        record.tarikh ||
        ""
      ).trim();

      if (!mula) {
        return false;
      }

      return (
        key >= mula &&
        key <= tamat
      );

    }
  );

}



/* =====================================================
   WARNA BAR PERISTIWA DIARI
===================================================== */

const DIARY_EVENT_COLORS = [
  "#169B83",
  "#E38B32",
  "#7955C7",
  "#2774C7",
  "#D65C83",
  "#698D2F",
  "#B65B43",
  "#168DA5"
];


/* =====================================================
   WARNA TETAP BERDASARKAN DIARY_ID
===================================================== */

function diaryEventColor(record) {

  const id = String(
    record.diaryId ||
    record.perkara ||
    ""
  );

  let hash = 0;

  for (
    let i = 0;
    i < id.length;
    i++
  ) {

    hash =
      (
        hash * 31 +
        id.charCodeAt(i)
      ) >>> 0;

  }

  return DIARY_EVENT_COLORS[
    hash % DIARY_EVENT_COLORS.length
  ];

}


/* =====================================================
   SEMAK PERISTIWA BERBILANG HARI
===================================================== */

function diaryIsMultiDay(record) {

  return Boolean(
    record.tarikh &&
    record.tarikhTamat &&
    record.tarikhTamat >
      record.tarikh
  );

}


/* =====================================================
   SUSUN BAR SUPAYA TIDAK BERTINDIH
===================================================== */

function diaryBuildEventLanes() {

  const events =
    diaryState.records
      .filter(diaryIsMultiDay)
      .slice()
      .sort(function (a, b) {

        return (
          a.tarikh.localeCompare(
            b.tarikh
          ) ||

          b.tarikhTamat.localeCompare(
            a.tarikhTamat
          ) ||

          String(
            a.diaryId || ""
          ).localeCompare(
            String(
              b.diaryId || ""
            )
          )
        );

      });

  const laneEnds = [];

  const eventLanes = new Map();

  events.forEach(
    function (record) {

      let lane = 0;

      while (
        lane < laneEnds.length &&
        laneEnds[lane] >=
          record.tarikh
      ) {

        lane++;

      }

      laneEnds[lane] =
        record.tarikhTamat;

      eventLanes.set(
        record.diaryId,
        lane
      );

    }
  );

  return eventLanes;

}

/* =====================================================
   PILIH TARIKH
===================================================== */

/* =====================================================
   PILIH TARIKH TANPA BUKA BORANG
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

/* =====================================================
   KALENDAR BULANAN - BAR BERBILANG HARI
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

      heading.textContent =
        day;

      grid.appendChild(
        heading
      );

    }
  );

  const todayKey =
    diaryDateKey(
      new Date()
    );

  const selectedKey =
    diaryDateKey(
      selected
    );

  const eventLanes =
    diaryBuildEventLanes();

  const MAX_VISIBLE_LANES = 4;

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

    const records =
      diaryRecordsForDate(date);

    const button =
      document.createElement(
        "button"
      );

    button.type =
      "button";

    button.className =
      "diari-day";

    button.setAttribute(
      "aria-label",
      diaryLongDate(date) +
      ", " +
      records.length +
      " catatan"
    );

    if (
      date.getMonth() !==
      selected.getMonth()
    ) {

      button.classList.add(
        "outside"
      );

    }

    if (
      key === todayKey
    ) {

      button.classList.add(
        "today"
      );

    }

    if (
      key === selectedKey
    ) {

      button.classList.add(
        "selected"
      );

    }

    /* NOMBOR TARIKH */

    const number =
      document.createElement(
        "span"
      );

    number.className =
      "diari-day-number";

    number.textContent =
      date.getDate();

    button.appendChild(
      number
    );

    /* KAWASAN BAR */

    const eventArea =
      document.createElement(
        "div"
      );

    eventArea.className =
      "diari-event-area";

    const multiDayRecords =
      records.filter(
        diaryIsMultiDay
      );

    const singleDayRecords =
      records.filter(
        function (record) {

          return !diaryIsMultiDay(
            record
          );

        }
      );

    /* BAR BERBILANG HARI */

    const visibleEvents =
      multiDayRecords
        .map(function (record) {

          return {
            record: record,
            lane:
              eventLanes.get(
                record.diaryId
              ) ?? 0
          };

        })
        .filter(
          function (event) {

            return (
              event.lane <
              MAX_VISIBLE_LANES
            );

          }
        );

    visibleEvents.forEach(
      function (event) {

        const record =
          event.record;

        const lane =
          event.lane;

        const bar =
          document.createElement(
            "span"
          );

        bar.className =
          "diari-event-bar";

        bar.style.setProperty(
          "--diari-event-color",
          diaryEventColor(
            record
          )
        );

        bar.style.setProperty(
          "--diari-event-lane",
          lane
        );

        /* MULA BAR */

        const isStart =
          key === record.tarikh;

        /* TAMAT BAR */

        const isEnd =
          key ===
          record.tarikhTamat;

        /* SEMPADAN MINGGU */

        const weekdayIndex =
          index % 7;

        const isWeekStart =
          weekdayIndex === 0;

        const isWeekEnd =
          weekdayIndex === 6;

        if (
          isStart ||
          isWeekStart
        ) {

          bar.classList.add(
            "bar-start"
          );

        }

        if (
          isEnd ||
          isWeekEnd
        ) {

          bar.classList.add(
            "bar-end"
          );

        }

        if (
          !isStart &&
          !isWeekStart
        ) {

          bar.classList.add(
            "bar-continue-left"
          );

        }

        if (
          !isEnd &&
          !isWeekEnd
        ) {

          bar.classList.add(
            "bar-continue-right"
          );

        }

        bar.title =
          record.perkara +
          " (" +
          record.tarikh +
          " hingga " +
          record.tarikhTamat +
          ")";

        eventArea.appendChild(
          bar
        );

      }
    );

    /* TITIK UNTUK CATATAN SATU HARI */

    if (
      singleDayRecords.length
    ) {

      const dots =
        document.createElement(
          "div"
        );

      dots.className =
        "diari-event-dots";

      singleDayRecords
        .slice(0, 3)
        .forEach(
          function (record) {

            const dot =
              document.createElement(
                "span"
              );

            dot.className =
              "diari-dot";

            dot.style.background =
              diaryEventColor(
                record
              );

            dot.title =
              record.perkara;

            dots.appendChild(
              dot
            );

          }
        );

      eventArea.appendChild(
        dots
      );

    }

    /* BILANGAN PERISTIWA TERSEMBUNYI */

    const hiddenCount =
      multiDayRecords.filter(
        function (record) {

          return (
            (
              eventLanes.get(
                record.diaryId
              ) ?? 0
            ) >=
            MAX_VISIBLE_LANES
          );

        }
      ).length;

    if (
      hiddenCount > 0
    ) {

      const more =
        document.createElement(
          "span"
        );

      more.className =
        "diari-event-more";

      more.textContent =
        "+" +
        hiddenCount;

      eventArea.appendChild(
        more
      );

    }

    button.appendChild(
      eventArea
    );

    /* KLIK TARIKH */

    button.addEventListener(
      "click",
      function () {

        selectDiaryDate(
          date
        );

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

      /* BUTANG TINDAKAN */

      const actions =
        document.createElement("div");

      actions.className =
        "diari-entry-actions";

      const editButton =
        document.createElement("button");

      editButton.type =
        "button";

      editButton.className =
        "diari-entry-edit";

      editButton.textContent =
        "✏️ Edit";

      const deleteButton =
        document.createElement("button");

      deleteButton.type =
        "button";

      deleteButton.className =
        "diari-entry-delete";

      deleteButton.textContent =
        "🗑️ Padam";

      editButton.addEventListener(
        "click",
        function () {

          editDiaryEntry(record);

        }
      );

      deleteButton.addEventListener(
        "click",
        function () {

          deleteDiaryEntry(record);

        }
      );

      actions.appendChild(
        editButton
      );

      actions.appendChild(
        deleteButton
      );

      item.appendChild(
        actions
      );

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

  diaryState.editingDiaryId =
    null;

  diaryForm.reset();

  document.getElementById(
    "diariTarikh"
  ).value =
    diaryDateKey(
      diaryState.selectedDate
    );

document.getElementById(
  "diariTarikhTamat"
).value = "";


  document.getElementById(
    "diariOtherWrap"
  ).hidden = true;

  document.getElementById(
    "diariOther"
  ).required = false;

  diaryFormSection.querySelector(
    "h2"
  ).textContent =
    "Tambah Catatan Diari";

  document.getElementById(
    "diariSave"
  ).textContent =
    "SIMPAN";

  diaryFormSection.hidden =
    false;

  diaryFormSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/* =====================================================
   TUTUP BORANG
===================================================== */

function closeDiaryForm() {

  diaryState.editingDiaryId =
    null;

  diaryFormSection.hidden =
    true;

  diaryForm.reset();

  document.getElementById(
    "diariOtherWrap"
  ).hidden = true;

  document.getElementById(
    "diariOther"
  ).required = false;

  diaryFormSection.querySelector(
    "h2"
  ).textContent =
    "Tambah Catatan Diari";

  document.getElementById(
    "diariSave"
  ).textContent =
    "SIMPAN";

}
/* =====================================================
   EDIT CATATAN DIARI
===================================================== */

function editDiaryEntry(record) {

  if (
    !record ||
    !record.diaryId
  ) {

    showDiaryMessage(
      "ID catatan tidak ditemui.",
      false
    );

    return;

  }

  hideDiaryMessage();

  diaryState.editingDiaryId =
    record.diaryId;

  diaryForm.reset();

  document.getElementById(
    "diariTarikh"
  ).value =
    record.tarikh || "";


    document.getElementById(
  "diariTarikhTamat"
).value =
  record.tarikhTamat ||
  record.tarikh ||
  "";

  document.getElementById(
    "diariPerkara"
  ).value =
    record.perkara || "";

  const jenisSelect =
    document.getElementById(
      "diariJenis"
    );

  const otherWrap =
    document.getElementById(
      "diariOtherWrap"
    );

  const otherInput =
    document.getElementById(
      "diariOther"
    );

  const existingOptions =
    Array.from(
      jenisSelect.options
    ).map(
      function (option) {
        return option.value;
      }
    );

  if (
    existingOptions.includes(
      record.jenis
    )
  ) {

    jenisSelect.value =
      record.jenis || "";

    otherWrap.hidden = true;

    otherInput.required = false;

    otherInput.value = "";

  } else {

    jenisSelect.value =
      "Lain-lain";

    otherWrap.hidden = false;

    otherInput.required = true;

    otherInput.value =
      record.jenis || "";

  }

  document.getElementById(
    "diariMasa"
  ).value =
    record.masa || "";

  document.getElementById(
    "diariCatatan"
  ).value =
    record.catatan || "";

  diaryFormSection.querySelector(
    "h2"
  ).textContent =
    "Edit Catatan Diari";

  document.getElementById(
    "diariSave"
  ).textContent =
    "SIMPAN PERUBAHAN";

  diaryFormSection.hidden =
    false;

  diaryFormSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/* =====================================================
   PADAM CATATAN DIARI
===================================================== */

async function deleteDiaryEntry(record) {

  if (
    !record ||
    !record.diaryId
  ) {

    showDiaryMessage(
      "ID catatan tidak ditemui.",
      false
    );

    return;

  }

  const confirmed =
    window.confirm(
      'Padam catatan "' +
      record.perkara +
      '"?\n\n' +
      "Tindakan ini tidak boleh dibatalkan."
    );

  if (!confirmed) {
    return;
  }

  const email =
    diarySessionEmail();

  if (!email) {

    window.location.href =
      "../index.html";

    return;

  }

  hideDiaryMessage();

  try {

    const result =
      await apiPost({

        action:
          "diary_calendar_delete",

        email: email,

        diaryId:
          record.diaryId

      });

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Catatan gagal dipadam."
      );

    }

    if (
      diaryState.editingDiaryId ===
      record.diaryId
    ) {

      closeDiaryForm();

    }

    await loadDiaryCalendar();

    showDiaryMessage(
      "Catatan berjaya dipadam.",
      true
    );

  } catch (error) {

    console.error(
      "DELETE DIARY ERROR:",
      error
    );

    showDiaryMessage(
      error.message ||
      "Ralat memadam catatan.",
      false
    );

  }

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











tarikhTamat:
  document.getElementById(
    "diariTarikhTamat"
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

    const editingDiaryId =
  diaryState.editingDiaryId;

const result =
  await apiPost({

    action:
      editingDiaryId
        ? "diary_calendar_update"
        : "diary_calendar_create",

    email: email,

    diaryId:
      editingDiaryId || "",

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
  editingDiaryId
    ? "Catatan berjaya dikemas kini."
    : "Catatan berjaya disimpan.",
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

    saveButton.textContent =
  diaryState.editingDiaryId
    ? "SIMPAN PERUBAHAN"
    : "SIMPAN";

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
