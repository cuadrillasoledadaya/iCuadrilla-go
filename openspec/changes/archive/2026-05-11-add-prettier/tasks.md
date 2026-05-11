# Tasks: Add Prettier Code Formatter

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1,800 (config: ~40, format pass: ~1,760 across ~60 files) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (config + scripts, ~40 lines) → PR 2 (initial format pass, ~1,760 lines, size:exception) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Config + scripts + VS Code settings | PR 1 | Base branch: main; standalone, verifiable via `npm run format:check` (fails until PR 2) |
| 2 | Initial format pass across all `src/` files | PR 2 | Base branch: main (stacked after PR 1 merges); size:exception — generated diff, no logic changes |

## Phase 1: Configuration & Scripts

- [x] 1.1 Install `prettier` as devDependency: `npm install --save-dev prettier`
- [x] 1.2 Create `.prettierrc` at repo root with: `singleQuote: true`, `trailingComma: es5`, `semi: true`, `printWidth: 100`, `tabWidth: 2`, `bracketSpacing: true`, `arrowParens: always`, `endOfLine: lf`
- [x] 1.3 Create `.prettierignore` excluding: `.next/`, `node_modules/`, `out/`, `public/sw*.js`, `package-lock.json`, `*.min.js`, `*.min.css`
- [x] 1.4 Add npm scripts to `package.json`: `"format": "prettier --write ."` and `"format:check": "prettier --check ."`
- [x] 1.5 Update `.vscode/settings.json` to add: `editor.defaultFormatter: "esbenp.prettier-vscode"`, `editor.formatOnSave: true`, `[typescript]` and `[typescriptreact]` language overrides (preserve existing `css.*` settings)
- [x] 1.6 Verify: `npx prettier --check .` runs without config parse errors (will fail on files until Phase 2)

## Phase 2: Initial Format Pass

- [x] 2.1 Run `npm run format` to reformat all eligible files in-place
- [x] 2.2 Verify: `npm run format:check` exits with code 0 and outputs "All matched files use Prettier code style!"
- [x] 2.3 Verify: `npm run build` succeeds — no functional changes introduced
- [x] 2.4 Spot-check 3-5 files under `src/` confirm: single quotes, semicolons, ES5 trailing commas, 100-char print width

## Phase 3: Commit & Rollback Verification

- [ ] 3.1 Commit Phase 1 changes (config files + package.json + .vscode/settings.json) as separate commit
- [ ] 3.2 Commit Phase 2 changes (all reformatted `src/` files) as separate commit with message indicating generated format diff
- [ ] 3.3 Verify rollback: confirm reverting both commits restores `package.json` without prettier dependency/scripts, removes `.prettierrc` and `.prettierignore`, and restores source files to pre-format state
