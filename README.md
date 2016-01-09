# Dilia - Game Editor for Renaissance

Dilia is a dedicated game editor for the Renaissance project. The editor can
be used for your own project, you'll probably want to fork it to adapt it to your needs.

This editor is designed to be used by multiple users with different backgrounds.
One of the long term goals is to facilitate the integration of the creation or modification
of quests, monsters, scripts, maps and skins that are then "automatically" integrated
in the game.

Dilia is made of two part: a `node.js` server and a web client.
In order to work properly, the server has a few requirements:

* Some packages:
  * **[required]** `mongodb`
* Some environment variables:
  * **[required]** `NODE_ENV` set to `production`.
  * **[optional]** `GOOGLE_SECRET` and `GOOGLE_CLIENTID` API token in order to allow google oauth
  * **[optional]** `GITHUB_SECRET` and `GITHUB_CLIENTID` API token in order to allow github oauth

## Development

First you need to install node and npm. You should install them via
[nvm](https://github.com/creationix/nvm).
Then you run:

```bash
export NODE_ENV=development
npm install
```

You start the server with:

```bash
npm run build-server && npm run server
```

To start the client:

```bash
npm start
```

### Vagrant

This repository also includes a **Vagrantfile** for easy set up and quick development.
It will setup `nvm`, `node`, `npm`, performs a build of the server and the client and also
install `mongo-express` and `node-inspector` which are usefull for debugging.
With vagrant, simply run:

```bash
vagrant up
```

Within the vm (`vagrant ssh`), then you do:

```bash
cd /vagrant
export NODE_ENV='development' && npm run server
```

And navigate to http://localhost:3000/.

### Text editor setup

#### Atom

If you use [atom](http://atom.io/), you might consider installing those
packages:
  - `atom-typescript`
  - `linter-tslint`
  - `language-pegjs`
  - `language-glsl`
  - `autocomplete-paths`
  - `autocomplete-glsl`
  - `docblockr`
  - `color-picker`

For fun :)
  - `file-icons`
