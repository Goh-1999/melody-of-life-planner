/**
 * =========================================================
 * Melody Of Life 17 Planner
 * config.js
 * =========================================================
 *
 * GLOBAL CONFIGURATION
 *
 * SINGLE SOURCE OF TRUTH
 *
 * Application configuration:
 * -> CONFIG
 *
 * Stage ID + Stage Color:
 * -> CONFIG.stages
 *
 * Stage Name:
 * -> Excel.Stage
 *
 * Theme Colors:
 * -> CONFIG.theme
 *
 * =========================================================
 */


const CONFIG = {


    /* =====================================================
       APP
    ===================================================== */

    app: {

        name:
            "Melody Of Life 17 Planner",

        version:
            "1.0.0",

        environment:
            "development"

    },


    /* =====================================================
       FESTIVAL
    ===================================================== */

    festival: {

        name:
            "Melody Of Life 17",

        startDate:
            "2026-10-16",

        endDate:
            "2026-10-18",

        timezone:
            "Asia/Bangkok"

    },


    /* =====================================================
       PLANNER
    ===================================================== */

    planner: {

        enableNowPlaying:
            true,

        enableConflictWarning:
            true,

        enableRealtimeClock:
            true,

        enableSaveImage:
            true

    },


    /* =====================================================
       STORAGE
    ===================================================== */

    storage: {

        selectedArtists:
            "mol17_selected_artists"

    },


    /* =====================================================
       STAGES
       
       Stage ID + Color only
       
       Stage name is NOT stored here.
       Stage name comes from Excel.Stage
    ===================================================== */

    stages: {

        A: {

            id:
                "A",

            color:
                "#a18400" // Earth Stage

        },


        B: {

            id:
                "B",

            color:
                "#e45522" // Sun Stage

        },


        C: {

            id:
                "C",

            color:
                "#1e9abc" // Wave Stage

        },


        D: {

            id:
                "D",

            color:
                "#b23cc0" // Wind Stage

        }

    },


    /* =====================================================
       THEME
    ===================================================== */

    theme: {

        primary:
            "#77b813",

        background:
            "#071007",

        surface:
            "#101a10",

        surfaceAlt:
            "#182218",

        text:
            "#ffffff",

        textMuted:
            "#b7c7b1",

        dayColors: {

            friday:
                "#3b82f6",

            saturday:
                "#8b5cf6",

            sunday:
                "#ef4444"

        }

    }

};


/* =========================================================
   APP CONFIG
========================================================= */

const APP_CONFIG = {

    ENV:
        "development",


    SIMULATION: {

        enabled:
            true,

        date:
            "2026-10-17",

        time:
            "20:15"

    },


    SIMULATION_SPEEDS: [

        1,
        10,
        60,
        300

    ]

};
