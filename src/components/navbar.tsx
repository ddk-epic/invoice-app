import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  SignedOut,
  SignInButton,
  SignUpButton,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";

import Link from "next/link";

function Navbar() {
  return (
    <nav className="fixed w-full bg-white border-b border-gray-200">
      <div className="wrapper flex justify-between h-16">
        <div className="flex items-center">
          {/* Link */}
          <Link href="/dashboard">
            <div className="flex-shrink-0 flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Invoice App
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-1">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost">Sign-In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="purple-gradient">Sign-Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
