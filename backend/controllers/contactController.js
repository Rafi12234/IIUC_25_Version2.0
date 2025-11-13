/**
 * Contact Controller
 * Handles contact form submissions
 */

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public
 */
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Please provide name, email, and message' });
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    // In production, you would:
    // 1. Save to database (ContactMessage model)
    // 2. Send email notification to admin
    // 3. Send confirmation email to user
    
    // For now, just log and return success
    console.log('Contact form submission:', { name, email, subject, message });

    res.status(200).json({
      message: 'Thank you for contacting us! We will get back to you soon.',
      success: true,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
