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
   ELEMENT
===================================================== */

const reportMessage =
  document.getElementById(
    "reportMessage"
  );


function showReportMessage(
  message,
  type
) {

  reportMessage.textContent =
    message || "";

  reportMessage.className =
    "report-message " +
    (type || "");

  reportMessage.hidden =
    false;

}


/* =====================================================
   LOAD MEMBER SUMMARY
===================================================== */

async function loadMemberSummary() {

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

    const result =
      await apiPost({

        action:
          "admin_report_member_summary",

        idPaspa:
          currentSession.idPaspa

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Laporan ahli tidak dapat dimuatkan."
      );

    }


    /* JUMLAH */

    document.getElementById(
      "totalMembers"
    ).textContent =
      result.totalMembers || 0;


    document.getElementById(
      "totalMale"
    ).textContent =
      result.totalMale || 0;


    document.getElementById(
      "totalFemale"
    ).textContent =
      result.totalFemale || 0;


    document.getElementById(
      "totalLoggedIn"
    ).textContent =
      result.totalLoggedIn || 0;


    document.getElementById(
      "totalNotLoggedIn"
    ).textContent =
      result.totalNotLoggedIn || 0;


    /* NEGERI / PTJ */

    renderStateList(
      result.byState || []
    );


  } catch (error) {

    console.error(
      "REPORT MEMBER SUMMARY ERROR:",
      error
    );


    showReportMessage(
      error.message ||
      "Laporan tidak dapat dimuatkan.",
      "error"
    );

  }

}


/* =====================================================
   STATE / PTJ
===================================================== */

