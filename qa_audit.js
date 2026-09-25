const fs = require('fs');
const path = require('path');

const templatesDir = 'C:/Users/user/Desktop/fulafia_edu_ng/templates';
const assetsDir = 'C:/Users/user/Desktop/fulafia_edu_ng/assets';

const files = [
  'faculty.html','department.html','directorate.html',
  'centre.html','unit.html','dept-staff.html',
  'dir-staff.html','ctr-staff.html','news-single.html'
];

// Pages that intentionally have no hamburger nav (simple context nav)
const noHamburgerPages = ['news-single.html'];

const assetFiles = fs.readdirSync(assetsDir).map(f => f.toLowerCase());

let totalIssues = 0;

files.forEach(f => {
  const filePath = path.join(templatesDir, f);
  if (!fs.existsSync(filePath)) { console.log(`\n=== ${f} ===\n  SKIP: file not found`); return; }
  const c = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // 1. Duplicate id="about"
  const aboutIds = (c.match(/id=["']about["']/g) || []).length;
  if (aboutIds > 1) issues.push(`DUPLICATE id="about": appears ${aboutIds} times`);

  // 2. Mobile dropdown stuck open
  const mobileBlock = (c.match(/@media\s*\(max-width:\s*680px\)([\s\S]*?)(?=\s*@media|\s*<\/style>)/) || ['',''])[1];
  const hasDropdownBlock = mobileBlock.includes('.dropdown-menu');
  const hasDisplayNone = mobileBlock.includes('display:none') || mobileBlock.includes('display: none');
  const hasFocusWithin = mobileBlock.includes('focus-within');
  if (hasDropdownBlock && !hasDisplayNone && !hasFocusWithin) {
    issues.push('MOBILE DROPDOWN: stuck open (no display:none + focus-within toggle in mobile CSS)');
  }

  // 3. Hamburger hidden on desktop & toggle input hidden (skip pages without hamburger)
  if (!noHamburgerPages.includes(f)) {
    const navLabelHidden = c.includes('nav-toggle-label{display:none') || c.includes('nav-toggle-label { display: none');
    if (!navLabelHidden) issues.push('HAMBURGER: .nav-toggle-label not hidden on desktop');
    const navInputHidden = c.includes('.nav-toggle{display:none') || c.includes('.nav-toggle { display: none') || c.includes('nav-toggle{display:none');
    if (!navInputHidden) issues.push('NAV INPUT: .nav-toggle checkbox not hidden (.nav-toggle{display:none})');
  }

  // 4. Hero fetchpriority
  if (c.includes('hero__img') && !c.includes('fetchpriority')) issues.push('PERF: hero img missing fetchpriority="high"');

  // 5. Google Fonts double preconnect
  if (c.includes('fonts.googleapis.com') && !c.includes('fonts.gstatic.com')) {
    issues.push('PERF: missing fonts.gstatic.com preconnect (delays font download)');
  }

  // 6. Prefers-reduced-motion
  if (!c.includes('prefers-reduced-motion')) issues.push('A11Y: missing @media prefers-reduced-motion');

  // 7. Referenced assets that don't exist on disk
  const assetRefs = [...c.matchAll(/assets\/([^\s"']+\.(jpg|png|gif|svg|webp))/gi)].map(m => m[1].toLowerCase());
  const uniqueAssets = [...new Set(assetRefs)];
  uniqueAssets.forEach(asset => {
    if (!assetFiles.includes(asset)) issues.push(`MISSING ASSET: assets/${asset} not on disk`);
  });

  // 8. Viewport fit for iOS notch
  if (!c.includes('viewport-fit=cover')) issues.push('VIEWPORT: missing viewport-fit=cover');

  // 9. Exactly one h1
  const h1count = (c.match(/<h1[\s>]/g) || []).length;
  if (h1count === 0) issues.push('SEO: no <h1> found');
  else if (h1count > 1) issues.push(`SEO: ${h1count} <h1> tags (should be exactly 1)`);

  // 10. lang attribute
  if (!c.includes('<html lang="en">')) issues.push('A11Y: missing lang="en" on <html>');

  // 11. Meta description
  if (!c.includes('name="description"')) issues.push('SEO: missing <meta name="description">');

  // 12. Zero JavaScript
  const hasInlineJS = c.includes('<script') || c.includes('onclick=') || c.includes('onload=');
  if (hasInlineJS) issues.push('ZERO-JS VIOLATION: JavaScript found');

  // 13. Images with missing alt
  const imgsWithoutAlt = (c.match(/<img(?![^>]*\balt\b)[^>]*>/gi) || []).length;
  if (imgsWithoutAlt > 0) issues.push(`A11Y: ${imgsWithoutAlt} <img> element(s) missing alt attribute`);

  // 14. Charset
  if (!c.includes('charset="UTF-8"')) issues.push('HTML: missing charset="UTF-8"');

  // Report
  console.log(`\n=== ${f} ===`);
  if (issues.length === 0) {
    console.log('  ✅  ALL CHECKS PASSED');
  } else {
    console.log(`  ❌  ${issues.length} ISSUE(S):`);
    issues.forEach(i => console.log(`       • ${i}`));
    totalIssues += issues.length;
  }
});

console.log(`\n${'='.repeat(52)}`);
if (totalIssues === 0) {
  console.log('🎉  ZERO ISSUES — ALL TEMPLATES PASS QA');
} else {
  console.log(`⚠️   TOTAL ISSUES: ${totalIssues}`);
}
