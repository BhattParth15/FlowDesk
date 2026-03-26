const FRONTEND_URL = process.env.FRONTEND_URL;

const Email_Template = (userName, customBody, action = null, projectName) => {
    const year = new Date().getFullYear();

    // Construct the full URL if an action link is provided
    const actionUrl = action?.link ? `${FRONTEND_URL}${action.link}` : null;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @media only screen and (max-width: 620px) {
                .container { width: 100% !important; padding: 20px !important; }
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f4f7fa">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table class="container" width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e1e4e8; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
                        
                        <tr><td height="6" bgcolor="#2563eb"></td></tr>

                        <tr>
                            <td style="padding: 40px 35px;">
                                <h2 style="color: #1a1a1a; font-size: 22px; font-weight: 700; margin: 0 0 20px 0;">
                                    Hello ${userName},
                                </h2>
                                
                                <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                                    Hope you are doing well on your end.
                                </p>

                                <div style="color: #333333; font-size: 16px; line-height: 1.7; margin-bottom: 30px; border-left: 4px solid #2563eb; padding-left: 20px; font-style: italic;">
                                    ${customBody}
                                </div>

                                ${actionUrl ? `
                                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
                                     <tr>
                                        <td align="center" bgcolor="#2563eb" style="border-radius: 8px;">
                                            <a href="${actionUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; font-family: sans-serif; text-decoration: none; color: #ffffff; border-radius: 8px;">
                                            <span style="display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; opacity: 0.9;">
                                                ${action.type || 'Notification'}
                                            </span>
                                            <span style="display: block; font-size: 15px; font-weight: 500;">
                                                ${action.label}
                                            </span>
                                            </a>
                                        </td>
                                    </tr>
                                    </table>
                                ` : ''}
                                <p style="color: #4a4a4a; font-size: 16px; margin-top: 30px;">
                                    If you have any query feel free to contact our team.
                                </p>

                                <div style="margin-top: 40px; border-top: 1px solid #eeeeee; padding-top: 20px;">
                                    <p style="margin: 0; font-weight: 700; color: #1a1a1a; font-size: 16px;">Regards,</p>
                                    <p style="margin: 5px 0 0 0; color: #2563eb; font-weight: 600; font-size: 16px;">${projectName} Team</p>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 20px 35px; background-color: #fcfcfc; text-align: center; border-top: 1px solid #eeeeee;">
                                <p style="color: #999999; font-size: 12px; margin: 0;">
                                    &copy; ${year} ${projectName}. This is an automated system message.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

module.exports = Email_Template;