-- Insert sample content into the existing legal_pages table
-- Run this in your Supabase SQL editor

INSERT INTO legal_pages (slug, title, description, body) VALUES
(
  'privacy',
  'Privacy Policy',
  'How we collect, use, and protect your personal information',
  '<h2>Privacy Policy</h2>
  <p>Last updated: December 2024</p>
  
  <h3>1. Information We Collect</h3>
  <p>We collect information you provide directly to us, such as when you create an account, post content, or contact us for support.</p>
  
  <h3>2. How We Use Your Information</h3>
  <p>We use the information we collect to:</p>
  <ul>
    <li>Provide, maintain, and improve our services</li>
    <li>Process transactions and send related information</li>
    <li>Send technical notices and support messages</li>
    <li>Respond to your comments and questions</li>
  </ul>
  
  <h3>3. Information Sharing</h3>
  <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
  
  <h3>4. Data Security</h3>
  <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
  
  <h3>5. Contact Us</h3>
  <p>If you have any questions about this Privacy Policy, please contact us.</p>'
),
(
  'terms',
  'Terms of Service',
  'The terms and conditions governing your use of our platform',
  '<h2>Terms of Service</h2>
  <p>Last updated: December 2024</p>
  
  <h3>1. Acceptance of Terms</h3>
  <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
  
  <h3>2. Use License</h3>
  <p>Permission is granted to temporarily download one copy of the materials on Interstellar Nerd for personal, non-commercial transitory viewing only.</p>
  
  <h3>3. User Content</h3>
  <p>Users may post content to our platform. You retain ownership of your content, but grant us a license to use, modify, and distribute it.</p>
  
  <h3>4. Prohibited Uses</h3>
  <p>You may not use our services to:</p>
  <ul>
    <li>Violate any applicable laws or regulations</li>
    <li>Infringe on the rights of others</li>
    <li>Post harmful, offensive, or inappropriate content</li>
    <li>Attempt to gain unauthorized access to our systems</li>
  </ul>
  
  <h3>5. Termination</h3>
  <p>We may terminate or suspend your account and access to our services at any time, with or without cause.</p>
  
  <h3>6. Disclaimer</h3>
  <p>The materials on Interstellar Nerd are provided on an "as is" basis. We make no warranties, expressed or implied.</p>
  
  <h3>7. Contact Information</h3>
  <p>If you have any questions about these Terms of Service, please contact us.</p>'
),
(
  'cookie-policy',
  'Cookie Policy',
  'How we use cookies and similar technologies on our website',
  '<h2>Cookie Policy</h2>
  <p>Last updated: December 2024</p>
  
  <h3>1. What Are Cookies</h3>
  <p>Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience.</p>
  
  <h3>2. How We Use Cookies</h3>
  <p>We use cookies for the following purposes:</p>
  <ul>
    <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
    <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
    <li><strong>Authentication Cookies:</strong> Keep you logged in during your session</li>
  </ul>
  
  <h3>3. Third-Party Cookies</h3>
  <p>We may use third-party services that place their own cookies on your device. These services include:</p>
  <ul>
    <li>Google Analytics for website analytics</li>
    <li>Authentication providers for user login</li>
  </ul>
  
  <h3>4. Managing Cookies</h3>
  <p>You can control and manage cookies through your browser settings. However, disabling certain cookies may affect the functionality of our website.</p>
  
  <h3>5. Updates to This Policy</h3>
  <p>We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
  
  <h3>6. Contact Us</h3>
  <p>If you have any questions about our use of cookies, please contact us.</p>'
),
(
  'all-slugs',
  'All Legal Page Slugs',
  'Internal page for generating static paths',
  '["privacy", "terms", "cookie-policy"]'
); 