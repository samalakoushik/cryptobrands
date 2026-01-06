// Email OTP Handler Utility
// Handles OTP extraction from email or prompts for manual input

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt user to manually enter OTP code
 * @param {string} message - Custom message to display
 * @returns {Promise<string>} - The OTP code entered by user
 */
function promptForOTP(message = 'Please enter the OTP code from your email: ') {
  return new Promise((resolve) => {
    rl.question(`\n${message}`, (otp) => {
      resolve(otp.trim());
    });
  });
}

/**
 * Wait for OTP with timeout
 * @param {number} timeoutMs - Timeout in milliseconds (default: 5 minutes)
 * @returns {Promise<string>} - The OTP code
 */
async function waitForOTP(timeoutMs = 300000) {
  console.log('\n📧 Waiting for OTP code...');
  console.log('   Check your email: koushik.tech2003@gmail.com');
  console.log('   Look for an email from Vercel with the subject containing "verification" or "code"\n');
  
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log('\n⏰ Timeout reached. Please enter the OTP manually.');
      promptForOTP('Enter OTP code: ').then(resolve);
    }, timeoutMs);

    // Try to get OTP immediately (user might have it ready)
    promptForOTP('Enter OTP code from email (or press Enter to wait): ').then((otp) => {
      clearTimeout(timeout);
      if (otp) {
        resolve(otp);
      } else {
        // User pressed Enter, wait a bit then prompt again
        setTimeout(() => {
          promptForOTP('Enter OTP code: ').then(resolve);
        }, 10000); // Wait 10 seconds before prompting again
      }
    });
  });
}

/**
 * Extract OTP from email content (if email API is available)
 * This is a placeholder for future email API integration
 * @param {string} emailContent - Email content to parse
 * @returns {string|null} - Extracted OTP or null
 */
function extractOTPFromEmail(emailContent) {
  // Common OTP patterns
  const patterns = [
    /verification code[:\s]+(\d{6})/i,
    /code[:\s]+(\d{6})/i,
    /OTP[:\s]+(\d{6})/i,
    /(\d{6})/g, // Generic 6-digit code
  ];

  for (const pattern of patterns) {
    const match = emailContent.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validate OTP format
 * @param {string} otp - OTP code to validate
 * @returns {boolean} - True if valid format
 */
function validateOTP(otp) {
  if (!otp) return false;
  // OTP is typically 6 digits
  return /^\d{4,8}$/.test(otp.trim());
}

module.exports = {
  promptForOTP,
  waitForOTP,
  extractOTPFromEmail,
  validateOTP,
  rl // Export readline interface for cleanup
};

