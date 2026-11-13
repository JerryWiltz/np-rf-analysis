<!-- Modified: 2026-07-17 -->

# Hand-loading the plugin

Use these instructions to install nPort RF Analysis manually from its GitHub release. A plugin installed this way belongs only to the vault into which you copy it.

## Download the Release Files from GitHub

1. Open the [nPort RF Analysis releases page](https://github.com/JerryWiltz/np-rf-analysis/releases/latest) in your web browser.
2. Find the latest release.
3. Expand **Assets** if the asset list is collapsed.
4. Download these three files:
   - [`main.js`](https://github.com/JerryWiltz/np-rf-analysis/releases/latest/download/main.js)
   - [`manifest.json`](https://github.com/JerryWiltz/np-rf-analysis/releases/latest/download/manifest.json)
   - [`styles.css`](https://github.com/JerryWiltz/np-rf-analysis/releases/latest/download/styles.css)

Do not download the automatically generated **Source code** archives for hand-loading. They contain the development source rather than the three ready-to-install plugin files.

On this Chromebook, files downloaded through Chrome are normally available to Linux at:

```text
/mnt/chromeos/MyFiles/Downloads
```

## Create the Plugin Directory

Inside the Obsidian vault, create this directory structure:

```text
YourVault/
└── .obsidian/
    └── plugins/
        └── np-rf-analysis/
            ├── main.js
            ├── manifest.json
            └── styles.css
```

The `.obsidian` directory may be hidden in a file manager. Enable the option to show hidden files if you cannot see it.

Copy the downloaded `main.js`, `manifest.json`, and `styles.css` files into:

```text
YourVault/.obsidian/plugins/np-rf-analysis/
```

The directory name must remain `np-rf-analysis` because that is the plugin ID declared in `manifest.json`.

## Files You Do Not Need

You do not need to copy:

- `nP.esm.js`, because it is bundled into `main.js`.
- `data.json`, because Obsidian creates it after the plugin saves settings or results.
- `package.json`, `src/`, `node_modules/`, or any build tools.

## Enable the Plugin

After copying the three release files:

1. Restart Obsidian, or run **Reload app without saving**.
2. Open **Settings → Community plugins**.
3. Turn off **Restricted mode** if necessary.
4. Find **nPort RF Analysis** under the installed plugins.
5. Enable the plugin.

Plugins are installed separately for each vault. To use nPort RF Analysis in another vault, repeat these steps for that vault.
