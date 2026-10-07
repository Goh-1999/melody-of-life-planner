/* =========================================================
   Melody Of Life 17 Planner
   Refactored from legacy script.js
   ========================================================= */

/* =========================================================
   REALTIME CLOCK
========================================================= */

/* =========================================================
   REALTIME DATE FORMATTER
   รูปแบบตายตัว:
   ศุกร์ 16 ต.ค. 2569
========================================================= */

function formatRealtimeDate(
    date
) {

    if (
        !date ||
        !Number.isFinite(
            date.getTime()
        )
    ) {

        return "";

    }


    const parts =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                timeZone:
                    TIMEZONE,

                weekday:
                    "short",

                day:
                    "2-digit",

                month:
                    "2-digit",

                year:
                    "numeric"
            }
        ).formatToParts(
            date
        );


    const getPart =
        type =>
            parts.find(
                part =>
                    part.type === type
            )?.value ||
            "";


    const weekdayNumber =
        new Intl.DateTimeFormat(
            "en-GB",
            {
                timeZone:
                    TIMEZONE,

                weekday:
                    "short"
            }
        ).format(
            date
        );


    const weekdayMap = {

        Mon: "จ.",
        Tue: "อ.",
        Wed: "พ.",
        Thu: "พฤ.",
        Fri: "ศ.",
        Sat: "ส.",
        Sun: "อา."

    };


    const monthMap = {

        "01": "ม.ค.",
        "02": "ก.พ.",
        "03": "มี.ค.",
        "04": "เม.ย.",
        "05": "พ.ค.",
        "06": "มิ.ย.",
        "07": "ก.ค.",
        "08": "ส.ค.",
        "09": "ก.ย.",
        "10": "ต.ค.",
        "11": "พ.ย.",
        "12": "ธ.ค."

    };


    const weekday =
        weekdayMap[
        weekdayNumber
        ] || "";


    const day =
        String(
            Number(
                getPart("day")
            )
        );


    const month =
        monthMap[
        getPart("month")
        ] || "";


    const yearAD =
        Number(
            getPart("year")
        );


    const yearBE =
        Number.isFinite(
            yearAD
        )
            ? yearAD + 543
            : "";


    return (
        `${weekday} ${day} ${month} ${yearBE}`
    ).trim();

}
function updateClock() {

    const clock =
        $("#clock");


    const dateElement =
        $("#realtimeDate");


    const phaseIcon =
        $("#realtimePhaseIcon");


    const phaseLabel =
        $("#realtimePhaseLabel");


    const context =
        $("#realtimeContext");


    const now =
        getCurrentTime();


    if (
        !Number.isFinite(
            now.getTime()
        )
    ) {

        return;

    }


    const hour =
        Number(
            new Intl.DateTimeFormat(
                "en-GB",
                {
                    timeZone:
                        TIMEZONE,
                    hour:
                        "2-digit",
                    hourCycle:
                        "h23"
                }
            )
                .format(now)
        );


    const isDay =
    hour >= 6 &&
    hour < 18;

const phaseKey =
    isDay
        ? "day"
        : "night";

const previousPhase =
    phaseIcon?.dataset.phase ||
    null;


/* =====================================================
   DAY / NIGHT TRANSITION
===================================================== */

if (
    phaseIcon &&
    phaseKey !== previousPhase
) {

    const shouldAnimate =
        previousPhase !== null;


    phaseIcon.dataset.phase =
        phaseKey;


    if (
        shouldAnimate
    ) {

        phaseIcon.classList.add(
            "is-phase-switching"
        );

        phaseLabel?.classList.add(
            "is-phase-switching"
        );

        context?.classList.add(
            "is-phase-switching"
        );


        window.setTimeout(
            () => {

                phaseIcon?.classList.remove(
                    "is-phase-switching"
                );

                phaseLabel?.classList.remove(
                    "is-phase-switching"
                );

                context?.classList.remove(
                    "is-phase-switching"
                );

            },
            500
        );

    }


    phaseIcon.textContent =
        isDay
            ? "☀️"
            : "🌙";


    if (
        phaseLabel
    ) {

        phaseLabel.textContent =
            isDay
                ? "กลางวัน"
                : "กลางคืน";

    }


    if (
        context
    ) {

        context.textContent =
            isDay
                ? "DAY MODE"
                : "NIGHT MODE";

    }

    }


    if (
        clock &&
        PLANNER.enableRealtimeClock !==
        false
    ) {

        clock.textContent =
            new Intl.DateTimeFormat(
                "th-TH",
                {
                    timeZone:
                        TIMEZONE,
                    hour:
                        "2-digit",
                    minute:
                        "2-digit",
                    second:
                        "2-digit",
                    hourCycle:
                        "h23"
                }
            ).format(now);

    }


    if (
        dateElement
    ) {

        dateElement.textContent =
            formatRealtimeDate(
                now
            );

    }

}

/* =========================================================
   REALTIME DESKTOP FIX
   ========================================================= */

function fixRealtimeBarDesktop() {

    const bar =
        $(".realtime-bar");


    if (
        !bar
    ) {

        return;

    }


    const isDesktop =
        window.innerWidth >= 901;


    if (
        isDesktop
    ) {

        /*
         * ล็อกกรอบทั้งก้อน
         */

        bar.style.setProperty(
            "position",
            "absolute",
            "important"
        );


        bar.style.setProperty(
            "top",
            "50%",
            "important"
        );


        bar.style.setProperty(
            "right",
            "24px",
            "important"
        );


        bar.style.setProperty(
            "width",
            "320px",
            "important"
        );


        bar.style.setProperty(
            "min-width",
            "320px",
            "important"
        );


        bar.style.setProperty(
            "max-width",
            "320px",
            "important"
        );


        bar.style.setProperty(
            "height",
            "58px",
            "important"
        );


        bar.style.setProperty(
            "min-height",
            "58px",
            "important"
        );


        bar.style.setProperty(
            "max-height",
            "58px",
            "important"
        );


        bar.style.setProperty(
            "flex",
            "0 0 320px",
            "important"
        );


        bar.style.setProperty(
            "box-sizing",
            "border-box",
            "important"
        );


        bar.style.setProperty(
            "overflow",
            "hidden",
            "important"
        );


        bar.style.setProperty(
            "contain",
            "layout paint size",
            "important"
        );


        /*
         * Transform ที่นี่มีไว้สำหรับจัดกึ่งกลาง
         * ไม่ขึ้นกับตัวเลขเวลา
         */

        bar.style.setProperty(
            "transform",
            "translateY(-50%)",
            "important"
        );

    }
    else {

        /*
         * คืนค่าให้ CSS เดิมของ Mobile / Tablet
         */

        [
            "position",
            "top",
            "right",
            "width",
            "min-width",
            "max-width",
            "height",
            "min-height",
            "max-height",
            "flex",
            "box-sizing",
            "overflow",
            "contain",
            "transform"
        ].forEach(
            property => {

                bar.style.removeProperty(
                    property
                );

            }
        );

    }

}

/* =========================================================
   RESIZE HANDLER
========================================================= */

function setupRealtimeResize() {

    fixRealtimeBarDesktop();


    window.addEventListener(
        "resize",
        () => {

            fixRealtimeBarDesktop();

        }
    );

}
