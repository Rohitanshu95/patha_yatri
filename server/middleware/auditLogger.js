import AuditLog from "../models/AuditLog.js";

const SENSITIVE_KEYS = [
  "password",
  "token",
  "jwt",
  "secret",
  "otp",
  "pin",
  "card",
  "cvv",
  "authorization",
  "refresh",
  "access",
];

const shouldMaskKey = (key) => {
  const lower = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) => lower.includes(sensitive));
};

const sanitize = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }
  if (value && typeof value === "object") {
    const result = {};
    Object.entries(value).forEach(([key, val]) => {
      if (shouldMaskKey(key)) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = sanitize(val);
      }
    });
    return result;
  }
  return value;
};

const getEntityId = (data, req) => {
  if (!data || typeof data !== "object") {
    return req.params.id || req.params.bookingId || req.params.billId || null;
  }

  const direct = data._id || data.id;
  if (direct) return direct;

  const candidates = [
    data.user,
    data.booking,
    data.bill,
    data.payment,
    data.room,
    data.guest,
    data.service,
  ];

  for (const item of candidates) {
    if (item && (item._id || item.id)) {
      return item._id || item.id;
    }
  }

  return req.params.id || req.params.bookingId || req.params.billId || null;
};

const getActionFromMethod = (method) => {
  switch (method?.toUpperCase()) {
    case "POST":
      return "CREATE";
    case "PUT":
    case "PATCH":
      return "UPDATE";
    case "DELETE":
      return "DELETE";
    default:
      return "WRITE";
  }
};

export const auditWrite = (entity) => (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (!req.user?.id) {
        return originalJson.call(this, data);
      }
      const entityId = getEntityId(data, req);
      const details = {
        method: req.method,
        path: req.originalUrl,
        params: sanitize(req.params),
        query: sanitize(req.query),
        body: sanitize(req.body),
      };

      AuditLog.create({
        action: getActionFromMethod(req.method),
        entity,
        entityId,
        performedBy: req.user?.id,
        details,
      }).catch(console.error);
    }
    return originalJson.call(this, data);
  };

  next();
};