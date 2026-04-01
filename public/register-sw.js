window.addEventListener("load", async () => {
  try {
    const reg = await navigator.serviceWorker.register("/sw.js", {
      scope: "/service/",
    });

    // Wait for the SW to become active
    if (!reg.active) {
      await new Promise((resolve) => {
        const sw = reg.installing || reg.waiting;
        if (!sw) return resolve();
        sw.addEventListener("statechange", function listener() {
          if (sw.state === "activated") {
            sw.removeEventListener("statechange", listener);
            resolve();
          }
        });
      });
    }

    // Set up the transport layer
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
  } catch (err) {
    console.error("Failed to initialize proxy:", err);
  }
});
