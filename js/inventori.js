"use strict";

/* =========================================
   PASPA GO - INVENTORI AHLI
   BORANG PERMOHONAN BERBILANG ITEM

   STOK MENGIKUT:
   INVENTORY_ID + SAIZ
========================================= */

const inventoriMemberName =
  document.getElementById("inventoriMemberName");

const inventoriMemberId =
  document.getElementById("inventoriMemberId");

const inventoriMessage =
  document.getElementById("inventoriMessage");

const inventoryRequestList =
  document.getElementById("inventoryRequestList");

const inventoryRequestHistory =
  document.getElementById("inventoryRequestHistory");

const inventoryRequestStatus =
  document.getElementById("inventoryRequestStatus");

const inventoryTabs =
  document.querySelectorAll(".inventori-tab");

const inventoryPanels = {
  mohon: document.getElementById("mohonPanel"),
  rekod: document.getElementById("rekodPanel"),
  status: document.getElementById("statusPanel")
};

let inventoryItems = [];
let inventoryRequests = [];
let currentInventoryEmail = "";
let isSubmittingInventory = false;

const INITIAL_INVENTORY_ROWS = 5;


/* =========================================
   SESSION
========================================= */

function getInventoriSession() {
  try {
    return JSON.parse(
      localStorage.getItem("paspaGoSession")
    );
  } catch (error) {
    return null;
  }
}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeInventoryHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* =========================================
   NAMA ITEM + JENAMA / MODEL
========================================= */

function getInventoryRequestTitle(request) {

  const namaItem = String(
    request.namaItem || ""
  ).trim();

  const jenamaModel = String(
    request.jenamaModel || ""
  ).trim();

  if (namaItem && jenamaModel) {
    return namaItem + " | " + jenamaModel;
  }

  return namaItem || "-";
}

/* =========================================
   MESEJ
========================================= */

function showInventoriMessage(
  message,
  type = "error"
) {
  if (!inventoriMessage) return;

  inventoriMessage.textContent = message;

  inventoriMessage.className =
    "inventori-message " + type;
}

function hideInventoriMessage() {
  if (!inventoriMessage) return;

  inventoriMessage.textContent = "";

  inventoriMessage.className =
    "inventori-message hidden";
}


/* =========================================
   MAKLUMAT AHLI
========================================= */

async function loadInventoriMember(session) {

  if (inventoriMemberName) {
    inventoriMemberName.textContent =
      session.namaAhli || "Ahli PASPA";
  }

  if (inventoriMemberId) {
    inventoriMemberId.textContent =
      session.idPaspa || "-";
  }

  try {

    const result = await apiPost({
      action: "dashboard_v2",
      email: currentInventoryEmail
    });

    if (!result || result.success !== true) {
      throw new Error(
        result?.message ||
        "Maklumat ahli tidak dapat dimuatkan."
      );
    }

    const member = result.member || {};

    const pangkat = member.pangkat || "";

    const nama =
      member.namaPenuh ||
      member.namaAhli ||
      session.namaAhli ||
      "Ahli PASPA";

    if (inventoriMemberName) {
      inventoriMemberName.textContent =
        (pangkat ? pangkat + " " : "") + nama;
    }

    if (inventoriMemberId) {
      inventoriMemberId.textContent =
        member.idPaspa ||
        session.idPaspa ||
        "-";
    }

  } catch (error) {

    console.error(
      "LOAD INVENTORI MEMBER ERROR:",
      error
    );

  }
}


/* =========================================
   FORMAT PAPARAN
========================================= */

function formatInventoryQuantity(value) {

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("ms-MY");
}

function getInventoryStatusClass(status) {

  const value = String(status || "")
    .trim()
    .toUpperCase();

  if (value.includes("TOLAK")) {
    return "inventory-status-rejected";
  }

  if (
    value.includes("LULUS") ||
    value.includes("TERIMA") ||
    value.includes("SELESAI")
  ) {
    return "inventory-status-approved";
  }

  return "inventory-status-pending";
}


/* =========================================
   MENU
========================================= */

