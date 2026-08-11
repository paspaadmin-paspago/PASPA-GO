"use strict";


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


const currentSession =
  getSession();


/* =====================================================
   ELEMENTS
===================================================== */

const manageMessage =
  document.getElementById(
    "manageMessage"
  );


const noAdminAccess =
  document.getElementById(
    "noAdminAccess"
  );


const latestActionSection =
  document.getElementById(
    "latestActionSection"
  );


/* =====================================================
   ROLE MAP
===================================================== */

const adminMenus = [

  {
    settingKey:
      "ADMIN_PROGRAM",

    elementId:
      "adminProgramMenu",

    page:
      "admin-program.html"
  },


  {
    settingKey:
      "ADMIN_OPERASI",

    elementId:
      "adminOperationMenu",

    page:
      "admin-operasi.html"
  },


  {
    settingKey:
      "ADMIN_INVENTORY",

    elementId:
      "adminInventoryMenu",

    page:
      "inventori.html"
  },


  {
    settingKey:
      "ADMIN_ANNOUNCEMENT",

    elementId:
      "adminAnnouncementMenu",

    page:
      "hebahan.html"
  },


  {
    settingKey:
      "ADMIN_MESSAGE",

    elementId:
      "adminMessageMenu",

    page:
      "mesej.html"
  },


  {
    settingKey:
      "ADMIN_REPORT",

    elementId:
      "adminReportMenu",

    page:
      "laporan.html"
  }

];


/* =====================================================
   MESSAGE
===================================================== */

function showManageMessage(
  message,
  type
) {

  manageMessage.textContent =
    message || "";


  manageMessage.className =
    "manage-message " +
    (type || "info");


  manageMessage.hidden =
    false;

}


/* =====================================================
   CHECK ONE ROLE
===================================================== */

/* async function checkAdminRole(
  settingKey
) {

  const result =
    await apiPost({

      action:
        "admin_setting_access",

      idPaspa:
        currentSession.idPaspa,

      settingKey:
        settingKey

    });


  return (
    result &&
    result.success === true &&
    result.authorized === true
  );

}
 */

/* =====================================================
   LOAD ADMIN MENUS
===================================================== */

async function loadAdminMenus() {

  if (
    !currentSession ||
    currentSession.isLoggedIn !== true ||
    !currentSession.idPaspa
  ) {

    window.location.href =
      "../index.html";

    return;

  }


  try {

    /* ===============================================
       PANGGIL SEKALI SAHAJA
    =============================================== */

    const result =
      await apiPost({

        action:
          "admin_menu_access",

        idPaspa:
          currentSession.idPaspa

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : "Akses pentadbir tidak dapat diperoleh."
      );

    }


    const access =
      result.access || {};


    /* ===============================================
       SEMBUNYIKAN / PAPARKAN BUTTON
    =============================================== */

    const adminProgramMenu =
      document.getElementById(
        "adminProgramMenu"
      );

    const adminOperationMenu =
      document.getElementById(
        "adminOperationMenu"
      );

    const adminInventoryMenu =
      document.getElementById(
        "adminInventoryMenu"
      );

    const adminMessageMenu =
      document.getElementById(
        "adminMessageMenu"
      );

    const adminAnnouncementMenu =
      document.getElementById(
        "adminAnnouncementMenu"
      );

    const adminReportMenu =
      document.getElementById(
        "adminReportMenu"
      );


    if (adminProgramMenu) {

      adminProgramMenu.hidden =
        access.ADMIN_PROGRAM !== "OPEN";

    }


    if (adminOperationMenu) {

      adminOperationMenu.hidden =
        access.ADMIN_OPERASI !== "OPEN";

    }


    if (adminInventoryMenu) {

      adminInventoryMenu.hidden =
        access.ADMIN_INVENTORY !== "OPEN";

    }


    if (adminMessageMenu) {

      adminMessageMenu.hidden =
        access.ADMIN_MESSAGE !== "OPEN";

    }


    if (adminAnnouncementMenu) {

      adminAnnouncementMenu.hidden =
        access.ADMIN_ANNOUNCEMENT !== "OPEN";

    }


    if (adminReportMenu) {

      adminReportMenu.hidden =
        access.ADMIN_REPORT !== "OPEN";

    }


    /* ===============================================
       KIRA MENU YANG DIBUKA
    =============================================== */

    const visibleMenuCount =
      [
        access.ADMIN_PROGRAM,
        access.ADMIN_OPERASI,
        access.ADMIN_INVENTORY,
        access.ADMIN_MESSAGE,
        access.ADMIN_ANNOUNCEMENT,
        access.ADMIN_REPORT
      ]
        .filter(
          function (value) {

            return value === "OPEN";

          }
        )
        .length;


    if (
      visibleMenuCount > 0
    ) {

      latestActionSection.hidden =
        false;

      noAdminAccess.hidden =
        true;

    } else {

      latestActionSection.hidden =
        true;

      noAdminAccess.hidden =
        false;

    }


  } catch (error) {

    console.error(
      "LOAD ADMIN MENU ERROR:",
      error
    );


    showManageMessage(
      "Akses pentadbir tidak dapat disemak.",
      "error"
    );


    noAdminAccess.hidden =
      false;

  }

}


/* =====================================================
   TINDAKAN TERKINI DROPDOWN
===================================================== */

const latestActionButton =
  document.getElementById(
    "latestActionButton"
  );


const latestActionContent =
  document.getElementById(
    "latestActionContent"
  );


const latestActionArrow =
  document.getElementById(
    "latestActionArrow"
  );


latestActionButton.addEventListener(
  "click",
  function () {

    const isHidden =
      latestActionContent.hidden;


    latestActionContent.hidden =
      !isHidden;


    latestActionArrow.textContent =
      isHidden
        ? "▲"
        : "▼";

  }
);


/* =====================================================
   HEADER
===================================================== */

document
  .getElementById(
    "backButton"
  )
  .addEventListener(
    "click",
    function () {

      history.back();

    }
  );


document
  .getElementById(
    "homeButton"
  )
  .addEventListener(
    "click",
    function () {

      window.location.href =
        "dashboard.html";

    }
  );


/* =====================================================
   BOTTOM NAVIGATION
===================================================== */

document
  .getElementById(
    "dashboardButton"
  )
  .addEventListener(
    "click",
    function () {

      window.location.href =
        "dashboard.html";

    }
  );


document
  .getElementById(
    "messageButton"
  )
  .addEventListener(
    "click",
    function () {

      window.location.href =
        "message.html";

    }
  );


/*
  On Scene dan Tetapan kita kekalkan
  sementara sehingga nama page
  sebenar disahkan.
*/
/* =====================================================
   ANJUR PROGRAM
===================================================== */

const adminProgramButton =
  document.getElementById(
    "adminProgramMenu"
  );

if (adminProgramButton) {

  adminProgramButton.addEventListener(
    "click",
    function () {

      window.location.href =
        "admin-program.html";

    }
  );

}

/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  loadAdminMenus
);