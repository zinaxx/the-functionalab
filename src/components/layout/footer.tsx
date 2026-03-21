import Link from "next/link";
import { Leaf, Instagram, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Leaf className="h-5 w-5 text-sage-400" />
              <span className="font-display text-xl font-semibold text-white">Zen Studio</span>
            </Link>
            <p className="text-sm leading-relaxed text-stone-400">
              A boutique yoga studio in the heart of Paris. Find your balance, one breath at a time.
            </p>
            <a
              href="https://instagram.com/zenstudioparis"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-stone-400 hover:text-sage-400 transition-colors"
            >
              <Instagram className="h-4 w-4" />
              @zenstudioparis
            </a>
          </div>

          {/* Studio */}
          <div>
            <h3 className="text-sm font-semibold font-body uppercase tracking-widest text-stone-500 mb-4">
              Studio
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/schedule", label: "Class Schedule" },
                { href: "/instructors", label: "Our Instructors" },
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
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-sage-400" />
                <span>12 Rue de la Paix<br />75001 Paris, France</span>
              </li>
              <li>
                <a
                  href="tel:+33142601234"
                  className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 text-sage-400" />
                  +33 1 42 60 12 34
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@zenstudio.com"
                  className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 text-sage-400" />
                  hello@zenstudio.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
          <p>© {new Date().getFullYear()} Zen Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-stone-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-stone-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
