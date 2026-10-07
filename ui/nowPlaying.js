/* =========================================================
   Melody Of Life 17 Planner
   ui/nowPlaying.js

   Responsibilities:
   - Now Playing structure
   - Stage / Artist state
   - LIVE / NEXT / END
   - Countdown
   - Progress
   - Realtime DOM update

   Font / Responsive:
   - CSS controls all typography
   - No inline font styles
   - No font probing / synchronization
========================================================= */


/* =========================================================
   NEXT ARTIST
========================================================= */

function getNextArtist(artists) {

    if (!Array.isArray(artists)) {
        return null;
    }

    return (
        [...artists]
            .filter(
                artist =>
                    getArtistStatus(artist) === "NEXT"
            )
            .sort(
                (a, b) =>
                    getArtistDateTime(
                        a,
                        a.start
                    ) -
                    getArtistDateTime(
                        b,
                        b.start
                    )
            )[0] || null
    );

}


/* =========================================================
   STAGE ARTISTS
========================================================= */

function getNowPlayingArtists(stageId) {

    const normalizedId =
        normalizeStageId(
            stageId
        );


    return getAllArtists().filter(
        artist => {

            if (!artist) {
                return false;
            }


            return (
                normalizeStageId(
                    artist.stageId
                ) === normalizedId &&

                artist.dateISO ===
                selectedDate
            );

        }
    );

}


/* =========================================================
   STAGE NAME
   Excel.Stage = Display Name
========================================================= */

function getNowPlayingStageName(
    stageId,
    artists = []
) {

    const normalizedId =
        normalizeStageId(
            stageId
        );


    const excelArtist =
        artists.find(
            artist =>
                normalizeStageId(
                    artist.stageId
                ) === normalizedId &&
                artist.stage
        );


    if (
        excelArtist?.stage
    ) {

        return String(
            excelArtist.stage
        ).trim();

    }


    const configName =
        getStageName(
            normalizedId
        );


    if (
        configName
    ) {

        return configName;

    }


    return (
        normalizedId
            ? `Stage ${normalizedId}`
            : "Stage"
    );

}


/* =========================================================
   NEXT URGENT
========================================================= */

