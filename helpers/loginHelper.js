// helpers/loginHelper.js
const testData = require('../testData.json');

async function login(page) {
  const { url, email, password } = testData.loginCredentials;
  
  // Navigate to the login page
  await page.goto(url);
  
  // Fill in login credentials
  await page.fill('input[type="text"]', email);
  await page.fill('input[type="password"]', password);
  
  // Click the login button
  await page.click('button[type="submit"]');
  
  // Wait for navigation after login
  await page.waitForLoadState('networkidle');
}

module.exports = { login };