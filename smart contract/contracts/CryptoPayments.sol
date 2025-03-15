// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CryptoPayments {
    mapping(address => string) private usersWithAccess;

    constructor(address[] memory walletAddresses, string[] memory roles) {
        require(
            walletAddresses.length == roles.length,
            "Arrays must be the same length"
        );

        for (uint i = 0; i < walletAddresses.length; i++) {
            usersWithAccess[walletAddresses[i]] = roles[i];
        }
    }

    function checkUserAccess(
        address user
    ) external view returns (string memory) {
        bytes memory role = bytes(usersWithAccess[user]);
        if (role.length > 0) {
            return usersWithAccess[user];
        } else {
            return "forbidden";
        }
    }

    function giveAccessToEmployee(
        address wallet,
        string memory role
    ) external returns (bool) {
        usersWithAccess[wallet] = role;
        return true;
    }
}
