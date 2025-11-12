import pandas as pd
import re

# Cấu hình
input_path = "dataset.csv"
output_path = "dataset.csv"
keywords_path = "keywords.txt"

# Đọc danh sách từ khóa từ file
with open(keywords_path, "r", encoding="utf-8") as f:
    keywords = [line.strip() for line in f if line.strip()]

# Regex URL, emoji và khoảng trắng
emoji_pattern = re.compile(
    "["
    "\U0001F600-\U0001F64F"
    "\U0001F300-\U0001F5FF"
    "\U0001F680-\U0001F6FF"
    "\U0001F1E0-\U0001F1FF"
    "\U00002500-\U00002BEF"
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "\U0001F900-\U0001F9FF"
    "\U0001FA70-\U0001FAFF"
    "\U00002600-\U000026FF"
    "\U00002300-\U000023FF"
    "]+",
    flags=re.UNICODE
)
url_pattern = re.compile(r'https?://\S+')
whitespace_pattern = re.compile(r'\s+')

# Xóa các URL, emoji và khoảng trắng dư thừa
def clean_text(text):
    if pd.isna(text):
        return ""
    text = str(text)
    text = url_pattern.sub("", text)
    text = emoji_pattern.sub("", text)
    text = whitespace_pattern.sub(" ", text)
    return text.strip()

# Đọc dữ liệu
df = pd.read_csv(input_path)
original_count = len(df)

# Kiểm tra cột cần thiết
if not {'title', 'body'}.issubset(df.columns):
    raise ValueError("CSV phải có 2 cột: title, body")

# Làm sạch
df['title'] = df['title'].apply(clean_text)
df['body'] = df['body'].apply(clean_text)

# Tìm từ khóa
def find_keywords(text):
    found = []
    for word in keywords:
        if re.search(rf'\b{re.escape(word)}\b', text, flags=re.IGNORECASE):
            found.append(word)
    return found

# Áp dụng cho từng mẫu
detected = []
labels = []
for _, row in df.iterrows():
    title_hits = find_keywords(row['title'])
    body_hits = find_keywords(row['body'])
    all_hits = list(set(title_hits + body_hits))
    detected.append(", ".join(all_hits))
    labels.append(1 if all_hits else 0)
df['keywords'] = detected
df['label'] = labels

# Đếm số mẫu trước khi loại trùng
before_drop = len(df)

# Xóa các mẫu trùng nhau
df = df.drop_duplicates(subset=["title", "body", "keywords", "label"], keep="first").reset_index(drop=True)
after_drop = len(df)
removed_count = before_drop - after_drop

# Thống kê nhãn
label_1_count = (df['label'] == 1).sum()
label_0_count = (df['label'] == 0).sum()

# Xuất file kết quả
df.to_csv(output_path, index=False, encoding='utf-8-sig')

# In thống kê
print("===== THỐNG KÊ XỬ LÝ =====")
print(f"Tổng số mẫu ban đầu: {original_count}")
print(f"Số mẫu sau khi gắn nhãn và loại trùng: {after_drop}")
print(f"Số mẫu bị loại bỏ (trùng lặp): {removed_count}")
print(f"Số mẫu có nhãn label = 1: {label_1_count}")
print(f"Số mẫu có nhãn label = 0: {label_0_count}")
print("===========================")
print("Hoàn tất! File đã được lưu tại:", output_path)