function renderStateList(
  items
) {

  const container =
    document.getElementById(
      "stateList"
    );


  container.innerHTML =
    "";


  if (
    !Array.isArray(items) ||
    !items.length
  ) {

    container.innerHTML =
      '<div class="empty-text">Tiada maklumat negeri / PTJ.</div>';

    return;

  }


  items.forEach(
    function (item) {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "state-row";


      row.innerHTML =
        `
          <span>
            ${escapeReportHtml(
              item.name || "-"
            )}
          </span>

          <strong>
            ${Number(
              item.total || 0
            )}
          </strong>
        `;


      container.appendChild(
        row
      );

    }
  );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeReportHtml(
  value
) {

  return String(
    value || ""
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =====================================================
   NAVIGATION
===================================================== */

document
  .getElementById(
    "backButton"
  )
  .addEventListener(
    "click",
    function () {

      window.location.href =
        "urus.html";

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
   PROGRAM REPORT
===================================================== */

let reportPrograms = [];

let selectedProgramLocation =
  "SEMUA";


async function loadProgramReport() {

  try {

    const result =
      await apiPost({

        action:
          "admin_report_programs",

        idPaspa:
          currentSession.idPaspa

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Laporan Program tidak dapat dimuatkan."
      );

    }


    reportPrograms =
      Array.isArray(result.programs)
        ? result.programs
        : [];


    populateProgramYears(
      result.years || []
    );


    updateProgramReport();


  } catch (error) {

    console.error(
      "PROGRAM REPORT ERROR:",
      error
    );


    showReportMessage(
      error.message ||
      "Laporan Program tidak dapat dimuatkan.",
      "error"
    );

  }

}


/* =====================================================
   TAHUN PROGRAM
===================================================== */

function populateProgramYears(
  years
) {

  const select =
    document.getElementById(
      "programYear"
    );


  select.innerHTML =
    "";


  if (
    !Array.isArray(years) ||
    !years.length
  ) {

    select.innerHTML =
      '<option value="">Tiada Tahun</option>';

    return;

  }


  years.forEach(
    function (year) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        String(year);

      option.textContent =
        String(year);


      select.appendChild(
        option
      );

    }
  );


  /* PILIH TAHUN TERBARU */

  select.value =
    String(years[0]);

}


/* =====================================================
   FILTER PROGRAM
===================================================== */

function getFilteredPrograms() {

  const selectedYear =
    String(
      document.getElementById(
        "programYear"
      ).value || ""
    );


  return reportPrograms.filter(
    function (program) {

      const yearMatch =
        String(program.tahun) ===
        selectedYear;


      let locationMatch =
        true;


      if (
        selectedProgramLocation !==
        "SEMUA"
      ) {

        locationMatch =
          String(
            program.lokasiProgram || ""
          )
            .trim()
            .toUpperCase() ===
          selectedProgramLocation;

      }


      return (
        yearMatch &&
        locationMatch
      );

    }
  );

}


/* =====================================================
   UPDATE JUMLAH
===================================================== */

function updateProgramReport() {

  const filtered =
    getFilteredPrograms();


  document.getElementById(
    "totalPrograms"
  ).textContent =
    filtered.length;


  /* Bila filter berubah, tutup semula senarai */

  const list =
    document.getElementById(
      "programList"
    );


  list.hidden =
    true;

}


/* =====================================================
   PAPAR SENARAI PROGRAM
===================================================== */

function renderProgramList() {

  const container =
    document.getElementById(
      "programList"
    );


  const programs =
    getFilteredPrograms();


  container.innerHTML =
    "";


  if (!programs.length) {

    container.innerHTML =
      '<div class="empty-text">Tiada program bagi pilihan ini.</div>';

    container.hidden =
      false;

    return;

  }


  programs.forEach(
    function (program, index) {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "program-row";


      let dateText =
        program.tarikhMula || "-";


      if (
        program.tarikhTamat &&
        program.tarikhTamat !==
        program.tarikhMula
      ) {

        dateText +=
          " hingga " +
          program.tarikhTamat;

      }


      row.innerHTML =
        `
          <div class="program-name">
            ${index + 1}. ${escapeReportHtml(
              program.perkara || "-"
            )}
          </div>

          <div class="program-date">
            ${escapeReportHtml(
              dateText
            )}
          </div>
        `;


      container.appendChild(
        row
      );

    }
  );


  container.hidden =
    false;

}


/* =====================================================
   EVENT PROGRAM
===================================================== */

document
  .getElementById(
    "programYear"
  )
  .addEventListener(
    "change",
    updateProgramReport
  );


document
  .querySelectorAll(
    ".program-filter"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          selectedProgramLocation =
            String(
              button.dataset.location ||
              "SEMUA"
            ).toUpperCase();


          document
            .querySelectorAll(
              ".program-filter"
            )
            .forEach(
              function (item) {

                item.classList.remove(
                  "active"
                );

              }
            );


          button.classList.add(
            "active"
          );


          updateProgramReport();

        }
      );

    }
  );


document
  .getElementById(
    "viewProgramsButton"
  )
  .addEventListener(
    "click",
    function () {

      const container =
        document.getElementById(
          "programList"
        );


      if (!container.hidden) {

        container.hidden =
          true;

        return;

      }


      renderProgramList();

    }
  );


  /* =====================================================
   OPERATION REPORT
===================================================== */

let reportOperations = [];

let selectedOperationLocation =
  "SEMUA";


async function loadOperationReport() {

  try {

    const result =
      await apiPost({

        action:
          "admin_report_operation_summary",

        idPaspa:
          currentSession.idPaspa,

        year:
          "",

        location:
          "SEMUA"

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Laporan Operasi tidak dapat dimuatkan."
      );

    }


    reportOperations =
      Array.isArray(
        result.operations
      )
        ? result.operations
        : [];


    populateOperationYears(
      result.years || []
    );


    updateOperationReport();


  } catch (error) {

    console.error(
      "OPERATION REPORT ERROR:",
      error
    );


    showReportMessage(
      error.message ||
      "Laporan Operasi tidak dapat dimuatkan.",
      "error"
    );

  }

}


/* =====================================================
   TAHUN OPERASI
===================================================== */

function populateOperationYears(
  years
) {

  const select =
    document.getElementById(
      "operationYear"
    );


  select.innerHTML =
    "";


  if (
    !Array.isArray(years) ||
    !years.length
  ) {

    select.innerHTML =
      '<option value="">Tiada Tahun</option>';

    return;

  }


  years.forEach(
    function (year) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        String(year);

      option.textContent =
        String(year);


      select.appendChild(
        option
      );

    }
  );


  /* PILIH TAHUN TERBARU */

  select.value =
    String(
      years[0]
    );

}


