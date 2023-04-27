export function createHttpError(status: number, message: string) {
  class HttpError extends Error {
    status: number;

    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  }

  return new HttpError(status, message);
}
