/**
 * =========================================================
 * Melody Of Life 17 Planner
 * config-runtime.js
 * =========================================================
 *
 * Runtime access layer.
 *
 * This file:
 * - Reads global configuration
 * - Detects current application environment
 * - Applies runtime environment overrides
 * - Exposes commonly used configuration sections
 *
 * Configuration values are still owned by config.js
 * and APP_CONFIG. This file only adapts them to runtime.
 *
 * =========================================================
 */


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


/* =========================================================
   DETECT RUNTIME ENVIRONMENT
========================================================= */

function detectAppEnvironment() {

    const pathname =
        String(window.location.pathname || "").toLowerCase();


    /* -----------------------------------------
       PRODUCTION
    ----------------------------------------- */

    if (
        pathname.includes("/production/") ||
        pathname.includes("\\production\\")
    ) {
        return "production";
    }


    /* -----------------------------------------
       TESTER
    ----------------------------------------- */

    if (
        pathname.includes("/tester/") ||
        pathname.includes("\\tester\\")
    ) {
        return "tester";
    }


    /* -----------------------------------------
       DEV
    ----------------------------------------- */

    if (
        pathname.includes("/dev/") ||
        pathname.includes("\\dev\\")
    ) {
        return "development";
    }


    /* -----------------------------------------
       FALLBACK
    ----------------------------------------- */

    return (
        MOL_APP_CONFIG.ENV ||
        MOL_CONFIG.app?.environment ||
        "development"
    );
}


/* =========================================================
   RUNTIME ENVIRONMENT
========================================================= */

const APP_ENV =
    detectAppEnvironment();


/* =========================================================
   APPLY PRODUCTION RUNTIME RULES
========================================================= */

if (
    APP_ENV === "production" &&
    MOL_APP_CONFIG.SIMULATION
) {

    MOL_APP_CONFIG.SIMULATION.enabled = false;
}


/* =========================================================
   APPLY DEV / TESTER RUNTIME RULES
========================================================= */

if (
    APP_ENV === "development" &&
    MOL_APP_CONFIG.SIMULATION
) {

    MOL_APP_CONFIG.SIMULATION.enabled = true;
}


if (
    APP_ENV === "tester" &&
    MOL_APP_CONFIG.SIMULATION
) {

    MOL_APP_CONFIG.SIMULATION.enabled = true;
}


/* =========================================================
   RUNTIME SECTIONS
========================================================= */

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


/* =========================================================
   OPTIONAL RUNTIME FLAGS
========================================================= */

const IS_PRODUCTION =
    APP_ENV === "production";


const IS_TESTER =
    APP_ENV === "tester";


const IS_DEVELOPMENT =
    APP_ENV === "development";