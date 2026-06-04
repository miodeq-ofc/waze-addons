// ==UserScript==
// @name               WME Addons
// @version            1.3.1
// @description        Addons for WME and other scripts
// @match              *://*.waze.com/*editor*
// @run-at             document-end
// @grant              none
// @copyright          Miodeq, Mateusz Tomaszek 2026
// @downloadURL        https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/script.user.js
// @updateURL          https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/script.user.js
// @icon               https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/logo.png
// ==/UserScript==

/* global W */
/* global $ */
/* global getWmeSdk */
/* global OpenLayers */

const SCRIPT_VERSION = '1.3.1';
const COLOR_STORAGE_KEY = 'wme-addons-primary-color';
const DEFAULT_COLOR = '#0099ff';
const DARK_MODE_STORAGE_KEY = 'wme-addons-dark-mode';

(function () {
    'use strict';

    // --- Load Font Awesome if not Qpresent ---


    let wmeSDK;

     // ---- CHANGELOG ---- -----------------------------------------------------------------------------------

    const CHANGELOG = [
        "Added dark mode! Change in script settings",
        "Other bug fixes"
    ];

    // ---- --------------------------------------------------------------------------------------------------

    // ---  Dark Mode Sync ---
    function applyDarkMode(isEnabled, source = 'script') {
        localStorage.setItem(DARK_MODE_STORAGE_KEY, isEnabled);
        if (isEnabled) {
            document.documentElement.setAttribute('wz-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('wz-theme');
        }


        const settingsCheck = document.getElementById('dark-mode-toggle');
        if (settingsCheck && source !== 'settings') {
            settingsCheck.checked = isEnabled;

            settingsCheck.dispatchEvent(new Event('change', { bubbles: true }));
        }


        const profileCheck = document.getElementById('wme-addons-profile-dark-mode');
        if (profileCheck && source !== 'profile') {
            profileCheck.checked = isEnabled;
        }
    }

    // --- color sync ---
    function applyThemeColor(color, source = 'script') {
        localStorage.setItem(COLOR_STORAGE_KEY, color);
        document.documentElement.style.setProperty('--primary', color);
        document.documentElement.style.setProperty('--primary_variant', color);
        updateChipColor(color);


        const settingsPicker = document.getElementById('wme-addons-color-picker');
        if (settingsPicker && source !== 'settings') {
            settingsPicker.value = color;
        }


        const profilePicker = document.getElementById('wme-addons-profile-color');
        if (profilePicker && source !== 'profile') {
            profilePicker.value = color;
        }
    }

    function initCssVariables() {
        const root = document.documentElement;
        const savedColor = localStorage.getItem(COLOR_STORAGE_KEY) || DEFAULT_COLOR;
        root.style.setProperty('--primary', savedColor);
        root.style.setProperty('--primary_variant', savedColor);
        updateChipColor(savedColor);
    }

function restoreColorFromStorage() {
    const saved = localStorage.getItem(COLOR_STORAGE_KEY);
    if (saved) {
        document.documentElement.style.setProperty('--primary', saved);
        document.documentElement.style.setProperty('--primary_variant', saved);
        updateChipColor(saved);
    }

    const darkEnabled = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
    applyDarkMode(darkEnabled);
}



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

/*
.user-info, .user-avatar, .highlight, .user-level
{
    color: var(--primary-darker);
}
.highlight-title-icon.points {

    background-image: none !important;


    background-color: var(--primary) !important;


    -webkit-mask-image: url('URL_IKONKI') !important;
    mask-image: url('URL_IKONKI') !important;


    -webkit-mask-size: contain !important;
    mask-size: contain !important;
    -webkit-mask-repeat: no-repeat !important;
    mask-repeat: no-repeat !important;
    -webkit-mask-position: center !important;
    mask-position: center !important;
}
*/



/* --- DARK MODE CSS START --- */
[wz-theme="dark"] {
--alarming: #ff9090;
--alarming_variant: #ff9090;
--always_white: #fefefe;
--always_black: #010101;
--always_dark: #1b1e24;
--always_dark_background_default: #1b1e24;
--always_dark_background_variant: #010101;
--always_dark_content_default: #e7e9ec;
--always_dark_content_p1: #d4d6da;
--always_dark_content_p2: #b8bbbE;
--always_dark_inactive: #565a5f;
--always_dark_surface_default: #3d4144;
--background_default: #1b1e24;
--background_modal: rgba(33,34,37,0.6);
--background_table_overlay: rgba(145,150,157,0.6);
--background_variant: #010101;
--brand_carpool: #1fe493;
--brand_waze: #34cefe;
--cautious: #fbe255;
--cautious_variant: #ffc500;
--content_default: #e7e9ec;
--content_p1: #d4d6da;
--content_p2: #b8bbbe;
--content_p3: #91969d;
--disabled_text: #73777e;
--hairline: #565a5f;
--hairline_strong: #73777e;
--handle: #d4d6da;
--hint_text: #91969d;
--ink_elevation: #e7e9ec;
--ink_on_primary: #fefefe;
--ink_on_primary_focused: hsla(0,0%,99%,0.12);
--ink_on_primary_hovered: hsla(0,0%,99%,0.04);
--ink_on_primary_pressed: hsla(0,0%,99%,0.1);
--leading_icon: #73777e;
--on_primary: #1b1e24;
--promotion_variant: #c189fe;
--report_chat: #1fe493;
--report_closure: #fdb97e;
--report_crash: #d4d6da;
--report_gas: #1cab51;
--report_hazard: #ffc500;
--report_jam: #ff5353;
--report_place: #c189fe;
--report_police: #1bb4fe;
--safe: #1fe493;
--safe_variant: #1fe493;
--separator_default: #3d4144;
--shadow_default: #010101;
--surface_alt: #19437d;
--surface_default: #3d4144;
--surface_variant: #3d4144;
--surface_variant_blue: #1b3a51;
--surface_variant_green: #204330;
--surface_variant_yellow: #4e431e;
--surface_variant_orange: #4d352d;
--surface_variant_red: #472a2d;
--surface_variant_purple: #3e295c;
background-color: var(--background_default);
color: var(--content_default);
color-scheme: dark;
}
#logo-waze-dark {
    height: 24px;
    width: auto;
    display: block;
    width: 175px;
}
[wz-theme="dark"] #logo-waze-dark {
    filter: invert(1);
}

[wz-theme="dark"] .leaflet-control-copyright {
    background-color: var(--background_default) !important;
    color: var(--content_p2) !important;
}
.leaflet-control-copyright a,.header-info a {
    color: var(--primary-darker) !important;
}
[wz-theme="dark"] .leaflet-control-zoom, [wz-theme="dark"] .leaflet-control-zoom a {
    background-color: var(--background_default) !important;
    border: 1px solid var(--hairline) !important;
    color: var(--primary-darker) !important;
}
 [wz-theme="dark"] .leaflet-control-zoom a:hover
{
background-color: #25282e !important;
}
.leaflet-container .leaflet-control.leaflet-control-layers input[type=checkbox]:checked+span::before
{
background-color: var(--primary-darker) !important;
border-color: var(--primary-darker) !important;
}
.leaflet-container .leaflet-control.leaflet-control-layers label>span::before
{
background-color: var(--background_default) !important;
border-color: var(--content_p2) !important;
}
[wz-theme="dark"] .issuesTrackerFooter--aPynT, [wz-theme="dark"] loadSection--ccfnj { background-color: var(--background_default)}
[wz-theme="dark"] body { background-color: var(--background_default); color: var(--content_p1); }
[wz-theme="dark"] .tab-content, [wz-theme="dark"] .layer-switcher .menu { background: var(--background_default); }
[wz-theme="dark"] h1, [wz-theme="dark"] h2, [wz-theme="dark"] h3, [wz-theme="dark"] h4, [wz-theme="dark"] h5, [wz-theme="dark"] h6, [wz-theme="dark"] .h1, [wz-theme="dark"] .h2, [wz-theme="dark"] .h3, [wz-theme="dark"] .h4, [wz-theme="dark"] .h5, [wz-theme="dark"] .h6 { color: var(--content_p1) !important; }
[wz-theme="dark"] .label-text { color: var(--content_p1) !important; }
[wz-theme="dark"] .mteListViewFooter--u_CxF, [wz-theme="dark"] .wz-map-ol-footer { background: var(--background_default); }
[wz-theme="dark"] a, [wz-theme="dark"] a.wz-map-black-link, [wz-theme="dark"] .wz-map-ol-control-span-mouse-position, [wz-theme="dark"] .wz-map-ol-control-attribution { color: var(--content_p1); }
[wz-theme="dark"] #sidebar .nav-tabs { background: var(--background_default); }
[wz-theme="dark"] #sidebar .nav-tabs li.active a { background: var(--always_dark_surface_default); }
[wz-theme="dark"] .nav>li>a:hover { background: var(--always_dark_inactive); }
[wz-theme="dark"] #sidebar .nav-tabs li a { color: var(--content_p1); }
[wz-theme="dark"] .issues-tracker-wrapper .issues-tracker-footer { background: var(--background_default); }
[wz-theme="dark"] #sidepanel-routespeeds, [wz-theme="dark"] #routespeeds-passes-label { color: var(--content_p1) !important; }
[w-theme="dark"] .waze-btn.waze-btn-blue { color: white !important; }
[wz-theme="dark"] input[type=text], [wz-theme="dark"] input[type=email], [wz-theme="dark"] input[type=number], [wz-theme="dark"] input[type=password], [wz-theme="dark"] select, [wz-theme="dark"] button, [wz-theme="dark"] textarea, [wz-theme="dark"] .form-control { color: var(--content_p2) !important; }
[wz-theme="dark"] .tts-playback .tippy-box[data-theme=tts-playback-tooltip] { background: var(--background_default); box-shadow: rgb(213, 215, 219) 0px 0px 0px 1px; }
[wz-theme="dark"] #environmentSelect, [wz-theme="dark"] .leaflet-control-layers-expanded { background-color: var(--background_default) !important; color: var(--content_p1); }
[wz-theme="dark"] .problem-edit .section .title { background-color: var(--always_dark_inactive); color: var(--content_p1); border-bottom: 1px solid var(--always_dark_surface_default); border-top: 1px solid var(--always_dark_surface_default); }
[wz-theme="dark"] .issue-panel-header .sub-title-and-actions { color: var(--content_p2); }
[wz-theme="dark"] .conversation-view .comment-list { border: 1px solid var(--always_dark_surface_default); }
[wz-theme="dark"] #filter-panel-region .issue-tracker-date-range-picker { background-color: black !important; }
[wz-theme="dark"] .container--wzXTu, [wz-theme="dark"] #filter-panel-region { background: var(--background_default); }
[wz-theme="dark"] #filter-panel-region { border: 1px solid var(--always_dark_surface_default); }
[wz-theme="dark"] [class^="container"]::after { background: var(--always_dark_surface_default); height: 2px; }
[wz-theme="dark"] [class^="changesLogContainer"] { background: var(--background_default); }
[wz-theme="dark"] .online-editors-bubble { --wz-button-background-color: var(--always_dark_surface_default); --wz-button-border: var(--always_dark_surface_default); }
[wz-theme="dark"] .online-editors-bubble:hover { --wz-button-background-color: var(--always_dark_inactive); --wz-button-border: var(--always_dark_surface_default); }
[wz-theme="dark"] .navigation-point-actions>wz-button { --wz-button-background-color: var(--always_dark_surface_default); --wz-button-border: var(--always_dark_surface_default); }
[wz-theme="dark"] .disallow-connections, [wz-theme="dark"] .allow-connections { --wz-button-background-color: var(--always_dark_surface_default); }
[wz-theme="dark"] [class^="bordered"] * { background-color: var(--background_default); }
[wz-theme="dark"] #sidebar .direction-lanes-edit input[name=laneCount] { background-color: black !important; }
[wz-theme="dark"] .lt-add-lanes.fwd, [wz-theme="dark"] .lt-add-lanes.rev { border: 1px solid #ffffff !important; color: var(--content_p2) !important; }
[wz-theme="dark"] .turn-angle-icon:after { filter: invert(1); }
[wz-theme="dark"] .nav-history-container, [wz-theme="dark"] .nav-history-container > div { background-color: var(--background_default) !important; }
[wz-theme="dark"] .history-header { background-color: var(--always_dark_background_default) !important; }
[wz-theme="dark"] .history-section { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .history-item-location { color: var(--content_p1) !important; }
[wz-theme="dark"] .history-item-time { color: var(--content_p2) !important; }
[wz-theme="dark"] .history-item-coords { color: var(--content_p3) !important; }
[wz-theme="dark"] .history-item:hover { background-color: var(--always_dark_background_default); }
[wz-theme="dark"] .history-item.current { background-color:rgb(0, 0, 0) !important; }
[wz-theme="dark"] .nav-history-container > div > b, [wz-theme="dark"] .nav-history-container > div > ul { color: var(--content_p1) !important; }
[wz-theme="dark"] .nav-tabs>li.active>a { background-color: var(--always_dark_inactive) !important; color: var(--content_p1) !important; }
[wz-theme="dark"] .s-button.s-button--mercury { background-color: var(--always_dark_surface_default); }
[wz-theme="dark"] #wpeWKT { background-color: var(--background_default) !important; box-shadow: var(--always_dark_inactive) 5px 5px 10px 4px !important; }
[wz-theme="dark"] #recent-edits .recent-edits-list .recent-edits-load-more { background-color: var(--background_default) !important; }
[wz-theme="dark"] .modal-content { background-color: var(--background_default) !important; border: 1px solid #999 !important; }
[wz-theme="dark"] .restriction-editing-region .restriction-editing-section .restriction-editing-container { background-color: var(--always_dark_surface_default); }
[wz-theme="dark"] .form-control { background: var(--always_dark_surface_default); }
[wz-theme="dark"] .timeframe-hours-controls { --background_variant: var(--always_dark_inactive); }
[wz-theme="dark"] .restriction-editing-region .timeframe-editing-region .timeframe-section-dates .datepicker { color: black !important; }
[wz-theme="dark"] .restrictions-summary .restrictions-table tr { background: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .restrictions-summary .restrictions-table th { background: var(--always_dark_inactive) !important; }
[wz-theme="dark"] .restrictions-summary .restriction-list-item:hover td { background: var(--always_dark_inactive) !important; }
[wz-theme="dark"] .turn-instructions-panel .exit-signs, [wz-theme="dark"] .turn-instructions-panel .turn-instructions, [wz-theme="dark"] .turn-instructions-panel .towards-instructions { background: var(--always_dark_surface_default); }
[wz-theme="dark"] .turn-instructions-panel .exit-sign-item, [wz-theme="dark"] .turn-instructions-panel .turn-instruction-item { background: var(--always_dark_surface_default); border: 1px dashed var(--always_dark_inactive); }
[wz-theme="dark"] .wz-tooltip-content-holder { background-color: var(--background_default); }
[wz-theme="dark"] .daterangepicker { background-color: var(--background_default) !important; border: 1px solid black; }
[wz-theme="dark"] .daterangepicker .calendar-table { background-color: var(--background_default); }
[wz-theme="dark"] .daterangepicker td.off { background-color: var(--background_default); color: var(--content_p1); }
[wz-theme="dark"] .daterangepicker td.active { background-color: #357ebd !important; }
[wz-theme="dark"] .daterangepicker .available { background-color: var(--always_dark_surface_default); }
[wz-theme="dark"] .daterangepicker td.today { background-color: var(--always_dark_surface_default); border: 2px solid var(--safe); }
[wz-theme="dark"] .daterangepicker .calendar-table .next span, [wz-theme="dark"] .daterangepicker .calendar-table .prev span { border: solid var(--content_p1); border-width: 0 2px 2px 0; }
[wz-theme="dark"] .house-number-marker { background: var(--background_default); }
[wz-theme="dark"] .house-numbers-layer .house-number .content .input-wrapper { background-color: var(--background_default) !important; }
[wz-theme="dark"] #urceDiv { background-color: var(--background_default) !important; box-shadow: 5px 5px 10px black !important; }
[wz-theme="dark"] .urceDivCloseButton { background-color: var(--surface_default) !important; box-shadow: 5px 5px 10px black !important; }
[wz-theme="dark"] .btn.btn-default { color: var(--content_p1); background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] #sidepanel-urc-e #panel-urce-comments .URCE-openLink { color: var(--content_p3) !important; }
[wz-theme="dark"] .URCE-span { color: var(--content_p1); }
[wz-theme="dark"] .urceToolsButton { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] #zoomOutLink1, [wz-theme="dark"] #zoomOutLink2, [wz-theme="dark"] #zoomOutLink3 { color: var(--content_p1) !important; }
[wz-theme="dark"] #map-viewport-overlay { background-color: var(--background_default); }
[wz-theme="dark"] #sidebar .overlay.editingDisabled { background-color: black; }
[wz-theme="dark"] .notifications-empty-container .centered-content .text, [wz-theme="dark"] .notification-content-container .notification-content-text-container .body { color: var(--content_p1) !important; }
[wz-theme="dark"] .city-name-marker, [wz-theme="dark"] #edit-panel .city-feature-editor .feature-editor-header { background-color: var(--background_default); }
[wz-theme="dark"] .city-name-marker:hover, [wz-theme="dark"] .city-name-marker.selected { color: black; }
[wz-theme="dark"] #WMEPH_services { background-color: white; }
[wz-theme="dark"] #WMEPH_banner .banner-row.gray { color: var(--content_p1) !important; background-color: var(--surface_default) !important; }
[wz-theme="dark"] #wmeph-hours-list { color: var(--content_p1) !important; background-color: var(--background_default) !important; }
[wz-theme="dark"] #WMEPH_banner .wmeph-btn { background-color: var(--background_default) !important; }
[wz-theme="dark"] .lock-edit-view>wz-label { background-color: var(--background_default); }
[wz-theme="dark"] .cs-group-label { color: var(--content_p1) !important; }
[wz-theme="dark"] .closure, [wz-theme="dark"] .closure-node-item { background: var(--background_default) !important; }
[wz-theme="dark"] .closure-item .dates { color: var(--content_p1) !important; }
[wz-theme="dark"] [class^="welcome_popup_container"] { background-color: var(--background_default); }
[wz-theme="dark"] [class^="welcome_popup_image"] { filter: invert(87%); }
[wz-theme="dark"] #map-message-container .snapshot-message .snapshot-mode-message { background: var(--background_default) !important; }
[wz-theme="dark"] #WWSU-Container, [wz-theme="dark"] .WWSU-script-item, [wz-theme="dark"] #WWSU-script-update-info { background-color: var(--background_default) !important; }
[wz-theme="dark"] .tb-tabContainer, [wz-theme="dark"] .tb-tab-tab { background-color: var(--background_default) !important; }
[wz-theme="dark"] .tb-tab-tab>img { filter: invert(100%); }
[wz-theme="dark"] .tb-feature-label-image { filter: invert(87%); }
[wz-theme="dark"] .ToolboxMeasurementTool { background-color: var(--background_default) !important; }
[wz-theme="dark"] #Country, [wz-theme="dark"] #State, [wz-theme="dark"] #City, [wz-theme="dark"] #Street { color: var(--content_p1) !important; }
[wz-theme="dark"] .ui-dialog-buttonset>button { background-color: var(--background_default) !important; color: var(--content_p1) !important; }
[wz-theme="dark"] .ui-widget-content, [wz-theme="dark"] .ui-state-default, [wz-theme="dark"] .ui-widget-content .ui-state-default, [wz-theme="dark"] .ui-widget-header .ui-state-default { color: var(--content_p1) !important; background: rgba(32, 33, 36, 0.60) !important; }
[wz-theme="dark"] .ui-widget-content a { color: var(--content_p1) !important; }
[wz-theme="dark"] .ui-widget-header, [wz-theme="dark"] #WMETB_NewVersionPanel { color: var(--content_p1) !important; background: var(--background_default) !important; }
[wz-theme="dark"] .ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-icon-only.ui-dialog-titlebar-close { background-color: var(--background_default) !important; color: var(--content_p1) !important; border: 1px solid var(--always_dark_inactive) !important; }
[wz-theme="dark"] .ui-widget-overlay { background: black !important; }
[wz-theme="dark"] #header { background-color: var(--background_default); }
[wz-theme="dark"] #header .user-headline .header-info { background-color: var(--always_dark_surface_default); }
[wz-theme="dark"] #recent-edits .recent-edits-list .recent-edits-list-header { background-color: var(--background_default); }
[wz-theme="dark"] #recent-edits .recent-edits-list .recent-edits-list-items .transaction-header { background-color: var(--always_dark_surface_default); }
[wz-theme="dark"] #recent-edits .recent-edits-list .recent-edits-list-items .transaction-header.active, [wz-theme="dark"] #recent-edits .recent-edits-list .recent-edits-list-items .transaction-header:hover { background-color: var(--always_dark_background_default); }
[wz-theme="dark"] #recent-edits .recent-edits-list .recent-edits-list-items .transaction-content { background-color: var(--always_black); }
[wz-theme="dark"] .type-icon { filter: invert(100%); }
[wz-theme="dark"] .map .leaflet-tile-pane { filter: grayscale(100%) brightness(0.8) contrast(160%) invert(77%); }
[wz-theme="dark"] #recent-edits .recent-edits-map-polygon { fill: white; }
[wz-theme="dark"] .sandbox .links a { color: var(--content_p1); }
[wz-theme="dark"] .sandbox .welcome-container { background-color: var(--background_default); }
[wz-theme="dark"] .list-item-card-title { color: var(--content_p1) !important; }
[wz-theme="dark"] .list-item-card wz-caption { color: var(--content_p2) !important; }
[wz-theme="dark"] .table-striped>tbody>tr:nth-of-type(odd) { background-color: var(--always_dark_surface_default); }
[wz-theme="dark"] .table-hover>tbody>tr:hover { background-color: var(--always_dark_inactive); }
[wz-theme="dark"] #outRSExpr { color: var(--content_p2); }
[wz-theme="dark"] #RSoperations>button, [wz-theme="dark"] #RSselection>button, [wz-theme="dark"] #btnRSSave { color: white !important; }
[wz-theme="dark"] .popup-pannel-trigger-class-FilterUR, [wz-theme="dark"] .popup-pannel-contents-closed-class-FilterUR, [wz-theme="dark"] .popup-pannel-contents-open-class-FilterUR, [wz-theme="dark"] .popup-pannel-trigger-class-FilterMP, [wz-theme="dark"] .popup-pannel-contents-closed-class-FilterM, [wz-theme="dark"] .popup-pannel-contents-open-class-FilterMP, [wz-theme="dark"] .popup-pannel-trigger-class-FilterMC, [wz-theme="dark"] .popup-pannel-contents-closed-class-FilterMC, [wz-theme="dark"] .popup-pannel-contents-open-class-FilterMC, [wz-theme="dark"] .popup-pannel-trigger-class-FilterPUR, [wz-theme="dark"] .popup-pannel-contents-closed-class-FilterPUR, [wz-theme="dark"] .popup-pannel-contents-open-class-FilterPUR { color: black !important; }
[wz-theme="dark"] .urt-table { color: var(--content_p1); }
[wz-theme="dark"] .urt-table thead, [wz-theme="dark"] .urt-table thead a, [wz-theme="dark"] .urt-table thead a:hover { color: black !important; }
[wz-theme="dark"] .urt-bg-highlighted, [wz-theme="dark"] .urt-bg-highlighted a, [wz-theme="dark"] .urt-bg-highlighted a:hover { color: black !important; }
[wz-theme="dark"] .urt-bg-ifollow { color: var(--content_p1); background-color: var(--always_dark_inactive) !important; }
[wz-theme="dark"] .urt-bg-selected, [wz-theme="dark"] .urt-bg-selected a, [wz-theme="dark"] .urt-bg-selected a:hover { color: black !important; }
[wz-theme="dark"] .urt-bg-newcomments { color: black !important; }
[wz-theme="dark"] #urt-a-export>img, [wz-theme="dark"] #urt-a-export-csv>img { filter: invert(100%); }
[wz-theme="dark"] #urt-progressBarInfo { color: black !important; }
[wz-theme="dark"] .wmeac-closuredialog, [wz-theme="dark"] .wmeac-closuredialog h1, [wz-theme="dark"] #wmeac-csv-closures-log:before, [wz-theme="dark"] #wmeac-csv-closures-preview:before { background-color: var(--background_default) !important; }
[wz-theme="dark"] .wmeac-closuredialog, [wz-theme="dark"] .wmeac-tab-pane, [wz-theme="dark"] .wmeac-nav-tabs>li>a, [wz-theme="dark"] .wmeac-nav-tabs>li:not(.active)>a, [wz-theme="dark"] #wmeac-csv-closures-preview, [wz-theme="dark"] #wmeac-csv-closures-log { border: 1px solid black !important; }
[wz-theme="dark"] .wmeac-nav-tabs>li:not(.active)>a { background-color: var(--always_dark_inactive) !important; }
[wz-theme="dark"] .wmeac-closuredialog button { background-color: var(--always_dark_inactive) !important; }
[wz-theme="dark"] .uroAlerts * { background-color: var(--background_default) !important; }
[wz-theme="dark"] #_tabURs, [wz-theme="dark"] #_tabMPs, [wz-theme="dark"] #_tabMCs, [wz-theme="dark"] #_tabRTCs, [wz-theme="dark"] #_tabRAs, [wz-theme="dark"] #_tabPlaces, [wz-theme="dark"] #_tabMisc, [wz-theme="dark"] #uroDiv { background-color: var(--background_default) !important; }
[wz-theme="dark"] #uroCommentCount>div { color: black !important; filter: invert(1); }
[wz-theme="dark"] #uroDiv { box-shadow: 5px 5px 10px black !important; }
[wz-theme="dark"] #gmPopupContainer { background-color: var(--background_default) !important; }
[wz-theme="dark"] .secondary-toolbar .toolbar-button { background-color: var(--background_default) !important; }
[wz-theme="dark"] #wecm-time-history-table { background: var(--always_dark_background_default); border: 1px solid var(--always_dark_inactive) !important; }
[wz-theme="dark"] #wecm-time-history-table table { background: var(--always_dark_background_default); color: white; border-collapse: collapse; }
[wz-theme="dark"] #wecm-time-history-table thead { background: var(--always_dark_inactive) !important; color: white !important; border-bottom: 1px solid var(--always_dark_inactive) !important; }
[wz-theme="dark"] #wecm-time-history-table th, [wz-theme="dark"] #wecm-time-history-table td { border-bottom: 1px solid var(--always_dark_inactive) !important; color: white !important; }
[wz-theme="dark"] #wecm-time-history-table tbody tr { background: var(--always_dark_background_default) !important; }
[wz-theme="dark"] #wecm-time-history-table tbody tr:nth-child(odd) { background: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] #wecm-time-history-table tbody tr:hover > td, [wz-theme="dark"] #wecm-time-history-table tbody tr:hover > th { background: var(--always_dark_inactive) !important; cursor: pointer; }
[wz-theme="dark"] #wecm-time-history-table .wecm-delete-session-btn { color: white !important; border: 1px solid var(--always_dark_surface_default) !important; transition: background 0.2s ease; }
[wz-theme="dark"] .wecm-total-summary { background: var(--always_dark_surface_default) !important; color: white !important; border: 1px solid var(--always_dark_inactive) !important; box-shadow: 0 1px 3px rgba(255, 255, 255, 0.1) !important; }
[wz-theme="dark"] #wecm-save-time-btn, [wz-theme="dark"] #wecm-clear-history-btn { color: white !important; }
[wz-theme="dark"] #wecm-count { color: var(--content_p1) !important; }
[wz-theme="dark"] #waze-logo {filter: invert(100%);}
[wz-theme="dark"] .external-provider-action { --wz-button-background-color: var(--always_dark_surface_default); }
[wz-theme="dark"] .aliases .alias-item-actions { --wz-button-background-color: var(--always_dark_surface_default); }
[wz-theme="dark"] .direction-lanes .lane-instruction .drawing .letter-circle { background-color: var(--background_default) !important; }
[wz-theme="dark"] #wmesct-container .ts-control, [wz-theme="dark"] .ts-control input, [wz-theme="dark"] .ts-dropdown { color: var(--content_p1) !important; }
[wz-theme="dark"] #wmesct-container .ts-dropdown { background-color: var(--background_default) !important; }
[wz-theme="dark"] .wmesct-clear-cities-button, [wz-theme="dark"] .waze-btn.waze-btn-green { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] #wmesct-container .ts-dropdown .option.active { background-color: black !important; }
[wz-theme="dark"] #WMEFUzoom, [wz-theme="dark"] #WMEFUzoom_zoomin, [wz-theme="dark"] #WMEFUzoom_zoomout { background-color: var(--background_default) !important; }
[wz-theme="dark"] #OpenLayers_Control_PanZoomBar_ZoombarOpenLayers_Map_136, [wz-theme="dark"] #WMEFUzoom_OpenLayers_Map_136 { background-color: var(--background_default) !important; }
[wz-theme="dark"] #abAlerts, [wz-theme="dark"] #abAlerts #header, [wz-theme="dark"] #abAlerts #content { background-color: var(--background_default) !important; box-shadow: black 5px 5px 10px !important; border-color: black !important; }
[wz-theme="dark"] #abAlertTickBtn { background-color: #3c4043 !important; }
[wz-theme="dark"] #RAUtilWindow, [wz-theme="dark"] #SSUtilWindow { background-color: var(--background_default) !important; }
[wz-theme="dark"] #rotationAmount, [wz-theme="dark"] #shiftAmount { color: white !important; }
[wz-theme="dark"] .e50 fieldset legend, [wz-theme="dark"] .e50 li a:hover, [wz-theme="dark"] .e50 li a.noaddress:hover { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .wme-ui-panel-container, [wz-theme="dark"] .wme-ui-close-panel, [wz-theme="dark"] .e50 li a.noaddress, [wz-theme="dark"] .e50 .wme-ui-body { background-color: var(--background_default) !important; }
[wz-theme="dark"] .wme-ui-close-panel:after { filter: invert(1.0); }
[wz-theme="dark"] legend { color: var(--content_p1) !important; }
[wz-theme="dark"] .waze-btn.waze-btn-white { background-color: var(--background_default) !important; }
[wz-theme="dark"] #edit-panel .control-label, [wz-theme="dark"] .edit-panel .control-label { color: var(--content_p1) !important; }
[wz-theme="dark"] #oslDragBar { background-color: var(--background_default) !important; box-shadow: black 5px 5px 10px !important; }
[wz-theme="dark"] #oslWindow { box-shadow: black 5px 5px 10px !important; border: 1px solid black !important; }
[wz-theme="dark"] #oslOSLDiv { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] #oslSelect, [wz-theme="dark"] #oslSegGeoUIDiv { background-color: var(--background_default) !important; }
[wz-theme="dark"] #oslGazTagsDiv, [wz-theme="dark"] #oslMLCDiv { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .geometries-cb-label { color: var(--content_p1) !important; }
[wz-theme="dark"] #routeTest>p>b { color: white !important; }
[wz-theme="dark"] a#goroutes { color: var(--content_p1) !important; }
[wz-theme="dark"] #routeTest a.step:hover { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] #routeTest p.route { background-color: var(--background_default) !important; }
[wz-theme="dark"] a.step span { color: white !important; }
[wz-theme="dark"] #routeTest a.step { color: var(--content_p1) !important; }
[wz-theme="dark"] c2821834349>input:disabled+label, [wz-theme="dark"] .c2821834349>input:disabled+label { color: var(--content_p1) !important; }
[wz-theme="dark"] .c3584528711>span, [wz-theme="dark"] .c2952996808, [wz-theme="dark"] .c2821834349>input:checked+label { background-color: var(--background_default) !important; }
[wz-theme="dark"] .c3336571891>span { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .c2821834349>label { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .c3210313671>button:disabled { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .tg .tg-header { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .ls-Wrapper { background-color: var(--background_default) !important; }
[wz-theme="dark"] .ls-Options-Dropdown-Menu { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .ls-Options-Dropdown-Menu li:hover, [wz-theme="dark"] .ls-Options-Menu:hover { background-color: var(--always_dark_inactive) !important; border: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .ls-Button { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] label.ls-Attr-Label { color: black; }
[wz-theme="dark"] a#lsConnectionStatus { background-color: var(--always_dark_inactive) !important; }
[wz-theme="dark"] .btn.btn-primary { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .wmech_closurebutton.wmech_presetdeletebutton { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .wmech_closurebutton.wmech_presetsavebutton { background-color: var(--background_default) !important; }
[wz-theme="dark"] .wmech-alert { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .nav-tabs>li>a:hover { background-color: var(--always_dark_inactive) !important; }
[wz-theme="dark"] #wmech_mteradiosdiv { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] div[id^="wmech_presetrow"] input[type="text"], [wz-theme="dark"] #wmech-settings-boxes input, [wz-theme="dark"] #wmech-settings-boxes #wmech_settingcustomcs { color: var(--content_p2) !important; }
[wz-theme="dark"] #uroAlerts, [wz-theme="dark"] #content { background-color: var(--background_default) !important; }
[wz-theme="dark"] wz-image-chip img { filter: invert(100%); }
[wz-theme="dark"] #WazeBarSettings, [wz-theme="dark"] .flex-column, [wz-theme="dark"] #Wazebar { background-color: var(--background_default) !important; color: var(--content_p2) !important; }
[wz-theme="dark"] #WazeBarAddCustomLink { background-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] #WazeBarSettings label, [wz-theme="dark"] .WazeBarText { color: var(--content_p2) !important; }
[wz-theme="dark"] #WazeBarSettings input[type='number'], [wz-theme="dark"] #WazeBarSettings input[type='text'], [wz-theme="dark"] #WazeBarSettings textarea, [wz-theme="dark"] #colorPickerForumFont, [wz-theme="dark"] #colorPickerWikiFont { background-color: var(--background_default) !important; border: 1px solid var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .styled-select, [wz-theme="dark"] .state-header { background: var(--always_dark_inactive) !important; }
[wz-theme="dark"] #WazeBarFavorites { background: var(--always_dark_inactive) !important; }
[wz-theme="dark"] .favorite-item, [wz-theme="dark"] .favorite-item a { background: var(--always_dark_surface_default) !important; color: var(--content_p2) !important; }
[wz-theme="dark"] #WazeBarFavoritesAddContainer input { background-color: var(--background_default) !important; }
[wz-theme="dark"] #WazeBarAddFavorite { background-color: var(--always_dark_surface_default) !important; border: 2px solid var(--always_dark_inactive) !important; }
[wz-theme="dark"] #WazeBarAddFavorite:hover { color: var(--content_p1) !important; background-color: var(--background_default) !important; border-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] #WazeBarAddCustomLink:hover { color: var(--content_p1) !important; background-color: var(--always_dark_inactive) !important; border-color: var(--always_dark_surface_default) !important; }
[wz-theme="dark"] .favorite-item i, [wz-theme="dark"] .custom-item i { color: var(--content_p1) !important; }
[wz-theme="dark"] .custom-item, [wz-theme="dark"] .custom-item a { background: var(--always_dark_inactive) !important; color: var(--content_p2) !important; }
[wz-theme="dark"] #editing-activity .mercury-bg { opacity: .03; }
[wz-theme="dark"] .wz-chat-header-btn { filter: invert(1); }
[wz-theme="dark"] .wz-chat-header-btn .icon:hover { background-color: white !important; }
/* --- DARK MODE CSS END --- */




`;
        document.head.appendChild(style);
    }

function replaceWazeLogo() {
    const oldLogo = document.querySelector('img[slot="product-icon"][src*="waze-map-editor"]');
    if (oldLogo && !document.getElementById('logo-waze-dark')) {
        const newLogo = document.createElement('img');
        newLogo.id = 'logo-waze-dark';
        newLogo.slot = 'product-icon';
        newLogo.src = 'https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/files/logo-waze.png';
        oldLogo.parentNode.replaceChild(newLogo, oldLogo);
    }
}

addStyles();
restoreColorFromStorage();
setTimeout(replaceWazeLogo, 1000);

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

            // --- Theme Settings Row (Color + Dark Mode) ---
            const themeSettingsRow = $('<div style="display:flex; align-items:center; justify-content:space-between; gap:15px; margin-bottom:15px; padding:10px; background: rgba(128,128,128,0.1); border-radius:8px;"></div>');

            const colorGroup = $('<div style="display:flex; align-items:center; gap:8px;"></div>');
            colorGroup.append('<strong style="font-size:13px;">Theme</strong>');

            const currentColor = localStorage.getItem(COLOR_STORAGE_KEY) || DEFAULT_COLOR;
            const colorInput = $(`<input type="color" id="wme-addons-color-picker" value="${currentColor}" style="width:30px; height:30px; cursor:pointer; border:none; background:none;">`);
            const resetButton = $('<button type="button" style="padding:2px 6px; cursor:pointer; font-size:11px;">Default</button>');

            colorInput.on('input', () => {
                applyThemeColor(colorInput.val(), 'settings');
            });

            resetButton.on('click', () => {
                applyThemeColor(DEFAULT_COLOR, 'settings');
                colorInput.val(DEFAULT_COLOR);
            });

            colorGroup.append(colorInput).append(resetButton);

            const darkGroup = $('<div style="display:flex; align-items:center; gap:8px;"></div>');
            const darkModeCheckbox = $('<wz-checkbox id="dark-mode-toggle">Dark Mode</wz-checkbox>');
            darkModeCheckbox.prop('checked', localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true');

            darkModeCheckbox.on('change', () => {
                applyDarkMode(darkModeCheckbox.prop('checked'), 'settings');
            });

            darkGroup.append(darkModeCheckbox);

            themeSettingsRow.append(colorGroup).append(darkGroup);
            settingsDiv.append(themeSettingsRow);

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
<wz-checkbox id="auto-dom-toggle">Auto House Numbers</wz-checkbox>
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

                        // IMG OPP
                        const interval = 10;
                        for (let i = 0; i < points.length; i += interval) {
                            const pointFeature = new OpenLayers.Feature.Vector(
                                new OpenLayers.Geometry.Point(points[i].x, points[i].y),
                                null,
                                {
                                    externalGraphic: "https://raw.githubusercontent.com/miodeq-ofc/waze-addons/main/files/opp.png",
                                    graphicWidth: iconSize,
                                    graphicHeight: iconSize,
                                    graphicXOffset: -iconSize / 2,
                                    graphicYOffset: -iconSize / 2,
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
<li>Dark / Light mode</li>
<li>Custom theme color</li>
<li>Auto House nuber with own delay</li>
<li>Lower Lock Segments Highlighter – fix them in one click (only 🇵🇱)</li>
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
            const darkerColorValue = `rgb(${darkerRgb.join(',')})`;

            document.documentElement.style.setProperty(
                '--wz-chip-checked-background-color',
                darkerColorValue
            );

            document.documentElement.style.setProperty(
                '--primary-darker',
                darkerColorValue
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

    function addProfileToggle() {
        let userBox = document.querySelector('wz-user-box');
        if (!userBox) {
            setTimeout(addProfileToggle, 1000);
            return;
        }

        let wzMenuItem = userBox.querySelector('wz-menu-item');
        if (!wzMenuItem) {
            setTimeout(addProfileToggle, 1000);
            return;
        }

        if (document.getElementById('wme-addons-profile-container')) return;

        let profileContainer = document.createElement('wz-menu-item');
        profileContainer.id = 'wme-addons-profile-container';
        profileContainer.style = 'pointer-events: none; border-bottom: 1px solid var(--separator_default, #e8eaed);';

        const innerLayout = document.createElement('div');
        innerLayout.style = 'display: flex; align-items: center; justify-content: space-between; width: 100%; pointer-events: all; padding: 4px 0; gap: 5px;';


        const colorWrapper = document.createElement('div');
        colorWrapper.style = 'display: flex; align-items: center; gap: 4px;';

        const savedColor = localStorage.getItem(COLOR_STORAGE_KEY) || DEFAULT_COLOR;

        const profilePicker = document.createElement('input');
        profilePicker.type = 'color';
        profilePicker.id = 'wme-addons-profile-color';
        profilePicker.value = savedColor;
        profilePicker.style = 'width: 30px; height: 30px; border: none; background: none; cursor: pointer; padding: 0; margin: 0;';

        const profileDefaultBtn = document.createElement('p');
        profileDefaultBtn.innerText = 'Change in script ⚙️';


        profileDefaultBtn.style = `
            font-size: 12px;
            line-height: 1.2;
            display: inline-block;
            margin: 0;
            color: var(--content_p1);
            max-width: 120px;
            text-align: center;
            white-space: normal;
            word-wrap: break-word;
            vertical-align: middle;
        `;

        profileDefaultBtn.onclick = () => {
            applyThemeColor(DEFAULT_COLOR, 'profile');
            alert("Theme color has been reset to default. You can change it in the WME Addons settings tab!");
        };

        colorWrapper.append(profilePicker, profileDefaultBtn);

        const darkModeSwitch = document.createElement('wz-toggle-switch');
        darkModeSwitch.id = 'wme-addons-profile-dark-mode';
        darkModeSwitch.innerText = 'Dark Mode';
        darkModeSwitch.checked = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';

        profilePicker.oninput = () => {
            alert("Please change the theme color in the script settings tab!");
        };

        profileDefaultBtn.onclick = () => {
            applyThemeColor(DEFAULT_COLOR, 'profile');
        };

        darkModeSwitch.onchange = () => {
            applyDarkMode(darkModeSwitch.checked, 'profile');
        };

        innerLayout.append(colorWrapper, darkModeSwitch);
        profileContainer.appendChild(innerLayout);
        userBox.insertBefore(profileContainer, wzMenuItem);

        replaceWazeLogo();
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
restoreColorFromStorage();
initCssVariables();
addStyles();
addProfileToggle();

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



    // ---------- Auto toggle House ----------
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

        const levels = Object.keys(groups).map(Number).sort((a, b) => a - b);

        if (levels.length === 0) {
            alert("Nothing to fix");
            return;
        }

        let i = 0;

        function next() {

            if (i >= levels.length) {
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

        btn.innerText = '';

        btn.style.width = '40px';
        btn.style.height = '40px';
        btn.style.padding = '0';
        btn.style.border = 'none';
        btn.style.background = 'transparent';

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

        const themeGuard = new MutationObserver(() => {
        const savedColor = localStorage.getItem(COLOR_STORAGE_KEY) || DEFAULT_COLOR;
        const isDark = localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';

        // Przywracaj kolor jeśli zniknął
        if (document.documentElement.style.getPropertyValue('--primary') !== savedColor) {
            document.documentElement.style.setProperty('--primary', savedColor);
            document.documentElement.style.setProperty('--primary_variant', savedColor);
        }

        // Przywracaj tryb ciemny jeśli zniknął
        if (isDark && document.documentElement.getAttribute('wz-theme') !== 'dark') {
            document.documentElement.setAttribute('wz-theme', 'dark');
        } else if (!isDark && document.documentElement.hasAttribute('wz-theme')) {
            document.documentElement.removeAttribute('wz-theme');
        }
    });

    themeGuard.observe(document.documentElement, { attributes: true });
})();
