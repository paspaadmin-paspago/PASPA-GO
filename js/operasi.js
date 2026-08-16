"use strict";


/* =====================================================
   ELEMENT
===================================================== */

const operasiBackButton =
  document.getElementById(
    "operasiBackButton"
  );

const operasiHomeButton =
  document.getElementById(
    "operasiHomeButton"
  );

const operasiMemberName =
  document.getElementById(
    "operasiMemberName"
  );

const operasiMemberId =
  document.getElementById(
    "operasiMemberId"
  );

const operasiList =
  document.getElementById(
    "operasiList"
  );

const addOperasiButton =
  document.getElementById(
    "addOperasiButton"
  );

const operasiFormSection =
  document.getElementById(
    "operasiFormSection"
  );

const operasiForm =
  document.getElementById(
    "operasiForm"
  );

const operasiFormTitle =
  document.getElementById(
    "operasiFormTitle"
  );

const closeOperasiFormButton =
  document.getElementById(
    "closeOperasiFormButton"
  );

const saveOperasiButton =
  document.getElementById(
    "saveOperasiButton"
  );

const operasiKategori =
  document.getElementById(
    "operasiKategori"
  );

const operasiPerkara =
  document.getElementById(
    "operasiPerkara"
  );

const operasiTarikhMula =
  document.getElementById(
    "operasiTarikhMula"
  );

const operasiTarikhTamat =
  document.getElementById(
    "operasiTarikhTamat"
  );

const operasiTempat =
  document.getElementById(
    "operasiTempat"
  );

const operasiNegeri =
  document.getElementById(
    "operasiNegeri"
  );

const operasiNegara =
  document.getElementById(
    "operasiNegara"
  );

const operasiNegeriGroup =
  document.getElementById(
    "operasiNegeriGroup"
  );

const operasiNegaraGroup =
  document.getElementById(
    "operasiNegaraGroup"
  );

const operasiCatatan =
  document.getElementById(
    "operasiCatatan"
  );

const operasiDocument =
  document.getElementById(
    "operasiDocument"
  );


const operasiExistingDocument =
  document.getElementById(
    "operasiExistingDocument"
  );

const operasiExistingDocumentLink =
  document.getElementById(
    "operasiExistingDocumentLink"
  );


const operasiYearFilters =
  document.getElementById(
    "operasiYearFilters"
  );

const operasiMessage =
  document.getElementById(
    "operasiMessage"
  );


/* =====================================================
   STATE
===================================================== */

let currentSession =
  null;

let allOperasiRecords =
  [];

let editingOperasi =
  null;

let activeLocationFilter =
  "semua";

let activeYearFilter =
  "semua";


/* =====================================================
   SESSION
===================================================== */

function getOperasiSession() {

  try {

    return JSON.parse(
      localStorage.getItem(
        "paspaGoSession"
      )
    );

  } catch (error) {

    console.error(
      "SESSION ERROR:",
      error
    );

    return null;

  }

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeOperasiHtml(
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

function showOperasiMessage(
  message,
  type = "info"
) {

  if (!operasiMessage) {
    return;
  }

  operasiMessage.textContent =
    message;

  operasiMessage.className =
    "message " + type;

}


function hideOperasiMessage() {

  if (!operasiMessage) {
    return;
  }

  operasiMessage.textContent =
    "";

  operasiMessage.className =
    "message hidden";

}


/* =====================================================
   TARIKH
===================================================== */

function formatOperasiDate(
  value
) {

  if (!value) {
    return "-";
  }


  const text =
    String(
      value
    ).trim();


  const isoMatch =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );


  if (isoMatch) {

    return (
      isoMatch[3] +
      "/" +
      isoMatch[2] +
      "/" +
      isoMatch[1]
    );

  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return text;

  }


  return String(
    date.getUTCDate()
  ).padStart(
    2,
    "0"
  ) +
    "/" +
    String(
      date.getUTCMonth() + 1
    ).padStart(
      2,
      "0"
    ) +
    "/" +
    date.getUTCFullYear();

}


function formatOperasiDateForInput(
  value
) {

  if (!value) {
    return "";
  }


  const text =
    String(
      value
    ).trim();


  const isoMatch =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );


  if (isoMatch) {

    return (
      isoMatch[1] +
      "-" +
      isoMatch[2] +
      "-" +
      isoMatch[3]
    );

  }


  const localMatch =
    text.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    );


  if (localMatch) {

    return (
      localMatch[3] +
      "-" +
      localMatch[2]
        .padStart(
          2,
          "0"
        ) +
      "-" +
      localMatch[1]
        .padStart(
          2,
          "0"
        )
    );

  }


  return "";

}


