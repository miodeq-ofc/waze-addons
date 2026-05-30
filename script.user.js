// ==UserScript==
// @name         WME Addons
// @version      1.2.4
// @author       miodeq
// @description  Addons for WME and other scripts
// @include          https://www.waze.com/editor*
// @include          https://www.waze.com/*/editor*
// @include          https://beta.waze.com/editor*
// @include          https://beta.waze.com/*/editor*
// @exclude          https://www.waze.com/user*
// @exclude          https://www.waze.com/*/user*
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
/* global OpenLayers */

const SCRIPT_VERSION = '1.2.4';
const COLOR_STORAGE_KEY = 'wme-addons-primary-color';
const DEFAULT_COLOR = '#0099ff';

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

    let wmeSDK;

    // ---------- CSS VARIABLES ----------
    function initCssVariables() {
        const root = document.documentElement;

        if (!root.style.getPropertyValue('--primary')) {
            root.style.setProperty('--primary', DEFAULT_COLOR);
            root.style.setProperty('--primary_variant', DEFAULT_COLOR);
        }

        updateChipColor(
            getComputedStyle(root)
            .getPropertyValue('--primary')
            .trim() || DEFAULT_COLOR
        );
    }

    function restoreColorFromStorage() {
        const saved = localStorage.getItem(COLOR_STORAGE_KEY);
        if (saved) {
            document.documentElement.style.setProperty('--primary', saved);
            document.documentElement.style.setProperty('--primary_variant', saved);
            updateChipColor(saved);
        }
    }


    // ---- CHANGELOG ---- -----------------------------------------------------------------------------------

                                                        const CHANGELOG = [
                                                            "Geoportal addons has been removed because it is no longer supported",
                                                            "Other bug fixes"
                                                        ];

    // ---- --------------------------------------------------------------------------------------------------

    // ---------- STYLES ----------
    function addStyles() {
        const style = document.createElement("style");
        style.textContent = `

        #addons-settings > p {
            border-bottom: 1px solid var(--content_p1);
            padding-bottom: 4px;
            margin-bottom: 10px;
        }

        .counter--ZcIEX {
    background: var(--wz-chip-checked-background-color) !important;
}
/*
.list-item-card-icon {
    background: var(--primary);
    }
    */
.list-item-card-icon-yellow-500
{
    background-color: #ffc400;
}
.list-item-card-icon-orange-500 {
    background-color: #fd804b;
}
.list-item-card-icon-red-500 {
    background-color: #ff5252;
}
.titleWithIcon--Bxgz8>div:first-child {
     background: var(--primary) !important;
}

wz-user-box wz-caption {
    color: var(--primary) !important;
}
.container--wzXTu
{
    display: none !important;
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

.lock-help {
    position: relative;
    font-size: 17px;
    cursor: help;
    color: var(--primary);
    display: inline-flex;
    align-items: center;
    margin: 0px 0px 3px 7px;
}

.lock-help:hover {
   color: var(--content_p1);
}

.lock-help::after {
    content: "Shows segments with lower lock level than required for the current road type. Sync with Poland segments Locks Level and click the button next to the Save button to fix all visible on the map.";
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

    line-height: 1.4;
    text-align: center;

    white-space: normal;
    width: max-content;
    max-width: 160px;
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

.lock-help:hover::after {
    opacity: 1;
}

    `;
        document.head.appendChild(style);
    }

    function shouldHighlight(seg) {
        const attr = seg.attributes;

        function getEffectiveLock(attr) {
            if (attr.lockRank !== null && attr.lockRank !== undefined) {
                return attr.lockRank;
            }

            const rank = attr.rank ?? 0;

            if (rank === 0) return 0;
            if (rank === 1) return 1;
            if (rank === 2) return 2;

            return 0;
        }

        const lock = attr.lockRank ?? getEffectiveLock(attr);
        const roadType = attr.roadType;

        // Główna
        if (roadType === 2) return lock < 1;

        // Wojewódzka
        if (roadType === 7) return lock < 3;

        // Krajowa
        if (roadType === 6) return lock < 4;

        // Zjazd
        if (roadType === 4) return lock < 2;

        // Autostrada / ekspresowa
        if (roadType === 3) {
            const isToll = attr.fwdToll || attr.revToll;

            if (isToll) return lock < 5;
            return lock < 4;
        }

        // Tor
        if (roadType === 18) return lock < 2;

        return false;
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
settingsDiv.append('<h4>Settings</h4>');
const toolboxDiv = $('<div style="margin-top:10px; display:flex; flex-direction:column; gap:6px;"></div>');

// Vertical Toolbox checkbox
const toolboxCheckbox = $('<wz-checkbox id="vertical-toolbox">Vertical ToolBox</wz-checkbox>');
toolboxDiv.append(toolboxCheckbox);

// OPP Overlay checkbox
const oppOverlayCheckbox = $('<wz-checkbox id="opp-overlay-toggle">Show Average Speed Camera</wz-checkbox>');
toolboxDiv.append(oppOverlayCheckbox);

// LOCK Overlay checkbox
const lockOverlayCheckbox = $('<wz-checkbox id="lock-overlay-toggle">Show Low Locks Segments <i class="fa fa-question-circle lock-help"></i></wz-checkbox>');
toolboxDiv.append(lockOverlayCheckbox);

// Auto House Numbers row
const autoDomDiv = $(`
<div style="display:flex; align-items:center; gap:6px;">
    <wz-checkbox id="auto-dom-toggle" style="flex:1;">Auto House Numbers</wz-checkbox>
    <i class="fa fa-question-circle auto-dom-help"></i>
    <input type="number" id="auto-dom-timer" min="100" max="10000" step="100" value="2000"
        style="width:80px; font-size:13px;" title="Delay in ms"> ms
</div>
`);
toolboxDiv.append(autoDomDiv);


settingsDiv.append(toolboxDiv);


const OPP_STORAGE_KEY = 'wme-opp-overlay-enabled';
let OPP_ENABLED = localStorage.getItem(OPP_STORAGE_KEY) === 'true';
const LOCK_STORAGE_KEY = 'wme-lock-overlay-enabled';
let LOCK_ENABLED = localStorage.getItem(LOCK_STORAGE_KEY) === 'true';
oppOverlayCheckbox.prop('checked', OPP_ENABLED);
lockOverlayCheckbox.prop('checked', LOCK_ENABLED);

// ---------- OPP Overlay Function ----------
function initOPPOverlay() {
    if (!window.W || !W.map || !W.model) {
        setTimeout(initOPPOverlay, 500);
        return;
    }

    if (!OPP_ENABLED) {
        window.OPP_LAYER_INSTANCE?.removeAllFeatures();
        return;
    }

    if (!window.OPP_LAYER_INSTANCE) {
        window.OPP_LAYER_INSTANCE = new OpenLayers.Layer.Vector("OPP Overlay Layer");
        W.map.addLayer(window.OPP_LAYER_INSTANCE);
    }

    const layer = window.OPP_LAYER_INSTANCE;

    function scan() {
        if (!layer || !OPP_ENABLED) {
            layer?.removeAllFeatures();
            return;
        }

        layer.removeAllFeatures();

        const zoom = W.map.getZoom();
        const iconSize = zoom >= 17 ? 50 : 40;

        const segments = Object.values(W.model.segments.objects);

        segments.forEach(seg => {
            const geom = seg.getOLGeometry();
            if (!geom) return;
            const points = geom.getVertices();
            const attr = seg.attributes;

            const isOPP =
                ((attr.fwdFlags === 1 || attr.fwdFlags === 5) && attr.fwdDirection) ||
                ((attr.revFlags === 1 || attr.revFlags === 5) && attr.revDirection);
            if (!isOPP) return;

            // LINES OPP
            const lineFeature = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.LineString(points),
                null,
                { strokeColor: "#0000FF", strokeWidth: 15, strokeOpacity: 0.4, graphicZIndex: 3000 }
            );
            layer.addFeatures([lineFeature]);

            // IMG  OPP
            const interval = 10;
            for (let i = 0; i < points.length; i += interval) {
                const pointFeature = new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.Point(points[i].x, points[i].y),
                    null,
                    {
                        externalGraphic: "https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/files/opp.png",
                        graphicWidth: iconSize,
                        graphicHeight: iconSize,
                        graphicXOffset: -iconSize/2,
                        graphicYOffset: -iconSize/2,
                        graphicOpacity: 1,
                        graphicZIndex: 9999999999
                    }
                );
                layer.addFeatures([pointFeature]);
            }
        });
    }

    scan();
    W.map.events.register("moveend", null, scan);
    W.map.events.register("zoomend", null, scan);
}

