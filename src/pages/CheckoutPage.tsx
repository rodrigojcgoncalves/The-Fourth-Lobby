import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    zipCode: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing
    alert('Payment processed successfully!');
    navigate('/success');
  };

  return (
    <div className="container checkout-page">
      <div className="checkout-wrapper">
        <div className="checkout-form-section">
          <h1>Checkout</h1>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-item">
              <span>DIMENSION IV Ticket (Early Bird)</span>
              <span>€45.00</span>
            </div>
            <div className="summary-item">
              <span>Service Fee</span>
              <span>€2.50</span>
            </div>
            <div className="summary-total">
              <span>Total:</span>
              <span>€47.50</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="checkout-form">
            {/* Personal Info */}
            <fieldset>
              <legend>Personal Information</legend>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
                />
              </div>
            </fieldset>

            {/* Payment Method Selection */}
            <fieldset>
              <legend>Payment Method</legend>
              <div className="payment-methods">
                <label className="payment-method-label">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Credit Card</span>
                </label>
                <label className="payment-method-label">
                  <input
                    type="radio"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>PayPal</span>
                </label>
                <label className="payment-method-label">
                  <input
                    type="radio"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>Bank Transfer</span>
                </label>
              </div>
            </fieldset>

            {/* Card Details */}
            {paymentMethod === 'card' && (
              <fieldset>
                <legend>Card Details</legend>
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="4532 1234 5678 9010"
                    maxLength={19}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={3}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="zipCode">Zip Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="4000-000"
                  />
                </div>
              </fieldset>
            )}

            <button type="submit" className="btn-primary checkout-button">
              Complete Purchase - €47.50
            </button>
          </form>

          <p className="secure-badge">
            🔒 Your payment is secure and encrypted
          </p>
        </div>

        {/* Sidebar Info */}
        <aside className="checkout-sidebar">
          <div className="sidebar-card">
            <h3>Event Details</h3>
            <div className="event-info-item">
              <span className="label">Event</span>
              <span className="value">DIMENSION IV: The Awakening</span>
            </div>
            <div className="event-info-item">
              <span className="label">Date</span>
              <span className="value">Apr 15, 2026</span>
            </div>
            <div className="event-info-item">
              <span className="label">Location</span>
              <span className="value">Warehouse District, Porto</span>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>Have a Promo Code?</h3>
            <div className="promo-input">
              <input type="text" placeholder="Enter code" />
              <button type="button" className="btn-small">Apply</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
