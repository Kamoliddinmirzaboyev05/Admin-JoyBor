import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, patch } from '../../data/api';
import { toast } from 'sonner';

// --- Students Hooks ---

export const useStudents = (params?: any) => {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => api.getStudents(params),
  });
};

export const useStudent = (id: number | string) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => api.getStudent(id),
    enabled: !!id,
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => api.updateStudent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
      toast.success('Talaba ma\'lumotlari yangilandi');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Xatolik yuz berdi');
    },
  });
};

// --- Applications Hooks ---

export const useApplications = (params?: any) => {
  return useQuery({
    queryKey: ['applications', params],
    queryFn: () => api.getApplications(params),
  });
};

export const useApplication = (id: number | string) => {
  return useQuery({
    queryKey: ['application', id],
    queryFn: () => api.getApplication(id),
    enabled: !!id,
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => api.updateApplication(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application', variables.id] });
    },
  });
};

// --- Payments Hooks ---

export const usePayments = (params?: any) => {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => api.getPayments(params),
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('To\'lov muvaffaqiyatli qo\'shildi');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'To\'lov qo\'shishda xatolik');
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: any }) => patch(`/payments/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('To\'lov ma\'malumotlari yangilandi');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'To\'lovni yangilashda xatolik');
    },
  });
};

// --- Rooms & Floors Hooks ---

export const useFloors = () => {
  return useQuery({
    queryKey: ['floors'],
    queryFn: () => api.getFloors(),
  });
};

export const useRooms = (floorId?: number | string) => {
  return useQuery({
    queryKey: ['rooms', floorId],
    queryFn: () => api.getRooms(floorId),
  });
};
