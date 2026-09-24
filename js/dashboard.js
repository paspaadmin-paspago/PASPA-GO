"use strict";


/* =====================================================
   ELEMENT
===================================================== */

const memberPhoto =
  document.getElementById(
    "memberPhoto"
  );

const memberName =
  document.getElementById(
    "memberName"
  );

const memberId =
  document.getElementById(
    "memberId"
  );

const memberIc =
  document.getElementById(
    "memberIc"
  );

const dashboardMessage =
  document.getElementById(
    "dashboardMessage"
  );

const logoutButton =
  document.getElementById(
    "logoutButton"
  );

const managementReportButton =
  document.getElementById(
    "managementReportButton"
  );

const messageBadge =
  document.getElementById(
    "messageBadge"
  );




/* =====================================================
   ON SCENE
===================================================== */

const onSceneButton =
  document.getElementById(
    "onSceneButton"
  );


const onSceneBadge =
  document.getElementById(
    "onSceneBadge"
  );



/* =====================================================
   DAPATKAN EMAIL SESSION
===================================================== */

function getDashboardSessionEmail() {

  try {

    const sessionText =
      localStorage.getItem(
        "paspaGoSession"
      );


    if (!sessionText) {
      return "";
    }


    const session =
      JSON.parse(
        sessionText
      );


    return String(
      session.googleEmail ||
      session.email ||
      ""
    )
      .trim()
      .toLowerCase();


  } catch (error) {

    console.error(
      "GET DASHBOARD SESSION EMAIL ERROR:",
      error
    );


    return "";

  }

}


/* =====================================================
   PASPA GO - OPERATION NOTIFICATION
===================================================== */

const paspaOperationNotificationState = {
  knownIds: null,
  requestNumber: 0
};


/* =====================================================
   BACA TETAPAN OPERASI AHLI
===================================================== */

function getDashboardOperationPreferences() {

  const defaults = {
    sound: true,
    tone: "emergency",
    display: "popup"
  };

  try {

    const session = getSession();

    const idPaspa = String(
      session?.idPaspa || ""
    ).trim();

    if (!idPaspa) {
      return defaults;
    }

    const key =
      "paspaGoPreferences_" + idPaspa;

    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return defaults;
    }

    const saved = JSON.parse(raw);

    return {
      ...defaults,
      ...(saved.notifications?.operation || {})
    };

  } catch (error) {

    console.error(
      "OPERATION PREFERENCES ERROR:",
      error
    );

    return defaults;

  }

}


/* =====================================================
   BUNYI OPERASI
===================================================== */

function playDashboardOperationSound(tone) {

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  try {

    /*
      Guna AudioContext yang sama
      dengan notifikasi Mesej.
    */

    const audio =
      paspaMessageNotificationState.audioContext ||
      new AudioContextClass();

    paspaMessageNotificationState.audioContext =
      audio;

    if (audio.state !== "running") {

      audio.resume().catch(
        function () {}
      );

      if (audio.state !== "running") {
        return;
      }

    }

    const patterns = {

      emergency: [
        [880, 0.00, 0.22],
        [550, 0.26, 0.22],
        [880, 0.52, 0.22],
        [550, 0.78, 0.22]
      ],

      tone1: [
        [700, 0.00, 0.20]
      ],

      tone2: [
        [600, 0.00, 0.16],
        [800, 0.22, 0.20]
      ],

      tone3: [
        [900, 0.00, 0.15],
        [650, 0.20, 0.15],
        [900, 0.40, 0.20]
      ]

    };

    const pattern =
      patterns[tone] ||
      patterns.emergency;

    const start =
      audio.currentTime + 0.02;

    pattern.forEach(function (note) {

      const oscillator =
        audio.createOscillator();

      const gain =
        audio.createGain();

      oscillator.type = "sine";

      oscillator.frequency.value =
        note[0];

      oscillator.connect(gain);

      gain.connect(
        audio.destination
      );

      const noteStart =
        start + note[1];

      const noteEnd =
        noteStart + note[2];

      gain.gain.setValueAtTime(
        0.0001,
        noteStart
      );

      gain.gain.exponentialRampToValueAtTime(
        0.18,
        noteStart + 0.02
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        noteEnd
      );

      oscillator.start(noteStart);

      oscillator.stop(
        noteEnd + 0.01
      );

    });

  } catch (error) {

    console.warn(
      "OPERATION SOUND ERROR:",
      error
    );

  }

}


