/* =====================================================
   PASPA GO
   ADMIN PROGRAM REVIEW
===================================================== */


/* =====================================================
   STORAGE
===================================================== */

const REVIEW_STORAGE_KEY =
  "paspaProgramReviewDraft";


let reviewData =
  null;


/* =====================================================
   PAGINATION
===================================================== */

/*
  Page pertama mempunyai:
  - logo
  - no. rujukan
  - tarikh
  - perkara
  - senarai nama

  Jadi kapasiti sedikit lebih rendah.

  Page sambungan hanya ada tajuk
  dan senarai nama, jadi boleh
  memuatkan lebih ramai ahli.
*/

const FIRST_PAGE_NAMES =
  39;

const CONTINUATION_PAGE_NAMES =
  47;


/* =====================================================
   ELEMENTS
===================================================== */

const invitationLetter =
  document.getElementById(
    "invitationLetter"
  );


/* =====================================================
   HELPERS
===================================================== */

function escapeHtml(value) {

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
   DATE
===================================================== */

function formatReviewDate(value) {

  if (!value) {
    return "-";
  }


  const text =
    String(value);


  const parts =
    text.split("-");


  if (
    parts.length !== 3
  ) {

    return text;

  }


  return (
    parts[2] +
    "/" +
    parts[1] +
    "/" +
    parts[0]
  );

}


function getTodayDisplay() {

  const now =
    new Date();


  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );


  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const year =
    now.getFullYear();


  return (
    day +
    "/" +
    month +
    "/" +
    year
  );

}


/* =====================================================
   MEMBER NAME
===================================================== */

function getReviewMemberName(member) {

  if (!member) {
    return "";
  }


  return (
    String(
      member.pangkat || ""
    ) +
    " " +
    String(
      member.namaPenuh || ""
    )
  )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/* =====================================================
   SPLIT ARRAY
===================================================== */

function splitIntoChunks(
  array,
  size
) {

  const source =
    Array.isArray(array)
      ? array
      : [];


  const chunks =
    [];


  for (
    let index = 0;
    index < source.length;
    index += size
  ) {

    chunks.push(
      source.slice(
        index,
        index + size
      )
    );

  }


  return chunks;

}


/* =====================================================
   SPLIT RECIPIENT BY PAGE
===================================================== */

function splitRecipientPages(items) {

  const source =
    Array.isArray(items)
      ? items
      : [];


  if (!source.length) {

    return [
      []
    ];

  }


  const pages =
    [];


  /* ===================================================
     FIRST PAGE
  =================================================== */

  pages.push(
    source.slice(
      0,
      FIRST_PAGE_NAMES
    )
  );


  let index =
    FIRST_PAGE_NAMES;


  /* ===================================================
     CONTINUATION PAGE
  =================================================== */

  while (
    index < source.length
  ) {

    pages.push(
      source.slice(
        index,
        index +
        CONTINUATION_PAGE_NAMES
      )
    );


    index +=
      CONTINUATION_PAGE_NAMES;

  }


  return pages;

}


/* =====================================================
   LOAD REVIEW DATA
===================================================== */

async function loadReviewData() {

  try {

    /* =====================================================
       SEMAK URL
       Contoh:
       ?messageId=MSG-123&from=mesej
    ===================================================== */

    const params =
      new URLSearchParams(
        window.location.search
      );


    const messageId =
      String(
        params.get("messageId") || ""
      ).trim();


    /* =====================================================
       DIBUKA DARIPADA MESEJ.HTML
    ===================================================== */

    if (messageId) {

      console.log(
        "LOAD INVITATION FROM MESSAGE:",
        messageId
      );


      const result =
        await apiPost({

          action:
            "program_invitation_detail",

          messageId:
            messageId

        });


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.message ||
          "Surat jemputan tidak dapat diperoleh."
        );

      }


      reviewData =
        result.data;


      if (
        !reviewData ||
        typeof reviewData !==
          "object"
      ) {

        throw new Error(
          "Data surat jemputan tidak sah."
        );

      }


      console.log(
        "MESSAGE REVIEW DATA:",
        reviewData
      );


      renderReviewLetter();

      scaleReviewLetterForMobile();

      return;

    }


    /* =====================================================
       DIBUKA OLEH ADMIN SEMASA BUAT PROGRAM
       GUNA LOCAL STORAGE SEPERTI BIASA
    ===================================================== */

    const text =
      localStorage.getItem(
        REVIEW_STORAGE_KEY
      );


    console.log(
      "REVIEW STORAGE RAW:",
      text
    );


    if (!text) {

      throw new Error(
        "Maklumat jemputan tidak ditemui."
      );

    }


    reviewData =
      JSON.parse(
        text
      );


    if (
      !reviewData ||
      typeof reviewData !==
        "object"
    ) {

      throw new Error(
        "Data jemputan tidak sah."
      );

    }

    console.log(
      "REVIEW DATA:",
      reviewData
    );
if (
  reviewData.mode === "edit"
) {

  const confirmButton =
    document.getElementById(
      "confirmButton"
    );


  if (confirmButton) {

    confirmButton.textContent =
      "PASTI PERUBAHAN";

  }

}

    renderReviewLetter();

    scaleReviewLetterForMobile();


  } catch (error) {

    console.error(
      "LOAD REVIEW DATA ERROR:",
      error
    );


    showReviewMessage(
      error.message ||
      "Surat jemputan tidak dapat dipaparkan.",
      "error"
    );


    if (
      invitationLetter
    ) {

      invitationLetter.innerHTML =
        '<div class="review-empty">' +
        'Surat jemputan tidak dapat dipaparkan.' +
        '</div>';

    }

  }

}


