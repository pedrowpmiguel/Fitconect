import mongoose from 'mongoose';

const workoutPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do plano é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome do plano não pode ter mais de 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Cliente é obrigatório']
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Personal trainer é obrigatório']
  },
  frequency: {
    type: String,
    required: [true, 'Frequência é obrigatória'],
    enum: ['3x', '4x', '5x'],
    default: '3x'
  },
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkoutSession'
  }],
  startDate: {
    type: Date,
    required: [true, 'Data de início é obrigatória']
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isTemplate: {
    type: Boolean,
    default: false // Se true, pode ser usado como template para outros clientes
  },
  templateName: {
    type: String,
    trim: true,
    maxlength: [100, 'Nome do template não pode ter mais de 100 caracteres']
  },
  goals: [{
    type: String,
    enum: [
      'perda_peso', 'ganho_massa', 'força', 'resistência', 'flexibilidade',
      'condicionamento', 'reabilitação', 'manutenção', 'performance', 'outros'
    ]
  }],
  level: {
    type: String,
    enum: ['iniciante', 'intermediário', 'avançado'],
    default: 'iniciante'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notas não podem ter mais de 1000 caracteres']
  },
  // Para controle de semanas
  currentWeek: {
    type: Number,
    default: 1,
    min: 1
  },
  totalWeeks: {
    type: Number,
    default: 4,
    min: 1,
    max: 52
  },
  // Para acompanhamento
  lastCompletedSession: {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutSession'
    },
    completedAt: Date,
    week: Number
  },
  progress: {
    totalSessionsCompleted: {
      type: Number,
      default: 0
    },
    totalSessionsPlanned: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true
});

// NOTE: Business logic that requires querying other collections (ex.: garantir que
// trainer está aprovado, cliente está atribuído ao trainer, workflows de criação/atribuição,
// marcação de sessão concluída que salva e atualiza progresso) foi movida para services.
// Deixe aqui apenas validações locais/puros ou helpers que não fazem I/O com outros modelos.

// Índices para melhor performance
workoutPlanSchema.index({ client: 1 });
workoutPlanSchema.index({ trainer: 1 });
workoutPlanSchema.index({ isActive: 1 });
workoutPlanSchema.index({ isTemplate: 1 });
workoutPlanSchema.index({ startDate: 1 });
workoutPlanSchema.index({ frequency: 1 });
workoutPlanSchema.index({ goals: 1 });
workoutPlanSchema.index({ level: 1 });

// Método puro para calcular taxa de conclusão
workoutPlanSchema.methods.calculateCompletionRate = function() {
  if (this.progress.totalSessionsPlanned === 0) {
    this.progress.completionRate = 0;
  } else {
    this.progress.completionRate = Math.round(
      (this.progress.totalSessionsCompleted / this.progress.totalSessionsPlanned) * 100
    );
  }
  return this.progress.completionRate;
};

// Método para obter estatísticas do plano
workoutPlanSchema.methods.getStats = function() {
  return {
    totalSessions: this.progress.totalSessionsPlanned,
    completedSessions: this.progress.totalSessionsCompleted,
    completionRate: this.progress.completionRate,
    currentWeek: this.currentWeek,
    totalWeeks: this.totalWeeks,
    frequency: this.frequency,
    isActive: this.isActive
  };
};

export default mongoose.model('WorkoutPlan', workoutPlanSchema);
