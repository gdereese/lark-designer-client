# lark-designer

Facilitates the development and testing of [Lark](https://lark-parser.readthedocs.io/en/latest/) grammars.

## Features

* Input grammar rule definitions and validate syntax
* On-screen cheatsheet of Lark grammar syntax
* Test grammar by parsing your input test using the defined grammar rules

## User interface (Client)

User interface is a web browser-based application implemented using:

* [Node 12](https://nodejs.org/en/)
* [Vue 3](https://v3.vuejs.org/) - SPA framework
* [Bulma](https://bulma.io/) - CSS framework

Source code is located in the `client` directory of this repo.

### Project setup

```shell
nvm use
npm install
```

### Compiles and hot-reloads for development

```shell
npm run serve
```

### Compiles and minifies for production

```shell
npm run build
```

### Lints and fixes files

```shell
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Server

The user interface communicates with a server application for performing grammar validation and parsing of user input. It is implemented using:

* [Python 3](https://www.python.org/)
* [Flask](https://flask.palletsprojects.com/en/2.0.x/) - web application framework
* [Lark](https://lark-parser.readthedocs.io/en/latest/) - grammar toolkit

Source code is located in the `server` directory of this repo.

### Project setup

```shell
poetry install
```

### Compiles and hot-reloads for development

```shell
poetry run flask 
```

You can also invoke this command from Visual Studio Code by running the `Python: Flask` task configured in the workspace's `launch.json` file.
