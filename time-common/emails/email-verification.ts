/**
 * Generate a verification email
 * @param options
 * @param {string} options.subject
 * @param {string} options.preheader
 * @param {Store} options.store
 */
export function emailVerification(options) {
	return `<!doctype html>
<html><body>
  <h3>Thanks for creating an account.</h3>
  <p>Click on the link below (or paste it into your browser) to finish the signup process:</p>
  <p><strong><a href='http://${req.headers.host}/verify-email/${token}' target='_blank'>Click here to verify your email</a></strong></p>
</body></html>`;
}