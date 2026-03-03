const { getDb, getSiteDoc } = require("../_lib/firebase-admin");
const { isAdminAuthorized } = require("../_lib/auth");
const { json, methodNotAllowed, unauthorized, badRequest, serverError } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  if (!isAdminAuthorized(req)) {
    return unauthorized(res);
  }

  const value = req.body && typeof req.body === "object" ? req.body.value : null;
  if (!value || typeof value !== "object") {
    return badRequest(res, "value object is required");
  }

  try {
    const db = getDb();
    const siteRef = getSiteDoc(db);
    await siteRef.collection("data").doc("siteSettings").set(
      {
        value,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );

    return json(res, 200, { ok: true });
  } catch (error) {
    return serverError(res, error);
  }
};