/* =====================================================
   FILTER OPERASI
===================================================== */

function getFilteredOperations() {

  const selectedYear =
    String(
      document
        .getElementById(
          "operationYear"
        )
        .value || ""
    );


  return reportOperations.filter(
    function (operation) {

      const yearMatch =
        String(
          operation.tahun
        ) ===
        selectedYear;


      let locationMatch =
        true;


      if (
        selectedOperationLocation !==
        "SEMUA"
      ) {

        locationMatch =
          String(
            operation.lokasiOperasi ||
            ""
          )
            .trim()
            .toUpperCase() ===
          selectedOperationLocation;

      }


      return (
        yearMatch &&
        locationMatch
      );

    }
  );

}


/* =====================================================
   UPDATE JUMLAH OPERASI
===================================================== */

function updateOperationReport() {

  const filtered =
    getFilteredOperations();


  document
    .getElementById(
      "totalOperations"
    )
    .textContent =
      filtered.length;


  /* Bila filter berubah,
     tutup semula senarai */

  const list =
    document.getElementById(
      "operationList"
    );


  list.hidden =
    true;

}


/* =====================================================
   PAPAR SENARAI OPERASI
===================================================== */

function renderOperationList() {

  const container =
    document.getElementById(
      "operationList"
    );


  const operations =
    getFilteredOperations();


  container.innerHTML =
    "";


  if (!operations.length) {

    container.innerHTML =
      '<div class="empty-text">Tiada operasi bagi pilihan ini.</div>';

    container.hidden =
      false;

    return;

  }


  operations.forEach(
    function (
      operation,
      index
    ) {

      const row =
        document.createElement(
          "div"
        );


      row.className =
        "program-row";


      let dateText =
        operation.tarikhMula ||
        "-";


      if (
        operation.tarikhTamat &&
        operation.tarikhTamat !==
        operation.tarikhMula
      ) {

        dateText +=
          " hingga " +
          operation.tarikhTamat;

      }


      row.innerHTML =
        `
          <div class="program-name">
            ${index + 1}. ${escapeReportHtml(
              operation.perkara ||
              "-"
            )}
          </div>

          <div class="program-date">
            ${escapeReportHtml(
              dateText
            )}
          </div>
        `;


      container.appendChild(
        row
      );

    }
  );


  container.hidden =
    false;

}


/* =====================================================
   EVENT OPERASI
===================================================== */

document
  .getElementById(
    "operationYear"
  )
  .addEventListener(
    "change",
    updateOperationReport
  );


document
  .querySelectorAll(
    ".operation-filter"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          selectedOperationLocation =
            String(
              button.dataset.location ||
              "SEMUA"
            )
              .toUpperCase();


          document
            .querySelectorAll(
              ".operation-filter"
            )
            .forEach(
              function (item) {

                item.classList.remove(
                  "active"
                );

              }
            );


          button.classList.add(
            "active"
          );


          updateOperationReport();

        }
      );

    }
  );


document
  .getElementById(
    "viewOperationsButton"
  )
  .addEventListener(
    "click",
    function () {

      const container =
        document.getElementById(
          "operationList"
        );


      if (!container.hidden) {

        container.hidden =
          true;

        return;

      }


      renderOperationList();

    }
  );



/* =====================================================
   BMI REPORT
===================================================== */

let reportBmiMembers = [];


async function loadBmiReport() {

  try {

    const result =
      await apiPost({

        action:
          "admin_report_bmi",

        idPaspa:
          currentSession.idPaspa

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Laporan BMI tidak dapat dimuatkan."
      );

    }


    reportBmiMembers =
      Array.isArray(
        result.members
      )
        ? result.members
        : [];


    const summary =
      result.summary || {};


    document
      .getElementById(
        "bmiUnderweight"
      )
      .textContent =
        summary.underweight || 0;


    document
      .getElementById(
        "bmiNormal"
      )
      .textContent =
        summary.normal || 0;


    document
      .getElementById(
        "bmiOverweight"
      )
      .textContent =
        summary.overweight || 0;


    document
      .getElementById(
        "bmiObese"
      )
      .textContent =
        summary.obese || 0;


  } catch (error) {

    console.error(
      "BMI REPORT ERROR:",
      error
    );


    showReportMessage(
      error.message ||
      "Laporan BMI tidak dapat dimuatkan.",
      "error"
    );

  }

}


