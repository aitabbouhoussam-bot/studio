
"use client";

import { AuthModal } from "@/components/auth-modal";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
      setIsOpen(false);
      // We push to home for a better UX than leaving a blank page
      router.push('/'); 
  }

  return <AuthModal isOpen={isOpen} onClose={handleClose} initialMode="signup"/>;
}
