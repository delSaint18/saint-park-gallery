SAINT PARK gallery — setup

manifest.json is filled in (bio, pitch, email, links). ring.json is empty and ready.

To add a finished visualizer piece:
1. Export it from builder.html — you get a folder (index.html, doc.json, media/).
2. Drop that folder next to this index.html, named with a url-safe slug
   (e.g. "backroom-parlay").
3. Add the slug to ring.json: {"sites": ["backroom-parlay"]}
4. Add its metadata to manifest.json under "pieces":
   {"slug":"backroom-parlay","title":"Backroom Parlay","artist":"delSaint",
    "blurb":"one line about it","thumb":"thumbs/backroom-parlay.jpg","year":2026}
5. Drop a screenshot at thumbs/backroom-parlay.jpg (and thumbs/cover.jpg for link
   previews). Commit, push, done — no build step, no rebuild needed.

Deploying updates (once the repo is live on GitHub Pages):
  cd ~/Claude/Projects/saint-park-gallery
  git add -A
  git commit -m "add <piece name>"
  git push
Pages redeploys automatically within a minute or two of every push.
