# Truffle CLI
> Interact with the Truffle Developer Platform

## Installing
Ensure you have Node 18 installed. We recommend [Volta](https://volta.sh/).  

**NPM or Yarn**
```sh
$ volta install @trufflehq/cli # volta! (what we recommend)
$ yarn global add @trufflehq/cli # yarn!
$ npm i -g @trufflehq/cli # npm!
```

## Releasing
1. bump the version in package.json
2. run `yarn` to update the lockfile
1. create your commit (`git commit -am "chore: whatever"`)
2. tag (`git tag -a "v0.0.n" -m "v0.0.n"`)
3. push (`git push --tags origin`)
