// Centralized API helper
export async function uploadPDFs(mode, files) {
  const form = new FormData();
  if (mode === "single") {
    form.append("pdfFile", files[0]);
  } else {
    files.forEach((f) => form.append("pdfFile", f));
  }

  const endpoint =
    mode === "single"
      ? "https://assignment-submission-surefinancial.onrender.com/api/v1/single"
      : "https://assignment-submission-surefinancial.onrender.com/api/v1/multiple";

  const res = await fetch(endpoint, {
    method: "POST",
    body: form,
  });

  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  return await res.json();
}
