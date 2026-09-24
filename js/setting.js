
"use strict";

/* ==========================================
   PASPA GO - SETTING
========================================== */

const settingMemberName =
  document.getElementById("settingMemberName");

const settingMemberId =
  document.getElementById("settingMemberId");

const settingEmail =
  document.getElementById("settingEmail");

const settingDetailPanel =
  document.getElementById("settingDetailPanel");

const settingDetailTitle =
  document.getElementById("settingDetailTitle");

const settingDetailContent =
  document.getElementById("settingDetailContent");

const settingLogoutModal =
  document.getElementById("settingLogoutModal");

const settingNotificationPanel =
  document.getElementById(
    "settingNotificationPanel"
  );

const settingLanguagePanel =
  document.getElementById(
    "settingLanguagePanel"
  );

const settingMessage =
  document.getElementById("settingMessage");


/* ==========================================
   SESSION
========================================== */

function getSettingSession() {

  try {

    const raw = localStorage.getItem(
      "paspaGoSession"
    );

    if (!raw) {
      return null;
    }

    const session = JSON.parse(raw);

    if (
      !session ||
      session.isLoggedIn !== true
    ) {
      return null;
    }

    return session;

  } catch (error) {

    console.error(
      "SETTING SESSION ERROR:",
      error
    );

    return null;

  }

}


/* ==========================================
   STORAGE KEY MENGIKUT AHLI
========================================== */

function getSettingStorageKey() {

  const session = getSettingSession();

  if (!session) {
    return null;
  }

  const idPaspa = String(
    session.idPaspa || ""
  ).trim();

  if (!idPaspa) {
    return null;
  }

  return (
    "paspaGoPreferences_" +
    idPaspa
  );

}


/* ==========================================
   TETAPAN ASAL
========================================== */

const DEFAULT_SETTING_PREFERENCES = {

  language: "ms",

  notifications: {

    message: {
      sound: true,
      tone: "tone1",
      display: "banner"
    },

    operation: {
      sound: true,
      tone: "emergency",
      display: "popup"
    }

  }

};


/* ==========================================
   BACA TETAPAN
========================================== */

function getSettingPreferences() {

  const key = getSettingStorageKey();

  const defaults =
    DEFAULT_SETTING_PREFERENCES;

  if (!key) {

    return JSON.parse(
      JSON.stringify(defaults)
    );

  }

  try {

    const raw = localStorage.getItem(key);

    if (!raw) {

      return JSON.parse(
        JSON.stringify(defaults)
      );

    }

    const saved = JSON.parse(raw);

    return {

      language:
        saved.language === "en"
          ? "en"
          : "ms",

      notifications: {

        message: {

          ...defaults.notifications.message,

          ...(
            saved.notifications?.message ||
            {}
          )

        },

        operation: {

          ...defaults.notifications.operation,

          ...(
            saved.notifications?.operation ||
            {}
          )

        }

      }

    };

  } catch (error) {

    console.error(
      "READ SETTING ERROR:",
      error
    );

    return JSON.parse(
      JSON.stringify(defaults)
    );

  }

}


/* ==========================================
   SIMPAN TETAPAN
========================================== */

function saveSettingPreferences(
  preferences
) {

  const key = getSettingStorageKey();

  if (!key) {

    showSettingMessage(
      "Sesi ahli tidak dijumpai."
    );

    return false;

  }

  try {

    localStorage.setItem(
      key,
      JSON.stringify(preferences)
    );

    return true;

  } catch (error) {

    console.error(
      "SAVE SETTING ERROR:",
      error
    );

    showSettingMessage(
      "Tetapan tidak dapat disimpan."
    );

    return false;

  }

}


/* ==========================================
   MESEJ SISTEM
========================================== */

function showSettingMessage(text) {

  settingMessage.textContent = text;

  settingMessage.hidden = false;

  settingMessage.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });

}


/* ==========================================
   PAPAR AKAUN
========================================== */

