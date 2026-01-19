import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Search, Filter, Trash2, Eye, Download, X, CheckCircle } from 'lucide-react';

const SupportTicketList = ({ isAdmin = false }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [filters, currentPage, isAdmin]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? '/support-tickets' : '/support-tickets/my-tickets';
      
      const response = await api.get(endpoint, {
        params: {
          page: currentPage,
          ...filters
        }
      });

      if (response.data.success) {
        setTickets(response.data.tickets);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, status, adminReply = '') => {
    try {
      const response = await api.put(`/support-tickets/${ticketId}`, {
        status,
        adminReply
      });
      
      if (response.data.success) {
        toast.success('Ticket updated successfully');
        fetchTickets();
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update ticket');
    }
  };

  const deleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    
    try {
      const response = await api.delete(`/support-tickets/${ticketId}`);
      if (response.data.success) {
        toast.success('Ticket deleted successfully');
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to delete ticket');
    }
  };

  // Your existing downloadPDF and downloadAllPDF functions remain here...
  // (Omitted for brevity, but they should stay in your component)

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-gray-100 text-gray-700',
      'in-progress': 'bg-yellow-50 text-yellow-700',
      resolved: 'bg-green-50 text-green-700',
      closed: 'bg-gray-50 text-gray-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-50 text-blue-700',
      medium: 'bg-gray-100 text-gray-700',
      high: 'bg-orange-50 text-orange-700',
      urgent: 'bg-red-50 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isAdmin ? 'Admin Help Desk' : 'My Support Tickets'}
          </h2>
          {isAdmin && (
             <button 
              onClick={() => {/* downloadAllPDF logic */}} 
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all text-sm"
            >
              <Download className="w-4 h-4" /> Export Report
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="relative col-span-1 sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="border rounded-xl px-4 py-2"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select 
            className="border rounded-xl px-4 py-2"
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
          >
            <option value="">All Priorities</option>
            <option value="high">High/Urgent</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map(ticket => (
            <TicketCard 
              key={ticket._id} 
              ticket={ticket} 
              isAdmin={isAdmin}
              onView={() => { setSelectedTicket(ticket); setShowModal(true); }}
              onDelete={deleteTicket}
              getStatusColor={getStatusColor}
              getPriorityColor={getPriorityColor}
            />
          ))}
        </div>
      </div>

      {showModal && selectedTicket && (
        <TicketModal 
          ticket={selectedTicket} 
          isAdmin={isAdmin} 
          onClose={() => setShowModal(false)}
          onUpdate={updateTicketStatus}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
        />
      )}
    </div>
  );
};

const TicketCard = ({ ticket, isAdmin, onView, onDelete, getStatusColor, getPriorityColor }) => (
  <div className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white">
    <div className="flex justify-between items-start mb-4">
      <span className="text-xs font-mono text-gray-400">ID: {ticket._id.slice(-6)}</span>
      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${getStatusColor(ticket.status)}`}>
        {ticket.status}
      </span>
    </div>
    <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{ticket.subject}</h3>
    <div className="flex gap-2 mb-4">
      <span className={`text-[10px] px-2 py-0.5 rounded ${getPriorityColor(ticket.priority)}`}>
        {ticket.priority}
      </span>
      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
        {ticket.category}
      </span>
    </div>
    <div className="flex gap-2 pt-4 border-t">
      <button onClick={onView} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
        View Details
      </button>
      {isAdmin && (
        <button onClick={() => onDelete(ticket._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

const TicketModal = ({ ticket, isAdmin, onClose, onUpdate, getStatusColor, getPriorityColor }) => {
  const [replyText, setReplyText] = useState('');
  const [status, setStatus] = useState(ticket.status);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Ticket Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        </div>
        
        <div className="p-6 space-y-6">
          <section>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subject</label>
            <p className="text-lg font-semibold text-slate-900">{ticket.subject}</p>
          </section>

          <section className="bg-gray-50 p-4 rounded-xl">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</label>
            <p className="text-slate-700 mt-1 whitespace-pre-wrap">{ticket.description}</p>
          </section>

          {ticket.adminReply && (
            <section className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">Official Response</label>
              <p className="text-slate-800 mt-1">{ticket.adminReply}</p>
            </section>
          )}

          {isAdmin && (
            <section className="pt-6 border-t space-y-4">
              <h3 className="font-bold text-gray-800">Admin Resolution</h3>
              <div className="grid grid-cols-2 gap-4">
                <select 
                  className="w-full border rounded-xl p-3"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <textarea 
                placeholder="Write your response to the user..."
                className="w-full border rounded-xl p-4 min-h-[120px]"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button 
                onClick={() => onUpdate(ticket._id, status, replyText)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Update Ticket & Notify User
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTicketList;