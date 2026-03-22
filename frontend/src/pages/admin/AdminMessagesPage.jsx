import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";

export default function AdminMessagesPage() {
  const { user, accessToken } = useAuth();
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, [accessToken]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetContactMessages(1, 50, accessToken);
      if (res.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      addToast("Failed to fetch messages", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.adminUpdateContactStatus(id, newStatus, accessToken);
      if (res.success) {
        setMessages(messages.map(m => m.id === id ? { ...m, status: newStatus } : m));
        addToast("Status updated successfully", "success");
      }
    } catch (err) {
      addToast("Failed to update status", "error");
    }
  };

  return (
    <div className="space-y-6 page-enter">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">Support Messages</h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Manage and respond to customer inquiries
          </p>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-12 text-charcoal/60">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 text-charcoal/60 bg-white rounded-2xl border border-charcoal/5">
          No support messages at this time.
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-charcoal/5 p-6">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="p-4 rounded-xl border border-charcoal/10 bg-cream/30 hover:bg-cream/60 transition-colors flex flex-col md:flex-row gap-4 justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-charcoal">{msg.name}</span>
                    <a href={`mailto:${msg.email}`} className="text-sm text-primary hover:underline">{msg.email}</a>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      msg.status === 'unread' ? 'bg-soft-red/10 text-soft-red' :
                      msg.status === 'read' ? 'bg-primary/10 text-primary' :
                      'bg-charcoal/10 text-charcoal/70'
                    }`}>
                      {msg.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-charcoal/80 text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs text-charcoal/40 mt-3">{new Date(msg.created_at).toLocaleString()}</p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {msg.status !== 'read' && msg.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusChange(msg.id, 'read')}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Mark as Read
                    </button>
                  )}
                  {msg.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusChange(msg.id, 'resolved')}
                      className="px-3 py-1.5 text-xs font-medium text-charcoal bg-charcoal/5 rounded-lg hover:bg-charcoal/10 transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
