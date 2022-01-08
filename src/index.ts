import { SHA256 as hash } from "crypto-js";

class Block {
  private data: JSON;
  private hash: String;
  private previousHash: String;
  private timestamp: Date;
  // How much time does it take to mine a block?
  private proofOfWork = 0;

  constructor(previousHash: String, data: JSON) {
    this.data = data;
    this.hash = this.calculateHash();
    this.previousHash = previousHash;
    this.timestamp = new Date();
    this.proofOfWork = 0;
  }
  /**
   * Calculates the hash of the block
   * @returns {String} - The hash of the block
   */
  calculateHash(): String {
    return hash(
      this.previousHash +
        JSON.stringify(this.data) +
        this.timestamp +
        this.proofOfWork
    ).toString();
  }
  /**
   * @param  {Number} difficulty - Represents the difficulty of mining a block. The higher the difficulty, the longer it takes to mine a block.
   */
  mine(difficulty: Number): void {
    while (!this.hash.startsWith("0".repeat(difficulty))) {
      this.proofOfWork++;
      this.hash = this.calculateHash();
    }
  }
}
