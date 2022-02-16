class FieldError {
  /**
   * The field that has been violated
   */
  field: string;

  /**
   * The input that caused the error
   */
  input: unknown;

  /**
   * A message describing why the input is invalid for the field
   */
  message: string;

  constructor(field: string, input: unknown, message: string) {
    this.field = field;
    this.input = input;
    this.message = message;
  }
}

export default FieldError;
