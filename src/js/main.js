document.addEventListener("DOMContentLoaded", () => {
  const swiper = new Swiper(".swiper", {
    /* loop: true, */
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    spaceBetween: "24px",
    slidesPerView: 1,
    autoplay: {
        delay: 2500,
        pauseOnMouseEnter: true,
        disableOnInteraction: false,
    },
    breakpoints: {
      375: {
        slidesPerView: 1,
        spaceBetween: "10px",
      },
      1140: {
        spaceBetween: "24px",
        slidesPerView: 2.8,
      },
    },
  });

  const swiperNews = new Swiper(".swiper-news", {
    /* loop: true, */
    navigation: {
      nextEl: ".swiper-button-next-news",
      prevEl: ".swiper-button-prev-news",
    },
    spaceBetween: "24px",
    slidesPerView: 1,
    autoplay: {
        delay: 2500,
        pauseOnMouseEnter: true,
        disableOnInteraction: false,
    },
    breakpoints: {
      375: {
        slidesPerView: 1,
        spaceBetween: "10px",
      },
      1140: {
        spaceBetween: "24px",
        slidesPerView: 2.8,
      },
    },
  });
});
