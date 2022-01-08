import { SHA256 as hash } from "crypto-js";

/**
 * Creates a new block in the blockchain
 */
class Block {
  private data: JSON;
  private _hash: string;
  private _previousHash: string;
  private timestamp: Date;
  private proofOfWork = 0;
  /**
   * @param  {string} previousHash - Hash of the previous block. Set to 0 if this is the first block.
   * @param  {JSON} data - Data to be stored in the block
   */
  constructor(previousHash: string, data: JSON) {
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
  private chain: Block[];

  constructor() {
    let data = "{ isGenesis : true }";
    let genesisBlock = new Block("0", JSON.parse(data));
    this.chain = [genesisBlock];
  }

  addBlock(data: JSON) {
    let lastBlock = this.chain[this.chain.length - 1];
    let newBlock = new Block(lastBlock.hash, data);
    newBlock.mine(2); // Finds the hash of the new block
    this.chain.push(newBlock);
  }

  isValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash != currentBlock.calculateHash()) return false;
      if (currentBlock.previousHash != previousBlock.hash) return false;
    }
  }
}