/* =====================================================
   PAPAR NOTIFIKASI OPERASI
===================================================== */

function showDashboardOperationNotification(
  operations,
  display
) {

  if (display === "badge") {
    return;
  }

  const old =
    document.getElementById(
      "paspaOperationNotification"
    );

  if (old) {
    old.remove();
  }

  const isPopup =
    display === "popup";

  const notification =
    document.createElement("div");

  notification.id =
    "paspaOperationNotification";

  notification.setAttribute(
    "role",
    "alert"
  );

  Object.assign(
    notification.style,
    {
      position: "fixed",
      zIndex: "10000",
      left: "16px",
      right: "16px",
      maxWidth: "420px",
      margin: "0 auto",
      background: "#ffffff",
      color: "#173b76",
      border: "2px solid #c62828",
      borderRadius: "14px",
      padding: "18px",
      boxShadow:
        "0 8px 30px rgba(0,0,0,0.28)",
      fontFamily: "Arial, sans-serif"
    }
  );

  if (isPopup) {

    notification.style.top =
      "50%";

    notification.style.transform =
      "translateY(-50%)";

  } else {

    notification.style.top =
      "18px";

  }

  const heading =
    document.createElement("strong");

  heading.textContent =
    "🚨 PANGGILAN OPERASI BAHARU";

  heading.style.display =
    "block";

  heading.style.marginBottom =
    "10px";

  heading.style.color =
    "#b71c1c";

  const description =
    document.createElement("p");

  const firstOperation =
    operations[0] || {};

  description.textContent =

    operations.length === 1

      ? (
          firstOperation.perkara ||
          "Anda menerima panggilan operasi baharu."
        )

      : (
          "Anda menerima " +
          operations.length +
          " panggilan operasi baharu."
        );

  description.style.margin =
    "0 0 15px";

  const actions =
    document.createElement("div");

  actions.style.display =
    "flex";

  actions.style.gap =
    "9px";

  const viewButton =
    document.createElement("button");

  viewButton.type =
    "button";

  viewButton.textContent =
    "Lihat Operasi";

  const closeButton =
    document.createElement("button");

  closeButton.type =
    "button";

  closeButton.textContent =
    "Tutup";

  [viewButton, closeButton].forEach(
    function (button) {

      button.style.flex =
        "1";

      button.style.padding =
        "11px";

      button.style.border =
        "none";

      button.style.borderRadius =
        "9px";

      button.style.cursor =
        "pointer";

      button.style.fontWeight =
        "bold";

    }
  );

  viewButton.style.background =
    "#b71c1c";

  viewButton.style.color =
    "#ffffff";

  closeButton.style.background =
    "#edf3fb";

  closeButton.style.color =
    "#173b76";

  viewButton.addEventListener(
    "click",
    function () {

      window.location.href =
        "onscene.html";

    }
  );

  closeButton.addEventListener(
    "click",
    function () {

      notification.remove();

    }
  );

  actions.appendChild(
    viewButton
  );

  actions.appendChild(
    closeButton
  );

  notification.appendChild(
    heading
  );

  notification.appendChild(
    description
  );

  notification.appendChild(
    actions
  );

  document.body.appendChild(
    notification
  );

  if (!isPopup) {

    window.setTimeout(
      function () {

        if (
          notification.isConnected
        ) {

          notification.remove();

        }

      },
      7000
    );

  }

}


