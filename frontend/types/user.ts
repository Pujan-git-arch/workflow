export type UserItem = {
  id: number;
  name: string;
  email: string;
  department_id: number;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  department_id: number;
};

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, "password">>;

export type UserFormValues = {
  name: string;
  email: string;
  password?: string;
  department_id: number;
};
