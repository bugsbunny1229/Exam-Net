sudo systemctl start postgresql
cd network
./network.sh up createChannel -c mainchannel -ca
./network.sh deployCC