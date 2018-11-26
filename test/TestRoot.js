const Root = artifacts.require('./Root.sol');
const DNSSEC = artifacts.require('./mocks/DummyDNSSEC.sol');
const ENS = artifacts.require('./ENSRegistry.sol');

const utils = require('./helpers/Utils.js');
const namehash = require('eth-ens-namehash');

contract('Root', function(accounts) {

    let node;
    let ens, dnssec, root;

    beforeEach(async function() {
        node = namehash.hash('eth');

        ens = await ENS.new();
        dnssec = await DNSSEC.new();
        root = await Root.new(ens.address, dnssec.address);

        await ens.setSubnodeOwner(0, web3.sha3('eth'), root.address, {from: accounts[0]});
        await ens.setOwner(0, root.address);
    });

    describe('setSubnodeOwner', async () => {

        it('should fail when trying to set subnode owner for non root domain', async () => {
            try {
                await root.setSubnodeOwner(web3.sha3('eth'), '0x123', accounts[1], {from: accounts[0]});
            } catch (error) {
                return utils.ensureException(error);
            }
        });

        it('should allow setting subnode when trying to owner for root domain', async () => {
            await root.setSubnodeOwner(0, web3.sha3('eth'), accounts[1], {from: accounts[0]});
            assert.equal(accounts[1], await ens.owner(node));
        });
    });

    it('should allow transferring ownership of the root node', async () => {
        assert.equal(root.address, await ens.owner(0));
        await root.transferRoot(accounts[1]);
        assert.equal(accounts[1], await ens.owner(0));
    });
});
