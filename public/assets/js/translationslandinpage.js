const translations = {
  es: {
    header: {
      title: "Conviconsu",
      menu: {
        home: "Inicio",
        services: "Servicios",
        about: "Nosotros",
        contact: "Contacto",
        login: "Iniciar sesión",
        register: "Registrarse",
        panel: "Panel de usuario",
        logout: "Cerrar sesión"
      }
    },
    footer: {
      description: "Conviconsu — Tu plataforma de gestión y conexión.",
      links: {
        privacy: "Política de privacidad",
        terms: "Términos y condiciones",
        contact: "Contáctanos"
      },
      copy: "Todos los derechos reservados.",
      contact: {
        title: "Contacto",
        address: " Av. Principal 1234, Montevideo",
        phone: " 094654987",
        email: " cooperativa@gmail.com"
      },
      schedule: {
        title: "Horarios",
        weekdays: "Lunes a Viernes: 9:00 - 18:00",
        saturday: "Sábados: 9:00 - 13:00",
        sunday: "Domingos: Cerrados"
      },
     social: {
  title: "Síguenos",
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp"
}
    },
    home: {
      welcome: {
        title: "Bienvenido a Conviconsu",
        subtitle: "Gestiona tus servicios y conecta con personas fácilmente.",
        description: "Únete hoy y experimenta la mejor plataforma para gestionar tus servicios.",
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
  description: "El socio envía su solicitud de pago al administrador a través del sistema. Debe adjuntar el comprobante de pago correspondiente a la cuota mensual de la cooperativa. Esta solicitud queda registrada como 'pendiente' hasta que sea revisada por un administrador."
},
{
  title: "Evaluación de documentos",
  description: "El administrador revisa el comprobante de pago enviado por el socio. Verifica que el monto sea correcto, que la fecha corresponda al período actual y que toda la información del comprobante esté clara y completa. Si encuentra algún problema, puede rechazar la solicitud con observaciones."
},
{
  title: "Verificación del pago",
  description: "Una vez que el administrador confirma que el comprobante es válido y corresponde al pago de la cuota, procede a aprobar la solicitud. El sistema registra automáticamente la fecha de aprobación y el administrador que realizó la verificación."
},
{
  title: "Aprobación final",
  description: "Al aprobar la solicitud, el pago queda registrado en el historial del socio y su estado de cuenta se actualiza como 'al día'. El socio recibe la confirmación de que su pago ha sido procesado exitosamente y puede consultar su historial de pagos en cualquier momento desde su panel de usuario."
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
    login: {
      title: "Cooperativa de Viviendas",
      subtitle: "Sistema Administrativo",
      email: "Correo",
      emailPlaceholder: "Ingrese su correo",
      password: "Contraseña",
      passwordPlaceholder: "Ingrese su contraseña",
      submit: "Ingresar",
      noAccount: "¿No tienes una cuenta?",
      register: "Regístrate aquí"
    },
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
    panel: {
      title: "Panel de usuario",
      welcome: "Bienvenido,",
      info: "Aquí puedes gestionar tu cuenta y tus servicios.",
      actions: {
        view_services: "Ver mis servicios",
        edit_profile: "Editar perfil",
        logout: "Cerrar sesión"
      }
    },
    messages: {
      success_login: "Has iniciado sesión correctamente.",
      success_register: "Tu cuenta se ha creado exitosamente.",
      error_login: "Correo o contraseña incorrectos.",
      logout_confirm: "¿Seguro que deseas cerrar sesión?"
    }
  },

  en: {
    header: {
      title: "Conviconsu",
      menu: {
        home: "Home",
        services: "Services",
        about: "About Us",
        contact: "Contact",
        login: "Log In",
        register: "Sign Up",
        panel: "User Panel",
        logout: "Log Out"
      }
    },
    footer: {
      description: "Conviconsu — Your management and connection platform.",
      links: {
        privacy: "Privacy Policy",
        terms: "Terms and Conditions",
        contact: "Contact Us"
      },
      copy: "All rights reserved.",
      contact: {
        title: "Contact",
        address: " Main Ave. 1234, Montevideo",
        phone: " 094654987",
        email: " cooperativa@gmail.com"
      },
      schedule: {
        title: "Opening Hours",
        weekdays: "Monday to Friday: 9:00 AM - 6:00 PM",
        saturday: "Saturday: 9:00 AM - 1:00 PM",
        sunday: "Sunday: Closed"
      },
      social: {
        title: "Follow Us",
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp"
      }
    },
    home: {
      welcome: {
        title: "Welcome to Conviconsu",
        subtitle: "Manage your services and connect with people easily.",
        description: "Join us today and experience the best platform for managing your services.",
        requestButton: "Request Access",
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
            "Personalized advisory",
            "Viability analysis",
            "Complete documentation",
            "Post-consultation follow-up"
          ]
        },
        procedures: {
          title: "Procedures Management",
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
            "Bank negotiations"
          ]
        }
      },
      incorporation: {
        title: "Incorporation Process",
        subtitle: "To join our team, follow these steps:",
        steps: [
          {
  title: "Initial Request",
  description: "The member submits their payment request to the administrator through the system. They must attach the payment receipt corresponding to the cooperative's monthly fee. This request is registered as 'pending' until it is reviewed by an administrator."
},
{
  title: "Document Evaluation",
  description: "The administrator reviews the payment receipt submitted by the member. They verify that the amount is correct, that the date corresponds to the current period, and that all receipt information is clear and complete. If any issues are found, they can reject the request with observations."
},
{
  title: "Payment Verification",
  description: "Once the administrator confirms that the receipt is valid and corresponds to the fee payment, they proceed to approve the request. The system automatically records the approval date and the administrator who performed the verification."
},
{
  title: "Final Approval",
  description: "Upon approval, the payment is registered in the member's history and their account status is updated as 'up to date'. The member receives confirmation that their payment has been successfully processed and can check their payment history at any time from their user panel."
}
        ]
      },
      faq: {
        title: "Frequently Asked Questions",
        questions: [
          {
            question: "How can I request a service?",
            answer: "You can request our services through the \"Request Access\" button or by contacting us directly by phone. Our team will guide you through the process."
          },
          {
            question: "What payment methods are accepted?",
            answer: "We accept bank transfers, cash payments, credit and debit cards. We also offer flexible payment plans according to your needs."
          },
          {
            question: "Do you offer support after consulting?",
            answer: "Yes, we provide continuous support for 6 months after completing the consultation. This includes phone consultations and progress tracking."
          },
          {
            question: "Can I cancel my request?",
            answer: "You can cancel your request at any time before signing the contract. If we have already started work, the conditions established in the contract will apply."
          }
        ]
      },
      cta: {
        title: "Start your path to home ownership!",
        description: "Contact us for more information about our consulting services.",
        button: "Request Access"
      }
    },
    login: {
      title: "Housing Cooperative",
      subtitle: "Administrative System",
      email: "Email",
      emailPlaceholder: "Enter your email",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      submit: "Sign In",
      noAccount: "Don't have an account?",
      register: "Register here"
    },
    register: {
      title: "Registration Request",
      subtitle: "Complete the form to submit your registration request.",
      fullName: "Full name",
      id: "ID Card",
      phone: "Phone",
      birthDate: "Birth date",
      email: "Email",
      address: "Address",
      password: "Password",
      submit: "Submit Request",
      hasAccount: "Already have an account?",
      login: "Log in here"
    },
    panel: {
      title: "User Panel",
      welcome: "Welcome,",
      info: "Here you can manage your account and your services.",
      actions: {
        view_services: "View My Services",
        edit_profile: "Edit Profile",
        logout: "Log Out"
      }
    },
    messages: {
      success_login: "You have successfully logged in.",
      success_register: "Your account has been created successfully.",
      error_login: "Incorrect email or password.",
      logout_confirm: "Are you sure you want to log out?"
    }
  }
};
