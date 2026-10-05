"use strict";


/* =====================================================
   SESSION
===================================================== */

const currentSession =
  JSON.parse(
    localStorage.getItem(
      "paspaGoSession"
    ) || "null"
  );


if (
  !currentSession ||
  currentSession.isLoggedIn !== true
) {

  window.location.href =
    "../index.html";

}



/* =====================================================
   ELEMENT
===================================================== */

const programBackButton =
  document.getElementById(
    "programBackButton"
  );

const programHomeButton =
  document.getElementById(
    "programHomeButton"
  );

const programMemberName =
  document.getElementById(
    "programMemberName"
  );

const programMemberId =
  document.getElementById(
    "programMemberId"
  );

const programList =
  document.getElementById(
    "programList"
  );

const programLoading =
  document.getElementById(
    "programLoading"
  );

const programEmpty =
  document.getElementById(
    "programEmpty"
  );

const programYearFilters =
  document.getElementById(
    "programYearFilters"
  );

const programEditStatus =
  document.getElementById(
    "programEditStatus"
  );

const addProgramButton =
  document.getElementById(
    "addProgramButton"
  );

const programFormSection =
  document.getElementById(
    "programFormSection"
  );

const closeProgramFormButton =
  document.getElementById(
    "closeProgramFormButton"
  );

const programForm =
  document.getElementById(
    "programForm"
  );

const saveProgramButton =
  document.getElementById(
    "saveProgramButton"
  );

const programMessage =
  document.getElementById(
    "programMessage"
  );

const domesticProgramFields =
  document.getElementById(
    "domesticProgramFields"
  );

const internationalProgramFields =
  document.getElementById(
    "internationalProgramFields"
  );

const otherOrganizerField =
  document.getElementById(
    "otherOrganizerField"
  );



/* =====================================================
   DATA
===================================================== */

let allPrograms = [];

let activeLocationFilter =
  "Semua";

let activeYearFilter =
  "Semua";

let memberCanEditProgram =
  false;

let editingProgram = null;



/* =====================================================
   HEADER
===================================================== */

programBackButton.addEventListener(
  "click",
  function () {

    window.location.href =
      "dashboard.html";

  }
);


programHomeButton.addEventListener(
  "click",
  function () {

    window.location.href =
      "dashboard.html";

  }
);



/* =====================================================
   MEMBER
===================================================== */

function renderMemberHeader() {

  programMemberName.textContent =
    currentSession.namaAhli ||
    "Ahli PASPA";

  programMemberId.textContent =
    currentSession.idPaspa ||
    "-";

}



/* =====================================================
   MESSAGE
===================================================== */

function showProgramMessage(
  message,
  type
) {

  programMessage.textContent =
    message || "";

  programMessage.className =
    "program-message " +
    (type || "success");

}


function hideProgramMessage() {

  programMessage.classList.add(
    "hidden"
  );

}



/* =====================================================
   EDIT ACCESS
===================================================== */

async function loadProgramEditAccess() {

  try {

    const result =
  await apiPost({

    action:
      "program_edit_access",

    idPaspa:
      currentSession.idPaspa

  });


    if (
      result.success !== true
    ) {

      memberCanEditProgram =
        false;

      addProgramButton
        .classList
        .add("hidden");

      return;

    }


    memberCanEditProgram =
      result.editable === true;


    programEditStatus
      .classList
      .remove(
        "hidden",
        "open",
        "locked"
      );


    if (memberCanEditProgram) {

      programEditStatus
        .classList
        .add("open");

      programEditStatus.textContent =
        "Kemaskini Program dibuka. Anda masih boleh menambah rekod Program lama.";

      addProgramButton
        .classList
        .remove("hidden");

    } else {

      programEditStatus
        .classList
        .add("locked");

      programEditStatus.textContent =
        "Kemaskini Program telah dikunci oleh pentadbir. Rekod hanya boleh dilihat.";

      addProgramButton
        .classList
        .add("hidden");

    }

  } catch (error) {

    console.error(error);

    memberCanEditProgram =
      false;

    addProgramButton
      .classList
      .add("hidden");

  }

}



/* =====================================================
   LOAD PROGRAM
===================================================== */

async function loadPrograms() {

  programLoading
    .classList
    .remove("hidden");

  programEmpty
    .classList
    .add("hidden");

  programList.innerHTML =
    "";


  try {

    const result =
      await apiPost({

        action:
          "program_list",

        email:
          currentSession.googleEmail

      });

console.log(
  "PROGRAM SAVE RESULT:",
  result
);


    if (
      result.success !== true
    ) {

      throw new Error(
        result.message ||
        "Program tidak dapat dimuatkan."
      );

    }


    allPrograms =
      Array.isArray(
        result.programs
      )
        ? result.programs
        : [];


        console.log(
  "PROGRAM API RESULT:",
  result.programs
);
    createYearFilters();

    renderPrograms();


  } catch (error) {

    console.error(error);

    showProgramMessage(
      error.message,
      "error"
    );


  } finally {

    programLoading
      .classList
      .add("hidden");

  }

}



/* =====================================================
   YEAR
===================================================== */

function getProgramYear(program) {

  const value =
    String(
      program.tarikhMula || ""
    );


  const match =
    value.match(
      /(\d{4})$/
    );


  return match
    ? match[1]
    : "";

}


function createYearFilters() {

  const years =
    [...new Set(
      allPrograms
        .map(getProgramYear)
        .filter(Boolean)
    )]
      .sort(
        function (a, b) {
          return Number(b) -
            Number(a);
        }
      );


  programYearFilters.innerHTML =
    "";


  const allButton =
    createYearButton(
      "Semua"
    );


  programYearFilters.appendChild(
    allButton
  );


  years.forEach(
    function (year) {

      programYearFilters.appendChild(
        createYearButton(year)
      );

    }
  );

}


function createYearButton(year) {

  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";

  button.className =
    "program-year-button";


  if (
    String(year) ===
    String(activeYearFilter)
  ) {

    button.classList.add(
      "active"
    );

  }


  button.textContent =
    year;


  button.addEventListener(
    "click",
    function () {

      activeYearFilter =
        year;


      document
        .querySelectorAll(
          ".program-year-button"
        )
        .forEach(
          function (item) {

            item.classList
              .remove(
                "active"
              );

          }
        );


      button.classList.add(
        "active"
      );


      renderPrograms();

    }
  );


  return button;

}



/* =====================================================
   LOCATION FILTER
===================================================== */

document
  .querySelectorAll(
    "[data-location-filter]"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          activeLocationFilter =
            button.dataset
              .locationFilter;


          document
            .querySelectorAll(
              "[data-location-filter]"
            )
            .forEach(
              function (item) {

                item.classList
                  .remove(
                    "active"
                  );

              }
            );


          button.classList
            .add("active");


          renderPrograms();

        }
      );

    }
  );

/* =====================================================
   TARIKH UNTUK SUSUNAN PROGRAM
===================================================== */

function parseProgramDateForSort(value) {

  const text =
    String(
      value || ""
    ).trim();


  if (!text) {
    return 0;
  }


  /*
   * dd/mm/yyyy
   */

  let match =
    text.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );


  if (match) {

    return new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1])
    ).getTime();

  }


  /*
   * yyyy-mm-dd
   */

  match =
    text.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/
    );


  if (match) {

    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    ).getTime();

  }


  return 0;
}

/* =====================================================
   RENDER PROGRAM
===================================================== */

/* =====================================================
   RENDER PROGRAM
===================================================== */

function renderPrograms() {

  programList.innerHTML = "";


  const filtered =
    allPrograms
      .filter(
        function (program) {

          const locationMatch =
            activeLocationFilter ===
              "Semua" ||
            String(
              program.lokasiProgram || ""
            ) ===
              activeLocationFilter;


          const year =
            getProgramYear(
              program
            );


          const yearMatch =
            activeYearFilter ===
              "Semua" ||
            year ===
              String(
                activeYearFilter
              );


          return (
            locationMatch &&
            yearMatch
          );

        }
      )

      /* ===============================================
         SUSUN TARIKH TERBARU → TERLAMA
      =============================================== */

      .sort(
        function (a, b) {

          const dateA =
            parseProgramDateForSort(
              a.tarikhMula
            );

          const dateB =
            parseProgramDateForSort(
              b.tarikhMula
            );


          return dateB - dateA;

        }
      );


  if (!filtered.length) {

    programEmpty
      .classList
      .remove("hidden");

    return;

  }


  programEmpty
    .classList
    .add("hidden");


  filtered.forEach(
    function (program) {

      programList.appendChild(
        createProgramCard(
          program
        )
      );

    }
  );

}



