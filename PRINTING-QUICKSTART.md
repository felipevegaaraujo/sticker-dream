# Printing Quick Start Guide

## 🚀 Quick Commands

```bash
# List all available printers
pnpm run print:example

# Demo printing from both file paths and Buffers
pnpm run print:buffer

# Generate an image and print it automatically
pnpm run gen:print "a dinosaur on a skateboard"

# Generate and print without saving to disk (Buffer mode!)
pnpm run gen:print "a cool sticker" --no-save

# Generate without printing
pnpm run gen:print "a cool sticker" --no-print
```

## 📁 What Was Added

### Core Utilities (`src/print.ts`)

The main printer utility module with these functions:

- **`getAllPrinters()`** - Find all printers
- **`getUSBPrinters()`** - Find USB printers only
- **`printImage(printer, path, options)`** - Print to specific printer
- **`printToUSB(path, options)`** - Print to first USB printer
- **`getPrinterInfo(printer)`** - Get printer details
- **`getAvailableMediaSizes(printer)`** - Get supported paper sizes
- **`getPrintJobStatus(jobId)`** - Check print job status
- **`cancelPrintJob(jobId)`** - Cancel a print job

### Example Files

1. **`src/print-example.ts`** - Demonstrates all printer utilities
2. **`src/print-buffer-example.ts`** - Shows Buffer vs file path printing
3. **`src/generate-and-print.ts`** - Generate AI images and print them
4. **`src/README-PRINTING.md`** - Complete API documentation

## 💡 Basic Usage in Your Code

```typescript
import { printToUSB, getUSBPrinters } from "./src/print.ts";

// Check for USB printers
const printers = await getUSBPrinters();
console.log(`Found ${printers.length} printer(s)`);

// Option 1: Print from file path
const result = await printToUSB("./my-image.png", {
  fitToPage: true,
  copies: 1,
});
console.log(`Printed to ${result.printerName}`);

// Option 2: Print from Buffer (great for AI images!)
const imageBuffer = Buffer.from(base64Data, "base64");
await printToUSB(imageBuffer, { fitToPage: true });
```

## 🎨 Print Options

```typescript
const options = {
  copies: 2, // Number of copies
  media: "4x6", // Paper size
  fitToPage: true, // Scale to fit
  grayscale: true, // Print in grayscale
  cupOptions: {
    // Advanced CUPS options
    "print-quality": "5",
  },
};

await printImage("MyPrinter", "./image.png", options);
```

## 🔧 Troubleshooting

**No printers found?**

- Check USB connection
- Verify printer is added in System Settings → Printers & Scanners
- Run: `lpstat -p -d` in terminal

**Image not printing?**

- Use `fitToPage: true` option
- Check supported media sizes
- Ensure printer is not paused

**Print job stuck?**

- Check queue: `lpq`
- Cancel job: `cancel <job-id>`
- Restart printer

## 📖 Full Documentation

See `src/README-PRINTING.md` for complete API documentation and examples.

## ✨ Supported Image Formats

- PNG
- JPG/JPEG
- GIF
- PDF
- TIFF/TIF

---

_Built for macOS using CUPS (Common Unix Printing System)_