/* =====================================================
   PAGE FOOTER + PAGE NUMBER
===================================================== */

function createPageNumber(
  currentPage,
  totalPages
) {

  const footerArea =
    document.createElement(
      "div"
    );


  footerArea.className =
    "page-footer-area";


  /* ===================================================
     COMPUTER GENERATED NOTE
  =================================================== */

  const note =
    document.createElement(
      "div"
    );


  note.className =
    "computer-generated-note";


  note.textContent =
    "Surat ini adalah janaan komputer. Tiada tandatangan diperlukan.";


  /* ===================================================
     PAGE NUMBER
  =================================================== */

  const pageNumber =
    document.createElement(
      "div"
    );


  pageNumber.className =
    "page-number";


  pageNumber.textContent =
    "Muka surat " +
    currentPage +
    " / " +
    totalPages;


  footerArea.appendChild(
    note
  );


  footerArea.appendChild(
    pageNumber
  );


  return footerArea;

}


/* =====================================================
   MEMBER GROUP
===================================================== */

function appendMemberGroup(
  container,
  title,
  members,
  startNumber = 1
) {

  if (
    !Array.isArray(members) ||
    !members.length
  ) {

    return;

  }


  /* ===================================================
     GROUP TITLE
  =================================================== */

  const heading =
    document.createElement(
      "strong"
    );


  heading.className =
    "recipient-type-heading";


  heading.textContent =
    title;


  container.appendChild(
    heading
  );


  /* ===================================================
     NUMBERED LIST
  =================================================== */

  const list =
    document.createElement(
      "ol"
    );


  list.className =
    "name-list";


  /*
    Penting:
    Sambung numbering daripada
    muka surat sebelumnya.
  */

  list.start =
    startNumber;


  members.forEach(
    function (member) {

      const item =
        document.createElement(
          "li"
        );


      item.textContent =
        getReviewMemberName(
          member
        );


      list.appendChild(
        item
      );

    }
  );


  container.appendChild(
    list
  );

}


/* =====================================================
   BUILD ALL RECIPIENT ITEMS
===================================================== */

