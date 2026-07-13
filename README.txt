SAINT PARK gallery — setup

manifest.json is filled in (bio, pitch, email, links). ring.json is empty and ready.

Two kinds of gallery cards: interactive builder pieces (badge: HTML) and YouTube
videos (badge: MP4). Both live in manifest.json under "pieces". Order doesn't
matter — pinned ones float to the top.

--- Adding an interactive visualizer piece (HTML badge) ---
1. Export it from builder.html — you get a folder (index.html, doc.json, media/).
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

--- Adding a YouTube video (MP4 badge) ---
1. Add an entry to manifest.json under "pieces" with "type":"video" and a "url"
   pointing at the YouTube link. slug just needs to be unique (no folder needed,
   don't add it to ring.json):
   {"slug":"some-video-slug","type":"video","url":"https://youtu.be/XXXXXXXXXXX",
    "title":"Track Name","artist":"delSaint","blurb":"one line about it","year":2026}
2. Thumbnail is automatic (pulled from YouTube) unless you set a "thumb" field
   to override it.
3. Clicking the card opens the video on YouTube in a new tab.

--- Deploying updates ---
  cd ~/Claude/Projects/saint-park-gallery
  git add -A
  git commit -m "add <piece name>"
  git push
Pages redeploys automatically within a minute or two of every push.
