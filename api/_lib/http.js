function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(JSON.stringify(payload));
}

function methodNotAllowed(res, allowed) {
  res.setHeader("Allow", allowed.join(", "));
  return json(res, 405, { ok: false, error: "Method Not Allowed" });
}

function unauthorized(res) {
  return json(res, 401, { ok: false, error: "Unauthorized" });
}

function badRequest(res, message) {
  return json(res, 400, { ok: false, error: message || "Bad Request" });
}

function serverError(res, error) {
  return json(res, 500, { ok: false, error: "Server Error", detail: String(error && error.message ? error.message : error || "unknown") });
}

module.exports = {
  json,
  methodNotAllowed,
  unauthorized,
  badRequest,
  serverError
};