function openInventoryTab(selectedTab) {

  inventoryTabs.forEach(function (button) {

    const isActive =
      button.dataset.tab === selectedTab;

    button.classList.toggle(
      "active",
      isActive
    );

    button.setAttribute(
      "aria-pressed",
      String(isActive)
    );

  });

  Object.keys(inventoryPanels).forEach(
    function (key) {

      const panel = inventoryPanels[key];

      if (panel) {
        panel.hidden = key !== selectedTab;
      }

    }
  );

  hideInventoriMessage();

  if (
    selectedTab === "rekod" ||
    selectedTab === "status"
  ) {
    loadInventoryRequests();
  }
}

inventoryTabs.forEach(function (button) {

  button.addEventListener(
    "click",
    function () {
      openInventoryTab(button.dataset.tab);
    }
  );

});


/* =========================================
   LOAD INVENTORI
========================================= */

async function loadAvailableInventory() {

  if (!inventoryRequestList) return;

  inventoryRequestList.innerHTML = `
    <p class="inventori-empty">
      Memuatkan senarai inventori...
    </p>
  `;

  try {

    const result = await apiPost({
      action: "inventory_request_items",
      email: currentInventoryEmail
    });

    if (!result || result.success !== true) {
      throw new Error(
        result?.message ||
        "Senarai inventori gagal dimuatkan."
      );
    }

    inventoryItems = Array.isArray(
      result.inventory
    )
      ? result.inventory
      : [];

    renderAvailableInventory();

  } catch (error) {

    console.error(
      "LOAD INVENTORY ITEMS ERROR:",
      error
    );

    inventoryRequestList.innerHTML = `
      <p class="inventori-empty">
        ${escapeInventoryHtml(
          error.message ||
          "Senarai inventori gagal dimuatkan."
        )}
      </p>
    `;

  }
}


/* =========================================
   LABEL SAIZ

   SAIZ kosong = Free Size
========================================= */

function getInventorySizeLabel(item) {

  const size = String(
    item.saiz || ""
  ).trim();

  return size || "Free Size";
}


/* =========================================
   KUNCI INVENTORI + SAIZ
========================================= */

function getInventoryVariantKey(item) {

  const inventoryId = String(
    item.inventoryId || ""
  ).trim();

  const saiz = getInventorySizeLabel(item)
    .toUpperCase();

  return inventoryId + "\u0000" + saiz;
}


/* =========================================
   KELOMPOK ITEM MENGIKUT NAMA / MODEL

   HANYA VARIAN YANG MEMPUNYAI
   STOK POSITIF DIPAPARKAN.
========================================= */
function getInventoryItemGroups() {

  const groups = new Map();

  inventoryItems.forEach(function (item) {

    const stock = Number(item.stokTerkini);

    if (
      !Number.isSafeInteger(stock) ||
      stock <= 0
    ) {
      return;
    }

    const inventoryId = String(
      item.inventoryId || ""
    ).trim();

    if (!inventoryId) {
      return;
    }

    const name = String(
      item.namaItem || ""
    ).trim();

    const model = String(
      item.jenamaModel || ""
    ).trim();

    // Gunakan kunci selamat untuk HTML <option>.
    const key = JSON.stringify([name, model]);

    if (!groups.has(key)) {

      groups.set(key, {
        key: key,
        namaItem: name,
        jenamaModel: model,
        variants: []
      });

    }

    groups.get(key).variants.push(item);

  });

  return Array.from(groups.values());

}

/* =========================================
   CARI VARIAN MENGIKUT SAIZ

   TIADA FALLBACK KEPADA SAIZ LAIN.
========================================= */

function findInventoryVariant(
  group,
  selectedSize
) {

  if (!group || !selectedSize) {
    return null;
  }

  const size = String(selectedSize)
    .trim()
    .toUpperCase();

  const matches = group.variants.filter(
    function (item) {

      return getInventorySizeLabel(item)
        .toUpperCase() === size;

    }
  );

  /*
     Jika saiz sama muncul lebih sekali
     dalam kumpulan yang sama, jangan
     pilih stok secara rawak.
  */

  if (matches.length !== 1) {
    return null;
  }

  return matches[0];
}


/* =========================================
   PILIHAN SAIZ BERDASARKAN STOK SEBENAR

   TIDAK MENJANA XS-XXXL / 4-15
   SECARA AUTOMATIK.

   HANYA SAIZ DARIPADA API.
========================================= */

