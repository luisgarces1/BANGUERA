document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. CONTROL DEL VIDEO INICIAL (OPTIMIZADO PARA MÓVILES)
  // =========================================================================
  const video = document.getElementById('campaignVideo');
  const playOverlay = document.getElementById('videoPlayBtn');
  const aspectWrapper = document.querySelector('.video-aspect-wrapper');

  if (video && playOverlay) {
    // Ajustar automáticamente la proporción del contenedor al formato nativo del video (vertical u horizontal)
    const syncVideoAspectRatio = () => {
      if (video.videoWidth && video.videoHeight && aspectWrapper) {
        aspectWrapper.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
      }
    };

    video.addEventListener('loadedmetadata', syncVideoAspectRatio);
    if (video.readyState >= 1) {
      syncVideoAspectRatio();
    }

    playOverlay.addEventListener('click', async () => {
      try {
        video.classList.add('is-playing');
        video.controls = true;
        playOverlay.classList.add('is-hidden');
        await video.play();
      } catch (err) {
        video.controls = true;
        playOverlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('play', () => {
      video.classList.add('is-playing');
      playOverlay.classList.add('is-hidden');
    });

    video.addEventListener('ended', () => {
      video.classList.remove('is-playing');
      playOverlay.classList.remove('is-hidden');
      // Desplazar suavemente hacia el formulario al terminar el video
      const registroSection = document.getElementById('registro');
      if (registroSection) {
        registroSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // =========================================================================
  // 2. FORMULARIO DE CONVERSIÓN Y VALIDACIÓN AMIGABLE EN MÓVIL
  // =========================================================================
  const joinForm = document.getElementById('joinForm');
  const fullNameInput = document.getElementById('fullName');
  const whatsappInput = document.getElementById('whatsapp');
  const barrioInput = document.getElementById('barrio');

  const fullNameError = document.getElementById('fullNameError');
  const whatsappError = document.getElementById('whatsappError');
  const barrioError = document.getElementById('barrioError');

  const formSuccess = document.getElementById('formSuccess');
  const successDynamicText = document.getElementById('successDynamicText');
  const resetFormBtn = document.getElementById('resetFormBtn');

  // Formateo automático del número de WhatsApp (Ej: 300 123 4567)
  if (whatsappInput) {
    whatsappInput.addEventListener('input', (e) => {
      let digits = e.target.value.replace(/\D/g, '').slice(0, 10);
      let formatted = digits;

      if (digits.length > 6) {
        formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
      } else if (digits.length > 3) {
        formatted = `${digits.slice(0, 3)} ${digits.slice(3)}`;
      }

      e.target.value = formatted;
      clearFieldError(whatsappInput, whatsappError);
    });
  }

  if (fullNameInput) {
    fullNameInput.addEventListener('input', () => {
      clearFieldError(fullNameInput, fullNameError);
    });
  }

  if (barrioInput) {
    barrioInput.addEventListener('input', () => {
      clearFieldError(barrioInput, barrioError);
    });
  }

  function setFieldError(inputEl, errorEl, message) {
    if (!inputEl || !errorEl) return;
    inputEl.classList.add('input-invalid');
    errorEl.textContent = message;
  }

  function clearFieldError(inputEl, errorEl) {
    if (!inputEl || !errorEl) return;
    inputEl.classList.remove('input-invalid');
    errorEl.textContent = '';
  }

  if (joinForm) {
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = fullNameInput.value.trim();
      const rawPhone = whatsappInput.value.replace(/\D/g, '');
      const barrio = barrioInput.value.trim();

      let isValid = true;

      if (fullName.length < 3) {
        setFieldError(fullNameInput, fullNameError, 'Por favor ingresa tu nombre y apellido.');
        isValid = false;
      } else {
        clearFieldError(fullNameInput, fullNameError);
      }

      if (rawPhone.length < 10) {
        setFieldError(
          whatsappInput,
          whatsappError,
          'Ingresa un número de WhatsApp válido de 10 dígitos.'
        );
        isValid = false;
      } else {
        clearFieldError(whatsappInput, whatsappError);
      }

      if (barrio.length < 2) {
        setFieldError(barrioInput, barrioError, 'Por favor indícanos tu barrio en Bello.');
        isValid = false;
      } else {
        clearFieldError(barrioInput, barrioError);
      }

      if (!isValid) {
        const firstInvalid = joinForm.querySelector('.input-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Guardar registro localmente como respaldo inmediato
      const newSupporter = {
        nombre: fullName,
        whatsapp: `+57${rawPhone}`,
        barrio: barrio,
        fecha: new Date().toISOString(),
      };

      try {
        const stored = JSON.parse(localStorage.getItem('registros_banguera_bello') || '[]');
        stored.push(newSupporter);
        localStorage.setItem('registros_banguera_bello', JSON.stringify(stored));
      } catch (_) {
        // Ignorar si el almacenamiento privado está restringido
      }

      // Mostrar confirmación personalizada
      const firstName = fullName.split(' ')[0];
      if (successDynamicText) {
        successDynamicText.textContent = `¡Gracias, ${firstName}! Ya haces parte del equipo de la resistencia en ${barrio}. Pronto te contactaremos por WhatsApp.`;
      }

      joinForm.hidden = true;
      formSuccess.hidden = false;
    });
  }

  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      joinForm.reset();
      formSuccess.hidden = true;
      joinForm.hidden = false;
      fullNameInput.focus();
    });
  }
});

