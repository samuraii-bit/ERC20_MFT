import { ethers } from "hardhat";
import readline from "readline-sync";
import {contractAddress} from '../addresses.json';
import {decimals, name} from "../tokenInit";

async function main() {
    let allowAddress: string;
    let value: bigint;

    allowAddress = ethers.getAddress(readline.question("Please enter address u want to allow to transfer your tokens: "));
    while (!ethers.isAddress(allowAddress)){
        allowAddress = ethers.getAddress(readline.question("An invalid adddress was entered. Please, try again: "));
    }

    value = BigInt(readline.question("Please enter the amount of tokens you want to allow to transfer: "));
    while (value < 0){
        value = BigInt(readline.question("Please enter the amount equal or greater than 0: "));
    }

    const MyFirstToken = await ethers.getContractAt(name, contractAddress);
    const users = await ethers.getSigners();

    const tx = await MyFirstToken.connect(users[1]).approve(allowAddress, ethers.parseUnits(String(value), decimals));
    const receipt = await tx.wait();

    if (receipt?.status === 1) {
        console.log(`Now ${allowAddress} can transfer ${value} tokens from ${users[1].address}`);
    } else {
        console.error("Transaction failed");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});