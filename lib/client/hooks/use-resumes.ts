'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/firebase-auth-context';

const RESUME_KEYS = {
  all: ['resumes'] as const,
  lists: () => [...RESUME_KEYS.all, 'list'] as const,
  list: (filters: string) => [...RESUME_KEYS.lists(), filters] as const,
  details: () => [...RESUME_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...RESUME_KEYS.details(), id] as const,
};

async function fetchResumes(user: any) {
  if (!user) throw new Error('User not authenticated');
  
  const token = await user.getIdToken();
  const response = await fetch('/api/resumes', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch resumes');
  return response.json();
}

async function fetchResume(id: string, user: any) {
  if (!user) throw new Error('User not authenticated');
  
  const token = await user.getIdToken();
  const response = await fetch(`/api/resumes/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch resume');
  return response.json();
}

export function useResumes() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: RESUME_KEYS.lists(),
    queryFn: () => fetchResumes(user),
    enabled: !!user,
  });
}

export function useResume(id: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: RESUME_KEYS.detail(id),
    queryFn: () => fetchResume(id, user),
    enabled: !!id && !!user,
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create resume');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESUME_KEYS.lists() });
    },
  });
}