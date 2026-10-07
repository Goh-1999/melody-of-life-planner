/* =========================================================
   Melody Of Life 17 Planner
   ui/export.js
   ========================================================= */


/* =========================================================
   CANVAS FONT HELPERS
========================================================= */

/*
 * timeToMinutes()
 * อยู่ใน core/utils.js แล้ว
 *
 * ไม่ประกาศซ้ำที่นี่
 */


/* =========================================================
   CANVAS FONT
========================================================= */

function setCanvasFont(
    context,
    weight,
    size
) {

    context.font =
        `${weight} ${size}px ${EXPORT_FONT}`;

}


/* =========================================================
   FIT CANVAS TEXT
========================================================= */

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


/* =========================================================
   DRAW FITTED TEXT
========================================================= */

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


    if (
        button
    ) {

        playButtonPress(
            button
        );

    }


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


    showSaveChoicePopup(
        selected
    );

}


/* =========================================================
   SAVE CHOICE POPUP
========================================================= */

function showSaveChoicePopup(
    selected
) {

    const overlay =
        $("#saveChoiceOverlay");


    if (
        !overlay
    ) {

        /*
         * Fallback:
         * ถ้า Popup ตัวเลือกไม่มี
         * ให้บันทึกรวมทันที
         */

        saveScheduleImageBundle(
            selected,
            "all"
        );


        return;

    }


    overlay.hidden =
        false;


    document.body.classList.add(
        "popup-open"
    );


    const allButton =
        $("#saveAllImageButton");


    const daysButton =
        $("#saveByDayImageButton");


    const closeButton =
        $("#saveChoiceCloseButton");


    /*
     * ป้องกันการผูก Event ซ้ำ
     * หลังเปิด Popup หลายครั้ง
     */

    if (
        allButton
    ) {

        allButton.onclick =
            () => {

                playButtonPress(
                    allButton
                );


                closeSaveChoicePopup();


                saveScheduleImageBundle(
                    selected,
                    "all"
                );

            };

    }


    if (
        daysButton
    ) {

        daysButton.onclick =
            () => {

                playButtonPress(
                    daysButton
                );


                closeSaveChoicePopup();


                saveScheduleImageBundle(
                    selected,
                    "days"
                );

            };

    }


    if (
        closeButton
    ) {

        closeButton.onclick =
            () => {

                playButtonPress(
                    closeButton
                );


                closeSaveChoicePopup();

            };

    }

}


/* =========================================================
   CLOSE SAVE CHOICE POPUP
========================================================= */

function closeSaveChoicePopup() {

    const overlay =
        $("#saveChoiceOverlay");


    if (
        overlay
    ) {

        overlay.hidden =
            true;

    }


    /*
     * ถ้าไม่มี Popup อื่นเปิดอยู่
     * ค่อยเอา class ออก
     */

    const popupOverlay =
        $("#popupOverlay");


    if (
        popupOverlay?.hidden !== false
    ) {

        document.body.classList.remove(
            "popup-open"
        );

    }

}


/* =========================================================
   SAVE IMAGE BUNDLE
========================================================= */

async function saveScheduleImageBundle(
    selected,
    mode = "all"
) {

    if (
        !Array.isArray(
            selected
        ) ||
        selected.length === 0
    ) {

        return;

    }


    const sorted =
        [
            ...selected
        ]
            .sort(
                (
                    a,
                    b
                ) =>

                    a.dateISO.localeCompare(
                        b.dateISO
                    ) ||

                    timeToMinutes(
                        a.start
                    ) -
                    timeToMinutes(
                        b.start
                    ) ||

                    normalizeStageId(
                        a.stageId
                    ).localeCompare(
                        normalizeStageId(
                            b.stageId
                        )
                    ) ||

                    Number(a.id) -
                    Number(b.id)
            );


    /* =====================================================
       BY DAY
    ===================================================== */

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


    /* =====================================================
       ALL
    ===================================================== */

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

    if (
        !Array.isArray(
            sorted
        ) ||
        sorted.length === 0
    ) {

        return;

    }


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


    /* =====================================================
       BACKGROUND
    ===================================================== */

    context.fillStyle =
        "#071007";


    context.fillRect(
        0,
        0,
        width,
        height
    );


    /* =====================================================
       HEADER GRADIENT
    ===================================================== */

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


    /* =====================================================
       HEADER TEXT
    ===================================================== */

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


    /* =====================================================
       TABLE
    ===================================================== */

    const tableX =
        40;


    const tableWidth =
        width -
        80;


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
            x:
                70,

            title:
                "วัน"

        },

        {
            x:
                310,

            title:
                "เวลา"

        },

        {
            x:
                560,

            title:
                "ศิลปิน"

        },

        {
            x:
                1200,

            title:
                "เวที"

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


    /* =====================================================
       ROWS
    ===================================================== */

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


            /* -------------------------------------------------
               ROW BACKGROUND
            ------------------------------------------------- */

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


            /* -------------------------------------------------
               DIVIDER
            ------------------------------------------------- */

            context.strokeStyle =
                "#263526";


            context.lineWidth =
                1;


            context.beginPath();


            context.moveTo(
                tableX,
                y +
                rowHeight
            );


            context.lineTo(
                tableX +
                tableWidth,
                y +
                rowHeight
            );


            context.stroke();


            /* -------------------------------------------------
               DAY
            ------------------------------------------------- */

            const dayColor =
                getDayColor(
                    artist.dateISO
                );


            context.fillStyle =
                dayColor ||
                "#ffffff";


            drawFittedText(

                context,

                `${artist.day || ""} ${artist.date || ""}`,

                70,

                y + 56,

                210,

                {

                    weight:
                        700,

                    size:
                        22,

                    minSize:
                        15

                }

            );


            /* -------------------------------------------------
               TIME
            ------------------------------------------------- */

            context.fillStyle =
                "#ffffff";


            drawFittedText(

                context,

                `${artist.start} - ${artist.end}`,

                310,

                y + 56,

                220,

                {

                    weight:
                        400,

                    size:
                        22,

                    minSize:
                        15

                }

            );


            /* -------------------------------------------------
               ARTIST
            ------------------------------------------------- */

            drawFittedText(

                context,

                artist.name,

                560,

                y + 56,

                600,

                {

                    weight:
                        700,

                    size:
                        27,

                    minSize:
                        15

                }

            );


            /* -------------------------------------------------
               STAGE
               
               StageID -> color
               Stage   -> name
            ------------------------------------------------- */

            const stageId =
                normalizeStageId(
                    artist.stageId
                );


            const stageColor =
                getStageColor(
                    stageId
                );


            const stageName =
                getStageName(
                    stageId,
                    artist.stage
                );


            context.fillStyle =
                stageColor ||
                "#ffffff";


            drawFittedText(

                context,

                stageName,

                1200,

                y + 56,

                250,

                {

                    weight:
                        700,

                    size:
                        22,

                    minSize:
                        15

                }

            );

        }
    );


    /* =====================================================
       FOOTER
    ===================================================== */

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
        footerY +
        35
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
        footerY +
        65
    );


    /* =====================================================
       FILE NAME
    ===================================================== */

    const safeSuffix =
        String(
            fileSuffix
        )
            .replace(
                /[^a-zA-Z0-9_-]+/g,
                "-"
            );


    const fileName =

        safeSuffix ===
            "all"

            ? "melodyoflife17-schedule.png"

            : `melodyoflife17-schedule-${safeSuffix}.png`;


    /* =====================================================
       DOWNLOAD
    ===================================================== */

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