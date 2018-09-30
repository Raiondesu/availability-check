# availability-check

This is a simple practice project made for [Pirple Node.js course](https://pirple.thinkific.com/courses/the-nodejs-master-class).

This project is written entirely in TypeScript and has *some* npm dependencies. [Explanations](https://github.com/Raiondesu/pirple-node-course#user-content-why-bother-with-typescript).

[root course repository](https://github.com/Raiondesu/pirple-node-course)

## Setup

If you want to clone this repository separately from the [root project](https://github.com/Raiondesu/pirple-node-course) - follow the instructions below.

### Clone
```bash
# copy-paste this code into console and execute

git clone https://github.com/Raiondesu/availability-check.git
cd availability-check

npm i typescript ts-node ts-node-dev tsconfig-paths @types/node
rm package-lock.json
```

### Run
**Option 1:** using ts-node-dev for easy reload on any file change
```bash
./start.sh
```

**Option 2:** using pure node.js
```bash
./start_node.sh
```

## API

**DEFAULT PORTS: `3000` and `3001`**

All requests to routes that aren't specified below will return status `404` or `302` with possible routes list.

### `/hello`

Greets you. 👋

param           |   type   | description
----------------|----------|---------------
name `optional` | `string` | Lets the server know who to greet. 😉

Return status: `200`;
Return payload type: string;

Examples:
```bash
> curl http://localhost:3000/hello
Hello to you too, stranger!

> curl http://localhost:3000/hello?name=Alex
Hello to you too, Alex!
```

### `/sample`

Just a sample route to demonstrate that the app can have other routes. 😅

Return status: `406`;
Return payload type: `JSON`;

### `/sample/test`

Just a sample route to demonstrate that the app can have multi-level routes.

Return status: `200`;
Return payload type: `JSON`;

### `/ping`

Checks whether the server is up.

Return status: `200`;
Return payload type: none;

### `/who-are-you`

Return status: `418`;
Return payload type: string;