/* =====================================================
   KESAN ID OPERASI BAHARU
===================================================== */

function handleDashboardOperationNotifications(
  operations
) {

  const state =
    paspaOperationNotificationState;

  /*
    Hanya operasi DIPANGGIL / AKTIF.
  */

  const activeOperations =
    operations.filter(
      function (operation) {

        const status = String(
          operation.statusAturGerak || ""
        )
          .trim()
          .toUpperCase();

        return (
          status === "DIPANGGIL" ||
          status === "AKTIF"
        );

      }
    );

  const currentIds =
    new Set(

      activeOperations

        .map(function (operation) {

          return String(
            operation.operasiId || ""
          ).trim();

        })

        .filter(Boolean)

    );

  /*
    Bacaan pertama menetapkan
    operasi yang sudah wujud.
  */

  if (state.knownIds === null) {

    state.knownIds =
      currentIds;

    return;

  }

  const newOperations =
    activeOperations.filter(
      function (operation) {

        const id = String(
          operation.operasiId || ""
        ).trim();

        return (
          id &&
          !state.knownIds.has(id)
        );

      }
    );

  /*
    Kemas kini senarai ID dahulu
    supaya notifikasi tidak berulang.
  */

  state.knownIds =
    currentIds;

  if (!newOperations.length) {
    return;
  }

  console.log(
    "NEW OPERATIONS:",
    newOperations
  );

  const preferences =
    getDashboardOperationPreferences();

  if (
    preferences.sound === true
  ) {

    playDashboardOperationSound(
      preferences.tone
    );

  }

  showDashboardOperationNotification(
    newOperations,
    preferences.display
  );

}
/* =====================================================
   LOAD STATUS ON SCENE
===================================================== */

async function loadDashboardOnSceneStatus() {

  if (
    !onSceneButton ||
    !onSceneBadge
  ) {

    return;

  }


  /* RESET */

  onSceneButton.classList.remove(
    "active-onscene"
  );


  onSceneButton.classList.remove(
    "pending-onscene"
  );


  onSceneBadge.hidden =
    true;


  onSceneBadge.textContent =
    "0";


  try {

    const email =
      getDashboardSessionEmail();


    if (!email) {
      return;
    }


    const result =
      await apiPost({

        action:
          "member_active_operations",

        email:
          email

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Status On Scene tidak dapat dimuatkan."
      );

    }


    const operations =
      Array.isArray(
        result.operations
      )
        ? result.operations
        : [];

        handleDashboardOperationNotifications(
  operations
);


    const activeOperations =
  operations.filter(
    function (operation) {

      const status =
        String(
          operation.statusAturGerak ||
          ""
        )
          .trim()
          .toUpperCase();


      return (
        status === "DIPANGGIL" ||
        status === "AKTIF"
      );

    }
  );


const totalActive =
  activeOperations.length;


    /* =================================================
       TIADA OPERASI AKTIF
       = STAND DOWN / SELESAI / TIADA PANGGILAN
    ================================================= */

    if (
      totalActive === 0
    ) {

      onSceneButton.classList.remove(
        "active-onscene"
      );


      onSceneButton.classList.remove(
        "pending-onscene"
      );


      onSceneBadge.hidden =
        true;


      return;

    }


    /* =================================================
       ADA OPERASI AKTIF
       LOREKAN MERAH KEKAL BERKELIP
    ================================================= */

    onSceneButton.classList.add(
      "active-onscene"
    );


    /* =================================================
       KIRA OPERASI YANG BELUM DITERIMA
    ================================================= */

   const pendingOperations =
  activeOperations.filter(
        function (operation) {

          const status =
            String(
              operation.statusKehadiran ||
              ""
            )
              .trim()
              .toUpperCase();


          return (
            status !== "HADIR" &&
            status !== "ON SCENE"
          );

        }
      );


    const totalPending =
      pendingOperations.length;


    /* =================================================
       BELUM RESPON
       BADGE + KELIP
    ================================================= */

    if (
      totalPending > 0
    ) {

      onSceneButton.classList.add(
        "pending-onscene"
      );


      onSceneBadge.textContent =
        totalPending > 99
          ? "99+"
          : String(
              totalPending
            );


      onSceneBadge.hidden =
        false;


      return;

    }


    /* =================================================
       SUDAH RESPON
       BADGE HILANG
       TAPI OPERASI MASIH AKTIF
       LOREKAN MERAH MASIH BERKELIP
    ================================================= */

    onSceneButton.classList.remove(
      "pending-onscene"
    );


    onSceneBadge.hidden =
      true;


  } catch (error) {

    console.error(
      "LOAD DASHBOARD ON SCENE ERROR:",
      error
    );


    onSceneButton.classList.remove(
      "active-onscene"
    );


    onSceneButton.classList.remove(
      "pending-onscene"
    );


    onSceneBadge.hidden =
      true;

  }

}

