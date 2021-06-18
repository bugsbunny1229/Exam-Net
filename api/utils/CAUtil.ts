/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import FabricCAServices, { IAttributeRequest } from 'fabric-ca-client';
import { Identity } from 'fabric-network';

const orgMspId = 'ExaminersMSP';
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
  const x509Identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes(),
    },
    mspId: orgMspId,
    type: 'X.509',
  };
  console.log(
    `Successfully registered user ${userId}`,
  );
  return x509Identity;
};

export { buildCAClient, enrollUser };
