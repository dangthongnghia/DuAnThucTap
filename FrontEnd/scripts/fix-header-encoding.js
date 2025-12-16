const fs = require('fs');
const path = require('path');

// Path to the createMetroMiddleware.js file
const middlewarePath = path.join(
  process.cwd(), 
  'node_modules/@expo/cli/build/src/start/server/metro/dev-server/createMetroMiddleware.js'
);

try {
  // Read the file
  if (!fs.existsSync(middlewarePath)) {
    console.log('❌ Could not find createMetroMiddleware.js file at:', middlewarePath);
    console.log('This might be because:');
    console.log('1. You need to run npm install first');
    console.log('2. Your expo/cli package structure is different');
    process.exit(1);
  }

  let content = fs.readFileSync(middlewarePath, 'utf8');
  
  // Check if it contains setHeader with project root
  if (content.includes('res.setHeader("X-React-Native-Project-Root"') || 
      content.includes("res.setHeader('X-React-Native-Project-Root'")) {
    
    // Replace the line to encode the project root
    content = content.replace(
      /res\.setHeader\(['"']X-React-Native-Project-Root['"'],\s*(.*?)\)/g,
      'res.setHeader("X-React-Native-Project-Root", encodeURIComponent($1))'
    );
    
    // Write back to the file
    fs.writeFileSync(middlewarePath, content);
    console.log('✅ Successfully patched createMetroMiddleware.js to handle non-ASCII characters');
  } else {
    console.log('⚠️ Could not find the header setting code in the file. The file format might have changed.');
  }
} catch (err) {
  console.error('Error patching the file:', err);
}