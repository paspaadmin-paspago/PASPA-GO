
"use strict";

/* ==========================================
   PASPA GO - EDARAN & HEBAHAN
   FASA 1: ANTARA MUKA
========================================== */

const MAX_EDARAN_FILE_SIZE =
  3 * 1024 * 1024;

const edaranListSection =
  document.getElementById(
    "edaranListSection"
  );

const edaranFormSection =
  document.getElementById(
    "edaranFormSection"
  );

const edaranDetailSection =
  document.getElementById(
    "edaranDetailSection"
  );

const edaranForm =
  document.getElementById(
    "edaranForm"
  );

const edaranEditor =
  document.getElementById(
    "edaranEditor"
  );

const edaranAttachment =
  document.getElementById(
    "edaranAttachment"
  );

const edaranInlineImage =
  document.getElementById(
    "edaranInlineImage"
  );

const edaranMessage =
  document.getElementById(
    "edaranMessage"
  );

const edaranDetailBody =
  document.getElementById(
    "edaranDetailBody"
  );

const edaranOwnerActions =
  document.getElementById(
    "edaranOwnerActions"
  );

let currentEdaranItem = null;

let editingEdaranId = null;

let edaranSavedSelection = null;




/* ==========================================
   NAVIGASI
========================================== */

document.getElementById(
  "edaranBackButton"
).addEventListener(
  "click",
  function () {
    window.location.href =
      "dashboard.html";
  }
);

document.getElementById(
  "edaranHomeButton"
).addEventListener(
  "click",
  function () {
    window.location.href =
      "dashboard.html";
  }
);


/* ==========================================
   MESEJ
========================================== */

function showEdaranMessage(
  text,
  isError = false
) {

  edaranMessage.textContent = text;

  edaranMessage.className =
    "edaran-message" +
    (isError ? " error" : "");

  edaranMessage.hidden = false;

}


/* ==========================================
   PAPARAN SEKSYEN
========================================== */

function showEdaranSection(section) {

  edaranListSection.hidden =
    section !== "list";

  edaranFormSection.hidden =
    section !== "form";

  edaranDetailSection.hidden =
    section !== "detail";

  edaranMessage.hidden = true;

  window.scrollTo(0, 0);

}


/* ==========================================
   BORANG BAHARU
========================================== */

document.getElementById(
  "edaranAddButton"
).addEventListener(
  "click",
  function () {

    // Pastikan ini mod EDARAN BAHARU
    editingEdaranId = null;

    currentEdaranItem = null;

    // Kosongkan borang
    edaranForm.reset();

    edaranEditor.innerHTML = "";

    edaranSavedSelection = null;






    document.getElementById(
      "edaranAttachmentInfo"
    ).textContent = "";

    // Tajuk borang
    document.getElementById(
      "edaranFormTitle"
    ).textContent =
      "Edaran Baharu";

    // Tukar semula butang kepada Hantar
    document.getElementById(
      "edaranSubmitButton"
    ).textContent =
      "Hantar";

    // Buka borang
    showEdaranSection("form");

  }
);


/* ==========================================
   BATAL
========================================== */

document.getElementById(
  "edaranCancelButton"
).addEventListener(
  "click",
function () {

  editingEdaranId = null;

  currentEdaranItem = null;

  edaranForm.reset();

  edaranEditor.innerHTML = "";

  edaranSavedSelection = null;

  document.getElementById(
    "edaranFormTitle"
  ).textContent =
    "Edaran Baharu";

  document.getElementById(
    "edaranSubmitButton"
  ).textContent =
    "Hantar";

  showEdaranSection("list");

}
);


/* ==========================================
   SIMPAN PILIHAN TEKS
========================================== */

function saveEdaranSelection() {

  const selection =
    window.getSelection();

  if (
    selection &&
    selection.rangeCount > 0 &&
    edaranEditor.contains(
      selection.anchorNode
    )
  ) {

    edaranSavedSelection =
      selection.getRangeAt(0)
        .cloneRange();

  }

}

function restoreEdaranSelection() {

  if (!edaranSavedSelection) {
    return;
  }

  const selection =
    window.getSelection();

  selection.removeAllRanges();

  selection.addRange(
    edaranSavedSelection
  );

  edaranEditor.focus();

}

edaranEditor.addEventListener(
  "mouseup",
  saveEdaranSelection
);

edaranEditor.addEventListener(
  "keyup",
  saveEdaranSelection
);


/* ==========================================
   FORMAT TEKS
========================================== */

function runEdaranCommand(
  command,
  value = null
) {

  restoreEdaranSelection();

  edaranEditor.focus();

  document.execCommand(
    command,
    false,
    value
  );

  saveEdaranSelection();

}

document.querySelectorAll(
  ".edaran-toolbar [data-command]"
).forEach(
  function (button) {

    button.addEventListener(
      "mousedown",
      function (event) {
        event.preventDefault();
      }
    );

    button.addEventListener(
      "click",
      function () {

        runEdaranCommand(
          button.dataset.command
        );

      }
    );

  }
);

document.getElementById(
  "edaranFontName"
).addEventListener(
  "change",
  function (event) {

    runEdaranCommand(
      "fontName",
      event.target.value
    );

  }
);

