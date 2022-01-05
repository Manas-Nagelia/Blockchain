class Block {
  private data: JSON;
  private hash: String;
  private previousHash: String;
  private timestamp : Date;
  private proofOfWork = 0;

  constructor(previousHash: String, data: JSON) {
    this.data = data;
    this.hash = this.calculateHash();
    this.previousHash = previousHash;
    this.timestamp = new Date();
    this.proofOfWork = 0;
  }
}
