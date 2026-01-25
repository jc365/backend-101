// /utils/reservas/validateScheduleDays.js
/**
 * Valida los calendarios en las modificaciones para evitar
 * inconsistencias con valores anteriores (debido a que es 
 * un array que puede contener items contradictorios)
 * @param {*} customDays 
 * @param {*} generalDaysSet 
 * @returns 
 */
export function validateScheduleDays(customDays, generalDaysSet) {
  for (const day of customDays) {
    if (!generalDaysSet.has(day)) {
      return `Day '${day}' (custom) not allowed. General days: ${Array.from(
        generalDaysSet
      ).join(", ")}`;
    }
  }
  return null; // OK
}
