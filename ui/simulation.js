/* =========================================================
   Melody Of Life 17 Planner
   ui/simulation.js
   ========================================================= */


/* =========================================================
   SIMULATION VALIDATION
========================================================= */

function validateSimulationInput(
    date,
    time
) {

    /* =====================================================
       DATE
    ===================================================== */

    if (
        !isAllowedDate(
            date
        )
    ) {

        showPopup(
            "วันที่ไม่ถูกต้อง",
            "Simulation เลือกได้เฉพาะวันที่จัดงาน"
        );


        return false;

    }


    /* =====================================================
       TIME
    ===================================================== */

    if (
        !/^\d{2}:\d{2}$/.test(
            time || ""
        )
    ) {

        showPopup(
            "เวลาไม่ถูกต้อง",
            "กรุณาเลือกเวลา 00:00–23:59"
        );


        return false;

    }


    const [
        hour,
        minute
    ] =
        time
            .split(":")
            .map(Number);


    if (
        !Number.isInteger(
            hour
        ) ||

        !Number.isInteger(
            minute
        ) ||

        hour < 0 ||
        hour > 23 ||

        minute < 0 ||
        minute > 59
    ) {

        showPopup(
            "เวลาไม่ถูกต้อง",
            "กรุณาระบุเวลา 00:00–23:59"
        );


        return false;

    }


    return true;

}


/* =========================================================
   APPLY SIMULATION
========================================================= */

function applySimulation() {

    const date =
        $("#simulationDate")?.value ||
        simulationDate;


    const time =
        $("#simulationTime")?.value ||
        simulationTime;


    if (
        !validateSimulationInput(
            date,
            time
        )
    ) {

        return;

    }


    pauseSimulation();


    simulationEnabled =
        true;


    simulationDate =
        date;


    simulationTime =
        time;


    syncSimulationInputs();


    resetRenderSignatures();


    renderApp({

        transition:
            false,

        force:
            true,

        renderFilters:
            false

    });

}


/* =========================================================
   PLAY SIMULATION
========================================================= */

function playSimulation() {

    /* =====================================================
       ENABLE SIMULATION
    ===================================================== */

    if (
        !simulationEnabled
    ) {

        const date =
            $("#simulationDate")?.value ||
            simulationDate;


        const time =
            $("#simulationTime")?.value ||
            simulationTime;


        if (
            !validateSimulationInput(
                date,
                time
            )
        ) {

            return;

        }


        simulationDate =
            date;


        simulationTime =
            time;


        simulationEnabled =
            true;


        syncSimulationInputs();

    }


    /* =====================================================
       ALREADY PLAYING
    ===================================================== */

    if (
        simulationPlaying
    ) {

        return;

    }


    simulationPlaying =
        true;


    updateSimulationButtons();


    startSimulationTimer();


    resetRenderSignatures();


    renderApp({

        transition:
            false,

        force:
            true,

        renderFilters:
            false

    });

}

/* =========================================================
   SIMULATION TIMER
========================================================= */

function startSimulationTimer() {

    stopSimulationTimer();

    simulationTimer =
        window.setInterval(
            () => {

                if (
                    !simulationPlaying
                ) {

                    return;

                }

                /* ---------------------------------------------
                   ADVANCE SIMULATION TIME
                --------------------------------------------- */

                advanceSimulation();


                /* ---------------------------------------------
                   REALTIME UI UPDATE
                   ใช้เส้นทางเดียวกับ Production
                --------------------------------------------- */

                updateRealtimeUI();


                /* ---------------------------------------------
                   SIMULATION PANEL
                --------------------------------------------- */

                updateSimulationDisplay();

            },
            1000
        );

}


/* =========================================================
   STOP SIMULATION TIMER
========================================================= */

function stopSimulationTimer() {

    if (
        simulationTimer !==
        null
    ) {

        window.clearInterval(
            simulationTimer
        );


        simulationTimer =
            null;

    }

}


/* =========================================================
   ADVANCE SIMULATION
========================================================= */

