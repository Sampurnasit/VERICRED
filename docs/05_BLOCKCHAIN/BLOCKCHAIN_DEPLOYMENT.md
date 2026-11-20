# BLOCKCHAIN_DEPLOYMENT.md — Deployment Runbooks & Contract Verification

> **Document ID**: DOC-BLOCKCHAIN-007  
> **Status**: Confirmed Technical Specification  
> **Target Networks**: Hardhat Local (`localhost:8545`) & Polygon Amoy (`80002`)

---

## 1. Deployment Sequence & Dependencies

The smart contracts must be deployed in a strict sequential order to fulfill immutable constructor dependency injections:

```mermaid
flowchart TD
    Step1[1. Deploy InstitutionRegistry.sol] --> Step2[2. Deploy CredentialRegistry.sol (Injects IR Address)]
    Step2 --> Step3[3. Deploy RevocationRegistry.sol (Injects CR Address)]
    Step3 --> Step4[4. Export Deployed Addresses & ABI to @vericred/contract-client]
    Step4 --> Step5[5. Verify Source Code on Polygonscan Amoy]
```

---

## 2. Hardhat Deployment Script (`blockchain/scripts/deploy.ts`)

```typescript
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying VERICRED contracts with account: ${deployer.address}`);

  // 1. Deploy InstitutionRegistry
  const InstitutionRegistry = await ethers.getContractFactory("InstitutionRegistry");
  const institutionRegistry = await InstitutionRegistry.deploy();
  await institutionRegistry.waitForDeployment();
  const irAddress = await institutionRegistry.getAddress();
  console.log(`InstitutionRegistry deployed to: ${irAddress}`);

  // 2. Deploy CredentialRegistry
  const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy(irAddress);
  await credentialRegistry.waitForDeployment();
  const crAddress = await credentialRegistry.getAddress();
  console.log(`CredentialRegistry deployed to: ${crAddress}`);

  // 3. Deploy RevocationRegistry
  const RevocationRegistry = await ethers.getContractFactory("RevocationRegistry");
  const revocationRegistry = await RevocationRegistry.deploy(crAddress);
  await revocationRegistry.waitForDeployment();
  const rrAddress = await revocationRegistry.getAddress();
  console.log(`RevocationRegistry deployed to: ${rrAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## 3. Local Hardhat Network Execution

For rapid local testing without testnet gas or faucet delays:

```bash
# Terminal 1: Start local standalone EVM node
pnpm --filter @vericred/blockchain hardhat node

# Terminal 2: Deploy contracts to local node
pnpm --filter @vericred/blockchain hardhat run scripts/deploy.ts --network localhost
```

---

## 4. Polygon Amoy Testnet Deployment & Verification

```bash
# 1. Deploy to Polygon Amoy
pnpm --filter @vericred/blockchain hardhat run scripts/deploy.ts --network amoy

# 2. Verify Contracts on Polygonscan Amoy
pnpm --filter @vericred/blockchain hardhat verify --network amoy <INSTITUTION_REGISTRY_ADDRESS>
pnpm --filter @vericred/blockchain hardhat verify --network amoy <CREDENTIAL_REGISTRY_ADDRESS> <INSTITUTION_REGISTRY_ADDRESS>
pnpm --filter @vericred/blockchain hardhat verify --network amoy <REVOCATION_REGISTRY_ADDRESS> <CREDENTIAL_REGISTRY_ADDRESS>
```

---

## 5. Deployed Address Configuration (`.env`)

Once deployed, inject the addresses into the backend and frontend environment configurations:

```env
# Smart Contract Addresses (Polygon Amoy)
NEXT_PUBLIC_INSTITUTION_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_CREDENTIAL_REGISTRY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_REVOCATION_REGISTRY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
```
