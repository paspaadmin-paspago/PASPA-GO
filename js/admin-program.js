/* =====================================================
   PASPA GO
   ADMIN - PENGURUSAN PROGRAM
===================================================== */


/* =====================================================
   API
===================================================== */

const ADMIN_PROGRAM_API_URL =
  CONFIG.API_URL;

const ADMIN_PROGRAM_API_KEY =
  CONFIG.API_KEY;


/* =====================================================
   STATE
===================================================== */

let adminProgramMembers = [];

const selectedParticipants =
  new Set();

const selectedSecretariat =
  new Set();

/* =====================================================
   EDIT MODE
===================================================== */

const adminProgramUrlParams =
  new URLSearchParams(
    window.location.search
  );

const adminProgramMode =
  String(
    adminProgramUrlParams.get("mode") || ""
  )
    .trim()
    .toLowerCase();

const adminProgramEditMessageId =
  String(
    adminProgramUrlParams.get("messageId") || ""
  ).trim();


const isAdminProgramEditMode =
  (
    adminProgramMode === "edit" &&
    adminProgramEditMessageId !== ""
  );


let existingProgramAttachmentUrl =
  "";
/* =====================================================
   DROPDOWN DATA
===================================================== */

const PROGRAM_ORGANIZERS = [
  "APM",
  "APM Negeri",
  "PASPA IPPA",
  "Kementerian",
  "Kerajaan Negeri",
  "Agensi Dalam Negeri",
  "Agensi Luar Negara",
  "PBB",
  "Kerajaan Malaysia",
  "ASEAN",
  "ICDO",
  "CDA",
  "Lain-lain"
];


const PROGRAM_COUNTRIES = [
  "Afghanistan",
  "Afrika Selatan",
  "Albania",
  "Algeria",
  "Amerika Syarikat",
  "Andorra",
  "Angola",
  "Antigua dan Barbuda",
  "Arab Saudi",
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
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Emiriah Arab Bersatu",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Filipina",
  "Finland",
  "Gabon",
  "Gambia",
  "Georgia",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guinea Khatulistiwa",
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
  "Itali",
  "Jamaica",
  "Jepun",
  "Jerman",
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
  "Maghribi",
  "Malawi",
  "Malaysia",
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
  "Perancis",
  "Peru",
  "Poland",
  "Portugal",
  "Qatar",
  "Republik Afrika Tengah",
  "Republik Congo",
  "Republik Demokratik Congo",
  "Republik Dominican",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts dan Nevis",
  "Saint Lucia",
  "Saint Vincent dan Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome dan Principe",
  "Senegal",
  "Sepanyol",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapura",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Sudan",
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
  "Turkiye",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Kingdom",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yaman",
  "Zambia",
  "Zimbabwe",
  "Côte d’Ivoire"
];


/* =====================================================
   RANK ORDER
===================================================== */

const PASPA_RANK_ORDER = [
  "KOL.(PA)",
  "LT.KOL.(PA)",
  "MEJAR (PA)",
  "KAPTEN (PA)",
  "LT. (PA)",
  "LT.M (PA)",
  "ST. (PA)",
  "SK. (PA)",
  "SM. (PA)",
  "SJN. MEJ. I (PA)",
  "SJN. MEJ II (PA)",
  "SJN. (PA)",
  "KPL. (PA)",
  "L/KPL. (PA)",
  "PBT. (PA)"
];


/* =====================================================
   ELEMENTS
===================================================== */

const participantList =
  document.getElementById(
    "participantList"
  );

const secretariatList =
  document.getElementById(
    "secretariatList"
  );

const participantSearch =
  document.getElementById(
    "participantSearch"
  );

const secretariatSearch =
  document.getElementById(
    "secretariatSearch"
  );

const participantCount =
  document.getElementById(
    "participantCount"
  );

const secretariatCount =
  document.getElementById(
    "secretariatCount"
  );

const selectAllParticipants =
  document.getElementById(
    "selectAllParticipants"
  );

const lokasiProgram =
  document.getElementById(
    "lokasiProgram"
  );

const negeriGroup =
  document.getElementById(
    "negeriGroup"
  );

const negaraGroup =
  document.getElementById(
    "negaraGroup"
  );

const negaraProgram =
  document.getElementById(
    "negaraProgram"
  );

const penganjurProgram =
  document.getElementById(
    "penganjurProgram"
  );

const penganjurLainGroup =
  document.getElementById(
    "penganjurLainGroup"
  );

const penganjurLain =
  document.getElementById(
    "penganjurLain"
  );

const selectedParticipantList =
  document.getElementById(
    "selectedParticipantList"
  );

const selectedSecretariatList =
  document.getElementById(
    "selectedSecretariatList"
  );

/* PDF LAMPIRAN */

const suratProgram =
  document.getElementById(
    "suratProgram"
  );

  const existingProgramAttachment =
  document.getElementById(
    "existingProgramAttachment"
  );

const existingProgramAttachmentLink =
  document.getElementById(
    "existingProgramAttachmentLink"
  );


/* =====================================================
   HELPERS
===================================================== */

function normalizeMemberId(value) {

  return String(
    value ?? ""
  ).trim();

}


function getMemberDisplayName(member) {

  return (
    String(member?.pangkat || "") +
    " " +
    String(member?.namaPenuh || "")
  )
    .replace(/\s+/g, " ")
    .trim();

}


function getPaspaRankIndex(rank) {

  const normalizedRank =
    String(rank || "")
      .trim()
      .toUpperCase();

  const index =
    PASPA_RANK_ORDER.findIndex(
      function (item) {

        return (
          item.toUpperCase() ===
          normalizedRank
        );

      }
    );

  return index === -1
    ? 999
    : index;

}


function sortProgramMembers(members) {

  return [...members].sort(
    function (a, b) {

      const rankA =
        getPaspaRankIndex(
          a.pangkat
        );

      const rankB =
        getPaspaRankIndex(
          b.pangkat
        );

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      return String(
        a.namaPenuh || ""
      ).localeCompare(
        String(
          b.namaPenuh || ""
        ),
        "ms",
        {
          sensitivity: "base"
        }
      );

    }
  );

}


/* =====================================================
   DROPDOWN
===================================================== */

function populateOrganizerDropdown() {

  if (!penganjurProgram) {
    return;
  }

  penganjurProgram.innerHTML =
    '<option value="">-- Pilih --</option>';

  PROGRAM_ORGANIZERS.forEach(
    function (organizer) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        organizer;

      option.textContent =
        organizer;

      penganjurProgram.appendChild(
        option
      );

    }
  );

}


