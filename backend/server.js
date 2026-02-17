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
	"http://localhost:5000",
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
const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: process.env.GMAIL_USER,
		pass: process.env.GMAIL_PASS,
	},
});

transporter.verify((error, success) => {
	if (error) {
		console.error("❌ Mail Server Config Error:", error.message);
	} else {
		console.log("✅ Mail Server is live and authorized!");
	}
});

// 2. The Logic Bridge: Notify Admin of New Entry
app.post("/api/notify-order", async (req, res) => {
	const { orderNumber, customer, total, items } = req.body;

	const itemListHtml = items
		.map((item) => `<li>${item.name} (x${item.quantity}) - $${item.price}</li>`)
		.join("");

	const mailOptions = {
		from: `"VERP Order System" <${process.env.GMAIL_USER}>`,
		to: process.env.ADMIN_EMAIL,
		subject: `🚨 NEW ORDER: ${orderNumber}`,
		html: `
            <div style="background: #000; color: #fff; padding: 30px; border: 1px solid #ec5b13;">
                <h1>New Acquisition Request</h1>
                <p><strong>Customer:</strong> ${customer}</p>
                <p><strong>Total:</strong> $${total}</p>
                <ul>${itemListHtml}</ul>
                <p>Log in to the Admin Terminal to update status.</p>
            </div>
        `,
	};

	try {
		await transporter.sendMail(mailOptions);
		res.status(200).json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// 3. Root Route (Fixes "Cannot GET /")
app.get("/", (req, res) => {
	res.send("Vault Server is active and monitoring...");
});

// 4. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`🚀 Vault Server active on port ${PORT}`);
});

// CRITICAL FOR VERCEL: Export the app
module.exports = app;
