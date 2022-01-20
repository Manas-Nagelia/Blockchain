import * as crypto from "crypto";

class Transaction {
  constructor(
    public amount: number,
    public payer: string, // public key
    public payee: string // public key
  ) {}

  toString() {
    return JSON.stringify(this); // stringify the whole Transaction object
  }
}

class Block {
  public nonce = Math.round(Math.random() * 999999999);
  public hash: string = "";
  public proofOfWork: number = 0;

  constructor(
    public prevHash: string,
    public transaction: Transaction,
    public ts = Date.now()
  ) {}

  calculateHash() {
    const str = JSON.stringify(this); // stringify the prevHash, transaction, and timestamp
    const hash = crypto.createHash("SHA256");
    hash.update(str).end();
    return hash.digest("hex");
  }
}

class Chain {
  public static instance = new Chain(); // Singleton instance, only one chain can exist

  chain: Block[];

  constructor() {
    this.chain = [new Block("", new Transaction(100, "Genesis", "Satoshi"))];
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  mine(nonce: number) {
    let solution = 1;
    console.log("⛏️ mining...");

    while (true) {
      const hash = crypto.createHash("MD5");
      hash.update((nonce + solution).toString()).end();

      const attempt = hash.digest("hex");

      if (attempt.substring(0, 4) === "0000") {
        console.log(`Solved ${solution}`);
        return { solution, attempt }; // Proof of work
      }

      solution += 1;
    }
  }

  addBlock(
    transaction: Transaction,
    senderPublicKey: string,
    signature: Buffer
  ) {
    const verifier = crypto.createVerify("SHA256");
    verifier.update(transaction.toString());

    const isValid = verifier.verify(senderPublicKey, signature);

    if (isValid) {
      const newBlock = new Block(this.lastBlock.hash, transaction);
      newBlock.proofOfWork = this.mine(newBlock.nonce).solution;
      newBlock.hash = this.mine(newBlock.nonce).attempt;
      this.chain.push(newBlock);
    }
  }
}

class Wallet {
  public publicKey: string; // receiving money, like username
  public privateKey: string; // spending money, like password

  constructor() {
    const keypair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    this.publicKey = keypair.publicKey;
    this.privateKey = keypair.privateKey;
  }

  sendMoney(amount: number, payeePublicKey: string) {
    const transaction = new Transaction(amount, this.publicKey, payeePublicKey);

    const sign = crypto.createSign("SHA256");
    sign.update(transaction.toString()).end(); // creates and adds the transaction to the sign object

    const signature = sign.sign(this.privateKey); // signs the transaction with the private key

    Chain.instance.addBlock(transaction, this.publicKey, signature);
  }
}

// example usage

const satoshi = new Wallet();
const bob = new Wallet();
const alice = new Wallet();

satoshi.sendMoney(50, bob.publicKey);
bob.sendMoney(23, alice.publicKey);
alice.sendMoney(5, bob.publicKey);

console.log(Chain.instance);
