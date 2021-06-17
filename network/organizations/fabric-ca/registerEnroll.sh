#!/bin/bash

function createExaminers() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/peerOrganizations/examiners.iiitm.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/examiners.iiitm.com/

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:7054 --caname ca-examiners --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-examiners.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-examiners.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-examiners.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-examiners.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/msp/config.yaml"

  infoln "Registering peer0"
  set -x
  fabric-ca-client register --caname ca-examiners --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/
  
  infoln "Registering peer1"
  set -x
  fabric-ca-client register --caname ca-examiners --id.name peer1 --id.secret peer1pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/

  infoln "Registering peer2"
  set -x
  fabric-ca-client register --caname ca-examiners --id.name peer2 --id.secret peer2pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/

  infoln "Registering peer3"
  set -x
  fabric-ca-client register --caname ca-examiners --id.name peer3 --id.secret peer3pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/

  # infoln "Registering user"
  # set -x
  # fabric-ca-client register --caname ca-examiners --id.name user1 --id.secret user1pw --id.type client --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  # { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-examiners --id.name examinersadmin --id.secret examinersadminpw --id.type admin --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca-examiners -M "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer0.examiners.iiitm.com/msp" --csr.hosts peer0.examiners.iiitm.com --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/null

  mkdir -p organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com
  infoln "Generating the peer1 msp"
  set -x
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:7054 --caname ca-examiners -M "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/msp" --csr.hosts peer1.examiners.iiitm.com --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/null

  mkdir -p organizations/peerOrganizations/examiners.iiitm.com/peers/peer2.examiners.iiitm.com
  infoln "Generating the peer2 msp"
  set -x
  fabric-ca-client enroll -u https://peer2:peer2pw@localhost:7054 --caname ca-examiners -M "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer2.examiners.iiitm.com/msp" --csr.hosts peer2.examiners.iiitm.com --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/null

  mkdir -p organizations/peerOrganizations/examiners.iiitm.com/peers/peer3.examiners.iiitm.com
  infoln "Generating the peer3 msp"
  set -x
  fabric-ca-client enroll -u https://peer3:peer3pw@localhost:7054 --caname ca-examiners -M "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer3.examiners.iiitm.com/msp" --csr.hosts peer3.examiners.iiitm.com --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer0.examiners.iiitm.com/msp/config.yaml"
  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/msp/config.yaml"
  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer2.examiners.iiitm.com/msp/config.yaml"
  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer3.examiners.iiitm.com/msp/config.yaml"

  infoln "Generating the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca-examiners -M "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer0.examiners.iiitm.com/tls" --enrollment.profile tls --csr.hosts peer0.examiners.iiitm.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer1-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:7054 --caname ca-examiners -M "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/tls" --enrollment.profile tls --csr.hosts peer1.examiners.iiitm.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer2-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer2:peer2pw@localhost:7054 --caname ca-examiners -M "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer2.examiners.iiitm.com/tls" --enrollment.profile tls --csr.hosts peer2.examiners.iiitm.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer3-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer3:peer3pw@localhost:7054 --caname ca-examiners -M "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer3.examiners.iiitm.com/tls" --enrollment.profile tls --csr.hosts peer3.examiners.iiitm.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer0.examiners.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer0.examiners.iiitm.com/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer0.examiners.iiitm.com/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer0.examiners.iiitm.com/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer0.examiners.iiitm.com/tls/keystore/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer0.examiners.iiitm.com/tls/server.key"

  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/tls/keystore/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer1.examiners.iiitm.com/tls/server.key"

  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer2.examiners.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer2.examiners.iiitm.com/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer2.examiners.iiitm.com/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer2.examiners.iiitm.com/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer2.examiners.iiitm.com/tls/keystore/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer2.examiners.iiitm.com/tls/server.key"

  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer3.examiners.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer3.examiners.iiitm.com/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer3.examiners.iiitm.com/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer3.examiners.iiitm.com/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer3.examiners.iiitm.com/tls/keystore/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer3.examiners.iiitm.com/tls/server.key"

  mkdir -p "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/msp/tlscacerts"
  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer0.examiners.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/msp/tlscacerts/ca.crt"

  mkdir -p "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/tlsca"
  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer0.examiners.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/tlsca/tlsca.examiners.iiitm.com-cert.pem"

  mkdir -p "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/ca"
  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/peers/peer0.examiners.iiitm.com/msp/cacerts/"* "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/ca/ca.examiners.iiitm.com-cert.pem"

  # infoln "Generating the user msp"
  # set -x
  # fabric-ca-client enroll -u https://user1:user1pw@localhost:7054 --caname ca-examiners -M "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/users/User1@examiners.iiitm.com/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  # { set +x; } 2>/dev/null

  # cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/users/User1@examiners.iiitm.com/msp/config.yaml"

  infoln "Generating the org admin msp"
  set -x
  fabric-ca-client enroll -u https://examinersadmin:examinersadminpw@localhost:7054 --caname ca-examiners -M "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/users/Admin@examiners.iiitm.com/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/examiners/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/examiners.iiitm.com/users/Admin@examiners.iiitm.com/msp/config.yaml"
}

