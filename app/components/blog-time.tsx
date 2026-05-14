'use client'
/**
 * 检查：原函数存在月/日负数偏移的问题，例如同年但跨月时monthsAgo可能为负。
 * 精确表达 “几年前/几月前/几天前” 时需拿实际日期计算差值。
 * 此函数主用于格式化时间，第二参数 includeRelative 允许显示相对时间。
 * 简单改进：使用时间戳差值更准确地计算年/月/天。
 */

function formatDate(date: string, includeRelative = false) {
  // 如果没有时区与具体时间，自动补T00:00:00
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  const targetDate = new Date(date)
  const currentDate = new Date()

  // 计算毫秒级时间差
  const diffMs = currentDate.getTime() - targetDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  let formattedDate = ''
  if (diffYears > 0) {
    formattedDate = `${diffYears}y ago`
  } else if (diffMonths > 0) {
    formattedDate = `${diffMonths}mo ago`
  } else if (diffDays > 0) {
    formattedDate = `${diffDays}d ago`
  } else {
    formattedDate = 'Today'
  }

  // 返回完整日期（如 May 10, 2024）
  let fullDate = targetDate.toLocaleString('zh-CN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
}

export default function BlogTime({className, publishedAt}: {className: string, publishedAt: string}) {
  return (
      <p className={className}>
        {formatDate(publishedAt)}
      </p>
  );
}