/**
 * =========================================================
 * Melody Of Life 17 Planner
 * state.js
 * =========================================================
 *
 * SINGLE SOURCE OF TRUTH FOR RUNTIME STATE
 *
 * This file contains state only.
 *
 * No:
 * - DOM rendering
 * - Excel loading
 * - filtering logic
 * - time calculation
 * - theme logic
 *
 * =========================================================
 */


/* =========================================================
   FESTIVAL DATE STATE
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
   FILTER STATE
========================================================= */

/*
 * selectedDate
 * - Always stores one festival date.
 * - No "all" state.
 * - Default date is the festival start date.
 *
 * Auto-selecting the current festival date
 * should be handled outside this file.
 */

let selectedDate =
    FESTIVAL.startDate ||
    "2026-10-16";


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