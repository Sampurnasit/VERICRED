pragma circom 2.1.8;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/eddsaposeidon.circom";

template CgpaThresholdValidator() {
    // Public Signals
    signal input commitment;
    signal input threshold;
    signal input issuerPubKeyX;
    signal input issuerPubKeyY;

    // Private Signals
    signal input scaledCgpa;
    signal input salt;
    signal input sigR8x;
    signal input sigR8y;
    signal input sigS;

    // Range Check: scaledCgpa <= 1000
    component rangeCheckCgpa = GreaterEqThan(14);
    rangeCheckCgpa.in[0] <== 1000;
    rangeCheckCgpa.in[1] <== scaledCgpa;
    rangeCheckCgpa.out === 1;

    // CGPA Eligibility Condition: scaledCgpa >= threshold
    component comp = GreaterEqThan(14);
    comp.in[0] <== scaledCgpa;
    comp.in[1] <== threshold;
    comp.out === 1;

    // Commitment Integrity Check: Poseidon(scaledCgpa, salt) == commitment
    component hasher = Poseidon(2);
    hasher.inputs[0] <== scaledCgpa;
    hasher.inputs[1] <== salt;
    hasher.out === commitment;

    // In-Circuit EdDSA Signature Verification
    component verifier = EdDSAPoseidonVerifier();
    verifier.enabled <== 1;
    verifier.Ax <== issuerPubKeyX;
    verifier.Ay <== issuerPubKeyY;
    verifier.R8x <== sigR8x;
    verifier.R8y <== sigR8y;
    verifier.S <== sigS;
    verifier.M <== commitment;
}

component main { public [ commitment, threshold, issuerPubKeyX, issuerPubKeyY ] } = CgpaThresholdValidator();
