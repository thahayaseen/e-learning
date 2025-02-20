import Email from "../entities/IEmail"
export default interface IEmailrepositopry{
sendEmail(email:Email):Promise<void>
}