/* =====================================================
   PAPAR AHLI MENGIKUT KATEGORI BMI
===================================================== */

function renderBmiCategoryMembers(
  category
) {

  const container =
    document.getElementById(
      "bmiCategoryList"
    );


  const members =
    reportBmiMembers.filter(
      function (member) {

        return (
          String(
            member.status || ""
          ).toUpperCase() ===
          String(
            category || ""
          ).toUpperCase()
        );

      }
    );


  container.innerHTML =
    "";


  if (!members.length) {

    container.innerHTML =
      '<div class="empty-text">Tiada ahli dalam kategori ini.</div>';

    container.hidden =
      false;

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
        "bmi-member-row";


      row.innerHTML = `

        <div class="bmi-member-name">

          ${index + 1}.
          ${escapeReportHtml(
            (
              String(
                member.pangkat || ""
              ) +
              " " +
              String(
                member.nama || ""
              )
            ).trim()
          )}

        </div>


        <div class="bmi-member-detail">

          ID PASPA:
          <strong>
            ${escapeReportHtml(
              member.idPaspa || "-"
            )}
          </strong>

          &nbsp; | &nbsp;

          BMI:
          <strong>
            ${Number(
              member.bmi
            ).toFixed(1)}
          </strong>

        </div>

      `;


      container.appendChild(
        row
      );

    }
  );


  container.hidden =
    false;

}


/* =====================================================
   BUTTON BILANGAN BMI
===================================================== */

document
  .querySelectorAll(
    ".bmi-count-button"
  )
  .forEach(
    function (button) {

      button.addEventListener(
        "click",
        function () {

          const category =
            button.dataset.bmiCategory ||
            "";


          const container =
            document.getElementById(
              "bmiCategoryList"
            );


          if (
            !container.hidden &&
            container.dataset.category ===
              category
          ) {

            container.hidden =
              true;

            container.dataset.category =
              "";

            return;

          }


          container.dataset.category =
            category;


          renderBmiCategoryMembers(
            category
          );

        }
      );

    }
  );


/* =====================================================
   JEJAK BERAT
===================================================== */

const bmiMemberSearch =
  document.getElementById(
    "bmiMemberSearch"
  );


if (bmiMemberSearch) {

  bmiMemberSearch.addEventListener(
    "input",
    function () {

      const searchText =
        String(
          bmiMemberSearch.value ||
          ""
        )
          .trim()
          .toUpperCase();


      const container =
        document.getElementById(
          "bmiSearchResults"
        );


      container.innerHTML =
        "";


      if (
        searchText.length < 2
      ) {

        return;

      }


      const results =
        reportBmiMembers
          .filter(
            function (member) {

              const id =
                String(
                  member.idPaspa || ""
                ).toUpperCase();


              const name =
                String(
                  member.nama || ""
                ).toUpperCase();


              return (
                id.includes(
                  searchText
                ) ||
                name.includes(
                  searchText
                )
              );

            }
          )
          .slice(
            0,
            10
          );


      if (!results.length) {

        container.innerHTML =
          '<div class="empty-text">Ahli tidak ditemui.</div>';

        return;

      }


      results.forEach(
        function (member) {

          const card =
            document.createElement(
              "div"
            );


          card.className =
            "bmi-search-card";


          card.innerHTML = `

            <div class="bmi-search-name">

              ${escapeReportHtml(
                (
                  String(
                    member.pangkat || ""
                  ) +
                  " " +
                  String(
                    member.nama || ""
                  )
                ).trim()
              )}

            </div>


            <div class="bmi-search-meta">

              ID PASPA:
              <strong>
                ${escapeReportHtml(
                  member.idPaspa || "-"
                )}
              </strong>

            </div>


            <div class="bmi-search-meta">

              BMI:
              <strong>
                ${Number(
                  member.bmi
                ).toFixed(1)}
              </strong>

            </div>


            <div class="bmi-search-status">

              STATUS:
              <strong>
                ${escapeReportHtml(
                  member.status || "-"
                )}
              </strong>

            </div>

          `;


          container.appendChild(
            card
          );

        }
      );

    }
  );

}

