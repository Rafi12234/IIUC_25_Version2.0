import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dummyNotifications = [
    'Welcome back!',
    'Your profile is 80% complete',
    'New course available'
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-800 text-white transition-colors"
      >
        <Bell size={20} />
        <span className="absolute -top-1 -right-1 bg-red-600 text-xs px-1.5 py-0.5 rounded-full text-white font-bold">
          3
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-lg p-3 shadow-lg border border-gray-800 z-50">
          <h4 className="text-white font-semibold text-sm mb-2 px-2">Notifications</h4>
          {dummyNotifications.map((notification, index) => (
            <div key={index} className="px-2 py-2 text-gray-300 text-sm hover:bg-gray-800 rounded cursor-pointer transition-colors">
              • {notification}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
