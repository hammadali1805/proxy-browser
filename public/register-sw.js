window.addEventListener("load", async () => {
  const reg = await navigator.serviceWorker.register("/sw.js", {
    scope: "/service/",
  });

  await navigator.serviceWorker.ready;

  const { BareMuxConnection } = await import("/baremux/index.js");
  const conn = new BareMuxConnection("/baremux/worker.js");

  const wispUrl =
    (location.protocol === "https:" ? "wss://" : "ws://") +
    location.host +
    "/wisp/";

  await conn.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);

  console.log("Proxy service worker registered and transport ready");
});
