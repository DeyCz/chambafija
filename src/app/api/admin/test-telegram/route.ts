import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Protección para que nadie pueda usar esta ruta públicamente.
  const secret = process.env.TELEGRAM_TEST_SECRET;
  const providedSecret = request.headers.get("x-test-secret");

  if (!secret || providedSecret !== secret) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json(
      { success: false, error: "Faltan variables de Telegram" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✅ ¡Prueba exitosa! Telegram está conectado con Chamba Fija Pasco.",
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      return NextResponse.json(
        { success: false, telegram: result },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mensaje enviado correctamente a Telegram",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Error al conectar con Telegram" },
      { status: 500 }
    );
  }
}