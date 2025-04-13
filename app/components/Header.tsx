import Image from "next/image";
import Link from "next/link";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { domain } from "@/app/lib/domain";

export default function Header({ className }: { className: string }) {
  const { user } = useUser();

  return (
    <header className={`relative w-full ${className}`}>
      <div className="flex min-h-[60px] items-center justify-end bg-white px-4 py-2 md:mt-4">
        {/* Credits Section - Right aligned */}
        <div className="flex items-center space-x-2">
          <SignedOut>
            <SignInButton
              mode="modal"
              signUpForceRedirectUrl={domain}
              forceRedirectUrl={domain}
            />
          </SignedOut>
          <SignedIn>
            {user?.unsafeMetadata.remaining === "BYOK" ? (
              <p className="text-gray-600">Your API key</p>
            ) : (
              <p className="text-gray-600">Credits: {`${user?.unsafeMetadata.remaining ?? 3}`}</p>
            )}
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