document.getElementById(
  "edaranFontColor"
).addEventListener(
  "input",
  function (event) {

    runEdaranCommand(
      "foreColor",
      event.target.value
    );

  }
);


/* ==========================================
   HYPERLINK
========================================== */

document.getElementById(
  "edaranLinkButton"
).addEventListener(
  "click",
  function () {

    saveEdaranSelection();

    const url =
      window.prompt(
        "Masukkan pautan HTTPS:"
      );

    if (!url) {
      return;
    }

    let parsedUrl;

    try {

      parsedUrl =
        new URL(url);

    } catch (error) {

      showEdaranMessage(
        "Pautan tidak sah.",
        true
      );

      return;

    }

    if (
      parsedUrl.protocol !==
      "https:"
    ) {

      showEdaranMessage(
        "Gunakan pautan HTTPS sahaja.",
        true
      );

      return;

    }

    runEdaranCommand(
      "createLink",
      parsedUrl.href
    );

  }
);


/* ==========================================
   INSERT IMAGE
========================================== */

document.getElementById(
  "edaranImageButton"
).addEventListener(
  "click",
  function () {

    saveEdaranSelection();

    edaranInlineImage.click();

  }
);


edaranInlineImage.addEventListener(
  "change",
  async function () {

    const file =
      edaranInlineImage.files[0];


    if (!file) {
      return;
    }


    /* ------------------------------------------
       VALIDASI JENIS FAIL
    ------------------------------------------ */

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      showEdaranMessage(
        "Sila pilih fail gambar.",
        true
      );

      edaranInlineImage.value =
        "";

      return;

    }


    /* ------------------------------------------
       VALIDASI SAIZ
    ------------------------------------------ */

    if (
      file.size >
      MAX_EDARAN_FILE_SIZE
    ) {

      showEdaranMessage(
        "Gambar melebihi 3 MB.",
        true
      );

      edaranInlineImage.value =
        "";

      return;

    }


    /* ------------------------------------------
       SEMAK SESI
    ------------------------------------------ */

    const session =
      JSON.parse(
        localStorage.getItem(
          "paspaGoSession"
        ) || "null"
      );


    if (
      !session ||
      session.isLoggedIn !== true ||
      !session.googleEmail
    ) {

      showEdaranMessage(
        "Sesi log masuk tidak sah. Sila log masuk semula.",
        true
      );

      edaranInlineImage.value =
        "";

      return;

    }


    try {

      showEdaranMessage(
        "Sedang memuat naik gambar..."
      );


      /* ------------------------------------------
         TUKAR GAMBAR KEPADA BASE64
         UNTUK PROSES UPLOAD SAHAJA
      ------------------------------------------ */

      const base64Data =
        await fileToBase64(
          file
        );


      /* ------------------------------------------
         UPLOAD KE GOOGLE DRIVE
      ------------------------------------------ */

      const result =
        await apiPost({

          action:
            "edaran_upload_inline_image",

          email:
            session.googleEmail,

          fileData: {

            fileName:
              file.name,

            mimeType:
              file.type,

            fileSize:
              file.size,

            base64Data:
              base64Data

          }

        });


      if (
        !result ||
        result.success !== true ||
        !result.fileId
      ) {

        throw new Error(
          result?.message ||
          "Gambar gagal dimuat naik."
        );

      }


      /* ------------------------------------------
         BINA PLACEHOLDER GAMBAR

         PENTING:
         Tiada Base64 disimpan dalam editor.
      ------------------------------------------ */

      restoreEdaranSelection();

      edaranEditor.focus();


      const image =
        document.createElement(
          "img"
        );


      image.setAttribute(
        "data-drive-file-id",
        result.fileId
      );


      image.setAttribute(
        "data-file-name",
        result.fileName ||
        file.name
      );


      image.alt =
        result.fileName ||
        "Gambar Edaran";


      image.className =
        "edaran-inline-image";


      /*
        Preview sementara menggunakan
        Object URL browser.

        URL ini TIDAK disimpan ke Sheet.
      */

      const previewUrl =
        URL.createObjectURL(
          file
        );


      image.src =
        previewUrl;


      /* ------------------------------------------
         MASUKKAN DI POSISI CURSOR
      ------------------------------------------ */

      if (edaranSavedSelection) {

        const range =
          edaranSavedSelection;

        range.deleteContents();

        range.insertNode(
          image
        );


        range.setStartAfter(
          image
        );

        range.collapse(
          true
        );


        const selection =
          window.getSelection();

        selection.removeAllRanges();

        selection.addRange(
          range
        );


      } else {

        edaranEditor.appendChild(
          image
        );

      }


      /*
        Selepas gambar dimasukkan,
        selection baharu disimpan.
      */

      saveEdaranSelection();


      showEdaranMessage(
        "Gambar berjaya dimasukkan."
      );


    } catch (error) {

      console.error(
        "EDARAN INLINE IMAGE ERROR:",
        error
      );


      showEdaranMessage(
        error.message ||
        "Gambar gagal dimasukkan.",
        true
      );

    } finally {

      edaranInlineImage.value =
        "";

    }

  }
);


