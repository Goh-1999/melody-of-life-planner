/* =========================================================
   Melody Of Life 17 Planner
   ui/artists.js

   Realtime-safe Artist Card
   ---------------------------------------------------------
   IMPORTANT
   - Do not rebuild Artist Cards every second
   - Do not touch hovered Card DOM
   - Update only changed realtime values
   - Keep hover stable
   - LIVE -> ENDED must update immediately
========================================================= */


/* =========================================================
   ARTIST SIGNATURE
   ---------------------------------------------------------
   ใช้ตรวจว่า "โครงสร้าง Lineup" เปลี่ยนหรือไม่
========================================================= */

function createArtistSignature(
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
                    artist.stage,

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
   GET CARD
========================================================= */

function getArtistCardById(
    container,
    artistId
) {

    if (
        !container
    ) {

        return null;

    }


    return container.querySelector(
        `.artist-select-button[data-id="${artistId}"]`
    )?.closest(
        ".artist-card"
    ) || null;

}


/* =========================================================
   NEXT URGENT
========================================================= */

function getArtistNextUrgentState(
    artist
) {

    if (
        typeof isArtistNextUrgent ===
        "function"
    ) {

        return Boolean(
            isArtistNextUrgent(
                artist
            )
        );

    }


    return false;

}


/* =========================================================
   CREATE ARTIST CARD
========================================================= */

function createArtistCard(
    artist
) {

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
        Math.round(
            getProgressPercent(
                artist
            )
        );


    const stageId =
        normalizeStageId(
            artist.stageId
        );


    const stageName =
        String(
            artist.stage || ""
        ).trim() ||
        getStageName(
            stageId
        );


    const stageColor =
        getStageColor(
            stageId
        );


    const countdown =
        getArtistCountdown(
            artist
        );


    const urgent =
        getArtistNextUrgentState(
            artist
        );


    const artistName =
        String(
            artist.name ||
            ""
        ).trim();


    const artistNameLength =
        artistName.length;


    const artistNameClass =
        artistNameLength >= 34
            ? "artist-name-very-long"
            : artistNameLength >= 22
                ? "artist-name-long"
                : "artist-name-normal";


    const card =
        document.createElement(
            "article"
        );


    /* =====================================================
       CARD CLASS
    ===================================================== */

    card.className =
        [
            "artist-card",

            selected
                ? "is-selected"
                : "",

            status === "LIVE"
                ? "is-live"
                : "",

            status === "ENDED"
                ? "is-ended"
                : ""

        ]
            .filter(Boolean)
            .join(" ");


    /* =====================================================
       STAGE COLOR
    ===================================================== */

    if (
        stageColor
    ) {

        card.style.setProperty(
            "--stage-color",
            stageColor
        );

    }


    /* =====================================================
       INTERNAL STATE
    ===================================================== */

    card.dataset.status =
        status;


    card.dataset.statusUrgent =
        urgent
            ? "1"
            : "0";


    card.dataset.selected =
        selected
            ? "1"
            : "0";


    card.dataset.countdownType =
        countdown?.type ||
        "";


    card.dataset.progress =
        String(
            progress
        );


    /* =====================================================
       REALTIME SNAPSHOT
    ===================================================== */

    card._artistRealtime = {

        status:
            status,

        urgent:
            urgent,

        selected:
            selected,

        progress:
            progress,

        countdownType:
            countdown?.type ||
            "",

        countdownText:
            countdown?.text ||
            ""

    };


    /* =====================================================
       HOVER STATE
       -----------------------------------------------------
       ใช้ล็อก Card ระหว่าง Hover
    ===================================================== */

    card._artistHovered =
        false;


    /* =====================================================
       HTML
    ===================================================== */

    card.innerHTML = `

<div class="artist-card-top">

    <span class="artist-stage">
        ${escapeHTML(
        stageName
    )}
    </span>

    ${getStatusHTML(
        artist
    )}

</div>


<h3 class="
    artist-name-full
    ${artistNameClass}
">
    ${escapeHTML(
        artistName
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
    class="
        artist-select-button
        ${selected
            ? "is-selected"
            : ""
        }
        ${status === "ENDED"
            ? "is-ended"
            : ""
        }
    "
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


    /* =====================================================
       CACHE DOM REFERENCES
    ===================================================== */

    card._artistUI = {

        statusWrapper:
            card.querySelector(
                ".artist-card-top"
            ),

        statusElement:
            card.querySelector(
                ".status-live, " +
                ".status-next, " +
                ".status-ended"
            ),

        countdownElement:
            card.querySelector(
                ".artist-countdown"
            ),

        progressBar:
            card.querySelector(
                ".progress-bar"
            ),

        selectButton:
            card.querySelector(
                ".artist-select-button"
            )

    };


    /* =====================================================
       STAGE PRESENTATION
    ===================================================== */

    applyStageColor(
        card.querySelector(
            ".artist-stage"
        ),
        stageId,
        {
            color:
                true,

            border:
                true
        }
    );


    /* =====================================================
       HOVER PROTECTION
       -----------------------------------------------------
       ระหว่าง Hover:
       - ไม่ Realtime Update

       EXCEPTION:
       - LIVE -> ENDED
       - ต้องอัปเดตทันที
    ===================================================== */

    card.addEventListener(
        "mouseenter",
        () => {

            card._artistHovered =
                true;

            card.classList.add(
                "is-hovered"
            );

        }
    );


    card.addEventListener(
        "mouseleave",
        () => {

            card._artistHovered =
                false;

            card.classList.remove(
                "is-hovered"
            );


            requestAnimationFrame(
                () => {

                    if (
                        !card.isConnected
                    ) {

                        return;

                    }


                    updateArtistCardRealtime(
                        card,
                        artist
                    );

                }
            );

        }
    );


    /* =====================================================
       SELECT BUTTON
    ===================================================== */

    const selectButton =
        card._artistUI.selectButton;


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


    return card;

}


/* =========================================================
   EQUALIZE ARTIST CARD HEIGHT
   ---------------------------------------------------------
   ทำให้ Card Artist ทุกใบสูงเท่ากัน
========================================================= */

function equalizeArtistCardHeights() {

    const container =
        $("#artistGrid");


    if (
        !container
    ) {

        return;

    }


    const cards =
        Array.from(
            container.querySelectorAll(
                ".artist-card"
            )
        );


    if (
        cards.length ===
        0
    ) {

        return;

    }


    cards.forEach(
        card => {

            card.style.height =
                "auto";

        }
    );


    let maxHeight =
        0;


    cards.forEach(
        card => {

            const height =
                card.getBoundingClientRect()
                    .height;


            if (
                height >
                maxHeight
            ) {

                maxHeight =
                    height;

            }

        }
    );


    if (
        maxHeight <= 0
    ) {

        return;

    }


    cards.forEach(
        card => {

            card.style.height =
                `${Math.ceil(maxHeight)}px`;

        }
    );

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


    /* =====================================================
       SIGNATURE CHECK
       -----------------------------------------------------
       ถ้า Lineup ไม่เปลี่ยน
       ห้ามแตะ Grid DOM
    ===================================================== */

    if (
        !force &&
        signature ===
        RENDER_STATE.lastArtistSignature
    ) {

        return;

    }


    RENDER_STATE.lastArtistSignature =
        signature;


    /* =====================================================
       REBUILD
       -----------------------------------------------------
       ใช้เฉพาะ Initial Render / Filter / User Action
       ไม่ใช้ใน Realtime Loop
    ===================================================== */

    container.innerHTML =
        "";


    /* =====================================================
       EMPTY
    ===================================================== */

    if (
        artists.length ===
        0
    ) {

        container.innerHTML = `
<div class="empty-state">
    ไม่มีศิลปินตามตัวกรอง
</div>
`;

        return;

    }


    /* =====================================================
       BUILD
    ===================================================== */

    const fragment =
        document.createDocumentFragment();


    artists.forEach(
        artist => {

            const card =
                createArtistCard(
                    artist
                );


            if (
                card
            ) {

                fragment.appendChild(
                    card
                );

            }

        }
    );


    container.appendChild(
        fragment
    );


    equalizeArtistCardHeights();

}


/* =========================================================
   UPDATE STATUS
========================================================= */

function updateArtistStatusElement(
    card,
    artist
) {

    if (
        !card ||
        !artist
    ) {

        return;

    }


    const ui =
        card._artistUI;


    if (
        !ui
    ) {

        return;

    }


    const status =
        getArtistStatus(
            artist
        );


    const urgent =
        getArtistNextUrgentState(
            artist
        );


    const previousStatus =
        card.dataset.status ||
        "";


    const previousUrgent =
        card.dataset.statusUrgent ===
        "1";


    if (
        previousStatus ===
        status &&
        previousUrgent ===
        urgent
    ) {

        return;

    }


    let statusElement =
        ui.statusElement;


    /*
     * ถ้า Status Element เดิมหาย
     * ให้สร้างใหม่เฉพาะกรณีจำเป็นจริง ๆ
     */

    if (
        !statusElement &&
        ui.statusWrapper
    ) {

        statusElement =
            document.createElement(
                "span"
            );


        ui.statusWrapper.appendChild(
            statusElement
        );


        ui.statusElement =
            statusElement;

    }


    if (
        !statusElement
    ) {

        return;

    }


    /* =====================================================
       LIVE
    ===================================================== */

    if (
        status ===
        "LIVE"
    ) {

        const nextClass =
            "status-live";


        if (
            statusElement.className !==
            nextClass
        ) {

            statusElement.className =
                nextClass;

        }


        if (
            !statusElement.querySelector(
                ".artist-status-text"
            )
        ) {

            statusElement.innerHTML = `
<span
    class="live-dot"
    aria-hidden="true"
></span>

<span class="artist-status-text">
    LIVE
</span>
`;

        }

    }


    /* =====================================================
       NEXT
    ===================================================== */

    else if (
        status ===
        "NEXT"
    ) {

        const nextClass =
            urgent
                ? "status-next is-urgent"
                : "status-next";


        if (
            statusElement.className !==
            nextClass
        ) {

            statusElement.className =
                nextClass;

        }


        if (
            statusElement.textContent !==
            "🟡 NEXT"
        ) {

            statusElement.textContent =
                "🟡 NEXT";

        }

    }


    /* =====================================================
       ENDED
    ===================================================== */

    else {

        const nextClass =
            "status-ended";


        if (
            statusElement.className !==
            nextClass
        ) {

            statusElement.className =
                nextClass;

        }


        if (
            statusElement.textContent !==
            "⚪ ENDED"
        ) {

            statusElement.textContent =
                "⚪ ENDED";

        }

    }


    /* =====================================================
       SAVE CURRENT STATUS
    ===================================================== */

    card.dataset.status =
        status;


    card.dataset.statusUrgent =
        urgent
            ? "1"
            : "0";


    if (
        card._artistRealtime
    ) {

        card._artistRealtime.status =
            status;

        card._artistRealtime.urgent =
            urgent;

    }

}


/* =========================================================
   UPDATE CARD STATE
========================================================= */

function updateArtistCardState(
    card,
    artist
) {

    if (
        !card ||
        !artist
    ) {

        return;

    }


    const status =
        getArtistStatus(
            artist
        );


    const selected =
        selectedArtistIds.includes(
            Number(
                artist.id
            )
        );


    const shouldLive =
        status ===
        "LIVE";


    const shouldEnded =
        status ===
        "ENDED";


    /* =====================================================
       LIVE CLASS
    ===================================================== */

    if (
        card.classList.contains(
            "is-live"
        ) !==
        shouldLive
    ) {

        card.classList.toggle(
            "is-live",
            shouldLive
        );

    }


    /* =====================================================
       ENDED CLASS
    ===================================================== */

    if (
        card.classList.contains(
            "is-ended"
        ) !==
        shouldEnded
    ) {

        card.classList.toggle(
            "is-ended",
            shouldEnded
        );

    }


    /* =====================================================
       SELECTED CLASS
    ===================================================== */

    if (
        card.classList.contains(
            "is-selected"
        ) !==
        selected
    ) {

        card.classList.toggle(
            "is-selected",
            selected
        );

    }


    /*
     * IMPORTANT
     * ไม่เขียน dataset.status ที่นี่
     *
     * updateArtistStatusElement()
     * เป็นเจ้าของ status state
     */

}


/* =========================================================
   UPDATE COUNTDOWN
========================================================= */

function updateArtistCountdownElement(
    card,
    artist
) {

    if (
        !card ||
        !artist
    ) {

        return;

    }


    const element =
        card._artistUI?.countdownElement;


    if (
        !element
    ) {

        return;

    }


    const countdown =
        getArtistCountdown(
            artist
        );


    if (
        !countdown
    ) {

        return;

    }


    const icon =
        countdown.type ===
            "start"

            ? "⏳"

            : countdown.type ===
                "ending"

                ? "🔥"

                : countdown.type ===
                    "live"

                    ? "🎵"

                    : countdown.type ===
                        "ended"

                        ? "✓"

                        : "🕐";


    const nextText =
        `${icon} ${countdown.text || ""}`;


    const nextType =
        countdown.type ||
        "";


    const currentType =
        card.dataset.countdownType ||
        "";


    if (
        currentType ===
        nextType &&
        element.textContent ===
        nextText
    ) {

        return;

    }


    card.dataset.countdownType =
        nextType;


    element.classList.toggle(
        "is-urgent",
        nextType ===
        "start"
    );


    element.classList.toggle(
        "is-ending",
        nextType ===
        "ending"
    );


    element.classList.toggle(
        "is-ended",
        nextType ===
        "ended"
    );


    element.textContent =
        nextText;


    if (
        card._artistRealtime
    ) {

        card._artistRealtime.countdownType =
            nextType;

        card._artistRealtime.countdownText =
            countdown.text ||
            "";

    }

}


/* =========================================================
   UPDATE PROGRESS
========================================================= */

function updateArtistProgress(
    card,
    artist
) {

    if (
        !card ||
        !artist
    ) {

        return;

    }


    const progressBar =
        card._artistUI?.progressBar;


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
            card.dataset.progress ||
            -1
        );


    if (
        previous ===
        progress
    ) {

        return;

    }


    card.dataset.progress =
        String(
            progress
        );


    progressBar.style.width =
        `${progress}%`;


    if (
        card._artistRealtime
    ) {

        card._artistRealtime.progress =
            progress;

    }

}


/* =========================================================
   UPDATE BUTTON
========================================================= */

function updateArtistButton(
    card,
    artist
) {

    if (
        !card ||
        !artist
    ) {

        return;

    }


    const button =
        card._artistUI?.selectButton;


    if (
        !button
    ) {

        return;

    }


    const artistId =
        Number(
            artist.id
        );


    const status =
        getArtistStatus(
            artist
        );


    const selected =
        selectedArtistIds.includes(
            artistId
        );


    /* =====================================================
       SELECTED
    ===================================================== */

    const currentSelected =
        button.classList.contains(
            "is-selected"
        );


    if (
        currentSelected !==
        selected
    ) {

        button.classList.toggle(
            "is-selected",
            selected
        );

    }


    /* =====================================================
       ENDED
    ===================================================== */

    const shouldBeEnded =
        status ===
        "ENDED";


    const currentEnded =
        button.classList.contains(
            "is-ended"
        );


    if (
        currentEnded !==
        shouldBeEnded
    ) {

        button.classList.toggle(
            "is-ended",
            shouldBeEnded
        );

    }


    /* =====================================================
       TEXT
    ===================================================== */

    const nextText =
        selected

            ? "✓ เลือกแล้ว"

            : shouldBeEnded

                ? "การแสดงจบแล้ว"

                : "เลือกศิลปิน";


    if (
        button.textContent.trim() !==
        nextText
    ) {

        button.textContent =
            nextText;

    }


    if (
        card._artistRealtime
    ) {

        card._artistRealtime.selected =
            selected;

    }

}


/* =========================================================
   UPDATE ONE ARTIST CARD
   ---------------------------------------------------------
   จุดศูนย์กลางของ Realtime Update

   IMPORTANT
   - ไม่ rebuild Card
   - ไม่ rebuild Grid
   - ไม่เปลี่ยนชื่อศิลปิน
   - ไม่เปลี่ยนวันที่
   - Hover ยังคงนิ่ง
   - LIVE -> ENDED อัปเดตได้ทันที
========================================================= */

function updateArtistCardRealtime(
    card,
    artist
) {

    if (
        !card ||
        !artist
    ) {

        return;

    }


    /* =====================================================
       CURRENT STATUS
    ===================================================== */

    const status =
        getArtistStatus(
            artist
        );


    const previousStatus =
        card.dataset.status ||
        "";


    /* =====================================================
       HOVER LOCK
       -----------------------------------------------------
       ปกติ:
       - ไม่แตะ DOM ระหว่าง Hover

       Exception:
       - LIVE -> ENDED
       - อัปเดตทันที
    ===================================================== */

    const isHovered =
        card._artistHovered ||
        card.matches(
            ":hover"
        );


    const shouldForceEndedUpdate =
        status ===
        "ENDED" &&

        previousStatus !==
        "ENDED";


    if (
        isHovered &&
        !shouldForceEndedUpdate
    ) {

        return;

    }


    /* =====================================================
       STATUS FIRST
       -----------------------------------------------------
       สำคัญมาก:
       ต้องอัปเดต Status ก่อน
       เพราะ updateArtistStatusElement()
       เป็นเจ้าของ dataset.status
    ===================================================== */

    updateArtistStatusElement(
        card,
        artist
    );


    /* =====================================================
       CARD STATE
    ===================================================== */

    updateArtistCardState(
        card,
        artist
    );


    /* =====================================================
       COUNTDOWN
    ===================================================== */

    updateArtistCountdownElement(
        card,
        artist
    );


    /* =====================================================
       PROGRESS
    ===================================================== */

    updateArtistProgress(
        card,
        artist
    );


    /* =====================================================
       BUTTON
    ===================================================== */

    updateArtistButton(
        card,
        artist
    );

}


/* =========================================================
   REALTIME UPDATE
   ---------------------------------------------------------
   IMPORTANT

   Card ที่กำลัง Hover:
   - ไม่แตะ DOM
   - ไม่เปลี่ยน class
   - ไม่เปลี่ยน text
   - ไม่เปลี่ยน progress

   EXCEPTION:
   - LIVE -> ENDED
   - ต้องอัปเดตทันที
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


    if (
        !Array.isArray(
            artists
        )
    ) {

        return;

    }


    artists.forEach(
        artist => {

            const artistId =
                Number(
                    artist.id
                );


            const card =
                getArtistCardById(
                    container,
                    artistId
                );


            if (
                !card
            ) {

                return;

            }


            /* =================================================
               CURRENT STATUS
            ================================================= */

            const status =
                getArtistStatus(
                    artist
                );


            const previousStatus =
                card.dataset.status ||
                "";


            /* =================================================
               HOVER STATE
            ================================================= */

            const isHovered =
                card._artistHovered ||
                card.matches(
                    ":hover"
                );


            /* =================================================
               FORCE ENDED
               -------------------------------------------------
               LIVE -> ENDED
               ต้องไม่ถูก Hover Lock
            ================================================= */

            const shouldForceEndedUpdate =
                status ===
                "ENDED" &&

                previousStatus !==
                "ENDED";


            /* =================================================
               HOVER LOCK
            ================================================= */

            if (
                isHovered &&
                !shouldForceEndedUpdate
            ) {

                return;

            }


            /* =================================================
               REALTIME UPDATE
            ================================================= */

            updateArtistCardRealtime(
                card,
                artist
            );

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
        Number(
            id
        );


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
        index >=
        0
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


    /*
     * User Action:
     * rebuild Lineup ครั้งเดียว
     */

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
   CLEAR SELECTION
========================================================= */

function clearSelection() {

    if (
        selectedArtistIds.length ===
        0
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
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        equalizeArtistCardHeights();

    }
);