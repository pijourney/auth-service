import Validator from "fastest-validator";
const validator = new Validator();

// Define a function to validate a request against a schema
export const validateRequest = async (request: any, schema: any) => {
  const result = await validator.validate(request, schema);

  if (result !== true) {
    const errors = result.map((error: any) => {
      return {
        field: error.field,
        message: error.message,
      };
    });

    throw new Error(JSON.stringify(errors));
  }
};
