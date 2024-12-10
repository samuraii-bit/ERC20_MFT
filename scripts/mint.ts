import { ethers } from "hardhat";
import readline from "readline-sync";
import {contractAddress} from '../addresses.json';
import {decimals, name} from "../tokenInit";

async function main() {
    let mintAddress: string;
    let value: bigint;

    mintAddress = ethers.getAddress(readline.question("Please enter the address for which u want mint tokens: "));
    while (!ethers.isAddress(mintAddress)){
        mintAddress = ethers.getAddress(readline.question("An invalid adddress was entered. Please, try again: "));
    }

    value = BigInt(readline.question("Please enter the amount of tokens you want to mint: "));
    while (value < 0){
        value = BigInt(readline.question("Please enter the amount equal or greater than 0: "));
    }

    const MyFirstToken = await ethers.getContractAt(name, contractAddress);
    const users = await ethers.getSigners();

    const tx = await MyFirstToken.connect(users[0]).mint(mintAddress, ethers.parseUnits(String(value), decimals));
    const receipt = await tx.wait();

    if (receipt?.status === 1) {
        console.log(`${value} tokens successfully minted on ${mintAddress}`);
    } else {
        console.error("Transaction failed");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});