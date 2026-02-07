// ==UserScript==
// @name         WME Addons
// @version      Beta-2.1
// @author       miodeq
// @description  Addons for WME and other scripts
// @match        https://*.waze.com/*/editor*
// @match        https://*.waze.com/editor*
// @match        https://*.waze.com/map-editor*
// @match        https://*.waze.com/beta_editor*
// @run-at       document-end
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/script.user.js
// @updateURL    https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/script.user.js
// @icon         https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/logo.png
// ==/UserScript==

(function () {

  const SCRIPT_VERSION = "Beta-2.1";
  const LAYERS_WITH_OPACITY = [
    "Geoportal - ulice",
    "Geoportal - OSM"
  ];

  function showChangelog() {
    alert(`Nowa wersja ${SCRIPT_VERSION} skryptu WME Addons!
Co nowego:
- Stabilne suwaki przezroczystości
- Poprawiona obsługa włączania/wyłączania warstw`);
  }

  function checkVersion() {
    const last = localStorage.getItem("wme_addons_version");
    if (last !== SCRIPT_VERSION) {
      showChangelog();
      localStorage.setItem("wme_addons_version", SCRIPT_VERSION);
    }
  }

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
    if (!window.W || !W.map || !document.querySelector('#layer-switcher-region')) {
      return setTimeout(waitForLayerAndUI, 1000);
    }

    const listItems = document.querySelectorAll(
      '#layer-switcher-region .menu .list-unstyled li.group:nth-child(5) ul li'
    );

    LAYERS_WITH_OPACITY.forEach(layerName => {
      const layer = W.map.getLayersByName(layerName)[0];
      if (!layer) return;

      let targetLi = null;

      listItems.forEach(li => {
        if (li.textContent.trim() === layerName) {
          targetLi = li;
        }
      });

      if (!targetLi || targetLi.querySelector('input[type="range"]')) return;

      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0";
      slider.max = "100";
      slider.value = "100";
      slider.className = "geoportal-opacity-addon";

      layer.setOpacity(1);

      slider.addEventListener("input", function () {
        layer.setOpacity(this.value / 100);
      });

      targetLi.appendChild(slider);

      // 🔥 JEDYNE PEWNE ŹRÓDŁO PRAWDY
      const updateVisibility = () => {
        slider.classList.toggle("hidden", !layer.getVisibility());
      };

      updateVisibility();
      layer.events.register("visibilitychanged", layer, updateVisibility);

      console.log("Geoportal addon: opacity slider added for", layerName);
    });
  }

  checkVersion();
  addStyles();
  waitForLayerAndUI();

})();
