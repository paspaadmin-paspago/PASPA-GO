"use strict";


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

    return null;

  }

}


const currentSession =
  getSession();


/* =====================================================
   ELEMENTS
===================================================== */

const manageMessage =
  document.getElementById(
    "manageMessage"
  );


const noAdminAccess =
  document.getElementById(
    "noAdminAccess"
  );


const latestActionSection =
  document.getElementById(
    "latestActionSection"
  );


/* =====================================================
   TINDAKAN TERKINI - GABUNG SEMUA MODUL
===================================================== */

let latestActionItems =
  [];


function getLatestActionSortTime(
  item,
  type
) {

  const candidates = [
    item?.tarikhKemaskini,
    item?.updatedAt,
    item?.tarikhCipta,
    item?.createdAt,
    item?.timestamp
  ];


  for (
    const value of candidates
  ) {

    if (!value) {
      continue;
    }


    const date =
      new Date(
        value
      );


    if (
      !isNaN(
        date.getTime()
      )
    ) {

      return date.getTime();

    }

  }


  const id =
    String(
      item?.operasiId ||
      item?.messageId ||
      item?.id ||
      ""
    ).trim();


  const idMatch =
    id.match(
      /(\d{14})/
    );


  if (idMatch) {

    const stamp =
      idMatch[1];


    const idDate =
      new Date(
        Number(
          stamp.slice(0, 4)
        ),
        Number(
          stamp.slice(4, 6)
        ) - 1,
        Number(
          stamp.slice(6, 8)
        ),
        Number(
          stamp.slice(8, 10)
        ),
        Number(
          stamp.slice(10, 12)
        ),
        Number(
          stamp.slice(12, 14)
        )
      );


    if (
      !isNaN(
        idDate.getTime()
      )
    ) {

      return idDate.getTime();

    }

  }


  const fallback =
    type === "program"
      ? item?.tarikhAcara
      : item?.tarikhMula;


  if (fallback) {

    const fallbackDate =
      new Date(
        fallback
      );


    if (
      !isNaN(
        fallbackDate.getTime()
      )
    ) {

      return fallbackDate.getTime();

    }

  }


  return 0;

}


function renderLatestActions() {

  if (!latestActionContent) {
    return;
  }


  latestActionContent.innerHTML =
    "";


  if (
    !latestActionItems.length
  ) {

    latestActionContent.innerHTML =
      '<div class="empty-action">Tiada tindakan terkini.</div>';

    return;

  }


  const sortedItems =
    [
      ...latestActionItems
    ]
      .sort(
        function (
          a,
          b
        ) {

          return (
            b.sortTime -
            a.sortTime
          );

        }
      );


  sortedItems.forEach(
    function (entry) {

      if (
        entry.type === "program"
      ) {

        latestActionContent.appendChild(
          createLatestProgramCard(
            entry.data
          )
        );

        return;

      }


      if (
        entry.type === "operation"
      ) {

        latestActionContent.appendChild(
          createLatestOperationCard(
            entry.data
          )
        );

      }

    }
  );

}


/* =====================================================
   ROLE MAP
===================================================== */

const adminMenus = [

  {
    settingKey:
      "ADMIN_PROGRAM",

    elementId:
      "adminProgramMenu",

    page:
      "admin-program.html"
  },


  {
    settingKey:
      "ADMIN_OPERASI",

    elementId:
      "adminOperationMenu",

    page:
      "admin-operasi.html"
  },


  {
    settingKey:
      "ADMIN_INVENTORY",

    elementId:
      "adminInventoryMenu",

    page:
      "inventori.html"
  },


  {
    settingKey:
      "ADMIN_ANNOUNCEMENT",

    elementId:
      "adminAnnouncementMenu",

    page:
      "hebahan.html"
  },


  {
    settingKey:
      "ADMIN_MESSAGE",

    elementId:
      "adminMessageMenu",

    page:
      "mesej.html"
  },


  {
    settingKey:
      "ADMIN_REPORT",

    elementId:
      "adminReportMenu",

    page:
      "laporan.html"
  }

];




/* =====================================================
   MESSAGE
===================================================== */

function showManageMessage(
  message,
  type
) {

  manageMessage.textContent =
    message || "";


  manageMessage.className =
    "manage-message " +
    (type || "info");


  manageMessage.hidden =
    false;

}


/* =====================================================
   CHECK ONE ROLE
===================================================== */

/* async function checkAdminRole(
  settingKey
) {

  const result =
    await apiPost({

      action:
        "admin_setting_access",

      idPaspa:
        currentSession.idPaspa,

      settingKey:
        settingKey

    });


  return (
    result &&
    result.success === true &&
    result.authorized === true
  );

}
 */

/* =====================================================
   LOAD ADMIN MENUS
===================================================== */

