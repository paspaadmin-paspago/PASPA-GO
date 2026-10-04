"use strict";

/* =====================================================
   PASPA GO - MYRESUME
   CLEAN VERSION
   PAGE 1 + PAGE 2 + QR + PDF + SHARE + MOBILE
===================================================== */


/* =====================================================
   SESSION
===================================================== */

function getResumeSession() {
  try {
    return JSON.parse(
      localStorage.getItem("paspaGoSession")
    );
  } catch (error) {
    console.error("RESUME SESSION ERROR:", error);
    return null;
  }
}


/* =====================================================
   SET TEXT
===================================================== */

function setResumeText(id, value) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  const text =
    value === null ||
    value === undefined ||
    String(value).trim() === ""
      ? "-"
      : String(value).trim();

  element.textContent = text;
}


/* =====================================================
   FORMAT IC
===================================================== */

function formatResumeIc(value) {
  const digits = String(value || "")
    .replace(/\D/g, "");

  if (digits.length !== 12) {
    return digits || "-";
  }

  return (
    digits.slice(0, 6) +
    "-" +
    digits.slice(6, 8) +
    "-" +
    digits.slice(8, 12)
  );
}


/* =====================================================
   FORMAT TARIKH
===================================================== */

function formatResumeDate(value) {
  if (!value) {
    return "-";
  }

  const text = String(value).trim();

  const iso = text.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (iso) {
    return (
      iso[3] +
      "/" +
      iso[2] +
      "/" +
      iso[1]
    );
  }

  const local = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (local) {
    return (
      local[1].padStart(2, "0") +
      "/" +
      local[2].padStart(2, "0") +
      "/" +
      local[3]
    );
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return text;
  }

  return (
    String(date.getUTCDate()).padStart(2, "0") +
    "/" +
    String(date.getUTCMonth() + 1).padStart(2, "0") +
    "/" +
    date.getUTCFullYear()
  );
}


/* =====================================================
   FORMAT TARIKH PROGRAM / OPERASI
===================================================== */

function formatResumeActivityDate(value) {
  return formatResumeDate(value);
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeResumeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =====================================================
   UPPERCASE
===================================================== */

function resumeUpper(value) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "-";
  }

  return text.toUpperCase();
}


/* =====================================================
   GOOGLE DRIVE PHOTO URL
===================================================== */

function createResumePhotoUrl(fileId) {
  const id = String(fileId || "").trim();

  if (!id) {
    return "../images/default-avatar.png";
  }

  return (
    "https://drive.google.com/thumbnail?id=" +
    encodeURIComponent(id) +
    "&sz=w700"
  );
}


/* =====================================================
   BMI CATEGORY
===================================================== */

function getResumeBmiCategory(value) {
  const bmi = Number(value);

  if (!Number.isFinite(bmi)) {
    return "-";
  }

  if (bmi < 18.5) {
    return "Kurang berat badan";
  }

  if (bmi < 25) {
    return "Berat badan normal";
  }

  if (bmi < 30) {
    return "Berat badan berlebihan";
  }

  return "Obesiti";
}


/* =====================================================
   GET CURRENT ID PASPA
===================================================== */

function getCurrentResumeId() {
  const params = new URLSearchParams(
    window.location.search
  );

  const publicId = String(
    params.get("id") || ""
  ).trim();

  if (publicId) {
    return publicId;
  }

  const displayedId = document
    .getElementById("resumePaspaId")
    ?.textContent
    ?.trim();

  if (
    displayedId &&
    displayedId !== "-"
  ) {
    return displayedId;
  }

  const session = getResumeSession() || {};

  return String(
    session.idPaspa || ""
  ).trim();
}


/* =====================================================
   GET CURRENT MEMBER NAME
===================================================== */

function getCurrentResumeName() {
  const name = document
    .getElementById("resumeName")
    ?.textContent
    ?.trim();

  if (
    name &&
    name !== "-"
  ) {
    return name;
  }

  const activityName = document
    .getElementById("activityMemberName")
    ?.textContent
    ?.trim();

  if (
    activityName &&
    activityName !== "-"
  ) {
    return activityName;
  }

  const session = getResumeSession() || {};

  return (
    session.namaAhli ||
    "MEMBER"
  );
}


/* =====================================================
   PDF FILE NAME
===================================================== */

function getResumePdfFileName() {
  const idPaspa =
    getCurrentResumeId() ||
    "PASPA";

  const memberName =
    getCurrentResumeName() ||
    "MEMBER";

  const safeName = String(memberName)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return (
    idPaspa +
    "_" +
    (safeName || "MEMBER") +
    ".pdf"
  );
}


/* =====================================================
   PAPARKAN RESUME
===================================================== */

