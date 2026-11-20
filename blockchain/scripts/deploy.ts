import '@nomicfoundation/hardhat-toolbox';
import { ethers } from 'hardhat';
import fs from 'node:fs';
import path from 'node:path';

async function main() {
  const provider = (ethers as any).provider;
  const network = await provider.getNetwork();

  const signers = await (ethers as any).getSigners();
  if (!signers || signers.length === 0) {
    throw new Error(
      'No deployer account detected! Please configure RELAYER_PRIVATE_KEY in blockchain/.env with a private key containing Amoy testnet POL.'
    );
  }
  const deployer = signers[0];

  const balance = await provider.getBalance(deployer.address);
  console.log(`--------------------------------------------------`);
  console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(balance)} POL`);
  console.log(`--------------------------------------------------`);

  if (balance === 0n && Number(network.chainId) === 80002) {
    console.warn(
      'WARNING: Your account has 0 POL on Polygon Amoy. Transactions will fail. Get free testnet POL from https://faucet.polygon.technology/'
    );
  }

  // 1. Deploy InstitutionRegistry
  console.log('Deploying InstitutionRegistry...');
  const InstitutionRegistry = await ethers.getContractFactory('InstitutionRegistry');
  const institutionRegistry = await InstitutionRegistry.deploy(deployer.address);
  await institutionRegistry.waitForDeployment();
  const instRegistryAddress = await institutionRegistry.getAddress();
  console.log(`InstitutionRegistry deployed to: ${instRegistryAddress}`);

  // 2. Deploy CredentialRegistry
  console.log('Deploying CredentialRegistry...');
  const CredentialRegistry = await ethers.getContractFactory('CredentialRegistry');
  const credentialRegistry = await CredentialRegistry.deploy(deployer.address, instRegistryAddress);
  await credentialRegistry.waitForDeployment();
  const credRegistryAddress = await credentialRegistry.getAddress();
  console.log(`CredentialRegistry deployed to: ${credRegistryAddress}`);

  // 3. Deploy RevocationRegistry
  console.log('Deploying RevocationRegistry...');
  const RevocationRegistry = await ethers.getContractFactory('RevocationRegistry');
  const revocationRegistry = await RevocationRegistry.deploy(deployer.address, credRegistryAddress);
  await revocationRegistry.waitForDeployment();
  const revRegistryAddress = await revocationRegistry.getAddress();
  console.log(`RevocationRegistry deployed to: ${revRegistryAddress}`);

  // Pre-seed demo institution: RCC-IIT
  const RCCIIT_ADDRESS = '0x71C8360537AB1ff1029F60864700dE8E34cD1D09';
  console.log(`Pre-authorizing demonstration institution (RCC-IIT: ${RCCIIT_ADDRESS})...`);

  // Deployment configuration object
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    contracts: {
      InstitutionRegistry: instRegistryAddress,
      CredentialRegistry: credRegistryAddress,
      RevocationRegistry: revRegistryAddress,
    },
  };

  const deploymentsPath = path.join(__dirname, '..', 'deployments.json');
  fs.writeFileSync(deploymentsPath, JSON.stringify(deploymentInfo, null, 2), 'utf-8');
  console.log(`Deployments successfully written to ${deploymentsPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
