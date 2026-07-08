# FIFA World Cup 2026 Prediction Engine

**Live site:** https://fifa-wc-2026-prediction-engine-6p32.vercel.app/

A 4-model machine learning ensemble that forecasts the 2026 FIFA World Cup, trained on **15,817 international matches** and simulated across **10,000 Monte Carlo tournament runs** on the real 48-team group draw.

## Headline forecast

| Rank | Team | Win Probability |
|------|------|----------------|
| 1 | 🇪🇸 Spain | 11.1% |
| 2 | 🇦🇷 Argentina | 11.0% |
| 3 | 🇲🇦 Morocco | 7.7% |
| 4 | 🇫🇷 France | 6.3% |
| 5 | 🇧🇷 Brazil | 5.4% |

**Dark horse:** Morocco — the Random Forest rates them at 10.6% while ELO says 5.6%. When models disagree that much, something interesting is going on.

## The live site has two views

**Live Simulator** — runs the ELO layer entirely in your browser: simulate the full 48-team tournament (72 group matches, best-third ranking, five knockout rounds) thousands of times and watch the probabilities converge. Includes a head-to-head matchup tool using the ELO win-expectancy formula.

**Forecast Dashboard** — the full 4-model ensemble output for all 46 qualified teams: top-15 rankings, a per-team model breakdown showing which models are bullish vs. bearish, a model-disagreement leaderboard, a searchable table of every team, and a probability ↔ decimal-odds toggle.

## How the engine works

1. **RATE** — A dynamic ELO rating system processes 15,817 international matches since 2010, updating every team's rating after each result.
2. **LEARN** — Random Forest and Logistic Regression models train on ELO-derived features to predict win/draw/loss outcomes (LR: 59.1% accuracy, 0.887 log loss).
3. **ADJUST** — A climate-similarity feature I engineered accounts for teams playing far from home conditions across the North American host venues.
4. **SIMULATE** — Monte Carlo plays the complete tournament 10,000 times on the actual 12-group draw.
5. **COMBINE** — All four models' championship probabilities blend into the final ensemble forecast, so no single model's blind spot decides the answer.

## Repository structure

<!-- CHECK: confirm these paths/names match your repo before committing -->
```
├── App.jsx                  # App shell with tab navigation
├── Simulator.jsx            # In-browser ELO Monte Carlo simulator
├── Dashboard.jsx            # 4-model ensemble forecast dashboard
├── main.jsx / index.html    # Vite entry
├── model/
│   ├── FifaWC.ipynb         # Data prep + ELO engine
│   ├── FIFAWC2.ipynb        # ML models + group draw
│   ├── FIFAWC3.ipynb        # Ensemble + Monte Carlo simulation
│   ├── wc_predictions.csv   # Final ensemble output
│   ├── model_comparison.csv # Per-model probabilities, all teams
│   └── FIFA_BI_Polished.pbix # Power BI dashboard
└── package.json
```

## Stack

**Modeling:** Python · pandas · scikit-learn (Random Forest, Logistic Regression) · feature engineering · Monte Carlo simulation · Jupyter
**Web:** React · Vite · Recharts · PapaParse · deployed on Vercel
**Also in this project:** Power BI dashboard · PowerPoint methodology deck

## Run locally

```bash
npm install
npm run dev
```

## Attribution

Model, analysis, and forecast by **Rohit Maha Balaji** (University of Florida). The prediction models, ELO engine, Monte Carlo simulation, and all analysis are original work built in Python. The interactive front-end was built with AI assistance.
