import * as crypto from "crypto";
import "colors";

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
    public ts = new Date()
  ) {}

  calculateHash() {
    const str = JSON.stringify(this); // stringify the prevHash, transaction, and timestamp
    const hash = crypto.createHash("SHA256");
    hash.update(str).end();
    return hash.digest("hex");
  }
}

class Wallet {
  public publicKey: string; // receiving money, like username
  public privateKey: string; // spending money, like password
  private money: number;

  constructor(public name: string) {
    const keypair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    this.publicKey = keypair.publicKey;
    this.privateKey = keypair.privateKey;

    if (name == "Genesis") {
      this.money = 100;
    } else {
      this.money = 0;
    }
  }

  sendMoney(amount: number, payee: Wallet) {
    if ((this.money > amount || this.money == amount) && amount > 0) {
      let payeePublicKey = payee.publicKey;
      const transaction = new Transaction(
        amount,
        this.publicKey,
        payeePublicKey
      );

      const sign = crypto.createSign("SHA256");
      sign.update(transaction.toString()).end(); // creates and adds the transaction to the sign object

      const signature = sign.sign(this.privateKey); // signs the transaction with the private key

      let status = Chain.instance.addBlock(
        transaction,
        this.publicKey,
        signature
      );

      if (status) {
        this.money -= amount;
        payee.receiveMoney(amount);
        console.log(`\n${this.name} sent ${amount} to ${payee.name}\n`.green);
      }
    } else {
      console.log("Insufficient funds\n".red);
    }
  }

  private receiveMoney(amount: number) {
    this.money += amount;
  }

  drainMoney() {
    this.money = 0;
  }
}

class Chain {
  public static instance = new Chain(); // Singleton instance, only one chain can exist

  chain: Block[];

  constructor() {
    // this.chain = [new Block("", new Transaction(100, "Genesis", "Satoshi"))];
    this.chain = [];
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
      const lastBlockHash = (this.lastBlock != null) ? this.lastBlock.hash : "";
      const newBlock = new Block(lastBlockHash, transaction);
      newBlock.proofOfWork = this.mine(newBlock.nonce).solution;
      newBlock.hash = this.mine(newBlock.nonce).attempt;
      this.chain.push(newBlock);
      return true;
    } else {
      return false;
    }
  }
}


// example usage

const genesis = new Wallet("Genesis");
const satoshi = new Wallet("Satoshi");
genesis.sendMoney(100, satoshi);
genesis.drainMoney();

const bob = new Wallet("Bob");
genesis.sendMoney(100, bob); // Should return insufficient funds

// const satoshi = new Wallet("Satoshi");
// const bob = new Wallet("Bob");
// const alice = new Wallet("Alice");

// satoshi.sendMoney(5, bob);
// bob.sendMoney(2, alice);
// alice.sendMoney(1, satoshi);

console.log(Chain.instance.chain);
