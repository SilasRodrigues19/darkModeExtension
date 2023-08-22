const siteUrl = new URL(window.location.href).hostname;

function applyDarkModeStyles() {
  const darkModeStyles = `
    html {
      filter: invert(1) hue-rotate(200deg);
    }
  `;

  const style = document.createElement('style');
  style.textContent = darkModeStyles;
  document.head.appendChild(style);
}

chrome.storage.local.get('darkModeSites', (result) => {
  const sites = result.darkModeSites || [];
  if (sites.includes(siteUrl)) {
    applyDarkModeStyles();
  }
});
