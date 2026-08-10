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
          "program_edit_access"

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
   RENDER PROGRAM
===================================================== */

function renderPrograms() {

  programList.innerHTML =
    "";


  const filtered =
    allPrograms.filter(
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
        createProgramCard(program)
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
            program.tarikhMula ||
            "-"
          )}
          hingga
          ${escapeHtml(
            program.tarikhTamat ||
            "-"
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

        action: "program_delete_history",

        email:
          currentSession.googleEmail,

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

    console.error(error);

    showProgramMessage(
      error.message,
      "error"
    );

  }

}

function formatProgramDateForInput(value) {

  const text =
    String(value || "").trim();

  const match =
    text.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

  if (!match) {
    return "";
  }

  return (
    match[3] +
    "-" +
    match[2] +
    "-" +
    match[1]
  );
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

  if (programCertificate) {
    programCertificate.disabled = true;
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
       DATA PROGRAM
    ================================================= */

    const data = {

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
         2. UPLOAD SIJIL JIKA ADA
      ================================================= */

      if (
  !editingProgram &&
  certificateCheck.file
) {

        saveProgramButton.textContent =
          "Memuat naik sijil...";


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
              result.memberCourseId,

            courseId:
              result.courseId,

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
            "Program telah disimpan, tetapi sijil gagal dimuat naik: " +
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

