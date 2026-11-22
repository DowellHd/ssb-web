/**
 * Thrown by a demo route to simulate an HTTP error (insufficient funds, not
 * found, …). api-client turns it into an axios-style rejection so the UI's
 * normal error handling runs.
 */
export class DemoHttpError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'DemoHttpError';
    this.status = status;
    this.detail = detail;
  }
}
