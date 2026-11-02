import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function generateCV() {
  const pdfDoc = await PDFDocument.create();
  
  // Standard Letter size (612 x 792 points)
  // Page 1
  let page = pdfDoc.addPage([612, 792]);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  const fontBoldItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanBoldItalic);

  const margin = 40;
  const contentWidth = 612 - margin * 2; // 532 pt
  let y = 752;

  const checkPageBreak = (neededHeight) => {
    if (y - neededHeight < 40) {
      page = pdfDoc.addPage([612, 792]);
      y = 752;
    }
  };

  // Helper to draw horizontal line
  const drawSectionDivider = (text) => {
    checkPageBreak(35);
    y -= 12;
    page.drawText(text.toUpperCase(), {
      x: margin,
      y: y,
      size: 11,
      font: fontBold,
      color: rgb(0, 0, 0)
    });
    y -= 4;
    page.drawLine({
      start: { x: margin, y: y },
      end: { x: margin + contentWidth, y: y },
      thickness: 0.8,
      color: rgb(0, 0, 0)
    });
    y -= 12;
  };

  // Helper to draw wrapped paragraph
  const drawParagraph = (text, size = 9.5, lineSpacing = 12.5, font = fontRegular, indent = 0) => {
    const words = text.split(' ');
    let line = '';
    const maxWidth = contentWidth - indent;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + (line ? ' ' : '') + words[i];
      const width = font.widthOfTextAtSize(testLine, size);
      if (width > maxWidth && line.length > 0) {
        checkPageBreak(lineSpacing);
        page.drawText(line, {
          x: margin + indent,
          y: y,
          size: size,
          font: font,
          color: rgb(0.1, 0.1, 0.1)
        });
        y -= lineSpacing;
        line = words[i];
      } else {
        line = testLine;
      }
    }
    if (line) {
      checkPageBreak(lineSpacing);
      page.drawText(line, {
        x: margin + indent,
        y: y,
        size: size,
        font: font,
        color: rgb(0.1, 0.1, 0.1)
      });
      y -= lineSpacing;
    }
  };

  // Helper to draw bullet point
  const drawBullet = (boldPrefix, normalText) => {
    const indent = 14;
    const bulletSize = 9.5;
    const lineSpacing = 12.5;
    const fullText = (boldPrefix ? boldPrefix + ' ' : '') + normalText;
    const words = fullText.split(' ');
    let line = '';
    const maxWidth = contentWidth - indent;
    let isFirstLine = true;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + (line ? ' ' : '') + words[i];
      const width = fontRegular.widthOfTextAtSize(testLine, bulletSize);
      if (width > maxWidth && line.length > 0) {
        checkPageBreak(lineSpacing);
        if (isFirstLine) {
          page.drawText('•', { x: margin + 3, y: y, size: bulletSize, font: fontBold });
          isFirstLine = false;
        }
        page.drawText(line, {
          x: margin + indent,
          y: y,
          size: bulletSize,
          font: fontRegular,
          color: rgb(0.12, 0.12, 0.12)
        });
        y -= lineSpacing;
        line = words[i];
      } else {
        line = testLine;
      }
    }
    if (line) {
      checkPageBreak(lineSpacing);
      if (isFirstLine) {
        page.drawText('•', { x: margin + 3, y: y, size: bulletSize, font: fontBold });
      }
      page.drawText(line, {
        x: margin + indent,
        y: y,
        size: bulletSize,
        font: fontRegular,
        color: rgb(0.12, 0.12, 0.12)
      });
      y -= lineSpacing;
    }
    y -= 1.5;
  };

  // ==================== HEADER ====================
  const name = "HAILEMICHAEL TESFAYE MEKURIA";
  const nameSize = 17;
  const nameWidth = fontBold.widthOfTextAtSize(name, nameSize);
  page.drawText(name, {
    x: (612 - nameWidth) / 2,
    y: y,
    size: nameSize,
    font: fontBold,
    color: rgb(0, 0, 0)
  });
  y -= 15;

  const contactLine = "hailemichaeltesfsye@gmail.com | +251 988 565 673 | Addis Ababa, Ethiopia";
  const contactSize = 9.5;
  const contactWidth = fontRegular.widthOfTextAtSize(contactLine, contactSize);
  page.drawText(contactLine, {
    x: (612 - contactWidth) / 2,
    y: y,
    size: contactSize,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2)
  });
  y -= 13;

  const linksLine = "LinkedIn: linkedin.com/in/hailemichael-tesfaye-2b7114401 | GitHub: github.com/hailemichaeltesfsye-hue | Portfolio: hailemichael-portfolio-psi.vercel.app";
  const linksSize = 8.5;
  const linksWidth = fontRegular.widthOfTextAtSize(linksLine, linksSize);
  page.drawText(linksLine, {
    x: (612 - linksWidth) / 2,
    y: y,
    size: linksSize,
    font: fontRegular,
    color: rgb(0.05, 0.35, 0.65)
  });
  y -= 10;

  // ==================== PROFESSIONAL PROFILE ====================
  drawSectionDivider("Professional Profile");
  drawParagraph(
    "Certified Agentic AI Engineer and Full-Stack Developer specializing in multi-agent orchestration (LangGraph, FastMCP), spatial digital twins, and autonomous resilient systems. Proven track record leading campus AI initiatives, engineering edge computer vision workflows (Meta SAM 3.1), and integrating serverless GPU clusters (Modal, Baseten) with strict constitutional safety verification. Passionate about architecting low-latency, sovereign AI infrastructure for Global South urban resilience.",
    9.5,
    13
  );

  // ==================== EDUCATION ====================
  drawSectionDivider("Education");
  // Degree line
  page.drawText("Bachelor of Science in Information Technology", {
    x: margin,
    y: y,
    size: 10.5,
    font: fontBold
  });
  const dateEdu = "Oct 2022 – Aug 2026 (Expected)";
  const dateEduWidth = fontBold.widthOfTextAtSize(dateEdu, 10);
  page.drawText(dateEdu, {
    x: margin + contentWidth - dateEduWidth,
    y: y,
    size: 10,
    font: fontBold
  });
  y -= 12;

  page.drawText("Wollo University, Kombolcha Institute of Technology | Dessie, Ethiopia", {
    x: margin,
    y: y,
    size: 9.5,
    font: fontItalic,
    color: rgb(0.2, 0.2, 0.2)
  });
  y -= 13;

  drawParagraph(
    "Relevant coursework: Artificial Intelligence, Distributed Systems, Data Structures & Algorithms, Database Management Systems, Computer Networks & Security, Software Engineering, Critical Infrastructure Protection (CIP).",
    9,
    11.5,
    fontRegular
  );

  // ==================== WORK & LEADERSHIP EXPERIENCE ====================
  drawSectionDivider("Work & Leadership Experience");

  // Job 1
  page.drawText("Campus Lead & Technical Ambassador", { x: margin, y: y, size: 10.5, font: fontBold });
  const dateJob1 = "Jul 2026 – Present";
  page.drawText(dateJob1, { x: margin + contentWidth - fontBold.widthOfTextAtSize(dateJob1, 10), y: y, size: 10, font: fontBold });
  y -= 12;
  page.drawText("The Udara Project / NSK AI · Wollo University | Ethiopia", { x: margin, y: y, size: 9.5, font: fontItalic, color: rgb(0.2, 0.2, 0.2) });
  y -= 12;
  drawBullet("", "Spearheaded technical development programs empowering 150+ African campus students with hands-on Agentic AI and multi-agent cyclic DAG architectures using LangGraph.");
  drawBullet("", "Represented Wollo University in international technical lead selection, coordinating high-impact workshops bridging academic computer science with real-world agent orchestration.");
  drawBullet("", "Collaborated with global engineering teams across Zerra Build and NSK AI to validate hands-on agentic workflows and sovereign data isolation protocols.");

  // Job 2
  y -= 4;
  checkPageBreak(40);
  page.drawText("Full-Stack & Agentic AI Developer", { x: margin, y: y, size: 10.5, font: fontBold });
  const dateJob2 = "Jan 2025 – Present";
  page.drawText(dateJob2, { x: margin + contentWidth - fontBold.widthOfTextAtSize(dateJob2, 10), y: y, size: 10, font: fontBold });
  y -= 12;
  page.drawText("Independent Engineering & Global Hackathons | Addis Ababa, Ethiopia", { x: margin, y: y, size: 9.5, font: fontItalic, color: rgb(0.2, 0.2, 0.2) });
  y -= 12;
  drawBullet("", "Engineered full-stack reactive applications using React, TypeScript, Node.js, Express, and PostgreSQL/MySQL with sub-150ms roundtrip response times.");
  drawBullet("", "Architected client-side PII/PHI sanitizers stripping sensitive biometric, national ID, and telecom credentials before LLM dispatch, guaranteeing zero data egress.");
  drawBullet("", "Integrated Model Context Protocol (FastMCP) tool servers connecting autonomous agents with spatial sensors, physical actuators, and structured JSON schemas.");

  // ==================== PROJECTS ====================
  drawSectionDivider("Featured Engineering Projects");

  // Project 1: NEXUS
  page.drawText("NEXUS: The Living City – Autonomous Multi-Agent Digital Twin", { x: margin, y: y, size: 10.5, font: fontBold });
  const dateP1 = "Oct 2026 – Present";
  page.drawText(dateP1, { x: margin + contentWidth - fontBold.widthOfTextAtSize(dateP1, 9.5), y: y, size: 9.5, font: fontBold });
  y -= 12;
  page.drawText("Meta Global AI Developer Hackathon Submission | Track: Build for Your World", { x: margin, y: y, size: 9, font: fontItalic, color: rgb(0.05, 0.35, 0.65) });
  y -= 12;
  drawBullet("", "Architected an autonomous 11-agent cognitive digital twin for Addis Ababa crisis management using Meta Llama 3.3 70B arbitration and Meta SAM 3.1 drone computer vision.");
  drawBullet("", "Deployed distributed GPU inference pipelines across Modal and Baseten clusters (Muse Spark Open), achieving sub-120ms multi-agent dispute resolution with Llama-Guard 3 safety floors.");
  drawBullet("", "Engineered genuine municipal physical actuation triggers (8,000L/min flood pumps, Gotera smart traffic green waves, and Tikur Anbessa ICU reservations) with bilingual Amharic/English voice dispatch.");

  // Project 2: NetsaGuard AI
  y -= 3;
  checkPageBreak(40);
  page.drawText("NetsaGuard AI – Multilingual Privacy-Preserving Content Safety Hub", { x: margin, y: y, size: 10.5, font: fontBold });
  const dateP2 = "2026";
  page.drawText(dateP2, { x: margin + contentWidth - fontBold.widthOfTextAtSize(dateP2, 9.5), y: y, size: 9.5, font: fontBold });
  y -= 12;
  page.drawText("LangGraph Cyclic StateMachine, Groq LPU, ChromaDB Vector Store, FastMCP", { x: margin, y: y, size: 9, font: fontItalic, color: rgb(0.05, 0.35, 0.65) });
  y -= 12;
  drawBullet("", "Developed an Africa-first agentic moderation engine using LangGraph cyclic state machines and ChromaDB cosine vector retrieval for high-speed local language filtering.");
  drawBullet("", "Constructed Human-In-The-Loop (HITL) cryptographic approval gates with SHA-256 tamper-proof audit manifests for municipal and enterprise governance.");

  // Project 3: Evangadi Forum
  y -= 3;
  checkPageBreak(40);
  page.drawText("Evangadi Forum – Full-Stack Community Q&A Platform", { x: margin, y: y, size: 10.5, font: fontBold });
  const dateP3 = "2025";
  page.drawText(dateP3, { x: margin + contentWidth - fontBold.widthOfTextAtSize(dateP3, 9.5), y: y, size: 9.5, font: fontBold });
  y -= 12;
  page.drawText("React, Node.js, Express, MySQL, JWT Authentication", { x: margin, y: y, size: 9, font: fontItalic, color: rgb(0.05, 0.35, 0.65) });
  y -= 12;
  drawBullet("", "Designed an interactive full-stack discussion platform featuring secure JWT authentication, relational MySQL schema optimization, and responsive mobile-first UI.");

  // ==================== TECHNICAL SKILLS ====================
  drawSectionDivider("Technical Skills");
  drawBullet("Agentic AI & LLMs: ", "LangGraph, Cyclic DAGs, Model Context Protocol (FastMCP), Meta Llama 3.3 70B, Llama-Guard 3, Meta SAM 3.1, ChromaDB, RAG, Prompt Engineering, Groq LPU.");
  drawBullet("Programming Languages: ", "TypeScript, JavaScript (ES6+), Python, SQL, C++, HTML5, CSS3/Tailwind.");
  drawBullet("Frontend & 3D Spatial: ", "React 19, Next.js, Redux Toolkit, TailwindCSS, Mapbox GL JS, Three.js, Lucide.");
  drawBullet("Backend & Databases: ", "Node.js, Express.js, FastAPI, RESTful APIs, WebSockets, PostgreSQL, MySQL.");
  drawBullet("Infrastructure & Cloud: ", "Modal Serverless GPUs, Baseten Engine, Docker, Vercel, Git/GitHub.");
  drawBullet("Security & Specializations: ", "Critical Infrastructure Protection (CIP), Human-In-The-Loop (HITL), Sovereign Privacy Filtering.");

  // ==================== CERTIFICATIONS ====================
  drawSectionDivider("Certifications & Verified Credentials");
  
  const drawCert = (date, title, issuer, credId) => {
    checkPageBreak(16);
    page.drawText(date, { x: margin, y: y, size: 9.5, font: fontBold });
    page.drawText(`${issuer}: ${title}${credId ? ` (ID: ${credId})` : ''}`, {
      x: margin + 95,
      y: y,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.1, 0.1, 0.1)
    });
    y -= 14;
  };

  drawCert("October 2026", "Introduction to Critical Infrastructure Protection (ICIP)", "OPSWAT Academy", "ohD12ZSzzA");
  drawCert("August 2026", "Certified Agentic Engineering Curriculum", "NSK AI / Zerra Build Global Cohort", "Verified");
  drawCert("July 2026", "The Udara Project - Agentic AI Solutions Workflow", "TheUdaraProject (Crew COREMIND)", "carluwrn40ige14179lomimmh");

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(process.cwd(), 'public', 'Hailemichael_Tesfaye_CV.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log('CV PDF generated successfully at:', outputPath);
}

generateCV().catch(err => {
  console.error('Error generating CV PDF:', err);
  process.exit(1);
});
