/* SAINTPARK — shared site logic.
   Loaded by index.html (homepage), gallery.html, and about.html.
   What runs on each page is decided by which elements exist in the DOM:
     #wall      → full gallery wall (gallery.html)
     #featured  → first few pieces only (homepage "now showing" strip)
     #webring   → webring footer nav
     #tagline / #bio / #pitch / #booking / #links → filled from manifest.json
   All data comes from ring.json + manifest.json + videos.txt at the site root. */
(function(){
"use strict";

/* -------- helpers -------- */
function el(tag, cls, text){
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;   // textContent only: manifest data is never parsed as HTML
  return n;
}
function byId(id){ return document.getElementById(id); }
function slugToTitle(slug){
  return String(slug).replace(/[-_]+/g," ").replace(/\b\w/g, function(c){return c.toUpperCase();});
}
function loadJSON(path){
  return fetch(path, {cache:"no-store"})
    .then(function(r){ return r.ok ? r.json() : null; })
    .catch(function(){ return null; });
}
function loadText(path){
  return fetch(path, {cache:"no-store"})
    .then(function(r){ return r.ok ? r.text() : ""; })
    .catch(function(){ return ""; });
}

/* -------- card builders -------- */
function youtubeId(url){
  if (!url) return null;
  var m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}
function watchHref(piece, vid){
  var params = [];
  if (vid) params.push("v=" + encodeURIComponent(vid));
  else if (piece.url) params.push("u=" + encodeURIComponent(piece.url));
  if (piece.title)  params.push("t=" + encodeURIComponent(piece.title));
  if (piece.artist) params.push("a=" + encodeURIComponent(piece.artist));
  if (piece.blurb)  params.push("b=" + encodeURIComponent(piece.blurb));
  if (piece.year)   params.push("y=" + encodeURIComponent(piece.year));
  return "watch.html" + (params.length ? "?" + params.join("&") : "");
}
function makeBlank(frame, piece){
  frame.innerHTML = "";
  frame.classList.add("blank");
  frame.appendChild(el("span","halo"));
  frame.appendChild(el("span","t", piece.title));
}
function buildCard(piece){
  var isVideo = piece.type === "video";
  var vid = isVideo ? youtubeId(piece.url) : null;
  var a = el("a","piece");
  if (isVideo){
    a.href = watchHref(piece, vid);
  } else {
    a.href = "./" + encodeURIComponent(piece.slug) + "/";
  }
  a.setAttribute("role","listitem");
  a.setAttribute("aria-label", piece.title + (piece.artist ? " by " + piece.artist : "") + (isVideo ? " — watch" : " — enter"));

  var frame = el("div","frame");
  var thumbSrc = piece.thumb;
  if (!thumbSrc && isVideo && vid){
    thumbSrc = "https://img.youtube.com/vi/" + vid + "/hqdefault.jpg";
  }
  if (thumbSrc){
    var img = document.createElement("img");
    img.src = thumbSrc;
    img.alt = "";                 // decorative; card has aria-label
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", function(){ makeBlank(frame, piece); });
    frame.appendChild(img);
  } else {
    makeBlank(frame, piece);
  }
  frame.appendChild(el("span","badge" + (isVideo ? " video" : ""), isVideo ? "MP4" : "HTML"));
  a.appendChild(frame);

  var cap = el("div","caption");
  cap.appendChild(el("h3", null, piece.title));
  if (piece.artist) cap.appendChild(el("p","by","by " + piece.artist));
  if (piece.blurb)  cap.appendChild(el("p","blurb", piece.blurb));
  var meta = el("p","meta");
  if (piece.pinned) meta.appendChild(el("span","star","★ featured  "));
  if (piece.year)   meta.appendChild(el("span",null,String(piece.year)));
  if (meta.childNodes.length) cap.appendChild(meta);
  cap.appendChild(el("span","go", isVideo ? "watch →" : "enter →"));
  a.appendChild(cap);
  return a;
}

/* -------- merge ring.json + manifest.json -------- */
function mergePieces(ring, manifest){
  var bySlug = {};
  var order = [];
  var ringSlugs = (ring && Array.isArray(ring.sites)) ? ring.sites : [];
  ringSlugs.forEach(function(slug){
    if (!slug || bySlug[slug]) return;
    bySlug[slug] = { slug:slug, title:slugToTitle(slug) };
    order.push(slug);
  });
  var mPieces = (manifest && Array.isArray(manifest.pieces)) ? manifest.pieces : [];
  mPieces.forEach(function(p){
    if (!p || !p.slug) return;
    if (!bySlug[p.slug]){ bySlug[p.slug] = { slug:p.slug, title:slugToTitle(p.slug) }; order.push(p.slug); }
    var t = bySlug[p.slug];
    if (p.title)  t.title  = p.title;
    if (p.artist) t.artist = p.artist;
    if (p.blurb)  t.blurb  = p.blurb;
    if (p.thumb)  t.thumb  = p.thumb;
    if (p.year)   t.year   = p.year;
    if (p.pinned) t.pinned = true;
    if (p.type)   t.type   = p.type;
    if (p.url)    t.url    = p.url;
  });
  return order.map(function(s){ return bySlug[s]; });
}
function sortPinned(pieces){
  // stable: pinned first, original order preserved within each group
  return pieces.filter(function(p){return p.pinned;})
        .concat(pieces.filter(function(p){return !p.pinned;}));
}

/* -------- videos.txt: one YouTube link per line, title/artist auto-fetched -------- */
function parseVideoLines(text){
  var lines = String(text || "").split(/\r?\n/)
    .map(function(l){ return l.trim(); })
    .filter(function(l){ return l && l[0] !== "#"; });
  var jobs = lines.map(function(line){
    var parts = line.split("|").map(function(s){ return s.trim(); });
    var url = parts[0];
    var id = youtubeId(url);
    var piece = {
      slug: "yt-" + (id || Math.random().toString(36).slice(2)),
      type: "video",
      url: url,
      title: parts[1] || "",
      blurb: parts[2] || undefined,
      year: parts[3] ? Number(parts[3]) : undefined,
      pinned: (parts[4] || "").toLowerCase() === "pinned" || undefined,
      thumb: id ? ("https://img.youtube.com/vi/" + id + "/hqdefault.jpg") : undefined
    };
    if (piece.title) return Promise.resolve(piece);
    // no title override — ask YouTube's oEmbed endpoint for title + channel name
    return fetch("https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent(url))
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(meta){
        piece.title = (meta && meta.title) || slugToTitle(id || "video");
        if (meta && meta.author_name) piece.artist = meta.author_name;
        return piece;
      })
      .catch(function(){
        piece.title = slugToTitle(id || "video");
        return piece;
      });
  });
  return Promise.all(jobs);
}

/* -------- webring footer -------- */
function initWebring(ring){
  var nav = byId("webring");
  if (!nav) return;
  var slugs = (ring && Array.isArray(ring.sites)) ? ring.sites : [];
  if (!slugs.length) return;
  byId("ring-prev").href = "./" + encodeURIComponent(slugs[slugs.length-1]) + "/";
  byId("ring-next").href = "./" + encodeURIComponent(slugs[0]) + "/";
  var rand = byId("ring-rand");
  rand.href = "./" + encodeURIComponent(slugs[0]) + "/";
  rand.addEventListener("click", function(e){
    e.preventDefault();
    var pick = slugs[Math.floor(Math.random()*slugs.length)];
    window.location.href = "./" + encodeURIComponent(pick) + "/";
  });
  nav.hidden = false;
}

/* -------- fill hero / about / commission from manifest (ids optional per page) -------- */
function applyManifest(m){
  if (!m) return;
  if (m.tagline && byId("tagline")) byId("tagline").textContent = m.tagline;
  if (m.bio && byId("bio"))     byId("bio").textContent = m.bio;
  if (m.pitch && byId("pitch")) byId("pitch").textContent = m.pitch;
  if (m.artist && byId("footer-line")) byId("footer-line").textContent =
      "SAINTPARK · a " + m.artist + " practice · every piece is a song";
  if (m.email){
    // every "book a piece" mailto on the page picks up the manifest email
    Array.prototype.forEach.call(document.querySelectorAll("[data-booking]"), function(b){
      b.href = "mailto:" + m.email + "?subject=" + encodeURIComponent("Saint Park commission");
    });
  }
  var linksNav = byId("links");
  if (linksNav){
    (Array.isArray(m.links) ? m.links : []).forEach(function(l){
      if (!l || !l.url || !l.label) return;
      var a = el("a", null, l.label);
      a.href = l.url;
      a.rel = "me noopener";
      a.target = "_blank";
      linksNav.appendChild(a);
    });
  }
}

/* -------- boot -------- */
Promise.all([loadJSON("ring.json"), loadJSON("manifest.json"), loadText("videos.txt")]).then(function(res){
  var ring = res[0], manifest = res[1], videosTxt = res[2];
  applyManifest(manifest);
  initWebring(ring);

  var wall = byId("wall");           // gallery.html: everything
  var featured = byId("featured");   // index.html: first few
  if (!wall && !featured) return;

  parseVideoLines(videosTxt).then(function(videoPieces){
    var pieces = sortPinned(mergePieces(ring, manifest).concat(videoPieces));

    if (wall){
      var notice = byId("wall-notice");
      if (!pieces.length){
        notice.textContent = (location.protocol === "file:")
          ? "The park needs a web server to open — serve this folder over http (any static host works)."
          : "Nothing on view yet — add slugs to ring.json (and metadata to manifest.json), then reload.";
        return;
      }
      notice.remove();
      var frag = document.createDocumentFragment();
      pieces.forEach(function(p){ frag.appendChild(buildCard(p)); });
      wall.appendChild(frag);
      var lbl = byId("wall-label");
      if (lbl) lbl.textContent = "On view · " + pieces.length + (pieces.length === 1 ? " piece" : " pieces");
    }

    if (featured){
      var noticeF = byId("featured-notice");
      if (!pieces.length){
        if (noticeF) noticeF.textContent = "The park is being planted — first pieces coming soon.";
        return;
      }
      if (noticeF) noticeF.remove();
      var fragF = document.createDocumentFragment();
      pieces.slice(0, 3).forEach(function(p){ fragF.appendChild(buildCard(p)); });
      featured.appendChild(fragF);
      var seeAll = byId("see-all");
      if (seeAll) seeAll.textContent = "Enter the gallery · " + pieces.length + (pieces.length === 1 ? " piece" : " pieces") + " →";
    }
  });
});

/* -------- scroll parallax: mascot drifts down slower than the page, clouds drift
   further off to their side — both skip entirely under prefers-reduced-motion -------- */
(function(){
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var creature = document.querySelector(".creature");
  var clouds = Array.prototype.slice.call(document.querySelectorAll(".cloud"));
  if (!creature && !clouds.length) return;
  var ticking = false;
  function apply(){
    var y = window.scrollY || window.pageYOffset || 0;
    if (creature) creature.style.transform = "translateY(" + Math.round(y * 0.3) + "px)";
    clouds.forEach(function(c){
      var dir = c.getAttribute("data-px") === "-1" ? -1 : 1;
      c.style.transform = "translateX(" + Math.round(y * 0.12 * dir) + "px)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function(){
    if (!ticking){ window.requestAnimationFrame(apply); ticking = true; }
  }, {passive:true});
  apply();
})();

})();
