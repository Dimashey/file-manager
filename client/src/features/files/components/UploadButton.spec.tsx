import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UploadButton } from './UploadButton';
import { useUploadFile } from '../hooks/useFiles';

vi.mock('../hooks/useFiles', () => ({
  useUploadFile: vi.fn(),
}));

describe('UploadButton', () => {
  const mockUploadFile = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useUploadFile).mockReturnValue({
      mutateAsync: mockUploadFile,
    } as any);
  });

  it('should render upload button and hide file input', () => {
    const { container } = render(<UploadButton folderId="folder-123" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();

    // The file input should be present in the document but invisible
    const fileInput = container.querySelector('input[type="file"]')!;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).not.toBeVisible();
  });

  it('should trigger input click when FAB is clicked', () => {
    const { container } = render(<UploadButton folderId="folder-123" />);

    const fileInput = container.querySelector('input[type="file"]')!;
    const clickSpy = vi.spyOn(fileInput as HTMLInputElement, 'click');

    fireEvent.click(screen.getByRole('button'));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('should upload selected files and show progress circle during upload', async () => {
    let resolveUpload: any;
    const uploadPromise = new Promise((resolve) => {
      resolveUpload = resolve;
    });
    mockUploadFile.mockImplementation(() => uploadPromise);

    const { container } = render(<UploadButton folderId="folder-123" />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['content'], 'vacation.jpg', { type: 'image/jpeg' });
    
    // Simulate selecting a file
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Should immediately trigger upload mutation and disable the button
    expect(mockUploadFile).toHaveBeenCalledTimes(1);
    expect(mockUploadFile).toHaveBeenCalledWith({ file, folderId: 'folder-123' });

    // Spinner should show up
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();

    // Resolve upload mutation
    resolveUpload({ id: 'f-1', name: 'vacation.jpg' });

    // Progress bar should be removed and button re-enabled after resolving
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button')).toBeEnabled();
  });
});
