const { getDb, getSiteDoc } = require("../_lib/firebase-admin");
const { isAdminAuthorized } = require("../_lib/auth");
const { json, methodNotAllowed, unauthorized, badRequest, serverError } = require("../_lib/http");

function normalizeInquiry(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const id = String(source.id || "").trim();
  if (!id) return null;

  return {
    id,
    inquiryType: String(source.inquiryType || "").slice(0, 120),
    name: String(source.name || "").slice(0, 80),
    phone: String(source.phone || "").slice(0, 80),
    email: String(source.email || "").slice(0, 120),
    message: String(source.message || "").slice(0, 3000),
    submittedAt: String(source.submittedAt || new Date().toISOString()),
    stage: String(source.stage || "new").toLowerCase(),
    firstTouchedAt: String(source.firstTouchedAt || "")
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    if (!isAdminAuthorized(req)) {
      return unauthorized(res);
    }

    try {
      const db = getDb();
      const siteRef = getSiteDoc(db);
      const snapshot = await siteRef.collection("inquiries").orderBy("submittedAt", "desc").get();
      const items = snapshot.docs.map((doc) => doc.data());
      return json(res, 200, { ok: true, items });
    } catch (error) {
      return serverError(res, error);
    }
  }

  if (req.method === "POST") {
    if (!isAdminAuthorized(req)) {
      return unauthorized(res);
    }

    const bodyItems = req.body && typeof req.body === "object" ? req.body.items : null;
    if (!Array.isArray(bodyItems)) {
      return badRequest(res, "items array is required");
    }

    const normalizedItems = bodyItems.map((item) => normalizeInquiry(item)).filter(Boolean);
    if (normalizedItems.length !== bodyItems.length) {
      return badRequest(res, "all items must include id");
    }

    if (normalizedItems.length > 400) {
      return badRequest(res, "too many items");
    }

    try {
      const db = getDb();
      const siteRef = getSiteDoc(db);
      const colRef = siteRef.collection("inquiries");
      const currentSnap = await colRef.get();
      const nextIds = new Set(normalizedItems.map((item) => item.id));

      const batch = db.batch();
      currentSnap.docs.forEach((doc) => {
        if (!nextIds.has(doc.id)) {
          batch.delete(doc.ref);
        }
      });
      normalizedItems.forEach((item) => {
        batch.set(colRef.doc(item.id), item, { merge: true });
      });

      await batch.commit();
      return json(res, 200, { ok: true, count: normalizedItems.length });
    } catch (error) {
      return serverError(res, error);
    }
  }

  return methodNotAllowed(res, ["GET", "POST"]);
};
