import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Questo endpoint è pubblico e serve per mantenere sveglio il database Supabase
// eseguendo una query minima ogni 24 ore tramite un servizio di Cron Job esterno.
export async function GET() {
  try {
    // Eseguiamo una query semplicissima sulla tabella 'clients'
    const { data, error } = await supabase
      .from("clients")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Keep-alive error:", error.message);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Database pinged successfully!",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Keep-alive exception:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
