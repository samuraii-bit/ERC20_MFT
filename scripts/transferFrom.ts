import { ethers } from "hardhat";
import readline from "readline-sync";
import {contractAddress} from '../addresses.json';
import {decimals, name} from "../tokenInit";

async function main() {
    let transferFromAddress: string;
    let value: bigint;

    transferFromAddress = ethers.getAddress(readline.question("Please enter the address from which you want to transfer tokens: "));
    while (!ethers.isAddress(transferFromAddress)){
        transferFromAddress = ethers.getAddress(readline.question("An invalid adddress was entered. Please, try again: "));
    }

    value = BigInt(readline.question("Please enter the amount of tokens u want to transfer: "));
    while (value < 0){
        value = BigInt(readline.question("Please enter the amount equal or greater than 0: "));
    }

    const MyFirstToken = await ethers.getContractAt(name, contractAddress);
    const users = await ethers.getSigners();

    const tx = await MyFirstToken.connect(users[2]).transferFrom(transferFromAddress, users[2].address, ethers.parseUnits(String(value), decimals));
    const receipt = await tx.wait();

    if (receipt?.status === 1) {
        console.log(`${value} tokens successfully transfered from ${transferFromAddress} to ${users[2].address}`);
    } else {
        console.error("Transaction failed");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});