function getInventorySizeChoices(group) {

  if (!group) return [];

  const sizes = new Map();

  group.variants.forEach(function (item) {

    const stock = Number(
      item.stokTerkini
    );

    if (
      !Number.isSafeInteger(stock) ||
      stock <= 0
    ) {
      return;
    }

    const size = getInventorySizeLabel(item);

    const key = size.toUpperCase();

    if (!sizes.has(key)) {
      sizes.set(key, size);
    }

  });

  return Array.from(sizes.values());
}


/* =========================================
   BINA PILIHAN ITEM
========================================= */
function buildInventoryItemOptions() {

  return getInventoryItemGroups()
    .map(function (group) {

      const label = [
        group.namaItem,
        group.jenamaModel
      ]
        .filter(Boolean)
        .join(" - ");

      return `
        <option
          value="${escapeInventoryHtml(group.key)}"
        >
          ${escapeInventoryHtml(label)}
        </option>
      `;

    })
    .join("");

}


/* =========================================
   BINA SATU SET PERMOHONAN
========================================= */

function createInventoryItemBlock(number) {

  const block = document.createElement("div");

  block.className =
    "inventory-item-block";

  block.dataset.itemNumber =
    String(number);

  block.innerHTML = `

    <h3 class="inventory-item-heading">
      Item ${number}
    </h3>

    <div class="inventory-item-fields">

      <div class="inventory-form-group">

        <label>
          Item Inventori
        </label>

        <select
          class="inventory-item-select"
          aria-label="Item Inventori ${number}"
        >

          <option value="">
            Sila pilih item
          </option>

          ${buildInventoryItemOptions()}

        </select>

      </div>

      <div class="inventory-size-quantity">

        <div class="inventory-form-group">

          <label>
            Saiz
          </label>

          <select
            class="inventory-size-select"
            aria-label="Saiz item ${number}"
            disabled
          >

            <option value="">
              Pilih saiz
            </option>

          </select>

        </div>

        <div class="inventory-form-group">

          <label>
            Kuantiti
          </label>

          <input
            class="inventory-quantity-input"
            type="number"
            min="1"
            step="1"
            inputmode="numeric"
            placeholder="Kuantiti"
            aria-label="Kuantiti item ${number}"
          >

        </div>

      </div>

    </div>

    <div
      class="inventory-item-info"
      hidden
    ></div>

    ${
      number > INITIAL_INVENTORY_ROWS
        ? `
          <div class="inventory-item-actions">

            <button
              type="button"
              class="inventory-remove-button"
            >
              BUANG ITEM
            </button>

          </div>
        `
        : ""
    }

  `;

  const itemSelect = block.querySelector(
    ".inventory-item-select"
  );

  const sizeSelect = block.querySelector(
    ".inventory-size-select"
  );

  itemSelect.addEventListener(
    "change",
    function () {

      updateInventorySizeOptions(block);

    }
  );

  sizeSelect.addEventListener(
    "change",
    function () {

      updateInventoryItemInfo(block);

    }
  );

  const removeButton = block.querySelector(
    ".inventory-remove-button"
  );

  if (removeButton) {

    removeButton.addEventListener(
      "click",
      function () {

        if (isSubmittingInventory) {
          return;
        }

        block.remove();

        renumberInventoryBlocks();

      }
    );

  }

  return block;
}


/* =========================================
   KEMAS KINI NOMBOR ITEM
========================================= */

function renumberInventoryBlocks() {

  const blocks = document.querySelectorAll(
    ".inventory-item-block"
  );

  blocks.forEach(function (block, index) {

    const number = index + 1;

    block.dataset.itemNumber =
      String(number);

    const heading = block.querySelector(
      ".inventory-item-heading"
    );

    if (heading) {
      heading.textContent =
        "Item " + number;
    }

    const itemSelect = block.querySelector(
      ".inventory-item-select"
    );

    const sizeSelect = block.querySelector(
      ".inventory-size-select"
    );

    const quantityInput = block.querySelector(
      ".inventory-quantity-input"
    );

    itemSelect?.setAttribute(
      "aria-label",
      "Item Inventori " + number
    );

    sizeSelect?.setAttribute(
      "aria-label",
      "Saiz item " + number
    );

    quantityInput?.setAttribute(
      "aria-label",
      "Kuantiti item " + number
    );

  });

}


