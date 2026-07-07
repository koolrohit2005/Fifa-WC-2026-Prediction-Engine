# FIFA World Cup 2026 — Prediction Engine

A 4-model ensemble forecasting system for the 2026 FIFA World Cup, with a live in-browser Monte Carlo tournament simulator.

**Live site:** _add your Vercel URL here after deploying_

## The Model (Python)

- **ELO rating engine** built from scratch over **15,817 international matches** (2010–2026), with dynamic post-match updates
- **Random Forest** and **Logistic Regression** classifiers trained on ELO features to predict win/draw/loss (LR: 59.1% accuracy, 0.887 log loss)
- **Climate-similarity feature** capturing host-condition advantages
- **Monte Carlo simulation**: 10,000 full-tournament runs (72 group matches → best-third ranking → 5 knockout rounds per run)
- Final forecast blends all four models

### Pre-tournament forecast (top 5)

| Team | Win Probability |
|---|---|
| 🇪🇸 Spain | 11.1% |
| 🇦🇷 Argentina | 11.0% |
| 🇲🇦 Morocco | 7.7% |
| 🇫🇷 France | 6.3% |
| 🇧🇷 Brazil | 5.4% |

The Morocco call is the ensemble's boldest divergence from consensus — driven by the Random Forest layer (10.6%) against ELO (5.6%).

## This Repo (React frontend)

Interactive site presenting the model's forecast, with a live simulator that runs the ELO layer client-side on the real 12-group tournament draw — visitors can run up to 25,000 tournament simulations in their browser.

```
npm install
npm run dev
```

## Attribution

Model, analysis, and forecast: **Rohit Balaji** (Python / pandas / scikit-learn / Jupyter).
Frontend built with AI assistance (Claude).
