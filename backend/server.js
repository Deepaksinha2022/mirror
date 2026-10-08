require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");
const {PDFParse} = require("pdf-parse");
const OpenAI = require("openai");

const db = require("./database");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/upload-report", upload.single("report"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No PDF uploaded."
            });
        }

        const userId = req.body.user_id || "test-user-001";

        const fileBuffer = fs.readFileSync(req.file.path);

        const fileHash = crypto
            .createHash("sha256")
            .update(fileBuffer)
            .digest("hex");

        const reportId = crypto.randomUUID();
        const uploadedAt = new Date().toISOString();

        db.prepare(`
            INSERT OR IGNORE INTO users (user_id, created_at)
            VALUES (?, ?)
        `).run(userId, uploadedAt);

        db.prepare(`
            INSERT INTO uploaded_reports (
                report_id,
                user_id,
                original_file_name,
                file_path,
                uploaded_at,
                processing_status
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            reportId,
            userId,
            req.file.originalname,
            req.file.path,
            uploadedAt,
            "uploaded"
        );

        const parser = new PDFParse({ data: fileBuffer });

        const pdfData = await parser.getText();

        const rawText = pdfData.text;

        await parser.destroy();

        db.prepare(`
            UPDATE uploaded_reports
            SET raw_extracted_text = ?,
                processed_at = ?,
                processing_status = ?
            WHERE report_id = ?
        `).run(
            rawText,
            new Date().toISOString(),
            "text_extracted",
            reportId
        );

        res.json({
            success: true,
            report_id: reportId,
            user_id: userId,
            file_name: req.file.originalname,
            uploaded_at: uploadedAt,
            page_count: pdfData.numpages,
            raw_text: rawText
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Report processing failed.",
            details: error.message
        });
    }
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.listen(PORT, () => {
    console.log(`Mirror backend running at http://localhost:${PORT}`);
});