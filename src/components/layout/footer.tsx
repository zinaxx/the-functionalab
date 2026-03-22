import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#2A2A2A] text-stone-300">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/Logo functionallab.jpeg"
                alt="The FunctionaLab"
                className="h-10 w-10 object-contain"
              />
              <span className="font-display text-xl font-bold text-white">
                The <span className="text-[#fd5227]">FunctionaLab</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400">
              Jounieh&apos;s premier functional fitness gym. Train for life.
            </p>
            <a
              href="https://instagram.com/functionallab.lb"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-stone-400 hover:text-[#fd5227] transition-colors"
            >
              <Instagram className="h-4 w-4" />
              @functionallab.lb
            </a>
          </div>

          {/* Gym */}
          <div>
            <h3 className="text-sm font-semibold font-body uppercase tracking-widest text-stone-500 mb-4">
              Gym
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/schedule", label: "Class Schedule" },
                { href: "/instructors", label: "Our Coaches" },
                { href: "/pricing", label: "Pricing & Packs" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold font-body uppercase tracking-widest text-stone-500 mb-4">
              Account
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/login", label: "Sign In" },
                { href: "/signup", label: "Create Account" },
                { href: "/dashboard", label: "My Dashboard" },
                { href: "/dashboard/membership", label: "Membership" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold font-body uppercase tracking-widest text-stone-500 mb-4">
              Find Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-stone-400">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[#fd5227]" />
                <span>Jounieh, Lebanon</span>
              </li>
              <li>
                <a
                  href="tel:+9619612345"
                  className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 text-[#fd5227]" />
                  +961 96 123 45
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@functionallab.lb"
                  className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 text-[#fd5227]" />
                  hello@functionallab.lb
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#2A2A2A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
          <p>© {new Date().getFullYear()} The FunctionaLab. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-stone-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-stone-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