async function loadAdminMenus() {

  if (
    !currentSession ||
    currentSession.isLoggedIn !== true ||
    !currentSession.idPaspa
  ) {

    window.location.href =
      "../index.html";

    return;

  }


  try {

    /* ===============================================
       PANGGIL SEKALI SAHAJA
    =============================================== */

    const result =
      await apiPost({

        action:
          "admin_menu_access",

        idPaspa:
          currentSession.idPaspa

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : "Akses pentadbir tidak dapat diperoleh."
      );

    }


    const access =
      result.access || {};


    /* ===============================================
       SEMBUNYIKAN / PAPARKAN BUTTON
    =============================================== */

    const adminProgramMenu =
      document.getElementById(
        "adminProgramMenu"
      );

    const adminOperationMenu =
      document.getElementById(
        "adminOperationMenu"
      );

    const adminInventoryMenu =
      document.getElementById(
        "adminInventoryMenu"
      );

    const adminMessageMenu =
      document.getElementById(
        "adminMessageMenu"
      );

    const adminAnnouncementMenu =
      document.getElementById(
        "adminAnnouncementMenu"
      );

    const adminReportMenu =
      document.getElementById(
        "adminReportMenu"
      );


    if (adminProgramMenu) {

      adminProgramMenu.hidden =
        access.ADMIN_PROGRAM !== "OPEN";

    }


    if (adminOperationMenu) {

      adminOperationMenu.hidden =
        access.ADMIN_OPERASI !== "OPEN";

    }


    if (adminInventoryMenu) {

      adminInventoryMenu.hidden =
        access.ADMIN_INVENTORY !== "OPEN";

    }


    if (adminMessageMenu) {

      adminMessageMenu.hidden =
        access.ADMIN_MESSAGE !== "OPEN";

    }


    if (adminAnnouncementMenu) {

      adminAnnouncementMenu.hidden =
        access.ADMIN_ANNOUNCEMENT !== "OPEN";

    }


    if (adminReportMenu) {

      adminReportMenu.hidden =
        access.ADMIN_REPORT !== "OPEN";

    }


    /* ===============================================
       KIRA MENU YANG DIBUKA
    =============================================== */

    const visibleMenuCount =
      [
        access.ADMIN_PROGRAM,
        access.ADMIN_OPERASI,
        access.ADMIN_INVENTORY,
        access.ADMIN_MESSAGE,
        access.ADMIN_ANNOUNCEMENT,
        access.ADMIN_REPORT
      ]
        .filter(
          function (value) {

            return value === "OPEN";

          }
        )
        .length;


    if (
      visibleMenuCount > 0
    ) {

      latestActionSection.hidden =
        false;

      noAdminAccess.hidden =
        true;

    } else {

      latestActionSection.hidden =
        true;

      noAdminAccess.hidden =
        false;

    }


  } catch (error) {

    console.error(
      "LOAD ADMIN MENU ERROR:",
      error
    );


    showManageMessage(
      "Akses pentadbir tidak dapat disemak.",
      "error"
    );


    noAdminAccess.hidden =
      false;

  }

}

/* =====================================================
   LOAD TINDAKAN TERKINI
===================================================== */

async function loadLatestProgramActions() {

  if (
    !currentSession ||
    !currentSession.googleEmail
  ) {
    return;
  }


  try {

    const result =
      await apiPost({

        action:
          "admin_recent_programs",

        email:
          currentSession.googleEmail

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result &&
        result.message
          ? result.message
          : "Tindakan Program tidak dapat dimuatkan."
      );

    }


    const programs =
      Array.isArray(
        result.programs
      )
        ? result.programs
        : [];


    programs.forEach(
      function (program) {

        latestActionItems.push({

          type:
            "program",

          data:
            program,

          sortTime:
            getLatestActionSortTime(
              program,
              "program"
            )

        });

      }
    );


  } catch (error) {

    console.error(
      "LOAD LATEST PROGRAM ERROR:",
      error
    );

  }

}




/* =====================================================
   LOAD TINDAKAN TERKINI OPERASI
===================================================== */

async function loadLatestOperationActions() {

  if (
    !currentSession ||
    !currentSession.googleEmail
  ) {

    return;

  }


  try {

    const result =
      await apiPost({

        action:
          "admin_recent_operations",

        email:
          currentSession.googleEmail

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Tindakan Operasi tidak dapat dimuatkan."
      );

    }


    const operations =
      Array.isArray(
        result.operations
      )
        ? result.operations
        : [];


    operations.forEach(
      function (operation) {

        latestActionItems.push({

          type:
            "operation",

          data:
            operation,

          sortTime:
            getLatestActionSortTime(
              operation,
              "operation"
            )

        });

      }
    );


  } catch (error) {

    console.error(
      "LOAD LATEST OPERATION ERROR:",
      error
    );

  }

}


/* =====================================================
   CREATE OPERATION CARD
===================================================== */

/* =====================================================
   DROPDOWN CARD TINDAKAN TERKINI
   - Mula-mula hanya kepala tajuk dipaparkan
   - Klik kepala tajuk untuk buka / tutup maklumat
===================================================== */

