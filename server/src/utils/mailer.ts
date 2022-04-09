import SendGrid, { MailDataRequired } from '@sendgrid/mail';
import environment from '../config/environment';
import { writeLog } from './log';

// Send email to user with password reset info: FR3

const sendResetPasswordEmail = async (to: string, token: string) => {
  if (!environment.mailer) {
    writeLog({ event: 'Reset Password', token }, 'info');
    return;
  }

  const message: MailDataRequired = {
    to,
    from: environment.mailer.username,
    subject: 'Reset Password',
    templateId: environment.mailer.resetPasswordTemplateId,
    dynamicTemplateData: {
      host: environment.baseClientUrl,
      token,
    },

  };

  SendGrid.setApiKey(environment.mailer.apiKey);
  await SendGrid.send(message);
};

export default sendResetPasswordEmail;
