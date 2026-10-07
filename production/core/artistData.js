/**
 * =========================================================
 * Melody Of Life 17 Planner
 * artistData.js
 * =========================================================
 *
 * SINGLE SOURCE OF TRUTH
 *
 * DATA SOURCE
 * -> data/MelodyOfLife17Lineup.xlsx
 *
 * Responsibility:
 * - Load Excel
 * - Normalize Excel values
 * - Create artistData
 * - Create festivalDays
 *
 * Excel columns:
 * ID
 * Artist
 * Date
 * Day
 * Stage
 * Start
 * End
 * StageID
 *
 * Web-calculated:
 * - duration
 * - LIVE / NEXT / ENDED
 * - progress
 * - countdown
 *
 * Stage name comes from Excel.
 * Stage color comes from CONFIG.stages.
 *
 * =========================================================
 */

const ARTIST_EXCEL_FILE =
    "../data/MelodyOfLife17Lineup.xlsx";


let artistData = [];


let festivalDays = [];


/* =========================================================
   SHEETJS
========================================================= */

function loadSheetJS() {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            if (
                window.XLSX
            ) {

                resolve(
                    window.XLSX
                );

                return;

            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js";


            script.onload =
                () => {

                    if (
                        window.XLSX
                    ) {

                        resolve(
                            window.XLSX
                        );

                    }
                    else {

                        reject(
                            new Error(
                                "SheetJS โหลดไม่สำเร็จ"
                            )
                        );

                    }

                };


            script.onerror =
                () =>
                    reject(
                        new Error(
                            "ไม่สามารถโหลด SheetJS จาก CDN ได้"
                        )
                    );


            document.head.appendChild(
                script
            );

        }
    );

}


/* =========================================================
   BASIC NORMALIZERS
========================================================= */

function excelString(
    value
) {

    return (
        value === undefined ||
        value === null
    )
        ? ""
        : String(
            value
        ).trim();

}


/* =========================================================
   ARTIST ID
========================================================= */

/*
 * ID ต้องมาจาก Excel เท่านั้น
 *
 * ห้ามใช้ row number เป็น fallback
 */

function parseArtistID(
    value
) {

    const number =
        Number(
            value
        );


    return Number.isSafeInteger(
        number
    ) &&
        number > 0

        ? number

        : null;

}

/* =========================================================
   TIME
========================================================= */

