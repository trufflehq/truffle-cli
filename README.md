# Truffle CLI
> Interact with the Truffle Developer Platform


## Installing
Ensure you have Node 18 installed. We reccomend [Volta](https://volta.sh/).  

**NPM or Yarn**
```sh
$ yarn global add @trufflehq/cli # yarn!
$ npm i -g @trufflehq/cli # npm!
```

**Tarball**  
Head over to the [latest release](https://github.com/trufflehq/truffle-cli/releases) and copy the tarball link to your system. 
```sh
$ wget link_you_copied
$ tar -xvf truffle-cli-linux-x64.tar.gz
$ sudo mv truffle-cli /usr/local/bin
# not required
$ chmod +x /usr/local/bin/truffle-cli
```

## Contributing
1. once you have your changes, create your commit (`git commit -am "chore: whatever"`)
2. push (`git push`)
3. tag (`git tag -a "v0.0.n" -m "v0.0.n"`)
4. push again (`git push origin v0.0.n`)

### notes

- `truffle-cli auth` or `truffle-cli login`
  - TODO
  - Open browser window
  - Wait for approval
  - Store API key ~/.truffle.config.json

- `truffle-cli create my-package-name`
  - TODO
  - create Package, new dir w/ scaffolding and example code

- `yarn dist` / `yarn dev` vs `truffle-cli deploy` / `truffle-cli dev`