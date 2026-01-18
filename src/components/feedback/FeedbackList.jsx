import React, { useState, useEffect } from 'react';
import api from '../api'; // Use the configured api instance
import toast from 'react-hot-toast';
import FeedbackForm from './FeedbackForm';

const FeedbackList = ({ isAdmin = false }) => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    rating: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [filters, currentPage]);

  const fetchFeedback = async () => {
    try {
      // FIXED: Use relative paths and the 'api' instance
      const endpoint = isAdmin ? '/feedback' : '/feedback/my-feedback';
      const params = {
        page: currentPage,
        ...filters
      };
      
      const response = await api.get(endpoint, { params });
      if (response.data.success) {
        setFeedback(response.data.feedback);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      // FIXED: Use relative paths and the 'api' instance
      const endpoint = isAdmin ? `/feedback/admin/${feedbackId}` : `/feedback/${feedbackId}`;
      const response = await api.delete(endpoint);
      if (response.data.success) {
        toast.success('Feedback deleted successfully');
        fetchFeedback();
      }
    } catch (error) {
      toast.error('Failed to delete feedback');
    }
  };

  const handleEditClick = (feedbackItem) => {
    setEditingFeedback(feedbackItem);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setEditingFeedback(null);
    fetchFeedback();
  };

  const handleViewClick = (feedbackItem) => {
    setSelectedFeedback(feedbackItem);
    setShowModal(true);
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500"></div>
      </div>
    );
  }

  if (showEditForm && !isAdmin) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={() => setShowEditForm(false)}
            className="flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Feedback
          </button>
        </div>
        <FeedbackForm
          existingFeedback={editingFeedback}
          onSuccess={handleEditSuccess}
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? 'All Feedback' : 'My Feedback'}
          </h2>
          <p className="text-gray-600">Manage and review customer feedback</p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">All Categories</option>
              <option value="service">Service Quality</option>
              <option value="equipment">Equipment Quality</option>
              <option value="website">Website Experience</option>
              <option value="staff">Staff Behavior</option>
              <option value="pricing">Pricing</option>
              <option value="suggestion">Suggestion</option>
            </select>

            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeedback.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <p className="text-gray-500 text-lg">No feedback found</p>
            </div>
          ) : (
            filteredFeedback.map((item) => (
              <FeedbackCard
                key={item._id}
                feedback={item}
                isAdmin={isAdmin}
                onView={handleViewClick}
                onEdit={handleEditClick}
                onDelete={deleteFeedback}
                getRatingStars={getRatingStars}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-10 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  page === currentPage
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedFeedback && (
        <FeedbackModal
          feedback={selectedFeedback}
          isAdmin={isAdmin}
          onClose={() => setShowModal(false)}
          getRatingStars={getRatingStars}
        />
      )}
    </>
  );
};

// ... FeedbackCard and FeedbackModal components remain mostly the same ...
const FeedbackCard = ({ feedback, isAdmin, onView, onEdit, onDelete, getRatingStars }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{feedback.subject}</h3>
          <span className="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 uppercase">
            {feedback.category.replace('-', ' ')}
          </span>
        </div>
        <div className="flex items-center mb-3">
          <span className="text-xl text-yellow-500">{getRatingStars(feedback.rating)}</span>
          <span className="ml-2 text-sm text-gray-600">({feedback.rating}/5)</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{feedback.message}</p>
      </div>
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
        <button onClick={() => onView(feedback)} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm">
          View Details
        </button>
        {!isAdmin && (
          <button onClick={() => onEdit(feedback)} className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
        )}
        <button onClick={() => onDelete(feedback._id)} className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );
};

const FeedbackModal = ({ feedback, isAdmin, onClose, getRatingStars }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Feedback Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="space-y-6">
          <div><h4 className="text-sm font-medium text-gray-500">Subject</h4><p className="text-lg font-semibold">{feedback.subject}</p></div>
          <div className="grid grid-cols-2 gap-6">
            <div><h4 className="text-sm font-medium text-gray-500">Category</h4><span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600">{feedback.category.toUpperCase()}</span></div>
            <div><h4 className="text-sm font-medium text-gray-500">Rating</h4><div className="flex items-center gap-2"><span className="text-yellow-500">{getRatingStars(feedback.rating)}</span></div></div>
          </div>
          {isAdmin && (
            <div><h4 className="text-sm font-medium text-gray-500">Submitted By</h4><p>{feedback.isAnonymous ? 'Anonymous' : feedback.user?.name}</p></div>
          )}
          <div><h4 className="text-sm font-medium text-gray-500">Message</h4><div className="bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">{feedback.message}</div></div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackList;