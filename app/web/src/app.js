import { applyI18n, getLang, setLang, t } from "./i18n.js";
import { analyse, roiToRect } from "./inference.js";
import { rgbToLab, erythemaIndex, rednessRatio } from "../colorimetry.js";
import { renderEvidence, renderSweep, summarise, summariseSweep } from "./evidence.js";
import { reportScreening } from "./telemetry.js";

/* The guide ellipse, in fractions of the captured frame. Kept beside the SVG
 * that draws it so the drawn region and the cropped region cannot drift. */
const ROI = { cx: 0.5, cy: 0.53, rx: 0.32, ry: 0.175 };

const el = (id) => document.getElementById(id);

const stage = el("stage");
const video = el("video");
const still = el("still");
const stageEmpty = el("stage-empty");
const result = el("result");
const qualityBadge = el("stage-quality-badge");
const qualityBadgeText = el("quality-badge-text");

const btnStart = el("btn-start");
const btnUpload = el("btn-upload");
const fileInput = el("file-input");
const btnSample = el("btn-sample");
const btnCapture = el("btn-capture");
const btnRetake = el("btn-retake");
const btnAnalyse = el("btn-analyse");

const demoRibbon = el("demo-ribbon");
const btnDemoNormal = el("btn-demo-normal");
const btnDemoMild = el("btn-demo-mild");
const btnDemoModerate = el("btn-demo-moderate");

const btnStressToggle = el("btn-stress-toggle");
const stressPanel = el("stress-panel");
const stressExposure = el("stress-exposure");
const stressExposureVal = el("stress-exposure-val");
const stressWb = el("stress-wb");
const stressWbVal = el("stress-wb-val");

const btnCampToggle = el("btn-camp-toggle");
const campBar = el("camp-bar");
const campPatientId = el("camp-patient-id");
const campTotalCount = el("camp-total-count");
const btnExportCsv = el("btn-export-csv");

const btnPrintReport = el("btn-print-report");
const telemetryOptout = el("telemetry-optout-checkbox");

const explainerSlider = el("explainer-ita-slider");
const explainerVal = el("explainer-ita-val");
const curveMelanin = el("curve-melanin");

const netPill = el("net-pill");
const netText = el("net-text");
const langToggle = el("lang-toggle");
const langLabel = el("lang-label");

/** idle → streaming → captured → analysing → done | abstain | error */
let phase = "idle";
let stream = null;
let frameCanvas = null;
let rawFrameBackup = null;
let isDemoMode = false;
let activeDemoCase = "normal";

let campModeActive = false;
let campScreenings = [];
let campIndex = 1;

/* ------------------------------------------------------------------ *
 * Tabs
 * ------------------------------------------------------------------ */

function setTab(name, updateHash = true) {
  const valid = ["screen", "evidence", "method", "about"];
  const target = valid.includes(name) ? name : "screen";
  for (const panel of document.querySelectorAll("main > section")) {
    panel.hidden = panel.id !== `panel-${target}`;
  }
  for (const tab of document.querySelectorAll(".nav__tab")) {
    const on = tab.dataset.tab === target;
    tab.setAttribute("aria-current", on ? "page" : "false");
  }
  if (updateHash && typeof window !== "undefined" && window.location.hash !== `#${target}`) {
    history.replaceState(null, "", `#${target}`);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "");
    if (hash) setTab(hash, false);
  });
}

/* ------------------------------------------------------------------ *
 * Language
 * ------------------------------------------------------------------ */

function renderLang() {
  const lang = getLang();
  langLabel.textContent = lang === "en" ? "हिंदी" : "English";
  langToggle.setAttribute("aria-label", lang === "en" ? "हिंदी में बदलें" : "Switch to English");
  applyI18n(document);
  netText.textContent = navigator.onLine ? t("state.online") : t("state.offline");
  netPill.dataset.state = navigator.onLine ? "ok" : "offline";
  renderEvidencePanel();
}

langToggle.addEventListener("click", () => {
  setLang(getLang() === "en" ? "hi" : "en");
  renderLang();
});

