/**
 * =========================================================
 * Melody Of Life 17 Planner
 * status.js
 * =========================================================
 *
 * SINGLE OWNER OF ARTIST STATUS
 *
 * Responsibilities:
 * - LIVE
 * - NEXT
 * - ENDED
 * - NEXT urgent state
 * - Status HTML presentation
 *
 * Time calculation belongs to time.js.
 *
 * =========================================================
 */


/* =========================================================
   CONFIG
========================================================= */

/*
 * NEXT จะเริ่มกระพริบเมื่อเหลือไม่เกิน 5 นาที
 * 5 นาที = 300 วินาที
 */

const NEXT_BLINK_SECONDS =
    5 * 60;


/* =========================================================
   ARTIST STATUS
========================================================= */

function getArtistStatus(
    artist
) {

    const now =
        getCurrentTime();


    const start =
        getArtistDateTime(
            artist,
            artist?.start
        );


    const end =
        getArtistDateTime(
            artist,
            artist?.end
        );


    if (
        !Number.isFinite(
            now?.getTime()
        ) ||

        !Number.isFinite(
            start?.getTime()
        ) ||

        !Number.isFinite(
            end?.getTime()
        )
    ) {

        return "ENDED";

    }


    if (
        end <= start
    ) {

        return "ENDED";

    }


    /*
     * LIVE
     */

    if (
        now >= start &&
        now < end
    ) {

        return "LIVE";

    }


    /*
     * NEXT
     */

    if (
        now < start
    ) {

        return "NEXT";

    }


    /*
     * ENDED
     */

    return "ENDED";

}


/* =========================================================
   SECONDS UNTIL START
========================================================= */

function getSecondsUntilArtistStart(
    artist
) {

    const now =
        getCurrentTime();


    const start =
        getArtistDateTime(
            artist,
            artist?.start
        );


    if (
        !Number.isFinite(
            now?.getTime()
        ) ||

        !Number.isFinite(
            start?.getTime()
        )
    ) {

        return Infinity;

    }


    return Math.floor(
        (
            start.getTime() -
            now.getTime()
        ) / 1000
    );

}


/* =========================================================
   NEXT BLINK STATE
========================================================= */

function isArtistNextUrgent(
    artist
) {

    /*
     * ต้องเป็น NEXT เท่านั้น
     */

    if (
        getArtistStatus(
            artist
        ) !==
        "NEXT"
    ) {

        return false;

    }


    const seconds =
        getSecondsUntilArtistStart(
            artist
        );


    return (
        seconds > 0 &&
        seconds <=
            NEXT_BLINK_SECONDS
    );

}


/* =========================================================
   STATUS INFO
========================================================= */

function getArtistStatusInfo(
    artist
) {

    const status =
        getArtistStatus(
            artist
        );


    return {

        status,

        urgent:
            status === "NEXT" &&
            isArtistNextUrgent(
                artist
            )

    };

}


/* =========================================================
   STATUS HTML
========================================================= */

function getStatusHTML(
    artist
) {

    const info =
        getArtistStatusInfo(
            artist
        );


    /* =====================================================
       LIVE
    ===================================================== */

    if (
        info.status ===
        "LIVE"
    ) {

        return `
<span class="status-live">

    <span
        class="live-dot"
        aria-hidden="true"
    ></span>

    <span class="artist-status-text">
        LIVE
    </span>

</span>
`;

    }


    /* =====================================================
       NEXT
    ===================================================== */

    if (
        info.status ===
        "NEXT"
    ) {

        return `
<span
    class="status-next${info.urgent
        ? " is-urgent"
        : ""
    }"
>

    🟡 NEXT

</span>
`;

    }


    /* =====================================================
       ENDED
    ===================================================== */

    return `
<span class="status-ended">

    ⚪ ENDED

</span>
`;

}


/* =========================================================
   DEBUG
========================================================= */

function debugArtistStatus(
    artist
) {

    const status =
        getArtistStatus(
            artist
        );


    const seconds =
        getSecondsUntilArtistStart(
            artist
        );


    const urgent =
        isArtistNextUrgent(
            artist
        );


    console.log(
        "Artist Status:",
        {
            artist:
                artist?.name || "",

            status,

            secondsUntilStart:
                Number.isFinite(
                    seconds
                )
                    ? seconds
                    : null,

            nextBlink:
                urgent
        }
    );

}