// ---------- LOCK Overlay Function ----------
function initLockOverlay() {
    if (!window.W || !W.map || !W.model) {
        setTimeout(initLockOverlay, 500);
        return;
    }

    if (!LOCK_ENABLED) {
        window.LOCK_LAYER_INSTANCE?.removeAllFeatures();
        return;
    }

    if (!window.LOCK_LAYER_INSTANCE) {
        window.LOCK_LAYER_INSTANCE = new OpenLayers.Layer.Vector("LOCK Overlay Layer");
        W.map.addLayer(window.LOCK_LAYER_INSTANCE);
    }

    const layer = window.LOCK_LAYER_INSTANCE;

    function scan() {
        if (!layer || !LOCK_ENABLED) {
            layer?.removeAllFeatures();
            return;
        }

        layer.removeAllFeatures();

        const segments = Object.values(W.model.segments.objects);

        segments.forEach(seg => {
            const geom = seg.getOLGeometry();
            if (!geom) return;

            if (!shouldHighlight(seg)) return;

            const points = geom.getVertices();

            const lineFeature = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.LineString(points),
                null,
                {
                    strokeColor: "#ff0000",
                    strokeWidth: 15,
                    strokeOpacity: 0.4,
                    graphicZIndex: 3000
                }
            );
            layer.addFeatures([lineFeature]);

            // ICON
            const zoom = W.map.getZoom();
            const iconSize = zoom >= 17 ? 50 : 40;

            if (points.length > 0) {
                const midIndex = Math.floor(points.length / 2);
                const midPoint = points[midIndex];

                const pointFeature = new OpenLayers.Feature.Vector(
                    new OpenLayers.Geometry.Point(midPoint.x, midPoint.y),
                    null,
                    {
                        externalGraphic: "https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/files/lock.png",
                        graphicWidth: iconSize,
                        graphicHeight: iconSize,
                        graphicXOffset: -iconSize / 2,
                        graphicYOffset: -iconSize / 2,
                        graphicOpacity: 0.9,
                        graphicZIndex: 99999999999999999999999
                    }
                );

                layer.addFeatures([pointFeature]);
            }

        });
    }

    scan();
    W.map.events.register("moveend", null, scan);
    W.map.events.register("zoomend", null, scan);
}

