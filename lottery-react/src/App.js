import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import lottery from './lottery';

class App extends Component {
  state = {
    manager: '',
    participants: [],
    balance: '',
    value: '',
  };

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const participants = await lottery.methods.getParticipants().call();
    const balance = await web3.eth.getBalance(lottery.options.address);

    this.setState({
      manager: manager,
      participants: participants,
      balance: balance,
      value: '',
      message: '',
    });
  }

  onEnter = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({message: 'Entering the raffle...'});

    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether'),
    });

    this.setState({message: `You have entered the raffle with ${this.state.value} ether`});
  };

  onPickWinner = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({message: 'And the winner is...'});

    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });

    const winner = await lottery.methods.lastWinner().call();

    this.setState({message: `And the winner is ${winner}`});
  };

  render() {
    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>This contract is managed by {this.state.manager}</p>
        <p>There are currently {this.state.participants.length} people entered, competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether.</p>

        <hr />

        <form onSubmit={this.onEnter}>
          <h4>Enter the raffle!</h4>
          <div>
            <label>Ether to enter&nbsp;</label>
            <input
              onChange={event => this.setState({ value: event.target.value })}
              value={this.state.value}
            />
          </div>
          <button type="submit">Enter</button>
        </form>
        <hr />
        <h1>{this.state.message}</h1>
        <hr />
        <h4>Pick a winner...</h4>
        <button onClick={this.onPickWinner}>Pick</button>
      </div>
    );
  }
}

export default App;
