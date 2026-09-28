const fs = require('fs');
const path = require('path');

const templatesDir = 'C:/Users/user/Desktop/fulafia_edu_ng/templates';
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.html'));

files.forEach(f => {
  const filePath = path.join(templatesDir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Remove hero__actions block
  content = content.replace(/<div class="hero__actions">[\s\S]*?<\/div>\s*<\/div>\s*<!--/g, '</div>\n  <!--');
  content = content.replace(/<div class="hero__actions">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '</div>\n    </div>');
  content = content.replace(/<div class="hero__actions">[\s\S]*?<\/div>\s*<\/section>/g, '</section>');

  // Let's do a more robust hero__actions removal. Just remove the div itself.
  content = content.replace(/<div class="hero__actions">[\s\S]*?<\/div>(?=\s*<\/div>|\s*<\/section>)/g, '');

  // 2. Remove "About" and "Management" sections
  content = content.replace(/<!--\s*[\d\.]*\s*ABOUT[^>]*-->\s*<section class="about"[\s\S]*?<\/section>/gi, '');
  content = content.replace(/<!--\s*[\d\.]*\s*MANAGEMENT[^>]*-->\s*<section class="management"[\s\S]*?<\/section>/gi, '');

  // 3. Update nav links
  content = content.replace(/href="#about"/g, 'href="about.html"');
  content = content.replace(/href="#management"/g, 'href="management.html"');
  
  // Replace dropdown for departments
  content = content.replace(/<li class="has-dropdown">\s*<input[^>]*>\s*<label[^>]*>Departments<\/label>\s*<ul class="dropdown-menu">[\s\S]*?<\/ul>\s*<\/li>/gi, '<li><a href="departments.html">Departments</a></li>');
  content = content.replace(/<li class="has-dropdown">\s*<a[^>]*>Departments<\/a>\s*<ul class="dropdown-menu">[\s\S]*?<\/ul>\s*<\/li>/gi, '<li><a href="departments.html">Departments</a></li>');
  
  // Any other remaining links
  content = content.replace(/href="#departments"/g, 'href="departments.html"');
  
  // 4. Remove duplicate logo from context nav
  content = content.replace(/(<div class="(?:faculty|dept|dir|ctr|unit)-nav__brand">)\s*<img src="\.\.\/assets\/Logo\.png"[^>]*>/gi, '$1');

  // 5. Update top-bar
  content = content.replace(/<a href="https:\/\/fulafia\.edu\.ng" class="top-bar__brand"[^>]*>([\s\S]*?)<\/a>/gi, '<div class="top-bar__brand">$1</div>');
  
  // Add "FULAFIA Website" button
  if (!content.includes('class="top-bar__website-btn"')) {
      content = content.replace(/(<div class="top-bar__contact">)/i, '$1\n        <a href="https://fulafia.edu.ng" class="top-bar__website-btn" style="background:var(--gold);color:var(--white);padding:.35rem .75rem;border-radius:20px;font-weight:700;font-size:.78rem;text-decoration:none;">FULAFIA Website</a>');
  }

  // Remove the hero__btn CSS since we removed the buttons
  content = content.replace(/\s*\.hero__btn[\s\S]*?white-space:\s*nowrap;\s*\}/g, '');
  content = content.replace(/\s*\.hero__btn--primary[\s\S]*?\}/g, '');
  content = content.replace(/\s*\.hero__actions[\s\S]*?\}/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed ' + f);
});
