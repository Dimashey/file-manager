import { createFileRoute, redirect } from '@tanstack/react-router';
import { authStore } from '@/features/auth';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    if (!authStore.isAuthenticated()) throw redirect({ to: '/login' });
  },
  component: () => <div>Loading dashboard…</div>,
});
