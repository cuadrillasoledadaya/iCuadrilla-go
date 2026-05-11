# Proposal: Add Prettier Code Formatter

## Intent

iCuadrilla has ~60 TypeScript files with inconsistent formatting (mixed quotes, varying semicolon usage, irregular trailing commas). No formatter is configured. This reduces readability and creates unnecessary review noise. We will configure Prettier to enforce a single, consistent code style across the entire codebase.

## Scope

### In Scope

- Add `prettier` and config to `devDependencies`
- Create `.prettierrc` with project-wide rules
- Create `.prettierignore` respecting build/output artifacts
- Add npm scripts: `format` and `format:check`
- Run initial format pass across `src/`
- Optionally create `.vscode/settings.json` for format-on-save

### Out of Scope

- ESLint rule changes or plugin integration
- CI pipeline enforcement
- Pre-commit hooks

## Capabilities

### New Capabilities

- None (pure tooling/config change)

### Modified Capabilities

- None (no spec-level behavior changes)

## Approach

1. Install `prettier` as a dev dependency.
2. Create `.prettierrc` with: `singleQuote: true`, `trailingComma: es5`, `semi: true`, `printWidth: 100`.
3. Create `.prettierignore` ignoring `.next/`, `node_modules/`, `out/`, `public/sw*`, `package-lock.json`.
4. Add scripts to `package.json`: `format` (write), `format:check` (check).
5. Run `npm run format` once to normalize all `src/` files.
6. Commit the config and the formatted files as separate commits (config first, format second).

## Affected Areas

| Area                    | Impact         | Description                            |
| ----------------------- | -------------- | -------------------------------------- |
| `package.json`          | Modified       | Add `prettier` devDependency + scripts |
| `.prettierrc`           | New            | Formatter configuration                |
| `.prettierignore`       | New            | Files to exclude from formatting       |
| `src/**/*.ts{,x}`       | Modified       | Re-formatted by initial pass           |
| `.vscode/settings.json` | New (optional) | Enable format-on-save for VS Code      |

## Risks

| Risk                                                | Likelihood | Mitigation                                                                           |
| --------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| Large initial diff masks real changes in future PRs | High       | Commit config and format as separate commits; reviewers can ignore the format commit |
| Conflicts with existing unmerged branches           | Medium     | Coordinate with team; run format on feature branches after merge                     |
| VS Code settings conflict with user preferences     | Low        | Make `.vscode/settings.json` optional and document it                                |

## Rollback Plan

1. Revert the commit that added `.prettierrc`, `.prettierignore`, and package.json changes.
2. Revert the initial format commit to restore prior file states.
3. Delete `.vscode/settings.json` if created.

## Dependencies

- None

## Success Criteria

- [ ] `npm run format` reformats all `src/` files without errors
- [ ] `npm run format:check` passes in CI-like environments
- [ ] No functional changes introduced (build still succeeds)
