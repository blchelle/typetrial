## Setup
These instructions have been tested on Ubuntu

You can see our full repo on github, along with our issues at https://github.com/blchelle/capstone

1. Ensure you have [node](https://nodejs.org/en/download/) with a version > 16.0.0 and [yarn](https://yarnpkg.com/getting-started/install) installed on your machine.
```sh
sudo apt update
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
source ~/.profile
nvm install 16
sudo npm i -g corepack
```

 Confirm this by running the following. Ensure the node version is higher than v16.0.0

```sh
$ yarn --version
1.22.15
$ node -v
v16.14.2
```

2. Install and set up mySQL

```sh
sudo apt install mysql-server
```
Start the server:
```sh
sudo systemctl start mysql.service
```
OR
```sh
sudo service mysql start  #works on WSL
```

Now connect to the database and set up a root account with no password:

```sh
sudo mysql
```
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';
FLUSH PRIVILEGES;
EXIT;
```

3. Install all npm dependencies
From within project root
```sh
yarn
```

4. Create a new database
```sh
yarn dev:db
```

5. Run tests:
```sh
yarn test
```

6. Run the development environment:
```sh
yarn dev
```

7. Check out the website:

Navigate to http://localhost:3000/



## Other Commands

+ Generate prisma type definitions for database

```sh
yarn prisma:generate
```

+ Migrate prisma schema to mysql database

```sh
yarn prisma:migrate:dev
```

+ Start prisma studio to view the database in a web UI

```sh
yarn prisma:studio:dev
```

+ Reset database to a seeded sample db with existing races and users

```sh
yarn prisma:reset:dev
```

## Setting up both git servers

[More details on setting up](https://eclass.srv.ualberta.ca/mod/resource/view.php?id=5806504)

```
git remote add origin git@github.com:blchelle/capstone.git
```

```
git remote add production ece493_YOURCCID@gitrepo.ece.ualberta.ca:ece493_YOURCCID.git
```
