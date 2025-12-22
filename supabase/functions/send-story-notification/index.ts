import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StoryNotificationRequest {
  title: string;
  content: string;
  category: string;
  authorName: string;
  socialMediaSuitable: boolean;
  creditsName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-story-notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, content, category, authorName, socialMediaSuitable, creditsName }: StoryNotificationRequest = await req.json();

    console.log("Sending notification for story:", title);

    const emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                📰 Stade News
              </h1>
              <p style="margin: 8px 0 0; color: #94a3b8; font-size: 14px;">
                Neue Story eingegangen
              </p>
            </td>
          </tr>
          
          <!-- Alert Badge -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center;">
                <span style="font-size: 20px; margin-right: 12px;">🔔</span>
                <span style="color: #92400e; font-weight: 600;">Neue Story wartet auf Prüfung!</span>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <!-- Category & Meta -->
              <div style="margin-bottom: 20px;">
                <span style="display: inline-block; background-color: #e0e7ff; color: #3730a3; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600;">
                  ${category}
                </span>
                ${socialMediaSuitable ? `
                <span style="display: inline-block; background-color: #d1fae5; color: #065f46; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-left: 8px;">
                  📱 Social Media geeignet
                </span>
                ` : ''}
              </div>
              
              <!-- Title -->
              <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 24px; font-weight: 700; line-height: 1.3;">
                ${title || 'Ohne Titel'}
              </h2>
              
              <!-- Story Preview -->
              <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <p style="margin: 0; color: #475569; font-size: 15px; line-height: 1.6;">
                  ${content.substring(0, 500)}${content.length > 500 ? '...' : ''}
                </p>
              </div>
              
              <!-- Author Info -->
              <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="width: 40px; vertical-align: top;">
                      <div style="width: 36px; height: 36px; background-color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span style="color: #ffffff; font-size: 16px;">👤</span>
                      </div>
                    </td>
                    <td style="padding-left: 12px;">
                      <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Verfasser</p>
                      <p style="margin: 4px 0 0; color: #1e293b; font-size: 15px; font-weight: 600;">${authorName}</p>
                      ${creditsName ? `<p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Credits: ${creditsName}</p>` : ''}
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA Button -->
              <a href="https://stade-news.lovable.app/admin" style="display: block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; text-align: center; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                Story im Admin-Panel prüfen →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #94a3b8; font-size: 13px;">
                Diese E-Mail wurde automatisch von Stade News gesendet.
              </p>
              <p style="margin: 8px 0 0; color: #94a3b8; font-size: 12px;">
                © ${new Date().getFullYear()} Stade News • Alle Rechte vorbehalten
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

    const { data, error } = await resend.emails.send({
      from: "Stade News <onboarding@resend.dev>",
      to: ["Stade.News@web.de"],
      subject: `📰 Neue Story: ${title || 'Ohne Titel'} - ${category}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-story-notification function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);