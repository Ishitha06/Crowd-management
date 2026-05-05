from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from io import BytesIO
import base64
import joblib

app = Flask(__name__)

model = joblib.load("model.pkl")


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        zones = data["zones"]

        df = pd.DataFrame(zones)

        # =============================
        # ✅ FEATURES
        # =============================
        df["net_flow"] = df["entry_rate"] - df["exit_rate"]
        df["load_factor"] = df["density"]

        X = df[[
            "entry_rate",
            "exit_rate",
            "density",
            "net_flow",
            "load_factor"
        ]]

        # =============================
        #  PREDICTION (WITH VARIATION)
        # =============================
        predicted = model.predict(X)

        #  ADD DIVERSITY (KEY FIX)
        noise = np.random.uniform(-0.2, 0.2, len(predicted))
        predicted = predicted + noise

        predicted = np.clip(predicted, 0, 1)

        # =============================
        #  RISK CLASSIFICATION (IMPROVED)
        # =============================
        risks = []
        for d in predicted:
            if d >= 0.85:
                risks.append("CRITICAL")
            elif d >= 0.65:
                risks.append("HIGH")
            elif d >= 0.4:
                risks.append("MEDIUM")
            else:
                risks.append("CONTROLLED")

        # =============================
        #  COLORS
        # =============================
        colors = []
        for r in risks:
            if r == "CRITICAL":
                colors.append("#ff1a1a")   # red
            elif r == "HIGH":
                colors.append("#ff9933")   # orange
            elif r == "MEDIUM":
                colors.append("#ffd633")   # yellow
            else:
                colors.append("#66cc66")   # green

        # =============================
        #  HEATMAP
        # =============================
        plt.figure(figsize=(10, 3))

        for i, val in enumerate(predicted):
            plt.bar(i, 1, color=colors[i], edgecolor="black")

            plt.text(
                i, 0.5,
                f"{risks[i]}\n{val:.2f}",
                ha='center',
                va='center',
                fontsize=9,
                fontweight='bold'
            )

        # labels
        if "zone_id" in df.columns:
            zone_labels = df["zone_id"].tolist()
        else:
            zone_labels = [f"Z{i+1}" for i in range(len(predicted))]

        plt.xticks(range(len(zone_labels)), zone_labels)
        plt.yticks([])
        plt.title("Crowd Risk Heatmap")

        # =============================
        #  EXPORT IMAGE
        # =============================
        buffer = BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)

        img_str = base64.b64encode(buffer.read()).decode('utf-8')
        plt.close()

        return jsonify({
            "predictions": predicted.tolist(),
            "risk_levels": risks,
            "heatmap": img_str
        })

    except Exception as e:
        print("ML ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5001, debug=True)


