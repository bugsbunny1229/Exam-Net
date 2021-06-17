export PATH=$PATH:${PWD}/../bin
export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/examiners.iiitm.com/
fabric-ca-client register --caname ca-examiners --id.name peer1 --id.secret peer1pw --id.type peer --tls.certfiles ${PWD}/organizations/fabric-ca/examiners/tls-cert.pem

mkdir -p organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com
fabric-ca-client enroll -u https://peer1:peer1pw@localhost:7054 --caname ca-examiners -M ${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/msp --csr.hosts peer1.examiners.iiitm.com --tls.certfiles ${PWD}/organizations/fabric-ca/examiners/tls-cert.pem

cp ${PWD}/organizations/peerOrganizations/examiners.iiitm.com/msp/config.yaml ${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/msp/config.yaml

fabric-ca-client enroll -u https://peer1:peer1pw@localhost:7054 --caname ca-examiners -M ${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/tls --enrollment.profile tls --csr.hosts peer1.examiners.iiitm.com --csr.hosts localhost --tls.certfiles ${PWD}/organizations/fabric-ca/examiners/tls-cert.pem

cp ${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/tls/ca.crt

cp ${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/tls/signcerts/* ${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/tls/server.crt

cp ${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/tls/keystore/* ${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/tls/server.key