function displayResume(result, session) {
  const profile =
    result.profile || {};

  const service =
    result.perkhidmatan || {};

  const membership =
    result.keahlianPaspa || {};

  const fitness =
    result.kecergasan || {};

  const sizes =
    result.saiz || {};

  const safeSession =
    session || {};


  /* =================================================
     ID AHLI
  ================================================= */

  const activityId =
    profile.idPaspa ||
    safeSession.idPaspa ||
    "";

  const activityName =
    profile.namaPenuh ||
    safeSession.namaAhli ||
    "-";


  /* =================================================
     QR
  ================================================= */

  generateResumeQr(activityId);


  /* =================================================
     PAGE 2 - IDENTITI
  ================================================= */

  const activityMemberName =
    document.getElementById(
      "activityMemberName"
    );

  const activityMemberId =
    document.getElementById(
      "activityMemberId"
    );

  if (activityMemberName) {
    activityMemberName.textContent =
      resumeUpper(activityName);
  }

  if (activityMemberId) {
    activityMemberId.textContent =
      "ID PASPA: " +
      (
        activityId ||
        "-"
      );
  }


  /* =================================================
     PROGRAM + OPERASI
  ================================================= */

  loadResumeActivities(
    activityId
  );


  /* =================================================
     GAMBAR
  ================================================= */

  const photo =
    document.getElementById(
      "resumePhoto"
    );

  if (photo) {
    photo.src =
      createResumePhotoUrl(
        profile.fotoFileId
      );
  }


  /* =================================================
     IDENTITI
  ================================================= */

  setResumeText(
    "resumeRank",
    profile.pangkat
  );

  setResumeText(
    "resumeName",
    profile.namaPenuh ||
    safeSession.namaAhli
  );

  setResumeText(
    "resumePaspaId",
    profile.idPaspa ||
    safeSession.idPaspa
  );


  /* =================================================
     DOCUMENT TITLE
  ================================================= */

  const pdfIdPaspa =
    String(
      profile.idPaspa ||
      safeSession.idPaspa ||
      "PASPA"
    ).trim();

  const pdfNamaAhli =
    String(
      profile.namaPenuh ||
      safeSession.namaAhli ||
      "AHLI"
    )
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  document.title =
    pdfIdPaspa +
    "_" +
    pdfNamaAhli;


  /* =================================================
     MAKLUMAT PERIBADI
  ================================================= */

  setResumeText(
    "rIc",
    formatResumeIc(
      profile.noKadPengenalan
    )
  );

  setResumeText(
    "rGender",
    profile.jantina
  );

  setResumeText(
    "rEmail",
    profile.googleEmail ||
    safeSession.googleEmail
  );

  setResumeText(
    "rBodyNumber",
    service.noBadan
  );

  setResumeText(
    "rAppointmentDate",
    formatResumeDate(
      membership.tarikhLantikan
    )
  );

  setResumeText(
    "rPaspaPosition",
    membership.jawatanPaspa
  );


  /* =================================================
     MAKLUMAT PERKHIDMATAN
  ================================================= */

  setResumeText(
    "rServiceRank",
    profile.pangkat
  );

  setResumeText(
    "rAppointmentType",
    service.tarafLantikan
  );

  setResumeText(
    "rGrade",
    service.gredJawatan
  );

  setResumeText(
    "rServiceDate",
    formatResumeDate(
      membership.tarikhLantikan
    )
  );

  setResumeText(
    "rBranch",
    service.cawanganBerkhidmat
  );

  setResumeText(
    "rServiceState",
    service.negeriBerkhidmat
  );


  /* =================================================
     MAKLUMAT PERHUBUNGAN
  ================================================= */

  setResumeText(
    "rPhone",
    profile.noTelefon
  );

  setResumeText(
    "rEmergencyPhone",
    profile.noTelWaris
  );

  setResumeText(
    "rAddress",
    profile.alamat
  );

  setResumeText(
    "rPostcode",
    profile.poskod
  );

  setResumeText(
    "rDistrict",
    profile.daerah
  );

  setResumeText(
    "rState",
    profile.negeri
  );

  setResumeText(
    "rMaritalStatus",
    profile.tarafPerkahwinan
  );


  /* =================================================
     KECERGASAN
  ================================================= */

  setResumeText(
    "rBlood",
    profile.jenisDarah
  );

  setResumeText(
    "rHeight",
    fitness.tinggiCm
      ? fitness.tinggiCm + " cm"
      : "-"
  );

  setResumeText(
    "rWeight",
    fitness.beratKg
      ? fitness.beratKg + " kg"
      : "-"
  );

  setResumeText(
    "rBmi",
    fitness.bmi
  );

  setResumeText(
    "rBmiCategory",
    getResumeBmiCategory(
      fitness.bmi
    )
  );


  /* =================================================
     PAKAIAN
  ================================================= */

  setResumeText(
    "rTshirt",
    sizes.tshirt
  );

  setResumeText(
    "rSportPants",
    sizes.seluarSukan
  );

  setResumeText(
    "rUniform",
    sizes.uniform
  );

  setResumeText(
    "rBeret",
    sizes.beret
  );

  setResumeText(
    "rJacket",
    sizes.jaket
  );

  setResumeText(
    "rSportShoes",
    sizes.kasutSukan
  );

  setResumeText(
    "rBoot",
    sizes.boot
  );

  setResumeText(
    "rBelt",
    sizes.taliPinggang
  );


  /* =================================================
     TARIKH
  ================================================= */

  const today =
    new Date();

  setResumeText(
    "resumeDate",

    String(
      today.getDate()
    ).padStart(2, "0") +

    "/" +

    String(
      today.getMonth() + 1
    ).padStart(2, "0") +

    "/" +

    today.getFullYear()
  );


  /* =================================================
     HIDE LOADING
  ================================================= */

  document
    .getElementById(
      "resumeLoading"
    )
    ?.classList
    .add("hidden");


  /* =================================================
     SHOW PAGE 1
  ================================================= */

  document
    .getElementById(
      "resumePage"
    )
    ?.classList
    .remove("hidden");


  /* =================================================
     SHOW PAGE 2
  ================================================= */

  document
    .getElementById(
      "resumePage2"
    )
    ?.classList
    .remove("hidden");


  /* =================================================
     MOBILE SCALE
  ================================================= */

  setTimeout(
    refreshResumeMobileLayout,
    100
  );
}


/* =====================================================
   LOAD RESUME
===================================================== */

async function loadResume() {
  const params =
    new URLSearchParams(
      window.location.search
    );

  const publicId =
    String(
      params.get("id") || ""
    ).trim();


  /* =================================================
     PUBLIC / QR MODE
  ================================================= */

  if (publicId) {
    try {
      const result =
        await apiPost({
          action:
            "resume_public",

          idPaspa:
            publicId
        });

      console.log(
        "PUBLIC RESUME RESULT:",
        result
      );

      if (
        !result ||
        result.success !== true
      ) {
        throw new Error(
          result?.message ||
          "Maklumat ahli tidak dapat diperoleh."
        );
      }

      const publicSession = {
        isLoggedIn:
          false,

        idPaspa:
          result.profile?.idPaspa ||
          publicId,

        namaAhli:
          result.profile?.namaPenuh ||
          "Ahli PASPA",

        googleEmail:
          ""
      };

      displayResume(
        result,
        publicSession
      );

      document.body.classList.add(
        "resume-public-mode"
      );

      return;

    } catch (error) {
      console.error(
        "LOAD PUBLIC RESUME ERROR:",
        error
      );

      showResumeError(
        error.message ||
        "Resume ahli tidak dapat dipaparkan."
      );

      return;
    }
  }


  /* =================================================
     LOGIN MODE
  ================================================= */

  const session =
    getResumeSession();

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
          "profile",

        email:
          session.googleEmail
      });

    console.log(
      "RESUME PROFILE RESULT:",
      result
    );

    if (
      !result ||
      result.success !== true
    ) {
      throw new Error(
        result?.message ||
        "Maklumat ahli tidak dapat diperoleh."
      );
    }

    displayResume(
      result,
      session
    );

  } catch (error) {
    console.error(
      "LOAD RESUME ERROR:",
      error
    );

    showResumeError(
      error.message ||
      "Ralat semasa memuatkan maklumat ahli."
    );
  }
}


/* =====================================================
   SHOW ERROR
===================================================== */

function showResumeError(text) {
  document
    .getElementById(
      "resumeLoading"
    )
    ?.classList
    .add("hidden");

  const message =
    document.getElementById(
      "resumeMessage"
    );

  if (message) {
    message.textContent = text;

    message.classList.remove(
      "hidden"
    );
  }
}


/* =====================================================
   GENERATE QR CODE
===================================================== */

/* =====================================================
   GENERATE QR CODE
   STABLE VERSION
===================================================== */

