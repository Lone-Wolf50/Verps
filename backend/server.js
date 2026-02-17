const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware

app.use(express.json());
const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:5173",
	"https://verps-client.vercel.app",
];

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		methods: ["GET", "POST", "OPTIONS"],
		credentials: true,
	}),
);
// 1. Configure the Mail Transporter
// Ensure GMAIL_USER and GMAIL_PASS are set in your .env file
const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: process.env.GMAIL_USER,
		pass: process.env.GMAIL_PASS, // Use a Gmail App Password, not your regular password
	},
}); // Add this to your server.js
transporter.verify((error, success) => {
	if (error) {
		console.error("❌ Mail Server Config Error:", error.message);
	} else {
		console.log("✅ Mail Server is live and authorized!");
	}
});

// 2. The Logic Bridge: Notify Admin of New Entry
app.post("/api/notify-entry", async (req, res) => {
	// These names must match the body sent from your AddProduct.jsx handleSubmit function
	const { name, category, price, image_url } = req.body;

	const mailOptions = {
		from: `"VERP Vault System" <${process.env.GMAIL_USER}>`,
		to: process.env.ADMIN_EMAIL, // The email address where you want to receive alerts
		subject: `✨ New Masterpiece Registered: ${name}`,
		html: `
            <div style="background-color: #0a0a0a; color: #ffffff; padding: 40px; font-family: 'Helvetica', sans-serif; border: 1px solid #ec5b13; border-radius: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #ec5b13; font-style: italic; font-weight: 300; margin: 0;">Vault Asset Log</h1>
                    <p style="color: #666; font-size: 12px; text-transform: uppercase; tracking: 2px;">Automated Security Broadcast</p>
                </div>
                
                <p style="font-size: 16px; line-height: 1.6;">
                    A new asset has been successfully registered in the <strong style="color: #ec5b13;">${category}</strong> architecture.
                </p>
                
                <hr style="border: 0; border-top: 1px solid #222; margin: 30px 0;" />
                
                <div style="margin-bottom: 30px;">
                    <p style="margin: 5px 0;"><strong>Asset Name:</strong> ${name}</p>
                    <p style="margin: 5px 0;"><strong>Valuation:</strong> GH₵ ${price}</p>
                </div>

                ${
									image_url
										? `
                <div style="margin-top: 20px; text-align: center; background: #111; padding: 20px; border-radius: 15px;">
                    <img src="${image_url}" alt="Asset Thumbnail" style="width: 100%; max-width: 400px; border-radius: 10px; border: 1px solid #333;" />
                </div>
                `
										: `<p style="color: #444;">No media attached to this log.</p>`
								}

                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #222; text-align: center;">
                    <p style="color: #444; font-size: 11px;">
                        This transmission is encrypted and intended for the VERP Admin Terminal only. 
                        Verification ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </p>
                </div>
            </div>
        `,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log(`✅ Notification sent for: ${name}`);
		res.status(200).json({ success: true, message: "Security Broadcast Sent" });
	} catch (error) {
		console.error("❌ Mail Error:", error);
		res.status(500).json({ error: "Failed to send notification" });
	}
});

// 3. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`
    🚀 Vault Server active on port ${PORT}
    📡 Monitoring verp_products table...
    📧 Ready to broadcast to ${process.env.ADMIN_EMAIL}
    `);
});
