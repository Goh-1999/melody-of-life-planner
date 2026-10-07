/* =========================================================
   Melody Of Life 17 Planner
   ui/popup.js
   ========================================================= */

/* =========================================================
   SHOW POPUP
========================================================= */

function showPopup(
    title,
    message
) {

    const overlay =
        $("#popupOverlay");


    const titleElement =
        $("#popupTitle");


    const messageElement =
        $("#popupMessage");


    if (
        !overlay ||
        !titleElement ||
        !messageElement
    ) {

        window.alert(
            `${title}\n\n${message}`
        );


        return;

    }


    titleElement.textContent =
        String(
            title ?? ""
        );


    messageElement.textContent =
        String(
            message ?? ""
        );


    overlay.hidden =
        false;


    document.body.classList.add(
        "popup-open"
    );

}


/* =========================================================
   CLOSE POPUP
========================================================= */

function closePopup() {

    const overlay =
        $("#popupOverlay");


    if (
        !overlay
    ) {

        return;

    }


    overlay.hidden =
        true;


    /*
     * อย่าปิด body lock ถ้า Save Choice Popup
     * กำลังเปิดอยู่
     */

    const saveChoiceOverlay =
        $("#saveChoiceOverlay");


    if (
        !saveChoiceOverlay ||
        saveChoiceOverlay.hidden
    ) {

        document.body.classList.remove(
            "popup-open"
        );

    }

}


/* =========================================================
   POPUP EVENTS
========================================================= */

function setupPopupEvents() {

    const closeButton =
        $("#popupCloseButton");


    if (
        closeButton
    ) {

        closeButton.addEventListener(
            "click",
            closePopup
        );

    }


    const overlay =
        $("#popupOverlay");


    if (
        overlay
    ) {

        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    closePopup();

                }

            }
        );

    }


    /*
     * Bind Escape only once
     */

    if (
        window.__molPopupEscapeBound
    ) {

        return;

    }


    window.__molPopupEscapeBound =
        true;


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            /*
             * Save Choice Popup
             * has priority if open.
             */

            const saveChoiceOverlay =
                $("#saveChoiceOverlay");


            if (
                saveChoiceOverlay &&
                !saveChoiceOverlay.hidden
            ) {

                if (
                    typeof closeSaveChoicePopup ===
                    "function"
                ) {

                    closeSaveChoicePopup();

                }


                return;

            }


            closePopup();

        }
    );

}