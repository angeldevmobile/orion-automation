import { renderToStaticMarkup } from 'react-dom/server';
import { PasswordResetEmail } from '../components/Gmail/EmailService';

export const renderPasswordResetEmail = (resetUrl: string, userEmail: string): string => {
  return renderToStaticMarkup(
    PasswordResetEmail({ resetUrl, userEmail })
  );
};