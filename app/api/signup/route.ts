import { prisma } from '@/lib/prisma';

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



