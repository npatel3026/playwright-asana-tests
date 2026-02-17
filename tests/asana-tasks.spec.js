// tests/asana-tasks.spec.js
const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/loginHelper');
const testData = require('../testData.json');

testData.testCases.forEach(testCase => {
  test(`${testCase.id}: Verify "${testCase.task}" in ${testCase.project}`, async ({ page }) => {
    console.log("========== Starting Test: "+testCase.id +"==========");
    console.log(`Project : "${testCase.project}"`);
    console.log(`Task: "${testCase.task}"`);
    console.log(`Expected Column: "${testCase.column}"`);
    console.log(`Expected Tags: ${testCase.tags.join(', ')}`);
    
    // Step 1: Login
    await login(page);
    
    // Step 2: Navigate to the project
    await page.click(`text=${testCase.project}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    // Step 3: Find all column headers
    const headers = page.locator('h2[class*="font-semibold"]');
    const headerCount = await headers.count();
    console.log("Found columns "+headerCount);
    
    let foundTask = false;
    
    // Step 4: Check each column
    for (let i = 0; i < headerCount; i++) {
      const header = headers.nth(i);
      const headerText = await header.textContent();
      const cleanText = headerText.split('(')[0].trim();
      
      console.log(`\nColumn ${i + 1}: "${cleanText}"`);
      
      if (cleanText === testCase.column) {
        console.log(`  ✓ This is the expected column!`);
        
        // Find tasks container (next div after the h2)
        const tasksContainer = header.locator('xpath=following-sibling::div[1]');
        
        // Find the specific task
        const taskTitle = tasksContainer.locator(`h3:has-text("${testCase.task}")`);
        const taskCount = await taskTitle.count();
        
        if (taskCount > 0) {
          console.log(`  ✓ Found task: "${testCase.task}"`);
          foundTask = true;
          
          // Get the task card
          const taskCard = taskTitle.locator('..');
          await expect(taskCard).toBeVisible();
          
          // Verify tags
          console.log(`  Verifying tags...`);
          for (const tag of testCase.tags) {
            const tagElement = taskCard.locator(`span:has-text("${tag}")`);
            const tagCount = await tagElement.count();
            
            if (tagCount > 0) {
              await expect(tagElement.first()).toBeVisible();
              console.log(`    ✓ Tag: "${tag}"`);
            } else {
              console.log(`    ✗ Tag NOT found: "${tag}"`);
              throw new Error(`Tag "${tag}" not found in task card`);
            }
          }
          
          break;
        } else {
          console.log(`  ✗ Task "${testCase.task}" not found in this column`);
        }
      }
    }
    
    if (!foundTask) {
      throw new Error(`Task "${testCase.task}" not found in column "${testCase.column}"`);
    }
    
    console.log(`\n========== Test ${testCase.id} PASSED ✓ ==========\n`);
  });
});