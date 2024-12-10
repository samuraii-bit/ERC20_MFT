import { ethers } from "hardhat";
import readline from "readline-sync";
import {contractAddress} from '../addresses.json';
import {decimals, name} from "../tokenInit";

async function main() {
    let transferAddress: string;
    let value: bigint;

    transferAddress = ethers.getAddress(readline.question("Please enter address u want to transfer your tokens: "));
    while (!ethers.isAddress(transferAddress)){
        transferAddress = ethers.getAddress(readline.question("An invalid adddress was entered. Please, try again: "));
    }

    value = BigInt(readline.question("Please enter the amount of tokens u want to transfer: "));
    while (value < 0){
        value = BigInt(readline.question("Please enter the amount equal or greater than 0: "));
    }

    const MyFirstToken = await ethers.getContractAt(name, contractAddress);
    const users = await ethers.getSigners();

    const tx = await MyFirstToken.connect(users[1]).transfer(transferAddress, ethers.parseUnits(String(value), decimals));
    const receipt = await tx.wait();

    if (receipt?.status === 1) {
        console.log(`${value} tokens successfully transfered to ${transferAddress}`);
    } else {
        console.error("Transaction failed");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});