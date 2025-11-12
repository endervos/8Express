import sys, json, joblib, re, os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")

vectorizer, clf, keywords = joblib.load(MODEL_PATH)
pattern = re.compile(r"\b(" + "|".join([re.escape(k) for k in keywords]) + r")\b", re.IGNORECASE)

def predict_violation(title, body):
    text = (title + " " + body).lower()
    X_vec = vectorizer.transform([text])
    pred = clf.predict(X_vec)[0]
    found = sorted(set(re.findall(pattern, text)))
    label = "vi_pham" if pred == 1 else "hop_le"
    return {"label": label, "keywords": found}

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    title, body = data["title"], data["body"]
    result = predict_violation(title, body)
    print(json.dumps(result))