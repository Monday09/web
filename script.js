const controls = {
  text: document.getElementById("textInput"),
  font: document.getElementById("fontSelect"),
  size: document.getElementById("fontSize"),
  sizeValue: document.getElementById("fontSizeValue"),
  color: document.getElementById("fontColor"),
  bg: document.getElementById("bgColor"),
  posX: document.getElementById("posX"),
  posY: document.getElementById("posY"),
  layout: document.getElementById("layoutSelect"),
  shareCode: document.getElementById("shareCode"),
  status: document.getElementById("status"),
  lockFont: document.getElementById("lockFont"),
  lockSize: document.getElementById("lockSize"),
  lockColor: document.getElementById("lockColor"),
  lockBg: document.getElementById("lockBg"),
  lockPos: document.getElementById("lockPos") || document.getElementById("lockPosition")
};

const wallpaper = document.getElementById("wallpaper");
const wallpaperText = document.getElementById("wallpaperText");

const fonts = Array.from(controls.font.options).map((option) => option.value);
const layouts = ["center", "leftTop", "rightBottom", "vertical", "repeat"];
const palettes = [
  ["#181818", "#f7f0df"],
  ["#f5efe1", "#203335"],
  ["#284b63", "#f5d547"],
  ["#101820", "#f2aa4c"],
  ["#d8e2dc", "#2b2d42"],
  ["#3a2e39", "#f4d35e"],
  ["#0b132b", "#6fffe9"],
  ["#fff7ed", "#ba3b46"]
];

const layoutSettings = {
  center: { x: 50, y: 50, align: "center", writingMode: "horizontal-tb", rotate: 0 },
  leftTop: { x: 12, y: 18, align: "left", writingMode: "horizontal-tb", rotate: 0 },
  rightBottom: { x: 88, y: 82, align: "right", writingMode: "horizontal-tb", rotate: 0 },
  vertical: { x: 50, y: 50, align: "center", writingMode: "horizontal-tb", rotate: 90 },
  repeat: { x: 50, y: 50, align: "center", writingMode: "horizontal-tb", rotate: -12 }
};

function setStatus(message) {
  if (controls.status) {
    controls.status.textContent = message;
  }
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isLocked(lockControl) {
  return lockControl && lockControl.checked;
}

function applyLayoutPosition(layoutName) {
  const preset = layoutSettings[layoutName] || layoutSettings.center;
  controls.posX.value = preset.x;
  controls.posY.value = preset.y;
}

function render() {
  const layoutName = controls.layout.value;
  const preset = layoutSettings[layoutName] || layoutSettings.center;
  const text = controls.text.value || " ";

  controls.sizeValue.textContent = `${controls.size.value}px`;
  wallpaper.style.backgroundColor = controls.bg.value;
  wallpaperText.style.left = `${controls.posX.value}%`;
  wallpaperText.style.top = `${controls.posY.value}%`;
  wallpaperText.style.color = controls.color.value;
  wallpaperText.style.fontFamily = controls.font.value;
  wallpaperText.style.fontSize = `${controls.size.value}px`;
  wallpaperText.style.textAlign = preset.align;
  wallpaperText.style.writingMode = preset.writingMode;
  wallpaperText.style.transform = `translate(-50%, -50%) rotate(${preset.rotate}deg)`;
  wallpaper.classList.toggle("repeat", layoutName === "repeat");

  if (layoutName === "repeat") {
    wallpaperText.textContent = Array(12).fill(text).join("   ");
  } else {
    wallpaperText.textContent = text;
  }
}

function createState() {
  return {
    text: controls.text.value,
    font: controls.font.value,
    size: Number(controls.size.value),
    color: controls.color.value,
    bg: controls.bg.value,
    x: Number(controls.posX.value),
    y: Number(controls.posY.value),
    layout: controls.layout.value
  };
}

function loadState(state) {
  controls.text.value = state.text || "MAKE YOUR WALLPAPER";
  controls.font.value = state.font || fonts[0];
  controls.size.value = state.size || 120;
  controls.color.value = state.color || "#f7f0df";
  controls.bg.value = state.bg || "#181818";
  controls.posX.value = state.x ?? 50;
  controls.posY.value = state.y ?? 50;
  controls.layout.value = state.layout || "center";
  render();
}

function encodeState(state) {
  const json = JSON.stringify(state);
  return btoa(unescape(encodeURIComponent(json)));
}

function decodeState(code) {
  const json = decodeURIComponent(escape(atob(code.trim())));
  return JSON.parse(json);
}

function randomizeUnlocked() {
  const palette = randomItem(palettes);

  if (!isLocked(controls.lockFont)) {
    controls.font.value = randomItem(fonts);
  }

  if (!isLocked(controls.lockSize)) {
    controls.size.value = randomInt(30, 210);
  }

  if (!isLocked(controls.lockColor)) {
    controls.color.value = palette[1];
  }

  if (!isLocked(controls.lockBg)) {
    controls.bg.value = palette[0];
  }

  if (!isLocked(controls.lockPos)) {
    controls.layout.value = randomItem(layouts);
    applyLayoutPosition(controls.layout.value);
  }

  render();
  setStatus("잠금한 요소를 제외하고 랜덤으로 변경했습니다.");
}

function copyCode() {
  const code = encodeState(createState());
  controls.shareCode.value = code;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(code);
  }

  setStatus("코드를 복사했습니다.");
}

