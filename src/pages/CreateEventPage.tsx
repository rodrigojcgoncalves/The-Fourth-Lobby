import { useState } from 'react';
import './CreateEventPage.css';

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    capacity: '',
    description: '',
    image: '',
    ticketPrice: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Event created successfully!');
  };

  return (
    <div className="container create-event-page">
      <h1>Create New Event</h1>

      <form onSubmit={handleSubmit} className="create-event-form">
        <fieldset>
          <legend>Event Details</legend>

          <div className="form-group">
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="DIMENSION V: The Transcendence"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Event Date</label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="capacity">Capacity</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                placeholder="1000"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Warehouse District, Porto"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange as any}
              placeholder="Describe your event..."
              rows={5}
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="image">Event Image URL</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="ticketPrice">Ticket Price (€)</label>
              <input
                type="number"
                id="ticketPrice"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                step="0.01"
                placeholder="45.00"
              />
            </div>
          </div>
        </fieldset>

        <button type="submit" className="btn-primary btn-large">
          Create Event
        </button>
      </form>
    </div>
  );
}
