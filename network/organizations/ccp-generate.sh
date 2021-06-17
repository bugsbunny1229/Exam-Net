#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $7)
    local CP=$(one_line_pem $8)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${P1PORT}/$3/" \
        -e "s/\${P2PORT}/$4/" \
        -e "s/\${P3PORT}/$5/" \
        -e "s/\${CAPORT}/$6/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $7)
    local CP=$(one_line_pem $8)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${P1PORT}/$3/" \
        -e "s/\${P2PORT}/$4/" \
        -e "s/\${P3PORT}/$5/" \
        -e "s/\${CAPORT}/$6/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

ORG=examiners
P0PORT=7051
P1PORT=8051
P2PORT=10051
P3PORT=11051
CAPORT=7054
PEERPEM=organizations/peerOrganizations/examiners.iiitm.com/tlsca/tlsca.examiners.iiitm.com-cert.pem
CAPEM=organizations/peerOrganizations/examiners.iiitm.com/ca/ca.examiners.iiitm.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $P1PORT $P2PORT $P3PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/examiners.iiitm.com/connection-examiners.json
echo "$(yaml_ccp $ORG $P0PORT $P1PORT $P2PORT $P3PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/examiners.iiitm.com/connection-examiners.yaml

ORG=students
P0PORT=9051
P1PORT=12051
P2PORT=13051
P3PORT=14051
CAPORT=8054
PEERPEM=organizations/peerOrganizations/students.iiitm.com/tlsca/tlsca.students.iiitm.com-cert.pem
CAPEM=organizations/peerOrganizations/students.iiitm.com/ca/ca.students.iiitm.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $P1PORT $P2PORT $P3PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/students.iiitm.com/connection-students.json
echo "$(yaml_ccp $ORG $P0PORT $P1PORT $P2PORT $P3PORT $CAPORT $PEERPEM $CAPEM)" > organizations/peerOrganizations/students.iiitm.com/connection-students.yaml
