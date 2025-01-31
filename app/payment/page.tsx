'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { SignUpFormData } from '../../components/SignUpPage'
import { toast } from '@/hooks/use-toast';
import { tokens } from '@/lib/tokens';
import { useRouter } from 'next/navigation';
import Checkbox from '@/components/Checkbox';
import Loader from '@/components/Loader';
import { FailureModal, SuccessModal } from '@/components/Modals';
import {AlertDialog} from "@/components/ui/alert-dialog"
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface paymentDataProps {
  status: number;
  message?: string;
  error?: string;
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
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [paymentError, setPaymentError] = useState(null);
  const [idError, setIdError] = useState(false);
  
  const [paymentCoin, setPaymentCoin] = useState<string>('');
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [paymentData, setPaymentData] = useState<paymentDataProps>();

  console.log(paymentCoin)

  const router = useRouter()
  useEffect(() => {
    async function getUserId() {
      try {
        const userId = Cookies.get("userId");
        // console.log("User ID from cookies:", userId);
  
        if (!userId) {
          throw new Error("No user ID found in cookies");
        }
  
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching user: ${response.statusText}`);
        }
  
        const data = await response.json();
        // console.log("Fetched user data:", data);
        setUserDetails(data);
  
        toast({
          title: "Success!",
          variant: "success",
          description: "User details fetched successfully 🎉",
        });
      } catch (error) {
        // console.error("Could not get user details:", error);
  
        toast({
          title: "Failed!",
          variant: "destructive",
          description: "Could not get details",
          action: <Button onClick={() => router.push("/")}>Sign Up</Button>,
        });
  
        setIdError(true);
      }
    }
    
    getUserId();
  }, [setUserDetails, router]);
  

  useEffect(() => {
    if(idError){
      toast({
        title: 'Failed!',
        variant: 'destructive',
        description: 'Could not get User id',
        action: <Button onClick={() => router.push('/')}>Sign Up</Button>
      })
    }
  }, [idError, router])

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
    //  console.log( `${paymentError}`)
    }
  }, [selectedCoin, paymentError])

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
            // console.log(data)
            setCourseDetails(data)
            setPaymentPrice(data.price)
          } else {
            const data = await response.json()
            // console.log(data)
            // console.log('Error fetching course', data.error)
            toast({
              title: 'Failed!',
              variant: 'destructive',
              description: data.error,
            })
            throw new Error(`Error fetching course`)
          }
          setIsDetailsLoading(false)
        } catch (error) {
          // console.log(error)
          setIsDetailsLoading(false)
        }
      }
    }

    getCourseDetails()
  }, [paymentType, userDetails])

  async function generatePaymentLink(){
    if (userDetails) {
      // console.log(`Generating payment link`)
      // console.log(paymentPrice, paymentType, userDetails.course)
      setIsLinkLoading(true)
      try {
        const response = await fetch(`/api/initialize-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({course:userDetails.course, price: paymentPrice, paymentType}),
        })

        if(response.ok){
          const data = await response.json()
          // console.log(data)
          Cookies.set('paymentDetails', JSON.stringify({...data, paymentType}));
          // const paymentData = Cookies.get('paymentDetails')
          // if (paymentData) {
          //   console.log(JSON.parse(paymentData));
          // } else {
          //   console.log('not found');
          // }
          setPaymentUrl(data.invoice_url)
          toast({
            title: 'Success!',
            variant: 'success',
            description: 'Payment Link Generated',
          })
        } else {
          const data = await response.json()
          // console.log(data)
          // console.log('Error fetching course', data.error)
          toast({
            title: 'Failed!',
            variant: 'destructive',
            description: data.error,
          })
          throw new Error(`Error fetching course`)
        }
        setIsLinkLoading(false)
      } catch (error) {
        // console.log(error)
        setIsLinkLoading(false)
      }
    } else {
      toast({
        title: 'Failed!',
        variant: 'destructive',
        description: 'User or course details not found',
        action: <Button onClick={() => router.push('/')}>Sign Up</Button>
      })
    }
  }

  const confirmPayment = async () => {
    const paymentDetails = Cookies.get('paymentDetails')
    if (paymentDetails){
      setIsConfirmLoading(true)
      // console.log('Confirming payment...')
      const pd = JSON.parse(paymentDetails)
      // console.log(pd)
      try {
        const response = await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({course: userDetails?.course, paymentType: pd.paymentType, paymentId: pd.id, userId: userDetails?.id, paymentAmount: parseInt(pd.price_amount)})
        })
        const paymentData = await response.json();
        setPaymentData(paymentData)
        if(!response.ok){
          // console.log(paymentData.error)
          throw new Error(`Confirmation error: ${paymentData.error}`)
        }
        // console.log(paymentData.message)
        setShowSuccessModal(true)
      } catch (error: unknown) {
        // console.log(error)
        setShowFailedModal(true)
      }
    } else {
      toast({
        title: 'Failed!',
        variant: 'destructive',
        description: 'No payment data not found',
        action: <Button onClick={() => router.push('/')}>Sign Up</Button>
      })
    }
    setIsConfirmLoading(false)
  }

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
        <button onClick={() => router.back()} className="text-white p-4 flex gap-1 cursor-pointer">
          <ChevronLeft />
          <span>Back</span>
        </button>
      </div>

      <div className="px-4 md:px-8 pt-12 pb-12 md:pb-24">
        <div className="text-center mx-auto mb-8">
          <h1 className="text-white text-2xl md:text-3xl font-semibold">
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

            
          </div>
          {isDetailsLoading ? 
            <Loader className='mt-2' /> :
            <div>
              <p>{courseDetails?.message}</p>
              {courseDetails && <p>
                Total Amount:{" "}
                <span className="text-white text-lg font-semibold">${paymentPrice}</span>
              </p>}
            </div>
          }
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
            <AlertDialog>
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
              {showSuccessModal && (
              <SuccessModal 
                openStatus={showSuccessModal} 
                message={`${paymentData?.message || paymentData?.error}. An email has been sent to ${userDetails?.email}`} 
                openChange={setShowSuccessModal} />
              )}

              {showFailedModal && (
              <FailureModal 
                message={`${paymentData?.error || paymentData?.message}. `}
                openStatus={showFailedModal} 
                openChange={setShowFailedModal} />
              )}
            </AlertDialog>
          </div>

          <div className="flex items-center gap-1">
            <div className="mr-2">
              <Checkbox
                isChecked={isTermsAccepted}
                checkTerms={handleTermsChange}
              />
            </div>
            <label htmlFor="terms" className="text-[#B3B3B3]">
              By proceeding with payment, you agree to our Terms and Conditions
              and Privacy Policy.
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage