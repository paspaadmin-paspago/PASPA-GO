"use strict";


/* =====================================================
   STATE
===================================================== */

let adminOperationMembers =
  [];


const selectedOperationMembers =
  new Set();



/* =====================================================
   MODE PAGE
===================================================== */

const operationPageParams =
  new URLSearchParams(
    window.location.search
  );


const operationPageMode =
  String(
    operationPageParams.get(
      "mode"
    ) || ""
  ).toLowerCase();


const editingOperationId =
  String(
    operationPageParams.get(
      "operasiId"
    ) || ""
  ).trim();


const isOperationEditMode =
  operationPageMode === "edit" &&
  editingOperationId !== "";

const isOperationFinalMode =
  operationPageMode === "final" &&
  editingOperationId !== "";


/* =====================================================
   ZON UNTUK FILTER ANGGOTA SAHAJA
===================================================== */

const OPERATION_ZONES = {

  "ZON UTARA": [
    "PERLIS",
    "KEDAH",
    "PULAPAU",
    "PULAU PINANG",
    "PERAK"
  ],

  "ZON TENGAH": [
    "SELANGOR",
    "WP KUALA LUMPUR",
    "WP PUTRAJAYA",
    "ALPHA",
    "IPPA",
    "NEGERI SEMBILAN"
  ],

  "ZON SELATAN": [
    "MELAKA",
    "JOHOR",
    "PULAPAS"
  ],

  "ZON TIMUR": [
    "KELANTAN",
    "TERENGGANU",
    "PAHANG",
    "PULAPAT"
  ],

  "ZON SABAH DAN LABUAN": [
    "SABAH",
    "WP LABUAN"
  ],

  "ZON SARAWAK": [
    "SARAWAK"
  ]

};


const OPERATION_COUNTRIES = [
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
   SUSUNAN PANGKAT
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

const memberZoneFilter =
  document.getElementById(
    "memberZoneFilter"
  );


const operationMemberList =
  document.getElementById(
    "operationMemberList"
  );


const operationMemberSearch =
  document.getElementById(
    "operationMemberSearch"
  );


const operationMemberCount =
  document.getElementById(
    "operationMemberCount"
  );


const selectAllOperationMembers =
  document.getElementById(
    "selectAllOperationMembers"
  );


const selectedOperationMemberList =
  document.getElementById(
    "selectedOperationMemberList"
  );


const saveOperationDraftButton =
  document.getElementById(
    "saveOperationDraftButton"
  );


const callOperationButton =
  document.getElementById(
    "callOperationButton"
  );



  const lokasiOperasi =
  document.getElementById(
    "lokasiOperasi"
  );


const negeriOperasiGroup =
  document.getElementById(
    "negeriOperasiGroup"
  );


const negaraOperasiGroup =
  document.getElementById(
    "negaraOperasiGroup"
  );


const negeriOperasi =
  document.getElementById(
    "negeriOperasi"
  );


const negaraOperasi =
  document.getElementById(
    "negaraOperasi"
  );

/* =====================================================
   POPULATE NEGARA OPERASI
===================================================== */

function populateOperationCountries() {

  if (!negaraOperasi) {
    return;
  }


  negaraOperasi.innerHTML =
    '<option value="">-- Pilih Negara --</option>';


  OPERATION_COUNTRIES
    .slice()
    .sort(
      function (a, b) {

        return a.localeCompare(
          b,
          "ms",
          {
            sensitivity:
              "base"
          }
        );

      }
    )
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


        negaraOperasi.appendChild(
          option
        );

      }
    );

}


/* =====================================================
   PAPARAN LOKASI OPERASI
===================================================== */

function updateOperationLocationFields() {

  if (!lokasiOperasi) {
    return;
  }


  const value =
    lokasiOperasi.value;


  if (negeriOperasiGroup) {

    negeriOperasiGroup.hidden =
      value !==
      "Dalam Negara";

  }


  if (negaraOperasiGroup) {

    negaraOperasiGroup.hidden =
      value !==
      "Luar Negara";

  }


  if (
    value !==
      "Dalam Negara" &&
    negeriOperasi
  ) {

    negeriOperasi.value =
      "";

  }


  if (
    value !==
      "Luar Negara" &&
    negaraOperasi
  ) {

    negaraOperasi.value =
      "";

  }

}


/* =====================================================
   EVENT LOKASI OPERASI
===================================================== */

if (lokasiOperasi) {

  lokasiOperasi.addEventListener(
    "change",
    updateOperationLocationFields
  );

}


/* =====================================================
   SESSION EMAIL
===================================================== */

