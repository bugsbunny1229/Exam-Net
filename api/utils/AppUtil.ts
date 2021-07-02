/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Wallet, Wallets } from 'fabric-network';
import fs from 'fs';
import path from 'path';

const buildCCPExaminers = (): Record<string, any> => {
  // load the common connection configuration file
  const ccpPath = path.resolve(
    '../network/organizations/peerOrganizations/examiners.iiitm.com/connection-examiners.json',
  );
  const fileExists = fs.existsSync(ccpPath);
  if (!fileExists) {
    throw new Error(`no such file or directory: ${ccpPath}`);
  }
  const contents = fs.readFileSync(ccpPath, 'utf8');

  // build a JSON object from the file contents
  const ccp = JSON.parse(contents);

  console.log(`Loaded the network configuration located at ${ccpPath}`);
  return ccp;
};

const buildCCPStudents = (): Record<string, any> => {
  // load the common connection configuration file
  const ccpPath = path.resolve(
    '../network/organizations/peerOrganizations/students.iiitm.com/connection-students.json',
  );
  const fileExists = fs.existsSync(ccpPath);
  if (!fileExists) {
    throw new Error(`no such file or directory: ${ccpPath}`);
  }
  const contents = fs.readFileSync(ccpPath, 'utf8');

  // build a JSON object from the file contents
  const ccp = JSON.parse(contents);

  console.log(`Loaded the network configuration located at ${ccpPath}`);
  return ccp;
};

const buildWallet = async (walletPath?: string): Promise<Wallet> => {
  // Create a new  wallet : Note that wallet is for managing identities.
  let wallet: Wallet;
  if (walletPath) {
    wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Built a file system wallet at ${walletPath}`);
  } else {
    wallet = await Wallets.newInMemoryWallet();
    console.log('Built an in memory wallet');
  }

  return wallet;
};

const prettyJSONString = (inputString: string): string => {
  if (inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
  }
  return inputString;
};

export {
  buildCCPExaminers, buildCCPStudents, buildWallet, prettyJSONString,
};