function buildRecipientItems() {

  const items =
    [];


  const participants =
    Array.isArray(
      reviewData.participants
    )
      ? reviewData.participants
      : [];


  const secretariat =
    Array.isArray(
      reviewData.secretariat
    )
      ? reviewData.secretariat
      : [];


  /* =====================================================
     JEMPUT SEMUA AHLI
  ====================================================== */

  if (
    reviewData &&
    reviewData.inviteAll === true
  ) {

    /*
      Paparkan satu sahaja:
      SEMUA AHLI PASPA
    */

    items.push({
      type:
        "all",

      member: {
        pangkat:
          "",

        namaPenuh:
          "SEMUA AHLI PASPA"
      }
    });


    /*
      Tetapi Urusetia masih perlu
      dipaparkan seperti biasa.
    */

    secretariat.forEach(
      function (member) {

        items.push({
          type:
            "secretariat",

          member:
            member
        });

      }
    );


    return items;

  }


  /* =====================================================
     PILIH PESERTA SECARA MANUAL
  ====================================================== */

  participants.forEach(
    function (member) {

      items.push({
        type:
          "participant",

        member:
          member
      });

    }
  );


  secretariat.forEach(
    function (member) {

      items.push({
        type:
          "secretariat",

        member:
          member
      });

    }
  );


  return items;

}
/* =====================================================
   RENDER ONE NAME CHUNK
===================================================== */

function renderRecipientChunk(
  container,
  chunk,
  participantStart = 1,
  secretariatStart = 1
) {

    const allMembers =
    chunk.filter(
      function (item) {

        return (
          item.type ===
          "all"
        );

      }
    );


  if (
    allMembers.length
  ) {

    const allText =
      document.createElement(
        "div"
      );


    allText.className =
      "all-members-recipient";


    allText.textContent =
      "SEMUA AHLI PASPA";


    container.appendChild(
      allText
    );


    

  }

  const participantMembers =
    [];


  const secretariatMembers =
    [];


  chunk.forEach(
    function (item) {

      if (
        item.type ===
        "participant"
      ) {

        participantMembers.push(
          item.member
        );

      }


      if (
        item.type ===
        "secretariat"
      ) {

        secretariatMembers.push(
          item.member
        );

      }

    }
  );


  /* ===================================================
     PARTICIPANT LIST
  =================================================== */

  appendMemberGroup(
    container,
    "Peserta:",
    participantMembers,
    participantStart
  );


  /* ===================================================
     SECRETARIAT LIST
  =================================================== */

  appendMemberGroup(
    container,
    "Urusetia:",
    secretariatMembers,
    secretariatStart
  );

 

}


/* =====================================================
   FIRST PAGE
===================================================== */

function createFirstNamePage(
  chunk,
  pageNumber,
  totalPages,
  participantStart = 1,
  secretariatStart = 1
) {

  const program =
    reviewData.program || {};


  const page =
    document.createElement(
      "section"
    );


  page.className =
    "letter-sheet";


  page.innerHTML = `

    <section class="letter-head">

      <img
        src="../images/logo.png"
        alt="Logo PASPA"
        class="letter-logo"
      >

      <div class="letter-organisation">

        PASUKAN KHAS PERTAHANAN AWAM

        <br>

        (PASPA)

      </div>

    </section>


    <section class="letter-reference">

      <div>

        <strong>
          NO. RUJUKAN:
        </strong>

        ${escapeHtml(
          reviewData.noRujukan ||
          "DRAF"
        )}

      </div>


      <div class="letter-reference-right">

        <strong>
          TARIKH:
        </strong>

        ${escapeHtml(
          getTodayDisplay()
        )}

      </div>

    </section>


    <section class="letter-subject">

      <div class="letter-label">

        PERKARA

      </div>


      <div class="letter-value subject-value">

        ${escapeHtml(
          program.perkara || "-"
        )}

      </div>

    </section>


    <section class="recipient-section">

      <div class="recipient-label">

        KEPADA:

      </div>


      <div
        class="recipient-content"
        data-recipient-container
      ></div>

    </section>

  `;


  const recipientContainer =
    page.querySelector(
      "[data-recipient-container]"
    );


  renderRecipientChunk(
    recipientContainer,
    chunk,
    participantStart,
    secretariatStart
  );


  page.appendChild(
    createPageNumber(
      pageNumber,
      totalPages
    )
  );


  return page;

}


/* =====================================================
   CONTINUATION NAME PAGE
===================================================== */

