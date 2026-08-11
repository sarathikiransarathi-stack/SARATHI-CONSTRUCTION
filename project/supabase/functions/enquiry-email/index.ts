import { createClient } from "npm:@supabase/supabase-js@2";
import { SmtpClient } from "npm:smtp@0.1.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const COMPANY_EMAIL = "sarathiassociate123@gmail.com";

interface EnquiryPayload {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  location?: string;
  budget?: string;
  preferredStartDate?: string;
  message: string;
}

function escapeHtml(s: string): string {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function companyEmailHtml(e: EnquiryPayload): string {
  return `
  <div style="font-family: Arial, sans-serif; color:#1a1a1a; max-width:600px; margin:auto;">
    <div style="background:#0a0a0a; color:#c8a04d; padding:24px; text-align:center;">
      <h1 style="margin:0; font-size:22px; letter-spacing:2px;">SARATHI CONSTRUCTION</h1>
      <p style="margin:4px 0 0; color:#e5e5e5; font-size:12px; letter-spacing:1px;">NEW PROJECT ENQUIRY</p>
    </div>
    <table style="width:100%; border-collapse:collapse; margin-top:24px;">
      <tr><td style="padding:10px 12px; color:#666; width:40%; font-weight:bold;">Full Name</td><td style="padding:10px 12px;">${escapeHtml(e.name)}</td></tr>
      <tr><td style="padding:10px 12px; color:#666; font-weight:bold;">Email</td><td style="padding:10px 12px;">${escapeHtml(e.email)}</td></tr>
      <tr><td style="padding:10px 12px; color:#666; font-weight:bold;">Phone</td><td style="padding:10px 12px;">${escapeHtml(e.phone)}</td></tr>
      <tr><td style="padding:10px 12px; color:#666; font-weight:bold;">Project Type</td><td style="padding:10px 12px;">${escapeHtml(e.projectType)}</td></tr>
      <tr><td style="padding:10px 12px; color:#666; font-weight:bold;">Location</td><td style="padding:10px 12px;">${escapeHtml(e.location || "—")}</td></tr>
      <tr><td style="padding:10px 12px; color:#666; font-weight:bold;">Estimated Budget</td><td style="padding:10px 12px;">${escapeHtml(e.budget || "—")}</td></tr>
      <tr><td style="padding:10px 12px; color:#666; font-weight:bold;">Preferred Start Date</td><td style="padding:10px 12px;">${escapeHtml(e.preferredStartDate || "—")}</td></tr>
      <tr><td style="padding:10px 12px; color:#666; font-weight:bold;">Message</td><td style="padding:10px 12px;">${escapeHtml(e.message)}</td></tr>
    </table>
    <p style="margin-top:24px; font-size:12px; color:#999;">This enquiry was submitted via the Sarathi Construction website contact form.</p>
  </div>`;
}

function customerEmailHtml(e: EnquiryPayload): string {
  return `
  <div style="font-family: Arial, sans-serif; color:#1a1a1a; max-width:600px; margin:auto;">
    <div style="background:#0a0a0a; color:#c8a04d; padding:24px; text-align:center;">
      <h1 style="margin:0; font-size:22px; letter-spacing:2px;">SARATHI CONSTRUCTION</h1>
      <p style="margin:4px 0 0; color:#e5e5e5; font-size:12px; letter-spacing:1px;">THANK YOU FOR CONTACTING US</p>
    </div>
    <p style="margin-top:24px;">Dear ${escapeHtml(e.name)},</p>
    <p>Thank you for reaching out to Sarathi Construction. We have received your enquiry and our team will get back to you shortly.</p>
    <p>Here is a summary of your request:</p>
    <table style="width:100%; border-collapse:collapse; margin-top:12px;">
      <tr><td style="padding:10px 12px; color:#666; width:40%; font-weight:bold;">Project Type</td><td style="padding:10px 12px;">${escapeHtml(e.projectType)}</td></tr>
      <tr><td style="padding:10px 12px; color:#666; font-weight:bold;">Location</td><td style="padding:10px 12px;">${escapeHtml(e.location || "—")}</td></tr>
      <tr><td style="padding:10px 12px; color:#666; font-weight:bold;">Preferred Start Date</td><td style="padding:10px 12px;">${escapeHtml(e.preferredStartDate || "—")}</td></tr>
    </table>
    <p style="margin-top:24px;">Warm regards,<br/><strong>Sarathi Construction</strong><br/>${COMPANY_EMAIL}</p>
    <p style="margin-top:24px; font-size:12px; color:#999;">Please do not reply to this automated email.</p>
  </div>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const user = Deno.env.get("EMAIL_USER");
  const pass = Deno.env.get("EMAIL_PASS");
  if (!user || !pass) {
    throw new Error("Email credentials not configured on the server.");
  }
  const client = new SmtpClient();
  await client.connectTLS({
    hostname: "smtp.gmail.com",
    port: 465,
    username: user,
    password: pass,
  });
  await client.send({
    from: `Sarathi Construction <${user}>`,
    to,
    subject,
    html,
    content: "text/html",
  });
  await client.close();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload = (await req.json()) as EnquiryPayload;

    if (!payload?.name || !payload?.email || !payload?.phone || !payload?.projectType || !payload?.message) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required enquiry fields." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid customer email address." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: insertError } = await supabase.from("enquiries").insert({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      project_type: payload.projectType,
      location: payload.location || null,
      budget: payload.budget || null,
      preferred_start_date: payload.preferredStartDate || null,
      message: payload.message,
      status: "New",
    });

    if (insertError) {
      return new Response(
        JSON.stringify({ success: false, message: "Could not save enquiry.", detail: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let emailStatus = "sent";
    try {
      await sendEmail(COMPANY_EMAIL, "New Project Enquiry — Sarathi Construction", companyEmailHtml(payload));
    } catch (err) {
      emailStatus = `company email failed: ${err.message}`;
    }
    try {
      await sendEmail(payload.email, "Thank You for Contacting Sarathi Construction", customerEmailHtml(payload));
    } catch (err) {
      emailStatus += ` | acknowledgement failed: ${err.message}`;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Thank you! Your enquiry has been submitted successfully. Our team will contact you soon.",
        email: emailStatus,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: "Server error.", detail: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
