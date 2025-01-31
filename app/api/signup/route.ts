import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/sendgrid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Incoming POST data:', body);
    
    const user = await prisma.user.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        course: body.course,
        country: body.country,
        state: body.state,
        phoneNumber: body.phoneNumber,
        isPaid: body.isPaid,
      },
    });

    await sendEmail(
      body.email,
      "Registration Confirmation",
      `Your registration for the ${body.course} course was successfully processed.`,
      '',
      `
      <html>
        <body style="text-align: center; font-family: Arial, sans-serif; line-height: 1.2;">
          <header style="background-color: #f4f4f4; padding: 20px;">
            <h1 style="text-align: center; background-color: green; color: white; padding: 10px;">Course Registration Confirmation</h1>
          </header>
          <main style="padding: 20px; background-color: yellow;">
            <div style='width: 300px; margin: 0 auto;'>
              <img style='width: 200px; height: 200px;' src="https://bulleyesfxsignalcom.wordpress.com/wp-content/uploads/2021/11/logo5_21_173852-5.png" alt="logo" />
            </div>
            <p style='text-align: center;'>Dear ${body.firstName},</p>
            <p style='text-align: center;'>We are pleased to confirm your registration for the <strong style='text-transform: capitalize;'>${body.course}</strong> course.</p>
            <p style='text-align: center; color: red;'>Please proceed to make payment and click on the 'Confirm Last Payment' button on the <a style='text-decoration: underline;' href='https://bright-fx-signup.vercel.app/payment'>payment page</a> after completing payment</p>
            <p style='text-align: center;'>Thank you for choosing our services!</p>
            <p style='text-align: center; color: blue;'>Best regards,</p>
            <p style='text-align: center; color: blue;'>BSFX Signal Community</p>
            <p style='text-align: center; font-weight: bold; color: black;'>Please send all replies or complaints to ${process.env.SENDGRID_MY_CLIENT_EMAIL!}</p>
          </main>
          <footer style="padding-top: 100px;">
            <p style='background-color: black; color: white; font-size: 15px; padding: 10px; text-align: center;'>&copy; 2025 Bright FX. All rights reserved.</p>
          </footer>
        </body>
      </html>
      `
    );
    
    return new Response(JSON.stringify({user, ok: true}), { status: 208 });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// Get a specific user with email
export async function GET(req: Request) {
  try {
    const body = await req.json();
    console.log('Incoming POST data:', body); // Debug log
    const userExists = await prisma.user.findFirst({
      where: { email: body.email },
    })
    // const resp = userExists === null
    console.log('User exists:', userExists);
    return new Response(JSON.stringify(userExists), { status: 200 });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}



