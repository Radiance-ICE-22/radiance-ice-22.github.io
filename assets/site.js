// Radiance site: phrase demo, Galley feature cards, charts drawn to scale from the measured numbers.
(() => {
  const $ = (s) => document.querySelector(s);
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, text) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; };

  // ── Try a phrase ────────────────────────────────────────────────────────────
  // Results as Galley returned them on 12 Oct 2026 (backroom, default lift); error = distance from the goal to our annotation.
  const PHRASES = [
    { q: "red tool chest", kind: "hit", text: "found · error 0.38 m · approach gap 0.43 m" },
    { q: "garden cart", kind: "hit", text: "found · error 0.62 m · approach gap 0.19 m" },
    { q: "grandfather clock", kind: "hit", text: "found · error 0.03 m · approach gap 0.30 m" },
    { q: "whiteboard", kind: "hit", text: "found · error 0.37 m · approach gap 0.26 m" },
    { q: "shop vacuum", kind: "hit", text: "found · error 0.01 m · approach gap 0.21 m" },
    { q: "office chair", kind: "miss", text: "miss · the top cluster is a different object, 3.4 m from the annotated chair" },
    { q: "bicycle", kind: "absent", text: "not in the room · nothing clears the threshold, so no goal is made" },
  ];
  const vid = $("#phrase-video"), res = $("#phrase-result"), bar = $("#phrases");
  const slug = (q) => q.replace(/ /g, "_");
  function pick(i, play = true) {
    const p = PHRASES[i];
    bar.querySelectorAll(".chip").forEach((c, j) => c.setAttribute("aria-selected", String(j === i)));
    const base = `media/galley/phrase_${slug(p.q)}_view`;
    vid.poster = `${base}.jpg`; vid.src = `${base}.mp4`;
    if (play) vid.play().catch(() => {});
    const cls = p.kind === "hit" ? "hit" : "miss";
    res.innerHTML = `<b>“${p.q}”</b> → <span class="${cls}">${p.text}</span> · about 2.8 s on the CPU`;
  }
  if (bar && vid) {
    PHRASES.forEach((p, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "chip"; b.setAttribute("role", "tab");
      b.innerHTML = p.q + (p.kind === "miss" ? ' <span class="mark">miss</span>' : p.kind === "absent" ? ' <span class="mark">absent</span>' : "");
      b.addEventListener("click", () => pick(i));
      bar.appendChild(b);
    });
    pick(0, false);
    // autoplay only while the player is on screen
    if ("IntersectionObserver" in window) new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? vid.play().catch(() => {}) : vid.pause())), { threshold: 0.3 }).observe(vid);
  }

  // ── Galley features ─────────────────────────────────────────────────────────
  const FEATURES = [
    { f: "inspect_view", t: "Click a Gaussian, see what it means", d: "Pick any point in the splat; Galley ranks a list of labels by how well that Gaussian’s feature matches each one.", fact: "cosine similarity to CLIP text embeddings" },
    { f: "floor_view", t: "Relevancy floor", d: "Lower the floor and more of the room lights up; the legend counts the Gaussians above it.", fact: "8,328 → 31,658 lit as the floor drops 0.69 → 0.50" },
    { f: "pca_view", t: "What the features look like", d: "A PCA of the per-Gaussian features: surfaces with similar meaning get similar colours.", fact: "532,361 feature rows, one per Gaussian" },
    { f: "compare_view", t: "Lift and FMGS side by side", d: "The same query on both feature backends, with one shared camera.", fact: "lift 22/29 · FMGS 15/29 (multi-scale teachers)", shape: "wide" },
    { f: "evaluate_view", t: "Score every annotation", d: "Query all runs every annotated object, and every object that is not in the room, and marks each hit or miss. Shown at 3× speed.", fact: "21 backroom annotations, 3 of them absent", shape: "tall" },
    { f: "send", t: "Send the goal to a course", d: "One click writes the goal and its approach point into a course and opens the course editor.", fact: "goal, label and approach saved with the course", shape: "wide" },
    { f: "gapcheck", t: "Collisions caught before flight", d: "A straight course to the grandfather clock would pass through a bench. The clearance check flags it in the preview.", fact: "7.75 m path · min gap −0.088 m at 3.95 s (limit 0.15 m)", shape: "wide" },
    { f: "course_cart", t: "A semantic course, previewed", d: "The course built for “cart” flown as a minimum-snap preview over the splat, with speed, thrust and clearance charts.", fact: "6 keyframes · 12.78 m · 28 s", shape: "wide" },
  ];
  const host = $("#features");
  const playIcon = '<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l14 8-14 8z"/></svg></span>';
  if (host) for (const x of FEATURES) {
    const fig = document.createElement("figure"); fig.className = "feat";
    fig.innerHTML = `<div class="media ${x.shape ?? ""}"><img src="media/galley/${x.f}.jpg" alt="" loading="lazy"><button type="button" class="play" aria-label="Play: ${x.t}">${playIcon}</button></div>
      <h3>${x.t}</h3><p>${x.d}</p><p class="fact">${x.fact}</p>`;
    fig.querySelector(".play").addEventListener("click", () => {
      const v = document.createElement("video");
      Object.assign(v, { src: `media/galley/${x.f}.mp4`, poster: `media/galley/${x.f}.jpg`, controls: true, muted: true, loop: true, playsInline: true, autoplay: true });
      v.setAttribute("playsinline", "");
      fig.querySelector(".media").replaceChildren(v); v.play().catch(() => {});
    });
    host.appendChild(fig);
  }

  // ── Chart: top-1 hits /29 (SEMANTICS.md §16, L-C / F-C) ─────────────────────
  const bars = $("#bars");
  if (bars) {
    const data = [["Single-scale", "CLIP pyramid", 20, 15], ["Multi-scale", "default (A)", 22, 15], ["SAM regions", "B2", 21, 12], ["ViT-L/14", "C2", 19, 10]];
    const W = 460, H = 270, L = 30, B = 46, T = 14, max = 29, plotH = H - B - T;
    const y = (v) => T + plotH * (1 - v / max);
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" });
    for (const v of [0, 10, 20, 29]) { svg.append(el("line", { class: "ax", x1: L, x2: W, y1: y(v), y2: y(v) }), el("text", { class: "tick", x: L - 6, y: y(v) + 4, "text-anchor": "end" }, v)); }
    const gw = (W - L) / data.length, bw = Math.min(34, gw / 3.2);
    data.forEach(([name, sub, lift, fm], i) => {
      const cx = L + gw * i + gw / 2;
      [[lift, "b-lift", cx - bw - 2], [fm, "b-fmgs", cx + 2]].forEach(([v, c, x]) => {
        svg.append(el("rect", { class: c, x, y: y(v), width: bw, height: y(0) - y(v), rx: 2 }), el("text", { class: "val", x: x + bw / 2, y: y(v) - 5, "text-anchor": "middle" }, v));
      });
      svg.append(el("text", { class: "cat", x: cx, y: H - B + 20, "text-anchor": "middle" }, name), el("text", { class: "sub", x: cx, y: H - B + 36, "text-anchor": "middle" }, sub));
    });
    bars.append(svg);
  }

  // ── Chart: relevancy per stage (SEMANTICS.md §15 diagnostic) ────────────────
  const lines = $("#lines");
  if (lines) {
    const stages = ["2D teacher", "best crop scale", "3D (lifted)"], found = [0.682, 0.748, 0.675], miss = [0.485, 0.577, 0.517];
    const W = 460, H = 270, L = 40, R = 30, T = 18, B = 40, lo = 0.45, hi = 0.8;
    const x = (i) => L + (W - L - R) * i / 2, y = (v) => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" });
    for (const v of [0.5, 0.6, 0.7, 0.8]) svg.append(el("line", { class: "ax", x1: L, x2: W - R, y1: y(v), y2: y(v) }), el("text", { class: "tick", x: L - 6, y: y(v) + 4, "text-anchor": "end" }, v.toFixed(1)));
    svg.append(el("line", { class: "floor", x1: L, x2: W - R, y1: y(0.55), y2: y(0.55) }), el("text", { class: "floor-t", x: W - R, y: y(0.55) - 6, "text-anchor": "end" }, "detection floor 0.55"));
    for (const [d, c, p, name] of [[found, "l-found", "p-found", "found"], [miss, "l-miss", "p-miss", "missed"]]) {
      svg.append(el("polyline", { class: c, points: d.map((v, i) => `${x(i)},${y(v)}`).join(" ") }));
      d.forEach((v, i) => svg.append(el("circle", { class: p, cx: x(i), cy: y(v), r: 4.5 }), el("text", { class: "val", x: x(i), y: y(v) + (name === "found" ? -10 : 18), "text-anchor": "middle" }, v.toFixed(2))));
      svg.append(el("text", { class: "lbl", x: x(2) + 8, y: y(d[2]) + 4 }, name));
    }
    stages.forEach((s, i) => svg.append(el("text", { class: "cat", x: x(i), y: H - 12, "text-anchor": i === 0 ? "start" : i === 2 ? "end" : "middle" }, s)));
    lines.append(svg);
  }

  // ── Chart: prop-guard modes (Fusion modal study, PropGuard v9, 12 Oct 2026) ─
  const modes = $("#modes");
  if (modes) {
    const f = [259.0, 266.6, 285.8, 294.7, 354.6, 444.6, 459.8, 501.4], target = 200;
    const W = 460, H = 210, L = 64, R = 46, T = 6, rowH = (H - T - 22) / f.length, max = 550;
    const x = (v) => L + (W - L - R) * v / max;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" });
    for (const v of [0, 100, 200, 300, 400, 500]) svg.append(el("text", { class: "tick", x: x(v), y: H - 4, "text-anchor": "middle" }, v));
    f.forEach((v, i) => {
      const yy = T + i * rowH;
      svg.append(el("text", { class: "lbl", x: L - 8, y: yy + rowH * 0.68, "text-anchor": "end" }, `mode ${i + 1}`),
        el("rect", { class: i === 0 ? "m-first" : "m-bar", x: x(0), y: yy + 2, width: x(v) - x(0), height: rowH - 5, rx: 2 }),
        el("text", { class: "val", x: x(v) + 5, y: yy + rowH * 0.68 }, `${Math.round(v)}`));
    });
    svg.append(el("line", { class: "target", x1: x(target), x2: x(target), y1: T, y2: H - 20 }), el("text", { class: "floor-t", x: x(target) - 4, y: T + 2 + rowH * 8 - 4, "text-anchor": "end" }, "200 Hz target"));
    svg.append(el("text", { class: "lbl", x: W - 2, y: H - 4, "text-anchor": "end" }, "Hz"));
    modes.append(svg);
  }
})();
