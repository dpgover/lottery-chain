pragma solidity ^0.4.18;

contract Lottery {
    address public manager;
    address[] public participants;
    bool locked = false;

    function Lottery() public {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > 0.01 ether);

        participants.push(msg.sender);
    }

    function getParticipants() public view returns (address[]) {
        return participants;
    }

    function pickWinner() public onlyOwner ifPlayers lock {
        uint index = rng(participants.length);
        address winner = participants[index];

        delete participants;

        winner.transfer(this.balance);
    }

    function rng(uint max) internal view returns (uint) {
        require(max > 0);

        return uint(keccak256(block.difficulty, now, participants)) % max;
    }

    modifier onlyOwner() {
        require(msg.sender == manager);
        _;
    }

    modifier ifPlayers() {
        require(participants.length > 0);
        _;
    }

    modifier lock() {
        require(locked == false);

        locked = true;
        _;
        locked = false;
    }
}
