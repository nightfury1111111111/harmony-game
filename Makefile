all:
	cd truffle && npm install && truffle compile && truffle migrate --network testnet --reset > migrate.output
	cp -R truffle/build/contracts ui/
	cp -R truffle/build/contracts seeder/
	cp truffle/migrate.output helper/	
	cd helper && npm install && node index.js
	cd seeder && npm install && node index.js
	cd ui && npm install && npm run dev