function populateCountries() {

  if (!negaraProgram) {
    return;
  }

  negaraProgram.innerHTML =
    '<option value="">-- Pilih Negara --</option>';

  const countries =
    [...new Set(PROGRAM_COUNTRIES)]
      .sort(
        function (a, b) {

          return a.localeCompare(
            b,
            "ms",
            {
              sensitivity: "base"
            }
          );

        }
      );

  countries.forEach(
    function (country) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        country;

      option.textContent =
        country;

      negaraProgram.appendChild(
        option
      );

    }
  );

}


/* =====================================================
   ADMIN EMAIL
===================================================== */

function getAdminEmail() {

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
      "GET ADMIN EMAIL ERROR:",
      error
    );

    return "";

  }

}


/* =====================================================
   API CALL
===================================================== */

async function callAdminProgramApi(
  action,
  extraData = {}
) {

  const payload = {

    action:
      action,

    apiKey:
      ADMIN_PROGRAM_API_KEY,

    email:
      getAdminEmail(),

    ...extraData

  };


  const requestUrl =
    ADMIN_PROGRAM_API_URL +
    "?_ts=" +
    Date.now();


  const response =
    await fetch(
      requestUrl,
      {

        method:
          "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body:
          JSON.stringify(
            payload
          ),

        redirect:
          "follow",

        cache:
          "no-store"

      }
    );


  if (!response.ok) {

    throw new Error(
      "Sambungan API gagal. HTTP " +
      response.status
    );

  }


  const text =
    await response.text();


  try {

    return JSON.parse(
      text
    );

  } catch (error) {

    console.error(
      "RESPONS API:",
      text
    );

    throw new Error(
      "Respons API tidak sah."
    );

  }

}


/* =====================================================
   PDF - VALIDATION
===================================================== */

function getProgramAttachmentFile() {

  if (
    !suratProgram ||
    !suratProgram.files ||
    !suratProgram.files.length
  ) {

    return null;

  }


  return suratProgram.files[0];

}


function validateProgramAttachment(file) {

  if (!file) {
    return true;
  }


  const maxSize =
    5 * 1024 * 1024;


  const isPdf =
    file.type ===
      "application/pdf" ||
    String(
      file.name || ""
    )
      .toLowerCase()
      .endsWith(".pdf");


  if (!isPdf) {

    throw new Error(
      "Lampiran mestilah dalam format PDF."
    );

  }


  if (
    file.size > maxSize
  ) {

    throw new Error(
      "Saiz lampiran maksimum ialah 5 MB."
    );

  }


  return true;

}


/* =====================================================
   PDF - FILE → BASE64
===================================================== */

function fileToBase64(file) {

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
              reader.result || ""
            );


          const commaIndex =
            result.indexOf(",");


          if (
            commaIndex === -1
          ) {

            reject(
              new Error(
                "Lampiran tidak dapat dibaca."
              )
            );

            return;

          }


          resolve(
            result.substring(
              commaIndex + 1
            )
          );

        };


      reader.onerror =
        function () {

          reject(
            new Error(
              "Lampiran tidak dapat dibaca."
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
   PDF - UPLOAD KE GOOGLE DRIVE
===================================================== */

async function uploadProgramAttachment(
  file
) {

  if (!file) {

    return null;

  }


  validateProgramAttachment(
    file
  );


  const base64Data =
    await fileToBase64(
      file
    );


  const result =
    await callAdminProgramApi(
      "upload_program_attachment",
      {

        fileName:
          file.name,

        mimeType:
          "application/pdf",

        base64Data:
          base64Data

      }
    );


  if (
    !result ||
    result.success !== true
  ) {

    throw new Error(
      result?.message ||
      "Lampiran gagal dimuat naik."
    );

  }


  return {

    fileId:
      result.fileId || "",

    url:
      result.url || "",

    fileName:
      result.fileName ||
      file.name

  };

}


/* =====================================================
   GENERATE PROGRAM REFERENCE
===================================================== */

function getProgramReference() {

  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );

  const hour =
    String(
      now.getHours()
    ).padStart(
      2,
      "0"
    );

  const minute =
    String(
      now.getMinutes()
    ).padStart(
      2,
      "0"
    );

  const second =
    String(
      now.getSeconds()
    ).padStart(
      2,
      "0"
    );


  return (
    "PASPA/PROGRAM/" +
    year +
    "/" +
    month +
    day +
    "-" +
    hour +
    minute +
    second
  );

}


/* =====================================================
   LOAD MEMBER
===================================================== */

async function loadProgramMembers() {

  participantList.innerHTML =
    '<div class="loading-text">Memuatkan senarai ahli...</div>';

  secretariatList.innerHTML =
    '<div class="loading-text">Memuatkan senarai ahli...</div>';


  try {

    const result =
      await callAdminProgramApi(
        "admin_program_members"
      );


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Senarai ahli gagal dimuatkan."
      );

    }


    const rawMembers =
      Array.isArray(
        result.members
      )
        ? result.members
        : [];


    const memberMap =
      new Map();


    rawMembers.forEach(
      function (member) {

        const idPaspa =
          normalizeMemberId(
            member.idPaspa
          );


        if (!idPaspa) {
          return;
        }


        memberMap.set(
          idPaspa,
          {

            ...member,

            idPaspa:
              idPaspa,

            pangkat:
              String(
                member.pangkat || ""
              ).trim(),

            namaPenuh:
              String(
                member.namaPenuh || ""
              ).trim()

          }
        );

      }
    );


    adminProgramMembers =
      sortProgramMembers(
        Array.from(
          memberMap.values()
        )
      );


    renderParticipants();

    renderSecretariat();

    updateSelectionUI();


  } catch (error) {

    console.error(
      "LOAD PROGRAM MEMBERS ERROR:",
      error
    );


    participantList.innerHTML =
      '<div class="empty-text">Senarai ahli tidak dapat dimuatkan.</div>';

    secretariatList.innerHTML =
      '<div class="empty-text">Senarai ahli tidak dapat dimuatkan.</div>';


    showAdminMessage(
      error.message,
      "error"
    );

  }

}


/* =====================================================
   FILTER MEMBER
===================================================== */

function filterMembers(
  searchValue
) {

  const keyword =
    String(
      searchValue || ""
    )
      .trim()
      .toLowerCase();


  if (!keyword) {

    return adminProgramMembers;

  }


  return adminProgramMembers.filter(
    function (member) {

      const searchText =
        [

          member.idPaspa,
          member.pangkat,
          member.namaPenuh,

          getMemberDisplayName(
            member
          )

        ]
          .join(" ")
          .toLowerCase();


      return searchText.includes(
        keyword
      );

    }
  );

}


/* =====================================================
   CREATE MEMBER CHECKBOX
===================================================== */

