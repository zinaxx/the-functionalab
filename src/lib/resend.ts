import { Resend } from "resend";

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "hello@zenstudio.com";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY ?? "placeholder");
  }
  return _resend;
}

// Keep backward compat export — lazy getter
export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    return getResend()[prop as keyof Resend];
  },
});
