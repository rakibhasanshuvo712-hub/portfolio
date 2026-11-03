"""Generate the two-page CV while retaining the portrait embedded in the current PDF."""

from io import BytesIO
from pathlib import Path

import pymupdf
from PIL import Image, ImageDraw
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from pypdf import PdfReader

OUTPUT = Path("assets/Rakib-Hasan-Shuvo-CV.pdf")
PAGE_W, PAGE_H = A4
MARGIN = 17 * mm
NAVY = colors.HexColor("#14243a")
INK = colors.HexColor("#192638")
MUTED = colors.HexColor("#5b6b7c")
ACCENT = colors.HexColor("#0786a7")
RULE = colors.HexColor("#d8e2e9")
WHITE = colors.white


def get_portrait():
    """Reuse the portrait already embedded in the CV, even on repeat generation."""
    document = pymupdf.open(OUTPUT)
    for page in document:
        images = page.get_images(full=True)
        if images:
            raw = document.extract_image(images[0][0])["image"]
            source = Image.open(BytesIO(raw)).convert("RGBA")
            side = min(source.size)
            left = (source.width - side) // 2
            top = (source.height - side) // 2
            source = source.crop((left, top, left + side, top + side)).resize((480, 480))
            mask = Image.new("L", (480, 480), 0)
            ImageDraw.Draw(mask).ellipse((3, 3, 477, 477), fill=255)
            source.putalpha(mask)
            result = BytesIO()
            source.save(result, format="PNG")
            result.seek(0)
            document.close()
            return result
    document.close()
    raise RuntimeError("The CV portrait could not be found in the current PDF.")


def draw_header(canvas, doc):
    canvas.saveState()
    if doc.page == 1:
        header_h = 43 * mm
        canvas.setFillColor(NAVY)
        canvas.rect(0, PAGE_H - header_h, PAGE_W, header_h, fill=1, stroke=0)
        canvas.setFillColor(WHITE)
        canvas.setFont("Helvetica-Bold", 20)
        canvas.drawString(MARGIN, PAGE_H - 17 * mm, "Md. Rakib Hasan Shuvo")
        canvas.setFillColor(colors.HexColor("#86d7e8"))
        canvas.setFont("Helvetica-Bold", 9.2)
        canvas.drawString(MARGIN, PAGE_H - 23 * mm, "FULL-STACK WEB ENGINEER  |  CSE STUDENT")
        canvas.setFillColor(colors.HexColor("#e4edf5"))
        canvas.setFont("Helvetica", 7.3)
        canvas.drawString(MARGIN, PAGE_H - 30 * mm, "rakibhasanshuvo712@gmail.com")
        canvas.drawString(MARGIN, PAGE_H - 34 * mm, "github.com/rakibhasanshuvo712-hub")
        canvas.drawString(MARGIN, PAGE_H - 38 * mm, "linkedin.com/in/rakib-hasan-shuvo-7110ba407")
        canvas.drawImage(
            ImageReader(doc.portrait), PAGE_W - MARGIN - 30 * mm, PAGE_H - 38 * mm,
            width=30 * mm, height=30 * mm, mask="auto",
        )
    else:
        canvas.setFillColor(NAVY)
        canvas.setFont("Helvetica-Bold", 12)
        canvas.drawString(MARGIN, PAGE_H - 15 * mm, "Md. Rakib Hasan Shuvo")
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(PAGE_W - MARGIN, PAGE_H - 15 * mm, "PROJECTS & PROFILE")
        canvas.setStrokeColor(ACCENT)
        canvas.setLineWidth(1.1)
        canvas.line(MARGIN, PAGE_H - 19 * mm, PAGE_W - MARGIN, PAGE_H - 19 * mm)

    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.55)
    canvas.line(MARGIN, 13 * mm, PAGE_W - MARGIN, 13 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(MARGIN, 9 * mm, "rakibhasanshuvo712@gmail.com")
    canvas.drawRightString(PAGE_W - MARGIN, 9 * mm, f"{doc.page} / 2")
    canvas.restoreState()


def build_styles():
    defaults = getSampleStyleSheet()
    return {
        "section": ParagraphStyle(
            "Section", parent=defaults["Heading2"], fontName="Helvetica-Bold",
            fontSize=10, leading=13, textColor=ACCENT, spaceBefore=5, spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "Body", parent=defaults["BodyText"], fontName="Helvetica",
            fontSize=8.25, leading=11.1, textColor=INK, spaceAfter=2,
        ),
        "small": ParagraphStyle(
            "Small", parent=defaults["BodyText"], fontName="Helvetica",
            fontSize=7.65, leading=10.1, textColor=MUTED,
        ),
        "label": ParagraphStyle(
            "Label", parent=defaults["BodyText"], fontName="Helvetica-Bold",
            fontSize=8.1, leading=10.5, textColor=NAVY,
        ),
        "project": ParagraphStyle(
            "Project", parent=defaults["BodyText"], fontName="Helvetica-Bold",
            fontSize=8.6, leading=10.6, textColor=NAVY,
        ),
        "tech": ParagraphStyle(
            "Tech", parent=defaults["BodyText"], fontName="Helvetica",
            fontSize=7.2, leading=9.4, textColor=MUTED, alignment=TA_RIGHT,
        ),
        "bullet": ParagraphStyle(
            "Bullet", parent=defaults["BodyText"], fontName="Helvetica",
            fontSize=7.8, leading=10.1, textColor=INK, leftIndent=9,
            firstLineIndent=-7, spaceAfter=1,
        ),
        "link": ParagraphStyle(
            "Link", parent=defaults["BodyText"], fontName="Helvetica",
            fontSize=7.8, leading=10.1, textColor=ACCENT, leftIndent=9,
            firstLineIndent=-7, spaceAfter=1,
        ),
    }


def section(title, styles):
    table = Table([[Paragraph(title.upper(), styles["section"])]], colWidths=[PAGE_W - 2 * MARGIN])
    table.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, -1), 0.65, RULE),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    return table


