"use strict";


/* =====================================================
   ELEMEN UTAMA
===================================================== */

const profilePhoto =
  document.getElementById("profilePhoto");

const profileName =
  document.getElementById("profileName");

const profilePaspaId =
  document.getElementById("profilePaspaId");

const profileMessage =
  document.getElementById("profileMessage");

const backButton =
  document.getElementById("backButton");

const homeButton =
  document.getElementById("homeButton");

const selectPhotoButton =
  document.getElementById(
    "selectPhotoButton"
  );

const profilePhotoInput =
  document.getElementById(
    "profilePhotoInput"
  );

const uploadPhotoButton =
  document.getElementById(
    "uploadPhotoButton"
  );

  const fitnessHeight =
  document.getElementById(
    "fitnessHeight"
  );

const fitnessWeight =
  document.getElementById(
    "fitnessWeight"
  );

const fitnessBmi =
  document.getElementById(
    "fitnessBmi"
  );

const fitnessBmiCategory =
  document.getElementById(
    "fitnessBmiCategory"
  );

let currentSession = null;
let latestProfileData = null;
let selectedPhotoFile = null;


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
    console.error(
      "Session tidak dapat dibaca:",
      error
    );

    return null;
  }
}


/* =====================================================
   FORMAT NO. KAD PENGENALAN
===================================================== */

