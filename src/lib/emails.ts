import { resend, FROM_EMAIL } from "@/lib/resend";
import { format } from "date-fns";

function studioEmailWrapper(content: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
        body { font-family: 'Barlow', Arial, sans-serif; background: #0A0A0A; margin: 0; padding: 0; color: #FFFFFF; }
        .container { max-width: 560px; margin: 40px auto; background: #141414; border-radius: 16px; overflow: hidden; border: 1px solid #2A2A2A; }
        .header { background: #111111; padding: 32px 40px; text-align: center; border-bottom: 2px solid #fd5227; }
        .header img { width: 64px; height: 64px; object-fit: contain; margin-bottom: 12px; }
        .header h1 { color: white; font-family: 'Barlow Condensed', Arial Narrow, sans-serif; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: 0.08em; text-transform: uppercase; }
        .header h1 span { color: #fd5227; }
        .header p { color: #6B7280; font-family: 'Barlow Condensed', Arial Narrow, sans-serif; font-size: 11px; margin: 6px 0 0; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 600; }
        .body { padding: 36px 40px; }
        .body p { font-family: 'Barlow', Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #A3A3A3; margin: 0 0 16px; }
        .body strong { color: #FFFFFF; }
        .detail-card { background: #1A1A1A; border-radius: 12px; padding: 20px 24px; margin: 24px 0; border: 1px solid #2A2A2A; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #2A2A2A; font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-family: 'Barlow Condensed', Arial Narrow, sans-serif; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #6B7280; font-size: 12px; padding-top: 1px; }
        .detail-value { font-family: 'Barlow', Arial, sans-serif; color: #FFFFFF; font-weight: 500; text-align: right; }
        .cta-button { display: inline-block; background: #fd5227; color: white; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-family: 'Barlow Condensed', Arial Narrow, sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin: 8px 0; }
        .footer { padding: 24px 40px; border-top: 1px solid #2A2A2A; text-align: center; font-family: 'Barlow', Arial, sans-serif; font-size: 12px; color: #6B7280; }
        .footer a { color: #fd5227; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>The <span>Functiona</span>Lab</h1>
          <p>Jounieh &nbsp;·&nbsp; Train For Life</p>
        </div>
        <div class="body">${content}</div>
        <div class="footer">
          <p>Jounieh, Lebanon &nbsp;·&nbsp; <a href="mailto:hello@functionallab.lb">hello@functionallab.lb</a></p>
          <p><a href="${appUrl}">${appUrl.replace(/https?:\/\//, "")}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

interface ClassEmailData {
  userName: string;
  userEmail: string;
  className: string;
  instructorName: string;
  startsAt: Date;
  endsAt: Date;
  room: string;
}

export async function sendBookingConfirmedEmail(data: ClassEmailData) {
  const timeStr = `${format(data.startsAt, "EEEE, MMMM d")} · ${format(data.startsAt, "h:mm a")} – ${format(data.endsAt, "h:mm a")}`;
  const html = studioEmailWrapper(`
    <p>Hi ${data.userName || "there"},</p>
    <p>You're all set! We're looking forward to seeing you in class.</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Class</span><span class="detail-value">${data.className}</span></div>
      <div class="detail-row"><span class="detail-label">Coach</span><span class="detail-value">${data.instructorName}</span></div>
      <div class="detail-row"><span class="detail-label">When</span><span class="detail-value">${timeStr}</span></div>
      <div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">${data.room || "The FunctionaLab, Jounieh"}</span></div>
    </div>
    <p>Please arrive 5–10 minutes early. All equipment is provided.</p>
    <p>Need to cancel? You can do so up to 12 hours before class from your dashboard — no charge applies.</p>
    <p style="text-align:center; margin-top: 28px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta-button">View my bookings</a>
    </p>
    <p style="margin-top: 24px;">Train hard,<br /><strong>The FunctionaLab team</strong></p>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.userEmail,
    subject: `You're booked in — ${data.className}`,
    html,
  });
}

export async function sendClassReminderEmail(data: ClassEmailData) {
  const timeStr = `${format(data.startsAt, "h:mm a")} – ${format(data.endsAt, "h:mm a")}`;
  const html = studioEmailWrapper(`
    <p>Hi ${data.userName || "there"},</p>
    <p>Just a friendly reminder — your class is <strong>tomorrow</strong>!</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Class</span><span class="detail-value">${data.className}</span></div>
      <div class="detail-row"><span class="detail-label">Coach</span><span class="detail-value">${data.instructorName}</span></div>
      <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${timeStr}</span></div>
      <div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">${data.room || "The FunctionaLab, Jounieh"}</span></div>
    </div>
    <p>We'll see you on the floor. Don't forget to bring water and a towel!</p>
    <p style="margin-top: 24px;">Train hard,<br /><strong>The FunctionaLab team</strong></p>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.userEmail,
    subject: `See you tomorrow — ${data.className}`,
    html,
  });
}

export async function sendWaitlistPromotedEmail(data: ClassEmailData) {
  const timeStr = `${format(data.startsAt, "EEEE, MMMM d")} · ${format(data.startsAt, "h:mm a")} – ${format(data.endsAt, "h:mm a")}`;
  const html = studioEmailWrapper(`
    <p>Hi ${data.userName || "there"},</p>
    <p>Great news — a spot just opened up in <strong>${data.className}</strong> and you're in!</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Class</span><span class="detail-value">${data.className}</span></div>
      <div class="detail-row"><span class="detail-label">Coach</span><span class="detail-value">${data.instructorName}</span></div>
      <div class="detail-row"><span class="detail-label">When</span><span class="detail-value">${timeStr}</span></div>
      <div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">${data.room || "The FunctionaLab, Jounieh"}</span></div>
    </div>
    <p>Your booking is confirmed — no action needed. See you in class!</p>
    <p style="text-align:center; margin-top: 28px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta-button">View my bookings</a>
    </p>
    <p style="margin-top: 24px;">Train hard,<br /><strong>The FunctionaLab team</strong></p>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.userEmail,
    subject: `A spot opened up — ${data.className}`,
    html,
  });
}

export async function sendLateCancelEmail(data: ClassEmailData) {
  const html = studioEmailWrapper(`
    <p>Hi ${data.userName || "there"},</p>
    <p>You've cancelled your booking for <strong>${data.className}</strong> within 12 hours of the class start time.</p>
    <p>Per our late cancellation policy, your credit for this class <strong>has not been refunded</strong>.</p>
    <p>If you believe this was an error or have an exceptional circumstance, please contact us at <a href="mailto:hello@functionallab.lb" style="color:#fd5227;">hello@functionallab.lb</a>.</p>
    <p style="margin-top: 24px;">Train hard,<br /><strong>The FunctionaLab team</strong></p>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.userEmail,
    subject: `Late cancellation — credit not refunded`,
    html,
  });
}

export async function sendPaymentConfirmedEmail({
  userName,
  userEmail,
  description,
  amount,
  creditsAdded,
}: {
  userName: string;
  userEmail: string;
  description: string;
  amount: number; // in cents
  creditsAdded: number;
}) {
  const amountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount / 100);

  const html = studioEmailWrapper(`
    <p>Hi ${userName || "there"},</p>
    <p>Your payment has been confirmed. Here's your receipt:</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Description</span><span class="detail-value">${description}</span></div>
      <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">${amountFormatted}</span></div>
      ${creditsAdded > 0 ? `<div class="detail-row"><span class="detail-label">Credits added</span><span class="detail-value">${creditsAdded} credits</span></div>` : ""}
    </div>
    <p style="text-align:center; margin-top: 28px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/membership" class="cta-button">View my account</a>
    </p>
    <p style="margin-top: 24px;">Train hard,<br /><strong>The FunctionaLab team</strong></p>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: `Payment confirmed — ${description}`,
    html,
  });
}

export async function sendAdminRemovedEmail(data: ClassEmailData) {
  const timeStr = `${format(data.startsAt, "EEEE, MMMM d")} · ${format(data.startsAt, "h:mm a")} – ${format(data.endsAt, "h:mm a")}`;
  const html = studioEmailWrapper(`
    <p>Hi ${data.userName || "there"},</p>
    <p>Your booking for <strong>${data.className}</strong> has been removed by our team.</p>
    <div class="detail-card">
      <div class="detail-row"><span class="detail-label">Class</span><span class="detail-value">${data.className}</span></div>
      <div class="detail-row"><span class="detail-label">Coach</span><span class="detail-value">${data.instructorName}</span></div>
      <div class="detail-row"><span class="detail-label">When</span><span class="detail-value">${timeStr}</span></div>
    </div>
    <p>If you have any questions, don't hesitate to reach out to us at <a href="mailto:hello@functionallab.lb" style="color:#fd5227;">hello@functionallab.lb</a> or call <strong>81 651 151</strong>.</p>
    <p style="text-align:center; margin-top: 28px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/schedule" class="cta-button">Browse schedule</a>
    </p>
    <p style="margin-top: 24px;">Train hard,<br /><strong>The FunctionaLab team</strong></p>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to: data.userEmail,
    subject: `Booking removed — ${data.className}`,
    html,
  });
}

export async function sendClassCancelledEmail({
  userName,
  userEmail,
  className,
  startsAt,
  creditsRefunded,
}: {
  userName: string;
  userEmail: string;
  className: string;
  startsAt: Date;
  creditsRefunded: number;
}) {
  const dateStr = format(startsAt, "EEEE, MMMM d 'at' h:mm a");
  const html = studioEmailWrapper(`
    <p>Hi ${userName || "there"},</p>
    <p>We're sorry to let you know that <strong>${className}</strong> on ${dateStr} has been cancelled.</p>
    ${creditsRefunded > 0 ? `<p>Your <strong>${creditsRefunded} credit${creditsRefunded > 1 ? "s" : ""}</strong> have been returned to your account.</p>` : ""}
    <p>We apologise for the inconvenience. Please check our schedule for alternative classes.</p>
    <p style="text-align:center; margin-top: 28px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/schedule" class="cta-button">Browse schedule</a>
    </p>
    <p style="margin-top: 24px;">Train hard,<br /><strong>The FunctionaLab team</strong></p>
  `);

  return resend.emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: `Class cancelled — ${className}`,
    html,
  });
}