function createStudents() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/peerOrganizations/students.iiitm.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/students.iiitm.com/

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:8054 --caname ca-students --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-students.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-students.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-students.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-students.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/organizations/peerOrganizations/students.iiitm.com/msp/config.yaml"

  infoln "Registering peer0"
  set -x
  fabric-ca-client register --caname ca-students --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering peer1"
  set -x
  fabric-ca-client register --caname ca-students --id.name peer1 --id.secret peer1pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering peer2"
  set -x
  fabric-ca-client register --caname ca-students --id.name peer2 --id.secret peer2pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering peer3"
  set -x
  fabric-ca-client register --caname ca-students --id.name peer3 --id.secret peer3pw --id.type peer --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  # infoln "Registering user"
  # set -x
  # fabric-ca-client register --caname ca-students --id.name user1 --id.secret user1pw --id.type client --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  # { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-students --id.name studentsadmin --id.secret studentsadminpw --id.type admin --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca-students -M "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer0.students.iiitm.com/msp" --csr.hosts peer0.students.iiitm.com --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer1 msp"
  set -x
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:8054 --caname ca-students -M "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer1.students.iiitm.com/msp" --csr.hosts peer1.students.iiitm.com --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer2 msp"
  set -x
  fabric-ca-client enroll -u https://peer2:peer2pw@localhost:8054 --caname ca-students -M "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer2.students.iiitm.com/msp" --csr.hosts peer2.students.iiitm.com --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer3 msp"
  set -x
  fabric-ca-client enroll -u https://peer3:peer3pw@localhost:8054 --caname ca-students -M "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer3.students.iiitm.com/msp" --csr.hosts peer3.students.iiitm.com --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer0.students.iiitm.com/msp/config.yaml"
  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer1.students.iiitm.com/msp/config.yaml"
  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer2.students.iiitm.com/msp/config.yaml"
  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer3.students.iiitm.com/msp/config.yaml"

  infoln "Generating the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca-students -M "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer0.students.iiitm.com/tls" --enrollment.profile tls --csr.hosts peer0.students.iiitm.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer1-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer1:peer1pw@localhost:8054 --caname ca-students -M "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer1.students.iiitm.com/tls" --enrollment.profile tls --csr.hosts peer1.students.iiitm.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer2-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer2:peer2pw@localhost:8054 --caname ca-students -M "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer2.students.iiitm.com/tls" --enrollment.profile tls --csr.hosts peer2.students.iiitm.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the peer3-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer3:peer3pw@localhost:8054 --caname ca-students -M "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer3.students.iiitm.com/tls" --enrollment.profile tls --csr.hosts peer3.students.iiitm.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer0.students.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer0.students.iiitm.com/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer0.students.iiitm.com/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer0.students.iiitm.com/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer0.students.iiitm.com/tls/keystore/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer0.students.iiitm.com/tls/server.key"

  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer1.students.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer1.students.iiitm.com/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer1.students.iiitm.com/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer1.students.iiitm.com/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer1.students.iiitm.com/tls/keystore/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer1.students.iiitm.com/tls/server.key"

  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer2.students.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer2.students.iiitm.com/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer2.students.iiitm.com/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer2.students.iiitm.com/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer2.students.iiitm.com/tls/keystore/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer2.students.iiitm.com/tls/server.key"

  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer3.students.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer3.students.iiitm.com/tls/ca.crt"
  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer3.students.iiitm.com/tls/signcerts/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer3.students.iiitm.com/tls/server.crt"
  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer3.students.iiitm.com/tls/keystore/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer3.students.iiitm.com/tls/server.key"

  mkdir -p "${PWD}/organizations/peerOrganizations/students.iiitm.com/msp/tlscacerts"
  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer0.students.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/msp/tlscacerts/ca.crt"

  mkdir -p "${PWD}/organizations/peerOrganizations/students.iiitm.com/tlsca"
  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer0.students.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/tlsca/tlsca.students.iiitm.com-cert.pem"

  mkdir -p "${PWD}/organizations/peerOrganizations/students.iiitm.com/ca"
  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/peers/peer0.students.iiitm.com/msp/cacerts/"* "${PWD}/organizations/peerOrganizations/students.iiitm.com/ca/ca.students.iiitm.com-cert.pem"

  # infoln "Generating the user msp"
  # set -x
  # fabric-ca-client enroll -u https://user1:user1pw@localhost:8054 --caname ca-students -M "${PWD}/organizations/peerOrganizations/students.iiitm.com/users/User1@students.iiitm.com/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  # { set +x; } 2>/dev/null

  # cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/students.iiitm.com/users/User1@students.iiitm.com/msp/config.yaml"

  infoln "Generating the org admin msp"
  set -x
  fabric-ca-client enroll -u https://studentsadmin:studentsadminpw@localhost:8054 --caname ca-students -M "${PWD}/organizations/peerOrganizations/students.iiitm.com/users/Admin@students.iiitm.com/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/students/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/peerOrganizations/students.iiitm.com/msp/config.yaml" "${PWD}/organizations/peerOrganizations/students.iiitm.com/users/Admin@students.iiitm.com/msp/config.yaml"
}

