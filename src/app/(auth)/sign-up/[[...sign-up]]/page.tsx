import React from "react";
import { SignUp } from "@clerk/nextjs";

function SignUpPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}

export default SignUpPage;