function getAdminOperationEmail() {

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
      "GET ADMIN OPERATION EMAIL ERROR:",
      error
    );


    return "";

  }

}


/* =====================================================
   NORMALIZE
===================================================== */

function normalizeOperationMemberId(
  value
) {

  return String(
    value ?? ""
  ).trim();

}


function normalizeOperationState(
  value
) {

  return String(
    value || ""
  )
    .trim()
    .toUpperCase()
    .replace(
      /^W\.P\.\s*/i,
      "WP "
    )
    .replace(
      /\s+/g,
      " "
    );

}


/* =====================================================
   DISPLAY NAME
===================================================== */

function getOperationMemberDisplayName(
  member
) {

  return (

    String(
      member?.pangkat ||
      ""
    ) +

    " " +

    String(
      member?.namaPenuh ||
      ""
    )

  )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/* =====================================================
   RANK INDEX
===================================================== */

function getOperationRankIndex(
  rank
) {

  const normalizedRank =
    String(
      rank || ""
    )
      .trim()
      .toUpperCase();


  const index =
    PASPA_RANK_ORDER
      .findIndex(
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


/* =====================================================
   SORT MEMBER
===================================================== */

function sortOperationMembers(
  members
) {

  return [
    ...members
  ]
    .sort(
      function (a, b) {

        const rankA =
          getOperationRankIndex(
            a.pangkat
          );


        const rankB =
          getOperationRankIndex(
            b.pangkat
          );


        if (
          rankA !==
          rankB
        ) {

          return (
            rankA -
            rankB
          );

        }


        return String(
          a.namaPenuh || ""
        )
          .localeCompare(
            String(
              b.namaPenuh || ""
            ),
            "ms",
            {
              sensitivity:
                "base"
            }
          );

      }
    );

}


/* =====================================================
   LOAD MEMBERS
===================================================== */

async function loadOperationMembers() {

  if (!operationMemberList) {
    return;
  }


  operationMemberList.innerHTML =
    '<div class="loading-text">Memuatkan senarai ahli...</div>';


  try {

    const result =
      await apiPost({

        action:
          "admin_operation_members",

        email:
          getAdminOperationEmail()

      });


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
          normalizeOperationMemberId(
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
              ).trim(),

            negeriBerkhidmat:
              String(
                member.negeriBerkhidmat || ""
              ).trim(),

            cawanganBerkhidmat:
              String(
                member.cawanganBerkhidmat || ""
              ).trim()

          }
        );

      }
    );


    adminOperationMembers =
      sortOperationMembers(
        Array.from(
          memberMap.values()
        )
      );


    renderOperationMembers();

    updateOperationSelectionUI();


  } catch (error) {

    console.error(
      "LOAD OPERATION MEMBERS ERROR:",
      error
    );


    operationMemberList.innerHTML =
      '<div class="empty-text">Senarai ahli tidak dapat dimuatkan.</div>';


    showAdminOperationMessage(
      error.message ||
      "Senarai ahli tidak dapat dimuatkan.",
      "error"
    );

  }

}


/* =====================================================
   FILTER MEMBER
===================================================== */

function getFilteredOperationMembers() {

  const selectedZone =
    memberZoneFilter
      ? memberZoneFilter.value
      : "SEMUA";


  const keyword =
    String(
      operationMemberSearch
        ? operationMemberSearch.value
        : ""
    )
      .trim()
      .toLowerCase();


  let members =
    adminOperationMembers;


  /* =================================================
     FILTER MENGIKUT ZON
  ================================================= */

  if (
    selectedZone !==
    "SEMUA"
  ) {

    const allowedStates =
      (
        OPERATION_ZONES[
          selectedZone
        ] || []
      )
        .map(
          normalizeOperationState
        );


    members =
      members.filter(
        function (member) {

          const state =
            normalizeOperationState(
              member.negeriBerkhidmat
            );


          return (
            allowedStates.includes(
              state
            )
          );

        }
      );

  }


  /* =================================================
     SEARCH
  ================================================= */

  if (keyword) {

    members =
      members.filter(
        function (member) {

          const searchText =
            [

              member.idPaspa,
              member.pangkat,
              member.namaPenuh,
              member.negeriBerkhidmat,
              member.cawanganBerkhidmat

            ]
              .join(" ")
              .toLowerCase();


          return searchText.includes(
            keyword
          );

        }
      );

  }


  return sortOperationMembers(
    members
  );

}


/* =====================================================
   CREATE MEMBER OPTION
===================================================== */

