import Email from "../../domain/entities/IEmail";
import nodemailer from "../../infrastructure/repositories/nodemailer";
const NodemailerRepo = new nodemailer();
export default class Nodemailer {
  async sendMail(email: { to: string; subject: string; body: string }) {
   try {
    const mail = new Email(email.to, email.subject, email.body);
    mail.vakudate();
    await NodemailerRepo.sendEmail(mail);
    return 'Mail send successfully'
   } catch (error) {
    console.log(error);
    
    throw new Error("failed to send mail")
   }
  }
}