/* ==========================================
   SEMAK LAMPIRAN
========================================== */

edaranAttachment.addEventListener(
  "change",
  function () {

    const file =
      edaranAttachment.files[0];

    const info =
      document.getElementById(
        "edaranAttachmentInfo"
      );

    info.textContent = "";

    if (!file) {
      return;
    }

    if (
      file.size >
      MAX_EDARAN_FILE_SIZE
    ) {

      showEdaranMessage(
        "Lampiran melebihi had 3 MB.",
        true
      );

      edaranAttachment.value = "";

      return;

    }

    info.textContent =
      file.name +
      " (" +
      (
        file.size / 1024 / 1024
      ).toFixed(2) +
      " MB)";

  }
);


/* =====================================================
   TUKAR FAIL KEPADA BASE64
===================================================== */

function fileToBase64(file) {

  return new Promise(
    function (resolve, reject) {

      const reader =
        new FileReader();

      reader.onload =
        function () {

          try {

            const result =
              String(
                reader.result || ""
              );

            /*
              FileReader menghasilkan:
              data:application/pdf;base64,AAAA...

              Backend hanya perlukan bahagian
              selepas koma.
            */

            const commaIndex =
              result.indexOf(",");

            if (commaIndex === -1) {

              reject(
                new Error(
                  "Format fail tidak sah."
                )
              );

              return;
            }

            resolve(
              result.substring(
                commaIndex + 1
              )
            );

          } catch (error) {

            reject(error);

          }

        };

      reader.onerror =
        function () {

          reject(
            new Error(
              "Fail tidak dapat dibaca."
            )
          );

        };

      reader.readAsDataURL(file);

    }
  );

}

/* =====================================================
   SEDIAKAN HTML EDARAN UNTUK DISIMPAN
===================================================== */

function getEdaranHtmlForSave() {

  const clone =
    edaranEditor.cloneNode(
      true
    );


  const images =
    clone.querySelectorAll(
      "img[data-drive-file-id]"
    );


  images.forEach(
    function (image) {

      const fileId =
        String(
          image.getAttribute(
            "data-drive-file-id"
          ) || ""
        ).trim();


      /*
        Jangan simpan blob URL browser.
      */

      image.removeAttribute(
        "src"
      );


      if (fileId) {

        image.setAttribute(
          "data-drive-file-id",
          fileId
        );

      }

    }
  );


  return clone.innerHTML.trim();

}


/* ==========================================
   HANTAR EDARAN KE BACKEND
========================================== */

edaranForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();

    const jenis =
      document.getElementById(
        "edaranJenis"
      ).value.trim();

    const perkara =
      document.getElementById(
        "edaranPerkara"
      ).value.trim();

    const kandunganHtml =
  getEdaranHtmlForSave();

    const kandunganTeks =
      edaranEditor.textContent.trim();


      const adaGambar =
  edaranEditor.querySelector(
    "img[data-drive-file-id]"
  ) !== null;


      /* Lampiran yang dipilih pengguna */

const attachmentFile =
  edaranAttachment.files.length > 0
    ? edaranAttachment.files[0]
    : null;

    /* ------------------------------------------
       VALIDASI BORANG
    ------------------------------------------ */

    if (
  !jenis ||
  !perkara ||
  (
    !kandunganTeks &&
    !adaGambar
  )
) {

  showEdaranMessage(
    "Lengkapkan jenis, perkara dan kandungan edaran.",
    true
  );

  return;
}

    /* ------------------------------------------
       SEMAK SESI LOGIN
    ------------------------------------------ */

    const session =
      JSON.parse(
        localStorage.getItem(
          "paspaGoSession"
        ) || "null"
      );

    if (
      !session ||
      session.isLoggedIn !== true ||
      !session.googleEmail
    ) {

      showEdaranMessage(
        "Sesi log masuk tidak sah. Sila log masuk semula.",
        true
      );

      return;
    }

    /* ------------------------------------------
       DAPATKAN BUTANG HANTAR
    ------------------------------------------ */

    const submitButton =
      edaranForm.querySelector(
        'button[type="submit"]'
      );

    const originalButtonText =
      submitButton
        ? submitButton.textContent
        : "";

    try {

      if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
          "Menghantar...";

      }

      showEdaranMessage(
        "Sedang menghantar edaran..."
      );

      /* ------------------------------------------
         HANTAR KE GOOGLE APPS SCRIPT
      ------------------------------------------ */

      let result;

      

if (editingEdaranId) {

  /* ------------------------------------------
     KEMAS KINI EDARAN SEDIA ADA
  ------------------------------------------ */

  result =
    await apiPost({

      action:
        "edaran_update",

      email:
        session.googleEmail,

      edaranId:
        editingEdaranId,

      data: {

        jenisEdaran:
          jenis,

        perkara:
          perkara,

        kandunganHtml:
          kandunganHtml

      }

    });

} else {

  /* ------------------------------------------
     EDARAN BAHARU
  ------------------------------------------ */

  result =
    await apiPost({

      action:
        "edaran_create",

      email:
        session.googleEmail,

      data: {

        jenisEdaran:
          jenis,

        perkara:
          perkara,

        kandunganHtml:
          kandunganHtml

      }

    });

}

      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.message ||
          "Edaran gagal dihantar."
        );

      }



      /* ------------------------------------------
   DAPATKAN EDARAN ID
------------------------------------------ */

