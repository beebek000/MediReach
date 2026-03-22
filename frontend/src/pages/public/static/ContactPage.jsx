import { useState } from "react";
import StaticPageLayout from "../../../components/layout/StaticPageLayout";
import api from "../../../services/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      setError("Message must be at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.submitContactMessage(form);
      if (res.success) {
        setSent(true);
        setForm({ name: "", email: "", message: "" });
      } else {
        setError(res.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      // The API throws an Error with its message set from the backend JSON
      setError(err.message || "Could not send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StaticPageLayout title="Contact Us">
      <p>
        We're here to help! Whether you have a question about an order, need assistance uploading a prescription, or want to partner with us, our support team is available around the clock.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mt-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-charcoal/5">
          <h3 className="text-xl font-semibold mb-4 text-primary">Get In Touch</h3>
          <ul className="space-y-4">
            <li className="flex flex-col">
              <span className="text-sm text-charcoal/50 uppercase tracking-widest font-semibold">Email Support</span>
              <a href="mailto:medisupport@gmail.com" className="text-charcoal hover:text-primary transition-colors">medisupport@gmail.com</a>
            </li>
            <li className="flex flex-col">
              <span className="text-sm text-charcoal/50 uppercase tracking-widest font-semibold">Phone</span>
              <span className="text-charcoal">9764887532</span>
            </li>
            <li className="flex flex-col">
              <span className="text-sm text-charcoal/50 uppercase tracking-widest font-semibold">Location</span>
              <span className="text-charcoal">Itahari, Nepal</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Send us a message</h3>

          {sent ? (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-primary text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold text-lg">Message sent successfully!</p>
              <p className="text-sm mt-1 text-charcoal/60">We'll get back to you at your email address as soon as possible.</p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-charcoal/70 mb-1">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-white border border-charcoal/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal/70 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-charcoal/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal/70 mb-1">Message</label>
                <textarea
                  rows={4}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  className="w-full bg-white border border-charcoal/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="How can we assist you?"
                  required
                />
              </div>

              {error && (
                <p className="text-soft-red text-sm bg-soft-red/10 border border-soft-red/20 rounded-xl px-4 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white font-medium rounded-xl px-6 py-3 hover:bg-primary-dark transition-colors w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Sending…" : "Submit Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </StaticPageLayout>
  );
}
