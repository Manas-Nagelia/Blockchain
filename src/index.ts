import { SHA256 as hash } from "crypto-js";

class Block {
  private data: JSON;
  private hash: string;
  private previousHash: string;
  private timestamp: Date;
  private proofOfWork = 0;

  constructor(previousHash: string, data: JSON) {
    this.data = data;
    this.hash = this.calculateHash();
    this.previousHash = previousHash;
    this.timestamp = new Date();
    this.proofOfWork = 0;
  }

  calculateHash(): string {
    return hash(
      this.previousHash +
        JSON.stringify(this.data) +
        this.timestamp +
        this.proofOfWork
    ).toString();
  }

  mine(difficulty: number): void {
    while (!this.hash.startsWith("0".repeat(difficulty))) {
      this.proofOfWork++;
      this.hash = this.calculateHash();
    }
  }
}
