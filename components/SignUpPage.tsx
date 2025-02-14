'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie'
import { toast } from "@/hooks/use-toast";
import Checkbox from "./Checkbox";
import Loader from "./Loader";

export interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  country: string;
  state: string;
  phoneNumber: string;
  terms: boolean;
}
const SignUpPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({mode: 'onChange'});

  const router = useRouter();

  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleTermsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTermsAccepted(event.target.checked); // Update state based on checkbox
  };

  const handleRegistration: SubmitHandler<SignUpFormData> = async (data) => {
    // console.log(data);
    setIsLoading(true)    
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      
      if (!response.ok) {
        throw new Error("Failed to register user.");
      }
      
      const result = await response.json();
      if (result.ok) {
        // console.log("User registration request sent:", result);
        // setErrorMessage(result.userMessage);
        Cookies.set("userId", String(result.user.id), { expires: 7 }); // Store as a string, set expiration

        toast({
          title: 'Success!',
          variant: 'success',
          description: 'Registration successfully🎉🎉',
        })
        setTimeout(() => {
          router.push("/payment") 
        }, 500)
      } else {
        // console.log("Failed to register user:", result.userMessage);
        toast({
          title: 'Registration Failed!',
          variant: 'destructive',
          description: result.userMessage,
        })
      }
      setIsLoading(false)    
    } catch (error) {
      // console.error("Error during registration:", error);
      toast({
        title: 'Registration Failed!',
        variant: 'destructive',
        description: "Something went wrong. Please try again later.",
      })
      setIsLoading(false)    
    }
    setIsLoading(false)    
  };

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-5 items-center bg-[#181818] rounded-xl">
      <div className="col-span-2 min-h-[50vh] md:h-full bg-formBg bg-cover bg-center rounded-xl">
        {/* <h3 className="text-white">back</h3> */}
      </div>

      <div className="col-span-3 px-2 sm:px-4 md:px-8 py-12">
        <div className="text-center md:w-[65%] mx-auto mb-8">
          <h1 className="text-2xl text-white md:text-3xl font-semibold">
            Join Our Exclusive FX & Web3 Training Program
          </h1>
          <p className="text-md text-[#B3B3B3] mt-2">
            Sign up now to secure your spot{" "}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(handleRegistration)}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div className="w-full flex flex-col gap-2">
              <label htmlFor="firstName" className="text-white text-md">
                First Name
              </label>
              <input
                type="text"
                placeholder="eg., John"
                {...register("firstName", {
                  required: "Please enter your first name",
                })}
                className="bg-[#222121] w-full py-2 px-3 text-lg rounded-[5px] text-white outline-none placeholder:text-[#5B5B5B]"
              />
              {errors.firstName && (
                <p className="text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            <div className="w-full flex flex-col gap-2">
              <label htmlFor="firstName" className="text-white text-md">
                Last Name
              </label>
              <input
                type="text"
                placeholder="eg., Doe"
                {...register("lastName", {
                  required: "Please enter your last name",
                })}
                className="bg-[#222121] w-full py-2 px-3 text-lg rounded-[5px] text-white outline-none placeholder:text-[#5B5B5B]"
              />
              {errors.lastName && (
                <p className="text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <label htmlFor="course" className="text-white text-md">
              Select Course
            </label>
            <select
              {...register("course", {
                required: "Please select your course(s)",
              })}
              className="bg-[#222121] py-2 px-3 text-lg rounded-[5px] text-white outline-none placeholder:text-[#5B5B5B]"
            >
              <option value='' disabled>Select your course</option>
              <option value="trading">Trading Training</option>
              <option value="web3">Web3 course</option>
            </select>
            {errors.course && (
              <p className="text-red-500">{errors.course.message}</p>
            )}
          </div>

          <div className="w-full flex flex-col gap-2">
            <label htmlFor="email" className="text-white text-md">
              Email
            </label>
            <input
              type="email"
              placeholder="eg., JohnDoe@example.com"
              {...register("email", {
                required: "Please enter your email",
              })}
              className="bg-[#222121] py-2 px-3 text-lg rounded-[5px] text-white outline-none placeholder:text-[#5B5B5B]"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div className="w-full flex flex-col gap-2">
              <label htmlFor="country" className="text-white text-md">
                Country
              </label>
              <input
                type="text"
                placeholder="eg., Nigeria"
                {...register("country", {
                  required: "Please enter your country",
                })}
                className="bg-[#222121] w-full py-2 px-3 text-lg rounded-[5px] text-white outline-none placeholder:text-[#5B5B5B]"
              />
              {errors.country && (
                <p className="text-red-500">{errors.country.message}</p>
              )}
            </div>
            <div className="w-full flex flex-col gap-2">
              <label htmlFor="state" className="text-white text-md">
                State
              </label>
              <input
                type="text"
                placeholder="eg., Lagos"
                {...register("state", {
                  required: "Please enter your state",
                })}
                className="bg-[#222121] w-full py-2 px-3 text-lg rounded-[5px] text-white outline-none placeholder:text-[#5B5B5B]"
              />
              {errors.state && (
                <p className="text-red-500">{errors.state.message}</p>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col gap-2">
            <label htmlFor="phoneNumber" className="text-white text-md">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="eg., +2348087786571"
              {...register("phoneNumber", {
                required: "Please enter your phone number",
              })}
              className="bg-[#222121] py-2 px-3 text-lg rounded-[5px] text-white outline-none placeholder:text-[#5B5B5B]"
            />
            {errors.phoneNumber && (
              <p className="text-red-500">{errors.phoneNumber.message}</p>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1">
            <div className="mr-2">
              <Checkbox 
                isChecked={isTermsAccepted}
                checkTerms={handleTermsChange}
              />
            </div>
            <label htmlFor="terms" className="text-[#B3B3B3]">
              Sign me up for the newsletter to get crypto tips and exclusive
              offers.
            </label>
          </div>

          

          <button
          disabled={!isTermsAccepted || !isValid}
            type="submit"
            className={`bg-[#0094D9] text-white py-2.5 rounded-[5px] ${
              isLoading || !isTermsAccepted || !isValid ? "bg-[#73A5BC70] cursor-not-allowed" : 'cursor-pointer'
            }`}
          >
            {isLoading? 
              <Loader className=""/>
            : 
             'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