// ---------- Checkbox Event ----------
oppOverlayCheckbox.on('change', () => {
    OPP_ENABLED = oppOverlayCheckbox.prop('checked');
    localStorage.setItem(OPP_STORAGE_KEY, OPP_ENABLED ? 'true' : 'false');

    if (OPP_ENABLED) {
        ('unsafeWindow' in window ? window.unsafeWindow : window).SDK_INITIALIZED.then(() => {
            initOPPOverlay();
        });
    } else {
        window.OPP_LAYER_INSTANCE?.removeAllFeatures();
    }
});


lockOverlayCheckbox.on('change', () => {
    LOCK_ENABLED = lockOverlayCheckbox.prop('checked');
    localStorage.setItem(LOCK_STORAGE_KEY, LOCK_ENABLED ? 'true' : 'false');

    if (LOCK_ENABLED) {
        ('unsafeWindow' in window ? window.unsafeWindow : window).SDK_INITIALIZED.then(() => {
            initLockOverlay();

            setTimeout(addLockFixButton, 300);
        });
    } else {
        window.LOCK_LAYER_INSTANCE?.removeAllFeatures();

        removeLockFixButton();
    }
});

// ---------- Auto enable on load ----------
if (OPP_ENABLED) {
    ('unsafeWindow' in window ? window.unsafeWindow : window).SDK_INITIALIZED.then(() => {
        initOPPOverlay();
    });
}
if (LOCK_ENABLED) {
    ('unsafeWindow' in window ? window.unsafeWindow : window).SDK_INITIALIZED.then(() => {
        initLockOverlay();

        setTimeout(addLockFixButton, 500);
    });
}




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
                <li>Custom theme color</li>
                <li>Auto House nuber with own delay</li>
                <li>Lower Lock Segments Highlighter – fix them in one click</li>
                <li>Show segments with Speed Camera</li>
            </ul>
        `);

            scriptContentPane.append(settingsDiv);
            scriptContentPane.append(featuresDiv);
        });
    }

    function updateChipColor(hexColor) {
        const rgb = hexToRgb(hexColor);
        if (rgb) {
            const darkerRgb = rgb.map(c => Math.floor(c * 0.7));
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


    // ---------- LOCAL VERSION ----------
    const VERSION_STORAGE_KEY = "wme-addons-installed-version";
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



// ---------- Auto toggle House  ----------
('unsafeWindow' in window ? window.unsafeWindow : window).SDK_INITIALIZED.then(() => {
    console.log('SDK initialized — attaching continuous auto DOM');

    let autoDomInterval = null;

    function isSegmentSelected() {
        return (
            W.selectionManager &&
            typeof W.selectionManager.hasSelectedFeatures === 'function' &&
            W.selectionManager.hasSelectedFeatures()
        );
    }

    function clickAddHouseNumber() {

        const btn = document.querySelector(
            '#segment-edit-general wz-button i.w-icon-home'
        );

        if (btn) {
            btn.closest("wz-button").click();
            return true;
        }


        const event = new KeyboardEvent("keydown", {
            key: "h",
            code: "KeyH",
            bubbles: true
        });

        document.dispatchEvent(event);

        return true;
    }

    function waitForRHNInputAndFocus(callback, timeout = 800) {
        const start = Date.now();
        function check() {
            const nextInput = document.querySelector("input.rapidHN.next");
            if (nextInput) {
                setTimeout(callback, 50);
                return;
            }
            if (Date.now() - start > timeout) {
                callback();
                return;
            }
            requestAnimationFrame(check);
        }
        check();
    }

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() !== 'h') return;

        const checkbox = document.getElementById('auto-dom-toggle');
        if (!checkbox || !checkbox.checked) return;

        if (!isSegmentSelected()) {
            console.log('Auto DOM: no segment selected');
            return;
        }


        if (autoDomInterval) {
            clearInterval(autoDomInterval);
            autoDomInterval = null;
        }

        const timerInput = document.getElementById('auto-dom-timer');
        let delay = 2000;
        if (timerInput) {
            delay = parseInt(timerInput.value, 10);
            if (isNaN(delay) || delay < 100) delay = 100;
            if (delay > 10000) delay = 10000;
            delay = Math.round(delay / 100) * 100;
        }

        autoDomInterval = setInterval(() => {
            if (!isSegmentSelected()) {
                clearInterval(autoDomInterval);
                autoDomInterval = null;
                console.log('Auto DOM stopped — segment deselected');
                return;
            }

            waitForRHNInputAndFocus(() => {
                const clicked = clickAddHouseNumber();
                if (!clicked) console.log("Auto DOM: add button not found");
            });

        }, delay);
    });


function stopAutoDom(reason) {
    if (autoDomInterval) {
        clearInterval(autoDomInterval);
        autoDomInterval = null;

        console.log('Auto DOM stopped:', reason);

        // reset focus / RHN state
        const active = document.activeElement;
        if (active) active.blur();
    }
}

document.addEventListener('mousedown', () => {
    stopAutoDom('mouse click');
});

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        stopAutoDom('ESC');
    }
});

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && autoDomInterval) {
            clearInterval(autoDomInterval);
            autoDomInterval = null;
            console.log('Auto DOM stopped by ESC');
        }
    });
});
// ---------- LOCK FIX TOOL (Toolbox style) ----------

// określenie wymaganej blokady (ta sama logika co highlight)
function getRequiredLock(attr) {
    const roadType = attr.roadType;

    if (roadType === 2) return 1; // główna
    if (roadType === 7) return 3; // wojewódzka
    if (roadType === 6) return 4; // krajowa
    if (roadType === 4) return 2; // zjazd

    if (roadType === 3) {
        const isToll = attr.fwdToll || attr.revToll;
        return isToll ? 5 : 4;
    }

    if (roadType === 18) return 2;

    return null;
}

// główna akcja (jak toolbox)
async function runLockFix() {

    if (!window.W || !W.model) {
        alert("WME not ready");
        return;
    }

    const segments = Object.values(W.model.segments.objects);

    const groups = {};

    segments.forEach(seg => {

        const required = getRequiredLock(seg.attributes);
        const current = seg.attributes.lockRank ?? 0;

        if (required === null) return;
        if (current >= required) return;

        if (!groups[required]) {
            groups[required] = [];
        }

        groups[required].push(seg);
    });

    const levels = Object.keys(groups).map(Number).sort((a,b) => a-b);

    if (levels.length === 0) {
        alert("Nothing to fix");
        return;
    }

    let i = 0;

    function next() {

        if (i >= levels.length) {
            // alert("Done — remember to SAVE");
            return;
        }

        const level = levels[i];
        const segs = groups[level];


        W.selectionManager.clearSelectedModels?.();
        W.selectionManager.setSelectedModels(segs);

        setTimeout(() => {


            const chip = document.querySelector(
                `wz-checkable-chip#lockRank-${level}`
            );

            if (!chip) {
                console.warn("Missing chip:", level);
                i++;
                return next();
            }

            chip.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true
            }));

            i++;
            setTimeout(next, 300);

        }, 300);
    }

    next();
}


function addLockFixButton() {

    const toolbar = document.querySelector('.secondary-toolbar');
    if (!toolbar) return;

    if (document.getElementById('fix-locks-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'fix-locks-btn';

    // usuń tekst
    btn.innerText = '';

    // styl (opcjonalnie żeby wyglądało jak ikonka)
    btn.style.width = '40px';
    btn.style.height = '40px';
    btn.style.padding = '0';
    btn.style.border = 'none';
    btn.style.background = 'transparent';

    // obrazek
    const img = document.createElement('img');
    img.src = 'https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/files/lockbtn.png';
    img.style.width = '90%';
    img.style.height = '90%';

    btn.appendChild(img);

    btn.onclick = runLockFix;


    const children = Array.from(toolbar.children);


    const insertIndex = Math.max(children.length - 3, 0);


    const referenceNode = children[insertIndex];

    toolbar.insertBefore(btn, referenceNode);
}


function removeLockFixButton() {
    const btn = document.getElementById('fix-locks-btn');
    if (btn) btn.remove();
}
})();
