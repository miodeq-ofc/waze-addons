// ==UserScript==
// @name         WME Addons
// @version      1.1
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

/* global W */
/* global $ */
/* global getWmeSdk */

const SCRIPT_VERSION = '1.1';

(function () {
    'use strict';

    const LAYERS_WITH_OPACITY = ["Geoportal - ulice", "Geoportal - OSM"];
    let wmeSDK;

    // ---------- STYLES (BRAKOWAŁO – TO BYŁ BUG) ----------
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
            settingsDiv.append('<h3>Settings</h3>');

            const toolboxDiv = $('<div style="margin-top:10px;"></div>');
            const toolboxCheckbox = $('<wz-checkbox id="horizontal-toolbox">Horizontal ToolBox</wz-checkbox>');
            toolboxDiv.append(toolboxCheckbox);
            settingsDiv.append(toolboxDiv);

            toolboxCheckbox.on('click', () => {
                const tb = document.getElementById('WMETB_NavBar');
                const tbSpan = document.getElementById('WMETB_NavBarSpan');
                if (!tb || !tbSpan) return;

                tb.style.display = 'flex';
                tb.style.alignItems = 'center';
                tb.style.justifyContent = 'center';
                tb.style.gap = '3px';

                if (toolboxCheckbox.prop('checked')) {
                    tb.style.flexDirection = 'row';
                    tb.style.width = 'auto';
                    tbSpan.textContent = 'Toolbox';
                } else {
                    tb.style.flexDirection = 'column';
                    tb.style.width = '30px';
                    tbSpan.textContent = 'TB';
                }

                Array.from(tb.children).forEach(child => {
                    if (child !== tbSpan) child.style.margin = '0 auto';
                });
            });

            const featuresDiv = $('<div style="margin-top:15px;"></div>');
            featuresDiv.append('<h4>Features</h4>');
            featuresDiv.append(`
                <ul style="padding-left:20px;">
                    <li>Geoportal - ulice: opacity slider</li>
                    <li>Geoportal - OSM: opacity slider</li>
                </ul>
            `);

            scriptContentPane.append(settingsDiv);
            scriptContentPane.append(featuresDiv);
        });
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
    addStyles();
    waitForLayerAndUI();

})();
