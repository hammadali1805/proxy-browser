/*global Ultraviolet*/

// XOR codec matching Ultraviolet's implementation exactly.
// Needed as a fallback for the main page context where the UV bundle isn't loaded.
const xorEncode = typeof Ultraviolet !== "undefined"
  ? Ultraviolet.codec.xor.encode
  : function (e) {
      if (!e) return e;
      let t = "";
      for (let r = 0; r < e.length; r++)
        t += r % 2 ? String.fromCharCode(e.charCodeAt(r) ^ 2) : e[r];
      return encodeURIComponent(t);
    };

const xorDecode = typeof Ultraviolet !== "undefined"
  ? Ultraviolet.codec.xor.decode
  : function (e) {
      if (!e) return e;
      let [t, ...r] = e.split("?"),
        n = "",
        u = decodeURIComponent(t);
      for (let a = 0; a < u.length; a++)
        n += a % 2 ? String.fromCharCode(u.charCodeAt(a) ^ 2) : u[a];
      return n + (r.length ? "?" + r.join("?") : "");
    };

self.__uv$config = {
  prefix: "/service/",
  encodeUrl: xorEncode,
  decodeUrl: xorDecode,
  handler: "/uv/uv.handler.js",
  client: "/uv/uv.client.js",
  bundle: "/uv/uv.bundle.js",
  config: "/uv.config.js",
  sw: "/uv/uv.sw.js",
};
