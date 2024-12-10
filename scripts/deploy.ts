import { writeFileSync } from 'fs';
import { ethers } from "hardhat";
import {name, symbol, decimals, initialSupply} from "../tokenInit";

async function main() {
    const MyFirstToken = await ethers.getContractFactory(name);
    const myFirstToken = await MyFirstToken.deploy(name, symbol, decimals, initialSupply);

    await myFirstToken.waitForDeployment();

    console.log(`Contract deployed to: ${myFirstToken.target}`);
    const addresses = {contractAddress: myFirstToken.target, ownerAddress: myFirstToken.deploymentTransaction()?.from};
    writeFileSync("addresses.json", JSON.stringify(addresses, null, 2));
    if (receipt?.status === 1) {
        console.log(`${value} tokens successfully burned from ${burnAddress}`);
    } else {
        console.error("Transaction failed");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});