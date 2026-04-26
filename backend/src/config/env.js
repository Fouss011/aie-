import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  cinetpayApiKey: process.env.CINETPAY_API_KEY,
  cinetpaySiteId: process.env.CINETPAY_SITE_ID,
  cinetpaySecretKey: process.env.CINETPAY_SECRET_KEY,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  backendUrl: process.env.BACKEND_URL || "http://localhost:4000",
};
