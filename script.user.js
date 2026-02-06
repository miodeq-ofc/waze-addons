// ==UserScript==
// @name         WME Addons
// @version      1.5
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

  const SCRIPT_VERSION = "1.4"; // obecna wersja skryptu
  const LAYERS_WITH_OPACITY = [
    "Geoportal - ulice",
    "Geoportal - OSM"
  ];

  // Funkcja wyświetlająca dialog z informacjami o nowej wersji
  function showChangelog() {
    const changelog = `
Nowa wersja ${SCRIPT_VERSION} skryptu WME Addons!
Co nowego:
- Dodano suwaki przezroczystości dla warstw Geoportal
- Poprawki wizualne
- [Tu możesz dodać kolejne zmiany]
`;
    alert(changelog); // proste okienko, można zamienić na modal
  }

  // Sprawdzenie czy użytkownik widział już tę wersję
  function checkVersion() {
    const lastVersion = localStorage.getItem("wme_addons_version");
    if (lastVersion !== SCRIPT_VERSION) {
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
      slider.className = "geoportal-opacity-addon hidden"; 

      layer.setOpacity(1);
      
      slider.addEventListener("input", function () {
        layer.setOpacity(this.value / 100);
      });

      targetLi.appendChild(slider);

      if (checkbox) {
        const updateSliderVisibility = () => {
          const checked = checkbox.checked !== undefined ? checkbox.checked : checkbox.hasAttribute('checked');
          slider.classList.toggle('hidden', !checked);
        };
        updateSliderVisibility();

        checkbox.addEventListener('change', updateSliderVisibility);
      }

      console.log("Geoportal addon: opacity slider added for", layerName);
    });
  }

  checkVersion(); // sprawdzenie wersji przy starcie
  addStyles();
  waitForLayerAndUI();

})();
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
      slider.className = "geoportal-opacity-addon hidden"; 

      layer.setOpacity(1);
      
      slider.addEventListener("input", function () {
        layer.setOpacity(this.value / 100);
      });

      targetLi.appendChild(slider);

      if (checkbox) {
        const updateSliderVisibility = () => {
          const checked = checkbox.checked !== undefined ? checkbox.checked : checkbox.hasAttribute('checked');
          slider.classList.toggle('hidden', !checked);
        };
        updateSliderVisibility();

        checkbox.addEventListener('change', updateSliderVisibility);
      }

      console.log("Geoportal addon: opacity slider added for", layerName);
    });
  }

  addStyles();
  waitForLayerAndUI();

})();
