const fs = require('fs');
const path = require('path');

function generateManifest() {
    const docsPath = path.join(__dirname, 'docs');
    const manifest = {};
    
    function scanDirectoryRecursively(dirPath, relativePath = '') {
        const files = [];
        
        if (!fs.existsSync(dirPath)) {
            console.log(`⚠️  Directory not found: ${dirPath}`);
            return [];
        }
        
        const items = fs.readdirSync(dirPath);
        console.log(`📂 Scanning ${dirPath}:`, items);
        
        items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isFile() && item.endsWith('.md')) {
                const relativeFilePath = relativePath ? 
                    path.join(relativePath, item).replace(/\\/g, '/') : 
                    item;
                const fullPath = relativePath ? 
                    `docs/${relativeFilePath}` : 
                    `docs/${item}`;
                
                files.push({
                    name: formatFileName(item),
                    file: fullPath,
                    description: extractDescription(itemPath)
                });
                
                console.log(`  📄 Found: ${item} -> ${fullPath}`);
            }
        });
        
        return files.sort((a, b) => {
            // Sort Introduction/README first, then alphabetically
            if (a.file.includes('Introduction') || a.file.includes('README')) return -1;
            if (b.file.includes('Introduction') || b.file.includes('README')) return 1;
            return a.name.localeCompare(b.name);
        });
    }
    
    function discoverDirectories(basePath) {
        const directories = [];
        
        // Add root docs directory
        directories.push({ path: '', section: '1 Getting Started' });
        
        // Scan for subdirectories
        if (fs.existsSync(basePath)) {
            const items = fs.readdirSync(basePath);
            
            items.forEach(item => {
                const itemPath = path.join(basePath, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    // Convert directory name to section name
                    const sectionName = formatDirectoryName(item);
                    directories.push({ path: item, section: sectionName });
                    console.log(`📁 Found directory: ${item} -> ${sectionName}`);
                }
            });
        }
        
        return directories;
    }
    
    function formatDirectoryName(dirName) {
        return dirName
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
    }
    
    function formatFileName(fileName) {
        return fileName
            .replace('.md', '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
    }
    
    function extractDescription(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n').slice(0, 20); // Check first 20 lines
            
            // Look for description patterns
            for (const line of lines) {
                const trimmed = line.trim();
                
                // Skip markdown headers, empty lines, and code blocks
                if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('```') || 
                    trimmed.startsWith('//') || trimmed.startsWith('<!--') || 
                    trimmed.startsWith('---') || trimmed.startsWith('*') ||
                    trimmed.startsWith('-') || trimmed.startsWith('>')) {
                    continue;
                }
                
                // Found a substantial line - use as description
                if (trimmed.length > 20) {
                    return trimmed.length > 120 ? 
                        trimmed.substring(0, 117) + '...' : 
                        trimmed;
                }
            }
            
            return 'Documentation page';
        } catch (error) {
            console.warn(`Could not read ${filePath}:`, error.message);
            return 'Documentation page';
        }
    }
    
    console.log('🔍 Starting dynamic directory scan...\n');
    
    // Discover all directories dynamically
    const directories = discoverDirectories(docsPath);
    console.log(`� Found ${directories.length} directories to scan\n`);
    
    directories.forEach(({ path: dirName, section }) => {
        const dirPath = dirName === '' ? docsPath : path.join(docsPath, dirName);
        const files = scanDirectoryRecursively(dirPath, dirName);
        
        if (files.length > 0) {
            manifest[section] = files;
            console.log(`✅ ${section}: ${files.length} files found`);
        } else {
            console.log(`📂 ${section}: Directory exists but no markdown files found`);
            // Only add sections that have files or are directories that exist
            if (fs.existsSync(dirPath)) {
                manifest[section] = [];
            }
        }
    });
    
    // Write manifest file
    const manifestPath = path.join(docsPath, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log('\n✅ Manifest generated successfully!');
    console.log(`📄 Manifest saved to: ${manifestPath}`);
    console.log(`📊 Summary: ${Object.keys(manifest).length} sections found\n`);
    
    // Detailed summary
    Object.entries(manifest).forEach(([section, files]) => {
        console.log(`📁 ${section}:`);
        if (files.length === 0) {
            console.log('   📂 Directory exists but no markdown files found');
        } else {
            files.forEach(file => {
                console.log(`   📄 ${file.name}`);
                console.log(`      Path: ${file.file}`);
                console.log(`      Description: ${file.description}\n`);
            });
        }
    });
    
    return manifest;
}

// Run the script
if (require.main === module) {
    try {
        generateManifest();
    } catch (error) {
        console.error('❌ Error generating manifest:', error);
        process.exit(1);
    }
}

module.exports = { generateManifest };