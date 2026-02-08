/**
 * Timezone Utilities
 * Functions to handle timezone conversions between UTC and local timezones
 * Critical for multi-establishment reservations across different timezones
 * Dependencias estrictas:  npm list date-fns date-fns-tz
      backend-101@1.0.0
      ├─┬ date-fns-tz@2.0.1
      │ └── date-fns@2.30.0 deduped
      └── date-fns@2.30.0
 */

import { utcToZonedTime, zonedTimeToUtc, format, toDate } from 'date-fns-tz';
import { parseISO, isValid } from 'date-fns';

/**
 * Convert UTC date to a specific timezone
 * @param {Date|string} utcDate - UTC date (Date object or ISO string)
 * @param {string} timezone - IANA timezone (e.g., 'America/New_York')
 * @returns {Date} Date object in the target timezone
 */
export function utcToTimezone(utcDate, timezone) {
  try {
    const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
    
    if (!isValid(date)) {
      throw new Error('Invalid date provided');
    }
    
    return utcToZonedTime(date, timezone);
  } catch (error) {
    console.error('Error converting UTC to timezone:', error);
    throw new Error(`Failed to convert UTC to ${timezone}: ${error.message}`);
  }
}

/**
 * Convert local timezone date to UTC
 * @param {Date|string} localDate - Date in local timezone
 * @param {string} timezone - IANA timezone of the local date
 * @returns {Date} UTC Date object
 */
export function timezoneToUtc(localDate, timezone) {
  try {
    const date = typeof localDate === 'string' ? parseISO(localDate) : localDate;
    
    if (!isValid(date)) {
      throw new Error('Invalid date provided');
    }
    
    return zonedTimeToUtc(date, timezone);
  } catch (error) {
    console.error('Error converting timezone to UTC:', error);
    throw new Error(`Failed to convert ${timezone} to UTC: ${error.message}`);
  }
}

/**
 * Format a date in a specific timezone
 * @param {Date|string} date - Date to format
 * @param {string} timezone - IANA timezone
 * @param {string} formatString - Format pattern (date-fns format)
 * @returns {string} Formatted date string
 */
export function formatInTimezone(date, timezone, formatString = 'yyyy-MM-dd HH:mm:ss') {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      throw new Error('Invalid date provided');
    }
    
    return format(dateObj, formatString, { timeZone: timezone });
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    throw new Error(`Failed to format date in ${timezone}: ${error.message}`);
  }
}

/**
 * Get current time in a specific timezone
 * @param {string} timezone - IANA timezone
 * @returns {Date} Current time in the specified timezone
 */
export function nowInTimezone(timezone) {
  return utcToTimezone(new Date(), timezone);
}

/**
 * Convert time string (HH:MM) from one timezone to another
 * Assumes the same date in both timezones
 * @param {string} timeString - Time in HH:MM format
 * @param {Date} date - The date context
 * @param {string} fromTimezone - Source timezone
 * @param {string} toTimezone - Target timezone
 * @returns {string} Time in HH:MM format in target timezone
 */
export function convertTimeStringBetweenTimezones(timeString, date, fromTimezone, toTimezone) {
  try {
    // Parse time string
    const [hours, minutes] = timeString.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error('Invalid time format. Use HH:MM');
    }
    
    // Create date with the time in source timezone
    const dateInSourceTZ = new Date(date);
    dateInSourceTZ.setHours(hours, minutes, 0, 0);
    
    // Convert to UTC
    const utcDate = timezoneToUtc(dateInSourceTZ, fromTimezone);
    
    // Convert to target timezone
    const dateInTargetTZ = utcToTimezone(utcDate, toTimezone);
    
    // Extract time string
    const targetHours = String(dateInTargetTZ.getHours()).padStart(2, '0');
    const targetMinutes = String(dateInTargetTZ.getMinutes()).padStart(2, '0');
    
    return `${targetHours}:${targetMinutes}`;
  } catch (error) {
    console.error('Error converting time between timezones:', error);
    throw new Error(`Failed to convert time: ${error.message}`);
  }
}

/**
 * Create a reservation time object with both UTC and local time
 * @param {Date} localDateTime - Local date and time
 * @param {string} timezone - IANA timezone
 * @returns {Object} { utcDate, localDate, startTimeUTC, timezone }
 */
