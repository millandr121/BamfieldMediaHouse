import re
import sys
import urllib.request


def fetch(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36"
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def main() -> int:
    url = sys.argv[1] if len(sys.argv) > 1 else "https://thebamfieldartscouncil.org/"
    html = fetch(url)
    print("url:", url)
    print("html_len:", len(html))

    hrefs = re.findall(r'href="([^"]+)"', html)
    interesting = []
    internal = []
    for href in hrefs:
        h = href.lower()
        if "thebamfieldartscouncil.org" in h or h.startswith("/"):
            internal.append(href)
            if any(k in h for k in ["pdf", "board", "charity", "contact", "about", "project", "craft", "fair", "packet"]):
                interesting.append(href)

    print("\ninteresting_hrefs:")
    for href in sorted(set(interesting)):
        print("-", href)

    print("\ninternal_hrefs_sample:")
    for href in list(dict.fromkeys(internal))[:80]:
        print("-", href)

    print("\npage_text_snippets:")
    for label in ["Mission", "Projects", "Contact", "Bamfield Craft Fairs"]:
        if label.lower() in html.lower():
            print("-", label, "(found)")
        else:
            print("-", label, "(not found)")

    pdfs = sorted(set(re.findall(r"https?://[^\"\\s>]+\\.pdf", html, flags=re.I)))
    print("\npdf_urls:")
    for p in pdfs:
        print("-", p)

    needle = "Information Packet"
    idx = html.lower().find(needle.lower())
    print("\ninfo_packet_context:")
    if idx == -1:
        print("(not found in raw html)")
    else:
        start = max(0, idx - 600)
        end = min(len(html), idx + 600)
        snippet = html[start:end].replace("\n", " ")
        print(snippet)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

