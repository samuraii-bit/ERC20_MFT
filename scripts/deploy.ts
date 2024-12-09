import { writeFileSync } from 'fs';
import { ethers } from "hardhat";

async function main() {
    const MyFirstToken = await ethers.getContractFactory("MyFirstToken");
    const myFirstToken = await MyFirstToken.deploy();

    await myFirstToken.waitForDeployment();

    console.log(`Contract deployed to: ${myFirstToken.target}`);
    const addresses = {contractAddress: myFirstToken.target, ownerAddress: myFirstToken.deploymentTransaction()?.from};
    writeFileSync("addresses.json", JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});