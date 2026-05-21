type Handler = (message: string) => void;

let _error: Handler | null = null;
let _success: Handler | null = null;

export const notify = {
  register(error: Handler, success: Handler) {
    _error = error;
    _success = success;
  },
  error(message: string) {
    _error?.(message);
  },
  success(message: string) {
    _success?.(message);
  },
};
