function getAdminPassword() {
  const fromEnv = process.env.ADMIN_PASSWORD;
  if (fromEnv && String(fromEnv).trim()) {
    return String(fromEnv).trim();
  }
  return "aidadmin";
}

function isAdminAuthorized(req) {
  const header = req.headers["x-admin-password"];
  const candidate = Array.isArray(header) ? header[0] : header;
  return String(candidate || "").trim() === getAdminPassword();
}

module.exports = {
  getAdminPassword,
  isAdminAuthorized
};
