/* =========================================================
   Melody Of Life 17 Planner
   ui/schedule.js
   ========================================================= */


/* =========================================================
   SCHEDULE DAY COLOR
========================================================= */

function getScheduleDayColor(
    dateISO
) {

    return getDayColor(
        dateISO
    );

}


/* =========================================================
   GET FILTERED / SORTED SCHEDULE
========================================================= */

function getScheduleArtists() {

    return getFilteredArtists(
        getSelectedArtists()
    )
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

}


/* =========================================================
   SCHEDULE STRUCTURE SIGNATURE
   ใช้เฉพาะตรวจ "โครงสร้างตาราง"

   ห้ามใส่:
   - Status
   - Progress
   - Countdown
========================================================= */

function createScheduleStructureSignature(
    artists
) {

    if (
        !Array.isArray(
            artists
        )
    ) {

        return "";

    }


    return artists
        .map(
            artist =>
                [

                    artist.id,

                    artist.name,

                    artist.dateISO,

                    artist.day,

                    artist.date,

                    artist.start,

                    artist.end,

                    artist.stageId,

                    artist.stage

                ].join(":")
        )
        .join("|");

}


/* =========================================================
   GET ROW
========================================================= */

function getScheduleRowById(
    body,
    artistId
) {

    if (
        !body
    ) {

        return null;

    }


    return body.querySelector(
        `tr[data-artist-id="${artistId}"]`
    ) || null;

}


/* =========================================================
   CREATE ROW
========================================================= */

function createScheduleRow(
    artist
) {

    const artistId =
        Number(
            artist.id
        );


    const stageId =
        normalizeStageId(
            artist.stageId
        );


    /*
     * Excel.Stage = display name
     */

    const stageName =
        String(
            artist.stage ||
            getStageName(
                stageId
            ) ||
            `Stage ${stageId}`
        ).trim();


    const dayColor =
        getScheduleDayColor(
            artist.dateISO
        );


    const row =
        document.createElement(
            "tr"
        );


    row.dataset.artistId =
        String(
            artistId
        );


    /*
     * เก็บข้อมูลโครงสร้าง
     */

    row.dataset.date =
        artist.dateISO ||
        "";

    row.dataset.start =
        artist.start ||
        "";

    row.dataset.end =
        artist.end ||
        "";

    row.dataset.stageId =
        stageId;

    row.dataset.status =
        "";

    row.dataset.statusUrgent =
        "0";

    row.dataset.progress =
        "-1";


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


<td class="schedule-time-cell">

    <span class="schedule-start">
        ${escapeHTML(
            artist.start
        )}
    </span>

    -

    <span class="schedule-end">
        ${escapeHTML(
            artist.end
        )}
    </span>

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
            stageName
        )}

    </span>

</td>


<td>

    <span class="schedule-status"></span>

</td>


<td>

    <div
        class="progress"
        aria-label="Progress"
    >

        <div
            class="progress-bar"
        ></div>

    </div>

</td>

`;


    /*
     * Stage Color
     */

    const stageElement =
        row.querySelector(
            ".schedule-stage"
        );


    if (
        stageElement
    ) {

        applyStageColor(
            stageElement,
            stageId,
            {
                color:
                    true,

                border:
                    false
            }
        );

    }


    return row;

}


/* =========================================================
   UPDATE STATUS
   เปลี่ยนเฉพาะเมื่อ State เปลี่ยนจริง
========================================================= */

function updateScheduleStatus(
    row,
    artist
) {

    const element =
        row.querySelector(
            ".schedule-status"
        );


    if (
        !element
    ) {

        return;

    }


    const status =
        getArtistStatus(
            artist
        );


    const previousStatus =
        row.dataset.status ||
        "";


    /*
     * LIVE / NEXT / ENDED
     * ถ้า State เหมือนเดิม ห้ามแตะ DOM
     */

    if (
        previousStatus ===
        status
    ) {

        return;

    }


    row.dataset.status =
        status;


    /*
     * LIVE
     */

    if (
        status ===
        "LIVE"
    ) {

        element.innerHTML = `

<span class="status-live">

    <span
        class="live-dot"
        aria-hidden="true"
    ></span>

    LIVE

</span>

`;

        return;

    }


    /*
     * NEXT
     */

    if (
        status ===
        "NEXT"
    ) {

        const urgent =
            typeof isArtistNextUrgent ===
            "function"

                ? Boolean(
                    isArtistNextUrgent(
                        artist
                    )
                )

                : false;


        row.dataset.statusUrgent =
            urgent
                ? "1"
                : "0";


        element.innerHTML = `

<span
    class="status-next${
        urgent
            ? " is-urgent"
            : ""
    }"
>

    🟡 NEXT

</span>

`;

        return;

    }


    /*
     * ENDED
     */

    row.dataset.statusUrgent =
        "0";


    element.innerHTML = `

<span class="status-ended">

    ⚪ ENDED

</span>

