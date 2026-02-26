import { getErrorMessage } from '../i18n'

// Initialize Resend client
async function getResendClient(apiKey?: string) {
  const key = apiKey || process.env.RESEND_API_KEY
  if (!key) {
    console.warn('RESEND_API_KEY not configured - emails will not be sent')
    return null
  }
  const { Resend } = await import('resend')
  return new Resend(key)
}

interface WelcomeEmailData {
  to: string
  name: string
  email: string
  password: string
  schoolName: string
  loginUrl: string
  apiKey?: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send welcome email to new school administrator
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
  const subject = `Bienvenue sur Yeko - Accès Administrateur ${data.schoolName}`

  if (process.env.NODE_ENV === 'development') {
    console.warn('--- [DEVELOPMENT] EMAIL TO:', data.to, '---')
    console.warn('Subject:', subject)
    console.warn('Credentials:', { email: data.email, password: data.password })
    console.warn('Login URL:', data.loginUrl)
    console.warn('-------------------------------------------')
    return { success: true, messageId: 'dev-mode-log' }
  }

  const resend = await getResendClient(data.apiKey)

  if (!resend) {
    return { success: false, error: getErrorMessage('serverError') }
  }

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Yeko <noreply@yeko.app>',
      to: data.to,
      subject,
      html: generateWelcomeEmailHTML(data),
      text: generateWelcomeEmailText(data),
    })

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true, messageId: result.data?.id }
  }
  catch (error) {
    console.error('Failed to send welcome email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

function generateWelcomeEmailHTML(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .credentials { background: #f8fafc; border: 2px solid #4F46E5; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .credentials h3 { margin-top: 0; color: #4F46E5; }
    .credential-item { margin: 12px 0; }
    .credential-label { font-weight: 600; color: #374151; }
    .credential-value { font-family: 'Monaco', 'Menlo', monospace; background: #e5e7eb; padding: 6px 12px; border-radius: 4px; display: inline-block; margin-top: 4px; }
    .button { display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { opacity: 0.9; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .steps { background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .steps h3 { margin-top: 0; color: #166534; }
    .steps ol { margin: 0; padding-left: 20px; }
    .steps li { margin: 8px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 20px; background: #f9fafb; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Bienvenue sur Yeko</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${data.name},</h2>
      <p>Votre compte administrateur pour <strong>${data.schoolName}</strong> a été créé avec succès sur la plateforme Yeko.</p>
      
      <div class="credentials">
        <h3>🔐 Vos identifiants de connexion</h3>
        <div class="credential-item">
          <div class="credential-label">Email :</div>
          <div class="credential-value">${data.email}</div>
        </div>
        <div class="credential-item">
          <div class="credential-label">Mot de passe temporaire :</div>
          <div class="credential-value">${data.password}</div>
        </div>
      </div>
      
      <div class="warning">
        <strong>⚠️ Important :</strong> Pour des raisons de sécurité, veuillez changer votre mot de passe lors de votre première connexion.
      </div>
      
      <div style="text-align: center;">
        <a href="${data.loginUrl}" class="button">Se connecter à Yeko</a>
      </div>
      
      <div class="steps">
        <h3>📋 Prochaines étapes</h3>
        <ol>
          <li>Connectez-vous avec vos identifiants</li>
          <li>Changez votre mot de passe</li>
          <li>Configurez les paramètres de votre école</li>
          <li>Ajoutez vos enseignants et élèves</li>
        </ol>
      </div>
      
      <p>Si vous avez des questions, n'hésitez pas à contacter notre équipe de support.</p>
      
      <p>Cordialement,<br><strong>L'équipe Yeko</strong></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Yeko - Plateforme de gestion scolaire</p>
      <p>Cet email contient des informations confidentielles.<br>Si vous l'avez reçu par erreur, veuillez le supprimer.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function generateWelcomeEmailText(data: WelcomeEmailData): string {
  return `
Bienvenue sur Yeko

Bonjour ${data.name},

Votre compte administrateur pour ${data.schoolName} a été créé avec succès sur la plateforme Yeko.

VOS IDENTIFIANTS DE CONNEXION :
Email : ${data.email}
Mot de passe temporaire : ${data.password}

⚠️ IMPORTANT : Pour des raisons de sécurité, veuillez changer votre mot de passe lors de votre première connexion.

Connectez-vous ici : ${data.loginUrl}

PROCHAINES ÉTAPES :
1. Connectez-vous avec vos identifiants
2. Changez votre mot de passe
3. Configurez les paramètres de votre école
4. Ajoutez vos enseignants et élèves

Si vous avez des questions, n'hésitez pas à contacter notre équipe de support.

Cordialement,
L'équipe Yeko

© ${new Date().getFullYear()} Yeko - Plateforme de gestion scolaire
  `.trim()
}

// ==================== Parent Invitation Email ====================

interface ParentInvitationEmailData {
  to: string
  parentName: string
  studentNames: string[]
  schoolName: string
  invitationUrl: string
  expiresAt: Date
  apiKey?: string
}

/**
 * Send invitation email to parent
 */
export async function sendParentInvitationEmail(data: ParentInvitationEmailData): Promise<EmailResult> {
  const subject = `Invitation Yeko - ${data.schoolName}`

  if (process.env.NODE_ENV === 'development') {
    console.warn('--- [DEVELOPMENT] EMAIL TO:', data.to, '---')
    console.warn('Subject:', subject)
    console.warn('Parent:', data.parentName)
    console.warn('Students:', data.studentNames.join(', '))
    console.warn('Invitation URL:', data.invitationUrl)
    console.warn('-------------------------------------------')
    return { success: true, messageId: 'dev-mode-log' }
  }

  const resend = await getResendClient(data.apiKey)

  if (!resend) {
    return { success: false, error: getErrorMessage('serverError') }
  }

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Yeko <noreply@yeko.app>',
      to: data.to,
      subject,
      html: generateParentInvitationHTML(data),
      text: generateParentInvitationText(data),
    })

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true, messageId: result.data?.id }
  }
  catch (error) {
    console.error('Failed to send parent invitation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

function generateParentInvitationHTML(data: ParentInvitationEmailData): string {
  const studentList = data.studentNames.map(name => `<li>${name}</li>`).join('')
  const expiryDate = data.expiresAt.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .info-box { background: #f8fafc; border-left: 4px solid #4F46E5; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .info-box h3 { margin-top: 0; color: #4F46E5; }
    .button { display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .features { background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .features h3 { margin-top: 0; color: #166534; }
    .features ul { margin: 0; padding-left: 20px; }
    .features li { margin: 8px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 20px; background: #f9fafb; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Invitation Yeko</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${data.parentName},</h2>
      <p>Vous avez été invité(e) à rejoindre la plateforme Yeko pour suivre la scolarité de votre/vos enfant(s) à <strong>${data.schoolName}</strong>.</p>
      
      <div class="info-box">
        <h3>👨‍👩‍👧‍👦 Vos enfants</h3>
        <ul>
          ${studentList}
        </ul>
      </div>
      
      <div class="features">
        <h3>✨ En acceptant cette invitation, vous pourrez</h3>
        <ul>
          <li>📊 Consulter les notes et moyennes</li>
          <li>📅 Suivre les absences et retards</li>
          <li>📬 Recevoir les communications de l'école</li>
          <li>📖 Accéder au cahier de texte</li>
          <li>🕐 Consulter l'emploi du temps</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.invitationUrl}" class="button">Accepter l'invitation</a>
      </div>
      
      <div class="warning">
        <p><strong>⏰ Important :</strong> Cette invitation expire le <strong>${expiryDate}</strong>.</p>
        <p style="font-size: 12px; margin-bottom: 0;">Si le lien ne fonctionne pas, copiez et collez cette URL dans votre navigateur :<br>
        <span style="word-break: break-all;">${data.invitationUrl}</span></p>
      </div>
      
      <p>Si vous n'êtes pas concerné(e) par cette invitation, vous pouvez ignorer cet email.</p>
      
      <p>Cordialement,<br><strong>L'équipe Yeko</strong></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Yeko - Plateforme de gestion scolaire</p>
      <p>Cet email contient des informations confidentielles.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function generateParentInvitationText(data: ParentInvitationEmailData): string {
  const studentList = data.studentNames.map(name => `- ${name}`).join('\n')
  const expiryDate = data.expiresAt.toLocaleDateString('fr-FR')

  return `
Invitation Yeko

Bonjour ${data.parentName},

Vous avez été invité(e) à rejoindre la plateforme Yeko pour suivre la scolarité de votre/vos enfant(s) à ${data.schoolName}.

VOS ENFANTS :
${studentList}

En acceptant cette invitation, vous pourrez :
- Consulter les notes et moyennes
- Suivre les absences et retards
- Recevoir les communications de l'école
- Accéder au cahier de texte
- Consulter l'emploi du temps

ACCEPTER L'INVITATION :
${data.invitationUrl}

⏰ IMPORTANT : Cette invitation expire le ${expiryDate}.

Si vous n'êtes pas concerné(e) par cette invitation, vous pouvez ignorer cet email.

Cordialement,
L'équipe Yeko

© ${new Date().getFullYear()} Yeko - Plateforme de gestion scolaire
  `.trim()
}

// ==================== Email Verification Email ====================

interface VerificationEmailData {
  to: string
  name: string
  verificationUrl: string
  apiKey?: string
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(data: VerificationEmailData): Promise<EmailResult> {
  const subject = 'Vérification de votre email - Yeko'

  if (process.env.NODE_ENV === 'development') {
    console.warn('--- [DEVELOPMENT] EMAIL TO:', data.to, '---')
    console.warn('Subject:', subject)
    console.warn('Name:', data.name)
    console.warn('Verification URL:', data.verificationUrl)
    console.warn('-------------------------------------------')
    return { success: true, messageId: 'dev-mode-log' }
  }

  const resend = await getResendClient(data.apiKey)

  if (!resend) {
    return { success: false, error: getErrorMessage('serverError') }
  }

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Yeko <noreply@yeko.app>',
      to: data.to,
      subject,
      html: generateVerificationEmailHTML(data),
      text: generateVerificationEmailText(data),
    })

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true, messageId: result.data?.id }
  }
  catch (error) {
    console.error('Failed to send verification email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

function generateVerificationEmailHTML(data: VerificationEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .button { display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { opacity: 0.9; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; padding: 20px; background: #f9fafb; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Vérification Email</h1>
    </div>
    <div class="content">
      <h2>Bonjour ${data.name},</h2>
      <p>Merci de vous être inscrit sur la plateforme Yeko. Pour activer votre compte, veuillez vérifier votre adresse email.</p>

      <div style="text-align: center;">
        <a href="${data.verificationUrl}" class="button">Vérifier mon email</a>
      </div>

      <div class="warning">
        <p style="font-size: 12px; margin-bottom: 0;">Si le bouton ne fonctionne pas, copiez et collez cette URL dans votre navigateur :<br>
        <span style="word-break: break-all;">${data.verificationUrl}</span></p>
      </div>

      <p>Si vous n'avez pas créé de compte sur Yeko, vous pouvez ignorer cet email.</p>

      <p>Cordialement,<br><strong>L'équipe Yeko</strong></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Yeko - Plateforme de gestion scolaire</p>
      <p>Cet email contient des informations confidentielles.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

function generateVerificationEmailText(data: VerificationEmailData): string {
  return `
Vérification Email - Yeko

Bonjour ${data.name},

Merci de vous être inscrit sur la plateforme Yeko. Pour activer votre compte, veuillez vérifier votre adresse email.

VÉRIFIER MON EMAIL :
${data.verificationUrl}

Si vous n'avez pas créé de compte sur Yeko, vous pouvez ignorer cet email.

Cordialement,
L'équipe Yeko

© ${new Date().getFullYear()} Yeko - Plateforme de gestion scolaire
  `.trim()
}