function loadSettingAccount() {

  const session = getSettingSession();

  if (!session) {

    window.location.href =
      "../index.html";

    return false;

  }

  const name = String(

    session.fullName ||
    session.namaPenuh ||
    session.namaAhli ||
    session.name ||
    ""

  ).trim();

  const rank = String(

    session.pangkat ||
    session.rank ||
    ""

  ).trim();

  const idPaspa = String(
    session.idPaspa || ""
  ).trim();

  const email = String(

    session.googleEmail ||
    session.email ||
    ""

  ).trim();

  settingMemberName.textContent =

    [rank, name]
      .filter(Boolean)
      .join(" ") ||

    "Ahli PASPA";

  settingMemberId.textContent =
    idPaspa || "—";

  settingEmail.textContent =
    email || "—";

  return true;

}


/* ==========================================
   TERJEMAHAN HALAMAN TETAPAN
========================================== */

const SETTING_TRANSLATIONS = {

  ms: {

    pageTitle: "Tetapan",
    myAccount: "Akaun Saya",
    paspaId: "ID PASPA:",
    activeAccount: "Akaun Aktif",
    googleEmail: "Email Google",

    appSettings: "Tetapan Aplikasi",

    notificationSettings:
      "Tetapan Notifikasi",

    notificationSubtitle:
      "Bunyi dan paparan mesej serta operasi",

    language: "Bahasa",

    notificationDescription:
      "Tetapkan bunyi dan cara kemunculan pemberitahuan bagi mesej dan operasi.",

    messages: "Mesej",
    operations: "Operasi",

    messageSound: "Bunyi Mesej",

    messageSoundDescription:
      "Mainkan bunyi apabila mesej diterima",

    operationSound: "Bunyi Operasi",

    operationSoundDescription:
      "Mainkan bunyi apabila operasi diterima",

    soundType: "Jenis Bunyi",

    displayMethod: "Cara Kemunculan",

    preview: "Dengar",

    saveSettings: "SIMPAN TETAPAN",

    languageDescription:
      "Pilih bahasa paparan halaman Tetapan.",

    saveLanguage: "SIMPAN BAHASA",

    infoHelp: "Maklumat & Bantuan",

    about: "Mengenai PASPA GO",

    help: "Bantuan & Sokongan",

    logout: "Log Keluar",

    logoutTitle: "Log Keluar?",

    logoutQuestion:
      "Adakah anda pasti mahu log keluar daripada PASPA GO?",

    cancel: "BATAL",

    saved:
      "Tetapan berjaya disimpan.",

    languageSaved:
      "Pilihan bahasa berjaya disimpan.",

    aboutText: `
      <p>
        <strong>PASPA GO</strong>
        merupakan aplikasi pengurusan
        maklumat dan aktiviti ahli PASPA.
      </p>

      <p>
        Malaysia Civil Defence
        Special Force.
      </p>

      <p>
        Aplikasi ini menyediakan akses
        kepada maklumat peribadi,
        program, operasi, inventori,
        Diari PASPA dan hebahan.
      </p>

      <p>
        Dibangunkan oleh: PASPA 102
      </p>
    `,

    helpText: `
      <p>
        Jika anda menghadapi masalah
        menggunakan PASPA GO,
        sila hubungi pentadbir PASPA GO.
      </p>

      <p>
        Sila nyatakan ID PASPA,
        modul yang terlibat dan
        penerangan ringkas masalah.
      </p>

      <p>
        Jangan kongsikan kata laluan
        atau kod pengesahan akaun Google.
      </p>
    `

  },

  en: {

    pageTitle: "Settings",
    myAccount: "My Account",
    paspaId: "PASPA ID:",
    activeAccount: "Active Account",
    googleEmail: "Google Email",

    appSettings: "App Settings",

    notificationSettings:
      "Notification Settings",

    notificationSubtitle:
      "Sounds and display for messages and operations",

    language: "Language",

    notificationDescription:
      "Choose the sound and display method for messages and operations.",

    messages: "Messages",
    operations: "Operations",

    messageSound: "Message Sound",

    messageSoundDescription:
      "Play a sound when a message is received",

    operationSound: "Operation Sound",

    operationSoundDescription:
      "Play a sound when an operation is received",

    soundType: "Sound Type",

    displayMethod: "Display Method",

    preview: "Preview",

    saveSettings: "SAVE SETTINGS",

    languageDescription:
      "Choose the language for the Settings page.",

    saveLanguage: "SAVE LANGUAGE",

    infoHelp: "Information & Help",

    about: "About PASPA GO",

    help: "Help & Support",

    logout: "Log Out",

    logoutTitle: "Log Out?",

    logoutQuestion:
      "Are you sure you want to log out of PASPA GO?",

    cancel: "CANCEL",

    saved:
      "Settings saved successfully.",

    languageSaved:
      "Language preference saved successfully.",

    aboutText: `
      <p>
        <strong>PASPA GO</strong>
        is an application for managing
        PASPA member information
        and activities.
      </p>

      <p>
        Malaysia Civil Defence
        Special Force.
      </p>

      <p>
        The application provides access
        to personal information,
        programmes, operations,
        inventory, PASPA Diary
        and announcements.
      </p>

      <p>
        Developed by: PASPA 102
      </p>
    `,

    helpText: `
      <p>
        If you experience any problems
        using PASPA GO,
        please contact the PASPA GO
        administrator.
      </p>

      <p>
        Provide your PASPA ID,
        the affected module and
        a brief description of the issue.
      </p>

      <p>
        Do not share your Google
        password or verification code.
      </p>
    `

  }

};


