import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"

export function SuccessModal({openStatus, openChange}: {openStatus: boolean, openChange: (state: boolean) => void}) {
  return (
    <AlertDialog open={openStatus} onOpenChange={openChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Payment Successful</AlertDialogTitle>
          <AlertDialogDescription>
            Your payment has been successfully processed. 🎉
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={() => openChange(false)}>Close</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function FailureModal({openStatus, openChange}: {openStatus: boolean, openChange: (state: boolean) => void}) {
  return (
    <AlertDialog open={openStatus} onOpenChange={openChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Payment Failed</AlertDialogTitle>
          <AlertDialogDescription>
            Unfortunately, your payment could not be processed. Please try again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={() => openChange(false)}>Close</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
