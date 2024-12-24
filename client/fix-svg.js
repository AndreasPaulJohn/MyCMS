const fs = require('fs').promises;
const path = require('path');

async function fixSvgFiles(baseDir) {
    try {
        // Erweiterte Suchpfade einschließlich des Hauptpakets
        const searchPaths = [
            path.join(baseDir, 'node_modules', '@ckeditor'),
            path.join(baseDir, 'node_modules', '@ckeditor', 'ckeditor5-clipboard', 'node_modules', '@ckeditor'),
            path.join(baseDir, 'node_modules', 'ckeditor5', 'node_modules', '@ckeditor'), // Neuer Pfad
            path.join(baseDir, 'node_modules', 'ckeditor5', 'src', '@ckeditor') // Zusätzlicher möglicher Pfad
        ];

        for (const searchPath of searchPaths) {
            await processDirectory(searchPath);
        }
        console.log('SVG Cleaning completed successfully!');
    } catch (error) {
        console.error('Error during SVG cleaning:', error);
    }
}

async function processDirectory(directoryPath) {
    try {
        const entries = await fs.readdir(directoryPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directoryPath, entry.name);

            if (entry.isDirectory()) {
                await processDirectory(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.svg')) {
                await cleanSvgFile(fullPath);
            }
        }
    } catch (error) {
        // Ignoriere Fehler beim Lesen von nicht existierenden Verzeichnissen
        if (error.code !== 'ENOENT') {
            console.error(`Error processing directory ${directoryPath}:`, error);
        }
    }
}

async function cleanSvgFile(filePath) {
    try {
        let content = await fs.readFile(filePath, 'utf8');
        
        // Entferne alle Namespace-Attribute (xmlns:*)
        content = content.replace(/xmlns:[a-z]+="[^"]*"/g, '');
        
        // Entferne Namespace-Präfixe in Tags
        content = content.replace(/<\/?[a-z]+:/g, '<');
        
        // Zusätzliche Bereinigung für vecta.io Namespace
        content = content.replace(/v:(?![a-zA-Z])/g, 'v');
        
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`Cleaned ${filePath}`);
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
    }
}

// Starte die Bereinigung
const projectRoot = process.cwd();
fixSvgFiles(projectRoot);