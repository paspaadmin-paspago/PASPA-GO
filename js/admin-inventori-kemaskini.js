"use strict";

(() => {

  /* =========================================
     PASPA GO
     PENGURUSAN STOK INVENTORI
  ========================================= */

  const $ = id =>
    document.getElementById(id);

  let adminEmail = "";

  let editMode = false;

  let editingInventoryId = "";

  let stockItemsCache = [];

  let variationCounter = 0;


  /* =========================================
     SENARAI SAIZ
  ========================================= */

  const SIZE_OPTIONS = {

    "Uniform/tshirt/seluar/jaket/T.Pinggang": [

      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
      "XXXL",
      "4XL",
      "Lain-lain"

    ],

    "Kasut/boot": [

      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "Lain-lain"

    ],

    "Bere": [

      "6",
      "6 1/8",
      "6 1/4",
      "6 3/8",
      "6 1/2",
      "6 5/8",
      "6 3/4",
      "6 7/8",
      "7",
      "7 1/8",
      "7 1/4",
      "7 3/8",
      "7 1/2",
      "7 5/8",
      "7 3/4",
      "8",
      "Lain-lain"

    ],

    "Eksesori": [
      "Lain-lain"
    ],

    "Lain-lain": [
      "Lain-lain"
    ]

  };


  /* =========================================
     SESSION
  ========================================= */

  function getEmail() {

    try {

      const session = JSON.parse(

        localStorage.getItem(
          "paspaGoSession"
        ) || "null"

      );

      return String(

        session?.googleEmail ||
        session?.email ||
        ""

      )
        .trim()
        .toLowerCase();

    } catch (error) {

      return "";

    }

  }


  /* =========================================
     MESEJ
  ========================================= */

  function showMessage(text) {

    const notice = $("stockNotice");

    notice.textContent = text;

    notice.classList.remove(
      "stock-hidden"
    );

    notice.scrollIntoView({

      behavior: "smooth",

      block: "start"

    });

  }


  function hideMessage() {

    const notice = $("stockNotice");

    notice.textContent = "";

    notice.classList.add(
      "stock-hidden"
    );

  }


  /* =========================================
     API
  ========================================= */

  async function call(action, extra = {}) {

    const result = await apiPost({

      action: action,

      email: adminEmail,

      ...extra

    });

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(

        result?.message ||
        "Permintaan API gagal."

      );

    }

    return result;

  }


  /* =========================================
     KATEGORI
  ========================================= */

  function updateCategory() {

    const category =
      $("itemCategory").value;

    const isOther =
      category === "Lain-lain";

    $("otherCategoryField")
      .classList.toggle(
        "stock-hidden",
        !isOther
      );

    $("otherCategory").required =
      isOther;

    /*
       Apabila kategori berubah,
       senarai saiz perlu dibina semula.
    */

    $("variationList")
      .replaceChildren();

    variationCounter = 0;

    addVariation();

    updateTotalStock();

  }


  /* =========================================
     UNIT
  ========================================= */

  function updateUnit() {

    const isOther =
      $("itemUnit").value ===
      "Lain-lain";

    $("otherUnitField")
      .classList.toggle(
        "stock-hidden",
        !isOther
      );

    $("otherUnit").required =
      isOther;

  }


  /* =========================================
     BINA VARIASI
  ========================================= */

  function addVariation(
    initialSize = "",
    initialQuantity = ""
  ) {

    const category =
      $("itemCategory").value;

    if (!category) {

      showMessage(
        "Sila pilih kategori dahulu."
      );

      return;

    }

    hideMessage();

    variationCounter++;

    const number =
      variationCounter;

    const block =
      document.createElement("div");

    block.className =
      "stock-variation";

    block.dataset.number =
      String(number);

    const heading =
      document.createElement("div");

    heading.className =
      "stock-variation-heading";

    const title =
      document.createElement("strong");

    title.textContent =
      "Variasi " + number;

    const removeButton =
      document.createElement("button");

    removeButton.type =
      "button";

    removeButton.className =
      "stock-button stock-danger";

    removeButton.textContent =
      "🗑";

    removeButton.title =
      "Buang variasi";

    heading.appendChild(title);

    heading.appendChild(
      removeButton
    );

    const grid =
      document.createElement("div");

    grid.className =
      "stock-variation-grid";

    /* SAIZ */

    const sizeField =
      document.createElement("div");

    sizeField.className =
      "stock-field";

    const sizeLabel =
      document.createElement("label");

    sizeLabel.textContent =
      "Saiz";

    const sizeSelect =
      document.createElement("select");

    sizeSelect.className =
      "variation-size";

    sizeSelect.required =
      true;

    const placeholder =
      document.createElement("option");

    placeholder.value = "";

    placeholder.textContent =
      "Pilih saiz";

    sizeSelect.appendChild(
      placeholder
    );

    const sizes =
      SIZE_OPTIONS[category] || [];

    sizes.forEach(function (size) {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        size;

      option.textContent =
        size;

      sizeSelect.appendChild(
        option
      );

    });

    sizeField.appendChild(
      sizeLabel
    );

    sizeField.appendChild(
      sizeSelect
    );

    /* SAIZ LAIN-LAIN */

    const otherSizeField =
      document.createElement("div");

    otherSizeField.className =
      "stock-field stock-hidden";

    const otherSizeLabel =
      document.createElement("label");

    otherSizeLabel.textContent =
      "Nyatakan saiz";

    const otherSizeInput =
      document.createElement("input");

    otherSizeInput.type =
      "text";

    otherSizeInput.maxLength =
      60;

    otherSizeInput.className =
      "variation-other-size";

    otherSizeInput.placeholder =
      "Contoh: Free Size";

    otherSizeField.appendChild(
      otherSizeLabel
    );

    otherSizeField.appendChild(
      otherSizeInput
    );

    /* KUANTITI */

    const quantityField =
      document.createElement("div");

    quantityField.className =
      "stock-field";

    const quantityLabel =
      document.createElement("label");

    quantityLabel.textContent =
      "Kuantiti Stok";

    const quantityInput =
      document.createElement("input");

    quantityInput.type =
      "number";

    quantityInput.min =
      "0";

    quantityInput.step =
      "1";

    quantityInput.required =
      true;

    quantityInput.className =
      "variation-quantity";

    quantityInput.placeholder =
      "Contoh: 20";

    quantityField.appendChild(
      quantityLabel
    );

    quantityField.appendChild(
      quantityInput
    );

    grid.appendChild(
      sizeField
    );

    grid.appendChild(
      quantityField
    );

    block.appendChild(
      heading
    );

    block.appendChild(
      grid
    );

    block.appendChild(
      otherSizeField
    );

    $("variationList")
      .appendChild(block);

    /* PERUBAHAN SAIZ */

    function updateOtherSize() {

      const isOther =
        sizeSelect.value ===
        "Lain-lain";

      otherSizeField.classList.toggle(

        "stock-hidden",

        !isOther

      );

      otherSizeInput.required =
        isOther;

    }

    sizeSelect.addEventListener(

      "change",

      updateOtherSize

    );

    /* KIRA JUMLAH */

    quantityInput.addEventListener(

      "input",

      updateTotalStock

    );

    /* BUANG VARIASI */

    removeButton.addEventListener(

      "click",

      function () {

        block.remove();

        renumberVariations();

        updateTotalStock();

      }

    );

    /* NILAI AWAL UNTUK EDIT */

    if (initialSize) {

      const knownSize =
        sizes.includes(
          initialSize
        );

      sizeSelect.value =
        knownSize
          ? initialSize
          : "Lain-lain";

      if (!knownSize) {

        otherSizeInput.value =
          initialSize;

      }

    }

    if (
      initialQuantity !== "" &&
      initialQuantity != null
    ) {

      quantityInput.value =
        String(
          initialQuantity
        );

    }

    updateOtherSize();

    updateTotalStock();

  }


  /* =========================================
     NOMBOR VARIASI
  ========================================= */

  function renumberVariations() {

    const blocks =
      $("variationList")
        .querySelectorAll(
          ".stock-variation"
        );

    blocks.forEach(

      function (block, index) {

        const title =
          block.querySelector(
            ".stock-variation-heading strong"
          );

        title.textContent =
          "Variasi " +
          (index + 1);

      }

    );

  }


  /* =========================================
     JUMLAH STOK
  ========================================= */

  function updateTotalStock() {

    let total = 0;

    const inputs =
      $("variationList")
        .querySelectorAll(
          ".variation-quantity"
        );

    inputs.forEach(

      function (input) {

        const value =
          Number(
            input.value
          );

        if (
          input.value !== "" &&
          Number.isSafeInteger(value) &&
          value >= 0
        ) {

          total += value;

        }

      }

    );

    $("totalStock").textContent =
      "Jumlah Stok: " +
      total;

  }


  /* =========================================
     BACA VARIASI
  ========================================= */

  function collectVariations() {

    const blocks =
      $("variationList")
        .querySelectorAll(
          ".stock-variation"
        );

    if (!blocks.length) {

      throw new Error(

        "Sila tambah sekurang-kurangnya satu variasi."

      );

    }

    const variations = [];

    const usedSizes =
      new Set();

    blocks.forEach(

      function (block, index) {

        const sizeSelect =
          block.querySelector(
            ".variation-size"
          );

        const otherSize =
          block.querySelector(
            ".variation-other-size"
          );

        const quantityInput =
          block.querySelector(
            ".variation-quantity"
          );

        let size =
          sizeSelect.value;

        if (
          size === "Lain-lain"
        ) {

          size =
            otherSize.value.trim();

        }

        const quantity =
          Number(
            quantityInput.value
          );

        if (!size) {

          throw new Error(

            "Sila pilih saiz bagi Variasi " +
            (index + 1) +
            "."

          );

        }

        if (
          quantityInput.value === "" ||
          !Number.isSafeInteger(quantity) ||
          quantity < 0
        ) {

          throw new Error(

            "Kuantiti stok tidak sah bagi saiz " +
            size +
            "."

          );

        }

        const sizeKey =
          size.toUpperCase();

        if (
          usedSizes.has(
            sizeKey
          )
        ) {

          throw new Error(

            "Saiz " +
            size +
            " dipilih lebih daripada sekali."

          );

        }

        usedSizes.add(
          sizeKey
        );

        variations.push({

          saiz: size,

          kuantitiStok:
            quantity

        });

      }

    );

    return variations;

  }


  /* =========================================
     BACA BORANG
  ========================================= */

  function collectStockForm() {

    const categoryValue =
      $("itemCategory").value;

    const unitValue =
      $("itemUnit").value;

    const category =
      categoryValue ===
      "Lain-lain"

        ? $("otherCategory")
            .value.trim()

        : categoryValue;

    const unit =
      unitValue ===
      "Lain-lain"

        ? $("otherUnit")
            .value.trim()

        : unitValue;

    const namaItem =
      $("itemName")
        .value.trim();

    const jenamaModel =
      $("itemBrand")
        .value.trim();

    if (
      !namaItem ||
      !category ||
      !jenamaModel ||
      !unit
    ) {

      throw new Error(

        "Sila lengkapkan nama item, kategori, jenama dan UNIT."

      );

    }

    return {

      inventoryId:
        editMode
          ? editingInventoryId
          : "",

      namaItem:
        namaItem,

      kategori:
        category,

      jenamaModel:
        jenamaModel,

      unit:
        unit,

      variations:
        collectVariations()

    };

  }


  /* =========================================
     RESET BORANG
  ========================================= */

  function resetStockForm() {

    editMode = false;

    editingInventoryId = "";

    $("stockForm").reset();

    $("inventoryId").value =
      "";

    $("inventoryIdField")
      .classList.add(
        "stock-hidden"
      );

    $("stockFormTitle")
      .textContent =
        "Daftar Item Baharu";

    $("otherCategoryField")
      .classList.add(
        "stock-hidden"
      );

    $("otherUnitField")
      .classList.add(
        "stock-hidden"
      );

    $("variationList")
      .replaceChildren();

    variationCounter = 0;

    updateTotalStock();

    hideMessage();

  }


  /* =========================================
     DAFTAR ITEM
  ========================================= */

  $("newItemButton")
    .addEventListener(

      "click",

      function () {

        resetStockForm();

        $("stockFormSection")
          .scrollIntoView({

            behavior:
              "smooth"

          });

      }

    );


  /* =========================================
     TAMBAH VARIASI
  ========================================= */

  $("addVariationButton")
    .addEventListener(

      "click",

      function () {

        addVariation();

      }

    );


  /* =========================================
     KATEGORI
  ========================================= */

  $("itemCategory")
    .addEventListener(

      "change",

      updateCategory

    );


  /* =========================================
     UNIT
  ========================================= */

  $("itemUnit")
    .addEventListener(

      "change",

      updateUnit

    );


  /* =========================================
     BATAL
  ========================================= */

  $("cancelStockButton")
    .addEventListener(

      "click",

      resetStockForm

    );


  /* =========================================
   SIMPAN ITEM KE GOOGLE SHEETS
========================================= */
$("stockForm").addEventListener(
  "submit",

  async function (event) {

    event.preventDefault();

    const saveButton = $("saveStockButton");

    try {

      const data = collectStockForm();

      if (editMode) {

        const confirmed = window.confirm(
          "Simpan perubahan bagi item " +
          editingInventoryId +
          "?\n\n" +
          "Kuantiti baharu akan menggantikan " +
          "STOK_TERKINI (H)."
        );

        if (!confirmed) {
          return;
        }

        saveButton.disabled = true;

        saveButton.textContent =
          "MENYIMPAN PERUBAHAN...";

        const result = await call(
          "admin_inventory_stock_update",
          {
            data: data
          }
        );

        resetStockForm();

        await loadStockItems();

        showMessage(
          result.message ||
          "Item berjaya dikemas kini."
        );

        return;
      }

      // Kod DAFTAR ITEM sedia ada
      // diteruskan di bawah bahagian ini.

        const confirmed =
          window.confirm(

            "Daftar item " +
            data.namaItem +
            " dengan " +
            data.variations.length +
            " variasi saiz?"

          );

        if (!confirmed) {

          return;

        }

        saveButton.disabled =
          true;

        saveButton.textContent =
          "MENYIMPAN...";

        const result =
          await call(

            "admin_inventory_stock_create",

            {

              data: data

            }

          );

        resetStockForm();

        await loadStockItems();

        showMessage(

          "Item berjaya didaftarkan. " +
          "ID Inventori: " +
          result.inventoryId +
          ". Jumlah variasi: " +
          result.jumlahVariasi +
          ". Jumlah stok: " +
          result.jumlahStok +
          "."

        );

      } catch (error) {

        showMessage(
          error.message
        );

      } finally {

        saveButton.disabled =
          false;

       saveButton.textContent =
  editMode
    ? "SIMPAN PERUBAHAN"
    : "SIMPAN ITEM";
      }

    }

  );


  /* ============================================================
   EDIT ITEM
============================================================ */

function startEditItem(
  inventoryId
) {

  const id = String(
    inventoryId || ""
  ).trim();

  const variations =
    stockItemsCache.filter(
      function (item) {

        return String(
          item.inventoryId || ""
        ).trim() === id;

      }
    );

  if (!variations.length) {

    showMessage(
      "Item tidak ditemui. Muat semula senarai."
    );

    return;

  }


  const first = variations[0];


  /* RESET BORANG */

  resetStockForm();


  editMode = true;

  editingInventoryId = id;


  /* ID INVENTORI */

  $("inventoryId").value = id;

  $("inventoryIdField")
    .classList.remove(
      "stock-hidden"
    );


  /* TAJUK DAN BUTANG */

  $("stockFormTitle").textContent =
    "Edit Item Inventori - " + id;

  $("saveStockButton").textContent =
    "SIMPAN PERUBAHAN";


  /* NAMA DAN JENAMA */

  $("itemName").value =
    first.namaItem || "";

  $("itemBrand").value =
    first.jenamaModel || "";


  /* KATEGORI */

  const categorySelect =
    $("itemCategory");

  const category =
    first.kategori || "";

  const knownCategory =
    Array.from(
      categorySelect.options
    ).some(function (option) {

      return (
        option.value === category &&
        category !== "Lain-lain"
      );

    });

  categorySelect.value =
    knownCategory
      ? category
      : "Lain-lain";

  updateCategory();

  if (!knownCategory) {

    $("otherCategory").value =
      category;

  }


  /* UNIT */

  const unitSelect =
    $("itemUnit");

  const unit =
    first.unit || "";

  const knownUnit =
    Array.from(
      unitSelect.options
    ).some(function (option) {

      return (
        option.value === unit &&
        unit !== "Lain-lain"
      );

    });

  unitSelect.value =
    knownUnit
      ? unit
      : "Lain-lain";

  updateUnit();

  if (!knownUnit) {

    $("otherUnit").value =
      unit;

  }


  /* VARIASI */

  $("variationList")
    .replaceChildren();

  variationCounter = 0;


  variations.forEach(
    function (item) {

      addVariation(

        item.saiz || "",

        item.stokTerkini

      );

    }
  );


  updateTotalStock();


  $("stockFormSection")
    .scrollIntoView({

      behavior: "smooth",

      block: "start"

    });


  showMessage(
    "Mod Edit: " + id +
    ". Kuantiti yang disimpan akan menggantikan STOK_TERKINI (H)."
  );

}


/* ============================================================
   PADAM ITEM
============================================================ */

async function deleteStockItem(
  inventoryId
) {

  const id = String(
    inventoryId || ""
  ).trim();

  if (!id) {
    return;
  }


  const confirmed =
    window.confirm(

      "PADAM ITEM " + id + "?\n\n" +

      "Jika item tiada sejarah, rekod akan dipadam.\n\n" +

      "Jika item mempunyai sejarah permohonan / serahan, " +
      "rekod akan dikekalkan sebagai TIDAK AKTIF."

    );

  if (!confirmed) {
    return;
  }


  try {

    const result = await call(

      "admin_inventory_stock_delete",

      {

        inventoryId: id

      }

    );


    if (
      editMode &&
      editingInventoryId === id
    ) {

      resetStockForm();

    }


    await loadStockItems();


    showMessage(
      result.message ||
      "Tindakan Padam selesai."
    );


  } catch (error) {

    showMessage(
      error.message
    );

  }

}
  /* =========================================
     SENARAI ITEM
  ========================================= */
/* =========================================
   SENARAI ITEM DARIPADA GOOGLE SHEETS
========================================= */

/* ============================================================
   SENARAI ITEM + EDIT + PADAM
============================================================ */

async function loadStockItems() {

  const target =
    $("stockItemList");

  target.replaceChildren();


  const loadingText =
    document.createElement("p");

  loadingText.className =
    "stock-note";

  loadingText.textContent =
    "Memuatkan senarai inventori...";

  target.appendChild(
    loadingText
  );


  try {

    const result = await call(

      "admin_inventory_stock_list"

    );


    const items =
      Array.isArray(result.items)
        ? result.items
        : [];


    stockItemsCache = items;


    target.replaceChildren();


    if (!items.length) {

      const empty =
        document.createElement("p");

      empty.className =
        "stock-note";

      empty.textContent =
        "Tiada item inventori ditemui.";

      target.appendChild(
        empty
      );

      return;

    }


    /* KUMPULKAN MENGIKUT INVENTORY_ID */

    const groups =
      new Map();


    items.forEach(
      function (item) {

        const id = String(
          item.inventoryId || ""
        ).trim();

        if (!id) {
          return;
        }

        if (!groups.has(id)) {

          groups.set(
            id,
            []
          );

        }

        groups.get(id).push(
          item
        );

      }
    );


    groups.forEach(
      function (
        variations,
        inventoryId
      ) {

        const first =
          variations[0];


        /* KAD ITEM */

        const card =
          document.createElement(
            "article"
          );

        card.className =
          "stock-item";


        /* NAMA ITEM */

        const title =
          document.createElement(
            "h3"
          );

        title.textContent =
          first.namaItem || "-";

        card.appendChild(
          title
        );


        /* MAKLUMAT ITEM */

        const details =
          document.createElement(
            "p"
          );

        details.textContent =

          inventoryId +

          " | " +

          (first.jenamaModel || "-") +

          " | " +

          (first.unit || "-");

        card.appendChild(
          details
        );


        /* STATUS */

        const inactive =
          variations.some(
            function (item) {

              return String(
                item.statusItem || ""
              )
                .trim()
                .toUpperCase() ===
                "TIDAK AKTIF";

            }
          );


        const status =
          document.createElement(
            "p"
          );

        status.textContent =
          inactive
            ? "Status: TIDAK AKTIF"
            : "Status: AKTIF";

        card.appendChild(
          status
        );


        /* SENARAI SAIZ */

        variations.forEach(
          function (item) {

            const row =
              document.createElement(
                "p"
              );

            row.textContent =

              "Saiz: " +

              (item.saiz || "-") +

              " | Stok terkini: " +

              item.stokTerkini;

            card.appendChild(
              row
            );

          }
        );


        /* BUTANG EDIT DAN PADAM */

        const actions =
          document.createElement(
            "div"
          );

        actions.className =
          "stock-item-actions";


        /* EDIT */

        const editButton =
          document.createElement(
            "button"
          );

        editButton.type =
          "button";

        editButton.className =
          "stock-button stock-primary";

        editButton.textContent =
          "✎ EDIT";

        editButton.disabled =
          inactive;

        editButton.addEventListener(

          "click",

          function () {

            startEditItem(
              inventoryId
            );

          }

        );


        /* PADAM */

        const deleteButton =
          document.createElement(
            "button"
          );

        deleteButton.type =
          "button";

        deleteButton.className =
          "stock-button stock-danger";

        deleteButton.textContent =
          "🗑 PADAM";

        deleteButton.disabled =
          inactive;

        deleteButton.addEventListener(

          "click",

          async function () {

            deleteButton.disabled =
              true;

            try {

              await deleteStockItem(
                inventoryId
              );

            } finally {

              deleteButton.disabled =
                false;

            }

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


        target.appendChild(
          card
        );

      }
    );


  } catch (error) {

    target.replaceChildren();

    showMessage(
      error.message
    );

  }

}


/* =========================================
   BUTANG SENARAI ITEM
========================================= */

$("showItemsButton")
  .addEventListener(
    "click",
    async function () {

      await loadStockItems();

      $("stockListSection")
        .scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

    }
  );


  /* =========================================
     HEADER
  ========================================= */

  $("backButton")
    .addEventListener(

      "click",

      function () {

        window.location.href =
          "admin-inventori.html";

      }

    );


  $("homeButton")
    .addEventListener(

      "click",

      function () {

        window.location.href =
          "dashboard.html";

      }

    );


  /* =========================================
     START
  ========================================= */

  document.addEventListener(

    "DOMContentLoaded",

    async function () {

      adminEmail =
        getEmail();

      if (!adminEmail) {

        $("accessNotice")
          .textContent =

          "Sesi login tidak ditemui. Sila log masuk semula.";

        return;

      }

      try {

        const access =
          await call(

            "admin_inventory_access"

          );

        if (
          access.authorized !== true
        ) {

          throw new Error(

            access.message ||
            "Akses inventori tidak dibenarkan."

          );

        }

        $("accessNotice")
          .hidden = true;

        $("mainContent")
          .hidden = false;

      } catch (error) {

        $("accessNotice")
          .textContent =
            error.message;

      }

    }

  );

})();