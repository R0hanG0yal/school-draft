import re

files = ['index.html', 'styles.css', 'app.js']

emoji_pattern = re.compile(
    '['
    '\U0001F600-\U0001F64F'  # emoticons
    '\U0001F300-\U0001F5FF'  # symbols & pictographs
    '\U0001F680-\U0001F6FF'  # transport & meps
    '\U0001F1E0-\U0001F1FF'  # flags (iOS)
    '\U00002702-\U000027B0'
    '\U000024C2-\U0001F251'
    '\U0001F900-\U0001F9FF'  # Supplemental Symbols and Pictographs
    '\U0001FA70-\U0001FAFF'  # Symbols and Pictographs Extended-A
    '\U00002600-\U000026FF'  # Miscellaneous Symbols
    ']+', flags=re.UNICODE
)

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    matches = emoji_pattern.findall(content)
    if matches:
        print(f"Found emojis in {file_path}: {set(matches)}")
    else:
        print(f"No emojis found in {file_path}")
