
"use strict";

(() => {

  const $ = id =>
    document.getElementById(id);

  let adminEmail = "";
  let loading = false;

  /*
    Simpan nama ahli yang sedang dibuka
    supaya kad tidak tertutup selepas
    senarai dimuat semula.
  */

  const openedGroups = new Set();


  /* =========================================
     MESSAGE
  ========================================= */

  const message = (
    text,
    type = ""
  ) => {

    const el = $("notice");

    el.textContent = text;
    el.className = "notice " + type;
    el.hidden = false;

  };


  /* =========================================
     SESSION
  ========================================= */

  const getEmail = () => {

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

    } catch (_) {

      return "";

    }

  };


  /* =========================================
     API - KEKAL SEPERTI KOD ASAL
  ========================================= */

  const call = async (
    action,
    extra = {}
  ) => {

    const result = await apiPost({

      action,
      email: adminEmail,
      ...extra

    });

    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        result?.error ||
        "Permintaan gagal."
      );

    }

    return result;

  };


  /* =========================================
     CREATE ELEMENT
  ========================================= */

  const add = (
    parent,
    tag,
    text,
    className
  ) => {

    const node =
      document.createElement(tag);

    node.textContent =
      text ?? "";

    if (className) {

      node.className =
        className;

    }

    parent.appendChild(node);

    return node;

  };


  const showValue = value => {

    return String(
      value ?? ""
    ).trim() || "-";

  };


  /* =========================================
     FORMAT DATE
  ========================================= */

  const date = value => {

    if (!value) {
      return "-";
    }

    const s = String(value);

    if (
      /^\d{2}\/\d{2}\/\d{4}/.test(s)
    ) {

      return s;

    }

    const d = new Date(s);

    return Number.isNaN(
      d.getTime()
    )
      ? s
      : new Intl.DateTimeFormat(
          "ms-MY",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          }
        ).format(d);

  };


  /* =========================================
     STATUS BADGE
  ========================================= */

  const statusBadge = (
    parent,
    status
  ) => {

    const value = String(
      status || ""
    )
      .trim()
      .toUpperCase();

    let className = "pill";

    if (
      value === "SELESAI SERAHAN"
    ) {

      className += " success";

    } else if (
      value === "SERAHAN SEPARA" ||
      value === "MENUNGGU KELULUSAN"
    ) {

      className += " warning";

    } else if (
      value === "DITOLAK"
    ) {

      className += " rejected";

    }

    return add(
      parent,
      "span",
      showValue(value),
      className
    );

  };


  /* =========================================
     KUMPULKAN PERMOHONAN MENGIKUT AHLI
  ========================================= */

  const groupByMember = requests => {

    const groups = new Map();

    requests.forEach(r => {

      const id = String(
        r.idPaspa || ""
      ).trim();

      const key = id ||
        String(
          r.namaAhli || ""
        )
          .trim()
          .toUpperCase();

      if (!groups.has(key)) {

        groups.set(key, {

          key,
          idPaspa: id,
          namaAhli:
            r.namaAhli || "-",
          requests: []

        });

      }

      groups
        .get(key)
        .requests
        .push(r);

    });

    return Array.from(
      groups.values()
    );

  };


/* =========================================
   KUMPULKAN PERMOHONAN MENGIKUT TARIKH
========================================= */

