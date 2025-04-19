# red-tetris

Launch the dockerized app for development, this deploys the two apps for development on:

Vite: [localhost:5173](http://localhost:5173)

Express: [localhost:3000](http://localhost:3000)

```bash
docker compose up
```

Connect to the running container and get a shell, use for npm install or any other node commands. Local folder is mounted to container, so changes are reflected on disc.

```bash
docker exec -it red-tetris sh
```

Sometimes when updating packages idk what happens to the docker state but it's all broken. It's easy-est to nuke the container, image and local node_modules the redo the `up`.

```bash
docker container rm red-teris
docker image rm node:22-alpine
rm node_modules
```

## node scripts

Install node moduels.

```bash
npm install
```

Start the [HMR](https://vite.dev/guide/features.html#hot-module-replacement) frontend dev server, (it uses vite).

```bash
npm run dev
```

Build the prod version of the app.

```bash
npm run build
```

Run express backend server, make sure there is a build of the client to serve (`npm run build`).

```bash
npm run serv
```

Same as above, but with live reload.

```bash
npm run devserv
```

Run tests.

```bash
npm run coverage
```

> :warning: TODO add hmr to the express app, looking at vite-node, node-hmr etc..

## TYPES

We like types, but docs say no TypeScript, so [JSDocs](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#param-and-returns) is the way. In vscode you can generate them with a `/**` before a function. Also this [website](https://sethmac.com/typescript-to-jsdoc/) has a nice type converter between `TS` to `JSDocs`.

## Pre-commit hook

There is a node script that will run the linter, format check and tests `npm run precommit`. Apply the following command to create the precommit hook, (it's just a file inside a folder of git) and it will run this script before a commit and only allow the commit if it exits with 0;

```bash
echo '#!/bin/sh
docker exec red-tetris npm run precommit' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

If the precommit hook every gets annoying, you can bypass it like this:

```bash
git commit --no-verify
```