const savedEdaranId =
  editingEdaranId ||
  result.edaranId ||
  currentEdaranItem?.edaranId ||
  "";

if (!savedEdaranId) {

  throw new Error(
    "EDARAN_ID tidak dapat dikenal pasti."
  );

}


/* ------------------------------------------
   UPLOAD LAMPIRAN JIKA ADA
------------------------------------------ */

if (attachmentFile) {

  if (
    attachmentFile.size >
    MAX_EDARAN_FILE_SIZE
  ) {

    throw new Error(
      "Lampiran melebihi had 3 MB."
    );

  }

  if (submitButton) {

    submitButton.textContent =
      "Memuat naik lampiran...";

  }

  showEdaranMessage(
    "Sedang memuat naik lampiran..."
  );


  const attachmentBase64 =
    await fileToBase64(
      attachmentFile
    );


  const uploadResult =
    await apiPost({

      action:
        "edaran_upload_attachment",

      email:
        session.googleEmail,

      edaranId:
        savedEdaranId,

      fileData: {

        fileName:
          attachmentFile.name,

        mimeType:
          attachmentFile.type ||
          "application/octet-stream",

        fileSize:
          attachmentFile.size,

        base64Data:
          attachmentBase64

      }

    });


  if (
    !uploadResult ||
    uploadResult.success !== true
  ) {

    throw new Error(
      uploadResult?.message ||
      "Edaran telah disimpan tetapi lampiran gagal dimuat naik."
    );

  }

}
      /* ------------------------------------------
         BERJAYA
      ------------------------------------------ */

      console.log(
        "EDARAN CREATED:",
        result.edaranId
      );

      showEdaranMessage(
        result.message ||
        "Edaran berjaya dihantar."
      );

      /* Kosongkan borang selepas berjaya */

      edaranForm.reset();

      edaranEditor.innerHTML = "";

      edaranSavedSelection = null;

/* Reset mod Edit selepas simpan berjaya */

editingEdaranId = null;

currentEdaranItem = null;

document.getElementById(
  "edaranFormTitle"
).textContent =
  "Edaran Baharu";

      document.getElementById(
        "edaranAttachmentInfo"
      ).textContent = "";

      /* Kembali ke senarai selepas mesej
         kejayaan dipaparkan seketika */

   setTimeout(
  async function () {

    showEdaranSection(
      "list"
    );

    await loadEdaranList();

  },
  1200
);

    } catch (error) {

      console.error(
        "EDARAN CREATE ERROR:",
        error
      );

      showEdaranMessage(
        error.message ||
        "Tidak dapat menghantar edaran.",
        true
      );

    } finally {

      if (submitButton) {

        submitButton.disabled = false;

        submitButton.textContent =
          originalButtonText;

      }

    }

  }
);

/* =====================================================
   PAPAR SENARAI EDARAN & HEBAHAN
===================================================== */

const edaranList =
  document.getElementById("edaranList");


async function loadEdaranList() {

  const session =
    JSON.parse(
      localStorage.getItem("paspaGoSession") || "null"
    );

  if (
    !session ||
    session.isLoggedIn !== true ||
    !session.googleEmail
  ) {

    edaranList.innerHTML =
      '<div class="edaran-empty">' +
      'Sesi log masuk tidak sah.' +
      '</div>';

    return;
  }

  edaranList.innerHTML =
    '<div class="edaran-empty">' +
    'Memuatkan edaran...' +
    '</div>';

  try {

    const result =
      await apiPost({

        action: "edaran_list",

        email: session.googleEmail

      });

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Senarai edaran gagal dimuatkan."
      );

    }

    const items =
      Array.isArray(result.edaran)
        ? result.edaran
        : [];

    renderEdaranList(items);

  } catch (error) {

    console.error(
      "EDARAN LIST ERROR:",
      error
    );

    edaranList.innerHTML = "";

    const empty =
      document.createElement("div");

    empty.className =
      "edaran-empty";

    empty.textContent =
      error.message ||
      "Tidak dapat memuatkan edaran.";

    edaranList.appendChild(empty);

  }

}


