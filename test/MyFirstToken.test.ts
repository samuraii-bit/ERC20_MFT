import {loadFixture, ethers, expect} from "./setup";
import {name, symbol, decimals, initialSupply} from "../tokenInit";

describe("Testing MyFirstToken", function() {

    async function deploy() {
        const users = await ethers.getSigners();
    
        const Factory = await ethers.getContractFactory(name);
        const myFirstToken = await Factory.deploy(name,  symbol, decimals, initialSupply);
        await myFirstToken.waitForDeployment();

        return {users, myFirstToken};
    }

    it("Deployment test", async function(){
      const {myFirstToken} = await loadFixture(deploy);
      expect(myFirstToken.target).to.be.properAddress;
    });

    it("Mint test: mint 100 tokens for owner", async function(){
      const {users, myFirstToken} = await loadFixture(deploy);
      const owner = users[0];
      const sum = ethers.parseUnits("100", decimals);
      const checkSupply = await myFirstToken.totalSupply();

      const tx = await myFirstToken.connect(owner).mint(owner.address, sum);
      await expect(tx).to.changeTokenBalance(myFirstToken, owner.address, sum);
      expect(tx).emit(myFirstToken, "Mint").withArgs(owner.address, sum);
        
      const currSupply = await myFirstToken.totalSupply();
      expect(BigInt(currSupply)).eq(BigInt(sum) + checkSupply);
    });

    it("Mint test: mint 100 tokens for users[1]", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const owner = users[0];
        const sum = ethers.parseUnits("100", decimals);
        const checkSupply = await myFirstToken.totalSupply();
        
        const tx = await myFirstToken.connect(owner).mint(users[1], sum);
        await expect(tx).to.changeTokenBalance(myFirstToken, users[1], sum);
        expect(tx).emit(myFirstToken, "Mint").withArgs(users[1], sum);
        
        const currSupply = await myFirstToken.totalSupply();
        expect(BigInt(currSupply)).eq(BigInt(sum) + checkSupply);
    });

    it("Mint test: trying to call mint function as a non-owner", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const owner = users[0];
        const sum = ethers.parseUnits("100", decimals);

        const tx = await myFirstToken.connect(users[1]);
        await expect(tx.mint(users[1], sum)).to.be.revertedWith("Only owner can mint tokens");
    });

    it("Burn test: trying to call burn function as a non-owner", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const owner = users[0];
        const sum = ethers.parseUnits("100", decimals);
        
        const tx1 = await myFirstToken.connect(owner).mint(users[1], sum);
        await expect(tx1).changeTokenBalance(myFirstToken, users[1], sum);

        const tx2 = await myFirstToken.connect(users[1]);
        await expect(tx2.burn(users[1], sum)).to.be.revertedWith("Only owner can burn tokens");
    });

    it("Burn test: trying to call function with invalid value", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const owner = users[0];
        const sum1 = ethers.parseUnits("100", decimals);
        const sum2 = ethers.parseUnits("101", decimals);

        
        const tx1 = await myFirstToken.connect(owner).mint(users[1], sum1);
        await expect(tx1).changeTokenBalance(myFirstToken, users[1], sum1);

        const tx2 = await myFirstToken.connect(owner);
        await expect(tx2.burn(users[1], sum2)).to.be.revertedWith("There are not enough tokens to burn them");
    });

    it("Burn test: burn 100 tokens from users[1]", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const owner = users[0];
        const sum = ethers.parseUnits("100", decimals);
        const checkSupply = await myFirstToken.totalSupply();
        
        const tx1 = await myFirstToken.connect(owner).mint(users[1].address, sum);
        await expect(tx1).changeTokenBalance(myFirstToken, users[1], sum);
        expect(tx1).emit(myFirstToken, "Mint").withArgs(users[1].address, sum);
        
        const currSupply = await myFirstToken.totalSupply();
        expect(BigInt(currSupply)).eq(BigInt(sum) + checkSupply);

        const tx2 = await myFirstToken.connect(owner).burn(users[1].address, sum);
        await expect(tx2).changeTokenBalance(myFirstToken, users[1], -sum);
        expect(tx2).emit(myFirstToken, "Burn").withArgs(users[1], sum);

        const currSupply1 = await myFirstToken.totalSupply();
        expect(BigInt(currSupply1)).eq(checkSupply);
    });

    it("totalSupply test: simple call of a function", async function(){
        const {myFirstToken} = await loadFixture(deploy);
        const TotalSupply = await myFirstToken.totalSupply();
        expect(TotalSupply).to.equal(initialSupply);
    });

    it("totalSupply test: check changes after 1 mint", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const sum = ethers.parseUnits("200", decimals);
        await myFirstToken.connect(users[0]).mint(users[1].address, sum);
        const TotalSupply = await myFirstToken.totalSupply();
        expect(TotalSupply).to.equal(BigInt(sum) + initialSupply);
    });

    it("totalSupply test: check changes after 2 mints", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const sum = ethers.parseUnits("200", decimals);
        await myFirstToken.connect(users[0]).mint(users[1].address, sum);
        await myFirstToken.connect(users[0]).mint(users[2].address, sum);
        const TotalSupply = await myFirstToken.totalSupply();
        expect(TotalSupply).to.equal(initialSupply + sum + sum);
    });

    it("balanceOf test: mint tokens once and check balance of users[1]", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const sum = ethers.parseUnits("300", decimals);
        await myFirstToken.connect(users[0]).mint(users[1], sum);
        const balance = await myFirstToken.balanceOf(users[1].address);
        expect(balance).to.equal(sum); 
    });

    it("balanceOf test: mint tokens twice once and check balance of users[1]", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const sum1 = ethers.parseUnits("300", decimals);
        const sum2 = ethers.parseUnits("500", decimals);
        await myFirstToken.connect(users[0]).mint(users[1], sum1);
        await myFirstToken.connect(users[0]).mint(users[1], sum2);
        const balance = await myFirstToken.balanceOf(users[1].address);
        expect(balance).to.equal(sum1 + sum2); 
    });

    it("transfer test: trying to call a function with amount exceeding the amount on the balance", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const sum1 = ethers.parseUnits("100", decimals);
        const sum2 = ethers.parseUnits("100", decimals);
        await myFirstToken.connect(users[0]).mint(users[1], sum1);
        const tx = await myFirstToken.connect(users[1]);
        await expect(tx.transfer(users[2], sum2 + sum1)).to.be.revertedWith("There are not enough funds on the balance sheet");
    });

    it("transfer test: transfer all tokens from users[1] to users[2]", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const sum1 = ethers.parseUnits("100", decimals);
        const sum2 = ethers.parseUnits("100", decimals);
        await myFirstToken.connect(users[0]).mint(users[1], sum1);
        const tx = await myFirstToken.connect(users[1]).transfer(users[2].address, sum2);

        await expect(tx).to.changeTokenBalance(myFirstToken, users[1], -sum2);
        await expect(tx).to.changeTokenBalance(myFirstToken, users[2], sum2);
        expect(tx).to.emit(myFirstToken, "Transfer").withArgs(users[1], users[2], sum2);
    });

    it("approve test: allow users[2] to transfer tokens from users[1]", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const sum1 = ethers.parseUnits("500", decimals);
        const sum2 = ethers.parseUnits("500", decimals);
        await myFirstToken.connect(users[0]).mint(users[1].address, sum1);
        const tx = await myFirstToken.connect(users[1]).approve(users[2].address, sum2);
        
        expect(tx).to.emit(myFirstToken, "Approval").withArgs(users[1].address, users[2].address, sum2);
    });

    it("transferFrom test: trying to transfer tokens without permission", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const tx = await myFirstToken.connect(users[1]);
        await expect(tx.transferFrom(users[2].address, users[1].address, 1)).to.be.revertedWith("At first u have to get a permission for the transfer");
    });

    it("transferFrom test: trying to transfer an amount of tokens exceeding the amount of tokens on balance sheet from users[1] to users[2] ", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const sum1 = ethers.parseUnits("100", decimals); 
        const sum2 = ethers.parseUnits("101", decimals);
        await myFirstToken.connect(users[0]).mint(users[1], sum1);
        await myFirstToken.connect(users[1]).approve(users[2], sum2);
        const tx = myFirstToken.connect(users[2]);

        await expect(tx.transferFrom(users[1].address, users[2].address, sum2)).to.be.revertedWith("There are not enough funds on the balance sheet");
    });

    it("transferFrom test: allow users[2] transfer tokens from users[1], then transfer tokens from users[1] to users[2]", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const sum1 = ethers.parseUnits("100", decimals);
        const sum2 = ethers.parseUnits("100", decimals);
        await myFirstToken.connect(users[0]).mint(users[1], sum1);
        await myFirstToken.connect(users[1]).approve(users[2], sum2);

        const tx = myFirstToken.connect(users[2]).transferFrom(users[1], users[2], sum2);

        await expect(tx).to.changeTokenBalance(myFirstToken, users[1].address, -sum2);
        await expect(tx).to.changeTokenBalance(myFirstToken, users[2].address, sum2);
        expect(tx).to.emit(myFirstToken, "Approval").withArgs(users[1].address, users[2].address, sum2);
    });

    it("transferFrom test: allow users[2] transfer tokens from users[1], then trying to transfer tokens from users[1] to users[3]", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const sum1 = ethers.parseUnits("100", decimals);
        const sum2 = ethers.parseUnits("100", decimals);
        await myFirstToken.connect(users[0]).mint(users[1], sum1);
        await myFirstToken.connect(users[1]).approve(users[2], sum2);

        const tx = myFirstToken.connect(users[2]);

        await expect(tx.transferFrom(users[1], users[3], sum2)).to.be.revertedWith("At first u have to get a permission for the transfer");
    });
});