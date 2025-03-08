const fs = require('fs');
const path = require('path');

// Create thumbnails directory if it doesn't exist
const thumbnailsDir = path.join(__dirname, '..', 'public', 'thumbnails');
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Generate a simple SVG for each demo
const demos = [
  { name: 'sdf-demo', color: '#6366f1', icon: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-3.54-4.46a1 1 0 0 1 1.42-1.42 3 3 0 0 0 4.24 0 1 1 0 0 1 1.42 1.42 5 5 0 0 1-7.08 0zM9 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z' },
  { name: 'css-demo', color: '#3b82f6', icon: 'M5 3l-.65 3.34h13.59L17.5 8.5H3.92l-.66 3.33h13.59l-.76 3.81-5.48 1.81-4.75-1.81.33-1.64H2.85l-.79 4 7.85 3 9.05-3 1.2-6.03.24-1.21L21.94 3z' },
  { name: 'bloom-demo', color: '#8b5cf6', icon: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-5-7h10v2H7v-2zm0-3h10v2H7v-2zm0-3h10v2H7v-2z' },
  { name: 'particle-demo', color: '#ec4899', icon: 'M11 17a1 1 0 0 1 1.447.894l.002.106v1a1 1 0 0 1-1.993.117L10.5 19v-1a1 1 0 0 1 1-1zm-5-2a1 1 0 0 1 1.447.894l.002.106v3a1 1 0 0 1-1.993.117L5.5 19v-3a1 1 0 0 1 1-1zm10 0a1 1 0 0 1 1.447.894l.002.106v3a1 1 0 0 1-1.993.117L15.5 19v-3a1 1 0 0 1 1-1zm-5-5a1 1 0 0 1 1.447.894l.002.106v3a1 1 0 0 1-1.993.117L10.5 14v-3a1 1 0 0 1 1-1zm-5-2a1 1 0 0 1 1.447.894l.002.106v3a1 1 0 0 1-1.993.117L5.5 12V9a1 1 0 0 1 1-1zm10 0a1 1 0 0 1 1.447.894l.002.106v3a1 1 0 0 1-1.993.117L15.5 12V9a1 1 0 0 1 1-1zm-5-5a1 1 0 0 1 1.447.894l.002.106v3a1 1 0 0 1-1.993.117L10.5 7V4a1 1 0 0 1 1-1z' }
];

demos.forEach(demo => {
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <rect width="800" height="450" fill="${demo.color}20" />
    <rect x="0" y="0" width="800" height="450" fill="url(#grid)" />
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${demo.color}10" stroke-width="1"/>
      </pattern>
    </defs>
    <g transform="translate(400, 225) scale(8)">
      <path d="${demo.icon}" fill="${demo.color}" />
    </g>
    <text x="400" y="350" font-family="system-ui, sans-serif" font-size="24" text-anchor="middle" fill="${demo.color}">
      ${demo.name.replace('-demo', '').toUpperCase()} DEMO
    </text>
  </svg>`;

  // Save the SVG file
  fs.writeFileSync(path.join(thumbnailsDir, `${demo.name}.svg`), svgContent);
  
  console.log(`Generated thumbnail for ${demo.name}`);
});

console.log('All thumbnails generated successfully!');
