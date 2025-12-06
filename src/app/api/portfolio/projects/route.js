import clientPromise from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";
import { createNotification } from "@/lib/db-notifications";

// Email notification function
async function sendProjectStatusEmail(artistData, project, statusChange) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const getStatusColor = (status) => {
      switch (status) {
        case "In Progress": return "#2196f3";
        case "Completed": return "#4caf50";
        case "Planning": return "#ff9800";
        case "On Hold": return "#9c27b0";
        case "Cancelled": return "#f44336";
        default: return "#757575";
      }
    };

    const getStatusMessage = (status) => {
      switch (status) {
        case "In Progress": return "Your project has been started and is now in progress!";
        case "Completed": return "Great news! Your project has been completed successfully!";
        case "Planning": return "Your project is in the planning phase. We'll keep you updated on progress.";
        case "On Hold": return "Your project has been temporarily put on hold. We'll resume work soon.";
        case "Cancelled": return "Your project has been cancelled. Please contact us if you have any questions.";
        default: return "Your project status has been updated.";
      }
    };

    // Email to client
    const clientMailOptions = {
      from: process.env.EMAIL_USER,
      to: project.clientEmail,
      subject: `Project Update: ${project.title} - ${project.status}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 32px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #00a1e0; margin-bottom: 8px;">Project Status Update</h1>
              <div style="width: 60px; height: 4px; background: #00a1e0; margin: 0 auto;"></div>
            </div>
            
            <div style="background: #f9f9f9; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #333; margin-bottom: 16px;">Hello ${project.clientName}!</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                ${getStatusMessage(project.status)}
              </p>
              
              <div style="background: #fff; border-radius: 6px; padding: 20px; border-left: 4px solid ${getStatusColor(project.status)};">
                <table style="width: 100%; font-size: 15px;">
                  <tr>
                    <td style="color: #555; font-weight: bold; padding: 8px 0; width: 30%;">Project:</td>
                    <td style="color: #222; padding: 8px 0;">${project.title}</td>
                  </tr>
                  <tr>
                    <td style="color: #555; font-weight: bold; padding: 8px 0;">Status:</td>
                    <td style="color: ${getStatusColor(project.status)}; padding: 8px 0; font-weight: bold;">${project.status}</td>
                  </tr>
                  <tr>
                    <td style="color: #555; font-weight: bold; padding: 8px 0;">Artist:</td>
                    <td style="color: #222; padding: 8px 0;">${artistData.username}</td>
                  </tr>
                  <tr>
                    <td style="color: #555; font-weight: bold; padding: 8px 0;">Start Date:</td>
                    <td style="color: #222; padding: 8px 0;">${new Date(project.startDate).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="color: #555; font-weight: bold; padding: 8px 0;">Expected Completion:</td>
                    <td style="color: #222; padding: 8px 0;">${new Date(project.endDate).toLocaleDateString()}</td>
                  </tr>
                  ${project.description ? `
                  <tr>
                    <td style="color: #555; font-weight: bold; padding: 8px 0; vertical-align: top;">Description:</td>
                    <td style="color: #222; padding: 8px 0; line-height: 1.5;">${project.description}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
            </div>

            ${project.status === 'Completed' ? `
            <div style="background: #e8f5e8; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <h3 style="color: #2e7d32; margin-bottom: 12px;">🎉 Project Completed!</h3>
              <p style="color: #2e7d32; margin-bottom: 16px;">
                We'd love to hear about your experience! Your feedback helps us improve our services.
              </p>
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/feedback/${artistData.artistid}?project=${encodeURIComponent(project.title)}" 
                 style="display: inline-block; background: #4caf50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Leave Feedback & Review
              </a>
            </div>
            ` : ''}

            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px; margin-bottom: 8px;">
                Need to get in touch? Reply to this email or contact us directly.
              </p>
              <p style="color: #00a1e0; font-weight: bold; margin: 0;">
                Octotech Creations Team
              </p>
            </div>
          </div>
        </div>
      `,
    };

    // Email to artist (notification copy)
    const artistMailOptions = {
      from: process.env.EMAIL_USER,
      to: artistData.email,
      subject: `Project Status Updated: ${project.title} - ${project.status}`,
      html: `
        <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 30px;">
          <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 24px;">
            <h2 style="color: #00a1e0; margin-bottom: 16px;">Project Status Updated</h2>
            <p style="color: #333; font-size: 15px; margin-bottom: 20px;">
              You have successfully updated the status of project "<strong>${project.title}</strong>" to <strong style="color: ${getStatusColor(project.status)};">${project.status}</strong>.
            </p>
            <p style="color: #333; font-size: 15px; margin-bottom: 20px;">
              Client <strong>${project.clientName}</strong> (${project.clientEmail}) has been notified of this update.
            </p>
            ${project.status === 'Completed' ? `
            <div style="background: #e8f5e8; border-radius: 6px; padding: 16px; margin-top: 20px;">
              <p style="color: #2e7d32; margin: 0; font-size: 14px;">
                💡 <strong>Tip:</strong> Your client has been sent a feedback form link. Encourage them to leave a review to boost your ratings!
              </p>
            </div>
            ` : ''}
            <div style="margin-top: 32px; color: #aaa; font-size: 13px; text-align: center;">
              Octotech Creations - Artist Dashboard
            </div>
          </div>
        </div>
      `,
    };

    // Send emails
    if (project.clientEmail) {
      await transporter.sendMail(clientMailOptions);
    }
    
    if (artistData.email) {
      await transporter.sendMail(artistMailOptions);
    }

    console.log(`Status update emails sent for project: ${project.title}`);
  } catch (error) {
    console.error('Error sending project status email:', error);
    // Don't throw error - email failure shouldn't break project update
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const portfolio = await db.collection("portfolios").findOne({ 
      artistId: session.user.artistid 
    });

    if (!portfolio || !portfolio.projects) {
      return Response.json({ 
        projects: []
      });
    }

    return Response.json({ projects: portfolio.projects });
  } catch (err) {
    return Response.json({ error: "Failed to fetch projects data." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Get current projects to compare status changes
    const currentPortfolio = await db.collection("portfolios").findOne({ 
      artistId: session.user.artistid 
    });
    const currentProjects = currentPortfolio?.projects || [];
    
    // Get artist data for email notifications
    const artistData = await db.collection("artists").findOne({ 
      artistid: session.user.artistid 
    });

    // Check for status changes and send emails
    for (const newProject of data.projects) {
      const existingProject = currentProjects.find(p => 
        p.title === newProject.title && p.clientEmail === newProject.clientEmail
      );
      
      // Check if status changed and client email exists
      if (existingProject && 
          existingProject.status !== newProject.status && 
          newProject.clientEmail &&
          artistData) {
        
        // Send email notification for status change
        await sendProjectStatusEmail(artistData, newProject, {
          from: existingProject.status,
          to: newProject.status
        });
      }
      // If it's a new project with "In Progress" or "Completed" status
      else if (!existingProject && 
               newProject.clientEmail && 
               artistData &&
               (newProject.status === "In Progress" || newProject.status === "Completed")) {
        
        await sendProjectStatusEmail(artistData, newProject, {
          from: null,
          to: newProject.status
        });
      }
    }
    
    // Update the portfolio with new projects
    const result = await db.collection("portfolios").updateOne(
      { artistId: session.user.artistid },
      { 
        $set: { 
          projects: data.projects,
          updatedAt: new Date()
        },
        $setOnInsert: { 
          artistId: session.user.artistid,
          createdAt: new Date() 
        }
      },
      { upsert: true }
    );

    // Notify Admin
    await createNotification({
      type: 'success',
      message: `Artist ${session.user.name || session.user.username || 'Unknown'} updated their portfolio projects.`,
      recipient: 'admin',
      relatedId: session.user.artistid,
      link: `/portfolio/${session.user.artistid}`
    });

    return Response.json({ 
      message: "Projects saved successfully! Email notifications sent to clients.",
      success: true 
    });
  } catch (err) {
    console.error("Error saving projects:", err);
    return Response.json({ error: "Failed to save projects data." }, { status: 500 });
  }
}