/* =====================================================
   CARD
===================================================== */
function createProgramCard(
  program
) {

  const card =
    document.createElement(
      "article"
    );

  card.className =
    "program-item";


  const location =
    String(
      program.lokasiProgram ||
      ""
    );


  const locationText =
    location ===
      "Luar Negara"
      ? (
          program.negara ||
          program.tempat ||
          "-"
        )
      : (
          program.negeri ||
          program.tempat ||
          "-"
        );


  const organizer =
    program.penganjur ===
      "Lain-lain"
      ? (
          program.penganjurLain ||
          "Lain-lain"
        )
      : (
          program.penganjur ||
          "-"
        );


  card.innerHTML = `

    <div class="program-item-top">

      <div>

        <span class="program-item-type">
          ${escapeHtml(
            program.kategoriProgram ||
            "Program"
          )}
        </span>

        <h3>
          ${escapeHtml(
            program.perkara ||
            "-"
          )}
        </h3>

      </div>


      <span class="program-location-badge">
        ${escapeHtml(
          location ||
          "-"
        )}
      </span>

    </div>


    <div class="program-item-details">

      <div class="program-detail">
       Tarikh:
<strong>
  ${escapeHtml(
    formatProgramDate(
      program.tarikhMula
    )
  )}
  hingga
  ${escapeHtml(
    formatProgramDate(
      program.tarikhTamat
    )
  )}
</strong>
      </div>


      <div class="program-detail">
        Tempat:
        <strong>
          ${escapeHtml(
            program.tempat ||
            "-"
          )}
        </strong>
      </div>


      <div class="program-detail">
        Negeri / Negara:
        <strong>
          ${escapeHtml(
            locationText
          )}
        </strong>
      </div>


      <div class="program-detail">
        Penyertaan:
        <strong>
          ${escapeHtml(
            program.peranan ||
            "-"
          )}
        </strong>
      </div>


      <div class="program-detail">
        Penganjur:
        <strong>
          ${escapeHtml(
            organizer
          )}
        </strong>
      </div>


      <div class="program-detail">
        Kehadiran:
        <strong>
          ${escapeHtml(
            program.statusKehadiran ||
            "-"
          )}
        </strong>
      </div>


      ${
        program.sijilUrl
          ? `
            <div class="program-detail">
              Sijil:
              <strong>
                <a
                  href="${escapeHtml(
                    program.sijilUrl
                  )}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="program-certificate-link"
                >
                  📄 Lihat Sijil
                </a>
              </strong>
            </div>
          `
          : ""
      }

    </div>

  `;


  /* =====================================================
     SATU SAHAJA BLOK EDIT & PADAM
  ===================================================== */

  if (
    memberCanEditProgram &&
    String(
      program.sumberRekod || ""
    )
      .trim()
      .toLowerCase() === "ahli"
  ) {

    const actions =
      document.createElement(
        "div"
      );

    actions.className =
      "program-item-actions";


    const editButton =
      document.createElement(
        "button"
      );

    editButton.type =
      "button";

    editButton.className =
      "program-edit-button";

    editButton.textContent =
      "✏️";


    editButton.addEventListener(
      "click",
      function () {

        openProgramEditForm(
          program
        );

      }
    );


    const deleteButton =
      document.createElement(
        "button"
      );

    deleteButton.type =
      "button";

    deleteButton.className =
      "program-delete-button";

    deleteButton.textContent =
      "🗑️";


    deleteButton.addEventListener(
      "click",
      function () {

        deleteProgramRecord(
          program
        );

      }
    );


    actions.appendChild(
      editButton
    );

    actions.appendChild(
      deleteButton
    );


    card.appendChild(
      actions
    );

  }


  /* =====================================================
   REKOD ADMIN
   AHLI HANYA BOLEH TAMBAH / GANTI SIJIL
===================================================== */

if (
  String(
    program.sumberRekod || ""
  )
    .trim()
    .toLowerCase() === "admin"
) {

  const certificateActions =
    document.createElement(
      "div"
    );

  certificateActions.className =
    "program-item-actions";


  const certificateButton =
    document.createElement(
      "button"
    );

  certificateButton.type =
    "button";

  certificateButton.className =
    "program-edit-button";

  certificateButton.textContent =
    "📎 Sijil";


  certificateButton.addEventListener(
    "click",
    function () {

      openAdminProgramCertificateForm(
        program
      );

    }
  );


  certificateActions.appendChild(
    certificateButton
  );

  card.appendChild(
    certificateActions
  );

}



  return card;

}


async function deleteProgramRecord(program) {

  const confirmed =
    window.confirm(
      'Adakah anda pasti mahu memadam "' +
      (program.perkara || "Program ini") +
      '"?'
    );

  if (!confirmed) {
    return;
  }

  try {

    const result =
      await apiPost({

        action:
          "program_delete_history",

        email:
          currentSession.googleEmail,

        idPaspa:
          currentSession.idPaspa,

        memberCourseId:
          program.memberCourseId,

        courseId:
          program.courseId

      });


    if (result.success !== true) {

      throw new Error(
        result.message ||
        "Program gagal dipadam."
      );

    }


    showProgramMessage(
      "Program berjaya dipadam.",
      "success"
    );


    await loadPrograms();


  } catch (error) {

    console.error(
      error
    );


    showProgramMessage(
      error.message,
      "error"
    );

  }

}
/* =====================================================
   FORMAT TARIKH PROGRAM
===================================================== */

function formatProgramDate(value) {

  const text =
    String(value || "").trim();


  if (!text) {
    return "-";
  }


  /*
   * Format dari input HTML:
   * yyyy-mm-dd
   */

  let match =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );


  if (match) {

    return (
      match[3] +
      "/" +
      match[2] +
      "/" +
      match[1]
    );

  }


  /*
   * Jika API sudah beri:
   * dd/mm/yyyy
   */

  match =
    text.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );


  if (match) {

    return text;

  }


  /*
   * Jika Google Sheets / Apps Script
   * pulangkan ISO Date
   */

  match =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})T/
    );


  if (match) {

    return (
      match[3] +
      "/" +
      match[2] +
      "/" +
      match[1]
    );

  }


  return text;
}



/* =====================================================
   FORMAT TARIKH UNTUK INPUT TYPE="DATE"
===================================================== */

function formatProgramDateForInput(value) {

  const text =
    String(value || "").trim();


  if (!text) {
    return "";
  }


  /*
   * Sudah dalam format yyyy-mm-dd
   */

  let match =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );


  if (match) {
    return text;
  }


  /*
   * dd/mm/yyyy -> yyyy-mm-dd
   */

  match =
    text.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );


  if (match) {

    return (
      match[3] +
      "-" +
      match[2] +
      "-" +
      match[1]
    );

  }


  /*
   * ISO Date daripada Google Sheets
   */

  match =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})T/
    );


  if (match) {

    return (
      match[1] +
      "-" +
      match[2] +
      "-" +
      match[3]
    );

  }


  return "";
}


