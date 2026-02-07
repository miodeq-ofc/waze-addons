// ==UserScript==
// @name         WME Addons
// @namespace    https://github.com/miodeq-ofc/waze-addons
// @version      Beta-2.3
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
  'use strict';

  /******************************************************************
   * OPACITY SLIDERS FOR SELECTED LAYERS
   ******************************************************************/

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

  function initOpacitySliders() {
    if (
      !window.W ||
      !W.map ||
      !document.querySelector('#layer-switcher-region .menu .list-unstyled')
    ) {
      return setTimeout(initOpacitySliders, 1000);
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
          checkbox =
            li.querySelector('wz-checkbox') ||
            li.querySelector('input[type="checkbox"]');
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
          const checked =
            checkbox.checked !== undefined
              ? checkbox.checked
              : checkbox.hasAttribute('checked');

          slider.classList.toggle('hidden', !checked);
        };

        updateSliderVisibility();
        checkbox.addEventListener('change', updateSliderVisibility);
      }

      console.log("WME Addons: opacity slider added for", layerName);
    });
  }

  /******************************************************************
   * AUTO RESTORE EDITOR VISIBILITY
   ******************************************************************/

  function ensureEditorVisibility() {
    const wzButton = document.querySelector('wz-button[color="clear-icon"]');
    if (!wzButton || !wzButton.shadowRoot) return;

    const innerButton = wzButton.shadowRoot.querySelector('button');
    const invisibleIcon = wzButton.querySelector('i.w-icon-eye-off');

    if (invisibleIcon && innerButton) {
      console.log('WME Addons: editor invisible → restoring visibility');
      innerButton.click();
    }
  }

  function initVisibilityWatcher() {
    if (!window.W || !document.querySelector('wz-button[color="clear-icon"]')) {
      return setTimeout(initVisibilityWatcher, 1000);
    }

    // sprawdzaj co 5 sekund (bezpieczne)
    setInterval(ensureEditorVisibility, 5000);
  }

  /******************************************************************
   * INIT
   ******************************************************************/

  addStyles();
  initOpacitySliders();
  initVisibilityWatcher();

})();
