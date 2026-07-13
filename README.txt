SAINT PARK gallery — setup

manifest.json is filled in (bio, pitch, email, links). ring.json is empty and ready.

Two kinds of gallery cards: interactive builder pieces (badge: HTML) and YouTube
videos (badge: MP4). Pinned pieces float to the top.

--- Adding an interactive visualizer piece (HTML badge) ---
1. Export it from the builder — you get a folder (index.html, doc.json, media/).
2. Drop that folder next to this index.html, named with a url-safe slug
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

Clicking the card opens watch.html on this same site, which embeds the video
inline (not a redirect out to youtube.com) — the video stays framed in a
SAINTPARK page with title/artist/blurb shown underneath.

You can also add video pieces by hand in manifest.json's "pieces" array with
"type":"video" and a "url" field, same as an HTML piece — useful if you want a
video pinned alongside specific metadata you don't want auto-fetched.

--- The builder ---
Hosted on this same site at /builder/ (https://delsaint18.github.io/saint-park-gallery/builder/)
so you can open it from any computer. It is NOT linked anywhere on the gallery
page and is excluded from search indexing (robots.txt) — the only way in is the
direct URL. To update it after editing builder.html locally:
  cp ~/Claude/Projects/SaintParkVisualizer/builder.html ~/Claude/Projects/saint-park-gallery/builder/index.html
then commit + push as usual.

--- Deploying updates ---
  cd ~/Claude/Projects/saint-park-gallery
  git add -A
  git commit -m "add <piece name>"
  git push
Pages redeploys automatically within a minute or two of every push.