/* =========================================
   KEMAS KINI PILIHAN SAIZ

   HANYA SAIZ YANG ADA STOK.
========================================= */
function updateInventorySizeOptions(block) {

  const itemSelect = block.querySelector(
    ".inventory-item-select"
  );

  const sizeSelect = block.querySelector(
    ".inventory-size-select"
  );

  const info = block.querySelector(
    ".inventory-item-info"
  );

  const quantityInput = block.querySelector(
    ".inventory-quantity-input"
  );

  // Kosongkan pilihan saiz lama
  sizeSelect.innerHTML = `
    <option value="">
      Pilih saiz
    </option>
  `;

  sizeSelect.disabled = true;

  quantityInput.value = "";
  quantityInput.removeAttribute("max");

  info.hidden = true;
  info.innerHTML = "";

  const selectedGroupKey = itemSelect.value;

  if (!selectedGroupKey) {
    return;
  }

  // Cari kumpulan item yang dipilih
  const group = getInventoryItemGroups().find(
    function (record) {
      return record.key === selectedGroupKey;
    }
  );

  if (!group) {
    console.error(
      "Kumpulan inventori tidak ditemui:",
      selectedGroupKey
    );
    return;
  }

  // Ambil saiz yang benar-benar mempunyai stok
  const sizes = getInventorySizeChoices(group);

  console.log(
    "ITEM DIPILIH:",
    group.namaItem,
    "SAIZ TERSEDIA:",
    sizes
  );

  if (sizes.length === 0) {
    return;
  }

  // Masukkan pilihan saiz
  sizes.forEach(function (size) {

    const option = document.createElement(
      "option"
    );

    option.value = size;
    option.textContent = size;

    sizeSelect.appendChild(option);

  });

  // Buka kunci dropdown
  sizeSelect.disabled = false;

  // Jika hanya satu saiz tersedia,
  // pilih saiz tersebut secara automatik
  if (sizes.length === 1) {

    sizeSelect.value = sizes[0];

    updateInventoryItemInfo(block);

  }

}


/* =========================================
   MAKLUMAT STOK SAIZ DIPILIH

   TIADA PENGGUNAAN STOK SAIZ LAIN.
========================================= */

function updateInventoryItemInfo(block) {

  const itemSelect = block.querySelector(
    ".inventory-item-select"
  );

  const sizeSelect = block.querySelector(
    ".inventory-size-select"
  );

  const quantityInput = block.querySelector(
    ".inventory-quantity-input"
  );

  const info = block.querySelector(
    ".inventory-item-info"
  );

  const group = getInventoryItemGroups().find(
    function (record) {

      return record.key === itemSelect.value;

    }
  );

  const selectedSize = String(
    sizeSelect.value || ""
  ).trim();

  info.hidden = true;

  info.innerHTML = "";

  quantityInput.value = "";

  quantityInput.removeAttribute("max");

  if (!group || !selectedSize) {
    return;
  }

  const item = findInventoryVariant(
    group,
    selectedSize
  );

  if (!item) {

    info.hidden = false;

    info.textContent =
      "Tiada rekod stok yang unik untuk saiz ini.";

    return;
  }

  const stock = Number(
    item.stokTerkini
  );

  if (
    !Number.isSafeInteger(stock) ||
    stock <= 0
  ) {

    info.hidden = false;

    info.textContent =
      "Stok saiz ini tidak tersedia.";

    return;
  }

  quantityInput.max = String(stock);

  info.hidden = false;

  info.innerHTML = `

    <div>

      <strong>Saiz:</strong>

      ${escapeInventoryHtml(selectedSize)}

    </div>

    <div>

      <strong>Stok Terkini:</strong>

      ${formatInventoryQuantity(stock)}

      ${escapeInventoryHtml(
        item.unit || ""
      )}

    </div>

  `;

}


/* =========================================
   PAPAR BORANG 5 ITEM
========================================= */

