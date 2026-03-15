import express from 'express';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const contactRoute = express.Router();

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

contactRoute.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Simple validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    console.log('Processing contact from:', email);
    console.log('Sending to:', process.env.TO_EMAIL);

    // Send email using Resend - Use verified sender, not user's email
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev', // Must be verified
      to: [process.env.TO_EMAIL], // krishbhandari013@gmail.com
      subject: `New Contact Form: ${subject} from ${name}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Reply to: ${email}</em></p>
      `,
      replyTo: email // This allows you to reply directly to the user
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send email: ' + error.message 
      });
    }

    console.log('Email sent successfully:', data);

    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

export default contactRoute;