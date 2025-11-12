import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import re

# ĐỌC DANH SÁCH TỪ KHÓA VI PHẠM TỪ FILE
with open("keywords.txt", "r", encoding="utf-8") as f:
    keywords = [line.strip() for line in f if line.strip()]
print(f"Đã tải {len(keywords)} từ khóa từ keywords.txt")
pattern = re.compile(r"\b(" + "|".join([re.escape(k) for k in keywords]) + r")\b", re.IGNORECASE)

# ĐỌC TẬP DỮ LIỆU
df = pd.read_csv("dataset.csv")
df["text"] = (df["title"].fillna('') + " " + df["body"].fillna('')).str.lower()

# CHUẨN BỊ DỮ LIỆU HUẤN LUYỆN
X = df["text"]
y = df["label"]

# Chia dữ liệu 80% train, 20% test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Số mẫu: {len(df)} (Train: {len(X_train)}, Test: {len(X_test)})")

# TF-IDF VECTOR HÓA
vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# HUẤN LUYỆN MÔ HÌNH
clf = LogisticRegression(max_iter=300)
clf.fit(X_train_tfidf, y_train)

# ĐÁNH GIÁ MÔ HÌNH
print("\nĐánh giá trên tập Test:")
y_pred = clf.predict(X_test_tfidf)
print(classification_report(y_test, y_pred, digits=4))
print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("Accuracy:", accuracy_score(y_test, y_pred))

# LƯU MÔ HÌNH
joblib.dump((vectorizer, clf, keywords), "model.pkl")
print("\nMô hình đã lưu vào: model.pkl")