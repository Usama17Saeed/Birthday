/* ===================== EDIT THIS PART ===================== */
const birthdayConfig = {
    name: "Imran Ali Babar",
    age: null,
    image: "Mamo.jpg",
    greeting: "Happy Birthday!",
    message: "May your day be filled with happiness, love, and beautiful memories.",
    specialMessage: "You deserve all the happiness in the world. Keep smiling and shining!",
    showAge: false,
    music: "assets/birthday-music.mp3", // local audio file used for the birthday theme
    gallery: [],                                  // e.g. ["assets/photo1.jpg", "assets/photo2.jpg"]
    wishes: [                                     // [emoji, title, text]
        ["😊", "Happiness", "May every day bring you a reason to smile."],
        ["🏆", "Success", "May all your goals turn into achievements."],
        ["💪", "Good Health", "Wishing you strength and wellbeing all year long."],
        ["❤️", "Love", "May you always be surrounded by people who adore you."],
        ["📸", "Memories", "Here's to moments you'll treasure forever."]
    ]
};
/* ========================================================== */

const $ = id => document.getElementById(id);
const cfg = birthdayConfig;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = () => innerWidth < 600;
const COLORS = ["#ff4fa3", "#8a5cff", "#f5d27a", "#ffffff", "#d62bd0", "#5ee7ff"];
const rand = (a, b) => Math.random() * (b - a) + a;

/* ---------- Canvas: stars, hearts, confetti ---------- */
const cv = $("fx"), ctx = cv.getContext("2d");
let W = 0, H = 0, stars = [], confetti = [], px = 0, py = 0, raf = 0;

function resize() {
    const d = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * d; cv.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    stars = reduce ? [] : Array.from({ length: small() ? 35 : 70 }, () => ({
        x: rand(0, W), y: rand(0, H), r: rand(1, 2.6), v: rand(.1, .5), z: rand(.2, 1),
        t: rand(0, 6.28), heart: Math.random() < .18, c: COLORS[Math.floor(rand(0, COLORS.length))]
    }));
}

function burst(count, x = W / 2, y = H / 2) {
    if (reduce) return;
    for (let i = 0; i < count; i++) {
        const a = rand(0, 6.28), s = rand(4, 13);
        confetti.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5, w: rand(6, 11), h: rand(4, 7),
            rot: rand(0, 6.28), vr: rand(-.3, .3), c: COLORS[Math.floor(rand(0, COLORS.length))], life: rand(110, 190) });
    }
    if (confetti.length > 700) confetti.splice(0, confetti.length - 700);
}

function frame() {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
        s.y -= s.v; s.t += .03;
        if (s.y < -10) { s.y = H + 10; s.x = rand(0, W); }
        ctx.globalAlpha = .35 + .45 * Math.abs(Math.sin(s.t));
        ctx.fillStyle = s.c;
        const x = s.x + px * s.z * 30, y = s.y + py * s.z * 30;
        if (s.heart) { ctx.font = (s.r * 7) + "px serif"; ctx.fillText("♥", x, y); }
        else { ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.28); ctx.fill(); }
    }
    for (let i = confetti.length - 1; i >= 0; i--) {
        const p = confetti[i];
        p.vy += .22; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
        if (p.life <= 0 || p.y > H + 20) { confetti.splice(i, 1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.min(1, p.life / 40); ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
}
function startLoop() { if (!raf && !reduce) raf = requestAnimationFrame(frame); }
function stopLoop() { cancelAnimationFrame(raf); raf = 0; }

addEventListener("resize", resize);
document.addEventListener("visibilitychange", () => document.hidden ? stopLoop() : startLoop());
addEventListener("pointermove", e => { px = e.clientX / W - .5; py = e.clientY / H - .5; }, { passive: true });

/* ---------- Helpers ---------- */
let toastTimer;
function toast(msg) {
    const t = $("toast"); t.textContent = msg; t.classList.add("on");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("on"), 3200);
}
let typeTimer;
function typeText(el, text) {
    clearInterval(typeTimer);
    if (reduce) { el.textContent = text; el.classList.remove("typing"); return; }
    el.textContent = ""; el.classList.add("typing");
    let i = 0;
    typeTimer = setInterval(() => {
        el.textContent = text.slice(0, ++i);
        if (i >= text.length) { clearInterval(typeTimer); el.classList.remove("typing"); }
    }, 45);
}

/* ---------- Personalisation ---------- */
function personalise() {
    document.title = `Happy Birthday, ${cfg.name}! 🎂`;
    const title = $("title");
    [..."HAPPY BIRTHDAY!"].forEach((ch, i) => {
        const s = document.createElement("span");
        s.style.setProperty("--i", i);
        s.textContent = ch === " " ? "\u00A0" : ch;
        s.setAttribute("aria-hidden", "true");
        title.appendChild(s);
    });
    $("greeting").textContent = `${cfg.greeting.replace(/[!.\s]+$/, "")}, ${cfg.name}! 🎂`;
    $("message").textContent = cfg.message;
    if (cfg.showAge && cfg.age) { $("age").textContent = `Celebrating ${cfg.age} wonderful years 🎈`; $("age").hidden = false; }

    const img = $("photo"), fb = $("photoFallback");
    img.onerror = () => { img.hidden = true; fb.hidden = false; fb.textContent = (cfg.name.trim()[0] || "🎂").toUpperCase(); };
    img.src = cfg.image;

    const wishes = $("wishes");
    cfg.wishes.forEach(([emoji, head, text], i) => {
        const d = document.createElement("div");
        d.className = "wish reveal"; d.style.setProperty("--rd", i * .12 + "s");
        d.innerHTML = "<b></b><h3></h3><p></p>";
        d.children[0].textContent = emoji; d.children[1].textContent = head; d.children[2].textContent = text;
        wishes.appendChild(d);
    });

    const grid = $("galleryGrid");
    (cfg.gallery || []).forEach(src => {
        const fig = document.createElement("figure"), im = new Image();
        im.alt = "Memory"; im.loading = "lazy";
        im.onload = () => { fig.appendChild(im); grid.appendChild(fig); $("gallery").hidden = false; observe($("gallery")); };
        im.onerror = () => {};              // missing images are silently skipped
        im.src = src;
    });
}

/* ---------- Scroll reveal ---------- */
const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .15 }) : null;
function observe(el) { io ? io.observe(el) : el.classList.add("in"); }
function observeAll() { document.querySelectorAll(".reveal").forEach(observe); }

