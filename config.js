// Single source of truth for the donations Worker origin.
// Change POET_API_BASE here only; ung-ho/donate.js, ung-ho/result.js,
// ung-ho/checkout.js (also the v2 bridge) and admin/admin.js read it.
// This file must load before those scripts (defer scripts run in
// document order; site.js imports it before ung-ho/checkout.js).
window.POET_API_BASE = 'https://poet-donations.poetnpo.workers.dev';
