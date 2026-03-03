(() => {
  "use strict";

  const appConfig = window.__AID_APP_CONFIG__ && typeof window.__AID_APP_CONFIG__ === "object" ? window.__AID_APP_CONFIG__ : {};
  const cloudConfig = appConfig.cloud && typeof appConfig.cloud === "object" ? appConfig.cloud : {};
  const enabled = Boolean(cloudConfig.enabled);
  const baseUrl = String(cloudConfig.baseUrl || "/api").replace(/\/$/, "");
  const timeoutMs = Number(cloudConfig.timeoutMs || 10000);

  let adminPassword = "";

  async function request(path, options = {}) {
    if (!enabled) return null;

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (options.requireAdmin && adminPassword) {
      headers["x-admin-password"] = adminPassword;
    }

    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
        credentials: "same-origin"
      });

      if (!res.ok) {
        return null;
      }

      const contentType = String(res.headers.get("content-type") || "").toLowerCase();
      if (!contentType.includes("application/json")) {
        return null;
      }

      return await res.json();
    } catch (_err) {
      return null;
    } finally {
      window.clearTimeout(timer);
    }
  }

  const store = {
    isEnabled() {
      return enabled;
    },

    setAdminPassword(value) {
      adminPassword = String(value || "").trim();
    },

    clearAdminPassword() {
      adminPassword = "";
    },

    async verifyAdmin(password) {
      const pass = String(password || "").trim();
      if (!pass) return false;
      const result = await request("/admin/login", {
        method: "POST",
        body: { password: pass }
      });
      if (!result || result.ok !== true) return false;
      adminPassword = pass;
      return true;
    },

    async getBootstrap() {
      const result = await request("/bootstrap", { method: "GET" });
      if (!result || typeof result !== "object") return null;
      return {
        listings: Array.isArray(result.listings) ? result.listings : null,
        siteSettings: result.siteSettings && typeof result.siteSettings === "object" ? result.siteSettings : null
      };
    },

    async createInquiry(payload) {
      const result = await request("/inquiries", {
        method: "POST",
        body: { payload }
      });
      return result && result.inquiry ? result.inquiry : null;
    },

    async getInquiries() {
      const result = await request("/admin/inquiries", {
        method: "GET",
        requireAdmin: true
      });
      if (!result || !Array.isArray(result.items)) return null;
      return result.items;
    },

    async setInquiries(items) {
      const result = await request("/admin/inquiries", {
        method: "POST",
        requireAdmin: true,
        body: { items }
      });
      return Boolean(result && result.ok);
    },

    async setListings(items) {
      const result = await request("/admin/listings", {
        method: "POST",
        requireAdmin: true,
        body: { items }
      });
      return Boolean(result && result.ok);
    },

    async setSiteSettings(value) {
      const result = await request("/admin/settings", {
        method: "POST",
        requireAdmin: true,
        body: { value }
      });
      return Boolean(result && result.ok);
    },

    async pushEvent(event) {
      await request("/analytics", {
        method: "POST",
        body: { event }
      });
      return true;
    }
  };

  window.aidCloudStore = store;
})();
