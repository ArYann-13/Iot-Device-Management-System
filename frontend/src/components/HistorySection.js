import { useState } from 'react';
import axios from 'axios';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";

function HistorySection() {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchHistory = async (selectedPage = 1) => {
        try {
            const response = await axios.get('http://localhost:5000/api/history', {
                params: {
                    from: fromDate,
                    to: toDate,
                    page: selectedPage,
                    limit: 20, // 10 entries per page
                },
            });
            setHistoryData(response.data.data);
            setTotalPages(response.data.totalPages);
            setPage(response.data.currentPage);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchHistory(newPage);
        }
    };

    return (
        <div className="p-4 bg-blue-300 min-h-screen">
            <h2 className="text-2xl font-bold mb-4 text-center">History</h2>

            
            <div className="flex flex-wrap gap-4 mb-6 items-center justify-start">
                <div className="flex flex-col items-center">
                    <label className="font-semibold mb-1">From</label>
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border p-2 rounded"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="font-semibold mb-1">To</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border p-2 rounded"
                    />
                </div>

                <button
                    onClick={() => fetchHistory(1)}
                    className="bg-blue-500 text-white px-4 py-2 mt-6 rounded hover:bg-blue-600"
                >
                    Fetch History
                </button>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded shadow">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 text-left">Time</th>
                            <th className="py-2 px-4 text-center">Temperature</th>
                            <th className="py-2 px-4 text-center">Humidity</th>
                            <th className="py-2 px-4 text-center">LDR</th>
                            <th className="py-2 px-4 text-center">Fan</th>
                            <th className="py-2 px-4 text-center">Light</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyData.length > 0 ? (
                            historyData.map((entry) => (
                                <tr key={entry._id} className="border-t text-center">
                                    <td className="px-4 py-2">{new Date(entry.createdAt).toLocaleString()}</td>
                                    <td className="px-4 py-2">{entry.temperature}</td>
                                    <td className="px-4 py-2">{entry.humidity}</td>
                                    <td className="px-4 py-2">{entry.ldr}</td>
                                    <td className="px-4 py-2">{entry.fanState ? 'On' : 'Off'}</td>
                                    <td className="px-4 py-2">{entry.lightState ? 'On' : 'Off'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-gray-500">No history found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                    <MdArrowBackIosNew />
                </button>

                <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={page}
                    onChange={(e) => {
                        const value = e.target.value === '' ? '' : Number(e.target.value);
                        if (value >= 1 && value <= totalPages) {
                            setPage(value);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && page >= 1 && page <= totalPages) {
                            fetchHistory(page);
                        }
                    }}
                    className="w-16 text-center border rounded px-2 py-1"
                />

                <span className="text-gray-600">/ {totalPages}</span>

                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                    <MdArrowForwardIos />
                </button>
            </div>
        </div>
    );
}

export default HistorySection;
