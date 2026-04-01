window.addEventListener("load", async () => {
  try {
    // Set up the transport BEFORE registering the SW,
    // so the SharedWorker is ready when the SW activates
    const { BareMuxConnection } = await import("/baremux/index.mjs");
    const conn = new BareMuxConnection("/baremux/worker.js");

    const wispUrl =
      (location.protocol === "https:" ? "wss://" : "ws://") +
      location.host +
      "/wisp/";

    await conn.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);

    // Now register the SW — the SharedWorker port is already available
    const reg = await navigator.serviceWorker.register("/sw.js", {
      scope: "/service/",
    });

    // Wait for the SW to become active
    if (!reg.active) {
      await new Promise((resolve) => {
        const sw = reg.installing || reg.waiting;
        if (!sw) return resolve();
        if (sw.state === "activated") return resolve();
        sw.addEventListener("statechange", function listener() {
          if (sw.state === "activated") {
            sw.removeEventListener("statechange", listener);
            resolve();
          }
        });
      });
    }

    // Signal to the page that everything is ready
    window.__proxyReady = true;
    window.dispatchEvent(new Event("proxyready"));
    console.log("Proxy service worker registered and transport ready");
  } catch (err) {
    console.error("Failed to initialize proxy:", err);
  }
});
