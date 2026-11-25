(function () {
  "use strict";

  /* ---------- motyw ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("theme-toggle");
  function syncThemeButton() {
    var dark = root.getAttribute("data-theme") === "dark";
    themeBtn.setAttribute("aria-pressed", String(dark));
    themeBtn.querySelector("span").textContent = dark ? "Jasny motyw" : "Ciemny motyw";
  }
  themeBtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* tryb prywatny: motyw tylko na tę wizytę */ }
    syncThemeButton();
  });
  syncThemeButton();

  /* ---------- spis treści na telefonie ---------- */
  var tocBtn = document.getElementById("toc-toggle");
  var toc = document.getElementById("toc");
  function setToc(open) {
    tocBtn.setAttribute("aria-expanded", String(open));
    toc.classList.toggle("is-open", open);
  }
  tocBtn.addEventListener("click", function () { setToc(tocBtn.getAttribute("aria-expanded") !== "true"); });
  toc.addEventListener("click", function (e) { if (e.target.closest("a")) setToc(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && tocBtn.getAttribute("aria-expanded") === "true") { setToc(false); tocBtn.focus(); }
  });

  /* ---------- ściąga: zasłoń / odsłoń odpowiedzi ---------- */
  var cheatBtn = document.getElementById("cheat-toggle");
  var cheatItems = document.querySelectorAll("#sciaga details");
  cheatBtn.addEventListener("click", function () {
    var hide = cheatBtn.getAttribute("aria-pressed") !== "true";
    cheatItems.forEach(function (d) { d.open = !hide; });
    cheatBtn.setAttribute("aria-pressed", String(hide));
    cheatBtn.textContent = hide ? "Odsłoń wszystkie odpowiedzi" : "Zasłoń odpowiedzi i sprawdź się";
  });

  /* ---------- diagramy ---------- */
  document.querySelectorAll("[data-uml]").forEach(function (fig) {
    var spec = window.DIAGRAMS[fig.getAttribute("data-uml")];
    if (!spec) { console.error("Brak opisu diagramu: " + fig.getAttribute("data-uml")); return; }
    window.UML.render(fig, spec);
    var hint = document.createElement("p");
    hint.className = "uml-hint";
    hint.hidden = true;
    hint.textContent = "Rysunek jest szerszy niż ekran: przesuń go w bok.";
    fig.querySelector(".uml-scroll").insertAdjacentElement("afterend", hint);
  });

  // Przewijane w poziomie bloki (diagramy, tabele, kod) muszą dać się przewinąć klawiaturą.
  function markScrollers() {
    document.querySelectorAll(".uml-scroll, .table-wrap, pre").forEach(function (el) {
      var over = el.scrollWidth > el.clientWidth + 1;
      if (over) el.setAttribute("tabindex", "0"); else el.removeAttribute("tabindex");
      var hint = el.nextElementSibling;
      if (hint && hint.classList.contains("uml-hint")) hint.hidden = !over;
    });
  }
  markScrollers();
  window.addEventListener("resize", markScrollers);
  document.addEventListener("toggle", markScrollers, true);

  /* ---------- kalkulatory ---------- */
  function num(input) {
    var raw = input.value.trim().replace(",", ".");
    if (raw === "" || !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(raw)) return null;
    return parseFloat(raw);
  }
  function fmt(v) {
    if (Math.abs(v) < 1e-10) v = 0;
    var s = (Math.round(v * 10000) / 10000).toString();
    return s.replace(".", ",").replace("-", "\u2212");
  }
  // liczba jako składnik działania: ujemne w nawiasie, żeby (−3)² nie wyglądało jak −3²
  function p(v) { var s = fmt(v); return s.charAt(0) === "\u2212" ? "(" + s + ")" : s; }
  function readAll(form, names) {
    var vals = {}, bad = [];
    names.forEach(function (n) {
      var input = form.elements[n];
      var v = num(input);
      input.setAttribute("aria-invalid", String(v === null));
      if (v === null) bad.push(input.getAttribute("data-label") || input.labels[0].textContent.trim()); else vals[n] = v;
    });
    return { vals: vals, bad: bad };
  }
  function showError(out, bad) {
    out.className = "calc-out is-error";
    out.textContent = "Nie da się policzyć. Popraw: " + bad.join("; ") + ". Wpisz liczbę, np. 3 albo \u22121,5.";
  }
  function showResult(out, lines) {
    out.className = "calc-out is-done";
    out.textContent = "";
    lines.forEach(function (l) {
      var div = document.createElement("div");
      div.textContent = l;
      out.appendChild(div);
    });
  }
  function bindCalc(id, names, compute) {
    var form = document.getElementById(id);
    var out = form.querySelector(".calc-out");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var r = readAll(form, names);
      if (r.bad.length) { showError(out, r.bad); form.querySelector("[aria-invalid=true]").focus(); return; }
      showResult(out, compute(r.vals));
    });
  }

  bindCalc("calc-k2b", ["x", "y"], function (v) {
    var r = Math.hypot(v.x, v.y);
    var a = Math.atan2(v.y, v.x);
    return [
      "r = \u221a(" + p(v.x) + "\u00b2 + " + p(v.y) + "\u00b2) = " + fmt(r),
      "\u03b1 = atan2(" + fmt(v.y) + ", " + fmt(v.x) + ") = " + fmt(a) + " rad = " + fmt(a * 180 / Math.PI) + "\u00b0"
    ];
  });
  bindCalc("calc-b2k", ["r", "a"], function (v) {
    var rad = v.a * Math.PI / 180;
    return [
      "\u03b1 = " + fmt(v.a) + "\u00b0 = " + fmt(rad) + " rad",
      "x = " + fmt(v.r) + " \u00b7 cos \u03b1 = " + fmt(v.r * Math.cos(rad)),
      "y = " + fmt(v.r) + " \u00b7 sin \u03b1 = " + fmt(v.r * Math.sin(rad))
    ];
  });
  bindCalc("calc-vec", ["ax", "ay", "az", "bx", "by", "bz"], function (v) {
    var cx = v.ay * v.bz - v.az * v.by;
    var cy = v.az * v.bx - v.ax * v.bz;
    var cz = v.ax * v.by - v.ay * v.bx;
    var dot = v.ax * v.bx + v.ay * v.by + v.az * v.bz;
    return [
      "|a| = " + fmt(Math.sqrt(v.ax * v.ax + v.ay * v.ay + v.az * v.az)) + ",  |b| = " + fmt(Math.sqrt(v.bx * v.bx + v.by * v.by + v.bz * v.bz)),
      "a \u00b7 b = " + p(v.ax) + "\u00b7" + p(v.bx) + " + " + p(v.ay) + "\u00b7" + p(v.by) + " + " + p(v.az) + "\u00b7" + p(v.bz) + " = " + fmt(dot),
      "a \u00d7 b, składowa x: " + p(v.ay) + "\u00b7" + p(v.bz) + " \u2212 " + p(v.az) + "\u00b7" + p(v.by) + " = " + fmt(cx),
      "a \u00d7 b, składowa y: " + p(v.az) + "\u00b7" + p(v.bx) + " \u2212 " + p(v.ax) + "\u00b7" + p(v.bz) + " = " + fmt(cy),
      "a \u00d7 b, składowa z: " + p(v.ax) + "\u00b7" + p(v.by) + " \u2212 " + p(v.ay) + "\u00b7" + p(v.bx) + " = " + fmt(cz),
      "a \u00d7 b = (" + fmt(cx) + "; " + fmt(cy) + "; " + fmt(cz) + ")"
    ];
  });

  /* ---------- quiz ---------- */
  var Q = window.QUIZ;
  var quiz = document.getElementById("quiz-box");
  var progress = document.getElementById("quiz-progress");
  var state;

  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function start(indexes) {
    state = { order: indexes, pos: 0, good: 0, wrong: [] };
    renderQuestion();
  }
  function button(text, cls, onClick) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = cls;
    b.textContent = text;
    b.addEventListener("click", onClick);
    return b;
  }
  function renderQuestion() {
    var item = Q[state.order[state.pos]];
    progress.textContent = "Pytanie " + (state.pos + 1) + " z " + state.order.length + " \u00b7 dobrze: " + state.good;
    quiz.textContent = "";
    var topic = document.createElement("p");
    topic.className = "quiz-topic";
    topic.textContent = item.topic;
    var h = document.createElement("h3");
    h.className = "quiz-q";
    h.id = "quiz-q";
    h.tabIndex = -1;
    h.textContent = item.q;
    var list = document.createElement("div");
    list.className = "quiz-options";
    list.setAttribute("role", "group");
    list.setAttribute("aria-labelledby", "quiz-q");
    var feedback = document.createElement("div");
    feedback.className = "quiz-feedback";
    feedback.setAttribute("aria-live", "polite");

    item.options.forEach(function (text, i) {
      var b = button(text, "quiz-option", function () { answer(i, list, feedback, item); });
      list.appendChild(b);
    });
    quiz.append(topic, h, list, feedback);
  }
  function answer(i, list, feedback, item) {
    var ok = i === item.correct;
    if (ok) state.good++; else state.wrong.push(state.order[state.pos]);
    list.querySelectorAll("button").forEach(function (b, k) {
      b.disabled = true;
      if (k === item.correct) { b.classList.add("is-correct"); b.prepend(mark("\u2713 poprawna: ")); }
      else if (k === i) { b.classList.add("is-wrong"); b.prepend(mark("\u2717 twoja: ")); }
    });
    feedback.textContent = "";
    var verdict = document.createElement("p");
    verdict.className = ok ? "verdict is-correct" : "verdict is-wrong";
    verdict.textContent = ok ? "Dobrze." : "Źle.";
    var why = document.createElement("p");
    why.textContent = item.explain;
    var last = state.pos === state.order.length - 1;
    var next = button(last ? "Zobacz wynik" : "Następne pytanie", "btn btn-primary", function () {
      state.pos++;
      if (state.pos < state.order.length) renderQuestion(); else renderSummary();
      document.getElementById(state.pos < state.order.length ? "quiz-q" : "quiz-score").focus();
    });
    feedback.append(verdict, why, next);
    progress.textContent = "Pytanie " + (state.pos + 1) + " z " + state.order.length + " \u00b7 dobrze: " + state.good;
    next.focus();
  }
  function mark(t) {
    var s = document.createElement("span");
    s.className = "quiz-mark";
    s.textContent = t;
    return s;
  }
  function renderSummary() {
    var total = state.order.length;
    progress.textContent = "Koniec \u00b7 dobrze: " + state.good + " z " + total;
    quiz.textContent = "";
    var h = document.createElement("h3");
    h.className = "quiz-q";
    h.id = "quiz-score";
    h.tabIndex = -1;
    h.textContent = "Wynik: " + state.good + " z " + total;
    quiz.appendChild(h);
    var p = document.createElement("p");
    var actions = document.createElement("div");
    actions.className = "quiz-actions";
    if (state.wrong.length) {
      p.textContent = "Do powtórki: " + state.wrong.map(function (k) { return Q[k].topic; })
        .filter(function (t, i, a) { return a.indexOf(t) === i; }).join(", ") + ".";
      var wrong = state.wrong.slice();
      actions.appendChild(button("Powtórz tylko błędne (" + wrong.length + ")", "btn btn-primary", function () {
        start(shuffle(wrong)); document.getElementById("quiz-q").focus();
      }));
    } else {
      p.textContent = "Wszystko dobrze. Zasłoń odpowiedzi w ściądze i spróbuj odpowiedzieć z pamięci.";
    }
    actions.appendChild(button("Od nowa, w losowej kolejności", "btn", function () {
      start(shuffle(Q.map(function (_, k) { return k; }))); document.getElementById("quiz-q").focus();
    }));
    quiz.append(p, actions);
  }

  start(Q.map(function (_, k) { return k; }));
  document.getElementById("quiz-shuffle").addEventListener("click", function () {
    start(shuffle(Q.map(function (_, k) { return k; })));
    document.getElementById("quiz-q").focus();
  });
})();
