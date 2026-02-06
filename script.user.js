// ==UserScript==
// @name         WME Addons - by Miodeq
// @version      1.2
// @description  Addons for WME and other scripts
// @match        https://*.waze.com/*/editor*
// @match        https://*.waze.com/editor*
// @match        https://*.waze.com/map-editor*
// @match        https://*.waze.com/beta_editor*
// @run-at       document-end
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/script.user.js
// @updateURL    https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/script.user.js
// ==/UserScript==

(function () {

  const LAYERS_WITH_OPACITY = [
    "Geoportal - ulice",
    "Geoportal - OSM"
  ];

  function addStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .geoportal-opacity-addon {
        width: 100%;
        margin-top: 4px;
        accent-color: #33ccff;
      }
      .geoportal-opacity-addon.hidden {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  function waitForLayerAndUI() {
    if (!window.W || !W.map || !document.querySelector('#layer-switcher-region .menu .list-unstyled')) {
      return setTimeout(waitForLayerAndUI, 1000);
    }

    const listItems = document.querySelectorAll(
      '#layer-switcher-region .menu .list-unstyled li.group:nth-child(5) ul li'
    );

    LAYERS_WITH_OPACITY.forEach(layerName => {
      const layer = W.map.getLayersByName(layerName)[0];
      if (!layer) return; // np. OSM gdy brak rangi

      let targetLi = null;
      let checkbox = null;

      listItems.forEach(li => {
        if (li.textContent.trim() === layerName) {
          targetLi = li;
          checkbox = li.querySelector('wz-checkbox') || li.querySelector('input[type="checkbox"]');
        }
      });

      if (!targetLi || targetLi.querySelector('input[type="range"]')) return;

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "100";
      slider.value = "100";
      slider.className = "geoportal-opacity-addon hidden"; // ukryty na start

      layer.setOpacity(1);

      // event slider
      slider.addEventListener("input", function () {
        layer.setOpacity(this.value / 100);
      });

      targetLi.appendChild(slider);

      // event checkbox
      if (checkbox) {
        const updateSliderVisibility = () => {
          const checked = checkbox.checked !== undefined ? checkbox.checked : checkbox.hasAttribute('checked');
          slider.classList.toggle('hidden', !checked);
        };

        // inicjalnie sprawdź
        updateSliderVisibility();

        // nasłuchuj zmiany
        checkbox.addEventListener('change', updateSliderVisibility);
      }

      console.log("Geoportal addon: opacity slider added for", layerName);
    });
  }

  addStyles();
  waitForLayerAndUI();

})();
