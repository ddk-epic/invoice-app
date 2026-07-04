import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

import Link from "next/link";

function Navbar() {
  return (
    <nav className="fixed w-full border-b border-gray-200 bg-white">
      <div className="wrapper flex h-16 justify-between">
        <div className="flex items-center">
          {/* Link */}
          <Link href="/dashboard">
            <div className="flex flex-shrink-0 items-center">
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
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost">Sign-In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="purple-gradient">Sign-Up</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
