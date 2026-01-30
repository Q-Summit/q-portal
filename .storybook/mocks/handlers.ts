/**
 * Optional global MSW handlers for tRPC procedures.
 * Stories can override via parameters.msw.handlers.
 */

import { http, HttpResponse } from "msw";

const defaultHello = { greeting: "Hello from global handler!" };

async function handleTRPCRequest(request: Request) {
  const clonedRequest = request.clone();
  const rawBody = await clonedRequest.text();
  let body: {
    id: number;
    json?: {
      method: string;
      params?: { path?: string; input?: unknown };
    };
  };
  try {
    body = JSON.parse(rawBody) as typeof body;
  } catch {
    return HttpResponse.json(
      { id: 0, error: { message: "Invalid JSON", code: -32700 } },
      { status: 400 },
    );
  }

  const procedurePath = body.json?.params?.path;
  if (!procedurePath) {
    return HttpResponse.json({
      id: body.id,
      error: { message: "Invalid request format", code: -32602 },
    });
  }

  if (procedurePath === "example.hello") {
    return HttpResponse.json({
      id: body.id,
      result: { data: defaultHello },
    });
  }

  return HttpResponse.json({
    id: body.id,
    error: {
      message: `No mock handler for procedure: ${procedurePath}`,
      code: -32004,
    },
  });
}

export const handlers = [
  http.post("*/api/trpc", ({ request }) => handleTRPCRequest(request)),
];
