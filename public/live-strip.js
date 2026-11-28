// Brings a product page's journey strip to life. A <picture data-live> holds the still drawing;
// beside each still sits a `-live.svg` with the same stations and no items. This swaps the still
// for that drawing and sends items down it. Without this script the still stays, which is fine.
const HOLD = 3.5; // seconds an item spends entering, stopping in and leaving a gap
const PASS = 1.4; // seconds to cross without stopping
const GAP = 3600; // ms between ideas leaving the hopper
const MAX = 5; // notes the hopper holds
const IDLE = 9000; // ms of nothing before a note drops in by itself

function run(svg) {
  const { legs, slots, from } = JSON.parse(svg.dataset.belt);
  const [wait, belt, seal] = [".wait", ".belt", ".seal"].map((c) => svg.querySelector(c));
  const make = (name, attrs, parent) => {
    const el = document.createElementNS(svg.namespaceURI, name);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return parent.appendChild(el);
  };
  const waiting = Array(MAX).fill(null); // the note in each hopper slot, oldest first by `at`
  let nextRelease = 0;
  let lastActive = -IDLE;

  const add = () => {
    const slot = waiting.indexOf(null);
    if (slot < 0) return;
    const [x, y, r] = slots[slot];
    const g = make("g", { transform: `translate(${x} ${y})` }, wait);
    const fly = make("g", { class: "fly", style: `--fx:${from[0] - x}px;--fy:${from[1] - y}px` }, g);
    make("rect", { class: "a", x: -8, y: -8, width: 16, height: 16, transform: `rotate(${r})` }, fly);
    waiting[slot] = { g, fly, at: performance.now() };
    lastActive = performance.now();
  };

  const release = () => {
    const held = waiting.filter(Boolean);
    if (!held.length) return;
    const note = held.reduce((a, b) => (a.at < b.at ? a : b));
    waiting[waiting.indexOf(note)] = null;
    note.fly.classList.add("sink");
    note.fly.addEventListener("animationend", () => note.g.remove());
    let delay = 0.3;
    for (const leg of legs) {
      const g = make("g", { transform: `translate(${leg.x} ${leg.y})` }, belt);
      const style = `--ax:${leg.a[0]}px;--ay:${leg.a[1]}px;--bx:${leg.b[0]}px;--by:${leg.b[1]}px;--i:${leg.i ?? 1};--o:${leg.o ?? 1};animation-delay:${delay}s`;
      const item = make("g", { class: leg.pass ? "pass" : "go", style }, g);
      // A copy, not a <use>: the drawing's colour classes don't reach inside a <use>.
      for (const part of svg.querySelector(`#form${leg.f}`).children) item.append(part.cloneNode(true));
      item.addEventListener("animationend", () => {
        g.remove();
        if (leg.end) seal.style.opacity = 1;
      });
      delay += leg.pass ? PASS : HOLD;
    }
  };

  svg.querySelector(".hop").addEventListener("click", add);
  const timer = setInterval(() => {
    const now = performance.now();
    if (now >= nextRelease && waiting.some(Boolean)) {
      release();
      nextRelease = now + GAP;
      lastActive = now;
    } else if (now - lastActive > IDLE) add();
  }, 200);
  return () => clearInterval(timer);
}

for (const picture of document.querySelectorAll("picture[data-live]")) {
  const source = picture.querySelector("source");
  const img = picture.querySelector("img");
  const narrow = matchMedia(source.media);
  const host = document.createElement("div");
  host.className = "live-strip";
  let stop = () => {};
  const load = async () => {
    const still = narrow.matches ? source.getAttribute("srcset") : img.getAttribute("src");
    const response = await fetch(still.replace(/\.svg$/, "-live.svg"));
    if (!response.ok) return;
    const text = await response.text();
    stop();
    host.innerHTML = text;
    const svg = host.firstElementChild;
    svg.style.maxWidth = `${svg.viewBox.baseVal.width}px`;
    picture.replaceWith(host);
    stop = run(svg);
  };
  narrow.addEventListener("change", load);
  load().catch(() => {});
}
