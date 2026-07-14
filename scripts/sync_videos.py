#!/usr/bin/env python3
"""Pull recent uploads from the SAINTPARK YouTube channel and refresh the
AUTO-SYNC block in videos.txt with any video whose title contains
TITLE_FILTER (case-insensitive).

Uses only YouTube's public per-channel RSS feed — no API key, no quota,
no auth. That feed only ever contains the channel's ~15 most recent
uploads, so this keeps up with new videos going forward; it won't reach
back further than that. If the catalog ever grows past that and older
matching videos need to be included too, switch to the YouTube Data API
v3 (channels.list + playlistItems.list on the uploads playlist) instead.

Run manually:  python3 scripts/sync_videos.py
Runs automatically via .github/workflows/sync-videos.yml (daily + on-demand
from the repo's Actions tab).
"""
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET

CHANNEL_ID = "UCA9nmUH4RQxGldxZYwsdxIA"  # delSaint / SAINTPARK
FEED_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=" + CHANNEL_ID
TITLE_FILTER = "3d reactive music visualizer"
VIDEOS_FILE = "videos.txt"
START_MARKER = "# ===AUTO-SYNC-START==="
END_MARKER = "# ===AUTO-SYNC-END==="

NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
}


def fetch_matching_urls():
    req = urllib.request.Request(FEED_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        xml_bytes = r.read()
    root = ET.fromstring(xml_bytes)
    urls = []
    for entry in root.findall("atom:entry", NS):
        title_el = entry.find("atom:title", NS)
        vid_el = entry.find("yt:videoId", NS)
        if title_el is None or vid_el is None or not vid_el.text:
            continue
        title = title_el.text or ""
        if TITLE_FILTER in title.lower():
            urls.append("https://www.youtube.com/watch?v=" + vid_el.text)
    return urls


def update_videos_file(urls):
    with open(VIDEOS_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    block = "\n".join(urls) if urls else "# (no matching videos found on last sync)"
    new_section = START_MARKER + "\n" + block + "\n" + END_MARKER

    pattern = re.compile(re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER), re.S)
    if pattern.search(content):
        content = pattern.sub(new_section, content)
    else:
        # markers missing (fresh file) — append a new block at the end
        content = content.rstrip("\n") + "\n\n" + new_section + "\n"

    with open(VIDEOS_FILE, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    try:
        urls = fetch_matching_urls()
    except Exception as e:
        print("Failed to fetch/parse the YouTube feed:", e, file=sys.stderr)
        sys.exit(1)

    print("Found {} matching video(s):".format(len(urls)))
    for u in urls:
        print(" ", u)

    update_videos_file(urls)


if __name__ == "__main__":
    main()