function renderAvailableInventory() {

  if (!inventoryRequestList) {
    return;
  }

  if (
    getInventoryItemGroups().length === 0
  ) {

    inventoryRequestList.innerHTML = `
      <p class="inventori-empty">
        Tiada item inventori tersedia
        untuk permohonan buat masa ini.
      </p>
    `;

    return;
  }

  inventoryRequestList.innerHTML = `

    <form id="inventoryRequestForm">

      <div
        id="inventoryItemsContainer"
        class="inventory-items-container"
      ></div>

      <button
        type="button"
        id="addInventoryItemButton"
        class="inventory-add-button"
      >
        + TAMBAH ITEM
      </button>

      <div
        class="inventory-form-group
               inventory-general-note"
      >

        <label for="inventoryNoteInput">
          Catatan Permohonan
        </label>

        <textarea
          id="inventoryNoteInput"
          rows="3"
          maxlength="1000"
          placeholder="Catatan jika ada"
        ></textarea>

      </div>

      <button
        type="submit"
        id="submitInventoryRequestButton"
        class="inventory-submit-button"
      >
        HANTAR PERMOHONAN
      </button>

      <p class="inventory-form-hint">
        Hanya item yang diisi akan dihantar.
        Setiap item akan mempunyai rekod
        permohonan tersendiri.
      </p>

    </form>

  `;

  const container = document.getElementById(
    "inventoryItemsContainer"
  );

  for (
    let number = 1;
    number <= INITIAL_INVENTORY_ROWS;
    number++
  ) {

    container.appendChild(
      createInventoryItemBlock(number)
    );

  }

  const addButton = document.getElementById(
    "addInventoryItemButton"
  );

  addButton.addEventListener(
    "click",
    function () {

      if (isSubmittingInventory) {
        return;
      }

      const number =
        container.children.length + 1;

      const block =
        createInventoryItemBlock(number);

      container.appendChild(block);

      block.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    }
  );

  document
    .getElementById("inventoryRequestForm")
    .addEventListener(
      "submit",
      submitInventoryRequest
    );

}


/* =========================================
   BACA ITEM YANG DIISI

   KOSONG SEPENUHNYA = ABAIKAN
   SEPARUH LENGKAP = TOLAK
========================================= */

function collectInventoryRequests() {

  const blocks = Array.from(
    document.querySelectorAll(
      ".inventory-item-block"
    )
  );

  const requests = [];

  const selectedItems = new Set();

  for (const block of blocks) {

    const number =
      block.dataset.itemNumber;

    const itemGroup = block.querySelector(
      ".inventory-item-select"
    ).value;

    const saiz = block.querySelector(
      ".inventory-size-select"
    ).value;

    const quantityText = block.querySelector(
      ".inventory-quantity-input"
    ).value.trim();

    /*
       Abaikan ruangan kosong sepenuhnya.
    */

    if (
      !itemGroup &&
      !saiz &&
      !quantityText
    ) {
      continue;
    }

    if (
      !itemGroup ||
      !saiz ||
      !quantityText
    ) {

      throw new Error(
        "Lengkapkan Item Inventori, " +
        "Saiz dan Kuantiti bagi Item " +
        number + "."
      );

    }

    const group = getInventoryItemGroups().find(
      function (record) {

        return record.key === itemGroup;

      }
    );

    if (!group) {

      throw new Error(
        "Item " + number +
        ": pilihan inventori tidak sah."
      );

    }

    /*
       WAJIB padan dengan saiz sebenar.
       Jangan guna rekod saiz lain.
    */

    const item = findInventoryVariant(
      group,
      saiz
    );

    if (!item) {

      throw new Error(
        "Item " + number +
        ": tiada rekod stok yang unik " +
        "bagi saiz " + saiz + "."
      );

    }

    const quantity = Number(
      quantityText
    );

    if (
      !Number.isSafeInteger(quantity) ||
      quantity < 1
    ) {

      throw new Error(
        "Item " + number +
        ": kuantiti mesti nombor bulat " +
        "sekurang-kurangnya 1."
      );

    }

    const stock = Number(
      item.stokTerkini
    );

    if (
      !Number.isSafeInteger(stock) ||
      stock <= 0
    ) {

      throw new Error(
        "Item " + number +
        ": stok saiz " +
        saiz +
        " tidak tersedia."
      );

    }

    if (quantity > stock) {

      throw new Error(
        "Item " + number +
        ": kuantiti melebihi stok " +
        "terkini (" + stock + ")."
      );

    }

    const inventoryId = String(
      item.inventoryId || ""
    ).trim();

    if (!inventoryId) {

      throw new Error(
        "Item " + number +
        ": INVENTORY_ID tidak sah."
      );

    }

    /*
       Elak item + saiz sama dipohon
       dua kali dalam satu borang.
    */

    const uniqueKey =
      getInventoryVariantKey(item);

    if (selectedItems.has(uniqueKey)) {

      throw new Error(
        "Item " + number +
        ": item dan saiz yang sama " +
        "telah dipilih. Gabungkan " +
        "kuantiti dalam satu ruangan."
      );

    }

    selectedItems.add(uniqueKey);

    requests.push({

      block: block,

      number: number,

      inventoryId: inventoryId,

      saiz: getInventorySizeLabel(item),

      kuantiti: quantity

    });

  }

  if (requests.length === 0) {

    throw new Error(
      "Sila isi sekurang-kurangnya " +
      "satu item permohonan."
    );

  }

  return requests;

}