/* =====================================================
   BUTTON ON SCENE
===================================================== */

if (onSceneButton) {

  onSceneButton.addEventListener(
    "click",
    function () {

      window.location.href =
        "onscene.html";

    }
  );

}
/* =====================================================
   SESSION
===================================================== */

function getSession() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "paspaGoSession"
      )
    );

  } catch (error) {

    return null;

  }

}


/* =====================================================
   GAMBAR GOOGLE DRIVE
===================================================== */

function createDrivePhotoUrl(fileId) {

  const id =
    String(
      fileId || ""
    ).trim();


  if (!id) {

    return "../images/default-avatar.png";

  }


  return (
    "https://drive.google.com/thumbnail?id=" +
    encodeURIComponent(id) +
    "&sz=w500"
  );

}


/* =====================================================
   MESSAGE ERROR
===================================================== */

function showDashboardMessage(text) {

  if (!dashboardMessage) {
    return;
  }


  dashboardMessage.textContent =
    text;


  dashboardMessage.className =
    "message error";

}

/* =====================================================
   WELCOME SPLASH
   HANYA SELEPAS LOGIN BERJAYA
===================================================== */

const welcomeSplash =
  document.getElementById(
    "welcomeSplash"
  );

const closeWelcomeSplash =
  document.getElementById(
    "closeWelcomeSplash"
  );


  const welcomeCountdown =
  document.getElementById(
    "welcomeCountdown"
  );

let countdownInterval =
  null;








let welcomeSplashTimer =
  null;


/* =====================================================
   SEMAK FLAG LOGIN
===================================================== */

const shouldShowWelcomeSplash =
  sessionStorage.getItem(
    "showWelcomeSplash"
  ) === "1";


sessionStorage.removeItem(
  "showWelcomeSplash"
);


/* =====================================================
   TUTUP WELCOME
===================================================== */

function hideWelcomeSplash() {

  if (!welcomeSplash) {
    return;
  }

  if (
    welcomeSplash.classList.contains(
      "is-closing"
    )
  ) {
    return;
  }

  welcomeSplash.classList.add(
    "is-closing"
  );

  if (welcomeSplashTimer) {

    clearTimeout(
      welcomeSplashTimer
    );


    if (countdownInterval) {

  clearInterval(
    countdownInterval
  );

  countdownInterval =
    null;
}

    welcomeSplashTimer =
      null;
  }

  setTimeout(
    function () {

      welcomeSplash.style.display =
        "none";

    },
    1000
  );
}


/* =====================================================
   PAPAR WELCOME
===================================================== */

if (welcomeSplash) {

  if (shouldShowWelcomeSplash) {

    welcomeSplash.style.display =
      "flex";

    let countdownValue = 10;

if (welcomeCountdown) {
  welcomeCountdown.textContent =
    countdownValue;
}


countdownInterval =
  setInterval(
    function () {

      countdownValue--;

      if (welcomeCountdown) {
        welcomeCountdown.textContent =
          countdownValue;
      }


      if (countdownValue <= 0) {

        clearInterval(
          countdownInterval
        );

        countdownInterval =
          null;

        hideWelcomeSplash();

      }

    },
    1000
  );

  } else {

    welcomeSplash.style.display =
      "none";
  }
}