/* =====================================================
   BINA KAD SENARAI
===================================================== */
function renderEdaranList(items) {

  edaranList.innerHTML = "";

  if (!items.length) {

    const empty =
      document.createElement("div");

    empty.className =
      "edaran-empty";

    empty.textContent =
      "Tiada edaran dipaparkan.";

    edaranList.appendChild(
      empty
    );

    return;
  }


  items.forEach(
    function (item) {

      /* ==========================================
         BARIS INBOX
      ========================================== */

      const row =
        document.createElement("button");

      row.type =
        "button";

      row.className =
        "edaran-inbox-row";


      /* Warna mengikut kategori */

      const categoryClass =
        getEdaranCategoryClass(
          item.jenisEdaran
        );

      row.classList.add(
        categoryClass
      );


      /* ==========================================
         KATEGORI
      ========================================== */

      const category =
        document.createElement("span");

      category.className =
        "edaran-inbox-category";

      category.textContent =
        item.jenisEdaran ||
        "Edaran";


      /* ==========================================
         TAJUK
      ========================================== */

      const title =
        document.createElement("span");

      title.className =
        "edaran-inbox-title";

      title.textContent =
        item.perkara ||
        "Tanpa perkara";


      /* ==========================================
         TARIKH / MASA
      ========================================== */

      const date =
        document.createElement("span");

      date.className =
        "edaran-inbox-date";

      date.textContent =
        item.tarikhHantar || "";


      /* ==========================================
         SUSUN BARIS
      ========================================== */

      row.appendChild(
        category
      );

      row.appendChild(
        title
      );

      row.appendChild(
        date
      );


      /* ==========================================
         KLIK SELURUH BARIS
      ========================================== */

      row.addEventListener(
        "click",
        function () {

          showEdaranDetail(
            item
          );

        }
      );


      edaranList.appendChild(
        row
      );

    }
  );

}

/* =====================================================
   WARNA MENGIKUT JENIS EDARAN
===================================================== */

function getEdaranCategoryClass(
  jenisEdaran
) {

  const jenis =
    String(
      jenisEdaran || ""
    )
      .trim()
      .toLowerCase();

  switch (jenis) {

    case "pengumuman semasa":
      return "kategori-pengumuman";

    case "arahan jabatan":
      return "kategori-arahan";

    case "pekeliling":
      return "kategori-pekeliling";

    case "surat menyurat":
      return "kategori-surat";

    case "jadual":
      return "kategori-jadual";

    case "pingat/anugerah":
      return "kategori-anugerah";

    default:
      return "kategori-lain";

  }

}


/* =====================================================
   MUATKAN GAMBAR INLINE DARIPADA DRIVE
===================================================== */

async function loadEdaranInlineImages(
  container,
  email
) {

  const images =
    container.querySelectorAll(
      "img[data-drive-file-id]"
    );


  if (!images.length) {
    return;
  }


  for (
    const image of images
  ) {

    const fileId =
      String(
        image.getAttribute(
          "data-drive-file-id"
        ) || ""
      ).trim();


    if (!fileId) {
      continue;
    }


    try {

      image.classList.add(
        "edaran-inline-image-loading"
      );


      const result =
        await apiPost({

          action:
            "edaran_inline_image",

          email:
            email,

          fileId:
            fileId

        });


      if (
        !result ||
        result.success !== true ||
        !result.base64Data
      ) {

        throw new Error(
          result?.message ||
          "Gambar gagal dimuatkan."
        );

      }


      /* ------------------------------------------
         BASE64 HANYA UNTUK PAPARAN
      ------------------------------------------ */

      image.src =
        "data:" +
        (
          result.mimeType ||
          "image/jpeg"
        ) +
        ";base64," +
        result.base64Data;


      image.classList.remove(
        "edaran-inline-image-loading"
      );


    } catch (error) {

      console.error(
        "LOAD EDARAN IMAGE ERROR:",
        fileId,
        error
      );


      image.classList.remove(
        "edaran-inline-image-loading"
      );

      image.classList.add(
        "edaran-inline-image-error"
      );

    }

  }

}


