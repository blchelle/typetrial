export type FieldError = {
    field: string;
    input: string;
    message: string;
  }

export type ApiError = {
    message: string;
    fieldErrors: FieldError[];
  };
