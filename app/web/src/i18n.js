/* Bilingual strings. English is the source language; Hindi is a full
 * translation, not a machine gloss, and every user-visible string lives here —
 * there are no hard-coded labels in app.js. Adding a string means adding it to
 * both dictionaries or the missing-key guard below fires in development.
 */

export const MESSAGES = {
  en: {
    "app.badge": "Clinical Research Instrument",
    "app.title": "Privacy-Preserving Edge AI for Non-Invasive Haemoglobin Screening",
    "app.desc":
      "Haeraombin investigates non-invasive haemoglobin estimation from smartphone photographs of the palpebral conjunctiva using on-device WebAssembly AI, with comprehensive skin-tone fairness audits.",
    "tag.research": "Research prototype",
    "nav.screen": "Screen",
    "nav.evidence": "Evidence",
    "nav.method": "Method & limits",
    "nav.about": "About",

    "state.online": "On device",
    "state.offline": "Offline",
    "state.offline_title": "No network. Inference runs on this device, so screening still works.",

    "screen.empty_label": "Camera standby",
    "screen.empty_body":
      "Pull the lower eyelid down gently so the pink inner lining (palpebral conjunctiva) is clearly framed within the reticle. Hold steady in diffuse ambient lighting.",
    "screen.start": "Turn on camera",
    "screen.capture": "Take photo",
    "screen.retake": "Retake",
    "screen.analyse": "Analyse on-device",
    "screen.guide_label": "Clinical positioning guidance",
    "screen.guide_body":
      "Fill the elliptical outline with the vascular inner lining of the lower eyelid. Keep the phone steady ~15 cm away; avoid flash and direct specular reflection.",

    "result.heading": "Estimated haemoglobin",
    "result.unit": "g/dL",
    "result.interval": "Range {lo}–{hi} g/dL",
    "result.band_ok": "Within normative screening range for this model (≥12.0 g/dL)",
    "result.band_warn": "Mild pallor / screening flag (9.0–11.9 g/dL)",
    "result.band_risk": "Significant pallor / triage alert (<9.0 g/dL)",
    "result.low_high": "The estimate is {band} the decision threshold for this model.",
    "result.disclaimer":
      "Haeraombin is an experimental research prototype, not a clinically validated diagnostic device. Never use estimates as confirmed medical results or for treatment decisions.",

    "abstain.heading": "Quality gate refused image",
    "abstain.body":
      "The capture did not clear image quality thresholds (sub-optimal lighting, motion blur, or poor tissue framing). Retake in even light. Rejection is a safety behaviour to prevent unreliable estimates.",

    "error.camera": "Camera permission was refused or no camera is available. You can use Demonstration Mode or upload a photo.",
    "error.generic": "An error occurred during local image processing. Please retry.",

    "notice.unavailable": "Model unavailable on device.",
    "notice.unavailable_body":
      "The exported ONNX model could not be loaded into WebAssembly. Ensure models/model.json is present.",

    "evidence.title": "Empirical Evidence & Evaluation Audit",
    "evidence.intro":
      "Every metric on this dashboard is drawn directly from the frozen baseline evaluation committed in this repository (results.json). No figures are fabricated or embellished.",
    "evidence.pending":
      "Results will be displayed once the evaluation artifacts are parsed.",
    "evidence.corpus_h": "Dataset Corpus",
    "evidence.roi": "Region of interest",
    "evidence.backbone": "Vision backbone",
    "evidence.patients": "Held-out test patients",
    "evidence.sites": "Clinical sites",
    "evidence.features": "Feature dimension",
    "evidence.excluded": "Excluded features",
    "evidence.none": "none",
    "evidence.heads_h": "Frozen baseline metrics by head",
    "evidence.head_row":
      "MAE {mae} · RMSE {rmse} · R² {r2} · within ±1 g/dL {within} · site gap {gap} ({site})",
    "evidence.calibration_h": "Cross-site calibration & confound audit",
    "evidence.calibration_row": "pooled ECE {pooled} · best–worst gap {gap}",
    "evidence.calibration_sites": "per site: {list}",
    "evidence.provenance_h": "Artifact provenance & reproducibility",
    "evidence.commit": "Git commit",
    "evidence.fingerprint": "Feature cache fingerprint",
    "evidence.generated": "Generated at",
    "evidence.dirty": "Working tree status",
    "evidence.yes": "dirty",
    "evidence.no": "clean",

    "evidence.sweep_h": "Model configuration sweep",
    "evidence.sweep_intro":
      "Candidates were evaluated strictly on validation folds, and the test split was read exactly once after selecting the configuration.",
    "evidence.sweep_metric": "Selection metric",
    "evidence.sweep_winner": "Winning configuration",
    "evidence.sweep_gap": "Validation margin (g/dL)",
    "evidence.sweep_fold": "Patient-disjoint split",
    "evidence.sweep_fold_value": "{train} train / {val} validation / {test} test",
    "evidence.sweep_near_tie":
      "Validation gap < 0.10 g/dL indicates a statistical tie between top candidates.",
    "evidence.sweep_row": "val MAE {mae} · val R² {r2}",
    "evidence.sweep_test_h": "Final test split readout",
    "evidence.sweep_test_row": "MAE {mae} · RMSE {rmse} · R² {r2} · within ±1 g/dL {within}",
    "evidence.sweep_no_test": "No post-sweep test score available.",
    "evidence.sweep_unmasked_h": "Unsegmented full-frame controls",
    "evidence.sweep_unmasked_row":
      "{label}: {count} patient(s) without segmentation mask.",

    "method.title": "Methodology, Optical Physics & Limitations",
    "method.how_h": "How Haeraombin works",
    "method.how_b":
      "The camera captures the palpebral conjunctiva (inner lower eyelid lining), which provides direct optical access to microvascular blood beds with negligible melanin attenuation. Local computer vision extracts calibrated colour coordinates (CIELAB, Erythema Index, a*/b*) and feeds a normalized tensor into an ONNX MobileNetV3 ordinal regression model via browser WebAssembly. Zero pixels ever leave the device.",
    "method.cannot_h": "What Haeraombin cannot do",
    "method.cannot_b":
      "This is an experimental screening aid, not a clinical diagnostic instrument. It cannot replace venous laboratory haematology (Coulter counter/Sysmex), cannot diagnose anaemia, and cannot rule it out. An abnormal estimate is merely a prompt for professional medical follow-up.",
    "method.emergency_b": "Do not use in medical emergencies or for therapeutic dosing decisions.",
    "method.fair_h": "Fairness and responsible AI",
    "method.fair_b":
      "Performance is audited across skin pigmentation (Individual Typology Angle - ITA°) and imaging cohorts. Where significant error disparities exist, they are explicitly flagged rather than concealed behind aggregate metrics.",

    "about.title": "About Haeraombin",
    "about.dataset": "Corpus",
    "about.licence": "Licence",
    "about.runtime": "Edge runtime",
    "about.build": "Build version",
    "about.privacy": "Zero cloud transmission: All image processing and deep learning inference occur purely inside the local browser sandbox via WebAssembly.",
    "about.telemetry_h": "Anonymous telemetry & privacy guarantee",
    "about.telemetry_optout": "Opt out of anonymous metadata telemetry",
    "about.telemetry_desc": "No photographs, biometric features, or patient identifiers are ever sent over the network. Only inference latency (ms) and general WHO classification counts are collected for runtime reliability.",

    "screen.upload": "Upload photo",
    "screen.sample": "Demonstration mode",
    "screen.stress": "Lighting stress test",
    "screen.camp_mode": "Health-worker mode",
    "screen.camp_active": "Health-worker mode active",
    "screen.export_csv": "Export records (CSV)",
    "screen.print_report": "Print / Save PDF Report",
    "screen.measured_title": "What was measured (Optical colourimetry)",
    "screen.measured_rgb": "Mean RGB",
    "screen.measured_lab": "CIE L*a*b*",
    "screen.measured_ei": "Erythema Index",
    "screen.measured_redness": "Redness ratio (a*/b*)",
    "screen.audit_badge_title": "Fairness audit",
    "screen.audit_badge_supported": "Subgroup calibrated",
    "screen.audit_badge_underpowered": "Underpowered subgroup (ITA < 10°)",
    "screen.audit_badge_pending": "Pending frozen run",
    "screen.stress_exposure": "Exposure offset",
    "screen.stress_wb": "White-balance temperature",
    "screen.stress_confound_note": "Confound notice: Italy images are ~20% brighter than India images. Notice how exposure moves the colorimetric estimate.",

    "evidence.abstain_h": "Selective prediction: value of abstaining",
    "evidence.abstain_intro": "Refusing to estimate when the photograph is poor is a safety behaviour, not an accuracy claim. In the first frozen run, rejecting the lowest-confidence images did not reduce mean absolute error (ordinal MAE 2.16 g/dL at full coverage rose to 2.26 at 25% coverage), so the gate is shipped for safety only.",
    "evidence.claims_h": "Core claims (C1–C4)",
    "evidence.c1_h": "C1: Continuous vs Categorical",
    "evidence.c1_desc": "Does continuous ordinal Hb regression outperform binarised classification? (Measured baseline: Ordinal MAE 2.16 vs Binary 2.14 g/dL)",
    "evidence.c2_h": "C2: Targeted Conjunctiva Masking",
    "evidence.c2_desc": "Does segmenting palpebral conjunctiva outperform whole-frame measurement? (Segmented features consistently reduce variance across lighting shifts)",
    "evidence.c3_h": "C3: Pigmentation Fairness (ITA°)",
    "evidence.c3_desc": "Is error correlated with skin tone (Individual Typology Angle)? Audited using OLS gate; flag set at |m| ≥ 0.002 g/dL/°ITA.",
    "evidence.c4_h": "C4: Multi-Site Generalisation",
    "evidence.c4_desc": "Cross-site transfer between India and Italy reveals a ~20% ambient illumination confound, shifting cross-site error to 3.3–4.4 g/dL.",
    "evidence.prior_work_h": "Published literature comparison",
    "evidence.prior_work_intro": "Haeraombin does not claim to 'beat' existing research. We report transparent, audited metrics alongside published peer-reviewed benchmarks.",
    "evidence.zero_severe_h": "Corpus limitation: zero severe cases",
    "evidence.zero_severe_desc": "Across all 217 patients (126 normal, 76 mild, 15 moderate), there are ZERO severe anaemia cases (<7.0 g/dL). This tool cannot be validated on severe anaemia until a prospective cohort is enrolled.",
    "evidence.low_end_h": "Edge performance & low-end phone benchmark",
    "evidence.low_end_desc": "Optimised for rural health camps and ₹8,000 Android devices with offline WASM execution.",

    "method.explainer_h": "Light absorption & skin pigmentation",
    "method.explainer_desc": "Why smartphone screening is difficult: Haemoglobin and melanin absorb light in overlapping spectral wavelengths (490–577 nm).",
    "method.slider_label": "Simulate skin tone (ITA°)",
    "method.validation_plan_h": "Clinical validation protocol (Planned)",
    "method.validation_plan_desc": "Prospective protocol planned with secondary healthcare centers: venous CBC reference, ethical clearance (IEC), minimum 25% deep pigmentation cohort.",

    "demo.mode": "Demonstration Mode",
    "demo.active_badge": "DEMONSTRATION MODE · Synthetic Tissue Benchmark",
    "demo.case_normal": "Case 1: Normative Tissue (~13.4 g/dL)",
    "demo.case_mild": "Case 2: Mild Pallor (~10.4 g/dL)",
    "demo.case_moderate": "Case 3: Significant Pallor (~8.2 g/dL)",
    "demo.desc": "Demonstration mode uses synthetic conjunctival tissue profiles to verify on-device WebAssembly ONNX inference and colorimetry without requiring live camera access or patient photography.",
    "screen.quality_status": "Image quality gate",
    "screen.quality_pass": "PASS (Exposure & sharpness cleared)",
    "screen.quality_fail_dark": "REJECTED (Image too dark — insufficient illumination on inner eyelid)",
    "screen.quality_fail_bright": "REJECTED (Specular reflection or overexposure detected)",
    "screen.latency_label": "Inference time",
    "screen.model_label": "Model identifier"
  },

  hi: {
    "app.badge": "नैदानिक शोध उपकरण",
    "app.title": "गोपनीयता-संरक्षित ऑन-डिवाइस हीमोग्लोबिन स्क्रीनिंग",
    "app.desc":
      "हेरॉम्बिन (Haeraombin) ब्राउज़र में वेब-असेंबली AI के माध्यम से निचली पलक (कंजंक्टिवा) की तस्वीर से हीमोग्लोबिन स्तर का ऑन-डिवाइस गैर-आक्रामक अनुमान लगाता है।",
    "tag.research": "रिसर्च प्रोटोटाइप",
    "nav.screen": "जाँच",
    "nav.evidence": "प्रमाण",
    "nav.method": "तरीका और सीमाएँ",
    "nav.about": "परिचय",

    "state.online": "इसी डिवाइस पर",
    "state.offline": "ऑफ़लाइन",
    "state.offline_title": "इंटरनेट नहीं है। गणना इसी डिवाइस पर होती है, इसलिए जाँच चलती रहेगी।",

    "screen.empty_label": "कैमरा स्टैंडबाय",
    "screen.empty_body":
      "निचली पलक को धीरे से नीचे खींचें ताकि अंदर की गुलाबी परत (कंजंक्टिवा) फ़्रेम के अंदर दिखे, फिर फ़ोन को करीब 15 सेमी दूर, एक-समान रोशनी में पकड़ें।",
    "screen.start": "कैमरा चालू करें",
    "screen.capture": "फ़ोटो लें",
    "screen.retake": "दोबारा लें",
    "screen.analyse": "ऑन-डिवाइस विश्लेषण",
    "screen.guide_label": "फ़ोटो कैसे लें",
    "screen.guide_body":
      "निचली पलक की गुलाबी परत को दिख रही अंडाकार रेखा के अंदर रखें। फ़ोन स्थिर रखें; फ़्लैश और सीधी चमक से बचें।",

    "result.heading": "अनुमानित हीमोग्लोबिन",
    "result.unit": "g/dL",
    "result.interval": "रेंज {lo}–{hi} g/dL",
    "result.band_ok": "इस मॉडल के सामान्य दायरे में (≥12.0 g/dL)",
    "result.band_warn": "हल्का पीलापन / स्क्रीनिंग चेतावनी (9.0–11.9 g/dL)",
    "result.band_risk": "गंभीर पीलापन / उच्च जोखिम संकेत (<9.0 g/dL)",
    "result.low_high": "यह अनुमान इस मॉडल की निर्णय-सीमा से {band} है।",
    "result.disclaimer":
      "हेरॉम्बिन एक प्रायोगिक शोध प्रोटोटाइप है, प्रमाणित नैदानिक उपकरण नहीं। इसे पुष्ट चिकित्सा परिणाम या उपचार निर्णय के रूप में कभी प्रस्तुत न करें।",

    "abstain.heading": "गुणवत्ता जाँच में तस्वीर अस्वीकृत",
    "abstain.body":
      "तस्वीर गुणवत्ता मानकों (रोशनी, धुंधलापन या गलत फ़्रेमिंग) पर खरी नहीं उतरी। एक-सी रोशनी में दोबारा लें। यह सुरक्षा उपाय है ताकि गलत अनुमान न आए।",

    "error.camera": "कैमरे की अनुमति नहीं मिली या कैमरा उपलब्ध नहीं है। आप प्रदर्शन (डेमो) मोड का उपयोग कर सकते हैं या फ़ोटो अपलोड कर सकते हैं।",
    "error.generic": "छवि विश्लेषण करते समय त्रुटि हुई। कृपया पुनः प्रयास करें।",

    "notice.unavailable": "मॉडल उपलब्ध नहीं है।",
    "notice.unavailable_body":
      "निर्यात किया गया ONNX मॉडल लोड नहीं हो सका। सुनिश्चित करें कि models/model.json उपस्थित है।",

    "evidence.title": "मूल्यांकन परिणाम और निष्पक्षता ऑडिट",
    "evidence.intro":
      "इस डैशबोर्ड का प्रत्येक आँकड़ा रिपॉज़िटरी में दर्ज वास्तविक फ़्रीज़ मूल्यांकन (results.json) से लिया गया है।",
    "evidence.pending":
      "मूल्यांकन डेटा लोड होने के बाद परिणाम यहाँ प्रदर्शित होंगे।",
    "evidence.corpus_h": "डेटासेट कॉर्पस",
    "evidence.roi": "विश्लेषित क्षेत्र",
    "evidence.backbone": "विज़न बैकबोन",
    "evidence.patients": "टेस्ट मरीज़ संख्या",
    "evidence.sites": "अस्पताल स्थल",
    "evidence.features": "फ़ीचर आयाम",
    "evidence.excluded": "हटाए गए फ़ीचर",
    "evidence.none": "कोई नहीं",
    "evidence.heads_h": "मॉडल हेड्स के आधार पर टेस्ट मेट्रिक्स",
    "evidence.head_row":
      "MAE {mae} · RMSE {rmse} · R² {r2} · ±1 g/dL के भीतर {within} · साइट अंतर {gap} ({site})",
    "evidence.calibration_h": "साइट-पार कैलिब्रेशन व प्रकाश अंतर",
    "evidence.calibration_row": "पूल्ड ECE {pooled} · अधिकतम अंतर {gap}",
    "evidence.calibration_sites": "प्रति साइट: {list}",
    "evidence.provenance_h": "स्रोत-विवरण और पुनरुत्पादकता",
    "evidence.commit": "गिट कमिट",
    "evidence.fingerprint": "फ़ीचर फ़िंगरप्रिंट",
    "evidence.generated": "सृजन समय",
    "evidence.dirty": "वर्किंग ट्री स्थिति",
    "evidence.yes": "परिवर्तित",
    "evidence.no": "स्वच्छ",

    "evidence.sweep_h": "मॉडल कॉन्फ़िगरेशन स्वीप",
    "evidence.sweep_intro":
      "स्वीप में उम्मीदवारों को वैलिडेशन फ़ोल्ड पर परखा गया और अंतिम विजेता चुनने के बाद टेस्ट फ़ोल्ड को केवल एक बार पढ़ा गया।",
    "evidence.sweep_metric": "चयन मेट्रिक",
    "evidence.sweep_winner": "विजेता मॉडल",
    "evidence.sweep_gap": "वैलिडेशन अंतर (g/dL)",
    "evidence.sweep_fold": "मरीज़-पृथक विभाजन",
    "evidence.sweep_fold_value": "{train} ट्रेन / {val} वैलिडेशन / {test} टेस्ट",
    "evidence.sweep_near_tie":
      "अंतर 0.10 g/dL से कम है: यह शीर्ष मॉडलों के बीच सांख्यिकीय बराबरी दर्शाता है।",
    "evidence.sweep_row": "val MAE {mae} · val R² {r2}",
    "evidence.sweep_test_h": "अंतिम टेस्ट फ़ोल्ड परिणाम",
    "evidence.sweep_test_row": "MAE {mae} · RMSE {rmse} · R² {r2} · ±1 g/dL के भीतर {within}",
    "evidence.sweep_no_test": "टेस्ट स्कोर उपलब्ध नहीं।",
    "evidence.sweep_unmasked_h": "बिना मास्क वाले नियंत्रण मरीज़",
    "evidence.sweep_unmasked_row":
      "{label}: {count} मरीज़, जिनके रिकॉर्ड में मास्क उपलब्ध नहीं था।",

    "method.title": "कार्यप्रणाली, प्रकाश भौतिकी और सीमाएँ",
    "method.how_h": "हेरॉम्बिन कैसे काम करता है",
    "method.how_b":
      "कैमरा निचली पलक के अंदर की कंजंक्टिवा परत की तस्वीर लेता है, जहाँ मेलेनिन के बिना सीधे केशिका रक्त देखा जा सकता है। कंप्यूटर विज़न सटीक रंग निर्देशांक (CIELAB, Erythema Index, a*/b*) निकालता है और ब्राउज़र वेब-असेंबली के ज़रिए ONNX MobileNetV3 मॉडल को चलाता है। कोई भी तस्वीर कभी भी डिवाइस से बाहर नहीं जाती।",
    "method.cannot_h": "हेरॉम्बिन क्या नहीं कर सकता",
    "method.cannot_b":
      "यह एक स्क्रीनिंग सहायक है, क्लिनिकल निदान नहीं। यह प्रयोगशाला में होने वाली खून की जाँच की जगह नहीं ले सकता, न ही एनीमिया की पुष्टि कर सकता है। असामान्य नतीजा डॉक्टर से मिलने का कारण है, इलाज शुरू करने का नहीं।",
    "method.emergency_b": "आपात स्थिति में या इलाज का फ़ैसला लेने के लिए इसका उपयोग न करें।",
    "method.fair_h": "निष्पक्षता और ज़िम्मेदार AI",
    "method.fair_b":
      "प्रदर्शन को त्वचा के रंग (ITA°) और अलग-अलग अस्पतालों के आधार पर जाँचा जाता है। जहाँ मॉडल में असमानता पाई जाती है, उसे छिपाने के बजाय स्पष्ट रूप से रिपोर्ट किया जाता है।",

    "about.title": "हेरॉम्बिन के बारे में",
    "about.dataset": "कॉर्पस डेटासेट",
    "about.licence": "लाइसेंस",
    "about.runtime": "एज रनटाइम",
    "about.build": "बिल्ड वर्ज़न",
    "about.privacy": "शून्य क्लाउड ट्रांसमिशन: सभी छवियाँ और AI अनुमान स्थानीय ब्राउज़र में वेब-असेंबली के माध्यम से प्रोसेस होते हैं।",
    "about.telemetry_h": "अनाम टेलीमेट्री और गोपनीयता",
    "about.telemetry_optout": "अनाम टेलीमेट्री बंद करें",
    "about.telemetry_desc": "कोई भी तस्वीर, बायोमेट्रिक डेटा या पहचान नेटवर्क पर नहीं भेजी जाती। केवल अनुमान में लगा समय (ms) और सामान्य वर्गीकरण गिनती दर्ज की जाती है।",

    "screen.upload": "फ़ोटो अपलोड करें",
    "screen.sample": "प्रदर्शन (डेमो) मोड",
    "screen.stress": "रोशनी तनाव परीक्षण",
    "screen.camp_mode": "स्वास्थ्य-कार्यकर्ता मोड",
    "screen.camp_active": "स्वास्थ्य-कार्यकर्ता मोड सक्रिय",
    "screen.export_csv": "रिकॉर्ड निर्यात करें (CSV)",
    "screen.print_report": "रिपोर्ट प्रिंट या PDF सहेजें",
    "screen.measured_title": "क्या नापा गया (ऑप्टिकल डेटा)",
    "screen.measured_rgb": "औसत RGB",
    "screen.measured_lab": "CIE L*a*b*",
    "screen.measured_ei": "एरिथेमा इंडेक्स",
    "screen.measured_redness": "लालिमा अनुपात (a*/b*)",
    "screen.audit_badge_title": "निष्पक्षता ऑडिट",
    "screen.audit_badge_supported": "सबग्रुप कैलिब्रेटेड",
    "screen.audit_badge_underpowered": "सीमित डेटा (ITA < 10°)",
    "screen.audit_badge_pending": "फ़्रीज़ रन प्रतीक्षित",
    "screen.stress_exposure": "एक्सपोजर अंतर",
    "screen.stress_wb": "व्हाइट-बैलेंस तापमान",
    "screen.stress_confound_note": "कॉन्फ़ाउंड सूचना: इटली की तस्वीरें भारत की तुलना में ~20% अधिक चमकदार हैं। देखें कि एक्सपोज़र से अनुमान कैसे बदलता है।",

    "evidence.abstain_h": "चयनात्मक अनुमान: अस्वीकार करने का मूल्य",
    "evidence.abstain_intro": "जब तस्वीर खराब हो तो अनुमान न लगाना एक सुरक्षा व्यवहार है, सटीकता का दावा नहीं। पहले फ़्रोज़न रन में, सबसे कम भरोसे वाली तस्वीरों को अस्वीकार करने से औसत निरपेक्ष त्रुटि (MAE) कम नहीं हुई (ऑर्डिनल MAE पूर्ण कवरेज पर 2.16 g/dL से 25% कवरेज पर 2.26 हो गई), इसलिए यह गेट केवल सुरक्षा के लिए रखा गया है।",
    "evidence.claims_h": "मुख्य परिकल्पनाएँ (C1–C4)",
    "evidence.c1_h": "C1: निरंतर बनाम श्रेणीबद्ध",
    "evidence.c1_desc": "क्या निरंतर ऑर्डिनल रिग्रेशन बाइनरी से बेहतर है? (मापा गया: ऑर्डिनल MAE 2.16 बनाम बाइनरी 2.14 g/dL)",
    "evidence.c2_h": "C2: कंजंक्टिवा मास्किंग",
    "evidence.c2_desc": "क्या पलक की परत को अलग करना पूरे फ़्रेम से बेहतर है? (मास्क किए गए फ़ीचर रोशनी बदलाव में त्रुटि घटाते हैं)",
    "evidence.c3_h": "C3: त्वचा रंग निष्पक्षता (ITA°)",
    "evidence.c3_desc": "क्या त्रुटि त्वचा के रंग (ITA°) से जुड़ी है? OLS द्वारा जाँची गई; थ्रेशोल्ड |m| ≥ 0.002 g/dL/°ITA निर्धारित।",
    "evidence.c4_h": "C4: बहु-साइट सामान्यीकरण",
    "evidence.c4_desc": "भारत और इटली के बीच 20% रोशनी अंतर के कारण क्रॉस-साइट त्रुटि 3.3–4.4 g/dL तक बढ़ जाती है।",
    "evidence.prior_work_h": "प्रकाशित शोध से तुलना",
    "evidence.prior_work_intro": "हेरॉम्बिन अन्य शोध से 'बेहतर' होने का दावा नहीं करता। हम प्रकाशित अध्ययनों के साथ पारदर्शी ऑडिट प्रस्तुत करते हैं।",
    "evidence.zero_severe_h": "डेटासेट सीमा: गंभीर स्थिति का कोई केस नहीं",
    "evidence.zero_severe_desc": "सभी 217 मरीज़ों (126 सामान्य, 76 हल्का, 15 मध्यम) में गंभीर एनीमिया (<7.0 g/dL) का एक भी केस नहीं है। नया डेटा मिलने तक इसे गंभीर एनीमिया के लिए मान्य नहीं किया जा सकता।",
    "evidence.low_end_h": "कम कीमत वाले फ़ोन पर प्रदर्शन",
    "evidence.low_end_desc": "ग्रामीण स्वास्थ्य शिविरों और ₹8,000 वाले सामान्य एंड्रॉइड फ़ोन के लिए अनुकूलित।",

    "method.explainer_h": "प्रकाश अवशोषण और त्वचा का रंग",
    "method.explainer_desc": "स्मार्टफ़ोन स्क्रीनिंग कठिन क्यों है: हीमोग्लोबिन और मेलेनिन एक जैसी तरंग दैर्ध्य (490–577 nm) में प्रकाश सोखते हैं।",
    "method.slider_label": "त्वचा का रंग चुनें (ITA°)",
    "method.validation_plan_h": "क्लिनिकल सत्यापन योजना (प्रस्तावित)",
    "method.validation_plan_desc": "सरकारी/सामुदायिक स्वास्थ्य केंद्रों के साथ प्रस्तावित प्रोटोकॉल: वेनस CBC संदर्भ, नैतिक मंज़ूरी, और न्यूनतम 25% गहरी त्वचा वाले प्रतिभागी।",

    "demo.mode": "प्रदर्शन मोड",
    "demo.active_badge": "प्रदर्शन मोड · कृत्रिम ऊतक बेंचमार्क",
    "demo.case_normal": "केस 1: सामान्य ऊतक (~13.4 g/dL)",
    "demo.case_mild": "केस 2: हल्का पीलापन (~10.4 g/dL)",
    "demo.case_moderate": "केस 3: गंभीर पीलापन (~8.2 g/dL)",
    "demo.desc": "डेमो मोड बिना कैमरे या वास्तविक मरीज़ की फ़ोटो के ऑन-डिवाइस वेब-असेंबली ONNX मॉडल व रंग-मापन का परीक्षण करने के लिए कृत्रिम नमूनों का उपयोग करता है।",
    "screen.quality_status": "छवि गुणवत्ता जाँच",
    "screen.quality_pass": "पास (रोशनी और शार्पनेस सही)",
    "screen.quality_fail_dark": "अस्वीकृत (तस्वीर बहुत धुंधली या अंधेरी है — पलक पर रोशनी अपर्याप्त है)",
    "screen.quality_fail_bright": "अस्वीकृत (सीधी चमक या अत्यधिक रोशनी पाई गई)",
    "screen.latency_label": "अनुमान समय",
    "screen.model_label": "मॉडल आर्किटेक्चर"
  },
};

let current = "en";

export function getLang() {
  return current;
}

export function setLang(lang) {
  current = lang === "hi" ? "hi" : "en";
  if (typeof document !== "undefined") {
    document.documentElement.lang = current;
  }
  return current;
}

/** Translate a key, interpolating `{name}` placeholders from `vars`. */
export function t(key, vars) {
  const table = MESSAGES[current] || MESSAGES.en;
  let value = table[key];
  if (value === undefined) value = MESSAGES.en[key];
  if (value === undefined) return key;
  if (vars) {
    value = value.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? String(vars[name]) : `{${name}}`));
  }
  return value;
}

/** Walk `root` and fill every tagged node from the current language. */
export function applyI18n(root = document) {
  for (const node of root.querySelectorAll("[data-i18n]")) {
    node.textContent = t(node.dataset.i18n);
  }
  for (const node of root.querySelectorAll("[data-i18n-aria]")) {
    node.setAttribute("aria-label", t(node.dataset.i18nAria));
  }
}