function openProgramEditForm(program) {

  editingProgram =
    program;


  /* KATEGORI */

  const kategoriInput =
    document.querySelector(
      'input[name="kategoriProgram"][value="' +
      program.kategoriProgram +
      '"]'
    );

  if (kategoriInput) {
    kategoriInput.checked = true;
  }


  /* LOKASI */

  const lokasiInput =
    document.querySelector(
      'input[name="lokasiProgram"][value="' +
      program.lokasiProgram +
      '"]'
    );

  if (lokasiInput) {
    lokasiInput.checked = true;
  }


  document.getElementById(
    "programPerkara"
  ).value =
    program.perkara || "";


  document.getElementById(
    "programTarikhMula"
  ).value =
    formatProgramDateForInput(
      program.tarikhMula
    );


  document.getElementById(
    "programTarikhTamat"
  ).value =
    formatProgramDateForInput(
      program.tarikhTamat
    );


  document.getElementById(
    "programTempat"
  ).value =
    program.tempat || "";


  document.getElementById(
    "programNegeri"
  ).value =
    program.negeri || "";


  document.getElementById(
    "programNegara"
  ).value =
    program.negara || "";


  document.getElementById(
    "programPeranan"
  ).value =
    program.peranan || "";


  document.getElementById(
    "programPenganjur"
  ).value =
    program.penganjur || "";


  document.getElementById(
    "programPenganjurLain"
  ).value =
    program.penganjurLain || "";


  /* PAPAR FIELD LOKASI */

  resetConditionalFields();


  if (
    program.lokasiProgram ===
    "Dalam Negara"
  ) {

    domesticProgramFields
      .classList
      .remove("hidden");

  }


  if (
    program.lokasiProgram ===
    "Luar Negara"
  ) {

    internationalProgramFields
      .classList
      .remove("hidden");

  }


  /* PENGANJUR LAIN */

  if (
    program.penganjur ===
    "Lain-lain"
  ) {

    otherOrganizerField
      .classList
      .remove("hidden");

  } else {

    otherOrganizerField
      .classList
      .add("hidden");

  }


  /* UBAH TAJUK & BUTTON */

  const formTitle =
    programFormSection
      .querySelector(
        ".program-form-header h2"
      );

  if (formTitle) {
    formTitle.textContent =
      "Edit Program";
  }


  saveProgramButton.textContent =
    "Simpan Perubahan";


  /*
   * Sijil lama dikekalkan.
   * Jangan benarkan tukar sijil dahulu.
   */

  /*
 * Benarkan ahli tambah / tukar sijil
 * semasa Edit Program.
 *
 * Jika ahli tidak pilih fail baru,
 * sijil lama akan dikekalkan.
 */

if (programCertificate) {

  programCertificate.disabled =
    false;

  programCertificate.value =
    "";

}


  programFormSection
    .classList
    .remove("hidden");


  programFormSection
    .scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

}

function openAdminProgramCertificateForm(
  program
) {

  editingProgram =
    {
      ...program,
      certificateOnly:
        true
    };


  programFormSection
    .classList
    .remove(
      "hidden"
    );


  /* =================================================
     ISI DATA PROGRAM
     TAPI SEMUA DIKUNCI
  ================================================= */

  const fields =
    programFormSection
      .querySelectorAll(
        'input:not([type="file"]), select'
      );


  fields.forEach(
    function (field) {

      field.disabled =
        true;

    }
  );


  /* =================================================
     ISI MAKLUMAT UNTUK PAPARAN
  ================================================= */

  const kategori =
    programForm
      .querySelector(
        `input[name="kategoriProgram"][value="${program.kategoriProgram}"]`
      );

  if (kategori) {
    kategori.checked =
      true;
  }


  const lokasi =
    programForm
      .querySelector(
        `input[name="lokasiProgram"][value="${program.lokasiProgram}"]`
      );

  if (lokasi) {
    lokasi.checked =
      true;
  }


  document
    .getElementById(
      "programPerkara"
    )
    .value =
      program.perkara || "";


  document
    .getElementById(
      "programTarikhMula"
    )
    .value =
      formatProgramDateForInput(
        program.tarikhMula
      );


  document
    .getElementById(
      "programTarikhTamat"
    )
    .value =
      formatProgramDateForInput(
        program.tarikhTamat
      );


  document
    .getElementById(
      "programTempat"
    )
    .value =
      program.tempat || "";


  document
    .getElementById(
      "programNegeri"
    )
    .value =
      program.negeri || "";


  document
    .getElementById(
      "programNegara"
    )
    .value =
      program.negara || "";


  document
    .getElementById(
      "programPeranan"
    )
    .value =
      program.peranan || "";


  document
    .getElementById(
      "programPenganjur"
    )
    .value =
      program.penganjur || "";


  document
    .getElementById(
      "programPenganjurLain"
    )
    .value =
      program.penganjurLain || "";


  /* =================================================
     SIJIL SAHAJA AKTIF
  ================================================= */

  if (
    programCertificate
  ) {

    programCertificate.disabled =
      false;

    programCertificate.value =
      "";

  }


  /* =================================================
     TAJUK
  ================================================= */

  const formTitle =
    programFormSection
      .querySelector(
        ".program-form-header h2"
      );


  if (formTitle) {

    formTitle.textContent =
      "Kemaskini Sijil Program";

  }


  saveProgramButton.textContent =
    program.sijilUrl
      ? "Ganti Sijil"
      : "Simpan Sijil";


  programFormSection
    .scrollIntoView({
      behavior:
        "smooth",
      block:
        "start"
    });

}


/* =====================================================
   ESCAPE
===================================================== */

