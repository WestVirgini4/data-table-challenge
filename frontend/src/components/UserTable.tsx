import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  orderCount: number;
  orderTotal: number;
}

interface ApiResponse {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const UserTable: React.FC = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt' | 'orderTotal'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        sortBy,
        sortDir,
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortDir]);

  // Seed data function
  const seedData = async () => {
    setSeeding(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/dev/seed?users=50000&orders=500000&products=10000`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Seed result:', result);
      
      // Refresh data after seeding
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

// Fetch data 
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Memoized table rows to prevent unnecessary re-renders
  const tableRows = useMemo(() => {
    if (!data?.items) return [];

    return data.items.map((user) => (
      <tr key={user.id} className="hover:bg-gray-50 border-b border-gray-200">
        <td className="py-4 px-6 text-sm">{user.id}</td>
        <td className="py-4 px-6 text-sm font-medium text-gray-900">{user.name}</td>
        <td className="py-4 px-6 text-sm text-gray-600">{user.email}</td>
        <td className="py-4 px-6 text-sm text-gray-600">
          {new Date(user.createdAt).toLocaleDateString()}
        </td>
        <td className="py-4 px-6 text-sm text-center">{user.orderCount}</td>
        <td className="py-4 px-6 text-sm text-right font-medium">
          ${user.orderTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </td>
      </tr>
    ));
  }, [data?.items]);

  const handleSort = (column : typeof sortBy) => {
    if(column === sortBy) {
        setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
        setSortBy(column);
        setSortDir('asc');
    }
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1&& newPage <= (data?.totalPages || 1)) {
        setPage(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize : number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const SortIcon: React.FC<{active : boolean; direction: 'asc' | 'desc'}> = ({
    active,
    direction
  }) => (
    <span className='ml-2 text-gray-400'>
        {active ? (direction === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return(
    <div className='bg-white rounded-lg shadow overflow-hidden'>
        {/* Header */}
        <div className='px-6 py-4 border-b border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-800'>User Management</h2>
            <p className='text-sm text-gray-600 mt-1'>
                {data? `${data.total.toLocaleString()} total users`: 'Loading...'}
            </p>
        </div>

        {/* Controls */}
        <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                {/* Search and Seed Button */}
                <div className='flex-1 max-w-md flex gap-2'>
                    <input 
                        type="text"
                        placeholder='Search by Name or Email'
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    />
                    <button
                        onClick={seedData}
                        disabled={seeding}
                    >
                        {seeding ? 'Seeding...' : 'Seed Data'}
                    </button>
                </div>

                {/* Page size selector */}
                <div className='flex items-center gap-2'>
                    <label className='text-sm text-gray-700'>Show:</label>
                    <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className='border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                    </select>
                    <span className='text-sm text-gray-700'>per page</span>
                </div>
            </div>
        </div>

        {/* table */}
        <div className='overflow-x-auto'>
            {error ? (
                <div className='px-6 py-8 text-center'>
                    <div className='text-red-600 mb-2'>Error loading data</div>
                    <div className='text-sm text-gray-600 mb-4'>{error}</div>
                    <button
                        onClick={fetchUsers}
                        className='px-4 py-2 bg-blue-600 text-white-rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus-ring-blue-500'
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <table className='min-w-full'>
                    <thead className='bg-gray-100'>
                        <tr>
                            <th className='py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider'>
                                ID
                            </th>
                            <th
                                className='py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors'
                                onClick={() => handleSort('name')}
                            >
                                Name
                                <SortIcon active={sortBy === 'name'} direction={sortDir}/>
                            </th>
                             <th 
                                className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort('email')}
                                >
                                Email
                                <SortIcon active={sortBy === 'email'} direction={sortDir} />
                            </th>
                            <th 
                                className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort('createdAt')}
                                >
                                Created At
                                <SortIcon active={sortBy === 'createdAt'} direction={sortDir} />
                            </th>
                            <th className="py-3 px-6 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Orders
                            </th>
                            <th 
                                className="py-3 px-6 text-right text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => handleSort('orderTotal')}
                                >
                                Total Amount
                                <SortIcon active={sortBy === 'orderTotal'} direction={sortDir} />
                            </th>
                        </tr>
                    </thead>
                    <tbody className='bg-white'>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className='px-6 py-8 text-center'>
                                    <div className='flex items-center justify-center'>
                                        <div className='animation-spin rounded-full h-6 border-b-2 border-blue-600 mr-2'></div>
                                        Loading users...
                                    </div>
                                </td>
                            </tr>
                        ) : tableRows.length > 0 ? (
                            tableRows
                        ) : (
                            <tr>
                                <td colSpan={6} className='px-6 py-8 text-center text-gray-500'>
                                    {search ? `No users found matching "${search}"` : 'No users found'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>

        {/* Pagination */}
        {data && !loading && !error && (
            <div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
                <div className='flex items-center justify-between'>
                    <div className='text-sm text-gray-700'>
                        Showing {data.items.length > 0 ? ((data.page - 1) * data.pageSize + 1 ) : 0} to {''}
                        {Math.min(data.page * data.pageSize, data.total)} of {data.total.toLocaleString()} result
                    </div>

                    <div className='flex items-center space-x-2'>
                        <button
                            onClick={() => handlePageChange(data.page - 1)}
                            disabled={!data.hasPrevPage}
                            className='px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Previous
                        </button>

                        {/* Page numbers */}
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                            let pageNum;
                            if (data.totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (data.page <= 3) {
                                pageNum = i + 1;
                            } else if (data.page >= data.totalPages - 2) {
                                pageNum = data.totalPages - 4 + i;
                            } else {
                                pageNum = data.page - 2 + i;
                            }
                            
                            return (
                                <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-1 text-sm border rounded ${
                                    pageNum === data.page
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-gray-300 hover:bg-gray-100'
                                }`}
                                >
                                {pageNum}
                                </button>
                            );
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={!data.hasNextPage}
                            className='px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Next
                        </button>
                    </div> 
                </div>
            </div>
        )}
    </div>
  )
}

export default UserTable;
