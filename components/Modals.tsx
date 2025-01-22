import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"
import Image from "next/image"
import { X } from "lucide-react"

export function SuccessModal({openStatus, message, openChange}: {openStatus: boolean, message: string, openChange: (state: boolean) => void}) {
  return (
    <AlertDialog open={openStatus} onOpenChange={openChange}>
      <AlertDialogContent className='bg-[black]/90 border-none shadow-md rounded-lg w-[85%] sm:w-[65%] md:[50%]'>
      <X className="absolute top-4 right-4 text-white cursor-pointer" onClick={() => openChange(false)}/>
        <div className="mx-auto">
          <Image className="w-24 h-24 md:w-32 md:h-32" width={'163'} height={163} src='/success.png' alt="failure"/>
        </div>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Payment Successful</AlertDialogTitle>
          <AlertDialogDescription>
            {message}
            You will receive an email with your course access details shortly. 🎉
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button className="bg-[#11A401] w-full" onClick={() => openChange(false)}>Ok</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function FailureModal({openStatus, message, openChange}: {openStatus: boolean, message: string, openChange: (state: boolean) => void}) {
  return (
    <AlertDialog open={openStatus} onOpenChange={openChange}>
      <AlertDialogContent className='bg-[black]/90 border-none shadow-md rounded-lg w-[85%] sm:w-[65%] md:[50%]'>
        <X className="absolute top-4 right-4 text-white cursor-pointer" onClick={() => openChange(false)}/>
        <div className="mx-auto">
          <Image className="w-24 h-24 md:w-32 md:h-32" width={'163'} height={163} src='/failure.png' alt="failure"/>
        </div>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Payment Failed</AlertDialogTitle>
          <AlertDialogDescription>
            {message}
            Unfortunately, your payment was not be successful. Please try again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button className="bg-[#C40202] w-full" onClick={() => openChange(false)}>Ok</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
