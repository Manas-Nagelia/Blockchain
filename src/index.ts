import { SHA256 as hash } from "crypto-js";
import "colors";

interface GenesisBlock {
  isGenesis: boolean;
}

interface BlockData {
  from: string;
  to: string;
  amount: number;
}

/**
 * Creates a new block in the blockchain
 */
class Block {
  public data: BlockData | GenesisBlock;
  private _hash: string;
  private _previousHash: string;
  private timestamp: Date;
  private proofOfWork = 0;
  /**
   * @param  {string} previousHash - Hash of the previous block. Set to 0 if this is the first block.
   * @param  {BlockData | GenesisBlock} data - Data to be stored in the block
   */
  constructor(previousHash: string, data: BlockData | GenesisBlock) {
    this.data = data;
    this._hash = this.calculateHash();
    this._previousHash = previousHash;
    this.timestamp = new Date();
    this.proofOfWork = 0;
  }

  get previousHash() {
    return this._previousHash;
  }

  get hash() {
    return this._hash;
  }

  calculateHash() {
    return hash(
      this._previousHash +
        JSON.stringify(this.data) +
        this.timestamp +
        this.proofOfWork
    ).toString();
  }

  mine(difficulty: number) {
    while (!this._hash.startsWith("0".repeat(difficulty))) {
      this.proofOfWork++;
      this._hash = this.calculateHash();
    }
  }
}

class Blockchain {
  private _chain: Block[];

  constructor() {
    let data: GenesisBlock = { isGenesis: true };
    let genesisBlock = new Block("0", data);
    this._chain = [genesisBlock];
  }

  get chain() {
    return this._chain;
  }

  addBlock(data: BlockData) {
    let lastBlock = this._chain[this._chain.length - 1];
    let newBlock = new Block(lastBlock.hash, data);
    newBlock.mine(6); // Finds the hash of the new block
    this._chain.push(newBlock);
  }

  isValid() {
    for (let i = 1; i < this._chain.length; i++) {
      const currentBlock = this._chain[i];
      const previousBlock = this._chain[i - 1];

      if (currentBlock.hash != currentBlock.calculateHash()) return false;
      if (currentBlock.previousHash != previousBlock.hash) return false;
    }
    return true;
  }
}

let blockchain = new Blockchain();

let blockOne: BlockData = {
  from: "Viet",
  to: "David",
  amount: 100,
};

let blockTwo: BlockData = {
  from: "Adam",
  to: "Beck",
  amount: 150,
};

blockchain.addBlock(blockOne);
blockchain.addBlock(blockTwo);
let davidData: GenesisBlock | BlockData = blockchain.chain[1].data;
if ("amount" in davidData) davidData.amount += 200;
console.log(blockchain.chain);

let isValid = blockchain.isValid();
if (isValid) {
  console.log("Blockchain is valid".green);
} else {
  console.log("Blockchain is invalid".red);
}
