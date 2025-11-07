# Printer Utilities for macOS

A comprehensive set of utilities for discovering and printing to USB-connected printers on macOS.

## Features

- 🔍 **Discover Printers**: Search for all available printers or filter by USB connection
- 🖨️ **Print Images**: Print from file paths OR Buffers with customizable options (copies, media size, grayscale, etc.)
- 💾 **Buffer Support**: Print directly from memory - perfect for AI-generated images or API responses
- ℹ️ **Printer Info**: Get detailed information about printer capabilities
- 📊 **Job Management**: Check print job status and cancel jobs
- 🎯 **Type-Safe**: Full TypeScript support with comprehensive types

## Installation

The utilities use native macOS CUPS commands, so no additional dependencies are required beyond Node.js.

## Quick Start

```typescript
import { getAllPrinters, printToUSB } from "./src/print.ts";

// Find all printers
const printers = await getAllPrinters();
console.log("Available printers:", printers);

// Print from file path
const result = await printToUSB("./my-image.png", {
  copies: 1,
  fitToPage: true,
});
console.log(`Printed to ${result.printerName}`);

// Or print from Buffer (useful for AI-generated images!)
const imageBuffer = Buffer.from(base64Data, "base64");
await printToUSB(imageBuffer, { fitToPage: true });
```

## API Reference

### Types

#### `Printer`

```typescript
interface Printer {
  name: string; // Printer name as registered in CUPS
  uri: string; // Device URI (e.g., usb://...)
  status: string; // Current status (idle, printing, etc.)
  isDefault: boolean; // Whether this is the default printer
  isUSB: boolean; // Whether connected via USB
  description?: string; // Additional description
}
```

#### `PrintOptions`

```typescript
interface PrintOptions {
  copies?: number; // Number of copies (default: 1)
  media?: string; // Media size (e.g., 'Letter', '4x6')
  grayscale?: boolean; // Print in grayscale
  fitToPage?: boolean; // Scale image to fit page
  cupOptions?: Record<string, string>; // Additional CUPS options
}
```

### Functions

#### `getAllPrinters()`

Get a list of all available printers.

```typescript
const printers = await getAllPrinters();
```

**Returns**: `Promise<Printer[]>`

---

#### `getUSBPrinters()`

Get only USB-connected printers.

```typescript
const usbPrinters = await getUSBPrinters();
```

**Returns**: `Promise<Printer[]>`

---

#### `printImage(printerName, imagePathOrBuffer, options?)`

Print an image to a specific printer.

```typescript
// Option 1: Print from file path
const jobId1 = await printImage("MyPrinter", "./image.png", {
  copies: 2,
  fitToPage: true,
  grayscale: true,
});

// Option 2: Print from Buffer (useful for in-memory images)
const imageBuffer = await readFile("./image.png");
const jobId2 = await printImage("MyPrinter", imageBuffer, {
  copies: 1,
  fitToPage: true,
});
```

**Parameters**:

- `printerName` (string): Name of the printer
- `imagePathOrBuffer` (string | Buffer): Path to the image file OR a Buffer containing image data
- `options` (PrintOptions, optional): Print options

**Returns**: `Promise<string>` - Job ID

**Supported Formats**: PNG, JPG, JPEG, GIF, PDF, TIFF

**Note**: When using a Buffer, the image is temporarily written to the system temp directory and automatically cleaned up after printing.

---

#### `printToUSB(imagePathOrBuffer, options?)`

Print to the first available USB printer (or default if USB).

```typescript
// From file path
const result1 = await printToUSB("./image.png", {
  copies: 1,
});

// From Buffer
const imageBuffer = Buffer.from(base64Data, "base64");
const result2 = await printToUSB(imageBuffer, {
  copies: 1,
  fitToPage: true,
});
```

**Parameters**:

- `imagePathOrBuffer` (string | Buffer): Path to the image file OR a Buffer containing image data
- `options` (PrintOptions, optional): Print options

**Returns**: `Promise<{ printerName: string; jobId: string }>`

---

#### `getPrinterInfo(printerName)`

Get detailed information about a printer's capabilities.

```typescript
const info = await getPrinterInfo("MyPrinter");
console.log(info);
```

**Returns**: `Promise<string>` - Detailed printer information

---

#### `getAvailableMediaSizes(printerName)`

Get available media/paper sizes for a printer.

```typescript
const sizes = await getAvailableMediaSizes("MyPrinter");
// ['Letter', 'Legal', 'A4', '4x6', ...]
```

**Returns**: `Promise<string[]>`

---

#### `getPrintJobStatus(jobId?)`

Get the status of print jobs.

```typescript
// Get all jobs
const allJobs = await getPrintJobStatus();

// Get specific job
const jobStatus = await getPrintJobStatus("123");
```

**Returns**: `Promise<string>`

