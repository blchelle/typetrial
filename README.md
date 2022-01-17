### Setting up both git servers

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

1. Install the required node_modules by running `yarn install` from the root project directory.

2. Start your local dev server by running `yarn start` from the root project directory.

3. Go to [localhost:8080](localhost:8080)