function createMemberOption(
  member,
  type
) {

  const memberId =
    normalizeMemberId(
      member.idPaspa
    );


  const selectedSet =
    type === "participant"
      ? selectedParticipants
      : selectedSecretariat;


  const label =
    document.createElement(
      "label"
    );


  label.className =
    "member-option";


  const checkbox =
    document.createElement(
      "input"
    );


  checkbox.type =
    "checkbox";


  checkbox.value =
    memberId;


  checkbox.dataset.memberId =
    memberId;


  checkbox.checked =
    selectedSet.has(
      memberId
    );


  checkbox.addEventListener(
    "change",
    function () {

      if (
        checkbox.checked
      ) {

        selectedSet.add(
          memberId
        );

      } else {

        selectedSet.delete(
          memberId
        );

      }


      updateSelectionUI();

    }
  );


  const text =
    document.createElement(
      "span"
    );


  text.className =
    "member-display";


  text.textContent =
    getMemberDisplayName(
      member
    ) +
    " | ID " +
    memberId;


  label.appendChild(
    checkbox
  );


  label.appendChild(
    text
  );


  return label;

}


/* =====================================================
   RENDER PARTICIPANTS
===================================================== */

function renderParticipants() {

  const members =
    filterMembers(
      participantSearch.value
    );


  participantList.innerHTML =
    "";


  if (!members.length) {

    participantList.innerHTML =
      '<div class="empty-text">Tiada ahli ditemui.</div>';

    updateSelectionUI();

    return;

  }


  members.forEach(
    function (member) {

      participantList.appendChild(
        createMemberOption(
          member,
          "participant"
        )
      );

    }
  );


  updateSelectionUI();

}


/* =====================================================
   RENDER SECRETARIAT
===================================================== */

function renderSecretariat() {

  const members =
    filterMembers(
      secretariatSearch.value
    );


  secretariatList.innerHTML =
    "";


  if (!members.length) {

    secretariatList.innerHTML =
      '<div class="empty-text">Tiada ahli ditemui.</div>';

    updateSelectionUI();

    return;

  }


  members.forEach(
    function (member) {

      secretariatList.appendChild(
        createMemberOption(
          member,
          "secretariat"
        )
      );

    }
  );


  updateSelectionUI();

}


/* =====================================================
   SELECTED MEMBERS
===================================================== */

function getSelectedMembers(
  selectedSet
) {

  const members =
    adminProgramMembers.filter(
      function (member) {

        return selectedSet.has(
          normalizeMemberId(
            member.idPaspa
          )
        );

      }
    );


  return sortProgramMembers(
    members
  );

}


/* =====================================================
   RENDER SELECTED MEMBERS
===================================================== */

function renderSelectedMembers(
  selectedSet,
  targetElement,
  emptyMessage
) {

  if (!targetElement) {
    return;
  }


  targetElement.innerHTML =
    "";


  const selectedMembers =
    getSelectedMembers(
      selectedSet
    );


  if (
    !selectedMembers.length
  ) {

    targetElement.innerHTML =
      '<div class="empty-text">' +
      emptyMessage +
      '</div>';

    return;

  }


  selectedMembers.forEach(
    function (
      member,
      index
    ) {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "selected-member-row";


      const number =
        document.createElement(
          "span"
        );


      number.className =
        "selected-member-number";


      number.textContent =
        (index + 1) +
        ".";


      const name =
        document.createElement(
          "span"
        );


      name.className =
        "selected-member-name";


      name.textContent =
        getMemberDisplayName(
          member
        ) +
        " | ID " +
        member.idPaspa;


      row.appendChild(
        number
      );


      row.appendChild(
        name
      );


      targetElement.appendChild(
        row
      );

    }
  );

}


/* =====================================================
   UPDATE SELECTED UI
===================================================== */

function updateSelectionUI() {

  participantCount.textContent =
    selectedParticipants.size +
    " dipilih";


  secretariatCount.textContent =
    selectedSecretariat.size +
    " dipilih";


  const totalMembers =
    adminProgramMembers.length;


  if (
    totalMembers > 0 &&
    selectedParticipants.size ===
      totalMembers
  ) {

    selectAllParticipants.checked =
      true;

    selectAllParticipants.indeterminate =
      false;

  } else if (
    selectedParticipants.size > 0
  ) {

    selectAllParticipants.checked =
      false;

    selectAllParticipants.indeterminate =
      true;

  } else {

    selectAllParticipants.checked =
      false;

    selectAllParticipants.indeterminate =
      false;

  }


  renderSelectedMembers(
    selectedParticipants,
    selectedParticipantList,
    "Tiada peserta dipilih."
  );


  renderSelectedMembers(
    selectedSecretariat,
    selectedSecretariatList,
    "Tiada urusetia dipilih."
  );

}


/* =====================================================
   SELECT ALL PARTICIPANTS
===================================================== */

selectAllParticipants.addEventListener(
  "change",
  function () {

    selectedParticipants.clear();


    if (
      selectAllParticipants.checked
    ) {

      adminProgramMembers.forEach(
        function (member) {

          selectedParticipants.add(
            normalizeMemberId(
              member.idPaspa
            )
          );

        }
      );

    }


    renderParticipants();

  }
);


/* =====================================================
   SEARCH
===================================================== */

participantSearch.addEventListener(
  "input",
  function () {

    renderParticipants();

  }
);


secretariatSearch.addEventListener(
  "input",
  function () {

    renderSecretariat();

  }
);


/* =====================================================
   LOCATION
===================================================== */

function updateLocationFields() {

  const value =
    lokasiProgram.value;


  negeriGroup.hidden =
    value !==
    "Dalam Negara";


  negaraGroup.hidden =
    value !==
    "Luar Negara";


  if (
    value !==
    "Dalam Negara"
  ) {

    const negeriProgram =
      document.getElementById(
        "negeriProgram"
      );


    if (
      negeriProgram
    ) {

      negeriProgram.value =
        "";

    }

  }


  if (
    value !==
      "Luar Negara" &&
    negaraProgram
  ) {

    negaraProgram.value =
      "";

  }

}


lokasiProgram.addEventListener(
  "change",
  updateLocationFields
);


/* =====================================================
   ORGANIZER
===================================================== */

function updateOrganizerField() {

  const isOther =
    penganjurProgram.value ===
    "Lain-lain";


  penganjurLainGroup.hidden =
    !isOther;


  if (
    !isOther &&
    penganjurLain
  ) {

    penganjurLain.value =
      "";

  }

}


penganjurProgram.addEventListener(
  "change",
  updateOrganizerField
);


/* =====================================================
   MESSAGE
===================================================== */

