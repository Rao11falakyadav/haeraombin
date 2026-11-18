# HAERAOMBIN — TECHNICAL ARCHITECTURE & SYSTEM DESIGN

**Project Title:** Privacy-Preserving Edge AI for Non-Invasive Haemoglobin Screening  
**System Designation:** Haeraombin Research Architecture  
**Target Environments:** Client-Side Browser (WASM/SIMD), Windows/Linux Host, Cloudflare Workers Serverless  

---

## 1. High-Level System Architecture

Haeraombin is an **Edge AI, privacy-first progressive web application (PWA)** combined with a Python-based scientific machine learning training and evaluation pipeline. All sensitive patient image processing and neural network inferences occur strictly on-device in the client's local browser runtime.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER RUNTIME                             │
│                                                                             │
│  ┌───────────────────────┐             ┌─────────────────────────────────┐  │
│  │ HTML5 Camera / Upload │             │  Clinical Reticle & Framing UI  │  │
│  └───────────┬───────────┘             └────────────────┬────────────────┘  │
│              │                                          │                   │
│              ▼                                          │                   │
│  ┌───────────────────────┐                              │                   │
│  │ HTML5 Canvas Pipeline │ ◄────────────────────────────┘                   │
│  │ • 224x224 RGB crop    │                                                  │
│  │ • CIE L*a*b* extraction│                                                 │
│  │ • Erythema Index (EI) │                                                  │
│  │ • Luma / Glare Guard  │                                                  │
│  └───────────┬───────────┘                                                  │
│              │ (Tensor data only)                                           │
│              ▼                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ ONNX Runtime WebAssembly (WASM + SIMD)                                │  │
│  │ • Model: haeraombin_screen_224.onnx (MobileNetV3 Backbone + Ordinal Head)│  │
│  │ • Input: float32[1, 3, 224, 224] (ImageNet Normalised)                │  │
│  │ • Output: hb_hat (g/dL), ordinal probabilities, confidence sigma      │  │
│  └───────────┬───────────────────────────────────────────────────────────┘  │
│              │                                                              │
│              ▼                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Clinical UI & Results Dashboard                                       │  │
│  │ • Haemoglobin Estimate (g/dL)                                         │  │
│  │ • Optical Colourimetry Metrics                                        │  │
│  │ • Fairness Audit Badges (ITA° Pigmentation)                           │  │
│  │ • Frozen Evidence Dashboard (results.json, sweep.json)                │  │
│  └───────────┬───────────────────────────────────────────────────────────┘  │
│              │                                                              │
│              │ (Optional Anonymous Metadata Telemetry — NO IMAGES)          │
│              ▼                                                              │
└──────────────┼──────────────────────────────────────────────────────────────┘
               │ HTTP POST /api/v1/telemetry
               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CLOUDFLARE EDGE WORKERS API                           │
│                                                                             │
│  • Rate Limiting (Token Bucket per IP)                                      │
│  • Schema Validation (Strict JSON schema, max 1024 bytes)                   │
│  • Zero-Image Ingestion Gate (Rejects multipart / binary payloads)          │
│  • Cloudflare D1 / SQLite Storage (Aggregated latency & band statistics)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Machine Learning & Model Pipeline

### 2.1 Model Architecture
The primary inference model (`haeraombin_screen_224.onnx`) uses a two-stage deep learning architecture:
1. **Backbone:** `MobileNetV3-Small-100` feature extractor pre-trained on ImageNet.
   * Parameter count: ~1.5M parameters.
   * Final pooling layer produces an embedding vector $z \in \mathbb{R}^{1024}$.
