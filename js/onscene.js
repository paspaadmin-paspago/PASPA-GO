"use strict";


const activeOperationList =
  document.getElementById(
    "activeOperationList"
  );


const onSceneMessage =
  document.getElementById(
    "onSceneMessage"
  );


function getOnSceneEmail() {

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
      "GET ON SCENE EMAIL ERROR:",
      error
    );


    return "";

  }

}


function showOnSceneMessage(
  message,
  type
) {

  if (!onSceneMessage) {
    return;
  }


  onSceneMessage.textContent =
    message || "";


  onSceneMessage.className =
    "onscene-message " +
    (
      type || ""
    );


  onSceneMessage.hidden =
    false;

}


function formatOnSceneDate(
  value
) {

  const text =
    String(
      value || ""
    ).trim();


  if (!text) {
    return "-";
  }


  return text.replace(
    /(\d{4})-(\d{2})-(\d{2})/,
    function (
      match,
      year,
      month,
      day
    ) {

      return (
        day +
        "/" +
        month +
        "/" +
        year
      );

    }
  );

}


function formatOnSceneTime(
  value
) {

  const text =
    String(
      value || ""
    ).trim();


  if (!text) {
    return "-";
  }


  const match =
    text.match(
      /^(\d{1,2}):(\d{2})/
    );


  if (!match) {
    return text;
  }


  let hour =
    Number(
      match[1]
    );


  const minute =
    String(
      match[2]
    ).padStart(
      2,
      "0"
    );


  const period =
    hour >= 12
      ? "PM"
      : "AM";


  hour =
    hour % 12;


  if (hour === 0) {
    hour = 12;
  }


  return (
    String(hour)
      .padStart(
        2,
        "0"
      ) +
    "." +
    minute +
    " " +
    period
  );

}


