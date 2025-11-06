// translations.js - Sistema de traducciones completo para Conviconsu
const translations = {
  es: {
    // Common
    common: {
      loading: "Cargando...",
      all: "Todas",
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
      select: "Seleccione...",
      user: "Usuario",
      observations: "Observaciones",
      statusPending: "Pendiente",
      statusCompleted: "Completada",
      statusCanceled: "Cancelada",
      statusExpired: "Vencida",
      statusRejected: "Rechazado",
      total: "Total",
      name: "Nombre", 
      actions: "Acciones",
      date: "Fecha",
      amount: "Monto"
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
    
    // ==========================================================
    // NUEVAS SECCIONES AGREGADAS
    // ==========================================================
    
    // Home (Landing Page)
    home: {
      pageTitle: "Gestcoop — Cooperativa de Viviendas",
      welcome: "Bienvenido a Gestcoop",
      subtitle: "Gestiona tu cooperativa de forma eficiente y transparente.",
      loginButton: "Iniciar Sesión",
      registerButton: "Registrarse",
      aboutUs: "¿Quiénes Somos?",
      contact: "Contacto"
    },
    
    // Auth (Login and Register)
    auth: {
      loginTitle: "Inicia Sesión",
      registerTitle: "Crea tu Cuenta",
      emailLabel: "Correo Electrónico *",
      passwordLabel: "Contraseña *",
      loginButton: "Ingresar",
      noAccount: "¿No tienes una cuenta?",
      hasAccount: "¿Ya tienes una cuenta?",
      registerLink: "Regístrate aquí",
      loginLink: "Inicia sesión aquí",
      
      // Register specific
      fullNameLabel: "Nombre Completo *",
      idCardLabel: "Cédula / Documento de Identidad *",
      confirmPasswordLabel: "Confirmar Contraseña *",
      registerButton: "Crear Cuenta",
      
      // Validation/Errors
      requiredField: "Este campo es obligatorio",
      invalidEmail: "Formato de email incorrecto",
      passwordMismatch: "Las contraseñas no coinciden",
      registrationSuccess: "Registro exitoso. Revisa tu email para la activación.",
      loginError: "Credenciales incorrectas. Inténtalo de nuevo."
    },

    // ==========================================================
    // FIN NUEVAS SECCIONES
    // ==========================================================
    
    // Dashboard Admin
    dashboardAdmin: {
      pageTitle: "Gestcoop — Panel de Administrador",
      
      home: {
        title: "Inicio - Panel Administrativo",
        welcome: "Bienvenido al Panel de Administración",
        description: "Desde aquí puedes gestionar todos los aspectos de la cooperativa.",
        sectionsTitle: "Secciones disponibles:",
        sectionsUsers: "Usuarios:",
        sectionsUsersDesc: "Gestionar pagos pendientes y usuarios",
        sectionsNotifications: "Notificaciones:",
        sectionsNotificationsDesc: "Enviar mensajes a los socios",
        sectionsFamily: "Núcleos Familiares:",
        sectionsFamilyDesc: "Gestionar grupos familiares",
        sectionsTasks: "Tareas:",
        sectionsTasksDesc: "Asignar y gestionar tareas",
        sectionsReports: "Reportes:",
        sectionsReportsDesc: "Visualizar estadísticas"
      },

      users: {
        title: "Gestión de Usuarios",
        allUsers: "Todos los Usuarios",
        filterAllStates: "Todos los estados",
        filterPending: "Pendiente",
        filterSent: "Enviado (Pendiente Aprobación)",
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
        registered: "Núcleos Familiares Registrados",
        createNew: "Crear Nuevo Núcleo",
        infoTitle: "Información sobre Núcleos Familiares",
        infoWhat: "¿Qué es un núcleo familiar?",
        infoWhatDesc: "Grupo de usuarios que comparten vivienda o están relacionados",
        infoTasks: "Asignación de tareas:",
        infoTasksDesc: "Las tareas pueden asignarse a núcleos completos",
        infoUsers: "Gestión de usuarios:",
        infoUsersDesc: "Un usuario puede pertenecer a un solo núcleo",
        infoDelete: "Eliminación:",
        infoDeleteDesc: "Al eliminar un núcleo, los usuarios NO se eliminan, solo se desvinculan"
      },

      reports: {
        title: "📊 Reportes Mensuales",
        selectPeriod: "⚙️ Seleccionar Período",
        selectMonth: "Seleccione mes...",
        selectYear: "Seleccione año...",
        generate: "Generar Reporte",
        exportCSV: "Exportar CSV",
        totalUsers: "Total Usuarios",
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
        filterAvailable: "Disponibles",
        filterOccupied: "Ocupadas",
        filterMaintenance: "En Mantenimiento",
        filterAllRooms: "Todas las habitaciones",
        filter1Room: "1 Habitación",
        filter2Rooms: "2 Habitaciones",
        filter3Rooms: "3 Habitaciones",
        searchPlaceholder: "Buscar vivienda...",
        infoTitle: "Información sobre Viviendas",
        infoStates: "Estados:",
        infoStatesDesc: "Disponible, Ocupada, En Mantenimiento",
        infoAssignment: "Asignación:",
        infoAssignmentDesc: "Las viviendas se pueden asignar a usuarios individuales o núcleos familiares",
        infoTypes: "Tipos:",
        infoTypesDesc: "1, 2 o 3 habitaciones según las necesidades",
        infoManagement: "Gestión:",
        infoManagementDesc: "Puedes crear, editar, asignar y desasignar viviendas",
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
        totalQuotas: "Total Cuotas",
        paid: "Pagadas",
        pending: "Pendientes",
        amountCollected: "Monto Cobrado",
        priceConfig: "⚙️ Configuración de Precios",
        quickActions: "🚀 Acciones Rápidas",
        generateCurrentMonth: "Generar Cuotas del Mes Actual",
        filterAllYears: "Todos los años",
        filterAllMonths: "Todos los meses",
        filterAllStates: "Todos los estados",
        filterPending: "Pendientes",
        filterPaid: "Pagadas",
        allQuotas: "📋 Todas las Cuotas",
        updatePrice: "💵 Actualizar Precio de Cuota",
        housingType: "Tipo de Vivienda",
        newMonthlyAmount: "Nuevo Monto Mensual *",
        amountPlaceholder: "Ej: 7500.00",
        priceChangeWarning: "Este cambio aplicará para las nuevas cuotas que se generen. Las cuotas ya existentes mantendrán su monto original.",
        validatePayment: "✅ Validar Pago de Cuota",
        observationsOptional: "Observaciones (opcional)",
        validationComments: "Comentarios sobre la validación..."
      },

      materials: {
        title: "Gestión de Materiales",
        searchPlaceholder: "Buscar material...",
        newMaterial: "Nuevo Material",
        infoTitle: "Información sobre Materiales",
        infoWhat: "¿Qué son los materiales?",
        infoWhatDesc: "Recursos necesarios para realizar las tareas de la cooperativa",
        infoStock: "Stock:",
        infoStockDesc: "Control de cantidades disponibles de cada material",
        infoTaskAssignment: "Asignación a tareas:",
        infoTaskAssignmentDesc: "Los materiales se pueden asignar a tareas específicas",
        infoRequests: "Solicitudes:",
        infoRequestsDesc: "Los usuarios pueden solicitar materiales cuando los necesitan",
        materialName: "Nombre del Material *",
        materialNamePlaceholder: "Ej: Cemento, Ladrillos, Arena",
        characteristics: "Características / Descripción",
        characteristicsPlaceholder: "Describe el material, sus especificaciones, etc.",
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
        endDate: "Fecha de Finalización:",
        assignTo: "Asignar a:",
        individualUsers: "Usuarios Individuales",
        familyNuclei: "Núcleos Familiares",
        selectUsers: "Seleccionar Usuarios:",
        selectNuclei: "Seleccionar Núcleos Familiares:",
        selectAll: "Seleccionar Todos",
        materialsNeeded: "📦 Materiales necesarios para esta tarea:",
        searchMaterial: "Buscar material...",
        noMaterialsAssigned: "No hay materiales asignados",
        createTask: "Crear Tarea",
        createdTasks: "Tareas Creadas"
      },

      requests: {
        title: "📩 Gestión de Solicitudes",
        inReview: "En Revisión",
        resolved: "Resueltas",
        highPriority: "Prioridad Alta",
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
      logout: "Cerrar sesión",
      admin: "Admin",
      
      sections: {
        home: "Inicio",
        profile: "Perfil",
        requests: "Solicitudes",
        housing: "Vivienda",
        billing: "Facturación",
        hours: "Horas",
        tasks: "Tareas",
        documents: "Documentos"
      },
      
      home: {
        title: "🏠 Inicio",
        welcome: "Bienvenido/a",
        description: "Este es tu panel de usuario de la Cooperativa de Viviendas.",
        notifications: "🔔 Notificaciones",
        notificationsBadge: "0",
        loadingNotifications: "Cargando notificaciones...",
        stats: {
          contributions: "Aportes al Día",
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
        email: "Email",
        address: "Dirección",
        birthDate: "Fecha de Nacimiento",
        status: "Estado",
        phone: "Teléfono",
        phoneOptional: "Opcional - Puedes agregar un número de contacto",
        idCard: "Cédula",
        idCardReadonly: "La cédula no se puede modificar",
        changePassword: "Cambiar Contraseña (Opcional)",
        currentPassword: "Contraseña Actual",
        currentPasswordPlaceholder: "Dejar en blanco si no deseas cambiarla",
        newPassword: "Nueva Contraseña",
        confirmPassword: "Confirmar Nueva Contraseña",
        notSpecified: "No especificada",
        notAvailable: "No disponible"
      },
      
      requests: {
        title: "📩 Mis Solicitudes",
        manage: "Gestiona tus Solicitudes",
        description: "Envía consultas, justificaciones o reporta problemas al administrador",
        newRequest: "Nueva Solicitud",
        stats: {
          pending: "Pendientes",
          inReview: "En Revisión",
          resolved: "Resueltas"
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
        types: {
          hours: "Registro de Horas",
          payment: "Pagos/Cuotas",
          housing: "Vivienda",
          general: "Consulta General",
          other: "Otro"
        },
        loading: "Cargando solicitudes..."
      },
      
      housing: {
        title: "🏡 Mi Vivienda",
        subtitle: "Información de tu Vivienda",
        loading: "Cargando..."
      },
      
      billing: {
        title: "💳 Mis Cuotas Mensuales",
        description: "Gestiona tus pagos de vivienda y deuda de horas",
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
          voucherNumberHelp: "Opcional: Número de referencia o transacción",
          uploadVoucher: "Comprobante de Pago",
          uploadHelp: "Sube una foto o PDF del comprobante (máx. 5MB)",
          importantTitle: "⚠️ Importante:",
          important1: "Asegúrate de que el comprobante sea legible",
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
          title: "💳 Estado de Deuda de Horas",
          calculating: "Calculando deuda..."
        }
      },
      
      hours: {
        title: "⏰ Registro de Horas",
        currentTime: "Hora actual",
        clockIn: "Marcar Entrada",
        clockOut: "Marcar Salida",
        activeSession: "Jornada en curso",
        entryTime: "Entrada:",
        stats: {
          weekHours: "Horas esta Semana",
          daysWorked: "Días Trabajados",
          monthHours: "Horas Este Mes"
        },
        weeklySummary: {
          title: "📅 Resumen de la Semana",
          refresh: "Actualizar",
          loading: "Cargando resumen..."
        },
        history: {
          title: "📜 Historial de Registros",
          startDate: "Fecha inicio",
          endDate: "Fecha fin",
          filter: "Filtrar",
          loading: "Cargando registros..."
        }
      },
      
      tasks: {
        title: "📋 Mis Tareas",
        stats: {
          pending: "Pendientes",
          inProgress: "En Progreso",
          completed: "Completadas"
        },
        showCompleted: "Mostrar completadas",
        assignedTasks: "Mis Tareas Asignadas",
        individual: "📋 Tareas Individuales",
        family: "👨‍👩‍👧‍👦 Tareas del Núcleo Familiar",
        loading: "Cargando tareas..."
      },
      
      documents: {
        title: "📄 Mis Documentos",
        subtitle: "Documentación",
        description: "Accede a todos tus documentos relacionados con la cooperativa.",
        stats: {
          documents: "Documentos",
          contracts: "Contratos",
          invoices: "Facturas"
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
      amount: "Amount"
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
        selectPeriod: "⚙️ Select Period",
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
        priceConfig: "⚙️ Price Configuration",
        quickActions: "🚀 Quick Actions",
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
        validatePayment: "✅ Validate Fee Payment",
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
        description: "This is your Housing Cooperative user panel.",
        notifications: "🔔 Notifications",
        notificationsBadge: "0",
        loadingNotifications: "Loading notifications...",
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
        notAvailable: "Not available"
      },
      
      requests: {
        title: "📩 My Requests",
        manage: "Manage your Requests",
        description: "Send queries, justifications or report problems to the administrator",
        newRequest: "New Request",
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
        types: {
          hours: "Hours Log",
          payment: "Payments/Fees",
          housing: "Housing",
          general: "General Inquiry",
          other: "Other"
        },
        loading: "Loading requests..."
      },
      
      housing: {
        title: "🏡 My Housing",
        subtitle: "Housing Information",
        loading: "Loading..."
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
          calculating: "Calculating debt..."
        }
      },
      
      hours: {
        title: "⏰ Hours Log",
        currentTime: "Current time",
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
          loading: "Loading summary..."
        },
        history: {
          title: "📜 Records History",
          startDate: "Start date",
          endDate: "End date",
          filter: "Filter",
          loading: "Loading records..."
        }
      },
      
      tasks: {
        title: "📋 My Tasks",
        stats: {
          pending: "Pending",
          inProgress: "In Progress",
          completed: "Completed"
        },
        showCompleted: "Show completed",
        assignedTasks: "My Assigned Tasks",
        individual: "📋 Individual Tasks",
        family: "👨‍👩‍👧‍👦 Family Unit Tasks",
        loading: "Loading tasks..."
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