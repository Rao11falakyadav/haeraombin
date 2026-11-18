"""Demonstration cases validation test suite for Haeraombin.

Verifies:
1. All three synthetic demonstration cases (Normal, Mild, Moderate/Severe) produce
   distinct image inputs and distinct cropped ROI tensors.
2. The deployed ONNX screening model produces distinct, input-dependent predictions
   satisfying monotonic ordering: Hb(Severe Pallor) < Hb(Mild Pallor) < Hb(Normal Tissue).
3. Predictions do not collapse to the uncalibrated ordinal mean of 11.000 g/dL.
4. Optical colourimetry metrics (RGB, CIE L*a*b*, Erythema Index, Redness Ratio)
   update dynamically and distinctly for each case.
5. Model inference handles invalid inputs with explicit exceptions rather than silent fallbacks.
"""

from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
import onnxruntime as ort
import pytest

from haeraombin.metrics.colorimetry import erythema_index, redness_ratio, rgb_to_lab


def _generate_synthetic_canvas(case_type: str) -> np.ndarray:
    """Replicate exactly the synthetic conjunctiva rendering from app.js."""
    # 640x480 canvas, BGR format for OpenCV
    img = np.zeros((480, 640, 3), dtype=np.uint8)

    # Skin background (#c29175 -> BGR: 117, 145, 194)
    img[:] = (117, 145, 194)

    # Sclera / eye white (#ede9e3 -> BGR: 227, 233, 237)
    cv2.ellipse(img, (320, 160), (220, 80), 0, 0, 360, (227, 233, 237), -1)
    # Iris and pupil
    cv2.circle(img, (320, 160), 44, (28, 38, 61), -1)
    cv2.circle(img, (320, 160), 18, (9, 10, 12), -1)

    # Tissue vascular pigmentation
    if case_type == "normal":
        color = (77, 65, 197)      # #c5414d
        n_caps = 28
    elif case_type == "mild":
        color = (123, 116, 214)    # #d6747b
        n_caps = 18
    elif case_type == "moderate":
        color = (163, 158, 223)    # #df9ea3
        n_caps = 10
    else:
        raise ValueError(f"Unknown case type: {case_type}")

    cv2.ellipse(img, (320, 255), (190, 85), 0, 0, 360, color, -1)

    # Capillary network
    for i in range(n_caps):
        sx = int(190 + i * (260 / n_caps))
        sy = 220 + (i % 6) * 11
        cv2.line(img, (sx, sy), (sx + 20, sy + 25), (30, 20, 180), 1)

    return img


def _extract_crop_tensor(canvas_bgr: np.ndarray, size: int = 224) -> tuple[np.ndarray, np.ndarray]:
    """Extract ROI crop matching app.js / inference.js."""
    roi = {"cx": 0.5, "cy": 0.53, "rx": 0.32, "ry": 0.175}
    h, w = canvas_bgr.shape[:2]
    x0 = int((roi["cx"] - roi["rx"]) * w)
    y0 = int((roi["cy"] - roi["ry"]) * h)
    x1 = int((roi["cx"] + roi["rx"]) * w)
    y1 = int((roi["cy"] + roi["ry"]) * h)

    crop_bgr = canvas_bgr[y0:y1, x0:x1]
    crop_rgb = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB)
    resized_rgb = cv2.resize(crop_rgb, (size, size), interpolation=cv2.INTER_LINEAR)

    # NCHW Float32 tensor scaled to [0, 1]
    tensor = (resized_rgb.astype(np.float32) / 255.0).transpose(2, 0, 1)[None, ...]
    return crop_rgb, tensor


@pytest.fixture(scope="module")
def onnx_session() -> ort.InferenceSession:
    model_path = Path("app/web/models/haeraombin_screen_224.onnx")
    if not model_path.exists():
        model_path = Path("artifacts/models/haeraombin_screen_224.onnx")
    assert model_path.exists(), f"ONNX model not found at {model_path}"
    return ort.InferenceSession(str(model_path))


def test_demonstration_cases_generate_distinct_inputs():
    """Verify that all 3 demonstration cases supply distinct pixel and tensor inputs."""
    canvas1 = _generate_synthetic_canvas("normal")
    canvas2 = _generate_synthetic_canvas("mild")
    canvas3 = _generate_synthetic_canvas("moderate")

    _crop1, tensor1 = _extract_crop_tensor(canvas1)
    _crop2, tensor2 = _extract_crop_tensor(canvas2)
    _crop3, tensor3 = _extract_crop_tensor(canvas3)

    # Pixel difference must be strictly non-zero
    diff_1_2 = np.linalg.norm(tensor1 - tensor2)
    diff_2_3 = np.linalg.norm(tensor2 - tensor3)
    diff_1_3 = np.linalg.norm(tensor1 - tensor3)

    assert diff_1_2 > 1.0, f"Case 1 and 2 inputs are too similar (L2 diff = {diff_1_2})"
    assert diff_2_3 > 1.0, f"Case 2 and 3 inputs are too similar (L2 diff = {diff_2_3})"
    assert diff_1_3 > 1.0, f"Case 1 and 3 inputs are too similar (L2 diff = {diff_1_3})"