/* =====================================================
   BUTTON X
===================================================== */

if (closeWelcomeSplash) {

  closeWelcomeSplash.addEventListener(
    "click",
    hideWelcomeSplash
  );
}

/* =====================================================
   AUTO TUTUP SELEPAS 10 SAAT
===================================================== */

if (
  welcomeSplash
) {

  welcomeSplashTimer =
    setTimeout(
      hideWelcomeSplash,
      10000
    );

}








/* =====================================================
   LOAD DASHBOARD
===================================================== */

async function loadDashboard() {

  const session =
    getSession();


  if (
    !session ||
    session.isLoggedIn !== true ||
    !session.googleEmail
  ) {

    window.location.href =
      "../index.html";

    return;

  }


  try {

    const result =
      await apiPost({

        action:
          "dashboard_v2",

        email:
          session.googleEmail

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Maklumat dashboard tidak dapat diperoleh."
      );

    }


    const member =
      result.member || {};


    /* =================================================
       NAMA + PANGKAT
    ================================================= */

    const pangkat =
      member.pangkat || "";


    const nama =
      member.namaPenuh ||
      member.namaAhli ||
      session.namaAhli ||
      "-";


    if (memberName) {

      memberName.textContent =
        (
          pangkat
            ? pangkat + " "
            : ""
        ) +
        nama;

    }


    /* =================================================
       ID PASPA
    ================================================= */

    if (memberId) {

      memberId.textContent =
        member.idPaspa ||
        session.idPaspa ||
        "-";

    }


    /* =================================================
       NO KAD PENGENALAN
    ================================================= */

    const noKP =
      String(

        member.noKP ||
        member.noKp ||
        member.noKadPengenalan ||
        ""

      )
        .replace(
          /\D/g,
          ""
        );


    if (memberIc) {

      if (
        noKP.length === 12
      ) {

        memberIc.textContent =
          noKP.substring(0, 6) +
          "-" +
          noKP.substring(6, 8) +
          "-" +
          noKP.substring(8, 12);

      } else {

        memberIc.textContent =
          noKP || "-";

      }

    }


    /* =================================================
       GAMBAR AHLI
    ================================================= */

    if (memberPhoto) {

      if (
        member.photoUrl
      ) {

        memberPhoto.src =
          member.photoUrl;

      } else if (
        member.fotoFileId
      ) {

        memberPhoto.src =
          createDrivePhotoUrl(
            member.fotoFileId
          );

      } else {

        memberPhoto.src =
          "../images/default-avatar.png";

      }

    }


  } catch (error) {

    console.error(
      "LOAD DASHBOARD ERROR:",
      error
    );


    showDashboardMessage(
      error.message ||
      "Dashboard gagal dimuatkan."
    );

  }

}
/* =====================================================
   PASPA GO - MESSAGE NOTIFICATION
===================================================== */

const paspaMessageNotificationState = {
  lastCount: null,
  requestNumber: 0,
  audioContext: null,
  audioUnlocked: false
};


/* =====================================================
   BACA TETAPAN MESEJ AHLI
===================================================== */

function getDashboardMessagePreferences() {

  const defaults = {
    sound: true,
    tone: "tone1",
    display: "banner"
  };

  try {

    const session = getSession();

    const idPaspa = String(
      session?.idPaspa || ""
    ).trim();

    if (!idPaspa) {
      return defaults;
    }

    const key =
      "paspaGoPreferences_" +
      idPaspa;

    const raw =
      localStorage.getItem(key);

    if (!raw) {
      return defaults;
    }

    const saved =
      JSON.parse(raw);

    return {
      ...defaults,
      ...(saved.notifications?.message || {})
    };

  } catch (error) {

    console.error(
      "MESSAGE PREFERENCES ERROR:",
      error
    );

    return defaults;

  }

}


