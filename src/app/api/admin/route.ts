import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/admin
 * Contoh endpoint yang diproteksi middleware admin.
 * Jika request sampai sini, berarti user sudah terverifikasi sebagai admin.
 */
export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const userEmail = request.headers.get("x-user-email");

  return NextResponse.json({
    message: "Selamat datang, Admin!",
    user: {
      id: userId,
      email: userEmail,
    },
  });
}
