(function () {
  'use strict';

  const { viewers, extractCodes, getLinks } = window.Smm2Tool;
  const storageKey = 'smm2-tool-preferences-v1';
  const input = document.getElementById('input-text');
  const viewerOptions = [...document.querySelectorAll('input[name="viewer"]')];
  const urlOnly = document.getElementById('options-url-only');
  const result = document.getElementById('result');
  const summary = document.getElementById('result-summary');
  const actionStatus = document.getElementById('action-status');
  const copyUrlsButton = document.getElementById('copy-urls');
  const copyCodesButton = document.getElementById('copy-codes');
  const clearButton = document.getElementById('input-clear');
  let currentCodes = [];
  let currentUrls = [];

  document.getElementById('version-info').textContent = 'Version 2026.10.25';
  restorePreferences();
  input.addEventListener('input', update);
  document.getElementById('input-example').addEventListener('click', () => {
    input.value = 'Course: 7WC-8BR-XBG\nMaker: XL2-72J-7GF\nThe same course, pasted again: ７ＷＣ－８ＢＲ－ＸＢＧ';
    update();
    input.focus();
  });
  clearButton.addEventListener('click', () => {
    input.value = '';
    update();
    input.focus();
  });
  for (const control of [...viewerOptions, urlOnly]) {
    control.addEventListener('change', () => {
      savePreferences();
      update();
    });
  }
  copyUrlsButton.addEventListener('click', () => {
    copyText(currentUrls.join('\n'), `${plural(currentUrls.length, 'URL')} copied.`);
  });
  copyCodesButton.addEventListener('click', () => {
    copyText(currentCodes.map((entry) => entry.code).join('\n'), `${plural(currentCodes.length, 'code')} copied.`);
  });
  update();

  function selectedViewerIds() {
    return viewerOptions.filter((option) => option.checked).map((option) => option.value);
  }

  function restorePreferences() {
    try {
      const preferences = JSON.parse(localStorage.getItem(storageKey));
      if (!preferences || typeof preferences !== 'object') return;

      if (Array.isArray(preferences.viewers) && preferences.viewers.every((id) => viewers.some((viewer) => viewer.id === id))) {
        for (const option of viewerOptions) {
          option.checked = preferences.viewers.includes(option.value);
        }
      }
      if (typeof preferences.urlOnly === 'boolean') {
        urlOnly.checked = preferences.urlOnly;
      }
    } catch {
      // Blocked storage or invalid saved data must not prevent code conversion.
    }
  }

  function savePreferences() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        viewers: selectedViewerIds(),
        urlOnly: urlOnly.checked,
      }));
    } catch {
      // Preferences are optional; the pasted text is never stored.
    }
  }

  function plural(count, word) {
    return `${count} ${word}${count === 1 ? '' : 's'}`;
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function createLink(link, onlyUrl) {
    const anchor = element('a', onlyUrl ? '' : 'viewer-link');
    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    if (onlyUrl) {
      anchor.textContent = link.url;
    } else {
      anchor.append(
        element('span', 'viewer-link-name', `${link.name} ↗`),
        element('span', 'viewer-link-note', link.note)
      );
    }
    return anchor;
  }

  function renderCard(entry, links, selected) {
    const card = element('article', 'result-card');
    const heading = element('div', 'result-heading');
    const kind = element('span', `code-kind${entry.type === 'maker' ? ' maker-badge' : ''}`, entry.type === 'maker' ? 'Maker' : 'Course');
    const copy = element('button', 'row-copy', 'Copy code');
    copy.type = 'button';
    copy.setAttribute('aria-label', `Copy code ${entry.code}`);
    copy.addEventListener('click', () => copyText(entry.code, `${entry.code} copied.`));
    heading.append(element('code', 'code-label', entry.code), kind, copy);
    card.append(heading);

    if (entry.count > 1) {
      card.append(element('p', 'duplicate-note', `Found ${entry.count} times · shown once`));
    }
    const linkGroup = element('div', 'viewer-links');
    for (const link of links) linkGroup.append(createLink(link, false));
    card.append(linkGroup);
    if (!selected.length) {
      card.append(element('p', 'no-viewer-note', 'Select a viewer above to generate links.'));
    } else if (!links.length) {
      card.append(element('p', 'no-viewer-note', 'The selected viewer supports course codes only. Select a maker-compatible viewer above.'));
    } else if (entry.type === 'maker' && selected.includes('thumbnail')) {
      card.append(element('p', 'no-viewer-note', 'Course thumbnails are available for course codes only.'));
    }
    return card;
  }

  function update() {
    const extracted = extractCodes(input.value);
    const selected = selectedViewerIds();
    const courseCount = extracted.codes.filter((entry) => entry.type === 'course').length;
    const makerCount = extracted.codes.length - courseCount;
    const entries = extracted.codes.map((entry) => ({ entry, links: getLinks(entry, selected) }));
    currentCodes = extracted.codes;
    currentUrls = entries.flatMap(({ links }) => links.map((link) => link.url));
    copyUrlsButton.disabled = !currentUrls.length;
    copyCodesButton.disabled = !currentCodes.length;
    clearButton.disabled = !input.value;
    actionStatus.textContent = '';

    const counts = `${plural(courseCount, 'course')} · ${plural(makerCount, 'maker')} · ${plural(currentUrls.length, 'link')}`;
    summary.textContent = extracted.duplicates ? `${counts} · ${plural(extracted.duplicates, 'duplicate')} removed` : counts;
    const fragment = document.createDocumentFragment();
    if (!currentCodes.length) {
      fragment.append(element('p', 'empty-state', input.value.trim()
        ? 'No codes found. Use a 9-character code such as 7WC-8BR-XBG. A, E, I, O, U and Z are not used in SMM2 codes.'
        : 'Paste a post, a viewer URL, or a list of codes above. Your links will appear here.'));
    } else if (urlOnly.checked) {
      const list = element('ul', 'url-list');
      for (const { links } of entries) {
        for (const link of links) {
          const item = element('li', 'url-item');
          item.append(createLink(link, true));
          list.append(item);
        }
      }
      fragment.append(list);
      if (!selected.length) {
        fragment.append(element('p', 'no-viewer-note', 'Select a viewer above to generate links.'));
      } else {
        const unsupported = entries.filter(({ links }) => !links.length).length;
        if (unsupported) {
          fragment.append(element('p', 'no-viewer-note', `${plural(unsupported, 'maker code')} cannot be linked with the selected viewer. Select a maker-compatible viewer above.`));
        }
      }
    } else {
      for (const { entry, links } of entries) fragment.append(renderCard(entry, links, selected));
    }
    result.replaceChildren(fragment);
  }

  async function copyText(text, message) {
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      actionStatus.textContent = message;
      return;
    } catch {
      // A local file or a browser permission can block the Clipboard API.
    }

    const activeElement = document.activeElement;
    const inputSelection = activeElement === input
      ? { start: input.selectionStart, end: input.selectionEnd }
      : null;
    const temporary = element('textarea', 'clipboard-buffer');
    temporary.value = text;
    temporary.setAttribute('readonly', '');
    document.body.append(temporary);
    temporary.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      // If both methods fail, give a clear instruction rather than claim success.
    } finally {
      temporary.remove();
      if (activeElement) activeElement.focus({ preventScroll: true });
      if (inputSelection) input.setSelectionRange(inputSelection.start, inputSelection.end);
    }
    actionStatus.textContent = copied ? message : 'Copy was blocked by your browser. Select and copy the codes or links manually.';
  }
})();
