'use client'

import { useState } from 'react'
import { NewsItem } from '@/types/api'
import { useNewsList, useNewsApi } from '@/hooks/useNewsApi'

interface NewsTableProps {
  onEditNews: (newsItem: NewsItem) => void
}

export default function NewsTable({ onEditNews }: NewsTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)
  
  const { 
    newsList, 
    pagination, 
    params, 
    loading, 
    error, 
    refreshNews, 
    updateParams 
  } = useNewsList({ 
    sortBy: 'isoDate', 
    sortOrder: 'desc',
    limit: 10 
  })
  
  const { deleteNews } = useNewsApi()

  // 格式化时间
  const formatTime = (isoDate: string) => {
    const date = new Date(isoDate)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return '刚刚'
    } else if (diffInHours < 24) {
      return `${diffInHours}小时前`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}天前`
    }
  }

  // 获取状态样式
  const getStatusStyle = (status: 'DRAFT' | 'PUBLISH') => {
    switch (status) {
      case 'PUBLISH':
        return 'bg-green-100 text-green-800'
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get status text
  const getStatusText = (status: 'DRAFT' | 'PUBLISH') => {
    switch (status) {
      case 'PUBLISH':
        return 'Published'
      case 'DRAFT':
        return 'Draft'
      default:
        return 'Unknown'
    }
  }

  // Get category style
  const getCategoryStyle = (category: string | null) => {
    if (!category) return 'bg-gray-100 text-gray-800'
    
    const colors: Record<string, string> = {
      '财经': 'bg-blue-100 text-blue-800',
      '科技': 'bg-green-100 text-green-800',
      '国际': 'bg-purple-100 text-purple-800',
      '体育': 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  // Handle edit
  const handleEdit = (news: NewsItem) => {
    onEditNews(news)
  }

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news item?')) return
    
    setDeletingId(id)
    try {
      await deleteNews(id)
      refreshNews()
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeletingId(null)
    }
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    updateParams({ page })
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Loading failed: {error}</div>
        <button 
          onClick={refreshNews}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Reload
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-600">Loading...</div>
          </div>
        )}
        
        {!loading && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {newsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              ) : (
                newsList.map((news) => (
                  <tr key={news.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {news.title}
                      </div>
                      {news.content && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {news.content}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryStyle(news.category)}`}>
                        {news.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(news.status)}`}>
                        {getStatusText(news.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatTime(news.isoDate)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleEdit(news)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        disabled={deletingId === news.id}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(news.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        disabled={deletingId === news.id}
                      >
                        {deletingId === news.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        
        {/* 分页信息 */}
        {pagination && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.current - 1) * (params.limit || 10)) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(pagination.current * (params.limit || 10), pagination.totalCount)}</span> of{' '}
                <span className="font-medium">{pagination.totalCount}</span> entries
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={!pagination.hasPrev || loading}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm bg-blue-600 text-white border border-blue-600 rounded-md">
                  {pagination.current}
                </span>
                <button 
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={!pagination.hasNext || loading}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </>
  )
}