2. **Prediction Head:** Ordinal Classification Head.
   * Formulates continuous haemoglobin estimation into $K$ ordered thresholds (e.g., $K=20$ bin cuts from 6.0 to 18.0 g/dL).
   * Predicts cumulative sigmoid probabilities $P(y > r_k) = \sigma(w_k^T z + b_k)$.
   * The continuous estimate $\hat{y}$ is recovered via expectation over cutpoints:
     $$\hat{y} = y_{\min} + \Delta \sum_{k=1}^K P(y > r_k)$$
   * Ordinal formulation enforces monotonic ranking and stabilizes optimization across small sample sizes compared to unconstrained MSE loss.

### 2.2 Feature Preprocessing & Normalization
* Input images are cropped to the specified Region of Interest (ROI) spanning the palpebral conjunctiva.
* Bilinearly resized to $224 \times 224$ pixels.
* Channels normalized according to ImageNet standard parameters:
  $$\mu = [0.485, 0.456, 0.406], \quad \sigma = [0.229, 0.224, 0.225]$$
* Input tensor shape: `[1, 3, 224, 224]` with dtype `float32`.

### 2.3 Optical Colourimetry Engine
In addition to deep feature extraction, the system computes explicit physical colorimetric coordinates:
* **sRGB $\to$ CIE $L^*a^*b^*$:**
  Converted under standard D65 illuminant conditions to separate luminance ($L^*$) from chromatic red-green ($a^*$) and yellow-blue ($b^*$) axes.
* **Erythema Index (EI):**
  A spectrophotometric approximation for cutaneous and mucosal microvascular redness:
  $$\text{EI} = 100 \times \left[ \log_{10}\left(\frac{1}{R_{\text{norm}}}\right) - \log_{10}\left(\frac{1}{G_{\text{norm}}}\right) \right]$$
* **Individual Typology Angle (ITA°):**
  Standard dermatological metric for assessing melanin pigmentation:
  $$\text{ITA}^\circ = \arctan\left(\frac{L^* - 50}{b^*}\right) \times \frac{180}{\pi}$$
  Used in Haeraombin's fairness engine to audit model error disparity across pigmentation groups.

---

## 3. Frontend Web Architecture

The frontend is intentionally built with **vanilla, frameworkless, zero-overhead ES modules** to guarantee maximum execution speed and long-term maintainability.

* **Entry Point:** `app/web/index.html`
* **Core Application Logic:** `app/web/src/app.js` (State machine, canvas capture, event orchestration).
* **Inference Seam:** `app/web/src/inference.js` (ONNX Runtime Web initialization, session caching, tensor preparation).
* **Colourimetry Module:** `app/web/src/colourimetry.js` (Bitwise identical JavaScript implementation of Python colorimetry algorithms).
* **Internationalization:** `app/web/src/i18n.js` (Bilingual string management with 100% symmetric coverage for English and Hindi).
* **Evidence Visualizer:** `app/web/src/evidence.js` (Parses and renders frozen evaluation reports without client-side metric mutation).
* **Offline Service Worker:** `app/web/sw.js` (Caches static HTML, CSS, JS, and ONNX models for true offline capability).

### Component State Lifecycle
The screening interface operates as a deterministic finite state machine (FSM):
```
[standby] ──> [streaming] ──> [captured] ──> [analysing] ──> [result]
     │              ▲              │                              │
     │              └──────────────┴──────────────────────────────┘
     ▼                         (Retake / Retry)
[demo_mode] ──────────────────────────────────────────────────────┘
```

---

## 4. ONNX Runtime WebAssembly (WASM) Seam

Local browser inference is powered by Microsoft's `onnxruntime-web` (v1.30.0) vendored directly inside `app/web/vendor/ort/`:
* `ort.wasm.min.js`: Core runtime glue and high-level JavaScript API.
* `ort-wasm-simd-threaded.wasm`: WebAssembly SIMD binary compiled with Emscripten, enabling vector instructions on modern x86 and ARM processors.
* `ort-wasm-simd-threaded.mjs`: Web Worker module managing SIMD execution threads.

