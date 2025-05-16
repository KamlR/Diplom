// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "hardhat/console.sol";

struct UserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
}

interface IEntryPoint {
    function depositTo(address sca) external payable;
}

contract CryptoPayments {
    mapping(address => string) private usersWithAccess;
    IEntryPoint public entryPoint;
    uint256 public feePercent = 5;

    constructor(
        address[] memory walletAddresses,
        string[] memory roles,
        address _entryPoint
    ) {
        require(
            walletAddresses.length == roles.length,
            "Arrays must be the same length"
        );

        for (uint i = 0; i < walletAddresses.length; i++) {
            usersWithAccess[walletAddresses[i]] = roles[i];
        }
        entryPoint = IEntryPoint(_entryPoint);
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
        require(
            bytes(usersWithAccess[wallet]).length == 0,
            "User already has access"
        );
        usersWithAccess[wallet] = role;
        return true;
    }

    function paySalary(
        address[] calldata addresses,
        uint256[] calldata salaries
    ) external {
        console.log("Hello from SCA");
        //require(msg.sender == address(ENTRY_POINT), "Not from EntryPoint");

        //require(recipients.length == amounts.length, "Mismatched array lengths");

        for (uint256 i = 0; i < addresses.length; i++) {
            console.log(addresses[i]);
            console.log(salaries[i]);
            address payable to = payable(addresses[i]);
            uint256 amount = salaries[i];
            require(address(this).balance >= amount, "Insufficient balance");

            (bool sent, ) = to.call{value: amount}("");
        }
    }

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) external view returns (uint256) {
        bytes memory sig = userOp.signature;
        uint256 sigCount = sig.length / 65;

        require(sigCount > 0, "No signatures provided");
        bytes32 userOpHashWithPrefix = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", userOpHash)
        );
        for (uint i = 0; i < sigCount; i++) {
            bytes32 r;
            bytes32 s;
            uint8 v;

            assembly {
                r := mload(add(sig, add(32, mul(i, 65))))
                s := mload(add(sig, add(64, mul(i, 65))))
                v := byte(0, mload(add(sig, add(96, mul(i, 65)))))
            }
            address recoveredAddress = ecrecover(userOpHashWithPrefix, v, r, s);
            console.log("recoveredAddress:");
            console.log(recoveredAddress);
            bytes memory roleBytes = bytes(usersWithAccess[recoveredAddress]);
            require(
                roleBytes.length > 0,
                "Signer not found in usersWithAccess"
            );

            bytes4 selector = bytes4(userOp.callData[:4]);
            if (
                selector ==
                bytes4(keccak256("giveAccessToEmployee(address,string)"))
            ) {
                require(
                    keccak256(roleBytes) == keccak256(bytes("admin")),
                    "Signer must be admin"
                );
            } else {
                require(
                    keccak256(roleBytes) == keccak256(bytes("accountant")),
                    "Signer must be accountant"
                );
            }
        }
        return 0;
    }

    receive() external payable {
        console.log("SCA receive money");
        uint256 fee = (msg.value * feePercent) / 100;
        if (fee > 0) {
            entryPoint.depositTo{value: fee}(address(this));
            console.log("The money was sent to EntryPoint");
        }
    }
}