function escapeHtml(value) {

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
   SHOW FORM
===================================================== */

addProgramButton.addEventListener(
  "click",
  function () {

    if (
      !memberCanEditProgram
    ) {

      return;

    }

    editingProgram = null;

    programForm.reset();

    setProgramMasterFieldsLocked(false);

    const courseSelect =
      document.getElementById(
        "programCourseSelect"
      );

    if (courseSelect) {
      courseSelect.value = "";
    }

    const newProgramField =
      document.getElementById(
        "newProgramNameField"
      );

    if (newProgramField) {
      newProgramField
        .classList
        .add("hidden");
    }

    clearProgramMasterFields();

    const formTitle =
      programFormSection
        .querySelector(
          ".program-form-header h2"
        );

    if (formTitle) {
      formTitle.textContent =
        "Tambah Program";
    }

    saveProgramButton.textContent =
      "Simpan Program";






    programFormSection
      .classList
      .remove("hidden");


    programFormSection
      .scrollIntoView({
        behavior:
          "smooth",
        block:
          "start"
      });

  }
);


closeProgramFormButton
  .addEventListener(
    "click",
    function () {

      programFormSection
        .classList
        .add("hidden");

      programForm.reset();
editingProgram = null;



setProgramMasterFieldsLocked(false);

const courseSelect =
  document.getElementById(
    "programCourseSelect"
  );

if (courseSelect) {
  courseSelect.value = "";
}

const newProgramField =
  document.getElementById(
    "newProgramNameField"
  );

if (newProgramField) {
  newProgramField
    .classList
    .add("hidden");
}

clearProgramMasterFields();

saveProgramButton.textContent =
  "Simpan Program";

if (programCertificate) {
  programCertificate.disabled = false;
}

const formTitle =
  programFormSection
    .querySelector(
      ".program-form-header h2"
    );

if (formTitle) {
  formTitle.textContent =
    "Tambah Program";
}

      resetConditionalFields();

    }
  );



/* =====================================================
   LOCATION FORM
===================================================== */

document
  .querySelectorAll(
    'input[name="lokasiProgram"]'
  )
  .forEach(
    function (input) {

      input.addEventListener(
        "change",
        function () {

          resetConditionalFields();


          if (
            input.value ===
              "Dalam Negara"
          ) {

            domesticProgramFields
              .classList
              .remove(
                "hidden"
              );

          }


          if (
            input.value ===
              "Luar Negara"
          ) {

            internationalProgramFields
              .classList
              .remove(
                "hidden"
              );

          }

        }
      );

    }
  );


function resetConditionalFields() {

  domesticProgramFields
    .classList
    .add("hidden");

  internationalProgramFields
    .classList
    .add("hidden");

}



/* =====================================================
   PENGANJUR
===================================================== */

document
  .getElementById(
    "programPenganjur"
  )
  .addEventListener(
    "change",
    function (event) {

      if (
        event.target.value ===
          "Lain-lain"
      ) {

        otherOrganizerField
          .classList
          .remove(
            "hidden"
          );

      } else {

        otherOrganizerField
          .classList
          .add(
            "hidden"
          );

        document
          .getElementById(
            "programPenganjurLain"
          )
          .value =
            "";

      }

    }
  );



/* =====================================================
   SAVE PROGRAM
===================================================== */

programForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();

    hideProgramMessage();


    if (
      !memberCanEditProgram
    ) {

      showProgramMessage(
        "Kemaskini Program telah dikunci.",
        "error"
      );

      return;

    }


    const kategoriProgram =
      document.querySelector(
        'input[name="kategoriProgram"]:checked'
      );


    const lokasiProgram =
      document.querySelector(
        'input[name="lokasiProgram"]:checked'
      );


    if (
      !kategoriProgram ||
      !lokasiProgram
    ) {

      showProgramMessage(
        "Sila lengkapkan kategori dan lokasi Program.",
        "error"
      );

      return;

    }


    /* =================================================
       SEMAK SIJIL
    ================================================= */

    const certificateCheck =
      validateProgramCertificate();


    if (
      !certificateCheck.valid
    ) {

      showProgramMessage(
        certificateCheck.message,
        "error"
      );

      return;

    }

    /* =================================================
   REKOD ADMIN
   SIJIL SAHAJA
================================================= */

if (
  editingProgram &&
  editingProgram.certificateOnly === true
) {

  if (
    !certificateCheck.file
  ) {

    showProgramMessage(
      "Sila pilih fail sijil PDF.",
      "error"
    );

    return;

  }


  const originalText =
    saveProgramButton.textContent;


  saveProgramButton.disabled =
    true;

  saveProgramButton.textContent =
    "Memuat naik sijil...";


  try {

    const base64Data =
      await fileToBase64(
        certificateCheck.file
      );


    const certificateResult =
      await apiPost({

        action:
          "program_upload_certificate",

        email:
          currentSession.googleEmail,

        memberCourseId:
          editingProgram.memberCourseId,

        courseId:
          editingProgram.courseId,

        fileName:
          certificateCheck.file.name,

        mimeType:
          certificateCheck.file.type ||
          "application/pdf",

        base64Data:
          base64Data

      });


    if (
      certificateResult.success !== true
    ) {

      throw new Error(
        certificateResult.message ||
        "Sijil gagal dimuat naik."
      );

    }


    showProgramMessage(
      "Sijil Program berjaya dikemas kini.",
      "success"
    );


    editingProgram =
      null;


    programForm.reset();


    programFormSection
      .classList
      .add(
        "hidden"
      );


    await loadPrograms();


    return;


  } catch (error) {

    console.error(
      "UPLOAD ADMIN PROGRAM CERTIFICATE ERROR:",
      error
    );


    showProgramMessage(
      error.message,
      "error"
    );


    return;


  } finally {

    saveProgramButton.disabled =
      false;

    saveProgramButton.textContent =
      originalText;

  }

}

    /* =================================================
       DATA PROGRAM
    ================================================= */

const programCourseSelect =
  document.getElementById(
    "programCourseSelect"
  );

const selectedCourseId =
  programCourseSelect
    ? String(
        programCourseSelect.value || ""
      ).trim()
    : "";

const data = {

  courseId:
    (
      selectedCourseId &&
      selectedCourseId !== "__NEW__"
    )
      ? selectedCourseId
      : "",

  kategoriProgram:
    kategoriProgram.value,

  lokasiProgram:
    lokasiProgram.value,

      perkara:
        document
          .getElementById(
            "programPerkara"
          )
          .value
          .trim(),

      tarikhMula:
        document
          .getElementById(
            "programTarikhMula"
          )
          .value,

      tarikhTamat:
        document
          .getElementById(
            "programTarikhTamat"
          )
          .value,

      tempat:
        document
          .getElementById(
            "programTempat"
          )
          .value
          .trim(),

      negeri:
        document
          .getElementById(
            "programNegeri"
          )
          .value,

      negara:
        document
          .getElementById(
            "programNegara"
          )
          .value
          .trim(),

      peranan:
        document
          .getElementById(
            "programPeranan"
          )
          .value,

      penganjur:
        document
          .getElementById(
            "programPenganjur"
          )
          .value,

      penganjurLain:
        document
          .getElementById(
            "programPenganjurLain"
          )
          .value
          .trim()

    };


    const originalText =
      saveProgramButton
        .textContent;


    saveProgramButton.disabled =
      true;

    saveProgramButton.textContent =
      "Menyimpan...";


    try {

      /* =================================================
         1. SIMPAN PROGRAM
      ================================================= */

      let result;


if (editingProgram) {

  result =
    await apiPost({

      action:
        "program_update_history",

      email:
        currentSession.googleEmail,

      memberCourseId:
        editingProgram.memberCourseId,

      courseId:
        editingProgram.courseId,

      data:
        data

    });

} else {

  result =
    await apiPost({

      action:
        "program_add_history",

      email:
        currentSession.googleEmail,

      data:
        data

    });

}

      if (
        result.success !== true
      ) {

        throw new Error(
          result.message ||
          "Program tidak berjaya disimpan."
        );

      }


    /* =================================================
   2. UPLOAD / GANTI SIJIL JIKA ADA
================================================= */

if (
  certificateCheck.file
) {

  saveProgramButton.textContent =
    "Memuat naik sijil...";


  const base64Data =
    await fileToBase64(
      certificateCheck.file
    );


  /*
   * CREATE:
   * ID datang daripada result program_add_history
   *
   * EDIT:
   * ID menggunakan rekod yang sedang diedit
   */

  const targetMemberCourseId =
    editingProgram
      ? editingProgram.memberCourseId
      : result.memberCourseId;


  const targetCourseId =
    editingProgram
      ? editingProgram.courseId
      : result.courseId;


  const certificateResult =
    await apiPost({

      action:
        "program_upload_certificate",

      email:
        currentSession.googleEmail,

      memberCourseId:
        targetMemberCourseId,

      courseId:
        targetCourseId,

      fileName:
        certificateCheck.file.name,

      mimeType:
        certificateCheck.file.type ||
        "application/pdf",

      base64Data:
        base64Data

    });


  if (
    certificateResult.success !== true
  ) {

    throw new Error(
      "Maklumat Program telah disimpan, tetapi sijil gagal dimuat naik: " +
      (
        certificateResult.message ||
        ""
      )
    );

  }

}


      /* =================================================
         3. SUCCESS
      ================================================= */

      showProgramMessage(
        certificateCheck.file
          ? "Program dan sijil berjaya disimpan."
          : (
              result.message ||
              "Program berjaya ditambah."
            ),
        "success"
      );
editingProgram = null;

if (programCertificate) {
  programCertificate.disabled = false;
}

setProgramMasterFieldsLocked(false);

const courseSelect =
  document.getElementById(
    "programCourseSelect"
  );

if (courseSelect) {
  courseSelect.value = "";
}

const newProgramField =
  document.getElementById(
    "newProgramNameField"
  );

if (newProgramField) {
  newProgramField
    .classList
    .add("hidden");
}




const formTitle =
  programFormSection
    .querySelector(
      ".program-form-header h2"
    );

if (formTitle) {
  formTitle.textContent =
    "Tambah Program";
}

      programForm.reset();

      resetConditionalFields();


      otherOrganizerField
        .classList
        .add("hidden");


      programFormSection
        .classList
        .add("hidden");


      await loadPrograms();


    } catch (error) {

      console.error(error);


      showProgramMessage(
        error.message,
        "error"
      );


    } finally {

      saveProgramButton.disabled =
        false;

      saveProgramButton.textContent =
        originalText;

    }

  }
);
/* =====================================================
   SENARAI NEGARA
===================================================== */

const PASPA_COUNTRY_CODES = [
  "AF","AL","DZ","AD","AO","AG","AR","AM","AU","AT","AZ",
  "BS","BH","BD","BB","BY","BE","BZ","BJ","BT","BO","BA",
  "BW","BR","BN","BG","BF","BI","CV","KH","CM","CA","CF",
  "TD","CL","CN","CO","KM","CG","CD","CR","CI","HR","CU",
  "CY","CZ","DK","DJ","DM","DO","EC","EG","SV","GQ","ER",
  "EE","SZ","ET","FJ","FI","FR","GA","GM","GE","DE","GH",
  "GR","GD","GT","GN","GW","GY","HT","HN","HU","IN","IS",
  "ID","IR","IQ","IE","IT","JM","JP","JO","KZ","KE",
  "KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY",
  "LI","LT","LU","MG","MW","MY","MV","ML","MT","MH","MR",
  "MU","MX","FM","MD","MC","MN","ME","MA","MZ","MM","NA",
  "NR","NP","NL","NZ","NI","NE","NG","MK","NO","OM","PK",
  "PW","PS","PA","PG","PY","PE","PH","PL","PT","QA","RO",
  "RU","RW","KN","LC","VC","WS","SM","ST","SA","SN","RS",
  "SC","SL","SG","SK","SI","SB","SO","ZA","SS","ES","LK",
  "SD","SR","SE","CH","SY","TJ","TZ","TH","TL","TG","TO",
  "TT","TN","TR","TM","TV","UG","UA","AE","GB","US","UY",
  "UZ","VU","VA","VE","VN","YE","ZM","ZW"
];


function loadCountryDropdown() {

  const select =
    document.getElementById(
      "programNegara"
    );

  if (!select) {
    return;
  }


  const displayNames =
    new Intl.DisplayNames(
      ["ms"],
      {
        type: "region"
      }
    );


  const countries =
    PASPA_COUNTRY_CODES
      .map(function (code) {

        return {
          code: code,
          name:
            displayNames.of(code) ||
            code
        };

      })
      .sort(function (a, b) {

        return a.name.localeCompare(
          b.name,
          "ms"
        );

      });


  countries.forEach(
    function (country) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        country.name;

      option.textContent =
        country.name;

      select.appendChild(
        option
      );

    }
  );

}