function normalizeTime(
    value
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return "";

    }

    /*
     * Excel time serial
     */

    if (
        typeof value === "number" &&
        value >= 0 &&
        value < 1
    ) {

        const totalMinutes =
            Math.round(
                value *
                24 *
                60
            );


        const hours =
            Math.floor(
                totalMinutes / 60
            ) % 24;


        const minutes =
            totalMinutes % 60;


        return (
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}`
        );

    }

    /*
     * JavaScript Date
     */

    if (
        value instanceof Date
    ) {

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {

            return "";

        }

        const hours =
            value.getHours();

        const minutes =
            value.getMinutes();

        return (
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}`
        );

    }

    /*
     * Text
     */

    let time =
        String(
            value
        ).trim();

    /*
     * 18.30 -> 18:30
     */

    if (
        /^\d{1,2}\.\d{2}$/.test(
            time
        )
    ) {

        time =
            time.replace(
                ".",
                ":"
            );

    }

    /*
     * 18 -> 18:00
     */

    if (
        /^\d{1,2}$/.test(
            time
        )
    ) {

        time =
            `${time.padStart(2, "0")}:00`;

    }

    const match =
        time.match(
            /^(\d{1,2}):(\d{1,2})$/
        );


    if (
        !match
    ) {

        return "";

    }

    const hours =
        Number(
            match[1]
        );

    const minutes =
        Number(
            match[2]
        );

    if (
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {

        return "";

    }

    return (
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}`
    );

}

/* =========================================================
   DURATION
========================================================= */

function calculateDuration(
    start,
    end
) {

    if (
        !start ||
        !end
    ) {

        return 0;

    }

    const [
        startHour,
        startMinute
    ] =
        start
            .split(":")
            .map(Number);

    const [
        endHour,
        endMinute
    ] =
        end
            .split(":")
            .map(Number);
    if (
        ![
            startHour,
            startMinute,
            endHour,
            endMinute
        ].every(
            Number.isFinite
        )
    ) {

        return 0;

    }

    let startTotal =
        startHour * 60 +
        startMinute;

    let endTotal =
        endHour * 60 +
        endMinute;

    /*
     * รองรับการแสดงข้ามเที่ยงคืน
     */

    if (
        endTotal < startTotal
    ) {

        endTotal += 1440;

    }

    return (
        endTotal -
        startTotal
    );

}

/* =========================================================
   DATE NORMALIZATION
========================================================= */

function normalizeDateISO(
    value,
    XLSX
) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return "";

    }

    /*
     * YYYY-MM-DD
     */

    if (
        typeof value === "string"
    ) {

        const raw =
            value.trim();


        if (
            /^\d{4}-\d{2}-\d{2}$/.test(
                raw
            )
        ) {

            return raw;

        }

        /*
         * DD/MM/YYYY
         * DD-MM-YYYY
         * DD.MM.YYYY
         */

        const parts =
            raw.match(
                /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/
            );

        if (
            parts
        ) {

            let day =
                Number(
                    parts[1]
                );

            let month =
                Number(
                    parts[2]
                );

            let year =
                Number(
                    parts[3]
                );

            /*
             * Buddhist year -> Gregorian
             */

            if (
                year >= 2400
            ) {

                year -= 543;

            }

            if (
                year >= 1900 &&
                month >= 1 &&
                month <= 12 &&
                day >= 1 &&
                day <= 31
            ) {

                return (
                    `${String(year).padStart(4, "0")}-` +
                    `${String(month).padStart(2, "0")}-` +
                    `${String(day).padStart(2, "0")}`
                );

            }

        }

    }

    /*
     * Excel serial date
     */

    if (
        typeof value === "number" &&
        XLSX?.SSF &&
        typeof XLSX.SSF.parse_date_code ===
        "function"
    ) {

        const parsed =
            XLSX.SSF.parse_date_code(
                value
            );


        if (
            parsed &&
            Number.isFinite(
                parsed.y
            ) &&
            Number.isFinite(
                parsed.m
            ) &&
            Number.isFinite(
                parsed.d
            )
        ) {

            return (
                `${String(parsed.y).padStart(4, "0")}-` +
                `${String(parsed.m).padStart(2, "0")}-` +
                `${String(parsed.d).padStart(2, "0")}`
            );

        }

    }

    /*
     * Date object
     */

    if (
        value instanceof Date
    ) {

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {

            return "";

        }

        return (
            `${String(value.getFullYear()).padStart(4, "0")}-` +
            `${String(value.getMonth() + 1).padStart(2, "0")}-` +
            `${String(value.getDate()).padStart(2, "0")}`
        );

    }

    return "";

}

/* =========================================================
   DISPLAY DATE
========================================================= */

function formatThaiDate(
    dateISO
) {

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            dateISO || ""
        )
    ) {

        return "";

    }

    const [
        ,
        month,
        day
    ] =
        dateISO
            .split("-")
            .map(Number);


    const monthNames = [

        "",

        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค."

    ];


    return (
        monthNames[month]
            ? `${day} ${monthNames[month]}`
            : ""
    );

}

/* =========================================================
   THAI DAY
========================================================= */

function getThaiDay(
    dateISO
) {

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            dateISO || ""
        )
    ) {

        return "";

    }


    const [
        year,
        month,
        day
    ] =
        dateISO
            .split("-")
            .map(Number);


    const table = [

        0,
        3,
        2,
        5,
        0,
        3,
        5,
        1,
        4,
        6,
        2,
        4

    ];

    let y =
        year;

    if (
        month < 3
    ) {
        y -= 1;

    }

    const index =
        (
            y +
            Math.floor(
                y / 4
            ) -
            Math.floor(
                y / 100
            ) +
            Math.floor(
                y / 400
            ) +
            table[
            month - 1
            ] +
            day
        ) % 7;

    return [

        "อาทิตย์",
        "จันทร์",
        "อังคาร",
        "พุธ",
        "พฤหัสบดี",
        "ศุกร์",
        "เสาร์"

    ][index] || "";

}

/* =========================================================
   HEADER
========================================================= */

function normalizeHeader(
    header
) {

    return String(
        header || ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /\s+/g,
            ""
        );

}

function createHeaderMap(
    headers
) {

    const map = {};


    headers.forEach(
        (
            header,
            index
        ) => {

            const key =
                normalizeHeader(
                    header
                );


            if (
                key
            ) {

                map[key] =
                    index;

            }

        }
    );


    return map;

}


function findColumn(
    headerMap,
    possibleNames
) {

    for (
        const name of possibleNames
    ) {

        const normalized =
            normalizeHeader(
                name
            );


        if (
            Object.prototype.hasOwnProperty.call(
                headerMap,
                normalized
            )
        ) {

            return headerMap[
                normalized
            ];

        }

    }


    return -1;

}

/* =========================================================
   ROW CONVERSION
========================================================= */

function convertExcelRow(
    row,
    headerMap,
    XLSX
) {

    const idIndex =
        findColumn(
            headerMap,
            [
                "ID",
                "Id",
                "id"
            ]
        );


    const artistIndex =
        findColumn(
            headerMap,
            [
                "Artist",
                "Name",
                "ศิลปิน"
            ]
        );


    const dateIndex =
        findColumn(
            headerMap,
            [
                "Date",
                "วันที่"
            ]
        );


    const dayIndex =
        findColumn(
            headerMap,
            [
                "Day",
                "วัน"
            ]
        );


    const stageIndex =
        findColumn(
            headerMap,
            [
                "Stage",
                "เวที"
            ]
        );


    const stageIdIndex =
        findColumn(
            headerMap,
            [
                "StageID",
                "Stage ID",
                "Stage_Id",
                "รหัสเวที"
            ]
        );


    const startIndex =
        findColumn(
            headerMap,
            [
                "Start",
                "เริ่ม",
                "เวลาเริ่ม"
            ]
        );


    const endIndex =
        findColumn(
            headerMap,
            [
                "End",
                "จบ",
                "เวลาจบ"
            ]
        );


    const rawID =
        idIndex >= 0
            ? row[idIndex]
            : "";


    const id =
        parseArtistID(
            rawID
        );


    const rawDate =
        dateIndex >= 0
            ? row[dateIndex]
            : "";


    const dateISO =
        normalizeDateISO(
            rawDate,
            XLSX
        );


    const excelDay =
        dayIndex >= 0
            ? excelString(
                row[dayIndex]
            )
            : "";


    const day =
        excelDay ||
        getThaiDay(
            dateISO
        );


    const stage =
        stageIndex >= 0
            ? excelString(
                row[stageIndex]
            )
            : "";


    const stageId =
        stageIdIndex >= 0
            ? normalizeStageIdValue(
                row[stageIdIndex]
            )
            : "";


    const start =
        normalizeTime(
            startIndex >= 0
                ? row[startIndex]
                : ""
        );


    const end =
        normalizeTime(
            endIndex >= 0
                ? row[endIndex]
                : ""
        );


    return {

        id,

        name:
            artistIndex >= 0
                ? excelString(
                    row[artistIndex]
                )
                : "",

        day,

        date:
            formatThaiDate(
                dateISO
            ),

        dateISO,

        stage,

        stageId,

        start,

        end,

        duration:
            calculateDuration(
                start,
                end
            )

    };

}


/* =========================================================
   STAGE ID NORMALIZER
========================================================= */

function normalizeStageIdValue(
    value
) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(
        value
    )
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
   VALIDATION
========================================================= */

function validateArtist(
    artist
) {

    return Boolean(

        artist &&

        Number.isSafeInteger(
            artist.id
        ) &&

        artist.id > 0 &&

        artist.name &&

        artist.dateISO &&

        artist.day &&

        artist.stage &&

        artist.stageId &&

        artist.start &&

        artist.end

    );

}


/* =========================================================
   FESTIVAL DAYS
========================================================= */

function createDayID(
    dateISO
) {

    return dateISO
        ? dateISO.replaceAll(
            "-",
            ""
        )
        : "";

}


function createFestivalDays(
    artists
) {

    const uniqueDays =
        new Map();


    artists.forEach(
        artist => {

            if (
                !artist.dateISO ||
                uniqueDays.has(
                    artist.dateISO
                )
            ) {

                return;

            }


            uniqueDays.set(
                artist.dateISO,
                {

                    id:
                        createDayID(
                            artist.dateISO
                        ),

                    day:
                        artist.day ||
                        getThaiDay(
                            artist.dateISO
                        ),

                    date:
                        formatThaiDate(
                            artist.dateISO
                        ),

                    dateISO:
                        artist.dateISO

                }
            );

        }
    );


    return Array.from(
        uniqueDays.values()
    )
        .sort(
            (
                a,
                b
            ) =>
                a.dateISO.localeCompare(
                    b.dateISO
                )
        );

}


/* =========================================================
   LOAD ARTIST DATA
========================================================= */

async function loadArtistData() {

    console.log(
        "📊 Loading MelodyOfLife17Lineup.xlsx..."
    );


    try {

        const XLSX =
            await loadSheetJS();


        const response =
            await fetch(
                ARTIST_EXCEL_FILE,
                {
                    cache:
                        "no-store"
                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                `ไม่พบไฟล์ Excel: ${ARTIST_EXCEL_FILE}`
            );

        }


        const arrayBuffer =
            await response.arrayBuffer();


        const workbook =
            XLSX.read(
                arrayBuffer,
                {

                    type:
                        "array",

                    cellDates:
                        false,

                    cellNF:
                        false,

                    cellText:
                        false

                }
            );


        const sheetName =
            workbook.SheetNames[0];


        if (
            !sheetName
        ) {

            throw new Error(
                "ไม่พบ Sheet ในไฟล์ Excel"
            );

        }


        const worksheet =
            workbook.Sheets[
            sheetName
            ];


        const rows =
            XLSX.utils.sheet_to_json(
                worksheet,
                {

                    header:
                        1,

                    defval:
                        "",

                    raw:
                        true

                }
            );


        if (
            !rows.length
        ) {

            throw new Error(
                "Excel ไม่มีข้อมูล"
            );

        }


        const headerMap =
            createHeaderMap(
                rows[0]
            );


        const requiredColumns = {

            ID:
                findColumn(
                    headerMap,
                    [
                        "ID",
                        "Id",
                        "id"
                    ]
                ),

            Artist:
                findColumn(
                    headerMap,
                    [
                        "Artist",
                        "Name",
                        "ศิลปิน"
                    ]
                ),

            Date:
                findColumn(
                    headerMap,
                    [
                        "Date",
                        "วันที่"
                    ]
                ),

            Day:
                findColumn(
                    headerMap,
                    [
                        "Day",
                        "วัน"
                    ]
                ),

            Stage:
                findColumn(
                    headerMap,
                    [
                        "Stage",
                        "เวที"
                    ]
                ),

            StageID:
                findColumn(
                    headerMap,
                    [
                        "StageID",
                        "Stage ID",
                        "Stage_Id",
                        "รหัสเวที"
                    ]
                ),

            Start:
                findColumn(
                    headerMap,
                    [
                        "Start",
                        "เริ่ม",
                        "เวลาเริ่ม"
                    ]
                ),

            End:
                findColumn(
                    headerMap,
                    [
                        "End",
                        "จบ",
                        "เวลาจบ"
                    ]
                )

        };


        const missingColumns =
            Object.entries(
                requiredColumns
            )
                .filter(
                    ([, index]) =>
                        index < 0
                )
                .map(
                    ([name]) =>
                        name
                );


        if (
            missingColumns.length
        ) {

            throw new Error(
                `Excel ขาด Column: ${missingColumns.join(", ")}`
            );

        }


        const convertedArtists =
            [];


        const ids =
            new Set();


        for (
            let i = 1;
            i < rows.length;
            i++
        ) {

            const row =
                rows[i];


            if (
                !row ||
                row.every(
                    value =>
                        value === "" ||
                        value === null ||
                        value === undefined
                )
            ) {

                continue;

            }


            const artist =
                convertExcelRow(
                    row,
                    headerMap,
                    XLSX
                );


            if (
                !validateArtist(
                    artist
                )
            ) {

                console.warn(
                    "⚠️ ข้ามข้อมูล Artist ที่ไม่ครบ:",
                    row
                );

                continue;

            }


            if (
                ids.has(
                    artist.id
                )
            ) {

                console.error(
                    "❌ Artist ID ซ้ำ:",
                    artist.id,
                    artist
                );

                throw new Error(
                    `พบ Artist ID ซ้ำ: ${artist.id}`
                );

            }


            ids.add(
                artist.id
            );


            convertedArtists.push(
                artist
            );

        }


        if (
            !convertedArtists.length
        ) {

            throw new Error(
                "Excel ไม่มี Artist Data ที่ถูกต้อง"
            );

        }


        convertedArtists.sort(
            (
                a,
                b
            ) =>

                a.dateISO.localeCompare(
                    b.dateISO
                ) ||

                a.start.localeCompare(
                    b.start
                ) ||

                a.stageId.localeCompare(
                    b.stageId
                ) ||

                a.id -
                b.id

        );


        artistData =
            convertedArtists;


        festivalDays =
            createFestivalDays(
                artistData
            );


        if (
            Array.isArray(
                ALLOWED_DATES
            )
        ) {

            ALLOWED_DATES =
                festivalDays.map(
                    day =>
                        day.dateISO
                );

        }


        console.log(
            "✅ Excel loaded successfully"
        );


        console.log(
            "📄 Sheet:",
            sheetName
        );


        console.log(
            "🎤 Artists:",
            artistData.length
        );


        console.log(
            "📅 Festival Days:",
            festivalDays
        );


        console.table(
            artistData.map(
                artist => ({

                    ID:
                        artist.id,

                    Artist:
                        artist.name,

                    Date:
                        artist.date,

                    DateISO:
                        artist.dateISO,

                    Day:
                        artist.day,

                    Stage:
                        artist.stage,

                    StageID:
                        artist.stageId,

                    Start:
                        artist.start,

                    End:
                        artist.end

                })
            )
        );


        window.dispatchEvent(
            new CustomEvent(
                "artistDataLoaded",
                {

                    detail: {

                        artistData,

                        festivalDays

                    }

                }
            )
        );


        return artistData;

    }
    catch (
    error
    ) {

        console.error(
            "❌ Failed to load artist data:",
            error
        );


        window.dispatchEvent(
            new CustomEvent(
                "artistDataError",
                {

                    detail:
                        error

                }
            )
        );


        throw error;

    }

}


/* =========================================================
   GLOBAL API
========================================================= */

console.log(
    "📊 artistData.js loaded"
);


window.artistDataReady =
    loadArtistData();


window.getArtistData =
    () =>
        artistData;


window.getFestivalDays =
    () =>
        festivalDays;


window.artistDataReady
    .then(
        data =>
            console.log(
                "✅ artistDataReady:",
                data.length,
                "artists"
            )
    )
    .catch(
        error =>
            console.error(
                "❌ artistDataReady failed:",
                error
            )
    );