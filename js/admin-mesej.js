
"use strict";

/* =====================================================
   JANA MESEJ - PEMILIHAN AHLI PASPA
===================================================== */

let adminMessageMembers = [];
const selectedMessageMembers = new Set();

const MESSAGE_ZONES = {
  "ZON UTARA": [
    "PERLIS", "KEDAH", "PULAPAU",
    "PULAU PINANG", "PERAK"
  ],
  "ZON TENGAH": [
    "SELANGOR", "WP KUALA LUMPUR",
    "WP PUTRAJAYA", "ALPHA",
    "IPPA", "NEGERI SEMBILAN"
  ],
  "ZON SELATAN": [
    "MELAKA", "JOHOR", "PULAPAS"
  ],
  "ZON TIMUR": [
    "KELANTAN", "TERENGGANU",
    "PAHANG", "PULAPAT"
  ],
  "ZON SABAH DAN LABUAN": [
    "SABAH", "WP LABUAN"
  ],
  "ZON SARAWAK": [
    "SARAWAK"
  ]
};

const MESSAGE_RANKS = [
  "KOL.(PA)", "LT.KOL.(PA)", "MEJAR (PA)",
  "KAPTEN (PA)", "LT. (PA)", "LT.M (PA)",
  "ST. (PA)", "SK. (PA)", "SM. (PA)",
  "SJN. MEJ. I (PA)", "SJN. MEJ II (PA)",
  "SJN. (PA)", "KPL. (PA)",
  "L/KPL. (PA)", "PBT. (PA)"
];

function messageMemberId(value) {
  return String(value ?? "").trim();
}

function messageNormalizeState(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/^W\.P\.\s*/i, "WP ")
    .replace(/\s+/g, " ");
}

function messageDisplayName(member) {
  return (
    String(member.pangkat || "") + " " +
    String(member.namaPenuh || "")
  ).replace(/\s+/g, " ").trim();
}

function messageRankIndex(rank) {
  const index = MESSAGE_RANKS.findIndex(
    item => item.toUpperCase() ===
      String(rank || "").trim().toUpperCase()
  );
  return index === -1 ? 999 : index;
}

function sortMessageMembers(members) {
  return [...members].sort((a, b) => {
    const difference =
      messageRankIndex(a.pangkat) -
      messageRankIndex(b.pangkat);

    return difference ||
      a.namaPenuh.localeCompare(b.namaPenuh, "ms");
  });
}

function getMessageAdminEmail() {
  try {
    const session = JSON.parse(
      localStorage.getItem("paspaGoSession") || "{}"
    );
    return String(
      session.googleEmail || session.email || ""
    ).trim().toLowerCase();
  } catch {
    return "";
  }
}

function getFilteredMessageMembers() {
  const zone = document.getElementById(
    "messageZoneFilter"
  ).value;

  const keyword = document.getElementById(
    "messageMemberSearch"
  ).value.trim().toLowerCase();

  return adminMessageMembers.filter(member => {
    const state = messageNormalizeState(
      member.negeriBerkhidmat
    );

    const matchesZone =
      zone === "SEMUA" ||
      (MESSAGE_ZONES[zone] || []).includes(state);

    const searchText = [
      member.idPaspa,
      member.pangkat,
      member.namaPenuh,
      member.negeriBerkhidmat,
      member.cawanganBerkhidmat
    ].join(" ").toLowerCase();

    return matchesZone && searchText.includes(keyword);
  });
}

function renderMessageMembers() {
  const container = document.getElementById(
    "messageMemberList"
  );

  container.replaceChildren();

  const members = getFilteredMessageMembers();

  if (!members.length) {
    container.textContent =
      "Tiada ahli ditemui dalam pilihan ini.";
  }

  members.forEach(member => {
    const label = document.createElement("label");
    label.className = "message-member-item";
    label.style.cssText =
      "display:flex;gap:10px;padding:12px;" +
      "border:1px solid #d9e4f0;border-radius:10px;" +
      "margin-bottom:7px;background:#fff;";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked =
      selectedMessageMembers.has(member.idPaspa);

    const info = document.createElement("div");

    const name = document.createElement("strong");
    name.textContent = messageDisplayName(member);

    const meta = document.createElement("div");
    meta.style.cssText =
      "font-size:12px;color:#64748b;margin-top:4px;";
    meta.textContent =
      "ID PASPA: " + member.idPaspa +
      " | " + member.negeriBerkhidmat;

    info.append(name, meta);
    label.append(checkbox, info);

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedMessageMembers.add(member.idPaspa);
      } else {
        selectedMessageMembers.delete(member.idPaspa);
      }
      updateMessageSelection();
    });

    container.appendChild(label);
  });

  updateMessageSelection();
}

