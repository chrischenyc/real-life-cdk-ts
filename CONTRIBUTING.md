# Contributing

This repository uses [standard-version](https://github.com/conventional-changelog/standard-version) to provide

- [SEMVER](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- Automated changelog generation

To ensure your contributions align with required specifications, ensure:

- You commit your work using `yarn commit` which will prompt for required information
- When committing a major release you run `yarn release`. This will bump the version number of the package and generate a changelog based on previous commits.

This repos uses following ESLint plugins:

- [typescript-eslint](https://github.com/typescript-eslint/typescript-eslint)
- [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)
- [eslint-plugin-simple-import-sort](https://github.com/lydell/eslint-plugin-simple-import-sort)

more in [.eslintrc.js](.eslintrc.js).

Git hooks are used to enforce code linting and git commit message linting.
