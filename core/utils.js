/**
 * =========================================================
 * Melody Of Life 17 Planner
 * utils.js
 * =========================================================
 *
 * SHARED HELPERS ONLY
 *
 * This file contains generic utilities.
 *
 * Business logic belongs to the appropriate module.
 *
 * =========================================================
 */


/* =========================================================
   DOM HELPERS
========================================================= */

function $(selector) {

    return document.querySelector(
        selector
    );

}


function $$(selector) {

    return [
        ...document.querySelectorAll(
            selector
        )
    ];

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
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


/* =========================================================
   STAGE NORMALIZER
========================================================= */

function normalizeStageId(
    stageId
) {

    if (
        stageId === null ||
        stageId === undefined
    ) {

        return "";

    }


    return String(
        stageId
    )
        .trim()
        .toUpperCase()
        .replace(
            /^STAGE[\s_-]*/i,
            ""
        )
        .replace(
            /[\s_-]+/g,
            ""
        );

}


/* =========================================================
   TIME TO MINUTES
========================================================= */

function timeToMinutes(
    time
) {

    if (
        typeof time !==
            "string"
    ) {

        return NaN;

    }


    const value =
        time.trim();


    const match =
        value.match(
            /^(\d{2}):(\d{2})$/
        );


    if (
        !match
    ) {

        return NaN;

    }


    const hours =
        Number(
            match[1]
        );


    const minutes =
        Number(
            match[2]
        );


    if (
        !Number.isInteger(
            hours
        ) ||
        !Number.isInteger(
            minutes
        ) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {

        return NaN;

    }


    return (
        hours * 60 +
        minutes
    );

}


/* =========================================================
   STORAGE KEY
========================================================= */

function getStorageKey() {

    return (
        STORAGE.selectedArtists ||
        "mol17_selected_artists"
    );

}


/* =========================================================
   LOAD SELECTED ARTISTS
========================================================= */

function loadSelectedArtists() {

    try {

        const saved =
            localStorage.getItem(
                getStorageKey()
            );


        if (
            !saved
        ) {

            selectedArtistIds =
                [];

            return;

        }


        const parsed =
            JSON.parse(
                saved
            );


        if (
            !Array.isArray(
                parsed
            )
        ) {

            selectedArtistIds =
                [];

            return;

        }


        selectedArtistIds =
            [
                ...new Set(
                    parsed
                        .map(
                            Number
                        )
                        .filter(
                            Number.isFinite
                        )
                )
            ];

    }
    catch (
        error
    ) {

        console.warn(
            "⚠️ LocalStorage โหลดไม่ได้",
            error
        );


        selectedArtistIds =
            [];

    }

}


/* =========================================================
   SAVE SELECTED ARTISTS
========================================================= */

function saveSelectedArtists() {

    try {

        localStorage.setItem(
            getStorageKey(),
            JSON.stringify(
                selectedArtistIds
            )
        );

    }
    catch (
        error
    ) {

        console.warn(
            "⚠️ LocalStorage บันทึกไม่ได้",
            error
        );

    }

}