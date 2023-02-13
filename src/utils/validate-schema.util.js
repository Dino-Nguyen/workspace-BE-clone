const validateSchema = async (schema, data) => {
  try {
    return await schema.validateAsync(data, {
      abortEarly: false,
    });
  } catch (error) {
    throw new Error(error);
  }
};

export default validateSchema;
