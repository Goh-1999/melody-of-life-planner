/* =========================================================
   Melody Of Life 17 Planner
   Production app.js
   ========================================================= */


/* =========================================================
   VALIDATE ARTIST DATA
========================================================= */

function validateArtistData() {

    const artists =
        getAllArtists();

    let valid =
        true;

    const ids =
        new Set();


    if (
        artists.length === 0
    ) {

        console.error(
            "❌ ไม่มี Artist Data"
        );

        return false;

    }


    artists.forEach(
        artist => {

            const id =
                Number(
                    artist.id
                );


            /* =================================================
               ID
            ================================================= */

            if (
                !Number.isSafeInteger(
                    id
                ) ||
                id <= 0
            ) {

                console.error(
                    "❌ Artist ID ไม่ถูกต้อง:",
                    artist
                );

                valid =
                    false;

            }


            if (
                ids.has(
                    id
                )
            ) {

                console.error(
                    "❌ Artist ID ซ้ำ:",
                    artist.id
                );

                valid =
                    false;

            }


            ids.add(
                id
            );


            /* =================================================
               REQUIRED DATA
            ================================================= */

            if (
                !artist.name ||
                !artist.dateISO ||
                !artist.day ||
                !artist.stage ||
                !artist.stageId ||
                !artist.start ||
                !artist.end
            ) {

                console.error(
                    "❌ Artist Data ไม่ครบ:",
                    artist
                );

                valid =
                    false;

            }


            /* =================================================
               DATE
            ================================================= */

            if (
                !isAllowedDate(
                    artist.dateISO
                )
            ) {

                console.error(
                    "❌ Artist ใช้วันที่นอกเทศกาล:",
                    artist
                );

                valid =
                    false;

            }


            /* =================================================
               TIME
            ================================================= */

            const start =
                timeToMinutes(
                    artist.start
                );


            const end =
                timeToMinutes(
                    artist.end
                );


            if (
                !Number.isFinite(
                    start
                ) ||
                !Number.isFinite(
                    end
                ) ||
                end <= start
            ) {

                console.error(
                    "❌ เวลา Artist ไม่ถูกต้อง:",
                    artist
                );

                valid =
                    false;

            }


            /* =================================================
               STAGE ID
            ================================================= */

            const stage =
                getStageById(
                    artist.stageId
                );


            if (
                !stage
            ) {

                console.error(
                    `❌ Artist "${artist.name}" ` +
                    `ใช้ StageID "${artist.stageId}" ` +
                    `ที่ไม่มีใน CONFIG.stages`
                );

                valid =
                    false;

            }

        }
    );


    /* =========================================================
       STAGE CONFIG
    ========================================================= */

    const stages =
        getStages();


    if (
        stages.length === 0
    ) {

        console.error(
            "❌ CONFIG.stages ว่าง"
        );

        valid =
            false;

    }


    stages.forEach(
        stage => {

            if (
                !stage.color
            ) {

                console.error(
                    `❌ Stage ${stage.id} ไม่มีสี`
                );

                valid =
                    false;

            }

        }
    );


    return valid;

}


/* =========================================================
   DEBUG STAGE CONFIG
========================================================= */

function debugStageConfig() {

    console.group(
        "🎨 Stage Color System"
    );


    console.log(
        "Stage Color Source:",
        "CONFIG.stages"
    );


    console.log(
        "Stage Name Source:",
        "Excel.Stage"
    );


    getStages().forEach(
        stage => {

            console.log(
                `Stage ${stage.id} → ${stage.color}`
            );

        }
    );


    console.groupEnd();

}


/* =========================================================
   RESET RENDER SIGNATURES
========================================================= */

function resetRenderSignatures() {

    RENDER_STATE.lastArtistSignature =
        "";

    RENDER_STATE.lastNowPlayingSignature =
        "";

    RENDER_STATE.lastScheduleSignature =
        "";

    RENDER_STATE.lastConflictSignature =
        "";

}


