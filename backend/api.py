from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app, origins="*")

ROBOFLOW_API_KEY = os.environ.get("ROBOFLOW_API_KEY", "17jd8ELonR9vdIKc6rQB")
ROBOFLOW_MODEL = os.environ.get("ROBOFLOW_MODEL", "waste-classifier-louut/1")

ROBOFLOW_URL = f"https://serverless.roboflow.com/{ROBOFLOW_MODEL}?api_key={ROBOFLOW_API_KEY}"

@app.route("/")
def home():
    return send_file("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files["image"]

        print("➡ Sending image to Roboflow...")

        response = requests.post(
            ROBOFLOW_URL,
            files={"file": file}
        )

        print("⬅ Roboflow status:", response.status_code)
        print("⬅ Roboflow response:", response.text)

        data = response.json()

        if "predictions" not in data or len(data["predictions"]) == 0:
            return jsonify({"error": "No predictions returned"}), 500

        pred = data["predictions"][0]

        return jsonify({
            "class_name": pred["class"],
            "confidence": round(pred["confidence"] * 100, 2)
        })

    except Exception as e:
        print("🔥 BACKEND ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)
