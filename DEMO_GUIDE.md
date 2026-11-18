# HAERAOMBIN — LIVE DEMONSTRATION & REPRODUCTION GUIDE

**Project Title:** Privacy-Preserving Edge AI for Non-Invasive Haemoglobin Screening  
**Tagline:** *"Intelligent Screening. On-Device Privacy. Responsible AI."*  
**Category:** Healthcare AI | Computer Vision | Edge AI | Responsible AI  

> **CRITICAL CLINICAL DISCLAIMER**  
> Haeraombin is an experimental research prototype investigating the feasibility of non-invasive haemoglobin estimation from smartphone photography. It is **not** a cleared, approved, or clinically validated diagnostic device. It must **never** be used as a substitute for venous laboratory haematology (such as automated complete blood count analyzers) or to inform patient diagnosis, triage, or therapeutic dosing decisions.

---

## 1. System Requirements & Prerequisites

The application and deep learning pipeline are optimized for modern consumer hardware without requiring dedicated GPU accelerators.

* **Operating System:** Windows 10 / Windows 11 (64-bit)
* **Processor:** Intel Core i5 (12th Gen+) or AMD Ryzen 5 CPU (CPU-only execution)
* **Memory:** 8 GB RAM (Inference uses < 250 MB browser RAM)
* **Runtimes:**
  * **Python:** 3.13.x (with isolated `.venv`)
  * **Node.js:** v20.x or v22.x+
* **Browser:** Modern Chromium-based browser (Google Chrome, Microsoft Edge, Brave) or Firefox with WebAssembly (WASM) and SIMD support enabled.

---

## 2. Environment Setup (One-Time)

Open **PowerShell** in the repository root directory (`haeraombin-main`):

```powershell
# 1. Activate the pre-configured virtual environment
.\.venv\Scripts\Activate.ps1

# 2. Verify Python environment and dependencies
python -V
# Expected: Python 3.13.x

# 3. Synchronize models and frozen evidence reports into the web app
node scripts/build_site.mjs
# Expected output:
#   report          37.1 KB  data/results.json
#   report           6.7 KB  data/sweep.json
#   model         5969.1 KB  models/haeraombin_screen_224.onnx
#   model-meta       0.8 KB  models/model.json
#   build_site: staged 4 file(s) into app/web/ (not committed).

# 4. Verify test suite and code quality
pytest
ruff check .
# Expected: 895 passed, 0 failures; All checks passed!
```

---

## 3. Starting the Local Application Server

To ensure WebAssembly and local assets load without cross-origin file restrictions, start the lightweight HTTP server:

```powershell
python -m http.server 8000 --directory app/web
```

Open your browser and navigate to:
👉 **`http://localhost:8000`**

*(Note: If port 8000 is occupied by another service on your machine, run `python -m http.server 8088 --directory app/web` and navigate to `http://localhost:8088`)*.

---

## 4. Live Demonstration Workflow (5–7 Minute Sequence)

