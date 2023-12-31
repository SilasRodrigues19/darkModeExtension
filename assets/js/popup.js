document.addEventListener('DOMContentLoaded', function () {
  const activateBtn = document.querySelector('#activate-btn');
  const addSiteBtn = document.querySelector('#add-site-btn');
  const removeSiteBtn = document.querySelector('#deactivate-btn');
  const siteListItems = document.querySelector('#site-list-items');
  const siteUrlInput = document.querySelector('#site-url');

  activateBtn.addEventListener('click', () => {
    applyDarkModeToActiveTab();
  });

  removeSiteBtn.addEventListener('click', () => {
    reloadActiveTab();
  });

  async function reloadActiveTab() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    chrome.tabs.reload(tab.id);
  }

  addSiteBtn.addEventListener('click', () => {
    const siteUrl = siteUrlInput.value.trim();

    if (!isValidURL(siteUrl)) {
      alert('Por favor, insira uma URL válida.');
      return;
    }

    if (isURLInList(siteUrl)) {
      alert('Esta URL já está na lista.');
      return;
    }

    addSiteToStorage(siteUrl);
    applyCustomColorSchemeToActiveTab(); // Chamada da função correta
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

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: applyDarkModeStylesContentScript,
    });
  }

  function applyDarkModeStylesContentScript() {
    applyCustomColorScheme();
  }

  function isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  function isURLInList(url) {
    const sites = JSON.parse(localStorage.getItem('darkModeSites')) || [];
    return sites.includes(url);
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
    const siteUrl = new URL(tab.url);
    siteUrlInput.value = siteUrl;
    updateSiteList();
  });
});
