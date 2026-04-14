import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, HelpCircle, Send, Search, ThumbsUp, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProductQA, submitProductQuestion } from '../services/api';

const QASection = ({ productId }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    loadQA();
  }, [productId]);

  const loadQA = async () => {
    try {
      setLoading(true);
      const data = await fetchProductQA(productId);
      setQuestions(data || []);
    } catch (err) {
      console.error('Failed to load Q&A:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to ask a question');
    if (!newQuestion.trim()) return;

    setSubmitting(true);
    try {
      await submitProductQuestion(productId, { question: newQuestion });
      setNewQuestion('');
      setShowQuestionForm(false);
      loadQA();
    } catch (err) {
      console.error('Failed to submit question:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.answer && q.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return (
    <div className="flex justify-center py-10">
      <Loader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <HelpCircle className="text-blue-600" size={24} />
            Questions & Answers
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Get answers from the community and experts
          </p>
        </div>
        <button 
          onClick={() => setShowQuestionForm(!showQuestionForm)}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95"
        >
          {showQuestionForm ? 'Cancel' : 'Post a Question'}
        </button>
      </div>

      <AnimatePresence>
        {showQuestionForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="mb-8 overflow-hidden"
          >
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <textarea
                required
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="What would you like to know about this product?"
                className="w-full bg-white border border-blue-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
              <div className="flex justify-end mt-4">
                <button 
                  disabled={submitting}
                  className="bg-blue-600 text-white px-8 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  Post Question
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Have a question? Search for answers..."
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
        />
      </div>

      <div className="space-y-4">
        {filteredQuestions.length > 0 ? filteredQuestions.map((q) => (
          <div key={q.id} className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-black text-gray-500">Q</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-gray-900 leading-tight mb-2">{q.question}</h4>
                <div className="flex items-center gap-4 text-[11px] text-gray-400 font-bold uppercase">
                  <span>Asked by {q.user_name || 'Customer'}</span>
                  <span>•</span>
                  <span>{new Date(q.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {q.answer ? (
              <div className="mt-4 pl-12">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-green-600">A</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-gray-900">Anritvox Expert</span>
                      <span className="bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-sm font-black uppercase">Official</span>
                    </div>
                    <p className="text-sm font-medium text-gray-600 leading-relaxed">{q.answer}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase">
                    <ThumbsUp size={12} />
                    Helpful ({q.helpful_count || 0})
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 pl-12">
                <p className="text-xs text-amber-600 font-bold italic flex items-center gap-2">
                  <Loader2 className="animate-spin" size={12} />
                  Waiting for answer...
                </p>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <MessageSquare className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-sm text-gray-400 font-bold italic">No questions yet. Be the first to ask!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QASection;