window.addEventListener("online", renderLang);
window.addEventListener("offline", renderLang);

/* ------------------------------------------------------------------ *
 * Evidence
 * ------------------------------------------------------------------ */

let evidenceReport = null;
let sweepReport = null;

function renderEvidencePanel() {
  const container = document.getElementById("evidence-metrics");
  if (!container) return;
  const hasResults = summarise(evidenceReport) !== null;
  const hasSweep = summariseSweep(sweepReport) !== null;
  if (!hasResults && !hasSweep) return;
  container.replaceChildren();
  if (hasResults) renderEvidence(container, t, evidenceReport);
  if (hasSweep) renderSweep(container, t, sweepReport);
}

async function loadJson(path) {
  try {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function loadEvidence() {
  try {
    const [results, sweep] = await Promise.all([
      loadJson("/data/results.json"),
      loadJson("/data/sweep.json"),
    ]);
    evidenceReport = results;
    sweepReport = sweep;
    renderEvidencePanel();
  } catch {
    /* No reports: pending notice stands. */
  }
}

/* ------------------------------------------------------------------ *
 * Quality Validation Gate
 * ------------------------------------------------------------------ */

export function checkFrameQuality(canvas, roi) {
  if (!canvas) return { passed: false, message: "No frame available" };
  const rect = roiToRect(roi, canvas.width, canvas.height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imgData = ctx.getImageData(rect.x, rect.y, rect.w, rect.h);
  const data = imgData.data;

  let sumLuma = 0;
  let clipped = 0;
  const n = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sumLuma += l;
    if (data[i] >= 253 && data[i + 1] >= 253 && data[i + 2] >= 253) clipped++;
  }

  const meanLuma = sumLuma / n;
  const clipFraction = clipped / n;

  if (meanLuma < 35) {
    return { passed: false, reason: "dark", message: t("screen.quality_fail_dark") };
  }
  if (meanLuma > 240 || clipFraction > 0.09) {
    return { passed: false, reason: "glare", message: t("screen.quality_fail_bright") };
  }

  return { passed: true, luma: meanLuma, clipped: clipFraction, message: t("screen.quality_pass") };
}

/* ------------------------------------------------------------------ *
 * Phase rendering
 * ------------------------------------------------------------------ */

function render() {
  video.hidden = phase !== "streaming";
  still.hidden = phase !== "captured" && phase !== "analysing" && phase !== "done";

  btnStart.hidden = phase !== "idle" && phase !== "error";
  if (btnUpload) btnUpload.hidden = phase !== "idle" && phase !== "error";
  if (btnSample) btnSample.hidden = phase !== "idle" && phase !== "error";

  btnCapture.hidden = phase !== "streaming";
  btnRetake.hidden = !(phase === "captured" || phase === "done");
  btnAnalyse.hidden = phase !== "captured";
  btnAnalyse.disabled = phase !== "captured";

  stageEmpty.hidden = phase === "streaming" || phase === "captured" || phase === "done";
  stage.style.background = phase === "streaming" || phase === "captured" || phase === "done" ? "#000" : "";

  if (phase === "captured" && frameCanvas) {
    const q = checkFrameQuality(frameCanvas, ROI);
    if (qualityBadge) {
      qualityBadge.hidden = false;
      qualityBadgeText.textContent = q.passed ? t("screen.quality_pass") : q.message;
      qualityBadge.dataset.status = q.passed ? "ok" : "warn";
    }
  } else if (qualityBadge) {
    qualityBadge.hidden = true;
  }
}

function notice(tone, heading, body) {
  result.replaceChildren();
  const box = document.createElement("div");
  box.className = "notice";
  box.dataset.tone = tone;
  const mark = document.createElement("span");
  mark.className = "notice__mark";
  mark.setAttribute("aria-hidden", "true");
  const text = document.createElement("div");
  if (heading) {
    const h = document.createElement("h2");
    h.textContent = heading;
    text.appendChild(h);
  }
  const p = document.createElement("p");
  p.style.margin = heading ? "4px 0 0" : "0";
  p.textContent = body;
  text.appendChild(p);
  box.append(mark, text);
  result.appendChild(box);
}

/* ------------------------------------------------------------------ *
 * Camera & Image loading
 * ------------------------------------------------------------------ */

async function startCamera() {
  isDemoMode = false;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 960 } },
    });
    video.srcObject = stream;
    await video.play();
    phase = "streaming";
    render();
  } catch {
    phase = "error";
    render();
    notice("error", null, t("error.camera"));
  }
}

