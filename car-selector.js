
// --- 1. CSV Parsing ---
function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    // Handle quoted fields with commas
    const values = [];
    let inQuotes = false, value = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        values.push(value);
        value = '';
      } else value += char;
    }
    values.push(value);
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i] || '');
    return obj;
  });
}

// --- 2. DOM Elements ---
const makeSelect = document.getElementById('make');
const modelSelect = document.getElementById('model');
const yearSelect = document.getElementById('year');
const trimSelect = document.getElementById('trim');
const rowDataDiv = document.getElementById('row-data');

// --- 3. Utility: Unique values ---
function getUnique(data, key) {
  return [...new Set(data.map(row => row[key]).filter(v => v))];
}

// --- 4. Populate Dropdowns ---
function populateDropdown(select, options, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
}

/*
// --- 5. Display Car Data ---
function displayRowData(row) {
  let html = `<table id="data-table"><tbody>`;
  for (const key in row) {
    let value = row[key];
    if (key === 'URL' && value) {
      value = `<a href="${value}" target="_blank">${value}</a>`;
    }
    html += `<tr><th>${key}</th><td>${value || '-'}</td></tr>`;
  }
  html += `</tbody></table>`;
  rowDataDiv.innerHTML = html;
}
*/

function displayRowData(row) {
  const fieldsToShow = ['Gross weight', 'Maximum Payload', 'Curb Weight', 'Wheelbase', 'Length'];
  let html = `<table id="data-table"><tbody>`;
  fieldsToShow.forEach(key => {
    let value = row[key];
    html += `<tr><th>${key}</th><td>${value || '-'}</td></tr>`;
  });
  html += `</tbody></table>`;
  rowDataDiv.innerHTML = html;
}

// --- 6. Load CSV and Initialize ---
let carData = [];

function setupEventHandlers() {
  makeSelect.addEventListener('change', function() {
    const filtered = carData.filter(row => row.Make === makeSelect.value);
    populateDropdown(modelSelect, getUnique(filtered, 'Model'), 'Select Model');
    populateDropdown(yearSelect, [], 'Select Year');
    populateDropdown(trimSelect, [], 'Select Trim');
    rowDataDiv.innerHTML = '';
  });

  modelSelect.addEventListener('change', function() {
    const filtered = carData.filter(row =>
      row.Make === makeSelect.value && row.Model === modelSelect.value
    );
    populateDropdown(yearSelect, getUnique(filtered, 'Year'), 'Select Year');
    populateDropdown(trimSelect, [], 'Select Trim');
    rowDataDiv.innerHTML = '';
  });

  yearSelect.addEventListener('change', function() {
    const filtered = carData.filter(row =>
      row.Make === makeSelect.value &&
      row.Model === modelSelect.value &&
      row.Year === yearSelect.value
    );
    populateDropdown(trimSelect, getUnique(filtered, 'Trim'), 'Select Trim');
    rowDataDiv.innerHTML = '';
  });

  trimSelect.addEventListener('change', function() {
    const filtered = carData.filter(row =>
      row.Make === makeSelect.value &&
      row.Model === modelSelect.value &&
      row.Year === yearSelect.value &&
      row.Trim === trimSelect.value
    );
    if (filtered.length > 0) {
      displayRowData(filtered[0]);
    } else {
      rowDataDiv.innerHTML = '';
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  fetch('csv.csv')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load CSV file');
      return response.text();
    })
    .then(csvText => {
      carData = parseCSV(csvText);
      populateDropdown(makeSelect, getUnique(carData, 'Make'), 'Select Make');
      populateDropdown(modelSelect, [], 'Select Model');
      populateDropdown(yearSelect, [], 'Select Year');
      populateDropdown(trimSelect, [], 'Select Trim');
      setupEventHandlers();
    })
    .catch(error => {
      rowDataDiv.innerHTML = `<span style='color:red;'>Error loading CSV: ${error.message}</span>`;
    });
});
