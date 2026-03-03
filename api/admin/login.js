const { getAdminPassword } = require("../_lib/auth");
const { json, methodNotAllowed, badRequest } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  const password = req.body && typeof req.body === "object" ? String(req.body.password || "").trim() : "";
  if (!password) {
    return badRequest(res, "password is required");
  }

  if (password !== getAdminPassword()) {
    return json(res, 401, { ok: false, error: "Unauthorized" });
  }

  return json(res, 200, { ok: true });
};