`;

}


/* =========================================================
   UPDATE STATUS URGENT
   กรณี NEXT เหมือนเดิม แต่เข้า 5 นาทีสุดท้าย
========================================================= */

function updateScheduleStatusUrgent(
    row,
    artist
) {

    if (
        getArtistStatus(
            artist
        ) !==
        "NEXT"
    ) {

        return;

    }


    const statusElement =
        row.querySelector(
            ".status-next"
        );


    if (
        !statusElement
    ) {

        return;

    }


    const urgent =
        typeof isArtistNextUrgent ===
        "function"

            ? Boolean(
                isArtistNextUrgent(
                    artist
                )
            )

            : false;


    const previous =
        row.dataset.statusUrgent ===
        "1";


    if (
        previous ===
        urgent
    ) {

        return;

    }


    row.dataset.statusUrgent =
        urgent
            ? "1"
            : "0";


    statusElement.classList.toggle(
        "is-urgent",
        urgent
    );

}


/* =========================================================
   UPDATE PROGRESS
   เขียนเฉพาะเมื่อค่าที่แสดงเปลี่ยน
========================================================= */

function updateScheduleProgress(
    row,
    artist
) {

    const progressBar =
        row.querySelector(
            ".progress-bar"
        );


    if (
        !progressBar
    ) {

        return;

    }


    const progress =
        Math.round(
            getProgressPercent(
                artist
            )
        );


    const previous =
        Number(
            row.dataset.progress ||
            -1
        );


    if (
        previous ===
        progress
    ) {

        return;

    }


    row.dataset.progress =
        String(
            progress
        );


    progressBar.style.width =
        `${progress}%`;

}


/* =========================================================
   UPDATE ONE ROW REALTIME
========================================================= */

function updateScheduleRowRealtime(
    row,
    artist
) {

    if (
        !row ||
        !artist
    ) {

        return;

    }


    updateScheduleStatus(
        row,
        artist
    );


    updateScheduleStatusUrgent(
        row,
        artist
    );


    updateScheduleProgress(
        row,
        artist
    );

}


/* =========================================================
   RENDER STRUCTURE
   สร้าง <tr> ใหม่เฉพาะเมื่อโครงสร้างเปลี่ยน
========================================================= */

function renderScheduleStructure(
    body,
    artists
) {

    body.innerHTML =
        "";


    const fragment =
        document.createDocumentFragment();


    artists.forEach(
        artist => {

            const row =
                createScheduleRow(
                    artist
                );


            fragment.appendChild(
                row
            );

        }
    );


    body.appendChild(
        fragment
    );

}


/* =========================================================
   RENDER EMPTY
========================================================= */

function renderScheduleEmpty(
    body
) {

    body.innerHTML = `

<tr class="schedule-empty-row">

    <td
        colspan="6"
        class="empty-table"
    >

        ยังไม่ได้เลือกศิลปิน

    </td>

</tr>

`;

}


/* =========================================================
   RENDER SCHEDULE
   ---------------------------------------------------------
   ใช้ตอน:
   - โหลดครั้งแรก
   - Filter เปลี่ยน
   - Selection เปลี่ยน
   - Data เปลี่ยน
========================================================= */

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
        getScheduleArtists();


    const signature =
        createScheduleStructureSignature(
            artists
        );


    /*
     * ไม่มีข้อมูล
     */

    if (
        artists.length ===
        0
    ) {

        if (
            body.querySelector(
                ".schedule-empty-row"
            )
        ) {

            updateSelectionMessage();

            return;

        }


        renderScheduleEmpty(
            body
        );


        RENDER_STATE.lastScheduleSignature =
            signature;


        updateSelectionMessage();

        return;

    }


    /*
     * ตรวจโครงสร้าง
     */

    const structureChanged =
        force ||
        signature !==
            RENDER_STATE.lastScheduleSignature;


    if (
        structureChanged
    ) {

        RENDER_STATE.lastScheduleSignature =
            signature;


        renderScheduleStructure(
            body,
            artists
        );

    }


    /*
     * Initial state update
     */

    artists.forEach(
        artist => {

            const row =
                getScheduleRowById(
                    body,
                    Number(
                        artist.id
                    )
                );


            if (
                !row
            ) {

                return;

            }


            updateScheduleRowRealtime(
                row,
                artist
            );

        }
    );


    updateSelectionMessage();

}


/* =========================================================
   REALTIME SCHEDULE UPDATE
   ---------------------------------------------------------
   CRITICAL:
   ห้ามเรียก renderSchedule()
   ห้ามสร้าง <tr> ใหม่
   ห้ามแก้ innerHTML ของ table/body

   อัปเดตเฉพาะ:
   - LIVE / NEXT / ENDED
   - NEXT urgent
   - Progress
========================================================= */

function updateScheduleRealtime() {

    const body =
        $("#scheduleBody");


    if (
        !body
    ) {

        return;

    }


    /*
     * ถ้าไม่มีตารางจริง
     * ไม่ต้องสร้างใหม่จาก realtime
     */

    if (
        body.querySelector(
            ".schedule-empty-row"
        )
    ) {

        return;

    }


    const artists =
        getScheduleArtists();


    if (
        artists.length ===
        0
    ) {

        return;

    }


    /*
     * Update เฉพาะ Row ที่มีอยู่แล้ว
     */

    artists.forEach(
        artist => {

            const row =
                getScheduleRowById(
                    body,
                    Number(
                        artist.id
                    )
                );


            if (
                !row
            ) {

                return;

            }


            updateScheduleRowRealtime(
                row,
                artist
            );

        }
    );

}


/* =========================================================
   SELECTION MESSAGE
   ---------------------------------------------------------
   ไม่ต้องเขียน DOM ซ้ำถ้าข้อความเดิม
========================================================= */

function updateSelectionMessage() {

    const message =
        $("#selectionMessage");


    if (
        !message
    ) {

        return;

    }


    const selectedArtists =
        getSelectedArtists();


    const visibleSelectedArtists =
        getFilteredArtists(
            selectedArtists
        );


    const count =
        visibleSelectedArtists.length;


    const text =
        count > 0
            ? `เลือกแล้ว ${count} ศิลปิน`
            : "ยังไม่ได้เลือกศิลปิน";


    if (
        message.textContent !==
        text
    ) {

        message.textContent =
            text;

    }

}