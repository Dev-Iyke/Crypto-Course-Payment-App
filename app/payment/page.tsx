'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { SignUpFormData } from '../signup/components/SignUpPage'
import { toast } from '@/hooks/use-toast';
import { tokens } from '@/lib/tokens';
import { useRouter } from 'next/navigation';

interface DatabaseUser extends SignUpFormData {
  id: string;
  isEligibleForDraw: boolean;
  isPaid: boolean;
  paymentType: string;
}

interface CoinDetails {
  value: string;
  label: string;
  icon: ReactNode;
}
interface CourseDetails {
  price: number;
  message: string;
}
const PaymentPage = () => {
  const [userDetails, setUserDetails] = useState<DatabaseUser>() || null
  const [paymentType, setPaymentType] = useState<string>('');
  const [paymentPrice, setPaymentPrice] = useState<number>(0);
  const [courseDetails, setCourseDetails] = useState<CourseDetails>();

  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isPaymentSelectOpen, setIsPaymentSelectOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<CoinDetails>();

  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  const [paymentCoin, setPaymentCoin] = useState<string>('');
  // const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentUrl, setPaymentUrl] = useState(null);
  // const [paymentLinkGenerated, setPaymentLinkGenerated] = useState(false);
  console.log(paymentCoin)

  const router = useRouter()
  useEffect(() => {
    async function getUserId(){
      try {
        const userId = Cookies.get('userId')
        console.log(userId)
        if(userId){
          const response = await fetch(`/api/users/${userId}`)
          if(response.ok){
            const data = await response.json()
            setUserDetails(data)
            toast({
              title: 'Success!',
              variant: 'success',
              description: 'User details fetched successfully🎉🎉',
            })
          } else {
            const data = await response.json()
            console.log('Error fetching user', data.error)
            toast({
              title: 'Failed!',
              variant: 'destructive',
              description: data.error,
            })
            throw new Error(`User not found`)
          }
        } 

      } catch (error) {
        console.log(error)
      }
    }
    getUserId()
  }, [setUserDetails])

  console.log(userDetails?.email)

  const handleTermsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTermsAccepted(event.target.checked);
  };

  const handleSelect = (coin: CoinDetails) => {
    setSelectedCoin(coin);
    setPaymentUrl(null)
    setPaymentError(null)
    setIsSelectOpen(false);
  };

  const handlePaymentSelect = (type: string) => {
    setPaymentType(type)
    setPaymentUrl(null)
    setPaymentError(null)
    setIsPaymentSelectOpen(false);
  }

  useEffect(() => {
    if(selectedCoin){
      setPaymentCoin(selectedCoin.value)
    }
    if(paymentError){
      toast({
        title: 'Payment Failed!',
        variant: 'destructive',
        description: paymentError,
      })
     console.log( `${paymentError}`)
    }
  }, [selectedCoin, paymentError])
  // console.log(paymentError)
  // console.log(paymentType)


  useEffect(() => {
    async function getCourseDetails(){
      if(paymentType && userDetails){
        setIsDetailsLoading(true)
        try {
          const response = await fetch(`/api/courses/pricing`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({course:userDetails.course, paymentType}),
          })

          if(response.ok){
            const data = await response.json()
            console.log(data)
            setCourseDetails(data)
            setPaymentPrice(data.price)
          } else {
            const data = await response.json()
            console.log(data)
            console.log('Error fetching course', data.error)
            toast({
              title: 'Failed!',
              variant: 'destructive',
              description: data.error,
            })
            throw new Error(`Error fetching course`)
          }
          setIsDetailsLoading(false)
        } catch (error) {
          console.log(error)
          setIsDetailsLoading(false)
        }
      }
    }

    getCourseDetails()
  }, [paymentType])

  async function generatePaymentLink(){
      console.log(`Generating payment link`)
      console.log(paymentPrice, paymentType, userDetails?.course)
      setIsLinkLoading(true)
      try {
        const response = await fetch(`/api/initialize-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({course:userDetails?.course, price: paymentPrice, paymentType}),
        })

        if(response.ok){
          const data = await response.json()
          console.log(data)
          Cookies.set('paymentDetails', JSON.stringify({...data, paymentType}));
          const paymentData = Cookies.get('paymentDetails')
          if (paymentData) {
            console.log(JSON.parse(paymentData));
          } else {
            console.log('not found');
          }
          setPaymentUrl(data.invoice_url)
          toast({
            title: 'Success!',
            variant: 'success',
            description: 'Payment Link Generated',
          })
        } else {
          const data = await response.json()
          console.log(data)
          console.log('Error fetching course', data.error)
          toast({
            title: 'Failed!',
            variant: 'destructive',
            description: data.error,
          })
          throw new Error(`Error fetching course`)
        }
        setIsLinkLoading(false)
      } catch (error) {
        console.log(error)
        setIsLinkLoading(false)
      }
  }

  const confirmPayment = async () => {
    setIsConfirmLoading(true)
    console.log('Confirming payment...')
    const paymentDetails = Cookies.get('paymentDetails')
    if (paymentDetails){
      const pd = JSON.parse(paymentDetails)
      console.log(pd)
      try {
        const response = await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({course: userDetails?.course, paymentType: pd.paymentType, paymentId: pd.id, userId: userDetails?.id, paymentAmount: parseInt(pd.price_amount)})
        })
        const paymentData = await response.json();
        if(!response.ok){
          console.log(paymentData.error)
          throw new Error(`Confirmation error: ${paymentData.error}`)
        }
        console.log(paymentData.message)
        toast({
          title: 'Success!',
          variant: 'success',
          description: `${paymentData.message} \n An email has been sent to ${userDetails?.email}`,
        })
      } catch (error: unknown) {
        console.log(error)
        if (error instanceof Error) {
          // Using a well-defined error message for the toast
          toast({
            title: 'Failed!',
            variant: 'destructive',
            description: `${error.message} \n An email has been sent to ${userDetails?.email}`,
          });
        } else {
          // Fallback in case the error is not an instance of Error
          toast({
            title: 'Failed!',
            variant: 'destructive',
            description: `An email has been sent to ${userDetails?.email}`,
          })
        }
      }
    }
    setIsConfirmLoading(false)
  }

  // const getAllCoins = async () => {
  //   try {
  //     const response = await fetch(`/api/initialize-payment`, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     })
  //     const data = await response.json()
  //     if(response.ok){
  //       console.log(data)
  //     }
  //     throw new Error(data.error)
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  // getAllCoins()

  // const getMinimumAmount = async (currencyFrom, fiatEquivalent = "usd") => {
  //   try {
  //     const response = await axios.get(
  //       `https://api.nowpayments.io/v1/min-amount`,
  //       {
  //         params: {
  //           currency_from: currencyFrom, // e.g., "usdt"
  //           currency_to: "usdt", // Use the same currency unless converting
  //           fiat_equivalent: fiatEquivalent,
  //           is_fixed_rate: false,
  //           is_fee_paid_by_user: false,
  //         },
  //         headers: {
  //           "x-api-key": API_KEY,
  //         },
  //       }
  //     );

  //     const minAmount = response.data.min_amount;
  //     console.log(
  //       `Minimum amount for ${currencyFrom}: ${minAmount} ${fiatEquivalent}`
  //     );
  //     return minAmount;
  //   } catch (error) {
  //     console.error(
  //       "Error fetching minimum amount",
  //       error.response?.data || error.message
  //     );
  //     return null;
  //   }
  // };

  // getMinimumAmount("usdc");


  // console.log(userDetails)
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 items-center bg-[#181818] rounded-xl"
      onClick={() => {
        if (isSelectOpen){
          setIsSelectOpen(false)
        }
        if (isPaymentSelectOpen){
          setIsPaymentSelectOpen(false)
        }
      }
    }>
      <div className="min-h-[50vh] md:h-full bg-paymentBg bg-cover bg-center rounded-xl">
        <button onClick={() => router.back()} className="text-white p-4">back</button>
      </div>

      <div className="px-8 pt-12 pb-32">
        <div className="text-center mx-auto mb-8">
          <h1 className="text-white text-3xl font-semibold">
            Complete Your Payment
          </h1>
          <p className="text-md text-[#B3B3B3] mt-2">
            Fast, Secure, and Easy Payments{" "}
          </p>
        </div>

        <div className="py-6 text-[#B3B3B3] border-y border-[#333] mb-10 relative">
          <p>
            Course Title:{" "}
            <span className="text-white text-lg font-semibold capitalize">
              {userDetails?.course}
            </span>
          </p>

          <div className="w-full flex flex-col gap-2 mt-4">
            <label htmlFor="firstName" className="text-white text-md">
              Select Payment Type
            </label>
            <div
              onClick={() => setIsPaymentSelectOpen(!isPaymentSelectOpen)}
              className={`bg-[#222121] py-2 px-3 text-lg rounded-[5px] text-white cursor-pointer ${
                isPaymentSelectOpen ? "border border-[#5B5B5B]" : ""
              }`}
            >
              {paymentType ? (
                <div className="flex items-center gap-2 text-white">
                  {paymentType}
                </div>
              ) : (
                <p className="text-[#B3B3B3]">Select payment Type</p>
              )}
            </div>

            {isPaymentSelectOpen && (
              <ul className="absolute bg-[#222121] mt-8 rounded-md w-full z-10 shadow-lg">
                <li
                  onClick={() => handlePaymentSelect('full')}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#333] text-white"
                >
                  Full
                </li>
                <li
                  onClick={() => handlePaymentSelect('discount')}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#333] text-white"
                >
                  Discount (25%)
                </li>
              </ul>
            )}

            <p>{courseDetails?.message}</p>
            
          </div>
          <p>
            Total Amount:{" "}
            <span className="text-white text-lg font-semibold">${paymentPrice}</span>
          </p>

          {isDetailsLoading && <p>Details loading</p>}
        </div>

        <div className="flex flex-col gap-6 relative">
          <div className="w-full flex flex-col gap-2">
            <label htmlFor="firstName" className="text-white text-md">
              Select Stablecoin
            </label>
            <div
              onClick={() => setIsSelectOpen(!isSelectOpen)}
              className={`bg-[#222121] py-2 px-3 text-lg rounded-[5px] text-white cursor-pointer ${
                isSelectOpen ? "border border-[#5B5B5B]" : ""
              }`}
            >
              {selectedCoin ? (
                <div className="flex items-center gap-2 text-white">
                  {selectedCoin.icon} {selectedCoin.label}
                </div>
              ) : (
                <p className="text-[#B3B3B3]">Select payment coin</p>
              )}
            </div>

            {isSelectOpen && (
              <ul className="absolute bg-[#222121] mt-8 rounded-md w-full z-10 shadow-lg">
                {tokens.map((coin) => (
                  <li
                    key={coin.value}
                    onClick={() => handleSelect(coin)}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[#333] text-white"
                  >
                    {coin.icon} {coin.label}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-center text-[#B3B3B3] mb-1">
              Your payment is processed securely
              through NOWPayments, ensuring the safety of your transaction with
              advanced encryption.
            </p>
          </div>

          {!paymentUrl ? (
            <button
            disabled={!isTermsAccepted || !selectedCoin || !paymentType}
              onClick={generatePaymentLink}
              className={`bg-[#0094D9] text-white py-2.5 rounded-[5px] ${
                !isTermsAccepted || !selectedCoin || !paymentType
                  ? "bg-[#73A5BC70] cursor-not-allowed"
                  : "cursor-pointer hover:opacity-80"
              }`}
            >
              {isLinkLoading ? "Generating Payment Link..." : "Generate Link"}
            </button>
          ) : (
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`bg-[#0094D9] w-full text-center text-white py-2.5 rounded-[5px] cursor-pointer hover:opacity-80`}
            >
              Pay Now
            </a>
          )}

          <div>
          <button
            // disabled={!isConfirmLoading}
              onClick={confirmPayment}
              className={`bg-[#0094D9] text-white py-2.5 rounded-[5px] w-full ${
                isConfirmLoading
                  ? "bg-[#73A5BC70] cursor-not-allowed"
                  : "cursor-pointer hover:opacity-80"
              }`}
            >
              {isConfirmLoading ? "Confirming Last Payment..." : "Confirm Last Payment"}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <input
              type="checkbox"
              id="terms"
              checked={isTermsAccepted}
              onChange={handleTermsChange}
              className="mr-2 h-5 w-5 bg-[#B3B3B3]"
            />
            <label htmlFor="terms" className="text-[#B3B3B3]">
              By proceeding with payment, you agree to our Terms and Conditions
              and Privacy Policy.
            </label>
          </div>
        </div>
        {/* <ToastContainer /> */}
      </div>
    </div>
  )
}

export default PaymentPage