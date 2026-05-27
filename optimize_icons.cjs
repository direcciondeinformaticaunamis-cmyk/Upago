const fs = require('fs');
const path = require('path');

const files = [
    'src/components/AcademicDashboard.tsx',
    'src/components/AdminFinanceDashboard.tsx',
    'src/components/MisDatosModule.tsx',
    'src/components/PostulanteDashboard.tsx',
    'src/components/StudentDashboard.tsx'
];

files.forEach(fileRelPath => {
    const fullPath = path.join(__dirname, fileRelPath);
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fileRelPath}`);
        return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Regex to match: import { ... } from '@mui/icons-material';
    const regex = /import\s+\{([^}]+)\}\s+from\s+'@mui\/icons-material';/g;
    
    let match;
    let modified = false;
    
    while ((match = regex.exec(content)) !== null) {
        const importBlock = match[0];
        const importsListStr = match[1];
        
        // Split by comma
        const items = importsListStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        const individualImports = items.map(item => {
            // Check if there is an alias like "Person as User"
            const aliasMatch = item.match(/^(\w+)\s+as\s+(\w+)$/);
            if (aliasMatch) {
                const iconName = aliasMatch[1];
                const localName = aliasMatch[2];
                return `import ${localName} from '@mui/icons-material/${iconName}';`;
            } else {
                const iconName = item;
                return `import ${iconName} from '@mui/icons-material/${iconName}';`;
            }
        });
        
        const replacement = individualImports.join('\n');
        content = content.replace(importBlock, replacement);
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Optimized icon imports in: ${fileRelPath}`);
    }
});
console.log("Optimization complete!");
