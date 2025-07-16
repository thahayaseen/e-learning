import nodemailer from "nodemailer";
import { IMailProvider } from "../../domain/Provider/Inodemail";
import nodemail from "../config/nodemail";
export default class mailProvider implements IMailProvider {
  private transport;
  constructor() {

    
    this.transport = nodemailer.createTransport(nodemail);
  }
  async sendeMail(
    to: string,
    subject: string,
    text: string,
    html?: string
  ): Promise<void> {
    await this.transport.sendMail({
      from: nodemail.auth.user,
      to,
      subject,
      text,
      html,
    });
 
  }
}
