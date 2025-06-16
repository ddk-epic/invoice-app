import React from "react";
import { SignIn } from "@clerk/nextjs";

function SignInPage() {
  return (
    <div className="h-screen flex justify-center items-center">
      <SignIn forceRedirectUrl={"/dashboard"} />
    </div>
  );
}

export default SignInPage;
