const fs = require('fs');
const path = require('path');
const templatesDir = 'C:/Users/user/Desktop/fulafia_edu_ng/templates';

// We get the nav block from faculty.html
const facultyHtml = fs.readFileSync(path.join(templatesDir, 'faculty.html'), 'utf8');

// Extract the faculty-nav HTML block
const navMatch = facultyHtml.match(/(<!-- 2\. CONTEXT NAV -->[\s\S]*?<\/nav>)/);
let navHtml = '';
if (navMatch) {
    navHtml = navMatch[1];
} else {
    // If comment is missing, just extract the nav tag
    const rawNavMatch = facultyHtml.match(/(<nav class="faculty-nav"[\s\S]*?<\/nav>)/);
    if (rawNavMatch) {
        navHtml = '<!-- 2. CONTEXT NAV -->\n  ' + rawNavMatch[1];
    }
}

// Extract the faculty-nav CSS block
const cssMatch = facultyHtml.match(/(\/\* FACULTY NAV \*\/[\s\S]*?)(?=\/\* HERO|\/\* PAGE BANNER)/);
let navCss = '';
if (cssMatch) {
    navCss = cssMatch[1];
}

const mobileCssMatch = facultyHtml.match(/(\/\* Hamburger \*\/[\s\S]*?)(?=\/\* Top bar|\/\* Hero|\/\* Dept|\/\* News|\/\* Footer|<\/style>)/i);
// Wait, the mobile nav css is quite large. Let's just grab the whole block of hamburger & mobile nav from faculty.html
const hamburgerMatch = facultyHtml.match(/(\/\* Hamburger \*\/[\s\S]*?\.nav-links\.show \{[\s\S]*?\})/i);
let mobileNavCss = '';
if (hamburgerMatch) {
    mobileNavCss = hamburgerMatch[1];
}


const targetFiles = ['about.html', 'management.html', 'departments.html', 'staff.html', 'news-single.html'];

targetFiles.forEach(f => {
  const filePath = path.join(templatesDir, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // Inject HTML: Place it right after <div class="top-bar">...</div>
  // Wait, top-bar is <div class="top-bar">...</div>
  // We can find the end of top-bar and insert it before <header> or <div class="page-banner">
  if (!content.includes('<nav class="faculty-nav"')) {
      content = content.replace(/(<\/div>\s*)(<(?:header|div) class="page-banner")/i, `$1${navHtml}\n\n  $2`);
  }

  // Inject CSS: Place it right before /* PAGE BANNER */ or similar
  if (!content.includes('/* FACULTY NAV */')) {
      content = content.replace(/(\/\* PAGE BANNER \*\/)/i, `${navCss}\n    $1`);
  }

  // Inject Mobile CSS: Place it right before </style> inside the @media (max-width: 680px) block
  if (!content.includes('/* Hamburger */') && mobileNavCss) {
      // Find the mobile media query
      if (content.includes('@media (max-width: 680px) {')) {
          content = content.replace(/(\s*)(@media \(max-width: 380px\)|<\/style>)/, `\n      ${mobileNavCss}$1$2`);
      }
  }

  // Also, update the "active" state in the injected nav. If it's about.html, "About" should be active.
  let specificNavHtml = navHtml;
  specificNavHtml = specificNavHtml.replace(/class="active"/g, '');
  if (f === 'about.html') {
      specificNavHtml = specificNavHtml.replace(/>About<\/a>/, ' class="active">About</a>');
  } else if (f === 'management.html') {
      specificNavHtml = specificNavHtml.replace(/>Management<\/a>/, ' class="active">Management</a>');
  } else if (f === 'departments.html') {
      specificNavHtml = specificNavHtml.replace(/>Departments<\/a>/, ' class="active">Departments</a>');
  }
  
  // replace the navHtml in the content with specificNavHtml if we just injected it, 
  // or if we already injected it before, replace it now.
  content = content.replace(/<!-- 2\. CONTEXT NAV -->[\s\S]*?<\/nav>/, specificNavHtml);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Injected nav into ${f}`);
});
