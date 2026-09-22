import { Product } from "@/lib/types";

export const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-wool-overcoat",
    name: "Architectural Wool Overcoat",
    slug: "architectural-wool-overcoat",
    tagline: "Double-breasted heavyweight Melton wool with sculptural lapels.",
    description:
      "Crafted from premium 850gsm virgin wool sourced from Biella, Italy. Features a dropped shoulder silhouette, deep welt pockets, and horn button closures. Designed to layer effortlessly over tailored suits or heavy knitwear.",
    category: "outerwear",
    brand: "ATELIER KALLEN",
    price: 890,
    currency: "USD",
    material: "100% Virgin Melton Wool, Bemberg Cupro lining",
    fit: "Relaxed tailored cut; falls mid-calf. Fits true to size for an intentional oversized drape.",
    care: "Specialist dry clean only. Steam gently. Store on broad wooden hanger.",
    status: "active",
    primaryImage:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000&auto=format&fit=crop",
    tryOnReferenceImage:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000&auto=format&fit=crop",
    modelImage:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop",
    gallery: [
      {
        id: "img-1-1",
        productId: "prod-wool-overcoat",
        imageUrl:
          "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000&auto=format&fit=crop",
        type: "product",
        sortOrder: 1,
      },
      {
        id: "img-1-2",
        productId: "prod-wool-overcoat",
        imageUrl:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop",
        type: "model",
        sortOrder: 2,
      },
    ],
    variants: [
      {
        id: "var-1-1",
        productId: "prod-wool-overcoat",
        color: "Camel",
        colorHex: "#b58750",
        size: "M",
        stock: 8,
        sku: "AK-WO-CML-M",
      },
      {
        id: "var-1-2",
        productId: "prod-wool-overcoat",
        color: "Camel",
        colorHex: "#b58750",
        size: "L",
        stock: 5,
        sku: "AK-WO-CML-L",
      },
      {
        id: "var-1-3",
        productId: "prod-wool-overcoat",
        color: "Obsidian",
        colorHex: "#1c1c1b",
        size: "M",
        stock: 12,
        sku: "AK-WO-OBS-M",
      },
    ],
    availableColors: [
      { name: "Camel", hex: "#b58750" },
      { name: "Obsidian", hex: "#1c1c1b" },
      { name: "Oatmeal", hex: "#dfd9ce" },
    ],
    availableSizes: ["XS", "S", "M", "L", "XL"],
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "prod-structured-blazer",
    name: "Couture Structured Blazer",
    slug: "couture-structured-blazer",
    tagline: "Sharp peak lapels with subtle shoulder pads and hourglass waist tailoring.",
    description:
      "A modern reinterpretation of traditional Savile Row tailoring. Made with high-twist tropical wool that resists creasing. Internal canvas construction creates clean geometric lines while conforming naturally to the wearer.",
    category: "tailoring",
    brand: "MAISON VÉLOUR",
    price: 640,
    currency: "USD",
    material: "100% High-Twist Worsted Wool, Silk lining",
    fit: "Structured, nipped waist silhouette. If between sizes, size up.",
    care: "Dry clean only. Press inside out with low temperature cloth.",
    status: "active",
    primaryImage:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
    tryOnReferenceImage:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
    gallery: [
      {
        id: "img-2-1",
        productId: "prod-structured-blazer",
        imageUrl:
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
        type: "product",
        sortOrder: 1,
      },
    ],
    variants: [
      {
        id: "var-2-1",
        productId: "prod-structured-blazer",
        color: "Deep Charcoal",
        colorHex: "#222326",
        size: "S",
        stock: 6,
        sku: "MV-SB-CHR-S",
      },
      {
        id: "var-2-2",
        productId: "prod-structured-blazer",
        color: "Deep Charcoal",
        colorHex: "#222326",
        size: "M",
        stock: 14,
        sku: "MV-SB-CHR-M",
      },
    ],
    availableColors: [
      { name: "Deep Charcoal", hex: "#222326" },
      { name: "Chalk White", hex: "#f0efe9" },
    ],
    availableSizes: ["XS", "S", "M", "L"],
    createdAt: "2026-02-01T12:00:00Z",
  },
  {
    id: "prod-silk-drape-shirt",
    name: "Mulberry Silk Fluid Shirt",
    slug: "mulberry-silk-fluid-shirt",
    tagline: "Weighty 22-momme crepe de chine with mother-of-pearl buttons.",
    description:
      "Fluid, liquid drape cut from grade-6A mulberry silk. Features extended button cuffs, French seams, and a relaxed camp collar. Breathes effortlessly in warmth while insulating during cool evenings.",
    category: "tops",
    brand: "STUDIO NORD",
    price: 340,
    currency: "USD",
    material: "100% Grade 6A Mulberry Silk Crepe de Chine",
    fit: "Fluid oversized silhouette. Drape falls gracefully at hip level.",
    care: "Gentle cold hand wash with silk detergent or eco dry clean.",
    status: "active",
    primaryImage:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop",
    tryOnReferenceImage:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop",
    gallery: [
      {
        id: "img-3-1",
        productId: "prod-silk-drape-shirt",
        imageUrl:
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop",
        type: "product",
        sortOrder: 1,
      },
    ],
    variants: [
      {
        id: "var-3-1",
        productId: "prod-silk-drape-shirt",
        color: "Raw Ecru",
        colorHex: "#e8e5db",
        size: "M",
        stock: 10,
        sku: "SN-FS-ECR-M",
      },
    ],
    availableColors: [
      { name: "Raw Ecru", hex: "#e8e5db" },
      { name: "Midnight Navy", hex: "#161b26" },
      { name: "Burnt Ochre", hex: "#9b5133" },
    ],
    availableSizes: ["XS", "S", "M", "L", "XL"],
    createdAt: "2026-02-15T09:00:00Z",
  },
  {
    id: "prod-pleated-midi-dress",
    name: "Architectural Pleated Column Dress",
    slug: "architectural-pleated-column-dress",
    tagline: "Fine micro-pleats that move rhythmically with every step.",
    description:
      "Engineered heat-set pleats create permanent architectural volume. Features a jewel neckline, hidden side zipper, and a side-slit for ease of movement. Pairs seamlessly with tailored boots or sculptural mules.",
    category: "dresses",
    brand: "CÉLESTE COUTURE",
    price: 780,
    currency: "USD",
    material: "100% Japanese High-Memory Pleated Tech Fiber",
    fit: "Column cut with flexible pleated stretch. Fits standard bust and waist gracefully.",
    care: "Gentle machine wash inside mesh bag on cold. Lay flat to dry; do not iron pleats.",
    status: "active",
    primaryImage:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop",
    tryOnReferenceImage:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop",
    gallery: [
      {
        id: "img-4-1",
        productId: "prod-pleated-midi-dress",
        imageUrl:
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000&auto=format&fit=crop",
        type: "product",
        sortOrder: 1,
      },
    ],
    variants: [
      {
        id: "var-4-1",
        productId: "prod-pleated-midi-dress",
        color: "Emerald Moss",
        colorHex: "#2b4034",
        size: "M",
        stock: 5,
        sku: "CC-PD-MOS-M",
      },
    ],
    availableColors: [
      { name: "Emerald Moss", hex: "#2b4034" },
      { name: "Rust Terracotta", hex: "#9d4b30" },
      { name: "Noir", hex: "#141413" },
    ],
    availableSizes: ["XS", "S", "M", "L"],
    createdAt: "2026-03-01T15:00:00Z",
  },
  {
    id: "prod-merino-knit-sweater",
    name: "Heavy Gauge Wool-Knit Sweater",
    slug: "heavy-gauge-wool-knit-sweater",
    tagline: "3-ply spun Extrafine Merino with artisanal fisherman ribbing.",
    description:
      "Spun from Australian extrafine merino wool treated with natural lanolin for water repellence and cloud-soft hand feel. Seamless fully fashioned shoulder construction provides effortless mobility.",
    category: "knitwear",
    brand: "STUDIO NORD",
    price: 420,
    currency: "USD",
    material: "100% Extrafine Australian Merino Wool",
    fit: "Boxy, relaxed proportion with ribbed mock-neck collar.",
    care: "Hand wash cold with wool wash. Do not wring. Dry flat on towels.",
    status: "active",
    primaryImage:
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1000&auto=format&fit=crop",
    tryOnReferenceImage:
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1000&auto=format&fit=crop",
    gallery: [
      {
        id: "img-5-1",
        productId: "prod-merino-knit-sweater",
        imageUrl:
          "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1000&auto=format&fit=crop",
        type: "product",
        sortOrder: 1,
      },
    ],
    variants: [
      {
        id: "var-5-1",
        productId: "prod-merino-knit-sweater",
        color: "Stone Chalk",
        colorHex: "#e5e2d9",
        size: "M",
        stock: 9,
        sku: "SN-MK-STN-M",
      },
    ],
    availableColors: [
      { name: "Stone Chalk", hex: "#e5e2d9" },
      { name: "Walnut Brown", hex: "#523c2d" },
    ],
    availableSizes: ["S", "M", "L", "XL"],
    createdAt: "2026-03-05T11:00:00Z",
  },
  {
    id: "prod-cashmere-coat",
    name: "Belted Double-Face Cashmere Trench",
    slug: "belted-double-face-cashmere-trench",
    tagline: "Hand-finished unlined double-face cashmere with storm flap.",
    description:
      "The pinnacle of outerwear craftsmanship. Two layers of pure Mongolian cashmere split and hand-sewn together at every edge. Unlined for ultra-lightweight warmth that moves like second skin.",
    category: "outerwear",
    brand: "ATELIER KALLEN",
    price: 1250,
    currency: "USD",
    material: "100% Grade A Mongolian Cashmere",
    fit: "Generous drape cinched with a self-tie cashmere belt.",
    care: "Specialist dry clean only. Protect from moths with cedar.",
    status: "active",
    primaryImage:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop",
    tryOnReferenceImage:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop",
    gallery: [
      {
        id: "img-6-1",
        productId: "prod-cashmere-coat",
        imageUrl:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop",
        type: "product",
        sortOrder: 1,
      },
    ],
    variants: [
      {
        id: "var-6-1",
        productId: "prod-cashmere-coat",
        color: "Pebble Taupe",
        colorHex: "#a89f91",
        size: "M",
        stock: 3,
        sku: "AK-CT-PBL-M",
      },
    ],
    availableColors: [
      { name: "Pebble Taupe", hex: "#a89f91" },
      { name: "Noir", hex: "#141413" },
    ],
    availableSizes: ["XS", "S", "M", "L"],
    createdAt: "2026-03-10T14:00:00Z",
  },
];
