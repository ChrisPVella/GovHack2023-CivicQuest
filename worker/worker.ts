import { setOpenAiKey } from '../server/chat';
import router from '../server/routes';

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    setOpenAiKey(env.OPENAI_KEY);

    try {
      return handleFetchEvent(request, env);
    } catch (e) {
      console.log(e);
      return new Response("Internal Error", { status: 500 });
    }
  },
};

async function handleFetchEvent(
  request: Request,
  env: unknown
): Promise<Response> {
  if (!isAssetUrl(request.url)) {
    const response = await router.handle(request)
    if (response !== null) return response;
  }

  return env.ASSETS.fetch(request);
  // Optional security headers, comment out if not needed.
  // Modifying original response directly errors out in production: https://github.com/cloudflare/miniflare/issues/243
  // Workaround: Create a new Response object with the headers you want to add and the original's body.
  // const upstreamResponse: Response = await env.ASSETS.fetch(request);
  // const response: Response = new Response(upstreamResponse.body, {
  //   status: upstreamResponse.status,
  //   statusText: upstreamResponse.statusText,
  //   headers: upstreamResponse.headers,
  // });
  // response.headers.set("X-XSS-Protection", "1; mode=block");
  // response.headers.set("X-Content-Type-Options", "nosniff");
  // response.headers.set("X-Frame-Options", "DENY");
  // response.headers.set("Referrer-Policy", "unsafe-url");
  // response.headers.set("Feature-Policy", "none");
  // return response;
}
function isAssetUrl(url: string) {
  const { pathname } = new URL(url);
  return pathname.startsWith("/assets/");
}

import { renderPage } from "vite-plugin-ssr/server";

async function handleSsr(urlOriginal: string) {
  const pageContext = await renderPage({ urlOriginal });
  const { httpResponse } = pageContext;
  if (!httpResponse) {
    return null;
  } else {
    const { readable, writable } = new TransformStream();
    httpResponse.pipe(writable);
    return new Response(readable);
  }
}