/* =====================================================
   AUDIO
===================================================== */

function unlockDashboardNotificationAudio() {

  if (
    paspaMessageNotificationState.audioUnlocked
  ) {
    return;
  }

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  try {

    if (
      !paspaMessageNotificationState.audioContext
    ) {

      paspaMessageNotificationState.audioContext =
        new AudioContextClass();

    }

    const audio =
      paspaMessageNotificationState.audioContext;

    audio.resume()
      .then(function () {

        paspaMessageNotificationState.audioUnlocked =
          true;

      })
      .catch(function (error) {

        console.warn(
          "AUDIO UNLOCK:",
          error
        );

      });

  } catch (error) {

    console.warn(
      "AUDIO INIT:",
      error
    );

  }

}


/* =====================================================
   MAIN BUNYI NOTIFIKASI
===================================================== */

function playDashboardMessageSound(tone) {

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  try {

    const audio =
      paspaMessageNotificationState.audioContext ||
      new AudioContextClass();

    paspaMessageNotificationState.audioContext =
      audio;

    if (audio.state !== "running") {

      audio.resume().catch(
        function () {}
      );

      if (audio.state !== "running") {
        return;
      }

    }

    const patterns = {

      tone1: [
        [660, 0.00, 0.16]
      ],

      tone2: [
        [520, 0.00, 0.14],
        [780, 0.19, 0.18]
      ],

      tone3: [
        [880, 0.00, 0.12],
        [660, 0.16, 0.12],
        [880, 0.32, 0.16]
      ]

    };

    const pattern =
      patterns[tone] ||
      patterns.tone1;

    const start =
      audio.currentTime + 0.02;

    pattern.forEach(function (note) {

      const frequency = note[0];
      const offset = note[1];
      const duration = note[2];

      const oscillator =
        audio.createOscillator();

      const gain =
        audio.createGain();

      oscillator.type = "sine";

      oscillator.frequency.value =
        frequency;

      oscillator.connect(gain);

      gain.connect(
        audio.destination
      );

      const noteStart =
        start + offset;

      const noteEnd =
        noteStart + duration;

      gain.gain.setValueAtTime(
        0.0001,
        noteStart
      );

      gain.gain.exponentialRampToValueAtTime(
        0.16,
        noteStart + 0.02
      );

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        noteEnd
      );

      oscillator.start(
        noteStart
      );

      oscillator.stop(
        noteEnd + 0.01
      );

    });

  } catch (error) {

    console.warn(
      "MESSAGE SOUND ERROR:",
      error
    );

  }

}


/* =====================================================
   PAPAR BANNER / POP-UP
===================================================== */

