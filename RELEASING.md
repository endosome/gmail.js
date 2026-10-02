# Releasing

Releases are published to npm by [`.github/workflows/release.yml`](.github/workflows/release.yml)
when a `v*` tag is pushed, using [npm trusted publishing](https://docs.npmjs.com/trusted-publishers)
(no npm token is stored in the repo).

## Releasing a new version

1. On the default branch, bump `version` in `package.json` (and `package-lock.json`) and update `CHANGELOG.md`:

   ```sh
   npm version 1.2.3 --no-git-tag-version
   git commit -am "Release 1.2.3"
   git push
   ```

2. Tag the release commit and push the tag:

   ```sh
   git tag v1.2.3
   git push origin v1.2.3
   ```

3. Approve the deployment to the `npm` environment in the workflow run.

The workflow checks that the tag matches `package.json`, that the tagged commit is on the default branch
and that the version isn't published yet. It then tests the package, publishes the tarball with provenance
and creates a GitHub release with generated notes.
Prereleases (`v1.2.3-beta.1`) are published under the `beta` dist-tag instead of `latest`.

## One-time setup

1. **First publish (manual).** Trusted publishing can only be configured for a package that already exists on npm:

   ```sh
   npm ci && npm test
   npm publish --access public
   ```

2. **Trusted publisher.** On npmjs.com, open the package's settings, then *Trusted publisher* and choose *GitHub Actions*:
   - Organization or user: `endosome`, repository: `gmail.js`
   - Workflow filename: `release.yml`
   - Environment name: `npm`

   Then, under *Publishing access*, require two-factor authentication and disallow tokens.

3. **GitHub environment.** In the repository settings, open *Environments* and create `npm`:
   - Required reviewers: the maintainers allowed to release
   - Deployment branches and tags: selected tags only, `v*`

4. **Tag protection (recommended).** Under *Rules* → *Rulesets*, add a tag ruleset for `v*`
   that restricts creation, update and deletion to maintainers.