/* =====================================================
   PAPAR DETAIL EDARAN
===================================================== */
async function showEdaranDetail(item) {

  if (!item) {
    return;
  }


  /* ------------------------------------------
     SEMAK SESI LOGIN
  ------------------------------------------ */

  const session =
    JSON.parse(
      localStorage.getItem(
        "paspaGoSession"
      ) || "null"
    );


  if (
    !session ||
    session.isLoggedIn !== true ||
    !session.googleEmail
  ) {

    showEdaranMessage(
      "Sesi log masuk tidak sah. Sila log masuk semula.",
      true
    );

    return;

  }


  /* ------------------------------------------
     DAPATKAN EDARAN ID
  ------------------------------------------ */

  const edaranId =
    String(
      item.edaranId || ""
    ).trim();


  if (!edaranId) {

    showEdaranMessage(
      "EDARAN_ID tidak ditemui.",
      true
    );

    return;

  }


  try {

    /* ------------------------------------------
       PAPAR DETAIL SECTION
    ------------------------------------------ */

    showEdaranSection(
      "detail"
    );


    edaranDetailBody.innerHTML =
      '<div class="edaran-detail-loading">' +
      'Memuatkan maklumat edaran...' +
      '</div>';


    edaranOwnerActions.hidden =
      true;


    /* ------------------------------------------
       AMBIL DETAIL DARIPADA BACKEND
    ------------------------------------------ */

    const result =
      await apiPost({

        action:
          "edaran_detail",

        email:
          session.googleEmail,

        edaranId:
          edaranId

      });


    if (
      !result ||
      result.success !== true ||
      !result.edaran
    ) {

      throw new Error(
        result?.message ||
        "Maklumat edaran tidak dapat dimuatkan."
      );

    }


    /* ------------------------------------------
       DATA EDARAN
    ------------------------------------------ */

    const detail =
      result.edaran;

    const lampiran =
      Array.isArray(
        result.lampiran
      )
        ? result.lampiran
        : [];


    currentEdaranItem =
      detail;


    edaranDetailBody.innerHTML =
      "";


    /* ------------------------------------------
       JENIS EDARAN
    ------------------------------------------ */

    const category =
      document.createElement(
        "div"
      );

    category.className =
      "edaran-detail-category";

    category.textContent =
      detail.jenisEdaran ||
      "Edaran";


    /* ------------------------------------------
       PERKARA
    ------------------------------------------ */

    const title =
      document.createElement(
        "h2"
      );

    title.className =
      "edaran-detail-title";

    title.textContent =
      detail.perkara ||
      "Tanpa perkara";


    /* ------------------------------------------
       MAKLUMAT PENULIS
    ------------------------------------------ */

    const meta =
      document.createElement(
        "div"
      );

    meta.className =
      "edaran-detail-meta";


    const author =
      document.createElement(
        "div"
      );


    const namaAhli =
      String(
        detail.namaAhli || ""
      ).trim();


    const idPaspa =
      String(
        detail.idPaspa || ""
      ).trim();


    author.textContent =
      namaAhli +
      (
        idPaspa
          ? " • ID PASPA " +
            idPaspa
          : ""
      );


    const date =
      document.createElement(
        "div"
      );


    date.textContent =
      detail.tarikhHantar
        ? "Dihantar: " +
          detail.tarikhHantar
        : "";


    meta.appendChild(
      author
    );


    if (
      detail.tarikhHantar
    ) {

      meta.appendChild(
        date
      );

    }


    /* ------------------------------------------
       GARIS PEMISAH
    ------------------------------------------ */

    const divider =
      document.createElement(
        "div"
      );

    divider.className =
      "edaran-detail-divider";


    /* ------------------------------------------
       KANDUNGAN
    ------------------------------------------ */

    const content =
      document.createElement(
        "div"
      );

    content.className =
      "edaran-detail-content";


    content.innerHTML =
      detail.kandunganHtml ||
      "";

      await loadEdaranInlineImages(
  content,
  session.googleEmail
);


    /* ------------------------------------------
       MASUKKAN DETAIL UTAMA
    ------------------------------------------ */

    edaranDetailBody.appendChild(
      category
    );

    edaranDetailBody.appendChild(
      title
    );

    edaranDetailBody.appendChild(
      meta
    );

    edaranDetailBody.appendChild(
      divider
    );

    edaranDetailBody.appendChild(
      content
    );


    /* ==========================================
       LAMPIRAN
    ========================================== */

    if (
      lampiran.length > 0
    ) {

      const attachmentSection =
        document.createElement(
          "div"
        );

      attachmentSection.className =
        "edaran-detail-attachments";


      const attachmentTitle =
        document.createElement(
          "div"
        );

      attachmentTitle.className =
        "edaran-detail-attachments-title";

      attachmentTitle.textContent =
        "📎 Lampiran";


      attachmentSection.appendChild(
        attachmentTitle
      );


      lampiran.forEach(
        function (file) {

          const attachmentItem =
            document.createElement(
              "div"
            );

          attachmentItem.className =
            "edaran-detail-attachment-item";


          const fileName =
            document.createElement(
              "div"
            );

          fileName.className =
            "edaran-detail-attachment-name";

          fileName.textContent =
            file.namaFail ||
            "Lampiran";


          attachmentItem.appendChild(
            fileName
          );


          if (file.fileUrl) {

            const openButton =
              document.createElement(
                "a"
              );

            openButton.className =
              "edaran-detail-attachment-button";

            openButton.href =
              file.fileUrl;

            openButton.target =
              "_blank";

            openButton.rel =
              "noopener noreferrer";

            openButton.textContent =
              "Buka Lampiran";


            attachmentItem.appendChild(
              openButton
            );

          }


          attachmentSection.appendChild(
            attachmentItem
          );

        }
      );


      edaranDetailBody.appendChild(
        attachmentSection
      );

    }


    /* ==========================================
       SEMAK PEMILIK EDARAN
    ========================================== */

    const sessionIdPaspa =
      String(
        session.idPaspa || ""
      )
        .trim()
        .padStart(
          3,
          "0"
        );


    const ownerIdPaspa =
      String(
        detail.idPaspa || ""
      )
        .trim()
        .padStart(
          3,
          "0"
        );


    const isOwner =
      sessionIdPaspa &&
      ownerIdPaspa &&
      sessionIdPaspa ===
        ownerIdPaspa;


    edaranOwnerActions.hidden =
      !isOwner;


  } catch (error) {

    console.error(
      "EDARAN DETAIL ERROR:",
      error
    );


    edaranDetailBody.innerHTML =
      "";


    const errorBox =
      document.createElement(
        "div"
      );

    errorBox.className =
      "edaran-message error";

    errorBox.textContent =
      error.message ||
      "Maklumat edaran gagal dimuatkan.";


    edaranDetailBody.appendChild(
      errorBox
    );


    edaranOwnerActions.hidden =
      true;

  }

}


