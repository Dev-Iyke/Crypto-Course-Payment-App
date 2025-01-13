import { prisma } from "@/lib/prisma";

export async function POST(req: Request){
  try {
    const body = await req.json();
    const {course, paymentType} = body;
    
    //Get the selected course
    const courseData = await prisma.course.findFirst({where: {name: course}})
    if (!courseData) {
      return new Response(JSON.stringify({error: 'course not found'}), {status: 404});
    }

    //determine the course details
    let price, message;
    if (paymentType === 'full') {
      if(courseData.fullPaymentCount < courseData.fullPaymentLimit){
        price = courseData.fullPrice;
        message = "You qualify for the draw by paying in full.";
      } else {
        price = courseData.fullPrice;
        message = "The draw is no longer available for this course.";
      }
    } else if (paymentType === 'discount'){
      if(courseData.discountPaymentCount < courseData.discountLimit){
        price = courseData.discountPrice;
        message = "You qualify for a discount price.";
      } else {
        price = courseData.fullPrice;
        message = "The discount is no longer available for this course.";
      }
    } else {
      return new Response(JSON.stringify({error: 'Invalid payment type'}), {status: 400})
    }

    return new Response(JSON.stringify({price, message}), {status: 200})
  } catch (error) {
    console.error("Error fetching pricing", error);
    return new Response(JSON.stringify({error: "Failed to fetch pricing"}), {status: 500})
  }

}
