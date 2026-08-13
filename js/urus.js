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
   LOAD TINDAKAN TERKINI
===================================================== */

async function loadLatestProgramActions() {

  if (
    !currentSession ||
    !currentSession.googleEmail
  ) {
    return;
  }


  try {

    latestActionContent.innerHTML =
      '<div class="empty-action">Memuatkan tindakan terkini...</div>';


    const result =
      await apiPost({

        action:
          "admin_recent_programs",

        email:
          currentSession.googleEmail

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : "Tindakan terkini tidak dapat dimuatkan."
      );

    }


    const programs =
      Array.isArray(
        result.programs
      )
        ? result.programs
        : [];


    if (!programs.length) {

      latestActionContent.innerHTML =
        '<div class="empty-action">Tiada tindakan terkini.</div>';

      return;

    }


    latestActionContent.innerHTML =
      "";


    programs.forEach(
      function (program) {

        latestActionContent.appendChild(
          createLatestProgramCard(
            program
          )
        );

      }
    );


  } catch (error) {

    console.error(
      "LOAD LATEST ACTION ERROR:",
      error
    );


    latestActionContent.innerHTML =
      '<div class="empty-action">Tindakan terkini tidak dapat dimuatkan.</div>';

  }

}


/* =====================================================
   CREATE PROGRAM CARD
===================================================== */

/* =====================================================
   CREATE PROGRAM CARD
===================================================== */

