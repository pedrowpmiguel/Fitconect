// Configurar variáveis de ambiente PRIMEIRO
import dotenv from "dotenv";
dotenv.config();

// Verificar se as variáveis de ambiente foram carregadas
console.log('JWT_SECRET carregado:', process.env.JWT_SECRET ? 'SIM' : 'NÃO');
console.log('NODE_ENV:', process.env.NODE_ENV);

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";

// Importar rotas
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import workoutRoutes from "./routes/workouts.js";
import clientWorkoutRoutes from "./routes/clientWorkouts.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import messageRoutes from "./routes/messages.js";
import trainerRequestsRoutes from "./routes/trainerRequests.js";

// Importar middleware
import { authenticateToken } from "./middleware/auth.js";

// Conectar à base de dados
connectDB();

const app = express();

// Middleware de segurança
app.use(helmet());

// Configurar CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (DESABILITADO PARA DESENVOLVIMENTO)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 100, // máximo 100 requests por IP por janela
//   message: {
//     success: false,
//     message: 'Muitas requisições deste IP, tente novamente em 15 minutos.'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// app.use(limiter);

// Rate limiting mais restritivo para autenticação (DESABILITADO PARA DESENVOLVIMENTO)
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 5, // máximo 5 tentativas de login por IP por janela
//   message: {
//     success: false,
//     message: 'Muitas tentativas de login, tente novamente em 15 minutos.'
//   },
//   skipSuccessfulRequests: true
// });

// app.use('/api/auth/login', authLimiter);
// app.use('/api/auth/register', authLimiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando corretamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/workouts", authenticateToken, workoutRoutes);
app.use("/api/client/workouts", authenticateToken, clientWorkoutRoutes);
app.use("/api/notifications", authenticateToken, notificationRoutes);
app.use("/api/messages", authenticateToken, messageRoutes);
app.use("/api/trainer-requests", authenticateToken, trainerRequestsRoutes);

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Middleware global de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro global:', error);
  
  // Erro de validação do Mongoose
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }
  
  // Erro de duplicação do Mongoose
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} já existe`
    });
  }
  
  // Erro de cast do Mongoose
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
  }
  
  // Erro padrão
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Configurar porta
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(` ${process.env.NODE_ENV || 'development'}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`http://localhost:${PORT}/health`);
});

// Tratamento de sinais para encerramento graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', reason);
  process.exit(1);
});
