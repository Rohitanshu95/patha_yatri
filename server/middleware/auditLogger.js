import AuditLog from "../models/AuditLog.js";

export const logAction = (action, entity) => async (req, res, next) => {
  // Capture original send/json to log after successful response
  const originalJson = res.json;
  
  res.json = function (data) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Async log, don't wait
      const entityId = data._id || data.id || req.params.id || null;
      AuditLog.create({
        action,
        entity,
        entityId,
        performedBy: req.user?.id,
        details: { body: req.body, query: req.query },
      }).catch(console.error);
    }
    return originalJson.call(this, data);
  };
  
  next();
};