/* =====================================================
   COUNTRY LIST
===================================================== */

const OPERASI_COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua dan Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia dan Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei Darussalam",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Côte d'Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Korea Selatan",
  "Korea Utara",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestin",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts dan Nevis",
  "Saint Lucia",
  "Saint Vincent dan Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome dan Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad dan Tobago",
  "Tunisia",
  "Türkiye",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe"
];


/* =====================================================
   POPULATE NEGARA
===================================================== */

function populateOperasiCountries() {

  if (!operasiNegara) {
    return;
  }


  operasiNegara.innerHTML =
    `
      <option value="">
        Sila pilih negara
      </option>
    `;


  OPERASI_COUNTRIES
    .forEach(
      function (country) {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          country;

        option.textContent =
          country;


        operasiNegara.appendChild(
          option
        );

      }
    );

}


/* =====================================================
   LOKASI
===================================================== */

function getSelectedOperasiLocation() {

  const checked =
    document.querySelector(
      'input[name="lokasiOperasi"]:checked'
    );


  return checked
    ? checked.value
    : "";

}


function updateOperasiLocationFields() {

  const location =
    getSelectedOperasiLocation();


  const isDomestic =
    location ===
    "Dalam Negara";


  const isInternational =
    location ===
    "Luar Negara";


  if (operasiNegeriGroup) {

    operasiNegeriGroup
      .classList
      .toggle(
        "hidden",
        !isDomestic
      );

  }


  if (operasiNegaraGroup) {

    operasiNegaraGroup
      .classList
      .toggle(
        "hidden",
        !isInternational
      );

  }


  if (
    !isDomestic &&
    operasiNegeri
  ) {

    operasiNegeri.value =
      "";

  }


  if (
    !isInternational &&
    operasiNegara
  ) {

    operasiNegara.value =
      "";

  }

}


/* =====================================================
   PROFILE AHLI
===================================================== */

async function loadOperasiMember() {

  try {

    const result =
      await apiPost({

        action:
          "profile",

        email:
          currentSession.googleEmail

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Maklumat ahli tidak dapat dimuatkan."
      );

    }


    const profile =
      result.profile || {};


    if (operasiMemberName) {

      const rank =
        String(
          profile.pangkat || ""
        ).trim();


      const name =
        String(
          profile.namaPenuh ||
          currentSession.namaAhli ||
          "-"
        ).trim();


      operasiMemberName.textContent =
        (
          rank
            ? rank + " "
            : ""
        ) +
        name;

    }


    if (operasiMemberId) {

      operasiMemberId.textContent =
        profile.idPaspa ||
        currentSession.idPaspa ||
        "-";

    }


  } catch (error) {

    console.error(
      "LOAD OPERASI MEMBER ERROR:",
      error
    );


    if (operasiMemberName) {

      operasiMemberName.textContent =
        currentSession.namaAhli ||
        "-";

    }


    if (operasiMemberId) {

      operasiMemberId.textContent =
        currentSession.idPaspa ||
        "-";

    }

  }

}


/* =====================================================
   LOAD OPERASI
===================================================== */

async function loadOperasiRecords() {

  if (!operasiList) {
    return;
  }


  operasiList.innerHTML =
    `
      <p class="operasi-empty">
        Memuatkan rekod operasi...
      </p>
    `;


  try {

    const result =
      await apiPost({

        action:
          "operasi_list",

        email:
          currentSession.googleEmail

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Rekod operasi tidak dapat dimuatkan."
      );

    }


    allOperasiRecords =
      Array.isArray(
        result.operasi
      )
        ? result.operasi
        : [];


    buildOperasiYearFilters();

    renderOperasiRecords();


  } catch (error) {

    console.error(
      "LOAD OPERASI ERROR:",
      error
    );


    operasiList.innerHTML =
      `
        <p class="operasi-empty">
          ${escapeOperasiHtml(
            error.message ||
            "Rekod operasi gagal dimuatkan."
          )}
        </p>
      `;

  }

}


