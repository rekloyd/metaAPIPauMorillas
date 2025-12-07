// utils.js
import crypto from 'crypto';

export function sha256HexLower(str) {
  return crypto.createHash('sha256').update(str).digest('hex').toLowerCase();
}

export function normalizeEmail(email) {
  if (!email) return '';
  return email.trim().toLowerCase();
}

export function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

export function normalizeString(s) {
  if (!s) return '';
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/* Podemos añadir más si es necesario. Se ha dado por hecho que no se hacen campañas en países como MEXICO en el que el
 símbolo del dolar se usa para los pesos. De hacerlo debemos tener en cuenta el país en la función no solo el símbolo. */
export function parsePrice(priceStr) {
  const cleaned = priceStr.replace(/[^0-9,\.]/g, '').replace(',', '.');
  const value = parseFloat(cleaned);
  let currency = 'USD';
  if (priceStr.includes('€')) currency = 'EUR';
  else if (priceStr.includes('$')) currency = 'USD';
  return { value, currency };
}


/* En el caso de tener mas eventos vamos añadiéndolos en esta función. Podemos tener un array con todos los eventos y el mapeado.
 Se ha tenido en cuenta solo el de compra siguiendo el csv para la prueba.*/
export const mapActionToEvent = (action) =>
  action.toLowerCase() === 'checkout' ? 'Purchase' : undefined;

