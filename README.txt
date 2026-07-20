SAINT PARK gallery — setup

The site is now multi-page, with a shared nav bar on every page:

  index.html    — homepage: poster "gates" hero, "On the marquee" headliner,
                  "Now showing" strip, commission band
  gallery.html  — the full wall: everything on view
  kids/         — SPMV Kids, the kids' builder (public, linked in the nav).
                  A copy of SaintParkVisualizer/kids.html — to update it, copy
                  that file over kids/index.html and push. A "Back to the Park"
                  button block is appended before </body> in BOTH files, so
                  fresh copies keep it automatically.
  about.html    — the story, social links, commission card
  watch.html    — inline video player (cards link here; noindex)
  styles.css    — shared design system (design tokens; DAY + NIGHT themes;
                  Archivo Black display / Space Grotesk UI / Lora body;
                  TV-static grain overlay)
  site.js       — shared logic: theme toggle (persists via localStorage),
                  loads ring.json + manifest.json + videos.txt, builds cards,
                  fills text from manifest, webring, parallax

manifest.json is filled in (bio, pitch, email, links). ring.json is empty and
ready. Text on the pages (tagline, bio, pitch, booking email, social links) is
overridden at load time by manifest.json — edit it there, not in the HTML.

Two kinds of gallery cards: interactive builder pieces (badge: HTML) and YouTube
videos (badge: MP4). Pinned pieces float to the top. The homepage shows the
first 3 pieces (pinned first); the gallery shows all of them.

--- Adding an interactive visualizer piece (HTML badge) ---
1. Export it from the builder (kept locally in ~/Claude/Projects/SaintParkVisualizer)
   — you get a folder (index.html, doc.json, media/).
2. Drop that folder next to index.html, named with a url-safe slug
   (e.g. "backroom-parlay").
3. Add the slug to ring.json: {"sites": ["backroom-parlay"]}  (this is what lets
   the webring nav inside the piece hop to other pieces — video entries don't
   go here.)
4. Add its metadata to manifest.json under "pieces":
   {"slug":"backroom-parlay","title":"Backroom Parlay","artist":"delSaint",
    "blurb":"one line about it","thumb":"thumbs/backroom-parlay.jpg","year":2026}
5. Drop a screenshot at thumbs/backroom-parlay.jpg (and thumbs/cover.jpg for link
   previews).
Clicking the card opens ./<slug>/ directly (the piece's own player).

--- Adding a YouTube video (MP4 badge) ---
Easiest way: open videos.txt, paste the link on its own line, save. Title,
artist, and thumbnail are pulled automatically from YouTube on page load — no
manual entry. Add extra fields separated by "|" to override:
  URL | Title | one-line blurb | year | pinned
(all optional — leave blank to skip a field). Lines starting with # are ignored.
The AUTO-SYNC block in videos.txt is refreshed daily by
scripts/sync_videos.py via GitHub Actions — don't hand-edit inside it.

Clicking the card opens watch.html on this same site, which embeds the video
inline (not a redirect out to youtube.com) — the video stays framed in a
SAINTPARK page with title/artist/blurb shown underneath.

--- The builder ---
Removed from the site (July 2026). It no longer ships in the repo or on the
live site. The working copy lives at ~/Claude/Projects/SaintParkVisualizer/builder.html,
and the last hosted copy was parked in _to_delete/builder/ (gitignored) in case
it's ever needed again.

--- Deploying updates ---
  cd ~/Claude/Projects/saint-park-gallery
  git add -A
  git commit -m "add <piece name>"
  git push
Pages redeploys automatically within a minute or two of every push.