---

#### `cancelPrintJob(jobId)`

Cancel a print job.

```typescript
await cancelPrintJob("123");
```

**Returns**: `Promise<void>`

## Examples

### Example 1: List All Printers

```typescript
import { getAllPrinters } from "./src/print.ts";

const printers = await getAllPrinters();

printers.forEach((printer) => {
  console.log(`${printer.name} - ${printer.isUSB ? "USB" : "Network"}`);
  if (printer.isDefault) console.log("  (Default)");
});
```

### Example 2: Print with Custom Options

```typescript
import { printImage } from "./src/print.ts";

const jobId = await printImage("Thermal_Printer", "./sticker.png", {
  copies: 5,
  media: "4x6",
  fitToPage: true,
  cupOptions: {
    "print-quality": "5", // High quality
    "orientation-requested": "3", // Landscape
  },
});

console.log(`Print job ${jobId} submitted`);
```

### Example 3: Print to First Available USB Printer

```typescript
import { printToUSB, getUSBPrinters } from "./src/print.ts";

try {
  const usbPrinters = await getUSBPrinters();

  if (usbPrinters.length === 0) {
    console.error("No USB printers found");
    process.exit(1);
  }

  const result = await printToUSB("./my-sticker.png", {
    fitToPage: true,
  });

  console.log(`✅ Printed to ${result.printerName}`);
} catch (error) {
  console.error("Print failed:", error);
}
```

### Example 4: Print from Buffer (In-Memory Images)

```typescript
import { readFile } from "node:fs/promises";
import { printToUSB } from "./src/print.ts";

// Example 1: Read existing file into buffer
const imageBuffer = await readFile("./my-image.png");
const result = await printToUSB(imageBuffer, {
  fitToPage: true,
});

console.log(`✅ Printed from buffer to ${result.printerName}`);

// Example 2: AI-generated image (no disk I/O needed!)
const aiResponse = await fetch("https://api.example.com/generate-image");
const imageData = Buffer.from(await aiResponse.arrayBuffer());

await printToUSB(imageData, {
  copies: 1,
  fitToPage: true,
});

// Example 3: Base64 image data
const base64Image = "iVBORw0KGgoAAAANSUhEUgAA...";
const buffer = Buffer.from(base64Image, "base64");

await printToUSB(buffer);
```

### Example 5: Monitor Print Job

```typescript
import { printImage, getPrintJobStatus } from "./src/print.ts";

const jobId = await printImage("MyPrinter", "./image.png");

// Poll job status
const interval = setInterval(async () => {
  const status = await getPrintJobStatus(jobId);
  console.log(status);

  if (status.includes("completed") || status.includes("no entries")) {
    clearInterval(interval);
    console.log("Print job completed!");
  }
}, 2000);
```

## Common Media Sizes

- `Letter` - 8.5" x 11"
- `Legal` - 8.5" x 14"
- `A4` - 210mm x 297mm
- `4x6` - 4" x 6" (common for stickers)
- `Custom.WIDTHxHEIGHT` - Custom size (e.g., `Custom.100x150mm`)

## Error Handling

All functions throw descriptive errors that can be caught:

```typescript
try {
  await printImage("NonExistentPrinter", "./image.png");
} catch (error) {
  console.error("Print failed:", error.message);
  // Handle error appropriately
}
```

Common errors:

- `Printer not found` - The specified printer doesn't exist
- `No USB printers found` - No USB printers are connected
- `File not found` - The image file doesn't exist
- `Unsupported file format` - The file format is not supported

## Troubleshooting

### No printers found

1. Check that your printer is connected and powered on
2. Verify the printer is added to macOS System Settings > Printers & Scanners
3. Run `lpstat -p -d` in terminal to see if CUPS recognizes the printer

### Print job not starting

1. Check printer queue: `lpq`
2. Check for error messages: `lpstat -p -d`
3. Ensure the printer is not paused: `cupsenable PrinterName`

### Image not printing correctly

1. Try using `fitToPage: true` option
2. Check available media sizes with `getAvailableMediaSizes()`
3. Ensure the image format is supported

## Running the Example

```bash
# View available printers and capabilities
pnpm run print:example

# Or directly
node src/print-example.ts
```

## Integration with Image Generation

This pairs perfectly with the image generation code in `index.ts`:

```typescript
import { generate } from "./index.js";
import { printToUSB } from "./src/print.ts";

// Generate image
const imagePath = await generate("a cool sticker design");

// Print it immediately
await printToUSB(imagePath, {
  fitToPage: true,
  copies: 1,
});
```

## Notes

- These utilities use macOS's CUPS (Common Unix Printing System)
- Works with any printer that's properly configured in macOS
- USB detection is based on the printer's device URI containing "usb"
- Some advanced printer features may require specific CUPS options