/* =====================================================
   FILTER TAHUN
===================================================== */

function getOperasiYear(
  record
) {

  const dateText =
    String(
      record.tarikhMula ||
      ""
    );


  const match =
    dateText.match(
      /(\d{4})/
    );


  return match
    ? match[1]
    : "";

}


function buildOperasiYearFilters() {

  if (!operasiYearFilters) {
    return;
  }


  const years =
    Array.from(
      new Set(
        allOperasiRecords
          .map(
            getOperasiYear
          )
          .filter(
            Boolean
          )
      )
    )
      .sort(
        function (a, b) {

          return (
            Number(b) -
            Number(a)
          );

        }
      );


  operasiYearFilters.innerHTML =
    "";


  const allButton =
    document.createElement(
      "button"
    );


  allButton.type =
    "button";

  allButton.className =
    "operasi-year-button " +
    (
      activeYearFilter ===
      "semua"
        ? "active"
        : ""
    );

  allButton.dataset.yearFilter =
    "semua";

  allButton.textContent =
    "Semua";


  operasiYearFilters.appendChild(
    allButton
  );


  years.forEach(
    function (year) {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";

      button.className =
        "operasi-year-button " +
        (
          activeYearFilter ===
          year
            ? "active"
            : ""
        );

      button.dataset.yearFilter =
        year;

      button.textContent =
        year;


      operasiYearFilters.appendChild(
        button
      );

    }
  );

}


/* =====================================================
   FILTER DATA
===================================================== */

function getFilteredOperasiRecords() {

  return allOperasiRecords
    .filter(
      function (record) {

        const recordLocation =
          String(
            record.lokasiOperasi ||
            ""
          )
            .trim()
            .toLowerCase();


        if (
          activeLocationFilter !==
          "semua" &&
          recordLocation !==
          activeLocationFilter
        ) {

          return false;

        }


        if (
          activeYearFilter !==
          "semua" &&
          getOperasiYear(
            record
          ) !==
          activeYearFilter
        ) {

          return false;

        }


        return true;

      }
    );

}


/* =====================================================
   RENDER OPERASI
===================================================== */

function renderOperasiRecords() {

  if (!operasiList) {
    return;
  }


  const records =
    getFilteredOperasiRecords();


  operasiList.innerHTML =
    "";


  if (!records.length) {

    operasiList.innerHTML =
      `
        <p class="operasi-empty">
          Tiada rekod Operasi ditemui.
        </p>
      `;

    return;

  }


  records.forEach(
    function (record) {

      operasiList.appendChild(
        createOperasiCard(
          record
        )
      );

    }
  );

}


/* =====================================================
   CARD OPERASI
===================================================== */

