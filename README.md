# Development Setup

## Client Setup

1. Move into the `client/` directory

```sh
cd client/
```

2. Install node_modules with yarn.

```sh
yarn
```

3. Run client in development mode

```sh
yarn dev
```

4. Go to `localhost:3000` in a browser

## Server Setup

**Note:** Before setting up the server, you must setup a local MySQL instance with a user `root` with no password

1. Move into the `server/` directory

```sh
cd server/
```

2. Install node_modules with yarn.

```sh
yarn
```

3. Generate prisma type definitions for database

```sh
yarn prisma:generate
```

4. Migrate prisma schema to mysql database

```sh
yarn prisma:migrate:dev
```

5. Start prisma studio to view the database in a we UI **(Optional)**

```sh
yarn prisma:studio:dev
```

6. Reset database to a seeded sample db with existing races and users **(Optional)**

```sh
yarn prisma:reset:dev
```

7. Run the server in development mode

```sh
yarn dev
```

8. Send a `GET` request to `localhost:8080/api/random` to check if it's running.

```sh
curl localhost:8080/api/random
"57" # for example
```

## Setting up both git servers

[More details on setting up](https://eclass.srv.ualberta.ca/mod/resource/view.php?id=5806504)

```
git remote add origin git@github.com:blchelle/capstone.git
```

```
git remote add production ece493_YOURCCID@gitrepo.ece.ualberta.ca:ece493_YOURCCID.git
```

## Setup

1. Ensure you have [yarn](https://yarnpkg.com/getting-started/install) and [node](https://nodejs.org/en/download/) installed on your machine. Confirm this by running the following.

```sh
❯ yarn --version
1.22.17
❯ node -v
v17.0.1
```