function createContinuationNamePage(
  chunk,
  pageNumber,
  totalPages,
  participantStart = 1,
  secretariatStart = 1
) {

  const page =
    document.createElement(
      "section"
    );


  page.className =
    "letter-sheet";


  page.innerHTML = `

    <section class="continuation-header">

      <strong>

        PASUKAN KHAS PERTAHANAN AWAM
        (PASPA)

      </strong>


      <div class="continuation-title">

        SENARAI NAMA - SAMBUNGAN

      </div>

    </section>


    <section
      class="continuation-name-list"
      data-recipient-container
    ></section>

  `;


  const recipientContainer =
    page.querySelector(
      "[data-recipient-container]"
    );


  renderRecipientChunk(
    recipientContainer,
    chunk,
    participantStart,
    secretariatStart
  );


  page.appendChild(
    createPageNumber(
      pageNumber,
      totalPages
    )
  );


  return page;

}


/* =====================================================
   BODY PAGE
===================================================== */

function createBodyPage(
  pageNumber,
  totalPages
) {

  const program =
    reviewData.program || {};


  const organizer =
    program.penganjur ===
      "Lain-lain"

      ? (
          program.penganjurLain ||
          "-"
        )

      : (
          program.penganjur ||
          "-"
        );


  const page =
    document.createElement(
      "section"
    );


  page.className =
    "letter-sheet";


  page.innerHTML = `

    <section class="continuation-header">

      <strong>

        PASUKAN KHAS PERTAHANAN AWAM
        (PASPA)

      </strong>


      <div class="continuation-title">

        JEMPUTAN PROGRAM

      </div>

    </section>


    <section class="letter-body">

      <p>

        Dengan segala hormatnya
        tuan/puan dijemput untuk
        menghadiri program berikut:

      </p>


      <div class="program-info">


        <div class="program-info-label">

          Perkara:

        </div>


        <div>

          ${escapeHtml(
            program.perkara || "-"
          )}

        </div>


        <div class="program-info-label">

          Tarikh Program:

        </div>


        <div>

          Mula

          ${escapeHtml(
            formatReviewDate(
              program.tarikhMula
            )
          )}

          hingga

          ${escapeHtml(
            formatReviewDate(
              program.tarikhTamat
            )
          )}

        </div>


        <div class="program-info-label">

          Tempat:

        </div>


        <div>

          ${escapeHtml(
            program.tempat || "-"
          )}

        </div>


        <div class="program-info-label">

          Penganjur:

        </div>


        <div>

          ${escapeHtml(
            organizer
          )}

        </div>

      </div>


      <p class="letter-description">

        ${escapeHtml(
          program.keterangan || ""
        )}

      </p>


      <p class="response-text">

        Segala maklumbalas dan pertanyaan,
        sila berhubung dengan pihak urusetia
        dengan kadar segera.

      </p>

    </section>

  `;


  page.appendChild(
    createPageNumber(
      pageNumber,
      totalPages
    )
  );


  return page;

}


/* =====================================================
   BODY SECTION
   Digunakan apabila isi surat masih
   boleh dimuatkan pada page nama terakhir
===================================================== */

function buildBodySectionHtml() {

  const program =
    reviewData.program || {};


  const organizer =
    program.penganjur ===
      "Lain-lain"

      ? (
          program.penganjurLain ||
          "-"
        )

      : (
          program.penganjur ||
          "-"
        );


  return `

    <section class="letter-body">


      <p>

        Dengan segala hormatnya
        tuan/puan dijemput untuk
        menghadiri program berikut:

      </p>


      <div class="program-info">


        <div class="program-info-label">

          Perkara:

        </div>


        <div>

          ${escapeHtml(
            program.perkara || "-"
          )}

        </div>


        <div class="program-info-label">

          Tarikh Program:

        </div>


        <div>

          Mula

          ${escapeHtml(
            formatReviewDate(
              program.tarikhMula
            )
          )}

          hingga

          ${escapeHtml(
            formatReviewDate(
              program.tarikhTamat
            )
          )}

        </div>


        <div class="program-info-label">

          Tempat:

        </div>


        <div>

          ${escapeHtml(
            program.tempat || "-"
          )}

        </div>


        <div class="program-info-label">

          Penganjur:

        </div>


        <div>

          ${escapeHtml(
            organizer
          )}

        </div>

      </div>


      <p class="letter-description">

        ${escapeHtml(
          program.keterangan || ""
        )}

      </p>


      <p class="response-text">

        Segala maklumbalas dan pertanyaan,
        sila berhubung dengan pihak urusetia
        dengan kadar segera.

      </p>


    </section>

  `;

}