function generateResumeQr(idPaspa) {

  const normalizedId =
    String(
      idPaspa || ""
    ).trim();


  if (!normalizedId) {

    console.warn(
      "QR tidak dijana: ID PASPA tiada."
    );

    return;
  }


  const qrContainer =
    document.getElementById(
      "resumeQrCode"
    );


  const qrId =
    document.getElementById(
      "resumeQrId"
    );


  if (!qrContainer) {

    console.warn(
      "Container resumeQrCode tidak ditemui."
    );

    return;
  }


  /* =============================================
     PUBLIC URL
  ============================================= */

  let publicUrl;


  /*
   * Jika sedang test di localhost,
   * QR tetap gunakan LIVE PASPA GO URL.
   */

  if (
    window.location.hostname ===
      "127.0.0.1" ||
    window.location.hostname ===
      "localhost"
  ) {

    publicUrl =
      new URL(
        "https://paspaadmin-paspago.github.io/PASPA-GO/pages/resume.html"
      );

  } else {

    publicUrl =
      new URL(
        "resume.html",
        window.location.href
      );

  }


  publicUrl.search = "";


  publicUrl.searchParams.set(
    "id",
    normalizedId
  );


  console.log(
    "RESUME QR URL:",
    publicUrl.toString()
  );


  /* =============================================
     CHECK QR LIBRARY
  ============================================= */

  if (
    typeof QRCode ===
    "undefined"
  ) {

    console.warn(
      "QRCode library belum tersedia. Cuba semula..."
    );


    setTimeout(
      function () {

        generateResumeQr(
          normalizedId
        );

      },
      300
    );


    return;
  }


  /* =============================================
     JIKA QR SUDAH WUJUD
     JANGAN GENERATE SEMULA
  ============================================= */

  const existingQr =
    qrContainer.querySelector(
      "canvas, img"
    );


  if (existingQr) {

    console.log(
      "RESUME QR ALREADY EXISTS"
    );


    if (qrId) {

      qrId.textContent =
        "ID PASPA " +
        normalizedId;

    }


    return;
  }


  /* =============================================
     GENERATE QR
  ============================================= */

  qrContainer.innerHTML = "";


  try {

    new QRCode(
      qrContainer,
      {

        text:
          publicUrl.toString(),

        width:
          176,

        height:
          176,

        correctLevel:
          QRCode.CorrectLevel.H

      }
    );


    if (qrId) {

      qrId.textContent =
        "ID PASPA " +
        normalizedId;

    }


    console.log(
      "RESUME QR GENERATED"
    );


  } catch (error) {

    console.error(
      "RESUME QR ERROR:",
      error
    );

  }

}

/* =====================================================
   LOAD PROGRAM + OPERASI
   AUTO SORT + AUTO PAGINATION
===================================================== */


/* =====================================================
   ACTIVITY DATE -> TIMESTAMP
===================================================== */

function getResumeActivityTimestamp(value) {

  if (!value) {
    return 0;
  }

  const text =
    String(value).trim();


  /* YYYY-MM-DD */

  const iso =
    text.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})/
    );

  if (iso) {

    return new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3])
    ).getTime();

  }


  /* DD/MM/YYYY */

  const local =
    text.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
    );

  if (local) {

    return new Date(
      Number(local[3]),
      Number(local[2]) - 1,
      Number(local[1])
    ).getTime();

  }


  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 0;
  }

  return date.getTime();
}


/* =====================================================
   SORT TERBARU -> TERLAMA
===================================================== */

function sortResumeActivitiesLatestFirst(items) {

  return [...items].sort(
    function (a, b) {

      return (
        getResumeActivityTimestamp(
          b.tarikhMula
        ) -
        getResumeActivityTimestamp(
          a.tarikhMula
        )
      );

    }
  );
}


/* =====================================================
   CREATE ACTIVITY ROW
===================================================== */

function createResumeActivityRow(
  item,
  index
) {

  const row =
    document.createElement(
      "tr"
    );

  row.innerHTML = `
    <td>
      ${index + 1}
    </td>

    <td>
      ${escapeResumeHtml(
        resumeUpper(
          item.nama
        )
      )}
    </td>

    <td>
      ${escapeResumeHtml(
        resumeUpper(
          item.tempat
        )
      )}
    </td>

    <td>
      ${escapeResumeHtml(
        formatResumeActivityDate(
          item.tarikhMula
        )
      )}
    </td>

    <td>
      ${escapeResumeHtml(
        formatResumeActivityDate(
          item.tarikhTamat
        )
      )}
    </td>
  `;

  return row;
}


/* =====================================================
   REMOVE AUTO GENERATED ACTIVITY PAGES
===================================================== */

function removeGeneratedResumeActivityPages() {

  document
    .querySelectorAll(
      ".resume-generated-activity-page"
    )
    .forEach(
      function (page) {
        page.remove();
      }
    );

}


/* =====================================================
   SET MEMBER INFO ON ACTIVITY PAGE
===================================================== */

function setActivityPageMemberInfo(
  page,
  memberName,
  memberId
) {

  const name =
    page.querySelector(
      ".activity-member-name"
    );

  const id =
    page.querySelector(
      ".activity-member-id"
    );

  if (name) {
    name.textContent =
      resumeUpper(
        memberName
      );
  }

  if (id) {
    id.textContent =
      "ID PASPA: " +
      (
        memberId || "-"
      );
  }

}


/* =====================================================
   PREPARE ACTIVITY PAGE
===================================================== */

function prepareActivityPage(
  page,
  pageNumber,
  memberName,
  memberId
) {

  page.classList.remove(
    "hidden"
  );

function prepareActivityPage(
  page,
  pageNumber,
  memberName,
  memberId
) {

  page.classList.remove(
    "hidden"
  );


  setActivityPageMemberInfo(
    page,
    memberName,
    memberId
  );


  if (pageNumber > 2) {

    page.removeAttribute(
      "id"
    );

    page.classList.add(
      "resume-generated-activity-page"
    );


    page
      .querySelectorAll("[id]")
      .forEach(
        function (element) {

          element.removeAttribute(
            "id"
          );

        }
      );

  }

}


  /*
   * ID hanya dibenarkan pada Page 2 asal.
   * Page tambahan tidak boleh mempunyai duplicate ID.
   */

  if (pageNumber > 2) {

    page.removeAttribute(
      "id"
    );

    page.classList.add(
      "resume-generated-activity-page"
    );


    page
      .querySelectorAll("[id]")
      .forEach(
        function (element) {
          element.removeAttribute(
            "id"
          );
        }
      );

  }

}


/* =====================================================
   CREATE NEW ACTIVITY PAGE
===================================================== */

