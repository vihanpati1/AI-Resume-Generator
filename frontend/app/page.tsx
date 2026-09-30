"use client";

import React, { ChangeEvent, useState } from "react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  location: string;
  target_job: string;
  skills: string;
  education: string;
  experience: string;
  projects: string;
  certifications: string;
};

type ExperienceItem = {
  company?: string;
  role?: string;
  duration?: string;
  description?: string[];
};

type EducationItem = {
  institution?: string;
  degree?: string;
  duration?: string;
  details?: string[];
};

type ProjectItem = {
  name?: string;
  description?: string;
  technologies?: string[];
};

type CertificationItem = {
  name?: string;
  issuer?: string;
  year?: string;
};

type Resume = {
  summary?: string;
  skills?: string[];
  experience?: ExperienceItem[];
  education?: EducationItem[];
  projects?: ProjectItem[];
  certifications?: CertificationItem[];
  ats_keywords?: string[];
};

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  location: "",
  target_job: "",
  skills: "",
  education: "",
  experience: "",
  projects: "",
  certifications: "",
};

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);

  const [resume, setResume] = useState<Resume | null>(null);

  const [loading, setLoading] = useState(false);

  const [pdfLoading, setPdfLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // GENERATE RESUME
  // ==========================================

  const generateResume = async () => {
    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/generate-resume",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: form.name,

            email: form.email,

            phone: form.phone,

            location: form.location,

            target_job: form.target_job,

            skills: form.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),

            education: form.education
              ? [
                  {
                    details: [form.education],
                  },
                ]
              : [],

            experience: form.experience
              ? [
                  {
                    description: [form.experience],
                  },
                ]
              : [],

            projects: form.projects
              ? [
                  {
                    description: form.projects,
                  },
                ]
              : [],

            certifications: form.certifications
              ? [
                  {
                    name: form.certifications,
                  },
                ]
              : [],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      setResume(data.resume);
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to the backend. Make sure your FastAPI server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DOWNLOAD PDF
  // ==========================================

  const downloadPDF = async () => {
    const element = document.getElementById("resume-preview");

    if (!element) {
      setError("Resume preview not found.");
      return;
    }

    setPdfLoading(true);
    setError("");

    let container: HTMLDivElement | null = null;

    try {
      const html2pdfModule = await import("html2pdf.js");

      const html2pdf = (
        html2pdfModule.default ?? html2pdfModule
      ) as any;

      // --------------------------------------
      // Clone resume
      // --------------------------------------

      const clone = element.cloneNode(true) as HTMLElement;

      // --------------------------------------
      // Create export container
      // --------------------------------------

      container = document.createElement("div");

      container.style.position = "fixed";
      container.style.left = "-10000px";
      container.style.top = "0";
      container.style.width = "794px";
      container.style.backgroundColor = "#ffffff";
      container.style.zIndex = "-9999";

      // --------------------------------------
      // Force safe colors
      // --------------------------------------

      clone.style.backgroundColor = "#ffffff";
      clone.style.color = "#111827";

      const allElements = clone.querySelectorAll("*");

      allElements.forEach((element) => {
        const htmlElement = element as HTMLElement;

        htmlElement.style.setProperty(
          "color",
          "#374151",
          "important"
        );

        htmlElement.style.setProperty(
          "background-color",
          "transparent",
          "important"
        );

        htmlElement.style.setProperty(
          "border-color",
          "#d1d5db",
          "important"
        );
      });

      // Main resume background
      clone.style.setProperty(
        "background-color",
        "#ffffff",
        "important"
      );

      clone.style.setProperty(
        "color",
        "#111827",
        "important"
      );

      // --------------------------------------
      // Add clone to page
      // --------------------------------------

      container.appendChild(clone);

      document.body.appendChild(container);

      // --------------------------------------
      // Generate PDF
      // --------------------------------------

      await html2pdf()
        .from(clone)
        .set({
          margin: 0,

          filename: `${form.name || "resume"}-resume.pdf`,

          image: {
            type: "jpeg",
            quality: 0.98,
          },

          html2canvas: {
            scale: 2,

            useCORS: true,

            backgroundColor: "#ffffff",

            logging: false,
          },

          jsPDF: {
            unit: "mm",

            format: "a4",

            orientation: "portrait",
          },
        })
        .save();

    } catch (err) {
      console.error(err);

      setError(
        "Could not create the PDF. Please try again."
      );
    } finally {
      // --------------------------------------
      // Remove temporary clone
      // --------------------------------------

      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }

      setPdfLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="border-b border-slate-800 bg-slate-950">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>

            <h1 className="text-2xl font-bold tracking-tight">
              AI Resume Maker
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Create professional, ATS-friendly resumes with AI
            </p>

          </div>

          {resume && (
            <button
              onClick={downloadPDF}
              disabled={pdfLoading}
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pdfLoading
                ? "Creating PDF..."
                : "Download PDF"}
            </button>
          )}

        </div>

      </header>


      {/* ======================================
          MAIN
      ====================================== */}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[420px_1fr]">

        {/* ====================================
            LEFT FORM
        ==================================== */}

        <section className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6">

            <h2 className="text-lg font-semibold">
              Your Information
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Enter your information and let AI create your resume.
            </p>

          </div>


          <div className="space-y-5">

            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
            />


            <Input
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              type="email"
            />


            <Input
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
            />


            <Input
              label="Location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Mumbai, India"
            />


            <Input
              label="Target Job"
              name="target_job"
              value={form.target_job}
              onChange={handleChange}
              placeholder="AI/ML Engineer"
            />


            <Textarea
              label="Skills"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="Python, Git, Machine Learning, React"
            />


            <Textarea
              label="Education"
              name="education"
              value={form.education}
              onChange={handleChange}
              placeholder="Diploma in Computer Engineering, XYZ College"
            />


            <Textarea
              label="Experience"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="Describe your experience..."
            />


            <Textarea
              label="Projects"
              name="projects"
              value={form.projects}
              onChange={handleChange}
              placeholder="Describe your projects..."
            />


            <Textarea
              label="Certifications"
              name="certifications"
              value={form.certifications}
              onChange={handleChange}
              placeholder="Python certification, Google..."
            />


            {/* ERROR */}

            {error && (
              <div className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
                {error}
              </div>
            )}


            {/* GENERATE */}

            <button
              onClick={generateResume}
              disabled={loading}
              className="w-full rounded-xl bg-white py-3.5 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Generating Resume..."
                : "Generate Resume"}
            </button>

          </div>

        </section>


        {/* ====================================
            RIGHT PREVIEW
        ==================================== */}

        <section>

          <div className="mb-4 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold">
                Resume Preview
              </h2>

              <p className="text-sm text-slate-400">
                Your professional resume will appear here.
              </p>

            </div>


            {resume && (
              <button
                onClick={downloadPDF}
                disabled={pdfLoading}
                className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium transition hover:bg-slate-800 disabled:opacity-60"
              >
                {pdfLoading
                  ? "Exporting..."
                  : "Export PDF"}
              </button>
            )}

          </div>


          {/* ==================================
              EMPTY STATE
          ================================== */}

          {!resume ? (

            <div className="flex min-h-[800px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/50">

              <div className="max-w-sm text-center">

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-xl font-bold">
                  AI
                </div>

                <h3 className="text-lg font-semibold">
                  Your resume will appear here
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Fill in your information and click
                  Generate Resume to create your professional
                  resume.
                </p>

              </div>

            </div>

          ) : (

            /* ==================================
               RESUME
            ================================== */

            <div className="overflow-auto rounded-2xl bg-slate-700 p-4 sm:p-8">

              <div
                id="resume-preview"
                className="mx-auto min-h-[1123px] w-full max-w-[794px] bg-white p-10 text-[#111827] shadow-2xl sm:p-12"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#111827",
                }}
              >

                {/* ============================
                    HEADER
                ============================ */}

                <div
                  className="border-b-2 border-[#111827] pb-5"
                >

                  <h1
                    className="text-3xl font-bold tracking-tight"
                    style={{
                      color: "#111827",
                    }}
                  >
                    {form.name}
                  </h1>


                  {form.target_job && (
                    <p
                      className="mt-1 text-lg font-medium"
                      style={{
                        color: "#4b5563",
                      }}
                    >
                      {form.target_job}
                    </p>
                  )}


                  <div
                    className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm"
                    style={{
                      color: "#4b5563",
                    }}
                  >

                    {form.email && (
                      <span>{form.email}</span>
                    )}

                    {form.phone && (
                      <span>{form.phone}</span>
                    )}

                    {form.location && (
                      <span>{form.location}</span>
                    )}

                  </div>

                </div>


                {/* ============================
                    SUMMARY
                ============================ */}

                {resume.summary && (
                  <ResumeSection title="Professional Summary">

                    <p
                      className="text-sm leading-6"
                      style={{
                        color: "#374151",
                      }}
                    >
                      {resume.summary}
                    </p>

                  </ResumeSection>
                )}


                {/* ============================
                    SKILLS
                ============================ */}

                {resume.skills &&
                  resume.skills.length > 0 && (

                    <ResumeSection title="Skills">

                      <div
                        className="flex flex-wrap gap-x-2 gap-y-1 text-sm"
                        style={{
                          color: "#374151",
                        }}
                      >

                        {resume.skills.map(
                          (skill, index) => (
                            <span key={index}>

                              {skill}

                              {index <
                                resume.skills!.length - 1 &&
                                " •"}

                            </span>
                          )
                        )}

                      </div>

                    </ResumeSection>
                  )}


                {/* ============================
                    EXPERIENCE
                ============================ */}

                {resume.experience &&
                  resume.experience.length > 0 && (

                    <ResumeSection title="Experience">

                      <div className="space-y-5">

                        {resume.experience.map(
                          (item, index) => (

                            <div key={index}>

                              <div className="flex flex-wrap justify-between gap-2">

                                <div>

                                  <h3
                                    className="font-semibold"
                                    style={{
                                      color: "#111827",
                                    }}
                                  >
                                    {item.role ||
                                      "Experience"}
                                  </h3>

                                  {item.company && (
                                    <p
                                      className="text-sm"
                                      style={{
                                        color: "#4b5563",
                                      }}
                                    >
                                      {item.company}
                                    </p>
                                  )}

                                </div>


                                {item.duration && (
                                  <span
                                    className="text-sm"
                                    style={{
                                      color: "#6b7280",
                                    }}
                                  >
                                    {item.duration}
                                  </span>
                                )}

                              </div>


                              {item.description &&
                                item.description.length >
                                  0 && (

                                  <ul
                                    className="mt-2 list-disc space-y-1 pl-5 text-sm leading-5"
                                    style={{
                                      color: "#374151",
                                    }}
                                  >

                                    {item.description.map(
                                      (
                                        description,
                                        descriptionIndex
                                      ) => (

                                        <li
                                          key={
                                            descriptionIndex
                                          }
                                        >
                                          {description}
                                        </li>

                                      )
                                    )}

                                  </ul>
                                )}

                            </div>

                          )
                        )}

                      </div>

                    </ResumeSection>
                  )}


                {/* ============================
                    EDUCATION
                ============================ */}

                {resume.education &&
                  resume.education.length > 0 && (

                    <ResumeSection title="Education">

                      <div className="space-y-4">

                        {resume.education.map(
                          (item, index) => (

                            <div key={index}>

                              <div className="flex flex-wrap justify-between gap-2">

                                <div>

                                  <h3
                                    className="font-semibold"
                                    style={{
                                      color: "#111827",
                                    }}
                                  >
                                    {item.degree ||
                                      "Education"}
                                  </h3>

                                  {item.institution && (
                                    <p
                                      className="text-sm"
                                      style={{
                                        color: "#4b5563",
                                      }}
                                    >
                                      {item.institution}
                                    </p>
                                  )}

                                </div>


                                {item.duration && (
                                  <span
                                    className="text-sm"
                                    style={{
                                      color: "#6b7280",
                                    }}
                                  >
                                    {item.duration}
                                  </span>
                                )}

                              </div>


                              {item.details &&
                                item.details.length >
                                  0 && (

                                  <ul
                                    className="mt-2 list-disc pl-5 text-sm"
                                    style={{
                                      color: "#374151",
                                    }}
                                  >

                                    {item.details.map(
                                      (
                                        detail,
                                        detailIndex
                                      ) => (

                                        <li
                                          key={detailIndex}
                                        >
                                          {detail}
                                        </li>

                                      )
                                    )}

                                  </ul>
                                )}

                            </div>

                          )
                        )}

                      </div>

                    </ResumeSection>
                  )}


                {/* ============================
                    PROJECTS
                ============================ */}

                {resume.projects &&
                  resume.projects.length > 0 && (

                    <ResumeSection title="Projects">

                      <div className="space-y-4">

                        {resume.projects.map(
                          (project, index) => (

                            <div key={index}>

                              <h3
                                className="font-semibold"
                                style={{
                                  color: "#111827",
                                }}
                              >
                                {project.name ||
                                  "Project"}
                              </h3>


                              {project.description && (
                                <p
                                  className="mt-1 text-sm leading-5"
                                  style={{
                                    color: "#374151",
                                  }}
                                >
                                  {project.description}
                                </p>
                              )}


                              {project.technologies &&
                                project.technologies.length >
                                  0 && (

                                  <p
                                    className="mt-1 text-xs font-medium"
                                    style={{
                                      color: "#6b7280",
                                    }}
                                  >
                                    Technologies:{" "}
                                    {project.technologies.join(
                                      ", "
                                    )}
                                  </p>
                                )}

                            </div>

                          )
                        )}

                      </div>

                    </ResumeSection>
                  )}


                {/* ============================
                    CERTIFICATIONS
                ============================ */}

                {resume.certifications &&
                  resume.certifications.length > 0 && (

                    <ResumeSection title="Certifications">

                      <div
                        className="space-y-2 text-sm"
                        style={{
                          color: "#374151",
                        }}
                      >

                        {resume.certifications.map(
                          (cert, index) => (

                            <div key={index}>

                              <span
                                className="font-semibold"
                                style={{
                                  color: "#111827",
                                }}
                              >
                                {cert.name}
                              </span>

                              {cert.issuer && (
                                <span>
                                  {" "}
                                  — {cert.issuer}
                                </span>
                              )}

                              {cert.year && (
                                <span>
                                  {" "}
                                  ({cert.year})
                                </span>
                              )}

                            </div>

                          )
                        )}

                      </div>

                    </ResumeSection>
                  )}


                {/* ============================
                    ATS KEYWORDS
                ============================ */}

                {resume.ats_keywords &&
                  resume.ats_keywords.length > 0 && (

                    <div
                      className="mt-8 border-t pt-3"
                      style={{
                        borderColor: "#e5e7eb",
                      }}
                    >

                      <p
                        className="text-[10px]"
                        style={{
                          color: "#9ca3af",
                        }}
                      >
                        ATS Keywords:{" "}
                        {resume.ats_keywords.join(", ")}
                      </p>

                    </div>
                  )}

              </div>

            </div>
          )}

        </section>

      </div>

    </main>
  );
}


