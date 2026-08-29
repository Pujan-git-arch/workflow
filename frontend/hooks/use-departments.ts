"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createDepartment, deleteDepartment, getDepartments, updateDepartment } from "@/services/department.service";
import type { CreateDepartmentPayload, UpdateDepartmentPayload } from "@/types/department";

export function useDepartments() {
  const queryClient = useQueryClient();

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const createDepartmentMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  const updateDepartmentMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateDepartmentPayload }) =>
      updateDepartment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });

  return {
    ...departmentsQuery,
    createDepartment: createDepartmentMutation.mutateAsync,
    updateDepartment: updateDepartmentMutation.mutateAsync,
    deleteDepartment: deleteDepartmentMutation.mutateAsync,
    isCreating: createDepartmentMutation.isPending,
    isUpdating: updateDepartmentMutation.isPending,
    isDeleting: deleteDepartmentMutation.isPending,
  };
}
