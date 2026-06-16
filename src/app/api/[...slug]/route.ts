import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';
import { Readable } from 'node:stream';

const BACKEND_URL = process.env.BACKEND_URL || 'https://localhost:7183';
const isDev = process.env.NODE_ENV === 'development';

// Only skip TLS verification in development for self-signed certs
const agent = isDev && BACKEND_URL.startsWith('https')
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined;

// Allowlist of permitted backend path prefixes
const ALLOWED_PATHS = [
  'auth/login',
  'auth/register',
  'auth/register/verify-email',
  'auth/session/refresh',
  'auth/session/logout',
  'auth/session/current-user',
  'auth/oauth/providers',
  'auth/oauth/google',
  'auth/oauth/github',
  'auth/password/forgot',
  'auth/password/verify-otp',
  'auth/password/reset',
];

function isAllowedPath(path: string): boolean {
  return ALLOWED_PATHS.some(allowed => path === allowed || path.startsWith(allowed + '/'));
}

function proxyRequest(request: Request, slug: string[]): Promise<Response> {
  const path = slug.join('/');

  if (!isAllowedPath(path)) {
    return Promise.resolve(
      new Response(
        JSON.stringify({ responseCode: 403, isSuccess: false, responseMsg: 'Forbidden' }),
        { status: 403, headers: { 'content-type': 'application/json' } },
      ),
    );
  }

  const target = new URL(`${BACKEND_URL}/api/${path}`);

  const isHttps = target.protocol === 'https:';
  const transport = isHttps ? https : http;

  return new Promise((resolve) => {
    const headers: Record<string, string> = {};
    const contentType = request.headers.get('content-type');
    if (contentType) headers['content-type'] = contentType;

    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['cookie'] = cookieHeader;
    }

    const req = transport.request(
      {
        hostname: target.hostname,
        port: target.port,
        path: target.pathname + target.search,
        method: request.method,
        headers,
        agent,
      },
      (res) => {
        const responseHeaders = new Headers();
        if (res.headers) {
          for (const [key, value] of Object.entries(res.headers)) {
            if (!value) continue;
            // Set-Cookie headers must remain separate — comma-joining breaks deletion
            if (Array.isArray(value)) {
              for (const v of value) {
                responseHeaders.append(key, v);
              }
            } else {
              responseHeaders.set(key, value);
            }
          }
        }

        const webStream = Readable.toWeb(res) as unknown as ReadableStream;
        resolve(new Response(webStream, {
          status: res.statusCode ?? 500,
          statusText: res.statusMessage ?? 'Error',
          headers: responseHeaders,
        }));
      },
    );

    req.on('error', (err) => {
      console.error(`[API Proxy] Failed to reach backend: ${target.href}`, err);
      resolve(
        new Response(
          JSON.stringify({ responseCode: 502, isSuccess: false, responseMsg: 'Backend unreachable' }),
          { status: 502, headers: { 'content-type': 'application/json' } },
        ),
      );
    });

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      request.text().then((body) => {
        req.end(body);
      }).catch(() => req.end());
    } else {
      req.end();
    }
  });
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return proxyRequest(request, slug);
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return proxyRequest(request, slug);
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return proxyRequest(request, slug);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return proxyRequest(request, slug);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return proxyRequest(request, slug);
}
