import { NextResponse } from "next/server";

export async function GET() {
  const users = [
    { id: 1, name: "Ola" },
    { id: 2, name: "Amina" },
  ];
  return NextResponse.json(users);
}