/* =====================================================
   KEMBALI DARI DETAIL KE SENARAI
===================================================== */

const edaranDetailBackButton =
  document.getElementById(
    "edaranDetailBackButton"
  );

edaranDetailBackButton.addEventListener(
  "click",
  function () {

    /* Reset rekod yang sedang dilihat */
    currentEdaranItem = null;

    /* Pastikan bukan dalam mod edit */
    editingEdaranId = null;

    /* Kembali ke senarai */
    showEdaranSection("list");

    /* Kembali ke bahagian atas halaman */
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);
/* =====================================================
   EDIT EDARAN MILIK SENDIRI
===================================================== */

document.getElementById(
  "edaranEditButton"
).addEventListener(
  "click",
  async function () {

    if (!currentEdaranItem) {
      return;
    }


    /* ------------------------------------------
       SEMAK SESI LOGIN
    ------------------------------------------ */

    const session =
      JSON.parse(
        localStorage.getItem(
          "paspaGoSession"
        ) || "null"
      );


    if (
      !session ||
      session.isLoggedIn !== true ||
      !session.googleEmail
    ) {

      showEdaranMessage(
        "Sesi log masuk tidak sah. Sila log masuk semula.",
        true
      );

      return;

    }


    /* ------------------------------------------
       SIMPAN ID EDARAN YANG SEDANG DIEDIT
    ------------------------------------------ */

    editingEdaranId =
      currentEdaranItem.edaranId;


    /* ------------------------------------------
       MASUKKAN DATA ASAL KE DALAM BORANG
    ------------------------------------------ */

    document.getElementById(
      "edaranJenis"
    ).value =
      currentEdaranItem.jenisEdaran || "";


    document.getElementById(
      "edaranPerkara"
    ).value =
      currentEdaranItem.perkara || "";


    edaranEditor.innerHTML =
      currentEdaranItem.kandunganHtml || "";


    /* ------------------------------------------
       TUKAR BORANG KEPADA MOD EDIT
    ------------------------------------------ */

    document.getElementById(
      "edaranFormTitle"
    ).textContent =
      "Edit Edaran";


    document.getElementById(
      "edaranSubmitButton"
    ).textContent =
      "Simpan Perubahan";


    /* ------------------------------------------
       KOSONGKAN INFO LAMPIRAN BARU
    ------------------------------------------ */

    edaranAttachment.value =
      "";


    document.getElementById(
      "edaranAttachmentInfo"
    ).textContent =
      "";


    /* ------------------------------------------
       PAPARKAN BORANG
    ------------------------------------------ */

    showEdaranSection(
      "form"
    );


    /* ------------------------------------------
       MUATKAN GAMBAR SEDIA ADA DARIPADA DRIVE
    ------------------------------------------ */

    try {

      await loadEdaranInlineImages(
        edaranEditor,
        session.googleEmail
      );

    } catch (error) {

      console.error(
        "EDARAN EDIT IMAGE ERROR:",
        error
      );

    }


    /* ------------------------------------------
       RESET KEDUDUKAN CURSOR
    ------------------------------------------ */

    edaranSavedSelection =
      null;

  }
);

/* ==========================================
   STATUS PERMULAAN
========================================== */

showEdaranSection("list");

loadEdaranList();



/* =====================================================
   EDARAN - INSERT NAMA AHLI PASPA
===================================================== */

const edaranMemberButton =
  document.getElementById("edaranMemberButton");

const edaranMemberSearchBox =
  document.getElementById("edaranMemberSearchBox");

const edaranMemberCloseButton =
  document.getElementById("edaranMemberCloseButton");

const edaranMemberSearchInput =
  document.getElementById("edaranMemberSearchInput");

const edaranMemberSearchStatus =
  document.getElementById("edaranMemberSearchStatus");

const edaranMemberSearchResults =
  document.getElementById("edaranMemberSearchResults");

let edaranMemberSearchTimer = null;
let edaranMemberSearchVersion = 0;


/* =====================================================
   BUKA / TUTUP CARIAN
===================================================== */

edaranMemberButton.addEventListener(
  "click",
  function () {

    // Simpan kedudukan kursor dalam karangan
    // sebelum fokus berpindah ke kotak carian.
    const selection = window.getSelection();

    if (
      selection &&
      selection.rangeCount > 0 &&
      edaranEditor.contains(
        selection.anchorNode
      )
    ) {
      edaranSavedSelection =
        selection.getRangeAt(0).cloneRange();
    }

    edaranMemberSearchBox.hidden = false;

    edaranMemberSearchInput.focus();

  }
);

edaranMemberCloseButton.addEventListener(
  "click",
  function () {

    edaranMemberSearchBox.hidden = true;

    edaranMemberSearchInput.value = "";

    edaranMemberSearchResults.innerHTML = "";

    edaranMemberSearchStatus.textContent =
      "Masukkan ID PASPA atau nama ahli.";

    edaranMemberSearchVersion++;

    clearTimeout(edaranMemberSearchTimer);

  }
);


/* =====================================================
   CARI AHLI
===================================================== */

async function searchEdaranMembers(searchText) {

  const version =
    ++edaranMemberSearchVersion;

  edaranMemberSearchResults.innerHTML = "";

  if (!searchText.trim()) {

    edaranMemberSearchStatus.textContent =
      "Masukkan ID PASPA atau nama ahli.";

    return;
  }

  const session = JSON.parse(
    localStorage.getItem("paspaGoSession") || "null"
  );

  if (
    !session ||
    session.isLoggedIn !== true ||
    !session.googleEmail
  ) {

    edaranMemberSearchStatus.textContent =
      "Sesi log masuk tidak sah. Sila log masuk semula.";

    return;
  }

  edaranMemberSearchStatus.textContent =
    "Sedang mencari ahli...";

  try {

    const result = await apiPost({

      action: "search_member",

      email: session.googleEmail,

      searchText: searchText.trim(),

      negeri: ""

    });

    // Abaikan keputusan carian lama jika
    // pengguna sudah menaip carian baharu.
    if (
      version !== edaranMemberSearchVersion
    ) {
      return;
    }

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Carian ahli gagal."
      );

    }

    /*
      Struktur senarai disemak di sini.
      Jika backend menggunakan nama medan lain,
      kita akan selaraskan berdasarkan respons sebenar.
    */

    const members =
      Array.isArray(result.members)
        ? result.members
        : Array.isArray(result.data)
          ? result.data
          : [];

    renderEdaranMemberResults(members);

  } catch (error) {

    if (
      version !== edaranMemberSearchVersion
    ) {
      return;
    }

    console.error(
      "EDARAN MEMBER SEARCH ERROR:",
      error
    );

    edaranMemberSearchStatus.textContent =
      error.message ||
      "Tidak dapat mencari ahli.";

  }

}


