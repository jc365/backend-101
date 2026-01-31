import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

export default (req, res, next) => {
  const tz = req.tenant?.timezone || "Europe/Madrid"; // De DB
  req.toUtc = (localStr) => {
    const localDate = new Date(localStr);
    return zonedTimeToUtc(localDate, tz);
  };
  req.fromUtc = (utcIso) => utcToZonedTime(new Date(utcIso), tz);
  req.tenantTz = tz;
  next();
};

// app.use('/:tenantId/*', loadTenant, timezoneMiddleware) 
// punto 2. deberia ir en el routes del tenant