function showAdminMessage(
  message,
  type
) {

  const box =
    document.getElementById(
      "adminProgramMessage"
    );


  if (!box) {
    return;
  }


  box.textContent =
    message;


  box.className =
    "message-box " +
    type;


  box.hidden =
    false;

}


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
   LOAD PROGRAM UNTUK EDIT
===================================================== */

async function loadAdminProgramEditData() {

  if (!isAdminProgramEditMode) {
    return;
  }


  try {

    showAdminMessage(
      "Memuatkan Program untuk dikemaskini...",
      "info"
    );


    const result =
      await callAdminProgramApi(
        "admin_program_edit_data",
        {
          messageId:
            adminProgramEditMessageId
        }
      );


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Maklumat Program tidak dapat dimuatkan."
      );

    }


    const program =
      result.program || {};


    /* =================================================
       ELEMENT PROGRAM
    ================================================= */

    const kategoriElement =
      document.getElementById(
        "kategoriProgram"
      );


    const lokasiElement =
      document.getElementById(
        "lokasiProgram"
      );


    const negeriElement =
      document.getElementById(
        "negeriProgram"
      );


    const negaraElement =
      document.getElementById(
        "negaraProgram"
      );


    const perkaraElement =
      document.getElementById(
        "perkaraProgram"
      );


    const tarikhMulaElement =
      document.getElementById(
        "tarikhMula"
      );


    const tarikhTamatElement =
      document.getElementById(
        "tarikhTamat"
      );


    const tempatElement =
      document.getElementById(
        "tempatProgram"
      );


    const keteranganElement =
      document.getElementById(
        "keteranganProgram"
      );


    /* =================================================
       KATEGORI
    ================================================= */

    if (kategoriElement) {

      kategoriElement.value =
        program.kategoriProgram || "";

    }


    /* =================================================
       LOKASI

       Dalam Negara:
       - Papar dropdown Negeri
       - Isi nama Negeri
       - Negara kosong

       Luar Negara:
       - Papar dropdown Negara
       - Isi nama Negara
       - Negeri kosong
    ================================================= */

    if (lokasiElement) {

      lokasiElement.value =
        program.lokasiProgram || "";

    }


    /*
     * WAJIB dibuat dahulu.
     * Fungsi ini menentukan dropdown
     * Negeri atau Negara yang perlu dipaparkan.
     */

    updateLocationFields();


    if (
      program.lokasiProgram ===
      "Dalam Negara"
    ) {

      if (negeriElement) {

        negeriElement.value =
          program.negeri || "";

      }


      if (negaraElement) {

        negaraElement.value =
          "";

      }

    } else if (
      program.lokasiProgram ===
      "Luar Negara"
    ) {

      if (negaraElement) {

        negaraElement.value =
          program.negara || "";

      }


      if (negeriElement) {

        negeriElement.value =
          "";

      }

    }


    /* =================================================
       MAKLUMAT PROGRAM LAIN
    ================================================= */

    if (perkaraElement) {

      perkaraElement.value =
        program.perkara || "";

    }


    if (tarikhMulaElement) {

      tarikhMulaElement.value =
        program.tarikhMula || "";

    }


    if (tarikhTamatElement) {

      tarikhTamatElement.value =
        program.tarikhTamat || "";

    }


    if (tempatElement) {

      tempatElement.value =
        program.tempat || "";

    }


    /* =================================================
       PENGANJUR
    ================================================= */

    const organizer =
      String(
        program.penganjur || ""
      ).trim();


    if (
      PROGRAM_ORGANIZERS.includes(
        organizer
      )
    ) {

      penganjurProgram.value =
        organizer;

      penganjurLain.value =
        "";

    } else if (organizer) {

      penganjurProgram.value =
        "Lain-lain";

      penganjurLain.value =
        organizer;

    }


    updateOrganizerField();


    /* =================================================
       KETERANGAN
    ================================================= */

    if (keteranganElement) {

      keteranganElement.value =
        program.keterangan || "";

    }


    /* =================================================
       LAMPIRAN LAMA
    ================================================= */

    existingProgramAttachmentUrl =
      String(
        program.pautan || ""
      ).trim();

/* =================================================
   PAPAR LAMPIRAN SEDIA ADA
================================================= */

if (
  existingProgramAttachmentUrl
) {

  if (
    existingProgramAttachment
  ) {

    existingProgramAttachment.hidden =
      false;

  }


  if (
    existingProgramAttachmentLink
  ) {

    existingProgramAttachmentLink.href =
      existingProgramAttachmentUrl;

  }

} else {

  if (
    existingProgramAttachment
  ) {

    existingProgramAttachment.hidden =
      true;

  }


  if (
    existingProgramAttachmentLink
  ) {

    existingProgramAttachmentLink.href =
      "#";

  }

}






    /* =================================================
       PESERTA LAMA
    ================================================= */

    selectedParticipants.clear();


    (
      Array.isArray(
        result.participants
      )
        ? result.participants
        : []
    )
      .forEach(
        function (member) {

          const id =
            normalizeMemberId(
              member.idPaspa
            );


          if (id) {

            selectedParticipants.add(
              id
            );

          }

        }
      );


    /* =================================================
       URUSETIA LAMA
    ================================================= */

    selectedSecretariat.clear();


    (
      Array.isArray(
        result.secretariat
      )
        ? result.secretariat
        : []
    )
      .forEach(
        function (member) {

          const id =
            normalizeMemberId(
              member.idPaspa
            );


          if (id) {

            selectedSecretariat.add(
              id
            );

          }

        }
      );


    /* =================================================
       REFRESH CHECKBOX
    ================================================= */

    renderParticipants();

    renderSecretariat();

    updateSelectionUI();


    /* =================================================
       TITLE PAGE
    ================================================= */

    const pageTitle =
      document.querySelector(
        ".program-form-card h1, .program-form-card h2"
      );


    if (pageTitle) {

      pageTitle.textContent =
        "Edit Program";

    }


    /* =================================================
       BUTTON
    ================================================= */

    const sendButton =
      document.getElementById(
        "sendInvitationButton"
      );


    if (sendButton) {

      sendButton.textContent =
        "SEMAK PERUBAHAN";

    }


    showAdminMessage(
      "Program sedia ada telah dimuatkan. Status respon ahli akan dikekalkan.",
      "success"
    );


  } catch (error) {

    console.error(
      "LOAD ADMIN PROGRAM EDIT ERROR:",
      error
    );


    showAdminMessage(
      error.message ||
      "Program tidak dapat dimuatkan untuk edit.",
      "error"
    );

  }

}
/* =====================================================
   BUILD REVIEW DATA
===================================================== */

