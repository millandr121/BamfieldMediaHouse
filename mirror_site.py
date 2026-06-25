"""
Mirror https://bamfieldmediahouse.ca/ into this folder (static assets + HTML).
Same-origin only. Skips mailto:, javascript:, external hosts.
"""
from __future__ import annotations

import os
import re
import ssl
import urllib.error
import urllib.parse
import urllib.request
from collections import deque
from html.parser import HTMLParser

BASE_NETLOCS = {"bamfieldmediahouse.ca", "www.bamfieldmediahouse.ca"}
START = "https://bamfieldmediahouse.ca/"
ROOT = os.path.dirname(os.path.abspath(__file__))

CTX = ssl.create_default_context()


class LinkExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        attr = dict(attrs)
        for key in ("href", "src", "poster"):
            if key in attr and attr[key]:
                self.links.append(attr[key])
        if tag == "meta" and attr.get("property") == "og:image" and attr.get("content"):
            self.links.append(attr["content"])


def is_same_site(url: str) -> bool:
    p = urllib.parse.urlparse(url)
    if p.scheme not in ("http", "https"):
        return False
    return p.netloc.lower() in BASE_NETLOCS


def normalize_url(url: str) -> str | None:
    url = url.strip()
    if url.startswith("//"):
        url = "https:" + url
    p = urllib.parse.urlparse(url)
    if p.scheme not in ("http", "https"):
        return None
    if p.netloc.lower() not in BASE_NETLOCS:
        return None
    # Drop fragment; keep query for cache-busted assets if any
    clean = urllib.parse.urlunparse(
        (p.scheme, "bamfieldmediahouse.ca", p.path or "/", p.params, p.query, "")
    )
    return clean


def url_to_local_path(url: str) -> str:
    p = urllib.parse.urlparse(url)
    path = p.path or "/"
    if path.endswith("/"):
        path = path + "index.html"
    if not os.path.splitext(path)[1]:
        # e.g. /about -> /about/index.html
        path = path.rstrip("/") + "/index.html"
    rel = path.lstrip("/")
    return os.path.join(ROOT, *rel.split("/"))


def fetch(url: str) -> tuple[bytes, str | None]:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; BMH-mirror/1.0)",
            "Accept": "*/*",
        },
    )
    with urllib.request.urlopen(req, context=CTX, timeout=60) as resp:
        data = resp.read()
        ctype = resp.headers.get_content_type()
        return data, ctype


def extract_links_from_html(html: str, base_url: str) -> set[str]:
    parser = LinkExtractor()
    try:
        parser.feed(html)
    except Exception:
        pass
    out: set[str] = set()
    for raw in parser.links:
        if raw.startswith(("mailto:", "tel:", "javascript:", "data:")):
            continue
        joined = urllib.parse.urljoin(base_url, raw)
        nu = normalize_url(joined)
        if nu:
            out.add(nu)
    return out


def extract_links_from_css(css: str, base_url: str) -> set[str]:
    out: set[str] = set()
    for m in re.finditer(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", css, flags=re.I):
        raw = m.group(1).strip()
        if raw.startswith(("data:", "mailto:")):
            continue
        joined = urllib.parse.urljoin(base_url, raw)
        nu = normalize_url(joined)
        if nu:
            out.add(nu)
    return out


def main() -> None:
    os.makedirs(ROOT, exist_ok=True)
    q: deque[str] = deque()
    seen: set[str] = set()
    q.append(normalize_url(START) or START)

    while q:
        url = q.popleft()
        if url in seen:
            continue
        seen.add(url)

        local_path = url_to_local_path(url)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)

        try:
            data, ctype = fetch(url)
        except urllib.error.HTTPError as e:
            print("HTTP", e.code, url)
            continue
        except Exception as e:
            print("FAIL", url, e)
            continue

        # Write file + parse links
        if ctype and "text/html" in ctype:
            text = data.decode("utf-8", errors="replace")
            with open(local_path, "w", encoding="utf-8", newline="\n") as f:
                f.write(text)
            print("OK", len(data), url, "->", os.path.relpath(local_path, ROOT))
            for link in extract_links_from_html(text, url):
                if link not in seen:
                    q.append(link)
        elif ctype and "text/css" in ctype:
            text = data.decode("utf-8", errors="replace")
            with open(local_path, "w", encoding="utf-8", newline="\n") as f:
                f.write(text)
            print("OK", len(data), url, "->", os.path.relpath(local_path, ROOT))
            for link in extract_links_from_css(text, url):
                if link not in seen:
                    q.append(link)
        else:
            with open(local_path, "wb") as f:
                f.write(data)
            print("OK", len(data), url, "->", os.path.relpath(local_path, ROOT))


if __name__ == "__main__":
    main()
