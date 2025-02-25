import { IMailProvider } from "../Provider/Inodemail";
import NodemailDto from "../dtos/nodemailDto";
import { AppError } from "../../domain/entities/ITrycatchError";
import { SystemError } from "../useCases/enum/systemError";
export class MailServices {
  constructor(private mailProvider: IMailProvider) {}
  async sendWelcomEmail(data: NodemailDto) {
    const subject = "Welcome!";
    const text = `Hello ${data.name}, welcome to our platform.`;
    const html = `<h1>Hello ${data.name},</h1><p>Welcome!</p>`;
    await this.mailProvider.sendeMail(data.useEmail, subject, text, html);
  }
  async otpsent({ useEmail, name, otp }: NodemailDto) {
    try {
        const subject = "Your varification otp";
    const text = `Hello ${name}, welcome to our platform.`;
    const html = `<!DOCTYPE html>
 <html lang="en">
 <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Your Verification Code</title>
     <!--[if mso]>
     <style type="text/css">
         table {border-collapse:collapse;border-spacing:0;margin:0;}
         div, td {padding:0;}
         div {margin:0 !important;}
     </style>
     <noscript>
     <xml>
         <o:OfficeDocumentSettings>
         <o:PixelsPerInch>96</o:PixelsPerInch>
         </o:OfficeDocumentSettings>
     </xml>
     </noscript>
     <![endif]-->
     <style>
         /* Base styles */
         body {

             margin: 0;
             padding: 0;
             width: 100% !important;
             font-family: 'Segoe UI', Arial, sans-serif;
             background-color: #f7f7f7;
             -webkit-text-size-adjust: 100%;
             -ms-text-size-adjust: 100%;
         }
         
         table, td {
             border-collapse: collapse;
             mso-table-lspace: 0pt;
             mso-table-rspace: 0pt;
         }
         
         img {
             border: 0;
             height: auto;
             line-height: 100%;
             outline: none;
             text-decoration: none;
             -ms-interpolation-mode: bicubic;
         }
         
         /* Main styles */
         .email-container {
             max-width: 600px;
             margin: 0 auto;
         }
         
         .email-header {
             background-color: #4285f4;
             padding: 20px 0;
         }
         
         .email-body {
             background-color: #ffffff;
             padding: 40px 30px;
         }
         
         .email-footer {
             background-color: #f5f5f5;
             padding: 20px 30px;
             font-size: 12px;
             line-height: 18px;
             color: #737373;
         }
         
         h1 {
             color: #333333;
             font-size: 24px;
             font-weight: 600;
             margin: 0 0 20px 0;
         }
         
         p {
             color: #555555;
             font-size: 16px;
             line-height: 24px;
             margin: 0 0 20px 0;
         }
         
         .verification-code {
             background-color: #f5f5f5;
             border-radius: 4px;
             color: #333333;
             display: inline-block;
             font-family: 'Courier New', monospace;
             font-size: 32px;
             font-weight: bold;
             letter-spacing: 6px;
             margin: 20px 0;
             padding: 15px 30px;
             text-align: center;
         }
         
         .button {
             background-color: #4285f4;
             border-radius: 4px;
             color: #ffffff;
             display: inline-block;
             font-size: 16px;
             font-weight: 600;
             line-height: 50px;
             text-align: center;
             text-decoration: none;
             width: 200px;
             -webkit-text-size-adjust: none;
         }
         
         .help-text {
             font-size: 14px;
             color: #737373;
             margin-top: 30px;
         }
         
         @media screen and (max-width: 600px) {
             .email-container {
                 width: 100% !important;
             }
             .email-body {
                 padding: 30px 15px !important;
             }
             .verification-code {
                 font-size: 24px !important;
                 letter-spacing: 4px !important;
                 padding: 12px 15px !important;
             }
         }
     </style>
 </head>
 <body>
     <center>
         <table role="presentation" class="email-container" width="100%" border="0" cellspacing="0" cellpadding="0">
             <!-- Header -->
             <tr>
                 <td class="email-header" align="center">
                     <img src="/api/placeholder/200/50" alt="Company Logo" width="150" style="display: block; margin: 0 auto;">
                 </td>
             </tr>
             
             <!-- Body -->
             <tr>
                 <td class="email-body">
                     <h1>Your Verification Code</h1>
                     <p>Hello,${name}</p>
                     <p>You recently requested to verify your account at ${useEmail}. Please use the verification code below:</p>
                     
                     <div align="center">
                         <div class="verification-code">${otp}</div>
                     </div>
                     
                     <p>This code will expire in 5 minutes.</p>
                     
                     <p>If you did not request this code, please ignore this email or contact support if you have concerns.</p>
                     
                   
                     
                     <p class="help-text">If you're having trouble with the code above, you can also verify your account by clicking the button below:</p>
                     
                    
                 </td>
             </tr>
             
             <!-- Footer -->
             <tr>
                 <td class="email-footer">
                     <p>This email was sent to ${useEmail}</p>
                     <p>© 2025 Example Company, All Rights Reserved</p>
                     <p>123 Example Street, Example City, EX 12345</p>
                 </td>
             </tr>
         </table>
     </center>
 </body>
 </html>`;
    await this.mailProvider.sendeMail(useEmail, subject, text, html);

    } catch (error:unknown) {
        if(error instanceof AppError)throw error;
       
        throw new AppError(SystemError.NodemailerError,500)
    }
  }
}
