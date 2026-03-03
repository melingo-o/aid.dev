const { getDb, getSiteDoc } = require("./_lib/firebase-admin");
const { json, methodNotAllowed, serverError } = require("./_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  try {
    const db = getDb();
    const siteRef = getSiteDoc(db);

    const [listingDoc, settingsDoc] = await Promise.all([
      siteRef.collection("data").doc("listings").get(),
      siteRef.collection("data").doc("siteSettings").get()
    ]);

    const listingData = listingDoc.exists ? listingDoc.data() || {} : {};
    const settingsData = settingsDoc.exists ? settingsDoc.data() || {} : {};

    return json(res, 200, {
      ok: true,
      listings: Array.isArray(listingData.items) ? listingData.items : [],
      siteSettings: settingsData.value && typeof settingsData.value === "object" ? settingsData.value : null
    });
  } catch (error) {
    return serverError(res, error);
  }
};
