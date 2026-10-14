const { AccountBalanceQuery, Client, PrivateKey, TransferTransaction, Hbar, TokenCreateTransaction, TokenType, TokenSupplyType, TokenMintTransaction, TokenId, AccountId } = require('@hashgraph/sdk');

function parsePrivateKey(value) {
  if (!value) throw new Error('HEDERA_PRIVATE_KEY is missing');
  if (value.startsWith('0x')) return PrivateKey.fromStringECDSA(value);
  try { return PrivateKey.fromStringDer(value); } catch { return PrivateKey.fromString(value); }
}

function testnetClient() {
  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) throw new Error('HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY are required');
  return Client.forTestnet().setOperator(process.env.HEDERA_ACCOUNT_ID, parsePrivateKey(process.env.HEDERA_PRIVATE_KEY));
}

async function getAccountBalance(accountId = process.env.HEDERA_ACCOUNT_ID) {
  if (!accountId) throw new Error('accountId is required');
  const client = testnetClient();
  try {
    const balance = await new AccountBalanceQuery().setAccountId(AccountId.fromString(accountId)).execute(client);
    return { accountId, hbar: balance.hbars.toString(), tokens: balance.tokens?.toString?.() || '{}' };
  } finally { client.close(); }
}

async function transferHbar({ toAccountId, amountHbar }) {
  if (!toAccountId || !amountHbar) throw new Error('toAccountId and amountHbar are required');
  const client = testnetClient();
  try {
    const response = await new TransferTransaction().addHbarTransfer(process.env.HEDERA_ACCOUNT_ID, Hbar.fromString(`-${amountHbar}`)).addHbarTransfer(toAccountId, Hbar.fromString(String(amountHbar))).execute(client);
    const receipt = await response.getReceipt(client);
    return { operation: 'hbar-transfer', transactionId: response.transactionId.toString(), status: receipt.status.toString(), toAccountId, amountHbar: String(amountHbar) };
  } finally { client.close(); }
}

async function createFungibleToken({ name, symbol, decimals = 2, initialSupply = 0 }) {
  if (!name || !symbol) throw new Error('name and symbol are required');
  const client = testnetClient();
  try {
    const response = await new TokenCreateTransaction().setTokenName(name).setTokenSymbol(symbol).setTokenType(TokenType.FungibleCommon).setDecimals(Number(decimals)).setInitialSupply(Number(initialSupply)).setTreasuryAccountId(process.env.HEDERA_ACCOUNT_ID).setSupplyType(TokenSupplyType.Infinite).execute(client);
    const receipt = await response.getReceipt(client);
    return { operation: 'hts-create-fungible', tokenId: receipt.tokenId?.toString(), transactionId: response.transactionId.toString(), status: receipt.status.toString() };
  } finally { client.close(); }
}

async function mintFungibleToken({ tokenId, amount }) {
  if (!tokenId || amount === undefined) throw new Error('tokenId and amount are required');
  const client = testnetClient();
  try {
    const response = await new TokenMintTransaction().setTokenId(TokenId.fromString(tokenId)).setAmount(Number(amount)).execute(client);
    const receipt = await response.getReceipt(client);
    return { operation: 'hts-mint-fungible', tokenId, amount: Number(amount), transactionId: response.transactionId.toString(), status: receipt.status.toString() };
  } finally { client.close(); }
}

module.exports = { getAccountBalance, transferHbar, createFungibleToken, mintFungibleToken };
