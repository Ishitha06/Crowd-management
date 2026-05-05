import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

n = 1000

df = pd.DataFrame({
    "entry_rate": np.random.uniform(0, 1, n),
    "exit_rate": np.random.uniform(0, 1, n),
    "density": np.random.uniform(0, 1, n),
})

# 🔥 MUST MATCH app.py
df["net_flow"] = df["entry_rate"] - df["exit_rate"]
df["load_factor"] = df["density"]

df["future_density"] = (
    df["density"]
    + 0.6 * df["net_flow"]   # stronger variation
    + np.random.normal(0, 0.15, n)  # more diversity
)

df["future_density"] = df["future_density"].clip(0, 1)

X = df[["entry_rate", "exit_rate", "density", "net_flow", "load_factor"]]
y = df["future_density"]

model = RandomForestRegressor(n_estimators=100)
model.fit(X, y)

joblib.dump(model, "model.pkl")

print("Model trained successfully")



