(() => {
  "use strict";

  const INCLUDE_SELECTOR = "[data-include]";
  const RUNTIME_SCRIPTS = [
    "assets/scripts/cloud-api.js",
    "assets/scripts/main.js"
  ];

  async function fetchFragment(path) {
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Template load failed: ${path} (${response.status})`);
    }
    return response.text();
  }

  async function hydrateIncludes() {
    const targets = Array.from(document.querySelectorAll(INCLUDE_SELECTOR));
    for (const target of targets) {
      const path = String(target.getAttribute("data-include") || "").trim();
      if (!path) continue;
      const html = await fetchFragment(path);
      target.innerHTML = html;
      target.removeAttribute("data-include");
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Script load failed: ${src}`));
      document.head.appendChild(script);
    });
  }

  async function loadRuntimeScripts() {
    for (const src of RUNTIME_SCRIPTS) {
      await loadScript(src);
    }
  }

  function renderBootstrapError(error) {
    console.error("[bootstrap]", error);
    const panel = document.createElement("div");
    panel.style.position = "fixed";
    panel.style.left = "16px";
    panel.style.bottom = "16px";
    panel.style.padding = "10px 12px";
    panel.style.fontSize = "12px";
    panel.style.lineHeight = "1.4";
    panel.style.border = "1px solid #111";
    panel.style.background = "#fff";
    panel.style.color = "#111";
    panel.style.zIndex = "9999";
    panel.textContent = "초기화 중 오류가 발생했습니다. 콘솔 로그를 확인하세요.";
    document.body.appendChild(panel);
  }

  async function bootstrap() {
    try {
      await hydrateIncludes();
      await loadRuntimeScripts();
    } catch (error) {
      renderBootstrapError(error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      void bootstrap();
    });
  } else {
    void bootstrap();
  }
})();
