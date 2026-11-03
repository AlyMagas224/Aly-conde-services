/**
 * contact.js — Formulaire de contact (validation puis enregistrement).
 */
(function () {
  'use strict';
  const MCS = window.MCS;
  const CONFIG = window.MCS_CONFIG;
  const { $, toast } = MCS.utils;

  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  MCS.boot(async (user) => {
    // Coordonnées affichées à côté du formulaire
    $('#contact-email').textContent = CONFIG.COMPANY.email;
    $('#contact-phone').textContent = CONFIG.COMPANY.phone;
    $('#contact-address').textContent = CONFIG.COMPANY.address;
    $('#contact-hours').textContent = CONFIG.COMPANY.hours;

    const form = $('#contact-form');
    if (user) {
      $('#contact-name').value = user.fullName || '';
      $('#contact-mail').value = user.email || '';
    }

    const setError = (id, message) => {
      $(`#err-${id}`).textContent = message;
      $(`#${id}`).setAttribute('aria-invalid', message ? 'true' : 'false');
    };

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const values = {
        name: $('#contact-name').value.trim(),
        email: $('#contact-mail').value.trim(),
        subject: $('#contact-subject').value.trim(),
        message: $('#contact-message').value.trim(),
      };

      const errors = {};
      if (values.name.length < 2) errors['contact-name'] = 'Saisissez votre nom.';
      if (!EMAIL.test(values.email)) errors['contact-mail'] = 'Saisissez une adresse courriel valide.';
      if (values.subject.length < 2) errors['contact-subject'] = 'Indiquez un sujet.';
      if (values.message.length < 5) errors['contact-message'] = 'Votre message est trop court.';

      ['contact-name', 'contact-mail', 'contact-subject', 'contact-message'].forEach((id) => setError(id, errors[id] || ''));
      const first = Object.keys(errors)[0];
      if (first) { $(`#${first}`).focus(); return; }

      const button = $('#contact-submit');
      button.disabled = true;
      try {
        await MCS.data.sendContact(values);
        form.reset();
        toast('Message envoyé. Nous vous répondrons rapidement.', 'success', 5000);
      } catch (error) {
        console.error(error);
        toast("Le message n'a pas pu être envoyé. Réessayez.", 'error');
      } finally {
        button.disabled = false;
      }
    });
  });
})();
