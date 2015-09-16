sudo apt-get install -y mongodb-server
sudo apt-get install -y curl
sudo apt-get install -y libkrb5-dev
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.26.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
cd /vagrant
nvm install stable
nvm alias default stable
npm install
npm run build
npm run build-server