function applyCode() {
  try {
    const state = decodeState(controls.shareCode.value);
    loadState(state);
    setStatus("코드를 적용했습니다.");
  } catch (error) {
    setStatus("코드 형식이 올바르지 않습니다.");
    alert("코드 형식이 올바르지 않습니다.");
  }
}

function drawMultilineText(ctx, text, x, y, size, align) {
  const lines = text.split("\n");
  const lineHeight = size * 1.1;
  const startY = y - ((lines.length - 1) * lineHeight) / 2;

  ctx.textAlign = align;
  lines.forEach((line, index) => {
    ctx.fillText(line || " ", x, startY + index * lineHeight);
  });
}

function downloadPng() {
  const state = createState();
  const preset = layoutSettings[state.layout] || layoutSettings.center;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const x = canvas.width = 1920;
  const y = canvas.height = 1080;
  const centerX = x * (state.x / 100);
  const centerY = y * (state.y / 100);

  ctx.fillStyle = state.bg;
  ctx.fillRect(0, 0, x, y);
  ctx.fillStyle = state.color;
  ctx.font = `800 ${state.size}px ${state.font}`;
  ctx.textBaseline = "middle";

  ctx.save();
  ctx.translate(centerX, centerY);

  if (state.layout === "vertical") {
    ctx.rotate(Math.PI / 2);
    drawMultilineText(ctx, state.text, 0, 0, state.size, "center");
  } else if (state.layout === "repeat") {
    ctx.rotate(preset.rotate * Math.PI / 180);
    ctx.textAlign = "center";

    const repeatedText = Array(8).fill(state.text || "TEXT").join("   ");
    const lineHeight = state.size * 1.15;
    for (let row = -7; row <= 7; row += 1) {
      ctx.fillText(repeatedText, 0, row * lineHeight);
    }
  } else {
    drawMultilineText(ctx, state.text, 0, 0, state.size, preset.align);
  }

  ctx.restore();

  const link = document.createElement("a");
  link.download = "wallpaper.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
  setStatus("PNG 파일로 저장했습니다.");
}

function addEvent(id, eventName, handler) {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener(eventName, handler);
  }
}

[
  controls.text,
  controls.font,
  controls.size,
  controls.color,
  controls.bg,
  controls.posX,
  controls.posY
].forEach((control) => {
  control.addEventListener("input", render);
});

controls.layout.addEventListener("input", () => {
  if (!isLocked(controls.lockPos)) {
    applyLayoutPosition(controls.layout.value);
  }
  render();
});

addEvent("randomUnlocked", "click", randomizeUnlocked);
addEvent("copyCode", "click", copyCode);
addEvent("applyCode", "click", applyCode);
addEvent("download", "click", downloadPng);
addEvent("downloadPng", "click", downloadPng);

render();