function buildProgramReviewData() {

  const participants =
    getSelectedMembers(
      selectedParticipants
    );


  const secretariat =
    getSelectedMembers(
      selectedSecretariat
    );


  const inviteAll =
    document.getElementById(
      "selectAllParticipants"
    ).checked;


  if (
    !participants.length
  ) {

    throw new Error(
      "Sila pilih sekurang-kurangnya seorang peserta."
    );

  }


  const program = {

    kategoriProgram:
      document.getElementById(
        "kategoriProgram"
      ).value,

    lokasiProgram:
      document.getElementById(
        "lokasiProgram"
      ).value,

    perkara:
      document.getElementById(
        "perkaraProgram"
      ).value.trim(),

    tarikhMula:
      document.getElementById(
        "tarikhMula"
      ).value,

    tarikhTamat:
      document.getElementById(
        "tarikhTamat"
      ).value,

    tempat:
      document.getElementById(
        "tempatProgram"
      ).value.trim(),

    negeri:
      document.getElementById(
        "negeriProgram"
      ).value,

    negara:
      document.getElementById(
        "negaraProgram"
      ).value,

    penganjur:
      document.getElementById(
        "penganjurProgram"
      ).value,

    penganjurLain:
      document.getElementById(
        "penganjurLain"
      ).value.trim(),

    keterangan:
      document.getElementById(
        "keteranganProgram"
      ).value.trim()

  };


  if (
    !program.kategoriProgram ||
    !program.lokasiProgram ||
    !program.perkara ||
    !program.tarikhMula ||
    !program.tarikhTamat ||
    !program.tempat ||
    !program.penganjur
  ) {

    throw new Error(
      "Sila lengkapkan semua maklumat Program."
    );

  }


  const attachmentFile =
    getProgramAttachmentFile();


  validateProgramAttachment(
    attachmentFile
  );


  return {

  mode:
    isAdminProgramEditMode
      ? "edit"
      : "create",

  messageId:
    isAdminProgramEditMode
      ? adminProgramEditMessageId
      : "",

  program:
    program,

  inviteAll:
    inviteAll,

  participants:
    participants,

  secretariat:
    secretariat,

  existingAttachmentUrl:
    existingProgramAttachmentUrl,

  preparedAt:
    new Date().toISOString()

};

}


/* =====================================================
   HANTAR KE PAGE REVIEW
===================================================== */

document
  .getElementById(
    "sendInvitationButton"
  )
  .addEventListener(
    "click",
    async function () {

      const button =
        document.getElementById(
          "sendInvitationButton"
        );


      const originalText =
        button
          ? button.textContent
          : "";


      try {

        if (button) {

          button.disabled =
            true;

        }


        const reviewData =
          buildProgramReviewData();


        /* =================================================
           LAMPIRAN
        ================================================= */

        const attachmentFile =
          getProgramAttachmentFile();


        if (
          attachmentFile
        ) {

          if (button) {

            button.textContent =
              "MEMUAT NAIK LAMPIRAN...";

          }


          showAdminMessage(
            "Lampiran PDF sedang dimuat naik...",
            "info"
          );


          const uploaded =
            await uploadProgramAttachment(
              attachmentFile
            );


          reviewData.lampiran = {

            fileId:
              uploaded.fileId,

            url:
              uploaded.url,

            fileName:
              uploaded.fileName

          };

     } else {

  if (
    isAdminProgramEditMode &&
    existingProgramAttachmentUrl
  ) {

    reviewData.lampiran = {

      fileId:
        "",

      url:
        existingProgramAttachmentUrl,

      fileName:
        "Lampiran sedia ada"

    };

  } else {

    reviewData.lampiran =
      null;

  }

}


        /* =================================================
           NO RUJUKAN
        ================================================= */

        if (
  !isAdminProgramEditMode
) {

  reviewData.noRujukan =
    getProgramReference();

}


        /* =================================================
           SIMPAN DRAFT
           Hanya metadata lampiran disimpan,
           bukan fail PDF.
        ================================================= */

        localStorage.setItem(
          "paspaProgramReviewDraft",
          JSON.stringify(
            reviewData
          )
        );


        /* =================================================
           BUKA PAGE REVIEW
        ================================================= */

        window.location.href =
          "admin-program-review.html";


      } catch (error) {

        console.error(
          "SEND INVITATION REVIEW ERROR:",
          error
        );


        showAdminMessage(
          error.message ||
          "Program tidak dapat diproses.",
          "error"
        );


        if (button) {

          button.disabled =
            false;


          button.textContent =
            originalText;

        }

      }

    }
  );

  /* =====================================================
   MODE SAHKAN PROGRAM
===================================================== */

function isProgramConfirmMode() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  return (
    String(
      params.get("mode") ||
      ""
    )
      .trim()
      .toLowerCase() ===
    "confirm"
  );

}


/* =====================================================
   MESSAGE ID
===================================================== */

function getConfirmMessageId() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  return String(
    params.get("messageId") ||
    ""
  ).trim();

}


/* =====================================================
   CREATE ATTENDANCE ROW
===================================================== */

function createAttendanceSelect(
  member,
  type
) {

  const row =
    document.createElement(
      "div"
    );


  row.className =
    "confirm-attendance-row";


  /* =================================================
     MEMBER INFO
  ================================================= */

  const memberInfo =
    document.createElement(
      "div"
    );


  memberInfo.className =
    "confirm-member-info";


  const memberName =
    String(
      member.namaAhli ||
      member.namaPenuh ||
      ""
    ).trim();


  const memberId =
    normalizeMemberId(
      member.idPaspa
    );


  memberInfo.innerHTML = `

    <strong class="confirm-member-name">
      ${memberName || "-"}
    </strong>

    <span>
      ID PASPA:
      ${memberId || "-"}
    </span>

    <span>
      Peranan:
      ${type}
    </span>

    <span>
      Respon Jemputan:
      ${
        String(
          member.statusRespon ||
          "BELUM RESPON"
        )
      }
    </span>

  `;


  /* =================================================
     SELECT
  ================================================= */

  const select =
    document.createElement(
      "select"
    );


  select.className =
    "confirm-attendance-select";


  select.dataset.idPaspa =
    memberId;


  select.dataset.peranan =
    type;


  select.innerHTML = `

    <option value="">
      -- Pilih Kehadiran --
    </option>

    <option value="Hadir">
      Hadir
    </option>

    <option value="Tidak Hadir">
      Tidak Hadir
    </option>

  `;


  /* =================================================
     DEFAULT IKUT RESPON AHLI
  ================================================= */

  const responseStatus =
    String(
      member.statusRespon ||
      ""
    )
      .trim()
      .toLowerCase();


  if (
    responseStatus === "hadir"
  ) {

    select.value =
      "Hadir";

  }


  if (
    responseStatus ===
    "tidak hadir"
  ) {

    select.value =
      "Tidak Hadir";

  }


  row.appendChild(
    memberInfo
  );


  row.appendChild(
    select
  );


  return row;

}


