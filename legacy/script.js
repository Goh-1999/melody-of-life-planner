/* =========================================================
   Melody Of Life 17 Planner
   script.js
========================================================= */
/* =========================================================
   CONFIG
========================================================= */
const MOL_CONFIG =
    typeof CONFIG !== "undefined" && CONFIG
        ? CONFIG
        : {};

const MOL_APP_CONFIG =
    typeof APP_CONFIG !== "undefined" && APP_CONFIG
        ? APP_CONFIG
        : {};

const FESTIVAL =
    MOL_CONFIG.festival || {};

const PLANNER =
    MOL_CONFIG.planner || {};

const STORAGE =
    MOL_CONFIG.storage || {};

const TIMEZONE =
    FESTIVAL.timezone ||
    "Asia/Bangkok";

const SIMULATION_CONFIG =
    MOL_APP_CONFIG.SIMULATION || {};

const APP_ENV =
    MOL_APP_CONFIG.ENV ||
    MOL_CONFIG.app?.environment ||
    "development";


/* =========================================================
   FESTIVAL DATES
========================================================= */

let ALLOWED_DATES = [];


/* =========================================================
   DEFAULT SIMULATION
========================================================= */

const DEFAULT_SIMULATION_DATE =
    SIMULATION_CONFIG.date ||
    FESTIVAL.startDate ||
    "2026-10-16";

const DEFAULT_SIMULATION_TIME =
    SIMULATION_CONFIG.time ||
    "20:15";


/* =========================================================
   EXPORT FONT
========================================================= */

const EXPORT_FONT =
    '"IBM Plex Sans Thai", "Noto Sans Thai", Arial, sans-serif';


/* =========================================================
   STATE
========================================================= */

let selectedDate =
    "all";

let selectedStage =
    "all";

let selectedArtistIds =
    [];


/* =========================================================
   SIMULATION STATE
========================================================= */

let simulationEnabled =
    Boolean(
        SIMULATION_CONFIG.enabled
    );

let simulationPlaying =
    false;

let simulationTimer =
    null;

let simulationSpeed =
    1;

let simulationDate =
    DEFAULT_SIMULATION_DATE;

let simulationTime =
    DEFAULT_SIMULATION_TIME;

/* =========================================================
   RENDER STATE
========================================================= */

const RENDER_STATE = {

    initialized:
        false,

    filtersRendered:
        false,

    lastArtistSignature:
        "",

    lastNowPlayingSignature:
        "",

    lastScheduleSignature:
        "",

    lastConflictSignature:
        "",

    lastRealtimeWarningRendered:
        false

};


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
   TRANSITION CONFIG
========================================================= */

const TRANSITION_CLASS =
    "mol-action-transition";

const BUTTON_CLASS =
    "mol-button-press";

const PAGE_CLASS =
    "mol-page-enter";


/* =========================================================
   TRANSITION CSS
========================================================= */