/* =====================================================
   RENDER WHOLE LETTER
===================================================== */

function renderReviewLetter() {

  if (
    !reviewData ||
    !invitationLetter
  ) {

    return;

  }


  invitationLetter.innerHTML =
    "";


  const recipientItems =
    buildRecipientItems();


  /* ===================================================
     SPLIT RECIPIENT INTO PAGES
  =================================================== */

  let chunks =
    splitRecipientPages(
      recipientItems
    );


  if (!chunks.length) {

    chunks = [
      []
    ];

  }


  const pages =
    [];


  /* ===================================================
     NUMBER TRACKING
  =================================================== */

  let participantNumber =
    1;


  let secretariatNumber =
    1;


  /* ===================================================
     BUILD NAME PAGES
  =================================================== */

  chunks.forEach(
    function (
      chunk,
      index
    ) {

      const participantCount =
        chunk.filter(
          function (item) {

            return (
              item.type ===
              "participant"
            );

          }
        ).length;


      const secretariatCount =
        chunk.filter(
          function (item) {

            return (
              item.type ===
              "secretariat"
            );

          }
        ).length;


      let page;


      /* =================================================
         FIRST PAGE
      ================================================= */

      if (
        index === 0
      ) {

        page =
          createFirstNamePage(
            chunk,
            1,
            1,
            participantNumber,
            secretariatNumber
          );

      }


      /* =================================================
         CONTINUATION PAGE
      ================================================= */

      else {

        page =
          createContinuationNamePage(
            chunk,
            1,
            1,
            participantNumber,
            secretariatNumber
          );

      }


      pages.push(
        page
      );


      /* =================================================
         CONTINUE NUMBERING
      ================================================= */

      participantNumber +=
        participantCount;


      secretariatNumber +=
        secretariatCount;

    }
  );


  /* ===================================================
     TRY TO PUT BODY ON LAST NAME PAGE
  =================================================== */

  const lastPage =
    pages[
      pages.length - 1
    ];


  const bodyWrapper =
    document.createElement(
      "div"
    );


  bodyWrapper.innerHTML =
    buildBodySectionHtml();


  const bodySection =
    bodyWrapper.firstElementChild;


  /* ===================================================
     TEMPORARILY APPEND BODY
  =================================================== */

  lastPage.appendChild(
    bodySection
  );


  invitationLetter.appendChild(
    lastPage
  );


  /* ===================================================
     CALCULATE PAGE SIZE
  =================================================== */

  const pageHeight =
    lastPage.clientHeight;


  const pageTop =
    lastPage
      .getBoundingClientRect()
      .top;


  const bodyBottom =
    bodySection
      .getBoundingClientRect()
      .bottom;


  const contentBottom =
    bodyBottom -
    pageTop;


  /*
    Space reserved for:
    - computer generated note
    - page number
  */

  const safeBottomSpace =
    55;


  const bodyFits =
    contentBottom <
    (
      pageHeight -
      safeBottomSpace
    );


  /* ===================================================
     REMOVE TEMPORARY PAGE
  =================================================== */

  invitationLetter.removeChild(
    lastPage
  );


 /* ===================================================
   BODY DOES NOT FIT
=================================================== */

if (!bodyFits) {

  lastPage.removeChild(
    bodySection
  );

  const bodyPage =
    createBodyPage(
      1,
      1
    );

  pages.push(
    bodyPage
  );

}




  /*
    Jika bodyFits === true,
    bodySection kekal pada lastPage.
  */


  /* ===================================================
     TOTAL PAGES
  =================================================== */

  const totalPages =
    pages.length;


  /* ===================================================
     RENDER ALL PAGES
  =================================================== */

  pages.forEach(
    function (
      page,
      index
    ) {

      /*
        Buang footer/page-number sementara
        yang dicipta awal.
      */

      const oldFooter =
        page.querySelector(
          ".page-footer-area"
        );


      if (
        oldFooter
      ) {

        oldFooter.remove();

      }


      /* =================================================
         ADD FINAL FOOTER + PAGE NUMBER
      ================================================= */

      page.appendChild(
        createPageNumber(
          index + 1,
          totalPages
        )
      );


      /* =================================================
         ADD PAGE TO DOCUMENT
      ================================================= */

      invitationLetter.appendChild(
        page
      );

    }
  );

}