function updateMessageSelection() {
  document.getElementById(
    "messageMemberCount"
  ).textContent =
    selectedMessageMembers.size + " dipilih";

  const visible = getFilteredMessageMembers();
  const selectedCount = visible.filter(
    member => selectedMessageMembers.has(member.idPaspa)
  ).length;

  const selectAll = document.getElementById(
    "selectAllMessageMembers"
  );

  selectAll.checked =
    visible.length > 0 &&
    selectedCount === visible.length;

  selectAll.indeterminate =
    selectedCount > 0 &&
    selectedCount < visible.length;

  const selectedContainer = document.getElementById(
    "selectedMessageMemberList"
  );

  selectedContainer.replaceChildren();

  const selected = adminMessageMembers.filter(
    member => selectedMessageMembers.has(member.idPaspa)
  );

  if (!selected.length) {
    selectedContainer.textContent =
      "Tiada penerima dipilih.";
    return;
  }

  selected.forEach(member => {
    const row = document.createElement("div");
    row.style.cssText =
      "display:flex;justify-content:space-between;" +
      "align-items:center;gap:8px;padding:9px;" +
      "margin-top:7px;background:#f3f7fd;" +
      "border-radius:8px;";

    const name = document.createElement("span");
    name.style.fontSize = "12px";
    name.textContent =
      messageDisplayName(member) +
      " | ID " + member.idPaspa;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "BUANG";
    remove.style.cssText =
      "border:0;border-radius:6px;padding:7px;" +
      "color:#b32020;background:#ffecec;cursor:pointer;";

    remove.addEventListener("click", () => {
      selectedMessageMembers.delete(member.idPaspa);
      renderMessageMembers();
    });

    row.append(name, remove);
    selectedContainer.appendChild(row);
  });
}

async function loadMessageMembers() {
  const container = document.getElementById(
    "messageMemberList"
  );

  container.textContent = "Memuatkan senarai ahli...";

  try {
    const result = await apiPost({
      action: "admin_operation_members",
      email: getMessageAdminEmail()
    });

    if (!result || result.success !== true) {
      throw new Error(
        result?.message || "Gagal memuatkan ahli."
      );
    }

    const unique = new Map();

    (Array.isArray(result.members)
      ? result.members : []
    ).forEach(member => {
      const id = messageMemberId(member.idPaspa);
      if (!id) return;

      unique.set(id, {
        idPaspa: id,
        pangkat: String(member.pangkat || "").trim(),
        namaPenuh: String(
          member.namaPenuh || ""
        ).trim(),
        negeriBerkhidmat: String(
          member.negeriBerkhidmat || ""
        ).trim(),
        cawanganBerkhidmat: String(
          member.cawanganBerkhidmat || ""
        ).trim()
      });
    });

    adminMessageMembers = sortMessageMembers(
      [...unique.values()]
    );

    renderMessageMembers();

  } catch (error) {
    console.error("LOAD MESSAGE MEMBERS:", error);
    container.textContent =
      "Senarai ahli tidak dapat dimuatkan: " +
      error.message;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById(
    "messageZoneFilter"
  ).addEventListener("change", renderMessageMembers);

  document.getElementById(
    "messageMemberSearch"
  ).addEventListener("input", renderMessageMembers);

  document.getElementById(
    "selectAllMessageMembers"
  ).addEventListener("change", event => {
    getFilteredMessageMembers().forEach(member => {
      if (event.target.checked) {
        selectedMessageMembers.add(member.idPaspa);
      } else {
        selectedMessageMembers.delete(member.idPaspa);
      }
    });
    renderMessageMembers();
  });

  loadMessageMembers();
});

/* =====================================================
   SENARAI PENERIMA UNTUK JANA MESEJ
===================================================== */

function getSelectedAdminMessageRecipients() {

  return adminMessageMembers
    .filter(function(member) {

      return selectedMessageMembers.has(
        member.idPaspa
      );

    })
    .map(function(member) {

      return {
        idPaspa: member.idPaspa,
        namaPenuh: member.namaPenuh,
        pangkat: member.pangkat
      };

    });

}

/* =====================================================
   SEDIAKAN DATA JANA MESEJ
===================================================== */

function getAdminMessageData() {

  const tajuk = document.getElementById(
    "messageSubject"
  ).value.trim();



const editorHtml = document.getElementById(
  "messageEditor"
).innerHTML.trim();

if (typeof DOMPurify === "undefined") {
  throw new Error(
    "Sistem keselamatan HTML tidak tersedia. Mesej tidak boleh dihantar."
  );
}


const butiranMesej = DOMPurify.sanitize(editorHtml, {
  ALLOWED_TAGS: [
    "p", "div", "br", "span",
    "b", "strong", "i", "em", "u",
    "font",
    "ul", "ol", "li",
    "table", "thead", "tbody", "tr",
    "th", "td",
    "a", "img"
  ],
  ALLOWED_ATTR: [
    "color",
    "href", "src", "alt",
    "title", "target", "rel",
    "colspan", "rowspan"
  ],
  ALLOW_DATA_ATTR: false
});




  const keutamaan = document.getElementById(
    "messagePriority"
  ).value;

  const recipients =
    getSelectedAdminMessageRecipients();

  return {
    tajuk: tajuk,
    butiranMesej: butiranMesej,
    keutamaan: keutamaan,
    recipients: recipients,
    pushNotify: document.getElementById(
      "pushNotify"
    ).checked,
    popupNotify: document.getElementById(
      "popupNotify"
    ).checked
  };

}