function setupLatestActionCardDropdown(
  card
) {

  if (!card) {
    return;
  }


  const header =
    card.querySelector(
      ".latest-program-header"
    );


  if (!header) {
    return;
  }


  const details =
    document.createElement(
      "div"
    );


  details.className =
    "latest-action-details";


  details.hidden =
    true;


  while (
    header.nextSibling
  ) {

    details.appendChild(
      header.nextSibling
    );

  }


  card.appendChild(
    details
  );


  header.style.cursor =
    "pointer";


  header.setAttribute(
    "role",
    "button"
  );


  header.setAttribute(
    "tabindex",
    "0"
  );


  header.setAttribute(
    "aria-expanded",
    "false"
  );


  const arrow =
    document.createElement(
      "span"
    );


  arrow.className =
    "latest-action-card-arrow";


  arrow.textContent =
    "▼";


  arrow.style.marginLeft =
    "10px";


  arrow.style.flexShrink =
    "0";


  header.appendChild(
    arrow
  );


  function toggleCard() {

    details.hidden =
      !details.hidden;


    const expanded =
      !details.hidden;


    header.setAttribute(
      "aria-expanded",
      expanded
        ? "true"
        : "false"
    );


    arrow.textContent =
      expanded
        ? "▲"
        : "▼";

  }


  header.addEventListener(
    "click",
    function (event) {

      /*
       * Jika pada masa depan ada button dalam header,
       * jangan toggle dua kali.
       */
      if (
        event.target.closest(
          "button"
        )
      ) {
        return;
      }


      toggleCard();

    }
  );


  header.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        toggleCard();

      }

    }
  );

}


