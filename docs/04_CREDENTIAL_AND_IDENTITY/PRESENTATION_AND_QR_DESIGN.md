# PRESENTATION_AND_QR_DESIGN.md — Selective Disclosure, Presentations & QR Architecture

> **Document ID**: DOC-CRED-004  
> **Status**: Confirmed Technical Specification

---

## 1. Golden Architectural Rule: No PII in QR Payloads

> **CRITICAL SECURITY REQUIREMENT**: Under NO circumstances may a student's full academic record, transcript, student ID, date of birth, or plaintext CGPA be encoded directly into the payload of a QR code.

Embedding academic records directly in physical or screen QR codes creates catastrophic privacy vulnerabilities:
- Anyone taking a photo or screenshot of the QR code immediately captures the student's complete academic and personal history.
- The student loses all custody and selective disclosure rights over their data once the QR code is scanned.

---

## 2. Opaque Ephemeral Presentation Architecture

VERICRED resolves this via **Opaque Ephemeral Verifiable Presentations**:

```mermaid
flowchart LR
    subgraph Student_Wallet ["Student Sovereign Wallet"]
        VC[Full Verifiable Credential] --> Select[Selective Disclosure Mask]
        Select --> GenVP[Generate Ephemeral VP]
        GenVP --> Nonce[Inject 128-bit Nonce & 15m TTL]
    end

    subgraph QR_Rendering ["Screen / Paper QR Code"]
        QR["QR Payload: https://vericred.net/verify/p/pres-7777-8888-9999-000011112222#token=..."]
    end

    subgraph Verification_Portal ["Public Verification Portal"]
        Scan[Camera Scans QR] --> Fetch[Query Presentation by Opaque ID]
        Fetch --> CheckNonce[Verify Nonce Freshness & TTL in Redis]
        CheckNonce --> Consume[Consume Nonce (Prevent Replay)]
    end

    Student_Wallet --> QR
    QR --> Verification_Portal
```

---

## 3. QR Payload Format

The QR code encodes exclusively an HTTPS URI with an opaque presentation identifier and an ephemeral cryptographic access token:

$$\mathbf{https://vericred.net/verify/p/7f9a2b8e-3c4d-4e5f-a6b7-8c9d0e1f2a3b\#key=e9b8...}$$

### Payload Attributes
- **Base Domain**: `https://vericred.net/verify/p/`
- **Presentation ID (`UUIDv4`)**: Opaque pointer stored in Redis and PostgreSQL.
- **Fragment Identifier (`#key=...`)**: Client-side AES-GCM decryption key. The fragment is never transmitted across the network to backend servers (RFC 3986), ensuring end-to-end client confidentiality.

---

## 4. Replay Protection & Nonce Invalidation

1. **Ephemeral TTL**: Presentations expire automatically after **15 minutes** ($\text{TTL} = 900\,\text{seconds}$).
2. **One-Time Nonce Consumption**:
   - Each presentation is bound to a single-use random 128-bit cryptographic nonce ($N$).
   - Upon initial scan and verification, the backend marks the nonce as consumed:
     ```typescript
     const isConsumed = await redis.set(`nonce:${nonce}`, 'consumed', 'EX', 900, 'NX');
     if (!isConsumed) {
       throw new ApiError('REPLAY_ATTACK_DETECTED', 'Presentation nonce already consumed');
     }
     ```
   - Attempting to re-verify an intercepted screenshot yields an immediate `410 Gone / NONCE_EXPIRED` error.

---

## 5. Selective Disclosure Masking

Students maintain granular control over which claims are transmitted in a presentation:

```json
{
  "degreeName": true,
  "department": true,
  "graduationYear": true,
  "studentName": true,
  "cgpaRaw": false,
  "detailedMarks": false
}
```
If `cgpaRaw` is set to `false`, the presentation omits the raw numeric grade entirely, including only the cryptographic commitment ($C$) or the accompanying zero-knowledge proof of eligibility.