const groupRequestsByDate = requests => {

  const groups = new Map();

  requests.forEach(r => {

    const tarikh =
      date(
        r.tarikhMohon
      );

    const key =
      tarikh || "-";

    if (!groups.has(key)) {

      groups.set(
        key,
        {
          tarikh: key,
          requests: []
        }
      );

    }

    groups
      .get(key)
      .requests
      .push(r);

  });


  return Array.from(
    groups.values()
  );

};


  /* =========================================
     KAD AHLI - BOLEH BUKA / TUTUP
  ========================================= */

  const memberGroup = (
    group,
    section,
    createItem
  ) => {

    const details =
      document.createElement(
        "details"
      );

    details.className =
      "member-group";

    const groupKey =
      section + ":" + group.key;

    details.open =
      openedGroups.has(groupKey);

    const summary =
      document.createElement(
        "summary"
      );

    summary.className =
      "member-heading";

    const title =
      document.createElement(
        "div"
      );

    add(
      title,
      "span",
      showValue(
        group.namaAhli
      ),
      "member-name"
    );

    add(
      title,
      "span",
      `ID PASPA ${showValue(
        group.idPaspa
      )} · ${group.requests.length} permohonan`,
      "member-subtitle"
    );

    summary.appendChild(title);

    add(
      summary,
      "span",
      "⌄",
      "member-chevron"
    );

    details.appendChild(
      summary
    );

    const body =
      add(
        details,
        "div",
        "",
        "member-body"
      );

    add(
      body,
      "div",
      "",
      "member-divider"
    );

    /* =====================================
   PAPAR KANDUNGAN AHLI
===================================== */

if (section === "processed") {

  const dateGroups =
    groupRequestsByDate(
      group.requests
    );


  dateGroups.forEach(
    dateGroup => {

      body.appendChild(
        processedDateGroup(
          dateGroup
        )
      );

    }
  );

} else {

  group.requests.forEach(
    r => {

      body.appendChild(
        createItem(r)
      );

    }
  );

}

    details.addEventListener(
      "toggle",
      () => {

        if (details.open) {

          openedGroups.add(
            groupKey
          );

        } else {

          openedGroups.delete(
            groupKey
          );

        }

      }
    );

    return details;

  };


  /* =========================================
     MAKLUMAT ITEM PERMOHONAN
  ========================================= */

  const itemInfo = r => {

    const card =
      document.createElement(
        "article"
      );

    card.className =
      "request";

    add(
      card,
      "h3",
      showValue(
        r.namaItem
      )
    );

    add(
      card,
      "p",
      `Saiz: ${showValue(
        r.saiz
      )} | Kuantiti dipohon: ${showValue(
        r.kuantitiDipohon
      )}`
    );

    add(
      card,
      "p",
      `Tarikh: ${date(
        r.tarikhMohon
      )}`
    );

    add(
      card,
      "p",
      `Catatan pemohon: ${showValue(
        r.catatanPemohon
      )}`
    );

    add(
      card,
      "p",
      `ID Permohonan: ${showValue(
        r.requestId
      )}`,
      "meta"
    );

    statusBadge(
      card,
      r.statusPermohonan
    );

    return card;

  };


  /* =========================================
     PERMOHONAN MASUK
     LULUS / TOLAK
  ========================================= */

  const pendingItem = r => {

    const card =
      itemInfo(r);

    const controls =
      add(
        card,
        "div",
        "",
        "controls"
      );

    const qLabel =
      add(
        controls,
        "label",
        "Kuantiti diluluskan"
      );

    const qty =
      document.createElement(
        "input"
      );

    qty.type = "number";
    qty.min = "1";

    qty.max = String(
      r.kuantitiDipohon
    );

    qty.step = "1";

    qty.value = String(
      r.kuantitiDipohon
    );

    qLabel.appendChild(
      qty
    );

    const noteLabel =
      add(
        controls,
        "label",
        "Catatan pelulus (jika ada)"
      );

    const note =
      document.createElement(
        "textarea"
      );

    note.rows = 2;
    note.maxLength = 1000;

    noteLabel.appendChild(
      note
    );

    const actions =
      add(
        controls,
        "div",
        "",
        "actions"
      );

    const approve =
      add(
        actions,
        "button",
        "LULUS",
        "primary"
      );

    approve.type =
      "button";

    const reject =
      add(
        actions,
        "button",
        "TOLAK",
        "danger"
      );

    reject.type =
      "button";


    /* =====================================
       PROSES KEPUTUSAN
    ===================================== */

    const decide =
      async decision => {

        const quantity =
          decision === "LULUS"
            ? Number(
                qty.value
              )
            : 0;

        if (
          decision === "LULUS" &&
          (
            !Number.isSafeInteger(
              quantity
            ) ||
            quantity < 1 ||
            quantity >
              Number(
                r.kuantitiDipohon
              )
          )
        ) {

          message(
            "Kuantiti diluluskan tidak sah.",
            "error"
          );

          return;

        }

        const confirmed =
          window.confirm(

            `Pasti mahu ${
              decision === "LULUS"
                ? "meluluskan"
                : "menolak"
            } permohonan ${r.requestId}?`

          );

        if (!confirmed) {
          return;
        }

        approve.disabled = true;
        reject.disabled = true;

        try {

          await call(
            "admin_inventory_request_decide",
            {

              requestId:
                r.requestId,

              decision:
                decision,

              kuantitiDilulus:
                quantity,

              catatanPelulus:
                note.value.trim()

            }
          );

          await load();

          message(
            "Keputusan permohonan berjaya disimpan.",
            "success"
          );

        } catch (error) {

          message(
            error.message,
            "error"
          );

          approve.disabled = false;
          reject.disabled = false;

        }

      };


    approve.addEventListener(
      "click",
      () => decide(
        "LULUS"
      )
    );

    reject.addEventListener(
      "click",
      () => decide(
        "TOLAK"
      )
    );

    return card;

  };


  /* =========================================
     REKOD KELULUSAN
  ========================================= */

  const processedItem = r => {

    const card =
      itemInfo(r);

    add(
      card,
      "p",
      `Diluluskan: ${showValue(
        r.kuantitiDilulus
      )} | Pelulus: ${showValue(
        r.namaPelulus
      )}`
    );

    add(
      card,
      "p",
      `Catatan pelulus: ${showValue(
        r.catatanPelulus
      )}`
    );

    add(
      card,
      "p",
      `Tarikh keputusan: ${date(
        r.tarikhLulus
      )}`
    );

    if (
      r.statusPermohonan !==
      "DITOLAK"
    ) {

      const approved =
        Number(
          r.kuantitiDilulus
        ) || 0;

      const received =
        Number(
          r.kuantitiDiterima
        ) || 0;

      add(
        card,
        "p",
        `Diluluskan: ${approved} | Telah diserahkan: ${received} | Baki: ${Math.max(
          0,
          approved - received
        )}`
      );

    }

    return card;

  };


