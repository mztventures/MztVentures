const EMAILJS_PUBLIC_KEY = 'n63-2pHxxOUI7jqvf';
const EMAILJS_LOAD_TIMEOUT_MS = 4000;
const EMAILJS_SEND_TIMEOUT_MS = 12000;
const PAGE_EXIT_DELAY_MS = 230;

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
}).catch(() => null);

function scrollToNext() {
    window.scrollBy({
        top: window.innerHeight - 70,
        behavior: 'smooth'
    });
}

window.scrollToNext = scrollToNext;

function setNavbarBackground() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) {
        return;
    }

    const isScrolled = window.scrollY > 50;
    navbar.classList.toggle('navbar-scrolled', isScrolled);

    if (isScrolled) {
        navbar.style.boxShadow = '0 10px 26px rgba(10, 20, 40, 0.14)';
    } else {
        navbar.style.boxShadow = '0 8px 24px rgba(10, 20, 40, 0.08)';
    }
}

function setupScrollReveal() {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const revealTargets = document.querySelectorAll([
        'main section',
        'body > section',
        '.feature-card',
        '.service-card',
        '.testimonial-card',
        '.contact-form',
        '.footer-section'
    ].join(','));

    if (!revealTargets.length) {
        return;
    }

    if (isMobile) {
        revealTargets.forEach((element) => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
        return;
    }

    revealTargets.forEach((element, index) => {
        element.classList.add('reveal-on-scroll');
    });

    if (!('IntersectionObserver' in window)) {
        revealTargets.forEach((element) => element.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px'
    });

    revealTargets.forEach((element) => observer.observe(element));

    // Immediately reveal elements already in viewport on page load
    setTimeout(() => {
        revealTargets.forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                element.classList.add('is-visible');
            }
        });
    }, 100);
}

function setupPageExitTransitions() {
    document.addEventListener('click', function (event) {
        const link = event.target.closest('a[href]');
        if (!link) {
            return;
        }

        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
        }

        if (link.target === '_blank' || link.hasAttribute('download') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
            return;
        }

        let destination;
        try {
            destination = new URL(link.href, window.location.href);
        } catch {
            return;
        }

        const isSameOrigin = destination.origin === window.location.origin;
        const isSamePageAnchor = destination.pathname === window.location.pathname && destination.hash;

        if (!isSameOrigin || isSamePageAnchor) {
            return;
        }

        event.preventDefault();
        document.body.classList.add('page-is-exiting');
        window.setTimeout(() => {
            window.location.assign(destination.href);
        }, PAGE_EXIT_DELAY_MS);
    });
}

// function ensureFloatingWhatsAppButton() {
//     let button = document.querySelector('.floating-whatsapp');

//     if (!button) {
//         button = document.createElement('a');
//         button.href = 'https://wa.me/447879091190';
//         button.className = 'floating-whatsapp';
//         button.target = '_blank';
//         button.rel = 'noopener';
//         button.title = 'Chat on WhatsApp';
//         button.setAttribute('aria-label', 'Chat on WhatsApp');
//         button.innerHTML = '<i class="fab fa-whatsapp"></i>';
//         document.body.appendChild(button);
//     }

//     if (button.parentElement !== document.body) {
//         document.body.appendChild(button);
//     }
// }


function ensureFloatingWhatsAppButton() {
    let button = document.querySelector('.floating-whatsapp');
    const parent = document.body;

    if (!button) {
        button = document.createElement('a');
        button.href = 'https://wa.me/447879091190';
        button.className = 'floating-whatsapp';
        button.target = '_blank';
        button.rel = 'noopener';
        button.title = 'Chat on WhatsApp';
        button.setAttribute('aria-label', 'Chat on WhatsApp');
        button.innerHTML = '<i class="fab fa-whatsapp"></i>';
        parent.appendChild(button);
    }

    if (button.parentElement !== parent) {
        parent.appendChild(button);
    }
}



