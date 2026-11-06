/**
 * Worker entry point. Thin router only:
 * - CORS preflight + origin gate for /api/*
 * - route matching, delegating to handler modules
 * - no SQL, no PayOS calls, no validation inline
 */
import { cancelPaymentLink } from './payos.js';
import { resolvePayosReturnUrls } from './callback-urls.js';
import {
  applyCors,
  corsHeaders,
  error,
  resolveCors,
} from './http.js';
import { adminMe } from './auth.js';
import {
  handleCreateDonation,
  handleGetPublicSettings,
  handleGetStatus,
  handleListPublic,
} from './routes-donations.js';
import { handleWebhook } from './routes-webhook.js';
import {
  handleAdminChangePassword,
  handleAdminHide,
  handleAdminList,
  handleAdminLogin,
  handleAdminLogout,
  handleAdminRecoverPassword,
  handleAdminShow,
  handleBusinessCreate,
  handleBusinessDelete,
  handleBusinessList,
  handleBusinessUpdate,
  handleGetAdminSettings,
  handleUpdateAdminSettings,
  withAdmin,
} from './routes-admin.js';
import {
  handleAdminMoved,
  handleCancelRedirect,
  handleReturnRedirect,
} from './routes-pages.js';

const SHOW_RE = /^\/api\/admin\/donations\/\d+\/(show|publish)$/;
const HIDE_RE = /^\/api\/admin\/donations\/\d+\/hide$/;
const BUSINESS_ID_RE = /^\/api\/admin\/business-deals\/[0-9a-f]+$/;

function orderCodeFromAdminPath(pathname) {
  return pathname.split('/')[4];
}

async function route(request, env, url, ctx) {
  const { pathname } = url;
  const method = request.method.toUpperCase();

  if (method === 'POST' && pathname === '/api/donations') {
    return handleCreateDonation(request, env);
  }
  if (method === 'GET' && pathname === '/api/donations') {
    return handleListPublic(env, ctx, url);
  }
  if (method === 'GET' && pathname === '/api/settings') {
    return handleGetPublicSettings(env);
  }
  if (method === 'GET' && pathname.startsWith('/api/donations/')) {
    return handleGetStatus(env, pathname.slice('/api/donations/'.length));
  }
  if (method === 'POST' && pathname === '/api/webhooks/payos') {
    return handleWebhook(request, env, url);
  }
  if (method === 'POST' && pathname === '/api/admin/login') {
    return handleAdminLogin(request, env);
  }
  if (method === 'GET' && pathname === '/api/admin/me') {
    return adminMe(request, env);
  }
  if (method === 'POST' && pathname === '/api/admin/logout') {
    return withAdmin(request, env, (session) => handleAdminLogout(request, env, session));
  }
  if (method === 'POST' && pathname === '/api/admin/change-password') {
    return withAdmin(request, env, (session) => handleAdminChangePassword(request, env, session));
  }
  if (method === 'POST' && pathname === '/api/admin/recover-password') {
    return handleAdminRecoverPassword(request, env);
  }
  if (method === 'GET' && pathname === '/api/admin/settings') {
    return withAdmin(request, env, () => handleGetAdminSettings(env));
  }
  if (method === 'POST' && pathname === '/api/admin/settings') {
    return withAdmin(request, env, () => handleUpdateAdminSettings(request, env, url));
  }
  if (method === 'GET' && pathname === '/api/admin/donations') {
    return withAdmin(request, env, () => handleAdminList(env, url));
  }
  if (method === 'POST' && SHOW_RE.test(pathname)) {
    // /publish kept as an alias for older admin clients.
    return withAdmin(request, env, () => handleAdminShow(env, orderCodeFromAdminPath(pathname), url));
  }
  if (method === 'POST' && HIDE_RE.test(pathname)) {
    return withAdmin(request, env, () => handleAdminHide(env, orderCodeFromAdminPath(pathname), url));
  }
  if (method === 'GET' && pathname === '/api/admin/business-deals') {
    return withAdmin(request, env, () => handleBusinessList(env));
  }
  if (method === 'POST' && pathname === '/api/admin/business-deals') {
    return withAdmin(request, env, (session) => handleBusinessCreate(request, env, session, url));
  }
  // Deal ids are randomHex(16): 32 hex characters.
  if (BUSINESS_ID_RE.test(pathname)) {
    const id = pathname.split('/')[4];
    if (method === 'PATCH') {
      return withAdmin(request, env, (session) => handleBusinessUpdate(request, env, session, id, url));
    }
    if (method === 'DELETE') {
      return withAdmin(request, env, () => handleBusinessDelete(env, id, url));
    }
  }
  if (method === 'GET' && pathname === '/return') {
    return handleReturnRedirect(url);
  }
  if (method === 'GET' && pathname === '/cancel') {
    return handleCancelRedirect(url);
  }
  if (method === 'GET' && pathname === '/admin') {
    return handleAdminMoved();
  }
  return error('Không tìm thấy.', 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method.toUpperCase();
    const isApi = pathname.startsWith('/api/');
    const { origin, corsOrigin, sameHost } = resolveCors(request, env, url);

    // The frontend /admin page calls this Worker from the GitHub Pages
    // origin (or localhost during dev), same as the public donate page.
    if (isApi && method === 'OPTIONS') {
      if (corsOrigin) {
        return new Response(null, { status: 204, headers: corsHeaders(corsOrigin) });
      }
      if (sameHost) return new Response(null, { status: 204 });
      return new Response(null, { status: 403 });
    }

    if (isApi && origin && !corsOrigin && !sameHost) {
      return error('Nguồn không được phép.', 403);
    }

    let response;
    try {
      response = await route(request, env, url, ctx);
    } catch (err) {
      console.error(String(err?.message || err));
      response = error('Lỗi máy chủ.', 500);
    }

    if (isApi && corsOrigin) {
      return applyCors(response, corsOrigin);
    }
    return response;
  },
};

// Re-exported for deploy checks and unit tests.
export { cancelPaymentLink, resolvePayosReturnUrls };