/* ---------- Balloons ---------- */
function makeBalloons() {
    const box = $("balloons");
    for (let i = 0; i < (small() ? 5 : 9); i++) {
        const b = document.createElement("div"), c = COLORS[i % COLORS.length];
        b.className = "balloon";
        b.style.cssText = `left:${rand(2, 94)}%;background:radial-gradient(circle at 30% 30%,#fff8,${c});--dur:${rand(14, 28)}s;--delay:-${rand(0, 20)}s`;
        box.appendChild(b);
    }
}

/* ---------- Interactions ---------- */
function openSurprise() {
    $("openBtn").disabled = true;
    $("welcome").classList.add("leave");
    burst(160);
    setTimeout(() => {
        $("welcome").hidden = true;
        $("main").hidden = false;
        $("musicBtn").hidden = false;
        document.body.classList.add("show");
        makeBalloons(); observeAll();
        burst(120, W * .2, H * .6); burst(120, W * .8, H * .6);
    }, reduce ? 0 : 650);
}

function openLetter() {
    $("modal").hidden = false;
    $("closeBtn").focus();
    typeText($("letterText"), cfg.specialMessage);
    burst(40, W / 2, H / 2);
}
function closeLetter() { clearInterval(typeTimer); $("modal").hidden = true; $("letterBtn").focus(); }

let wishing = false;
function toggleWish() {
    const cake = $("cake"), btn = $("wishBtn");
    wishing = !wishing;
    cake.classList.toggle("out", wishing);
    btn.textContent = wishing ? "Light the Candles Again 🕯️" : "Make a Wish ✨";
    if (wishing) {
        const r = cake.getBoundingClientRect();
        burst(70, r.left + r.width / 2, r.top + r.height * .25);
        toast("Your wish is on its way ✨");
    }
}

let partyTimer;
function celebrate() {
    burst(220, W / 2, H * .7); setTimeout(() => burst(160, W * .15, H * .5), 300); setTimeout(() => burst(160, W * .85, H * .5), 600);
    document.body.classList.add("party");
    const b = $("banner");
    b.textContent = `Hip hip hooray, ${cfg.name}! 🎉🥳`; b.hidden = false;
    b.style.animation = "none"; void b.offsetWidth; b.style.animation = "";
    clearTimeout(partyTimer);
    partyTimer = setTimeout(() => { document.body.classList.remove("party"); b.hidden = true; }, 4500);
}

let audio = null;
function musicUI() {
    const on = audio && !audio.paused;
    $("musicBtn").textContent = on ? "⏸" : "🎵";
    $("musicBtn").setAttribute("aria-pressed", String(!!on));
}
async function toggleMusic() {
    try {
        if (!audio) { audio = new Audio(cfg.music); audio.loop = true; }
        if (audio.paused) await audio.play(); else audio.pause();
    } catch (e) { audio = null; toast(`Add a file at ${cfg.music} to enable music 🎵`); }
    musicUI();
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
    personalise(); resize(); startLoop();
    $("openBtn").addEventListener("click", openSurprise);
    $("letterBtn").addEventListener("click", openLetter);
    $("closeBtn").addEventListener("click", closeLetter);
    $("modal").addEventListener("click", e => { if (e.target === $("modal")) closeLetter(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("modal").hidden) closeLetter(); });
    $("wishBtn").addEventListener("click", toggleWish);
    $("celebrateBtn").addEventListener("click", celebrate);
    $("musicBtn").addEventListener("click", toggleMusic);
});
