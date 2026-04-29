import { useState } from 'react';
import './CalculatorPage.css';

export default function CalculatorPage() {
  const [capacity, setCapacity] = useState(1000);
  const [ticketPrice, setTicketPrice] = useState(45);

  const calculations = {
    totalRevenue: capacity * ticketPrice,
    venueCost: capacity * 15,
    artistFees: capacity * 8,
    staffCost: 2000,
    marketing: 1500,
    platformFee: (capacity * ticketPrice) * 0.05,
    totalExpenses: (capacity * 15) + (capacity * 8) + 2000 + 1500 + ((capacity * ticketPrice) * 0.05),
  };

  calculations.totalExpenses = calculations.venueCost + calculations.artistFees + calculations.staffCost + calculations.marketing + calculations.platformFee;

  const profit = calculations.totalRevenue - calculations.totalExpenses;

  return (
    <div className="container calculator-page">
      <h1>Event Financial Calculator</h1>

      <div className="calculator-wrapper">
        <div className="calculator-inputs">
          <fieldset>
            <legend>Event Parameters</legend>

            <div className="input-group">
              <label>Venue Capacity</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="slider"
                />
                <span className="slider-value">{capacity} people</span>
              </div>
            </div>

            <div className="input-group">
              <label>Ticket Price</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(Number(e.target.value))}
                  className="slider"
                />
                <span className="slider-value">€{ticketPrice}</span>
              </div>
            </div>
          </fieldset>
        </div>

        <div className="calculator-results">
          <div className="result-section revenue">
            <h3>Revenue</h3>
            <div className="result-item">
              <span>Total Ticket Sales</span>
              <span className="amount">€{calculations.totalRevenue.toFixed(2)}</span>
            </div>
          </div>

          <div className="result-section expenses">
            <h3>Expenses</h3>
            <div className="result-item">
              <span>Venue Cost</span>
              <span className="amount">€{calculations.venueCost.toFixed(2)}</span>
            </div>
            <div className="result-item">
              <span>Artist Fees</span>
              <span className="amount">€{calculations.artistFees.toFixed(2)}</span>
            </div>
            <div className="result-item">
              <span>Staff Cost</span>
              <span className="amount">€{calculations.staffCost.toFixed(2)}</span>
            </div>
            <div className="result-item">
              <span>Marketing</span>
              <span className="amount">€{calculations.marketing.toFixed(2)}</span>
            </div>
            <div className="result-item">
              <span>Platform Fee (5%)</span>
              <span className="amount">€{calculations.platformFee.toFixed(2)}</span>
            </div>
            <div className="result-item total">
              <span>Total Expenses</span>
              <span className="amount">€{calculations.totalExpenses.toFixed(2)}</span>
            </div>
          </div>

          <div className={`result-section profit ${profit >= 0 ? 'positive' : 'negative'}`}>
            <h3>Net Profit</h3>
            <div className="profit-value">€{profit.toFixed(2)}</div>
            <div className="profit-percentage">
              {((profit / calculations.totalRevenue) * 100).toFixed(1)}% margin
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
