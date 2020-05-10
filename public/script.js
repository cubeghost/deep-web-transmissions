/**
  TODO:
    - persist enabled content and restore on page load
    - atkinson dither preview
*/

const wrapFetch = (url, options) => (
  fetch(url, options).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  })
);

const getPrinterUrl = () => {  
  const key = 'deep-web:printer-url';

  const input = document.getElementById('printerUrl');
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

const appendPrinterStatus = (object) => {
  const output = document.getElementById('printerStatus');
  output.style.display = 'block';
  output.innerText += JSON.stringify(object, null, 2) + '\n';
  console.log('device.li response', object);
};

document.querySelectorAll('#toggles input').forEach((input) => {
  input.addEventListener('change', (event) => {
    const {name, checked} = event.target;
    document.querySelectorAll(`.${name}`).forEach((entry) => {
      if (checked) {
        entry.classList.remove('hidden');
      } else {
        entry.classList.add('hidden');
      }      
    });
  })
});

const textarea = document.getElementById('input-customMessage');
textarea.addEventListener('change', (event) => {
  document.getElementById('customMessage').innerText = event.target.value;
});

const printButton = document.getElementById('print');
printButton.addEventListener('click', async (event) => {
  const url = getPrinterUrl();
  if (!url) return;
  
  const printerStatus = await wrapFetch(url);
  appendPrinterStatus(printerStatus);
  if (printerStatus.status !== 'online') {
    return;
  }

  const confirmed = confirm(`Sure you want to send this transmission to ${printerStatus.owner}'s printer?`);
  
  if (confirmed) {
    const receiptElement = document.getElementById('receipt');

    const blob = await domtoimage.toBlob(receiptElement, {width: 384});
    const printStatus = await wrapFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
      },
      body: blob,
    });
    appendPrinterStatus(printStatus);
  }
});

const statusButton = document.getElementById('status');
statusButton.addEventListener('click', async (event) => {
  const url = getPrinterUrl();
  if (!url) return;

  const json = await wrapFetch(url);
  appendPrinterStatus(json);
});

(function(){
  getPrinterUrl();
})();