function setupAppointmentForm() {
    const form = document.getElementById('appointmentForm');
    if (!form) {
        console.warn('Appointment form not found');
        return;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form elements with null checks
        const nameEl = document.getElementById('ap-name');
        const emailEl = document.getElementById('ap-email');
        const countryCodeEl = document.getElementById('ap-country-code');
        const phoneEl = document.getElementById('ap-phone');
        const serviceEl = document.getElementById('ap-service');
        const residenceCountryEl = document.getElementById('ap-residence-country');
        const desiredCountryEl = document.getElementById('ap-desired-country');
        const messageEl = document.getElementById('ap-message');

        // Validate all required elements exist
        if (!nameEl || !emailEl || !countryCodeEl || !phoneEl || !serviceEl || !residenceCountryEl || !desiredCountryEl || !messageEl) {
            console.error('One or more appointment form elements are missing');
            return;
        }

        const formData = {
            name: nameEl.value,
            email: emailEl.value,
            country_code: countryCodeEl.value,
            phone: phoneEl.value,
            service: serviceEl.value,
            residence_country: residenceCountryEl.value,
            desired_country: desiredCountryEl.value,
            message: messageEl.value
        };

        const fullPhone = `${formData.country_code} ${formData.phone}`.trim();
        const consultationSummary = [
            `Country Code: ${formData.country_code}`,
            `Residence Country: ${formData.residence_country}`,
            `Desired Country: ${formData.desired_country}`
        ].join('\n');

        const alertDiv = document.getElementById('appointmentAlert');
        const alertContent = document.getElementById('alertContent');
        const alertMessage = document.getElementById('alertMessage');
        const alertId = document.getElementById('alertId');

        // Validate alert elements exist
        if (!alertDiv || !alertContent || !alertMessage || !alertId) {
            console.error('One or more alert elements are missing');
            return;
        }

        const emailParams = {
            to_email: 'visa@mztventures.com',
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: fullPhone,
            customer_country_code: formData.country_code,
            service_type: formData.service,
            residence_country: formData.residence_country,
            desired_country: formData.desired_country,
            destination: formData.desired_country,
            additional_notes: `${consultationSummary}\n\n${formData.message}`.trim(),
            appointment_id: 'APT-' + Date.now(),
            reply_to: formData.email
        };

        alertContent.style.backgroundColor = '#e7d4f5';
        alertContent.style.color = '#6c1b6b';
        alertContent.style.border = '1px solid #d9b8e6';
        alertMessage.textContent = 'Sending your appointment request...';
        alertId.textContent = '';
        alertDiv.style.display = 'block';

        emailjsReady
            .then(() => {
                if (!window.emailjs) {
                    throw new Error('EmailJS is not loaded');
                }
                return withTimeout(window.emailjs.send(
                    'service_erj8ph9',
                    'new_appointment_34234',
                    emailParams
                ), EMAILJS_SEND_TIMEOUT_MS, 'Email request timed out. Please try again.');
            })
            .then(function (response) {
                alertContent.style.backgroundColor = '#d4edda';
                alertContent.style.color = '#155724';
                alertContent.style.border = '1px solid #c3e6cb';
                alertMessage.textContent = '✓ Thank you! Your appointment request has been received. We will confirm your appointment soon.';
                alertId.textContent = 'Appointment ID: ' + emailParams.appointment_id;

                console.log('Email sent successfully:', response);

                form.reset();

                setTimeout(() => {
                    alertDiv.style.display = 'none';
                }, 5000);

                alertDiv.scrollIntoView({ behavior: 'smooth' });

            })
            .catch(function (error) {
                alertContent.style.backgroundColor = '#f8d7da';
                alertContent.style.color = '#721c24';
                alertContent.style.border = '1px solid #f5c6cb';

                const errorText = error && (error.text || error.message || error.toString())
                    ? String(error.text || error.message || error.toString())
                    : 'Unknown error';
                alertMessage.textContent = `✗ Error sending appointment: ${errorText}`;
                alertId.textContent = 'Error: ' + errorText;

                console.error('Email send failed:', error);

                setTimeout(() => {
                    alertDiv.style.display = 'none';
                }, 7000);

                alertDiv.scrollIntoView({ behavior: 'smooth' });
            });
    });
}