function createNextResumeActivityPage(
  memberName,
  memberId
) {

  const template =
    document.getElementById(
      "resumePage2"
    );

  if (!template) {
    return null;
  }


  const page =
    template.cloneNode(
      true
    );


  const existingPages =
    document.querySelectorAll(
      ".resume-page-activities"
    ).length;


  prepareActivityPage(
    page,
    existingPages + 2,
    memberName,
    memberId
  );


  /*
   * Kosongkan content.
   * Header + footer dikekalkan.
   */

  const content =
    page.querySelector(
      ".resume-page2-content"
    );

  if (content) {

    content.innerHTML = `
      <div class="activity-heading">

        <h2>
          REKOD PENGLIBATAN AHLI
        </h2>

        <div class="activity-member-name">
          ${escapeResumeHtml(
            resumeUpper(
              memberName
            )
          )}
        </div>

        <div class="activity-member-id">
          ID PASPA:
          ${escapeResumeHtml(
            memberId || "-"
          )}
        </div>

      </div>
    `;

  }


  /*
   * Letak selepas activity page terakhir.
   */

  const pages =
    document.querySelectorAll(
      ".resume-page-activities"
    );

  const lastPage =
    pages[
      pages.length - 1
    ];

  lastPage.insertAdjacentElement(
    "afterend",
    page
  );


  return page;
}


/* =====================================================
   CREATE ACTIVITY SECTION
===================================================== */

function createResumeActivitySection(
  type,
  continuation
) {

  const isProgram =
    type === "program";

  const section =
    document.createElement(
      "section"
    );

  section.className =
    "activity-section";


  const title =
    isProgram
      ? "1. PROGRAM"
      : "2. OPERASI";


  const continuationText =
    continuation
      ? " (SAMBUNGAN)"
      : "";


  section.innerHTML = `

    <div class="activity-section-title">
      ${title}${continuationText}
    </div>

    <div class="activity-table-wrap">

      <table class="activity-table">

        <thead>

          <tr>

            <th class="activity-no">
              BIL.
            </th>

            <th>
              ${
                isProgram
                  ? "NAMA PROGRAM"
                  : "NAMA OPERASI"
              }
            </th>

            <th class="activity-place">
              TEMPAT
            </th>

            <th class="activity-date">
              TARIKH MULA
            </th>

            <th class="activity-date">
              TARIKH TAMAT
            </th>

          </tr>

        </thead>

        <tbody></tbody>

      </table>

    </div>

  `;


  return section;
}


/* =====================================================
   CHECK CONTENT MASIH MUAT SEBELUM FOOTER
===================================================== */
/* =====================================================
   CHECK CONTENT MASIH MUAT DALAM PAGE
   FIXED FOR FLEX A4 LAYOUT
===================================================== */
/* =====================================================
   CHECK ACTIVITY PAGE OVERFLOW
   FIXED A4 + FOOTER BOUNDARY
===================================================== */

function isResumeActivityPageOverflowing(
  page
) {

  const content =
    page.querySelector(
      ".resume-page2-content"
    );

  if (!content) {
    return false;
  }


  /*
   * Tinggi ruang sebenar yang diberikan
   * kepada CONTENT oleh A4 flex layout.
   */

  const availableHeight =
    content.clientHeight;


  /*
   * Tinggi sebenar kandungan di dalamnya.
   */

  const requiredHeight =
    content.scrollHeight;


  /*
   * Jika kandungan lebih tinggi daripada
   * ruang tersedia, page sudah penuh.
   */

  return (
    requiredHeight >
    availableHeight
  );

}


/* =====================================================
   ADD ACTIVITY TYPE WITH AUTO PAGE BREAK
===================================================== */

