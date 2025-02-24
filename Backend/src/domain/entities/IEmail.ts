export default class Email {
  constructor(public to: string, public subject: string, public body: string) {
    this.validata();
  }
  validata() {
    if (!this.body || !this.subject || !this.to) {
      throw new Error("invalid email propertis");
    }
  }
}