### Execution Seam Flow:
```javascript
// 1. Initialize ONNX runtime session with CPU SIMD execution provider
const session = await ort.InferenceSession.create("/models/haeraombin_screen_224.onnx", {
  executionProviders: ["wasm"],
  graphOptimizationLevel: "all"
});

// 2. Prepare Float32Array from canvas pixel data (CHW format)
const tensor = new ort.Tensor("float32", float32Array, [1, 3, 224, 224]);

// 3. Execute synchronous local inference
const feeds = { [session.inputNames[0]]: tensor };
const results = await session.run(feeds);

// 4. Extract continuous haemoglobin prediction
const hbEstimate = results.hb_hat.data[0];
```

Typical inference latency on standard Intel i5-1235U hardware is **110–140 ms**, well below the interactive threshold.

---

## 5. Backend & Cloudflare Workers Architecture

The optional serverless tier is deployed to **Cloudflare Workers** with zero reliance on cloud Python or heavy machine learning infrastructure:

* **Endpoint:** `POST /api/v1/telemetry`
* **Purpose:** Monitor client-side runtime health, latency statistics, and WHO anaemia class distributions.
* **Payload Constraint:** Maximum 1024 bytes. JSON body strictly validated against schema:
  ```json
  {
    "model_id": "haeraombin-screen-v1",
    "band": "within_range",
    "hb_hat": 13.4,
    "quality": 0.94,
    "latency_ms": 128
  }
  ```
* **Security & Privacy Safeguards:**
  * Strict `Content-Type: application/json` enforcement.
  * Rejects binary or multipart data payloads.
  * Token bucket rate limiting (30 requests/minute per client IP).
  * Daily aggregate caps to prevent telemetry denial-of-service.

---

## 6. Privacy & Security Architecture

### Zero-Cloud Privacy Guarantees
| Threat Vector | Mitigation Strategy | Verification Status |
| :--- | :--- | :--- |
| **Facial photograph interception** | Images never leave browser memory; processed entirely within local HTML5 Canvas and WASM buffer. | **Verified** (Zero multipart upload routes exist). |
| **Biometric feature exfiltration** | Colour coordinates and tensors are discarded after local inference. | **Verified** (`app.js` and `telemetry.js` audit). |
| **Third-party script tracking** | Zero external CDNs; ONNX Runtime, fonts, and assets are 100% locally hosted. | **Verified** (Self-contained in `app/web/`). |
| **Network surveillance** | App is fully operational offline without internet connectivity via Service Worker. | **Verified** (`tests/test_workers.py`). |
| **Telemetry deanonymization** | Telemetry payload contains no user ID, MAC address, IP logging, or high-dimensional vectors. | **Verified** (Cloudflare worker strips client identifiers). |

---

## 7. Data Flow Matrix

```
┌─────────────────────────────────┐
│ Smartphone / Webcam Sensor      │
└───────────────┬─────────────────┘
                │ Uncompressed Video Stream (MediaStream API)
                ▼
┌─────────────────────────────────┐
│ HTML5 <video> & Canvas Overlay  │ ◄─── Clinical Reticle Positioning
└───────────────┬─────────────────┘
                │ Raw 2D ImageData Buffer
                ▼
┌─────────────────────────────────┐
│ Quality Gate Subsystem          │
│ • Mean Luma check (35 < L < 240)│ ─── [Fail] ──> Safe Abstention Notice
│ • Glare / Clipping (< 9%)       │
└───────────────┬─────────────────┘
                │ [Pass]
                ▼
┌─────────────────────────────────┐
│ Colourimetry Engine             │ ───> CIE L*a*b*, Erythema Index, a*/b*
└───────────────┬─────────────────┘
                │ Normalized Tensor float32[1, 3, 224, 224]
                ▼
┌─────────────────────────────────┐
│ ONNX WebAssembly Runtime        │ ───> Model Output (hb_hat, residual sigma)
└───────────────┬─────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│ DOM Results Dashboard           │ ───> Visual Display (Hb g/dL, Confidence, Audit)
└─────────────────────────────────┘
```

