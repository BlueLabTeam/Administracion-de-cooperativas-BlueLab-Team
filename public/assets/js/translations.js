// translations.js - Sistema de traducciones para Conviconsu
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
      total: "Total"
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

    // Header
    header: {
      title: "Conviconsu",
      menu: {
        home: "Inicio",
        services: "Servicios",
        about: "Nosotros",
        contact: "Contacto"
      },
      login: "INGRESAR"
    },

    // Footer
    footer: {
      contact: {
        title: "Contacto",
        address: "📍 Av. Principal 1234, Montevideo",
        phone: "📞 094654987",
        email: "✉️ cooperativa@gmail.com"
      },
      schedule: {
        title: "Horarios",
        weekdays: "Lunes a Viernes: 9:00 - 18:00",
        saturday: "Sábados: 9:00 - 13:00",
        sunday: "Domingos: Cerrados"
      },
      social: {
        title: "Síguenos",
        instagram: "📱 Instagram",
        facebook: "📘 Facebook",
        whatsapp: "💬 Whatsapp"
      }
    },

    // Home page
    home: {
      welcome: {
        title: "Bienvenido a Conviconsu",
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Odit aliquid eum possimus saepe, soluta eos ea officia consequuntur deserunt corrupti vitae reprehenderit veniam dolor quas dolores, sit vero voluptatum cum.",
        requestButton: "Solicitar ingreso",
        infoButton: "Más información"
      },
      services: {
        title: "Nuestros Servicios",
        subtitle: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.",
        consulting: {
          title: "Consultoría Especializada",
          description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Perspiciatis aliquid, non consequatur fugiat nisi odit excepturi dolor necessitatibus odio, ab, porro numquam.",
          detailsTitle: "Detalles del servicio:",
          details: [
            "Asesoramiento personalizado",
            "Análisis de viabilidad",
            "Documentación completa",
            "Seguimiento post-consulta"
          ]
        },
        procedures: {
          title: "Gestión de Trámites",
          description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Perspiciatis aliquid, non consequatur fugiat nisi odit excepturi dolor necessitatibus odio, ab, porro numquam.",
          detailsTitle: "Incluye:",
          details: [
            "Tramitación de permisos",
            "Gestión documental",
            "Coordinación con entidades",
            "Seguimiento en tiempo real"
          ]
        },
        financial: {
          title: "Asesoría Financiera",
          description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Perspiciatis aliquid, non consequatur fugiat nisi odit excepturi dolor necessitatibus odio, ab, porro numquam.",
          detailsTitle: "Servicios financieros:",
          details: [
            "Evaluación de créditos",
            "Planificación financiera",
            "Opciones de financiamiento",
            "Negociación con bancos"
          ]
        }
      },
      incorporation: {
        title: "Proceso de incorporación",
        subtitle: "Para unirte a nuestro equipo, sigue estos pasos:",
        steps: [
          {
            title: "Solicitud inicial",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic veritatis, repellendus possimus delectus accusamus ad nam eius id aliquam eos, quam itaque explicabo, voluptatibus pariatur iusto voluptatum animi deleniti quis."
          },
          {
            title: "Evaluación de documentos",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic veritatis, repellendus possimus delectus accusamus ad nam eius id aliquam eos, quam itaque explicabo, voluptatibus pariatur iusto voluptatum animi deleniti quis."
          },
          {
            title: "Entrevista personal",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic veritatis, repellendus possimus delectus accusamus ad nam eius id aliquam eos, quam itaque explicabo, voluptatibus pariatur iusto voluptatum animi deleniti quis."
          },
          {
            title: "Aprobación final",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic veritatis, repellendus possimus delectus accusamus ad nam eius id aliquam eos, quam itaque explicabo, voluptatibus pariatur iusto voluptatum animi deleniti quis."
          }
        ]
      },
      faq: {
        title: "Preguntas Frecuentes",
        questions: [
          {
            question: "¿Cómo puedo solicitar un servicio?",
            answer: "Puedes solicitar nuestros servicios a través del botón \"Solicitar ingreso\" o contactándonos directamente por teléfono. Nuestro equipo te guiará en todo el proceso."
          },
          {
            question: "¿Cuáles son los métodos de pago aceptados?",
            answer: "Aceptamos transferencias bancarias, pagos en efectivo, tarjetas de crédito y débito. También ofrecemos planes de pago flexibles según tus necesidades."
          },
          {
            question: "¿Ofrecen soporte después de la consultoría?",
            answer: "Sí, brindamos soporte continuo durante 6 meses después de completar la consultoría. Esto incluye consultas telefónicas y seguimiento de tu progreso."
          },
          {
            question: "¿Puedo cancelar mi solicitud?",
            answer: "Puedes cancelar tu solicitud en cualquier momento antes de la firma del contrato. Si ya iniciamos el trabajo, aplicarán las condiciones establecidas en el contrato."
          }
        ]
      },
      cta: {
        title: "¡Comienza tu camino hacia la vivienda propia!",
        description: "Contáctanos para más información sobre nuestros servicios de consultoría.",
        button: "Solicitar ingreso"
      }
    },

    // Login page
    login: {
      title: "Cooperativa de Viviendas",
      subtitle: "Sistema Administrativo",
      email: "Correo",
      emailPlaceholder: "Ingrese su correo",
      password: "Contraseña",
      passwordPlaceholder: "Ingrese su contraseña",
      submit: "Ingresar",
      noAccount: "No tienes una cuenta?",
      register: "Regístrate aquí"
    },

    // Register page
    register: {
      title: "Solicitud de Registro",
      subtitle: "Complete el formulario para enviar su solicitud de ingreso.",
      fullName: "Nombre completo",
      id: "Carnet de identidad",
      phone: "Teléfono",
      birthDate: "Fecha de nacimiento",
      email: "Email",
      address: "Dirección",
      password: "Contraseña",
      submit: "Enviar Solicitud",
      hasAccount: "¿Ya tienes una cuenta?",
      login: "Inicia sesión aquí"
    },

    // Payment page
    payment: {
      title: "Registre su Pago inicial",
      subtitle: "Para poder continuar en la plataforma",
      uploadLabel: "Suba aqui la captura o foto del comprobante de pago, Por favor",
      submit: "Enviar"
    },

    // Waiting room
    waitingRoom: {
      welcome: "Bienvenido/a",
      description: "Este es tu panel de usuario de la Cooperativa de Viviendas.",
      notifications: "Notificaciones",
      loading: "Cargando notificaciones...",
      stats: {
        contributions: "Aportes al Día",
        hours: "Horas Trabajadas",
        tasks: "Tareas Pendientes"
      },
      profile: {
        title: "Mi Perfil",
        info: "Información Personal",
        name: "Nombre:",
        email: "Email:",
        status: "Estado:"
      },
      requests: {
        title: "Mis Solicitudes",
        subtitle: "Solicitudes Realizadas",
        description: "Aquí podrás ver el estado de tus solicitudes a la cooperativa.",
        noRequests: "No tienes solicitudes pendientes."
      },
      housing: {
        title: "Mi Vivienda",
        subtitle: "Información de tu Vivienda",
        description: "Aquí encontrarás toda la información relacionada con tu vivienda asignada.",
        noHousing: "Aún no tienes una vivienda asignada."
      },
      contributions: {
        title: "Mis Aportes",
        subtitle: "Historial de Aportes",
        description: "Registro de todos tus aportes económicos a la cooperativa.",
        made: "Aportes Realizados",
        total: "Total Aportado",
        pending: "Aportes Pendientes"
      },
      hours: {
        title: "Registro de Horas",
        subtitle: "Horas de Trabajo Cooperativo",
        description: "Registro de las horas trabajadas en actividades de la cooperativa.",
        total: "Horas Totales",
        thisMonth: "Este Mes",
        required: "Horas Requeridas"
      },
      tasks: {
        title: "Mis Tareas",
        pending: "Tareas Pendientes",
        inProgress: "En Progreso",
        completed: "Completadas",
        showCompleted: "Mostrar completadas",
        individual: "Tareas Individuales",
        family: "Tareas del Núcleo Familiar",
        loadingTasks: "Cargando tareas..."
      },
      documents: {
        title: "Mis Documentos",
        subtitle: "Documentación",
        description: "Accede a todos tus documentos relacionados con la cooperativa.",
        docs: "Documentos",
        contracts: "Contratos",
        invoices: "Facturas"
      },
      paymentBlock: {
        title: "Pago pendiente de aprobación",
        message1: "Aún falta un último paso.",
        message2: "Recibirás un correo electrónico cuando su cuenta sea aprobada",
        message3: "Si tiene alguna pregunta, no dude en contactar a traves de un mensaje",
        logout: "Cerrar sesión"
      }
    },

    // Dashboard Admin
    dashboardAdmin: {
      pageTitle: "Gestcoop – Panel de Administrador",
      title: "Panel de Administración",
      viewUser: "Vista Usuario",
      
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
      },

      sections: {
        home: "Inicio",
        reports: "Reportes",
        users: "Usuarios",
        family: "Núcleo Familiar",
        housing: "Viviendas",
        billing: "Facturación",
        notifications: "Notificaciones",
        materials: "Materiales",
        tasks: "Tareas",
        requests: "Solicitudes"
      }
    },

    // Dashboard User
    dashboardUser: {
      title: "Cooperativa de Viviendas",
      logout: "Logout",
      admin: "Admin",
      sections: {
        home: "Inicio",
        profile: "Perfil",
        requests: "Solicitudes",
        housing: "Vivienda",
        billing: "Facturación",
        hours: "Horas",
        tasks: "Tareas"
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
      total: "Total"
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

    // Header
    header: {
      title: "Conviconsu",
      menu: {
        home: "Home",
        services: "Services",
        about: "About",
        contact: "Contact"
      },
      login: "LOGIN"
    },

    // Footer
    footer: {
      contact: {
        title: "Contact",
        address: "📍 Main Avenue 1234, Montevideo",
        phone: "📞 094654987",
        email: "✉️ cooperativa@gmail.com"
      },
      schedule: {
        title: "Schedule",
        weekdays: "Monday to Friday: 9:00 AM - 6:00 PM",
        saturday: "Saturday: 9:00 AM - 1:00 PM",
        sunday: "Sunday: Closed"
      },
      social: {
        title: "Follow Us",
        instagram: "📱 Instagram",
        facebook: "📘 Facebook",
        whatsapp: "💬 Whatsapp"
      }
    },

    // Home page
    home: {
      welcome: {
        title: "Welcome to Conviconsu",
        description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Odit aliquid eum possimus saepe, soluta eos ea officia consequuntur deserunt corrupti vitae reprehenderit veniam dolor quas dolores, sit vero voluptatum cum.",
        requestButton: "Apply Now",
        infoButton: "More Information"
      },
      services: {
        title: "Our Services",
        subtitle: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.",
        consulting: {
          title: "Specialized Consulting",
          description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Perspiciatis aliquid, non consequatur fugiat nisi odit excepturi dolor necessitatibus odio, ab, porro numquam.",
          detailsTitle: "Service details:",
          details: [
            "Personalized advice",
            "Viability analysis",
            "Complete documentation",
            "Post-consultation follow-up"
          ]
        },
        procedures: {
          title: "Procedure Management",
          description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Perspiciatis aliquid, non consequatur fugiat nisi odit excepturi dolor necessitatibus odio, ab, porro numquam.",
          detailsTitle: "Includes:",
          details: [
            "Permit processing",
            "Document management",
            "Entity coordination",
            "Real-time tracking"
          ]
        },
        financial: {
          title: "Financial Advisory",
          description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Perspiciatis aliquid, non consequatur fugiat nisi odit excepturi dolor necessitatibus odio, ab, porro numquam.",
          detailsTitle: "Financial services:",
          details: [
            "Credit evaluation",
            "Financial planning",
            "Financing options",
            "Bank negotiation"
          ]
        }
      },
      incorporation: {
        title: "Incorporation Process",
        subtitle: "To join our team, follow these steps:",
        steps: [
          {
            title: "Initial Application",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic veritatis, repellendus possimus delectus accusamus ad nam eius id aliquam eos, quam itaque explicabo, voluptatibus pariatur iusto voluptatum animi deleniti quis."
          },
          {
            title: "Document Evaluation",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic veritatis, repellendus possimus delectus accusamus ad nam eius id aliquam eos, quam itaque explicabo, voluptatibus pariatur iusto voluptatum animi deleniti quis."
          },
          {
            title: "Personal Interview",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic veritatis, repellendus possimus delectus accusamus ad nam eius id aliquam eos, quam itaque explicabo, voluptatibus pariatur iusto voluptatum animi deleniti quis."
          },
          {
            title: "Final Approval",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic veritatis, repellendus possimus delectus accusamus ad nam eius id aliquam eos, quam itaque explicabo, voluptatibus pariatur iusto voluptatum animi deleniti quis."
          }
        ]
      },
      faq: {
        title: "Frequently Asked Questions",
        questions: [
          {
            question: "How can I request a service?",
            answer: "You can request our services through the \"Apply Now\" button or by contacting us directly by phone. Our team will guide you through the entire process."
          },
          {
            question: "What payment methods are accepted?",
            answer: "We accept bank transfers, cash payments, credit and debit cards. We also offer flexible payment plans according to your needs."
          },
          {
            question: "Do you offer support after consulting?",
            answer: "Yes, we provide ongoing support for 6 months after completing the consultation. This includes phone consultations and progress tracking."
          },
          {
            question: "Can I cancel my application?",
            answer: "You can cancel your application at any time before signing the contract. If we have already started work, the conditions established in the contract will apply."
          }
        ]
      },
      cta: {
        title: "Start your path to homeownership!",
        description: "Contact us for more information about our consulting services.",
        button: "Apply Now"
      }
    },

    // Login page
    login: {
      title: "Housing Cooperative",
      subtitle: "Administrative System",
      email: "Email",
      emailPlaceholder: "Enter your email",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      submit: "Login",
      noAccount: "Don't have an account?",
      register: "Register here"
    },

    // Register page
    register: {
      title: "Registration Request",
      subtitle: "Complete the form to submit your membership application.",
      fullName: "Full name",
      id: "Identity card",
      phone: "Phone",
      birthDate: "Date of birth",
      email: "Email",
      address: "Address",
      password: "Password",
      submit: "Submit Application",
      hasAccount: "Already have an account?",
      login: "Login here"
    },

    // Payment page
    payment: {
      title: "Register your Initial Payment",
      subtitle: "To continue on the platform",
      uploadLabel: "Please upload the screenshot or photo of the payment receipt here",
      submit: "Submit"
    },

    // Waiting room
    waitingRoom: {
      welcome: "Welcome",
      description: "This is your user panel for the Housing Cooperative.",
      notifications: "Notifications",
      loading: "Loading notifications...",
      stats: {
        contributions: "Current Contributions",
        hours: "Hours Worked",
        tasks: "Pending Tasks"
      },
      profile: {
        title: "My Profile",
        info: "Personal Information",
        name: "Name:",
        email: "Email:",
        status: "Status:"
      },
      requests: {
        title: "My Requests",
        subtitle: "Submitted Requests",
        description: "Here you can see the status of your requests to the cooperative.",
        noRequests: "You have no pending requests."
      },
      housing: {
        title: "My Housing",
        subtitle: "Housing Information",
        description: "Here you will find all information related to your assigned housing.",
        noHousing: "You don't have an assigned housing yet."
      },
      contributions: {
        title: "My Contributions",
        subtitle: "Contribution History",
        description: "Record of all your financial contributions to the cooperative.",
        made: "Contributions Made",
        total: "Total Contributed",
        pending: "Pending Contributions"
      },
      hours: {
        title: "Hours Log",
        subtitle: "Cooperative Work Hours",
        description: "Record of hours worked in cooperative activities.",
        total: "Total Hours",
        thisMonth: "This Month",
        required: "Required Hours"
      },
      tasks: {
        title: "My Tasks",
        pending: "Pending Tasks",
        inProgress: "In Progress",
        completed: "Completed",
        showCompleted: "Show completed",
        individual: "Individual Tasks",
        family: "Family Unit Tasks",
        loadingTasks: "Loading tasks..."
      },
      documents: {
        title: "My Documents",
        subtitle: "Documentation",
        description: "Access all your documents related to the cooperative.",
        docs: "Documents",
        contracts: "Contracts",
        invoices: "Invoices"
      },
      paymentBlock: {
        title: "Payment pending approval",
        message1: "One last step remaining.",
        message2: "You will receive an email when your account is approved",
        message3: "If you have any questions, please contact us via message",
        logout: "Logout"
      }
    },

    // Dashboard Admin
    dashboardAdmin: {
      pageTitle: "Gestcoop – Admin Dashboard",
      title: "Administration Panel",
      viewUser: "User View",
      
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
      },

      sections: {
        home: "Home",
        reports: "Reports",
        users: "Users",
        family: "Family Unit",
        housing: "Housing",
        billing: "Billing",
        notifications: "Notifications",
        materials: "Materials",
        tasks: "Tasks",
        requests: "Requests"
      }
    },

    // Dashboard User
    dashboardUser: {
      title: "Housing Cooperative",
      logout: "Logout",
      admin: "Admin",
      sections: {
        home: "Home",
        profile: "Profile",
        requests: "Requests",
        housing: "Housing",
        billing: "Billing",
        hours: "Hours",
        tasks: "Tasks"
      }
    }
  }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = translations;
}