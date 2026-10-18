// kelistrikanNotification.tsx
// Komponen notifikasi UI untuk kelistrikan kurang

import React from 'react';
import { CheckCircle, AlertCircle, Zap, Battery, Power } from 'lucide-react';
import { KelistrikanNotification } from './kelistrikanLogic';

interface KelistrikanNotificationProps {
  notification: KelistrikanNotification;
  onMarkAsRead: (id: string) => void;
  onResolve: (id: string) => void;
}

export default function KelistrikanNotificationComponent({
  notification,
  onMarkAsRead,
  onResolve,
}: KelistrikanNotificationProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleResolve = () => {
    onResolve(notification.id);
  };

  const getSeverityColor = () => {
    switch (notification.severity) {
      case 'ringan': return 'bg-yellow-100 border-yellow-300';
      case 'sedang': return 'bg-orange-100 border-orange-300';
      case 'berat': return 'bg-red-100 border-red-300';
      case 'kritis': return 'bg-purple-100 border-purple-400';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getSeverityIcon = () => {
    switch (notification.severity) {
      case 'ringan': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'sedang': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'berat': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'kritis': return <AlertCircle className="w-5 h-5 text-purple-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRatingImpactText = () => {
    const impact = Math.abs(notification.value);
    if (impact === 1) return 'Peringkat turun 1 poin';
    if (impact === 2) return 'Peringkat turun 2 poin';
    if (impact === 3) return 'Peringkat turun 3 poin';
    if (impact === 5) return 'Peringkat turun 5 poin';
    return `Peringkat turun ${impact} poin`;
  };

  return (
    <div className={`border rounded-lg p-4 mb-3 ${getSeverityColor()} ${notification.isRead ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="mt-1">
            {getSeverityIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-lg">{notification.title}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                notification.severity === 'ringan' ? 'bg-yellow-200 text-yellow-800' :
                notification.severity === 'sedang' ? 'bg-orange-200 text-orange-800' :
                notification.severity === 'berat' ? 'bg-red-200 text-red-800' :
                'bg-purple-200 text-purple-800'
              }`}>
                {notification.severity.toUpperCase()}
              </span>
            </div>
            
            <p className="text-gray-700 mt-1">{notification.message.split('\n')[0]}</p>
            
            <div className="mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  <span>Defisit: <strong>{notification.deficitAmount} MW</strong></span>
                </div>
                <div className="flex items-center">
                  <Battery className="w-4 h-4 mr-1" />
                  <span>Durasi: <strong>{notification.durationDays} hari</strong></span>
                </div>
                <div className="flex items-center">
                  <Power className="w-4 h-4 mr-1" />
                  <span className="text-red-600 font-semibold">{getRatingImpactText()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
            >
              {isExpanded ? '▲ Sembunyikan Detail' : '▼ Lihat Detail Lengkap'}
            </button>

            {isExpanded && (
              <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">📋 Detail Krisis</h4>
                    <ul className="space-y-1 text-sm">
                      <li><strong>Defisit Listrik:</strong> {notification.deficitAmount} MW</li>
                      <li><strong>Tingkat Keparahan:</strong> {notification.severity.toUpperCase()}</li>
                      <li><strong>Durasi Estimasi:</strong> {notification.durationDays} hari</li>
                      <li><strong>Hari Tersisa:</strong> {notification.remainingDurationDays} hari</li>
                      <li><strong>Mulai:</strong> {notification.startDate}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">📍 Area Terdampak</h4>
                    <ul className="space-y-1 text-sm">
                      {notification.affectedAreas.map((area, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <h4 className="font-semibold text-red-700 mb-2">⚠️ Dampak terhadap Pemerintahan</h4>
                  <p className="text-sm text-red-700">
                    Krisis kelistrikan ini berdampak langsung pada tingkat kepercayaan publik. 
                    Setiap notifikasi kelistrikan kurang akan mengurangi peringkat kepuasan rakyat sebesar {Math.abs(notification.value)} poin.
                    Respon cepat terhadap krisis ini dapat membantu memulihkan kepercayaan publik.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-2 ml-4">
          {!notification.isRead && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
            >
              Tandai Dibaca
            </button>
          )}
          
          <button
            onClick={handleResolve}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition flex items-center justify-center"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Tangani & Terapkan Dampak
          </button>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        Dikirim oleh: {notification.sender} • {notification.timestamp}
      </div>
    </div>
  );
}