function advanceSimulation() {

    if (
        !simulationEnabled
    ) {

        return;

    }


    const current =
        createBangkokDate(
            simulationDate,
            simulationTime
        );


    if (
        !Number.isFinite(
            current.getTime()
        )
    ) {

        pauseSimulation();

        return;

    }


    /*
     * Simulation speed:
     *
     * 1x   = +1 second
     * 10x  = +10 seconds
     * 60x  = +60 seconds
     * 300x = +300 seconds
     */

    current.setSeconds(
        current.getSeconds() +
        simulationSpeed
    );


    /*
     * Convert the updated Date
     * back to Bangkok date/time.
     */

    const formatter =
        new Intl.DateTimeFormat(
            "en-CA",
            {

                timeZone:
                    TIMEZONE,

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit",

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit",

                hourCycle:
                    "h23"

            }
        );


    const parts =
        formatter.formatToParts(
            current
        );


    const getPart =
        type =>
            parts.find(
                part =>
                    part.type ===
                    type
            )?.value ||
            "";


    const newDate =
        `${getPart("year")}-` +
        `${getPart("month")}-` +
        `${getPart("day")}`;


    const newTime =
        `${getPart("hour")}:` +
        `${getPart("minute")}:` +
        `${getPart("second")}`;


    /* =====================================================
       END OF FESTIVAL
    ===================================================== */

    if (
        !isAllowedDate(
            newDate
        )
    ) {

        const allowedDays =
            getAllowedFestivalDays();


        const lastDay =
            allowedDays[
            allowedDays.length - 1
            ];


        simulationDate =
            lastDay?.dateISO ||
            ALLOWED_DATES[
            ALLOWED_DATES.length - 1
            ] ||
            FESTIVAL.endDate ||
            "2026-10-18";


        simulationTime =
            "23:59:00";


        syncSimulationInputs();


        pauseSimulation();


        resetRenderSignatures();


        renderApp({

            transition:
                false,

            force:
                true,

            renderFilters:
                false

        });


        showPopup(
            "จบช่วง Simulation",
            "Simulation สิ้นสุดหลังวันสุดท้ายของงาน"
        );


        return;

    }


    /* =====================================================
       APPLY NEW TIME
    ===================================================== */

    simulationDate =
        newDate;


    simulationTime =
        newTime;

}


/* =========================================================
   PAUSE
========================================================= */

function pauseSimulation() {

    stopSimulationTimer();


    simulationPlaying =
        false;


    updateSimulationButtons();


    updateSimulationDisplay();

}


/* =========================================================
   RESET
========================================================= */

function resetSimulation() {

    stopSimulationTimer();


    simulationPlaying =
        false;


    simulationEnabled =
        false;


    simulationDate =
        DEFAULT_SIMULATION_DATE;


    simulationTime =
        DEFAULT_SIMULATION_TIME;


    /*
     * simulationSeconds removed.
     *
     * Time is stored only in:
     * simulationDate
     * simulationTime
     */

    syncSimulationInputs();


    updateSimulationButtons();


    resetRenderSignatures();


    renderApp({

        transition:
            false,

        force:
            true,

        renderFilters:
            false

    });

}


/* =========================================================
   DISABLE SIMULATION
========================================================= */

function disableSimulation() {

    pauseSimulation();


    simulationEnabled =
        false;


    resetRenderSignatures();


    renderApp({

        transition:
            false,

        force:
            true,

        renderFilters:
            false

    });

}


/* =========================================================
   SPEED
========================================================= */

function changeSimulationSpeed(
    value
) {

    const speed =
        Number(
            value
        );


    if (
        Number.isFinite(
            speed
        ) &&
        speed > 0
    ) {

        simulationSpeed =
            speed;

    }


    updateSimulationDisplay();

}


/* =========================================================
   INPUT SYNC
========================================================= */

function syncSimulationInputs() {

    const dateInput =
        $("#simulationDate");


    const timeInput =
        $("#simulationTime");


    if (
        dateInput
    ) {

        dateInput.value =
            simulationDate;

    }


    if (
        timeInput
    ) {

        timeInput.value =
            String(
                simulationTime
            ).slice(
                0,
                5
            );

    }

}


/* =========================================================
   SIMULATION BUTTONS
========================================================= */

function updateSimulationButtons() {

    const play =
        $("#playSimulationButton");


    const pause =
        $("#pauseSimulationButton");


    if (
        play
    ) {

        play.disabled =
            simulationPlaying;

    }


    if (
        pause
    ) {

        pause.disabled =
            !simulationPlaying;

    }

}


/* =========================================================
   SIMULATION DISPLAY
========================================================= */

function updateSimulationDisplay() {

    const current =
        $("#simulationCurrent");


    const status =
        $("#simulationStatus");


    const now =
        getCurrentTime();


    if (
        !Number.isFinite(
            now.getTime()
        )
    ) {

        return;

    }


    const formatted =
        new Intl.DateTimeFormat(
            "th-TH",
            {

                timeZone:
                    TIMEZONE,

                dateStyle:
                    "medium",

                timeStyle:
                    "medium"

            }
        ).format(
            now
        );


    if (
        current
    ) {

        current.textContent =

            simulationEnabled

                ? `🧪 เวลาจำลอง: ${formatted}`

                : `🕐 เวลาจริง: ${formatted}`;

    }


    if (
        status
    ) {

        if (
            simulationEnabled
        ) {

            status.textContent =

                simulationPlaying

                    ? `▶ กำลังเล่น ${simulationSpeed}×`

                    : "⏸ หยุดเวลาจำลอง";

        }
        else {

            status.textContent =
                "● ใช้เวลาจริง";

        }

    }

}