export const navLinks = [
  { href: "#servicios", label: "Servicios" },
  { href: "#productos", label: "Productos" },
  { href: "#guias", label: "Guías" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
];

export const benefits = [
  {
    title: "Más rendimiento",
    description: "Equipos más rápidos y estables.",
    icon: "shield-check",
  },
  {
    title: "Menos calor",
    description: "Evitamos sobrecalentamiento.",
    icon: "thermometer",
  },
  {
    title: "Mayor vida útil",
    description: "Prevenimos fallas y daños.",
    icon: "hard-drive",
  },
  {
    title: "Ahorra dinero",
    description: "Evita reparaciones costosas.",
    icon: "coins",
  },
] as const;

export type Service = {
  slug: string;
  title: string;
  highlight: string;
  description: string;
  icon: string;
  /**
   * Precio fijo de mano de obra en MXN. Un servicio SIN precio depende de las
   * refacciones que elija el cliente: no se puede cobrar por adelantado, así
   * que solo se ofrece por cotización y nunca llega al carrito.
   */
  price?: number;
};

export const services: Service[] = [
  {
    slug: "mantenimiento-preventivo",
    title: "Mantenimiento",
    highlight: "Preventivo",
    description:
      "Limpieza interna y externa, revisión de componentes y optimización.",
    icon: "sparkles",
    price: 350,
  },
  {
    slug: "cambio-de-ssd",
    title: "Cambio de",
    highlight: "SSD",
    description:
      "Mejora la velocidad y capacidad de tu equipo con un nuevo SSD.",
    icon: "chip",
  },
  {
    slug: "actualizacion-de-ram",
    title: "Actualización",
    highlight: "de RAM",
    description: "Más memoria, mejor desempeño. Haz que tu equipo rinda al máximo.",
    icon: "memory",
  },
  {
    slug: "instalacion-de-so",
    title: "Instalación",
    highlight: "de SO",
    description:
      "Instalamos Windows (10/11) y otros sistemas operativos de forma segura y eficiente.",
    icon: "monitor",
    price: 400,
  },
  {
    slug: "paqueteria-de-office",
    title: "Paquetería",
    highlight: "de Office",
    description:
      "Instalación de Microsoft Office (Word, Excel, PowerPoint, Outlook y más).",
    icon: "briefcase",
    price: 300,
  },
  {
    slug: "revision-y-diagnostico",
    title: "Revisión y",
    highlight: "Diagnóstico",
    description: "Detectamos y solucionamos fallas de hardware y software.",
    icon: "search",
    price: 150,
  },
];

export const trustBadges = [
  {
    title: "Atención",
    highlight: "Personalizada",
    description: "Te asesoramos según las necesidades de tu equipo.",
    icon: "headset",
  },
  {
    title: "Servicio Rápido",
    highlight: "y Confiable",
    description: "Entregas en tiempo récord con garantía.",
    icon: "timer",
  },
  {
    title: "Garantía en",
    highlight: "Cada Servicio",
    description: "Tu satisfacción y la de tu equipo es nuestra prioridad.",
    icon: "shield",
  },
  {
    title: "Soporte",
    highlight: "Posterior",
    description: "Te damos soporte aún después del servicio.",
    icon: "lifebuoy",
  },
] as const;

export type Product = {
  slug: string;
  name: string;
  category: string;
  priceFrom: number;
  image: string;
};

export const products: Product[] = [
  {
    slug: "laptop-oficina-i5",
    name: "Laptop oficina Core i5",
    category: "Laptops",
    priceFrom: 9999,
    image: "https://placehold.co/600x450/0d1220/8a93b3/png?text=Laptop+i5",
  },
  {
    slug: "pc-escritorio-ryzen-5",
    name: "PC de escritorio Ryzen 5",
    category: "Escritorio",
    priceFrom: 12999,
    image: "https://placehold.co/600x450/0d1220/8a93b3/png?text=PC+Ryzen+5",
  },
  {
    slug: "ssd-nvme-1tb",
    name: "SSD NVMe 1TB",
    category: "Almacenamiento",
    priceFrom: 1299,
    image: "https://placehold.co/600x450/0d1220/8a93b3/png?text=SSD+NVMe+1TB",
  },
  {
    slug: "memoria-ram-16gb",
    name: "Memoria RAM 16GB DDR4",
    category: "Memoria",
    priceFrom: 899,
    image: "https://placehold.co/600x450/0d1220/8a93b3/png?text=RAM+16GB",
  },
  {
    slug: "monitor-24-fhd",
    name: 'Monitor 24" Full HD',
    category: "Periféricos",
    priceFrom: 2499,
    image: "https://placehold.co/600x450/0d1220/8a93b3/png?text=Monitor+24%22",
  },
  {
    slug: "licencia-windows-11",
    name: "Licencia Windows 11 Pro",
    category: "Software",
    priceFrom: 1899,
    image: "https://placehold.co/600x450/0d1220/8a93b3/png?text=Windows+11+Pro",
  },
];

/**
 * Elemento normalizado del carrito: unifica productos y servicios para que el
 * carrito, el resumen y el checkout no tengan que saber de cuál lista viene.
 */
export type CatalogItem = {
  slug: string;
  name: string;
  price: number;
  category: string;
  kind: "producto" | "servicio";
  /** Solo los productos tienen foto; los servicios se muestran con su ícono. */
  image?: string;
  icon?: string;
};

/**
 * Busca un slug en el catálogo. Es la única fuente de precios: tanto el
 * cliente como el servidor resuelven aquí, nunca confiando en un precio
 * enviado en la petición.
 *
 * Devuelve null para servicios sin precio fijo (solo cotización), de modo que
 * nunca puedan cobrarse aunque alguien los meta a mano en la petición.
 */
export function findCatalogItem(slug: string): CatalogItem | null {
  const product = products.find((p) => p.slug === slug);
  if (product) {
    return {
      slug: product.slug,
      name: product.name,
      price: product.priceFrom,
      category: product.category,
      kind: "producto",
      image: product.image,
    };
  }

  const service = services.find((s) => s.slug === slug);
  if (service && typeof service.price === "number") {
    return {
      slug: service.slug,
      name: `${service.title} ${service.highlight}`,
      price: service.price,
      category: "Servicio",
      kind: "servicio",
      icon: service.icon,
    };
  }

  return null;
}

export const guides = [
  {
    slug: "ssd-vs-hdd",
    title: "SSD vs HDD:",
    highlight: "¿cuál necesita tu equipo?",
    description:
      "Un SSD arranca y abre programas hasta 10 veces más rápido que un disco duro tradicional. Te explicamos cuándo vale la pena el cambio.",
    icon: "chip",
  },
  {
    slug: "cuanta-ram-necesito",
    title: "¿Cuánta RAM",
    highlight: "es suficiente?",
    description:
      "8GB, 16GB, 32GB... la cantidad correcta depende de lo que haces con tu equipo. Te ayudamos a elegir sin gastar de más.",
    icon: "memory",
  },
  {
    slug: "senales-mantenimiento",
    title: "Señales de que tu PC",
    highlight: "necesita mantenimiento",
    description:
      "Ruidos extraños, sobrecalentamiento, lentitud repentina. Aprende a detectar los focos rojos antes de que se conviertan en una falla grave.",
    icon: "thermometer",
  },
  {
    slug: "windows-10-vs-11",
    title: "Windows 10 vs 11:",
    highlight: "¿cuándo actualizar?",
    description:
      "El soporte de Windows 10 tiene fecha límite. Te contamos qué considerar antes de dar el salto a Windows 11.",
    icon: "monitor",
  },
  {
    slug: "vida-util-laptop",
    title: "Cómo alargar la",
    highlight: "vida útil de tu laptop",
    description:
      "Limpieza, ventilación y buenos hábitos de carga pueden sumarle años a tu equipo. Consejos simples que sí funcionan.",
    icon: "shield-check",
  },
  {
    slug: "hardware-o-software",
    title: "¿Falla de hardware",
    highlight: "o de software?",
    description:
      "No toda falla requiere cambiar piezas. Te enseñamos a distinguir entre un problema de software y uno físico antes de gastar de más.",
    icon: "search",
  },
] as const;
