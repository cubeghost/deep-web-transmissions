export function getPrinterUrl() {  
  const key = 'deep-web:printer-url';

  const input = /** @type {HTMLInputElement} */ (document.getElementById('printerUrl'));
  const storedUrl = localStorage.getItem(key);
  
  if (!input.value) {
    if (storedUrl) {
      input.value = storedUrl;
      return storedUrl;
    }
    return;
  }

  if (storedUrl === input.value) {
    return storedUrl;
  }
  
  localStorage.setItem(key, input.value);
  return input.value;
};

export function appendPrinterStatus(object) {
  const output = document.getElementById('printerStatus');
  output.style.display = 'block';
  output.innerText += JSON.stringify(object, null, 2) + '\n';
  console.log('device.li response', object);
};