function createLatestOperationCard(
  operation
) {

  const card =
    document.createElement(
      "div"
    );


  card.className =
    "latest-program-card";


  /* =====================================================
     STATUS
  ===================================================== */

  const status =
    String(
      operation.statusAturGerak ||
      operation.statusOperasi ||
      ""
    )
      .trim()
      .toUpperCase();


  const isDraft =
    status === "DRAF";


  const isActive =
    status === "DIPANGGIL" ||
    status === "AKTIF";


  const isStandDown =
    status === "STAND DOWN" ||
    status === "STAND_DOWN";


  const isFinished =
    status === "SELESAI";


  const displayStatus =
    isDraft
      ? "DRAF"
      : isActive
        ? "DIPANGGIL"
        : isStandDown
          ? "STAND DOWN"
          : isFinished
            ? "SELESAI"
            : (
                status ||
                "-"
              );


  /* =====================================================
     TARIKH
  ===================================================== */

  let dateText =
    formatOperationDateTime(
      operation.tarikhMula,
      operation.masaMula
    );


  if (
    operation.tarikhTamat
  ) {

    const endDateText =
      formatOperationDateTime(
        operation.tarikhTamat,
        operation.masaTamat
      );


    if (
      endDateText &&
      endDateText !== "-"
    ) {

      dateText +=
        " hingga " +
        endDateText;

    }

  }


  /* =====================================================
     STATISTIK
  ===================================================== */

  const totalMembers =
    Number(
      operation.jumlahAnggota ||
      0
    );


  const totalRead =
    Number(
      operation.totalRead ||
      0
    );


  const totalUnread =
    Number(
      operation.totalUnread ||
      0
    );


  const totalOnScene =
    Number(
      operation.totalOnScene ||
      0
    );


  const totalNotOnScene =
    Number(
      operation.totalNotOnScene ||
      0
    );


  /* =====================================================
     HADIR - OPERASI SELESAI
  ===================================================== */

  const totalHadir =
    Number(
      operation.hadir ||
      0
    );


  const hadirMembers =
    Array.isArray(
      operation.hadirMembers
    )
      ? operation.hadirMembers
      : [];


  /* =====================================================
     HTML CARD
  ===================================================== */

  card.innerHTML = `

    <!-- =================================================
         HEADER OPERASI
    ================================================== -->

    <div class="latest-program-header">

      <div>

        <div class="latest-program-title">

          <strong>
            OPERASI:
          </strong>

          ${escapeManageHtml(
            operation.perkara ||
            "-"
          )}

        </div>


        <div class="latest-program-meta">

          <span>
            Tarikh:
            ${escapeManageHtml(
              dateText
            )}
          </span>


          <span>
            Tempat:
            ${escapeManageHtml(
              operation.tempat ||
              "-"
            )}
          </span>


          <span>
            ${
              operation.negara
                ? "Negara:"
                : "Negeri:"
            }
            ${escapeManageHtml(
              operation.negara ||
              operation.negeri ||
              "-"
            )}
          </span>


          <span>
            Dipanggil Oleh:
            ${escapeManageHtml(
              operation.idAdminPencipta ||
              "-"
            )}
          </span>


          <span>

            Bilangan Anggota:

            <strong>
              ${totalMembers} orang
            </strong>

          </span>

        </div>

      </div>


      <span
        class="
          latest-program-status
          ${isFinished
            ? "finished"
            : ""
          }
        "
      >

        ${escapeManageHtml(
          displayStatus
        )}

      </span>

    </div>


    <!-- =================================================
         OPERASI AKTIF / STAND DOWN
    ================================================== -->

    ${
      (
        isActive ||
        isStandDown
      )

        ? `

          <div class="latest-program-stat-grid">


            <div class="latest-program-stat-box">

              <span>
                Telah Baca
              </span>

              <strong>
                ${totalRead}
              </strong>

            </div>


            <div class="latest-program-stat-box">

              <span>
                Belum Baca
              </span>

              <strong>
                ${totalUnread}
              </strong>

            </div>


            <div class="latest-program-stat-box">

              <span>
                ON SCENE
              </span>

              <strong>
                ${totalOnScene}
              </strong>

            </div>


            <div class="latest-program-stat-box">

              <span>
                BELUM ON SCENE
              </span>

              <strong>
                ${totalNotOnScene}
              </strong>

            </div>

          </div>


          <div class="latest-program-name-links">


            <button
              type="button"
              class="latest-operation-onscene-list-button"
            >

              Lihat Nama ON SCENE &gt;

            </button>


            <button
              type="button"
              class="latest-operation-not-onscene-list-button"
            >

              Lihat Nama BELUM ON SCENE &gt;

            </button>


          </div>


          <div
            class="operation-member-status-list"
            data-operation-member-list
            hidden
          ></div>

        `

        : ""
    }


    <!-- =================================================
         OPERASI SELESAI
         PAPAR JUMLAH HADIR
    ================================================== -->

    ${
      isFinished

        ? `

          <div class="latest-status-grid">


            <div class="latest-status-item">

              <span>
                HADIR
              </span>

              <strong>
                ${totalHadir}
              </strong>

            </div>


          </div>


          <div class="latest-member-section">


            <button
              type="button"
              class="latest-operation-hadir-toggle"
            >

              Lihat Nama HADIR &gt;

            </button>


            <div
              class="
                latest-member-list
                latest-operation-hadir-list
              "
              hidden
            ></div>


          </div>


          <div class="latest-program-finished-note">

            ✓ OPERASI TELAH SELESAI

          </div>

        `

        : ""
    }


    <!-- =================================================
         BUTTON TINDAKAN
         TIDAK DIPAPAR JIKA SELESAI
    ================================================== -->

    ${
      !isFinished

        ? `

          <div
            class="
              latest-program-actions
              latest-program-actions-3
            "
          >


            <!-- EDIT -->

            <button
              type="button"
              class="latest-operation-edit-button latest-edit-button"
            >

              EDIT

            </button>


            <!-- DRAF -->

            ${
              isDraft

                ? `

                  <button
                    type="button"
                    class="latest-operation-cancel-button latest-cancel-button"
                  >

                    BATAL OPERASI

                  </button>

                `

                : ""
            }


            <!-- AKTIF / DIPANGGIL -->

            ${
              isActive

                ? `

                  <button
                    type="button"
                    class="latest-operation-stand-down-button latest-confirm-button"
                  >

                    STAND DOWN

                  </button>

                `

                : ""
            }


            <!-- SELEPAS STAND DOWN -->

            ${
              isStandDown

                ? `

                  <button
                    type="button"
                    class="latest-operation-final-button latest-confirm-button"
                  >

                    SAHKAN

                  </button>

                `

                : ""
            }


          </div>

        `

        : ""
    }

  `;


  /* =====================================================
     DROPDOWN CARD
  ===================================================== */

  setupLatestActionCardDropdown(
    card
  );


  /* =====================================================
     EDIT
  ===================================================== */

  const editButton =
    card.querySelector(
      ".latest-operation-edit-button"
    );


  if (editButton) {

    editButton.addEventListener(
      "click",
      function () {

        window.location.href =
          "admin-operasi.html" +
          "?mode=edit" +
          "&operasiId=" +
          encodeURIComponent(
            operation.operasiId ||
            ""
          );

      }
    );

  }


  /* =====================================================
     BATAL OPERASI
  ===================================================== */

  const cancelButton =
    card.querySelector(
      ".latest-operation-cancel-button"
    );


  if (cancelButton) {

    cancelButton.addEventListener(
      "click",
      function () {

        showManageMessage(
          "Fungsi BATAL OPERASI akan diaktifkan selepas ini.",
          "info"
        );

      }
    );

  }


  /* =====================================================
     STAND DOWN

     PENTING:
     HANYA SATU EVENT LISTENER.
     KOD DUPLICATE LAMA TELAH DIBUANG.
  ===================================================== */

  const standDownButton =
    card.querySelector(
      ".latest-operation-stand-down-button"
    );


  if (standDownButton) {

    standDownButton.addEventListener(
      "click",
      async function () {

        if (
          !operation.operasiId
        ) {

          showManageMessage(
            "OPERASI_ID tidak ditemui.",
            "error"
          );

          return;

        }


        const confirmed =
          window.confirm(
            "Adakah anda pasti mahu melaksanakan STAND DOWN bagi operasi ini?"
          );


        if (!confirmed) {
          return;
        }


        /* ===============================================
           TARIKH + MASA DEVICE ADMIN
        =============================================== */

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


        const standDownDateTime =
          year +
          "-" +
          month +
          "-" +
          day +
          "T" +
          hour +
          ":" +
          minute +
          ":" +
          second;


        const originalText =
          standDownButton.textContent;


        standDownButton.disabled =
          true;


        standDownButton.textContent =
          "MEMPROSES...";


        try {

          const result =
            await apiPost({

              action:
                "admin_operation_stand_down",

              email:
                currentSession.googleEmail,

              operasiId:
                operation.operasiId,

              standDownDateTime:
                standDownDateTime

            });


          if (
            !result ||
            result.success !== true
          ) {

            throw new Error(
              result?.message ||
              "STAND DOWN gagal dilaksanakan."
            );

          }


          showManageMessage(
            "Operasi berjaya STAND DOWN. Sila tekan SAHKAN selepas semakan akhir.",
            "success"
          );


          /* =============================================
             REFRESH TINDAKAN TERKINI
          ============================================= */

          latestActionItems =
            [];


          latestActionContent.innerHTML =
            '<div class="empty-action">Memuatkan tindakan terkini...</div>';


          await Promise.all([

            loadLatestProgramActions(),

            loadLatestOperationActions()

          ]);


          renderLatestActions();


        } catch (error) {

          console.error(
            "STAND DOWN OPERATION ERROR:",
            error
          );


          showManageMessage(
            error.message ||
            "STAND DOWN gagal dilaksanakan.",
            "error"
          );


          standDownButton.disabled =
            false;


          standDownButton.textContent =
            originalText;

        }

      }
    );

  }


  /* =====================================================
     SAHKAN
     HANYA SELEPAS STAND DOWN
  ===================================================== */

  const finalButton =
    card.querySelector(
      ".latest-operation-final-button"
    );


  if (finalButton) {

    finalButton.addEventListener(
      "click",
      function () {

        if (
          !operation.operasiId
        ) {

          showManageMessage(
            "OPERASI_ID tidak ditemui.",
            "error"
          );

          return;

        }


        window.location.href =
          "admin-operasi.html" +
          "?mode=final" +
          "&operasiId=" +
          encodeURIComponent(
            operation.operasiId
          );

      }
    );

  }


  /* =====================================================
     ON SCENE / BELUM ON SCENE
  ===================================================== */

  const onSceneButton =
    card.querySelector(
      ".latest-operation-onscene-list-button"
    );


  const notOnSceneButton =
    card.querySelector(
      ".latest-operation-not-onscene-list-button"
    );


  const memberStatusContainer =
    card.querySelector(
      "[data-operation-member-list]"
    );


  async function showOperationMemberStatusList(
    mode
  ) {

    if (
      !memberStatusContainer
    ) {
      return;
    }


    /* ===============================================
       KLIK KALI KEDUA = TUTUP
    =============================================== */

    if (
      memberStatusContainer.dataset.currentMode ===
        mode &&
      memberStatusContainer.hidden ===
        false
    ) {

      memberStatusContainer.hidden =
        true;


      memberStatusContainer.dataset.currentMode =
        "";


      return;

    }


    memberStatusContainer.hidden =
      false;


    memberStatusContainer.dataset.currentMode =
      mode;


    memberStatusContainer.innerHTML =
      '<div class="empty-action">Memuatkan senarai...</div>';


    try {

      const result =
        await apiPost({

          action:
            "admin_operation_member_status_list",

          email:
            currentSession.googleEmail,

          operasiId:
            operation.operasiId

        });


      if (
        !result ||
        result.success !== true
      ) {

        throw new Error(
          result?.message ||
          "Senarai anggota tidak dapat dimuatkan."
        );

      }


      const allMembers =
        Array.isArray(
          result.members
        )
          ? result.members
          : [];


      let filteredMembers =
        [];


      if (
  mode === "ON_SCENE"
) {

  filteredMembers =
    allMembers.filter(
      function (member) {

        return (
          String(
            member.statusOnScene ||
            ""
          )
            .trim()
            .toUpperCase() ===
          "ON SCENE"
        );

      }
    );

} else {

  filteredMembers =
    allMembers.filter(
      function (member) {

        return (
          String(
            member.statusOnScene ||
            ""
          )
            .trim()
            .toUpperCase() ===
          "BELUM ON SCENE"
        );

      }
    );

}


      if (
        !filteredMembers.length
      ) {

        memberStatusContainer.innerHTML =
          '<div class="empty-action">' +
          'Tiada anggota dalam kategori ini.' +
          '</div>';


        return;

      }


      memberStatusContainer.innerHTML =
        filteredMembers
          .map(
            function (
              member,
              index
            ) {

              return `

                <div
                  class="operation-member-status-row"
                >

                  <span>

                    ${index + 1}.
                    ${escapeManageHtml(
                      member.namaAhli ||
                      "-"
                    )}

                  </span>


                  <strong>

                    ID ${escapeManageHtml(
                      member.idPaspa ||
                      "-"
                    )}

                  </strong>

                </div>

              `;

            }
          )
          .join("");


    } catch (error) {

      console.error(
        "SHOW OPERATION MEMBER STATUS ERROR:",
        error
      );


      memberStatusContainer.innerHTML =
        '<div class="empty-action">' +
        escapeManageHtml(
          error.message ||
          "Senarai tidak dapat dimuatkan."
        ) +
        '</div>';

    }

  }


  if (onSceneButton) {

    onSceneButton.addEventListener(
      "click",
      function () {

        showOperationMemberStatusList(
          "ON_SCENE"
        );

      }
    );

  }


  if (notOnSceneButton) {

    notOnSceneButton.addEventListener(
      "click",
      function () {

        showOperationMemberStatusList(
          "NOT_ON_SCENE"
        );

      }
    );

  }


  /* =====================================================
     OPERASI SELESAI
     SENARAI HADIR
  ===================================================== */

  const hadirToggleButton =
    card.querySelector(
      ".latest-operation-hadir-toggle"
    );


  const hadirList =
    card.querySelector(
      ".latest-operation-hadir-list"
    );


  if (
    hadirToggleButton &&
    hadirList
  ) {

    /* ===============================================
       TIADA ANGGOTA HADIR
    =============================================== */

    if (
      !hadirMembers.length
    ) {

      hadirToggleButton.disabled =
        true;


      hadirToggleButton.textContent =
        "Tiada anggota HADIR";

    } else {

      /* ===============================================
         BINA SENARAI HADIR
      =============================================== */

      hadirList.innerHTML =
        hadirMembers
          .map(
            function (
              member,
              index
            ) {

              return `

                <div class="latest-member-row">


                  <span class="latest-member-number">

                    ${index + 1}.

                  </span>


                  <span>

                    ${escapeManageHtml(
                      member.namaAhli ||
                      "-"
                    )}

                  </span>


                  <strong>

                    ID ${escapeManageHtml(
                      member.idPaspa ||
                      "-"
                    )}

                  </strong>


                </div>

              `;

            }
          )
          .join("");


      /* ===============================================
         BUKA / TUTUP
      =============================================== */

      hadirToggleButton.addEventListener(
        "click",
        function () {

          hadirList.hidden =
            !hadirList.hidden;

        }
      );

    }

  }


  return card;

}


