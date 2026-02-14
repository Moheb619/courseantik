# Certificate Implementation Guide

This document outlines the recommended approach for implementing a dynamic course completion certificate system in the application.

## 1. Architecture Overview

We will implement a **Client-Side Generation** strategy. This avoids server-side complexity and costs associated with PDF generation, leveraging the user's browser resources.

**Key Libraries:**

- **`html2canvas`**: To convert a DOM element (the certificate) into an image.
- **`jspdf`**: To place that image into a PDF document for download.

## 2. Certificate Template Design

### Format

The certificate should be built as a standard **React Component**.

- **Why?** It allows you to use standard Tailwind CSS for styling, making it easy to maintain and consistent with your design system.
- **Responsiveness:** The template should have a fixed width/height container (e.g., `800px x 600px` landscape) to ensure the PDF output is consistent regardless of the user's screen size.

### Proposed Component: `CertificateTemplate.jsx`

Create a new component at `src/features/certificates/components/CertificateTemplate.jsx`.

```jsx
import { forwardRef } from "react";
import logo from "@/assets/logo.png"; // Verify this path

const CertificateTemplate = forwardRef(
  ({ studentName, courseTitle, instructorName, date, certificateId }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[800px] h-[600px] bg-white p-10 relative overflow-hidden text-center border-[10px] border-double border-primary/20"
      >
        {/* Background Pattern or Watermark can go here */}

        <div className="h-full border-[2px] border-primary/10 p-8 flex flex-col items-center justify-center relative z-10">
          {/* Header */}
          <img src={logo} alt="Logo" className="h-16 mb-4" />
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">
            Certificate of Completion
          </h1>
          <p className="text-muted-foreground uppercase tracking-widest text-sm mb-10">
            This is to certify that
          </p>

          {/* Student Name */}
          <h2 className="text-5xl font-script text-foreground mb-6 border-b-2 border-primary/20 px-10 pb-2 inline-block min-w-[400px]">
            {studentName}
          </h2>

          {/* Course Details */}
          <p className="text-lg text-muted-foreground mb-2">
            Has successfully completed the course
          </p>
          <h3 className="text-3xl font-bold text-primary mb-12">
            {courseTitle}
          </h3>

          {/* Footer / Signatures */}
          <div className="w-full flex justify-between items-end mt-auto px-10">
            <div className="text-center">
              <p className="font-bold text-lg border-t pt-2 w-48 mx-auto">
                {date}
              </p>
              <p className="text-xs text-muted-foreground uppercase">Date</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2">
                {/* QR Code for verification could go here */}
              </div>
              <p className="text-[10px] text-muted-foreground">
                ID: {certificateId}
              </p>
            </div>

            <div className="text-center">
              <p className="font-script text-2xl mb-1">{instructorName}</p>
              <p className="font-bold text-lg border-t pt-2 w-48 mx-auto">
                Instructor
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default CertificateTemplate;
```

## 3. Implementation Logic

### Step A: Install Dependencies

```bash
npm install html2canvas jspdf
```

### Step B: The Download Handler

You can create a custom hook `useDownloadCertificate` or add this logic directly to your page.

```javascript
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef, useState } from "react";

// Usage inside a component
const certificateRef = useRef(null);
const [isGenerating, setIsGenerating] = useState(false);

const handleDownload = async () => {
  if (!certificateRef.current) return;
  setIsGenerating(true);

  try {
    // 1. Capture the element
    const canvas = await html2canvas(certificateRef.current, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Crucial for loading external images (like user avatars or logos)
      logging: false,
    });

    // 2. Convert to Data URL
    const imgData = canvas.toDataURL("image/png");

    // 3. Create PDF
    // 'l' = landscape, 'px', [width, height] matches the component/screen
    const pdf = new jsPDF("l", "px", [canvas.width, canvas.height]);

    // 4. Add Image to PDF (0, 0, width, height)
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

    // 5. Save
    pdf.save(`Certificate-${course.title}.pdf`);
  } catch (error) {
    console.error("Certificate generation failed:", error);
  } finally {
    setIsGenerating(false);
  }
};
```

## 4. Where to Place "Hidden" Component

To generate the certificate without showing it on the main UI, you can perform one of two strategies:

1.  **Off-screen Rendering (Recommended for simplicity)**: Render the `<CertificateTemplate>` inside a div that is positioned absolutely off-screen but still "visible" to the DOM so `html2canvas` can capture it.

```jsx
<div style={{ position: "absolute", left: "-9999px", top: 0 }}>
  <CertificateTemplate
    ref={certificateRef}
    studentName={user.name}
    courseTitle={course.title}
    // ...other props
  />
</div>
```

2.  **Modal Preview**: Often better for UX. Show a "Preview Certificate" modal. Inside the modal, the certificate is visible. The "Download" button on the modal captures the visible certificate.

## 5. Integrating Verification

To make certificates authentic:

1.  Generate a unique ID (UUID) when the user completes the course and save it to the database (`user_course_completions` table).
2.  Add this ID to the certificate functionality.
3.  Create a public route `/verify/:id` that checks the database and confirms validity.
4.  Add a QR Code to the certificate template that links to this verification URL.

## 6. Summary of Action Items

1.  **Create Component**: Build the `CertificateTemplate` with Tailwind.
2.  **Add Logic**: Implement the `html2canvas` + `jspdf` logic.
3.  **Update Course Page**: In `CourseDetailsPage.jsx` (or a completion view), add a "Download Certificate" button that is conditionally rendered based on `course_progress === 100`.
