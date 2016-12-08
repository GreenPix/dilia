
# Apt get dependencies
sudo apt-get install -y mongodb-server
sudo apt-get install -y curl
sudo apt-get install -y libkrb5-dev
sudo apt-get install -y git
sudo apt-get install -y g++

# Setting up node via nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
if ! type "nvm" > /dev/null; then
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.26.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
else
  echo "nvm already installed"
fi

cd /vagrant

# Setting up npm
if ! type "npm" > /dev/null; then

  # Install node / npm
  nvm install 6
  nvm alias default 6

  # Install dev-tools
  npm install -g mongo-express
  npm install -g node-inspector

  # Copy mongo express config
  node_ver=`eval node --version`
  cp -v ./mongo-express-config.js ~/.nvm/versions/node/$node_ver/lib/node_modules/mongo-express/config.js
  echo "alias mongo-express='node ~/.nvm/versions/node/'$node_ver'/lib/node_modules/mongo-express/app.js'" >> ~/.bashrc

else
  echo "npm already installed"
fi

# Does the user has already downloaded the dependencies?
export NODE_ENV="development"
if [ ! -d "node_modules" ]; then
  npm install
else
  echo "node_modules folder is already present"
fi

echo ""
echo "###################################"
echo "        building the server"
echo ""
npm run build-server
