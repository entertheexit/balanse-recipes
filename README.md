# Balanse statement recipes

MIT-licensed declarative statement recipes. See the [Balanse project hub](https://github.com/entertheexit/balanse) for product documentation. The application and parser are maintained privately. This repository contains public templates and their validation resources only.

Recipes live in `templates/<country>/<institution>/`. `catalog.json` describes the reviewed revisions and SHA-256 hashes; `schema/recipe.schema.json` defines the recipe contract. Current recipes require `thai-statements-v1`; a country code does not establish international parser support.

Run `npm install --ignore-scripts` and `npm test` to validate contributions. This validates schema, identity, hashes and synthetic fixture coverage; it does not distribute the private parser engine. Maintainers run `pnpm recipes:verify-fixtures <recipe-repository-directory>` in the Balanse application checkout before promoting a release. See CONTRIBUTING.md.

To release: validate the catalog, create a versioned immutable GitHub release, then promote it by publishing `stable.json` with `schemaVersion: 1`, the exact 40-character commit SHA, and `catalogSha256` (SHA-256 of that commit's catalog bytes). Never point stable at a branch name. Do not publish placeholder commit hashes. Balanse contacts this catalog only on explicit user requests.
