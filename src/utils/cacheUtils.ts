import { QueryClient } from '@tanstack/react-query';

// Global cache invalidation utility with aggressive cache clearing
export const invalidateAllRelatedCaches = async (queryClient: QueryClient, operation: 'student' | 'payment' | 'application' | 'settings' | 'room' | 'all') => {
  const cacheKeys = {
    student: [
      'students',
      'dashboard',
      'recentActivities',
      'floors',
      'rooms',
      'payments',
      'monthlyRevenue',
      'studentProfile'
    ],
    payment: [
      'payments',
      'students',
      'dashboard',
      'monthlyRevenue',
      'recentActivities',
      'studentProfile'
    ],
    application: [
      'applications',
      'students',
      'dashboard',
      'recentActivities',
      'floors',
      'rooms',
      'application'
    ],
    settings: [
      'settings',
      'dashboard',
      'adminProfile',
      'rules',
      'amenities'
    ],
    room: [
      'rooms',
      'floors',
      'students',
      'dashboard',
      'recentActivities',
      'studentProfile'
    ],
    all: [
      'students',
      'payments',
      'applications',
      'dashboard',
      'monthlyRevenue',
      'recentActivities',
      'floors',
      'rooms',
      'settings',
      'adminProfile',
      'rules',
      'amenities',
      'studentProfile',
      'application'
    ]
  };

  const keysToInvalidate = cacheKeys[operation] || [];
  
  // Aggressive cache invalidation with multiple strategies
  await Promise.all([
    // Strategy 1: Invalidate specific queries
    ...keysToInvalidate.map(key => 
      queryClient.invalidateQueries({ queryKey: [key] })
    ),
    // Strategy 2: Remove queries from cache completely
    ...keysToInvalidate.map(key => 
      queryClient.removeQueries({ queryKey: [key] })
    ),
    // Strategy 3: Reset queries to force refetch
    ...keysToInvalidate.map(key => 
      queryClient.resetQueries({ queryKey: [key] })
    )
  ]);

  // Strategy 4: Force immediate refetch for critical queries
  const criticalQueries = ['dashboard', 'students', 'payments'];
  await Promise.all(
    criticalQueries
      .filter(key => keysToInvalidate.includes(key))
      .map(key => 
        queryClient.refetchQueries({ queryKey: [key] })
      )
  );
};

// Specific cache invalidation functions
export const invalidateStudentCaches = (queryClient: QueryClient) => 
  invalidateAllRelatedCaches(queryClient, 'student');

export const invalidatePaymentCaches = (queryClient: QueryClient) => 
  invalidateAllRelatedCaches(queryClient, 'payment');

export const invalidateApplicationCaches = (queryClient: QueryClient) => 
  invalidateAllRelatedCaches(queryClient, 'application');

export const invalidateSettingsCaches = (queryClient: QueryClient) => 
  invalidateAllRelatedCaches(queryClient, 'settings');

export const invalidateRoomCaches = (queryClient: QueryClient) => 
  invalidateAllRelatedCaches(queryClient, 'room');

export const invalidateAllCaches = (queryClient: QueryClient) => 
  invalidateAllRelatedCaches(queryClient, 'all');

// Emergency cache clear - clears all caches
export const clearAllCaches = async (queryClient: QueryClient) => {
  await queryClient.clear();
  // Force reload of critical data
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ['dashboard'] }),
    queryClient.prefetchQuery({ queryKey: ['students'] }),
    queryClient.prefetchQuery({ queryKey: ['payments'] })
  ]);
};

// Optimistic update helper
export const optimisticUpdate = async <T>(
  queryClient: QueryClient,
  queryKey: string[],
  updater: (oldData: T) => T,
  operation: () => Promise<void>
) => {
  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey });

  // Snapshot previous value
  const previousData = queryClient.getQueryData<T>(queryKey);

  // Optimistically update
  if (previousData) {
    queryClient.setQueryData(queryKey, updater(previousData));
  }

  try {
    // Perform the operation
    await operation();
    
    // Invalidate and refetch
    await queryClient.invalidateQueries({ queryKey });
  } catch (error) {
    // Rollback on error
    if (previousData) {
      queryClient.setQueryData(queryKey, previousData);
    }
    throw error;
  }
};