/* =====================================================
   RENDER CONFIRM LIST
===================================================== */

function renderConfirmAttendanceList(
  target,
  members,
  type
) {

  if (!target) {
    return;
  }


  target.innerHTML =
    "";


  if (
    !Array.isArray(members) ||
    !members.length
  ) {

    target.innerHTML =
      '<div class="empty-text">' +
      "Tiada " +
      type.toLowerCase() +
      "." +
      "</div>";

    return;

  }


  /* =================================================
     HEADER
  ================================================= */

  const header =
    document.createElement(
      "div"
    );


  header.className =
    "confirm-attendance-header";


  const title =
    document.createElement(
      "strong"
    );


  title.textContent =
    type === "Peserta"
      ? "Senarai Peserta"
      : "Senarai Urusetia";


  const allPresentButton =
    document.createElement(
      "button"
    );


  allPresentButton.type =
    "button";


  allPresentButton.className =
    "confirm-all-present-button";


  allPresentButton.textContent =
    "✓ SEMUA HADIR";


  header.appendChild(
    title
  );


  header.appendChild(
    allPresentButton
  );


  target.appendChild(
    header
  );


  /* =================================================
     LIST
  ================================================= */

  const listContainer =
    document.createElement(
      "div"
    );


  listContainer.className =
    "confirm-attendance-list";


  members.forEach(
    function (member) {

      listContainer.appendChild(
        createAttendanceSelect(
          member,
          type
        )
      );

    }
  );


  target.appendChild(
    listContainer
  );


  /* =================================================
     SEMUA HADIR
  ================================================= */

  allPresentButton.addEventListener(
    "click",
    function () {

      const selects =
        listContainer
          .querySelectorAll(
            ".confirm-attendance-select"
          );


      selects.forEach(
        function (select) {

          select.value =
            "Hadir";

        }
      );

    }
  );

}


/* =====================================================
   LOAD CONFIRM MODE
===================================================== */

