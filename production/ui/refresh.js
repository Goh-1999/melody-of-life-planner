/* =========================================================
   Melody Of Life 17 Planner
   ui/refresh.js
   ========================================================= */

/*
 * PAGE REFRESH HELPERS
 *
 * Transition logic belongs to:
 * ui/transition.js
 *
 * This file intentionally does NOT define:
 * playPageRefreshTransition()
 *
 * to prevent duplicate functions.
 */


/* =========================================================
   REFRESH UI
========================================================= */

/*
 * ใช้สำหรับกรณีที่ต้องการรีเฟรช UI
 * โดยไม่สร้างระบบ render ซ้ำ
 *
 * Main render owner:
 * app.js
 */

function refreshUI() {

    if (
        typeof renderApp ===
        "function"
    ) {

        renderApp({

            transition:
                false,

            force:
                true,

            renderFilters:
                true

        });

    }

}


/* =========================================================
   SAFE REFRESH
========================================================= */

/*
 * เรียกใช้เมื่อ DOM พร้อมแล้วเท่านั้น
 */

function safeRefreshUI() {

    if (
        document.readyState ===
            "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            refreshUI,
            {
                once:
                    true
            }
        );

        return;

    }


    refreshUI();

}