/* =========================================================
   REALTIME AUTO DATE STATE
   ---------------------------------------------------------
   realtimeAutoDate:
   - วันที่ที่ระบบเลือกให้อัตโนมัติ
   - ใช้ป้องกันการบังคับ Day กลับ
     หลังผู้ใช้เลือกวันอื่นเอง
========================================================= */

let realtimeAutoDate =
    null;


/* =========================================================
   INITIAL SELECTED DATE
========================================================= */

function initializeSelectedDate() {

    const festivalStart =
        FESTIVAL.startDate ||
        ALLOWED_DATES[0] ||
        "2026-10-16";


    const festivalEnd =
        FESTIVAL.endDate ||
        ALLOWED_DATES[
        ALLOWED_DATES.length - 1
        ] ||
        "2026-10-18";


    /* =====================================================
       PRODUCTION / REAL TIME
    ===================================================== */

    let currentFestivalDate =
        null;


    if (
        typeof getCurrentFestivalDate ===
        "function"
    ) {

        currentFestivalDate =
            getCurrentFestivalDate();

    }


    if (
        currentFestivalDate &&
        Array.isArray(
            ALLOWED_DATES
        ) &&
        ALLOWED_DATES.includes(
            currentFestivalDate
        )
    ) {

        selectedDate =
            currentFestivalDate;


        realtimeAutoDate =
            currentFestivalDate;


        return;

    }


    /* =====================================================
       SAFETY FALLBACK
    ===================================================== */

    const safeDates =
        Array.isArray(
            ALLOWED_DATES
        )

            ? ALLOWED_DATES.filter(
                Boolean
            )

            : [];


    if (
        safeDates.includes(
            festivalStart
        )
    ) {

        selectedDate =
            festivalStart;


        realtimeAutoDate =
            festivalStart;


        return;

    }


    if (
        safeDates.length > 0
    ) {

        selectedDate =
            safeDates[0];


        realtimeAutoDate =
            safeDates[0];


        return;

    }


    selectedDate =
        festivalEnd;


    realtimeAutoDate =
        festivalEnd;

}


/* =========================================================
   TRANSITION TARGETS
========================================================= */

function getTransitionTargets() {

    const targets =
        [];


    const artistGrid =
        $("#artistGrid");


    const nowPlaying =
        $("#nowPlaying");


    const schedule =
        $("#scheduleBody");


    if (
        artistGrid
    ) {

        targets.push(
            artistGrid
        );

    }


    if (
        nowPlaying
    ) {

        targets.push(
            nowPlaying
        );

    }


    if (
        schedule
    ) {

        const wrapper =
            schedule.closest(
                ".schedule-container, " +
                ".schedule-section, " +
                ".schedule-wrapper, " +
                ".table-container"
            );


        targets.push(
            wrapper ||
            schedule.parentElement ||
            schedule
        );

    }


    return [
        ...new Set(
            targets.filter(
                Boolean
            )
        )
    ];

}


/* =========================================================
   STATIC RENDER
========================================================= */

function renderStaticUI(
    force = false
) {

    if (
        force ||
        !RENDER_STATE.filtersRendered
    ) {

        renderDayFilter();

        renderStageFilter();


        RENDER_STATE.filtersRendered =
            true;

    }


    renderRealtimeWarning();

}


/* =========================================================
   DYNAMIC RENDER
========================================================= */

function renderDynamicUI(
    force = false
) {

    updateClock();


    renderArtists(
        force
    );


    renderNowPlaying(
        force
    );


    renderSchedule(
        force
    );


    renderConflictWarning();

}


/* =========================================================
   MAIN RENDER
========================================================= */

function renderApp(
    options = {}
) {

    const {
        transition = false,
        force = false,
        renderFilters = false
    } = options;


    if (
        renderFilters
    ) {

        RENDER_STATE.filtersRendered =
            false;

    }


    renderStaticUI(
        renderFilters
    );


    renderDynamicUI(
        force
    );


    if (
        transition
    ) {

        requestAnimationFrame(
            () => {

                playActionTransition(
                    getTransitionTargets()
                );

            }
        );

    }


    RENDER_STATE.initialized =
        true;

}


/* =========================================================
   REFRESH ALL
========================================================= */

