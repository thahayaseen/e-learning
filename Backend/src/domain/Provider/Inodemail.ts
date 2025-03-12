export interface IMailProvider {
    sendeMail(to: string, subject: string, text: string, html?: string): Promise<void>;
  }
  