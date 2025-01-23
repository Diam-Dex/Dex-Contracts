

### Overview
This script enables interaction with the Diamante blockchain to:
1. Create and manage liquidity pools with a constant product model.
2. Mint NFTs to represent user positions in liquidity pools.
3. Upload NFT metadata to IPFS using the Pinata SDK.
4. Store metadata URIs on-chain for traceability.
5. Allow token swaps within the liquidity pool.

The script performs the complete lifecycle: funding accounts, creating assets, managing trustlines, depositing liquidity, minting NFTs, and executing swaps.

---

### **Dependencies**
1. **`node-fetch`**: HTTP requests to Diamante Testnet.
2. **`pinata-web3`**: Uploading metadata to IPFS.
3. **`blob-polyfill`**: Handling file blobs for metadata uploads.
4. **`diamnet-sdk`**: Blockchain interaction with the Diamante protocol.
5. **`.env`**: Secures API keys for Pinata.

Install dependencies using:
```bash
npm install node-fetch pinata-web3 blob-polyfill diamnet-sdk dotenv
```

---

### **Workflow Details**

#### 1. **Setup and Initialization**
- **Keypairs**:
  - NFT Issuer: Issues NFTs and the `TradeToken` asset.
  - Distributor: Provides liquidity and receives the NFT.
  - Buyer: Executes swaps within the liquidity pool.
- **Assets**:
  - `TradeToken`: Custom asset for the liquidity pool.
  - Liquidity pool shares and NFTs are dynamically created.

#### 2. **Account Funding**
- **`fundAccount` Function**:
  - Uses Diamante Testnet Friendbot to fund accounts with DIAM (native token).

#### 3. **Trustline Management**
- **`establishTrustline` Function**:
  - Establishes trustlines between accounts and assets, enabling accounts to hold and interact with specific assets.

#### 4. **Asset Issuance**
- **`issueAsset` Function**:
  - Issues 100 units of `TradeToken` from the NFT Issuer to the Distributor.

#### 5. **Liquidity Pool Management**
- **`LiquidityPoolAsset`**:
  - Represents the pool using a constant product formula and sets the fee parameter (0.3%).
- **`getLiquidityPoolId`**:
  - Generates a unique ID for the liquidity pool.
- **`depositLiquidity` Function**:
  - Deposits liquidity into the pool using specified amounts and price bounds.

#### 6. **NFT Metadata Management**
- **`createAndPushNFTMetadata` Function**:
  - Metadata includes pool ID, user public key, position details, and a timestamp.
  - Uploads metadata to IPFS via Pinata.
  - Links the metadata URI to the blockchain using `manageData` operation, where the NFT asset name serves as the key.

#### 7. **Token Swap**
- **`performSwap` Function**:
  - Executes a token swap within the pool using `PathPaymentStrictSend`.

#### 8. **Querying Pool Details**
- **`queryLiquidityPoolDetails` Function**:
  - Retrieves pool reserves, fees, and other details.

---