function getNowPlayingNextUrgent(
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
   STRUCTURE SIGNATURE
========================================================= */

function createNowPlayingStructureSignature() {

    const stages =
        getStages();


    return [

        selectedDate,

        selectedStage,

        ...stages.map(
            stage => {

                const artists =
                    getNowPlayingArtists(
                        stage.id
                    );


                return [

                    normalizeStageId(
                        stage.id
                    ),

                    getNowPlayingStageName(
                        stage.id,
                        artists.length
                            ? artists
                            : getAllArtists()
                    ),

                    ...artists.map(
                        artist =>
                            [
                                artist.id,
                                artist.name,
                                artist.dateISO,
                                artist.start,
                                artist.end,
                                artist.stageId,
                                artist.stage
                            ].join(":")
                    )

                ].join("|");

            }
        )

    ].join("||");

}


/* =========================================================
   GET NOW CARD
========================================================= */

function getNowPlayingCard(
    container,
    stageId
) {

    if (
        !container
    ) {

        return null;

    }


    const normalizedId =
        normalizeStageId(
            stageId
        );


    return (
        container.querySelector(
            `.stage-now-card[data-stage-id="${normalizedId}"]`
        ) || null
    );

}


/* =========================================================
   CREATE NOW CARD
   ---------------------------------------------------------
   Cache DOM references.
   Realtime will use these references directly.
========================================================= */

function createStageNowCard(
    stageId
) {

    const normalized =
        normalizeStageId(
            stageId
        );


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "stage-now-card";


    card.dataset.stageId =
        normalized;


    /*
     * Internal state
     */

    card.dataset.status =
        "";

    card.dataset.urgent =
        "0";

    card.dataset.artistId =
        "";

    card.dataset.countdownType =
        "";

    card.dataset.progress =
        "-1";

    card.dataset.stageColorId =
        "";


    card.innerHTML = `

<div class="stage-now-header">

    <div class="stage-now-name">

        🎤

        <span
            class="stage-now-stage-name"
        ></span>

    </div>

    <div class="stage-now-state"></div>

</div>


<div class="stage-now-content">

    <div class="now-artist"></div>

    <div class="now-time"></div>

    <div class="now-countdown"></div>

</div>


<div class="now-progress">

    <div
        class="now-progress-bar"
    ></div>

</div>

`;


    /*
     * Cache DOM
     */

    card._nowUI = {

        stageName:
            card.querySelector(
                ".stage-now-stage-name"
            ),

        state:
            card.querySelector(
                ".stage-now-state"
            ),

        artist:
            card.querySelector(
                ".now-artist"
            ),

        time:
            card.querySelector(
                ".now-time"
            ),

        countdown:
            card.querySelector(
                ".now-countdown"
            ),

        progress:
            card.querySelector(
                ".now-progress"
            ),

        progressBar:
            card.querySelector(
                ".now-progress-bar"
            )

    };


    return card;

}


/* =========================================================
   UPDATE STAGE COLOR
========================================================= */

function updateNowPlayingStageColor(
    card,
    stageId
) {

    if (
        !card ||
        !card._nowUI
    ) {

        return;

    }


    const normalizedId =
        normalizeStageId(
            stageId
        );


    if (
        card.dataset.stageColorId ===
        normalizedId
    ) {

        return;

    }


    const element =
        card._nowUI.stageName;


    if (
        !element
    ) {

        return;

    }


    applyStageColor(
        element,
        normalizedId,
        {
            color:
                true,

            border:
                false
        }
    );


    card.dataset.stageColorId =
        normalizedId;

}


/* =========================================================
   UPDATE STATE
========================================================= */

function updateNowPlayingState(
    card,
    artist
) {

    if (
        !card ||
        !card._nowUI
    ) {

        return;

    }


    const stateElement =
        card._nowUI.state;


    if (
        !stateElement
    ) {

        return;

    }


    const status =
        artist
            ? getArtistStatus(
                artist
            )
            : "ENDED";


    const urgent =
        artist &&
            status === "NEXT"

            ? getNowPlayingNextUrgent(
                artist
            )

            : false;


    const previousStatus =
        card.dataset.status ||
        "";


    const previousUrgent =
        card.dataset.urgent ===
        "1";


    /*
     * ไม่มี State เปลี่ยน
     * ห้ามแตะ DOM
     */

    if (
        previousStatus ===
        status &&

        previousUrgent ===
        urgent
    ) {

        return;

    }


    card.dataset.status =
        status;


    card.dataset.urgent =
        urgent
            ? "1"
            : "0";


    /*
     * LIVE
     */

    if (
        status ===
        "LIVE"
    ) {

        stateElement.innerHTML = `

<span class="state-live">

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

        stateElement.innerHTML = `

<span
    class="state-next ${urgent
                ? "is-urgent"
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

    stateElement.innerHTML = `

<span class="state-ended">

    ⚪ END

</span>

`;

}


/* =========================================================
   UPDATE CONTENT
========================================================= */

function updateNowPlayingContent(
    card,
    artist
) {

    if (
        !card ||
        !card._nowUI
    ) {

        return;

    }


    const artistElement =
        card._nowUI.artist;


    const timeElement =
        card._nowUI.time;


    const countdownElement =
        card._nowUI.countdown;


    if (
        !artistElement ||
        !timeElement ||
        !countdownElement
    ) {

        return;

    }


    /*
     * ไม่มีศิลปิน
     */

    if (
        !artist
    ) {

        if (
            artistElement.textContent !==
            "—"
        ) {

            artistElement.textContent =
                "—";

        }


        if (
            timeElement.textContent !==
            "ไม่มีศิลปินกำลังแสดง"
        ) {

            timeElement.textContent =
                "ไม่มีศิลปินกำลังแสดง";

        }


        if (
            countdownElement.textContent !==
            ""
        ) {

            countdownElement.textContent =
                "";

        }


        if (
            card.dataset.countdownType !==
            ""
        ) {

            card.dataset.countdownType =
                "";

        }


        if (
            countdownElement.classList.contains(
                "is-ending"
            )
        ) {

            countdownElement.classList.remove(
                "is-ending"
            );

        }


        return;

    }


    /*
     * Artist
     */

    /* =========================================================
   Artist
========================================================= */

    const artistName =
        String(
            artist.name ?? ""
        );


    /* =========================================================
       NOW PLAYING ARTIST NAME CLASS
    ========================================================= */

    const artistLength =
        artistName.length;


    artistElement.classList.remove(
        "now-artist-long",
        "now-artist-very-long"
    );


    if (
        artistLength >= 34
    ) {

        artistElement.classList.add(
            "now-artist-very-long"
        );

    }
    else if (
        artistLength >= 22
    ) {

        artistElement.classList.add(
            "now-artist-long"
        );

    }


    if (
        artistElement.textContent !==
        artistName
    ) {

        artistElement.textContent =
            artistName;

    }


    /*
     * Time
     */

    const timeText =
        `${artist.start || ""} - ${artist.end || ""}`;


    if (
        timeElement.textContent !==
        timeText
    ) {

        timeElement.textContent =
            timeText;

    }


    /*
     * Countdown
     */

    const countdown =
        getArtistCountdown(
            artist
        );


    const countdownType =
        countdown?.type ||
        "";


    const countdownText =
        countdown?.text ||
        "";


    const icon =
        countdownType ===
            "start"

            ? "⏳"

            : countdownType ===
                "ending"

                ? "🔥"

                : countdownType ===
                    "live"

                    ? "🎵"

                    : countdownType ===
                        "ended"

                        ? "✓"

                        : "🕐";


    const displayText =
        countdownText
            ? `${icon} ${countdownText}`
            : "";


    /*
     * Countdown Type
     */

    const previousType =
        card.dataset.countdownType ||
        "";


    if (
        previousType !==
        countdownType
    ) {

        card.dataset.countdownType =
            countdownType;


        const isEnding =
            countdownType ===
            "ending";


        if (
            countdownElement.classList.contains(
                "is-ending"
            ) !== isEnding
        ) {

            countdownElement.classList.toggle(
                "is-ending",
                isEnding
            );

        }

    }


    /*
     * Countdown Text
     */

    if (
        countdownElement.textContent !==
        displayText
    ) {

        countdownElement.textContent =
            displayText;

    }

}


/* =========================================================
   UPDATE PROGRESS
========================================================= */

function updateNowPlayingProgress(
    card,
    artist
) {

    if (
        !card ||
        !card._nowUI
    ) {

        return;

    }


    const progressContainer =
        card._nowUI.progress;


    const progressBar =
        card._nowUI.progressBar;


    if (
        !progressContainer ||
        !progressBar
    ) {

        return;

    }


    /*
     * ไม่มี LIVE
     */

    if (
        !artist ||
        getArtistStatus(
            artist
        ) !==
        "LIVE"
    ) {

        if (
            progressContainer.hidden !==
            true
        ) {

            progressContainer.hidden =
                true;

        }


        if (
            card.dataset.progress !==
            "-1"
        ) {

            card.dataset.progress =
                "-1";

        }


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
            card.dataset.progress
        );


    /*
     * Show progress
     */

    if (
        progressContainer.hidden !==
        false
    ) {

        progressContainer.hidden =
            false;

    }


    /*
     * Progress ไม่เปลี่ยน
     */

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

}


/* =========================================================
   UPDATE ONE CARD
========================================================= */

function updateStageNowCard(
    card,
    stageId
) {

    if (
        !card
    ) {

        return;

    }


    /*
     * Artists for selected day
     */

    const artists =
        getNowPlayingArtists(
            stageId
        );


    /*
     * Stage Name
     */

    const stageName =
        getNowPlayingStageName(
            stageId,
            artists.length
                ? artists
                : getAllArtists()
        );


    const stageNameElement =
        card._nowUI?.stageName;


    if (
        stageNameElement &&
        stageNameElement.textContent !==
        stageName
    ) {

        stageNameElement.textContent =
            stageName;

    }


    /*
     * Stage Color
     */

    updateNowPlayingStageColor(
        card,
        stageId
    );


    /*
     * Stage Filter
     */

    const normalizedStage =
        normalizeStageId(
            stageId
        );


    const shouldShow =
        selectedStage ===
        "all" ||

        normalizeStageId(
            selectedStage
        ) ===
        normalizedStage;


    const nextHidden =
        !shouldShow;


    if (
        card.hidden !==
        nextHidden
    ) {

        card.hidden =
            nextHidden;

    }


    /*
     * LIVE
     */

    const live =
        artists.find(
            artist =>
                getArtistStatus(
                    artist
                ) ===
                "LIVE"
        ) || null;


    /*
     * NEXT
     */

    const next =
        getNextArtist(
            artists
        );


    /*
     * Current
     */

    const current =
        live ||
        next ||
        null;


    /*
     * Artist ID
     */

    const artistId =
        current
            ? String(
                current.id
            )
            : "";


    if (
        card.dataset.artistId !==
        artistId
    ) {

        card.dataset.artistId =
            artistId;

    }


    /*
     * State
     */

    updateNowPlayingState(
        card,
        current
    );


    /*
     * Content
     */

    updateNowPlayingContent(
        card,
        current
    );


    /*
     * Progress
     */

    updateNowPlayingProgress(
        card,
        live
    );

}


/* =========================================================
   RENDER STRUCTURE
   ---------------------------------------------------------
   Rebuild only when structure changes.
========================================================= */

function renderNowPlayingStructure() {

    const container =
        $("#nowPlaying");


    if (
        !container
    ) {

        return;

    }


    /*
     * Rebuild only here
     */

    container.replaceChildren();


    const fragment =
        document.createDocumentFragment();


    getStages().forEach(
        stage => {

            const card =
                createStageNowCard(
                    stage.id
                );


            fragment.appendChild(
                card
            );

        }
    );


    container.appendChild(
        fragment
    );

}


/* =========================================================
   RENDER NOW PLAYING
========================================================= */

function renderNowPlaying(
    force = false
) {

    const container =
        $("#nowPlaying");


    if (
        !container
    ) {

        return;

    }


    /*
     * Feature disabled
     */

    if (
        PLANNER.enableNowPlaying ===
        false
    ) {

        if (
            container.childNodes.length >
            0
        ) {

            container.replaceChildren();

        }


        RENDER_STATE.lastNowPlayingSignature =
            "";


        return;

    }


    const signature =
        createNowPlayingStructureSignature();


    /*
     * Rebuild only when required
     */

    if (
        force ||

        signature !==
        RENDER_STATE.lastNowPlayingSignature
    ) {

        RENDER_STATE.lastNowPlayingSignature =
            signature;


        renderNowPlayingStructure();

    }


    /*
     * Update existing cards
     */

    getStages().forEach(
        stage => {

            const card =
                getNowPlayingCard(
                    container,
                    stage.id
                );


            if (!card) {
                return;
            }


            updateStageNowCard(
                card,
                stage.id
            );

        }
    );

}


/* =========================================================
   REALTIME NOW PLAYING UPDATE
   ---------------------------------------------------------
   ZERO STRUCTURE RENDER
   ZERO container innerHTML
   ZERO Card recreation
   ZERO Font manipulation
========================================================= */

function updateNowPlayingRealtime() {

    const container =
        $("#nowPlaying");


    if (
        !container
    ) {

        return;

    }


    /*
     * ถ้า Feature ถูกปิด
     */

    if (
        PLANNER.enableNowPlaying ===
        false
    ) {

        return;

    }


    const cards =
        container.querySelectorAll(
            ".stage-now-card"
        );


    /*
     * ไม่มี Card
     */

    if (
        cards.length ===
        0
    ) {

        return;

    }


    /*
     * Update existing cards only
     */

    cards.forEach(
        card => {

            const stageId =
                card.dataset.stageId;


            if (
                !stageId
            ) {

                return;

            }


            updateStageNowCard(
                card,
                stageId
            );

        }
    );

}