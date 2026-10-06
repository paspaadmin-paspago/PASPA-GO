"use strict";


/* =====================================================
   SESSION
===================================================== */

function getAttendanceSession() {

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


const attendanceSession =
  getAttendanceSession();


/* =====================================================
   ELEMENT
===================================================== */

const documentContainer =
  document.getElementById(
    "documentContainer"
  );


const pageMessage =
  document.getElementById(
    "pageMessage"
  );


const downloadButton =
  document.getElementById(
    "downloadButton"
  );


const shareButton =
  document.getElementById(
    "shareButton"
  );


const printButton =
  document.getElementById(
    "printButton"
  );


/* =====================================================
   URL PARAMETER
===================================================== */

const attendanceParams =
  new URLSearchParams(
    window.location.search
  );


const attendanceType =
  String(
    attendanceParams.get("type") ||
    ""
  )
    .trim()
    .toUpperCase();


const attendanceRecordId =
  String(
    attendanceParams.get("recordId") ||
    ""
  ).trim();


/* =====================================================
   PAGINATION

   Kita gunakan jumlah baris terkawal supaya dokumen
   tidak mengecil apabila senarai panjang.
===================================================== */

const FIRST_PAGE_MAX_ROWS = 18;

const CONTINUATION_PAGE_MAX_ROWS = 24;


/* =====================================================
   DATA DOKUMEN
===================================================== */

let attendanceData =
  null;


let attendanceMeta = {

  perkara:
    "-",

  tarikh:
    "-",

  tempat:
    "-",

  lokasi:
    "-"

};


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeAttendanceHtml(
  value
) {

  return String(
    value ?? ""
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
   MESSAGE
===================================================== */

function showAttendanceMessage(
  message,
  type
) {

  if (!pageMessage) {
    return;
  }


  pageMessage.textContent =
    message || "";


  pageMessage.className =
    "page-message no-print " +
    (
      type || ""
    );


  pageMessage.hidden =
    !message;

}


/* =====================================================
   FORMAT TARIKH
===================================================== */

function formatAttendanceDate(
  value
) {

  const text =
    String(
      value || ""
    ).trim();


  if (!text) {
    return "-";
  }


  return text.replace(
    /(\d{4})-(\d{2})-(\d{2})/g,
    "$3/$2/$1"
  );

}


/* =====================================================
   CHUNK ARRAY
===================================================== */

function takeRows(
  source,
  start,
  amount
) {

  return source.slice(
    start,
    start + amount
  );

}


/* =====================================================
   HEADER A4
===================================================== */

function buildOfficialHeader(
  pageNumber
) {

  return `

  <div class="official-header">

    <div></div>

    <div class="official-heading">

      <div class="official-heading-main">
        ANGKATAN PERTAHANAN AWAM MALAYSIA
      </div>

      <div class="official-heading-sub">
        PASUKAN KHAS PERTAHANAN AWAM MALAYSIA
      </div>

      <div class="official-heading-title">
        SENARAI KEHADIRAN
      </div>

    </div>

    <div></div>

  </div>


  <div class="document-info-area">

    <div class="document-info-logo">

      <img
        src="../images/logo.png"
        alt="PASPA"
        class="official-logo"
      >

    </div>


    <table class="document-info">

      <tr>

        <td class="info-label">
          PERKARA
        </td>

        <td class="info-colon">
          :
        </td>

        <td>
          ${escapeAttendanceHtml(
            attendanceMeta.perkara
          )}
        </td>

      </tr>

      <tr>

        <td class="info-label">
          TARIKH
        </td>

        <td class="info-colon">
          :
        </td>

        <td>
          ${escapeAttendanceHtml(
            attendanceMeta.tarikh
          )}
        </td>

      </tr>

      <tr>

        <td class="info-label">
          TEMPAT
        </td>

        <td class="info-colon">
          :
        </td>

        <td>

          ${escapeAttendanceHtml(
            attendanceMeta.tempat
          )}

          ${
            attendanceMeta.lokasi &&
            attendanceMeta.lokasi !== "-"
              ? " (" +
                escapeAttendanceHtml(
                  attendanceMeta.lokasi
                ) +
                ")"
              : ""
          }

        </td>

      </tr>

    </table>

  </div>

`;
}


/* =====================================================
   TABLE URUSETIA
===================================================== */

function buildUrusetiaTable(
  members,
  startNumber
) {

  let rows = "";


  if (!members.length) {

    rows = `

      <tr class="empty-row">

        <td colspan="4">
          Tiada rekod.
        </td>

      </tr>

    `;

  } else {

    rows =
      members
        .map(
          function (
            member,
            index
          ) {

            return `

              <tr>

                <td class="col-no">
                  ${startNumber + index}
                </td>

                <td class="name-cell">
                  ${escapeAttendanceHtml(
                    member.namaPenuh ||
                    member.namaAhli ||
                    "-"
                  )}
                </td>

                <td class="phone-cell">
                  ${escapeAttendanceHtml(
                    member.noTelefon ||
                    "-"
                  )}
                </td>

               <td class="status-cell">
  &nbsp;
</td>

              </tr>

            `;

          }
        )
        .join("");

  }


  return `

    <section class="attendance-section">

      <div class="attendance-section-title">
        URUSETIA
      </div>


      <table class="attendance-table">

        <thead>

          <tr>

            <th class="col-no">
              NO.
            </th>

            <th class="col-name">
              NAMA
            </th>

            <th class="col-phone">
              NO. TEL
            </th>

            <th class="col-note">
              CATATAN
            </th>

          </tr>

        </thead>


        <tbody>
          ${rows}
        </tbody>

      </table>

    </section>

  `;

}


/* =====================================================
   TABLE PESERTA
===================================================== */

function buildPesertaTable(
  members,
  startNumber
) {

  let rows = "";


  if (!members.length) {

    rows = `

      <tr class="empty-row">

        <td colspan="4">
          Tiada rekod.
        </td>

      </tr>

    `;

  } else {

    rows =
      members
        .map(
          function (
            member,
            index
          ) {

            return `

              <tr>

                <td class="col-no">
                  ${startNumber + index}
                </td>

                <td class="name-cell">
                  ${escapeAttendanceHtml(
                    member.namaPenuh ||
                    member.namaAhli ||
                    "-"
                  )}
                </td>

                <td class="ptj-cell">
                  ${escapeAttendanceHtml(
                    member.ptj ||
                    "-"
                  )}
                </td>

                <td class="signature-cell">
  &nbsp;
</td>

              </tr>

            `;

          }
        )
        .join("");

  }


  return `

    <section class="attendance-section">

      <div class="attendance-section-title">
        PESERTA
      </div>


      <table class="attendance-table">

        <thead>

          <tr>

            <th class="col-no">
              NO.
            </th>

            <th class="col-name">
              NAMA
            </th>

            <th class="col-ptj">

              PTJ

              <span class="ptj-note">
                (Cawangan / Negeri Berkhidmat)
              </span>

            </th>

            <th class="col-signature">
              T. TANGAN
            </th>

          </tr>

        </thead>


        <tbody>
          ${rows}
        </tbody>

      </table>

    </section>

  `;

}


/* =====================================================
   BINA SATU A4
===================================================== */

function buildA4Page(
  content,
  pageNumber,
  totalPages
) {

  const page =
    document.createElement(
      "section"
    );


  page.className =
    "a4-page";


  page.innerHTML = `

    ${buildOfficialHeader(
      pageNumber
    )}

    ${content}

    <div class="page-number">
      ${pageNumber} / ${totalPages}
    </div>

  `;


  return page;

}


/* =====================================================
   RENDER PROGRAM

   URUSETIA dahulu.
   PESERTA selepas itu.

   Jika tidak muat, sambung halaman baharu.
===================================================== */

function renderProgramDocument(
  data
) {

  const urusetia =
    Array.isArray(
      data.urusetia
    )
      ? data.urusetia
      : [];


  const peserta =
    Array.isArray(
      data.peserta
    )
      ? data.peserta
      : [];


  const pages =
    [];


  let urusetiaIndex = 0;
  let pesertaIndex = 0;

  let urusetiaNumber = 1;
  let pesertaNumber = 1;

  let firstPage = true;


  while (
    urusetiaIndex < urusetia.length ||
    pesertaIndex < peserta.length ||
    firstPage
  ) {

    let remainingRows =
      firstPage
        ? FIRST_PAGE_MAX_ROWS
        : CONTINUATION_PAGE_MAX_ROWS;


    let pageContent =
      "";


    /* ===============================================
       URUSETIA
    =============================================== */

    if (
      urusetiaIndex <
      urusetia.length
    ) {

      const urusetiaRows =
        takeRows(
          urusetia,
          urusetiaIndex,
          remainingRows
        );


      pageContent +=
        buildUrusetiaTable(
          urusetiaRows,
          urusetiaNumber
        );


      urusetiaIndex +=
        urusetiaRows.length;


      urusetiaNumber +=
        urusetiaRows.length;


      remainingRows -=
        urusetiaRows.length;

    } else if (
      firstPage &&
      urusetia.length === 0
    ) {

      /*
       * Kekalkan jadual URUSETIA
       * walaupun tiada urusetia.
       */

      pageContent +=
        buildUrusetiaTable(
          [],
          1
        );

      remainingRows -= 1;

    }


    /* ===============================================
       PESERTA
    =============================================== */

    if (
      remainingRows > 0 &&
      pesertaIndex <
      peserta.length
    ) {

      const pesertaRows =
        takeRows(
          peserta,
          pesertaIndex,
          remainingRows
        );


      pageContent +=
        buildPesertaTable(
          pesertaRows,
          pesertaNumber
        );


      pesertaIndex +=
        pesertaRows.length;


      pesertaNumber +=
        pesertaRows.length;

    } else if (
      firstPage &&
      peserta.length === 0
    ) {

      pageContent +=
        buildPesertaTable(
          [],
          1
        );

    }


    pages.push(
      pageContent
    );


    firstPage =
      false;

  }


  renderPages(
    pages
  );

}


/* =====================================================
   RENDER OPERASI

   Buat masa ini semua anggota Operasi menggunakan
   senarai PESERTA seperti backend semasa.
===================================================== */

function renderOperationDocument(
  data
) {

  const members =
    Array.isArray(
      data.members
    )
      ? data.members
      : [];


  const pages =
    [];


  let index = 0;
  let number = 1;
  let firstPage = true;


  while (
    index < members.length ||
    firstPage
  ) {

    const maxRows =
      firstPage
        ? FIRST_PAGE_MAX_ROWS
        : CONTINUATION_PAGE_MAX_ROWS;


    const pageMembers =
      takeRows(
        members,
        index,
        maxRows
      );


    const content =
      buildPesertaTable(
        pageMembers,
        number
      );


    pages.push(
      content
    );


    index +=
      pageMembers.length;


    number +=
      pageMembers.length;


    firstPage =
      false;

  }


  renderPages(
    pages
  );

}


/* =====================================================
   RENDER SEMUA PAGE
===================================================== */

function renderPages(
  pages
) {

  documentContainer.innerHTML =
    "";


  const totalPages =
    pages.length;


  pages.forEach(
    function (
      content,
      index
    ) {

      documentContainer.appendChild(
        buildA4Page(
          content,
          index + 1,
          totalPages
        )
      );

    }
  );

/* Fit selepas semua A4 siap dibina */
requestAnimationFrame(
  function () {

    requestAnimationFrame(
      fitAttendancePreview
    );

  }
);



}

/* =====================================================
   AUTO FIT A4 PREVIEW
   MOBILE + DESKTOP
===================================================== */

function fitAttendancePreview() {

  const container =
    document.getElementById(
      "documentContainer"
    );

  if (!container) {
    return;
  }


  const pages =
    container.querySelectorAll(
      ".a4-page"
    );

  if (!pages.length) {
    return;
  }


  /*
    Reset dahulu supaya kita dapat
    saiz A4 sebenar.
  */
  pages.forEach(
    function (page) {

      page.style.transform =
        "none";

      page.style.marginBottom =
        "";

    }
  );


  const firstPage =
    pages[0];

  const originalWidth =
    firstPage.offsetWidth;

  if (!originalWidth) {
    return;
  }


  /*
    Ruang sebenar yang tersedia.
    Tolak sedikit supaya tidak rapat
    dengan tepi skrin.
  */
  const availableWidth =
    Math.max(
      container.clientWidth - 16,
      1
    );


  let scale =
    availableWidth /
    originalWidth;


  /*
    Jangan besarkan melebihi
    saiz A4 asal.
  */
  scale =
    Math.min(
      scale,
      1
    );


  pages.forEach(
    function (page) {

      const originalHeight =
        page.offsetHeight;

      page.style.transformOrigin =
        "top center";

      page.style.transform =
        "scale(" +
        scale +
        ")";


      /*
        Transform mengecilkan visual sahaja.
        Margin negatif ini membuang ruang
        kosong di bawah page.
      */
      page.style.marginBottom =
        (
          originalHeight *
          (scale - 1)
        ) +
        "px";

    }
  );

}



window.addEventListener(
  "resize",
  function () {

    fitAttendancePreview();

  }
);
/* =====================================================
   METADATA

   Buat masa ini gunakan maklumat daripada Tindakan
   Terkini yang kita simpan sementara dalam sessionStorage.
===================================================== */

function loadAttendanceMeta() {

  try {

    const raw =
      sessionStorage.getItem(
        "paspaAttendanceMeta"
      );


    if (!raw) {
      return;
    }


    const data =
      JSON.parse(
        raw
      );


    if (!data) {
      return;
    }


    attendanceMeta = {

      perkara:
  String(
    data.perkara || "-"
  )
    .replace(
      /^(PROGRAM|OPERASI)\s*:\s*/i,
      ""
    )
    .trim(),

      tarikh:
        formatAttendanceDate(
          data.tarikh ||
          "-"
        ),

      tempat:
        data.tempat ||
        "-",

      lokasi:
        data.lokasi ||
        "-"

    };


  } catch (error) {

    console.warn(
      "ATTENDANCE META ERROR:",
      error
    );

  }

}


/* =====================================================
   LOAD DATA
===================================================== */

async function loadAttendanceList() {

  if (
    !attendanceSession ||
    attendanceSession.isLoggedIn !== true ||
    !attendanceSession.googleEmail
  ) {

    window.location.href =
      "../index.html";

    return;

  }


  if (
    !attendanceType ||
    !attendanceRecordId
  ) {

    showAttendanceMessage(
      "Maklumat Program / Operasi tidak lengkap.",
      "error"
    );

    return;

  }


  try {

    showAttendanceMessage(
      "Memuatkan senarai...",
      ""
    );


    const result =
      await apiPost({

        action:
          "admin_attendance_list",

        email:
          attendanceSession.googleEmail,

        type:
          attendanceType,

        recordId:
          attendanceRecordId

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Senarai kehadiran tidak dapat dimuatkan."
      );

    }


    attendanceData =
      result;


    if (
      attendanceType ===
      "PROGRAM"
    ) {

      renderProgramDocument(
        result
      );

    } else {

      renderOperationDocument(
        result
      );

    }


    showAttendanceMessage(
      "",
      ""
    );


  } catch (error) {

    console.error(
      "LOAD ATTENDANCE LIST ERROR:",
      error
    );


    showAttendanceMessage(
      error.message ||
      "Senarai kehadiran tidak dapat dimuatkan.",
      "error"
    );

  }

}


/* =====================================================
   DOWNLOAD PDF
===================================================== */
async function downloadAttendancePdf() {

  const pages =
    document.querySelectorAll(
      ".a4-page"
    );


  if (!pages.length) {

    showAttendanceMessage(
      "Dokumen belum tersedia.",
      "error"
    );

    return;

  }


  if (
    typeof html2pdf ===
    "undefined"
  ) {

    showAttendanceMessage(
      "Modul PDF tidak dapat dimuatkan.",
      "error"
    );

    return;

  }


  const filename =
    "Senarai_Kehadiran_" +
    attendanceType +
    "_" +
    attendanceRecordId +
    ".pdf";


  try {

    showAttendanceMessage(
      "Menjana PDF...",
      ""
    );


    /* =================================================
       JIKA HANYA 1 A4
       Hantar A4 itu sahaja kepada html2pdf.
       Jangan hantar documentContainer.
    ================================================= */

    if (pages.length === 1) {

      /* ==============================================
   CLONE A4 KHAS UNTUK PDF
   BUANG SCALE PREVIEW MOBILE
============================================== */

const pdfPage =
  pages[0].cloneNode(true);

pdfPage.style.transform =
  "none";

pdfPage.style.transformOrigin =
  "initial";

pdfPage.style.margin =
  "0";

pdfPage.style.marginBottom =
  "0";

pdfPage.style.width =
  "210mm";

pdfPage.style.height =
  "297mm";

pdfPage.style.minHeight =
  "297mm";

pdfPage.style.boxShadow =
  "none";


const pdfStage =
  document.createElement(
    "div"
  );

pdfStage.style.position =
  "absolute";

pdfStage.style.left =
  "0";

pdfStage.style.top =
  "0";

pdfStage.style.width =
  "210mm";

pdfStage.style.background =
  "#ffffff";

pdfStage.style.zIndex =
  "-9999";

pdfStage.style.pointerEvents =
  "none";


pdfStage.appendChild(
  pdfPage
);

document.body.appendChild(
  pdfStage
);


/*
  Tunggu browser render A4
  pada saiz sebenar.
*/
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

      const options = {

        margin: 0,

        filename:
          filename,

        image: {
          type: "png",
          quality: 1
        },

        html2canvas: {

          scale: 3,

          useCORS: true,

          backgroundColor:
            "#ffffff",

          scrollX: 0,

          scrollY: 0

        },

        jsPDF: {

          unit: "mm",

          format: "a4",

          orientation: "portrait"

        }

      };


      await html2pdf()
  .set(options)
  .from(pdfPage)
  .save();

pdfStage.remove();


      showAttendanceMessage(
        "",
        ""
      );

      return;

    }


    /* =================================================
       JIKA LEBIH DARIPADA 1 A4

       Buat salinan khas PDF.
    ================================================= */

    const pdfWrapper =
      document.createElement(
        "div"
      );


    pdfWrapper.className =
      "pdf-wrapper";


    pages.forEach(
      function (
        page,
        index
      ) {

        const clone =
          page.cloneNode(
            true
          );


        clone.style.margin =
          "0";


        clone.style.boxShadow =
          "none";


        if (
          index <
          pages.length - 1
        ) {

          clone.style.pageBreakAfter =
            "always";

          clone.style.breakAfter =
            "page";

        }


        pdfWrapper.appendChild(
          clone
        );

      }
    );


    document.body.appendChild(
      pdfWrapper
    );


    const options = {

      margin: 0,

      filename:
        filename,

      image: {
        type: "jpeg",
        quality: 0.98
      },

      html2canvas: {

        scale: 2,

        useCORS: true,

        backgroundColor:
          "#ffffff",

        scrollX: 0,

        scrollY: 0

      },

      jsPDF: {

        unit: "mm",

        format: "a4",

        orientation: "portrait"

      },

      pagebreak: {

        mode: [
          "css"
        ]

      }

    };


    await html2pdf()
      .set(options)
      .from(pdfWrapper)
      .save();


    pdfWrapper.remove();


    showAttendanceMessage(
      "",
      ""
    );


  } catch (error) {

    console.error(
      "PDF ERROR:",
      error
    );


    const wrapper =
      document.querySelector(
        ".pdf-wrapper"
      );


    if (wrapper) {
      wrapper.remove();
    }


    showAttendanceMessage(
      "PDF tidak dapat dijana.",
      "error"
    );

  }

}

/* =====================================================
   SHARE

   Gunakan Web Share jika browser menyokong.
===================================================== */

async function shareAttendance() {

  const shareData = {

    title:
      "Senarai Kehadiran PASPA",

    text:
      "Senarai Kehadiran " +
      (
        attendanceMeta.perkara ||
        ""
      ),

    url:
      window.location.href

  };


  if (
    navigator.share
  ) {

    try {

      await navigator.share(
        shareData
      );

      return;

    } catch (error) {

      if (
        error &&
        error.name ===
        "AbortError"
      ) {

        return;

      }

    }

  }


  try {

    await navigator.clipboard.writeText(
      window.location.href
    );


    showAttendanceMessage(
      "Pautan senarai telah disalin.",
      "success"
    );


  } catch (error) {

    showAttendanceMessage(
      "Fungsi Share tidak disokong oleh browser ini.",
      "error"
    );

  }

}


/* =====================================================
   BUTTON
===================================================== */

if (downloadButton) {

  downloadButton.addEventListener(
    "click",
    downloadAttendancePdf
  );

}


if (shareButton) {

  shareButton.addEventListener(
    "click",
    shareAttendance
  );

}


if (printButton) {

  printButton.addEventListener(
    "click",
    function () {

      window.print();

    }
  );

}


/* =====================================================
   HEADER
===================================================== */

const backButton =
  document.getElementById(
    "backButton"
  );


if (backButton) {

  backButton.addEventListener(
    "click",
    function () {

      history.back();

    }
  );

}


const homeButton =
  document.getElementById(
    "homeButton"
  );


if (homeButton) {

  homeButton.addEventListener(
    "click",
    function () {

      window.location.href =
        "dashboard.html";

    }
  );

}


/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    loadAttendanceMeta();

    loadAttendanceList();

  }
);