/* =====================================================
   MESSAGE
===================================================== */

function showReviewMessage(
  message,
  type
) {

  const box =
    document.getElementById(
      "reviewMessage"
    );


  if (!box) {
    return;
  }


  box.textContent =
    message;


  box.className =
    "review-message " +
    type;


  box.hidden =
    false;

}


/* =====================================================
   PRINT
===================================================== */

document
  .getElementById(
    "printButton"
  )
  .addEventListener(
    "click",
    function () {

      window.print();

    }
  );


/* =====================================================
   DOWNLOAD PDF
===================================================== */

document
  .getElementById(
    "downloadButton"
  )
  .addEventListener(
    "click",
    async function () {

      if (!reviewData) {

        showReviewMessage(
          "Data jemputan tidak tersedia.",
          "error"
        );

        return;

      }


      if (
        typeof html2pdf ===
        "undefined"
      ) {

        showReviewMessage(
          "Fungsi Download PDF tidak dapat dimuatkan. Gunakan Print dan pilih Save as PDF.",
          "error"
        );

        return;

      }


      try {

        const perkara =
          reviewData.program?.perkara ||
          "Jemputan-Program";


        const filename =
          perkara
            .replace(
              /[^a-z0-9]+/gi,
              "-"
            )
            .replace(
              /^-|-$/g,
              ""
            ) +
          ".pdf";


const options = {

  margin:
    0,

  filename:
    filename,

  image: {

    type:
      "jpeg",

    quality:
      0.98

  },

  html2canvas: {

    scale:
      2,

    useCORS:
      true,

    backgroundColor:
      "#ffffff"

  },

  jsPDF: {

    unit:
      "mm",

    format:
      "a4",

    orientation:
      "portrait"

  },

  pagebreak: {

    mode: [
      "avoid-all",
      "css",
      "legacy"
    ],

    avoid: [
      ".letter-sheet"
    ]

  }

};


        await html2pdf()
          .set(
            options
          )
          .from(
            invitationLetter
          )
          .save();


      } catch (error) {

        console.error(
          "DOWNLOAD PDF ERROR:",
          error
        );


        showReviewMessage(
          "PDF gagal dijana. Gunakan Print dan pilih Save as PDF.",
          "error"
        );

      }

    }
  );


/* =====================================================
   PASTI
===================================================== */

/* =====================================================
   PASTI - HANTAR JEMPUTAN KEPADA AHLI
===================================================== */

