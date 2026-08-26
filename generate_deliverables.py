import os
import sys
import zipfile
from pathlib import Path

def build_pdf(pdf_path):
    print(f"Target PDF path: {pdf_path}")
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1e1b4b'),
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#475569'),
        spaceAfter=12
    )

    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#4338ca'),
        spaceBefore=10,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#334155'),
        spaceAfter=6
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor('#1e293b')
    )

    elements = []

    # Title & Header
    elements.append(Paragraph("SRS Implementation Summary Report", title_style))
    elements.append(Paragraph("<b>Project:</b> Full-Stack Typing Speed Game Application | <b>Ref:</b> Burdenoff Intern Take-Home<br/><b>Date:</b> August 2026 | <b>Status:</b> Approved & Fully Implemented", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#6366f1'), spaceAfter=12))

    # Section 1
    elements.append(Paragraph("1. Executive Architecture Summary", h2_style))
    elements.append(Paragraph(
        "This summary report details the full-stack architectural implementation of the <b>Typing Speed Game Application</b>. The solution comprises a Next.js (TypeScript) single-page client, a Bun + GraphQL Yoga API gateway, Prisma ORM with PostgreSQL relational persistence, and containerized Docker Compose orchestration.",
        body_style
    ))

    # Section 2 - Requirements Matrix
    elements.append(Paragraph("2. SRS Traceability Matrix", h2_style))

    matrix_data = [
        [
            Paragraph("SRS Section & Requirement", table_header_style),
            Paragraph("Implemented Feature & Architecture Details", table_header_style),
            Paragraph("Status", table_header_style)
        ],
        [
            Paragraph("<b>3.1 User Registration & Auth</b><br/>Unique username/email, salted bcrypt, JWT sessions, protected GraphQL API.", table_cell_style),
            Paragraph("JWT auth middleware with bcrypt password hashing in GraphQL Yoga resolvers (`register`, `login`, `me`).", table_cell_style),
            Paragraph("<b>COMPLIES</b>", table_cell_style)
        ],
        [
            Paragraph("<b>3.2 Typing Mechanics</b><br/>20 random alphabets, real-time timer at 0s, focus lock, 0.5s error penalty.", table_cell_style),
            Paragraph("Implemented `TypingEngine.tsx` with programmatic focus locking, 20 random alphabets [a-z], real-time timer, and immediate +0.5s error penalty calculation.", table_cell_style),
            Paragraph("<b>COMPLIES</b>", table_cell_style)
        ],
        [
            Paragraph("<b>3.3 Scoring & Leaderboard</b><br/>Final score = Raw + Errors x 0.5s, LocalStorage PB cache, global leaderboard.", table_cell_style),
            Paragraph("Local storage personal best caching + server-side GraphQL `saveGameResult` and `getLeaderboard` sorted by total score.", table_cell_style),
            Paragraph("<b>COMPLIES</b>", table_cell_style)
        ],
        [
            Paragraph("<b>4 & 5 Tech Stack & Database</b><br/>React/Next.js SPA, Bun, GraphQL Yoga, PostgreSQL 16 + Prisma ORM.", table_cell_style),
            Paragraph("Prisma schema defining `User` and `GameResult` 1-to-N entities with cascade deletion; Dockerized Bun backend runtime.", table_cell_style),
            Paragraph("<b>COMPLIES</b>", table_cell_style)
        ],
        [
            Paragraph("<b>7 QA & Testing Strategy</b><br/>Frontend keypress & arithmetic tests, backend score calculation & auth tests.", table_cell_style),
            Paragraph("Automated Vitest unit test suites for frontend sequence/scoring math and backend JWT/penalty arithmetic.", table_cell_style),
            Paragraph("<b>COMPLIES</b>", table_cell_style)
        ],
        [
            Paragraph("<b>8 Infrastructure & Setup</b><br/>Docker Compose with postgres:16-alpine and backend containers.", table_cell_style),
            Paragraph("Fully configured `docker-compose.yml` orchestrating PostgreSQL on port 5432 and backend on port 4000.", table_cell_style),
            Paragraph("<b>COMPLIES</b>", table_cell_style)
        ]
    ]

    t = Table(matrix_data, colWidths=[140, 290, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4338ca')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#f8fafc')),
        ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#f8fafc')),
        ('BACKGROUND', (0, 5), (-1, 5), colors.HexColor('#f8fafc')),
        ('TEXTCOLOR', (2, 1), (2, -1), colors.HexColor('#15803d')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(t)

    # Section 3
    elements.append(Paragraph("3. Highlights & Key Features", h2_style))
    highlights = [
        "<b>Focus Lock Engine:</b> Programmatically locks focus without requiring manual mouse interaction.",
        "<b>Penalty Calculation Integrity:</b> +0.5s per error added to final duration, validated on client & backend.",
        "<b>Dual Score Persistence:</b> Instant LocalStorage PB caching + async GraphQL PostgreSQL persistence.",
        "<b>UI Aesthetics:</b> Vibrant dark mode with glowing glassmorphism cards and neon status badges."
    ]
    for h in highlights:
        elements.append(Paragraph(f"• {h}", body_style))

    doc.build(elements)
    print("PDF build successful!")


def build_zip(target_dir, zip_path):
    print(f"Target ZIP path: {zip_path}")
    project_path = Path(target_dir)
    ignored_dirs = {'node_modules', '.next', 'dist', '.git', 'coverage'}
    ignored_files = {'typing-speed-game.zip'}

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(target_dir):
            dirs[:] = [d for d in dirs if d not in ignored_dirs]
            for file in files:
                if file in ignored_files or file.endswith('.pyc'):
                    continue
                file_p = Path(root) / file
                arcname = file_p.relative_to(project_path.parent)
                zipf.write(file_p, arcname)

    print("ZIP build successful!")


if __name__ == '__main__':
    target_dir = r"C:\Users\FAIHA\.gemini\antigravity\scratch\typing-speed-game"
    pdf_out = os.path.join(target_dir, "SRS_Implementation_Summary.pdf")
    zip_out = os.path.join(target_dir, "typing-speed-game.zip")

    try:
        build_pdf(pdf_out)
        build_zip(target_dir, zip_out)
    except Exception as e:
        print(f"Error during deliverable generation: {e}")
        sys.exit(1)
