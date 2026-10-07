/* =========================================================
   Melody Of Life 17 Planner
   ui/filters.js
   ========================================================= */


/* =========================================================
   DAY FILTER
========================================================= */

function renderDayFilter() {

    const container =
        $("#dayFilter");


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const fragment =
        document.createDocumentFragment();


    /* =====================================================
       CREATE DAY BUTTON
    ===================================================== */

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
                text.split(" ")[0] ||
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
                        true,
                        true
                    );

                }
            );


            return button;

        };


    /* =====================================================
       FESTIVAL DAYS ONLY

       No "all" button for Day.
    ===================================================== */

    getAllowedFestivalDays()
        .forEach(
            day => {

                const color =
                    getDayColor(
                        day.dateISO
                    );


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

}


/* =========================================================
   STAGE FILTER OPTIONS
========================================================= */

function getStageFilterOptions() {

    const artists =
        getAllArtists();


    if (
        !Array.isArray(
            artists
        )
    ) {

        return [];

    }


    const stageMap =
        new Map();


    artists.forEach(
        artist => {

            const stageId =
                normalizeStageId(
                    artist.stageId
                );


            const stageName =
                String(
                    artist.stage || ""
                ).trim();


            if (
                !stageId
            ) {

                return;

            }


            if (
                !stageMap.has(
                    stageId
                )
            ) {

                stageMap.set(
                    stageId,
                    {

                        id:
                            stageId,

                        name:
                            stageName ||
                            `Stage ${stageId}`,

                        color:
                            getStageColor(
                                stageId
                            )

                    }
                );

            }

        }
    );


    /* =====================================================
       SORT BY STAGE ID
       
       Stage order:
       1 = Earth
       2 = Sun
       3 = Wave
       4 = Wind

       This prevents Excel row order from affecting
       the Stage Filter order.
    ===================================================== */

    return Array.from(
        stageMap.values()
    ).sort(
        (
            a,
            b
        ) => {

            const aId =
                Number(
                    a.id
                );


            const bId =
                Number(
                    b.id
                );


            /* ---------------------------------------------
               Numeric StageID
            --------------------------------------------- */

            if (
                Number.isFinite(
                    aId
                ) &&
                Number.isFinite(
                    bId
                )
            ) {

                return (
                    aId -
                    bId
                );

            }


            /* ---------------------------------------------
               Fallback for non-numeric StageID
            --------------------------------------------- */

            return String(
                a.id
            ).localeCompare(
                String(
                    b.id
                ),
                undefined,
                {
                    numeric: true
                }
            );

        }
    );

}


/* =========================================================
   STAGE FILTER
========================================================= */

function renderStageFilter() {

    const container =
        $("#stageFilter");


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const primary =
        MOL_CONFIG.theme?.primary ||
        "#77b813";


    const fragment =
        document.createDocumentFragment();


    /* =====================================================
       CREATE STAGE BUTTON
    ===================================================== */

    const createButton =
        (
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


            /*
             * "all" is a special filter value.
             * Do NOT normalize it to "ALL".
             */

            const isAll =
                stageId ===
                "all";


            const normalizedStageId =
                isAll

                    ? "all"

                    : normalizeStageId(
                        stageId
                    );


            const active =
                selectedStage ===
                normalizedStageId;


            button.textContent =
                text;


            button.dataset.stage =
                normalizedStageId;


            setButtonColor(

                button,

                color,

                active

            );


            button.addEventListener(
                "click",
                () => {

                    /*
                     * Keep "all" as lowercase "all".
                     */

                    const nextStage =

                        isAll

                            ? "all"

                            : normalizedStageId;


                    if (
                        selectedStage ===
                        nextStage
                    ) {

                        return;

                    }


                    playButtonPress(
                        button
                    );


                    selectedStage =
                        nextStage;


                    refreshAll(
                        true,
                        true
                    );

                }
            );


            return button;

        };


    /* =====================================================
       ALL STAGES
    ===================================================== */

    fragment.appendChild(

        createButton(

            "ทั้งหมด",

            "all",

            primary

        )

    );


    /* =====================================================
       STAGES FROM EXCEL
       
       Already sorted by StageID inside
       getStageFilterOptions()
    ===================================================== */

    getStageFilterOptions()
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

}