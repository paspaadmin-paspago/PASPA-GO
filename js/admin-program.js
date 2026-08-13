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
       MAKLUMAT PROGRAM
    ================================================= */

    const kategoriElement =
      document.getElementById(
        "kategoriProgram"
      );

    if (kategoriElement) {
      kategoriElement.value =
        program.kategoriProgram || "";
    }


    const lokasiElement =
      document.getElementById(
        "lokasiProgram"
      );

    if (lokasiElement) {
      lokasiElement.value =
        program.lokasiProgram || "";
    }


    document.getElementById(
      "perkaraProgram"
    ).value =
      program.perkara || "";


    document.getElementById(
      "tarikhMula"
    ).value =
      program.tarikhMula || "";


    document.getElementById(
      "tarikhTamat"
    ).value =
      program.tarikhTamat || "";


    document.getElementById(
      "tempatProgram"
    ).value =
      program.tempat || "";


    /* =================================================
       PENGANJUR
    ================================================= */

    let organizer =
      program.penganjur || "";


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

    document.getElementById(
      "keteranganProgram"
    ).value =
      program.keterangan || "";


    /* =================================================
       LAMPIRAN LAMA
    ================================================= */

    existingProgramAttachmentUrl =
      String(
        program.pautan || ""
      ).trim();


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
       TAJUK / BUTTON
    ================================================= */

    const pageTitle =
      document.querySelector(
        ".program-form-card h1, .program-form-card h2"
      );


    if (pageTitle) {
      pageTitle.textContent =
        "Edit Program";
    }


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


    /*
     * Tunggu senarai ahli siap dahulu.
     * Ini penting untuk mode EDIT supaya
     * checkbox peserta/urusetia lama
     * dapat ditanda dengan betul.
     */

    await loadProgramMembers();


    if (
      isAdminProgramEditMode
    ) {

      await loadAdminProgramEditData();

    }

  }
);