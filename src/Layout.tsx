import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="bg-black min-h-screen">
      <Outlet />
    </div>
  )
}