async function loadProgramConfirmMode() {

  const messageId =
    getConfirmMessageId();


  if (!messageId) {

    showAdminMessage(
      "MESSAGE_ID Program tidak ditemui.",
      "error"
    );

    return;

  }


  try {

    showAdminMessage(
      "Memuatkan maklumat Program untuk pengesahan...",
      "info"
    );


    /* =================================================
       LOAD DATA
    ================================================= */

    const result =
      await callAdminProgramApi(
        "admin_program_edit_data",
        {
          messageId:
            messageId
        }
      );


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Maklumat Program tidak dapat dimuatkan."
      );

    }


    const program =
      result.program || {};


    /* =================================================
       ELEMENT PROGRAM
    ================================================= */

    const kategoriElement =
      document.getElementById(
        "kategoriProgram"
      );


    const lokasiElement =
      document.getElementById(
        "lokasiProgram"
      );


    const perkaraElement =
      document.getElementById(
        "perkaraProgram"
      );


    const tarikhMulaElement =
      document.getElementById(
        "tarikhMula"
      );


    const tarikhTamatElement =
      document.getElementById(
        "tarikhTamat"
      );


    const tempatElement =
      document.getElementById(
        "tempatProgram"
      );


    const negeriElement =
      document.getElementById(
        "negeriProgram"
      );


    const negaraElement =
      document.getElementById(
        "negaraProgram"
      );


    const keteranganElement =
      document.getElementById(
        "keteranganProgram"
      );


    /* =================================================
       KATEGORI
    ================================================= */

    if (kategoriElement) {

      kategoriElement.value =
        program.kategoriProgram || "";

    }


    /* =================================================
       LOKASI + NEGERI / NEGARA
    ================================================= */

    if (lokasiElement) {

      lokasiElement.value =
        program.lokasiProgram || "";

    }


    /*
     * Paparkan dropdown yang betul dahulu.
     */

    updateLocationFields();


    /*
     * DALAM NEGARA
     */

    if (
      program.lokasiProgram ===
      "Dalam Negara"
    ) {

      if (negeriElement) {

        negeriElement.value =
          program.negeri || "";

      }


      if (negaraElement) {

        negaraElement.value =
          "";

      }

    }


    /*
     * LUAR NEGARA
     */

    else if (
      program.lokasiProgram ===
      "Luar Negara"
    ) {

      if (negaraElement) {

        negaraElement.value =
          program.negara || "";

      }


      if (negeriElement) {

        negeriElement.value =
          "";

      }

    }


    /* =================================================
       MAKLUMAT PROGRAM
    ================================================= */

    if (perkaraElement) {

      perkaraElement.value =
        program.perkara || "";

    }


    if (tarikhMulaElement) {

      tarikhMulaElement.value =
        program.tarikhMula || "";

    }


    if (tarikhTamatElement) {

      tarikhTamatElement.value =
        program.tarikhTamat || "";

    }


    if (tempatElement) {

      tempatElement.value =
        program.tempat || "";

    }


    if (keteranganElement) {

      keteranganElement.value =
        program.keterangan || "";

    }


    /* =================================================
       PENGANJUR
    ================================================= */

    const organizer =
      String(
        program.penganjur || ""
      ).trim();


    if (
      PROGRAM_ORGANIZERS.includes(
        organizer
      )
    ) {

      penganjurProgram.value =
        organizer;

      penganjurLain.value =
        "";

    } else if (organizer) {

      penganjurProgram.value =
        "Lain-lain";

      penganjurLain.value =
        organizer;

    }


    updateOrganizerField();


    /* =================================================
       LOCK MAKLUMAT PROGRAM
    ================================================= */

    [
      "kategoriProgram",
      "lokasiProgram",
      "perkaraProgram",
      "tarikhMula",
      "tarikhTamat",
      "tempatProgram",
      "negeriProgram",
      "negaraProgram",
      "penganjurProgram",
      "penganjurLain",
      "keteranganProgram",
      "suratProgram"
    ]
      .forEach(
        function (id) {

          const element =
            document.getElementById(
              id
            );


          if (element) {

            element.disabled =
              true;

          }

        }
      );


    /* =================================================
       HIDE MEMBER SEARCH
    ================================================= */

    if (participantSearch) {

      participantSearch.style.display =
        "none";

    }


    if (secretariatSearch) {

      secretariatSearch.style.display =
        "none";

    }


    if (selectAllParticipants) {

      const wrapper =
        selectAllParticipants.closest(
          "label"
        );


      if (wrapper) {

        wrapper.style.display =
          "none";

      }

    }


    if (participantList) {

      participantList.style.display =
        "none";

    }


    if (secretariatList) {

      secretariatList.style.display =
        "none";

    }


    /* =================================================
       RENDER PESERTA / URUSETIA
    ================================================= */

    renderConfirmAttendanceList(
      selectedParticipantList,
      result.participants || [],
      "Peserta"
    );


    renderConfirmAttendanceList(
      selectedSecretariatList,
      result.secretariat || [],
      "Urusetia"
    );


    if (participantCount) {

      participantCount.textContent =
        String(
          (
            result.participants || []
          ).length
        ) +
        " orang";

    }


    if (secretariatCount) {

      secretariatCount.textContent =
        String(
          (
            result.secretariat || []
          ).length
        ) +
        " orang";

    }


    /* =================================================
       HIDE SIMPAN DRAF
    ================================================= */

    const saveDraftButton =
      document.getElementById(
        "saveDraftButton"
      );


    if (saveDraftButton) {

      saveDraftButton.style.display =
        "none";

    }


    /* =================================================
       BUTTON SAHKAN
    ================================================= */

    const oldButton =
      document.getElementById(
        "sendInvitationButton"
      );


    if (!oldButton) {

      throw new Error(
        "Button SAHKAN MAKLUMAT tidak ditemui."
      );

    }


    /*
     * Buang event CREATE lama.
     */

    const newButton =
      oldButton.cloneNode(
        true
      );


    oldButton.replaceWith(
      newButton
    );


    newButton.id =
      "sendInvitationButton";


    newButton.textContent =
      "SAHKAN MAKLUMAT";


    /* =================================================
       CLICK SAHKAN
    ================================================= */

    newButton.addEventListener(
      "click",
      async function () {

        const attendanceSelects =
          document.querySelectorAll(
            ".confirm-attendance-select"
          );


        const attendance =
          [];


        let incomplete =
          false;


        attendanceSelects.forEach(
          function (select) {

            if (!select.value) {

              incomplete =
                true;

              return;

            }


            attendance.push({

              idPaspa:
                select.dataset.idPaspa,

              peranan:
                select.dataset.peranan,

              statusKehadiran:
                select.value

            });

          }
        );


        /* =============================================
           SEMAK KEHADIRAN
        ============================================= */

        if (incomplete) {

          showAdminMessage(
            "Sila sahkan kehadiran semua peserta dan urusetia.",
            "error"
          );

          return;

        }


        /* =============================================
           DATA PROGRAM AKHIR
        ============================================= */

        const selectedLocation =
          lokasiElement
            ? lokasiElement.value
            : (
                program.lokasiProgram ||
                ""
              );


        let finalNegeri =
          "";


        let finalNegara =
          "";


        if (
          selectedLocation ===
          "Dalam Negara"
        ) {

          finalNegeri =
            negeriElement
              ? negeriElement.value
              : (
                  program.negeri ||
                  ""
                );

        }


        if (
          selectedLocation ===
          "Luar Negara"
        ) {

          finalNegara =
            negaraElement
              ? negaraElement.value
              : (
                  program.negara ||
                  ""
                );

        }


        const finalProgram = {

          ...program,


          kategoriProgram:
            kategoriElement
              ? kategoriElement.value
              : (
                  program.kategoriProgram ||
                  ""
                ),


          lokasiProgram:
            selectedLocation,


          perkara:
            perkaraElement
              ? perkaraElement.value.trim()
              : (
                  program.perkara ||
                  ""
                ),


          tarikhMula:
            tarikhMulaElement
              ? tarikhMulaElement.value
              : (
                  program.tarikhMula ||
                  ""
                ),


          tarikhTamat:
            tarikhTamatElement
              ? tarikhTamatElement.value
              : (
                  program.tarikhTamat ||
                  ""
                ),


          tempat:
            tempatElement
              ? tempatElement.value.trim()
              : (
                  program.tempat ||
                  ""
                ),


          /*
           * Penting:
           * Dalam Negara = Negeri sahaja
           * Luar Negara = Negara sahaja
           */

          negeri:
            finalNegeri,


          negara:
            finalNegara,


          penganjur:
            penganjurProgram
              ? penganjurProgram.value
              : (
                  program.penganjur ||
                  ""
                ),


          penganjurLain:
            penganjurLain
              ? penganjurLain.value.trim()
              : (
                  program.penganjurLain ||
                  ""
                ),


          keterangan:
            keteranganElement
              ? keteranganElement.value.trim()
              : (
                  program.keterangan ||
                  ""
                )

        };


        /* =============================================
           DATA CONFIRM
        ============================================= */

        const confirmData = {

          messageId:
            messageId,

          program:
            finalProgram,

          participants:
            result.participants || [],

          secretariat:
            result.secretariat || [],

          attendance:
            attendance

        };


        /* =============================================
           CONFIRM
        ============================================= */

        const confirmed =
          window.confirm(
            "Adakah anda pasti mahu mengesahkan maklumat Program dan kehadiran ini?"
          );


        if (!confirmed) {

          return;

        }


        newButton.disabled =
          true;


        newButton.textContent =
          "MENYIMPAN...";


        showAdminMessage(
          "Maklumat Program sedang disimpan ke database...",
          "info"
        );


        try {

          const saveResult =
            await callAdminProgramApi(
              "admin_confirm_program",
              {
                data:
                  confirmData
              }
            );


          if (
            !saveResult ||
            saveResult.success !== true
          ) {

            console.error(
              "CONFIRM BACKEND RESPONSE:",
              saveResult
            );


            throw new Error(
              saveResult?.error ||
              saveResult?.message ||
              "Maklumat gagal disahkan."
            );

          }


          console.log(
            "PROGRAM CONFIRMED:",
            saveResult
          );


          showAdminMessage(
            "Maklumat Program dan kehadiran berjaya direkodkan ke database.",
            "success"
          );


          newButton.textContent =
            "✓ TELAH DISAHKAN";


          newButton.disabled =
            true;


          /* ===========================================
             BUTTON SELESAI
          =========================================== */

          let finishButton =
            document.getElementById(
              "finishProgramButton"
            );


          if (!finishButton) {

            finishButton =
              document.createElement(
                "button"
              );


            finishButton.type =
              "button";


            finishButton.id =
              "finishProgramButton";


            finishButton.className =
              "finish-program-button";


            finishButton.textContent =
              "SELESAI";


            newButton
              .parentElement
              .appendChild(
                finishButton
              );

          }


          finishButton.addEventListener(
            "click",
            async function () {

              const confirmedFinish =
                window.confirm(
                  "Adakah anda pasti Program ini telah selesai? Selepas ini Program tidak boleh diedit atau dibatalkan."
                );


              if (!confirmedFinish) {

                return;

              }


              finishButton.disabled =
                true;


              finishButton.textContent =
                "MENYELESAIKAN...";


              try {

                const finishResult =
                  await callAdminProgramApi(
                    "admin_program_finish",
                    {
                      messageId:
                        messageId
                    }
                  );


                if (
                  !finishResult ||
                  finishResult.success !== true
                ) {

                  throw new Error(
                    finishResult?.error ||
                    finishResult?.message ||
                    "Program gagal diselesaikan."
                  );

                }


                finishButton.textContent =
                  "✓ SELESAI";


                showAdminMessage(
                  "Program telah selesai.",
                  "success"
                );


                setTimeout(
                  function () {

                    window.location.href =
                      "urus.html";

                  },
                  700
                );


              } catch (error) {

                console.error(
                  "FINISH PROGRAM ERROR:",
                  error
                );


                showAdminMessage(
                  error.message ||
                  "Program gagal diselesaikan.",
                  "error"
                );


                finishButton.disabled =
                  false;


                finishButton.textContent =
                  "SELESAI";

              }

            }
          );


        } catch (error) {

          console.error(
            "CONFIRM PROGRAM ERROR:",
            error
          );


          showAdminMessage(
            error.message ||
            "Maklumat Program gagal disahkan.",
            "error"
          );


          newButton.disabled =
            false;


          newButton.textContent =
            "SAHKAN MAKLUMAT";

        }

      }
    );


    showAdminMessage(
      "Sila semak dan sahkan kehadiran sebenar peserta serta urusetia.",
      "success"
    );


  } catch (error) {

    console.error(
      "LOAD PROGRAM CONFIRM ERROR:",
      error
    );


    showAdminMessage(
      error.message ||
      "Program tidak dapat dimuatkan untuk pengesahan.",
      "error"
    );

  }

}


