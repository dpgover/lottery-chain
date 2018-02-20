const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
  'famous indoor link salmon boil apart tiny flight scare before skin then',
  'https://rinkeby.infura.io/1PgmCKFGBQaFp1dC8Cut'
);
const web3 = new Web3(provider);

const deploy = async () => {
  // Get the coinbase
  let accounts = await web3.eth.getAccounts();
  let coinbase = accounts[0];

  console.log(`Deploying contract from account: ${coinbase}`);

  // Deploy the contract
  const contract = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
    })
    .send({
      from: coinbase,
      gas: 1000000,
    });

  contract.setProvider(provider);

  console.log(interface);
  console.log(`Contract deployed at: ${contract.options.address}`);
};

deploy();
