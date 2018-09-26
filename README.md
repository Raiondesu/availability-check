# availability-check

This is a simple practice project made for [Pirple Node.js course](https://pirple.thinkific.com/courses/the-nodejs-master-class).

This project is written entirely in TypeScript and has *some* npm dependencies. [Explanations](https://github.com/Raiondesu/pirple-node-course#Why-bother-with-TypeScript).

## Setup

If you want to clone this repository separately - follow the instructions below.
However, I still recommend cloning the [root repository](https://github.com/Raiondesu/pirple-node-course) instead.

### Clone
```bash
# copy-past this code into console and execute

git clone https://github.com/Raiondesu/availability-check.git
cd availability-check
curl -o tsconfig.json https://raw.githubusercontent.com/Raiondesu/pirple-node-course/master/tsconfig.json

npm i typescript ts-node ts-node-dev
rm package-lock.json
```

### Run
**Option 1:** using ts-node-dev for easy reload on any file change
```bash
NODE_ENV=%your_environment% ts-node-env index.ts
```

**Option 2:** using pure node.js
```bash
tsc
NODE_ENV=%your_environment% node index.ts
```

## API

**DEFAULT PORTS: `3000` and `3001`**

All requests to routes that aren't specified below will return status `404`.

### `/hello`

Greets you. 👋

param           |   type   | description
----------------|----------|---------------
name `optional` | `string` | Lets the server know who to greet. 😉

Return status: `200`
Return payload type: string

Examples:
```bash
> curl http://localhost:3000/hello
Hello to you too, stranger!

> curl http://localhost:3000/hello?name=Alex
Hello to you too, Alex!
```

### `/sample`

Just a sample route to demonstrate that the app can have other routes. 😅

Return status: `406`
Return payload type: `JSON`

### `/sample/test`

Just a sample route to demonstrate that the app can have multi-level routes.

Return status: `200`
Return payload type: `JSON`

### `/ping`

Checks whether the server is up.

Return status: `200`
Return payload type: none