/* =====================================================
   SIZE REPORT
===================================================== */

let reportSizes = {};


async function loadSizeReport() {

  try {

    const result =
      await apiPost({

        action:
          "admin_report_sizes",

        idPaspa:
          currentSession.idPaspa

      });


    if (
      !result ||
      result.success !== true
    ) {

      throw new Error(
        result?.message ||
        "Laporan saiz tidak dapat dimuatkan."
      );

    }


    reportSizes =
      result.sizes || {};


    renderSizeReport();


  } catch (error) {

    console.error(
      "SIZE REPORT ERROR:",
      error
    );


    showReportMessage(
      error.message ||
      "Laporan saiz tidak dapat dimuatkan.",
      "error"
    );

  }

}


/* =====================================================
   RENDER SIZE REPORT
===================================================== */

function renderSizeReport() {

  const container =
    document.getElementById(
      "sizeReportList"
    );


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  const categories = [

    {
      key:
        "tshirt",

      label:
        "T-SHIRT"
    },

    {
      key:
        "seluarSukan",

      label:
        "SELUAR SUKAN"
    },

    {
      key:
        "uniform",

      label:
        "UNIFORM"
    },

    {
      key:
        "beret",

      label:
        "BERET"
    },

    {
      key:
        "jaket",

      label:
        "JAKET"
    },

    {
      key:
        "kasutSukan",

      label:
        "KASUT SUKAN"
    },

    {
      key:
        "boot",

      label:
        "BOOT"
    },

    {
      key:
        "taliPinggang",

      label:
        "TALI PINGGANG"
    }

  ];


  categories.forEach(
    function (category) {

      const data =
        reportSizes[
          category.key
        ] || {};


      const counts =
        data.counts || {};


      const filled =
        Number(
          data.filled || 0
        );


      const totalMembers =
        Number(
          data.totalMembers || 0
        );


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "size-report-item";


      item.innerHTML = `

        <button
          type="button"
          class="size-report-header"
        >

          <div>

            <div class="size-report-name">

              ${escapeReportHtml(
                category.label
              )}

            </div>

            <div class="size-report-total">

              JUMLAH:
              ${filled}/${totalMembers}

            </div>

          </div>


          <span class="size-report-arrow">
            ▼
          </span>

        </button>


        <div
          class="size-report-detail"
          hidden
        >
        </div>

      `;


      const header =
        item.querySelector(
          ".size-report-header"
        );


      const detail =
        item.querySelector(
          ".size-report-detail"
        );


      const arrow =
        item.querySelector(
          ".size-report-arrow"
        );


      Object.keys(
        counts
      )
        .forEach(
          function (size) {

            const row =
              document.createElement(
                "div"
              );


            row.className =
              "size-report-row";


            row.innerHTML = `

              <span>
                ${escapeReportHtml(
                  size
                )}
              </span>

              <strong>
                ${Number(
                  counts[size] || 0
                )}
              </strong>

            `;


            detail.appendChild(
              row
            );

          }
        );


      header.addEventListener(
        "click",
        function () {

          const isOpen =
            !detail.hidden;


          detail.hidden =
            isOpen;


          arrow.textContent =
            isOpen
              ? "▼"
              : "▲";

        }
      );


      container.appendChild(
        item
      );

    }
  );

}


/* =====================================================
   START
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

   /* =================================================
       SEMAK SESSION
    ================================================= */

    if (
      !currentSession ||
      currentSession.isLoggedIn !== true ||
      !currentSession.idPaspa
    ) {

      window.location.href =
        "../index.html";

      return;

    }


    /* =================================================
       LOAD LAPORAN
    ================================================= */
    await loadMemberSummary();

    await loadBmiReport();

    await loadProgramReport();

    await loadOperationReport();
    
    await loadSizeReport();

  }
);