/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    populateOrganizerDropdown();

    populateCountries();

    updateLocationFields();

    updateOrganizerField();

    updateSelectionUI();


    await loadProgramMembers();


      /* =================================================
   BUTTON SIMPAN DRAF
================================================= */

const saveDraftButton =
  document.getElementById(
    "saveDraftButton"
  );


if (saveDraftButton) {

  saveDraftButton.addEventListener(
    "click",
    async function () {

      const originalText =
        saveDraftButton.textContent;


      try {

        saveDraftButton.disabled =
          true;

        saveDraftButton.textContent =
          "MENYIMPAN DRAF...";


        showAdminMessage(
          "Draf Program sedang disimpan...",
          "info"
        );


        /* =============================================
           PESERTA & URUSETIA
        ============================================= */

        const participants =
          getSelectedMembers(
            selectedParticipants
          );


        const secretariat =
          getSelectedMembers(
            selectedSecretariat
          );


        /* =============================================
           MAKLUMAT PROGRAM
        ============================================= */

        const program = {

          kategoriProgram:
            document
              .getElementById(
                "kategoriProgram"
              )
              .value,

          lokasiProgram:
            document
              .getElementById(
                "lokasiProgram"
              )
              .value,

          perkara:
            document
              .getElementById(
                "perkaraProgram"
              )
              .value
              .trim(),

          tarikhMula:
            document
              .getElementById(
                "tarikhMula"
              )
              .value,

          tarikhTamat:
            document
              .getElementById(
                "tarikhTamat"
              )
              .value,

          tempat:
            document
              .getElementById(
                "tempatProgram"
              )
              .value
              .trim(),

          negeri:
            document
              .getElementById(
                "negeriProgram"
              )
              .value,

          negara:
            document
              .getElementById(
                "negaraProgram"
              )
              .value,

          penganjur:
            document
              .getElementById(
                "penganjurProgram"
              )
              .value,

          penganjurLain:
            document
              .getElementById(
                "penganjurLain"
              )
              .value
              .trim(),

          keterangan:
            document
              .getElementById(
                "keteranganProgram"
              )
              .value
              .trim()

        };


        /*
         * DRAF hanya wajib ada Perkara.
         */

        if (!program.perkara) {

          throw new Error(
            "Sila masukkan Perkara Program sebelum menyimpan Draf."
          );

        }


        const draftData = {

          program:
            program,

          inviteAll:
            selectAllParticipants
              ? selectAllParticipants.checked
              : false,

          participants:
            participants,

          secretariat:
            secretariat,

          existingAttachmentUrl:
            existingProgramAttachmentUrl

        };


        /* =============================================
           LAMPIRAN PDF JIKA ADA
        ============================================= */

        const attachmentFile =
          getProgramAttachmentFile();


        if (attachmentFile) {

          saveDraftButton.textContent =
            "MEMUAT NAIK LAMPIRAN...";


          const uploaded =
            await uploadProgramAttachment(
              attachmentFile
            );


          draftData.lampiran = {

            fileId:
              uploaded.fileId,

            url:
              uploaded.url,

            fileName:
              uploaded.fileName

          };

        }


        /* =============================================
           SIMPAN KE BACKEND
        ============================================= */

        saveDraftButton.textContent =
          "MENYIMPAN DRAF...";


        const result =
          await callAdminProgramApi(
            "admin_program_save_draft",
            {

              messageId:
                isAdminProgramEditMode
                  ? adminProgramEditMessageId
                  : "",

              data:
                draftData

            }
          );


        console.log(
          "SAVE DRAFT RESULT:",
          result
        );


        if (
          !result ||
          result.success !== true
        ) {

          throw new Error(
            result?.error ||
            result?.message ||
            "Draf Program gagal disimpan."
          );

        }


        showAdminMessage(
          "Draf Program berjaya disimpan.",
          "success"
        );


        saveDraftButton.textContent =
          "✓ DRAF DISIMPAN";


        /* =============================================
           PERGI KE URUS.HTML
        ============================================= */

        setTimeout(
          function () {

            window.location.href =
              "urus.html";

          },
          500
        );


      } catch (error) {

        console.error(
          "SAVE PROGRAM DRAFT ERROR:",
          error
        );


        showAdminMessage(
          error.message ||
          "Draf Program gagal disimpan.",
          "error"
        );


        saveDraftButton.disabled =
          false;


        saveDraftButton.textContent =
          originalText;

      }

    }
  );

}
    /* =================================================
       MODE SAHKAN
    ================================================= */

    if (
      isProgramConfirmMode()
    ) {

      await loadProgramConfirmMode();

      return;

    }


    /* =================================================
       MODE EDIT
    ================================================= */

    if (
      typeof isAdminProgramEditMode !==
        "undefined" &&
      isAdminProgramEditMode
    ) {

      await loadAdminProgramEditData();


    }

  }
);