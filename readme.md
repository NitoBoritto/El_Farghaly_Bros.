<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,50:16213e,100:0f3460&height=200&section=header&text=El%20Farghaly%20Bros.&fontSize=52&fontColor=e94560&fontAlignY=38&desc=Client%20Term%20Deposit%20Predictor&descSize=20&descAlignY=60&descColor=a8b2d8" />

<br/>

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Production-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LightGBM](https://img.shields.io/badge/LightGBM-Optuna_HPO-9C27B0?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABhSURBVHgBrZDRCQAgCER9mw2cIAeqhcr1XGIHaqnEB/UkCE7uhDFIBEAKAEQAIARYtAQdLEo8lWTWdoywzNVRUaYeajvVcckz81h/dkWN7m2zf+11jz+z2QEAAAD//wMABn4EMmjdMkIAAAAASUVORK5CYII=)](https://lightgbm.readthedocs.io)
[![Azure](https://img.shields.io/badge/Azure-App_Service-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)](https://azure.microsoft.com)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![MLflow](https://img.shields.io/badge/MLflow-Experiment_Tracking-0194E2?style=for-the-badge&logo=mlflow&logoColor=white)](https://mlflow.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)

<br/>

> **End-to-end production ML system** for predicting whether a bank client will subscribe to a term deposit.  
> Built on the UCI Bank Marketing dataset · LightGBM + Optuna HPO · FastAPI backend · Azure-deployed via Docker & CI/CD.

<br/>

[🚀 Live Demo](#-live-demo) · [📐 Architecture](#-architecture) · [📊 Model Performance](#-model-performance) · [⚡ Quickstart](#-quickstart) · [🔌 API Reference](#-api-reference)

</div>

---

## 🎯 Problem Statement

A Portuguese retail bank ran direct telemarketing campaigns (phone calls) to sell **term deposit subscriptions**. The dataset is severely class-imbalanced — roughly **88% negative / 12% positive** — making raw accuracy a dangerously misleading metric.

The engineering challenge: **maximize recall on the positive class** (capture as many real subscribers as possible) while maintaining acceptable precision — so the call center isn't flooded with false positives. This demands careful threshold tuning, imbalance handling (SMOTE), and a metric-first mindset throughout the pipeline.

---

## 🚀 Live Demo

| Component | URL |
|-----------|-----|
| 📊 Live Dashboard | [Click Here](https://farghali-subscription-predictor-arcgaqh5hrd3gpdt.uaenorth-01.azurewebsites.net) |


---

## 📐 Architecture

The system follows a fully automated MLOps lifecycle — from raw data ingestion through cloud deployment:

```
┌──────────────────────────────────────────────────────────────────┐
│                    RAW DATA SOURCE                               │
│             UCI Bank Marketing (41,188 records)                  │
└──────────────────────┬───────────────────────────────────────────┘
                       │  ODBC / SQLAlchemy
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                 AZURE SQL DATABASE                               │
│        Structured storage · versioned ingestion · audit trail    │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│              PREPROCESSING PIPELINE                              │
│   StandardScaler · OrdinalEncoder · SMOTE / class_weight         │
│   Great Expectations data validation                             │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                 MODEL TRAINING                                   │
│   LightGBM Classifier                                            │
│   Optuna HPO  (TPE Sampler · Stratified K-Fold CV)               │
│   MLflow  →  experiment registry · artifact storage              │
│   Custom threshold tuning  (F1-optimized on validation set)      │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                  FASTAPI BACKEND                                 │
│   /predict  ·  /health  ·  /metrics   (Uvicorn ASGI)             │
│   Pydantic schemas · typed request/response models               │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                  JS SPA DASHBOARD                                │
│   Chart.js visualizations · live API calls · real-time metrics   │
└──────────────────────┬───────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│              CONTAINERIZATION & DEPLOYMENT                       │
│   Docker → GitHub Actions → Docker Hub → Azure Webhook           │
│   Rolling deploy · zero-downtime · secret injection              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 Model Performance

> Threshold was tuned **post-training** on the held-out validation set to optimize F1 on the minority class. The default 0.5 threshold was deliberately **not** used.

| Metric | Value |
|--------|-------|
| **Algorithm** | LightGBM |
| **HPO** | Optuna (TPE Sampler) |
| **CV Strategy** | Stratified K-Fold |
| **ROC-AUC** | 80.9% |
| **F1** | 66.7% |
| **Recall** | 75% |

> 💡 **How to fill these in:** after running `python src/train.py`, check your MLflow UI or the output of `src/evaluate.py` — the final metrics are logged there. Paste them here once you have them.

### Why LightGBM?

- **Handles imbalanced data natively** via `class_weight` and `scale_pos_weight`
- **Faster training** than XGBoost on tabular data with 40k+ rows
- **Native categorical support** reduces preprocessing overhead
- **Highly tunable** — Optuna finds the sweet spot across `num_leaves`, `min_child_samples`, `learning_rate`, and regularization parameters in far fewer trials than grid search

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Language** | Python 3.11 | Core runtime |
| **ML** | LightGBM + scikit-learn + imbalanced-learn | Modeling & class balancing |
| **HPO** | Optuna (TPE) | Hyperparameter optimization |
| **Experiment Tracking** | MLflow + Azure ML | Run registry, model artifacts |
| **Data Validation** | Great Expectations | Schema & distribution checks |
| **Backend** | FastAPI + Uvicorn | Production inference API |
| **Database** | Azure SQL (pyodbc + SQLAlchemy) | Structured data storage |
| **Frontend** | Vanilla JS + HTML/CSS + Chart.js | Live prediction dashboard |
| **Containerization** | Docker | Reproducible environment |
| **CI/CD** | GitHub Actions → Docker Hub → Azure Webhook | Automated deploy pipeline |
| **Cloud** | Azure App Service | Scalable hosting |
| **Testing** | pytest | API & unit tests |
| **Code Quality** | Black | Consistent formatting |

---

## 🗂️ Project Structure

```
El_Farghaly_Bros./
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD: test → build → push → deploy
│
├── notebooks/
│   └── EDA.ipynb                   # Exploratory data analysis
│
├── src/
│   ├── data_ingestion.py           # Load from Azure SQL via SQLAlchemy
│   ├── preprocessing.py            # sklearn Pipeline: scaler + encoder
│   ├── train.py                    # Optuna + LightGBM training loop
│   ├── evaluate.py                 # Metrics, threshold tuning, confusion matrix
│   └── predict.py                  # Inference logic (load model + threshold)
│
├── api/
│   ├── main.py                     # FastAPI app entry point
│   ├── router.py                   # APIRouter: /predict, /health, /metrics
│   └── schemas.py                  # Pydantic request/response models
│
├── frontend/
│   ├── index.html                  # SPA shell
│   ├── app.js                      # Chart.js + live API fetch
│   └── styles.css                  # Dashboard styles
│
├── tests/
│   └── test_api.py                 # pytest: endpoint tests
│
├── scripts/                        # Helper / utility scripts
│
├── Dockerfile                      # Production container image
├── docker-compose.yml              # Local dev multi-service setup
├── database.py                     # DB connection factory
├── requirements.txt                # Pinned dependencies
├── .env.example                    # Environment variable template
├── .gitignore
└── README.md
```

---

## ⚡ Quickstart

### Prerequisites

- Python **3.11+**
- Docker (for containerized run)
- Azure SQL instance **or** a local SQL Server with ODBC Driver 18
- An MLflow tracking server (local or Azure ML)

---

### 1. Clone the Repository

```bash
git clone https://github.com/NitoBoritto/El_Farghaly_Bros..git
cd El_Farghaly_Bros.
```

### 2. Set Up the Environment

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy and fill in your credentials:

```bash
cp .env.example .env
# Open .env and set your Azure SQL connection string and MLflow tracking URI
```

### 3. Train the Model

```bash
python src/train.py
```

This will:
1. Pull data from Azure SQL
2. Run the preprocessing pipeline
3. Launch Optuna HPO (TPE sampler) — all trials logged to MLflow
4. Train the best model on the full training set
5. Tune the decision threshold on the validation set
6. Serialize the model artifact + threshold for serving

### 4. Run the API Locally

```bash
uvicorn api.main:app --reload --port 8000
```

Interactive docs available at → `http://localhost:8000/docs`

### 5. Run with Docker

```bash
# Build the image
docker build -t elfarghaly-predictor .

# Run with your env file
docker run -p 8000:8000 --env-file .env elfarghaly-predictor
```

---

## 🔌 API Reference

### `POST /predict`

Submit a client record and receive a subscription prediction with probability.

**Request Body:**

```json
{
  "age": 35,
  "job": "admin.",
  "marital": "married",
  "education": "university.degree",
  "default": "no",
  "housing": "yes",
  "loan": "no",
  "contact": "cellular",
  "month": "may",
  "day_of_week": "mon",
  "duration": 180,
  "campaign": 2,
  "pdays": 999,
  "previous": 0,
  "poutcome": "nonexistent",
  "emp_var_rate": -1.8,
  "cons_price_idx": 92.893,
  "cons_conf_idx": -46.2,
  "euribor3m": 1.354,
  "nr_employed": 5099.1
}
```

**Response:**

```json
{
  "prediction": "yes",
  "probability": 0.73,
  "threshold_used": 0.42
}
```

---

### `GET /health`

Returns service status and currently loaded model version.

```json
{
  "status": "healthy",
  "model_version": "lgbm-v1.2",
  "uptime_seconds": 3820
}
```

---

### `GET /metrics`

Returns the evaluation metrics from the last trained model run.

```json
{
  "roc_auc": 0.928,
  "f1_positive": 0.67,
  "precision": 0.71,
  "recall": 0.63,
  "threshold": 0.38
}
```

---

## 🚢 CI/CD Pipeline

Every push to `main` triggers a fully automated deployment pipeline:

```
git push origin main
        │
        ▼
┌───────────────────┐
│  GitHub Actions   │
│  ─────────────    │
│  1. Run pytest    │ ← Fail fast: broken tests block deploy
│  2. Black lint    │
└────────┬──────────┘
         │ (tests pass)
         ▼
┌───────────────────┐
│  Docker Build     │
│  docker build .   │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Push to          │
│  Docker Hub       │ ← Tagged with git SHA for traceability
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Azure Webhook    │ ← Triggers rolling restart on App Service
│  Rolling Deploy   │   Zero-downtime swap
└───────────────────┘
```

> 🔐 All secrets (Azure SQL connection string, Docker Hub credentials, Azure publish profile) are stored as **GitHub Actions Secrets** — never committed to the repository.

---

## 📦 Dataset

| Property | Value |
|----------|-------|
| **Source** | [UCI Bank Marketing Dataset](https://archive.ics.uci.edu/ml/datasets/Bank+Marketing) |
| **Records** | 41,188 |
| **Features** | 20 input features |
| **Target** | `y` — binary: did the client subscribe to a term deposit? |
| **Class balance** | ~88% No / ~12% Yes |
| **Feature groups** | Demographic (age, job, marital) · Campaign history · Macroeconomic indicators (Euribor, CPI, employment rate) |

The economic indicator features (`euribor3m`, `emp_var_rate`, `cons_price_idx`, `cons_conf_idx`, `nr_employed`) turn out to be among the **most predictive** — clients are far more likely to subscribe during periods of low interest rates and economic uncertainty, making this a genuinely interesting socioeconomic modeling problem.

---

## 👥 Team

| Name | GitHub | Role |
|------|--------|------|
| Yasser Mogahed | [@Yasser-Mogahed](https://github.com/Yasser-Mogahed) | Team Leader · UIUX Developer · Data Scientist |
| Abdallah Ali | [@abdallah-farahat](https://github.com/abdallah-farahat) | Data Engineer |
| Mohanad Ibrahim | [@Mohanad234128](https://github.com/Mohanad234128) | Data Analyst |
| Ahmed Walid | [@NitoBoritto](https://github.com/NitoBoritto) | Data Scientist · ML Engineer |



---



---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f3460,50:16213e,100:1a1a2e&height=100&section=footer" />

<sub>Built with 🧠 by El Farghaly Bros. · Powered by LightGBM, FastAPI & Azure</sub>

</div>
