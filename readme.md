# El Farghaly Bros — Client Term Deposit Predictor

> End-to-end ML system for predicting bank client subscription to term deposits. Built on the UCI Bank Marketing dataset, serving predictions through a production FastAPI backend with a live JavaScript dashboard, deployed on Azure via Docker and CI/CD.

---

## Live Demo

| Component | URL |
|-----------|-----|
| API Docs (Swagger) | `https://<your-azure-app>.azurewebsites.net/docs` |
| Dashboard | `https://<your-azure-app>.azurewebsites.net` |

---

## Problem Statement

A Portuguese bank ran telemarketing campaigns to sell term deposit subscriptions. The dataset is severely imbalanced (~88% negative class), making raw accuracy a misleading metric. The goal is to maximize recall on the positive class while maintaining acceptable precision — flagging likely subscribers without flooding the call center with false positives.

---

## Architecture

```
Raw Data (UCI Bank Marketing)
       │
       ▼
┌─────────────────────┐
│  Azure SQL Database │  ← Structured storage, ODBC connection
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Preprocessing      │  ← Sklearn Pipeline (StandardScaler, OrdinalEncoder)
│  + Class Balancing  │  ← SMOTE / class_weight
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  LightGBM Classifier│  ← Optuna HPO (TPE sampler, N trials)
│  + MLflow Tracking  │  ← Experiment registry, model artifacts
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  FastAPI Backend    │  ← /predict, /health, /metrics endpoints
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  JS SPA Dashboard   │  ← Chart.js visualizations, live API calls
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Docker → Azure     │  ← GitHub Actions → Docker Hub → Azure Webhook
└─────────────────────┘
```

---

## Model Performance

| Metric | Value |
|--------|-------|
| Algorithm | LightGBM |
| HPO | Optuna (TPE, N trials) |
| CV Strategy | Stratified K-Fold |
| ROC-AUC | `_fill_in_` |
| F1 (positive class) | `_fill_in_` |
| Precision | `_fill_in_` |
| Recall | `_fill_in_` |
| Threshold | `_fill_in_` (tuned, not default 0.5) |

> Threshold was tuned post-training on the validation set to optimize F1 on the minority class. Default 0.5 was not used.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | Python 3.11 |
| ML | LightGBM, scikit-learn, imbalanced-learn |
| HPO | Optuna |
| Experiment Tracking | MLflow + Azure ML |
| Data Validation | Great Expectations |
| Backend | FastAPI + Uvicorn |
| Database | Azure SQL (pyodbc + SQLAlchemy) |
| Frontend | Vanilla JS, HTML/CSS, Chart.js |
| Containerization | Docker |
| CI/CD | GitHub Actions → Docker Hub → Azure Webhook |
| Cloud | Azure App Service |
| Testing | pytest |
| Formatting | Black |

---

## Project Structure

```
El_Farghaly_Bros./
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── data/
│   └── bank-additional-full.csv
├── notebooks/
│   └── EDA.ipynb
├── src/
│   ├── data_ingestion.py       # Load from Azure SQL
│   ├── preprocessing.py        # Sklearn pipeline construction
│   ├── train.py                # Optuna + LightGBM training loop
│   ├── evaluate.py             # Metrics, threshold tuning, confusion matrix
│   └── predict.py              # Inference logic
├── api/
│   ├── main.py                 # FastAPI app entry point
│   ├── router.py               # APIRouter definitions
│   └── schemas.py              # Pydantic request/response models
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── tests/
│   └── test_api.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── README.md
```

---

## Quickstart

### Prerequisites

- Python 3.11+
- Docker
- Azure SQL instance (or local SQL Server)
- ODBC Driver 18 for SQL Server

### 1. Clone

```bash
git clone https://github.com/NitoBoritto/El_Farghaly_Bros..git
cd El_Farghaly_Bros.
```

### 2. Environment Setup

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` from the template:

```bash
cp .env.example .env
# Fill in your Azure SQL credentials and MLflow tracking URI
```

### 3. Train

```bash
python src/train.py
```

This runs Optuna HPO, logs all trials to MLflow, and serializes the best model + threshold.

### 4. Run Locally

```bash
uvicorn api.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### 5. Docker

```bash
docker build -t elfarghaly-predictor .
docker run -p 8000:8000 --env-file .env elfarghaly-predictor
```

---

## API Reference

### `POST /predict`

**Request:**
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

### `GET /health`

Returns service status and model version.

### `GET /metrics`

Returns last-trained model evaluation metrics.

---

## CI/CD Pipeline

```
git push → GitHub Actions
    → Run tests (pytest)
    → Build Docker image
    → Push to Docker Hub
    → Trigger Azure Webhook
    → Rolling deploy on Azure App Service
```

Environment secrets are stored in GitHub Actions Secrets and injected at build time.

---

## Dataset

- **Source:** [UCI Bank Marketing Dataset](https://archive.ics.uci.edu/ml/datasets/Bank+Marketing)
- **Records:** 41,188
- **Features:** 20 input features (demographic + campaign + economic indicators)
- **Target:** `y` — whether client subscribed to a term deposit (binary: yes/no)
- **Class imbalance:** ~88% negative, ~12% positive

---

## Team

| Name | Role |
|------|------|
| [NitoBoritto](https://github.com/NitoBoritto) | ML Engineering, Backend, CI/CD |
| El Farghaly | `_fill_in_` |

---

## License

MIT License — see [LICENSE](LICENSE) for details.
