export type DepartmentItem = {
  id: number;
  name: string;
};

export type CreateDepartmentPayload = {
  name: string;
};

export type UpdateDepartmentPayload = Partial<CreateDepartmentPayload>;

export type DepartmentFormValues = {
  name: string;
};