function showDashboardMessageNotification(
  newCount,
  display
) {

  if (display === "badge") {
    return;
  }

  const old =
    document.getElementById(
      "paspaMessageNotification"
    );

  if (old) {
    old.remove();
  }

  const isPopup =
    display === "popup";

  const notification =
    document.createElement("div");

  notification.id =
    "paspaMessageNotification";

  notification.setAttribute(
    "role",
    "status"
  );

  Object.assign(
    notification.style,
    {

      position: "fixed",

      zIndex: "9999",

      left: "16px",

      right: "16px",

      maxWidth: "420px",

      margin: "0 auto",

      background: "#ffffff",

      color: "#173b76",

      borderRadius: "14px",

      padding: "17px",

      boxShadow:
        "0 8px 30px rgba(0,0,0,0.25)",

      border:
        "1px solid #dce7f5",

      fontFamily: "Arial, sans-serif"

    }
  );

  if (isPopup) {

    notification.style.top =
      "50%";

    notification.style.transform =
      "translateY(-50%)";

  } else {

    notification.style.top =
      "18px";

  }

  const heading =
    document.createElement("strong");

  heading.textContent =
    "✉️ Mesej Baharu";

  heading.style.display =
    "block";

  heading.style.marginBottom =
    "9px";

  const description =
    document.createElement("p");

  description.textContent =

    newCount === 1

      ? "Anda menerima 1 mesej baharu."

      : (
          "Anda menerima " +
          newCount +
          " mesej baharu."
        );

  description.style.margin =
    "0 0 14px";

  description.style.fontSize =
    "13px";

  const actions =
    document.createElement("div");

  actions.style.display =
    "flex";

  actions.style.gap =
    "9px";

  const viewButton =
    document.createElement("button");

  viewButton.type =
    "button";

  viewButton.textContent =
    "Lihat Mesej";

  const closeButton =
    document.createElement("button");

  closeButton.type =
    "button";

  closeButton.textContent =
    "Tutup";

  [viewButton, closeButton].forEach(
    function (button) {

      button.style.flex =
        "1";

      button.style.padding =
        "11px";

      button.style.border =
        "none";

      button.style.borderRadius =
        "9px";

      button.style.cursor =
        "pointer";

      button.style.fontWeight =
        "bold";

    }
  );

  viewButton.style.background =
    "#173b76";

  viewButton.style.color =
    "#ffffff";

  closeButton.style.background =
    "#edf3fb";

  closeButton.style.color =
    "#173b76";

  viewButton.addEventListener(
    "click",
    function () {

      window.location.href =
        "mesej.html";

    }
  );

  closeButton.addEventListener(
    "click",
    function () {

      notification.remove();

    }
  );

  actions.appendChild(
    viewButton
  );

  actions.appendChild(
    closeButton
  );

  notification.appendChild(
    heading
  );

  notification.appendChild(
    description
  );

  notification.appendChild(
    actions
  );

  document.body.appendChild(
    notification
  );

  if (!isPopup) {

    window.setTimeout(
      function () {

        if (
          notification.isConnected
        ) {

          notification.remove();

        }

      },
      7000
    );

  }

}


/* =====================================================
   KESAN PERTAMBAHAN MESEJ
===================================================== */

function handleDashboardMessageCount(
  count
) {

  const state =
    paspaMessageNotificationState;

  const currentCount =
    Math.max(
      0,
      Number(count) || 0
    );

  /*
    Bacaan pertama hanya menetapkan
    bilangan asas.
  */

  if (state.lastCount === null) {

    state.lastCount =
      currentCount;

    return;

  }

  const previousCount =
    state.lastCount;

  state.lastCount =
    currentCount;

  /*
    Tiada pertambahan mesej.
  */

  if (
    currentCount <= previousCount
  ) {

    return;

  }

  const newCount =
    currentCount -
    previousCount;

  const preferences =
    getDashboardMessagePreferences();

  /*
    BUNYI
  */

  if (
    preferences.sound === true
  ) {

    playDashboardMessageSound(
      preferences.tone
    );

  }

  /*
    PAPARAN
  */

  showDashboardMessageNotification(

    newCount,

    preferences.display

  );

}


/* =====================================================
   AKTIFKAN AUDIO SELEPAS INTERAKSI
===================================================== */

document.addEventListener(
  "pointerdown",
  unlockDashboardNotificationAudio,
  {
    once: true
  }
);

document.addEventListener(
  "keydown",
  unlockDashboardNotificationAudio,
  {
    once: true
  }
);

/* =====================================================
   UNREAD MESSAGE BADGE
===================================================== */

