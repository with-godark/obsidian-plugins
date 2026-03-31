# obsidian-plugins

A pnpm workspace for building and maintaining multiple Obsidian deliverables in one repository. The repo starts with one built app theme package and leaves room for future community plugins.

## Workspace layout

```text
.
├── packages/
│   └── terminal-theme/
│       ├── build.mjs
│       ├── manifest.json
│       ├── package.json
│       └── src/
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Requirements

- Node.js 22 or newer
- pnpm 10 or newer
- A separate Obsidian development vault

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the example environment file and point it at your Obsidian development vault:

   ```bash
   cp .env.example .env
   ```

   Set `OBSIDIAN_VAULT_PATH` to the absolute path of your test vault, not your main vault.

3. Build the terminal theme once:

   ```bash
   pnpm build:theme
   ```

4. Start watch mode and sync the built theme into your vault:

   ```bash
   set -a
   source .env
   set +a
   pnpm dev:theme:sync
   ```

5. In Obsidian, open the development vault and enable the theme under `Settings -> Appearance`.

## Useful commands

- `pnpm build`: build every workspace package
- `pnpm build:theme`: build the terminal theme package
- `pnpm dev:theme`: watch and rebuild the terminal theme locally
- `pnpm dev:theme:sync`: watch, rebuild, and copy the theme into the configured Obsidian vault
- `pnpm sync:theme`: copy the current theme build into the configured Obsidian vault
- `pnpm lint`: run JavaScript linting, CSS linting, and formatting checks
- `pnpm format`: format the workspace

## Theme package contract

Obsidian themes are distributed as `manifest.json` and `theme.css`. The build for `packages/terminal-theme` compiles source CSS from `src/` into `dist/theme.css` and copies `manifest.json` into `dist/manifest.json`.

When syncing into a vault, the destination directory is:

```text
<OBSIDIAN_VAULT_PATH>/.obsidian/themes/<manifest.name>
```

The folder name must exactly match the `name` field in the theme manifest.

## Future packages

Use `@godark/<package-name>` for workspace package names. Theme packages can live under `packages/*` and plugin packages can inherit the same root tooling later without changing the workspace structure.

## Publish theme releases

This repository includes GitHub Actions automation for publishing the theme from the monorepo layout.

- Workflow: `.github/workflows/release-theme.yml`
- Trigger: pushing a git tag (for example `0.2.0`)
- Release assets: `manifest.json`, `theme.css`, and `versions.json`

### Release checklist

1. Update the version in `packages/terminal-theme/manifest.json`.
2. Update `packages/terminal-theme/versions.json` by adding a new entry:

   ```json
   {
     "0.2.0": "1.5.0"
   }
   ```

   The key is your theme version and the value is the minimum supported Obsidian app version.

3. Commit and push your changes to `main`.
4. Create and push a tag that exactly matches `manifest.json` version:

   ```bash
   git tag -a 0.2.0 -m "0.2.0"
   git push origin 0.2.0
   ```

5. Open GitHub Actions and wait for `Release Obsidian theme` to finish.
6. Open the draft release in GitHub, add release notes, and publish.