function createLatestProgramCard(
  program
) {

  const card =
    document.createElement(
      "div"
    );


  card.className =
    "latest-program-card";


  const status =
    String(
      program.statusMesej ||
      ""
    )
      .trim()
      .toUpperCase();


  card.innerHTML = `

    <div class="latest-program-header">

      <div>


        <!-- ============================================
             TAJUK
        ============================================= -->

        <div class="latest-program-title">

          <strong>
            TAJUK:
          </strong>

          ${escapeManageHtml(
            program.tajuk ||
            "-"
          )}

        </div>


        <div class="latest-program-meta">


          <!-- TARIKH -->

          <span>

            Tarikh:

            ${escapeManageHtml(
              program.tarikhAcara ||
              "-"
            )}

          </span>


          <!-- TEMPAT -->

          <span>

            Tempat:

            ${escapeManageHtml(
              program.tempat ||
              "-"
            )}

          </span>


          <!-- DIHANTAR OLEH -->

          <span>

            Dihantar Oleh:

            ${escapeManageHtml(
              program.dihantarOleh ||
              "-"
            )}

          </span>


          <!-- BILANGAN PESERTA -->

          <span>

            Bilangan Peserta:

            <strong>

              ${Number(
                program.bilanganPeserta ||
                0
              )}
              orang

            </strong>

          </span>


          <!-- BILANGAN URUSETIA -->

          <span>

            Bilangan Urusetia:

            <strong>

              ${Number(
                program.bilanganUrusetia ||
                0
              )}
              orang

            </strong>

          </span>


        </div>

      </div>


      <!-- STATUS -->

      <span
        class="latest-program-status ${
          status === "BATAL"
            ? "cancelled"
            : ""
        }"
      >

        ${escapeManageHtml(
          status ||
          "-"
        )}

      </span>

    </div>


    <!-- ================================================
         STATISTIK
    ================================================= -->

    <div class="latest-status-grid">


      <div class="latest-status-item">

        <span>
          Telah Baca
        </span>

        <strong>
          ${Number(
            program.telahBaca ||
            0
          )}
        </strong>

      </div>


      <div class="latest-status-item">

        <span>
          Belum Baca
        </span>

        <strong>
          ${Number(
            program.belumBaca ||
            0
          )}
        </strong>

      </div>


      <div class="latest-status-item">

        <span>
          HADIR
        </span>

        <strong>
          ${Number(
            program.hadir ||
            0
          )}
        </strong>

      </div>


      <div class="latest-status-item">

        <span>
          TIDAK HADIR
        </span>

        <strong>
          ${Number(
            program.tidakHadir ||
            0
          )}
        </strong>

      </div>


    </div>


    <!-- ================================================
         SENARAI HADIR
    ================================================= -->

    <div class="latest-member-section">

      <button
        type="button"
        class="latest-member-toggle"
        data-list="hadir"
      >

        Nama HADIR

      </button>


      <div
        class="latest-member-list"
        data-list-content="hadir"
        hidden
      >
      </div>

    </div>


    <!-- ================================================
         SENARAI TIDAK HADIR
    ================================================= -->

    <div class="latest-member-section">

      <button
        type="button"
        class="latest-member-toggle"
        data-list="tidakHadir"
      >

      Nama TIDAK HADIR

      </button>


      <div
        class="latest-member-list"
        data-list-content="tidakHadir"
        hidden
      >
      </div>

    </div>


    <!-- ================================================
         BELUM RESPON
    ================================================= -->

    <div class="latest-unanswered">

      Belum Respon:

      <strong>

        ${Number(
          program.belumRespon ||
          0
        )}

      </strong>

    </div>


    <!-- ================================================
         BUTTON
    ================================================= -->

    <div class="latest-program-actions">


      <button
        type="button"
        class="latest-edit-button"
      >

        EDIT

      </button>


      <button
        type="button"
        class="latest-cancel-button"
      >

        BATAL PROGRAM

      </button>


    </div>

  `;


  /* ===================================================
     SENARAI HADIR
  =================================================== */

  setupMemberList(
    card,
    "hadir",
    program.hadirMembers ||
    []
  );


  /* ===================================================
     SENARAI TIDAK HADIR
  =================================================== */

  setupMemberList(
    card,
    "tidakHadir",
    program.tidakHadirMembers ||
    []
  );


  /* ===================================================
     EDIT
  =================================================== */

  const editButton =
    card.querySelector(
      ".latest-edit-button"
    );


  if (editButton) {

    editButton.addEventListener(
      "click",
      function () {

        window.location.href =
          "admin-program.html" +
          "?mode=edit" +
          "&messageId=" +
          encodeURIComponent(
            program.messageId ||
            ""
          );

      }
    );

  }


  /* ===================================================
     BATAL PROGRAM
     Backend akan kita sambungkan selepas ini
  =================================================== */

  const cancelButton =
    card.querySelector(
      ".latest-cancel-button"
    );


  if (cancelButton) {

    cancelButton.addEventListener(
      "click",
      function () {

        showManageMessage(
          "Fungsi Batal Program akan disambungkan pada langkah seterusnya.",
          "info"
        );

      }
    );

  }


  return card;

}


/* =====================================================
   MEMBER LIST
===================================================== */

function setupMemberList(
  card,
  type,
  members
) {

  const button =
    card.querySelector(
      '[data-list="' +
      type +
      '"]'
    );


  const list =
    card.querySelector(
      '[data-list-content="' +
      type +
      '"]'
    );


  if (
    !button ||
    !list
  ) {
    return;
  }


  if (!members.length) {

    button.disabled =
      true;

    button.textContent =
      type === "hadir"
        ? "Tiada ahli HADIR"
        : "Tiada ahli TIDAK HADIR";

    return;

  }


  list.innerHTML =
    members
      .map(
        function (
          member,
          index
        ) {

          return `
            <div class="latest-member-row">

              <span class="latest-member-number">
                ${index + 1}.
              </span>

              <span>
                ${escapeManageHtml(
                  member.namaAhli ||
                  member.idPaspa ||
                  "-"
                )}
              </span>

            </div>
          `;

        }
      )
      .join("");


  button.addEventListener(
    "click",
    function () {

      list.hidden =
        !list.hidden;

    }
  );

}


/* =====================================================
   ESCAPE
===================================================== */

function escapeManageHtml(
  value
) {

  return String(
    value || ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

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
  async function () {

    await loadAdminMenus();

    await loadLatestProgramActions();

  }
);