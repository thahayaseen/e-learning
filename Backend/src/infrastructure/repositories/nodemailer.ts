import Email from "../../domain/entities/IEmail";
import InodemailerRepo from "../../domain/repositories/nodemailer";
import transpoter from "../nodemailer/nodemailer";
export default class Mail implements InodemailerRepo {
  async sendEmail(email: Email): Promise<void> {
    await transpoter.sendMail({
      to: email.to,
      subject: email.subject,
      html: email.body,
    });
  }
}
