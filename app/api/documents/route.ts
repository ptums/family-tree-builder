import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { randomUUID } from "crypto";

export async function GET(request: Request) {
  const sql = await getSql();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }
  const result = await sql`SELECT * FROM documents WHERE userId = ${id}`;
  if (result.length === 0) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function DELETE(request: Request) {
  const sql = await getSql();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }
  const result = await sql`DELETE FROM documents WHERE id = ${id} RETURNING *`;
  if (result.length === 0) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }
  return NextResponse.json({
    message: "Document deleted",
    document: result[0],
  });
}

export async function POST(request: Request) {
  const sql = await getSql();
  const { name, url, userId } = await request.json();
  if (!name || !url || !userId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const newId = randomUUID();
  const result = await sql`
    INSERT INTO documents (id, name, url, userId)
    VALUES (${newId}, ${name}, ${url}, ${userId})
    RETURNING *
  `;
  return NextResponse.json(result[0]);
}
