import sgMail from '@sendgrid/mail';
import { prisma } from "@/lib/prisma";

// Set the API key from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Delay helper
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Define the error response structure
interface SendGridErrorResponse {
  response: {
    body: {
      errors: { message: string }[];
    };
    statusCode: number;
    headers: { [key: string]: string };
  };
}

// Function to send Emails
export async function sendEmail(
  to: string, 
  subject: string, 
  text: string, 
  paymentId?: string, 
  html?: string, 
  retries = 3
): Promise<void> {
  console.log(`sending email to ${to}`);
  
  try {
    const msg = {
      to, // recipient's email
      from: process.env.SENDGRID_FROM_EMAIL!, // verified sender email
      subject,
      text,
      html, // optional: pass HTML content
    };

    const response = await sgMail.send(msg);
    if (response[0]?.statusCode === 200) {
      // Email accepted for delivery
      console.log("Email sent successfully:", response);
      if (paymentId) {
        await prisma.payment.update({
          where: { paymentId },
          data: { isEmailSent: true },
        });
      }
    } else {
      // Log unexpected status or errors
      console.error("Unexpected response from SendGrid:", response);
      throw new Error("Failed to confirm email delivery.");
    }

  } catch (error: unknown) {
    console.error('Error sending email:', error);

    // Ensure error is of type SendGridErrorResponse
    if (isSendGridErrorResponse(error)) {
      const errorResponse = error.response;
      console.error('Error details:', errorResponse.body);
      const statusCode = errorResponse.statusCode;

      // Handle specific errors like daily limit exceeded
      if (statusCode === 429 || 
          (Array.isArray(errorResponse.body?.errors) && 
           errorResponse.body.errors.some((e) => e.message.includes('daily limit exceeded')))) {
        console.error('Daily limit exceeded. Scheduling for the next day...');
        
        // Store the email details in the database
        await scheduleForNextDay(to, subject, text, html, paymentId);
        return;
      }

      // Handle rate-limiting reset
      if (errorResponse.headers['x-ratelimit-reset']) {
        const resetTimestamp = Number(errorResponse.headers['x-ratelimit-reset']);
        if (!isNaN(resetTimestamp)) {
          console.log(`Rate limit resets at ${new Date(resetTimestamp * 1000).toISOString()}`);
        } else {
          console.error('Invalid rate limit reset timestamp.');
        }
      }

      // Handle other SendGrid errors with statusCode >= 500
      if (statusCode >= 500) {
        console.error('Temporary server error. Retrying...');
        if (retries > 0) {
          await delay(60000); // Wait 1 minute before retrying
          return sendEmail(to, subject, text, paymentId, html, retries - 1);
        } else {
          console.error('All retry attempts failed.');
          throw error;
        }
      }
    }

    // If no valid error response or retries exhausted
    if (!(error instanceof Error) || retries <= 0) {
      console.error('Non-retryable error or retries exhausted.');
      throw error;
    }

    // For other errors
    throw error;
  }
}

// Helper function to check if the error is of type SendGridErrorResponse
function isSendGridErrorResponse(error: unknown): error is SendGridErrorResponse {
  return (error as SendGridErrorResponse).response !== undefined;
}

export async function scheduleForNextDay(
  to: string,
  subject: string,
  text: string,
  html?: string,
  emailPaymentId?: string
): Promise<void> {
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1); // Schedule for the next day

  await prisma.emailQueue.create({
    data: {
      to,
      subject,
      text,
      html,
      emailPaymentId,
      retryAt: nextDay,
    },
  });

  console.log('Email scheduled for the next day.');
}
