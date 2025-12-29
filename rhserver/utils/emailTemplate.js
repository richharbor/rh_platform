function generatePartnerInvitationEmail({ franchiseName, roles, onboardingUrl }) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fa; padding: 20px; font-family: Arial, sans-serif;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          
          <!-- Header -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome to ${franchiseName}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; color: #333;">
              <h2 style="margin: 0 0 20px 0; color: #1a202c; font-size: 20px; font-weight: 600;">Hello,</h2>
              
              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                We're pleased to invite you to join <strong style="color: #1e40af;">${franchiseName}</strong> as an official <strong>Partner</strong>.
              </p>
              
              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                ${franchiseName} is India's <strong>most trusted and tech-driven platform</strong> for <strong>Private Investments</strong>, connecting brokers, wealth management and investment firms with exclusive opportunities.
              </p>
              
              <!-- Benefits Section -->
              <p style="margin: 24px 0 12px 0; color: #2d3748; font-size: 16px; font-weight: 600;">
                As our partner, you gain access to:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                      • Verified & high-value unlisted opportunities
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                      • Seamless execution with complete confidentiality
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                      • Competitive quotes and faster settlements
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <p style="margin: 0; color: #4a5568; font-size: 15px; line-height: 1.6;">
                      • A platform built to expand your business beyond existing networks
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Role Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td style="background-color: #f0f9ff; border-left: 4px solid #1e40af; padding: 16px 20px; border-radius: 4px;">
                    <p style="margin: 0 0 8px 0; color: #2d3748; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Assigned Role</p>
                    <p style="margin: 0; color: #1e40af; font-size: 18px; font-weight: 600;">${roles}</p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 24px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Click below to begin your onboarding and activate your partner account:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${onboardingUrl}" target="_blank" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(30, 64, 175, 0.4);">
                      Activate Partner Account
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 32px 0 0 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                We look forward to growing together and unlocking new possibilities in India's private market ecosystem.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f7fafc; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #2d3748; font-size: 16px; font-weight: 600;">Warm regards,</p>
              <p style="margin: 0 0 16px 0; color: #1e40af; font-size: 16px; font-weight: 600;">Team ${franchiseName}</p>
              <p style="margin: 0 0 8px 0; color: #718096; font-size: 14px; font-style: italic;">India's Trusted Marketplace for Private Investments</p>
              <p style="margin: 0;">
                <a href="https://www.richharbor.com" target="_blank" style="color: #1e40af; text-decoration: none; font-size: 14px; font-weight: 500;">🌐 www.richharbor.com</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
  `;
}

function franchiseInvitationEmail({ firstName, franchiseName, plainPassword, onboardingUrl }) {
  return `
        <!-- Invitation email (table-based, email-friendly) -->
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Franchise Invitation</title>
        <style>
          /* Basic mobile-friendly rules (some clients ignore head styles; important styles are inline below) */
          @media only screen and (max-width:600px) {
            .container { width:100% !important; padding:16px !important; }
            .stack { display:block !important; width:100% !important; }
            .logo { width:120px !important; height:auto !important; }
            .content { font-size:16px !important; }
          }
          /* Hide preheader text visually in clients that support it */
          .preheader { display:none !important; visibility:hidden; mso-hide:all; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; }
        </style>
      </head>
      <body style="margin:0; padding:0; background-color:#f3f4f6; font-family: -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

        <!-- Preheader (hidden) -->
        <span class="preheader">You're invited to manage the franchise. Complete your setup — link expires in 7 days.</span>

        <!-- Full-width wrapper -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f3f4f6;">
          <tr>
            <td align="center" style="padding:24px;">
              <!-- Container -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="max-width:600px; width:100%; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="padding:20px 24px; text-align:left; background-color:#111827;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="left" style="vertical-align:middle;">
                          <!-- Replace src with your logo URL -->
                          <img src="https://via.placeholder.com/160x40?text=Your+Logo" alt="Company logo" width="160" style="display:block; border:0; outline:none; text-decoration:none;" class="logo">
                        </td>
                        <td align="right" style="vertical-align:middle; color:#ffffff; font-size:14px;">
                          <span style="opacity:0.9;">Invitation</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Hero / Intro -->
                <tr>
                  <td style="padding:28px 24px 8px;">
                    <h2 style="margin:0 0 8px 0; font-size:22px; color:#111827; font-weight:700;">
                      You're invited to join as a Franchise Admin
                    </h2>
                    <p style="margin:0; color:#374151; font-size:15px; line-height:1.5;" class="content">
                      Hello <strong>${firstName}</strong>,
                    </p>
                  </td>
                </tr>

                <!-- Body content -->
                <tr>
                  <td style="padding:12px 24px 20px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="color:#374151; font-size:15px; line-height:1.5; padding-bottom:12px;">
                          You have been invited to manage the franchise:
                          <div style="margin-top:8px; margin-bottom:12px; display:inline-block; padding:10px 14px; background-color:#f8fafc; border-radius:6px; border:1px solid #e6eef8; font-weight:600; color:#0f172a;">
                            ${franchiseName}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td style="color:#374151; font-size:15px; line-height:1.5; padding-bottom:12px;">
                          For your initial sign-in, use the temporary password below:
                          <div style="margin-top:8px; margin-bottom:12px; display:inline-block; padding:10px 14px; background-color:#111827; color:#ffffff; border-radius:6px; font-family:monospace; font-weight:600;">
                            ${plainPassword}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding:0 0 18px;">
                          <!-- CTA button -->
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="left">
                            <tr>
                              <td align="center">
                                <a href="${onboardingUrl}" target="_blank"
                                  style="display:inline-block; text-decoration:none; padding:12px 22px; border-radius:8px; font-weight:600; font-size:15px; background-color:#2563eb; color:#ffffff; border:1px solid #2563eb;">
                                  Accept Invitation
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td style="color:#6b7280; font-size:13px; line-height:1.4;">
                          This link will expire in <strong>7 days</strong>. If the button doesn't work, copy and paste the following URL into your browser:
                          <div style="word-break:break-all; margin-top:8px; padding:10px; background:#f8fafc; border-radius:6px; border:1px solid #e6eef8;">
                            <a href="${onboardingUrl}" target="_blank" style="color:#2563eb; text-decoration:underline;">${onboardingUrl}</a>
                          </div>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>

                <!-- Helpful tips / footer -->
                <tr>
                  <td style="padding:0 24px 20px; color:#374151; font-size:14px; line-height:1.5;">
                    <p style="margin:0 0 8px 0;">
                      Need help? Reply to this email or contact your account admin.
                    </p>
                    <p style="margin:0; color:#6b7280; font-size:13px;">
                      For security, you'll be prompted to change your temporary password after first login.
                    </p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding:0 24px;">
                    <hr style="border:none; border-top:1px solid #e6edf3; margin:0;">
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:14px 24px; background-color:#fff; color:#6b7280; font-size:13px;">
                    <table role="presentation" width="100%">
                      <tr>
                        <td align="left">
                          <div style="font-weight:600; color:#111827; margin-bottom:4px;">Your Company Name</div>
                          <div>123 Business Rd, City • Country</div>
                        </td>
                        <td align="right" style="vertical-align:middle;">
                          <a href="#" style="text-decoration:none; color:#6b7280; font-size:13px;">Help</a>
                          <span style="margin:0 6px; color:#d1d5db;">•</span>
                          <a href="#" style="text-decoration:none; color:#6b7280; font-size:13px;">Privacy</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
              <!-- End container -->
            </td>
          </tr>
        </table>

      </body>
      </html>
  `
}

module.exports = { generatePartnerInvitationEmail, franchiseInvitationEmail };