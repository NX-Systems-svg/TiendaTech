export const navLinks = [
  { href: "#servicios", label: "Servicios" },
  { href: "#productos", label: "Productos" },
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

export const services = [
  {
    slug: "mantenimiento-preventivo",
    title: "Mantenimiento",
    highlight: "Preventivo",
    description:
      "Limpieza interna y externa, revisión de componentes y optimización.",
    icon: "sparkles",
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
  },
  {
    slug: "paqueteria-de-office",
    title: "Paquetería",
    highlight: "de Office",
    description:
      "Instalación de Microsoft Office (Word, Excel, PowerPoint, Outlook y más).",
    icon: "briefcase",
  },
  {
    slug: "revision-y-diagnostico",
    title: "Revisión y",
    highlight: "Diagnóstico",
    description: "Detectamos y solucionamos fallas de hardware y software.",
    icon: "search",
  },
] as const;

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
