/**
 * File upload mocking utilities
 * Provides comprehensive mocking for file upload functionality testing
 */

/**
 * Creates a mock File object for testing
 */
export function createMockFile(
  name: string,
  content: string = 'mock file content',
  type: string = 'application/octet-stream',
  size?: number
): File {
  const blob = new Blob([content], { type })
  const file = new File([blob], name, { type })
  
  // Override size if specified
  if (size !== undefined) {
    Object.defineProperty(file, 'size', {
      value: size,
      writable: false
    })
  }
  
  return file
}

/**
 * Creates a mock FileList for testing
 */
export function createMockFileList(files: File[]): FileList {
  const fileList = {
    length: files.length,
    item: (index: number) => files[index] || null,
    [Symbol.iterator]: function* () {
      for (const file of files) {
        yield file
      }
    }
  }
  
  // Add files as indexed properties
  files.forEach((file, index) => {
    Object.defineProperty(fileList, index, {
      value: file,
      enumerable: true
    })
  })
  
  return fileList as FileList
}

/**
 * Creates mock 3D printer files for testing
 */
export const create3DPrinterFiles = {
  validGcode: () => createMockFile('test-model.gcode', 'G28 ; home all axes\nG1 Z5 F3000', 'text/plain', 1024),
  validStl: () => createMockFile('test-model.stl', 'STL binary data...', 'application/octet-stream', 2048),
  invalidFile: () => createMockFile('document.pdf', 'PDF content', 'application/pdf', 5120),
  largeFile: () => createMockFile('large-model.stl', 'Large STL data...', 'application/octet-stream', 50 * 1024 * 1024), // 50MB
  emptyFile: () => createMockFile('empty.gcode', '', 'text/plain', 0)
}

/**
 * Mock drag and drop events for testing
 */
export function createMockDragEvent(
  type: 'dragover' | 'dragenter' | 'dragleave' | 'drop',
  files: File[] = []
): DragEvent {
  const dataTransfer = {
    files: createMockFileList(files),
    items: files.map(file => ({
      kind: 'file',
      type: file.type,
      getAsFile: () => file
    })),
    types: files.map(file => file.type),
    effectAllowed: 'copy' as const,
    dropEffect: 'copy' as const,
    clearData: vi.fn(),
    getData: vi.fn(),
    setData: vi.fn(),
    setDragImage: vi.fn()
  }
  
  const event = new Event(type) as DragEvent
  Object.defineProperty(event, 'dataTransfer', {
    value: dataTransfer,
    enumerable: true
  })
  
  // Add preventDefault and stopPropagation
  event.preventDefault = vi.fn()
  event.stopPropagation = vi.fn()
  
  return event
}

/**
 * Mock input change event for file selection
 */
export function createMockInputChangeEvent(files: File[]): Event & { target: HTMLInputElement } {
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = files.length > 1
  
  Object.defineProperty(input, 'files', {
    value: createMockFileList(files),
    writable: false
  })
  
  const event = new Event('change', { bubbles: true })
  Object.defineProperty(event, 'target', {
    value: input,
    enumerable: true
  })
  
  return event as Event & { target: HTMLInputElement }
}

/**
 * File upload test scenarios
 */
export const fileUploadScenarios = {
  /**
   * Valid single file upload
   */
  singleValidFile: () => ({
    files: [create3DPrinterFiles.validGcode()],
    expected: {
      accepted: 1,
      rejected: 0,
      totalSize: 1024
    }
  }),
  
  /**
   * Multiple valid files
   */
  multipleValidFiles: () => ({
    files: [
      create3DPrinterFiles.validGcode(),
      create3DPrinterFiles.validStl()
    ],
    expected: {
      accepted: 2,
      rejected: 0,
      totalSize: 3072
    }
  }),
  
  /**
   * Mixed valid and invalid files
   */
  mixedFiles: () => ({
    files: [
      create3DPrinterFiles.validGcode(),
      create3DPrinterFiles.invalidFile(),
      create3DPrinterFiles.validStl()
    ],
    expected: {
      accepted: 2,
      rejected: 1,
      totalSize: 3072
    }
  }),
  
  /**
   * File too large
   */
  fileTooLarge: () => ({
    files: [create3DPrinterFiles.largeFile()],
    expected: {
      accepted: 0,
      rejected: 1,
      error: 'File too large'
    }
  }),
  
  /**
   * Empty file
   */
  emptyFile: () => ({
    files: [create3DPrinterFiles.emptyFile()],
    expected: {
      accepted: 0,
      rejected: 1,
      error: 'File is empty'
    }
  })
}

/**
 * File upload test utilities
 */
export class FileUploadTestUtils {
  /**
   * Simulate file selection via input
   */
  static async selectFiles(input: HTMLInputElement, files: File[]) {
    const event = createMockInputChangeEvent(files)
    input.dispatchEvent(event)
  }
  
  /**
   * Simulate drag and drop
   */
  static async simulateDrop(element: Element, files: File[]) {
    // Simulate drag events sequence
    element.dispatchEvent(createMockDragEvent('dragenter', files))
    element.dispatchEvent(createMockDragEvent('dragover', files))
    element.dispatchEvent(createMockDragEvent('drop', files))
  }
  
  /**
   * Simulate drag hover
   */
  static async simulateDragHover(element: Element, files: File[]) {
    element.dispatchEvent(createMockDragEvent('dragenter', files))
    element.dispatchEvent(createMockDragEvent('dragover', files))
  }
  
  /**
   * Simulate drag leave
   */
  static async simulateDragLeave(element: Element) {
    element.dispatchEvent(createMockDragEvent('dragleave'))
  }
  
  /**
   * Assert file upload results
   */
  static assertUploadResults(
    actualFiles: File[],
    expected: { accepted: number; rejected: number; totalSize?: number }
  ) {
    expect(actualFiles).toHaveLength(expected.accepted)
    
    if (expected.totalSize) {
      const totalSize = actualFiles.reduce((sum, file) => sum + file.size, 0)
      expect(totalSize).toBe(expected.totalSize)
    }
  }
  
  /**
   * Create file reader mock for testing file content
   */
  static mockFileReader(result: string | ArrayBuffer | null = 'mock result') {
    const mockFileReader = {
      readAsText: vi.fn(),
      readAsDataURL: vi.fn(),
      readAsArrayBuffer: vi.fn(),
      result,
      error: null,
      onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
      onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
      onprogress: null as ((event: ProgressEvent<FileReader>) => void) | null,
      abort: vi.fn(),
      DONE: 2,
      EMPTY: 0,
      LOADING: 1,
      readyState: 2,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }
    
    // Simulate async file reading
    mockFileReader.readAsText.mockImplementation(() => {
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({} as ProgressEvent<FileReader>)
        }
      }, 10)
    })
    
    // Mock FileReader constructor
    vi.stubGlobal('FileReader', vi.fn(() => mockFileReader))
    
    return mockFileReader
  }
}