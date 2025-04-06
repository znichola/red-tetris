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

> :warning: TODO add unit testing. 

> :warning: TODO add hmr to the express app, looking at vite-node, node-hmr etc..
