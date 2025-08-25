'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/auth-utils';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  year: string;
  trialStartDate: string;
  trialEndDate: string;
  subscriptionStatus: string;
  subscriptionType: string | null;
  subscriptionEndDate: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await apiClient.get('/user/profile');
      if (response.ok) {
        const userProfile = await response.json();
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/landing');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion');
      return;
    }

    try {
      const response = await apiClient.delete('/user/account');
      if (response.ok) {
        logout();
        router.push('/landing');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  const getTrialDaysLeft = () => {
    if (!profile) return 0;
    const trialEnd = new Date(profile.trialEndDate);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getSubscriptionStatus = () => {
    if (!profile) return 'Unknown';
    
    if (profile.subscriptionStatus === 'active') {
      return 'Active Subscription';
    } else if (profile.subscriptionStatus === 'trial') {
      const daysLeft = getTrialDaysLeft();
      if (daysLeft > 0) {
        return `Trial (${daysLeft} days left)`;
      } else {
        return 'Trial Expired';
      }
    } else {
      return 'No Active Subscription';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Not authenticated</h1>
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
            Please log in
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {user.firstName} {user.lastName}
          </h1>
          <p className="text-lg text-gray-600">Your Personal Account</p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            href="/main"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            Practice
          </Link>
          <Link
            href="/payment"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            Upgrade Plan
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors duration-200"
          >
            Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                  <dd className="mt-1 text-lg text-gray-900">{user.firstName} {user.lastName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-lg text-gray-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">School</dt>
                  <dd className="mt-1 text-lg text-gray-900">{user.school}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Year Level</dt>
                  <dd className="mt-1 text-lg text-gray-900">{user.year}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="mt-1 text-lg text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Status Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Status</h2>
              
              <div className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Current Status</dt>
                  <dd className="mt-1 text-lg font-semibold">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      profile?.subscriptionStatus === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : profile?.subscriptionStatus === 'trial' && getTrialDaysLeft() > 0
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getSubscriptionStatus()}
                    </span>
                  </dd>
                </div>
                
                {profile?.subscriptionStatus === 'trial' && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Trial Days Remaining</dt>
                    <dd className="mt-1 text-lg text-gray-900">
                      <span className="font-bold text-blue-600">{getTrialDaysLeft()}</span> days
                    </dd>
                  </div>
                )}

                {profile?.subscriptionType && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Plan Type</dt>
                    <dd className="mt-1 text-lg text-gray-900">{profile.subscriptionType}</dd>
                  </div>
                )}

                {profile?.subscriptionEndDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Subscription Ends</dt>
                    <dd className="mt-1 text-lg text-gray-900">
                      {new Date(profile.subscriptionEndDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}

                {profile?.subscriptionStatus === 'trial' && getTrialDaysLeft() <= 7 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ Your trial is ending soon! Upgrade to continue accessing all features.
                    </p>
                    <Link
                      href="/payment"
                      className="mt-2 inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm font-medium"
                    >
                      Upgrade Now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Danger Zone</h3>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Delete Account
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Management</h3>
                <Link
                  href="/payment"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Manage Subscription
                </Link>
                <p className="text-xs text-gray-500 mt-2">
                  Update your subscription plan or payment method.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Account</h3>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your data, including progress and subscription information, will be permanently deleted.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type "DELETE" to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 