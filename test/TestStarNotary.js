const StarNotary = artifacts.require("StarNotary");

const { toBN, toWei } = web3.utils;
const { getBalance } = web3.eth;

contract('StarNotary', accounts => {
    it('can Create a Star', async () => {
        let instance = await StarNotary.deployed();

        const tokenId = 1;

        await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] });
        assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!');
    });

    it('lets user1 put up their star for sale', async () => {
        let instance = await StarNotary.deployed();

        const starId = 2;
        const starPrice = toWei(".01", "ether");
        const user = accounts[1];

        await instance.createStar('awesome star', starId, { from: user });
        await instance.putStarUpForSale(starId, starPrice, { from: user });

        assert.equal(await instance.starsForSale.call(2), starPrice);
    });

    it('lets user1 get the funds after the sale', async () => {
        let instance = await StarNotary.deployed();

        const user1 = accounts[1];
        const user2 = accounts[2];
        const starId = 3;
        const starPrice = toWei(".01", "ether");
        const transferAmount = toWei(".05", "ether");

        await instance.createStar('awesome star', starId, { from: user1 });
        await instance.putStarUpForSale(starId, starPrice, { from: user1 });

        let balanceOfUser1BeforeTransaction = await getBalance(user1);
        await instance.buyStar(starId, { from: user2, value: transferAmount });
        let balanceOfUser1AfterTransaction = await getBalance(user1);

        assert.equal(toBN(balanceOfUser1BeforeTransaction).add(toBN(starPrice)).toString(), balanceOfUser1AfterTransaction);
    });

    it('lets user2 buy a star, if it is put up for sale', async () => {
        let instance = await StarNotary.deployed();

        const user1 = accounts[1];
        const user2 = accounts[2];
        const starId = 4;
        const starPrice = toWei(".01", "ether");
        const balance = toWei(".05", "ether");

        await instance.createStar('awesome star', starId, { from: user1 });
        await instance.putStarUpForSale(starId, starPrice, { from: user1 });
        await instance.buyStar(starId, { from: user2, value: balance });

        assert.equal(await instance.ownerOf.call(starId), user2);
    });

    it('lets user2 buy a star and decreases its balance in ether', async () => {
        let instance = await StarNotary.deployed();

        const user1 = accounts[1];
        const user2 = accounts[2];
        const starId = 5;
        const starPrice = toWei(".01", "ether");
        const balance = toWei(".05", "ether");
        const gasPrice = 7; // Minimum gas price that truffle allows

        await instance.createStar('awesome star', starId, { from: user1 });
        await instance.putStarUpForSale(starId, starPrice, { from: user1 });

        const balanceOfUser2BeforeTransaction = await getBalance(user2);
        const tx = await instance.buyStar(starId, { from: user2, value: balance, gasPrice: gasPrice }); // gasPrice cannot be set to zero in newer versions of truffle?
        const balanceAfterUser2BuysStar = await getBalance(user2);

        const gasFee = toBN(tx.receipt.gasUsed).mul(toBN(gasPrice));
        const calculatedStarPrice = toBN(balanceOfUser2BeforeTransaction).sub(toBN(balanceAfterUser2BuysStar)).sub(gasFee).toString();

        assert.equal(calculatedStarPrice, starPrice);
    });

    it('can add the star name and star symbol properly', async () => {
        let instance = await StarNotary.deployed();

        const starId = 6;

        await instance.createStar('Awesome Star!', starId, { from: accounts[0] });

        assert.equal(await instance.name.call(), 'StarNotary');
        assert.equal(await instance.symbol.call(), 'SN');
    });

    it('lets 2 users exchange stars', async () => {
        let instance = await StarNotary.deployed();

        const user1 = accounts[1];
        const user2 = accounts[2];

        const starId1 = 7;
        const starId2 = 8;

        await instance.createStar('awesome star 1', starId1, { from: user1 });
        await instance.createStar('awesome star 2', starId2, { from: user2 });

        await instance.exchangeStars(starId1, starId2, { from: user1 });

        assert.equal(await instance.ownerOf.call(starId1), user2);
        assert.equal(await instance.ownerOf.call(starId2), user1);
    });

    it('lets a user transfer a star', async () => {
        let instance = await StarNotary.deployed();

        const user1 = accounts[1];
        const user2 = accounts[2];

        const starId = 9;

        await instance.createStar('awesome star', starId, { from: user1 });
        await instance.transferStar(user2, starId, { from: user1 });

        assert.equal(await instance.ownerOf.call(starId), user2);
    });

    it('lookUptokenIdToStarInfo test', async () => {
        let instance = await StarNotary.deployed();

        const starId = 10;

        await instance.createStar('awesome star', starId, { from: accounts[0] });
        assert.equal(await instance.lookUptokenIdToStarInfo.call(starId), 'awesome star');
    });
})
