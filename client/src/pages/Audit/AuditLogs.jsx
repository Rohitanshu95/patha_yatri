import React, { useEffect, useState } from "react";
import axiosInstance from "../../config/axios";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        // Technically, audit logs API should ideally be in reports or admin routes
        const res = await axiosInstance.get("/reports/audit");
        setLogs(res.data);
      } catch (error) {
        console.error("Failed to fetch audit logs", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">System Audit Logs</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 border-b">
              <th className="p-4">Timestamp</th>
              <th className="p-4">User ID</th>
              <th className="p-4">Action</th>
              <th className="p-4">Entity</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" className="p-4 text-center">Loading logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="4" className="p-4 text-center">No logs found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4 font-mono text-sm">{log.user}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 rounded font-semibold text-xs text-gray-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-sm">{log.entityType} ({log.entityId})</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;