function createOperasiCard(
  record
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "operasi-item";


  const lokasi =
    String(
      record.lokasiOperasi ||
      ""
    );


  const negeriNegara =
    lokasi ===
      "Luar Negara"
      ? (
          record.negara ||
          "-"
        )
      : (
          record.negeri ||
          "-"
        );


  const sumberRekod =
    String(
      record.sumberRekod ||
      "Ahli"
    )
      .trim()
      .toLowerCase();


  card.innerHTML = `

    <div class="operasi-item-top">

      <div>

        <span class="operasi-item-type">

          ${escapeOperasiHtml(
            record.kategoriOperasi ||
            "Operasi"
          )}

        </span>


        <h3>

          ${escapeOperasiHtml(
            record.perkara ||
            "-"
          )}

        </h3>

      </div>


      <span class="operasi-location-badge">

        ${escapeOperasiHtml(
          lokasi ||
          "-"
        )}

      </span>

    </div>


    <div class="operasi-item-details">


      <div class="operasi-detail">

        Tarikh:

        <strong>

          ${escapeOperasiHtml(
            formatOperasiDate(
              record.tarikhMula
            )
          )}

          hingga

          ${escapeOperasiHtml(
            formatOperasiDate(
              record.tarikhTamat
            )
          )}

        </strong>

      </div>


      <div class="operasi-detail">

        Tempat:

        <strong>

          ${escapeOperasiHtml(
            record.tempat ||
            "-"
          )}

        </strong>

      </div>


      <div class="operasi-detail">

        Negeri / Negara:

        <strong>

          ${escapeOperasiHtml(
            negeriNegara
          )}

        </strong>

      </div>


      <div class="operasi-detail">

        Catatan:

        <strong>

          ${escapeOperasiHtml(
            record.catatan ||
            "-"
          )}

        </strong>

      </div>


      ${
        record.dokumenUrl
          ? `

              <div class="operasi-detail">

                Dokumen:

                <strong>

                  <a
                    href="${escapeOperasiHtml(
                      record.dokumenUrl
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="operasi-document-link"
                  >
                    📄 Lihat Dokumen
                  </a>

                </strong>

              </div>

            `
          : ""
      }

    </div>

  `;


  /* =================================================
     EDIT / BUANG
     Untuk rekod ahli sendiri sahaja.
     Future rekod arahan admin boleh dikunci.
  ================================================= */

  if (
    sumberRekod ===
    "ahli"
  ) {

    const actions =
      document.createElement(
        "div"
      );


    actions.className =
      "operasi-item-actions";


    const editButton =
      document.createElement(
        "button"
      );


    editButton.type =
      "button";

    editButton.className =
      "operasi-edit-button";

    editButton.textContent =
      "✏️";

    editButton.title =
      "Edit Operasi";


    editButton.addEventListener(
      "click",
      function () {

        openOperasiEditForm(
          record
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
      "operasi-delete-button";

    deleteButton.textContent =
      "🗑️";

    deleteButton.title =
      "Buang Operasi";


    deleteButton.addEventListener(
      "click",
      function () {

        deleteOperasiRecord(
          record
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


/* =====================================================
   RESET FORM
===================================================== */

function resetOperasiForm() {

  if (operasiForm) {

    operasiForm.reset();

  }


  editingOperasi =
    null;


  const domesticRadio =
    document.querySelector(
      'input[name="lokasiOperasi"][value="Dalam Negara"]'
    );


  if (domesticRadio) {

    domesticRadio.checked =
      true;

  }


  if (operasiDocument) {

    operasiDocument.value =
      "";

  }


  if (operasiFormTitle) {

    operasiFormTitle.textContent =
      "Tambah Operasi";

  }


  if (saveOperasiButton) {

    saveOperasiButton.textContent =
      "SIMPAN OPERASI";

  }


  updateOperasiLocationFields();


  if (operasiExistingDocument) {

  operasiExistingDocument
    .classList
    .add(
      "hidden"
    );

if (operasiExistingDocument) {

  operasiExistingDocument
    .classList
    .add(
      "hidden"
    );

}


if (operasiExistingDocumentLink) {

  operasiExistingDocumentLink.href =
    "#";

}



}


if (operasiExistingDocumentLink) {

  operasiExistingDocumentLink.href =
    "#";

}

}


/* =====================================================
   OPEN ADD
===================================================== */

function openAddOperasiForm() {

  resetOperasiForm();

  hideOperasiMessage();


  operasiFormSection
    .classList
    .remove(
      "hidden"
    );


  operasiFormSection
    .scrollIntoView({

      behavior:
        "smooth",

      block:
        "start"

    });

}


/* =====================================================
   OPEN EDIT
===================================================== */

function openOperasiEditForm(
  record
) {

  editingOperasi =
    {
      ...record
    };


  hideOperasiMessage();


  if (operasiFormTitle) {

    operasiFormTitle.textContent =
      "Edit Operasi";

  }


  if (saveOperasiButton) {

    saveOperasiButton.textContent =
      "SIMPAN PERUBAHAN";

  }


  operasiKategori.value =
    record.kategoriOperasi ||
    "";


  operasiPerkara.value =
    record.perkara ||
    "";


  operasiTarikhMula.value =
    formatOperasiDateForInput(
      record.tarikhMula
    );


  operasiTarikhTamat.value =
    formatOperasiDateForInput(
      record.tarikhTamat
    );


  operasiTempat.value =
    record.tempat ||
    "";


  operasiCatatan.value =
    record.catatan ||
    "";


  const location =
    record.lokasiOperasi ||
    "Dalam Negara";


  const locationRadio =
    document.querySelector(
      `input[name="lokasiOperasi"][value="${location}"]`
    );


  if (locationRadio) {

    locationRadio.checked =
      true;

  }


  updateOperasiLocationFields();


  if (
    location ===
    "Dalam Negara"
  ) {

    operasiNegeri.value =
      record.negeri ||
      "";

  }


  if (
    location ===
    "Luar Negara"
  ) {

    operasiNegara.value =
      record.negara ||
      "";

  }


  if (operasiDocument) {

    operasiDocument.value =
      "";

  }
/* =================================================
   DOKUMEN SEDIA ADA
================================================= */

if (
  record.dokumenUrl
) {

  if (operasiExistingDocument) {

    operasiExistingDocument
      .classList
      .remove(
        "hidden"
      );

  }


  if (operasiExistingDocumentLink) {

    operasiExistingDocumentLink.href =
      record.dokumenUrl;

  }

} else {

  if (operasiExistingDocument) {

    operasiExistingDocument
      .classList
      .add(
        "hidden"
      );

  }


  if (operasiExistingDocumentLink) {

    operasiExistingDocumentLink.href =
      "#";

  }

}

  operasiFormSection
    .classList
    .remove(
      "hidden"
    );


  operasiFormSection
    .scrollIntoView({

      behavior:
        "smooth",

      block:
        "start"

    });

}


/* =====================================================
   VALIDATE DOCUMENT
===================================================== */

function validateOperasiDocument() {

  if (
    !operasiDocument ||
    !operasiDocument.files ||
    !operasiDocument.files.length
  ) {

    return {
      valid: true,
      file: null
    };

  }


  const file =
    operasiDocument.files[0];


  const isPdf =
    file.type ===
      "application/pdf" ||
    file.name
      .toLowerCase()
      .endsWith(
        ".pdf"
      );


  if (!isPdf) {

    return {

      valid: false,

      message:
        "Dokumen mestilah dalam format PDF."

    };

  }


  const maximumSize =
    5 *
    1024 *
    1024;


  if (
    file.size >
    maximumSize
  ) {

    return {

      valid: false,

      message:
        "Saiz dokumen tidak boleh melebihi 5 MB."

    };

  }


  return {

    valid: true,

    file:
      file

  };

}


/* =====================================================
   FILE TO BASE64
===================================================== */

function operasiFileToBase64(
  file
) {

  return new Promise(
    function (
      resolve,
      reject
    ) {

      const reader =
        new FileReader();


      reader.onload =
        function () {

          const result =
            String(
              reader.result ||
              ""
            );


          resolve(
            result.includes(",")
              ? result.split(",")[1]
              : result
          );

        };


      reader.onerror =
        function () {

          reject(
            new Error(
              "Dokumen tidak dapat dibaca."
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
   SUBMIT
===================================================== */

if (operasiForm) {

  operasiForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      hideOperasiMessage();


      const lokasiOperasi =
        getSelectedOperasiLocation();


      if (
        !operasiKategori.value
      ) {

        showOperasiMessage(
          "Sila pilih Kategori Operasi.",
          "error"
        );

        return;

      }


      if (
        !lokasiOperasi
      ) {

        showOperasiMessage(
          "Sila pilih Lokasi Operasi.",
          "error"
        );

        return;

      }


      if (
        lokasiOperasi ===
          "Dalam Negara" &&
        !operasiNegeri.value
      ) {

        showOperasiMessage(
          "Sila pilih Negeri.",
          "error"
        );

        return;

      }


      if (
        lokasiOperasi ===
          "Luar Negara" &&
        !operasiNegara.value
      ) {

        showOperasiMessage(
          "Sila pilih Negara.",
          "error"
        );

        return;

      }


      if (
        !operasiPerkara.value.trim()
      ) {

        showOperasiMessage(
          "Sila masukkan Perkara Operasi.",
          "error"
        );

        return;

      }


      if (
        !operasiTarikhMula.value ||
        !operasiTarikhTamat.value
      ) {

        showOperasiMessage(
          "Sila lengkapkan Tarikh Mula dan Tarikh Tamat.",
          "error"
        );

        return;

      }


      if (
        operasiTarikhTamat.value <
        operasiTarikhMula.value
      ) {

        showOperasiMessage(
          "Tarikh Tamat tidak boleh lebih awal daripada Tarikh Mula.",
          "error"
        );

        return;

      }


      if (
        !operasiTempat.value.trim()
      ) {

        showOperasiMessage(
          "Sila masukkan Tempat Operasi.",
          "error"
        );

        return;

      }


      const documentCheck =
        validateOperasiDocument();


      if (
        documentCheck.valid !==
        true
      ) {

        showOperasiMessage(
          documentCheck.message,
          "error"
        );

        return;

      }


      const data = {

        kategoriOperasi:
          operasiKategori.value,

        lokasiOperasi:
          lokasiOperasi,

        perkara:
          operasiPerkara.value
            .trim(),

        tarikhMula:
          operasiTarikhMula.value,

        tarikhTamat:
          operasiTarikhTamat.value,

        tempat:
          operasiTempat.value
            .trim(),

        negeri:
          lokasiOperasi ===
            "Dalam Negara"
            ? operasiNegeri.value
            : "",

        negara:
          lokasiOperasi ===
            "Luar Negara"
            ? operasiNegara.value
            : "",

        catatan:
          operasiCatatan.value
            .trim()

      };


      const originalText =
        saveOperasiButton
          .textContent;


      saveOperasiButton.disabled =
        true;


      saveOperasiButton.textContent =
        editingOperasi
          ? "MENGEMASKINI..."
          : "MENYIMPAN...";


      try {

        /* =============================================
           CREATE / UPDATE
        ============================================= */

        const result =
          await apiPost({

            action:
              editingOperasi
                ? "operasi_update_history"
                : "operasi_add_history",

            email:
              currentSession.googleEmail,

            operasiId:
              editingOperasi
                ? editingOperasi.operasiId
                : "",

            memberOperasiId:
              editingOperasi
                ? editingOperasi.memberOperasiId
                : "",

            data:
              data

          });


        if (
          !result ||
          result.success !== true
        ) {

          throw new Error(
            result?.message ||
            "Rekod Operasi tidak berjaya disimpan."
          );

        }


        /* =============================================
           UPLOAD DOCUMENT
        ============================================= */

        if (
          documentCheck.file
        ) {

          saveOperasiButton.textContent =
            "MEMUAT NAIK DOKUMEN...";


          const base64Data =
            await operasiFileToBase64(
              documentCheck.file
            );


          const targetOperasiId =
            editingOperasi
              ? editingOperasi.operasiId
              : result.operasiId;


          const targetMemberOperasiId =
            editingOperasi
              ? editingOperasi.memberOperasiId
              : result.memberOperasiId;


          const uploadResult =
            await apiPost({

              action:
                "operasi_upload_document",

              email:
                currentSession.googleEmail,

              operasiId:
                targetOperasiId,

              memberOperasiId:
                targetMemberOperasiId,

              fileName:
                documentCheck.file.name,

              mimeType:
                documentCheck.file.type ||
                "application/pdf",

              base64Data:
                base64Data

            });


          if (
            !uploadResult ||
            uploadResult.success !== true
          ) {

            throw new Error(
              "Rekod Operasi telah disimpan tetapi dokumen gagal dimuat naik: " +
              (
                uploadResult?.message ||
                ""
              )
            );

          }

        }


        showOperasiMessage(
          editingOperasi
            ? "Rekod Operasi berjaya dikemaskini."
            : "Rekod Operasi berjaya ditambah.",
          "success"
        );


        resetOperasiForm();


        operasiFormSection
          .classList
          .add(
            "hidden"
          );


        await loadOperasiRecords();


      } catch (error) {

        console.error(
          "SAVE OPERASI ERROR:",
          error
        );


        showOperasiMessage(
          error.message ||
          "Rekod Operasi gagal disimpan.",
          "error"
        );


      } finally {

        saveOperasiButton.disabled =
          false;


        saveOperasiButton.textContent =
          originalText;

      }

    }
  );

}


/* =====================================================
   DELETE
===================================================== */

async function deleteOperasiRecord(
  record
) {

  const confirmed =
    window.confirm(
      "Adakah anda pasti mahu membuang rekod Operasi ini?"
    );


  if (!confirmed) {
    return;
  }


  try {

    showOperasiMessage(
      "Rekod Operasi sedang dibuang...",
      "info"
    );


    const result =
      await apiPost({

        action:
          "operasi_delete_history",

        email:
          currentSession.googleEmail,

        operasiId:
          record.operasiId,

        memberOperasiId:
          record.memberOperasiId

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Rekod Operasi tidak berjaya dibuang."
      );

    }


    showOperasiMessage(
      "Rekod Operasi berjaya dibuang.",
      "success"
    );


    await loadOperasiRecords();


  } catch (error) {

    console.error(
      "DELETE OPERASI ERROR:",
      error
    );


    showOperasiMessage(
      error.message ||
      "Rekod Operasi gagal dibuang.",
      "error"
    );

  }

}


/* =====================================================
   FILTER LOCATION
===================================================== */

document
  .querySelectorAll(
    ".operasi-filter-button"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          activeLocationFilter =
            button.dataset
              .locationFilter ||
            "semua";


          document
            .querySelectorAll(
              ".operasi-filter-button"
            )
            .forEach(
              function (item) {

                item.classList
                  .toggle(
                    "active",
                    item ===
                    button
                  );

              }
            );


          renderOperasiRecords();

        }
      );

    }
  );


/* =====================================================
   FILTER YEAR
===================================================== */

if (operasiYearFilters) {

  operasiYearFilters.addEventListener(
    "click",
    function (event) {

      const button =
        event.target.closest(
          ".operasi-year-button"
        );


      if (!button) {
        return;
      }


      activeYearFilter =
        button.dataset
          .yearFilter ||
        "semua";


      operasiYearFilters
        .querySelectorAll(
          ".operasi-year-button"
        )
        .forEach(
          function (item) {

            item.classList
              .toggle(
                "active",
                item ===
                button
              );

          }
        );


      renderOperasiRecords();

    }
  );

}


/* =====================================================
   LOCATION CHANGE
===================================================== */

document
  .querySelectorAll(
    'input[name="lokasiOperasi"]'
  )
  .forEach(
    function (radio) {

      radio.addEventListener(
        "change",
        updateOperasiLocationFields
      );

    }
  );


/* =====================================================
   ADD BUTTON
===================================================== */

if (addOperasiButton) {

  addOperasiButton.addEventListener(
    "click",
    openAddOperasiForm
  );

}


/* =====================================================
   CLOSE FORM
===================================================== */

if (closeOperasiFormButton) {

  closeOperasiFormButton
    .addEventListener(
      "click",
      function () {

        resetOperasiForm();


        operasiFormSection
          .classList
          .add(
            "hidden"
          );

      }
    );

}


/* =====================================================
   BACK
===================================================== */

if (operasiBackButton) {

  operasiBackButton.addEventListener(
    "click",
    function () {

      window.history.back();

    }
  );

}


/* =====================================================
   HOME
===================================================== */

if (operasiHomeButton) {

  operasiHomeButton.addEventListener(
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
  async function () {

    currentSession =
      getOperasiSession();


    if (
      !currentSession ||
      currentSession.isLoggedIn !==
        true ||
      !currentSession.googleEmail
    ) {

      window.location.href =
        "../index.html";

      return;

    }


    populateOperasiCountries();

    updateOperasiLocationFields();


    await loadOperasiMember();

    await loadOperasiRecords();

  }
);