function createOperationMemberOption(
  member
) {

  const memberId =
    normalizeOperationMemberId(
      member.idPaspa
    );


  const label =
    document.createElement(
      "label"
    );


  label.className =
    "member-item";


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
    selectedOperationMembers
      .has(
        memberId
      );


  const info =
    document.createElement(
      "div"
    );


  info.className =
    "member-info";


  const name =
    document.createElement(
      "div"
    );


  name.className =
    "member-name";


  name.textContent =
    getOperationMemberDisplayName(
      member
    );


  const meta =
    document.createElement(
      "div"
    );


  meta.className =
    "member-meta";


  meta.textContent =
    "ID PASPA: " +
    memberId +
    " | " +
    (
      member.negeriBerkhidmat ||
      "-"
    );


  info.appendChild(
    name
  );


  info.appendChild(
    meta
  );


  checkbox.addEventListener(
    "change",
    function () {

      if (
        checkbox.checked
      ) {

        selectedOperationMembers.add(
          memberId
        );


        label.classList.add(
          "selected"
        );

      } else {

        selectedOperationMembers.delete(
          memberId
        );


        label.classList.remove(
          "selected"
        );

      }


      updateOperationSelectionUI();

    }
  );


  if (
    checkbox.checked
  ) {

    label.classList.add(
      "selected"
    );

  }


  label.appendChild(
    checkbox
  );


  label.appendChild(
    info
  );


  return label;

}


/* =====================================================
   RENDER MEMBER
===================================================== */

function renderOperationMembers() {

  if (!operationMemberList) {
    return;
  }


  const members =
    getFilteredOperationMembers();


  operationMemberList.innerHTML =
    "";


  if (!members.length) {

    operationMemberList.innerHTML =
      '<div class="empty-text">Tiada ahli ditemui dalam pilihan ini.</div>';


    updateOperationSelectionUI();

    return;

  }


  members.forEach(
    function (member) {

      operationMemberList.appendChild(
        createOperationMemberOption(
          member
        )
      );

    }
  );


  updateOperationSelectionUI();

}


/* =====================================================
   GET SELECTED MEMBERS
===================================================== */

function getSelectedOperationMembers() {

  return sortOperationMembers(

    adminOperationMembers.filter(
      function (member) {

        return (
          selectedOperationMembers
            .has(
              normalizeOperationMemberId(
                member.idPaspa
              )
            )
        );

      }
    )

  );

}


/* =====================================================
   RENDER SELECTED MEMBERS
===================================================== */

function renderSelectedOperationMembers() {

  if (!selectedOperationMemberList) {
    return;
  }


  selectedOperationMemberList.innerHTML =
    "";


  const members =
    getSelectedOperationMembers();


  if (!members.length) {

    selectedOperationMemberList.innerHTML =
      '<div class="empty-text">Tiada anggota dipilih.</div>';

    return;

  }


  members.forEach(
    function (
      member,
      index
    ) {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "selected-member-item";


      const name =
        document.createElement(
          "div"
        );


      name.className =
        "selected-member-name";


      name.textContent =
        (
          index + 1
        ) +
        ". " +
        getOperationMemberDisplayName(
          member
        ) +
        " | ID " +
        member.idPaspa;


      const removeButton =
        document.createElement(
          "button"
        );


      removeButton.type =
        "button";


      removeButton.className =
        "remove-member-button";


      removeButton.textContent =
        "BUANG";


      removeButton.addEventListener(
        "click",
        function () {

          selectedOperationMembers.delete(
            normalizeOperationMemberId(
              member.idPaspa
            )
          );


          renderOperationMembers();

          updateOperationSelectionUI();

        }
      );


      row.appendChild(
        name
      );


      row.appendChild(
        removeButton
      );


      selectedOperationMemberList
        .appendChild(
          row
        );

    }
  );

}


/* =====================================================
   UPDATE SELECTION UI
===================================================== */

function updateOperationSelectionUI() {

  if (operationMemberCount) {

    operationMemberCount.textContent =
      selectedOperationMembers.size +
      " dipilih";

  }


  const visibleMembers =
    getFilteredOperationMembers();


  const visibleIds =
    visibleMembers.map(
      function (member) {

        return normalizeOperationMemberId(
          member.idPaspa
        );

      }
    );


  const selectedVisibleCount =
    visibleIds.filter(
      function (id) {

        return selectedOperationMembers.has(
          id
        );

      }
    ).length;


  if (
    selectAllOperationMembers
  ) {

    if (
      visibleIds.length > 0 &&
      selectedVisibleCount ===
        visibleIds.length
    ) {

      selectAllOperationMembers.checked =
        true;

      selectAllOperationMembers.indeterminate =
        false;

    } else if (
      selectedVisibleCount > 0
    ) {

      selectAllOperationMembers.checked =
        false;

      selectAllOperationMembers.indeterminate =
        true;

    } else {

      selectAllOperationMembers.checked =
        false;

      selectAllOperationMembers.indeterminate =
        false;

    }

  }


  renderSelectedOperationMembers();

}


