function isLightColor(color) {
  const rgbValues = color.match(/\d+/g);
  if (rgbValues) {
    const brightness =
      (parseInt(rgbValues[0]) * 299 +
        parseInt(rgbValues[1]) * 587 +
        parseInt(rgbValues[2]) * 114) /
      1000;
    return brightness > 128; // Adjust this threshold to your preference
  }
  return false;
}

function applyCustomColorScheme() {
  const lightElements = document.querySelectorAll(
    '*:not(script):not(style):not(iframe):not([class*="dark-mode"]):not([style*="background-color: #1c1c1c"]):not([style*="color: #fff"])'
  );

  for (const element of lightElements) {
    const computedStyle = getComputedStyle(element);
    const bgColor = computedStyle.backgroundColor;

    if (isLightColor(bgColor)) {
      element.style.backgroundColor = '#1c1c1c';
      element.style.color = '#fff';
    }
  }
}

chrome.storage.local.get('darkModeSites', (result) => {
  const sites = result.darkModeSites || [];
  if (sites.includes(siteUrl)) {
    applyCustomColorScheme();
  }
});
