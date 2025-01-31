import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendgrid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {course, paymentType, paymentId, userId, paymentAmount} = body;
    console.log(body)

    //Check if payment has already been confirmed
    const existingPayment = await prisma.payment.findUnique({
      where: { paymentId },
    });
    if(existingPayment?.paymentStatus === 'complete'){
      return new Response(JSON.stringify({message: 'Payment has already been confirmed'}), {status: 200})
    }
    
    //Verify payment with NowPayments API
    const paymentResponse = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
      method: 'GET',
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY!
      },
    })

    const paymentData = await paymentResponse.json();

    if (paymentData.payment_status !== 'finished') {
      return new Response(JSON.stringify({error: 'Payment is not complete or still pending'}), {status: 400});
    }

    //Update course counts in database
    if(paymentData.payment_status === 'finished'){
      const updateCourse = await prisma.course.findFirst({
        where: {name: course}
      })

      if (paymentType === 'full') {
        if(updateCourse){
          if(updateCourse?.fullPaymentCount <= updateCourse?.fullPaymentLimit){
            await prisma.user.update({
              where: { id: userId },
              data: {isEligibleForDraw: true}
            })
          }else{
            await prisma.user.update({
              where: { id: userId },
              data: {isEligibleForDraw: false}
            })
          }

          await prisma.course.update({
            where: {id: updateCourse.id},
            data: {fullPaymentCount: {increment: 1}}
          })
        }
      } else if (paymentType === 'discount') {
          if(updateCourse){
            await prisma.course.update({
            where: {id: updateCourse.id},
            data: {discountPaymentCount: {increment: 1}}
          })
        }
      }

      //update user isPaid and paymentType and other possible information
      await prisma.user.update({
        where: { id: userId },
        data: {isPaid: true, paymentType: paymentType, Payment: paymentId}
      })

      //update payment table with paymentId and other information stored in cookies during payment initialization
      await prisma.payment.create({
        data: {
          paymentId: paymentId,
          userId: userId,
          amount: paymentAmount,
          paymentStatus: 'complete'
        }
      })

      //Send user and client the mail for complete payment
      const userEmail = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true },
      });
      console.log(userEmail)

      if (userEmail) {
        console.log('userEmail is confirmed');
        // Send email to user
        await sendEmail(
          userEmail.email,
          "Payment Confirmation",
          `Your payment of $${paymentAmount} for the ${course} course was successfully processed.`,
          paymentId,
          `
          <html>
            <body style="text-align: center; font-family: Arial, sans-serif; line-height: 1.2;">
              <header style="background-color: #f4f4f4; padding: 20px;">
                <h1 style="text-align: center; background-color: green; color: white; padding: 10px;">Course Payment Confirmation</h1>
              </header>
              <main style="padding: 20px; background-color: yellow;">
                <div style='width: 300px; margin: 0 auto;'>
                  <img style='width: 200px; height: 200px;' src="https://bulleyesfxsignalcom.wordpress.com/wp-content/uploads/2021/11/logo5_21_173852-5.png" alt="logo" />
                </div>
                <p style='text-align: center;'>Dear ${userEmail.firstName},</p>
                <p style='text-align: center;'>We are pleased to confirm your payment of <strong>$${paymentAmount}</strong> for the <strong>${course}</strong> course.</p>
                <p style='text-align: center;'>Thank you for choosing our services!</p>
                <p style='text-align: center; color: blue;'>Best regards,</p>
                <p style='text-align: center; color: blue;'>The Team</p>
              </main>
              <footer style="">
                <p style='background-color: black; color: white; font-size: 15px; padding: 10px; text-align: center;'>&copy; 2024 Bright FX. All rights reserved.</p>
              </footer>
            </body>
          </html>
          `
        );

        // Send email to my client
        await sendEmail(
          process.env.SENDGRID_MY_CLIENT_EMAIL!,
          "Course Enrolment Confirmation",
          `A payment of $${paymentAmount} for the ${course} course was successfully processed.`,
          paymentId,
          `
          <html>
            <body style="text-align: center; font-family: Arial, sans-serif; line-height: 1.2;">
              <header style="background-color: #f4f4f4; padding: 20px;">
                <h1 style="text-align: center; background-color: green; color: white; padding: 10px;">Course Payment Confirmation</h1>
              </header>
              <main style="padding: 20px; background-color: yellow;">
                <div style='width: 300px; margin: 0 auto;'>
                  <img style='width: 200px; height: 200px;' src="https://bulleyesfxsignalcom.wordpress.com/wp-content/uploads/2021/11/logo5_21_173852-5.png" alt="logo" />
                </div>
                <p style='text-align: center;'>Hi Boss</p>
                <p style='text-align: center;'>We are pleased to confirm your payment of <strong>$${paymentAmount}</strong> for the <strong>${course}</strong> course.</p>
                <p style='text-align: center;'>Thank you for choosing our services!</p>
                <p style='text-align: center; color: blue;'>Best regards,</p>
                <p style='text-align: center; color: blue;'>Your System</p>
              </main>
              <footer style="">
                <p style='background-color: black; color: white; font-size: 15px; padding: 10px; text-align: center;'>&copy; 2024 Bright FX. All rights reserved.</p>
              </footer>
            </body>
          </html>
          `
        );
    }

    return new Response(JSON.stringify({message: "Payment confirmed and updated successfully"}), {status: 200})
  }
  } catch (error) {
    console.log(error)
    console.error("Error confirming payment", error);
    return new Response(JSON.stringify({error: "Failed to confirm payment"}), {status: 500});
  }
}