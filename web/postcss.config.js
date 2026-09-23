import { fileURLToPath } from 'node:url';

// ponytail: pin the Tailwind config to this folder so any launch folder works.
export default { plugins: { tailwindcss: { config: fileURLToPath(new URL('./tailwind.config.js', import.meta.url)) }, autoprefixer: {} } };