function paginateResumeActivityType(
  type,
  items,
  state
) {

  let currentPage =
    state.currentPage;

  let section = null;

  let body = null;

  let continuation =
    false;


  /*
   * TIADA REKOD
   */

  if (
    items.length === 0
  ) {

    section =
      createResumeActivitySection(
        type,
        false
      );

    body =
      section.querySelector(
        "tbody"
      );

    body.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="activity-empty"
        >
          ${
            type === "program"
              ? "TIADA REKOD PROGRAM."
              : "TIADA REKOD OPERASI."
          }
        </td>
      </tr>
    `;


    currentPage
      .querySelector(
        ".resume-page2-content"
      )
      .appendChild(
        section
      );


    /*
     * Kalau section kosong pun tak muat,
     * pindahkan ke page baru.
     */

    if (
      isResumeActivityPageOverflowing(
        currentPage
      )
    ) {

      section.remove();

      currentPage =
        createNextResumeActivityPage(
          state.memberName,
          state.memberId
        );

      currentPage
        .querySelector(
          ".resume-page2-content"
        )
        .appendChild(
          section
        );

    }


    state.currentPage =
      currentPage;

    return;
  }


  /*
   * ADA REKOD
   */

  items.forEach(
    function (
      item,
      index
    ) {

      /*
       * Kalau belum ada section,
       * cipta section.
       */

      if (!section) {

        section =
          createResumeActivitySection(
            type,
            continuation
          );

        body =
          section.querySelector(
            "tbody"
          );

        currentPage
          .querySelector(
            ".resume-page2-content"
          )
          .appendChild(
            section
          );

      }


      /*
       * Masukkan row dahulu.
       */

      const row =
        createResumeActivityRow(
          item,
          index
        );

      body.appendChild(
        row
      );


      /*
       * Lepas row masuk,
       * semak sama ada sudah langgar footer.
       */

      if (
        isResumeActivityPageOverflowing(
          currentPage
        )
      ) {

        /*
         * Keluarkan row terakhir.
         */

        row.remove();


        /*
         * Kalau section kosong,
         * buang section tersebut.
         */

        if (
          body.children.length === 0
        ) {
          section.remove();
        }


        /*
         * Cipta page baru.
         */

        currentPage =
          createNextResumeActivityPage(
            state.memberName,
            state.memberId
          );


        continuation =
          true;


        /*
         * Cipta section sambungan.
         */

        section =
          createResumeActivitySection(
            type,
            true
          );

        body =
          section.querySelector(
            "tbody"
          );


        currentPage
          .querySelector(
            ".resume-page2-content"
          )
          .appendChild(
            section
          );


        /*
         * Masukkan semula row yang tadi
         * ke page baru.
         */

        body.appendChild(
          row
        );

      }

    }
  );


  state.currentPage =
    currentPage;
}


/* =====================================================
   BUILD ALL ACTIVITY PAGES
===================================================== */

function buildResumeActivityPages(
  programs,
  operations,
  memberName,
  memberId
) {

  const page2 =
    document.getElementById(
      "resumePage2"
    );

  if (!page2) {
    return;
  }


  /*
   * Buang Page 3+ lama jika reload.
   */

  removeGeneratedResumeActivityPages();


  /*
   * Pastikan Page 2 kembali kepada
   * saiz A4 sebenar.
   */

  prepareActivityPage(
    page2,
    2,
    memberName,
    memberId
  );


  /*
   * Kosongkan kandungan Page 2.
   */

  const content =
    page2.querySelector(
      ".resume-page2-content"
    );

  if (!content) {
    return;
  }


  content.innerHTML = `

    <div class="activity-heading">

      <h2>
        REKOD PENGLIBATAN AHLI
      </h2>

      <div class="activity-member-name">
        ${escapeResumeHtml(
          resumeUpper(
            memberName
          )
        )}
      </div>

      <div class="activity-member-id">
        ID PASPA:
        ${escapeResumeHtml(
          memberId || "-"
        )}
      </div>

    </div>

  `;


  const state = {

    currentPage:
      page2,

    memberName:
      memberName,

    memberId:
      memberId

  };


  /*
   * PROGRAM dahulu.
   */

  paginateResumeActivityType(
    "program",
    programs,
    state
  );


  /*
   * OPERASI selepas Program.
   */

  paginateResumeActivityType(
    "operation",
    operations,
    state
  );

}


/* =====================================================
   LOAD PROGRAM + OPERASI
===================================================== */

async function loadResumeActivities(
  idPaspa
) {

  const normalizedId =
    String(
      idPaspa || ""
    ).trim();


  if (!normalizedId) {

    console.warn(
      "Resume activities: ID PASPA tiada."
    );

    return;
  }


  try {

    const result =
      await apiPost({

        action:
          "resume_activities",

        idPaspa:
          normalizedId

      });


    console.log(
      "RESUME ACTIVITIES RESULT:",
      result
    );


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Rekod penglibatan tidak dapat diperoleh."
      );

    }


    /*
     * PROGRAM
     */

    const programsRaw =
      Array.isArray(
        result.programs
      )
        ? result.programs
        : [];


    /*
     * OPERASI
     */

    const operationsRaw =
      Array.isArray(
        result.operations
      )
        ? result.operations
        : [];


    /*
     * SORT:
     * TARIKH TERBARU -> TERLAMA
     */

    const programs =
      sortResumeActivitiesLatestFirst(
        programsRaw
      );

    const operations =
      sortResumeActivitiesLatestFirst(
        operationsRaw
      );


    /*
     * IDENTITI
     */

    const memberName =
      getCurrentResumeName();

    const memberId =
      normalizedId;


    /*
     * BUILD PAGE 2, 3, 4...
     */

    buildResumeActivityPages(
      programs,
      operations,
      memberName,
      memberId
    );


    console.log(
      "RESUME ACTIVITY PAGES:",
      document.querySelectorAll(
        ".resume-page-activities"
      ).length
    );


  } catch (error) {

    console.error(
      "LOAD RESUME ACTIVITIES ERROR:",
      error
    );


    const page2 =
      document.getElementById(
        "resumePage2"
      );

    const content =
      page2?.querySelector(
        ".resume-page2-content"
      );


    if (content) {

      content.innerHTML = `

        <div class="activity-heading">

          <h2>
            REKOD PENGLIBATAN AHLI
          </h2>

        </div>

        <section class="activity-section">

          <div class="activity-section-title">
            REKOD PENGLIBATAN
          </div>

          <div class="activity-table-wrap">

            <table class="activity-table">

              <tbody>

                <tr>

                  <td
                    colspan="5"
                    class="activity-empty"
                  >
                    REKOD PENGLIBATAN TIDAK DAPAT DIMUATKAN.
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </section>

      `;

    }

  } finally {

    window.dispatchEvent(
      new Event(
        "resumeActivitiesLoaded"
      )
    );

  }

}
/* =====================================================
   GET PHOTO BASE64
   1. PUBLIC ID
   2. LOGIN EMAIL
   3. FALLBACK ID PASPA
===================================================== */

async function getResumePhotoBase64() {
  const params =
    new URLSearchParams(
      window.location.search
    );

  const publicId =
    String(
      params.get("id") || ""
    ).trim();


  /* =================================================
     PUBLIC / QR
  ================================================= */

  if (publicId) {
    const result =
      await apiPost({
        action:
          "resume_public_photo",

        idPaspa:
          publicId
      });

    console.log(
      "PUBLIC RESUME PHOTO BASE64:",
      result
    );

    if (
      !result ||
      result.success !== true ||
      !result.imageDataUrl
    ) {
      throw new Error(
        result?.message ||
        "Gambar ahli tidak dapat diperoleh."
      );
    }

    return result.imageDataUrl;
  }


  /* =================================================
     LOGIN MODE - CUBA EMAIL
  ================================================= */

  const session =
    getResumeSession() || {};

  if (session.googleEmail) {
    try {
      const result =
        await apiPost({
          action:
            "resume_photo",

          email:
            session.googleEmail
        });

      console.log(
        "RESUME PHOTO BASE64:",
        result
      );

      if (
        result &&
        result.success === true &&
        result.imageDataUrl
      ) {
        return result.imageDataUrl;
      }

    } catch (error) {
      console.warn(
        "RESUME PHOTO BY EMAIL FAILED:",
        error
      );
    }
  }


  /* =================================================
     FALLBACK - GUNA ID PASPA
  ================================================= */

  const idPaspa =
    getCurrentResumeId();

  if (!idPaspa) {
    throw new Error(
      "ID PASPA tidak ditemui."
    );
  }

  const fallbackResult =
    await apiPost({
      action:
        "resume_public_photo",

      idPaspa:
        idPaspa
    });

  console.log(
    "RESUME PHOTO FALLBACK:",
    fallbackResult
  );

  if (
    !fallbackResult ||
    fallbackResult.success !== true ||
    !fallbackResult.imageDataUrl
  ) {
    throw new Error(
      fallbackResult?.message ||
      "Gambar ahli tidak dapat diperoleh."
    );
  }

  return fallbackResult.imageDataUrl;
}


/* =====================================================
   WAIT IMAGE
===================================================== */

function waitForResumeImage(img) {
  return new Promise(
    function (resolve) {
      if (!img) {
        resolve();
        return;
      }

      if (
        img.complete &&
        img.naturalWidth > 0
      ) {
        resolve();
        return;
      }

      const finish =
        function () {
          resolve();
        };

      img.addEventListener(
        "load",
        finish,
        {
          once: true
        }
      );

      img.addEventListener(
        "error",
        finish,
        {
          once: true
        }
      );

      setTimeout(
        finish,
        5000
      );
    }
  );
}


/* =====================================================
   WAIT PROGRAM + OPERASI
===================================================== */

async function waitForResumeActivities() {
  const programBody =
    document.getElementById(
      "resumeProgramBody"
    );

  const operationBody =
    document.getElementById(
      "resumeOperationBody"
    );

  let count = 0;

  while (
    count < 50
  ) {
    const programText =
      programBody?.textContent || "";

    const operationText =
      operationBody?.textContent || "";

    const loadingProgram =
      programText.includes(
        "Memuatkan rekod program"
      );

    const loadingOperation =
      operationText.includes(
        "Memuatkan rekod operasi"
      );

    if (
      !loadingProgram &&
      !loadingOperation
    ) {
      return;
    }

    await new Promise(
      function (resolve) {
        setTimeout(
          resolve,
          100
        );
      }
    );

    count++;
  }
}


/* =====================================================
   SAVE PAGE INLINE STYLE
===================================================== */

function saveResumePageStyle(page) {
  return {
    cssText:
      page.getAttribute(
        "style"
      ) || ""
  };
}


/* =====================================================
   RESTORE PAGE INLINE STYLE
===================================================== */

function restoreResumePageStyle(
  page,
  saved
) {
  if (!page) {
    return;
  }

  if (
    saved &&
    saved.cssText
  ) {
    page.setAttribute(
      "style",
      saved.cssText
    );
  } else {
    page.removeAttribute(
      "style"
    );
  }
}


/* =====================================================
   PREPARE PAGE FOR PDF
===================================================== */

function prepareResumePageForPdf(
  page
) {
  if (!page) {
    return;
  }

  page.style.setProperty(
    "zoom",
    "1",
    "important"
  );

  page.style.setProperty(
    "transform",
    "none",
    "important"
  );

  page.style.setProperty(
    "transform-origin",
    "top left",
    "important"
  );

  page.style.setProperty(
    "width",
    "793.7px",
    "important"
  );

  page.style.setProperty(
    "min-width",
    "793.7px",
    "important"
  );

  page.style.setProperty(
    "max-width",
    "793.7px",
    "important"
  );

  page.style.setProperty(
    "height",
    "1122.5px",
    "important"
  );

  page.style.setProperty(
    "min-height",
    "1122.5px",
    "important"
  );

  page.style.setProperty(
    "max-height",
    "1122.5px",
    "important"
  );

  page.style.setProperty(
    "margin",
    "0",
    "important"
  );

  page.style.setProperty(
    "left",
    "0",
    "important"
  );

  page.style.setProperty(
    "right",
    "auto",
    "important"
  );

  page.style.setProperty(
    "position",
    "relative",
    "important"
  );

  page.style.setProperty(
    "overflow",
    "hidden",
    "important"
  );
}


/* =====================================================
   GENERATE PDF
   AUTO PAGE 1 + PAGE 2 + PAGE 3 + ...
===================================================== */

async function generateResumePdfBlob() {

  /* Tunggu Program + Operasi siap dahulu */
  await waitForResumeActivities();


  /* Ambil SEMUA page resume */
  const pages =
    Array.from(
      document.querySelectorAll(
        ".resume-page"
      )
    ).filter(
      function (page) {
        return !page.classList.contains(
          "hidden"
        );
      }
    );


  if (pages.length === 0) {

    throw new Error(
      "Tiada muka surat Resume ditemui."
    );

  }


  if (
    typeof html2canvas ===
    "undefined"
  ) {

    throw new Error(
      "html2canvas belum dimuatkan."
    );

  }


  if (
    !window.jspdf ||
    !window.jspdf.jsPDF
  ) {

    throw new Error(
      "jsPDF belum dimuatkan."
    );

  }


  console.log(
    "PDF TOTAL PAGES:",
    pages.length
  );


  /* Simpan style SEMUA page */
  const savedStyles =
    pages.map(
      function (page) {

        return {
          page: page,
          style:
            saveResumePageStyle(
              page
            )
        };

      }
    );


  /* Gambar ahli Page 1 */
  const page1 =
    document.getElementById(
      "resumePage"
    );

  const photo =
    page1
      ? page1.querySelector(
          "#resumePhoto"
        )
      : null;


  const originalPhotoSrc =
    photo
      ? photo.getAttribute("src") || ""
      : "";


  try {

    /* Tunggu font */
    if (
      document.fonts &&
      document.fonts.ready
    ) {

      await document.fonts.ready;

    }


    /* Tukar gambar ahli kepada Base64 */
    if (photo) {

      try {

        const base64Photo =
          await getResumePhotoBase64();


        if (base64Photo) {

          photo.removeAttribute(
            "crossorigin"
          );

          photo.src =
            base64Photo;


          await waitForResumeImage(
            photo
          );

        }

      } catch (photoError) {

        console.warn(
          "PDF PHOTO BASE64 ERROR:",
          photoError
        );

      }

    }


    /* =============================================
       PAKSA SEMUA PAGE KE SAIZ A4 ASAL
       Penting untuk mobile
    ============================================= */

    pages.forEach(
      function (page) {

        prepareResumePageForPdf(
          page
        );

      }
    );


    /* Tunggu browser reflow */
    await new Promise(
      function (resolve) {

        requestAnimationFrame(
          function () {

            requestAnimationFrame(
              resolve
            );

          }
        );

      }
    );


    /* =============================================
       TUNGGU SEMUA GAMBAR PADA SEMUA PAGE
    ============================================= */

    const allImages = [];

    pages.forEach(
      function (page) {

        page
          .querySelectorAll("img")
          .forEach(
            function (img) {

              allImages.push(
                img
              );

            }
          );

      }
    );


    await Promise.all(
      allImages.map(
        waitForResumeImage
      )
    );


    /* =============================================
       CREATE PDF
    ============================================= */

    const {
      jsPDF
    } = window.jspdf;


    const pdf =
      new jsPDF({

        orientation:
          "portrait",

        unit:
          "mm",

        format:
          "a4",

        compress:
          true

      });


    /* =============================================
       CAPTURE SEMUA PAGE SATU PERSATU
    ============================================= */

    for (
      let i = 0;
      i < pages.length;
      i++
    ) {

      const page =
        pages[i];


      console.log(
        "GENERATING PDF PAGE:",
        i + 1,
        "/",
        pages.length
      );


      const canvas =
        await html2canvas(
          page,
          {

            scale:
              2,

            useCORS:
              true,

            allowTaint:
              false,

            backgroundColor:
              "#ffffff",

            logging:
              false,

            width:
              794,

            height:
              1123,

            windowWidth:
              794,

            windowHeight:
              1123,

            scrollX:
              0,

            scrollY:
              0

          }
        );


      const imageData =
        canvas.toDataURL(
          "image/jpeg",
          0.95
        );


      /* Page pertama sudah tersedia */
      if (i > 0) {

        pdf.addPage(
          "a4",
          "portrait"
        );

      }


      pdf.addImage(
        imageData,
        "JPEG",
        0,
        0,
        210,
        297,
        undefined,
        "FAST"
      );

    }


    console.log(
      "PDF GENERATED:",
      pages.length,
      "PAGES"
    );


    return pdf.output(
      "blob"
    );


  } finally {

    /* =============================================
       KEMBALIKAN GAMBAR ASAL
    ============================================= */

    if (
      photo &&
      originalPhotoSrc
    ) {

      photo.src =
        originalPhotoSrc;

    }


    /* =============================================
       KEMBALIKAN STYLE SEMUA PAGE
    ============================================= */

    savedStyles.forEach(
      function (item) {

        restoreResumePageStyle(
          item.page,
          item.style
        );

      }
    );


    /* =============================================
       KEMBALIKAN PAPARAN MOBILE
    ============================================= */

    setTimeout(
      refreshResumeMobileLayout,
      50
    );

  }

}

/* =====================================================
   DOWNLOAD BLOB
===================================================== */

function downloadResumeBlob(
  blob,
  filename
) {
  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href =
    url;

  link.download =
    filename;

  link.style.display =
    "none";

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  setTimeout(
    function () {
      URL.revokeObjectURL(
        url
      );
    },
    2000
  );
}


/* =====================================================
   PRINT
===================================================== */

document
  .getElementById(
    "printResumeButton"
  )
  ?.addEventListener(
    "click",
    function () {
      window.print();
    }
  );


/* =====================================================
   DOWNLOAD
===================================================== */

const downloadResumeButton =
  document.getElementById(
    "downloadResumeButton"
  );

if (downloadResumeButton) {
  downloadResumeButton.addEventListener(
    "click",
    async function () {
      const oldText =
        downloadResumeButton.innerHTML;

      try {
        downloadResumeButton.disabled =
          true;

        downloadResumeButton.innerHTML =
          "…";

        const pdfBlob =
          await generateResumePdfBlob();

        const filename =
          getResumePdfFileName();

        downloadResumeBlob(
          pdfBlob,
          filename
        );

      } catch (error) {
        console.error(
          "DOWNLOAD RESUME ERROR:",
          error
        );

        alert(
          "PDF tidak dapat dimuat turun."
        );

      } finally {
        downloadResumeButton.disabled =
          false;

        downloadResumeButton.innerHTML =
          oldText;
      }
    }
  );
}


/* =====================================================
   SHARE
   CUSTOM SHARE BOX
===================================================== */

const shareResumeButton =
  document.getElementById(
    "shareResumeButton"
  );


/* =====================================================
   OPEN SHARE BOX
===================================================== */

function openResumeShareBox() {

  const overlay =
    document.getElementById(
      "resumeShareOverlay"
    );

  if (!overlay) {

    console.error(
      "resumeShareOverlay tidak ditemui."
    );

    return;
  }

  overlay.hidden = false;
}


/* =====================================================
   CLOSE SHARE BOX
===================================================== */

function closeResumeShareBox() {

  const overlay =
    document.getElementById(
      "resumeShareOverlay"
    );

  if (overlay) {
    overlay.hidden = true;
  }

}


/* =====================================================
   PUBLIC RESUME URL
===================================================== */

function getResumePublicShareUrl() {

  const idPaspa =
    getCurrentResumeId();

  const publicUrl =
    new URL(
      "resume.html",
      window.location.href
    );

  publicUrl.search = "";

  if (idPaspa) {

    publicUrl.searchParams.set(
      "id",
      idPaspa
    );

  }

  return publicUrl.toString();
}


/* =====================================================
   SHARE BUTTON
===================================================== */

if (shareResumeButton) {

  shareResumeButton.addEventListener(
    "click",
    function () {

      openResumeShareBox();

    }
  );

}


/* =====================================================
   WHATSAPP
===================================================== */

document
  .getElementById(
    "shareResumeWhatsApp"
  )
  ?.addEventListener(
    "click",
    function () {

      const memberName =
        getCurrentResumeName();

      const publicUrl =
        getResumePublicShareUrl();

      const message =
        "MyResume PASPA - " +
        memberName +
        "\n\n" +
        publicUrl;

      const whatsappUrl =
        "https://wa.me/?text=" +
        encodeURIComponent(
          message
        );

      window.open(
        whatsappUrl,
        "_blank"
      );

    }
  );


/* =====================================================
   TELEGRAM
===================================================== */

document
  .getElementById(
    "shareResumeTelegram"
  )
  ?.addEventListener(
    "click",
    function () {

      const memberName =
        getCurrentResumeName();

      const publicUrl =
        getResumePublicShareUrl();

      const telegramUrl =
        "https://t.me/share/url?url=" +
        encodeURIComponent(
          publicUrl
        ) +
        "&text=" +
        encodeURIComponent(
          "MyResume PASPA - " +
          memberName
        );

      window.open(
        telegramUrl,
        "_blank"
      );

    }
  );


/* =====================================================
   EMAIL
===================================================== */

document
  .getElementById(
    "shareResumeEmail"
  )
  ?.addEventListener(
    "click",
    function () {

      const memberName =
        getCurrentResumeName();

      const publicUrl =
        getResumePublicShareUrl();

      const subject =
        "MyResume PASPA - " +
        memberName;

      const body =
        "MyResume PASPA\n\n" +
        memberName +
        "\n\n" +
        "Pautan MyResume:\n" +
        publicUrl;

      window.location.href =
        "mailto:?subject=" +
        encodeURIComponent(
          subject
        ) +
        "&body=" +
        encodeURIComponent(
          body
        );

    }
  );


/* =====================================================
   COPY LINK
===================================================== */

document
  .getElementById(
    "copyResumeLink"
  )
  ?.addEventListener(
    "click",
    async function () {

      const button = this;

      const oldHtml =
        button.innerHTML;

      try {

        const publicUrl =
          getResumePublicShareUrl();

        await navigator.clipboard.writeText(
          publicUrl
        );

        button.innerHTML = `
          <span class="resume-share-icon">
            ✓
          </span>

          <span>Disalin</span>
        `;

        setTimeout(
          function () {

            button.innerHTML =
              oldHtml;

          },
          1500
        );

      } catch (error) {

        console.error(
          "COPY LINK ERROR:",
          error
        );

      }

    }
  );

/* =====================================================
   SHARE PDF
   STEP 1 = SEDIAKAN PDF
   STEP 2 = KONGSI PDF
===================================================== */

let preparedResumePdfFile = null;


/* =====================================================
   PREPARE PDF
===================================================== */

document
  .getElementById(
    "shareResumeNative"
  )
  ?.addEventListener(
    "click",
    async function () {

      const button = this;


      /* =============================================
         JIKA PDF SUDAH SIAP
         KLIK KEDUA = TERUS SHARE
      ============================================= */

      if (preparedResumePdfFile) {

        try {

          if (
            navigator.share &&
            (
              typeof navigator.canShare !==
                "function" ||
              navigator.canShare({
                files: [
                  preparedResumePdfFile
                ]
              })
            )
          ) {

            await navigator.share({

              title:
                "MyResume PASPA",

              text:
                "MyResume PASPA - " +
                getCurrentResumeName(),

              files: [
                preparedResumePdfFile
              ]

            });


            console.log(
              "PDF SHARE SUCCESS"
            );


            closeResumeShareBox();


            /*
             * Reset selepas berjaya share
             */

            preparedResumePdfFile =
              null;


            button.innerHTML = `
              <span class="resume-share-icon">
                <i class="fa-solid fa-file-pdf"></i>
              </span>

              <span>Sediakan PDF</span>
            `;


            return;

          }


          /* =========================================
             BROWSER TAK SUPPORT FILE SHARE
             DOWNLOAD PDF
          ========================================= */

          downloadResumeBlob(
            preparedResumePdfFile,
            preparedResumePdfFile.name
          );


          return;


        } catch (error) {

          if (
            error &&
            error.name ===
              "AbortError"
          ) {

            console.log(
              "Share PDF dibatalkan."
            );

            return;

          }


          console.error(
            "PDF SHARE ERROR:",
            error
          );


          return;

        }

      }


      /* =============================================
         PDF BELUM ADA
         KLIK PERTAMA = GENERATE PDF
      ============================================= */

      const originalHtml =
        button.innerHTML;


      try {

        button.disabled =
          true;


        button.innerHTML = `
          <span class="resume-share-icon">
            <i class="fa-solid fa-spinner fa-spin"></i>
          </span>

          <span>Sediakan PDF...</span>
        `;


        console.log(
          "PREPARING RESUME PDF..."
        );


        /*
         * Generate semua page resume
         */

        const pdfBlob =
          await generateResumePdfBlob();


        const filename =
          getResumePdfFileName();


        /*
         * Simpan PDF dalam memory
         */

        preparedResumePdfFile =
          new File(
            [pdfBlob],
            filename,
            {
              type:
                "application/pdf"
            }
          );


        console.log(
          "PDF READY TO SHARE:",
          filename
        );


        /*
         * Sekarang tunggu klik kedua
         */

        button.innerHTML = `
          <span class="resume-share-icon">
            <i class="fa-solid fa-share-nodes"></i>
          </span>

          <span>Kongsi PDF</span>
        `;


      } catch (error) {

        preparedResumePdfFile =
          null;


        console.error(
          "PREPARE PDF ERROR:",
          error
        );


        button.innerHTML =
          originalHtml;


      } finally {

        button.disabled =
          false;

      }

    }
  );


/* =====================================================
   CLOSE BUTTON
===================================================== */

document
  .getElementById(
    "closeResumeShare"
  )
  ?.addEventListener(
    "click",
    closeResumeShareBox
  );


/* =====================================================
   CLICK BACKDROP TO CLOSE
===================================================== */

document
  .getElementById(
    "resumeShareOverlay"
  )
  ?.addEventListener(
    "click",
    function (event) {

      if (
        event.target === this
      ) {

        closeResumeShareBox();

      }

    }
  );
/* =====================================================
   MOBILE A4 AUTO SCALE
===================================================== */

function fitResumeToMobile() {
  const pages = [
    document.getElementById(
      "resumePage"
    ),

    document.getElementById(
      "resumePage2"
    )
  ].filter(Boolean);

  if (!pages.length) {
    return;
  }


  /* =================================================
     DESKTOP
  ================================================= */

  if (
    window.innerWidth >
    850
  ) {
    pages.forEach(
      function (page) {
        page.style.removeProperty(
          "zoom"
        );

        page.style.removeProperty(
          "transform"
        );

        page.style.removeProperty(
          "transform-origin"
        );

        page.style.removeProperty(
          "width"
        );

        page.style.removeProperty(
          "min-width"
        );

        page.style.removeProperty(
          "max-width"
        );

        page.style.removeProperty(
          "height"
        );

        page.style.removeProperty(
          "min-height"
        );

        page.style.removeProperty(
          "max-height"
        );

        page.style.removeProperty(
          "margin-left"
        );

        page.style.removeProperty(
          "margin-right"
        );

        page.style.removeProperty(
          "margin-top"
        );

        page.style.removeProperty(
          "margin-bottom"
        );

        page.style.removeProperty(
          "left"
        );

        page.style.removeProperty(
          "right"
        );

        page.style.removeProperty(
          "position"
        );

        page.style.removeProperty(
          "overflow"
        );
      }
    );

    document.documentElement.style.overflowX =
      "";

    document.body.style.overflowX =
      "";

    return;
  }


  /* =================================================
     MOBILE
  ================================================= */

  const A4_WIDTH =
    793.7;

  const viewportWidth =
    document.documentElement.clientWidth ||
    window.innerWidth;

  const sideGap =
    6;

  const availableWidth =
    viewportWidth -
    (
      sideGap *
      2
    );

  const scale =
    Math.min(
      1,
      availableWidth /
      A4_WIDTH
    );

  document.documentElement.style.overflowX =
    "hidden";

  document.body.style.overflowX =
    "hidden";

  pages.forEach(
    function (
      page,
      index
    ) {
      page.style.setProperty(
        "transform",
        "none",
        "important"
      );

      page.style.setProperty(
        "transform-origin",
        "top left",
        "important"
      );

      page.style.setProperty(
        "position",
        "relative",
        "important"
      );

      page.style.setProperty(
        "left",
        "0",
        "important"
      );

      page.style.setProperty(
        "right",
        "auto",
        "important"
      );

      page.style.setProperty(
        "width",
        A4_WIDTH + "px",
        "important"
      );

      page.style.setProperty(
        "min-width",
        A4_WIDTH + "px",
        "important"
      );

      page.style.setProperty(
        "max-width",
        A4_WIDTH + "px",
        "important"
      );

      /*
       * GUNA ZOOM UNTUK MOBILE.
       * JANGAN GUNA transform:scale()
       * kerana transform meninggalkan ruang A4 kosong.
       */

      page.style.setProperty(
        "zoom",
        String(scale)
      );

      page.style.setProperty(
        "margin-left",
        sideGap + "px",
        "important"
      );

      page.style.setProperty(
        "margin-right",
        "0",
        "important"
      );

      page.style.setProperty(
        "margin-bottom",
        "12px",
        "important"
      );

      if (
        index === 0
      ) {
        page.style.setProperty(
          "margin-top",
          "12px",
          "important"
        );
      } else {
        page.style.setProperty(
          "margin-top",
          "0",
          "important"
        );
      }
    }
  );
}


/* =====================================================
   REFRESH MOBILE LAYOUT
===================================================== */

function refreshResumeMobileLayout() {
  requestAnimationFrame(
    function () {
      requestAnimationFrame(
        function () {
          fitResumeToMobile();
        }
      );
    }
  );
}


/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {
    loadResume();
  }
);


/* =====================================================
   WINDOW LOAD
===================================================== */

window.addEventListener(
  "load",
  function () {
    setTimeout(
      refreshResumeMobileLayout,
      100
    );

    setTimeout(
      refreshResumeMobileLayout,
      500
    );

    setTimeout(
      refreshResumeMobileLayout,
      1000
    );
  }
);


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
  "resize",
  function () {
    clearTimeout(
      window.__resumeResizeTimer
    );

    window.__resumeResizeTimer =
      setTimeout(
        refreshResumeMobileLayout,
        120
      );
  }
);


/* =====================================================
   ORIENTATION CHANGE
===================================================== */

window.addEventListener(
  "orientationchange",
  function () {
    setTimeout(
      refreshResumeMobileLayout,
      300
    );
  }
);


/* =====================================================
   AFTER ACTIVITIES LOADED
===================================================== */

window.addEventListener(
  "resumeActivitiesLoaded",
  function () {
    setTimeout(
      refreshResumeMobileLayout,
      100
    );
  }
);