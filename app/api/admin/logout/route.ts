import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.redirect('/admin/login')
  res.cookies.delete('admin_auth')
  return res
}
