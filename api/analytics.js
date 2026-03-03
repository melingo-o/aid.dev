const { getDb, getSiteDoc } = require("./_lib/firebase-admin");
const { json, methodNotAllowed, badRequest, serverError } = require("./_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  const event = req.body && typeof req.body === "object" ? req.body.event : null;
  if (!event || typeof event !== "object") {
    return badRequest(res, "event is required");
  }

  const record = {
    type: String(event.type || "unknown").slice(0, 80),
    route: String(event.route || "projects").slice(0, 40),
    source: String(event.source || "direct").slice(0, 120),
    at: String(event.at || new Date().toISOString()),
    payload: event,
    createdAt: new Date().toISOString()
  };

  try {
    const db = getDb();
    const siteRef = getSiteDoc(db);
    await siteRef.collection("analytics_events").add(record);
    return json(res, 200, { ok: true });
  } catch (error) {
    return serverError(res, error);
  }
};