/* =====================================================
   FORMAT TARIKH PROGRAM
   2026-08-21 hingga 2026-08-31
   -> 21/08/2026 hingga 31/08/2026
===================================================== */

function formatProgramDate(value) {

  const text =
    String(value || "").trim();

  if (!text) {
    return "-";
  }

  return text.replace(
    /(\d{4})-(\d{2})-(\d{2})/g,
    function (match, year, month, day) {

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


/* =====================================================
   FORMAT MASA OPERASI
   20:10 -> 08.10 PM
===================================================== */

function formatOperationTime(value) {

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
    String(hour).padStart(2, "0") +
    "." +
    minute +
    " " +
    period
  );

}


/* =====================================================
   FORMAT TARIKH + MASA OPERASI
===================================================== */

function formatOperationDateTime(
  dateValue,
  timeValue
) {

  const dateText =
    formatProgramDate(
      dateValue
    );


  const timeText =
    formatOperationTime(
      timeValue
    );


  if (
    !dateText ||
    dateText === "-"
  ) {
    return "-";
  }


  if (
    !timeText ||
    timeText === "-"
  ) {
    return dateText;
  }


  return (
    dateText +
    " | " +
    timeText
  );

}

/* =====================================================
   CREATE PROGRAM CARD
===================================================== */

function createLatestProgramCard(
  program
) {

  const card =
    document.createElement(
      "div"
    );


  card.className =
    "latest-program-card";


  /* ===================================================
     STATUS PROGRAM
  =================================================== */

  const status =
    String(
      program.statusMesej ||
      ""
    )
      .trim()
      .toUpperCase();


  const isProgramFinished =
    status === "SELESAI";


  const isProgramCancelled =
    status === "BATAL";

  
  const isProgramDraft =
  status === "DRAF";


  const displayProgramStatus =
    isProgramFinished
      ? "SELESAI"
      : isProgramCancelled
        ? "BATAL"
        : isProgramDraft
          ? "DRAF"
          : "DIHANTAR";


  /* ===================================================
     PAPAR CARD
  =================================================== */

  card.innerHTML = `

    <div class="latest-program-header">

      <div>

        <!-- ============================================
             TAJUK
        ============================================= -->

        <div class="latest-program-title">

          <strong>
            PROGRAM:
          </strong>

          ${escapeManageHtml(
            program.tajuk ||
            "-"
          )}

        </div>


        <div class="latest-program-meta">


          <!-- TARIKH -->

          <span>

            Tarikh:

           ${escapeManageHtml(
  String(program.tarikhAcara || "-")
    .replace(
      /(\d{4})-(\d{2})-(\d{2})/g,
      "$3/$2/$1"
    )
)}

          </span>


          <!-- TEMPAT -->

          <span>

            Tempat:

            ${escapeManageHtml(
              program.tempat ||
              "-"
            )}

          </span>


          <!-- DIHANTAR OLEH -->

          <span>

            Dihantar Oleh:

            ${escapeManageHtml(
              program.dihantarOleh ||
              "-"
            )}

          </span>


          <!-- BILANGAN PESERTA -->

          <span>

            Bilangan Peserta:

            <strong>

              ${Number(
                program.bilanganPeserta ||
                0
              )}
              orang

            </strong>

          </span>


          <!-- BILANGAN URUSETIA -->

          <span>

            Bilangan Urusetia:

            <strong>

              ${Number(
                program.bilanganUrusetia ||
                0
              )}
              orang

            </strong>

          </span>

        </div>

      </div>


      <!-- ============================================
           STATUS PROGRAM
      ============================================= -->

      <span
        class="
          latest-program-status
          ${isProgramCancelled
            ? "cancelled"
            : ""
          }
          ${isProgramFinished
            ? "finished"
            : ""
          }
        "
      >

        ${escapeManageHtml(
          displayProgramStatus
        )}

      </span>

    </div>


    <!-- ================================================
         STATISTIK
    ================================================= -->

    <div class="latest-status-grid">


      <div class="latest-status-item">

        <span>
          Telah Baca
        </span>

        <strong>
          ${Number(
            program.telahBaca ||
            0
          )}
        </strong>

      </div>


      <div class="latest-status-item">

        <span>
          Belum Baca
        </span>

        <strong>
          ${Number(
            program.belumBaca ||
            0
          )}
        </strong>

      </div>


      <div class="latest-status-item">

        <span>
          HADIR
        </span>

        <strong>
          ${Number(
            program.hadir ||
            0
          )}
        </strong>

      </div>


      <div class="latest-status-item">

        <span>
          TIDAK HADIR
        </span>

        <strong>
          ${Number(
            program.tidakHadir ||
            0
          )}
        </strong>

      </div>


    </div>


    <!-- ================================================
         SENARAI HADIR
    ================================================= -->

    <div class="latest-member-section">

      <button
        type="button"
        class="latest-member-toggle"
        data-list="hadir"
      >

        Lihat Nama HADIR >

      </button>


      <div
        class="latest-member-list"
        data-list-content="hadir"
        hidden
      >
      </div>

    </div>


    <!-- ================================================
         SENARAI TIDAK HADIR
    ================================================= -->

    <div class="latest-member-section">

      <button
        type="button"
        class="latest-member-toggle"
        data-list="tidakHadir"
      >

        Lihat Nama TIDAK HADIR >

      </button>


      <div
        class="latest-member-list"
        data-list-content="tidakHadir"
        hidden
      >
      </div>

    </div>


    <!-- ================================================
         BELUM RESPON
    ================================================= -->

    <div class="latest-unanswered">

      Belum Respon:

      <strong>

        ${Number(
          program.belumRespon ||
          0
        )}

      </strong>

    </div>


    <!-- ================================================
         BUTTON / STATUS SELESAI
    ================================================= -->

    ${
      isProgramFinished
        ? `

          <div class="latest-program-finished-note">

            ✓ PROGRAM TELAH SELESAI

          </div>

        `
        : isProgramCancelled
          ? `

            <div class="latest-program-cancelled-note">

              PROGRAM DIBATALKAN

            </div>

          `
          : `

            <div
              class="
                latest-program-actions
                latest-program-actions-3
              "
            >


              <!-- EDIT -->

              <button
                type="button"
                class="latest-edit-button"
              >

                EDIT

              </button>


              <!-- SAHKAN -->

${
  !isProgramDraft
    ? `
      <button
        type="button"
        class="latest-confirm-button"
      >
        SAHKAN
      </button>
    `
    : ""
}


              <!-- BATAL -->

              <button
                type="button"
                class="latest-cancel-button"
              >

                BATAL PROGRAM

              </button>


            </div>

          `
    }

  `;


  /* ===================================================
     SENARAI HADIR
  =================================================== */

  setupMemberList(
    card,
    "hadir",
    program.hadirMembers ||
    []
  );


  /* ===================================================
     SENARAI TIDAK HADIR
  =================================================== */

  setupMemberList(
    card,
    "tidakHadir",
    program.tidakHadirMembers ||
    []
  );


  /* ===================================================
     BUTTON EDIT
  =================================================== */

  /* =====================================================
     DROPDOWN CARD
  ===================================================== */

  setupLatestActionCardDropdown(
    card
  );


  const editButton =
    card.querySelector(
      ".latest-edit-button"
    );


  if (editButton) {

    editButton.addEventListener(
      "click",
      function () {

        window.location.href =
          "admin-program.html" +
          "?mode=edit" +
          "&messageId=" +
          encodeURIComponent(
            program.messageId ||
            ""
          );

      }
    );

  }


  /* ===================================================
     BUTTON SAHKAN
  =================================================== */

  const confirmButton =
    card.querySelector(
      ".latest-confirm-button"
    );


  if (confirmButton) {

    confirmButton.addEventListener(
      "click",
      function () {

        if (
          !program.messageId
        ) {

          showManageMessage(
            "MESSAGE_ID Program tidak ditemui.",
            "error"
          );

          return;

        }


        window.location.href =
          "admin-program.html" +
          "?mode=confirm" +
          "&messageId=" +
          encodeURIComponent(
            program.messageId
          );

      }
    );


  }


/* ===================================================
   BUTTON BATAL PROGRAM
=================================================== */

const cancelButton =
  card.querySelector(
    ".latest-cancel-button"
  );


if (cancelButton) {

  cancelButton.addEventListener(
    "click",
    async function () {

      if (
        !program.messageId
      ) {

        showManageMessage(
          "MESSAGE_ID Program tidak ditemui.",
          "error"
        );

        return;

      }


      const confirmText =
        isProgramDraft

          ? "Adakah anda pasti mahu membatalkan Draf Program ini?"

          : "Adakah anda pasti mahu membatalkan Program ini?";


      const confirmed =
        window.confirm(
          confirmText
        );


      if (!confirmed) {
        return;
      }


      const originalText =
        cancelButton.textContent;


      cancelButton.disabled =
        true;


      cancelButton.textContent =
        "MEMBATALKAN...";


      try {

        const result =
          await apiPost({

            action:
              "admin_program_cancel",

            email:
              currentSession.googleEmail,

            messageId:
              program.messageId

          });


        if (
          !result ||
          result.success !== true
        ) {

          throw new Error(
            result?.error ||
            result?.message ||
            "Program gagal dibatalkan."
          );

        }


        showManageMessage(
          "Program berjaya dibatalkan.",
          "success"
        );


        /*
         * Refresh TINDAKAN TERKINI.
         * Status akan berubah menjadi BATAL.
         */

        latestActionItems =
          [];


        await Promise.all([

          loadLatestProgramActions(),

          loadLatestOperationActions()

        ]);


        renderLatestActions();


      } catch (error) {

        console.error(
          "CANCEL PROGRAM ERROR:",
          error
        );


        showManageMessage(
          error.message ||
          "Program gagal dibatalkan.",
          "error"
        );


        cancelButton.disabled =
          false;


        cancelButton.textContent =
          originalText;

      }

    }
  );

}


  return card;

}


/* =====================================================
   MEMBER LIST
===================================================== */

function setupMemberList(
  card,
  type,
  members
) {

  const button =
    card.querySelector(
      '[data-list="' +
      type +
      '"]'
    );


  const list =
    card.querySelector(
      '[data-list-content="' +
      type +
      '"]'
    );


  if (
    !button ||
    !list
  ) {
    return;
  }


  if (!members.length) {

    button.disabled =
      true;

    button.textContent =
      type === "hadir"
        ? "Tiada ahli HADIR"
        : "Tiada ahli TIDAK HADIR";

    return;

  }


  list.innerHTML =
    members
      .map(
        function (
          member,
          index
        ) {

          return `
            <div class="latest-member-row">

              <span class="latest-member-number">
                ${index + 1}.
              </span>

              <span>
                ${escapeManageHtml(
                  member.namaAhli ||
                  member.idPaspa ||
                  "-"
                )}
              </span>

            </div>
          `;

        }
      )
      .join("");


  button.addEventListener(
    "click",
    function () {

      list.hidden =
        !list.hidden;

    }
  );

}


/* =====================================================
   ESCAPE
===================================================== */

function escapeManageHtml(
  value
) {

  return String(
    value || ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}

/* =====================================================
   TINDAKAN TERKINI DROPDOWN
===================================================== */

const latestActionButton =
  document.getElementById(
    "latestActionButton"
  );


const latestActionContent =
  document.getElementById(
    "latestActionContent"
  );


const latestActionArrow =
  document.getElementById(
    "latestActionArrow"
  );


latestActionButton.addEventListener(
  "click",
  function () {

    const isHidden =
      latestActionContent.hidden;


    latestActionContent.hidden =
      !isHidden;


    latestActionArrow.textContent =
      isHidden
        ? "▲"
        : "▼";

  }
);


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
   BOTTOM NAVIGATION
===================================================== */

document
  .getElementById(
    "dashboardButton"
  )
  .addEventListener(
    "click",
    function () {

      window.location.href =
        "dashboard.html";

    }
  );


document
  .getElementById(
    "messageButton"
  )
  .addEventListener(
    "click",
    function () {

      window.location.href =
        "message.html";

    }
  );


/*
  On Scene dan Tetapan kita kekalkan
  sementara sehingga nama page
  sebenar disahkan.
*/
/* =====================================================
   ANJUR PROGRAM
===================================================== */

const adminProgramButton =
  document.getElementById(
    "adminProgramMenu"
  );

if (adminProgramButton) {

  adminProgramButton.addEventListener(
    "click",
    function () {

      window.location.href =
        "admin-program.html";

    }
  );

}


/* =====================================================
   ATUR GERAK OPERASI
===================================================== */

const adminOperationButton =
  document.getElementById(
    "adminOperationMenu"
  );


if (adminOperationButton) {

  adminOperationButton.addEventListener(
    "click",
    function () {

      window.location.href =
        "admin-operasi.html";

    }
  );

}


/* =====================================================
   LAPORAN
===================================================== */

const adminReportButton =
  document.getElementById(
    "adminReportMenu"
  );


if (adminReportButton) {

  adminReportButton.addEventListener(
    "click",
    function () {

      window.location.href =
        "laporan.html";

    }
  );

}

/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    await loadAdminMenus();


    latestActionItems =
      [];


    if (latestActionContent) {

      latestActionContent.innerHTML =
        '<div class="empty-action">Memuatkan tindakan terkini...</div>';

    }


    await Promise.all([

      loadLatestProgramActions(),

      loadLatestOperationActions()

    ]);


    renderLatestActions();

  }
);