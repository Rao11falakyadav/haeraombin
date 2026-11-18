# HAERAOMBIN
### Privacy-First Edge AI | ONNX Runtime | WebAssembly

**Bringing AI inference directly to the browser — without sending user images to the cloud.**

HAERAOMBIN is an edge-AI project designed to make machine learning inference accessible on everyday smartphones. It uses a lightweight ONNX model and WebAssembly-based execution to perform inference directly in the browser, reducing dependency on cloud infrastructure and protecting image privacy.

---

## Overview

Traditional AI applications often depend on cloud servers for image processing and inference. This can introduce latency, infrastructure costs, connectivity requirements and privacy concerns.

HAERAOMBIN explores an alternative: running AI inference locally on the user's device.

The project focuses on:

- Browser-based AI inference.
- Lightweight machine learning deployment.
- Privacy-first image processing.
- Smartphone accessibility.
- Efficient execution using ONNX and WebAssembly.

## Key Features

- **Edge AI Inference:** Runs the model locally in the browser.
- **Privacy-First Processing:** User images are not transmitted to cloud servers for inference.
- **Lightweight Model:** Approximately 4.2 MB ONNX model.
- **WebAssembly Execution:** Enables machine learning inference within a browser environment.
- **Mobile Accessibility:** Designed for everyday smartphones.
- **Low-Latency Inference:** Approximately 115 ms observed inference time on a tested entry-level Android device.

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Model development and preparation |
| ONNX | Portable machine learning model |
| ONNX Runtime Web | Browser-based model inference |
| WebAssembly (WASM) | Efficient local execution |
| JavaScript | Frontend and inference integration |
| HTML5 / CSS3 | User interface |
| Git / GitHub | Version control |

*The table describes the project architecture; adjust it if your actual implementation uses different libraries.*

## System Architecture

```text
          User
            |
            v
      Web Application
            |
            v
       Image Input
            |
            v
    Image Preprocessing
            |
            v
      ONNX Model
            |
            v
   ONNX Runtime Web
            |
            v
    WebAssembly (WASM)
            |
            v
     Local Inference
            |
            v
    Prediction Output
```

All inference is designed to happen on the client device rather than requiring cloud-based image processing.

## Performance

| Metric | Observed Result |
|---|---|
| ONNX Model Size | ~4.2 MB |
| Inference Time | ~115 ms |
| Test Device | Entry-level Android smartphone (~₹8,000) |
| Execution Environment | Browser / WebAssembly |
| Image Transmission | No cloud image transmission for inference |

*Performance figures are observations from the tested setup, not universal hardware benchmarks.*

## Privacy & Responsible AI

HAERAOMBIN follows a privacy-conscious deployment approach.

- Images are processed locally for inference.
- No cloud image transmission is required for the inference workflow.
- Lightweight deployment reduces infrastructure dependency.
- Model documentation and evaluation materials support transparency.
- Fairness and model limitations should be considered when interpreting predictions.

## Project Documentation

The project aims to maintain transparent documentation, including:

- Model Card
- Dataset Card
- Fairness Documentation
- Model Evaluation

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Rao11falakyadav/haeraombin.git
```

### 2. Navigate to the project

```bash
cd haeraombin
```

### 3. Install dependencies

Follow the dependency and setup instructions provided in the project configuration files.

### 4. Run the application

Start the application using the development command configured in the project.

*Exact installation and execution commands should be updated according to the actual project configuration.*

## Project Structure

```text
haeraombin/
│
├── README.md
├── [Application Source]
├── [Model Files]
├── [Documentation]
└── [Configuration Files]
```

The directory structure above is illustrative. Refer to the actual repository for the complete implementation.

## Future Scope

- Further model optimization and quantization.
- Improved inference performance across mobile devices.
- Expanded device compatibility.
- Enhanced model evaluation and fairness testing.
- Improved accessibility and user experience.
- Continued exploration of privacy-preserving edge AI.

## Why HAERAOMBIN?

HAERAOMBIN explores an important direction in practical AI engineering: moving intelligence closer to the user.

Instead of assuming that powerful AI requires powerful cloud infrastructure, this project demonstrates the potential of lightweight models, browser-based execution and edge computing.

**AI should be accessible, efficient and privacy-conscious.**

---

## Repository

GitHub: https://github.com/Rao11falakyadav/haeraombin

**Project:** HAERAOMBIN  
**Domain:** Artificial Intelligence | Machine Learning | Edge AI  
**Deployment Approach:** Browser-Based On-Device Inference

---

*Built with a focus on practical AI engineering, accessibility and responsible deployment.*