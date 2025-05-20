import nodemailer from "nodemailer";
import { MongoClient } from "mongodb";

export async function POST(req) {
  try {
    const { firstname, lastname, email, message } = await req.json();

    // Save to MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB);
    await db.collection("contactus").insertOne({
      firstname,
      lastname,
      email,
      message,
      createdAt: new Date(),
    });
    await client.close();

    // Configure your SMTP transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email to site owner
    const mailOptions = {
      from: email,
      to: process.env.EMAIL_TO,
      subject: `Contact Form Submission from ${firstname} ${lastname}`,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 30px;">
          <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 24px;">
            <h2 style="color: #0B1113; margin-bottom: 16px;">New Contact Form Submission</h2>
            <table style="width: 100%; font-size: 15px;">
              <tr>
                <td style="color: #555; font-weight: bold; padding: 8px 0;">Name:</td>
                <td style="color: #222; padding: 8px 0;">${firstname} ${lastname}</td>
              </tr>
              <tr>
                <td style="color: #555; font-weight: bold; padding: 8px 0;">Email:</td>
                <td style="color: #222; padding: 8px 0;">${email}</td>
              </tr>
              <tr>
                <td style="color: #555; font-weight: bold; padding: 8px 0; vertical-align: top;">Message:</td>
                <td style="color: #222; padding: 8px 0; white-space: pre-line;">${message}</td>
              </tr>
            </table>
            <div style="margin-top: 32px; color: #aaa; font-size: 13px; text-align: center;">
              Octotech Creations &middot; Contact Form Notification
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Auto-reply to user
    const autoReplyOptions = {
      from: 'no-reply@octotech-creations.vercel.app', // or your domain's no-reply address
      to: email,
      subject: "Thank you for contacting Octotech Creations",
      text: `Thank you for contacting us, ${firstname}!\n\nWe have received your message and will get back to you shortly.\n\nBest regards,\nOctotech Creations Team`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 30px;">
          <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 24px;">
            <h2 style="color: #0B1113; margin-bottom: 16px;">Thank You for Contacting Us!</h2>
            <p style="color: #222; font-size: 15px;">Dear <b>${firstname}</b>,</p>
            <p style="color: #222; font-size: 15px;">
              We have received your message and will get back to you shortly.<br>
              <br>
              <b>Your message:</b><br>
              <span style="color: #555; white-space: pre-line;">${message}</span>
            </p>
            <div style="margin-top: 32px; color: #aaa; font-size: 13px; text-align: center;">
              Octotech Creations Team
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(autoReplyOptions);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Failed to send email." }), { status: 500 });
  }
}