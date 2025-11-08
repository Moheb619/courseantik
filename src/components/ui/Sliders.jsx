import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Autoplay,
  A11y,
  Keyboard,
  FreeMode,
  EffectFade,
} from "swiper/modules";
import { cls } from "../../utils/cls";
import { useReducedMotion } from "../../hooks/useReducedMotion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const Slider = ({
  children,
  slidesPerView = 1,
  spaceBetween = 30,
  navigation = true,
  pagination = true,
  autoplay = false,
  autoplayDelay = 3000,
  loop = false,
  effect = "slide",
  freeMode = false,
  breakpoints = {},
  className = "",
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();

  const modules = [A11y, Keyboard];

  if (navigation) modules.push(Navigation);
  if (pagination) modules.push(Pagination);
  if (autoplay && !prefersReducedMotion) modules.push(Autoplay);
  if (freeMode) modules.push(FreeMode);
  if (effect === "fade") modules.push(EffectFade);

  return (
    <Swiper
      modules={modules}
      slidesPerView={slidesPerView}
      spaceBetween={spaceBetween}
      navigation={navigation}
      pagination={pagination ? { clickable: true } : false}
      autoplay={
        autoplay && !prefersReducedMotion
          ? { delay: autoplayDelay, disableOnInteraction: false }
          : false
      }
      loop={loop}
      effect={effect}
      freeMode={freeMode}
      breakpoints={breakpoints}
      a11y={{
        enabled: true,
        prevSlideMessage: "Previous slide",
        nextSlideMessage: "Next slide",
        firstSlideMessage: "This is the first slide",
        lastSlideMessage: "This is the last slide",
      }}
      keyboard={{
        enabled: true,
        onlyInViewport: true,
      }}
      className={cls("swiper-container", className)}
      {...props}
    >
      {children}
    </Swiper>
  );
};

const Slide = ({ children, className = "", ...props }) => {
  return (
    <SwiperSlide className={cls("swiper-slide", className)} {...props}>
      {children}
    </SwiperSlide>
  );
};

// Pre-configured sliders for common use cases
const HeroSlider = ({ children, ...props }) => (
  <Slider
    slidesPerView={1}
    effect="fade"
    autoplay={true}
    autoplayDelay={5000}
    loop={true}
    navigation={true}
    pagination={true}
    className="h-96 md:h-[500px]"
    {...props}
  >
    {children}
  </Slider>
);

const CourseSlider = ({ children, ...props }) => (
  <Slider
    slidesPerView={1}
    spaceBetween={24}
    navigation={true}
    pagination={false}
    breakpoints={{
      640: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      1024: { slidesPerView: 4 },
    }}
    className="py-4"
    {...props}
  >
    {children}
  </Slider>
);

const ProductSlider = ({ children, ...props }) => (
  <Slider
    slidesPerView={1}
    spaceBetween={20}
    navigation={true}
    pagination={false}
    breakpoints={{
      640: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      1024: { slidesPerView: 4 },
    }}
    className="py-4"
    {...props}
  >
    {children}
  </Slider>
);

const GallerySlider = ({ children, ...props }) => (
  <Slider
    slidesPerView={1}
    spaceBetween={0}
    navigation={true}
    pagination={true}
    loop={true}
    className="aspect-square md:aspect-video"
    {...props}
  >
    {children}
  </Slider>
);

export {
  Slider,
  Slide,
  HeroSlider,
  CourseSlider,
  ProductSlider,
  GallerySlider,
};

export default Slider;
