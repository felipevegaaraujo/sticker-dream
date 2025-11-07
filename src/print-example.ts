/**
 * Example usage of the printer utilities
 * Run with: node --env-file=.env src/print-example.ts
 */

import {
  getAllPrinters,
  getUSBPrinters,
  printImage,
  printToUSB,
  getPrintJobStatus,
  getPrinterInfo,
  getAvailableMediaSizes,
  type PrintOptions
} from './print.ts';

async function main() {
  try {
    console.log('🔍 Searching for printers...\n');

    // Get all printers
    const allPrinters = await getAllPrinters();
    console.log('All available printers:');
    allPrinters.forEach(printer => {
      console.log(`  - ${printer.name}`);
      console.log(`    URI: ${printer.uri}`);
      console.log(`    Status: ${printer.status}`);
      console.log(`    Default: ${printer.isDefault ? 'Yes' : 'No'}`);
      console.log(`    USB: ${printer.isUSB ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Get USB printers only
    const usbPrinters = await getUSBPrinters();
    console.log(`\n🖨️  Found ${usbPrinters.length} USB printer(s):`);
    usbPrinters.forEach(printer => {
      console.log(`  - ${printer.name} (${printer.status})`);
    });

    if (usbPrinters.length === 0) {
      console.log('\n⚠️  No USB printers found. Make sure your printer is connected.');
      return;
    }

    // Get printer capabilities
    const firstPrinter = usbPrinters[0];
    console.log(`\n📋 Getting info for ${firstPrinter.name}...`);

    try {
      const mediaSizes = await getAvailableMediaSizes(firstPrinter.name);
      if (mediaSizes.length > 0) {
        console.log('Available media sizes:', mediaSizes.join(', '));
      }

      const printerInfo = await getPrinterInfo(firstPrinter.name);
      console.log('\nDetailed printer options:');
      console.log(printerInfo);
    } catch (error) {
      console.log('Could not get detailed printer info:', error);
    }

    // Example: Print an image
    // Uncomment the following to actually print:

    const imagePath = 'src/logo.png';

    console.log(`\n📄 Printing ${imagePath}...`);

    // Option 1: Print to a specific printer
    const options: PrintOptions = {
      copies: 1,
      fitToPage: true,
      grayscale: true
    };

    const jobId = await printImage(firstPrinter.name, imagePath, options);
    console.log(`✅ Print job submitted. Job ID: ${jobId}`);

    // Check job status
    const status = await getPrintJobStatus(jobId);
    console.log(`\nJob status:\n${status}`);

    // Option 2: Print to first available USB printer
    const result = await printToUSB(imagePath, options);
    console.log(`✅ Printed to ${result.printerName}, Job ID: ${result.jobId}`);


  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();