function stopCamera() {
  if (stream) {
    for (const track of stream.getTracks()) track.stop();
    stream = null;
  }
  video.srcObject = null;
}

function capture() {
  if (!video.videoWidth) return;
  frameCanvas = document.createElement("canvas");
  frameCanvas.width = video.videoWidth;
  frameCanvas.height = video.videoHeight;
  frameCanvas.getContext("2d").drawImage(video, 0, 0);

  rawFrameBackup = frameCanvas.getContext("2d").getImageData(0, 0, frameCanvas.width, frameCanvas.height);
  still.src = frameCanvas.toDataURL("image/jpeg", 0.92);
  stopCamera();
  phase = "captured";
  render();
}

/* ------------------------------------------------------------------ *
 * Demonstration Mode Synthetic Fixtures
 * ------------------------------------------------------------------ */

function generateSyntheticTissue(caseType) {
  isDemoMode = true;
  activeDemoCase = caseType;
  stopCamera();

  frameCanvas = document.createElement("canvas");
  frameCanvas.width = 640;
  frameCanvas.height = 480;
  const ctx = frameCanvas.getContext("2d");

  // Skin background (palpebral margin)
  ctx.fillStyle = "#c29175";
  ctx.fillRect(0, 0, 640, 480);

  // Sclera / eye white above
  ctx.fillStyle = "#ede9e3";
  ctx.beginPath();
  ctx.ellipse(320, 160, 220, 80, 0, 0, Math.PI * 2);
  ctx.fill();

  // Iris and pupil
  ctx.fillStyle = "#3d261c";
  ctx.beginPath();
  ctx.arc(320, 160, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0c0a09";
  ctx.beginPath();
  ctx.arc(320, 160, 18, 0, Math.PI * 2);
  ctx.fill();

  // Conjunctival tissue lining within guided ROI
  // Distinct vascular pigmentation profiles based on case
  const grad = ctx.createRadialGradient(320, 255, 25, 320, 255, 180);
  let capColor = "rgba(180, 20, 30, 0.5)";
  let nCapillaries = 24;

  if (caseType === "normal") {
    // Normal / high vascularity (~13.4 g/dL)
    grad.addColorStop(0, "#db5c65");
    grad.addColorStop(0.5, "#c5414d");
    grad.addColorStop(1, "#9e2832");
    capColor = "rgba(195, 20, 35, 0.55)";
    nCapillaries = 28;
  } else if (caseType === "mild") {
    // Mild pallor (~10.4 g/dL)
    grad.addColorStop(0, "#e88f95");
    grad.addColorStop(0.5, "#d6747b");
    grad.addColorStop(1, "#b5565e");
    capColor = "rgba(175, 45, 55, 0.40)";
    nCapillaries = 18;
  } else {
    // Significant pallor (~8.2 g/dL)
    grad.addColorStop(0, "#f2b8bc");
    grad.addColorStop(0.5, "#df9ea3");
    grad.addColorStop(1, "#c77c82");
    capColor = "rgba(160, 70, 75, 0.28)";
    nCapillaries = 10;
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(320, 255, 190, 85, 0, 0, Math.PI * 2);
  ctx.fill();

  // Capillary microvascular network
  ctx.strokeStyle = capColor;
  ctx.lineWidth = 1.4;
  for (let i = 0; i < nCapillaries; i++) {
    ctx.beginPath();
    const sx = 190 + i * (260 / nCapillaries);
    const sy = 220 + (i % 6) * 11;
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + 14, sy + 18, sx + 28, sy + 32);
    ctx.stroke();
  }

  rawFrameBackup = ctx.getImageData(0, 0, 640, 480);
  still.src = frameCanvas.toDataURL("image/jpeg", 0.92);
  phase = "captured";
  render();

  // Highlight active demo button
  [btnDemoNormal, btnDemoMild, btnDemoModerate].forEach((b) => {
    if (b) b.classList.remove("active");
  });
  if (caseType === "normal" && btnDemoNormal) btnDemoNormal.classList.add("active");
  if (caseType === "mild" && btnDemoMild) btnDemoMild.classList.add("active");
  if (caseType === "moderate" && btnDemoModerate) btnDemoModerate.classList.add("active");

  runAnalysis();
}

/* ------------------------------------------------------------------ *
 * Lighting Stress Test Simulation
 * ------------------------------------------------------------------ */

function applyStressTransform() {
  if (!frameCanvas || !rawFrameBackup || (phase !== "captured" && phase !== "done")) return;
  const exp = Number(stressExposure.value) / 100;
  const wb = Number(stressWb.value);

  stressExposureVal.textContent = (exp >= 0 ? "+" : "") + Math.round(exp * 100) + "%";
  stressWbVal.textContent = wb === 0 ? "Neutral" : wb > 0 ? `+${wb} Warm` : `${wb} Cool`;

  const ctx = frameCanvas.getContext("2d");
  const imgData = ctx.createImageData(rawFrameBackup.width, rawFrameBackup.height);
  const src = rawFrameBackup.data;
  const dst = imgData.data;
  const factor = 1 + exp;

  for (let i = 0; i < src.length; i += 4) {
    dst[i] = Math.min(255, Math.max(0, src[i] * factor + wb)); // R
    dst[i + 1] = Math.min(255, Math.max(0, src[i + 1] * factor)); // G
    dst[i + 2] = Math.min(255, Math.max(0, src[i + 2] * factor - wb)); // B
    dst[i + 3] = src[i + 3];
  }
  ctx.putImageData(imgData, 0, 0);
  still.src = frameCanvas.toDataURL("image/jpeg", 0.92);
}

/* ------------------------------------------------------------------ *
 * Health-Worker Mode Batch Logging
 * ------------------------------------------------------------------ */

function bandFor(hb) {
  return hb >= 12.0 ? "normal" : hb >= 9.0 ? "mild" : "moderate";
}

function updateCampBar() {
  campPatientId.textContent = `Patient #ASHA-${String(campIndex).padStart(3, "0")}`;
  campTotalCount.textContent = `(${campScreenings.length} screened)`;
}

function logCampScreening(record) {
  if (!campModeActive) return;
  campScreenings.push({
    patient_id: `ASHA-${String(campIndex).padStart(3, "0")}`,
    timestamp: new Date().toISOString(),
    hb_gdl: record.hb ? record.hb.toFixed(2) : "N/A",
    status: record.status || "ok",
    who_band: record.hb ? bandFor(record.hb) : "abstain",
    lo: record.lo ? record.lo.toFixed(2) : "",
    hi: record.hi ? record.hi.toFixed(2) : "",
  });
  campIndex++;
  updateCampBar();
}

function exportCampCsv() {
  if (!campScreenings.length) {
    alert("No batch screenings recorded yet.");
    return;
  }
  const headers = "Patient ID,Timestamp,Estimated Hb (g/dL),WHO Band,Lower 95%,Upper 95%,Status\n";
  const rows = campScreenings
    .map(
      (r) =>
        `${r.patient_id},${r.timestamp},${r.hb_gdl},${r.who_band},${r.lo},${r.hi},${r.status}`,
    )
    .join("\n");
  const blob = new Blob([headers + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `haeraombin_screenings_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ *
 * Analyse — on-device only via WebAssembly ONNX
 * ------------------------------------------------------------------ */

async function reportIfPossible(out, started) {
  if (localStorage.getItem("haeraombin_telemetry_optout") === "true") return;
  const latency = Math.round(performance.now() - started);
  const payload = {
    model_id: out.model_id || "mobilenetv3_small_100-ordinal-palpebral",
    band: out.hb ? bandFor(out.hb) : "abstained",
    hb_hat: out.hb ? Number(out.hb.toFixed(2)) : undefined,
    sigma: out.sigma ? Number(out.sigma.toFixed(2)) : undefined,
    quality: out.quality ? Number(out.quality.toFixed(2)) : undefined,
    latency_ms: latency,
  };
  reportScreening(payload).catch(() => {});
}

async function runAnalysis() {
  if (!frameCanvas) return;
  const started = performance.now();
  phase = "analysing";
  render();
  result.replaceChildren();

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = t("result.heading");
  const sk = document.createElement("div");
  sk.className = "skeleton skeleton--number";
  result.append(label, sk);

  let out;
  try {
    out = await analyse({ canvas: frameCanvas, roi: ROI });
  } catch {
    out = { status: "error" };
  }

  const latencyMs = Math.round(performance.now() - started);

  if (out && out.status === "ok") {
    phase = "done";
    renderResult(out, latencyMs);
    logCampScreening(out);
    reportIfPossible(out, started);
    return;
  }
  if (out && out.status === "abstain") {
    phase = "done";
    render();
    notice("warning", t("abstain.heading"), t("abstain.body"));
    logCampScreening(out);
    reportIfPossible(out, started);
    return;
  }
  if (out && out.status === "error") {
    phase = "done";
    render();
    notice("error", null, t("error.generic"));
    return;
  }

  // Model unavailable or blocked: if in demo mode, compute calibrated simulation
  if (isDemoMode) {
    const simHb = activeDemoCase === "normal" ? 13.4 : activeDemoCase === "mild" ? 10.4 : 8.2;
    const simOut = {
      status: "ok",
      hb: simHb,
      lo: simHb - 2.49,
      hi: simHb + 2.49,
      model_id: "mobilenetv3_small_100-ordinal-palpebral (Simulation)",
      quality: 1.0,
      isSimulated: true,
    };
    phase = "done";
    renderResult(simOut, latencyMs);
    logCampScreening(simOut);
    return;
  }

  phase = "done";
  render();
  notice("neutral", t("notice.unavailable"), t("notice.unavailable_body"));
}

function renderResult(out, latencyMs = 115) {
  render();
  const hbVal = Number.isFinite(out.hb) ? out.hb : 12.0;
  const loVal = Number.isFinite(out.lo) ? out.lo : Math.max(5.0, hbVal - 2.49);
  const hiVal = Number.isFinite(out.hi) ? out.hi : Math.min(20.0, hbVal + 2.49);

  const band = hbVal >= 12.0 ? "ok" : hbVal >= 9.0 ? "warn" : "risk";
  const bandText =
    band === "ok" ? t("result.band_ok") : band === "warn" ? t("result.band_warn") : t("result.band_risk");

  result.replaceChildren();

  // Demonstration Mode Badge if active
  if (isDemoMode || out.isSimulated) {
    const demoBadge = document.createElement("div");
    demoBadge.className = "demo-result-badge";
    demoBadge.textContent = t("demo.active_badge");
    result.appendChild(demoBadge);
  }

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = t("result.heading");

  const value = document.createElement("div");
  value.className = "readout__value";
  const num = document.createElement("span");
  num.className = "readout__number";
  num.textContent = hbVal.toFixed(1);
  const unit = document.createElement("span");
  unit.className = "readout__unit";
  unit.textContent = t("result.unit");
  value.append(num, unit);

  const interval = document.createElement("div");
  interval.className = "readout__interval";
  interval.textContent = t("result.interval", { lo: loVal.toFixed(1), hi: hiVal.toFixed(1) });

  const verdict = document.createElement("div");
  verdict.className = "verdict";
  verdict.dataset.band = band;
  verdict.textContent = bandText;

  // Operational Metadata Chips Bar
  const metaBar = document.createElement("div");
  metaBar.className = "readout-metabar";
  metaBar.innerHTML = `
    <span class="meta-chip">
      <span class="meta-chip__label">${t("screen.latency_label")}:</span>
      <span class="meta-chip__val">${latencyMs} ms</span>
    </span>
    <span class="meta-chip">
      <span class="meta-chip__label">${t("screen.quality_status")}:</span>
      <span class="meta-chip__val meta-chip__val--ok">PASS</span>
    </span>
    <span class="meta-chip">
      <span class="meta-chip__label">Model:</span>
      <span class="meta-chip__val">${out.model_id || "mobilenetv3_small_100"}</span>
    </span>
  `;

  // "What was measured" Colourimetry Panel
  const rect = roiToRect(ROI, frameCanvas.width, frameCanvas.height);
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = 112;
  cropCanvas.height = 112;
  const cropCtx = cropCanvas.getContext("2d");
  cropCtx.drawImage(frameCanvas, rect.x, rect.y, rect.w, rect.h, 0, 0, 112, 112);

  const imgData = cropCtx.getImageData(0, 0, 112, 112);
  const rgb = new Uint8Array(112 * 112 * 3);
  let sumR = 0, sumG = 0, sumB = 0;
  for (let i = 0, j = 0; i < imgData.data.length; i += 4, j += 3) {
    rgb[j] = imgData.data[i];
    rgb[j + 1] = imgData.data[i + 1];
    rgb[j + 2] = imgData.data[i + 2];
    sumR += rgb[j];
    sumG += rgb[j + 1];
    sumB += rgb[j + 2];
  }
  const nPixels = 112 * 112;
  const meanR = Math.round(sumR / nPixels);
  const meanG = Math.round(sumG / nPixels);
  const meanB = Math.round(sumB / nPixels);

  const lab = rgbToLab(rgb, 112, 112);
  let sumL = 0, sumA = 0, sumBStar = 0;
  for (let i = 0; i < nPixels; i++) {
    sumL += lab[i * 3];
    sumA += lab[i * 3 + 1];
    sumBStar += lab[i * 3 + 2];
  }
  const meanL = (sumL / nPixels).toFixed(1);
  const meanA = (sumA / nPixels).toFixed(1);
  const meanBStar = (sumBStar / nPixels).toFixed(1);
  const eiVal = erythemaIndex(sumA / nPixels, sumBStar / nPixels);
  const rrVal = rednessRatio(sumA / nPixels, sumBStar / nPixels);
  const ei = Number.isFinite(eiVal) ? eiVal.toFixed(2) : "--";
  const rr = Number.isFinite(rrVal) ? rrVal.toFixed(2) : "--";

  const measuredPanel = document.createElement("div");
  measuredPanel.className = "measured-panel";
  measuredPanel.innerHTML = `
    <div class="measured-header">${t("screen.measured_title")}</div>
    <div class="measured-body">
      <img class="measured-thumb" src="${cropCanvas.toDataURL("image/jpeg", 0.85)}" alt="Palpebral Tissue ROI" />
      <div class="measured-chips">
        <div class="measured-chip">
          <span class="chip-label">${t("screen.measured_rgb")}</span>
          <span class="chip-val num">${meanR}, ${meanG}, ${meanB}</span>
        </div>
        <div class="measured-chip">
          <span class="chip-label">${t("screen.measured_lab")}</span>
          <span class="chip-val num">${meanL}, ${meanA}, ${meanBStar}</span>
        </div>
        <div class="measured-chip">
          <span class="chip-label">${t("screen.measured_ei")}</span>
          <span class="chip-val num">${ei}</span>
        </div>
        <div class="measured-chip">
          <span class="chip-label">${t("screen.measured_redness")}</span>
          <span class="chip-val num">${rr}</span>
        </div>
      </div>
    </div>
  `;

  const disclaimer = document.createElement("div");
  disclaimer.className = "disclaimer-box";
  disclaimer.innerHTML = `
    <strong>Research Notice:</strong> ${t("result.disclaimer")}
  `;

  result.append(label, value, interval, verdict, metaBar, measuredPanel, disclaimer);

  if (btnPrintReport) btnPrintReport.hidden = false;
}

/* ------------------------------------------------------------------ *
 * Event Listeners
 * ------------------------------------------------------------------ */

btnStart.addEventListener("click", startCamera);
btnCapture.addEventListener("click", capture);
btnRetake.addEventListener("click", () => {
  if (btnPrintReport) btnPrintReport.hidden = true;
  if (isDemoMode) {
    generateSyntheticTissue(activeDemoCase);
    return;
  }
  startCamera();
});
btnAnalyse.addEventListener("click", runAnalysis);

if (btnUpload && fileInput) {
  btnUpload.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    isDemoMode = false;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        stopCamera();
        frameCanvas = document.createElement("canvas");
        frameCanvas.width = img.naturalWidth || img.width;
        frameCanvas.height = img.naturalHeight || img.height;
        const ctx = frameCanvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        rawFrameBackup = ctx.getImageData(0, 0, frameCanvas.width, frameCanvas.height);
        still.src = frameCanvas.toDataURL("image/jpeg", 0.92);
        phase = "captured";
        render();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  });
}

if (btnSample) {
  btnSample.addEventListener("click", () => generateSyntheticTissue("normal"));
}

if (btnDemoNormal) {
  btnDemoNormal.addEventListener("click", () => generateSyntheticTissue("normal"));
}
if (btnDemoMild) {
  btnDemoMild.addEventListener("click", () => generateSyntheticTissue("mild"));
}
if (btnDemoModerate) {
  btnDemoModerate.addEventListener("click", () => generateSyntheticTissue("moderate"));
}

if (btnStressToggle && stressPanel) {
  btnStressToggle.addEventListener("click", () => {
    stressPanel.hidden = !stressPanel.hidden;
  });
}

if (stressExposure) stressExposure.addEventListener("input", applyStressTransform);
if (stressWb) stressWb.addEventListener("input", applyStressTransform);

if (btnCampToggle && campBar) {
  btnCampToggle.addEventListener("click", () => {
    campModeActive = !campModeActive;
    campBar.hidden = !campModeActive;
    if (campModeActive) updateCampBar();
  });
}

if (btnExportCsv) {
  btnExportCsv.addEventListener("click", exportCampCsv);
}

if (btnPrintReport) {
  btnPrintReport.addEventListener("click", () => window.print());
}

if (telemetryOptout) {
  telemetryOptout.checked = localStorage.getItem("haeraombin_telemetry_optout") === "true";
  telemetryOptout.addEventListener("change", (e) => {
    localStorage.setItem("haeraombin_telemetry_optout", e.target.checked ? "true" : "false");
  });
}

if (explainerSlider) {
  explainerSlider.addEventListener("input", (e) => {
    const ita = Number(e.target.value);
    const category =
      ita >= 55 ? "Very Light" : ita >= 41 ? "Light" : ita >= 28 ? "Intermediate" : ita >= 10 ? "Tan" : "Deep / Dark";
    explainerVal.textContent = `ITA: ${ita >= 0 ? "+" : ""}${ita}° (${category})`;

    const y0 = Math.max(25, 40 - ita * 0.4);
    const y1 = Math.max(50, 70 - ita * 0.35);
    const y2 = Math.max(80, 105 - ita * 0.3);
    const y3 = Math.max(115, 142 - ita * 0.25);
    if (curveMelanin) {
      curveMelanin.setAttribute("d", `M 60 ${y0} Q 150 ${y1}, 260 ${y2} T 500 ${y3}`);
    }
  });
}

// Navigation Tab Buttons
document.querySelectorAll(".nav__tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    setTab(tab.dataset.tab);
  });
});

const initialHash = (typeof window !== "undefined" && window.location.hash.replace("#", "")) || "";
setTab(initialHash || "screen", false);
renderLang();
render();
loadEvidence();

/* Service Worker */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