/* =====================================================
   START
===================================================== */

async function initProgramPage() {

  renderMemberHeader();

  hideProgramMessage();

  loadCountryDropdown();

  await loadProgramEditAccess();

  await loadPrograms();

}


initProgramPage();

/* =====================================================
   PDF CERTIFICATE
===================================================== */

const programCertificate =
  document.getElementById(
    "programCertificate"
  );


function validateProgramCertificate() {

  const file =
    programCertificate.files[0];


  // Sijil tidak wajib
  if (!file) {

    return {
      valid: true,
      file: null
    };

  }


  const isPdf =
    file.type ===
      "application/pdf" ||
    file.name
      .toLowerCase()
      .endsWith(".pdf");


  if (!isPdf) {

    return {
      valid: false,
      message:
        "Sijil mesti dalam format PDF."
    };

  }


  const maxSize =
    5 * 1024 * 1024;


  if (file.size > maxSize) {

    return {
      valid: false,
      message:
        "Saiz sijil maksimum ialah 5 MB."
    };

  }


  return {
    valid: true,
    file: file
  };

}


function fileToBase64(file) {

  return new Promise(
    function (resolve, reject) {

      const reader =
        new FileReader();


      reader.onload =
        function () {

          const result =
            String(
              reader.result || ""
            );

          const base64 =
            result.includes(",")
              ? result.split(",")[1]
              : result;

          resolve(base64);

        };


      reader.onerror =
        function () {

          reject(
            new Error(
              "Fail PDF tidak dapat dibaca."
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =====================================================
   LOAD MASTER PROGRAM
   Sumber: 04_COURSES
===================================================== */

let programMasterList = [];


async function loadProgramMasterList() {

  try {

    const email =
  String(
    currentSession.googleEmail || ""
  ).trim();


if (!email) {

  console.warn(
    "PROGRAM MASTER: Email tidak dijumpai."
  );

  return;
}


    const result =
  await apiPost({

    action:
      "program_master_list",

    email:
      email

  });


    console.log(
      "PROGRAM MASTER RESULT:",
      result
    );


    if (
      !result ||
      result.success !== true
    ) {

      console.warn(
        "PROGRAM MASTER:",
        result
      );

      return;
    }


    programMasterList =
      Array.isArray(result.programs)
        ? result.programs
        : [];


    populateProgramCourseSelect();
    renderProgramCustomDropdown();


  } catch (error) {

    console.error(
      "LOAD PROGRAM MASTER ERROR:",
      error
    );

  }

}


/* =====================================================
   CONVERT TARIKH PROGRAM UNTUK SORTING
===================================================== */

function getProgramDateTimestamp(value) {

  if (!value) {
    return 0;
  }


  /* =========================================
     JIKA GOOGLE APPS SCRIPT HANTAR DATE/ISO
  ========================================= */

  const normalDate =
    new Date(value);

  if (
    !isNaN(
      normalDate.getTime()
    )
  ) {

    return normalDate.getTime();

  }


  /* =========================================
     FORMAT dd/MM/yyyy
  ========================================= */

  const text =
    String(value).trim();


  const match =
    text.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );


  if (match) {

    const day =
      Number(match[1]);

    const month =
      Number(match[2]) - 1;

    const year =
      Number(match[3]);


    return new Date(
      year,
      month,
      day
    ).getTime();

  }


  /* TARIKH TAK DAPAT DIBACA */

  return 0;

}

/* =====================================================
   ISI DROPDOWN PROGRAM
===================================================== */

function populateProgramCourseSelect() {

  const select =
    document.getElementById(
      "programCourseSelect"
    );


  if (!select) {
    return;
  }


  select.innerHTML = "";


  /* PILIHAN DEFAULT */

  const defaultOption =
    document.createElement("option");

  defaultOption.value = "";

  defaultOption.textContent =
    "Sila pilih program";

  select.appendChild(
    defaultOption
  );


  /* PROGRAM DARIPADA 04_COURSES */
/* =====================================================
   BUANG DUPLICATE UNTUK PAPARAN DROPDOWN SAHAJA

   Duplicate ditentukan berdasarkan:
   NAMA PROGRAM + TARIKH MULA + TARIKH TAMAT

   Database 04_COURSES TIDAK DIUBAH.
===================================================== */
/* =====================================================
   GABUNG PROGRAM BERDASARKAN TARIKH

   Jika TARIKH MULA + TARIKH TAMAT sama:
   dianggap program yang sama.

   Jika terdapat beberapa nama:
   pilih nama program yang PALING PANJANG.

   Ini hanya untuk paparan dropdown.
   Database tidak diubah.
===================================================== */

const uniqueProgramMap =
  new Map();


programMasterList.forEach(
  function (program) {

    const tarikhMula =
      formatProgramMasterDate(
        program.tarikhMula
      );

    const tarikhTamat =
      formatProgramMasterDate(
        program.tarikhTamat
      );


    /*
     * Tarikh menjadi kunci utama.
     */
    const duplicateKey =
      tarikhMula +
      "|" +
      tarikhTamat;


    const existingProgram =
      uniqueProgramMap.get(
        duplicateKey
      );


    /*
     * Belum ada program pada
     * tarikh tersebut.
     */
    if (!existingProgram) {

      uniqueProgramMap.set(
        duplicateKey,
        program
      );

      return;

    }


    /*
     * Sudah ada program dengan
     * tarikh sama.
     *
     * Bandingkan nama dan pilih
     * nama yang lebih panjang.
     */
    const existingName =
      String(
        existingProgram.perkara || ""
      ).trim();


    const newName =
      String(
        program.perkara || ""
      ).trim();


    if (
      newName.length >
      existingName.length
    ) {

      uniqueProgramMap.set(
        duplicateKey,
        program
      );

    }

  }
);








/*
 * Tukar semula kepada array
 * kemudian susun program terbaru dahulu.
 */
const sortedPrograms =
  Array.from(
    uniqueProgramMap.values()
  ).sort(
    function (a, b) {

      const dateA =
        getProgramDateTimestamp(
          a.tarikhMula
        );

      const dateB =
        getProgramDateTimestamp(
          b.tarikhMula
        );

      return dateB - dateA;

    }
  );


sortedPrograms.forEach(










    function (program) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        program.courseId;


      let label =
        String(
          program.perkara || ""
        ).trim();


      const tarikhMula =
        formatProgramMasterDate(
          program.tarikhMula
        );


      const tarikhTamat =
        formatProgramMasterDate(
          program.tarikhTamat
        );


      if (
        tarikhMula &&
        tarikhTamat
      ) {

        label +=
          " — " +
          tarikhMula +
          " hingga " +
          tarikhTamat;

      } else if (tarikhMula) {

        label +=
          " — " +
          tarikhMula;

      }


      option.textContent =
        label;


      select.appendChild(
        option
      );

    }
  );


  /* PILIHAN CIPTA PROGRAM BARU */

  const newOption =
    document.createElement(
      "option"
    );

  newOption.value =
    "__NEW__";

  newOption.textContent =
    "＋ TIADA DALAM SENARAI. CIPTA NAMA PROGRAM";


  select.appendChild(
    newOption
  );

}

/* =====================================================
   CUSTOM DROPDOWN PROGRAM
===================================================== */

function renderProgramCustomDropdown() {

  const list =
    document.getElementById(
      "programCourseDropdownList"
    );

  const select =
    document.getElementById(
      "programCourseSelect"
    );

  const selectedText =
    document.getElementById(
      "programCourseSelectedText"
    );


  if (
    !list ||
    !select ||
    !selectedText
  ) {
    return;
  }


  list.innerHTML = "";


  /* =========================================
     SUSUN PROGRAM IKUT TARIKH TERBARU
  ========================================= */

  /* =========================================
   GABUNG PROGRAM BERTINDIH
   + TAJUK YANG SERUPA
========================================= */


/* Ambil perkataan penting daripada tajuk */
function getImportantWords(title) {

  return String(title || "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(
      function (word) {

        return (
          word.length >= 3 &&
          ![
            "DAN",
            "DENGAN",
            "UNTUK",
            "PADA",
            "DALAM",
            "BERSAMA",
            "KURSUS",
            "LATIHAN",
            "PROGRAM"
          ].includes(word)
        );

      }
    );

}


function isSimilarTitle(
  titleA,
  titleB
) {

  const cleanA =
    String(titleA || "")
      .toUpperCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\u00A0/g, " ")
      .replace(/[^A-Z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();


  const cleanB =
    String(titleB || "")
      .toUpperCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\u00A0/g, " ")
      .replace(/[^A-Z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();


  if (
    !cleanA ||
    !cleanB
  ) {
    return false;
  }


  /*
   * 1. Tajuk sama tepat
   */
  if (cleanA === cleanB) {
    return true;
  }


  /*
   * 2. Salah satu tajuk terkandung
   * sepenuhnya dalam tajuk yang lain.
   *
   * Contoh:
   * SWIFT WATER RESCUE
   * LATIHAN SWIFT WATER RESCUE BERSAMA BASARNAS
   */
  if (
    cleanA.includes(cleanB) ||
    cleanB.includes(cleanA)
  ) {
    return true;
  }


  /*
   * 3. Semak perkataan penting.
   */
  const wordsA =
    getImportantWords(cleanA);

  const wordsB =
    getImportantWords(cleanB);


  if (
    !wordsA.length ||
    !wordsB.length
  ) {
    return false;
  }


  const commonWords =
    wordsA.filter(
      function (word) {

        return wordsB.includes(word);

      }
    );


  /*
   * Mesti ada sekurang-kurangnya
   * 3 perkataan penting yang sama.
   *
   * Ini mengelakkan:
   *
   * PROGRAM UJIAN B
   * PROGRAM UJIAN C
   *
   * daripada digabungkan.
   */
  if (commonWords.length < 3) {
    return false;
  }


  const shorterLength =
    Math.min(
      wordsA.length,
      wordsB.length
    );


  return (
    commonWords.length /
    shorterLength
  ) >= 0.75;

}


/* Tukar tarikh kepada timestamp */
function getDropdownDate(value) {

  if (!value) {
    return null;
  }


  const formatted =
    formatProgramMasterDate(
      value
    );


  const match =
    formatted.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );


  if (!match) {
    return null;
  }


  return new Date(
    Number(match[3]),
    Number(match[2]) - 1,
    Number(match[1])
  );

}


/* Semak dua julat tarikh bertindih */
function datesOverlap(
  programA,
  programB
) {

  const startA =
    getDropdownDate(
      programA.tarikhMula
    );

  const endA =
    getDropdownDate(
      programA.tarikhTamat ||
      programA.tarikhMula
    );

  const startB =
    getDropdownDate(
      programB.tarikhMula
    );

  const endB =
    getDropdownDate(
      programB.tarikhTamat ||
      programB.tarikhMula
    );


  if (
    !startA ||
    !endA ||
    !startB ||
    !endB
  ) {
    return false;
  }


  return (
    startA <= endB &&
    startB <= endA
  );

}


/* =========================================
   BINA GROUP PROGRAM
========================================= */

const groupedPrograms = [];


programMasterList.forEach(
  function (program) {

    let matchedProgram =
      null;


    for (
      let i = 0;
      i < groupedPrograms.length;
      i++
    ) {

      const existing =
        groupedPrograms[i];


      if (
        datesOverlap(
          existing,
          program
        ) &&
        isSimilarTitle(
          existing.perkara,
          program.perkara
        )
      ) {

        matchedProgram =
          existing;

        break;

      }

    }


    /* Tiada program serupa */
    if (!matchedProgram) {

      groupedPrograms.push({
        ...program
      });

      return;

    }


    /* =====================================
       PILIH TAJUK PALING PANJANG
    ===================================== */

    const currentTitle =
      String(
        matchedProgram.perkara || ""
      ).trim();


    const newTitle =
      String(
        program.perkara || ""
      ).trim();


    if (
      newTitle.length >
      currentTitle.length
    ) {

      matchedProgram.perkara =
        newTitle;

    }


    /* =====================================
       AMBIL TARIKH MULA PALING AWAL
    ===================================== */

    const currentStart =
      getDropdownDate(
        matchedProgram.tarikhMula
      );

    const newStart =
      getDropdownDate(
        program.tarikhMula
      );


    if (
      newStart &&
      (
        !currentStart ||
        newStart < currentStart
      )
    ) {

      matchedProgram.tarikhMula =
        program.tarikhMula;

    }


    /* =====================================
       AMBIL TARIKH TAMAT PALING AKHIR
    ===================================== */

    const currentEnd =
      getDropdownDate(
        matchedProgram.tarikhTamat ||
        matchedProgram.tarikhMula
      );

    const newEnd =
      getDropdownDate(
        program.tarikhTamat ||
        program.tarikhMula
      );


    if (
      newEnd &&
      (
        !currentEnd ||
        newEnd > currentEnd
      )
    ) {

      matchedProgram.tarikhTamat =
        program.tarikhTamat ||
        program.tarikhMula;

    }

  }
);


/* =========================================
   SUSUN PROGRAM
   TARIKH PALING BARU DI ATAS
========================================= */

const sortedPrograms =
  groupedPrograms.sort(
    function (a, b) {

      const dateA =
        getDropdownDate(
          a.tarikhMula
        );

      const dateB =
        getDropdownDate(
          b.tarikhMula
        );


      const timeA =
        dateA
          ? dateA.getTime()
          : 0;

      const timeB =
        dateB
          ? dateB.getTime()
          : 0;


      /*
       * Tarikh mula paling baru
       * berada paling atas.
       */
      if (timeB !== timeA) {

        return timeB - timeA;

      }


      /*
       * Jika tarikh mula sama,
       * susun ikut tarikh tamat
       * paling baru.
       */
      const endA =
        getDropdownDate(
          a.tarikhTamat ||
          a.tarikhMula
        );

      const endB =
        getDropdownDate(
          b.tarikhTamat ||
          b.tarikhMula
        );


      const endTimeA =
        endA
          ? endA.getTime()
          : 0;

      const endTimeB =
        endB
          ? endB.getTime()
          : 0;


      if (endTimeB !== endTimeA) {

        return endTimeB - endTimeA;

      }


      /*
       * Jika kedua-dua tarikh sama,
       * susun nama A-Z.
       */
      return String(
        a.perkara || ""
      ).localeCompare(
        String(
          b.perkara || ""
        ),
        "ms"
      );

    }
  );


  /* =========================================
     SENARAI PROGRAM
  ========================================= */

  sortedPrograms.forEach(
    function (program) {

      const item =
        document.createElement(
          "button"
        );

      item.type = "button";

      item.className =
        "program-dropdown-item";


      const name =
        String(
          program.perkara || ""
        )
          .trim()
          .toUpperCase();


      const tarikhMula =
        formatProgramMasterDate(
          program.tarikhMula
        );

      const tarikhTamat =
        formatProgramMasterDate(
          program.tarikhTamat
        );


      let dateText = "";

      if (
        tarikhMula &&
        tarikhTamat
      ) {

        dateText =
          tarikhMula +
          " hingga " +
          tarikhTamat;

      } else if (tarikhMula) {

        dateText =
          tarikhMula;

      }


      item.innerHTML =
        '<span class="program-dropdown-name">' +
        name +
        '</span>' +
        (
          dateText
            ? ' <span class="program-dropdown-date"> — ' +
              dateText +
              '</span>'
            : ""
        );


      item.addEventListener(
        "click",
        function () {

          select.value =
            String(
              program.courseId || ""
            );


          /*
           * Trigger change asal.
           * Semua logic lama program.js
           * masih digunakan.
           */

          select.dispatchEvent(
            new Event(
              "change",
              {
                bubbles: true
              }
            )
          );


          selectedText.innerHTML =
            '<span class="program-dropdown-name">' +
            name +
            '</span>';


          list.classList.add(
            "hidden"
          );

        }
      );


      list.appendChild(
        item
      );

    }
  );


  /* =========================================
     PILIHAN CIPTA PROGRAM BARU
  ========================================= */

  const newItem =
    document.createElement(
      "button"
    );

  newItem.type = "button";

  newItem.className =
    "program-dropdown-item program-dropdown-new";

  newItem.textContent =
    "＋ TIADA DALAM SENARAI. CIPTA NAMA PROGRAM";


  newItem.addEventListener(
    "click",
    function () {

      select.value =
        "__NEW__";


      select.dispatchEvent(
        new Event(
          "change",
          {
            bubbles: true
          }
        )
      );


      selectedText.textContent =
        "＋ TIADA DALAM SENARAI. CIPTA NAMA PROGRAM";


      list.classList.add(
        "hidden"
      );

    }
  );


  list.appendChild(
    newItem
  );

}
/* =====================================================
   FORMAT TARIKH DROPDOWN
===================================================== */

function formatProgramMasterDate(value) {

  if (!value) {
    return "";
  }


  const text =
    String(value).trim();


  /* =========================================
     FORMAT yyyy-MM-dd
  ========================================= */

  let match =
    text.match(
      /^(\d{4})-(\d{1,2})-(\d{1,2})/
    );

  if (match) {

    const year =
      match[1];

    const month =
      String(match[2])
        .padStart(2, "0");

    const day =
      String(match[3])
        .padStart(2, "0");


    return (
      day +
      "/" +
      month +
      "/" +
      year
    );

  }


  /* =========================================
     FORMAT dd/MM/yyyy
     Jika sudah betul, kekalkan
  ========================================= */

  match =
    text.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );

  if (match) {

    const day =
      String(match[1])
        .padStart(2, "0");

    const month =
      String(match[2])
        .padStart(2, "0");

    const year =
      match[3];


    return (
      day +
      "/" +
      month +
      "/" +
      year
    );

  }


  /* =========================================
     GOOGLE SHEETS / APPS SCRIPT DATE
  ========================================= */

  const date =
    new Date(value);


  if (
    !isNaN(
      date.getTime()
    )
  ) {

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const year =
      date.getFullYear();


    return (
      day +
      "/" +
      month +
      "/" +
      year
    );

  }


  return text;

}

function initializeProgramCourseSelect() {

  const courseSelect =
    document.getElementById(
      "programCourseSelect"
    );

  const newProgramField =
    document.getElementById(
      "newProgramNameField"
    );

  const programPerkara =
    document.getElementById(
      "programPerkara"
    );


  if (
    !courseSelect ||
    !newProgramField ||
    !programPerkara
  ) {
    return;
  }

/*
 * Apabila pengguna buka dropdown,
 * pulangkan paparan Nama + Tarikh
 * untuk semua program.
 */
courseSelect.addEventListener(
  "mousedown",
  function () {

    Array.from(
      courseSelect.options
    ).forEach(
      function (option) {

        const courseId =
          String(
            option.value || ""
          ).trim();

        if (
          !courseId ||
          courseId === "__NEW__"
        ) {
          return;
        }

        const program =
          programMasterList.find(
            function (item) {

              return (
                String(
                  item.courseId || ""
                ).trim() ===
                courseId
              );

            }
          );

        if (!program) {
          return;
        }

        let label =
          String(
            program.perkara || ""
          ).trim();

        const tarikhMula =
          formatProgramMasterDate(
            program.tarikhMula
          );

        const tarikhTamat =
          formatProgramMasterDate(
            program.tarikhTamat
          );

        if (
          tarikhMula &&
          tarikhTamat
        ) {

          label +=
            " — " +
            tarikhMula +
            " hingga " +
            tarikhTamat;

        } else if (tarikhMula) {

          label +=
            " — " +
            tarikhMula;

        }

        option.textContent =
          label;

      }
    );

  }
);




  courseSelect.addEventListener(
    "change",
    function () {

      hideProgramMessage();


      const selectedValue =
        String(
          courseSelect.value || ""
        ).trim();


      /* =================================================
         1. TIADA PILIHAN
      ================================================= */

      if (!selectedValue) {

        newProgramField
          .classList
          .add("hidden");

        programPerkara.value = "";

        programPerkara.required = false;

        clearProgramMasterFields();

        setProgramMasterFieldsLocked(
          false
        );

        return;
      }


      /* =================================================
         2. CIPTA PROGRAM BAHARU
      ================================================= */

      if (
        selectedValue === "__NEW__"
      ) {

        newProgramField
          .classList
          .remove("hidden");


        /*
         * Program baharu:
         * kosongkan semua maklumat master.
         */

        clearProgramMasterFields();


        /*
         * Semua field boleh diisi.
         */

        setProgramMasterFieldsLocked(
          false
        );


        programPerkara.value = "";

        programPerkara.required = true;

        programPerkara.focus();

        return;
      }


      /* =================================================
         3. PROGRAM SEDIA ADA
      ================================================= */

      const selectedProgram =
        programMasterList.find(
          function (program) {

            return (
              String(
                program.courseId || ""
              ).trim() ===
              selectedValue
            );

          }
        );


      if (!selectedProgram) {

        showProgramMessage(
          "Maklumat Program tidak dapat dijumpai.",
          "error"
        );

        return;
      }


      /*
       * Sembunyikan input nama program baharu.
       */

      newProgramField
        .classList
        .add("hidden");


      /*
       * Simpan nama program ke programPerkara.
       */

      programPerkara.value =
        selectedProgram.perkara || "";

      programPerkara.required =
        false;

/*
 * Selepas program dipilih,
 * paparkan nama program sahaja
 * dalam kotak dropdown.
 * Tarikh masih kekal dalam senarai
 * apabila dropdown dibuka semula.
 */
const selectedOption =
  courseSelect.options[
    courseSelect.selectedIndex
  ];

if (selectedOption) {

  selectedOption.textContent =
    String(
      selectedProgram.perkara || ""
    ).trim();

}
      /*
       * Auto-fill maklumat daripada
       * 04_COURSES.
       */

      fillProgramMasterFields(
        selectedProgram
      );


      /*
       * Maklumat master tidak boleh
       * diubah oleh ahli.
       *
       * Ahli hanya memilih PERANAN
       * dan SIJIL untuk penyertaan dirinya.
       */

      setProgramMasterFieldsLocked(
        true
      );


      console.log(
        "PROGRAM MASTER DIPILIH:",
        {
          courseId:
            selectedProgram.courseId,

          perkara:
            selectedProgram.perkara,

          tarikhMula:
            selectedProgram.tarikhMula,

          tarikhTamat:
            selectedProgram.tarikhTamat
        }
      );

    }
  );

}

/* =====================================================
   LOCK / UNLOCK PROGRAM MASTER FIELDS

   Program sedia ada:
   data daripada 04_COURSES tidak boleh diubah.

   Program baharu:
   semua field boleh diisi.
===================================================== */

function setProgramMasterFieldsLocked(
  locked
) {

  /*
   * KATEGORI PROGRAM
   */

  document
    .querySelectorAll(
      'input[name="kategoriProgram"]'
    )
    .forEach(
      function (input) {

        input.disabled =
          locked;

      }
    );


  /*
   * LOKASI PROGRAM
   */

  document
    .querySelectorAll(
      'input[name="lokasiProgram"]'
    )
    .forEach(
      function (input) {

        input.disabled =
          locked;

      }
    );


  /*
   * FIELD MASTER
   */

  const fieldIds = [

    "programPerkara",

    "programTarikhMula",

    "programTarikhTamat",

    "programTempat",

    "programNegeri",

    "programNegara",

    "programPenganjur",

    "programPenganjurLain"

  ];


  fieldIds.forEach(
    function (id) {

      const field =
        document.getElementById(id);


      if (field) {

        field.disabled =
          locked;

      }

    }
  );


  /*
   * PENTING:
   *
   * programPeranan TIDAK dikunci.
   * programCertificate TIDAK dikunci.
   *
   * Kedua-duanya ialah maklumat
   * penyertaan ahli dalam
   * 05_MEMBER_COURSES.
   */

}



/* =====================================================
   AUTO FILL MAKLUMAT PROGRAM MASTER
===================================================== */

function fillProgramMasterFields(program) {

console.log(
  "SELECTED PROGRAM MASTER:",
  program
);

console.log(
  "TARIKH MASTER:",
  {
    tarikhMula: program.tarikhMula,
    tarikhTamat: program.tarikhTamat
  }
);


console.log(
  "LOKASI MASTER:",
  {
    lokasiProgram: program.lokasiProgram,
    negeri: program.negeri,
    negara: program.negara
  }
);

  const tarikhMula =
    document.getElementById(
      "programTarikhMula"
    );

  const tarikhTamat =
    document.getElementById(
      "programTarikhTamat"
    );

  const tempat =
    document.getElementById(
      "programTempat"
    );


/* =====================================================
   AUTO SELECT LOKASI PROGRAM
===================================================== */

const lokasiValue =
  String(
    program.lokasiProgram || ""
  ).trim();


const lokasiRadio =
  document.querySelector(
    'input[name="lokasiProgram"][value="' +
    lokasiValue +
    '"]'
  );


if (lokasiRadio) {

  lokasiRadio.checked = true;

}


/* =====================================================
   AUTO SELECT KATEGORI PROGRAM
===================================================== */

const kategoriValue =
  String(
    program.kategoriProgram || ""
  ).trim();


const kategoriRadio =
  document.querySelector(
    'input[name="kategoriProgram"][value="' +
    kategoriValue +
    '"]'
  );


if (kategoriRadio) {

  kategoriRadio.checked = true;

}


    /* =====================================================
   AUTO FILL NEGERI / NEGARA
===================================================== */
/* =====================================================
   AUTO FILL NEGERI / NEGARA
===================================================== */

const domesticFields =
  document.getElementById(
    "domesticProgramFields"
  );

const internationalFields =
  document.getElementById(
    "internationalProgramFields"
  );

const negeri =
  document.getElementById(
    "programNegeri"
  );

const negara =
  document.getElementById(
    "programNegara"
  );


/* =========================================
   DALAM NEGARA
========================================= */

if (
  String(program.lokasiProgram || "")
    .trim()
    .toLowerCase() ===
  "dalam negara"
) {

  /* Paparkan field Negeri */

  if (domesticFields) {

    domesticFields
      .classList
      .remove("hidden");

  }


  /* Sembunyikan field Negara */

  if (internationalFields) {

    internationalFields
      .classList
      .add("hidden");

  }


  /* Pilih Negeri */

  if (negeri) {

    negeri.value =
      String(
        program.negeri || ""
      ).trim();

  }


  /* Kosongkan Negara */

  if (negara) {

    negara.value = "";

  }

}


/* =========================================
   LUAR NEGARA
========================================= */

else if (
  String(program.lokasiProgram || "")
    .trim()
    .toLowerCase() ===
  "luar negara"
) {

  /* Sembunyikan field Negeri */

  if (domesticFields) {

    domesticFields
      .classList
      .add("hidden");

  }


  /* Paparkan field Negara */

  if (internationalFields) {

    internationalFields
      .classList
      .remove("hidden");

  }


  /* Kosongkan Negeri */

  if (negeri) {

    negeri.value = "";

  }


  /* =====================================
     Pastikan Negara wujud dalam dropdown
  ===================================== */

  if (
    negara &&
    program.negara
  ) {

    const countryValue =
      String(
        program.negara
      ).trim();


    const countryExists =
      Array.from(
        negara.options
      ).some(
        function (option) {

          return (
            String(option.value)
              .trim()
              .toLowerCase() ===
            countryValue
              .toLowerCase()
          );

        }
      );


    /*
     * Jika negara daripada rekod lama
     * belum ada dalam dropdown,
     * tambah secara automatik.
     */

    if (!countryExists) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        countryValue;

      option.textContent =
        countryValue;

      negara.appendChild(
        option
      );

    }


    negara.value =
      countryValue;

  }

}






  const penganjur =
    document.getElementById(
      "programPenganjur"
    );


  if (tarikhMula) {

    tarikhMula.value =
      convertProgramDateForInput(
        program.tarikhMula
      );

  }


  if (tarikhTamat) {

    tarikhTamat.value =
      convertProgramDateForInput(
        program.tarikhTamat
      );

  }


  if (tempat) {

    tempat.value =
      program.tempat || "";

  }


  if (penganjur) {

    penganjur.value =
      program.penganjur || "";

    /*
     * Trigger change sekiranya kod asal
     * mempunyai logic Penganjur Lain-lain.
     */

    penganjur.dispatchEvent(
      new Event(
        "change",
        {
          bubbles: true
        }
      )
    );

  }

}


/* =====================================================
   KOSONGKAN FIELD PROGRAM MASTER
===================================================== */
function clearProgramMasterFields() {

  /*
   * Nama Program
   */

  const perkara =
    document.getElementById(
      "programPerkara"
    );

  if (perkara) {
    perkara.value = "";
  }


  /*
   * Field text / select master
   */

  const fieldIds = [

    "programTarikhMula",

    "programTarikhTamat",

    "programTempat",

    "programNegeri",

    "programNegara",

    "programPenganjur",

    "programPenganjurLain"

  ];


  fieldIds.forEach(
    function (id) {

      const element =
        document.getElementById(id);

      if (element) {

        element.value = "";

      }

    }
  );


  /*
   * Reset Kategori
   */

  document
    .querySelectorAll(
      'input[name="kategoriProgram"]'
    )
    .forEach(
      function (input) {

        input.checked =
          false;

      }
    );


  /*
   * Reset Lokasi
   */

  document
    .querySelectorAll(
      'input[name="lokasiProgram"]'
    )
    .forEach(
      function (input) {

        input.checked =
          false;

      }
    );


  /*
   * Tutup Negeri / Negara
   */

  resetConditionalFields();


  /*
   * Tutup Penganjur Lain-lain
   */

  if (otherOrganizerField) {

    otherOrganizerField
      .classList
      .add("hidden");

  }

}

/* =====================================================
   TARIKH API -> INPUT type="date"
===================================================== */
function convertProgramDateForInput(value) {

  if (!value) {
    return "";
  }


  const text =
    String(value).trim();


  /* =====================================
     FORMAT dd/MM/yyyy
  ===================================== */

  let match =
    text.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );


  if (match) {

    const day =
      String(match[1])
        .padStart(2, "0");

    const month =
      String(match[2])
        .padStart(2, "0");

    const year =
      match[3];


    return (
      year +
      "-" +
      month +
      "-" +
      day
    );

  }


  /* =====================================
     FORMAT yyyy-MM-dd
     termasuk ISO yyyy-MM-ddT...
  ===================================== */

  match =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );


  if (match) {

    return (
      match[1] +
      "-" +
      match[2] +
      "-" +
      match[3]
    );

  }


  /* =====================================
     FORMAT DATE STRING GOOGLE SHEETS
  ===================================== */

  const date =
    new Date(text);


  if (
    !isNaN(
      date.getTime()
    )
  ) {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");


    return (
      year +
      "-" +
      month +
      "-" +
      day
    );

  }


  console.warn(
    "TARIKH TIDAK DAPAT DIBACA:",
    value
  );


  return "";

}


/* =====================================================
   PROGRAM - AUTO UPPERCASE INPUT
===================================================== */

function initializeProgramUppercaseInputs() {

  const programForm =
    document.getElementById(
      "programForm"
    );

  if (!programForm) {
    return;
  }

  programForm.addEventListener(
    "input",
    function (event) {

      const field =
        event.target;

      if (
        !field ||
        (
          field.tagName !== "INPUT" &&
          field.tagName !== "TEXTAREA"
        )
      ) {
        return;
      }

      /*
       * Jangan sentuh input yang bukan teks.
       */
      const ignoredTypes = [
        "file",
        "date",
        "radio",
        "checkbox",
        "hidden"
      ];

      if (
        ignoredTypes.includes(
          String(
            field.type || ""
          ).toLowerCase()
        )
      ) {
        return;
      }

      const start =
        field.selectionStart;

      const end =
        field.selectionEnd;

      field.value =
        String(
          field.value || ""
        ).toUpperCase();

      /*
       * Kekalkan kedudukan cursor.
       */
      if (
        start !== null &&
        end !== null
      ) {

        try {

          field.setSelectionRange(
            start,
            end
          );

        } catch (error) {
          // Abaikan field yang tidak menyokong selection.
        }

      }

    }
  );

}



/* =====================================================
   START PROGRAM MASTER SELECT
===================================================== */




document.addEventListener(
  "DOMContentLoaded",
  function () {

    initializeProgramUppercaseInputs();

    initializeProgramCourseSelect();

    loadProgramMasterList();

  }
);

/* =====================================================
   OPEN / CLOSE CUSTOM DROPDOWN PROGRAM
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const dropdown =
      document.getElementById(
        "programCourseDropdown"
      );

    const button =
      document.getElementById(
        "programCourseDropdownButton"
      );

    const list =
      document.getElementById(
        "programCourseDropdownList"
      );


    if (
      !dropdown ||
      !button ||
      !list
    ) {
      return;
    }


    /* BUKA / TUTUP DROPDOWN */
    button.addEventListener(
      "click",
      function (event) {

        event.stopPropagation();

        list.classList.toggle(
          "hidden"
        );

      }
    );


    /* TUTUP JIKA TEKAN DI LUAR */
    document.addEventListener(
      "click",
      function (event) {

        if (
          !dropdown.contains(
            event.target
          )
        ) {

          list.classList.add(
            "hidden"
          );

        }

      }
    );

  }
);