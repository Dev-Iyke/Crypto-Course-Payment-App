export async function confirmPaymentRequest(data: {
  course: string;
  paymentType: string;
  paymentId: string;
  userId: string;
  paymentAmount: number;
}){
  const response = await fetch('/api/confirm-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })

  if(!response.ok) throw new Error('Failed to fetch. check your network')
  return response;
}