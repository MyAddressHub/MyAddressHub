const hre = require("hardhat");

async function main() {
  console.log("Deploying AddressHub contract...");

  const AddressHub = await hre.ethers.getContractFactory("AddressHub");
  const addressHub = await AddressHub.deploy();

  await addressHub.waitForDeployment();

  const address = await addressHub.getAddress();
  console.log("AddressHub deployed to:", address);

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: address,
    network: hre.network.name,
    deployer: (await hre.ethers.getSigners())[0].address,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
