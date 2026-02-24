/**
 * Optional global MSW handlers for tRPC procedures.
 *
 * This file provides example handlers that can be imported and used in
 * preview.tsx if you want global defaults. Currently not imported because
 * individual stories should explicitly define their handlers for clarity.
 *
 * To use: Import and add to preview.tsx:
 *   import { handlers } from "./mocks/handlers";
 *   // Then in parameters.msw: handlers: handlers
 */

import { http, HttpResponse } from "msw";

const defaultProfile = {
  id: "user-123",
  userId: "user-123",
  firstName: "Example",
  lastName: "User",
  email: "example@test.com",
  status: "confirmed",
};

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

  if (procedurePath === "profile.getMy") {
    return HttpResponse.json({
      id: body.id,
      result: { data: defaultProfile },
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

export const handlers = [http.post("*/api/trpc", ({ request }) => handleTRPCRequest(request))];
