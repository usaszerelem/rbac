https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/

To sent environment for development run:
source setenv.sh

To start Redis server:
/usr/local/opt/redis/bin/redis-server /usr/local/etc/redis.conf

To check if Redis is running:
redis-cli ping

If you don't want/need a background service you can just run:
mongod --config /usr/local/etc/mongod.conf

To start mongodb/brew/mongodb-community now and restart at login:
  brew services start mongodb/brew/mongodb-community

Or, if you don't want/need a background service you can just run:
  mongod --config /usr/local/etc/mongod.conf