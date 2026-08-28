/**
 * Domain-specific error for anything auth-related (bad credentials,
 * expired tokens, deactivated accounts, etc).
 *
 * Services throw `AuthError`; the centralized Express error handler
 * (see `auth/middleware/error-handler.middleware.ts`) is the only
 * place that turns it into an HTTP response, so status codes and
 * response formatting never have to be duplicated in route handlers.
 */
export class AuthError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.statusCode = statusCode;

    // Keep `instanceof AuthError` working when compiled down by older targets.
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}
