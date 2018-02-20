import web3 from './web3';

const address = '0xf1d22458193e3d968b9a4356264AadB82ee367fe';
const abi = [{
	"constant": true,
	"inputs": [{
		"name": "",
		"type": "uint256"
	}],
	"name": "participants",
	"outputs": [{
		"name": "",
		"type": "address"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "manager",
	"outputs": [{
		"name": "",
		"type": "address"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "getParticipants",
	"outputs": [{
		"name": "",
		"type": "address[]"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"constant": false,
	"inputs": [],
	"name": "pickWinner",
	"outputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"constant": false,
	"inputs": [],
	"name": "enter",
	"outputs": [],
	"payable": true,
	"stateMutability": "payable",
	"type": "function"
}, {
	"constant": true,
	"inputs": [],
	"name": "lastWinner",
	"outputs": [{
		"name": "",
		"type": "address"
	}],
	"payable": false,
	"stateMutability": "view",
	"type": "function"
}, {
	"inputs": [],
	"payable": false,
	"stateMutability": "nonpayable",
	"type": "constructor"
}];

export default new web3.eth.Contract(abi, address);
