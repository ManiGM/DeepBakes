import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Home.css";
import plumCake from "../assets/plum.jpeg";
import Chocolates from "../assets/Chocolates.jpeg";
import CupCake from "../assets/cupcakes.jpeg";
import cookies from "../assets/cookies.jpeg";
import Donuts from "../assets/LoginImage.jpg";
import Bananna from "../assets/Bananna.jpeg";
import Brownie from "../assets/brownie.jpeg";
import Apricot from "../assets/Apricot.jpeg";
import malaiToast from "../assets/MalaiToast.jpg";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const testimonials = [
    {
      id: 1,
      name: "Sai Jayanth",
      comment:
        "The best plum cake I've ever tasted! Perfect for our Christmas party.",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=12",
    },

    {
      id: 2,
      name: "Poojita",
      comment: "Ordered a custom birthday cake and it was absolutely gorgeous!",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=47",
    },
    {
      id: 3,
      name: "Srivalli",
      comment:
        "Fresh, delicious, and delivered on time. My new favorite bakery!",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=41",
    },
  ];

  const heroSlides = [
    {
      id: 1,
      title: "Freshly Baked",
      highlight: "Premium Plum Cakes",
      subtitle:
        "Rich, moist and baked with premium dry fruits | Loaded with cashews, almonds & raisins",
      image: plumCake,
      features: ["Premium dry fruits", "Rich & moist texture"],
    },
    {
      id: 2,
      title: "Crispy & Golden",
      highlight: "Malai Toast",
      subtitle:
        "Traditional taste with a modern twist | Creamy malai filling | Perfect tea-time companion",
      image: malaiToast,
      features: [
        "Creamy malai filling",
        "Crispy exterior",
        "Traditional recipe",
      ],
    },
    {
      id: 3,
      title: "Sweet & Crunchy",
      highlight: "Cookies",
      subtitle:
        "Perfect companions for your tea time | Melt-in-mouth texture | Available in different flavors",
      image: cookies,
      features: ["Pure Ghee", "5 flavors", "Melt-in-mouth"],
    },
    {
      id: 4,
      title: "Rich & Creamy",
      highlight: "Chocolates",
      subtitle:
        "Rich, smooth and perfectly crafted chocolates for every occasion",
      image: Chocolates,
      features: ["Belgian chocolate", "Gooey center", "Walnut topping"],
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "1%",
        }}
      >
        <span className="hero-badge">
          Deep Bakes
          <span className="tagline">Flavour of Purity, Taste of Home</span>
        </span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "-1%",
          marginBottom: "1%",
        }}
      >
        <span className="quality-banner">
          No Maida • No Sugar • No Preservatives • Eggless
        </span>
      </div>
      <div className="home-page">
        <section className="hero-carousel">
          <div className="carousel-container">
            <div
              className="carousel-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {heroSlides.map((slide) => (
                <div key={slide.id} className="carousel-slide">
                  <div className="slide-content">
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                      {/* <span className="hero-badge">
                      Deep Bakes
                      <span className="tagline">
                        Flavour of Purity, Taste of Home
                      </span>
                    </span> */}
                      <h1 className="hero-title">
                        {slide.title}
                        <span className="highlight">{slide.highlight}</span>
                      </h1>

                      <p className="hero-subtitle">{slide.subtitle}</p>

                      <div className="hero-buttons">
                        <Link to="/shop" className="btn btn-primary1 btn-large">
                          Explore Now
                        </Link>
                      </div>
                    </div>

                    <div className="hero-image">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="floating-animation1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button className="carousel-arrow prev" onClick={prevSlide}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="carousel-arrow next" onClick={nextSlide}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {/* Thumbnail Navigation */}
            {/* <div className="carousel-thumbnails">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`thumbnail ${index === currentSlide ? "active" : ""}`}
                onClick={() => goToSlide(index)}
              >
                <img src={slide.image} alt={slide.title} />
                <div className="thumbnail-overlay"></div>
              </div>
            ))}
          </div> */}

            {/* Dots Indicator */}
            <div className="carousel-dots">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentSlide ? "active" : ""}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Rest of the sections remain the same */}
        <section className="categories-section">
          <div className="section-header">
            <span className="section-subtitle"></span>
            <h2 className="section-title">Our Specialties</h2>
          </div>
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-image">
                <img src={Donuts} alt="Plum Cakes" />
              </div>
              <h3>DoughNuts</h3>
              <p>Rich, moist, and full of flavor</p>
            </div>
            <div className="category-card">
              <div className="category-image">
                <img src={Brownie} alt="Brownie" />
              </div>
              <h3>Brownies</h3>
              <p>Dense • Gooey • Chocolate Loaded</p>
            </div>
            <div className="category-card">
              <div className="category-image">
                <img src={Bananna} alt="Malai Toast" />
              </div>
              <h3>Bananna Cakes</h3>
              <p>Fresh and fruity delights</p>
            </div>
            <div className="category-card">
              <div className="category-image">
                <img src={CupCake} alt="Cup Cakes" />
              </div>
              <h3>Cup Cakes</h3>
              <p>Perfect bite-sized treats</p>
            </div>
          </div>
          {/* <div className="category-card" style={{ marginTop: "30px" }}>
            <div className="category-image">
              <img src={Brownie} alt="Malai Toast" />
            </div>
            <h3>Brownies</h3>
            <p>Dense • Gooey • Chocolate Loaded</p>
          </div> */}
        </section>
        <section className="features-section">
          <div className="feature">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🥐</span>
            </div>
            <h3>Baked Freshly</h3>
            <p>Baked fresh every morning with premium ingredients</p>
          </div>
          <div className="feature">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🌱</span>
            </div>
            <h3>Quality Ingredients</h3>
            <p>Only the finest organic and locally sourced ingredients</p>
          </div>
          <div className="feature">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🚚</span>
            </div>
            <h3>Free Delivery</h3>
            <p>On orders over ₹500, delivered to your doorstep</p>
          </div>
          {/* <div className="feature">
          <div className="feature-icon-wrapper">
            <span className="feature-icon">🎂</span>
          </div>
          <h3>Custom Orders</h3>
          <p>Personalized cakes for your special occasions</p>
        </div> */}
        </section>
        <section className="testimonials-section">
          <div className="section-header">
            <span className="section-subtitle">What Our Customers Say</span>
            <h2 className="section-title">Customer Love</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="star">
                      ★
                    </span>
                  ))}
                </div>
                <p className="testimonial-comment">"{testimonial.comment}"</p>
                <div className="testimonial-author">
                  <img src={testimonial.image} alt={testimonial.name} />
                  <div>
                    <h4>{testimonial.name}</h4>
                    <span>Verified Customer</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="gallery-section">
          <div className="section-header">
            <span className="section-subtitle">Contact Us On</span>
          </div>
          <div className="contact-section">
            <div className="contact-card">
              <div className="contact-item">
                <div className="contact-icon whatsapp-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <div className="contact-details">
                  <span className="contact-label">Order on WhatsApp</span>
                  <a
                    href="https://wa.me/917386428135"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-value whatsapp-link"
                  >
                    +91 73864 28135
                  </a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon instagram-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </div>
                <div className="contact-details">
                  <span className="contact-label">Follow on Instagram</span>
                  <a
                    href="https://instagram.com/deep_bakes_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-value instagram-link"
                  >
                    @deep_bakes_
                  </a>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon location-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="contact-details">
                  <span className="contact-label">Visit Our Store</span>
                  <span className="contact-value location-text">
                    Hyderabad, Telangana
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
