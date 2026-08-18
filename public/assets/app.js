(() => {
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  const shareButton = document.querySelector('[data-share]');
  const shareStatus = document.querySelector('#share-status');

  if (!shareButton || !shareStatus) return;

  shareButton.addEventListener('click', async () => {
    const shareData = {
      title: document.title,
      text: document.querySelector('.article-page__dek')?.textContent?.trim() || document.title,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        shareStatus.textContent = 'Enlace compartido.';
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      shareStatus.textContent = 'Enlace copiado al portapapeles.';
    } catch (error) {
      if (error?.name !== 'AbortError') {
        shareStatus.textContent = 'No fue posible compartir; copia la dirección del navegador.';
      }
    }
  });
})();