/* =========================================
   FORMAT KUANTITI INVENTORI
========================================= */

const formatInventoryQuantity = (
  quantity,
  itemName
) => {

  const qty =
    Number(quantity) || 0;


  const item =
    String(
      itemName || ""
    )
      .trim()
      .toLowerCase();


  let unit = "unit";


  if (
    item.includes("kasut") ||
    item.includes("boot")
  ) {

    unit = "pasang";

  } else if (

    item.includes("baju") ||
    item.includes("seluar") ||
    item.includes("jaket")

  ) {

    unit = "helai";

  }


  return qty + " " + unit;

};



/* =========================================
   REKOD KELULUSAN - KELOMPOK TARIKH
========================================= */

const processedDateGroup = group => {

  const box =
    document.createElement(
      "section"
    );

  box.className =
    "approval-date-group";


  /* =====================================
     TARIKH PERMOHONAN
  ===================================== */

  const dateHeader =
    add(
      box,
      "div",
      "",
      "approval-date-header"
    );


  add(
    dateHeader,
    "span",
    "Tarikh:",
    "approval-date-label"
  );


  add(
    dateHeader,
    "strong",
    group.tarikh,
    "approval-date-value"
  );


  /* =====================================
     JADUAL
  ===================================== */

  const tableWrap =
    add(
      box,
      "div",
      "",
      "approval-table-wrap"
    );


  const table =
    document.createElement(
      "table"
    );

  table.className =
    "approval-table";


  /* ---------- HEADER ---------- */

  const thead =
    document.createElement(
      "thead"
    );

  const headerRow =
    document.createElement(
      "tr"
    );


  [
    "Item",
    "Saiz",
    "Dipohon",
    "Diluluskan"
  ].forEach(text => {

    const th =
      document.createElement(
        "th"
      );

    th.textContent =
      text;

    headerRow.appendChild(
      th
    );

  });


  thead.appendChild(
    headerRow
  );

  table.appendChild(
    thead
  );


  /* ---------- BODY ---------- */

  const tbody =
    document.createElement(
      "tbody"
    );


  group.requests.forEach(r => {

    const tr =
      document.createElement(
        "tr"
      );


    const item =
      document.createElement(
        "td"
      );

    item.textContent =
      showValue(
        r.namaItem
      );


    const size =
      document.createElement(
        "td"
      );

    size.textContent =
      showValue(
        r.saiz
      );


    const requested =
      document.createElement(
        "td"
      );

    requested.textContent =
      formatInventoryQuantity(
        r.kuantitiDipohon,
        r.namaItem
      );


    const approved =
      document.createElement(
        "td"
      );

    approved.textContent =
      String(
        r.statusPermohonan || ""
      )
        .trim()
        .toUpperCase() ===
        "DITOLAK"
          ? "-"
          : formatInventoryQuantity(
              r.kuantitiDilulus,
              r.namaItem
            );


    tr.appendChild(item);
    tr.appendChild(size);
    tr.appendChild(requested);
    tr.appendChild(approved);

    tbody.appendChild(tr);

  });


  table.appendChild(
    tbody
  );

  tableWrap.appendChild(
    table
  );


  /* =====================================
     RINGKASAN KEPUTUSAN
  ===================================== */

  const summary =
    add(
      box,
      "div",
      "",
      "approval-summary"
    );


  /*
    Ambil tarikh keputusan yang tersedia
    dalam kelompok ini.
  */

  const decisionRecord =
    group.requests.find(
      r => r.tarikhLulus
    );


  add(
    summary,
    "div",
    "Tarikh keputusan: " +
      (
        decisionRecord
          ? date(
              decisionRecord.tarikhLulus
            )
          : "-"
      ),
    "approval-decision-date"
  );


  /* =====================================
     JUMLAH
  ===================================== */

  let totalApproved = 0;
  let totalReceived = 0;


  group.requests.forEach(r => {

    const status =
      String(
        r.statusPermohonan || ""
      )
        .trim()
        .toUpperCase();


    if (status === "DITOLAK") {
      return;
    }


    totalApproved +=
      Number(
        r.kuantitiDilulus
      ) || 0;


    totalReceived +=
      Number(
        r.kuantitiDiterima
      ) || 0;

  });


  const totalRemaining =
    Math.max(
      0,
      totalApproved -
      totalReceived
    );


  add(
    summary,
    "div",
    "",
    "approval-total"
  );


  const total =
    summary.querySelector(
      ".approval-total"
    );

/* =====================================
   STATUS SERAHAN
===================================== */

if (
  totalApproved > 0 &&
  totalReceived === 0
) {

  /*
    Sudah diluluskan tetapi belum ada
    serahan fizikal dibuat.
  */

  total.innerHTML =
    "<strong>Diluluskan:</strong> " +
    totalApproved +
    " <span>|</span> " +

    "<strong>Belum Diserahkan:</strong> " +
    totalRemaining;

} else {

  /*
    Sudah ada proses serahan,
    sama ada sebahagian atau selesai.
  */

  total.innerHTML =
    "<strong>Diluluskan:</strong> " +
    totalApproved +
    " <span>|</span> " +

    "<strong>Telah Diserahkan:</strong> " +
    totalReceived +
    " <span>|</span> " +

    "<strong>Baki:</strong> " +
    totalRemaining;

}

/* =====================================
   LIHAT BORANG KEW.PS-8
===================================== */

const formActions =
  add(
    box,
    "div",
    "",
    "approval-form-actions"
  );


const formButton =
  document.createElement(
    "button"
  );

formButton.type =
  "button";

formButton.className =
  "approval-form-button";

formButton.innerHTML =
  "📄 Lihat Borang";


formButton.addEventListener(
  "click",
  function () {

    /*
      Ambil rekod pertama kerana semua item
      dalam kelompok ini adalah ahli dan
      tarikh permohonan yang sama.
    */

    const firstRequest =
      group.requests[0];


    if (!firstRequest) {
      return;
    }


    const idPaspa =
      String(
        firstRequest.idPaspa || ""
      ).trim();


    /*
      Tarikh dihantar melalui URL menggunakan
      encodeURIComponent supaya format dd/mm/yyyy
      tidak merosakkan query string.
    */

    const url =
      "inventori-borang.html" +
      "?idPaspa=" +
      encodeURIComponent(
        idPaspa
      ) +
      "&tarikh=" +
      encodeURIComponent(
        group.tarikh
      );


    window.open(
      url,
      "_blank"
    );

  }
);


formActions.appendChild(
  formButton
);

  return box;

};



  /* =========================================
     SERAHAN INVENTORI
  ========================================= */

  const handoverItem = r => {

    const approved =
      Number(
        r.kuantitiDilulus
      ) || 0;

    const received =
      Number(
        r.kuantitiDiterima
      ) || 0;

    const remaining =
      approved - received;

    const card =
      itemInfo(r);

    add(
      card,
      "p",
      `Diluluskan: ${approved} | Telah diserahkan: ${received} | Baki: ${remaining}`
    );

    const controls =
      add(
        card,
        "div",
        "",
        "controls"
      );

    const quantityLabel =
      add(
        controls,
        "label",
        "Kuantiti sebenar diserahkan"
      );

    const quantityInput =
      document.createElement(
        "input"
      );

    quantityInput.type =
      "number";

    quantityInput.min =
      "1";

    quantityInput.max =
      String(
        remaining
      );

    quantityInput.step =
      "1";

    quantityInput.value =
      String(
        remaining
      );

    quantityLabel.appendChild(
      quantityInput
    );

    const noteLabel =
      add(
        controls,
        "label",
        "Catatan serahan (jika ada)"
      );

    const noteInput =
      document.createElement(
        "textarea"
      );

    noteInput.rows = 2;
    noteInput.maxLength = 1000;

    noteLabel.appendChild(
      noteInput
    );

    const button =
      add(
        controls,
        "button",
        "SAHKAN SERAHAN",
        "primary handover-button"
      );

    button.type =
      "button";


    /* =====================================
       PROSES SERAHAN
    ===================================== */

    button.addEventListener(
      "click",
      async () => {

        const quantity =
          Number(
            quantityInput.value
          );

        if (
          !Number.isSafeInteger(
            quantity
          ) ||
          quantity < 1 ||
          quantity > remaining
        ) {

          message(
            "Kuantiti serahan tidak sah.",
            "error"
          );

          return;

        }

        const confirmed =
          window.confirm(

            `Sahkan serahan ${quantity} unit ${r.namaItem} kepada ${r.namaAhli}? Stok akan ditolak.`

          );

        if (!confirmed) {
          return;
        }

        button.disabled = true;

        try {

          const result =
            await call(
              "admin_inventory_handover",
              {

                requestId:
                  r.requestId,

                kuantitiSerah:
                  quantity,

                catatanSerahan:
                  noteInput.value.trim()

              }
            );

          await load();

          message(
            `Serahan berjaya. Baki serahan: ${result.bakiSerahan}. Stok terkini: ${result.stokTerkini}.`,
            "success"
          );

        } catch (error) {

          message(
            error.message,
            "error"
          );

          button.disabled = false;

        }

      }
    );

    return card;

  };


  /* =========================================
     PAPAR SENARAI MENGIKUT NAMA AHLI
  ========================================= */

  const renderGroups = (
    targetId,
    requests,
    section,
    createItem,
    emptyMessage
  ) => {

    const target =
      $(targetId);

    target.replaceChildren();

    if (
      !requests.length
    ) {

      add(
        target,
        "p",
        emptyMessage,
        "empty"
      );

      return;

    }

    const groups =
      groupByMember(
        requests
      );

    groups.forEach(
      group => {

        target.appendChild(
          memberGroup(
            group,
            section,
            createItem
          )
        );

      }
    );

  };


  /* =========================================
     LOAD DATA
  ========================================= */

  const load = async () => {

    if (loading) {
      return;
    }

    loading = true;

    $("refreshButton").disabled =
      true;

    try {

      const result =
        await call(
          "admin_inventory_requests"
        );

      const requests =
        Array.isArray(
          result.requests
        )
          ? result.requests
          : [];


      /* =====================================
         MENUNGGU KELULUSAN
      ===================================== */

      const pending =
        requests.filter(
          r =>

            String(
              r.statusPermohonan || ""
            )
              .trim()
              .toUpperCase() ===
            "MENUNGGU KELULUSAN"

        );


      /* =====================================
         SUDAH DIPROSES
      ===================================== */

      const processed =
        requests.filter(
          r =>

            String(
              r.statusPermohonan || ""
            )
              .trim()
              .toUpperCase() !==
            "MENUNGGU KELULUSAN"

        );


      /* =====================================
         BELUM SELESAI SERAHAN
      ===================================== */

      const handovers =
        requests.filter(
          r => {

            const status =
              String(
                r.statusPermohonan || ""
              )
                .trim()
                .toUpperCase();

            const approved =
              Number(
                r.kuantitiDilulus
              ) || 0;

            const received =
              Number(
                r.kuantitiDiterima
              ) || 0;

            return (

              (
                status ===
                  "DILULUSKAN" ||

                status ===
                  "SERAHAN SEPARA"
              )

              &&

              approved > received

            );

          }
        );


      /* =====================================
         COUNTERS
      ===================================== */

      $("pendingCount")
        .textContent =
          String(
            pending.length
          );

      $("processedCount")
        .textContent =
          String(
            processed.length
          );


      /* =====================================
         RENDER
      ===================================== */

      renderGroups(

        "pendingList",

        pending,

        "pending",

        pendingItem,

        "Tiada permohonan menunggu kelulusan."

      );

      renderGroups(

        "processedList",

        processed,

        "processed",

        processedItem,

        "Tiada rekod kelulusan."

      );

      renderGroups(

        "handoverList",

        handovers,

        "handover",

        handoverItem,

        "Tiada serahan inventori yang belum selesai."

      );

    } catch (error) {

      message(
        error.message,
        "error"
      );

    } finally {

      loading = false;

      $("refreshButton").disabled =
        false;

    }

  };


  /* =========================================
     HEADER BUTTONS
  ========================================= */

  $("backButton")
    .addEventListener(
      "click",
      () => history.back()
    );

  $("homeButton")
    .addEventListener(
      "click",
      () => {

        location.href =
          "dashboard.html";

      }
    );


  /* =========================================
     MENU BUTTONS
  ========================================= */

$("refreshButton")
  .addEventListener(
    "click",
    () => {

      window.location.href =
        "admin-inventori-kemaskini.html";

    }
  );

  $("requestsButton")
    .addEventListener(
      "click",
      () => {

        $("pendingSection")
          .scrollIntoView({

            behavior:
              "smooth",

            block:
              "start"

          });

      }
    );

  $("reportButton")
    .addEventListener(
      "click",
      () => {

        $("processedSection")
          .scrollIntoView({

            behavior:
              "smooth",

            block:
              "start"

          });

      }
    );


  /* =========================================
     START
  ========================================= */

  document.addEventListener(
    "DOMContentLoaded",
    async () => {

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

        $("accessNotice").hidden =
          true;

        $("mainContent").hidden =
          false;

        await load();

      } catch (error) {

        $("accessNotice")
          .textContent =
            error.message;

      }

    }
  );

})();
