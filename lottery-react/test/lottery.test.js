const assert = require('assert');
const Web3 = require('web3');
const { interface, bytecode } = require('../compile');

const provider = new Web3.providers.HttpProvider('http://ganache:8545');
const web3 = new Web3(provider);

let accounts;
let coinbase;
let contract;

beforeEach(async () => {
  // Get the coinbase
  accounts = await web3.eth.getAccounts();
  coinbase = accounts[0];

  // Deploy the contract
  contract = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
    })
    .send({
      from: coinbase,
      gas: 1000000,
    });

  contract.setProvider(provider);
});

describe('Lottery', () => {
  // CONTRACT
  it('Should be deployed', () => {
    assert.ok(contract.options.address);
  });

  it('Should initialize with a manager', async () => {
    const manager = await contract.methods.manager().call();
    assert.equal(manager, coinbase, `Manager should be ${coinbase}`);
  });

  it('Should initialize with no participants', async () => {
    const participants = await contract.methods.getParticipants().call({
      from: coinbase,
    });

    assert.equal(participants.length, 0, `Should have zero participants`);
  });

  // ENTER
  it('Should add one participant', async () => {
    const account = accounts[1];
    await contract.methods.enter().send({
      from: account,
      value: web3.utils.toWei('1', 'ether'),
      gas: 5000000,
    });

    const participants = await contract.methods.getParticipants().call({
      from: coinbase,
    });

    assert.equal(participants.length, 1, `Should have one participant`);
    assert.equal(participants[0], account, `Participant should be ${account}`);
  });

  it('Should add multiple participants', async () => {
    await contract.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('1', 'ether'),
      gas: 5000000,
    });

    await contract.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('1', 'ether'),
      gas: 5000000,
    });

    await contract.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('1', 'ether'),
      gas: 5000000,
    });

    const participants = await contract.methods.getParticipants().call({
      from: coinbase,
    });

    assert.equal(participants.length, 3, `Should have 3 participants`);
    assert.equal(participants[0], accounts[0], `Participant should be ${accounts[0]}`);
    assert.equal(participants[1], accounts[1], `Participant should be ${accounts[1]}`);
    assert.equal(participants[2], accounts[2], `Participant should be ${accounts[2]}`);
  });

  it('Should require a minimum entering value', async () => {
    const account = accounts[1];

    try {
      await contract.methods.enter().send({
        from: account,
        value: web3.utils.toWei('0.0001', 'ether'),
        gas: 5000000,
      });

      // Fail the test if no error is thrown
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  // PICK WINNER
  it('Should pick a winner, transfer the money and clear the participants', async () => {
    await contract.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('1', 'ether'),
      gas: 5000000,
    });

    const initialBalance = await web3.eth.getBalance(accounts[2]);

    await contract.methods.pickWinner().send({
      from: coinbase,
      gas: 5000000,
    });

    const winnerBalance = await web3.eth.getBalance(accounts[2]);
    const contractBalance = await web3.eth.getBalance(contract.options.address);

    assert(winnerBalance >= initialBalance, 'Winner balance should be grater than their original balance');
    assert.equal(contractBalance, 0, 'Should transfer all contract money to the winner');

    const participants = await contract.methods.getParticipants().call({
      from: coinbase,
    });

    assert.equal(participants.length, 0, 'Should have zero participants');
  });

  it('Should fail picking a winner if caller is not manager', async () => {
    try {
      await contract.methods.enter().send({
        from: accounts[1],
        value: web3.utils.toWei('1', 'ether'),
        gas: 5000000,
      });

      await contract.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('1', 'ether'),
        gas: 5000000,
      });

      await contract.methods.enter().send({
        from: accounts[2],
        value: web3.utils.toWei('1', 'ether'),
        gas: 5000000,
      });

      await contract.methods.pickWinner().call({
        from: accounts[2],
      });

      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('Should fail picking a winner if there are no participants', async () => {
    try {
      await contract.methods.pickWinner().call({
        from: coinbase,
      });

      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('Should fail if trying to pick multiple winners at the same time', () => {
    contract.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('1', 'ether'),
      gas: 5000000,
    }).then(() => {
      const pickingPromise1 = contract.methods.pickWinner().call({
        from: coinbase,
      });

      const pickingPromise2 = contract.methods.pickWinner().call({
        from: coinbase,
      });

      Promise
        .all([pickingPromise1, pickingPromise2])
        .then(assert.fail)
        .catch((err) => {
          assert(err);
        });
    });
  });
});
