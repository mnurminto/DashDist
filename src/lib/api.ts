import "server-only";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import type { Permissions } from "@/lib/permissions";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

// Shared HTTP concerns only. Domain rules and Drizzle queries live in services.
export async function withApiSession(
  request: Request,
  handler: (session: Session) => Promise<Response>,
) {
  let response: Response;
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true },
    });
    if (!session)
      throw new ApiError(401, "UNAUTHORIZED", "Sign in to continue.");

    // Better Auth protects its own endpoints. Custom cookie-authenticated mutations need this check too.
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      if (
        request.headers.get("origin") !== new URL(env.BETTER_AUTH_URL).origin ||
        request.headers.get("sec-fetch-site") === "cross-site"
      )
        throw new ApiError(
          403,
          "FORBIDDEN_ORIGIN",
          "Send this request from the app's configured origin.",
        );
    }
    response = await handler(session);
  } catch (error) {
    if (error instanceof ApiError) {
      response = Response.json(
        {
          error: {
            code: error.code,
            message: error.message,
            // Petunjuk singkat supaya UI bisa menampilkan langkah berikutnya,
            // bukan sekadar "ditolak".
            ...(error.status === 401
              ? { hint: "Masuk dengan akun yang punya akses, lalu coba lagi." }
              : {}),
            ...(error.status === 403
              ? {
                  hint: "Peran akun ini tidak mencakup data tersebut. Hubungi admin bila perlu.",
                }
              : {}),
          },
        },
        { status: error.status },
      );
    } else if (error instanceof ZodError) {
      response = Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Check the supplied fields.",
            details: error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
        },
        { status: 422 },
      );
    } else {
      // Do not return database errors, connection strings, or private values to clients.
      console.error(
        "Unexpected API failure:",
        error instanceof Error ? error.name : "UnknownError",
      );
      response = Response.json(
        {
          error: {
            code: "INTERNAL_ERROR",
            message: "Something went wrong. Try again.",
          },
        },
        { status: 500 },
      );
    }
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

// Same contract as withApiSession, plus a role check before the handler runs.
// Endpoints that reach across accounts must use this, not a UI-only check.
export function withApiPermission(
  request: Request,
  permissions: Permissions,
  handler: (session: Session) => Promise<Response>,
) {
  return withApiSession(request, async (session) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: session.user.id, permissions },
    });
    if (!success)
      throw new ApiError(
        403,
        "FORBIDDEN",
        "Your account cannot perform this action.",
      );
    return handler(session);
  });
}

/**
 * Untuk endpoint baca yang memang publik (mis. dashboard terbuka).
 * Tidak memakai sesi, jadi jangan pakai untuk data milik pengguna.
 */
export async function withPublicApi(
  handler: () => Promise<Response>,
  opsi: { cache?: string } = {},
): Promise<Response> {
  try {
    const response = await handler();
    response.headers.set(
      "Cache-Control",
      opsi.cache ?? "public, s-maxage=60, stale-while-revalidate=300",
    );
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status, headers: { "Cache-Control": "no-store" } },
      );
    }
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Check the supplied fields.",
            details: error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
        },
        { status: 422, headers: { "Cache-Control": "no-store" } },
      );
    }
    console.error(
      "Unexpected public API failure:",
      error instanceof Error ? error.name : "UnknownError",
    );
    return Response.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Something went wrong. Try again.",
        },
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function readJson(request: Request): Promise<unknown> {
  const contentType = request.headers
    .get("content-type")
    ?.split(";")[0]
    .trim()
    .toLowerCase();
  if (contentType !== "application/json")
    throw new ApiError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Send an application/json body.",
    );
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "INVALID_JSON", "Send valid JSON.");
  }
}