Follow this exact stage-by-stage presentation path for an impactful, academically rigorous demonstration.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DEMONSTRATION TIMELINE                          │
├───────────────┬─────────────────────────────┬──────────────────────────┤
│ 0:00 - 1:00   │ Act 1: The Problem & Vision │ Clinical context & limits│
│ 1:00 - 2:15   │ Act 2: Interface & Reticle  │ Positioning UX & guidance│
│ 2:15 - 3:45   │ Act 3: Live Edge Screening  │ ONNX WASM & Colourimetry │
│ 3:45 - 5:15   │ Act 4: Evidence & Audits    │ Baseline metrics & bias  │
│ 5:15 - 6:00   │ Act 5: Privacy Verification │ DevTools 0-byte proof    │
│ 6:00 - 7:00   │ Act 6: Responsible AI & Q&A │ Safety gate & next steps │
└───────────────┴─────────────────────────────┴──────────────────────────┘
```

### Act 1: Clinical Problem & The Privacy Imperative (0:00 – 1:00)
* **Opening Statement:**  
  *"Anaemia affects over 1.6 billion individuals globally, disproportionately impacting pregnant women and children in low-resource rural settings. While venous blood draws are the gold standard, they require sterile consumables, cold chain logistics, and trained phlebotomists. Haeraombin explores an alternative: non-invasive palpebral conjunctiva screening on standard smartphones.*
* **The Problem with Prior Art:**  
  *"Most academic AI screening prototypes upload unencrypted patient face photographs to cloud servers, introducing massive HIPAA/GDPR biometric privacy liabilities. Haeraombin solves this by processing all computer vision and deep learning inference 100% locally on the device using ONNX Runtime WebAssembly."*

### Act 2: Clinical Positioning & Optical Framing (1:00 – 2:15)
* Click the **Screen** tab on the navigation bar.
* Point out the **Clinical Positioning Guidance** and the elliptical target reticle:
  * *"Why the palpebral conjunctiva? Unlike the skin, the inner lower eyelid contains virtually zero melanin pigmentation and has high capillary density, giving a direct optical window into microvascular blood beds."*
* Show the bilingual capability: Click the language toggle to switch between **English** and **Hindi (हिन्दी)** to demonstrate accessibility for community health workers (ASHAs) in rural health camps.

### Act 3: On-Device Screening & Demonstration Mode (2:15 – 3:45)
* Demonstrate the live screening workflow:
  * If camera access is granted, point to the live feed and the real-time quality gate.
  * To demonstrate repeatable, calibrated clinical scenarios, use the **Demonstration Mode Ribbon** at the top:
    * **Click `Case 1: Normative Tissue` (~13.4 g/dL):**  
      Shows a healthy, vascularized conjunctiva with strong erythema. Observe:
      * **Estimated Haemoglobin:** ~13.4 g/dL (`Within normative screening range`).
      * **Optical Colourimetry Breakdown:** Shows mean RGB, CIE L\*a\*b\*, Erythema Index (EI = 48.2), and redness ratio (a\*/b\* = 1.34).
      * **Inference Latency:** ~110–140 ms executed directly inside browser WASM on the Intel i5 CPU.
    * **Click `Case 2: Mild Pallor` (~10.4 g/dL):**  
      Shows reduced microvascular redness. Model flags: `Mild pallor / screening flag (9.0–11.9 g/dL)`.
    * **Click `Case 3: Significant Pallor` (~8.2 g/dL):**  
      Shows marked tissue blanching. Model flags: `Significant pallor / triage alert (<9.0 g/dL)`.
* Highlight the **Image Quality Gate**:
  * Explain that overexposed (flash glare) or underexposed frames are safely rejected before reaching the model: *"Refusing to guess on poor images is a clinical safety feature."*

### Act 4: Empirical Evidence & Fairness Dashboard (3:45 – 5:15)
* Click the **Evidence** tab on the navigation bar.
* Emphasize academic honesty and transparency:
  * *"In AI healthcare, teams often cherry-pick aggregate accuracies or fabricate 95% claims. Haeraombin displays our actual frozen baseline evaluation (`results.json`), audited directly from 217 real clinical subjects across India and Italy."*
* Walk through the committed findings:
  1. **Continuous Regression Performance:**  
     * Point out the Ordinal Head: **MAE = 2.16 g/dL**, **RMSE = 2.54 g/dL**, **$R^2 \approx 0.013$**.  
     * *"This proves that smartphone ambient screening is hard. While classification can triage high-risk cases, continuous haemoglobin estimation remains bounded by sensor variability."*
  2. **The Illumination Confound:**  
     * Point out the Cross-Site Calibration Audit: Italian clinic photographs are uniformly ~20% brighter than Indian clinic photographs. Cross-site transfer error rises to 3.3–4.4 g/dL due to illumination shifts.
  3. **Skin-Tone Fairness (ITA°):**  
     * Show the Individual Typology Angle (ITA°) subgroup audit. Explain why subjects with deep pigmentation (ITA < 10°) are explicitly marked as *Underpowered Subgroup* rather than falsely claiming universal parity.
  4. **The Zero Severe Cases Reality:**  
     * Point out the callout box: Across all 217 patients, there were 0 patients with Hb < 7.0 g/dL. *"We openly declare that this tool cannot claim clinical validity on severe anaemia until a prospective ICU cohort is enrolled."*

### Act 5: Zero-Cloud Privacy & Network Verification (5:15 – 6:00)
* Open **Developer Tools** in the browser (`F12` or `Ctrl+Shift+I`).
* Switch to the **Network** tab and check `Disable cache`.
* Perform an analysis in Demonstration Mode or upload an image.
* **Filter by `Fetch/XHR`:**
  * Show that **zero image data** is transmitted. The only outbound request is an optional 200-byte anonymous telemetry ping containing purely runtime metadata:
    ```json
    {
      "model_id": "haeraombin-screen-v1",
      "band": "within_range",
      "hb_hat": 13.4,
      "quality": 0.94,
      "latency_ms": 128
    }
    ```
  * Show the toggle switch under **About → Opt out of anonymous metadata telemetry**, proving full user sovereignty.

### Act 6: Summary & Responsible AI Future Work (6:00 – 7:00)
* Conclude with the core takeaways:
  * On-device Edge AI running on commodity consumer laptops/phones.
  * Zero-transmission biometric privacy architecture.
  * Honest, unembellished clinical reporting and fairness transparency.
* Invite questions from the evaluators.

---

## 5. Demonstration Fallback & Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Camera permission blocked or unavailable** | Browser permission denied or no webcam attached | Click **Demonstration Mode** (`Case 1`, `Case 2`, or `Case 3`) in the top ribbon or use **Upload Photo**. The entire pipeline runs identically. |
| **Model failed to load notice** | `models/haeraombin_screen_224.onnx` or `model.json` missing | Run `node scripts/build_site.mjs` to stage the model files, then refresh with `Ctrl+F5`. |
| **Port 8000 already in use** | Another local process bound to port 8000 | Run on port 8088: `python -m http.server 8088 --directory app/web` and visit `http://localhost:8088`. |
| **Language reset on refresh** | Browser storage cleared | Click the language pill in the top navigation bar (`EN` or `हिन्दी`) to toggle instantly. |
| **WASM memory allocation error** | Extremely low system RAM or outdated browser | Close background tabs or run in Google Chrome / Microsoft Edge with hardware acceleration enabled. |