function refreshAll(
    withTransition = false,
    renderFilters = false
) {

    renderApp({

        transition:
            withTransition,

        force:
            true,

        renderFilters:
            renderFilters

    });

}


/* =========================================================
   REALTIME CLOCK
========================================================= */

function updateRealtimeClockOnly() {

    if (
        typeof updateClock ===
        "function"
    ) {

        updateClock();

    }

}


/* =========================================================
   SYNC FESTIVAL DATE WITH REAL TIME
   ---------------------------------------------------------
   Auto Day:
   - ถ้าผู้ใช้ยังอยู่บนวันที่ที่ระบบ Auto เลือกไว้
     ให้เปลี่ยนตามวันจริง
   - ถ้าผู้ใช้เลือกวันอื่นเอง
     จะไม่บังคับเปลี่ยนกลับ
========================================================= */

function syncRealtimeFestivalDate() {

    if (
        typeof getCurrentFestivalDate !==
        "function"
    ) {

        return false;

    }


    const currentFestivalDate =
        getCurrentFestivalDate();


    if (
        !currentFestivalDate ||
        !Array.isArray(
            ALLOWED_DATES
        ) ||
        !ALLOWED_DATES.includes(
            currentFestivalDate
        )
    ) {

        return false;

    }


    /* =====================================================
       USER SELECTED ANOTHER DAY
       → Do not override it
    ===================================================== */

    if (
        selectedDate !==
        realtimeAutoDate
    ) {

        return false;

    }


    /* =====================================================
       SAME AUTO DATE
       → Nothing to change
    ===================================================== */

    if (
        realtimeAutoDate ===
        currentFestivalDate
    ) {

        return false;

    }


    /* =====================================================
       CHANGE TO CURRENT FESTIVAL DATE
    ===================================================== */

    selectedDate =
        currentFestivalDate;


    realtimeAutoDate =
        currentFestivalDate;


    resetRenderSignatures();


    RENDER_STATE.filtersRendered =
        false;


    return true;

}


/* =========================================================
   REALTIME UPDATE
========================================================= */

function updateRealtimeUI() {

    /* =====================================================
       CLOCK
    ===================================================== */

    updateRealtimeClockOnly();


    /* =====================================================
       ARTIST CARDS
    ===================================================== */

    if (
        typeof updateArtistCardsRealtimeState ===
        "function"
    ) {

        updateArtistCardsRealtimeState();

    }


    /* =====================================================
       NOW PLAYING
    ===================================================== */

    if (
        typeof updateNowPlayingRealtime ===
        "function"
    ) {

        updateNowPlayingRealtime();

    }


    /* =====================================================
       SCHEDULE
    ===================================================== */

    if (
        typeof updateScheduleRealtime ===
        "function"
    ) {

        updateScheduleRealtime();

    }

}


/* =========================================================
   REALTIME LOOP
========================================================= */

let realtimeInterval =
    null;


/* =========================================================
   START REALTIME LOOP
========================================================= */

function startRealtimeLoop() {

    if (
        realtimeInterval !==
        null
    ) {

        return;

    }


    realtimeInterval =
        window.setInterval(
            () => {

                const dateChanged =
                    syncRealtimeFestivalDate();


                if (
                    dateChanged
                ) {

                    renderApp({

                        transition:
                            false,

                        force:
                            true,

                        renderFilters:
                            true

                    });


                    return;

                }


                updateRealtimeUI();

            },
            1000
        );


    console.log(
        "⏱️ Realtime loop started"
    );

}


/* =========================================================
   STOP REALTIME LOOP
========================================================= */

