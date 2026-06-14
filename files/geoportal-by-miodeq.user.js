// ==UserScript==
// @name            WME Geoportal by Miodeq
// @version         1.0.4
// @description     Geoportal layers for WME
// @include         https://www.waze.com/editor*
// @include         https://www.waze.com/*/editor*
// @include         https://beta.waze.com/editor*
// @include         https://beta.waze.com/*/editor*
// @exclude         https://www.waze.com/user*
// @exclude         https://www.waze.com/*/user*
// @run-at          document-end
// @grant           none
// @copyright       2025-2026, Miodeq
// @downloadURL     https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/files/geoportal-by-miodeq.user.js
// @updateURL       https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/files/geoportal-by-miodeq.user.js
// @icon            https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/logo.png
// ==/UserScript==

/* global W, $, getWmeSdk, OpenLayers */

const SETTINGS_STORAGE_KEY = 'wme-geoportal-settings';

(function () {
    'use strict';

    let wmeSDK;

    // ---------- GEOPORTAL DATA ----------
    const GEOPORTAL_SERVICES = {
        orto: "https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/StandardResolution?",
        orto_high: "https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/HighResolution?",
        osm: "https://mapy.geoportal.gov.pl/wss/ext/OSM/BaseMap/service?",
        adresy: "https://mapy.geoportal.gov.pl/wss/ext/KrajowaIntegracjaNumeracjiAdresowej?request=GetMap&",
        rail: "https://mapy.geoportal.gov.pl/wss/service/sdi/Przejazdy/get?REQUEST=GetMap&",
        mileage: "https://mapy.geoportal.gov.pl/wss/ext/OSM/SiecDrogowaOSM?",
        topo: "https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaBazDanychObiektowTopograficznych?",
        parcels: "https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaEwidencjiGruntow?",
        border_city: "https://mapy.geoportal.gov.pl/wss/service/PZGIK/PRG/WMS/AdministrativeBoundaries?REQUEST=GetMap&",
        kompozycja: "https://mapy.geoportal.gov.pl/wss/service/pub/guest/kompozycja_BDOT10k_WMS/MapServer/WMSServer"
    };

    const GEOPORTAL_CATEGORIES = {
        "Ortofoto / OSM": ["Ortofoto", "Ortofoto szczegółowa", "OSM"],
        "Adresy i Ulice": ["Adresy", "Ulice", "Place"],
        "Podział Administracyjny": ["Podział administracyjny", "Miasta", "Gminy", "Powiaty", "Województwa", "Granica PL"],
        "Topografia": ["Drogi", "Przejazdy kolejowe", "Obiekty topograficzne"],
        "BDOT": ["BDOT - Gruntowa", "BDOT - Utwardzona", "BDOT - Twarda", "BDOT - Główna", "BDOT - W budowie", "BDOT - Jezdnia", "BDOT - Autostrada", "BDOT - Numer drogi"]
    };

    let GEOPORTAL_LAYERS = {};

    // ---------- HELPERS ----------
    function getGeoSettings() {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        return saved ? JSON.parse(saved) : { enabledLayers: {}, layerOpacity: {} };
    }

    function saveGeoSettings() {
        const settings = { enabledLayers: {}, layerOpacity: {} };
        Object.keys(GEOPORTAL_LAYERS).forEach(name => {
            settings.enabledLayers[name] = GEOPORTAL_LAYERS[name].isEnabled;
            settings.layerOpacity[name] = GEOPORTAL_LAYERS[name].opacity;
        });
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }

    function createGeoLayer(name, url, layers, format = "image/png", options = {}) {
        const settings = getGeoSettings();
        const proj900913 = new window.OpenLayers.Projection("EPSG:900913");
        const proj4326 = new window.OpenLayers.Projection("EPSG:4326");

        const layerObj = {
            isEnabled: settings.enabledLayers[name] || false,
            opacity: settings.layerOpacity[name] ?? 1.0,
            zIndex: options.zIndex || 2050,
            instance: null,
            setVisibility: function(v) {
                this.isEnabled = v;
                if (v) this.getInstance().setVisibility(true);
                else if (this.instance) this.instance.setVisibility(false);
            },
            setOpacity: function(o) {
                this.opacity = o;
                if (this.instance) this.instance.setOpacity(o);
            },
            getInstance: function() {
                if (!this.instance) {
                    const self = this;
                    this.instance = new window.OpenLayers.Layer.WMS(name, url, {
                        layers, transparent: "true", format, version: "1.3.0"
                    }, {
                        isBaseLayer: false, visibility: false,
                        singleTile: options.singleTile !== undefined ? options.singleTile : true,
                        transitionEffect: "resize",
                        getURL: function(bounds) {
                            const currentZoom = window.W.map.getZoom();
                            if (options.minZ !== undefined && currentZoom < options.minZ) return null;

                            let b = bounds.clone();
                            b = this.adjustBounds(b);
                            const imageSize = this.getImageSize(b);
                            b.transform(proj900913, proj4326);

                            return this.getFullRequestString({
                                BBOX: b.toArray(true),
                                WIDTH: imageSize.w,
                                HEIGHT: imageSize.h
                            });
                        },
                        getFullRequestString: function(params) {
                            this.params.CRS = "EPSG:4326";
                            return window.OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(this, arguments);
                        }
                    });
                    this.instance.setOpacity(this.opacity);
                    window.W.map.addLayer(this.instance);
                }
                return this.instance;
            }
        };
        GEOPORTAL_LAYERS[name] = layerObj;
    }

    // ---------- STYLES ----------
    function addStyles() {
        const style = document.createElement("style");
        style.textContent = `
            .geo-layer-slider-container {
                padding-left: 30px;
                padding-bottom: 10px;
                display: none;
                align-items: center;
                width: 100%;
                box-sizing: border-box;
            }
            .geo-layer-slider-container.visible {
                display: flex;
            }
            .geo-opacity-slider {
                flex: 1;
                height: 6px;
                cursor: pointer;
                accent-color: var(--primary, #0099ff);
                background: var(--content_p1, #ccc);
                margin-top: 4px;
            }
            .geo-cat-title {
                font-size: 10px;
                color: var(--primary, #0099ff);
                padding: 5px 10px;
                font-weight: bold;
                opacity: 0.7;
                text-transform: uppercase;
            }
        `;
        document.head.appendChild(style);
    }

    // ---------- LAYER SWITCHER INTEGRATION ----------
    function injectIntoWmeLayerSwitcher(retries = 0) {
        if (retries > 100) return;

        const mainList = document.querySelector('#layer-switcher-region .scrollable ul') ||
                         document.querySelector('.layer-switcher .menu .scrollable ul');

        if (!mainList) {
            setTimeout(() => injectIntoWmeLayerSwitcher(retries + 1), 1000);
            return;
        }

        if (document.getElementById('geoportal-layers-group')) return;

        let groupLi = document.createElement('li');
        groupLi.id = 'geoportal-layers-group';
        groupLi.className = 'group--Ba0d7';
        mainList.appendChild(groupLi);

        const headerDiv = document.createElement('div');
        headerDiv.className = 'treeCategory--f0IJf';
        headerDiv.innerHTML = `
            <wz-button color="clear-icon" size="xs" type="button">
                <i class="toggleCategoryIcon--NttVA w-icon w-icon-caret-down"></i>
            </wz-button>
            <label class="groupLabel--o5_5n">Geoportal by Miodeq</label>
        `;
        groupLi.appendChild(headerDiv);

        const collapsibleArea = document.createElement('div');
        collapsibleArea.className = 'collapsibleArea--OCUtN';
        collapsibleArea.setAttribute('aria-expanded', 'true');

        const groupList = document.createElement('ul');
        groupList.className = 'groupList--FtndS';

        const layersWithSliders = ["Ortofoto", "Ortofoto szczegółowa", "OSM", "Ulice"];

        Object.entries(GEOPORTAL_CATEGORIES).forEach(([catName, layerNames]) => {
            const catLabel = document.createElement('li');
            catLabel.innerHTML = `<div class="geo-cat-title">${catName}</div>`;
            groupList.appendChild(catLabel);

            layerNames.forEach(lName => {
                const lData = GEOPORTAL_LAYERS[lName];
                if (!lData) return;

                const li = document.createElement('li');

                const selectorDiv = document.createElement('div');
                selectorDiv.className = 'layer-selector';

                const checkbox = document.createElement('wz-checkbox');
                checkbox.className = 'layer-selector-sdk-checkbox';
                checkbox.checked = lData.isEnabled;

                const labelDiv = document.createElement('div');
                labelDiv.className = 'layer-selector-container';
                labelDiv.innerText = lName;

                checkbox.appendChild(labelDiv);

                let sliderDiv = null;
                if (layersWithSliders.includes(lName)) {
                    sliderDiv = document.createElement('div');
                    sliderDiv.className = 'geo-layer-slider-container';
                    if (lData.isEnabled) sliderDiv.classList.add('visible');

                    const slider = document.createElement('input');
                    slider.type = 'range';
                    slider.className = 'geo-opacity-slider';
                    slider.min = "0";
                    slider.max = "100";
                    slider.value = (lData.opacity * 100).toString();

                    slider.oninput = (e) => {
                        const val = parseInt(e.target.value) / 100;
                        lData.setOpacity(val);
                        if (val > 0 && !lData.isEnabled) {
                            checkbox.checked = true;
                            lData.setVisibility(true);
                        }
                        saveGeoSettings();
                    };

                    sliderDiv.appendChild(slider);
                }

                checkbox.onchange = (e) => {
                    const isChecked = e.target.checked;
                    lData.setVisibility(isChecked);
                    saveGeoSettings();
                    if (sliderDiv) {
                        sliderDiv.classList.toggle('visible', isChecked);
                    }
                };

                selectorDiv.appendChild(checkbox);
                li.appendChild(selectorDiv);

                if (sliderDiv) {
                    li.appendChild(sliderDiv);
                }

                groupList.appendChild(li);
            });
        });

        collapsibleArea.appendChild(groupList);
        groupLi.appendChild(collapsibleArea);

        headerDiv.onclick = () => {
            const isExpanded = collapsibleArea.getAttribute('aria-expanded') === 'true';
            collapsibleArea.setAttribute('aria-expanded', !isExpanded);
            collapsibleArea.style.display = isExpanded ? 'none' : 'block';
        };
    }

    // ---------- BOOTSTRAP ----------
    function Geoportal_bootstrap() {
        if (!document.getElementById('edit-panel') || !wmeSDK.State.isReady) {
            setTimeout(Geoportal_bootstrap, 250);
            return;
        }

        createGeoLayer("Ortofoto", GEOPORTAL_SERVICES.orto, "Raster", "image/jpeg", { minZ: 0, singleTile: false, zIndex: 0 });
        createGeoLayer("Ortofoto szczegółowa", GEOPORTAL_SERVICES.orto_high, "Raster", "image/jpeg", { minZ: 14, singleTile: false, zIndex: 0 });
        createGeoLayer("OSM", GEOPORTAL_SERVICES.osm, "osm", "image/png", { zIndex: 0 });

        createGeoLayer("Adresy", GEOPORTAL_SERVICES.adresy, "prg-adresy", "image/png", { zIndex: 10000 });
        createGeoLayer("Ulice", GEOPORTAL_SERVICES.adresy, "prg-ulice", "image/png", { zIndex: 10000 });
        createGeoLayer("Place", GEOPORTAL_SERVICES.adresy, "prg-place", "image/png", { zIndex: 10000 });
        createGeoLayer("Przejazdy kolejowe", GEOPORTAL_SERVICES.rail, "PMT_Linie_Kolejowe_Sp__z_o_o_", "image/png", { zIndex: 10000 });
        createGeoLayer("Drogi", GEOPORTAL_SERVICES.mileage, "planowane,wbudowie,pikietaz,drugorzedne,glowne,ekspresowe,autostrady", "image/png", { zIndex: 10000 });
        createGeoLayer("Podział administracyjny", GEOPORTAL_SERVICES.parcels, "dzialki,numery_dzialek", "image/png", { zIndex: 10000 });
        createGeoLayer("Miasta", GEOPORTAL_SERVICES.border_city, "A04_Granice_miast", "image/png", { zIndex: 10000 });
        createGeoLayer("Gminy", GEOPORTAL_SERVICES.border_city, "A03_Granice_gmin", "image/png", { zIndex: 10000 });
        createGeoLayer("Powiaty", GEOPORTAL_SERVICES.border_city, "A02_Granice_powiatow", "image/png", { zIndex: 10000 });
        createGeoLayer("Województwa", GEOPORTAL_SERVICES.border_city, "A01_Granice_wojewodztw", "image/png", { zIndex: 10000 });
        createGeoLayer("Granica PL", GEOPORTAL_SERVICES.border_city, "A00_Granice_panstwa", "image/png", { zIndex: 10000 });
        createGeoLayer("Obiekty topograficzne", GEOPORTAL_SERVICES.topo, "bdot", "image/png", { zIndex: 10000 });
        createGeoLayer("BDOT - Gruntowa", GEOPORTAL_SERVICES.kompozycja, "DrDGr,LGr", "image/png", { zIndex: 10000 });
        createGeoLayer("BDOT - Utwardzona", GEOPORTAL_SERVICES.kompozycja, "JDrLNUt", "image/png", { zIndex: 10000 });
        createGeoLayer("BDOT - Twarda", GEOPORTAL_SERVICES.kompozycja, "JDLNTw,JDrZTw", "image/png", { zIndex: 10000 });
        createGeoLayer("BDOT - Główna", GEOPORTAL_SERVICES.kompozycja, "JDrG", "image/png", { zIndex: 10000 });
        createGeoLayer("BDOT - W budowie", GEOPORTAL_SERVICES.kompozycja, "DrEk", "image/png", { zIndex: 10000 });
        createGeoLayer("BDOT - Jezdnia", GEOPORTAL_SERVICES.kompozycja, "JDrEk", "image/png", { zIndex: 10000 });
        createGeoLayer("BDOT - Autostrada", GEOPORTAL_SERVICES.kompozycja, "JAu", "image/png", { zIndex: 10000 });
        createGeoLayer("BDOT - Numer drogi", GEOPORTAL_SERVICES.kompozycja, "NrDr", "image/png", { zIndex: 10000 });

        const geoS = getGeoSettings();
        Object.keys(GEOPORTAL_LAYERS).forEach(name => {
            if (geoS.enabledLayers[name]) {
                GEOPORTAL_LAYERS[name].setVisibility(true);
            }
        });

        const fixZIndex = () => {
            Object.values(GEOPORTAL_LAYERS).forEach(layer => {
                if (layer.instance && layer.isEnabled) {

                    layer.instance.setZIndex(layer.zIndex);
                }
            });
        };

        window.W.map.events.register("moveend", window.W.map, fixZIndex);
        setInterval(fixZIndex, 5000);

        injectIntoWmeLayerSwitcher();
    }

    ('unsafeWindow' in window ? window.unsafeWindow : window).SDK_INITIALIZED.then(() => {
        wmeSDK = getWmeSdk({ scriptId: "wme-geoportal", scriptName: "WME Geoportal" });
        Geoportal_bootstrap();
    });

    // ---------- START ----------
    addStyles();

})();