/* =====================================================
   SELECT ALL CURRENT FILTER
===================================================== */

if (
  selectAllOperationMembers
) {

  selectAllOperationMembers
    .addEventListener(
      "change",
      function () {

        const visibleMembers =
          getFilteredOperationMembers();


        if (
          selectAllOperationMembers.checked
        ) {

          visibleMembers.forEach(
            function (member) {

              selectedOperationMembers.add(
                normalizeOperationMemberId(
                  member.idPaspa
                )
              );

            }
          );

        } else {

          visibleMembers.forEach(
            function (member) {

              selectedOperationMembers.delete(
                normalizeOperationMemberId(
                  member.idPaspa
                )
              );

            }
          );

        }


        renderOperationMembers();

        updateOperationSelectionUI();

      }
    );

}


/* =====================================================
   FILTER ZON MEMBER
===================================================== */

if (memberZoneFilter) {

  memberZoneFilter.addEventListener(
    "change",
    function () {

      renderOperationMembers();

    }
  );

}


/* =====================================================
   SEARCH MEMBER
===================================================== */

if (
  operationMemberSearch
) {

  operationMemberSearch.addEventListener(
    "input",
    function () {

      renderOperationMembers();

    }
  );

}


/* =====================================================
   MESSAGE
===================================================== */