function stopRealtimeLoop() {

    if (
        realtimeInterval ===
        null
    ) {

        return;

    }


    window.clearInterval(
        realtimeInterval
    );


    realtimeInterval =
        null;


    console.log(
        "⏹️ Realtime loop stopped"
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    /* -----------------------------------------------------
       CLEAR SELECTION
    ----------------------------------------------------- */

    $("#clearSelectionButton")
        ?.addEventListener(
            "click",
            event => {

                playButtonPress(
                    event.currentTarget
                );


                clearSelection();

            }
        );


    /* -----------------------------------------------------
       SAVE IMAGE
    ----------------------------------------------------- */

    $("#saveImageButton")
        ?.addEventListener(
            "click",
            saveScheduleAsImage
        );


    /* -----------------------------------------------------
       POPUP
    ----------------------------------------------------- */

    setupPopupEvents();

}


/* =========================================================
   APPLICATION INITIALIZATION
========================================================= */

let appInitialized =
    false;


document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
         * Prevent duplicate initialization
         */

        if (
            appInitialized
        ) {

            return;

        }


        appInitialized =
            true;


        try {

            /* =================================================
               WAIT FOR EXCEL
            ================================================= */

            if (
                !window.artistDataReady
            ) {

                throw new Error(
                    "ไม่พบ window.artistDataReady"
                );

            }


            await window.artistDataReady;


            /* =================================================
               FESTIVAL DATES
            ================================================= */

            if (
                !Array.isArray(
                    ALLOWED_DATES
                ) ||
                ALLOWED_DATES.length ===
                0
            ) {

                ALLOWED_DATES =
                    Array.isArray(
                        festivalDays
                    )

                        ? festivalDays
                            .map(
                                day =>
                                    day?.dateISO
                            )
                            .filter(
                                Boolean
                            )
                            .sort()

                        : [];

            }


            /* =================================================
               ARTISTS
            ================================================= */

            const artists =
                getAllArtists();


            if (
                !Array.isArray(
                    artists
                ) ||
                artists.length ===
                0
            ) {

                throw new Error(
                    "Excel โหลดสำเร็จ แต่ไม่พบ Artist Data"
                );

            }


            /* =================================================
               INITIAL SELECTED DATE
            ================================================= */

            initializeSelectedDate();


            /* =================================================
               RESET STATE
            ================================================= */

            RENDER_STATE.filtersRendered =
                false;


            RENDER_STATE.initialized =
                false;


            resetRenderSignatures();


            /* =================================================
               LOAD SAVED ARTISTS
            ================================================= */

            loadSelectedArtists();


            /* =================================================
               THEME
            ================================================= */

            applyTheme();


            /* =================================================
               TRANSITION
            ================================================= */

            injectTransitionStyles();


            /* =================================================
               REALTIME RESIZE
            ================================================= */

            setupRealtimeResize();


            /* =================================================
               SYSTEM LOG
            ================================================= */

            console.log(
                "🚀 Melody Of Life 17 Planner"
            );


            console.log(
                "Environment:",
                APP_ENV
            );


            console.log(
                "Artists:",
                artists.length
            );


            console.log(
                "Dates:",
                ALLOWED_DATES
            );


            console.log(
                "Selected Date:",
                selectedDate
            );


            console.log(
                "Realtime Auto Date:",
                realtimeAutoDate
            );


            console.log(
                "Stages:",
                getStages()
            );


            /* =================================================
               VALIDATION
            ================================================= */

            const valid =
                validateArtistData();


            console.log(
                valid
                    ? "✅ Artist / Stage validation ผ่าน"
                    : "⚠️ พบปัญหาใน Artist / Stage Data"
            );


            debugStageConfig();


            /* =================================================
               EVENTS
            ================================================= */

            setupEvents();


            /* =================================================
               INITIAL RENDER
            ================================================= */

            renderApp({

                transition:
                    false,

                force:
                    true,

                renderFilters:
                    true

            });


            /* =================================================
               PAGE REFRESH TRANSITION
               ครั้งเดียว
            ================================================= */

            requestAnimationFrame(
                () => {

                    requestAnimationFrame(
                        () => {

                            playPageRefreshTransition();

                        }
                    );

                }
            );


            /* =================================================
               REALTIME LOOP
            ================================================= */

            startRealtimeLoop();


            /* =================================================
               READY
            ================================================= */

            console.log(
                "✅ Melody Of Life 17 Planner พร้อมใช้งาน"
            );

        }
        catch (
        error
        ) {

            console.error(
                "❌ Melody Of Life 17 Planner เริ่มระบบไม่สำเร็จ:",
                error
            );

        }

    }
);