

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



Result:

```
PS D:\Practice\Diam2> node v3Dex5.js
NFT Issuer Public Key: GC5FGUA4XD5ATJWFITHMKGVRCIGBLJ6KKO7UF5N3CGE2S5KNROUNLOVU
Distributor Public Key: GBHEIGY5J2QKTWI62NB77JCS2DFBQILKYKKFTYK3ET5TGO7DINIKRGJ7
Buyer Public Key: GCELAXU4FC5DDD3WGAW2ISUT4GIE7PBHDGU4O3JGYNZHTQQAV7ONKDRY
Account GC5FGUA4XD5ATJWFITHMKGVRCIGBLJ6KKO7UF5N3CGE2S5KNROUNLOVU funded.
Account GBHEIGY5J2QKTWI62NB77JCS2DFBQILKYKKFTYK3ET5TGO7DINIKRGJ7 funded.
Account GCELAXU4FC5DDD3WGAW2ISUT4GIE7PBHDGU4O3JGYNZHTQQAV7ONKDRY funded.
Trustline established for GBHEIGY5J2QKTWI62NB77JCS2DFBQILKYKKFTYK3ET5TGO7DINIKRGJ7: 0c20b55825629a97cc10e2869e8ebb63b884c804e44b6456fad21550176c303e
Trustline established for GCELAXU4FC5DDD3WGAW2ISUT4GIE7PBHDGU4O3JGYNZHTQQAV7ONKDRY: 084333977998ae8104eddcaa3e9747cf91b8a3d02bc5b7536a4b93622f1bb77c
Asset issued successfully: 5902421826709089c2813834af858e152642eec29596af45fe5111296ddc85cc
Liquidity Pool ID: 6a011b1ddf4b245f270ff37f8b19c0ebc6f971ec2f3a953808f9415c6545e98d
Trustline established for GBHEIGY5J2QKTWI62NB77JCS2DFBQILKYKKFTYK3ET5TGO7DINIKRGJ7: 374db630fab1f4432934b6171cca6112a5fac0c15a804fd6ad183b98de4ae616
Trustline established for GBHEIGY5J2QKTWI62NB77JCS2DFBQILKYKKFTYK3ET5TGO7DINIKRGJ7: 4433e93139579671f91b4215ab199db846a3bcd28df36db33ce578f933c90fad
(node:19256) ExperimentalWarning: buffer.File is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Metadata uploaded to IPFS: {
  IpfsHash: 'bafkreicx5sbut6kg2w6hqfihhqmucbfsbevacmdpe3d66z5dht4rk47jwm',
  PinSize: 461,
  Timestamp: '2025-01-23T19:01:25.065Z'
}
Metadata stored on-chain with key (NFT Asset Name): NFTRGJ7 7907afc3a662413cee7506d91260e3150d9615a92d30c6a155316bb3be418ca9
Liquidity provided successfully and NFT issued: 143f5a009dda2295c832ae7bdb54b70071fe397efd7b85d86a578b03d83b73b4
Liquidity Pool Details: {
  _links: {
    self: {
      href: 'https://diamtestnet.diamcircle.io/liquidity_pools/6a011b1ddf4b245f270ff37f8b19c0ebc6f971ec2f3a953808f9415c6545e98d'
    },
    transactions: {
      href: 'https://diamtestnet.diamcircle.io/liquidity_pools/6a011b1ddf4b245f270ff37f8b19c0ebc6f971ec2f3a953808f9415c6545e98d/transactions{?cursor,limit,order}',
      templated: true
    },
    operations: {
      href: 'https://diamtestnet.diamcircle.io/liquidity_pools/6a011b1ddf4b245f270ff37f8b19c0ebc6f971ec2f3a953808f9415c6545e98d/operations{?cursor,limit,order}',
      templated: true
    }
  },
  id: '6a011b1ddf4b245f270ff37f8b19c0ebc6f971ec2f3a953808f9415c6545e98d',
  paging_token: '6a011b1ddf4b245f270ff37f8b19c0ebc6f971ec2f3a953808f9415c6545e98d',
  fee_bp: 30,
  type: 'constant_product',
  total_trustlines: '1',
  total_shares: '14.1421356',
  reserves: [
    { asset: 'native', amount: '10.0000000' },
    {
      asset: 'TradeToken:GC5FGUA4XD5ATJWFITHMKGVRCIGBLJ6KKO7UF5N3CGE2S5KNROUNLOVU',
      amount: '20.0000000'
    }
  ],
  last_modified_ledger: 2292634,
  last_modified_time: '2025-01-23T19:01:36Z',
  self: [Function (anonymous)],
  transactions: [Function (anonymous)],
  operations: [Function (anonymous)]
}
Swap executed successfully: 3e7f702e3bd492a0e54358f5f3bde1554aed7e44dc9db2afc83212a95a1b8620
All operations completed successfully.
```
