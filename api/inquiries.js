const { getDb, getSiteDoc } = require("./_lib/firebase-admin");
const { json, methodNotAllowed, badRequest, serverError } = require("./_lib/http");

function normalizeInquiry(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const id = String(source.id || `inq_${Date.now()}_${Math.floor(Math.random() * 100000)}`);
  return {
    id,
    inquiryType: String(source.inquiryType || "").slice(0, 120),
    name: String(source.name || "").slice(0, 80),
    phone: String(source.phone || "").slice(0, 80),
    email: String(source.email || "").slice(0, 120),
    message: String(source.message || "").slice(0, 3000),
    submittedAt: String(source.submittedAt || new Date().toISOString()),
    stage: "new",
    firstTouchedAt: ""
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  const payload = req.body && typeof req.body === "object" ? req.body.payload : null;
  if (!payload || typeof payload !== "object") {
    return badRequest(res, "payload is required");
  }

  const inquiry = normalizeInquiry(payload);
  if (!inquiry.name || !inquiry.phone) {
    return badRequest(res, "name and phone are required");
  }

  try {
    const db = getDb();
    const siteRef = getSiteDoc(db);
    await siteRef.collection("inquiries").doc(inquiry.id).set(inquiry, { merge: true });
    return json(res, 200, { ok: true, inquiry });
  } catch (error) {
    return serverError(res, error);
  }
};