function injectTransitionStyles() {

    if (
        document.getElementById(
            "mol-transition-style"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "mol-transition-style";

    style.textContent = `
.mol-refresh-enter {
    animation:
        molRefreshFadeIn
        .85s
        cubic-bezier(.22,1,.36,1)
        both;

    will-change:
        opacity;
}

@keyframes molRefreshFadeIn {

    0% {
        opacity: 0;
    }

    55% {
        opacity: .72;
    }

    100% {
        opacity: 1;
    }

}

@media (max-width:600px) {

    .mol-refresh-enter {
        animation:
            molRefreshFadeIn
            .75s
            cubic-bezier(.22,1,.36,1)
            both;
    }

}

@media (prefers-reduced-motion:reduce) {

    .mol-refresh-enter {
        animation:
            none !important;
    }

}
`;

    document.head.appendChild(
        style
    );

}

/* =========================================================
   PAGE REFRESH TRANSITION
   Smooth / Professional Festival Refresh
========================================================= */

function playPageRefreshTransition() {

    const targets = [
        $(".header"),
        $(".marquee-wrapper"),
        $(".container"),
        $(".site-footer")
    ].filter(Boolean);


    if (
        targets.length === 0
    ) {

        return;

    }


    targets.forEach(
        element => {

            element.classList.remove(
                "mol-refresh-enter"
            );

            void element.offsetWidth;

        }
    );


    requestAnimationFrame(
        () => {

            targets.forEach(
                element => {

                    element.classList.add(
                        "mol-refresh-enter"
                    );

                }
            );

        }
    );


    window.setTimeout(
        () => {

            targets.forEach(
                element => {

                    element.classList.remove(
                        "mol-refresh-enter"
                    );

                }
            );

        },
        950
    );

}

/* =========================================================
   RESOLVE TRANSITION TARGET
========================================================= */

function resolveTransitionTarget(
    element
) {

    if (
        !element
    ) {

        return null;

    }


    if (
        element.tagName ===
        "TBODY"
    ) {

        return (
            element.closest(
                ".schedule-container, " +
                ".schedule-section, " +
                ".schedule-wrapper, " +
                ".table-container"
            ) ||
            element.parentElement ||
            element
        );

    }


    return element;

}


/* =========================================================
   ACTION TRANSITION
========================================================= */

function playActionTransition(
    targets = []
) {

    if (
        !Array.isArray(
            targets
        )
    ) {

        return;

    }


    const elements =
        targets
            .map(
                element =>
                    resolveTransitionTarget(
                        element
                    )
            )
            .filter(
                element =>
                    element &&
                    element.nodeType === 1
            );


    const uniqueElements =
        [
            ...new Set(
                elements
            )
        ];


    if (
        uniqueElements.length === 0
    ) {

        return;

    }


    uniqueElements.forEach(
        element => {

            element.classList.remove(
                TRANSITION_CLASS
            );


            element.style.removeProperty(
                "animation"
            );

            element.style.removeProperty(
                "opacity"
            );

            element.style.removeProperty(
                "transform"
            );

        }
    );


    uniqueElements.forEach(
        element => {

            void element.offsetWidth;

        }
    );


    requestAnimationFrame(
        () => {

            uniqueElements.forEach(
                element => {

                    element.classList.add(
                        TRANSITION_CLASS
                    );

                }
            );

        }
    );

}


/* =========================================================
   BUTTON PRESS
========================================================= */

function playButtonPress(
    button
) {

    if (
        !button
    ) {

        return;

    }


    button.classList.remove(
        BUTTON_CLASS
    );


    void button.offsetWidth;


    button.classList.add(
        BUTTON_CLASS
    );


    window.setTimeout(
        () => {

            button.classList.remove(
                BUTTON_CLASS
            );

        },
        100
    );

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


    return String(stageId)
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
   STORAGE
========================================================= */

function getStorageKey() {

    return (
        STORAGE.selectedArtists ||
        "mol17_selected_artists"
    );

}


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
                        .map(Number)
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


/* =========================================================
   DATE
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
                ) === Number(
                    id
                )
        ) || null
    );

}


/* =========================================================
   STAGE CONFIG
========================================================= */

function getStageConfig() {

    if (
        !MOL_CONFIG.stages ||
        typeof MOL_CONFIG.stages !==
        "object"
    ) {

        console.error(
            "❌ CONFIG.stages ไม่พบ"
        );

        return {};

    }


    return MOL_CONFIG.stages;

}


function getStages() {

    return Object.entries(
        getStageConfig()
    )
        .map(
            ([id, data]) => {

                const stage =
                    data || {};


                const normalizedId =
                    normalizeStageId(
                        id
                    );


                const color =
                    typeof stage.color ===
                        "string" &&
                        stage.color.trim()
                        ? stage.color.trim()
                        : null;


                return {

                    id:
                        normalizedId,

                    name:
                        stage.name ||
                        `Stage ${normalizedId}`,

                    color

                };

            }
        )
        .filter(
            stage =>
                stage.id
        );

}


function getStageById(
    stageId
) {

    const normalizedId =
        normalizeStageId(
            stageId
        );


    return (
        getStages().find(
            stage =>
                stage.id ===
                normalizedId
        ) || null
    );

}


function getStageColor(
    stageId
) {

    const stage =
        getStageById(
            stageId
        );


    return (
        stage?.color ||
        null
    );

}


function getStageName(
    stageId
) {

    const stage =
        getStageById(
            stageId
        );


    return stage
        ? stage.name
        : `Stage ${normalizeStageId(stageId)}`;

}


/* =========================================================
   STAGE COLOR
========================================================= */

function applyStageColor(
    element,
    stageId,
    options = {}
) {

    if (
        !element
    ) {

        return false;

    }


    const color =
        getStageColor(
            stageId
        );


    if (
        !color
    ) {

        element.removeAttribute(
            "data-stage-color"
        );


        element.style.removeProperty(
            "--stage-color"
        );


        return false;

    }


    element.style.setProperty(
        "--stage-color",
        color
    );


    element.dataset.stageColor =
        normalizeStageId(
            stageId
        );


    if (
        options.color !== false
    ) {

        element.style.setProperty(
            "color",
            color
        );

    }


    if (
        options.background
    ) {

        element.style.setProperty(
            "background-color",
            color
        );

    }


    if (
        options.border !== false
    ) {

        element.style.setProperty(
            "border-color",
            color
        );

    }


    return true;

}


/* =========================================================
   DAY COLOR
========================================================= */

function getDayColor(
    dateISO
) {

    const colors =
        MOL_CONFIG.theme?.dayColors ||
        {};


    const map = {

        "2026-10-16":
            colors.friday ||
            "#3b82f6",

        "2026-10-17":
            colors.saturday ||
            "#8b5cf6",

        "2026-10-18":
            colors.sunday ||
            "#ef4444"

    };


    return (
        map[dateISO] ||
        MOL_CONFIG.theme?.primary ||
        "#77b813"
    );

}


/* =========================================================
   BUTTON COLOR
========================================================= */

function setButtonColor(
    button,
    color,
    active = false
) {

    if (
        !button ||
        !color
    ) {

        return;

    }


    button.style.setProperty(
        "--button-color",
        color
    );


    button.style.setProperty(
        "--day-color",
        color
    );


    button.style.setProperty(
        "border-color",
        color,
        "important"
    );


    button.style.setProperty(
        "font-weight",
        "700",
        "important"
    );


    if (
        active
    ) {

        button.style.setProperty(
            "background-color",
            color,
            "important"
        );


        button.style.setProperty(
            "border-color",
            color,
            "important"
        );


        button.style.setProperty(
            "color",
            "#ffffff",
            "important"
        );


        button.style.setProperty(
            "box-shadow",
            `0 0 0 2px ${color}, 0 8px 20px rgba(0,0,0,.25)`,
            "important"
        );

    }
    else {

        button.style.setProperty(
            "background-color",
            "var(--surface-2)",
            "important"
        );


        button.style.setProperty(
            "color",
            color,
            "important"
        );


        button.style.removeProperty(
            "box-shadow"
        );

    }


    button.classList.toggle(
        "is-active",
        active
    );


    button.classList.toggle(
        "active",
        active
    );


    button.setAttribute(
        "aria-pressed",
        active
            ? "true"
            : "false"
    );

}


/* =========================================================
   FILTER
========================================================= */

function getFilteredArtists(
    artists = getAllArtists()
) {

    return artists.filter(
        artist => {

            const dayMatch =
                selectedDate === "all" ||
                artist.dateISO ===
                selectedDate;


            const stageMatch =
                selectedStage === "all" ||
                normalizeStageId(
                    artist.stage
                ) ===
                normalizeStageId(
                    selectedStage
                );


            return (
                dayMatch &&
                stageMatch
            );

        }
    );

}


/* =========================================================
   DAY FILTER
========================================================= */

function renderDayFilter() {

    const container =
        $("#dayFilter");


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    const fragment =
        document.createDocumentFragment();


    const createButton =
        (
            text,
            date,
            color
        ) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "day-button";


            const isActive =
                selectedDate ===
                date;


            button.textContent =
                text;


            button.dataset.date =
                date;


            button.dataset.day =
                text
                    .split(" ")[0] ||
                "";


            setButtonColor(
                button,
                color,
                isActive
            );


            button.addEventListener(
                "click",
                () => {

                    if (
                        selectedDate ===
                        date
                    ) {

                        return;

                    }


                    playButtonPress(
                        button
                    );


                    selectedDate =
                        date;


                    refreshAll(
                        true
                    );

                }
            );


            return button;

        };


    fragment.appendChild(
        createButton(
            "ทั้งหมด",
            "all",
            getDayColor("")
        )
    );


    getAllowedFestivalDays()
        .forEach(
            day => {

                let color;


                switch (
                day.day
                ) {

                    case "ศุกร์":
                        color =
                            THEME?.days?.friday?.color ||
                            getDayColor(
                                day.dateISO
                            );
                        break;

                    case "เสาร์":
                        color =
                            THEME?.days?.saturday?.color ||
                            getDayColor(
                                day.dateISO
                            );
                        break;

                    case "อาทิตย์":
                        color =
                            THEME?.days?.sunday?.color ||
                            getDayColor(
                                day.dateISO
                            );
                        break;

                    default:
                        color =
                            getDayColor(
                                day.dateISO
                            );

                }


                fragment.appendChild(
                    createButton(
                        `${day.day || ""} ${day.date || ""}`,
                        day.dateISO,
                        color
                    )
                );

            }
        );


    container.appendChild(
        fragment
    );


    RENDER_STATE.filtersRendered =
        true;

}


/* =========================================================
   STAGE FILTER
========================================================= */

function renderStageFilter() {

    const container =
        $("#stageFilter");


    if (
        !container
    ) {

        return;

    }


    container.innerHTML =
        "";


    const primary =
        MOL_CONFIG.theme?.primary ||
        "#77b813";


    const fragment =
        document.createDocumentFragment();


    const createButton = (
        text,
        stageId,
        color
    ) => {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "stage-button";


        const active =
            normalizeStageId(
                selectedStage
            ) ===
            normalizeStageId(
                stageId
            );


        button.textContent =
            text;


        button.dataset.stage =
            stageId;


        setButtonColor(
            button,
            color,
            active
        );


        button.addEventListener(
            "click",
            () => {

                if (
                    normalizeStageId(
                        selectedStage
                    ) ===
                    normalizeStageId(
                        stageId
                    )
                ) {

                    return;

                }


                playButtonPress(
                    button
                );


                selectedStage =
                    stageId;


                refreshAll(
                    true
                );

            }
        );


        return button;

    };


    fragment.appendChild(
        createButton(
            "ทั้งหมด",
            "all",
            primary
        )
    );


    getStages()
        .forEach(
            stage => {

                fragment.appendChild(
                    createButton(
                        stage.name,
                        stage.id,
                        stage.color ||
                        primary
                    )
                );

            }
        );


    container.appendChild(
        fragment
    );


    RENDER_STATE.filtersRendered =
        true;

}


/* =========================================================
   TIME
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

        return new Date(NaN);

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
        !Number.isInteger(hour) ||
        !Number.isInteger(minute) ||
        !Number.isInteger(second) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59 ||
        second < 0 ||
        second > 59
    ) {

        return new Date(NaN);

    }


    return new Date(
        `${date}T` +
        `${String(hour).padStart(2, "0")}:` +
        `${String(minute).padStart(2, "0")}:` +
        `${String(second).padStart(2, "0")}` +
        `+07:00`
    );

}

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

        return new Date(NaN);

    }


    return createBangkokDate(
        artist.dateISO,
        time
    );

}


/* =========================================================
   STATUS
========================================================= */

function getArtistStatus(
    artist
) {

    const now =
        getCurrentTime();


    const start =
        getArtistDateTime(
            artist,
            artist.start
        );


    const end =
        getArtistDateTime(
            artist,
            artist.end
        );


    if (
        !Number.isFinite(
            start.getTime()
        ) ||
        !Number.isFinite(
            end.getTime()
        )
    ) {

        return "ENDED";

    }


    if (
        end <= start
    ) {

        return "ENDED";

    }


    if (
        now >= start &&
        now < end
    ) {

        return "LIVE";

    }


    if (
        now < start
    ) {

        return "NEXT";

    }


    return "ENDED";

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
            artist.start
        );


    const end =
        getArtistDateTime(
            artist,
            artist.end
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
   COUNTDOWN
========================================================= */

function formatCountdown(
    totalSeconds
) {

    const safe =
        Math.max(
            0,
            Math.floor(
                Number(totalSeconds) || 0
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


function getArtistCountdown(
    artist
) {

    const now =
        getCurrentTime();


    const start =
        getArtistDateTime(
            artist,
            artist.start
        );


    const end =
        getArtistDateTime(
            artist,
            artist.end
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
            type: "ended",
            seconds: 0,
            text: ""
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


    /*
     * ก่อนเริ่ม 5 นาที
     */

    if (
        toStart > 0 &&
        toStart <= 300
    ) {

        return {
            type: "start",
            seconds: toStart,
            text:
                `เริ่มใน ${formatCountdown(
                    toStart
                )}`
        };

    }


    /*
     * กำลังแสดง
     */

    if (
        now >= start &&
        now < end
    ) {

        /*
         * เหลือ 5 นาทีสุดท้าย
         */

        if (
            toEnd > 0 &&
            toEnd <= 300
        ) {

            return {
                type: "ending",
                seconds: toEnd,
                text:
                    `จบใน ${formatCountdown(
                        toEnd
                    )}`
            };

        }


        return {
            type: "live",
            seconds: toEnd,
            text: "กำลังแสดง"
        };

    }


    if (
        now >= end
    ) {

        return {
            type: "ended",
            seconds: 0,
            text: "การแสดงจบแล้ว"
        };

    }


    return {
        type: "waiting",
        seconds: toStart,
        text: `เริ่มเวลา ${artist.start}`
    };

}


function getStatusHTML(
    artist
) {

    const status =
        getArtistStatus(
            artist
        );


    const countdown =
        getArtistCountdown(
            artist
        );


    const urgent =
        countdown.type ===
        "start" ||
        countdown.type ===
        "ending";


    if (
        status ===
        "LIVE"
    ) {

        return `
<span class="status-live">
    <span
        class="live-dot live-blink"
        aria-hidden="true"
    ></span>
    LIVE
</span>
`;

    }


    if (
        status ===
        "NEXT"
    ) {

        return `
<span class="status-next ${urgent
                ? "is-urgent"
                : ""
            }">
    🟡 NEXT
</span>
`;

    }


    return `
<span class="status-ended">
    ⚪ ENDED
</span>
`;

}


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
   ARTIST SIGNATURE
========================================================= */

function createArtistSignature(
    artists
) {

    return artists
        .map(
            artist =>
                [
                    artist.id,
                    artist.dateISO,
                    artist.start,
                    artist.end,
                    getArtistStatus(
                        artist
                    ),

                    selectedArtistIds.includes(
                        Number(
                            artist.id
                        )
                    )
                ].join(":")
        )
        .join("|");

}


/* =========================================================
   ARTIST GRID
========================================================= */

function renderArtists(
    force = false
) {

    const container =
        $("#artistGrid");


    if (
        !container
    ) {

        return;

    }


    const artists =
        getFilteredArtists();


    const signature =
        createArtistSignature(
            artists
        );


    if (
        !force &&
        signature ===
        RENDER_STATE.lastArtistSignature
    ) {

        return;

    }


    RENDER_STATE.lastArtistSignature =
        signature;


    container.innerHTML =
        "";


    if (
        artists.length === 0
    ) {

        container.innerHTML = `
<div class="empty-state">
    ไม่มีศิลปินตามตัวกรอง
</div>
`;

        return;

    }


    const fragment =
        document.createDocumentFragment();


    artists.forEach(
        artist => {

            const artistId =
                Number(
                    artist.id
                );


            const selected =
                selectedArtistIds.includes(
                    artistId
                );


            const status =
                getArtistStatus(
                    artist
                );


            const progress =
                getProgressPercent(
                    artist
                );


            const stageId =
                normalizeStageId(
                    artist.stage
                );


            const stageColor =
                getStageColor(
                    stageId
                );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                [
                    "artist-card",

                    selected
                        ? "is-selected"
                        : "",

                    status ===
                        "LIVE"
                        ? "is-live"
                        : "",

                    status ===
                        "ENDED"
                        ? "is-ended"
                        : ""

                ]
                    .filter(Boolean)
                    .join(" ");


            if (
                stageColor
            ) {

                card.style.setProperty(
                    "--stage-color",
                    stageColor
                );


                card.dataset.stageColor =
                    stageId;

            }


            card.innerHTML = `
<div class="artist-card-top">

    <span class="artist-stage">
        ${escapeHTML(
                getStageName(
                    stageId
                )
            )}
    </span>

    ${getStatusHTML(
                artist
            )}

</div>

<h3 class="artist-name-full">
    ${escapeHTML(
                artist.name
            )}
</h3>

<p class="artist-info">
    ${escapeHTML(
                artist.day
            )}
    ${escapeHTML(
                artist.date
            )}
</p>

<p class="artist-info">
    🕐
    ${escapeHTML(
                artist.start
            )}
    -
    ${escapeHTML(
                artist.end
            )}
</p>

${getArtistCountdownHTML(
                artist
            )}

<div
    class="progress"
    aria-label="Progress"
>
    <div
        class="progress-bar"
        style="width:${progress}%"
    ></div>
</div>

<button
    type="button"
    class="artist-select-button ${selected
                    ? "is-selected"
                    : ""
                } ${status === "ENDED"
                    ? "is-ended"
                    : ""
                }"
    data-id="${artistId}"
>
    ${selected
                    ? "✓ เลือกแล้ว"
                    : status === "ENDED"
                        ? "การแสดงจบแล้ว"
                        : "เลือกศิลปิน"
                }
</button>
`;


            applyStageColor(
                card.querySelector(
                    ".artist-stage"
                ),
                stageId,
                {
                    color: true,
                    border: true
                }
            );


            const selectButton =
                card.querySelector(
                    ".artist-select-button"
                );


            selectButton?.addEventListener(
                "click",
                event => {

                    playButtonPress(
                        event.currentTarget
                    );


                    toggleArtist(
                        artistId
                    );

                }
            );


            fragment.appendChild(
                card
            );

        }
    );


    container.appendChild(
        fragment
    );

}

/* =========================================================
   UPDATE ARTIST CARD LIVE STATE
   อัปเดตเฉพาะ Status / Countdown / Progress
   ไม่สร้าง Card ใหม่
========================================================= */

function updateArtistCardsRealtimeState() {

    const container =
        $("#artistGrid");


    if (
        !container
    ) {

        return;

    }


    const artists =
        getFilteredArtists();


    artists.forEach(
        artist => {

            const artistId =
                Number(
                    artist.id
                );


            const card =
                container.querySelector(
                    `.artist-card .artist-select-button[data-id="${artistId}"]`
                )?.closest(
                    ".artist-card"
                );


            if (
                !card
            ) {

                return;

            }


            const status =
                getArtistStatus(
                    artist
                );


            const progress =
                getProgressPercent(
                    artist
                );


            const countdown =
                getArtistCountdown(
                    artist
                );


            /*
             * Status
             */

            const statusWrapper =
                card.querySelector(
                    ".artist-card-top"
                );


            if (
                statusWrapper
            ) {

                const currentStatus =
                    statusWrapper.querySelector(
                        ".status-live, " +
                        ".status-next, " +
                        ".status-ended"
                    );


                const nextHTML =
                    getStatusHTML(
                        artist
                    );


                if (
                    currentStatus &&
                    currentStatus.outerHTML !==
                    nextHTML.trim()
                ) {

                    currentStatus.outerHTML =
                        nextHTML.trim();

                }

                else if (
                    !currentStatus
                ) {

                    statusWrapper.insertAdjacentHTML(
                        "beforeend",
                        nextHTML
                    );

                }

            }


            /*
             * Card state
             */

            card.classList.toggle(
                "is-live",
                status === "LIVE"
            );


            card.classList.toggle(
                "is-ended",
                status === "ENDED"
            );


            /*
             * Countdown
             */

            const countdownElement =
                card.querySelector(
                    ".artist-countdown"
                );


            if (
                countdownElement
            ) {

                const newCountdown =
                    getArtistCountdownHTML(
                        artist
                    );


                countdownElement.outerHTML =
                    newCountdown.trim();

            }


            /*
             * Progress
             */

            const progressBar =
                card.querySelector(
                    ".progress-bar"
                );


            if (
                progressBar
            ) {

                progressBar.style.width =
                    `${progress}%`;

            }


            /*
             * Select Button
             */

            const selectButton =
                card.querySelector(
                    ".artist-select-button"
                );


            if (
                selectButton
            ) {

                selectButton.classList.toggle(
                    "is-ended",
                    status === "ENDED"
                );


                selectButton.textContent =
                    selectedArtistIds.includes(
                        artistId
                    )
                        ? "✓ เลือกแล้ว"
                        : status === "ENDED"
                            ? "การแสดงจบแล้ว"
                            : "เลือกศิลปิน";

            }

        }
    );

}

/* =========================================================
   TOGGLE ARTIST
========================================================= */

function toggleArtist(
    id
) {

    const artistId =
        Number(id);


    if (
        !Number.isFinite(
            artistId
        )
    ) {

        return;

    }


    const index =
        selectedArtistIds.indexOf(
            artistId
        );


    if (
        index >= 0
    ) {

        selectedArtistIds.splice(
            index,
            1
        );

    }
    else {

        selectedArtistIds.push(
            artistId
        );

    }


    saveSelectedArtists();


    refreshAll(
        true
    );

}


/* =========================================================
   SELECTED ARTISTS
========================================================= */

function getSelectedArtists() {

    return getAllArtists().filter(
        artist =>
            selectedArtistIds.includes(
                Number(
                    artist.id
                )
            )
    );

}


/* =========================================================
   CLEAR
========================================================= */

function clearSelection() {

    if (
        selectedArtistIds.length === 0
    ) {

        showPopup(
            "ยังไม่ได้เลือกศิลปิน",
            "ตอนนี้ยังไม่มีศิลปินที่เลือกไว้"
        );


        return;

    }


    selectedArtistIds =
        [];


    saveSelectedArtists();


    refreshAll(
        true
    );

}


/* =========================================================
   NOW PLAYING
========================================================= */

function getNextArtist(
    artists
) {

    return artists
        .filter(
            artist =>
                getArtistStatus(
                    artist
                ) ===
                "NEXT"
        )
        .sort(
            (a, b) =>
                getArtistDateTime(
                    a,
                    a.start
                ) -
                getArtistDateTime(
                    b,
                    b.start
                )
        )[0] ||
        null;

}


function createNowPlayingSignature() {

    return getStages()
        .map(
            stage => {

                const artists =
                    getAllArtists()
                        .filter(
                            artist =>
                                normalizeStageId(
                                    artist.stage
                                ) ===
                                stage.id
                        );


                return [
                    stage.id,
                    selectedDate,
                    selectedStage,

                    ...artists.map(
                        artist =>
                            [
                                artist.id,
                                getArtistStatus(
                                    artist
                                ),
                                Math.round(
                                    getProgressPercent(
                                        artist
                                    )
                                ),
                                getArtistCountdown(
                                    artist
                                ).type
                            ].join(":")
                    )

                ].join("|");

            }
        )
        .join("||");

}


function renderNowPlaying(
    force = false
) {

    const container =
        $("#nowPlaying");


    if (
        !container
    ) {

        return;

    }


    if (
        PLANNER.enableNowPlaying ===
        false
    ) {

        container.innerHTML =
            "";

        return;

    }


    const signature =
        createNowPlayingSignature();


    if (
        !force &&
        signature ===
        RENDER_STATE.lastNowPlayingSignature
    ) {

        return;

    }


    RENDER_STATE.lastNowPlayingSignature =
        signature;


    container.innerHTML =
        "";


    getStages().forEach(
        stage => {

            renderStageNowCard(
                container,
                stage.id
            );

        }
    );

}


function renderStageNowCard(
    container,
    stageId
) {

    const normalized =
        normalizeStageId(
            stageId
        );


    let artists =
        getAllArtists().filter(
            artist =>
                normalizeStageId(
                    artist.stage
                ) ===
                normalized
        );


    if (
        selectedDate !==
        "all"
    ) {

        artists =
            artists.filter(
                artist =>
                    artist.dateISO ===
                    selectedDate
            );

    }


    if (
        selectedStage !==
        "all" &&
        normalizeStageId(
            selectedStage
        ) !==
        normalized
    ) {

        return;

    }


    const live =
        artists.find(
            artist =>
                getArtistStatus(
                    artist
                ) ===
                "LIVE"
        ) ||
        null;


    const next =
        getNextArtist(
            artists
        );


    const current =
        live ||
        next;


    const color =
        getStageColor(
            normalized
        );


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "stage-now-card";


    if (
        color
    ) {

        card.style.setProperty(
            "--stage-color",
            color
        );


        card.dataset.stageColor =
            normalized;

    }


    const stateHTML =
        live

            ? `
<span class="state-live">
    <span
        class="live-dot live-blink"
    ></span>
    LIVE
</span>
`

            : next
                ? `
<span class="state-next ${getArtistCountdown(
                    next
                ).type === "start"
                    ? "is-urgent"
                    : ""
                }">
    🟡 NEXT
</span>
`

                : `
<span class="state-ended">
    ⚪ END
</span>
`;


    const artistName =
        current
            ? escapeHTML(
                current.name
            )
            : "—";


    const artistTime =
        current

            ? `${escapeHTML(
                current.start
            )} - ${escapeHTML(
                current.end
            )}`

            : "ไม่มีศิลปินกำลังแสดง";


    const countdown =
        current
            ? getArtistCountdown(
                current
            )
            : null;


    const countdownHTML =
        countdown &&
            countdown.text

            ? `
<div class="now-countdown ${countdown.type ===
                "ending"
                ? "is-ending"
                : ""
            }">
    ${escapeHTML(
                countdown.text
            )}
</div>
`

            : "";


    let progressHTML =
        "";


    if (
        live
    ) {

        const progress =
            getProgressPercent(
                live
            );


        progressHTML = `
<div class="now-progress">

    <div
        class="now-progress-bar"
        style="width:${progress}%"
    ></div>

</div>
`;

    }


    card.innerHTML = `
<div class="stage-now-header">

    <div class="stage-now-name">

        🎤

        <span
            class="stage-now-stage-name"
        >
            ${escapeHTML(
        getStageName(
            normalized
        )
    )}
        </span>

    </div>

    <div class="stage-now-state">

        ${stateHTML}

    </div>

</div>

<div class="stage-now-content">

    <div class="now-artist">
        ${artistName}
    </div>

    <div class="now-time">
        ${artistTime}
    </div>

    ${countdownHTML}

</div>

${progressHTML}
`;


    applyStageColor(
        card.querySelector(
            ".stage-now-stage-name"
        ),
        normalized,
        {
            color: true,
            border: false
        }
    );


    container.appendChild(
        card
    );

}


/* =========================================================
   SCHEDULE SIGNATURE
========================================================= */

function createScheduleSignature(
    artists
) {

    return artists
        .map(
            artist =>
                [
                    artist.id,
                    artist.dateISO,
                    artist.start,
                    artist.end,
                    getArtistStatus(
                        artist
                    ),
                    Math.round(
                        getProgressPercent(
                            artist
                        )
                    )
                ].join(":")
        )
        .join("|");

}


/* =========================================================
   SCHEDULE
========================================================= */

function getScheduleDayColor(
    dateISO
) {

    return getDayColor(
        dateISO
    );

}


function renderSchedule(
    force = false
) {

    const body =
        $("#scheduleBody");


    if (
        !body
    ) {

        return;

    }


    const artists =
        getFilteredArtists(
            getSelectedArtists()
        ).sort(
            (a, b) =>
                a.dateISO.localeCompare(
                    b.dateISO
                ) ||
                timeToMinutes(
                    a.start
                ) -
                timeToMinutes(
                    b.start
                )
        );


    const signature =
        createScheduleSignature(
            artists
        );


    if (
        !force &&
        signature ===
        RENDER_STATE.lastScheduleSignature
    ) {

        updateSelectionMessage();

        return;

    }


    RENDER_STATE.lastScheduleSignature =
        signature;


    body.innerHTML =
        "";


    if (
        artists.length === 0
    ) {

        body.innerHTML = `
<tr>
    <td
        colspan="6"
        class="empty-table"
    >
        ยังไม่ได้เลือกศิลปิน
    </td>
</tr>
`;

        updateSelectionMessage();

        return;

    }


    const fragment =
        document.createDocumentFragment();


    artists.forEach(
        artist => {

            const stageId =
                normalizeStageId(
                    artist.stage
                );


            const row =
                document.createElement(
                    "tr"
                );


            const dayColor =
                getScheduleDayColor(
                    artist.dateISO
                );


            row.innerHTML = `
<td
    class="schedule-day-cell"
    style="--day-color:${dayColor}"
>
    <span class="schedule-day-name">
        ${escapeHTML(
                artist.day
            )}
    </span>

    <span class="schedule-day-date">
        ${escapeHTML(
                artist.date
            )}
    </span>
</td>

<td>
    ${escapeHTML(
                artist.start
            )}
    -
    ${escapeHTML(
                artist.end
            )}
</td>

<td>
    <strong
        class="schedule-artist-name"
    >
        ${escapeHTML(
                artist.name
            )}
    </strong>
</td>

<td>
    <span
        class="schedule-stage"
    >
        ${escapeHTML(
                getStageName(
                    stageId
                )
            )}
    </span>
</td>

<td>
    ${getStatusHTML(
                artist
            )}
</td>

<td>

    <div class="progress">

        <div
            class="progress-bar"
            style="width:${getProgressPercent(
                artist
            )}%"
        ></div>

    </div>

</td>
`;


            applyStageColor(
                row.querySelector(
                    ".schedule-stage"
                ),
                stageId,
                {
                    color: true,
                    border: false
                }
            );


            fragment.appendChild(
                row
            );

        }
    );


    body.appendChild(
        fragment
    );


    updateSelectionMessage();

}


/* =========================================================
   SELECTION MESSAGE
========================================================= */

function updateSelectionMessage() {

    const message =
        $("#selectionMessage");


    if (
        !message
    ) {

        return;

    }


    const count =
        getFilteredArtists(
            getSelectedArtists()
        ).length;


    message.textContent =
        count > 0
            ? `เลือกแล้ว ${count} ศิลปิน`
            : "ยังไม่ได้เลือกศิลปิน";

}


/* =========================================================
   CONFLICT
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


    const conflicts =
        [];


    for (
        let i = 0;
        i < artists.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < artists.length;
            j++
        ) {

            const first =
                artists[i];


            const second =
                artists[j];


            if (
                first.dateISO !==
                second.dateISO
            ) {

                continue;

            }


            const firstStart =
                timeToMinutes(
                    first.start
                );


            const firstEnd =
                timeToMinutes(
                    first.end
                );


            const secondStart =
                timeToMinutes(
                    second.start
                );


            const secondEnd =
                timeToMinutes(
                    second.end
                );


            if (
                Number.isFinite(
                    firstStart
                ) &&
                Number.isFinite(
                    firstEnd
                ) &&
                Number.isFinite(
                    secondStart
                ) &&
                Number.isFinite(
                    secondEnd
                ) &&
                firstStart < secondEnd &&
                secondStart < firstEnd
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
        conflicts
            .map(
                conflict =>
                    `${conflict.first.id}-${conflict.second.id}`
            )
            .join("|");


    if (
        signature ===
        RENDER_STATE.lastConflictSignature
    ) {

        return;

    }


    RENDER_STATE.lastConflictSignature =
        signature;


    if (
        conflicts.length === 0
    ) {

        element.hidden =
            true;

        element.textContent =
            "";

        return;

    }


    const conflict =
        conflicts[0];


    element.textContent =
        `⚠️ เวลาแสดงชนกัน: ${conflict.first.name} × ${conflict.second.name}`;


    element.hidden =
        false;

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


    if (
        phaseIcon
    ) {

        phaseIcon.textContent =
            isDay
                ? "☀️"
                : "🌙";

    }


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


/* =========================================================
   SIMULATION VALIDATION
========================================================= */

function validateSimulationInput(
    date,
    time
) {

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


    refreshAll(
        false
    );

}


/* =========================================================
   PLAY SIMULATION
========================================================= */

function playSimulation() {

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


    if (
        simulationPlaying
    ) {

        return;

    }


    simulationPlaying =
        true;


    startSimulationTimer();


    resetRenderSignatures();


    refreshAll(
        false
    );

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


                advanceSimulation();


                refreshAll(
                    false
                );

            },
            1000
        );

}


function stopSimulationTimer() {

    if (
        simulationTimer !==
        null
    ) {

        clearInterval(
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
     * เดินเวลาตาม Simulation Speed
     *
     * 1x   = +1 วินาที
     * 5x   = +5 วินาที
     * 10x  = +10 วินาที
     * 30x  = +30 วินาที
     * 60x  = +60 วินาที
     * 300x = +300 วินาที
     */
    current.setSeconds(
        current.getSeconds() +
        simulationSpeed
    );


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


    if (
        !isAllowedDate(
            newDate
        )
    ) {

        const allowedDays =
            getAllowedFestivalDays();


        simulationDate =
            allowedDays.length > 0
                ? allowedDays[
                    allowedDays.length - 1
                ].dateISO
                : (
                    ALLOWED_DATES[
                    ALLOWED_DATES.length - 1
                    ] ||
                    FESTIVAL.endDate ||
                    "2026-10-18"
                );


        simulationTime =
            "23:59:00";


        syncSimulationInputs();

        pauseSimulation();

        resetRenderSignatures();

        refreshAll(false);

        showPopup(
            "จบช่วง Simulation",
            "Simulation สิ้นสุดหลังวันสุดท้ายของงาน"
        );

        return;

    }


    simulationDate =
        newDate;


    simulationTime =
        newTime;


    /*
     * สำคัญ:
     * Render ทันทีหลังเวลา Simulation เปลี่ยน
     * Countdown / Progress / Status
     * จะคำนวณจาก getCurrentTime() ตัวใหม่
     */
    resetRenderSignatures();

}

/* =========================================================
   PAUSE
========================================================= */

function pauseSimulation() {

    stopSimulationTimer();


    simulationPlaying =
        false;


    updateSimulationButtons();

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

    simulationSeconds =
        0;

    syncSimulationInputs();


    updateSimulationButtons();


    resetRenderSignatures();


    refreshAll(
        false
    );

}


/* =========================================================
   DISABLE
========================================================= */

function disableSimulation() {

    pauseSimulation();


    simulationEnabled =
        false;


    resetRenderSignatures();


    refreshAll(
        false
    );

}


/* =========================================================
   SPEED
========================================================= */

function changeSimulationSpeed(
    value
) {

    const speed =
        Number(value);


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
        ).format(now);


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


/* =========================================================
   CANVAS / TIME HELPERS
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


    const parts =
        time.split(":");


    if (
        parts.length !==
        2
    ) {

        return NaN;

    }


    const hour =
        Number(
            parts[0]
        );


    const minute =
        Number(
            parts[1]
        );


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

        return NaN;

    }


    return (
        hour * 60 +
        minute
    );

}


function setCanvasFont(
    context,
    weight,
    size
) {

    context.font =
        `${weight} ${size}px ${EXPORT_FONT}`;

}


function fitCanvasText(
    context,
    text,
    maxWidth,
    startSize = 24,
    minSize = 14,
    weight = 400
) {

    let size =
        startSize;


    const safeText =
        String(
            text ?? ""
        );


    while (
        size > minSize
    ) {

        setCanvasFont(
            context,
            weight,
            size
        );


        if (
            context.measureText(
                safeText
            ).width <=
            maxWidth
        ) {

            break;

        }


        size--;

    }


    setCanvasFont(
        context,
        weight,
        size
    );


    return size;

}


function drawFittedText(
    context,
    text,
    x,
    y,
    maxWidth,
    options = {}
) {

    const weight =
        options.weight ??
        400;


    const startSize =
        options.size ??
        24;


    const minSize =
        options.minSize ??
        14;


    fitCanvasText(
        context,
        text,
        maxWidth,
        startSize,
        minSize,
        weight
    );


    context.fillText(
        String(
            text ?? ""
        ),
        x,
        y
    );

}


/* =========================================================
   SAVE IMAGE
========================================================= */

async function saveScheduleAsImage() {

    const button =
        $("#saveImageButton");


    playButtonPress(
        button
    );


    if (
        PLANNER.enableSaveImage ===
        false
    ) {

        return;

    }


    const selected =
        getFilteredArtists(
            getSelectedArtists()
        );


    if (
        selected.length === 0
    ) {

        showPopup(
            "ยังไม่ได้เลือกศิลปิน",
            "กรุณาเลือกศิลปินอย่างน้อย 1 คนก่อนบันทึกตาราง"
        );


        return;

    }


    /*
     * ใช้ Popup เลือกรูปแบบการบันทึก
     */

    showSaveChoicePopup(
        selected
    );

}


/* =========================================================
   SAVE CHOICE
========================================================= */

function showSaveChoicePopup(
    selected
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

        /*
         * fallback
         */

        saveScheduleImageBundle(
            selected
        );

        return;

    }


    titleElement.textContent =
        "บันทึกตาราง";


    messageElement.innerHTML = `
<div class="save-choice-grid">

    <button
        type="button"
        class="save-choice-button primary"
        data-save-mode="all"
    >
        🖼️ เลือกทั้งหมด
        <br>
        <small>
            รวมทุกวันเป็น 1 ไฟล์
        </small>
    </button>

    <button
        type="button"
        class="save-choice-button secondary"
        data-save-mode="days"
    >
        📅 แยกตามวัน
        <br>
        <small>
            3 ไฟล์ ศุกร์ / เสาร์ / อาทิตย์
        </small>
    </button>

</div>

<button
    type="button"
    id="saveChoiceClose"
    class="save-choice-close"
>
    ยกเลิก
</button>
`;


    overlay.hidden =
        false;


    document.body.classList.add(
        "popup-open"
    );


    const allButton =
        messageElement.querySelector(
            '[data-save-mode="all"]'
        );


    const daysButton =
        messageElement.querySelector(
            '[data-save-mode="days"]'
        );


    const closeButton =
        messageElement.querySelector(
            "#saveChoiceClose"
        );


    allButton?.addEventListener(
        "click",
        event => {

            playButtonPress(
                event.currentTarget
            );


            closePopup();


            saveScheduleImageBundle(
                selected,
                "all"
            );

        }
    );


    daysButton?.addEventListener(
        "click",
        event => {

            playButtonPress(
                event.currentTarget
            );


            closePopup();


            saveScheduleImageBundle(
                selected,
                "days"
            );

        }
    );


    closeButton?.addEventListener(
        "click",
        closePopup
    );

}


/* =========================================================
   SAVE IMAGE BUNDLE
========================================================= */

async function saveScheduleImageBundle(
    selected,
    mode = "all"
) {

    const sorted =
        [...selected].sort(
            (a, b) =>
                a.dateISO.localeCompare(
                    b.dateISO
                ) ||
                timeToMinutes(
                    a.start
                ) -
                timeToMinutes(
                    b.start
                )
        );


    if (
        mode === "days"
    ) {

        const dates =
            [
                ...new Set(
                    sorted.map(
                        artist =>
                            artist.dateISO
                    )
                )
            ];


        dates.forEach(
            dateISO => {

                const dayArtists =
                    sorted.filter(
                        artist =>
                            artist.dateISO ===
                            dateISO
                    );


                saveScheduleCanvas(
                    dayArtists,
                    dateISO
                );

            }
        );


        return;

    }


    saveScheduleCanvas(
        sorted,
        "all"
    );

}


/* =========================================================
   SAVE CANVAS
========================================================= */

function saveScheduleCanvas(
    sorted,
    fileSuffix
) {

    const width =
        1600;


    const headerHeight =
        250;


    const columnHeaderHeight =
        75;


    const rowHeight =
        90;


    const footerHeight =
        105;


    const height =
        headerHeight +
        columnHeaderHeight +
        sorted.length *
        rowHeight +
        footerHeight;


    const canvas =
        document.createElement(
            "canvas"
        );


    const context =
        canvas.getContext(
            "2d"
        );


    if (
        !context
    ) {

        showPopup(
            "ไม่สามารถบันทึกรูปภาพได้",
            "เบราว์เซอร์ไม่สามารถสร้าง Canvas ได้"
        );


        return;

    }


    canvas.width =
        width;


    canvas.height =
        height;


    context.fillStyle =
        "#071007";


    context.fillRect(
        0,
        0,
        width,
        height
    );


    const gradient =
        context.createLinearGradient(
            0,
            0,
            width,
            headerHeight
        );


    gradient.addColorStop(
        0,
        "#254b0c"
    );


    gradient.addColorStop(
        1,
        "#071007"
    );


    context.fillStyle =
        gradient;


    context.fillRect(
        0,
        0,
        width,
        headerHeight
    );


    context.fillStyle =
        "#ffffff";


    setCanvasFont(
        context,
        700,
        50
    );


    context.fillText(
        "Melody Of Life 17 Planner",
        60,
        85
    );


    context.fillStyle =
        "#d8e5d4";


    setCanvasFont(
        context,
        400,
        30
    );


    context.fillText(
        "ตารางศิลปินที่เลือก",
        60,
        135
    );


    context.fillStyle =
        "#b8c9b2";


    setCanvasFont(
        context,
        400,
        23
    );


    context.fillText(
        `จำนวน ${sorted.length} ศิลปิน`,
        60,
        180
    );


    context.fillStyle =
        "#d9e8d4";


    setCanvasFont(
        context,
        400,
        19
    );


    context.fillText(
        "ข้อมูลตารางจัดทำจาก Melody Of Life 17 Planner",
        60,
        220
    );


    const tableX =
        40;


    const tableWidth =
        width - 80;


    const tableHeaderY =
        headerHeight;


    context.fillStyle =
        "#182218";


    context.fillRect(
        tableX,
        tableHeaderY,
        tableWidth,
        columnHeaderHeight
    );


    const columns = [

        {
            x: 70,
            title: "วัน"
        },

        {
            x: 310,
            title: "เวลา"
        },

        {
            x: 560,
            title: "ศิลปิน"
        },

        {
            x: 1200,
            title: "เวที"
        }

    ];


    context.fillStyle =
        "#ffffff";


    setCanvasFont(
        context,
        700,
        26
    );


    columns.forEach(
        column => {

            context.fillText(
                column.title,
                column.x,
                tableHeaderY +
                48
            );

        }
    );


    sorted.forEach(
        (
            artist,
            index
        ) => {

            const y =
                tableHeaderY +
                columnHeaderHeight +
                index *
                rowHeight;


            context.fillStyle =
                index % 2 === 0
                    ? "#101a10"
                    : "#0c150c";


            context.fillRect(
                tableX,
                y,
                tableWidth,
                rowHeight
            );


            context.strokeStyle =
                "#263526";


            context.lineWidth =
                1;


            context.beginPath();


            context.moveTo(
                tableX,
                y + rowHeight
            );


            context.lineTo(
                tableX +
                tableWidth,
                y + rowHeight
            );


            context.stroke();


            const dayColor =
                getDayColor(
                    artist.dateISO
                );


            context.fillStyle =
                dayColor;


            drawFittedText(
                context,
                `${artist.day || ""} ${artist.date || ""}`,
                70,
                y + 56,
                210,
                {
                    weight: 700,
                    size: 22,
                    minSize: 15
                }
            );


            context.fillStyle =
                "#ffffff";


            drawFittedText(
                context,
                `${artist.start} - ${artist.end}`,
                310,
                y + 56,
                220,
                {
                    weight: 400,
                    size: 22,
                    minSize: 15
                }
            );


            drawFittedText(
                context,
                artist.name,
                560,
                y + 56,
                600,
                {
                    weight: 700,
                    size: 27,
                    minSize: 15
                }
            );


            const stageColor =
                getStageColor(
                    artist.stage
                );


            context.fillStyle =
                stageColor ||
                "#ffffff";


            drawFittedText(
                context,
                getStageName(
                    artist.stage
                ),
                1200,
                y + 56,
                250,
                {
                    weight: 700,
                    size: 22,
                    minSize: 15
                }
            );

        }
    );


    const footerY =
        height -
        footerHeight;


    context.fillStyle =
        "#0b120b";


    context.fillRect(
        0,
        footerY,
        width,
        footerHeight
    );


    context.fillStyle =
        "#b7c7b1";


    setCanvasFont(
        context,
        400,
        18
    );


    context.fillText(
        "Melody Of Life 17 Planner — Fan Made",
        60,
        footerY + 35
    );


    context.fillStyle =
        "#879985";


    setCanvasFont(
        context,
        400,
        16
    );


    context.fillText(
        "เว็บไซต์นี้จัดทำโดยแฟนคลับ และไม่ใช่เว็บไซต์อย่างเป็นทางการของงาน",
        60,
        footerY + 65
    );


    const safeSuffix =
        String(
            fileSuffix
        )
            .replace(
                /[^a-zA-Z0-9_-]+/g,
                "-"
            );


    const fileName =
        safeSuffix === "all"

            ? "melodyoflife17-schedule.png"

            : `melodyoflife17-schedule-${safeSuffix}.png`;


    try {

        const link =
            document.createElement(
                "a"
            );


        link.download =
            fileName;


        link.href =
            canvas.toDataURL(
                "image/png"
            );


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();

    }
    catch (
    error
    ) {

        console.error(
            "❌ Save Image Error:",
            error
        );


        showPopup(
            "บันทึกรูปภาพไม่สำเร็จ",
            "เกิดข้อผิดพลาดขณะสร้างไฟล์ PNG"
        );

    }

}


/* =========================================================
   POPUP
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
        title;


    messageElement.innerHTML =
        message;


    overlay.hidden =
        false;


    document.body.classList.add(
        "popup-open"
    );

}


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


    document.body.classList.remove(
        "popup-open"
    );

}


function setupPopupEvents() {

    $("#popupCloseButton")
        ?.addEventListener(
            "click",
            closePopup
        );


    $("#popupOverlay")
        ?.addEventListener(
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


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closePopup();

            }

        }
    );

}


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


            if (
                !Number.isFinite(
                    id
                )
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


            if (
                !artist.name ||
                !artist.dateISO ||
                !artist.stage ||
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


            const stage =
                getStageById(
                    artist.stage
                );


            if (
                !stage
            ) {

                console.error(
                    `❌ Artist "${artist.name}" ใช้ Stage "${artist.stage}" ที่ไม่มีใน CONFIG.stages`
                );


                valid =
                    false;

            }

        }
    );


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
   DEBUG
========================================================= */

function debugStageConfig() {

    console.group(
        "🎨 Stage Color System"
    );


    console.log(
        "Single Source:",
        "CONFIG.stages"
    );


    getStages().forEach(
        stage => {

            console.log(
                `${stage.name} → ${stage.color}`
            );

        }
    );


    console.groupEnd();

}


function debugSimulationConfig() {

    console.group(
        "🧪 Simulation"
    );


    console.log(
        "Environment:",
        APP_ENV
    );


    console.log(
        "Enabled:",
        simulationEnabled
    );


    console.log(
        "Date:",
        simulationDate
    );


    console.log(
        "Time:",
        simulationTime
    );


    console.log(
        "Speed:",
        simulationSpeed
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

function renderStaticUI() {

    if (
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

    updateArtistCardsRealtimeState();


    renderNowPlaying(
        force
    );


    renderSchedule(
        force
    );


    renderConflictWarning();


    updateSimulationDisplay();


    updateSimulationButtons();

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


    renderStaticUI();


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
    withTransition = false
) {

    if (
        withTransition
    ) {

        renderApp({

            transition:
                true,

            force:
                true,

            renderFilters:
                true

        });


        return;

    }


    renderApp({

        transition:
            false,

        force:
            false,

        renderFilters:
            false

    });

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    $("#applySimulationButton")
        ?.addEventListener(
            "click",
            event => {

                playButtonPress(
                    event.currentTarget
                );


                applySimulation();

            }
        );


    $("#playSimulationButton")
        ?.addEventListener(
            "click",
            event => {

                playButtonPress(
                    event.currentTarget
                );


                playSimulation();

            }
        );


    $("#pauseSimulationButton")
        ?.addEventListener(
            "click",
            event => {

                playButtonPress(
                    event.currentTarget
                );


                pauseSimulation();

            }
        );


    $("#resetSimulationButton")
        ?.addEventListener(
            "click",
            event => {

                playButtonPress(
                    event.currentTarget
                );


                resetSimulation();

            }
        );


    $("#simulationSpeed")
        ?.addEventListener(
            "change",
            event => {

                changeSimulationSpeed(
                    event.target.value
                );

            }
        );


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


    $("#saveImageButton")
        ?.addEventListener(
            "click",
            saveScheduleAsImage
        );


    setupPopupEvents();

}


/* =========================================================
   INITIALIZE SIMULATION
========================================================= */

function initializeSimulationInputs() {

    const dateInput =
        $("#simulationDate");


    if (
        dateInput
    ) {

        dateInput.min =
            FESTIVAL.startDate ||
            ALLOWED_DATES[0] ||
            "";


        dateInput.max =
            FESTIVAL.endDate ||
            ALLOWED_DATES[
            ALLOWED_DATES.length - 1
            ] ||
            "";

    }


    syncSimulationInputs();

}


/* =========================================================
   REALTIME LOOP
========================================================= */

function startRealtimeLoop() {

    window.setInterval(
    () => {

        if (
            simulationPlaying
        ) {
            return;
        }

        refreshAll(
            false
        );

    },
    1000
);
}


/* =========================================================
   APPLICATION INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            /*
             * รอ Excel
             */

            if (
                !window.artistDataReady
            ) {

                throw new Error(
                    "ไม่พบ window.artistDataReady"
                );

            }


            await window.artistDataReady;


            /*
             * ดึงวันที่จาก Excel
             */

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


            const artists =
                getAllArtists();


            if (
                !Array.isArray(
                    artists
                ) ||
                artists.length === 0
            ) {

                throw new Error(
                    "Excel โหลดสำเร็จ แต่ไม่พบ Artist Data"
                );

            }


            /*
             * State
             */

            RENDER_STATE.filtersRendered =
                false;


            RENDER_STATE.initialized =
                false;


            resetRenderSignatures();


            /*
             * Load selected artists
             */

            loadSelectedArtists();


            /*
            * Transition
            */

            injectTransitionStyles();

            requestAnimationFrame(
                () => {

                    requestAnimationFrame(
                        () => {

                            playPageRefreshTransition();

                        }
                    );

                }
            );
            /*
             * Realtime Desktop Fix
             */

            setupRealtimeResize();


            /*
             * System log
             */

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
                "Stages:",
                getStages()
            );


            /*
             * Validation
             */

            const valid =
                validateArtistData();


            console.log(
                valid
                    ? "✅ Artist / Stage validation ผ่าน"
                    : "⚠️ พบปัญหาใน Artist / Stage Data"
            );


            debugStageConfig();


            debugSimulationConfig();


            /*
             * Initialize Simulation
             */

            initializeSimulationInputs();


            /*
             * Setup Events
             */

            setupEvents();


            /*
             * Initial Render
             */

            renderApp({

                transition: false,

                force: true,

                renderFilters: true

            });

            requestAnimationFrame(
                () => {

                    requestAnimationFrame(
                        () => {

                            playPageRefreshTransition();

                        }
                    );

                }
            );


            /*
             * Realtime Loop
             */

            startRealtimeLoop();


            /*
             * READY
             */

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