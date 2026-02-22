import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

// Import images (you'll need to add these images to your project)
// For now, we'll use placeholder comments - replace with actual imports
import plumcake from "../assets/plumcake.jpg";
import plumCake2 from "../assets/plumcake2.png";
import plumCake4 from "../assets/plumcake4.png";
import plumCake1 from "../assets/plumcake1.png";
import plumcake5 from "../assets/plumcake5.png";
import plumCake3 from "../assets/plumcake3.png";
import cookies from "../assets/cookies.jpg";
import malaiToast from "../assets/MalaiToast.jpg";

const Home = () => {
  // Featured cakes data
  const featuredCakes = [
    {
      id: 1,
      name: "Classic Plum Cake",
      description: "Rich, moist plum cake with premium dry fruits",
      price: "$34.99",
      image: plumcake,
      badge: "Bestseller",
    },
    {
      id: 2,
      name: "Belgian Chocolate Cake",
      description: "Decadent chocolate layers with ganache",
      price: "$39.99",
      image: plumCake2,
      badge: "New",
    },
    {
      id: 3,
      name: "Mixed Fruit Cake",
      description: "Fresh fruits and cream in every bite",
      price: "$29.99",
      image: plumCake3,
      badge: "Seasonal",
    },
    {
      id: 4,
      name: "Red Velvet Cake",
      description: "Classic red velvet with cream cheese frosting",
      price: "$37.99",
      image: plumCake4,
      badge: "Popular",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Mani",
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
      name: "Praveen",
      comment:
        "Fresh, delicious, and delivered on time. My new favorite bakery!",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=33",
    },
  ];

  return (
    <div className="home-page">
      {/* Hero Section with Parallax Effect */}
      <section className="hero-section1">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">Deep Bakes</span>
          <h1 className="hero-title">
            Artisanal Bakes for
            <span className="highlight"> Every Occasion</span>
          </h1>
          <p className="hero-subtitle">
            Handcrafted with love, using the finest ingredients and traditional
            recipes
          </p>
          <div className="hero-buttons">
            <Link to="/shop" className="btn btn-primary btn-large">
              Explore Our Treats
            </Link>
            {/* <Link to="/custom-order" className="btn btn-outline btn-large">
              Custom Order
            </Link> */}
          </div>
          {/* <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Varieties</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24h</span>
              <span className="stat-label">Fresh Daily</span>
            </div>
          </div> */}
        </div>
        <div className="hero-image">
          <img
            src={plumcake}
            alt="Delicious cake"
            style={{ width: "500px", height: "400px" }}
            className="floating-animation1"
          />
        </div>
      </section>

      {/* Featured Categories */}
      <section className="categories-section">
        <div className="section-header">
          <span className="section-subtitle"></span>
          <h2 className="section-title">Our Specialties</h2>
        </div>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-image">
              <img src={plumcake} alt="Plum Cakes" />
            </div>
            <h3>Chocolates</h3>
            <p>Rich, moist, and full of flavor</p>
          </div>
          <div className="category-card">
            <div className="category-image">
              <img src={cookies} alt="Cookies" />
            </div>
            <h3>Cookies</h3>
            <p>Decadent and indulgent</p>
          </div>
          <div className="category-card">
            <div className="category-image">
              <img src={malaiToast} />
            </div>
            <h3>Malai Toast</h3>
            <p>Fresh and fruity delights</p>
          </div>
          <div className="category-card">
            <div className="category-image">
              <img src={plumCake3} />
            </div>
            <h3>Cupcakes</h3>
            <p>Perfect bite-sized treats</p>
          </div>
        </div>
      </section>

      {/* <section className="featured-section">
        <div className="section-header">
          <span className="section-subtitle">Our Bestsellers</span>
          <h2 className="section-title">Featured Cakes</h2>
        </div>
        <div className="cakes-grid">
          {featuredCakes.map((cake) => (
            <div key={cake.id} className="cake-card">
              <div className="cake-image">
                <img src={cake.image} alt={cake.name} />
                {cake.badge && <span className="cake-badge">{cake.badge}</span>}
                <div className="cake-overlay">
                  <button className="quick-view-btn">Quick View</button>
                </div>
              </div>
              <div className="cake-info">
                <h3>{cake.name}</h3>
                <p>{cake.description}</p>
                <div className="cake-footer">
                  <span className="cake-price">{cake.price}</span>
                  <Link to={`/product/${cake.id}`} className="btn btn-small">
                    Order Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="section-footer">
          <Link to="/shop" className="btn btn-secondary">
            View All Cakes
          </Link>
        </div>
      </section> */}

      {/* Special Offer Banner */}
      {/* <section className="offer-banner">
        <div className="offer-content">
          <span className="offer-tag">Limited Time Offer</span>
          <h2>Get 20% Off on First Order</h2>
          <p>Use code: SWEETJOY20</p>
          <Link to="/shop" className="btn btn-primary btn-large">
            Shop Now
          </Link>
        </div>
        <div className="offer-image">
          <img
            src="https://images.unsplash.com/photo-1558301211-0d8c8ddee6b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Special offer cake"
          />
        </div>
      </section> */}

      {/* Features Section */}
      <section className="features-section">
        <div className="feature">
          <div className="feature-icon-wrapper">
            <span className="feature-icon">🥐</span>
          </div>
          <h3>Fresh Daily</h3>
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
        <div className="feature">
          <div className="feature-icon-wrapper">
            <span className="feature-icon">🎂</span>
          </div>
          <h3>Custom Orders</h3>
          <p>Personalized cakes for your special occasions</p>
        </div>
      </section>

      {/* Testimonials Section */}
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

      {/* Instagram Gallery */}
      <section className="gallery-section">
        <div className="section-header">
          <span className="section-subtitle">Contact Us On</span>
          {/* <h2 className="section-title">@deep_bakes_</h2> */}
        </div>
        {/* Contact Information Section */}
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

            {/* New Location Item */}
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
                <span className="location-detail">
                  Serving fresh across the city
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      {/* <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Subscribe to Our Newsletter</h2>
          <p>Get updates on new products, special offers, and baking tips</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
        </div>
      </section> */}
    </div>
  );
};

export default Home;
