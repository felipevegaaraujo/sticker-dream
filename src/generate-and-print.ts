/**
 * Example: Generate AI images and print them directly
 * Combines the image generation from index.ts with the printing utilities
 */

import { GoogleGenAI } from "@google/genai";
import { writeFile } from 'node:fs/promises';
import { printToUSB, getUSBPrinters } from './print.ts';

const ai = new GoogleGenAI({
  apiKey: process.env["GEMINI_API_KEY"],
});

/**
 * Generate an image using Imagen AI
 * @param prompt The image generation prompt
 * @param saveFile Whether to save the image to disk (default: true)
 * @returns Object with buffer and optional filename
 */
async function generateImage(
  prompt: string,
  saveFile: boolean = true
): Promise<{ buffer: Buffer; filename?: string } | null> {
  console.log(`🎨 Generating image: "${prompt}"`);
  console.time('generation');

  const response = await ai.models.generateImages({
    model: "imagen-4.0-generate-001",
    prompt: `A black and white kids coloring page.
    <image-description>
    ${prompt}
    </image-description>
    ${prompt}`,
    config: {
      numberOfImages: 1,
    },
  });

  console.timeEnd('generation');

  if (!response.generatedImages || response.generatedImages.length === 0) {
    console.error('No images generated');
    return null;
  }

  const generatedImage = response.generatedImages[0];
  const imgBytes = generatedImage.image?.imageBytes;

  if (!imgBytes) {
    console.error('No image bytes returned');
    return null;
  }

  const buffer = Buffer.from(imgBytes, "base64");

  let filename: string | undefined;
  if (saveFile) {
    filename = `output/imagen-${Date.now()}.png`;
    await writeFile(filename, buffer);
    console.log(`✅ Image saved: ${filename}`);
  } else {
    console.log(`✅ Image generated (not saved to disk)`);
  }

  return { buffer, filename };
}

/**
 * Main function: Generate and print
 */
async function main() {
  const prompt = "Wes Bos teaching coding";
  const shouldSave = true;
  const shouldPrint = true;

  try {
    // Check for USB printers first if we're going to print

      console.log('🔍 Checking for USB printers...');
      const usbPrinters = await getUSBPrinters();

      if (usbPrinters.length === 0) {
        console.warn('⚠️  No USB printers found. Image will be generated but not printed.');
        console.log('   Connect a USB printer or use --no-print flag.\n');
      } else {
        console.log(`✅ Found ${usbPrinters.length} USB printer(s):`);
        usbPrinters.forEach(p => console.log(`   - ${p.name}`));
        console.log('');
      }

    // Generate the image
    const result = await generateImage(prompt, shouldSave);

    if (!result) {
      console.error('❌ Failed to generate image');
      process.exit(1);
    }

    // Print if requested and printers available
    if (shouldPrint) {
      const usbPrinters = await getUSBPrinters();

      if (usbPrinters.length > 0) {
        console.log('\n🖨️  Printing image...');

        // Print directly from buffer (no need to save to disk first!)
        const printResult = await printToUSB(result.buffer, {
          fitToPage: true,
          copies: 1
        });

        console.log(`✅ Print job submitted to ${printResult.printerName}`);
        console.log(`   Job ID: ${printResult.jobId}`);

        if (!shouldSave) {
          console.log(`   (Image printed directly from memory - not saved to disk)`);
        }
      }
    } else {
      if (shouldSave && result.filename) {
        console.log(`\n📁 Image generated and saved (printing skipped)`);
      } else {
        console.log(`\n📁 Image generated in memory (printing skipped)`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();