/* =========================================
   KUNCI / BUKA BORANG
========================================= */

function setInventoryFormBusy(busy) {

  const form = document.getElementById(
    "inventoryRequestForm"
  );

  if (!form) {
    return;
  }

  form
    .querySelectorAll(
      "button, input, select, textarea"
    )
    .forEach(function (element) {

      element.disabled = busy;

    });

  const submitButton = document.getElementById(
    "submitInventoryRequestButton"
  );

  if (submitButton) {

    submitButton.textContent = busy
      ? "MENGHANTAR..."
      : "HANTAR PERMOHONAN";

  }

}


/* =========================================
   HANTAR BERBILANG PERMOHONAN

   API MENERIMA SATU ITEM
   BAGI SETIAP PANGGILAN.

   PENGHANTARAN BERURUTAN.
========================================= */

async function submitInventoryRequest(event) {

  event.preventDefault();

  if (isSubmittingInventory) {
    return;
  }

  let requests;

  try {

    requests = collectInventoryRequests();

  } catch (error) {

    showInventoriMessage(
      error.message
    );

    return;

  }

  const noteInput = document.getElementById(
    "inventoryNoteInput"
  );

  const catatan = String(
    noteInput?.value || ""
  ).trim();

  if (catatan.length > 1000) {

    showInventoriMessage(
      "Catatan terlalu panjang."
    );

    return;

  }

  const confirmed = window.confirm(
    "Hantar " +
    requests.length +
    " item permohonan inventori?"
  );

  if (!confirmed) {
    return;
  }

  isSubmittingInventory = true;

  setInventoryFormBusy(true);

  hideInventoriMessage();

  let successCount = 0;

  let failedNumber = null;

  let failureMessage = "";

  try {

    for (const request of requests) {

      const submitButton =
        document.getElementById(
          "submitInventoryRequestButton"
        );

      if (submitButton) {

        submitButton.textContent =
          "MENGHANTAR " +
          (successCount + 1) +
          "/" +
          requests.length +
          "...";

      }

      let result;

      try {

        result = await apiPost({

          action: "inventory_request_create",

          email: currentInventoryEmail,

          data: {

            inventoryId:
              request.inventoryId,

            saiz:
              request.saiz,

            kuantiti:
              request.kuantiti,

            catatan:
              catatan

          }

        });

      } catch (error) {

        failedNumber =
          request.number;

        failureMessage =
          error.message ||
          "Sambungan API gagal.";

        break;

      }

      if (
        !result ||
        result.success !== true
      ) {

        failedNumber =
          request.number;

        failureMessage =
          result?.message ||
          "Permohonan gagal dihantar.";

        break;

      }

      successCount++;

      /*
         Kosongkan hanya item yang
         API sahkan berjaya.
      */

      const block = request.block;

      const itemSelect = block.querySelector(
        ".inventory-item-select"
      );

      const sizeSelect = block.querySelector(
        ".inventory-size-select"
      );

      const quantityInput = block.querySelector(
        ".inventory-quantity-input"
      );

      const info = block.querySelector(
        ".inventory-item-info"
      );

      itemSelect.value = "";

      sizeSelect.innerHTML = `
        <option value="">
          Pilih saiz
        </option>
      `;

      sizeSelect.disabled = true;

      quantityInput.value = "";

      quantityInput.removeAttribute("max");

      info.hidden = true;

      info.innerHTML = "";

    }

    /*
       Jika sebahagian berjaya,
       jangan hantar semula item berjaya.
    */

    if (failedNumber !== null) {

      showInventoriMessage(

        successCount +
        " daripada " +
        requests.length +
        " item berjaya dihantar. " +
        "Penghantaran terhenti pada Item " +
        failedNumber +
        ": " +
        failureMessage +
        " Semak Rekod Permohonan " +
        "sebelum mencuba lagi.",

        "error"

      );

      return;

    }

    /*
       Semua item berjaya.
    */

    showInventoriMessage(

      "Berjaya menghantar " +
      successCount +
      " item permohonan.",

      "success"

    );

    if (noteInput) {
      noteInput.value = "";
    }

    /*
       Muat semula senarai stok.
    */

    try {

      const result = await apiPost({

        action: "inventory_request_items",

        email: currentInventoryEmail

      });

      if (
        result &&
        result.success === true &&
        Array.isArray(result.inventory)
      ) {

        inventoryItems =
          result.inventory;

      }

    } catch (error) {

      console.warn(
        "REFRESH INVENTORY AFTER SUBMIT:",
        error
      );

    }

    renderAvailableInventory();

  } finally {

    isSubmittingInventory = false;

    setInventoryFormBusy(false);

  }

}


/* =========================================
   LOAD REKOD PERMOHONAN
========================================= */

async function loadInventoryRequests() {

  const loadingHtml = `
    <p class="inventori-empty">
      Memuatkan rekod permohonan...
    </p>
  `;

  if (inventoryRequestHistory) {

    inventoryRequestHistory.innerHTML =
      loadingHtml;

  }

  if (inventoryRequestStatus) {

    inventoryRequestStatus.innerHTML =
      loadingHtml;

  }

  try {

    const result = await apiPost({

      action: "inventory_request_history",

      email: currentInventoryEmail

    });

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Rekod permohonan gagal dimuatkan."
      );

    }

    inventoryRequests = Array.isArray(
      result.requests
    )
      ? result.requests
      : [];

    renderInventoryRequestHistory();

    renderInventoryRequestStatus();

  } catch (error) {

    console.error(
      "LOAD INVENTORY REQUESTS ERROR:",
      error
    );

    const errorHtml = `
      <p class="inventori-empty">
        ${escapeInventoryHtml(
          error.message ||
          "Rekod permohonan gagal dimuatkan."
        )}
      </p>
    `;

    if (inventoryRequestHistory) {

      inventoryRequestHistory.innerHTML =
        errorHtml;

    }

    if (inventoryRequestStatus) {

      inventoryRequestStatus.innerHTML =
        errorHtml;

    }

  }

}


/* =========================================
   PAPAR REKOD PERMOHONAN
========================================= */

function renderInventoryRequestHistory() {

  if (!inventoryRequestHistory) {
    return;
  }

  if (inventoryRequests.length === 0) {

    inventoryRequestHistory.innerHTML = `
      <p class="inventori-empty">
        Tiada rekod permohonan.
      </p>
    `;

    return;

  }

  inventoryRequestHistory.innerHTML =
    inventoryRequests
      .map(function (request) {

        return `

          <article
            class="inventory-request-card"
          >

            <h3>
  ${escapeInventoryHtml(
    getInventoryRequestTitle(request)
  )}
</h3>
            <p>
              <strong>
                Tarikh Mohon:
              </strong>

              ${escapeInventoryHtml(
                request.tarikhMohon || "-"
              )}
            </p>

            <p>
              <strong>Saiz:</strong>

              ${escapeInventoryHtml(
                request.saiz || "Free Size"
              )}
            </p>

            <p>
              <strong>
                Kuantiti Dipohon:
              </strong>

              ${escapeInventoryHtml(
                request.kuantitiDipohon ?? "-"
              )}
            </p>

            <p>
              <strong>Catatan:</strong>

              ${escapeInventoryHtml(
                request.catatanPemohon || "-"
              )}
            </p>

            <p>
              <strong>Status:</strong>

              <span class="${getInventoryStatusClass(
                request.statusPermohonan
              )}">

                ${escapeInventoryHtml(
                  request.statusPermohonan || "-"
                )}

              </span>
            </p>

          </article>

        `;

      })
      .join("");

}


