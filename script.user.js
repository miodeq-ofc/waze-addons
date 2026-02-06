// ==UserScript==
// @name         WME Addons
// @version      Beta-1.9
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

                                      const SCRIPT_VERSION = "Beta-1.9";
  const LAYERS_WITH_OPACITY = [
    "Geoportal - ulice",
    "Geoportal - OSM"
  ];




  
                              function showChangelog() {
alert(`Nowa wersja ${SCRIPT_VERSION} skryptu WME Addons!
Co nowego:
- Poprawki działania suwaków
- Poprawki wizualne`);
 }




  


  
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
      if (!layer) return;

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
            let checked = false;
    
            // Dla natywnego input
            if ('checked' in checkbox) {
                checked = checkbox.checked;
            }
            // Dla WME <wz-checkbox>
            else if (typeof checkbox.isChecked === "function") {
                checked = checkbox.isChecked();
            }
    
            slider.classList.toggle('hidden', !checked);
        };
    
        updateSliderVisibility();
        checkbox.addEventListener('change', updateSliderVisibility);
    }

      console.log("Geoportal addon: opacity slider added for", layerName);
    });
  }

  checkVersion();
  addStyles();
  waitForLayerAndUI();

})();
