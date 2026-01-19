import Sortable from 'https://esm.sh/sortablejs';
import throttle from "https://esm.sh/lodash-es/throttle";

const sourcesContainer = /** @type {HTMLElement} */ (document.querySelector("#sources"));
const receiptContainer = /** @type {HTMLElement} */ (document.querySelector("#receipt"));

const sortable = Sortable.create(sourcesContainer, {
  handle: ".drag-handle",
  onSort: (event) => {
    const sourceId = event.item.dataset.id;
    const after = /** @type {HTMLElement} */( document.querySelector(`#sources > [data-id="${sourceId}"] + div`));
    const afterId = after?.dataset.id;

    const entry = receiptContainer.querySelector(`.entry.${sourceId}`);
    if (afterId) {
      const afterEntry = receiptContainer.querySelector(`.entry.${afterId}`);
      receiptContainer.insertBefore(entry, afterEntry);
    } else {
      receiptContainer.appendChild(entry);
    }

    saveSourcePreferences();
  }
});

const preferencesKey = "deep-web:sources";

/** @returns {Array<[string, boolean]>} */
function getCurrentPreferences() {
  return Array.from(document.querySelectorAll("#sources input"), (/** @type {HTMLInputElement} */ element) => (
    [element.name, element.checked]
  ));
}

export function saveSourcePreferences() {
  localStorage.setItem(preferencesKey, JSON.stringify(getCurrentPreferences()));
}

export function loadStoragePreferences() {
  const stored = localStorage.getItem(preferencesKey);
  const sources = /** @type {Array<[string, boolean]>} */ (stored ? JSON.parse(stored) : getCurrentPreferences());

  for (const [id, enabled] of sources) {
    const checkbox = /** @type {HTMLInputElement} */ (document.getElementById(`toggle-${id}`));
    checkbox.checked = enabled;
    const entry = /** @type {HTMLElement} */ receiptContainer.querySelector(`.entry.${id}`);
    if (!enabled) entry.classList.add('hidden');

    sourcesContainer.appendChild(sourcesContainer.querySelector(`[data-id="${id}"]`));
    receiptContainer.appendChild(entry);
  }
}

/**  @typedef {InputEvent & { target: HTMLInputElement }} InputTargetEvent */

function handleSourceCheckbox(/** @type {InputTargetEvent} */ event) {
  const {name, checked} = event.target;
  const entry = document.querySelector(`.${name}`);
  if (checked) {
    entry.classList.remove('hidden');
  } else {
    entry.classList.add('hidden');
  }
  saveSourcePreferences();
}

const toggleCustomMessage = throttle((visible) => {
  const entry = document.querySelector(".customMessage");
  if (visible) {
    entry.classList.remove('hidden');
  } else {
    entry.classList.add('hidden');
  }
}, 200);

export function setupSourcesForm() {
  document.querySelectorAll('#sources input[type=checkbox]').forEach((input) => {
    input.addEventListener('change', handleSourceCheckbox);
  });

  const textarea = document.getElementById('input-customMessage');
  textarea.addEventListener('input', (/** @type {InputTargetEvent} */ event) => {
    document.getElementById('customMessage').innerText = event.target.value;

    toggleCustomMessage(!!event.target.value);
  });
}