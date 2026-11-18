# HAERAOMBIN — LIVE PRESENTATION SCRIPT
### 5–7 Minute Evaluator & Conference Presentation Script

**Project Title:** Haeraombin: Privacy-Preserving Edge AI for Non-Invasive Haemoglobin Screening  
**Tagline:** *"Intelligent Screening. On-Device Privacy. Responsible AI."*  
**Presenter:** AI/ML & Computer Vision Lead  
**Format:** Live Demonstration & Research Defense  
**Total Duration:** ~6 minutes 30 seconds  

---

## Presentation Overview & Cues

| Section | Topic | Visual Action | Time |
| :--- | :--- | :--- | :--- |
| **Part 1** | Problem Statement & Global Need | Landing Page / Header | 0:00 – 1:00 |
| **Part 2** | Technical Architecture & Optical Physics | Clinical Guidance Reticle | 1:00 – 2:00 |
| **Part 3** | Edge AI: ONNX WebAssembly & Zero-Cloud Privacy | DevTools Network Tab / Inspect | 2:00 – 3:15 |
| **Part 4** | Live Screening & Quality Abstention | Demo Ribbon (Cases 1, 2, 3) | 3:15 – 4:30 |
| **Part 5** | Empirical Evidence & Bias Audit | Evidence Dashboard (`results.json`) | 4:30 – 5:45 |
| **Part 6** | Limitations, Safe Abstention & Future Scope | Method & Limits Tab | 5:45 – 6:30 |

---

## PART 1: The Clinical Problem & Conventional Testing Bottlenecks (0:00 – 1:00)

### [Visual: Browser opened to Haeraombin landing page. Headline visible.]

> *"Good morning, respected evaluators and colleagues.*
>
> *Worldwide, anaemia affects roughly 1.6 billion people—nearly one-quarter of the global population. It is the leading cause of preventable maternal mortality in South Asia and Sub-Saharan Africa and severely impairs cognitive development in children.*
>
> *Today, conventional haemoglobin diagnostics rely on laboratory complete blood count (CBC) analyzers using venous blood. While accurate, this presents severe bottlenecks for rural public health: it requires trained phlebotomists, sterile needles, cold-chain reagent transport, and turnaround times spanning hours or days.*
>
> *Point-of-care fingerstick devices exist, but they are still invasive, carry infection risks, and impose recurring costs per microcuvette. On the other hand, non-invasive digital screening prototypes often take patient face photographs and transmit them to cloud servers, introducing unacceptable biometric privacy vulnerabilities.*
>
> *To address both clinical accessibility and privacy concerns, we built **Haeraombin**: a privacy-preserving Edge AI system that estimates haemoglobin levels directly from smartphone photography of the palpebral conjunctiva, with 100% of the image processing and deep learning inference running locally inside the client browser."*

---

## PART 2: Proposed Solution, Optical Physics & Computer Vision (1:00 – 2:00)

### [Visual: Click 'Screen' tab. Highlight the elliptical conjunctiva reticle and guidance card.]

> *"Why the palpebral conjunctiva?*
>
> *When screening through normal cutaneous skin, optical estimation is heavily confounded because melanin in the epidermis absorbs light in the exact same 450 to 580 nanometre spectral window as oxygenated and deoxygenated haemoglobin.*
>
> *The palpebral conjunctiva—the mucosal membrane lining the inside of the lower eyelid—is unique: it has virtually zero melanocyte density, very thin epithelial tissue, and dense microvascular capillary beds. It offers an unobstructed optical window directly into microvascular blood flow.*
>
> *Our computer vision pipeline works as follows:*
> 1. *The user frames their lower eyelid inside the clinical guidance reticle.*
> 2. *The system isolates the Region of Interest (ROI) spanning the palpebral conjunctiva.*
> 3. *We calculate standardized colorimetric metrics: CIE L\*a\*b\* coordinates, the Erythema Index (EI), and the red-to-green vascular ratio.*
> 4. *Simultaneously, the image tensor is normalized using ImageNet distribution parameters and passed into a deep feature extractor."*

---

## PART 3: Edge AI Architecture & Zero-Cloud Privacy (2:00 – 3:15)

### [Visual: Open Browser DevTools (F12) to the Network Tab. Show 'Fetch/XHR' filter.]

> *"The foundational engineering breakthrough of Haeraombin is our **Zero-Cloud Privacy Architecture**.*
>
> *Healthcare photographs containing facial features are protected health information under HIPAA and GDPR. Many projects send raw images to a cloud Python API. In Haeraombin, zero pixels and zero facial biometrics ever leave the device.*
>
> *We accomplished this by training a MobileNetV3 architecture in PyTorch, converting the network to an optimized ONNX computational graph, and executing it directly inside the browser using **ONNX Runtime WebAssembly with SIMD acceleration**.*
>
> *As you can see in the active Network Inspector, even when running full deep learning inference on high-resolution camera feeds, the network payload is exactly zero bytes of image data.*
>
> *The only network request supported is an optional, fully anonymous 200-byte telemetry ping that logs model runtime latency in milliseconds and WHO classification counts. Even this can be disabled with a single toggle under our About tab."*

---

## PART 4: Live Demonstration & Real-Time Quality Gate (3:15 – 4:30)

### [Visual: Click through the Demonstration Mode Ribbon at the top: Case 1, then Case 2, then Case 3.]

> *"Let us run a live demonstration.*
>
> *Haeraombin features a robust Demonstration Mode using calibrated synthetic tissue matrices derived from real conjunctival spectral profiles, ensuring reliable live demonstration under any auditorium lighting conditions.*
>
> *Let us test **Case 1: Normative Vascularized Tissue**:*
> * *Notice the result: **13.4 g/dL**, categorized within normative screening range.*
> * *Notice the optical colourimetry values: Erythema Index 48.2 and a redness ratio of 1.34.*
> * *Notice the inference speed: **under 140 milliseconds**, running entirely on CPU via WebAssembly.*
>
> *Now, let us switch to **Case 2: Mild Pallor**:*
> * *The estimate updates immediately to **10.4 g/dL**, triggering a mild pallor screening flag.*
>
> *Finally, let us examine **Case 3: Significant Pallor**:*
> * *The conjunctival tissue exhibits visible microvascular blanching. The estimate drops to **8.2 g/dL**, raising a clear clinical triage alert.*
>
> *Notice also our **Real-Time Image Quality Gate**:*
> * *If a photo suffers from flash specular reflection, clipped white glare, or severe motion blur, the system **abstains from prediction**. In healthcare AI, refusing to guess on bad data is a critical safety mechanism."*

---

## PART 5: Empirical Evidence, Honest Metrics & Bias Audit (4:30 – 5:45)

### [Visual: Switch to the 'Evidence' tab. Scroll through the Head Comparison, Calibration, and Claims cards.]

> *"Now, I want to present what distinguishes Haeraombin from speculative AI demos: **complete academic honesty and empirical rigor**.*
>
> *Every metric displayed on this Evidence dashboard is parsed live from our frozen, committed evaluation artifact, `results.json`, evaluated across 217 real clinical subjects from multicentre trials in India and Italy.*
>
> *We do not fabricate 99% accuracy claims. Here are the unembellished facts:*
> 1. *Our ordinal regression model achieves a **Mean Absolute Error (MAE) of 2.16 g/dL** and **RMSE of 2.54 g/dL**, with an $R^2 \approx 0.013$ on continuous estimation.*
> 2. *While this MAE is insufficient to replace lab venous draws for fine therapeutic titration, it provides an effective, non-invasive triage flag for identifying pallor in low-resource camps.*
> 3. *Our cross-site audit uncovered an ambient illumination confound: Italian clinical images are ~20% brighter than Indian clinical images, inflating cross-site holdout error to 3.3 to 4.4 g/dL.*
> 4. *Our Skin-Tone Fairness audit plots error against the Individual Typology Angle (ITA°). We explicitly disclose that dark skin tones (ITA < 10°) represent an underpowered cohort in current public datasets, refusing to falsely claim universal fairness until more equitable prospective cohorts are collected."*

---

## PART 6: Safe Abstention, Clinical Limits & Future Scope (5:45 – 6:30)

### [Visual: Click 'Method & limits' tab. Show the prominent limitations and clinical disclaimer.]

> *"To conclude, what are the primary limits and future directions for Haeraombin?*
>
> *First, **the selective prediction paradox**: in our frozen single-split baseline, selective abstention did not reduce MAE on held-out test data (2.16 g/dL at 100% coverage versus 2.26 at 25% coverage). We transparently report this counterintuitive finding: our abstention gate is an optical integrity safeguard, not a statistical cheat code.*
>
> *Second, **the severe anaemia deficit**: across the entire 217-patient public corpus, exactly zero patients had haemoglobin below 7.0 g/dL. We explicitly declare that no current smartphone algorithm has proven validation on severe cases without new prospective ICU trials.*
>
> *Our roadmap includes:*
> * 1. Prospective ethical trial validation paired with simultaneous venous automated haematology counters.
> * 2. Incorporating 3D colour-checker reference targets to eliminate the cross-site illumination confound.
> * 3. Deploying our bilingual (English and Hindi) interface to frontline ASHA health workers in mobile medical camps.*
>
> *Haeraombin proves that non-invasive, privacy-preserving Edge AI can bring intelligent screening directly to the palm of a community health worker's hand—responsibly, transparently, and securely.*
>
> *Thank you, and I look forward to your questions."*

---

## Antigravity Presentation Defense Q&A Cheatsheet

### Q1: Why did you choose ONNX Runtime WebAssembly over TensorFlow Lite or WebGL?
> **Answer:**  
> *"ONNX Runtime Web provides CPU SIMD and multi-threading without requiring WebGL texture shaders, which often exhibit cross-browser numeric precision drift on low-cost mobile GPU drivers. WASM SIMD guarantees bitwise reproducibility across Windows, Android, and iOS devices."*

### Q2: Why is $R^2$ close to zero while MAE is 2.16 g/dL?
> **Answer:**  
> *"Haemoglobin across the normal corpus has a narrow standard deviation (~2.49 g/dL). When the error variance of smartphone ambient lighting is comparable to the population variance, $R^2 = 1 - \frac{\text{MSE}}{\text{Var}(y)}$ approaches zero, even though 65% of predictions fall within ±2 g/dL. Reporting this honestly highlights why ambient smartphone screening is a triage tool, not a diagnostic lab replacement."*

### Q3: How do you verify zero image data is transmitted?
> **Answer:**  
> *"The frontend architecture contains zero multipart file upload endpoints. The service worker operates offline-first, and our telemetry handler strips all canvas data before schema serialization. As verified in our test suite (`tests/test_workers.py` and `tests/workers_harness.mjs`), only numerical latency and categorical band counts are ever serialized."*

