


(() => {
  const root = document.getElementById("sakura");
  const btn  = document.getElementById("sakuraToggle");
  const icon = document.getElementById("sakuraIcon");
  if (!root || !btn || !icon) return;

  // ===== 設定 =====
  const STORAGE_KEY = "sakuraEnabled";
  const COUNT = 20;                 // 常時維持する花びら数
  const RESPAWN_INTERVAL_MS = 800;  // OFF→ONの復帰を自然にする用（軽い）
  const images = [
    "images/petal1.png",
    "images/petal2.png",
    "images/petal3.png",
    "images/petal4.png",
  ];

  const rand = (min, max) => Math.random() * (max - min) + min;

  // localStorageから復元（無ければtrue）
  let sakuraOn = (localStorage.getItem(STORAGE_KEY) ?? "true") === "true";
  let keepAliveTimer = null;

  // ===== UI反映 =====
  function applyUI() {
    btn.setAttribute("aria-pressed", String(sakuraOn));
    icon.src = sakuraOn ? "images/sakura-on.png" : "images/sakura-off.png";
  }

  // ===== 花びら生成（1枚） =====
  function spawnOne() {
    const p = document.createElement("span");
    p.className = "sakura-petal";

    const size = rand(20, 70);
    const startX = rand(0, 100);
    const img = images[Math.floor(Math.random() * images.length)];

    p.style.left = `${startX}vw`;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.opacity = String(rand(0.6, 1));

    p.style.backgroundImage = `url(${img})`;

    // 横流れと回転量（CSS変数で渡す）
    p.style.setProperty("--dx", `${rand(-30, 30)}vw`);
    p.style.setProperty("--rot", `${rand(-720, 720)}deg`);

    // 落下時間と開始遅延
    const dur = rand(7, 16);
    const delay = rand(0, 6);
    p.style.animationDuration = `${dur}s`;
    p.style.animationDelay = `${delay}s`;

    // 落ち切ったら：ONなら再生成、OFFなら消して終わり（←これが「パッと消えない」）
    p.addEventListener("animationend", () => {
      p.remove();

      if (!sakuraOn) return;

      // ONのときだけ補充
      if (root.childElementCount < COUNT) spawnOne();
    });

    root.appendChild(p);
  }

  // ===== ONのときだけ「枚数を維持」する軽いループ =====
  function startKeepAlive() {
    stopKeepAlive();
    keepAliveTimer = window.setInterval(() => {
      if (!sakuraOn) return;
      // 足りない分だけ補充
      while (root.childElementCount < COUNT) spawnOne();
    }, RESPAWN_INTERVAL_MS);
  }

  function stopKeepAlive() {
    if (keepAliveTimer) {
      clearInterval(keepAliveTimer);
      keepAliveTimer = null;
    }
  }

  // ===== ON/OFF切替 =====
  function setSakuraEnabled(next) {
    sakuraOn = next;
    localStorage.setItem(STORAGE_KEY, String(sakuraOn));
    applyUI();

    if (sakuraOn) {
      // ONになったら補充＆維持開始
      while (root.childElementCount < COUNT) spawnOne();
      startKeepAlive();
    } else {
      // OFF：今落ちてる分は落ち切る。追加生成はしない。
      stopKeepAlive();
    }
  }

  // ===== ボタン =====
  btn.addEventListener("click", () => {
    setSakuraEnabled(!sakuraOn);
  });

  // ===== 初期化 =====
  applyUI();
  if (sakuraOn) {
    for (let i = 0; i < COUNT; i++) spawnOne();
    startKeepAlive();
  }
})();

