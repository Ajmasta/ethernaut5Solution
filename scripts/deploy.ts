import { ethers } from "hardhat";
import "dotenv/config";
import * as tokenJson from "../artifacts/contracts/Token.sol/Token.json";

const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

function setupProvider() {
  const infuraOptions = process.env.INFURA_API_KEY
    ? process.env.INFURA_API_SECRET
      ? {
          projectId: process.env.INFURA_API_KEY,
          projectSecret: process.env.INFURA_API_SECRET,
        }
      : process.env.INFURA_API_KEY
    : "";
  const options = {
    etherscan: process.env.ETHERSCAN_API_KEY,
    infura: infuraOptions,
  };
  const provider = ethers.providers.getDefaultProvider("ropsten", options);
  return provider;
}
async function main() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = setupProvider();
  const signer = wallet.connect(provider);

  const tokenContractFactory = new ethers.ContractFactory(
    tokenJson.abi,
    tokenJson.bytecode,
    signer
  );
  const tokenContract = await tokenContractFactory.deploy(20);
  await tokenContract.deployed();
  console.log(tokenContract.address);
  const tokenBalanceBefore = await tokenContract.balanceOf(wallet.address);

  console.log(
    "The initial balance of your wallet is",
    tokenBalanceBefore.toNumber(),
    "tokens"
  );
  const _to = process.argv[2];
  if (!_to) throw new Error("Provide an address to send tokens to");
  const _amount = process.argv[3];
  if (!_amount) throw new Error("Send a correct amount");

  console.log("Transferring too many tokens...");
  const transferTx = await tokenContract.transfer(_to, _amount);
  await transferTx.wait();

  const tokenBalance = await tokenContract.balanceOf(wallet.address);

  console.log("Your wallet now has ", tokenBalance, "tokens");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
