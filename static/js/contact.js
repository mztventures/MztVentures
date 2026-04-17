const EMAILJS_PUBLIC_KEY = 'n63-2pHxxOUI7jqvf';
const EMAILJS_LOAD_TIMEOUT_MS = 4000;
const EMAILJS_SEND_TIMEOUT_MS = 12000;

function withTimeout(promise, timeoutMs, timeoutMessage) {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
        })
    ]);
}

function loadEmailJs() {
    return new Promise((resolve, reject) => {
        if (window.emailjs) {
            resolve();
            return;
        }

        const timeout = setTimeout(() => {
            clearInterval(poll);
            reject(new Error('EmailJS library failed to load. Check your network or script URL.'));
        }, EMAILJS_LOAD_TIMEOUT_MS);

        const poll = setInterval(() => {
            if (window.emailjs) {
                clearTimeout(timeout);
                clearInterval(poll);
                resolve();
            }
        }, 100);
    });
}

const emailjsReady = loadEmailJs().then(() => {
    if (window.emailjs && typeof window.emailjs.init === 'function') {
        window.emailjs.init(EMAILJS_PUBLIC_KEY);
        return;
    }

    console.warn('EmailJS not available - email sending will not work');
});

// Contact Form Handler
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    if (!form) {
        return;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Get alert elements
        const alertDiv = document.getElementById('contactAlert');
        const alertContent = document.getElementById('contactAlertContent');
        const alertMessage = document.getElementById('contactAlertMessage');

        // Prepare email parameters for EmailJS
        const emailParams = {
            to_email: 'visa@mztventures.com',
            from_name: formData.name,
            from_email: formData.email,
            phone_number: formData.phone,
            subject_line: formData.subject,
            message_text: formData.message,
            reply_to: formData.email,
            customer_name: '',  // Leave empty for contact
            customer_email: '',  // Leave empty for contact
            customer_phone: '',  // Leave empty for contact
            service_type: '',  // Leave empty for contact
            appointment_date: '',  // Leave empty for contact
            appointment_time: '',  // Leave empty for contact
            destination: '',  // Leave empty for contact
            additional_notes: '',  // Leave empty for contact
            appointment_id: ''  // Leave empty for contact
        };

        // Show loading state
        alertContent.style.backgroundColor = '#e7d4f5';
        alertContent.style.color = '#6c1b6b';
        alertContent.style.border = '1px solid #d9b8e6';
        alertMessage.textContent = 'Sending your message...';
        alertDiv.style.display = 'block';

        emailjsReady
            .then(() => withTimeout(window.emailjs.send(
                'service_erj8ph9',           // Replace with your EmailJS Service ID
                'new_appointment_34234',  // Replace with your EmailJS Template ID
                emailParams
            ), EMAILJS_SEND_TIMEOUT_MS, 'Email request timed out. Please try again.'))
            .then(function (response) {
                // Success: Update alert styling
                alertContent.style.backgroundColor = '#d4edda';
                alertContent.style.color = '#155724';
                alertContent.style.border = '1px solid #c3e6cb';
                alertMessage.textContent = '✓ Thank you for your message! We will get back to you soon.';

                console.log('Email sent successfully:', response);

                // Reset form
                form.reset();

                // Hide alert after 5 seconds
                setTimeout(() => {
                    alertDiv.style.display = 'none';
                }, 5000);

                // Scroll to alert
                alertDiv.scrollIntoView({ behavior: 'smooth' });

            })
            .catch(function (error) {
                // Error: Show error message
                alertContent.style.backgroundColor = '#f8d7da';
                alertContent.style.color = '#721c24';
                alertContent.style.border = '1px solid #f5c6cb';
                const errorText = error && (error.text || error.message || error.toString())
                    ? String(error.text || error.message || error.toString())
                    : 'Unknown error';
                alertMessage.textContent = `✗ Error sending message: ${errorText}`;

                console.error('Email send failed:', error);

                // Hide alert after 5 seconds
                setTimeout(() => {
                    alertDiv.style.display = 'none';
                }, 5000);

                // Scroll to alert
                alertDiv.scrollIntoView({ behavior: 'smooth' });
            });
    });
});

