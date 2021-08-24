# ExamNet - A Decentralized and Secure Examination Platform
## Overview
This project attempts to create a novel examination platform based on blockchain and cryptography called ExamNet, that aims to mitigate the problems that are prevalent in the way examinations are presently conducted. Currently, examinations are conducted in a centralized manner, with inadequate security measures, and so the following challenges have been observed:
* Leaking of question papers before the scheduled time of the exam
* Tampering, manipulation and deletion of question papers and answer sheets
* Possibility for the results or report card of an examination to be forged

ExamNet harnesses the immutability of the blockchain along with the properties of cryptography to create an end-to-end examination platform that aims to combat the challenges mentioned above.

## Technologies used
ExamNet uses Hyperledger Fabric as the backbone for the project, and implements a permissioned blockchain with certificate authorities, and with a suitable network topology. The chaincode deployed onto the channels in the network have been written in TypeScript. In order for users to interact with the blockchain, two APIs have also been developed (viz. the Admin API and the Core API) in TypeScript using Express.js and Node.js. Moreover, in order to facilitate the user interaction, three client-side applications have also been developed using Svelte and TailwindCSS, which interact with the above mentioned APIs.

## Installation
* Install the Hyperledger Fabric binaries and Docker images by following [this guide](https://hyperledger-fabric.readthedocs.io/en/release-2.2/install.html).
* Install PostgreSQL on your system by following [this guide](https://www.postgresql.org/download/linux/ubuntu/).
* Create the required tables for PostgreSQL by running the [db.sql script](https://github.com/jettswift/examnet/blob/master/db.sql).
```sh
psql -f db.sql
```
* Start up the network by running the [start.sh script].
```sh
sudo ./start.sh
```
* Start up the Admin API.
```sh
cd admin
npm install
npm run dev
```
* Similarly, also start up the core API.
```sh
cd api
npm install
npm run dev
```
* Start up the Admin Application. The Examiners' and Students' Applications can also be started in a similar manner (depending on what functionality you need).
```sh
cd admin-app
npm install
npm run dev
```