function setupVisaForm() {
    const form = document.getElementById('visaForm');
    if (!form) {
        console.warn('Visa form not found');
        return;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const visaId = 'VISA-' + Date.now();
        const alertDiv = document.getElementById('visaAlert');
        const alertContent = document.getElementById('visaAlertContent');
        const alertMessage = document.getElementById('visaAlertMessage');
        const alertId = document.getElementById('visaAlertId');

        if (!alertDiv || !alertContent || !alertMessage || !alertId) {
            console.error('Visa alert elements are missing');
            return;
        }

        // Collect form data
        const emailParams = {
            to_email: 'visa@mztventures.com',
            visa_application_id: visaId,
            first_name: document.getElementById('first-name')?.value || '',
            last_name: document.getElementById('last-name')?.value || '',
            middle_name: document.getElementById('middle-name')?.value || '',
            date_of_birth: document.getElementById('dob')?.value || '',
            gender: document.querySelector('input[name="gender"]:checked')?.value || '',
            nationality: document.getElementById('nationality')?.value || '',
            email: document.getElementById('email')?.value || '',
            phone: document.getElementById('phone')?.value || '',
            alternate_phone: document.getElementById('alternate-phone')?.value || '',
            whatsapp: document.getElementById('whatsapp')?.value || '',
            address: document.getElementById('address')?.value || '',
            city: document.getElementById('city')?.value || '',
            state: document.getElementById('state')?.value || '',
            postal_code: document.getElementById('postal-code')?.value || '',
            country: document.getElementById('country')?.value || '',
            passport_number: document.getElementById('passport-number')?.value || '',
            passport_type: document.getElementById('passport-type')?.value || '',
            passport_issue_date: document.getElementById('issue-date')?.value || '',
            passport_expiry_date: document.getElementById('expiry-date')?.value || '',
            issuing_country: document.getElementById('issuing-country')?.value || '',
            issuing_place: document.getElementById('issuing-place')?.value || '',
            visa_destination: document.getElementById('visa-destination')?.value || '',
            visa_type: document.getElementById('visa-type')?.value || '',
            visa_category: document.getElementById('visa-category')?.value || '',
            duration_of_stay: document.getElementById('duration')?.value || '',
            departure_date: document.getElementById('departure-date')?.value || '',
            return_date: document.getElementById('return-date')?.value || '',
            port_of_entry: document.getElementById('entry-city')?.value || '',
            port_of_exit: document.getElementById('exit-city')?.value || '',
            purpose_of_visit: document.getElementById('purpose-description')?.value || '',
            employment_status: document.getElementById('employment-status')?.value || '',
            occupation: document.getElementById('occupation')?.value || '',
            employer_name: document.getElementById('employer-name')?.value || '',
            employer_address: document.getElementById('employer-address')?.value || '',
            job_title: document.getElementById('job-title')?.value || '',
            years_of_employment: document.getElementById('years-employment')?.value || '',
            monthly_income: document.getElementById('monthly-income')?.value || '',
            annual_income: document.getElementById('annual-income')?.value || '',
            marital_status: document.getElementById('marital-status')?.value || '',
            number_of_dependents: document.getElementById('number-dependents')?.value || '',
            spouse_name: document.getElementById('spouse-name')?.value || '',
            visa_rejections: document.querySelector('input[name="previous_visa_rejections"]:checked')?.value || '',
            visa_rejection_details: document.getElementById('visa-rejection-details')?.value || '',
            visited_countries: document.getElementById('visited-countries')?.value || '',
            current_valid_visa: document.querySelector('input[name="current_valid_visa"]:checked')?.value || '',
            visa_validity_date: document.getElementById('visa-validity')?.value || '',
            sponsor_name: document.getElementById('sponsor-name')?.value || '',
            sponsor_relationship: document.getElementById('sponsor-relationship')?.value || '',
            sponsor_address: document.getElementById('sponsor-address')?.value || '',
            sponsor_country: document.getElementById('sponsor-country')?.value || '',
            sponsor_phone: document.getElementById('sponsor-phone')?.value || '',
            sponsor_email: document.getElementById('sponsor-email')?.value || '',
            reply_to: document.getElementById('email')?.value || ''
        };

        alertContent.style.backgroundColor = 'rgba(27, 169, 154, 0.12)';
        alertContent.style.color = '#0E5A67';
        alertContent.style.border = '1px solid #1BA99A';
        alertMessage.textContent = 'Processing your visa application...';
        alertId.textContent = '';
        alertDiv.style.display = 'block';

        emailjsReady
            .then(() => {
                if (!window.emailjs) {
                    throw new Error('EmailJS is not loaded');
                }
                return withTimeout(window.emailjs.send(
                    'service_erj8ph9',
                    'visa_notification_32423',
                    emailParams
                ), EMAILJS_SEND_TIMEOUT_MS, 'Email request timed out. Please try again.');
            })
            .then(function (response) {
                alertContent.style.backgroundColor = 'rgba(27, 169, 154, 0.15)';
                alertContent.style.color = '#0E5A67';
                alertContent.style.border = '1px solid #1BA99A';
                alertMessage.textContent = '✓ Your visa application has been successfully submitted! Our team will contact you within 2-3 business days. Please share your documents via WhatsApp or email as discussed.';
                alertId.textContent = 'Application ID: ' + visaId;

                console.log('Visa application email sent successfully:', response);

                form.reset();

                setTimeout(() => {
                    alertDiv.style.display = 'none';
                }, 8000);

                alertDiv.scrollIntoView({ behavior: 'smooth' });

            })
            .catch(function (error) {
                alertContent.style.backgroundColor = 'rgba(255, 193, 7, 0.15)';
                alertContent.style.color = '#856404';
                alertContent.style.border = '1px solid #ffc107';
                alertMessage.textContent = '✗ Error submitting your application. Please try again or contact us directly.';
                
                const errorText = error && (error.text || error.message || error.toString())
                    ? String(error.text || error.message || error.toString())
                    : 'Unknown error';
                alertId.textContent = 'Error: ' + errorText;

                console.error('Visa application submission failed:', error);

                setTimeout(() => {
                    alertDiv.style.display = 'none';
                }, 8000);

                alertDiv.scrollIntoView({ behavior: 'smooth' });
            });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    ensureFloatingWhatsAppButton();
    setNavbarBackground();
    window.addEventListener('scroll', setNavbarBackground);
    setupScrollReveal();
    setupPageExitTransitions();
    setupAppointmentForm();
    setupVisaForm();
});

