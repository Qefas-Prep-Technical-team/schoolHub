import json
from pathlib import Path
p = Path('eslint-results.json')
text = p.read_text(encoding='utf-16')
js = json.loads(text)
for item in js:
    for m in item['messages']:
        if m['severity'] == 2:
            print(f"{item['filePath']}:{m['line']}:{m['column']} {m['message']}  {m['ruleId']}")
