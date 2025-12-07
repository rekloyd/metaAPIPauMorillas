/**
 *  TECHNICAL INTERVIEW ADSMURAI
 */

import 'dotenv/config';
import { parse } from 'csv-parse';

import { sha256HexLower, normalizeEmail, normalizePhone, normalizeString, parsePrice, mapActionToEvent } from './utils.js';

// Función para mapear cada fila a evento Meta
function mapRowToEvent(row, headerIndices) {
  const [firstName, ...rest] = row[headerIndices.idxName].split(' ');
  const lastName = rest.join(' ') || '';

  // Tomamos las tres primeras columnas como emails. Si cambia el formato del csv esto no nos es válido!
  const originalEmails = [0, 1, 2].map(i => row[i]).filter(Boolean);
  const emails = originalEmails.map(e => sha256HexLower(normalizeEmail(e)));



  const { value, currency } = parsePrice(row[headerIndices.idxPrice] || '0');
  const eventTime = Math.floor(new Date(row[headerIndices.idxCheckout] || Date.now()).getTime() / 1000); //un timestamp

  return {
    event_name: mapActionToEvent('checkout'),
    event_time: eventTime,
    action_source: 'physical_store',
    user_data: {
      external_id: row[headerIndices.idxMadid] ? String(row[headerIndices.idxMadid]) : undefined,
      em: emails.length > 0 ? emails : undefined,
      ph: row[headerIndices.idxPhone] ? sha256HexLower(normalizePhone(row[headerIndices.idxPhone])) : undefined,
      fn: firstName ? sha256HexLower(normalizeString(firstName)) : undefined,
      ln: lastName ? sha256HexLower(normalizeString(lastName)) : undefined,
      zp: row[headerIndices.idxZip] ? sha256HexLower(normalizeString(row[headerIndices.idxZip])) : undefined,
      country: row[headerIndices.idxCountry] ? sha256HexLower(normalizeString(row[headerIndices.idxCountry])) : undefined
    },
    custom_data: {
      value,
      currency
    }
  };
}

// Función para enviar un batch a Meta
async function postToMeta(eventsBatch) {
  const url = `https://graph.facebook.com/v16.0/${process.env.PIXEL_ID}/events?access_token=${process.env.ACCESS_TOKEN}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: eventsBatch })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Error uploading batch:', data);
    } else {
      console.log('Batch uploaded successfully:', data);
    }
  } catch (err) {
    console.error('Network or fetch error:', err);
  }
}

// Función principal
async function prepararYEnviarData() {
  try {
    const res = await fetch(process.env.CSV_URL);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const csvText = await res.text();

    parse(csvText, { columns: false, skip_empty_lines: true }, async (err, records) => {
      if (err) throw err;

      // Extraemos header y buscamos índices
      const header = records.shift();
      const headerIndices = {
        idxName: header.findIndex(h => h.toLowerCase() === 'name'),
        idxPhone: header.findIndex(h => h.toLowerCase() === 'phone'),
        idxMadid: header.findIndex(h => h.toLowerCase() === 'madid'),
        idxPrice: header.findIndex(h => h.toLowerCase() === 'price'),
        idxCheckout: header.findIndex(h => h.toLowerCase() === 'checkout_time'),
        idxZip: header.findIndex(h => h.toLowerCase() === 'zip code'),
        idxCountry: header.findIndex(h => h.toLowerCase() === 'country')
      };

      const events = records.map(row => mapRowToEvent(row, headerIndices));

      const batchSize = parseInt(process.env.BATCH_SIZE) || 50;
      for (let i = 0; i < events.length; i += batchSize) {
        const batch = events.slice(i, i + batchSize);
        await postToMeta(batch);
      }

    });

  } catch (err) {
    console.error('Error:', err);
  }
}

prepararYEnviarData();
