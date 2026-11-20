import { test, expect } from '@playwright/test';

test.describe('VERICRED Frontend E2E Demonstration Scenarios 1–5', () => {
  test('Landing Page & Navigation to Demonstration Portals', async ({ page }) => {
    await page.goto('/');

    // Check header branding and navigation links
    await expect(page.locator('text=VERICRED')).toBeVisible();
    await expect(page.locator('text=Public Verification Portal')).toBeVisible();

    // Verify key architecture highlights on landing page
    await expect(page.locator('text=W3C Verifiable Credentials')).toBeVisible();
    await expect(page.locator('text=Zero-Knowledge Proofs')).toBeVisible();
    await expect(page.locator('text=Polygon Amoy Testnet')).toBeVisible();
  });

  test('Demonstration Scenario 1: Institution Dashboard & Credential Issuance UI', async ({ page }) => {
    await page.goto('/institution/dashboard');

    // Check dashboard shell
    await expect(page.locator('text=Institution Dashboard')).toBeVisible();
    await expect(page.locator('text=Single Credential Issuance')).toBeVisible();
    await expect(page.locator('text=CSV Bulk Issuance')).toBeVisible();

    // Navigate to single issuance form
    await page.click('text=Single Credential Issuance');
    await expect(page.locator('text=Issue Academic Credential')).toBeVisible();

    // Verify form input elements exist for academic claims
    await expect(page.locator('input[name="degreeName"]')).toBeVisible();
    await expect(page.locator('input[name="department"]')).toBeVisible();
    await expect(page.locator('input[name="cgpa"]')).toBeVisible();
    await expect(page.locator('input[name="graduationYear"]')).toBeVisible();
  });

  test('Demonstration Scenario 2: Student Sovereign Wallet & QR Presentation UI', async ({ page }) => {
    await page.goto('/student/wallet');

    // Check wallet header
    await expect(page.locator('text=Sovereign Credential Wallet')).toBeVisible();
    await expect(page.locator('text=Aarav Sen')).toBeVisible();

    // Verify academic credential card is rendered
    await expect(page.locator('text=Bachelor of Technology')).toBeVisible();
    await expect(page.locator('text=Computer Science and Engineering')).toBeVisible();

    // Verify presentation action buttons
    await expect(page.locator('button:has-text("Share QR Presentation")')).toBeVisible();
    await expect(page.locator('button:has-text("Generate ZK Proof")')).toBeVisible();

    // Open QR presentation modal
    await page.click('button:has-text("Share QR Presentation")');
    await expect(page.locator('text=Ephemeral Presentation QR')).toBeVisible();
    await expect(page.locator('text=15 Minutes')).toBeVisible();
  });

  test('Demonstration Scenario 3: Privacy-Preserving ZK Proof Generator Modal UI', async ({ page }) => {
    await page.goto('/student/wallet');

    // Open ZK proof modal
    await page.click('button:has-text("Generate ZK Proof")');
    await expect(page.locator('text=Generate Zero-Knowledge Eligibility Proof')).toBeVisible();

    // Verify threshold slider/input exists (e.g. 8.00)
    await expect(page.locator('text=Minimum CGPA Requirement')).toBeVisible();
    await expect(page.locator('input[type="range"], input[type="number"]')).toBeVisible();

    // Verify cryptographic privacy assurance statement
    await expect(
      page.locator('text=Your exact CGPA will remain hidden. Only mathematical proof that CGPA >= threshold is generated.')
    ).toBeVisible();
  });

  test('Demonstration Scenario 4: Public Verification Console Multi-Tab UI', async ({ page }) => {
    await page.goto('/verify');

    // Check verification portal header
    await expect(page.locator('text=Public Credential Verification Portal')).toBeVisible();

    // Verify the three distinct verification tabs
    await expect(page.locator('button:has-text("Standard QR Presentation")')).toBeVisible();
    await expect(page.locator('button:has-text("Offline JSON File")')).toBeVisible();
    await expect(page.locator('button:has-text("Zero-Knowledge Proof")')).toBeVisible();

    // Switch to Zero-Knowledge tab
    await page.click('button:has-text("Zero-Knowledge Proof")');
    await expect(page.locator('text=Groth16 Zero-Knowledge Verification')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="zkProof"], textarea[placeholder*="proof"]')).toBeVisible();
  });

  test('Demonstration Scenario 5: Revocation Status & Security Audit Visibility', async ({ page }) => {
    await page.goto('/verify');

    // Check on-chain integrity assurances
    await expect(page.locator('text=Revocation Registry')).toBeVisible();
    await expect(page.locator('text=Cryptographic Security Check')).toBeVisible();
  });
});
