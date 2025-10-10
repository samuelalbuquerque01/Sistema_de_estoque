import DashboardStats from '../DashboardStats'

export default function DashboardStatsExample() {
  return (
    <DashboardStats
      totalProducts={1247}
      lowStock={23}
      totalValue={458932.50}
      movements={342}
    />
  )
}
