// ==UserScript==
// @name         WME Addons
// @version      1.1.12
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

const SCRIPT_VERSION = '1.1.12';
const COLOR_STORAGE_KEY = 'wme-addons-primary-color';
const DEFAULT_COLOR = '#33ccff';

(function () {
    'use strict';

    // --- Load Font Awesome if not present ---
if (!document.querySelector('link[data-wme-addons-fa]')) {
    const fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css';
    fa.setAttribute('data-wme-addons-fa', 'true');
    document.head.appendChild(fa);
}

    const LAYERS_WITH_OPACITY = [
        "Geoportal - ortofoto",
        "Geoportal - ortofotomapy o wysokiej rozdzielczości",
        "Geoportal - OSM",
        "Geoportal - ulice",
        "Geoportal - place",
        "Geoportal - miejsce",
        "Geoportal - adresy, place i ulice w jednym",
        "Geoportal - drogi",
        "Geoportal - podział adm"
    ];
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


        #addons-settings > p {
            border-bottom: 1px solid var(--content_p1);
            padding-bottom: 4px;
            margin-bottom: 10px;
        }

.auto-dom-help {
    position: relative;
    font-size: 17px;
    cursor: help;
    color: var(--primary);
    display: inline-flex;
    align-items: center;
}

.auto-dom-help:hover {
   color: var(--content_p1);
}

.auto-dom-help::after {
    content: "Enable the checkbox, select a segment, and set the delay (ms). The script will automatically place a new house number at the specified interval instead of repeatedly pressing H. Works better with WME Rapid House Numbers.";
    position: absolute;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);

    background: var(--background_default);
    color: var(--content_p1);
    padding: 6px 8px;
    border-radius: 6px;

    font-family: sans-serif;
    font-weight: normal;
    font-size: 12px;
    text-transform: none;
    letter-spacing: normal;

    line-height: 1.4;
    text-align: center;

    white-space: normal;
    width: max-content;
    max-width: 230px;
    overflow-wrap: break-word;
    -webkit-box-shadow: 0px 0px 40px 5px rgba(0, 0, 0, 1);
    -moz-box-shadow: 0px 0px 40px 5px rgba(0, 0, 0, 1);
    box-shadow: 0px 0px 40px 5px rgba(0, 0, 0, 1);

    border: 1px solid var(--primary);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 9999;
}

