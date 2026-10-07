/**
 * =========================================================
 * Melody Of Life 17 Planner
 * time.js
 * =========================================================
 *
 * TIME ENGINE
 *
 * Responsibilities:
 * - Bangkok date/time
 * - current time
 * - artist datetime
 * - progress
 * - countdown
 *
 * Status calculation belongs to status.js.
 * Status HTML belongs to status.js.
 *
 * =========================================================
 */


/* =========================================================
   BANGKOK DATE
========================================================= */

function createBangkokDate(
    date,
    time
) {

    if (
        !date ||
        !time ||
        !/^(\d{2}):(\d{2})(?::(\d{2}))?$/.test(
            time
        )
    ) {

        return new Date(
            NaN
        );

    }


    const match =
        time.match(
            /^(\d{2}):(\d{2})(?::(\d{2}))?$/
        );


    const hour =
        Number(
            match[1]
        );


    const minute =
        Number(
            match[2]
        );


    const second =
        Number(
            match[3] || 0
        );


    if (
        !Number.isInteger(
            hour
        ) ||

        !Number.isInteger(
            minute
        ) ||

        !Number.isInteger(
            second
        ) ||

        hour < 0 ||
        hour > 23 ||

        minute < 0 ||
        minute > 59 ||

        second < 0 ||
        second > 59
    ) {

        return new Date(
            NaN
        );

    }


    return new Date(

        `${date}T` +

        `${String(hour).padStart(2, "0")}:` +

        `${String(minute).padStart(2, "0")}:` +

        `${String(second).padStart(2, "0")}` +

        "+07:00"

    );

}


/* =========================================================
   CURRENT TIME
========================================================= */

function getCurrentTime() {

    if (
        simulationEnabled
    ) {

        return createBangkokDate(

            simulationDate,

            simulationTime

        );

    }


    return new Date();

}


/* =========================================================
   ARTIST DATETIME
========================================================= */

function getArtistDateTime(
    artist,
    time
) {

    if (
        !artist ||
        !artist.dateISO ||
        !time
    ) {

        return new Date(
            NaN
        );

    }


    return createBangkokDate(

        artist.dateISO,

        time

    );

}


/* =========================================================
   PROGRESS
========================================================= */

function getProgressPercent(
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
            start.getTime()
        ) ||

        !Number.isFinite(
            end.getTime()
        ) ||

        end <= start
    ) {

        return 0;

    }


    if (
        now <= start
    ) {

        return 0;

    }


    if (
        now >= end
    ) {

        return 100;

    }


    return Math.max(

        0,

        Math.min(

            100,

            (
                (now - start) /
                (end - start)
            ) * 100

        )

    );

}


/* =========================================================
   COUNTDOWN FORMAT
========================================================= */

function formatCountdown(
    totalSeconds
) {

    const safe =
        Math.max(

            0,

            Math.floor(
                Number(
                    totalSeconds
                ) || 0
            )

        );


    const hours =
        Math.floor(
            safe / 3600
        );


    const minutes =
        Math.floor(
            (safe % 3600) / 60
        );


    const seconds =
        safe % 60;


    if (
        hours > 0
    ) {

        return (

            `${String(hours).padStart(2, "0")}:` +

            `${String(minutes).padStart(2, "0")}:` +

            `${String(seconds).padStart(2, "0")}`

        );

    }


    return (

        `${String(minutes).padStart(2, "0")}:` +

        `${String(seconds).padStart(2, "0")}`

    );

}


/* =========================================================
   ARTIST COUNTDOWN
========================================================= */

function getArtistCountdown(
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
            start.getTime()
        ) ||

        !Number.isFinite(
            end.getTime()
        )
    ) {

        return {

            type:
                "ended",

            seconds:
                0,

            text:
                ""

        };

    }


    const toStart =
        Math.ceil(
            (start - now) / 1000
        );


    const toEnd =
        Math.ceil(
            (end - now) / 1000
        );


    /* -----------------------------------------------------
       BEFORE START
       First 5 minutes
    ----------------------------------------------------- */

    if (
        toStart > 0 &&
        toStart <= 300
    ) {

        return {

            type:
                "start",

            seconds:
                toStart,

            text:
                `เริ่มใน ${formatCountdown(
                    toStart
                )}`

        };

    }


    /* -----------------------------------------------------
       LIVE
    ----------------------------------------------------- */

    if (
        now >= start &&
        now < end
    ) {

        if (
            toEnd > 0 &&
            toEnd <= 300
        ) {

            return {

                type:
                    "ending",

                seconds:
                    toEnd,

                text:
                    `จบใน ${formatCountdown(
                        toEnd
                    )}`

            };

        }


        return {

            type:
                "live",

            seconds:
                toEnd,

            text:
                "กำลังแสดง"

        };

    }


    /* -----------------------------------------------------
       ENDED
    ----------------------------------------------------- */

    if (
        now >= end
    ) {

        return {

            type:
                "ended",

            seconds:
                0,

            text:
                "การแสดงจบแล้ว"

        };

    }


    /* -----------------------------------------------------
       WAITING
    ----------------------------------------------------- */

    return {

        type:
            "waiting",

        seconds:
            toStart,

        text:
            `เริ่มเวลา ${artist.start}`

    };

}
/* =========================================================
   FESTIVAL CURRENT DATE
========================================================= */

function getCurrentFestivalDate() {

    const now =
        getCurrentTime();


    if (
        !Number.isFinite(
            now.getTime()
        )
    ) {

        return (
            FESTIVAL.startDate ||
            ALLOWED_DATES[0] ||
            "2026-10-16"
        );

    }


    /*
     * getCurrentTime() returns a Date object.
     * Use Bangkok calendar values directly so
     * the date does not shift because of UTC.
     */

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


    const currentDate =
        `${year}-${month}-${day}`;


    const startDate =
        FESTIVAL.startDate ||
        ALLOWED_DATES[0] ||
        "2026-10-16";


    const endDate =
        FESTIVAL.endDate ||
        ALLOWED_DATES[
            ALLOWED_DATES.length - 1
        ] ||
        startDate;


    /*
     * Before festival:
     * use first festival day.
     */

    if (
        currentDate <
        startDate
    ) {

        return startDate;

    }


    /*
     * During festival:
     * use current festival day.
     */

    if (
        currentDate >= startDate &&
        currentDate <= endDate
    ) {

        if (
            ALLOWED_DATES.includes(
                currentDate
            )
        ) {

            return currentDate;

        }

    }


    /*
     * After festival:
     * keep the last festival day.
     */

    if (
        currentDate >
        endDate
    ) {

        return endDate;

    }


    return startDate;

}