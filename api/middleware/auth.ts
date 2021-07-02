import { Request, Response, NextFunction } from 'express';
import {
  Gateway, GatewayOptions, Identity, Wallet, Contract,
} from 'fabric-network';
import { buildWallet } from '../utils/AppUtil';

const channelName = 'examinerchannel';
const mainChannelName = 'mainchannel';
const chaincodeName = 'examinercontract';
const studentChaincodeName = 'studentcontract';

const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
  ccp: Record<string, any>,
) => {
  const { username, id }: { username: string, id: string } = req.body;
  if (username && id) {
    try {
      const identity: Identity = JSON.parse(JSON.parse(id).identity);
      let wallet: Wallet = await buildWallet();
      await wallet.put(username, identity);
      try {
        const gateway = new Gateway();

        const gatewayOpts: GatewayOptions = {
          wallet,
          identity: username,
          discovery: { enabled: true, asLocalhost: true },
          // using asLocalhost as this gateway is using a fabric network deployed locally
        };
        wallet = null;
        await gateway.connect(ccp, gatewayOpts);

        // Build a network instance based on the channel where the smart contract is deployed
        const network = await gateway.getNetwork(channelName);
        const mainNetwork = await gateway.getNetwork(mainChannelName);

        // Get the contract from the network.
        const contract: Contract = network.getContract(chaincodeName);
        const studentContract: Contract = mainNetwork.getContract(studentChaincodeName);
        res.locals.contract = contract;
        res.locals.studentContract = studentContract;
        return next();
      } catch (err) {
        return res.status(401).send(`Failed to connect to gateway: ${err.message}`);
      }
    } catch (err2) {
      return res.status(400).json({ error: `Invalid identity: ${err2.message}` });
    }
  } else {
    return res.status(400).json({ error: 'Username and identity are both required' });
  }
};

export default isAuth;