/* =========================================
   PAPAR STATUS PERMOHONAN
========================================= */

function renderInventoryRequestStatus() {

  if (!inventoryRequestStatus) {
    return;
  }

  if (inventoryRequests.length === 0) {

    inventoryRequestStatus.innerHTML = `
      <p class="inventori-empty">
        Tiada status permohonan.
      </p>
    `;

    return;

  }

  inventoryRequestStatus.innerHTML =
    inventoryRequests
      .map(function (request) {

        return `

          <article
            class="inventory-request-card"
          >

            <h3>
  ${escapeInventoryHtml(
    getInventoryRequestTitle(request)
  )}
</h3>

            <p>
              <strong>
                Tarikh Mohon:
              </strong>

              ${escapeInventoryHtml(
                request.tarikhMohon || "-"
              )}
            </p>

            <p>
              <strong>Saiz:</strong>

              ${escapeInventoryHtml(
                request.saiz || "Free Size"
              )}
            </p>

            <p>
              <strong>
                Kuantiti Dipohon:
              </strong>

              ${escapeInventoryHtml(
                request.kuantitiDipohon ?? "-"
              )}
            </p>

            <p>
              <strong>Status:</strong>

              <span class="${getInventoryStatusClass(
                request.statusPermohonan
              )}">

                ${escapeInventoryHtml(
                  request.statusPermohonan || "-"
                )}

              </span>
            </p>

            ${
              request.kuantitiDilulus !== "" &&
              request.kuantitiDilulus != null

                ? `

                  <p>
                    <strong>
                      Kuantiti Dilulus:
                    </strong>

                    ${escapeInventoryHtml(
                      request.kuantitiDilulus
                    )}
                  </p>

                `

                : ""
            }

            ${
              request.catatanPelulus

                ? `

                  <p>
                    <strong>
                      Catatan Pelulus:
                    </strong>

                    ${escapeInventoryHtml(
                      request.catatanPelulus
                    )}
                  </p>

                `

                : ""
            }

            ${
              request.tarikhLulus

                ? `

                  <p>
                    <strong>
                      Tarikh Kelulusan:
                    </strong>

                    ${escapeInventoryHtml(
                      request.tarikhLulus
                    )}
                  </p>

                `

                : ""
            }

            ${
              request.kuantitiDiterima !== "" &&
              request.kuantitiDiterima != null

                ? `

                  <p>
                    <strong>
                      Kuantiti Diterima:
                    </strong>

                    ${escapeInventoryHtml(
                      request.kuantitiDiterima
                    )}
                  </p>

                `

                : ""
            }

            ${
              request.tarikhTerima

                ? `

                  <p>
                    <strong>
                      Tarikh Terima:
                    </strong>

                    ${escapeInventoryHtml(
                      request.tarikhTerima
                    )}
                  </p>

                `

                : ""
            }

          </article>

        `;

      })
      .join("");

}


/* =========================================
   BUTTON KEMBALI
========================================= */

document
  .getElementById("backButton")
  ?.addEventListener(
    "click",
    function () {

      window.location.href =
        "dashboard.html";

    }
  );


/* =========================================
   BUTTON HOME
========================================= */

document
  .getElementById("homeButton")
  ?.addEventListener(
    "click",
    function () {

      window.location.href =
        "dashboard.html";

    }
  );


/* =========================================
   START
========================================= */

async function initializeInventori() {

  const session =
    getInventoriSession();

  if (
    !session ||
    session.isLoggedIn !== true ||
    !session.googleEmail
  ) {

    window.location.href =
      "../index.html";

    return;

  }

  currentInventoryEmail =
    session.googleEmail;

  loadInventoriMember(session);

  await loadAvailableInventory();

}

initializeInventori();