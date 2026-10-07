/* =========================================================
   Melody Of Life 17 Planner
   ui/conflict.js
   ========================================================= */

/* =========================================================
   CONFLICT CHECK
========================================================= */

function checkConflicts() {

    if (
        PLANNER.enableConflictWarning ===
        false
    ) {

        return [];

    }


    const artists =
        getSelectedArtists();


    if (
        !Array.isArray(
            artists
        ) ||
        artists.length < 2
    ) {

        return [];

    }


    const conflicts =
        [];


    for (
        let i = 0;
        i < artists.length;
        i++
    ) {

        const first =
            artists[i];


        const firstStart =
            timeToMinutes(
                first.start
            );


        const firstEnd =
            timeToMinutes(
                first.end
            );


        if (
            !Number.isFinite(
                firstStart
            ) ||
            !Number.isFinite(
                firstEnd
            )
        ) {

            continue;

        }


        for (
            let j = i + 1;
            j < artists.length;
            j++
        ) {

            const second =
                artists[j];


            /* =================================================
               DIFFERENT DAY
            ================================================= */

            if (
                first.dateISO !==
                second.dateISO
            ) {

                continue;

            }


            const secondStart =
                timeToMinutes(
                    second.start
                );


            const secondEnd =
                timeToMinutes(
                    second.end
                );


            if (
                !Number.isFinite(
                    secondStart
                ) ||
                !Number.isFinite(
                    secondEnd
                )
            ) {

                continue;

            }


            /* =================================================
               OVERLAP
               
               first.start < second.end
               second.start < first.end
            ================================================= */

            const overlaps =
                firstStart < secondEnd &&
                secondStart < firstEnd;


            if (
                overlaps
            ) {

                conflicts.push({

                    first,

                    second

                });

            }

        }

    }


    return conflicts;

}


/* =========================================================
   CONFLICT SIGNATURE
========================================================= */

function createConflictSignature(
    conflicts
) {

    if (
        !Array.isArray(
            conflicts
        ) ||
        conflicts.length === 0
    ) {

        return "";

    }


    return conflicts
        .map(
            conflict =>
                [

                    conflict.first.id,

                    conflict.first.dateISO,

                    conflict.first.start,

                    conflict.first.end,

                    conflict.second.id,

                    conflict.second.dateISO,

                    conflict.second.start,

                    conflict.second.end

                ].join(":")
        )
        .join("|");

}


/* =========================================================
   RENDER CONFLICT WARNING
========================================================= */

function renderConflictWarning() {

    const element =
        $("#conflictWarning");


    if (
        !element
    ) {

        return;

    }


    const conflicts =
        checkConflicts();


    const signature =
        createConflictSignature(
            conflicts
        );


    if (
        signature ===
        RENDER_STATE.lastConflictSignature
    ) {

        return;

    }


    RENDER_STATE.lastConflictSignature =
        signature;


    /* =====================================================
       NO CONFLICT
    ===================================================== */

    if (
        conflicts.length === 0
    ) {

        element.hidden =
            true;


        element.textContent =
            "";


        return;

    }


    /* =====================================================
       FIRST CONFLICT
    ===================================================== */

    const conflict =
        conflicts[0];


    element.textContent =
        `⚠️ เวลาแสดงชนกัน: ${conflict.first.name} × ${conflict.second.name}`;


    element.hidden =
        false;

}