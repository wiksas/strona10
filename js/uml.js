/* Rysuje diagramy klas UML jako SVG na podstawie opisów z diagrams.js. */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var CW = 7.2;   // szerokość znaku IBM Plex Mono 12px
  var TW = 7.8;   // szerokość znaku tytułu (13px)
  var LH = 16;
  var PAD = 10;

  var TYPE_NAME = {
    inheritance: "dziedziczenie",
    realization: "implementacja interfejsu",
    composition: "kompozycja",
    aggregation: "agregacja",
    association: "asocjacja",
    dependency: "zależność"
  };

  function svgEl(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // "_" na początku = składnik statyczny (podkreślenie), "*" = abstrakcyjny (kursywa)
  function parseRow(r) {
    var s = false, a = false;
    for (;;) {
      if (r.charAt(0) === "_") { s = true; r = r.slice(1); }
      else if (r.charAt(0) === "*") { a = true; r = r.slice(1); }
      else break;
    }
    return { t: r, s: s, a: a };
  }

  function layout(n) {
    var attrs = (n.attrs || []).map(parseRow);
    var ops = (n.ops || []).map(parseRow);
    var compact = !n.attrs && !n.ops;
    var head = [];
    if (n.stereo) head.push({ t: "\u00ab" + n.stereo + "\u00bb", k: "stereo" });
    head.push({ t: n.title, k: "title" });
    if (n.role) head.push({ t: "(" + n.role + ")", k: "role" });
    var widths = head.map(function (h) { return h.t.length * (h.k === "title" ? TW : CW); })
      .concat(attrs.concat(ops).map(function (r) { return r.t.length * CW; }));
    var w = Math.max(n.w || 0, Math.ceil(Math.max.apply(null, widths) + PAD * 2), 80);
    var headH = head.length * LH + (compact ? 20 : 12);
    var attrH = compact ? 0 : (attrs.length ? attrs.length * LH + 10 : 10);
    var opsH = compact ? 0 : (ops.length ? ops.length * LH + 10 : 10);
    return {
      id: n.id, x: n.x, y: n.y, w: w, h: headH + attrH + opsH,
      head: head, attrs: attrs, ops: ops, headH: headH, attrH: attrH, compact: compact,
      abstract: !!n.abstract, title: n.title, note: n.note
    };
  }

  function port(b, side, f) {
    if (f == null) f = 0.5;
    if (side === "t") return [b.x + b.w * f, b.y];
    if (side === "b") return [b.x + b.w * f, b.y + b.h];
    if (side === "l") return [b.x, b.y + b.h * f];
    return [b.x + b.w, b.y + b.h * f];
  }

  function clip(b, toward) {
    var cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    var dx = toward[0] - cx, dy = toward[1] - cy;
    if (!dx && !dy) return [cx, cy];
    var t = Math.min(dx ? (b.w / 2) / Math.abs(dx) : Infinity, dy ? (b.h / 2) / Math.abs(dy) : Infinity);
    return [cx + dx * t, cy + dy * t];
  }

  function route(e, A, B) {
    if (e.points) return e.points;
    var vertical = function (s) { return s === "t" || s === "b"; };
    var mid = e.via || null;
    if (e.fp && e.tp) {
      var s = port(A, e.fp, e.ff), t = port(B, e.tp, e.tf);
      if (!mid) {
        if (vertical(e.fp) && vertical(e.tp)) {
          if (Math.abs(s[0] - t[0]) < 0.5) mid = [];
          else { var my = e.my != null ? e.my : (s[1] + t[1]) / 2; mid = [[s[0], my], [t[0], my]]; }
        } else if (!vertical(e.fp) && !vertical(e.tp)) {
          if (Math.abs(s[1] - t[1]) < 0.5) mid = [];
          else { var mx = e.mx != null ? e.mx : (s[0] + t[0]) / 2; mid = [[mx, s[1]], [mx, t[1]]]; }
        } else if (vertical(e.fp)) mid = [[s[0], t[1]]];
        else mid = [[t[0], s[1]]];
      }
      return [s].concat(mid, [t]);
    }
    var cA = [A.x + A.w / 2, A.y + A.h / 2], cB = [B.x + B.w / 2, B.y + B.h / 2];
    var pts = mid || [];
    return [clip(A, pts[0] || cB)].concat(pts, [clip(B, pts[pts.length - 1] || cA)]);
  }

  function unit(p, q) {
    var dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  }
  function pt(p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }

  // trójkąt z wierzchołkiem w t, u = kierunek linii wchodzącej w t
  function triangle(t, u) {
    var b = [t[0] - u[0] * 13, t[1] - u[1] * 13], n = [-u[1], u[0]];
    return [t, [b[0] + n[0] * 7, b[1] + n[1] * 7], [b[0] - n[0] * 7, b[1] - n[1] * 7]];
  }
  // romb zaczynający się w s, u = kierunek od s w głąb linii
  function diamond(s, u) {
    var m = [s[0] + u[0] * 9, s[1] + u[1] * 9], n = [-u[1], u[0]];
    return [s, [m[0] + n[0] * 6, m[1] + n[1] * 6], [s[0] + u[0] * 18, s[1] + u[1] * 18], [m[0] - n[0] * 6, m[1] - n[1] * 6]];
  }
  function openArrow(t, u) {
    var b = [t[0] - u[0] * 11, t[1] - u[1] * 11], n = [-u[1], u[0]];
    return [[b[0] + n[0] * 6, b[1] + n[1] * 6], t, [b[0] - n[0] * 6, b[1] - n[1] * 6]];
  }

  function drawNode(svg, b) {
    var g = svgEl("g", { "class": "u-node", "data-key": "n:" + b.id }, svg);
    svgEl("rect", { x: b.x, y: b.y, width: b.w, height: b.h, "class": "u-box" }, g);
    var y = b.y + 6;
    b.head.forEach(function (h) {
      y += LH;
      var cls = h.k === "title" ? "u-title" + (b.abstract ? " u-abs" : "") : "u-small";
      var t = svgEl("text", { x: b.x + b.w / 2, y: y - 3, "text-anchor": "middle", "class": cls }, g);
      t.textContent = h.t;
    });
    if (b.compact) return g;
    var y0 = b.y + b.headH;
    svgEl("line", { x1: b.x, y1: y0, x2: b.x + b.w, y2: y0, "class": "u-sep" }, g);
    var y1 = y0 + b.attrH;
    svgEl("line", { x1: b.x, y1: y1, x2: b.x + b.w, y2: y1, "class": "u-sep" }, g);
    function rows(list, top) {
      list.forEach(function (r, i) {
        var cls = "u-row" + (r.s ? " u-static" : "") + (r.a ? " u-abs" : "");
        var t = svgEl("text", { x: b.x + PAD, y: top + 5 + (i + 1) * LH - 4, "class": cls }, g);
        t.textContent = r.t;
      });
    }
    rows(b.attrs, y0);
    rows(b.ops, y1);
    return g;
  }

  function label(g, text, x, y, anchor, cls) {
    var t = svgEl("text", { x: x, y: y, "text-anchor": anchor || "middle", "class": cls || "u-label" }, g);
    t.textContent = text;
  }

  function drawEdge(svg, e, i, boxes) {
    var A = boxes[e.from], B = boxes[e.to];
    var pts = route(e, A, B);
    var dashed = e.type === "realization" || e.type === "dependency";
    var g = svgEl("g", { "class": "u-edge", "data-key": "e:" + i }, svg);
    var d = pts.map(pt).join(" ");
    svgEl("polyline", { points: d, "class": "u-hit" }, g);
    svgEl("polyline", { points: d, "class": "u-line" + (dashed ? " u-dash" : "") }, g);

    var end = pts[pts.length - 1], uEnd = unit(pts[pts.length - 2], end);
    var start = pts[0], uStart = unit(start, pts[1]);
    if (e.type === "inheritance" || e.type === "realization") {
      svgEl("polygon", { points: triangle(end, uEnd).map(pt).join(" "), "class": "u-head-hollow" }, g);
    } else if (e.type === "composition" || e.type === "aggregation") {
      svgEl("polygon", { points: diamond(start, uStart).map(pt).join(" "), "class": e.type === "composition" ? "u-head-filled" : "u-head-hollow" }, g);
      if (e.arrow) svgEl("polyline", { points: openArrow(end, uEnd).map(pt).join(" "), "class": "u-line" }, g);
    } else if (e.type === "dependency" || (e.type === "association" && e.arrow !== false)) {
      svgEl("polyline", { points: openArrow(end, uEnd).map(pt).join(" "), "class": "u-line" }, g);
    }

    if (e.label) {
      var lx, ly, anchor = "middle";
      if (e.lx != null) { lx = e.lx; ly = e.ly; anchor = e.la || "middle"; }
      else {
        var best = 0, bi = 0;
        for (var k = 0; k < pts.length - 1; k++) {
          var len = Math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]);
          if (len > best) { best = len; bi = k; }
        }
        var p = pts[bi], q = pts[bi + 1];
        lx = (p[0] + q[0]) / 2; ly = (p[1] + q[1]) / 2;
        if (Math.abs(p[0] - q[0]) < 1) { lx += 8; ly += 4; anchor = "start"; } else { ly -= 7; }
      }
      label(g, e.label, lx, ly, anchor);
    }
    function mult(text, at, u, sign) {
      var n = [-u[1], u[0]];
      var x = at[0] + u[0] * 18 * sign + n[0] * 11, y = at[1] + u[1] * 18 * sign + n[1] * 11 + 4;
      label(g, text, x, y, "middle", "u-mult");
    }
    if (e.fm) mult(e.fm, start, uStart, 1);
    if (e.tm) mult(e.tm, end, uEnd, -1);
    return g;
  }

  function describeEdge(e, boxes) {
    return boxes[e.from].title + " \u2192 " + boxes[e.to].title + ": " + TYPE_NAME[e.type];
  }

  function render(figure, spec) {
    var canvas = figure.querySelector(".uml-canvas");
    var cssW = parseFloat(canvas.style.getPropertyValue("--w"));
    var cssH = parseFloat(canvas.style.getPropertyValue("--h"));
    if (cssW !== spec.w || cssH !== spec.h) {
      console.warn("UML: wymiary w HTML (" + cssW + "x" + cssH + ") różnią się od opisu " + spec.id + " (" + spec.w + "x" + spec.h + ")");
    }
    var boxes = {};
    spec.nodes.forEach(function (n) { boxes[n.id] = layout(n); });

    var titleId = "uml-t-" + spec.id;
    var svg = svgEl("svg", { viewBox: "0 0 " + spec.w + " " + spec.h, role: "img", "aria-labelledby": titleId, width: spec.w, height: spec.h });
    svgEl("title", { id: titleId }, svg).textContent = spec.title;
    var edgeLayer = svgEl("g", {}, svg);
    var nodeLayer = svgEl("g", {}, svg);
    spec.nodes.forEach(function (n) { drawNode(nodeLayer, boxes[n.id]); });
    (spec.edges || []).forEach(function (e, i) { drawEdge(edgeLayer, e, i, boxes); });
    canvas.appendChild(svg);

    if (spec.interactive === false) return;

    var parts = [];
    spec.nodes.forEach(function (n) { if (n.note) parts.push({ key: "n:" + n.id, name: n.title, note: n.note }); });
    (spec.edges || []).forEach(function (e, i) {
      if (e.note) parts.push({ key: "e:" + i, name: e.name || describeEdge(e, boxes), note: e.note });
    });
    if (!parts.length) return;

    var group = document.createElement("div");
    group.className = "uml-parts";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Elementy diagramu: " + spec.title);
    var out = document.createElement("p");
    out.className = "uml-explain";
    out.setAttribute("aria-live", "polite");
    out.textContent = "Kliknij klasę albo strzałkę na diagramie lub użyj przycisków powyżej, a tutaj zobaczysz, co oznacza.";

    var buttons = {};
    function select(key) {
      var part = parts.filter(function (p) { return p.key === key; })[0];
      if (!part) return;
      Object.keys(buttons).forEach(function (k) { buttons[k].setAttribute("aria-pressed", String(k === key)); });
      svg.querySelectorAll("[data-key]").forEach(function (g) { g.classList.toggle("is-sel", g.getAttribute("data-key") === key); });
      out.textContent = "";
      var strong = document.createElement("strong");
      strong.textContent = part.name + ": ";
      out.appendChild(strong);
      out.appendChild(document.createTextNode(part.note));
    }
    parts.forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.setAttribute("aria-pressed", "false");
      b.textContent = p.name;
      b.addEventListener("click", function () { select(p.key); });
      buttons[p.key] = b;
      group.appendChild(b);
    });
    svg.querySelectorAll("[data-key]").forEach(function (g) {
      var key = g.getAttribute("data-key");
      if (!buttons[key]) return;
      g.classList.add("is-clickable");
      g.addEventListener("click", function () { select(key); });
    });
    var scroll = figure.querySelector(".uml-scroll");
    scroll.insertAdjacentElement("afterend", out);
    scroll.insertAdjacentElement("afterend", group);
  }

  window.UML = { render: render, TYPE_NAME: TYPE_NAME };
})();
