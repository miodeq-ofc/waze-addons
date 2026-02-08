// ==UserScript==
// @name         WME Addons
// @version      1.1.7
// @author       miodeq
// @description  Addons for WME and other scripts
// @match        https://*.waze.com/*/editor*
// @match        https://*.waze.com/editor*
// @match        https://*.waze.com/map-editor*
// @match        https://*.waze.com/beta_editor*
// @run-at       document-end
// @grant        none
// @ copyright   Miodeq, Mateusz Tomaszek 2026
// @downloadURL  https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/script.user.js
// @updateURL    https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/script.user.js
// @icon         https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/logo.png
// ==/UserScript==

/* global W */
/* global $ */
/* global getWmeSdk */

const SCRIPT_VERSION = '1.1.7';
const COLOR_STORAGE_KEY = 'wme-addons-primary-color';
const DEFAULT_COLOR = '#33ccff';

(function () {
    'use strict';

    const LAYERS_WITH_OPACITY = ["Geoportal - ulice", "Geoportal - OSM"];
    let wmeSDK;

    // ---------- CSS VARIABLES ----------
    function initCssVariables() {
        const root = document.documentElement;

        if (!root.style.getPropertyValue('--primary')) {
            root.style.setProperty('--primary', DEFAULT_COLOR);
            root.style.setProperty('--primary_variant', DEFAULT_COLOR);
        }
    }

    function restoreColorFromStorage() {
        const saved = localStorage.getItem(COLOR_STORAGE_KEY);
        if (saved) {
            document.documentElement.style.setProperty('--primary', saved);
            document.documentElement.style.setProperty('--primary_variant', saved);
            updateChipColor(saved);
        }
    }

    // ---------- STYLES ----------
    function addStyles() {
        const style = document.createElement("style");
        style.textContent = `
        .geoportal-opacity-addon {
            width: 100%;
            margin-top: 4px;
            accent-color: var(--primary);
        }

        .geoportal-opacity-addon.hidden {
            display: none;
        }

        /* Border pod "by Miodeq" */
        #addons-settings > p {
            border-bottom: 1px solid var(--content_p1);
            padding-bottom: 4px; /* opcjonalnie, żeby nie przylegało */
            margin-bottom: 10px;
        }
    `;
        document.head.appendChild(style);
    }

    // ---------- SETTINGS TAB ----------
    function constructSettings() {
        if (!wmeSDK) return;

        wmeSDK.Sidebar.registerScriptTab().then(({ tabLabel, tabPane }) => {
            tabLabel.innerText = 'WME Addons';
            tabLabel.title = 'WME Addons Settings';

            tabPane.innerHTML = '<div id="addons-settings" style="margin:10px;"></div>';
            const scriptContentPane = $('#addons-settings');

            scriptContentPane.append('<h2 style="margin-top:0;">WME Addons</h2>');
            scriptContentPane.append(`<p>Version: ${SCRIPT_VERSION} · by Miodeq</p>`);

            const settingsDiv = $('<div style="margin-top:10px;"></div>');

            // --- Color Picker (NA GÓRZE) ---
            const colorDiv = $('<div style="margin-bottom:10px;"></div>');
            colorDiv.append('<h4>Theme color</h4>');

            const currentColor =
                  getComputedStyle(document.documentElement)
            .getPropertyValue('--primary')
            .trim() || DEFAULT_COLOR;

            const colorRow = $('<div style="display:flex; align-items:center; gap:8px;"></div>');

            const colorInput = $(`
           <input type="color"
           id="wme-addons-color-picker"
           value="${currentColor}">
        `);

            const resetButton = $(`
            <button type="button"
            style="padding:2px 6px; cursor:pointer;">
            Default
            </button>
        `);

            colorInput.on('input', () => {
                const color = colorInput.val();

                // Zmieniamy główny kolor
                document.documentElement.style.setProperty('--primary', color);
                document.documentElement.style.setProperty('--primary_variant', color);
                localStorage.setItem(COLOR_STORAGE_KEY, color);

                // Zmieniamy lekko ciemniejszy kolor dla chipów
                updateChipColor(color);
            });

            resetButton.on('click', () => {
                document.documentElement.style.setProperty('--primary', DEFAULT_COLOR);
                document.documentElement.style.setProperty('--primary_variant', DEFAULT_COLOR);

                colorInput.val(DEFAULT_COLOR);
                localStorage.removeItem(COLOR_STORAGE_KEY);

                updateChipColor(DEFAULT_COLOR);
            });

            colorRow.append(colorInput);
            colorRow.append(resetButton);
            colorDiv.append(colorRow);
            settingsDiv.append(colorDiv);

            // --- Vertical Toolbox ---
            settingsDiv.append('<h3>Settings</h3>');

            const toolboxDiv = $('<div style="margin-top:10px;"></div>');
            const toolboxCheckbox = $('<wz-checkbox id="vertical-toolbox">Vertical ToolBox</wz-checkbox>');
            toolboxDiv.append(toolboxCheckbox);
            settingsDiv.append(toolboxDiv);

            toolboxCheckbox.on('click', () => {
                const tb = document.getElementById('WMETB_NavBar');
                const tbSpan = document.getElementById('WMETB_NavBarSpan');
                const tooltips = document.getElementsByClassName('WMETBtooltip');
                if (!tb || !tbSpan) return;

                tb.style.display = 'flex';
                tb.style.alignItems = 'center';
                tb.style.justifyContent = 'center';
                tb.style.gap = '3px';

                if (toolboxCheckbox.prop('checked')) {
                    tb.style.flexDirection = 'row';
                    tb.style.width = 'auto';
                    tbSpan.textContent = 'Toolbox';

                    Array.from(tooltips).forEach(t => {
                        t.style.border = '';
                        t.style.borderBottom = '';
                    });
                } else {
                    tb.style.flexDirection = 'column';
                    tb.style.width = '30px';
                    tbSpan.textContent = 'TB';

                    Array.from(tooltips).forEach(t => {
                        t.style.border = 'none';
                        t.style.borderTop = '1px solid #8d8d8d';
                    });
                }

                Array.from(tb.children).forEach(child => {
                    if (child !== tbSpan) child.style.margin = '0 auto';
                });
            });

            // --- Features ---
            const featuresDiv = $('<div style="margin-top:15px;"></div>');
            featuresDiv.append('<h4>Features</h4>');
            featuresDiv.append(`
            <ul style="padding-left:20px;">
                <li>Geoportal - ulice: opacity slider</li>
                <li>Geoportal - OSM: opacity slider</li>
                <li>Custom theme color</li>
            </ul>
        `);

            scriptContentPane.append(settingsDiv);
            scriptContentPane.append(featuresDiv);
        });
    }

    // ---------- FUNKCJA POMOCNICZA DO CIEMNIEJSZEGO CHIPA ----------
    function updateChipColor(hexColor) {
        const rgb = hexToRgb(hexColor);
        if (rgb) {
            const darkerRgb = rgb.map(c => Math.floor(c * 0.7)); // 80% jasności
            document.documentElement.style.setProperty(
                '--wz-chip-checked-background-color',
                `rgb(${darkerRgb.join(',')})`
            );
        }
    }

    function hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) hex = hex.split('').map(h => h + h).join('');
        if (hex.length !== 6) return null;
        const bigint = parseInt(hex, 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }

    // ---------- OPACITY SLIDERS ----------
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

            slider.addEventListener("input", () => {
                layer.setOpacity(slider.value / 100);
            });

            targetLi.appendChild(slider);

            if (checkbox) {
                const updateVisibility = () => {
                    const checked =
                        checkbox.checked !== undefined
                            ? checkbox.checked
                            : checkbox.hasAttribute('checked');
                    slider.classList.toggle('hidden', !checked);
                };

                updateVisibility();
                checkbox.addEventListener('change', updateVisibility);
            }

            console.log("WME Addons: opacity slider added for", layerName);
        });
    }

    // ---------- BOOTSTRAP ----------
    function WMEAddons_bootstrap() {
        if (!document.getElementById('edit-panel') || !wmeSDK.State.isReady) {
            setTimeout(WMEAddons_bootstrap, 250);
            return;
        }
        constructSettings();
    }

    ('unsafeWindow' in window ? window.unsafeWindow : window).SDK_INITIALIZED.then(() => {
        wmeSDK = getWmeSdk({ scriptId: "wme-addons", scriptName: "WME Addons" });
        WMEAddons_bootstrap();
    });

    // ---------- START ----------
    initCssVariables();
    restoreColorFromStorage();
    addStyles();
    waitForLayerAndUI();

})();
