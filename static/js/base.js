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
        // '.visa-form-wrapper',
        // '.info-box',
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
        element.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
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
            observer.unobserve(entry.target);  // ← Stop observing after first visibility
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px'
    });

    // revealTargets.forEach((element) => observer.observe(element));
    revealTargets.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            element.classList.add('is-visible');
        }
    });
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
        return;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('ap-name').value,
            email: document.getElementById('ap-email').value,
            country_code: document.getElementById('ap-country-code').value,
            phone: document.getElementById('ap-phone').value,
            service: document.getElementById('ap-service').value,
            residence_country: document.getElementById('ap-residence-country').value,
            desired_country: document.getElementById('ap-desired-country').value,
            message: document.getElementById('ap-message').value
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
            from_name: '',
            from_email: '',
            phone_number: '',
            subject_line: '',
            message_text: ''
        };

        alertContent.style.backgroundColor = '#e7d4f5';
        alertContent.style.color = '#6c1b6b';
        alertContent.style.border = '1px solid #d9b8e6';
        alertMessage.textContent = 'Sending your appointment request...';
        alertId.textContent = '';
        alertDiv.style.display = 'block';

        emailjsReady
            .then(() => withTimeout(window.emailjs.send(
                'service_erj8ph9',
                'new_appointment_34234',
                emailParams
            ), EMAILJS_SEND_TIMEOUT_MS, 'Email request timed out. Please try again.'))
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
                }, 3000);

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

document.addEventListener('DOMContentLoaded', function () {
    ensureFloatingWhatsAppButton();
    setNavbarBackground();
    window.addEventListener('scroll', setNavbarBackground);
    setupScrollReveal();
    setupPageExitTransitions();
    setupAppointmentForm();
});


// // Find which element is causing the gap at the bottom
// const all = document.querySelectorAll('*');
// let maxBottom = 0;
// let culprit = null;

// all.forEach(el => {
//     const rect = el.getBoundingClientRect();
//     const absBottom = rect.bottom + window.scrollY;
//     const style = getComputedStyle(el);
//     const mb = parseFloat(style.marginBottom);
//     const pb = parseFloat(style.paddingBottom);

//     if (absBottom > maxBottom && (mb > 0 || pb > 0)) {
//         maxBottom = absBottom;
//         culprit = { el, marginBottom: mb, paddingBottom: pb, tag: el.tagName, class: el.className };
//     }
// });

// console.log('Culprit element:', culprit);
// console.log('Body height:', document.body.offsetHeight);
// console.log('Gap size:', document.body.offsetHeight - maxBottom, 'px');
