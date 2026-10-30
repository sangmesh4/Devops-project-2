// Lavish Estates — interactions
document.addEventListener('DOMContentLoaded', function () {
  // Smooth active-link highlight
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Reveal cards on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.property-card, .location-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(28px)';
    card.style.transition = `opacity .6s ease ${i * 0.05}s, transform .6s ease ${i * 0.05}s`;
    observer.observe(card);
  });
});

function validateForm(event) {
  event.preventDefault();
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const interest = document.getElementById('interest').value;
  const status = document.getElementById('formStatus');

  if (!name || !phone || !interest) {
    status.textContent = 'Please complete all required fields.';
    return false;
  }
  if (!/^[0-9+\s-]{10,15}$/.test(phone)) {
    status.textContent = 'Please enter a valid phone number.';
    return false;
  }
  status.textContent = 'Thank you, ' + name + '. Our luxury property advisor will contact you shortly.';
  event.target.reset();
  return false;
}
