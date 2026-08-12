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

    }

  }
);


/* =====================================================
   START
===================================================== */

loadDashboard();

loadUnreadMessageCount();