.auto-dom-help:hover::after {
    opacity: 1;
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

            // --- Color Picker ---
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


                document.documentElement.style.setProperty('--primary', color);
                document.documentElement.style.setProperty('--primary_variant', color);
                localStorage.setItem(COLOR_STORAGE_KEY, color);

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

            // --- Auto toggle ---
            const autoDomDiv = $(`
    <div style="margin-top:6px; display:flex; align-items:center; gap:6px;">
        <wz-checkbox id="auto-dom-toggle" style="flex:1;">
            Auto House Numbers
        </wz-checkbox>

        <i class="fa fa-question-circle auto-dom-help"></i>

        <input type="number" id="auto-dom-timer"
            min="100" max="10000" step="100" value="2000"
            style="width:80px; font-size:13px;"
            title="Delay in ms, co 100ms"> ms
    </div>
`);
            toolboxDiv.append(autoDomDiv);




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
                <li>Add opacity sliders for Geoportal layers</li>
                <li>Custom theme color</li>
                <li>Auto House nuber with own delay</li>
            </ul>
        `);

            scriptContentPane.append(settingsDiv);
            scriptContentPane.append(featuresDiv);
        });
    }

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


    // ---------- LOCAL VERSION ----------
    const VERSION_STORAGE_KEY = "wme-addons-installed-version";
    // ----

    // ---- CHANGELOG ----

    const CHANGELOG = [
        "Improved auto house numbers feature",
        "Added tooltip hint for auto house numbers",
        "Bug fixes"
    ];

    // ----

    function checkLocalVersion() {
        const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);

        if (storedVersion !== SCRIPT_VERSION) {
            showUpdatePopup();
            localStorage.setItem(VERSION_STORAGE_KEY, SCRIPT_VERSION);
        }
    }

    function showUpdatePopup() {
        const popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.top = "50%";
        popup.style.left = "50%";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.width = "360px";
        popup.style.background = "var(--background_default)";
        popup.style.border = "1px solid var(--primary)";
        popup.style.color = "var(--content_p1)";
        popup.style.padding = "16px";
        popup.style.zIndex = "9999999";
        popup.style.boxShadow = "0 6px 18px rgba(0,0,0,0.35)";
        popup.style.borderRadius = "10px";
        popup.style.fontSize = "14px";
        popup.style.webkitBoxShadow = "0px 0px 40px 5px rgba(0, 0, 0, 1)";
        popup.style.mozBoxShadow = "0px 0px 40px 5px rgba(0, 0, 0, 1)";
        popup.style.boxShadow = "0px 0px 40px 5px rgba(0, 0, 0, 1)";

        const changelogHTML = `
            <ul style="margin:8px 0 0 18px; padding:0;">
                ${CHANGELOG.map(item => `<li style="margin-bottom:4px;">${item}</li>`).join("")}
            </ul>
        `;

        popup.innerHTML = `
            <div style="position:absolute; top:8px; right:12px; cursor:pointer; font-weight:bold; font-size:16px;" id="wme-addons-update-close">✕</div>

            <div style="margin-bottom:8px;">
                <h3 style="margin:0;">WME Addons Updated!</h3>
                <div style="font-size:13px; opacity:0.8;">Version ${SCRIPT_VERSION}</div>
            </div>

            <div style="border-top:1px solid var(--primary); margin:10px 0;"></div>

            <div>
                <strong>What's new:</strong>
                ${changelogHTML}
            </div>
        `;

        document.body.appendChild(popup);

        document.getElementById("wme-addons-update-close").onclick = () => {
            popup.remove();
        };
    }

    setTimeout(checkLocalVersion, 1500);

     // ---------- AUTO ENABLE FEED SYNC ----------
    function forceEnableFeedSync() {

        const checkbox = document.querySelector('#feed-sync-with-map');

        if (!checkbox) return;

        const isChecked =
            checkbox.checked !== undefined
                ? checkbox.checked
                : checkbox.hasAttribute('checked');

        if (!isChecked) {

            console.log("WME Addons: Auto-enabling feed-sync-with-map");

            checkbox.checked = true;
            checkbox.setAttribute('checked', '');

            checkbox.dispatchEvent(new Event('input', { bubbles: true }));
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    function observeFeedSync() {

        const observer = new MutationObserver(() => {
            forceEnableFeedSync();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });


        setTimeout(forceEnableFeedSync, 1500);
    }


    ('unsafeWindow' in window ? window.unsafeWindow : window).SDK_INITIALIZED.then(() => {
        setTimeout(observeFeedSync, 1000);
    });


    // ---------- Auto toggle Hause ----------
    ('unsafeWindow' in window ? window.unsafeWindow : window).SDK_INITIALIZED.then(() => {
        console.log('SDK initialized — attaching auto DOM toggle with double selection check and timer input');

        let domTimer = null;

        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'h') {


                const checkbox = document.getElementById('auto-dom-toggle');
                if (!checkbox || !checkbox.checked) {

                    return;
                }

                const firstCheck =
                      W.selectionManager &&
                      typeof W.selectionManager.hasSelectedFeatures === 'function' &&
                      W.selectionManager.hasSelectedFeatures();

                if (!firstCheck) {
                    console.log('H pressed but nothing is selected — skip DOM toggle');
                    return;
                }

                console.log('H pressed with selection — starting timer');

                if (domTimer) clearTimeout(domTimer);

                const timerInput = document.getElementById('auto-dom-timer');
                let delay = 2000;
                if (timerInput) {
                    delay = parseInt(timerInput.value, 10);
                    if (isNaN(delay) || delay < 100) delay = 100;
                    if (delay > 10000) delay = 10000;

                    delay = Math.round(delay / 100) * 100;
                }


                domTimer = setTimeout(() => {

                    const secondCheck =
                          W.selectionManager &&
                          typeof W.selectionManager.hasSelectedFeatures === 'function' &&
                          W.selectionManager.hasSelectedFeatures();

                    if (!secondCheck) {
                        console.log(`Segment not selected after ${delay}ms — DOM toggle cancelled`);
                        domTimer = null;
                        return;
                    }


                    const event = new KeyboardEvent('keydown', {
                        key: 'h',
                        code: 'KeyH',
                        keyCode: 72,
                        which: 72,
                        bubbles: true,
                        cancelable: true
                    });
                    document.dispatchEvent(event);
                    console.log(`DOM toggled automatically after ${delay}ms with segment still selected`);
                    domTimer = null;
                }, delay);
            }
        });


        document.addEventListener('mousedown', () => {
            if (domTimer) {
                clearTimeout(domTimer);
                domTimer = null;
                console.log('Timer cancelled by click');
            }
        });
    });

})();
