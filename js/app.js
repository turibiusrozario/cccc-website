/* CCCC site script. Reads the content table (Google Sheet CSV or data/content.csv),
   decides what is upcoming or past, and draws it. No libraries. */
(function () {
  "use strict";
  var CFG = window.CCCC_CONFIG || {};
  var TZ = CFG.TIMEZONE || "America/New_York";
  var CAP = CFG.HOME_CAP || 3;
  var page = document.body.getAttribute("data-page");
  var shownSignature = null;   // what is on screen now
  var pendingRows = null;      // newer data waiting for the person to accept
  var dismissedSignature = null;

  /* ---------- CSV ---------- */
  function parseCSV(text) {
    var rows = [], row = [], field = "", inQ = false, i, c;
    text = text.replace(/^﻿/, "");
    for (i = 0; i < text.length; i++) {
      c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else { inQ = false; } }
        else { field += c; }
      } else if (c === '"') { inQ = true; }
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field); field = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
      } else { field += c; }
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return [];
    var head = rows[0].map(function (h) { return h.trim().toLowerCase().replace(/\s+/g, "_"); });
    return rows.slice(1).map(function (r) {
      var o = {};
      head.forEach(function (h, k) { o[h] = (r[k] || "").trim(); });
      return o;
    });
  }

  /* ---------- Dates (all compared as YYYY-MM-DD text) ---------- */
  function todayISO() {
    var p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    return p;   // en-CA gives YYYY-MM-DD
  }
  function toISO(s) {
    if (!s) return "";
    var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return m[1] + "-" + pad(m[2]) + "-" + pad(m[3]);
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);   // M/D/YYYY, what Google Sheets may export
    if (m) return m[3] + "-" + pad(m[1]) + "-" + pad(m[2]);
    return "";
  }
  function pad(n) { return ("0" + n).slice(-2); }
  function fmt(iso, withYear) {
    var p = iso.split("-");
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
    var o = { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" };
    if (withYear) o.year = "numeric";
    return new Intl.DateTimeFormat("en-US", o).format(d);
  }

  /* ---------- Rows to items ---------- */
  function safeURL(u) {
    if (!u) return "";
    try { var x = new URL(u, location.href); return (x.protocol === "http:" || x.protocol === "https:") ? x.href : ""; }
    catch (e) { return ""; }
  }
  function toItems(rows, today) {
    var items = [];
    rows.forEach(function (r, idx) {
      var type = (r.type || "").toLowerCase();
      if (["event", "project", "action", "resource"].indexOf(type) < 0) return;
      if (!r.title) return;
      if ((r.publish || "").toLowerCase() === "no") return;
      var start = toISO(r.start_date), end = toISO(r.end_date);
      if (type === "event" && !end) end = start;
      var it = {
        id: idx, type: type, title: r.title, start: start, end: end,
        time: r.time || "", place: r.place || "", summary: r.summary || "",
        link: safeURL(r.link), category: r.category || ""
      };
      it.isPast = !!end && end < today;
      it.started = !start || start <= today;
      items.push(it);
    });
    return items;
  }
  function byUpcoming(a, b) {
    // Happening now first (soonest end first, no end last), then future by start date. Ties keep sheet order.
    if (a.started !== b.started) return a.started ? -1 : 1;
    if (a.started) { var ae = a.end || "9999", be = b.end || "9999"; if (ae !== be) return ae < be ? -1 : 1; }
    else if (a.start !== b.start) return a.start < b.start ? -1 : 1;
    return a.id - b.id;
  }
  function byRecent(a, b) { return a.end < b.end ? 1 : a.end > b.end ? -1 : a.id - b.id; }

  function whenText(it) {
    var s = it.start, e = it.end, parts = [], yr = true;
    if (it.type === "event") {
      if (s && e && s !== e) parts.push(fmt(s, false) + " to " + fmt(e, yr)); else if (s) parts.push(fmt(s, yr));
      if (it.time) parts.push(it.time);
      if (it.place) parts.push(it.place);
    } else if (it.type === "action") {
      if (s && s > todayISO()) parts.push("Opens " + fmt(s, yr));
      if (e) parts.push((it.isPast ? "Closed " : "Due ") + fmt(e, yr)); else parts.push("Open now");
      if (it.place) parts.push(it.place);
    } else {   // project
      if (s && s > todayISO()) parts.push("Starts " + fmt(s, yr)); else if (!it.isPast) parts.push("Ongoing");
      if (e) parts.push((it.isPast ? "Ended " : "Ends ") + fmt(e, yr));
      if (it.time) parts.push(it.time);
      if (it.place) parts.push(it.place);
    }
    return parts.join(" · ");
  }

  /* ---------- Drawing ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  var EXT_SVG = '<svg class="ext" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z" fill="currentColor"/></svg>';

  function extMark(parent) {
    parent.insertAdjacentHTML("beforeend", EXT_SVG + '<span class="sr-only"> (opens in a new tab)</span>');
  }
  // Plain text plus [label](https://link) markup, built with DOM calls (no HTML from the sheet is trusted).
  function rich(parent, text) {
    var re = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
      var a = el("a", null, m[1]);
      a.href = m[2]; a.target = "_blank"; a.rel = "noopener"; extMark(a);
      parent.appendChild(a); last = re.lastIndex;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
  }

  function drawItem(it) {
    var li = el("li");
    var meta = whenText(it);
    if (it.summary) {
      var d = el("details", "item");
      var s = el("summary");
      s.appendChild(el("span", "title", it.title));
      if (meta) s.appendChild(el("span", "meta", meta));
      s.appendChild(el("span", "hint hint-closed", "Click to show more"));
      s.appendChild(el("span", "hint hint-open", "Click to show less"));
      d.appendChild(s);
      var b = el("div", "body");
      it.summary.split(/\n+/).forEach(function (t) { if (t) { var para = el("p"); rich(para, t); b.appendChild(para); } });
      if (it.link) {
        var p = el("p"), a = el("a", "button secondary");
        a.href = it.link; a.target = "_blank"; a.rel = "noopener";
        a.appendChild(document.createTextNode("Open link"));
        extMark(a);
        p.appendChild(a); b.appendChild(p);
      }
      d.appendChild(b);
      li.appendChild(d);
    } else if (it.link) {
      var l = el("a", "item");
      l.href = it.link; l.target = "_blank"; l.rel = "noopener";
      l.appendChild(el("span", "title", it.title));
      if (meta) l.appendChild(el("span", "meta", meta));
      var h = el("span", "hint");
      extMark(h);   // icon only, with a hidden text label for screen readers
      l.appendChild(h);
      li.appendChild(l);
    } else {
      var x = el("div", "item");
      x.appendChild(el("span", "title", it.title));
      if (meta) x.appendChild(el("span", "meta", meta));
      li.appendChild(x);
    }
    return li;
  }

  function drawList(container, items, emptyText, cap) {
    container.textContent = "";
    container.removeAttribute("aria-busy");
    if (!items.length) {
      var li = el("li"); li.appendChild(el("p", "empty", emptyText)); container.appendChild(li);
      return;
    }
    var shown = cap ? items.slice(0, cap) : items, rest = cap ? items.slice(cap) : [];
    shown.forEach(function (it) { container.appendChild(drawItem(it)); });
    if (rest.length) {
      var wrap = el("li"), det = el("details", "more");
      det.appendChild(el("summary", null, "Show " + rest.length + " more"));
      var ul = el("ul", "items");
      rest.forEach(function (it) { ul.appendChild(drawItem(it)); });
      det.appendChild(ul); wrap.appendChild(det); container.appendChild(wrap);
    }
  }

  function drawResources(container, items) {
    container.textContent = "";
    container.removeAttribute("aria-busy");
    if (!items.length) { container.appendChild(el("p", "empty", "None yet.")); return; }
    var groups = [], map = {};
    items.forEach(function (it) {
      var c = it.category || "More links";
      if (!map[c]) { map[c] = []; groups.push(c); }
      map[c].push(it);
    });
    groups.forEach(function (g) {
      container.appendChild(el("h2", null, g));
      var ul = el("ul", "res-list");
      map[g].forEach(function (it) {
        var li = el("li");
        if (it.link) {
          var a = el("a", "res-name"); a.href = it.link; a.target = "_blank"; a.rel = "noopener";
          a.appendChild(document.createTextNode(it.title));
          extMark(a);
          li.appendChild(a);
        } else { li.appendChild(el("span", "res-name", it.title)); }
        if (it.summary) { var sp = el("p"); rich(sp, it.summary); li.appendChild(sp); }
        ul.appendChild(li);
      });
      container.appendChild(ul);
    });
  }

  function view(rows) {
    var today = todayISO(), items = toItems(rows, today);
    var v = { event: [], project: [], action: [], resource: [], past: { event: [], project: [], action: [] } };
    items.forEach(function (it) {
      if (it.type === "resource") v.resource.push(it);
      else if (it.isPast) v.past[it.type].push(it);
      else v[it.type].push(it);
    });
    ["event", "project", "action"].forEach(function (t) { v[t].sort(byUpcoming); v.past[t].sort(byRecent); });
    return v;
  }
  function signature(v) {
    function ids(a) { return a.map(function (i) { return i.id + ":" + i.title + "|" + i.start + "|" + i.end + "|" + i.time + "|" + i.place + "|" + i.summary + "|" + i.link; }).join("~"); }
    return [ids(v.event), ids(v.project), ids(v.action), ids(v.resource), ids(v.past.event), ids(v.past.project), ids(v.past.action)].join("##");
  }

  function render(v) {
    var q = function (n) { return document.querySelector('[data-list="' + n + '"]'); };
    if (page === "home") {
      drawList(q("event"), v.event, "None right now.", CAP);
      drawList(q("project"), v.project, "None right now.", CAP);
      drawList(q("action"), v.action, "None right now.", CAP);
    } else if (page === "past") {
      drawList(q("event"), v.past.event, "None yet.");
      drawList(q("project"), v.past.project, "None yet.");
      drawList(q("action"), v.past.action, "None yet.");
    } else if (page === "resources") {
      drawResources(document.querySelector("[data-resources]"), v.resource);
    }
    var stamp = document.getElementById("checked");
    if (stamp) stamp.textContent = "Content last checked at " + new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(new Date()) + ".";
  }

  /* ---------- Loading and refresh prompt ---------- */
  function fetchText(url, bust) {
    var u = url;
    if (bust) u += (url.indexOf("?") < 0 ? "?" : "&") + "_=" + Date.now();
    return fetch(u, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    });
  }
  function load(bust) {
    var primary = CFG.SHEET_CSV_URL || CFG.FALLBACK_CSV || "data/content.csv";
    return fetchText(primary, bust).catch(function (e) {
      if (primary !== CFG.FALLBACK_CSV && CFG.FALLBACK_CSV) return fetchText(CFG.FALLBACK_CSV, bust);
      throw e;
    }).then(parseCSV);
  }

  var bar = document.getElementById("update-bar");
  function showBar() { if (bar) bar.hidden = false; }
  function hideBar() { if (bar) bar.hidden = true; }
  if (bar) {
    document.getElementById("update-accept").addEventListener("click", function () {
      if (pendingRows) { var v = view(pendingRows); shownSignature = signature(v); render(v); pendingRows = null; }
      hideBar();
    });
    document.getElementById("update-dismiss").addEventListener("click", function () {
      dismissedSignature = bar.getAttribute("data-sig"); hideBar();
    });
  }

  function check() {
    load(true).then(function (rows) {
      var v = view(rows), sig = signature(v);
      if (shownSignature === null) { shownSignature = sig; render(v); return; }
      if (sig !== shownSignature && sig !== dismissedSignature) {
        pendingRows = rows; bar.setAttribute("data-sig", sig); showBar();
      }
    }).catch(function () {
      if (shownSignature === null) {
        document.querySelectorAll("[data-list],[data-resources]").forEach(function (n) {
          n.removeAttribute("aria-busy");
          n.textContent = "";
          var p = el("p", "empty", "The list could not be loaded. Please reload the page.");
          n.appendChild(p);
        });
      }
    });
  }

  if (page) {
    check();
    var mins = CFG.CHECK_EVERY_MINUTES || 5;
    setInterval(function () { if (!document.hidden) check(); }, mins * 60000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) check(); });
  }
})();
