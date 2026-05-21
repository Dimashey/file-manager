import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { filesApi } from '../../files/api/files.api';
import { foldersApi } from '../../folders/api/folders.api';

const useDebounce = <T>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export const useSearch = (query: string) => {
  const debouncedQuery = useDebounce(query.trim(), 300);
  const enabled = debouncedQuery.length > 0;

  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ['search', 'files', debouncedQuery],
    queryFn: () => filesApi.search(debouncedQuery),
    enabled,
  });

  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ['search', 'folders', debouncedQuery],
    queryFn: () => foldersApi.search(debouncedQuery),
    enabled,
  });

  return {
    files,
    folders,
    isLoading: filesLoading || foldersLoading,
    hasQuery: enabled,
  };
}