/* ==========================================
   BAHASA SEMASA
========================================== */

function getSettingLanguage() {

  return getSettingPreferences().language;

}


/* ==========================================
   TERJEMAHKAN SELECT
========================================== */

function updateSettingSelectLabels(
  language
) {

  const isEnglish =
    language === "en";

  const toneLabels = {

  tone1: isEnglish
    ? "Sound 1"
    : "Bunyi 1",

  tone2: isEnglish
    ? "Sound 2"
    : "Bunyi 2",

  tone3: isEnglish
    ? "Sound 3"
    : "Bunyi 3",

  emergency: isEnglish
    ? "Emergency Sound"
    : "Bunyi Kecemasan",

  ambulance: isEnglish
    ? "Ambulance Siren"
    : "Sirena Ambulans",

  fire: isEnglish
    ? "Fire Siren"
    : "Sirena Bomba",

  alarm: isEnglish
    ? "Emergency Alarm"
    : "Alarm Kecemasan",

  critical: "Critical Alert",

  dispatch: "Emergency Dispatch"

};

  [
    "settingMessageTone",
    "settingOperationTone"
  ].forEach(function (id) {

    const select =
      document.getElementById(id);

    Array.from(
      select.options
    ).forEach(function (option) {

      option.textContent =
        toneLabels[option.value] ||
        option.textContent;

    });

  });

  const displayLabels = {

    banner: "Banner",

    popup: "Pop-up",

    badge: isEnglish
      ? "Badge only"
      : "Badge sahaja"

  };

  [
    "settingMessageDisplay",
    "settingOperationDisplay"
  ].forEach(function (id) {

    const select =
      document.getElementById(id);

    Array.from(
      select.options
    ).forEach(function (option) {

      option.textContent =
        displayLabels[option.value] ||
        option.textContent;

    });

  });

}


/* ==========================================
   TERJEMAH HALAMAN
========================================== */

function applySettingLanguage(
  language
) {

  const lang =
    language === "en"
      ? "en"
      : "ms";

  const translations =
    SETTING_TRANSLATIONS[lang];

  document.documentElement.lang =
    lang;

  document.querySelectorAll(
    "[data-i18n]"
  ).forEach(function (element) {

    const key =
      element.dataset.i18n;

    if (
      Object.prototype.hasOwnProperty.call(
        translations,
        key
      )
    ) {

      element.textContent =
        translations[key];

    }

  });

  document.getElementById(
    "settingLanguageSummary"
  ).textContent =

    lang === "en"
      ? "English"
      : "Bahasa Melayu";

  updateSettingSelectLabels(lang);

}


/* ==========================================
   BUKA / TUTUP PANEL
========================================== */

function closeSettingPanels() {

  settingNotificationPanel.hidden = true;

  settingLanguagePanel.hidden = true;

  settingDetailPanel.hidden = true;

  document.getElementById(
    "settingNotificationButton"
  ).setAttribute(
    "aria-expanded",
    "false"
  );

  document.getElementById(
    "settingLanguageButton"
  ).setAttribute(
    "aria-expanded",
    "false"
  );

}


