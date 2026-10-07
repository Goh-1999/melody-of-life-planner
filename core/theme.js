/**
 * =========================================================
 * Melody Of Life 17 Planner
 * theme.js
 * =========================================================
 *
 * SINGLE OWNER OF PRESENTATION
 *
 * Source of truth:
 *
 * Stage ID
 * -> Excel.StageID
 *
 * Stage Name
 * -> Excel.Stage
 *
 * Stage Color
 * -> CONFIG.stages
 *
 * Day Color
 * -> CONFIG.theme.dayColors
 *
 * Theme Token
 * -> CONFIG.theme
 *
 * This file does NOT define stage names.
 *
 * =========================================================
 */


/* =========================================================
   STATUS PRESENTATION
========================================================= */

const THEME_STATUS = {

    LIVE: {

        label:
            "LIVE",

        icon:
            "🔴"

    },


    NEXT: {

        label:
            "NEXT",

        icon:
            "🟡"

    },


    ENDED: {

        label:
            "ENDED",

        icon:
            "⚪"

    }

};


/* =========================================================
   APPLY THEME
========================================================= */

function applyTheme() {

    const root =
        document.documentElement;


    root.style.setProperty(
        "--color-primary",
        MOL_CONFIG.theme?.primary ||
        ""
    );


    root.style.setProperty(
        "--color-background",
        MOL_CONFIG.theme?.background ||
        ""
    );


    root.style.setProperty(
        "--color-surface",
        MOL_CONFIG.theme?.surface ||
        ""
    );


    root.style.setProperty(
        "--color-surface-alt",
        MOL_CONFIG.theme?.surfaceAlt ||
        ""
    );


    root.style.setProperty(
        "--color-text",
        MOL_CONFIG.theme?.text ||
        ""
    );


    root.style.setProperty(
        "--color-text-muted",
        MOL_CONFIG.theme?.textMuted ||
        ""
    );

}


/* =========================================================
   STAGE CONFIG
========================================================= */

/*
 * CONFIG.stages stores ONLY:
 *
 * A -> color
 * B -> color
 * C -> color
 * D -> color
 *
 * Stage name does NOT live here.
 */

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


/* =========================================================
   STAGE LIST
========================================================= */

function getStages() {

    return Object.entries(
        getStageConfig()
    )

        .map(
            (
                [
                    id,
                    data
                ]
            ) => {

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

                    color

                };

            }
        )

        .filter(
            stage =>
                stage.id
        );

}


/* =========================================================
   STAGE BY ID
========================================================= */

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


/* =========================================================
   STAGE COLOR
========================================================= */

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


/* =========================================================
   STAGE NAME
========================================================= */

/*
 * Stage name comes from Excel.
 *
 * Usage:
 *
 * getStageName(
 *     artist.stageId,
 *     artist.stage
 * );
 */

function getStageName(
    stageId,
    excelStageName = ""
) {

    const name =
        String(
            excelStageName || ""
        ).trim();


    if (
        name
    ) {

        return name;

    }


    const normalizedId =
        normalizeStageId(
            stageId
        );


    return normalizedId
        ? `Stage ${normalizedId}`
        : "";

}


/* =========================================================
   APPLY STAGE COLOR
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

/*
 * Date -> Festival Day -> Day Color
 *
 * Date is the stable source for filtering.
 */

function getDayColor(
    dateISO
) {

    const colors =
        MOL_CONFIG.theme?.dayColors ||
        {};


    const festivalDay =
        getFestivalDay(
            dateISO
        );


    const day =
        festivalDay?.day ||
        "";


    const colorMap = {

        "ศุกร์":
            colors.friday ||
            null,

        "เสาร์":
            colors.saturday ||
            null,

        "อาทิตย์":
            colors.sunday ||
            null

    };


    return (
        colorMap[day] ||
        MOL_CONFIG.theme?.primary ||
        null
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
   STATUS INFO
========================================================= */

function getStatusInfo(
    status
) {

    return (

        THEME_STATUS[status] ||

        {

            label:
                status,

            icon:
                ""

        }

    );

}