import nodemailer, { SendMailOptions } from 'nodemailer'

let verifiedPromise: Promise<void> | null = null

const createTransporter = () => {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : port === 465

  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s/g, '') : undefined

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: user && pass ? { user, pass } : undefined,
  })
}

const verifyTransporterOnce = async (transporter: ReturnType<typeof nodemailer.createTransport>) => {
  if (!verifiedPromise) {
    verifiedPromise = transporter.verify().then(() => undefined)
  }
  return verifiedPromise
}

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
    console.log({ to, subject })
    return
  }

  try {
    const transporter = createTransporter()
    await verifyTransporterOnce(transporter)
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
    const smtpUser = process.env.SMTP_USER
    const rawPass = process.env.SMTP_PASS
    const passNoSpaces = rawPass ? rawPass.replace(/\s/g, '') : undefined

    const hint =
      typeof smtpUser === 'string' && smtpUser.includes('@gmail.com')
        ? 'Gmail: utilise un mot de passe d’application (2FA activée), puis redémarre le process en rechargeant les variables (PM2: --update-env).'
        : 'Vérifie SMTP_USER/SMTP_PASS, et redémarre le process en rechargeant les variables.'

    const smtpErrorInfo: {
      code?: string
      responseCode?: number
      command?: string
    } = (() => {
      if (typeof error !== 'object' || error === null) return {}
      const maybe = error as {
        code?: unknown
        responseCode?: unknown
        command?: unknown
      }
      return {
        code: typeof maybe.code === 'string' ? maybe.code : undefined,
        responseCode: typeof maybe.responseCode === 'number' ? maybe.responseCode : undefined,
        command: typeof maybe.command === 'string' ? maybe.command : undefined,
      }
    })()

    console.error("Error sending email:", {
      ...smtpErrorInfo,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: smtpUser ? `${smtpUser.slice(0, 2)}***${smtpUser.slice(-10)}` : undefined,
      passLength: passNoSpaces?.length,
      hint,
    })

    throw new Error('Échec envoi email (SMTP_AUTH)', { cause: error })
  }
}
