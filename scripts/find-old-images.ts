import { execSync } from 'child_process';

console.log('Searching for legacy image references...');

try {
  const matches = execSync(
    "grep -R -n 'galaxy-paranormal\|logo\\.png' . || true",
    { encoding: 'utf8' }
  );
  if (matches.trim()) {
    console.log(matches);
  } else {
    console.log('No references to galaxy-paranormal or logo.png found.');
  }
} catch (err) {
  console.error('Error running grep', err);
}

try {
  const jpgs = execSync("find public -name '*.jpg' || true", { encoding: 'utf8' });
  if (jpgs.trim()) {
    console.log('\nJPEG files in public/ that may need cleanup:');
    console.log(jpgs);
  } else {
    console.log('\nNo .jpg files found in public/.');
  }
} catch (err) {
  console.error('Error listing jpg files', err);
}