function showAdminOperationMessage(
  message,
  type
) {

  const box =
    document.getElementById(
      "adminOperasiMessage"
    );


  if (!box) {
    return;
  }


  box.textContent =
    message || "";


  box.className =
    "message-box " +
    (
      type || ""
    );


  box.hidden =
    false;


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =====================================================
   LOAD EDIT DRAF
===================================================== */

async function loadOperationEditData() {

  if (
    !isOperationEditMode &&
    !isOperationFinalMode
  ) {
    return;
  }


  try {

    const result =
      await apiPost({

        action:
          "admin_operation_edit_data",

        email:
          getAdminOperationEmail(),

        operasiId:
          editingOperationId

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Data Operasi tidak dapat dimuatkan."
      );

    }


    const operation =
      result.operation || {};


    /* =================================================
       RESTORE LOKASI / NEGERI / NEGARA
    ================================================= */

    const savedCountry =
      String(
        operation.negara || ""
      ).trim();


    const savedState =
      String(
        operation.negeri || ""
      ).trim();


    let savedLocation =
      String(
        operation.lokasiOperasi || ""
      ).trim();


    if (!savedLocation) {

      savedLocation =
        savedCountry
          ? "Luar Negara"
          : "Dalam Negara";

    }


    if (lokasiOperasi) {

      lokasiOperasi.value =
        savedLocation;

    }


    updateOperationLocationFields();


    if (
      savedLocation ===
      "Dalam Negara"
    ) {

      if (negeriOperasi) {

        negeriOperasi.value =
          savedState;

      }


      if (negaraOperasi) {

        negaraOperasi.value =
          "";

      }

    }


    if (
      savedLocation ===
      "Luar Negara"
    ) {

      if (negaraOperasi) {

        negaraOperasi.value =
          savedCountry;

      }


      if (negeriOperasi) {

        negeriOperasi.value =
          "";

      }

    }


    document.getElementById(
      "kategoriOperasi"
    ).value =
      operation.kategoriOperasi || "";


    document.getElementById(
      "jenisKejadian"
    ).value =
      operation.jenisKejadian || "";


    document.getElementById(
      "perkaraOperasi"
    ).value =
      operation.perkara || "";


    document.getElementById(
      "tarikhMulaOperasi"
    ).value =
      operation.tarikhMula || "";


    const masaMulaField =
      document.getElementById(
        "masaMulaOperasi"
      );


    if (masaMulaField) {

      masaMulaField.value =
        operation.masaMula || "";

    }


    const tarikhTamatField =
      document.getElementById(
        "tarikhTamatOperasi"
      );


    if (tarikhTamatField) {

      tarikhTamatField.value =
        operation.tarikhTamat || "";

    }


    const masaTamatField =
      document.getElementById(
        "masaTamatOperasi"
      );


    if (masaTamatField) {

      masaTamatField.value =
        operation.masaTamat || "";

    }


    document.getElementById(
      "tempatOperasi"
    ).value =
      operation.tempat || "";


    document.getElementById(
      "liveLocationOperasi"
    ).value =
      operation.liveLocation || "";


    document.getElementById(
      "catatanOperasi"
    ).value =
      operation.catatan || "";


    /* =================================================
       RESTORE ANGGOTA DIPILIH
    ================================================= */

    selectedOperationMembers.clear();


    const ids =
      Array.isArray(
        result.selectedMemberIds
      )
        ? result.selectedMemberIds
        : [];


    ids.forEach(
      function (idPaspa) {

        selectedOperationMembers.add(
          normalizeOperationMemberId(
            idPaspa
          )
        );

      }
    );


    renderOperationMembers();

    updateOperationSelectionUI();


    showAdminOperationMessage(
      isOperationFinalMode
        ? "Semakan akhir Operasi. Sila periksa dan kemaskini maklumat sebelum tekan SELESAI."
        : "Maklumat Operasi sedia ada telah dimuatkan. Anda boleh membuat perubahan.",
      "success"
    );


  } catch (error) {

    console.error(
      "LOAD OPERATION EDIT DATA ERROR:",
      error
    );


    showAdminOperationMessage(
      error.message ||
      "Draf Operasi tidak dapat dimuatkan.",
      "error"
    );

  }

}

/* =====================================================
   SIMPAN DRAF
===================================================== */

if (
  saveOperationDraftButton
) {

  saveOperationDraftButton.addEventListener(
    "click",
    async function () {

      const kategoriOperasi =
        document.getElementById(
          "kategoriOperasi"
        );


      const jenisKejadian =
        document.getElementById(
          "jenisKejadian"
        );


      const perkaraOperasi =
        document.getElementById(
          "perkaraOperasi"
        );


      const tarikhMulaOperasi =
        document.getElementById(
          "tarikhMulaOperasi"
        );


      const masaMulaOperasi =
        document.getElementById(
          "masaMulaOperasi"
        );


      const tarikhTamatOperasi =
        document.getElementById(
          "tarikhTamatOperasi"
        );


      const masaTamatOperasi =
        document.getElementById(
          "masaTamatOperasi"
        );


      const tempatOperasi =
        document.getElementById(
          "tempatOperasi"
        );


      const negeriOperasi =
        document.getElementById(
          "negeriOperasi"
        );


      const liveLocationOperasi =
        document.getElementById(
          "liveLocationOperasi"
        );


      const catatanOperasi =
        document.getElementById(
          "catatanOperasi"
        );


      /* =================================================
         VALIDASI
      ================================================= */

      if (
        !kategoriOperasi.value
      ) {

        showAdminOperationMessage(
          "Sila pilih Kategori Operasi.",
          "error"
        );

        return;

      }


      if (
        !jenisKejadian.value
      ) {

        showAdminOperationMessage(
          "Sila pilih Jenis Kejadian.",
          "error"
        );

        return;

      }


      if (
        !perkaraOperasi.value.trim()
      ) {

        showAdminOperationMessage(
          "Sila masukkan Perkara Operasi.",
          "error"
        );

        return;

      }


      if (
        !tarikhMulaOperasi.value
      ) {

        showAdminOperationMessage(
          "Sila pilih Tarikh Mula.",
          "error"
        );

        return;

      }


      if (
        !masaMulaOperasi ||
        !masaMulaOperasi.value
      ) {

        showAdminOperationMessage(
          "Sila pilih Masa Mula.",
          "error"
        );

        return;

      }


      if (
        !tempatOperasi.value.trim()
      ) {

        showAdminOperationMessage(
          "Sila masukkan Tempat / Lokasi Operasi.",
          "error"
        );

        return;

      }


      if (
  !lokasiOperasi.value
) {

  showAdminOperationMessage(
    "Sila pilih Lokasi Operasi.",
    "error"
  );

  return;

}


if (
  lokasiOperasi.value === "Dalam Negara" &&
  !negeriOperasi.value
) {

  showAdminOperationMessage(
    "Sila pilih Negeri Operasi.",
    "error"
  );

  return;

}


if (
  lokasiOperasi.value === "Luar Negara" &&
  !negaraOperasi.value
) {

  showAdminOperationMessage(
    "Sila pilih Negara Operasi.",
    "error"
  );

  return;

}


      const selectedMembers =
        getSelectedOperationMembers();


      if (
        !selectedMembers.length
      ) {

        showAdminOperationMessage(
          "Sila pilih sekurang-kurangnya seorang anggota.",
          "error"
        );

        return;

      }


      /* =================================================
         DATA OPERASI

         PENTING:
         TIDAK ADA zonOperasi.
         Filter zon hanya digunakan untuk mencari anggota.
      ================================================= */

      const data = {

        kategoriOperasi:
          kategoriOperasi.value,

        jenisKejadian:
          jenisKejadian.value,

        perkara:
          perkaraOperasi.value.trim(),

        tarikhMula:
          tarikhMulaOperasi.value,

        masaMula:
          masaMulaOperasi
            ? masaMulaOperasi.value
            : "",

        /*
         * CREATE / EDIT:
         * Tarikh & masa tamat tidak wajib.
         * Nilai tamat hanya digunakan dalam FINAL.
         */
        tarikhTamat:
          isOperationFinalMode &&
          tarikhTamatOperasi
            ? tarikhTamatOperasi.value
            : "",

        masaTamat:
          isOperationFinalMode &&
          masaTamatOperasi
            ? masaTamatOperasi.value
            : "",

        tempat:
          tempatOperasi.value.trim(),

lokasiOperasi:
  lokasiOperasi.value,


       negeri:
  lokasiOperasi.value === "Dalam Negara"
    ? negeriOperasi.value
    : "",

    negara:
  lokasiOperasi.value === "Luar Negara"
    ? negaraOperasi.value
    : "",

        liveLocation:
          liveLocationOperasi.value.trim(),

        catatan:
          catatanOperasi.value.trim()

      };


      const memberIds =
        selectedMembers.map(
          function (member) {

            return member.idPaspa;

          }
        );


      const originalText =
        saveOperationDraftButton.textContent;


      saveOperationDraftButton.disabled =
        true;


      saveOperationDraftButton.textContent =
        "MENYIMPAN...";


      try {

        const result =
  await apiPost({

    action:
      isOperationEditMode
        ? "admin_operation_update_draft"
        : "admin_operation_draft",

    email:
      getAdminOperationEmail(),

    operasiId:
      isOperationEditMode
        ? editingOperationId
        : "",

    data:
      data,

    selectedMemberIds:
      memberIds

  });


        if (
          !result ||
          result.success !== true
        ) {

          throw new Error(
            result?.message ||
            "Draf Operasi gagal disimpan."
          );

        }


        showAdminOperationMessage(
          "Draf Operasi berjaya disimpan.",
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
          "SAVE ADMIN OPERATION DRAFT ERROR:",
          error
        );


        showAdminOperationMessage(
          error.message ||
          "Draf Operasi gagal disimpan.",
          "error"
        );


        saveOperationDraftButton.disabled =
          false;


        saveOperationDraftButton.textContent =
          originalText;

      }

    }
  );

}



/* =====================================================
   BUILD DATA REVIEW OPERASI
===================================================== */

function buildOperationReviewData() {

  const kategoriOperasi =
    document.getElementById(
      "kategoriOperasi"
    ).value;


  const jenisKejadian =
    document.getElementById(
      "jenisKejadian"
    ).value;


  const perkara =
    document.getElementById(
      "perkaraOperasi"
    ).value.trim();


  const tarikhMula =
    document.getElementById(
      "tarikhMulaOperasi"
    ).value;


  const masaMula =
    document.getElementById(
      "masaMulaOperasi"
    ).value;


  const tarikhTamat =
    document.getElementById(
      "tarikhTamatOperasi"
    ).value;


  const masaTamat =
    document.getElementById(
      "masaTamatOperasi"
    ).value;


  const tempat =
    document.getElementById(
      "tempatOperasi"
    ).value.trim();


const lokasi =
  document.getElementById(
    "lokasiOperasi"
  ).value;


const negeri =
  document.getElementById(
    "negeriOperasi"
  ).value;


const negara =
  document.getElementById(
    "negaraOperasi"
  ).value;



  const liveLocation =
    document.getElementById(
      "liveLocationOperasi"
    ).value.trim();


  const catatan =
    document.getElementById(
      "catatanOperasi"
    ).value.trim();


  const members =
    getSelectedOperationMembers();


  if (!kategoriOperasi) {

    throw new Error(
      "Sila pilih Kategori Operasi."
    );

  }


  if (!jenisKejadian) {

    throw new Error(
      "Sila pilih Jenis Kejadian."
    );

  }


  if (!perkara) {

    throw new Error(
      "Sila masukkan Perkara Operasi."
    );

  }


  if (!tarikhMula) {

    throw new Error(
      "Sila pilih Tarikh Mula."
    );

  }


  if (!masaMula) {

    throw new Error(
      "Sila pilih Masa Mula."
    );

  }


  if (isOperationFinalMode) {

    if (!tarikhTamat) {

      throw new Error(
        "Tarikh Tamat diperlukan sebelum Operasi diselesaikan."
      );

    }


    if (!masaTamat) {

      throw new Error(
        "Masa Tamat diperlukan sebelum Operasi diselesaikan."
      );

    }

  }


  if (!tempat) {

    throw new Error(
      "Sila masukkan Tempat / Lokasi Operasi."
    );

  }


if (!lokasi) {

  throw new Error(
    "Sila pilih Lokasi Operasi."
  );

}


if (
  lokasi === "Dalam Negara" &&
  !negeri
) {

  throw new Error(
    "Sila pilih Negeri Operasi."
  );

}


if (
  lokasi === "Luar Negara" &&
  !negara
) {

  throw new Error(
    "Sila pilih Negara Operasi."
  );

}


  if (!members.length) {

    throw new Error(
      "Sila pilih sekurang-kurangnya seorang anggota."
    );

  }


  if (
    tarikhTamat &&
    tarikhTamat < tarikhMula
  ) {

    throw new Error(
      "Tarikh Tamat tidak boleh lebih awal daripada Tarikh Mula."
    );

  }


  return {

    mode:
      isOperationFinalMode
        ? "final"
        : isOperationEditMode
          ? "edit"
          : "create",

    operasiId:
      (
        isOperationEditMode ||
        isOperationFinalMode
      )
        ? editingOperationId
        : "",

    operation: {

      kategoriOperasi:
        kategoriOperasi,


        lokasiOperasi:
  lokasi,

negeri:
  lokasi === "Dalam Negara"
    ? negeri
    : "",

negara:
  lokasi === "Luar Negara"
    ? negara
    : "",

      jenisKejadian:
        jenisKejadian,

      perkara:
        perkara,

      tarikhMula:
        tarikhMula,

      masaMula:
        masaMula,

      tarikhTamat:
        tarikhTamat,

      masaTamat:
        masaTamat,

      tempat:
        tempat,

      liveLocation:
        liveLocation,

      catatan:
        catatan

    },

    members:
      members,

    preparedAt:
      new Date().toISOString()

  };

}


/* =====================================================
   NO RUJUKAN OPERASI
===================================================== */

function getOperationReference() {

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
    "PASPA/OPERASI/" +
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
   BUTTON PANGGIL

   JIKA BELUM SIMPAN DRAF:
   → CIPTA DRAF SECARA AUTOMATIK
   → DAPAT OPERASI_ID
   → BUKA REVIEW

   JIKA MODE EDIT:
   → UPDATE DRAF
   → BUKA REVIEW
===================================================== */

if (
  callOperationButton
) {

  callOperationButton.addEventListener(
    "click",
    async function () {

      const originalText =
        callOperationButton.textContent;


      /* =============================================
         MODE FINAL → SELESAI
         HANYA SELEPAS STAND DOWN
      ============================================= */

      if (isOperationFinalMode) {

        try {

          const reviewData =
            buildOperationReviewData();


          const selectedMembers =
            Array.isArray(reviewData.members)
              ? reviewData.members
              : [];


          const memberIds =
            selectedMembers.map(
              function (member) {
                return member.idPaspa;
              }
            );


          if (!memberIds.length) {
            throw new Error(
              "Sila pilih sekurang-kurangnya seorang anggota yang terlibat."
            );
          }


          callOperationButton.disabled =
            true;


          callOperationButton.textContent =
            "MENYIMPAN...";


          const result =
            await apiPost({

              action:
                "admin_operation_finalize",

              email:
                getAdminOperationEmail(),

              operasiId:
                editingOperationId,

              data:
                reviewData.operation,

              selectedMemberIds:
                memberIds

            });


          if (
            !result ||
            result.success !== true
          ) {

            throw new Error(
              result?.message ||
              "Operasi gagal diselesaikan."
            );

          }


          window.location.replace(
            "urus.html"
          );


        } catch (error) {

          console.error(
            "FINALIZE OPERATION ERROR:",
            error
          );


          showAdminOperationMessage(
            error.message ||
            "Operasi gagal diselesaikan.",
            "error"
          );


          callOperationButton.disabled =
            false;


          callOperationButton.textContent =
            "SELESAI";

        }


        return;

      }


      try {

        /* =============================================
           1. BINA DATA REVIEW + VALIDASI
        ============================================= */

        const reviewData =
          buildOperationReviewData();


        const selectedMembers =
          Array.isArray(
            reviewData.members
          )
            ? reviewData.members
            : [];


        const memberIds =
          selectedMembers.map(
            function (member) {

              return member.idPaspa;

            }
          );


        if (!memberIds.length) {

          throw new Error(
            "Sila pilih sekurang-kurangnya seorang anggota."
          );

        }


        /* =============================================
           2. LOCK BUTTON
        ============================================= */

        callOperationButton.disabled =
          true;


        callOperationButton.textContent =
          "MEMPROSES...";


        /* =============================================
           3. SIMPAN / UPDATE DATABASE DAHULU
        ============================================= */

        let saveResult;


        if (
          isOperationEditMode
        ) {

          /* ===========================================
             MODE EDIT
             UPDATE OPERASI SEDIA ADA
          =========================================== */

          saveResult =
            await apiPost({

              action:
                "admin_operation_update_draft",

              email:
                getAdminOperationEmail(),

              operasiId:
                editingOperationId,

              data:
                reviewData.operation,

              selectedMemberIds:
                memberIds

            });

        } else {

          /* ===========================================
             MODE BARU
             CIPTA DRAF AUTOMATIK
          =========================================== */

          saveResult =
            await apiPost({

              action:
                "admin_operation_draft",

              email:
                getAdminOperationEmail(),

              data:
                reviewData.operation,

              selectedMemberIds:
                memberIds

            });

        }


        /* =============================================
           4. SEMAK RESULT
        ============================================= */

        if (
          !saveResult ||
          saveResult.success !== true
        ) {

          throw new Error(
            saveResult?.message ||
            "Maklumat Operasi gagal disimpan."
          );

        }


        /* =============================================
           5. DAPAT OPERASI_ID

           EDIT → guna ID lama
           BARU → guna ID yang backend baru cipta
        ============================================= */

        const operasiId =
          isOperationEditMode

            ? editingOperationId

            : String(
                saveResult.operasiId ||
                ""
              ).trim();


        if (!operasiId) {

          throw new Error(
            "OPERASI_ID gagal diwujudkan."
          );

        }


        /* =============================================
           6. MASUKKAN OPERASI_ID KE REVIEW
        ============================================= */

        reviewData.operasiId =
          operasiId;


        reviewData.mode =
          "edit";


        reviewData.noRujukan =
          getOperationReference();


        /* =============================================
           7. SIMPAN DATA REVIEW
        ============================================= */

        localStorage.setItem(

          "paspaOperationReviewDraft",

          JSON.stringify(
            reviewData
          )

        );


        /* =============================================
           8. BUKA MEMO REVIEW
        ============================================= */

        window.location.href =
          "admin-operasi-review.html";


      } catch (error) {

        console.error(
          "OPERATION CALL REVIEW ERROR:",
          error
        );


        showAdminOperationMessage(

          error.message ||
          "Panggilan Operasi tidak dapat diproses.",

          "error"

        );


        callOperationButton.disabled =
          false;


        callOperationButton.textContent =
          originalText;

      }

    }
  );

}


/* =========================================================
   PAPARAN TARIKH / MASA TAMAT MENGIKUT MODE
========================================================= */

function setupEndDateTimeByMode() {

  const endGroup =
    document.getElementById(
      "tarikhTamatGroup"
    );


  const tarikhTamat =
    document.getElementById(
      "tarikhTamatOperasi"
    );


  const masaTamat =
    document.getElementById(
      "masaTamatOperasi"
    );


  if (
    !endGroup ||
    !tarikhTamat ||
    !masaTamat
  ) {

    return;

  }


  /* =====================================================
     FINAL / SAHKAN
  ===================================================== */

  if (isOperationFinalMode) {

    endGroup.hidden =
      false;

    endGroup.style.display =
      "";

    tarikhTamat.required =
      true;

    masaTamat.required =
      true;

    return;

  }


  /* =====================================================
     CREATE / EDIT
  ===================================================== */

  endGroup.hidden =
    true;

  endGroup.style.display =
    "none";

  tarikhTamat.required =
    false;

  masaTamat.required =
    false;

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
  async function () {

    populateOperationCountries();

    updateOperationLocationFields();

    setupEndDateTimeByMode();

    await loadOperationMembers();


    if (
      isOperationEditMode ||
      isOperationFinalMode
    ) {

      await loadOperationEditData();

    }


    /* =================================================
       MODE FINAL
       Selepas STAND DOWN → SAHKAN → page ini
    ================================================= */

    if (isOperationFinalMode) {

      if (saveOperationDraftButton) {
        saveOperationDraftButton.style.display =
          "none";
      }


      if (callOperationButton) {
        callOperationButton.textContent =
          "SELESAI";
      }

    }

  }
);