export function createReservationTime(localDateTime, timezone) {
  try {
    const localDate = typeof localDateTime === 'string' 
      ? parseISO(localDateTime) 
      : localDateTime;
    
    if (!isValid(localDate)) {
      throw new Error('Invalid date provided');
    }
    
    // Convert to UTC
    const utcDate = timezoneToUtc(localDate, timezone);
    
    // Extract time components in UTC
    const utcHours = String(utcDate.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(utcDate.getUTCMinutes()).padStart(2, '0');
    const startTimeUTC = `${utcHours}:${utcMinutes}`;
    
    return {
      utcDate,
      localDate,
      startTimeUTC,
      timezone
    };
  } catch (error) {
    console.error('Error creating reservation time:', error);
    throw new Error(`Failed to create reservation time: ${error.message}`);
  }
}

/**
 * Parse a reservation from database (UTC) to local timezone
 * @param {Object} reservation - Reservation object with UTC data
 * @param {string} reservation.date - UTC date
 * @param {string} reservation.startTimeUTC - Start time in UTC (HH:MM)
 * @param {string} reservation.timezone - Original timezone
 * @returns {Object} { localDateTime, localTimeString }
 */
export function parseReservationToLocal(reservation) {
  try {
    const { date, startTimeUTC, timezone } = reservation;
    
    // Parse UTC time
    const [hours, minutes] = startTimeUTC.split(':').map(Number);
    const utcDateTime = new Date(date);
    utcDateTime.setUTCHours(hours, minutes, 0, 0);
    
    // Convert to local timezone
    const localDateTime = utcToTimezone(utcDateTime, timezone);
    
    const localHours = String(localDateTime.getHours()).padStart(2, '0');
    const localMinutes = String(localDateTime.getMinutes()).padStart(2, '0');
    const localTimeString = `${localHours}:${localMinutes}`;
    
    return {
      localDateTime,
      localTimeString
    };
  } catch (error) {
    console.error('Error parsing reservation to local:', error);
    throw new Error(`Failed to parse reservation: ${error.message}`);
  }
}

/**
 * Get timezone offset in hours
 * @param {string} timezone - IANA timezone
 * @param {Date} date - Date for which to get offset (default: now)
 * @returns {number} Offset in hours (can be fractional)
 */
export function getTimezoneOffset(timezone, date = new Date()) {
  try {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const offsetMs = tzDate.getTime() - utcDate.getTime();
    return offsetMs / (1000 * 60 * 60);
  } catch (error) {
    console.error('Error getting timezone offset:', error);
    return 0;
  }
}

/**
 * Validate IANA timezone string
 * @param {string} timezone - Timezone to validate
 * @returns {boolean} True if valid
 */
export function isValidTimezone(timezone) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get list of common timezones
 * @returns {Array<Object>} Array of { value, label, offset }
 */
export function getCommonTimezones() {
  return [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 0 },
    { value: 'Europe/London', label: 'London (GMT/BST)', offset: 0 },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 1 },
    { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)', offset: 1 },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: 1 },
    { value: 'America/New_York', label: 'New York (EST/EDT)', offset: -5 },
    { value: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: -6 },
    { value: 'America/Denver', label: 'Denver (MST/MDT)', offset: -7 },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: -8 },
    { value: 'America/Mexico_City', label: 'Mexico City (CST)', offset: -6 },
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: -3 },
    { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)', offset: -3 },
    { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
    { value: 'Asia/Kolkata', label: 'Mumbai (IST)', offset: 5.5 },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 8 },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)', offset: 10 },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)', offset: 12 }
  ];
}

/**
 * Calculate duration in minutes between two time strings
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @returns {number} Duration in minutes
 */
export function calculateDuration(startTime, endTime) {
  try {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    let duration = endTotalMinutes - startTotalMinutes;
    
    // Handle next-day scenarios
    if (duration < 0) {
      duration += 24 * 60;
    }
    
    return duration;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 0;
  }
}

/**
 * Add minutes to a time string
 * @param {string} timeString - Time in HH:MM format
 * @param {number} minutes - Minutes to add
 * @returns {string} New time in HH:MM format
 */
export function addMinutesToTime(timeString, minutes) {
  try {
    const [hours, mins] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error adding minutes to time:', error);
    return timeString;
  }
}

/**
 * Check if time is within business hours
 * @param {string} timeString - Time to check (HH:MM)
 * @param {string} startTime - Business start time (HH:MM)
 * @param {string} endTime - Business end time (HH:MM)
 * @returns {boolean} True if within business hours
 */
export function isWithinBusinessHours(timeString, startTime, endTime) {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const [startHours, startMins] = startTime.split(':').map(Number);
    const [endHours, endMins] = endTime.split(':').map(Number);
    
    const timeMinutes = hours * 60 + minutes;
    const startMinutes = startHours * 60 + startMins;
    const endMinutes = endHours * 60 + endMins;
    
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  } catch (error) {
    console.error('Error checking business hours:', error);
    return false;
  }
}

export default {
  utcToTimezone,
  timezoneToUtc,
  formatInTimezone,
  nowInTimezone,
  convertTimeStringBetweenTimezones,
  createReservationTime,
  parseReservationToLocal,
  getTimezoneOffset,
  isValidTimezone,
  getCommonTimezones,
  calculateDuration,
  addMinutesToTime,
  isWithinBusinessHours
};