document
  .getElementById(
    "confirmButton"
  )
  .addEventListener(
    "click",
    async function () {

      const confirmButton =
        document.getElementById(
          "confirmButton"
        );


      /* =================================================
         SEMAK DATA SURAT
      ================================================= */

      if (!reviewData) {

        showReviewMessage(
          "Data jemputan tidak tersedia.",
          "error"
        );

        return;

      }


      /* =================================================
         SEMAK SESSION ADMIN
      ================================================= */

      let session = null;


      try {

        session =
          JSON.parse(
            localStorage.getItem(
              "paspaGoSession"
            )
          );

      } catch (error) {

        session = null;

      }


      if (
        !session ||
        session.isLoggedIn !== true ||
        !session.googleEmail
      ) {

        showReviewMessage(
          "Sesi log masuk tidak ditemui. Sila log masuk semula.",
          "error"
        );

        return;

      }


      /* =================================================
         CONFIRMATION
      ================================================= */

      const perkara =
        reviewData.program?.perkara ||
        "program ini";


      const confirmed =
        window.confirm(
          "Adakah anda pasti mahu menghantar jemputan " +
          perkara +
          " kepada ahli yang dipilih?"
        );


      if (!confirmed) {
        return;
      }


      /* =================================================
         ELAK DOUBLE CLICK
      ================================================= */

      confirmButton.disabled =
        true;


      const originalText =
        confirmButton.textContent;


      confirmButton.textContent =
        "MENGHANTAR...";


      showReviewMessage(
        "Jemputan sedang dihantar. Sila tunggu...",
        "info"
      );


      try {

        /* ===============================================
           HANTAR KE GOOGLE APPS SCRIPT
        =============================================== */

        let result;


/* =================================================
   EDIT PROGRAM SEDIA ADA
================================================= */

if (
  reviewData.mode === "edit" &&
  reviewData.messageId
) {

  result =
    await apiPost({

      action:
        "admin_program_update",

      email:
        session.googleEmail,

      messageId:
        reviewData.messageId,

      data:
        reviewData

    });

}


/* =================================================
   PROGRAM BARU
================================================= */

else {

  result =
    await apiPost({

      action:
        "send_program_invitation",

      email:
        session.googleEmail,

      data:
        reviewData

    });

}


        /* ===============================================
           SEMAK RESPONSE
        =============================================== */
if (
  !result ||
  result.success !== true
) {

  console.error(
    "BACKEND RESPONSE:",
    result
  );

  throw new Error(
    result?.error ||
    result?.message ||
    "Jemputan gagal dihantar."
  );

}


        /* ===============================================
           SIMPAN MESSAGE ID DALAM DRAFT
        =============================================== */

        reviewData.messageId =
          result.messageId;


        reviewData.invitationSent =
          true;


        localStorage.setItem(
          REVIEW_STORAGE_KEY,
          JSON.stringify(
            reviewData
          )
        );


        /* ===============================================
           SUCCESS
        =============================================== */

        showReviewMessage(
          "Jemputan berjaya dihantar kepada " +
          result.totalRecipients +
          " ahli. ID Mesej: " +
          result.messageId,
          "success"
        );


        confirmButton.textContent =
          "✓ DIHANTAR";


        confirmButton.disabled =
          true;


      } catch (error) {

        console.error(
          "SEND INVITATION ERROR:",
          error
        );


        showReviewMessage(
          error.message ||
          "Jemputan gagal dihantar.",
          "error"
        );


        confirmButton.disabled =
          false;


        confirmButton.textContent =
          originalText;

      }

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

      const params =
        new URLSearchParams(
          window.location.search
        );


      const from =
        params.get("from");


      if (from === "mesej") {

        window.location.href =
          "mesej.html";

        return;

      }


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
   MOBILE A4 SCALE
===================================================== */

function scaleReviewLetterForMobile() {

  const scaleWrapper =
    document.getElementById(
      "reviewLetterScale"
    );

  if (!scaleWrapper) {
    return;
  }


  if (
    window.innerWidth > 600
  ) {

    scaleWrapper.style.transform =
      "";

    scaleWrapper.style.height =
      "";

    scaleWrapper.style.marginBottom =
      "";

    return;

  }


  const a4WidthPx =
    793.7;


  const availableWidth =
    window.innerWidth - 20;


  const scale =
    Math.min(
      1,
      availableWidth /
      a4WidthPx
    );


  const originalHeight =
    scaleWrapper.scrollHeight;


  scaleWrapper.style.transform =
    "scale(" +
    scale +
    ")";


  scaleWrapper.style.transformOrigin =
    "top left";


  scaleWrapper.style.height =
    (
      originalHeight *
      scale
    ) +
    "px";


  scaleWrapper.style.marginBottom =
    "0";

}

function applyReviewMode() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const from =
    params.get("from");

  const confirmButton =
    document.getElementById(
      "confirmButton"
    );

  if (
    from === "mesej" &&
    confirmButton
  ) {

    confirmButton.style.display =
      "none";

  }

}
/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    applyReviewMode();

    await loadReviewData();

    requestAnimationFrame(
      function () {
        scaleReviewLetterForMobile();
      }
    );

  }
);


/* =====================================================
   RESIZE
===================================================== */

window.addEventListener(
  "resize",
  function () {

    requestAnimationFrame(
      function () {
        scaleReviewLetterForMobile();
      }
    );

  }
);