/**
 * Best-effort SMS + email notifications. Never throws — a notification
 * failure must never block the action (enquiry, reply, publish) that triggered it.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "RentaGh <notifications@rentagh.com>";
const ARKESEL_API_KEY = process.env.ARKESEL_API_KEY;
const ARKESEL_SENDER_ID = process.env.ARKESEL_SENDER_ID ?? "RentaGh";

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: RESEND_FROM_EMAIL, to, subject, html }),
    });
    if (!res.ok) console.error("sendEmail failed", res.status, await res.text());
  } catch (err) {
    console.error("sendEmail error", err);
  }
}

export async function sendSms(phone: string, message: string): Promise<void> {
  if (!ARKESEL_API_KEY) return;
  try {
    const res = await fetch("https://sms.arkesel.com/api/v2/sms/send", {
      method: "POST",
      headers: {
        "api-key": ARKESEL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sender: ARKESEL_SENDER_ID, message, recipients: [phone] }),
    });
    if (!res.ok) console.error("sendSms failed", res.status, await res.text());
  } catch (err) {
    console.error("sendSms error", err);
  }
}

/** Service-role lookup of a listing owner's email + phone (bypasses RLS). */
export async function getOwnerContact(
  ownerId: string,
): Promise<{ email?: string; phone?: string }> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: userData }, { data: profile }] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(ownerId),
      supabaseAdmin.from("profiles").select("phone").eq("user_id", ownerId).maybeSingle(),
    ]);
    return {
      email: userData?.user?.email ?? undefined,
      phone: (profile as { phone: string | null } | null)?.phone ?? undefined,
    };
  } catch (err) {
    console.error("getOwnerContact error", err);
    return {};
  }
}

/** Shared branded wrapper for transactional notification emails. */
export function renderNotificationEmail(
  heading: string,
  bodyHtml: string,
  ctaHref?: string,
  ctaLabel?: string,
): string {
  const cta = ctaHref
    ? `<tr><td style="padding:28px 0 4px;"><a href="${ctaHref}" style="display:inline-block;background:#014421;color:#F8F6F1;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:999px;">${ctaLabel ?? "View in dashboard"}</a></td></tr>`
    : "";
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#EAEAEA;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EAEAEA;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#F8F6F1;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background:#014421;padding:24px 32px;">
                <span style="color:#D4A437;font-size:20px;font-weight:700;">RentaGh</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr><td style="font-size:18px;font-weight:700;color:#1B1B1B;padding-bottom:12px;">${heading}</td></tr>
                  <tr><td style="font-size:14px;line-height:1.6;color:#1B1B1B;">${bodyHtml}</td></tr>
                  ${cta}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;border-top:1px solid #EAEAEA;font-size:12px;color:#6b6b6b;">
                RentaGh — Every Space. One Platform.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
