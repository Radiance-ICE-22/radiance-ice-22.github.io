# Language-Guided Goal Understanding for Simulation-Trained Visuomotor Drone Navigation

Project site of Team Radiance (CSE, University of Moratuwa): **https://radiance-ice-22.github.io/**
(the URL behind the poster's QR code: keep it stable).

Plain static HTML, no build step. GitHub Actions (`.github/workflows/pages.yml`) publishes the repo on every push to `main`.

| Path | What |
| --- | --- |
| `index.html` | The page |
| `assets/site.css`, `assets/site.js` | Styles; phrase demo, Galley feature cards, charts (numbers from `docs/SEMANTICS.md` §15–16 of the main repo) |
| `assets/drone.js` | Drone CAD viewer (three.js 0.160 from jsDelivr) |
| `media/galley/` | Screen recordings of Galley on intellisense08, 12 Oct 2026 (H.264, posters as `.jpg`) |
| `media/flights/` | FiGS expert flights and the SV-Net student clips |
| `media/drone/drone.glb` | Drone CAD decimated 1.6 M → 154 k faces |
| `media/fea/` | Prop-guard modal study (Autodesk Fusion, PropGuard v9) |

Code, docs and reports: https://github.com/Radiance-ICE-22/Radiance-Environment-Setup

Preview locally: `python3 -m http.server 8765` in this folder, then http://localhost:8765.
