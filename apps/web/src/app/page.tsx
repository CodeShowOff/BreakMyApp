"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ArrowRight, Shield, ShieldAlert, Fingerprint, Bug } from "lucide-react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openSolution, setOpenSolution] = useState<number | null>(null);
  const { userId } = useAuth();

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const toggleSolution = (index: number) => {
    setOpenSolution(openSolution === index ? null : index);
  };

  const faqs = [
    {
      color: "bg-violet-800 text-white",
      question: "What makes an agent-based scanner different?",
      answer: "Traditional DAST scanners rely on known signatures and random payload fuzzing. Our exploratory agents map your application's roles, objects, and relationships to build a semantic model, generating targeted attacks to find complex business logic flaws."
    },
    {
      color: "bg-neutral-100 text-neutral-900",
      question: "How do we integrate this into our workflow?",
      answer: "BreakMyApp provides a comprehensive API and CLI. You can trigger runs automatically via your CI/CD pipelines, block deployments on high-risk findings, and sync verified vulnerabilities directly to issue trackers like Jira or Linear."
    },
    {
      color: "bg-violet-950 text-white",
      question: "Do you need source code access?",
      answer: "No. BreakMyApp operates dynamically. We only need authorized credentials for the application roles you want to test and network access to your staging or development environment."
    },
    {
      color: "bg-neutral-100 text-neutral-900",
      question: "What happens when you find a vulnerability?",
      answer: "We don't just alert you. We provide a fully reproducible timeline, the exact HTTP request/response traces used to exploit the flaw, and actionable remediation advice tailored to the specific business logic failure."
    }
  ];

  const solutions = [
    {
      icon: Fingerprint,
      title: "IDOR Detection",
      description: "Automatically detect Insecure Direct Object References. Our agents cross identity boundaries, attempting to access or modify objects belonging to other tenants to ensure your object-level authorization is airtight."
    },
    {
      icon: ShieldAlert,
      title: "Privilege Escalation",
      description: "Identify vertical and horizontal privilege escalation paths. We map your intended RBAC model and relentlessly probe for loopholes that allow unauthorized administrative actions."
    },
    {
      icon: Bug,
      title: "Business Logic Flaws",
      description: "Find vulnerabilities that scanners miss. By understanding the context of your application, we identify workflow bypasses, state manipulation, and rate-limiting failures."
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-violet-800 selection:text-white scroll-smooth">
      
      {/* Pill Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="max-w-7xl w-full bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-full px-4 py-2.5 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2 font-bold tracking-tight text-white ml-2">
            <Shield className="h-5 w-5 text-violet-800 fill-violet-800" />
            <span className="uppercase tracking-widest text-sm">BreakMyApp</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-widest uppercase text-neutral-400">
            <Link href="#platform" className="hover:text-white transition-colors">Platform</Link>
            <Link href="#process" className="hover:text-white transition-colors">Process</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
          {!userId ? (
            <Link href="/sign-in" className="bg-violet-800 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-violet-900 transition-colors">
              Sign In
            </Link>
          ) : (
            <Link href="/dashboard" className="bg-neutral-900 text-white border border-neutral-700 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">
              Dashboard
            </Link>
          )}
        </nav>
      </div>

      <main>
        {/* Hero Section */}
        <section className="pt-48 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-end">
            <div className="flex-1">
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase">
                Build <br />
                Software <br />
                <span className="text-violet-800">Attackers</span> <br />
                <span className="text-violet-800">Can&apos;t Break</span>
              </h1>
            </div>
            <div className="w-full lg:w-[400px] pb-6">
              <p className="text-lg md:text-xl text-neutral-400 font-medium leading-relaxed mb-8">
                We design the adversarial systems, exploration flows, and business logic models that find vulnerabilities before they hit production.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xl font-bold">Deploying to Production?</span>
                  <span className="text-neutral-400">Test with BreakMyApp first.</span>
                </div>
                {!userId ? (
                  <Link href="/sign-in">
                    <ArrowRight className="h-8 w-8 text-white rotate-45 mt-4 hover:text-violet-800 transition-colors cursor-pointer" />
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <ArrowRight className="h-8 w-8 text-white rotate-45 mt-4 hover:text-violet-800 transition-colors cursor-pointer" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Statement Section */}
        <section id="platform" className="py-32 px-6 md:px-12 border-t border-neutral-800">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8">
            <div>
              <div className="text-violet-800 font-bold uppercase tracking-widest text-xs mb-8 flex items-center gap-4">
                Our Perspective
                <div className="w-6 h-6 rounded-full border border-violet-800 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-violet-800 rounded-full"></div>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] uppercase">
                Scanners Don&apos;t <br />
                Find Logic Flaws. <br />
                Agents Do.
              </h2>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-2xl font-medium leading-snug mb-16 border-b border-neutral-800 pb-16">
                Fuzzing endpoints and discovering complex authorization bypasses are two completely different challenges.
              </p>
              <div className="flex items-start gap-16">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4">Legacy Tools Build</div>
                  <div className="text-3xl font-black tracking-tighter text-neutral-600 uppercase">Scanners</div>
                </div>
                <div className="w-[1px] h-16 bg-violet-800"></div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-violet-800 mb-4">We Build</div>
                  <div className="text-3xl font-black tracking-tighter text-white uppercase">Adversaries</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="py-32 px-6 md:px-12 bg-white text-neutral-950">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Process Steps */}
            <div className="lg:col-span-8 bg-neutral-50 border border-neutral-200 rounded-[2rem] p-12">
              <div className="text-violet-800 font-bold uppercase tracking-widest text-xs mb-16">The Methodology</div>
              <div className="flex flex-col md:flex-row gap-8 justify-between relative">
                
                <div className="relative z-10 flex-1">
                  <div className="text-violet-800 font-bold text-sm mb-4">01</div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase mb-4">Explore</h3>
                  <div className="text-neutral-500 text-xs font-bold uppercase tracking-widest">The Application</div>
                </div>
                
                <div className="hidden md:flex items-center justify-center flex-1 relative">
                  <div className="w-10 h-10 rounded-full border border-violet-800 flex items-center justify-center relative z-10 bg-neutral-50">
                    <div className="w-2 h-2 bg-violet-800 rounded-full"></div>
                  </div>
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-300 to-neutral-300 -translate-y-1/2"></div>
                </div>

                <div className="relative z-10 flex-1">
                  <div className="text-violet-800 font-bold text-sm mb-4">02</div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase mb-4">Model</h3>
                  <div className="text-neutral-500 text-xs font-bold uppercase tracking-widest">The Logic</div>
                </div>

                <div className="hidden md:flex items-center justify-center flex-1 relative">
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-neutral-300 via-neutral-300 to-transparent -translate-y-1/2"></div>
                </div>

                <div className="relative z-10 flex-1">
                  <div className="text-violet-800 font-bold text-sm mb-4">03</div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase mb-4">Attack</h3>
                  <div className="text-neutral-500 text-xs font-bold uppercase tracking-widest">The Boundaries</div>
                </div>
              </div>
            </div>

            {/* Quote Box */}
            <div className="lg:col-span-4 bg-violet-800 text-white rounded-[2rem] p-12 flex flex-col justify-center">
              <h3 className="text-3xl font-black tracking-tighter leading-[1.1] mb-8">
                Security isn&apos;t just what you test. <br />
                <span className="text-white/70">It&apos;s what attackers do with it.</span>
              </h3>
              <div className="w-12 h-1 bg-white"></div>
            </div>
          </div>
        </section>

        {/* Deep Dive Section */}
        <section className="py-32 px-6 md:px-12 bg-white text-neutral-950">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] uppercase mb-8">
                The Code Can Be <br />
                Perfect. <br />
                The Product <br />
                Can Still Fail.
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-1 bg-violet-800"></div>
                <div className="w-10 h-10 rounded-full border border-violet-800 flex items-center justify-center">
                  <div className="w-2 h-2 bg-violet-800 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center max-w-md">
              <p className="text-xl font-medium leading-relaxed text-neutral-600">
                It&apos;s often a <strong className="text-black">business logic problem</strong> — understanding how users interact with roles, objects, and relationships to bypass intended constraints. BreakMyApp finds these gaps automatically.
              </p>
            </div>
          </div>
          
          {/* Solutions Accordion */}
          <div className="max-w-7xl mx-auto mt-24 border-t-4 border-violet-800">
             <div className="bg-violet-800 text-white font-black uppercase text-sm tracking-widest px-4 py-2 inline-block -mt-1">
               Automated Detection
             </div>
             
             {solutions.map((sol, i) => (
               <div key={i} className="border-b-2 border-neutral-200">
                 <div 
                   onClick={() => toggleSolution(i)}
                   className="flex items-center justify-between py-8 cursor-pointer hover:bg-neutral-50 transition-colors px-4 group"
                 >
                    <div className="flex items-center gap-6">
                      <sol.icon className="h-8 w-8 text-violet-800" />
                      <span className="text-2xl font-black tracking-tighter uppercase">{sol.title}</span>
                    </div>
                    <div className={`text-4xl font-light transition-transform duration-300 ${openSolution === i ? "rotate-45 text-violet-800" : "text-black group-hover:text-violet-800"}`}>
                      +
                    </div>
                 </div>
                 {openSolution === i && (
                   <div className="px-4 pb-8 pl-18 max-w-3xl">
                     <p className="text-lg text-neutral-600 leading-relaxed border-l-2 border-violet-800 pl-6 ml-2">
                       {sol.description}
                     </p>
                   </div>
                 )}
               </div>
             ))}
          </div>
        </section>

        {/* Fit Section */}
        <section className="py-32 px-6 md:px-12 bg-neutral-950 text-white border-t border-neutral-800">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-8">
            <div className="flex-1">
              <div className="text-violet-800 font-bold uppercase tracking-widest text-xs mb-8">
                Is BreakMyApp The Right Fit?
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] uppercase max-w-lg">
                We Work Best <br />
                With Teams <br />
                Building:
              </h2>
            </div>
            <div className="flex-1 flex flex-col justify-center">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-800 border border-neutral-800">
                  <div className="bg-neutral-900 p-6 flex items-center gap-3 font-medium text-lg">
                    <span className="text-violet-800">✓</span> B2B SaaS Platforms
                  </div>
                  <div className="bg-neutral-900 p-6 flex items-center gap-3 font-medium text-lg">
                    <span className="text-violet-800">✓</span> Multi-tenant Systems
                  </div>
                  <div className="bg-neutral-900 p-6 flex items-center gap-3 font-medium text-lg">
                    <span className="text-violet-800">✓</span> Fintech & Healthcare
                  </div>
                  <div className="bg-neutral-900 p-6 flex items-center gap-3 font-medium text-lg">
                    <span className="text-violet-800">✓</span> Enterprise APIs
                  </div>
                  <div className="bg-neutral-900 p-6 flex items-center gap-3 font-medium text-lg">
                    <span className="text-violet-800">✓</span> Custom RBAC logic
                  </div>
                  <div className="bg-neutral-900 p-6 flex items-center gap-3 font-medium text-lg">
                    <span className="text-violet-800">✓</span> Zero Trust Architectures
                  </div>
               </div>
               <div className="bg-violet-800 text-white p-8 mt-8">
                 <p className="text-lg font-medium leading-relaxed">
                   If your product&apos;s security relies on complex authorization rules, custom roles, or sensitive data boundaries — we&apos;re likely a great fit.
                 </p>
               </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-32 px-6 md:px-12 bg-white text-neutral-950">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase mb-16">
              FAQ
            </h2>
            
            <div className="flex flex-col border-t-2 border-black border-b-2">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b-2 border-black last:border-b-0">
                  <div 
                    onClick={() => toggleFaq(index)}
                    className={`${faq.color} p-8 flex justify-between items-center cursor-pointer group transition-colors`}
                  >
                    <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase pr-8">
                      {faq.question}
                    </h3>
                    <div className="text-4xl font-light w-8 text-center transition-transform duration-300 flex-shrink-0">
                      {openFaq === index ? "−" : "+"}
                    </div>
                  </div>
                  {openFaq === index && (
                    <div className="bg-white text-black p-8 text-lg font-medium leading-relaxed border-t-2 border-dashed border-black/20">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Massive Purple CTA Section */}
        <section className="py-32 px-6 md:px-12 bg-violet-800 text-white">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 justify-between items-center">
             <div className="flex-1">
               <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] uppercase max-w-2xl mb-8">
                 Building <br />
                 Something <br />
                 People Should <br />
                 Trust With <br />
                 Their Data?
               </h2>
               <p className="text-xl font-medium max-w-md leading-relaxed text-white/90">
                 If you&apos;re creating a product where security and trust are the foundation — not just an afterthought — we&apos;d love to help.
               </p>
             </div>
             <div>
               {!userId ? (
                 <Link href="/sign-in" className="bg-neutral-900 text-white px-8 py-6 flex items-center justify-between gap-8 hover:bg-black transition-colors w-full md:w-auto shadow-2xl">
                   <span className="text-xl font-black tracking-tighter uppercase">Start Testing Now</span>
                   <ArrowRight className="h-6 w-6" />
                 </Link>
               ) : (
                 <Link href="/dashboard" className="bg-neutral-900 text-white px-8 py-6 flex items-center justify-between gap-8 hover:bg-black transition-colors w-full md:w-auto shadow-2xl">
                   <span className="text-xl font-black tracking-tighter uppercase">Go To Dashboard</span>
                   <ArrowRight className="h-6 w-6" />
                 </Link>
               )}
               <div className="text-xs font-bold uppercase tracking-widest text-white/60 mt-4 text-center">
                 Setup in 5 minutes &middot; Continuous Verification
               </div>
             </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800 py-12 px-6 text-center text-white">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 font-bold tracking-tight mb-6">
            <Shield className="h-6 w-6 text-violet-800 fill-violet-800" />
            <span className="uppercase tracking-widest text-lg">BreakMyApp</span>
          </div>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-widest text-neutral-500 mb-12">
            <Link href="#platform" className="hover:text-white transition-colors">Platform</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          </div>
          <div className="text-xs text-neutral-600 uppercase tracking-widest font-bold">
            © 2026 BreakMyApp Inc.
          </div>
        </div>
      </footer>
    </div>
  );
}