async function loadUnreadMessageCount() {

  const session =
    getSession();


  if (
    !session ||
    session.isLoggedIn !== true ||
    !session.googleEmail
  ) {

    hideMessageBadge();

    return;

  }


  if (!messageBadge) {

    console.warn(
      "messageBadge tidak ditemui."
    );

    return;

  }


  try {

    const result =
      await apiPost({

        action:
          "unread_message_count",

        email:
          session.googleEmail

      });


    console.log(
      "UNREAD MESSAGE RESULT:",
      result
    );


    if (
      !result ||
      result.success !== true
    ) {

      console.warn(
        "UNREAD MESSAGE COUNT FAILED:",
        result
      );

      hideMessageBadge();

      return;

    }


    const count =
      Number(
        result.unreadCount || 0
      );

      handleDashboardMessageCount(count);


    console.log(
      "UNREAD MESSAGE COUNT:",
      count
    );


    /* =================================================
       TIADA MESEJ BELUM DIBACA
    ================================================= */

    if (
      count <= 0
    ) {

      hideMessageBadge();

      return;

    }


    /* =================================================
       ADA MESEJ BELUM DIBACA
    ================================================= */

    messageBadge.textContent =
      count > 99
        ? "99+"
        : String(count);


    messageBadge.hidden =
      false;


    messageBadge.classList.add(
      "show"
    );


  } catch (error) {

    console.error(
      "LOAD UNREAD MESSAGE COUNT ERROR:",
      error
    );


    hideMessageBadge();

  }

}


/* =====================================================
   HIDE MESSAGE BADGE
===================================================== */

function hideMessageBadge() {

  if (!messageBadge) {
    return;
  }


  messageBadge.hidden =
    true;


  messageBadge.textContent =
    "";


  messageBadge.classList.remove(
    "show"
  );

}


/* =====================================================
   GAMBAR ERROR
===================================================== */

if (memberPhoto) {

  memberPhoto.addEventListener(
    "error",
    function () {

      memberPhoto.src =
        "../images/default-avatar.png";

    }
  );

}


/* =====================================================
   LOGOUT
===================================================== */

if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    function () {

      localStorage.removeItem(
        "paspaGoSession"
      );


      window.location.href =
        "../index.html";

    }
  );

}

/* =====================================================
   BUTTON INVENTORI
===================================================== */

const inventoryButton =
  document.getElementById(
    "inventoryButton"
  );

if (inventoryButton) {

  inventoryButton.addEventListener(
    "click",
    function () {

      window.location.href =
        "inventori.html";

    }
  );

}


/* =====================================================
   BUTTON DIARI PASPA
===================================================== */

const diaryButton =
  document.getElementById(
    "diaryButton"
  );

if (diaryButton) {

  diaryButton.addEventListener(
    "click",
    function () {

      window.location.href =
        "diari.html";

    }
  );

}


/* =====================================================
   PENGURUSAN & LAPORAN
===================================================== */

if (managementReportButton) {

  managementReportButton.addEventListener(
    "click",
    function () {

      window.location.href =
        "urus.html";

    }
  );

}


/* =====================================================
   REFRESH APABILA KEMBALI KE DASHBOARD
===================================================== */

window.addEventListener(
  "pageshow",
  function () {

    loadUnreadMessageCount();

  }
);


/* =====================================================
   REFRESH JIKA TAB AKTIF SEMULA
===================================================== */

document.addEventListener(
  "visibilitychange",
  function () {

    if (
      document.visibilityState ===
      "visible"
    ) {

      loadUnreadMessageCount();

      loadDashboardOnSceneStatus();

    }

  }
);


/* =====================================================
   START
===================================================== */

loadDashboard();

loadUnreadMessageCount();

loadDashboardOnSceneStatus();


/* =====================================================
   SEMAK MESEJ DAN OPERASI SETIAP 60 SAAT
===================================================== */

window.setInterval(
  function () {

    if (
      document.visibilityState !==
      "visible"
    ) {

      return;

    }

    loadUnreadMessageCount();

    loadDashboardOnSceneStatus();

  },
  60000
);

/* ==========================================
   PASPA GO - QR SCANNER BUTTON
========================================== */

const qrScannerButton =
  document.getElementById("qrScannerButton");

if (qrScannerButton) {

  qrScannerButton.addEventListener(
    "click",
    function () {

      window.location.href = "qr-scanner.html";

    }
  );

}