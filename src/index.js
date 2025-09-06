import { Router } from "itty-router";
import {
  showHomePage,
  showSubmitForm,
  handleThemeSubmission,
  showThemeDetails,
  downloadThemeJSON,
} from "./handlers/public.js";

import {
  showAdminLoginPage,
  handleAdminLogin,
  showAdminDashboard,
  showPendingThemes,
  showApprovedThemes,
  approveTheme,
  rejectTheme,
  deleteTheme,
  handleAdminLogout,
} from "./handlers/admin.js";

import { requireAuth, isAdminAuthenticated } from "./handlers/auth.js";
import { showBuildingPage } from "./handlers/build.js";

const router = Router();

// Public routes
router.get("/", (request, env) => showHomePage(request, env));
router.get("/submit", (request, env) => showSubmitForm(request, env));
router.post("/submit", handleThemeSubmission);
router.get("/theme/:id", (request, env) => showThemeDetails(request, env));
router.get("/theme/:id.json", (request, env) =>
  downloadThemeJSON(request, env),
);
router.get("/download/:id", (request, env) => downloadThemeJSON(request, env));
router.get("/build", (request, env) => showBuildingPage(request, env));

// Admin authentication routes
router.get("/admin/login", showAdminLoginPage);
router.post("/admin/login", handleAdminLogin);
router.post("/admin/logout", handleAdminLogout);

// Protected admin routes
router.get("/admin/dashboard", requireAuth, showAdminDashboard);
router.get("/admin/pending", requireAuth, showPendingThemes);
router.get("/admin/approved", requireAuth, showApprovedThemes);
router.post("/admin/approve/:id", requireAuth, approveTheme);
router.post("/admin/reject/:id", requireAuth, rejectTheme);
router.post("/admin/delete/:id", requireAuth, deleteTheme);

// 404 handler
router.all("*", () => new Response("Not Found", { status: 404 }));

export default {
  async fetch(request, env, ctx) {
    request.env = env;

    return router.handle(request, env, ctx).catch((err) => {
      console.error("Application Error:", err);
      return new Response("Internal Server Error", { status: 500 });
    });
  },
};