function createOrderer() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/ordererOrganizations/iiitm.com

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/ordererOrganizations/iiitm.com

  set -x
  fabric-ca-client enroll -u https://admin:adminpw@localhost:9054 --caname ca-orderer --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/tls-cert.pem"
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: orderer' > "${PWD}/organizations/ordererOrganizations/iiitm.com/msp/config.yaml"

  infoln "Registering orderer"
  set -x
  fabric-ca-client register --caname ca-orderer --id.name orderer --id.secret ordererpw --id.type orderer --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Registering the orderer admin"
  set -x
  fabric-ca-client register --caname ca-orderer --id.name ordererAdmin --id.secret ordererAdminpw --id.type admin --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/tls-cert.pem"
  { set +x; } 2>/dev/null

  infoln "Generating the orderer msp"
  set -x
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-orderer -M "${PWD}/organizations/ordererOrganizations/iiitm.com/orderers/orderer.iiitm.com/msp" --csr.hosts orderer.iiitm.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/ordererOrganizations/iiitm.com/msp/config.yaml" "${PWD}/organizations/ordererOrganizations/iiitm.com/orderers/orderer.iiitm.com/msp/config.yaml"

  infoln "Generating the orderer-tls certificates"
  set -x
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-orderer -M "${PWD}/organizations/ordererOrganizations/iiitm.com/orderers/orderer.iiitm.com/tls" --enrollment.profile tls --csr.hosts orderer.iiitm.com --csr.hosts localhost --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/ordererOrganizations/iiitm.com/orderers/orderer.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/ordererOrganizations/iiitm.com/orderers/orderer.iiitm.com/tls/ca.crt"
  cp "${PWD}/organizations/ordererOrganizations/iiitm.com/orderers/orderer.iiitm.com/tls/signcerts/"* "${PWD}/organizations/ordererOrganizations/iiitm.com/orderers/orderer.iiitm.com/tls/server.crt"
  cp "${PWD}/organizations/ordererOrganizations/iiitm.com/orderers/orderer.iiitm.com/tls/keystore/"* "${PWD}/organizations/ordererOrganizations/iiitm.com/orderers/orderer.iiitm.com/tls/server.key"

  mkdir -p "${PWD}/organizations/ordererOrganizations/iiitm.com/orderers/orderer.iiitm.com/msp/tlscacerts"
  cp "${PWD}/organizations/ordererOrganizations/iiitm.com/orderers/orderer.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/ordererOrganizations/iiitm.com/orderers/orderer.iiitm.com/msp/tlscacerts/tlsca.iiitm.com-cert.pem"

  mkdir -p "${PWD}/organizations/ordererOrganizations/iiitm.com/msp/tlscacerts"
  cp "${PWD}/organizations/ordererOrganizations/iiitm.com/orderers/orderer.iiitm.com/tls/tlscacerts/"* "${PWD}/organizations/ordererOrganizations/iiitm.com/msp/tlscacerts/tlsca.iiitm.com-cert.pem"

  infoln "Generating the admin msp"
  set -x
  fabric-ca-client enroll -u https://ordererAdmin:ordererAdminpw@localhost:9054 --caname ca-orderer -M "${PWD}/organizations/ordererOrganizations/iiitm.com/users/Admin@iiitm.com/msp" --tls.certfiles "${PWD}/organizations/fabric-ca/ordererOrg/tls-cert.pem"
  { set +x; } 2>/dev/null

  cp "${PWD}/organizations/ordererOrganizations/iiitm.com/msp/config.yaml" "${PWD}/organizations/ordererOrganizations/iiitm.com/users/Admin@iiitm.com/msp/config.yaml"
}
