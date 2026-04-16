export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    const issues = error?.issues || error?.errors || [];
    return res.status(400).json({
      message: issues[0]?.message || "Validation failed",
      errors: issues,
    });
  }
};