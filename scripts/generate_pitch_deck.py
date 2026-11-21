import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def build_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Theme Colors matching VERICRED
    BG_COLOR = RGBColor(8, 13, 26)        # #080D1A - Deep Navy
    CARD_BG = RGBColor(14, 23, 46)        # #0E172E - Card Fill
    CARD_BORDER = RGBColor(26, 42, 72)    # #1A2A48 - Border
    ACCENT_CYAN = RGBColor(69, 215, 224)  # #45D7E0 - Brand Cyan
    ACCENT_BLUE = RGBColor(69, 139, 255)  # #458BFF - Brand Blue
    ACCENT_GREEN = RGBColor(74, 210, 160) # #4AD2A0 - Emerald Green
    ACCENT_GOLD = RGBColor(255, 184, 0)   # #FFB800 - Amber Gold
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(148, 163, 184)  # #94A3B8 - Slate
    TEXT_LIGHT = RGBColor(203, 213, 225)  # #CBD5E1

    def apply_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()
        return bg

    def add_card(slide, left, top, width, height, border_color=CARD_BORDER, bg_color=CARD_BG):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)
        return card

    def add_header(slide, tag_text, title_text, subtitle_text=None):
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(1.3))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p0 = tf.paragraphs[0]
        p0.text = tag_text.upper()
        p0.font.size = Pt(10)
        p0.font.bold = True
        p0.font.color.rgb = ACCENT_CYAN

        p1 = tf.add_paragraph()
        p1.text = title_text
        p1.font.size = Pt(24)
        p1.font.bold = True
        p1.font.color.rgb = TEXT_WHITE
        p1.space_before = Pt(4)

        if subtitle_text:
            p2 = tf.add_paragraph()
            p2.text = subtitle_text
            p2.font.size = Pt(12)
            p2.font.color.rgb = TEXT_MUTED
            p2.space_before = Pt(2)

    col_w = 3.65
    gap = 0.39
    left_start = 0.8
    y_start = 2.0
    h_card = 4.8
    w_q = 2.72
    gap_q = 0.28

    # ==========================================
    # SLIDE 1: Title Slide
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    apply_bg(s1)
    add_card(s1, 0.8, 1.2, 11.733, 5.2, border_color=ACCENT_BLUE)

    tbox = s1.shapes.add_textbox(Inches(1.2), Inches(1.5), Inches(10.9), Inches(4.5))
    tf1 = tbox.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "STARTUP TRACK PITCH DECK • HACK-N-PITCH 2026"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_CYAN

    p = tf1.add_paragraph()
    p.text = "VERICRED"
    p.font.size = Pt(44)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_before = Pt(8)

    p = tf1.add_paragraph()
    p.text = "Your Achievements. Your Credentials. Your Control."
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    p.space_before = Pt(4)

    p = tf1.add_paragraph()
    p.text = "Decentralized Academic Credential Issuance & Zero-Knowledge Privacy Verification Network"
    p.font.size = Pt(13)
    p.font.color.rgb = TEXT_MUTED
    p.space_before = Pt(8)

    p = tf1.add_paragraph()
    p.text = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    p.font.size = Pt(9)
    p.font.color.rgb = CARD_BORDER
    p.space_before = Pt(16)

    p = tf1.add_paragraph()
    p.text = "Team Hello World:  Sampad Gorai  •  Sampurna Sit  •  Sayantika Das  •  Debanjan Das"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = TEXT_LIGHT
    p.space_before = Pt(8)

    p = tf1.add_paragraph()
    p.text = "Live Deployments: Polygon Amoy Testnet (Chain ID 80002)  |  Circom 2.1 zk-SNARK  |  W3C VC 2.0 Standard"
    p.font.size = Pt(11)
    p.font.color.rgb = ACCENT_GREEN
    p.space_before = Pt(4)

    # ==========================================
    # SLIDE 2: Problem
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    apply_bg(s2)
    add_header(s2, "Market Pain Point", "The Trillion-Dollar Trust Deficit in Academic Verification", "Legacy background verification is slow, expensive, prone to counterfeits, and legally risky.")

    cards_data = [
        ("15% – 20% FRAUD RATE", "Rampant Academic Forgery", 
         ["• Over 1 in 5 resumes contain fraudulent degrees or fabricated marksheets.",
          "• Diploma mills and forged certificates constitute a $3+ Billion black market globally.",
          "• Centralized university databases suffer from insider corruption, database tampering, and unverified paper seals."],
         ACCENT_GOLD),
        ("7 – 21 DAY DELAY", "The Manual BGV Bottleneck",
         ["• Employers spend 2 to 3 weeks waiting for universities to manually verify transcripts.",
          "• Third-party verification agencies charge $15 to $35 (Rs 1,200–2,500) per check.",
          "• Highly manual: relies on back-and-forth emails, phone calls, and physical postal letters."],
         ACCENT_BLUE),
        ("DPDP / GDPR PENALTIES", "Privacy & Data Exposure",
         ["• Reviewing candidates exposes complete transcripts (past backlogs, failed courses, caste, home address).",
          "• India's DPDP Act 2023 mandates strict data minimization; penalties reach up to Rs 250 Crore.",
          "• Employers demand verification, but candidates have zero selective disclosure tools."],
         ACCENT_CYAN)
    ]

    for i, (badge, title, points, color) in enumerate(cards_data):
        x = left_start + i * (col_w + gap)
        add_card(s2, x, y_start, col_w, h_card, border_color=color)
        tb = s2.shapes.add_textbox(Inches(x + 0.25), Inches(y_start + 0.3), Inches(col_w - 0.5), Inches(h_card - 0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = badge
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = color

        p = tf.add_paragraph()
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(6)

        for pt in points:
            p = tf.add_paragraph()
            p.text = pt
            p.font.size = Pt(11)
            p.font.color.rgb = TEXT_LIGHT
            p.space_before = Pt(8)

    # ==========================================
    # SLIDE 3: Solution
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    apply_bg(s3)
    add_header(s3, "The Solution", "VERICRED: Universal Trustless Academic Layer", "An integrated decentralized platform connecting Universities, Students, and Employers seamlessly.")

    cards_s3 = [
        ("INSTITUTIONAL ISSUER", "1-Click Cryptographic Issuance",
         ["• Universities enroll cohorts and batch-sign degrees using BabyJubjub EdDSA keys.",
          "• Salted Poseidon commitments anchored on Polygon Amoy blockchain.",
          "• Cryptographic keys protected via AES-256-GCM envelope encryption at rest.",
          "• Zero student PII ever published on-chain."],
         ACCENT_CYAN),
        ("STUDENT HOLDER", "Self-Sovereign Identity Wallet",
         ["• Students take cryptographic custody of verifiable degree credentials (W3C VC 2.0).",
          "• Export signed JSON, store in local vault, or share via dynamic QR codes.",
          "• Generate Zero-Knowledge Proofs in-browser to selectively disclose eligibility claims.",
          "• True ownership: cannot be wiped out by university software migrations."],
         ACCENT_GREEN),
        ("CORPORATE RECRUITER", "Instant Sub-Second Verification",
         ["• Zero-login public verification portal for employers and recruiters.",
          "• Validates issuer accreditation, digital signature, and revocation state in < 1.5s.",
          "• Real-time on-chain Revocation Registry checks instantly reject invalidated degrees.",
          "• Replaces $25 manual verification with a sub-second automated API."],
         ACCENT_BLUE)
    ]

    for i, (badge, title, points, color) in enumerate(cards_s3):
        x = left_start + i * (col_w + gap)
        add_card(s3, x, y_start, col_w, h_card, border_color=color)
        tb = s3.shapes.add_textbox(Inches(x + 0.25), Inches(y_start + 0.3), Inches(col_w - 0.5), Inches(h_card - 0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = badge
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = color

        p = tf.add_paragraph()
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(6)

        for pt in points:
            p = tf.add_paragraph()
            p.text = pt
            p.font.size = Pt(11)
            p.font.color.rgb = TEXT_LIGHT
            p.space_before = Pt(8)

    # ==========================================
    # SLIDE 4: Core Differentiator (ZK Proofs)
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    apply_bg(s4)
    add_header(s4, "Our Unfair Advantage", "Zero-Knowledge Academic Prover (Groth16 on BN254)", "Prove academic eligibility without revealing your academic history.")

    w_half = 5.65
    add_card(s4, 0.8, 2.0, w_half, 4.8, border_color=RGBColor(239, 68, 68))
    tb_l = s4.shapes.add_textbox(Inches(1.1), Inches(2.2), Inches(5.05), Inches(4.3))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True
    
    p = tf_l.paragraphs[0]
    p.text = "THE STATUS QUO (DATA LEAKAGE)"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = RGBColor(239, 68, 68)

    p = tf_l.add_paragraph()
    p.text = "Over-Sharing Transcripts & PII"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_before = Pt(6)

    pts_l = [
        "❌ Recruiter asks: 'Do you have a CGPA >= 8.00?'",
        "❌ Student must send full 8-semester marksheet PDF.",
        "❌ Recruiter sees past semester backlogs, low grades in unrelated courses, personal address, and medical leaves.",
        "❌ Huge GDPR / DPDP liability: storing sensitive academic data not required for hiring decisions.",
        "❌ High friction, high privacy risk, zero student control."
    ]
    for pt in pts_l:
        p = tf_l.add_paragraph()
        p.text = pt
        p.font.size = Pt(11.5)
        p.font.color.rgb = TEXT_LIGHT
        p.space_before = Pt(10)

    add_card(s4, 6.85, 2.0, w_half, 4.8, border_color=ACCENT_GREEN)
    tb_r = s4.shapes.add_textbox(Inches(7.15), Inches(2.2), Inches(5.05), Inches(4.3))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True
    
    p = tf_r.paragraphs[0]
    p.text = "VERICRED ZERO-KNOWLEDGE PROVER"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GREEN

    p = tf_r.add_paragraph()
    p.text = "Mathematical Proof of CGPA >= 8.00"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.space_before = Pt(6)

    pts_r = [
        "✅ Student selects required threshold: e.g. 8.00.",
        "✅ In-browser snarkjs synthesizer computes Circom witness over fixed-point scaled integers (872 >= 800).",
        "✅ Groth16 cryptographic proof (pi_a, pi_b, pi_c) generated in milliseconds without revealing raw score (8.72).",
        "✅ Recruiter checks elliptic curve pairing: returns 'VALID' in 800ms.",
        "✅ 100% mathematical certainty with 0% sensitive data leakage."
    ]
    for pt in pts_r:
        p = tf_r.add_paragraph()
        p.text = pt
        p.font.size = Pt(11.5)
        p.font.color.rgb = TEXT_LIGHT
        p.space_before = Pt(10)

    # ==========================================
    # SLIDE 5: Architecture & Tech Stack
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    apply_bg(s5)
    add_header(s5, "Technical Execution", "Production-Grade Monorepo Architecture", "Built and verified with 87+ passing unit, circuit, smart contract, and E2E regression tests.")

    arch_cards = [
        ("LAYER 1: SMART CONTRACTS", "Polygon Amoy Testnet",
         ["• InstitutionRegistry.sol",
          "• CredentialRegistry.sol",
          "• RevocationRegistry.sol",
          "• 20/20 Hardhat unit tests pass.",
          "• Atomic batch issuance Merkle roots for zero gas overhead."],
         ACCENT_CYAN),
        ("LAYER 2: OFF-CHAIN CRYPTO", "Dual Cryptographic Engine",
         ["• W3C VC 2.0 & JSON-LD standard.",
          "• BabyJubjub twisted Edwards curve signatures.",
          "• Salted Poseidon hashing.",
          "• AES-256-GCM envelope encryption for private keys at rest.",
          "• 15/15 crypto unit tests pass."],
         ACCENT_BLUE),
        ("LAYER 3: ZK PROVER", "Circom 2.1 & Groth16",
         ["• CgpaThresholdValidator.circom arithmetic circuit.",
          "• Fixed-point integer scaling (8.72 -> 872) avoiding floats.",
          "• BN254 elliptic curve pairing.",
          "• 7/7 circuit boundary tests pass.",
          "• In-browser prover & verifier."],
         ACCENT_GREEN),
        ("LAYER 4: BACKEND & WEB", "Next.js 14 & Express API",
         ["• Monorepo via Turborepo & pnpm.",
          "• Next.js 14 standalone runner.",
          "• Express API + Prisma ORM.",
          "• PostgreSQL 16 & Redis 7.",
          "• 48/48 API tests passing.",
          "• 16 static routes prerendered."],
         ACCENT_GOLD)
    ]

    for i, (badge, title, points, color) in enumerate(arch_cards):
        x = 0.8 + i * (w_q + gap_q)
        add_card(s5, x, y_start, w_q, h_card, border_color=color)
        tb = s5.shapes.add_textbox(Inches(x + 0.18), Inches(y_start + 0.25), Inches(w_q - 0.36), Inches(h_card - 0.5))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = badge
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = color

        p = tf.add_paragraph()
        p.text = title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(4)

        for pt in points:
            p = tf.add_paragraph()
            p.text = pt
            p.font.size = Pt(10.5)
            p.font.color.rgb = TEXT_LIGHT
            p.space_before = Pt(6)

    # ==========================================
    # SLIDE 6: Implementation Workflow
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    apply_bg(s6)
    add_header(s6, "Product Implementation", "End-to-End Operational Workflow", "A live, fully realized prototype connecting all stakeholders in a unified loop.")

    steps = [
        ("STEP 1: GOVERNANCE", "Consortium Accreditation",
         "Consortium multi-sig administrators review institution applications, approve or reject signing keys on-chain, and record immutable audit logs.",
         ACCENT_CYAN),
        ("STEP 2: ISSUANCE", "University Signs & Anchors",
         "University registrars manage student rosters, input degree data, sign with BabyJubjub EdDSA, and anchor Poseidon hashes on Polygon Amoy in bulk.",
         ACCENT_BLUE),
        ("STEP 3: CUSTODY & ZK", "Student Sovereign Control",
         "Students receive credentials in their wallet, export W3C JSON, synthesize Groth16 proofs (e.g. CGPA >= 8.00), and create replay-protected QR codes.",
         ACCENT_GREEN),
        ("STEP 4: VERIFICATION", "Sub-Second Recruiter Check",
         "Employers scan QR or paste proofs in the public portal. Verifies Groth16 pairing, university accreditation, and revocation state in < 1.5s.",
         ACCENT_GOLD)
    ]

    for i, (step_num, title, desc, color) in enumerate(steps):
        x = 0.8 + i * (w_q + gap_q)
        add_card(s6, x, y_start, w_q, h_card, border_color=color)
        tb = s6.shapes.add_textbox(Inches(x + 0.18), Inches(y_start + 0.25), Inches(w_q - 0.36), Inches(h_card - 0.5))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = step_num
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = color

        p = tf.add_paragraph()
        p.text = title
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(4)

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_LIGHT
        p.space_before = Pt(12)

    # ==========================================
    # SLIDE 7: Market Feasibility (TAM / SAM / SOM)
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    apply_bg(s7)
    add_header(s7, "Market Feasibility", "Massive Market Sizing & Regulatory Tailwinds", "High willingness-to-pay from both universities and high-volume recruiting enterprises.")

    m_w = 3.65
    metrics = [
        ("$5.6 BILLION", "Total Addressable Market (TAM)", "Global background check and identity verification market by 2026, growing to $9.2B at 9.4% CAGR.", ACCENT_CYAN),
        ("$1.2 BILLION", "Serviceable Available Market (SAM)", "Higher-education credentialing and IT/BFSI employment verification across India & Southeast Asia.", ACCENT_BLUE),
        ("$85 MILLION", "Serviceable Obtainable Market (SOM)", "Tier-1/Tier-2 Indian technical universities & mass corporate recruitment pipelines within 36 months.", ACCENT_GREEN)
    ]
    for i, (num, label, desc, color) in enumerate(metrics):
        x = 0.8 + i * (m_w + gap)
        add_card(s7, x, 2.0, m_w, 2.1, border_color=color)
        tb = s7.shapes.add_textbox(Inches(x + 0.2), Inches(2.15), Inches(m_w - 0.4), Inches(1.8))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = num
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = color

        p = tf.add_paragraph()
        p.text = label
        p.font.size = Pt(11.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(2)

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(4)

    add_card(s7, 0.8, 4.4, 11.733, 2.4, border_color=CARD_BORDER)
    tb_b = s7.shapes.add_textbox(Inches(1.1), Inches(4.55), Inches(11.1), Inches(2.1))
    tf_b = tb_b.text_frame
    tf_b.word_wrap = True

    p = tf_b.paragraphs[0]
    p.text = "KEY MARKET DRIVERS & CATALYSTS"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = ACCENT_GOLD

    drivers = [
        "• Remote Hiring Surge: Global remote engineering hiring has increased resume fabrication by 35% since 2022.",
        "• DPDP Act 2023 Enforcement: Indian enterprises face severe regulatory liabilities for non-minimized PII storage in recruitment databases.",
        "• Massive University Administrative Cost: Higher education institutions spend upwards of Rs 15–20 Lakhs annually fielding verification inquiries and printing holographic certificates."
    ]
    for d in drivers:
        p = tf_b.add_paragraph()
        p.text = d
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_LIGHT
        p.space_before = Pt(5)

    # ==========================================
    # SLIDE 8: Business Model & Revenue
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    apply_bg(s8)
    add_header(s8, "Business Model", "Dual-Sided Enterprise Monetization", "A scalable B2B SaaS model paired with high-volume transactional verification APIs.")

    rev_cards = [
        ("B2B UNIVERSITY SAAS", "Annual Institutional Licensing",
         ["• Rs 1.5L to Rs 5L / year ($2,000–$6,000) per institution based on graduating cohort size.",
          "• Includes issuer dashboard, key management, student roster automation, and custom DIDs.",
          "• Value proposition: Replaces expensive physical security paper, holograms, and administrative labor."],
         ACCENT_CYAN),
        ("B2B RECRUITER API", "Pay-Per-Verification Query",
         ["• Rs 50 to Rs 100 ($0.60–$1.20) per instant cryptographic API check.",
          "• Direct customers: Background Verification Agencies (AuthBridge, First Adv, HireRight).",
          "• Replaces their manual $20 verification cost with a 90% cheaper sub-second API."],
         ACCENT_BLUE),
        ("ENTERPRISE ATS INTEGRATION", "Corporate Platform Connectors",
         ["• Monthly enterprise fee for ATS platforms (Workday, Greenhouse, Darwinbox).",
          "• Automated batch ZK screening for campus placement drives (filtering 10,000 candidates instantly).",
          "• 100% Free for Students: Drives bottom-up network effects and student advocacy."],
         ACCENT_GREEN)
    ]

    for i, (badge, title, points, color) in enumerate(rev_cards):
        x = left_start + i * (col_w + gap)
        add_card(s8, x, y_start, col_w, h_card, border_color=color)
        tb = s8.shapes.add_textbox(Inches(x + 0.25), Inches(y_start + 0.3), Inches(col_w - 0.5), Inches(h_card - 0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = badge
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = color

        p = tf.add_paragraph()
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(6)

        for pt in points:
            p = tf.add_paragraph()
            p.text = pt
            p.font.size = Pt(11)
            p.font.color.rgb = TEXT_LIGHT
            p.space_before = Pt(8)

    # ==========================================
    # SLIDE 9: Competitive Landscape & Moat
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    apply_bg(s9)
    add_header(s9, "Competitive Advantage", "Why VERICRED Outperforms Existing Alternatives", "A clear technological moat combining W3C open standards with zero-knowledge math.")

    add_card(s9, 0.8, 2.0, 11.733, 4.8, border_color=ACCENT_CYAN)
    tb_table = s9.shapes.add_textbox(Inches(1.1), Inches(2.2), Inches(11.133), Inches(4.3))
    tf_t = tb_table.text_frame
    tf_t.word_wrap = True

    rows = [
        ("FEATURE / CAPABILITY", "EXCEL / EMAIL", "CENTRALIZED DB", "DIGILOCKER", "VERICRED (OURS)"),
        ("Verification Speed", "7–14 Days", "1–3 Days", "Instant (PDF)", "< 1.5 Seconds (Crypto)"),
        ("Tamper Resistance", "Zero (Easily edited)", "Vulnerable to DB admin", "Single authority trust", "Mathematically Guaranteed"),
        ("Zero-Knowledge Range Proofs", "None", "None", "None (Exposes full sheet)", "Native Groth16 (BN254)"),
        ("DPDP / GDPR Compliance", "Major liability", "Major liability", "Exposes full marksheet", "100% Data-Minimized"),
        ("Real-Time Revocation", "Impossible", "Internal sync delay", "Delayed updates", "Instant On-Chain Registry"),
        ("International Interoperability", "None", "Proprietary Silo", "India-only", "W3C VC 2.0 Global Standard"),
    ]

    for idx, row in enumerate(rows):
        p = tf_t.paragraphs[0] if idx == 0 else tf_t.add_paragraph()
        p.text = f"{row[0]:<30}  |  {row[1]:<16}  |  {row[2]:<18}  |  {row[3]:<22}  |  {row[4]}"
        if idx == 0:
            p.font.size = Pt(10.5)
            p.font.bold = True
            p.font.color.rgb = ACCENT_GOLD
        else:
            p.font.size = Pt(10.5)
            p.font.color.rgb = TEXT_WHITE if "VERICRED" in row[4] else TEXT_LIGHT
            p.space_before = Pt(8)

    # ==========================================
    # SLIDE 10: GTM & Strategic Vision
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    apply_bg(s10)
    add_header(s10, "Go-To-Market & Vision", "Strategic Milestones & Expansion Roadmap", "Scaling from university placements to the global standard for digital credentialing.")

    phases = [
        ("PHASE 1 (Q1 – Q2 2027)", "Higher-Ed Beachhead",
         ["• Pilot deployment with 10 engineering & management institutes (starting with RCCIIT & MAKAUT network).",
          "• Onboard 5,000+ graduating students into the sovereign credential wallet.",
          "• Partner with campus placement cells for mass recruitment screening."],
         ACCENT_CYAN),
        ("PHASE 2 (Q3 – Q4 2027)", "BGV Agency Partnerships",
         ["• Direct API integration with top Background Verification (BGV) agencies across India.",
          "• Launch ATS plugins for Workday, Darwinbox, and Zoho Recruit.",
          "• Achieve Rs 50L ARR milestone through university SaaS + recruiter API transactions."],
         ACCENT_BLUE),
        ("PHASE 3 (2028+)", "Global Credential Network",
         ["• Expand beyond academia into professional certifications (AWS, Cisco, PMI) and medical licenses.",
          "• Cross-border credential recognition with international university evaluation services (WES).",
          "• Decentralized identity foundation for global digital labor mobility."],
         ACCENT_GREEN)
    ]

    for i, (badge, title, points, color) in enumerate(phases):
        x = left_start + i * (col_w + gap)
        add_card(s10, x, y_start, col_w, h_card, border_color=color)
        tb = s10.shapes.add_textbox(Inches(x + 0.25), Inches(y_start + 0.3), Inches(col_w - 0.5), Inches(h_card - 0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = badge
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = color

        p = tf.add_paragraph()
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(6)

        for pt in points:
            p = tf.add_paragraph()
            p.text = pt
            p.font.size = Pt(11)
            p.font.color.rgb = TEXT_LIGHT
            p.space_before = Pt(8)

    output_path = r"docs\VERICRED_Startup_Pitch_Deck.pptx"
    prs.save(output_path)
    print(f"SUCCESS: Presentation successfully created at: {output_path}")

if __name__ == "__main__":
    build_deck()
