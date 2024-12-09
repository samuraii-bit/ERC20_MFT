import {loadFixture, ethers, expect} from "./setup";

describe("Testing MyFirstToken", function() {
    async function deploy() {
        const users = await ethers.getSigners();
    
        const Factory = await ethers.getContractFactory("MyFirstToken");
        const myFirstToken = await Factory.deploy();
        await myFirstToken.waitForDeployment();

        return {users, myFirstToken};
    }
    
    it("Deployment test", async function(){
      const {myFirstToken} = await loadFixture(deploy);
      expect(myFirstToken.target).to.be.properAddress;
    });

    it("Mint test: mint 10 tokens for owner", async function(){
      const {users, myFirstToken} = await loadFixture(deploy);
      const owner = users[0];
      const sum = 1000000000;
      const checkSupply = await myFirstToken.TotalSupply();

      const tx = await myFirstToken.connect(owner).mint(owner.address, sum);
      expect(tx).changeTokenBalance(myFirstToken, owner.address, sum);
      expect(tx).emit(myFirstToken, "Mint");
        
      const currSupply = await myFirstToken.TotalSupply();
      expect(BigInt(currSupply)).eq(BigInt(sum) + checkSupply);
    });

    it("Mint test: mint 10 tokens for users[1]", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const owner = users[0];
        const sum = 1000000000;
        const checkSupply = await myFirstToken.TotalSupply();
        
        const tx = await myFirstToken.connect(owner).mint(users[1], sum);
        expect(tx).changeTokenBalance(myFirstToken, users[1], sum);
        expect(tx).emit(myFirstToken, "Mint");
        
        const currSupply = await myFirstToken.TotalSupply();
        expect(BigInt(currSupply)).eq(BigInt(sum) + checkSupply);
    });

    it("Mint test: trying to call mint function as a non-owner", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const owner = users[0];
        const sum = 1000000000;

        const tx = await myFirstToken.connect(users[1]);
        expect(tx.mint(users[1], sum)).to.be.revertedWith("Only owner can mint tokens");
    });

    it("Mint test: trying to call mint function with 0-address as \"_to\" argument", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const owner = users[0];
        const sum = 1000000000;

        const tx = await myFirstToken.connect(owner);
        expect(tx.mint(ethers.ZeroAddress, sum)).to.be.revertedWith("Invalid receiver address");
    });

    it("Burn test: trying to call burn function as a non-owner", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const owner = users[0];
        const sum = 1000000000;
        
        const tx1 = await myFirstToken.connect(owner).mint(users[1], sum);
        expect(tx1).changeTokenBalance(myFirstToken, users[1], sum);

        const tx2 = await myFirstToken.connect(users[1]);
        expect(tx2.burn(users[1], sum)).to.be.revertedWith("Only owner can burn tokens");
    });

    it("Burn test: trying to call burn function with 0-address as \"_from\" argument", async function(){
        const {users, myFirstToken} = await loadFixture(deploy);
        const owner = users[0];
        const sum = 1000000000;
        
        const tx1 = await myFirstToken.connect(owner).mint(users[1], sum);
        expect(tx1).changeTokenBalance(myFirstToken, users[1], sum);

        const tx2 = await myFirstToken.connect(owner);
        expect(tx2.burn(ethers.ZeroAddress, sum)).to.be.revertedWith("Invalid receiver address");
    });
});