import json
import re
import sys
import urllib.request


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36"
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8", "replace"))


def strip_tags(html: str) -> str:
    html = re.sub(r"<script[\\s\\S]*?</script>", "", html, flags=re.I)
    html = re.sub(r"<style[\\s\\S]*?</style>", "", html, flags=re.I)
    html = re.sub(r"<[^>]+>", " ", html)
    html = re.sub(r"\\s+", " ", html).strip()
    return html


def main() -> int:
    page_id = sys.argv[1] if len(sys.argv) > 1 else "5"
    url = f"https://thebamfieldartscouncil.org/wp-json/wp/v2/pages/{page_id}"
    data = fetch_json(url)
    rendered = (data.get("content") or {}).get("rendered") or ""

    print("page_id:", data.get("id"))
    print("title:", (data.get("title") or {}).get("rendered"))
    print("link:", data.get("link"))

    hrefs = re.findall(r'href="([^"]+)"', rendered)
    print("\ncontent_hrefs:")
    for h in sorted(set(hrefs)):
        print("-", h)

    print("\ncontent_text_excerpt:")
    txt = strip_tags(rendered)
    print(txt[:1200] + ("..." if len(txt) > 1200 else ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

