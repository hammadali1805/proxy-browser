import express from "express";
import { createServer } from "http";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { server as wisp } from "@mercuryworkshop/wisp-js/server";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 8080;

// --------------- PASSWORD PROTECTION ---------------

const PASSWORD = process.env.PROXY_PASSWORD || "";

if (PASSWORD) {
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    if (req.path === "/auth") return next();

    const cookies = req.headers.cookie || "";
    if (cookies.includes("proxy_auth=granted")) return next();

    if (req.method === "POST" && req.path === "/verify") {
      if (req.body && req.body.password === PASSWORD) {
        res.setHeader(
          "Set-Cookie",
          "proxy_auth=granted; Path=/; HttpOnly; Max-Age=86400"
        );
        return res.redirect("/");
      }
      return res.redirect("/auth?error=1");
    }

    res.send(`
      <html><body style="background:#0a0a0f;color:#fff;display:flex;
      justify-content:center;align-items:center;height:100vh;font-family:sans-serif">
      <form method="POST" action="/verify" style="text-align:center">
        <h2>Enter Password</h2><br>
        <input type="password" name="password" style="padding:10px;font-size:16px;
        border-radius:8px;border:1px solid #333;background:#1a1a2e;color:#fff"><br><br>
        <button style="padding:10px 24px;background:#6366f1;color:#fff;border:none;
        border-radius:8px;cursor:pointer;font-size:15px">Enter</button>
      </form></body></html>
    `);
  });
}

// --------------- STATIC FILES ---------------

app.use(express.static(join(__dirname, "../public")));

app.use(
  "/uv/",
  express.static(
    join(__dirname, "../node_modules/@titaniumnetwork-dev/ultraviolet/dist/")
  )
);

app.use(
  "/baremux/",
  express.static(
    join(__dirname, "../node_modules/@mercuryworkshop/bare-mux/dist/")
  )
);

app.use(
  "/epoxy/",
  express.static(
    join(__dirname, "../node_modules/@mercuryworkshop/epoxy-transport/dist/")
  )
);

app.use((req, res) => {
  res.sendFile(join(__dirname, "../public/index.html"));
});

// --------------- HTTP + WEBSOCKET SERVER ---------------

const server = createServer(app);

server.on("upgrade", (req, socket, head) => {
  if (req.url.endsWith("/wisp/")) {
    wisp.routeRequest(req, socket, head);
  } else {
    socket.end();
  }
});

server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
