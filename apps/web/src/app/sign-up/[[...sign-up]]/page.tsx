import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 relative overflow-hidden font-sans">
      
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-neutral-800 rounded-full z-0 opacity-50"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-neutral-800 rounded-full z-0 opacity-50"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-800/5 rounded-full blur-[100px] z-0"></div>

      {/* Top Nav/Logo */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-white">
          <Shield className="h-6 w-6 text-violet-800 fill-violet-800" />
          <span className="uppercase tracking-widest text-lg">BreakMyApp</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <SignUp forceRedirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full mx-auto",
              card: "bg-neutral-900 border border-neutral-800 shadow-2xl rounded-2xl p-4 md:p-8 w-full",
              headerTitle: "text-white font-black tracking-tighter uppercase text-3xl",
              headerSubtitle: "text-neutral-400 font-bold uppercase tracking-widest text-xs mt-2",
              socialButtonsBlockButton: "border-neutral-700 bg-neutral-950 hover:bg-neutral-800 text-white transition-colors",
              socialButtonsBlockButtonText: "text-neutral-300 font-bold tracking-wide",
              dividerLine: "bg-neutral-700",
              dividerText: "text-neutral-500 uppercase tracking-widest text-xs font-bold",
              formFieldLabel: "text-neutral-400 uppercase tracking-widest text-xs font-bold",
              formFieldInput: "bg-neutral-950 border-neutral-700 text-white focus:border-violet-800 focus:ring-1 focus:ring-violet-800 rounded-lg",
              formButtonPrimary: "bg-violet-800 text-white hover:bg-violet-900 font-black tracking-widest uppercase text-sm rounded-lg shadow-none py-3 transition-colors",
              footerActionText: "text-neutral-500",
              footerActionLink: "text-violet-800 hover:text-violet-700 font-bold tracking-wide",
              identityPreviewText: "text-neutral-300",
              identityPreviewEditButton: "text-violet-800 hover:text-violet-700",
              formFieldAction: "text-violet-800 hover:text-violet-700 font-bold tracking-wide"
            }
          }}
        />
      </div>
    </div>
  );
}
