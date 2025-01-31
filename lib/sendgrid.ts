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
    const fromEmail = process.env.SENDGRID_FROM_EMAIL;
    if (!fromEmail) {
      throw new Error("Missing SENDGRID_FROM_EMAIL in environment variables.");
    }

    const msg = {
      to, 
      from: fromEmail, 
      subject,
      text,
      html, 
    };

    try {
      const response = await sgMail.send(msg);
      console.log(response);

      if (!response || response[0]?.statusCode !== 202) {
        throw new Error("Email was not accepted for delivery.");
      }
    } catch (error) {
      console.log("SendGrid may have thrown an error even if the email was sent:", error);
    }

    if (paymentId) {
      try {
        const paymentUpdate = await prisma.payment.update({
          where: { paymentId },
          data: { isEmailSent: true },
        });
        console.log(paymentUpdate);
      } catch (dbError) {
        console.error("Failed to update payment status:", dbError);
      }
    }

  } catch (error: unknown) {
    console.log('Error sending email:', error);

    if (isSendGridErrorResponse(error)) {
      const errorResponse = error.response;
      console.error('Error details:', errorResponse.body);

      if (errorResponse.headers && errorResponse.headers['x-ratelimit-reset']) {
        const resetTimestamp = Number(errorResponse.headers['x-ratelimit-reset']);
        if (!isNaN(resetTimestamp)) {
          console.log(`Rate limit resets at ${new Date(resetTimestamp * 1000).toISOString()}`);
        }
      }

      if (errorResponse.statusCode === 429) {
        console.error('Rate limit exceeded. Retrying later.');
        await scheduleForNextDay(to, subject, text, html, paymentId);
        return;
      }
      
      if (errorResponse.statusCode >= 500 && retries > 0) {
        console.error('Temporary server error. Retrying...');
        await delay(60000);
        await sendEmail(to, subject, text, paymentId, html, retries - 1);
        return;
      }
    }

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
