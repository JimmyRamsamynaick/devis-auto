import nodemailer, { SendMailOptions } from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendEmail = async ({
  to,
  subject,
  html,
  attachments,
}: {
  to: string
  subject: string
  html: string
  attachments?: SendMailOptions['attachments']
}) => {
  if (!process.env.SMTP_HOST) {
    console.warn("SMTP_HOST not configured, skipping email")
    console.log({ to, subject, html })
    return
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"JimmyTech" <jimmyramsamynaick@gmail.com>',
      to,
      subject,
      html,
      attachments,
    })
    console.log("Message sent: %s", info.messageId)
    return info
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}
