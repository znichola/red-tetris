# red-tetris

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
