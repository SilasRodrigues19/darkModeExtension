document.addEventListener('DOMContentLoaded', function () {
  const activateBtn = document.getElementById('activate-btn');
  const deactivateBtn = document.getElementById('deactivate-btn');
  const addSiteBtn = document.getElementById('add-site-btn');
  const siteListItems = document.getElementById('site-list-items');
  const siteUrlInput = document.getElementById('site-url');

  activateBtn.addEventListener('click', () => {
    applyDarkModeToActiveTab();
  });

  deactivateBtn.addEventListener('click', () => {
    clearDarkModeStyles();
  });

  addSiteBtn.addEventListener('click', () => {
    const siteUrl = siteUrlInput.value;
    addSiteToStorage(siteUrl);
    updateSiteList();
  });

  siteListItems.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-site')) {
      const siteUrl = event.target.dataset.siteUrl;
      removeSiteFromStorage(siteUrl);
      updateSiteList();
    }
  });

  async function applyDarkModeToActiveTab() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const siteUrl = new URL(tab.url).hostname;
    applyDarkModeStyles(tab.id, siteUrl);
  }

  function applyDarkModeStyles(tabId, siteUrl) {
    // Enviar uma mensagem para o content script para que ele aplique o estilo
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: applyDarkModeStylesContentScript,
    });
  }

  function applyDarkModeStylesContentScript() {
    const darkModeStyles = `
      body {
        filter: invert(1) hue-rotate(200deg);
      }
    `;

    const style = document.createElement('style');
    style.id = 'darkModeStyles';
    style.textContent = darkModeStyles;
    document.head.appendChild(style);
  }

  function clearDarkModeStyles() {
    // Obter o ID da guia ativa
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const [tab] = tabs;
      // Enviar uma mensagem para o content script para que ele remova o estilo
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: clearDarkModeStylesContentScript,
      });
    });
  }

  function clearDarkModeStylesContentScript() {
    const styleElement = document.getElementById('darkModeStyles');
    if (styleElement) {
      styleElement.remove();
    }
  }

  function addSiteToStorage(siteUrl) {
    let sites = JSON.parse(localStorage.getItem('darkModeSites')) || [];
    if (!sites.includes(siteUrl)) {
      sites.push(siteUrl);
      localStorage.setItem('darkModeSites', JSON.stringify(sites));
    }
  }

  function removeSiteFromStorage(siteUrl) {
    let sites = JSON.parse(localStorage.getItem('darkModeSites')) || [];
    sites = sites.filter((url) => url !== siteUrl);
    localStorage.setItem('darkModeSites', JSON.stringify(sites));
  }

  function updateSiteList() {
    siteListItems.innerHTML = '';

    const sites = JSON.parse(localStorage.getItem('darkModeSites')) || [];
    sites.forEach((siteUrl) => {
      const listItem = document.createElement('li');
      listItem.textContent = siteUrl;
      const removeButton = document.createElement('button');
      removeButton.textContent = 'X';
      removeButton.classList.add('remove-site');
      removeButton.dataset.siteUrl = siteUrl;
      listItem.appendChild(removeButton);
      siteListItems.appendChild(listItem);
    });
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const [tab] = tabs;
    const siteUrl = new URL(tab.url).hostname;
    updateSiteList();
  });
});