function openSettingPanel(
  panel,
  button
) {

  const wasHidden =
    panel.hidden;

  closeSettingPanels();

  if (!wasHidden) {
    return;
  }

  panel.hidden = false;

  if (button) {

    button.setAttribute(
      "aria-expanded",
      "true"
    );

  }

  panel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/* ==========================================
   ISI BORANG NOTIFIKASI
========================================== */

function loadSettingNotificationForm() {

  const preferences =
    getSettingPreferences();

  const message =
    preferences.notifications.message;

  const operation =
    preferences.notifications.operation;

  document.getElementById(
    "settingMessageSound"
  ).checked =
    message.sound !== false;

  document.getElementById(
    "settingMessageTone"
  ).value =
    message.tone;

  document.getElementById(
    "settingMessageDisplay"
  ).value =
    message.display;

  document.getElementById(
    "settingOperationSound"
  ).checked =
    operation.sound !== false;

  document.getElementById(
    "settingOperationTone"
  ).value =
    operation.tone;

  document.getElementById(
    "settingOperationDisplay"
  ).value =
    operation.display;

  updateSettingSoundControls();

}


/* ==========================================
   AKTIF / NYAHAKTIF PILIHAN BUNYI
========================================== */

function updateSettingSoundControls() {

  const messageEnabled =
    document.getElementById(
      "settingMessageSound"
    ).checked;

  const operationEnabled =
    document.getElementById(
      "settingOperationSound"
    ).checked;

  document.getElementById(
    "settingMessageTone"
  ).disabled =
    !messageEnabled;

  document.getElementById(
    "settingPreviewMessage"
  ).disabled =
    !messageEnabled;

  document.getElementById(
    "settingOperationTone"
  ).disabled =
    !operationEnabled;

  document.getElementById(
    "settingPreviewOperation"
  ).disabled =
    !operationEnabled;

}


/* ==========================================
   SIMPAN NOTIFIKASI
========================================== */

function saveSettingNotifications() {

  const preferences =
    getSettingPreferences();

  preferences.notifications.message = {

    sound:
      document.getElementById(
        "settingMessageSound"
      ).checked,

    tone:
      document.getElementById(
        "settingMessageTone"
      ).value,

    display:
      document.getElementById(
        "settingMessageDisplay"
      ).value

  };

  preferences.notifications.operation = {

    sound:
      document.getElementById(
        "settingOperationSound"
      ).checked,

    tone:
      document.getElementById(
        "settingOperationTone"
      ).value,

    display:
      document.getElementById(
        "settingOperationDisplay"
      ).value

  };

  if (
    saveSettingPreferences(
      preferences
    )
  ) {

    showSettingMessage(
      SETTING_TRANSLATIONS[
        getSettingLanguage()
      ].saved
    );

  }

}


/* ==========================================
   PRATONTON BUNYI
   Bunyi ringkas dijana dalam pelayar.
========================================== */

/* ==========================================
   PASPA GO - NOTIFICATION SOUND
========================================== */

function playSettingTone(tone) {

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContextClass) {

    console.warn(
      "Audio tidak disokong oleh pelayar ini."
    );

    return;

  }

  const audio =
    new AudioContextClass();

  /*
   * Format setiap nota:
   *
   * [frekuensi, masa mula, tempoh]
   *
   * Frekuensi dalam Hz.
   * Masa dalam saat.
   */

  const patterns = {

    /* Bunyi mesej biasa */

    tone1: [
      [660, 0.00, 0.15],
      [880, 0.20, 0.20]
    ],

    tone2: [
      [880, 0.00, 0.12],
      [660, 0.16, 0.12],
      [880, 0.32, 0.20]
    ],

    tone3: [
      [523, 0.00, 0.15],
      [659, 0.20, 0.15],
      [784, 0.40, 0.25]
    ],

    /* Bunyi kecemasan asal */

    emergency: [
      [480, 0.00, 0.20],
      [720, 0.25, 0.20],
      [480, 0.50, 0.20],
      [720, 0.75, 0.20]
    ],

    /* Sirena ambulans dua nada */

    ambulance: [
      [780, 0.00, 0.42],
      [520, 0.44, 0.42],
      [780, 0.88, 0.42],
      [520, 1.32, 0.42],
      [780, 1.76, 0.42],
      [520, 2.20, 0.42]
    ],

    /* Sirena bomba */

    fire: [
      [650, 0.00, 0.65],
      [850, 0.67, 0.65],
      [650, 1.34, 0.65],
      [850, 2.01, 0.65]
    ],

    /* Alarm kecemasan berulang */

    alarm: [
      [950, 0.00, 0.22],
      [950, 0.30, 0.22],
      [950, 0.60, 0.22],
      [950, 0.90, 0.22],
      [950, 1.20, 0.22],
      [950, 1.50, 0.22]
    ],

    /* Amaran kritikal */

    critical: [
      [1100, 0.00, 0.18],
      [880, 0.22, 0.18],
      [1100, 0.44, 0.18],
      [880, 0.66, 0.35]
    ],

    /* Panggilan pusat kawalan */

    dispatch: [
      [900, 0.00, 0.10],
      [900, 0.16, 0.10],
      [650, 0.36, 0.25],
      [900, 0.72, 0.10],
      [900, 0.88, 0.10],
      [650, 1.08, 0.35]
    ]

  };

  const selectedPattern =
    patterns[tone] ||
    patterns.tone1;

  const sirenTones = [
    "ambulance",
    "fire",
    "alarm",
    "critical",
    "dispatch"
  ];

  const isSiren =
    sirenTones.includes(tone);

  const startTime =
    audio.currentTime + 0.05;

  let totalDuration = 0;

  selectedPattern.forEach(
    function (note) {

      const frequency =
        note[0];

      const delay =
        note[1];

      const duration =
        note[2];

      const noteStart =
        startTime + delay;

      const noteEnd =
        noteStart + duration;

      const oscillator =
        audio.createOscillator();

      const gain =
        audio.createGain();

      /*
       * Triangle menghasilkan nada
       * yang lebih menonjol untuk sirena.
       */

      oscillator.type =
        isSiren
          ? "triangle"
          : "sine";

      oscillator.frequency.value =
        frequency;

      /*
       * Elakkan bunyi klik pada
       * permulaan dan pengakhiran nota.
       */

      gain.gain.setValueAtTime(
        0.001,
        noteStart
      );

      gain.gain.exponentialRampToValueAtTime(
        isSiren ? 0.23 : 0.16,
        noteStart + 0.02
      );

      gain.gain.setValueAtTime(
        isSiren ? 0.23 : 0.16,
        Math.max(
          noteStart + 0.02,
          noteEnd - 0.04
        )
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        noteEnd
      );

      oscillator.connect(gain);

      gain.connect(
        audio.destination
      );

      oscillator.start(
        noteStart
      );

      oscillator.stop(
        noteEnd + 0.01
      );

      totalDuration =
        Math.max(
          totalDuration,
          delay + duration
        );

    }
  );

  /*
   * Tutup AudioContext selepas
   * semua bunyi selesai.
   */

  window.setTimeout(
    function () {

      audio.close().catch(
        function () {}
      );

    },
    (totalDuration + 0.5) * 1000
  );

}

