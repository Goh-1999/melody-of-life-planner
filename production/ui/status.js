/* =========================================================
   Melody Of Life 17 Planner
   Refactored from legacy script.js
   ========================================================= */

/* =========================================================
   COUNTDOWN HTML
========================================================= */

function getArtistCountdownHTML(
    artist
) {

    const countdown =
        getArtistCountdown(
            artist
        );


    const icon =
        countdown.type === "start"
            ? "⏳"
            : countdown.type === "ending"
                ? "🔥"
                : countdown.type === "live"
                    ? "🎵"
                    : countdown.type === "ended"
                        ? "✓"
                        : "🕐";


    const classes =
        [
            "artist-countdown",
            countdown.type ===
                "start"
                ? "is-urgent"
                : "",
            countdown.type ===
                "ending"
                ? "is-ending"
                : "",
            countdown.type ===
                "ended"
                ? "is-ended"
                : ""
        ]
            .filter(Boolean)
            .join(" ");


    return `
<div
    class="${classes}"
>
    <span>${icon}</span>
    <span>
        ${escapeHTML(
        countdown.text
    )}
    </span>
</div>
`;

}

/* =========================================================
   REALTIME WARNING
========================================================= */

function renderRealtimeWarning() {

    const container =
        $("#realtimeWarning");


    if (
        !container
    ) {

        return;

    }


    if (
        RENDER_STATE.lastRealtimeWarningRendered
    ) {

        return;

    }


    container.innerHTML = `
<div class="realtime-warning-content">

    <span
        class="realtime-warning-icon"
        aria-hidden="true"
    >
        ⚠️
    </span>

    <span
        class="realtime-warning-text"
    >
        ข้อมูลสถานะ LIVE และเวลาแสดงเป็นข้อมูล Realtime
        อาจมีความคลาดเคลื่อนจากเวลาจริงหน้างาน
        กรุณาตรวจสอบข้อมูลล่าสุดจากผู้จัดงานอีกครั้ง
    </span>

</div>
`;


    RENDER_STATE.lastRealtimeWarningRendered =
        true;

}
