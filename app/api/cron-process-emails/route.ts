import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendgrid";

export const GET = async () => {
  try {
    const emails = await prisma.emailQueue.findMany({
      where: {
        status: "pending",
        retryAt: { lte: new Date() },
      },
    });

    for (const email of emails) {
      try {
        await sendEmail(email.to, email.subject, email.text); 

        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { status: "sent"},
        });

        if(email.emailPaymentId){
          await prisma.payment.update({
            where: { paymentId: email.emailPaymentId },
            data: { isEmailSent: true},
          });
        }
        console.log('email successfully sent to ' + email.to)
      } catch (error) {
        if (error) {
          console.error(`Failed to resend email ID ${email.id}`, error);
          const now = new Date();
          const nextRetry = now.getHours() >= 20
            ? new Date(now.setHours(8, 0, 0, 0) + 24 * 60 * 60 * 1000) // Next day's 8 AM
            : new Date(now.setHours(20, 0, 0, 0)); // Same day's 8 PM
        
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: {
              retryAt: nextRetry,
              status: "pending",
            },
          });
        }
        
      }
    }

    return new Response(JSON.stringify({message: "Email queue processed."}), { status: 200})
  } catch (error) {
    console.error("Error processing email queue", error);
    return new Response(JSON.stringify({message: "Failed to process email queue."}), { status: 500})
  }
}
