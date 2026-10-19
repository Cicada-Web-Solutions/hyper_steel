import urllib.request
import re

base_url = "http://localhost:8000/"
try:
    with urllib.request.urlopen(base_url, timeout=5) as res:
        html = res.read().decode("utf-8")
        print("Root index.html: HTTP", res.status, "Length:", len(html))
except Exception as e:
    print("Failed root:", e)
    exit(1)

matches = re.findall(r'(?:src|href)=["\']([^"\']+)["\']', html)
checked = set()
errors = []

for u in matches:
    if u.startswith("#") or u.startswith("http") or u.startswith("mailto:") or u.startswith("tel:"):
        continue
    if u in checked:
        continue
    checked.add(u)
    try:
        with urllib.request.urlopen(base_url + u, timeout=5) as res:
            if res.status == 200:
                print(f"[OK 200] {u}")
            else:
                errors.append((u, res.status))
    except Exception as e:
        errors.append((u, str(e)))

if errors:
    print("ERRORS:", errors)
else:
    print("SUCCESS: All local asset links returned HTTP 200 OK!")
