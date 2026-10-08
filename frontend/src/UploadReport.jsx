import { useState } from "react";

function UploadReport() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [report, setReport] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("report", file);
    formData.append("user_id", "test-user-001");

    setMessage("Uploading and processing...");
    setReport(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/upload-report",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setReport(data);
      setMessage("Report uploaded successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div>
      <h2>Upload Blood Test Report</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload}>
        Upload Report
      </button>

      <p>{message}</p>

      {report && (
        <div>
          <h3>Report Information</h3>

          <p>
            <strong>User ID:</strong> {report.user_id}
          </p>

          <p>
            <strong>Report ID:</strong> {report.report_id}
          </p>

          <p>
            <strong>File:</strong> {report.file_name}
          </p>

          <p>
            <strong>Uploaded:</strong> {report.uploaded_at}
          </p>

          <p>
            <strong>Pages:</strong> {report.page_count}
          </p>

          <h3>Extracted Text</h3>

          <pre>{report.raw_text}</pre>
        </div>
      )}
    </div>
  );
}

export default UploadReport;