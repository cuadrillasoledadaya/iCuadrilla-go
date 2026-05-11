# Code Formatting Specification

## Purpose

Define the project-wide code formatting standard using Prettier for all TypeScript, JSX, JSON, CSS, and Markdown files in the iCuadrilla codebase. Ensures consistent style without manual enforcement or review noise.

## Requirements

### Requirement: Prettier Configuration

The project MUST provide a `.prettierrc` file at the repository root with the following rules:

| Option           | Value        | Rationale                                    |
| ---------------- | ------------ | -------------------------------------------- |
| `singleQuote`    | `true`       | Consistent with existing codebase preference |
| `trailingComma`  | `es5`        | Safe for ES5 targets, clean diffs            |
| `semi`           | `true`       | Explicit statement terminators               |
| `printWidth`     | `100`        | Fits modern wide screens                     |
| `tabWidth`       | `2`          | Standard for JavaScript/TypeScript           |
| `bracketSpacing` | `true`       | Readable object literals                     |
| `arrowParens`    | `always`     | Consistent arrow function params             |
| `endOfLine`      | `lf`         | Cross-platform consistency                   |
| `parser`         | `typescript` | Default parser for `.ts`/`.tsx` files        |

#### Scenario: Config file is valid JSON

- GIVEN `.prettierrc` exists at the repository root
- WHEN Prettier reads the configuration
- THEN all options are applied without parse errors

#### Scenario: Conflicting editor settings are overridden

- GIVEN a developer has different personal Prettier settings in their editor
- WHEN working inside the iCuadrilla project
- THEN the project `.prettierrc` takes precedence over editor defaults

### Requirement: File Exclusions

The project MUST provide a `.prettierignore` file that excludes build artifacts, lockfiles, and third-party output from formatting.

The following paths MUST be ignored:

```
.next/
node_modules/
out/
public/sw*.js
public/fallback-*.js
package-lock.json
*.min.js
*.min.css
```

#### Scenario: Build output is not formatted

- GIVEN `.next/` directory exists after `npm run build`
- WHEN `npm run format` is executed
- THEN no files inside `.next/` are modified

#### Scenario: Lockfile is preserved

- GIVEN `package-lock.json` exists
- WHEN `npm run format` is executed
- THEN `package-lock.json` is not modified

### Requirement: NPM Scripts

The `package.json` MUST include the following scripts:

| Script         | Command              | Purpose                                   |
| -------------- | -------------------- | ----------------------------------------- |
| `format`       | `prettier --write .` | Format all eligible files in-place        |
| `format:check` | `prettier --check .` | Verify formatting without modifying files |

#### Scenario: Format rewrites non-compliant files

- GIVEN a source file has inconsistent formatting (mixed quotes, missing semicolons)
- WHEN `npm run format` is executed
- THEN the file is rewritten with consistent formatting per `.prettierrc` rules
- AND the exit code is 0

#### Scenario: Format check fails on non-compliant files

- GIVEN a source file has inconsistent formatting
- WHEN `npm run format:check` is executed
- THEN the command lists the non-compliant files
- AND the exit code is non-zero (1)

#### Scenario: Format check passes on compliant files

- GIVEN all files match the `.prettierrc` rules
- WHEN `npm run format:check` is executed
- THEN the command outputs "All matched files use Prettier code style!"
- AND the exit code is 0

### Requirement: Initial Format Pass

After configuration is in place, ALL files under `src/` MUST be formatted in a single pass to establish the baseline.

#### Scenario: All src/ files pass format check after initial pass

- GIVEN `.prettierrc` and `.prettierignore` are committed
- WHEN `npm run format` is run once across the entire project
- THEN `npm run format:check` passes with zero violations
- AND all `src/**/*.ts` and `src/**/*.tsx` files use single quotes, semicolons, and ES5 trailing commas

### Requirement: VS Code Integration (Optional)

If `.vscode/settings.json` is created, it MUST enable format-on-save for the workspace without overriding user-level settings globally.

The settings MUST include:

- `editor.defaultFormatter` set to `esbenp.prettier-vscode`
- `editor.formatOnSave` set to `true`
- `[typescript]` and `[typescriptreact]` language overrides

#### Scenario: Format-on-save activates on file save

- GIVEN `.vscode/settings.json` exists with formatter settings
- WHEN a developer saves a `.ts` or `.tsx` file in VS Code
- THEN Prettier formats the file before the save completes

### Requirement: Rollback

The change MUST be fully reversible by:

1. Removing `prettier` from `devDependencies` in `package.json`
2. Deleting `.prettierrc` and `.prettierignore`
3. Reverting all files modified by the initial format pass (via git)
4. Deleting `.vscode/settings.json` if created

#### Scenario: Rollback restores pre-Prettier state

- GIVEN Prettier was installed and an initial format pass was committed
- WHEN the rollback steps are executed
- THEN `package.json` has no `prettier` dependency or format scripts
- AND `.prettierrc` and `.prettierignore` do not exist
- AND source files are restored to their pre-format state

## Acceptance Criteria

1. `npm run format` completes without errors and reformats all non-compliant files under `src/`
2. `npm run format:check` exits with code 0 after initial format pass
3. No mixed quote styles remain in `src/` — all strings use single quotes
4. All statements end with semicolons consistently
5. `npm run build` succeeds after formatting (no functional changes)
6. `.prettierignore` prevents formatting of `.next/`, `node_modules/`, `out/`, `package-lock.json`, `public/sw*.js`, and `public/fallback-*.js`
7. Rollback procedure restores the codebase to its pre-Prettier state
