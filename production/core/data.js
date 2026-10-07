/**
 * =========================================================
 * Melody Of Life 17 Planner
 * data.js
 * =========================================================
 *
 * DATA ACCESS LAYER
 *
 * artistData.js
 * -> loads + normalizes Excel
 *
 * data.js
 * -> reads + queries normalized data
 *
 * No Excel loading lives here.
 * =========================================================
 */


/* =========================================================
   FESTIVAL DATE
========================================================= */

function isAllowedDate(
    dateISO
) {

    if (
        !dateISO
    ) {

        return false;

    }


    if (
        Array.isArray(
            festivalDays
        ) &&
        festivalDays.length > 0
    ) {

        return festivalDays.some(
            day =>
                day &&
                day.dateISO ===
                    dateISO
        );

    }


    if (
        Array.isArray(
            ALLOWED_DATES
        )
    ) {

        return ALLOWED_DATES.includes(
            dateISO
        );

    }


    return false;

}


function getFestivalDay(
    dateISO
) {

    if (
        typeof festivalDays ===
            "undefined" ||
        !Array.isArray(
            festivalDays
        )
    ) {

        return null;

    }


    return (
        festivalDays.find(
            day =>
                day?.dateISO ===
                    dateISO
        ) || null
    );

}


function getAllowedFestivalDays() {

    if (
        typeof festivalDays ===
            "undefined" ||
        !Array.isArray(
            festivalDays
        )
    ) {

        return [];

    }


    return festivalDays.filter(
        day =>
            day &&
            isAllowedDate(
                day.dateISO
            )
    );

}


/* =========================================================
   ARTIST DATA
========================================================= */

function getAllArtists() {

    const artists =

        typeof window.getArtistData ===
            "function"

            ? window.getArtistData()

            : (

                typeof artistData !==
                    "undefined"

                    ? artistData

                    : []

            );


    if (
        !Array.isArray(
            artists
        )
    ) {

        console.error(
            "❌ Artist Data ไม่ใช่ Array"
        );

        return [];

    }


    if (
        artists.length === 0
    ) {

        console.error(
            "❌ Artist Data ว่าง"
        );

        return [];

    }


    return artists.filter(
        artist =>
            Boolean(

                artist &&
                artist.name &&
                artist.dateISO &&
                artist.stage &&
                artist.start &&
                artist.end

            )
    );

}


function getArtistById(
    id
) {

    return (

        getAllArtists().find(
            artist =>
                Number(
                    artist.id
                ) ===
                Number(
                    id
                )
        ) || null

    );

}