def project(name, technologies, bullets, styles):
    heading = Table(
        [[Paragraph(name, styles["project"]), Paragraph(technologies, styles["tech"])]],
        colWidths=[PAGE_W - 2 * MARGIN - 57 * mm, 57 * mm],
    )
    heading.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    parts = [heading]
    for item in bullets:
        is_link = item.startswith("Live:")
        content = item[6:].strip() if is_link else item
        if is_link:
            content = f'<link href="https://{content}" color="#0786a7">{item}</link>'
        parts.append(Paragraph("&#8226; " + content, styles["link"] if is_link else styles["bullet"]))
    parts.append(Spacer(1, 4))
    return KeepTogether(parts)


def build_pdf():
    portrait = get_portrait()
    buffer = BytesIO()
    doc = BaseDocTemplate(
        buffer, pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=49 * mm, bottomMargin=18 * mm,
        title="Md. Rakib Hasan Shuvo - CV", author="Md. Rakib Hasan Shuvo",
        subject="Full-Stack Web Engineer CV",
    )
    doc.portrait = portrait
    frame = Frame(
        MARGIN, 18 * mm, PAGE_W - 2 * MARGIN, PAGE_H - 49 * mm - 18 * mm,
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0, id="main",
    )
    continued_frame = Frame(
        MARGIN, 18 * mm, PAGE_W - 2 * MARGIN, PAGE_H - 25 * mm - 18 * mm,
        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0, id="continued",
    )
    doc.addPageTemplates([
        PageTemplate(id="cv", frames=[frame], onPage=draw_header, autoNextPageTemplate="continued"),
        PageTemplate(id="continued", frames=[continued_frame], onPage=draw_header),
    ])
    styles = build_styles()

    summary = (
        "Curious, detail-oriented Computer Science &amp; Engineering student who builds fast, scalable full-stack web applications. "
        "Strong in React/Next.js, Node.js, FastAPI and MongoDB/PostgreSQL, with a focus on performance, clean API design and "
        "polished interfaces. Uses AI tools (Copilot, Cursor, ChatGPT) to ship faster while understanding every line. Seeking "
        "internship, freelance and collaboration opportunities."
    )
    story = [
        section("Professional Summary", styles),
        Paragraph(summary, styles["body"]),
        section("Education", styles),
    ]

    education = [
        [Paragraph("<b>B.Sc. in Computer Science &amp; Engineering</b><br/>City University, Bangladesh", styles["body"]),
         Paragraph("Ongoing", styles["tech"])],
        [Paragraph("<b>Coursework:</b> Data Structures &amp; Algorithms, DBMS, Automata &amp; Formal Languages, Assembly (8086), Networking", styles["small"]), ""],
        [Paragraph("<b>AI-Driven Full-Stack Web Engineering</b><br/>Programming Hero", styles["body"]),
         Paragraph("Ongoing", styles["tech"])],
    ]
    education_table = Table(education, colWidths=[PAGE_W - 2 * MARGIN - 27 * mm, 27 * mm])
    education_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
        ("SPAN", (0, 1), (1, 1)),
    ]))
    story.extend([education_table, section("Technical Skills", styles)])

    skills = [
        ("Languages", "JavaScript (ES6+), TypeScript, Python, SQL, HTML5, CSS3, Assembly 8086, LaTeX"),
        ("Frontend", "React.js, Next.js (App Router), Tailwind CSS v4, shadcn/ui, Framer Motion, Responsive &amp; Mobile-first Design, SEO"),
        ("Backend", "Node.js, Express.js, FastAPI, REST APIs, JWT/Cookie Authentication, Better Auth, Security Basics"),
        ("Databases", "MongoDB, Mongoose, PostgreSQL, Prisma ORM, Schema Design"),
        ("DevOps &amp; Tools", "Git &amp; GitHub, GitHub Actions (CI/CD), Vercel, Netlify, Render, Figma"),
        ("AI Tools", "GitHub Copilot, Cursor IDE, ChatGPT, Google Gemini (AI-assisted refactoring and debugging)"),
    ]
    skill_rows = [[Paragraph(label, styles["label"]), Paragraph(value, styles["small"])] for label, value in skills]
    skills_table = Table(skill_rows, colWidths=[27 * mm, PAGE_W - 2 * MARGIN - 27 * mm])
    skills_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("LINEBELOW", (0, 0), (-1, -2), 0.3, RULE),
    ]))
    story.extend([skills_table, section("Projects", styles)])

    story.append(project("BookNook - Community Library Platform", "Next.js, Better Auth, MongoDB", [
        "Built a full-stack library web app with Next.js App Router, React, TypeScript, Tailwind CSS, and Better Auth.",
        "Implemented book catalog discovery with availability tracking, personal collection management, and borrow/return workflows.",
        "Designed a companion Express &amp; MongoDB REST API with secure authentication and structured error handling.",
        "Live: borrowbook-client.vercel.app",
    ], styles))
    story.append(project("E-commerce Platform", "MERN, JWT, Stripe-ready", [
        "Built a full MERN application with user authentication, shopping cart and checkout flow.",
        "Designed a secure REST API with JWT-based auth and structured error handling.",
    ], styles))
    story.append(project("SaaS Dashboard", "Next.js, Prisma, PostgreSQL", [
        "Developed a server-side rendered dashboard with a relational PostgreSQL schema via Prisma ORM.",
        "Used TypeScript end to end for type-safe data flow between UI and API.",
    ], styles))

    story.extend([PageBreak(), section("Projects (Continued)", styles)])
    story.append(project("Wanderlust - Travel Destination Explorer", "Next.js 16, React 19, shadcn/ui, MongoDB", [
        "Developed a modern travel platform with destination browsing, interactive booking reservations, and custom publishing.",
        "Used Next.js 16 App Router with React 19, Tailwind CSS v4, and shadcn/ui component library.",
        "Integrated Better Auth with MongoDB for persistent user sessions and profile management.",
    ], styles))
    story.append(project("Bazar Dor - Market Price Tracker", "Next.js, TypeScript, MongoDB", [
        "Created a Bengali-language web app tracking daily market prices of essential commodities across Bangladesh.",
        "Implemented real-time price trend visualization, category filtering, per-market comparisons, and user sign-in.",
        "Live: bazar-dor-three.vercel.app",
    ], styles))
    story.append(project("Fit Log - Fitness Workout App", "Next.js, TypeScript, Tailwind", [
        "Built a responsive fitness app with dynamic workout library, personalized plans, and completion tracking.",
        "Implemented workout statistics, sorting, toast notifications, and persistent client-side state.",
        "Live: fit-log-sandy.vercel.app",
    ], styles))
    story.append(project("Blog Application", "React, Node.js, MongoDB", [
        "Created a blog backend and responsive React UI with CRUD and MongoDB document modeling.",
        "Accelerated development and debugging with an AI-assisted workflow.",
    ], styles))
    story.append(project("Personal Portfolio - Responsive Developer Website", "HTML, CSS, JavaScript", [
        "Built a responsive portfolio website to present projects, technical skills, and contact information.",
        "Added accessible dark and light themes with saved visitor preference and system theme support.",
    ], styles))

    story.append(section("Strengths", styles))
    strengths = [
        ("Full-stack integration:", "reactive UIs connected to well-structured REST/FastAPI endpoints."),
        ("Fast learner:", "learns by building and finishes what I start."),
        ("Teamwork:", "asks questions, welcomes feedback, communicates clearly."),
        ("AI-augmented workflow:", "uses Copilot, Cursor, and ChatGPT to accelerate development without losing understanding."),
    ]
    story.extend(Paragraph(f"&#8226; <b>{label}</b> {value}", styles["bullet"]) for label, value in strengths)

    doc.build(story)
    buffer.seek(0)
    reader = PdfReader(buffer)
    if len(reader.pages) != 2:
        raise RuntimeError(f"Expected exactly two pages, got {len(reader.pages)}")
    with OUTPUT.open("wb") as stream:
        reader_copy = PdfReader(buffer)
        from pypdf import PdfWriter
        writer = PdfWriter()
        for page in reader_copy.pages:
            writer.add_page(page)
        writer.add_metadata({"/Title": "Md. Rakib Hasan Shuvo - CV", "/Author": "Md. Rakib Hasan Shuvo"})
        writer.write(stream)
    print(f"PDF saved to {OUTPUT}")


if __name__ == "__main__":
    build_pdf()
