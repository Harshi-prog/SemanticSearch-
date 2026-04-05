import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Shield, Mail, Calendar, Trash2, UserCheck, MessageSquare, Star } from 'lucide-react';
import { Card, SectionTitle, BowIcon } from '../components/UI';
import { feedbackStore, Feedback } from '../services/feedbackStore';

export const AdminPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'feedback'>('users');
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    setUsers(savedUsers);
    setFeedbacks(feedbackStore.getAllFeedback());
  }, []);

  const deleteUser = () => {
    if (userToDelete) {
      const updatedUsers = users.filter(u => u.email !== userToDelete);
      localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setUserToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-pink-100 dark:border-slate-700"
            >
              <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Delete Account?</h3>
              <p className="text-slate-600 dark:text-slate-400 text-center mb-8">
                Are you sure you want to delete the account for <span className="font-bold text-pink-500">{userToDelete}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteUser}
                  className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <SectionTitle>Admin Dashboard</SectionTitle>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Monitor and manage registered accounts for the Semantic Search Engine.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="bg-white dark:bg-slate-800 border-pink-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-2xl">
              <Users className="w-8 h-8 text-pink-500" />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Users</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{users.length}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="bg-white dark:bg-slate-800 border-pink-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-2xl">
              <Shield className="w-8 h-8 text-pink-500" />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Admins</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                {users.filter(u => u.role === 'admin').length}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-pink-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-2xl">
              <MessageSquare className="w-8 h-8 text-pink-500" />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Feedback</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{feedbacks.length}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'users' 
              ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' 
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-700'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'feedback' 
              ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' 
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-pink-50 dark:hover:bg-slate-700'
          }`}
        >
          Feedback
        </button>
      </div>

      {activeTab === 'users' ? (
        <Card className="overflow-hidden border-none shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-pink-50 dark:bg-slate-800/50 border-b border-pink-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50 dark:divide-slate-800">
                {users.map((user, idx) => (
                  <motion.tr
                    key={user.email}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-pink-50/30 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 opacity-50" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        user.role === 'admin' 
                          ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setUserToDelete(user.email)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {feedbacks.length === 0 ? (
            <Card className="text-center py-12 opacity-60">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-500">No feedback received yet.</p>
            </Card>
          ) : (
            feedbacks.map((fb, idx) => (
              <motion.div
                key={fb.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border-none shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 font-bold">
                        {fb.userId?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{fb.userId || 'Anonymous'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(fb.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= fb.rating ? 'fill-pink-500 text-pink-500' : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-pink-50/50 dark:bg-slate-800/50 p-3 rounded-xl border border-pink-100 dark:border-slate-700">
                      <p className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase mb-1">Query</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{fb.query}"</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      )}
      
      <div className="mt-12 flex justify-center gap-4 opacity-20">
        <BowIcon className="w-6 h-6" />
        <BowIcon className="w-6 h-6" />
        <BowIcon className="w-6 h-6" />
      </div>
    </div>
  );
};
