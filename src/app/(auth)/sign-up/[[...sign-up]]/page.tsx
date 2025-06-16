import React from "react";
import { SignUp } from "@clerk/nextjs";

function SignUpPage() {
  return (
    <div className="h-screen flex justify-center items-center">
      <SignUp />
    </div>
  );
}

export default SignUpPage;