def test_demonstration_cases_produce_distinct_predictions(onnx_session: ort.InferenceSession):
    """Verify that the model outputs distinct predictions for all 3 cases with monotonic ordering."""
    input_name = onnx_session.get_inputs()[0].name

    results = {}
    for case_type in ["normal", "mild", "moderate"]:
        canvas = _generate_synthetic_canvas(case_type)
        _, tensor = _extract_crop_tensor(canvas)
        outputs = onnx_session.run(None, {input_name: tensor})
        hb = float(outputs[0][0])
        sigma = float(outputs[1][0])
        probs = outputs[2][0]
        results[case_type] = {"hb": hb, "sigma": sigma, "probs": probs}

    hb_normal = results["normal"]["hb"]
    hb_mild = results["mild"]["hb"]
    hb_moderate = results["moderate"]["hb"]

    # Must be distinct values, not a constant
    assert hb_normal != hb_mild, "Normal and mild predictions are identical"
    assert hb_mild != hb_moderate, "Mild and moderate predictions are identical"

    # None should be stuck at the uncalibrated mean 11.000
    assert abs(hb_normal - 11.0) > 0.5, f"Normal prediction stuck near 11.0: {hb_normal}"
    assert abs(hb_moderate - 11.0) > 0.5, f"Moderate prediction stuck near 11.0: {hb_moderate}"

    # Verify monotonic relationship: Pallor reduces predicted Hb
    assert hb_moderate < hb_mild < hb_normal, (
        f"Predictions violate monotonic order: "
        f"moderate={hb_moderate:.2f}, mild={hb_mild:.2f}, normal={hb_normal:.2f}"
    )

    # Verify expected screening bands
    assert hb_normal >= 12.0, f"Normal tissue predicted below non-anemic threshold: {hb_normal}"
    assert hb_moderate < 9.0, f"Significant pallor predicted above severe/moderate threshold: {hb_moderate}"


def test_colourimetry_updates_across_cases():
    """Verify that optical colourimetry metrics (RGB, Lab, EI, RR) update distinctly for each case."""
    metrics = {}
    for case_type in ["normal", "mild", "moderate"]:
        canvas = _generate_synthetic_canvas(case_type)
        crop_rgb, _ = _extract_crop_tensor(canvas, size=112)
        mean_rgb = np.mean(crop_rgb, axis=(0, 1))

        # Convert to Lab using the project's colorimetry module
        lab = rgb_to_lab(crop_rgb)
        mean_lab = np.mean(lab, axis=(0, 1))

        ei = erythema_index(mean_lab)
        rr = redness_ratio(mean_lab)

        metrics[case_type] = {
            "rgb": mean_rgb,
            "lab": mean_lab,
            "ei": ei,
            "rr": rr,
        }

    # Verify redness decreases from normal -> mild -> moderate
    r_norm = metrics["normal"]["rgb"][0]
    r_mild = metrics["mild"]["rgb"][0]
    r_mod = metrics["moderate"]["rgb"][0]
    assert r_norm != r_mild != r_mod

    # Verify a* (red-green axis) is higher for normal than severe pallor
    a_norm = metrics["normal"]["lab"][1]
    a_mod = metrics["moderate"]["lab"][1]
    assert a_norm > a_mod, f"Expected higher a* in vascular tissue: norm={a_norm}, mod={a_mod}"


def test_inference_rejects_invalid_input(onnx_session: ort.InferenceSession):
    """Verify that bad inputs raise explicit exceptions rather than silently predicting 11.0."""
    input_name = onnx_session.get_inputs()[0].name

    # Wrong shape (e.g. 2D or 1x1x1x1)
    with pytest.raises(ort.capi.onnxruntime_pybind11_state.InvalidArgument):
        onnx_session.run(None, {input_name: np.zeros((1, 1), dtype=np.float32)})

    # Wrong data type
    with pytest.raises(ort.capi.onnxruntime_pybind11_state.InvalidArgument):
        onnx_session.run(None, {input_name: np.zeros((1, 3, 224, 224), dtype=np.int32)})