/* ==========================================
   INPUT COMPONENT
========================================== */

type InputProps = {
  label: string;

  name: keyof FormState;

  value: string;

  placeholder: string;

  onChange: (
    e: ChangeEvent<HTMLInputElement>
  ) => void;

  type?: string;
};

function Input({
  label,
  name,
  value,
  placeholder,
  onChange,
  type = "text",
}: InputProps) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-400"
      />

    </div>
  );
}


/* ==========================================
   TEXTAREA COMPONENT
========================================== */

type TextareaProps = {
  label: string;

  name: keyof FormState;

  value: string;

  placeholder: string;

  onChange: (
    e: ChangeEvent<HTMLTextAreaElement>
  ) => void;
};

function Textarea({
  label,
  name,
  value,
  placeholder,
  onChange,
}: TextareaProps) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-slate-400"
      />

    </div>
  );
}


/* ==========================================
   RESUME SECTION
========================================== */

function ResumeSection({
  title,
  children,
}: {
  title: string;

  children: React.ReactNode;
}) {
  return (
    <section className="mt-7">

      <h2
        className="mb-3 border-b pb-1.5 text-sm font-bold uppercase tracking-wider"
        style={{
          color: "#111827",
          borderColor: "#d1d5db",
        }}
      >
        {title}
      </h2>

      {children}

    </section>
  );
}