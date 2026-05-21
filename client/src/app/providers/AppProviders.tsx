import { type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import { ThemeModeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { AppNotifier } from '../../shared/components/layout/AppNotifier';

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <AppNotifier />
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeModeProvider>
    </QueryClientProvider>
  );
}
