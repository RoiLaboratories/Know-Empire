const sharp = require('sharp');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

const publicDir = path.join(__dirname, '../public');
const tempDir = path.join(__dirname, '../temp');

// Image configurations
const images = [
    {
        input: 'group.svg',
        output: 'group.png',
        width: 1024,
        height: 1024,
        description: 'App Icon'
    },
    {
        input: 'group.svg', // Using group.svg as base for splash
        output: 'splash.png',
        width: 200,
        height: 200,
        description: 'Splash Image'
    },
    {
        input: 'hero.svg',
        output: 'hero.png',
        width: 1200,
        height: 630,
        description: 'Hero/OG Image'
    }
];

async function ensureTempDir() {
    try {
        await fs.mkdir(tempDir, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

async function convertSvgToPng(svgPath, pngPath) {
    return new Promise((resolve, reject) => {
        exec(`npx svgexport ${svgPath} ${pngPath}`, (error) => {
            if (error) reject(error);
            else resolve();
        });
    });
}

async function processImage(config) {
    const svgPath = path.join(publicDir, config.input);
    const tempPngPath = path.join(tempDir, `temp_${config.output}`);
    const finalPngPath = path.join(publicDir, config.output);

    console.log(`\nProcessing ${config.description}...`);
    console.log(`Converting ${config.input} to PNG...`);
    
    try {
        // Convert SVG to PNG first
        await convertSvgToPng(svgPath, tempPngPath);

        // Then resize using sharp
        console.log(`Resizing to ${config.width}x${config.height}...`);
        await sharp(tempPngPath)
            .resize(config.width, config.height, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            })
            .png()
            .toFile(finalPngPath);

        console.log(`✅ Successfully created ${config.output}`);
    } catch (error) {
        console.error(`❌ Error processing ${config.input}:`, error);
        throw error;
    }
}

async function cleanup() {
    try {
        await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

async function main() {
    try {
        await ensureTempDir();
        
        console.log('Starting image generation...');
        
        // Process all images in parallel
        await Promise.all(images.map(config => processImage(config)));
        
        console.log('\n✨ All images generated successfully!');
        console.log('\nGenerated files:');
        images.forEach(img => {
            console.log(`- ${img.output} (${img.width}x${img.height}) - ${img.description}`);
        });
    } catch (error) {
        console.error('\n❌ Error generating images:', error);
        process.exit(1);
    } finally {
        await cleanup();
    }
}

main();
