import nodemailer from 'nodemailer'

const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null

const FROM = process.env.FROM_EMAIL ?? 'noreply@churchconnect.app'
const APP = 'Church Connect'

export async function sendInquiryNotification(opts: {
  ownerEmail: string
  ownerName: string
  businessName: string
  fromName: string
  fromEmail: string
  message: string
}) {
  if (!transporter) return

  await transporter.sendMail({
    from: `"${APP}" <${FROM}>`,
    to: opts.ownerEmail,
    subject: `New inquiry for ${opts.businessName}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px">
        <h2 style="color:#1e1b4b;margin-top:0">📬 New Inquiry</h2>
        <p style="color:#6b7280">Someone has sent a message about your listing on <strong>${APP}</strong>.</p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px"><strong>Business:</strong> ${opts.businessName}</p>
          <p style="margin:0 0 8px"><strong>From:</strong> ${opts.fromName} (${opts.fromEmail})</p>
          <p style="margin:0"><strong>Message:</strong></p>
          <p style="color:#374151;white-space:pre-wrap">${opts.message}</p>
        </div>
        <p style="color:#6b7280;font-size:13px">Log in to your dashboard to view and reply to this inquiry.</p>
      </div>
    `,
  }).catch(console.error)
}