function createOnSceneCard(
  operation
) {

  const card =
    document.createElement(
      "article"
    );


  card.className =
    "operation-card";


  const locationLabel =
    operation.negara
      ? "Negara"
      : "Negeri";


  const locationValue =
    operation.negara ||
    operation.negeri ||
    "-";


const memberStatus =
  String(
    operation.statusKehadiran ||
    ""
  )
    .trim()
    .toUpperCase();


const accepted =
  memberStatus === "HADIR";


const rejected =
  memberStatus === "TIDAK HADIR";


const rawOperationStatus =
  String(
    operation.statusAturGerak ||
    ""
  )
    .trim()
    .toUpperCase();


let displayOperationStatus =
  "AKTIF";


if (
  rawOperationStatus === "STAND DOWN" ||
  rawOperationStatus === "STAND_DOWN"
) {

  displayOperationStatus =
    "STAND DOWN";

}


if (
  rawOperationStatus === "SELESAI"
) {

  displayOperationStatus =
    "SELESAI";

}


  card.innerHTML =
    `
      <h2 class="operation-title">
        ${operation.perkara || "OPERASI"}
      </h2>

      <div class="operation-status-row">
  <strong>Status Operasi:</strong>

  <span class="operation-status">
    ${displayOperationStatus}
  </span>
</div>


      <div class="operation-meta">

        <div>
          <strong>Kategori:</strong>
          ${operation.kategoriOperasi || "-"}
        </div>

        <div>
          <strong>Jenis Kejadian:</strong>
          ${operation.jenisKejadian || "-"}
        </div>

        <div>
          <strong>Tarikh & Masa Mula:</strong>
          ${formatOnSceneDate(operation.tarikhMula)}
          |
          ${formatOnSceneTime(operation.masaMula)}
        </div>

        <div>
          <strong>Tempat:</strong>
          ${operation.tempat || "-"}
        </div>

        <div>
          <strong>${locationLabel}:</strong>
          ${locationValue}
        </div>

      </div>

      ${
        operation.catatan
          ? `
            <div class="operation-note">
              <strong>Arahan / Catatan Operasi</strong>
              <br><br>
              ${operation.catatan}
            </div>
          `
          : ""
      }

      <div class="operation-actions">

        ${
          operation.liveLocation
            ? `
              <button
                type="button"
                class="action-button location-button"
                data-location="${operation.liveLocation}"
              >
                📍 BUKA LOKASI
              </button>
            `
            : ""
        }

        ${
          operation.dokumenUrl
            ? `
              <button
                type="button"
                class="action-button attachment-button"
                data-url="${operation.dokumenUrl}"
              >
                📎 LAMPIRAN
              </button>
            `
            : ""
        }

<div class="response-action-row">

  <button
    type="button"
    class="
      action-button
      accept-button
      ${accepted ? "accepted" : ""}
    "
    data-operasi-id="${operation.operasiId}"
    ${
      accepted ||
      rejected ||
      displayOperationStatus !== "AKTIF"
        ? "disabled"
        : ""
    }
  >
    ${
      accepted
        ? "✓ HADIR"
        : "TERIMA DAN HADIR"
    }
  </button>


  <button
    type="button"
    class="
      action-button
      reject-button
      ${rejected ? "rejected" : ""}
    "
    data-operasi-id="${operation.operasiId}"
    ${
      accepted ||
      rejected ||
      displayOperationStatus !== "AKTIF"
        ? "disabled"
        : ""
    }
  >
    ${
      rejected
        ? "✓ TIDAK HADIR"
        : "TIDAK HADIR"
    }
  </button>

</div>

      </div>
    `;


  const locationButton =
    card.querySelector(
      ".location-button"
    );


  if (locationButton) {

    locationButton.addEventListener(
      "click",
      function () {

        window.open(
          locationButton.dataset.location,
          "_blank"
        );

      }
    );

  }


  const attachmentButton =
    card.querySelector(
      ".attachment-button"
    );


  if (attachmentButton) {

    attachmentButton.addEventListener(
      "click",
      function () {

        window.open(
          attachmentButton.dataset.url,
          "_blank"
        );

      }
    );

  }


  const acceptButton =
    card.querySelector(
      ".accept-button"
    );


  if (
    acceptButton &&
    !accepted
  ) {

    acceptButton.addEventListener(
      "click",
      async function () {

        const operasiId =
          String(
            acceptButton.dataset.operasiId ||
            ""
          ).trim();


        if (!operasiId) {
          return;
        }


        acceptButton.disabled =
          true;


        acceptButton.textContent =
          "MEMPROSES...";


        try {

          const result =
            await apiPost({

              action:
                "member_operation_accept",

              email:
                getOnSceneEmail(),

              operasiId:
                operasiId

            });


          if (
            !result ||
            result.success !== true
          ) {

            throw new Error(
              result?.message ||
              "Panggilan Operasi gagal diterima."
            );

          }


          acceptButton.classList.add(
            "accepted"
          );


          acceptButton.textContent =
            "✓ TELAH DITERIMA";


         await loadOnSceneOperations();

showOnSceneMessage(
  "Panggilan Operasi telah diterima.",
  "success"
);


        } catch (error) {

          console.error(
            "ACCEPT OPERATION ERROR:",
            error
          );


          acceptButton.disabled =
            false;


          acceptButton.textContent =
            "TERIMA DAN HADIR";


          showOnSceneMessage(
            error.message ||
            "Panggilan Operasi gagal diterima.",
            "error"
          );

        }

      }
    );

  }

const rejectButton =
  card.querySelector(
    ".reject-button"
  );


if (
  rejectButton &&
  !accepted &&
  !rejected &&
  displayOperationStatus === "AKTIF"
) {

  rejectButton.addEventListener(
    "click",
    async function () {

      const operasiId =
        String(
          rejectButton.dataset.operasiId ||
          ""
        ).trim();


      if (!operasiId) {
        return;
      }


      const confirmed =
        window.confirm(
          "Adakah anda pasti tidak dapat hadir ke Operasi ini?"
        );


      if (!confirmed) {
        return;
      }


      rejectButton.disabled =
        true;


      rejectButton.textContent =
        "MEMPROSES...";


      try {

        const result =
          await apiPost({

            action:
              "member_operation_reject",

            email:
              getOnSceneEmail(),

            operasiId:
              operasiId

          });


        if (
          !result ||
          result.success !== true
        ) {

          throw new Error(
            result?.message ||
            "Status TIDAK HADIR gagal direkodkan."
          );

        }


        /*
         * Refresh page supaya kedua-dua button
         * dan status ahli dikemas kini.
         */

        await loadOnSceneOperations();


        showOnSceneMessage(
          "Status TIDAK HADIR telah direkodkan.",
          "success"
        );


      } catch (error) {

        console.error(
          "REJECT OPERATION ERROR:",
          error
        );


        rejectButton.disabled =
          false;


        rejectButton.textContent =
          "TIDAK HADIR";


        showOnSceneMessage(
          error.message ||
          "Status TIDAK HADIR gagal direkodkan.",
          "error"
        );

      }

    }
  );

}
  return card;

}


async function loadOnSceneOperations() {

  if (!activeOperationList) {
    return;
  }


  activeOperationList.innerHTML =
    '<div class="loading-text">Memuatkan panggilan operasi...</div>';


  try {

    const email =
      getOnSceneEmail();


    if (!email) {

      throw new Error(
        "Sesi pengguna tidak ditemui."
      );

    }


    const result =
      await apiPost({

        action:
          "member_active_operations",

        email:
          email

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Panggilan Operasi tidak dapat dimuatkan."
      );

    }


    const operations =
      Array.isArray(
        result.operations
      )
        ? result.operations
        : [];


    activeOperationList.innerHTML =
      "";


    if (!operations.length) {

      activeOperationList.innerHTML =
        `
          <div class="empty-text">
            Tiada panggilan Operasi aktif.
          </div>
        `;

      return;

    }


    operations.forEach(
      function (operation) {

        activeOperationList.appendChild(
          createOnSceneCard(
            operation
          )
        );

      }
    );


  } catch (error) {

    console.error(
      "LOAD ON SCENE OPERATIONS ERROR:",
      error
    );


    activeOperationList.innerHTML =
      `
        <div class="empty-text">
          Panggilan Operasi tidak dapat dimuatkan.
        </div>
      `;


    showOnSceneMessage(
      error.message ||
      "Panggilan Operasi tidak dapat dimuatkan.",
      "error"
    );

  }

}


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


loadOnSceneOperations();