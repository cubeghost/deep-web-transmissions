const wrapFetch = (url, options) => (
  fetch(url, options).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  })
);

document.querySelectorAll('#toggles input').forEach((input) => {
  input.addEventListener('change', (event) => {
    const {name, checked} = event.target;
    const entry = document.querySelector(`.${name}`);
    if (checked) {
      entry.classList.remove('hidden');
    } else {
      entry.classList.add('hidden');
    }
  })
});

const printButton = document.getElementById('print');
printButton.addEventListener('click', (event) => {
  const input = document.getElementById('printerUrl');
  if (!input.value) {
    return;
  }

  const url = input.value;
  const receiptElement = document.getElementById('receipt');

  domtoimage.toBlob(receiptElement, {width: 384}).then((blob) => {
    wrapFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'image/png',
      },
      body: blob,
    }).then((json) => {
      document.getElementById('printerStatus').innerText += JSON.stringify(json) + '\n';
    });
  });
});

const statusButton = document.getElementById('status');
statusButton.addEventListener('click', (event) => {
  const input = document.getElementById('printerUrl');
  if (!input.value) {
    return;
  }

  const url = input.value;
  wrapFetch(url).then((json) => {
    document.getElementById('printerStatus').innerText += JSON.stringify(json) + '\n';
  });
});