/* =====================================================
   PAPAR KEPUTUSAN CARIAN
===================================================== */

function renderEdaranMemberResults(members) {

  edaranMemberSearchResults.innerHTML = "";

  if (!members.length) {

    edaranMemberSearchStatus.textContent =
      "Tiada ahli ditemui.";

    return;
  }

  edaranMemberSearchStatus.textContent =
    members.length + " ahli ditemui.";

  members.forEach(function (member) {

    const idPaspa =
      String(member.idPaspa || "").trim();

    const pangkat =
      String(member.pangkat || "").trim();

    const namaPenuh =
      String(member.namaPenuh || "").trim();

    const namaPaparan =
      [pangkat, namaPenuh]
        .filter(Boolean)
        .join(" ");

    if (!namaPaparan) {
      return;
    }

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "edaran-member-result";

    const nameElement =
      document.createElement("strong");

    nameElement.textContent =
      namaPaparan;

    const idElement =
      document.createElement("span");

    idElement.textContent =
      "ID PASPA: " + idPaspa;

    button.appendChild(nameElement);
    button.appendChild(idElement);

    button.addEventListener(
      "click",
      function () {

        insertEdaranMemberName(
          namaPaparan
        );

      }
    );

    edaranMemberSearchResults.appendChild(
      button
    );

  });

}


/* =====================================================
   INSERT NAMA PADA KEDUDUKAN KURSOR
===================================================== */

function insertEdaranMemberName(namaPaparan) {

  edaranEditor.focus();

  const selection =
    window.getSelection();

  if (edaranSavedSelection) {

    selection.removeAllRanges();

    selection.addRange(
      edaranSavedSelection
    );

  }

  /*
    Masukkan nama sebagai teks biasa,
    bukan HTML daripada pangkalan data.
  */

  const range =
    selection.rangeCount > 0
      ? selection.getRangeAt(0)
      : null;

  if (
    range &&
    edaranEditor.contains(
      range.commonAncestorContainer
    )
  ) {

    range.deleteContents();

    const textNode =
      document.createTextNode(
        namaPaparan + " "
      );

    range.insertNode(textNode);

    range.setStartAfter(textNode);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);

  } else {

    edaranEditor.appendChild(
      document.createTextNode(
        namaPaparan + " "
      )
    );

  }

  saveEdaranSelection();

  edaranMemberSearchBox.hidden = true;

  edaranMemberSearchInput.value = "";

  edaranMemberSearchResults.innerHTML = "";

  edaranMemberSearchStatus.textContent =
    "Masukkan ID PASPA atau nama ahli.";

  edaranMemberSearchVersion++;

  clearTimeout(edaranMemberSearchTimer);

}


/* =====================================================
   CARIAN AUTOMATIK SEMASA MENAIP
===================================================== */

edaranMemberSearchInput.addEventListener(
  "input",
  function () {

    clearTimeout(
      edaranMemberSearchTimer
    );

    const searchText =
      edaranMemberSearchInput.value.trim();

    // Batalkan paparan hasil permintaan lama
    // sebaik sahaja teks carian berubah.
    edaranMemberSearchVersion++;

    if (!searchText) {

      edaranMemberSearchResults.innerHTML = "";

      edaranMemberSearchStatus.textContent =
        "Masukkan ID PASPA atau nama ahli.";

      return;
    }

    edaranMemberSearchTimer =
      setTimeout(
        function () {

          searchEdaranMembers(
            searchText
          );

        },
        350
      );

  }
);
