(async () => {
  const { default: fetch } = await import("node-fetch");
  const { PinataSDK } = require("pinata-web3");
  const { Blob } = require("blob-polyfill");
  const DiamSdk = require("diamnet-sdk");
  const {
    Asset,
    LiquidityPoolAsset,
    getLiquidityPoolId,
    Keypair,
    Operation,
    TransactionBuilder,
    BASE_FEE,
  } = DiamSdk;
  require("dotenv").config();

  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.GATEWAY_URL,
  });

  const server = new DiamSdk.Aurora.Server(
    "https://diamtestnet.diamcircle.io/"
  );
  const nftIssuerKeypair = Keypair.random();
  const distributorKeypair = Keypair.random();
  const buyerKeypair = Keypair.random();
  const customAsset = new Asset("TradeToken", nftIssuerKeypair.publicKey());
  const feeParameter = 30;

  console.log("NFT Issuer Public Key:", nftIssuerKeypair.publicKey());
  console.log("Distributor Public Key:", distributorKeypair.publicKey());
  console.log("Buyer Public Key:", buyerKeypair.publicKey());

  const fundAccount = async (keypair) => {
    const response = await fetch(
      `https://friendbot.diamcircle.io?addr=${keypair.publicKey()}`
    );
    if (response.ok) {
      console.log(`Account ${keypair.publicKey()} funded.`);
    }
  };

  const establishTrustline = async (accountKeypair, asset) => {
    const account = await server.loadAccount(accountKeypair.publicKey());
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: DiamSdk.Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset,
        })
      )
      .setTimeout(30)
      .build();
    transaction.sign(accountKeypair);
    const response = await server.submitTransaction(transaction);
    console.log(
      `Trustline established for ${accountKeypair.publicKey()}: ${
        response.hash
      }`
    );
  };

  const issueAsset = async () => {
    const issuerAccount = await server.loadAccount(
      nftIssuerKeypair.publicKey()
    );
    const transaction = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: DiamSdk.Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: distributorKeypair.publicKey(),
          asset: customAsset,
          amount: "100",
        })
      )
      .setTimeout(30)
      .build();
    transaction.sign(nftIssuerKeypair);
    const response = await server.submitTransaction(transaction);
    console.log("Asset issued successfully:", response.hash);
  };

  const uploadMetadataToPinata = async (metadata) => {
    try {
      const metadataJSON = JSON.stringify(metadata);
      const blob = new Blob([metadataJSON], { type: "application/json" });
      const upload = await pinata.upload.file(blob, {
        fileName: `metadata_${Date.now()}.json`,
      });
      console.log("Metadata uploaded to IPFS:", upload);
      return upload.IpfsHash;
    } catch (error) {
      console.error("Error uploading metadata to IPFS:", error);
      throw error;
    }
  };

  const storeMetadataOnChain = async (accountKeypair, nftAssetName, value) => {
    const account = await server.loadAccount(accountKeypair.publicKey());
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: DiamSdk.Networks.TESTNET,
    })
      .addOperation(
        Operation.manageData({
          name: nftAssetName.slice(0, 64), // Use the NFT asset name as the key
          value,
        })
      )
      .setTimeout(30)
      .build();
    transaction.sign(accountKeypair);
    const response = await server.submitTransaction(transaction);
    console.log(
      `Metadata stored on-chain with key (NFT Asset Name): ${nftAssetName.slice(
        0,
        64
      )}`,
      response.hash
    );
  };

  const createAndPushNFTMetadata = async (
    userKeyPair,
    poolId,
    positionDetails,
    nftAssetName
  ) => {
    const metadata = {
      name: `Position NFT for Pool ${poolId}`,
      description: "This NFT represents a position in a liquidity pool.",
      poolId,
      userPublicKey: userKeyPair.publicKey(),
      positionDetails,
      timestamp: new Date().toISOString(),
    };

    const metadataURI = await uploadMetadataToPinata(metadata);
    await storeMetadataOnChain(userKeyPair, nftAssetName, metadataURI); // Use NFT name as key
    return metadataURI;
  };

  const depositLiquidity = async (
    accountKeypair,
    liquidityPoolIdBuffer,
    nftAsset
  ) => {
    const account = await server.loadAccount(accountKeypair.publicKey());
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: DiamSdk.Networks.TESTNET,
    })
      .addOperation(
        Operation.liquidityPoolDeposit({
          liquidityPoolId: liquidityPoolIdBuffer,
          maxAmountA: "10", // DIAM
          maxAmountB: "20", // TradeToken
          minPrice: { n: 1, d: 2 },
          maxPrice: { n: 2, d: 1 },
        })
      )
      .addOperation(
        Operation.payment({
          destination: accountKeypair.publicKey(),
          asset: nftAsset,
          amount: "1",
        })
      )
      .setTimeout(30)
      .build();
    transaction.sign(accountKeypair);
    const response = await server.submitTransaction(transaction);
    console.log(
      "Liquidity provided successfully and NFT issued:",
      response.hash
    );
  };

  const queryLiquidityPoolDetails = async (liquidityPoolId) => {
    try {
      const response = await server
        .liquidityPools()
        .liquidityPoolId(liquidityPoolId)
        .call();
      console.log("Liquidity Pool Details:", response);
    } catch (error) {
      console.error(
        "Error querying liquidity pool details:",
        error.response?.data || error
      );
    }
  };

  const performSwap = async (
    accountKeypair,
    sendAsset,
    sendAmount,
    destAsset,
    destMin
  ) => {
    const account = await server.loadAccount(accountKeypair.publicKey());
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: DiamSdk.Networks.TESTNET,
    })
      .addOperation(
        Operation.pathPaymentStrictSend({
          sendAsset,
          sendAmount: `${sendAmount}`,
          destination: distributorKeypair.publicKey(),
          destAsset,
          destMin: `${destMin}`,
          path: [],
        })
      )
      .setTimeout(30)
      .build();
    transaction.sign(accountKeypair);
    const response = await server.submitTransaction(transaction);
    console.log("Swap executed successfully:", response.hash);
  };

  // Main workflow
  await fundAccount(nftIssuerKeypair);
  await fundAccount(distributorKeypair);
  await fundAccount(buyerKeypair);

  await establishTrustline(distributorKeypair, customAsset);
  await establishTrustline(buyerKeypair, customAsset);

  await issueAsset();

  const lpAsset = new LiquidityPoolAsset(
    Asset.native(),
    customAsset,
    feeParameter
  );
  const liquidityPoolId = getLiquidityPoolId(
    "constant_product",
    lpAsset
  ).toString("hex");
  const liquidityPoolIdBuffer = Buffer.from(liquidityPoolId, "hex");
  console.log("Liquidity Pool ID:", liquidityPoolId);

  await establishTrustline(distributorKeypair, lpAsset);

  const distributorNFTName = `NFT${distributorKeypair.publicKey().slice(-4)}`;
  const distributorNFT = new Asset(
    distributorNFTName,
    nftIssuerKeypair.publicKey()
  );
  await establishTrustline(distributorKeypair, distributorNFT);

  const positionDetails = {
    maxAmountA: "10",
    maxAmountB: "20",
    minPrice: { n: 1, d: 2 },
    maxPrice: { n: 2, d: 1 },
  };

  const metadataURI = await createAndPushNFTMetadata(
    distributorKeypair,
    liquidityPoolId,
    positionDetails,
    distributorNFTName // Pass the NFT asset name for linking
  );

  await depositLiquidity(
    distributorKeypair,
    liquidityPoolIdBuffer,
    distributorNFT
  );

  await queryLiquidityPoolDetails(liquidityPoolId);

  await performSwap(buyerKeypair, Asset.native(), 10, customAsset, 5);

  console.log("All operations completed successfully.");
})();
