# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

Every pull request that changes the published package adds a changeset:

```bash
pnpm changeset
```

Pick the bump type (Semantic Versioning) and describe the change for consumers. The generated
Markdown file is committed with the change and becomes a `CHANGELOG.md` entry on release.

See [CONTRIBUTING.md](../CONTRIBUTING.md#versioning-and-releases) for the release workflow.
