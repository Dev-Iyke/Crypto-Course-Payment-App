export async function POST(req: Request){
  try {
    const body = await req.json();
    const {course, price, paymentType} = body;

    const paymentResponse = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
      },
      body: JSON.stringify({
        price_amount: price,
        price_currency: 'USD',
        order_id: `${Date.now()}`,
        is_fee_paid_by_user: false,
        is_fixed_rate: true,
        order_description: `Payment for ${course} (${paymentType})`,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment`,
      })
    })
    const paymentData = await paymentResponse.json()
    return new Response(JSON.stringify(paymentData), {status: 200});
  } catch (error) {
    console.error("Error Initializing payment", error)
    return new Response(JSON.stringify({error: 'Failed to initialize payment'}), {status: 500})
  }
}


export async function GET(){
  //fetch available coins on my NowPayments dashboard
  try {
    const myAvailableCoinsResponse = await fetch("https://api.nowpayments.io/v1/merchant/coins", {
      method: "GET",
      headers: {
        
        "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
      },
    })
    const coinsData = await myAvailableCoinsResponse.json()
    return new Response(JSON.stringify(coinsData), {status: 200});
  } catch (error) {
    console.error("Error Initializing payment", error)
    return new Response(JSON.stringify({error: 'Failed to fetch all available coins'}), {status: 500})
  }
}