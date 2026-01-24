declare module 'v8-coverage' {
  export const v8Coverage: {
    dumpCoverage: () => Promise<any[]>
  }
}
