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

interface IAccount {
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) external returns (uint256);
}

contract EntryPoint {
    mapping(address => uint256) public deposits;

    function depositTo(address account) external payable {
        console.log("EntryPoint receive money");
        require(msg.value > 0, "Must send ETH to deposit");
        deposits[account] += msg.value;
    }

    function handleOps(UserOperation[] calldata ops) external {
        for (uint i = 0; i < ops.length; i++) {
            UserOperation calldata op = ops[i];
            uint256 startGas = gasleft();

            (bool success, ) = op.sender.call{gas: op.callGasLimit}(
                op.callData
            );

            // === Компенсация бандлеру ===
            uint256 gasUsed = startGas - gasleft();
            uint256 gasPrice = min(op.maxFeePerGas, tx.gasprice);
            uint256 refund = gasUsed * gasPrice + 44041 * tx.gasprice;
            deposits[op.sender] -= refund;
            payable(msg.sender).transfer(refund);
            require(success, "SCA call failed");
        }
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function validateUserOp(UserOperation calldata userOp) external {
        require(
            deposits[userOp.sender] >=
                userOp.callGasLimit * userOp.maxFeePerGas,
            "Not enough money in SCA deposit to pay for gas"
        );

        bytes32 userOpHash = getUserOpHash(userOp);
        IAccount(userOp.sender).validateUserOp(userOp, userOpHash);
    }

    function getUserOpHash(
        UserOperation calldata userOp
    ) public view returns (bytes32) {
        bytes32 userOpPackHash = keccak256(
            abi.encode(
                userOp.sender,
                userOp.nonce,
                keccak256(userOp.initCode),
                keccak256(userOp.callData),
                userOp.callGasLimit,
                userOp.verificationGasLimit,
                userOp.preVerificationGas,
                userOp.maxFeePerGas,
                userOp.maxPriorityFeePerGas,
                keccak256(userOp.paymasterAndData)
            )
        );
        return
            keccak256(abi.encode(userOpPackHash, address(this), block.chainid));
    }
}
