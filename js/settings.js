/* Display settings: text size, theme, spacing. Saved in this browser only.
   The first part runs before the page is drawn so nothing flashes. */
(function () {
  "use strict";
  var KEY = "cccc-display";
  var DEFAULTS = { text: "default", theme: "auto", space: "default" };
  var s = {};
  function load() {
    try { s = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { s = {}; }
    Object.keys(DEFAULTS).forEach(function (k) { if (!s[k]) s[k] = DEFAULTS[k]; });
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage blocked: setting lasts for this page only */ } }
  function apply() {
    var r = document.documentElement;
    function set(a, v, d) { if (v === d) r.removeAttribute(a); else r.setAttribute(a, v); }
    set("data-text", s.text, "default");
    set("data-theme", s.theme, "auto");
    set("data-space", s.space, "default");
  }
  load(); apply();

  var GROUPS = [
    { key: "text", legend: "Text size", opts: [["default", "Default"], ["large", "Large"], ["xlarge", "Extra large"]] },
    { key: "theme", legend: "Theme", opts: [["auto", "Match my device"], ["light", "Light"], ["dark", "Dark"]] },
    { key: "space", legend: "Spacing", opts: [["default", "Default"], ["wide", "Wide"]] }
  ];
  function build() {
    var slot = document.getElementById("settings-slot");
    if (!slot) return;
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "settings-btn"; btn.id = "settings-btn";
    btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "settings-panel");
    btn.textContent = "Display settings";
    var panel = document.createElement("div");
    panel.id = "settings-panel"; panel.className = "settings-panel"; panel.hidden = true;
    panel.setAttribute("role", "group"); panel.setAttribute("aria-label", "Display settings");
    GROUPS.forEach(function (g) {
      var fs = document.createElement("fieldset"), lg = document.createElement("legend");
      lg.textContent = g.legend; fs.appendChild(lg);
      g.opts.forEach(function (o) {
        var lb = document.createElement("label"), inp = document.createElement("input");
        inp.type = "radio"; inp.name = "set-" + g.key; inp.value = o[0]; inp.checked = s[g.key] === o[0];
        inp.addEventListener("change", function () { s[g.key] = o[0]; save(); apply(); });
        lb.appendChild(inp); lb.appendChild(document.createTextNode(o[1])); fs.appendChild(lb);
      });
      panel.appendChild(fs);
    });
    var reset = document.createElement("button");
    reset.type = "button"; reset.className = "secondary"; reset.textContent = "Reset to defaults";
    reset.addEventListener("click", function () {
      s = {}; Object.keys(DEFAULTS).forEach(function (k) { s[k] = DEFAULTS[k]; });
      save(); apply();
      panel.querySelectorAll("input").forEach(function (i) { i.checked = s[i.name.slice(4)] === i.value; });
    });
    panel.appendChild(reset);
    function toggle(open) { panel.hidden = !open; btn.setAttribute("aria-expanded", String(open)); }
    btn.addEventListener("click", function () { toggle(panel.hidden); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { toggle(false); btn.focus(); } });
    document.addEventListener("click", function (e) { if (!panel.hidden && !panel.contains(e.target) && e.target !== btn) toggle(false); });
    slot.appendChild(btn);
    document.querySelector(".site-header .wrap").appendChild(panel);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
