// Quantum circuit simulator supporting up to 8 qubits
export type Complex = { real: number; imag: number }
export type QuantumState = Complex[]
export type QuantumGate = Complex[][]

// Complex number operations
export const complex = {
  add: (a: Complex, b: Complex): Complex => ({
    real: a.real + b.real,
    imag: a.imag + b.imag,
  }),
  multiply: (a: Complex, b: Complex): Complex => ({
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real,
  }),
  magnitude: (c: Complex): number => Math.sqrt(c.real * c.real + c.imag * c.imag),
  phase: (c: Complex): number => Math.atan2(c.imag, c.real),
}

// Initialize quantum state |00...0⟩
export function initializeQuantumState(numQubits: number): QuantumState {
  const stateSize = Math.pow(2, numQubits)
  const state: QuantumState = new Array(stateSize).fill(null).map(() => ({ real: 0, imag: 0 }))
  state[0] = { real: 1, imag: 0 } // |00...0⟩ state
  return state
}

// Quantum gates as matrices
export const gates = {
  // Pauli-X (NOT gate)
  X: [
    [
      { real: 0, imag: 0 },
      { real: 1, imag: 0 },
    ],
    [
      { real: 1, imag: 0 },
      { real: 0, imag: 0 },
    ],
  ] as QuantumGate,

  // Pauli-Y gate
  Y: [
    [
      { real: 0, imag: 0 },
      { real: 0, imag: -1 },
    ],
    [
      { real: 0, imag: 1 },
      { real: 0, imag: 0 },
    ],
  ] as QuantumGate,

  // Pauli-Z gate
  Z: [
    [
      { real: 1, imag: 0 },
      { real: 0, imag: 0 },
    ],
    [
      { real: 0, imag: 0 },
      { real: -1, imag: 0 },
    ],
  ] as QuantumGate,

  // Hadamard gate
  H: [
    [
      { real: 1 / Math.sqrt(2), imag: 0 },
      { real: 1 / Math.sqrt(2), imag: 0 },
    ],
    [
      { real: 1 / Math.sqrt(2), imag: 0 },
      { real: -1 / Math.sqrt(2), imag: 0 },
    ],
  ] as QuantumGate,

  // Identity gate
  I: [
    [
      { real: 1, imag: 0 },
      { real: 0, imag: 0 },
    ],
    [
      { real: 0, imag: 0 },
      { real: 1, imag: 0 },
    ],
  ] as QuantumGate,
}

// Apply single-qubit gate to specific qubit
export function applySingleQubitGate(
  state: QuantumState,
  gate: QuantumGate,
  targetQubit: number,
  numQubits: number,
): QuantumState {
  const newState: QuantumState = new Array(state.length).fill(null).map(() => ({ real: 0, imag: 0 }))

  for (let i = 0; i < state.length; i++) {
    const targetBit = (i >> (numQubits - 1 - targetQubit)) & 1
    const flippedIndex = i ^ (1 << (numQubits - 1 - targetQubit))

    // Apply gate matrix
    const amp0 = complex.multiply(gate[targetBit][0], state[targetBit === 0 ? i : flippedIndex])
    const amp1 = complex.multiply(gate[targetBit][1], state[targetBit === 1 ? i : flippedIndex])

    newState[i] = complex.add(newState[i], complex.add(amp0, amp1))
  }

  return newState
}

// Apply CNOT gate
export function applyCNOTGate(
  state: QuantumState,
  controlQubit: number,
  targetQubit: number,
  numQubits: number,
): QuantumState {
  const newState: QuantumState = [...state]

  for (let i = 0; i < state.length; i++) {
    const controlBit = (i >> (numQubits - 1 - controlQubit)) & 1
    const targetBit = (i >> (numQubits - 1 - targetQubit)) & 1

    if (controlBit === 1) {
      const flippedIndex = i ^ (1 << (numQubits - 1 - targetQubit))
      const temp = newState[i]
      newState[i] = newState[flippedIndex]
      newState[flippedIndex] = temp
    }
  }

  return newState
}

// Measure qubit and collapse state
export function measureQubit(
  state: QuantumState,
  qubit: number,
  numQubits: number,
): { result: 0 | 1; newState: QuantumState } {
  let prob0 = 0
  let prob1 = 0

  // Calculate probabilities
  for (let i = 0; i < state.length; i++) {
    const bit = (i >> (numQubits - 1 - qubit)) & 1
    const probability = complex.magnitude(state[i]) ** 2

    if (bit === 0) prob0 += probability
    else prob1 += probability
  }

  // Random measurement outcome
  const result = Math.random() < prob0 ? 0 : 1
  const newState: QuantumState = new Array(state.length).fill(null).map(() => ({ real: 0, imag: 0 }))

  // Collapse state
  const norm = Math.sqrt(result === 0 ? prob0 : prob1)
  for (let i = 0; i < state.length; i++) {
    const bit = (i >> (numQubits - 1 - qubit)) & 1
    if (bit === result) {
      newState[i] = {
        real: state[i].real / norm,
        imag: state[i].imag / norm,
      }
    }
  }

  return { result, newState }
}

// Get probability distribution
export function getProbabilities(state: QuantumState): number[] {
  return state.map((amplitude) => complex.magnitude(amplitude) ** 2)
}

// Format quantum state for display
export function formatQuantumState(state: QuantumState, numQubits: number): string {
  const terms: string[] = []

  for (let i = 0; i < state.length; i++) {
    const amplitude = state[i]
    const magnitude = complex.magnitude(amplitude)

    if (magnitude > 1e-10) {
      // Only show significant amplitudes
      const binaryState = i.toString(2).padStart(numQubits, "0")
      const phase = complex.phase(amplitude)

      let amplitudeStr = ""
      if (Math.abs(amplitude.real) > 1e-10 && Math.abs(amplitude.imag) > 1e-10) {
        amplitudeStr = `(${amplitude.real.toFixed(3)}${amplitude.imag >= 0 ? "+" : ""}${amplitude.imag.toFixed(3)}i)`
      } else if (Math.abs(amplitude.real) > 1e-10) {
        amplitudeStr = amplitude.real.toFixed(3)
      } else if (Math.abs(amplitude.imag) > 1e-10) {
        amplitudeStr = `${amplitude.imag.toFixed(3)}i`
      }

      terms.push(`${amplitudeStr}|${binaryState}⟩`)
    }
  }

  return terms.length > 0 ? terms.join(" + ") : "|00...0⟩"
}
