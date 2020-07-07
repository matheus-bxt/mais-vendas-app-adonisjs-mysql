# Adonis fullstack application

This is the fullstack boilerplate for AdonisJs, it comes pre-configured with.

1. Bodyparser
2. Session
3. Authentication
4. Web security middleware
5. CORS
6. Edge template engine
7. Lucid ORM
8. Migrations and seeds

## System Requirements

The only dependencies of the framework are Node.js, npm and mysql.

## Setup

command line in terminal VSCode:

```js
npm i -g @adonisjs/cli
```

## Script MySQL

command line in terminal shell MySQL:

```js
CREATE DATABASE maisvendas CHARACTER SET utf8 COLLATE utf8_general_ci;
```

## Migrations

command line in terminal VSCode: 

```js
adonis migration:run
```

## Start Server

command line in terminal VSCode: 

```js
adonis serve --dev
```

## Open Browser Test

http://127.0.0.1:3333/
