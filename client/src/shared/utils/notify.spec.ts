import { describe, it, expect, vi } from 'vitest';
import { notify } from './notify';

describe('notify utility', () => {
  it('should not throw when calling success or error without registered handlers', () => {
    expect(() => notify.success('Hello')).not.toThrow();
    expect(() => notify.error('Oops')).not.toThrow();
  });

  it('should trigger registered handlers with correct arguments', () => {
    const errorMock = vi.fn();
    const successMock = vi.fn();

    notify.register(errorMock, successMock);

    notify.success('Successful operation!');
    expect(successMock).toHaveBeenCalledTimes(1);
    expect(successMock).toHaveBeenCalledWith('Successful operation!');
    expect(errorMock).not.toHaveBeenCalled();

    notify.error('Something went wrong!');
    expect(errorMock).toHaveBeenCalledTimes(1);
    expect(errorMock).toHaveBeenCalledWith('Something went wrong!');
    expect(successMock).toHaveBeenCalledTimes(1); // Still 1
  });
});
