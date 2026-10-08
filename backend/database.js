const Database = require("better-sqlite3");

const db = new Database("mirror.db");

db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS uploaded_reports (
    report_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    original_file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TEXT NOT NULL,
    processed_at TEXT,
    processing_status TEXT NOT NULL,
    raw_extracted_text TEXT,
    extraction_raw_output TEXT,
    extraction_model TEXT,
    extraction_prompt_version TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS report_parameters (
    parameter_id TEXT PRIMARY KEY,
    report_id TEXT NOT NULL,
    parameter_name TEXT NOT NULL,
    value TEXT,
    unit TEXT,
    reference_range TEXT,
    flag TEXT,
    extracted_text TEXT,
    page_number INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES uploaded_reports(report_id)
);
`);

module.exports = db;