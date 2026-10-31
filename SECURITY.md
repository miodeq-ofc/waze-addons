# Privacy Policy

**WME Addons** is a userscript that runs locally in your browser inside the Waze Map Editor. This page explains what it does and does not do with data.

## What the script does NOT do

- It does **not** collect, store or send any personal data to the author or to any server owned by the author.
- It has **no** analytics, tracking, advertising or cookies.
- It does **not** read, copy or transmit your Waze account details, passwords, edits or map data anywhere. Map objects (segments, places, streets) are only read locally to draw highlights on your screen.

## What is stored on your device

The script saves its settings in your browser's `localStorage` on `waze.com`:
- theme color and dark mode,
- which features are switched on or off,
- your speed-limit color configuration,
- the last installed script version (to show the "what's new" window once).

This data never leaves your browser. You can remove it at any time by clearing site data for waze.com or uninstalling the script.

## External requests made by the script

To work, the script loads some resources from third parties. Like any web request, these servers can see your IP address and browser information:
- **raw.githubusercontent.com (GitHub)** - icons and images used by the script, and script updates.
- **renderer-am.waze.com (Waze)** - road shield images, only when "Show Road Shields" is enabled.

See the privacy policies of [GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) and [Waze](https://www.waze.com/legal/privacy) for how they handle this data.

## Reporting bugs and suggestions

The "Report bug / Suggestion" button opens this project's GitHub Issues page. Issues are **public** and tied to your GitHub account. Please do not include personal information, passwords or private data in your reports.

## Changes

If this policy changes, the new version will be published in this repository.

## Contact

Questions about privacy: https://github.com/miodeq-ofc/waze-addons/issues
