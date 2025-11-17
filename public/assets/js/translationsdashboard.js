// translations.js - Sistema de traducciones completo para Conviconsu
const translations = {
es: {
  // Common
  common: {
    loading: "Cargando...",
    all: "Todos",
    status: "Estado",
    type: "Tipo",
    priority: "Prioridad",
    priorityLow: "Baja",
    priorityMedium: "Media",
    priorityHigh: "Alta",
    filter: "Filtrar",
    update: "Actualizar",
    cancel: "Cancelar",
    approve: "Aprobar",
    reject: "Rechazar",
    saveChanges: "Guardar Cambios",
    important: "Importante",
    select: "Seleccionar...",
    user: "Usuario",
    observations: "Observaciones",
    statusPending: "Pendiente",
    statusCompleted: "Completado",
    statusCanceled: "Cancelado",
    statusExpired: "Vencido",
    statusRejected: "Rechazado",
    total: "Total",
    name: "Nombre",
    actions: "Acciones",
    date: "Fecha",
    amount: "Monto",
    close: "Cerrar"
  },

  // Months
  months: {
    january: "Enero",
    february: "Febrero",
    march: "Marzo",
    april: "Abril",
    may: "Mayo",
    june: "Junio",
    july: "Julio",
    august: "Agosto",
    september: "Septiembre",
    october: "Octubre",
    november: "Noviembre",
    december: "Diciembre"
  },

  // Home (Landing Page)
  home: {
    pageTitle: "Gestcoop — Cooperativa de Vivienda",
    welcome: "Bienvenido a Gestcoop",
    subtitle: "Gestioná tu cooperativa de forma eficiente y transparente.",
    loginButton: "Iniciar Sesión",
    registerButton: "Registrarse",
    aboutUs: "Sobre Nosotros",
    contact: "Contacto"
  },

  // Auth (Login/Register)
  auth: {
    loginTitle: "Iniciar Sesión",
    registerTitle: "Crear tu Cuenta",
    emailLabel: "Correo Electrónico *",
    passwordLabel: "Contraseña *",
    loginButton: "Ingresar",
    noAccount: "¿No tenés una cuenta?",
    hasAccount: "¿Ya tenés una cuenta?",
    registerLink: "Registrate aquí",
    loginLink: "Ingresá aquí",

    fullNameLabel: "Nombre Completo *",
    idCardLabel: "Cédula / Documento *",
    confirmPasswordLabel: "Confirmar Contraseña *",
    registerButton: "Crear Cuenta",

    requiredField: "Este campo es obligatorio",
    invalidEmail: "Formato de correo incorrecto",
    passwordMismatch: "Las contraseñas no coinciden",
    registrationSuccess: "Registro exitoso. Revisá tu correo para activar la cuenta.",
    loginError: "Credenciales incorrectas. Intentá nuevamente."
  },

  // Dashboard Admin
  dashboardAdmin: {
    pageTitle: "Gestcoop — Panel Administrativo",

    home: {
      title: "Inicio - Panel Administrativo",
      welcome: "Bienvenido al Panel de Administración",
      description: "Desde aquí podés gestionar todos los aspectos de la cooperativa.",
      sectionsTitle: "Secciones disponibles:",
      sectionsUsers: "Usuarios:",
      sectionsUsersDesc: "Gestionar usuarios y pagos pendientes",
      sectionsNotifications: "Notificaciones:",
      sectionsNotificationsDesc: "Enviar mensajes a los integrantes",
      sectionsFamily: "Núcleos Familiares:",
      sectionsFamilyDesc: "Gestionar grupos familiares",
      sectionsTasks: "Tareas:",
      sectionsTasksDesc: "Asignar y administrar tareas",
      sectionsReports: "Reportes:",
      sectionsReportsDesc: "Ver estadísticas"
    },

    users: {
      title: "Gestión de Usuarios",
      allUsers: "Todos los Usuarios",
      filterAllStates: "Todos los estados",
      filterPending: "Pendiente",
      filterSent: "Enviado (Pendiente de Aprobación)",
      filterAccepted: "Aceptado",
      filterRejected: "Rechazado",
      searchPlaceholder: "Buscar usuario..."
    },

    notifications: {
      title: "Gestión de Notificaciones",
      sendNew: "Enviar Nueva Notificación",
      titleLabel: "Título:",
      messageLabel: "Mensaje:",
      typeLabel: "Tipo:",
      typeInfo: "Información",
      typeImportant: "Importante",
      typeUrgent: "Urgente",
      typeSuccess: "Éxito",
      recipientsLabel: "Destinatarios:",
      selectAll: "Seleccionar Todos",
      sendButton: "Enviar Notificación"
    },

    family: {
      title: "Gestión de Núcleos Familiares",
      registered: "Núcleos Registrados",
      createNew: "Crear Nuevo Núcleo",
      infoTitle: "Información sobre los Núcleos",
      infoWhat: "¿Qué es un núcleo familiar?",
      infoWhatDesc: "Grupo de usuarios que comparten vivienda o tienen parentesco",
      infoTasks: "Asignación de tareas:",
      infoTasksDesc: "Las tareas pueden asignarse a núcleos completos",
      infoUsers: "Gestión de usuarios:",
      infoUsersDesc: "Un usuario solo puede pertenecer a un núcleo",
      infoDelete: "Eliminación:",
      infoDeleteDesc: "Al eliminar un núcleo, los usuarios NO se eliminan, solo se desasocian"
    },

    reports: {
      title: "📊 Reportes Mensuales",
      selectPeriod: "⚙️ Seleccionar Período",
      selectMonth: "Seleccionar mes...",
      selectYear: "Seleccionar año...",
      generate: "Generar Reporte",
      exportCSV: "Exportar CSV",
      totalUsers: "Total de Usuarios",
      hoursWorked: "Horas Trabajadas",
      completedTasks: "Tareas Completadas",
      avgCompliance: "Cumplimiento Promedio",
      detailByUser: "📋 Detalle por Usuario"
    },

    housing: {
      title: "Gestión de Viviendas",
      registered: "Viviendas Registradas",
      newHousing: "Nueva Vivienda",
      filterAllStates: "Todos los estados",
      filterAvailable: "Disponible",
      filterOccupied: "Ocupada",
      filterMaintenance: "En Mantenimiento",
      filterAllRooms: "Todas las habitaciones",
      filter1Room: "1 Habitación",
      filter2Rooms: "2 Habitaciones",
      filter3Rooms: "3 Habitaciones",
      searchPlaceholder: "Buscar vivienda...",
      infoTitle: "Información sobre las Viviendas",
      infoStates: "Estados:",
      infoStatesDesc: "Disponible, Ocupada, En Mantenimiento",
      infoAssignment: "Asignación:",
      infoAssignmentDesc: "La vivienda puede asignarse a un usuario individual o a un núcleo familiar",
      infoTypes: "Tipos:",
      infoTypesDesc: "1, 2 o 3 habitaciones según necesidad",
      infoManagement: "Gestión:",
      infoManagementDesc: "Podés crear, editar, asignar y desasignar viviendas",
      modalNew: "Nueva Vivienda",
      housingNumber: "Número de Vivienda *",
      housingNumberPlaceholder: "Ej: A-101",
      address: "Dirección *",
      addressPlaceholder: "Ej: Bloque A, Planta Baja",
      housingType: "Tipo de Vivienda *",
      squareMeters: "Metros Cuadrados",
      squareMetersPlaceholder: "Ej: 55.50",
      constructionDate: "Fecha de Construcción",
      statusAvailable: "Disponible",
      statusOccupied: "Ocupada",
      statusMaintenance: "Mantenimiento",
      observationsPlaceholder: "Notas adicionales...",
      saveHousing: "Guardar Vivienda",
      assignHousing: "Asignar Vivienda",
      housing: "Vivienda",
      assignTo: "Asignar a *",
      individualUser: "Usuario Individual",
      familyNucleus: "Núcleo Familiar"
    },

    billing: {
      title: "💰 Gestión de Cuotas Mensuales",
      totalQuotas: "Total de Cuotas",
      paid: "Pagadas",
      pending: "Pendientes",
      amountCollected: "Monto Recaudado",
      priceConfig: "⚙️ Configuración de Precios",
      quickActions: "🚀 Acciones Rápidas",
      generateCurrentMonth: "Generar Cuotas del Mes Actual",
      filterAllYears: "Todos los años",
      filterAllMonths: "Todos los meses",
      filterAllStates: "Todos los estados",
      filterPending: "Pendiente",
      filterPaid: "Pagada",
      allQuotas: "📋 Todas las Cuotas",
      updatePrice: "💵 Actualizar Precio de la Cuota",
      housingType: "Tipo de Vivienda",
      newMonthlyAmount: "Nuevo Monto Mensual *",
      amountPlaceholder: "Ej: 7500.00",
      priceChangeWarning: "Este cambio se aplicará a las nuevas cuotas generadas. Las ya existentes mantienen su valor original.",
      validatePayment: "✅ Validar Pago",
      observationsOptional: "Observaciones (opcional)",
      validationComments: "Comentarios sobre la validación..."
    },

    materials: {
      title: "Gestión de Materiales",
      searchPlaceholder: "Buscar material...",
      newMaterial: "Nuevo Material",
      infoTitle: "Información sobre los Materiales",
      infoWhat: "¿Qué son los materiales?",
      infoWhatDesc: "Recursos necesarios para realizar tareas cooperativas",
      infoStock: "Stock:",
      infoStockDesc: "Control de cantidades disponibles de cada material",
      infoTaskAssignment: "Asignación a tareas:",
      infoTaskAssignmentDesc: "Los materiales pueden asignarse a tareas específicas",
      infoRequests: "Solicitudes:",
      infoRequestsDesc: "Los usuarios pueden solicitar materiales cuando lo necesiten",
      materialName: "Nombre del Material *",
      materialNamePlaceholder: "Ej: Cemento, Ladrillos, Arena",
      characteristics: "Características / Descripción",
      characteristicsPlaceholder: "Describí el material, sus especificaciones, etc.",
      saveMaterial: "Guardar Material",
      updateStock: "Actualizar Stock",
      material: "Material",
      availableQuantity: "Cantidad Disponible *"
    },

    tasks: {
      title: "Gestión de Tareas",
      createNew: "Crear Nueva Tarea",
      titleLabel: "Título:",
      descriptionLabel: "Descripción:",
      startDate: "Fecha de Inicio:",
      endDate: "Fecha de Fin:",
      assignTo: "Asignar a:",
      individualUsers: "Usuarios Individuales",
      familyNuclei: "Núcleos Familiares",
      selectUsers: "Seleccionar Usuarios:",
      selectNuclei: "Seleccionar Núcleos:",
      selectAll: "Seleccionar Todos",
      materialsNeeded: "📦 Materiales necesarios para la tarea:",
      searchMaterial: "Buscar material...",
      noMaterialsAssigned: "No hay materiales asignados",
      createTask: "Crear Tarea",
      createdTasks: "Tareas Creadas"
    },

    requests: {
      title: "📩 Gestión de Solicitudes",
      inReview: "En Revisión",
      resolved: "Resueltas",
      highPriority: "Alta Prioridad",
      filterAllStates: "Todos los estados",
      filterAllTypes: "Todos los tipos",
      filterAllPriorities: "Todas las prioridades",
      typeHours: "Registro de Horas",
      typePayment: "Pagos/Cuotas",
      typeHousing: "Vivienda",
      typeGeneral: "Consulta General",
      typeOther: "Otro"
    }
  },

  // Dashboard User
  dashboardUser: {
    title: "Gestcoop — Panel de Usuario",
    logout: "Cerrar Sesión",
    admin: "Admin",

    sections: {
      home: "Inicio",
      profile: "Perfil",
      requests: "Solicitudes",
      housing: "Vivienda",
      billing: "Cuotas",
      hours: "Horas",
      tasks: "Tareas",
      documents: "Documentos"
    },

    home: {
        title: "🏠 Inicio",
        welcome: "Bienvenido",
        nucleoInfoCard: {
          title: "Tu Núcleo Familiar",
          members: "Integrantes del núcleo:",
          membersCount: "miembro/s",
          viewAllButton: "Ver Todos",
          noName: "Sin nombre",
          address: "Dirección",
          totalMembers: "miembro",
          totalMembersPlural: "miembros",
          nucleoMembers: "Miembros del Núcleo",
          viewAll: "Ver Todo",
          more: "más"
        },
        nucleoBanner: {
          title: "¿Quieres unirte a un Núcleo Familiar?",
          description: "Los núcleos familiares permiten compartir viviendas y tareas. Explora los núcleos disponibles y envía una solicitud.",
          viewButton: "Ver Núcleos"
        },
        description: "Este es tu panel de usuario de la Cooperativa de Vivienda.",
        notifications: "🔔 Notificaciones",
        notificationsBadge: "0",
        loadingNotifications: "Cargando notificaciones...",
        notificationsContent: {
          noNotifications: "No tenés notificaciones",
          errorNotifications: "Error al cargar las notificaciones",
          couldNotLoad: "No se pudieron cargar las notificaciones",
          now: "Ahora",
          minutesAgo: "Hace",
          minutesAgoSuffix: "min",
          hoursAgo: "Hace",
          hoursAgoSuffix: "h",
          daysAgo: "Hace",
          daysAgoSuffix: "d",
          new: "NUEVO"
        },
        coreDetails: {
          coreInfoTitle: "Información del Núcleo Familiar",
          totalMembers: "Total de Miembros",
          membersTitle: "Miembros del Núcleo",
          closeModal: "Cerrar",
          noMembers: "No hay miembros en este núcleo",
          you: "(Tú)"
        },
        stats: {
          contributions: "Aportes Actuales",
          hours: "Horas Trabajadas",
          tasks: "Tareas Pendientes"
        }
      },
      
    profile: {
      title: "👤 Mi Perfil",
      personalInfo: "Información Personal",
      editProfile: "Editar Perfil",
      cancelEdit: "Cancelar",
      saveChanges: "Guardar Cambios",
      fullName: "Nombre Completo",
      email: "Correo",
      address: "Dirección",
      birthDate: "Fecha de Nacimiento",
      status: "Estado",
      phone: "Teléfono",
      phoneOptional: "Opcional - Podés agregar un número de contacto",
      idCard: "Cédula",
      idCardReadonly: "La cédula no puede modificarse",
      changePassword: "Cambiar Contraseña (Opcional)",
      currentPassword: "Contraseña Actual",
      currentPasswordPlaceholder: "Dejar en blanco si no querés cambiarla",
      newPassword: "Nueva Contraseña",
      confirmPassword: "Confirmar Nueva Contraseña",
      notSpecified: "No especificado",
      notAvailable: "No disponible"
    },

    requests: {
      title: "📩 Mis Solicitudes",
      manage: "Gestioná tus solicitudes",
      description: "Enviá consultas, justificaciones o reportes al administrador",
      newRequest: "Nueva Solicitud",
      noRequests: "No tenés solicitudes",
      types: {
        hours: " 📊 Registro de Horas",
        payment: " 💳 Pagos/Cuotas",
        housing: " 🏡 Vivienda",
        general: " 📝 Consulta General",
        other: " ❓ Otro"
      },
      form: {
        typeLabel: "Tipo de Solicitud:",
        types: {
          hours: " 📊 Registro de Horas",
          payment: " 💳 Pagos/Cuotas",
          housing: " 🏡 Vivienda",
          general: " 📝 Consulta General",
          other: " ❓ Otro"
        },
        subjectLabel: "Asunto:",
        subjectPlaceholder: "Ej: Problema con mi asignación de vivienda",
        descriptionLabel: "Descripción:",
        descriptionPlaceholder: "Ingresá la información detallada de tu solicitud...",
        priorityLabel: "Prioridad:",
        priorityUrgentHelp: "Seleccioná 'Alta' solo para casos urgentes",
        priority: {
          low: "Baja",
          medium: "Media",
          high: "Alta"
        },
        attachmentLabel: "Adjunto (opcional):",
        attachmentHelp: "Subí un archivo (imagen o PDF, máx. 5MB)",
        infoTitle: "Importante:",
        infoText: "Tu solicitud será revisada por un administrador. Recibirás una notificación cuando sea atendida.",
        submitButton: "Enviar Solicitud"
      },
      stats: {
        pending: "Pendiente",
        inReview: "En Revisión",
        resolved: "Resuelta"
      },
      filters: {
        status: "Estado:",
        type: "Tipo:",
        allStates: "Todos los estados",
        allTypes: "Todos los tipos",
        pending: "Pendiente",
        inReview: "En Revisión",
        resolved: "Resuelta",
        rejected: "Rechazada"
      },

      loading: "Cargando solicitudes..."
    },

    housing: {
      title: "🏡 Mi Vivienda",
      subtitle: "Información de la Vivienda",
      loading: "Cargando...",
      noAssigned: "No tenés una vivienda asignada"
    },

    billing: {
      title: "💳 Mis Cuotas",
      description: "Gestioná los pagos de tu vivienda y tu deuda por horas",
      stats: {
        pending: "Pendientes",
        paid: "Pagadas",
        overdue: "Vencidas"
      },
      filters: {
        month: "Mes:",
        year: "Año:",
        status: "Estado:",
        allMonths: "Todos los meses",
        allYears: "Todos los años",
        allStates: "Todos los estados",
        pending: "Pendiente",
        paid: "Pagada",
        overdue: "Vencida"
      },
      loading: "Cargando cuotas...",
      paymentModal: {
        title: "Realizar Pago",
        paymentMethod: "Método de Pago",
        voucherNumber: "Número de Comprobante",
        voucherNumberPlaceholder: "Ej: 123456789",
        voucherNumberHelp: "Opcional: número de referencia o transacción",
        uploadVoucher: "Comprobante de Pago",
        uploadHelp: "Subí una foto o PDF del comprobante (máx. 5MB)",
        importantTitle: "⚠️ Importante:",
        important1: "Asegurate de que el comprobante sea legible",
        important2: "El pago será revisado por un administrador",
        important3: "Recibirás una notificación cuando sea validado",
        cancel: "Cancelar",
        submit: "Enviar Pago",
        methods: {
          transfer: "Transferencia Bancaria",
          deposit: "Depósito en Efectivo",
          check: "Cheque",
          cash: "Efectivo"
        }
      },

      debtStatus: {
        title: "💳 Estado de Deuda por Horas",
        calculating: "Calculando deuda...",
        debtType: {
          period: "período:",
          withDebt: "Tenés horas pendientes",
          withoutDebt: "No tenés horas pendientes"
        },
        debtBreakdown: {
          debtForTheCurrentMonth: "💰 Deuda del Mes Actual:",
          debtItems: {
            hoursRequired: "Horas Requeridas",
            WeeklySystem: "Sistema Semanal",
            hoursWorked: "Horas Trabajadas",
            weeklyAverage: "Promedio Semanal",
            hoursRemaining: "Horas Restantes",
            costPerHour: "Costo por Hora"
          },
          progress: "Progreso Mensual:",
          alertWarning: {
            title: "⚠ Información Importante:",
            thisDebt: "esta deuda",
            include: "(incluye",
            fromPreviousMonths: "de meses anteriores)",
            nextmessage: "Se sumará automáticamente a tu próxima cuota mensual.",
            sistemMessage: "Sistema: 21 horas por semana (84 horas por mes).",
            excellentMessage: "🎉 ¡Excelente!",
            excellentMessageDescription: "Cumpliste tus horas requeridas. No habrá cargos adicionales en tu cuota."
          }
        }
      },
      payNow: "Pagar Ahora",
      payBlocked: "Pago Bloqueado",
      notFoundFilters: "No se encontraron cuotas con los filtros seleccionados.",
      enabledPaymentPeriod: "Período de Pago Habilitado",
      enabledPaymentPeriodMessage: "Ya podés realizar el pago de tu cuota. El período de pago está activo hasta fin de mes.",
      pendingPayment: "⏳ Pago en Revisión",
      noPendingPayment: "✅ No tenés pagos pendientes",
      blockedPayment: "Pago Bloqueado",
      workingPeriod: " 🔒 Período de Trabajo Activo",
      workingPeriodNote: "Podrás pagar en",
      workingPeriodDays: "día",
      pending: {
        title: "Otros Pendientes",
      },
      summary: {
        currentMonth: "Resumen del Mes Actual",
        previousMonthsDebt: "Deuda de Meses Anteriores",
        previousMonthsDebtNote: "(aún sin pagar)",
        hoursNotWorkedDebt: "Deuda por Horas no Trabajadas",
        hoursNotWorkedDebtNote: "($160 por hora × horas faltantes)",
        noHoursNotWorkedDebt: "¡No adeudás horas!",
        totalDue: "Total a Pagar",
        totalPaid: "Total Pagado",
        totalOverdue: "Total Vencido",
        housingFee: "🏠 Cuota Habitacional:",
        houseFee: "Total de tu Vivienda",
        paymentCompleted: " 🎉 ¡Pago realizado con éxito!",
        paymentSuccess: "Pagaste correctamente la cuota de",
        paymentInReviewNote: "Tu pago está siendo procesado.",
        paymentEnabled: "Pago Disponible",
        paymentEnabledNote: "Ya podés realizar el pago.",
        dueFeeExpired: "❌ Cuota Vencida",
        dueFeeExpiredNote: "La deuda se acumulará.",
        openPaymentPeriod: "⚠️ Período de Pago Abierto",
        paid: "✅ Pagada",
        inReview: "⏳ En Revisión",
        overdue: "❌ Vencida",
        day: "DÍA",
        toPay: "A PAGAR",
        total: "TOTAL",
        paymentBreakdown: "📋 Detalle del Pago:",
        unworkedHoursDebt: "⏰ Deuda por Horas no Trabajadas:",
        totalPaidTxt: "💰 Total Pagado:"
      },
      history: {
        title: "Historial de Pagos",
        empty: "No hay pagos registrados.",
        loading: "Cargando historial..."
      }
    },

    hours: {
      title: "⏰ Registro de Horas",
      currentTime: "Hora actual",
      registering: "Registrando...",
      clockIn: "Registrar Entrada",
      clockOut: "Registrar Salida",
      activeSession: "Sesión Activa",
      entryTime: "Entrada:",
      stats: {
        weekHours: "Horas esta Semana",
        daysWorked: "Días Trabajados",
        monthHours: "Horas este Mes"
      },
      weeklySummary: {
        title: "📅 Resumen Semanal",
        refresh: "Actualizar",
        loading: "Cargando resumen...",
        calendarHeader: {
          week: "Semana del ",
          to: "al",
          daysWorked: "📅 Días Trabajados: "
        },
        days: {
          monday: "Lunes",
          tuesday: "Martes",
          wednesday: "Miércoles",
          thursday: "Jueves",
          friday: "Viernes",
          saturday: "Sábado",
          sunday: "Domingo",
          content: {
            inProgress: "En curso",
            entry: "Entrada:",
            exit: "Salida:",
            total: "Total:",
            withoutRegistration: "sin registro",
            status: {
              approved: "Aprobado",
              pending: "Pendiente",
              rejected: "Rechazado"
            }
          }
        }
      },
      history: {
        title: "📜 Historial de Registros",
        startDate: "Fecha inicio",
        endDate: "Fecha fin",
        filter: "Filtrar",
        loading: "Cargando registros...",
        table: {
          columns: {
            date: "Fecha",
            day: "Día",
            entry: "Entrada",
            exit: "Salida",
            total: "Total",
            actions: "Acciones"
          },
          inProgress: "En curso",
          row: {
            days: {
              sun: "Dom",
              mon: "Lun",
              tue: "Mar",
              wed: "Mié",
              thu: "Jue",
              fri: "Vie",
              sat: "Sáb"
            }
          }
        }
      }
    },

    tasks: {
      title: "📋 Mis Tareas",
      stats: {
        pending: "Pendientes",
        inProgress: "En Progreso",
        completed: "Completadas"
      },
      individualTasks: {
        noTasks: "No tenés tareas individuales asignadas."
      },
      start: "Inicio:",
      end: "Fin:",
      createdBy: "Creada por:",
      core: "Núcleo",
      updateProgress: "Actualizar Progreso",
      reportProgress: "Reportar Avance",
      materials: "Materiales",
      viewFullDetails: "Ver Detalles Completos",
      showCompleted: "Mostrar completadas",
      assignedTasks: "Mis Tareas Asignadas",
      individual: "📋 Tareas Individuales",
      family: "👨‍👩‍👧‍👦 Tareas del Núcleo Familiar",
      loading: "Cargando tareas...",
      inicio: "Inicio:",
      fin: "Fin:",
      creadoPor: "Creada por:",
      nucleo: "Núcleo",

      tareaVencida: "Esta tarea está vencida.",
      fechaLimitePasada: "La fecha límite ya pasó.",

      actualizarProgreso: "Actualizar Progreso",
      reportarAvance: "Reportar Avance",
      materiales: "Materiales",
      verDetallesCompletos: "Ver Detalles Completos",

      tareaCompletada: "✓ Tarea completada"
    },

    documents: {
      title: "📄 Mis Documentos",
      subtitle: "Documentación",
      description: "Accedé a todos tus documentos relacionados con la cooperativa.",
      stats: {
        documents: "Documentos",
        contracts: "Contratos",
        invoices: "Recibos"
      }
    }
  }
},

  en: {
    // Common
    common: {
      loading: "Loading...",
      all: "All",
      status: "Status",
      type: "Type",
      priority: "Priority",
      priorityLow: "Low",
      priorityMedium: "Medium",
      priorityHigh: "High",
      filter: "Filter",
      update: "Update",
      cancel: "Cancel",
      approve: "Approve",
      reject: "Reject",
      saveChanges: "Save Changes",
      important: "Important",
      select: "Select...",
      user: "User",
      observations: "Observations",
      statusPending: "Pending",
      statusCompleted: "Completed",
      statusCanceled: "Canceled",
      statusExpired: "Expired",
      statusRejected: "Rejected",
      total: "Total",
      name: "Name",
      actions: "Actions",
      date: "Date",
      amount: "Amount",
      close: "Close"
    },

    // Months
    months: {
      january: "January",
      february: "February",
      march: "March",
      april: "April",
      may: "May",
      june: "June",
      july: "July",
      august: "August",
      september: "September",
      october: "October",
      november: "November",
      december: "December"
    },

    // ==========================================================
    // NEW SECTIONS ADDED
    // ==========================================================

    // Home (Landing Page)
    home: {
      pageTitle: "Gestcoop — Housing Cooperative",
      welcome: "Welcome to Gestcoop",
      subtitle: "Manage your cooperative efficiently and transparently.",
      loginButton: "Login",
      registerButton: "Register",
      aboutUs: "About Us",
      contact: "Contact"
    },

    // Auth (Login and Register)
    auth: {
      loginTitle: "Log In",
      registerTitle: "Create Your Account",
      emailLabel: "Email Address *",
      passwordLabel: "Password *",
      loginButton: "Log In",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      registerLink: "Register here",
      loginLink: "Log in here",

      // Register specific
      fullNameLabel: "Full Name *",
      idCardLabel: "ID Card / Document *",
      confirmPasswordLabel: "Confirm Password *",
      registerButton: "Create Account",

      // Validation/Errors
      requiredField: "This field is required",
      invalidEmail: "Incorrect email format",
      passwordMismatch: "Passwords do not match",
      registrationSuccess: "Registration successful. Check your email for activation.",
      loginError: "Incorrect credentials. Please try again."
    },

    // ==========================================================
    // END NEW SECTIONS
    // ==========================================================

    // Dashboard Admin
    dashboardAdmin: {
      pageTitle: "Gestcoop — Admin Panel",

      home: {
        title: "Home - Administrative Panel",
        welcome: "Welcome to the Administration Panel",
        description: "From here you can manage all aspects of the cooperative.",
        sectionsTitle: "Available sections:",
        sectionsUsers: "Users:",
        sectionsUsersDesc: "Manage pending payments and users",
        sectionsNotifications: "Notifications:",
        sectionsNotificationsDesc: "Send messages to members",
        sectionsFamily: "Family Units:",
        sectionsFamilyDesc: "Manage family groups",
        sectionsTasks: "Tasks:",
        sectionsTasksDesc: "Assign and manage tasks",
        sectionsReports: "Reports:",
        sectionsReportsDesc: "View statistics"
      },

      users: {
        title: "User Management",
        allUsers: "All Users",
        filterAllStates: "All states",
        filterPending: "Pending",
        filterSent: "Sent (Pending Approval)",
        filterAccepted: "Accepted",
        filterRejected: "Rejected",
        searchPlaceholder: "Search user..."
      },

      notifications: {
        title: "Notification Management",
        sendNew: "Send New Notification",
        titleLabel: "Title:",
        messageLabel: "Message:",
        typeLabel: "Type:",
        typeInfo: "Information",
        typeImportant: "Important",
        typeUrgent: "Urgent",
        typeSuccess: "Success",
        recipientsLabel: "Recipients:",
        selectAll: "Select All",
        sendButton: "Send Notification"
      },

      family: {
        title: "Family Unit Management",
        registered: "Registered Family Units",
        createNew: "Create New Unit",
        infoTitle: "Information about Family Units",
        infoWhat: "What is a family unit?",
        infoWhatDesc: "Group of users who share housing or are related",
        infoTasks: "Task assignment:",
        infoTasksDesc: "Tasks can be assigned to complete units",
        infoUsers: "User management:",
        infoUsersDesc: "A user can belong to only one unit",
        infoDelete: "Deletion:",
        infoDeleteDesc: "When deleting a unit, users are NOT deleted, only unlinked"
      },

      reports: {
        title: "📊 Monthly Reports",
        selectPeriod: " Select Period",
        selectMonth: "Select month...",
        selectYear: "Select year...",
        generate: "Generate Report",
        exportCSV: "Export CSV",
        totalUsers: "Total Users",
        hoursWorked: "Hours Worked",
        completedTasks: "Completed Tasks",
        avgCompliance: "Average Compliance",
        detailByUser: "📋 Detail by User"
      },

      housing: {
        title: "Housing Management",
        registered: "Registered Housing",
        newHousing: "New Housing",
        filterAllStates: "All states",
        filterAvailable: "Available",
        filterOccupied: "Occupied",
        filterMaintenance: "Under Maintenance",
        filterAllRooms: "All rooms",
        filter1Room: "1 Room",
        filter2Rooms: "2 Rooms",
        filter3Rooms: "3 Rooms",
        searchPlaceholder: "Search housing...",
        infoTitle: "Information about Housing",
        infoStates: "States:",
        infoStatesDesc: "Available, Occupied, Under Maintenance",
        infoAssignment: "Assignment:",
        infoAssignmentDesc: "Housing can be assigned to individual users or family units",
        infoTypes: "Types:",
        infoTypesDesc: "1, 2 or 3 rooms according to needs",
        infoManagement: "Management:",
        infoManagementDesc: "You can create, edit, assign and unassign housing",
        modalNew: "New Housing",
        housingNumber: "Housing Number *",
        housingNumberPlaceholder: "Ex: A-101",
        address: "Address *",
        addressPlaceholder: "Ex: Block A, Ground Floor",
        housingType: "Housing Type *",
        squareMeters: "Square Meters",
        squareMetersPlaceholder: "Ex: 55.50",
        constructionDate: "Construction Date",
        statusAvailable: "Available",
        statusOccupied: "Occupied",
        statusMaintenance: "Maintenance",
        observationsPlaceholder: "Additional notes...",
        saveHousing: "Save Housing",
        assignHousing: "Assign Housing",
        housing: "Housing",
        assignTo: "Assign to *",
        individualUser: "Individual User",
        familyNucleus: "Family Unit"
      },

      billing: {
        title: "💰 Monthly Fee Management",
        totalQuotas: "Total Fees",
        paid: "Paid",
        pending: "Pending",
        amountCollected: "Amount Collected",
        priceConfig: " Price Configuration",
        quickActions: " Quick Actions",
        generateCurrentMonth: "Generate Current Month Fees",
        filterAllYears: "All years",
        filterAllMonths: "All months",
        filterAllStates: "All states",
        filterPending: "Pending",
        filterPaid: "Paid",
        allQuotas: "📋 All Fees",
        updatePrice: "💵 Update Fee Price",
        housingType: "Housing Type",
        newMonthlyAmount: "New Monthly Amount *",
        amountPlaceholder: "Ex: 7500.00",
        priceChangeWarning: "This change will apply to new fees that are generated. Existing fees will maintain their original amount.",
        validatePayment: " Validate Fee Payment",
        observationsOptional: "Observations (optional)",
        validationComments: "Comments about validation..."
      },

      materials: {
        title: "Materials Management",
        searchPlaceholder: "Search material...",
        newMaterial: "New Material",
        infoTitle: "Information about Materials",
        infoWhat: "What are materials?",
        infoWhatDesc: "Resources needed to perform cooperative tasks",
        infoStock: "Stock:",
        infoStockDesc: "Control of available quantities of each material",
        infoTaskAssignment: "Task assignment:",
        infoTaskAssignmentDesc: "Materials can be assigned to specific tasks",
        infoRequests: "Requests:",
        infoRequestsDesc: "Users can request materials when they need them",
        materialName: "Material Name *",
        materialNamePlaceholder: "Ex: Cement, Bricks, Sand",
        characteristics: "Characteristics / Description",
        characteristicsPlaceholder: "Describe the material, its specifications, etc.",
        saveMaterial: "Save Material",
        updateStock: "Update Stock",
        material: "Material",
        availableQuantity: "Available Quantity *"
      },

      tasks: {
        title: "Task Management",
        createNew: "Create New Task",
        titleLabel: "Title:",
        descriptionLabel: "Description:",
        startDate: "Start Date:",
        endDate: "End Date:",
        assignTo: "Assign to:",
        individualUsers: "Individual Users",
        familyNuclei: "Family Units",
        selectUsers: "Select Users:",
        selectNuclei: "Select Family Units:",
        selectAll: "Select All",
        materialsNeeded: "📦 Materials needed for this task:",
        searchMaterial: "Search material...",
        noMaterialsAssigned: "No materials assigned",
        createTask: "Create Task",
        createdTasks: "Created Tasks"
      },

      requests: {
        title: "📩 Request Management",
        inReview: "In Review",
        resolved: "Resolved",
        highPriority: "High Priority",
        filterAllStates: "All states",
        filterAllTypes: "All types",
        filterAllPriorities: "All priorities",
        typeHours: "Hours Log",
        typePayment: "Payments/Fees",
        typeHousing: "Housing",
        typeGeneral: "General Inquiry",
        typeOther: "Other"
      }
    },

    // Dashboard User
    dashboardUser: {
      title: "Gestcoop — User Panel",
      logout: "Logout",
      admin: "Admin",

      sections: {
        home: "Home",
        profile: "Profile",
        requests: "Requests",
        housing: "Housing",
        billing: "Billing",
        hours: "Hours",
        tasks: "Tasks",
        documents: "Documents"
      },

      home: {
        title: "🏠 Home",
        welcome: "Welcome",
        nucleoInfoCard: {
          title: "Your Family Unit",
          members: "Family unit members",
          membersCount: 'member',
          viewAllButton: "View All",
          withoutMembers: "There are no members in this unit"
        },
        description: "This is your Housing Cooperative user panel.",
        notifications: "🔔 Notifications",
        notificationsBadge: "0",
        loadingNotifications: "Loading notifications...",
        notificationsContent: {
          noNotifications: "You have no notifications",
          errorNotifications: "Error loading notifications",
          newBadge: "NEW"
        },
        coreDetails: {
          coreInfoTitle: "Family Unit Information",
          totalMembers: "Total Members",
          membersTitle: "Members of the Unit",
          closeModal: "Close"
        },
        bannerUnit:{
          joinMessage: "Do you want to join a Family Core?",
          unitDescription: "Family units allow sharing housing and tasks. Explore the available units and submit a request.",
          viewUnitsButton: "View Units"
        },
        stats: {
          contributions: "Current Contributions",
          hours: "Hours Worked",
          tasks: "Pending Tasks"
        }
      },

      profile: {
        title: "👤 My Profile",
        personalInfo: "Personal Information",
        editProfile: "Edit Profile",
        cancelEdit: "Cancel",
        saveChanges: "Save Changes",
        fullName: "Full Name",
        email: "Email",
        address: "Address",
        birthDate: "Date of Birth",
        status: "Status",
        phone: "Phone",
        phoneOptional: "Optional - You can add a contact number",
        idCard: "ID Card",
        idCardReadonly: "ID card cannot be modified",
        changePassword: "Change Password (Optional)",
        currentPassword: "Current Password",
        currentPasswordPlaceholder: "Leave blank if you don't want to change it",
        newPassword: "New Password",
        confirmPassword: "Confirm New Password",
        notSpecified: "Not specified",
        notAvailable: "Not available",
        saving: "Saving...",
        table:{
          field: "Field",
          information: "Information"
        }
      },

      requests: {
        title: "📩 My Requests",
        manage: "Manage your Requests",
        description: "Send queries, justifications or report problems to the administrator",
        newRequest: "New Request",
        noRequests: "You have no requests",
        types: {
          hours: " 📊 Hours Log",
          payment: " 💳 Payments/Fees",
          housing: " 🏡 Housing",
          general: " 📝 General Inquiry",
          other: " ❓ Other"
        },
        form: {
          typeLabel: "Type of Request:",
          types: {
            hours: " 📊 Hours Log",
            payment: " 💳 Payments/Fees",
            housing: " 🏡 Housing",
            general: " 📝 General Inquiry",
            other: " ❓ Other"
          },
          subjectLabel: "Subject:",
          subjectPlaceholder: "Example: Issue with my housing assignment",
          descriptionLabel: "Description:",
          descriptionPlaceholder: "Provide detailed information about your request...",
          priorityLabel: "Priority:",
          priorityUrgentHelp: "Select 'High' only for urgent matters",
          priority: {
            low: "Low",
            medium: "Medium",
            high: "High"
          },
          attachmentLabel: "Attachment (optional):",
          attachmentHelp: "Upload a file (image or PDF, max. 5MB)",
          infoTitle: "Important:",
          infoText: "Your request will be reviewed by an administrator. You will receive a notification when it is addressed.",
          submitButton: "Submit Request"
        },
        stats: {
          pending: "Pending",
          inReview: "In Review",
          resolved: "Resolved"
        },
        filters: {
          status: "Status:",
          type: "Type:",
          allStates: "All states",
          allTypes: "All types",
          pending: "Pending",
          inReview: "In Review",
          resolved: "Resolved",
          rejected: "Rejected"
        },

        loading: "Loading requests..."
      },

      housing: {
        title: "🏡 My Housing",
        subtitle: "Housing Information",
        loading: "Loading...",
        noAssigned: "You do not have an assigned housing"
      },

      billing: {
        title: "💳 My Monthly Fees",
        description: "Manage your housing payments and hours debt",
        stats: {
          pending: "Pending",
          paid: "Paid",
          overdue: "Overdue"
        },
        filters: {
          month: "Month:",
          year: "Year:",
          status: "Status:",
          allMonths: "All months",
          allYears: "All years",
          allStates: "All states",
          pending: "Pending",
          paid: "Paid",
          overdue: "Overdue"
        },
        loading: "Loading fees...",
        paymentModal: {
          title: "Make Payment",
          paymentMethod: "Payment Method",
          voucherNumber: "Voucher Number",
          voucherNumberPlaceholder: "Ex: 123456789",
          voucherNumberHelp: "Optional: Reference or transaction number",
          uploadVoucher: "Payment Voucher",
          uploadHelp: "Upload a photo or PDF of the voucher (max. 5MB)",
          importantTitle: "⚠️ Important:",
          important1: "Make sure the voucher is legible",
          important2: "Payment will be reviewed by an administrator",
          important3: "You will receive a notification when it is validated",
          cancel: "Cancel",
          submit: "Submit Payment",
          methods: {
            transfer: "Bank Transfer",
            deposit: "Cash Deposit",
            check: "Check",
            cash: "Cash"
          }
        },
        debtStatus: {
          title: "💳 Hours Debt Status",
          calculating: "Calculating debt...",
          debtType: {
            period: "period:",
            withDebt: "You have outstanding hours",
            withoutDebt: "No outstanding hours"
          },
          debtBreakdown: {
            debtForTheCurrentMonth: "💰 Debt for the Current Month:",
            debtItems: {
              hoursRequired: "Required Hours",
              WeeklySystem: "Weekly System",
              hoursWorked: "Hours Worked",
              weeklyAverage: "Weekly Average",
              hoursRemaining: "Hours Remaining",
              costPerHour: "Cost per Hour"
            },
            progress: "Monthly Progress:",
            alertWarning: {
              title: "⚠ Important Information:",
              thisDebt: "this debt",
              include: "(includes",
              fromPreviousMonths: "from previous months)",
              nextmessage: "It will be automatically added to your next monthly housing payment.",
              sistemMessage: "System: 21 hours per week (84 hours per month).",
              excellentMessage: "🎉 Excellent!",
              excellentMessageDescription: "You have met your required hours. There will be no additional charges on your fee.",
            }
          },
        },
        payNow: "Pay Now",
        payBlocked: "Payment Blocked",
        notFoundFilters: "No fees found with the selected filters.",
        enabledPaymentPeriod: "Enabled Payment Period",
        enabledPaymentPeriodMessage: "You can now make the payment of your fee. The payment period is active until the end of the month.",
        pendingPayment: "⏳ Payment Under Review",
        noPendingPayment: "✅ There are no pending payments",
        blockedPayment: "Payment Blocked",
        workingPeriod: " 🔒 Ongoing Work Period",
        workingPeriodNote: "You will be able to pay in",
        workingPeriodDays: "day",
        pending: {
          title: "Other Pending",
        },
        summary: {
          currentMonth: "Recap of Current Month",
          previousMonthsDebt: "Debt from Previous Months",
          previousMonthsDebtNote: "(not paid yet)",
          hoursNotWorkedDebt: "Debt from Hours Not Worked",
          hoursNotWorkedDebtNote: "($160 per hour × missing hours)",
          noHoursNotWorkedDebt: "No hours owed!",
          totalDue: "Total Due",
          totalPaid: "Total Paid",
          totalOverdue: "Total Overdue",
          housingFee: "🏠 house Fee:",
          houseFee: "Total for Your Housing",
          paymentCompleted: " 🎉 Payment completed successfully!",
          paymentSuccess: "You have successfully paid your fee of",
          paymentInReviewNote: "Your payment is being processed.",
          paymentEnabled: "Payment Available",
          paymentEnabledNote: "You can make the payment now.",
          dueFeeExpired: "❌ Overdue Installment",
          dueFeeExpiredNote: "The debt will pile up.",
          openPaymentPeriod: "⚠️ Open Payment Period",
          paid: "✅ Paid",
          inReview: "⏳ In Review",
          overdue: "❌ Overdue",
          day: "DAY",
          toPay: "TO PAY",
          total: "TOTAL",
          totalPaid: "PAID",
          paymentBreakdown: "📋 Payment Breakdown:",
          unworkedHoursDebt: "⏰ Debt from Unworked Hours:",
          totalPaid: "💰 Total Amount Paid:"
        },
        history: {
          title: "Payment History",
          empty: "No payments recorded.",
          loading: "Loading history..."
        }
      },

      hours: {
        title: "⏰ Hours Log",
        currentTime: "Current time",
        registering: "Registering...",
        clockIn: "Clock In",
        clockOut: "Clock Out",
        activeSession: "Active session",
        entryTime: "Entry:",
        stats: {
          weekHours: "Hours this Week",
          daysWorked: "Days Worked",
          monthHours: "Hours This Month"
        },
        weeklySummary: {
          title: "📅 Weekly Summary",
          refresh: "Refresh",
          loading: "Loading summary...",
          calendarHeader: {
            week: "Week of ",
            to: "to",
            daysWorked: "📅 Days Worked: "
          },
          days: {
            monday: "Monday",
            tuesday: "Tuesday",
            wednesday: "Wednesday",
            thursday: "Thursday",
            friday: "Friday",
            saturday: "Saturday",
            sunday: "Sunday",
            content: {
              inProgress: "In Progress",
              entry: "Entry:",
              exit: "Exit:",
              total: "Total:",
              withoutRegistration: "without registration",
              status: {
                approved: "Approved",
                pending: "Pending",
                rejected: "Rejected"
              },
            }
          },
        },
        history: {
          title: "📜 Records History",
          startDate: "Start date",
          endDate: "End date",
          filter: "Filter",
          loading: "Loading records...",
          table: {
            columns: {
              date: "Date",
              day: "Day",
              entry: "Entry",
              exit: "Exit",
              total: "Total",
              actions: "Actions"
            },
            inProgress: "In progress",
            row: {
              days: {
                sun: "Sun",
                mon: "Mon",
                tue: "Tue",
                wed: "Wed",
                thu: "Thu",
                fri: "Fri",
                sat: "Sat"
              },
            },
          }
        }
      },
      tasks: {
        title: "📋 My Tasks",

        stats: {
          pending: "Pending",
          inProgress: "In Progress",
          completed: "Completed"
        },

        individualTasks: {
          noTasks: "You have no individual tasks assigned."
        },
        start: "Start:",
        end: "End:",
        createdBy: "Created by:",
        core: "Core",
        updateProgress: "Update Progress",
        reportProgress: "Report Progress",
        materials: "Materials",
        viewFullDetails: "View Full Details",
        showCompleted: "Show completed",
        assignedTasks: "My Assigned Tasks",
        individual: "📋 Individual Tasks",
        family: "👨‍👩‍👧‍👦 Family Unit Tasks",
        loading: "Loading tasks...",
        inicio: "Start:",
        fin: "End:",
        creadoPor: "Created by:",
        nucleo: "Core",

        tareaVencida: "This task is overdue.",
        fechaLimitePasada: "The deadline has already passed.",

        actualizarProgreso: "Update Progress",
        reportarAvance: "Report Progress",
        materiales: "Materials",
        verDetallesCompletos: "View Full Details",

        tareaCompletada: "✓ Task completed"
      },


      documents: {
        title: "📄 My Documents",
        subtitle: "Documentation",
        description: "Access all your documents related to the cooperative.",
        stats: {
          documents: "Documents",
          contracts: "Contracts",
          invoices: "Invoices"
        }
      }
    }
  }
};


// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = translations;
}