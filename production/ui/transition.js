/* =========================================================
   Melody Of Life 17 Planner
   ui/transition.js
   ========================================================= */


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

.mol-action-transition {

    animation:
        molActionFadeIn
        .68s
        cubic-bezier(.22,1,.36,1)
        both;

    will-change:
        opacity,
        transform;

}


@keyframes molActionFadeIn {

    0% {

        opacity:
            0;

        transform:
            translate3d(
                0,
                10px,
                0
            );

    }


    100% {

        opacity:
            1;

        transform:
            translate3d(
                0,
                0,
                0
            );

    }

}


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

        opacity:
            0;

    }


    55% {

        opacity:
            .72;

    }


    100% {

        opacity:
            1;

    }

}


@media (max-width:600px) {

    .mol-action-transition {

        animation-duration:
            .56s;

    }


    .mol-refresh-enter {

        animation-duration:
            .75s;

    }

}


@media (prefers-reduced-motion:reduce) {

    .mol-action-transition,
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
                resolveTransitionTarget
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


    /*
     * Remove only the transition class.
     *
     * Do NOT touch inline animation,
     * opacity or transform of the target.
     *
     * This prevents transition logic from
     * interfering with child animations / hover.
     */

    uniqueElements.forEach(
        element => {

            element.classList.remove(
                TRANSITION_CLASS
            );

        }
    );


    /*
     * Force browser reflow.
     */

    uniqueElements.forEach(
        element => {

            void element.offsetWidth;

        }
    );


    /*
     * Reapply transition next frame.
     */

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


    /*
     * Clean class after animation.
     */

    window.setTimeout(
        () => {

            uniqueElements.forEach(
                element => {

                    element.classList.remove(
                        TRANSITION_CLASS
                    );

                }
            );

        },
        750
    );

}


/* =========================================================
   PAGE REFRESH TRANSITION
========================================================= */

function playPageRefreshTransition() {

    const body =
        document.body;


    if (
        !body
    ) {

        return;

    }


    body.classList.remove(
        "mol-refresh-enter"
    );


    void body.offsetWidth;


    requestAnimationFrame(
        () => {

            body.classList.add(
                "mol-refresh-enter"
            );

        }
    );


    window.setTimeout(
        () => {

            body.classList.remove(
                "mol-refresh-enter"
            );

        },
        950
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