/* ==========================================
   BAHASA
========================================== */

function loadSettingLanguageForm() {

  const language =
    getSettingLanguage();

  const radio =
    document.querySelector(

      'input[name="settingLanguage"]' +
      '[value="' + language + '"]'

    );

  if (radio) {
    radio.checked = true;
  }

}


function saveSettingLanguage() {

  const selected =
    document.querySelector(
      'input[name="settingLanguage"]:checked'
    );

  if (!selected) {
    return;
  }

  const preferences =
    getSettingPreferences();

  preferences.language =
    selected.value === "en"
      ? "en"
      : "ms";

  if (
    !saveSettingPreferences(
      preferences
    )
  ) {
    return;
  }

  applySettingLanguage(
    preferences.language
  );

  showSettingMessage(
    SETTING_TRANSLATIONS[
      preferences.language
    ].languageSaved
  );

}


/* ==========================================
   PANEL MAKLUMAT
========================================== */

function openSettingDetail(
  title,
  content
) {

  closeSettingPanels();

  settingDetailTitle.textContent =
    title;

  settingDetailContent.innerHTML =
    content;

  settingDetailPanel.hidden = false;

  settingDetailPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


function closeSettingDetail() {

  settingDetailPanel.hidden = true;

  settingDetailContent.innerHTML = "";

}


/* ==========================================
   EVENT NOTIFIKASI
========================================== */

document.getElementById(
  "settingNotificationButton"
).addEventListener(
  "click",
  function () {

    loadSettingNotificationForm();

    openSettingPanel(

      settingNotificationPanel,

      this

    );

  }
);


document.getElementById(
  "settingCloseNotification"
).addEventListener(
  "click",
  closeSettingPanels
);


document.getElementById(
  "settingMessageSound"
).addEventListener(
  "change",
  updateSettingSoundControls
);


document.getElementById(
  "settingOperationSound"
).addEventListener(
  "change",
  updateSettingSoundControls
);


document.getElementById(
  "settingPreviewMessage"
).addEventListener(
  "click",
  function () {

    playSettingTone(

      document.getElementById(
        "settingMessageTone"
      ).value

    );

  }
);


document.getElementById(
  "settingPreviewOperation"
).addEventListener(
  "click",
  function () {

    playSettingTone(

      document.getElementById(
        "settingOperationTone"
      ).value

    );

  }
);


document.getElementById(
  "settingSaveNotification"
).addEventListener(
  "click",
  saveSettingNotifications
);


/* ==========================================
   EVENT BAHASA
========================================== */

document.getElementById(
  "settingLanguageButton"
).addEventListener(
  "click",
  function () {

    loadSettingLanguageForm();

    openSettingPanel(

      settingLanguagePanel,

      this

    );

  }
);


document.getElementById(
  "settingCloseLanguage"
).addEventListener(
  "click",
  closeSettingPanels
);


document.getElementById(
  "settingSaveLanguage"
).addEventListener(
  "click",
  saveSettingLanguage
);


/* ==========================================
   MENGENAI PASPA GO
========================================== */

document.getElementById(
  "settingAboutButton"
).addEventListener(
  "click",
  function () {

    const language =
      getSettingLanguage();

    const translation =
      SETTING_TRANSLATIONS[language];

    openSettingDetail(

      translation.about,

      translation.aboutText

    );

  }
);


/* ==========================================
   BANTUAN & SOKONGAN
========================================== */

document.getElementById(
  "settingHelpButton"
).addEventListener(
  "click",
  function () {

    const language =
      getSettingLanguage();

    const translation =
      SETTING_TRANSLATIONS[language];

    openSettingDetail(

      translation.help,

      translation.helpText

    );

  }
);


/* ==========================================
   TUTUP PANEL MAKLUMAT
========================================== */

document.getElementById(
  "settingCloseDetail"
).addEventListener(
  "click",
  closeSettingDetail
);


/* ==========================================
   NAVIGASI
========================================== */

document.getElementById(
  "settingBack"
).addEventListener(
  "click",
  function () {

    window.location.href =
      "dashboard.html";

  }
);


document.getElementById(
  "settingHome"
).addEventListener(
  "click",
  function () {

    window.location.href =
      "dashboard.html";

  }
);


/* ==========================================
   LOG KELUAR
========================================== */

document.getElementById(
  "settingLogoutButton"
).addEventListener(
  "click",
  function () {

    settingLogoutModal.hidden = false;

  }
);


document.getElementById(
  "settingCancelLogout"
).addEventListener(
  "click",
  function () {

    settingLogoutModal.hidden = true;

  }
);


document.getElementById(
  "settingConfirmLogout"
).addEventListener(
  "click",
  function () {

    localStorage.removeItem(
      "paspaGoSession"
    );

    window.location.replace(
      "../index.html"
    );

  }
);


/* ==========================================
   START
========================================== */

if (
  loadSettingAccount()
) {

  applySettingLanguage(
    getSettingLanguage()
  );

  loadSettingNotificationForm();

  loadSettingLanguageForm();

}
