import * as htmlToImage from "https://esm.sh/html-to-image";

import { setupSourcesForm, loadStoragePreferences } from "./sources.mjs"
import { ditherCheckbox, previewDither, removeDither, setupDitherCheckbox } from "./dither.mjs";
import { appendPrinterStatus, getPrinterUrl } from "./printer.mjs";
import { wrapFetch } from "./util.mjs";

setupSourcesForm();
setupDitherCheckbox();

async function makeReceiptImage() {
  const receiptElement = document.getElementById('receipt');
  return await htmlToImage.toBlob(receiptElement, {width: 384});
}

const printButton = document.getElementById('print');
printButton.addEventListener('click', async () => {
  const url = getPrinterUrl();
  if (!url) return;
  
  const printerStatus = await wrapFetch(url);
  appendPrinterStatus(printerStatus);
  if (printerStatus.status !== 'online') {
    return;
  }

  const confirmed = confirm(`Sure you want to send this transmission to ${printerStatus.owner}'s printer?`);
  
  if (confirmed) {
    ditherCheckbox.checked = false;
    removeDither();

    const blob = await makeReceiptImage();
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
statusButton.addEventListener('click', async () => {
  const url = getPrinterUrl();
  if (!url) return;

  const json = await wrapFetch(url);
  appendPrinterStatus(json);
});

(async function() {
  if (ditherCheckbox.checked) {
    await previewDither();
  }

  loadStoragePreferences();
  getPrinterUrl();
})();