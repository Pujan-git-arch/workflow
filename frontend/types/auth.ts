export type AuthUser = {
  id: number;
  name: string;
  email: string;
  department_id: number;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  department_id: number;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};
