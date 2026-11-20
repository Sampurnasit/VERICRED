import { test, expect } from '@playwright/test';

test.describe('VERICRED Frontend E2E Demonstration Scenarios 1–6', () => {
  test('Landing Page & Navigation to Demonstration Portals', async ({ page }) => {
    await page.goto('/');

    // Check header branding and navigation links
    await expect(page.locator('text=VERICRED').first()).toBeVisible();
    await expect(page.locator('a:has-text("Verify Credential")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Student Wallet")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Issuer Portal")').first()).toBeVisible();

    // Verify key architecture highlights on landing page
    await expect(page.locator('text=Groth16 Zero-Knowledge').first()).toBeVisible();
    await expect(page.locator('text=BabyJubjub EdDSA').first()).toBeVisible();
    await expect(page.locator('text=Poseidon Commitments').first()).toBeVisible();
  });

  test('Demonstration Scenario 1: Institution Overview & Credential Issuance UI', async ({ page }) => {
    await page.goto('/institution/overview');

    // Check institution overview shell
    await expect(page.locator('text=RCC Institute of Information Technology').first()).toBeVisible();
    await expect(page.locator('text=Accredited Issuer').first()).toBeVisible();

    // Navigate to single issuance form
    await page.goto('/institution/issue');
    await expect(page.locator('text=Issue Academic Credentials').first()).toBeVisible();

    // Verify issuance action button exists
    await expect(page.locator('button:has-text("Sign & Issue Verifiable Credential")')).toBeVisible();
  });

  test('Demonstration Scenario 2: Student Sovereign Wallet & Cryptographic Credentials UI', async ({ page }) => {
    await page.goto('/student/wallet');

    // Check wallet header and student details
    await expect(page.locator('text=Credential Wallet').first()).toBeVisible();
    await expect(page.locator('text=Aarav Sen').first()).toBeVisible();

    // Verify academic credential card is rendered
    await expect(page.locator('text=B.Tech Computer Science').first()).toBeVisible();
    await expect(page.locator('text=8.72 / 10.00').first()).toBeVisible();

    // Verify cryptographic badges / footprint
    await expect(page.locator('text=Poseidon Commitment').first()).toBeVisible();
    await expect(page.locator('text=BabyJubjub EdDSA Signature').first()).toBeVisible();
  });

  test('Demonstration Scenario 3: In-Browser Privacy-Preserving Groth16 ZK Proof Generation', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/student/wallet');

    // Locate ZK proof generator section
    await expect(page.locator('text=Generate ZK Proof').first()).toBeVisible();
    await expect(page.locator('text=Minimum Cutoff Threshold').first()).toBeVisible();

    // Generate ZK proof in-browser via WebAssembly witness generator
    const generateBtn = page.locator('button:has-text("Generate Mathematical Proof")');
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Wait for proof generation to complete
    await expect(page.locator('text=Zero-Knowledge Proof Ready')).toBeVisible({ timeout: 45000 });
  });

  test('Demonstration Scenario 4: Public Verification Console & Groth16 Pairing Verification', async ({ page }) => {
    await page.goto('/verify');

    // Check verification portal header
    await expect(page.locator('text=Verify Academic Credentials & ZK Proofs').first()).toBeVisible();

    // Switch to ZK-SNARK Proof Verification tab
    const zkTab = page.locator('button:has-text("ZK-SNARK Proof Verification")');
    await expect(zkTab).toBeVisible();
    await zkTab.click();

    await expect(page.locator('text=Groth16 Zero-Knowledge Verification').first()).toBeVisible();

    // Click Load Sample Proof if present
    const loadSampleBtn = page.locator('button:has-text("Load Sample")');
    if (await loadSampleBtn.isVisible()) {
      await loadSampleBtn.click();
    }

    // Click Verify ZK-SNARK Proof
    const verifyBtn = page.locator('button:has-text("Verify ZK-SNARK Proof")');
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    // Verification result should display
    await expect(page.locator('text=Cryptographically Authentic')).toBeVisible({ timeout: 10000 });
  });

  test('Demonstration Scenario 5: Tampering Defense on Public Verification Portal', async ({ page }) => {
    await page.goto('/verify');

    // Switch to ZK-SNARK Proof Verification tab
    await page.click('button:has-text("ZK-SNARK Proof Verification")');

    // Set a tampered payload with invalid proof points
    const textarea = page.locator('textarea');
    await textarea.fill(JSON.stringify({
      publicSignals: ["12345", "900", "67890", "11111"],
      proof: {
        pi_a: ["1", "2", "1"],
        pi_b: [["1", "2"], ["3", "4"], ["1", "0"]],
        pi_c: ["5", "6", "1"],
        protocol: "groth16"
      }
    }));

    // Click Verify ZK-SNARK Proof
    await page.click('button:has-text("Verify ZK-SNARK Proof")');

    // Verify cryptographic rejection is shown
    await expect(page.locator('text=Groth16 mathematical pairing verification failed: Invalid or tampered proof')).toBeVisible({ timeout: 10000 });
  });

  test('Demonstration Scenario 6: Platform Administrator Governance Portal', async ({ page }) => {
    await page.goto('/admin/overview');

    // Check Admin Overview metrics
    await expect(page.locator('text=Approved Institutions').first()).toBeVisible();
    await expect(page.locator('text=Pending Approvals').first()).toBeVisible();

    // Check Institutions Governance
    await page.goto('/admin/institutions');
    await expect(page.locator('text=Institution Registry').first()).toBeVisible();
    await expect(page.locator('text=Jadavpur University').first()).toBeVisible();
  });
});
