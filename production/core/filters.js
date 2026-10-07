/**
 * =========================================================
 * FILTER LOGIC ONLY
 *
 * Day:
 *   selectedDate = one festival date
 *
 * Stage:
 *   selectedStage = "all" -> ไม่กรองเวที
 *
 * =========================================================
 */

function getFilteredArtists(
    artists = getAllArtists()
) {

    if (!Array.isArray(artists)) {
        return [];
    }


    /* =====================================================
       STAGE FILTER STATE
    ===================================================== */

    const useAllStages =
        selectedStage === "all";


    const selectedStageId =
        useAllStages
            ? "all"
            : normalizeStageId(
                selectedStage
            );


    /* =====================================================
       FILTER
    ===================================================== */

    return artists.filter(
        artist => {

            if (!artist) {
                return false;
            }


            /* =============================================
               DATE FILTER

               selectedDate is always
               one festival date.
            ============================================= */

            const dateMatch =
                artist.dateISO === selectedDate;


            /* =============================================
               STAGE FILTER

               Use StageID only
            ============================================= */

            const artistStageId =
                normalizeStageId(
                    artist.stageId
                );


            const stageMatch =
                useAllStages ||
                (
                    artistStageId &&
                    selectedStageId &&
                    artistStageId ===
                    selectedStageId
                );


            return (
                dateMatch &&
                stageMatch
            );

        }
    );

}