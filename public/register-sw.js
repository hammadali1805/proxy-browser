window.addEventListener("load", async () => {
  const reg = await navigator.serviceWorker.register("/sw.js", {
    scope: "/service/",
  });

  // If there's a waiting SW (e.g. update), activate it immediately
  if (reg.waiting) {
    reg.waiting.postMessage({ type: "SKIP_WAITING" });
  }

  // Listen for new SW becoming waiting
  reg.addEventListener("updatefound", () => {
    const newWorker = reg.installing;
    if (newWorker) {
      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          newWorker.postMessage({ type: "SKIP_WAITING" });
        }
      });
    }
  });

  // Wait for the SW to actually control this page
  if (!navigator.serviceWorker.controller) {
    await new Promise((resolve) => {
      navigator.serviceWorker.addEventListener("controllerchange", resolve, {
        once: true,
      });
    });
  }

  const { BareMuxConnection } = await import("/baremux/index.js");
  const conn = new BareMuxConnection("/baremux/worker.js");

  const wispUrl =
    (location.protocol === "https:" ? "wss://" : "ws://") +
    location.host +
    "/wisp/";

  await conn.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);

  // Signal to the page that everything is ready
  window.__proxyReady = true;
  window.dispatchEvent(new Event("proxyready"));
  console.log("Proxy service worker registered and transport ready");
});
