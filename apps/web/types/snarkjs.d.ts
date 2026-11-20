declare module 'snarkjs' {
  export const groth16: {
    fullProve(
      input: any,
      wasmFile: string,
      zkeyFile: string
    ): Promise<{ proof: any; publicSignals: string[] }>;
    verify(
      vKey: any,
      publicSignals: string[],
      proof: any
    ): Promise<boolean>;
  };
  export const zKey: any;
  export const powersOfTau: any;
}
