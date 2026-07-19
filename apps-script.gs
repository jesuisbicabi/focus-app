// ════════════════════════════════════════════════════════════
//  EXTERN BREIN — Google Apps Script
//  Dit is dezelfde backend als extern-brein/apps-script.gs, uitgebreid
//  met 4 kolommen (Dag, Deadline, Herhaling, Microstappen) zodat de
//  focus-app volledig kan synchroniseren. Bestaande kolommen en de
//  extern-brein app blijven ongewijzigd werken — nieuwe kolommen
//  worden alleen toegevoegd, nooit bestaande verwijderd/hernoemd.
//
//  Plakken in HETZELFDE script.google.com-project als je huidige
//  extern-brein Apps Script (vervang de bestaande code), daarna:
//  Implementeren → Implementatie beheren → Nieuwe versie.
// ════════════════════════════════════════════════════════════

const SHEET_NAME = 'Items';
const HEADERS = ['ID','Datum','Type','Inhoud','Categorie','Tijdsduur','Prioriteit','Status','Goedgekeurd',
                  'Dag','Deadline','Herhaling','Microstappen'];

// ── Sheet ophalen / aanmaken ─────────────────────────────────
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const hdrRange = sheet.getRange(1, 1, 1, HEADERS.length);
    hdrRange.setValues([HEADERS]);
    hdrRange.setBackground('#1f2937');
    hdrRange.setFontColor('#f3f4f6');
    hdrRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(4, 300);  // Inhoud
    sheet.setColumnWidth(1, 140);  // ID
  }
  ensureHeaders(sheet);
  return sheet;
}

// ── Migratie: ontbrekende kolommen aan het einde toevoegen ───
function ensureHeaders(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const current = sheet.getRange(1, 1, 1, lastCol).getValues()[0].filter(String);
  const missing = HEADERS.filter(h => current.indexOf(h) === -1);
  if (missing.length) {
    const startCol = current.length + 1;
    const hdrRange = sheet.getRange(1, startCol, 1, missing.length);
    hdrRange.setValues([missing]);
    hdrRange.setBackground('#1f2937');
    hdrRange.setFontColor('#f3f4f6');
    hdrRange.setFontWeight('bold');
  }
}

// ── GET: ?action=getAll ──────────────────────────────────────
function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'getAll') {
      return jsonOk(getAllItems());
    }
    return jsonErr('Onbekende actie: ' + action);
  } catch (err) {
    return jsonErr(err.toString());
  }
}

// ── POST: { action, ...payload } ────────────────────────────
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'add') {
      const saved = addItem(body.item);
      return jsonOk({ ok: true, item: saved });
    }
    if (action === 'update') {
      const found = updateItem(body.id, body.updates);
      return found ? jsonOk({ ok: true }) : jsonErr('ID niet gevonden: ' + body.id);
    }
    if (action === 'delete') {
      const found = deleteItem(body.id);
      return found ? jsonOk({ ok: true }) : jsonErr('ID niet gevonden: ' + body.id);
    }
    return jsonErr('Onbekende actie: ' + action);
  } catch (err) {
    return jsonErr(err.toString());
  }
}

// ── getAllItems ──────────────────────────────────────────────
function getAllItems() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  return data.slice(1)
    .filter(row => row[0] !== '')          // sla lege rijen over
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] !== undefined && row[i] !== null ? String(row[i]) : '';
      });
      return obj;
    });
}

// ── addItem ─────────────────────────────────────────────────
// Idempotent op ID: als een retry (na een verbroken verbinding) dezelfde
// add opnieuw verstuurt, overschrijft dit de bestaande rij i.p.v. een
// dubbele rij toe te voegen.
function addItem(item) {
  const sheet = getSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map(h => (item[h] !== undefined ? item[h] : ''));
  const idCol = headers.indexOf('ID');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(item.ID)) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return item;
    }
  }
  sheet.appendRow(row);
  return item;
}

// ── updateItem ───────────────────────────────────────────────
function updateItem(id, updates) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('ID');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      Object.keys(updates).forEach(key => {
        const col = headers.indexOf(key);
        if (col >= 0) {
          sheet.getRange(i + 1, col + 1).setValue(updates[key]);
        }
      });
      return true;
    }
  }
  return false;
}

// ── deleteItem ───────────────────────────────────────────────
function deleteItem(id) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('ID');

  // Van achteren naar voren zodat rijindex klopt na verwijderen
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

// ── Helpers ──────────────────────────────────────────────────
function jsonOk(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonErr(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: msg, fout: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
