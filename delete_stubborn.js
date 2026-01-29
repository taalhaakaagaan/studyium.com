const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src/app/notes/[id]');

console.log(`Deleting: ${target}`);

try {
    if (fs.existsSync(target)) {
        fs.rmSync(target, { recursive: true, force: true });
        console.log('Deleted successfully.');
    } else {
        console.log('Path does not exist.');
    }
} catch (error) {
    console.error('Error deleting:', error);
}
