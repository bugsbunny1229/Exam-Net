/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Response } from 'express';
import FabricCAServices, { IAttributeRequest } from 'fabric-ca-client';
import { Identity, X509Identity } from 'fabric-network';
/**
 *
 * @param {*} ccp
 */
const buildCAClient = (
  ccp: Record<string, any>,
  caHostName: string,
): FabricCAServices => {
  // Create a new CA client for interacting with the CA.
  const caInfo = ccp.certificateAuthorities[caHostName]; // lookup CA details from config
  const caTLSCACerts = caInfo.tlsCACerts.pem;
  const caClient = new FabricCAServices(
    caInfo.url,
    { trustedRoots: caTLSCACerts, verify: false },
    caInfo.caName,
  );

  console.log(`Built a CA Client named ${caInfo.caName}`);
  return caClient;
};

const enrollUser = async (
  caClient: FabricCAServices,
  mspId: string,
  userId: string,
  secret: string,
  attributes?: IAttributeRequest[],
): Promise<Identity> => {
  // Check to see if we've already enrolled the user

  const enrollment = await caClient.enroll({
    enrollmentID: userId,
    enrollmentSecret: secret,
    attr_reqs: attributes,
  });
  const x509Identity: X509Identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes(),
    },
    mspId,
    type: 'X.509',
  };
  console.log(
    `Successfully registered user ${userId}`,
  );
  return x509Identity;
};

const issueIdentity = async (
  res: Response,
  username: string,
  secret: string,
  caClient: FabricCAServices,
  mspId: string,
  attributes: FabricCAServices.IAttributeRequest[],
) => {
  // setup the wallet to hold the credentials of the application user
  try {
    const identity = await enrollUser(caClient, mspId, username, secret, attributes);
    res.json({ identity: JSON.stringify(identity) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { buildCAClient, enrollUser, issueIdentity };