function formatNoKP(value) {
  const digits =
    String(value || "")
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
   FORMAT TARIKH UNTUK PAPARAN
===================================================== */

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const text = String(value).trim();

  const isoMatch = text.match(
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

  const localMatch = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (localMatch) {
    return (
      localMatch[1].padStart(2, "0") +
      "/" +
      localMatch[2].padStart(2, "0") +
      "/" +
      localMatch[3]
    );
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return text;
  }

  const day = String(
    date.getUTCDate()
  ).padStart(2, "0");

  const month = String(
    date.getUTCMonth() + 1
  ).padStart(2, "0");

  const year =
    date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}


/* =====================================================
   FORMAT TARIKH UNTUK INPUT DATE
   Format yang diperlukan: YYYY-MM-DD
===================================================== */

function formatDateForInput(value) {
  if (!value) {
    return "";
  }

  const text = String(value).trim();

  /*
   * Format daripada input HTML:
   * YYYY-MM-DD
   */
  const isoMatch = text.match(
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

  /*
   * Format paparan:
   * DD/MM/YYYY
   */
  const localMatch = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (localMatch) {
    return (
      localMatch[3] +
      "-" +
      localMatch[2].padStart(2, "0") +
      "-" +
      localMatch[1].padStart(2, "0")
    );
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  /*
   * Gunakan UTC kerana tarikh daripada
   * Apps Script mungkin dihantar sebagai ISO.
   */
  const year = date.getUTCFullYear();

  const month = String(
    date.getUTCMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getUTCDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* =====================================================
   URL GAMBAR GOOGLE DRIVE
===================================================== */

function createDrivePhotoUrl(fileId) {
  const id =
    String(fileId || "")
      .trim();

  if (!id) {
    return (
      "../images/default-avatar.png"
    );
  }

  return (
    "https://drive.google.com/thumbnail?id=" +
    encodeURIComponent(id) +
    "&sz=w500"
  );
}


/* =====================================================
   SET TEKS
===================================================== */

function setText(id, value) {
  const element =
    document.getElementById(id);

  if (!element) {
    return;
  }

  element.textContent =
    value === null ||
    value === undefined ||
    value === ""
      ? "-"
      : value;
}


/* =====================================================
   SET NILAI INPUT
===================================================== */

function setValue(id, value) {
  const element =
    document.getElementById(id);

  if (!element) {
    return;
  }

  element.value =
    value === null ||
    value === undefined
      ? ""
      : value;
}


/* =====================================================
   ISI DROPDOWN
===================================================== */

function populateDropdown(
  elementId,
  options,
  selectedValue = ""
) {
  const select =
    document.getElementById(
      elementId
    );

  if (!select) {
    return;
  }

  const currentValue =
    String(
      selectedValue || ""
    ).trim();

  select.innerHTML = "";

  const placeholder =
    document.createElement(
      "option"
    );

  placeholder.value = "";

  placeholder.textContent =
    "Sila pilih";

  select.appendChild(
    placeholder
  );

  options.forEach(
    function (item) {
      const option =
        document.createElement(
          "option"
        );

      option.value = item;
      option.textContent = item;

      if (
        item === currentValue
      ) {
        option.selected = true;
      }

      select.appendChild(
        option
      );
    }
  );

  /*
   * Kekalkan nilai sedia ada
   * jika ia belum terdapat
   * dalam senarai dropdown.
   */
  if (
    currentValue &&
    !options.includes(
      currentValue
    )
  ) {
    const existingOption =
      document.createElement(
        "option"
      );

    existingOption.value =
      currentValue;

    existingOption.textContent =
      currentValue +
      " (Nilai Sedia Ada)";

    existingOption.selected =
      true;

    select.appendChild(
      existingOption
    );
  }
}


/* =====================================================
   SEDIAKAN SEMUA DROPDOWN
===================================================== */

function initializeProfileDropdowns(
  profile,
  service,
  sizes
) {
  if (
    typeof PASPA_DROPDOWNS ===
    "undefined"
  ) {
    console.error(
      "PASPA_DROPDOWNS tidak dijumpai. Pastikan dropdown.js dimuatkan sebelum profile.js."
    );

    return;
  }

  populateDropdown(
    "serviceRank",
    PASPA_DROPDOWNS.pangkat,
    profile.pangkat
  );

  populateDropdown(
    "serviceAppointment",
    PASPA_DROPDOWNS
      .tarafLantikan,
    service.tarafLantikan
  );

  populateDropdown(
    "serviceGrade",
    PASPA_DROPDOWNS
      .gredJawatan,
    service.gredJawatan
  );

  populateDropdown(
    "serviceState",
    PASPA_DROPDOWNS
      .negeriBerkhidmat,
    service.negeriBerkhidmat
  );

  populateDropdown(
    "contactState",
    PASPA_DROPDOWNS.negeri,
    profile.negeri
  );

  populateDropdown(
    "fitnessBloodType",
    PASPA_DROPDOWNS
      .jenisDarah,
    profile.jenisDarah
  );

  populateDropdown(
    "clothingTshirt",
    PASPA_DROPDOWNS
      .saizPakaian,
    sizes.tshirt
  );

  populateDropdown(
    "clothingSportPants",
    PASPA_DROPDOWNS
      .saizPakaian,
    sizes.seluarSukan
  );

  populateDropdown(
    "clothingUniform",
    PASPA_DROPDOWNS
      .saizPakaian,
    sizes.uniform
  );

  populateDropdown(
    "clothingBeret",
    PASPA_DROPDOWNS
      .saizPakaian,
    sizes.beret
  );

  populateDropdown(
    "clothingJacket",
    PASPA_DROPDOWNS
      .saizPakaian,
    sizes.jaket
  );

  populateDropdown(
    "clothingBelt",
    PASPA_DROPDOWNS
      .saizPakaian,
    sizes.taliPinggang
  );

  populateDropdown(
    "clothingSportShoes",
    PASPA_DROPDOWNS
      .saizKasut,
    sizes.kasutSukan
  );

  populateDropdown(
    "clothingBoot",
    PASPA_DROPDOWNS
      .saizKasut,
    sizes.boot
  );

  populateDropdown(
  "contactMaritalStatus",
  PASPA_DROPDOWNS
    .tarafPerkahwinan,
  profile.tarafPerkahwinan
);
}


/* =====================================================
   MESEJ SISTEM
===================================================== */

function showProfileMessage(
  message,
  type = "info"
) {
  if (!profileMessage) {
    return;
  }

  profileMessage.textContent =
    message;

  profileMessage.className =
    "message " + type;

  profileMessage.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}


function hideProfileMessage() {
  if (!profileMessage) {
    return;
  }

  profileMessage.textContent =
    "";

  profileMessage.className =
    "message hidden";
}

/* =====================================================
   PENGIRAAN BMI
===================================================== */

function calculateBmi(
  heightCm,
  weightKg
) {
  const height =
    Number(heightCm);

  const weight =
    Number(weightKg);

  if (
    !Number.isFinite(height) ||
    !Number.isFinite(weight) ||
    height <= 0 ||
    weight <= 0
  ) {
    return "";
  }

  const heightMetre =
    height / 100;

  const bmi =
    weight /
    (
      heightMetre *
      heightMetre
    );

  return bmi.toFixed(1);
}


function getBmiCategory(bmiValue) {
  const bmi =
    Number(bmiValue);

  if (!Number.isFinite(bmi)) {
    return "";
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


function updateBmiPreview() {
  if (
    !fitnessHeight ||
    !fitnessWeight ||
    !fitnessBmi
  ) {
    return;
  }

  const bmi =
    calculateBmi(
      fitnessHeight.value,
      fitnessWeight.value
    );

  fitnessBmi.value =
    bmi;

  if (!fitnessBmiCategory) {
    return;
  }

  const category =
    getBmiCategory(bmi);

  fitnessBmiCategory.textContent =
    category;

  fitnessBmiCategory.classList.toggle(
    "hidden",
    !category
  );
}
/* =====================================================
   PAPARKAN DATA PROFIL
===================================================== */

function displayProfileData(
  result
) {
  latestProfileData =
    result;

  const profile =
    result.profile || {};

  const service =
    result.perkhidmatan || {};

  const membership =
    result.keahlianPaspa || {};

  const sizes =
    result.saiz || {};

    const fitness =
  result.kecergasan || {};


  initializeProfileDropdowns(
    profile,
    service,
    sizes
  );


  /* ===================================================
     RINGKASAN AHLI
  =================================================== */

  const rank =
    profile.pangkat || "";

  const name =
    profile.namaPenuh ||
    currentSession.namaAhli ||
    "-";

  if (profileName) {
    profileName.textContent =
      (rank ? rank + " " : "") +
      name;
  }

  if (profilePaspaId) {
    profilePaspaId.textContent =
      "ID PASPA: " +
      (
        profile.idPaspa ||
        currentSession.idPaspa ||
        "-"
      );
  }

  if (
    profilePhoto &&
    profile.fotoFileId
  ) {
    profilePhoto.src =
      createDrivePhotoUrl(
        profile.fotoFileId
      );
  }


  /* ===================================================
     KOTAK 2: MAKLUMAT PERIBADI
  =================================================== */

  setText(
    "profileIc",
    formatNoKP(
      profile.noKadPengenalan
    )
  );

  setText(
    "profileGender",
    profile.jantina
  );

  setText(
    "profileEmail",
    profile.googleEmail ||
    currentSession.googleEmail
  );

  setText(
    "profileBodyNumber",
    service.noBadan
  );

  setText(
    "profileAppointmentDate",
    formatDate(
      membership.tarikhLantikan
    )
  );

  setText(
    "profilePaspaPosition",
    membership.jawatanPaspa
  );


  /* ===================================================
     KOTAK 3: MAKLUMAT PERKHIDMATAN
  =================================================== */

  setValue(
    "serviceRank",
    profile.pangkat
  );

  setValue(
    "serviceAppointment",
    service.tarafLantikan
  );

  setValue(
    "serviceGrade",
    service.gredJawatan
  );

  setValue(
    "servicePaspaAppointmentDate",
    formatDateForInput(
      membership.tarikhLantikan
    )
  );

  setValue(
    "serviceBranch",
    service.cawanganBerkhidmat
  );

  setValue(
    "serviceState",
    service.negeriBerkhidmat
  );


  /* ===================================================
     KOTAK 4: MAKLUMAT PERHUBUNGAN
  =================================================== */

  setValue(
    "contactPhone",
    profile.noTelefon
  );

  setValue(
  "contactEmergencyPhone",
  profile.noTelWaris
);

  setValue(
    "contactAddress",
    profile.alamat
  );

  setValue(
    "contactPostcode",
    profile.poskod
  );

  setValue(
    "contactDistrict",
    profile.daerah
  );

  setValue(
    "contactState",
    profile.negeri
  );

  setValue(
  "contactMaritalStatus",
  profile.tarafPerkahwinan
);


  /* ===================================================
     KOTAK 5: MAKLUMAT KECERGASAN
  =================================================== */

  setValue(
  "fitnessBloodType",
  profile.jenisDarah
);

setValue(
  "fitnessHeight",
  fitness.tinggiCm
);

setValue(
  "fitnessWeight",
  fitness.beratKg
);

setValue(
  "fitnessBmi",
  fitness.bmi
);

updateBmiPreview();


  /* ===================================================
     KOTAK 6: MAKLUMAT PAKAIAN
  =================================================== */

  setValue(
    "clothingTshirt",
    sizes.tshirt
  );

  setValue(
    "clothingSportPants",
    sizes.seluarSukan
  );

  setValue(
    "clothingUniform",
    sizes.uniform
  );

  setValue(
    "clothingBeret",
    sizes.beret
  );

  setValue(
    "clothingJacket",
    sizes.jaket
  );

  setValue(
    "clothingSportShoes",
    sizes.kasutSukan
  );

  setValue(
    "clothingBoot",
    sizes.boot
  );

  setValue(
    "clothingBelt",
    sizes.taliPinggang
  );
}


/* =====================================================
   LOAD PROFILE
===================================================== */

async function loadProfile() {
  currentSession =
    getSession();

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

  hideProfileMessage();

  try {
    const result =
      await apiPost({
        action: "profile",

        email:
          currentSession.googleEmail
      });

    if (
      result.success !== true
    ) {
      throw new Error(
        result.message ||
        "Maklumat profil tidak dapat diperoleh."
      );
    }

    displayProfileData(result);

  } catch (error) {
    console.error(
      "LOAD PROFILE ERROR:",
      error
    );

    showProfileMessage(
      error.message,
      "error"
    );
  }
}


/* =====================================================
   MOD EDIT
===================================================== */

function setSectionEditMode(
  sectionName,
  editing
) {
  const section =
    document.querySelector(
      `[data-section="${sectionName}"]`
    );

  if (!section) {
    return;
  }

  const fields =
    section.querySelectorAll(
      "input, textarea, select"
    );

  const editButton =
    section.querySelector(
      "[data-edit-section]"
    );

  const saveButton =
    section.querySelector(
      "[data-save-section]"
    );

  fields.forEach(
    function (field) {
      field.disabled =
        !editing;
    }
  );

  section.classList.toggle(
    "is-editing",
    editing
  );

  if (editButton) {
    editButton.textContent =
      editing
        ? "Batal"
        : "Edit";
  }

  if (saveButton) {
    saveButton.classList.toggle(
      "hidden",
      !editing
    );
  }
}


/* =====================================================
   BUTANG EDIT / BATAL
===================================================== */

document
  .querySelectorAll(
    "[data-edit-section]"
  )
  .forEach(
    function (button) {
      button.addEventListener(
        "click",
        function () {
          const sectionName =
            button.dataset
              .editSection;

          const section =
            document.querySelector(
              `[data-section="${sectionName}"]`
            );

          if (!section) {
            return;
          }

          const isEditing =
            section.classList
              .contains(
                "is-editing"
              );

          if (
            isEditing &&
            latestProfileData
          ) {
            /*
             * Pulihkan data asal
             * apabila tekan Batal.
             */
            displayProfileData(
              latestProfileData
            );
          }

          setSectionEditMode(
            sectionName,
            !isEditing
          );
        }
      );
    }
  );


/* =====================================================
   DATA UNTUK DISIMPAN
===================================================== */

function getSectionPayload(
  sectionName
) {
  switch (sectionName) {

    case "service":
      return {
        pangkat:
          document
            .getElementById(
              "serviceRank"
            )
            .value
            .trim(),

        tarafLantikan:
          document
            .getElementById(
              "serviceAppointment"
            )
            .value
            .trim(),

        gredJawatan:
          document
            .getElementById(
              "serviceGrade"
            )
            .value
            .trim(),

        tarikhLantikanPaspa:
          document
            .getElementById(
              "servicePaspaAppointmentDate"
            )
            .value,

        cawanganBerkhidmat:
          document
            .getElementById(
              "serviceBranch"
            )
            .value
            .trim(),

        negeriBerkhidmat:
          document
            .getElementById(
              "serviceState"
            )
            .value
            .trim()
      };


    case "contact":
      return {
        noTelefon:
          document
            .getElementById(
              "contactPhone"
            )
            .value
            .trim(),


        noTelWaris:
      document
        .getElementById(
          "contactEmergencyPhone"
        )
        .value
        .trim(),


        alamat:
          document
            .getElementById(
              "contactAddress"
            )
            .value
            .trim(),

        poskod:
          document
            .getElementById(
              "contactPostcode"
            )
            .value
            .trim(),

        daerah:
          document
            .getElementById(
              "contactDistrict"
            )
            .value
            .trim(),

        negeri:
          document
            .getElementById(
              "contactState"
            )
            .value
            .trim(),

            tarafPerkahwinan:
      document
        .getElementById(
          "contactMaritalStatus"
        )
        .value
        .trim()
  };
      


    case "fitness":
  return {
    jenisDarah:
      document
        .getElementById(
          "fitnessBloodType"
        )
        .value,

    tinggiCm:
      document
        .getElementById(
          "fitnessHeight"
        )
        .value,

    beratKg:
      document
        .getElementById(
          "fitnessWeight"
        )
        .value,

    bmi:
      document
        .getElementById(
          "fitnessBmi"
        )
        .value
  };


    case "clothing":
      return {
        saizTshirt:
          document
            .getElementById(
              "clothingTshirt"
            )
            .value
            .trim(),

        saizSeluarSukan:
          document
            .getElementById(
              "clothingSportPants"
            )
            .value
            .trim(),

        saizUniform:
          document
            .getElementById(
              "clothingUniform"
            )
            .value
            .trim(),

        saizBeret:
          document
            .getElementById(
              "clothingBeret"
            )
            .value
            .trim(),

        saizJaket:
          document
            .getElementById(
              "clothingJacket"
            )
            .value
            .trim(),

        saizKasutSukan:
          document
            .getElementById(
              "clothingSportShoes"
            )
            .value
            .trim(),

        saizBoot:
          document
            .getElementById(
              "clothingBoot"
            )
            .value
            .trim(),

        saizTaliPinggang:
          document
            .getElementById(
              "clothingBelt"
            )
            .value
            .trim()
      };


    default:
      return {};
  }
}


/* =====================================================
   SIMPAN PERUBAHAN
===================================================== */

async function saveSection(
  sectionName,
  button
) {
  hideProfileMessage();

  const originalText =
    button.textContent;

  button.disabled = true;

  button.textContent =
    "Menyimpan...";

  try {
    const action =
  sectionName === "fitness"
    ? "update_fitness"
    : "update_profile";

const result =
  await apiPost({
    action: action,

    email:
      currentSession.googleEmail,

    section:
      sectionName,

    data:
      getSectionPayload(
        sectionName
      )
  });

    if (
      result.success !== true
    ) {
      throw new Error(
        result.message ||
        "Maklumat tidak berjaya disimpan."
      );
    }

    setSectionEditMode(
  sectionName,
  false
);

/*
 * Untuk Maklumat Kecergasan,
 * kekalkan nilai yang baru disimpan.
 */
if (
  sectionName === "fitness" &&
  result.kecergasan
) {

  setValue(
    "fitnessHeight",
    result.kecergasan.tinggiCm
  );

  setValue(
    "fitnessWeight",
    result.kecergasan.beratKg
  );

  setValue(
    "fitnessBmi",
    result.kecergasan.bmi
  );

  updateBmiPreview();

} else {

  /*
   * Seksyen lain boleh reload
   * seperti biasa.
   */
  await loadProfile();
}

showProfileMessage(
  result.message ||
  "Maklumat berjaya dikemas kini.",
  "success"
);

  } catch (error) {
    console.error(
      "SAVE PROFILE ERROR:",
      error
    );

    showProfileMessage(
      error.message,
      "error"
    );

  } finally {
    button.disabled = false;

    button.textContent =
      originalText;
  }
}


/* =====================================================
   EVENT BUTANG SIMPAN
===================================================== */

document
  .querySelectorAll(
    "[data-save-section]"
  )
  .forEach(
    function (button) {
      button.addEventListener(
        "click",
        function () {
          saveSection(
            button.dataset
              .saveSection,
            button
          );
        }
      );
    }
  );


/* =====================================================
   PILIH GAMBAR AHLI
===================================================== */

if (
  selectPhotoButton &&
  profilePhotoInput
) {
  selectPhotoButton
    .addEventListener(
      "click",
      function () {
        profilePhotoInput.click();
      }
    );
}


if (profilePhotoInput) {
  profilePhotoInput
    .addEventListener(
      "change",
      function () {
        const file =
          profilePhotoInput
            .files[0];

        if (!file) {
          return;
        }

        const allowedTypes = [
          "image/jpeg",
          "image/png"
        ];

        if (
          !allowedTypes.includes(
            file.type
          )
        ) {
          showProfileMessage(
            "Hanya gambar JPG, JPEG atau PNG dibenarkan.",
            "error"
          );

          profilePhotoInput.value =
            "";

          return;
        }

        const maximumBytes =
          3 * 1024 * 1024;

        if (
          file.size >
          maximumBytes
        ) {
          showProfileMessage(
            "Saiz gambar melebihi 3 MB.",
            "error"
          );

          profilePhotoInput.value =
            "";

          return;
        }

        selectedPhotoFile =
          file;

        const previewUrl =
          URL.createObjectURL(
            file
          );

        if (profilePhoto) {
          profilePhoto.src =
            previewUrl;
        }

        if (uploadPhotoButton) {
          uploadPhotoButton
            .classList
            .remove("hidden");
        }

        hideProfileMessage();
      }
    );
}


/* =====================================================
   TUKAR FAIL KEPADA BASE64
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
              "Gambar tidak dapat dibaca."
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
   UPLOAD GAMBAR AHLI
===================================================== */

if (uploadPhotoButton) {
  uploadPhotoButton
    .addEventListener(
      "click",
      async function () {
        if (
          !selectedPhotoFile
        ) {
          return;
        }

        const originalText =
          uploadPhotoButton
            .textContent;

        uploadPhotoButton
          .disabled = true;

        uploadPhotoButton
          .textContent =
          "Memuat naik...";

        hideProfileMessage();

        try {
          const base64Data =
            await fileToBase64(
              selectedPhotoFile
            );

          const result =
            await apiPost({
              action:
                "upload_member_photo",

              email:
                currentSession
                  .googleEmail,

              fileName:
                selectedPhotoFile
                  .name,

              mimeType:
                selectedPhotoFile
                  .type,

              base64Data:
                base64Data
            });

          if (
            result.success !== true
          ) {
            throw new Error(
              result.message ||
              "Gambar tidak berjaya dimuat naik."
            );
          }

          if (
            profilePhoto &&
            result.photoUrl
          ) {
            profilePhoto.src =
              result.photoUrl +
              "&t=" +
              Date.now();
          }

          selectedPhotoFile =
            null;

          if (profilePhotoInput) {
            profilePhotoInput.value =
              "";
          }

          uploadPhotoButton
            .classList
            .add("hidden");

          await loadProfile();

          showProfileMessage(
            result.message ||
            "Gambar berjaya dikemas kini.",
            "success"
          );

        } catch (error) {
          console.error(
            "UPLOAD PHOTO ERROR:",
            error
          );

          showProfileMessage(
            error.message,
            "error"
          );

        } finally {
          uploadPhotoButton
            .disabled = false;

          uploadPhotoButton
            .textContent =
            originalText;
        }
      }
    );
}


/* =====================================================
   GAMBAR GAGAL DIPAPARKAN
===================================================== */

if (profilePhoto) {
  profilePhoto.addEventListener(
    "error",
    function () {
      profilePhoto.src =
        "../images/default-avatar.png";
    }
  );
}


/* =====================================================
   BUTANG KEMBALI
===================================================== */

if (backButton) {
  backButton.addEventListener(
    "click",
    function () {
      window.history.back();
    }
  );
}


/* =====================================================
   BUTANG HOME
===================================================== */

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
   MULA LOAD PROFILE
===================================================== */
if (fitnessHeight) {
  fitnessHeight.addEventListener(
    "input",
    updateBmiPreview
  );
}

if (fitnessWeight) {
  fitnessWeight.addEventListener(
    "input",
    updateBmiPreview
  );
}
loadProfile();