# Migration notes

This is a structural split of the uploaded script.

Important follow-up cleanup:
- The current source contains `simulationSeconds = 0;` during reset even though no declaration exists in the state section. Remove that stale assignment during the simulation cleanup pass.
- Keep only one DOMContentLoaded application initializer when wiring the refactored page.
